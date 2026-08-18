import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_UI_IPC_RESULT_ENVELOPE_SOURCE_KIND =
  'third-party-ui-ipc-result-envelope-source'
export const THIRD_PARTY_DATA_PACK_UI_IPC_RESULT_ENVELOPE_SOURCE_MODE =
  'default-disabled-ui-ipc-result-envelope-source'

export type ThirdPartyDataPackUiIpcResultEnvelopeSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackUiIpcResultEnvelopeSourceEffectSummary {
  readonly uiIpcResultEnvelopeSourceCalled: boolean
  readonly uiIpcResultEnvelopeContractReaderCalled: boolean
  readonly resultEnvelopeContractAccepted: boolean
  readonly resultEnvelopeNormalized: boolean
  readonly responseDeliveryContinuationAllowed: boolean
  readonly successEnvelopeAccepted: boolean
  readonly failureEnvelopeAccepted: boolean
  readonly retryEnvelopeAccepted: boolean
  readonly rollbackEnvelopeAccepted: boolean
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
  readonly webFilePickerOpened: false
  readonly androidFilePickerOpened: false
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

export interface ThirdPartyDataPackUiIpcResultEnvelopeSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_UI_IPC_RESULT_ENVELOPE_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_UI_IPC_RESULT_ENVELOPE_SOURCE_MODE
  readonly status: ThirdPartyDataPackUiIpcResultEnvelopeSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly responseDeliveryContinuationAllowed: boolean
  readonly uiIpcResponseDeliveryAllowed: false
  readonly resultEnvelopeContractStatus?: ThirdPartyDataPackUiIpcResultEnvelopeContractResult['status']
  readonly sourcePreflightStatus?: ThirdPartyDataPackUiIpcResultEnvelopeContractResult['sourcePreflightStatus']
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly envelopeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly messageKey?: string
  readonly recovery: ModDiagnosticRecovery
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackUiIpcResultEnvelopeSourceEffectSummary
}

export interface CreateThirdPartyDataPackUiIpcResultEnvelopeSourceOptions {
  readonly enabled?: boolean
  readonly readUiIpcResultEnvelopeContract?: () => Awaitable<ThirdPartyDataPackUiIpcResultEnvelopeContractResult>
}

export class ThirdPartyDataPackUiIpcResultEnvelopeSourceBlockedError extends Error {
  readonly result: ThirdPartyDataPackUiIpcResultEnvelopeSourceResult

