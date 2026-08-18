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
  ThirdPartyDataPackPlatformWriterConnectionPreflightResult,
  ThirdPartyDataPackPlatformWriterConnectionRequirement
} from './thirdPartyDataPackPlatformWriterConnectionPreflight'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_ELECTRON_PLATFORM_WRITER_ADAPTER_PREFLIGHT_KIND =
  'third-party-electron-platform-writer-adapter-preflight'
export const THIRD_PARTY_DATA_PACK_ELECTRON_PLATFORM_WRITER_ADAPTER_PREFLIGHT_MODE =
  'default-disabled-electron-platform-writer-adapter-preflight'

export type ThirdPartyDataPackElectronPlatformWriterAdapterPreflightStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackElectronPlatformWriterAdapterRequirementStatus =
  | 'required'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackElectronPlatformWriterAdapterRequirement {
  readonly id: string
  readonly status: ThirdPartyDataPackElectronPlatformWriterAdapterRequirementStatus
  readonly reason: string
}

export interface ThirdPartyDataPackElectronPlatformWriterAdapterCheck {
  readonly id: string
  readonly status: 'satisfied' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackElectronPlatformWriterAdapterPreflightEffectSummary {
  readonly electronPlatformWriterAdapterPreflightCalled: boolean
  readonly platformWriterConnectionPreflightCalled: boolean
  readonly upstreamPlatformWriterConnectionReady: boolean
  readonly electronPlatformWriterAdapterReady: boolean
  readonly realElectronPlatformWriterHostCalled: false
  readonly electronPlatformWriterConnected: false
  readonly programDirectoryUserdataResolved: false
  readonly electronIpcExposed: false
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

export interface ThirdPartyDataPackElectronPlatformWriterAdapterSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ELECTRON_PLATFORM_WRITER_ADAPTER_PREFLIGHT_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ELECTRON_PLATFORM_WRITER_ADAPTER_PREFLIGHT_MODE
  readonly status: ThirdPartyDataPackElectronPlatformWriterAdapterPreflightStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly platformWriterConnectionPreflightStatus?: ThirdPartyDataPackPlatformWriterConnectionPreflightResult['status']
  readonly electronConnectionRequirementStatus?: ThirdPartyDataPackPlatformWriterConnectionRequirement['status']
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
  readonly upstreamRequirements: readonly ThirdPartyDataPackPlatformWriterConnectionRequirement[]
  readonly electronRequirements: readonly ThirdPartyDataPackElectronPlatformWriterAdapterRequirement[]
  readonly checks: readonly ThirdPartyDataPackElectronPlatformWriterAdapterCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackElectronPlatformWriterAdapterSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackElectronPlatformWriterAdapterPreflightEffectSummary
}

export interface CreateThirdPartyDataPackElectronPlatformWriterAdapterPreflightOptions {
  readonly enabled?: boolean
  readonly readPlatformWriterConnectionPreflight?: () =>
    Awaitable<ThirdPartyDataPackPlatformWriterConnectionPreflightResult>
}

export class ThirdPartyDataPackElectronPlatformWriterAdapterPreflightBlockedError extends Error {
  readonly result: ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult

  constructor(result: ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult) {
    super('third-party Electron platform writer adapter preflight blocked command continuation')
    this.name = 'ThirdPartyDataPackElectronPlatformWriterAdapterPreflightBlockedError'
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

const flexibleConnectionEffectFields = new Set<string>([
  'platformWriterConnectionPreflightCalled',
  'settingsLockfilePersistentWriterSourceCalled',
  'upstreamSettingsLockfilePersistentWritesAcknowledged',
  'platformWriterConnectionDeferred',
  'appBootstrapContinuationAllowed',
  'commandContinuationAllowed',
  'settingsWritten',
  'lockfileWritten'
])

const forbiddenConnectionSourceFields = [
  'electronPlatformWriterAdapter',
  'electronPlatformWriterHost',
  'realElectronPlatformWriterHost',
  'electronWriterHost',
  'electronHost',
  'platformWriterHost',
  'settingsLockfilePersistentWriterSource',
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
  'programDirectoryPath',
  'userDataPath',
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
): ThirdPartyDataPackElectronPlatformWriterAdapterSafeDiagnostic => {
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
      ?? 'third-party.electron-platform-writer-adapter-preflight.diagnostic-copy',
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
): readonly ThirdPartyDataPackElectronPlatformWriterAdapterSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackElectronPlatformWriterAdapterSafeDiagnostic[] = []
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
): ThirdPartyDataPackElectronPlatformWriterAdapterSafeDiagnostic => Object.freeze({
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

const cloneUpstreamRequirements = (
  requirements: unknown
): readonly ThirdPartyDataPackPlatformWriterConnectionRequirement[] => {
  if (!Array.isArray(requirements)) return Object.freeze([])
  const length = readArrayLength(requirements)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackPlatformWriterConnectionRequirement[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(requirements, String(index))
    } catch {
      continue
    }
    if (
      descriptor?.enumerable === true
      && 'value' in descriptor
      && descriptor.value !== null
      && typeof descriptor.value === 'object'
    ) {
      const id = readOwnStringField(descriptor.value, 'id')
      const platform = readOwnStringField(descriptor.value, 'platform')
      const status = readOwnStringField(descriptor.value, 'status')
      const reason = readOwnStringField(descriptor.value, 'reason')
      if (
        id !== undefined
        && (platform === 'electron' || platform === 'web' || platform === 'android')
        && (status === 'required' || status === 'skipped' || status === 'blocked')
        && reason !== undefined
      ) {
        result.push(Object.freeze({ id, platform, status, reason }))
      }
    }
  }
  return Object.freeze(result)
}

const electronConnectionRequirement = (
  source: ThirdPartyDataPackPlatformWriterConnectionPreflightResult | undefined
): ThirdPartyDataPackPlatformWriterConnectionRequirement | undefined =>
  cloneUpstreamRequirements(readOwnDataField(source, 'requirements'))
    .find(requirement => requirement.platform === 'electron')

const pathFreeConnectionSource = (
  source: ThirdPartyDataPackPlatformWriterConnectionPreflightResult
): boolean => forbiddenConnectionSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const connectionEffectsContained = (
  source: ThirdPartyDataPackPlatformWriterConnectionPreflightResult
): boolean => {
  const effects = readOwnDataField(source, 'effects') as object | undefined
  if (effects === undefined) return false
  const writesExpected = readOwnStringField(source, 'status') === 'deferred'
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
    if (key === 'upstreamSettingsLockfilePersistentWritesAcknowledged') {
      return descriptor.value === writesExpected
    }
    if (key === 'platformWriterConnectionDeferred') return descriptor.value === writesExpected
    if (key === 'settingsWritten') return descriptor.value === writesExpected
    if (key === 'lockfileWritten') return descriptor.value === writesExpected
    if (flexibleConnectionEffectFields.has(String(key))) return typeof descriptor.value === 'boolean'
    return descriptor.value === false
  })
}

const safeSkippedSource = (
  source: ThirdPartyDataPackPlatformWriterConnectionPreflightResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && readOwnBooleanField(source, 'appBootstrapContinuationAllowed') === true
  && readOwnBooleanField(source, 'commandContinuationAllowed') === true
  && connectionEffectsContained(source)
  && pathFreeConnectionSource(source)

const safeReadySource = (
  source: ThirdPartyDataPackPlatformWriterConnectionPreflightResult
): boolean => {
  const writeEvidence = cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
  return readOwnStringField(source, 'status') === 'deferred'
    && readOwnStringField(source, 'requestedCommandId') === 'install'
    && readOwnStringField(source, 'targetPackageId') !== undefined
    && cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined
    && readOwnStringField(source, 'lockfileHash') !== undefined
    && electronConnectionRequirement(source)?.status === 'required'
    && writeEvidence.modLockWriteProbeStatus === 'written'
    && writeEvidence.transactionLogWriteProbeStatus === 'written'
    && writeEvidence.modLockPersistentWriteExecuted === true
    && writeEvidence.transactionLogPersistentWriteExecuted === true
    && readOwnBooleanField(source, 'appBootstrapContinuationAllowed') === true
    && readOwnBooleanField(source, 'commandContinuationAllowed') === true
    && connectionEffectsContained(source)
    && pathFreeConnectionSource(source)
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

const adapterRequirement = (
  id: string,
  status: ThirdPartyDataPackElectronPlatformWriterAdapterRequirementStatus,
  reason: string
): ThirdPartyDataPackElectronPlatformWriterAdapterRequirement => Object.freeze({ id, status, reason })

const buildElectronRequirements = (
  status: ThirdPartyDataPackElectronPlatformWriterAdapterPreflightStatus
): readonly ThirdPartyDataPackElectronPlatformWriterAdapterRequirement[] => {
  const requirementStatus: ThirdPartyDataPackElectronPlatformWriterAdapterRequirementStatus =
    status === 'ready' ? 'required' : status
  return Object.freeze([
    adapterRequirement(
      'electron-program-directory-userdata-root',
      requirementStatus,
      requirementStatus === 'required'
        ? 'Electron writer must resolve userdata from the program directory and never from the Windows user profile'
        : 'Electron userdata root resolution is not active for this preflight state'
    ),
    adapterRequirement(
      'electron-mod-lock-json-atomic-writer',
      requirementStatus,
      requirementStatus === 'required'
        ? 'Electron writer must atomically persist userdata/mod-lock.json with verification before command continuation'
        : 'Electron mod-lock writer is not active for this preflight state'
    ),
    adapterRequirement(
      'electron-settings-json-atomic-writer',
      requirementStatus,
      requirementStatus === 'required'
        ? 'Electron writer must atomically persist userdata/settings.json without touching saves or cache'
        : 'Electron settings writer is not active for this preflight state'
    ),
    adapterRequirement(
      'electron-path-free-preload-ipc',
      requirementStatus,
      requirementStatus === 'required'
        ? 'Electron preload IPC must carry fixed-purpose envelopes and not accept renderer-supplied paths'
        : 'Electron preload IPC writer envelope is not active for this preflight state'
    )
  ])
}

const check = (
  id: string,
  status: ThirdPartyDataPackElectronPlatformWriterAdapterCheck['status'],
  reason: string
): ThirdPartyDataPackElectronPlatformWriterAdapterCheck => Object.freeze({ id, status, reason })

const buildChecks = (
  status: ThirdPartyDataPackElectronPlatformWriterAdapterPreflightStatus,
  source?: ThirdPartyDataPackPlatformWriterConnectionPreflightResult
): readonly ThirdPartyDataPackElectronPlatformWriterAdapterCheck[] => Object.freeze([
  check(
    'platform-writer-connection-safe',
    status === 'blocked' ? 'blocked' : 'satisfied',
    status === 'blocked'
      ? 'upstream platform writer connection preflight is missing, failed, unsafe or path-bearing'
      : 'upstream platform writer connection preflight exposes only safe path-free summary fields'
  ),
  check(
    'electron-platform-writer-requirement-present',
    status === 'blocked' ? 'blocked' : 'satisfied',
    electronConnectionRequirement(source)?.status === 'required'
      ? 'Electron platform writer connection requirement is present and remains deferred'
      : 'Electron platform writer connection is skipped until upstream persistent writes exist'
  ),
  check(
    'no-real-electron-writer-called',
    'satisfied',
    'preflight does not call Electron writer hosts or expose program-directory paths'
  )
])

const effectSummary = (
  sourceCalled: boolean,
  continuationAllowed: boolean,
  source?: ThirdPartyDataPackPlatformWriterConnectionPreflightResult
): ThirdPartyDataPackElectronPlatformWriterAdapterPreflightEffectSummary => {
  const ready = continuationAllowed && readOwnStringField(source, 'status') === 'deferred'
  return Object.freeze({
    electronPlatformWriterAdapterPreflightCalled: true,
    platformWriterConnectionPreflightCalled: sourceCalled,
    upstreamPlatformWriterConnectionReady: ready,
    electronPlatformWriterAdapterReady: ready,
    realElectronPlatformWriterHostCalled: false,
    electronPlatformWriterConnected: false,
    programDirectoryUserdataResolved: false,
    electronIpcExposed: false,
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
    lockfileWritten: ready,
    lockfileRestored: false,
    settingsWritten: ready,
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
    readonly status: ThirdPartyDataPackElectronPlatformWriterAdapterPreflightStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackPlatformWriterConnectionPreflightResult
    readonly diagnostics?: readonly ThirdPartyDataPackElectronPlatformWriterAdapterSafeDiagnostic[]
  }
): ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult => {
  const continuationAllowed = options.status !== 'blocked'
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const upstreamRequirements = cloneUpstreamRequirements(readOwnDataField(options.source, 'requirements'))
  const electronRequirementStatus = upstreamRequirements.find(requirement => requirement.platform === 'electron')?.status

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_ELECTRON_PLATFORM_WRITER_ADAPTER_PREFLIGHT_KIND,
    mode: THIRD_PARTY_DATA_PACK_ELECTRON_PLATFORM_WRITER_ADAPTER_PREFLIGHT_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
    platformWriterConnectionPreflightStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackPlatformWriterConnectionPreflightResult['status']
      | undefined,
    electronConnectionRequirementStatus: electronRequirementStatus,
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
    upstreamRequirements,
    electronRequirements: buildElectronRequirements(options.status),
    checks: buildChecks(options.status, options.source),
    diagnostics,
    effects: effectSummary(options.sourceCalled, continuationAllowed, options.source)
  })
}

const evaluateElectronPlatformWriterAdapterPreflight = async(
  options: CreateThirdPartyDataPackElectronPlatformWriterAdapterPreflightOptions
): Promise<ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party Electron platform writer adapter preflight is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readPlatformWriterConnectionPreflight === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party Electron platform writer adapter preflight is enabled without a platform writer connection preflight',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.electron-platform-writer-adapter-preflight.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackPlatformWriterConnectionPreflightResult
  try {
    source = await options.readPlatformWriterConnectionPreflight()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party platform writer connection preflight failed before Electron writer adapter preflight',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.electron-platform-writer-adapter-preflight.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party Electron platform writer adapter is not required because platform writer connection was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeReadySource(source)) {
    return baseResult({
      status: 'ready',
      reason: 'third-party Electron platform writer adapter preflight accepted path-free writer requirements; real Electron writer wiring remains deferred',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeConnectionSource(source) || !connectionEffectsContained(source)
      ? [
          commandDiagnostic(
            'third-party.electron-platform-writer-adapter-preflight.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.electron-platform-writer-adapter-preflight.connection-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party Electron platform writer adapter requires safe deferred Electron writer requirements before real platform wiring may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackElectronPlatformWriterAdapterPreflight = (
  options: CreateThirdPartyDataPackElectronPlatformWriterAdapterPreflightOptions = {}
): (() => Promise<ThirdPartyDataPackElectronPlatformWriterAdapterPreflightResult>) => async() => {
  const result = await evaluateElectronPlatformWriterAdapterPreflight(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackElectronPlatformWriterAdapterPreflightBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackElectronPlatformWriterAdapterPreflight =
  createThirdPartyDataPackElectronPlatformWriterAdapterPreflight()
