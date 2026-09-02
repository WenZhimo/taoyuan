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
  ThirdPartyDataPackPackageFileStagingHostStatus,
  ThirdPartyDataPackPackageFileStagingSourceResult
} from './thirdPartyDataPackPackageFileStagingSource'
import {
  isThirdPartyDataPackRuntimeCommandId,
  type ThirdPartyDataPackRuntimeCommandId
} from './thirdPartyDataPackRuntimeCommandState'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_COMMIT_SOURCE_KIND =
  'third-party-settings-lockfile-commit-source'
export const THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_COMMIT_SOURCE_MODE =
  'default-disabled-settings-lockfile-commit-source'

export type ThirdPartyDataPackSettingsLockfileCommitSourceStatus =
  | 'accepted'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackSettingsLockfileCommitHostStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackSettingsLockfileCommitHostEnvelope {
  readonly requestedCommandId: ThirdPartyDataPackRuntimeCommandId
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
  readonly writeProbeEvidence: ThirdPartyDataPackInstallTransactionWriteProbeEvidence
}

export interface ThirdPartyDataPackSettingsLockfileCommitHostEffectSummary {
  readonly settingsLockfileCommitHostCalled: boolean
  readonly settingsLockfileCommitHostAccepted: boolean
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

export interface ThirdPartyDataPackSettingsLockfileCommitHostResult {
  readonly status: ThirdPartyDataPackSettingsLockfileCommitHostStatus
  readonly requestedCommandId?: ThirdPartyDataPackRuntimeCommandId
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
  readonly modLockWriteProbeStatus?: ThirdPartyDataPackInstallTransactionWriteProbeEvidence['modLockWriteProbeStatus']
  readonly transactionLogWriteProbeStatus?: ThirdPartyDataPackInstallTransactionWriteProbeEvidence['transactionLogWriteProbeStatus']
  readonly modLockPersistentWriteExecuted?: boolean
  readonly transactionLogPersistentWriteExecuted?: boolean
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackSettingsLockfileCommitHostEffectSummary
}

export interface ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary {
  readonly settingsLockfileCommitSourceCalled: boolean
  readonly packageFileStagingSourceCalled: boolean
  readonly injectedSettingsLockfileCommitHostCalled: boolean
  readonly settingsLockfileCommitHostCalled: boolean
  readonly settingsLockfileCommitHostAccepted: boolean
  readonly realSettingsLockfileCommitHostCalled: false
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

export interface ThirdPartyDataPackSettingsLockfileCommitSourceSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackSettingsLockfileCommitSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_COMMIT_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_COMMIT_SOURCE_MODE
  readonly status: ThirdPartyDataPackSettingsLockfileCommitSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly packageFileStagingSourceStatus?: ThirdPartyDataPackPackageFileStagingSourceResult['status']
  readonly packageFileStagingHostStatus?: ThirdPartyDataPackPackageFileStagingHostStatus
  readonly settingsLockfileCommitHostStatus?: ThirdPartyDataPackSettingsLockfileCommitHostStatus
  readonly requestedCommandId?: ThirdPartyDataPackRuntimeCommandId
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
  readonly diagnostics: readonly ThirdPartyDataPackSettingsLockfileCommitSourceSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary
}

export interface CreateThirdPartyDataPackSettingsLockfileCommitSourceOptions {
  readonly enabled?: boolean
  readonly readPackageFileStagingSource?: () => Awaitable<ThirdPartyDataPackPackageFileStagingSourceResult>
  readonly commitSettingsLockfile?: (
    envelope: ThirdPartyDataPackSettingsLockfileCommitHostEnvelope
  ) => Awaitable<ThirdPartyDataPackSettingsLockfileCommitHostResult>
}

export class ThirdPartyDataPackSettingsLockfileCommitBlockedError extends Error {
  readonly result: ThirdPartyDataPackSettingsLockfileCommitSourceResult

