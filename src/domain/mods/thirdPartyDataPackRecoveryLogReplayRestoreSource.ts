import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirementId,
  ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult,
  ThirdPartyDataPackRecoveryLogReplayRestoreStageId
} from './thirdPartyDataPackRecoveryLogReplayRestoreAdapter'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_RECOVERY_LOG_REPLAY_RESTORE_SOURCE_KIND =
  'third-party-recovery-log-replay-restore-source'
export const THIRD_PARTY_DATA_PACK_RECOVERY_LOG_REPLAY_RESTORE_SOURCE_MODE =
  'default-disabled-recovery-log-replay-restore-source'

export type ThirdPartyDataPackRecoveryLogReplayRestoreSourceStatus =
  | 'executed'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackRecoveryLogReplayRestoreHostStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackRecoveryLogReplayRestoreHostEnvelope {
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly recoveryLogReplayRestore: 'deferred'
  readonly replayRestoreStageIds: readonly ThirdPartyDataPackRecoveryLogReplayRestoreStageId[]
  readonly requiredReplayRestoreAdapterIds: readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirementId[]
}

export interface ThirdPartyDataPackRecoveryLogReplayRestoreHostEffectSummary {
  readonly recoveryLogReplayRestoreHostCalled: boolean
  readonly recoveryLogReplayRestoreHostAccepted: boolean
  readonly realRecoveryLogReplayRestoreCalled: boolean
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: boolean
  readonly lockfileWritten: false
  readonly lockfileRestored: false
  readonly settingsWritten: false
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: boolean
  readonly recoveryLogReplayed: boolean
  readonly rollbackExecuted: boolean
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackRecoveryLogReplayRestoreHostResult {
  readonly status: ThirdPartyDataPackRecoveryLogReplayRestoreHostStatus
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly replayRestoreStageIds?: readonly ThirdPartyDataPackRecoveryLogReplayRestoreStageId[]
  readonly requiredReplayRestoreAdapterIds?: readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirementId[]
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackRecoveryLogReplayRestoreHostEffectSummary
}

export interface ThirdPartyDataPackRecoveryLogReplayRestoreSourceStageSummary {
  readonly id: ThirdPartyDataPackRecoveryLogReplayRestoreStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
}

export interface ThirdPartyDataPackRecoveryLogReplayRestoreSourceSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackRecoveryLogReplayRestoreSourceEffectSummary {
  readonly recoveryLogReplayRestoreSourceCalled: boolean
  readonly recoveryLogReplayRestoreAdapterSourceCalled: boolean
  readonly recoveryLogReplayRestoreHostCalled: boolean
  readonly recoveryLogReplayRestoreHostAccepted: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly realRecoveryLogReplayRestoreCalled: boolean
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
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: boolean
  readonly lockfileWritten: false
  readonly lockfileRestored: false
  readonly settingsWritten: false
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: boolean
  readonly recoveryLogReplayed: boolean
  readonly rollbackExecuted: boolean
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_RECOVERY_LOG_REPLAY_RESTORE_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_RECOVERY_LOG_REPLAY_RESTORE_SOURCE_MODE
  readonly status: ThirdPartyDataPackRecoveryLogReplayRestoreSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly recoveryLogReplayRestoreAdapterStatus?: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult['status']
  readonly recoveryLogReplayRestoreHostStatus?: ThirdPartyDataPackRecoveryLogReplayRestoreHostStatus
  readonly publicationRollbackRecoveryStatus?: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult['publicationRollbackRecoveryStatus']
  readonly runtimePublicationCommitAdapterStatus?: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult['runtimePublicationCommitAdapterStatus']
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly replayRestoreStageSummaries: readonly ThirdPartyDataPackRecoveryLogReplayRestoreSourceStageSummary[]
  readonly requiredReplayRestoreAdapterIds: readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirementId[]
  readonly diagnostics: readonly ThirdPartyDataPackRecoveryLogReplayRestoreSourceSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackRecoveryLogReplayRestoreSourceEffectSummary
}

export interface CreateThirdPartyDataPackRecoveryLogReplayRestoreSourceOptions {
  readonly enabled?: boolean
  readonly readRecoveryLogReplayRestoreAdapter?: () => Awaitable<ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult>
  readonly executeRecoveryLogReplayRestore?: (
    envelope: ThirdPartyDataPackRecoveryLogReplayRestoreHostEnvelope
  ) => Awaitable<ThirdPartyDataPackRecoveryLogReplayRestoreHostResult>
}

export class ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError extends Error {
  readonly result: ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult

