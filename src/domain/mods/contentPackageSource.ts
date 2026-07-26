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

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error)
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

const sourceErrorMayContainHostPath = (error: ContentPackageSourceError): boolean =>
  mayContainHostPath(error.message)
  || (error.sourcePath !== undefined && mayContainHostPath(error.sourcePath))

export const toContentPackageSourceHostOperationError = (
  operation: ContentPackageSourceHostOperation,
  error: unknown,
  sourcePath: string,
  fallbackCode: ContentPackageSourceErrorCode = 'SOURCE_ENTRY_NOT_FOUND'
): ContentPackageSourceError => {
  if (error instanceof ContentPackageSourceError && !sourceErrorMayContainHostPath(error)) return error
  return new ContentPackageSourceError(
    error instanceof ContentPackageSourceError ? error.code : fallbackCode,
    `Content package source ${operation} operation failed`,
    sourcePath
  )
}

export const CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS: ContentPackageSourceSafeReadPolicy = Object.freeze({
  maxPackageFileCount: 20_000,
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

const throwLimitExceeded = (message: string, sourcePath?: string): never => {
  throw new ContentPackageSourceError('SOURCE_LIMIT_EXCEEDED', message, sourcePath)
}

const throwUnsafeSourcePath = (message = 'Content package source path is unsafe'): never => {
  throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', message)
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
  path: string,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): string => {
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
  name: string,
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
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Content package source entry metadata must be an object'
    )
  }

  const name = (entry as { readonly name?: unknown }).name
  if (typeof name !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Content package source entry name metadata must be a string'
    )
  }

  const kind = (entry as { readonly kind?: unknown }).kind
  if (typeof kind !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Unsupported content package source entry kind'
    )
  }

  const isSymbolicLink = (entry as { readonly isSymbolicLink?: unknown }).isSymbolicLink
  if (typeof isSymbolicLink !== 'boolean') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Content package source entry must expose an explicit symbolic-link flag'
    )
  }

  const unknownEntry: ContentPackageSourceUnknownDirectoryEntry = { name, kind, isSymbolicLink }
  if (!supportedEntryKinds.has(unknownEntry.kind as ContentPackageSourceEntryKind)) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Unsupported content package source entry kind'
    )
  }
  return {
    name: normalizeContentPackageSourceEntryName(unknownEntry.name, policy),
    kind: unknownEntry.kind as ContentPackageSourceEntryKind,
    isSymbolicLink: unknownEntry.isSymbolicLink
  }
}

export const normalizeContentPackageSourceDirectoryEntries = (
  entries: unknown,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): readonly ContentPackageSourceDirectoryEntry[] => {
  if (!Array.isArray(entries)) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Content package source directory entries metadata must be an array'
    )
  }
  if (entries.length > policy.maxPackageFileCount) {
    throwLimitExceeded(
      `Directory listing exceeds ${policy.maxPackageFileCount} entries: ${entries.length}`
    )
  }

  const seenNames = new Set<string>()
  const normalizedEntries = entries.map(entry => {
    const normalizedEntry = normalizeContentPackageSourceDirectoryEntry(entry, policy)
    if (seenNames.has(normalizedEntry.name)) {
      throw new ContentPackageSourceError(
        'SOURCE_DUPLICATE_PATH',
        `Duplicate source directory entry: ${normalizedEntry.name}`,
        normalizedEntry.name
      )
    }
    seenNames.add(normalizedEntry.name)
    return normalizedEntry
  })
  return normalizedEntries.sort((a, b) => compareCodePoints(a.name, b.name))
}

