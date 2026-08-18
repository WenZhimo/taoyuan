import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter,
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult,
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformTransport
} from './thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

export type ThirdPartyDataPackWebResponseDeliverySinkAdapterStatus =
  | 'delivered'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackWebResponseDeliverySinkAdapterCheckId =
  | 'platform-split-deferred'
  | 'web-platform-contract-present'
  | 'path-free-envelope-present'
  | 'web-sink-host-ready'
  | 'fixed-web-channel'
  | 'no-upstream-delivery-effects'
  | 'delivery-acknowledgement-returned'

export interface ThirdPartyDataPackWebResponseDeliverySinkAdapterCheck {
  readonly id: ThirdPartyDataPackWebResponseDeliverySinkAdapterCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackWebResponseDeliveryAcknowledgement {
  readonly status: 'acknowledged' | 'rejected'
  readonly channel: 'web-ui-response-event-sink'
  readonly packageId: PackageId
  readonly envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly messageKey: string
}

export interface ThirdPartyDataPackWebResponseDeliverySinkHost {
  readonly channel: 'web-ui-response-event-sink'
  readonly deliver: (
    envelope: ThirdPartyDataPackUiIpcResultEnvelope
  ) => ThirdPartyDataPackWebResponseDeliveryAcknowledgement
    | Promise<ThirdPartyDataPackWebResponseDeliveryAcknowledgement>
}

export interface ThirdPartyDataPackWebResponseDeliverySinkAdapterEffectSummary {
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

export interface ThirdPartyDataPackWebResponseDeliverySinkAdapterResult {
  readonly status: ThirdPartyDataPackWebResponseDeliverySinkAdapterStatus
  readonly sourcePlatformSplitStatus: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult['status']
  readonly reason: string
  readonly webResponseDeliverySinkAdapter: ThirdPartyDataPackWebResponseDeliverySinkAdapterStatus
  readonly readOnly: true
  readonly webResponseDeliveryAttempted: boolean
  readonly webResponseDelivered: boolean
  readonly uiIpcResponseDeliveryAllowed: boolean
  readonly electronIpcAllowed: false
  readonly electronResponseDeliveryAllowed: false
  readonly webUiBridgeAllowed: boolean
  readonly webResponseDeliveryAllowed: boolean
  readonly androidUiBridgeAllowed: false
  readonly androidResponseDeliveryAllowed: false
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
  readonly deliveryEnvelope?: ThirdPartyDataPackUiIpcResultEnvelope
  readonly acknowledgement?: ThirdPartyDataPackWebResponseDeliveryAcknowledgement
  readonly checks: readonly ThirdPartyDataPackWebResponseDeliverySinkAdapterCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackWebResponseDeliverySinkAdapterEffectSummary
}

export interface DeliverThirdPartyDataPackWebResponseDeliverySinkAdapterOptions {
  readonly platformSplitContract: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
  readonly host?: ThirdPartyDataPackWebResponseDeliverySinkHost
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
const webTransport: ThirdPartyDataPackUiIpcResponseDeliveryPlatformTransport =
  'web-ui-response-event-sink'

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
  value: object,
  fieldName: string
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnBooleanField = (
  value: object,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readOwnNumberField = (
  value: object,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

const everyOwnDataValueFalse = (value: object): boolean => {
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
    return descriptor?.enumerable !== true || ('value' in descriptor && descriptor.value === false)
  })
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
      ?? 'third-party.web-response-delivery-sink.diagnostic-copy',
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
  summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary | undefined,
  fallback: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => {
  const source = summary !== undefined && typeof summary === 'object' ? summary : fallback.summary
  return Object.freeze({
    selectedPackageCount: readOwnNumberField(source, 'selectedPackageCount') ?? clonePackageIds(fallback.selectedPackageIds).length,
    blockedPackageCount: readOwnNumberField(source, 'blockedPackageCount') ?? clonePackageIds(fallback.blockedPackageIds).length,
    blockedCandidateCount: readOwnNumberField(source, 'blockedCandidateCount') ?? fallback.blockedCandidateCount,
    loadOrderCount: readOwnNumberField(source, 'loadOrderCount') ?? clonePackageIds(fallback.loadOrder).length,
    registryCount: readOwnNumberField(source, 'registryCount') ?? fallback.registryCount,
    entryCount: readOwnNumberField(source, 'entryCount') ?? fallback.entryCount,
    packageCount: readOwnNumberField(source, 'packageCount') ?? fallback.packageCount,
    diagnosticCount: readOwnNumberField(source, 'diagnosticCount') ?? safeDiagnostics(fallback.diagnostics).length
  })
}

const cloneEnvelope = (
  envelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined,
  fallback: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
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
    summary: cloneSummary(readOwnDataField(envelope, 'summary') as ThirdPartyDataPackUiIpcResultEnvelopeSummary | undefined, fallback),
    diagnostics: safeDiagnostics(readOwnDataField(envelope, 'diagnostics') as readonly unknown[] | undefined)
  })
}

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const cloneAcknowledgement = (
  acknowledgement: unknown,
  envelope: ThirdPartyDataPackUiIpcResultEnvelope
): ThirdPartyDataPackWebResponseDeliveryAcknowledgement | undefined => {
  if (acknowledgement === null || typeof acknowledgement !== 'object') return undefined
  if (
    readOwnStringField(acknowledgement, 'status') !== 'acknowledged'
    || readOwnStringField(acknowledgement, 'channel') !== webTransport
    || readOwnStringField(acknowledgement, 'packageId') !== envelope.packageId
    || readOwnStringField(acknowledgement, 'envelopeKind') !== envelope.kind
    || readOwnStringField(acknowledgement, 'messageKey') !== envelope.messageKey
  ) {
    return undefined
  }
  return Object.freeze({
    status: 'acknowledged',
    channel: webTransport,
    packageId: envelope.packageId,
    envelopeKind: envelope.kind,
    messageKey: envelope.messageKey
  })
}

const findWebPlatformAdapter = (
  platformAdapters: readonly unknown[]
): ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter | undefined => {
  if (!Array.isArray(platformAdapters)) return undefined
  const length = readArrayLength(platformAdapters)
  if (length === undefined) return undefined

  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(platformAdapters, String(index))
    } catch {
      continue
    }
    const value = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (
      value !== null
      && typeof value === 'object'
      && readOwnStringField(value, 'platform') === 'web'
      && readOwnStringField(value, 'status') === 'deferred'
      && readOwnStringField(value, 'transport') === webTransport
    ) {
      return value as ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter
    }
  }
  return undefined
}

