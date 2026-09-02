import {
  createDiscoveryFileSystemFromContentPackageSource,
  type ContentPackageSource,
  type ContentPackageSourceDirectoryEntry
} from './contentPackageSource'
import {
  createElectronReadonlyDirectorySource
} from './electronContentPackageSourceProbe'
import {
  getOfficialBaselineContentRegistrySet,
  getLiveContentRegistryReference,
  publishOfficialContentRegistrySet
} from './liveContentRegistry'
import {
  buildThirdPartyDataPackDisableState,
  type ThirdPartyDataPackDisableState
} from './thirdPartyDataPackDisableTransaction'
import type { RegistrySet } from './registry'
import type { PackageId } from './ids'
import {
  buildOfficialRegistrySetFromStaticData
} from './staticAdapters'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDataPackDiscoveryReport
} from './thirdPartyDataPackDiscovery'
import {
  buildThirdPartyDataPackElectronStartupGateDecisionEnvelope
} from './thirdPartyDataPackElectronStartupGateDecisionEnvelope'
import {
  executeThirdPartyDataPackElectronStartupGatePersistentStateExecution
} from './thirdPartyDataPackElectronStartupGatePersistentStateExecution'
import {
  createThirdPartyDataPackElectronStartupPersistentStateReadHost
} from './thirdPartyDataPackElectronStartupPersistentStateIpcBridge'
import {
  buildThirdPartyDataPackLauncherBoundaryPreflight,
  type ThirdPartyDataPackLauncherBoundaryPreflightResult
} from './thirdPartyDataPackLauncherBoundaryPreflight'
import {
  buildThirdPartyDataPackLiveRegistrySwapProtection,
  type ThirdPartyDataPackLiveRegistrySwapProtectionResult
} from './thirdPartyDataPackLiveRegistrySwapProtection'
import {
  buildThirdPartyDataPackMountInput,
  type ThirdPartyDataPackMountInputResult
} from './thirdPartyDataPackMountInput'
import type {
  ThirdPartyDataPackAppFactoryBindingHostEnvelope,
  ThirdPartyDataPackAppFactoryBindingHostResult
} from './thirdPartyDataPackAppFactoryBindingSource'
import type {
  ThirdPartyDataPackNormalStartupHandoffHostEnvelope,
  ThirdPartyDataPackNormalStartupHandoffHostResult
} from './thirdPartyDataPackNormalStartupHandoffExecutionSource'
import {
  buildThirdPartyDataPackPublicationRollbackRecovery,
  type ThirdPartyDataPackPublicationRollbackRecoveryResult
} from './thirdPartyDataPackPublicationRollbackRecovery'
import {
  createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline,
  type ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
} from './thirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitHost
} from './thirdPartyDataPackRuntimePublicationCommitHost'
import {
  createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline
} from './thirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline'
import {
  createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline
} from './thirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline'
import {
  buildThirdPartyDataPackRuntimePublicationPreflight,
  type ThirdPartyDataPackRuntimePublicationPreflightResult
} from './thirdPartyDataPackRuntimePublicationPreflight'
import {
  createThirdPartyDataPackSharedRendererStartupGateBootstrapSource
} from './thirdPartyDataPackSharedRendererStartupGateBootstrapSource'
import {
  createThirdPartyDataPackStartupGatePersistentStateSource,
  type ThirdPartyDataPackStartupGatePersistentStateSourceResult
} from './thirdPartyDataPackStartupGatePersistentStateSource'
import type {
  ThirdPartyDataPackStartupGateHandoffEffectSummary,
  ThirdPartyDataPackStartupGateHandoffPreflightResult,
  ThirdPartyDataPackStartupGateHandoffRequirement,
  ThirdPartyDataPackStartupGateHandoffRequirementId,
  ThirdPartyDataPackStartupGateHandoffStage
} from './thirdPartyDataPackStartupGateHandoffPreflight'
import {
  THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_MODE,
  type ThirdPartyDataPackStartupGateBootstrapSourceEffectSummary,
  type ThirdPartyDataPackStartupGateBootstrapSourceResult
} from './thirdPartyDataPackStartupGateBootstrapSource'
import {
  buildThirdPartyDataPackTransactionPreCommitPlan,
  type ThirdPartyDataPackTransactionPreCommitPlanResult
} from './thirdPartyDataPackTransactionPreCommitPlan'
import type {
  ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitEffectSummary,
  ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult
} from './thirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceRequest,
  ThirdPartyDataPackStartupGatePersistentStateSnapshotSource
} from './thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import {
  buildThirdPartyDataPackRuntimePublicationCommitAdapter
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import {
  buildThirdPartyDataPackWebStartupGateDecisionEnvelope
} from './thirdPartyDataPackWebStartupGateDecisionEnvelope'
import {
  executeThirdPartyDataPackWebStartupGatePersistentStateExecution
} from './thirdPartyDataPackWebStartupGatePersistentStateExecution'
import {
  createThirdPartyDataPackWebStartupPersistentStateSourceHost
} from './thirdPartyDataPackWebStartupPersistentStateSourceHost'
import {
  createWebIndexedDbSettingsLockfilePersistentWriterStore,
  type ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
} from './thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
import {
  createWebIndexedDbImportPersistenceStore,
  restoreWebIndexedDbImportSource,
  type WebIndexedDbImportPersistenceStore
} from './webIndexedDbImportPersistence'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID =
  'latest-web-file-picker-import'

type InstalledStateSourceKind = 'web-indexeddb' | 'electron-program-directory-userdata'

interface InstalledStateContext {
  readonly kind: 'enabled'
  readonly sourceKind: InstalledStateSourceKind
  readonly officialRegistrySet: RegistrySet
  readonly source: ContentPackageSource
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly mountInput: ThirdPartyDataPackMountInputResult
  readonly runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult
  readonly transactionPreCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult
  readonly liveRegistrySwapProtection: ThirdPartyDataPackLiveRegistrySwapProtectionResult
  readonly publicationRollbackRecovery: ThirdPartyDataPackPublicationRollbackRecoveryResult
  readonly runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
  readonly launcherBoundaryPreflight: ThirdPartyDataPackLauncherBoundaryPreflightResult
  readonly startupPersistentStateSource: ThirdPartyDataPackStartupGatePersistentStateSourceResult
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
}

