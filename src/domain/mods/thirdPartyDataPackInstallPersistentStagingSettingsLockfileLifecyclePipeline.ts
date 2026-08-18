import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult
} from './thirdPartyDataPackInstallPersistentStagingLifecyclePipeline'
import {
  ThirdPartyDataPackSettingsLockfilePersistentWriterBlockedError,
  type ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
} from './thirdPartyDataPackSettingsLockfilePersistentWriterSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_SETTINGS_LOCKFILE_LIFECYCLE_PIPELINE_KIND =
  'third-party-install-persistent-staging-settings-lockfile-lifecycle-pipeline'
export const THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_SETTINGS_LOCKFILE_LIFECYCLE_PIPELINE_MODE =
  'default-disabled-install-persistent-staging-settings-lockfile-lifecycle-pipeline'

export type ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineCheckId =
  | 'install-persistent-staging-lifecycle-ready'
  | 'settings-lockfile-persistent-writer-written'
  | 'install-target-consistent'
  | 'package-summary-consistent'
  | 'candidate-hash-consistent'
  | 'lockfile-hash-consistent'
  | 'contained-effects-intact'

export interface ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineCheck {
  readonly id: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineEffectSummary {
  readonly installPersistentStagingSettingsLockfileLifecyclePipelineCalled: boolean
  readonly installPersistentStagingLifecyclePipelineCalled: boolean
  readonly settingsLockfilePersistentWriterSourceCalled: boolean
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

export interface ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_SETTINGS_LOCKFILE_LIFECYCLE_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_SETTINGS_LOCKFILE_LIFECYCLE_PIPELINE_MODE
  readonly status: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineStatus
  readonly reason: string
  readonly readOnly: boolean
  readonly enabled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly installPersistentStagingLifecyclePipelineStatus?:
    ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult['status']
  readonly settingsLockfilePersistentWriterSourceStatus?:
    ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult['status']
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
  readonly checks: readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineEffectSummary
}

export interface CreateThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineOptions {
  readonly enabled?: boolean
  readonly readInstallPersistentStagingLifecyclePipeline?: () =>
    Awaitable<ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult>
  readonly readSettingsLockfilePersistentWriterSource?: () =>
    Awaitable<ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult>
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
  'installPersistentStagingLifecyclePipeline',
  'settingsLockfilePersistentWriterSource',
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

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineSafeDiagnostic => {
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
      ?? 'third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.diagnostic-copy',
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
): readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineSafeDiagnostic[] = []
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
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineSafeDiagnostic => Object.freeze({
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
  lifecycle: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult
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
  && lifecycle.effects.lockfileWritten === false
  && lifecycle.effects.lockfileRestored === false
  && lifecycle.effects.settingsWritten === false
  && lifecycle.effects.settingsRestored === false
  && lifecycle.effects.savesWritten === false
  && lifecycle.effects.cacheWritten === false
  && lifecycle.effects.transactionLogWritten === false
  && lifecycle.effects.recoveryLogRead === false
  && lifecycle.effects.recoveryLogReplayed === false
  && lifecycle.effects.rollbackExecuted === false
  && lifecycle.effects.diagnosticsWritten === false

const settingsWriterNoUnexpectedEffects = (
  settingsWriter: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): boolean => settingsWriter.effects.officialRegistryPublished === false
  && settingsWriter.effects.thirdPartyRegistryPublished === false
  && settingsWriter.effects.liveRegistryMutated === false
  && settingsWriter.effects.liveRegistrySwapped === false
  && settingsWriter.effects.previousRegistryReleased === false
  && settingsWriter.effects.previousRegistryRestored === false
  && settingsWriter.effects.candidateRegistryExposed === false
  && settingsWriter.effects.runtimeEnablementAllowed === false
  && settingsWriter.effects.modManagementUiMounted === false
  && settingsWriter.effects.electronIpcExposed === false
  && settingsWriter.effects.webFilePickerOpened === false
  && settingsWriter.effects.androidFilePickerOpened === false
  && settingsWriter.effects.commandDispatcherCalled === false
  && settingsWriter.effects.commandDispatched === false
  && settingsWriter.effects.atomicCommitExecutorCalled === false
  && settingsWriter.effects.transactionCommitted === false
  && settingsWriter.effects.transactionLogPrepared === false
  && settingsWriter.effects.runtimePublicationCommitted === false
  && settingsWriter.effects.postCommitVerificationExecuted === false
  && settingsWriter.effects.uiIpcResponseDelivered === false
  && settingsWriter.effects.packageFilesWritten === false
  && settingsWriter.effects.packageBackupsWritten === false
  && settingsWriter.effects.packageFilesRestored === false
  && settingsWriter.effects.lockfileRestored === false
  && settingsWriter.effects.settingsRestored === false
  && settingsWriter.effects.savesWritten === false
  && settingsWriter.effects.cacheWritten === false
  && settingsWriter.effects.transactionLogWritten === false
  && settingsWriter.effects.recoveryLogRead === false
  && settingsWriter.effects.recoveryLogReplayed === false
  && settingsWriter.effects.rollbackExecuted === false
  && settingsWriter.effects.diagnosticsWritten === false

const safeSkippedLifecycle = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult
): boolean => lifecycle.status === 'skipped'
  && lifecycle.effects.packageFilesWritten === false
  && lifecycle.effects.packageBackupsWritten === false
  && lifecycleNoUnexpectedEffects(lifecycle)
  && pathFreeSource(lifecycle)

const safeReadyLifecycle = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult
): boolean => lifecycle.status === 'ready'
  && lifecycle.requestedCommandId === 'install'
  && lifecycle.commandContinuationAllowed === true
  && lifecycle.uiIpcResultContinuationAllowed === true
  && lifecycle.effects.packageFilePersistentWriteAcknowledged === true
  && lifecycle.effects.installCommandLifecycleAcknowledged === true
  && lifecycle.effects.commandDispatched === true
  && lifecycle.effects.atomicCommitExecutorAcknowledged === true
  && lifecycle.effects.postCommitVerificationAcknowledged === true
  && lifecycle.effects.persistentReadProofAcknowledged === true
  && lifecycle.effects.packageFilesWritten === true
  && lifecycleNoUnexpectedEffects(lifecycle)
  && pathFreeSource(lifecycle)

const safeWrittenSettingsWriter = (
  settingsWriter: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): boolean => settingsWriter.status === 'written'
  && settingsWriter.requestedCommandId === 'install'
  && settingsWriter.commandContinuationAllowed === true
  && settingsWriter.settingsLockfileCommitSourceStatus === 'accepted'
  && settingsWriter.settingsLockfilePersistentWriterHostStatus === 'written'
  && settingsWriter.effects.settingsLockfilePersistentWriterHostWritten === true
  && settingsWriter.effects.settingsWritten === true
  && settingsWriter.effects.lockfileWritten === true
  && settingsWriterNoUnexpectedEffects(settingsWriter)
  && pathFreeSource(settingsWriter)

const targetConsistent = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult,
  settingsWriter: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): boolean => lifecycle.requestedCommandId === 'install'
  && settingsWriter.requestedCommandId === 'install'
  && lifecycle.targetPackageId !== undefined
  && lifecycle.targetPackageId === settingsWriter.targetPackageId
  && lifecycle.selectedPackageIds.includes(lifecycle.targetPackageId)
  && settingsWriter.selectedPackageIds.includes(lifecycle.targetPackageId)

const packageSummaryConsistent = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult,
  settingsWriter: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): boolean => arraysEqual(lifecycle.selectedPackageIds, settingsWriter.selectedPackageIds)
  && arraysEqual(lifecycle.blockedPackageIds, settingsWriter.blockedPackageIds)
  && arraysEqual(lifecycle.loadOrder, settingsWriter.loadOrder)
  && lifecycle.registryCount === settingsWriter.registryCount
  && lifecycle.entryCount === settingsWriter.entryCount
  && lifecycle.packageCount === settingsWriter.packageCount

