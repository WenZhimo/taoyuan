import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { mkdir, open, readFile, readdir, rename, stat, unlink } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { assertPureJsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import {
  type ThirdPartyDataPackLockfileDraft
} from './thirdPartyDataPackLockfileDraft'
import { ThirdPartyDataPackLockfileDraftSchema } from './schemas'
import { validateUnknown } from './schemaValidation'

export const THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME = 'mod-lock.json'
export const THIRD_PARTY_DATA_PACK_MOD_LOCK_MAX_BYTES = 16 * 1024 * 1024

const TEMP_FILE_PREFIX = `.${THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME}.tmp-`
const DEFAULT_STALE_TEMP_AGE_MS = 5 * 60 * 1000

export type ThirdPartyDataPackModLockFileErrorKind =
  | 'invalid-json'
  | 'structure'
  | 'self-hash'
  | 'size'
  | 'path'

export class ThirdPartyDataPackModLockFileError extends Error {
  readonly kind: ThirdPartyDataPackModLockFileErrorKind
  readonly diagnostics: readonly ModDiagnostic[]
  readonly cause?: unknown

  constructor(
    kind: ThirdPartyDataPackModLockFileErrorKind,
    message: string,
    diagnostics: readonly ModDiagnostic[],
    cause?: unknown
  ) {
    super(message)
    this.name = 'ThirdPartyDataPackModLockFileError'
    this.kind = kind
    this.diagnostics = diagnostics
    this.cause = cause
  }
}

export interface ThirdPartyDataPackModLockFilePaths {
  readonly directory: string
  readonly filePath: string
}

export interface ThirdPartyDataPackModLockFileSystem {
  mkdir: typeof mkdir
  open: typeof open
  readFile: typeof readFile
  readdir: typeof readdir
  rename: typeof rename
  stat: typeof stat
  unlink: typeof unlink
}

export interface ThirdPartyDataPackModLockFileOptions {
  readonly fileSystem?: Partial<ThirdPartyDataPackModLockFileSystem>
  readonly staleTempAgeMs?: number
  readonly beforeReplace?: () => void | Promise<void>
}

const fileSystem = (options?: ThirdPartyDataPackModLockFileOptions): ThirdPartyDataPackModLockFileSystem => ({
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  stat,
  unlink,
  ...options?.fileSystem
})

const modLockDiagnostic = (
  stage: string,
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
  stage,
  details,
  recovery: 'retry'
})

const throwModLockError = (
  kind: ThirdPartyDataPackModLockFileErrorKind,
  message: string,
  stage: string,
  details: Record<string, string | number | boolean | null> = {},
  cause?: unknown
): never => {
  throw new ThirdPartyDataPackModLockFileError(
    kind,
    message,
    [modLockDiagnostic(stage, details)],
    cause
  )
}

const isNotFound = (error: unknown): boolean =>
  error !== null
  && typeof error === 'object'
  && 'code' in error
  && (error as { code?: unknown }).code === 'ENOENT'

const isTemporaryName = (name: string): boolean => name.startsWith(TEMP_FILE_PREFIX)

const assertInsideModLockDirectory = (paths: ThirdPartyDataPackModLockFilePaths, candidate: string): void => {
  const relative = path.relative(path.resolve(paths.directory), path.resolve(candidate))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throwModLockError(
      'path',
      'Third-party mod lock path escaped its userdata directory',
      'third-party.mod-lock.path',
      { candidate: path.basename(candidate) }
    )
  }
}

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown
  } catch (error) {
    return throwModLockError(
      'invalid-json',
      'Third-party mod lock file is not valid JSON',
      'third-party.mod-lock.json',
      { message: error instanceof Error ? error.message : String(error) },
      error
    )
  }
}

const assertSelfHash = (draft: ThirdPartyDataPackLockfileDraft): void => {
  const { lockfileHash: _lockfileHash, ...body } = draft
  const expectedHash = hashCanonicalJson(body) as Sha256Hash
  if (draft.lockfileHash !== expectedHash) {
    throwModLockError(
      'self-hash',
      'Third-party mod lock self hash does not match its canonical body',
      'third-party.mod-lock.self-hash',
      { expected: expectedHash, actual: draft.lockfileHash }
    )
  }
}

export const getThirdPartyDataPackModLockFilePaths = (
  userDataPath: string
): ThirdPartyDataPackModLockFilePaths => {
  if (!path.isAbsolute(userDataPath)) {
    throwModLockError(
      'path',
      'userDataPath must be absolute',
      'third-party.mod-lock.path',
      { userDataPath }
    )
  }
  const directory = userDataPath
  const filePath = path.join(directory, THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME)
  const paths = { directory, filePath }
  assertInsideModLockDirectory(paths, filePath)
  return paths
}

