import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackElectronStartupGateDecision,
  ThirdPartyDataPackElectronStartupGateDecisionEnvelope,
  ThirdPartyDataPackElectronStartupGateDecisionEnvelopeStatus,
  ThirdPartyDataPackElectronStartupGatePersistentStateProofs
} from './thirdPartyDataPackElectronStartupGateDecisionEnvelope'
import type {
  ThirdPartyDataPackWebStartupGateDecisionEnvelope
} from './thirdPartyDataPackWebStartupGateDecisionEnvelope'
import type {
  ThirdPartyDataPackAndroidStartupGateDecisionEnvelope
} from './thirdPartyDataPackAndroidStartupGateDecisionEnvelope'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import {
  readThirdPartyDataPackEnabledRuntimeCommandId,
  type ThirdPartyDataPackEnabledRuntimeCommandId
} from './thirdPartyDataPackRuntimeCommandState'

export const THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_KIND =
  'launcher-boundary-preflight'
export const THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_MODE =
  'readonly-launcher-app-boundary-preflight'

export type ThirdPartyDataPackLauncherBoundaryPreflightStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackLauncherBoundaryPlatform =
  | 'electron'
  | 'web'
  | 'android'

export type ThirdPartyDataPackLauncherBoundaryStartupGateDecisionEnvelope =
  | ThirdPartyDataPackElectronStartupGateDecisionEnvelope
  | ThirdPartyDataPackWebStartupGateDecisionEnvelope
  | ThirdPartyDataPackAndroidStartupGateDecisionEnvelope

export type ThirdPartyDataPackLauncherBoundaryPreflightCheckId =
  | 'startup-decision-envelope-ready'
  | 'launcher-decision-ready'
  | 'persistent-state-proof-summary-ready'
  | 'package-summary-consistent'
  | 'path-free-decision-envelope'
  | 'no-launcher-runtime-or-write-effects'

export type ThirdPartyDataPackLauncherBoundaryStageId =
  | 'startup-decision-envelope-consumed'
  | 'launcher-boundary-preflight'
  | 'launcher-app-creation'
  | 'game-app-creation'
  | 'pinia-router-mount'
  | 'save-open-protection'
  | 'ui-ipc-final-result-delivery'
  | 'runtime-publication-commit'

export type ThirdPartyDataPackLauncherBoundaryRequirementId =
  | 'launcher-boundary-contract'
  | 'explicit-startup-decision'
  | 'persistent-state-proof-summary'
  | 'game-app-creation-gate'
  | 'pinia-router-boundary'
  | 'save-open-protection'
  | 'path-free-launcher-diagnostics'
  | 'no-launcher-side-effect-guard'