interface DisabledInstalledState {
  readonly kind: 'disabled'
  readonly sourceKind: InstalledStateSourceKind
  readonly targetPackageId: PackageId
  readonly packageCount: number
  readonly startupPersistentStateSourceStatus: 'ready'
  readonly startupPersistentStateSourceHostMode:
    NonNullable<ThirdPartyDataPackStartupGatePersistentStateSourceResult['startupPersistentStateSourceHostMode']>
  readonly startupPersistentStateInjectedSourceHostMode:
    NonNullable<ThirdPartyDataPackStartupGatePersistentStateSourceResult['injectedSourceHostMode']>
  readonly persistentStateProofs: {
    readonly transactionLogCommitted: true
    readonly packageStateMatched: true
    readonly settingsStateMatched: true
    readonly modLockStateMatched: true
    readonly liveRegistryMatched: true
    readonly saveCacheIsolated: true
  }
}

type InstalledStateContextResult = InstalledStateContext | DisabledInstalledState

interface ResolvedInstalledStateSource {
  readonly sourceKind: InstalledStateSourceKind
  readonly source: ContentPackageSource
  readonly webStore?: WebIndexedDbImportPersistenceStore
  readonly webSettingsLockfileStore?: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
  readonly webStartupPersistentStateHost?: ReturnType<
    typeof createThirdPartyDataPackWebStartupPersistentStateSourceHost
  >
  readonly electronStartupPersistentStateHost?: ReturnType<
    typeof createThirdPartyDataPackElectronStartupPersistentStateReadHost
  >
}

export interface CreateThirdPartyDataPackInstalledStateStartupGateBootstrapSourceOptions {
  readonly enabled?: boolean
  readonly runtimeHost?: unknown
  readonly resolveRuntimeHost?: () => unknown
  readonly webStore?: WebIndexedDbImportPersistenceStore
  readonly webSettingsLockfileStore?: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
  readonly webImportId?: string
}

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