export const parseThirdPartyDataPackModLockText = (
  text: string
): ThirdPartyDataPackLockfileDraft => {
  const value = parseJson(text)
  try {
    assertPureJsonValue(value)
  } catch (error) {
    return throwModLockError(
      'structure',
      'Third-party mod lock file contains a non-JSON value',
      'third-party.mod-lock.structure',
      { message: error instanceof Error ? error.message : String(error) },
      error
    )
  }

  const result = validateUnknown(ThirdPartyDataPackLockfileDraftSchema, value, {
    stage: 'third-party.mod-lock.structure',
    file: THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME
  })
  if (!result.ok) {
    throw new ThirdPartyDataPackModLockFileError(
      'structure',
      'Third-party mod lock file structure is invalid',
      result.diagnostics
    )
  }
  const draft = result.data as unknown as ThirdPartyDataPackLockfileDraft
  assertSelfHash(draft)
  return draft
}

export const createThirdPartyDataPackModLockText = (
  draftValue: unknown
): string => {
  const result = validateUnknown(ThirdPartyDataPackLockfileDraftSchema, draftValue, {
    stage: 'third-party.mod-lock.write-structure',
    file: THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME
  })
  if (!result.ok) {
    throw new ThirdPartyDataPackModLockFileError(
      'structure',
      'Third-party mod lock write input is invalid',
      result.diagnostics
    )
  }
  const draft = result.data as unknown as ThirdPartyDataPackLockfileDraft
  assertSelfHash(draft)
  return `${JSON.stringify(draft, null, 2)}\n`
}

export const cleanupThirdPartyDataPackModLockTempFiles = async (
  paths: ThirdPartyDataPackModLockFilePaths,
  options?: ThirdPartyDataPackModLockFileOptions
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
      assertInsideModLockDirectory(paths, temporaryPath)
      try {
        const fileStat = await fs.stat(temporaryPath)
        if (fileStat.mtimeMs > cutoff) return
        await fs.unlink(temporaryPath)
      } catch (error) {
        if (!isNotFound(error)) throw error
      }
    }))
}

export const readThirdPartyDataPackModLockFile = async (
  paths: ThirdPartyDataPackModLockFilePaths,
  options?: ThirdPartyDataPackModLockFileOptions
): Promise<ThirdPartyDataPackLockfileDraft | null> => {
  const fs = fileSystem(options)
  await cleanupThirdPartyDataPackModLockTempFiles(paths, options)
  try {
    const fileStat = await fs.stat(paths.filePath)
    if (fileStat.size > THIRD_PARTY_DATA_PACK_MOD_LOCK_MAX_BYTES) {
      return throwModLockError(
        'size',
        'Third-party mod lock file exceeds the size limit',
        'third-party.mod-lock.size',
        { size: fileStat.size, maxBytes: THIRD_PARTY_DATA_PACK_MOD_LOCK_MAX_BYTES }
      )
    }
    return parseThirdPartyDataPackModLockText(await fs.readFile(paths.filePath, 'utf8'))
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

export const writeThirdPartyDataPackModLockFile = async (
  paths: ThirdPartyDataPackModLockFilePaths,
  draftValue: unknown,
  options?: ThirdPartyDataPackModLockFileOptions
): Promise<void> => {
  const fs = fileSystem(options)
  const contents = createThirdPartyDataPackModLockText(draftValue)
  if (Buffer.byteLength(contents, 'utf8') > THIRD_PARTY_DATA_PACK_MOD_LOCK_MAX_BYTES) {
    return throwModLockError(
      'size',
      'Third-party mod lock file exceeds the size limit',
      'third-party.mod-lock.size',
      { maxBytes: THIRD_PARTY_DATA_PACK_MOD_LOCK_MAX_BYTES }
    )
  }

  await fs.mkdir(paths.directory, { recursive: true })
  const temporaryPath = path.join(
    paths.directory,
    `${TEMP_FILE_PREFIX}${process.pid}-${randomUUID()}`
  )
  assertInsideModLockDirectory(paths, temporaryPath)
  let handle: Awaited<ReturnType<typeof open>> | null = null
  try {
    handle = await fs.open(temporaryPath, 'wx')
    await handle.writeFile(contents, 'utf8')
    await handle.sync()
    await handle.close()
    handle = null

    const reread = await fs.readFile(temporaryPath, 'utf8')
    if (reread !== contents) {
      return throwModLockError(
        'structure',
        'Third-party mod lock temporary file changed before replace',
        'third-party.mod-lock.write-verify'
      )
    }
    parseThirdPartyDataPackModLockText(reread)
    await options?.beforeReplace?.()
    await fs.rename(temporaryPath, paths.filePath)
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined)
    await fs.unlink(temporaryPath).catch(() => undefined)
    throw error
  }
}
