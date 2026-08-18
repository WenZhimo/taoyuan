import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { mkdir, open, readFile, readdir, rename, stat, unlink } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { assertPureJsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
} from './thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_FILE_NAME =
  'install-transaction-prepared.json'
export const THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_DIRECTORY_NAME =
  'mod-transactions'
export const THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_USERDATA_DIRECTORY_NAME =
  'userdata'
export const THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND =
  'program-directory-userdata-install-transaction-log-prepared'
export const THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_PIPELINE_KIND =
  'third-party-install-transaction-log-prepared-commit-host-connection-pipeline'
export const THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_PIPELINE_MODE =
  'default-disabled-install-transaction-log-prepared-commit-host-connection-pipeline'
export const THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_MAX_BYTES =
  16 * 1024 * 1024

const TEMP_FILE_PREFIX = `.${THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_FILE_NAME}.tmp-`
const DEFAULT_STALE_TEMP_AGE_MS = 5 * 60 * 1000

export type ThirdPartyDataPackInstallTransactionLogPreparedPipelineStatus =
  | 'prepared'
  | 'deferred'
  | 'skipped'
  | 'blocked'
  | 'failed'
export type ThirdPartyDataPackInstallTransactionLogPreparedStorageStatus =
  | 'written'
  | 'failed'
export type ThirdPartyDataPackInstallTransactionLogPreparedCheckId =
  | 'transaction-commit-connection-accepted'
  | 'install-target-present'
  | 'candidate-identity-present'
  | 'lockfile-hash-present'
  | 'contained-writes-present'
  | 'no-upstream-commit-or-read-effects'
  | 'explicit-transaction-log-prepare-authorized'
  | 'storage-write-contained'

