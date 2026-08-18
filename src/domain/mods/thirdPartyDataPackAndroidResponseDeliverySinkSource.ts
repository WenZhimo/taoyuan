import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
} from './thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import {
  deliverThirdPartyDataPackAndroidResponseDeliverySinkAdapter,
  type ThirdPartyDataPackAndroidResponseDeliveryAcknowledgement,
  type ThirdPartyDataPackAndroidResponseDeliverySinkAdapterCheck,
  type ThirdPartyDataPackAndroidResponseDeliverySinkAdapterResult,
  type ThirdPartyDataPackAndroidResponseDeliverySinkHost
} from './thirdPartyDataPackAndroidResponseDeliverySinkAdapter'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_ANDROID_RESPONSE_DELIVERY_SINK_SOURCE_KIND =
  'third-party-android-response-delivery-sink-source'
export const THIRD_PARTY_DATA_PACK_ANDROID_RESPONSE_DELIVERY_SINK_SOURCE_MODE =
  'default-disabled-android-response-delivery-sink-source'

export type ThirdPartyDataPackAndroidResponseDeliverySinkSourceStatus =
  | 'delivered'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackAndroidResponseDeliverySinkSourceEnvelopeSummary {
  readonly formatVersion: 1
  readonly kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly commandId: 'install'
  readonly packageId: PackageId
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly messageKey: string
  readonly recovery: ModDiagnosticRecovery
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly diagnosticCount: number
}

export interface ThirdPartyDataPackAndroidResponseDeliverySinkSourceEffectSummary {
  readonly androidResponseDeliverySinkSourceCalled: boolean
  readonly platformSplitContractSourceCalled: boolean
  readonly androidSinkAdapterCalled: boolean
  readonly androidSinkHostCalled: boolean
  readonly deliveryAcknowledgementReceived: boolean
  readonly androidResponseDelivered: boolean
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
  readonly electronIpcResponseSent: false
  readonly webFilePickerOpened: false
  readonly webUiBridgeOpened: false
  readonly webUiResponsePublished: false
  readonly androidFilePickerOpened: false
  readonly androidUiBridgeOpened: false
  readonly androidUiResponsePublished: boolean
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
  readonly saveCacheIsolationChecked: false
  readonly successEnvelopeDelivered: boolean
  readonly failureEnvelopeDelivered: boolean
  readonly retryStateDelivered: boolean
  readonly rollbackStateDelivered: boolean
  readonly uiIpcResponseDelivered: boolean
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

export interface ThirdPartyDataPackAndroidResponseDeliverySinkSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ANDROID_RESPONSE_DELIVERY_SINK_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ANDROID_RESPONSE_DELIVERY_SINK_SOURCE_MODE
  readonly platform: 'android'
  readonly status: ThirdPartyDataPackAndroidResponseDeliverySinkSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly androidSinkAdapterCalled: boolean
  readonly androidResponseDelivered: boolean
  readonly responseDeliveryContinuationAllowed: boolean
  readonly platformSplitContractStatus?: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult['status']
  readonly sourcePlatformSplitStatus?: ThirdPartyDataPackAndroidResponseDeliverySinkAdapterResult['sourcePlatformSplitStatus']
  readonly androidResponseDeliverySinkAdapterStatus?: ThirdPartyDataPackAndroidResponseDeliverySinkAdapterResult['status']
  readonly uiIpcResponseDeliveryAllowed: boolean
  readonly electronIpcAllowed: false
  readonly electronResponseDeliveryAllowed: false
  readonly webUiBridgeAllowed: false
  readonly webResponseDeliveryAllowed: false
  readonly androidUiBridgeAllowed: boolean
  readonly androidResponseDeliveryAllowed: boolean
  readonly startupGateHandoffAllowed: false
  readonly deliveryAcknowledgementAllowed: boolean
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly postCommitVerificationAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly writeAllowed: false
  readonly rollbackRecoveryAllowed: false
  readonly requestedCommandId?: 'install'
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
  readonly deliveryEnvelopeSummary?: ThirdPartyDataPackAndroidResponseDeliverySinkSourceEnvelopeSummary
  readonly acknowledgement?: ThirdPartyDataPackAndroidResponseDeliveryAcknowledgement
  readonly checks: readonly ThirdPartyDataPackAndroidResponseDeliverySinkAdapterCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackAndroidResponseDeliverySinkSourceEffectSummary
}

