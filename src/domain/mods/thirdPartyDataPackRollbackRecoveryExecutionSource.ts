import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
} from './thirdPartyDataPackAtomicTransactionCommitOutcomeContract'
import type {
  ThirdPartyDataPackRollbackRecoverySettlementSourceResult
} from './thirdPartyDataPackRollbackRecoverySettlementSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_EXECUTION_SOURCE_KIND =
  'third-party-rollback-recovery-execution-source'
export const THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_EXECUTION_SOURCE_MODE =
  'default-disabled-rollback-recovery-execution-source'

export type ThirdPartyDataPackRollbackRecoveryExecutionSourceStatus =
  | 'executed'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackRollbackRecoveryExecutionHostStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackRollbackRecoveryExecutionHostEnvelope {
  readonly requestedCommandId: 'install'
  readonly targetPackageId: PackageId
  readonly outcomeKind: Exclude<ThirdPartyDataPackAtomicTransactionCommitOutcomeKind, 'committed'>
  readonly messageKey?: string
  readonly recovery: ModDiagnosticRecovery
  readonly retryable: boolean
  readonly rollbackRequired: true
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly rollbackRecoverySettlementStatus: 'ready'
  readonly rollbackRecoverySettled: true
  readonly rollbackRecoveryExecution: 'deferred'
}

export interface ThirdPartyDataPackRollbackRecoveryExecutionHostEffectSummary {
  readonly rollbackRecoveryExecutionHostCalled: boolean
  readonly rollbackRecoveryExecutionHostAccepted: boolean
  readonly rollbackRecoveryExecutionAcknowledged: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly realRecoveryLogReplayRestoreCalled: boolean
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
  readonly transactionCommitted: false
  readonly transactionLogPrepared: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: boolean
  readonly lockfileWritten: false
  readonly lockfileRestored: false
  readonly settingsWritten: false
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: boolean
  readonly recoveryLogReplayed: boolean
  readonly rollbackExecuted: boolean
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackRollbackRecoveryExecutionHostResult {
  readonly status: ThirdPartyDataPackRollbackRecoveryExecutionHostStatus
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly outcomeKind?: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
  readonly recovery?: ModDiagnosticRecovery
  readonly retryable?: boolean
  readonly rollbackRequired?: boolean
  readonly selectedPackageIds?: readonly PackageId[]
  readonly blockedPackageIds?: readonly PackageId[]
  readonly blockedCandidateCount?: number
  readonly loadOrder?: readonly PackageId[]
  readonly registryCount?: number
  readonly entryCount?: number
  readonly packageCount?: number
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly rollbackRecoverySettlementStatus?: ThirdPartyDataPackRollbackRecoverySettlementSourceResult['status']
  readonly rollbackRecoverySettled?: boolean
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackRollbackRecoveryExecutionHostEffectSummary
}

export interface ThirdPartyDataPackRollbackRecoveryExecutionSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackRollbackRecoveryExecutionEffectSummary {
  readonly rollbackRecoveryExecutionSourceCalled: boolean
  readonly rollbackRecoverySettlementSourceCalled: boolean
  readonly injectedRollbackRecoveryExecutionHostCalled: boolean
  readonly rollbackRecoveryExecutionHostCalled: boolean
  readonly rollbackRecoveryExecutionHostAccepted: boolean
  readonly rollbackRecoveryRequired: boolean
  readonly rollbackRecoverySettled: boolean
  readonly rollbackRecoveryExecutionAcknowledged: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly successOutcomeAccepted: boolean
  readonly failureOutcomeAccepted: boolean
  readonly retryOutcomeAccepted: boolean
  readonly rollbackOutcomeAccepted: boolean
  readonly recoveryLogReplayRestoreHostCalled: boolean
  readonly recoveryLogReplayRestoreHostAccepted: boolean
  readonly realRecoveryLogReplayRestoreCalled: boolean
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
  readonly transactionCommitted: false
  readonly transactionLogPrepared: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: boolean
  readonly lockfileWritten: false
  readonly lockfileRestored: false
  readonly settingsWritten: false
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: boolean
  readonly recoveryLogReplayed: boolean
  readonly rollbackExecuted: boolean
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackRollbackRecoveryExecutionSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_EXECUTION_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_EXECUTION_SOURCE_MODE
  readonly status: ThirdPartyDataPackRollbackRecoveryExecutionSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly persistentWrite: false
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly rollbackRecoverySettlementStatus?: ThirdPartyDataPackRollbackRecoverySettlementSourceResult['status']
  readonly rollbackRecoveryExecutionHostStatus?: ThirdPartyDataPackRollbackRecoveryExecutionHostStatus
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly outcomeKind?: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
  readonly messageKey?: string
  readonly recovery: ModDiagnosticRecovery
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly rollbackRecoverySettled: boolean
  readonly rollbackRecoveryExecutionAcknowledged: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly diagnostics: readonly ThirdPartyDataPackRollbackRecoveryExecutionSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackRollbackRecoveryExecutionEffectSummary
}

export interface CreateThirdPartyDataPackRollbackRecoveryExecutionSourceOptions {
  readonly enabled?: boolean
  readonly readRollbackRecoverySettlementSource?: () =>
    Awaitable<ThirdPartyDataPackRollbackRecoverySettlementSourceResult>
  readonly executeRollbackRecovery?: (
    envelope: ThirdPartyDataPackRollbackRecoveryExecutionHostEnvelope
  ) => Awaitable<ThirdPartyDataPackRollbackRecoveryExecutionHostResult>
}

export class ThirdPartyDataPackRollbackRecoveryExecutionBlockedError extends Error {
  readonly result: ThirdPartyDataPackRollbackRecoveryExecutionSourceResult

