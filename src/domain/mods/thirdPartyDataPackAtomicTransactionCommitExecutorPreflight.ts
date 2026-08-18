import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  ThirdPartyDataPackInstallTransactionWriteProbeEvidence
} from './thirdPartyDataPackInstallTransactionDispatchPlan'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from './thirdPartyDataPackTransactionCommandDispatcherHandoff'

export type ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightCheckId =
  | 'dispatcher-handoff-deferred'
  | 'install-dispatch-plan-deferred'
  | 'runtime-commit-adapter-deferred'
  | 'install-command-consistent'
  | 'target-package-consistent'
  | 'package-summary-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'atomic-commit-executor-required'
  | 'commit-stages-deferred'
  | 'isolated-write-probe-evidence-contained'
  | 'no-atomic-commit-effects-intact'

export type ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStageId =
  | 'atomic-commit-executor-preflight-inspection'
  | 'transaction-log-prepare'
  | 'package-files-commit'
  | 'settings-lockfile-commit'
  | 'runtime-publication-commit'
  | 'post-commit-verification-handoff'
  | 'ui-ipc-result-normalization'
  | 'rollback-recovery-handoff'

export type ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightRequirementId =
  | 'atomic-transaction-commit-executor'
  | 'verified-transaction-log-writer'
  | 'staged-package-file-commit-adapter'
  | 'settings-lockfile-atomic-commit-adapter'
  | 'runtime-publication-commit-adapter'
  | 'post-commit-verification-executor'
  | 'path-free-ui-ipc-result-normalizer'
  | 'rollback-recovery-orchestrator'

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightCheck {
  readonly id: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStage {
  readonly id: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightRequirement {
  readonly id: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary {
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

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult {
  readonly status: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStatus
  readonly transactionCommandDispatcherHandoffStatus: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult['status']
  readonly installTransactionDispatchPlanStatus: ThirdPartyDataPackInstallTransactionDispatchPlanResult['status']
  readonly runtimePublicationCommitAdapterStatus: ThirdPartyDataPackRuntimePublicationCommitAdapterResult['status']
  readonly reason: string
  readonly requestedCommandId?: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult['requestedCommandId']
  readonly targetPackageId?: PackageId
  readonly diagnostics: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightSafeDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly atomicTransactionCommitExecutorPreflight: 'deferred'
  readonly readOnly: true
  readonly atomicCommitExecutionAllowed: false
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly commitAllowed: false
  readonly writeAllowed: false
  readonly runtimePublicationCommitAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly postCommitVerificationAllowed: false
  readonly uiIpcResponseAllowed: false
  readonly rollbackRecoveryAllowed: false
  readonly executorChecks: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightCheck[]
  readonly executorStages: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStage[]
  readonly executorRequirements: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightRequirement[]
  readonly writeProbeEvidence: ThirdPartyDataPackInstallTransactionWriteProbeEvidence
  readonly effects: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary
}

export interface BuildThirdPartyDataPackAtomicTransactionCommitExecutorPreflightOptions {
  readonly transactionCommandDispatcherHandoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
  readonly installTransactionDispatchPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult
  readonly runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
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

const createEffectSummary = (): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary => ({
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

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightSafeDiagnostic => {
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
      ?? 'third-party.atomic-transaction-commit-executor-preflight.diagnostic-copy',
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
): readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightSafeDiagnostic[] = []
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
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.atomic-transaction-commit-executor-preflight.checks.${currentCheck.id}`,
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
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult,
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => arraysEqual(clonePackageIds(handoff.selectedPackageIds), clonePackageIds(installPlan.selectedPackageIds))
  && arraysEqual(clonePackageIds(handoff.selectedPackageIds), clonePackageIds(commitAdapter.selectedPackageIds))
  && arraysEqual(clonePackageIds(handoff.blockedPackageIds), clonePackageIds(installPlan.blockedPackageIds))
  && arraysEqual(clonePackageIds(handoff.blockedPackageIds), clonePackageIds(commitAdapter.blockedPackageIds))
  && arraysEqual(clonePackageIds(handoff.loadOrder), clonePackageIds(installPlan.loadOrder))
  && arraysEqual(clonePackageIds(handoff.loadOrder), clonePackageIds(commitAdapter.loadOrder))
  && handoff.registryCount === installPlan.registryCount
  && handoff.registryCount === commitAdapter.registryCount
  && handoff.entryCount === installPlan.entryCount
  && handoff.entryCount === commitAdapter.entryCount
  && handoff.packageCount === installPlan.packageCount
  && handoff.packageCount === commitAdapter.packageCount

const targetPackageConsistent = (
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult,
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult
): boolean => handoff.targetPackageId !== undefined
  && handoff.targetPackageId === installPlan.targetPackageId
  && clonePackageIds(handoff.selectedPackageIds).includes(handoff.targetPackageId)
  && clonePackageIds(installPlan.selectedPackageIds).includes(handoff.targetPackageId)

const candidateIdentityConsistent = (
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => handoff.candidateIdentity?.candidateHash !== undefined
  && handoff.candidateIdentity.candidateHash === commitAdapter.candidateIdentity?.candidateHash

const lockfileHashConsistent = (
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => handoff.lockfileHash !== undefined && handoff.lockfileHash === commitAdapter.lockfileHash

const hasAtomicCommitExecutorRequirements = (
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult,
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => hasOwnArrayObjectWithFields(handoff.dispatcherRequirements, 'atomic-transaction-commit-executor', 'required')
  && hasOwnArrayObjectWithFields(installPlan.requirements, 'verified-transaction-log-entry', 'required')
  && hasOwnArrayObjectWithFields(installPlan.requirements, 'staged-package-file-commit', 'required')
  && hasOwnArrayObjectWithFields(installPlan.requirements, 'atomic-settings-lockfile-commit', 'required')
  && hasOwnArrayObjectWithFields(installPlan.requirements, 'runtime-publication-commit-adapter', 'required')
  && hasOwnArrayObjectWithFields(commitAdapter.requiredCommitAdapters, 'atomic-runtime-publication-commit-adapter', 'required')

const hasDeferredCommitStages = (
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult,
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => hasOwnArrayObjectWithFields(handoff.handoffStages, 'install-transaction-commit', 'deferred')
  && hasOwnArrayObjectWithFields(handoff.handoffStages, 'post-commit-verification-execution', 'deferred')
  && hasOwnArrayObjectWithFields(handoff.handoffStages, 'ui-ipc-result-handoff', 'deferred')
  && hasOwnArrayObjectWithFields(handoff.handoffStages, 'rollback-recovery-handoff', 'deferred')
  && hasOwnArrayObjectWithFields(installPlan.stages, 'transaction-log-prepare', 'deferred')
  && hasOwnArrayObjectWithFields(installPlan.stages, 'package-file-stage', 'deferred')
  && hasOwnArrayObjectWithFields(installPlan.stages, 'settings-lockfile-commit', 'deferred')
  && hasOwnArrayObjectWithFields(installPlan.stages, 'runtime-publication-commit', 'deferred')
  && hasOwnArrayObjectWithFields(commitAdapter.commitStages, 'transaction-log-prepare', 'deferred')
  && hasOwnArrayObjectWithFields(commitAdapter.commitStages, 'package-files-commit', 'deferred')
  && hasOwnArrayObjectWithFields(commitAdapter.commitStages, 'settings-lockfile-commit', 'deferred')
  && hasOwnArrayObjectWithFields(commitAdapter.commitStages, 'live-registry-publication', 'deferred')
  && hasOwnArrayObjectWithFields(commitAdapter.commitStages, 'post-commit-verification', 'deferred')
  && hasOwnArrayObjectWithFields(commitAdapter.commitStages, 'rollback-recovery-handoff', 'deferred')

const statusUsable = (status: string | undefined): boolean =>
  status === 'deferred' || status === 'written'

const writeProbeEvidenceContained = (
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult
): boolean => {
  const evidence = installPlan.writeProbeEvidence
  const modLockStatus = readOwnStringField(evidence, 'modLockWriteProbeStatus')
  const transactionLogStatus = readOwnStringField(evidence, 'transactionLogWriteProbeStatus')
  const modLockWritten = modLockStatus === 'written'
  const transactionLogWritten = transactionLogStatus === 'written'
  return statusUsable(modLockStatus)
    && statusUsable(transactionLogStatus)
    && readOwnBooleanField(evidence, 'modLockPersistentWriteExecuted') === modLockWritten
    && readOwnBooleanField(evidence, 'transactionLogPersistentWriteExecuted') === transactionLogWritten
}

const noAtomicCommitEffectsIntact = (
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult,
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => handoff.dispatcherHandoffAllowed === false
  && handoff.commandDispatchAllowed === false
  && handoff.transactionCommitAllowed === false
  && handoff.postCommitVerificationAllowed === false
  && handoff.commitAllowed === false
  && handoff.writeAllowed === false
  && handoff.runtimeEnablementAllowed === false
  && handoff.uiIpcResponseAllowed === false
  && installPlan.commandDispatchAllowed === false
  && installPlan.transactionCommitAllowed === false
  && installPlan.commitAllowed === false
  && installPlan.writeAllowed === false
  && installPlan.runtimeEnablementAllowed === false
  && installPlan.uiIpcResponseAllowed === false
  && commitAdapter.commitAllowed === false
  && commitAdapter.publicationAllowed === false
  && commitAdapter.writeAllowed === false
  && commitAdapter.liveRegistryMutable === false
  && commitAdapter.rollbackExecutionAllowed === false
  && everyOwnDataValueFalse(handoff.effects)
  && everyOwnDataValueFalse(installPlan.effects)
  && everyOwnDataValueFalse(commitAdapter.effects)

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const cloneWriteProbeEvidence = (
  evidence: ThirdPartyDataPackInstallTransactionWriteProbeEvidence
): ThirdPartyDataPackInstallTransactionWriteProbeEvidence => Object.freeze({
  modLockWriteProbeStatus: (readOwnStringField(evidence, 'modLockWriteProbeStatus') ?? 'blocked') as ThirdPartyDataPackInstallTransactionWriteProbeEvidence['modLockWriteProbeStatus'],
  transactionLogWriteProbeStatus: (readOwnStringField(evidence, 'transactionLogWriteProbeStatus') ?? 'blocked') as ThirdPartyDataPackInstallTransactionWriteProbeEvidence['transactionLogWriteProbeStatus'],
  modLockPersistentWriteExecuted: readOwnBooleanField(evidence, 'modLockPersistentWriteExecuted') ?? false,
  transactionLogPersistentWriteExecuted: readOwnBooleanField(evidence, 'transactionLogPersistentWriteExecuted') ?? false
})

const check = (
  id: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightCheckId,
  status: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightCheck['status'],
  reason: string
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightCheck[] => Object.freeze([
  'dispatcher-handoff-deferred',
  'install-dispatch-plan-deferred',
  'runtime-commit-adapter-deferred',
  'install-command-consistent',
  'target-package-consistent',
  'package-summary-consistent',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'atomic-commit-executor-required',
  'commit-stages-deferred',
  'isolated-write-probe-evidence-contained',
  'no-atomic-commit-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightCheckId,
  'skipped',
  reason
)))

const buildChecks = (
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult,
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightCheck[] => Object.freeze([
  check(
    'dispatcher-handoff-deferred',
    handoff.status === 'deferred' ? 'satisfied' : 'blocked',
    'Transaction command dispatcher handoff must remain deferred before an atomic commit executor can be inspected.'
  ),
  check(
    'install-dispatch-plan-deferred',
    installPlan.status === 'deferred' ? 'satisfied' : 'blocked',
    'Install transaction dispatch planning must remain deferred so isolated write-probe evidence cannot become committed state.'
  ),
  check(
    'runtime-commit-adapter-deferred',
    commitAdapter.status === 'deferred' ? 'satisfied' : 'blocked',
    'Runtime publication commit adapter must remain deferred while the atomic executor contract is only preflighted.'
  ),
  check(
    'install-command-consistent',
    handoff.requestedCommandId === 'install' && installPlan.requestedCommandId === 'install' ? 'satisfied' : 'blocked',
    'This atomic commit executor preflight only covers the install command; enable, disable, upgrade and uninstall need separate slices.'
  ),
  check(
    'target-package-consistent',
    targetPackageConsistent(handoff, installPlan) ? 'satisfied' : 'blocked',
    'Dispatcher handoff and install dispatch planning must share one selected install target.'
  ),
  check(
    'package-summary-consistent',
    packageSummaryConsistent(handoff, installPlan, commitAdapter) ? 'satisfied' : 'blocked',
    'Dispatcher handoff, install planning and runtime commit planning must agree on selected packages, blocked packages, load order and totals.'
  ),
  check(
    'candidate-identity-consistent',
    candidateIdentityConsistent(handoff, commitAdapter) ? 'satisfied' : 'blocked',
    'Atomic commit execution needs one candidate identity shared by dispatcher handoff and runtime commit planning.'
  ),
  check(
    'lockfile-hash-consistent',
    lockfileHashConsistent(handoff, commitAdapter) ? 'satisfied' : 'blocked',
    'Atomic commit execution needs one lockfile hash shared by dispatcher handoff and runtime commit planning.'
  ),
  check(
    'atomic-commit-executor-required',
    hasAtomicCommitExecutorRequirements(handoff, installPlan, commitAdapter) ? 'satisfied' : 'blocked',
    'Upstream reports must still require a dedicated atomic transaction commit executor and its persistent adapters.'
  ),
  check(
    'commit-stages-deferred',
    hasDeferredCommitStages(handoff, installPlan, commitAdapter) ? 'satisfied' : 'blocked',
    'Commit, publication, verification, UI/IPC and rollback stages must remain deferred before executor implementation.'
  ),
  check(
    'isolated-write-probe-evidence-contained',
    writeProbeEvidenceContained(installPlan) ? 'satisfied' : 'blocked',
    'Isolated mod-lock and transaction-log write probes may be deferred or explicitly written only as probe evidence, never as committed install state.'
  ),
  check(
    'no-atomic-commit-effects-intact',
    noAtomicCommitEffectsIntact(handoff, installPlan, commitAdapter) ? 'satisfied' : 'blocked',
    'Atomic commit preflight must not carry command dispatch, transaction commit, runtime publication, UI/IPC, read, write or rollback effects.'
  )
])

const requirement = (
  id: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightRequirementId,
  reason: string
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const executorRequirements = (): readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightRequirement[] =>
  Object.freeze([
    requirement(
      'atomic-transaction-commit-executor',
      'A future executor must coordinate transaction log, package files, settings, mod-lock and runtime publication as one recoverable commit.'
    ),
    requirement(
      'verified-transaction-log-writer',
      'A real commit must prepare and verify a transaction log entry before any package, settings or lockfile mutation.'
    ),
    requirement(
      'staged-package-file-commit-adapter',
      'Package files must be staged, verified and restorable before they are treated as installed.'
    ),
    requirement(
      'settings-lockfile-atomic-commit-adapter',
      'Installation settings and mod-lock replacement must be committed as one candidate and lockfile identity.'
    ),
    requirement(
      'runtime-publication-commit-adapter',
      'Runtime registry publication must consume verified persistent install state instead of isolated probe writes.'
    ),
    requirement(
      'post-commit-verification-executor',
      'Success cannot be surfaced until post-commit verification proves persistent and live identities agree.'
    ),
    requirement(
      'path-free-ui-ipc-result-normalizer',
      'Future UI or IPC results must expose only redacted outcome summaries after commit and verification settle.'
    ),
    requirement(
      'rollback-recovery-orchestrator',
      'Any failed commit step must settle through rollback recovery before startup, saves or UI success can proceed.'
    )
  ])

const stage = (
  id: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStageId,
  status: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStage['status'],
  requirementIds: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightRequirementId[],
  reason: string
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStage[] => Object.freeze([
  stage(
    'atomic-commit-executor-preflight-inspection',
    'satisfied',
    ['atomic-transaction-commit-executor'],
    'Dispatcher handoff, install dispatch planning, write-probe evidence and runtime commit planning are consistent enough to inspect atomic commit executor requirements.'
  ),
  stage(
    'transaction-log-prepare',
    'deferred',
    ['verified-transaction-log-writer'],
    'Transaction log preparation remains deferred and must not reuse isolated write-probe output as committed state.'
  ),
  stage(
    'package-files-commit',
    'deferred',
    ['staged-package-file-commit-adapter'],
    'Package file staging and commit remain deferred until real persistent package adapters exist.'
  ),
  stage(
    'settings-lockfile-commit',
    'deferred',
    ['settings-lockfile-atomic-commit-adapter'],
    'Settings and mod-lock writes remain deferred and must later commit atomically against one lockfile hash.'
  ),
  stage(
    'runtime-publication-commit',
    'deferred',
    ['runtime-publication-commit-adapter'],
    'Runtime publication remains deferred until persistent package, settings and lockfile state have been verified.'
  ),
  stage(
    'post-commit-verification-handoff',
    'deferred',
    ['post-commit-verification-executor'],
    'Post-commit verification handoff remains deferred until the atomic commit executor actually commits state.'
  ),
  stage(
    'ui-ipc-result-normalization',
    'deferred',
    ['path-free-ui-ipc-result-normalizer'],
    'UI/IPC result normalization remains deferred and must stay path-free when later implemented.'
  ),
  stage(
    'rollback-recovery-handoff',
    'deferred',
    ['rollback-recovery-orchestrator'],
    'Rollback recovery remains deferred but required for any future failed atomic commit stage.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStage[] => Object.freeze([
  'atomic-commit-executor-preflight-inspection',
  'transaction-log-prepare',
  'package-files-commit',
  'settings-lockfile-commit',
  'runtime-publication-commit',
  'post-commit-verification-handoff',
  'ui-ipc-result-normalization',
  'rollback-recovery-handoff'
].map(id => stage(
  id as ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStageId,
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
  status: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStatus,
  reason: string,
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult,
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult,
  executorChecks: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightCheck[],
  diagnostics: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightSafeDiagnostic[],
  executorStages: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightStage[],
  includeRequirements: boolean
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult => deepFreezeObjectGraph({
  status,
  transactionCommandDispatcherHandoffStatus: handoff.status,
  installTransactionDispatchPlanStatus: installPlan.status,
  runtimePublicationCommitAdapterStatus: commitAdapter.status,
  reason,
  requestedCommandId: handoff.requestedCommandId,
  targetPackageId: handoff.targetPackageId,
  diagnostics,
  selectedPackageIds: clonePackageIds(handoff.selectedPackageIds),
  blockedPackageIds: clonePackageIds(handoff.blockedPackageIds),
  blockedCandidatePaths: [
    ...cloneStringList(handoff.blockedCandidatePaths),
    ...cloneStringList(installPlan.blockedCandidatePaths),
    ...cloneStringList(commitAdapter.blockedCandidatePaths)
  ],
  loadOrder: clonePackageIds(handoff.loadOrder),
  registryCount: handoff.registryCount,
  entryCount: handoff.entryCount,
  packageCount: handoff.packageCount,
  candidateIdentity: cloneCandidateIdentity(handoff.candidateIdentity),
  lockfileHash: handoff.lockfileHash,
  atomicTransactionCommitExecutorPreflight: 'deferred',
  readOnly: true,
  atomicCommitExecutionAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimePublicationCommitAllowed: false,
  runtimeEnablementAllowed: false,
  postCommitVerificationAllowed: false,
  uiIpcResponseAllowed: false,
  rollbackRecoveryAllowed: false,
  executorChecks,
  executorStages,
  executorRequirements: includeRequirements ? executorRequirements() : Object.freeze([]),
  writeProbeEvidence: cloneWriteProbeEvidence(installPlan.writeProbeEvidence),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackAtomicTransactionCommitExecutorPreflight = (
  options: BuildThirdPartyDataPackAtomicTransactionCommitExecutorPreflightOptions
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult => {
  const handoff = options.transactionCommandDispatcherHandoff
  const installPlan = options.installTransactionDispatchPlan
  const commitAdapter = options.runtimePublicationCommitAdapter

  if (handoff.status === 'skipped' || installPlan.status === 'skipped' || commitAdapter.status === 'skipped') {
    const reason = handoff.status === 'skipped'
      ? handoff.reason
      : installPlan.status === 'skipped'
        ? installPlan.reason
        : commitAdapter.reason
    return baseResult(
      'skipped',
      reason,
      handoff,
      installPlan,
      commitAdapter,
      skippedChecks(reason),
      [],
      terminalStages('skipped', reason),
      false
    )
  }

  if (handoff.status === 'blocked' || installPlan.status === 'blocked' || commitAdapter.status === 'blocked') {
    const reason = handoff.status === 'blocked'
      ? handoff.reason
      : installPlan.status === 'blocked'
        ? installPlan.reason
        : commitAdapter.reason
    return baseResult(
      'blocked',
      reason,
      handoff,
      installPlan,
      commitAdapter,
      skippedChecks(reason),
      [
        ...safeDiagnostics(handoff.diagnostics),
        ...safeDiagnostics(installPlan.diagnostics),
        ...safeDiagnostics(commitAdapter.diagnostics)
      ],
      terminalStages('blocked', reason),
      false
    )
  }

  const executorChecks = buildChecks(handoff, installPlan, commitAdapter)
  const blockedDiagnostics = diagnosticsForBlockedChecks(executorChecks, handoff.targetPackageId)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'atomic transaction commit executor preflight inputs are inconsistent',
      handoff,
      installPlan,
      commitAdapter,
      executorChecks,
      [
        ...safeDiagnostics(handoff.diagnostics),
        ...safeDiagnostics(installPlan.diagnostics),
        ...safeDiagnostics(commitAdapter.diagnostics),
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'atomic transaction commit executor preflight inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'atomic transaction commit executor preflight is inspect-only until real transaction-log, package, settings, lockfile, runtime publication and rollback adapters exist',
    handoff,
    installPlan,
    commitAdapter,
    executorChecks,
    [
      ...safeDiagnostics(handoff.diagnostics),
      ...safeDiagnostics(installPlan.diagnostics),
      ...safeDiagnostics(commitAdapter.diagnostics)
    ],
    deferredStages(),
    true
  )
}
