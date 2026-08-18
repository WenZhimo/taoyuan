import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallTransactionWriteProbeEvidence
} from './thirdPartyDataPackInstallTransactionDispatchPlan'
import type {
  ThirdPartyDataPackPackageFileStagingHostStatus
} from './thirdPartyDataPackPackageFileStagingSource'
import type {
  ThirdPartyDataPackSettingsLockfileCommitHostStatus,
  ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from './thirdPartyDataPackSettingsLockfileCommitSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READS_SOURCE_KIND =
  'third-party-post-commit-persistent-reads-source'
export const THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READS_SOURCE_MODE =
  'default-disabled-post-commit-persistent-reads-source'

export type ThirdPartyDataPackPostCommitPersistentReadsSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPostCommitPersistentReadsHostStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackPostCommitPersistentReadsProofs {
  readonly transactionLogCommitted: boolean
  readonly packageStateMatched: boolean
  readonly settingsStateMatched: boolean
  readonly modLockStateMatched: boolean
  readonly liveRegistryMatched: boolean
  readonly saveCacheIsolated: boolean
}

export interface ThirdPartyDataPackPostCommitPersistentReadsHostEnvelope {
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
  readonly packageFileStagingHostStatus: ThirdPartyDataPackPackageFileStagingHostStatus
  readonly settingsLockfileCommitHostStatus: ThirdPartyDataPackSettingsLockfileCommitHostStatus
  readonly writeProbeEvidence: ThirdPartyDataPackInstallTransactionWriteProbeEvidence
}

export interface ThirdPartyDataPackPostCommitPersistentReadsHostEffectSummary {
  readonly postCommitPersistentReadsHostCalled: boolean
  readonly postCommitPersistentReadsHostAccepted: boolean
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

export interface ThirdPartyDataPackPostCommitPersistentReadsHostResult {
  readonly status: ThirdPartyDataPackPostCommitPersistentReadsHostStatus
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds?: readonly PackageId[]
  readonly blockedPackageIds?: readonly PackageId[]
  readonly loadOrder?: readonly PackageId[]
  readonly registryCount?: number
  readonly entryCount?: number
  readonly packageCount?: number
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly packageFileStagingHostStatus?: ThirdPartyDataPackPackageFileStagingHostStatus
  readonly settingsLockfileCommitHostStatus?: ThirdPartyDataPackSettingsLockfileCommitHostStatus
  readonly modLockWriteProbeStatus?: ThirdPartyDataPackInstallTransactionWriteProbeEvidence['modLockWriteProbeStatus']
  readonly transactionLogWriteProbeStatus?: ThirdPartyDataPackInstallTransactionWriteProbeEvidence['transactionLogWriteProbeStatus']
  readonly modLockPersistentWriteExecuted?: boolean
  readonly transactionLogPersistentWriteExecuted?: boolean
  readonly persistentReadProofs?: ThirdPartyDataPackPostCommitPersistentReadsProofs
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackPostCommitPersistentReadsHostEffectSummary
}

export interface ThirdPartyDataPackPostCommitPersistentReadsSourceEffectSummary {
  readonly postCommitPersistentReadsSourceCalled: boolean
  readonly settingsLockfileCommitSourceCalled: boolean
  readonly settingsLockfileCommitHostAccepted: boolean
  readonly injectedPostCommitPersistentReadsHostCalled: boolean
  readonly postCommitPersistentReadsHostCalled: boolean
  readonly postCommitPersistentReadsHostAccepted: boolean
  readonly persistentReadProofAccepted: boolean
  readonly realPostCommitPersistentReadsHostCalled: false
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
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
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly transactionLogRead: false
  readonly packageStateRead: false
  readonly settingsRead: false
  readonly lockfileRead: false
  readonly liveRegistryRead: false
  readonly saveCacheIsolationChecked: false
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

export interface ThirdPartyDataPackPostCommitPersistentReadsSourceSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackPostCommitPersistentReadsSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READS_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READS_SOURCE_MODE
  readonly status: ThirdPartyDataPackPostCommitPersistentReadsSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly settingsLockfileCommitSourceStatus?: ThirdPartyDataPackSettingsLockfileCommitSourceResult['status']
  readonly packageFileStagingHostStatus?: ThirdPartyDataPackPackageFileStagingHostStatus
  readonly settingsLockfileCommitHostStatus?: ThirdPartyDataPackSettingsLockfileCommitHostStatus
  readonly postCommitPersistentReadsHostStatus?: ThirdPartyDataPackPostCommitPersistentReadsHostStatus
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly writeProbeEvidence: ThirdPartyDataPackInstallTransactionWriteProbeEvidence
  readonly persistentReadProofs?: ThirdPartyDataPackPostCommitPersistentReadsProofs
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitPersistentReadsSourceSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackPostCommitPersistentReadsSourceEffectSummary
}

export interface CreateThirdPartyDataPackPostCommitPersistentReadsSourceOptions {
  readonly enabled?: boolean
  readonly readSettingsLockfileCommitSource?: () => Awaitable<ThirdPartyDataPackSettingsLockfileCommitSourceResult>
  readonly readPostCommitPersistentState?: (
    envelope: ThirdPartyDataPackPostCommitPersistentReadsHostEnvelope
  ) => Awaitable<ThirdPartyDataPackPostCommitPersistentReadsHostResult>
}

export class ThirdPartyDataPackPostCommitPersistentReadsBlockedError extends Error {
  readonly result: ThirdPartyDataPackPostCommitPersistentReadsSourceResult

  constructor(result: ThirdPartyDataPackPostCommitPersistentReadsSourceResult) {
    super('third-party post-commit persistent reads blocked command continuation')
    this.name = 'ThirdPartyDataPackPostCommitPersistentReadsBlockedError'
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

const allowedSettingsLockfileCommitEffectFields = new Set<string>([
  'settingsLockfileCommitSourceCalled',
  'packageFileStagingSourceCalled',
  'injectedSettingsLockfileCommitHostCalled',
  'settingsLockfileCommitHostCalled',
  'settingsLockfileCommitHostAccepted',
  'realSettingsLockfileCommitHostCalled',
  'appBootstrapContinuationAllowed',
  'commandContinuationAllowed'
])

const forbiddenPersistentReadsSourceFields = [
  'settingsLockfileCommitSource',
  'settingsLockfileCommitHost',
  'postCommitPersistentReadsHost',
  'persistentReadsHost',
  'persistentReadHost',
  'persistentStateHost',
  'transactionLogReader',
  'packageStateReader',
  'settingsReader',
  'lockfileReader',
  'modLockReader',
  'liveRegistryReader',
  'saveCacheReader',
  'packageWriter',
  'packageFileWriter',
  'packageBackupWriter',
  'packageRestoreAdapter',
  'settingsWriter',
  'lockfileWriter',
  'modLockWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'settingsStorage',
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

const forbiddenPersistentReadsHostFields = [
  'settingsLockfileCommitSource',
  'settingsLockfileCommitHost',
  'postCommitPersistentReadsRequest',
  'postCommitPersistentReadsHost',
  'persistentReadsHost',
  'persistentReadHost',
  'persistentStateHost',
  'transactionLogReader',
  'packageStateReader',
  'settingsReader',
  'lockfileReader',
  'modLockReader',
  'liveRegistryReader',
  'saveCacheReader',
  'packageWriter',
  'packageFileWriter',
  'packageBackupWriter',
  'packageRestoreAdapter',
  'settingsWriter',
  'lockfileWriter',
  'modLockWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'settingsStorage',
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

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackPostCommitPersistentReadsSourceSafeDiagnostic => {
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
      ?? 'third-party.post-commit-persistent-reads-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackPostCommitPersistentReadsSourceSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackPostCommitPersistentReadsSourceSafeDiagnostic[] = []
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
): ThirdPartyDataPackPostCommitPersistentReadsSourceSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const emptyWriteProbeEvidence = (): ThirdPartyDataPackInstallTransactionWriteProbeEvidence => Object.freeze({
  modLockWriteProbeStatus: 'skipped',
  transactionLogWriteProbeStatus: 'skipped',
  modLockPersistentWriteExecuted: false,
  transactionLogPersistentWriteExecuted: false
})

const cloneWriteProbeEvidence = (
  evidence: unknown
): ThirdPartyDataPackInstallTransactionWriteProbeEvidence => {
  if (evidence === undefined || evidence === null || typeof evidence !== 'object') {
    return emptyWriteProbeEvidence()
  }
  const modLockStatus = readOwnStringField(evidence, 'modLockWriteProbeStatus')
  const transactionLogStatus = readOwnStringField(evidence, 'transactionLogWriteProbeStatus')
  return Object.freeze({
    modLockWriteProbeStatus: (
      modLockStatus === 'deferred'
      || modLockStatus === 'written'
      || modLockStatus === 'skipped'
      || modLockStatus === 'blocked'
      || modLockStatus === 'failed'
        ? modLockStatus
        : 'skipped'
    ),
    transactionLogWriteProbeStatus: (
      transactionLogStatus === 'deferred'
      || transactionLogStatus === 'written'
      || transactionLogStatus === 'skipped'
      || transactionLogStatus === 'blocked'
      || transactionLogStatus === 'failed'
        ? transactionLogStatus
        : 'skipped'
    ),
    modLockPersistentWriteExecuted: readOwnBooleanField(evidence, 'modLockPersistentWriteExecuted') ?? false,
    transactionLogPersistentWriteExecuted: readOwnBooleanField(evidence, 'transactionLogPersistentWriteExecuted') ?? false
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

const proofObject = (
  value: unknown
): object | undefined => value !== undefined && value !== null && typeof value === 'object'
  ? value
  : undefined

const clonePersistentReadProofs = (
  value: unknown
): ThirdPartyDataPackPostCommitPersistentReadsProofs | undefined => {
  const proofs = proofObject(value)
  if (proofs === undefined) return undefined
  return Object.freeze({
    transactionLogCommitted: readOwnBooleanField(proofs, 'transactionLogCommitted') === true,
    packageStateMatched: readOwnBooleanField(proofs, 'packageStateMatched') === true,
    settingsStateMatched: readOwnBooleanField(proofs, 'settingsStateMatched') === true,
    modLockStateMatched: readOwnBooleanField(proofs, 'modLockStateMatched') === true,
    liveRegistryMatched: readOwnBooleanField(proofs, 'liveRegistryMatched') === true,
    saveCacheIsolated: readOwnBooleanField(proofs, 'saveCacheIsolated') === true
  })
}

const persistentReadProofsReady = (
  proofs: ThirdPartyDataPackPostCommitPersistentReadsProofs | undefined
): boolean => proofs !== undefined && Object.values(proofs).every(value => value === true)

const effectGraphContainsOnlySettingsLockfileEffects = (
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
    if (allowedSettingsLockfileCommitEffectFields.has(String(key))) return typeof descriptor.value === 'boolean'
    return descriptor.value === false
  })
}

const noRuntimeReadOrWriteDrift = (
  source: ThirdPartyDataPackSettingsLockfileCommitSourceResult
): boolean => readOwnBooleanField(source, 'readOnly') === true
  && readOwnBooleanField(source, 'appBootstrapContinuationAllowed') === true
  && readOwnBooleanField(source, 'commandContinuationAllowed') === true
  && effectGraphContainsOnlySettingsLockfileEffects(readOwnDataField(source, 'effects') as object | undefined)

const pathFreePersistentReadsSource = (
  source: ThirdPartyDataPackSettingsLockfileCommitSourceResult
): boolean => forbiddenPersistentReadsSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const safeSkippedSource = (
  source: ThirdPartyDataPackSettingsLockfileCommitSourceResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noRuntimeReadOrWriteDrift(source)
  && pathFreePersistentReadsSource(source)

const safeAcceptedSource = (
  source: ThirdPartyDataPackSettingsLockfileCommitSourceResult
): boolean => {
  const writeEvidence = cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
  return readOwnStringField(source, 'status') === 'accepted'
    && readOwnStringField(source, 'settingsLockfileCommitHostStatus') === 'accepted'
    && readOwnStringField(source, 'packageFileStagingHostStatus') === 'accepted'
    && readOwnStringField(source, 'requestedCommandId') === 'install'
    && readOwnStringField(source, 'targetPackageId') !== undefined
    && cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined
    && readOwnStringField(source, 'lockfileHash') !== undefined
    && writeEvidence.modLockWriteProbeStatus === 'written'
    && writeEvidence.transactionLogWriteProbeStatus === 'written'
    && writeEvidence.modLockPersistentWriteExecuted === true
    && writeEvidence.transactionLogPersistentWriteExecuted === true
    && noRuntimeReadOrWriteDrift(source)
    && pathFreePersistentReadsSource(source)
}

const pathFreePersistentReadsHostResult = (
  hostResult: ThirdPartyDataPackPostCommitPersistentReadsHostResult
): boolean => forbiddenPersistentReadsHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

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
    if (key === 'postCommitPersistentReadsHostCalled') return descriptor.value === true
    if (key === 'postCommitPersistentReadsHostAccepted') return descriptor.value === accepted
    return descriptor.value === false
  })
}

const safeAcceptedHostResult = (
  source: ThirdPartyDataPackSettingsLockfileCommitSourceResult,
  hostResult: ThirdPartyDataPackPostCommitPersistentReadsHostResult
): boolean => {
  const identity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  const writeEvidence = cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
  const proofs = clonePersistentReadProofs(readOwnDataField(hostResult, 'persistentReadProofs'))
  return readOwnStringField(hostResult, 'status') === 'accepted'
    && readOwnStringField(hostResult, 'requestedCommandId') === 'install'
    && readOwnStringField(hostResult, 'targetPackageId') === readOwnStringField(source, 'targetPackageId')
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'selectedPackageIds')),
      clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'blockedPackageIds')),
      clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'loadOrder')),
      clonePackageIds(readOwnDataField(source, 'loadOrder'))
    )
    && readOwnNumberField(hostResult, 'registryCount') === readOwnNumberField(source, 'registryCount')
    && readOwnNumberField(hostResult, 'entryCount') === readOwnNumberField(source, 'entryCount')
    && readOwnNumberField(hostResult, 'packageCount') === readOwnNumberField(source, 'packageCount')
    && readOwnStringField(hostResult, 'candidateHash') === identity?.candidateHash
    && readOwnStringField(hostResult, 'lockfileHash') === readOwnStringField(source, 'lockfileHash')
    && readOwnStringField(hostResult, 'packageFileStagingHostStatus') === readOwnStringField(source, 'packageFileStagingHostStatus')
    && readOwnStringField(hostResult, 'settingsLockfileCommitHostStatus') === readOwnStringField(source, 'settingsLockfileCommitHostStatus')
    && readOwnStringField(hostResult, 'modLockWriteProbeStatus') === writeEvidence.modLockWriteProbeStatus
    && readOwnStringField(hostResult, 'transactionLogWriteProbeStatus') === writeEvidence.transactionLogWriteProbeStatus
    && readOwnBooleanField(hostResult, 'modLockPersistentWriteExecuted') === writeEvidence.modLockPersistentWriteExecuted
    && readOwnBooleanField(hostResult, 'transactionLogPersistentWriteExecuted') === writeEvidence.transactionLogPersistentWriteExecuted
    && persistentReadProofsReady(proofs)
    && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
    && pathFreePersistentReadsHostResult(hostResult)
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
  continuationAllowed: boolean,
  source?: ThirdPartyDataPackSettingsLockfileCommitSourceResult,
  hostResult?: ThirdPartyDataPackPostCommitPersistentReadsHostResult
): ThirdPartyDataPackPostCommitPersistentReadsSourceEffectSummary => {
  const hostEffects = readOwnDataField(hostResult, 'effects') as object | undefined
  const accepted = readOwnStringField(hostResult, 'status') === 'accepted'
  return Object.freeze({
    postCommitPersistentReadsSourceCalled: true,
    settingsLockfileCommitSourceCalled: sourceCalled,
    settingsLockfileCommitHostAccepted: readOwnStringField(source, 'settingsLockfileCommitHostStatus') === 'accepted',
    injectedPostCommitPersistentReadsHostCalled:
      readOwnBooleanField(hostEffects, 'postCommitPersistentReadsHostCalled') ?? false,
    postCommitPersistentReadsHostCalled:
      readOwnBooleanField(hostEffects, 'postCommitPersistentReadsHostCalled') ?? false,
    postCommitPersistentReadsHostAccepted:
      readOwnBooleanField(hostEffects, 'postCommitPersistentReadsHostAccepted') ?? false,
    persistentReadProofAccepted: accepted,
    realPostCommitPersistentReadsHostCalled: false,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
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
    postCommitVerificationExecuted: false,
    uiIpcResponseDelivered: false,
    transactionLogRead: false,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveCacheIsolationChecked: false,
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

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackPostCommitPersistentReadsSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackSettingsLockfileCommitSourceResult
    readonly hostResult?: ThirdPartyDataPackPostCommitPersistentReadsHostResult
    readonly diagnostics?: readonly ThirdPartyDataPackPostCommitPersistentReadsSourceSafeDiagnostic[]
  }
): ThirdPartyDataPackPostCommitPersistentReadsSourceResult => {
  const continuationAllowed = options.status !== 'blocked'
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const hostProofs = clonePersistentReadProofs(readOwnDataField(options.hostResult, 'persistentReadProofs'))

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READS_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READS_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
    settingsLockfileCommitSourceStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackSettingsLockfileCommitSourceResult['status']
      | undefined,
    packageFileStagingHostStatus: readOwnStringField(options.source, 'packageFileStagingHostStatus') as
      | ThirdPartyDataPackPackageFileStagingHostStatus
      | undefined,
    settingsLockfileCommitHostStatus: readOwnStringField(options.source, 'settingsLockfileCommitHostStatus') as
      | ThirdPartyDataPackSettingsLockfileCommitHostStatus
      | undefined,
    postCommitPersistentReadsHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackPostCommitPersistentReadsHostStatus
      | undefined,
    requestedCommandId: readOwnStringField(options.source, 'requestedCommandId') === 'install'
      ? 'install' as const
      : undefined,
    targetPackageId: readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidatePaths,
    loadOrder,
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(options.source, 'candidateIdentity')),
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    writeProbeEvidence: cloneWriteProbeEvidence(readOwnDataField(options.source, 'writeProbeEvidence')),
    ...(hostProofs === undefined ? {} : { persistentReadProofs: hostProofs }),
    diagnostics,
    effects: effectSummary(options.sourceCalled, continuationAllowed, options.source, options.hostResult)
  })
}

