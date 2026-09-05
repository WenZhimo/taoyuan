import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackStartupGateHandoffPreflightResult
} from './thirdPartyDataPackStartupGateHandoffPreflight'
import {
  readThirdPartyDataPackEnabledRuntimeCommandId,
  type ThirdPartyDataPackEnabledRuntimeCommandId
} from './thirdPartyDataPackRuntimeCommandState'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

export type ThirdPartyDataPackStartupGatePersistentStatePreflightStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackStartupGatePersistentStatePreflightCheckId =
  | 'startup-gate-handoff-deferred'
  | 'startup-gate-handoff-prepared'
  | 'install-target-present'
  | 'candidate-identity-present'
  | 'lockfile-hash-present'
  | 'persistent-state-requirements-present'
  | 'startup-read-boundaries-deferred'
  | 'no-startup-read-write-effects'

export type ThirdPartyDataPackStartupGatePersistentStateStageId =
  | 'startup-gate-handoff-consumed'
  | 'persistent-state-source-contract'
  | 'transaction-log-state-read'
  | 'package-state-read'
  | 'settings-state-read'
  | 'mod-lock-state-read'
  | 'live-registry-identity-read'
  | 'save-cache-isolation-read'
  | 'startup-failure-reporting'
  | 'launcher-gameapp-gate'

export type ThirdPartyDataPackStartupGatePersistentStateRequirementId =
  | 'committed-transaction-log-source'
  | 'package-state-source'
  | 'settings-state-source'
  | 'mod-lock-state-source'
  | 'live-registry-identity-source'
  | 'save-cache-isolation-source'
  | 'startup-failure-reporting-source'
  | 'no-startup-read-write-side-effect-guard'

