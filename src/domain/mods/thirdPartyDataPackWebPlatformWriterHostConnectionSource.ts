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
  ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult
} from './thirdPartyDataPackWebPlatformWriterAdapterPreflight'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_KIND =
  'third-party-web-platform-writer-host-connection-source'
export const THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_MODE =
  'default-disabled-web-platform-writer-host-connection-source'

export type ThirdPartyDataPackWebPlatformWriterHostConnectionSourceStatus =
  | 'connected'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackWebPlatformWriterHostConnectionStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope {
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
  readonly webRequirementIds: readonly string[]
}

export interface ThirdPartyDataPackWebPlatformWriterHostConnectionEffectSummary {
  readonly webPlatformWriterHostCalled: boolean
  readonly webPlatformWriterHostAccepted: boolean
  readonly webPlatformWriterConnected: boolean
  readonly webIndexedDbStorageResolved: boolean
  readonly webStorageEnvelopeExposed: false
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

export interface ThirdPartyDataPackWebPlatformWriterHostConnectionResult {
  readonly status: ThirdPartyDataPackWebPlatformWriterHostConnectionStatus
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
  readonly webRequirementIds?: readonly string[]
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackWebPlatformWriterHostConnectionEffectSummary
}

export interface ThirdPartyDataPackWebPlatformWriterHostConnectionSourceEffectSummary {
  readonly webPlatformWriterHostConnectionSourceCalled: boolean
  readonly webPlatformWriterAdapterPreflightCalled: boolean
  readonly injectedWebPlatformWriterHostCalled: boolean
  readonly webPlatformWriterHostCalled: boolean
  readonly webPlatformWriterHostAccepted: boolean
  readonly realWebPlatformWriterHostCalled: false
  readonly webPlatformWriterConnected: boolean
  readonly webIndexedDbStorageResolved: boolean
  readonly webStorageEnvelopeExposed: false
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

export interface ThirdPartyDataPackWebPlatformWriterHostConnectionSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_MODE
  readonly status: ThirdPartyDataPackWebPlatformWriterHostConnectionSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly webPlatformWriterAdapterPreflightStatus?: ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult['status']
  readonly webPlatformWriterHostStatus?: ThirdPartyDataPackWebPlatformWriterHostConnectionStatus
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
  readonly webRequirementIds: readonly string[]
  readonly diagnostics: readonly ThirdPartyDataPackWebPlatformWriterHostConnectionSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackWebPlatformWriterHostConnectionSourceEffectSummary
}

export interface CreateThirdPartyDataPackWebPlatformWriterHostConnectionSourceOptions {
  readonly enabled?: boolean
  readonly readWebPlatformWriterAdapterPreflight?: () =>
    Awaitable<ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult>
  readonly connectWebPlatformWriterHost?: (
    envelope: ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope
  ) => Awaitable<ThirdPartyDataPackWebPlatformWriterHostConnectionResult>
}

export class ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError extends Error {
  readonly result: ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult

  constructor(result: ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult) {
    super('third-party Web platform writer host connection blocked command continuation')
    this.name = 'ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError'
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

const flexibleAdapterEffectFields = new Set<string>([
  'webPlatformWriterAdapterPreflightCalled',
  'platformWriterConnectionPreflightCalled',
  'upstreamPlatformWriterConnectionReady',
  'webPlatformWriterAdapterReady',
  'appBootstrapContinuationAllowed',
  'commandContinuationAllowed',
  'settingsWritten',
  'lockfileWritten'
])

const forbiddenAdapterSourceFields = [
  'webPlatformWriterHost',
  'realWebPlatformWriterHost',
  'webWriterHost',
  'webHost',
  'platformWriterHost',
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
  'indexedDb',
  'indexedDB',
  'indexedDbDatabase',
  'idbDatabase',
  'browserStorage',
  'storageHandle',
  'localStorage',
  'webStorage',
  'fileSystemHandle',
  'directoryHandle',
  'fileHandle',
  'showOpenFilePicker',
  'showDirectoryPicker',
  'blobUrl',
  'objectUrl',
  'nativeBridge',
  'webNativeBridge',
  'capacitorBridge',
  'contentResolver',
  'documentTreeUri',
  'contentUri',
  'fileUri',
  'safUri',
  'webFilePicker',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'programDirectoryPath',
  'userDataPath',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

const forbiddenHostFields = [
  'webPlatformWriterAdapterPreflight',
  'webPlatformWriterHost',
  'realWebPlatformWriterHost',
  'webWriterHost',
  'webHost',
  'platformWriterHost',
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
  'indexedDb',
  'indexedDB',
  'indexedDbDatabase',
  'idbDatabase',
  'browserStorage',
  'storageHandle',
  'localStorage',
  'webStorage',
  'fileSystemHandle',
  'directoryHandle',
  'fileHandle',
  'showOpenFilePicker',
  'showDirectoryPicker',
  'blobUrl',
  'objectUrl',
  'nativeBridge',
  'webNativeBridge',
  'capacitorBridge',
  'contentResolver',
  'documentTreeUri',
  'contentUri',
  'fileUri',
  'safUri',
  'webFilePicker',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'programDirectoryPath',
  'userDataPath',
  'absolutePath',
  'resolvedPath',
  'path',
  'filePath',
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

const readOwnDataField = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, key)
  } catch {
    return undefined
  }
  return descriptor && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (value: unknown, key: string): string | undefined => {
  const field = readOwnDataField(value, key)
  return typeof field === 'string' ? field : undefined
}

const readOwnNumberField = (value: unknown, key: string): number | undefined => {
  const field = readOwnDataField(value, key)
  return typeof field === 'number' && Number.isSafeInteger(field) && field >= 0 ? field : undefined
}

const readOwnBooleanField = (value: unknown, key: string): boolean | undefined => {
  const field = readOwnDataField(value, key)
  return typeof field === 'boolean' ? field : undefined
}

const cloneStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const length = readArrayLength(value)
  if (length === undefined) return []

  const output: string[] = []
  for (let index = 0; index < length; index += 1) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    if (!descriptor || !('value' in descriptor) || typeof descriptor.value !== 'string') return []
    output.push(descriptor.value)
  }
  return output
}

const clonePackageIds = (value: unknown): PackageId[] => cloneStringList(value) as PackageId[]

const hasForbiddenOwnField = (value: unknown, keys: readonly string[]): boolean => {
  if (!value || typeof value !== 'object') return false
  return keys.some(key => {
    try {
      return Reflect.getOwnPropertyDescriptor(value, key) !== undefined
    } catch {
      return true
    }
  })
}

const cloneCandidateIdentity = (value: unknown): ThirdPartyCandidateIdentitySummary | undefined => {
  const formatVersion = readOwnNumberField(value, 'formatVersion')
  const contentHash = readOwnStringField(value, 'contentHash')
  const snapshotHash = readOwnStringField(value, 'snapshotHash')
  const candidateHash = readOwnStringField(value, 'candidateHash')
  return formatVersion === 1
    && contentHash?.startsWith('sha256:')
    && snapshotHash?.startsWith('sha256:')
    && candidateHash?.startsWith('sha256:')
    ? {
        formatVersion: 1,
        contentHash: contentHash as Sha256Hash,
        snapshotHash: snapshotHash as Sha256Hash,
        candidateHash: candidateHash as Sha256Hash
      }
    : undefined
}

const defaultWriteProbeEvidence = (): ThirdPartyDataPackInstallTransactionWriteProbeEvidence => ({
  modLockWriteProbeStatus: 'skipped',
  transactionLogWriteProbeStatus: 'skipped',
  modLockPersistentWriteExecuted: false,
  transactionLogPersistentWriteExecuted: false
})

const cloneWriteProbeEvidence = (value: unknown): ThirdPartyDataPackInstallTransactionWriteProbeEvidence => {
  const modLockWriteProbeStatus = readOwnStringField(value, 'modLockWriteProbeStatus')
  const transactionLogWriteProbeStatus = readOwnStringField(value, 'transactionLogWriteProbeStatus')
  const modLockPersistentWriteExecuted = readOwnBooleanField(value, 'modLockPersistentWriteExecuted')
  const transactionLogPersistentWriteExecuted = readOwnBooleanField(value, 'transactionLogPersistentWriteExecuted')
  return {
    modLockWriteProbeStatus: modLockWriteProbeStatus === 'written' ? 'written' : 'skipped',
    transactionLogWriteProbeStatus: transactionLogWriteProbeStatus === 'written' ? 'written' : 'skipped',
    modLockPersistentWriteExecuted: modLockPersistentWriteExecuted === true,
    transactionLogPersistentWriteExecuted: transactionLogPersistentWriteExecuted === true
  }
}

const cloneWebRequirementIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const length = readArrayLength(value)
  if (length === undefined) return []

