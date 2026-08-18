import { describe, expect, it, vi } from 'vitest'
import {
  CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  createDiscoveryFileSystemFromContentPackageSource,
  readContentPackageSourceJson
} from '@/domain/mods/contentPackageSource'
import { discoverThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackDiscovery'
import { createWebFilePickerImportSource } from '@/domain/mods/webFilePickerImportSource'
import {
  createDefaultWebIndexedDbImportRecord,
  createInMemoryWebIndexedDbImportPersistenceStore,
  createWebFilePickerImportSourceFromIndexedDbRecord,
  createWebIndexedDbImportPersistenceStore,
  persistWebFilePickerImportSource,
  restoreWebIndexedDbImportSource,
  validateWebIndexedDbImportRecord,
  type WebIndexedDbImportRecord
} from '@/domain/mods/webIndexedDbImportPersistence'

type JsonObject = Record<string, unknown>

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = (packageId = 'web_persisted'): JsonObject => ({
  id: packageId,
  name: { key: `${packageId}.package.name`, fallback: packageId },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Web IndexedDB Source Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = (id = 'web_persisted:linen_ribbon'): JsonObject => ({
  id,
  name: { key: `${id}.name`, fallback: id },
  category: 'gift',
  description: { key: `${id}.description`, fallback: `${id} description` },
  sellPrice: 8,
  edible: false
})

const createFile = (path: string, text: string) => ({
  name: path.split('/').pop() ?? path,
  webkitRelativePath: path,
  size: text.length,
  text: vi.fn(async() => text)
})

const createSource = () => createWebFilePickerImportSource({
  files: [
    createFile('valid-gift-pack/manifest.json', toJson(createManifest())),
    createFile('valid-gift-pack/locales/zh-CN.json', '{}\n'),
    createFile('valid-gift-pack/data/items.json', toJson([createItem()]))
  ]
})

const requestSuccess = <T>(result: T): IDBRequest<T> => {
  const request = {
    result,
    error: null,
    onsuccess: null as (() => void) | null,
    onerror: null as (() => void) | null
  }
  queueMicrotask(() => request.onsuccess?.())
  return request as unknown as IDBRequest<T>
}

const completeTransactionAfterRequestHandlers = (transaction: { oncomplete: (() => void) | null }): void => {
  setTimeout(() => transaction.oncomplete?.(), 0)
}

const createFakeIndexedDb = (): IDBFactory => {
  const databases = new Map<string, Map<string, Map<string, unknown>>>()
  const createDatabase = (databaseName: string) => {
    const stores = databases.get(databaseName) ?? new Map<string, Map<string, unknown>>()
    databases.set(databaseName, stores)
    const database = {
      objectStoreNames: {
        contains: (storeName: string) => stores.has(storeName)
      },
      createObjectStore: (storeName: string) => {
        const records = new Map<string, unknown>()
        stores.set(storeName, records)
        return records
      },
      transaction: (storeName: string) => {
        const records = stores.get(storeName)
        if (records === undefined) throw new Error(`missing store ${storeName}`)
        const transaction = {
          error: null,
          oncomplete: null as (() => void) | null,
          onerror: null as (() => void) | null,
          onabort: null as (() => void) | null,
          objectStore: () => ({
            put: (record: WebIndexedDbImportRecord) => {
              records.set(record.importId, record)
              const request = requestSuccess(undefined)
              completeTransactionAfterRequestHandlers(transaction)
              return request
            },
            get: (importId: string) => {
              const request = requestSuccess(records.get(importId))
              completeTransactionAfterRequestHandlers(transaction)
              return request
            },
            getAll: () => {
              const request = requestSuccess([...records.values()])
              completeTransactionAfterRequestHandlers(transaction)
              return request
            },
            delete: (importId: string) => {
              records.delete(importId)
              const request = requestSuccess(undefined)
              completeTransactionAfterRequestHandlers(transaction)
              return request
            }
          })
        }
        return transaction as unknown as IDBTransaction
      },
      close: vi.fn()
    }
    return database as unknown as IDBDatabase
  }

  return {
    open: (databaseName: string) => {
      const request = {
        result: createDatabase(databaseName),
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
        onupgradeneeded: null as (() => void) | null
      }
      queueMicrotask(() => {
        request.onupgradeneeded?.()
        request.onsuccess?.()
      })
      return request as unknown as IDBOpenDBRequest
    }
  } as unknown as IDBFactory
}

describe('web IndexedDB import persistence', () => {
  it('persists a Web file-picker source and restores it as a read-only ContentPackageSource', async() => {
    const store = createInMemoryWebIndexedDbImportPersistenceStore()
    const source = createSource()

    const record = await persistWebFilePickerImportSource(store, 'valid-gift-pack', source)
    const restoredSource = await restoreWebIndexedDbImportSource(store, 'valid-gift-pack')

    expect(record).toMatchObject({
      importId: 'valid-gift-pack',
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import'
    })
    expect(record.files.map(file => file.path)).toEqual([
      'valid-gift-pack/data/items.json',
      'valid-gift-pack/locales/zh-CN.json',
      'valid-gift-pack/manifest.json'
    ])
    expect(restoredSource?.identity).toEqual(source.identity)
    expect(await readContentPackageSourceJson(restoredSource!, 'valid-gift-pack/manifest.json'))
      .toMatchObject({ ok: true, data: { id: 'web_persisted' } })

    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(restoredSource!)
    const discoveryReport = await discoverThirdPartyDataPacks(restoredSource!.identity.rootPath, fileSystem)
    expect(discoveryReport.status).toBe('completed')
    expect(discoveryReport.candidates[0]?.path).toBe('valid-gift-pack')
  })

  it('uses IndexedDB object store operations without touching settings, saves or runtime state', async() => {
    const store = createWebIndexedDbImportPersistenceStore({
      indexedDb: createFakeIndexedDb(),
      databaseName: 'test-taoyuan-web-mod-imports'
    })
    const record = createDefaultWebIndexedDbImportRecord([
      {
        path: 'valid-gift-pack/manifest.json',
        text: toJson(createManifest('indexeddb_valid')),
        sizeBytes: toJson(createManifest('indexeddb_valid')).length
      }
    ], 'indexeddb-valid')

    await store.put(record)
    expect(await store.list()).toEqual([{
      importId: 'indexeddb-valid',
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import',
      fileCount: 1,
      totalBytes: record.files[0]!.sizeBytes
    }])
    expect(await store.get('indexeddb-valid')).toEqual(record)
    await store.delete('indexeddb-valid')
    expect(await store.get('indexeddb-valid')).toBeNull()
  })

  it('rejects unsafe persisted paths and does not echo host path fragments', () => {
    expect(() => validateWebIndexedDbImportRecord({
      importId: 'bad',
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import',
      files: [
        {
          path: '..\\userdata\\settings.json',
          text: '{}\n',
          sizeBytes: 3
        }
      ]
    })).toThrowError(/Content package source path is unsafe/)

    try {
      validateWebIndexedDbImportRecord({
        importId: 'bad',
        sourceId: 'web/file-picker-import',
        rootPath: 'web-import',
        files: [
          {
            path: '..\\userdata\\settings.json',
            text: '{}\n',
            sizeBytes: 3
          }
        ]
      })
    } catch (error) {
      expect(JSON.stringify(error)).not.toContain('userdata')
    }
  })

  it('rejects tampered persisted payload sizes before restoring a source', () => {
    expect(() => createWebFilePickerImportSourceFromIndexedDbRecord({
      importId: 'tampered',
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import',
      files: [
        {
          path: 'valid-gift-pack/manifest.json',
          text: '{}\n',
          sizeBytes: 99
        }
      ]
    })).toThrowError(/file size metadata does not match payload size/)
  })

  it('rejects persisted payloads that exceed the configured single-file read limit', () => {
    expect(() => createWebFilePickerImportSourceFromIndexedDbRecord({
      importId: 'too-large',
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import',
      files: [
        {
          path: 'valid-gift-pack/manifest.json',
          text: '{}\n',
          sizeBytes: 3
        }
      ]
    }, {
      ...CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
      maxSingleFileBytes: 2
    })).toThrowError(/Source text file exceeds 2 bytes/)
  })

  it('requires a Web file-picker source before writing imports', async() => {
    const store = createInMemoryWebIndexedDbImportPersistenceStore()
    const wrongSource = createWebFilePickerImportSource({
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import',
      files: [createFile('valid-gift-pack/manifest.json', '{}\n')]
    })
    Object.defineProperty(wrongSource, 'identity', {
      enumerable: true,
      value: {
        ...wrongSource.identity,
        kind: 'memory'
      }
    })

    await expect(persistWebFilePickerImportSource(store, 'wrong', wrongSource))
      .rejects.toMatchObject({
        code: 'SOURCE_IDENTITY_INVALID',
        message: 'Web IndexedDB import persistence requires a web-file-picker-import source'
      })
  })
})
