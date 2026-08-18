import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
} from './thirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter
} from './thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ORCHESTRATION_SOURCE_KIND =
  'third-party-ui-ipc-response-delivery-orchestration-source'
export const THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ORCHESTRATION_SOURCE_MODE =
  'default-disabled-ui-ipc-response-delivery-orchestration-source'

export type ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceEffectSummary {
  readonly uiIpcResponseDeliveryOrchestrationSourceCalled: boolean
  readonly uiIpcResponseDeliveryOrchestrationHandoffSourceCalled: boolean
  readonly orchestrationHandoffAccepted: boolean
  readonly responseDeliveryContinuationAllowed: boolean
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
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ORCHESTRATION_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ORCHESTRATION_SOURCE_MODE
  readonly status: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly responseDeliveryContinuationAllowed: boolean
  readonly orchestrationHandoffStatus?: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult['status']
  readonly resultEnvelopeContractStatus?: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult['resultEnvelopeContractStatus']
  readonly responseDeliveryPreflightStatus?: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult['responseDeliveryPreflightStatus']
  readonly platformSplitContractStatus?: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult['platformSplitContractStatus']
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
  readonly platformAdapters: readonly ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceEffectSummary
}

export interface CreateThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceOptions {
  readonly enabled?: boolean
  readonly readUiIpcResponseDeliveryOrchestrationHandoff?: () => Awaitable<ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult>
}

export class ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationBlockedError extends Error {
  readonly result: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceResult

  constructor(result: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceResult) {
    super('third-party UI/IPC response delivery orchestration blocked response delivery continuation')
    this.name = 'ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationBlockedError'
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

const forbiddenOrchestrationSourceFields = [
  'resultNormalizationPreflight',
  'postCommitVerificationUiIpcOutcomeHandoff',
  'uiIpcOutcomeHandoff',
  'outcomeSource',
  'resultEnvelopeContract',
  'responseDeliveryPreflight',
  'platformSplitContract',
  'electronHost',
  'electronIpcHost',
  'webHost',
  'webUiBridge',
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
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'window',
  'document'
] as const

const allowedPreparedEffectFields = [
  'uiIpcOutcomeConsumed',
  'resultEnvelopeNormalized',
  'responseDeliveryPreflightPrepared',
  'platformSplitPrepared'
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
      ?? 'third-party.ui-ipc-response-delivery-orchestration-source.diagnostic-copy',
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

const clonePlatformAdapter = (
  adapter: object
): ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter | undefined => {
  const platform = readOwnStringField(adapter, 'platform')
  const status = readOwnStringField(adapter, 'status')
  const stageId = readOwnStringField(adapter, 'stageId')
  const transport = readOwnStringField(adapter, 'transport')
  if (
    (platform !== 'electron' && platform !== 'web' && platform !== 'android')
    || (status !== 'deferred' && status !== 'skipped' && status !== 'blocked')
    || stageId === undefined
    || transport === undefined
  ) {
    return undefined
  }
  return Object.freeze({
    platform,
    status,
    stageId: stageId as ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter['stageId'],
    transport: transport as ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter['transport'],
    requirementIds: cloneStringList(readOwnDataField(adapter, 'requirementIds')) as
      ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter['requirementIds'],
    targetPackageId: readOwnStringField(adapter, 'targetPackageId') as PackageId | undefined,
    envelopeKind: readOwnStringField(adapter, 'envelopeKind') as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined,
    messageKey: readOwnStringField(adapter, 'messageKey'),
    reason: readOwnStringField(adapter, 'reason') ?? 'platform response delivery remains deferred'
  })
}

const clonePlatformAdapters = (
  adapters: unknown
): readonly ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter[] => {
  if (!Array.isArray(adapters)) return Object.freeze([])
  const length = readArrayLength(adapters)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(adapters, String(index))
    } catch {
      continue
    }
    const value = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (value !== undefined && value !== null && typeof value === 'object') {
      const adapter = clonePlatformAdapter(value)
      if (adapter !== undefined) result.push(adapter)
    }
  }
  return Object.freeze(result)
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

const noRuntimeOrDeliveryDrift = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult,
  allowPreparedEffects: boolean
): boolean => readOwnBooleanField(source, 'uiIpcResponseDeliveryAllowed') === false
  && readOwnBooleanField(source, 'electronIpcAllowed') === false
  && readOwnBooleanField(source, 'electronResponseDeliveryAllowed') === false
  && readOwnBooleanField(source, 'webUiBridgeAllowed') === false
  && readOwnBooleanField(source, 'webResponseDeliveryAllowed') === false
  && readOwnBooleanField(source, 'androidUiBridgeAllowed') === false
  && readOwnBooleanField(source, 'androidResponseDeliveryAllowed') === false
  && readOwnBooleanField(source, 'startupGateHandoffAllowed') === false
  && readOwnBooleanField(source, 'deliveryAcknowledgementAllowed') === false
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'postCommitVerificationAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'rollbackRecoveryAllowed') === false
  && allOwnBooleanFlagsFalse(
    readOwnDataField(source, 'effects') as object | undefined,
    allowPreparedEffects ? allowedPreparedEffectFields : []
  )

const pathFreeOrchestrationSource = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
): boolean => forbiddenOrchestrationSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const safeSkippedSource = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noRuntimeOrDeliveryDrift(source, false)
  && pathFreeOrchestrationSource(source)

