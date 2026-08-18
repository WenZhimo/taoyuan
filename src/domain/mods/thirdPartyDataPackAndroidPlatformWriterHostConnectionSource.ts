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
  ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult
} from './thirdPartyDataPackAndroidPlatformWriterAdapterPreflight'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_KIND =
  'third-party-android-platform-writer-host-connection-source'
export const THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_MODE =
  'default-disabled-android-platform-writer-host-connection-source'

export type ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceStatus =
  | 'connected'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackAndroidPlatformWriterHostConnectionStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackAndroidPlatformWriterHostConnectionEnvelope {
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
  readonly androidRequirementIds: readonly string[]
}

export interface ThirdPartyDataPackAndroidPlatformWriterHostConnectionEffectSummary {
  readonly androidPlatformWriterHostCalled: boolean
  readonly androidPlatformWriterHostAccepted: boolean
  readonly androidPlatformWriterConnected: boolean
  readonly androidAppDataStorageResolved: boolean
  readonly androidNativeBridgeEnvelopeExposed: false
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

export interface ThirdPartyDataPackAndroidPlatformWriterHostConnectionResult {
  readonly status: ThirdPartyDataPackAndroidPlatformWriterHostConnectionStatus
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
  readonly androidRequirementIds?: readonly string[]
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackAndroidPlatformWriterHostConnectionEffectSummary
}

export interface ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceEffectSummary {
  readonly androidPlatformWriterHostConnectionSourceCalled: boolean
  readonly androidPlatformWriterAdapterPreflightCalled: boolean
  readonly injectedAndroidPlatformWriterHostCalled: boolean
  readonly androidPlatformWriterHostCalled: boolean
  readonly androidPlatformWriterHostAccepted: boolean
  readonly realAndroidPlatformWriterHostCalled: false
  readonly androidPlatformWriterConnected: boolean
  readonly androidAppDataStorageResolved: boolean
  readonly androidNativeBridgeEnvelopeExposed: false
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

export interface ThirdPartyDataPackAndroidPlatformWriterHostConnectionSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_MODE
  readonly status: ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly androidPlatformWriterAdapterPreflightStatus?: ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult['status']
  readonly androidPlatformWriterHostStatus?: ThirdPartyDataPackAndroidPlatformWriterHostConnectionStatus
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
  readonly androidRequirementIds: readonly string[]
  readonly diagnostics: readonly ThirdPartyDataPackAndroidPlatformWriterHostConnectionSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceEffectSummary
}

export interface CreateThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceOptions {
  readonly enabled?: boolean
  readonly readAndroidPlatformWriterAdapterPreflight?: () =>
    Awaitable<ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult>
  readonly connectAndroidPlatformWriterHost?: (
    envelope: ThirdPartyDataPackAndroidPlatformWriterHostConnectionEnvelope
  ) => Awaitable<ThirdPartyDataPackAndroidPlatformWriterHostConnectionResult>
}

export class ThirdPartyDataPackAndroidPlatformWriterHostConnectionBlockedError extends Error {
  readonly result: ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceResult

