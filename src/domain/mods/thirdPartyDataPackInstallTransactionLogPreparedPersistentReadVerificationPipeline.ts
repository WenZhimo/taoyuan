import { readFile, stat } from 'node:fs/promises'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import {
  parseThirdPartyDataPackInstallTransactionLogPreparedText,
  resolveThirdPartyDataPackInstallTransactionLogPreparedStoragePaths,
  THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_MAX_BYTES,
  type ThirdPartyDataPackInstallTransactionLogPreparedEntry,
  type ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
} from './thirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_PERSISTENT_READ_VERIFICATION_PIPELINE_KIND =
  'third-party-install-transaction-log-prepared-persistent-read-verification-pipeline'
export const THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_PERSISTENT_READ_VERIFICATION_PIPELINE_MODE =
  'default-disabled-install-transaction-log-prepared-persistent-read-verification-pipeline'

export type ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationStatus =
  | 'verified'
  | 'deferred'
  | 'skipped'
  | 'blocked'
  | 'failed'

export type ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheckId =
  | 'prepared-pipeline-prepared'
  | 'transaction-log-read-verification-authorized'
  | 'program-directory-present'
  | 'transaction-log-file-readable'
  | 'entry-hash-matched'
  | 'install-target-consistent'
  | 'candidate-hash-consistent'
  | 'lockfile-hash-consistent'
  | 'package-summary-consistent'
  | 'contained-read-effects'

