import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from './thirdPartyDataPackTransactionCommandDispatcherHandoff'

export type ThirdPartyDataPackPostCommitVerificationExecutorPreflightStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPostCommitVerificationExecutorPreflightCheckId =
  | 'dispatcher-handoff-deferred'
  | 'install-target-present'
  | 'candidate-identity-present'
  | 'lockfile-hash-present'
  | 'post-commit-executor-required'
  | 'post-commit-execution-deferred'
  | 'ui-ipc-result-handoff-deferred'
  | 'rollback-handoff-deferred'
  | 'no-executor-preflight-effects-intact'

export type ThirdPartyDataPackPostCommitVerificationExecutorPreflightStageId =
  | 'post-commit-executor-preflight-inspection'
  | 'transaction-log-entry-read'
  | 'package-state-read'
  | 'settings-lockfile-identity-read'
  | 'live-registry-identity-read'
  | 'save-cache-isolation-check'
  | 'ui-ipc-result-normalization'
  | 'rollback-recovery-trigger'

export type ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirementId =
  | 'committed-transaction-log-source'
  | 'package-state-source'
  | 'settings-lockfile-state-source'
  | 'live-registry-identity-source'
  | 'save-cache-isolation-source'
  | 'path-free-ui-ipc-result-normalizer'
  | 'rollback-recovery-trigger'

