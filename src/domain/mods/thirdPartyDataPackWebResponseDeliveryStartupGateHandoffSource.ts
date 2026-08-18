import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackWebResponseDeliveryAcknowledgement
} from './thirdPartyDataPackWebResponseDeliverySinkAdapter'
import type {
  ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck,
  ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult
} from './thirdPartyDataPackWebResponseDeliveryStartupGateHandoff'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_KIND =
  'third-party-web-response-delivery-startup-gate-handoff-source'
export const THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_MODE =
  'default-disabled-web-response-delivery-startup-gate-handoff-source'

export type ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceEnvelopeSummary {
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

export interface ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceEffectSummary {
  readonly webResponseDeliveryStartupGateHandoffSourceCalled: boolean
  readonly webResponseDeliveryStartupGateHandoffReaderCalled: boolean
  readonly responseDeliveryStartupGateHandoffAccepted: boolean
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
  readonly electronIpcResponseSent: false
  readonly webFilePickerOpened: false
  readonly webUiBridgeOpened: false
  readonly webUiResponsePublished: boolean
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
  readonly webResponseDeliveryAcknowledgementConsumed: boolean
  readonly startupGateHandoffPreflightConsumed: boolean
  readonly responseDeliveryStartupGateHandoffPrepared: boolean
}

export interface ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_MODE
  readonly platform: 'web'
  readonly status: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly startupGateContinuationAllowed: boolean
  readonly sourceHandoffStatus?: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult['status']
  readonly webResponseDeliveryStatus?: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult['webResponseDeliveryStatus']
  readonly startupGateHandoffPreflightStatus?: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult['startupGateHandoffPreflightStatus']
  readonly webResponseDelivered: boolean
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
  readonly deliveryEnvelopeSummary?: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceEnvelopeSummary
  readonly acknowledgement?: ThirdPartyDataPackWebResponseDeliveryAcknowledgement
  readonly checks: readonly ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceEffectSummary
}

export interface CreateThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceOptions {
  readonly enabled?: boolean
  readonly readWebResponseDeliveryStartupGateHandoff?: () =>
    Awaitable<ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult>
}

export class ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffBlockedError extends Error {
  readonly result: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult

  constructor(result: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult) {
    super('third-party Web response delivery startup gate handoff source blocked startup continuation')
    this.name = 'ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffBlockedError'
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

const forbiddenStartupHandoffSourceFields = [
  'webResponseDelivery',
  'webResponseDeliverySinkAdapter',
  'startupGateHandoffPreflight',
  'responseDeliveryOrchestrationHandoff',
  'platformSplitContract',
  'responseDeliveryPreflight',
  'resultEnvelopeContract',
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
      ?? 'third-party.web-response-delivery-startup-gate-handoff-source.diagnostic-copy',
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
): ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck | undefined => {
  const id = readOwnStringField(check, 'id')
  const status = readOwnStringField(check, 'status')
  if (
    id === undefined
    || (status !== 'satisfied' && status !== 'skipped' && status !== 'blocked')
  ) {
    return undefined
  }
  return Object.freeze({
    id: id as ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck['id'],
    status,
    reason: readOwnStringField(check, 'reason') ?? 'Web response delivery startup handoff source copied check.'
  })
}

const cloneChecks = (
  checks: unknown
): readonly ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck[] => {
  if (!Array.isArray(checks)) return Object.freeze([])
  const length = readArrayLength(checks)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck[] = []
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

const cloneEnvelopeSummary = (
  envelope: unknown,
  fallbackSummary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
): ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceEnvelopeSummary | undefined => {
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

const cloneAcknowledgement = (
  acknowledgement: unknown,
  envelopeSummary: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceEnvelopeSummary | undefined
): ThirdPartyDataPackWebResponseDeliveryAcknowledgement | undefined => {
  if (acknowledgement === undefined || acknowledgement === null || typeof acknowledgement !== 'object' || envelopeSummary === undefined) {
    return undefined
  }
  if (
    readOwnStringField(acknowledgement, 'status') !== 'acknowledged'
    || readOwnStringField(acknowledgement, 'channel') !== 'web-ui-response-event-sink'
    || readOwnStringField(acknowledgement, 'packageId') !== envelopeSummary.packageId
    || readOwnStringField(acknowledgement, 'envelopeKind') !== envelopeSummary.kind
    || readOwnStringField(acknowledgement, 'messageKey') !== envelopeSummary.messageKey
  ) {
    return undefined
  }
  return Object.freeze({
    status: 'acknowledged',
    channel: 'web-ui-response-event-sink',
    packageId: envelopeSummary.packageId,
    envelopeKind: envelopeSummary.kind,
    messageKey: envelopeSummary.messageKey
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

const preparedEffectKeysFor = (
  envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined
): readonly string[] => {
  const keys = [
    'webUiResponsePublished',
    'uiIpcResponseDelivered',
    'webResponseDeliveryAcknowledgementConsumed',
    'startupGateHandoffPreflightConsumed',
    'responseDeliveryStartupGateHandoffPrepared'
  ]
  if (envelopeKind === 'success') keys.push('successEnvelopeDelivered')
  if (envelopeKind === 'failure') keys.push('failureEnvelopeDelivered')
  if (envelopeKind === 'retry') keys.push('retryStateDelivered')
  if (envelopeKind === 'rollback') keys.push('rollbackStateDelivered')
  return keys
}

const pathFreeStartupHandoffSource = (
  source: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult
): boolean => forbiddenStartupHandoffSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const noStartupRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult,
  prepared: boolean,
  envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined
): boolean => readOwnBooleanField(source, 'startupGateHandoffAllowed') === false
  && readOwnBooleanField(source, 'launcherAppAllowed') === false
  && readOwnBooleanField(source, 'gameAppCreationAllowed') === false
  && readOwnBooleanField(source, 'piniaCreationAllowed') === false
  && readOwnBooleanField(source, 'routerMountAllowed') === false
  && readOwnBooleanField(source, 'saveReadAllowed') === false
  && readOwnBooleanField(source, 'uiIpcResponseDeliveryAllowed') === false
  && readOwnBooleanField(source, 'deliveryAcknowledgementAllowed') === false
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'postCommitVerificationAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'rollbackRecoveryAllowed') === false
  && allOwnBooleanFlagsFalse(
    readOwnDataField(source, 'effects') as object | undefined,
    prepared ? preparedEffectKeysFor(envelopeKind) : []
  )

const safeSkippedSource = (
  source: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && readOwnBooleanField(source, 'webResponseDelivered') === false
  && readOwnBooleanField(source, 'deliveryAcknowledgementConsumed') === false
  && readOwnBooleanField(source, 'startupGateHandoffPreflightConsumed') === false
  && readOwnBooleanField(source, 'responseDeliveryStartupGateHandoffPrepared') === false
  && noStartupRuntimeOrWriteDrift(source, false, undefined)
  && pathFreeStartupHandoffSource(source)

const safeReadySource = (
  source: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult,
  envelopeSummary: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceEnvelopeSummary | undefined,
  acknowledgement: ThirdPartyDataPackWebResponseDeliveryAcknowledgement | undefined
): boolean => readOwnStringField(source, 'status') === 'ready'
  && readOwnStringField(source, 'webResponseDeliveryStatus') === 'delivered'
  && readOwnStringField(source, 'startupGateHandoffPreflightStatus') === 'deferred'
  && readOwnBooleanField(source, 'webResponseDelivered') === true
  && readOwnBooleanField(source, 'deliveryAcknowledgementConsumed') === true
  && readOwnBooleanField(source, 'startupGateHandoffPreflightConsumed') === true
  && readOwnBooleanField(source, 'responseDeliveryStartupGateHandoffPrepared') === true
  && envelopeSummary !== undefined
  && acknowledgement !== undefined
  && noStartupRuntimeOrWriteDrift(source, true, envelopeSummary.kind)
  && pathFreeStartupHandoffSource(source)

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
  continuationAllowed: boolean,
  envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined
): ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceEffectSummary => Object.freeze({
  webResponseDeliveryStartupGateHandoffSourceCalled: true,
  webResponseDeliveryStartupGateHandoffReaderCalled: sourceCalled,
  responseDeliveryStartupGateHandoffAccepted: accepted,
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
  electronIpcResponseSent: false,
  webFilePickerOpened: false,
  webUiBridgeOpened: false,
  webUiResponsePublished: accepted,
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
  successEnvelopeDelivered: accepted && envelopeKind === 'success',
  failureEnvelopeDelivered: accepted && envelopeKind === 'failure',
  retryStateDelivered: accepted && envelopeKind === 'retry',
  rollbackStateDelivered: accepted && envelopeKind === 'rollback',
  uiIpcResponseDelivered: accepted,
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
  webResponseDeliveryAcknowledgementConsumed: accepted,
  startupGateHandoffPreflightConsumed: accepted,
  responseDeliveryStartupGateHandoffPrepared: accepted
})

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult
    readonly diagnostics?: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  }
): ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const summaryFallback = cloneSummary(readOwnDataField(options.source, 'summary'), diagnostics)
  const envelopeSummary = cloneEnvelopeSummary(readOwnDataField(options.source, 'deliveryEnvelope'), summaryFallback)
  const acknowledgement = cloneAcknowledgement(readOwnDataField(options.source, 'acknowledgement'), envelopeSummary)
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const accepted = options.status === 'ready'
  const continuationAllowed = options.status !== 'blocked'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_MODE,
    platform: 'web',
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    startupGateContinuationAllowed: continuationAllowed,
    sourceHandoffStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult['status']
      | undefined,
    webResponseDeliveryStatus: readOwnStringField(options.source, 'webResponseDeliveryStatus') as
      | ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult['webResponseDeliveryStatus']
      | undefined,
    startupGateHandoffPreflightStatus: readOwnStringField(options.source, 'startupGateHandoffPreflightStatus') as
      | ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult['startupGateHandoffPreflightStatus']
      | undefined,
    webResponseDelivered: accepted,
    deliveryAcknowledgementConsumed: accepted,
    startupGateHandoffPreflightConsumed: accepted,
    responseDeliveryStartupGateHandoffPrepared: accepted,
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
    effects: effectSummary(options.sourceCalled, accepted, continuationAllowed, envelopeSummary?.kind)
  })
}

const evaluateWebResponseDeliveryStartupGateHandoffSource = async(
  options: CreateThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceOptions
): Promise<ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party Web response delivery startup gate handoff source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readWebResponseDeliveryStartupGateHandoff === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Web response delivery startup gate handoff source is enabled without a handoff source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.web-response-delivery-startup-gate-handoff-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult
  try {
    source = await options.readWebResponseDeliveryStartupGateHandoff()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Web response delivery startup gate handoff source failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.web-response-delivery-startup-gate-handoff-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  const summaryFallback = cloneSummary(readOwnDataField(source, 'summary'), sourceDiagnostics)
  const envelopeSummary = cloneEnvelopeSummary(readOwnDataField(source, 'deliveryEnvelope'), summaryFallback)
  const acknowledgement = cloneAcknowledgement(readOwnDataField(source, 'acknowledgement'), envelopeSummary)

  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party Web response delivery startup gate handoff is not required because the handoff was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeReadySource(source, envelopeSummary, acknowledgement)) {
    return baseResult({
      status: 'ready',
      reason: 'third-party Web response delivery startup gate handoff source accepted path-free Web acknowledgement handoff evidence',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeStartupHandoffSource(source) || !noStartupRuntimeOrWriteDrift(source, true, envelopeSummary?.kind)
      ? [
          commandDiagnostic(
            'third-party.web-response-delivery-startup-gate-handoff-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.web-response-delivery-startup-gate-handoff-source.handoff-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party Web response delivery startup gate handoff requires safe ready evidence before startup may continue',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource = (
  options: CreateThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceOptions = {}
): (() => Promise<ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult>) => async() => {
  const result = await evaluateWebResponseDeliveryStartupGateHandoffSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource =
  createThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource()
