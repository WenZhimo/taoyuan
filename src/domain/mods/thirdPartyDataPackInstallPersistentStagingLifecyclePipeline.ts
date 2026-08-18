import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import {
  ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError,
  type ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
} from './thirdPartyDataPackInstallCommandPostCommitAcknowledgementSource'
import type {
  ThirdPartyDataPackPackageFilePersistentStagingPipelineResult
} from './thirdPartyDataPackPackageFilePersistentStagingPipeline'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_LIFECYCLE_PIPELINE_KIND =
  'third-party-install-persistent-staging-lifecycle-pipeline'
export const THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_LIFECYCLE_PIPELINE_MODE =
  'default-disabled-install-persistent-staging-lifecycle-pipeline'

export type ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineCheckId =
  | 'package-file-persistent-staging-written'
  | 'install-command-lifecycle-ready'
  | 'install-target-consistent'
  | 'package-summary-consistent'
  | 'candidate-hash-consistent'
  | 'lockfile-hash-consistent'
  | 'contained-effects-intact'

export interface ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineCheck {
  readonly id: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineEffectSummary {
  readonly installPersistentStagingLifecyclePipelineCalled: boolean
  readonly packageFilePersistentStagingPipelineCalled: boolean
  readonly installCommandLifecyclePipelineCalled: boolean
  readonly packageFilePersistentWriteAcknowledged: boolean
  readonly installCommandLifecycleAcknowledged: boolean
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

export interface ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_LIFECYCLE_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_LIFECYCLE_PIPELINE_MODE
  readonly status: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineStatus
  readonly reason: string
  readonly readOnly: boolean
  readonly enabled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly packageFilePersistentStagingPipelineStatus?:
    ThirdPartyDataPackPackageFilePersistentStagingPipelineResult['status']
  readonly installCommandLifecyclePipelineStatus?:
    ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult['status']
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
  readonly persistentWriteExecuted: boolean
  readonly writtenFileCount: number
  readonly backedUpFileCount: number
  readonly verificationOutcomeKind?:
    ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult['verificationOutcomeKind']
  readonly checks: readonly ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineEffectSummary
}

export interface CreateThirdPartyDataPackInstallPersistentStagingLifecyclePipelineOptions {
  readonly enabled?: boolean
  readonly readPackageFilePersistentStagingPipeline?: () =>
    Awaitable<ThirdPartyDataPackPackageFilePersistentStagingPipelineResult>
  readonly readInstallCommandLifecyclePipeline?: () =>
    Awaitable<ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult>
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
  'packageFilePersistentStagingPipeline',
  'installCommandLifecyclePipeline',
  'packageFileStagingSource',
  'packageFilePersistentWriteProbe',
  'installCommandPostCommitAcknowledgementSource',
  'transactionCommandDispatcherSource',
  'atomicTransactionCommitExecutorSource',
  'postCommitVerificationReadAcknowledgementSource',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'programDirectoryPath',
  'appDataDirectory',
  'contentUri',
  'fileUri',
  'storage',
  'storageAdapter',
  'packageWriter',
  'packageFileWriter',
  'packageBackupWriter',
  'settingsWriter',
  'lockfileWriter',
  'modLockWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'recoveryLogStorage',
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

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineSafeDiagnostic => {
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
      ?? 'third-party.install-persistent-staging-lifecycle-pipeline.diagnostic-copy',
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
): readonly ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineSafeDiagnostic[] = []
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
): ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineSafeDiagnostic => Object.freeze({
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

const stagingNoUnexpectedEffects = (
  staging: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult
): boolean => staging.effects.officialRegistryPublished === false
  && staging.effects.thirdPartyRegistryPublished === false
  && staging.effects.liveRegistryMutated === false
  && staging.effects.liveRegistrySwapped === false
  && staging.effects.previousRegistryRestored === false
  && staging.effects.candidateRegistryExposed === false
  && staging.effects.runtimeEnablementAllowed === false
  && staging.effects.electronIpcExposed === false
  && staging.effects.transactionCommitted === false
  && staging.effects.runtimePublicationCommitted === false
  && staging.effects.postCommitVerificationExecuted === false
  && staging.effects.uiIpcResponseDelivered === false
  && staging.effects.packageFilesRestored === false
  && staging.effects.lockfileWritten === false
  && staging.effects.lockfileRestored === false
  && staging.effects.settingsWritten === false
  && staging.effects.settingsRestored === false
  && staging.effects.savesWritten === false
  && staging.effects.cacheWritten === false
  && staging.effects.transactionLogWritten === false
  && staging.effects.recoveryLogRead === false
  && staging.effects.recoveryLogReplayed === false
  && staging.effects.rollbackExecuted === false
  && staging.effects.diagnosticsWritten === false

const lifecycleNoUnexpectedEffects = (
  lifecycle: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
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
  && lifecycle.effects.packageFilesWritten === false
  && lifecycle.effects.packageBackupsWritten === false
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

const safeSkippedStaging = (
  staging: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult
): boolean => staging.status === 'skipped'
  && staging.effects.packageFilesWritten === false
  && staging.effects.packageBackupsWritten === false
  && stagingNoUnexpectedEffects(staging)
  && pathFreeSource(staging)

const safeWrittenStaging = (
  staging: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult
): boolean => staging.status === 'written'
  && staging.persistentWriteExecuted === true
  && staging.packageFileWriteProbe === 'written'
  && staging.writeProbeAllowed === true
  && staging.writtenFileCount > 0
  && staging.effects.packageFilePersistentWriteProbeCalled === true
  && staging.effects.packageFilesWritten === true
  && stagingNoUnexpectedEffects(staging)
  && pathFreeSource(staging)

const safeReadyLifecycle = (
  lifecycle: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
): boolean => lifecycle.status === 'ready'
  && lifecycle.requestedCommandId === 'install'
  && lifecycle.commandContinuationAllowed === true
  && lifecycle.uiIpcResultContinuationAllowed === true
  && lifecycle.effects.commandDispatched === true
  && lifecycle.effects.atomicCommitExecutorAcknowledged === true
  && lifecycle.effects.postCommitVerificationAcknowledged === true
  && lifecycle.effects.persistentReadProofAcknowledged === true
  && lifecycleNoUnexpectedEffects(lifecycle)
  && pathFreeSource(lifecycle)

const targetConsistent = (
  staging: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult,
  lifecycle: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
): boolean => staging.requestedCommandId === 'install'
  && lifecycle.requestedCommandId === 'install'
  && staging.targetPackageId !== undefined
  && staging.targetPackageId === lifecycle.targetPackageId
  && staging.selectedPackageIds.includes(staging.targetPackageId)
  && lifecycle.selectedPackageIds.includes(staging.targetPackageId)

const packageSummaryConsistent = (
  staging: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult,
  lifecycle: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
): boolean => arraysEqual(staging.selectedPackageIds, lifecycle.selectedPackageIds)
  && arraysEqual(staging.blockedPackageIds, lifecycle.blockedPackageIds)
  && arraysEqual(staging.loadOrder, lifecycle.loadOrder)
  && staging.registryCount === lifecycle.registryCount
  && staging.entryCount === lifecycle.entryCount
  && staging.packageCount === lifecycle.packageCount

const candidateHashConsistent = (
  staging: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult,
  lifecycle: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
): boolean => staging.candidateHash !== undefined
  && staging.candidateHash === lifecycle.candidateIdentity?.candidateHash

const lockfileHashConsistent = (
  staging: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult,
  lifecycle: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
): boolean => staging.lockfileHash !== undefined
  && staging.lockfileHash === lifecycle.lockfileHash

const containedEffectsIntact = (
  staging: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult,
  lifecycle: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
): boolean => stagingNoUnexpectedEffects(staging)
  && lifecycleNoUnexpectedEffects(lifecycle)
  && staging.effects.packageFilesWritten === true
  && lifecycle.effects.packageFilesWritten === false
  && lifecycle.effects.settingsWritten === false
  && lifecycle.effects.lockfileWritten === false

const check = (
  id: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineCheckId,
  status: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineCheck['status'],
  reason: string
): ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineCheck => Object.freeze({ id, status, reason })

const terminalChecks = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineCheck[] => Object.freeze([
  'package-file-persistent-staging-written',
  'install-command-lifecycle-ready',
  'install-target-consistent',
  'package-summary-consistent',
  'candidate-hash-consistent',
  'lockfile-hash-consistent',
  'contained-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineCheckId,
  status,
  reason
)))

const buildChecks = (
  staging: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult,
  lifecycle: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
): readonly ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineCheck[] => Object.freeze([
  check(
    'package-file-persistent-staging-written',
    safeWrittenStaging(staging) ? 'satisfied' : 'blocked',
    'Install lifecycle may continue only after the persistent package-file staging pipeline writes package files.'
  ),
  check(
    'install-command-lifecycle-ready',
    safeReadyLifecycle(lifecycle) ? 'satisfied' : 'blocked',
    'Install lifecycle must reach the ready post-commit acknowledgement boundary.'
  ),
  check(
    'install-target-consistent',
    targetConsistent(staging, lifecycle) ? 'satisfied' : 'blocked',
    'Package staging and install lifecycle must describe the same install target.'
  ),
  check(
    'package-summary-consistent',
    packageSummaryConsistent(staging, lifecycle) ? 'satisfied' : 'blocked',
    'Package staging and install lifecycle must agree on package lists and totals.'
  ),
  check(
    'candidate-hash-consistent',
    candidateHashConsistent(staging, lifecycle) ? 'satisfied' : 'blocked',
    'Package staging and install lifecycle must preserve the same candidate hash.'
  ),
  check(
    'lockfile-hash-consistent',
    lockfileHashConsistent(staging, lifecycle) ? 'satisfied' : 'blocked',
    'Package staging and install lifecycle must preserve the same lockfile hash.'
  ),
  check(
    'contained-effects-intact',
    containedEffectsIntact(staging, lifecycle) ? 'satisfied' : 'blocked',
    'Combined lifecycle must not carry registry publication, real transaction, UI/IPC, settings, lockfile, save, cache or rollback effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.install-persistent-staging-lifecycle-pipeline.checks.${currentCheck.id}`,
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
  status: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineStatus,
  staging?: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult,
  lifecycle?: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
): ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineEffectSummary => {
  const ready = status === 'ready'
  const continuationAllowed = status !== 'blocked'
  return Object.freeze({
    installPersistentStagingLifecyclePipelineCalled: true,
    packageFilePersistentStagingPipelineCalled: staging !== undefined,
    installCommandLifecyclePipelineCalled: lifecycle !== undefined,
    packageFilePersistentWriteAcknowledged: staging?.status === 'written'
      && staging.persistentWriteExecuted === true,
    installCommandLifecycleAcknowledged: lifecycle?.status === 'ready',
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
    packageFilesWritten: staging?.effects.packageFilesWritten ?? false,
    packageBackupsWritten: staging?.effects.packageBackupsWritten ?? false,
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
    readonly status: ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineStatus
    readonly reason: string
    readonly enabled: boolean
    readonly staging?: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult
    readonly lifecycle?: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
    readonly checks?: readonly ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineSafeDiagnostic[]
  }
): ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult => {
  const source = options.staging ?? options.lifecycle
  const lifecycleIdentity = cloneCandidateIdentity(readOwnDataField(options.lifecycle, 'candidateIdentity'))
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.lifecycle, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const ready = options.status === 'ready'
  const packageWriteExecuted = options.staging?.persistentWriteExecuted === true
  const continuationAllowed = options.status !== 'blocked'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_LIFECYCLE_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_INSTALL_PERSISTENT_STAGING_LIFECYCLE_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: !packageWriteExecuted,
    enabled: options.enabled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
    packageFilePersistentStagingPipelineStatus: readOwnStringField(options.staging, 'status') as
      | ThirdPartyDataPackPackageFilePersistentStagingPipelineResult['status']
      | undefined,
    installCommandLifecyclePipelineStatus: readOwnStringField(options.lifecycle, 'status') as
      | ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult['status']
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
    candidateIdentity: lifecycleIdentity,
    candidateHash: readOwnStringField(options.staging, 'candidateHash') as Sha256Hash | undefined
      ?? lifecycleIdentity?.candidateHash,
    lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash | undefined,
    persistentWriteExecuted: readOwnBooleanField(options.staging, 'persistentWriteExecuted') ?? false,
    writtenFileCount: readOwnNumberField(options.staging, 'writtenFileCount') ?? 0,
    backedUpFileCount: readOwnNumberField(options.staging, 'backedUpFileCount') ?? 0,
    verificationOutcomeKind: readOwnStringField(options.lifecycle, 'verificationOutcomeKind') as
      | ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult['verificationOutcomeKind']
      | undefined,
    checks: options.checks ?? terminalChecks(
      options.status === 'blocked' ? 'blocked' : 'skipped',
      options.reason
    ),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary(options.status, options.staging, options.lifecycle)
  } as ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult)
}

const mergeDiagnostics = (
  staging?: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult,
  lifecycle?: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
): readonly ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineSafeDiagnostic[] => Object.freeze([
  ...safeDiagnostics(readOwnDataField(staging, 'diagnostics') as readonly unknown[] | undefined),
  ...safeDiagnostics(readOwnDataField(lifecycle, 'diagnostics') as readonly unknown[] | undefined)
])

const evaluateInstallPersistentStagingLifecyclePipeline = async(
  options: CreateThirdPartyDataPackInstallPersistentStagingLifecyclePipelineOptions
): Promise<ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party install persistent staging lifecycle pipeline is disabled by default',
      enabled: false
    })
  }

