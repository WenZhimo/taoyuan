import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult,
  ThirdPartyDataPackAtomicTransactionCommitExecutorHostMode
} from './thirdPartyDataPackAtomicTransactionCommitExecutorAdapter'
import type {
  ThirdPartyDataPackAtomicTransactionCommitOutcomeKind,
  ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic,
  ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary
} from './thirdPartyDataPackAtomicTransactionCommitOutcomeContract'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_ATOMIC_TRANSACTION_COMMIT_EXECUTOR_SOURCE_KIND =
  'third-party-atomic-transaction-commit-executor-source'
export const THIRD_PARTY_DATA_PACK_ATOMIC_TRANSACTION_COMMIT_EXECUTOR_SOURCE_MODE =
  'default-disabled-atomic-transaction-commit-executor-source'

export type ThirdPartyDataPackAtomicTransactionCommitExecutorSourceStatus =
  | 'executed'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackAtomicTransactionCommitExecutorHostStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope {
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
  readonly commitOutcomeKind: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
}

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorHostEffectSummary {
  readonly atomicCommitExecutorHostCalled: boolean
  readonly atomicCommitExecutorHostAccepted: boolean
  readonly transactionCommitted: false
  readonly transactionLogPrepared: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
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

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorHostResult {
  readonly status: ThirdPartyDataPackAtomicTransactionCommitExecutorHostStatus
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly commitOutcomeKind?: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackAtomicTransactionCommitExecutorHostEffectSummary
}

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorSourceEffectSummary {
  readonly atomicTransactionCommitExecutorSourceCalled: boolean
  readonly atomicTransactionCommitExecutorAdapterSourceCalled: boolean
  readonly injectedAtomicCommitAdapterExecuted: boolean
  readonly injectedCommitHostCalled: boolean
  readonly atomicCommitExecutorHostCalled: boolean
  readonly atomicCommitExecutorHostAccepted: boolean
  readonly commitOutcomeReceived: boolean
  readonly commitOutcomeNormalized: boolean
  readonly committedOutcomeReceived: boolean
  readonly failedOutcomeReceived: boolean
  readonly retryOutcomeReceived: boolean
  readonly rollbackOutcomeReceived: boolean
  readonly realAtomicCommitExecutorCalled: boolean
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
  readonly transactionLogPrepared: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
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

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ATOMIC_TRANSACTION_COMMIT_EXECUTOR_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ATOMIC_TRANSACTION_COMMIT_EXECUTOR_SOURCE_MODE
  readonly status: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly commandContinuationAllowed: boolean
  readonly atomicTransactionCommitExecutorAdapterStatus?: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult['status']
  readonly atomicTransactionCommitExecutorHostStatus?: ThirdPartyDataPackAtomicTransactionCommitExecutorHostStatus
  readonly sourcePreflightStatus?: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult['sourcePreflightStatus']
  readonly outcomeContractStatus?: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult['outcomeContractStatus']
  readonly atomicTransactionCommitExecutorHostMode?: ThirdPartyDataPackAtomicTransactionCommitExecutorHostMode
  readonly injectedExecutorHostMode?: ThirdPartyDataPackAtomicTransactionCommitExecutorHostMode
  readonly commitOutcomeKind?: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
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
  readonly diagnostics: readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary
  readonly effects: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceEffectSummary
}

export interface CreateThirdPartyDataPackAtomicTransactionCommitExecutorSourceOptions {
  readonly enabled?: boolean
  readonly readAtomicTransactionCommitExecutorAdapter?: () => Awaitable<ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult>
  readonly executeAtomicTransactionCommit?: (
    envelope: ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope
  ) => Awaitable<ThirdPartyDataPackAtomicTransactionCommitExecutorHostResult>
}

export class ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError extends Error {
  readonly result: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult

  constructor(result: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult) {
    super('third-party atomic transaction commit executor blocked command continuation')
    this.name = 'ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError'
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
  'atomicCommitExecutorCalled',
  'injectedCommitHostCalled',
  'commitOutcomeReceived',
  'committedOutcomeReceived',
  'failedOutcomeReceived',
  'retryOutcomeReceived',
  'rollbackOutcomeReceived'
])

const safeExecutorHostModes = new Set<string>([
  'injected-test-only',
  'electron-main-visible-import'
])

const forbiddenExecutorSourceFields = [
  'atomicCommitExecutorHost',
  'commitExecutorHost',
  'realCommitHost',
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

const forbiddenExecutorHostFields = [
  'atomicTransactionCommitExecutorAdapter',
  'atomicTransactionCommitExecutorPreflight',
  'commitRequest',
  'outcomeContract',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'atomicCommitExecutorHost',
  'commitExecutorHost',
  'realCommitHost',
  'packageWriter',
  'packageFileWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'recoveryLogStorage',
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
): ThirdPartyDataPackAtomicTransactionCommitExecutorHostMode | undefined => {
  const mode = readOwnStringField(source, 'atomicTransactionCommitExecutorHostMode')
    ?? readOwnStringField(source, 'injectedExecutorHostMode')
  return safeExecutorHostModes.has(mode ?? '')
    ? mode as ThirdPartyDataPackAtomicTransactionCommitExecutorHostMode
    : undefined
}

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic => {
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
      ?? 'third-party.atomic-transaction-commit-executor-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[] = []
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
): ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const emptySummary = (): ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary => Object.freeze({
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
): ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary => {
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

const pathFreeExecutorSource = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult
): boolean => forbiddenExecutorSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const effectGraphContainsNoPersistentWrite = (
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

const noPersistentWriteDrift = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult
): boolean => readSafeExecutorHostMode(source) !== undefined
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'runtimePublicationCommitAllowed') === false
  && readOwnBooleanField(source, 'postCommitVerificationAllowed') === false
  && readOwnBooleanField(source, 'uiIpcResponseAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'rollbackRecoveryAllowed') === false
  && effectGraphContainsNoPersistentWrite(readOwnDataField(source, 'effects') as object | undefined)

const safeSkippedSource = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && readOwnBooleanField(source, 'atomicCommitExecutionAllowed') === false
  && noPersistentWriteDrift(source)
  && pathFreeExecutorSource(source)

const safeExecutedSource = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult
): boolean => readOwnStringField(source, 'status') === 'executed'
  && readOwnStringField(source, 'sourcePreflightStatus') === 'deferred'
  && readOwnStringField(source, 'outcomeContractStatus') === 'ready'
  && readOwnBooleanField(source, 'commitHostCalled') === true
  && readOwnBooleanField(source, 'commitOutcomeReceived') === true
  && readOwnBooleanField(source, 'commitOutcomeNormalized') === true
  && readOwnBooleanField(source, 'atomicCommitExecutionAllowed') === true
  && noPersistentWriteDrift(source)
  && pathFreeExecutorSource(source)

const pathFreeExecutorHostResult = (
  hostResult: ThirdPartyDataPackAtomicTransactionCommitExecutorHostResult
): boolean => forbiddenExecutorHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

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
    if (key === 'atomicCommitExecutorHostCalled') return descriptor.value === true
    if (key === 'atomicCommitExecutorHostAccepted') return descriptor.value === accepted
    return descriptor.value === false
  })
}