  constructor(result: ThirdPartyDataPackRollbackRecoveryExecutionSourceResult) {
    super('third-party rollback recovery execution blocked command continuation')
    this.name = 'ThirdPartyDataPackRollbackRecoveryExecutionBlockedError'
    this.result = result
  }
}

const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnosticRecovery>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])
const recoveryOutcomeKinds = new Set<ThirdPartyDataPackAtomicTransactionCommitOutcomeKind>([
  'failed',
  'retry',
  'rollback'
])

const forbiddenSettlementFields = [
  'atomicTransactionCommitOutcomeSource',
  'atomicCommitExecutorPreflight',
  'recoveryLogReplayRestoreSource',
  'recoveryLogReplayRestoreAdapter',
  'publicationRollbackRecovery',
  'runtimePublicationCommitAdapter',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'recoveryLogReader',
  'recoveryLogStorage',
  'recoveryLogEntry',
  'packageRestoreAdapter',
  'settingsLockfileRestoreAdapter',
  'liveRegistryRestoreAdapter',
  'postRestoreVerificationAdapter',
  'rollbackRecoveryExecutionHost',
  'recoveryHost',
  'rollbackHost',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'packageWriter',
  'packageFileWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'window',
  'document'
] as const

const forbiddenHostFields = [
  'rollbackRecoverySettlementSource',
  'atomicTransactionCommitOutcomeSource',
  'recoveryLogReplayRestoreSource',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'recoveryLogReader',
  'recoveryLogStorage',
  'recoveryLogEntry',
  'packageRestoreAdapter',
  'settingsLockfileRestoreAdapter',
  'liveRegistryRestoreAdapter',
  'postRestoreVerificationAdapter',
  'rollbackRecoveryExecutionHost',
  'recoveryHost',
  'rollbackHost',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'packageWriter',
  'packageFileWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
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

const readOwnDataField = (
  value: unknown,
  fieldName: string
): unknown => {
  if (value === null || typeof value !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: unknown,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnNumberField = (
  value: unknown,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isSafeInteger(field) && field >= 0 ? field : undefined
}

const readOwnBooleanField = (
  value: unknown,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
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

const clonePackageIds = (value: unknown): readonly PackageId[] =>
  cloneStringList(value) as unknown as readonly PackageId[]

const cloneCandidateIdentity = (
  value: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  const formatVersion = readOwnNumberField(value, 'formatVersion')
  const contentHash = readOwnStringField(value, 'contentHash')
  const snapshotHash = readOwnStringField(value, 'snapshotHash')
  const candidateHash = readOwnStringField(value, 'candidateHash')
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

const safeRecovery = (
  value: unknown
): ModDiagnosticRecovery =>
  diagnosticRecoveries.has(value as ModDiagnosticRecovery)
    ? value as ModDiagnosticRecovery
    : 'none'

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

const hasForbiddenField = (
  value: unknown,
  fields: readonly string[]
): boolean => {
  if (value === null || typeof value !== 'object') return false
  return fields.some(fieldName => hasOwnEnumerableField(value, fieldName))
}

const safeDiagnostic = (
  diagnostic: unknown
): ThirdPartyDataPackRollbackRecoveryExecutionSafeDiagnostic | undefined => {
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  if (!diagnosticSeverities.has(severity as ModDiagnosticSeverity)) return undefined
  if (!diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)) return undefined

  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  const ruleId = readOwnStringField(diagnostic, 'ruleId') ?? code
  return Object.freeze({
    code,
    ruleId,
    severity: severity as ModDiagnosticSeverity,
    stage: readOwnStringField(diagnostic, 'stage')
      ?? 'third-party.rollback-recovery-execution-source.diagnostic-copy',
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? 'mods.error.lifecycle.transaction.001',
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined,
    recovery: recovery as ModDiagnosticRecovery
  })
}

const safeDiagnostics = (
  diagnostics: readonly unknown[] | undefined
): readonly ThirdPartyDataPackRollbackRecoveryExecutionSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])
  const result: ThirdPartyDataPackRollbackRecoveryExecutionSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    const copied = safeDiagnostic(readOwnDataField(diagnostics, String(index)))
    if (copied) result.push(copied)
  }
  return Object.freeze(result)
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackRollbackRecoveryExecutionSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const noRealRecoveryOrWriteDrift = (
  effects: unknown
): boolean => readOwnBooleanField(effects, 'realRecoveryLogReplayRestoreCalled') === false
  && readOwnBooleanField(effects, 'transactionCommitted') === false
  && readOwnBooleanField(effects, 'transactionLogPrepared') === false
  && readOwnBooleanField(effects, 'runtimePublicationCommitted') === false
  && readOwnBooleanField(effects, 'postCommitVerificationExecuted') === false
  && readOwnBooleanField(effects, 'uiIpcResponseDelivered') === false
  && readOwnBooleanField(effects, 'packageFilesWritten') === false
  && readOwnBooleanField(effects, 'packageFilesRestored') === false
  && readOwnBooleanField(effects, 'lockfileWritten') === false
  && readOwnBooleanField(effects, 'lockfileRestored') === false
  && readOwnBooleanField(effects, 'settingsWritten') === false
  && readOwnBooleanField(effects, 'settingsRestored') === false
  && readOwnBooleanField(effects, 'savesWritten') === false
  && readOwnBooleanField(effects, 'cacheWritten') === false
  && readOwnBooleanField(effects, 'transactionLogWritten') === false
  && readOwnBooleanField(effects, 'recoveryLogRead') === false
  && readOwnBooleanField(effects, 'recoveryLogReplayed') === false
  && readOwnBooleanField(effects, 'rollbackExecuted') === false
  && readOwnBooleanField(effects, 'diagnosticsWritten') === false

const recoverySettlementEffectsContained = (
  source: ThirdPartyDataPackRollbackRecoverySettlementSourceResult
): boolean => {
  const effects = source.effects
  const realRecovery = readOwnBooleanField(effects, 'realRecoveryLogReplayRestoreCalled') ?? false
  const packageFilesRestored = readOwnBooleanField(effects, 'packageFilesRestored') ?? false
  const recoveryLogRead = readOwnBooleanField(effects, 'recoveryLogRead') ?? false
  const recoveryLogReplayed = readOwnBooleanField(effects, 'recoveryLogReplayed') ?? false
  const rollbackExecuted = readOwnBooleanField(effects, 'rollbackExecuted') ?? false
  const recoveryEffectsContained = realRecovery
    ? recoveryLogRead === true
      && recoveryLogReplayed === true
      && packageFilesRestored === rollbackExecuted
    : packageFilesRestored === false
      && recoveryLogRead === false
      && recoveryLogReplayed === false
      && rollbackExecuted === false

  return recoveryEffectsContained
    && readOwnBooleanField(effects, 'transactionCommitted') === false
    && readOwnBooleanField(effects, 'transactionLogPrepared') === false
    && readOwnBooleanField(effects, 'runtimePublicationCommitted') === false
    && readOwnBooleanField(effects, 'postCommitVerificationExecuted') === false
    && readOwnBooleanField(effects, 'uiIpcResponseDelivered') === false
    && readOwnBooleanField(effects, 'packageFilesWritten') === false
    && readOwnBooleanField(effects, 'lockfileWritten') === false
    && readOwnBooleanField(effects, 'lockfileRestored') === false
    && readOwnBooleanField(effects, 'settingsWritten') === false
    && readOwnBooleanField(effects, 'settingsRestored') === false
    && readOwnBooleanField(effects, 'savesWritten') === false
    && readOwnBooleanField(effects, 'cacheWritten') === false
    && readOwnBooleanField(effects, 'transactionLogWritten') === false
    && readOwnBooleanField(effects, 'diagnosticsWritten') === false
}

const safeCommittedSettlement = (
  source: ThirdPartyDataPackRollbackRecoverySettlementSourceResult
): boolean => source.status === 'skipped'
  && source.outcomeKind === 'committed'
  && source.rollbackRecoverySettled === false
  && source.rollbackRequired === false
  && source.commandContinuationAllowed === true
  && source.uiIpcResultContinuationAllowed === true
  && noRealRecoveryOrWriteDrift(source.effects)
  && !hasForbiddenField(source, forbiddenSettlementFields)

const safeReadySettlement = (
  source: ThirdPartyDataPackRollbackRecoverySettlementSourceResult
): boolean => source.status === 'ready'
  && source.requestedCommandId === 'install'
  && source.targetPackageId !== undefined
  && recoveryOutcomeKinds.has(source.outcomeKind as ThirdPartyDataPackAtomicTransactionCommitOutcomeKind)
  && source.rollbackRequired === true
  && source.rollbackRecoverySettled === true
  && source.commandContinuationAllowed === true
  && source.uiIpcResultContinuationAllowed === true
  && source.candidateIdentity !== undefined
  && source.candidateHash !== undefined
  && source.candidateIdentity.candidateHash === source.candidateHash
  && source.lockfileHash !== undefined
  && recoverySettlementEffectsContained(source)
  && !hasForbiddenField(source, forbiddenSettlementFields)

const hostEffectsContained = (
  effects: unknown,
  accepted: boolean
): boolean => {
  if (effects === null || typeof effects !== 'object') return false
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(effects)
  } catch {
    return false
  }
  return keys.every(key => {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(effects, key)
    } catch {
      return false
    }
    if (descriptor?.enumerable !== true) return true
    if (!('value' in descriptor)) return false
    if (key === 'rollbackRecoveryExecutionHostCalled') return descriptor.value === true
    if (key === 'rollbackRecoveryExecutionHostAccepted') return descriptor.value === accepted
    if (key === 'rollbackRecoveryExecutionAcknowledged') return descriptor.value === accepted
    if (key === 'commandContinuationAllowed') return descriptor.value === accepted
    if (key === 'uiIpcResultContinuationAllowed') return descriptor.value === accepted
    if (
      key === 'realRecoveryLogReplayRestoreCalled'
      || key === 'recoveryLogRead'
      || key === 'recoveryLogReplayed'
    ) {
      return accepted
        ? typeof descriptor.value === 'boolean'
        : descriptor.value === false
    }
    if (key === 'packageFilesRestored') return accepted
      ? typeof descriptor.value === 'boolean'
      : descriptor.value === false
    if (key === 'rollbackExecuted') return accepted
      ? typeof descriptor.value === 'boolean'
      : descriptor.value === false
    return descriptor.value === false
  })
}

