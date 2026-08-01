import { assertPureJsonValue, compareCodePoints } from './canonicalJson'
import { normalizePackagePath, utf8ByteLength } from './hash'
import type { ThirdPartyDiscoveryFileSystem, ThirdPartyDiscoveryDirectoryEntry } from './thirdPartyDataPackDiscovery'

export const CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION = 1

export type ContentPackageSourceKind =
  | 'memory'
  | 'developer-cli-directory'
  | 'electron-readonly-directory-probe'
export type ContentPackageSourceEntryKind = 'file' | 'directory' | 'other'

export type ContentPackageSourceErrorCode =
  | 'SOURCE_IDENTITY_INVALID'
  | 'SOURCE_DUPLICATE_PATH'
  | 'SOURCE_ENTRY_UNSAFE'
  | 'SOURCE_ENTRY_NOT_DIRECTORY'
  | 'SOURCE_ENTRY_NOT_FILE'
  | 'SOURCE_ENTRY_NOT_FOUND'
  | 'SOURCE_JSON_NOT_PURE'
  | 'SOURCE_JSON_PARSE_FAILED'
  | 'SOURCE_LIMIT_EXCEEDED'
  | 'SOURCE_PATH_OUTSIDE_ROOT'
  | 'SOURCE_PATH_UNSAFE'
  | 'SOURCE_PERMISSION_REVOKED'
  | 'SOURCE_DISPOSED'

export class ContentPackageSourceError extends Error {
  readonly code: ContentPackageSourceErrorCode
  readonly sourcePath?: string

  constructor(code: ContentPackageSourceErrorCode, message: string, sourcePath?: string) {
    super(message)
    this.name = 'ContentPackageSourceError'
    this.code = code
    this.sourcePath = sourcePath
  }
}

export interface ContentPackageSourceIdentity {
  readonly contractVersion: typeof CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION
  readonly kind: ContentPackageSourceKind
  readonly sourceId: string
  readonly rootPath: string
}

export interface ContentPackageSourceDirectoryEntry {
  readonly name: string
  readonly kind: ContentPackageSourceEntryKind
  readonly isSymbolicLink: boolean
}

interface ContentPackageSourceUnknownDirectoryEntry {
  readonly name: string
  readonly kind: string
  readonly isSymbolicLink: boolean
}

export interface ContentPackageSource {
  readonly identity: ContentPackageSourceIdentity
  getEntry(path: string): Promise<ContentPackageSourceDirectoryEntry | null>
  readDirectory(path: string): Promise<readonly ContentPackageSourceDirectoryEntry[]>
  readTextFile(path: string): Promise<string>
  dispose(): Promise<void>
}

export interface ContentPackageSourceSafeReadPolicy {
  readonly maxPackageFileCount: number
  readonly maxPackageCompressedBytes: number
  readonly maxPackageUncompressedBytes: number
  readonly maxSingleFileBytes: number
  readonly maxCompressedRatio: number
  readonly maxPathUtf8Bytes: number
  readonly maxPathDepth: number
}

export interface ContentPackageSourceArchiveEntry {
  readonly path: string
  readonly uncompressedSizeBytes: number
  readonly compressedSizeBytes?: number
}

export interface ContentPackageSourceValidatedArchiveEntry {
  readonly path: string
  readonly uncompressedSizeBytes: number
  readonly compressedSizeBytes?: number
}

interface ContentPackageSourceUnknownArchiveEntry {
  readonly path: string
  readonly uncompressedSizeBytes: unknown
  readonly compressedSizeBytes?: unknown
}

interface ContentPackageSourceArchiveEntryPathMetadata {
  readonly path: string
  readonly entryMetadata: Record<string, unknown>
  readonly metadataKeys: readonly string[]
}

export interface RevocableContentPackageSource extends ContentPackageSource {
  revoke(): void
}

export interface MemoryContentPackageSourceFile {
  readonly path: string
  readonly text: string
}

export interface CreateMemoryContentPackageSourceOptions {
  readonly sourceId: string
  readonly rootPath: string
  readonly files: readonly MemoryContentPackageSourceFile[]
}

export type ContentPackageSourceJsonReadResult =
  | { readonly ok: true; readonly data: unknown }
  | { readonly ok: false; readonly code: ContentPackageSourceErrorCode; readonly message: string }

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) deepFreezeObjectGraph(child)
  }
  return value
}

const freezeContentPackageSourceJsonReadResult = (
  result: ContentPackageSourceJsonReadResult
): ContentPackageSourceJsonReadResult => deepFreezeObjectGraph(result)

const contentPackageSourceErrorCodes: ReadonlySet<string> = new Set<ContentPackageSourceErrorCode>([
  'SOURCE_IDENTITY_INVALID',
  'SOURCE_DUPLICATE_PATH',
  'SOURCE_ENTRY_UNSAFE',
  'SOURCE_ENTRY_NOT_DIRECTORY',
  'SOURCE_ENTRY_NOT_FILE',
  'SOURCE_ENTRY_NOT_FOUND',
  'SOURCE_JSON_NOT_PURE',
  'SOURCE_JSON_PARSE_FAILED',
  'SOURCE_LIMIT_EXCEEDED',
  'SOURCE_PATH_OUTSIDE_ROOT',
  'SOURCE_PATH_UNSAFE',
  'SOURCE_PERMISSION_REVOKED',
  'SOURCE_DISPOSED'
])
const unreadableErrorMessage = 'Content package source error could not be read'

const isContentPackageSourceErrorCode = (value: unknown): value is ContentPackageSourceErrorCode =>
  typeof value === 'string' && contentPackageSourceErrorCodes.has(value)

const readStringErrorField = (
  error: unknown,
  fieldName: string
): { readonly status: 'value'; readonly value: string } | { readonly status: 'missing' | 'unreadable' } => {
  if (typeof error !== 'object' || error === null) return { status: 'missing' }
  try {
    const value = (error as Record<string, unknown>)[fieldName]
    return typeof value === 'string'
      ? { status: 'value', value }
      : { status: 'missing' }
  } catch {
    return { status: 'unreadable' }
  }
}

const errorMessage = (error: unknown): string => {
  const message = readStringErrorField(error, 'message')
  if (message.status === 'value') return message.value
  if (message.status === 'unreadable') return unreadableErrorMessage
  try {
    return String(error)
  } catch {
    return unreadableErrorMessage
  }
}
export type ContentPackageSourceHostOperation = 'identity' | 'inspect' | 'list' | 'read'

const hostPathHintPattern = /(?:[A-Za-z]:[\\/]|\\\\|\\|(?:^|[^A-Za-z0-9_-])\/(?:Users|home|var|tmp|private|Volumes|mnt|run)(?:\/|\b))/

const mayContainHostPath = (message: string): boolean => hostPathHintPattern.test(message)