export interface ThirdPartyDataPackStartupGatePersistentStatePreflightCheck {
  readonly id: ThirdPartyDataPackStartupGatePersistentStatePreflightCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackStartupGatePersistentStateStage {
  readonly id: ThirdPartyDataPackStartupGatePersistentStateStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackStartupGatePersistentStateRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackStartupGatePersistentStateRequirement {
  readonly id: ThirdPartyDataPackStartupGatePersistentStateRequirementId
  readonly status: 'required'
  readonly sourceKind:
    | 'transaction-log'
    | 'package-state'
    | 'settings'
    | 'mod-lock'
    | 'live-registry'
    | 'save-cache'
    | 'diagnostic'
    | 'side-effect-guard'
  readonly reason: string
}

export interface ThirdPartyDataPackStartupGatePersistentStateEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly modManagementUiMounted: false
  readonly launcherAppMounted: false
  readonly gameAppCreated: false
  readonly piniaCreated: false
  readonly routerMounted: false
  readonly electronIpcExposed: false
  readonly electronIpcResponseSent: false
  readonly webFilePickerOpened: false
  readonly webUiBridgeOpened: false
  readonly webUiResponsePublished: false
  readonly androidFilePickerOpened: false
  readonly androidUiBridgeOpened: false
  readonly androidUiResponsePublished: false
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
  readonly saveRead: false
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
  readonly startupGateHandoffConsumed: boolean
  readonly persistentStateSourcePrepared: boolean
}

export interface ThirdPartyDataPackStartupGatePersistentStatePreflightResult {
  readonly status: ThirdPartyDataPackStartupGatePersistentStatePreflightStatus
  readonly startupGateHandoffPreflightStatus: ThirdPartyDataPackStartupGateHandoffPreflightResult['status']
  readonly reason: string
  readonly startupGatePersistentStatePreflight: ThirdPartyDataPackStartupGatePersistentStatePreflightStatus
  readonly readOnly: true
  readonly startupGateHandoffConsumed: boolean
  readonly persistentStateSourcePrepared: boolean
  readonly persistentStartupReadAllowed: false
  readonly transactionLogReadAllowed: false
  readonly packageStateReadAllowed: false
  readonly settingsReadAllowed: false
  readonly lockfileReadAllowed: false
  readonly liveRegistryReadAllowed: false
  readonly saveReadAllowed: false
  readonly saveCacheIsolationCheckAllowed: false
  readonly startupFailureReportingAllowed: false
  readonly launcherAppAllowed: false
  readonly gameAppCreationAllowed: false
  readonly piniaCreationAllowed: false
  readonly routerMountAllowed: false
  readonly uiIpcResponseDeliveryAllowed: false
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly writeAllowed: false
  readonly rollbackRecoveryAllowed: false
  readonly requestedCommandId?: ThirdPartyDataPackEnabledRuntimeCommandId
  readonly targetPackageId?: PackageId
  readonly envelopeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
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
  readonly checks: readonly ThirdPartyDataPackStartupGatePersistentStatePreflightCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly persistentStateStages: readonly ThirdPartyDataPackStartupGatePersistentStateStage[]
  readonly persistentStateRequirements: readonly ThirdPartyDataPackStartupGatePersistentStateRequirement[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackStartupGatePersistentStateEffectSummary
}

export interface BuildThirdPartyDataPackStartupGatePersistentStatePreflightOptions {
  readonly startupGateHandoffPreflight: ThirdPartyDataPackStartupGateHandoffPreflightResult
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

const requiredStartupRequirementIds = new Set([
  'persistent-install-state-source',
  'live-registry-identity-source',
  'save-cache-isolation-source',
  'startup-failure-reporting',
  'no-startup-side-effect-guard'
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

const readOwnNumberField = (
  value: object,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
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
      ?? 'third-party.startup-gate-persistent-state-preflight.diagnostic-copy',
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

const cloneSummary = (
  summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary | undefined,
  fallback: ThirdPartyDataPackStartupGateHandoffPreflightResult
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => {
  const source = summary !== undefined && typeof summary === 'object' ? summary : fallback.summary
  return Object.freeze({
    selectedPackageCount: readOwnNumberField(source, 'selectedPackageCount') ?? clonePackageIds(fallback.selectedPackageIds).length,
    blockedPackageCount: readOwnNumberField(source, 'blockedPackageCount') ?? clonePackageIds(fallback.blockedPackageIds).length,
    blockedCandidateCount: readOwnNumberField(source, 'blockedCandidateCount') ?? fallback.blockedCandidateCount,
    loadOrderCount: readOwnNumberField(source, 'loadOrderCount') ?? clonePackageIds(fallback.loadOrder).length,
    registryCount: readOwnNumberField(source, 'registryCount') ?? fallback.registryCount,
    entryCount: readOwnNumberField(source, 'entryCount') ?? fallback.entryCount,
    packageCount: readOwnNumberField(source, 'packageCount') ?? fallback.packageCount,
    diagnosticCount: readOwnNumberField(source, 'diagnosticCount') ?? safeDiagnostics(fallback.diagnostics).length
  })
}

const allOwnBooleanFlagsFalse = (
  value: object,
  allowedTrueKeys: readonly string[] = []
): boolean => {
  const allowedTrue = new Set(allowedTrueKeys)
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
    if (!('value' in descriptor) || typeof descriptor.value !== 'boolean') return false
    return descriptor.value === false || (typeof key === 'string' && allowedTrue.has(key))
  })
}

const hasOwnArrayObjectWithFields = (
  values: readonly unknown[],
  fields: Readonly<Record<string, string>>
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
    if (value === undefined || value === null || typeof value !== 'object') continue
    if (Object.entries(fields).every(([field, expected]) => readOwnStringField(value, field) === expected)) {
      return true
    }
  }
  return false
}

const startupRequirementsPresent = (
  source: ThirdPartyDataPackStartupGateHandoffPreflightResult
): boolean => [...requiredStartupRequirementIds].every(id =>
  hasOwnArrayObjectWithFields(source.startupRequirements, {
    id,
    status: 'required'
  })
)

const startupReadBoundariesDeferred = (
  source: ThirdPartyDataPackStartupGateHandoffPreflightResult
): boolean => source.startupGateHandoffAllowed === false
  && source.launcherAppAllowed === false
  && source.gameAppCreationAllowed === false
  && source.piniaCreationAllowed === false
  && source.routerMountAllowed === false
  && source.saveReadAllowed === false
  && source.uiIpcResponseDeliveryAllowed === false
  && source.commandDispatchAllowed === false
  && source.transactionCommitAllowed === false
  && source.postCommitVerificationAllowed === false
  && source.runtimeEnablementAllowed === false
  && source.writeAllowed === false
  && source.rollbackRecoveryAllowed === false

const noStartupReadWriteEffects = (
  source: ThirdPartyDataPackStartupGateHandoffPreflightResult
): boolean => startupReadBoundariesDeferred(source)
  && allOwnBooleanFlagsFalse(source.effects, [
    'responseDeliveryOrchestrationConsumed',
    'startupGateHandoffPrepared'
  ])

const enabledCommandTargetPresent = (
  source: ThirdPartyDataPackStartupGateHandoffPreflightResult
): boolean => readThirdPartyDataPackEnabledRuntimeCommandId(source.requestedCommandId) !== undefined
  && source.targetPackageId !== undefined
  && clonePackageIds(source.selectedPackageIds).includes(source.targetPackageId)

const check = (
  id: ThirdPartyDataPackStartupGatePersistentStatePreflightCheckId,
  status: ThirdPartyDataPackStartupGatePersistentStatePreflightCheck['status'],
  reason: string
): ThirdPartyDataPackStartupGatePersistentStatePreflightCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackStartupGatePersistentStatePreflightCheck[] => Object.freeze([
  'startup-gate-handoff-deferred',
  'startup-gate-handoff-prepared',
  'install-target-present',
  'candidate-identity-present',
  'lockfile-hash-present',
  'persistent-state-requirements-present',
  'startup-read-boundaries-deferred',
  'no-startup-read-write-effects'
].map(id => check(
  id as ThirdPartyDataPackStartupGatePersistentStatePreflightCheckId,
  'skipped',
  reason
)))

const buildChecks = (
  source: ThirdPartyDataPackStartupGateHandoffPreflightResult
): readonly ThirdPartyDataPackStartupGatePersistentStatePreflightCheck[] => Object.freeze([
  check(
    'startup-gate-handoff-deferred',
    source.status === 'deferred' ? 'satisfied' : 'blocked',
    'Persistent startup state source preflight must consume a deferred startup gate handoff preflight.'
  ),
  check(
    'startup-gate-handoff-prepared',
    source.startupGateHandoffPrepared === true && source.responseDeliveryOrchestrationConsumed === true
      ? 'satisfied'
      : 'blocked',
    'Startup gate handoff requirements must be prepared before persistent startup state sources are described.'
  ),
  check(
    'install-target-present',
    enabledCommandTargetPresent(source) ? 'satisfied' : 'blocked',
    'Persistent startup state sources need the selected enabled package target that startup must reconcile.'
  ),
  check(
    'candidate-identity-present',
    source.candidateIdentity?.candidateHash !== undefined ? 'satisfied' : 'blocked',
    'Persistent startup state sources need the candidate identity that committed state must prove.'
  ),
  check(
    'lockfile-hash-present',
    source.lockfileHash !== undefined ? 'satisfied' : 'blocked',
    'Persistent startup state sources need the lockfile hash that settings and mod-lock must prove.'
  ),
  check(
    'persistent-state-requirements-present',
    startupRequirementsPresent(source) ? 'satisfied' : 'blocked',
    'Startup handoff must explicitly require persistent install state, live registry identity, save/cache isolation, failure reporting and side-effect guards.'
  ),
  check(
    'startup-read-boundaries-deferred',
    startupReadBoundariesDeferred(source) ? 'satisfied' : 'blocked',
    'This source contract may not allow LauncherApp, GameApp, save reads, command dispatch, runtime enablement, writes or rollback.'
  ),
  check(
    'no-startup-read-write-effects',
    noStartupReadWriteEffects(source) ? 'satisfied' : 'blocked',
    'The source startup handoff must not already contain persistent reads, writes, registry publication, UI mount or rollback effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackStartupGatePersistentStatePreflightCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.startup-gate-persistent-state-preflight.checks.${currentCheck.id}`,
    packageId
  )))

const requirement = (
  id: ThirdPartyDataPackStartupGatePersistentStateRequirementId,
  sourceKind: ThirdPartyDataPackStartupGatePersistentStateRequirement['sourceKind'],
  reason: string
): ThirdPartyDataPackStartupGatePersistentStateRequirement => Object.freeze({
  id,
  status: 'required',
  sourceKind,
  reason
})

const persistentStateRequirements = (): readonly ThirdPartyDataPackStartupGatePersistentStateRequirement[] =>
  Object.freeze([
    requirement(
      'committed-transaction-log-source',
      'transaction-log',
      'Startup must read a committed transaction log summary before treating the install command as settled.'
    ),
    requirement(
      'package-state-source',
      'package-state',
      'Startup must verify committed package state still matches the selected candidate identity.'
    ),
    requirement(
      'settings-state-source',
      'settings',
      'Startup must verify global settings describe the expected enabled package set without touching saves.'
    ),
    requirement(
      'mod-lock-state-source',
      'mod-lock',
      'Startup must verify mod-lock state matches the expected lockfile hash and load order.'
    ),
    requirement(
      'live-registry-identity-source',
      'live-registry',
      'GameApp creation must wait for a live registry identity that matches the persistent install state.'
    ),
    requirement(
      'save-cache-isolation-source',
      'save-cache',
      'Startup must prove player saves and official cache data remain isolated before opening a writable session.'
    ),
    requirement(
      'startup-failure-reporting-source',
      'diagnostic',
      'Startup failure reporting must be path-free and use the existing redacted diagnostic channel.'
    ),
    requirement(
      'no-startup-read-write-side-effect-guard',
      'side-effect-guard',
      'This preflight may only describe required sources and must not read or write persistent state.'
    )
  ])

const stage = (
  id: ThirdPartyDataPackStartupGatePersistentStateStageId,
  status: ThirdPartyDataPackStartupGatePersistentStateStage['status'],
  requirementIds: readonly ThirdPartyDataPackStartupGatePersistentStateRequirementId[],
  reason: string
): ThirdPartyDataPackStartupGatePersistentStateStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackStartupGatePersistentStateStage[] => Object.freeze([
  stage(
    'startup-gate-handoff-consumed',
    'satisfied',
    ['no-startup-read-write-side-effect-guard'],
    'Startup gate handoff was inspected without invoking LauncherApp, GameApp or persistent reads.'
  ),
  stage(
    'persistent-state-source-contract',
    'satisfied',
    ['committed-transaction-log-source', 'package-state-source', 'settings-state-source', 'mod-lock-state-source'],
    'Persistent startup state source contract is prepared as a path-free requirement matrix.'
  ),
  stage(
    'transaction-log-state-read',
    'deferred',
    ['committed-transaction-log-source'],
    'Transaction log reading remains deferred to a later real startup source adapter.'
  ),
  stage(
    'package-state-read',
    'deferred',
    ['package-state-source'],
    'Package state reading remains deferred to a later real startup source adapter.'
  ),
  stage(
    'settings-state-read',
    'deferred',
    ['settings-state-source'],
    'Settings reading remains deferred to a later real startup source adapter.'
  ),
  stage(
    'mod-lock-state-read',
    'deferred',
    ['mod-lock-state-source'],
    'Mod-lock reading remains deferred to a later real startup source adapter.'
  ),
  stage(
    'live-registry-identity-read',
    'deferred',
    ['live-registry-identity-source'],
    'Live registry identity reading remains deferred until runtime publication is actually enabled.'
  ),
  stage(
    'save-cache-isolation-read',
    'deferred',
    ['save-cache-isolation-source'],
    'Save/cache isolation checks remain deferred and must not touch player saves or official caches here.'
  ),
  stage(
    'startup-failure-reporting',
    'deferred',
    ['startup-failure-reporting-source'],
    'Startup failure reporting remains deferred to the existing redacted diagnostic channel.'
  ),
  stage(
    'launcher-gameapp-gate',
    'deferred',
    ['live-registry-identity-source', 'save-cache-isolation-source'],
    'LauncherApp, GameApp, Pinia and router creation remain behind the future startup gate.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackStartupGatePersistentStateStage[] => Object.freeze([
  'startup-gate-handoff-consumed',
  'persistent-state-source-contract',
  'transaction-log-state-read',
  'package-state-read',
  'settings-state-read',
  'mod-lock-state-read',
  'live-registry-identity-read',
  'save-cache-isolation-read',
  'startup-failure-reporting',
  'launcher-gameapp-gate'
].map(id => stage(
  id as ThirdPartyDataPackStartupGatePersistentStateStageId,
  status,
  [],
  reason
)))

const createEffectSummary = (
  prepared: boolean
): ThirdPartyDataPackStartupGatePersistentStateEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  launcherAppMounted: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  electronIpcExposed: false,
  electronIpcResponseSent: false,
  webFilePickerOpened: false,
  webUiBridgeOpened: false,
  webUiResponsePublished: false,
  androidFilePickerOpened: false,
  androidUiBridgeOpened: false,
  androidUiResponsePublished: false,
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
  saveRead: false,
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
  startupGateHandoffConsumed: prepared,
  persistentStateSourcePrepared: prepared
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
  status: ThirdPartyDataPackStartupGatePersistentStatePreflightStatus,
  reason: string,
  source: ThirdPartyDataPackStartupGateHandoffPreflightResult,
  checks: readonly ThirdPartyDataPackStartupGatePersistentStatePreflightCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  persistentStateStages: readonly ThirdPartyDataPackStartupGatePersistentStateStage[],
  includeRequirements: boolean
): ThirdPartyDataPackStartupGatePersistentStatePreflightResult => {
  const selectedPackageIds = clonePackageIds(source.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(source.blockedPackageIds)
  const loadOrder = clonePackageIds(source.loadOrder)
  const prepared = status === 'deferred'
    && checks.every(currentCheck => currentCheck.status === 'satisfied')

  return deepFreezeObjectGraph({
    status,
    startupGateHandoffPreflightStatus: source.status,
    reason,
    startupGatePersistentStatePreflight: status,
    readOnly: true,
    startupGateHandoffConsumed: prepared,
    persistentStateSourcePrepared: prepared,
    persistentStartupReadAllowed: false,
    transactionLogReadAllowed: false,
    packageStateReadAllowed: false,
    settingsReadAllowed: false,
    lockfileReadAllowed: false,
    liveRegistryReadAllowed: false,
    saveReadAllowed: false,
    saveCacheIsolationCheckAllowed: false,
    startupFailureReportingAllowed: false,
    launcherAppAllowed: false,
    gameAppCreationAllowed: false,
    piniaCreationAllowed: false,
    routerMountAllowed: false,
    uiIpcResponseDeliveryAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: readThirdPartyDataPackEnabledRuntimeCommandId(source.requestedCommandId),
    targetPackageId: source.targetPackageId,
    envelopeKind: source.envelopeKind,
    messageKey: source.messageKey,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: source.blockedCandidateCount,
    loadOrder,
    registryCount: source.registryCount,
    entryCount: source.entryCount,
    packageCount: source.packageCount,
    candidateIdentity: cloneCandidateIdentity(source.candidateIdentity),
    lockfileHash: source.lockfileHash,
    checks,
    diagnostics,
    persistentStateStages,
    persistentStateRequirements: includeRequirements ? persistentStateRequirements() : Object.freeze([]),
    summary: cloneSummary(source.summary, source),
    effects: createEffectSummary(prepared)
  })
}

export const buildThirdPartyDataPackStartupGatePersistentStatePreflight = (
  options: BuildThirdPartyDataPackStartupGatePersistentStatePreflightOptions
): ThirdPartyDataPackStartupGatePersistentStatePreflightResult => {
  const source = options.startupGateHandoffPreflight

  if (source.status === 'skipped') {
    return baseResult(
      'skipped',
      source.reason,
      source,
      skippedChecks(source.reason),
      [],
      terminalStages('skipped', source.reason),
      false
    )
  }

  if (source.status === 'blocked') {
    return baseResult(
      'blocked',
      source.reason,
      source,
      skippedChecks(source.reason),
      safeDiagnostics(source.diagnostics),
      terminalStages('blocked', source.reason),
      false
    )
  }

  const checks = buildChecks(source)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, source.targetPackageId)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'startup gate persistent state preflight inputs are inconsistent',
      source,
      checks,
      [
        ...safeDiagnostics(source.diagnostics),
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'startup gate persistent state preflight inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'startup gate persistent state sources are prepared as path-free requirements; real startup reads, LauncherApp, GameApp and writes remain separate',
    source,
    checks,
    safeDiagnostics(source.diagnostics),
    deferredStages(),
    true
  )
}