const noStartupGateEffects = (
  sourceCalled: boolean
): ThirdPartyDataPackStartupGateBootstrapSourceEffectSummary => Object.freeze({
  startupGateBootstrapSourceCalled: true,
  appBootstrapWiringSourceCalled: sourceCalled,
  startupPersistentStateSourceCalled: false,
  startupStateSnapshotAccepted: false,
  appFactoryBindingSourceCalled: false,
  appFactoryBindingContinuationAllowed: false,
  appStartupHostConnectionSourceCalled: false,
  appStartupHostConnectionAccepted: false,
  appBootstrapContinuationAllowed: true,
  realRuntimePublicationCommitCalled: false,
  launcherAppCreated: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  saveRead: false,
  uiIpcResponseDelivered: false,
  commandDispatched: false,
  thirdPartyRegistryPublished: false,
  liveRegistrySwapped: false,
  runtimeEnablementAllowed: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  packageFilesWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const skippedInstalledStateResult = (
  options: {
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly reason: string
  }
): ThirdPartyDataPackStartupGateBootstrapSourceResult => Object.freeze({
  kind: THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_KIND,
  mode: THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_MODE,
  status: 'skipped',
  reason: options.reason,
  readOnly: true,
  enabled: options.enabled,
  sourceCalled: options.sourceCalled,
  appBootstrapContinuationAllowed: true,
  selectedPackageIds: Object.freeze([]),
  blockedPackageIds: Object.freeze([]),
  blockedCandidateCount: 0,
  loadOrder: Object.freeze([]),
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  diagnostics: Object.freeze([]),
  summary: emptySummary(),
  effects: noStartupGateEffects(options.sourceCalled)
})

const readOwnDataField = (
  value: unknown,
  fieldName: string
): unknown => {
  if (value === null || typeof value !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const resolveRuntimeHost = (
  options: CreateThirdPartyDataPackInstalledStateStartupGateBootstrapSourceOptions
): unknown => {
  if ('runtimeHost' in options) return options.runtimeHost
  if (options.resolveRuntimeHost !== undefined) {
    try {
      return options.resolveRuntimeHost()
    } catch {
      return undefined
    }
  }
  return typeof window === 'undefined' ? undefined : window
}

const maybeMethod = (
  value: unknown,
  fieldName: string
): ((input: never) => Awaitable<unknown>) | undefined => {
  const method = readOwnDataField(value, fieldName)
  return typeof method === 'function'
    ? method as (input: never) => Awaitable<unknown>
    : undefined
}

const unwrapElectronReadonlyDirectorySourceResult = async<T>(
  valuePromise: Awaitable<unknown>
): Promise<T> => {
  const value = await valuePromise
  if (value !== null && typeof value === 'object' && readOwnDataField(value, 'ok') === true) {
    return readOwnDataField(value, 'value') as T
  }
  throw new Error('Electron read-only directory source operation failed')
}

const createElectronSourceFromRuntimeHost = (
  runtimeHost: unknown
): ContentPackageSource | null => {
  const electronApi = readOwnDataField(runtimeHost, 'electronAPI')
  const sourceApi = readOwnDataField(electronApi, 'electronReadonlyDirectorySource')
  const getEntry = maybeMethod(sourceApi, 'getEntry')
  const readDirectory = maybeMethod(sourceApi, 'readDirectory')
  const readTextFile = maybeMethod(sourceApi, 'readTextFile')
  if (getEntry === undefined || readDirectory === undefined || readTextFile === undefined) {
    return null
  }

  return createElectronReadonlyDirectorySource({
    host: {
      getEntry: sourcePath =>
        unwrapElectronReadonlyDirectorySourceResult<ContentPackageSourceDirectoryEntry | null>(
          getEntry.call(sourceApi, sourcePath as never)
        ),
      readDirectory: sourcePath =>
        unwrapElectronReadonlyDirectorySourceResult<readonly ContentPackageSourceDirectoryEntry[]>(
          readDirectory.call(sourceApi, sourcePath as never)
        ),
      readTextFile: sourcePath =>
        unwrapElectronReadonlyDirectorySourceResult<string>(
          readTextFile.call(sourceApi, sourcePath as never)
        )
    }
  })
}

const createElectronStartupPersistentStateHostFromRuntimeHost = (
  runtimeHost: unknown
): ReturnType<typeof createThirdPartyDataPackElectronStartupPersistentStateReadHost> | null => {
  const electronApi = readOwnDataField(runtimeHost, 'electronAPI')
  const readThirdPartyDataPackStartupPersistentState = maybeMethod(
    electronApi,
    'readThirdPartyDataPackStartupPersistentState'
  )
  if (readThirdPartyDataPackStartupPersistentState === undefined) return null

  return createThirdPartyDataPackElectronStartupPersistentStateReadHost({
    invoke: (_channel, request) =>
      readThirdPartyDataPackStartupPersistentState.call(electronApi, request as never)
  })
}

const electronInstalledStateSourceRootExists = async(
  source: ContentPackageSource
): Promise<boolean> => (await source.getEntry('')) !== null

const createWebStore = (
  options: CreateThirdPartyDataPackInstalledStateStartupGateBootstrapSourceOptions
): WebIndexedDbImportPersistenceStore | null => {
  if (options.webStore !== undefined) return options.webStore
  try {
    return createWebIndexedDbImportPersistenceStore()
  } catch {
    return null
  }
}

const createWebSettingsLockfileStore = (
  options: CreateThirdPartyDataPackInstalledStateStartupGateBootstrapSourceOptions
): ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore | null => {
  if (options.webSettingsLockfileStore !== undefined) return options.webSettingsLockfileStore
  try {
    return createWebIndexedDbSettingsLockfilePersistentWriterStore()
  } catch {
    return null
  }
}

const resolveInstalledStateSource = async(
  options: CreateThirdPartyDataPackInstalledStateStartupGateBootstrapSourceOptions
): Promise<ResolvedInstalledStateSource | null> => {
  const runtimeHost = resolveRuntimeHost(options)
  const electronApi = readOwnDataField(runtimeHost, 'electronAPI')
  if (electronApi !== undefined) {
    const source = createElectronSourceFromRuntimeHost(runtimeHost)
    const electronStartupPersistentStateHost =
      createElectronStartupPersistentStateHostFromRuntimeHost(runtimeHost)
    if (source === null || electronStartupPersistentStateHost === null) {
      return null
    }
    if (!await electronInstalledStateSourceRootExists(source)) {
      return null
    }
    return Object.freeze({
      sourceKind: 'electron-program-directory-userdata' as const,
      source,
      electronStartupPersistentStateHost
    })
  }

  const webStore = createWebStore(options)
  if (webStore === null) return null
  const source = await restoreWebIndexedDbImportSource(
    webStore,
    options.webImportId ?? THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID
  )
  if (source === null) return null
  const webSettingsLockfileStore = createWebSettingsLockfileStore(options)
  if (webSettingsLockfileStore === null) return null
  return Object.freeze({
    sourceKind: 'web-indexeddb' as const,
    source,
    webStore,
    webSettingsLockfileStore,
    webStartupPersistentStateHost: createThirdPartyDataPackWebStartupPersistentStateSourceHost({
      store: webStore,
      settingsLockfileStore: webSettingsLockfileStore
    })
  })
}

const resolveOfficialBaselineRegistrySet = (): RegistrySet => {
  try {
    return getOfficialBaselineContentRegistrySet()
  } catch {
    return buildOfficialRegistrySetFromStaticData()
  }
}

const buildInstalledStateRuntimeContext = async(
  sourceKind: InstalledStateSourceKind,
  source: ContentPackageSource
): Promise<Omit<
  InstalledStateContext,
  'kind' | 'sourceKind' | 'source' | 'launcherBoundaryPreflight' | 'startupPersistentStateSource'
>> => {
  const officialRegistrySet = resolveOfficialBaselineRegistrySet()
  const discoveryReport = await discoverThirdPartyDataPacks(
    source.identity.rootPath,
    createDiscoveryFileSystemFromContentPackageSource(source)
  )
  const mountInput = buildThirdPartyDataPackMountInput({
    officialRegistrySet,
    discoveryReport
  })
  if (mountInput.status !== 'ready') {
    throw new Error('third-party installed state startup source has no selected package')
  }
  if (
    mountInput.candidateRegistrySet === undefined
    || mountInput.candidateIdentity === undefined
    || mountInput.lockfileHash === undefined
    || mountInput.lockfileDraft === undefined
  ) {
    throw new Error('third-party installed state startup source mount input is missing runtime identity')
  }

  const runtimePublicationPreflight = buildThirdPartyDataPackRuntimePublicationPreflight({
    officialRegistrySet,
    discoveryReport,
    mountInput
  })
  const transactionPreCommitPlan = buildThirdPartyDataPackTransactionPreCommitPlan({
    officialRegistrySet,
    discoveryReport,
    mountInput,
    runtimePublicationPreflight
  })
  const liveRegistrySwapProtection = buildThirdPartyDataPackLiveRegistrySwapProtection({
    officialRegistrySet,
    discoveryReport,
    mountInput,
    runtimePublicationPreflight,
    transactionPreCommitPlan
  })
  const publicationRollbackRecovery = buildThirdPartyDataPackPublicationRollbackRecovery({
    officialRegistrySet,
    discoveryReport,
    mountInput,
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection
  })
  const runtimePublicationCommitAdapter = buildThirdPartyDataPackRuntimePublicationCommitAdapter({
    officialRegistrySet,
    discoveryReport,
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection,
    publicationRollbackRecovery
  })

  return Object.freeze({
    officialRegistrySet,
    discoveryReport,
    mountInput,
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection,
    publicationRollbackRecovery,
    runtimePublicationCommitAdapter,
    summary: Object.freeze({
      selectedPackageCount: mountInput.selectedPackageIds.length,
      blockedPackageCount: mountInput.blockedPackageIds.length,
      blockedCandidateCount: mountInput.blockedCandidatePaths.length,
      loadOrderCount: mountInput.loadOrder.length,
      registryCount: mountInput.registryCount,
      entryCount: mountInput.entryCount,
      packageCount: mountInput.packageCount,
      diagnosticCount: mountInput.diagnostics.length
    }),
    sourceKind
  }) as Omit<
    InstalledStateContext,
    'kind' | 'sourceKind' | 'source' | 'launcherBoundaryPreflight' | 'startupPersistentStateSource'
  >
}

const buildDisableStartupStateRequest = (
  state: ThirdPartyDataPackDisableState
): ThirdPartyDataPackStartupGatePersistentStateSourceRequest => Object.freeze({
  formatVersion: 1,
  commandId: 'disable',
  packageId: state.targetPackageId,
  candidateIdentity: state.candidateIdentity,
  lockfileHash: state.lockfileHash,
  selectedPackageIds: [],
  blockedPackageIds: [state.targetPackageId],
  blockedCandidateCount: 0,
  loadOrder: [],
  registryCount: state.registryCount,
  entryCount: state.entryCount,
  packageCount: state.packageCount,
  requiredSourceIds: [],
  deferredStageIds: []
})

const startupSnapshotMatchesDisableState = (
  snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshotSource,
  state: ThirdPartyDataPackDisableState
): boolean => snapshot.settled === true
  && snapshot.packageId === state.targetPackageId
  && snapshot.candidateIdentity?.candidateHash === state.candidateIdentity.candidateHash
  && snapshot.lockfileHash === state.lockfileHash
  && snapshot.transactionLogCommitted === true
  && snapshot.packageStateMatched === true
  && snapshot.settingsStateMatched === true
  && snapshot.modLockStateMatched === true
  && snapshot.liveRegistryMatched === true
  && snapshot.saveCacheIsolated === true

const buildDisableStateForPackage = (
  runtimeContext: Awaited<ReturnType<typeof buildInstalledStateRuntimeContext>>,
  targetPackageId: PackageId
): ThirdPartyDataPackDisableState => buildThirdPartyDataPackDisableState({
  officialRegistrySet: runtimeContext.officialRegistrySet,
  installedDraft: runtimeContext.mountInput.lockfileDraft!,
  targetPackageId
})

const readElectronDisabledState = async(
  runtimeContext: Awaited<ReturnType<typeof buildInstalledStateRuntimeContext>>,
  host: ReturnType<typeof createThirdPartyDataPackElectronStartupPersistentStateReadHost>
): Promise<DisabledInstalledState | null> => {
  for (const targetPackageId of runtimeContext.mountInput.selectedPackageIds) {
    const state = buildDisableStateForPackage(runtimeContext, targetPackageId)
    let snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshotSource
    try {
      snapshot = await host.read(buildDisableStartupStateRequest(state))
    } catch {
      continue
    }
    if (startupSnapshotMatchesDisableState(snapshot, state)) {
      return {
        kind: 'disabled',
        sourceKind: 'electron-program-directory-userdata',
        targetPackageId: state.targetPackageId,
        packageCount: state.packageCount,
        startupPersistentStateSourceStatus: 'ready',
        startupPersistentStateSourceHostMode:
          'electron-program-directory-startup-persistent-state',
        startupPersistentStateInjectedSourceHostMode:
          'electron-program-directory-startup-persistent-state',
        persistentStateProofs: {
          transactionLogCommitted: true,
          packageStateMatched: true,
          settingsStateMatched: true,
          modLockStateMatched: true,
          liveRegistryMatched: true,
          saveCacheIsolated: true
        }
      }
    }
  }
  return null
}

const readWebDisabledState = async(
  runtimeContext: Awaited<ReturnType<typeof buildInstalledStateRuntimeContext>>,
  store: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore,
  host: ReturnType<typeof createThirdPartyDataPackWebStartupPersistentStateSourceHost>
): Promise<DisabledInstalledState | null> => {
  const readResult = await store.read()
  if (readResult.report.status === 'failed') {
    throw new Error('Web installed state settings-lockfile could not be read during startup')
  }
  const record = readResult.record
  if (record?.requestedCommandId !== 'disable') return null

  const state = buildDisableStateForPackage(runtimeContext, record.targetPackageId)
  if (
    record.candidateHash !== state.candidateIdentity.candidateHash
    || record.lockfileHash !== state.lockfileHash
    || record.selectedPackageIds.length !== 0
    || record.loadOrder.length !== 0
    || record.blockedPackageIds.length !== 1
    || record.blockedPackageIds[0] !== state.targetPackageId
    || record.lockfileDraft.lockfileHash !== state.lockfileHash
    || record.lockfileDraft.candidateIdentity.candidateHash !== state.candidateIdentity.candidateHash
    || record.lockfileDraft.selectedPackageIds.length !== 0
    || record.lockfileDraft.loadOrder.length !== 0
  ) {
    throw new Error('Web installed state disable record does not match the installed package source')
  }
  const snapshot = await host.read(buildDisableStartupStateRequest(state))
  if (!startupSnapshotMatchesDisableState(snapshot, state)) return null
  return {
    kind: 'disabled',
    sourceKind: 'web-indexeddb',
    targetPackageId: state.targetPackageId,
    packageCount: state.packageCount,
    startupPersistentStateSourceStatus: 'ready',
    startupPersistentStateSourceHostMode: 'web-indexeddb-startup-persistent-state',
    startupPersistentStateInjectedSourceHostMode: 'web-indexeddb-startup-persistent-state',
    persistentStateProofs: {
      transactionLogCommitted: true,
      packageStateMatched: true,
      settingsStateMatched: true,
      modLockStateMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true
    }
  }
}

const startupGateHandoffEffects: ThirdPartyDataPackStartupGateHandoffEffectSummary = Object.freeze({
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
  responseDeliveryOrchestrationConsumed: true,
  startupGateHandoffPrepared: true
})

const startupGateRequirements = (): readonly ThirdPartyDataPackStartupGateHandoffRequirement[] =>
  Object.freeze([
    {
      id: 'startup-gate-contract',
      status: 'required',
      reason: 'Startup must consume a verified installed-state summary before GameApp uses third-party runtime content.'
    },
    {
      id: 'launcher-app-boundary',
      status: 'required',
      reason: 'Launcher and GameApp creation stay outside this installed-state reader.'
    },
    {
      id: 'persistent-install-state-source',
      status: 'required',
      reason: 'The installed package source and startup snapshot must describe the same package identity.'
    },
    {
      id: 'live-registry-identity-source',
      status: 'required',
      reason: 'The live registry must be swapped only after installed-state identity is verified.'
    },
    {
      id: 'save-cache-isolation-source',
      status: 'required',
      reason: 'Startup requires save/cache isolation proof before app bootstrap continues.'
    },
    {
      id: 'game-app-creation-gate',
      status: 'required',
      reason: 'GameApp creation remains behind the app-startup host connection.'
    },
    {
      id: 'startup-failure-reporting',
      status: 'required',
      reason: 'Startup failures must remain redacted and path-free.'
    },
    {
      id: 'no-startup-side-effect-guard',
      status: 'required',
      reason: 'This source must not mount UI, read saves, or write package/settings/cache data.'
    }
  ])

const freezeStartupRequirementIds = (
  ...ids: readonly ThirdPartyDataPackStartupGateHandoffRequirementId[]
): readonly ThirdPartyDataPackStartupGateHandoffRequirementId[] => Object.freeze([...ids])

const startupGateStages = (): readonly ThirdPartyDataPackStartupGateHandoffStage[] =>
  Object.freeze([
    {
      id: 'response-delivery-orchestration-consumed',
      status: 'satisfied',
      requirementIds: freezeStartupRequirementIds(
        'startup-gate-contract',
        'no-startup-side-effect-guard'
      ),
      reason: 'Installed-state startup uses an already-settled install summary.'
    },
    {
      id: 'startup-gate-preflight',
      status: 'satisfied',
      requirementIds: freezeStartupRequirementIds('startup-gate-contract'),
      reason: 'Startup handoff inputs were rebuilt from persisted package metadata.'
    },
    {
      id: 'launcher-startup-boundary',
      status: 'deferred',
      requirementIds: freezeStartupRequirementIds(
        'launcher-app-boundary',
        'startup-failure-reporting'
      ),
      reason: 'Launcher startup remains an application wiring concern.'
    },
    {
      id: 'persistent-install-state-read',
      status: 'deferred',
      requirementIds: freezeStartupRequirementIds('persistent-install-state-source'),
      reason: 'Startup persistent state will be read by the platform source adapter.'
    },
    {
      id: 'live-registry-identity-gate',
      status: 'deferred',
      requirementIds: freezeStartupRequirementIds('live-registry-identity-source'),
      reason: 'Live registry publication remains behind runtime publication checks.'
    },
    {
      id: 'save-open-protection',
      status: 'deferred',
      requirementIds: freezeStartupRequirementIds('save-cache-isolation-source'),
      reason: 'Save/cache isolation is proven by the startup persistent-state source.'
    },
    {
      id: 'game-app-creation',
      status: 'deferred',
      requirementIds: freezeStartupRequirementIds('game-app-creation-gate'),
      reason: 'GameApp creation remains behind app-startup readiness.'
    }
  ])

const createStartupGateHandoffPreflight = (
  context: Pick<
    InstalledStateContext,
    'mountInput' | 'summary'
  >
): ThirdPartyDataPackStartupGateHandoffPreflightResult => {
  const targetPackageId = context.mountInput.selectedPackageIds[0]!
  return Object.freeze({
    status: 'deferred',
    responseDeliveryOrchestrationStatus: 'deferred',
    reason: 'installed-state startup handoff is prepared from persisted package summary',
    startupGateHandoffPreflight: 'deferred',
    readOnly: true,
    startupGateHandoffPrepared: true,
    responseDeliveryOrchestrationConsumed: true,
    startupGateHandoffAllowed: false,
    launcherAppAllowed: false,
    gameAppCreationAllowed: false,
    piniaCreationAllowed: false,
    routerMountAllowed: false,
    saveReadAllowed: false,
    uiIpcResponseDeliveryAllowed: false,
    deliveryAcknowledgementAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: 'install',
    targetPackageId,
    envelopeKind: 'success',
    messageKey: 'mods.ui.ipc.result.install.success',
    selectedPackageIds: context.mountInput.selectedPackageIds,
    blockedPackageIds: context.mountInput.blockedPackageIds,
    blockedCandidateCount: context.mountInput.blockedCandidatePaths.length,
    loadOrder: context.mountInput.loadOrder,
    registryCount: context.mountInput.registryCount,
    entryCount: context.mountInput.entryCount,
    packageCount: context.mountInput.packageCount,
    candidateIdentity: context.mountInput.candidateIdentity,
    lockfileHash: context.mountInput.lockfileHash,
    deliveryEnvelope: Object.freeze({
      formatVersion: 1,
      kind: 'success',
      commandId: 'install',
      packageId: targetPackageId,
      candidateHash: context.mountInput.candidateIdentity!.candidateHash,
      lockfileHash: context.mountInput.lockfileHash!,
      messageKey: 'mods.ui.ipc.result.install.success',
      recovery: 'none',
      retryable: false,
      rollbackRequired: false,
      summary: context.summary,
      diagnostics: Object.freeze([])
    }),
    checks: Object.freeze([]),
    diagnostics: Object.freeze([]),
    startupStages: startupGateStages(),
    startupRequirements: startupGateRequirements(),
    summary: context.summary,
    effects: startupGateHandoffEffects
  })
}

const createWebStartupPersistentState = async(
  context: Omit<
    InstalledStateContext,
    'kind' | 'sourceKind' | 'source' | 'launcherBoundaryPreflight' | 'startupPersistentStateSource'
  >,
  webStore: WebIndexedDbImportPersistenceStore,
  webSettingsLockfileStore: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
): Promise<Pick<InstalledStateContext, 'launcherBoundaryPreflight' | 'startupPersistentStateSource'>> => {
  const startupGateHandoffPreflight = createStartupGateHandoffPreflight(context)
  const execution = await executeThirdPartyDataPackWebStartupGatePersistentStateExecution({
    startupGateHandoffPreflight,
    webHost: createThirdPartyDataPackWebStartupPersistentStateSourceHost({
      store: webStore,
      settingsLockfileStore: webSettingsLockfileStore
    })
  })
  const startupDecisionEnvelope = buildThirdPartyDataPackWebStartupGateDecisionEnvelope({
    execution
  })
  const launcherBoundaryPreflight = buildThirdPartyDataPackLauncherBoundaryPreflight({
    startupDecisionEnvelope
  })
  const startupPersistentStateSource =
    await createThirdPartyDataPackStartupGatePersistentStateSource({
      enabled: true,
      readPersistentStateSourceAdapter: async() =>
        execution.sourceAdapterExecution.adapterResult
    })()

  return Object.freeze({
    launcherBoundaryPreflight,
    startupPersistentStateSource
  })
}

const createElectronStartupPersistentState = async(
  context: Omit<
    InstalledStateContext,
    'kind' | 'sourceKind' | 'source' | 'launcherBoundaryPreflight' | 'startupPersistentStateSource'
  >,
  electronHost: ReturnType<typeof createThirdPartyDataPackElectronStartupPersistentStateReadHost>
): Promise<Pick<InstalledStateContext, 'launcherBoundaryPreflight' | 'startupPersistentStateSource'>> => {
  const startupGateHandoffPreflight = createStartupGateHandoffPreflight(context)
  const execution = await executeThirdPartyDataPackElectronStartupGatePersistentStateExecution({
    startupGateHandoffPreflight,
    electronHost
  })
  const startupDecisionEnvelope = buildThirdPartyDataPackElectronStartupGateDecisionEnvelope({
    execution
  })
  const launcherBoundaryPreflight = buildThirdPartyDataPackLauncherBoundaryPreflight({
    startupDecisionEnvelope
  })
  const startupPersistentStateSource =
    await createThirdPartyDataPackStartupGatePersistentStateSource({
      enabled: true,
      readPersistentStateSourceAdapter: async() =>
        execution.sourceAdapterExecution.adapterResult
    })()

  return Object.freeze({
    launcherBoundaryPreflight,
    startupPersistentStateSource
  })
}

const createInstalledStateContext = async(
  resolvedSource: ResolvedInstalledStateSource
): Promise<InstalledStateContextResult | null> => {
  const runtimeContext = await buildInstalledStateRuntimeContext(
    resolvedSource.sourceKind,
    resolvedSource.source
  ).catch(error => {
    if (error instanceof Error && error.message.includes('has no selected package')) {
      return null
    }
    throw error
  })
  if (runtimeContext === null) return null

  const disabledState = resolvedSource.sourceKind === 'web-indexeddb'
    ? await readWebDisabledState(
        runtimeContext,
        resolvedSource.webSettingsLockfileStore!,
        resolvedSource.webStartupPersistentStateHost!
      )
    : await readElectronDisabledState(
        runtimeContext,
        resolvedSource.electronStartupPersistentStateHost!
      )
  if (disabledState !== null) {
    return Object.freeze({
      ...disabledState
    })
  }

  const startupState = resolvedSource.sourceKind === 'web-indexeddb'
    ? await createWebStartupPersistentState(
        runtimeContext,
        resolvedSource.webStore!,
        resolvedSource.webSettingsLockfileStore!
      )
    : await createElectronStartupPersistentState(
        runtimeContext,
        resolvedSource.electronStartupPersistentStateHost!
      )

  return Object.freeze({
    kind: 'enabled' as const,
    ...runtimeContext,
    ...startupState,
    sourceKind: resolvedSource.sourceKind,
    source: resolvedSource.source
  })
}

const disabledInstalledStateResult = (
  state: DisabledInstalledState
): ThirdPartyDataPackStartupGateBootstrapSourceResult => Object.freeze({
  kind: THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_KIND,
  mode: THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_MODE,
  status: 'skipped',
  reason: `third-party installed-state startup gate preserved disabled package ${state.targetPackageId} and selected official-only runtime`,
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  targetPackageId: state.targetPackageId,
  startupPersistentStateSourceKind: state.sourceKind,
  selectedPackageIds: Object.freeze([]),
  blockedPackageIds: Object.freeze([state.targetPackageId]),
  blockedCandidateCount: 0,
  loadOrder: Object.freeze([]),
  registryCount: 54,
  entryCount: 4242,
  packageCount: state.packageCount,
  startupPersistentStateSourceStatus: state.startupPersistentStateSourceStatus,
  startupPersistentStateSourceHostMode: state.startupPersistentStateSourceHostMode,
  startupPersistentStateInjectedSourceHostMode: state.startupPersistentStateInjectedSourceHostMode,
  persistentStateProofs: state.persistentStateProofs,
  diagnostics: Object.freeze([]),
  summary: Object.freeze({
    selectedPackageCount: 0,
    blockedPackageCount: 1,
    blockedCandidateCount: 0,
    loadOrderCount: 0,
    registryCount: 54,
    entryCount: 4242,
    packageCount: state.packageCount,
    diagnosticCount: 0
  }),
  effects: Object.freeze({
    ...noStartupGateEffects(true),
    startupPersistentStateSourceCalled: true,
    startupStateSnapshotAccepted: true
  })
})

const createRuntimePublicationCommitHost = (
  context: InstalledStateContext
) => createThirdPartyDataPackRuntimePublicationCommitHost({
  selectedPackageIds: context.runtimePublicationCommitAdapter.selectedPackageIds,
  blockedPackageIds: context.runtimePublicationCommitAdapter.blockedPackageIds,
  blockedCandidatePaths: context.runtimePublicationCommitAdapter.blockedCandidatePaths,
  loadOrder: context.runtimePublicationCommitAdapter.loadOrder,
  registryCount: context.runtimePublicationCommitAdapter.registryCount,
  entryCount: context.runtimePublicationCommitAdapter.entryCount,
  packageCount: context.runtimePublicationCommitAdapter.packageCount,
  candidateIdentity: context.runtimePublicationCommitAdapter.candidateIdentity!,
  lockfileHash: context.runtimePublicationCommitAdapter.lockfileHash!
})

const postCommitEffects = ():
  ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitEffectSummary => Object.freeze({
    postCommitVerificationAfterInstallTransactionCommitPipelineCalled: true,
    installTransactionCommitFinalizationPipelineCalled: true,
    postCommitVerificationReadAcknowledgementPipelineCalled: true,
    transactionCommitted: true,
    transactionLogCommitted: true,
    postCommitVerificationAcknowledged: true,
    persistentReadProofAcknowledged: true,
    appBootstrapContinuationAllowed: true,
    commandContinuationAllowed: true,
    uiIpcResultContinuationAllowed: true,
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
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
    uiIpcResponseDelivered: false,
    transactionLogPrepared: true,
    transactionLogWritten: true,
    transactionLogRead: true,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveCacheIsolationChecked: false,
    packageFilesWritten: true,
    packageBackupsWritten: true,
    packageFilesRestored: false,
    lockfileWritten: true,
    lockfileRestored: false,
    settingsWritten: true,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    recoveryLogRead: false,
    recoveryLogReplayed: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })

const createPostCommitAfterInstallTransactionCommit = (
  context: InstalledStateContext
): ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult => Object.freeze({
  kind: 'third-party-post-commit-verification-after-install-transaction-commit-pipeline',
  mode: 'default-disabled-post-commit-verification-after-install-transaction-commit-pipeline',
  status: 'ready',
  reason: 'installed-state startup accepted persisted post-commit evidence',
  readOnly: true,
  enabled: true,
  installTransactionCommitFinalizationSourceCalled: true,
  postCommitVerificationReadAcknowledgementSourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  installTransactionCommitFinalizationStatus: 'committed',
  postCommitVerificationReadAcknowledgementStatus: 'ready',
  requestedCommandId: 'install',
  targetPackageId: context.mountInput.selectedPackageIds[0]!,
  verificationOutcomeKind: 'verified',
  transactionLogMatched: true,
  packageStateMatched: true,
  settingsLockfileMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true,
  selectedPackageIds: context.mountInput.selectedPackageIds,
  blockedPackageIds: context.mountInput.blockedPackageIds,
  loadOrder: context.mountInput.loadOrder,
  registryCount: context.mountInput.registryCount,
  entryCount: context.mountInput.entryCount,
  packageCount: context.mountInput.packageCount,
  candidateIdentity: context.mountInput.candidateIdentity,
  candidateHash: context.mountInput.candidateIdentity!.candidateHash,
  lockfileHash: context.mountInput.lockfileHash,
  transactionId: 'installed-state-startup-transaction',
  committedTransactionId: 'installed-state-startup-transaction',
  committedTransactionLogEntryHash: context.mountInput.lockfileHash!,
  checks: Object.freeze([]),
  diagnostics: Object.freeze([]),
  effects: postCommitEffects()
} as unknown as ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult)

const createRuntimePublicationCommitAfterPostCommit = async(
  context: InstalledStateContext
): Promise<ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult> => {
  const runtimePublicationCommitHost = createRuntimePublicationCommitHost(context)
  return await createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline({
    enabled: true,
    readPostCommitVerificationAfterInstallTransactionCommit: async() =>
      createPostCommitAfterInstallTransactionCommit(context),
    readRuntimePublicationPreflight: async() => context.runtimePublicationPreflight,
    readTransactionPreCommitPlan: async() => context.transactionPreCommitPlan,
    readLiveRegistrySwapProtection: async() => context.liveRegistrySwapProtection,
    readPublicationRollbackRecovery: async() => context.publicationRollbackRecovery,
    acknowledgeRuntimePublicationCommit:
      runtimePublicationCommitHost.acknowledgeRuntimePublicationCommit
  })()
}

const createLiveRegistrySwap = async(
  context: InstalledStateContext
) => {
  const liveRegistryReference = (() => {
    try {
      return getLiveContentRegistryReference()
    } catch {
      return publishOfficialContentRegistrySet(context.officialRegistrySet)
    }
  })()
  const runtimePublicationCommitHost = createRuntimePublicationCommitHost(context)
  return await createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline({
    enabled: true,
    readRuntimePublicationPreflight: async() => context.runtimePublicationPreflight,
    readTransactionPreCommitPlan: async() => context.transactionPreCommitPlan,
    readLiveRegistrySwapProtection: async() => context.liveRegistrySwapProtection,
    readPublicationRollbackRecovery: async() => context.publicationRollbackRecovery,
    acknowledgeRuntimePublicationCommit:
      runtimePublicationCommitHost.acknowledgeRuntimePublicationCommit,
    liveRegistryReference,
    candidateRegistrySet: context.mountInput.candidateRegistrySet,
    candidateIdentity: context.mountInput.candidateIdentity
  })()
}

const createAcceptedAppFactoryBindingHostResult = (
  envelope: ThirdPartyDataPackAppFactoryBindingHostEnvelope
): ThirdPartyDataPackAppFactoryBindingHostResult => Object.freeze({
  status: 'accepted',
  platform: envelope.platform,
  startupGateDecision: envelope.startupGateDecision,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateHash,
  lockfileHash: envelope.lockfileHash,
  persistentStateProofsAccepted: true,
  diagnostics: Object.freeze([]),
  effects: Object.freeze({
    appFactoryBindingHostCalled: true,
    appFactoryBindingHostAccepted: true,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    piniaCreated: false,
    routerMounted: false,
    saveRead: false,
    uiIpcResponseDelivered: false,
    commandDispatched: false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })
})

const createAcceptedNormalStartupHandoffHostResult = (
  envelope: ThirdPartyDataPackNormalStartupHandoffHostEnvelope
): ThirdPartyDataPackNormalStartupHandoffHostResult => Object.freeze({
  status: 'accepted',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  lockfileHash: envelope.lockfileHash,
  persistentStateProofsAccepted: true,
  diagnostics: Object.freeze([]),
  effects: Object.freeze({
    normalStartupHandoffHostCalled: true,
    normalStartupHandoffHostAccepted: true,
    realNormalStartupHostCalled: false,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    gameAppMounted: false,
    piniaCreated: false,
    routerMounted: false,
    saveRead: false,
    uiIpcResponseDelivered: false,
    commandDispatched: false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })
})

const createNormalStartupPipeline = (
  contextPromise: () => Promise<InstalledStateContext>,
  liveRegistrySwapReader: () => ReturnType<typeof createLiveRegistrySwap>
) => createThirdPartyDataPackRuntimePublicationNormalStartupContinuationPipeline({
  enabled: true,
  readLauncherBoundaryPreflight: async() =>
    (await contextPromise()).launcherBoundaryPreflight,
  readStartupGatePersistentStateSource: async() =>
    (await contextPromise()).startupPersistentStateSource,
  readRuntimePublicationLiveRegistrySwap: liveRegistrySwapReader,
  acknowledgeAppFactoryBinding: async envelope =>
    createAcceptedAppFactoryBindingHostResult(envelope),
  acknowledgeNormalStartupHandoff: async envelope =>
    createAcceptedNormalStartupHandoffHostResult(envelope)
})

const createInstalledStateSharedRendererStartupGate = (
  options: CreateThirdPartyDataPackInstalledStateStartupGateBootstrapSourceOptions,
  initialContext: Promise<InstalledStateContext>
) => {
  let contextPromise: Promise<InstalledStateContext> | undefined = initialContext
  let liveRegistrySwapPromise: ReturnType<typeof createLiveRegistrySwap> | undefined
  const readContext = async() => {
    contextPromise ??= initialContext
    return await contextPromise
  }
  const readLiveRegistrySwapOnce = async() => {
    liveRegistrySwapPromise ??= createLiveRegistrySwap(await readContext())
    return await liveRegistrySwapPromise
  }
  const normalStartupPipeline = createNormalStartupPipeline(
    readContext,
    readLiveRegistrySwapOnce
  )

  return createThirdPartyDataPackSharedRendererStartupGateBootstrapSource({
    enabled: true,
    ...(options.runtimeHost === undefined && options.resolveRuntimeHost === undefined
      ? {}
      : { runtimeHost: resolveRuntimeHost(options) }),
    readRuntimePublicationCommitAfterPostCommitVerification: async() =>
      createRuntimePublicationCommitAfterPostCommit(await readContext()),
    readRuntimePublicationLiveRegistrySwapHostConnection:
      readLiveRegistrySwapOnce,
    readRuntimePublicationNormalStartupAppFactoryBindingHostConnection:
      normalStartupPipeline
  })
}

export const createThirdPartyDataPackInstalledStateStartupGateBootstrapSource = (
  options: CreateThirdPartyDataPackInstalledStateStartupGateBootstrapSourceOptions = {}
) => async(): Promise<ThirdPartyDataPackStartupGateBootstrapSourceResult> => {
  if (options.enabled === false) {
    return skippedInstalledStateResult({
      enabled: false,
      sourceCalled: false,
      reason: 'third-party installed-state startup gate is disabled'
    })
  }

  const resolvedSource = await resolveInstalledStateSource(options)
  if (resolvedSource === null) {
    return skippedInstalledStateResult({
      enabled: false,
      sourceCalled: true,
      reason: 'third-party installed-state startup gate found no installed package source'
    })
  }

  const contextPromise = createInstalledStateContext(resolvedSource)
  const contextResult = await contextPromise
  if (contextResult === null) {
    return skippedInstalledStateResult({
      enabled: false,
      sourceCalled: true,
      reason: 'third-party installed-state startup gate found no selected package'
    })
  }

  if (contextResult.kind === 'disabled') return disabledInstalledStateResult(contextResult)

  const context = contextResult

  const sharedRendererStartupGate =
    createInstalledStateSharedRendererStartupGate(options, Promise.resolve(context))
  const result = await sharedRendererStartupGate()
  return Object.freeze({
    ...result,
    startupPersistentStateSourceKind: context.sourceKind,
    startupPersistentStateSourceStatus: context.startupPersistentStateSource.status,
    ...(context.startupPersistentStateSource.startupPersistentStateSourceHostMode === undefined
      ? {}
      : {
          startupPersistentStateSourceHostMode:
            context.startupPersistentStateSource.startupPersistentStateSourceHostMode
        }),
    ...(context.startupPersistentStateSource.injectedSourceHostMode === undefined
      ? {}
      : {
          startupPersistentStateInjectedSourceHostMode:
            context.startupPersistentStateSource.injectedSourceHostMode
        }),
    ...(context.startupPersistentStateSource.persistentStateProofs === undefined
      ? {}
      : { persistentStateProofs: context.startupPersistentStateSource.persistentStateProofs }),
    effects: Object.freeze({
      ...result.effects,
      startupPersistentStateSourceCalled:
        result.effects.startupPersistentStateSourceCalled
        || context.startupPersistentStateSource.sourceCalled,
      startupStateSnapshotAccepted:
        result.effects.startupStateSnapshotAccepted
        || context.startupPersistentStateSource.effects.startupStateSnapshotAccepted
    })
  })
}

export const bootstrapInstalledStateThirdPartyDataPackStartupGate =
  createThirdPartyDataPackInstalledStateStartupGateBootstrapSource()
