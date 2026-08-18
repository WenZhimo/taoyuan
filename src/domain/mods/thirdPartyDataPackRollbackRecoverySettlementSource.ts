import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
} from './thirdPartyDataPackAtomicTransactionCommitOutcomeContract'
import type {
  ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
} from './thirdPartyDataPackRecoveryLogReplayRestoreSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_SETTLEMENT_SOURCE_KIND =
  'third-party-rollback-recovery-settlement-source'
export const THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_SETTLEMENT_SOURCE_MODE =
  'default-disabled-rollback-recovery-settlement-source'

export type ThirdPartyDataPackRollbackRecoverySettlementSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackRollbackRecoverySettlementCheck {
  readonly id:
    | 'atomic-commit-outcome-ready'
    | 'rollback-outcome-requires-recovery'
    | 'recovery-source-executed'
    | 'install-target-consistent'
    | 'package-summary-consistent'
    | 'candidate-hash-consistent'
    | 'lockfile-hash-consistent'
    | 'contained-effects-intact'
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackRollbackRecoverySettlementSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackRollbackRecoverySettlementEffectSummary {
  readonly rollbackRecoverySettlementSourceCalled: boolean
  readonly atomicTransactionCommitOutcomeContractSourceCalled: boolean
  readonly recoveryLogReplayRestoreSourceCalled: boolean
  readonly rollbackRecoveryRequired: boolean
  readonly rollbackRecoveryAcknowledged: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly successOutcomeAccepted: boolean
  readonly failureOutcomeAccepted: boolean
  readonly retryOutcomeAccepted: boolean
  readonly rollbackOutcomeAccepted: boolean
  readonly recoveryLogReplayRestoreHostCalled: boolean
  readonly recoveryLogReplayRestoreHostAccepted: boolean
  readonly realRecoveryLogReplayRestoreCalled: false
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
  readonly packageFilesRestored: false
  readonly lockfileWritten: false
  readonly lockfileRestored: false
  readonly settingsWritten: false
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackRollbackRecoverySettlementSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_SETTLEMENT_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_SETTLEMENT_SOURCE_MODE
  readonly status: ThirdPartyDataPackRollbackRecoverySettlementSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly atomicTransactionCommitOutcomeContractStatus?:
    ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult['status']
  readonly recoveryLogReplayRestoreSourceStatus?:
    ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult['status']
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
  readonly recoveryLogReplayRestoreHostAccepted: boolean
  readonly rollbackRecoverySettled: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly checks: readonly ThirdPartyDataPackRollbackRecoverySettlementCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackRollbackRecoverySettlementSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackRollbackRecoverySettlementEffectSummary
}

export interface CreateThirdPartyDataPackRollbackRecoverySettlementSourceOptions {
  readonly enabled?: boolean
  readonly readAtomicTransactionCommitOutcomeContract?: () =>
    Awaitable<ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult>
  readonly readRecoveryLogReplayRestoreSource?: () =>
    Awaitable<ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult>
}

export class ThirdPartyDataPackRollbackRecoverySettlementBlockedError extends Error {
  readonly result: ThirdPartyDataPackRollbackRecoverySettlementSourceResult

  constructor(result: ThirdPartyDataPackRollbackRecoverySettlementSourceResult) {
    super('third-party rollback recovery settlement blocked')
    this.name = 'ThirdPartyDataPackRollbackRecoverySettlementBlockedError'
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

const forbiddenFields = [
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

const clonePackageIds = (value: unknown): readonly PackageId[] => Object.freeze(
  cloneStringList(value).map(packageId => packageId as PackageId)
)

const cloneCandidateIdentity = (
  value: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const formatVersion = readOwnNumberField(value, 'formatVersion')
  const contentHash = readOwnStringField(value, 'contentHash')
  const snapshotHash = readOwnStringField(value, 'snapshotHash')
  const candidateHash = readOwnStringField(value, 'candidateHash')
  return formatVersion === 1 && contentHash !== undefined && snapshotHash !== undefined && candidateHash !== undefined
    ? Object.freeze({
        formatVersion: 1,
        contentHash: contentHash as Sha256Hash,
        snapshotHash: snapshotHash as Sha256Hash,
        candidateHash: candidateHash as Sha256Hash
      })
    : undefined
}

const safeRecovery = (
  value: unknown
): ModDiagnosticRecovery =>
  diagnosticRecoveries.has(value as ModDiagnosticRecovery)
    ? value as ModDiagnosticRecovery
    : 'none'

const hasForbiddenField = (value: unknown): boolean => {
  if (value === null || typeof value !== 'object') return false
  return forbiddenFields.some(fieldName => {
    try {
      return Reflect.getOwnPropertyDescriptor(value, fieldName) !== undefined
    } catch {
      return true
    }
  })
}

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackRollbackRecoverySettlementSafeDiagnostic => {
  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  const severity = readOwnDataField(diagnostic, 'severity')
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readOwnStringField(diagnostic, 'stage')
      ?? 'third-party.rollback-recovery-settlement-source.diagnostic-copy',
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? `mods.error.${code.toLowerCase().replace(/-/g, '.')}`,
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined,
    recovery: safeRecovery(readOwnDataField(diagnostic, 'recovery'))
  })
}

const safeDiagnostics = (
  diagnostics: readonly unknown[] | undefined
): readonly ThirdPartyDataPackRollbackRecoverySettlementSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackRollbackRecoverySettlementSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      continue
    }
    if (
      descriptor?.enumerable === true
      && 'value' in descriptor
      && descriptor.value !== null
      && typeof descriptor.value === 'object'
    ) {
      result.push(safeDiagnostic(descriptor.value))
    }
  }
  return Object.freeze(result)
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackRollbackRecoverySettlementSafeDiagnostic => Object.freeze({
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

const everyOwnBooleanFlagFalse = (value: unknown): boolean => {
  if (value === null || typeof value !== 'object') return false
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(value)
  } catch {
    return false
  }
  return keys.every(key => {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, key)
    } catch {
      return false
    }
    if (descriptor?.enumerable !== true) return true
    return 'value' in descriptor && descriptor.value === false
  })
}