export interface ThirdPartyDataPackInstallTransactionLogPreparedCheck {
  readonly id: ThirdPartyDataPackInstallTransactionLogPreparedCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedEntry {
  readonly formatVersion: 1
  readonly kind: 'third-party-data-pack-install-transaction-log-prepared'
  readonly transactionId: string
  readonly operation: 'prepare-install-transaction'
  readonly createdAtIso: string
  readonly requestedCommandId: 'install'
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly packageFileWriteAcknowledged: true
  readonly settingsLockfileWriteAcknowledged: true
  readonly transactionCommitConnectionAcknowledged: true
  readonly entryHash: Sha256Hash
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedStoragePaths {
  readonly programDirectoryPath: string
  readonly userDataPath: string
  readonly transactionLogDirectoryPath: string
  readonly filePath: string
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedStorageEffects {
  readonly transactionCommitted: false
  readonly transactionLogPrepared: boolean
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: false
  readonly lockfileWritten: false
  readonly lockfileRestored: false
  readonly settingsWritten: false
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: boolean
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedStorageReport {
  readonly status: ThirdPartyDataPackInstallTransactionLogPreparedStorageStatus
  readonly operation: 'prepare-install-transaction'
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND
  readonly reason: string
  readonly paths?: ThirdPartyDataPackInstallTransactionLogPreparedStoragePaths
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackInstallTransactionLogPreparedStorageEffects
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedStorageWriteResult {
  readonly report: ThirdPartyDataPackInstallTransactionLogPreparedStorageReport
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter {
  write(
    entry: ThirdPartyDataPackInstallTransactionLogPreparedEntry
  ): Promise<ThirdPartyDataPackInstallTransactionLogPreparedStorageWriteResult>
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedFileSystem {
  mkdir: typeof mkdir
  open: typeof open
  readFile: typeof readFile
  readdir: typeof readdir
  rename: typeof rename
  stat: typeof stat
  unlink: typeof unlink
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedFileOptions {
  readonly fileSystem?: Partial<ThirdPartyDataPackInstallTransactionLogPreparedFileSystem>
  readonly staleTempAgeMs?: number
  readonly beforeReplace?: () => void | Promise<void>
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedStorageAdapterOptions {
  readonly programDirectoryPath: string | (() => string | Promise<string>)
  readonly fileOptions?: ThirdPartyDataPackInstallTransactionLogPreparedFileOptions
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedEffectSummary {
  readonly installTransactionLogPreparedPipelineCalled: boolean
  readonly transactionCommitConnectionSourceCalled: boolean
  readonly transactionCommitConnectionAcknowledged: boolean
  readonly packageFilePersistentWriteAcknowledged: boolean
  readonly settingsLockfilePersistentWriterAcknowledged: boolean
  readonly transactionLogPrepareAuthorized: boolean
  readonly transactionLogPrepared: boolean
  readonly transactionLogWritten: boolean
  readonly transactionCommitted: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly packageFilesWritten: boolean
  readonly packageBackupsWritten: boolean
  readonly packageFilesRestored: false
  readonly lockfileWritten: boolean
  readonly lockfileRestored: false
  readonly settingsWritten: boolean
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_PIPELINE_MODE
  readonly status: ThirdPartyDataPackInstallTransactionLogPreparedPipelineStatus
  readonly reason: string
  readonly readOnly: boolean
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly transactionCommitConnectionSourceStatus?: string
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly transactionId?: string
  readonly transactionLogEntryHash?: Sha256Hash
  readonly storageKind?: typeof THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND
  readonly storageStatus?: ThirdPartyDataPackInstallTransactionLogPreparedStorageStatus
  readonly storageOperation?: 'prepare-install-transaction'
  readonly storageReason?: string
  readonly checks: readonly ThirdPartyDataPackInstallTransactionLogPreparedCheck[]
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackInstallTransactionLogPreparedEffectSummary
}

export interface CreateThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipelineOptions {
  readonly enabled?: boolean
  readonly allowPersistentTransactionLogPrepare?: boolean
  readonly readTransactionCommitConnectionSource?: () =>
    Awaitable<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult>
  readonly storage?: ThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter
  readonly transactionId?: string
  readonly createdAtIso?: string
}

const fileSystem = (
  options?: ThirdPartyDataPackInstallTransactionLogPreparedFileOptions
): ThirdPartyDataPackInstallTransactionLogPreparedFileSystem => ({
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  stat,
  unlink,
  ...options?.fileSystem
})

const readArrayLength = (value: readonly unknown[]): number | undefined => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  } catch {
    return undefined
  }
  return descriptor && 'value' in descriptor
    && typeof descriptor.value === 'number'
    && Number.isSafeInteger(descriptor.value)
    && descriptor.value >= 0
    ? descriptor.value
    : undefined
}

const cloneStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const length = readArrayLength(value)
  if (length === undefined) return []

  const result: string[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor && typeof descriptor.value === 'string') {
      result.push(descriptor.value)
    }
  }
  return Object.freeze(result) as string[]
}

const clonePackageIds = (value: unknown): PackageId[] =>
  cloneStringList(value) as PackageId[]

const cloneCandidateIdentity = (
  identity: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  if (identity === undefined || identity === null || typeof identity !== 'object') return undefined
  const candidate = identity as ThirdPartyCandidateIdentitySummary
  if (
    candidate.formatVersion !== 1
    || typeof candidate.contentHash !== 'string'
    || typeof candidate.snapshotHash !== 'string'
    || typeof candidate.candidateHash !== 'string'
  ) {
    return undefined
  }
  return Object.freeze({
    formatVersion: 1,
    contentHash: candidate.contentHash,
    snapshotHash: candidate.snapshotHash,
    candidateHash: candidate.candidateHash
  })
}

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    if (!Object.isFrozen(value)) Object.freeze(value)
    let keys: readonly (string | symbol)[]
    try {
      keys = Reflect.ownKeys(value as object)
    } catch {
      return value
    }
    for (const key of keys) {
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value as object, key)
      } catch {
        continue
      }
      if (descriptor?.enumerable === true && 'value' in descriptor) {
        deepFreezeObjectGraph(descriptor.value)
      }
    }
  }
  return value
}

const transactionDiagnostic = (
  stage: string,
  packageId?: PackageId
): ModDiagnostic => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
  stage,
  packageId,
  recovery: 'retry'
})

