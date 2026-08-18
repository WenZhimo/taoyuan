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
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'

export type ThirdPartyDataPackPostCommitVerificationPlanStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPostCommitVerificationPlanCheckId =
  | 'install-dispatch-plan-deferred'
  | 'runtime-commit-adapter-deferred'
  | 'install-target-present'
  | 'candidate-identity-present'
  | 'lockfile-hash-present'
  | 'package-summary-consistent'
  | 'post-commit-adapter-required'
  | 'post-commit-stage-deferred'
  | 'rollback-handoff-deferred'
  | 'no-post-commit-effects-intact'

export type ThirdPartyDataPackPostCommitVerificationStageId =
  | 'post-commit-verification-inspection'
  | 'transaction-log-confirmation'
  | 'package-state-verification'
  | 'settings-lockfile-verification'
  | 'live-registry-identity-verification'
  | 'save-cache-isolation-verification'
  | 'ui-ipc-result-verification'
  | 'rollback-handoff-verification'

export type ThirdPartyDataPackPostCommitVerificationRequirementId =
  | 'transaction-log-entry-verifier'
  | 'package-state-verifier'
  | 'settings-lockfile-identity-verifier'
  | 'live-registry-identity-verifier'
  | 'save-cache-isolation-verifier'
  | 'path-free-result-verifier'
  | 'rollback-handoff-verifier'

