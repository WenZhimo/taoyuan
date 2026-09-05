import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackLiveRegistrySwapExecutionSafeDiagnostic,
  ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
} from './thirdPartyDataPackLiveRegistrySwapExecutionSource'
import {
  THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_MODE,
  type ThirdPartyDataPackStartupGatePersistentStateSourceEffectSummary,
  type ThirdPartyDataPackStartupGatePersistentStateSourceProofs,
  type ThirdPartyDataPackStartupGatePersistentStateSourceResult,
  type ThirdPartyDataPackStartupGatePersistentStateSourceStatus
} from './thirdPartyDataPackStartupGatePersistentStateSource'
import { readThirdPartyDataPackEnabledRuntimeCommandId } from './thirdPartyDataPackRuntimeCommandState'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

type Awaitable<T> = T | Promise<T>

export interface CreateThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSourceOptions {
  readonly enabled?: boolean
  readonly readStartupGatePersistentStateSource?: () =>
    Awaitable<ThirdPartyDataPackStartupGatePersistentStateSourceResult>
  readonly readRuntimePublicationLiveRegistrySwap?: () =>
    Awaitable<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult>
}

export class ThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionBlockedError extends Error {
  readonly result: ThirdPartyDataPackStartupGatePersistentStateSourceResult