  const output: string[] = []
  for (let index = 0; index < length; index += 1) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    if (!descriptor || !('value' in descriptor)) return []
    const id = readOwnStringField(descriptor.value, 'id')
    const status = readOwnStringField(descriptor.value, 'status')
    if (id === undefined || status !== 'required') return []
    output.push(id)
  }
  return output
}

const safeDiagnostics = (
  value: readonly unknown[] | undefined
): ThirdPartyDataPackWebPlatformWriterHostConnectionSafeDiagnostic[] => {
  if (!Array.isArray(value)) return []
  const length = readArrayLength(value)
  if (length === undefined) return []

  const output: ThirdPartyDataPackWebPlatformWriterHostConnectionSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    if (!descriptor || !('value' in descriptor)) return []
    const diagnostic = descriptor.value
    const code = readOwnStringField(diagnostic, 'code')
    const ruleId = readOwnStringField(diagnostic, 'ruleId')
    const severity = readOwnStringField(diagnostic, 'severity') as ModDiagnosticSeverity | undefined
    const stage = readOwnStringField(diagnostic, 'stage')
    const messageKey = readOwnStringField(diagnostic, 'messageKey')
    const packageId = readOwnStringField(diagnostic, 'packageId') as PackageId | undefined
    const recovery = readOwnStringField(diagnostic, 'recovery') as ModDiagnosticRecovery | undefined
    if (
      code === undefined
      || ruleId === undefined
      || severity === undefined
      || stage === undefined
      || messageKey === undefined
      || recovery === undefined
      || !diagnosticSeverities.has(severity)
      || !diagnosticRecoveries.has(recovery)
    ) return []
    output.push({ code, ruleId, severity, stage, messageKey, packageId, recovery })
  }
  return output
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackWebPlatformWriterHostConnectionSafeDiagnostic => ({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    for (const property of Object.values(value as Record<string, unknown>)) {
      deepFreezeObjectGraph(property)
    }
    Object.freeze(value)
  }
  return value
}

const safeEffectSummary = (effects: unknown): boolean => {
  if (!effects || typeof effects !== 'object') return false
  for (const key of Reflect.ownKeys(effects)) {
    if (typeof key !== 'string') return false
    const value = readOwnDataField(effects, key)
    if (flexibleAdapterEffectFields.has(key)) {
      if (typeof value !== 'boolean') return false
    } else if (value !== false) {
      return false
    }
  }
  return true
}

const pathFreeAdapterSource = (
  source: ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult
): boolean => !hasForbiddenOwnField(source, forbiddenAdapterSourceFields)
  && !hasForbiddenOwnField(readOwnDataField(source, 'effects'), forbiddenAdapterSourceFields)

const adapterEffectsContained = (
  source: ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult
): boolean => safeEffectSummary(readOwnDataField(source, 'effects'))