const hasUnsafePathControlCharacter = (value: string): boolean => {
  for (let index = 0; index < value.length; index += 1) {
    const charCode = value.charCodeAt(index)
    if (charCode <= 0x1F || charCode === 0x7F) return true
  }
  return false
}

const stableContentPackageSourceDiagnosticMessages: ReadonlySet<string> = new Set([
  'Content package source path is unsafe',
  'Content package source entry names must be single normalized path segments',
  'Content package source entry metadata must be an object',
  'Content package source entry metadata could not be read',
  'Content package source entry metadata contains unsupported fields',
  'Content package source entry metadata must include name, kind and isSymbolicLink own fields',
  'Content package source entry name metadata must be a string',
  'Content package source entry must expose an explicit symbolic-link flag',
  'Content package source directory entries metadata must be an array',
  'Content package source directory entries metadata must be a dense JSON array',
  'Content package source directory entries metadata could not be read',
  'Duplicate source directory entry',
  'Archive entry paths must be non-empty normalized POSIX paths',
  'Archive entry paths must already be normalized before validation',
  'Archive entry metadata must be an object',
  'Archive entry metadata could not be read',
  'Archive entry metadata contains unsupported fields',
  'Archive entry metadata must include path and uncompressedSizeBytes own fields',
  'Archive entry path metadata must be a string',
  'Duplicate archive entry path',
  'Archive entry path conflicts with another entry directory prefix',
  'Archive entries metadata must be an array',
  'Archive entries metadata must be a dense JSON array',
  'Memory source options metadata must be an object',
  'Memory source options metadata could not be read',
  'Memory source options metadata contains unsupported fields',
  'Memory source options metadata must include sourceId, rootPath and files own fields',
  'Memory source files metadata must be an array',
  'Memory source files metadata must be a dense JSON array',
  'Memory source file metadata must be an object',
  'Memory source file metadata could not be read',
  'Memory source file metadata contains unsupported fields',
  'Memory source file metadata must include path and text own fields',
  'Memory source file path metadata must be a string',
  'Memory source file text payload must be a string',
  'Content package source text payload must be a string',
  'Content package source identity must be an object',
  'Content package source identity metadata could not be read',
  'Content package source identity metadata contains unsupported fields',
  'Content package source identity metadata must include contractVersion, kind, sourceId and rootPath own fields',
  'Unsupported content package source contract version',
  'Unsupported content package source kind',
  'sourceId must be a normalized relative identifier',
  'rootPath must be a normalized relative identifier',
  'sourceId must be non-empty and already normalized',
  'rootPath must be non-empty and already normalized',
  'Content package source identity must already use normalized relative sourceId and rootPath',
  'Source entry name does not match requested path',
  'Content package source has been disposed',
  'Content package source permission was revoked',
  'File path cannot be the source root',
  'Source path was not found',
  'Source path must not be a symbolic link',
  'Source path is not a file',
  'Source path is not a directory',
  'Discovery path is outside source root',
  'Source file path conflicts with a directory path',
  'Duplicate source file path',
  'Source directory path conflicts with a file path',
  'Electron read-only source adapter probe root was not found',
  'Electron read-only source adapter probe root metadata does not match requested path',
  'Electron read-only source adapter probe root must be a directory',
  'Electron read-only source adapter probe root must not be a symbolic link',
  'Electron read-only source adapter probe has been disposed'
])

const stableContentPackageSourceDiagnosticPatterns: readonly RegExp[] = [
  /^Package path exceeds \d+ UTF-8 bytes: \d+$/,
  /^Package path exceeds \d+ segments: \d+$/,
  /^Directory listing exceeds \d+ entries: \d+$/,
  /^Archive exceeds \d+ entries: \d+$/,
  /^(?:uncompressedSizeBytes|compressedSizeBytes) must be a non-negative safe integer$/,
  /^Archive entry exceeds \d+ bytes: \d+$/,
  /^Archive exceeds \d+ total uncompressed bytes: \d+$/,
  /^Archive exceeds \d+ total compressed bytes: \d+$/,
  /^Archive entry exceeds \d+:1 compression ratio$/,
  /^Source text file exceeds \d+ bytes: \d+$/,
  /^Memory source exceeds \d+ files: \d+$/
]

const isStableContentPackageSourceDiagnosticMessage = (message: string): boolean =>
  stableContentPackageSourceDiagnosticMessages.has(message)
  || stableContentPackageSourceDiagnosticPatterns.some(pattern => pattern.test(message))

const sourceErrorMayContainUnsafeDiagnosticText = (
  message: string,
  sourcePath: string | undefined
): boolean =>
  !isStableContentPackageSourceDiagnosticMessage(message)
  || mayContainHostPath(message)
  || hasUnsafePathControlCharacter(message)
  || (sourcePath !== undefined && (
    mayContainHostPath(sourcePath)
    || hasUnsafePathControlCharacter(sourcePath)
  ))

const jsonParseFailureMessage = (error: unknown): string => {
  const message = errorMessage(error)
  return mayContainHostPath(message) || hasUnsafePathControlCharacter(message)
    ? 'JSON parsing failed'
    : message
}

const sourceErrorPathMatchesOperation = (
  errorSourcePath: string | undefined,
  sourcePath: string
): boolean =>
  errorSourcePath === undefined || errorSourcePath === sourcePath

const createCleanContentPackageSourceError = (
  code: ContentPackageSourceErrorCode,
  message: string,
  sourcePath?: string
): ContentPackageSourceError =>
  new ContentPackageSourceError(code, message, sourcePath)

export const toContentPackageSourceHostOperationError = (
  operation: ContentPackageSourceHostOperation,
  error: unknown,
  sourcePath: string,
  fallbackCode: ContentPackageSourceErrorCode = 'SOURCE_ENTRY_NOT_FOUND'
): ContentPackageSourceError => {
  if (error instanceof ContentPackageSourceError) {
    const code = readStringErrorField(error, 'code')
    const message = readStringErrorField(error, 'message')
    const errorSourcePath = readStringErrorField(error, 'sourcePath')
    const metadataUnreadable =
      code.status === 'unreadable'
      || message.status !== 'value'
      || errorSourcePath.status === 'unreadable'
    const hasSafeCode = code.status === 'value' && isContentPackageSourceErrorCode(code.value)
    const safeCode = hasSafeCode ? code.value : fallbackCode
    const safeSourcePath = errorSourcePath.status === 'value' ? errorSourcePath.value : undefined

    if (
      !metadataUnreadable
      && hasSafeCode
      && !sourceErrorMayContainUnsafeDiagnosticText(message.value, safeSourcePath)
      && sourceErrorPathMatchesOperation(safeSourcePath, sourcePath)
    ) {
      return createCleanContentPackageSourceError(safeCode, message.value, safeSourcePath)
    }

    return createCleanContentPackageSourceError(
      safeCode,
      `Content package source ${operation} operation failed`,
      sourcePath
    )
  }
  return createCleanContentPackageSourceError(
    fallbackCode,
    `Content package source ${operation} operation failed`,
    sourcePath
  )
}

