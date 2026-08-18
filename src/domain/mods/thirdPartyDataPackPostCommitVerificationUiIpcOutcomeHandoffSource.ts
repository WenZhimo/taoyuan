import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from './thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_UI_IPC_OUTCOME_HANDOFF_SOURCE_KIND =
  'third-party-post-commit-verification-ui-ipc-outcome-handoff-source'
export const THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_UI_IPC_OUTCOME_HANDOFF_SOURCE_MODE =
  'default-disabled-post-commit-verification-ui-ipc-outcome-handoff-source'

export type ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceEffectSummary {
  readonly postCommitVerificationUiIpcOutcomeHandoffSourceCalled: boolean
  readonly postCommitVerificationUiIpcOutcomeHandoffReaderCalled: boolean
  readonly uiIpcOutcomeHandoffAccepted: boolean
  readonly uiIpcOutcomePrepared: boolean
  readonly resultEnvelopeContinuationAllowed: boolean
  readonly successOutcomeAccepted: boolean
  readonly failureOutcomeAccepted: boolean
  readonly retryOutcomeAccepted: boolean
  readonly rollbackOutcomeAccepted: boolean
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

export interface ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_UI_IPC_OUTCOME_HANDOFF_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_UI_IPC_OUTCOME_HANDOFF_SOURCE_MODE
  readonly status: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly resultEnvelopeContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly handoffStatus?: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult['status']
  readonly resultNormalizationPreflightStatus?: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult['resultNormalizationPreflightStatus']
  readonly atomicCommitOutcomeContractStatus?: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult['atomicCommitOutcomeContractStatus']
  readonly postCommitVerificationExecutorAdapterStatus?: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult['postCommitVerificationExecutorAdapterStatus']
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly outcomeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
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
  readonly effects: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceEffectSummary
}

export interface CreateThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceOptions {
  readonly enabled?: boolean
  readonly readPostCommitVerificationUiIpcOutcomeHandoff?: () => Awaitable<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult>
}

export class ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceBlockedError extends Error {
  readonly result: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceResult

  constructor(result: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceResult) {
    super('third-party post-commit verification UI/IPC outcome handoff source blocked result-envelope continuation')
    this.name = 'ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceBlockedError'
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

const forbiddenHandoffSourceFields = [
  'resultNormalizationPreflight',
  'atomicCommitOutcomeContract',
  'atomicCommitOutcome',
  'postCommitVerificationExecutorAdapter',
  'postCommitVerificationExecutor',
  'verificationExecutorAdapter',
  'verificationRequest',
  'resultEnvelopeContract',
  'responseDeliveryPreflight',
  'platformSplitContract',
  'deliveryEnvelope',
  'resultEnvelope',
  'uiIpcResponseDeliveryOrchestrationHandoff',
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

const allowedPreparedEffectFields = [
  'atomicCommitOutcomeConsumed',
  'postCommitVerificationOutcomeConsumed',
  'uiIpcOutcomePrepared'
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
      ?? 'third-party.post-commit-verification-ui-ipc-outcome-handoff-source.diagnostic-copy',
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
  source: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult,
  allowPreparedEffects: boolean
): boolean => readOwnBooleanField(source, 'uiIpcResponseDeliveryAllowed') === false
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'atomicCommitExecutionAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'runtimePublicationCommitAllowed') === false
  && readOwnBooleanField(source, 'postCommitVerificationAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'rollbackRecoveryAllowed') === false
  && allOwnBooleanFlagsFalse(
    readOwnDataField(source, 'effects') as object | undefined,
    allowPreparedEffects ? allowedPreparedEffectFields : []
  )

const pathFreeHandoffSource = (
  source: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
): boolean => forbiddenHandoffSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const pathFreeOutcomeObject = (
  outcome: object | undefined
): boolean => outcome !== undefined
  && forbiddenHandoffSourceFields.every(fieldName => !hasOwnEnumerableField(outcome, fieldName))

const outcomeObject = (
  source: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult | undefined
): object | undefined => {
  const outcome = readOwnDataField(source, 'outcome')
  return outcome !== undefined && outcome !== null && typeof outcome === 'object' ? outcome : undefined
}

const candidateIdentityMatches = (
  source: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult,
  outcome: object,
  kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): boolean => {
  const sourceCandidateHash = readOwnStringField(
    readOwnDataField(source, 'candidateIdentity') as object | undefined,
    'candidateHash'
  )
  const outcomeCandidateHash = readOwnStringField(
    readOwnDataField(outcome, 'candidateIdentity') as object | undefined,
    'candidateHash'
  )
  if (kind === 'success') return sourceCandidateHash !== undefined && outcomeCandidateHash === sourceCandidateHash
  return outcomeCandidateHash === undefined || (sourceCandidateHash !== undefined && outcomeCandidateHash === sourceCandidateHash)
}

const lockfileHashMatches = (
  source: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult,
  outcome: object,
  kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): boolean => {
  const sourceLockfileHash = readOwnStringField(source, 'lockfileHash')
  const outcomeLockfileHash = readOwnStringField(outcome, 'lockfileHash')
  if (kind === 'success') return sourceLockfileHash !== undefined && outcomeLockfileHash === sourceLockfileHash
  return outcomeLockfileHash === undefined || outcomeLockfileHash === sourceLockfileHash
}

const safeSkippedSource = (
  source: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && readOwnStringField(source, 'postCommitVerificationUiIpcOutcomeHandoff') === 'skipped'
  && readOwnBooleanField(source, 'uiIpcOutcomePrepared') === false
  && outcomeObject(source) === undefined
  && noRuntimeOrDeliveryDrift(source, false)
  && pathFreeHandoffSource(source)

const safeReadySource = (
  source: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
): boolean => {
  const outcome = outcomeObject(source)
  const kind = readOwnStringField(outcome, 'kind')
  const targetPackageId = readOwnStringField(source, 'targetPackageId')
  return readOwnStringField(source, 'status') === 'ready'
    && readOwnStringField(source, 'postCommitVerificationUiIpcOutcomeHandoff') === 'ready'
    && readOwnStringField(source, 'resultNormalizationPreflightStatus') === 'deferred'
    && readOwnStringField(source, 'atomicCommitOutcomeContractStatus') === 'ready'
    && readOwnStringField(source, 'postCommitVerificationExecutorAdapterStatus') === 'executed'
    && readOwnStringField(source, 'requestedCommandId') === 'install'
    && targetPackageId !== undefined
    && readOwnBooleanField(source, 'uiIpcOutcomePrepared') === true
    && supportedOutcomeKind(kind)
    && readOwnStringField(source, 'outcomeKind') === kind
    && outcome !== undefined
    && readOwnBooleanField(outcome, 'settled') === true
    && readOwnStringField(outcome, 'packageId') === targetPackageId
    && candidateIdentityMatches(source, outcome, kind)
    && lockfileHashMatches(source, outcome, kind)
    && noRuntimeOrDeliveryDrift(source, true)
    && pathFreeHandoffSource(source)
    && pathFreeOutcomeObject(outcome)
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
  handoffAccepted: boolean,
  continuationAllowed: boolean,
  outcomeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined,
  source?: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceEffectSummary => Object.freeze({
  postCommitVerificationUiIpcOutcomeHandoffSourceCalled: true,
  postCommitVerificationUiIpcOutcomeHandoffReaderCalled: sourceCalled,
  uiIpcOutcomeHandoffAccepted: handoffAccepted,
  uiIpcOutcomePrepared: handoffAccepted && readOwnBooleanField(source, 'uiIpcOutcomePrepared') === true,
  resultEnvelopeContinuationAllowed: continuationAllowed,
  successOutcomeAccepted: handoffAccepted && outcomeKind === 'success',
  failureOutcomeAccepted: handoffAccepted && outcomeKind === 'failure',
  retryOutcomeAccepted: handoffAccepted && outcomeKind === 'retry',
  rollbackOutcomeAccepted: handoffAccepted && outcomeKind === 'rollback',
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
    readonly status: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
    readonly diagnostics?: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  }
): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const outcome = outcomeObject(options.source)
  const rawOutcomeKind = readOwnStringField(outcome, 'kind')
  const outcomeKind = supportedOutcomeKind(rawOutcomeKind) ? rawOutcomeKind : undefined
  const continuationAllowed = options.status !== 'blocked'
  const handoffAccepted = options.status === 'ready'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_UI_IPC_OUTCOME_HANDOFF_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_UI_IPC_OUTCOME_HANDOFF_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    resultEnvelopeContinuationAllowed: continuationAllowed,
    uiIpcResultContinuationAllowed: continuationAllowed,
    handoffStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult['status']
      | undefined,
    resultNormalizationPreflightStatus: readOwnStringField(options.source, 'resultNormalizationPreflightStatus') as
      | ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult['resultNormalizationPreflightStatus']
      | undefined,
    atomicCommitOutcomeContractStatus: readOwnStringField(options.source, 'atomicCommitOutcomeContractStatus') as
      | ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult['atomicCommitOutcomeContractStatus']
      | undefined,
    postCommitVerificationExecutorAdapterStatus: readOwnStringField(options.source, 'postCommitVerificationExecutorAdapterStatus') as
      | ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult['postCommitVerificationExecutorAdapterStatus']
      | undefined,
    requestedCommandId: readOwnStringField(options.source, 'requestedCommandId') === 'install'
      ? 'install' as const
      : undefined,
    targetPackageId: readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined,
    outcomeKind,
    messageKey: readOwnStringField(options.source, 'messageKey') ?? readOwnStringField(outcome, 'messageKey'),
    recovery: safeRecovery(readOwnStringField(outcome, 'recovery')),
    retryable: readOwnBooleanField(outcome, 'retryable') ?? false,
    rollbackRequired: readOwnBooleanField(outcome, 'rollbackRequired') ?? false,
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
    effects: effectSummary(options.sourceCalled, handoffAccepted, continuationAllowed, outcomeKind, options.source)
  })
}

const evaluatePostCommitVerificationUiIpcOutcomeHandoffSource = async(
  options: CreateThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceOptions
): Promise<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit verification UI/IPC outcome handoff source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readPostCommitVerificationUiIpcOutcomeHandoff === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit verification UI/IPC outcome handoff source is enabled without a handoff reader',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-verification-ui-ipc-outcome-handoff-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
  try {
    source = await options.readPostCommitVerificationUiIpcOutcomeHandoff()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit verification UI/IPC outcome handoff reader failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-verification-ui-ipc-outcome-handoff-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)

  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit verification UI/IPC outcome handoff is not required because the handoff was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeReadySource(source)) {
    return baseResult({
      status: 'ready',
      reason: 'third-party post-commit verification UI/IPC outcome handoff source accepted a path-free outcome handoff; real result envelope and response delivery remain separate',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const outcome = outcomeObject(source)
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeHandoffSource(source) || !noRuntimeOrDeliveryDrift(source, true) || !pathFreeOutcomeObject(outcome)
      ? [
          commandDiagnostic(
            'third-party.post-commit-verification-ui-ipc-outcome-handoff-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.post-commit-verification-ui-ipc-outcome-handoff-source.handoff-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party post-commit verification UI/IPC outcome handoff source requires a future result envelope source boundary before UI/IPC result continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource = (
  options: CreateThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceOptions = {}
): (() => Promise<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceResult>) => async() => {
  const result = await evaluatePostCommitVerificationUiIpcOutcomeHandoffSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSourceBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource =
  createThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffSource()