export interface CreateThirdPartyDataPackAndroidResponseDeliverySinkSourceOptions {
  readonly enabled?: boolean
  readonly readUiIpcResponseDeliveryPlatformSplitContract?: () =>
    Awaitable<ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult>
  readonly host?: ThirdPartyDataPackAndroidResponseDeliverySinkHost
}

export class ThirdPartyDataPackAndroidResponseDeliverySinkBlockedError extends Error {
  readonly result: ThirdPartyDataPackAndroidResponseDeliverySinkSourceResult

  constructor(result: ThirdPartyDataPackAndroidResponseDeliverySinkSourceResult) {
    super('third-party Android response delivery sink source blocked response delivery continuation')
    this.name = 'ThirdPartyDataPackAndroidResponseDeliverySinkBlockedError'
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
const outcomeKinds = new Set<ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind>([
  'success',
  'failure',
  'retry',
  'rollback'
])

const forbiddenAndroidSinkSourceFields = [
  'platformSplitContract',
  'responseDeliveryPreflight',
  'resultEnvelopeContract',
  'envelopeContract',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'electronHost',
  'electronIpcHost',
  'webHost',
  'webUiBridge',
  'webDomTarget',
  'eventTarget',
  'window',
  'document',
  'androidHost',
  'androidNativeBridge',
  'capacitorBridge',
  'programDirectoryPath',
  'packageWriter',
  'settingsStore',
  'saveStore',
  'cacheStore',
  'modLockStorage',
  'transactionLogStorage',
  'recoveryLogStorage',
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

const readOwnNumberField = (
  value: object | undefined,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

const readOwnBooleanField = (
  value: object | undefined,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
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
      ?? 'third-party.android-response-delivery-sink-source.diagnostic-copy',
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

const cloneCheck = (
  check: object
): ThirdPartyDataPackAndroidResponseDeliverySinkAdapterCheck | undefined => {
  const id = readOwnStringField(check, 'id')
  const status = readOwnStringField(check, 'status')
  if (
    id === undefined
    || (status !== 'satisfied' && status !== 'skipped' && status !== 'blocked')
  ) {
    return undefined
  }
  return Object.freeze({
    id: id as ThirdPartyDataPackAndroidResponseDeliverySinkAdapterCheck['id'],
    status,
    reason: readOwnStringField(check, 'reason') ?? 'Android response delivery sink source copied adapter check.'
  })
}

const cloneChecks = (
  checks: unknown
): readonly ThirdPartyDataPackAndroidResponseDeliverySinkAdapterCheck[] => {
  if (!Array.isArray(checks)) return Object.freeze([])
  const length = readArrayLength(checks)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackAndroidResponseDeliverySinkAdapterCheck[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(checks, String(index))
    } catch {
      continue
    }
    const value = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (value !== undefined && value !== null && typeof value === 'object') {
      const copied = cloneCheck(value)
      if (copied !== undefined) result.push(copied)
    }
  }
  return Object.freeze(result)
}

const cloneAcknowledgement = (
  acknowledgement: unknown,
  envelopeSummary: ThirdPartyDataPackAndroidResponseDeliverySinkSourceEnvelopeSummary | undefined
): ThirdPartyDataPackAndroidResponseDeliveryAcknowledgement | undefined => {
  if (acknowledgement === undefined || acknowledgement === null || typeof acknowledgement !== 'object' || envelopeSummary === undefined) {
    return undefined
  }
  if (
    readOwnStringField(acknowledgement, 'status') !== 'acknowledged'
    || readOwnStringField(acknowledgement, 'channel') !== 'android-native-response-event-sink'
    || readOwnStringField(acknowledgement, 'packageId') !== envelopeSummary.packageId
    || readOwnStringField(acknowledgement, 'envelopeKind') !== envelopeSummary.kind
    || readOwnStringField(acknowledgement, 'messageKey') !== envelopeSummary.messageKey
  ) {
    return undefined
  }
  return Object.freeze({
    status: 'acknowledged',
    channel: 'android-native-response-event-sink',
    packageId: envelopeSummary.packageId,
    envelopeKind: envelopeSummary.kind,
    messageKey: envelopeSummary.messageKey
  })
}

const cloneEnvelopeSummary = (
  envelope: unknown,
  fallbackSummary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
): ThirdPartyDataPackAndroidResponseDeliverySinkSourceEnvelopeSummary | undefined => {
  if (envelope === undefined || envelope === null || typeof envelope !== 'object') return undefined
  const formatVersion = readOwnNumberField(envelope, 'formatVersion')
  const kind = readOwnStringField(envelope, 'kind')
  const commandId = readOwnStringField(envelope, 'commandId')
  const packageId = readOwnStringField(envelope, 'packageId')
  const messageKey = readOwnStringField(envelope, 'messageKey')
  const recovery = readOwnDataField(envelope, 'recovery')
  if (
    formatVersion !== 1
    || !outcomeKinds.has(kind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind)
    || commandId !== 'install'
    || packageId === undefined
    || messageKey === undefined
    || !diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)
  ) {
    return undefined
  }

  const diagnostics = safeDiagnostics(readOwnDataField(envelope, 'diagnostics') as readonly unknown[] | undefined)
  return Object.freeze({
    formatVersion: 1,
    kind: kind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
    commandId: 'install',
    packageId: packageId as PackageId,
    candidateHash: readOwnStringField(envelope, 'candidateHash') as Sha256Hash | undefined,
    lockfileHash: readOwnStringField(envelope, 'lockfileHash') as Sha256Hash | undefined,
    messageKey,
    recovery: recovery as ModDiagnosticRecovery,
    retryable: readOwnBooleanField(envelope, 'retryable') === true,
    rollbackRequired: readOwnBooleanField(envelope, 'rollbackRequired') === true,
    summary: cloneSummary(readOwnDataField(envelope, 'summary') ?? fallbackSummary, diagnostics),
    diagnosticCount: diagnostics.length
  })
}

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

const deliveryEffectKeysFor = (
  envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined
): readonly string[] => {
  const keys = ['androidUiResponsePublished', 'uiIpcResponseDelivered']
  if (envelopeKind === 'success') keys.push('successEnvelopeDelivered')
  if (envelopeKind === 'failure') keys.push('failureEnvelopeDelivered')
  if (envelopeKind === 'retry') keys.push('retryStateDelivered')
  if (envelopeKind === 'rollback') keys.push('rollbackStateDelivered')
  return keys
}

const pathFreeAndroidSinkAdapterSource = (
  source: ThirdPartyDataPackAndroidResponseDeliverySinkAdapterResult
): boolean => forbiddenAndroidSinkSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const noRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackAndroidResponseDeliverySinkAdapterResult,
  delivered: boolean,
  envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined
): boolean => readOwnBooleanField(source, 'uiIpcResponseDeliveryAllowed') === delivered
  && readOwnBooleanField(source, 'electronIpcAllowed') === false
  && readOwnBooleanField(source, 'electronResponseDeliveryAllowed') === false
  && readOwnBooleanField(source, 'webUiBridgeAllowed') === false
  && readOwnBooleanField(source, 'webResponseDeliveryAllowed') === false
  && readOwnBooleanField(source, 'androidUiBridgeAllowed') === delivered
  && readOwnBooleanField(source, 'androidResponseDeliveryAllowed') === delivered
  && readOwnBooleanField(source, 'startupGateHandoffAllowed') === false
  && readOwnBooleanField(source, 'deliveryAcknowledgementAllowed') === delivered
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'postCommitVerificationAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'rollbackRecoveryAllowed') === false
  && allOwnBooleanFlagsFalse(
    readOwnDataField(source, 'effects') as object | undefined,
    delivered ? deliveryEffectKeysFor(envelopeKind) : []
  )

const safeSkippedAdapterSource = (
  source: ThirdPartyDataPackAndroidResponseDeliverySinkAdapterResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && readOwnBooleanField(source, 'androidResponseDeliveryAttempted') === false
  && readOwnBooleanField(source, 'androidResponseDelivered') === false
  && noRuntimeOrWriteDrift(source, false, undefined)
  && pathFreeAndroidSinkAdapterSource(source)

const safeDeliveredAdapterSource = (
  source: ThirdPartyDataPackAndroidResponseDeliverySinkAdapterResult,
  envelopeSummary: ThirdPartyDataPackAndroidResponseDeliverySinkSourceEnvelopeSummary | undefined,
  acknowledgement: ThirdPartyDataPackAndroidResponseDeliveryAcknowledgement | undefined
): boolean => readOwnStringField(source, 'status') === 'delivered'
  && readOwnStringField(source, 'sourcePlatformSplitStatus') === 'deferred'
  && readOwnBooleanField(source, 'androidResponseDeliveryAttempted') === true
  && readOwnBooleanField(source, 'androidResponseDelivered') === true
  && envelopeSummary !== undefined
  && acknowledgement !== undefined
  && noRuntimeOrWriteDrift(source, true, envelopeSummary.kind)
  && pathFreeAndroidSinkAdapterSource(source)

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

const firstPackageIds = (
  first: unknown,
  fallback: unknown
): readonly PackageId[] => {
  const values = clonePackageIds(first)
  return values.length > 0 ? values : clonePackageIds(fallback)
}

const firstString = (
  first: string | undefined,
  fallback: string | undefined
): string | undefined => first ?? fallback

const effectSummary = (
  status: ThirdPartyDataPackAndroidResponseDeliverySinkSourceStatus,
  sourceCalled: boolean,
  adapter?: ThirdPartyDataPackAndroidResponseDeliverySinkAdapterResult,
  envelopeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): ThirdPartyDataPackAndroidResponseDeliverySinkSourceEffectSummary => {
  const delivered = status === 'delivered'
  return Object.freeze({
    androidResponseDeliverySinkSourceCalled: true,
    platformSplitContractSourceCalled: sourceCalled,
    androidSinkAdapterCalled: adapter !== undefined,
    androidSinkHostCalled: readOwnBooleanField(adapter, 'androidResponseDeliveryAttempted') === true,
    deliveryAcknowledgementReceived: readOwnDataField(adapter, 'acknowledgement') !== undefined,
    androidResponseDelivered: delivered,
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
    electronIpcResponseSent: false,
    webFilePickerOpened: false,
    webUiBridgeOpened: false,
    webUiResponsePublished: false,
    androidFilePickerOpened: false,
    androidUiBridgeOpened: false,
    androidUiResponsePublished: delivered,
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
    saveCacheIsolationChecked: false,
    successEnvelopeDelivered: delivered && envelopeKind === 'success',
    failureEnvelopeDelivered: delivered && envelopeKind === 'failure',
    retryStateDelivered: delivered && envelopeKind === 'retry',
    rollbackStateDelivered: delivered && envelopeKind === 'rollback',
    uiIpcResponseDelivered: delivered,
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
}

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackAndroidResponseDeliverySinkSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly platformSplit?: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
    readonly adapter?: ThirdPartyDataPackAndroidResponseDeliverySinkAdapterResult
    readonly diagnostics?: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  }
): ThirdPartyDataPackAndroidResponseDeliverySinkSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const summaryFallback = cloneSummary(
    readOwnDataField(options.adapter, 'summary') ?? readOwnDataField(options.platformSplit, 'summary'),
    diagnostics
  )
  const envelopeSummary = cloneEnvelopeSummary(readOwnDataField(options.adapter, 'deliveryEnvelope'), summaryFallback)
  const acknowledgement = cloneAcknowledgement(readOwnDataField(options.adapter, 'acknowledgement'), envelopeSummary)
  const delivered = options.status === 'delivered'
  const selectedPackageIds = firstPackageIds(
    readOwnDataField(options.adapter, 'selectedPackageIds'),
    readOwnDataField(options.platformSplit, 'selectedPackageIds')
  )
  const blockedPackageIds = firstPackageIds(
    readOwnDataField(options.adapter, 'blockedPackageIds'),
    readOwnDataField(options.platformSplit, 'blockedPackageIds')
  )
  const loadOrder = firstPackageIds(
    readOwnDataField(options.adapter, 'loadOrder'),
    readOwnDataField(options.platformSplit, 'loadOrder')
  )

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_ANDROID_RESPONSE_DELIVERY_SINK_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_ANDROID_RESPONSE_DELIVERY_SINK_SOURCE_MODE,
    platform: 'android',
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    androidSinkAdapterCalled: options.adapter !== undefined,
    androidResponseDelivered: delivered,
    responseDeliveryContinuationAllowed: options.status !== 'blocked',
    platformSplitContractStatus: readOwnStringField(options.platformSplit, 'status') as
      | ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult['status']
      | undefined,
    sourcePlatformSplitStatus: readOwnStringField(options.adapter, 'sourcePlatformSplitStatus') as
      | ThirdPartyDataPackAndroidResponseDeliverySinkAdapterResult['sourcePlatformSplitStatus']
      | undefined,
    androidResponseDeliverySinkAdapterStatus: readOwnStringField(options.adapter, 'status') as
      | ThirdPartyDataPackAndroidResponseDeliverySinkAdapterResult['status']
      | undefined,
    uiIpcResponseDeliveryAllowed: delivered,
    electronIpcAllowed: false,
    electronResponseDeliveryAllowed: false,
    webUiBridgeAllowed: false,
    webResponseDeliveryAllowed: false,
    androidUiBridgeAllowed: delivered,
    androidResponseDeliveryAllowed: delivered,
    startupGateHandoffAllowed: false,
    deliveryAcknowledgementAllowed: delivered,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: firstString(
      readOwnStringField(options.adapter, 'requestedCommandId'),
      readOwnStringField(options.platformSplit, 'requestedCommandId')
    ) === 'install' ? 'install' as const : undefined,
    targetPackageId: firstString(
      readOwnStringField(options.adapter, 'targetPackageId'),
      readOwnStringField(options.platformSplit, 'targetPackageId')
    ) as PackageId | undefined,
    envelopeKind: envelopeSummary?.kind ?? readOwnStringField(options.platformSplit, 'envelopeKind') as
      ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined,
    messageKey: envelopeSummary?.messageKey ?? readOwnStringField(options.platformSplit, 'messageKey'),
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(options.adapter, 'blockedCandidateCount')
      ?? readOwnNumberField(options.platformSplit, 'blockedCandidateCount')
      ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(options.adapter, 'registryCount')
      ?? readOwnNumberField(options.platformSplit, 'registryCount')
      ?? summaryFallback.registryCount,
    entryCount: readOwnNumberField(options.adapter, 'entryCount')
      ?? readOwnNumberField(options.platformSplit, 'entryCount')
      ?? summaryFallback.entryCount,
    packageCount: readOwnNumberField(options.adapter, 'packageCount')
      ?? readOwnNumberField(options.platformSplit, 'packageCount')
      ?? summaryFallback.packageCount,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(options.adapter, 'candidateIdentity'))
      ?? cloneCandidateIdentity(readOwnDataField(options.platformSplit, 'candidateIdentity')),
    lockfileHash: firstString(
      readOwnStringField(options.adapter, 'lockfileHash'),
      readOwnStringField(options.platformSplit, 'lockfileHash')
    ) as Sha256Hash | undefined,
    ...(envelopeSummary === undefined ? {} : { deliveryEnvelopeSummary: envelopeSummary }),
    ...(acknowledgement === undefined ? {} : { acknowledgement }),
    checks: cloneChecks(readOwnDataField(options.adapter, 'checks')),
    diagnostics,
    summary: envelopeSummary?.summary ?? summaryFallback,
    effects: effectSummary(options.status, options.sourceCalled, options.adapter, envelopeSummary?.kind)
  })
}