export interface ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck {
  readonly id: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationFileSystem {
  readFile: typeof readFile
  stat: typeof stat
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationFileOptions {
  readonly fileSystem?: Partial<ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationFileSystem>
}

export interface ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationEffectSummary {
  readonly installTransactionLogPreparedPersistentReadVerificationPipelineCalled: boolean
  readonly installTransactionLogPreparedPipelineCalled: boolean
  readonly transactionLogPrepareAcknowledged: boolean
  readonly transactionLogReadVerificationAuthorized: boolean
  readonly transactionLogReadVerified: boolean
  readonly transactionLogPrepared: boolean
  readonly transactionLogWritten: boolean
  readonly transactionCommitted: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly transactionLogRead: boolean
  readonly packageStateRead: false
  readonly settingsRead: false
  readonly lockfileRead: false
  readonly liveRegistryRead: false
  readonly saveCacheIsolationChecked: false
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

export interface ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_PERSISTENT_READ_VERIFICATION_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_PERSISTENT_READ_VERIFICATION_PIPELINE_MODE
  readonly status: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly authorized: boolean
  readonly preparedPipelineStatus?: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult['status']
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
  readonly readTransactionLogEntryHash?: Sha256Hash
  readonly checks: readonly ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck[]
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationEffectSummary
}

export interface CreateThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipelineOptions {
  readonly enabled?: boolean
  readonly allowPersistentTransactionLogReadVerification?: boolean
  readonly readInstallTransactionLogPreparedPipeline?: () =>
    Awaitable<ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult>
  readonly programDirectoryPath?: string | (() => string | Promise<string>)
  readonly fileOptions?: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationFileOptions
}

const fileSystem = (
  options?: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationFileOptions
): ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationFileSystem => ({
  readFile,
  stat,
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

const check = (
  id: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheckId,
  status: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck['status'],
  reason: string
): ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck =>
  Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck[] => Object.freeze([
  'prepared-pipeline-prepared',
  'transaction-log-read-verification-authorized',
  'program-directory-present',
  'transaction-log-file-readable',
  'entry-hash-matched',
  'install-target-consistent',
  'candidate-hash-consistent',
  'lockfile-hash-consistent',
  'package-summary-consistent',
  'contained-read-effects'
].map(id => check(
  id as ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheckId,
  'skipped',
  reason
)))

const packageListsEqual = (left: readonly PackageId[], right: readonly PackageId[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const preparedResultHasContainedEffects = (
  prepared: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
): boolean => prepared.effects.transactionLogPrepared === true
  && prepared.effects.transactionLogWritten === true
  && prepared.effects.transactionCommitted === false
  && prepared.effects.runtimePublicationCommitted === false
  && prepared.effects.postCommitVerificationExecuted === false
  && prepared.effects.uiIpcResponseDelivered === false
  && prepared.effects.savesWritten === false
  && prepared.effects.cacheWritten === false
  && prepared.effects.recoveryLogRead === false
  && prepared.effects.recoveryLogReplayed === false
  && prepared.effects.rollbackExecuted === false
  && prepared.effects.diagnosticsWritten === false

const buildChecks = (
  options: {
    readonly prepared?: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
    readonly entry?: ThirdPartyDataPackInstallTransactionLogPreparedEntry
    readonly authorized: boolean
    readonly programDirectoryPresent: boolean
    readonly fileReadable: boolean
  }
): readonly ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck[] => {
  const prepared = options.prepared
  const entry = options.entry
  const selectedPackageIds = clonePackageIds(prepared?.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(prepared?.blockedPackageIds)
  const loadOrder = clonePackageIds(prepared?.loadOrder)
  return Object.freeze([
    check(
      'prepared-pipeline-prepared',
      prepared?.status === 'prepared' && prepared.transactionLogEntryHash !== undefined
        ? 'satisfied'
        : 'blocked',
      'Persistent transaction-log read verification requires a prepared transaction-log pipeline result.'
    ),
    check(
      'transaction-log-read-verification-authorized',
      options.authorized ? 'satisfied' : 'skipped',
      options.authorized
        ? 'This call explicitly authorized the contained transaction-log read verification.'
        : 'Persistent transaction-log read verification is deferred until explicitly authorized.'
    ),
    check(
      'program-directory-present',
      !options.authorized
        ? 'skipped'
        : options.programDirectoryPresent
          ? 'satisfied'
          : 'blocked',
      options.authorized
        ? 'Persistent transaction-log read verification requires an injected program directory.'
        : 'Program-directory access is skipped until persistent transaction-log read verification is authorized.'
    ),
    check(
      'transaction-log-file-readable',
      options.fileReadable ? 'satisfied' : entry === undefined ? 'skipped' : 'blocked',
      'Persistent transaction-log read verification requires the prepared transaction-log file to be readable.'
    ),
    check(
      'entry-hash-matched',
      entry !== undefined && prepared?.transactionLogEntryHash === entry.entryHash
        ? 'satisfied'
        : entry === undefined
          ? 'skipped'
          : 'blocked',
      'Read transaction-log entry hash must match the prepared pipeline acknowledgement.'
    ),
    check(
      'install-target-consistent',
      entry !== undefined
        && prepared?.requestedCommandId === 'install'
        && entry.requestedCommandId === 'install'
        && prepared.targetPackageId === entry.targetPackageId
        && prepared.transactionId === entry.transactionId
        ? 'satisfied'
        : entry === undefined
          ? 'skipped'
          : 'blocked',
      'Read transaction-log entry must target the same install command and transaction id.'
    ),
    check(
      'candidate-hash-consistent',
      entry !== undefined
        && prepared?.candidateIdentity?.candidateHash !== undefined
        && prepared.candidateIdentity.candidateHash === entry.candidateIdentity.candidateHash
        ? 'satisfied'
        : entry === undefined
          ? 'skipped'
          : 'blocked',
      'Read transaction-log entry candidate hash must match the prepared pipeline acknowledgement.'
    ),
    check(
      'lockfile-hash-consistent',
      entry !== undefined
        && prepared?.lockfileHash !== undefined
        && prepared.lockfileHash === entry.lockfileHash
        ? 'satisfied'
        : entry === undefined
          ? 'skipped'
          : 'blocked',
      'Read transaction-log entry lockfile hash must match the prepared pipeline acknowledgement.'
    ),
    check(
      'package-summary-consistent',
      entry !== undefined
        && prepared !== undefined
        && prepared.registryCount === entry.registryCount
        && prepared.entryCount === entry.entryCount
        && prepared.packageCount === entry.packageCount
        && packageListsEqual(selectedPackageIds, entry.selectedPackageIds)
        && packageListsEqual(blockedPackageIds, entry.blockedPackageIds)
        && packageListsEqual(loadOrder, entry.loadOrder)
        ? 'satisfied'
        : entry === undefined
          ? 'skipped'
          : 'blocked',
      'Read transaction-log entry package summary must match the prepared pipeline acknowledgement.'
    ),
    check(
      'contained-read-effects',
      prepared !== undefined && preparedResultHasContainedEffects(prepared)
        ? 'satisfied'
        : 'blocked',
      'Persistent transaction-log read verification requires prior write effects to remain contained.'
    )
  ])
}

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck[],
  packageId?: PackageId
): readonly ModDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => transactionDiagnostic(
    `third-party.install-transaction-log-prepared.read-verification.checks.${currentCheck.id}`,
    packageId
  )))

const resolveProgramDirectoryPath = async(
  provider: CreateThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipelineOptions['programDirectoryPath']
): Promise<string | undefined> => typeof provider === 'function' ? await provider() : provider

const readPreparedEntry = async(
  options: CreateThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipelineOptions
): Promise<ThirdPartyDataPackInstallTransactionLogPreparedEntry> => {
  const programDirectoryPath = await resolveProgramDirectoryPath(options.programDirectoryPath)
  if (programDirectoryPath === undefined) {
    throw new Error('programDirectoryPath is required')
  }
  const fs = fileSystem(options.fileOptions)
  const paths = resolveThirdPartyDataPackInstallTransactionLogPreparedStoragePaths(programDirectoryPath)
  const fileStat = await fs.stat(paths.filePath)
  if (fileStat.size > THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_MAX_BYTES) {
    throw new Error('install transaction log prepared file exceeds the size limit')
  }
  const text = await fs.readFile(paths.filePath, 'utf8') as string
  return parseThirdPartyDataPackInstallTransactionLogPreparedText(text)
}

const effectSummary = (
  options: {
    readonly status: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationStatus
    readonly sourceCalled: boolean
    readonly authorized: boolean
    readonly prepared?: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
  }
): ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationEffectSummary => {
  const verified = options.status === 'verified'
  return Object.freeze({
    installTransactionLogPreparedPersistentReadVerificationPipelineCalled: true,
    installTransactionLogPreparedPipelineCalled: options.sourceCalled,
    transactionLogPrepareAcknowledged: options.prepared?.status === 'prepared',
    transactionLogReadVerificationAuthorized: options.authorized,
    transactionLogReadVerified: verified,
    transactionLogPrepared: options.prepared?.effects.transactionLogPrepared ?? false,
    transactionLogWritten: options.prepared?.effects.transactionLogWritten ?? false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
    uiIpcResponseDelivered: false,
    transactionLogRead: verified,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveCacheIsolationChecked: false,
    packageFilesWritten: options.prepared?.effects.packageFilesWritten ?? false,
    packageBackupsWritten: options.prepared?.effects.packageBackupsWritten ?? false,
    packageFilesRestored: false,
    lockfileWritten: options.prepared?.effects.lockfileWritten ?? false,
    lockfileRestored: false,
    settingsWritten: options.prepared?.effects.settingsWritten ?? false,
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
    readonly status: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly authorized: boolean
    readonly prepared?: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
    readonly entry?: ThirdPartyDataPackInstallTransactionLogPreparedEntry
    readonly checks?: readonly ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck[]
    readonly diagnostics?: readonly ModDiagnostic[]
  }
): ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult => {
  const selectedPackageIds = clonePackageIds(options.prepared?.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(options.prepared?.blockedPackageIds)
  const loadOrder = clonePackageIds(options.prepared?.loadOrder)
  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_PERSISTENT_READ_VERIFICATION_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_LOG_PREPARED_PERSISTENT_READ_VERIFICATION_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true as const,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    authorized: options.authorized,
    preparedPipelineStatus: options.prepared?.status,
    requestedCommandId: options.prepared?.requestedCommandId,
    targetPackageId: options.prepared?.targetPackageId,
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    registryCount: options.prepared?.registryCount ?? 54,
    entryCount: options.prepared?.entryCount ?? 4242,
    packageCount: options.prepared?.packageCount ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(options.prepared?.candidateIdentity),
    lockfileHash: options.prepared?.lockfileHash,
    transactionId: options.prepared?.transactionId,
    transactionLogEntryHash: options.prepared?.transactionLogEntryHash,
    readTransactionLogEntryHash: options.entry?.entryHash,
    checks: options.checks ?? skippedChecks(options.reason),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary(options)
  })
}

const evaluatePipeline = async(
  options: CreateThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipelineOptions
): Promise<ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party install transaction-log prepared persistent read verification pipeline is disabled by default',
      enabled: false,
      sourceCalled: false,
      authorized: false
    })
  }