  constructor(result: ThirdPartyDataPackStartupGatePersistentStateSourceResult) {
    super('third-party runtime publication startup persistent-state connection blocked normal startup')
    this.name = 'ThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionBlockedError'
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

const forbiddenStartupStateFields = [
  'startupGateHandoffPreflight',
  'persistentStatePreflight',
  'sourceAdapterExecution',
  'startupStateSnapshot',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'indexedDb',
  'indexedDbStore',
  'appDataBridge',
  'androidNativeBridge',
  'androidPrivatePath',
  'modLockStorage',
  'transactionLogStorage',
  'packageWriter',
  'settingsStore',
  'saveStore',
  'cacheStore',
  'candidateRegistrySet',
  'candidateSnapshot',
  'liveRegistryReference',
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'routerInstance',
  'gameRouter'
] as const

const forbiddenRuntimePublicationFields = [
  'runtimePublicationPreflight',
  'transactionPreCommitPlan',
  'liveRegistrySwapProtection',
  'publicationRollbackRecovery',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'liveRegistry',
  'liveRegistryReference',
  'previousRegistry',
  'candidateRegistry',
  'runtimePublicationHost',
  'liveRegistrySwapHost',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'packageWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'window',
  'document'
] as const

const readOwnDataField = (
  value: unknown,
  fieldName: string
): unknown => {
  if (value === null || typeof value !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: unknown,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnBooleanField = (
  value: unknown,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readOwnNumberField = (
  value: unknown,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

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
  diagnostic: unknown
): ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic | undefined => {
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  if (!diagnosticSeverities.has(severity as ModDiagnosticSeverity)) return undefined
  if (!diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)) return undefined

  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: severity as ModDiagnosticSeverity,
    stage: readOwnStringField(diagnostic, 'stage')
      ?? 'third-party.runtime-publication-startup-state-connection.diagnostic-copy',
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? `mods.error.${code.toLowerCase().replace(/-/g, '.')}`,
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined,
    recovery: recovery as ModDiagnosticRecovery
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
    const copied = safeDiagnostic(readOwnDataField(diagnostics, String(index)))
    if (copied) result.push(copied)
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

const summaryFromSource = (
  source: unknown,
  diagnostics: readonly unknown[]
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => {
  const sourceSummary = readOwnDataField(source, 'summary')
  if (sourceSummary !== undefined && sourceSummary !== null && typeof sourceSummary === 'object') {
    return Object.freeze({
      selectedPackageCount: readOwnNumberField(sourceSummary, 'selectedPackageCount') ?? 0,
      blockedPackageCount: readOwnNumberField(sourceSummary, 'blockedPackageCount') ?? 0,
      blockedCandidateCount: readOwnNumberField(sourceSummary, 'blockedCandidateCount') ?? 0,
      loadOrderCount: readOwnNumberField(sourceSummary, 'loadOrderCount') ?? 0,
      registryCount: readOwnNumberField(sourceSummary, 'registryCount') ?? 54,
      entryCount: readOwnNumberField(sourceSummary, 'entryCount') ?? 4242,
      packageCount: readOwnNumberField(sourceSummary, 'packageCount') ?? 0,
      diagnosticCount: diagnostics.length
    })
  }

  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  return Object.freeze({
    ...emptySummary(),
    selectedPackageCount: selectedPackageIds.length,
    blockedPackageCount: blockedPackageIds.length,
    blockedCandidateCount: cloneStringList(readOwnDataField(source, 'blockedCandidatePaths')).length,
    loadOrderCount: loadOrder.length,
    registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(source, 'packageCount') ?? selectedPackageIds.length,
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

const proofsReady = (
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

const startupSourceAllowedEffectKeys = [
  'startupGatePersistentStateSourceCalled',
  'persistentStateSourceAdapterCalled',
  'startupStateSnapshotAccepted',
  'normalStartupContinuationAllowed'
] as const

const runtimeSwapAllowedEffectKeys = [
  'liveRegistrySwapExecutionSourceCalled',
  'liveRegistrySwapProtectionSourceCalled',
  'injectedLiveRegistrySwapHostCalled',
  'liveRegistrySwapHostCalled',
  'liveRegistrySwapHostAccepted',
  'appBootstrapContinuationAllowed',
  'commandContinuationAllowed',
  'thirdPartyRegistryPublished',
  'liveRegistryMutated',
  'liveRegistrySwapped',
  'runtimeEnablementAllowed'
] as const

const pathFreeStartupStateSource = (
  source: object
): boolean => forbiddenStartupStateFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const pathFreeRuntimePublicationSource = (
  source: object
): boolean => forbiddenRuntimePublicationFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const safeReadyStartupStateSource = (
  source: ThirdPartyDataPackStartupGatePersistentStateSourceResult
): boolean => {
  const targetPackageId = readOwnStringField(source, 'targetPackageId')
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const proofs = clonePersistentStateProofs(readOwnDataField(source, 'persistentStateProofs'))
  return readOwnStringField(source, 'status') === 'ready'
    && readOwnBooleanField(source, 'normalStartupContinuationAllowed') === true
    && targetPackageId !== undefined
    && selectedPackageIds.includes(targetPackageId as PackageId)
    && loadOrder.length === selectedPackageIds.length
    && readOwnNumberField(source, 'registryCount') !== undefined
    && readOwnNumberField(source, 'entryCount') !== undefined
    && readOwnNumberField(source, 'packageCount') !== undefined
    && readOwnStringField(source, 'candidateHash') !== undefined
    && readOwnStringField(source, 'lockfileHash') !== undefined
    && proofsReady(proofs)
    && allOwnBooleanFlagsFalse(
      readOwnDataField(source, 'effects') as object | undefined,
      startupSourceAllowedEffectKeys
    )
    && pathFreeStartupStateSource(source)
}

const safeSkippedStartupStateSource = (
  source: ThirdPartyDataPackStartupGatePersistentStateSourceResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && readOwnBooleanField(source, 'normalStartupContinuationAllowed') === true
  && allOwnBooleanFlagsFalse(
    readOwnDataField(source, 'effects') as object | undefined,
    startupSourceAllowedEffectKeys
  )
  && pathFreeStartupStateSource(source)

const safeSwappedRuntimePublicationSource = (
  source: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
): boolean => {
  const targetPackageId = readOwnStringField(source, 'targetPackageId')
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const candidateIdentity = readOwnDataField(source, 'candidateIdentity')
  return readOwnStringField(source, 'status') === 'swapped'
    && readOwnBooleanField(source, 'appBootstrapContinuationAllowed') === true
    && readOwnBooleanField(source, 'commandContinuationAllowed') === true
    && readThirdPartyDataPackEnabledRuntimeCommandId(readOwnStringField(source, 'requestedCommandId')) !== undefined
    && targetPackageId !== undefined
    && selectedPackageIds.includes(targetPackageId as PackageId)
    && loadOrder.length === selectedPackageIds.length
    && readOwnNumberField(source, 'registryCount') !== undefined
    && readOwnNumberField(source, 'entryCount') !== undefined
    && readOwnNumberField(source, 'packageCount') !== undefined
    && readOwnStringField(candidateIdentity, 'candidateHash') !== undefined
    && readOwnStringField(source, 'lockfileHash') !== undefined
    && allOwnBooleanFlagsFalse(
      readOwnDataField(source, 'effects') as object | undefined,
      runtimeSwapAllowedEffectKeys
    )
    && pathFreeRuntimePublicationSource(source)
}

const safeSkippedRuntimePublicationSource = (
  source: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && readOwnBooleanField(source, 'appBootstrapContinuationAllowed') === true
  && readOwnBooleanField(source, 'commandContinuationAllowed') === true
  && allOwnBooleanFlagsFalse(
    readOwnDataField(source, 'effects') as object | undefined,
    [
      'liveRegistrySwapExecutionSourceCalled',
      'liveRegistrySwapProtectionSourceCalled',
      'appBootstrapContinuationAllowed',
      'commandContinuationAllowed'
    ]
  )
  && pathFreeRuntimePublicationSource(source)

const runtimePublicationMatchesStartupState = (
  startupSource: ThirdPartyDataPackStartupGatePersistentStateSourceResult,
  runtimeSource: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
): boolean => {
  const runtimeCandidateIdentity = readOwnDataField(runtimeSource, 'candidateIdentity')
  const startupProofs = clonePersistentStateProofs(readOwnDataField(startupSource, 'persistentStateProofs'))
  return readOwnStringField(startupSource, 'targetPackageId') === readOwnStringField(runtimeSource, 'targetPackageId')
    && arraysEqual(
      clonePackageIds(readOwnDataField(startupSource, 'selectedPackageIds')),
      clonePackageIds(readOwnDataField(runtimeSource, 'selectedPackageIds'))
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(startupSource, 'blockedPackageIds')),
      clonePackageIds(readOwnDataField(runtimeSource, 'blockedPackageIds'))
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(startupSource, 'loadOrder')),
      clonePackageIds(readOwnDataField(runtimeSource, 'loadOrder'))
    )
    && readOwnNumberField(startupSource, 'registryCount') === readOwnNumberField(runtimeSource, 'registryCount')
    && readOwnNumberField(startupSource, 'entryCount') === readOwnNumberField(runtimeSource, 'entryCount')
    && readOwnNumberField(startupSource, 'packageCount') === readOwnNumberField(runtimeSource, 'packageCount')
    && readOwnStringField(startupSource, 'candidateHash') === readOwnStringField(runtimeCandidateIdentity, 'candidateHash')
    && readOwnStringField(startupSource, 'lockfileHash') === readOwnStringField(runtimeSource, 'lockfileHash')
    && startupProofs?.liveRegistryMatched === true
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

const effectSummary = (
  sourceCalled: boolean,
  accepted: boolean,
  continuationAllowed: boolean
): ThirdPartyDataPackStartupGatePersistentStateSourceEffectSummary => Object.freeze({
  startupGatePersistentStateSourceCalled: true,
  persistentStateSourceAdapterCalled: sourceCalled,
  startupStateSnapshotAccepted: accepted,
  normalStartupContinuationAllowed: continuationAllowed,
  launcherAppCreated: false,
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

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackStartupGatePersistentStateSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly startupSource?: ThirdPartyDataPackStartupGatePersistentStateSourceResult
    readonly runtimeSource?: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
    readonly diagnostics?: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  }
): ThirdPartyDataPackStartupGatePersistentStateSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const source = options.startupSource ?? options.runtimeSource
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const continuationAllowed = options.status !== 'blocked'
  const accepted = options.status === 'ready'
  const candidateHash = readOwnStringField(source, 'candidateHash')
    ?? readOwnStringField(readOwnDataField(options.runtimeSource, 'candidateIdentity'), 'candidateHash')

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    normalStartupContinuationAllowed: continuationAllowed,
    sourceAdapterStatus: readOwnStringField(options.startupSource, 'sourceAdapterStatus') as
      | ThirdPartyDataPackStartupGatePersistentStateSourceResult['sourceAdapterStatus']
      | undefined,
    requestedCommandId: readThirdPartyDataPackEnabledRuntimeCommandId(readOwnStringField(source, 'requestedCommandId')),
    targetPackageId: readOwnStringField(source, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(source, 'blockedCandidateCount')
      ?? cloneStringList(readOwnDataField(source, 'blockedCandidatePaths')).length,
    loadOrder,
    registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(source, 'packageCount') ?? selectedPackageIds.length,
    candidateHash: candidateHash as Sha256Hash | undefined,
    lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash | undefined,
    ...(clonePersistentStateProofs(readOwnDataField(options.startupSource, 'persistentStateProofs')) === undefined
      ? {}
      : {
          persistentStateProofs: clonePersistentStateProofs(
            readOwnDataField(options.startupSource, 'persistentStateProofs')
          )
        }),
    diagnostics,
    summary: summaryFromSource(source, diagnostics),
    effects: effectSummary(options.sourceCalled, accepted, continuationAllowed)
  })
}

const diagnosticsFromSources = (
  startupSource: ThirdPartyDataPackStartupGatePersistentStateSourceResult | undefined,
  runtimeSource: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult | undefined
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze([
  ...safeDiagnostics(readOwnDataField(startupSource, 'diagnostics') as readonly unknown[] | undefined),
  ...safeDiagnostics(readOwnDataField(runtimeSource, 'diagnostics') as readonly ThirdPartyDataPackLiveRegistrySwapExecutionSafeDiagnostic[] | undefined)
])

const evaluateConnectionSource = async(
  options: CreateThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSourceOptions
): Promise<ThirdPartyDataPackStartupGatePersistentStateSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party runtime publication startup persistent-state connection is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readStartupGatePersistentStateSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party runtime publication startup persistent-state connection is enabled without a startup persistent-state source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.runtime-publication-startup-state-connection.missing-startup-source')
      ]
    })
  }

  if (options.readRuntimePublicationLiveRegistrySwap === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party runtime publication startup persistent-state connection is enabled without a runtime live-registry swap source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.runtime-publication-startup-state-connection.missing-runtime-source')
      ]
    })
  }

  let startupSource: ThirdPartyDataPackStartupGatePersistentStateSourceResult
  try {
    startupSource = await options.readStartupGatePersistentStateSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party runtime publication startup persistent-state connection failed before returning a safe startup source',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.runtime-publication-startup-state-connection.startup-source-failed')
      ]
    })
  }

  const startupDiagnostics = diagnosticsFromSources(startupSource, undefined)
  if (safeSkippedStartupStateSource(startupSource)) {
    let runtimeSource: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
    try {
      runtimeSource = await options.readRuntimePublicationLiveRegistrySwap()
    } catch {
      return baseResult({
        status: 'blocked',
        reason: 'third-party runtime publication startup persistent-state connection failed while checking skipped runtime publication state',
        enabled: true,
        sourceCalled: true,
        startupSource,
        diagnostics: [
          ...startupDiagnostics,
          commandDiagnostic('third-party.runtime-publication-startup-state-connection.runtime-source-failed')
        ]
      })
    }

    const diagnostics = diagnosticsFromSources(startupSource, runtimeSource)
    if (safeSkippedRuntimePublicationSource(runtimeSource)) {
      return baseResult({
        status: 'skipped',
        reason: 'third-party runtime publication startup persistent-state connection skipped because both startup and runtime publication sources were skipped',
        enabled: true,
        sourceCalled: true,
        startupSource,
        runtimeSource,
        diagnostics
      })
    }

    return baseResult({
      status: 'blocked',
      reason: 'third-party runtime publication startup persistent-state connection rejected mismatched skipped startup/runtime sources',
      enabled: true,
      sourceCalled: true,
      startupSource,
      runtimeSource,
      diagnostics: [
        ...diagnostics,
        commandDiagnostic('third-party.runtime-publication-startup-state-connection.skipped-source-mismatch')
      ]
    })
  }

  if (!safeReadyStartupStateSource(startupSource)) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party runtime publication startup persistent-state connection rejected an unsafe startup persistent-state source before live registry swap',
      enabled: true,
      sourceCalled: true,
      startupSource,
      diagnostics: [
        ...startupDiagnostics,
        commandDiagnostic(
          'third-party.runtime-publication-startup-state-connection.unsafe-startup-source',
          readOwnStringField(startupSource, 'targetPackageId') as PackageId | undefined
        )
      ]
    })
  }

  let runtimeSource: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
  try {
    runtimeSource = await options.readRuntimePublicationLiveRegistrySwap()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party runtime publication startup persistent-state connection failed before returning a safe runtime live-registry swap source',
      enabled: true,
      sourceCalled: true,
      startupSource,
      diagnostics: [
        ...startupDiagnostics,
        commandDiagnostic(
          'third-party.runtime-publication-startup-state-connection.runtime-source-failed',
          readOwnStringField(startupSource, 'targetPackageId') as PackageId | undefined
        )
      ]
    })
  }

  const diagnostics = diagnosticsFromSources(startupSource, runtimeSource)
  if (
    safeSwappedRuntimePublicationSource(runtimeSource)
    && runtimePublicationMatchesStartupState(startupSource, runtimeSource)
  ) {
    return baseResult({
      status: 'ready',
      reason: 'third-party runtime publication startup persistent-state connection accepted matching live-registry swap and startup state summaries',
      enabled: true,
      sourceCalled: true,
      startupSource,
      runtimeSource,
      diagnostics
    })
  }

  const targetPackageId = readOwnStringField(startupSource, 'targetPackageId') as PackageId | undefined
  return baseResult({
    status: 'blocked',
    reason: 'third-party runtime publication startup persistent-state connection requires matching path-free startup state and live-registry swap summaries',
    enabled: true,
    sourceCalled: true,
    startupSource,
    runtimeSource,
    diagnostics: [
      ...diagnostics,
      ...(!pathFreeRuntimePublicationSource(runtimeSource)
        || !allOwnBooleanFlagsFalse(
          readOwnDataField(runtimeSource, 'effects') as object | undefined,
          runtimeSwapAllowedEffectKeys
        )
        ? [
            commandDiagnostic(
              'third-party.runtime-publication-startup-state-connection.unsafe-runtime-source',
              targetPackageId
            )
          ]
        : []),
      commandDiagnostic(
        'third-party.runtime-publication-startup-state-connection.summary-mismatch',
        targetPackageId
      )
    ]
  })
}

export const createThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource = (
  options: CreateThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSourceOptions = {}
): (() => Promise<ThirdPartyDataPackStartupGatePersistentStateSourceResult>) => async() => {
  const result = await evaluateConnectionSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource =
  createThirdPartyDataPackRuntimePublicationStartupPersistentStateConnectionSource()