  constructor(result: ThirdPartyDataPackSettingsLockfileCommitSourceResult) {
    super('third-party settings-lockfile commit blocked command continuation')
    this.name = 'ThirdPartyDataPackSettingsLockfileCommitBlockedError'
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

const allowedPackageStagingEffectFields = new Set<string>([
  'packageFileStagingSourceCalled',
  'atomicCommitPreflightSourceCalled',
  'injectedPackageFileStagingHostCalled',
  'packageFileStagingHostCalled',
  'packageFileStagingHostAccepted',
  'realPackageFileStagingHostCalled',
  'appBootstrapContinuationAllowed',
  'commandContinuationAllowed'
])

const forbiddenSettingsLockfileCommitSourceFields = [
  'atomicCommitPreflight',
  'atomicTransactionCommitExecutorPreflight',
  'packageFileStagingHost',
  'packageFileStagingRequest',
  'settingsLockfileCommitHost',
  'settingsLockfileHost',
  'settingsWriter',
  'lockfileWriter',
  'modLockWriter',
  'packageSettingsWriter',
  'packageWriter',
  'packageFileWriter',
  'packageBackupWriter',
  'packageRestoreAdapter',
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

const forbiddenSettingsLockfileCommitHostFields = [
  'packageFileStagingSource',
  'packageFileStagingHost',
  'settingsLockfileCommitRequest',
  'settingsLockfileCommitHost',
  'settingsLockfileHost',
  'settingsWriter',
  'lockfileWriter',
  'modLockWriter',
  'packageSettingsWriter',
  'packageWriter',
  'packageFileWriter',
  'packageBackupWriter',
  'packageRestoreAdapter',
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

const readRuntimeCommandId = (
  value: unknown,
  selectedPackageIds: readonly PackageId[],
  blockedPackageIds: readonly PackageId[]
): ThirdPartyDataPackRuntimeCommandId | undefined => {
  const commandId = readOwnStringField(value as object | undefined, 'requestedCommandId')
  if (isThirdPartyDataPackRuntimeCommandId(commandId)) return commandId
  if (selectedPackageIds.length > 0 && blockedPackageIds.length === 0) return 'install'
  return undefined
}

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
): ThirdPartyDataPackSettingsLockfileCommitSourceSafeDiagnostic => {
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
      ?? 'third-party.settings-lockfile-commit-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackSettingsLockfileCommitSourceSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackSettingsLockfileCommitSourceSafeDiagnostic[] = []
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
): ThirdPartyDataPackSettingsLockfileCommitSourceSafeDiagnostic => Object.freeze({
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

const effectGraphContainsOnlyPackageStagingEffects = (
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
    if (allowedPackageStagingEffectFields.has(String(key))) return typeof descriptor.value === 'boolean'
    return descriptor.value === false
  })
}

const noRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackPackageFileStagingSourceResult
): boolean => readOwnBooleanField(source, 'readOnly') === true
  && readOwnBooleanField(source, 'appBootstrapContinuationAllowed') === true
  && readOwnBooleanField(source, 'commandContinuationAllowed') === true
  && effectGraphContainsOnlyPackageStagingEffects(readOwnDataField(source, 'effects') as object | undefined)

const pathFreeSettingsLockfileCommitSource = (
  source: ThirdPartyDataPackPackageFileStagingSourceResult
): boolean => forbiddenSettingsLockfileCommitSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const safeSkippedSource = (
  source: ThirdPartyDataPackPackageFileStagingSourceResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noRuntimeOrWriteDrift(source)
  && pathFreeSettingsLockfileCommitSource(source)

const safeAcceptedSource = (
  source: ThirdPartyDataPackPackageFileStagingSourceResult
): boolean => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const writeEvidence = cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
  return readOwnStringField(source, 'status') === 'accepted'
    && readOwnStringField(source, 'packageFileStagingHostStatus') === 'accepted'
    && readRuntimeCommandId(source, selectedPackageIds, blockedPackageIds) !== undefined
    && readOwnStringField(source, 'targetPackageId') !== undefined
    && cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined
    && readOwnStringField(source, 'lockfileHash') !== undefined
    && writeEvidence.modLockWriteProbeStatus === 'written'
    && writeEvidence.transactionLogWriteProbeStatus === 'written'
    && writeEvidence.modLockPersistentWriteExecuted === true
    && writeEvidence.transactionLogPersistentWriteExecuted === true
    && noRuntimeOrWriteDrift(source)
    && pathFreeSettingsLockfileCommitSource(source)
}

const pathFreeSettingsLockfileCommitHostResult = (
  hostResult: ThirdPartyDataPackSettingsLockfileCommitHostResult
): boolean => forbiddenSettingsLockfileCommitHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

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
    if (key === 'settingsLockfileCommitHostCalled') return descriptor.value === true
    if (key === 'settingsLockfileCommitHostAccepted') return descriptor.value === accepted
    return descriptor.value === false
  })
}

