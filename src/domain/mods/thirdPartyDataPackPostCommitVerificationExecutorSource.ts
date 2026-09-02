import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult,
  ThirdPartyDataPackPostCommitVerificationExecutorHostMode,
  ThirdPartyDataPackPostCommitVerificationOutcomeKind,
  ThirdPartyDataPackPostCommitVerificationSafeDiagnostic,
  ThirdPartyDataPackPostCommitVerificationSummary
} from './thirdPartyDataPackPostCommitVerificationExecutorAdapter'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_EXECUTOR_SOURCE_KIND =
  'third-party-post-commit-verification-executor-source'
export const THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_EXECUTOR_SOURCE_MODE =
  'default-disabled-post-commit-verification-executor-source'

export type ThirdPartyDataPackPostCommitVerificationExecutorSourceStatus =
  | 'executed'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPostCommitVerificationExecutorHostStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackPostCommitVerificationExecutorHostEnvelope {
  readonly requestedCommandId: 'install'
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly verificationOutcomeKind: ThirdPartyDataPackPostCommitVerificationOutcomeKind
  readonly transactionLogMatched: boolean
  readonly packageStateMatched: boolean
  readonly settingsLockfileMatched: boolean
  readonly liveRegistryMatched: boolean
  readonly saveCacheIsolated: boolean
}

export interface ThirdPartyDataPackPostCommitVerificationExecutorHostEffectSummary {
  readonly postCommitVerificationExecutorHostCalled: boolean
  readonly postCommitVerificationExecutorHostAccepted: boolean
  readonly postCommitVerificationExecuted: false
  readonly transactionLogRead: false
  readonly packageStateRead: false
  readonly settingsRead: false
  readonly lockfileRead: false
  readonly liveRegistryRead: false
  readonly saveCacheIsolationChecked: false
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

export interface ThirdPartyDataPackPostCommitVerificationExecutorHostResult {
  readonly status: ThirdPartyDataPackPostCommitVerificationExecutorHostStatus
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly verificationOutcomeKind?: ThirdPartyDataPackPostCommitVerificationOutcomeKind
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly transactionLogMatched?: boolean
  readonly packageStateMatched?: boolean
  readonly settingsLockfileMatched?: boolean
  readonly liveRegistryMatched?: boolean
  readonly saveCacheIsolated?: boolean
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackPostCommitVerificationExecutorHostEffectSummary
}

export interface ThirdPartyDataPackPostCommitVerificationExecutorSourceEffectSummary {
  readonly postCommitVerificationExecutorSourceCalled: boolean
  readonly postCommitVerificationExecutorAdapterSourceCalled: boolean
  readonly injectedPostCommitVerificationAdapterExecuted: boolean
  readonly injectedVerificationHostCalled: boolean
  readonly postCommitVerificationExecutorHostCalled: boolean
  readonly postCommitVerificationExecutorHostAccepted: boolean
  readonly verificationOutcomeReceived: boolean
  readonly verificationOutcomeNormalized: boolean
  readonly verifiedOutcomeReceived: boolean
  readonly failedOutcomeReceived: boolean
  readonly retryOutcomeReceived: boolean
  readonly rollbackOutcomeReceived: boolean
  readonly realPostCommitVerificationExecutorCalled: false
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
  readonly transactionCommitted: false
  readonly postCommitVerificationExecuted: false
  readonly transactionLogRead: false
  readonly packageStateRead: false
  readonly settingsRead: false
  readonly lockfileRead: false
  readonly liveRegistryRead: false
  readonly saveCacheIsolationChecked: false
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

export interface ThirdPartyDataPackPostCommitVerificationExecutorSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_EXECUTOR_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_EXECUTOR_SOURCE_MODE
  readonly status: ThirdPartyDataPackPostCommitVerificationExecutorSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly commandContinuationAllowed: boolean
  readonly postCommitVerificationExecutorAdapterStatus?: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult['status']
  readonly postCommitVerificationExecutorHostStatus?: ThirdPartyDataPackPostCommitVerificationExecutorHostStatus
  readonly sourcePreflightStatus?: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult['sourcePreflightStatus']
  readonly postCommitVerificationExecutorHostMode?: ThirdPartyDataPackPostCommitVerificationExecutorHostMode
  readonly injectedExecutorHostMode?: ThirdPartyDataPackPostCommitVerificationExecutorHostMode
  readonly verificationOutcomeKind?: ThirdPartyDataPackPostCommitVerificationOutcomeKind
  readonly transactionLogMatched: boolean
  readonly packageStateMatched: boolean
  readonly settingsLockfileMatched: boolean
  readonly liveRegistryMatched: boolean
  readonly saveCacheIsolated: boolean
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackPostCommitVerificationSummary
  readonly effects: ThirdPartyDataPackPostCommitVerificationExecutorSourceEffectSummary
}

export interface CreateThirdPartyDataPackPostCommitVerificationExecutorSourceOptions {
  readonly enabled?: boolean
  readonly readPostCommitVerificationExecutorAdapter?: () => Awaitable<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult>
  readonly executePostCommitVerification?: (
    envelope: ThirdPartyDataPackPostCommitVerificationExecutorHostEnvelope
  ) => Awaitable<ThirdPartyDataPackPostCommitVerificationExecutorHostResult>
}

export class ThirdPartyDataPackPostCommitVerificationExecutorBlockedError extends Error {
  readonly result: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult

  constructor(result: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult) {
    super('third-party post-commit verification executor blocked command continuation')
    this.name = 'ThirdPartyDataPackPostCommitVerificationExecutorBlockedError'
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

const injectedEffectFields = new Set<string>([
  'postCommitVerificationExecutorCalled',
  'injectedVerificationHostCalled',
  'verificationOutcomeReceived',
  'verifiedOutcomeReceived',
  'failedOutcomeReceived',
  'retryOutcomeReceived',
  'rollbackOutcomeReceived'
])

const safeExecutorHostModes = new Set<string>([
  'injected-test-only',
  'electron-main-visible-import'
])

const forbiddenVerificationSourceFields = [
  'verificationHost',
  'postCommitVerificationHost',
  'realVerificationHost',
  'transactionLogReader',
  'packageStateReader',
  'settingsReader',
  'lockfileReader',
  'liveRegistryReader',
  'saveCacheReader',
  'packageWriter',
  'packageFileWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'recoveryLogStorage',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

const forbiddenVerificationHostFields = [
  'postCommitVerificationExecutorAdapter',
  'postCommitVerificationExecutorPreflight',
  'verificationRequest',
  'outcome',
  'verificationHost',
  'postCommitVerificationHost',
  'realVerificationHost',
  'transactionLogReader',
  'packageStateReader',
  'settingsReader',
  'lockfileReader',
  'liveRegistryReader',
  'saveCacheReader',
  'packageWriter',
  'packageFileWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'recoveryLogStorage',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
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

const readSafeExecutorHostMode = (
  source: object | undefined
): ThirdPartyDataPackPostCommitVerificationExecutorHostMode | undefined => {
  const mode = readOwnStringField(source, 'postCommitVerificationExecutorHostMode')
    ?? readOwnStringField(source, 'injectedExecutorHostMode')
  return safeExecutorHostModes.has(mode ?? '')
    ? mode as ThirdPartyDataPackPostCommitVerificationExecutorHostMode
    : undefined
}

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackPostCommitVerificationSafeDiagnostic => {
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
      ?? 'third-party.post-commit-verification-executor-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] = []
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
): ThirdPartyDataPackPostCommitVerificationSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const emptySummary = (): ThirdPartyDataPackPostCommitVerificationSummary => Object.freeze({
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
): ThirdPartyDataPackPostCommitVerificationSummary => {
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

const pathFreeVerificationSource = (
  source: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): boolean => forbiddenVerificationSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const effectGraphContainsNoPersistentReadWrite = (
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
    if (descriptor?.enumerable !== true) return true
    if (!('value' in descriptor)) return false
    if (injectedEffectFields.has(String(key))) return typeof descriptor.value === 'boolean'
    return descriptor.value === false
  })
}

const noPersistentReadWriteDrift = (
  source: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): boolean => readSafeExecutorHostMode(source) !== undefined
  && readOwnBooleanField(source, 'postCommitVerificationAllowed') === false
  && readOwnBooleanField(source, 'transactionLogReadAllowed') === false
  && readOwnBooleanField(source, 'packageStateReadAllowed') === false
  && readOwnBooleanField(source, 'settingsReadAllowed') === false
  && readOwnBooleanField(source, 'lockfileReadAllowed') === false
  && readOwnBooleanField(source, 'liveRegistryReadAllowed') === false
  && readOwnBooleanField(source, 'saveCacheIsolationCheckAllowed') === false
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'uiIpcResponseAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'rollbackRecoveryAllowed') === false
  && effectGraphContainsNoPersistentReadWrite(readOwnDataField(source, 'effects') as object | undefined)

const safeSkippedSource = (
  source: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && readOwnBooleanField(source, 'verificationExecutionAllowed') === false
  && noPersistentReadWriteDrift(source)
  && pathFreeVerificationSource(source)

const safeExecutedSource = (
  source: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): boolean => readOwnStringField(source, 'status') === 'executed'
  && readOwnStringField(source, 'sourcePreflightStatus') === 'deferred'
  && readOwnBooleanField(source, 'verificationHostCalled') === true
  && readOwnBooleanField(source, 'verificationOutcomeReceived') === true
  && readOwnBooleanField(source, 'verificationOutcomeNormalized') === true
  && readOwnBooleanField(source, 'verificationExecutionAllowed') === true
  && noPersistentReadWriteDrift(source)
  && pathFreeVerificationSource(source)

const pathFreeVerificationHostResult = (
  hostResult: ThirdPartyDataPackPostCommitVerificationExecutorHostResult
): boolean => forbiddenVerificationHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

const hostEffectsContained = (
  effects: object | undefined,
  accepted: boolean
): boolean => {
  if (effects === undefined) return false
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(effects)
  } catch {
    return false
  }
  return keys.every(key => {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(effects, key)
    } catch {
      return false
    }
    if (descriptor?.enumerable !== true) return true
    if (!('value' in descriptor)) return false
    if (key === 'postCommitVerificationExecutorHostCalled') return descriptor.value === true
    if (key === 'postCommitVerificationExecutorHostAccepted') return descriptor.value === accepted
    return descriptor.value === false
  })
}

const outcomeFlag = (
  source: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult,
  fieldName: string
): boolean => {
  const outcome = outcomeObject(source)
  return readOwnBooleanField(outcome, fieldName) ?? false
}

const readOutcomeKind = (
  source: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult | undefined
): ThirdPartyDataPackPostCommitVerificationOutcomeKind | undefined => {
  const outcome = outcomeObject(source)
  return readOwnStringField(outcome, 'kind') as ThirdPartyDataPackPostCommitVerificationOutcomeKind | undefined
}

const safeAcceptedHostResult = (
  source: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult,
  hostResult: ThirdPartyDataPackPostCommitVerificationExecutorHostResult
): boolean => readOwnStringField(hostResult, 'status') === 'accepted'
  && readOwnStringField(hostResult, 'requestedCommandId') === 'install'
  && readOwnStringField(hostResult, 'targetPackageId') === readOwnStringField(source, 'targetPackageId')
  && readOwnStringField(hostResult, 'verificationOutcomeKind') === readOutcomeKind(source)
  && readOwnStringField(hostResult, 'candidateHash') === cloneCandidateIdentity(
    readOwnDataField(source, 'candidateIdentity')
  )?.candidateHash
  && readOwnStringField(hostResult, 'lockfileHash') === readOwnStringField(source, 'lockfileHash')
  && readOwnBooleanField(hostResult, 'transactionLogMatched') === outcomeFlag(source, 'transactionLogMatched')
  && readOwnBooleanField(hostResult, 'packageStateMatched') === outcomeFlag(source, 'packageStateMatched')
  && readOwnBooleanField(hostResult, 'settingsLockfileMatched') === outcomeFlag(source, 'settingsLockfileMatched')
  && readOwnBooleanField(hostResult, 'liveRegistryMatched') === outcomeFlag(source, 'liveRegistryMatched')
  && readOwnBooleanField(hostResult, 'saveCacheIsolated') === outcomeFlag(source, 'saveCacheIsolated')
  && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
  && pathFreeVerificationHostResult(hostResult)

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
  source?: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult,
  hostResult?: ThirdPartyDataPackPostCommitVerificationExecutorHostResult
): ThirdPartyDataPackPostCommitVerificationExecutorSourceEffectSummary => {
  const effects = readOwnDataField(source, 'effects') as object | undefined
  const hostEffects = readOwnDataField(hostResult, 'effects') as object | undefined
  return Object.freeze({
    postCommitVerificationExecutorSourceCalled: true,
    postCommitVerificationExecutorAdapterSourceCalled: sourceCalled,
    injectedPostCommitVerificationAdapterExecuted: readOwnStringField(source, 'status') === 'executed',
    injectedVerificationHostCalled: readOwnBooleanField(effects, 'injectedVerificationHostCalled') ?? false,
    postCommitVerificationExecutorHostCalled:
      readOwnBooleanField(hostEffects, 'postCommitVerificationExecutorHostCalled') ?? false,
    postCommitVerificationExecutorHostAccepted:
      readOwnBooleanField(hostEffects, 'postCommitVerificationExecutorHostAccepted') ?? false,
    verificationOutcomeReceived: readOwnBooleanField(effects, 'verificationOutcomeReceived') ?? false,
    verificationOutcomeNormalized: readOwnBooleanField(source, 'verificationOutcomeNormalized') ?? false,
    verifiedOutcomeReceived: readOwnBooleanField(effects, 'verifiedOutcomeReceived') ?? false,
    failedOutcomeReceived: readOwnBooleanField(effects, 'failedOutcomeReceived') ?? false,
    retryOutcomeReceived: readOwnBooleanField(effects, 'retryOutcomeReceived') ?? false,
    rollbackOutcomeReceived: readOwnBooleanField(effects, 'rollbackOutcomeReceived') ?? false,
    realPostCommitVerificationExecutorCalled: false,
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
    transactionCommitted: false,
    postCommitVerificationExecuted: false,
    transactionLogRead: false,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveCacheIsolationChecked: false,
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
}

const outcomeObject = (
  source: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult | undefined
): object | undefined => {
  const outcome = readOwnDataField(source, 'outcome')
  return outcome !== undefined && outcome !== null && typeof outcome === 'object' ? outcome : undefined
}

const buildExecutorHostEnvelope = (
  source: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): ThirdPartyDataPackPostCommitVerificationExecutorHostEnvelope => {
  const outcome = outcomeObject(source) as object
  return deepFreezeObjectGraph({
    requestedCommandId: 'install' as const,
    targetPackageId: readOwnStringField(source, 'targetPackageId') as PackageId,
    selectedPackageIds: clonePackageIds(readOwnDataField(source, 'selectedPackageIds')),
    blockedPackageIds: clonePackageIds(readOwnDataField(source, 'blockedPackageIds')),
    loadOrder: clonePackageIds(readOwnDataField(source, 'loadOrder')),
    registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(source, 'packageCount') ?? 0,
    candidateIdentity: cloneCandidateIdentity(
      readOwnDataField(source, 'candidateIdentity')
    ) as ThirdPartyCandidateIdentitySummary,
    lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash,
    verificationOutcomeKind: readOwnStringField(outcome, 'kind') as ThirdPartyDataPackPostCommitVerificationOutcomeKind,
    transactionLogMatched: readOwnBooleanField(outcome, 'transactionLogMatched') ?? false,
    packageStateMatched: readOwnBooleanField(outcome, 'packageStateMatched') ?? false,
    settingsLockfileMatched: readOwnBooleanField(outcome, 'settingsLockfileMatched') ?? false,
    liveRegistryMatched: readOwnBooleanField(outcome, 'liveRegistryMatched') ?? false,
    saveCacheIsolated: readOwnBooleanField(outcome, 'saveCacheIsolated') ?? false
  })
}

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackPostCommitVerificationExecutorSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
    readonly hostResult?: ThirdPartyDataPackPostCommitVerificationExecutorHostResult
    readonly diagnostics?: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[]
  }
): ThirdPartyDataPackPostCommitVerificationExecutorSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const outcome = outcomeObject(options.source)
  const executorHostMode = readSafeExecutorHostMode(options.source)

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_EXECUTOR_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_EXECUTOR_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    commandContinuationAllowed: options.status !== 'blocked',
    postCommitVerificationExecutorAdapterStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult['status']
      | undefined,
    postCommitVerificationExecutorHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackPostCommitVerificationExecutorHostStatus
      | undefined,
    sourcePreflightStatus: readOwnStringField(options.source, 'sourcePreflightStatus') as
      | ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult['sourcePreflightStatus']
      | undefined,
    postCommitVerificationExecutorHostMode: executorHostMode,
    injectedExecutorHostMode: executorHostMode,
    verificationOutcomeKind: readOutcomeKind(options.source),
    transactionLogMatched: readOwnBooleanField(outcome, 'transactionLogMatched') ?? false,
    packageStateMatched: readOwnBooleanField(outcome, 'packageStateMatched') ?? false,
    settingsLockfileMatched: readOwnBooleanField(outcome, 'settingsLockfileMatched') ?? false,
    liveRegistryMatched: readOwnBooleanField(outcome, 'liveRegistryMatched') ?? false,
    saveCacheIsolated: readOwnBooleanField(outcome, 'saveCacheIsolated') ?? false,
    requestedCommandId: readOwnStringField(options.source, 'requestedCommandId') === 'install' ? 'install' as const : undefined,
    targetPackageId: readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined,
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
    effects: effectSummary(options.sourceCalled, options.source, options.hostResult)
  })
}

