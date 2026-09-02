import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackAppFactoryBindingSourceResult
} from './thirdPartyDataPackAppFactoryBindingSource'
import type { ThirdPartyDataPackAppBootstrapWiringPreflightResult } from './thirdPartyDataPackAppBootstrapWiringPreflight'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceProofs,
  ThirdPartyDataPackStartupGatePersistentStateSourceResult
} from './thirdPartyDataPackStartupGatePersistentStateSource'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult
} from './thirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_KIND =
  'third-party-startup-gate-bootstrap-source'
export const THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_MODE =
  'default-disabled-app-bootstrap-startup-gate-source'

export type ThirdPartyDataPackStartupGateBootstrapSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackStartupGateBootstrapSourceEffectSummary {
  readonly startupGateBootstrapSourceCalled: boolean
  readonly appBootstrapWiringSourceCalled: boolean
  readonly startupPersistentStateSourceCalled: boolean
  readonly startupStateSnapshotAccepted: boolean
  readonly appFactoryBindingSourceCalled: boolean
  readonly appFactoryBindingContinuationAllowed: boolean
  readonly appStartupHostConnectionSourceCalled: boolean
  readonly appStartupHostConnectionAccepted: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly realRuntimePublicationCommitCalled: boolean
  readonly launcherAppCreated: false
  readonly gameAppCreated: false
  readonly piniaCreated: false
  readonly routerMounted: false
  readonly saveRead: false
  readonly uiIpcResponseDelivered: false
  readonly commandDispatched: false
  readonly thirdPartyRegistryPublished: boolean
  readonly liveRegistrySwapped: boolean
  readonly runtimeEnablementAllowed: boolean
  readonly transactionCommitted: false
  readonly runtimePublicationCommitted: boolean
  readonly packageFilesWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackStartupGateBootstrapSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_MODE
  readonly status: ThirdPartyDataPackStartupGateBootstrapSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly appBootstrapWiringSourceStatus?: ThirdPartyDataPackAppBootstrapWiringPreflightResult['status']
  readonly startupPersistentStateSourceStatus?: ThirdPartyDataPackStartupGatePersistentStateSourceResult['status']
  readonly startupPersistentStateSourceHostMode?:
    ThirdPartyDataPackStartupGatePersistentStateSourceResult['startupPersistentStateSourceHostMode']
  readonly startupPersistentStateInjectedSourceHostMode?:
    ThirdPartyDataPackStartupGatePersistentStateSourceResult['injectedSourceHostMode']
  readonly appFactoryBindingSourceStatus?: ThirdPartyDataPackAppFactoryBindingSourceResult['status']
  readonly appStartupHostConnectionSourceStatus?:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult['status']
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly lockfileHash?: Sha256Hash
  readonly persistentStateProofs?: ThirdPartyDataPackStartupGatePersistentStateSourceProofs
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackStartupGateBootstrapSourceEffectSummary
}

export interface CreateThirdPartyDataPackStartupGateBootstrapSourceOptions {
  readonly enabled?: boolean
  readonly readAppBootstrapWiringPreflight?: () => Awaitable<ThirdPartyDataPackAppBootstrapWiringPreflightResult>
  readonly readStartupGatePersistentStateSource?: () => Awaitable<ThirdPartyDataPackStartupGatePersistentStateSourceResult>
  readonly readAppFactoryBindingSource?: () => Awaitable<ThirdPartyDataPackAppFactoryBindingSourceResult>
  readonly readRuntimePublicationCommitAppStartupHostConnection?: () =>
    Awaitable<ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult>
}

export class ThirdPartyDataPackStartupGateBootstrapBlockedError extends Error {
  readonly result: ThirdPartyDataPackStartupGateBootstrapSourceResult

