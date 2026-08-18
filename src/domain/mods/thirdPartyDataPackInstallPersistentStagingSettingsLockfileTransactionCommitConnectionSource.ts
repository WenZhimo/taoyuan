import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
} from './thirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_SETTINGS_LOCKFILE_TRANSACTION_COMMIT_CONNECTION_SOURCE_KIND =
  'third-party-install-persistent-staging-settings-lockfile-transaction-commit-connection-source'
export const THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_SETTINGS_LOCKFILE_TRANSACTION_COMMIT_CONNECTION_SOURCE_MODE =
  'default-disabled-install-persistent-staging-settings-lockfile-transaction-commit-connection-source'

export type ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceStatus =
  | 'accepted'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostStatus =
  | 'accepted'
  | 'blocked'

export type ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionCheckId =
  | 'install-persistent-staging-settings-lockfile-lifecycle-ready'
  | 'transaction-commit-connection-accepted'
  | 'install-target-consistent'
  | 'package-summary-consistent'
  | 'candidate-hash-consistent'
  | 'lockfile-hash-consistent'
  | 'contained-effects-intact'

export interface ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionCheck {
  readonly id: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostEnvelope {
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
  readonly persistentPackageWriteExecuted: boolean
  readonly persistentSettingsLockfileWriteExecuted: boolean
  readonly writtenFileCount: number
  readonly backedUpFileCount: number
}

export interface ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostEffectSummary {
  readonly installTransactionCommitConnectionHostCalled: boolean
  readonly installTransactionCommitConnectionHostAccepted: boolean
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

export interface ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult {
  readonly status: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostStatus
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
  readonly persistentPackageWriteExecuted?: boolean
  readonly persistentSettingsLockfileWriteExecuted?: boolean
  readonly writtenFileCount?: number
  readonly backedUpFileCount?: number
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostEffectSummary
}

export interface ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionEffectSummary {
  readonly installPersistentStagingSettingsLockfileTransactionCommitConnectionSourceCalled: boolean
  readonly installPersistentStagingSettingsLockfileLifecyclePipelineCalled: boolean
  readonly installTransactionCommitConnectionHostCalled: boolean
  readonly installTransactionCommitConnectionHostAccepted: boolean
  readonly transactionCommitConnectionAcknowledged: boolean
  readonly packageFilePersistentWriteAcknowledged: boolean
  readonly installCommandLifecycleAcknowledged: boolean
  readonly settingsLockfilePersistentWriterAcknowledged: boolean
  readonly commandDispatched: boolean
  readonly atomicCommitExecutorAcknowledged: boolean
  readonly postCommitVerificationAcknowledged: boolean
  readonly persistentReadProofAcknowledged: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
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
  readonly packageFilesWritten: boolean
  readonly packageBackupsWritten: boolean
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

export interface ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_SETTINGS_LOCKFILE_TRANSACTION_COMMIT_CONNECTION_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_SETTINGS_LOCKFILE_TRANSACTION_COMMIT_CONNECTION_SOURCE_MODE
  readonly status: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceStatus
  readonly reason: string
  readonly readOnly: boolean
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly installPersistentStagingSettingsLockfileLifecyclePipelineStatus?:
    ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult['status']
  readonly installTransactionCommitConnectionHostStatus?:
    ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostStatus
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
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly persistentPackageWriteExecuted: boolean
  readonly writtenFileCount: number
  readonly backedUpFileCount: number
  readonly persistentSettingsLockfileWriteExecuted: boolean
  readonly transactionCommitConnectionAcknowledged: boolean
  readonly checks: readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionEffectSummary
}

export interface CreateThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceOptions {
  readonly enabled?: boolean
  readonly readInstallPersistentStagingSettingsLockfileLifecyclePipeline?: () =>
    Awaitable<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult>
  readonly acknowledgeInstallTransactionCommit?: (
    envelope: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostEnvelope
  ) => Awaitable<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult>
}

export class ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionBlockedError
  extends Error {
  readonly result: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult

  constructor(result: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult) {
    super('third-party install persistent staging settings-lockfile transaction commit connection blocked continuation')
    this.name = 'ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionBlockedError'
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

const forbiddenSourceFields = [
  'installPersistentStagingSettingsLockfileLifecyclePipeline',
  'installPersistentStagingLifecyclePipeline',
  'settingsLockfilePersistentWriterSource',
  'installTransactionCommitConnectionHost',
  'transactionCommitConnectionHost',
  'transactionCommitHost',
  'transactionHost',
  'packageFilePersistentStagingPipeline',
  'packageFilePersistentWriteProbe',
  'installCommandLifecyclePipeline',
  'settingsLockfileCommitSource',
  'settingsLockfilePersistentWriterHost',
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
  'programDirectoryPath',
  'appDataDirectory',
  'contentUri',
  'fileUri',
  'storage',
  'storageAdapter',
  'electronHost',
  'webHost',
  'androidHost',
  'window',
  'document',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

const forbiddenHostFields = [
  'installPersistentStagingSettingsLockfileLifecyclePipeline',
  'installPersistentStagingSettingsLockfileLifecycleResult',
  'installTransactionCommitConnectionEnvelope',
  'installTransactionCommitConnectionHost',
  'transactionCommitConnectionHost',
  'transactionCommitHost',
  'transactionHost',
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
  'programDirectoryPath',
  'appDataDirectory',
  'electronHost',
  'webHost',
  'androidHost',
  'window',
  'document',
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

const pathFreeSource = (
  source: object | undefined
): boolean => source !== undefined && forbiddenSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const pathFreeHostResult = (
  hostResult: object | undefined
): boolean => hostResult !== undefined && forbiddenHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSafeDiagnostic => {
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
      ?? 'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSafeDiagnostic[] = []
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
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSafeDiagnostic => Object.freeze({
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

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const lifecycleNoUnexpectedEffects = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
): boolean => lifecycle.effects.officialRegistryPublished === false
  && lifecycle.effects.thirdPartyRegistryPublished === false
  && lifecycle.effects.liveRegistryMutated === false
  && lifecycle.effects.liveRegistrySwapped === false
  && lifecycle.effects.previousRegistryReleased === false
  && lifecycle.effects.previousRegistryRestored === false
  && lifecycle.effects.candidateRegistryExposed === false
  && lifecycle.effects.runtimeEnablementAllowed === false
  && lifecycle.effects.modManagementUiMounted === false
  && lifecycle.effects.electronIpcExposed === false
  && lifecycle.effects.webFilePickerOpened === false
  && lifecycle.effects.androidFilePickerOpened === false
  && lifecycle.effects.transactionCommitted === false
  && lifecycle.effects.transactionLogPrepared === false
  && lifecycle.effects.runtimePublicationCommitted === false
  && lifecycle.effects.postCommitVerificationExecuted === false
  && lifecycle.effects.uiIpcResponseDelivered === false
  && lifecycle.effects.transactionLogRead === false
  && lifecycle.effects.packageStateRead === false
  && lifecycle.effects.settingsRead === false
  && lifecycle.effects.lockfileRead === false
  && lifecycle.effects.liveRegistryRead === false
  && lifecycle.effects.saveCacheIsolationChecked === false
  && lifecycle.effects.packageFilesRestored === false
  && lifecycle.effects.lockfileRestored === false
  && lifecycle.effects.settingsRestored === false
  && lifecycle.effects.savesWritten === false
  && lifecycle.effects.cacheWritten === false
  && lifecycle.effects.transactionLogWritten === false
  && lifecycle.effects.recoveryLogRead === false
  && lifecycle.effects.recoveryLogReplayed === false
  && lifecycle.effects.rollbackExecuted === false
  && lifecycle.effects.diagnosticsWritten === false

const safeSkippedLifecycle = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
): boolean => lifecycle.status === 'skipped'
  && lifecycle.effects.packageFilesWritten === false
  && lifecycle.effects.packageBackupsWritten === false
  && lifecycle.effects.settingsWritten === false
  && lifecycle.effects.lockfileWritten === false
  && lifecycleNoUnexpectedEffects(lifecycle)
  && pathFreeSource(lifecycle)

const safeReadyLifecycle = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
): boolean => lifecycle.status === 'ready'
  && lifecycle.requestedCommandId === 'install'
  && lifecycle.targetPackageId !== undefined
  && lifecycle.commandContinuationAllowed === true
  && lifecycle.uiIpcResultContinuationAllowed === true
  && lifecycle.candidateHash !== undefined
  && lifecycle.lockfileHash !== undefined
  && lifecycle.persistentPackageWriteExecuted === true
  && lifecycle.persistentSettingsLockfileWriteExecuted === true
  && lifecycle.effects.packageFilePersistentWriteAcknowledged === true
  && lifecycle.effects.installCommandLifecycleAcknowledged === true
  && lifecycle.effects.settingsLockfilePersistentWriterAcknowledged === true
  && lifecycle.effects.commandDispatched === true
  && lifecycle.effects.atomicCommitExecutorAcknowledged === true
  && lifecycle.effects.postCommitVerificationAcknowledged === true
  && lifecycle.effects.persistentReadProofAcknowledged === true
  && lifecycle.effects.packageFilesWritten === true
  && lifecycle.effects.settingsWritten === true
  && lifecycle.effects.lockfileWritten === true
  && lifecycleNoUnexpectedEffects(lifecycle)
  && pathFreeSource(lifecycle)

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
    if (key === 'installTransactionCommitConnectionHostCalled') return descriptor.value === true
    if (key === 'installTransactionCommitConnectionHostAccepted') return descriptor.value === accepted
    return descriptor.value === false
  })
}

const hostResultMatchesLifecycle = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult,
  hostResult: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult
): boolean => {
  const lifecycleCandidateIdentity = cloneCandidateIdentity(readOwnDataField(lifecycle, 'candidateIdentity'))
  return readOwnStringField(hostResult, 'status') === 'accepted'
    && readOwnStringField(hostResult, 'requestedCommandId') === 'install'
    && readOwnStringField(hostResult, 'targetPackageId') === lifecycle.targetPackageId
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'selectedPackageIds')),
      clonePackageIds(readOwnDataField(lifecycle, 'selectedPackageIds'))
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'blockedPackageIds')),
      clonePackageIds(readOwnDataField(lifecycle, 'blockedPackageIds'))
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'loadOrder')),
      clonePackageIds(readOwnDataField(lifecycle, 'loadOrder'))
    )
    && readOwnNumberField(hostResult, 'registryCount') === lifecycle.registryCount
    && readOwnNumberField(hostResult, 'entryCount') === lifecycle.entryCount
    && readOwnNumberField(hostResult, 'packageCount') === lifecycle.packageCount
    && readOwnStringField(hostResult, 'candidateHash') === lifecycleCandidateIdentity?.candidateHash
    && readOwnStringField(hostResult, 'candidateHash') === lifecycle.candidateHash
    && readOwnStringField(hostResult, 'lockfileHash') === lifecycle.lockfileHash
    && readOwnBooleanField(hostResult, 'persistentPackageWriteExecuted') === lifecycle.persistentPackageWriteExecuted
    && readOwnBooleanField(hostResult, 'persistentSettingsLockfileWriteExecuted') ===
      lifecycle.persistentSettingsLockfileWriteExecuted
    && readOwnNumberField(hostResult, 'writtenFileCount') === lifecycle.writtenFileCount
    && readOwnNumberField(hostResult, 'backedUpFileCount') === lifecycle.backedUpFileCount
    && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
    && pathFreeHostResult(hostResult)
}

