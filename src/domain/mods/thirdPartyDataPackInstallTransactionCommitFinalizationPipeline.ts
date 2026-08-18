import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
} from './thirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_COMMIT_FINALIZATION_PIPELINE_KIND =
  'third-party-install-transaction-commit-finalization-pipeline'
export const THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_COMMIT_FINALIZATION_PIPELINE_MODE =
  'default-disabled-install-transaction-commit-finalization-pipeline'

export type ThirdPartyDataPackInstallTransactionCommitFinalizationStatus =
  | 'committed'
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackInstallTransactionCommitFinalizationCheckId =
  | 'prepared-read-verification-source-present'
  | 'prepared-read-verification-verified'
  | 'transaction-log-entry-consistent'
  | 'install-target-present'
  | 'candidate-identity-present'
  | 'lockfile-hash-present'
  | 'package-summary-consistent'
  | 'contained-read-effects'
  | 'explicit-commit-finalization-authorized'
  | 'committed-acknowledgement-contained'

export interface ThirdPartyDataPackInstallTransactionCommitFinalizationCheck {
  readonly id: ThirdPartyDataPackInstallTransactionCommitFinalizationCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackInstallTransactionCommitFinalizationEffectSummary {
  readonly installTransactionCommitFinalizationPipelineCalled: boolean
  readonly installTransactionLogPreparedPersistentReadVerificationPipelineCalled: boolean
  readonly transactionLogPrepareAcknowledged: boolean
  readonly transactionLogReadVerificationAcknowledged: boolean
  readonly transactionCommitFinalizationAuthorized: boolean
  readonly transactionCommitted: boolean
  readonly transactionLogCommitted: boolean
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly transactionLogPrepared: boolean
  readonly transactionLogWritten: boolean
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

export interface ThirdPartyDataPackInstallTransactionCommitFinalizationResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_COMMIT_FINALIZATION_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_COMMIT_FINALIZATION_PIPELINE_MODE
  readonly status: ThirdPartyDataPackInstallTransactionCommitFinalizationStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly authorized: boolean
  readonly preparedReadVerificationStatus?:
    ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult['status']
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly transactionId?: string
  readonly transactionLogEntryHash?: Sha256Hash
  readonly readTransactionLogEntryHash?: Sha256Hash
  readonly committedTransactionId?: string
  readonly committedTransactionLogEntryHash?: Sha256Hash
  readonly checks: readonly ThirdPartyDataPackInstallTransactionCommitFinalizationCheck[]
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackInstallTransactionCommitFinalizationEffectSummary
}

export interface CreateThirdPartyDataPackInstallTransactionCommitFinalizationPipelineOptions {
  readonly enabled?: boolean
  readonly allowInstallTransactionCommitFinalization?: boolean
  readonly readPreparedTransactionLogVerification?: () =>
    Awaitable<ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult>
}

const forbiddenPreparedReadFields = [
  'preparedSource',
  'readInstallTransactionLogPreparedPipeline',
  'transactionLogReader',
  'transactionLogStorage',
  'storage',
  'storageAdapter',
  'fileSystem',
  'programDirectoryPath',
  'appDataDirectory',
  'contentUri',
  'fileUri',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'electronHost',
  'webHost',
  'androidHost',
  'window',
  'document',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

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

const hasOwnEnumerableField = (
  value: object,
  fieldName: string
): boolean => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return true
  }
  return descriptor?.enumerable === true
}

const preparedReadPathFree = (
  preparedRead: object | undefined
): boolean => preparedRead !== undefined
  && forbiddenPreparedReadFields.every(fieldName => !hasOwnEnumerableField(preparedRead, fieldName))

