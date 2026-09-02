import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackStartupGateBootstrapSourceResult
} from './thirdPartyDataPackStartupGateBootstrapSource'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceProofs
} from './thirdPartyDataPackStartupGatePersistentStateSource'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_HANDOFF_EXECUTION_SOURCE_KIND =
  'third-party-normal-startup-handoff-execution-source'
export const THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_HANDOFF_EXECUTION_SOURCE_MODE =
  'default-disabled-normal-startup-handoff-execution-source'

export type ThirdPartyDataPackNormalStartupHandoffExecutionSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackNormalStartupHandoffHostStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackNormalStartupHandoffHostEnvelope {
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly lockfileHash: Sha256Hash
  readonly persistentStateProofs: ThirdPartyDataPackStartupGatePersistentStateSourceProofs
}

export interface ThirdPartyDataPackNormalStartupHandoffHostEffectSummary {
  readonly normalStartupHandoffHostCalled: boolean
  readonly normalStartupHandoffHostAccepted: boolean
  readonly realNormalStartupHostCalled: boolean
  readonly launcherAppFactoryCalled: false
  readonly gameAppFactoryCalled: false
  readonly launcherAppCreated: false
  readonly launcherAppMounted: false
  readonly gameAppCreated: false
  readonly gameAppMounted: false
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

export interface ThirdPartyDataPackNormalStartupHandoffHostResult {
  readonly status: ThirdPartyDataPackNormalStartupHandoffHostStatus
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds?: readonly PackageId[]
  readonly blockedPackageIds?: readonly PackageId[]
  readonly loadOrder?: readonly PackageId[]
  readonly registryCount?: number
  readonly entryCount?: number
  readonly packageCount?: number
  readonly lockfileHash?: Sha256Hash
  readonly persistentStateProofsAccepted?: boolean
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackNormalStartupHandoffHostEffectSummary
}

export interface ThirdPartyDataPackNormalStartupHandoffExecutionSourceEffectSummary {
  readonly normalStartupHandoffExecutionSourceCalled: boolean
  readonly startupGateBootstrapSourceCalled: boolean
  readonly injectedNormalStartupHandoffHostCalled: boolean
  readonly normalStartupHandoffHostCalled: boolean
  readonly normalStartupHandoffHostAccepted: boolean
  readonly realNormalStartupHostCalled: boolean
  readonly normalStartupContinuationAllowed: boolean
  readonly launcherAppFactoryCalled: false
  readonly gameAppFactoryCalled: false
  readonly launcherAppCreated: false
  readonly launcherAppMounted: false
  readonly gameAppCreated: false
  readonly gameAppMounted: false
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

export interface ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_HANDOFF_EXECUTION_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_HANDOFF_EXECUTION_SOURCE_MODE
  readonly status: ThirdPartyDataPackNormalStartupHandoffExecutionSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly normalStartupContinuationAllowed: boolean
  readonly startupGateBootstrapSourceStatus?: ThirdPartyDataPackStartupGateBootstrapSourceResult['status']
  readonly normalStartupHandoffHostStatus?: ThirdPartyDataPackNormalStartupHandoffHostStatus
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly lockfileHash?: Sha256Hash
  readonly persistentStateProofs?: ThirdPartyDataPackStartupGatePersistentStateSourceProofs
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackNormalStartupHandoffExecutionSourceEffectSummary
}

export interface CreateThirdPartyDataPackNormalStartupHandoffExecutionSourceOptions {
  readonly enabled?: boolean
  readonly readStartupGateBootstrapSource?: () => Awaitable<ThirdPartyDataPackStartupGateBootstrapSourceResult>
  readonly acknowledgeNormalStartupHandoff?: (
    envelope: ThirdPartyDataPackNormalStartupHandoffHostEnvelope
  ) => Awaitable<ThirdPartyDataPackNormalStartupHandoffHostResult>
}

export class ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError extends Error {
  readonly result: ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult

  constructor(result: ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult) {
    super('third-party normal startup handoff blocked startup continuation')
    this.name = 'ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError'
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

const forbiddenStartupHandoffSourceFields = [
  'appBootstrapWiringPreflight',
  'startupPersistentStateSource',
  'appFactoryBindingSource',
  'startupStateSnapshot',
  'appFactoryBindingHostResult',
  'normalStartupHost',
  'normalStartupHandoffHost',
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

const forbiddenStartupHandoffHostFields = [
  'startupGateBootstrapSource',
  'normalStartupRequest',
  'normalStartupHost',
  'normalStartupHandoffHost',
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
      ?? 'third-party.normal-startup-handoff-execution-source.diagnostic-copy',
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
): ThirdPartyDataPackStartupGatePersistentStateSourceProofs | undefined => {
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
  proofs: ThirdPartyDataPackStartupGatePersistentStateSourceProofs | undefined
): boolean => proofs !== undefined && Object.values(proofs).every(value => value === true)

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

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

const pathFreeStartupHandoffSource = (
  source: object
): boolean => forbiddenStartupHandoffSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const pathFreeStartupHandoffHostResult = (
  hostResult: ThirdPartyDataPackNormalStartupHandoffHostResult
): boolean => forbiddenStartupHandoffHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

const sourceEffectAllowList = [
  'startupGateBootstrapSourceCalled',
  'appBootstrapWiringSourceCalled',
  'startupPersistentStateSourceCalled',
  'startupStateSnapshotAccepted',
  'appFactoryBindingSourceCalled',
  'appFactoryBindingContinuationAllowed',
  'appBootstrapContinuationAllowed'
] as const

const noStartupRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackStartupGateBootstrapSourceResult
): boolean => readOwnBooleanField(source, 'appBootstrapContinuationAllowed') === true
  && allOwnBooleanFlagsFalse(
    readOwnDataField(source, 'effects') as object | undefined,
    sourceEffectAllowList
  )

const safeSkippedSource = (
  source: ThirdPartyDataPackStartupGateBootstrapSourceResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noStartupRuntimeOrWriteDrift(source)
  && pathFreeStartupHandoffSource(source)

const safeReadySource = (
  source: ThirdPartyDataPackStartupGateBootstrapSourceResult
): boolean => {
  const targetPackageId = readOwnStringField(source, 'targetPackageId')
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const proofs = clonePersistentStateProofs(readOwnDataField(source, 'persistentStateProofs'))
  return readOwnStringField(source, 'status') === 'ready'
    && targetPackageId !== undefined
    && selectedPackageIds.includes(targetPackageId as PackageId)
    && loadOrder.length === selectedPackageIds.length
    && readOwnNumberField(source, 'registryCount') !== undefined
    && readOwnNumberField(source, 'entryCount') !== undefined
    && readOwnNumberField(source, 'packageCount') !== undefined
    && readOwnStringField(source, 'lockfileHash') !== undefined
    && persistentProofsReady(proofs)
    && noStartupRuntimeOrWriteDrift(source)
    && pathFreeStartupHandoffSource(source)
}

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
    if (key === 'normalStartupHandoffHostCalled') return descriptor.value === true
    if (key === 'normalStartupHandoffHostAccepted') return descriptor.value === accepted
    if (key === 'realNormalStartupHostCalled') {
      return typeof descriptor.value === 'boolean' && (!descriptor.value || accepted)
    }
    return descriptor.value === false
  })
}

const safeAcceptedHostResult = (
  source: ThirdPartyDataPackStartupGateBootstrapSourceResult,
  hostResult: ThirdPartyDataPackNormalStartupHandoffHostResult
): boolean => readOwnStringField(hostResult, 'status') === 'accepted'
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
  && readOwnStringField(hostResult, 'lockfileHash') === readOwnStringField(source, 'lockfileHash')
  && readOwnBooleanField(hostResult, 'persistentStateProofsAccepted') === true
  && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
  && pathFreeStartupHandoffHostResult(hostResult)

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

const effectSummary = (
  sourceCalled: boolean,
  continuationAllowed: boolean,
  hostResult?: ThirdPartyDataPackNormalStartupHandoffHostResult
): ThirdPartyDataPackNormalStartupHandoffExecutionSourceEffectSummary => {
  const hostEffects = readOwnDataField(hostResult, 'effects') as object | undefined
  const normalStartupHandoffHostCalled =
    readOwnBooleanField(hostEffects, 'normalStartupHandoffHostCalled') ?? false
  const realNormalStartupHostCalled =
    readOwnBooleanField(hostEffects, 'realNormalStartupHostCalled') === true
  return Object.freeze({
    normalStartupHandoffExecutionSourceCalled: true,
    startupGateBootstrapSourceCalled: sourceCalled,
    injectedNormalStartupHandoffHostCalled:
      normalStartupHandoffHostCalled && !realNormalStartupHostCalled,
    normalStartupHandoffHostCalled,
    normalStartupHandoffHostAccepted:
      readOwnBooleanField(hostEffects, 'normalStartupHandoffHostAccepted') ?? false,
    realNormalStartupHostCalled,
    normalStartupContinuationAllowed: continuationAllowed,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    gameAppMounted: false,
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
}

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackNormalStartupHandoffExecutionSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackStartupGateBootstrapSourceResult
    readonly hostResult?: ThirdPartyDataPackNormalStartupHandoffHostResult
    readonly diagnostics?: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  }
): ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const continuationAllowed = options.status !== 'blocked'
  const persistentStateProofs = clonePersistentStateProofs(readOwnDataField(options.source, 'persistentStateProofs'))

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_HANDOFF_EXECUTION_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_HANDOFF_EXECUTION_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    normalStartupContinuationAllowed: continuationAllowed,
    startupGateBootstrapSourceStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackStartupGateBootstrapSourceResult['status']
      | undefined,
    normalStartupHandoffHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackNormalStartupHandoffHostStatus
      | undefined,
    targetPackageId: readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(options.source, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? selectedPackageIds.length,
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    ...(persistentStateProofs === undefined ? {} : { persistentStateProofs }),
    diagnostics,
    summary: cloneSummary(readOwnDataField(options.source, 'summary'), diagnostics),
    effects: effectSummary(options.sourceCalled, continuationAllowed, options.hostResult)
  })
}

