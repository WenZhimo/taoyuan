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

export const THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_PERSISTENT_WRITER_SOURCE_KIND =
  'third-party-settings-lockfile-persistent-writer-source'
export const THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_PERSISTENT_WRITER_SOURCE_MODE =
  'default-disabled-settings-lockfile-persistent-writer-source'

export type ThirdPartyDataPackSettingsLockfilePersistentWriterSourceStatus =
  | 'written'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackSettingsLockfilePersistentWriterHostStatus =
  | 'written'
  | 'blocked'

export interface ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope {
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

export interface ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary {
  readonly settingsLockfilePersistentWriterHostCalled: boolean
  readonly settingsLockfilePersistentWriterHostWritten: boolean
  readonly transactionCommitted: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: false
  readonly lockfileWritten: boolean
  readonly lockfileRestored: false
  readonly settingsWritten: boolean
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult {
  readonly status: ThirdPartyDataPackSettingsLockfilePersistentWriterHostStatus
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
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary
}

export interface ThirdPartyDataPackSettingsLockfilePersistentWriterSourceEffectSummary {
  readonly settingsLockfilePersistentWriterSourceCalled: boolean
  readonly settingsLockfileCommitSourceCalled: boolean
  readonly injectedSettingsLockfilePersistentWriterHostCalled: boolean
  readonly settingsLockfilePersistentWriterHostCalled: boolean
  readonly settingsLockfilePersistentWriterHostWritten: boolean
  readonly realSettingsLockfilePersistentWriterHostCalled: false
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
  readonly lockfileWritten: boolean
  readonly lockfileRestored: false
  readonly settingsWritten: boolean
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackSettingsLockfilePersistentWriterSourceSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_PERSISTENT_WRITER_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_PERSISTENT_WRITER_SOURCE_MODE
  readonly status: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceStatus
  readonly reason: string
  readonly readOnly: boolean
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly settingsLockfileCommitSourceStatus?: ThirdPartyDataPackSettingsLockfileCommitSourceResult['status']
  readonly packageFileStagingHostStatus?: ThirdPartyDataPackPackageFileStagingHostStatus
  readonly settingsLockfileCommitHostStatus?: ThirdPartyDataPackSettingsLockfileCommitHostStatus
  readonly settingsLockfilePersistentWriterHostStatus?: ThirdPartyDataPackSettingsLockfilePersistentWriterHostStatus
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
  readonly diagnostics: readonly ThirdPartyDataPackSettingsLockfilePersistentWriterSourceSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceEffectSummary
}

export interface CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions {
  readonly enabled?: boolean
  readonly readSettingsLockfileCommitSource?: () => Awaitable<ThirdPartyDataPackSettingsLockfileCommitSourceResult>
  readonly writeSettingsLockfile?: (
    envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope
  ) => Awaitable<ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult>
}

export class ThirdPartyDataPackSettingsLockfilePersistentWriterBlockedError extends Error {
  readonly result: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult

  constructor(result: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult) {
    super('third-party settings-lockfile persistent writer blocked command continuation')
    this.name = 'ThirdPartyDataPackSettingsLockfilePersistentWriterBlockedError'
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

const allowedSettingsCommitEffectFields = new Set<string>([
  'settingsLockfileCommitSourceCalled',
  'packageFileStagingSourceCalled',
  'injectedSettingsLockfileCommitHostCalled',
  'settingsLockfileCommitHostCalled',
  'settingsLockfileCommitHostAccepted',
  'realSettingsLockfileCommitHostCalled',
  'appBootstrapContinuationAllowed',
  'commandContinuationAllowed'
])

const forbiddenPersistentWriterSourceFields = [
  'packageFileStagingSource',
  'packageFileStagingHost',
  'settingsLockfileCommitHost',
  'settingsLockfilePersistentWriterHost',
  'settingsLockfileWriter',
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

const forbiddenPersistentWriterHostFields = [
  'settingsLockfileCommitSource',
  'settingsLockfilePersistentWriterRequest',
  'settingsLockfilePersistentWriterHost',
  'settingsLockfileWriter',
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
): ThirdPartyDataPackSettingsLockfilePersistentWriterSourceSafeDiagnostic => {
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
      ?? 'third-party.settings-lockfile-persistent-writer-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackSettingsLockfilePersistentWriterSourceSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceSafeDiagnostic[] = []
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
): ThirdPartyDataPackSettingsLockfilePersistentWriterSourceSafeDiagnostic => Object.freeze({
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

const effectGraphContainsOnlySettingsCommitEffects = (
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
    if (allowedSettingsCommitEffectFields.has(String(key))) return typeof descriptor.value === 'boolean'
    return descriptor.value === false
  })
}

const noRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackSettingsLockfileCommitSourceResult
): boolean => readOwnBooleanField(source, 'readOnly') === true
  && readOwnBooleanField(source, 'appBootstrapContinuationAllowed') === true
  && readOwnBooleanField(source, 'commandContinuationAllowed') === true
  && effectGraphContainsOnlySettingsCommitEffects(readOwnDataField(source, 'effects') as object | undefined)

const pathFreePersistentWriterSource = (
  source: ThirdPartyDataPackSettingsLockfileCommitSourceResult
): boolean => forbiddenPersistentWriterSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const safeSkippedSource = (
  source: ThirdPartyDataPackSettingsLockfileCommitSourceResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noRuntimeOrWriteDrift(source)
  && pathFreePersistentWriterSource(source)

const safeAcceptedSource = (
  source: ThirdPartyDataPackSettingsLockfileCommitSourceResult
): boolean => {
  const writeEvidence = cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
  return readOwnStringField(source, 'status') === 'accepted'
    && readOwnStringField(source, 'packageFileStagingHostStatus') === 'accepted'
    && readOwnStringField(source, 'settingsLockfileCommitHostStatus') === 'accepted'
    && readOwnStringField(source, 'requestedCommandId') === 'install'
    && readOwnStringField(source, 'targetPackageId') !== undefined
    && cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined
    && readOwnStringField(source, 'lockfileHash') !== undefined
    && writeEvidence.modLockWriteProbeStatus === 'written'
    && writeEvidence.transactionLogWriteProbeStatus === 'written'
    && writeEvidence.modLockPersistentWriteExecuted === true
    && writeEvidence.transactionLogPersistentWriteExecuted === true
    && noRuntimeOrWriteDrift(source)
    && pathFreePersistentWriterSource(source)
}

const pathFreePersistentWriterHostResult = (
  hostResult: ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult
): boolean => forbiddenPersistentWriterHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const hostEffectsContained = (
  effects: object | undefined
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
    if (key === 'settingsLockfilePersistentWriterHostCalled') return descriptor.value === true
    if (key === 'settingsLockfilePersistentWriterHostWritten') return descriptor.value === true
    if (key === 'settingsWritten') return descriptor.value === true
    if (key === 'lockfileWritten') return descriptor.value === true
    return descriptor.value === false
  })
}

const safeWrittenHostResult = (
  source: ThirdPartyDataPackSettingsLockfileCommitSourceResult,
  hostResult: ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult
): boolean => {
  const identity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  const writeEvidence = cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
  return readOwnStringField(hostResult, 'status') === 'written'
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
    && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined)
    && pathFreePersistentWriterHostResult(hostResult)
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
  hostResult: ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult | undefined,
  persistentWriteAccepted: boolean
): ThirdPartyDataPackSettingsLockfilePersistentWriterSourceEffectSummary => {
  const hostEffects = readOwnDataField(hostResult, 'effects') as object | undefined
  return Object.freeze({
    settingsLockfilePersistentWriterSourceCalled: true,
    settingsLockfileCommitSourceCalled: sourceCalled,
    injectedSettingsLockfilePersistentWriterHostCalled:
      readOwnBooleanField(hostEffects, 'settingsLockfilePersistentWriterHostCalled') ?? false,
    settingsLockfilePersistentWriterHostCalled:
      readOwnBooleanField(hostEffects, 'settingsLockfilePersistentWriterHostCalled') ?? false,
    settingsLockfilePersistentWriterHostWritten:
      readOwnBooleanField(hostEffects, 'settingsLockfilePersistentWriterHostWritten') ?? false,
    realSettingsLockfilePersistentWriterHostCalled: false,
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
    lockfileWritten: persistentWriteAccepted,
    lockfileRestored: false,
    settingsWritten: persistentWriteAccepted,
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
    readonly status: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackSettingsLockfileCommitSourceResult
    readonly hostResult?: ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult
    readonly diagnostics?: readonly ThirdPartyDataPackSettingsLockfilePersistentWriterSourceSafeDiagnostic[]
  }
): ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult => {
  const continuationAllowed = options.status !== 'blocked'
  const persistentWriteAccepted = options.status === 'written'
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_PERSISTENT_WRITER_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_PERSISTENT_WRITER_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: !persistentWriteAccepted,
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
    settingsLockfilePersistentWriterHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackSettingsLockfilePersistentWriterHostStatus
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
    effects: effectSummary(
      options.sourceCalled,
      continuationAllowed,
      options.hostResult,
      persistentWriteAccepted
    )
  })
}

const buildPersistentWriterHostEnvelope = (
  source: ThirdPartyDataPackSettingsLockfileCommitSourceResult
): ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope => deepFreezeObjectGraph({
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

const evaluateSettingsLockfilePersistentWriterSource = async(
  options: CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions
): Promise<ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party settings-lockfile persistent writer source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readSettingsLockfileCommitSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party settings-lockfile persistent writer source is enabled without a settings-lockfile commit source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.settings-lockfile-persistent-writer-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackSettingsLockfileCommitSourceResult
  try {
    source = await options.readSettingsLockfileCommitSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party settings-lockfile commit source failed before returning a safe persistent writer input',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.settings-lockfile-persistent-writer-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party settings-lockfile persistent writes are not required because settings-lockfile commit was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeAcceptedSource(source)) {
    const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
    if (options.writeSettingsLockfile !== undefined) {
      let hostResult: ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult
      try {
        hostResult = await options.writeSettingsLockfile(buildPersistentWriterHostEnvelope(source))
      } catch {
        return baseResult({
          status: 'blocked',
          reason: 'third-party settings-lockfile persistent writer host failed before returning a safe result',
          enabled: true,
          sourceCalled: true,
          source,
          diagnostics: [
            ...sourceDiagnostics,
            commandDiagnostic(
              'third-party.settings-lockfile-persistent-writer-source.writer-host-failed',
              targetPackageId
            )
          ]
        })
      }

      const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
      if (safeWrittenHostResult(source, hostResult)) {
        return baseResult({
          status: 'written',
          reason: 'third-party settings-lockfile persistent writer source accepted an injected contained writer result',
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
        reason: 'third-party settings-lockfile persistent writer host returned an unsafe or blocked result',
        enabled: true,
        sourceCalled: true,
        source,
        hostResult,
        diagnostics: [
          ...sourceDiagnostics,
          ...hostDiagnostics,
          ...(!pathFreePersistentWriterHostResult(hostResult)
            || !hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined)
            ? [
                commandDiagnostic(
                  'third-party.settings-lockfile-persistent-writer-source.unsafe-writer-host-result',
                  targetPackageId
                )
              ]
            : []),
          commandDiagnostic(
            'third-party.settings-lockfile-persistent-writer-source.writer-host-blocked',
            targetPackageId
          )
        ]
      })
    }
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreePersistentWriterSource(source) || !noRuntimeOrWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.settings-lockfile-persistent-writer-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.settings-lockfile-persistent-writer-source.write-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party settings-lockfile persistent writer requires a future explicit contained writer host before command continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackSettingsLockfilePersistentWriterSource = (
  options: CreateThirdPartyDataPackSettingsLockfilePersistentWriterSourceOptions = {}
): (() => Promise<ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult>) => async() => {
  const result = await evaluateSettingsLockfilePersistentWriterSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackSettingsLockfilePersistentWriterBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackSettingsLockfilePersistentWriterSource =
  createThirdPartyDataPackSettingsLockfilePersistentWriterSource()
