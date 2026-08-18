import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackModLockWriteProbeResult,
  ThirdPartyDataPackModLockWriteProbeStatus
} from './thirdPartyDataPackModLockWriteProbe'
import type {
  ThirdPartyDataPackTransactionCommandPreflightResult
} from './thirdPartyDataPackTransactionCommandPreflight'
import type {
  ThirdPartyDataPackTransactionLogWriteProbeResult,
  ThirdPartyDataPackTransactionLogWriteProbeStatus
} from './thirdPartyDataPackTransactionLogWriteProbe'

export type ThirdPartyDataPackInstallTransactionDispatchPlanStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'
export type ThirdPartyDataPackInstallTransactionDispatchPlanCheckId =
  | 'command-preflight-deferred'
  | 'install-command-confirmed'
  | 'target-package-selected'
  | 'transaction-log-probe-usable'
  | 'mod-lock-probe-usable'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'package-summary-consistent'
  | 'write-probe-effects-contained'
  | 'no-dispatch-effects-intact'
export type ThirdPartyDataPackInstallTransactionDispatchPlanStageId =
  | 'dispatch-plan-inspection'
  | 'install-command-dispatch'
  | 'transaction-log-prepare'
  | 'package-file-stage'
  | 'settings-lockfile-commit'
  | 'runtime-publication-commit'
  | 'post-commit-ui-ipc-response'
  | 'rollback-recovery-handoff'
export type ThirdPartyDataPackInstallTransactionDispatchPlanRequirementId =
  | 'install-command-dispatcher'
  | 'verified-transaction-log-entry'
  | 'staged-package-file-commit'
  | 'atomic-settings-lockfile-commit'
  | 'runtime-publication-commit-adapter'
  | 'rollback-recovery-orchestrator'
  | 'path-free-ui-ipc-result'