const buildHostEnvelope = (
  source: ThirdPartyDataPackStartupGateBootstrapSourceResult
): ThirdPartyDataPackNormalStartupHandoffHostEnvelope => deepFreezeObjectGraph({
  targetPackageId: readOwnStringField(source, 'targetPackageId') as PackageId,
  selectedPackageIds: clonePackageIds(readOwnDataField(source, 'selectedPackageIds')),
  blockedPackageIds: clonePackageIds(readOwnDataField(source, 'blockedPackageIds')),
  loadOrder: clonePackageIds(readOwnDataField(source, 'loadOrder')),
  registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
  entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
  packageCount: readOwnNumberField(source, 'packageCount') ?? 0,
  lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash,
  persistentStateProofs: clonePersistentStateProofs(
    readOwnDataField(source, 'persistentStateProofs')
  ) as ThirdPartyDataPackStartupGatePersistentStateSourceProofs
})

const evaluateNormalStartupHandoffExecutionSource = async(
  options: CreateThirdPartyDataPackNormalStartupHandoffExecutionSourceOptions
): Promise<ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party normal startup handoff execution source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readStartupGateBootstrapSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party normal startup handoff execution source is enabled without a startup gate bootstrap source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.normal-startup-handoff-execution-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackStartupGateBootstrapSourceResult
  try {
    source = await options.readStartupGateBootstrapSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party normal startup handoff bootstrap source failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.normal-startup-handoff-execution-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party normal startup handoff is not required because startup bootstrap was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeReadySource(source)) {
    const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
    if (options.acknowledgeNormalStartupHandoff === undefined) {
      return baseResult({
        status: 'blocked',
        reason: 'third-party normal startup handoff execution source is enabled without a normal startup handoff host',
        enabled: true,
        sourceCalled: true,
        source,
        diagnostics: [
          ...sourceDiagnostics,
          commandDiagnostic(
            'third-party.normal-startup-handoff-execution-source.missing-handoff-host',
            targetPackageId
          )
        ]
      })
    }

    let hostResult: ThirdPartyDataPackNormalStartupHandoffHostResult
    try {
      hostResult = await options.acknowledgeNormalStartupHandoff(buildHostEnvelope(source))
    } catch {
      return baseResult({
        status: 'blocked',
        reason: 'third-party normal startup handoff host failed before returning a safe result',
        enabled: true,
        sourceCalled: true,
        source,
        diagnostics: [
          ...sourceDiagnostics,
          commandDiagnostic(
            'third-party.normal-startup-handoff-execution-source.handoff-host-failed',
            targetPackageId
          )
        ]
      })
    }

    const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
    if (safeAcceptedHostResult(source, hostResult)) {
      return baseResult({
        status: 'ready',
        reason: 'third-party normal startup handoff execution source accepted an injected path-free startup handoff acknowledgement',
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
      reason: 'third-party normal startup handoff host returned an unsafe or blocked result',
      enabled: true,
      sourceCalled: true,
      source,
      hostResult,
      diagnostics: [
        ...sourceDiagnostics,
        ...hostDiagnostics,
        ...(!pathFreeStartupHandoffHostResult(hostResult)
          || !hostEffectsContained(
            readOwnDataField(hostResult, 'effects') as object | undefined,
            readOwnStringField(hostResult, 'status') === 'accepted'
          )
          ? [
              commandDiagnostic(
                'third-party.normal-startup-handoff-execution-source.unsafe-handoff-host-result',
                targetPackageId
              )
            ]
          : []),
        commandDiagnostic(
          'third-party.normal-startup-handoff-execution-source.handoff-host-blocked',
          targetPackageId
        )
      ]
    })
  }

  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeStartupHandoffSource(source) || !noStartupRuntimeOrWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.normal-startup-handoff-execution-source.unsafe-source',
            readOwnStringField(source, 'targetPackageId') as PackageId | undefined
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.normal-startup-handoff-execution-source.startup-handoff-blocked',
      readOwnStringField(source, 'targetPackageId') as PackageId | undefined
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party normal startup handoff requires a path-free ready bootstrap source and explicit host acknowledgement',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackNormalStartupHandoffExecutionSource = (
  options: CreateThirdPartyDataPackNormalStartupHandoffExecutionSourceOptions = {}
): (() => Promise<ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult>) => async() => {
  const result = await evaluateNormalStartupHandoffExecutionSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackNormalStartupHandoffExecutionSource =
  createThirdPartyDataPackNormalStartupHandoffExecutionSource()