  constructor(result: ThirdPartyDataPackStartupGateBootstrapSourceResult) {
    super('third-party startup gate blocked application bootstrap')
    this.name = 'ThirdPartyDataPackStartupGateBootstrapBlockedError'
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

const startupPersistentStateSourceHostModes = new Set([
  'injected-test-only',
  'web-indexeddb-startup-persistent-state',
  'electron-program-directory-startup-persistent-state'
])

const forbiddenBootstrapChainSourceFields = [
  'appBootstrapWiringPreflight',
  'normalStartupGatePreflight',
  'launcherBoundaryPreflight',
  'runtimePublicationCommitAppStartupReadiness',
  'runtimePublicationCommitAppStartupHostConnection',
  'appStartupHost',
  'appStartupHostConnection',
  'rawEnvelope',
  'startupDecisionEnvelope',
  'sourceAdapterExecution',
  'adapterResult',
  'startupStateSnapshot',
  'startupStateRequest',
  'electronHost',
  'programDirectoryPath',
  'webHost',
  'webSourceHost',
  'indexedDb',
  'indexedDbStore',
  'androidHost',
  'appDataBridge',
  'androidNativeBridge',
  'androidPrivatePath',
  'modLockStorage',
  'transactionLogStorage',
  'packageWriter',
  'settingsStore',
  'saveStore',
  'cacheStore',
  'launcherApp',
  'launcherAppFactory',
  'gameApp',
  'gameAppFactory',
  'pinia',
  'piniaStore',
  'router',
  'routerInstance',
  'gameRouter',
  'app',
  'mount',
  'saveOpenGate'
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

const readStartupPersistentStateSourceHostMode = (
  value: object | undefined,
  fieldName: string
): ThirdPartyDataPackStartupGatePersistentStateSourceResult['injectedSourceHostMode'] | undefined => {
  const mode = readOwnStringField(value, fieldName)
  return startupPersistentStateSourceHostModes.has(mode ?? '')
    ? mode as ThirdPartyDataPackStartupGatePersistentStateSourceResult['injectedSourceHostMode']
    : undefined
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
      ?? 'third-party.startup-gate-bootstrap-source.diagnostic-copy',
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
  diagnostics: readonly unknown[]
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => {
  if (value === undefined || value === null || typeof value !== 'object') {
    return Object.freeze({
      ...emptySummary(),
      diagnosticCount: diagnostics.length
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
    diagnosticCount: diagnostics.length
  })
}

const effectSummary = (
  sourceCalled: boolean,
  startupPersistentStateSourceCalled: boolean,
  startupStateSnapshotAccepted: boolean,
  appFactoryBindingSourceCalled: boolean,
  appFactoryBindingContinuationAllowed: boolean,
  appStartupHostConnectionSourceCalled: boolean,
  appStartupHostConnectionAccepted: boolean,
  appBootstrapContinuationAllowed: boolean,
  thirdPartyRegistryPublished: boolean,
  liveRegistrySwapped: boolean,
  runtimeEnablementAllowed: boolean,
  realRuntimePublicationCommit: boolean
): ThirdPartyDataPackStartupGateBootstrapSourceEffectSummary => Object.freeze({
  startupGateBootstrapSourceCalled: true,
  appBootstrapWiringSourceCalled: sourceCalled,
  startupPersistentStateSourceCalled,
  startupStateSnapshotAccepted,
  appFactoryBindingSourceCalled,
  appFactoryBindingContinuationAllowed,
  appStartupHostConnectionSourceCalled,
  appStartupHostConnectionAccepted,
  appBootstrapContinuationAllowed,
  realRuntimePublicationCommitCalled: realRuntimePublicationCommit,
  launcherAppCreated: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  saveRead: false,
  uiIpcResponseDelivered: false,
  commandDispatched: false,
  thirdPartyRegistryPublished,
  liveRegistrySwapped,
  runtimeEnablementAllowed,
  transactionCommitted: false,
  runtimePublicationCommitted: realRuntimePublicationCommit,
  packageFilesWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const noRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackAppBootstrapWiringPreflightResult
): boolean => readOwnBooleanField(source, 'appBootstrapWiringAllowed') === false
  && readOwnBooleanField(source, 'normalStartupGateAllowed') === false
  && readOwnBooleanField(source, 'launcherAppAllowed') === false
  && readOwnBooleanField(source, 'gameAppCreationAllowed') === false
  && readOwnBooleanField(source, 'piniaCreationAllowed') === false
  && readOwnBooleanField(source, 'routerMountAllowed') === false
  && readOwnBooleanField(source, 'saveReadAllowed') === false
  && readOwnBooleanField(source, 'uiIpcResponseDeliveryAllowed') === false
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'rollbackRecoveryAllowed') === false

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

const pathFreeBootstrapChainSource = (
  source: object
): boolean => forbiddenBootstrapChainSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const noPersistentStateSourceRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackStartupGatePersistentStateSourceResult
): boolean => readOwnBooleanField(source, 'normalStartupContinuationAllowed') === true
  && allOwnBooleanFlagsFalse(
    readOwnDataField(source, 'effects') as object | undefined,
    [
      'startupGatePersistentStateSourceCalled',
      'persistentStateSourceAdapterCalled',
      'startupStateSnapshotAccepted',
      'normalStartupContinuationAllowed'
    ]
  )

const noAppFactorySourceRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackAppFactoryBindingSourceResult
): boolean => readOwnBooleanField(source, 'appBootstrapContinuationAllowed') === true
  && allOwnBooleanFlagsFalse(
    readOwnDataField(source, 'effects') as object | undefined,
    [
      'appFactoryBindingSourceCalled',
      'appFactoryBindingPreflightSourceCalled',
      'injectedAppFactoryBindingHostCalled',
      'appFactoryBindingHostCalled',
      'appFactoryBindingHostAccepted',
      'appBootstrapContinuationAllowed'
    ]
  )

const safePersistentStateSource = (
  source: ThirdPartyDataPackStartupGatePersistentStateSourceResult
): boolean => (
  readOwnStringField(source, 'status') === 'ready'
  || readOwnStringField(source, 'status') === 'skipped'
) && noPersistentStateSourceRuntimeOrWriteDrift(source)
  && pathFreeBootstrapChainSource(source)

const safeAppFactoryBindingSource = (
  source: ThirdPartyDataPackAppFactoryBindingSourceResult
): boolean => (
  readOwnStringField(source, 'status') === 'ready'
  || readOwnStringField(source, 'status') === 'skipped'
)
  && noAppFactorySourceRuntimeOrWriteDrift(source)
  && pathFreeBootstrapChainSource(source)

const safeAppStartupHostConnectionSource = (
  source: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult
): boolean => {
  const targetPackageId = readOwnStringField(source, 'targetPackageId')
  return readOwnStringField(source, 'status') === 'accepted'
    && readOwnBooleanField(source, 'appStartupHostWiringAllowed') === true
    && readOwnBooleanField(source, 'appBootstrapContinuationAllowed') === true
    && readOwnBooleanField(source, 'normalStartupContinuationAllowed') === true
    && readOwnBooleanField(source, 'commandContinuationAllowed') === true
    && readOwnBooleanField(source, 'uiIpcResultContinuationAllowed') === true
    && targetPackageId !== undefined
    && clonePackageIds(readOwnDataField(source, 'selectedPackageIds')).includes(targetPackageId as PackageId)
    && readOwnStringField(source, 'lockfileHash') !== undefined
    && allOwnBooleanFlagsFalse(
      readOwnDataField(source, 'effects') as object | undefined,
      [
        'runtimePublicationCommitAppStartupHostConnectionPipelineCalled',
        'runtimePublicationCommitAppStartupReadinessPipelineCalled',
        'injectedAppStartupHostCalled',
        'appStartupHostCalled',
        'appStartupHostAccepted',
        'runtimePublicationCommitAcknowledged',
        'postCommitVerificationAcknowledged',
        'liveRegistrySwapAcknowledged',
        'appFactoryBindingAcknowledged',
        'normalStartupHandoffAcknowledged',
        'appStartupReadinessAcknowledged',
        'appStartupHostWiringAllowed',
        'appBootstrapContinuationAllowed',
        'normalStartupContinuationAllowed',
        'commandContinuationAllowed',
        'uiIpcResultContinuationAllowed',
        'realRuntimePublicationCommitCalled',
        'thirdPartyRegistryPublished',
        'liveRegistryMutated',
        'liveRegistrySwapped',
        'runtimePublicationCommitted',
        'runtimeEnablementAllowed'
      ]
    )
    && pathFreeBootstrapChainSource(source)
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

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackStartupGateBootstrapSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackAppBootstrapWiringPreflightResult
    readonly persistentStateSource?: ThirdPartyDataPackStartupGatePersistentStateSourceResult
    readonly appFactoryBindingSource?: ThirdPartyDataPackAppFactoryBindingSourceResult
    readonly appStartupHostConnectionSource?:
      ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult
    readonly diagnostics?: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  }
): ThirdPartyDataPackStartupGateBootstrapSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const summarySource = options.appStartupHostConnectionSource
    ?? options.appFactoryBindingSource
    ?? options.persistentStateSource
    ?? options.source
  const selectedPackageIds = clonePackageIds(readOwnDataField(summarySource, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(summarySource, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(summarySource, 'loadOrder'))
  const startupPersistentStateSourceHostMode = readStartupPersistentStateSourceHostMode(
    options.persistentStateSource,
    'startupPersistentStateSourceHostMode'
  )
  const startupPersistentStateInjectedSourceHostMode = readStartupPersistentStateSourceHostMode(
    options.persistentStateSource,
    'injectedSourceHostMode'
  )
  const continuationAllowed = options.status === 'ready' || options.status === 'skipped'
  const startupStateSnapshotAccepted = readOwnBooleanField(
    readOwnDataField(options.persistentStateSource, 'effects') as object | undefined,
    'startupStateSnapshotAccepted'
  ) === true
  const appFactoryBindingContinuationAllowed = readOwnBooleanField(
    options.appFactoryBindingSource,
    'appBootstrapContinuationAllowed'
  ) === true
  const appStartupHostConnectionAccepted = readOwnStringField(
    options.appStartupHostConnectionSource,
    'status'
  ) === 'accepted'
  const appStartupHostConnectionEffects = readOwnDataField(
    options.appStartupHostConnectionSource,
    'effects'
  ) as object | undefined
  const acceptedAppStartupRuntimeEffects = options.status === 'ready'
    && appStartupHostConnectionAccepted
  const realRuntimePublicationCommit = acceptedAppStartupRuntimeEffects
    && readOwnBooleanField(
      appStartupHostConnectionEffects,
      'realRuntimePublicationCommitCalled'
    ) === true
    && readOwnBooleanField(appStartupHostConnectionEffects, 'runtimePublicationCommitted') === true

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    appBootstrapWiringSourceStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackAppBootstrapWiringPreflightResult['status']
      | undefined,
    startupPersistentStateSourceStatus: readOwnStringField(options.persistentStateSource, 'status') as
      | ThirdPartyDataPackStartupGatePersistentStateSourceResult['status']
      | undefined,
    ...(startupPersistentStateSourceHostMode === undefined
      ? {}
      : { startupPersistentStateSourceHostMode }),
    ...(startupPersistentStateInjectedSourceHostMode === undefined
      ? {}
      : { startupPersistentStateInjectedSourceHostMode }),
    appFactoryBindingSourceStatus: readOwnStringField(options.appFactoryBindingSource, 'status') as
      | ThirdPartyDataPackAppFactoryBindingSourceResult['status']
      | undefined,
    appStartupHostConnectionSourceStatus: readOwnStringField(options.appStartupHostConnectionSource, 'status') as
      | ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult['status']
      | undefined,
    targetPackageId: readOwnStringField(summarySource, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(summarySource, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(summarySource, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(summarySource, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(summarySource, 'packageCount') ?? selectedPackageIds.length,
    lockfileHash: readOwnStringField(summarySource, 'lockfileHash') as Sha256Hash | undefined,
    ...(readOwnDataField(options.persistentStateSource, 'persistentStateProofs') === undefined
      ? {}
      : {
          persistentStateProofs: readOwnDataField(
            options.persistentStateSource,
            'persistentStateProofs'
          ) as ThirdPartyDataPackStartupGatePersistentStateSourceProofs
        }),
    diagnostics,
    summary: cloneSummary(readOwnDataField(summarySource, 'summary'), diagnostics),
    effects: effectSummary(
      options.sourceCalled && options.source !== undefined,
      options.persistentStateSource !== undefined,
      startupStateSnapshotAccepted,
      options.appFactoryBindingSource !== undefined,
      appFactoryBindingContinuationAllowed,
      options.appStartupHostConnectionSource !== undefined,
      appStartupHostConnectionAccepted,
      continuationAllowed,
      acceptedAppStartupRuntimeEffects && readOwnBooleanField(
        appStartupHostConnectionEffects,
        'thirdPartyRegistryPublished'
      ) === true,
      acceptedAppStartupRuntimeEffects
        && readOwnBooleanField(appStartupHostConnectionEffects, 'liveRegistrySwapped') === true,
      acceptedAppStartupRuntimeEffects
        && readOwnBooleanField(appStartupHostConnectionEffects, 'runtimeEnablementAllowed') === true,
      realRuntimePublicationCommit
    )
  })
}

const evaluateAppStartupHostConnectionBootstrap = async(
  options: CreateThirdPartyDataPackStartupGateBootstrapSourceOptions
): Promise<ThirdPartyDataPackStartupGateBootstrapSourceResult> => {
  let appStartupHostConnectionSource:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult
  try {
    appStartupHostConnectionSource = await options.readRuntimePublicationCommitAppStartupHostConnection?.() as
      ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party startup gate bootstrap source failed before returning a safe app-startup host connection result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.startup-gate-bootstrap-source.app-startup-host-connection-source-failed')
      ]
    })
  }

  const diagnostics = safeDiagnostics(
    readOwnDataField(appStartupHostConnectionSource, 'diagnostics') as readonly unknown[] | undefined
  )
  if (safeAppStartupHostConnectionSource(appStartupHostConnectionSource)) {
    return baseResult({
      status: 'ready',
      reason: 'third-party startup gate bootstrap accepted a Web/Electron app-startup host connection source',
      enabled: true,
      sourceCalled: true,
      appStartupHostConnectionSource,
      diagnostics
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'third-party startup gate bootstrap rejected the app-startup host connection source before application bootstrap',
    enabled: true,
    sourceCalled: true,
    appStartupHostConnectionSource,
    diagnostics: [
      ...diagnostics,
      commandDiagnostic(
        'third-party.startup-gate-bootstrap-source.unsafe-app-startup-host-connection-source',
        readOwnStringField(appStartupHostConnectionSource, 'targetPackageId') as PackageId | undefined
      )
    ]
  })
}

const evaluateBootstrapChain = async(
  options: CreateThirdPartyDataPackStartupGateBootstrapSourceOptions
): Promise<ThirdPartyDataPackStartupGateBootstrapSourceResult> => {
  if (options.readRuntimePublicationCommitAppStartupHostConnection !== undefined) {
    return evaluateAppStartupHostConnectionBootstrap(options)
  }

  if (options.readStartupGatePersistentStateSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party startup gate bootstrap source is enabled without a startup persistent-state source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.startup-gate-bootstrap-source.missing-persistent-state-source')
      ]
    })
  }

