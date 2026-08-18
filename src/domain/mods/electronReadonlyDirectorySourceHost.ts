import { lstat, readFile, readdir } from 'node:fs/promises'
import type { Dirent } from 'node:fs'
import path from 'node:path'
import {
  CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  ContentPackageSourceError,
  normalizeContentPackageSourcePath,
  normalizeContentPackageSourceTextPayload,
  toContentPackageSourceHostOperationError,
  type ContentPackageSourceDirectoryEntry,
  type ContentPackageSourceErrorCode,
  type ContentPackageSourceHostOperation
} from './contentPackageSource'
import type { ElectronReadonlyDirectoryHost } from './electronContentPackageSourceProbe'

export type ElectronReadonlyDirectorySourceIpcResult<T> =
  | { readonly ok: true; readonly value: T }
  | {
    readonly ok: false
    readonly error: {
      readonly code: ContentPackageSourceErrorCode
      readonly message: string
      readonly sourcePath?: string
    }
  }

const isPathInside = (parent: string, candidate: string): boolean => {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate))
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

const readNodeErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null) return undefined
  try {
    const descriptor = Reflect.getOwnPropertyDescriptor(error, 'code')
    return descriptor !== undefined && 'value' in descriptor && typeof descriptor.value === 'string'
      ? descriptor.value
      : undefined
  } catch {
    return undefined
  }
}

const isMissingNodeError = (error: unknown): boolean =>
  ['ENOENT', 'ENOTDIR'].includes(readNodeErrorCode(error) ?? '')

const isPermissionNodeError = (error: unknown): boolean =>
  ['EACCES', 'EPERM'].includes(readNodeErrorCode(error) ?? '')

const toEntryKind = (stats: Awaited<ReturnType<typeof lstat>>): ContentPackageSourceDirectoryEntry['kind'] => {
  if (stats.isFile()) return 'file'
  if (stats.isDirectory()) return 'directory'
  return 'other'
}

const toSourceAccessError = (
  error: unknown,
  normalizedPath: string,
  fallbackCode: ContentPackageSourceErrorCode,
  fallbackMessage: string
): ContentPackageSourceError => {
  if (error instanceof ContentPackageSourceError) return error
  if (isMissingNodeError(error)) {
    return new ContentPackageSourceError(fallbackCode, fallbackMessage, normalizedPath)
  }
  if (isPermissionNodeError(error)) {
    return new ContentPackageSourceError(
      'SOURCE_PERMISSION_REVOKED',
      'Content package source permission was revoked',
      normalizedPath
    )
  }
  return new ContentPackageSourceError(fallbackCode, fallbackMessage, normalizedPath)
}

const mapElectronReadonlyDirectorySourcePath = (
  rootPath: string,
  sourcePath: unknown
): { readonly normalizedPath: string; readonly absolutePath: string } => {
  if (typeof sourcePath !== 'string' || sourcePath.includes('\\')) {
    throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', 'Content package source path is unsafe')
  }
  const normalizedPath = normalizeContentPackageSourcePath(sourcePath)
  const absolutePath = normalizedPath === ''
    ? rootPath
    : path.resolve(rootPath, ...normalizedPath.split('/'))
  if (!isPathInside(rootPath, absolutePath)) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_OUTSIDE_ROOT',
      'Content package source path is outside the Electron mods root',
      normalizedPath
    )
  }
  return { normalizedPath, absolutePath }
}

const readEntryStats = async(
  absolutePath: string,
  normalizedPath: string
): Promise<Awaited<ReturnType<typeof lstat>> | null> => {
  try {
    return await lstat(absolutePath)
  } catch (error) {
    if (isMissingNodeError(error)) return null
    throw toSourceAccessError(
      error,
      normalizedPath,
      'SOURCE_ENTRY_NOT_FOUND',
      'Source path was not found'
    )
  }
}

const toDirectoryEntry = (
  name: string,
  stats: Awaited<ReturnType<typeof lstat>>
): ContentPackageSourceDirectoryEntry => Object.freeze({
  name,
  kind: toEntryKind(stats),
  isSymbolicLink: stats.isSymbolicLink()
})