const safeSkippedSource = (
  source: ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && readOwnBooleanField(source, 'commandContinuationAllowed') !== false
  && pathFreeAdapterSource(source)
  && adapterEffectsContained(source)

const writeProbeEvidenceComplete = (evidence: ThirdPartyDataPackInstallTransactionWriteProbeEvidence): boolean =>
  evidence.modLockWriteProbeStatus === 'written'
  && evidence.transactionLogWriteProbeStatus === 'written'
  && evidence.modLockPersistentWriteExecuted
  && evidence.transactionLogPersistentWriteExecuted

const safeReadySource = (
  source: ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult
): boolean => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const targetPackageId = readOwnStringField(source, 'targetPackageId')
  const writeProbeEvidence = cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
  return readOwnStringField(source, 'status') === 'ready'
    && readOwnBooleanField(source, 'readOnly') === true
    && readOwnBooleanField(source, 'commandContinuationAllowed') === true
    && readOwnStringField(source, 'requestedCommandId') === 'install'
    && targetPackageId !== undefined
    && selectedPackageIds.includes(targetPackageId as PackageId)
    && loadOrder.includes(targetPackageId as PackageId)
    && cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined
    && readOwnStringField(source, 'lockfileHash')?.startsWith('sha256:') === true
    && readOwnStringField(source, 'webConnectionRequirementStatus') === 'required'
    && cloneWebRequirementIds(readOwnDataField(source, 'webRequirements')).length > 0
    && writeProbeEvidenceComplete(writeProbeEvidence)
    && pathFreeAdapterSource(source)
    && adapterEffectsContained(source)
    && readOwnBooleanField(readOwnDataField(source, 'effects'), 'settingsWritten') === true
    && readOwnBooleanField(readOwnDataField(source, 'effects'), 'lockfileWritten') === true
}

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const hostEffectsSafe = (
  result: ThirdPartyDataPackWebPlatformWriterHostConnectionResult
): boolean => {
  const effects = readOwnDataField(result, 'effects')
  return readOwnBooleanField(effects, 'webPlatformWriterHostCalled') === true
    && readOwnBooleanField(effects, 'webPlatformWriterHostAccepted') === true
    && readOwnBooleanField(effects, 'webPlatformWriterConnected') === true
    && readOwnBooleanField(effects, 'webIndexedDbStorageResolved') === true
    && readOwnBooleanField(effects, 'webStorageEnvelopeExposed') === false
    && readOwnBooleanField(effects, 'transactionCommitted') === false
    && readOwnBooleanField(effects, 'runtimePublicationCommitted') === false
    && readOwnBooleanField(effects, 'postCommitVerificationExecuted') === false
    && readOwnBooleanField(effects, 'uiIpcResponseDelivered') === false
    && readOwnBooleanField(effects, 'packageFilesWritten') === false
    && readOwnBooleanField(effects, 'packageBackupsWritten') === false
    && readOwnBooleanField(effects, 'packageFilesRestored') === false
    && readOwnBooleanField(effects, 'lockfileWritten') === false
    && readOwnBooleanField(effects, 'lockfileRestored') === false
    && readOwnBooleanField(effects, 'settingsWritten') === false
    && readOwnBooleanField(effects, 'settingsRestored') === false
    && readOwnBooleanField(effects, 'savesWritten') === false
    && readOwnBooleanField(effects, 'cacheWritten') === false
    && readOwnBooleanField(effects, 'transactionLogWritten') === false
    && readOwnBooleanField(effects, 'recoveryLogRead') === false
    && readOwnBooleanField(effects, 'recoveryLogReplayed') === false
    && readOwnBooleanField(effects, 'rollbackExecuted') === false
    && readOwnBooleanField(effects, 'diagnosticsWritten') === false
}

