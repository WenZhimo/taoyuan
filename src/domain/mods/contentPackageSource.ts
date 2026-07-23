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
  try {
    const normalizedPath = normalizePackagePath(path)
    assertNormalizedPathWithinLimits(normalizedPath, path, policy)
    return normalizedPath
  } catch (error) {
    if (error instanceof ContentPackageSourceError) throw error
    throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', errorMessage(error), path)
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
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      `Content package source entry name is unsafe: ${errorMessage(error)}`,
      name
    )
  }
  if (normalizedName === '' || normalizedName !== name || normalizedName.includes('/')) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      'Content package source entry names must be single normalized path segments',
      name
    )
  }
  return normalizedName
}

export const normalizeContentPackageSourceDirectoryEntry = (
  entry: ContentPackageSourceDirectoryEntry,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): ContentPackageSourceDirectoryEntry => {
  const kind = entry.kind
  if (!supportedEntryKinds.has(kind)) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      `Unsupported content package source entry kind: ${String(kind)}`,
      entry.name
    )
  }
  if (typeof entry.isSymbolicLink !== 'boolean') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Content package source entry must expose an explicit symbolic-link flag',
      entry.name
    )
  }
  return {
    name: normalizeContentPackageSourceEntryName(entry.name, policy),
    kind,
    isSymbolicLink: entry.isSymbolicLink
  }
}

export const normalizeContentPackageSourceDirectoryEntries = (
  entries: readonly ContentPackageSourceDirectoryEntry[],
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): readonly ContentPackageSourceDirectoryEntry[] => {
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
      'Archive entry paths must be non-empty normalized POSIX paths',
      path
    )
  }

  const normalizedPath = normalizeContentPackageSourcePath(path, policy)
  if (normalizedPath === '' || normalizedPath !== path) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      'Archive entry paths must already be normalized before validation',
      path
    )
  }
  return normalizedPath
}

const assertNonNegativeSafeInteger = (value: number, fieldName: string, sourcePath: string): number => {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new ContentPackageSourceError(
      'SOURCE_LIMIT_EXCEEDED',
      `${fieldName} must be a non-negative safe integer`,
      sourcePath
    )
  }
  return value
}

export const validateContentPackageSourceArchiveEntries = (
  entries: readonly ContentPackageSourceArchiveEntry[],
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): readonly ContentPackageSourceValidatedArchiveEntry[] => {
  if (entries.length > policy.maxPackageFileCount) {
    throwLimitExceeded(`Archive exceeds ${policy.maxPackageFileCount} entries: ${entries.length}`)
  }

  const seenPaths = new Set<string>()
  let totalUncompressedBytes = 0
  return entries.map(entry => {
    const path = normalizeContentPackageSourceArchiveEntryPath(entry.path, policy)
    if (seenPaths.has(path)) {
      throw new ContentPackageSourceError('SOURCE_DUPLICATE_PATH', `Duplicate archive entry path: ${path}`, path)
    }
    seenPaths.add(path)

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
  text: string,
  sourcePath: string,
  policy: ContentPackageSourceSafeReadPolicy = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
): void => {
  const textBytes = utf8ByteLength(text)
  if (textBytes > policy.maxSingleFileBytes) {
    throwLimitExceeded(`Source text file exceeds ${policy.maxSingleFileBytes} bytes: ${textBytes}`, sourcePath)
  }
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

const normalizeIdentityPart = (value: string, fieldName: string): string => {
  try {
    return normalizeContentPackageSourcePath(value)
  } catch (error) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      `${fieldName} must be a normalized relative identifier: ${errorMessage(error)}`,
      value
    )
  }
}

export const validateContentPackageSourceIdentity = (
  identity: ContentPackageSourceIdentity
): ContentPackageSourceIdentity => {
  if (identity.contractVersion !== CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      `Unsupported content package source contract version: ${String(identity.contractVersion)}`
    )
  }
  if (!supportedSourceKinds.has(identity.kind)) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      `Unsupported content package source kind: ${String(identity.kind)}`
    )
  }

  const sourceId = normalizeIdentityPart(identity.sourceId, 'sourceId')
  const rootPath = normalizeIdentityPart(identity.rootPath, 'rootPath')
  if (sourceId !== identity.sourceId || rootPath !== identity.rootPath) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'Content package source identity must already use normalized relative sourceId and rootPath'
    )
  }

  return {
    contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
    kind: identity.kind,
    sourceId,
    rootPath
  }
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
    text = await source.readTextFile(path)
    assertContentPackageSourceTextWithinLimits(text, path, policy)
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
  const identity = validateContentPackageSourceIdentity(source.identity)
  let normalizedPath: string
  try {
    normalizedPath = normalizePackagePath(path)
  } catch (error) {
    throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', errorMessage(error), path)
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
  entry: ContentPackageSourceDirectoryEntry | null
): ThirdPartyDiscoveryDirectoryEntry | null =>
  entry === null ? null : normalizeContentPackageSourceDirectoryEntry(entry)

export const createDiscoveryFileSystemFromContentPackageSource = (
  source: ContentPackageSource
): ThirdPartyDiscoveryFileSystem => ({
  async getEntry(path) {
    return toDiscoveryEntry(await source.getEntry(stripDiscoveryRoot(source, path)))
  },
  async readDirectory(path) {
    return normalizeContentPackageSourceDirectoryEntries(await source.readDirectory(stripDiscoveryRoot(source, path)))
  },
  async readTextFile(path) {
    const sourcePath = stripDiscoveryRoot(source, path)
    const text = await source.readTextFile(sourcePath)
    assertContentPackageSourceTextWithinLimits(text, sourcePath)
    return text
  }
})
