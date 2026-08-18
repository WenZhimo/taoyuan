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
  ANDROID_APP_DATA_IMPORT_SOURCE_ID,
  createAndroidAppDataImportSource,
  type AndroidAppDataImportBridgeHost
} from '@/domain/mods/androidAppDataImportBridge'

type JsonObject = Record<string, unknown>

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = (packageId = 'android_app_data_valid'): JsonObject => ({
  id: packageId,
  name: { key: `${packageId}.package.name`, fallback: packageId },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Android App Data Source Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = (id = 'android_app_data_valid:paper_charm'): JsonObject => ({
  id,
  name: { key: `${id}.name`, fallback: id },
  category: 'gift',
  description: { key: `${id}.description`, fallback: `${id} description` },
  sellPrice: 8,
  edible: false
})

const createHost = (
  files: Record<string, string>
): AndroidAppDataImportBridgeHost & {
  listImportedFiles: ReturnType<typeof vi.fn>
  readImportedText: ReturnType<typeof vi.fn>
} => ({
  listImportedFiles: vi.fn(async() => Object.entries(files).map(([relativePath, text]) => ({
    relativePath,
    sizeBytes: text.length
  }))),
  readImportedText: vi.fn(async(_importId: string, relativePath: string) => files[relativePath] ?? '')
})

const captureSourceError = async(fn: () => Promise<unknown>): Promise<ContentPackageSourceError> => {
  try {
    await fn()
  } catch (error) {
    expect(error).toBeInstanceOf(ContentPackageSourceError)
    return error as ContentPackageSourceError
  }
  throw new Error('Expected ContentPackageSourceError')
}

describe('android app-data import bridge', () => {
  it('creates a read-only Android source from copied app-data host files', async() => {
    const host = createHost({
      'valid-gift-pack/manifest.json': toJson(createManifest()),
      'valid-gift-pack/locales/zh-CN.json': '{}\n',
      'valid-gift-pack/data/items.json': toJson([createItem()])
    })
    const source = await createAndroidAppDataImportSource({
      host,
      importId: 'valid-gift-pack'
    })
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    const manifestJson = await readContentPackageSourceJson(source, 'valid-gift-pack/manifest.json')
    const rootEntries = await fileSystem.readDirectory(source.identity.rootPath)
    const discoveryReport = await discoverThirdPartyDataPacks(source.identity.rootPath, fileSystem)

    expect(source.identity).toEqual({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'android-file-picker-import',
      sourceId: ANDROID_APP_DATA_IMPORT_SOURCE_ID,
      rootPath: 'android-import'
    })
    expect(Object.isFrozen(source.identity)).toBe(true)
    expect(manifestJson).toMatchObject({
      ok: true,
      data: { id: 'android_app_data_valid' }
    })
    expect(rootEntries).toEqual([
      { name: 'valid-gift-pack', kind: 'directory', isSymbolicLink: false }
    ])
    expect(discoveryReport.status).toBe('completed')
    expect(discoveryReport.candidates[0]?.path).toBe('valid-gift-pack')
    expect(host.listImportedFiles).toHaveBeenCalledWith('valid-gift-pack')
    expect(host.readImportedText).toHaveBeenCalledWith('valid-gift-pack', 'valid-gift-pack/manifest.json')
    expect(JSON.stringify(source.identity)).not.toContain('/data/user')
  })

  it('redacts app-data host list and read failures', async() => {
    const listFailureHost: AndroidAppDataImportBridgeHost = {
      async listImportedFiles() {
        throw new Error('SecurityException: /data/user/0/com.games.wenzi.taoyuan/files/mod-imports/private')
      },
      async readImportedText() {
        return '{}\n'
      }
    }

    const listError = await captureSourceError(() => createAndroidAppDataImportSource({
      host: listFailureHost,
      importId: 'private-import'
    }))
    expect(listError).toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: 'Content package source inspect operation failed',
      sourcePath: 'private-import'
    })
    expect(JSON.stringify(listError)).not.toContain('/data/user')

    const readFailureHost: AndroidAppDataImportBridgeHost = {
      async listImportedFiles() {
        return [{ relativePath: 'private-pack/manifest.json', sizeBytes: 3 }]
      },
      async readImportedText() {
        throw new Error('SecurityException: content://downloads/private-pack /storage/emulated/0/Download/private-pack')
      }
    }
    const source = await createAndroidAppDataImportSource({
      host: readFailureHost,
      importId: 'private-import'
    })

    await expect(source.readTextFile('private-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: 'Content package source read operation failed',
      sourcePath: 'private-pack/manifest.json'
    })
    await expect(source.readTextFile('private-pack/manifest.json')).rejects.not.toThrow(/content:\/\/|storage\/emulated/)
  })

  it('rejects unsafe copied app-data paths before native text reads', async() => {
    const readImportedText = vi.fn(async() => '{}\n')
    const host: AndroidAppDataImportBridgeHost = {
      async listImportedFiles() {
        return [{
          relativePath: '/data/user/0/com.games.wenzi.taoyuan/files/mod-imports/private-pack/manifest.json',
          sizeBytes: 3
        }]
      },
      readImportedText
    }

    const error = await captureSourceError(() => createAndroidAppDataImportSource({
      host,
      importId: 'private-import'
    }))

    expect(error).toMatchObject({
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Content package source path is unsafe'
    })
    expect(readImportedText).not.toHaveBeenCalled()
    expect(JSON.stringify(error)).not.toContain('/data/user')
  })

  it('preflights copied file sizes before calling the native reader', async() => {
    const readImportedText = vi.fn(async() => 'too large')
    const source = await createAndroidAppDataImportSource({
      host: {
        async listImportedFiles() {
          return [{
            relativePath: 'valid-gift-pack/manifest.json',
            sizeBytes: CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxSingleFileBytes + 1
          }]
        },
        readImportedText
      },
      importId: 'valid-gift-pack'
    })

    await expect(source.readTextFile('valid-gift-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Source text file exceeds ${CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxSingleFileBytes} bytes: ${CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxSingleFileBytes + 1}`,
      sourcePath: 'valid-gift-pack/manifest.json'
    })
    expect(readImportedText).not.toHaveBeenCalled()
  })

  it('rejects accessor-backed host descriptors before getter execution', async() => {
    let relativePathRead = false
    const descriptor = {}
    Object.defineProperty(descriptor, 'relativePath', {
      enumerable: true,
      get() {
        relativePathRead = true
        throw new Error('/data/user/0/com.games.wenzi.taoyuan/files/mod-imports/accessor')
      }
    })
    const host: AndroidAppDataImportBridgeHost = {
      async listImportedFiles() {
        return [descriptor as never]
      },
      async readImportedText() {
        return '{}\n'
      }
    }

    const error = await captureSourceError(() => createAndroidAppDataImportSource({
      host,
      importId: 'accessor-import'
    }))

    expect(relativePathRead).toBe(false)
    expect(error).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Android app-data import file metadata contains unsupported fields',
      sourcePath: 'accessor-import'
    })
    expect(JSON.stringify(error)).not.toContain('/data/user')
  })

  it('rejects accessor-backed host methods before getter execution', async() => {
    let listImportedFilesRead = false
    const host = {}
    Object.defineProperty(host, 'listImportedFiles', {
      enumerable: true,
      get() {
        listImportedFilesRead = true
        throw new Error('/data/user/0/com.games.wenzi.taoyuan/files/mod-imports/host')
      }
    })
    Object.defineProperty(host, 'readImportedText', {
      enumerable: true,
      value: async() => '{}\n'
    })

    const error = await captureSourceError(() => createAndroidAppDataImportSource({
      host: host as AndroidAppDataImportBridgeHost,
      importId: 'accessor-host'
    }))

    expect(listImportedFilesRead).toBe(false)
    expect(error).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Android app-data import host metadata contains unsupported fields'
    })
    expect(JSON.stringify(error)).not.toContain('/data/user')
  })
})
