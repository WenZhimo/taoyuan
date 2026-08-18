import {
  CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  ContentPackageSourceError,
  normalizeContentPackageSourcePath,
  toContentPackageSourceHostOperationError,
  type ContentPackageSource,
  type ContentPackageSourceSafeReadPolicy
} from './contentPackageSource'
import {
  ANDROID_FILE_PICKER_IMPORT_ROOT_PATH,
  ANDROID_FILE_PICKER_IMPORT_SOURCE_KIND,
  createAndroidFilePickerImportSource,
  type AndroidFilePickerImportedFile
} from './androidFilePickerImportSource'

export const ANDROID_APP_DATA_IMPORT_SOURCE_ID = 'android/app-data-import'

export interface AndroidAppDataImportFileDescriptor {
  readonly relativePath: string
  readonly sizeBytes?: number
}

export interface AndroidAppDataImportBridgeHost {
  listImportedFiles(importId: string): Promise<readonly AndroidAppDataImportFileDescriptor[]>
  readImportedText(importId: string, relativePath: string): Promise<string>
}

export interface CreateAndroidAppDataImportSourceOptions {
  readonly host: AndroidAppDataImportBridgeHost
  readonly importId: string
  readonly sourceId?: string
  readonly rootPath?: string
  readonly policy?: ContentPackageSourceSafeReadPolicy
}

const supportedOptionsKeys = new Set(['host', 'importId', 'sourceId', 'rootPath', 'policy'])
const requiredOptionsKeys = ['host', 'importId'] as const
const supportedHostKeys = new Set(['listImportedFiles', 'readImportedText'])
const requiredHostKeys = ['listImportedFiles', 'readImportedText'] as const
const supportedFileDescriptorKeys = new Set(['relativePath', 'sizeBytes'])
const requiredFileDescriptorKeys = ['relativePath'] as const

const toMetadataError = (message: string): ContentPackageSourceError =>
  new ContentPackageSourceError('SOURCE_ENTRY_UNSAFE', message)

const asMetadataObject = (value: unknown, message: string): Record<string, unknown> => {
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
    throw toMetadataError('Android app-data import metadata could not be read')
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
      throw toMetadataError('Android app-data import metadata could not be read')
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
    throw toMetadataError('Android app-data import metadata could not be read')
  }
  if (descriptor?.enumerable !== true || !('value' in descriptor)) {
    throw toMetadataError('Android app-data import metadata contains unsupported fields')
  }
  return descriptor.value
}

const isArrayIndexKey = (key: string, length: number): boolean => {
  if (!/^(0|[1-9]\d*)$/.test(key)) return false
  const index = Number(key)
  return Number.isSafeInteger(index) && index >= 0 && index < length
}

const readDenseArrayLength = (files: unknown[]): number => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(files, 'length')
  } catch {
    throw toMetadataError('Android app-data import files metadata could not be read')
  }
  if (
    descriptor === undefined
    || !('value' in descriptor)
    || typeof descriptor.value !== 'number'
    || !Number.isSafeInteger(descriptor.value)
    || descriptor.value < 0
  ) {
    throw toMetadataError('Android app-data import files metadata must be a dense JSON array')
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
  let normalized: string
  try {
    normalized = normalizeContentPackageSourcePath(value)
  } catch {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      `${fieldName} must be a normalized relative identifier`
    )
  }
  if (normalized === '' || normalized !== value) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      `${fieldName} must be non-empty and already normalized`
    )
  }
  return normalized
}

const readHostMethod = <Name extends keyof AndroidAppDataImportBridgeHost>(
  host: AndroidAppDataImportBridgeHost,
  fieldName: Name
): AndroidAppDataImportBridgeHost[Name] => {
  const value = readDataField(host as unknown as Record<string, unknown>, fieldName)
  if (typeof value !== 'function') {
    throw toMetadataError(`Android app-data import host ${String(fieldName)} must be a function`)
  }
  return value as AndroidAppDataImportBridgeHost[Name]
}

const readHost = (value: unknown): AndroidAppDataImportBridgeHost => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw toMetadataError('Android app-data import host metadata must be an object')
  }
  const host = value as AndroidAppDataImportBridgeHost
  readEnumerableDataKeys(
    host as unknown as Record<string, unknown>,
    supportedHostKeys,
    requiredHostKeys,
    'Android app-data import host metadata contains unsupported fields',
    'Android app-data import host metadata must include listImportedFiles and readImportedText own fields'
  )
  readHostMethod(host, 'listImportedFiles')
  readHostMethod(host, 'readImportedText')
  return host
}