export const CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS: ContentPackageSourceSafeReadPolicy = Object.freeze({
  maxPackageFileCount: 20_000,
  maxPackageCompressedBytes: 256 * 1024 * 1024,
  maxPackageUncompressedBytes: 1024 * 1024 * 1024,
  maxSingleFileBytes: 256 * 1024 * 1024,
  maxCompressedRatio: 100,
  maxPathUtf8Bytes: 512,
  maxPathDepth: 32
})
const supportedSourceKinds = new Set<ContentPackageSourceKind>([
  'memory',
  'developer-cli-directory',
  'electron-readonly-directory-probe'
])
const supportedEntryKinds = new Set<ContentPackageSourceEntryKind>(['file', 'directory', 'other'])
const supportedSourceIdentityMetadataKeys = new Set(['contractVersion', 'kind', 'sourceId', 'rootPath'])
const supportedDirectoryEntryMetadataKeys = new Set(['name', 'kind', 'isSymbolicLink'])
const supportedArchiveEntryMetadataKeys = new Set(['path', 'uncompressedSizeBytes', 'compressedSizeBytes'])
const supportedMemorySourceOptionsMetadataKeys = new Set(['sourceId', 'rootPath', 'files'])
const supportedMemorySourceFileMetadataKeys = new Set(['path', 'text'])
const requiredSourceIdentityMetadataKeys = ['contractVersion', 'kind', 'sourceId', 'rootPath'] as const
const requiredDirectoryEntryMetadataKeys = ['name', 'kind', 'isSymbolicLink'] as const
const requiredArchiveEntryMetadataKeys = ['path', 'uncompressedSizeBytes'] as const
const requiredMemorySourceOptionsMetadataKeys = ['sourceId', 'rootPath', 'files'] as const
const requiredMemorySourceFileMetadataKeys = ['path', 'text'] as const

const throwLimitExceeded = (message: string, sourcePath?: string): never => {
  throw new ContentPackageSourceError('SOURCE_LIMIT_EXCEEDED', message, sourcePath)
}

const throwUnsafeSourcePath = (message = 'Content package source path is unsafe'): never => {
  throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', message)
}

const isUnknownArray = (
  value: unknown,
  code: ContentPackageSourceErrorCode,
  unreadableMessage: string
): value is unknown[] => {
  try {
    return Array.isArray(value)
  } catch {
    throw new ContentPackageSourceError(code, unreadableMessage)
  }
}

const readUnknownMetadataField = (
  metadata: Record<string, unknown>,
  fieldName: string,
  code: ContentPackageSourceErrorCode,
  message: string
): unknown => {
  try {
    return metadata[fieldName]
  } catch {
    throw new ContentPackageSourceError(code, message)
  }
}

const assertUnknownMetadataHasOnlyKeys = (
  metadata: Record<string, unknown>,
  allowedKeys: ReadonlySet<string>,
  code: ContentPackageSourceErrorCode,
  unreadableMessage: string,
  unsupportedMessage: string
): readonly string[] => {
  let metadataKeys: readonly (string | symbol)[]
  try {
    metadataKeys = Reflect.ownKeys(metadata)
  } catch {
    throw new ContentPackageSourceError(code, unreadableMessage)
  }
  const stringKeys: string[] = []
  for (const key of metadataKeys) {
    if (typeof key !== 'string' || !allowedKeys.has(key)) {
      throw new ContentPackageSourceError(code, unsupportedMessage)
    }
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(metadata, key)
    } catch {
      throw new ContentPackageSourceError(code, unreadableMessage)
    }
    if (descriptor?.enumerable !== true) {
      throw new ContentPackageSourceError(code, unsupportedMessage)
    }
    stringKeys.push(key)
  }
  return stringKeys
}

const assertUnknownMetadataHasRequiredOwnKeys = (
  metadataKeys: readonly string[],
  requiredKeys: readonly string[],
  code: ContentPackageSourceErrorCode,
  missingMessage: string
): void => {
  const ownKeys = new Set(metadataKeys)
  if (requiredKeys.some(key => !ownKeys.has(key))) {
    throw new ContentPackageSourceError(code, missingMessage)
  }
}

const isArrayIndexKey = (key: string, length: number): boolean => {
  if (!/^(0|[1-9]\d*)$/.test(key)) return false
  const index = Number(key)
  return Number.isSafeInteger(index) && index >= 0 && index < length
}

const readUnknownMetadataArray = (
  metadata: unknown,
  notArrayMessage: string,
  unsafeMessage: string,
  unreadableMessage: string,
  maxEntryCount?: number,
  limitMessage?: (entryCount: number) => string
): readonly unknown[] => {
  if (!isUnknownArray(metadata, 'SOURCE_ENTRY_UNSAFE', unreadableMessage)) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      notArrayMessage
    )
  }

  let entryCount: number
  try {
    entryCount = metadata.length
  } catch {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      unreadableMessage
    )
  }
  if (!Number.isSafeInteger(entryCount) || entryCount < 0) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      unsafeMessage
    )
  }
  if (maxEntryCount !== undefined && entryCount > maxEntryCount) {
    throwLimitExceeded(limitMessage?.(entryCount) ?? `Metadata array exceeds ${maxEntryCount} entries: ${entryCount}`)
  }

  let ownKeys: readonly (string | symbol)[]
  try {
    ownKeys = Reflect.ownKeys(metadata)
  } catch {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      unreadableMessage
    )
  }

  const ownIndexKeys = new Set<string>()
  for (const key of ownKeys) {
    if (
      typeof key !== 'string'
      || (key !== 'length' && !isArrayIndexKey(key, entryCount))
    ) {
      throw new ContentPackageSourceError(
        'SOURCE_ENTRY_UNSAFE',
        unsafeMessage
      )
    }
    if (key !== 'length') {
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(metadata, key)
      } catch {
        throw new ContentPackageSourceError(
          'SOURCE_ENTRY_UNSAFE',
          unreadableMessage
        )
      }
      if (descriptor?.enumerable !== true) {
        throw new ContentPackageSourceError(
          'SOURCE_ENTRY_UNSAFE',
          unsafeMessage
        )
      }
      ownIndexKeys.add(key)
    }
  }

  const entries: unknown[] = []
  for (let index = 0; index < entryCount; index += 1) {
    if (!ownIndexKeys.has(String(index))) {
      throw new ContentPackageSourceError(
        'SOURCE_ENTRY_UNSAFE',
        unsafeMessage
      )
    }
    try {
      entries.push(metadata[index])
    } catch {
      throw new ContentPackageSourceError(
        'SOURCE_ENTRY_UNSAFE',
        unreadableMessage
      )
    }
  }
  return entries
}