  constructor(result: ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceResult) {
    super('third-party Android platform writer host connection blocked command continuation')
    this.name = 'ThirdPartyDataPackAndroidPlatformWriterHostConnectionBlockedError'
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
  'androidPlatformWriterAdapterPreflightCalled',
  'platformWriterConnectionPreflightCalled',
  'upstreamPlatformWriterConnectionReady',
  'androidPlatformWriterAdapterReady',
  'appBootstrapContinuationAllowed',
  'commandContinuationAllowed',
  'settingsWritten',
  'lockfileWritten'
])

const forbiddenAdapterSourceFields = [
  'androidPlatformWriterHost',
  'realAndroidPlatformWriterHost',
  'androidWriterHost',
  'androidHost',
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
  'androidAppDataDirectory',
  'androidPrivateDirectory',
  'appDataDirectory',
  'appDataPath',
  'nativeBridge',
  'androidNativeBridge',
  'capacitorBridge',
  'contentResolver',
  'documentTreeUri',
  'contentUri',
  'fileUri',
  'safUri',
  'androidFilePicker',
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
  'androidPlatformWriterAdapterPreflight',
  'androidPlatformWriterHost',
  'realAndroidPlatformWriterHost',
  'androidWriterHost',
  'androidHost',
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
  'androidAppDataDirectory',
  'androidPrivateDirectory',
  'appDataDirectory',
  'appDataPath',
  'nativeBridge',
  'androidNativeBridge',
  'capacitorBridge',
  'contentResolver',
  'documentTreeUri',
  'contentUri',
  'fileUri',
  'safUri',
  'androidFilePicker',
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

const cloneAndroidRequirementIds = (value: unknown): string[] => {
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
): ThirdPartyDataPackAndroidPlatformWriterHostConnectionSafeDiagnostic[] => {
  if (!Array.isArray(value)) return []
  const length = readArrayLength(value)
  if (length === undefined) return []

  const output: ThirdPartyDataPackAndroidPlatformWriterHostConnectionSafeDiagnostic[] = []
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
): ThirdPartyDataPackAndroidPlatformWriterHostConnectionSafeDiagnostic => ({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const androidThirdPartyWriterScopeEnabled = (): boolean => false

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
  source: ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult
): boolean => !hasForbiddenOwnField(source, forbiddenAdapterSourceFields)
  && !hasForbiddenOwnField(readOwnDataField(source, 'effects'), forbiddenAdapterSourceFields)

const adapterEffectsContained = (
  source: ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult
): boolean => safeEffectSummary(readOwnDataField(source, 'effects'))

const safeSkippedSource = (
  source: ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult
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
  source: ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult
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
    && readOwnStringField(source, 'androidConnectionRequirementStatus') === 'required'
    && cloneAndroidRequirementIds(readOwnDataField(source, 'androidRequirements')).length > 0
    && writeProbeEvidenceComplete(writeProbeEvidence)
    && pathFreeAdapterSource(source)
    && adapterEffectsContained(source)
    && readOwnBooleanField(readOwnDataField(source, 'effects'), 'settingsWritten') === true
    && readOwnBooleanField(readOwnDataField(source, 'effects'), 'lockfileWritten') === true
}

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const hostEffectsSafe = (
  result: ThirdPartyDataPackAndroidPlatformWriterHostConnectionResult
): boolean => {
  const effects = readOwnDataField(result, 'effects')
  return readOwnBooleanField(effects, 'androidPlatformWriterHostCalled') === true
    && readOwnBooleanField(effects, 'androidPlatformWriterHostAccepted') === true
    && readOwnBooleanField(effects, 'androidPlatformWriterConnected') === true
    && readOwnBooleanField(effects, 'androidAppDataStorageResolved') === true
    && readOwnBooleanField(effects, 'androidNativeBridgeEnvelopeExposed') === false
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
  envelope: ThirdPartyDataPackAndroidPlatformWriterHostConnectionEnvelope,
  result: ThirdPartyDataPackAndroidPlatformWriterHostConnectionResult
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
  && arraysEqual(cloneStringList(readOwnDataField(result, 'androidRequirementIds')), envelope.androidRequirementIds)
  && hostEffectsSafe(result)

const buildHostEnvelope = (
  source: ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult
): ThirdPartyDataPackAndroidPlatformWriterHostConnectionEnvelope => {
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
    androidRequirementIds: cloneAndroidRequirementIds(readOwnDataField(source, 'androidRequirements'))
  })
}

const effectSummary = (
  options: {
    readonly sourceCalled: boolean
    readonly continuationAllowed: boolean
    readonly source?: ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult
    readonly hostAccepted?: boolean
  }
): ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceEffectSummary => {
  const hostAccepted = options.hostAccepted === true
  const sourceEffects = readOwnDataField(options.source, 'effects')
  return Object.freeze({
    androidPlatformWriterHostConnectionSourceCalled: true,
    androidPlatformWriterAdapterPreflightCalled: options.sourceCalled,
    injectedAndroidPlatformWriterHostCalled: hostAccepted,
    androidPlatformWriterHostCalled: hostAccepted,
    androidPlatformWriterHostAccepted: hostAccepted,
    realAndroidPlatformWriterHostCalled: false,
    androidPlatformWriterConnected: hostAccepted,
    androidAppDataStorageResolved: hostAccepted,
    androidNativeBridgeEnvelopeExposed: false,
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
    readonly status: ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult
    readonly hostResult?: ThirdPartyDataPackAndroidPlatformWriterHostConnectionResult
    readonly diagnostics?: readonly ThirdPartyDataPackAndroidPlatformWriterHostConnectionSafeDiagnostic[]
  }
): ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceResult => {
  const continuationAllowed = options.status !== 'blocked'
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_ANDROID_PLATFORM_WRITER_HOST_CONNECTION_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
    androidPlatformWriterAdapterPreflightStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult['status']
      | undefined,
    androidPlatformWriterHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackAndroidPlatformWriterHostConnectionStatus
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
    androidRequirementIds: cloneAndroidRequirementIds(readOwnDataField(options.source, 'androidRequirements')),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary({
      sourceCalled: options.sourceCalled,
      continuationAllowed,
      source: options.source,
      hostAccepted: options.status === 'connected'
    })
  })
}

const evaluateAndroidPlatformWriterHostConnectionSource = async(
  options: CreateThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceOptions
): Promise<ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party Android platform writer host connection source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  // Android is vanilla-only in the current plan; historical third-party writer
  // host connection entry points stay inert even if an old caller explicitly enables them.
  if (!androidThirdPartyWriterScopeEnabled()) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party Android platform writer host connection is skipped because Android is vanilla-only',
      enabled: true,
      sourceCalled: false
    })
  }

  if (options.readAndroidPlatformWriterAdapterPreflight === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Android platform writer host connection source is enabled without an adapter preflight',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.android-platform-writer-host-connection.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackAndroidPlatformWriterAdapterPreflightResult
  try {
    source = await options.readAndroidPlatformWriterAdapterPreflight()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Android platform writer adapter preflight failed before host connection',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.android-platform-writer-host-connection.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party Android platform writer host connection is not required because adapter preflight was skipped',
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
      reason: 'third-party Android platform writer host connection requires safe ready Android adapter preflight',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: [
        ...sourceDiagnostics,
        commandDiagnostic('third-party.android-platform-writer-host-connection.unsafe-source', targetPackageId)
      ]
    })
  }

  if (options.connectAndroidPlatformWriterHost === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Android platform writer host connection is enabled without an injected host',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: [
        ...sourceDiagnostics,
        commandDiagnostic(
          'third-party.android-platform-writer-host-connection.missing-host',
          readOwnStringField(source, 'targetPackageId') as PackageId
        )
      ]
    })
  }

  let hostResult: ThirdPartyDataPackAndroidPlatformWriterHostConnectionResult
  const envelope = buildHostEnvelope(source)
  try {
    hostResult = await options.connectAndroidPlatformWriterHost(envelope)
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Android platform writer host failed before returning a safe connection result',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: [
        ...sourceDiagnostics,
        commandDiagnostic('third-party.android-platform-writer-host-connection.host-failed', envelope.targetPackageId)
      ]
    })
  }

  const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
  if (hostMatchesEnvelope(envelope, hostResult)) {
    return baseResult({
      status: 'connected',
      reason: 'third-party Android platform writer host connection accepted a path-free host acknowledgement',
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
    reason: 'third-party Android platform writer host returned an unsafe or mismatched connection result',
    enabled: true,
    sourceCalled: true,
    source,
    hostResult,
    diagnostics: [
      ...sourceDiagnostics,
      ...hostDiagnostics,
      commandDiagnostic('third-party.android-platform-writer-host-connection.unsafe-host', envelope.targetPackageId)
    ]
  })
}

export const createThirdPartyDataPackAndroidPlatformWriterHostConnectionSource = (
  options: CreateThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceOptions = {}
): (() => Promise<ThirdPartyDataPackAndroidPlatformWriterHostConnectionSourceResult>) => async() => {
  const result = await evaluateAndroidPlatformWriterHostConnectionSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackAndroidPlatformWriterHostConnectionBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackAndroidPlatformWriterHostConnectionSource =
  createThirdPartyDataPackAndroidPlatformWriterHostConnectionSource()
