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
  ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
} from './thirdPartyDataPackSettingsLockfilePersistentWriterSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_PLATFORM_WRITER_CONNECTION_PREFLIGHT_KIND =
  'third-party-platform-writer-connection-preflight'
export const THIRD_PARTY_DATA_PACK_PLATFORM_WRITER_CONNECTION_PREFLIGHT_MODE =
  'default-disabled-platform-writer-connection-preflight'

export type ThirdPartyDataPackPlatformWriterConnectionPreflightStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPlatformWriterConnectionPlatformId =
  | 'electron'
  | 'web'
  | 'android'

export type ThirdPartyDataPackPlatformWriterConnectionRequirementStatus =
  | 'required'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackPlatformWriterConnectionRequirement {
  readonly id: string
  readonly platform: ThirdPartyDataPackPlatformWriterConnectionPlatformId
  readonly status: ThirdPartyDataPackPlatformWriterConnectionRequirementStatus
  readonly reason: string
}

export interface ThirdPartyDataPackPlatformWriterConnectionCheck {
  readonly id: string
  readonly status: 'satisfied' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPlatformWriterConnectionPreflightEffectSummary {
  readonly platformWriterConnectionPreflightCalled: boolean
  readonly settingsLockfilePersistentWriterSourceCalled: boolean
  readonly upstreamSettingsLockfilePersistentWritesAcknowledged: boolean
  readonly platformWriterConnectionDeferred: boolean
  readonly realPlatformWriterHostCalled: false
  readonly electronPlatformWriterConnected: false
  readonly webPlatformWriterConnected: false
  readonly androidPlatformWriterConnected: false
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

export interface ThirdPartyDataPackPlatformWriterConnectionSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackPlatformWriterConnectionPreflightResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_PLATFORM_WRITER_CONNECTION_PREFLIGHT_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_PLATFORM_WRITER_CONNECTION_PREFLIGHT_MODE
  readonly status: ThirdPartyDataPackPlatformWriterConnectionPreflightStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly settingsLockfilePersistentWriterSourceStatus?: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult['status']
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
  readonly checks: readonly ThirdPartyDataPackPlatformWriterConnectionCheck[]
  readonly requirements: readonly ThirdPartyDataPackPlatformWriterConnectionRequirement[]
  readonly diagnostics: readonly ThirdPartyDataPackPlatformWriterConnectionSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackPlatformWriterConnectionPreflightEffectSummary
}

export interface CreateThirdPartyDataPackPlatformWriterConnectionPreflightOptions {
  readonly enabled?: boolean
  readonly readSettingsLockfilePersistentWriterSource?: () =>
    Awaitable<ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult>
}

export class ThirdPartyDataPackPlatformWriterConnectionPreflightBlockedError extends Error {
  readonly result: ThirdPartyDataPackPlatformWriterConnectionPreflightResult

