import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from './thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
} from './thirdPartyDataPackPostCommitVerificationExecutorPreflight'

export type ThirdPartyDataPackUiIpcResultNormalizationPreflightStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackUiIpcResultNormalizationPreflightCheckId =
  | 'atomic-commit-executor-preflight-deferred'
  | 'post-commit-executor-preflight-deferred'
  | 'install-command-consistent'
  | 'target-package-consistent'
  | 'package-summary-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'result-normalizer-required'
  | 'result-normalization-stages-deferred'
  | 'no-result-normalization-effects-intact'

export type ThirdPartyDataPackUiIpcResultNormalizationPreflightStageId =
  | 'ui-ipc-result-normalization-preflight-inspection'
  | 'success-envelope-normalization'
  | 'failure-envelope-normalization'
  | 'rollback-retry-state-normalization'
  | 'path-free-diagnostics-finalization'
  | 'ui-ipc-response-delivery'
  | 'startup-gate-handoff'

export type ThirdPartyDataPackUiIpcResultNormalizationRequirementId =
  | 'atomic-commit-outcome-source'
  | 'post-commit-verification-outcome-source'
  | 'path-free-ui-ipc-result-normalizer'
  | 'redacted-diagnostic-envelope'
  | 'rollback-recovery-state-source'
  | 'retry-safe-command-state-source'
  | 'explicit-ui-ipc-delivery-adapter'
  | 'no-startup-auto-success-guard'

export type ThirdPartyDataPackUiIpcResultNormalizationOutcomeId =
  | 'success'
  | 'failure'
  | 'retry'
  | 'rollback'

