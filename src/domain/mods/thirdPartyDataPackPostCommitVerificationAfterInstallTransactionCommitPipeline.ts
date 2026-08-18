import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline,
  type CreateThirdPartyDataPackInstallTransactionCommitFinalizationPipelineOptions,
  type ThirdPartyDataPackInstallTransactionCommitFinalizationResult
} from './thirdPartyDataPackInstallTransactionCommitFinalizationPipeline'
import {
  createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline,
  type CreateThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipelineOptions
} from './thirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline'
import {
  ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError,
  type ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
} from './thirdPartyDataPackPostCommitVerificationReadAcknowledgementSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_AFTER_INSTALL_TRANSACTION_COMMIT_PIPELINE_KIND =
  'third-party-post-commit-verification-after-install-transaction-commit-pipeline'
export const THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_AFTER_INSTALL_TRANSACTION_COMMIT_PIPELINE_MODE =
  'default-disabled-post-commit-verification-after-install-transaction-commit-pipeline'

export type ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineStatus =
  | 'ready'
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitCheckId =
  | 'install-transaction-committed'
  | 'post-commit-read-acknowledgement-ready'
  | 'install-target-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'package-summary-consistent'
  | 'transaction-commit-identity-present'
  | 'verified-outcome-only'
  | 'persistent-read-proofs-ready'
  | 'contained-effects-intact'