const assertNormalizedPathWithinLimits = (
  normalizedPath: string,
  originalPath: string,
  policy: ContentPackageSourceSafeReadPolicy
): void => {
  if (normalizedPath === '') return
  const pathBytes = utf8ByteLength(normalizedPath)
  if (pathBytes > policy.maxPathUtf8Bytes) {
    throwLimitExceeded(
      `Package path exceeds ${policy.maxPathUtf8Bytes} UTF-8 bytes: ${pathBytes}`,
      originalPath
    )
  }
  const depth = normalizedPath.split('/').length
  if (depth > policy.maxPathDepth) {
    throwLimitExceeded(`Package path exceeds ${policy.maxPathDepth} segments: ${depth}`, originalPath)
  }
}

export const normalizeContentPackageSourcePath = (
  path: unknown,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): string => {
  if (typeof path !== 'string') return throwUnsafeSourcePath()
  if (path === '') return ''
  if (hasUnsafePathControlCharacter(path)) return throwUnsafeSourcePath()
  try {
    const normalizedPath = normalizePackagePath(path)
    assertNormalizedPathWithinLimits(normalizedPath, path, policy)
    return normalizedPath
  } catch (error) {
    if (error instanceof ContentPackageSourceError) throw error
    return throwUnsafeSourcePath()
  }
}

export const normalizeContentPackageSourceEntryName = (
  name: unknown,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): string => {
  let normalizedName: string
  try {
    normalizedName = normalizeContentPackageSourcePath(name, policy)
  } catch (error) {
    if (error instanceof ContentPackageSourceError) throw error
    return throwUnsafeSourcePath('Content package source entry name is unsafe')
  }
  if (normalizedName === '' || normalizedName !== name || normalizedName.includes('/')) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      'Content package source entry names must be single normalized path segments'
    )
  }
  return normalizedName
}

export const normalizeContentPackageSourceDirectoryEntry = (
  entry: unknown,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): ContentPackageSourceDirectoryEntry => {
  if (
    typeof entry !== 'object'
    || entry === null
    || isUnknownArray(entry, 'SOURCE_ENTRY_UNSAFE', 'Content package source entry metadata could not be read')
  ) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Content package source entry metadata must be an object'
    )
  }

  const entryMetadata = entry as Record<string, unknown>
  const metadataKeys = assertUnknownMetadataHasOnlyKeys(
    entryMetadata,
    supportedDirectoryEntryMetadataKeys,
    'SOURCE_ENTRY_UNSAFE',
    'Content package source entry metadata could not be read',
    'Content package source entry metadata contains unsupported fields'
  )
  assertUnknownMetadataHasRequiredOwnKeys(
    metadataKeys,
    requiredDirectoryEntryMetadataKeys,
    'SOURCE_ENTRY_UNSAFE',
    'Content package source entry metadata must include name, kind and isSymbolicLink own fields'
  )
  const name = readUnknownMetadataField(
    entryMetadata,
    'name',
    'SOURCE_ENTRY_UNSAFE',
    'Content package source entry metadata could not be read'
  )
  if (typeof name !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Content package source entry name metadata must be a string'
    )
  }
  const normalizedName = normalizeContentPackageSourceEntryName(name, policy)

  const kind = readUnknownMetadataField(
    entryMetadata,
    'kind',
    'SOURCE_ENTRY_UNSAFE',
    'Content package source entry metadata could not be read'
  )
  if (typeof kind !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Unsupported content package source entry kind'
    )
  }
  if (!supportedEntryKinds.has(kind as ContentPackageSourceEntryKind)) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Unsupported content package source entry kind'
    )
  }

  const isSymbolicLink = readUnknownMetadataField(
    entryMetadata,
    'isSymbolicLink',
    'SOURCE_ENTRY_UNSAFE',
    'Content package source entry metadata could not be read'
  )
  if (typeof isSymbolicLink !== 'boolean') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Content package source entry must expose an explicit symbolic-link flag'
    )
  }

  const unknownEntry: ContentPackageSourceUnknownDirectoryEntry = { name, kind, isSymbolicLink }
  return freezeContentPackageSourceDirectoryEntry({
    name: normalizedName,
    kind: unknownEntry.kind as ContentPackageSourceEntryKind,
    isSymbolicLink: unknownEntry.isSymbolicLink
  })
}

export const normalizeContentPackageSourceDirectoryEntries = (
  entries: unknown,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): readonly ContentPackageSourceDirectoryEntry[] => {
  const metadataEntries = readUnknownMetadataArray(
    entries,
    'Content package source directory entries metadata must be an array',
    'Content package source directory entries metadata must be a dense JSON array',
    'Content package source directory entries metadata could not be read',
    policy.maxPackageFileCount,
    entryCount => `Directory listing exceeds ${policy.maxPackageFileCount} entries: ${entryCount}`
  )

  const seenNames = new Set<string>()
  const normalizedEntries = metadataEntries.map(entry => {
    const normalizedEntry = normalizeContentPackageSourceDirectoryEntry(entry, policy)
    if (seenNames.has(normalizedEntry.name)) {
      throw new ContentPackageSourceError(
        'SOURCE_DUPLICATE_PATH',
        'Duplicate source directory entry'
      )
    }
    seenNames.add(normalizedEntry.name)
    return Object.freeze(normalizedEntry)
  })
  return Object.freeze(normalizedEntries.sort((a, b) => compareCodePoints(a.name, b.name)))
}

export const normalizeContentPackageSourceArchiveEntryPath = (
  path: unknown,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): string => {
  if (typeof path !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      'Archive entry paths must be non-empty normalized POSIX paths'
    )
  }
  if (path === '' || path.includes('\\') || hasUnsafePathControlCharacter(path)) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      'Archive entry paths must be non-empty normalized POSIX paths'
    )
  }

  const normalizedPath = normalizeContentPackageSourcePath(path, policy)
  if (normalizedPath === '' || normalizedPath !== path) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      'Archive entry paths must already be normalized before validation'
    )
  }
  return normalizedPath
}

const assertNonNegativeSafeInteger = (value: unknown, fieldName: string, sourcePath: string): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new ContentPackageSourceError(
      'SOURCE_LIMIT_EXCEEDED',
      `${fieldName} must be a non-negative safe integer`,
      sourcePath
    )
  }
  return value
}

