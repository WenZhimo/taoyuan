import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackStartupGateHandoffPreflightResult
} from './thirdPartyDataPackStartupGateHandoffPreflight'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackWebResponseDeliveryAcknowledgement,
  ThirdPartyDataPackWebResponseDeliverySinkAdapterResult
} from './thirdPartyDataPackWebResponseDeliverySinkAdapter'

export const THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_KIND =
  'web-response-delivery-startup-gate-handoff'
export const THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_MODE =
  'readonly-web-response-delivery-startup-gate-handoff'

export type ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheckId =
  | 'web-response-delivery-delivered'
  | 'web-delivery-acknowledgement-present'
  | 'startup-gate-preflight-deferred'
  | 'startup-gate-preflight-prepared'
  | 'delivery-envelope-consistent'
  | 'package-summary-consistent'
  | 'candidate-lockfile-consistent'
  | 'no-startup-runtime-or-write-effects'

export interface ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck {
  readonly id: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffEffectSummary {
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

export interface ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_MODE
  readonly platform: 'web'
  readonly status: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffStatus
  readonly webResponseDeliveryStatus: ThirdPartyDataPackWebResponseDeliverySinkAdapterResult['status']
  readonly startupGateHandoffPreflightStatus: ThirdPartyDataPackStartupGateHandoffPreflightResult['status']
  readonly reason: string
  readonly webResponseDeliveryStartupGateHandoff: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffStatus
  readonly readOnly: true
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
  readonly deliveryEnvelope?: ThirdPartyDataPackUiIpcResultEnvelope
  readonly acknowledgement?: ThirdPartyDataPackWebResponseDeliveryAcknowledgement
  readonly checks: readonly ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffEffectSummary
}

export interface BuildThirdPartyDataPackWebResponseDeliveryStartupGateHandoffOptions {
  readonly webResponseDelivery: ThirdPartyDataPackWebResponseDeliverySinkAdapterResult
  readonly startupGateHandoffPreflight: ThirdPartyDataPackStartupGateHandoffPreflightResult
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
      ?? 'third-party.web-response-delivery-startup-gate-handoff.diagnostic-copy',
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
  id: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheckId,
  status: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck['status'],
  reason: string
): ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck[] => Object.freeze([
  'web-response-delivery-delivered',
  'web-delivery-acknowledgement-present',
  'startup-gate-preflight-deferred',
  'startup-gate-preflight-prepared',
  'delivery-envelope-consistent',
  'package-summary-consistent',
  'candidate-lockfile-consistent',
  'no-startup-runtime-or-write-effects'
].map(id => check(
  id as ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheckId,
  'skipped',
  reason
)))

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

const cloneEnvelope = (
  envelope: unknown,
  summaryFallback: ThirdPartyDataPackUiIpcResultEnvelopeSummary
): ThirdPartyDataPackUiIpcResultEnvelope | undefined => {
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
    summary: cloneSummary(readOwnDataField(envelope, 'summary') ?? summaryFallback, diagnostics.length),
    diagnostics
  })
}

const cloneAcknowledgement = (
  acknowledgement: unknown,
  envelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined
): ThirdPartyDataPackWebResponseDeliveryAcknowledgement | undefined => {
  if (acknowledgement === undefined || acknowledgement === null || typeof acknowledgement !== 'object' || envelope === undefined) {
    return undefined
  }
  if (
    readOwnStringField(acknowledgement, 'status') !== 'acknowledged'
    || readOwnStringField(acknowledgement, 'channel') !== 'web-ui-response-event-sink'
    || readOwnStringField(acknowledgement, 'packageId') !== envelope.packageId
    || readOwnStringField(acknowledgement, 'envelopeKind') !== envelope.kind
    || readOwnStringField(acknowledgement, 'messageKey') !== envelope.messageKey
  ) {
    return undefined
  }
  return Object.freeze({
    status: 'acknowledged',
    channel: 'web-ui-response-event-sink',
    packageId: envelope.packageId,
    envelopeKind: envelope.kind,
    messageKey: envelope.messageKey
  })
}

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const packageSummaryConsistent = (
  delivery: ThirdPartyDataPackWebResponseDeliverySinkAdapterResult,
  startup: ThirdPartyDataPackStartupGateHandoffPreflightResult
): boolean => arraysEqual(clonePackageIds(readOwnDataField(delivery, 'selectedPackageIds')), clonePackageIds(readOwnDataField(startup, 'selectedPackageIds')))
  && arraysEqual(clonePackageIds(readOwnDataField(delivery, 'blockedPackageIds')), clonePackageIds(readOwnDataField(startup, 'blockedPackageIds')))
  && arraysEqual(clonePackageIds(readOwnDataField(delivery, 'loadOrder')), clonePackageIds(readOwnDataField(startup, 'loadOrder')))
  && readOwnNumberField(delivery, 'blockedCandidateCount') === readOwnNumberField(startup, 'blockedCandidateCount')
  && readOwnNumberField(delivery, 'registryCount') === readOwnNumberField(startup, 'registryCount')
  && readOwnNumberField(delivery, 'entryCount') === readOwnNumberField(startup, 'entryCount')
  && readOwnNumberField(delivery, 'packageCount') === readOwnNumberField(startup, 'packageCount')