const buildPersistentReadsHostEnvelope = (
  source: ThirdPartyDataPackSettingsLockfileCommitSourceResult
): ThirdPartyDataPackPostCommitPersistentReadsHostEnvelope => deepFreezeObjectGraph({
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
  packageFileStagingHostStatus: readOwnStringField(source, 'packageFileStagingHostStatus') as
    ThirdPartyDataPackPackageFileStagingHostStatus,
  settingsLockfileCommitHostStatus: readOwnStringField(source, 'settingsLockfileCommitHostStatus') as
    ThirdPartyDataPackSettingsLockfileCommitHostStatus,
  writeProbeEvidence: cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
})

const evaluatePostCommitPersistentReadsSource = async(
  options: CreateThirdPartyDataPackPostCommitPersistentReadsSourceOptions
): Promise<ThirdPartyDataPackPostCommitPersistentReadsSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit persistent reads source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readSettingsLockfileCommitSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit persistent reads source is enabled without a settings-lockfile commit source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-persistent-reads-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackSettingsLockfileCommitSourceResult
  try {
    source = await options.readSettingsLockfileCommitSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party settings-lockfile commit source failed before returning a safe persistent-read input',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-persistent-reads-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit persistent reads are not required because settings-lockfile commit was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeAcceptedSource(source)) {
    const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
    if (options.readPostCommitPersistentState !== undefined) {
      let hostResult: ThirdPartyDataPackPostCommitPersistentReadsHostResult
      try {
        hostResult = await options.readPostCommitPersistentState(buildPersistentReadsHostEnvelope(source))
      } catch {
        return baseResult({
          status: 'blocked',
          reason: 'third-party post-commit persistent reads host failed before returning a safe proof',
          enabled: true,
          sourceCalled: true,
          source,
          diagnostics: [
            ...sourceDiagnostics,
            commandDiagnostic(
              'third-party.post-commit-persistent-reads-source.read-host-failed',
              targetPackageId
            )
          ]
        })
      }

      const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
      if (safeAcceptedHostResult(source, hostResult)) {
        return baseResult({
          status: 'ready',
          reason: 'third-party post-commit persistent reads source accepted an injected path-free read proof',
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
        reason: 'third-party post-commit persistent reads host returned an unsafe or blocked proof',
        enabled: true,
        sourceCalled: true,
        source,
        hostResult,
        diagnostics: [
          ...sourceDiagnostics,
          ...hostDiagnostics,
          ...(!pathFreePersistentReadsHostResult(hostResult)
            || !hostEffectsContained(
              readOwnDataField(hostResult, 'effects') as object | undefined,
              readOwnStringField(hostResult, 'status') === 'accepted'
            )
            ? [
                commandDiagnostic(
                  'third-party.post-commit-persistent-reads-source.unsafe-read-host-result',
                  targetPackageId
                )
              ]
            : []),
          commandDiagnostic(
            'third-party.post-commit-persistent-reads-source.read-host-blocked',
            targetPackageId
          )
        ]
      })
    }
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreePersistentReadsSource(source) || !noRuntimeReadOrWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.post-commit-persistent-reads-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.post-commit-persistent-reads-source.reads-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party post-commit persistent reads require a future explicit persistent-read host before command continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackPostCommitPersistentReadsSource = (
  options: CreateThirdPartyDataPackPostCommitPersistentReadsSourceOptions = {}
): (() => Promise<ThirdPartyDataPackPostCommitPersistentReadsSourceResult>) => async() => {
  const result = await evaluatePostCommitPersistentReadsSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackPostCommitPersistentReadsBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackPostCommitPersistentReadsSource =
  createThirdPartyDataPackPostCommitPersistentReadsSource()