  constructor(result: ThirdPartyDataPackUiIpcResultEnvelopeSourceResult) {
    super('third-party UI/IPC result envelope source blocked response delivery continuation')
    this.name = 'ThirdPartyDataPackUiIpcResultEnvelopeSourceBlockedError'
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

const forbiddenContractSourceFields = [
  'preflight',
  'outcome',
  'rawOutcome',
  'resultNormalizationPreflight',
  'postCommitVerificationUiIpcOutcomeHandoff',
  'uiIpcOutcomeHandoff',
  'outcomeSource',
  'responseDeliveryPreflight',
  'platformSplitContract',
  'uiIpcResponseDeliveryOrchestrationHandoff',
  'deliveryEnvelope',
  'resultEnvelope',
  'electronHost',
  'electronIpcHost',
  'webHost',
  'webUiBridge',
  'androidHost',
  'androidNativeBridge',
  'capacitorBridge',
  'programDirectoryPath',
  'packageWriter',
  'packageFileWriter',
  'packageBackupWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
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

const forbiddenEnvelopeFields = [
  'preflight',
  'outcome',
  'rawOutcome',
  'responseDeliveryPreflight',
  'platformSplitContract',
  'deliveryEnvelope',
  'resultEnvelope',
  'electronHost',
  'electronIpcHost',
  'webHost',
  'webUiBridge',
  'androidHost',
  'androidNativeBridge',
  'capacitorBridge',
  'programDirectoryPath',
  'packageWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
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

const supportedOutcomeKind = (
  kind: string | undefined
): kind is ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind =>
  kind !== undefined && outcomeKinds.has(kind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind)

const safeRecovery = (
  value: string | undefined
): ModDiagnosticRecovery =>
  diagnosticRecoveries.has(value as ModDiagnosticRecovery) ? value as ModDiagnosticRecovery : 'none'

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
      ?? 'third-party.ui-ipc-result-envelope-source.diagnostic-copy',
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

const allOwnBooleanFlagsFalse = (
  value: object | undefined
): boolean => {
  if (value === undefined) return false
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
    return descriptor?.enumerable !== true
      || ('value' in descriptor && typeof descriptor.value === 'boolean' && descriptor.value === false)
  })
}

const envelopeObject = (
  source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult | undefined
): object | undefined => {
  const envelope = readOwnDataField(source, 'envelope')
  return envelope !== undefined && envelope !== null && typeof envelope === 'object' ? envelope : undefined
}

const pathFreeContractSource = (
  source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult
): boolean => forbiddenContractSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const pathFreeEnvelope = (
  envelope: object | undefined
): boolean => envelope !== undefined
  && forbiddenEnvelopeFields.every(fieldName => !hasOwnEnumerableField(envelope, fieldName))

const noRuntimeOrDeliveryDrift = (
  source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult
): boolean => readOwnBooleanField(source, 'uiIpcResponseDeliveryAllowed') === false
  && readOwnBooleanField(source, 'electronIpcAllowed') === false
  && readOwnBooleanField(source, 'webUiBridgeAllowed') === false
  && readOwnBooleanField(source, 'androidUiBridgeAllowed') === false
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'postCommitVerificationAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'rollbackRecoveryAllowed') === false
  && allOwnBooleanFlagsFalse(readOwnDataField(source, 'effects') as object | undefined)

const candidateIdentityMatches = (
  source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  envelope: object,
  kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): boolean => {
  const expected = readOwnStringField(
    readOwnDataField(source, 'candidateIdentity') as object | undefined,
    'candidateHash'
  )
  const actual = readOwnStringField(envelope, 'candidateHash')
  if (kind === 'success') return expected !== undefined && actual === expected
  return actual === undefined || (expected !== undefined && actual === expected)
}

const lockfileHashMatches = (
  source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  envelope: object,
  kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): boolean => {
  const expected = readOwnStringField(source, 'lockfileHash')
  const actual = readOwnStringField(envelope, 'lockfileHash')
  if (kind === 'success') return expected !== undefined && actual === expected
  return actual === undefined || actual === expected
}

const safeSkippedSource = (
  source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && readOwnStringField(source, 'resultEnvelopeContract') === 'skipped'
  && readOwnBooleanField(source, 'envelopeNormalized') === false
  && envelopeObject(source) === undefined
  && noRuntimeOrDeliveryDrift(source)
  && pathFreeContractSource(source)

const safeReadySource = (
  source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult
): boolean => {
  const envelope = envelopeObject(source)
  const kind = readOwnStringField(envelope, 'kind')
  const targetPackageId = readOwnStringField(source, 'targetPackageId')
  return readOwnStringField(source, 'status') === 'ready'
    && readOwnStringField(source, 'resultEnvelopeContract') === 'ready'
    && readOwnStringField(source, 'sourcePreflightStatus') === 'deferred'
    && readOwnBooleanField(source, 'envelopeNormalized') === true
    && readOwnStringField(source, 'requestedCommandId') === 'install'
    && targetPackageId !== undefined
    && clonePackageIds(readOwnDataField(source, 'selectedPackageIds')).includes(targetPackageId as PackageId)
    && readOwnNumberField(envelope, 'formatVersion') === 1
    && readOwnStringField(envelope, 'commandId') === 'install'
    && readOwnStringField(envelope, 'packageId') === targetPackageId
    && supportedOutcomeKind(kind)
    && candidateIdentityMatches(source, envelope as object, kind)
    && lockfileHashMatches(source, envelope as object, kind)
    && noRuntimeOrDeliveryDrift(source)
    && pathFreeContractSource(source)
    && pathFreeEnvelope(envelope)
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
  contractAccepted: boolean,
  continuationAllowed: boolean,
  envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined,
  source?: ThirdPartyDataPackUiIpcResultEnvelopeContractResult
): ThirdPartyDataPackUiIpcResultEnvelopeSourceEffectSummary => Object.freeze({
  uiIpcResultEnvelopeSourceCalled: true,
  uiIpcResultEnvelopeContractReaderCalled: sourceCalled,
  resultEnvelopeContractAccepted: contractAccepted,
  resultEnvelopeNormalized: contractAccepted && readOwnBooleanField(source, 'envelopeNormalized') === true,
  responseDeliveryContinuationAllowed: continuationAllowed,
  successEnvelopeAccepted: contractAccepted && envelopeKind === 'success',
  failureEnvelopeAccepted: contractAccepted && envelopeKind === 'failure',
  retryEnvelopeAccepted: contractAccepted && envelopeKind === 'retry',
  rollbackEnvelopeAccepted: contractAccepted && envelopeKind === 'rollback',
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
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
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
    readonly status: ThirdPartyDataPackUiIpcResultEnvelopeSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackUiIpcResultEnvelopeContractResult
    readonly diagnostics?: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  }
): ThirdPartyDataPackUiIpcResultEnvelopeSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const envelope = envelopeObject(options.source)
  const rawEnvelopeKind = readOwnStringField(envelope, 'kind')
  const envelopeKind = supportedOutcomeKind(rawEnvelopeKind) ? rawEnvelopeKind : undefined
  const continuationAllowed = options.status !== 'blocked'
  const contractAccepted = options.status === 'ready'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_UI_IPC_RESULT_ENVELOPE_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_UI_IPC_RESULT_ENVELOPE_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    responseDeliveryContinuationAllowed: continuationAllowed,
    uiIpcResponseDeliveryAllowed: false,
    resultEnvelopeContractStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackUiIpcResultEnvelopeContractResult['status']
      | undefined,
    sourcePreflightStatus: readOwnStringField(options.source, 'sourcePreflightStatus') as
      | ThirdPartyDataPackUiIpcResultEnvelopeContractResult['sourcePreflightStatus']
      | undefined,
    requestedCommandId: readOwnStringField(options.source, 'requestedCommandId') === 'install'
      ? 'install' as const
      : undefined,
    targetPackageId: readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined,
    envelopeKind,
    messageKey: readOwnStringField(envelope, 'messageKey'),
    recovery: safeRecovery(readOwnStringField(envelope, 'recovery')),
    retryable: readOwnBooleanField(envelope, 'retryable') ?? false,
    rollbackRequired: readOwnBooleanField(envelope, 'rollbackRequired') ?? false,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(options.source, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(options.source, 'candidateIdentity')),
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    diagnostics,
    summary: cloneSummary(readOwnDataField(options.source, 'summary'), diagnostics),
    effects: effectSummary(options.sourceCalled, contractAccepted, continuationAllowed, envelopeKind, options.source)
  })
}

