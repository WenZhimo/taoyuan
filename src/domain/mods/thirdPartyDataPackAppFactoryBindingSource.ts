import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyDataPackAppFactoryBindingPreflightResult } from './thirdPartyDataPackAppFactoryBindingPreflight'
import type { ThirdPartyDataPackLauncherBoundaryPlatform } from './thirdPartyDataPackLauncherBoundaryPreflight'
import type {
  ThirdPartyDataPackNormalStartupGateDecision,
  ThirdPartyDataPackNormalStartupGatePersistentStateProofs
} from './thirdPartyDataPackNormalStartupGatePreflight'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_SOURCE_KIND =
  'third-party-app-factory-binding-source'
export const THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_SOURCE_MODE =
  'default-disabled-app-factory-binding-source'

export type ThirdPartyDataPackAppFactoryBindingSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackAppFactoryBindingHostStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackAppFactoryBindingHostEnvelope {
  readonly platform: ThirdPartyDataPackLauncherBoundaryPlatform
  readonly startupGateDecision: ThirdPartyDataPackNormalStartupGateDecision
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly persistentStateProofs: ThirdPartyDataPackNormalStartupGatePersistentStateProofs
}

export interface ThirdPartyDataPackAppFactoryBindingHostEffectSummary {
  readonly appFactoryBindingHostCalled: boolean
  readonly appFactoryBindingHostAccepted: boolean
  readonly launcherAppFactoryCalled: false
  readonly gameAppFactoryCalled: false
  readonly launcherAppCreated: false
  readonly launcherAppMounted: false
  readonly gameAppCreated: false
  readonly piniaCreated: false
  readonly routerMounted: false
  readonly saveRead: false
  readonly uiIpcResponseDelivered: false
  readonly commandDispatched: false
  readonly transactionCommitted: false
  readonly runtimePublicationCommitted: false
  readonly packageFilesWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackAppFactoryBindingHostResult {
  readonly status: ThirdPartyDataPackAppFactoryBindingHostStatus
  readonly platform?: ThirdPartyDataPackLauncherBoundaryPlatform
  readonly startupGateDecision?: ThirdPartyDataPackNormalStartupGateDecision
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds?: readonly PackageId[]
  readonly blockedPackageIds?: readonly PackageId[]
  readonly loadOrder?: readonly PackageId[]
  readonly registryCount?: number
  readonly entryCount?: number
  readonly packageCount?: number
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly persistentStateProofsAccepted?: boolean
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackAppFactoryBindingHostEffectSummary
}

export interface ThirdPartyDataPackAppFactoryBindingSourceEffectSummary {
  readonly appFactoryBindingSourceCalled: boolean
  readonly appFactoryBindingPreflightSourceCalled: boolean
  readonly injectedAppFactoryBindingHostCalled: boolean
  readonly appFactoryBindingHostCalled: boolean
  readonly appFactoryBindingHostAccepted: boolean
  readonly realAppFactoryBindingHostCalled: false
  readonly appBootstrapContinuationAllowed: boolean
  readonly launcherAppFactoryCalled: false
  readonly gameAppFactoryCalled: false
  readonly launcherAppCreated: false
  readonly launcherAppMounted: false
  readonly gameAppCreated: false
  readonly piniaCreated: false
  readonly routerMounted: false
  readonly saveRead: false
  readonly uiIpcResponseDelivered: false
  readonly commandDispatched: false
  readonly transactionCommitted: false
  readonly runtimePublicationCommitted: false
  readonly packageFilesWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackAppFactoryBindingSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_SOURCE_MODE
  readonly status: ThirdPartyDataPackAppFactoryBindingSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly appFactoryBindingPreflightSourceStatus?: ThirdPartyDataPackAppFactoryBindingPreflightResult['status']
  readonly appFactoryBindingHostStatus?: ThirdPartyDataPackAppFactoryBindingHostStatus
  readonly platform?: ThirdPartyDataPackLauncherBoundaryPlatform
  readonly startupGateDecision?: ThirdPartyDataPackNormalStartupGateDecision
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
  readonly persistentStateProofs?: ThirdPartyDataPackNormalStartupGatePersistentStateProofs
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackAppFactoryBindingSourceEffectSummary
}

export interface CreateThirdPartyDataPackAppFactoryBindingSourceOptions {
  readonly enabled?: boolean
  readonly readAppFactoryBindingPreflight?: () => Awaitable<ThirdPartyDataPackAppFactoryBindingPreflightResult>
  readonly acknowledgeAppFactoryBinding?: (
    envelope: ThirdPartyDataPackAppFactoryBindingHostEnvelope
  ) => Awaitable<ThirdPartyDataPackAppFactoryBindingHostResult>
}

export class ThirdPartyDataPackAppFactoryBindingBlockedError extends Error {
  readonly result: ThirdPartyDataPackAppFactoryBindingSourceResult