  constructor(result: ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult) {
    super('third-party recovery log replay restore blocked command continuation')
    this.name = 'ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError'
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

const forbiddenReplayRestoreSourceFields = [
  'publicationRollbackRecovery',
  'runtimePublicationCommitAdapter',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'recoveryLogReader',
  'recoveryLogStorage',
  'recoveryLogEntry',
  'packageRestoreAdapter',
  'settingsLockfileRestoreAdapter',
  'liveRegistryRestoreAdapter',
  'postRestoreVerificationAdapter',
  'recoveryHost',
  'rollbackHost',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'packageWriter',
  'packageFileWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

const forbiddenReplayRestoreHostFields = [
  'recoveryLogReplayRestoreAdapter',
  'publicationRollbackRecovery',
  'runtimePublicationCommitAdapter',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'recoveryLogReader',
  'recoveryLogStorage',
  'recoveryLogEntry',
  'packageRestoreAdapter',
  'settingsLockfileRestoreAdapter',
  'liveRegistryRestoreAdapter',
  'postRestoreVerificationAdapter',
  'recoveryHost',
  'rollbackHost',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'packageWriter',
  'packageFileWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
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
): ThirdPartyDataPackRecoveryLogReplayRestoreSourceSafeDiagnostic => {
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
      ?? 'third-party.recovery-log-replay-restore-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackRecoveryLogReplayRestoreSourceSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackRecoveryLogReplayRestoreSourceSafeDiagnostic[] = []
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
): ThirdPartyDataPackRecoveryLogReplayRestoreSourceSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

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

const safeStageSummaries = (
  stages: readonly unknown[] | undefined
): readonly ThirdPartyDataPackRecoveryLogReplayRestoreSourceStageSummary[] => {
  if (!Array.isArray(stages)) return Object.freeze([])
  const length = readArrayLength(stages)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackRecoveryLogReplayRestoreSourceStageSummary[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(stages, String(index))
    } catch {
      continue
    }
    if (
      descriptor?.enumerable === true
      && 'value' in descriptor
      && descriptor.value !== null
      && typeof descriptor.value === 'object'
    ) {
      const id = readOwnStringField(descriptor.value, 'id') as
        | ThirdPartyDataPackRecoveryLogReplayRestoreStageId
        | undefined
      const status = readOwnStringField(descriptor.value, 'status') as
        | ThirdPartyDataPackRecoveryLogReplayRestoreSourceStageSummary['status']
        | undefined
      if (id !== undefined && status !== undefined) {
        result.push(Object.freeze({ id, status }))
      }
    }
  }
  return Object.freeze(result)
}

const safeStageIds = (
  stages: readonly unknown[] | undefined
): readonly ThirdPartyDataPackRecoveryLogReplayRestoreStageId[] =>
  Object.freeze(safeStageSummaries(stages).map(stage => stage.id))

const safeRequiredReplayRestoreAdapterIds = (
  adapters: readonly unknown[] | undefined
): readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirementId[] => {
  if (!Array.isArray(adapters)) return Object.freeze([])
  const length = readArrayLength(adapters)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirementId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(adapters, String(index))
    } catch {
      continue
    }
    if (
      descriptor?.enumerable === true
      && 'value' in descriptor
      && descriptor.value !== null
      && typeof descriptor.value === 'object'
    ) {
      const id = readOwnStringField(descriptor.value, 'id')
      if (id !== undefined) result.push(id as ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirementId)
    }
  }
  return Object.freeze(result)
}

const readStringListField = (
  value: object | undefined,
  fieldName: string
): readonly string[] => Object.freeze(cloneStringList(readOwnDataField(value, fieldName)))

const sameStringList = (
  left: readonly string[],
  right: readonly string[]
): boolean => left.length === right.length && left.every((item, index) => item === right[index])

const everyOwnDataValueFalse = (
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
    return descriptor?.enumerable !== true || ('value' in descriptor && descriptor.value === false)
  })
}