const rollbackRestoreEffectsContained = (
  source: ThirdPartyDataPackRollbackRecoverySettlementSourceResult,
  hostResult: ThirdPartyDataPackRollbackRecoveryExecutionHostResult
): boolean => {
  const effects = readOwnDataField(hostResult, 'effects')
  const packageFilesRestored = readOwnBooleanField(effects, 'packageFilesRestored') ?? false
  const rollbackExecuted = readOwnBooleanField(effects, 'rollbackExecuted') ?? false
  if (packageFilesRestored === false && rollbackExecuted === false) return true
  return packageFilesRestored === true
    && rollbackExecuted === true
    && source.outcomeKind === 'rollback'
    && source.recovery === 'restore-backup'
    && source.rollbackRequired === true
}

const safeAcceptedHostResult = (
  source: ThirdPartyDataPackRollbackRecoverySettlementSourceResult,
  hostResult: ThirdPartyDataPackRollbackRecoveryExecutionHostResult
): boolean => readOwnStringField(hostResult, 'status') === 'accepted'
  && readOwnStringField(hostResult, 'requestedCommandId') === 'install'
  && readOwnStringField(hostResult, 'targetPackageId') === source.targetPackageId
  && readOwnStringField(hostResult, 'outcomeKind') === source.outcomeKind
  && safeRecovery(readOwnDataField(hostResult, 'recovery')) === source.recovery
  && readOwnBooleanField(hostResult, 'retryable') === source.retryable
  && readOwnBooleanField(hostResult, 'rollbackRequired') === true
  && arraysEqual(clonePackageIds(readOwnDataField(hostResult, 'selectedPackageIds')), source.selectedPackageIds)
  && arraysEqual(clonePackageIds(readOwnDataField(hostResult, 'blockedPackageIds')), source.blockedPackageIds)
  && readOwnNumberField(hostResult, 'blockedCandidateCount') === source.blockedCandidateCount
  && arraysEqual(clonePackageIds(readOwnDataField(hostResult, 'loadOrder')), source.loadOrder)
  && readOwnNumberField(hostResult, 'registryCount') === source.registryCount
  && readOwnNumberField(hostResult, 'entryCount') === source.entryCount
  && readOwnNumberField(hostResult, 'packageCount') === source.packageCount
  && readOwnStringField(hostResult, 'candidateHash') === source.candidateHash
  && readOwnStringField(hostResult, 'lockfileHash') === source.lockfileHash
  && readOwnStringField(hostResult, 'rollbackRecoverySettlementStatus') === 'ready'
  && readOwnBooleanField(hostResult, 'rollbackRecoverySettled') === true
  && hostEffectsContained(readOwnDataField(hostResult, 'effects'), true)
  && rollbackRestoreEffectsContained(source, hostResult)
  && !hasForbiddenField(hostResult, forbiddenHostFields)

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

