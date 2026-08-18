import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyDataPackLauncherBoundaryPlatform } from './thirdPartyDataPackLauncherBoundaryPreflight'
import type {
  ThirdPartyDataPackNormalStartupGateDecision,
  ThirdPartyDataPackNormalStartupGatePersistentStateProofs
} from './thirdPartyDataPackNormalStartupGatePreflight'
import {
  THIRD_PARTY_DATA_PACK_APP_BOOTSTRAP_WIRING_PREFLIGHT_KIND,
  THIRD_PARTY_DATA_PACK_APP_BOOTSTRAP_WIRING_PREFLIGHT_MODE,
  type ThirdPartyDataPackAppBootstrapWiringPreflightResult,
  type ThirdPartyDataPackAppBootstrapWiringPreflightStatus
} from './thirdPartyDataPackAppBootstrapWiringPreflight'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

export const THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_PREFLIGHT_KIND =
  'app-factory-binding-preflight'
export const THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_PREFLIGHT_MODE =
  'readonly-app-factory-binding-preflight'

export type ThirdPartyDataPackAppFactoryBindingPreflightStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackAppFactoryBindingPreflightCheckId =
  | 'app-bootstrap-wiring-wrapper'
  | 'app-bootstrap-wiring-deferred'
  | 'factory-binding-stages-deferred'
  | 'persistent-state-proof-summary-ready'
  | 'package-summary-consistent'
  | 'path-free-app-bootstrap-wiring'
  | 'no-factory-binding-runtime-or-write-effects'

export type ThirdPartyDataPackAppFactoryBindingStageId =
  | 'app-bootstrap-wiring-preflight-consumed'
  | 'app-factory-binding-preflight'
  | 'launcher-app-factory-binding-report'
  | 'game-app-factory-binding-report'
  | 'pinia-store-bootstrap'
  | 'router-bootstrap'
  | 'save-open-sequencing'
  | 'ui-ipc-completion-sequencing'
  | 'runtime-publication-sequencing'

export type ThirdPartyDataPackAppFactoryBindingRequirementId =
  | 'app-factory-binding-contract'
  | 'app-bootstrap-wiring-result'
  | 'persistent-state-proof-summary'
  | 'launcher-app-factory-report'
  | 'game-app-factory-report'
  | 'pinia-bootstrap-boundary'
  | 'router-bootstrap-boundary'
  | 'save-open-protection'
  | 'ui-ipc-completion-boundary'
  | 'runtime-publication-boundary'
  | 'path-free-factory-binding-diagnostics'
  | 'no-factory-binding-side-effect-guard'

