import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from './thirdPartyDataPackInstallTransactionDispatchPlan'
import type {
  ThirdPartyDataPackPostCommitVerificationPlanResult,
  ThirdPartyDataPackPostCommitVerificationRequirementId,
  ThirdPartyDataPackPostCommitVerificationStageId
} from './thirdPartyDataPackPostCommitVerificationPlan'
import type {
  ThirdPartyDataPackTransactionCommandPreflightResult
} from './thirdPartyDataPackTransactionCommandPreflight'

export type ThirdPartyDataPackTransactionCommandDispatcherHandoffStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackTransactionCommandDispatcherHandoffCheckId =
  | 'transaction-command-preflight-deferred'
  | 'install-dispatch-plan-deferred'
  | 'post-commit-verification-plan-deferred'
  | 'install-command-consistent'
  | 'target-package-consistent'
  | 'package-summary-consistent'
  | 'candidate-identity-present'
  | 'lockfile-hash-present'
  | 'post-commit-verifiers-deferred'
  | 'no-dispatcher-handoff-effects-intact'

export type ThirdPartyDataPackTransactionCommandDispatcherHandoffStageId =
  | 'dispatcher-handoff-inspection'
  | 'command-envelope-normalization'
  | 'transaction-command-dispatch'
  | 'install-transaction-commit'
  | 'post-commit-verification-execution'
  | 'ui-ipc-result-handoff'
  | 'rollback-recovery-handoff'

export type ThirdPartyDataPackTransactionCommandDispatcherHandoffRequirementId =
  | 'confirmed-command-envelope'
  | 'transaction-command-dispatcher'
  | 'install-dispatch-plan-consumer'
  | 'atomic-transaction-commit-executor'
  | 'post-commit-verification-executor'
  | 'path-free-ui-ipc-result'
  | 'rollback-recovery-orchestrator'