const effectSummary = (
  options: {
    readonly status: ThirdPartyDataPackRollbackRecoveryExecutionSourceStatus
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackRollbackRecoverySettlementSourceResult
    readonly hostResult?: ThirdPartyDataPackRollbackRecoveryExecutionHostResult
    readonly hostCalled?: boolean
    readonly hostAccepted?: boolean
  }
): ThirdPartyDataPackRollbackRecoveryExecutionEffectSummary => {
  const outcomeKind = options.source?.outcomeKind
  const executed = options.status === 'executed'
  const committedSkip = options.status === 'skipped'
    && outcomeKind === 'committed'
    && options.source?.commandContinuationAllowed === true
  const settlementEffects = readOwnDataField(options.source, 'effects')
  const hostEffects = readOwnDataField(options.hostResult, 'effects')

  return Object.freeze({
    rollbackRecoveryExecutionSourceCalled: true,
    rollbackRecoverySettlementSourceCalled: options.sourceCalled,
    injectedRollbackRecoveryExecutionHostCalled: options.hostCalled === true,
    rollbackRecoveryExecutionHostCalled: options.hostCalled === true,
    rollbackRecoveryExecutionHostAccepted: options.hostAccepted === true && executed,
    rollbackRecoveryRequired: options.source?.rollbackRequired === true,
    rollbackRecoverySettled: options.source?.rollbackRecoverySettled === true,
    rollbackRecoveryExecutionAcknowledged: executed,
    uiIpcResultContinuationAllowed: executed || committedSkip,
    commandContinuationAllowed: executed || committedSkip,
    successOutcomeAccepted: committedSkip,
    failureOutcomeAccepted: executed && outcomeKind === 'failed',
    retryOutcomeAccepted: executed && outcomeKind === 'retry',
    rollbackOutcomeAccepted: executed && outcomeKind === 'rollback',
    recoveryLogReplayRestoreHostCalled:
      readOwnBooleanField(settlementEffects, 'recoveryLogReplayRestoreHostCalled') ?? false,
    recoveryLogReplayRestoreHostAccepted:
      readOwnBooleanField(settlementEffects, 'recoveryLogReplayRestoreHostAccepted') ?? false,
    realRecoveryLogReplayRestoreCalled: executed
      && (
        readOwnBooleanField(settlementEffects, 'realRecoveryLogReplayRestoreCalled') === true
        || readOwnBooleanField(hostEffects, 'realRecoveryLogReplayRestoreCalled') === true
      ),
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
    transactionCommitted: false,
    transactionLogPrepared: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
    uiIpcResponseDelivered: false,
    packageFilesWritten: false,
    packageBackupsWritten: false,
    packageFilesRestored: executed
      ? readOwnBooleanField(hostEffects, 'packageFilesRestored') ?? false
      : false,
    lockfileWritten: false,
    lockfileRestored: false,
    settingsWritten: false,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    recoveryLogRead: executed
      && (
        readOwnBooleanField(settlementEffects, 'recoveryLogRead') === true
        || readOwnBooleanField(hostEffects, 'recoveryLogRead') === true
      ),
    recoveryLogReplayed: executed
      && (
        readOwnBooleanField(settlementEffects, 'recoveryLogReplayed') === true
        || readOwnBooleanField(hostEffects, 'recoveryLogReplayed') === true
      ),
    rollbackExecuted: executed
      ? readOwnBooleanField(hostEffects, 'rollbackExecuted') ?? false
      : false,
    diagnosticsWritten: false
  })
}