export interface ThirdPartyDataPackPostCommitVerificationPlanCheck {
  readonly id: ThirdPartyDataPackPostCommitVerificationPlanCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitVerificationStage {
  readonly id: ThirdPartyDataPackPostCommitVerificationStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackPostCommitVerificationRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitVerificationRequirement {
  readonly id: ThirdPartyDataPackPostCommitVerificationRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitVerificationSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackPostCommitVerificationPlanEffectSummary {
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
  readonly commandDispatched: false
  readonly transactionCommitted: false
  readonly postCommitVerificationExecuted: false
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

export interface ThirdPartyDataPackPostCommitVerificationPlanResult {
  readonly status: ThirdPartyDataPackPostCommitVerificationPlanStatus
  readonly installTransactionDispatchPlanStatus: ThirdPartyDataPackInstallTransactionDispatchPlanResult['status']
  readonly runtimePublicationCommitAdapterStatus: ThirdPartyDataPackRuntimePublicationCommitAdapterResult['status']
  readonly reason: string
  readonly requestedCommandId?: ThirdPartyDataPackInstallTransactionDispatchPlanResult['requestedCommandId']
  readonly targetPackageId?: PackageId
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly postCommitVerificationPlan: 'deferred'
  readonly readOnly: true
  readonly postCommitVerificationAllowed: false
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly commitAllowed: false
  readonly writeAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly uiIpcResponseAllowed: false
  readonly verificationChecks: readonly ThirdPartyDataPackPostCommitVerificationPlanCheck[]
  readonly verificationStages: readonly ThirdPartyDataPackPostCommitVerificationStage[]
  readonly requiredVerifiers: readonly ThirdPartyDataPackPostCommitVerificationRequirement[]
  readonly effects: ThirdPartyDataPackPostCommitVerificationPlanEffectSummary
}

export interface BuildThirdPartyDataPackPostCommitVerificationPlanOptions {
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

const createEffectSummary = (): ThirdPartyDataPackPostCommitVerificationPlanEffectSummary => ({
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
  commandDispatched: false,
  transactionCommitted: false,
  postCommitVerificationExecuted: false,
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

const safeDiagnostic = (diagnostic: object): ThirdPartyDataPackPostCommitVerificationSafeDiagnostic => {
  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readOwnStringField(diagnostic, 'stage') ?? 'third-party.post-commit-verification-plan.diagnostic-copy',
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
): readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] = []
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
): ThirdPartyDataPackPostCommitVerificationSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackPostCommitVerificationPlanCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.post-commit-verification-plan.checks.${currentCheck.id}`,
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
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => arraysEqual(clonePackageIds(installPlan.selectedPackageIds), clonePackageIds(commitAdapter.selectedPackageIds))
  && arraysEqual(clonePackageIds(installPlan.loadOrder), clonePackageIds(commitAdapter.loadOrder))
  && installPlan.registryCount === commitAdapter.registryCount
  && installPlan.entryCount === commitAdapter.entryCount
  && installPlan.packageCount === commitAdapter.packageCount

const hasPostCommitAdapterRequirement = (
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => commitAdapter.requiredCommitAdapters.some(adapter =>
  adapter.id === 'post-commit-verification-adapter' && adapter.status === 'required'
)

const hasDeferredPostCommitStage = (
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => commitAdapter.commitStages.some(stage =>
  stage.id === 'post-commit-verification' && stage.status === 'deferred'
)

const hasDeferredRollbackHandoff = (
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => commitAdapter.commitStages.some(stage =>
  stage.id === 'rollback-recovery-handoff' && stage.status === 'deferred'
)

const noPostCommitEffectsIntact = (
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => installPlan.commandDispatchAllowed === false
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
  && everyOwnDataValueFalse(installPlan.effects)
  && everyOwnDataValueFalse(commitAdapter.effects)

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const check = (
  id: ThirdPartyDataPackPostCommitVerificationPlanCheckId,
  status: ThirdPartyDataPackPostCommitVerificationPlanCheck['status'],
  reason: string
): ThirdPartyDataPackPostCommitVerificationPlanCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackPostCommitVerificationPlanCheck[] => Object.freeze([
  'install-dispatch-plan-deferred',
  'runtime-commit-adapter-deferred',
  'install-target-present',
  'candidate-identity-present',
  'lockfile-hash-present',
  'package-summary-consistent',
  'post-commit-adapter-required',
  'post-commit-stage-deferred',
  'rollback-handoff-deferred',
  'no-post-commit-effects-intact'
].map(id => check(id as ThirdPartyDataPackPostCommitVerificationPlanCheckId, 'skipped', reason)))

const buildChecks = (
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): readonly ThirdPartyDataPackPostCommitVerificationPlanCheck[] => Object.freeze([
  check(
    'install-dispatch-plan-deferred',
    installPlan.status === 'deferred' ? 'satisfied' : 'blocked',
    'Install dispatch planning must remain deferred and inspect-only before post-commit verification can be planned.'
  ),
  check(
    'runtime-commit-adapter-deferred',
    commitAdapter.status === 'deferred' ? 'satisfied' : 'blocked',
    'Runtime publication commit adapter must remain deferred while verification planning inspects required handoffs.'
  ),
  check(
    'install-target-present',
    installPlan.targetPackageId !== undefined
      && clonePackageIds(installPlan.selectedPackageIds).includes(installPlan.targetPackageId)
      ? 'satisfied'
      : 'blocked',
    'Post-commit verification must be tied to a selected install target.'
  ),
  check(
    'candidate-identity-present',
    commitAdapter.candidateIdentity?.candidateHash !== undefined ? 'satisfied' : 'blocked',
    'Post-commit verification needs the candidate identity that future persistent state must match.'
  ),
  check(
    'lockfile-hash-present',
    commitAdapter.lockfileHash !== undefined ? 'satisfied' : 'blocked',
    'Post-commit verification needs the lockfile draft hash that future persistent state must match.'
  ),
  check(
    'package-summary-consistent',
    packageSummaryConsistent(installPlan, commitAdapter) ? 'satisfied' : 'blocked',
    'Install dispatch planning and runtime commit planning must agree on selected packages, load order and totals.'
  ),
  check(
    'post-commit-adapter-required',
    hasPostCommitAdapterRequirement(commitAdapter) ? 'satisfied' : 'blocked',
    'Runtime commit planning must still require a dedicated post-commit verification adapter.'
  ),
  check(
    'post-commit-stage-deferred',
    hasDeferredPostCommitStage(commitAdapter) ? 'satisfied' : 'blocked',
    'The post-commit verification stage must remain deferred until real package/settings/lockfile/registry writes exist.'
  ),
  check(
    'rollback-handoff-deferred',
    hasDeferredRollbackHandoff(commitAdapter) ? 'satisfied' : 'blocked',
    'Failed post-commit verification must still hand off to deferred rollback recovery.'
  ),
  check(
    'no-post-commit-effects-intact',
    noPostCommitEffectsIntact(installPlan, commitAdapter) ? 'satisfied' : 'blocked',
    'Verification planning must not carry command dispatch, transaction commit, runtime publication, write or rollback effects.'
  )
])

const requirement = (
  id: ThirdPartyDataPackPostCommitVerificationRequirementId,
  reason: string
): ThirdPartyDataPackPostCommitVerificationRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const requiredVerifiers = (): readonly ThirdPartyDataPackPostCommitVerificationRequirement[] => Object.freeze([
  requirement(
    'transaction-log-entry-verifier',
    'A future verifier must prove the committed transaction log entry matches the selected install command and candidate identity.'
  ),
  requirement(
    'package-state-verifier',
    'Package files must be checked against the staged candidate before settings, lockfile or live registry state is trusted.'
  ),
  requirement(
    'settings-lockfile-identity-verifier',
    'Installation settings and mod-lock must describe the same package set, load order, candidate hash and lockfile hash.'
  ),
  requirement(
    'live-registry-identity-verifier',
    'The live registry identity must match verified persistent package and lockfile state before GameApp can continue.'
  ),
  requirement(
    'save-cache-isolation-verifier',
    'Post-commit verification must prove player saves and official caches were not mutated by the install transaction.'
  ),
  requirement(
    'path-free-result-verifier',
    'Future UI or IPC success/failure results must be redacted and detached from host paths or candidate internals.'
  ),
  requirement(
    'rollback-handoff-verifier',
    'Any failed verification must hand off to rollback recovery with enough redacted evidence to resume safely.'
  )
])

const stage = (
  id: ThirdPartyDataPackPostCommitVerificationStageId,
  status: ThirdPartyDataPackPostCommitVerificationStage['status'],
  requirementIds: readonly ThirdPartyDataPackPostCommitVerificationRequirementId[],
  reason: string
): ThirdPartyDataPackPostCommitVerificationStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackPostCommitVerificationStage[] => Object.freeze([
  stage(
    'post-commit-verification-inspection',
    'satisfied',
    ['transaction-log-entry-verifier'],
    'Install dispatch and runtime commit plans are consistent enough to inspect post-commit verification requirements.'
  ),
  stage(
    'transaction-log-confirmation',
    'deferred',
    ['transaction-log-entry-verifier'],
    'A committed transaction log entry must be verified before persistent install state is trusted.'
  ),
  stage(
    'package-state-verification',
    'deferred',
    ['package-state-verifier'],
    'Package files must be verified against the selected candidate before live publication can be treated as complete.'
  ),
  stage(
    'settings-lockfile-verification',
    'deferred',
    ['settings-lockfile-identity-verifier'],
    'Settings and mod-lock must be verified as one persistent identity.'
  ),
  stage(
    'live-registry-identity-verification',
    'deferred',
    ['live-registry-identity-verifier'],
    'The live registry identity must not be accepted until it matches persistent install state.'
  ),
  stage(
    'save-cache-isolation-verification',
    'deferred',
    ['save-cache-isolation-verifier'],
    'Player save and official-cache isolation must be verified before the transaction result can be surfaced.'
  ),
  stage(
    'ui-ipc-result-verification',
    'deferred',
    ['path-free-result-verifier'],
    'Future UI and IPC responses remain deferred and must expose only redacted verification outcomes.'
  ),
  stage(
    'rollback-handoff-verification',
    'deferred',
    ['rollback-handoff-verifier'],
    'Failed verification must hand off to rollback recovery before startup or save paths continue.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackPostCommitVerificationStage[] => Object.freeze([
  'post-commit-verification-inspection',
  'transaction-log-confirmation',
  'package-state-verification',
  'settings-lockfile-verification',
  'live-registry-identity-verification',
  'save-cache-isolation-verification',
  'ui-ipc-result-verification',
  'rollback-handoff-verification'
].map(id => stage(id as ThirdPartyDataPackPostCommitVerificationStageId, status, [], reason)))

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
  status: ThirdPartyDataPackPostCommitVerificationPlanStatus,
  reason: string,
  installPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult,
  verificationChecks: readonly ThirdPartyDataPackPostCommitVerificationPlanCheck[],
  diagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[],
  verificationStages: readonly ThirdPartyDataPackPostCommitVerificationStage[],
  includeRequirements: boolean
): ThirdPartyDataPackPostCommitVerificationPlanResult => deepFreezeObjectGraph({
  status,
  installTransactionDispatchPlanStatus: installPlan.status,
  runtimePublicationCommitAdapterStatus: commitAdapter.status,
  reason,
  requestedCommandId: installPlan.requestedCommandId,
  targetPackageId: installPlan.targetPackageId,
  diagnostics,
  selectedPackageIds: clonePackageIds(installPlan.selectedPackageIds),
  blockedPackageIds: clonePackageIds(installPlan.blockedPackageIds),
  blockedCandidatePaths: [
    ...cloneStringList(installPlan.blockedCandidatePaths),
    ...cloneStringList(commitAdapter.blockedCandidatePaths)
  ],
  loadOrder: clonePackageIds(installPlan.loadOrder),
  registryCount: installPlan.registryCount,
  entryCount: installPlan.entryCount,
  packageCount: installPlan.packageCount,
  candidateIdentity: cloneCandidateIdentity(commitAdapter.candidateIdentity),
  lockfileHash: commitAdapter.lockfileHash,
  postCommitVerificationPlan: 'deferred',
  readOnly: true,
  postCommitVerificationAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  verificationChecks,
  verificationStages,
  requiredVerifiers: includeRequirements ? requiredVerifiers() : Object.freeze([]),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackPostCommitVerificationPlan = (
  options: BuildThirdPartyDataPackPostCommitVerificationPlanOptions
): ThirdPartyDataPackPostCommitVerificationPlanResult => {
  const installPlan = options.installTransactionDispatchPlan
  const commitAdapter = options.runtimePublicationCommitAdapter

  if (installPlan.status === 'skipped' || commitAdapter.status === 'skipped') {
    const reason = installPlan.status === 'skipped' ? installPlan.reason : 'no selected third-party data packs'
    return baseResult(
      'skipped',
      reason,
      installPlan,
      commitAdapter,
      skippedChecks(reason),
      [],
      terminalStages('skipped', reason),
      false
    )
  }

  if (installPlan.status === 'blocked' || commitAdapter.status === 'blocked') {
    const reason = installPlan.status === 'blocked' ? installPlan.reason : commitAdapter.reason
    return baseResult(
      'blocked',
      reason,
      installPlan,
      commitAdapter,
      skippedChecks(reason),
      [
        ...safeDiagnostics(installPlan.diagnostics),
        ...safeDiagnostics(commitAdapter.diagnostics)
      ],
      terminalStages('blocked', reason),
      false
    )
  }

  const verificationChecks = buildChecks(installPlan, commitAdapter)
  const blockedDiagnostics = diagnosticsForBlockedChecks(verificationChecks, installPlan.targetPackageId)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'post-commit verification plan inputs are inconsistent',
      installPlan,
      commitAdapter,
      verificationChecks,
      [
        ...safeDiagnostics(installPlan.diagnostics),
        ...safeDiagnostics(commitAdapter.diagnostics),
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'post-commit verification plan inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'post-commit verification plan is inspect-only until persistent install writes, runtime publication and UI/IPC result delivery exist',
    installPlan,
    commitAdapter,
    verificationChecks,
    [
      ...safeDiagnostics(installPlan.diagnostics),
      ...safeDiagnostics(commitAdapter.diagnostics)
    ],
    deferredStages(),
    true
  )
}