const evaluateUiIpcResultEnvelopeSource = async(
  options: CreateThirdPartyDataPackUiIpcResultEnvelopeSourceOptions
): Promise<ThirdPartyDataPackUiIpcResultEnvelopeSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party UI/IPC result envelope source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readUiIpcResultEnvelopeContract === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party UI/IPC result envelope source is enabled without a result envelope contract reader',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.ui-ipc-result-envelope-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult
  try {
    source = await options.readUiIpcResultEnvelopeContract()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party UI/IPC result envelope contract reader failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.ui-ipc-result-envelope-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)

  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party UI/IPC result envelope is not required because the envelope contract was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeReadySource(source)) {
    return baseResult({
      status: 'ready',
      reason: 'third-party UI/IPC result envelope source accepted a path-free result envelope contract; real response delivery remains separate',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const envelope = envelopeObject(source)
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeContractSource(source) || !noRuntimeOrDeliveryDrift(source) || !pathFreeEnvelope(envelope)
      ? [
          commandDiagnostic(
            'third-party.ui-ipc-result-envelope-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.ui-ipc-result-envelope-source.envelope-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party UI/IPC result envelope source requires a safe result-envelope contract before response delivery continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackUiIpcResultEnvelopeSource = (
  options: CreateThirdPartyDataPackUiIpcResultEnvelopeSourceOptions = {}
): (() => Promise<ThirdPartyDataPackUiIpcResultEnvelopeSourceResult>) => async() => {
  const result = await evaluateUiIpcResultEnvelopeSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackUiIpcResultEnvelopeSourceBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackUiIpcResultEnvelopeSource =
  createThirdPartyDataPackUiIpcResultEnvelopeSource()
