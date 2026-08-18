import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
} from './thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READ_WRITE_CONNECTION_SOURCE_KIND =
  'third-party-post-commit-persistent-read-write-connection-source'
export const THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READ_WRITE_CONNECTION_SOURCE_MODE =
  'default-disabled-post-commit-persistent-read-write-connection-source'

export type ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceStatus =
  | 'accepted'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostStatus =
  | 'accepted'
  | 'blocked'

export type ThirdPartyDataPackPostCommitPersistentReadWriteConnectionCheckId =
  | 'transaction-commit-connection-accepted'
  | 'persistent-read-write-connection-accepted'
  | 'install-target-consistent'
  | 'package-summary-consistent'
  | 'candidate-hash-consistent'
  | 'lockfile-hash-consistent'
  | 'contained-read-write-effects-intact'

export interface ThirdPartyDataPackPostCommitPersistentReadWriteConnectionCheck {
  readonly id: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostEnvelope {
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
  readonly transactionCommitConnectionAcknowledged: boolean
}

export interface ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostEffectSummary {
  readonly postCommitPersistentReadWriteConnectionHostCalled: boolean
  readonly postCommitPersistentReadWriteConnectionHostAccepted: boolean
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

export interface ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult {
  readonly status: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostStatus
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
  readonly transactionCommitConnectionAcknowledged?: boolean
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostEffectSummary
}

export interface ThirdPartyDataPackPostCommitPersistentReadWriteConnectionEffectSummary {
  readonly postCommitPersistentReadWriteConnectionSourceCalled: boolean
  readonly transactionCommitConnectionSourceCalled: boolean
  readonly postCommitPersistentReadWriteConnectionHostCalled: boolean
  readonly postCommitPersistentReadWriteConnectionHostAccepted: boolean
  readonly transactionCommitConnectionAcknowledged: boolean
  readonly postCommitPersistentReadWriteConnectionAcknowledged: boolean
  readonly packageFilePersistentWriteAcknowledged: boolean
  readonly settingsLockfilePersistentWriterAcknowledged: boolean
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

export interface ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READ_WRITE_CONNECTION_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READ_WRITE_CONNECTION_SOURCE_MODE
  readonly status: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceStatus
  readonly reason: string
  readonly readOnly: boolean
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly transactionCommitConnectionSourceStatus?:
    ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult['status']
  readonly postCommitPersistentReadWriteConnectionHostStatus?:
    ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostStatus
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
  readonly persistentSettingsLockfileWriteExecuted: boolean
  readonly writtenFileCount: number
  readonly backedUpFileCount: number
  readonly transactionCommitConnectionAcknowledged: boolean
  readonly postCommitPersistentReadWriteConnectionAcknowledged: boolean
  readonly checks: readonly ThirdPartyDataPackPostCommitPersistentReadWriteConnectionCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionEffectSummary
}

export interface CreateThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceOptions {
  readonly enabled?: boolean
  readonly readTransactionCommitConnectionSource?: () =>
    Awaitable<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult>
  readonly acknowledgePostCommitPersistentReadWrite?: (
    envelope: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostEnvelope
  ) => Awaitable<ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult>
}

export class ThirdPartyDataPackPostCommitPersistentReadWriteConnectionBlockedError extends Error {
  readonly result: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult

  constructor(result: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult) {
    super('third-party post-commit persistent read/write connection blocked continuation')
    this.name = 'ThirdPartyDataPackPostCommitPersistentReadWriteConnectionBlockedError'
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
  'transactionCommitConnectionSource',
  'installPersistentStagingSettingsLockfileTransactionCommitConnectionSource',
  'installPersistentStagingSettingsLockfileLifecyclePipeline',
  'postCommitPersistentReadWriteConnectionHost',
  'postCommitPersistentReadWriteHost',
  'persistentReadWriteHost',
  'transactionLogReader',
  'packageStateReader',
  'settingsReader',
  'lockfileReader',
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
  'appDataDirectory',
  'contentUri',
  'fileUri',
  'window',
  'document',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

const forbiddenHostFields = [
  'transactionCommitConnectionSource',
  'postCommitPersistentReadWriteConnectionEnvelope',
  'postCommitPersistentReadWriteConnectionHost',
  'postCommitPersistentReadWriteHost',
  'persistentReadWriteHost',
  'transactionLogReader',
  'packageStateReader',
  'settingsReader',
  'lockfileReader',
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
  'appDataDirectory',
  'contentUri',
  'fileUri',
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
): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSafeDiagnostic => {
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
      ?? 'third-party.post-commit-persistent-read-write-connection-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSafeDiagnostic[] = []
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
): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSafeDiagnostic => Object.freeze({
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

const transactionConnectionNoUnexpectedEffects = (
  source: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
): boolean => source.effects.officialRegistryPublished === false
  && source.effects.thirdPartyRegistryPublished === false
  && source.effects.liveRegistryMutated === false
  && source.effects.liveRegistrySwapped === false
  && source.effects.previousRegistryReleased === false
  && source.effects.previousRegistryRestored === false
  && source.effects.candidateRegistryExposed === false
  && source.effects.runtimeEnablementAllowed === false
  && source.effects.modManagementUiMounted === false
  && source.effects.electronIpcExposed === false
  && source.effects.webFilePickerOpened === false
  && source.effects.androidFilePickerOpened === false
  && source.effects.transactionCommitted === false
  && source.effects.transactionLogPrepared === false
  && source.effects.runtimePublicationCommitted === false
  && source.effects.postCommitVerificationExecuted === false
  && source.effects.uiIpcResponseDelivered === false
  && source.effects.transactionLogRead === false
  && source.effects.packageStateRead === false
  && source.effects.settingsRead === false
  && source.effects.lockfileRead === false
  && source.effects.liveRegistryRead === false
  && source.effects.saveCacheIsolationChecked === false
  && source.effects.packageFilesRestored === false
  && source.effects.lockfileRestored === false
  && source.effects.settingsRestored === false
  && source.effects.savesWritten === false
  && source.effects.cacheWritten === false
  && source.effects.transactionLogWritten === false
  && source.effects.recoveryLogRead === false
  && source.effects.recoveryLogReplayed === false
  && source.effects.rollbackExecuted === false
  && source.effects.diagnosticsWritten === false

const safeSkippedSource = (
  source: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
): boolean => source.status === 'skipped'
  && source.effects.packageFilesWritten === false
  && source.effects.packageBackupsWritten === false
  && source.effects.settingsWritten === false
  && source.effects.lockfileWritten === false
  && source.effects.transactionCommitConnectionAcknowledged === false
  && transactionConnectionNoUnexpectedEffects(source)
  && pathFreeSource(source)

const safeAcceptedSource = (
  source: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
): boolean => source.status === 'accepted'
  && source.requestedCommandId === 'install'
  && source.targetPackageId !== undefined
  && source.commandContinuationAllowed === true
  && source.uiIpcResultContinuationAllowed === true
  && source.candidateHash !== undefined
  && source.lockfileHash !== undefined
  && source.persistentPackageWriteExecuted === true
  && source.persistentSettingsLockfileWriteExecuted === true
  && source.transactionCommitConnectionAcknowledged === true
  && source.effects.packageFilePersistentWriteAcknowledged === true
  && source.effects.settingsLockfilePersistentWriterAcknowledged === true
  && source.effects.transactionCommitConnectionAcknowledged === true
  && source.effects.packageFilesWritten === true
  && source.effects.settingsWritten === true
  && source.effects.lockfileWritten === true
  && transactionConnectionNoUnexpectedEffects(source)
  && pathFreeSource(source)

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
    if (key === 'postCommitPersistentReadWriteConnectionHostCalled') return descriptor.value === true
    if (key === 'postCommitPersistentReadWriteConnectionHostAccepted') return descriptor.value === accepted
    return descriptor.value === false
  })
}

const hostResultMatchesSource = (
  source: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult,
  hostResult: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult
): boolean => readOwnStringField(hostResult, 'status') === 'accepted'
  && readOwnStringField(hostResult, 'requestedCommandId') === 'install'
  && readOwnStringField(hostResult, 'targetPackageId') === source.targetPackageId
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
  && readOwnNumberField(hostResult, 'registryCount') === source.registryCount
  && readOwnNumberField(hostResult, 'entryCount') === source.entryCount
  && readOwnNumberField(hostResult, 'packageCount') === source.packageCount
  && readOwnStringField(hostResult, 'candidateHash') === source.candidateHash
  && readOwnStringField(hostResult, 'lockfileHash') === source.lockfileHash
  && readOwnBooleanField(hostResult, 'persistentPackageWriteExecuted') === source.persistentPackageWriteExecuted
  && readOwnBooleanField(hostResult, 'persistentSettingsLockfileWriteExecuted') ===
    source.persistentSettingsLockfileWriteExecuted
  && readOwnNumberField(hostResult, 'writtenFileCount') === source.writtenFileCount
  && readOwnNumberField(hostResult, 'backedUpFileCount') === source.backedUpFileCount
  && readOwnBooleanField(hostResult, 'transactionCommitConnectionAcknowledged') ===
    source.transactionCommitConnectionAcknowledged
  && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
  && pathFreeHostResult(hostResult)

const check = (
  id: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionCheckId,
  status: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionCheck['status'],
  reason: string
): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionCheck => Object.freeze({
  id,
  status,
  reason
})

const terminalChecks = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackPostCommitPersistentReadWriteConnectionCheck[] => Object.freeze([
  'transaction-commit-connection-accepted',
  'persistent-read-write-connection-accepted',
  'install-target-consistent',
  'package-summary-consistent',
  'candidate-hash-consistent',
  'lockfile-hash-consistent',
  'contained-read-write-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackPostCommitPersistentReadWriteConnectionCheckId,
  status,
  reason
)))

const buildChecks = (
  source: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult,
  hostResult: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult
): readonly ThirdPartyDataPackPostCommitPersistentReadWriteConnectionCheck[] => Object.freeze([
  check(
    'transaction-commit-connection-accepted',
    safeAcceptedSource(source) ? 'satisfied' : 'blocked',
    'Post-commit persistent read/write connection requires an accepted transaction connection source.'
  ),
  check(
    'persistent-read-write-connection-accepted',
    hostResultMatchesSource(source, hostResult) ? 'satisfied' : 'blocked',
    'Injected persistent read/write connection host must accept a matching path-free acknowledgement.'
  ),
  check(
    'install-target-consistent',
    readOwnStringField(hostResult, 'requestedCommandId') === 'install'
      && readOwnStringField(hostResult, 'targetPackageId') === source.targetPackageId
      && source.targetPackageId !== undefined
      ? 'satisfied'
      : 'blocked',
    'Persistent read/write connection must describe the same install target.'
  ),
  check(
    'package-summary-consistent',
    arraysEqual(
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
      && readOwnNumberField(hostResult, 'registryCount') === source.registryCount
      && readOwnNumberField(hostResult, 'entryCount') === source.entryCount
      && readOwnNumberField(hostResult, 'packageCount') === source.packageCount
      ? 'satisfied'
      : 'blocked',
    'Persistent read/write connection must agree on package lists and totals.'
  ),
  check(
    'candidate-hash-consistent',
    readOwnStringField(hostResult, 'candidateHash') === source.candidateHash
      && source.candidateHash !== undefined
      ? 'satisfied'
      : 'blocked',
    'Persistent read/write connection must preserve the same candidate hash.'
  ),
  check(
    'lockfile-hash-consistent',
    readOwnStringField(hostResult, 'lockfileHash') === source.lockfileHash
      && source.lockfileHash !== undefined
      ? 'satisfied'
      : 'blocked',
    'Persistent read/write connection must preserve the same lockfile hash.'
  ),
  check(
    'contained-read-write-effects-intact',
    transactionConnectionNoUnexpectedEffects(source)
      && source.effects.packageFilesWritten === true
      && source.effects.settingsWritten === true
      && source.effects.lockfileWritten === true
      && hostEffectsContained(
        readOwnDataField(hostResult, 'effects') as object | undefined,
        readOwnStringField(hostResult, 'status') === 'accepted'
      )
      && pathFreeHostResult(hostResult)
      ? 'satisfied'
      : 'blocked',
    'Persistent read/write connection may only carry prior contained writes and a no-read/no-write acknowledgement.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackPostCommitPersistentReadWriteConnectionCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.post-commit-persistent-read-write-connection-source.checks.${currentCheck.id}`,
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
  source: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostEnvelope => deepFreezeObjectGraph({
  requestedCommandId: 'install' as const,
  targetPackageId: source.targetPackageId as PackageId,
  selectedPackageIds: clonePackageIds(readOwnDataField(source, 'selectedPackageIds')),
  blockedPackageIds: clonePackageIds(readOwnDataField(source, 'blockedPackageIds')),
  loadOrder: clonePackageIds(readOwnDataField(source, 'loadOrder')),
  registryCount: source.registryCount,
  entryCount: source.entryCount,
  packageCount: source.packageCount,
  candidateIdentity: cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) as ThirdPartyCandidateIdentitySummary,
  lockfileHash: source.lockfileHash as Sha256Hash,
  persistentPackageWriteExecuted: source.persistentPackageWriteExecuted,
  persistentSettingsLockfileWriteExecuted: source.persistentSettingsLockfileWriteExecuted,
  writtenFileCount: source.writtenFileCount,
  backedUpFileCount: source.backedUpFileCount,
  transactionCommitConnectionAcknowledged: source.transactionCommitConnectionAcknowledged
})

const effectSummary = (
  status: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceStatus,
  source?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult,
  hostResult?: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult
): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionEffectSummary => {
  const accepted = status === 'accepted'
  const continuationAllowed = status !== 'blocked'
  const hostEffects = readOwnDataField(hostResult, 'effects') as object | undefined
  return Object.freeze({
    postCommitPersistentReadWriteConnectionSourceCalled: true,
    transactionCommitConnectionSourceCalled: source !== undefined,
    postCommitPersistentReadWriteConnectionHostCalled:
      readOwnBooleanField(hostEffects, 'postCommitPersistentReadWriteConnectionHostCalled') ?? false,
    postCommitPersistentReadWriteConnectionHostAccepted:
      readOwnBooleanField(hostEffects, 'postCommitPersistentReadWriteConnectionHostAccepted') ?? false,
    transactionCommitConnectionAcknowledged: source?.transactionCommitConnectionAcknowledged ?? false,
    postCommitPersistentReadWriteConnectionAcknowledged: accepted,
    packageFilePersistentWriteAcknowledged: source?.effects.packageFilePersistentWriteAcknowledged ?? false,
    settingsLockfilePersistentWriterAcknowledged:
      source?.effects.settingsLockfilePersistentWriterAcknowledged ?? false,
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
    packageFilesWritten: source?.effects.packageFilesWritten ?? false,
    packageBackupsWritten: source?.effects.packageBackupsWritten ?? false,
    packageFilesRestored: false,
    lockfileWritten: source?.effects.lockfileWritten ?? false,
    lockfileRestored: false,
    settingsWritten: source?.effects.settingsWritten ?? false,
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
    readonly status: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
    readonly hostResult?: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult
    readonly checks?: readonly ThirdPartyDataPackPostCommitPersistentReadWriteConnectionCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSafeDiagnostic[]
  }
): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(options.source, 'candidateIdentity'))
  const accepted = options.status === 'accepted'
  const continuationAllowed = options.status !== 'blocked'
  const packageWriteExecuted = options.source?.persistentPackageWriteExecuted === true
  const settingsLockfileWriteExecuted = options.source?.persistentSettingsLockfileWriteExecuted === true

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READ_WRITE_CONNECTION_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READ_WRITE_CONNECTION_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: !(packageWriteExecuted || settingsLockfileWriteExecuted),
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: accepted,
    uiIpcResultContinuationAllowed: accepted,
    transactionCommitConnectionSourceStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult['status']
      | undefined,
    postCommitPersistentReadWriteConnectionHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostStatus
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
    candidateIdentity,
    candidateHash: readOwnStringField(options.source, 'candidateHash') as Sha256Hash | undefined
      ?? candidateIdentity?.candidateHash,
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    persistentPackageWriteExecuted: packageWriteExecuted,
    persistentSettingsLockfileWriteExecuted: settingsLockfileWriteExecuted,
    writtenFileCount: readOwnNumberField(options.source, 'writtenFileCount') ?? 0,
    backedUpFileCount: readOwnNumberField(options.source, 'backedUpFileCount') ?? 0,
    transactionCommitConnectionAcknowledged:
      readOwnBooleanField(options.source, 'transactionCommitConnectionAcknowledged') ?? false,
    postCommitPersistentReadWriteConnectionAcknowledged: accepted,
    checks: options.checks ?? terminalChecks(
      options.status === 'blocked' ? 'blocked' : 'skipped',
      options.reason
    ),
    diagnostics,
    effects: effectSummary(options.status, options.source, options.hostResult)
  } as ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult)
}

const mergeDiagnostics = (
  source?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult,
  hostResult?: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult
): readonly ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSafeDiagnostic[] => Object.freeze([
  ...safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined),
  ...safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
])

const evaluatePostCommitPersistentReadWriteConnectionSource = async(
  options: CreateThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceOptions
): Promise<ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit persistent read/write connection source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readTransactionCommitConnectionSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit persistent read/write connection source is enabled without a transaction connection source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic(
          'third-party.post-commit-persistent-read-write-connection-source.missing-transaction-source'
        )
      ]
    })
  }

  let source: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
  try {
    source = await options.readTransactionCommitConnectionSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction commit connection source failed before post-commit persistent read/write connection',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic(
          'third-party.post-commit-persistent-read-write-connection-source.transaction-source-failed'
        )
      ]
    })
  }

  const sourceDiagnostics = mergeDiagnostics(source)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit persistent read/write connection is not required because transaction connection was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics,
      checks: terminalChecks('skipped', 'transaction commit connection source was skipped')
    })
  }

  if (!safeAcceptedSource(source)) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit persistent read/write connection requires an accepted transaction commit connection source',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: [
        ...sourceDiagnostics,
        commandDiagnostic(
          'third-party.post-commit-persistent-read-write-connection-source.transaction-source-blocked',
          source.targetPackageId
        )
      ]
    })
  }

  if (options.acknowledgePostCommitPersistentReadWrite === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit persistent read/write connection source is enabled without an acknowledgement host',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: [
        ...sourceDiagnostics,
        commandDiagnostic(
          'third-party.post-commit-persistent-read-write-connection-source.missing-connection-host',
          source.targetPackageId
        )
      ]
    })
  }

  let hostResult: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult
  try {
    hostResult = await options.acknowledgePostCommitPersistentReadWrite(buildHostEnvelope(source))
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit persistent read/write connection host failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: [
        ...sourceDiagnostics,
        commandDiagnostic(
          'third-party.post-commit-persistent-read-write-connection-source.connection-host-failed',
          source.targetPackageId
        )
      ]
    })
  }

  const diagnostics = mergeDiagnostics(source, hostResult)
  const checks = buildChecks(source, hostResult)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, source.targetPackageId)

  if (blockedDiagnostics.length === 0) {
    return baseResult({
      status: 'accepted',
      reason: 'third-party post-commit persistent read/write connection accepted matching contained write and transaction acknowledgements',
      enabled: true,
      sourceCalled: true,
      source,
      hostResult,
      diagnostics,
      checks
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'third-party post-commit persistent read/write connection requires a matching no-read/no-write acknowledgement',
    enabled: true,
    sourceCalled: true,
    source,
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
              'third-party.post-commit-persistent-read-write-connection-source.unsafe-connection-host-result',
              source.targetPackageId
            )
          ]
        : []),
      ...blockedDiagnostics,
      commandDiagnostic(
        'third-party.post-commit-persistent-read-write-connection-source.connection-blocked',
        source.targetPackageId
      )
    ]
  })
}

export const createThirdPartyDataPackPostCommitPersistentReadWriteConnectionSource = (
  options: CreateThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceOptions = {}
): (() => Promise<ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult>) => async() => {
  const result = await evaluatePostCommitPersistentReadWriteConnectionSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackPostCommitPersistentReadWriteConnectionBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackPostCommitPersistentReadWriteConnectionSource =
  createThirdPartyDataPackPostCommitPersistentReadWriteConnectionSource()
