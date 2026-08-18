import { compareCodePoints } from './canonicalJson'
import { utf8ByteLength } from './hash'
import {
  CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  ContentPackageSourceError,
  assertContentPackageSourceTextWithinLimits,
  normalizeContentPackageSourcePath,
  readContentPackageSourceIdentity,
  toContentPackageSourceHostOperationError,
  type ContentPackageSource,
  type ContentPackageSourceSafeReadPolicy
} from './contentPackageSource'
import {
  WEB_FILE_PICKER_IMPORT_SOURCE_ID,
  WEB_FILE_PICKER_IMPORT_SOURCE_KIND,
  WEB_FILE_PICKER_IMPORT_ROOT_PATH,
  createWebFilePickerImportSource,
  type WebFilePickerImportFile
} from './webFilePickerImportSource'

export const WEB_INDEXED_DB_IMPORT_DATABASE_NAME = 'taoyuan-web-mod-imports'
export const WEB_INDEXED_DB_IMPORT_DATABASE_VERSION = 1
export const WEB_INDEXED_DB_IMPORT_OBJECT_STORE_NAME = 'imports'

export interface WebIndexedDbImportFileRecord {
  readonly path: string
  readonly text: string
  readonly sizeBytes: number
}

export interface WebIndexedDbImportRecord {
  readonly importId: string
  readonly sourceId: string
  readonly rootPath: string
  readonly files: readonly WebIndexedDbImportFileRecord[]
}

export interface WebIndexedDbImportSummary {
  readonly importId: string
  readonly sourceId: string
  readonly rootPath: string
  readonly fileCount: number
  readonly totalBytes: number
}

export interface WebIndexedDbImportPersistenceStore {
  put(record: WebIndexedDbImportRecord): Promise<void>
  get(importId: string): Promise<WebIndexedDbImportRecord | null>
  list(): Promise<readonly WebIndexedDbImportSummary[]>
  delete(importId: string): Promise<void>
}

export interface CreateWebIndexedDbImportPersistenceStoreOptions {
  readonly indexedDb?: IDBFactory
  readonly databaseName?: string
  readonly objectStoreName?: string
}

const requiredRecordKeys = ['importId', 'sourceId', 'rootPath', 'files'] as const
const supportedRecordKeys = new Set(requiredRecordKeys)
const requiredFileRecordKeys = ['path', 'text', 'sizeBytes'] as const
const supportedFileRecordKeys = new Set(requiredFileRecordKeys)

const toMetadataError = (message: string): ContentPackageSourceError =>
  new ContentPackageSourceError('SOURCE_ENTRY_UNSAFE', message)

const asPlainMetadata = (value: unknown, message: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw toMetadataError(message)
  }
  return value as Record<string, unknown>
}

const readEnumerableDataKeys = (
  value: Record<string, unknown>,
  supportedKeys: ReadonlySet<string>,
  requiredKeys: readonly string[],
  unsupportedMessage: string,
  missingMessage: string
): readonly string[] => {
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(value)
  } catch {
    throw toMetadataError('Web IndexedDB import metadata could not be read')
  }

  const stringKeys: string[] = []
  for (const key of keys) {
    if (typeof key !== 'string' || !supportedKeys.has(key)) {
      throw toMetadataError(unsupportedMessage)
    }
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, key)
    } catch {
      throw toMetadataError('Web IndexedDB import metadata could not be read')
    }
    if (descriptor?.enumerable !== true || !('value' in descriptor)) {
      throw toMetadataError(unsupportedMessage)
    }
    stringKeys.push(key)
  }

  const ownKeys = new Set(stringKeys)
  if (requiredKeys.some(key => !ownKeys.has(key))) {
    throw toMetadataError(missingMessage)
  }
  return stringKeys
}

const readDataField = (value: Record<string, unknown>, fieldName: string): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    throw toMetadataError('Web IndexedDB import metadata could not be read')
  }
  if (descriptor?.enumerable !== true || !('value' in descriptor)) {
    throw toMetadataError('Web IndexedDB import metadata contains unsupported fields')
  }
  return descriptor.value
}

const normalizeIdentifier = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      `${fieldName} must be a normalized relative identifier`
    )
  }
  const normalized = normalizeContentPackageSourcePath(value)
  if (normalized === '' || normalized !== value) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      `${fieldName} must be non-empty and already normalized`
    )
  }
  return normalized
}