const check = (
  id: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionCheckId,
  status: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionCheck['status'],
  reason: string
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionCheck => Object.freeze({
  id,
  status,
  reason
})

const terminalChecks = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionCheck[] => Object.freeze([
  'install-persistent-staging-settings-lockfile-lifecycle-ready',
  'transaction-commit-connection-accepted',
  'install-target-consistent',
  'package-summary-consistent',
  'candidate-hash-consistent',
  'lockfile-hash-consistent',
  'contained-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionCheckId,
  status,
  reason
)))

const buildChecks = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult,
  hostResult: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult
): readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionCheck[] => Object.freeze([
  check(
    'install-persistent-staging-settings-lockfile-lifecycle-ready',
    safeReadyLifecycle(lifecycle) ? 'satisfied' : 'blocked',
    'Install persistent staging settings-lockfile lifecycle must be ready before transaction commit connection.'
  ),
  check(
    'transaction-commit-connection-accepted',
    hostResultMatchesLifecycle(lifecycle, hostResult) ? 'satisfied' : 'blocked',
    'Injected transaction commit connection host must accept a matching path-free acknowledgement.'
  ),
  check(
    'install-target-consistent',
    readOwnStringField(hostResult, 'requestedCommandId') === 'install'
      && readOwnStringField(hostResult, 'targetPackageId') === lifecycle.targetPackageId
      && lifecycle.targetPackageId !== undefined
      ? 'satisfied'
      : 'blocked',
    'Transaction commit connection must describe the same install target.'
  ),
  check(
    'package-summary-consistent',
    arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'selectedPackageIds')),
      clonePackageIds(readOwnDataField(lifecycle, 'selectedPackageIds'))
    )
      && arraysEqual(
        clonePackageIds(readOwnDataField(hostResult, 'blockedPackageIds')),
        clonePackageIds(readOwnDataField(lifecycle, 'blockedPackageIds'))
      )
      && arraysEqual(
        clonePackageIds(readOwnDataField(hostResult, 'loadOrder')),
        clonePackageIds(readOwnDataField(lifecycle, 'loadOrder'))
      )
      && readOwnNumberField(hostResult, 'registryCount') === lifecycle.registryCount
      && readOwnNumberField(hostResult, 'entryCount') === lifecycle.entryCount
      && readOwnNumberField(hostResult, 'packageCount') === lifecycle.packageCount
      ? 'satisfied'
      : 'blocked',
    'Transaction commit connection must agree on package lists and totals.'
  ),
  check(
    'candidate-hash-consistent',
    readOwnStringField(hostResult, 'candidateHash') === lifecycle.candidateHash
      && lifecycle.candidateHash !== undefined
      ? 'satisfied'
      : 'blocked',
    'Transaction commit connection must preserve the same candidate hash.'
  ),
  check(
    'lockfile-hash-consistent',
    readOwnStringField(hostResult, 'lockfileHash') === lifecycle.lockfileHash
      && lifecycle.lockfileHash !== undefined
      ? 'satisfied'
      : 'blocked',
    'Transaction commit connection must preserve the same lockfile hash.'
  ),
  check(
    'contained-effects-intact',
    lifecycleNoUnexpectedEffects(lifecycle)
      && lifecycle.effects.packageFilesWritten === true
      && lifecycle.effects.settingsWritten === true
      && lifecycle.effects.lockfileWritten === true
      && hostEffectsContained(
        readOwnDataField(hostResult, 'effects') as object | undefined,
        readOwnStringField(hostResult, 'status') === 'accepted'
      )
      && pathFreeHostResult(hostResult)
      ? 'satisfied'
      : 'blocked',
    'Transaction commit connection must carry only prior contained writes and a no-write acknowledgement.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.checks.${currentCheck.id}`,
    packageId
  )))

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