const normalizeContentPackageSourceArchiveEntryPathMetadata = (
  entry: unknown,
  policy: ContentPackageSourceSafeReadPolicy
): ContentPackageSourceArchiveEntryPathMetadata => {
  if (
    typeof entry !== 'object'
    || entry === null
    || isUnknownArray(entry, 'SOURCE_ENTRY_UNSAFE', 'Archive entry metadata could not be read')
  ) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Archive entry metadata must be an object'
    )
  }

  const entryMetadata = entry as Record<string, unknown>
  const metadataKeys = assertUnknownMetadataHasOnlyKeys(
    entryMetadata,
    supportedArchiveEntryMetadataKeys,
    'SOURCE_ENTRY_UNSAFE',
    'Archive entry metadata could not be read',
    'Archive entry metadata contains unsupported fields'
  )
  assertUnknownMetadataHasRequiredOwnKeys(
    metadataKeys,
    requiredArchiveEntryMetadataKeys,
    'SOURCE_ENTRY_UNSAFE',
    'Archive entry metadata must include path and uncompressedSizeBytes own fields'
  )

  const path = readUnknownMetadataField(
    entryMetadata,
    'path',
    'SOURCE_ENTRY_UNSAFE',
    'Archive entry metadata could not be read'
  )
  if (typeof path !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Archive entry path metadata must be a string'
    )
  }
  const normalizedPath = normalizeContentPackageSourceArchiveEntryPath(path, policy)

  return {
    path: normalizedPath,
    entryMetadata,
    metadataKeys
  }
}

const readContentPackageSourceArchiveEntrySizeMetadata = (
  entry: ContentPackageSourceArchiveEntryPathMetadata
): ContentPackageSourceUnknownArchiveEntry => {
  const uncompressedSizeBytes = readUnknownMetadataField(
    entry.entryMetadata,
    'uncompressedSizeBytes',
    'SOURCE_ENTRY_UNSAFE',
    'Archive entry metadata could not be read'
  )
  const compressedSizeBytes = entry.metadataKeys.includes('compressedSizeBytes')
    ? readUnknownMetadataField(
      entry.entryMetadata,
      'compressedSizeBytes',
      'SOURCE_ENTRY_UNSAFE',
      'Archive entry metadata could not be read'
    )
    : undefined
  return compressedSizeBytes === undefined
    ? { path: entry.path, uncompressedSizeBytes }
    : { path: entry.path, uncompressedSizeBytes, compressedSizeBytes }
}

const collectAncestorPaths = (path: string): readonly string[] => {
  const ancestors: string[] = []
  let separatorIndex = path.indexOf('/')
  while (separatorIndex !== -1) {
    ancestors.push(path.slice(0, separatorIndex))
    separatorIndex = path.indexOf('/', separatorIndex + 1)
  }
  return ancestors
}

export const validateContentPackageSourceArchiveEntries = (
  entries: unknown,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): readonly ContentPackageSourceValidatedArchiveEntry[] => {
  const metadataEntries = readUnknownMetadataArray(
    entries,
    'Archive entries metadata must be an array',
    'Archive entries metadata must be a dense JSON array',
    'Archive entries metadata could not be read',
    policy.maxPackageFileCount,
    entryCount => `Archive exceeds ${policy.maxPackageFileCount} entries: ${entryCount}`
  )

  const normalizedEntries = metadataEntries
    .map(entry => {
      const metadata = normalizeContentPackageSourceArchiveEntryPathMetadata(entry, policy)
      return {
        entry: metadata,
        path: metadata.path
      }
    })
    .sort((a, b) => compareCodePoints(a.path, b.path))

  const seenPaths = new Set<string>()
  const seenAncestorPaths = new Set<string>()
  for (const { path } of normalizedEntries) {
    if (seenPaths.has(path)) {
      throw new ContentPackageSourceError('SOURCE_DUPLICATE_PATH', 'Duplicate archive entry path')
    }
    if (seenAncestorPaths.has(path) || collectAncestorPaths(path).some(ancestorPath => seenPaths.has(ancestorPath))) {
      throw new ContentPackageSourceError(
        'SOURCE_DUPLICATE_PATH',
        'Archive entry path conflicts with another entry directory prefix'
      )
    }
    seenPaths.add(path)
    for (const ancestorPath of collectAncestorPaths(path)) {
      seenAncestorPaths.add(ancestorPath)
    }
  }

  let totalCompressedBytes = 0
  let totalUncompressedBytes = 0
  const validatedEntries = normalizedEntries.map(({ entry, path }) => {
    const entrySizeMetadata = readContentPackageSourceArchiveEntrySizeMetadata(entry)
    const uncompressedSizeBytes = assertNonNegativeSafeInteger(
      entrySizeMetadata.uncompressedSizeBytes,
      'uncompressedSizeBytes',
      path
    )
    if (uncompressedSizeBytes > policy.maxSingleFileBytes) {
      throwLimitExceeded(
        `Archive entry exceeds ${policy.maxSingleFileBytes} bytes: ${uncompressedSizeBytes}`,
        path
      )
    }
    totalUncompressedBytes += uncompressedSizeBytes
    if (totalUncompressedBytes > policy.maxPackageUncompressedBytes) {
      throwLimitExceeded(
        `Archive exceeds ${policy.maxPackageUncompressedBytes} total uncompressed bytes: ${totalUncompressedBytes}`,
        path
      )
    }

    if (entrySizeMetadata.compressedSizeBytes === undefined) {
      return Object.freeze({ path, uncompressedSizeBytes })
    }

    const compressedSizeBytes = assertNonNegativeSafeInteger(
      entrySizeMetadata.compressedSizeBytes,
      'compressedSizeBytes',
      path
    )
    totalCompressedBytes += compressedSizeBytes
    if (totalCompressedBytes > policy.maxPackageCompressedBytes) {
      throwLimitExceeded(
        `Archive exceeds ${policy.maxPackageCompressedBytes} total compressed bytes: ${totalCompressedBytes}`,
        path
      )
    }
    if (
      (compressedSizeBytes === 0 && uncompressedSizeBytes > 0)
      || (compressedSizeBytes > 0 && uncompressedSizeBytes / compressedSizeBytes > policy.maxCompressedRatio)
    ) {
      throwLimitExceeded(`Archive entry exceeds ${policy.maxCompressedRatio}:1 compression ratio`, path)
    }
    return Object.freeze({ path, uncompressedSizeBytes, compressedSizeBytes })
  })
  return Object.freeze(validatedEntries)
}

export const assertContentPackageSourceTextWithinLimits = (
  text: unknown,
  sourcePath: string,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): string => {
  const diagnosticSourcePath = normalizeContentPackageSourceDiagnosticPath(sourcePath)
  const normalizedText = normalizeContentPackageSourceTextPayload(text, diagnosticSourcePath)
  const textBytes = utf8ByteLength(normalizedText)
  if (textBytes > policy.maxSingleFileBytes) {
    throwLimitExceeded(
      `Source text file exceeds ${policy.maxSingleFileBytes} bytes: ${textBytes}`,
      diagnosticSourcePath
    )
  }
  return normalizedText
}

const normalizeContentPackageSourceDiagnosticPath = (sourcePath: string): string | undefined => {
  try {
    const normalizedSourcePath = normalizeContentPackageSourcePath(sourcePath)
    return normalizedSourcePath === sourcePath ? normalizedSourcePath : undefined
  } catch {
    return undefined
  }
}

export const normalizeContentPackageSourceTextPayload = (
  text: unknown,
  sourcePath: string | undefined
): string => {
  if (typeof text !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Content package source text payload must be a string',
      sourcePath
    )
  }
  return text
}