export interface ThirdPartyDataPackTransactionCommandDispatcherHandoffCheck {
  readonly id: ThirdPartyDataPackTransactionCommandDispatcherHandoffCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionCommandDispatcherHandoffStage {
  readonly id: ThirdPartyDataPackTransactionCommandDispatcherHandoffStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionCommandDispatcherHandoffRequirement {
  readonly id: ThirdPartyDataPackTransactionCommandDispatcherHandoffRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionCommandDispatcherHandoffSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackTransactionCommandDispatcherHandoffEffectSummary {
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
  readonly transactionCommitted: false
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

export interface ThirdPartyDataPackTransactionCommandDispatcherHandoffResult {
  readonly status: ThirdPartyDataPackTransactionCommandDispatcherHandoffStatus
  readonly transactionCommandPreflightStatus: ThirdPartyDataPackTransactionCommandPreflightResult['status']
  readonly installTransactionDispatchPlanStatus: ThirdPartyDataPackInstallTransactionDispatchPlanResult['status']
  readonly postCommitVerificationPlanStatus: ThirdPartyDataPackPostCommitVerificationPlanResult['status']
  readonly reason: string
  readonly requestedCommandId?: ThirdPartyDataPackTransactionCommandPreflightResult['requestedCommandId']
  readonly targetPackageId?: PackageId
  readonly diagnostics: readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffSafeDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly transactionCommandDispatcherHandoff: 'deferred'
  readonly readOnly: true
  readonly dispatcherHandoffAllowed: false
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly postCommitVerificationAllowed: false
  readonly commitAllowed: false
  readonly writeAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly uiIpcResponseAllowed: false
  readonly handoffChecks: readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffCheck[]
  readonly handoffStages: readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffStage[]
  readonly dispatcherRequirements: readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffRequirement[]
  readonly effects: ThirdPartyDataPackTransactionCommandDispatcherHandoffEffectSummary
}

export interface BuildThirdPartyDataPackTransactionCommandDispatcherHandoffOptions {
  readonly transactionCommandPreflight: ThirdPartyDataPackTransactionCommandPreflightResult
  readonly installTransactionDispatchPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult
  readonly postCommitVerificationPlan: ThirdPartyDataPackPostCommitVerificationPlanResult
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

const requiredPostCommitVerifierIds: readonly ThirdPartyDataPackPostCommitVerificationRequirementId[] = Object.freeze([
  'transaction-log-entry-verifier',
  'package-state-verifier',
  'settings-lockfile-identity-verifier',
  'live-registry-identity-verifier',
  'save-cache-isolation-verifier',
  'path-free-result-verifier',
  'rollback-handoff-verifier'
])

const deferredPostCommitStageIds: readonly ThirdPartyDataPackPostCommitVerificationStageId[] = Object.freeze([
  'transaction-log-confirmation',
  'package-state-verification',
  'settings-lockfile-verification',
  'live-registry-identity-verification',
  'save-cache-isolation-verification',
  'ui-ipc-result-verification',
  'rollback-handoff-verification'
])

const createEffectSummary = (): ThirdPartyDataPackTransactionCommandDispatcherHandoffEffectSummary => ({
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
  transactionCommitted: false,
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

const safeDiagnostic = (diagnostic: object): ThirdPartyDataPackTransactionCommandDispatcherHandoffSafeDiagnostic => {
  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readOwnStringField(diagnostic, 'stage') ?? 'third-party.transaction-command-dispatcher-handoff.diagnostic-copy',
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
): readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackTransactionCommandDispatcherHandoffSafeDiagnostic[] = []
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
): ThirdPartyDataPackTransactionCommandDispatcherHandoffSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.transaction-command-dispatcher-handoff.checks.${currentCheck.id}`,
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

const packageSummaryConsistent = (
  commandPreflight: ThirdPartyDataPackTransactionCommandPreflightResult,
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  verificationPlan: ThirdPartyDataPackPostCommitVerificationPlanResult
): boolean => arraysEqual(clonePackageIds(commandPreflight.selectedPackageIds), clonePackageIds(installPlan.selectedPackageIds))
  && arraysEqual(clonePackageIds(commandPreflight.selectedPackageIds), clonePackageIds(verificationPlan.selectedPackageIds))
  && arraysEqual(clonePackageIds(commandPreflight.blockedPackageIds), clonePackageIds(installPlan.blockedPackageIds))
  && arraysEqual(clonePackageIds(commandPreflight.blockedPackageIds), clonePackageIds(verificationPlan.blockedPackageIds))
  && arraysEqual(clonePackageIds(commandPreflight.loadOrder), clonePackageIds(installPlan.loadOrder))
  && arraysEqual(clonePackageIds(commandPreflight.loadOrder), clonePackageIds(verificationPlan.loadOrder))
  && commandPreflight.registryCount === installPlan.registryCount
  && commandPreflight.registryCount === verificationPlan.registryCount
  && commandPreflight.entryCount === installPlan.entryCount
  && commandPreflight.entryCount === verificationPlan.entryCount
  && commandPreflight.packageCount === installPlan.packageCount
  && commandPreflight.packageCount === verificationPlan.packageCount

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

const hasPostCommitVerifierRequirements = (
  verificationPlan: ThirdPartyDataPackPostCommitVerificationPlanResult
): boolean => requiredPostCommitVerifierIds.every(id =>
  hasOwnArrayObjectWithFields(verificationPlan.requiredVerifiers, id, 'required')
)

const hasDeferredPostCommitStages = (
  verificationPlan: ThirdPartyDataPackPostCommitVerificationPlanResult
): boolean => hasOwnArrayObjectWithFields(
  verificationPlan.verificationStages,
  'post-commit-verification-inspection',
  'satisfied'
) && deferredPostCommitStageIds.every(id =>
  hasOwnArrayObjectWithFields(verificationPlan.verificationStages, id, 'deferred')
)

const postCommitVerifiersDeferred = (
  verificationPlan: ThirdPartyDataPackPostCommitVerificationPlanResult
): boolean => hasPostCommitVerifierRequirements(verificationPlan)
  && hasDeferredPostCommitStages(verificationPlan)

const noDispatcherHandoffEffectsIntact = (
  commandPreflight: ThirdPartyDataPackTransactionCommandPreflightResult,
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  verificationPlan: ThirdPartyDataPackPostCommitVerificationPlanResult
): boolean => commandPreflight.commandDispatchAllowed === false
  && commandPreflight.commitAllowed === false
  && commandPreflight.writeAllowed === false
  && commandPreflight.runtimeEnablementAllowed === false
  && commandPreflight.uiMountAllowed === false
  && commandPreflight.ipcAllowed === false
  && installPlan.commandDispatchAllowed === false
  && installPlan.transactionCommitAllowed === false
  && installPlan.commitAllowed === false
  && installPlan.writeAllowed === false
  && installPlan.runtimeEnablementAllowed === false
  && installPlan.uiIpcResponseAllowed === false
  && verificationPlan.postCommitVerificationAllowed === false
  && verificationPlan.commandDispatchAllowed === false
  && verificationPlan.transactionCommitAllowed === false
  && verificationPlan.commitAllowed === false
  && verificationPlan.writeAllowed === false
  && verificationPlan.runtimeEnablementAllowed === false
  && verificationPlan.uiIpcResponseAllowed === false
  && everyOwnDataValueFalse(commandPreflight.effects)
  && everyOwnDataValueFalse(installPlan.effects)
  && everyOwnDataValueFalse(verificationPlan.effects)

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const check = (
  id: ThirdPartyDataPackTransactionCommandDispatcherHandoffCheckId,
  status: ThirdPartyDataPackTransactionCommandDispatcherHandoffCheck['status'],
  reason: string
): ThirdPartyDataPackTransactionCommandDispatcherHandoffCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffCheck[] => Object.freeze([
  'transaction-command-preflight-deferred',
  'install-dispatch-plan-deferred',
  'post-commit-verification-plan-deferred',
  'install-command-consistent',
  'target-package-consistent',
  'package-summary-consistent',
  'candidate-identity-present',
  'lockfile-hash-present',
  'post-commit-verifiers-deferred',
  'no-dispatcher-handoff-effects-intact'
].map(id => check(id as ThirdPartyDataPackTransactionCommandDispatcherHandoffCheckId, 'skipped', reason)))

const buildChecks = (
  commandPreflight: ThirdPartyDataPackTransactionCommandPreflightResult,
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  verificationPlan: ThirdPartyDataPackPostCommitVerificationPlanResult
): readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffCheck[] => Object.freeze([
  check(
    'transaction-command-preflight-deferred',
    commandPreflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'Transaction command preflight must remain deferred before dispatcher handoff can be inspected.'
  ),
  check(
    'install-dispatch-plan-deferred',
    installPlan.status === 'deferred' ? 'satisfied' : 'blocked',
    'Install dispatch planning must remain deferred before a real dispatcher can call it.'
  ),
  check(
    'post-commit-verification-plan-deferred',
    verificationPlan.status === 'deferred' ? 'satisfied' : 'blocked',
    'Post-commit verification planning must remain deferred before dispatcher handoff is allowed.'
  ),
  check(
    'install-command-consistent',
    commandPreflight.requestedCommandId === 'install'
      && installPlan.requestedCommandId === 'install'
      && verificationPlan.requestedCommandId === 'install'
      ? 'satisfied'
      : 'blocked',
    'This dispatcher handoff only covers the install command; enable, disable, upgrade and uninstall need separate handoff slices.'
  ),
  check(
    'target-package-consistent',
    commandPreflight.targetPackageId !== undefined
      && commandPreflight.targetPackageId === installPlan.targetPackageId
      && commandPreflight.targetPackageId === verificationPlan.targetPackageId
      ? 'satisfied'
      : 'blocked',
    'Command preflight, install dispatch planning and post-commit verification planning must share the same target package.'
  ),
  check(
    'package-summary-consistent',
    packageSummaryConsistent(commandPreflight, installPlan, verificationPlan) ? 'satisfied' : 'blocked',
    'Command, dispatch and verification reports must agree on selected packages, blocked packages, load order and totals.'
  ),
  check(
    'candidate-identity-present',
    verificationPlan.candidateIdentity?.candidateHash !== undefined ? 'satisfied' : 'blocked',
    'Dispatcher handoff needs the candidate identity that the future commit and verification stages must preserve.'
  ),
  check(
    'lockfile-hash-present',
    verificationPlan.lockfileHash !== undefined ? 'satisfied' : 'blocked',
    'Dispatcher handoff needs the lockfile hash that future settings and mod-lock writes must verify.'
  ),
  check(
    'post-commit-verifiers-deferred',
    postCommitVerifiersDeferred(verificationPlan) ? 'satisfied' : 'blocked',
    'All post-commit verifier requirements must remain required and their execution stages must stay deferred.'
  ),
  check(
    'no-dispatcher-handoff-effects-intact',
    noDispatcherHandoffEffectsIntact(commandPreflight, installPlan, verificationPlan) ? 'satisfied' : 'blocked',
    'Dispatcher handoff must not carry command dispatch, transaction commit, post-commit verification, runtime, UI/IPC or write effects.'
  )
])

const requirement = (
  id: ThirdPartyDataPackTransactionCommandDispatcherHandoffRequirementId,
  reason: string
): ThirdPartyDataPackTransactionCommandDispatcherHandoffRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const dispatcherRequirements = (): readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffRequirement[] =>
  Object.freeze([
    requirement(
      'confirmed-command-envelope',
      'The future dispatcher must receive a typed command envelope that already passed explicit confirmation.'
    ),
    requirement(
      'transaction-command-dispatcher',
      'A real dispatcher must route install command intent without exposing UI or IPC side effects to domain reports.'
    ),
    requirement(
      'install-dispatch-plan-consumer',
      'The dispatcher must consume the install dispatch plan instead of rebuilding transaction ordering ad hoc.'
    ),
    requirement(
      'atomic-transaction-commit-executor',
      'Persistent package, settings, lockfile and transaction-log mutation must happen through one atomic executor.'
    ),
    requirement(
      'post-commit-verification-executor',
      'The dispatcher must not surface success until post-commit verification proves persistent and live identities match.'
    ),
    requirement(
      'path-free-ui-ipc-result',
      'Any UI or IPC response must expose only redacted result summaries, not host paths or candidate internals.'
    ),
    requirement(
      'rollback-recovery-orchestrator',
      'Failed dispatch, commit or verification must settle through rollback recovery before startup or saves continue.'
    )
  ])

const stage = (
  id: ThirdPartyDataPackTransactionCommandDispatcherHandoffStageId,
  status: ThirdPartyDataPackTransactionCommandDispatcherHandoffStage['status'],
  requirementIds: readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffRequirementId[],
  reason: string
): ThirdPartyDataPackTransactionCommandDispatcherHandoffStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffStage[] => Object.freeze([
  stage(
    'dispatcher-handoff-inspection',
    'satisfied',
    ['confirmed-command-envelope', 'install-dispatch-plan-consumer'],
    'Command preflight, install dispatch planning and post-commit verification planning are consistent enough to inspect dispatcher handoff requirements.'
  ),
  stage(
    'command-envelope-normalization',
    'deferred',
    ['confirmed-command-envelope'],
    'A real dispatcher still needs to normalize the command envelope before calling any transaction stage.'
  ),
  stage(
    'transaction-command-dispatch',
    'deferred',
    ['transaction-command-dispatcher'],
    'Command dispatch remains deferred; this report does not invoke install, enable, disable, upgrade or uninstall handlers.'
  ),
  stage(
    'install-transaction-commit',
    'deferred',
    ['atomic-transaction-commit-executor'],
    'The persistent install transaction commit remains deferred and must not be simulated by this handoff report.'
  ),
  stage(
    'post-commit-verification-execution',
    'deferred',
    ['post-commit-verification-executor'],
    'Post-commit verification execution remains deferred until real package, settings, lockfile and live registry writes exist.'
  ),
  stage(
    'ui-ipc-result-handoff',
    'deferred',
    ['path-free-ui-ipc-result'],
    'UI and IPC result delivery remains deferred and must stay redacted when later implemented.'
  ),
  stage(
    'rollback-recovery-handoff',
    'deferred',
    ['rollback-recovery-orchestrator'],
    'Rollback recovery remains a required handoff for any future dispatcher failure path.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffStage[] => Object.freeze([
  'dispatcher-handoff-inspection',
  'command-envelope-normalization',
  'transaction-command-dispatch',
  'install-transaction-commit',
  'post-commit-verification-execution',
  'ui-ipc-result-handoff',
  'rollback-recovery-handoff'
].map(id => stage(id as ThirdPartyDataPackTransactionCommandDispatcherHandoffStageId, status, [], reason)))

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
  status: ThirdPartyDataPackTransactionCommandDispatcherHandoffStatus,
  reason: string,
  commandPreflight: ThirdPartyDataPackTransactionCommandPreflightResult,
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  verificationPlan: ThirdPartyDataPackPostCommitVerificationPlanResult,
  handoffChecks: readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffCheck[],
  diagnostics: readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffSafeDiagnostic[],
  handoffStages: readonly ThirdPartyDataPackTransactionCommandDispatcherHandoffStage[],
  includeRequirements: boolean
): ThirdPartyDataPackTransactionCommandDispatcherHandoffResult => deepFreezeObjectGraph({
  status,
  transactionCommandPreflightStatus: commandPreflight.status,
  installTransactionDispatchPlanStatus: installPlan.status,
  postCommitVerificationPlanStatus: verificationPlan.status,
  reason,
  requestedCommandId: commandPreflight.requestedCommandId,
  targetPackageId: commandPreflight.targetPackageId,
  diagnostics,
  selectedPackageIds: clonePackageIds(commandPreflight.selectedPackageIds),
  blockedPackageIds: clonePackageIds(commandPreflight.blockedPackageIds),
  blockedCandidatePaths: [
    ...cloneStringList(installPlan.blockedCandidatePaths),
    ...cloneStringList(verificationPlan.blockedCandidatePaths)
  ],
  loadOrder: clonePackageIds(commandPreflight.loadOrder),
  registryCount: commandPreflight.registryCount,
  entryCount: commandPreflight.entryCount,
  packageCount: commandPreflight.packageCount,
  candidateIdentity: cloneCandidateIdentity(verificationPlan.candidateIdentity),
  lockfileHash: verificationPlan.lockfileHash,
  transactionCommandDispatcherHandoff: 'deferred',
  readOnly: true,
  dispatcherHandoffAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  handoffChecks,
  handoffStages,
  dispatcherRequirements: includeRequirements ? dispatcherRequirements() : Object.freeze([]),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackTransactionCommandDispatcherHandoff = (
  options: BuildThirdPartyDataPackTransactionCommandDispatcherHandoffOptions
): ThirdPartyDataPackTransactionCommandDispatcherHandoffResult => {
  const commandPreflight = options.transactionCommandPreflight
  const installPlan = options.installTransactionDispatchPlan
  const verificationPlan = options.postCommitVerificationPlan

  if (
    commandPreflight.status === 'skipped'
    || installPlan.status === 'skipped'
    || verificationPlan.status === 'skipped'
  ) {
    const reason = commandPreflight.status === 'skipped'
      ? commandPreflight.reason
      : installPlan.status === 'skipped'
        ? installPlan.reason
        : verificationPlan.reason
    return baseResult(
      'skipped',
      reason,
      commandPreflight,
      installPlan,
      verificationPlan,
      skippedChecks(reason),
      [],
      terminalStages('skipped', reason),
      false
    )
  }

  if (
    commandPreflight.status === 'blocked'
    || installPlan.status === 'blocked'
    || verificationPlan.status === 'blocked'
  ) {
    const reason = commandPreflight.status === 'blocked'
      ? commandPreflight.reason
      : installPlan.status === 'blocked'
        ? installPlan.reason
        : verificationPlan.reason
    return baseResult(
      'blocked',
      reason,
      commandPreflight,
      installPlan,
      verificationPlan,
      skippedChecks(reason),
      [
        ...safeDiagnostics(commandPreflight.diagnostics),
        ...safeDiagnostics(installPlan.diagnostics),
        ...safeDiagnostics(verificationPlan.diagnostics)
      ],
      terminalStages('blocked', reason),
      false
    )
  }

  const handoffChecks = buildChecks(commandPreflight, installPlan, verificationPlan)
  const blockedDiagnostics = diagnosticsForBlockedChecks(handoffChecks, commandPreflight.targetPackageId)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'transaction command dispatcher handoff inputs are inconsistent',
      commandPreflight,
      installPlan,
      verificationPlan,
      handoffChecks,
      [
        ...safeDiagnostics(commandPreflight.diagnostics),
        ...safeDiagnostics(installPlan.diagnostics),
        ...safeDiagnostics(verificationPlan.diagnostics),
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'transaction command dispatcher handoff inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'transaction command dispatcher handoff is inspect-only until real command dispatch, atomic transaction commit, post-commit verification and UI/IPC result delivery are implemented',
    commandPreflight,
    installPlan,
    verificationPlan,
    handoffChecks,
    [
      ...safeDiagnostics(commandPreflight.diagnostics),
      ...safeDiagnostics(installPlan.diagnostics),
      ...safeDiagnostics(verificationPlan.diagnostics)
    ],
    deferredStages(),
    true
  )
}
