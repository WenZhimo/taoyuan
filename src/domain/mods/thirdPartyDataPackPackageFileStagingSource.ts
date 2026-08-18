import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from './thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import type {
  ThirdPartyDataPackInstallTransactionWriteProbeEvidence
} from './thirdPartyDataPackInstallTransactionDispatchPlan'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_PACKAGE_FILE_STAGING_SOURCE_KIND =
  'third-party-package-file-staging-source'
export const THIRD_PARTY_DATA_PACK_PACKAGE_FILE_STAGING_SOURCE_MODE =
  'default-disabled-package-file-staging-source'

export type ThirdPartyDataPackPackageFileStagingSourceStatus =
  | 'accepted'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPackageFileStagingHostStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackPackageFileStagingHostEnvelope {
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
  readonly writeProbeEvidence: ThirdPartyDataPackInstallTransactionWriteProbeEvidence
}

export interface ThirdPartyDataPackPackageFileStagingHostEffectSummary {
  readonly packageFileStagingHostCalled: boolean
  readonly packageFileStagingHostAccepted: boolean
  readonly transactionCommitted: false
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

export interface ThirdPartyDataPackPackageFileStagingHostResult {
  readonly status: ThirdPartyDataPackPackageFileStagingHostStatus
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
  readonly modLockWriteProbeStatus?: ThirdPartyDataPackInstallTransactionWriteProbeEvidence['modLockWriteProbeStatus']
  readonly transactionLogWriteProbeStatus?: ThirdPartyDataPackInstallTransactionWriteProbeEvidence['transactionLogWriteProbeStatus']
  readonly modLockPersistentWriteExecuted?: boolean
  readonly transactionLogPersistentWriteExecuted?: boolean
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackPackageFileStagingHostEffectSummary
}

export interface ThirdPartyDataPackPackageFileStagingSourceEffectSummary {
  readonly packageFileStagingSourceCalled: boolean
  readonly atomicCommitPreflightSourceCalled: boolean
  readonly injectedPackageFileStagingHostCalled: boolean
  readonly packageFileStagingHostCalled: boolean
  readonly packageFileStagingHostAccepted: boolean
  readonly realPackageFileStagingHostCalled: false
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

export interface ThirdPartyDataPackPackageFileStagingSourceSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackPackageFileStagingSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_PACKAGE_FILE_STAGING_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_PACKAGE_FILE_STAGING_SOURCE_MODE
  readonly status: ThirdPartyDataPackPackageFileStagingSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly atomicCommitPreflightStatus?: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult['status']
  readonly packageFileStagingHostStatus?: ThirdPartyDataPackPackageFileStagingHostStatus
  readonly requestedCommandId?: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult['requestedCommandId']
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
  readonly diagnostics: readonly ThirdPartyDataPackPackageFileStagingSourceSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackPackageFileStagingSourceEffectSummary
}

export interface CreateThirdPartyDataPackPackageFileStagingSourceOptions {
  readonly enabled?: boolean
  readonly readAtomicCommitPreflight?: () => Awaitable<ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult>
  readonly stagePackageFiles?: (
    envelope: ThirdPartyDataPackPackageFileStagingHostEnvelope
  ) => Awaitable<ThirdPartyDataPackPackageFileStagingHostResult>
}

export class ThirdPartyDataPackPackageFileStagingBlockedError extends Error {
  readonly result: ThirdPartyDataPackPackageFileStagingSourceResult

