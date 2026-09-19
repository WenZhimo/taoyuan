import { compareCodePoints } from './canonicalJson'
import {
  THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_MAX_BYTES,
  type ThirdPartyDataPackCandidateRegistryCacheStore
} from './thirdPartyDataPackCandidateRegistryCache'
import type { Sha256Hash } from './hash'

export const THIRD_PARTY_DATA_PACK_WEB_CANDIDATE_REGISTRY_CACHE_DATABASE_NAME =
  'taoyuan-web-mod-cache'
export const THIRD_PARTY_DATA_PACK_WEB_CANDIDATE_REGISTRY_CACHE_DATABASE_VERSION = 1
export const THIRD_PARTY_DATA_PACK_WEB_CANDIDATE_REGISTRY_CACHE_OBJECT_STORE_NAME =
  'registrySnapshots'

interface WebCandidateRegistryCacheRecord {
  readonly environmentHash: Sha256Hash
  readonly contents: string
}

export interface CreateThirdPartyDataPackWebCandidateRegistryCacheStoreOptions {
  readonly indexedDb?: IDBFactory
  readonly databaseName?: string
  readonly objectStoreName?: string
}

const isEnvironmentHash = (value: string): value is Sha256Hash =>
  /^sha256:[0-9a-f]{64}$/.test(value)

const assertContents = (contents: string): void => {
  if (new TextEncoder().encode(contents).byteLength > THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_MAX_BYTES) {
    throw new Error('Third-party candidate registry cache exceeds the size limit')
  }
}

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
})

const transactionToPromise = (transaction: IDBTransaction): Promise<void> => new Promise((resolve, reject) => {
  transaction.oncomplete = () => resolve()
  transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'))
  transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'))
})

export const createThirdPartyDataPackWebCandidateRegistryCacheStore = (
  options: CreateThirdPartyDataPackWebCandidateRegistryCacheStoreOptions = {}
): ThirdPartyDataPackCandidateRegistryCacheStore => {
  const indexedDb = options.indexedDb ?? globalThis.indexedDB
  if (indexedDb === undefined) throw new Error('Web IndexedDB is not available')
  const databaseName = options.databaseName
    ?? THIRD_PARTY_DATA_PACK_WEB_CANDIDATE_REGISTRY_CACHE_DATABASE_NAME
  const objectStoreName = options.objectStoreName
    ?? THIRD_PARTY_DATA_PACK_WEB_CANDIDATE_REGISTRY_CACHE_OBJECT_STORE_NAME

  const openDatabase = async(): Promise<IDBDatabase> => {
    const request = indexedDb.open(databaseName, THIRD_PARTY_DATA_PACK_WEB_CANDIDATE_REGISTRY_CACHE_DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(objectStoreName)) {
        database.createObjectStore(objectStoreName, { keyPath: 'environmentHash' })
      }
    }
    return requestToPromise(request)
  }

  const withObjectStore = async<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<T>
  ): Promise<T> => {
    const database = await openDatabase()
    try {
      const transaction = database.transaction(objectStoreName, mode)
      const result = await operation(transaction.objectStore(objectStoreName))
      await transactionToPromise(transaction)
      return result
    } finally {
      database.close()
    }
  }

  return {
    async read(environmentHash) {
      if (!isEnvironmentHash(environmentHash)) throw new Error('Invalid candidate registry cache environment hash')
      const record = await withObjectStore('readonly', async store =>
        await requestToPromise(store.get(environmentHash)) as WebCandidateRegistryCacheRecord | undefined)
      if (record === undefined) return null
      if (record.environmentHash !== environmentHash || typeof record.contents !== 'string') {
        throw new Error('Third-party candidate registry cache record is invalid')
      }
      assertContents(record.contents)
      return record.contents
    },
    async write(environmentHash, contents) {
      if (!isEnvironmentHash(environmentHash)) throw new Error('Invalid candidate registry cache environment hash')
      assertContents(contents)
      await withObjectStore('readwrite', async store => {
        await requestToPromise(store.put({ environmentHash, contents } satisfies WebCandidateRegistryCacheRecord))
      })
    }
  }
}

export const createInMemoryThirdPartyDataPackWebCandidateRegistryCacheStore = () => {
  const records = new Map<Sha256Hash, string>()
  return {
    async read(environmentHash: Sha256Hash) {
      return records.get(environmentHash) ?? null
    },
    async write(environmentHash: Sha256Hash, contents: string) {
      assertContents(contents)
      records.set(environmentHash, contents)
    },
    async list() {
      return [...records.keys()].sort(compareCodePoints)
    }
  } satisfies ThirdPartyDataPackCandidateRegistryCacheStore & {
    list(): Promise<readonly Sha256Hash[]>
  }
}