  if (options.readAppFactoryBindingSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party startup gate bootstrap source is enabled without an app factory binding source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.startup-gate-bootstrap-source.missing-app-factory-binding-source')
      ]
    })
  }

  let persistentStateSource: ThirdPartyDataPackStartupGatePersistentStateSourceResult
  try {
    persistentStateSource = await options.readStartupGatePersistentStateSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party startup gate bootstrap source failed before returning a safe persistent-state result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.startup-gate-bootstrap-source.persistent-state-source-failed')
      ]
    })
  }

  const persistentDiagnostics = safeDiagnostics(
    readOwnDataField(persistentStateSource, 'diagnostics') as readonly unknown[] | undefined
  )
  if (!safePersistentStateSource(persistentStateSource)) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party startup gate bootstrap source rejected the persistent-state source before app factory binding',
      enabled: true,
      sourceCalled: true,
      persistentStateSource,
      diagnostics: [
        ...persistentDiagnostics,
        commandDiagnostic(
          'third-party.startup-gate-bootstrap-source.unsafe-persistent-state-source',
          readOwnStringField(persistentStateSource, 'targetPackageId') as PackageId | undefined
        )
      ]
    })
  }

  let appFactoryBindingSource: ThirdPartyDataPackAppFactoryBindingSourceResult
  try {
    appFactoryBindingSource = await options.readAppFactoryBindingSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party startup gate bootstrap source failed before returning a safe app factory binding result',
      enabled: true,
      sourceCalled: true,
      persistentStateSource,
      diagnostics: [
        ...persistentDiagnostics,
        commandDiagnostic('third-party.startup-gate-bootstrap-source.app-factory-binding-source-failed')
      ]
    })
  }

  const factoryDiagnostics = safeDiagnostics(
    readOwnDataField(appFactoryBindingSource, 'diagnostics') as readonly unknown[] | undefined
  )
  if (!safeAppFactoryBindingSource(appFactoryBindingSource)) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party startup gate bootstrap source rejected the app factory binding source before application bootstrap',
      enabled: true,
      sourceCalled: true,
      persistentStateSource,
      appFactoryBindingSource,
      diagnostics: [
        ...persistentDiagnostics,
        ...factoryDiagnostics,
        commandDiagnostic(
          'third-party.startup-gate-bootstrap-source.unsafe-app-factory-binding-source',
          readOwnStringField(appFactoryBindingSource, 'targetPackageId') as PackageId | undefined
        )
      ]
    })
  }

  return baseResult({
    status: readOwnStringField(persistentStateSource, 'status') === 'ready' ? 'ready' : 'skipped',
    reason: 'third-party startup gate bootstrap accepted path-free persistent-state and app factory binding sources',
    enabled: true,
    sourceCalled: true,
    persistentStateSource,
    appFactoryBindingSource,
    diagnostics: [
      ...persistentDiagnostics,
      ...factoryDiagnostics
    ]
  })
}