  constructor(result: ThirdPartyDataPackPackageFileStagingSourceResult) {
    super('third-party package file staging blocked command continuation')
    this.name = 'ThirdPartyDataPackPackageFileStagingBlockedError'
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

const forbiddenPackageFileStagingSourceFields = [
  'transactionCommandDispatcherHandoff',
  'installTransactionDispatchPlan',
  'runtimePublicationCommitAdapter',
  'atomicTransactionCommitExecutor',
  'packageFileStagingHost',
  'packageFileStageHost',
  'packageWriter',
  'packageFileWriter',
  'packageBackupWriter',
  'packageRestoreAdapter',
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

const forbiddenPackageFileStagingHostFields = [
  'atomicCommitPreflight',
  'atomicTransactionCommitExecutorPreflight',
  'transactionCommandDispatcherHandoff',
  'installTransactionDispatchPlan',
  'runtimePublicationCommitAdapter',
  'packageFileStagingRequest',
  'packageFileStagingHost',
  'packageWriter',
  'packageFileWriter',
  'packageBackupWriter',
  'packageRestoreAdapter',
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

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackPackageFileStagingSourceSafeDiagnostic => {
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
      ?? 'third-party.package-file-staging-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackPackageFileStagingSourceSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackPackageFileStagingSourceSafeDiagnostic[] = []
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
): ThirdPartyDataPackPackageFileStagingSourceSafeDiagnostic => Object.freeze({
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

const noRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
): boolean => readOwnBooleanField(source, 'atomicCommitExecutionAllowed') === false
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'commitAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'runtimePublicationCommitAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'postCommitVerificationAllowed') === false
  && readOwnBooleanField(source, 'uiIpcResponseAllowed') === false
  && readOwnBooleanField(source, 'rollbackRecoveryAllowed') === false
  && everyOwnDataValueFalse(readOwnDataField(source, 'effects') as object | undefined)

const pathFreePackageFileStagingSource = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
): boolean => forbiddenPackageFileStagingSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const safeSkippedSource = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noRuntimeOrWriteDrift(source)
  && pathFreePackageFileStagingSource(source)

const safeDeferredSource = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
): boolean => {
  const writeEvidence = cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
  return readOwnStringField(source, 'status') === 'deferred'
    && readOwnStringField(source, 'requestedCommandId') === 'install'
    && readOwnStringField(source, 'targetPackageId') !== undefined
    && cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined
    && readOwnStringField(source, 'lockfileHash') !== undefined
    && writeEvidence.modLockWriteProbeStatus === 'written'
    && writeEvidence.transactionLogWriteProbeStatus === 'written'
    && writeEvidence.modLockPersistentWriteExecuted === true
    && writeEvidence.transactionLogPersistentWriteExecuted === true
    && noRuntimeOrWriteDrift(source)
    && pathFreePackageFileStagingSource(source)
}

const pathFreePackageFileStagingHostResult = (
  hostResult: ThirdPartyDataPackPackageFileStagingHostResult
): boolean => forbiddenPackageFileStagingHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

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
    if (key === 'packageFileStagingHostCalled') return descriptor.value === true
    if (key === 'packageFileStagingHostAccepted') return descriptor.value === accepted
    return descriptor.value === false
  })
}

const safeAcceptedHostResult = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  hostResult: ThirdPartyDataPackPackageFileStagingHostResult
): boolean => {
  const identity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  const writeEvidence = cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
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
    && readOwnStringField(hostResult, 'modLockWriteProbeStatus') === writeEvidence.modLockWriteProbeStatus
    && readOwnStringField(hostResult, 'transactionLogWriteProbeStatus') === writeEvidence.transactionLogWriteProbeStatus
    && readOwnBooleanField(hostResult, 'modLockPersistentWriteExecuted') === writeEvidence.modLockPersistentWriteExecuted
    && readOwnBooleanField(hostResult, 'transactionLogPersistentWriteExecuted') === writeEvidence.transactionLogPersistentWriteExecuted
    && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
    && pathFreePackageFileStagingHostResult(hostResult)
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
  hostResult?: ThirdPartyDataPackPackageFileStagingHostResult
): ThirdPartyDataPackPackageFileStagingSourceEffectSummary => {
  const hostEffects = readOwnDataField(hostResult, 'effects') as object | undefined
  return Object.freeze({
    packageFileStagingSourceCalled: true,
    atomicCommitPreflightSourceCalled: sourceCalled,
    injectedPackageFileStagingHostCalled: readOwnBooleanField(hostEffects, 'packageFileStagingHostCalled') ?? false,
    packageFileStagingHostCalled: readOwnBooleanField(hostEffects, 'packageFileStagingHostCalled') ?? false,
    packageFileStagingHostAccepted: readOwnBooleanField(hostEffects, 'packageFileStagingHostAccepted') ?? false,
    realPackageFileStagingHostCalled: false,
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
    readonly status: ThirdPartyDataPackPackageFileStagingSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
    readonly hostResult?: ThirdPartyDataPackPackageFileStagingHostResult
    readonly diagnostics?: readonly ThirdPartyDataPackPackageFileStagingSourceSafeDiagnostic[]
  }
): ThirdPartyDataPackPackageFileStagingSourceResult => {
  const continuationAllowed = options.status !== 'blocked'
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_PACKAGE_FILE_STAGING_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_PACKAGE_FILE_STAGING_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
    atomicCommitPreflightStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult['status']
      | undefined,
    packageFileStagingHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackPackageFileStagingHostStatus
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
    diagnostics,
    effects: effectSummary(options.sourceCalled, continuationAllowed, options.hostResult)
  })
}