const safeAcceptedHostResult = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult,
  hostResult: ThirdPartyDataPackAtomicTransactionCommitExecutorHostResult
): boolean => readOwnStringField(hostResult, 'status') === 'accepted'
  && readOwnStringField(hostResult, 'requestedCommandId') === 'install'
  && readOwnStringField(hostResult, 'targetPackageId') === readOwnStringField(source, 'targetPackageId')
  && readOwnStringField(hostResult, 'commitOutcomeKind') === readOutcomeKind(source)
  && readOwnStringField(hostResult, 'candidateHash') === cloneCandidateIdentity(
    readOwnDataField(source, 'candidateIdentity')
  )?.candidateHash
  && readOwnStringField(hostResult, 'lockfileHash') === readOwnStringField(source, 'lockfileHash')
  && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
  && pathFreeExecutorHostResult(hostResult)

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
  source?: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult,
  hostResult?: ThirdPartyDataPackAtomicTransactionCommitExecutorHostResult
): ThirdPartyDataPackAtomicTransactionCommitExecutorSourceEffectSummary => {
  const effects = readOwnDataField(source, 'effects') as object | undefined
  const hostEffects = readOwnDataField(hostResult, 'effects') as object | undefined
  return Object.freeze({
    atomicTransactionCommitExecutorSourceCalled: true,
    atomicTransactionCommitExecutorAdapterSourceCalled: sourceCalled,
    injectedAtomicCommitAdapterExecuted: readOwnStringField(source, 'status') === 'executed',
    injectedCommitHostCalled: readOwnBooleanField(effects, 'injectedCommitHostCalled') ?? false,
    atomicCommitExecutorHostCalled: readOwnBooleanField(hostEffects, 'atomicCommitExecutorHostCalled') ?? false,
    atomicCommitExecutorHostAccepted: readOwnBooleanField(hostEffects, 'atomicCommitExecutorHostAccepted') ?? false,
    commitOutcomeReceived: readOwnBooleanField(effects, 'commitOutcomeReceived') ?? false,
    commitOutcomeNormalized: readOwnBooleanField(source, 'commitOutcomeNormalized') ?? false,
    committedOutcomeReceived: readOwnBooleanField(effects, 'committedOutcomeReceived') ?? false,
    failedOutcomeReceived: readOwnBooleanField(effects, 'failedOutcomeReceived') ?? false,
    retryOutcomeReceived: readOwnBooleanField(effects, 'retryOutcomeReceived') ?? false,
    rollbackOutcomeReceived: readOwnBooleanField(effects, 'rollbackOutcomeReceived') ?? false,
    realAtomicCommitExecutorCalled:
      readOwnBooleanField(hostEffects, 'atomicCommitExecutorHostCalled') ?? false,
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
    transactionLogPrepared: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
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

const readOutcomeKind = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult | undefined
): ThirdPartyDataPackAtomicTransactionCommitOutcomeKind | undefined => {
  const outcomeContract = readOwnDataField(source, 'outcomeContract')
  const outcome = outcomeContract !== undefined && outcomeContract !== null && typeof outcomeContract === 'object'
    ? readOwnDataField(outcomeContract, 'outcome')
    : undefined
  return outcome !== undefined && outcome !== null && typeof outcome === 'object'
    ? readOwnStringField(outcome, 'kind') as ThirdPartyDataPackAtomicTransactionCommitOutcomeKind | undefined
    : undefined
}

const buildExecutorHostEnvelope = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult
): ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope => deepFreezeObjectGraph({
  requestedCommandId: 'install' as const,
  targetPackageId: readOwnStringField(source, 'targetPackageId') as PackageId,
  selectedPackageIds: clonePackageIds(readOwnDataField(source, 'selectedPackageIds')),
  blockedPackageIds: clonePackageIds(readOwnDataField(source, 'blockedPackageIds')),
  loadOrder: clonePackageIds(readOwnDataField(source, 'loadOrder')),
  registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
  entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
  packageCount: readOwnNumberField(source, 'packageCount') ?? 0,
  candidateIdentity: cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) as ThirdPartyCandidateIdentitySummary,
  lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash,
  commitOutcomeKind: readOutcomeKind(source) as ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
})

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult
    readonly hostResult?: ThirdPartyDataPackAtomicTransactionCommitExecutorHostResult
    readonly diagnostics?: readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[]
  }
): ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const executorHostMode = readSafeExecutorHostMode(options.source)

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_ATOMIC_TRANSACTION_COMMIT_EXECUTOR_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_ATOMIC_TRANSACTION_COMMIT_EXECUTOR_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    commandContinuationAllowed: options.status !== 'blocked',
    atomicTransactionCommitExecutorAdapterStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult['status']
      | undefined,
    atomicTransactionCommitExecutorHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackAtomicTransactionCommitExecutorHostStatus
      | undefined,
    sourcePreflightStatus: readOwnStringField(options.source, 'sourcePreflightStatus') as
      | ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult['sourcePreflightStatus']
      | undefined,
    outcomeContractStatus: readOwnStringField(options.source, 'outcomeContractStatus') as
      | ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult['outcomeContractStatus']
      | undefined,
    atomicTransactionCommitExecutorHostMode: executorHostMode,
    injectedExecutorHostMode: executorHostMode,
    commitOutcomeKind: readOutcomeKind(options.source),
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