const noCommitOutcomeRuntimeDrift = (
  source: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult
): boolean => source.commandDispatchAllowed === false
  && source.atomicCommitExecutionAllowed === false
  && source.transactionCommitAllowed === false
  && source.runtimePublicationCommitAllowed === false
  && source.postCommitVerificationAllowed === false
  && source.uiIpcResponseAllowed === false
  && source.runtimeEnablementAllowed === false
  && source.writeAllowed === false
  && source.rollbackRecoveryAllowed === false
  && everyOwnBooleanFlagFalse(readOwnDataField(source, 'effects'))
  && !hasForbiddenField(source)
  && !hasForbiddenField(readOwnDataField(source, 'outcome'))

const noRecoveryRuntimeDrift = (
  source: ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
): boolean => source.commandContinuationAllowed === true
  && source.appBootstrapContinuationAllowed === false
  && readOwnBooleanField(source.effects, 'recoveryLogReplayRestoreHostCalled') === true
  && readOwnBooleanField(source.effects, 'recoveryLogReplayRestoreHostAccepted') === true
  && readOwnBooleanField(source.effects, 'realRecoveryLogReplayRestoreCalled') === false
  && readOwnBooleanField(source.effects, 'transactionCommitted') === false
  && readOwnBooleanField(source.effects, 'runtimePublicationCommitted') === false
  && readOwnBooleanField(source.effects, 'postCommitVerificationExecuted') === false
  && readOwnBooleanField(source.effects, 'uiIpcResponseDelivered') === false
  && readOwnBooleanField(source.effects, 'packageFilesWritten') === false
  && readOwnBooleanField(source.effects, 'packageFilesRestored') === false
  && readOwnBooleanField(source.effects, 'lockfileWritten') === false
  && readOwnBooleanField(source.effects, 'lockfileRestored') === false
  && readOwnBooleanField(source.effects, 'settingsWritten') === false
  && readOwnBooleanField(source.effects, 'settingsRestored') === false
  && readOwnBooleanField(source.effects, 'savesWritten') === false
  && readOwnBooleanField(source.effects, 'cacheWritten') === false
  && readOwnBooleanField(source.effects, 'transactionLogWritten') === false
  && readOwnBooleanField(source.effects, 'recoveryLogRead') === false
  && readOwnBooleanField(source.effects, 'recoveryLogReplayed') === false
  && readOwnBooleanField(source.effects, 'rollbackExecuted') === false
  && readOwnBooleanField(source.effects, 'diagnosticsWritten') === false
  && !hasForbiddenField(source)