const storageEffects = (
  prepared = false
): ThirdPartyDataPackInstallTransactionLogPreparedStorageEffects => Object.freeze({
  transactionCommitted: false,
  transactionLogPrepared: prepared,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: false,
  lockfileRestored: false,
  settingsWritten: false,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: prepared,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const createStorageReport = (
  options: {
    readonly status: ThirdPartyDataPackInstallTransactionLogPreparedStorageStatus
    readonly reason: string
    readonly paths?: ThirdPartyDataPackInstallTransactionLogPreparedStoragePaths
    readonly prepared?: boolean
    readonly diagnostics?: readonly ModDiagnostic[]
  }
): ThirdPartyDataPackInstallTransactionLogPreparedStorageReport => deepFreezeObjectGraph({
  status: options.status,
  operation: 'prepare-install-transaction' as const,
  storageKind: THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND,
  reason: options.reason,
  paths: options.paths === undefined ? undefined : { ...options.paths },
  diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
  effects: storageEffects(options.prepared === true)
})

const assertInsideDirectory = (directory: string, candidate: string): void => {
  const relative = path.relative(path.resolve(directory), path.resolve(candidate))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('install transaction log prepared path escaped its directory')
  }
}

const assertInsideProgramDirectory = (programDirectoryPath: string, candidate: string): void => {
  const relative = path.relative(path.resolve(programDirectoryPath), path.resolve(candidate))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('install transaction log prepared path escaped its program directory')
  }
}

export const resolveThirdPartyDataPackInstallTransactionLogPreparedStoragePaths = (
  programDirectoryPath: string
): ThirdPartyDataPackInstallTransactionLogPreparedStoragePaths => {
  if (!path.isAbsolute(programDirectoryPath)) {
    throw new Error('programDirectoryPath must be absolute')
  }

  const resolvedProgramDirectoryPath = path.resolve(programDirectoryPath)
  const userDataPath = path.join(
    resolvedProgramDirectoryPath,
    THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_USERDATA_DIRECTORY_NAME
  )
  const transactionLogDirectoryPath = path.join(
    userDataPath,
    THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_DIRECTORY_NAME
  )
  const filePath = path.join(
    transactionLogDirectoryPath,
    THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_FILE_NAME
  )
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, userDataPath)
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, transactionLogDirectoryPath)
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, filePath)
  assertInsideDirectory(transactionLogDirectoryPath, filePath)
  return {
    programDirectoryPath: resolvedProgramDirectoryPath,
    userDataPath,
    transactionLogDirectoryPath,
    filePath
  }
}

const isNotFound = (error: unknown): boolean =>
  error !== null
  && typeof error === 'object'
  && 'code' in error
  && (error as { code?: unknown }).code === 'ENOENT'

const isTemporaryName = (name: string): boolean => name.startsWith(TEMP_FILE_PREFIX)

const calculateEntryHash = (
  entry: Omit<ThirdPartyDataPackInstallTransactionLogPreparedEntry, 'entryHash'>
): Sha256Hash => hashCanonicalJson(entry) as Sha256Hash

