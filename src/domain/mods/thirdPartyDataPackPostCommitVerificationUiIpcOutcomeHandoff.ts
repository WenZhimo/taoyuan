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
  ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult,
  ThirdPartyDataPackPostCommitVerificationOutcomeKind
} from './thirdPartyDataPackPostCommitVerificationExecutorAdapter'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeSource,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from './thirdPartyDataPackUiIpcResultNormalizationPreflight'

export type ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffCheckId =
  | 'result-normalization-preflight-deferred'
  | 'atomic-commit-outcome-ready'
  | 'post-commit-verification-executed'
  | 'install-command-consistent'
  | 'target-package-consistent'
  | 'package-summary-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'commit-verification-outcome-consistent'
  | 'no-ui-ipc-handoff-effects-intact'

export interface ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffCheck {
  readonly id: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary {
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
  readonly postCommitVerificationExecutorCalled: false
  readonly postCommitVerificationExecuted: false
  readonly transactionLogRead: false
  readonly packageStateRead: false
  readonly settingsRead: false
  readonly lockfileRead: false
  readonly liveRegistryRead: false
  readonly saveCacheIsolationChecked: false
  readonly successEnvelopeDelivered: false
  readonly failureEnvelopeDelivered: false
  readonly retryStateDelivered: false
  readonly rollbackStateDelivered: false
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
  readonly atomicCommitOutcomeConsumed: boolean
  readonly postCommitVerificationOutcomeConsumed: boolean
  readonly uiIpcOutcomePrepared: boolean
}

export interface ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult {
  readonly status: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffStatus
  readonly resultNormalizationPreflightStatus: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult['status']
  readonly atomicCommitOutcomeContractStatus: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult['status']
  readonly postCommitVerificationExecutorAdapterStatus: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult['status']
  readonly reason: string
  readonly postCommitVerificationUiIpcOutcomeHandoff: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffStatus
  readonly readOnly: true
  readonly uiIpcOutcomePrepared: boolean
  readonly uiIpcResponseDeliveryAllowed: false
  readonly commandDispatchAllowed: false
  readonly atomicCommitExecutionAllowed: false
  readonly transactionCommitAllowed: false
  readonly runtimePublicationCommitAllowed: false
  readonly postCommitVerificationAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly writeAllowed: false
  readonly rollbackRecoveryAllowed: false
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly outcomeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly messageKey?: string
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly checks: readonly ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly outcome?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeSource
  readonly effects: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary
}

export interface BuildThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffOptions {
  readonly resultNormalizationPreflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
  readonly atomicCommitOutcomeContract: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult
  readonly postCommitVerificationExecutorAdapter: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
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
  value: object,
  fieldName: string
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnBooleanField = (
  value: object,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readOwnNumberField = (
  value: object,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

const cloneCandidateIdentity = (
  identity: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  if (identity === undefined || identity === null || typeof identity !== 'object') return undefined
  const formatVersion = readOwnNumberField(identity, 'formatVersion')
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

const everyOwnDataValueFalse = (value: object): boolean => {
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
    return descriptor?.enumerable !== true || ('value' in descriptor && descriptor.value === false)
  })
}

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic => {
  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readOwnStringField(diagnostic, 'stage')
      ?? 'third-party.post-commit-verification-ui-ipc-outcome-handoff.diagnostic-copy',
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? `mods.error.${code.toLowerCase().replace(/-/g, '.')}`,
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined,
    recovery: diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)
      ? recovery as ModDiagnosticRecovery
      : 'none'
  })
}

