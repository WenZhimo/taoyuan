import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackAndroidResponseDeliveryStartupGateHandoffSourceResult
} from './thirdPartyDataPackAndroidResponseDeliveryStartupGateHandoffSource'
import type {
  ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSourceResult
} from './thirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult
} from './thirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ACKNOWLEDGEMENT_CONVERGENCE_SOURCE_KIND =
  'third-party-ui-ipc-response-delivery-acknowledgement-convergence-source'
export const THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ACKNOWLEDGEMENT_CONVERGENCE_SOURCE_MODE =
  'default-disabled-ui-ipc-response-delivery-acknowledgement-convergence-source'

export type ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform =
  | 'electron'
  | 'web'
  | 'android'

export type ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

type PlatformHandoffSourceResult =
  | ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSourceResult
  | ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult
  | ThirdPartyDataPackAndroidResponseDeliveryStartupGateHandoffSourceResult

export interface ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceEnvelopeSummary {
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

export interface ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSummary {
  readonly status: 'acknowledged'
  readonly channel: string
  readonly packageId: PackageId
  readonly envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly messageKey: string
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceCheck {
  readonly id: string
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceEffectSummary {
  readonly uiIpcResponseDeliveryAcknowledgementConvergenceSourceCalled: boolean
  readonly selectedPlatformHandoffSourceCalled: boolean
  readonly selectedPlatformHandoffAccepted: boolean
  readonly deliveryAcknowledgementConverged: boolean
  readonly startupGateContinuationAllowed: boolean
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
  readonly electronIpcResponseSent: boolean
  readonly webFilePickerOpened: false
  readonly webUiBridgeOpened: false
  readonly webUiResponsePublished: boolean
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
  readonly saveRead: false
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
  readonly electronResponseDeliveryAcknowledgementConsumed: boolean
  readonly webResponseDeliveryAcknowledgementConsumed: boolean
  readonly androidResponseDeliveryAcknowledgementConsumed: boolean
  readonly startupGateHandoffPreflightConsumed: boolean
  readonly responseDeliveryStartupGateHandoffPrepared: boolean
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ACKNOWLEDGEMENT_CONVERGENCE_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ACKNOWLEDGEMENT_CONVERGENCE_SOURCE_MODE
  readonly selectedPlatform?: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
  readonly status: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly startupGateContinuationAllowed: boolean
  readonly platformSourceStatus?: PlatformHandoffSourceResult['status']
  readonly platformResponseDeliveryStatus?: string
  readonly startupGateHandoffPreflightStatus?: string
  readonly platformResponseDelivered: boolean
  readonly deliveryAcknowledgementConsumed: boolean
  readonly startupGateHandoffPreflightConsumed: boolean
  readonly responseDeliveryStartupGateHandoffPrepared: boolean
  readonly startupGateHandoffAllowed: false
  readonly launcherAppAllowed: false
  readonly gameAppCreationAllowed: false
  readonly piniaCreationAllowed: false
  readonly routerMountAllowed: false
  readonly saveReadAllowed: false
  readonly uiIpcResponseDeliveryAllowed: false
  readonly deliveryAcknowledgementAllowed: false
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
  readonly deliveryEnvelopeSummary?: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceEnvelopeSummary
  readonly acknowledgement?: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSummary
  readonly checks: readonly ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceEffectSummary
}

export interface CreateThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceOptions {
  readonly enabled?: boolean
  readonly platform?: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
  readonly readElectronResponseDeliveryStartupGateHandoffSource?: () =>
    Awaitable<ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSourceResult>
  readonly readWebResponseDeliveryStartupGateHandoffSource?: () =>
    Awaitable<ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult>
  readonly readAndroidResponseDeliveryStartupGateHandoffSource?: () =>
    Awaitable<ThirdPartyDataPackAndroidResponseDeliveryStartupGateHandoffSourceResult>
}

export class ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError extends Error {
  readonly result: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult

  constructor(result: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult) {
    super('third-party UI/IPC response delivery acknowledgement convergence blocked startup continuation')
    this.name = 'ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError'
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

const expectedAcknowledgementChannels: Record<
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform,
  string
> = {
  electron: 'electron-preload-response-channel',
  web: 'web-ui-response-event-sink',
  android: 'android-native-response-event-sink'
}

const forbiddenConvergenceSourceFields = [
  'electronHost',
  'electronIpcHost',
  'webHost',
  'webUiBridge',
  'webDomTarget',
  'eventTarget',
  'androidHost',
  'androidNativeBridge',
  'capacitorBridge',
  'programDirectoryPath',
  'appDataDirectory',
  'contentUri',
  'fileUri',
  'platformPath',
  'responseDeliverySinkAdapter',
  'responseDeliveryOrchestrationHandoff',
  'startupGateHandoffPreflight',
  'deliveryEnvelope',
  'resultEnvelope',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
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
  'router',
  'window',
  'document'
] as const

const disallowedSourceBooleanFields = [
  'startupGateHandoffAllowed',
  'launcherAppAllowed',
  'gameAppCreationAllowed',
  'piniaCreationAllowed',
  'routerMountAllowed',
  'saveReadAllowed',
  'uiIpcResponseDeliveryAllowed',
  'deliveryAcknowledgementAllowed',
  'commandDispatchAllowed',
  'transactionCommitAllowed',
  'postCommitVerificationAllowed',
  'runtimeEnablementAllowed',
  'writeAllowed',
  'rollbackRecoveryAllowed'
] as const

const disallowedEffectFields = [
  'officialRegistryPublished',
  'thirdPartyRegistryPublished',
  'liveRegistryMutated',
  'liveRegistrySwapped',
  'previousRegistryReleased',
  'previousRegistryRestored',
  'candidateRegistryExposed',
  'runtimeEnablementAllowed',
  'modManagementUiMounted',
  'launcherAppMounted',
  'gameAppCreated',
  'piniaCreated',
  'routerMounted',
  'electronIpcExposed',
  'webFilePickerOpened',
  'webUiBridgeOpened',
  'androidFilePickerOpened',
  'androidUiBridgeOpened',
  'commandDispatcherCalled',
  'commandDispatched',
  'atomicCommitExecutorCalled',
  'transactionCommitted',
  'transactionLogPrepared',
  'runtimePublicationCommitted',
  'postCommitVerificationExecutorCalled',
  'postCommitVerificationExecuted',
  'transactionLogRead',
  'packageStateRead',
  'settingsRead',
  'lockfileRead',
  'liveRegistryRead',
  'saveRead',
  'saveCacheIsolationChecked',
  'packageFilesWritten',
  'packageBackupsWritten',
  'packageFilesRestored',
  'lockfileWritten',
  'lockfileRestored',
  'settingsWritten',
  'settingsRestored',
  'savesWritten',
  'cacheWritten',
  'transactionLogWritten',
  'recoveryLogRead',
  'recoveryLogReplayed',
  'rollbackExecuted',
  'diagnosticsWritten'
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

const readOwnDataField = (
  value: unknown,
  fieldName: string
): unknown | undefined => {
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
  return typeof field === 'number' && Number.isSafeInteger(field) && field >= 0 ? field : undefined
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

const clonePackageIds = (value: unknown): readonly PackageId[] => Object.freeze(
  cloneStringList(value).map(packageId => packageId as PackageId)
)

const cloneCandidateIdentity = (
  value: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const contentHash = readOwnStringField(value, 'contentHash')
  const snapshotHash = readOwnStringField(value, 'snapshotHash')
  const candidateHash = readOwnStringField(value, 'candidateHash')
  const formatVersion = readOwnNumberField(value, 'formatVersion')
  return formatVersion === 1 && contentHash && snapshotHash && candidateHash
    ? Object.freeze({
        formatVersion: 1,
        contentHash: contentHash as Sha256Hash,
        snapshotHash: snapshotHash as Sha256Hash,
        candidateHash: candidateHash as Sha256Hash
      })
    : undefined
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
      ?? 'third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.diagnostic-copy',
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

const cloneSummary = (
  value: unknown,
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => Object.freeze({
  selectedPackageCount: readOwnNumberField(value, 'selectedPackageCount') ?? 0,
  blockedPackageCount: readOwnNumberField(value, 'blockedPackageCount') ?? 0,
  blockedCandidateCount: readOwnNumberField(value, 'blockedCandidateCount') ?? 0,
  loadOrderCount: readOwnNumberField(value, 'loadOrderCount') ?? 0,
  registryCount: readOwnNumberField(value, 'registryCount') ?? 54,
  entryCount: readOwnNumberField(value, 'entryCount') ?? 4242,
  packageCount: readOwnNumberField(value, 'packageCount') ?? 0,
  diagnosticCount: readOwnNumberField(value, 'diagnosticCount') ?? diagnostics.length
})

const cloneEnvelopeSummary = (
  value: unknown,
  summaryFallback: ThirdPartyDataPackUiIpcResultEnvelopeSummary
): ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceEnvelopeSummary | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const kind = readOwnStringField(value, 'kind')
  const commandId = readOwnStringField(value, 'commandId')
  const packageId = readOwnStringField(value, 'packageId')
  const messageKey = readOwnStringField(value, 'messageKey')
  const recovery = readOwnDataField(value, 'recovery')
  const retryable = readOwnBooleanField(value, 'retryable')
  const rollbackRequired = readOwnBooleanField(value, 'rollbackRequired')

  return outcomeKinds.has(kind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind)
    && commandId === 'install'
    && packageId !== undefined
    && messageKey !== undefined
    && diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)
    && retryable !== undefined
    && rollbackRequired !== undefined
    ? Object.freeze({
        formatVersion: 1,
        kind: kind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
        commandId: 'install',
        packageId: packageId as PackageId,
        candidateHash: readOwnStringField(value, 'candidateHash') as Sha256Hash | undefined,
        lockfileHash: readOwnStringField(value, 'lockfileHash') as Sha256Hash | undefined,
        messageKey,
        recovery: recovery as ModDiagnosticRecovery,
        retryable,
        rollbackRequired,
        summary: cloneSummary(readOwnDataField(value, 'summary'), []),
        diagnosticCount: readOwnNumberField(value, 'diagnosticCount') ?? summaryFallback.diagnosticCount
      })
    : undefined
}

const cloneAcknowledgement = (
  value: unknown
): ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSummary | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const status = readOwnStringField(value, 'status')
  const channel = readOwnStringField(value, 'channel')
  const packageId = readOwnStringField(value, 'packageId')
  const envelopeKind = readOwnStringField(value, 'envelopeKind')
  const messageKey = readOwnStringField(value, 'messageKey')
  return status === 'acknowledged'
    && channel !== undefined
    && packageId !== undefined
    && outcomeKinds.has(envelopeKind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind)
    && messageKey !== undefined
    ? Object.freeze({
        status: 'acknowledged',
        channel,
        packageId: packageId as PackageId,
        envelopeKind: envelopeKind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
        messageKey
      })
    : undefined
}

const cloneChecks = (
  value: unknown
): readonly ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceCheck[] => {
  if (!Array.isArray(value)) return Object.freeze([])
  const length = readArrayLength(value)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceCheck[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable !== true || !('value' in descriptor)) continue
    const check = descriptor.value
    if (check === null || typeof check !== 'object') continue
    const id = readOwnStringField(check, 'id')
    const status = readOwnStringField(check, 'status')
    const reason = readOwnStringField(check, 'reason')
    if (
      id !== undefined
      && (status === 'satisfied' || status === 'skipped' || status === 'blocked')
      && reason !== undefined
    ) {
      result.push(Object.freeze({ id, status, reason }))
    }
  }
  return Object.freeze(result)
}

const hasForbiddenField = (value: unknown): boolean => {
  if (value === null || typeof value !== 'object') return false
  return forbiddenConvergenceSourceFields.some(fieldName => {
    try {
      return Reflect.getOwnPropertyDescriptor(value, fieldName) !== undefined
    } catch {
      return true
    }
  })
}

const allDisallowedBooleanFieldsFalse = (
  value: unknown,
  fieldNames: readonly string[]
): boolean => fieldNames.every(fieldName => readOwnBooleanField(value, fieldName) === false)

const platformResponseDeliveredField = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
): string => `${platform}ResponseDelivered`

const platformResponseStatusField = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
): string => `${platform}ResponseDeliveryStatus`

const platformResponsePublishedEffectField = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
): string => platform === 'electron'
  ? 'electronIpcResponseSent'
  : `${platform}UiResponsePublished`

const platformAcknowledgementEffectField = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
): string => `${platform}ResponseDeliveryAcknowledgementConsumed`

const noStartupRuntimeOrWriteDrift = (
  source: unknown,
  accepted: boolean,
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform,
  envelopeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): boolean => {
  const effects = readOwnDataField(source, 'effects')
  const platformPublishedField = platformResponsePublishedEffectField(platform)
  const platformAcknowledgementField = platformAcknowledgementEffectField(platform)
  return allDisallowedBooleanFieldsFalse(source, disallowedSourceBooleanFields)
    && allDisallowedBooleanFieldsFalse(effects, disallowedEffectFields)
    && readOwnBooleanField(effects, 'uiIpcResponseDelivered') === accepted
    && readOwnBooleanField(effects, platformPublishedField) === accepted
    && readOwnBooleanField(effects, platformAcknowledgementField) === accepted
    && readOwnBooleanField(effects, 'startupGateHandoffPreflightConsumed') === accepted
    && readOwnBooleanField(effects, 'responseDeliveryStartupGateHandoffPrepared') === accepted
    && readOwnBooleanField(effects, 'successEnvelopeDelivered') === (accepted && envelopeKind === 'success')
    && readOwnBooleanField(effects, 'failureEnvelopeDelivered') === (accepted && envelopeKind === 'failure')
    && readOwnBooleanField(effects, 'retryStateDelivered') === (accepted && envelopeKind === 'retry')
    && readOwnBooleanField(effects, 'rollbackStateDelivered') === (accepted && envelopeKind === 'rollback')
}

const safeSkippedSource = (
  source: unknown,
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && readOwnStringField(source, 'platform') === platform
  && readOwnBooleanField(source, 'readOnly') === true
  && readOwnBooleanField(source, 'startupGateContinuationAllowed') === true
  && readOwnBooleanField(source, platformResponseDeliveredField(platform)) === false
  && readOwnBooleanField(source, 'deliveryAcknowledgementConsumed') === false
  && readOwnBooleanField(source, 'startupGateHandoffPreflightConsumed') === false
  && readOwnBooleanField(source, 'responseDeliveryStartupGateHandoffPrepared') === false
  && !hasForbiddenField(source)
  && noStartupRuntimeOrWriteDrift(source, false, platform)

const safeReadySource = (
  source: unknown,
  platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform,
  envelopeSummary: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceEnvelopeSummary | undefined,
  acknowledgement: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSummary | undefined
): boolean => {
  const targetPackageId = readOwnStringField(source, 'targetPackageId')
  const envelopeKind = readOwnStringField(source, 'envelopeKind')
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  const lockfileHash = readOwnStringField(source, 'lockfileHash')
  return envelopeSummary !== undefined
    && acknowledgement !== undefined
    && readOwnStringField(source, 'status') === 'ready'
    && readOwnStringField(source, 'platform') === platform
    && readOwnBooleanField(source, 'readOnly') === true
    && readOwnStringField(source, 'sourceHandoffStatus') === 'ready'
    && readOwnStringField(source, platformResponseStatusField(platform)) === 'delivered'
    && readOwnStringField(source, 'startupGateHandoffPreflightStatus') === 'deferred'
    && readOwnBooleanField(source, 'startupGateContinuationAllowed') === true
    && readOwnBooleanField(source, platformResponseDeliveredField(platform)) === true
    && readOwnBooleanField(source, 'deliveryAcknowledgementConsumed') === true
    && readOwnBooleanField(source, 'startupGateHandoffPreflightConsumed') === true
    && readOwnBooleanField(source, 'responseDeliveryStartupGateHandoffPrepared') === true
    && readOwnStringField(source, 'requestedCommandId') === 'install'
    && targetPackageId === envelopeSummary.packageId
    && envelopeKind === envelopeSummary.kind
    && readOwnStringField(source, 'messageKey') === envelopeSummary.messageKey
    && acknowledgement.channel === expectedAcknowledgementChannels[platform]
    && acknowledgement.packageId === envelopeSummary.packageId
    && acknowledgement.envelopeKind === envelopeSummary.kind
    && acknowledgement.messageKey === envelopeSummary.messageKey
    && (candidateIdentity?.candidateHash ?? undefined) === envelopeSummary.candidateHash
    && (lockfileHash ?? undefined) === envelopeSummary.lockfileHash
    && !hasForbiddenField(source)
    && noStartupRuntimeOrWriteDrift(source, true, platform, envelopeSummary.kind)
}

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>
    for (const child of Object.values(objectValue)) {
      deepFreezeObjectGraph(child)
    }
    Object.freeze(value)
  }
  return value
}

