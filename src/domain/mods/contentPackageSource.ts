import { assertPureJsonValue, compareCodePoints } from './canonicalJson'
import { normalizePackagePath } from './hash'
import type { ThirdPartyDiscoveryFileSystem, ThirdPartyDiscoveryDirectoryEntry } from './thirdPartyDataPackDiscovery'

export const CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION = 1

export type ContentPackageSourceKind = 'memory'

export type ContentPackageSourceErrorCode =
  | 'SOURCE_DUPLICATE_PATH'
  | 'SOURCE_ENTRY_NOT_DIRECTORY'
  | 'SOURCE_ENTRY_NOT_FILE'
  | 'SOURCE_ENTRY_NOT_FOUND'
  | 'SOURCE_JSON_NOT_PURE'
  | 'SOURCE_JSON_PARSE_FAILED'
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
  readonly kind: 'file' | 'directory'
  readonly isSymbolicLink: false
}

export interface ContentPackageSource {
  readonly identity: ContentPackageSourceIdentity
  getEntry(path: string): Promise<ContentPackageSourceDirectoryEntry | null>
  readDirectory(path: string): Promise<readonly ContentPackageSourceDirectoryEntry[]>
  readTextFile(path: string): Promise<string>
  dispose(): Promise<void>
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

export const normalizeContentPackageSourcePath = (path: string): string => {
  if (path === '') return ''
  try {
    return normalizePackagePath(path)
  } catch (error) {
    throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', errorMessage(error), path)
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
    return normalizePackagePath(value)
  } catch (error) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      `${fieldName} must be a normalized relative identifier: ${errorMessage(error)}`,
      value
    )
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

  for (const file of options.files) {
    const normalizedPath = normalizeContentPackageSourcePath(file.path)
    if (normalizedPath === '') {
      throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', 'File path cannot be the source root', file.path)
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

    return [...entries.values()].sort((a, b) => compareCodePoints(a.name, b.name))
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
  path: string
): Promise<ContentPackageSourceJsonReadResult> => {
  let text: string
  try {
    text = await source.readTextFile(path)
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
  let normalizedPath: string
  try {
    normalizedPath = normalizePackagePath(path)
  } catch (error) {
    throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', errorMessage(error), path)
  }

  const rootPath = source.identity.rootPath
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
): ThirdPartyDiscoveryDirectoryEntry | null => entry

export const createDiscoveryFileSystemFromContentPackageSource = (
  source: ContentPackageSource
): ThirdPartyDiscoveryFileSystem => ({
  async getEntry(path) {
    return toDiscoveryEntry(await source.getEntry(stripDiscoveryRoot(source, path)))
  },
  async readDirectory(path) {
    return source.readDirectory(stripDiscoveryRoot(source, path))
  },
  async readTextFile(path) {
    return source.readTextFile(stripDiscoveryRoot(source, path))
  }
})