export const createThirdPartyDataPackInstallTransactionLogPreparedEntry = (
  connection: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult,
  options: {
    readonly transactionId?: string
    readonly createdAtIso?: string
  } = {}
): ThirdPartyDataPackInstallTransactionLogPreparedEntry => {
  const candidateIdentity = cloneCandidateIdentity(connection.candidateIdentity)
  if (
    connection.requestedCommandId !== 'install'
    || connection.targetPackageId === undefined
    || candidateIdentity === undefined
    || connection.lockfileHash === undefined
  ) {
    throw new Error('install transaction log prepared entry requires accepted install identity')
  }

  const body: Omit<ThirdPartyDataPackInstallTransactionLogPreparedEntry, 'entryHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-install-transaction-log-prepared',
    transactionId: options.transactionId ?? randomUUID(),
    operation: 'prepare-install-transaction',
    createdAtIso: options.createdAtIso ?? new Date().toISOString(),
    requestedCommandId: 'install',
    targetPackageId: connection.targetPackageId,
    selectedPackageIds: clonePackageIds(connection.selectedPackageIds),
    blockedPackageIds: clonePackageIds(connection.blockedPackageIds),
    loadOrder: clonePackageIds(connection.loadOrder),
    registryCount: connection.registryCount,
    entryCount: connection.entryCount,
    packageCount: connection.packageCount,
    candidateIdentity,
    lockfileHash: connection.lockfileHash,
    packageFileWriteAcknowledged: true,
    settingsLockfileWriteAcknowledged: true,
    transactionCommitConnectionAcknowledged: true
  }
  return deepFreezeObjectGraph({
    ...body,
    entryHash: calculateEntryHash(body)
  })
}

const assertInstallTransactionLogPreparedEntry = (
  value: unknown
): ThirdPartyDataPackInstallTransactionLogPreparedEntry => {
  assertPureJsonValue(value)
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('install transaction log prepared entry must be a JSON object')
  }
  const entry = value as ThirdPartyDataPackInstallTransactionLogPreparedEntry
  if (
    entry.formatVersion !== 1
    || entry.kind !== 'third-party-data-pack-install-transaction-log-prepared'
    || entry.operation !== 'prepare-install-transaction'
    || entry.requestedCommandId !== 'install'
    || typeof entry.transactionId !== 'string'
    || entry.transactionId.length < 1
    || typeof entry.createdAtIso !== 'string'
    || typeof entry.targetPackageId !== 'string'
    || typeof entry.lockfileHash !== 'string'
    || !/^sha256:[0-9a-f]{64}$/.test(entry.lockfileHash)
    || typeof entry.entryHash !== 'string'
    || !/^sha256:[0-9a-f]{64}$/.test(entry.entryHash)
    || !Array.isArray(entry.selectedPackageIds)
    || !Array.isArray(entry.blockedPackageIds)
    || !Array.isArray(entry.loadOrder)
    || !Number.isInteger(entry.registryCount)
    || !Number.isInteger(entry.entryCount)
    || !Number.isInteger(entry.packageCount)
    || entry.candidateIdentity?.candidateHash === undefined
    || entry.packageFileWriteAcknowledged !== true
    || entry.settingsLockfileWriteAcknowledged !== true
    || entry.transactionCommitConnectionAcknowledged !== true
  ) {
    throw new Error('install transaction log prepared entry structure is invalid')
  }
  const { entryHash: _entryHash, ...body } = entry
  if (entry.entryHash !== calculateEntryHash(body)) {
    throw new Error('install transaction log prepared entry self hash does not match its canonical body')
  }
  return entry
}

const createInstallTransactionLogPreparedText = (
  entry: ThirdPartyDataPackInstallTransactionLogPreparedEntry
): string => `${JSON.stringify(assertInstallTransactionLogPreparedEntry(entry), null, 2)}\n`

export const parseThirdPartyDataPackInstallTransactionLogPreparedText = (
  text: string
): ThirdPartyDataPackInstallTransactionLogPreparedEntry =>
  deepFreezeObjectGraph(assertInstallTransactionLogPreparedEntry(JSON.parse(text) as unknown))