const upstreamEffectsIntact = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
): boolean => source.uiIpcResponseDeliveryAllowed === false
  && source.electronIpcAllowed === false
  && source.electronResponseDeliveryAllowed === false
  && source.webUiBridgeAllowed === false
  && source.webResponseDeliveryAllowed === false
  && source.androidUiBridgeAllowed === false
  && source.androidResponseDeliveryAllowed === false
  && source.startupGateHandoffAllowed === false
  && source.deliveryAcknowledgementAllowed === false
  && source.commandDispatchAllowed === false
  && source.transactionCommitAllowed === false
  && source.postCommitVerificationAllowed === false
  && source.runtimeEnablementAllowed === false
  && source.writeAllowed === false
  && source.rollbackRecoveryAllowed === false
  && everyOwnDataValueFalse(source.effects)

const check = (
  id: ThirdPartyDataPackWebResponseDeliverySinkAdapterCheckId,
  status: ThirdPartyDataPackWebResponseDeliverySinkAdapterCheck['status'],
  reason: string
): ThirdPartyDataPackWebResponseDeliverySinkAdapterCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackWebResponseDeliverySinkAdapterCheck[] => Object.freeze([
  'platform-split-deferred',
  'web-platform-contract-present',
  'path-free-envelope-present',
  'web-sink-host-ready',
  'fixed-web-channel',
  'no-upstream-delivery-effects',
  'delivery-acknowledgement-returned'
].map(id => check(
  id as ThirdPartyDataPackWebResponseDeliverySinkAdapterCheckId,
  'skipped',
  reason
)))