const candidateHash = (value: object | undefined): Sha256Hash | undefined =>
  cloneCandidateIdentity(readOwnDataField(value, 'candidateIdentity'))?.candidateHash

const candidateLockfileConsistent = (
  delivery: ThirdPartyDataPackWebResponseDeliverySinkAdapterResult,
  startup: ThirdPartyDataPackStartupGateHandoffPreflightResult
): boolean => candidateHash(delivery) !== undefined
  && candidateHash(delivery) === candidateHash(startup)
  && readOwnStringField(delivery, 'lockfileHash') !== undefined
  && readOwnStringField(delivery, 'lockfileHash') === readOwnStringField(startup, 'lockfileHash')

const deliveryEnvelopeConsistent = (
  deliveryEnvelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined,
  startupEnvelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined,
  delivery: ThirdPartyDataPackWebResponseDeliverySinkAdapterResult,
  startup: ThirdPartyDataPackStartupGateHandoffPreflightResult
): boolean => deliveryEnvelope !== undefined
  && startupEnvelope !== undefined
  && deliveryEnvelope.commandId === 'install'
  && deliveryEnvelope.packageId === startupEnvelope.packageId
  && deliveryEnvelope.kind === startupEnvelope.kind
  && deliveryEnvelope.messageKey === startupEnvelope.messageKey
  && readOwnStringField(delivery, 'requestedCommandId') === 'install'
  && readOwnStringField(startup, 'requestedCommandId') === 'install'
  && readOwnStringField(delivery, 'targetPackageId') === readOwnStringField(startup, 'targetPackageId')
  && deliveryEnvelope.packageId === readOwnStringField(delivery, 'targetPackageId')

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
  const keys = ['webUiResponsePublished', 'uiIpcResponseDelivered']
  if (envelopeKind === 'success') keys.push('successEnvelopeDelivered')
  if (envelopeKind === 'failure') keys.push('failureEnvelopeDelivered')
  if (envelopeKind === 'retry') keys.push('retryStateDelivered')
  if (envelopeKind === 'rollback') keys.push('rollbackStateDelivered')
  return keys
}