const inspectContentPackageSourceReadableFile = async(
  source: ContentPackageSource,
  path: string,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  sourceIdentity?: ContentPackageSourceIdentity
): Promise<string> => {
  const normalizedPath = normalizeContentPackageSourcePath(path, policy)
  let inspectedEntry: ContentPackageSourceDirectoryEntry | null
  try {
    inspectedEntry = await source.getEntry(normalizedPath)
  } catch (error) {
    throw toContentPackageSourceHostOperationError('inspect', error, normalizedPath)
  }
  if (inspectedEntry === null) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_NOT_FOUND',
      'Source path was not found',
      normalizedPath
    )
  }
  const entry = normalizeInspectedContentPackageSourceEntry(
    source,
    normalizedPath,
    inspectedEntry,
    policy,
    sourceIdentity
  )
  if (entry.isSymbolicLink) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      'Source path must not be a symbolic link',
      normalizedPath
    )
  }
  if (entry.kind !== 'file') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_NOT_FILE',
      'Source path is not a file',
      normalizedPath
    )
  }
  return normalizedPath
}

const inspectContentPackageSourceReadableDirectory = async(
  source: ContentPackageSource,
  path: string,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  sourceIdentity?: ContentPackageSourceIdentity
): Promise<string> => {
  const normalizedPath = normalizeContentPackageSourcePath(path, policy)
  let inspectedEntry: ContentPackageSourceDirectoryEntry | null
  try {
    inspectedEntry = await source.getEntry(normalizedPath)
  } catch (error) {
    throw toContentPackageSourceHostOperationError('inspect', error, normalizedPath)
  }
  if (inspectedEntry === null) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_NOT_FOUND',
      'Source path was not found',
      normalizedPath
    )
  }
  const entry = normalizeInspectedContentPackageSourceEntry(
    source,
    normalizedPath,
    inspectedEntry,
    policy,
    sourceIdentity
  )
  if (entry.isSymbolicLink) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      'Source path must not be a symbolic link',
      normalizedPath
    )
  }
  if (entry.kind !== 'directory') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_NOT_DIRECTORY',
      'Source path is not a directory',
      normalizedPath
    )
  }
  return normalizedPath
}

const parentPath = (path: string): string => {
  const separatorIndex = path.lastIndexOf('/')
  return separatorIndex === -1 ? '' : path.slice(0, separatorIndex)
}

const entryName = (path: string, fallback: string): string => {
  if (path === '') return fallback
  const separatorIndex = path.lastIndexOf('/')
  return separatorIndex === -1 ? path : path.slice(separatorIndex + 1)
}

const normalizeMemoryContentPackageSourceFile = (
  file: unknown
): MemoryContentPackageSourceFile => {
  if (
    typeof file !== 'object'
    || file === null
    || isUnknownArray(file, 'SOURCE_ENTRY_UNSAFE', 'Memory source file metadata could not be read')
  ) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Memory source file metadata must be an object'
    )
  }

  const fileMetadata = file as Record<string, unknown>
  const metadataKeys = assertUnknownMetadataHasOnlyKeys(
    fileMetadata,
    supportedMemorySourceFileMetadataKeys,
    'SOURCE_ENTRY_UNSAFE',
    'Memory source file metadata could not be read',
    'Memory source file metadata contains unsupported fields'
  )
  assertUnknownMetadataHasRequiredOwnKeys(
    metadataKeys,
    requiredMemorySourceFileMetadataKeys,
    'SOURCE_ENTRY_UNSAFE',
    'Memory source file metadata must include path and text own fields'
  )

  const path = readUnknownMetadataField(
    fileMetadata,
    'path',
    'SOURCE_ENTRY_UNSAFE',
    'Memory source file metadata could not be read'
  )
  if (typeof path !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Memory source file path metadata must be a string'
    )
  }

  const text = readUnknownMetadataField(
    fileMetadata,
    'text',
    'SOURCE_ENTRY_UNSAFE',
    'Memory source file metadata could not be read'
  )
  if (typeof text !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Memory source file text payload must be a string'
    )
  }

  return {
    path: normalizeContentPackageSourcePath(path),
    text
  }
}

const normalizeMemoryContentPackageSourceOptions = (
  options: unknown
): CreateMemoryContentPackageSourceOptions => {
  if (
    typeof options !== 'object'
    || options === null
    || isUnknownArray(options, 'SOURCE_IDENTITY_INVALID', 'Memory source options metadata could not be read')
  ) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'Memory source options metadata must be an object'
    )
  }

  const optionsMetadata = options as Record<string, unknown>
  const metadataKeys = assertUnknownMetadataHasOnlyKeys(
    optionsMetadata,
    supportedMemorySourceOptionsMetadataKeys,
    'SOURCE_IDENTITY_INVALID',
    'Memory source options metadata could not be read',
    'Memory source options metadata contains unsupported fields'
  )
  assertUnknownMetadataHasRequiredOwnKeys(
    metadataKeys,
    requiredMemorySourceOptionsMetadataKeys,
    'SOURCE_IDENTITY_INVALID',
    'Memory source options metadata must include sourceId, rootPath and files own fields'
  )

  const sourceIdInput = readUnknownMetadataField(
    optionsMetadata,
    'sourceId',
    'SOURCE_IDENTITY_INVALID',
    'Memory source options metadata could not be read'
  )
  if (typeof sourceIdInput !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'sourceId must be a normalized relative identifier'
    )
  }
  const sourceId = normalizeIdentityPart(sourceIdInput, 'sourceId')

  const rootPathInput = readUnknownMetadataField(
    optionsMetadata,
    'rootPath',
    'SOURCE_IDENTITY_INVALID',
    'Memory source options metadata could not be read'
  )
  if (typeof rootPathInput !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'rootPath must be a normalized relative identifier'
    )
  }
  const rootPath = normalizeIdentityPart(rootPathInput, 'rootPath')

  const files = readUnknownMetadataField(
    optionsMetadata,
    'files',
    'SOURCE_IDENTITY_INVALID',
    'Memory source options metadata could not be read'
  )

  return {
    sourceId,
    rootPath,
    files: files as readonly MemoryContentPackageSourceFile[]
  }
}

const asIdentityObject = (identity: unknown): Record<string, unknown> => {
  if (
    typeof identity !== 'object'
    || identity === null
    || isUnknownArray(identity, 'SOURCE_IDENTITY_INVALID', 'Content package source identity metadata could not be read')
  ) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'Content package source identity must be an object'
    )
  }
  return identity as Record<string, unknown>
}