export const normalizeContentPackageSourceArchiveEntryPath = (
  path: string,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): string => {
  if (path === '' || path.includes('\\')) {
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

const normalizeContentPackageSourceArchiveEntryMetadata = (
  entry: unknown
): ContentPackageSourceUnknownArchiveEntry => {
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Archive entry metadata must be an object'
    )
  }

  const path = (entry as { readonly path?: unknown }).path
  if (typeof path !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Archive entry path metadata must be a string'
    )
  }

  const uncompressedSizeBytes = (entry as { readonly uncompressedSizeBytes?: unknown }).uncompressedSizeBytes
  const compressedSizeBytes = (entry as { readonly compressedSizeBytes?: unknown }).compressedSizeBytes
  return compressedSizeBytes === undefined
    ? { path, uncompressedSizeBytes }
    : { path, uncompressedSizeBytes, compressedSizeBytes }
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
  if (!Array.isArray(entries)) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Archive entries metadata must be an array'
    )
  }
  if (entries.length > policy.maxPackageFileCount) {
    throwLimitExceeded(`Archive exceeds ${policy.maxPackageFileCount} entries: ${entries.length}`)
  }

  const normalizedEntries = entries
    .map(entry => {
      const metadata = normalizeContentPackageSourceArchiveEntryMetadata(entry)
      return {
        entry: metadata,
        path: normalizeContentPackageSourceArchiveEntryPath(metadata.path, policy)
      }
    })
    .sort((a, b) => compareCodePoints(a.path, b.path))

  const seenPaths = new Set<string>()
  const seenAncestorPaths = new Set<string>()
  let totalUncompressedBytes = 0
  return normalizedEntries.map(({ entry, path }) => {
    if (seenPaths.has(path)) {
      throw new ContentPackageSourceError('SOURCE_DUPLICATE_PATH', `Duplicate archive entry path: ${path}`, path)
    }
    if (seenAncestorPaths.has(path) || collectAncestorPaths(path).some(ancestorPath => seenPaths.has(ancestorPath))) {
      throw new ContentPackageSourceError(
        'SOURCE_DUPLICATE_PATH',
        `Archive entry path conflicts with another entry directory prefix: ${path}`,
        path
      )
    }
    seenPaths.add(path)
    for (const ancestorPath of collectAncestorPaths(path)) {
      seenAncestorPaths.add(ancestorPath)
    }

    const uncompressedSizeBytes = assertNonNegativeSafeInteger(
      entry.uncompressedSizeBytes,
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

    if (entry.compressedSizeBytes === undefined) {
      return { path, uncompressedSizeBytes }
    }

    const compressedSizeBytes = assertNonNegativeSafeInteger(entry.compressedSizeBytes, 'compressedSizeBytes', path)
    if (
      (compressedSizeBytes === 0 && uncompressedSizeBytes > 0)
      || (compressedSizeBytes > 0 && uncompressedSizeBytes / compressedSizeBytes > policy.maxCompressedRatio)
    ) {
      throwLimitExceeded(`Archive entry exceeds ${policy.maxCompressedRatio}:1 compression ratio`, path)
    }
    return { path, uncompressedSizeBytes, compressedSizeBytes }
  })
}

export const assertContentPackageSourceTextWithinLimits = (
  text: unknown,
  sourcePath: string,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): string => {
  const normalizedText = normalizeContentPackageSourceTextPayload(text, sourcePath)
  const textBytes = utf8ByteLength(normalizedText)
  if (textBytes > policy.maxSingleFileBytes) {
    throwLimitExceeded(`Source text file exceeds ${policy.maxSingleFileBytes} bytes: ${textBytes}`, sourcePath)
  }
  return normalizedText
}

export const normalizeContentPackageSourceTextPayload = (
  text: unknown,
  sourcePath: string
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
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
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
      `Source path was not found: ${normalizedPath}`,
      normalizedPath
    )
  }
  const entry = normalizeInspectedContentPackageSourceEntry(source, normalizedPath, inspectedEntry, policy)
  if (entry.isSymbolicLink) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      `Source path must not be a symbolic link: ${normalizedPath}`,
      normalizedPath
    )
  }
  if (entry.kind !== 'file') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_NOT_FILE',
      `Source path is not a file: ${normalizedPath}`,
      normalizedPath
    )
  }
  return normalizedPath
}

const inspectContentPackageSourceReadableDirectory = async(
  source: ContentPackageSource,
  path: string,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
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
      `Source path was not found: ${normalizedPath}`,
      normalizedPath
    )
  }
  const entry = normalizeInspectedContentPackageSourceEntry(source, normalizedPath, inspectedEntry, policy)
  if (entry.isSymbolicLink) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      `Source path must not be a symbolic link: ${normalizedPath}`,
      normalizedPath
    )
  }
  if (entry.kind !== 'directory') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_NOT_DIRECTORY',
      `Source path is not a directory: ${normalizedPath}`,
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

const asIdentityObject = (identity: unknown): Record<string, unknown> => {
  if (typeof identity !== 'object' || identity === null || Array.isArray(identity)) {
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
  if (normalized === '') {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      `${fieldName} must be non-empty and already normalized`
    )
  }
  return normalized
}