const rollbackRecoveryRequired = (
  outcome: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult
): boolean => {
  const outcomeKind = readOwnStringField(outcome, 'outcomeKind')
    ?? readOwnStringField(readOwnDataField(outcome, 'outcome'), 'kind')
  return recoveryOutcomeKinds.has(outcomeKind as ThirdPartyDataPackAtomicTransactionCommitOutcomeKind)
    || readOwnBooleanField(readOwnDataField(outcome, 'outcome'), 'rollbackRequired') === true
}

const safeReadyOutcome = (
  source: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult
): boolean => source.status === 'ready'
  && source.requestedCommandId === 'install'
  && source.targetPackageId !== undefined
  && readOwnStringField(readOwnDataField(source, 'outcome'), 'packageId') === source.targetPackageId
  && source.commitOutcomeNormalized === true
  && noCommitOutcomeRuntimeDrift(source)

const safeExecutedRecovery = (
  source: ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
): boolean => source.status === 'executed'
  && source.recoveryLogReplayRestoreHostStatus === 'accepted'
  && readOwnBooleanField(source.effects, 'recoveryLogReplayRestoreHostAccepted') === true
  && noRecoveryRuntimeDrift(source)

const check = (
  id: ThirdPartyDataPackRollbackRecoverySettlementCheck['id'],
  status: ThirdPartyDataPackRollbackRecoverySettlementCheck['status'],
  reason: string
): ThirdPartyDataPackRollbackRecoverySettlementCheck => Object.freeze({
  id,
  status,
  reason
})

const terminalChecks = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackRollbackRecoverySettlementCheck[] => Object.freeze([
  'atomic-commit-outcome-ready',
  'rollback-outcome-requires-recovery',
  'recovery-source-executed',
  'install-target-consistent',
  'package-summary-consistent',
  'candidate-hash-consistent',
  'lockfile-hash-consistent',
  'contained-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackRollbackRecoverySettlementCheck['id'],
  status,
  reason
)))