const readDenseFileRecords = (
  files: unknown,
  policy: ContentPackageSourceSafeReadPolicy
): readonly unknown[] => {
  if (!Array.isArray(files)) {
    throw toMetadataError('Web IndexedDB import files metadata must be an array')
  }
  if (!Number.isSafeInteger(files.length) || files.length < 0) {
    throw toMetadataError('Web IndexedDB import files metadata must be a dense JSON array')
  }
  if (files.length > policy.maxPackageFileCount) {
    throw new ContentPackageSourceError(
      'SOURCE_LIMIT_EXCEEDED',
      `Web IndexedDB import exceeds ${policy.maxPackageFileCount} files: ${files.length}`
    )
  }

  for (let index = 0; index < files.length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(files, String(index))
    } catch {
      throw toMetadataError('Web IndexedDB import files metadata could not be read')
    }
    if (descriptor?.enumerable !== true || !('value' in descriptor)) {
      throw toMetadataError('Web IndexedDB import files metadata must be a dense JSON array')
    }
  }
  return files
}

const normalizeFileRecord = (
  value: unknown,
  policy: ContentPackageSourceSafeReadPolicy
): WebIndexedDbImportFileRecord => {
  const metadata = asPlainMetadata(value, 'Web IndexedDB import file metadata must be an object')
  readEnumerableDataKeys(
    metadata,
    supportedFileRecordKeys,
    requiredFileRecordKeys,
    'Web IndexedDB import file metadata contains unsupported fields',
    'Web IndexedDB import file metadata must include path, text and sizeBytes own fields'
  )
  const path = readDataField(metadata, 'path')
  const text = readDataField(metadata, 'text')
  const sizeBytes = readDataField(metadata, 'sizeBytes')
  if (typeof path !== 'string') {
    throw toMetadataError('Web IndexedDB import file path metadata must be a string')
  }
  if (typeof text !== 'string') {
    throw toMetadataError('Web IndexedDB import file text payload must be a string')
  }
  if (
    typeof sizeBytes !== 'number'
    || !Number.isSafeInteger(sizeBytes)
    || sizeBytes < 0
  ) {
    throw new ContentPackageSourceError(
      'SOURCE_LIMIT_EXCEEDED',
      'sizeBytes must be a non-negative safe integer',
      normalizeContentPackageSourcePath(path, policy)
    )
  }

  const normalizedPath = normalizeContentPackageSourcePath(path, policy)
  const normalizedText = assertContentPackageSourceTextWithinLimits(text, normalizedPath, policy)
  const actualSizeBytes = utf8ByteLength(normalizedText)
  if (actualSizeBytes !== sizeBytes) {
    throw new ContentPackageSourceError(
      'SOURCE_LIMIT_EXCEEDED',
      'Web IndexedDB import file size metadata does not match payload size',
      normalizedPath
    )
  }
  return Object.freeze({
    path: normalizedPath,
    text: normalizedText,
    sizeBytes
  })
}

export const validateWebIndexedDbImportRecord = (
  record: unknown,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): WebIndexedDbImportRecord => {
  const metadata = asPlainMetadata(record, 'Web IndexedDB import record metadata must be an object')
  readEnumerableDataKeys(
    metadata,
    supportedRecordKeys,
    requiredRecordKeys,
    'Web IndexedDB import record metadata contains unsupported fields',
    'Web IndexedDB import record metadata must include importId, sourceId, rootPath and files own fields'
  )

  const importId = normalizeIdentifier(readDataField(metadata, 'importId'), 'importId')
  const sourceId = normalizeIdentifier(readDataField(metadata, 'sourceId'), 'sourceId')
  const rootPath = normalizeIdentifier(readDataField(metadata, 'rootPath'), 'rootPath')
  const files = readDenseFileRecords(readDataField(metadata, 'files'), policy)
    .map(file => normalizeFileRecord(file, policy))
    .sort((left, right) => compareCodePoints(left.path, right.path))

  const seenPaths = new Set<string>()
  let totalBytes = 0
  for (const file of files) {
    if (seenPaths.has(file.path)) {
      throw new ContentPackageSourceError('SOURCE_DUPLICATE_PATH', 'Duplicate source file path')
    }
    seenPaths.add(file.path)
    totalBytes += file.sizeBytes
    if (totalBytes > policy.maxPackageUncompressedBytes) {
      throw new ContentPackageSourceError(
        'SOURCE_LIMIT_EXCEEDED',
        `Web IndexedDB import exceeds ${policy.maxPackageUncompressedBytes} total bytes: ${totalBytes}`
      )
    }
  }

  return Object.freeze({
    importId,
    sourceId,
    rootPath,
    files: Object.freeze(files)
  })
}