export interface ThirdPartyDataPackAppFactoryBindingPreflightCheck {
  readonly id: ThirdPartyDataPackAppFactoryBindingPreflightCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackAppFactoryBindingStage {
  readonly id: ThirdPartyDataPackAppFactoryBindingStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackAppFactoryBindingRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackAppFactoryBindingRequirement {
  readonly id: ThirdPartyDataPackAppFactoryBindingRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackAppFactoryBindingPreflightEffectSummary {
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
  readonly appBootstrapWiringPreflightConsumed: boolean
  readonly appFactoryBindingPreflightPrepared: boolean
  readonly launcherAppFactoryBindingReportPrepared: boolean
  readonly gameAppFactoryBindingReportPrepared: boolean
}

export interface ThirdPartyDataPackAppFactoryBindingPreflightResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_PREFLIGHT_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_PREFLIGHT_MODE
  readonly platform: ThirdPartyDataPackLauncherBoundaryPlatform
  readonly status: ThirdPartyDataPackAppFactoryBindingPreflightStatus
  readonly appBootstrapWiringPreflightStatus: ThirdPartyDataPackAppBootstrapWiringPreflightStatus
  readonly startupGateDecision: ThirdPartyDataPackNormalStartupGateDecision
  readonly reason: string
  readonly appFactoryBindingPreflight: ThirdPartyDataPackAppFactoryBindingPreflightStatus
  readonly readOnly: true
  readonly appBootstrapWiringPreflightConsumed: boolean
  readonly appFactoryBindingPreflightPrepared: boolean
  readonly launcherAppFactoryBindingReportPrepared: boolean
  readonly gameAppFactoryBindingReportPrepared: boolean
  readonly appFactoryBindingAllowed: false
  readonly appBootstrapWiringAllowed: false
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
  readonly requestedCommandId?: 'install'
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
  readonly checks: readonly ThirdPartyDataPackAppFactoryBindingPreflightCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly appFactoryBindingStages: readonly ThirdPartyDataPackAppFactoryBindingStage[]
  readonly appFactoryBindingRequirements: readonly ThirdPartyDataPackAppFactoryBindingRequirement[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackAppFactoryBindingPreflightEffectSummary
}

export interface BuildThirdPartyDataPackAppFactoryBindingPreflightOptions {
  readonly appBootstrapWiringPreflight: ThirdPartyDataPackAppBootstrapWiringPreflightResult
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

const forbiddenAppBootstrapWiringFields = [
  'normalStartupGatePreflight',
  'launcherBoundaryPreflight',
  'startupDecisionEnvelope',
  'sourceAdapterExecution',
  'adapterResult',
  'startupStateSnapshot',
  'electronHost',
  'programDirectoryPath',
  'normalStartupGate',
  'normalStartupGateSource',
  'webSourceHost',
  'indexedDb',
  'indexedDbStore',
  'androidHost',
  'appDataBridge',
  'androidNativeBridge',
  'androidPrivatePath',
  'launcherApp',
  'launcherAppFactory',
  'gameApp',
  'gameAppFactory',
  'pinia',
  'piniaStore',
  'router',
  'routerInstance',
  'gameRouter',
  'app',
  'mount',
  'saveStore',
  'saveOpenGate'
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
      ?? 'third-party.app-factory-binding-preflight.diagnostic-copy',
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
  id: ThirdPartyDataPackAppFactoryBindingPreflightCheckId,
  status: ThirdPartyDataPackAppFactoryBindingPreflightCheck['status'],
  reason: string
): ThirdPartyDataPackAppFactoryBindingPreflightCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackAppFactoryBindingPreflightCheck[] => Object.freeze([
  'app-bootstrap-wiring-wrapper',
  'app-bootstrap-wiring-deferred',
  'factory-binding-stages-deferred',
  'persistent-state-proof-summary-ready',
  'package-summary-consistent',
  'path-free-app-bootstrap-wiring',
  'no-factory-binding-runtime-or-write-effects'
].map(id => check(id as ThirdPartyDataPackAppFactoryBindingPreflightCheckId, 'skipped', reason)))

const persistentProofs = (
  source: ThirdPartyDataPackAppBootstrapWiringPreflightResult
): ThirdPartyDataPackNormalStartupGatePersistentStateProofs | undefined => {
  const proofs = readOwnDataField(source, 'persistentStateProofs')
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
  source: ThirdPartyDataPackAppBootstrapWiringPreflightResult
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

const pathFreeAppBootstrapWiring = (
  source: ThirdPartyDataPackAppBootstrapWiringPreflightResult
): boolean => forbiddenAppBootstrapWiringFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

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

const hasOwnArrayObjectWithFields = (
  values: unknown,
  fields: Readonly<Record<string, string>>
): boolean => {
  if (!Array.isArray(values)) return false
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

const factoryBindingStagesDeferred = (
  source: ThirdPartyDataPackAppBootstrapWiringPreflightResult
): boolean => {
  const stages = readOwnDataField(source, 'appBootstrapStages')
  return hasOwnArrayObjectWithFields(stages, {
    id: 'launcher-app-factory-binding',
    status: 'deferred'
  }) && hasOwnArrayObjectWithFields(stages, {
    id: 'game-app-factory-binding',
    status: 'deferred'
  })
}

const noFactoryBindingRuntimeOrWriteEffects = (
  source: ThirdPartyDataPackAppBootstrapWiringPreflightResult
): boolean => readOwnBooleanField(source, 'appBootstrapWiringAllowed') === false
  && readOwnBooleanField(source, 'normalStartupGateAllowed') === false
  && readOwnBooleanField(source, 'launcherBoundaryAllowed') === false
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
      'normalStartupGatePreflightConsumed',
      'appBootstrapWiringPreflightPrepared'
    ]
  )

const buildChecks = (
  source: ThirdPartyDataPackAppBootstrapWiringPreflightResult,
  proofs: ThirdPartyDataPackNormalStartupGatePersistentStateProofs | undefined
): readonly ThirdPartyDataPackAppFactoryBindingPreflightCheck[] => Object.freeze([
  check(
    'app-bootstrap-wiring-wrapper',
    readOwnStringField(source, 'kind') === THIRD_PARTY_DATA_PACK_APP_BOOTSTRAP_WIRING_PREFLIGHT_KIND
      && readOwnStringField(source, 'mode') === THIRD_PARTY_DATA_PACK_APP_BOOTSTRAP_WIRING_PREFLIGHT_MODE
      && (
        readOwnStringField(source, 'platform') === 'electron'
        || readOwnStringField(source, 'platform') === 'web'
        || readOwnStringField(source, 'platform') === 'android'
      )
      ? 'satisfied'
      : 'blocked',
    'Factory binding preflight must consume the narrow cross-platform app bootstrap wiring preflight wrapper.'
  ),
  check(
    'app-bootstrap-wiring-deferred',
    readOwnStringField(source, 'status') === 'deferred'
      && readOwnStringField(source, 'appBootstrapWiringPreflight') === 'deferred'
      && readOwnBooleanField(source, 'normalStartupGatePreflightConsumed') === true
      && readOwnBooleanField(source, 'appBootstrapWiringPreflightPrepared') === true
      ? 'satisfied'
      : 'blocked',
    'App bootstrap wiring must still be deferred and prepared before factory binding can be described.'
  ),
  check(
    'factory-binding-stages-deferred',
    factoryBindingStagesDeferred(source) ? 'satisfied' : 'blocked',
    'LauncherApp and GameApp factory binding stages must remain explicit deferred stages.'
  ),
  check(
    'persistent-state-proof-summary-ready',
    proofsReady(proofs) ? 'satisfied' : 'blocked',
    'Factory binding needs summarized transaction log, package, settings, mod-lock, live registry and save/cache isolation proofs.'
  ),
  check(
    'package-summary-consistent',
    packageSummaryConsistent(source) ? 'satisfied' : 'blocked',
    'Factory binding preflight needs consistent package counts, target package and load-order summaries.'
  ),
  check(
    'path-free-app-bootstrap-wiring',
    pathFreeAppBootstrapWiring(source) ? 'satisfied' : 'blocked',
    'Factory binding preflight cannot carry startup envelopes, source adapters, hosts, paths, app factories, app instances, Pinia or router objects.'
  ),
  check(
    'no-factory-binding-runtime-or-write-effects',
    noFactoryBindingRuntimeOrWriteEffects(source) ? 'satisfied' : 'blocked',
    'Factory binding preflight must not inherit LauncherApp, GameApp, Pinia, router, save, UI/IPC, command, transaction, runtime, rollback or write effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackAppFactoryBindingPreflightCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.app-factory-binding-preflight.checks.${currentCheck.id}`,
    packageId
  )))

const requirement = (
  id: ThirdPartyDataPackAppFactoryBindingRequirementId,
  reason: string
): ThirdPartyDataPackAppFactoryBindingRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const appFactoryBindingRequirements = (): readonly ThirdPartyDataPackAppFactoryBindingRequirement[] => Object.freeze([
  requirement(
    'app-factory-binding-contract',
    'App factory binding must consume a path-free app bootstrap wiring preflight before any runtime factory is bound.'
  ),
  requirement(
    'app-bootstrap-wiring-result',
    'LauncherApp and GameApp factory binding must only proceed from a deferred/blocked/skipped app bootstrap wiring preflight.'
  ),
  requirement(
    'persistent-state-proof-summary',
    'App factory binding must use summarized persistent-state proofs instead of raw package, settings, lockfile or transaction-log reads.'
  ),
  requirement(
    'launcher-app-factory-report',
    'LauncherApp factory binding readiness is reported here but the factory is not invoked by this domain preflight.'
  ),
  requirement(
    'game-app-factory-report',
    'GameApp factory binding readiness is reported here but the factory is not invoked by this domain preflight.'
  ),
  requirement(
    'pinia-bootstrap-boundary',
    'Pinia creation remains deferred and outside this pure domain preflight.'
  ),
  requirement(
    'router-bootstrap-boundary',
    'Router mounting remains deferred and outside this pure domain preflight.'
  ),
  requirement(
    'save-open-protection',
    'Opening saves remains deferred until app startup accepts the live registry and save/cache isolation proof.'
  ),
  requirement(
    'ui-ipc-completion-boundary',
    'Final UI/IPC completion delivery remains deferred to a later platform wiring boundary.'
  ),
  requirement(
    'runtime-publication-boundary',
    'Runtime registry publication remains deferred until the runtime publication boundary is explicitly accepted.'
  ),
  requirement(
    'path-free-factory-binding-diagnostics',
    'Startup-visible diagnostics must stay redacted and avoid source adapter internals, host paths and private package contents.'
  ),
  requirement(
    'no-factory-binding-side-effect-guard',
    'This preflight must not bind factories, create apps, mount Pinia/router, read saves or write package, lockfile, settings, save, cache, transaction or diagnostic data.'
  )
])

const stage = (
  id: ThirdPartyDataPackAppFactoryBindingStageId,
  status: ThirdPartyDataPackAppFactoryBindingStage['status'],
  requirementIds: readonly ThirdPartyDataPackAppFactoryBindingRequirementId[],
  reason: string
): ThirdPartyDataPackAppFactoryBindingStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackAppFactoryBindingStage[] => Object.freeze([
  stage(
    'app-bootstrap-wiring-preflight-consumed',
    'satisfied',
    ['app-bootstrap-wiring-result', 'path-free-factory-binding-diagnostics'],
    'App bootstrap wiring preflight is consistent enough to describe factory binding requirements.'
  ),
  stage(
    'app-factory-binding-preflight',
    'satisfied',
    ['app-factory-binding-contract', 'no-factory-binding-side-effect-guard'],
    'Factory binding inputs were inspected without invoking LauncherApp or GameApp factories.'
  ),
  stage(
    'launcher-app-factory-binding-report',
    'deferred',
    ['launcher-app-factory-report'],
    'LauncherApp factory binding report is prepared; the factory is not invoked by this slice.'
  ),
  stage(
    'game-app-factory-binding-report',
    'deferred',
    ['game-app-factory-report'],
    'GameApp factory binding report is prepared; the factory is not invoked by this slice.'
  ),
  stage(
    'pinia-store-bootstrap',
    'deferred',
    ['pinia-bootstrap-boundary'],
    'Pinia creation remains deferred.'
  ),
  stage(
    'router-bootstrap',
    'deferred',
    ['router-bootstrap-boundary'],
    'Router creation and mounting remain deferred.'
  ),
  stage(
    'save-open-sequencing',
    'deferred',
    ['save-open-protection', 'persistent-state-proof-summary'],
    'Save reads remain deferred until startup wiring accepts the live registry and save/cache isolation proof.'
  ),
  stage(
    'ui-ipc-completion-sequencing',
    'deferred',
    ['ui-ipc-completion-boundary', 'path-free-factory-binding-diagnostics'],
    'Final UI/IPC completion handoff remains deferred.'
  ),
  stage(
    'runtime-publication-sequencing',
    'deferred',
    ['runtime-publication-boundary'],
    'Runtime registry publication handoff remains deferred.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackAppFactoryBindingStage[] => Object.freeze([
  'app-bootstrap-wiring-preflight-consumed',
  'app-factory-binding-preflight',
  'launcher-app-factory-binding-report',
  'game-app-factory-binding-report',
  'pinia-store-bootstrap',
  'router-bootstrap',
  'save-open-sequencing',
  'ui-ipc-completion-sequencing',
  'runtime-publication-sequencing'
].map(id => stage(id as ThirdPartyDataPackAppFactoryBindingStageId, status, [], reason)))

const createEffectSummary = (
  prepared: boolean
): ThirdPartyDataPackAppFactoryBindingPreflightEffectSummary => ({
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
  appBootstrapWiringPreflightConsumed: prepared,
  appFactoryBindingPreflightPrepared: prepared,
  launcherAppFactoryBindingReportPrepared: prepared,
  gameAppFactoryBindingReportPrepared: prepared
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
  status: ThirdPartyDataPackAppFactoryBindingPreflightStatus,
  reason: string,
  source: ThirdPartyDataPackAppBootstrapWiringPreflightResult,
  checks: readonly ThirdPartyDataPackAppFactoryBindingPreflightCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  appFactoryBindingStages: readonly ThirdPartyDataPackAppFactoryBindingStage[],
  includeRequirements: boolean,
  proofs: ThirdPartyDataPackNormalStartupGatePersistentStateProofs | undefined
): ThirdPartyDataPackAppFactoryBindingPreflightResult => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const prepared = status === 'deferred'
    && checks.every(currentCheck => currentCheck.status === 'satisfied')

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_PREFLIGHT_KIND,
    mode: THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_PREFLIGHT_MODE,
    platform: readOwnStringField(source, 'platform') as ThirdPartyDataPackLauncherBoundaryPlatform,
    status,
    appBootstrapWiringPreflightStatus: readOwnStringField(source, 'status') as ThirdPartyDataPackAppBootstrapWiringPreflightStatus,
    startupGateDecision: readOwnStringField(source, 'startupGateDecision') as ThirdPartyDataPackNormalStartupGateDecision,
    reason,
    appFactoryBindingPreflight: status,
    readOnly: true,
    appBootstrapWiringPreflightConsumed: prepared,
    appFactoryBindingPreflightPrepared: prepared,
    launcherAppFactoryBindingReportPrepared: prepared,
    gameAppFactoryBindingReportPrepared: prepared,
    appFactoryBindingAllowed: false,
    appBootstrapWiringAllowed: false,
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
    requestedCommandId: readOwnStringField(source, 'requestedCommandId') === 'install' ? 'install' as const : undefined,
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
    appFactoryBindingStages,
    appFactoryBindingRequirements: includeRequirements ? appFactoryBindingRequirements() : Object.freeze([]),
    summary: cloneSummary(readOwnDataField(source, 'summary'), diagnostics.length),
    effects: createEffectSummary(prepared)
  })
}

export const buildThirdPartyDataPackAppFactoryBindingPreflight = (
  options: BuildThirdPartyDataPackAppFactoryBindingPreflightOptions
): ThirdPartyDataPackAppFactoryBindingPreflightResult => {
  const source = options.appBootstrapWiringPreflight

  if (readOwnStringField(source, 'status') === 'skipped') {
    const reason = readOwnStringField(source, 'reason')
      ?? 'app factory binding preflight is not required because app bootstrap wiring was skipped'
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
      ?? 'app factory binding preflight is blocked by app bootstrap wiring preflight'
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
      'app factory binding preflight inputs are inconsistent',
      source,
      checks,
      diagnostics,
      terminalStages('blocked', 'app factory binding preflight inputs are inconsistent'),
      false,
      proofs
    )
  }

  return baseResult(
    'deferred',
    'app factory binding preflight is prepared; real LauncherApp factories, GameApp factories, Pinia, router, save reads, UI/IPC delivery, runtime publication and writes remain deferred',
    source,
    checks,
    diagnostics,
    deferredStages(),
    true,
    proofs
  )
}