  constructor(result: ThirdPartyDataPackAppFactoryBindingSourceResult) {
    super('third-party app factory binding blocked application bootstrap')
    this.name = 'ThirdPartyDataPackAppFactoryBindingBlockedError'
    this.result = result
  }
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

const forbiddenAppFactoryBindingSourceFields = [
  'appBootstrapWiringPreflight',
  'normalStartupGatePreflight',
  'launcherBoundaryPreflight',
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

const forbiddenAppFactoryBindingHostFields = [
  'appFactoryBindingPreflight',
  'appFactoryBindingRequest',
  'appFactoryBindingHost',
  'launcherAppFactory',
  'gameAppFactory',
  'launcherApp',
  'gameApp',
  'pinia',
  'piniaStore',
  'router',
  'routerInstance',
  'gameRouter',
  'app',
  'mount',
  'saveStore',
  'saveOpenGate',
  'uiIpcHost',
  'electronHost',
  'programDirectoryPath',
  'webSourceHost',
  'indexedDb',
  'androidHost',
  'appDataBridge',
  'androidNativeBridge',
  'androidPrivatePath',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'modLockStorage',
  'settingsStorage',
  'transactionLogStorage',
  'recoveryLogStorage'
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
      ?? 'third-party.app-factory-binding-source.diagnostic-copy',
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
  diagnostics: readonly unknown[]
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => {
  if (value === undefined || value === null || typeof value !== 'object') {
    return Object.freeze({
      ...emptySummary(),
      diagnosticCount: diagnostics.length
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
    diagnosticCount: diagnostics.length
  })
}

const clonePersistentStateProofs = (
  value: unknown
): ThirdPartyDataPackNormalStartupGatePersistentStateProofs | undefined => {
  if (value === undefined || value === null || typeof value !== 'object') return undefined
  return Object.freeze({
    transactionLogCommitted: readOwnBooleanField(value, 'transactionLogCommitted') === true,
    packageStateMatched: readOwnBooleanField(value, 'packageStateMatched') === true,
    settingsStateMatched: readOwnBooleanField(value, 'settingsStateMatched') === true,
    modLockStateMatched: readOwnBooleanField(value, 'modLockStateMatched') === true,
    liveRegistryMatched: readOwnBooleanField(value, 'liveRegistryMatched') === true,
    saveCacheIsolated: readOwnBooleanField(value, 'saveCacheIsolated') === true
  })
}

const persistentProofsReady = (
  proofs: ThirdPartyDataPackNormalStartupGatePersistentStateProofs | undefined
): boolean => proofs !== undefined && Object.values(proofs).every(value => value === true)

const effectSummary = (
  sourceCalled: boolean,
  appBootstrapContinuationAllowed: boolean,
  hostResult?: ThirdPartyDataPackAppFactoryBindingHostResult
): ThirdPartyDataPackAppFactoryBindingSourceEffectSummary => Object.freeze({
  appFactoryBindingSourceCalled: true,
  appFactoryBindingPreflightSourceCalled: sourceCalled,
  injectedAppFactoryBindingHostCalled:
    readOwnBooleanField(readOwnDataField(hostResult, 'effects') as object | undefined, 'appFactoryBindingHostCalled')
      ?? false,
  appFactoryBindingHostCalled:
    readOwnBooleanField(readOwnDataField(hostResult, 'effects') as object | undefined, 'appFactoryBindingHostCalled')
      ?? false,
  appFactoryBindingHostAccepted:
    readOwnBooleanField(readOwnDataField(hostResult, 'effects') as object | undefined, 'appFactoryBindingHostAccepted')
      ?? false,
  realAppFactoryBindingHostCalled: false,
  appBootstrapContinuationAllowed,
  launcherAppFactoryCalled: false,
  gameAppFactoryCalled: false,
  launcherAppCreated: false,
  launcherAppMounted: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  saveRead: false,
  uiIpcResponseDelivered: false,
  commandDispatched: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  packageFilesWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const noRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackAppFactoryBindingPreflightResult
): boolean => readOwnBooleanField(source, 'appFactoryBindingAllowed') === false
  && readOwnBooleanField(source, 'appBootstrapWiringAllowed') === false
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

const pathFreeFactoryBindingSource = (
  source: ThirdPartyDataPackAppFactoryBindingPreflightResult
): boolean => forbiddenAppFactoryBindingSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const pathFreeAppFactoryBindingHostResult = (
  hostResult: ThirdPartyDataPackAppFactoryBindingHostResult
): boolean => forbiddenAppFactoryBindingHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

const safeSkippedSource = (
  source: ThirdPartyDataPackAppFactoryBindingPreflightResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noRuntimeOrWriteDrift(source)
  && pathFreeFactoryBindingSource(source)

const safeDeferredSource = (
  source: ThirdPartyDataPackAppFactoryBindingPreflightResult
): boolean => {
  const platform = readOwnStringField(source, 'platform')
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const targetPackageId = readOwnStringField(source, 'targetPackageId')
  const proofs = clonePersistentStateProofs(readOwnDataField(source, 'persistentStateProofs'))
  return readOwnStringField(source, 'status') === 'deferred'
    && readOwnStringField(source, 'appFactoryBindingPreflight') === 'deferred'
    && (
      platform === 'electron'
      || platform === 'web'
      || platform === 'android'
    )
    && readOwnStringField(source, 'startupGateDecision') === 'ready-for-launcher-boundary'
    && readOwnBooleanField(source, 'appBootstrapWiringPreflightConsumed') === true
    && readOwnBooleanField(source, 'appFactoryBindingPreflightPrepared') === true
    && readOwnBooleanField(source, 'launcherAppFactoryBindingReportPrepared') === true
    && readOwnBooleanField(source, 'gameAppFactoryBindingReportPrepared') === true
    && targetPackageId !== undefined
    && selectedPackageIds.includes(targetPackageId as PackageId)
    && loadOrder.length === selectedPackageIds.length
    && readOwnNumberField(source, 'registryCount') !== undefined
    && readOwnNumberField(source, 'entryCount') !== undefined
    && readOwnNumberField(source, 'packageCount') !== undefined
    && readOwnStringField(source, 'candidateHash') !== undefined
    && readOwnStringField(source, 'lockfileHash') !== undefined
    && persistentProofsReady(proofs)
    && noRuntimeOrWriteDrift(source)
    && pathFreeFactoryBindingSource(source)
}

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const hostEffectsContained = (
  effects: object | undefined,
  accepted: boolean
): boolean => {
  if (effects === undefined) return false
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
    if (!('value' in descriptor)) return false
    if (key === 'appFactoryBindingHostCalled') return descriptor.value === true
    if (key === 'appFactoryBindingHostAccepted') return descriptor.value === accepted
    return descriptor.value === false
  })
}

const safeAcceptedHostResult = (
  source: ThirdPartyDataPackAppFactoryBindingPreflightResult,
  hostResult: ThirdPartyDataPackAppFactoryBindingHostResult
): boolean => readOwnStringField(hostResult, 'status') === 'accepted'
  && readOwnStringField(hostResult, 'platform') === readOwnStringField(source, 'platform')
  && readOwnStringField(hostResult, 'startupGateDecision') === readOwnStringField(source, 'startupGateDecision')
  && readOwnStringField(hostResult, 'targetPackageId') === readOwnStringField(source, 'targetPackageId')
  && arraysEqual(
    clonePackageIds(readOwnDataField(hostResult, 'selectedPackageIds')),
    clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  )
  && arraysEqual(
    clonePackageIds(readOwnDataField(hostResult, 'blockedPackageIds')),
    clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  )
  && arraysEqual(
    clonePackageIds(readOwnDataField(hostResult, 'loadOrder')),
    clonePackageIds(readOwnDataField(source, 'loadOrder'))
  )
  && readOwnNumberField(hostResult, 'registryCount') === readOwnNumberField(source, 'registryCount')
  && readOwnNumberField(hostResult, 'entryCount') === readOwnNumberField(source, 'entryCount')
  && readOwnNumberField(hostResult, 'packageCount') === readOwnNumberField(source, 'packageCount')
  && readOwnStringField(hostResult, 'candidateHash') === readOwnStringField(source, 'candidateHash')
  && readOwnStringField(hostResult, 'lockfileHash') === readOwnStringField(source, 'lockfileHash')
  && readOwnBooleanField(hostResult, 'persistentStateProofsAccepted') === true
  && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
  && pathFreeAppFactoryBindingHostResult(hostResult)

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
  options: {
    readonly status: ThirdPartyDataPackAppFactoryBindingSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackAppFactoryBindingPreflightResult
    readonly hostResult?: ThirdPartyDataPackAppFactoryBindingHostResult
    readonly diagnostics?: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  }
): ThirdPartyDataPackAppFactoryBindingSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const continuationAllowed = options.status !== 'blocked'
  const persistentStateProofs = clonePersistentStateProofs(readOwnDataField(options.source, 'persistentStateProofs'))

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    appFactoryBindingPreflightSourceStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackAppFactoryBindingPreflightResult['status']
      | undefined,
    appFactoryBindingHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackAppFactoryBindingHostStatus
      | undefined,
    platform: readOwnStringField(options.source, 'platform') as ThirdPartyDataPackLauncherBoundaryPlatform | undefined,
    startupGateDecision: readOwnStringField(options.source, 'startupGateDecision') as
      | ThirdPartyDataPackNormalStartupGateDecision
      | undefined,
    targetPackageId: readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(options.source, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? selectedPackageIds.length,
    candidateHash: readOwnStringField(options.source, 'candidateHash') as Sha256Hash | undefined,
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    ...(persistentStateProofs === undefined ? {} : { persistentStateProofs }),
    diagnostics,
    summary: cloneSummary(readOwnDataField(options.source, 'summary'), diagnostics),
    effects: effectSummary(options.sourceCalled, continuationAllowed, options.hostResult)
  })
}

const buildAppFactoryBindingHostEnvelope = (
  source: ThirdPartyDataPackAppFactoryBindingPreflightResult
): ThirdPartyDataPackAppFactoryBindingHostEnvelope => deepFreezeObjectGraph({
  platform: readOwnStringField(source, 'platform') as ThirdPartyDataPackLauncherBoundaryPlatform,
  startupGateDecision: readOwnStringField(source, 'startupGateDecision') as
    ThirdPartyDataPackNormalStartupGateDecision,
  targetPackageId: readOwnStringField(source, 'targetPackageId') as PackageId,
  selectedPackageIds: clonePackageIds(readOwnDataField(source, 'selectedPackageIds')),
  blockedPackageIds: clonePackageIds(readOwnDataField(source, 'blockedPackageIds')),
  loadOrder: clonePackageIds(readOwnDataField(source, 'loadOrder')),
  registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
  entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
  packageCount: readOwnNumberField(source, 'packageCount') ?? 0,
  candidateHash: readOwnStringField(source, 'candidateHash') as Sha256Hash,
  lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash,
  persistentStateProofs: clonePersistentStateProofs(
    readOwnDataField(source, 'persistentStateProofs')
  ) as ThirdPartyDataPackNormalStartupGatePersistentStateProofs
})

const evaluateAppFactoryBindingSource = async(
  options: CreateThirdPartyDataPackAppFactoryBindingSourceOptions
): Promise<ThirdPartyDataPackAppFactoryBindingSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party app factory binding source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readAppFactoryBindingPreflight === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party app factory binding source is enabled without a factory binding preflight source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.app-factory-binding-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackAppFactoryBindingPreflightResult
  try {
    source = await options.readAppFactoryBindingPreflight()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party app factory binding source failed before returning a safe preflight result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.app-factory-binding-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party app factory binding is not required because factory binding preflight was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeDeferredSource(source)) {
    const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
    if (options.acknowledgeAppFactoryBinding !== undefined) {
      let hostResult: ThirdPartyDataPackAppFactoryBindingHostResult
      try {
        hostResult = await options.acknowledgeAppFactoryBinding(buildAppFactoryBindingHostEnvelope(source))
      } catch {
        return baseResult({
          status: 'blocked',
          reason: 'third-party app factory binding host failed before returning a safe result',
          enabled: true,
          sourceCalled: true,
          source,
          diagnostics: [
            ...sourceDiagnostics,
            commandDiagnostic(
              'third-party.app-factory-binding-source.binding-host-failed',
              targetPackageId
            )
          ]
        })
      }

      const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
      if (safeAcceptedHostResult(source, hostResult)) {
        return baseResult({
          status: 'ready',
          reason: 'third-party app factory binding source accepted an injected path-free factory binding acknowledgement',
          enabled: true,
          sourceCalled: true,
          source,
          hostResult,
          diagnostics: [
            ...sourceDiagnostics,
            ...hostDiagnostics
          ]
        })
      }

      return baseResult({
        status: 'blocked',
        reason: 'third-party app factory binding host returned an unsafe or blocked result',
        enabled: true,
        sourceCalled: true,
        source,
        hostResult,
        diagnostics: [
          ...sourceDiagnostics,
          ...hostDiagnostics,
          ...(!pathFreeAppFactoryBindingHostResult(hostResult)
            || !hostEffectsContained(
              readOwnDataField(hostResult, 'effects') as object | undefined,
              readOwnStringField(hostResult, 'status') === 'accepted'
            )
            ? [
                commandDiagnostic(
                  'third-party.app-factory-binding-source.unsafe-binding-host-result',
                  targetPackageId
                )
              ]
            : []),
          commandDiagnostic(
            'third-party.app-factory-binding-source.binding-host-blocked',
            targetPackageId
          )
        ]
      })
    }
  }

  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeFactoryBindingSource(source) || !noRuntimeOrWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.app-factory-binding-source.unsafe-source',
            readOwnStringField(source, 'targetPackageId') as PackageId | undefined
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.app-factory-binding-source.app-factory-binding-blocked',
      readOwnStringField(source, 'targetPackageId') as PackageId | undefined
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party app factory binding requires an explicit path-free factory binding acknowledgement before application bootstrap may continue',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackAppFactoryBindingSource = (
  options: CreateThirdPartyDataPackAppFactoryBindingSourceOptions = {}
): (() => Promise<ThirdPartyDataPackAppFactoryBindingSourceResult>) => async() => {
  const result = await evaluateAppFactoryBindingSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackAppFactoryBindingBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackAppFactoryBindingSource =
  createThirdPartyDataPackAppFactoryBindingSource()