const normalizeIdentityPart = (value: string, fieldName: string): string => {
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

const freezeContentPackageSourceIdentity = (
  identity: ContentPackageSourceIdentity
): ContentPackageSourceIdentity => Object.freeze(identity)

const freezeContentPackageSourceDirectoryEntry = (
  entry: ContentPackageSourceDirectoryEntry
): ContentPackageSourceDirectoryEntry => Object.freeze(entry)

export const validateContentPackageSourceIdentity = (
  identity: unknown
): ContentPackageSourceIdentity => {
  const identityObject = asIdentityObject(identity)
  const metadataKeys = assertUnknownMetadataHasOnlyKeys(
    identityObject,
    supportedSourceIdentityMetadataKeys,
    'SOURCE_IDENTITY_INVALID',
    'Content package source identity metadata could not be read',
    'Content package source identity metadata contains unsupported fields'
  )
  assertUnknownMetadataHasRequiredOwnKeys(
    metadataKeys,
    requiredSourceIdentityMetadataKeys,
    'SOURCE_IDENTITY_INVALID',
    'Content package source identity metadata must include contractVersion, kind, sourceId and rootPath own fields'
  )
  const contractVersion = readUnknownMetadataField(
    identityObject,
    'contractVersion',
    'SOURCE_IDENTITY_INVALID',
    'Content package source identity metadata could not be read'
  )
  const kind = readUnknownMetadataField(
    identityObject,
    'kind',
    'SOURCE_IDENTITY_INVALID',
    'Content package source identity metadata could not be read'
  )
  const sourceIdInput = readUnknownMetadataField(
    identityObject,
    'sourceId',
    'SOURCE_IDENTITY_INVALID',
    'Content package source identity metadata could not be read'
  )
  const rootPathInput = readUnknownMetadataField(
    identityObject,
    'rootPath',
    'SOURCE_IDENTITY_INVALID',
    'Content package source identity metadata could not be read'
  )

  if (contractVersion !== CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'Unsupported content package source contract version'
    )
  }
  if (typeof kind !== 'string' || !supportedSourceKinds.has(kind as ContentPackageSourceKind)) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'Unsupported content package source kind'
    )
  }
  const sourceKind = kind as ContentPackageSourceKind
  if (typeof sourceIdInput !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'sourceId must be a normalized relative identifier'
    )
  }
  if (typeof rootPathInput !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'rootPath must be a normalized relative identifier'
    )
  }

  const sourceId = normalizeIdentityPart(sourceIdInput, 'sourceId')
  const rootPath = normalizeIdentityPart(rootPathInput, 'rootPath')
  if (sourceId !== sourceIdInput || rootPath !== rootPathInput) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'Content package source identity must already use normalized relative sourceId and rootPath'
    )
  }

  return freezeContentPackageSourceIdentity({
    contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
    kind: sourceKind,
    sourceId,
    rootPath
  })
}

export const readContentPackageSourceIdentity = (
  source: ContentPackageSource,
  sourcePath = ''
): ContentPackageSourceIdentity => {
  let identity: unknown
  try {
    identity = source.identity
  } catch (error) {
    throw toContentPackageSourceHostOperationError(
      'identity',
      error,
      sourcePath,
      'SOURCE_IDENTITY_INVALID'
    )
  }
  return validateContentPackageSourceIdentity(identity)
}

const normalizeInspectedContentPackageSourceEntry = (
  source: ContentPackageSource,
  path: string,
  inspectedEntry: ContentPackageSourceDirectoryEntry,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  sourceIdentity?: ContentPackageSourceIdentity
): ContentPackageSourceDirectoryEntry => {
  const identity = sourceIdentity ?? readContentPackageSourceIdentity(source, path)
  const expectedName = entryName(path, entryName(identity.rootPath, identity.rootPath))
  const entry = normalizeContentPackageSourceDirectoryEntry(inspectedEntry, policy)
  if (entry.name !== expectedName) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Source entry name does not match requested path',
      path
    )
  }
  return entry
}

export const createMemoryContentPackageSource = (
  options: CreateMemoryContentPackageSourceOptions
): RevocableContentPackageSource => {
  const normalizedOptions = normalizeMemoryContentPackageSourceOptions(options)
  const sourceId = normalizedOptions.sourceId
  const rootPath = normalizedOptions.rootPath
  const rootName = entryName(rootPath, rootPath)
  const files = new Map<string, string>()
  const directories = new Set<string>([''])
  let revoked = false
  let disposed = false

  const memoryFiles = readUnknownMetadataArray(
    normalizedOptions.files,
    'Memory source files metadata must be an array',
    'Memory source files metadata must be a dense JSON array',
    'Memory source files metadata could not be read',
    CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxPackageFileCount,
    fileCount => `Memory source exceeds ${CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxPackageFileCount} files: ${fileCount}`
  )

  for (const fileInput of memoryFiles) {
    const file = normalizeMemoryContentPackageSourceFile(fileInput)
    const normalizedPath = file.path
    if (normalizedPath === '') {
      throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', 'File path cannot be the source root', normalizedPath)
    }
    if (directories.has(normalizedPath)) {
      throw new ContentPackageSourceError(
        'SOURCE_DUPLICATE_PATH',
        'Source file path conflicts with a directory path'
      )
    }
    if (files.has(normalizedPath)) {
      throw new ContentPackageSourceError(
        'SOURCE_DUPLICATE_PATH',
        'Duplicate source file path'
      )
    }
    files.set(normalizedPath, file.text)

    let directory = parentPath(normalizedPath)
    while (directory !== '') {
      if (files.has(directory)) {
        throw new ContentPackageSourceError(
          'SOURCE_DUPLICATE_PATH',
          'Source directory path conflicts with a file path'
        )
      }
      directories.add(directory)
      directory = parentPath(directory)
    }
  }

  const assertAvailable = (): void => {
    if (disposed) {
      throw new ContentPackageSourceError('SOURCE_DISPOSED', 'Content package source has been disposed')
    }
    if (revoked) {
      throw new ContentPackageSourceError('SOURCE_PERMISSION_REVOKED', 'Content package source permission was revoked')
    }
  }

  const getEntry = (path: string): ContentPackageSourceDirectoryEntry | null => {
    const normalizedPath = normalizeContentPackageSourcePath(path)
    if (files.has(normalizedPath)) {
      return freezeContentPackageSourceDirectoryEntry({
        name: entryName(normalizedPath, rootName),
        kind: 'file',
        isSymbolicLink: false
      })
    }
    if (directories.has(normalizedPath)) {
      return freezeContentPackageSourceDirectoryEntry({
        name: entryName(normalizedPath, rootName),
        kind: 'directory',
        isSymbolicLink: false
      })
    }
    return null
  }

  const readDirectory = (path: string): readonly ContentPackageSourceDirectoryEntry[] => {
    const normalizedPath = normalizeContentPackageSourcePath(path)
    if (!directories.has(normalizedPath)) {
      throw new ContentPackageSourceError(
        'SOURCE_ENTRY_NOT_DIRECTORY',
        'Source path is not a directory',
        normalizedPath
      )
    }

    const entries = new Map<string, ContentPackageSourceDirectoryEntry>()
    for (const directoryPath of directories) {
      if (directoryPath === normalizedPath || parentPath(directoryPath) !== normalizedPath) continue
      entries.set(entryName(directoryPath, rootName), {
        name: entryName(directoryPath, rootName),
        kind: 'directory',
        isSymbolicLink: false
      })
    }
    for (const filePath of files.keys()) {
      if (parentPath(filePath) !== normalizedPath) continue
      entries.set(entryName(filePath, rootName), {
        name: entryName(filePath, rootName),
        kind: 'file',
        isSymbolicLink: false
      })
    }

    return normalizeContentPackageSourceDirectoryEntries([...entries.values()])
  }

  return {
    identity: freezeContentPackageSourceIdentity({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId,
      rootPath
    }),
    async getEntry(path) {
      assertAvailable()
      return getEntry(path)
    },
    async readDirectory(path) {
      assertAvailable()
      return readDirectory(path)
    },
    async readTextFile(path) {
      assertAvailable()
      const normalizedPath = normalizeContentPackageSourcePath(path)
      const text = files.get(normalizedPath)
      if (text === undefined) {
        const entry = getEntry(normalizedPath)
        throw new ContentPackageSourceError(
          entry?.kind === 'directory' ? 'SOURCE_ENTRY_NOT_FILE' : 'SOURCE_ENTRY_NOT_FOUND',
          entry?.kind === 'directory' ? 'Source path is not a file' : 'Source path was not found',
          normalizedPath
        )
      }
      return text
    },
    async dispose() {
      disposed = true
    },
    revoke() {
      revoked = true
    }
  }
}

