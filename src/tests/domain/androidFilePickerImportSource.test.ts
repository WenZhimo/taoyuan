import { describe, expect, it, vi } from 'vitest'
import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  ContentPackageSourceError,
  createDiscoveryFileSystemFromContentPackageSource,
  readContentPackageSourceJson
} from '@/domain/mods/contentPackageSource'
import { discoverThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackDiscovery'
import {
  createAndroidFilePickerImportSource,
  type AndroidFilePickerImportedFile
} from '@/domain/mods/androidFilePickerImportSource'

type JsonObject = Record<string, unknown>

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = (packageId = 'android_valid'): JsonObject => ({
  id: packageId,
  name: { key: `${packageId}.package.name`, fallback: packageId },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Android Source Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = (id = 'android_valid:paper_charm'): JsonObject => ({
  id,
  name: { key: `${id}.name`, fallback: id },
  category: 'gift',
  description: { key: `${id}.description`, fallback: `${id} description` },
  sellPrice: 8,
  edible: false
})

const createFile = (
  relativePath: string,
  text: string,
  overrides: Partial<AndroidFilePickerImportedFile> = {}
): AndroidFilePickerImportedFile => ({
  relativePath,
  sizeBytes: text.length,
  readText: vi.fn(async() => text),
  ...overrides
})

const captureSourceError = (fn: () => unknown): ContentPackageSourceError => {
  try {
    fn()
  } catch (error) {
    expect(error).toBeInstanceOf(ContentPackageSourceError)
    return error as ContentPackageSourceError
  }
  throw new Error('Expected ContentPackageSourceError')
}

describe('android file-picker import source', () => {
  it('publishes app-data imported files as a read-only ContentPackageSource', async() => {
    const source = createAndroidFilePickerImportSource({
      files: [
        createFile('valid-gift-pack/manifest.json', toJson(createManifest())),
        createFile('valid-gift-pack/locales/zh-CN.json', '{}\n'),
        createFile('valid-gift-pack/data/items.json', toJson([createItem()]))
      ]
    })
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    const manifestJson = await readContentPackageSourceJson(source, 'valid-gift-pack/manifest.json')
    const rootEntries = await fileSystem.readDirectory(source.identity.rootPath)
    const discoveryReport = await discoverThirdPartyDataPacks(source.identity.rootPath, fileSystem)

    expect(source.identity).toEqual({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'android-file-picker-import',
      sourceId: 'android/file-picker-import',
      rootPath: 'android-import'
    })
    expect(Object.isFrozen(source.identity)).toBe(true)
    expect(manifestJson).toMatchObject({
      ok: true,
      data: { id: 'android_valid' }
    })
    expect(rootEntries).toEqual([
      { name: 'valid-gift-pack', kind: 'directory', isSymbolicLink: false }
    ])
    expect(discoveryReport.status).toBe('completed')
    expect(discoveryReport.candidates[0]?.path).toBe('valid-gift-pack')
  })

  it('uses caller-provided source identity without exposing Android storage paths', async() => {
    const source = createAndroidFilePickerImportSource({
      sourceId: 'android/test-app-data-copy',
      rootPath: 'picked-app-data',
      files: [
        createFile('valid-gift-pack/manifest.json', toJson(createManifest('android_relative_valid')))
      ]
    })

    await expect(source.getEntry('valid-gift-pack/manifest.json')).resolves.toEqual({
      name: 'manifest.json',
      kind: 'file',
      isSymbolicLink: false
    })
    expect(source.identity).toMatchObject({
      kind: 'android-file-picker-import',
      sourceId: 'android/test-app-data-copy',
      rootPath: 'picked-app-data'
    })
    expect(JSON.stringify(source.identity)).not.toContain('/storage/emulated')
  })

  it('rejects unsafe picker paths before reading file contents', () => {
    const readText = vi.fn(async() => '{"id":"unsafe"}\n')
    const error = captureSourceError(() => createAndroidFilePickerImportSource({
      files: [
        {
          relativePath: 'content://com.android.providers.downloads.documents/document/private-pack/manifest.json',
          sizeBytes: 16,
          readText
        }
      ]
    }))

    expect(error).toMatchObject({
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Content package source path is unsafe'
    })
    expect(readText).not.toHaveBeenCalled()
    expect(JSON.stringify(error)).not.toContain('content://')
  })

  it('preflights declared copied size before calling the Android text reader', async() => {
    const readText = vi.fn(async() => 'too large')
    const source = createAndroidFilePickerImportSource({
      files: [
        createFile('valid-gift-pack/manifest.json', '{}\n', {
          sizeBytes: CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxSingleFileBytes + 1,
          readText
        })
      ]
    })

    await expect(source.readTextFile('valid-gift-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Source text file exceeds ${CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxSingleFileBytes} bytes: ${CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxSingleFileBytes + 1}`,
      sourcePath: 'valid-gift-pack/manifest.json'
    })
    expect(readText).not.toHaveBeenCalled()
  })

  it('redacts Android reader failures and releases imported file references on dispose', async() => {
    const readText = vi.fn(async() => {
      throw new Error('SecurityException: content://downloads/private-pack/manifest.json /storage/emulated/0/Download/private-pack\nhostile-fragment')
    })
    const source = createAndroidFilePickerImportSource({
      files: [
        createFile('private-pack/manifest.json', '{}\n', { readText })
      ]
    })

    await expect(source.readTextFile('private-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: 'Content package source read operation failed',
      sourcePath: 'private-pack/manifest.json'
    })

    await source.dispose()
    await expect(source.getEntry('private-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_DISPOSED'
    })
    await expect(source.readDirectory('private-pack')).rejects.toMatchObject({
      code: 'SOURCE_DISPOSED'
    })
    await expect(source.readTextFile('private-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_DISPOSED'
    })
    expect(readText).toHaveBeenCalledTimes(1)
  })
})