const hostMatchesEnvelope = (
  envelope: ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope,
  result: ThirdPartyDataPackWebPlatformWriterHostConnectionResult
): boolean => readOwnStringField(result, 'status') === 'accepted'
  && !hasForbiddenOwnField(result, forbiddenHostFields)
  && readOwnStringField(result, 'requestedCommandId') === envelope.requestedCommandId
  && readOwnStringField(result, 'targetPackageId') === envelope.targetPackageId
  && arraysEqual(clonePackageIds(readOwnDataField(result, 'selectedPackageIds')), envelope.selectedPackageIds)
  && arraysEqual(clonePackageIds(readOwnDataField(result, 'blockedPackageIds')), envelope.blockedPackageIds)
  && arraysEqual(clonePackageIds(readOwnDataField(result, 'loadOrder')), envelope.loadOrder)
  && readOwnNumberField(result, 'registryCount') === envelope.registryCount
  && readOwnNumberField(result, 'entryCount') === envelope.entryCount
  && readOwnNumberField(result, 'packageCount') === envelope.packageCount
  && readOwnStringField(result, 'candidateHash') === envelope.candidateIdentity.candidateHash
  && readOwnStringField(result, 'lockfileHash') === envelope.lockfileHash
  && readOwnStringField(result, 'modLockWriteProbeStatus') === envelope.writeProbeEvidence.modLockWriteProbeStatus
  && readOwnStringField(result, 'transactionLogWriteProbeStatus')
    === envelope.writeProbeEvidence.transactionLogWriteProbeStatus
  && readOwnBooleanField(result, 'modLockPersistentWriteExecuted')
    === envelope.writeProbeEvidence.modLockPersistentWriteExecuted
  && readOwnBooleanField(result, 'transactionLogPersistentWriteExecuted')
    === envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted
  && arraysEqual(cloneStringList(readOwnDataField(result, 'webRequirementIds')), envelope.webRequirementIds)
  && hostEffectsSafe(result)

const buildHostEnvelope = (
  source: ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult
): ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope => {
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  return deepFreezeObjectGraph({
    requestedCommandId: 'install',
    targetPackageId: readOwnStringField(source, 'targetPackageId') as PackageId,
    selectedPackageIds: clonePackageIds(readOwnDataField(source, 'selectedPackageIds')),
    blockedPackageIds: clonePackageIds(readOwnDataField(source, 'blockedPackageIds')),
    loadOrder: clonePackageIds(readOwnDataField(source, 'loadOrder')),
    registryCount: readOwnNumberField(source, 'registryCount') ?? 0,
    entryCount: readOwnNumberField(source, 'entryCount') ?? 0,
    packageCount: readOwnNumberField(source, 'packageCount') ?? 0,
    candidateIdentity: candidateIdentity as ThirdPartyCandidateIdentitySummary,
    lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash,
    writeProbeEvidence: cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence')),
    webRequirementIds: cloneWebRequirementIds(readOwnDataField(source, 'webRequirements'))
  })
}

const effectSummary = (
  options: {
    readonly sourceCalled: boolean
    readonly continuationAllowed: boolean
    readonly source?: ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult
    readonly hostAccepted?: boolean
  }
): ThirdPartyDataPackWebPlatformWriterHostConnectionSourceEffectSummary => {
  const hostAccepted = options.hostAccepted === true
  const sourceEffects = readOwnDataField(options.source, 'effects')
  return Object.freeze({
    webPlatformWriterHostConnectionSourceCalled: true,
    webPlatformWriterAdapterPreflightCalled: options.sourceCalled,
    injectedWebPlatformWriterHostCalled: hostAccepted,
    webPlatformWriterHostCalled: hostAccepted,
    webPlatformWriterHostAccepted: hostAccepted,
    realWebPlatformWriterHostCalled: false,
    webPlatformWriterConnected: hostAccepted,
    webIndexedDbStorageResolved: hostAccepted,
    webStorageEnvelopeExposed: false,
    appBootstrapContinuationAllowed: options.continuationAllowed,
    commandContinuationAllowed: options.continuationAllowed,
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    liveRegistrySwapped: false,
    previousRegistryReleased: false,
    previousRegistryRestored: false,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: false,
    modManagementUiMounted: false,
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
    lockfileWritten: readOwnBooleanField(sourceEffects, 'lockfileWritten') === true,
    lockfileRestored: false,
    settingsWritten: readOwnBooleanField(sourceEffects, 'settingsWritten') === true,
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
    readonly status: ThirdPartyDataPackWebPlatformWriterHostConnectionSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult
    readonly hostResult?: ThirdPartyDataPackWebPlatformWriterHostConnectionResult
    readonly diagnostics?: readonly ThirdPartyDataPackWebPlatformWriterHostConnectionSafeDiagnostic[]
  }
): ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult => {
  const continuationAllowed = options.status !== 'blocked'
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_WEB_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
    webPlatformWriterAdapterPreflightStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult['status']
      | undefined,
    webPlatformWriterHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackWebPlatformWriterHostConnectionStatus
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
    writeProbeEvidence: options.source
      ? cloneWriteProbeEvidence(readOwnDataField(options.source, 'writeProbeEvidence'))
      : defaultWriteProbeEvidence(),
    webRequirementIds: cloneWebRequirementIds(readOwnDataField(options.source, 'webRequirements')),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary({
      sourceCalled: options.sourceCalled,
      continuationAllowed,
      source: options.source,
      hostAccepted: options.status === 'connected'
    })
  })
}