const evaluateStartupGate = async(
  options: CreateThirdPartyDataPackStartupGateBootstrapSourceOptions
): Promise<ThirdPartyDataPackStartupGateBootstrapSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party startup gate bootstrap source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (
    options.readStartupGatePersistentStateSource !== undefined
    || options.readAppFactoryBindingSource !== undefined
    || options.readRuntimePublicationCommitAppStartupHostConnection !== undefined
  ) {
    return evaluateBootstrapChain(options)
  }

  if (options.readAppBootstrapWiringPreflight === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party startup gate bootstrap source is enabled without an app bootstrap wiring source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.startup-gate-bootstrap-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackAppBootstrapWiringPreflightResult
  try {
    source = await options.readAppBootstrapWiringPreflight()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party startup gate bootstrap source failed before returning a safe app bootstrap wiring result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.startup-gate-bootstrap-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (readOwnStringField(source, 'status') === 'skipped' && noRuntimeOrWriteDrift(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party startup gate is not required because app bootstrap wiring source was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'third-party startup gate requires a future LauncherApp/GameApp startup boundary before application bootstrap may continue',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: [
      ...sourceDiagnostics,
      commandDiagnostic(
        'third-party.startup-gate-bootstrap-source.app-bootstrap-blocked',
        readOwnStringField(source, 'targetPackageId') as PackageId | undefined
      )
    ]
  })
}

export const createThirdPartyDataPackStartupGateBootstrapSource = (
  options: CreateThirdPartyDataPackStartupGateBootstrapSourceOptions = {}
): (() => Promise<ThirdPartyDataPackStartupGateBootstrapSourceResult>) => async() => {
  const result = await evaluateStartupGate(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackStartupGateBootstrapBlockedError(result)
  }
  return result
}

export const bootstrapThirdPartyDataPackStartupGate =
  createThirdPartyDataPackStartupGateBootstrapSource()