const preDeliveryChecks = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult,
  host: ThirdPartyDataPackWebResponseDeliverySinkHost | undefined,
  envelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined,
  webAdapter: ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter | undefined
): readonly ThirdPartyDataPackWebResponseDeliverySinkAdapterCheck[] => Object.freeze([
  check(
    'platform-split-deferred',
    source.status === 'deferred' ? 'satisfied' : 'blocked',
    'Web response delivery requires a deferred platform split contract.'
  ),
  check(
    'web-platform-contract-present',
    webAdapter !== undefined ? 'satisfied' : 'blocked',
    'Web response delivery requires the web-ui-response-event-sink platform contract.'
  ),
  check(
    'path-free-envelope-present',
    envelope !== undefined ? 'satisfied' : 'blocked',
    'Web response delivery can only send the cloned path-free delivery envelope.'
  ),
  check(
    'web-sink-host-ready',
    host !== undefined && typeof host.deliver === 'function' ? 'satisfied' : 'blocked',
    'A fixed injected Web sink host must be present before delivery is attempted.'
  ),
  check(
    'fixed-web-channel',
    host?.channel === webTransport ? 'satisfied' : 'blocked',
    'Web response delivery must use the fixed UI response event sink.'
  ),
  check(
    'no-upstream-delivery-effects',
    upstreamEffectsIntact(source) ? 'satisfied' : 'blocked',
    'The platform split source must not already contain delivery, runtime, read, write or rollback effects.'
  ),
  check(
    'delivery-acknowledgement-returned',
    'skipped',
    'Delivery acknowledgement is checked only after the Web sink host returns.'
  )
])