export interface ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitCheck {
  readonly id: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitEffectSummary {
  readonly postCommitVerificationAfterInstallTransactionCommitPipelineCalled: boolean
  readonly installTransactionCommitFinalizationPipelineCalled: boolean
  readonly postCommitVerificationReadAcknowledgementPipelineCalled: boolean
  readonly transactionCommitted: boolean
  readonly transactionLogCommitted: boolean
  readonly postCommitVerificationAcknowledged: boolean
  readonly persistentReadProofAcknowledged: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly modManagementUiMounted: false
  readonly electronIpcExposed: false
  readonly webFilePickerOpened: false
  readonly androidFilePickerOpened: false
  readonly commandDispatcherCalled: false
  readonly commandDispatched: false
  readonly atomicCommitExecutorCalled: false
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

export interface ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_AFTER_INSTALL_TRANSACTION_COMMIT_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_AFTER_INSTALL_TRANSACTION_COMMIT_PIPELINE_MODE
  readonly status: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly installTransactionCommitFinalizationSourceCalled: boolean
  readonly postCommitVerificationReadAcknowledgementSourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly installTransactionCommitFinalizationStatus?: ThirdPartyDataPackInstallTransactionCommitFinalizationResult['status']
  readonly postCommitVerificationReadAcknowledgementStatus?: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult['status']
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly verificationOutcomeKind?: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult['verificationOutcomeKind']
  readonly transactionLogMatched: boolean
  readonly packageStateMatched: boolean
  readonly settingsLockfileMatched: boolean
  readonly liveRegistryMatched: boolean
  readonly saveCacheIsolated: boolean
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
  readonly committedTransactionId?: string
  readonly committedTransactionLogEntryHash?: Sha256Hash
  readonly checks: readonly ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitEffectSummary
}

export interface CreateThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineOptions
  extends Omit<CreateThirdPartyDataPackInstallTransactionCommitFinalizationPipelineOptions, 'enabled'>,
    Omit<CreateThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipelineOptions, 'enabled'> {
  readonly enabled?: boolean
  readonly readInstallTransactionCommitFinalization?: () =>
    Awaitable<ThirdPartyDataPackInstallTransactionCommitFinalizationResult>
  readonly readPostCommitVerificationReadAcknowledgement?: () =>
    Awaitable<ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult>
}

const forbiddenFinalizationFields = [
  'preparedReadVerificationSource',
  'readPreparedTransactionLogVerification',
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
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'window',
  'document'
] as const

const forbiddenAcknowledgementFields = [
  'postCommitVerificationReadAcknowledgementHost',
  'acknowledgementHost',
  'postCommitVerificationExecutorSource',
  'postCommitPersistentVerificationReadSource',
  'postCommitVerificationExecutorAdapter',
  'postCommitPersistentReadsSource',
  'verificationRequest',
  'outcome',
  'persistentReadsHost',
  'verificationHost',
  'transactionLogReader',
  'packageStateReader',
  'settingsReader',
  'lockfileReader',
  'liveRegistryReader',
  'saveCacheReader',
  'packageWriter',
  'packageFileWriter',
  'packageBackupWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'recoveryLogStorage',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'appDataDirectory',
  'contentUri',
  'fileUri',
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'window',
  'document'
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

const readOwnDataField = (
  value: object | undefined,
  fieldName: string
): unknown => {
  if (value === undefined) return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object | undefined,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
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

const cloneCandidateIdentity = (
  identity: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  if (identity === undefined || identity === null || typeof identity !== 'object') return undefined
  const formatVersion = readOwnDataField(identity, 'formatVersion')
  const contentHash = readOwnStringField(identity, 'contentHash')
  const snapshotHash = readOwnStringField(identity, 'snapshotHash')
  const candidateHash = readOwnStringField(identity, 'candidateHash')
  if (formatVersion !== 1 || contentHash === undefined || snapshotHash === undefined || candidateHash === undefined) {
    return undefined
  }
  return Object.freeze({
    formatVersion: 1,
    contentHash: contentHash as Sha256Hash,
    snapshotHash: snapshotHash as Sha256Hash,
    candidateHash: candidateHash as Sha256Hash
  })
}

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
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

const arraysEqual = (
  left: readonly string[],
  right: readonly string[]
): boolean => left.length === right.length && left.every((value, index) => value === right[index])

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const check = (
  id: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitCheckId,
  status: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitCheck['status'],
  reason: string
): ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitCheck =>
  Object.freeze({ id, status, reason })

const terminalChecks = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitCheck[] => Object.freeze([
  'install-transaction-committed',
  'post-commit-read-acknowledgement-ready',
  'install-target-consistent',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'package-summary-consistent',
  'transaction-commit-identity-present',
  'verified-outcome-only',
  'persistent-read-proofs-ready',
  'contained-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitCheckId,
  status,
  reason
)))

const pathFreeFinalization = (
  finalization: object | undefined
): boolean => finalization !== undefined
  && forbiddenFinalizationFields.every(fieldName => !hasOwnEnumerableField(finalization, fieldName))

const pathFreeAcknowledgement = (
  acknowledgement: object | undefined
): boolean => acknowledgement !== undefined
  && forbiddenAcknowledgementFields.every(fieldName => !hasOwnEnumerableField(acknowledgement, fieldName))

const finalizationContainedEffects = (
  finalization: ThirdPartyDataPackInstallTransactionCommitFinalizationResult | undefined
): boolean => finalization !== undefined
  && finalization.readOnly === true
  && finalization.effects.transactionCommitted === true
  && finalization.effects.transactionLogCommitted === true
  && finalization.effects.runtimePublicationCommitted === false
  && finalization.effects.postCommitVerificationExecuted === false
  && finalization.effects.uiIpcResponseDelivered === false
  && finalization.effects.packageStateRead === false
  && finalization.effects.settingsRead === false
  && finalization.effects.lockfileRead === false
  && finalization.effects.liveRegistryRead === false
  && finalization.effects.saveCacheIsolationChecked === false
  && finalization.effects.savesWritten === false
  && finalization.effects.cacheWritten === false
  && finalization.effects.recoveryLogRead === false
  && finalization.effects.recoveryLogReplayed === false
  && finalization.effects.rollbackExecuted === false
  && finalization.effects.diagnosticsWritten === false
  && pathFreeFinalization(finalization)

const acknowledgementContainedEffects = (
  acknowledgement: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult | undefined
): boolean => acknowledgement !== undefined
  && acknowledgement.readOnly === true
  && acknowledgement.effects.verifiedOutcomeAcknowledged === true
  && acknowledgement.effects.persistentReadProofAcknowledged === true
  && acknowledgement.effects.transactionCommitted === false
  && acknowledgement.effects.runtimePublicationCommitted === false
  && acknowledgement.effects.postCommitVerificationExecuted === false
  && acknowledgement.effects.uiIpcResponseDelivered === false
  && acknowledgement.effects.transactionLogRead === false
  && acknowledgement.effects.packageStateRead === false
  && acknowledgement.effects.settingsRead === false
  && acknowledgement.effects.lockfileRead === false
  && acknowledgement.effects.liveRegistryRead === false
  && acknowledgement.effects.saveCacheIsolationChecked === false
  && acknowledgement.effects.savesWritten === false
  && acknowledgement.effects.cacheWritten === false
  && acknowledgement.effects.recoveryLogRead === false
  && acknowledgement.effects.recoveryLogReplayed === false
  && acknowledgement.effects.rollbackExecuted === false
  && acknowledgement.effects.diagnosticsWritten === false
  && pathFreeAcknowledgement(acknowledgement)

const persistentReadProofsReady = (
  acknowledgement: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult | undefined
): boolean => acknowledgement?.persistentReadProofs?.transactionLogCommitted === true
  && acknowledgement.persistentReadProofs.packageStateMatched === true
  && acknowledgement.persistentReadProofs.settingsStateMatched === true
  && acknowledgement.persistentReadProofs.modLockStateMatched === true
  && acknowledgement.persistentReadProofs.liveRegistryMatched === true
  && acknowledgement.persistentReadProofs.saveCacheIsolated === true

const buildChecks = (
  finalization: ThirdPartyDataPackInstallTransactionCommitFinalizationResult | undefined,
  acknowledgement: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult | undefined
): readonly ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitCheck[] => {
  const finalizationIdentity = cloneCandidateIdentity(finalization?.candidateIdentity)
  const acknowledgementIdentity = cloneCandidateIdentity(acknowledgement?.candidateIdentity)
  const selectedPackageIds = clonePackageIds(finalization?.selectedPackageIds)
  const acknowledgementSelectedPackageIds = clonePackageIds(acknowledgement?.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(finalization?.blockedPackageIds)
  const acknowledgementBlockedPackageIds = clonePackageIds(acknowledgement?.blockedPackageIds)
  const loadOrder = clonePackageIds(finalization?.loadOrder)
  const acknowledgementLoadOrder = clonePackageIds(acknowledgement?.loadOrder)
  const targetPackageId = finalization?.targetPackageId

  return Object.freeze([
    check(
      'install-transaction-committed',
      finalization?.status === 'committed'
        && finalization.effects.transactionCommitted === true
        && finalization.effects.transactionLogCommitted === true
        ? 'satisfied'
        : 'blocked',
      'Post-commit verification after install transaction commit requires a committed transaction acknowledgement.'
    ),
    check(
      'post-commit-read-acknowledgement-ready',
      acknowledgement?.status === 'ready' ? 'satisfied' : 'blocked',
      'Post-commit verification after install transaction commit requires a ready verification read acknowledgement.'
    ),
    check(
      'install-target-consistent',
      finalization?.requestedCommandId === 'install'
        && acknowledgement?.requestedCommandId === 'install'
        && targetPackageId !== undefined
        && targetPackageId === acknowledgement.targetPackageId
        && selectedPackageIds.includes(targetPackageId)
        && acknowledgementSelectedPackageIds.includes(targetPackageId)
        && arraysEqual(selectedPackageIds, acknowledgementSelectedPackageIds)
        && arraysEqual(loadOrder, acknowledgementLoadOrder)
        ? 'satisfied'
        : 'blocked',
      'Committed transaction and post-commit acknowledgement must describe the same selected install target.'
    ),
    check(
      'candidate-identity-consistent',
      finalizationIdentity !== undefined
        && acknowledgementIdentity !== undefined
        && finalizationIdentity.candidateHash === acknowledgementIdentity.candidateHash
        && finalizationIdentity.contentHash === acknowledgementIdentity.contentHash
        && finalizationIdentity.snapshotHash === acknowledgementIdentity.snapshotHash
        && finalization?.candidateHash === acknowledgementIdentity.candidateHash
        ? 'satisfied'
        : 'blocked',
      'Committed transaction and post-commit acknowledgement must prove the same candidate identity.'
    ),
    check(
      'lockfile-hash-consistent',
      finalization?.lockfileHash !== undefined
        && finalization.lockfileHash === acknowledgement?.lockfileHash
        ? 'satisfied'
        : 'blocked',
      'Committed transaction and post-commit acknowledgement must prove the same lockfile hash.'
    ),
    check(
      'package-summary-consistent',
      finalization !== undefined
        && acknowledgement !== undefined
        && finalization.registryCount === acknowledgement.registryCount
        && finalization.entryCount === acknowledgement.entryCount
        && finalization.packageCount === acknowledgement.packageCount
        && arraysEqual(blockedPackageIds, acknowledgementBlockedPackageIds)
        ? 'satisfied'
        : 'blocked',
      'Committed transaction and post-commit acknowledgement must agree on package counts and blocked package sets.'
    ),
    check(
      'transaction-commit-identity-present',
      finalization?.transactionId !== undefined
        && finalization.committedTransactionId === finalization.transactionId
        && finalization.committedTransactionLogEntryHash !== undefined
        && finalization.committedTransactionLogEntryHash === finalization.transactionLogEntryHash
        ? 'satisfied'
        : 'blocked',
      'Post-commit verification must be sequenced after a committed transaction id and committed transaction-log hash.'
    ),
    check(
      'verified-outcome-only',
      acknowledgement?.verificationOutcomeKind === 'verified'
        && acknowledgement.transactionLogMatched === true
        && acknowledgement.packageStateMatched === true
        && acknowledgement.settingsLockfileMatched === true
        && acknowledgement.liveRegistryMatched === true
        && acknowledgement.saveCacheIsolated === true
        ? 'satisfied'
        : 'blocked',
      'Post-commit verification after commit accepts only verified outcomes with all committed-state signals.'
    ),
    check(
      'persistent-read-proofs-ready',
      persistentReadProofsReady(acknowledgement) ? 'satisfied' : 'blocked',
      'Post-commit verification after commit requires all persistent read proofs.'
    ),
    check(
      'contained-effects-intact',
      finalizationContainedEffects(finalization) && acknowledgementContainedEffects(acknowledgement)
        ? 'satisfied'
        : 'blocked',
      'Committed transaction and post-commit acknowledgement must remain path-free and must not carry runtime, UI/IPC, save/cache or rollback effects.'
    )
  ])
}

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.post-commit-verification-after-install-transaction-commit-pipeline.checks.${currentCheck.id}`,
    packageId
  )))

const effectSummary = (
  options: {
    readonly status: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineStatus
    readonly finalizationSourceCalled: boolean
    readonly acknowledgementSourceCalled: boolean
    readonly finalization?: ThirdPartyDataPackInstallTransactionCommitFinalizationResult
    readonly acknowledgement?: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
  }
): ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitEffectSummary => {
  const ready = options.status === 'ready'
  return Object.freeze({
    postCommitVerificationAfterInstallTransactionCommitPipelineCalled: true,
    installTransactionCommitFinalizationPipelineCalled: options.finalizationSourceCalled,
    postCommitVerificationReadAcknowledgementPipelineCalled: options.acknowledgementSourceCalled,
    transactionCommitted: ready,
    transactionLogCommitted: ready,
    postCommitVerificationAcknowledged: ready,
    persistentReadProofAcknowledged: ready,
    appBootstrapContinuationAllowed: ready,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    liveRegistrySwapped: false,
    previousRegistryReleased: false,
    previousRegistryRestored: false,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: false,
    modManagementUiMounted: false,
    electronIpcExposed: false,
    webFilePickerOpened: false,
    androidFilePickerOpened: false,
    commandDispatcherCalled: false,
    commandDispatched: false,
    atomicCommitExecutorCalled: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
    uiIpcResponseDelivered: false,
    transactionLogPrepared: options.finalization?.effects.transactionLogPrepared ?? false,
    transactionLogWritten: options.finalization?.effects.transactionLogWritten ?? false,
    transactionLogRead: options.finalization?.effects.transactionLogRead ?? false,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveCacheIsolationChecked: false,
    packageFilesWritten: options.finalization?.effects.packageFilesWritten ?? false,
    packageBackupsWritten: options.finalization?.effects.packageBackupsWritten ?? false,
    packageFilesRestored: false,
    lockfileWritten: options.finalization?.effects.lockfileWritten ?? false,
    lockfileRestored: false,
    settingsWritten: options.finalization?.effects.settingsWritten ?? false,
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
    readonly status: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineStatus
    readonly reason: string
    readonly enabled: boolean
    readonly finalizationSourceCalled: boolean
    readonly acknowledgementSourceCalled: boolean
    readonly finalization?: ThirdPartyDataPackInstallTransactionCommitFinalizationResult
    readonly acknowledgement?: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
    readonly checks?: readonly ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitSafeDiagnostic[]
  }
): ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const finalization = options.finalization
  const acknowledgement = options.acknowledgement
  const ready = options.status === 'ready'
  const selectedPackageIds = clonePackageIds(finalization?.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(finalization?.blockedPackageIds)
  const loadOrder = clonePackageIds(finalization?.loadOrder)
  const candidateIdentity = cloneCandidateIdentity(finalization?.candidateIdentity)

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_AFTER_INSTALL_TRANSACTION_COMMIT_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_AFTER_INSTALL_TRANSACTION_COMMIT_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true as const,
    enabled: options.enabled,
    installTransactionCommitFinalizationSourceCalled: options.finalizationSourceCalled,
    postCommitVerificationReadAcknowledgementSourceCalled: options.acknowledgementSourceCalled,
    appBootstrapContinuationAllowed: ready,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
    installTransactionCommitFinalizationStatus: finalization?.status,
    postCommitVerificationReadAcknowledgementStatus: acknowledgement?.status,
    requestedCommandId: finalization?.requestedCommandId,
    targetPackageId: finalization?.targetPackageId,
    verificationOutcomeKind: acknowledgement?.verificationOutcomeKind,
    transactionLogMatched: acknowledgement?.transactionLogMatched ?? false,
    packageStateMatched: acknowledgement?.packageStateMatched ?? false,
    settingsLockfileMatched: acknowledgement?.settingsLockfileMatched ?? false,
    liveRegistryMatched: acknowledgement?.liveRegistryMatched ?? false,
    saveCacheIsolated: acknowledgement?.saveCacheIsolated ?? false,
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    registryCount: finalization?.registryCount ?? 54,
    entryCount: finalization?.entryCount ?? 4242,
    packageCount: finalization?.packageCount ?? selectedPackageIds.length,
    candidateIdentity,
    candidateHash: finalization?.candidateHash,
    lockfileHash: finalization?.lockfileHash,
    transactionId: finalization?.transactionId,
    committedTransactionId: finalization?.committedTransactionId,
    committedTransactionLogEntryHash: finalization?.committedTransactionLogEntryHash,
    checks: options.checks ?? terminalChecks(
      options.status === 'blocked' ? 'blocked' : 'skipped',
      options.reason
    ),
    diagnostics,
    effects: effectSummary(options)
  })
}

const createDefaultFinalizationReader = (
  options: CreateThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineOptions
): (() => Promise<ThirdPartyDataPackInstallTransactionCommitFinalizationResult>) => {
  if (options.readInstallTransactionCommitFinalization !== undefined) {
    return async() => options.readInstallTransactionCommitFinalization?.() as
      Awaitable<ThirdPartyDataPackInstallTransactionCommitFinalizationResult>
  }
  return createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline({
    enabled: options.enabled,
    allowInstallTransactionCommitFinalization: options.allowInstallTransactionCommitFinalization,
    readPreparedTransactionLogVerification: options.readPreparedTransactionLogVerification
  })
}

const createDefaultAcknowledgementReader = (
  options: CreateThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineOptions
): (() => Promise<ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult>) => {
  if (options.readPostCommitVerificationReadAcknowledgement !== undefined) {
    return async() => options.readPostCommitVerificationReadAcknowledgement?.() as
      Awaitable<ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult>
  }
  return createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline({
    enabled: options.enabled,
    readSettingsLockfileCommitSource: options.readSettingsLockfileCommitSource,
    readPostCommitVerificationExecutorAdapter: options.readPostCommitVerificationExecutorAdapter,
    readPostCommitPersistentState: options.readPostCommitPersistentState,
    executePostCommitVerification: options.executePostCommitVerification
  })
}

const evaluatePipeline = async(
  options: CreateThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineOptions
): Promise<ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit verification after install transaction commit pipeline is disabled by default',
      enabled: false,
      finalizationSourceCalled: false,
      acknowledgementSourceCalled: false
    })
  }

  const readFinalization = createDefaultFinalizationReader(options)
  const readAcknowledgement = createDefaultAcknowledgementReader(options)
  let finalization: ThirdPartyDataPackInstallTransactionCommitFinalizationResult
  try {
    finalization = await readFinalization()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install transaction commit finalization failed before post-commit verification acknowledgement',
      enabled: true,
      finalizationSourceCalled: true,
      acknowledgementSourceCalled: false,
      diagnostics: [
        commandDiagnostic(
          'third-party.post-commit-verification-after-install-transaction-commit-pipeline.finalization-source-failed'
        )
      ]
    })
  }

  if (finalization.status === 'skipped' || finalization.status === 'deferred') {
    return baseResult({
      status: finalization.status,
      reason: finalization.status === 'skipped'
        ? 'third-party post-commit verification after install transaction commit is not required because commit finalization was skipped'
        : 'third-party post-commit verification after install transaction commit is deferred until commit finalization is committed',
      enabled: true,
      finalizationSourceCalled: true,
      acknowledgementSourceCalled: false,
      finalization
    })
  }

  if (finalization.status !== 'committed' || !finalizationContainedEffects(finalization)) {
    const checks = buildChecks(finalization, undefined)
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit verification requires a contained committed install transaction acknowledgement first',
      enabled: true,
      finalizationSourceCalled: true,
      acknowledgementSourceCalled: false,
      finalization,
      checks,
      diagnostics: diagnosticsForBlockedChecks(checks, finalization.targetPackageId)
    })
  }

  let acknowledgement: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
  try {
    acknowledgement = await readAcknowledgement()
  } catch (error) {
    if (error instanceof ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError) {
      acknowledgement = error.result
    } else {
      return baseResult({
        status: 'blocked',
        reason: 'third-party post-commit verification read acknowledgement failed after install transaction commit finalization',
        enabled: true,
        finalizationSourceCalled: true,
        acknowledgementSourceCalled: true,
        finalization,
        diagnostics: [
          commandDiagnostic(
            'third-party.post-commit-verification-after-install-transaction-commit-pipeline.acknowledgement-source-failed',
            finalization.targetPackageId
          )
        ]
      })
    }
  }

  const checks = buildChecks(finalization, acknowledgement)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, finalization.targetPackageId)
  if (blockedDiagnostics.length > 0) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit verification after install transaction commit requires committed transaction and read acknowledgement convergence',
      enabled: true,
      finalizationSourceCalled: true,
      acknowledgementSourceCalled: true,
      finalization,
      acknowledgement,
      checks,
      diagnostics: blockedDiagnostics
    })
  }

  return baseResult({
    status: 'ready',
    reason: 'third-party post-commit verification after install transaction commit accepted committed transaction and verified persistent read acknowledgement',
    enabled: true,
    finalizationSourceCalled: true,
    acknowledgementSourceCalled: true,
    finalization,
    acknowledgement,
    checks
  })
}

export const createThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline = (
  options: CreateThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult>) => async() =>
  evaluatePipeline(options)

export const thirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline =
  createThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline()