export const validateContentPackageSourceIdentity = (
  identity: unknown
): ContentPackageSourceIdentity => {
  const identityObject = asIdentityObject(identity)
  const contractVersion = identityObject.contractVersion
  const kind = identityObject.kind
  const sourceIdInput = identityObject.sourceId
  const rootPathInput = identityObject.rootPath

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

  return {
    contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
    kind: sourceKind,
    sourceId,
    rootPath
  }
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
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): ContentPackageSourceDirectoryEntry => {
  const identity = readContentPackageSourceIdentity(source, path)
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
  const sourceId = normalizeIdentityPart(options.sourceId, 'sourceId')
  const rootPath = normalizeIdentityPart(options.rootPath, 'rootPath')
  const rootName = entryName(rootPath, rootPath)
  const files = new Map<string, string>()
  const directories = new Set<string>([''])
  let revoked = false
  let disposed = false

  if (options.files.length > CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxPackageFileCount) {
    throwLimitExceeded(
      `Memory source exceeds ${CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxPackageFileCount} files: ${options.files.length}`
    )
  }

  for (const file of options.files) {
    const normalizedPath = normalizeContentPackageSourcePath(file.path)
    if (normalizedPath === '') {
      throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', 'File path cannot be the source root', file.path)
    }
    if (directories.has(normalizedPath)) {
      throw new ContentPackageSourceError(
        'SOURCE_DUPLICATE_PATH',
        `Source file path conflicts with a directory path: ${normalizedPath}`,
        normalizedPath
      )
    }
    if (files.has(normalizedPath)) {
      throw new ContentPackageSourceError(
        'SOURCE_DUPLICATE_PATH',
        `Duplicate source file path: ${normalizedPath}`,
        normalizedPath
      )
    }
    files.set(normalizedPath, file.text)

    let directory = parentPath(normalizedPath)
    while (directory !== '') {
      if (files.has(directory)) {
        throw new ContentPackageSourceError(
          'SOURCE_DUPLICATE_PATH',
          `Source directory path conflicts with a file path: ${directory}`,
          directory
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
      return {
        name: entryName(normalizedPath, rootName),
        kind: 'file',
        isSymbolicLink: false
      }
    }
    if (directories.has(normalizedPath)) {
      return {
        name: entryName(normalizedPath, rootName),
        kind: 'directory',
        isSymbolicLink: false
      }
    }
    return null
  }

  const readDirectory = (path: string): readonly ContentPackageSourceDirectoryEntry[] => {
    const normalizedPath = normalizeContentPackageSourcePath(path)
    if (!directories.has(normalizedPath)) {
      throw new ContentPackageSourceError(
        'SOURCE_ENTRY_NOT_DIRECTORY',
        `Source path is not a directory: ${normalizedPath || rootPath}`,
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
    identity: {
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId,
      rootPath
    },
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
          `Source path is not a file: ${normalizedPath}`,
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
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): Promise<ContentPackageSourceJsonReadResult> => {
  let text: string
  try {
    const normalizedPath = await inspectContentPackageSourceReadableFile(source, path, policy)
    try {
      text = assertContentPackageSourceTextWithinLimits(await source.readTextFile(normalizedPath), normalizedPath, policy)
    } catch (error) {
      throw toContentPackageSourceHostOperationError('read', error, normalizedPath)
    }
  } catch (error) {
    if (error instanceof ContentPackageSourceError) {
      return { ok: false, code: error.code, message: error.message }
    }
    return { ok: false, code: 'SOURCE_ENTRY_NOT_FOUND', message: errorMessage(error) }
  }

  let data: unknown
  try {
    data = JSON.parse(text) as unknown
  } catch (error) {
    return { ok: false, code: 'SOURCE_JSON_PARSE_FAILED', message: errorMessage(error) }
  }

  try {
    assertPureJsonValue(data)
  } catch (error) {
    return { ok: false, code: 'SOURCE_JSON_NOT_PURE', message: errorMessage(error) }
  }

  return { ok: true, data }
}

const stripDiscoveryRoot = (source: ContentPackageSource, path: string): string => {
  const identity = readContentPackageSourceIdentity(source, path)
  let normalizedPath: string
  try {
    normalizedPath = normalizePackagePath(path)
  } catch {
    return throwUnsafeSourcePath('Content package discovery path is unsafe')
  }

  const rootPath = identity.rootPath
  if (normalizedPath === rootPath) return ''
  const rootPrefix = `${rootPath}/`
  if (!normalizedPath.startsWith(rootPrefix)) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_OUTSIDE_ROOT',
      `Discovery path is outside source root: ${normalizedPath}`,
      normalizedPath
    )
  }
  return normalizedPath.slice(rootPrefix.length)
}

const toDiscoveryEntry = (
  source: ContentPackageSource,
  sourcePath: string,
  entry: ContentPackageSourceDirectoryEntry | null
): ThirdPartyDiscoveryDirectoryEntry | null =>
  entry === null ? null : normalizeInspectedContentPackageSourceEntry(source, sourcePath, entry)

export const createDiscoveryFileSystemFromContentPackageSource = (
  source: ContentPackageSource
): ThirdPartyDiscoveryFileSystem => ({
  async getEntry(path) {
    const sourcePath = stripDiscoveryRoot(source, path)
    let entry: ContentPackageSourceDirectoryEntry | null
    try {
      entry = await source.getEntry(sourcePath)
    } catch (error) {
      throw toContentPackageSourceHostOperationError('inspect', error, sourcePath)
    }
    return toDiscoveryEntry(source, sourcePath, entry)
  },
  async readDirectory(path) {
    const sourcePath = stripDiscoveryRoot(source, path)
    const readableDirectoryPath = await inspectContentPackageSourceReadableDirectory(source, sourcePath)
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
    const sourcePath = stripDiscoveryRoot(source, path)
    const readableFilePath = await inspectContentPackageSourceReadableFile(source, sourcePath)
    let text: string
    try {
      text = assertContentPackageSourceTextWithinLimits(await source.readTextFile(readableFilePath), readableFilePath)
    } catch (error) {
      throw toContentPackageSourceHostOperationError('read', error, readableFilePath)
    }
    return text
  }
})