const buildHostEnvelope = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostEnvelope => deepFreezeObjectGraph({
  requestedCommandId: 'install' as const,
  targetPackageId: lifecycle.targetPackageId as PackageId,
  selectedPackageIds: clonePackageIds(readOwnDataField(lifecycle, 'selectedPackageIds')),
  blockedPackageIds: clonePackageIds(readOwnDataField(lifecycle, 'blockedPackageIds')),
  loadOrder: clonePackageIds(readOwnDataField(lifecycle, 'loadOrder')),
  registryCount: lifecycle.registryCount,
  entryCount: lifecycle.entryCount,
  packageCount: lifecycle.packageCount,
  candidateIdentity: cloneCandidateIdentity(readOwnDataField(lifecycle, 'candidateIdentity')) as ThirdPartyCandidateIdentitySummary,
  lockfileHash: lifecycle.lockfileHash as Sha256Hash,
  persistentPackageWriteExecuted: lifecycle.persistentPackageWriteExecuted,
  persistentSettingsLockfileWriteExecuted: lifecycle.persistentSettingsLockfileWriteExecuted,
  writtenFileCount: lifecycle.writtenFileCount,
  backedUpFileCount: lifecycle.backedUpFileCount
})

const effectSummary = (
  status: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceStatus,
  lifecycle?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult,
  hostResult?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionEffectSummary => {
  const accepted = status === 'accepted'
  const continuationAllowed = status !== 'blocked'
  const hostEffects = readOwnDataField(hostResult, 'effects') as object | undefined
  return Object.freeze({
    installPersistentStagingSettingsLockfileTransactionCommitConnectionSourceCalled: true,
    installPersistentStagingSettingsLockfileLifecyclePipelineCalled: lifecycle !== undefined,
    installTransactionCommitConnectionHostCalled:
      readOwnBooleanField(hostEffects, 'installTransactionCommitConnectionHostCalled') ?? false,
    installTransactionCommitConnectionHostAccepted:
      readOwnBooleanField(hostEffects, 'installTransactionCommitConnectionHostAccepted') ?? false,
    transactionCommitConnectionAcknowledged: accepted,
    packageFilePersistentWriteAcknowledged: lifecycle?.effects.packageFilePersistentWriteAcknowledged ?? false,
    installCommandLifecycleAcknowledged: lifecycle?.effects.installCommandLifecycleAcknowledged ?? false,
    settingsLockfilePersistentWriterAcknowledged:
      lifecycle?.effects.settingsLockfilePersistentWriterAcknowledged ?? false,
    commandDispatched: lifecycle?.effects.commandDispatched ?? false,
    atomicCommitExecutorAcknowledged: lifecycle?.effects.atomicCommitExecutorAcknowledged ?? false,
    postCommitVerificationAcknowledged: lifecycle?.effects.postCommitVerificationAcknowledged ?? false,
    persistentReadProofAcknowledged: lifecycle?.effects.persistentReadProofAcknowledged ?? false,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: accepted,
    uiIpcResultContinuationAllowed: accepted,
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
    packageFilesWritten: lifecycle?.effects.packageFilesWritten ?? false,
    packageBackupsWritten: lifecycle?.effects.packageBackupsWritten ?? false,
    packageFilesRestored: false,
    lockfileWritten: lifecycle?.effects.lockfileWritten ?? false,
    lockfileRestored: false,
    settingsWritten: lifecycle?.effects.settingsWritten ?? false,
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
    readonly status: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly lifecycle?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
    readonly hostResult?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult
    readonly checks?: readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSafeDiagnostic[]
  }
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.lifecycle, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.lifecycle, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.lifecycle, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.lifecycle, 'loadOrder'))
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(options.lifecycle, 'candidateIdentity'))
  const accepted = options.status === 'accepted'
  const continuationAllowed = options.status !== 'blocked'
  const packageWriteExecuted = options.lifecycle?.persistentPackageWriteExecuted === true
  const settingsLockfileWriteExecuted = options.lifecycle?.persistentSettingsLockfileWriteExecuted === true

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_SETTINGS_LOCKFILE_TRANSACTION_COMMIT_CONNECTION_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_SETTINGS_LOCKFILE_TRANSACTION_COMMIT_CONNECTION_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: !(packageWriteExecuted || settingsLockfileWriteExecuted),
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: accepted,
    uiIpcResultContinuationAllowed: accepted,
    installPersistentStagingSettingsLockfileLifecyclePipelineStatus: readOwnStringField(options.lifecycle, 'status') as
      | ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult['status']
      | undefined,
    installTransactionCommitConnectionHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostStatus
      | undefined,
    requestedCommandId: readOwnStringField(options.lifecycle, 'requestedCommandId') === 'install'
      ? 'install' as const
      : undefined,
    targetPackageId: readOwnStringField(options.lifecycle, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidatePaths,
    loadOrder,
    registryCount: readOwnNumberField(options.lifecycle, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.lifecycle, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.lifecycle, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity,
    candidateHash: readOwnStringField(options.lifecycle, 'candidateHash') as Sha256Hash | undefined
      ?? candidateIdentity?.candidateHash,
    lockfileHash: readOwnStringField(options.lifecycle, 'lockfileHash') as Sha256Hash | undefined,
    persistentPackageWriteExecuted: packageWriteExecuted,
    writtenFileCount: readOwnNumberField(options.lifecycle, 'writtenFileCount') ?? 0,
    backedUpFileCount: readOwnNumberField(options.lifecycle, 'backedUpFileCount') ?? 0,
    persistentSettingsLockfileWriteExecuted: settingsLockfileWriteExecuted,
    transactionCommitConnectionAcknowledged: accepted,
    checks: options.checks ?? terminalChecks(
      options.status === 'blocked' ? 'blocked' : 'skipped',
      options.reason
    ),
    diagnostics,
    effects: effectSummary(options.status, options.lifecycle, options.hostResult)
  } as ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult)
}