const evaluateWebPlatformWriterHostConnectionSource = async(
  options: CreateThirdPartyDataPackWebPlatformWriterHostConnectionSourceOptions
): Promise<ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party Web platform writer host connection source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readWebPlatformWriterAdapterPreflight === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Web platform writer host connection source is enabled without an adapter preflight',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.web-platform-writer-host-connection.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackWebPlatformWriterAdapterPreflightResult
  try {
    source = await options.readWebPlatformWriterAdapterPreflight()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Web platform writer adapter preflight failed before host connection',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.web-platform-writer-host-connection.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party Web platform writer host connection is not required because adapter preflight was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (!safeReadySource(source)) {
    const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
    return baseResult({
      status: 'blocked',
      reason: 'third-party Web platform writer host connection requires safe ready Web adapter preflight',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: [
        ...sourceDiagnostics,
        commandDiagnostic('third-party.web-platform-writer-host-connection.unsafe-source', targetPackageId)
      ]
    })
  }

  if (options.connectWebPlatformWriterHost === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Web platform writer host connection is enabled without an injected host',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: [
        ...sourceDiagnostics,
        commandDiagnostic(
          'third-party.web-platform-writer-host-connection.missing-host',
          readOwnStringField(source, 'targetPackageId') as PackageId
        )
      ]
    })
  }

  let hostResult: ThirdPartyDataPackWebPlatformWriterHostConnectionResult
  const envelope = buildHostEnvelope(source)
  try {
    hostResult = await options.connectWebPlatformWriterHost(envelope)
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Web platform writer host failed before returning a safe connection result',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: [
        ...sourceDiagnostics,
        commandDiagnostic('third-party.web-platform-writer-host-connection.host-failed', envelope.targetPackageId)
      ]
    })
  }

  const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
  if (hostMatchesEnvelope(envelope, hostResult)) {
    return baseResult({
      status: 'connected',
      reason: 'third-party Web platform writer host connection accepted a path-free host acknowledgement',
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
    reason: 'third-party Web platform writer host returned an unsafe or mismatched connection result',
    enabled: true,
    sourceCalled: true,
    source,
    hostResult,
    diagnostics: [
      ...sourceDiagnostics,
      ...hostDiagnostics,
      commandDiagnostic('third-party.web-platform-writer-host-connection.unsafe-host', envelope.targetPackageId)
    ]
  })
}

export const createThirdPartyDataPackWebPlatformWriterHostConnectionSource = (
  options: CreateThirdPartyDataPackWebPlatformWriterHostConnectionSourceOptions = {}
): (() => Promise<ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult>) => async() => {
  const result = await evaluateWebPlatformWriterHostConnectionSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackWebPlatformWriterHostConnectionSource =
  createThirdPartyDataPackWebPlatformWriterHostConnectionSource()