const buildChecks = (
  outcome: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  recovery: ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
): readonly ThirdPartyDataPackRollbackRecoverySettlementCheck[] => {
  const outcomeSelectedPackageIds = clonePackageIds(readOwnDataField(outcome, 'selectedPackageIds'))
  const recoverySelectedPackageIds = clonePackageIds(readOwnDataField(recovery, 'selectedPackageIds'))
  const outcomeBlockedPackageIds = clonePackageIds(readOwnDataField(outcome, 'blockedPackageIds'))
  const recoveryBlockedPackageIds = clonePackageIds(readOwnDataField(recovery, 'blockedPackageIds'))
  const outcomeLoadOrder = clonePackageIds(readOwnDataField(outcome, 'loadOrder'))
  const recoveryLoadOrder = clonePackageIds(readOwnDataField(recovery, 'loadOrder'))
  const outcomeCandidateHash = readOwnStringField(outcome, 'candidateHash')
    ?? readOwnStringField(readOwnDataField(outcome, 'candidateIdentity'), 'candidateHash')
  const recoveryCandidateHash = readOwnStringField(readOwnDataField(recovery, 'candidateIdentity'), 'candidateHash')

  return Object.freeze([
    check(
      'atomic-commit-outcome-ready',
      safeReadyOutcome(outcome) ? 'satisfied' : 'blocked',
      'Rollback recovery settlement requires a ready path-free atomic transaction commit outcome contract.'
    ),
    check(
      'rollback-outcome-requires-recovery',
      rollbackRecoveryRequired(outcome) ? 'satisfied' : 'blocked',
      'Rollback recovery settlement is only valid for failed, retry or rollback outcomes that require recovery.'
    ),
    check(
      'recovery-source-executed',
      safeExecutedRecovery(recovery) ? 'satisfied' : 'blocked',
      'Rollback recovery settlement requires an executed recovery log replay/restore acknowledgement.'
    ),
    check(
      'install-target-consistent',
      outcome.requestedCommandId === 'install'
        && outcome.targetPackageId !== undefined
        && clonePackageIds(readOwnDataField(recovery, 'selectedPackageIds')).includes(outcome.targetPackageId)
        ? 'satisfied'
        : 'blocked',
      'The recovery acknowledgement must describe the same selected install target.'
    ),
    check(
      'package-summary-consistent',
      arraysEqual(outcomeSelectedPackageIds, recoverySelectedPackageIds)
        && arraysEqual(outcomeBlockedPackageIds, recoveryBlockedPackageIds)
        && arraysEqual(outcomeLoadOrder, recoveryLoadOrder)
        && outcome.registryCount === recovery.registryCount
        && outcome.entryCount === recovery.entryCount
        && outcome.packageCount === recovery.packageCount
        ? 'satisfied'
        : 'blocked',
      'Commit outcome and recovery acknowledgement must preserve package summary counts and order.'
    ),
    check(
      'candidate-hash-consistent',
      outcomeCandidateHash !== undefined && outcomeCandidateHash === recoveryCandidateHash
        ? 'satisfied'
        : 'blocked',
      'Commit outcome and recovery acknowledgement must preserve the same candidate hash.'
    ),
    check(
      'lockfile-hash-consistent',
      outcome.lockfileHash !== undefined && outcome.lockfileHash === recovery.lockfileHash
        ? 'satisfied'
        : 'blocked',
      'Commit outcome and recovery acknowledgement must preserve the same lockfile hash.'
    ),
    check(
      'contained-effects-intact',
      noCommitOutcomeRuntimeDrift(outcome) && noRecoveryRuntimeDrift(recovery)
        ? 'satisfied'
        : 'blocked',
      'Rollback recovery settlement may carry only prior path-free outcome and recovery acknowledgement evidence.'
    )
  ])
}

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>
    for (const child of Object.values(objectValue)) {
      deepFreezeObjectGraph(child)
    }
    Object.freeze(value)
  }
  return value
}

const effectSummary = (
  status: ThirdPartyDataPackRollbackRecoverySettlementSourceStatus,
  outcome?: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  recovery?: ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
): ThirdPartyDataPackRollbackRecoverySettlementEffectSummary => {
  const ready = status === 'ready'
  const outcomeKind = readOwnStringField(
    readOwnDataField(outcome, 'outcome'),
    'kind'
  ) as ThirdPartyDataPackAtomicTransactionCommitOutcomeKind | undefined
  const recoveryEffects = readOwnDataField(recovery, 'effects')

  return Object.freeze({
    rollbackRecoverySettlementSourceCalled: true,
    atomicTransactionCommitOutcomeContractSourceCalled: outcome !== undefined,
    recoveryLogReplayRestoreSourceCalled: recovery !== undefined,
    rollbackRecoveryRequired: outcome === undefined ? false : rollbackRecoveryRequired(outcome),
    rollbackRecoveryAcknowledged: ready,
    uiIpcResultContinuationAllowed: ready || (status === 'skipped' && outcomeKind === 'committed'),
    commandContinuationAllowed: ready || (status === 'skipped' && outcomeKind === 'committed'),
    successOutcomeAccepted: status === 'skipped' && outcomeKind === 'committed',
    failureOutcomeAccepted: ready && outcomeKind === 'failed',
    retryOutcomeAccepted: ready && outcomeKind === 'retry',
    rollbackOutcomeAccepted: ready && outcomeKind === 'rollback',
    recoveryLogReplayRestoreHostCalled:
      readOwnBooleanField(recoveryEffects, 'recoveryLogReplayRestoreHostCalled') ?? false,
    recoveryLogReplayRestoreHostAccepted:
      readOwnBooleanField(recoveryEffects, 'recoveryLogReplayRestoreHostAccepted') ?? false,
    realRecoveryLogReplayRestoreCalled: false,
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
    packageFilesRestored: false,
    lockfileWritten: false,
    lockfileRestored: false,
    settingsWritten: false,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    recoveryLogRead: false,
    recoveryLogReplayed: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })
}