const effectSummary = (
  sourceCalled: boolean,
  sourceAccepted: boolean,
  continuationAllowed: boolean,
  platform?: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform,
  envelopeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceEffectSummary => Object.freeze({
  uiIpcResponseDeliveryAcknowledgementConvergenceSourceCalled: true,
  selectedPlatformHandoffSourceCalled: sourceCalled,
  selectedPlatformHandoffAccepted: sourceAccepted,
  deliveryAcknowledgementConverged: sourceAccepted,
  startupGateContinuationAllowed: continuationAllowed,
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
  electronIpcResponseSent: sourceAccepted && platform === 'electron',
  webFilePickerOpened: false,
  webUiBridgeOpened: false,
  webUiResponsePublished: sourceAccepted && platform === 'web',
  androidFilePickerOpened: false,
  androidUiBridgeOpened: false,
  androidUiResponsePublished: sourceAccepted && platform === 'android',
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
  successEnvelopeDelivered: sourceAccepted && envelopeKind === 'success',
  failureEnvelopeDelivered: sourceAccepted && envelopeKind === 'failure',
  retryStateDelivered: sourceAccepted && envelopeKind === 'retry',
  rollbackStateDelivered: sourceAccepted && envelopeKind === 'rollback',
  uiIpcResponseDelivered: sourceAccepted,
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
  electronResponseDeliveryAcknowledgementConsumed: sourceAccepted && platform === 'electron',
  webResponseDeliveryAcknowledgementConsumed: sourceAccepted && platform === 'web',
  androidResponseDeliveryAcknowledgementConsumed: sourceAccepted && platform === 'android',
  startupGateHandoffPreflightConsumed: sourceAccepted,
  responseDeliveryStartupGateHandoffPrepared: sourceAccepted
})

const selectReader = (
  options: CreateThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceOptions
): (() => Awaitable<PlatformHandoffSourceResult>) | undefined => {
  switch (options.platform) {
    case 'electron':
      return options.readElectronResponseDeliveryStartupGateHandoffSource
    case 'web':
      return options.readWebResponseDeliveryStartupGateHandoffSource
    case 'android':
      return options.readAndroidResponseDeliveryStartupGateHandoffSource
    default:
      return undefined
  }
}

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly platform?: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
    readonly source?: PlatformHandoffSourceResult
    readonly diagnostics?: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  }
): ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const summaryFallback = cloneSummary(readOwnDataField(options.source, 'summary'), diagnostics)
  const envelopeSummary = cloneEnvelopeSummary(readOwnDataField(options.source, 'deliveryEnvelopeSummary'), summaryFallback)
  const acknowledgement = cloneAcknowledgement(readOwnDataField(options.source, 'acknowledgement'))
  const accepted = options.status === 'ready'
  const continuationAllowed = options.status !== 'blocked'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ACKNOWLEDGEMENT_CONVERGENCE_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ACKNOWLEDGEMENT_CONVERGENCE_SOURCE_MODE,
    selectedPlatform: options.platform,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    startupGateContinuationAllowed: continuationAllowed,
    platformSourceStatus: readOwnStringField(options.source, 'status') as PlatformHandoffSourceResult['status'] | undefined,
    platformResponseDeliveryStatus: options.platform === undefined
      ? undefined
      : readOwnStringField(options.source, platformResponseStatusField(options.platform)),
    startupGateHandoffPreflightStatus: readOwnStringField(options.source, 'startupGateHandoffPreflightStatus'),
    platformResponseDelivered: options.platform === undefined
      ? false
      : readOwnBooleanField(options.source, platformResponseDeliveredField(options.platform)) === true,
    deliveryAcknowledgementConsumed: readOwnBooleanField(options.source, 'deliveryAcknowledgementConsumed') === true,
    startupGateHandoffPreflightConsumed: readOwnBooleanField(options.source, 'startupGateHandoffPreflightConsumed') === true,
    responseDeliveryStartupGateHandoffPrepared:
      readOwnBooleanField(options.source, 'responseDeliveryStartupGateHandoffPrepared') === true,
    startupGateHandoffAllowed: false,
    launcherAppAllowed: false,
    gameAppCreationAllowed: false,
    piniaCreationAllowed: false,
    routerMountAllowed: false,
    saveReadAllowed: false,
    uiIpcResponseDeliveryAllowed: false,
    deliveryAcknowledgementAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: readOwnStringField(options.source, 'requestedCommandId') === 'install' ? 'install' as const : undefined,
    targetPackageId: readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined,
    envelopeKind: envelopeSummary?.kind ?? readOwnStringField(options.source, 'envelopeKind') as
      ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined,
    messageKey: envelopeSummary?.messageKey ?? readOwnStringField(options.source, 'messageKey'),
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(options.source, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? summaryFallback.registryCount,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? summaryFallback.entryCount,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? summaryFallback.packageCount,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(options.source, 'candidateIdentity')),
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    ...(envelopeSummary === undefined ? {} : { deliveryEnvelopeSummary: envelopeSummary }),
    ...(acknowledgement === undefined ? {} : { acknowledgement }),
    checks: cloneChecks(readOwnDataField(options.source, 'checks')),
    diagnostics,
    summary: envelopeSummary?.summary ?? summaryFallback,
    effects: effectSummary(options.sourceCalled, accepted, continuationAllowed, options.platform, envelopeSummary?.kind)
  })
}