const noReplayRestoreOrWriteDrift = (
  source: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
): boolean => readOwnStringField(source, 'recoveryLogReplayRestore') === 'deferred'
  && readOwnBooleanField(source, 'recoveryLogReplayAllowed') === false
  && readOwnBooleanField(source, 'persistentRestoreAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'liveRegistryMutable') === false
  && readOwnBooleanField(source, 'rollbackExecutionAllowed') === false
  && everyOwnDataValueFalse(readOwnDataField(source, 'effects') as object | undefined)

const pathFreeReplayRestoreSource = (
  source: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
): boolean => forbiddenReplayRestoreSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const safeSkippedSource = (
  source: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noReplayRestoreOrWriteDrift(source)
  && pathFreeReplayRestoreSource(source)

const safeDeferredSource = (
  source: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
): boolean => readOwnStringField(source, 'status') === 'deferred'
  && cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined
  && readOwnStringField(source, 'lockfileHash') !== undefined
  && safeStageIds(readOwnDataField(source, 'replayRestoreStages') as readonly unknown[] | undefined).length > 0
  && safeRequiredReplayRestoreAdapterIds(
    readOwnDataField(source, 'requiredReplayRestoreAdapters') as readonly unknown[] | undefined
  ).length > 0
  && noReplayRestoreOrWriteDrift(source)
  && pathFreeReplayRestoreSource(source)

const pathFreeReplayRestoreHostResult = (
  hostResult: ThirdPartyDataPackRecoveryLogReplayRestoreHostResult
): boolean => forbiddenReplayRestoreHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

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
    if (key === 'recoveryLogReplayRestoreHostCalled') return descriptor.value === true
    if (key === 'recoveryLogReplayRestoreHostAccepted') return descriptor.value === accepted
    if (
      key === 'realRecoveryLogReplayRestoreCalled'
      || key === 'packageFilesRestored'
      || key === 'recoveryLogRead'
      || key === 'recoveryLogReplayed'
      || key === 'rollbackExecuted'
    ) {
      return accepted
        ? typeof descriptor.value === 'boolean'
        : descriptor.value === false
    }
    return descriptor.value === false
  })
}

const safeAcceptedHostResult = (
  source: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult,
  hostResult: ThirdPartyDataPackRecoveryLogReplayRestoreHostResult
): boolean => {
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  const sourceStageIds = safeStageIds(readOwnDataField(source, 'replayRestoreStages') as readonly unknown[] | undefined)
  const sourceAdapterIds = safeRequiredReplayRestoreAdapterIds(
    readOwnDataField(source, 'requiredReplayRestoreAdapters') as readonly unknown[] | undefined
  )
  return readOwnStringField(hostResult, 'status') === 'accepted'
    && readOwnStringField(hostResult, 'candidateHash') === candidateIdentity?.candidateHash
    && readOwnStringField(hostResult, 'lockfileHash') === readOwnStringField(source, 'lockfileHash')
    && sameStringList(readStringListField(hostResult, 'replayRestoreStageIds'), sourceStageIds)
    && sameStringList(readStringListField(hostResult, 'requiredReplayRestoreAdapterIds'), sourceAdapterIds)
    && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
    && pathFreeReplayRestoreHostResult(hostResult)
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

const buildReplayRestoreHostEnvelope = (
  source: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
): ThirdPartyDataPackRecoveryLogReplayRestoreHostEnvelope => deepFreezeObjectGraph({
  selectedPackageIds: clonePackageIds(readOwnDataField(source, 'selectedPackageIds')),
  blockedPackageIds: clonePackageIds(readOwnDataField(source, 'blockedPackageIds')),
  loadOrder: clonePackageIds(readOwnDataField(source, 'loadOrder')),
  registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
  entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
  packageCount: readOwnNumberField(source, 'packageCount') ?? 0,
  candidateIdentity: cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) as ThirdPartyCandidateIdentitySummary,
  lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash,
  recoveryLogReplayRestore: 'deferred' as const,
  replayRestoreStageIds: safeStageIds(
    readOwnDataField(source, 'replayRestoreStages') as readonly unknown[] | undefined
  ),
  requiredReplayRestoreAdapterIds: safeRequiredReplayRestoreAdapterIds(
    readOwnDataField(source, 'requiredReplayRestoreAdapters') as readonly unknown[] | undefined
  )
})

