import { describe, expect, it, vi } from 'vitest'
import { strToU8, zipSync } from 'fflate'
import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  ContentPackageSourceError,
  createDiscoveryFileSystemFromContentPackageSource,
  readContentPackageSourceJson
} from '@/domain/mods/contentPackageSource'
import { discoverThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackDiscovery'
import {
  createWebFilePickerImportSource,
  readWebFilePickerImportArchiveFiles,
  type WebFilePickerImportFile
} from '@/domain/mods/webFilePickerImportSource'

type JsonObject = Record<string, unknown>

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = (packageId = 'web_valid'): JsonObject => ({
  id: packageId,
  name: { key: `${packageId}.package.name`, fallback: packageId },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Web Source Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = (id = 'web_valid:linen_ribbon'): JsonObject => ({
  id,
  name: { key: `${id}.name`, fallback: id },
  category: 'gift',
  description: { key: `${id}.description`, fallback: `${id} description` },
  sellPrice: 8,
  edible: false
})

const createFile = (
  path: string,
  text: string,
  overrides: Partial<WebFilePickerImportFile> = {}
): WebFilePickerImportFile => ({
  name: path.split('/').pop() ?? path,
  webkitRelativePath: path,
  size: text.length,
  text: vi.fn(async() => text),
  ...overrides
})

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

const createArchiveFile = (
  name: string,
  files: Readonly<Record<string, string>>,
  overrides: Partial<WebFilePickerImportFile> = {}
): WebFilePickerImportFile => {
  const archiveBytes = zipSync(Object.fromEntries(
    Object.entries(files).map(([path, text]) => [path, strToU8(text)])
  ))
  return {
    name,
    size: archiveBytes.byteLength,
    text: vi.fn(async() => {
      throw new Error('ZIP import should not read the archive as text')
    }),
    arrayBuffer: vi.fn(async() => toArrayBuffer(archiveBytes)),
    ...overrides
  }
}

const captureSourceError = (fn: () => unknown): ContentPackageSourceError => {
  try {
    fn()
  } catch (error) {
    expect(error).toBeInstanceOf(ContentPackageSourceError)
    return error as ContentPackageSourceError
  }
  throw new Error('Expected ContentPackageSourceError')
}

describe('web file-picker import source', () => {
  it('publishes selected browser files as a read-only ContentPackageSource', async() => {
    const source = createWebFilePickerImportSource({
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
      kind: 'web-file-picker-import',
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import'
    })
    expect(Object.isFrozen(source.identity)).toBe(true)
    expect(manifestJson).toMatchObject({
      ok: true,
      data: { id: 'web_valid' }
    })
    expect(rootEntries).toEqual([
      { name: 'valid-gift-pack', kind: 'directory', isSymbolicLink: false }
    ])
    expect(discoveryReport.status).toBe('completed')
    expect(discoveryReport.candidates[0]?.path).toBe('valid-gift-pack')
  })

  it('expands a selected ZIP archive into the Web ContentPackageSource contract', async() => {
    const archive = createArchiveFile('valid-gift-pack.zip', {
      'valid-gift-pack/manifest.json': toJson(createManifest('zip_valid')),
      'valid-gift-pack/locales/zh-CN.json': '{}\n',
      'valid-gift-pack/data/items.json': toJson([createItem('zip_valid:linen_ribbon')])
    })

    const archiveFiles = await readWebFilePickerImportArchiveFiles({ file: archive })
    const source = createWebFilePickerImportSource({ files: archiveFiles })
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)
    const discoveryReport = await discoverThirdPartyDataPacks(source.identity.rootPath, fileSystem)

    expect(archiveFiles.map(file => file.webkitRelativePath)).toEqual([
      'valid-gift-pack/data/items.json',
      'valid-gift-pack/locales/zh-CN.json',
      'valid-gift-pack/manifest.json'
    ])
    expect(archive.text).not.toHaveBeenCalled()
    expect(archive.arrayBuffer).toHaveBeenCalledOnce()
    expect(source.identity.kind).toBe('web-file-picker-import')
    await expect(readContentPackageSourceJson(source, 'valid-gift-pack/manifest.json'))
      .resolves.toMatchObject({ ok: true, data: { id: 'zip_valid' } })
    expect(discoveryReport.status).toBe('completed')
    expect(discoveryReport.candidates[0]?.path).toBe('valid-gift-pack')
  })

  it('rejects unsafe ZIP archive entry paths before publishing selected files', async() => {
    const archive = createArchiveFile('private.zip', {
      '../userdata/manifest.json': toJson(createManifest('unsafe_zip')),
      'valid-gift-pack/manifest.json': toJson(createManifest('zip_valid'))
    })

    try {
      await readWebFilePickerImportArchiveFiles({ file: archive })
      throw new Error('Expected ContentPackageSourceError')
    } catch (error) {
      expect(error).toMatchObject({
        code: 'SOURCE_PATH_UNSAFE'
      })
      expect(JSON.stringify(error)).not.toContain('userdata')
    }
    expect(archive.text).not.toHaveBeenCalled()
  })

  it('uses webkitRelativePath instead of the browser file name when present', async() => {
    const source = createWebFilePickerImportSource({
      sourceId: 'web/test-relative-paths',
      rootPath: 'picked-files',
      files: [
        createFile('valid-gift-pack/manifest.json', toJson(createManifest('relative_valid')), {
          name: 'manifest.json'
        })
      ]
    })

    await expect(source.getEntry('valid-gift-pack/manifest.json')).resolves.toEqual({
      name: 'manifest.json',
      kind: 'file',
      isSymbolicLink: false
    })
    expect(source.identity).toMatchObject({
      kind: 'web-file-picker-import',
      sourceId: 'web/test-relative-paths',
      rootPath: 'picked-files'
    })
  })

  it('rejects unsafe selected paths before reading file contents', () => {
    const text = vi.fn(async() => '{"id":"unsafe"}\n')
    const error = captureSourceError(() => createWebFilePickerImportSource({
      files: [
        {
          name: 'settings.json',
          webkitRelativePath: '..\\userdata\\settings.json',
          size: 16,
          text
        }
      ]
    }))

    expect(error).toMatchObject({
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Content package source path is unsafe'
    })
    expect(text).not.toHaveBeenCalled()
    expect(JSON.stringify(error)).not.toContain('userdata')
  })

  it('preflights declared file size before calling the browser text reader', async() => {
    const text = vi.fn(async() => 'too large')
    const source = createWebFilePickerImportSource({
      files: [
        createFile('valid-gift-pack/manifest.json', '{}\n', {
          size: CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxSingleFileBytes + 1,
          text
        })
      ]
    })

    await expect(source.readTextFile('valid-gift-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Source text file exceeds ${CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxSingleFileBytes} bytes: ${CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxSingleFileBytes + 1}`,
      sourcePath: 'valid-gift-pack/manifest.json'
    })
    expect(text).not.toHaveBeenCalled()
  })

  it('redacts browser text reader failures and releases file handles on dispose', async() => {
    const text = vi.fn(async() => {
      throw new Error('NotAllowedError: C:/Users/LENOVO/Downloads/private-pack/manifest.json\nhostile-fragment')
    })
    const source = createWebFilePickerImportSource({
      files: [
        createFile('private-pack/manifest.json', '{}\n', { text })
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
    expect(text).toHaveBeenCalledTimes(1)
  })
})