  if (
    options.readPackageFilePersistentStagingPipeline === undefined
    || options.readInstallCommandLifecyclePipeline === undefined
  ) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install persistent staging lifecycle pipeline is enabled without all required sources',
      enabled: true,
      diagnostics: [
        commandDiagnostic('third-party.install-persistent-staging-lifecycle-pipeline.missing-source')
      ]
    })
  }

  let staging: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult
  try {
    staging = await options.readPackageFilePersistentStagingPipeline()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party package file persistent staging pipeline failed before install lifecycle',
      enabled: true,
      diagnostics: [
        commandDiagnostic('third-party.install-persistent-staging-lifecycle-pipeline.staging-source-failed')
      ]
    })
  }

  const stagingDiagnostics = mergeDiagnostics(staging)
  if (safeSkippedStaging(staging)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party install persistent staging lifecycle is not required because package file staging was skipped',
      enabled: true,
      staging,
      diagnostics: stagingDiagnostics,
      checks: terminalChecks('skipped', 'package file persistent staging pipeline was skipped')
    })
  }

  if (!safeWrittenStaging(staging)) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install persistent staging lifecycle requires a written persistent package-file staging acknowledgement before command lifecycle',
      enabled: true,
      staging,
      diagnostics: [
        ...stagingDiagnostics,
        commandDiagnostic(
          'third-party.install-persistent-staging-lifecycle-pipeline.staging-blocked',
          staging.targetPackageId
        )
      ]
    })
  }

  let lifecycle: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
  try {
    lifecycle = await options.readInstallCommandLifecyclePipeline()
  } catch (error) {
    const blockedLifecycle = error instanceof ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError
      ? error.result
      : undefined
    return baseResult({
      status: 'blocked',
      reason: 'third-party install command lifecycle failed before matching persistent package staging',
      enabled: true,
      staging,
      lifecycle: blockedLifecycle,
      diagnostics: [
        ...mergeDiagnostics(staging, blockedLifecycle),
        commandDiagnostic(
          'third-party.install-persistent-staging-lifecycle-pipeline.lifecycle-source-failed',
          staging.targetPackageId
        )
      ]
    })
  }

  const checks = buildChecks(staging, lifecycle)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, staging.targetPackageId)
  const diagnostics = mergeDiagnostics(staging, lifecycle)
  if (blockedDiagnostics.length === 0) {
    return baseResult({
      status: 'ready',
      reason: 'third-party install persistent staging lifecycle accepted matching package-file writes and install command acknowledgement',
      enabled: true,
      staging,
      lifecycle,
      diagnostics,
      checks
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'third-party install persistent staging lifecycle requires matching package-file writes and install command acknowledgement before continuation',
    enabled: true,
    staging,
    lifecycle,
    checks,
    diagnostics: [
      ...diagnostics,
      ...blockedDiagnostics,
      commandDiagnostic(
        'third-party.install-persistent-staging-lifecycle-pipeline.lifecycle-blocked',
        staging.targetPackageId
      )
    ]
  })
}

export const createThirdPartyDataPackInstallPersistentStagingLifecyclePipeline = (
  options: CreateThirdPartyDataPackInstallPersistentStagingLifecyclePipelineOptions = {}
): (() => Promise<ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult>) => async() =>
  evaluateInstallPersistentStagingLifecyclePipeline(options)

export const thirdPartyDataPackInstallPersistentStagingLifecyclePipeline =
  createThirdPartyDataPackInstallPersistentStagingLifecyclePipeline()