const evaluatePostCommitVerificationExecutorSource = async(
  options: CreateThirdPartyDataPackPostCommitVerificationExecutorSourceOptions
): Promise<ThirdPartyDataPackPostCommitVerificationExecutorSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit verification executor source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readPostCommitVerificationExecutorAdapter === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit verification executor source is enabled without an executor adapter source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-verification-executor-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
  try {
    source = await options.readPostCommitVerificationExecutorAdapter()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit verification executor adapter source failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-verification-executor-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)

  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit verification executor is not required because adapter source was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeExecutedSource(source)) {
    if (options.executePostCommitVerification !== undefined) {
      const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
      let hostResult: ThirdPartyDataPackPostCommitVerificationExecutorHostResult
      try {
        hostResult = await options.executePostCommitVerification(buildExecutorHostEnvelope(source))
      } catch {
        return baseResult({
          status: 'blocked',
          reason: 'third-party post-commit verification executor host failed before returning a safe result',
          enabled: true,
          sourceCalled: true,
          source,
          diagnostics: [
            ...sourceDiagnostics,
            commandDiagnostic(
              'third-party.post-commit-verification-executor-source.verification-host-failed',
              targetPackageId
            )
          ]
        })
      }

      const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
      if (safeAcceptedHostResult(source, hostResult)) {
        return baseResult({
          status: 'executed',
          reason: 'third-party post-commit verification executor source accepted a path-free verification host result',
          enabled: true,
          sourceCalled: true,
          source,
          hostResult,
          diagnostics: [
            ...sourceDiagnostics,
            ...hostDiagnostics
          ]
        })
      }

      return baseResult({
        status: 'blocked',
        reason: 'third-party post-commit verification executor host returned an unsafe or blocked result',
        enabled: true,
        sourceCalled: true,
        source,
        hostResult,
        diagnostics: [
          ...sourceDiagnostics,
          ...hostDiagnostics,
          ...(!pathFreeVerificationHostResult(hostResult)
            || !hostEffectsContained(
              readOwnDataField(hostResult, 'effects') as object | undefined,
              readOwnStringField(hostResult, 'status') === 'accepted'
            )
            ? [
                commandDiagnostic(
                  'third-party.post-commit-verification-executor-source.unsafe-verification-host-result',
                  targetPackageId
                )
              ]
            : []),
          commandDiagnostic(
            'third-party.post-commit-verification-executor-source.verification-host-blocked',
            targetPackageId
          )
        ]
      })
    }

    return baseResult({
      status: 'executed',
      reason: 'third-party post-commit verification executor source accepted a path-free adapter outcome',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeVerificationSource(source) || !noPersistentReadWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.post-commit-verification-executor-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.post-commit-verification-executor-source.executor-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party post-commit verification executor requires a future real-host boundary before command continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackPostCommitVerificationExecutorSource = (
  options: CreateThirdPartyDataPackPostCommitVerificationExecutorSourceOptions = {}
): (() => Promise<ThirdPartyDataPackPostCommitVerificationExecutorSourceResult>) => async() => {
  const result = await evaluatePostCommitVerificationExecutorSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackPostCommitVerificationExecutorBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackPostCommitVerificationExecutorSource =
  createThirdPartyDataPackPostCommitVerificationExecutorSource()
