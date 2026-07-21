import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { open, readdir, readFile, rename, stat, unlink, mkdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  OFFICIAL_REGISTRY_CACHE_FILE_NAME,
  OFFICIAL_REGISTRY_CACHE_MAX_BYTES,
  parseOfficialRegistryCacheText
} from './officialRegistryCache'

const TEMP_FILE_PREFIX = `.${OFFICIAL_REGISTRY_CACHE_FILE_NAME}.tmp-`
const DEFAULT_STALE_TEMP_AGE_MS = 5 * 60 * 1000

export interface OfficialRegistryCacheFilePaths {
  directory: string
  filePath: string
}

export interface OfficialRegistryCacheFileSystem {
  mkdir: typeof mkdir
  open: typeof open
  readFile: typeof readFile
  readdir: typeof readdir
  rename: typeof rename
  stat: typeof stat
  unlink: typeof unlink
}

export interface OfficialRegistryCacheFileOptions {
  fileSystem?: Partial<OfficialRegistryCacheFileSystem>
  staleTempAgeMs?: number
  beforeReplace?: () => void | Promise<void>
}

const fileSystem = (options?: OfficialRegistryCacheFileOptions): OfficialRegistryCacheFileSystem => ({
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  stat,
  unlink,
  ...options?.fileSystem
})

const assertInsideCacheDirectory = (paths: OfficialRegistryCacheFilePaths, candidate: string): void => {
  const relative = path.relative(path.resolve(paths.directory), path.resolve(candidate))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Official registry cache path escaped its directory')
  }
}

export const getOfficialRegistryCacheFilePaths = (
  userDataPath: string,
  environmentHash: string
): OfficialRegistryCacheFilePaths => {
  if (!path.isAbsolute(userDataPath)) throw new Error('userDataPath must be absolute')
  const safeEnvironmentDirectory = environmentHash.replace(/^sha256:/, 'sha256-')
  if (!/^sha256-[0-9a-f]{64}$/.test(safeEnvironmentDirectory)) {
    throw new Error('environmentHash is not a valid cache directory identity')
  }
  const directory = path.join(userDataPath, 'mod-cache', safeEnvironmentDirectory)
  const filePath = path.join(directory, OFFICIAL_REGISTRY_CACHE_FILE_NAME)
  assertInsideCacheDirectory({ directory, filePath }, filePath)
  return { directory, filePath }
}

const isNotFound = (error: unknown): boolean =>
  error !== null
  && typeof error === 'object'
  && 'code' in error
  && (error as { code?: unknown }).code === 'ENOENT'

const isTemporaryName = (name: string): boolean => name.startsWith(TEMP_FILE_PREFIX)

export const cleanupOfficialRegistryCacheTempFiles = async (
  paths: OfficialRegistryCacheFilePaths,
  options?: OfficialRegistryCacheFileOptions
): Promise<void> => {
  const fs = fileSystem(options)
  const staleAgeMs = options?.staleTempAgeMs ?? DEFAULT_STALE_TEMP_AGE_MS
  const cutoff = Date.now() - staleAgeMs
  let entries
  try {
    entries = await fs.readdir(paths.directory, { withFileTypes: true })
  } catch (error) {
    if (isNotFound(error)) return
    throw error
  }
  await Promise.all(entries
    .filter(entry => entry.isFile() && isTemporaryName(entry.name))
    .map(async entry => {
      const temporaryPath = path.join(paths.directory, entry.name)
      assertInsideCacheDirectory(paths, temporaryPath)
      try {
        const fileStat = await fs.stat(temporaryPath)
        if (fileStat.mtimeMs > cutoff) return
        await fs.unlink(temporaryPath)
      } catch (error) {
        if (!isNotFound(error)) throw error
      }
    }))
}

export const readOfficialRegistryCacheFile = async (
  paths: OfficialRegistryCacheFilePaths,
  options?: OfficialRegistryCacheFileOptions
): Promise<string | null> => {
  const fs = fileSystem(options)
  await cleanupOfficialRegistryCacheTempFiles(paths, options)
  try {
    const fileStat = await fs.stat(paths.filePath)
    if (fileStat.size > OFFICIAL_REGISTRY_CACHE_MAX_BYTES) {
      throw new Error('Official registry cache exceeds the size limit')
    }
    return await fs.readFile(paths.filePath, 'utf8')
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

export const writeOfficialRegistryCacheFile = async (
  paths: OfficialRegistryCacheFilePaths,
  contents: string,
  metadataValue: unknown,
  options?: OfficialRegistryCacheFileOptions
): Promise<void> => {
  const fs = fileSystem(options)
  if (Buffer.byteLength(contents, 'utf8') > OFFICIAL_REGISTRY_CACHE_MAX_BYTES) {
    throw new Error('Official registry cache exceeds the size limit')
  }
  parseOfficialRegistryCacheText(contents, metadataValue)
  await fs.mkdir(paths.directory, { recursive: true })

  const temporaryPath = path.join(
    paths.directory,
    `${TEMP_FILE_PREFIX}${process.pid}-${randomUUID()}`
  )
  assertInsideCacheDirectory(paths, temporaryPath)
  let handle: Awaited<ReturnType<typeof open>> | null = null
  try {
    handle = await fs.open(temporaryPath, 'wx')
    await handle.writeFile(contents, 'utf8')
    await handle.sync()
    await handle.close()
    handle = null

    const reread = await fs.readFile(temporaryPath, 'utf8')
    if (reread !== contents) throw new Error('Official registry cache temporary file changed')
    parseOfficialRegistryCacheText(reread, metadataValue)
    await options?.beforeReplace?.()
    await fs.rename(temporaryPath, paths.filePath)
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined)
    await fs.unlink(temporaryPath).catch(() => undefined)
    throw error
  }
}