const candidateHashConsistent = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult,
  settingsWriter: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): boolean => lifecycle.candidateHash !== undefined
  && lifecycle.candidateHash === settingsWriter.candidateIdentity?.candidateHash

const lockfileHashConsistent = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult,
  settingsWriter: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): boolean => lifecycle.lockfileHash !== undefined
  && lifecycle.lockfileHash === settingsWriter.lockfileHash

const containedEffectsIntact = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult,
  settingsWriter: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): boolean => lifecycleNoUnexpectedEffects(lifecycle)
  && settingsWriterNoUnexpectedEffects(settingsWriter)
  && lifecycle.effects.packageFilesWritten === true
  && lifecycle.effects.settingsWritten === false
  && lifecycle.effects.lockfileWritten === false
  && settingsWriter.effects.packageFilesWritten === false
  && settingsWriter.effects.settingsWritten === true
  && settingsWriter.effects.lockfileWritten === true
  && settingsWriter.effects.transactionLogWritten === false

const check = (
  id: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineCheckId,
  status: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineCheck['status'],
  reason: string
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineCheck => Object.freeze({
  id,
  status,
  reason
})

const terminalChecks = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineCheck[] => Object.freeze([
  'install-persistent-staging-lifecycle-ready',
  'settings-lockfile-persistent-writer-written',
  'install-target-consistent',
  'package-summary-consistent',
  'candidate-hash-consistent',
  'lockfile-hash-consistent',
  'contained-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineCheckId,
  status,
  reason
)))

