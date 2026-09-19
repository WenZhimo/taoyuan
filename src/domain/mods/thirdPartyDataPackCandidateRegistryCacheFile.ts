import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { mkdir, open, readFile, rename, stat, unlink } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import type { Sha256Hash } from './hash'
import {
  createThirdPartyDataPackCandidateRegistryCacheText,
  parseThirdPartyDataPackCandidateRegistryCacheText,
  THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_FILE_NAME,
  THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_MAX_BYTES,
  type ThirdPartyDataPackCandidateRegistryCacheStore
} from './thirdPartyDataPackCandidateRegistryCache'
import type { ThirdPartyDataPackLockfileDraft } from './thirdPartyDataPackLockfileDraft'
import type { SerializableRegistrySnapshot } from './registry'

const TEMP_FILE_PREFIX = `.${THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_FILE_NAME}.tmp-`

export interface ThirdPartyDataPackCandidateRegistryCacheFilePaths {
  readonly directory: string
  readonly filePath: string
}

export interface ThirdPartyDataPackCandidateRegistryCacheFileSystem {
  mkdir: typeof mkdir
  open: typeof open
  readFile: typeof readFile
  rename: typeof rename
  stat: typeof stat
  unlink: typeof unlink
}

export interface ThirdPartyDataPackCandidateRegistryCacheFileOptions {
  readonly fileSystem?: Partial<ThirdPartyDataPackCandidateRegistryCacheFileSystem>
}

const fileSystem = (
  options?: ThirdPartyDataPackCandidateRegistryCacheFileOptions
): ThirdPartyDataPackCandidateRegistryCacheFileSystem => ({
  mkdir,
  open,
  readFile,
  rename,
  stat,
  unlink,
  ...options?.fileSystem
})

const isNotFound = (error: unknown): boolean =>
  error !== null
  && typeof error === 'object'
  && 'code' in error
  && (error as { code?: unknown }).code === 'ENOENT'

const assertInsideCacheDirectory = (
  paths: ThirdPartyDataPackCandidateRegistryCacheFilePaths,
  candidate: string
): void => {
  const relative = path.relative(path.resolve(paths.directory), path.resolve(candidate))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Third-party candidate registry cache path escaped its directory')
  }
}

export const getThirdPartyDataPackCandidateRegistryCacheFilePaths = (
  userDataPath: string,
  environmentHash: Sha256Hash
): ThirdPartyDataPackCandidateRegistryCacheFilePaths => {
  if (!path.isAbsolute(userDataPath)) throw new Error('userDataPath must be absolute')
  const safeEnvironmentDirectory = environmentHash.replace(/^sha256:/, 'sha256-')
  if (!/^sha256-[0-9a-f]{64}$/.test(safeEnvironmentDirectory)) {
    throw new Error('environmentHash is not a valid cache directory identity')
  }
  const directory = path.join(userDataPath, 'mod-cache', safeEnvironmentDirectory)
  const filePath = path.join(directory, THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_FILE_NAME)
  assertInsideCacheDirectory({ directory, filePath }, filePath)
  return { directory, filePath }
}

export const readThirdPartyDataPackCandidateRegistryCacheFile = async (
  paths: ThirdPartyDataPackCandidateRegistryCacheFilePaths,
  options?: ThirdPartyDataPackCandidateRegistryCacheFileOptions
): Promise<string | null> => {
  const fs = fileSystem(options)
  try {
    const fileStat = await fs.stat(paths.filePath)
    if (fileStat.size > THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_MAX_BYTES) {
      throw new Error('Third-party candidate registry cache exceeds the size limit')
    }
    return await fs.readFile(paths.filePath, 'utf8')
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

export const writeThirdPartyDataPackCandidateRegistryCacheFile = async (
  paths: ThirdPartyDataPackCandidateRegistryCacheFilePaths,
  contents: string,
  options?: ThirdPartyDataPackCandidateRegistryCacheFileOptions
): Promise<void> => {
  const fs = fileSystem(options)
  if (Buffer.byteLength(contents, 'utf8') > THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_MAX_BYTES) {
    throw new Error('Third-party candidate registry cache exceeds the size limit')
  }
  parseThirdPartyDataPackCandidateRegistryCacheText(contents)
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
    if (reread !== contents) throw new Error('Third-party candidate registry cache temporary file changed')
    parseThirdPartyDataPackCandidateRegistryCacheText(reread)
    await fs.rename(temporaryPath, paths.filePath)
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined)
    await fs.unlink(temporaryPath).catch(() => undefined)
    throw error
  }
}

export const createThirdPartyDataPackCandidateRegistryCacheFileStore = (
  userDataPath: string,
  options?: ThirdPartyDataPackCandidateRegistryCacheFileOptions
): ThirdPartyDataPackCandidateRegistryCacheStore => ({
  async read(environmentHash) {
    return await readThirdPartyDataPackCandidateRegistryCacheFile(
      getThirdPartyDataPackCandidateRegistryCacheFilePaths(userDataPath, environmentHash),
      options
    )
  },
  async write(environmentHash, contents) {
    await writeThirdPartyDataPackCandidateRegistryCacheFile(
      getThirdPartyDataPackCandidateRegistryCacheFilePaths(userDataPath, environmentHash),
      contents,
      options
    )
  }
})

export const createThirdPartyDataPackCandidateRegistryCacheTextFromArtifacts = (
  candidateSnapshot: SerializableRegistrySnapshot,
  lockfileDraft: ThirdPartyDataPackLockfileDraft
): string => createThirdPartyDataPackCandidateRegistryCacheText(candidateSnapshot, lockfileDraft)