const safeDiagnostics = (
  diagnostics: readonly unknown[] | undefined
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] = []
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
): ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.post-commit-verification-ui-ipc-outcome-handoff.checks.${currentCheck.id}`,
    packageId
  )))

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const packageSummaryConsistent = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  atomic: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  verification: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): boolean => arraysEqual(clonePackageIds(preflight.selectedPackageIds), clonePackageIds(atomic.selectedPackageIds))
  && arraysEqual(clonePackageIds(preflight.selectedPackageIds), clonePackageIds(verification.selectedPackageIds))
  && arraysEqual(clonePackageIds(preflight.blockedPackageIds), clonePackageIds(atomic.blockedPackageIds))
  && arraysEqual(clonePackageIds(preflight.blockedPackageIds), clonePackageIds(verification.blockedPackageIds))
  && arraysEqual(clonePackageIds(preflight.loadOrder), clonePackageIds(atomic.loadOrder))
  && arraysEqual(clonePackageIds(preflight.loadOrder), clonePackageIds(verification.loadOrder))
  && preflight.blockedCandidateCount === atomic.blockedCandidateCount
  && preflight.blockedCandidateCount === verification.blockedCandidateCount
  && preflight.registryCount === atomic.registryCount
  && preflight.registryCount === verification.registryCount
  && preflight.entryCount === atomic.entryCount
  && preflight.entryCount === verification.entryCount
  && preflight.packageCount === atomic.packageCount
  && preflight.packageCount === verification.packageCount

const candidateHashOf = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): Sha256Hash | undefined => cloneCandidateIdentity(identity)?.candidateHash

const candidateIdentityConsistent = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  atomic: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  verification: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): boolean => {
  const expected = candidateHashOf(preflight.candidateIdentity)
  return expected !== undefined
    && candidateHashOf(atomic.candidateIdentity) === expected
    && atomic.outcome?.candidateHash === expected
    && candidateHashOf(verification.candidateIdentity) === expected
    && verification.outcome?.candidateHash === expected
}

const lockfileHashConsistent = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  atomic: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  verification: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): boolean => preflight.lockfileHash !== undefined
  && atomic.lockfileHash === preflight.lockfileHash
  && atomic.outcome?.lockfileHash === preflight.lockfileHash
  && verification.lockfileHash === preflight.lockfileHash
  && verification.outcome?.lockfileHash === preflight.lockfileHash

const realVerificationEffectsIntact = (
  verification: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): boolean => verification.postCommitVerificationAllowed === false
  && verification.transactionLogReadAllowed === false
  && verification.packageStateReadAllowed === false
  && verification.settingsReadAllowed === false
  && verification.lockfileReadAllowed === false
  && verification.liveRegistryReadAllowed === false
  && verification.saveCacheIsolationCheckAllowed === false
  && verification.commandDispatchAllowed === false
  && verification.transactionCommitAllowed === false
  && verification.runtimeEnablementAllowed === false
  && verification.uiIpcResponseAllowed === false
  && verification.writeAllowed === false
  && verification.rollbackRecoveryAllowed === false
  && readOwnBooleanField(verification.effects, 'commandDispatched') === false
  && readOwnBooleanField(verification.effects, 'transactionCommitted') === false
  && readOwnBooleanField(verification.effects, 'postCommitVerificationExecuted') === false
  && readOwnBooleanField(verification.effects, 'transactionLogRead') === false
  && readOwnBooleanField(verification.effects, 'packageStateRead') === false
  && readOwnBooleanField(verification.effects, 'settingsRead') === false
  && readOwnBooleanField(verification.effects, 'lockfileRead') === false
  && readOwnBooleanField(verification.effects, 'liveRegistryRead') === false
  && readOwnBooleanField(verification.effects, 'saveCacheIsolationChecked') === false
  && readOwnBooleanField(verification.effects, 'uiIpcResponseDelivered') === false
  && readOwnBooleanField(verification.effects, 'packageFilesWritten') === false
  && readOwnBooleanField(verification.effects, 'packageBackupsWritten') === false
  && readOwnBooleanField(verification.effects, 'packageFilesRestored') === false
  && readOwnBooleanField(verification.effects, 'lockfileWritten') === false
  && readOwnBooleanField(verification.effects, 'lockfileRestored') === false
  && readOwnBooleanField(verification.effects, 'settingsWritten') === false
  && readOwnBooleanField(verification.effects, 'settingsRestored') === false
  && readOwnBooleanField(verification.effects, 'savesWritten') === false
  && readOwnBooleanField(verification.effects, 'cacheWritten') === false
  && readOwnBooleanField(verification.effects, 'transactionLogWritten') === false
  && readOwnBooleanField(verification.effects, 'recoveryLogRead') === false
  && readOwnBooleanField(verification.effects, 'recoveryLogReplayed') === false
  && readOwnBooleanField(verification.effects, 'rollbackExecuted') === false
  && readOwnBooleanField(verification.effects, 'diagnosticsWritten') === false

const noHandoffEffectsIntact = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  atomic: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  verification: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): boolean => preflight.successEnvelopeAllowed === false
  && preflight.failureEnvelopeAllowed === false
  && preflight.retryStateAllowed === false
  && preflight.rollbackStateAllowed === false
  && preflight.uiIpcResponseDeliveryAllowed === false
  && preflight.commandDispatchAllowed === false
  && preflight.transactionCommitAllowed === false
  && preflight.postCommitVerificationAllowed === false
  && preflight.runtimeEnablementAllowed === false
  && preflight.writeAllowed === false
  && preflight.rollbackRecoveryAllowed === false
  && atomic.commandDispatchAllowed === false
  && atomic.atomicCommitExecutionAllowed === false
  && atomic.transactionCommitAllowed === false
  && atomic.runtimePublicationCommitAllowed === false
  && atomic.postCommitVerificationAllowed === false
  && atomic.uiIpcResponseAllowed === false
  && atomic.runtimeEnablementAllowed === false
  && atomic.writeAllowed === false
  && atomic.rollbackRecoveryAllowed === false
  && everyOwnDataValueFalse(preflight.effects)
  && everyOwnDataValueFalse(atomic.effects)
  && realVerificationEffectsIntact(verification)

const check = (
  id: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffCheckId,
  status: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffCheck['status'],
  reason: string
): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffCheck[] => Object.freeze([
  'result-normalization-preflight-deferred',
  'atomic-commit-outcome-ready',
  'post-commit-verification-executed',
  'install-command-consistent',
  'target-package-consistent',
  'package-summary-consistent',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'commit-verification-outcome-consistent',
  'no-ui-ipc-handoff-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffCheckId,
  'skipped',
  reason
)))

const targetPackageConsistent = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  atomic: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  verification: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): boolean => preflight.targetPackageId !== undefined
  && atomic.targetPackageId === preflight.targetPackageId
  && atomic.outcome?.packageId === preflight.targetPackageId
  && verification.targetPackageId === preflight.targetPackageId
  && verification.outcome?.packageId === preflight.targetPackageId
  && clonePackageIds(preflight.selectedPackageIds).includes(preflight.targetPackageId)

const installCommandConsistent = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  atomic: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  verification: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): boolean => preflight.requestedCommandId === 'install'
  && atomic.requestedCommandId === 'install'
  && atomic.outcome?.commandId === 'install'
  && verification.requestedCommandId === 'install'
  && verification.outcome?.commandId === 'install'

const outcomePairConsistent = (
  commitKind: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind | undefined,
  verificationKind: ThirdPartyDataPackPostCommitVerificationOutcomeKind | undefined
): boolean => commitKind !== undefined
  && verificationKind !== undefined
  && !(commitKind !== 'committed' && verificationKind === 'verified')

const buildChecks = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  atomic: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  verification: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): readonly ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffCheck[] => Object.freeze([
  check(
    'result-normalization-preflight-deferred',
    preflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'Post-commit UI/IPC outcome handoff requires a deferred result-normalization preflight.'
  ),
  check(
    'atomic-commit-outcome-ready',
    atomic.status === 'ready' && atomic.outcome !== undefined ? 'satisfied' : 'blocked',
    'Post-commit UI/IPC outcome handoff requires a ready atomic commit outcome contract.'
  ),
  check(
    'post-commit-verification-executed',
    verification.status === 'executed' && verification.outcome !== undefined ? 'satisfied' : 'blocked',
    'Post-commit UI/IPC outcome handoff requires a settled post-commit verification outcome.'
  ),
  check(
    'install-command-consistent',
    installCommandConsistent(preflight, atomic, verification) ? 'satisfied' : 'blocked',
    'The first post-commit UI/IPC outcome handoff only covers install command outcomes.'
  ),
  check(
    'target-package-consistent',
    targetPackageConsistent(preflight, atomic, verification) ? 'satisfied' : 'blocked',
    'Commit, verification and UI/IPC normalization reports must describe the same selected install target.'
  ),
  check(
    'package-summary-consistent',
    packageSummaryConsistent(preflight, atomic, verification) ? 'satisfied' : 'blocked',
    'Commit, verification and UI/IPC normalization reports must agree on package summaries and totals.'
  ),
  check(
    'candidate-identity-consistent',
    candidateIdentityConsistent(preflight, atomic, verification) ? 'satisfied' : 'blocked',
    'The UI/IPC outcome handoff must preserve the same candidate identity proven by commit and verification outcomes.'
  ),
  check(
    'lockfile-hash-consistent',
    lockfileHashConsistent(preflight, atomic, verification) ? 'satisfied' : 'blocked',
    'The UI/IPC outcome handoff must preserve the same lockfile hash proven by commit and verification outcomes.'
  ),
  check(
    'commit-verification-outcome-consistent',
    outcomePairConsistent(atomic.outcome?.kind, verification.outcome?.kind) ? 'satisfied' : 'blocked',
    'A failed, retry or rollback commit outcome cannot be paired with a verified post-commit outcome.'
  ),
  check(
    'no-ui-ipc-handoff-effects-intact',
    noHandoffEffectsIntact(preflight, atomic, verification) ? 'satisfied' : 'blocked',
    'UI/IPC outcome handoff must not carry command dispatch, persistent commit, runtime, response delivery, read, write or rollback effects.'
  )
])

const mapOutcomeKind = (
  commitKind: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind,
  verificationKind: ThirdPartyDataPackPostCommitVerificationOutcomeKind
): ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind => {
  if (commitKind === 'rollback' || verificationKind === 'rollback') return 'rollback'
  if (commitKind === 'retry' || verificationKind === 'retry') return 'retry'
  if (commitKind === 'failed' || verificationKind === 'failed') return 'failure'
  return 'success'
}

const defaultMessageKey = (
  kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): string => `mods.ui.ipc.result.install.${kind}`

const safeRecovery = (
  value: ModDiagnosticRecovery | undefined,
  fallback: ModDiagnosticRecovery
): ModDiagnosticRecovery =>
  diagnosticRecoveries.has(value as ModDiagnosticRecovery) ? value as ModDiagnosticRecovery : fallback

const recoveryFor = (
  kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  atomic: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  verification: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): ModDiagnosticRecovery => {
  if (kind === 'success') return 'none'
  if (kind === 'rollback') return safeRecovery(verification.outcome?.recovery, safeRecovery(atomic.outcome?.recovery, 'restore-backup'))
  if (kind === 'retry') return safeRecovery(verification.outcome?.recovery, safeRecovery(atomic.outcome?.recovery, 'retry'))
  return safeRecovery(verification.outcome?.recovery, safeRecovery(atomic.outcome?.recovery, 'none'))
}

const summary = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  diagnosticCount: number
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => Object.freeze({
  selectedPackageCount: clonePackageIds(preflight.selectedPackageIds).length,
  blockedPackageCount: clonePackageIds(preflight.blockedPackageIds).length,
  blockedCandidateCount: preflight.blockedCandidateCount,
  loadOrderCount: clonePackageIds(preflight.loadOrder).length,
  registryCount: preflight.registryCount,
  entryCount: preflight.entryCount,
  packageCount: preflight.packageCount,
  diagnosticCount
})

const createEffectSummary = (
  prepared: boolean
): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary => ({
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
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
  successEnvelopeDelivered: false,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
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
  diagnosticsWritten: false,
  atomicCommitOutcomeConsumed: prepared,
  postCommitVerificationOutcomeConsumed: prepared,
  uiIpcOutcomePrepared: prepared
})

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

const baseResult = (
  status: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffStatus,
  reason: string,
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  atomic: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  verification: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult,
  checks: readonly ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  outcome?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeSource
): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult => {
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(preflight.blockedPackageIds)
  const loadOrder = clonePackageIds(preflight.loadOrder)
  const prepared = outcome !== undefined

  return deepFreezeObjectGraph({
    status,
    resultNormalizationPreflightStatus: preflight.status,
    atomicCommitOutcomeContractStatus: atomic.status,
    postCommitVerificationExecutorAdapterStatus: verification.status,
    reason,
    postCommitVerificationUiIpcOutcomeHandoff: status,
    readOnly: true,
    uiIpcOutcomePrepared: prepared,
    uiIpcResponseDeliveryAllowed: false,
    commandDispatchAllowed: false,
    atomicCommitExecutionAllowed: false,
    transactionCommitAllowed: false,
    runtimePublicationCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: preflight.requestedCommandId === 'install' ? 'install' as const : undefined,
    targetPackageId: preflight.targetPackageId,
    outcomeKind: outcome?.kind,
    messageKey: outcome?.messageKey,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: preflight.blockedCandidateCount,
    loadOrder,
    registryCount: preflight.registryCount,
    entryCount: preflight.entryCount,
    packageCount: preflight.packageCount,
    candidateIdentity: cloneCandidateIdentity(preflight.candidateIdentity),
    lockfileHash: preflight.lockfileHash,
    checks,
    diagnostics,
    summary: summary(preflight, diagnostics.length),
    ...(outcome === undefined ? {} : { outcome }),
    effects: createEffectSummary(prepared)
  })
}

export const buildThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff = (
  options: BuildThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffOptions
): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult => {
  const preflight = options.resultNormalizationPreflight
  const atomic = options.atomicCommitOutcomeContract
  const verification = options.postCommitVerificationExecutorAdapter

  if (preflight.status === 'skipped' || atomic.status === 'skipped' || verification.status === 'skipped') {
    const reason = preflight.status === 'skipped'
      ? preflight.reason
      : atomic.status === 'skipped'
        ? atomic.reason
        : verification.reason
    return baseResult(
      'skipped',
      reason,
      preflight,
      atomic,
      verification,
      skippedChecks(reason),
      []
    )
  }

  if (preflight.status === 'blocked' || atomic.status === 'blocked' || verification.status === 'blocked') {
    const reason = preflight.status === 'blocked'
      ? preflight.reason
      : atomic.status === 'blocked'
        ? atomic.reason
        : verification.reason
    return baseResult(
      'blocked',
      reason,
      preflight,
      atomic,
      verification,
      skippedChecks(reason),
      [
        ...safeDiagnostics(preflight.diagnostics),
        ...safeDiagnostics(atomic.diagnostics),
        ...safeDiagnostics(verification.diagnostics)
      ]
    )
  }

  const checks = buildChecks(preflight, atomic, verification)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, preflight.targetPackageId)
  const diagnostics = Object.freeze([
    ...safeDiagnostics(preflight.diagnostics),
    ...safeDiagnostics(atomic.diagnostics),
    ...safeDiagnostics(verification.diagnostics)
  ])

  if (
    blockedDiagnostics.length > 0
    || atomic.outcome === undefined
    || verification.outcome === undefined
  ) {
    return baseResult(
      'blocked',
      'post-commit verification UI/IPC outcome handoff inputs are inconsistent',
      preflight,
      atomic,
      verification,
      checks,
      [
        ...diagnostics,
        ...blockedDiagnostics
      ]
    )
  }

  const kind = mapOutcomeKind(atomic.outcome.kind, verification.outcome.kind)
  const retryable = atomic.outcome.retryable || verification.outcome.retryable || kind === 'retry'
  const rollbackRequired = atomic.outcome.rollbackRequired || verification.outcome.rollbackRequired || kind === 'rollback'
  const outcome: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeSource = Object.freeze({
    kind,
    settled: true,
    packageId: preflight.targetPackageId,
    candidateIdentity: cloneCandidateIdentity(preflight.candidateIdentity),
    lockfileHash: preflight.lockfileHash,
    diagnostics,
    messageKey: defaultMessageKey(kind),
    recovery: recoveryFor(kind, atomic, verification),
    retryable,
    rollbackRequired
  })

  return baseResult(
    'ready',
    'post-commit verification UI/IPC outcome handoff produced a path-free outcome source; response delivery remains separate',
    preflight,
    atomic,
    verification,
    checks,
    diagnostics,
    outcome
  )
}