export const readContentPackageSourceJson = async (
  source: ContentPackageSource,
  path: string,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  sourceIdentity?: unknown
): Promise<ContentPackageSourceJsonReadResult> => {
  let text: string
  try {
    const validatedSourceIdentity = sourceIdentity === undefined
      ? undefined
      : validateContentPackageSourceIdentity(sourceIdentity)
    const normalizedPath = await inspectContentPackageSourceReadableFile(
      source,
      path,
      policy,
      validatedSourceIdentity
    )
    try {
      text = assertContentPackageSourceTextWithinLimits(await source.readTextFile(normalizedPath), normalizedPath, policy)
    } catch (error) {
      throw toContentPackageSourceHostOperationError('read', error, normalizedPath)
    }
  } catch (error) {
    if (error instanceof ContentPackageSourceError) {
      return freezeContentPackageSourceJsonReadResult({ ok: false, code: error.code, message: error.message })
    }
    return freezeContentPackageSourceJsonReadResult({
      ok: false,
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: errorMessage(error)
    })
  }

  let data: unknown
  try {
    data = JSON.parse(text) as unknown
  } catch (error) {
    return freezeContentPackageSourceJsonReadResult({
      ok: false,
      code: 'SOURCE_JSON_PARSE_FAILED',
      message: jsonParseFailureMessage(error)
    })
  }

  try {
    assertPureJsonValue(data)
  } catch (error) {
    return freezeContentPackageSourceJsonReadResult({
      ok: false,
      code: 'SOURCE_JSON_NOT_PURE',
      message: errorMessage(error)
    })
  }

  return freezeContentPackageSourceJsonReadResult({ ok: true, data })
}

const stripDiscoveryRoot = (
  source: ContentPackageSource,
  path: string,
  sourceIdentity?: ContentPackageSourceIdentity
): string => {
  const identity = sourceIdentity ?? readContentPackageSourceIdentity(source, path)
  let normalizedPath: string
  try {
    normalizedPath = normalizeContentPackageSourcePath(path)
  } catch (error) {
    if (error instanceof ContentPackageSourceError && error.code !== 'SOURCE_PATH_UNSAFE') throw error
    return throwUnsafeSourcePath('Content package discovery path is unsafe')
  }

  const rootPath = identity.rootPath
  if (normalizedPath === rootPath) return ''
  const rootPrefix = `${rootPath}/`
  if (!normalizedPath.startsWith(rootPrefix)) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_OUTSIDE_ROOT',
      'Discovery path is outside source root',
      normalizedPath
    )
  }
  return normalizedPath.slice(rootPrefix.length)
}

const toDiscoveryEntry = (
  source: ContentPackageSource,
  sourcePath: string,
  entry: ContentPackageSourceDirectoryEntry | null,
  sourceIdentity?: ContentPackageSourceIdentity
): ThirdPartyDiscoveryDirectoryEntry | null =>
  entry === null ? null : normalizeInspectedContentPackageSourceEntry(
    source,
    sourcePath,
    entry,
    CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
    sourceIdentity
  )

export const createDiscoveryFileSystemFromContentPackageSource = (
  source: ContentPackageSource
): ThirdPartyDiscoveryFileSystem => {
  let validatedIdentity: ContentPackageSourceIdentity | undefined
  const readBridgeIdentity = (path: string): ContentPackageSourceIdentity => {
    if (validatedIdentity !== undefined) return validatedIdentity
    validatedIdentity = readContentPackageSourceIdentity(source, path)
    return validatedIdentity
  }

  return {
    async getEntry(path) {
      const sourceIdentity = readBridgeIdentity(path)
      const sourcePath = stripDiscoveryRoot(source, path, sourceIdentity)
      let entry: ContentPackageSourceDirectoryEntry | null
      try {
        entry = await source.getEntry(sourcePath)
      } catch (error) {
        throw toContentPackageSourceHostOperationError('inspect', error, sourcePath)
      }
      return toDiscoveryEntry(source, sourcePath, entry, sourceIdentity)
    },
    async readDirectory(path) {
      const sourceIdentity = readBridgeIdentity(path)
      const sourcePath = stripDiscoveryRoot(source, path, sourceIdentity)
      const readableDirectoryPath = await inspectContentPackageSourceReadableDirectory(
        source,
        sourcePath,
        CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
        sourceIdentity
      )
      let entries: readonly ContentPackageSourceDirectoryEntry[]
      try {
        entries = await source.readDirectory(readableDirectoryPath)
      } catch (error) {
        throw toContentPackageSourceHostOperationError(
          'list',
          error,
          readableDirectoryPath,
          'SOURCE_ENTRY_NOT_DIRECTORY'
        )
      }
      return normalizeContentPackageSourceDirectoryEntries(entries)
    },
    async readTextFile(path) {
      const sourceIdentity = readBridgeIdentity(path)
      const sourcePath = stripDiscoveryRoot(source, path, sourceIdentity)
      const readableFilePath = await inspectContentPackageSourceReadableFile(
        source,
        sourcePath,
        CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
        sourceIdentity
      )
      let text: string
      try {
        text = assertContentPackageSourceTextWithinLimits(await source.readTextFile(readableFilePath), readableFilePath)
      } catch (error) {
        throw toContentPackageSourceHostOperationError('read', error, readableFilePath)
      }
      return text
    }
  }
}