const evaluateUiIpcResponseDeliveryAcknowledgementConvergenceSource = async(
  options: CreateThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceOptions
): Promise<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party UI/IPC response delivery acknowledgement convergence source is disabled by default',
      enabled: false,
      sourceCalled: false,
      platform: options.platform
    })
  }

  if (options.platform === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party UI/IPC response delivery acknowledgement convergence source is enabled without a selected platform',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.missing-platform')
      ]
    })
  }

  const reader = selectReader(options)
  if (reader === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party UI/IPC response delivery acknowledgement convergence source is enabled without a selected platform handoff source',
      enabled: true,
      sourceCalled: false,
      platform: options.platform,
      diagnostics: [
        commandDiagnostic('third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.missing-source')
      ]
    })
  }

  let source: PlatformHandoffSourceResult
  try {
    source = await reader()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party UI/IPC response delivery acknowledgement convergence source failed before returning a safe platform result',
      enabled: true,
      sourceCalled: true,
      platform: options.platform,
      diagnostics: [
        commandDiagnostic('third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  const summaryFallback = cloneSummary(readOwnDataField(source, 'summary'), sourceDiagnostics)
  const envelopeSummary = cloneEnvelopeSummary(readOwnDataField(source, 'deliveryEnvelopeSummary'), summaryFallback)
  const acknowledgement = cloneAcknowledgement(readOwnDataField(source, 'acknowledgement'))

  if (safeSkippedSource(source, options.platform)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party UI/IPC response delivery acknowledgement convergence is not required because the selected platform source was skipped',
      enabled: true,
      sourceCalled: true,
      platform: options.platform,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeReadySource(source, options.platform, envelopeSummary, acknowledgement)) {
    return baseResult({
      status: 'ready',
      reason: 'third-party UI/IPC response delivery acknowledgement convergence accepted path-free selected platform handoff evidence',
      enabled: true,
      sourceCalled: true,
      platform: options.platform,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!hasForbiddenField(source)
      && noStartupRuntimeOrWriteDrift(source, readOwnStringField(source, 'status') === 'ready', options.platform, envelopeSummary?.kind)
      ? []
      : [
          commandDiagnostic(
            'third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.unsafe-source',
            targetPackageId
          )
        ]),
    commandDiagnostic(
      'third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.convergence-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party UI/IPC response delivery acknowledgement convergence requires one safe selected platform acknowledgement before startup may continue',
    enabled: true,
    sourceCalled: true,
    platform: options.platform,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource = (
  options: CreateThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceOptions = {}
): (() => Promise<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult>) => async() => {
  const result = await evaluateUiIpcResponseDeliveryAcknowledgementConvergenceSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource =
  createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource()
