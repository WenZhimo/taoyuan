import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult,
  ThirdPartyDataPackUiIpcResponseDeliveryAdapterRequirementId,
  ThirdPartyDataPackUiIpcResponseDeliveryAdapterStageId
} from './thirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

export type ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackUiIpcResponseDeliveryPlatformId =
  | 'electron'
  | 'web'
  | 'android'

export type ThirdPartyDataPackUiIpcResponseDeliveryPlatformTransport =
  | 'electron-preload-response-channel'
  | 'web-ui-response-event-sink'
  | 'android-native-response-event-sink'

export type ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractCheckId =
  | 'response-delivery-preflight-deferred'
  | 'path-free-envelope-prepared'
  | 'install-command-envelope'
  | 'target-package-consistent'
  | 'platform-delivery-stages-deferred'
  | 'platform-delivery-requirements-present'
  | 'path-free-diagnostics-intact'
  | 'no-platform-delivery-effects-intact'

export interface ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractCheck {
  readonly id: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter {
  readonly platform: ThirdPartyDataPackUiIpcResponseDeliveryPlatformId
  readonly status: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractStatus
  readonly stageId: ThirdPartyDataPackUiIpcResponseDeliveryAdapterStageId
  readonly transport: ThirdPartyDataPackUiIpcResponseDeliveryPlatformTransport
  readonly requirementIds: readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterRequirementId[]
  readonly targetPackageId?: PackageId
  readonly envelopeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly messageKey?: string
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitEffectSummary {
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

export interface ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult {
  readonly status: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractStatus
  readonly sourcePreflightStatus: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult['status']
  readonly reason: string
  readonly uiIpcResponseDeliveryPlatformSplitContract: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractStatus
  readonly readOnly: true
  readonly platformSplitPrepared: boolean
  readonly uiIpcResponseDeliveryAllowed: false
  readonly electronIpcAllowed: false
  readonly electronResponseDeliveryAllowed: false
  readonly webUiBridgeAllowed: false
  readonly webResponseDeliveryAllowed: false
  readonly androidUiBridgeAllowed: false
  readonly androidResponseDeliveryAllowed: false
  readonly startupGateHandoffAllowed: false
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
  readonly checks: readonly ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly platformAdapters: readonly ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitEffectSummary
}

export interface BuildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractOptions {
  readonly responseDeliveryPreflight: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
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

const platformDefinitions: readonly {
  readonly platform: ThirdPartyDataPackUiIpcResponseDeliveryPlatformId
  readonly stageId: ThirdPartyDataPackUiIpcResponseDeliveryAdapterStageId
  readonly transport: ThirdPartyDataPackUiIpcResponseDeliveryPlatformTransport
  readonly requirementIds: readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterRequirementId[]
}[] = Object.freeze([
  {
    platform: 'electron',
    stageId: 'electron-response-delivery-adapter',
    transport: 'electron-preload-response-channel',
    requirementIds: ['electron-preload-response-channel', 'delivery-acknowledgement-source']
  },
  {
    platform: 'web',
    stageId: 'web-response-delivery-adapter',
    transport: 'web-ui-response-event-sink',
    requirementIds: ['web-ui-response-event-sink', 'delivery-acknowledgement-source']
  },
  {
    platform: 'android',
    stageId: 'android-response-delivery-adapter',
    transport: 'android-native-response-event-sink',
    requirementIds: ['android-native-response-event-sink', 'delivery-acknowledgement-source']
  }
])

const createEffectSummary = (): ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitEffectSummary => ({
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
      ?? 'third-party.ui-ipc-response-delivery-platform-split-contract.diagnostic-copy',
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
  source: ThirdPartyDataPackUiIpcResultEnvelopeSummary | undefined,
  fallback: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => {
  const value = source !== undefined && typeof source === 'object' ? source : fallback.summary
  return Object.freeze({
    selectedPackageCount: readOwnNumberField(value, 'selectedPackageCount') ?? clonePackageIds(fallback.selectedPackageIds).length,
    blockedPackageCount: readOwnNumberField(value, 'blockedPackageCount') ?? clonePackageIds(fallback.blockedPackageIds).length,
    blockedCandidateCount: readOwnNumberField(value, 'blockedCandidateCount') ?? fallback.blockedCandidateCount,
    loadOrderCount: readOwnNumberField(value, 'loadOrderCount') ?? clonePackageIds(fallback.loadOrder).length,
    registryCount: readOwnNumberField(value, 'registryCount') ?? fallback.registryCount,
    entryCount: readOwnNumberField(value, 'entryCount') ?? fallback.entryCount,
    packageCount: readOwnNumberField(value, 'packageCount') ?? fallback.packageCount,
    diagnosticCount: readOwnNumberField(value, 'diagnosticCount') ?? safeDiagnostics(fallback.diagnostics).length
  })
}

const cloneEnvelope = (
  envelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined,
  fallback: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
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

const hasOwnArrayObjectWithFields = (
  values: readonly unknown[],
  id: string,
  status: string
): boolean => {
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
    if (
      value !== undefined
      && value !== null
      && typeof value === 'object'
      && readOwnStringField(value, 'id') === id
      && readOwnStringField(value, 'status') === status
    ) {
      return true
    }
  }
  return false
}

const platformDeliveryStagesDeferred = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
): boolean => platformDefinitions.every(platform =>
  hasOwnArrayObjectWithFields(source.deliveryStages, platform.stageId, 'deferred')
)

const platformDeliveryRequirementsPresent = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
): boolean => platformDefinitions.every(platform =>
  platform.requirementIds.every(requirementId =>
    hasOwnArrayObjectWithFields(source.requiredDeliveryAdapters, requirementId, 'required')
  )
)

const pathFreeDiagnosticsIntact = (
  envelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined
): boolean => envelope !== undefined
  && safeDiagnostics(envelope.diagnostics).every(diagnostic =>
    !JSON.stringify(diagnostic).includes('C:/Users')
    && !JSON.stringify(diagnostic).includes('LENOVO')
    && !('file' in diagnostic)
    && !('fieldPath' in diagnostic)
    && !('details' in diagnostic)
  )

const noPlatformDeliveryEffectsIntact = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
): boolean => source.uiIpcResponseDeliveryAllowed === false
  && source.electronIpcAllowed === false
  && source.webUiBridgeAllowed === false
  && source.androidUiBridgeAllowed === false
  && source.startupGateHandoffAllowed === false
  && source.deliveryAcknowledgementAllowed === false
  && source.commandDispatchAllowed === false
  && source.transactionCommitAllowed === false
  && source.postCommitVerificationAllowed === false
  && source.runtimeEnablementAllowed === false
  && source.writeAllowed === false
  && source.rollbackRecoveryAllowed === false
  && everyOwnDataValueFalse(source.effects)

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const check = (
  id: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractCheckId,
  status: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractCheck['status'],
  reason: string
): ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractCheck[] => Object.freeze([
  'response-delivery-preflight-deferred',
  'path-free-envelope-prepared',
  'install-command-envelope',
  'target-package-consistent',
  'platform-delivery-stages-deferred',
  'platform-delivery-requirements-present',
  'path-free-diagnostics-intact',
  'no-platform-delivery-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractCheckId,
  'skipped',
  reason
)))

const buildChecks = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult,
  deliveryEnvelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined
): readonly ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractCheck[] => Object.freeze([
  check(
    'response-delivery-preflight-deferred',
    source.status === 'deferred' ? 'satisfied' : 'blocked',
    'Platform response delivery split requires a deferred response delivery adapter preflight.'
  ),
  check(
    'path-free-envelope-prepared',
    source.deliveryEnvelopePrepared === true && deliveryEnvelope !== undefined ? 'satisfied' : 'blocked',
    'Each platform sink contract must consume the same cloned path-free delivery envelope.'
  ),
  check(
    'install-command-envelope',
    source.requestedCommandId === 'install' && deliveryEnvelope?.commandId === 'install' ? 'satisfied' : 'blocked',
    'The first platform response delivery split only covers install result envelopes.'
  ),
  check(
    'target-package-consistent',
    source.targetPackageId !== undefined
      && deliveryEnvelope?.packageId === source.targetPackageId
      && clonePackageIds(source.selectedPackageIds).includes(source.targetPackageId)
      ? 'satisfied'
      : 'blocked',
    'Platform sink contracts must describe the same selected target package as the response delivery preflight.'
  ),
  check(
    'platform-delivery-stages-deferred',
    platformDeliveryStagesDeferred(source) ? 'satisfied' : 'blocked',
    'Electron, Web and Android response delivery stages must remain deferred until their real sinks are implemented.'
  ),
  check(
    'platform-delivery-requirements-present',
    platformDeliveryRequirementsPresent(source) ? 'satisfied' : 'blocked',
    'Each platform split contract must retain its explicit response-sink and acknowledgement requirements.'
  ),
  check(
    'path-free-diagnostics-intact',
    pathFreeDiagnosticsIntact(deliveryEnvelope) ? 'satisfied' : 'blocked',
    'Platform delivery diagnostics must stay redacted before any Electron, Web or Android response sink receives them.'
  ),
  check(
    'no-platform-delivery-effects-intact',
    noPlatformDeliveryEffectsIntact(source) ? 'satisfied' : 'blocked',
    'Platform splitting must not carry IPC, UI bridge, runtime, read, write, rollback or response-delivery effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.ui-ipc-response-delivery-platform-split-contract.checks.${currentCheck.id}`,
    packageId
  )))

const platformAdapters = (
  status: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractStatus,
  reason: string,
  deliveryEnvelope?: ThirdPartyDataPackUiIpcResultEnvelope
): readonly ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter[] => Object.freeze(platformDefinitions.map(platform =>
  Object.freeze({
    platform: platform.platform,
    status,
    stageId: platform.stageId,
    transport: platform.transport,
    requirementIds: status === 'deferred' ? Object.freeze([...platform.requirementIds]) : Object.freeze([]),
    targetPackageId: deliveryEnvelope?.packageId,
    envelopeKind: deliveryEnvelope?.kind,
    messageKey: deliveryEnvelope?.messageKey,
    reason
  })
))

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
  status: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractStatus,
  reason: string,
  source: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult,
  checks: readonly ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  deliveryEnvelope?: ThirdPartyDataPackUiIpcResultEnvelope
): ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult => {
  const selectedPackageIds = clonePackageIds(source.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(source.blockedPackageIds)
  const loadOrder = clonePackageIds(source.loadOrder)
  const resultSummary = deliveryEnvelope?.summary ?? cloneSummary(source.summary, source)

  return deepFreezeObjectGraph({
    status,
    sourcePreflightStatus: source.status,
    reason,
    uiIpcResponseDeliveryPlatformSplitContract: status,
    readOnly: true,
    platformSplitPrepared: status === 'deferred' && deliveryEnvelope !== undefined,
    uiIpcResponseDeliveryAllowed: false,
    electronIpcAllowed: false,
    electronResponseDeliveryAllowed: false,
    webUiBridgeAllowed: false,
    webResponseDeliveryAllowed: false,
    androidUiBridgeAllowed: false,
    androidResponseDeliveryAllowed: false,
    startupGateHandoffAllowed: false,
    deliveryAcknowledgementAllowed: false,
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
    checks,
    diagnostics,
    platformAdapters: platformAdapters(status, reason, deliveryEnvelope),
    summary: resultSummary,
    effects: createEffectSummary()
  })
}

export const buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract = (
  options: BuildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractOptions
): ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult => {
  const source = options.responseDeliveryPreflight

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
  const checks = buildChecks(source, deliveryEnvelope)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, source.targetPackageId)
  const sourceDiagnostics = safeDiagnostics(source.diagnostics)
  const envelopeDiagnostics = safeDiagnostics(deliveryEnvelope?.diagnostics)

  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'UI/IPC response delivery platform split inputs are inconsistent',
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

  return baseResult(
    'deferred',
    'UI/IPC response delivery platform split is inspect-only until Electron, Web and Android response sinks are implemented',
    source,
    checks,
    [
      ...sourceDiagnostics,
      ...envelopeDiagnostics
    ],
    deliveryEnvelope
  )
}
