import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import {
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE,
  type ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult
} from './thirdPartyDataPackElectronStartupGatePersistentStateExecution'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSnapshot,
  ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
} from './thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_DECISION_ENVELOPE_KIND =
  'electron-startup-gate-decision-envelope'
export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_DECISION_ENVELOPE_MODE =
  'readonly-launcher-boundary-decision'

export type ThirdPartyDataPackElectronStartupGateDecisionEnvelopeStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackElectronStartupGateDecision =
  | 'ready-for-launcher-boundary'
  | 'not-required'
  | 'blocked-before-launcher-boundary'

export type ThirdPartyDataPackElectronStartupGateDecisionEnvelopeCheckId =
  | 'electron-startup-gate-execution-wrapper'
  | 'startup-handoff-deferred'
  | 'persistent-state-preflight-deferred'
  | 'source-adapter-executed'
  | 'startup-state-snapshot-normalized'
  | 'persistent-state-proofs-ready'
  | 'no-launcher-runtime-or-write-effects'

export interface ThirdPartyDataPackElectronStartupGateDecisionEnvelopeCheck {
  readonly id: ThirdPartyDataPackElectronStartupGateDecisionEnvelopeCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackElectronStartupGatePersistentStateProofs {
  readonly transactionLogCommitted: boolean
  readonly packageStateMatched: boolean
  readonly settingsStateMatched: boolean
  readonly modLockStateMatched: boolean
  readonly liveRegistryMatched: boolean
  readonly saveCacheIsolated: boolean
}

export interface ThirdPartyDataPackElectronStartupGateDecisionEnvelopeEffectSummary {
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
  readonly electronStartupGateExecutionConsumed: boolean
  readonly startupDecisionEnvelopeBuilt: boolean
}

export interface ThirdPartyDataPackElectronStartupGateDecisionEnvelope {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_DECISION_ENVELOPE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_DECISION_ENVELOPE_MODE
  readonly platform: 'electron'
  readonly status: ThirdPartyDataPackElectronStartupGateDecisionEnvelopeStatus
  readonly startupGateDecision: ThirdPartyDataPackElectronStartupGateDecision
  readonly reason: string
  readonly readOnly: true
  readonly launcherAppAllowed: false
  readonly gameAppCreationAllowed: false
  readonly piniaCreationAllowed: false
  readonly routerMountAllowed: false
  readonly saveReadAllowed: false
  readonly uiIpcResponseDeliveryAllowed: false
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly writeAllowed: false
  readonly rollbackRecoveryAllowed: false
  readonly executionStatus?: ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult['startupGateHandoffStatus']
  readonly persistentStatePreflightStatus?: string
  readonly sourceAdapterStatus?: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult['status']
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly messageKey?: string
  readonly recovery?: ModDiagnosticRecovery
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly persistentStateProofs?: ThirdPartyDataPackElectronStartupGatePersistentStateProofs
  readonly checks: readonly ThirdPartyDataPackElectronStartupGateDecisionEnvelopeCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackElectronStartupGateDecisionEnvelopeEffectSummary
}

export interface BuildThirdPartyDataPackElectronStartupGateDecisionEnvelopeOptions {
  readonly execution: ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult
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

const readOwnBooleanField = (
  value: object | undefined,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readOwnNumberField = (
  value: object | undefined,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

const safeRecovery = (value: unknown): ModDiagnosticRecovery =>
  diagnosticRecoveries.has(value as ModDiagnosticRecovery) ? value as ModDiagnosticRecovery : 'none'

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
      ?? 'third-party.electron-startup-gate-decision-envelope.diagnostic-copy',
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

const check = (
  id: ThirdPartyDataPackElectronStartupGateDecisionEnvelopeCheckId,
  status: ThirdPartyDataPackElectronStartupGateDecisionEnvelopeCheck['status'],
  reason: string
): ThirdPartyDataPackElectronStartupGateDecisionEnvelopeCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackElectronStartupGateDecisionEnvelopeCheck[] => Object.freeze([
  'electron-startup-gate-execution-wrapper',
  'startup-handoff-deferred',
  'persistent-state-preflight-deferred',
  'source-adapter-executed',
  'startup-state-snapshot-normalized',
  'persistent-state-proofs-ready',
  'no-launcher-runtime-or-write-effects'
].map(id => check(
  id as ThirdPartyDataPackElectronStartupGateDecisionEnvelopeCheckId,
  'skipped',
  reason
)))

const allOwnBooleanFlagsFalse = (
  value: object | undefined,
  allowedTrueKeys: readonly string[] = []
): boolean => {
  if (value === undefined) return false
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

const adapterResultFromExecution = (
  execution: ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult
): ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult | undefined => {
  const sourceAdapterExecution = readOwnDataField(execution, 'sourceAdapterExecution')
  if (sourceAdapterExecution === undefined || sourceAdapterExecution === null || typeof sourceAdapterExecution !== 'object') {
    return undefined
  }
  const adapterResult = readOwnDataField(sourceAdapterExecution, 'adapterResult')
  return adapterResult !== undefined && adapterResult !== null && typeof adapterResult === 'object'
    ? adapterResult as ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
    : undefined
}

const executionWrapperReady = (
  execution: ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult
): boolean => readOwnStringField(execution, 'kind')
    === THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_KIND
  && readOwnStringField(execution, 'mode')
    === THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_PERSISTENT_STATE_EXECUTION_MODE
  && readOwnStringField(execution, 'platform') === 'electron'

const persistentStatePreflightStatus = (
  execution: ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult
): string | undefined => {
  const preflight = readOwnDataField(execution, 'persistentStatePreflight')
  return preflight !== undefined && preflight !== null && typeof preflight === 'object'
    ? readOwnStringField(preflight, 'status')
    : undefined
}

const startupSnapshot = (
  adapterResult: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult | undefined
): ThirdPartyDataPackStartupGatePersistentStateSnapshot | undefined => {
  const snapshot = readOwnDataField(adapterResult, 'startupStateSnapshot')
  return snapshot !== undefined && snapshot !== null && typeof snapshot === 'object'
    ? snapshot as ThirdPartyDataPackStartupGatePersistentStateSnapshot
    : undefined
}

const proofSummary = (
  snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshot | undefined
): ThirdPartyDataPackElectronStartupGatePersistentStateProofs | undefined => {
  if (snapshot === undefined) return undefined
  return Object.freeze({
    transactionLogCommitted: readOwnBooleanField(snapshot, 'transactionLogCommitted') === true,
    packageStateMatched: readOwnBooleanField(snapshot, 'packageStateMatched') === true,
    settingsStateMatched: readOwnBooleanField(snapshot, 'settingsStateMatched') === true,
    modLockStateMatched: readOwnBooleanField(snapshot, 'modLockStateMatched') === true,
    liveRegistryMatched: readOwnBooleanField(snapshot, 'liveRegistryMatched') === true,
    saveCacheIsolated: readOwnBooleanField(snapshot, 'saveCacheIsolated') === true
  })
}

const proofsReady = (
  proofs: ThirdPartyDataPackElectronStartupGatePersistentStateProofs | undefined
): boolean => proofs !== undefined
  && Object.values(proofs).every(value => value === true)

const noLauncherRuntimeOrWriteEffects = (
  adapterResult: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult | undefined
): boolean => adapterResult !== undefined
  && readOwnBooleanField(adapterResult, 'launcherAppAllowed') === false
  && readOwnBooleanField(adapterResult, 'gameAppCreationAllowed') === false
  && readOwnBooleanField(adapterResult, 'piniaCreationAllowed') === false
  && readOwnBooleanField(adapterResult, 'routerMountAllowed') === false
  && readOwnBooleanField(adapterResult, 'uiIpcResponseDeliveryAllowed') === false
  && readOwnBooleanField(adapterResult, 'commandDispatchAllowed') === false
  && readOwnBooleanField(adapterResult, 'transactionCommitAllowed') === false
  && readOwnBooleanField(adapterResult, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(adapterResult, 'writeAllowed') === false
  && readOwnBooleanField(adapterResult, 'rollbackRecoveryAllowed') === false
  && allOwnBooleanFlagsFalse(
    readOwnDataField(adapterResult, 'effects') as object | undefined,
    [
      'startupPersistentStateSourceAdapterCalled',
      'injectedSourceHostCalled',
      'startupStateSnapshotReceived',
      'startupStateSnapshotNormalized'
    ]
  )

const buildChecks = (
  execution: ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult,
  adapterResult: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult | undefined,
  snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshot | undefined,
  proofs: ThirdPartyDataPackElectronStartupGatePersistentStateProofs | undefined
): readonly ThirdPartyDataPackElectronStartupGateDecisionEnvelopeCheck[] => Object.freeze([
  check(
    'electron-startup-gate-execution-wrapper',
    executionWrapperReady(execution) ? 'satisfied' : 'blocked',
    'Decision envelope must consume the narrow Electron startup gate persistent-state execution wrapper.'
  ),
  check(
    'startup-handoff-deferred',
    readOwnStringField(execution, 'startupGateHandoffStatus') === 'deferred' ? 'satisfied' : 'blocked',
    'Startup handoff must still be deferred before the launcher boundary can make a read-only decision.'
  ),
  check(
    'persistent-state-preflight-deferred',
    persistentStatePreflightStatus(execution) === 'deferred' ? 'satisfied' : 'blocked',
    'Persistent-state preflight must remain deferred and path-free before a startup decision envelope is prepared.'
  ),
  check(
    'source-adapter-executed',
    readOwnStringField(adapterResult, 'status') === 'executed'
      && readOwnBooleanField(adapterResult, 'startupPersistentStateSourceAdapterAllowed') === true
      ? 'satisfied'
      : 'blocked',
    'Electron startup source adapter execution must have normalized a real persistent-state snapshot.'
  ),
  check(
    'startup-state-snapshot-normalized',
    snapshot !== undefined
      && readOwnBooleanField(adapterResult, 'startupStateSnapshotNormalized') === true
      ? 'satisfied'
      : 'blocked',
    'The startup decision may only reference a normalized path-free snapshot proof summary.'
  ),
  check(
    'persistent-state-proofs-ready',
    proofsReady(proofs) ? 'satisfied' : 'blocked',
    'Transaction log, package, settings, mod-lock, live registry and save/cache isolation proofs must all be ready.'
  ),
  check(
    'no-launcher-runtime-or-write-effects',
    noLauncherRuntimeOrWriteEffects(adapterResult) ? 'satisfied' : 'blocked',
    'The decision envelope must not inherit LauncherApp, GameApp, runtime, UI/IPC, command, transaction, rollback or write effects.'
  )
])

const blockedDiagnostics = (
  checks: readonly ThirdPartyDataPackElectronStartupGateDecisionEnvelopeCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.electron-startup-gate-decision-envelope.checks.${currentCheck.id}`,
    packageId
  )))

const createEffectSummary = (
  executionConsumed: boolean
): ThirdPartyDataPackElectronStartupGateDecisionEnvelopeEffectSummary => ({
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
  diagnosticsWritten: false,
  electronStartupGateExecutionConsumed: executionConsumed,
  startupDecisionEnvelopeBuilt: true
})

const emptySummary = (): ThirdPartyDataPackUiIpcResultEnvelopeSummary => Object.freeze({
  selectedPackageCount: 0,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 0,
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  diagnosticCount: 0
})

const cloneSummary = (
  value: unknown,
  diagnosticCount: number
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => {
  if (value === undefined || value === null || typeof value !== 'object') {
    return Object.freeze({
      ...emptySummary(),
      diagnosticCount
    })
  }
  return Object.freeze({
    selectedPackageCount: readOwnNumberField(value, 'selectedPackageCount') ?? 0,
    blockedPackageCount: readOwnNumberField(value, 'blockedPackageCount') ?? 0,
    blockedCandidateCount: readOwnNumberField(value, 'blockedCandidateCount') ?? 0,
    loadOrderCount: readOwnNumberField(value, 'loadOrderCount') ?? 0,
    registryCount: readOwnNumberField(value, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(value, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(value, 'packageCount') ?? 0,
    diagnosticCount
  })
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

const baseEnvelope = (
  status: ThirdPartyDataPackElectronStartupGateDecisionEnvelopeStatus,
  startupGateDecision: ThirdPartyDataPackElectronStartupGateDecision,
  reason: string,
  execution: ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult,
  adapterResult: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult | undefined,
  checks: readonly ThirdPartyDataPackElectronStartupGateDecisionEnvelopeCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshot | undefined,
  proofs: ThirdPartyDataPackElectronStartupGatePersistentStateProofs | undefined
): ThirdPartyDataPackElectronStartupGateDecisionEnvelope => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(adapterResult, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(adapterResult, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(adapterResult, 'loadOrder'))
  const summary = cloneSummary(readOwnDataField(adapterResult, 'summary'), diagnostics.length)

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_DECISION_ENVELOPE_KIND,
    mode: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_GATE_DECISION_ENVELOPE_MODE,
    platform: 'electron',
    status,
    startupGateDecision,
    reason,
    readOnly: true,
    launcherAppAllowed: false,
    gameAppCreationAllowed: false,
    piniaCreationAllowed: false,
    routerMountAllowed: false,
    saveReadAllowed: false,
    uiIpcResponseDeliveryAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    executionStatus: readOwnStringField(execution, 'startupGateHandoffStatus') as ThirdPartyDataPackElectronStartupGatePersistentStateExecutionResult['startupGateHandoffStatus'] | undefined,
    persistentStatePreflightStatus: persistentStatePreflightStatus(execution),
    sourceAdapterStatus: readOwnStringField(adapterResult, 'status') as ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult['status'] | undefined,
    requestedCommandId: readOwnStringField(adapterResult, 'requestedCommandId') === 'install' ? 'install' as const : undefined,
    targetPackageId: readOwnStringField(adapterResult, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(adapterResult, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(adapterResult, 'registryCount') ?? summary.registryCount,
    entryCount: readOwnNumberField(adapterResult, 'entryCount') ?? summary.entryCount,
    packageCount: readOwnNumberField(adapterResult, 'packageCount') ?? summary.packageCount,
    candidateHash: readOwnStringField(snapshot, 'candidateHash') as Sha256Hash | undefined,
    lockfileHash: readOwnStringField(snapshot, 'lockfileHash') as Sha256Hash | undefined,
    messageKey: readOwnStringField(snapshot, 'messageKey'),
    recovery: snapshot === undefined ? undefined : safeRecovery(readOwnStringField(snapshot, 'recovery')),
    retryable: readOwnBooleanField(snapshot, 'retryable') === true,
    rollbackRequired: readOwnBooleanField(snapshot, 'rollbackRequired') === true,
    ...(proofs === undefined ? {} : { persistentStateProofs: proofs }),
    checks,
    diagnostics,
    summary,
    effects: createEffectSummary(executionWrapperReady(execution))
  })
}

export const buildThirdPartyDataPackElectronStartupGateDecisionEnvelope = (
  options: BuildThirdPartyDataPackElectronStartupGateDecisionEnvelopeOptions
): ThirdPartyDataPackElectronStartupGateDecisionEnvelope => {
  const { execution } = options
  const adapterResult = adapterResultFromExecution(execution)

  if (
    readOwnStringField(execution, 'startupGateHandoffStatus') === 'skipped'
    || persistentStatePreflightStatus(execution) === 'skipped'
    || readOwnStringField(adapterResult, 'status') === 'skipped'
  ) {
    const reason = readOwnStringField(adapterResult, 'reason')
      ?? 'startup gate decision envelope is not required because no third-party startup state is pending'
    return baseEnvelope(
      'skipped',
      'not-required',
      reason,
      execution,
      adapterResult,
      skippedChecks(reason),
      safeDiagnostics(readOwnDataField(adapterResult, 'diagnostics') as readonly unknown[] | undefined),
      undefined,
      undefined
    )
  }

  const snapshot = startupSnapshot(adapterResult)
  const proofs = proofSummary(snapshot)
  const checks = buildChecks(execution, adapterResult, snapshot, proofs)
  const sourceDiagnostics = safeDiagnostics(readOwnDataField(adapterResult, 'diagnostics') as readonly unknown[] | undefined)
  const extraDiagnostics = blockedDiagnostics(
    checks,
    readOwnStringField(adapterResult, 'targetPackageId') as PackageId | undefined
  )
  const diagnostics = Object.freeze([
    ...sourceDiagnostics,
    ...extraDiagnostics
  ])

  if (
    readOwnStringField(execution, 'startupGateHandoffStatus') === 'blocked'
    || persistentStatePreflightStatus(execution) === 'blocked'
    || readOwnStringField(adapterResult, 'status') === 'blocked'
    || extraDiagnostics.length > 0
  ) {
    return baseEnvelope(
      'blocked',
      'blocked-before-launcher-boundary',
      extraDiagnostics.length > 0
        ? 'electron startup gate decision envelope inputs are inconsistent'
        : readOwnStringField(adapterResult, 'reason') ?? 'electron startup gate decision envelope is blocked upstream',
      execution,
      adapterResult,
      checks,
      diagnostics,
      snapshot,
      proofs
    )
  }

  return baseEnvelope(
    'ready',
    'ready-for-launcher-boundary',
    'electron startup gate persistent state is ready for a later LauncherApp/GameApp boundary decision; app creation remains deferred',
    execution,
    adapterResult,
    checks,
    diagnostics,
    snapshot,
    proofs
  )
}