const webDeliveryEffectsIntact = (
  delivery: ThirdPartyDataPackWebResponseDeliverySinkAdapterResult,
  envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined
): boolean => readOwnBooleanField(delivery, 'webResponseDelivered') === true
  && readOwnBooleanField(delivery, 'uiIpcResponseDeliveryAllowed') === true
  && readOwnBooleanField(delivery, 'webUiBridgeAllowed') === true
  && readOwnBooleanField(delivery, 'webResponseDeliveryAllowed') === true
  && readOwnBooleanField(delivery, 'deliveryAcknowledgementAllowed') === true
  && readOwnBooleanField(delivery, 'electronIpcAllowed') === false
  && readOwnBooleanField(delivery, 'electronResponseDeliveryAllowed') === false
  && readOwnBooleanField(delivery, 'androidUiBridgeAllowed') === false
  && readOwnBooleanField(delivery, 'androidResponseDeliveryAllowed') === false
  && readOwnBooleanField(delivery, 'startupGateHandoffAllowed') === false
  && readOwnBooleanField(delivery, 'commandDispatchAllowed') === false
  && readOwnBooleanField(delivery, 'transactionCommitAllowed') === false
  && readOwnBooleanField(delivery, 'postCommitVerificationAllowed') === false
  && readOwnBooleanField(delivery, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(delivery, 'writeAllowed') === false
  && readOwnBooleanField(delivery, 'rollbackRecoveryAllowed') === false
  && allOwnBooleanFlagsFalse(
    readOwnDataField(delivery, 'effects') as object | undefined,
    deliveryEffectKeysFor(envelopeKind)
  )

const startupPreflightEffectsIntact = (
  startup: ThirdPartyDataPackStartupGateHandoffPreflightResult
): boolean => readOwnBooleanField(startup, 'startupGateHandoffAllowed') === false
  && readOwnBooleanField(startup, 'launcherAppAllowed') === false
  && readOwnBooleanField(startup, 'gameAppCreationAllowed') === false
  && readOwnBooleanField(startup, 'piniaCreationAllowed') === false
  && readOwnBooleanField(startup, 'routerMountAllowed') === false
  && readOwnBooleanField(startup, 'saveReadAllowed') === false
  && readOwnBooleanField(startup, 'uiIpcResponseDeliveryAllowed') === false
  && readOwnBooleanField(startup, 'deliveryAcknowledgementAllowed') === false
  && readOwnBooleanField(startup, 'commandDispatchAllowed') === false
  && readOwnBooleanField(startup, 'transactionCommitAllowed') === false
  && readOwnBooleanField(startup, 'postCommitVerificationAllowed') === false
  && readOwnBooleanField(startup, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(startup, 'writeAllowed') === false
  && readOwnBooleanField(startup, 'rollbackRecoveryAllowed') === false
  && allOwnBooleanFlagsFalse(
    readOwnDataField(startup, 'effects') as object | undefined,
    ['responseDeliveryOrchestrationConsumed', 'startupGateHandoffPrepared']
  )

const noStartupRuntimeOrWriteEffects = (
  delivery: ThirdPartyDataPackWebResponseDeliverySinkAdapterResult,
  startup: ThirdPartyDataPackStartupGateHandoffPreflightResult,
  envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined
): boolean => webDeliveryEffectsIntact(delivery, envelopeKind)
  && startupPreflightEffectsIntact(startup)

const buildChecks = (
  delivery: ThirdPartyDataPackWebResponseDeliverySinkAdapterResult,
  startup: ThirdPartyDataPackStartupGateHandoffPreflightResult,
  deliveryEnvelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined,
  startupEnvelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined,
  acknowledgement: ThirdPartyDataPackWebResponseDeliveryAcknowledgement | undefined
): readonly ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck[] => Object.freeze([
  check(
    'web-response-delivery-delivered',
    readOwnStringField(delivery, 'status') === 'delivered'
      && readOwnBooleanField(delivery, 'webResponseDelivered') === true
      ? 'satisfied'
      : 'blocked',
    'Web response delivery must already have delivered the path-free envelope through the fixed Web sink.'
  ),
  check(
    'web-delivery-acknowledgement-present',
    acknowledgement !== undefined ? 'satisfied' : 'blocked',
    'Startup handoff can only consume a matching Web delivery acknowledgement.'
  ),
  check(
    'startup-gate-preflight-deferred',
    readOwnStringField(startup, 'status') === 'deferred' ? 'satisfied' : 'blocked',
    'Startup gate handoff preflight must still be deferred and side-effect-free.'
  ),
  check(
    'startup-gate-preflight-prepared',
    readOwnBooleanField(startup, 'startupGateHandoffPrepared') === true
      && readOwnBooleanField(startup, 'responseDeliveryOrchestrationConsumed') === true
      ? 'satisfied'
      : 'blocked',
    'Startup gate handoff requirements must already be prepared before delivery acknowledgement is connected.'
  ),
  check(
    'delivery-envelope-consistent',
    deliveryEnvelopeConsistent(deliveryEnvelope, startupEnvelope, delivery, startup) ? 'satisfied' : 'blocked',
    'The delivered Web envelope and startup handoff envelope must describe the same install result.'
  ),
  check(
    'package-summary-consistent',
    packageSummaryConsistent(delivery, startup) ? 'satisfied' : 'blocked',
    'Web delivery and startup handoff must agree on selected packages, blocked packages, load order and totals.'
  ),
  check(
    'candidate-lockfile-consistent',
    candidateLockfileConsistent(delivery, startup) ? 'satisfied' : 'blocked',
    'Web delivery and startup handoff must preserve the same candidate identity and lockfile hash.'
  ),
  check(
    'no-startup-runtime-or-write-effects',
    noStartupRuntimeOrWriteEffects(delivery, startup, deliveryEnvelope?.kind) ? 'satisfied' : 'blocked',
    'The bridge may consume Web delivery acknowledgement and startup preflight evidence, but must not inherit startup, runtime, command, transaction, rollback or write effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.web-response-delivery-startup-gate-handoff.checks.${currentCheck.id}`,
    packageId
  )))

const createEffectSummary = (
  prepared: boolean,
  envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined
): ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffEffectSummary => ({
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
  webUiResponsePublished: prepared,
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
  successEnvelopeDelivered: prepared && envelopeKind === 'success',
  failureEnvelopeDelivered: prepared && envelopeKind === 'failure',
  retryStateDelivered: prepared && envelopeKind === 'retry',
  rollbackStateDelivered: prepared && envelopeKind === 'rollback',
  uiIpcResponseDelivered: prepared,
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
  webResponseDeliveryAcknowledgementConsumed: prepared,
  startupGateHandoffPreflightConsumed: prepared,
  responseDeliveryStartupGateHandoffPrepared: prepared
})

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
  status: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffStatus,
  reason: string,
  delivery: ThirdPartyDataPackWebResponseDeliverySinkAdapterResult,
  startup: ThirdPartyDataPackStartupGateHandoffPreflightResult,
  checks: readonly ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  deliveryEnvelope?: ThirdPartyDataPackUiIpcResultEnvelope,
  acknowledgement?: ThirdPartyDataPackWebResponseDeliveryAcknowledgement
): ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult => {
  const prepared = status === 'ready'
    && deliveryEnvelope !== undefined
    && acknowledgement !== undefined
    && checks.every(currentCheck => currentCheck.status === 'satisfied')
  const selectedPackageIds = firstPackageIds(
    readOwnDataField(delivery, 'selectedPackageIds'),
    readOwnDataField(startup, 'selectedPackageIds')
  )
  const blockedPackageIds = firstPackageIds(
    readOwnDataField(delivery, 'blockedPackageIds'),
    readOwnDataField(startup, 'blockedPackageIds')
  )
  const loadOrder = firstPackageIds(
    readOwnDataField(delivery, 'loadOrder'),
    readOwnDataField(startup, 'loadOrder')
  )
  const resultSummary = cloneSummary(
    readOwnDataField(deliveryEnvelope, 'summary')
      ?? readOwnDataField(delivery, 'summary')
      ?? readOwnDataField(startup, 'summary'),
    diagnostics.length
  )

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_KIND,
    mode: THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_MODE,
    platform: 'web',
    status,
    webResponseDeliveryStatus: readOwnStringField(delivery, 'status') as ThirdPartyDataPackWebResponseDeliverySinkAdapterResult['status'],
    startupGateHandoffPreflightStatus: readOwnStringField(startup, 'status') as ThirdPartyDataPackStartupGateHandoffPreflightResult['status'],
    reason,
    webResponseDeliveryStartupGateHandoff: status,
    readOnly: true,
    webResponseDelivered: prepared,
    deliveryAcknowledgementConsumed: prepared,
    startupGateHandoffPreflightConsumed: prepared,
    responseDeliveryStartupGateHandoffPrepared: prepared,
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
    requestedCommandId: firstString(
      readOwnStringField(delivery, 'requestedCommandId'),
      readOwnStringField(startup, 'requestedCommandId')
    ) === 'install' ? 'install' as const : undefined,
    targetPackageId: firstString(
      readOwnStringField(delivery, 'targetPackageId'),
      readOwnStringField(startup, 'targetPackageId')
    ) as PackageId | undefined,
    envelopeKind: deliveryEnvelope?.kind,
    messageKey: deliveryEnvelope?.messageKey,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(delivery, 'blockedCandidateCount')
      ?? readOwnNumberField(startup, 'blockedCandidateCount')
      ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(delivery, 'registryCount') ?? readOwnNumberField(startup, 'registryCount') ?? resultSummary.registryCount,
    entryCount: readOwnNumberField(delivery, 'entryCount') ?? readOwnNumberField(startup, 'entryCount') ?? resultSummary.entryCount,
    packageCount: readOwnNumberField(delivery, 'packageCount') ?? readOwnNumberField(startup, 'packageCount') ?? resultSummary.packageCount,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(delivery, 'candidateIdentity'))
      ?? cloneCandidateIdentity(readOwnDataField(startup, 'candidateIdentity')),
    lockfileHash: firstString(
      readOwnStringField(delivery, 'lockfileHash'),
      readOwnStringField(startup, 'lockfileHash')
    ) as Sha256Hash | undefined,
    ...(deliveryEnvelope === undefined ? {} : { deliveryEnvelope }),
    ...(acknowledgement === undefined ? {} : { acknowledgement }),
    checks,
    diagnostics,
    summary: resultSummary,
    effects: createEffectSummary(prepared, deliveryEnvelope?.kind)
  })
}