const evaluateAtomicTransactionCommitExecutorSource = async(
  options: CreateThirdPartyDataPackAtomicTransactionCommitExecutorSourceOptions
): Promise<ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party atomic transaction commit executor source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readAtomicTransactionCommitExecutorAdapter === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party atomic transaction commit executor source is enabled without an executor adapter source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.atomic-transaction-commit-executor-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult
  try {
    source = await options.readAtomicTransactionCommitExecutorAdapter()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party atomic transaction commit executor adapter source failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.atomic-transaction-commit-executor-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)

  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party atomic transaction commit executor is not required because adapter source was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeExecutedSource(source)) {
    if (options.executeAtomicTransactionCommit !== undefined) {
      const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
      let hostResult: ThirdPartyDataPackAtomicTransactionCommitExecutorHostResult
      try {
        hostResult = await options.executeAtomicTransactionCommit(buildExecutorHostEnvelope(source))
      } catch {
        return baseResult({
          status: 'blocked',
          reason: 'third-party atomic transaction commit executor host failed before returning a safe result',
          enabled: true,
          sourceCalled: true,
          source,
          diagnostics: [
            ...sourceDiagnostics,
            commandDiagnostic(
              'third-party.atomic-transaction-commit-executor-source.commit-host-failed',
              targetPackageId
            )
          ]
        })
      }

      const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
      if (safeAcceptedHostResult(source, hostResult)) {
        return baseResult({
          status: 'executed',
          reason: 'third-party atomic transaction commit executor source accepted a path-free commit host result',
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
        reason: 'third-party atomic transaction commit executor host returned an unsafe or blocked result',
        enabled: true,
        sourceCalled: true,
        source,
        hostResult,
        diagnostics: [
          ...sourceDiagnostics,
          ...hostDiagnostics,
          ...(!pathFreeExecutorHostResult(hostResult)
            || !hostEffectsContained(
              readOwnDataField(hostResult, 'effects') as object | undefined,
              readOwnStringField(hostResult, 'status') === 'accepted'
            )
            ? [
                commandDiagnostic(
                  'third-party.atomic-transaction-commit-executor-source.unsafe-commit-host-result',
                  targetPackageId
                )
              ]
            : []),
          commandDiagnostic(
            'third-party.atomic-transaction-commit-executor-source.commit-host-blocked',
            targetPackageId
          )
        ]
      })
    }

    return baseResult({
      status: 'executed',
      reason: 'third-party atomic transaction commit executor source accepted a path-free adapter outcome',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeExecutorSource(source) || !noPersistentWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.atomic-transaction-commit-executor-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.atomic-transaction-commit-executor-source.executor-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party atomic transaction commit executor requires a future real-host boundary before command continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackAtomicTransactionCommitExecutorSource = (
  options: CreateThirdPartyDataPackAtomicTransactionCommitExecutorSourceOptions = {}
): (() => Promise<ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult>) => async() => {
  const result = await evaluateAtomicTransactionCommitExecutorSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackAtomicTransactionCommitExecutorSource =
  createThirdPartyDataPackAtomicTransactionCommitExecutorSource()