export interface ThirdPartyDataPackInstallTransactionDispatchPlanCheck {
  readonly id: ThirdPartyDataPackInstallTransactionDispatchPlanCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackInstallTransactionDispatchPlanStage {
  readonly id: ThirdPartyDataPackInstallTransactionDispatchPlanStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackInstallTransactionDispatchPlanRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackInstallTransactionDispatchPlanRequirement {
  readonly id: ThirdPartyDataPackInstallTransactionDispatchPlanRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackInstallTransactionDispatchPlanSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackInstallTransactionWriteProbeEvidence {
  readonly modLockWriteProbeStatus: ThirdPartyDataPackModLockWriteProbeStatus
  readonly transactionLogWriteProbeStatus: ThirdPartyDataPackTransactionLogWriteProbeStatus
  readonly modLockPersistentWriteExecuted: boolean
  readonly transactionLogPersistentWriteExecuted: boolean
}

export interface ThirdPartyDataPackInstallTransactionDispatchPlanEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly modManagementUiMounted: false
  readonly electronIpcExposed: false
  readonly webFilePickerOpened: false
  readonly androidFilePickerOpened: false
  readonly commandDispatched: false
  readonly transactionCommitted: false
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

export interface ThirdPartyDataPackInstallTransactionDispatchPlanResult {
  readonly status: ThirdPartyDataPackInstallTransactionDispatchPlanStatus
  readonly transactionCommandPreflightStatus: ThirdPartyDataPackTransactionCommandPreflightResult['status']
  readonly modLockWriteProbeStatus: ThirdPartyDataPackModLockWriteProbeResult['status']
  readonly transactionLogWriteProbeStatus: ThirdPartyDataPackTransactionLogWriteProbeResult['status']
  readonly reason: string
  readonly requestedCommandId?: ThirdPartyDataPackTransactionCommandPreflightResult['requestedCommandId']
  readonly targetPackageId?: PackageId
  readonly diagnostics: readonly ThirdPartyDataPackInstallTransactionDispatchPlanSafeDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly installTransactionDispatchPlan: 'deferred'
  readonly readOnly: true
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly commitAllowed: false
  readonly writeAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly uiIpcResponseAllowed: false
  readonly checks: readonly ThirdPartyDataPackInstallTransactionDispatchPlanCheck[]
  readonly stages: readonly ThirdPartyDataPackInstallTransactionDispatchPlanStage[]
  readonly requirements: readonly ThirdPartyDataPackInstallTransactionDispatchPlanRequirement[]
  readonly writeProbeEvidence: ThirdPartyDataPackInstallTransactionWriteProbeEvidence
  readonly effects: ThirdPartyDataPackInstallTransactionDispatchPlanEffectSummary
}

export interface BuildThirdPartyDataPackInstallTransactionDispatchPlanOptions {
  readonly transactionCommandPreflight: ThirdPartyDataPackTransactionCommandPreflightResult
  readonly modLockWriteProbe: ThirdPartyDataPackModLockWriteProbeResult
  readonly transactionLogWriteProbe: ThirdPartyDataPackTransactionLogWriteProbeResult
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

const createEffectSummary = (): ThirdPartyDataPackInstallTransactionDispatchPlanEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatched: false,
  transactionCommitted: false,
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

const safeDiagnostic = (diagnostic: object): ThirdPartyDataPackInstallTransactionDispatchPlanSafeDiagnostic => {
  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readOwnStringField(diagnostic, 'stage') ?? 'third-party.install-transaction-dispatch-plan.diagnostic-copy',
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
): readonly ThirdPartyDataPackInstallTransactionDispatchPlanSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackInstallTransactionDispatchPlanSafeDiagnostic[] = []
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
): ThirdPartyDataPackInstallTransactionDispatchPlanSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackInstallTransactionDispatchPlanCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackInstallTransactionDispatchPlanSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.install-transaction-dispatch-plan.checks.${currentCheck.id}`,
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

const everyEffectFalseExcept = (
  effects: object,
  allowedKey: string,
  allowedValue: boolean
): boolean => {
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
    return 'value' in descriptor
      && (key === allowedKey ? descriptor.value === allowedValue : descriptor.value === false)
  })
}

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const statusUsable = (status: 'deferred' | 'written' | 'skipped' | 'blocked' | 'failed'): boolean =>
  status === 'deferred' || status === 'written'

const targetPackageSelected = (
  targetPackageId: PackageId | undefined,
  selectedPackageIds: readonly PackageId[]
): boolean => targetPackageId !== undefined && selectedPackageIds.includes(targetPackageId)

const candidateHashConsistent = (
  commandPreflight: ThirdPartyDataPackTransactionCommandPreflightResult,
  modLockWriteProbe: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLogWriteProbe: ThirdPartyDataPackTransactionLogWriteProbeResult
): boolean => commandPreflight.writeAllowed === false
  && modLockWriteProbe.candidateIdentity?.candidateHash !== undefined
  && modLockWriteProbe.candidateIdentity.candidateHash === transactionLogWriteProbe.candidateIdentity?.candidateHash

const lockfileHashConsistent = (
  commandPreflight: ThirdPartyDataPackTransactionCommandPreflightResult,
  modLockWriteProbe: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLogWriteProbe: ThirdPartyDataPackTransactionLogWriteProbeResult
): boolean => commandPreflight.writeAllowed === false
  && modLockWriteProbe.lockfileHash !== undefined
  && modLockWriteProbe.lockfileHash === transactionLogWriteProbe.lockfileHash

const packageSummaryConsistent = (
  commandPreflight: ThirdPartyDataPackTransactionCommandPreflightResult,
  modLockWriteProbe: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLogWriteProbe: ThirdPartyDataPackTransactionLogWriteProbeResult
): boolean => {
  const commandSelected = clonePackageIds(commandPreflight.selectedPackageIds)
  const modLockSelected = clonePackageIds(modLockWriteProbe.selectedPackageIds)
  const transactionLogSelected = clonePackageIds(transactionLogWriteProbe.selectedPackageIds)
  const commandLoadOrder = clonePackageIds(commandPreflight.loadOrder)
  const modLockLoadOrder = clonePackageIds(modLockWriteProbe.loadOrder)
  const transactionLogLoadOrder = clonePackageIds(transactionLogWriteProbe.loadOrder)
  return arraysEqual(commandSelected, modLockSelected)
    && arraysEqual(commandSelected, transactionLogSelected)
    && arraysEqual(commandLoadOrder, modLockLoadOrder)
    && arraysEqual(commandLoadOrder, transactionLogLoadOrder)
    && commandPreflight.registryCount === modLockWriteProbe.registryCount
    && commandPreflight.registryCount === transactionLogWriteProbe.registryCount
    && commandPreflight.entryCount === modLockWriteProbe.entryCount
    && commandPreflight.entryCount === transactionLogWriteProbe.entryCount
    && commandPreflight.packageCount === modLockWriteProbe.packageCount
    && commandPreflight.packageCount === transactionLogWriteProbe.packageCount
}

const writeProbeEffectsContained = (
  modLockWriteProbe: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLogWriteProbe: ThirdPartyDataPackTransactionLogWriteProbeResult
): boolean => {
  const modLockWritten = modLockWriteProbe.status === 'written'
  const transactionLogWritten = transactionLogWriteProbe.status === 'written'
  return modLockWriteProbe.persistentWriteExecuted === modLockWritten
    && transactionLogWriteProbe.persistentWriteExecuted === transactionLogWritten
    && everyEffectFalseExcept(modLockWriteProbe.effects, 'lockfileWritten', modLockWritten)
    && everyEffectFalseExcept(transactionLogWriteProbe.effects, 'transactionLogWritten', transactionLogWritten)
}

const noDispatchEffectsIntact = (
  commandPreflight: ThirdPartyDataPackTransactionCommandPreflightResult,
  modLockWriteProbe: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLogWriteProbe: ThirdPartyDataPackTransactionLogWriteProbeResult
): boolean => commandPreflight.commandDispatchAllowed === false
  && commandPreflight.commitAllowed === false
  && commandPreflight.writeAllowed === false
  && commandPreflight.runtimeEnablementAllowed === false
  && commandPreflight.uiMountAllowed === false
  && commandPreflight.ipcAllowed === false
  && everyOwnDataValueFalse(commandPreflight.effects)
  && modLockWriteProbe.effects.runtimeEnablementAllowed === false
  && modLockWriteProbe.effects.electronIpcExposed === false
  && modLockWriteProbe.effects.packageFilesWritten === false
  && modLockWriteProbe.effects.settingsWritten === false
  && transactionLogWriteProbe.effects.runtimeEnablementAllowed === false
  && transactionLogWriteProbe.effects.electronIpcExposed === false
  && transactionLogWriteProbe.effects.packageFilesWritten === false
  && transactionLogWriteProbe.effects.lockfileWritten === false

const check = (
  id: ThirdPartyDataPackInstallTransactionDispatchPlanCheckId,
  status: ThirdPartyDataPackInstallTransactionDispatchPlanCheck['status'],
  reason: string
): ThirdPartyDataPackInstallTransactionDispatchPlanCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackInstallTransactionDispatchPlanCheck[] => Object.freeze([
  'command-preflight-deferred',
  'install-command-confirmed',
  'target-package-selected',
  'transaction-log-probe-usable',
  'mod-lock-probe-usable',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'package-summary-consistent',
  'write-probe-effects-contained',
  'no-dispatch-effects-intact'
].map(id => check(id as ThirdPartyDataPackInstallTransactionDispatchPlanCheckId, 'skipped', reason)))

const buildChecks = (
  commandPreflight: ThirdPartyDataPackTransactionCommandPreflightResult,
  modLockWriteProbe: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLogWriteProbe: ThirdPartyDataPackTransactionLogWriteProbeResult
): readonly ThirdPartyDataPackInstallTransactionDispatchPlanCheck[] => {
  const selectedPackageIds = clonePackageIds(commandPreflight.selectedPackageIds)
  return Object.freeze([
    check(
      'command-preflight-deferred',
      commandPreflight.status === 'deferred' ? 'satisfied' : 'blocked',
      'Transaction command preflight must be deferred and inspect-only before install dispatch can be planned.'
    ),
    check(
      'install-command-confirmed',
      commandPreflight.requestedCommandId === 'install' ? 'satisfied' : 'blocked',
      'This dispatch plan only covers the install command; enable, disable, upgrade and uninstall need separate slices.'
    ),
    check(
      'target-package-selected',
      targetPackageSelected(commandPreflight.targetPackageId, selectedPackageIds) ? 'satisfied' : 'blocked',
      'The install target must be present in the selected package summary.'
    ),
    check(
      'transaction-log-probe-usable',
      statusUsable(transactionLogWriteProbe.status) ? 'satisfied' : 'blocked',
      'Transaction-log evidence must be deferred or explicitly written by the isolated probe; failed writes cannot feed dispatch planning.'
    ),
    check(
      'mod-lock-probe-usable',
      statusUsable(modLockWriteProbe.status) ? 'satisfied' : 'blocked',
      'mod-lock evidence must be deferred or explicitly written by the isolated probe; failed writes cannot feed dispatch planning.'
    ),
    check(
      'candidate-identity-consistent',
      candidateHashConsistent(commandPreflight, modLockWriteProbe, transactionLogWriteProbe) ? 'satisfied' : 'blocked',
      'Install dispatch planning requires both write probes to describe the same candidate hash.'
    ),
    check(
      'lockfile-hash-consistent',
      lockfileHashConsistent(commandPreflight, modLockWriteProbe, transactionLogWriteProbe) ? 'satisfied' : 'blocked',
      'Install dispatch planning requires both write probes to describe the same lockfile hash.'
    ),
    check(
      'package-summary-consistent',
      packageSummaryConsistent(commandPreflight, modLockWriteProbe, transactionLogWriteProbe) ? 'satisfied' : 'blocked',
      'Command preflight, mod-lock evidence and transaction-log evidence must agree on selected packages, load order and totals.'
    ),
    check(
      'write-probe-effects-contained',
      writeProbeEffectsContained(modLockWriteProbe, transactionLogWriteProbe) ? 'satisfied' : 'blocked',
      'Isolated write probes may only carry their own probe write effect and must not leak runtime, package, settings, save or cache effects.'
    ),
    check(
      'no-dispatch-effects-intact',
      noDispatchEffectsIntact(commandPreflight, modLockWriteProbe, transactionLogWriteProbe) ? 'satisfied' : 'blocked',
      'Planning must not carry any command dispatch, runtime publication, UI, IPC or normal transaction side effects.'
    )
  ])
}

const requirement = (
  id: ThirdPartyDataPackInstallTransactionDispatchPlanRequirementId,
  reason: string
): ThirdPartyDataPackInstallTransactionDispatchPlanRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const requirements = (): readonly ThirdPartyDataPackInstallTransactionDispatchPlanRequirement[] =>
  Object.freeze([
    requirement(
      'install-command-dispatcher',
      'A future dispatcher must translate the confirmed install intent into ordered transaction stages without direct UI or IPC writes.'
    ),
    requirement(
      'verified-transaction-log-entry',
      'Install commit must prepare a verified recovery log entry before any package or lockfile mutation.'
    ),
    requirement(
      'staged-package-file-commit',
      'Package files must be staged, validated and restorable before installed state can change.'
    ),
    requirement(
      'atomic-settings-lockfile-commit',
      'Installation settings and mod-lock replacement must commit as one candidate identity.'
    ),
    requirement(
      'runtime-publication-commit-adapter',
      'Runtime publication can only occur after persistent install state is verified.'
    ),
    requirement(
      'rollback-recovery-orchestrator',
      'Any failed install step must resume or rollback through the recovery orchestrator before GameApp can continue.'
    ),
    requirement(
      'path-free-ui-ipc-result',
      'Future UI or IPC responses must expose only redacted command results and never host paths or candidate internals.'
    )
  ])

const stage = (
  id: ThirdPartyDataPackInstallTransactionDispatchPlanStageId,
  status: ThirdPartyDataPackInstallTransactionDispatchPlanStage['status'],
  requirementIds: readonly ThirdPartyDataPackInstallTransactionDispatchPlanRequirementId[],
  reason: string
): ThirdPartyDataPackInstallTransactionDispatchPlanStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackInstallTransactionDispatchPlanStage[] => Object.freeze([
  stage(
    'dispatch-plan-inspection',
    'satisfied',
    ['install-command-dispatcher'],
    'Confirmed install intent and isolated write-probe evidence are consistent enough to inspect the future dispatcher plan.'
  ),
  stage(
    'install-command-dispatch',
    'deferred',
    ['install-command-dispatcher'],
    'Actual command dispatch remains deferred; this plan does not call commit logic.'
  ),
  stage(
    'transaction-log-prepare',
    'deferred',
    ['verified-transaction-log-entry'],
    'A real install transaction must prepare a recovery log before any persistent package, settings or lockfile mutation.'
  ),
  stage(
    'package-file-stage',
    'deferred',
    ['staged-package-file-commit'],
    'Package file staging remains deferred until staged copy, verification and restore adapters exist.'
  ),
  stage(
    'settings-lockfile-commit',
    'deferred',
    ['atomic-settings-lockfile-commit'],
    'Settings and mod-lock commit remains deferred and must not reuse isolated probe writes as committed install state.'
  ),
  stage(
    'runtime-publication-commit',
    'deferred',
    ['runtime-publication-commit-adapter'],
    'Runtime registry publication remains deferred until persistent install state is verified.'
  ),
  stage(
    'post-commit-ui-ipc-response',
    'deferred',
    ['path-free-ui-ipc-result'],
    'UI and IPC result delivery remains deferred and must stay path-free.'
  ),
  stage(
    'rollback-recovery-handoff',
    'deferred',
    ['rollback-recovery-orchestrator'],
    'Failed install commands must hand off to rollback recovery before any startup or save path proceeds.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackInstallTransactionDispatchPlanStage[] => Object.freeze([
  'dispatch-plan-inspection',
  'install-command-dispatch',
  'transaction-log-prepare',
  'package-file-stage',
  'settings-lockfile-commit',
  'runtime-publication-commit',
  'post-commit-ui-ipc-response',
  'rollback-recovery-handoff'
].map(id => stage(id as ThirdPartyDataPackInstallTransactionDispatchPlanStageId, status, [], reason)))

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

const writeProbeEvidence = (
  modLockWriteProbe: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLogWriteProbe: ThirdPartyDataPackTransactionLogWriteProbeResult
): ThirdPartyDataPackInstallTransactionWriteProbeEvidence => Object.freeze({
  modLockWriteProbeStatus: modLockWriteProbe.status,
  transactionLogWriteProbeStatus: transactionLogWriteProbe.status,
  modLockPersistentWriteExecuted: modLockWriteProbe.persistentWriteExecuted,
  transactionLogPersistentWriteExecuted: transactionLogWriteProbe.persistentWriteExecuted
})

const baseResult = (
  status: ThirdPartyDataPackInstallTransactionDispatchPlanStatus,
  reason: string,
  commandPreflight: ThirdPartyDataPackTransactionCommandPreflightResult,
  modLockWriteProbe: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLogWriteProbe: ThirdPartyDataPackTransactionLogWriteProbeResult,
  checks: readonly ThirdPartyDataPackInstallTransactionDispatchPlanCheck[],
  diagnostics: readonly ThirdPartyDataPackInstallTransactionDispatchPlanSafeDiagnostic[],
  stages: readonly ThirdPartyDataPackInstallTransactionDispatchPlanStage[],
  includeRequirements: boolean
): ThirdPartyDataPackInstallTransactionDispatchPlanResult => deepFreezeObjectGraph({
  status,
  transactionCommandPreflightStatus: commandPreflight.status,
  modLockWriteProbeStatus: modLockWriteProbe.status,
  transactionLogWriteProbeStatus: transactionLogWriteProbe.status,
  reason,
  requestedCommandId: commandPreflight.requestedCommandId,
  targetPackageId: commandPreflight.targetPackageId,
  diagnostics,
  selectedPackageIds: clonePackageIds(commandPreflight.selectedPackageIds),
  blockedPackageIds: clonePackageIds(commandPreflight.blockedPackageIds),
  blockedCandidatePaths: [
    ...cloneStringList(modLockWriteProbe.blockedCandidatePaths),
    ...cloneStringList(transactionLogWriteProbe.blockedCandidatePaths)
  ],
  loadOrder: clonePackageIds(commandPreflight.loadOrder),
  registryCount: commandPreflight.registryCount,
  entryCount: commandPreflight.entryCount,
  packageCount: commandPreflight.packageCount,
  installTransactionDispatchPlan: 'deferred',
  readOnly: true,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  checks,
  stages,
  requirements: includeRequirements ? requirements() : Object.freeze([]),
  writeProbeEvidence: writeProbeEvidence(modLockWriteProbe, transactionLogWriteProbe),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackInstallTransactionDispatchPlan = (
  options: BuildThirdPartyDataPackInstallTransactionDispatchPlanOptions
): ThirdPartyDataPackInstallTransactionDispatchPlanResult => {
  const commandPreflight = options.transactionCommandPreflight
  const modLockWriteProbe = options.modLockWriteProbe
  const transactionLogWriteProbe = options.transactionLogWriteProbe

  if (
    commandPreflight.status === 'skipped'
    || modLockWriteProbe.status === 'skipped'
    || transactionLogWriteProbe.status === 'skipped'
  ) {
    const reason = commandPreflight.status === 'skipped'
      ? commandPreflight.reason
      : 'no selected third-party data packs'
    return baseResult(
      'skipped',
      reason,
      commandPreflight,
      modLockWriteProbe,
      transactionLogWriteProbe,
      skippedChecks(reason),
      [],
      terminalStages('skipped', reason),
      false
    )
  }

  if (
    commandPreflight.status === 'blocked'
    || modLockWriteProbe.status === 'blocked'
    || modLockWriteProbe.status === 'failed'
    || transactionLogWriteProbe.status === 'blocked'
    || transactionLogWriteProbe.status === 'failed'
  ) {
    const reason = commandPreflight.status === 'blocked'
      ? commandPreflight.reason
      : modLockWriteProbe.status === 'blocked' || modLockWriteProbe.status === 'failed'
        ? modLockWriteProbe.reason
        : transactionLogWriteProbe.reason
    return baseResult(
      'blocked',
      reason,
      commandPreflight,
      modLockWriteProbe,
      transactionLogWriteProbe,
      skippedChecks(reason),
      [
        ...safeDiagnostics(commandPreflight.diagnostics),
        ...safeDiagnostics(modLockWriteProbe.diagnostics),
        ...safeDiagnostics(transactionLogWriteProbe.diagnostics)
      ],
      terminalStages('blocked', reason),
      false
    )
  }

  const checks = buildChecks(commandPreflight, modLockWriteProbe, transactionLogWriteProbe)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, commandPreflight.targetPackageId)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'install transaction dispatch plan inputs are inconsistent',
      commandPreflight,
      modLockWriteProbe,
      transactionLogWriteProbe,
      checks,
      [
        ...safeDiagnostics(commandPreflight.diagnostics),
        ...safeDiagnostics(modLockWriteProbe.diagnostics),
        ...safeDiagnostics(transactionLogWriteProbe.diagnostics),
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'install transaction dispatch plan inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'install transaction dispatch plan is inspect-only until command dispatch, persistent package commits, runtime publication and rollback recovery are implemented',
    commandPreflight,
    modLockWriteProbe,
    transactionLogWriteProbe,
    checks,
    [
      ...safeDiagnostics(commandPreflight.diagnostics),
      ...safeDiagnostics(modLockWriteProbe.diagnostics),
      ...safeDiagnostics(transactionLogWriteProbe.diagnostics)
    ],
    deferredStages(),
    true
  )
}