export interface ThirdPartyDataPackLauncherBoundaryPreflightCheck {
  readonly id: ThirdPartyDataPackLauncherBoundaryPreflightCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackLauncherBoundaryStage {
  readonly id: ThirdPartyDataPackLauncherBoundaryStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackLauncherBoundaryRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackLauncherBoundaryRequirement {
  readonly id: ThirdPartyDataPackLauncherBoundaryRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackLauncherBoundaryPreflightEffectSummary {
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
  readonly startupDecisionEnvelopeConsumed: boolean
  readonly launcherBoundaryPreflightPrepared: boolean
}

export interface ThirdPartyDataPackLauncherBoundaryPreflightResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_MODE
  readonly platform: ThirdPartyDataPackLauncherBoundaryPlatform
  readonly status: ThirdPartyDataPackLauncherBoundaryPreflightStatus
  readonly startupDecisionEnvelopeStatus: ThirdPartyDataPackElectronStartupGateDecisionEnvelopeStatus
  readonly startupGateDecision: ThirdPartyDataPackElectronStartupGateDecision
  readonly reason: string
  readonly launcherBoundaryPreflight: ThirdPartyDataPackLauncherBoundaryPreflightStatus
  readonly readOnly: true
  readonly startupDecisionEnvelopeConsumed: boolean
  readonly launcherBoundaryPreflightPrepared: boolean
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
  readonly persistentStateProofs?: ThirdPartyDataPackElectronStartupGatePersistentStateProofs
  readonly checks: readonly ThirdPartyDataPackLauncherBoundaryPreflightCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly launcherStages: readonly ThirdPartyDataPackLauncherBoundaryStage[]
  readonly launcherRequirements: readonly ThirdPartyDataPackLauncherBoundaryRequirement[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackLauncherBoundaryPreflightEffectSummary
}

export interface BuildThirdPartyDataPackLauncherBoundaryPreflightOptions {
  readonly startupDecisionEnvelope: ThirdPartyDataPackLauncherBoundaryStartupGateDecisionEnvelope
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

const forbiddenEnvelopeFields = [
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
  'router'
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
      ?? 'third-party.launcher-boundary-preflight.diagnostic-copy',
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
  id: ThirdPartyDataPackLauncherBoundaryPreflightCheckId,
  status: ThirdPartyDataPackLauncherBoundaryPreflightCheck['status'],
  reason: string
): ThirdPartyDataPackLauncherBoundaryPreflightCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackLauncherBoundaryPreflightCheck[] => Object.freeze([
  'startup-decision-envelope-ready',
  'launcher-decision-ready',
  'persistent-state-proof-summary-ready',
  'package-summary-consistent',
  'path-free-decision-envelope',
  'no-launcher-runtime-or-write-effects'
].map(id => check(id as ThirdPartyDataPackLauncherBoundaryPreflightCheckId, 'skipped', reason)))

const persistentProofs = (
  envelope: ThirdPartyDataPackLauncherBoundaryStartupGateDecisionEnvelope
): ThirdPartyDataPackElectronStartupGatePersistentStateProofs | undefined => {
  const proofs = readOwnDataField(envelope, 'persistentStateProofs')
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
  proofs: ThirdPartyDataPackElectronStartupGatePersistentStateProofs | undefined
): boolean => proofs !== undefined
  && Object.values(proofs).every(value => value === true)

const packageSummaryConsistent = (
  envelope: ThirdPartyDataPackLauncherBoundaryStartupGateDecisionEnvelope
): boolean => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(envelope, 'selectedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(envelope, 'loadOrder'))
  const targetPackageId = readOwnStringField(envelope, 'targetPackageId')
  const blockedCandidateCount = readOwnNumberField(envelope, 'blockedCandidateCount')
  const registryCount = readOwnNumberField(envelope, 'registryCount')
  const entryCount = readOwnNumberField(envelope, 'entryCount')
  const packageCount = readOwnNumberField(envelope, 'packageCount')

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

const pathFreeDecisionEnvelope = (
  envelope: ThirdPartyDataPackLauncherBoundaryStartupGateDecisionEnvelope
): boolean => forbiddenEnvelopeFields.every(fieldName => !hasOwnEnumerableField(envelope, fieldName))

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

const noLauncherRuntimeOrWriteEffects = (
  envelope: ThirdPartyDataPackLauncherBoundaryStartupGateDecisionEnvelope
): boolean => readOwnBooleanField(envelope, 'launcherAppAllowed') === false
  && readOwnBooleanField(envelope, 'gameAppCreationAllowed') === false
  && readOwnBooleanField(envelope, 'piniaCreationAllowed') === false
  && readOwnBooleanField(envelope, 'routerMountAllowed') === false
  && readOwnBooleanField(envelope, 'saveReadAllowed') === false
  && readOwnBooleanField(envelope, 'uiIpcResponseDeliveryAllowed') === false
  && readOwnBooleanField(envelope, 'commandDispatchAllowed') === false
  && readOwnBooleanField(envelope, 'transactionCommitAllowed') === false
  && readOwnBooleanField(envelope, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(envelope, 'writeAllowed') === false
  && readOwnBooleanField(envelope, 'rollbackRecoveryAllowed') === false
  && allOwnBooleanFlagsFalse(
    readOwnDataField(envelope, 'effects') as object | undefined,
    [
      'electronStartupGateExecutionConsumed',
      'webStartupGateExecutionConsumed',
      'androidStartupGateExecutionConsumed',
      'startupDecisionEnvelopeBuilt'
    ]
  )

const buildChecks = (
  envelope: ThirdPartyDataPackLauncherBoundaryStartupGateDecisionEnvelope,
  proofs: ThirdPartyDataPackElectronStartupGatePersistentStateProofs | undefined
): readonly ThirdPartyDataPackLauncherBoundaryPreflightCheck[] => Object.freeze([
  check(
    'startup-decision-envelope-ready',
    readOwnStringField(envelope, 'status') === 'ready' ? 'satisfied' : 'blocked',
    'Launcher boundary preflight must consume a ready startup gate decision envelope.'
  ),
  check(
    'launcher-decision-ready',
    readOwnStringField(envelope, 'startupGateDecision') === 'ready-for-launcher-boundary'
      ? 'satisfied'
      : 'blocked',
    'The startup decision must explicitly be ready for the later LauncherApp/GameApp boundary.'
  ),
  check(
    'persistent-state-proof-summary-ready',
    proofsReady(proofs) ? 'satisfied' : 'blocked',
    'Persistent package, settings, mod-lock, transaction log, live registry and save/cache isolation proofs must be present.'
  ),
  check(
    'package-summary-consistent',
    packageSummaryConsistent(envelope) ? 'satisfied' : 'blocked',
    'Launcher boundary preflight needs only consistent package counts, target package and load-order summaries.'
  ),
  check(
    'path-free-decision-envelope',
    pathFreeDecisionEnvelope(envelope) ? 'satisfied' : 'blocked',
    'Launcher boundary preflight cannot carry source adapters, snapshots, hosts, paths, app instances, Pinia or router objects.'
  ),
  check(
    'no-launcher-runtime-or-write-effects',
    noLauncherRuntimeOrWriteEffects(envelope) ? 'satisfied' : 'blocked',
    'Launcher boundary preflight must not inherit LauncherApp, GameApp, Pinia, router, UI/IPC, command, transaction, runtime, rollback or write effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackLauncherBoundaryPreflightCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.launcher-boundary-preflight.checks.${currentCheck.id}`,
    packageId
  )))

const requirement = (
  id: ThirdPartyDataPackLauncherBoundaryRequirementId,
  reason: string
): ThirdPartyDataPackLauncherBoundaryRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const launcherRequirements = (): readonly ThirdPartyDataPackLauncherBoundaryRequirement[] => Object.freeze([
  requirement(
    'launcher-boundary-contract',
    'The startup gate must hand a path-free decision to LauncherApp without creating LauncherApp in domain code.'
  ),
  requirement(
    'explicit-startup-decision',
    'Launcher startup wiring may proceed only from an explicit ready/skipped/blocked startup decision envelope.'
  ),
  requirement(
    'persistent-state-proof-summary',
    'Launcher startup must rely on summarized persistent-state proofs rather than raw package, settings or lockfile reads.'
  ),
  requirement(
    'game-app-creation-gate',
    'GameApp creation must remain behind a single startup decision boundary.'
  ),
  requirement(
    'pinia-router-boundary',
    'Pinia and router creation remain a later application wiring concern, not a pure domain preflight effect.'
  ),
  requirement(
    'save-open-protection',
    'Opening saves remains deferred until live registry identity and save/cache isolation are accepted by startup wiring.'
  ),
  requirement(
    'path-free-launcher-diagnostics',
    'Launcher-visible diagnostics must stay redacted and avoid source adapter internals, host paths and private package contents.'
  ),
  requirement(
    'no-launcher-side-effect-guard',
    'This preflight must not mount UI, create apps, read saves or write package, lockfile, settings, save, cache, transaction or diagnostic data.'
  )
])

const stage = (
  id: ThirdPartyDataPackLauncherBoundaryStageId,
  status: ThirdPartyDataPackLauncherBoundaryStage['status'],
  requirementIds: readonly ThirdPartyDataPackLauncherBoundaryRequirementId[],
  reason: string
): ThirdPartyDataPackLauncherBoundaryStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackLauncherBoundaryStage[] => Object.freeze([
  stage(
    'startup-decision-envelope-consumed',
    'satisfied',
    ['explicit-startup-decision', 'path-free-launcher-diagnostics'],
    'The startup gate decision envelope is consistent enough to describe launcher boundary requirements.'
  ),
  stage(
    'launcher-boundary-preflight',
    'satisfied',
    ['launcher-boundary-contract', 'no-launcher-side-effect-guard'],
    'Launcher boundary inputs were inspected without creating LauncherApp, GameApp, Pinia or router.'
  ),
  stage(
    'launcher-app-creation',
    'deferred',
    ['launcher-boundary-contract'],
    'LauncherApp creation remains deferred to the application startup wiring slice.'
  ),
  stage(
    'game-app-creation',
    'deferred',
    ['game-app-creation-gate'],
    'GameApp creation remains deferred behind the future startup gate.'
  ),
  stage(
    'pinia-router-mount',
    'deferred',
    ['pinia-router-boundary'],
    'Pinia creation and router mounting remain deferred.'
  ),
  stage(
    'save-open-protection',
    'deferred',
    ['save-open-protection', 'persistent-state-proof-summary'],
    'Save reads remain deferred until startup wiring accepts the live registry and save/cache isolation proof.'
  ),
  stage(
    'ui-ipc-final-result-delivery',
    'deferred',
    ['path-free-launcher-diagnostics'],
    'Final visible UI/IPC result delivery remains a later platform wiring boundary.'
  ),
  stage(
    'runtime-publication-commit',
    'deferred',
    ['game-app-creation-gate'],
    'Runtime registry publication and commit remain deferred.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackLauncherBoundaryStage[] => Object.freeze([
  'startup-decision-envelope-consumed',
  'launcher-boundary-preflight',
  'launcher-app-creation',
  'game-app-creation',
  'pinia-router-mount',
  'save-open-protection',
  'ui-ipc-final-result-delivery',
  'runtime-publication-commit'
].map(id => stage(id as ThirdPartyDataPackLauncherBoundaryStageId, status, [], reason)))

const createEffectSummary = (
  prepared: boolean
): ThirdPartyDataPackLauncherBoundaryPreflightEffectSummary => ({
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
  startupDecisionEnvelopeConsumed: prepared,
  launcherBoundaryPreflightPrepared: prepared
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
  status: ThirdPartyDataPackLauncherBoundaryPreflightStatus,
  reason: string,
  envelope: ThirdPartyDataPackLauncherBoundaryStartupGateDecisionEnvelope,
  checks: readonly ThirdPartyDataPackLauncherBoundaryPreflightCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  launcherStages: readonly ThirdPartyDataPackLauncherBoundaryStage[],
  includeRequirements: boolean,
  proofs: ThirdPartyDataPackElectronStartupGatePersistentStateProofs | undefined
): ThirdPartyDataPackLauncherBoundaryPreflightResult => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(envelope, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(envelope, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(envelope, 'loadOrder'))
  const prepared = status === 'deferred'
    && checks.every(currentCheck => currentCheck.status === 'satisfied')

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_KIND,
    mode: THIRD_PARTY_DATA_PACK_LAUNCHER_BOUNDARY_PREFLIGHT_MODE,
    platform: readOwnStringField(envelope, 'platform') as ThirdPartyDataPackLauncherBoundaryPlatform,
    status,
    startupDecisionEnvelopeStatus: readOwnStringField(envelope, 'status') as ThirdPartyDataPackElectronStartupGateDecisionEnvelopeStatus,
    startupGateDecision: readOwnStringField(envelope, 'startupGateDecision') as ThirdPartyDataPackElectronStartupGateDecision,
    reason,
    launcherBoundaryPreflight: status,
    readOnly: true,
    startupDecisionEnvelopeConsumed: prepared,
    launcherBoundaryPreflightPrepared: prepared,
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
      readOwnStringField(envelope, 'requestedCommandId')
    ),
    targetPackageId: readOwnStringField(envelope, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(envelope, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(envelope, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(envelope, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(envelope, 'packageCount') ?? selectedPackageIds.length,
    candidateHash: readOwnStringField(envelope, 'candidateHash') as Sha256Hash | undefined,
    lockfileHash: readOwnStringField(envelope, 'lockfileHash') as Sha256Hash | undefined,
    messageKey: readOwnStringField(envelope, 'messageKey'),
    recovery: safeRecovery(readOwnStringField(envelope, 'recovery')),
    retryable: readOwnBooleanField(envelope, 'retryable') === true,
    rollbackRequired: readOwnBooleanField(envelope, 'rollbackRequired') === true,
    ...(proofs === undefined ? {} : { persistentStateProofs: proofs }),
    checks,
    diagnostics,
    launcherStages,
    launcherRequirements: includeRequirements ? launcherRequirements() : Object.freeze([]),
    summary: cloneSummary(readOwnDataField(envelope, 'summary'), diagnostics.length),
    effects: createEffectSummary(prepared)
  })
}

export const buildThirdPartyDataPackLauncherBoundaryPreflight = (
  options: BuildThirdPartyDataPackLauncherBoundaryPreflightOptions
): ThirdPartyDataPackLauncherBoundaryPreflightResult => {
  const envelope = options.startupDecisionEnvelope

  if (readOwnStringField(envelope, 'status') === 'skipped') {
    const reason = readOwnStringField(envelope, 'reason')
      ?? 'launcher boundary preflight is not required because no third-party startup state is pending'
    return baseResult(
      'skipped',
      reason,
      envelope,
      skippedChecks(reason),
      safeDiagnostics(readOwnDataField(envelope, 'diagnostics') as readonly unknown[] | undefined),
      terminalStages('skipped', reason),
      false,
      undefined
    )
  }

  if (readOwnStringField(envelope, 'status') === 'blocked') {
    const reason = readOwnStringField(envelope, 'reason')
      ?? 'launcher boundary preflight is blocked by startup decision envelope'
    return baseResult(
      'blocked',
      reason,
      envelope,
      skippedChecks(reason),
      safeDiagnostics(readOwnDataField(envelope, 'diagnostics') as readonly unknown[] | undefined),
      terminalStages('blocked', reason),
      false,
      persistentProofs(envelope)
    )
  }

  const proofs = persistentProofs(envelope)
  const checks = buildChecks(envelope, proofs)
  const sourceDiagnostics = safeDiagnostics(readOwnDataField(envelope, 'diagnostics') as readonly unknown[] | undefined)
  const blockedDiagnostics = diagnosticsForBlockedChecks(
    checks,
    readOwnStringField(envelope, 'targetPackageId') as PackageId | undefined
  )
  const diagnostics = Object.freeze([
    ...sourceDiagnostics,
    ...blockedDiagnostics
  ])

  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'launcher boundary preflight inputs are inconsistent',
      envelope,
      checks,
      diagnostics,
      terminalStages('blocked', 'launcher boundary preflight inputs are inconsistent'),
      false,
      proofs
    )
  }

  return baseResult(
    'deferred',
    'launcher boundary preflight is prepared; real LauncherApp, GameApp, Pinia, router, save reads, UI/IPC delivery, runtime publication and writes remain deferred',
    envelope,
    checks,
    diagnostics,
    deferredStages(),
    true,
    proofs
  )
}