const cleanupTemporaryFiles = async(
  paths: ThirdPartyDataPackInstallTransactionLogPreparedStoragePaths,
  options?: ThirdPartyDataPackInstallTransactionLogPreparedFileOptions
): Promise<void> => {
  const fs = fileSystem(options)
  const cutoff = Date.now() - (options?.staleTempAgeMs ?? DEFAULT_STALE_TEMP_AGE_MS)
  let entries
  try {
    entries = await fs.readdir(paths.transactionLogDirectoryPath, { withFileTypes: true })
  } catch (error) {
    if (isNotFound(error)) return
    throw error
  }

  await Promise.all(entries
    .filter(entry => entry.isFile() && isTemporaryName(entry.name))
    .map(async entry => {
      const temporaryPath = path.join(paths.transactionLogDirectoryPath, entry.name)
      assertInsideDirectory(paths.transactionLogDirectoryPath, temporaryPath)
      try {
        const fileStat = await fs.stat(temporaryPath)
        if (fileStat.mtimeMs > cutoff) return
        await fs.unlink(temporaryPath)
      } catch (error) {
        if (!isNotFound(error)) throw error
      }
    }))
}

const writePreparedFile = async(
  paths: ThirdPartyDataPackInstallTransactionLogPreparedStoragePaths,
  entry: ThirdPartyDataPackInstallTransactionLogPreparedEntry,
  options?: ThirdPartyDataPackInstallTransactionLogPreparedFileOptions
): Promise<void> => {
  const fs = fileSystem(options)
  const contents = createInstallTransactionLogPreparedText(entry)
  if (Buffer.byteLength(contents, 'utf8') > THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_MAX_BYTES) {
    throw new Error('install transaction log prepared entry exceeds the size limit')
  }

  await fs.mkdir(paths.transactionLogDirectoryPath, { recursive: true })
  await cleanupTemporaryFiles(paths, options)
  const temporaryPath = path.join(
    paths.transactionLogDirectoryPath,
    `${TEMP_FILE_PREFIX}${process.pid}-${randomUUID()}`
  )
  assertInsideDirectory(paths.transactionLogDirectoryPath, temporaryPath)
  let handle: Awaited<ReturnType<typeof open>> | null = null
  try {
    handle = await fs.open(temporaryPath, 'wx')
    await handle.writeFile(contents, 'utf8')
    await handle.sync()
    await handle.close()
    handle = null

    const reread = await fs.readFile(temporaryPath, 'utf8')
    if (reread !== contents) {
      throw new Error('install transaction log prepared temporary file changed before replace')
    }
    parseThirdPartyDataPackInstallTransactionLogPreparedText(reread)
    await options?.beforeReplace?.()
    await fs.rename(temporaryPath, paths.filePath)
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined)
    await fs.unlink(temporaryPath).catch(() => undefined)
    throw error
  }
}

const resolveProgramDirectoryPath = async(
  provider: ThirdPartyDataPackInstallTransactionLogPreparedStorageAdapterOptions['programDirectoryPath']
): Promise<string> => typeof provider === 'function' ? await provider() : provider

export const createThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter = (
  options: ThirdPartyDataPackInstallTransactionLogPreparedStorageAdapterOptions
): ThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter => ({
  async write(entry) {
    try {
      const paths = resolveThirdPartyDataPackInstallTransactionLogPreparedStoragePaths(
        await resolveProgramDirectoryPath(options.programDirectoryPath)
      )
      await writePreparedFile(paths, entry, options.fileOptions)
      return deepFreezeObjectGraph({
        report: createStorageReport({
          status: 'written',
          reason: 'program-directory userdata install transaction log prepared entry was atomically written',
          paths,
          prepared: true
        })
      })
    } catch {
      return deepFreezeObjectGraph({
        report: createStorageReport({
          status: 'failed',
          reason: 'program-directory userdata install transaction log prepared entry failed before publishing partial state',
          diagnostics: [
            transactionDiagnostic('third-party.install-transaction-log-prepared.storage.write')
          ]
        })
      })
    }
  }
})

const check = (
  id: ThirdPartyDataPackInstallTransactionLogPreparedCheckId,
  status: ThirdPartyDataPackInstallTransactionLogPreparedCheck['status'],
  reason: string
): ThirdPartyDataPackInstallTransactionLogPreparedCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackInstallTransactionLogPreparedCheck[] => Object.freeze([
  'transaction-commit-connection-accepted',
  'install-target-present',
  'candidate-identity-present',
  'lockfile-hash-present',
  'contained-writes-present',
  'no-upstream-commit-or-read-effects',
  'explicit-transaction-log-prepare-authorized',
  'storage-write-contained'
].map(id => check(id as ThirdPartyDataPackInstallTransactionLogPreparedCheckId, 'skipped', reason)))