export const buildThirdPartyDataPackWebResponseDeliveryStartupGateHandoff = (
  options: BuildThirdPartyDataPackWebResponseDeliveryStartupGateHandoffOptions
): ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult => {
  const delivery = options.webResponseDelivery
  const startup = options.startupGateHandoffPreflight
  const deliveryStatus = readOwnStringField(delivery, 'status')
  const startupStatus = readOwnStringField(startup, 'status')

  if (deliveryStatus === 'skipped' || startupStatus === 'skipped') {
    const reason = readOwnStringField(delivery, 'reason')
      ?? readOwnStringField(startup, 'reason')
      ?? 'web response delivery startup handoff is not required because no third-party install result is pending'
    return baseResult(
      'skipped',
      reason,
      delivery,
      startup,
      skippedChecks(reason),
      [
        ...safeDiagnostics(readOwnDataField(delivery, 'diagnostics') as readonly unknown[] | undefined),
        ...safeDiagnostics(readOwnDataField(startup, 'diagnostics') as readonly unknown[] | undefined)
      ]
    )
  }

  if (deliveryStatus === 'blocked' || startupStatus === 'blocked') {
    const reason = deliveryStatus === 'blocked'
      ? readOwnStringField(delivery, 'reason') ?? 'web response delivery blocked before startup handoff'
      : readOwnStringField(startup, 'reason') ?? 'startup handoff preflight blocked before Web response delivery handoff'
    return baseResult(
      'blocked',
      reason,
      delivery,
      startup,
      skippedChecks(reason),
      [
        ...safeDiagnostics(readOwnDataField(delivery, 'diagnostics') as readonly unknown[] | undefined),
        ...safeDiagnostics(readOwnDataField(startup, 'diagnostics') as readonly unknown[] | undefined)
      ]
    )
  }

  const summaryFallback = cloneSummary(
    readOwnDataField(delivery, 'summary') ?? readOwnDataField(startup, 'summary'),
    0
  )
  const deliveryEnvelope = cloneEnvelope(readOwnDataField(delivery, 'deliveryEnvelope'), summaryFallback)
  const startupEnvelope = cloneEnvelope(readOwnDataField(startup, 'deliveryEnvelope'), summaryFallback)
  const acknowledgement = cloneAcknowledgement(readOwnDataField(delivery, 'acknowledgement'), deliveryEnvelope)
  const checks = buildChecks(delivery, startup, deliveryEnvelope, startupEnvelope, acknowledgement)
  const sourceDiagnostics = Object.freeze([
    ...safeDiagnostics(readOwnDataField(delivery, 'diagnostics') as readonly unknown[] | undefined),
    ...safeDiagnostics(readOwnDataField(startup, 'diagnostics') as readonly unknown[] | undefined),
    ...safeDiagnostics(readOwnDataField(deliveryEnvelope, 'diagnostics') as readonly unknown[] | undefined)
  ])
  const blockedDiagnostics = diagnosticsForBlockedChecks(
    checks,
    readOwnStringField(delivery, 'targetPackageId') as PackageId | undefined
  )
  const diagnostics = Object.freeze([
    ...sourceDiagnostics,
    ...blockedDiagnostics
  ])

  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'web response delivery startup handoff inputs are inconsistent',
      delivery,
      startup,
      checks,
      diagnostics,
      deliveryEnvelope,
      acknowledgement
    )
  }

  return baseResult(
    'ready',
    'web response delivery acknowledgement is connected to startup gate handoff evidence; LauncherApp, GameApp, runtime reads and writes remain separate',
    delivery,
    startup,
    checks,
    diagnostics,
    deliveryEnvelope,
    acknowledgement
  )
}