const buildHostEnvelope = (
  source: ThirdPartyDataPackRollbackRecoverySettlementSourceResult
): ThirdPartyDataPackRollbackRecoveryExecutionHostEnvelope | undefined => {
  if (!safeReadySettlement(source)) return undefined
  return deepFreezeObjectGraph({
    requestedCommandId: 'install',
    targetPackageId: source.targetPackageId as PackageId,
    outcomeKind: source.outcomeKind as Exclude<ThirdPartyDataPackAtomicTransactionCommitOutcomeKind, 'committed'>,
    messageKey: source.messageKey,
    recovery: source.recovery,
    retryable: source.retryable,
    rollbackRequired: true,
    selectedPackageIds: clonePackageIds(source.selectedPackageIds),
    blockedPackageIds: clonePackageIds(source.blockedPackageIds),
    blockedCandidateCount: source.blockedCandidateCount,
    loadOrder: clonePackageIds(source.loadOrder),
    registryCount: source.registryCount,
    entryCount: source.entryCount,
    packageCount: source.packageCount,
    candidateIdentity: source.candidateIdentity as ThirdPartyCandidateIdentitySummary,
    candidateHash: source.candidateHash as Sha256Hash,
    lockfileHash: source.lockfileHash as Sha256Hash,
    rollbackRecoverySettlementStatus: 'ready',
    rollbackRecoverySettled: true,
    rollbackRecoveryExecution: 'deferred'
  })
}

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackRollbackRecoveryExecutionSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackRollbackRecoverySettlementSourceResult
    readonly hostResult?: ThirdPartyDataPackRollbackRecoveryExecutionHostResult
    readonly hostCalled?: boolean
    readonly hostAccepted?: boolean
    readonly diagnostics?: readonly ThirdPartyDataPackRollbackRecoveryExecutionSafeDiagnostic[]
  }
): ThirdPartyDataPackRollbackRecoveryExecutionSourceResult => {
  const source = options.source
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  const candidateHash = readOwnStringField(source, 'candidateHash') as Sha256Hash | undefined
    ?? candidateIdentity?.candidateHash
  const executed = options.status === 'executed'
  const committedSkip = options.status === 'skipped'
    && source?.outcomeKind === 'committed'
    && source.commandContinuationAllowed === true

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_EXECUTION_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_EXECUTION_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    persistentWrite: false,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    rollbackRecoverySettlementStatus: readOwnStringField(source, 'status') as
      | ThirdPartyDataPackRollbackRecoverySettlementSourceResult['status']
      | undefined,
    rollbackRecoveryExecutionHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackRollbackRecoveryExecutionHostStatus
      | undefined,
    requestedCommandId: readOwnStringField(source, 'requestedCommandId') === 'install'
      ? 'install' as const
      : undefined,
    targetPackageId: readOwnStringField(source, 'targetPackageId') as PackageId | undefined,
    outcomeKind: readOwnStringField(source, 'outcomeKind') as
      | ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
      | undefined,
    messageKey: readOwnStringField(source, 'messageKey'),
    recovery: safeRecovery(readOwnDataField(source, 'recovery')),
    retryable: readOwnBooleanField(source, 'retryable') ?? false,
    rollbackRequired: readOwnBooleanField(source, 'rollbackRequired') ?? false,
    selectedPackageIds,
    blockedPackageIds: clonePackageIds(readOwnDataField(source, 'blockedPackageIds')),
    blockedCandidateCount: readOwnNumberField(source, 'blockedCandidateCount') ?? 0,
    loadOrder: clonePackageIds(readOwnDataField(source, 'loadOrder')),
    registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(source, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity,
    candidateHash,
    lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash | undefined,
    rollbackRecoverySettled: readOwnBooleanField(source, 'rollbackRecoverySettled') ?? false,
    rollbackRecoveryExecutionAcknowledged: executed,
    uiIpcResultContinuationAllowed: executed || committedSkip,
    commandContinuationAllowed: executed || committedSkip,
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary(options)
  })
}