const effectSummary = (
  sourceCalled: boolean,
  appBootstrapContinuationAllowed: boolean,
  commandContinuationAllowed: boolean,
  hostResult?: ThirdPartyDataPackRecoveryLogReplayRestoreHostResult
): ThirdPartyDataPackRecoveryLogReplayRestoreSourceEffectSummary => {
  const hostEffects = readOwnDataField(hostResult, 'effects') as object | undefined
  const recoveryEffectsAllowed = commandContinuationAllowed === true
  return Object.freeze({
    recoveryLogReplayRestoreSourceCalled: true,
    recoveryLogReplayRestoreAdapterSourceCalled: sourceCalled,
    recoveryLogReplayRestoreHostCalled:
      readOwnBooleanField(hostEffects, 'recoveryLogReplayRestoreHostCalled') ?? false,
    recoveryLogReplayRestoreHostAccepted:
      readOwnBooleanField(hostEffects, 'recoveryLogReplayRestoreHostAccepted') ?? false,
    appBootstrapContinuationAllowed,
    commandContinuationAllowed,
    realRecoveryLogReplayRestoreCalled: recoveryEffectsAllowed
      && readOwnBooleanField(hostEffects, 'realRecoveryLogReplayRestoreCalled') === true,
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
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
    uiIpcResponseDelivered: false,
    packageFilesWritten: false,
    packageBackupsWritten: false,
    packageFilesRestored: recoveryEffectsAllowed
      && readOwnBooleanField(hostEffects, 'packageFilesRestored') === true,
    lockfileWritten: false,
    lockfileRestored: false,
    settingsWritten: false,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    recoveryLogRead: recoveryEffectsAllowed
      && readOwnBooleanField(hostEffects, 'recoveryLogRead') === true,
    recoveryLogReplayed: recoveryEffectsAllowed
      && readOwnBooleanField(hostEffects, 'recoveryLogReplayed') === true,
    rollbackExecuted: recoveryEffectsAllowed
      && readOwnBooleanField(hostEffects, 'rollbackExecuted') === true,
    diagnosticsWritten: false
  })
}

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackRecoveryLogReplayRestoreSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
    readonly hostResult?: ThirdPartyDataPackRecoveryLogReplayRestoreHostResult
    readonly diagnostics?: readonly ThirdPartyDataPackRecoveryLogReplayRestoreSourceSafeDiagnostic[]
  }
): ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const appBootstrapContinuationAllowed = options.status === 'skipped'
  const commandContinuationAllowed = options.status === 'executed'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_RECOVERY_LOG_REPLAY_RESTORE_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_RECOVERY_LOG_REPLAY_RESTORE_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed,
    commandContinuationAllowed,
    recoveryLogReplayRestoreAdapterStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult['status']
      | undefined,
    recoveryLogReplayRestoreHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackRecoveryLogReplayRestoreHostStatus
      | undefined,
    publicationRollbackRecoveryStatus: readOwnStringField(options.source, 'publicationRollbackRecoveryStatus') as
      | ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult['publicationRollbackRecoveryStatus']
      | undefined,
    runtimePublicationCommitAdapterStatus: readOwnStringField(options.source, 'runtimePublicationCommitAdapterStatus') as
      | ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult['runtimePublicationCommitAdapterStatus']
      | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidatePaths,
    loadOrder,
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(options.source, 'candidateIdentity')),
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    replayRestoreStageSummaries: safeStageSummaries(
      readOwnDataField(options.source, 'replayRestoreStages') as readonly unknown[] | undefined
    ),
    requiredReplayRestoreAdapterIds: safeRequiredReplayRestoreAdapterIds(
      readOwnDataField(options.source, 'requiredReplayRestoreAdapters') as readonly unknown[] | undefined
    ),
    diagnostics,
    effects: effectSummary(
      options.sourceCalled,
      appBootstrapContinuationAllowed,
      commandContinuationAllowed,
      options.hostResult
    )
  })
}