const packageListsEqual = (left: readonly PackageId[], right: readonly PackageId[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

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
  id: ThirdPartyDataPackInstallTransactionCommitFinalizationCheckId,
  status: ThirdPartyDataPackInstallTransactionCommitFinalizationCheck['status'],
  reason: string
): ThirdPartyDataPackInstallTransactionCommitFinalizationCheck =>
  Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackInstallTransactionCommitFinalizationCheck[] => Object.freeze([
  'prepared-read-verification-source-present',
  'prepared-read-verification-verified',
  'transaction-log-entry-consistent',
  'install-target-present',
  'candidate-identity-present',
  'lockfile-hash-present',
  'package-summary-consistent',
  'contained-read-effects',
  'explicit-commit-finalization-authorized',
  'committed-acknowledgement-contained'
].map(id => check(
  id as ThirdPartyDataPackInstallTransactionCommitFinalizationCheckId,
  'skipped',
  reason
)))

const preparedReadHasContainedEffects = (
  preparedRead: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
): boolean => preparedRead.readOnly === true
  && preparedRead.effects.transactionLogPrepareAcknowledged === true
  && preparedRead.effects.transactionLogReadVerified === true
  && preparedRead.effects.transactionLogPrepared === true
  && preparedRead.effects.transactionLogWritten === true
  && preparedRead.effects.transactionCommitted === false
  && preparedRead.effects.runtimePublicationCommitted === false
  && preparedRead.effects.postCommitVerificationExecuted === false
  && preparedRead.effects.uiIpcResponseDelivered === false
  && preparedRead.effects.transactionLogRead === true
  && preparedRead.effects.packageStateRead === false
  && preparedRead.effects.settingsRead === false
  && preparedRead.effects.lockfileRead === false
  && preparedRead.effects.liveRegistryRead === false
  && preparedRead.effects.savesWritten === false
  && preparedRead.effects.cacheWritten === false
  && preparedRead.effects.recoveryLogRead === false
  && preparedRead.effects.recoveryLogReplayed === false
  && preparedRead.effects.rollbackExecuted === false
  && preparedRead.effects.diagnosticsWritten === false
  && preparedReadPathFree(preparedRead)

const buildChecks = (
  preparedRead: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult | undefined,
  authorized: boolean
): readonly ThirdPartyDataPackInstallTransactionCommitFinalizationCheck[] => {
  const selectedPackageIds = clonePackageIds(preparedRead?.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(preparedRead?.blockedPackageIds)
  const loadOrder = clonePackageIds(preparedRead?.loadOrder)
  const entryHashConsistent = preparedRead?.transactionLogEntryHash !== undefined
    && preparedRead.readTransactionLogEntryHash !== undefined
    && preparedRead.transactionLogEntryHash === preparedRead.readTransactionLogEntryHash
  const candidateIdentity = cloneCandidateIdentity(preparedRead?.candidateIdentity)
  const packageSummaryConsistent = preparedRead !== undefined
    && Number.isSafeInteger(preparedRead.registryCount)
    && preparedRead.registryCount >= 54
    && Number.isSafeInteger(preparedRead.entryCount)
    && preparedRead.entryCount >= 4242
    && Number.isSafeInteger(preparedRead.packageCount)
    && preparedRead.packageCount === selectedPackageIds.length
    && packageListsEqual(selectedPackageIds, clonePackageIds(preparedRead.selectedPackageIds))
    && packageListsEqual(blockedPackageIds, clonePackageIds(preparedRead.blockedPackageIds))
    && packageListsEqual(loadOrder, clonePackageIds(preparedRead.loadOrder))
    && packageListsEqual(loadOrder, selectedPackageIds)

  return Object.freeze([
    check(
      'prepared-read-verification-source-present',
      preparedRead !== undefined ? 'satisfied' : 'blocked',
      'Install transaction commit finalization requires a prepared read verification source result.'
    ),
    check(
      'prepared-read-verification-verified',
      preparedRead?.status === 'verified' ? 'satisfied' : 'blocked',
      'Install transaction commit finalization requires a verified prepared transaction-log readback.'
    ),
    check(
      'transaction-log-entry-consistent',
      entryHashConsistent ? 'satisfied' : 'blocked',
      'Prepared and read transaction-log entry hashes must match before commit finalization.'
    ),
    check(
      'install-target-present',
      preparedRead?.requestedCommandId === 'install'
        && preparedRead.targetPackageId !== undefined
        && preparedRead.transactionId !== undefined
        ? 'satisfied'
        : 'blocked',
      'Install transaction commit finalization requires an install command target and transaction id.'
    ),
    check(
      'candidate-identity-present',
      candidateIdentity?.candidateHash !== undefined
        && preparedRead?.candidateIdentity?.candidateHash === candidateIdentity.candidateHash
        ? 'satisfied'
        : 'blocked',
      'Install transaction commit finalization requires a candidate identity hash.'
    ),
    check(
      'lockfile-hash-present',
      preparedRead?.lockfileHash !== undefined ? 'satisfied' : 'blocked',
      'Install transaction commit finalization requires the verified lockfile hash.'
    ),
    check(
      'package-summary-consistent',
      packageSummaryConsistent ? 'satisfied' : 'blocked',
      'Install transaction commit finalization requires consistent package lists and totals.'
    ),
    check(
      'contained-read-effects',
      preparedRead !== undefined && preparedReadHasContainedEffects(preparedRead)
        ? 'satisfied'
        : 'blocked',
      'Install transaction commit finalization requires prior prepared read effects to remain contained and path-free.'
    ),
    check(
      'explicit-commit-finalization-authorized',
      authorized ? 'satisfied' : 'skipped',
      authorized
        ? 'This call explicitly authorized the contained install transaction commit finalization acknowledgement.'
        : 'Install transaction commit finalization is deferred until explicitly authorized.'
    ),
    check(
      'committed-acknowledgement-contained',
      authorized && preparedRead?.status === 'verified' && preparedReadHasContainedEffects(preparedRead)
        ? 'satisfied'
        : 'skipped',
      'Commit finalization only emits a path-free acknowledgement and does not publish runtime state or write saves/cache.'
    )
  ])
}

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackInstallTransactionCommitFinalizationCheck[],
  packageId?: PackageId
): readonly ModDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => transactionDiagnostic(
    `third-party.install-transaction-commit-finalization.checks.${currentCheck.id}`,
    packageId
  )))