const evaluateRollbackRecoveryExecutionSource = async(
  options: CreateThirdPartyDataPackRollbackRecoveryExecutionSourceOptions
): Promise<ThirdPartyDataPackRollbackRecoveryExecutionSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party rollback recovery execution source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readRollbackRecoverySettlementSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party rollback recovery execution source is enabled without a settlement source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.rollback-recovery-execution-source.missing-settlement-source')
      ]
    })
  }

  let source: ThirdPartyDataPackRollbackRecoverySettlementSourceResult
  try {
    source = await options.readRollbackRecoverySettlementSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party rollback recovery settlement source failed before execution acknowledgement',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.rollback-recovery-execution-source.settlement-source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeCommittedSettlement(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party rollback recovery execution is not required for committed outcomes',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = source.targetPackageId
  if (!safeReadySettlement(source)) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party rollback recovery execution requires a settled, path-free rollback recovery source',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: [
        ...sourceDiagnostics,
        ...(!recoverySettlementEffectsContained(source) || hasForbiddenField(source, forbiddenSettlementFields)
          ? [
              commandDiagnostic(
                'third-party.rollback-recovery-execution-source.unsafe-settlement-source',
                targetPackageId
              )
            ]
          : []),
        commandDiagnostic('third-party.rollback-recovery-execution-source.execution-blocked', targetPackageId)
      ]
    })
  }

  const envelope = buildHostEnvelope(source)
  if (options.executeRollbackRecovery === undefined || envelope === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party rollback recovery execution requires an injected execution host acknowledgement',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: [
        ...sourceDiagnostics,
        commandDiagnostic('third-party.rollback-recovery-execution-source.missing-execution-host', targetPackageId),
        commandDiagnostic('third-party.rollback-recovery-execution-source.execution-blocked', targetPackageId)
      ]
    })
  }

  let hostResult: ThirdPartyDataPackRollbackRecoveryExecutionHostResult
  try {
    hostResult = await options.executeRollbackRecovery(envelope)
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'injected rollback recovery execution host failed before returning an acknowledgement',
      enabled: true,
      sourceCalled: true,
      source,
      hostCalled: true,
      diagnostics: [
        ...sourceDiagnostics,
        commandDiagnostic('third-party.rollback-recovery-execution-source.execution-host-failed', targetPackageId),
        commandDiagnostic('third-party.rollback-recovery-execution-source.execution-blocked', targetPackageId)
      ]
    })
  }

  const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
  if (safeAcceptedHostResult(source, hostResult)) {
    return baseResult({
      status: 'executed',
      reason: 'third-party rollback recovery execution source accepted an injected path-free execution acknowledgement',
      enabled: true,
      sourceCalled: true,
      source,
      hostResult,
      hostCalled: true,
      hostAccepted: true,
      diagnostics: [
        ...sourceDiagnostics,
        ...hostDiagnostics
      ]
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'injected rollback recovery execution host returned an unsafe or divergent acknowledgement',
    enabled: true,
    sourceCalled: true,
    source,
    hostResult,
    hostCalled: true,
    diagnostics: [
      ...sourceDiagnostics,
      ...hostDiagnostics,
      ...(!hostEffectsContained(readOwnDataField(hostResult, 'effects'), false)
        || hasForbiddenField(hostResult, forbiddenHostFields)
        ? [
            commandDiagnostic(
              'third-party.rollback-recovery-execution-source.unsafe-execution-host-result',
              targetPackageId
            )
          ]
        : []),
      commandDiagnostic('third-party.rollback-recovery-execution-source.execution-blocked', targetPackageId)
    ]
  })
}

export const createThirdPartyDataPackRollbackRecoveryExecutionSource = (
  options: CreateThirdPartyDataPackRollbackRecoveryExecutionSourceOptions = {}
): (() => Promise<ThirdPartyDataPackRollbackRecoveryExecutionSourceResult>) => async() => {
  const result = await evaluateRollbackRecoveryExecutionSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackRollbackRecoveryExecutionBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackRollbackRecoveryExecutionSource =
  createThirdPartyDataPackRollbackRecoveryExecutionSource()