const evaluateRecoveryLogReplayRestoreSource = async(
  options: CreateThirdPartyDataPackRecoveryLogReplayRestoreSourceOptions
): Promise<ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party recovery log replay restore source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readRecoveryLogReplayRestoreAdapter === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party recovery log replay restore source is enabled without a replay restore adapter source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.recovery-log-replay-restore-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
  try {
    source = await options.readRecoveryLogReplayRestoreAdapter()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party recovery log replay restore adapter source failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.recovery-log-replay-restore-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party recovery log replay restore is not required because adapter source was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeDeferredSource(source)) {
    const targetPackageId = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))[0]
    if (options.executeRecoveryLogReplayRestore === undefined) {
      return baseResult({
        status: 'blocked',
        reason: 'third-party recovery log replay restore source is enabled without a recovery host',
        enabled: true,
        sourceCalled: true,
        source,
        diagnostics: [
          ...sourceDiagnostics,
          commandDiagnostic(
            'third-party.recovery-log-replay-restore-source.missing-recovery-host',
            targetPackageId
          )
        ]
      })
    }

    let hostResult: ThirdPartyDataPackRecoveryLogReplayRestoreHostResult
    try {
      hostResult = await options.executeRecoveryLogReplayRestore(buildReplayRestoreHostEnvelope(source))
    } catch {
      return baseResult({
        status: 'blocked',
        reason: 'third-party recovery log replay restore host failed before returning a safe result',
        enabled: true,
        sourceCalled: true,
        source,
        diagnostics: [
          ...sourceDiagnostics,
          commandDiagnostic(
            'third-party.recovery-log-replay-restore-source.recovery-host-failed',
            targetPackageId
          )
        ]
      })
    }

    const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
    if (safeAcceptedHostResult(source, hostResult)) {
      return baseResult({
        status: 'executed',
        reason: 'third-party recovery log replay restore source accepted contained recovery host evidence',
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
      reason: 'third-party recovery log replay restore host returned an unsafe or blocked result',
      enabled: true,
      sourceCalled: true,
      source,
      hostResult,
      diagnostics: [
        ...sourceDiagnostics,
        ...hostDiagnostics,
        ...(!pathFreeReplayRestoreHostResult(hostResult)
          || !hostEffectsContained(
            readOwnDataField(hostResult, 'effects') as object | undefined,
            readOwnStringField(hostResult, 'status') === 'accepted'
          )
          ? [
              commandDiagnostic(
                'third-party.recovery-log-replay-restore-source.unsafe-recovery-host-result',
                targetPackageId
              )
            ]
          : []),
        commandDiagnostic(
          'third-party.recovery-log-replay-restore-source.recovery-host-blocked',
          targetPackageId
        )
      ]
    })
  }

  const targetPackageId = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))[0]
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeReplayRestoreSource(source) || !noReplayRestoreOrWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.recovery-log-replay-restore-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.recovery-log-replay-restore-source.recovery-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party recovery log replay restore requires a future real-host recovery boundary before command continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackRecoveryLogReplayRestoreSource = (
  options: CreateThirdPartyDataPackRecoveryLogReplayRestoreSourceOptions = {}
): (() => Promise<ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult>) => async() => {
  const result = await evaluateRecoveryLogReplayRestoreSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackRecoveryLogReplayRestoreSource =
  createThirdPartyDataPackRecoveryLogReplayRestoreSource()