const effectSummary = (
  options: {
    readonly status: ThirdPartyDataPackInstallTransactionCommitFinalizationStatus
    readonly sourceCalled: boolean
    readonly authorized: boolean
    readonly preparedRead?: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
  }
): ThirdPartyDataPackInstallTransactionCommitFinalizationEffectSummary => {
  const committed = options.status === 'committed'
  return Object.freeze({
    installTransactionCommitFinalizationPipelineCalled: true,
    installTransactionLogPreparedPersistentReadVerificationPipelineCalled: options.sourceCalled,
    transactionLogPrepareAcknowledged:
      options.preparedRead?.effects.transactionLogPrepareAcknowledged ?? false,
    transactionLogReadVerificationAcknowledged:
      options.preparedRead?.effects.transactionLogReadVerified ?? false,
    transactionCommitFinalizationAuthorized: options.authorized,
    transactionCommitted: committed,
    transactionLogCommitted: committed,
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
    uiIpcResponseDelivered: false,
    transactionLogPrepared: options.preparedRead?.effects.transactionLogPrepared ?? false,
    transactionLogWritten: options.preparedRead?.effects.transactionLogWritten ?? false,
    transactionLogRead: options.preparedRead?.effects.transactionLogRead ?? false,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveCacheIsolationChecked: false,
    packageFilesWritten: options.preparedRead?.effects.packageFilesWritten ?? false,
    packageBackupsWritten: options.preparedRead?.effects.packageBackupsWritten ?? false,
    packageFilesRestored: false,
    lockfileWritten: options.preparedRead?.effects.lockfileWritten ?? false,
    lockfileRestored: false,
    settingsWritten: options.preparedRead?.effects.settingsWritten ?? false,
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
    readonly status: ThirdPartyDataPackInstallTransactionCommitFinalizationStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly authorized: boolean
    readonly preparedRead?: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
    readonly checks?: readonly ThirdPartyDataPackInstallTransactionCommitFinalizationCheck[]
    readonly diagnostics?: readonly ModDiagnostic[]
  }
): ThirdPartyDataPackInstallTransactionCommitFinalizationResult => {
  const selectedPackageIds = clonePackageIds(options.preparedRead?.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(options.preparedRead?.blockedPackageIds)
  const loadOrder = clonePackageIds(options.preparedRead?.loadOrder)
  const committed = options.status === 'committed'
  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_COMMIT_FINALIZATION_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_INSTALL_TRANSACTION_COMMIT_FINALIZATION_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true as const,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    authorized: options.authorized,
    preparedReadVerificationStatus: options.preparedRead?.status,
    requestedCommandId: options.preparedRead?.requestedCommandId,
    targetPackageId: options.preparedRead?.targetPackageId,
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    registryCount: options.preparedRead?.registryCount ?? 54,
    entryCount: options.preparedRead?.entryCount ?? 4242,
    packageCount: options.preparedRead?.packageCount ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(options.preparedRead?.candidateIdentity),
    candidateHash: options.preparedRead?.candidateIdentity?.candidateHash,
    lockfileHash: options.preparedRead?.lockfileHash,
    transactionId: options.preparedRead?.transactionId,
    transactionLogEntryHash: options.preparedRead?.transactionLogEntryHash,
    readTransactionLogEntryHash: options.preparedRead?.readTransactionLogEntryHash,
    committedTransactionId: committed ? options.preparedRead?.transactionId : undefined,
    committedTransactionLogEntryHash: committed ? options.preparedRead?.transactionLogEntryHash : undefined,
    checks: options.checks ?? skippedChecks(options.reason),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary(options)
  })
}