const noUnexpectedConnectionEffects = (
  connection: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
): boolean => connection.effects.transactionCommitted === false
  && connection.effects.transactionLogPrepared === false
  && connection.effects.runtimePublicationCommitted === false
  && connection.effects.postCommitVerificationExecuted === false
  && connection.effects.uiIpcResponseDelivered === false
  && connection.effects.transactionLogRead === false
  && connection.effects.packageStateRead === false
  && connection.effects.settingsRead === false
  && connection.effects.lockfileRead === false
  && connection.effects.liveRegistryRead === false
  && connection.effects.saveCacheIsolationChecked === false
  && connection.effects.savesWritten === false
  && connection.effects.cacheWritten === false
  && connection.effects.transactionLogWritten === false
  && connection.effects.recoveryLogRead === false
  && connection.effects.recoveryLogReplayed === false
  && connection.effects.rollbackExecuted === false
  && connection.effects.diagnosticsWritten === false

const buildChecks = (
  connection: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult,
  authorized: boolean,
  storageReport?: ThirdPartyDataPackInstallTransactionLogPreparedStorageReport
): readonly ThirdPartyDataPackInstallTransactionLogPreparedCheck[] => Object.freeze([
  check(
    'transaction-commit-connection-accepted',
    connection.status === 'accepted' && connection.transactionCommitConnectionAcknowledged === true
      ? 'satisfied'
      : 'blocked',
    'Transaction log prepare requires an accepted transaction commit connection acknowledgement.'
  ),
  check(
    'install-target-present',
    connection.requestedCommandId === 'install' && connection.targetPackageId !== undefined
      ? 'satisfied'
      : 'blocked',
    'Transaction log prepare requires an install command target.'
  ),
  check(
    'candidate-identity-present',
    connection.candidateIdentity?.candidateHash !== undefined
      ? 'satisfied'
      : 'blocked',
    'Transaction log prepare requires a candidate identity.'
  ),
  check(
    'lockfile-hash-present',
    connection.lockfileHash !== undefined
      ? 'satisfied'
      : 'blocked',
    'Transaction log prepare requires the candidate lockfile hash.'
  ),
  check(
    'contained-writes-present',
    connection.persistentPackageWriteExecuted === true
      && connection.persistentSettingsLockfileWriteExecuted === true
      && connection.effects.packageFilesWritten === true
      && connection.effects.settingsWritten === true
      && connection.effects.lockfileWritten === true
      ? 'satisfied'
      : 'blocked',
    'Transaction log prepare requires prior contained package/settings/lockfile write acknowledgements.'
  ),
  check(
    'no-upstream-commit-or-read-effects',
    noUnexpectedConnectionEffects(connection) ? 'satisfied' : 'blocked',
    'Transaction log prepare requires upstream commit, persistent-read, runtime, UI/IPC and rollback effects to remain absent.'
  ),
  check(
    'explicit-transaction-log-prepare-authorized',
    authorized ? 'satisfied' : 'skipped',
    authorized
      ? 'This call explicitly authorized the contained transaction-log prepared write.'
      : 'Persistent transaction-log prepare is deferred until explicitly authorized.'
  ),
  check(
    'storage-write-contained',
    storageReport === undefined
      ? 'skipped'
      : storageReport.status === 'written'
        && storageReport.operation === 'prepare-install-transaction'
        && storageReport.effects.transactionLogPrepared === true
        && storageReport.effects.transactionLogWritten === true
        && storageReport.effects.transactionCommitted === false
        && storageReport.effects.packageFilesWritten === false
        && storageReport.effects.settingsWritten === false
        && storageReport.effects.lockfileWritten === false
        && storageReport.effects.savesWritten === false
        && storageReport.effects.cacheWritten === false
        && storageReport.effects.rollbackExecuted === false
        ? 'satisfied'
        : 'blocked',
    'Storage must report only a contained transaction-log prepared write.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackInstallTransactionLogPreparedCheck[],
  packageId?: PackageId
): readonly ModDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => transactionDiagnostic(
    `third-party.install-transaction-log-prepared.checks.${currentCheck.id}`,
    packageId
  )))