const evaluateAndroidResponseDeliverySinkSource = async(
  options: CreateThirdPartyDataPackAndroidResponseDeliverySinkSourceOptions
): Promise<ThirdPartyDataPackAndroidResponseDeliverySinkSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party Android response delivery sink source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readUiIpcResponseDeliveryPlatformSplitContract === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Android response delivery sink source is enabled without a platform split contract source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.android-response-delivery-sink-source.missing-source')
      ]
    })
  }

  let platformSplit: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
  try {
    platformSplit = await options.readUiIpcResponseDeliveryPlatformSplitContract()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Android response delivery platform split source failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.android-response-delivery-sink-source.source-failed')
      ]
    })
  }

  let adapter: ThirdPartyDataPackAndroidResponseDeliverySinkAdapterResult
  try {
    adapter = await deliverThirdPartyDataPackAndroidResponseDeliverySinkAdapter({
      platformSplitContract: platformSplit,
      host: options.host
    })
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Android response delivery sink adapter failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      platformSplit,
      diagnostics: [
        commandDiagnostic(
          'third-party.android-response-delivery-sink-source.adapter-failed',
          readOwnStringField(platformSplit, 'targetPackageId') as PackageId | undefined
        )
      ]
    })
  }

  const adapterDiagnostics = safeDiagnostics(readOwnDataField(adapter, 'diagnostics') as readonly unknown[] | undefined)
  const summaryFallback = cloneSummary(readOwnDataField(adapter, 'summary'), adapterDiagnostics)
  const envelopeSummary = cloneEnvelopeSummary(readOwnDataField(adapter, 'deliveryEnvelope'), summaryFallback)
  const acknowledgement = cloneAcknowledgement(readOwnDataField(adapter, 'acknowledgement'), envelopeSummary)

  if (safeSkippedAdapterSource(adapter)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party Android response delivery is not required because the platform split was skipped',
      enabled: true,
      sourceCalled: true,
      platformSplit,
      adapter,
      diagnostics: adapterDiagnostics
    })
  }

  if (safeDeliveredAdapterSource(adapter, envelopeSummary, acknowledgement)) {
    return baseResult({
      status: 'delivered',
      reason: 'third-party Android response delivery sink source accepted a delivered fixed-channel Android acknowledgement',
      enabled: true,
      sourceCalled: true,
      platformSplit,
      adapter,
      diagnostics: adapterDiagnostics
    })
  }

  const targetPackageId = readOwnStringField(adapter, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...adapterDiagnostics,
    ...(!pathFreeAndroidSinkAdapterSource(adapter) || !noRuntimeOrWriteDrift(adapter, false, envelopeSummary?.kind)
      ? [
          commandDiagnostic(
            'third-party.android-response-delivery-sink-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.android-response-delivery-sink-source.delivery-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party Android response delivery sink source requires a safe delivered Android acknowledgement before continuation',
    enabled: true,
    sourceCalled: true,
    platformSplit,
    adapter,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackAndroidResponseDeliverySinkSource = (
  options: CreateThirdPartyDataPackAndroidResponseDeliverySinkSourceOptions = {}
): (() => Promise<ThirdPartyDataPackAndroidResponseDeliverySinkSourceResult>) => async() => {
  const result = await evaluateAndroidResponseDeliverySinkSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackAndroidResponseDeliverySinkBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackAndroidResponseDeliverySinkSource =
  createThirdPartyDataPackAndroidResponseDeliverySinkSource()