const buildChecks = (
  lifecycle: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult,
  settingsWriter: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineCheck[] => Object.freeze([
  check(
    'install-persistent-staging-lifecycle-ready',
    safeReadyLifecycle(lifecycle) ? 'satisfied' : 'blocked',
    'Install persistent staging lifecycle must be ready before settings and lockfile writes converge.'
  ),
  check(
    'settings-lockfile-persistent-writer-written',
    safeWrittenSettingsWriter(settingsWriter) ? 'satisfied' : 'blocked',
    'Settings-lockfile persistent writer source must acknowledge contained settings and lockfile writes.'
  ),
  check(
    'install-target-consistent',
    targetConsistent(lifecycle, settingsWriter) ? 'satisfied' : 'blocked',
    'Install lifecycle and settings-lockfile writer must describe the same install target.'
  ),
  check(
    'package-summary-consistent',
    packageSummaryConsistent(lifecycle, settingsWriter) ? 'satisfied' : 'blocked',
    'Install lifecycle and settings-lockfile writer must agree on package lists and totals.'
  ),
  check(
    'candidate-hash-consistent',
    candidateHashConsistent(lifecycle, settingsWriter) ? 'satisfied' : 'blocked',
    'Install lifecycle and settings-lockfile writer must preserve the same candidate hash.'
  ),
  check(
    'lockfile-hash-consistent',
    lockfileHashConsistent(lifecycle, settingsWriter) ? 'satisfied' : 'blocked',
    'Install lifecycle and settings-lockfile writer must preserve the same lockfile hash.'
  ),
  check(
    'contained-effects-intact',
    containedEffectsIntact(lifecycle, settingsWriter) ? 'satisfied' : 'blocked',
    'Combined lifecycle must only carry prior package-file writes plus contained settings and lockfile writes.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.checks.${currentCheck.id}`,
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

const effectSummary = (
  status: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineStatus,
  lifecycle?: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult,
  settingsWriter?: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineEffectSummary => {
  const ready = status === 'ready'
  const continuationAllowed = status !== 'blocked'
  return Object.freeze({
    installPersistentStagingSettingsLockfileLifecyclePipelineCalled: true,
    installPersistentStagingLifecyclePipelineCalled: lifecycle !== undefined,
    settingsLockfilePersistentWriterSourceCalled: settingsWriter !== undefined,
    packageFilePersistentWriteAcknowledged: lifecycle?.effects.packageFilePersistentWriteAcknowledged ?? false,
    installCommandLifecycleAcknowledged: lifecycle?.effects.installCommandLifecycleAcknowledged ?? false,
    settingsLockfilePersistentWriterAcknowledged: settingsWriter?.effects.settingsLockfilePersistentWriterHostWritten ?? false,
    commandDispatched: lifecycle?.effects.commandDispatched ?? false,
    atomicCommitExecutorAcknowledged: lifecycle?.effects.atomicCommitExecutorAcknowledged ?? false,
    postCommitVerificationAcknowledged: lifecycle?.effects.postCommitVerificationAcknowledged ?? false,
    persistentReadProofAcknowledged: lifecycle?.effects.persistentReadProofAcknowledged ?? false,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
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
    lockfileWritten: settingsWriter?.effects.lockfileWritten ?? false,
    lockfileRestored: false,
    settingsWritten: settingsWriter?.effects.settingsWritten ?? false,
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
    readonly status: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineStatus
    readonly reason: string
    readonly enabled: boolean
    readonly lifecycle?: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult
    readonly settingsWriter?: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
    readonly checks?: readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineSafeDiagnostic[]
  }
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult => {
  const source = options.lifecycle ?? options.settingsWriter
  const settingsIdentity = cloneCandidateIdentity(readOwnDataField(options.settingsWriter, 'candidateIdentity'))
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.settingsWriter, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const ready = options.status === 'ready'
  const packageWriteExecuted = options.lifecycle?.persistentWriteExecuted === true
  const settingsWriteExecuted = options.settingsWriter?.status === 'written'
  const continuationAllowed = options.status !== 'blocked'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_SETTINGS_LOCKFILE_LIFECYCLE_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_SETTINGS_LOCKFILE_LIFECYCLE_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: !(packageWriteExecuted || settingsWriteExecuted),
    enabled: options.enabled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
    installPersistentStagingLifecyclePipelineStatus: readOwnStringField(options.lifecycle, 'status') as
      | ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult['status']
      | undefined,
    settingsLockfilePersistentWriterSourceStatus: readOwnStringField(options.settingsWriter, 'status') as
      | ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult['status']
      | undefined,
    requestedCommandId: readOwnStringField(source, 'requestedCommandId') === 'install' ? 'install' as const : undefined,
    targetPackageId: readOwnStringField(source, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidatePaths,
    loadOrder,
    registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(source, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity: settingsIdentity,
    candidateHash: readOwnStringField(options.lifecycle, 'candidateHash') as Sha256Hash | undefined
      ?? settingsIdentity?.candidateHash,
    lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash | undefined,
    persistentPackageWriteExecuted: packageWriteExecuted,
    writtenFileCount: readOwnNumberField(options.lifecycle, 'writtenFileCount') ?? 0,
    backedUpFileCount: readOwnNumberField(options.lifecycle, 'backedUpFileCount') ?? 0,
    persistentSettingsLockfileWriteExecuted: settingsWriteExecuted,
    checks: options.checks ?? terminalChecks(
      options.status === 'blocked' ? 'blocked' : 'skipped',
      options.reason
    ),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary(options.status, options.lifecycle, options.settingsWriter)
  } as ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult)
}

const mergeDiagnostics = (
  lifecycle?: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult,
  settingsWriter?: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): readonly ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineSafeDiagnostic[] => Object.freeze([
  ...safeDiagnostics(readOwnDataField(lifecycle, 'diagnostics') as readonly unknown[] | undefined),
  ...safeDiagnostics(readOwnDataField(settingsWriter, 'diagnostics') as readonly unknown[] | undefined)
])

const evaluateInstallPersistentStagingSettingsLockfileLifecyclePipeline = async(
  options: CreateThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineOptions
): Promise<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party install persistent staging settings-lockfile lifecycle pipeline is disabled by default',
      enabled: false
    })
  }

  if (
    options.readInstallPersistentStagingLifecyclePipeline === undefined
    || options.readSettingsLockfilePersistentWriterSource === undefined
  ) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install persistent staging settings-lockfile lifecycle pipeline is enabled without all required sources',
      enabled: true,
      diagnostics: [
        commandDiagnostic('third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.missing-source')
      ]
    })
  }

  let lifecycle: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult
  try {
    lifecycle = await options.readInstallPersistentStagingLifecyclePipeline()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install persistent staging lifecycle failed before settings-lockfile writer convergence',
      enabled: true,
      diagnostics: [
        commandDiagnostic('third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.lifecycle-source-failed')
      ]
    })
  }

  const lifecycleDiagnostics = mergeDiagnostics(lifecycle)
  if (safeSkippedLifecycle(lifecycle)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party settings-lockfile lifecycle is not required because install persistent staging lifecycle was skipped',
      enabled: true,
      lifecycle,
      diagnostics: lifecycleDiagnostics,
      checks: terminalChecks('skipped', 'install persistent staging lifecycle was skipped')
    })
  }

  if (!safeReadyLifecycle(lifecycle)) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party settings-lockfile lifecycle requires ready install persistent staging lifecycle before writer source',
      enabled: true,
      lifecycle,
      diagnostics: [
        ...lifecycleDiagnostics,
        commandDiagnostic(
          'third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.lifecycle-blocked',
          lifecycle.targetPackageId
        )
      ]
    })
  }

  let settingsWriter: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
  try {
    settingsWriter = await options.readSettingsLockfilePersistentWriterSource()
  } catch (error) {
    const blockedSettingsWriter = error instanceof ThirdPartyDataPackSettingsLockfilePersistentWriterBlockedError
      ? error.result
      : undefined
    return baseResult({
      status: 'blocked',
      reason: 'third-party settings-lockfile persistent writer source failed before matching install persistent staging lifecycle',
      enabled: true,
      lifecycle,
      settingsWriter: blockedSettingsWriter,
      diagnostics: [
        ...mergeDiagnostics(lifecycle, blockedSettingsWriter),
        commandDiagnostic(
          'third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.settings-writer-source-failed',
          lifecycle.targetPackageId
        )
      ]
    })
  }

  const checks = buildChecks(lifecycle, settingsWriter)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, lifecycle.targetPackageId)
  const diagnostics = mergeDiagnostics(lifecycle, settingsWriter)
  if (blockedDiagnostics.length === 0) {
    return baseResult({
      status: 'ready',
      reason: 'third-party install persistent staging settings-lockfile lifecycle accepted matching package-file and settings-lockfile write acknowledgements',
      enabled: true,
      lifecycle,
      settingsWriter,
      diagnostics,
      checks
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'third-party install persistent staging settings-lockfile lifecycle requires matching package-file and settings-lockfile write acknowledgements before continuation',
    enabled: true,
    lifecycle,
    settingsWriter,
    checks,
    diagnostics: [
      ...diagnostics,
      ...blockedDiagnostics,
      commandDiagnostic(
        'third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.writer-blocked',
        lifecycle.targetPackageId
      )
    ]
  })
}

export const createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline = (
  options: CreateThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineOptions = {}
): (() => Promise<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult>) => async() =>
  evaluateInstallPersistentStagingSettingsLockfileLifecyclePipeline(options)

export const thirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline =
  createThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline()