export interface ThirdPartyDataPackUiIpcResultNormalizationPreflightCheck {
  readonly id: ThirdPartyDataPackUiIpcResultNormalizationPreflightCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResultNormalizationPreflightStage {
  readonly id: ThirdPartyDataPackUiIpcResultNormalizationPreflightStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackUiIpcResultNormalizationRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResultNormalizationRequirement {
  readonly id: ThirdPartyDataPackUiIpcResultNormalizationRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResultNormalizationOutcomeState {
  readonly id: ThirdPartyDataPackUiIpcResultNormalizationOutcomeId
  readonly status: 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackUiIpcResultNormalizationRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResultNormalizationSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackUiIpcResultNormalizationEffectSummary {
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
}

export interface ThirdPartyDataPackUiIpcResultNormalizationPreflightResult {
  readonly status: ThirdPartyDataPackUiIpcResultNormalizationPreflightStatus
  readonly atomicTransactionCommitExecutorPreflightStatus: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult['status']
  readonly postCommitVerificationExecutorPreflightStatus: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult['status']
  readonly reason: string
  readonly requestedCommandId?: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult['requestedCommandId']
  readonly targetPackageId?: PackageId
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultNormalizationSafeDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly uiIpcResultNormalizationPreflight: 'deferred'
  readonly readOnly: true
  readonly successEnvelopeAllowed: false
  readonly failureEnvelopeAllowed: false
  readonly retryStateAllowed: false
  readonly rollbackStateAllowed: false
  readonly uiIpcResponseDeliveryAllowed: false
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly postCommitVerificationAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly writeAllowed: false
  readonly rollbackRecoveryAllowed: false
  readonly resultChecks: readonly ThirdPartyDataPackUiIpcResultNormalizationPreflightCheck[]
  readonly resultStages: readonly ThirdPartyDataPackUiIpcResultNormalizationPreflightStage[]
  readonly resultRequirements: readonly ThirdPartyDataPackUiIpcResultNormalizationRequirement[]
  readonly resultOutcomeStates: readonly ThirdPartyDataPackUiIpcResultNormalizationOutcomeState[]
  readonly effects: ThirdPartyDataPackUiIpcResultNormalizationEffectSummary
}

export interface BuildThirdPartyDataPackUiIpcResultNormalizationPreflightOptions {
  readonly atomicTransactionCommitExecutorPreflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
  readonly postCommitVerificationExecutorPreflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
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

const createEffectSummary = (): ThirdPartyDataPackUiIpcResultNormalizationEffectSummary => ({
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
  diagnosticsWritten: false
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

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackUiIpcResultNormalizationSafeDiagnostic => {
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
      ?? 'third-party.ui-ipc-result-normalization-preflight.diagnostic-copy',
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? `mods.error.${code.toLowerCase().replace(/-/g, '.')}`,
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined,
    recovery: diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)
      ? recovery as ModDiagnosticRecovery
      : 'none'
  })
}

const safeDiagnostics = (
  diagnostics: readonly unknown[]
): readonly ThirdPartyDataPackUiIpcResultNormalizationSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackUiIpcResultNormalizationSafeDiagnostic[] = []
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
): ThirdPartyDataPackUiIpcResultNormalizationSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackUiIpcResultNormalizationPreflightCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultNormalizationSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.ui-ipc-result-normalization-preflight.checks.${currentCheck.id}`,
    packageId
  )))

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

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const hasOwnArrayObjectWithFields = (
  values: readonly unknown[],
  id: string,
  status: string
): boolean => {
  const length = readArrayLength(values)
  if (length === undefined) return false

  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(values, String(index))
    } catch {
      continue
    }
    const value = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (
      value !== undefined
      && value !== null
      && typeof value === 'object'
      && readOwnStringField(value, 'id') === id
      && readOwnStringField(value, 'status') === status
    ) {
      return true
    }
  }
  return false
}

const packageSummaryConsistent = (
  atomicPreflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  verificationPreflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
): boolean => arraysEqual(clonePackageIds(atomicPreflight.selectedPackageIds), clonePackageIds(verificationPreflight.selectedPackageIds))
  && arraysEqual(clonePackageIds(atomicPreflight.blockedPackageIds), clonePackageIds(verificationPreflight.blockedPackageIds))
  && arraysEqual(clonePackageIds(atomicPreflight.loadOrder), clonePackageIds(verificationPreflight.loadOrder))
  && atomicPreflight.registryCount === verificationPreflight.registryCount
  && atomicPreflight.entryCount === verificationPreflight.entryCount
  && atomicPreflight.packageCount === verificationPreflight.packageCount

const candidateIdentityConsistent = (
  atomicPreflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  verificationPreflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
): boolean => atomicPreflight.candidateIdentity?.candidateHash !== undefined
  && atomicPreflight.candidateIdentity.candidateHash === verificationPreflight.candidateIdentity?.candidateHash

const lockfileHashConsistent = (
  atomicPreflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  verificationPreflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
): boolean => atomicPreflight.lockfileHash !== undefined
  && atomicPreflight.lockfileHash === verificationPreflight.lockfileHash

const hasResultNormalizerRequirements = (
  atomicPreflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  verificationPreflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
): boolean => hasOwnArrayObjectWithFields(
  atomicPreflight.executorRequirements,
  'path-free-ui-ipc-result-normalizer',
  'required'
) && hasOwnArrayObjectWithFields(
  verificationPreflight.executorRequirements,
  'path-free-ui-ipc-result-normalizer',
  'required'
)

const hasDeferredNormalizationStages = (
  atomicPreflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  verificationPreflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
): boolean => hasOwnArrayObjectWithFields(
  atomicPreflight.executorStages,
  'ui-ipc-result-normalization',
  'deferred'
) && hasOwnArrayObjectWithFields(
  verificationPreflight.executorStages,
  'ui-ipc-result-normalization',
  'deferred'
) && hasOwnArrayObjectWithFields(
  atomicPreflight.executorStages,
  'post-commit-verification-handoff',
  'deferred'
) && hasOwnArrayObjectWithFields(
  verificationPreflight.executorStages,
  'rollback-recovery-trigger',
  'deferred'
)

const noNormalizationEffectsIntact = (
  atomicPreflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  verificationPreflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
): boolean => atomicPreflight.atomicCommitExecutionAllowed === false
  && atomicPreflight.commandDispatchAllowed === false
  && atomicPreflight.transactionCommitAllowed === false
  && atomicPreflight.commitAllowed === false
  && atomicPreflight.writeAllowed === false
  && atomicPreflight.runtimePublicationCommitAllowed === false
  && atomicPreflight.runtimeEnablementAllowed === false
  && atomicPreflight.postCommitVerificationAllowed === false
  && atomicPreflight.uiIpcResponseAllowed === false
  && atomicPreflight.rollbackRecoveryAllowed === false
  && verificationPreflight.verificationExecutionAllowed === false
  && verificationPreflight.postCommitVerificationAllowed === false
  && verificationPreflight.transactionLogReadAllowed === false
  && verificationPreflight.packageStateReadAllowed === false
  && verificationPreflight.settingsReadAllowed === false
  && verificationPreflight.lockfileReadAllowed === false
  && verificationPreflight.liveRegistryReadAllowed === false
  && verificationPreflight.saveCacheIsolationCheckAllowed === false
  && verificationPreflight.rollbackTriggerAllowed === false
  && verificationPreflight.writeAllowed === false
  && verificationPreflight.runtimeEnablementAllowed === false
  && verificationPreflight.uiIpcResponseAllowed === false
  && everyOwnDataValueFalse(atomicPreflight.effects)
  && everyOwnDataValueFalse(verificationPreflight.effects)

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const check = (
  id: ThirdPartyDataPackUiIpcResultNormalizationPreflightCheckId,
  status: ThirdPartyDataPackUiIpcResultNormalizationPreflightCheck['status'],
  reason: string
): ThirdPartyDataPackUiIpcResultNormalizationPreflightCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackUiIpcResultNormalizationPreflightCheck[] => Object.freeze([
  'atomic-commit-executor-preflight-deferred',
  'post-commit-executor-preflight-deferred',
  'install-command-consistent',
  'target-package-consistent',
  'package-summary-consistent',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'result-normalizer-required',
  'result-normalization-stages-deferred',
  'no-result-normalization-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackUiIpcResultNormalizationPreflightCheckId,
  'skipped',
  reason
)))

const buildChecks = (
  atomicPreflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  verificationPreflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
): readonly ThirdPartyDataPackUiIpcResultNormalizationPreflightCheck[] => Object.freeze([
  check(
    'atomic-commit-executor-preflight-deferred',
    atomicPreflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'Atomic transaction commit executor preflight must remain deferred before UI/IPC result normalization can be inspected.'
  ),
  check(
    'post-commit-executor-preflight-deferred',
    verificationPreflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'Post-commit verification executor preflight must remain deferred before UI/IPC result normalization can be inspected.'
  ),
  check(
    'install-command-consistent',
    atomicPreflight.requestedCommandId === 'install' && verificationPreflight.requestedCommandId === 'install'
      ? 'satisfied'
      : 'blocked',
    'UI/IPC result normalization preflight only covers the install command; enable, disable, upgrade and uninstall need separate result envelopes.'
  ),
  check(
    'target-package-consistent',
    atomicPreflight.targetPackageId !== undefined
      && atomicPreflight.targetPackageId === verificationPreflight.targetPackageId
      && clonePackageIds(atomicPreflight.selectedPackageIds).includes(atomicPreflight.targetPackageId)
      && clonePackageIds(verificationPreflight.selectedPackageIds).includes(atomicPreflight.targetPackageId)
      ? 'satisfied'
      : 'blocked',
    'Atomic commit and post-commit verification preflights must describe the same selected install target.'
  ),
  check(
    'package-summary-consistent',
    packageSummaryConsistent(atomicPreflight, verificationPreflight) ? 'satisfied' : 'blocked',
    'Atomic commit and post-commit verification preflights must agree on selected packages, blocked packages, load order and totals.'
  ),
  check(
    'candidate-identity-consistent',
    candidateIdentityConsistent(atomicPreflight, verificationPreflight) ? 'satisfied' : 'blocked',
    'Result normalization needs one candidate identity shared by commit and verification outcomes.'
  ),
  check(
    'lockfile-hash-consistent',
    lockfileHashConsistent(atomicPreflight, verificationPreflight) ? 'satisfied' : 'blocked',
    'Result normalization needs one lockfile hash shared by commit and verification outcomes.'
  ),
  check(
    'result-normalizer-required',
    hasResultNormalizerRequirements(atomicPreflight, verificationPreflight) ? 'satisfied' : 'blocked',
    'Both upstream executor preflights must still require a path-free UI/IPC result normalizer.'
  ),
  check(
    'result-normalization-stages-deferred',
    hasDeferredNormalizationStages(atomicPreflight, verificationPreflight) ? 'satisfied' : 'blocked',
    'UI/IPC result normalization, post-commit handoff and rollback trigger stages must remain deferred before a response envelope exists.'
  ),
  check(
    'no-result-normalization-effects-intact',
    noNormalizationEffectsIntact(atomicPreflight, verificationPreflight) ? 'satisfied' : 'blocked',
    'Result normalization preflight must not carry commit, verification, runtime, UI/IPC, read, write, rollback or diagnostic write effects.'
  )
])

const requirement = (
  id: ThirdPartyDataPackUiIpcResultNormalizationRequirementId,
  reason: string
): ThirdPartyDataPackUiIpcResultNormalizationRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const resultRequirements = (): readonly ThirdPartyDataPackUiIpcResultNormalizationRequirement[] =>
  Object.freeze([
    requirement(
      'atomic-commit-outcome-source',
      'A future result normalizer must consume a settled atomic commit outcome, not an inspect-only preflight.'
    ),
    requirement(
      'post-commit-verification-outcome-source',
      'A future result normalizer must consume a settled post-commit verification outcome before success can be visible.'
    ),
    requirement(
      'path-free-ui-ipc-result-normalizer',
      'UI and IPC payloads must expose redacted summaries instead of host paths, package internals or candidate objects.'
    ),
    requirement(
      'redacted-diagnostic-envelope',
      'Failure results must retain stable codes and recovery hints while omitting files, field paths and raw details.'
    ),
    requirement(
      'rollback-recovery-state-source',
      'Rollback state must be sourced from the recovery orchestrator before failure can be marked settled.'
    ),
    requirement(
      'retry-safe-command-state-source',
      'Retry affordances must be derived from idempotent command and recovery state, not from partial writes.'
    ),
    requirement(
      'explicit-ui-ipc-delivery-adapter',
      'Visible UI or IPC delivery must be a separate adapter after commit and verification settle.'
    ),
    requirement(
      'no-startup-auto-success-guard',
      'Startup must not treat an inspect-only result preflight as install success or runtime enablement.'
    )
  ])

const stage = (
  id: ThirdPartyDataPackUiIpcResultNormalizationPreflightStageId,
  status: ThirdPartyDataPackUiIpcResultNormalizationPreflightStage['status'],
  requirementIds: readonly ThirdPartyDataPackUiIpcResultNormalizationRequirementId[],
  reason: string
): ThirdPartyDataPackUiIpcResultNormalizationPreflightStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackUiIpcResultNormalizationPreflightStage[] => Object.freeze([
  stage(
    'ui-ipc-result-normalization-preflight-inspection',
    'satisfied',
    ['path-free-ui-ipc-result-normalizer'],
    'Atomic commit and post-commit verification executor preflights are consistent enough to inspect UI/IPC result normalization requirements.'
  ),
  stage(
    'success-envelope-normalization',
    'deferred',
    ['atomic-commit-outcome-source', 'post-commit-verification-outcome-source'],
    'Success envelope normalization remains deferred until commit and verification outcomes both settle.'
  ),
  stage(
    'failure-envelope-normalization',
    'deferred',
    ['redacted-diagnostic-envelope'],
    'Failure envelope normalization remains deferred and must keep diagnostics redacted when later implemented.'
  ),
  stage(
    'rollback-retry-state-normalization',
    'deferred',
    ['rollback-recovery-state-source', 'retry-safe-command-state-source'],
    'Rollback and retry states remain deferred until recovery orchestration provides settled state.'
  ),
  stage(
    'path-free-diagnostics-finalization',
    'deferred',
    ['redacted-diagnostic-envelope', 'path-free-ui-ipc-result-normalizer'],
    'Diagnostic finalization remains deferred and must expose no host paths or candidate internals.'
  ),
  stage(
    'ui-ipc-response-delivery',
    'deferred',
    ['explicit-ui-ipc-delivery-adapter'],
    'UI/IPC response delivery remains deferred and is not performed by this domain report.'
  ),
  stage(
    'startup-gate-handoff',
    'deferred',
    ['no-startup-auto-success-guard'],
    'Startup remains gated; this preflight must not mark third-party runtime enablement as successful.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackUiIpcResultNormalizationPreflightStage[] => Object.freeze([
  'ui-ipc-result-normalization-preflight-inspection',
  'success-envelope-normalization',
  'failure-envelope-normalization',
  'rollback-retry-state-normalization',
  'path-free-diagnostics-finalization',
  'ui-ipc-response-delivery',
  'startup-gate-handoff'
].map(id => stage(
  id as ThirdPartyDataPackUiIpcResultNormalizationPreflightStageId,
  status,
  [],
  reason
)))

const outcomeState = (
  id: ThirdPartyDataPackUiIpcResultNormalizationOutcomeId,
  status: ThirdPartyDataPackUiIpcResultNormalizationOutcomeState['status'],
  requirementIds: readonly ThirdPartyDataPackUiIpcResultNormalizationRequirementId[],
  reason: string
): ThirdPartyDataPackUiIpcResultNormalizationOutcomeState => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredOutcomeStates = (): readonly ThirdPartyDataPackUiIpcResultNormalizationOutcomeState[] => Object.freeze([
  outcomeState(
    'success',
    'deferred',
    ['atomic-commit-outcome-source', 'post-commit-verification-outcome-source', 'path-free-ui-ipc-result-normalizer'],
    'Success cannot be normalized until atomic commit and post-commit verification both settle successfully.'
  ),
  outcomeState(
    'failure',
    'deferred',
    ['redacted-diagnostic-envelope', 'rollback-recovery-state-source'],
    'Failure cannot be normalized until diagnostics and rollback recovery state are settled.'
  ),
  outcomeState(
    'retry',
    'deferred',
    ['retry-safe-command-state-source', 'redacted-diagnostic-envelope'],
    'Retry state cannot be exposed until the command path is known to be idempotent and path-free.'
  ),
  outcomeState(
    'rollback',
    'deferred',
    ['rollback-recovery-state-source', 'redacted-diagnostic-envelope'],
    'Rollback state cannot be exposed until recovery orchestration produces a settled outcome.'
  )
])

const terminalOutcomeStates = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackUiIpcResultNormalizationOutcomeState[] => Object.freeze([
  'success',
  'failure',
  'retry',
  'rollback'
].map(id => outcomeState(
  id as ThirdPartyDataPackUiIpcResultNormalizationOutcomeId,
  status,
  [],
  reason
)))

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
  status: ThirdPartyDataPackUiIpcResultNormalizationPreflightStatus,
  reason: string,
  atomicPreflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  verificationPreflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  resultChecks: readonly ThirdPartyDataPackUiIpcResultNormalizationPreflightCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultNormalizationSafeDiagnostic[],
  resultStages: readonly ThirdPartyDataPackUiIpcResultNormalizationPreflightStage[],
  resultOutcomeStates: readonly ThirdPartyDataPackUiIpcResultNormalizationOutcomeState[],
  includeRequirements: boolean
): ThirdPartyDataPackUiIpcResultNormalizationPreflightResult => deepFreezeObjectGraph({
  status,
  atomicTransactionCommitExecutorPreflightStatus: atomicPreflight.status,
  postCommitVerificationExecutorPreflightStatus: verificationPreflight.status,
  reason,
  requestedCommandId: atomicPreflight.requestedCommandId,
  targetPackageId: atomicPreflight.targetPackageId,
  diagnostics,
  selectedPackageIds: clonePackageIds(atomicPreflight.selectedPackageIds),
  blockedPackageIds: clonePackageIds(atomicPreflight.blockedPackageIds),
  blockedCandidateCount: cloneStringList(atomicPreflight.blockedCandidatePaths).length,
  loadOrder: clonePackageIds(atomicPreflight.loadOrder),
  registryCount: atomicPreflight.registryCount,
  entryCount: atomicPreflight.entryCount,
  packageCount: atomicPreflight.packageCount,
  candidateIdentity: cloneCandidateIdentity(atomicPreflight.candidateIdentity),
  lockfileHash: atomicPreflight.lockfileHash,
  uiIpcResultNormalizationPreflight: 'deferred',
  readOnly: true,
  successEnvelopeAllowed: false,
  failureEnvelopeAllowed: false,
  retryStateAllowed: false,
  rollbackStateAllowed: false,
  uiIpcResponseDeliveryAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  resultChecks,
  resultStages,
  resultRequirements: includeRequirements ? resultRequirements() : Object.freeze([]),
  resultOutcomeStates,
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackUiIpcResultNormalizationPreflight = (
  options: BuildThirdPartyDataPackUiIpcResultNormalizationPreflightOptions
): ThirdPartyDataPackUiIpcResultNormalizationPreflightResult => {
  const atomicPreflight = options.atomicTransactionCommitExecutorPreflight
  const verificationPreflight = options.postCommitVerificationExecutorPreflight

  if (atomicPreflight.status === 'skipped' || verificationPreflight.status === 'skipped') {
    const reason = atomicPreflight.status === 'skipped' ? atomicPreflight.reason : verificationPreflight.reason
    return baseResult(
      'skipped',
      reason,
      atomicPreflight,
      verificationPreflight,
      skippedChecks(reason),
      [],
      terminalStages('skipped', reason),
      terminalOutcomeStates('skipped', reason),
      false
    )
  }

  if (atomicPreflight.status === 'blocked' || verificationPreflight.status === 'blocked') {
    const reason = atomicPreflight.status === 'blocked' ? atomicPreflight.reason : verificationPreflight.reason
    return baseResult(
      'blocked',
      reason,
      atomicPreflight,
      verificationPreflight,
      skippedChecks(reason),
      [
        ...safeDiagnostics(atomicPreflight.diagnostics),
        ...safeDiagnostics(verificationPreflight.diagnostics)
      ],
      terminalStages('blocked', reason),
      terminalOutcomeStates('blocked', reason),
      false
    )
  }

  const resultChecks = buildChecks(atomicPreflight, verificationPreflight)
  const blockedDiagnostics = diagnosticsForBlockedChecks(resultChecks, atomicPreflight.targetPackageId)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'UI/IPC result normalization preflight inputs are inconsistent',
      atomicPreflight,
      verificationPreflight,
      resultChecks,
      [
        ...safeDiagnostics(atomicPreflight.diagnostics),
        ...safeDiagnostics(verificationPreflight.diagnostics),
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'UI/IPC result normalization preflight inputs are inconsistent'),
      terminalOutcomeStates('blocked', 'UI/IPC result normalization preflight inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'UI/IPC result normalization preflight is inspect-only until atomic commit, post-commit verification, rollback recovery and explicit response delivery are implemented',
    atomicPreflight,
    verificationPreflight,
    resultChecks,
    [
      ...safeDiagnostics(atomicPreflight.diagnostics),
      ...safeDiagnostics(verificationPreflight.diagnostics)
    ],
    deferredStages(),
    deferredOutcomeStates(),
    true
  )
}