const mergeDiagnostics = (
  outcome?: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  recovery?: ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
): readonly ThirdPartyDataPackRollbackRecoverySettlementSafeDiagnostic[] => Object.freeze([
  ...safeDiagnostics(readOwnDataField(outcome, 'diagnostics') as readonly unknown[] | undefined),
  ...safeDiagnostics(readOwnDataField(recovery, 'diagnostics') as readonly unknown[] | undefined)
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackRollbackRecoverySettlementCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackRollbackRecoverySettlementSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.rollback-recovery-settlement-source.checks.${currentCheck.id}`,
    packageId
  )))

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackRollbackRecoverySettlementSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly outcome?: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult
    readonly recovery?: ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
    readonly checks?: readonly ThirdPartyDataPackRollbackRecoverySettlementCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackRollbackRecoverySettlementSafeDiagnostic[]
  }
): ThirdPartyDataPackRollbackRecoverySettlementSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const source = options.outcome ?? options.recovery
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  const outcome = readOwnDataField(options.outcome, 'outcome')
  const outcomeKind = readOwnStringField(outcome, 'kind') as
    ThirdPartyDataPackAtomicTransactionCommitOutcomeKind | undefined
  const ready = options.status === 'ready'
  const committedSkip = options.status === 'skipped' && outcomeKind === 'committed'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_SETTLEMENT_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_SETTLEMENT_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    atomicTransactionCommitOutcomeContractStatus: options.outcome?.status,
    recoveryLogReplayRestoreSourceStatus: options.recovery?.status,
    requestedCommandId: readOwnStringField(options.outcome, 'requestedCommandId') === 'install'
      ? 'install' as const
      : undefined,
    targetPackageId: readOwnStringField(options.outcome, 'targetPackageId') as PackageId | undefined,
    outcomeKind,
    messageKey: readOwnStringField(outcome, 'messageKey'),
    recovery: safeRecovery(readOwnDataField(outcome, 'recovery')),
    retryable: readOwnBooleanField(outcome, 'retryable') ?? false,
    rollbackRequired: readOwnBooleanField(outcome, 'rollbackRequired') ?? false,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(source, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(source, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity,
    candidateHash: readOwnStringField(options.outcome, 'candidateHash') as Sha256Hash | undefined
      ?? candidateIdentity?.candidateHash,
    lockfileHash: readOwnStringField(options.outcome ?? options.recovery, 'lockfileHash') as Sha256Hash | undefined,
    recoveryLogReplayRestoreHostAccepted:
      readOwnBooleanField(options.recovery?.effects, 'recoveryLogReplayRestoreHostAccepted') ?? false,
    rollbackRecoverySettled: ready,
    uiIpcResultContinuationAllowed: ready || committedSkip,
    commandContinuationAllowed: ready || committedSkip,
    checks: options.checks ?? terminalChecks(
      options.status === 'blocked' ? 'blocked' : 'skipped',
      options.reason
    ),
    diagnostics,
    effects: effectSummary(options.status, options.outcome, options.recovery)
  })
}

const evaluateRollbackRecoverySettlementSource = async(
  options: CreateThirdPartyDataPackRollbackRecoverySettlementSourceOptions
): Promise<ThirdPartyDataPackRollbackRecoverySettlementSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party rollback recovery settlement source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readAtomicTransactionCommitOutcomeContract === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party rollback recovery settlement source is enabled without an atomic outcome source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.rollback-recovery-settlement-source.missing-atomic-outcome-source')
      ]
    })
  }

  let outcome: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult
  try {
    outcome = await options.readAtomicTransactionCommitOutcomeContract()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party atomic transaction outcome source failed before rollback settlement',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.rollback-recovery-settlement-source.atomic-outcome-source-failed')
      ]
    })
  }

  const outcomeDiagnostics = mergeDiagnostics(outcome)
  if (outcome.status === 'skipped') {
    return baseResult({
      status: 'skipped',
      reason: 'third-party rollback recovery settlement is not required because atomic outcome was skipped',
      enabled: true,
      sourceCalled: true,
      outcome,
      checks: terminalChecks('skipped', 'atomic transaction commit outcome contract was skipped'),
      diagnostics: outcomeDiagnostics
    })
  }

  if (!safeReadyOutcome(outcome)) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party rollback recovery settlement requires a ready atomic transaction outcome',
      enabled: true,
      sourceCalled: true,
      outcome,
      diagnostics: [
        ...outcomeDiagnostics,
        commandDiagnostic(
          'third-party.rollback-recovery-settlement-source.atomic-outcome-blocked',
          outcome.targetPackageId
        )
      ]
    })
  }

  if (!rollbackRecoveryRequired(outcome)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party rollback recovery settlement is not required for committed outcomes',
      enabled: true,
      sourceCalled: true,
      outcome,
      checks: terminalChecks('skipped', 'committed outcomes do not require rollback recovery settlement'),
      diagnostics: outcomeDiagnostics
    })
  }

  if (options.readRecoveryLogReplayRestoreSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party rollback recovery settlement source is enabled without a recovery source',
      enabled: true,
      sourceCalled: true,
      outcome,
      diagnostics: [
        ...outcomeDiagnostics,
        commandDiagnostic(
          'third-party.rollback-recovery-settlement-source.missing-recovery-source',
          outcome.targetPackageId
        )
      ]
    })
  }

  let recovery: ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
  try {
    recovery = await options.readRecoveryLogReplayRestoreSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party rollback recovery source failed before rollback settlement',
      enabled: true,
      sourceCalled: true,
      outcome,
      diagnostics: [
        ...outcomeDiagnostics,
        commandDiagnostic(
          'third-party.rollback-recovery-settlement-source.recovery-source-failed',
          outcome.targetPackageId
        )
      ]
    })
  }

  const diagnostics = mergeDiagnostics(outcome, recovery)
  const checks = buildChecks(outcome, recovery)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, outcome.targetPackageId)
  if (blockedDiagnostics.length === 0) {
    return baseResult({
      status: 'ready',
      reason: 'third-party rollback recovery settlement accepted matching atomic outcome and recovery acknowledgement',
      enabled: true,
      sourceCalled: true,
      outcome,
      recovery,
      checks,
      diagnostics
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'third-party rollback recovery settlement requires matching atomic outcome and recovery acknowledgement evidence',
    enabled: true,
    sourceCalled: true,
    outcome,
    recovery,
    checks,
    diagnostics: [
      ...diagnostics,
      ...blockedDiagnostics,
      commandDiagnostic(
        'third-party.rollback-recovery-settlement-source.settlement-blocked',
        outcome.targetPackageId
      )
    ]
  })
}

export const createThirdPartyDataPackRollbackRecoverySettlementSource = (
  options: CreateThirdPartyDataPackRollbackRecoverySettlementSourceOptions = {}
): (() => Promise<ThirdPartyDataPackRollbackRecoverySettlementSourceResult>) => async() => {
  const result = await evaluateRollbackRecoverySettlementSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackRollbackRecoverySettlementBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackRollbackRecoverySettlementSource =
  createThirdPartyDataPackRollbackRecoverySettlementSource()