export interface ThirdPartyDataPackPostCommitVerificationExecutorPreflightCheck {
  readonly id: ThirdPartyDataPackPostCommitVerificationExecutorPreflightCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitVerificationExecutorPreflightStage {
  readonly id: ThirdPartyDataPackPostCommitVerificationExecutorPreflightStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirement {
  readonly id: ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitVerificationExecutorPreflightSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary {
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
  readonly postCommitVerificationExecutorCalled: false
  readonly postCommitVerificationExecuted: false
  readonly transactionLogRead: false
  readonly packageStateRead: false
  readonly settingsRead: false
  readonly lockfileRead: false
  readonly liveRegistryRead: false
  readonly saveCacheIsolationChecked: false
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

export interface ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult {
  readonly status: ThirdPartyDataPackPostCommitVerificationExecutorPreflightStatus
  readonly transactionCommandDispatcherHandoffStatus: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult['status']
  readonly reason: string
  readonly requestedCommandId?: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult['requestedCommandId']
  readonly targetPackageId?: PackageId
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightSafeDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly postCommitVerificationExecutorPreflight: 'deferred'
  readonly readOnly: true
  readonly verificationExecutionAllowed: false
  readonly postCommitVerificationAllowed: false
  readonly transactionLogReadAllowed: false
  readonly packageStateReadAllowed: false
  readonly settingsReadAllowed: false
  readonly lockfileReadAllowed: false
  readonly liveRegistryReadAllowed: false
  readonly saveCacheIsolationCheckAllowed: false
  readonly rollbackTriggerAllowed: false
  readonly writeAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly uiIpcResponseAllowed: false
  readonly executorChecks: readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightCheck[]
  readonly executorStages: readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightStage[]
  readonly executorRequirements: readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirement[]
  readonly effects: ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary
}

export interface BuildThirdPartyDataPackPostCommitVerificationExecutorPreflightOptions {
  readonly transactionCommandDispatcherHandoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
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

const createEffectSummary = (): ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary => ({
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
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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
): ThirdPartyDataPackPostCommitVerificationExecutorPreflightSafeDiagnostic => {
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
      ?? 'third-party.post-commit-verification-executor-preflight.diagnostic-copy',
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
): readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackPostCommitVerificationExecutorPreflightSafeDiagnostic[] = []
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
): ThirdPartyDataPackPostCommitVerificationExecutorPreflightSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.post-commit-verification-executor-preflight.checks.${currentCheck.id}`,
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

const hasDispatcherRequirement = (
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
): boolean => hasOwnArrayObjectWithFields(
  handoff.dispatcherRequirements,
  'post-commit-verification-executor',
  'required'
)

const hasDeferredStage = (
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult,
  stageId: string
): boolean => hasOwnArrayObjectWithFields(handoff.handoffStages, stageId, 'deferred')

const noExecutorPreflightEffectsIntact = (
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
): boolean => handoff.dispatcherHandoffAllowed === false
  && handoff.commandDispatchAllowed === false
  && handoff.transactionCommitAllowed === false
  && handoff.postCommitVerificationAllowed === false
  && handoff.commitAllowed === false
  && handoff.writeAllowed === false
  && handoff.runtimeEnablementAllowed === false
  && handoff.uiIpcResponseAllowed === false
  && everyOwnDataValueFalse(handoff.effects)

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const check = (
  id: ThirdPartyDataPackPostCommitVerificationExecutorPreflightCheckId,
  status: ThirdPartyDataPackPostCommitVerificationExecutorPreflightCheck['status'],
  reason: string
): ThirdPartyDataPackPostCommitVerificationExecutorPreflightCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightCheck[] => Object.freeze([
  'dispatcher-handoff-deferred',
  'install-target-present',
  'candidate-identity-present',
  'lockfile-hash-present',
  'post-commit-executor-required',
  'post-commit-execution-deferred',
  'ui-ipc-result-handoff-deferred',
  'rollback-handoff-deferred',
  'no-executor-preflight-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackPostCommitVerificationExecutorPreflightCheckId,
  'skipped',
  reason
)))

const buildChecks = (
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
): readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightCheck[] => Object.freeze([
  check(
    'dispatcher-handoff-deferred',
    handoff.status === 'deferred' ? 'satisfied' : 'blocked',
    'Transaction command dispatcher handoff must remain deferred before the verification executor can be inspected.'
  ),
  check(
    'install-target-present',
    handoff.requestedCommandId === 'install'
      && handoff.targetPackageId !== undefined
      && clonePackageIds(handoff.selectedPackageIds).includes(handoff.targetPackageId)
      ? 'satisfied'
      : 'blocked',
    'Post-commit verification execution preflight only covers a selected install target.'
  ),
  check(
    'candidate-identity-present',
    handoff.candidateIdentity?.candidateHash !== undefined ? 'satisfied' : 'blocked',
    'Post-commit verification execution needs the candidate identity that committed state must prove.'
  ),
  check(
    'lockfile-hash-present',
    handoff.lockfileHash !== undefined ? 'satisfied' : 'blocked',
    'Post-commit verification execution needs the lockfile hash that committed settings and mod-lock state must prove.'
  ),
  check(
    'post-commit-executor-required',
    hasDispatcherRequirement(handoff) ? 'satisfied' : 'blocked',
    'Dispatcher handoff must still require a dedicated post-commit verification executor.'
  ),
  check(
    'post-commit-execution-deferred',
    hasDeferredStage(handoff, 'post-commit-verification-execution') ? 'satisfied' : 'blocked',
    'Post-commit verification execution must remain deferred until real persistent state exists.'
  ),
  check(
    'ui-ipc-result-handoff-deferred',
    hasDeferredStage(handoff, 'ui-ipc-result-handoff') ? 'satisfied' : 'blocked',
    'UI/IPC result delivery must remain deferred while the executor preflight is inspect-only.'
  ),
  check(
    'rollback-handoff-deferred',
    hasDeferredStage(handoff, 'rollback-recovery-handoff') ? 'satisfied' : 'blocked',
    'Failed verification must still hand off to rollback recovery before success can be surfaced.'
  ),
  check(
    'no-executor-preflight-effects-intact',
    noExecutorPreflightEffectsIntact(handoff) ? 'satisfied' : 'blocked',
    'Executor preflight must not carry dispatch, commit, verification, runtime, UI/IPC, read, write or rollback effects.'
  )
])

const requirement = (
  id: ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirementId,
  reason: string
): ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const executorRequirements = (): readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirement[] =>
  Object.freeze([
    requirement(
      'committed-transaction-log-source',
      'A future executor must read a committed transaction log entry through a redacted, path-free source.'
    ),
    requirement(
      'package-state-source',
      'A future executor must verify committed package files against the selected candidate identity.'
    ),
    requirement(
      'settings-lockfile-state-source',
      'A future executor must verify settings and mod-lock describe the same lockfile hash and package set.'
    ),
    requirement(
      'live-registry-identity-source',
      'A future executor must verify the live registry identity before startup or UI success continues.'
    ),
    requirement(
      'save-cache-isolation-source',
      'A future executor must prove player saves and official cache were not mutated by the install transaction.'
    ),
    requirement(
      'path-free-ui-ipc-result-normalizer',
      'A future executor must normalize success/failure output before it is exposed to UI or IPC.'
    ),
    requirement(
      'rollback-recovery-trigger',
      'A future executor must trigger rollback recovery on any failed verifier before surfacing failure.'
    )
  ])

const stage = (
  id: ThirdPartyDataPackPostCommitVerificationExecutorPreflightStageId,
  status: ThirdPartyDataPackPostCommitVerificationExecutorPreflightStage['status'],
  requirementIds: readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirementId[],
  reason: string
): ThirdPartyDataPackPostCommitVerificationExecutorPreflightStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightStage[] => Object.freeze([
  stage(
    'post-commit-executor-preflight-inspection',
    'satisfied',
    ['committed-transaction-log-source', 'package-state-source'],
    'Dispatcher handoff is consistent enough to inspect post-commit verification executor inputs.'
  ),
  stage(
    'transaction-log-entry-read',
    'deferred',
    ['committed-transaction-log-source'],
    'Transaction log reading remains deferred and must not be performed by this preflight report.'
  ),
  stage(
    'package-state-read',
    'deferred',
    ['package-state-source'],
    'Package state reading remains deferred until real committed package files exist.'
  ),
  stage(
    'settings-lockfile-identity-read',
    'deferred',
    ['settings-lockfile-state-source'],
    'Settings and lockfile reads remain deferred until the atomic commit executor writes persistent state.'
  ),
  stage(
    'live-registry-identity-read',
    'deferred',
    ['live-registry-identity-source'],
    'Live registry identity reading remains deferred until runtime publication is actually enabled.'
  ),
  stage(
    'save-cache-isolation-check',
    'deferred',
    ['save-cache-isolation-source'],
    'Save and cache isolation checks remain deferred and must not touch player saves or official caches here.'
  ),
  stage(
    'ui-ipc-result-normalization',
    'deferred',
    ['path-free-ui-ipc-result-normalizer'],
    'UI/IPC result normalization remains deferred and must stay path-free when later implemented.'
  ),
  stage(
    'rollback-recovery-trigger',
    'deferred',
    ['rollback-recovery-trigger'],
    'Rollback recovery triggering remains deferred until a real verifier can fail.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightStage[] => Object.freeze([
  'post-commit-executor-preflight-inspection',
  'transaction-log-entry-read',
  'package-state-read',
  'settings-lockfile-identity-read',
  'live-registry-identity-read',
  'save-cache-isolation-check',
  'ui-ipc-result-normalization',
  'rollback-recovery-trigger'
].map(id => stage(
  id as ThirdPartyDataPackPostCommitVerificationExecutorPreflightStageId,
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
  status: ThirdPartyDataPackPostCommitVerificationExecutorPreflightStatus,
  reason: string,
  handoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult,
  executorChecks: readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightCheck[],
  diagnostics: readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightSafeDiagnostic[],
  executorStages: readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightStage[],
  includeRequirements: boolean
): ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult => deepFreezeObjectGraph({
  status,
  transactionCommandDispatcherHandoffStatus: handoff.status,
  reason,
  requestedCommandId: handoff.requestedCommandId,
  targetPackageId: handoff.targetPackageId,
  diagnostics,
  selectedPackageIds: clonePackageIds(handoff.selectedPackageIds),
  blockedPackageIds: clonePackageIds(handoff.blockedPackageIds),
  blockedCandidatePaths: cloneStringList(handoff.blockedCandidatePaths),
  loadOrder: clonePackageIds(handoff.loadOrder),
  registryCount: handoff.registryCount,
  entryCount: handoff.entryCount,
  packageCount: handoff.packageCount,
  candidateIdentity: cloneCandidateIdentity(handoff.candidateIdentity),
  lockfileHash: handoff.lockfileHash,
  postCommitVerificationExecutorPreflight: 'deferred',
  readOnly: true,
  verificationExecutionAllowed: false,
  postCommitVerificationAllowed: false,
  transactionLogReadAllowed: false,
  packageStateReadAllowed: false,
  settingsReadAllowed: false,
  lockfileReadAllowed: false,
  liveRegistryReadAllowed: false,
  saveCacheIsolationCheckAllowed: false,
  rollbackTriggerAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  executorChecks,
  executorStages,
  executorRequirements: includeRequirements ? executorRequirements() : Object.freeze([]),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackPostCommitVerificationExecutorPreflight = (
  options: BuildThirdPartyDataPackPostCommitVerificationExecutorPreflightOptions
): ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult => {
  const handoff = options.transactionCommandDispatcherHandoff

  if (handoff.status === 'skipped') {
    return baseResult(
      'skipped',
      handoff.reason,
      handoff,
      skippedChecks(handoff.reason),
      [],
      terminalStages('skipped', handoff.reason),
      false
    )
  }

  if (handoff.status === 'blocked') {
    return baseResult(
      'blocked',
      handoff.reason,
      handoff,
      skippedChecks(handoff.reason),
      safeDiagnostics(handoff.diagnostics),
      terminalStages('blocked', handoff.reason),
      false
    )
  }

  const executorChecks = buildChecks(handoff)
  const blockedDiagnostics = diagnosticsForBlockedChecks(executorChecks, handoff.targetPackageId)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'post-commit verification executor preflight inputs are inconsistent',
      handoff,
      executorChecks,
      [
        ...safeDiagnostics(handoff.diagnostics),
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'post-commit verification executor preflight inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'post-commit verification executor preflight is inspect-only until real committed state, live registry identity and UI/IPC result delivery exist',
    handoff,
    executorChecks,
    safeDiagnostics(handoff.diagnostics),
    deferredStages(),
    true
  )
}