const evaluatePipeline = async(
  options: CreateThirdPartyDataPackInstallTransactionCommitFinalizationPipelineOptions
): Promise<ThirdPartyDataPackInstallTransactionCommitFinalizationResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party install transaction commit finalization pipeline is disabled by default',
      enabled: false,
      sourceCalled: false,
      authorized: false
    })
  }

  const authorized = options.allowInstallTransactionCommitFinalization === true
  if (options.readPreparedTransactionLogVerification === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install transaction commit finalization is enabled without a prepared read verification source',
      enabled: true,
      sourceCalled: false,
      authorized,
      diagnostics: [
        transactionDiagnostic('third-party.install-transaction-commit-finalization.missing-source')
      ]
    })
  }

  let preparedRead: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
  try {
    preparedRead = await options.readPreparedTransactionLogVerification()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party prepared transaction-log read verification failed before commit finalization',
      enabled: true,
      sourceCalled: true,
      authorized,
      diagnostics: [
        transactionDiagnostic('third-party.install-transaction-commit-finalization.source-failed')
      ]
    })
  }

  if (preparedRead.status === 'skipped') {
    return baseResult({
      status: 'skipped',
      reason: 'third-party install transaction commit finalization is not required because prepared read verification was skipped',
      enabled: true,
      sourceCalled: true,
      authorized,
      preparedRead
    })
  }

  const checks = buildChecks(preparedRead, authorized)
  const blockingChecksBeforeAuthorization = checks.filter(currentCheck =>
    currentCheck.status === 'blocked'
      && currentCheck.id !== 'explicit-commit-finalization-authorized'
      && currentCheck.id !== 'committed-acknowledgement-contained'
  )
  if (blockingChecksBeforeAuthorization.length > 0) {
    return baseResult({
      status: preparedRead.status === 'deferred' ? 'deferred' : 'blocked',
      reason: preparedRead.status === 'deferred'
        ? 'third-party install transaction commit finalization is deferred until prepared read verification is verified'
        : 'third-party install transaction commit finalization requires a verified contained prepared readback',
      enabled: true,
      sourceCalled: true,
      authorized,
      preparedRead,
      checks,
      diagnostics: preparedRead.status === 'deferred'
        ? []
        : diagnosticsForBlockedChecks(checks, preparedRead.targetPackageId)
    })
  }

  if (!authorized) {
    return baseResult({
      status: 'deferred',
      reason: 'third-party install transaction commit finalization is deferred until explicitly authorized',
      enabled: true,
      sourceCalled: true,
      authorized,
      preparedRead,
      checks
    })
  }

  return baseResult({
    status: 'committed',
    reason: 'third-party install transaction commit finalization emitted a contained committed acknowledgement',
    enabled: true,
    sourceCalled: true,
    authorized,
    preparedRead,
    checks
  })
}

export const createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline = (
  options: CreateThirdPartyDataPackInstallTransactionCommitFinalizationPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackInstallTransactionCommitFinalizationResult>) => async() =>
  evaluatePipeline(options)

export const thirdPartyDataPackInstallTransactionCommitFinalizationPipeline =
  createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline()
