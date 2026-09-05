import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import {
  THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_KIND,
  THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_MODE,
  type ThirdPartyDataPackLauncherBoundaryPlatform,
  type ThirdPartyDataPackLauncherBoundaryPreflightResult,
  type ThirdPartyDataPackLauncherBoundaryPreflightStatus
} from './thirdPartyDataPackLauncherBoundaryPreflight'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import {
  readThirdPartyDataPackEnabledRuntimeCommandId,
  type ThirdPartyDataPackEnabledRuntimeCommandId
} from './thirdPartyDataPackRuntimeCommandState'

export const THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_KIND =
  'normal-startup-gate-preflight'
export const THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_MODE =
  'readonly-normal-startup-gate-wiring-preflight'

export type ThirdPartyDataPackNormalStartupGatePreflightStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackNormalStartupGateDecision =
  | 'ready-for-launcher-boundary'
  | 'not-required'
  | 'blocked-before-launcher-boundary'

export type ThirdPartyDataPackNormalStartupGatePreflightCheckId =
  | 'launcher-boundary-wrapper'
  | 'launcher-boundary-deferred'
  | 'startup-decision-ready'
  | 'persistent-state-proof-summary-ready'
  | 'package-summary-consistent'
  | 'path-free-launcher-boundary'
  | 'no-normal-startup-runtime-or-write-effects'

export type ThirdPartyDataPackNormalStartupGateStageId =
  | 'launcher-boundary-preflight-consumed'
  | 'normal-startup-gate-preflight'
  | 'launcher-app-startup-wiring'
  | 'game-app-startup-wiring'
  | 'pinia-router-bootstrap'
  | 'save-open-gate'
  | 'ui-ipc-completion-handoff'
  | 'runtime-publication-handoff'

export type ThirdPartyDataPackNormalStartupGateRequirementId =
  | 'normal-startup-gate-contract'
  | 'launcher-boundary-result'
  | 'persistent-state-proof-summary'
  | 'app-bootstrap-boundary'
  | 'pinia-router-bootstrap-boundary'
  | 'save-open-protection'
  | 'path-free-startup-diagnostics'
  | 'no-normal-startup-side-effect-guard'