const checksWithAcknowledgement = (
  checks: readonly ThirdPartyDataPackWebResponseDeliverySinkAdapterCheck[],
  status: ThirdPartyDataPackWebResponseDeliverySinkAdapterCheck['status'],
  reason: string
): readonly ThirdPartyDataPackWebResponseDeliverySinkAdapterCheck[] => Object.freeze(checks.map(currentCheck =>
  currentCheck.id === 'delivery-acknowledgement-returned'
    ? check('delivery-acknowledgement-returned', status, reason)
    : currentCheck
))

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackWebResponseDeliverySinkAdapterCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.web-response-delivery-sink.checks.${currentCheck.id}`,
    packageId
  )))

const createEffectSummary = (
  envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined,
  delivered: boolean
): ThirdPartyDataPackWebResponseDeliverySinkAdapterEffectSummary => ({
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
  webUiResponsePublished: delivered,
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
  status: ThirdPartyDataPackWebResponseDeliverySinkAdapterStatus,
  reason: string,
  source: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult,
  checks: readonly ThirdPartyDataPackWebResponseDeliverySinkAdapterCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  deliveryEnvelope?: ThirdPartyDataPackUiIpcResultEnvelope,
  acknowledgement?: ThirdPartyDataPackWebResponseDeliveryAcknowledgement
): ThirdPartyDataPackWebResponseDeliverySinkAdapterResult => {
  const selectedPackageIds = clonePackageIds(source.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(source.blockedPackageIds)
  const loadOrder = clonePackageIds(source.loadOrder)
  const delivered = status === 'delivered' && acknowledgement !== undefined

  return deepFreezeObjectGraph({
    status,
    sourcePlatformSplitStatus: source.status,
    reason,
    webResponseDeliverySinkAdapter: status,
    readOnly: true,
    webResponseDeliveryAttempted: status === 'delivered' || checks.some(currentCheck =>
      currentCheck.id === 'delivery-acknowledgement-returned'
      && currentCheck.status === 'blocked'
    ),
    webResponseDelivered: delivered,
    uiIpcResponseDeliveryAllowed: delivered,
    electronIpcAllowed: false,
    electronResponseDeliveryAllowed: false,
    webUiBridgeAllowed: delivered,
    webResponseDeliveryAllowed: delivered,
    androidUiBridgeAllowed: false,
    androidResponseDeliveryAllowed: false,
    startupGateHandoffAllowed: false,
    deliveryAcknowledgementAllowed: delivered,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: source.requestedCommandId === 'install' ? 'install' as const : undefined,
    targetPackageId: source.targetPackageId,
    envelopeKind: deliveryEnvelope?.kind,
    messageKey: deliveryEnvelope?.messageKey,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: source.blockedCandidateCount,
    loadOrder,
    registryCount: source.registryCount,
    entryCount: source.entryCount,
    packageCount: source.packageCount,
    candidateIdentity: cloneCandidateIdentity(source.candidateIdentity),
    lockfileHash: source.lockfileHash,
    ...(deliveryEnvelope === undefined ? {} : { deliveryEnvelope }),
    ...(acknowledgement === undefined ? {} : { acknowledgement }),
    checks,
    diagnostics,
    summary: deliveryEnvelope?.summary ?? cloneSummary(source.summary, source),
    effects: createEffectSummary(deliveryEnvelope?.kind, delivered)
  })
}

export const deliverThirdPartyDataPackWebResponseDeliverySinkAdapter = async (
  options: DeliverThirdPartyDataPackWebResponseDeliverySinkAdapterOptions
): Promise<ThirdPartyDataPackWebResponseDeliverySinkAdapterResult> => {
  const source = options.platformSplitContract

  if (source.status === 'skipped') {
    return baseResult(
      'skipped',
      source.reason,
      source,
      skippedChecks(source.reason),
      [],
      undefined
    )
  }

  if (source.status === 'blocked') {
    return baseResult(
      'blocked',
      source.reason,
      source,
      skippedChecks(source.reason),
      safeDiagnostics(source.diagnostics),
      undefined
    )
  }

  const deliveryEnvelope = cloneEnvelope(source.deliveryEnvelope, source)
  const webAdapter = findWebPlatformAdapter(source.platformAdapters)
  const checks = preDeliveryChecks(source, options.host, deliveryEnvelope, webAdapter)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, source.targetPackageId)
  const sourceDiagnostics = safeDiagnostics(source.diagnostics)
  const envelopeDiagnostics = safeDiagnostics(deliveryEnvelope?.diagnostics)

  if (blockedDiagnostics.length > 0 || deliveryEnvelope === undefined || options.host === undefined) {
    return baseResult(
      'blocked',
      'Web response delivery sink inputs are inconsistent',
      source,
      checks,
      [
        ...sourceDiagnostics,
        ...envelopeDiagnostics,
        ...blockedDiagnostics
      ],
      undefined
    )
  }

  let rawAcknowledgement: unknown
  try {
    rawAcknowledgement = await options.host.deliver(deliveryEnvelope)
  } catch {
    const deliveryChecks = checksWithAcknowledgement(
      checks,
      'blocked',
      'The Web response delivery sink host threw before acknowledgement.'
    )
    return baseResult(
      'blocked',
      'Web response delivery sink host failed before acknowledgement',
      source,
      deliveryChecks,
      [
        ...sourceDiagnostics,
        ...envelopeDiagnostics,
        commandDiagnostic(
          'third-party.web-response-delivery-sink.host-failed',
          source.targetPackageId
        )
      ],
      deliveryEnvelope
    )
  }

  const acknowledgement = cloneAcknowledgement(rawAcknowledgement, deliveryEnvelope)
  if (acknowledgement === undefined) {
    const deliveryChecks = checksWithAcknowledgement(
      checks,
      'blocked',
      'The Web response delivery sink host did not return a matching acknowledgement.'
    )
    return baseResult(
      'blocked',
      'Web response delivery sink host returned an invalid acknowledgement',
      source,
      deliveryChecks,
      [
        ...sourceDiagnostics,
        ...envelopeDiagnostics,
        commandDiagnostic(
          'third-party.web-response-delivery-sink.acknowledgement-invalid',
          source.targetPackageId
        )
      ],
      deliveryEnvelope
    )
  }

  return baseResult(
    'delivered',
    'Web response delivery sink delivered the path-free envelope through the fixed injected UI response event sink host',
    source,
    checksWithAcknowledgement(
      checks,
      'satisfied',
      'The Web sink host returned a matching acknowledgement for the delivered envelope.'
    ),
    [
      ...sourceDiagnostics,
      ...envelopeDiagnostics
    ],
    deliveryEnvelope,
    acknowledgement
  )
}