const readFileDescriptors = (
  files: unknown,
  policy: ContentPackageSourceSafeReadPolicy
): readonly AndroidAppDataImportFileDescriptor[] => {
  if (!Array.isArray(files)) {
    throw toMetadataError('Android app-data import files metadata must be an array')
  }
  const fileCount = readDenseArrayLength(files)
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(files)
  } catch {
    throw toMetadataError('Android app-data import files metadata could not be read')
  }
  if (keys.some(key => typeof key !== 'string' || (key !== 'length' && !isArrayIndexKey(key, fileCount)))) {
    throw toMetadataError('Android app-data import files metadata must be a dense JSON array')
  }
  if (fileCount > policy.maxPackageFileCount) {
    throw new ContentPackageSourceError(
      'SOURCE_LIMIT_EXCEEDED',
      `Android app-data import exceeds ${policy.maxPackageFileCount} files: ${fileCount}`
    )
  }

  const result: AndroidAppDataImportFileDescriptor[] = []
  for (let index = 0; index < fileCount; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(files, String(index))
    } catch {
      throw toMetadataError('Android app-data import files metadata could not be read')
    }
    if (descriptor?.enumerable !== true || !('value' in descriptor)) {
      throw toMetadataError('Android app-data import files metadata must be a dense JSON array')
    }
    result.push(readFileDescriptor(descriptor.value, policy))
  }
  return Object.freeze(result)
}

const attachImportMetadataSourcePath = (
  error: unknown,
  importId: string
): never => {
  if (error instanceof ContentPackageSourceError) {
    throw error.sourcePath === undefined
      ? new ContentPackageSourceError(error.code, error.message, importId)
      : error
  }
  throw toContentPackageSourceHostOperationError('inspect', error, importId)
}

const readFileDescriptor = (
  value: unknown,
  policy: ContentPackageSourceSafeReadPolicy
): AndroidAppDataImportFileDescriptor => {
  const metadata = asMetadataObject(value, 'Android app-data import file metadata must be an object')
  const keys = readEnumerableDataKeys(
    metadata,
    supportedFileDescriptorKeys,
    requiredFileDescriptorKeys,
    'Android app-data import file metadata contains unsupported fields',
    'Android app-data import file metadata must include relativePath own field'
  )
  const relativePath = readDataField(metadata, 'relativePath')
  if (typeof relativePath !== 'string') {
    throw toMetadataError('Android app-data import file relativePath metadata must be a string')
  }
  const sizeBytes = keys.includes('sizeBytes')
    ? readDataField(metadata, 'sizeBytes')
    : undefined
  if (
    sizeBytes !== undefined
    && (
      typeof sizeBytes !== 'number'
      || !Number.isSafeInteger(sizeBytes)
      || sizeBytes < 0
    )
  ) {
    throw new ContentPackageSourceError(
      'SOURCE_LIMIT_EXCEEDED',
      'sizeBytes must be a non-negative safe integer',
      normalizeContentPackageSourcePath(relativePath, policy)
    )
  }
  return Object.freeze({
    relativePath,
    ...(sizeBytes === undefined ? {} : { sizeBytes })
  })
}

const toImportedFile = (
  readImportedText: AndroidAppDataImportBridgeHost['readImportedText'],
  host: AndroidAppDataImportBridgeHost,
  importId: string,
  descriptor: AndroidAppDataImportFileDescriptor
): AndroidFilePickerImportedFile => Object.freeze({
  relativePath: descriptor.relativePath,
  ...(descriptor.sizeBytes === undefined ? {} : { sizeBytes: descriptor.sizeBytes }),
  async readText() {
    try {
      return await readImportedText.call(host, importId, descriptor.relativePath)
    } catch (error) {
      throw toContentPackageSourceHostOperationError('read', error, descriptor.relativePath)
    }
  }
})

export const createAndroidAppDataImportSource = async(
  options: CreateAndroidAppDataImportSourceOptions
): Promise<ContentPackageSource> => {
  const metadata = asMetadataObject(options, 'Android app-data import source options metadata must be an object')
  const keys = readEnumerableDataKeys(
    metadata,
    supportedOptionsKeys,
    requiredOptionsKeys,
    'Android app-data import source options metadata contains unsupported fields',
    'Android app-data import source options metadata must include host and importId own fields'
  )
  const policy = (keys.includes('policy')
    ? readDataField(metadata, 'policy')
    : CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS) as ContentPackageSourceSafeReadPolicy
  const host = readHost(readDataField(metadata, 'host'))
  const importId = normalizeIdentifier(readDataField(metadata, 'importId'), 'importId')
  const sourceId = normalizeIdentifier(
    keys.includes('sourceId')
      ? readDataField(metadata, 'sourceId')
      : ANDROID_APP_DATA_IMPORT_SOURCE_ID,
    'sourceId'
  )
  const rootPath = normalizeIdentifier(
    keys.includes('rootPath')
      ? readDataField(metadata, 'rootPath')
      : ANDROID_FILE_PICKER_IMPORT_ROOT_PATH,
    'rootPath'
  )
  const listImportedFiles = readHostMethod(host, 'listImportedFiles')
  const readImportedText = readHostMethod(host, 'readImportedText')
  let hostFiles: unknown
  try {
    hostFiles = await listImportedFiles.call(host, importId)
  } catch (error) {
    throw toContentPackageSourceHostOperationError('inspect', error, importId)
  }
  const descriptors = (() => {
    try {
      return readFileDescriptors(hostFiles, policy)
    } catch (error) {
      return attachImportMetadataSourcePath(error, importId)
    }
  })()
  const files = descriptors.map(descriptor => toImportedFile(readImportedText, host, importId, descriptor))
  return createAndroidFilePickerImportSource({
    files,
    sourceId,
    rootPath,
    policy
  })
}

export const ANDROID_APP_DATA_IMPORT_SOURCE_KIND = ANDROID_FILE_PICKER_IMPORT_SOURCE_KIND