export interface ThirdPartyDataPackNormalStartupGatePreflightCheck {
  readonly id: ThirdPartyDataPackNormalStartupGatePreflightCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackNormalStartupGateStage {
  readonly id: ThirdPartyDataPackNormalStartupGateStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackNormalStartupGateRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackNormalStartupGateRequirement {
  readonly id: ThirdPartyDataPackNormalStartupGateRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackNormalStartupGatePersistentStateProofs {
  readonly transactionLogCommitted: boolean
  readonly packageStateMatched: boolean
  readonly settingsStateMatched: boolean
  readonly modLockStateMatched: boolean
  readonly liveRegistryMatched: boolean
  readonly saveCacheIsolated: boolean
}

export interface ThirdPartyDataPackNormalStartupGatePreflightEffectSummary {
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
  readonly launcherBoundaryPreflightConsumed: boolean
  readonly normalStartupGatePreflightPrepared: boolean
}

export interface ThirdPartyDataPackNormalStartupGatePreflightResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_MODE
  readonly platform: ThirdPartyDataPackLauncherBoundaryPlatform
  readonly status: ThirdPartyDataPackNormalStartupGatePreflightStatus
  readonly launcherBoundaryPreflightStatus: ThirdPartyDataPackLauncherBoundaryPreflightStatus
  readonly startupGateDecision: ThirdPartyDataPackNormalStartupGateDecision
  readonly reason: string
  readonly normalStartupGatePreflight: ThirdPartyDataPackNormalStartupGatePreflightStatus
  readonly readOnly: true
  readonly launcherBoundaryPreflightConsumed: boolean
  readonly normalStartupGatePreflightPrepared: boolean
  readonly normalStartupGateAllowed: false
  readonly launcherBoundaryAllowed: false
  readonly launcherAppAllowed: false
  readonly launcherAppCreationAllowed: false
  readonly gameAppCreationAllowed: false
  readonly piniaCreationAllowed: false
  readonly routerMountAllowed: false
  readonly saveReadAllowed: false
  readonly uiIpcResponseDeliveryAllowed: false
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly writeAllowed: false
  readonly rollbackRecoveryAllowed: false
  readonly requestedCommandId?: ThirdPartyDataPackEnabledRuntimeCommandId
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly messageKey?: string
  readonly recovery?: ModDiagnosticRecovery
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly persistentStateProofs?: ThirdPartyDataPackNormalStartupGatePersistentStateProofs
  readonly checks: readonly ThirdPartyDataPackNormalStartupGatePreflightCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly normalStartupStages: readonly ThirdPartyDataPackNormalStartupGateStage[]
  readonly normalStartupRequirements: readonly ThirdPartyDataPackNormalStartupGateRequirement[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackNormalStartupGatePreflightEffectSummary
}

export interface BuildThirdPartyDataPackNormalStartupGatePreflightOptions {
  readonly launcherBoundaryPreflight: ThirdPartyDataPackLauncherBoundaryPreflightResult
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

const forbiddenLauncherBoundaryFields = [
  'startupDecisionEnvelope',
  'sourceAdapterExecution',
  'adapterResult',
  'startupStateSnapshot',
  'electronHost',
  'programDirectoryPath',
  'webSourceHost',
  'indexedDb',
  'indexedDbStore',
  'androidHost',
  'appDataBridge',
  'androidNativeBridge',
  'androidPrivatePath',
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'normalStartupGate',
  'gameRouter'
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
  value: object | undefined,
  fieldName: string
): unknown => {
  if (value === undefined) return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object | undefined,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnBooleanField = (
  value: object | undefined,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readOwnNumberField = (
  value: object | undefined,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

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

const safeRecovery = (value: unknown): ModDiagnosticRecovery =>
  diagnosticRecoveries.has(value as ModDiagnosticRecovery) ? value as ModDiagnosticRecovery : 'none'

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
      ?? 'third-party.normal-startup-gate-preflight.diagnostic-copy',
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

const check = (
  id: ThirdPartyDataPackNormalStartupGatePreflightCheckId,
  status: ThirdPartyDataPackNormalStartupGatePreflightCheck['status'],
  reason: string
): ThirdPartyDataPackNormalStartupGatePreflightCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackNormalStartupGatePreflightCheck[] => Object.freeze([
  'launcher-boundary-wrapper',
  'launcher-boundary-deferred',
  'startup-decision-ready',
  'persistent-state-proof-summary-ready',
  'package-summary-consistent',
  'path-free-launcher-boundary',
  'no-normal-startup-runtime-or-write-effects'
].map(id => check(id as ThirdPartyDataPackNormalStartupGatePreflightCheckId, 'skipped', reason)))

const persistentProofs = (
  launcherBoundaryPreflight: ThirdPartyDataPackLauncherBoundaryPreflightResult
): ThirdPartyDataPackNormalStartupGatePersistentStateProofs | undefined => {
  const proofs = readOwnDataField(launcherBoundaryPreflight, 'persistentStateProofs')
  if (proofs === undefined || proofs === null || typeof proofs !== 'object') return undefined
  return Object.freeze({
    transactionLogCommitted: readOwnBooleanField(proofs, 'transactionLogCommitted') === true,
    packageStateMatched: readOwnBooleanField(proofs, 'packageStateMatched') === true,
    settingsStateMatched: readOwnBooleanField(proofs, 'settingsStateMatched') === true,
    modLockStateMatched: readOwnBooleanField(proofs, 'modLockStateMatched') === true,
    liveRegistryMatched: readOwnBooleanField(proofs, 'liveRegistryMatched') === true,
    saveCacheIsolated: readOwnBooleanField(proofs, 'saveCacheIsolated') === true
  })
}

const proofsReady = (
  proofs: ThirdPartyDataPackNormalStartupGatePersistentStateProofs | undefined
): boolean => proofs !== undefined
  && Object.values(proofs).every(value => value === true)

const packageSummaryConsistent = (
  source: ThirdPartyDataPackLauncherBoundaryPreflightResult
): boolean => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const targetPackageId = readOwnStringField(source, 'targetPackageId')
  const blockedCandidateCount = readOwnNumberField(source, 'blockedCandidateCount')
  const registryCount = readOwnNumberField(source, 'registryCount')
  const entryCount = readOwnNumberField(source, 'entryCount')
  const packageCount = readOwnNumberField(source, 'packageCount')

  return blockedCandidateCount !== undefined
    && registryCount !== undefined
    && entryCount !== undefined
    && packageCount !== undefined
    && registryCount >= 54
    && entryCount >= 4242
    && packageCount >= selectedPackageIds.length
    && loadOrder.length === selectedPackageIds.length
    && (targetPackageId === undefined || selectedPackageIds.includes(targetPackageId as PackageId))
}

const pathFreeLauncherBoundary = (
  source: ThirdPartyDataPackLauncherBoundaryPreflightResult
): boolean => forbiddenLauncherBoundaryFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const allOwnBooleanFlagsFalse = (
  value: object | undefined,
  allowedTrueKeys: readonly string[] = []
): boolean => {
  if (value === undefined) return false
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

const noNormalStartupRuntimeOrWriteEffects = (
  source: ThirdPartyDataPackLauncherBoundaryPreflightResult
): boolean => readOwnBooleanField(source, 'launcherBoundaryAllowed') === false
  && readOwnBooleanField(source, 'launcherAppAllowed') === false
  && readOwnBooleanField(source, 'launcherAppCreationAllowed') === false
  && readOwnBooleanField(source, 'gameAppCreationAllowed') === false
  && readOwnBooleanField(source, 'piniaCreationAllowed') === false
  && readOwnBooleanField(source, 'routerMountAllowed') === false
  && readOwnBooleanField(source, 'saveReadAllowed') === false
  && readOwnBooleanField(source, 'uiIpcResponseDeliveryAllowed') === false
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'rollbackRecoveryAllowed') === false
  && allOwnBooleanFlagsFalse(
    readOwnDataField(source, 'effects') as object | undefined,
    [
      'startupDecisionEnvelopeConsumed',
      'launcherBoundaryPreflightPrepared'
    ]
  )

const buildChecks = (
  source: ThirdPartyDataPackLauncherBoundaryPreflightResult,
  proofs: ThirdPartyDataPackNormalStartupGatePersistentStateProofs | undefined
): readonly ThirdPartyDataPackNormalStartupGatePreflightCheck[] => Object.freeze([
  check(
    'launcher-boundary-wrapper',
    readOwnStringField(source, 'kind') === THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_KIND
      && readOwnStringField(source, 'mode') === THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_MODE
      && (
        readOwnStringField(source, 'platform') === 'electron'
        || readOwnStringField(source, 'platform') === 'web'
        || readOwnStringField(source, 'platform') === 'android'
      )
      ? 'satisfied'
      : 'blocked',
    'Normal startup gate preflight must consume the narrow cross-platform Launcher boundary preflight wrapper.'
  ),
  check(
    'launcher-boundary-deferred',
    readOwnStringField(source, 'status') === 'deferred'
      && readOwnStringField(source, 'launcherBoundaryPreflight') === 'deferred'
      ? 'satisfied'
      : 'blocked',
    'Launcher boundary preflight must still be deferred before normal startup wiring is described.'
  ),
  check(
    'startup-decision-ready',
    readOwnStringField(source, 'startupGateDecision') === 'ready-for-launcher-boundary'
      ? 'satisfied'
      : 'blocked',
    'Normal startup gate may only be planned from an explicit ready startup decision.'
  ),
  check(
    'persistent-state-proof-summary-ready',
    proofsReady(proofs) ? 'satisfied' : 'blocked',
    'Normal startup gate needs summarized transaction log, package, settings, mod-lock, live registry and save/cache isolation proofs.'
  ),
  check(
    'package-summary-consistent',
    packageSummaryConsistent(source) ? 'satisfied' : 'blocked',
    'Normal startup gate preflight needs consistent package counts, target package and load-order summaries.'
  ),
  check(
    'path-free-launcher-boundary',
    pathFreeLauncherBoundary(source) ? 'satisfied' : 'blocked',
    'Normal startup gate preflight cannot carry startup envelopes, source adapters, hosts, paths, app instances, Pinia or router objects.'
  ),
  check(
    'no-normal-startup-runtime-or-write-effects',
    noNormalStartupRuntimeOrWriteEffects(source) ? 'satisfied' : 'blocked',
    'Normal startup gate preflight must not inherit LauncherApp, GameApp, Pinia, router, UI/IPC, command, transaction, runtime, rollback or write effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackNormalStartupGatePreflightCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.normal-startup-gate-preflight.checks.${currentCheck.id}`,
    packageId
  )))

const requirement = (
  id: ThirdPartyDataPackNormalStartupGateRequirementId,
  reason: string
): ThirdPartyDataPackNormalStartupGateRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const normalStartupRequirements = (): readonly ThirdPartyDataPackNormalStartupGateRequirement[] => Object.freeze([
  requirement(
    'normal-startup-gate-contract',
    'Normal startup wiring must consume a path-free Launcher boundary result before creating any app runtime object.'
  ),
  requirement(
    'launcher-boundary-result',
    'LauncherApp and GameApp startup must only proceed from an explicit deferred/blocked/skipped launcher boundary preflight.'
  ),
  requirement(
    'persistent-state-proof-summary',
    'Startup wiring must use summarized persistent-state proofs instead of raw package, settings, lockfile or transaction-log reads.'
  ),
  requirement(
    'app-bootstrap-boundary',
    'LauncherApp and GameApp creation remain an application wiring concern and are not performed by this domain preflight.'
  ),
  requirement(
    'pinia-router-bootstrap-boundary',
    'Pinia creation and router mounting remain deferred until the normal startup gate is accepted.'
  ),
  requirement(
    'save-open-protection',
    'Opening saves remains deferred until live registry identity and save/cache isolation proofs are accepted by startup wiring.'
  ),
  requirement(
    'path-free-startup-diagnostics',
    'Startup-visible diagnostics must stay redacted and avoid source adapter internals, host paths and private package contents.'
  ),
  requirement(
    'no-normal-startup-side-effect-guard',
    'This preflight must not mount UI, create apps, read saves or write package, lockfile, settings, save, cache, transaction or diagnostic data.'
  )
])

const stage = (
  id: ThirdPartyDataPackNormalStartupGateStageId,
  status: ThirdPartyDataPackNormalStartupGateStage['status'],
  requirementIds: readonly ThirdPartyDataPackNormalStartupGateRequirementId[],
  reason: string
): ThirdPartyDataPackNormalStartupGateStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackNormalStartupGateStage[] => Object.freeze([
  stage(
    'launcher-boundary-preflight-consumed',
    'satisfied',
    ['launcher-boundary-result', 'path-free-startup-diagnostics'],
    'Launcher boundary preflight is consistent enough to describe normal startup gate requirements.'
  ),
  stage(
    'normal-startup-gate-preflight',
    'satisfied',
    ['normal-startup-gate-contract', 'no-normal-startup-side-effect-guard'],
    'Normal startup inputs were inspected without creating LauncherApp, GameApp, Pinia or router.'
  ),
  stage(
    'launcher-app-startup-wiring',
    'deferred',
    ['app-bootstrap-boundary'],
    'LauncherApp creation remains deferred to a later application startup wiring slice.'
  ),
  stage(
    'game-app-startup-wiring',
    'deferred',
    ['app-bootstrap-boundary'],
    'GameApp creation remains deferred behind the normal startup gate.'
  ),
  stage(
    'pinia-router-bootstrap',
    'deferred',
    ['pinia-router-bootstrap-boundary'],
    'Pinia creation and router mounting remain deferred.'
  ),
  stage(
    'save-open-gate',
    'deferred',
    ['save-open-protection', 'persistent-state-proof-summary'],
    'Save reads remain deferred until startup wiring accepts the live registry and save/cache isolation proof.'
  ),
  stage(
    'ui-ipc-completion-handoff',
    'deferred',
    ['path-free-startup-diagnostics'],
    'Final UI/IPC completion handoff remains a later platform wiring boundary.'
  ),
  stage(
    'runtime-publication-handoff',
    'deferred',
    ['normal-startup-gate-contract'],
    'Runtime registry publication handoff remains deferred.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackNormalStartupGateStage[] => Object.freeze([
  'launcher-boundary-preflight-consumed',
  'normal-startup-gate-preflight',
  'launcher-app-startup-wiring',
  'game-app-startup-wiring',
  'pinia-router-bootstrap',
  'save-open-gate',
  'ui-ipc-completion-handoff',
  'runtime-publication-handoff'
].map(id => stage(id as ThirdPartyDataPackNormalStartupGateStageId, status, [], reason)))

const createEffectSummary = (
  prepared: boolean
): ThirdPartyDataPackNormalStartupGatePreflightEffectSummary => ({
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
  launcherBoundaryPreflightConsumed: prepared,
  normalStartupGatePreflightPrepared: prepared
})

const emptySummary = (): ThirdPartyDataPackUiIpcResultEnvelopeSummary => Object.freeze({
  selectedPackageCount: 0,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 0,
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  diagnosticCount: 0
})

const cloneSummary = (
  value: unknown,
  diagnosticCount: number
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => {
  if (value === undefined || value === null || typeof value !== 'object') {
    return Object.freeze({
      ...emptySummary(),
      diagnosticCount
    })
  }
  return Object.freeze({
    selectedPackageCount: readOwnNumberField(value, 'selectedPackageCount') ?? 0,
    blockedPackageCount: readOwnNumberField(value, 'blockedPackageCount') ?? 0,
    blockedCandidateCount: readOwnNumberField(value, 'blockedCandidateCount') ?? 0,
    loadOrderCount: readOwnNumberField(value, 'loadOrderCount') ?? 0,
    registryCount: readOwnNumberField(value, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(value, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(value, 'packageCount') ?? 0,
    diagnosticCount
  })
}

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
  status: ThirdPartyDataPackNormalStartupGatePreflightStatus,
  reason: string,
  source: ThirdPartyDataPackLauncherBoundaryPreflightResult,
  checks: readonly ThirdPartyDataPackNormalStartupGatePreflightCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  normalStartupStages: readonly ThirdPartyDataPackNormalStartupGateStage[],
  includeRequirements: boolean,
  proofs: ThirdPartyDataPackNormalStartupGatePersistentStateProofs | undefined
): ThirdPartyDataPackNormalStartupGatePreflightResult => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const prepared = status === 'deferred'
    && checks.every(currentCheck => currentCheck.status === 'satisfied')

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_KIND,
    mode: THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_GATE_PREFLIGHT_MODE,
    platform: readOwnStringField(source, 'platform') as ThirdPartyDataPackLauncherBoundaryPlatform,
    status,
    launcherBoundaryPreflightStatus: readOwnStringField(source, 'status') as ThirdPartyDataPackLauncherBoundaryPreflightStatus,
    startupGateDecision: readOwnStringField(source, 'startupGateDecision') as ThirdPartyDataPackNormalStartupGateDecision,
    reason,
    normalStartupGatePreflight: status,
    readOnly: true,
    launcherBoundaryPreflightConsumed: prepared,
    normalStartupGatePreflightPrepared: prepared,
    normalStartupGateAllowed: false,
    launcherBoundaryAllowed: false,
    launcherAppAllowed: false,
    launcherAppCreationAllowed: false,
    gameAppCreationAllowed: false,
    piniaCreationAllowed: false,
    routerMountAllowed: false,
    saveReadAllowed: false,
    uiIpcResponseDeliveryAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: readThirdPartyDataPackEnabledRuntimeCommandId(
      readOwnStringField(source, 'requestedCommandId')
    ),
    targetPackageId: readOwnStringField(source, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(source, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(source, 'packageCount') ?? selectedPackageIds.length,
    candidateHash: readOwnStringField(source, 'candidateHash') as Sha256Hash | undefined,
    lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash | undefined,
    messageKey: readOwnStringField(source, 'messageKey'),
    recovery: safeRecovery(readOwnStringField(source, 'recovery')),
    retryable: readOwnBooleanField(source, 'retryable') === true,
    rollbackRequired: readOwnBooleanField(source, 'rollbackRequired') === true,
    ...(proofs === undefined ? {} : { persistentStateProofs: proofs }),
    checks,
    diagnostics,
    normalStartupStages,
    normalStartupRequirements: includeRequirements ? normalStartupRequirements() : Object.freeze([]),
    summary: cloneSummary(readOwnDataField(source, 'summary'), diagnostics.length),
    effects: createEffectSummary(prepared)
  })
}

export const buildThirdPartyDataPackNormalStartupGatePreflight = (
  options: BuildThirdPartyDataPackNormalStartupGatePreflightOptions
): ThirdPartyDataPackNormalStartupGatePreflightResult => {
  const source = options.launcherBoundaryPreflight

  if (readOwnStringField(source, 'status') === 'skipped') {
    const reason = readOwnStringField(source, 'reason')
      ?? 'normal startup gate preflight is not required because launcher boundary was skipped'
    return baseResult(
      'skipped',
      reason,
      source,
      skippedChecks(reason),
      safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined),
      terminalStages('skipped', reason),
      false,
      undefined
    )
  }

  if (readOwnStringField(source, 'status') === 'blocked') {
    const reason = readOwnStringField(source, 'reason')
      ?? 'normal startup gate preflight is blocked by launcher boundary preflight'
    return baseResult(
      'blocked',
      reason,
      source,
      skippedChecks(reason),
      safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined),
      terminalStages('blocked', reason),
      false,
      persistentProofs(source)
    )
  }

  const proofs = persistentProofs(source)
  const checks = buildChecks(source, proofs)
  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  const blockedDiagnostics = diagnosticsForBlockedChecks(
    checks,
    readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  )
  const diagnostics = Object.freeze([
    ...sourceDiagnostics,
    ...blockedDiagnostics
  ])

  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'normal startup gate preflight inputs are inconsistent',
      source,
      checks,
      diagnostics,
      terminalStages('blocked', 'normal startup gate preflight inputs are inconsistent'),
      false,
      proofs
    )
  }

  return baseResult(
    'deferred',
    'normal startup gate preflight is prepared; real LauncherApp, GameApp, Pinia, router, save reads, UI/IPC delivery, runtime publication and writes remain deferred',
    source,
    checks,
    diagnostics,
    deferredStages(),
    true,
    proofs
  )
}