const effectSummary = (
  options: {
    readonly status: ThirdPartyDataPackInstallTransactionLogPreparedPipelineStatus
    readonly authorized: boolean
    readonly sourceCalled: boolean
    readonly connection?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
    readonly storageReport?: ThirdPartyDataPackInstallTransactionLogPreparedStorageReport
  }
): ThirdPartyDataPackInstallTransactionLogPreparedEffectSummary => {
  const prepared = options.status === 'prepared'
  return Object.freeze({
    installTransactionLogPreparedPipelineCalled: true,
    transactionCommitConnectionSourceCalled: options.sourceCalled,
    transactionCommitConnectionAcknowledged:
      options.connection?.effects.transactionCommitConnectionAcknowledged ?? false,
    packageFilePersistentWriteAcknowledged:
      options.connection?.effects.packageFilePersistentWriteAcknowledged ?? false,
    settingsLockfilePersistentWriterAcknowledged:
      options.connection?.effects.settingsLockfilePersistentWriterAcknowledged ?? false,
    transactionLogPrepareAuthorized: options.authorized,
    transactionLogPrepared: prepared,
    transactionLogWritten: prepared,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
    uiIpcResponseDelivered: false,
    packageFilesWritten: options.connection?.effects.packageFilesWritten ?? false,
    packageBackupsWritten: options.connection?.effects.packageBackupsWritten ?? false,
    packageFilesRestored: false,
    lockfileWritten: options.connection?.effects.lockfileWritten ?? false,
    lockfileRestored: false,
    settingsWritten: options.connection?.effects.settingsWritten ?? false,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    recoveryLogRead: false,
    recoveryLogReplayed: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })
}

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackInstallTransactionLogPreparedPipelineStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly authorized: boolean
    readonly connection?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
    readonly entry?: ThirdPartyDataPackInstallTransactionLogPreparedEntry
    readonly storageReport?: ThirdPartyDataPackInstallTransactionLogPreparedStorageReport
    readonly checks?: readonly ThirdPartyDataPackInstallTransactionLogPreparedCheck[]
    readonly diagnostics?: readonly ModDiagnostic[]
  }
): ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult => {
  const selectedPackageIds = clonePackageIds(options.connection?.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(options.connection?.blockedPackageIds)
  const loadOrder = clonePackageIds(options.connection?.loadOrder)
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const prepared = options.status === 'prepared'
  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: !prepared,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    transactionCommitConnectionSourceStatus: options.connection?.status,
    requestedCommandId: options.connection?.requestedCommandId,
    targetPackageId: options.connection?.targetPackageId,
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    registryCount: options.connection?.registryCount ?? 54,
    entryCount: options.connection?.entryCount ?? 4242,
    packageCount: options.connection?.packageCount ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(options.connection?.candidateIdentity),
    lockfileHash: options.connection?.lockfileHash,
    transactionId: options.entry?.transactionId,
    transactionLogEntryHash: options.entry?.entryHash,
    storageKind: options.storageReport?.storageKind,
    storageStatus: options.storageReport?.status,
    storageOperation: options.storageReport?.operation,
    storageReason: options.storageReport?.reason,
    checks: options.checks ?? skippedChecks(options.reason),
    diagnostics,
    effects: effectSummary(options)
  })
}