const entryChildPath = (parentPath: string, name: string): string =>
  parentPath === '' ? name : `${parentPath}/${name}`

const collectSourceFiles = async (
  source: ContentPackageSource,
  sourcePath: string,
  files: WebIndexedDbImportFileRecord[],
  policy: ContentPackageSourceSafeReadPolicy,
  totalBytes: { value: number }
): Promise<void> => {
  const entries = await source.readDirectory(sourcePath)
  for (const entry of entries) {
    const childPath = normalizeContentPackageSourcePath(entryChildPath(sourcePath, entry.name), policy)
    if (entry.kind === 'directory') {
      await collectSourceFiles(source, childPath, files, policy, totalBytes)
      continue
    }
    if (entry.kind !== 'file' || entry.isSymbolicLink) continue
    if (files.length >= policy.maxPackageFileCount) {
      throw new ContentPackageSourceError(
        'SOURCE_LIMIT_EXCEEDED',
        `Web IndexedDB import exceeds ${policy.maxPackageFileCount} files: ${files.length + 1}`
      )
    }
    let text: string
    try {
      text = assertContentPackageSourceTextWithinLimits(await source.readTextFile(childPath), childPath, policy)
    } catch (error) {
      throw toContentPackageSourceHostOperationError('read', error, childPath)
    }
    const sizeBytes = utf8ByteLength(text)
    totalBytes.value += sizeBytes
    if (totalBytes.value > policy.maxPackageUncompressedBytes) {
      throw new ContentPackageSourceError(
        'SOURCE_LIMIT_EXCEEDED',
        `Web IndexedDB import exceeds ${policy.maxPackageUncompressedBytes} total bytes: ${totalBytes.value}`
      )
    }
    files.push(Object.freeze({ path: childPath, text, sizeBytes }))
  }
}

export const persistWebFilePickerImportSource = async (
  store: WebIndexedDbImportPersistenceStore,
  importId: string,
  source: ContentPackageSource,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): Promise<WebIndexedDbImportRecord> => {
  const identity = readContentPackageSourceIdentity(source)
  if (identity.kind !== WEB_FILE_PICKER_IMPORT_SOURCE_KIND) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'Web IndexedDB import persistence requires a web-file-picker-import source'
    )
  }
  const files: WebIndexedDbImportFileRecord[] = []
  await collectSourceFiles(source, '', files, policy, { value: 0 })
  const record = validateWebIndexedDbImportRecord({
    importId,
    sourceId: identity.sourceId,
    rootPath: identity.rootPath,
    files
  }, policy)
  await store.put(record)
  return record
}

const fileName = (path: string): string => {
  const separatorIndex = path.lastIndexOf('/')
  return separatorIndex === -1 ? path : path.slice(separatorIndex + 1)
}

export const createWebFilePickerImportSourceFromIndexedDbRecord = (
  record: WebIndexedDbImportRecord,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): ContentPackageSource => {
  const validatedRecord = validateWebIndexedDbImportRecord(record, policy)
  const files: readonly WebFilePickerImportFile[] = validatedRecord.files.map(file => Object.freeze({
    name: fileName(file.path),
    webkitRelativePath: file.path,
    size: file.sizeBytes,
    text: async() => file.text
  }))
  return createWebFilePickerImportSource({
    sourceId: validatedRecord.sourceId,
    rootPath: validatedRecord.rootPath,
    files,
    policy
  })
}

export const restoreWebIndexedDbImportSource = async (
  store: WebIndexedDbImportPersistenceStore,
  importId: string,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): Promise<ContentPackageSource | null> => {
  const record = await store.get(importId)
  return record === null ? null : createWebFilePickerImportSourceFromIndexedDbRecord(record, policy)
}

const createSummary = (record: WebIndexedDbImportRecord): WebIndexedDbImportSummary => Object.freeze({
  importId: record.importId,
  sourceId: record.sourceId,
  rootPath: record.rootPath,
  fileCount: record.files.length,
  totalBytes: record.files.reduce((total, file) => total + file.sizeBytes, 0)
})

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
})

const transactionToPromise = (transaction: IDBTransaction): Promise<void> => new Promise((resolve, reject) => {
  transaction.oncomplete = () => resolve()
  transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'))
  transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'))
})