const buildPackageFileStagingHostEnvelope = (
  source: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
): ThirdPartyDataPackPackageFileStagingHostEnvelope => deepFreezeObjectGraph({
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
  writeProbeEvidence: cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
})

const evaluatePackageFileStagingSource = async(
  options: CreateThirdPartyDataPackPackageFileStagingSourceOptions
): Promise<ThirdPartyDataPackPackageFileStagingSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party package file staging source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readAtomicCommitPreflight === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party package file staging source is enabled without an atomic commit preflight source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.package-file-staging-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
  try {
    source = await options.readAtomicCommitPreflight()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party atomic commit preflight source failed before returning a safe package staging input',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.package-file-staging-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party package file staging is not required because atomic commit preflight was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeDeferredSource(source)) {
    const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
    if (options.stagePackageFiles !== undefined) {
      let hostResult: ThirdPartyDataPackPackageFileStagingHostResult
      try {
        hostResult = await options.stagePackageFiles(buildPackageFileStagingHostEnvelope(source))
      } catch {
        return baseResult({
          status: 'blocked',
          reason: 'third-party package file staging host failed before returning a safe result',
          enabled: true,
          sourceCalled: true,
          source,
          diagnostics: [
            ...sourceDiagnostics,
            commandDiagnostic(
              'third-party.package-file-staging-source.staging-host-failed',
              targetPackageId
            )
          ]
        })
      }

      const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
      if (safeAcceptedHostResult(source, hostResult)) {
        return baseResult({
          status: 'accepted',
          reason: 'third-party package file staging source accepted an injected path-free staging host acknowledgement',
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
        reason: 'third-party package file staging host returned an unsafe or blocked result',
        enabled: true,
        sourceCalled: true,
        source,
        hostResult,
        diagnostics: [
          ...sourceDiagnostics,
          ...hostDiagnostics,
          ...(!pathFreePackageFileStagingHostResult(hostResult)
            || !hostEffectsContained(
              readOwnDataField(hostResult, 'effects') as object | undefined,
              readOwnStringField(hostResult, 'status') === 'accepted'
            )
            ? [
                commandDiagnostic(
                  'third-party.package-file-staging-source.unsafe-staging-host-result',
                  targetPackageId
                )
              ]
            : []),
          commandDiagnostic(
            'third-party.package-file-staging-source.staging-host-blocked',
            targetPackageId
          )
        ]
      })
    }
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreePackageFileStagingSource(source) || !noRuntimeOrWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.package-file-staging-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.package-file-staging-source.staging-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party package file staging requires a future explicit package staging host before command continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackPackageFileStagingSource = (
  options: CreateThirdPartyDataPackPackageFileStagingSourceOptions = {}
): (() => Promise<ThirdPartyDataPackPackageFileStagingSourceResult>) => async() => {
  const result = await evaluatePackageFileStagingSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackPackageFileStagingBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackPackageFileStagingSource =
  createThirdPartyDataPackPackageFileStagingSource()