const safeDeferredSource = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
): boolean => readOwnStringField(source, 'status') === 'deferred'
  && readOwnBooleanField(source, 'orchestrationPrepared') === true
  && readOwnBooleanField(source, 'envelopeNormalized') === true
  && readOwnBooleanField(source, 'deliveryEnvelopePrepared') === true
  && readOwnBooleanField(source, 'platformSplitPrepared') === true
  && readOwnStringField(source, 'resultEnvelopeContractStatus') === 'ready'
  && readOwnStringField(source, 'responseDeliveryPreflightStatus') === 'deferred'
  && readOwnStringField(source, 'platformSplitContractStatus') === 'deferred'
  && noRuntimeOrDeliveryDrift(source, true)
  && pathFreeOrchestrationSource(source)

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
  handoffAccepted: boolean,
  continuationAllowed: boolean
): ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceEffectSummary => Object.freeze({
  uiIpcResponseDeliveryOrchestrationSourceCalled: true,
  uiIpcResponseDeliveryOrchestrationHandoffSourceCalled: sourceCalled,
  orchestrationHandoffAccepted: handoffAccepted,
  responseDeliveryContinuationAllowed: continuationAllowed,
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
  diagnosticsWritten: false
})

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
    readonly diagnostics?: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  }
): ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const accepted = options.status === 'deferred'
  const continuationAllowed = options.status !== 'blocked'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ORCHESTRATION_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ORCHESTRATION_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    responseDeliveryContinuationAllowed: continuationAllowed,
    orchestrationHandoffStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult['status']
      | undefined,
    resultEnvelopeContractStatus: readOwnStringField(options.source, 'resultEnvelopeContractStatus') as
      | ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult['resultEnvelopeContractStatus']
      | undefined,
    responseDeliveryPreflightStatus: readOwnStringField(options.source, 'responseDeliveryPreflightStatus') as
      | ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult['responseDeliveryPreflightStatus']
      | undefined,
    platformSplitContractStatus: readOwnStringField(options.source, 'platformSplitContractStatus') as
      | ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult['platformSplitContractStatus']
      | undefined,
    requestedCommandId: readOwnStringField(options.source, 'requestedCommandId') === 'install'
      ? 'install' as const
      : undefined,
    targetPackageId: readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined,
    envelopeKind: readOwnStringField(options.source, 'envelopeKind') as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined,
    messageKey: readOwnStringField(options.source, 'messageKey'),
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(options.source, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(options.source, 'candidateIdentity')),
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    platformAdapters: clonePlatformAdapters(readOwnDataField(options.source, 'platformAdapters')),
    diagnostics,
    summary: cloneSummary(readOwnDataField(options.source, 'summary'), diagnostics),
    effects: effectSummary(options.sourceCalled, accepted, continuationAllowed)
  })
}

const evaluateUiIpcResponseDeliveryOrchestrationSource = async(
  options: CreateThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceOptions
): Promise<ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party UI/IPC response delivery orchestration source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readUiIpcResponseDeliveryOrchestrationHandoff === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party UI/IPC response delivery orchestration source is enabled without an orchestration handoff source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.ui-ipc-response-delivery-orchestration-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
  try {
    source = await options.readUiIpcResponseDeliveryOrchestrationHandoff()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party UI/IPC response delivery orchestration handoff source failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.ui-ipc-response-delivery-orchestration-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)

  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party UI/IPC response delivery orchestration is not required because the handoff was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeDeferredSource(source)) {
    return baseResult({
      status: 'deferred',
      reason: 'third-party UI/IPC response delivery orchestration source accepted a path-free deferred handoff; real platform sinks remain disabled',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeOrchestrationSource(source) || !noRuntimeOrDeliveryDrift(source, true)
      ? [
          commandDiagnostic(
            'third-party.ui-ipc-response-delivery-orchestration-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.ui-ipc-response-delivery-orchestration-source.orchestration-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party UI/IPC response delivery orchestration requires a future real platform response sink boundary before delivery may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource = (
  options: CreateThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceOptions = {}
): (() => Promise<ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceResult>) => async() => {
  const result = await evaluateUiIpcResponseDeliveryOrchestrationSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource =
  createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource()