const toPersistenceError = (error: unknown, sourcePath: string): ContentPackageSourceError =>
  toContentPackageSourceHostOperationError('read', error, sourcePath)

export const createWebIndexedDbImportPersistenceStore = (
  options: CreateWebIndexedDbImportPersistenceStoreOptions = {}
): WebIndexedDbImportPersistenceStore => {
  const indexedDb = options.indexedDb ?? globalThis.indexedDB
  if (indexedDb === undefined) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_NOT_FOUND',
      'Web IndexedDB is not available'
    )
  }
  const databaseName = options.databaseName ?? WEB_INDEXED_DB_IMPORT_DATABASE_NAME
  const objectStoreName = options.objectStoreName ?? WEB_INDEXED_DB_IMPORT_OBJECT_STORE_NAME

  const openDatabase = async(): Promise<IDBDatabase> => {
    const request = indexedDb.open(databaseName, WEB_INDEXED_DB_IMPORT_DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(objectStoreName)) {
        database.createObjectStore(objectStoreName, { keyPath: 'importId' })
      }
    }
    return requestToPromise(request)
  }

  const withObjectStore = async <T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<T>
  ): Promise<T> => {
    const database = await openDatabase()
    try {
      const transaction = database.transaction(objectStoreName, mode)
      const store = transaction.objectStore(objectStoreName)
      const result = await operation(store)
      await transactionToPromise(transaction)
      return result
    } finally {
      database.close()
    }
  }

  return {
    async put(record) {
      const validatedRecord = validateWebIndexedDbImportRecord(record)
      try {
        await withObjectStore('readwrite', async store => {
          await requestToPromise(store.put(validatedRecord))
        })
      } catch (error) {
        throw toPersistenceError(error, validatedRecord.importId)
      }
    },
    async get(importId) {
      const normalizedImportId = normalizeIdentifier(importId, 'importId')
      try {
        return await withObjectStore('readonly', async store => {
          const record = await requestToPromise(store.get(normalizedImportId))
          return record === undefined ? null : validateWebIndexedDbImportRecord(record)
        })
      } catch (error) {
        throw toPersistenceError(error, normalizedImportId)
      }
    },
    async list() {
      try {
        return await withObjectStore('readonly', async store => {
          const records = await requestToPromise(store.getAll())
          if (!Array.isArray(records)) {
            throw toMetadataError('Web IndexedDB import records metadata must be an array')
          }
          return Object.freeze(records
            .map(record => createSummary(validateWebIndexedDbImportRecord(record)))
            .sort((left, right) => compareCodePoints(left.importId, right.importId)))
        })
      } catch (error) {
        throw toPersistenceError(error, WEB_FILE_PICKER_IMPORT_SOURCE_ID)
      }
    },
    async delete(importId) {
      const normalizedImportId = normalizeIdentifier(importId, 'importId')
      try {
        await withObjectStore('readwrite', async store => {
          await requestToPromise(store.delete(normalizedImportId))
        })
      } catch (error) {
        throw toPersistenceError(error, normalizedImportId)
      }
    }
  }
}

export const createInMemoryWebIndexedDbImportPersistenceStore = (): WebIndexedDbImportPersistenceStore => {
  const records = new Map<string, WebIndexedDbImportRecord>()
  return {
    async put(record) {
      const validatedRecord = validateWebIndexedDbImportRecord(record)
      records.set(validatedRecord.importId, validatedRecord)
    },
    async get(importId) {
      const normalizedImportId = normalizeIdentifier(importId, 'importId')
      return records.get(normalizedImportId) ?? null
    },
    async list() {
      return Object.freeze([...records.values()]
        .map(createSummary)
        .sort((left, right) => compareCodePoints(left.importId, right.importId)))
    },
    async delete(importId) {
      const normalizedImportId = normalizeIdentifier(importId, 'importId')
      records.delete(normalizedImportId)
    }
  }
}

export const createDefaultWebIndexedDbImportRecord = (
  files: readonly WebIndexedDbImportFileRecord[],
  importId = 'default',
  sourceId = WEB_FILE_PICKER_IMPORT_SOURCE_ID,
  rootPath = WEB_FILE_PICKER_IMPORT_ROOT_PATH
): WebIndexedDbImportRecord => validateWebIndexedDbImportRecord({
  importId,
  sourceId,
  rootPath,
  files
})