export const createElectronReadonlyDirectoryNodeHost = (
  rootPath: string
): ElectronReadonlyDirectoryHost => {
  const resolvedRootPath = path.resolve(rootPath)

  return {
    async getEntry(sourcePath) {
      const { normalizedPath, absolutePath } = mapElectronReadonlyDirectorySourcePath(resolvedRootPath, sourcePath)
      const stats = await readEntryStats(absolutePath, normalizedPath)
      if (stats === null) return null
      return toDirectoryEntry(
        normalizedPath === '' ? path.basename(resolvedRootPath) : path.basename(absolutePath),
        stats
      )
    },
    async readDirectory(sourcePath) {
      const { normalizedPath, absolutePath } = mapElectronReadonlyDirectorySourcePath(resolvedRootPath, sourcePath)
      const stats = await readEntryStats(absolutePath, normalizedPath)
      if (stats === null || !stats.isDirectory()) {
        throw new ContentPackageSourceError(
          'SOURCE_ENTRY_NOT_DIRECTORY',
          'Source path is not a directory',
          normalizedPath
        )
      }
      if (stats.isSymbolicLink()) {
        throw new ContentPackageSourceError(
          'SOURCE_PATH_UNSAFE',
          'Source path must not be a symbolic link',
          normalizedPath
        )
      }
      let entries: Dirent[]
      try {
        entries = await readdir(absolutePath, { withFileTypes: true })
      } catch (error) {
        throw toSourceAccessError(
          error,
          normalizedPath,
          'SOURCE_ENTRY_NOT_DIRECTORY',
          'Source path is not a directory'
        )
      }
      return entries.map(entry => Object.freeze({
        name: entry.name,
        kind: entry.isFile() ? 'file' : entry.isDirectory() ? 'directory' : 'other',
        isSymbolicLink: entry.isSymbolicLink()
      }))
    },
    async readTextFile(sourcePath) {
      const { normalizedPath, absolutePath } = mapElectronReadonlyDirectorySourcePath(resolvedRootPath, sourcePath)
      const stats = await readEntryStats(absolutePath, normalizedPath)
      if (stats === null) {
        throw new ContentPackageSourceError('SOURCE_ENTRY_NOT_FOUND', 'Source path was not found', normalizedPath)
      }
      if (stats.isSymbolicLink()) {
        throw new ContentPackageSourceError(
          'SOURCE_PATH_UNSAFE',
          'Source path must not be a symbolic link',
          normalizedPath
        )
      }
      if (!stats.isFile()) {
        throw new ContentPackageSourceError('SOURCE_ENTRY_NOT_FILE', 'Source path is not a file', normalizedPath)
      }
      if (stats.size > CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxSingleFileBytes) {
        throw new ContentPackageSourceError(
          'SOURCE_LIMIT_EXCEEDED',
          `Source text file exceeds ${CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxSingleFileBytes} bytes: ${stats.size}`,
          normalizedPath
        )
      }
      try {
        return normalizeContentPackageSourceTextPayload(await readFile(absolutePath, 'utf8'), normalizedPath)
      } catch (error) {
        throw toSourceAccessError(
          error,
          normalizedPath,
          'SOURCE_ENTRY_NOT_FOUND',
          'Source path was not found'
        )
      }
    }
  }
}

export const toElectronReadonlyDirectorySourceIpcResult = async<T>(
  operation: ContentPackageSourceHostOperation,
  sourcePath: unknown,
  read: () => Promise<T>
): Promise<ElectronReadonlyDirectorySourceIpcResult<T>> => {
  try {
    return Object.freeze({ ok: true, value: await read() })
  } catch (error) {
    const sourceError = error instanceof ContentPackageSourceError
      ? error
      : toContentPackageSourceHostOperationError(
        operation,
        error,
        typeof sourcePath === 'string' ? sourcePath : '',
        'SOURCE_ENTRY_NOT_FOUND'
      )
    return Object.freeze({
      ok: false,
      error: Object.freeze({
        code: sourceError.code,
        message: sourceError.message,
        ...(sourceError.sourcePath === undefined ? {} : { sourcePath: sourceError.sourcePath })
      })
    })
  }
}
