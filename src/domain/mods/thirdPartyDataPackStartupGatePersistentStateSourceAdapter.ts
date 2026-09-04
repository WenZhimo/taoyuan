import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyDataPackRuntimeCommandId } from './thirdPartyDataPackRuntimeCommandState'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackStartupGatePersistentStatePreflightResult,
  ThirdPartyDataPackStartupGatePersistentStateRequirementId,
  ThirdPartyDataPackStartupGatePersistentStateStageId
} from './thirdPartyDataPackStartupGatePersistentStatePreflight'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

export type ThirdPartyDataPackStartupGatePersistentStateSourceAdapterStatus =
  | 'executed'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackStartupGatePersistentStateSourceHostKind =
  | 'injected-startup-persistent-state-source-adapter'
  | 'web-indexeddb-startup-persistent-state-source-adapter'
  | 'electron-program-directory-startup-persistent-state-source-adapter'

export type ThirdPartyDataPackStartupGatePersistentStateSourceHostMode =
  | 'injected-test-only'
  | 'web-indexeddb-startup-persistent-state'
  | 'electron-program-directory-startup-persistent-state'

export type ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheckId =
  | 'persistent-state-preflight-deferred'
  | 'install-command-source'
  | 'target-package-selected'
  | 'candidate-identity-present'
  | 'lockfile-hash-present'
  | 'injected-source-host-ready'
  | 'injected-test-boundary'
  | 'no-upstream-startup-read-write-effects'
  | 'startup-state-snapshot-returned'
  | 'startup-state-snapshot-ready'