const evaluatePipeline = async(
  options: CreateThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipelineOptions
): Promise<ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party install transaction log prepared commit host connection pipeline is disabled by default',
      enabled: false,
      sourceCalled: false,
      authorized: false
    })
  }

  if (options.readTransactionCommitConnectionSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install transaction log prepare is enabled without a transaction commit connection source',
      enabled: true,
      sourceCalled: false,
      authorized: options.allowPersistentTransactionLogPrepare === true,
      diagnostics: [
        transactionDiagnostic('third-party.install-transaction-log-prepared.missing-connection-source')
      ]
    })
  }

  let connection: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
  try {
    connection = await options.readTransactionCommitConnectionSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction commit connection source failed before transaction log prepare',
      enabled: true,
      sourceCalled: true,
      authorized: options.allowPersistentTransactionLogPrepare === true,
      diagnostics: [
        transactionDiagnostic('third-party.install-transaction-log-prepared.connection-source-failed')
      ]
    })
  }

  if (connection.status === 'skipped') {
    return baseResult({
      status: 'skipped',
      reason: 'third-party transaction log prepare is not required because transaction commit connection was skipped',
      enabled: true,
      sourceCalled: true,
      authorized: options.allowPersistentTransactionLogPrepare === true,
      connection
    })
  }

  const authorized = options.allowPersistentTransactionLogPrepare === true
  const preChecks = buildChecks(connection, authorized)
  const preBlockedDiagnostics = diagnosticsForBlockedChecks(preChecks, connection.targetPackageId)
  if (preBlockedDiagnostics.length > 0) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install transaction log prepare requires an accepted contained transaction connection',
      enabled: true,
      sourceCalled: true,
      authorized,
      connection,
      checks: preChecks,
      diagnostics: preBlockedDiagnostics
    })
  }

  if (!authorized) {
    return baseResult({
      status: 'deferred',
      reason: 'third-party install transaction log prepare is deferred until explicitly authorized',
      enabled: true,
      sourceCalled: true,
      authorized,
      connection,
      checks: preChecks
    })
  }

  if (options.storage === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install transaction log prepare is authorized without a storage adapter',
      enabled: true,
      sourceCalled: true,
      authorized,
      connection,
      checks: preChecks,
      diagnostics: [
        transactionDiagnostic('third-party.install-transaction-log-prepared.missing-storage', connection.targetPackageId)
      ]
    })
  }

  const entry = createThirdPartyDataPackInstallTransactionLogPreparedEntry(connection, {
    transactionId: options.transactionId,
    createdAtIso: options.createdAtIso
  })
  let storageReport: ThirdPartyDataPackInstallTransactionLogPreparedStorageReport
  try {
    storageReport = (await options.storage.write(entry)).report
  } catch {
    return baseResult({
      status: 'failed',
      reason: 'third-party install transaction log prepare storage failed before returning a report',
      enabled: true,
      sourceCalled: true,
      authorized,
      connection,
      entry,
      checks: preChecks,
      diagnostics: [
        transactionDiagnostic('third-party.install-transaction-log-prepared.storage-failed', connection.targetPackageId)
      ]
    })
  }

  const writeChecks = buildChecks(connection, authorized, storageReport)
  const blockedDiagnostics = diagnosticsForBlockedChecks(writeChecks, connection.targetPackageId)
  if (storageReport.status !== 'written' || blockedDiagnostics.length > 0) {
    return baseResult({
      status: 'failed',
      reason: 'third-party install transaction log prepare storage did not complete a contained prepared write',
      enabled: true,
      sourceCalled: true,
      authorized,
      connection,
      entry,
      storageReport,
      checks: writeChecks,
      diagnostics: [
        ...storageReport.diagnostics,
        ...blockedDiagnostics
      ]
    })
  }

  return baseResult({
    status: 'prepared',
    reason: 'third-party install transaction log prepared entry was written after matching transaction commit connection',
    enabled: true,
    sourceCalled: true,
    authorized,
    connection,
    entry,
    storageReport,
    checks: writeChecks,
    diagnostics: storageReport.diagnostics
  })
}

export const createThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline = (
  options: CreateThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult>) => async() =>
  evaluatePipeline(options)

export const thirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline =
  createThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline()