const safeAcceptedHostResult = (
  source: ThirdPartyDataPackPackageFileStagingSourceResult,
  hostResult: ThirdPartyDataPackSettingsLockfileCommitHostResult
): boolean => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const requestedCommandId = readRuntimeCommandId(source, selectedPackageIds, blockedPackageIds)
  const identity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  const writeEvidence = cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
  return readOwnStringField(hostResult, 'status') === 'accepted'
    && requestedCommandId !== undefined
    && readOwnStringField(hostResult, 'requestedCommandId') === requestedCommandId
    && readOwnStringField(hostResult, 'targetPackageId') === readOwnStringField(source, 'targetPackageId')
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'selectedPackageIds')),
      selectedPackageIds
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'blockedPackageIds')),
      blockedPackageIds
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
    && readOwnStringField(hostResult, 'modLockWriteProbeStatus') === writeEvidence.modLockWriteProbeStatus
    && readOwnStringField(hostResult, 'transactionLogWriteProbeStatus') === writeEvidence.transactionLogWriteProbeStatus
    && readOwnBooleanField(hostResult, 'modLockPersistentWriteExecuted') === writeEvidence.modLockPersistentWriteExecuted
    && readOwnBooleanField(hostResult, 'transactionLogPersistentWriteExecuted') === writeEvidence.transactionLogPersistentWriteExecuted
    && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
    && pathFreeSettingsLockfileCommitHostResult(hostResult)
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
  hostResult?: ThirdPartyDataPackSettingsLockfileCommitHostResult
): ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary => {
  const hostEffects = readOwnDataField(hostResult, 'effects') as object | undefined
  return Object.freeze({
    settingsLockfileCommitSourceCalled: true,
    packageFileStagingSourceCalled: sourceCalled,
    injectedSettingsLockfileCommitHostCalled:
      readOwnBooleanField(hostEffects, 'settingsLockfileCommitHostCalled') ?? false,
    settingsLockfileCommitHostCalled:
      readOwnBooleanField(hostEffects, 'settingsLockfileCommitHostCalled') ?? false,
    settingsLockfileCommitHostAccepted:
      readOwnBooleanField(hostEffects, 'settingsLockfileCommitHostAccepted') ?? false,
    realSettingsLockfileCommitHostCalled: false,
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
    readonly status: ThirdPartyDataPackSettingsLockfileCommitSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackPackageFileStagingSourceResult
    readonly hostResult?: ThirdPartyDataPackSettingsLockfileCommitHostResult
    readonly diagnostics?: readonly ThirdPartyDataPackSettingsLockfileCommitSourceSafeDiagnostic[]
  }
): ThirdPartyDataPackSettingsLockfileCommitSourceResult => {
  const continuationAllowed = options.status !== 'blocked'
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_COMMIT_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_COMMIT_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
    packageFileStagingSourceStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackPackageFileStagingSourceResult['status']
      | undefined,
    packageFileStagingHostStatus: readOwnStringField(options.source, 'packageFileStagingHostStatus') as
      | ThirdPartyDataPackPackageFileStagingHostStatus
      | undefined,
    settingsLockfileCommitHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackSettingsLockfileCommitHostStatus
      | undefined,
    requestedCommandId: readRuntimeCommandId(options.source, selectedPackageIds, blockedPackageIds),
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

const buildSettingsLockfileCommitHostEnvelope = (
  source: ThirdPartyDataPackPackageFileStagingSourceResult
): ThirdPartyDataPackSettingsLockfileCommitHostEnvelope => deepFreezeObjectGraph({
  requestedCommandId: readRuntimeCommandId(
    source,
    clonePackageIds(readOwnDataField(source, 'selectedPackageIds')),
    clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  ) as ThirdPartyDataPackRuntimeCommandId,
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
  writeProbeEvidence: cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
})

const evaluateSettingsLockfileCommitSource = async(
  options: CreateThirdPartyDataPackSettingsLockfileCommitSourceOptions
): Promise<ThirdPartyDataPackSettingsLockfileCommitSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party settings-lockfile commit source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readPackageFileStagingSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party settings-lockfile commit source is enabled without a package file staging source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.settings-lockfile-commit-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackPackageFileStagingSourceResult
  try {
    source = await options.readPackageFileStagingSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party package file staging source failed before returning a safe settings-lockfile commit input',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.settings-lockfile-commit-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party settings-lockfile commit is not required because package file staging was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeAcceptedSource(source)) {
    const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
    if (options.commitSettingsLockfile !== undefined) {
      let hostResult: ThirdPartyDataPackSettingsLockfileCommitHostResult
      try {
        hostResult = await options.commitSettingsLockfile(buildSettingsLockfileCommitHostEnvelope(source))
      } catch {
        return baseResult({
          status: 'blocked',
          reason: 'third-party settings-lockfile commit host failed before returning a safe result',
          enabled: true,
          sourceCalled: true,
          source,
          diagnostics: [
            ...sourceDiagnostics,
            commandDiagnostic(
              'third-party.settings-lockfile-commit-source.commit-host-failed',
              targetPackageId
            )
          ]
        })
      }

      const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
      if (safeAcceptedHostResult(source, hostResult)) {
        return baseResult({
          status: 'accepted',
          reason: 'third-party settings-lockfile commit source accepted an injected path-free commit host acknowledgement',
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
        reason: 'third-party settings-lockfile commit host returned an unsafe or blocked result',
        enabled: true,
        sourceCalled: true,
        source,
        hostResult,
        diagnostics: [
          ...sourceDiagnostics,
          ...hostDiagnostics,
          ...(!pathFreeSettingsLockfileCommitHostResult(hostResult)
            || !hostEffectsContained(
              readOwnDataField(hostResult, 'effects') as object | undefined,
              readOwnStringField(hostResult, 'status') === 'accepted'
            )
            ? [
                commandDiagnostic(
                  'third-party.settings-lockfile-commit-source.unsafe-commit-host-result',
                  targetPackageId
                )
              ]
            : []),
          commandDiagnostic(
            'third-party.settings-lockfile-commit-source.commit-host-blocked',
            targetPackageId
          )
        ]
      })
    }
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeSettingsLockfileCommitSource(source) || !noRuntimeOrWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.settings-lockfile-commit-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.settings-lockfile-commit-source.commit-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party settings-lockfile commit requires a future explicit settings-lockfile commit host before command continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackSettingsLockfileCommitSource = (
  options: CreateThirdPartyDataPackSettingsLockfileCommitSourceOptions = {}
): (() => Promise<ThirdPartyDataPackSettingsLockfileCommitSourceResult>) => async() => {
  const result = await evaluateSettingsLockfileCommitSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackSettingsLockfileCommitBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackSettingsLockfileCommitSource =
  createThirdPartyDataPackSettingsLockfileCommitSource()