export interface ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheck {
  readonly id: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackStartupGatePersistentStateSourceRequest {
  readonly formatVersion: 1
  readonly commandId: ThirdPartyDataPackRuntimeCommandId
  readonly packageId: PackageId
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly requiredSourceIds: readonly ThirdPartyDataPackStartupGatePersistentStateRequirementId[]
  readonly deferredStageIds: readonly ThirdPartyDataPackStartupGatePersistentStateStageId[]
}

export interface ThirdPartyDataPackStartupGatePersistentStateSourceHost {
  readonly kind: ThirdPartyDataPackStartupGatePersistentStateSourceHostKind
  readonly mode: ThirdPartyDataPackStartupGatePersistentStateSourceHostMode
  readonly read: (
    request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest
  ) => ThirdPartyDataPackStartupGatePersistentStateSnapshotSource
    | Promise<ThirdPartyDataPackStartupGatePersistentStateSnapshotSource>
}

export interface ThirdPartyDataPackStartupGatePersistentStateSnapshotSource {
  readonly kind: 'startup-persistent-state-snapshot'
  readonly settled: boolean
  readonly packageId?: PackageId
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly transactionLogCommitted?: boolean
  readonly packageStateMatched?: boolean
  readonly packageStateRemoved?: boolean
  readonly settingsStateMatched?: boolean
  readonly modLockStateMatched?: boolean
  readonly liveRegistryMatched?: boolean
  readonly saveCacheIsolated?: boolean
  readonly diagnostics?: readonly unknown[]
  readonly messageKey?: string
  readonly recovery?: ModDiagnosticRecovery
  readonly retryable?: boolean
  readonly rollbackRequired?: boolean
}

export interface ThirdPartyDataPackStartupGatePersistentStateSnapshot {
  readonly formatVersion: 1
  readonly kind: 'startup-persistent-state-snapshot'
  readonly commandId: 'install'
  readonly packageId: PackageId
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly transactionLogCommitted: boolean
  readonly packageStateMatched: boolean
  readonly settingsStateMatched: boolean
  readonly modLockStateMatched: boolean
  readonly liveRegistryMatched: boolean
  readonly saveCacheIsolated: boolean
  readonly messageKey: string
  readonly recovery: ModDiagnosticRecovery
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
}

export interface ThirdPartyDataPackStartupGatePersistentStateSourceAdapterEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly modManagementUiMounted: false
  readonly launcherAppMounted: false
  readonly gameAppCreated: false
  readonly piniaCreated: false
  readonly routerMounted: false
  readonly electronIpcExposed: false
  readonly electronIpcResponseSent: false
  readonly webFilePickerOpened: false
  readonly webUiBridgeOpened: false
  readonly webUiResponsePublished: false
  readonly androidFilePickerOpened: false
  readonly androidUiBridgeOpened: false
  readonly androidUiResponsePublished: false
  readonly commandDispatcherCalled: false
  readonly commandDispatched: false
  readonly atomicCommitExecutorCalled: false
  readonly transactionCommitted: false
  readonly transactionLogPrepared: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecutorCalled: false
  readonly postCommitVerificationExecuted: false
  readonly startupPersistentStateSourceAdapterCalled: boolean
  readonly injectedSourceHostCalled: boolean
  readonly startupStateSnapshotReceived: boolean
  readonly startupStateSnapshotNormalized: boolean
  readonly transactionLogRead: false
  readonly packageStateRead: false
  readonly settingsRead: false
  readonly lockfileRead: false
  readonly liveRegistryRead: false
  readonly saveRead: false
  readonly saveCacheIsolationChecked: false
  readonly successEnvelopeDelivered: false
  readonly failureEnvelopeDelivered: false
  readonly retryStateDelivered: false
  readonly rollbackStateDelivered: false
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

export interface ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult {
  readonly status: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterStatus
  readonly sourcePreflightStatus: ThirdPartyDataPackStartupGatePersistentStatePreflightResult['status']
  readonly reason: string
  readonly startupGatePersistentStateSourceAdapter: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterStatus
  readonly readOnly: true
  readonly injectedSourceHostRequired: true
  readonly startupPersistentStateSourceHostMode?: ThirdPartyDataPackStartupGatePersistentStateSourceHostMode
  readonly injectedSourceHostMode: ThirdPartyDataPackStartupGatePersistentStateSourceHostMode
  readonly sourceHostCalled: boolean
  readonly startupStateSnapshotReceived: boolean
  readonly startupStateSnapshotNormalized: boolean
  readonly startupPersistentStateSourceAdapterAllowed: boolean
  readonly persistentStartupReadAllowed: false
  readonly transactionLogReadAllowed: false
  readonly packageStateReadAllowed: false
  readonly settingsReadAllowed: false
  readonly lockfileReadAllowed: false
  readonly liveRegistryReadAllowed: false
  readonly saveReadAllowed: false
  readonly saveCacheIsolationCheckAllowed: false
  readonly startupFailureReportingAllowed: false
  readonly launcherAppAllowed: false
  readonly gameAppCreationAllowed: false
  readonly piniaCreationAllowed: false
  readonly routerMountAllowed: false
  readonly uiIpcResponseDeliveryAllowed: false
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly writeAllowed: false
  readonly rollbackRecoveryAllowed: false
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly startupStateRequest?: ThirdPartyDataPackStartupGatePersistentStateSourceRequest
  readonly startupStateSnapshot?: ThirdPartyDataPackStartupGatePersistentStateSnapshot
  readonly checks: readonly ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterEffectSummary
}

export interface ExecuteThirdPartyDataPackStartupGatePersistentStateSourceAdapterOptions {
  readonly preflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult
  readonly host?: ThirdPartyDataPackStartupGatePersistentStateSourceHost
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
  value: object,
  fieldName: string
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnBooleanField = (
  value: object,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readOwnNumberField = (
  value: object,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
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

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic => {
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
      ?? 'third-party.startup-gate-persistent-state-source-adapter.diagnostic-copy',
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
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] = []
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
): ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.startup-gate-persistent-state-source-adapter.checks.${currentCheck.id}`,
    packageId
  )))

const cloneRequirementIds = (
  value: unknown
): ThirdPartyDataPackStartupGatePersistentStateRequirementId[] => {
  if (!Array.isArray(value)) return []
  const length = readArrayLength(value)
  if (length === undefined) return []

  const result: ThirdPartyDataPackStartupGatePersistentStateRequirementId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    const item = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (item !== undefined && item !== null && typeof item === 'object') {
      const id = readOwnStringField(item, 'id')
      const status = readOwnStringField(item, 'status')
      if (id !== undefined && status === 'required') {
        result.push(id as ThirdPartyDataPackStartupGatePersistentStateRequirementId)
      }
    }
  }
  return Object.freeze(result) as ThirdPartyDataPackStartupGatePersistentStateRequirementId[]
}

const cloneDeferredStageIds = (
  value: unknown
): ThirdPartyDataPackStartupGatePersistentStateStageId[] => {
  if (!Array.isArray(value)) return []
  const length = readArrayLength(value)
  if (length === undefined) return []

  const result: ThirdPartyDataPackStartupGatePersistentStateStageId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    const item = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (item !== undefined && item !== null && typeof item === 'object') {
      const id = readOwnStringField(item, 'id')
      const status = readOwnStringField(item, 'status')
      if (id !== undefined && status === 'deferred') {
        result.push(id as ThirdPartyDataPackStartupGatePersistentStateStageId)
      }
    }
  }
  return Object.freeze(result) as ThirdPartyDataPackStartupGatePersistentStateStageId[]
}

const cloneSnapshotSource = (
  value: unknown
): ThirdPartyDataPackStartupGatePersistentStateSnapshotSource | undefined => {
  if (value === undefined || value === null || typeof value !== 'object') return undefined
  const kind = readOwnStringField(value, 'kind')
  const settled = readOwnBooleanField(value, 'settled')
  if (kind !== 'startup-persistent-state-snapshot' || settled === undefined) return undefined
  const diagnostics = readOwnDataField(value, 'diagnostics')
  return Object.freeze({
    kind,
    settled,
    packageId: readOwnStringField(value, 'packageId') as PackageId | undefined,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(value, 'candidateIdentity')),
    lockfileHash: readOwnStringField(value, 'lockfileHash') as Sha256Hash | undefined,
    transactionLogCommitted: readOwnBooleanField(value, 'transactionLogCommitted'),
    packageStateMatched: readOwnBooleanField(value, 'packageStateMatched'),
    settingsStateMatched: readOwnBooleanField(value, 'settingsStateMatched'),
    modLockStateMatched: readOwnBooleanField(value, 'modLockStateMatched'),
    liveRegistryMatched: readOwnBooleanField(value, 'liveRegistryMatched'),
    saveCacheIsolated: readOwnBooleanField(value, 'saveCacheIsolated'),
    diagnostics: Array.isArray(diagnostics) ? diagnostics : undefined,
    messageKey: readOwnStringField(value, 'messageKey'),
    recovery: readOwnStringField(value, 'recovery') as ModDiagnosticRecovery | undefined,
    retryable: readOwnBooleanField(value, 'retryable'),
    rollbackRequired: readOwnBooleanField(value, 'rollbackRequired')
  })
}

const summary = (
  preflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult,
  diagnosticCount: number
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => Object.freeze({
  selectedPackageCount: clonePackageIds(preflight.selectedPackageIds).length,
  blockedPackageCount: clonePackageIds(preflight.blockedPackageIds).length,
  blockedCandidateCount: preflight.blockedCandidateCount,
  loadOrderCount: clonePackageIds(preflight.loadOrder).length,
  registryCount: preflight.registryCount,
  entryCount: preflight.entryCount,
  packageCount: preflight.packageCount,
  diagnosticCount
})

const allOwnBooleanFlagsFalse = (
  value: object,
  allowedTrueKeys: readonly string[] = []
): boolean => {
  const allowedTrue = new Set(allowedTrueKeys)
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
    if (!('value' in descriptor) || typeof descriptor.value !== 'boolean') return false
    return descriptor.value === false || (typeof key === 'string' && allowedTrue.has(key))
  })
}

const createEffectSummary = (
  hostCalled: boolean,
  snapshotNormalized: boolean,
  snapshotReceived: boolean
): ThirdPartyDataPackStartupGatePersistentStateSourceAdapterEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  launcherAppMounted: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  electronIpcExposed: false,
  electronIpcResponseSent: false,
  webFilePickerOpened: false,
  webUiBridgeOpened: false,
  webUiResponsePublished: false,
  androidFilePickerOpened: false,
  androidUiBridgeOpened: false,
  androidUiResponsePublished: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  atomicCommitExecutorCalled: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  startupPersistentStateSourceAdapterCalled: hostCalled,
  injectedSourceHostCalled: hostCalled,
  startupStateSnapshotReceived: snapshotReceived,
  startupStateSnapshotNormalized: snapshotNormalized,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveRead: false,
  saveCacheIsolationChecked: false,
  successEnvelopeDelivered: false,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
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

const check = (
  id: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheckId,
  status: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheck['status'],
  reason: string
): ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheck => Object.freeze({ id, status, reason })

const defaultHostMode: ThirdPartyDataPackStartupGatePersistentStateSourceHostMode = 'injected-test-only'

const sourceHostModes = new Set<ThirdPartyDataPackStartupGatePersistentStateSourceHostMode>([
  'injected-test-only',
  'web-indexeddb-startup-persistent-state',
  'electron-program-directory-startup-persistent-state'
])

const safeHostMode = (
  mode: unknown
): ThirdPartyDataPackStartupGatePersistentStateSourceHostMode =>
  sourceHostModes.has(mode as ThirdPartyDataPackStartupGatePersistentStateSourceHostMode)
    ? mode as ThirdPartyDataPackStartupGatePersistentStateSourceHostMode
    : defaultHostMode

const hostBoundaryAccepted = (
  host: ThirdPartyDataPackStartupGatePersistentStateSourceHost | undefined
): boolean => (
  host?.kind === 'injected-startup-persistent-state-source-adapter'
    && host.mode === 'injected-test-only'
) || (
  host?.kind === 'web-indexeddb-startup-persistent-state-source-adapter'
    && host.mode === 'web-indexeddb-startup-persistent-state'
) || (
  host?.kind === 'electron-program-directory-startup-persistent-state-source-adapter'
    && host.mode === 'electron-program-directory-startup-persistent-state'
)

const platformHostReason = (
  hostMode: ThirdPartyDataPackStartupGatePersistentStateSourceHostMode,
  injectedReason: string,
  platformReason: string
): string => hostMode === 'injected-test-only' ? injectedReason : platformReason

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheck[] => Object.freeze([
  'persistent-state-preflight-deferred',
  'install-command-source',
  'target-package-selected',
  'candidate-identity-present',
  'lockfile-hash-present',
  'injected-source-host-ready',
  'injected-test-boundary',
  'no-upstream-startup-read-write-effects',
  'startup-state-snapshot-returned',
  'startup-state-snapshot-ready'
].map(id => check(
  id as ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheckId,
  'skipped',
  reason
)))

const preExecutionChecks = (
  preflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult,
  host: ThirdPartyDataPackStartupGatePersistentStateSourceHost | undefined
): readonly ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheck[] => {
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  return Object.freeze([
    check(
      'persistent-state-preflight-deferred',
      preflight.status === 'deferred' ? 'satisfied' : 'blocked',
      'Startup state source execution requires the source persistent-state preflight to remain deferred.'
    ),
    check(
      'install-command-source',
      preflight.requestedCommandId === 'install' ? 'satisfied' : 'blocked',
      'This startup state source adapter only covers install commands.'
    ),
    check(
      'target-package-selected',
      preflight.targetPackageId !== undefined && selectedPackageIds.includes(preflight.targetPackageId)
        ? 'satisfied'
        : 'blocked',
      'The selected install target must be present before constructing a startup state request.'
    ),
    check(
      'candidate-identity-present',
      preflight.candidateIdentity?.candidateHash !== undefined ? 'satisfied' : 'blocked',
      'Startup state source execution requires the candidate identity that persistent state must prove.'
    ),
    check(
      'lockfile-hash-present',
      preflight.lockfileHash !== undefined ? 'satisfied' : 'blocked',
      'Startup state source execution requires the lockfile hash that persistent state must prove.'
    ),
    check(
      'injected-source-host-ready',
      host !== undefined && typeof host.read === 'function' ? 'satisfied' : 'blocked',
      'A fixed startup state source host must be present before the adapter can execute.'
    ),
    check(
      'injected-test-boundary',
      hostBoundaryAccepted(host) ? 'satisfied' : 'blocked',
      'The adapter only accepts explicit path-free startup state source host modes.'
    ),
    check(
      'no-upstream-startup-read-write-effects',
      preflight.startupGateHandoffConsumed === true
        && preflight.persistentStateSourcePrepared === true
        && preflight.persistentStartupReadAllowed === false
        && preflight.transactionLogReadAllowed === false
        && preflight.packageStateReadAllowed === false
        && preflight.settingsReadAllowed === false
        && preflight.lockfileReadAllowed === false
        && preflight.liveRegistryReadAllowed === false
        && preflight.saveReadAllowed === false
        && preflight.saveCacheIsolationCheckAllowed === false
        && preflight.startupFailureReportingAllowed === false
        && preflight.launcherAppAllowed === false
        && preflight.gameAppCreationAllowed === false
        && preflight.commandDispatchAllowed === false
        && preflight.transactionCommitAllowed === false
        && preflight.runtimeEnablementAllowed === false
        && preflight.writeAllowed === false
        && preflight.rollbackRecoveryAllowed === false
        && allOwnBooleanFlagsFalse(preflight.effects, [
          'startupGateHandoffConsumed',
          'persistentStateSourcePrepared'
        ])
        ? 'satisfied'
        : 'blocked',
      'The source preflight must not already contain startup reads, LauncherApp/GameApp creation, runtime, UI/IPC, write or rollback effects.'
    ),
    check(
      'startup-state-snapshot-returned',
      'skipped',
      'Startup state snapshot presence is checked only after the injected host returns.'
    ),
    check(
      'startup-state-snapshot-ready',
      'skipped',
      'Startup state snapshot readiness is checked only after host snapshot normalization.'
    )
  ])
}

const checksWithSnapshot = (
  checks: readonly ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheck[],
  snapshotStatus: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheck['status'],
  snapshotReason: string,
  readyStatus: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheck['status'],
  readyReason: string
): readonly ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheck[] => Object.freeze(checks.map(currentCheck => {
  if (currentCheck.id === 'startup-state-snapshot-returned') {
    return check('startup-state-snapshot-returned', snapshotStatus, snapshotReason)
  }
  if (currentCheck.id === 'startup-state-snapshot-ready') {
    return check('startup-state-snapshot-ready', readyStatus, readyReason)
  }
  return currentCheck
}))

const buildStartupStateRequest = (
  preflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult
): ThirdPartyDataPackStartupGatePersistentStateSourceRequest | undefined => {
  if (preflight.requestedCommandId !== 'install' || preflight.targetPackageId === undefined) return undefined
  const candidateIdentity = cloneCandidateIdentity(preflight.candidateIdentity)
  if (candidateIdentity === undefined || preflight.lockfileHash === undefined) return undefined
  return deepFreezeObjectGraph({
    formatVersion: 1,
    commandId: 'install',
    packageId: preflight.targetPackageId,
    candidateIdentity,
    lockfileHash: preflight.lockfileHash,
    selectedPackageIds: clonePackageIds(preflight.selectedPackageIds),
    blockedPackageIds: clonePackageIds(preflight.blockedPackageIds),
    blockedCandidateCount: preflight.blockedCandidateCount,
    loadOrder: clonePackageIds(preflight.loadOrder),
    registryCount: preflight.registryCount,
    entryCount: preflight.entryCount,
    packageCount: preflight.packageCount,
    requiredSourceIds: cloneRequirementIds(preflight.persistentStateRequirements),
    deferredStageIds: cloneDeferredStageIds(preflight.persistentStateStages)
  })
}

const snapshotIdentityMatches = (
  preflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult,
  snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshotSource
): boolean => preflight.candidateIdentity?.candidateHash !== undefined
  && snapshot.candidateIdentity?.candidateHash === preflight.candidateIdentity.candidateHash

const snapshotReady = (
  preflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult,
  snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshotSource
): boolean => preflight.status === 'deferred'
  && preflight.requestedCommandId === 'install'
  && preflight.targetPackageId !== undefined
  && snapshot.kind === 'startup-persistent-state-snapshot'
  && snapshot.settled === true
  && snapshot.packageId === preflight.targetPackageId
  && snapshotIdentityMatches(preflight, snapshot)
  && snapshot.lockfileHash === preflight.lockfileHash
  && snapshot.transactionLogCommitted === true
  && snapshot.packageStateMatched === true
  && snapshot.settingsStateMatched === true
  && snapshot.modLockStateMatched === true
  && snapshot.liveRegistryMatched === true
  && snapshot.saveCacheIsolated === true

const safeRecovery = (
  value: ModDiagnosticRecovery | undefined
): ModDiagnosticRecovery =>
  diagnosticRecoveries.has(value as ModDiagnosticRecovery) ? value as ModDiagnosticRecovery : 'none'

const safeMessageKey = (
  value: string | undefined
): string => {
  if (value !== undefined && /^[A-Za-z0-9_.-]+$/.test(value)) return value
  return 'mods.startup.persistent.state.install.ready'
}

const normalizeSnapshot = (
  preflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult,
  snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshotSource,
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  resultSummary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
): ThirdPartyDataPackStartupGatePersistentStateSnapshot => Object.freeze({
  formatVersion: 1,
  kind: 'startup-persistent-state-snapshot',
  commandId: 'install',
  packageId: snapshot.packageId as PackageId,
  candidateHash: snapshot.candidateIdentity?.candidateHash ?? preflight.candidateIdentity?.candidateHash as Sha256Hash,
  lockfileHash: snapshot.lockfileHash ?? preflight.lockfileHash as Sha256Hash,
  transactionLogCommitted: snapshot.transactionLogCommitted === true,
  packageStateMatched: snapshot.packageStateMatched === true,
  settingsStateMatched: snapshot.settingsStateMatched === true,
  modLockStateMatched: snapshot.modLockStateMatched === true,
  liveRegistryMatched: snapshot.liveRegistryMatched === true,
  saveCacheIsolated: snapshot.saveCacheIsolated === true,
  messageKey: safeMessageKey(snapshot.messageKey),
  recovery: safeRecovery(snapshot.recovery),
  retryable: snapshot.retryable === true,
  rollbackRequired: snapshot.rollbackRequired === true,
  summary: resultSummary,
  diagnostics
})

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

const baseResult = (
  status: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterStatus,
  reason: string,
  preflight: ThirdPartyDataPackStartupGatePersistentStatePreflightResult,
  checks: readonly ThirdPartyDataPackStartupGatePersistentStateSourceAdapterCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  hostCalled: boolean,
  snapshotReceived: boolean,
  hostMode: ThirdPartyDataPackStartupGatePersistentStateSourceHostMode = defaultHostMode,
  startupStateRequest?: ThirdPartyDataPackStartupGatePersistentStateSourceRequest,
  startupStateSnapshot?: ThirdPartyDataPackStartupGatePersistentStateSnapshot
): ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult => {
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(preflight.blockedPackageIds)
  const loadOrder = clonePackageIds(preflight.loadOrder)
  const snapshotNormalized = startupStateSnapshot !== undefined

  return deepFreezeObjectGraph({
    status,
    sourcePreflightStatus: preflight.status,
    reason,
    startupGatePersistentStateSourceAdapter: status,
    readOnly: true,
    injectedSourceHostRequired: true,
    startupPersistentStateSourceHostMode: hostMode,
    injectedSourceHostMode: hostMode,
    sourceHostCalled: hostCalled,
    startupStateSnapshotReceived: snapshotReceived,
    startupStateSnapshotNormalized: snapshotNormalized,
    startupPersistentStateSourceAdapterAllowed: status === 'executed',
    persistentStartupReadAllowed: false,
    transactionLogReadAllowed: false,
    packageStateReadAllowed: false,
    settingsReadAllowed: false,
    lockfileReadAllowed: false,
    liveRegistryReadAllowed: false,
    saveReadAllowed: false,
    saveCacheIsolationCheckAllowed: false,
    startupFailureReportingAllowed: false,
    launcherAppAllowed: false,
    gameAppCreationAllowed: false,
    piniaCreationAllowed: false,
    routerMountAllowed: false,
    uiIpcResponseDeliveryAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: preflight.requestedCommandId === 'install' ? 'install' as const : undefined,
    targetPackageId: preflight.targetPackageId,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: preflight.blockedCandidateCount,
    loadOrder,
    registryCount: preflight.registryCount,
    entryCount: preflight.entryCount,
    packageCount: preflight.packageCount,
    candidateIdentity: cloneCandidateIdentity(preflight.candidateIdentity),
    lockfileHash: preflight.lockfileHash,
    ...(startupStateRequest === undefined ? {} : { startupStateRequest }),
    ...(startupStateSnapshot === undefined ? {} : { startupStateSnapshot }),
    checks,
    diagnostics,
    summary: startupStateSnapshot?.summary ?? summary(preflight, diagnostics.length),
    effects: createEffectSummary(hostCalled, snapshotNormalized, snapshotReceived)
  })
}

export const executeThirdPartyDataPackStartupGatePersistentStateSourceAdapter = async (
  options: ExecuteThirdPartyDataPackStartupGatePersistentStateSourceAdapterOptions
): Promise<ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult> => {
  const { preflight } = options

  if (preflight.status === 'skipped') {
    return baseResult(
      'skipped',
      preflight.reason,
      preflight,
      skippedChecks(preflight.reason),
      [],
      false,
      false
    )
  }

  if (preflight.status === 'blocked') {
    return baseResult(
      'blocked',
      preflight.reason,
      preflight,
      skippedChecks(preflight.reason),
      safeDiagnostics(preflight.diagnostics),
      false,
      false
    )
  }

  const checks = preExecutionChecks(preflight, options.host)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, preflight.targetPackageId)
  const sourceDiagnostics = safeDiagnostics(preflight.diagnostics)
  const startupStateRequest = buildStartupStateRequest(preflight)

  if (blockedDiagnostics.length > 0 || options.host === undefined || startupStateRequest === undefined) {
    return baseResult(
      'blocked',
      'startup gate persistent state source adapter inputs are inconsistent',
      preflight,
      checks,
      [
        ...sourceDiagnostics,
        ...blockedDiagnostics
      ],
      false,
      false,
      safeHostMode(options.host?.mode)
    )
  }

  let rawSnapshot: unknown
  try {
    rawSnapshot = await options.host.read(startupStateRequest)
  } catch {
    const snapshotChecks = checksWithSnapshot(
      checks,
      'blocked',
      'The injected startup state source host threw before returning a safe snapshot.',
      'skipped',
      'Startup state snapshot readiness is skipped because no safe snapshot was returned.'
    )
    return baseResult(
      'blocked',
      platformHostReason(
        options.host.mode,
        'injected startup persistent state source host failed before snapshot',
        'startup persistent state source host failed before snapshot'
      ),
      preflight,
      snapshotChecks,
      [
        ...sourceDiagnostics,
        commandDiagnostic(
          'third-party.startup-gate-persistent-state-source-adapter.host-failed',
          preflight.targetPackageId
        )
      ],
      true,
      false,
      options.host.mode,
      startupStateRequest
    )
  }

  const snapshotSource = cloneSnapshotSource(rawSnapshot)
  if (snapshotSource === undefined) {
    const snapshotChecks = checksWithSnapshot(
      checks,
      'blocked',
      'The injected startup state source host did not return a safe snapshot source.',
      'skipped',
      'Startup state snapshot readiness is skipped because no safe snapshot was returned.'
    )
    return baseResult(
      'blocked',
      platformHostReason(
        options.host.mode,
        'injected startup persistent state source host returned an invalid snapshot',
        'startup persistent state source host returned an invalid snapshot'
      ),
      preflight,
      snapshotChecks,
      [
        ...sourceDiagnostics,
        commandDiagnostic(
          'third-party.startup-gate-persistent-state-source-adapter.snapshot-invalid',
          preflight.targetPackageId
        )
      ],
      true,
      false,
      options.host.mode,
      startupStateRequest
    )
  }

  const snapshotDiagnostics = safeDiagnostics(snapshotSource.diagnostics)
  const ready = snapshotReady(preflight, snapshotSource)
  const snapshotChecks = checksWithSnapshot(
    checks,
    'satisfied',
    'The startup state source host returned a safe path-free snapshot source.',
    ready ? 'satisfied' : 'blocked',
    ready
      ? 'The startup state snapshot proves transaction log, package, settings, mod-lock, live registry and save/cache isolation identity.'
      : 'The injected startup state snapshot did not match the source preflight identity or required startup proofs.'
  )

  if (!ready) {
    return baseResult(
      'blocked',
      platformHostReason(
        options.host.mode,
        'injected startup persistent state source snapshot failed adapter normalization',
        'startup persistent state source snapshot failed adapter normalization'
      ),
      preflight,
      snapshotChecks,
      [
        ...sourceDiagnostics,
        ...snapshotDiagnostics,
        ...diagnosticsForBlockedChecks(snapshotChecks, preflight.targetPackageId)
      ],
      true,
      true,
      options.host.mode,
      startupStateRequest
    )
  }

  const diagnostics = Object.freeze([
    ...sourceDiagnostics,
    ...snapshotDiagnostics
  ])
  const resultSummary = summary(preflight, diagnostics.length)
  const snapshot = normalizeSnapshot(preflight, snapshotSource, diagnostics, resultSummary)

  return baseResult(
    'executed',
    platformHostReason(
      options.host.mode,
      'startup gate persistent state source adapter executed the injected-test-only host and normalized its path-free startup snapshot',
      'startup gate persistent state source adapter executed a platform startup state source host and normalized its path-free startup snapshot'
    ),
    preflight,
    snapshotChecks,
    diagnostics,
    true,
    true,
    options.host.mode,
    startupStateRequest,
    snapshot
  )
}