  const authorized = options.allowPersistentTransactionLogReadVerification === true
  if (options.readInstallTransactionLogPreparedPipeline === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction-log prepared read verification is enabled without a prepared pipeline source',
      enabled: true,
      sourceCalled: false,
      authorized,
      diagnostics: [
        transactionDiagnostic('third-party.install-transaction-log-prepared.read-verification.missing-source')
      ]
    })
  }

  let prepared: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
  try {
    prepared = await options.readInstallTransactionLogPreparedPipeline()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction-log prepared pipeline failed before persistent read verification',
      enabled: true,
      sourceCalled: true,
      authorized,
      diagnostics: [
        transactionDiagnostic('third-party.install-transaction-log-prepared.read-verification.source-failed')
      ]
    })
  }

  if (prepared.status === 'skipped') {
    return baseResult({
      status: 'skipped',
      reason: 'third-party transaction-log prepared read verification is not required because prepare was skipped',
      enabled: true,
      sourceCalled: true,
      authorized,
      prepared
    })
  }

  const preChecks = buildChecks({
    prepared,
    authorized,
    programDirectoryPresent: options.programDirectoryPath !== undefined,
    fileReadable: false
  })
  const blockingChecksBeforeRead = preChecks.filter(currentCheck =>
    currentCheck.status === 'blocked'
      && currentCheck.id !== 'transaction-log-file-readable'
      && currentCheck.id !== 'entry-hash-matched'
      && currentCheck.id !== 'install-target-consistent'
      && currentCheck.id !== 'candidate-hash-consistent'
      && currentCheck.id !== 'lockfile-hash-consistent'
      && currentCheck.id !== 'package-summary-consistent'
      && currentCheck.id !== 'transaction-log-read-verification-authorized'
      && currentCheck.id !== 'program-directory-present'
  )
  const blockedBeforeAuth = diagnosticsForBlockedChecks(blockingChecksBeforeRead, prepared.targetPackageId)
  if (blockedBeforeAuth.length > 0) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction-log read verification requires a contained prepared transaction-log acknowledgement',
      enabled: true,
      sourceCalled: true,
      authorized,
      prepared,
      checks: preChecks,
      diagnostics: blockedBeforeAuth
    })
  }

  if (!authorized) {
    return baseResult({
      status: 'deferred',
      reason: 'third-party transaction-log persistent read verification is deferred until explicitly authorized',
      enabled: true,
      sourceCalled: true,
      authorized,
      prepared,
      checks: preChecks
    })
  }

  if (options.programDirectoryPath === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction-log read verification is authorized without a program directory',
      enabled: true,
      sourceCalled: true,
      authorized,
      prepared,
      checks: preChecks,
      diagnostics: [
        transactionDiagnostic(
          'third-party.install-transaction-log-prepared.read-verification.missing-program-directory',
          prepared.targetPackageId
        )
      ]
    })
  }

  let entry: ThirdPartyDataPackInstallTransactionLogPreparedEntry
  try {
    entry = await readPreparedEntry(options)
  } catch {
    return baseResult({
      status: 'failed',
      reason: 'third-party transaction-log prepared entry could not be read and verified from the injected program directory',
      enabled: true,
      sourceCalled: true,
      authorized,
      prepared,
      checks: preChecks,
      diagnostics: [
        transactionDiagnostic(
          'third-party.install-transaction-log-prepared.read-verification.read-failed',
          prepared.targetPackageId
        )
      ]
    })
  }

  const readChecks = buildChecks({
    prepared,
    entry,
    authorized,
    programDirectoryPresent: true,
    fileReadable: true
  })
  const blockedDiagnostics = diagnosticsForBlockedChecks(readChecks, prepared.targetPackageId)
  if (blockedDiagnostics.length > 0) {
    return baseResult({
      status: 'failed',
      reason: 'third-party transaction-log prepared entry does not match the prepared pipeline acknowledgement',
      enabled: true,
      sourceCalled: true,
      authorized,
      prepared,
      entry,
      checks: readChecks,
      diagnostics: blockedDiagnostics
    })
  }

  return baseResult({
    status: 'verified',
    reason: 'third-party transaction-log prepared entry was read back and matched the prepared pipeline acknowledgement',
    enabled: true,
    sourceCalled: true,
    authorized,
    prepared,
    entry,
    checks: readChecks
  })
}

export const createThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline = (
  options: CreateThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult>) => async() =>
  evaluatePipeline(options)

export const thirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline =
  createThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline()