  constructor(result: ThirdPartyDataPackPlatformWriterConnectionPreflightResult) {
    super('third-party platform writer connection preflight blocked command continuation')
    this.name = 'ThirdPartyDataPackPlatformWriterConnectionPreflightBlockedError'
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

const flexibleUpstreamEffectFields = new Set<string>([
  'settingsLockfilePersistentWriterSourceCalled',
  'settingsLockfileCommitSourceCalled',
  'injectedSettingsLockfilePersistentWriterHostCalled',
  'settingsLockfilePersistentWriterHostCalled',
  'settingsLockfilePersistentWriterHostWritten',
  'appBootstrapContinuationAllowed',
  'commandContinuationAllowed'
])

const forbiddenPreflightSourceFields = [
  'platformWriter',
  'platformWriterHost',
  'realPlatformWriterHost',
  'electronPlatformWriter',
  'webPlatformWriter',
  'androidPlatformWriter',
  'electronWriterHost',
  'webWriterHost',
  'androidWriterHost',
  'electronHost',
  'webHost',
  'androidHost',
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
  'indexedDb',
  'appDataDirectory',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
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
): ThirdPartyDataPackPlatformWriterConnectionSafeDiagnostic => {
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
      ?? 'third-party.platform-writer-connection-preflight.diagnostic-copy',
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
): readonly ThirdPartyDataPackPlatformWriterConnectionSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackPlatformWriterConnectionSafeDiagnostic[] = []
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
): ThirdPartyDataPackPlatformWriterConnectionSafeDiagnostic => Object.freeze({
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

const pathFreePreflightSource = (
  source: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): boolean => forbiddenPreflightSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const sourceEffectsContained = (
  source: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): boolean => {
  const effects = readOwnDataField(source, 'effects') as object | undefined
  if (effects === undefined) return false
  const writesExpected = readOwnStringField(source, 'status') === 'written'
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
    if (flexibleUpstreamEffectFields.has(String(key))) return typeof descriptor.value === 'boolean'
    if (key === 'realSettingsLockfilePersistentWriterHostCalled') return descriptor.value === false
    if (key === 'settingsWritten') return descriptor.value === writesExpected
    if (key === 'lockfileWritten') return descriptor.value === writesExpected
    return descriptor.value === false
  })
}

const noPlatformOrRuntimeDrift = (
  source: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): boolean => readOwnBooleanField(source, 'appBootstrapContinuationAllowed') === true
  && readOwnBooleanField(source, 'commandContinuationAllowed') === true
  && sourceEffectsContained(source)

const safeSkippedSource = (
  source: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noPlatformOrRuntimeDrift(source)
  && pathFreePreflightSource(source)

const safeWrittenSource = (
  source: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): boolean => {
  const writeEvidence = cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
  return readOwnStringField(source, 'status') === 'written'
    && readOwnStringField(source, 'requestedCommandId') === 'install'
    && readOwnStringField(source, 'targetPackageId') !== undefined
    && cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined
    && readOwnStringField(source, 'lockfileHash') !== undefined
    && readOwnStringField(source, 'settingsLockfilePersistentWriterHostStatus') === 'written'
    && writeEvidence.modLockWriteProbeStatus === 'written'
    && writeEvidence.transactionLogWriteProbeStatus === 'written'
    && writeEvidence.modLockPersistentWriteExecuted === true
    && writeEvidence.transactionLogPersistentWriteExecuted === true
    && noPlatformOrRuntimeDrift(source)
    && pathFreePreflightSource(source)
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

const requirement = (
  platform: ThirdPartyDataPackPlatformWriterConnectionPlatformId,
  status: ThirdPartyDataPackPlatformWriterConnectionRequirementStatus
): ThirdPartyDataPackPlatformWriterConnectionRequirement => Object.freeze({
  id: `${platform}-settings-lockfile-platform-writer-connection`,
  platform,
  status,
  reason: status === 'required'
    ? `${platform} settings/lockfile writer connection remains deferred for a later explicit platform slice`
    : status === 'skipped'
      ? `${platform} platform writer connection is not required because the upstream writer source was skipped`
    : `${platform} platform writer connection is blocked by unsafe upstream writer state`
})

const androidVanillaOnlyRequirement = (): ThirdPartyDataPackPlatformWriterConnectionRequirement => Object.freeze({
  id: 'android-settings-lockfile-platform-writer-connection',
  platform: 'android',
  status: 'skipped',
  reason: 'Android is vanilla-only for this phase and does not require third-party settings/lockfile writer wiring'
})

const buildRequirements = (
  status: ThirdPartyDataPackPlatformWriterConnectionPreflightStatus
): readonly ThirdPartyDataPackPlatformWriterConnectionRequirement[] => Object.freeze([
  requirement('electron', status === 'deferred' ? 'required' : status),
  requirement('web', status === 'deferred' ? 'required' : status),
  androidVanillaOnlyRequirement()
])

const check = (
  id: string,
  status: ThirdPartyDataPackPlatformWriterConnectionCheck['status'],
  reason: string
): ThirdPartyDataPackPlatformWriterConnectionCheck => Object.freeze({ id, status, reason })

const buildChecks = (
  status: ThirdPartyDataPackPlatformWriterConnectionPreflightStatus,
  source?: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): readonly ThirdPartyDataPackPlatformWriterConnectionCheck[] => Object.freeze([
  check(
    'settings-lockfile-persistent-writer-source-safe',
    status === 'blocked' ? 'blocked' : 'satisfied',
    status === 'blocked'
      ? 'upstream settings-lockfile persistent writer source is missing, failed, unsafe or path-bearing'
      : 'upstream settings-lockfile persistent writer source exposes only safe path-free summary fields'
  ),
  check(
    'platform-writer-connection-deferred',
    status === 'blocked' ? 'blocked' : 'satisfied',
    readOwnStringField(source, 'status') === 'written'
      ? 'persistent settings and lockfile write acknowledgement reached the platform writer connection preflight'
      : 'platform writer connection is skipped until a persistent writer acknowledgement exists'
  ),
  check(
    'no-real-platform-writer-called',
    'satisfied',
    'preflight does not call Electron, Web or Android writer hosts'
  )
])

const effectSummary = (
  sourceCalled: boolean,
  continuationAllowed: boolean,
  source?: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
): ThirdPartyDataPackPlatformWriterConnectionPreflightEffectSummary => {
  const sourceStatus = readOwnStringField(source, 'status')
  const writesAcknowledged = continuationAllowed && sourceStatus === 'written'
  return Object.freeze({
    platformWriterConnectionPreflightCalled: true,
    settingsLockfilePersistentWriterSourceCalled: sourceCalled,
    upstreamSettingsLockfilePersistentWritesAcknowledged: writesAcknowledged,
    platformWriterConnectionDeferred: writesAcknowledged,
    realPlatformWriterHostCalled: false,
    electronPlatformWriterConnected: false,
    webPlatformWriterConnected: false,
    androidPlatformWriterConnected: false,
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
    lockfileWritten: writesAcknowledged,
    lockfileRestored: false,
    settingsWritten: writesAcknowledged,
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
    readonly status: ThirdPartyDataPackPlatformWriterConnectionPreflightStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
    readonly diagnostics?: readonly ThirdPartyDataPackPlatformWriterConnectionSafeDiagnostic[]
  }
): ThirdPartyDataPackPlatformWriterConnectionPreflightResult => {
  const continuationAllowed = options.status !== 'blocked'
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_PLATFORM_WRITER_CONNECTION_PREFLIGHT_KIND,
    mode: THIRD_PARTY_DATA_PACK_PLATFORM_WRITER_CONNECTION_PREFLIGHT_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
    settingsLockfilePersistentWriterSourceStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult['status']
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
    checks: buildChecks(options.status, options.source),
    requirements: buildRequirements(options.status),
    diagnostics,
    effects: effectSummary(options.sourceCalled, continuationAllowed, options.source)
  })
}

const evaluatePlatformWriterConnectionPreflight = async(
  options: CreateThirdPartyDataPackPlatformWriterConnectionPreflightOptions
): Promise<ThirdPartyDataPackPlatformWriterConnectionPreflightResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party platform writer connection preflight is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readSettingsLockfilePersistentWriterSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party platform writer connection preflight is enabled without a persistent writer source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.platform-writer-connection-preflight.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
  try {
    source = await options.readSettingsLockfilePersistentWriterSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party settings-lockfile persistent writer source failed before platform writer connection preflight',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.platform-writer-connection-preflight.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party platform writer connection is not required because persistent writer source was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeWrittenSource(source)) {
    return baseResult({
      status: 'deferred',
      reason: 'third-party platform writer connection preflight accepted path-free persistent writer acknowledgement; real platform writer wiring remains deferred',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreePreflightSource(source) || !noPlatformOrRuntimeDrift(source)
      ? [
          commandDiagnostic(
            'third-party.platform-writer-connection-preflight.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.platform-writer-connection-preflight.connection-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party platform writer connection preflight requires safe persistent writer acknowledgement before real platform wiring may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackPlatformWriterConnectionPreflight = (
  options: CreateThirdPartyDataPackPlatformWriterConnectionPreflightOptions = {}
): (() => Promise<ThirdPartyDataPackPlatformWriterConnectionPreflightResult>) => async() => {
  const result = await evaluatePlatformWriterConnectionPreflight(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackPlatformWriterConnectionPreflightBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackPlatformWriterConnectionPreflight =
  createThirdPartyDataPackPlatformWriterConnectionPreflight()