const mergeDiagnostics = (
  lifecycle?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult,
  hostResult?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult
): readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSafeDiagnostic[] => Object.freeze([
  ...safeDiagnostics(readOwnDataField(lifecycle, 'diagnostics') as readonly unknown[] | undefined),
  ...safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
])

const evaluateInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource = async(
  options: CreateThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceOptions
): Promise<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party install persistent staging settings-lockfile transaction commit connection source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install persistent staging settings-lockfile transaction commit connection source is enabled without a lifecycle reader',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic(
          'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.missing-lifecycle-source'
        )
      ]
    })
  }

  let lifecycle: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
  try {
    lifecycle = await options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install persistent staging settings-lockfile lifecycle failed before transaction commit connection',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic(
          'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.lifecycle-source-failed'
        )
      ]
    })
  }

  const lifecycleDiagnostics = mergeDiagnostics(lifecycle)
  if (safeSkippedLifecycle(lifecycle)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party transaction commit connection is not required because install persistent staging settings-lockfile lifecycle was skipped',
      enabled: true,
      sourceCalled: true,
      lifecycle,
      diagnostics: lifecycleDiagnostics,
      checks: terminalChecks('skipped', 'install persistent staging settings-lockfile lifecycle was skipped')
    })
  }

  if (!safeReadyLifecycle(lifecycle)) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction commit connection requires ready install persistent staging settings-lockfile lifecycle',
      enabled: true,
      sourceCalled: true,
      lifecycle,
      diagnostics: [
        ...lifecycleDiagnostics,
        commandDiagnostic(
          'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.lifecycle-blocked',
          lifecycle.targetPackageId
        )
      ]
    })
  }

  if (options.acknowledgeInstallTransactionCommit === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction commit connection source is enabled without a transaction commit acknowledgement host',
      enabled: true,
      sourceCalled: true,
      lifecycle,
      diagnostics: [
        ...lifecycleDiagnostics,
        commandDiagnostic(
          'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.missing-connection-host',
          lifecycle.targetPackageId
        )
      ]
    })
  }

  let hostResult: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult
  try {
    hostResult = await options.acknowledgeInstallTransactionCommit(buildHostEnvelope(lifecycle))
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction commit connection host failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      lifecycle,
      diagnostics: [
        ...lifecycleDiagnostics,
        commandDiagnostic(
          'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.connection-host-failed',
          lifecycle.targetPackageId
        )
      ]
    })
  }

  const diagnostics = mergeDiagnostics(lifecycle, hostResult)
  const checks = buildChecks(lifecycle, hostResult)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, lifecycle.targetPackageId)

  if (blockedDiagnostics.length === 0) {
    return baseResult({
      status: 'accepted',
      reason: 'third-party install persistent staging settings-lockfile transaction commit connection accepted matching contained write acknowledgements',
      enabled: true,
      sourceCalled: true,
      lifecycle,
      hostResult,
      diagnostics,
      checks
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'third-party install persistent staging settings-lockfile transaction commit connection requires a matching no-write transaction acknowledgement',
    enabled: true,
    sourceCalled: true,
    lifecycle,
    hostResult,
    checks,
    diagnostics: [
      ...diagnostics,
      ...(!pathFreeHostResult(hostResult)
        || !hostEffectsContained(
          readOwnDataField(hostResult, 'effects') as object | undefined,
          readOwnStringField(hostResult, 'status') === 'accepted'
        )
        ? [
            commandDiagnostic(
              'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.unsafe-connection-host-result',
              lifecycle.targetPackageId
            )
          ]
        : []),
      ...blockedDiagnostics,
      commandDiagnostic(
        'third-party.install-persistent-staging-settings-lockfile-transaction-commit-connection-source.connection-blocked',
        lifecycle.targetPackageId
      )
    ]
  })
}

export const createThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource = (
  options: CreateThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceOptions = {}
): (() => Promise<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult>) => async() => {
  const result = await evaluateInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource =
  createThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource()
