import { computed, ref, shallowRef } from 'vue'
import {
  CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  ContentPackageSourceError,
  createDiscoveryFileSystemFromContentPackageSource,
  type ContentPackageSource,
  type ContentPackageSourceDirectoryEntry,
  type ContentPackageSourceSafeReadPolicy
} from '@/domain/mods/contentPackageSource'
import type { RegistrySet } from '@/domain/mods/registry'
import {
  WEB_FILE_PICKER_IMPORT_ROOT_PATH,
  WEB_FILE_PICKER_IMPORT_SOURCE_ID,
  createWebFilePickerImportSource,
  type WebFilePickerImportFile
} from '@/domain/mods/webFilePickerImportSource'
import {
  createDefaultWebIndexedDbImportRecord,
  createWebFilePickerImportSourceFromIndexedDbRecord,
  persistWebFilePickerImportSource,
  type WebIndexedDbImportPersistenceStore,
  type WebIndexedDbImportRecord
} from '@/domain/mods/webIndexedDbImportPersistence'
import {
  createElectronReadonlyDirectorySource,
  type ElectronReadonlyDirectoryHost
} from '@/domain/mods/electronContentPackageSourceProbe'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackModManagementReadModel,
  type ThirdPartyDataPackModManagementReadModel
} from '@/domain/mods/thirdPartyDataPackModManagementReadModel'
import {
  buildThirdPartyDataPackModManagementUiIpcPreflight
} from '@/domain/mods/thirdPartyDataPackModManagementUiIpcPreflight'
import {
  buildThirdPartyDataPackRuntimePublicationCommitAdapter,
  type ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
import {
  getLiveContentRegistryReference
} from '@/domain/mods/liveContentRegistry'
import {
  createThirdPartyDataPackInMemoryLiveRegistryReference,
  createThirdPartyDataPackLiveRegistrySwapHost
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapHost'
import {
  buildThirdPartyDataPackTransactionCommandPreflight,
  type ThirdPartyDataPackTransactionCommandPreflightResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandPreflight'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDataPackDiscoveryReport
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import {
  buildThirdPartyDataPackMountInput,
  type ThirdPartyDataPackMountInputResult
} from '@/domain/mods/thirdPartyDataPackMountInput'
import type {
  ThirdPartyDataPackLockfileDraft
} from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import {
  sha256Utf8
} from '@/domain/mods/hash'
import type {
  ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile
} from '@/domain/mods/thirdPartyDataPackPackageFilePersistentWriteProbe'
import {
  buildThirdPartyDataPackLiveRegistrySwapProtection
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapProtection'
import {
  buildThirdPartyDataPackPublicationRollbackRecovery
} from '@/domain/mods/thirdPartyDataPackPublicationRollbackRecovery'
import type {
  ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline'
import {
  buildThirdPartyDataPackRuntimePublicationPreflight
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationPreflight'
import {
  createThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationHost,
  thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationIpcChannel,
  type ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope,
  type ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult
} from '@/domain/mods/thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationBridge'
import type {
  ThirdPartyDataPackInstallTransactionCommitFinalizationResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionCommitFinalizationPipeline'
import {
  createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline
} from '@/domain/mods/thirdPartyDataPackInstallTransactionCommitFinalizationPipeline'
import type {
  ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline'
import type {
  ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource'
import type {
  ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult
} from '@/domain/mods/thirdPartyDataPackOrdinaryInstallTransactionPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope,
  ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline'
import {
  createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitHost
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitHost'
import {
  createThirdPartyDataPackRuntimePublicationCommitSource
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitSource'
import {
  THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID
} from '@/domain/mods/thirdPartyDataPackInstalledStateStartupGateBootstrapSource'
import type {
  ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult
} from '@/domain/mods/thirdPartyDataPackNormalStartupHandoffExecutionSource'
import {
  buildThirdPartyDataPackRecoveryLogReplayRestoreAdapter,
  type ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
} from '@/domain/mods/thirdPartyDataPackRecoveryLogReplayRestoreAdapter'
import type {
  ThirdPartyDataPackModLockWriteProbeResult
} from '@/domain/mods/thirdPartyDataPackModLockWriteProbe'
import type {
  ThirdPartyDataPackTransactionLogWriteProbeResult
} from '@/domain/mods/thirdPartyDataPackTransactionLogWriteProbe'
import {
  buildThirdPartyDataPackInstallTransactionDispatchPlan,
  type ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionDispatchPlan'
import {
  buildThirdPartyDataPackTransactionPreCommitPlan
} from '@/domain/mods/thirdPartyDataPackTransactionPreCommitPlan'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorHost
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorAdapter'
import {
  ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorHostResult,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorSource'
import {
  createThirdPartyDataPackAtomicTransactionCommitExecutorPipeline
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorPipeline'
import {
  createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource,
  ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError,
  type ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
} from '@/domain/mods/thirdPartyDataPackInstallCommandPostCommitAcknowledgementSource'
import {
  createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline'
import {
  ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError,
  type ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationReadAcknowledgementSource'
import {
  ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError,
  type ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource'
import type {
  ThirdPartyDataPackSettingsLockfileCommitSourceResult,
  ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'
import {
  createThirdPartyDataPackWebPlatformWriterHostConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackWebPlatformWriterHostConnectionPipeline'
import {
  ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError,
  type ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope,
  type ThirdPartyDataPackWebPlatformWriterHostConnectionResult,
  type ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackWebPlatformWriterHostConnectionSource'
import {
  createWebIndexedDbSettingsLockfilePersistentWriterStore,
  type ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
} from '@/domain/mods/thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
import {
  createWebIndexedDbInstallTransactionLogPreparedStore,
  prepareThirdPartyDataPackWebInstallTransactionLogPrepared,
  verifyThirdPartyDataPackWebInstallTransactionLogPreparedReadBack,
  type ThirdPartyDataPackWebInstallTransactionLogPreparedStore
} from '@/domain/mods/thirdPartyDataPackWebInstallTransactionLogPreparedStorageHost'
import {
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID
} from '@/domain/mods/thirdPartyDataPackWebStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorAdapter'
import type {
  CreateThirdPartyDataPackPostCommitPersistentReadsSourceOptions
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentReadsSource'
import type {
  CreateThirdPartyDataPackPostCommitVerificationExecutorSourceOptions
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorSource'
import {
  buildThirdPartyDataPackPostCommitVerificationPlan,
  type ThirdPartyDataPackPostCommitVerificationPlanResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationPlan'
import {
  buildThirdPartyDataPackTransactionCommandDispatcherHandoff,
  type ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherHandoff'
import {
  createThirdPartyDataPackTransactionCommandDispatcherSource,
  ThirdPartyDataPackTransactionCommandDispatcherBlockedError,
  type ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope,
  type ThirdPartyDataPackTransactionCommandDispatcherHostEffectSummary,
  type ThirdPartyDataPackTransactionCommandDispatcherHostResult,
  type ThirdPartyDataPackTransactionCommandDispatcherSourceResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherSource'

type Awaitable<T> = T | Promise<T>

export type WebFilePickerInstallCommandDispatcherHost = (
  envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
) => Awaitable<ThirdPartyDataPackTransactionCommandDispatcherHostResult>

export type WebFilePickerInjectedAtomicTransactionCommitHost =
  ThirdPartyDataPackAtomicTransactionCommitExecutorHost

export type WebFilePickerAtomicTransactionCommitHost = (
  envelope: ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope
) => Awaitable<ThirdPartyDataPackAtomicTransactionCommitExecutorHostResult>

export type WebFilePickerPostCommitSettingsLockfileCommitSourceReader = () =>
  Awaitable<ThirdPartyDataPackSettingsLockfileCommitSourceResult>

export type WebFilePickerPostCommitVerificationExecutorAdapterReader = () =>
  Awaitable<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult>

export type WebFilePickerPostCommitPersistentStateReader =
  NonNullable<CreateThirdPartyDataPackPostCommitPersistentReadsSourceOptions['readPostCommitPersistentState']>

export type WebFilePickerPostCommitVerificationExecutor =
  NonNullable<CreateThirdPartyDataPackPostCommitVerificationExecutorSourceOptions['executePostCommitVerification']>

export type WebFilePickerPostCommitUiIpcDeliveryContinuationReader = () =>
  Awaitable<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult>

export type WebFilePickerRendererOrdinaryInstallTerminalContinuationHost = (
  envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
) => Awaitable<ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult>

export type WebFilePickerInstallCommandDispatcherHostKind =
  | 'injected'
  | 'renderer'
  | 'web'
  | 'local-fallback'

export type WebFilePickerStartupPersistentStateWriteStatus =
  | 'written'
  | 'skipped'
  | 'blocked'

export type WebFilePickerImportEntryStatus =
  | 'idle'
  | 'selecting'
  | 'importing'
  | 'restoring'
  | 'ready'
  | 'persisted'
  | 'restored'
  | 'cancelled'
  | 'failed'

export interface WebFilePickerImportEntryEffects {
  readonly sourceCreated: boolean
  readonly indexedDbImportPersisted: boolean
  readonly runtimeRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly modLockWritten: false
  readonly settingsWritten: false
  readonly saveWritten: false
  readonly officialCacheWritten: false
  readonly packageFilesWritten: false
  readonly transactionLogWritten: false
}

export interface WebFilePickerImportSelectionOptions {
  readonly directory: boolean
  readonly multiple: boolean
}

export type WebFilePickerImportSelector = (
  options: WebFilePickerImportSelectionOptions
) => Promise<readonly WebFilePickerImportFile[]>

export interface BrowserWebFilePickerSelectorOptions {
  readonly document?: Document
}

export interface UseWebFilePickerImportEntryOptions {
  readonly selectFiles?: WebFilePickerImportSelector
  readonly sourceId?: string
  readonly rootPath?: string
  readonly importId?: string | (() => string)
  readonly policy?: ContentPackageSourceSafeReadPolicy
  readonly persistenceStore?: WebIndexedDbImportPersistenceStore | null
  readonly dispatchTransactionCommand?: WebFilePickerInstallCommandDispatcherHost
  readonly executeInjectedAtomicTransactionCommit?: WebFilePickerInjectedAtomicTransactionCommitHost
  readonly executeAtomicTransactionCommit?: WebFilePickerAtomicTransactionCommitHost
  readonly readSettingsLockfileCommitSource?: WebFilePickerPostCommitSettingsLockfileCommitSourceReader
  readonly readPostCommitVerificationExecutorAdapter?:
    WebFilePickerPostCommitVerificationExecutorAdapterReader
  readonly readPostCommitPersistentState?: WebFilePickerPostCommitPersistentStateReader
  readonly executePostCommitVerification?: WebFilePickerPostCommitVerificationExecutor
  readonly readPostCommitUiIpcDeliveryContinuationSource?:
    WebFilePickerPostCommitUiIpcDeliveryContinuationReader
  readonly webSettingsLockfileStore?: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore | null
  readonly webInstallTransactionLogStore?: ThirdPartyDataPackWebInstallTransactionLogPreparedStore | null
  readonly startupPersistentStateStore?: WebIndexedDbImportPersistenceStore | null
  readonly mountedAppStartupHostEvidence?: WebFilePickerMountedAppStartupHostEvidence
}

export interface WebFilePickerImportEntryResult {
  readonly status: Exclude<WebFilePickerImportEntryStatus, 'idle' | 'selecting' | 'importing' | 'restoring'>
  readonly source: ContentPackageSource | null
  readonly record: WebIndexedDbImportRecord | null
  readonly fileCount: number
  readonly effects: WebFilePickerImportEntryEffects
  readonly error: ContentPackageSourceError | null
}

export interface WebFilePickerInstallCommandPreflightOptions {
  readonly packageId: PackageId
  readonly confirmed: boolean
  readonly readModel: ThirdPartyDataPackModManagementReadModel
  readonly runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
}

export interface WebFilePickerInstallCommandPreflightResult {
  readonly status: ThirdPartyDataPackTransactionCommandPreflightResult['status']
  readonly reason: string
  readonly sourceReady: boolean
  readonly fileCount: number
  readonly sourceKind: ContentPackageSource['identity']['kind'] | null
  readonly sourceId: string | null
  readonly rootPath: string | null
  readonly preflight: ThirdPartyDataPackTransactionCommandPreflightResult | null
  readonly effects: WebFilePickerImportEntryEffects
}

export type WebFilePickerSourceInstallCommandDiscoveryStatus =
  | ThirdPartyDataPackDiscoveryReport['status']
  | 'not-run'
  | 'failed'

export interface WebFilePickerSourceInstallCommandPreflightOptions {
  readonly packageId?: PackageId
  readonly confirmed: boolean
  readonly officialRegistrySet: RegistrySet
}

export interface WebFilePickerSourceInstallCommandDispatchOptions
  extends WebFilePickerSourceInstallCommandPreflightOptions {
  readonly dispatchTransactionCommand?: WebFilePickerInstallCommandDispatcherHost
  readonly executeInjectedAtomicTransactionCommit?: WebFilePickerInjectedAtomicTransactionCommitHost
  readonly executeAtomicTransactionCommit?: WebFilePickerAtomicTransactionCommitHost
  readonly readSettingsLockfileCommitSource?: WebFilePickerPostCommitSettingsLockfileCommitSourceReader
  readonly readPostCommitVerificationExecutorAdapter?:
    WebFilePickerPostCommitVerificationExecutorAdapterReader
  readonly readPostCommitPersistentState?: WebFilePickerPostCommitPersistentStateReader
  readonly executePostCommitVerification?: WebFilePickerPostCommitVerificationExecutor
  readonly readPostCommitUiIpcDeliveryContinuationSource?:
    WebFilePickerPostCommitUiIpcDeliveryContinuationReader
  readonly webSettingsLockfileStore?: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore | null
  readonly webInstallTransactionLogStore?: ThirdPartyDataPackWebInstallTransactionLogPreparedStore | null
  readonly startupPersistentStateStore?: WebIndexedDbImportPersistenceStore | null
  readonly mountedAppStartupHostEvidence?: WebFilePickerMountedAppStartupHostEvidence
}

export interface WebFilePickerMountedAppStartupHostEvidence {
  readonly realAppStartupHostCalled: true
  readonly gameAppCreated: true
  readonly piniaCreated: true
  readonly routerMounted: true
}

export interface WebFilePickerSourceInstallCommandPreflightResult
  extends WebFilePickerInstallCommandPreflightResult {
  readonly discoveryStatus: WebFilePickerSourceInstallCommandDiscoveryStatus
  readonly readModelStatus: ThirdPartyDataPackModManagementReadModel['status'] | null
  readonly runtimePublicationCommitAdapterStatus:
    ThirdPartyDataPackRuntimePublicationCommitAdapterResult['status'] | null
  readonly selectedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
}

export interface WebFilePickerSourceInstallCommandDispatchResult
  extends WebFilePickerSourceInstallCommandPreflightResult {
  readonly installTransactionDispatchPlanStatus:
    ThirdPartyDataPackInstallTransactionDispatchPlanResult['status'] | null
  readonly postCommitVerificationPlanStatus:
    ThirdPartyDataPackPostCommitVerificationPlanResult['status'] | null
  readonly transactionCommandDispatcherHandoffStatus:
    ThirdPartyDataPackTransactionCommandDispatcherHandoffResult['status'] | null
  readonly transactionCommandDispatcherSourceStatus:
    ThirdPartyDataPackTransactionCommandDispatcherSourceResult['status'] | null
  readonly atomicTransactionCommitExecutorSourceStatus:
    ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult['status'] | null
  readonly postCommitVerificationReadAcknowledgementSourceStatus:
    ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult['status'] | null
  readonly installCommandPostCommitAcknowledgementStatus:
    ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult['status'] | null
  readonly postCommitVerificationExecutorHostMode:
    ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult['postCommitVerificationExecutorHostMode'] | null
  readonly postCommitUiIpcDeliveryContinuationStatus:
    ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult['status'] | null
  readonly installTransactionDispatchPlan: ThirdPartyDataPackInstallTransactionDispatchPlanResult | null
  readonly postCommitVerificationPlan: ThirdPartyDataPackPostCommitVerificationPlanResult | null
  readonly transactionCommandDispatcherHandoff: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult | null
  readonly transactionCommandDispatcherSource: ThirdPartyDataPackTransactionCommandDispatcherSourceResult | null
  readonly atomicTransactionCommitExecutorSource:
    ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult | null
  readonly postCommitVerificationReadAcknowledgementSource:
    ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult | null
  readonly installCommandPostCommitAcknowledgement:
    ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult | null
  readonly postCommitUiIpcDeliveryContinuation:
    ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult | null
  readonly ordinaryInstallTransactionTerminalConnection:
    ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult | null
  readonly ordinaryInstallTransactionTerminalConnectionStatus:
    ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult['status'] | null
  readonly installTransactionLogPrepared:
    ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult | null
  readonly installTransactionLogPreparedStatus:
    ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult['status'] | null
  readonly installTransactionLogPreparedStorageKind:
    ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult['storageKind'] | null
  readonly installTransactionLogPreparedPersistentReadVerification:
    ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult | null
  readonly installTransactionLogPreparedPersistentReadVerificationStatus:
    ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult['status'] | null
  readonly installTransactionCommitFinalization:
    ThirdPartyDataPackInstallTransactionCommitFinalizationResult | null
  readonly installTransactionCommitFinalizationStatus:
    ThirdPartyDataPackInstallTransactionCommitFinalizationResult['status'] | null
  readonly runtimePublicationCommitAfterPostCommitVerification:
    ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult | null
  readonly runtimePublicationCommitAfterPostCommitVerificationStatus:
    ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult['status'] | null
  readonly runtimePublicationCommitLiveRegistrySwapHostConnection:
    ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult | null
  readonly runtimePublicationCommitLiveRegistrySwapHostConnectionStatus:
    ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult['status'] | null
  readonly runtimePublicationCommitAppStartupReadiness:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult | null
  readonly runtimePublicationCommitAppStartupReadinessStatus:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult['status'] | null
  readonly runtimePublicationCommitAppStartupHostConnection:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult | null
  readonly runtimePublicationCommitAppStartupHostConnectionStatus:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult['status'] | null
  readonly webPlatformWriterHostConnection:
    ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult | null
  readonly webPlatformWriterHostConnectionStatus:
    ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult['status'] | null
  readonly webStartupPersistentStateWriteStatus: WebFilePickerStartupPersistentStateWriteStatus | null
  readonly electronStartupPersistentStateWriteStatus: WebFilePickerStartupPersistentStateWriteStatus | null
  readonly transactionCommandDispatcherHostKind: WebFilePickerInstallCommandDispatcherHostKind | null
  readonly commandDispatched: boolean
  readonly transactionCommitted: boolean
  readonly writeExecuted: boolean
  readonly startupPersistentStateWritten: boolean
  readonly rendererLiveRegistrySwapApplied: boolean
  readonly runtimeEnablementAllowed: boolean
  readonly uiIpcResponseDelivered: boolean
}

export const WEB_FILE_PICKER_IMPORT_ENTRY_DEFAULT_IMPORT_ID =
  THIRD_PARTY_DATA_PACK_WEB_INSTALLED_STATE_IMPORT_ID

const createEffects = (
  sourceCreated: boolean,
  indexedDbImportPersisted: boolean
): WebFilePickerImportEntryEffects => Object.freeze({
  sourceCreated,
  indexedDbImportPersisted,
  runtimeRegistryPublished: false,
  liveRegistryMutated: false,
  modLockWritten: false,
  settingsWritten: false,
  saveWritten: false,
  officialCacheWritten: false,
  packageFilesWritten: false,
  transactionLogWritten: false
})

const emptyEffects = createEffects(false, false)

const noModLockWriteProbeEffects = (): ThirdPartyDataPackModLockWriteProbeResult['effects'] => Object.freeze({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  electronIpcExposed: false,
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

const noTransactionLogWriteProbeEffects = (): ThirdPartyDataPackTransactionLogWriteProbeResult['effects'] =>
  Object.freeze({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    liveRegistrySwapped: false,
    previousRegistryRestored: false,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: false,
    electronIpcExposed: false,
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

const pathFreeDispatcherHostEffects = (): ThirdPartyDataPackTransactionCommandDispatcherHostEffectSummary =>
  Object.freeze({
    commandDispatcherCalled: true,
    commandDispatched: true,
    transactionCommitted: false,
    postCommitVerificationExecuted: false,
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

const dispatchPathFreeInstallCommand: WebFilePickerInstallCommandDispatcherHost = async envelope => Object.freeze({
  status: 'dispatched' as const,
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  diagnostics: Object.freeze([]),
  effects: pathFreeDispatcherHostEffects()
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

const createRendererInstallCommandDispatcherHost = (
  runtimeHost: unknown
): WebFilePickerInstallCommandDispatcherHost | undefined => {
  const electronApi = readOwnDataField(runtimeHost, 'electronAPI')
  const dispatchThirdPartyDataPackInstallCommand = readOwnDataField(
    electronApi,
    'dispatchThirdPartyDataPackInstallCommand'
  )
  if (typeof dispatchThirdPartyDataPackInstallCommand !== 'function') return undefined

  return async envelope => await dispatchThirdPartyDataPackInstallCommand(
    envelope
  ) as ThirdPartyDataPackTransactionCommandDispatcherHostResult
}

const createRendererOrdinaryInstallTerminalContinuationHost = (
  runtimeHost: unknown
): WebFilePickerRendererOrdinaryInstallTerminalContinuationHost | undefined => {
  const electronApi = readOwnDataField(runtimeHost, 'electronAPI')
  const continueOrdinaryInstallTerminal = readOwnDataField(
    electronApi,
    'continueThirdPartyDataPackOrdinaryInstallTerminal'
  )
  if (typeof continueOrdinaryInstallTerminal !== 'function') return undefined

  const host = createThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationHost({
    invoke: async(channel, envelope) => {
      if (channel !== thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationIpcChannel) return undefined
      return await continueOrdinaryInstallTerminal(envelope)
    }
  })
  return async envelope => await host.continueOrdinaryInstallTerminal(envelope)
}

const maybeRendererMethod = (
  value: unknown,
  fieldName: string
): ((input: never) => Awaitable<unknown>) | undefined => {
  const method = readOwnDataField(value, fieldName)
  return typeof method === 'function'
    ? method as (input: never) => Awaitable<unknown>
    : undefined
}

const unwrapRendererElectronReadonlyDirectorySourceResult = async<T>(
  valuePromise: Awaitable<unknown>
): Promise<T> => {
  const value = await valuePromise
  if (value !== null && typeof value === 'object' && readOwnDataField(value, 'ok') === true) {
    return readOwnDataField(value, 'value') as T
  }
  throw new Error('Electron read-only directory source operation failed')
}

const createRendererElectronReadonlyDirectorySource = (
  runtimeHost: unknown
): ContentPackageSource | null => {
  const electronApi = readOwnDataField(runtimeHost, 'electronAPI')
  const electronReadonlyDirectorySource = readOwnDataField(electronApi, 'electronReadonlyDirectorySource')
  const getEntry = maybeRendererMethod(electronReadonlyDirectorySource, 'getEntry')
  const readDirectory = maybeRendererMethod(electronReadonlyDirectorySource, 'readDirectory')
  const readTextFile = maybeRendererMethod(electronReadonlyDirectorySource, 'readTextFile')
  if (getEntry === undefined || readDirectory === undefined || readTextFile === undefined) return null

  return createElectronReadonlyDirectorySource({
    host: {
      getEntry: sourcePath =>
        unwrapRendererElectronReadonlyDirectorySourceResult<ContentPackageSourceDirectoryEntry | null>(
          getEntry.call(electronReadonlyDirectorySource, sourcePath as never)
        ),
      readDirectory: sourcePath =>
        unwrapRendererElectronReadonlyDirectorySourceResult<readonly ContentPackageSourceDirectoryEntry[]>(
          readDirectory.call(electronReadonlyDirectorySource, sourcePath as never)
        ),
      readTextFile: sourcePath =>
        unwrapRendererElectronReadonlyDirectorySourceResult<string>(
          readTextFile.call(electronReadonlyDirectorySource, sourcePath as never)
        )
    } satisfies ElectronReadonlyDirectoryHost
  })
}

const resolveRendererRuntimeHost = (): unknown =>
  typeof window === 'undefined' ? undefined : window

const readPackageFilePayloadFromSource = async(
  source: ContentPackageSource,
  draft: ThirdPartyDataPackLockfileDraft,
  targetPackageId: PackageId
): Promise<readonly ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile[]> => {
  const packageDraft = draft.packages.find(currentPackage => currentPackage.packageId === targetPackageId)
  if (packageDraft === undefined) return Object.freeze([])

  const manifestContents = await source.readTextFile(packageDraft.source.manifestPath)
  const files: ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile[] = [{
    path: 'manifest.json',
    contents: manifestContents,
    sha256: sha256Utf8(manifestContents)
  }]

  for (const contentFile of packageDraft.contentFiles) {
    const sourcePath = `${packageDraft.source.candidatePath}/${contentFile.path}`
    const contents = await source.readTextFile(sourcePath)
    files.push({
      path: contentFile.path,
      contents,
      sha256: sha256Utf8(contents)
    })
  }

  return Object.freeze(files)
}

const webSettingsLockfileCommitSourceEffects =
  (): ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary => Object.freeze({
    settingsLockfileCommitSourceCalled: true,
    packageFileStagingSourceCalled: true,
    injectedSettingsLockfileCommitHostCalled: true,
    settingsLockfileCommitHostCalled: true,
    settingsLockfileCommitHostAccepted: true,
    realSettingsLockfileCommitHostCalled: false,
    appBootstrapContinuationAllowed: true,
    commandContinuationAllowed: true,
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

const createWebSettingsLockfileCommitSource = (
  mountInput: ThirdPartyDataPackMountInputResult,
  targetPackageId: PackageId
): ThirdPartyDataPackSettingsLockfileCommitSourceResult => Object.freeze({
  kind: 'third-party-settings-lockfile-commit-source',
  mode: 'default-disabled-settings-lockfile-commit-source',
  status: 'accepted',
  reason: 'Web visible import accepted settings-lockfile commit source for IndexedDB writer handoff',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  packageFileStagingSourceStatus: 'accepted',
  packageFileStagingHostStatus: 'accepted',
  settingsLockfileCommitHostStatus: 'accepted',
  requestedCommandId: 'install',
  targetPackageId,
  selectedPackageIds: mountInput.selectedPackageIds,
  blockedPackageIds: mountInput.blockedPackageIds,
  blockedCandidatePaths: mountInput.blockedCandidatePaths,
  loadOrder: mountInput.loadOrder,
  registryCount: mountInput.registryCount,
  entryCount: mountInput.entryCount,
  packageCount: mountInput.packageCount,
  candidateIdentity: mountInput.candidateIdentity,
  lockfileHash: mountInput.lockfileHash,
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written' as const,
    transactionLogWriteProbeStatus: 'written' as const,
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  diagnostics: Object.freeze([]),
  effects: webSettingsLockfileCommitSourceEffects()
})

const webPlatformWriterHostConnectionEffects = () => Object.freeze({
  webPlatformWriterHostCalled: true,
  webPlatformWriterHostAccepted: true,
  webPlatformWriterConnected: true,
  webIndexedDbStorageResolved: true,
  webStorageEnvelopeExposed: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
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

const acceptWebPlatformWriterHostConnection = async(
  envelope: ThirdPartyDataPackWebPlatformWriterHostConnectionEnvelope
): Promise<ThirdPartyDataPackWebPlatformWriterHostConnectionResult> => Object.freeze({
  status: 'accepted',
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
  transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
  modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
  transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
  webRequirementIds: envelope.webRequirementIds,
  diagnostics: Object.freeze([]),
  effects: webPlatformWriterHostConnectionEffects()
})

const createDefaultWebSettingsLockfileStore =
  (): ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore | null => {
    try {
      return createWebIndexedDbSettingsLockfilePersistentWriterStore()
    } catch {
      return null
    }
  }

const resolveWebSettingsLockfileStore = (
  dispatchStore: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore | null | undefined,
  entryStore: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore | null | undefined
): ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore | null => {
  if (dispatchStore !== undefined) return dispatchStore
  if (entryStore !== undefined) return entryStore
  return createDefaultWebSettingsLockfileStore()
}

const createDefaultWebInstallTransactionLogStore =
  (): ThirdPartyDataPackWebInstallTransactionLogPreparedStore | null => {
    try {
      return createWebIndexedDbInstallTransactionLogPreparedStore()
    } catch {
      return null
    }
  }

const resolveWebInstallTransactionLogStore = (
  dispatchStore: ThirdPartyDataPackWebInstallTransactionLogPreparedStore | null | undefined,
  entryStore: ThirdPartyDataPackWebInstallTransactionLogPreparedStore | null | undefined
): ThirdPartyDataPackWebInstallTransactionLogPreparedStore | null => {
  if (dispatchStore !== undefined) return dispatchStore
  if (entryStore !== undefined) return entryStore
  return createDefaultWebInstallTransactionLogStore()
}

const connectWebSettingsLockfileWriter = async(options: {
  readonly store: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
  readonly mountInput: ThirdPartyDataPackMountInputResult
  readonly targetPackageId: PackageId
}): Promise<ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult> => {
  const pipeline = createThirdPartyDataPackWebPlatformWriterHostConnectionPipeline({
    enabled: true,
    readSettingsLockfileCommitSource: async() =>
      createWebSettingsLockfileCommitSource(options.mountInput, options.targetPackageId),
    webSettingsLockfileStore: options.store,
    readLockfileDraft: async() => options.mountInput.lockfileDraft as ThirdPartyDataPackLockfileDraft,
    connectWebPlatformWriterHost: acceptWebPlatformWriterHostConnection
  })
  return await pipeline()
}

const resolveWebStartupPersistentStateStore = (
  dispatchStore: WebIndexedDbImportPersistenceStore | null | undefined,
  entryStore: WebIndexedDbImportPersistenceStore | null | undefined,
  packagePersistenceStore: WebIndexedDbImportPersistenceStore | null | undefined
): WebIndexedDbImportPersistenceStore | null => {
  if (dispatchStore !== undefined) return dispatchStore
  if (entryStore !== undefined) return entryStore
  return packagePersistenceStore ?? null
}

const liveRegistrySwapProtectionRequirementIds = [
  'single-assignment-live-registry-reference',
  'previous-registry-identity-retention',
  'candidate-artifact-visibility-barrier',
  'post-swap-verification',
  'rollback-restore-diagnostics'
] as const

const packageIdListsEqual = (
  left: readonly PackageId[],
  right: readonly PackageId[]
): boolean => left.length === right.length && left.every((value, index) => value === right[index])

const candidateIdentityMatches = (
  left: ThirdPartyDataPackMountInputResult['candidateIdentity'],
  right: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult['candidateIdentity']
): boolean => left !== undefined
  && right !== undefined
  && left.formatVersion === right.formatVersion
  && left.contentHash === right.contentHash
  && left.snapshotHash === right.snapshotHash
  && left.candidateHash === right.candidateHash

type SharedRendererRuntimePublicationPlatform = 'electron' | 'web'

type SharedRendererRuntimePublicationContinuationSummary =
  | ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
  | ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult
  | ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
  | ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult

const runtimePublicationSummaryMatchesRendererCandidate = (options: {
  readonly targetPackageId: PackageId
  readonly mountInput: ThirdPartyDataPackMountInputResult
  readonly runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
  readonly summary: SharedRendererRuntimePublicationContinuationSummary | null
}): boolean => {
  const summary = options.summary
  return summary !== null
    && summary.requestedCommandId === 'install'
    && summary.targetPackageId === options.targetPackageId
    && packageIdListsEqual(summary.selectedPackageIds, options.mountInput.selectedPackageIds)
    && packageIdListsEqual(summary.blockedPackageIds, options.mountInput.blockedPackageIds)
    && packageIdListsEqual(summary.loadOrder, options.mountInput.loadOrder)
    && summary.registryCount === options.mountInput.registryCount
    && summary.entryCount === options.mountInput.entryCount
    && summary.packageCount === options.mountInput.packageCount
    && candidateIdentityMatches(options.mountInput.candidateIdentity, summary.candidateIdentity)
    && summary.candidateHash === options.mountInput.candidateIdentity?.candidateHash
    && summary.lockfileHash === options.mountInput.lockfileHash
    && candidateIdentityMatches(
      options.runtimePublicationCommitAdapter.candidateIdentity,
      summary.candidateIdentity
    )
    && summary.lockfileHash === options.runtimePublicationCommitAdapter.lockfileHash
}

const runtimeContinuationMatchesRendererCandidate = (options: {
  readonly platform: SharedRendererRuntimePublicationPlatform
  readonly targetPackageId: PackageId
  readonly mountInput: ThirdPartyDataPackMountInputResult
  readonly runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
  readonly runtimePublicationCommitAfterPostCommitVerification:
    ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult | null
  readonly runtimePublicationCommitLiveRegistrySwapHostConnection:
    ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult | null
  readonly runtimePublicationCommitAppStartupReadiness:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult | null
  readonly runtimePublicationCommitAppStartupHostConnection:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult | null
}): boolean => {
  const commit = options.runtimePublicationCommitAfterPostCommitVerification
  const liveSwap = options.runtimePublicationCommitLiveRegistrySwapHostConnection
  const readiness = options.runtimePublicationCommitAppStartupReadiness
  const appStartup = options.runtimePublicationCommitAppStartupHostConnection
  return commit?.status === 'accepted'
    && liveSwap?.status === 'swapped'
    && readiness?.status === 'ready'
    && appStartup?.status === 'accepted'
    && appStartup.platform === options.platform
    && runtimePublicationSummaryMatchesRendererCandidate({
      targetPackageId: options.targetPackageId,
      mountInput: options.mountInput,
      runtimePublicationCommitAdapter: options.runtimePublicationCommitAdapter,
      summary: commit
    })
    && runtimePublicationSummaryMatchesRendererCandidate({
      targetPackageId: options.targetPackageId,
      mountInput: options.mountInput,
      runtimePublicationCommitAdapter: options.runtimePublicationCommitAdapter,
      summary: liveSwap
    })
    && runtimePublicationSummaryMatchesRendererCandidate({
      targetPackageId: options.targetPackageId,
      mountInput: options.mountInput,
      runtimePublicationCommitAdapter: options.runtimePublicationCommitAdapter,
      summary: readiness
    })
    && runtimePublicationSummaryMatchesRendererCandidate({
      targetPackageId: options.targetPackageId,
      mountInput: options.mountInput,
      runtimePublicationCommitAdapter: options.runtimePublicationCommitAdapter,
      summary: appStartup
    })
}

const ordinaryInstallTransactionTerminalSucceeded = (
  terminal: ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult | null
): boolean => terminal?.status === 'ready'
  && terminal.outcomeKind === 'success'
  && terminal.effects?.successOutcomeAccepted === true

const applySharedRendererLiveRegistrySwapFromVerifiedContinuation = async(options: {
  readonly platform: SharedRendererRuntimePublicationPlatform
  readonly targetPackageId: PackageId
  readonly mountInput: ThirdPartyDataPackMountInputResult
  readonly runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
  readonly runtimePublicationCommitAfterPostCommitVerification:
    ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult | null
  readonly runtimePublicationCommitLiveRegistrySwapHostConnection:
    ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult | null
  readonly runtimePublicationCommitAppStartupReadiness:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult | null
  readonly runtimePublicationCommitAppStartupHostConnection:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult | null
}): Promise<boolean> => {
  const liveSwap = options.runtimePublicationCommitLiveRegistrySwapHostConnection
  if (
    options.mountInput.candidateRegistrySet === undefined
    || options.mountInput.candidateIdentity === undefined
    || options.mountInput.lockfileHash === undefined
    || liveSwap === null
    || !runtimeContinuationMatchesRendererCandidate(options)
  ) {
    return false
  }

  const host = createThirdPartyDataPackLiveRegistrySwapHost({
    liveRegistryReference: getLiveContentRegistryReference(),
    candidateRegistrySet: options.mountInput.candidateRegistrySet,
    candidateIdentity: options.mountInput.candidateIdentity
  })
  const result = await host.executeLiveRegistrySwap({
    requestedCommandId: 'install',
    targetPackageId: options.targetPackageId,
    selectedPackageIds: liveSwap.selectedPackageIds,
    blockedPackageIds: liveSwap.blockedPackageIds,
    blockedCandidatePaths: options.mountInput.blockedCandidatePaths,
    loadOrder: liveSwap.loadOrder,
    registryCount: liveSwap.registryCount,
    entryCount: liveSwap.entryCount,
    packageCount: liveSwap.packageCount,
    officialIdentity: options.runtimePublicationCommitAdapter.officialIdentity,
    candidateIdentity: options.mountInput.candidateIdentity,
    lockfileHash: options.mountInput.lockfileHash,
    liveRegistrySwap: 'deferred',
    requiredProtectionIds: liveRegistrySwapProtectionRequirementIds
  })
  return result.status === 'swapped'
}

const createWebContinuationSummary = (source: {
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths?: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
}) => Object.freeze({
  selectedPackageCount: source.selectedPackageIds.length,
  blockedPackageCount: source.blockedPackageIds.length,
  blockedCandidateCount: source.blockedCandidatePaths?.length ?? 0,
  loadOrderCount: source.loadOrder.length,
  registryCount: source.registryCount,
  entryCount: source.entryCount,
  packageCount: source.packageCount,
  diagnosticCount: 0
})

const webPathFreePostCommitContinuationEffects = () => Object.freeze({
  postCommitUiIpcDeliveryContinuationSourceCalled: true,
  postCommitPersistentReadWriteConnectionSourceCalled: true,
  uiIpcResponseDeliveryAcknowledgementConvergenceSourceCalled: true,
  postCommitPersistentReadWriteConnectionAcknowledged: true,
  uiIpcDeliveryAcknowledgementConverged: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  startupGateContinuationAllowed: true,
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
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
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
  successEnvelopeDelivered: true,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
  uiIpcResponseDelivered: true,
  packageFilesWritten: true,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: true,
  lockfileRestored: false,
  settingsWritten: true,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const createWebInstallCommandPostCommitAcknowledgement = (
  transactionCommandDispatcherSource: ThirdPartyDataPackTransactionCommandDispatcherSourceResult,
  mountInput: ThirdPartyDataPackMountInputResult,
  targetPackageId: PackageId
) => Object.freeze({
  kind: 'third-party-install-command-post-commit-acknowledgement-source',
  mode: 'default-disabled-install-command-post-commit-acknowledgement-source',
  status: 'ready',
  reason: 'Web visible import accepted persisted IndexedDB package and settings evidence for ordinary continuation',
  readOnly: true,
  enabled: true,
  transactionCommandDispatcherSourceCalled: true,
  atomicTransactionCommitExecutorSourceCalled: false,
  postCommitVerificationReadAcknowledgementSourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  transactionCommandDispatcherSourceStatus: transactionCommandDispatcherSource.status,
  postCommitVerificationReadAcknowledgementSourceStatus: 'ready',
  requestedCommandId: 'install',
  targetPackageId,
  verificationOutcomeKind: 'verified',
  selectedPackageIds: mountInput.selectedPackageIds,
  blockedPackageIds: mountInput.blockedPackageIds,
  blockedCandidateCount: mountInput.blockedCandidatePaths.length,
  blockedCandidatePaths: mountInput.blockedCandidatePaths,
  loadOrder: mountInput.loadOrder,
  registryCount: mountInput.registryCount,
  entryCount: mountInput.entryCount,
  packageCount: mountInput.packageCount,
  candidateIdentity: mountInput.candidateIdentity,
  lockfileHash: mountInput.lockfileHash,
  checks: Object.freeze([]),
  diagnostics: Object.freeze([]),
  effects: Object.freeze({
    installCommandPostCommitAcknowledgementSourceCalled: true,
    transactionCommandDispatcherSourceCalled: true,
    atomicTransactionCommitExecutorSourceCalled: false,
    postCommitVerificationReadAcknowledgementSourceCalled: true,
    commandDispatched: true,
    atomicCommitExecutorAcknowledged: false,
    injectedCommitHostCalled: false,
    realAtomicCommitExecutorCalled: false,
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
}) as ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult

const webInstallTransactionCommitConnectionEffects =
  (): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult['effects'] =>
    Object.freeze({
      installPersistentStagingSettingsLockfileTransactionCommitConnectionSourceCalled: true,
      installPersistentStagingSettingsLockfileLifecyclePipelineCalled: true,
      installTransactionCommitConnectionHostCalled: true,
      installTransactionCommitConnectionHostAccepted: true,
      transactionCommitConnectionAcknowledged: true,
      packageFilePersistentWriteAcknowledged: true,
      installCommandLifecycleAcknowledged: true,
      settingsLockfilePersistentWriterAcknowledged: true,
      commandDispatched: true,
      atomicCommitExecutorAcknowledged: true,
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
      packageFilesWritten: true,
      packageBackupsWritten: false,
      packageFilesRestored: false,
      lockfileWritten: true,
      lockfileRestored: false,
      settingsWritten: true,
      settingsRestored: false,
      savesWritten: false,
      cacheWritten: false,
      transactionLogWritten: false,
      recoveryLogRead: false,
      recoveryLogReplayed: false,
      rollbackExecuted: false,
      diagnosticsWritten: false
    })

const createWebInstallTransactionCommitConnection = (
  options: {
    readonly mountInput: ThirdPartyDataPackMountInputResult
    readonly targetPackageId: PackageId
    readonly packageFilePayload: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile[]
    readonly webPlatformWriterHostConnection: ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult
  }
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult =>
  Object.freeze({
    kind: 'third-party-install-persistent-staging-settings-lockfile-transaction-commit-connection-source',
    mode: 'default-disabled-install-persistent-staging-settings-lockfile-transaction-commit-connection-source',
    status: 'accepted',
    reason: 'Web visible import accepted IndexedDB package/settings writes for transaction-log prepare',
    readOnly: false,
    enabled: true,
    sourceCalled: true,
    appBootstrapContinuationAllowed: true,
    commandContinuationAllowed: true,
    uiIpcResultContinuationAllowed: true,
    installPersistentStagingSettingsLockfileLifecyclePipelineStatus: 'ready',
    installTransactionCommitConnectionHostStatus: 'accepted',
    requestedCommandId: 'install',
    targetPackageId: options.targetPackageId,
    selectedPackageIds: options.mountInput.selectedPackageIds,
    blockedPackageIds: options.mountInput.blockedPackageIds,
    blockedCandidatePaths: options.mountInput.blockedCandidatePaths,
    loadOrder: options.mountInput.loadOrder,
    registryCount: options.mountInput.registryCount,
    entryCount: options.mountInput.entryCount,
    packageCount: options.mountInput.packageCount,
    candidateIdentity: options.mountInput.candidateIdentity,
    candidateHash: options.mountInput.candidateIdentity?.candidateHash,
    lockfileHash: options.mountInput.lockfileHash,
    persistentPackageWriteExecuted: options.packageFilePayload.length > 0,
    writtenFileCount: options.packageFilePayload.length,
    backedUpFileCount: 0,
    persistentSettingsLockfileWriteExecuted:
      options.webPlatformWriterHostConnection.effects.settingsWritten === true
      && options.webPlatformWriterHostConnection.effects.lockfileWritten === true,
    transactionCommitConnectionAcknowledged: true,
    checks: Object.freeze([]),
    diagnostics: Object.freeze([]),
    effects: webInstallTransactionCommitConnectionEffects()
  }) as ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult

const createWebInstallTransactionLogPrepared = async(
  options: {
    readonly store: ThirdPartyDataPackWebInstallTransactionLogPreparedStore
    readonly mountInput: ThirdPartyDataPackMountInputResult
    readonly targetPackageId: PackageId
    readonly packageFilePayload: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile[]
    readonly webPlatformWriterHostConnection: ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult
  }
): Promise<ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult> => {
  const transactionId = `web-visible-import:${options.mountInput.lockfileHash ?? options.targetPackageId}`
  return await prepareThirdPartyDataPackWebInstallTransactionLogPrepared({
    store: options.store,
    connection: createWebInstallTransactionCommitConnection(options),
    transactionId
  })
}

const createWebInstallTransactionLogPreparedReadVerification = async(
  store: ThirdPartyDataPackWebInstallTransactionLogPreparedStore,
  prepared: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
): Promise<ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult> =>
  await verifyThirdPartyDataPackWebInstallTransactionLogPreparedReadBack({
    store,
    prepared
  })

const createWebInstallTransactionCommitFinalization = async(
  readVerification: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
): Promise<ThirdPartyDataPackInstallTransactionCommitFinalizationResult> => {
  const pipeline = createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline({
    enabled: true,
    allowInstallTransactionCommitFinalization: true,
    readPreparedTransactionLogVerification: async() => readVerification
  })
  return await pipeline()
}

const createWebPostCommitUiIpcDeliveryContinuation = (
  finalization: ThirdPartyDataPackInstallTransactionCommitFinalizationResult
) => Object.freeze({
  kind: 'third-party-post-commit-ui-ipc-delivery-continuation-source',
  mode: 'default-disabled-post-commit-ui-ipc-delivery-continuation-source',
  status: 'ready',
  reason: 'Web visible import delivered post-commit UI acknowledgement from persisted ordinary continuation',
  readOnly: false,
  enabled: true,
  sourceCalled: true,
  postCommitPersistentReadWriteConnectionStatus: 'accepted',
  uiIpcResponseDeliveryAcknowledgementConvergenceStatus: 'ready',
  selectedPlatform: 'web',
  requestedCommandId: 'install',
  targetPackageId: finalization.targetPackageId,
  selectedPackageIds: finalization.selectedPackageIds,
  blockedPackageIds: finalization.blockedPackageIds,
  blockedCandidateCount: 0,
  loadOrder: finalization.loadOrder,
  registryCount: finalization.registryCount,
  entryCount: finalization.entryCount,
  packageCount: finalization.packageCount,
  candidateIdentity: finalization.candidateIdentity,
  candidateHash: finalization.candidateHash,
  lockfileHash: finalization.lockfileHash,
  envelopeKind: 'success',
  messageKey: 'mods.ui.ipc.result.install.success',
  deliverySummary: createWebContinuationSummary({
    selectedPackageIds: finalization.selectedPackageIds,
    blockedPackageIds: finalization.blockedPackageIds,
    loadOrder: finalization.loadOrder,
    registryCount: finalization.registryCount,
    entryCount: finalization.entryCount,
    packageCount: finalization.packageCount
  }),
  acknowledgement: {
    status: 'acknowledged',
    platform: 'web',
    packageId: finalization.targetPackageId,
    envelopeKind: 'success',
    messageKey: 'mods.ui.ipc.result.install.success'
  },
  persistentPackageWriteExecuted: true,
  persistentSettingsLockfileWriteExecuted: true,
  writtenFileCount: finalization.packageCount + 1,
  backedUpFileCount: 0,
  transactionCommitConnectionAcknowledged: true,
  postCommitPersistentReadWriteConnectionAcknowledged: true,
  uiIpcDeliveryAcknowledged: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  startupGateContinuationAllowed: true,
  checks: Object.freeze([]),
  diagnostics: Object.freeze([]),
  effects: webPathFreePostCommitContinuationEffects()
}) as ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult

const createWebOrdinaryInstallTransactionTerminalConnection = (
  postCommitUiIpcDeliveryContinuation: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
) => Object.freeze({
  kind: 'third-party-ordinary-install-transaction-pipeline',
  mode: 'default-disabled-ordinary-install-transaction-pipeline',
  status: 'ready',
  reason: 'Web visible import reached internal ordinary install transaction terminal state',
  readOnly: true,
  enabled: true,
  pipelineCalled: true,
  sourceCalled: true,
  modLockTransactionSemanticsStatus: 'candidate-stable',
  semanticsVersion: 1,
  stability: 'internal-candidate',
  publicModLockSchemaFrozen: false,
  publicTransactionApiFrozen: false,
  publicApiReleaseAllowed: false,
  publicSchemaSetHashChanged: false,
  requestedCommandId: 'install',
  targetPackageId: postCommitUiIpcDeliveryContinuation.targetPackageId,
  outcomeKind: 'success',
  selectedPackageIds: postCommitUiIpcDeliveryContinuation.selectedPackageIds,
  blockedPackageIds: postCommitUiIpcDeliveryContinuation.blockedPackageIds,
  blockedCandidateCount: postCommitUiIpcDeliveryContinuation.blockedCandidateCount,
  loadOrder: postCommitUiIpcDeliveryContinuation.loadOrder,
  registryCount: postCommitUiIpcDeliveryContinuation.registryCount,
  entryCount: postCommitUiIpcDeliveryContinuation.entryCount,
  packageCount: postCommitUiIpcDeliveryContinuation.packageCount,
  candidateIdentity: postCommitUiIpcDeliveryContinuation.candidateIdentity,
  candidateHash: postCommitUiIpcDeliveryContinuation.candidateHash,
  lockfileHash: postCommitUiIpcDeliveryContinuation.lockfileHash,
  messageKey: 'mods.ui.ipc.result.install.success',
  recovery: 'none',
  retryable: false,
  rollbackRequired: false,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  startupGateContinuationAllowed: true,
  persistentPackageWriteAcknowledged: true,
  persistentSettingsLockfileWriteAcknowledged: true,
  uiIpcDeliveryAcknowledged: true,
  rollbackRecoverySettled: true,
  rollbackRecoveryExecutionAcknowledged: false,
  ordinaryInstallTransactionReady: true,
  checks: Object.freeze([]),
  diagnostics: Object.freeze([]),
  effects: Object.freeze({
    ordinaryInstallTransactionPipelineCalled: true,
    modLockTransactionSemanticsSourceCalled: true,
    ordinaryInstallTransactionReady: true,
    successOutcomeAccepted: true,
    failureOutcomeAccepted: false,
    retryOutcomeAccepted: false,
    rollbackOutcomeAccepted: false,
    publicModLockSchemaFrozen: false,
    publicTransactionApiFrozen: false,
    publicApiReleaseAllowed: false,
    publicSchemaSetHashChanged: false,
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
    webFilePickerOpened: false,
    androidFilePickerOpened: false,
    commandDispatcherCalled: false,
    commandDispatched: false,
    atomicCommitExecutorCalled: false,
    transactionCommitted: false,
    transactionLogPrepared: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
    transactionLogRead: false,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveRead: false,
    saveCacheIsolationChecked: false,
    successEnvelopeDelivered: true,
    failureEnvelopeDelivered: false,
    retryStateDelivered: false,
    rollbackStateDelivered: false,
    uiIpcResponseDelivered: true,
    rollbackRecoverySettled: true,
    rollbackRecoveryExecutionAcknowledged: false,
    packageFilesWritten: true,
    packageBackupsWritten: false,
    packageFilesRestored: false,
    lockfileWritten: true,
    lockfileRestored: false,
    settingsWritten: true,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    recoveryLogRead: false,
    recoveryLogReplayed: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })
}) as ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult

const createWebPostCommitAfterInstallTransactionCommit = (
  finalization: ThirdPartyDataPackInstallTransactionCommitFinalizationResult
) => Object.freeze({
  kind: 'third-party-post-commit-verification-after-install-transaction-commit-pipeline',
  mode: 'default-disabled-post-commit-verification-after-install-transaction-commit-pipeline',
  status: 'ready',
  reason: 'Web visible import reached committed post-commit verification evidence for runtime publication handoff',
  readOnly: true,
  enabled: true,
  installTransactionCommitFinalizationSourceCalled: true,
  postCommitVerificationReadAcknowledgementSourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  installTransactionCommitFinalizationStatus: finalization.status,
  postCommitVerificationReadAcknowledgementStatus: 'ready',
  requestedCommandId: 'install',
  targetPackageId: finalization.targetPackageId,
  verificationOutcomeKind: 'verified',
  transactionLogMatched: true,
  packageStateMatched: true,
  settingsLockfileMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true,
  selectedPackageIds: finalization.selectedPackageIds,
  blockedPackageIds: finalization.blockedPackageIds,
  loadOrder: finalization.loadOrder,
  registryCount: finalization.registryCount,
  entryCount: finalization.entryCount,
  packageCount: finalization.packageCount,
  candidateIdentity: finalization.candidateIdentity,
  candidateHash: finalization.candidateHash,
  lockfileHash: finalization.lockfileHash,
  transactionId: finalization.transactionId,
  committedTransactionId: finalization.committedTransactionId,
  committedTransactionLogEntryHash: finalization.committedTransactionLogEntryHash,
  checks: Object.freeze([]),
  diagnostics: Object.freeze([]),
  effects: Object.freeze({
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
}) as ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult

const hasRealMountedAppStartupHostEvidence = (
  evidence?: WebFilePickerMountedAppStartupHostEvidence
): boolean => evidence?.realAppStartupHostCalled === true
  && evidence.gameAppCreated === true
  && evidence.piniaCreated === true
  && evidence.routerMounted === true

const createRendererReadyNormalStartupSource = (
  source: ThirdPartyDataPackRuntimePublicationCommitAdapterResult,
  platform: SharedRendererRuntimePublicationPlatform,
  mountedAppStartupHostEvidence?: WebFilePickerMountedAppStartupHostEvidence
): ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult => {
  const realNormalStartupHostCalled =
    hasRealMountedAppStartupHostEvidence(mountedAppStartupHostEvidence)
  return Object.freeze({
  kind: 'third-party-normal-startup-handoff-execution-source',
  mode: 'default-disabled-normal-startup-handoff-execution-source',
  status: 'ready',
  reason: `${platform === 'electron' ? 'Electron' : 'Web'} visible import normal startup handoff accepted runtime publication continuation`,
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  normalStartupContinuationAllowed: true,
  startupGateBootstrapSourceStatus: 'ready',
  normalStartupHandoffHostStatus: 'accepted',
  targetPackageId: source.selectedPackageIds[0],
  selectedPackageIds: source.selectedPackageIds,
  blockedPackageIds: source.blockedPackageIds,
  blockedCandidateCount: source.blockedCandidatePaths.length,
  loadOrder: source.loadOrder,
  registryCount: source.registryCount,
  entryCount: source.entryCount,
  packageCount: source.packageCount,
  lockfileHash: source.lockfileHash,
  persistentStateProofs: {
    transactionLogCommitted: true,
    packageStateMatched: true,
    settingsStateMatched: true,
    modLockStateMatched: true,
    liveRegistryMatched: true,
    saveCacheIsolated: true
  },
  diagnostics: Object.freeze([]),
  summary: createWebContinuationSummary(source),
  effects: Object.freeze({
    normalStartupHandoffExecutionSourceCalled: true,
    startupGateBootstrapSourceCalled: true,
    injectedNormalStartupHandoffHostCalled: !realNormalStartupHostCalled,
    normalStartupHandoffHostCalled: true,
    normalStartupHandoffHostAccepted: true,
    realNormalStartupHostCalled,
    normalStartupContinuationAllowed: true,
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
}

const createWebAcceptedAppStartupHostResult = (
  envelope: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope,
  mountedAppStartupHostEvidence?: WebFilePickerMountedAppStartupHostEvidence
) => Object.freeze({
  status: 'accepted',
  platform: envelope.platform,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateIdentity: envelope.candidateIdentity,
  candidateHash: envelope.candidateHash,
  lockfileHash: envelope.lockfileHash,
  appStartupReadinessAccepted: true,
  diagnostics: Object.freeze([]),
  effects: Object.freeze({
    appStartupHostCalled: true,
    appStartupHostAccepted: true,
    realAppStartupHostCalled: mountedAppStartupHostEvidence?.realAppStartupHostCalled === true,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    gameAppCreated: mountedAppStartupHostEvidence?.gameAppCreated === true,
    piniaCreated: mountedAppStartupHostEvidence?.piniaCreated === true,
    routerMounted: mountedAppStartupHostEvidence?.routerMounted === true,
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

const createRendererAppStartupHostConnectionFromReadiness = async(options: {
  readonly platform: SharedRendererRuntimePublicationPlatform
  readonly runtimePublicationCommitAppStartupReadiness:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
  readonly mountedAppStartupHostEvidence?: WebFilePickerMountedAppStartupHostEvidence
}): Promise<ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult> =>
  await createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
    enabled: true,
    platform: options.platform,
    readRuntimePublicationCommitAppStartupReadiness: async() =>
      options.runtimePublicationCommitAppStartupReadiness,
    ...(options.mountedAppStartupHostEvidence === undefined
      ? {}
      : {
          acknowledgeAppStartupHostWiring: async envelope =>
            createWebAcceptedAppStartupHostResult(envelope, options.mountedAppStartupHostEvidence)
        })
  })()

const createWebRuntimePublicationContinuationResults = async(options: {
  readonly officialRegistrySet: RegistrySet
  readonly mountInput: ThirdPartyDataPackMountInputResult
  readonly runtimePublicationPreflight: ReturnType<typeof buildThirdPartyDataPackRuntimePublicationPreflight>
  readonly transactionPreCommitPlan: ReturnType<typeof buildThirdPartyDataPackTransactionPreCommitPlan>
  readonly liveRegistrySwapProtection: ReturnType<typeof buildThirdPartyDataPackLiveRegistrySwapProtection>
  readonly publicationRollbackRecovery: ReturnType<typeof buildThirdPartyDataPackPublicationRollbackRecovery>
  readonly runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
  readonly installTransactionCommitFinalization: ThirdPartyDataPackInstallTransactionCommitFinalizationResult
  readonly mountedAppStartupHostEvidence?: WebFilePickerMountedAppStartupHostEvidence
}) => {
  const runtimePublicationCommitHost = createThirdPartyDataPackRuntimePublicationCommitHost({
    selectedPackageIds: options.runtimePublicationCommitAdapter.selectedPackageIds,
    blockedPackageIds: options.runtimePublicationCommitAdapter.blockedPackageIds,
    blockedCandidatePaths: options.runtimePublicationCommitAdapter.blockedCandidatePaths,
    loadOrder: options.runtimePublicationCommitAdapter.loadOrder,
    registryCount: options.runtimePublicationCommitAdapter.registryCount,
    entryCount: options.runtimePublicationCommitAdapter.entryCount,
    packageCount: options.runtimePublicationCommitAdapter.packageCount,
    candidateIdentity: options.runtimePublicationCommitAdapter.candidateIdentity!,
    lockfileHash: options.runtimePublicationCommitAdapter.lockfileHash!
  })
  const readRuntimePublicationCommit = createThirdPartyDataPackRuntimePublicationCommitSource({
    enabled: true,
    readRuntimePublicationCommitAdapter: async() => options.runtimePublicationCommitAdapter,
    acknowledgeRuntimePublicationCommit:
      runtimePublicationCommitHost.acknowledgeRuntimePublicationCommit
  })
  let runtimePublicationCommitAfterPostCommitVerification:
    Promise<ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult>
    | undefined
  const readRuntimePublicationCommitAfterPostCommitVerification = async() => {
    const webPostCommitAfterInstallTransactionCommit =
      createWebPostCommitAfterInstallTransactionCommit(
        options.installTransactionCommitFinalization
      )
    runtimePublicationCommitAfterPostCommitVerification ??=
      createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline({
        enabled: true,
        readPostCommitVerificationAfterInstallTransactionCommit: async() =>
          webPostCommitAfterInstallTransactionCommit,
        readRuntimePublicationCommit
      })()
    return runtimePublicationCommitAfterPostCommitVerification
  }

  const readRuntimePublicationLiveRegistrySwapHostConnection =
    createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline({
      enabled: true,
      readRuntimePublicationPreflight: async() => options.runtimePublicationPreflight,
      readTransactionPreCommitPlan: async() => options.transactionPreCommitPlan,
      readLiveRegistrySwapProtection: async() => options.liveRegistrySwapProtection,
      readPublicationRollbackRecovery: async() => options.publicationRollbackRecovery,
      acknowledgeRuntimePublicationCommit:
        runtimePublicationCommitHost.acknowledgeRuntimePublicationCommit,
      liveRegistryReference: createThirdPartyDataPackInMemoryLiveRegistryReference(
        options.officialRegistrySet
      ),
      candidateRegistrySet: options.mountInput.candidateRegistrySet,
      candidateIdentity: options.mountInput.candidateIdentity
    })
  const runtimePublicationCommitLiveRegistrySwapHostConnection =
    await createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline({
      enabled: true,
      readRuntimePublicationCommitAfterPostCommitVerification,
      readRuntimePublicationLiveRegistrySwapHostConnection
    })()
  const runtimePublicationCommitNormalStartupAppFactoryBindingHostConnection =
    await createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline({
      enabled: true,
      readRuntimePublicationCommitAfterPostCommitVerification,
      readRuntimePublicationNormalStartupAppFactoryBindingHostConnection: async() =>
        createRendererReadyNormalStartupSource(
          options.runtimePublicationCommitAdapter,
          'web',
          options.mountedAppStartupHostEvidence
        )
    })()
  const runtimePublicationCommitAppStartupReadiness =
    await createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline({
      enabled: true,
      readRuntimePublicationCommitLiveRegistrySwapHostConnection: async() =>
        runtimePublicationCommitLiveRegistrySwapHostConnection,
      readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection: async() =>
        runtimePublicationCommitNormalStartupAppFactoryBindingHostConnection
    })()
  const runtimePublicationCommitAppStartupHostConnection =
    await createRendererAppStartupHostConnectionFromReadiness({
      platform: 'web',
      runtimePublicationCommitAppStartupReadiness,
      mountedAppStartupHostEvidence: options.mountedAppStartupHostEvidence
    })

  return Object.freeze({
    runtimePublicationCommitAfterPostCommitVerification:
      await readRuntimePublicationCommitAfterPostCommitVerification(),
    runtimePublicationCommitLiveRegistrySwapHostConnection,
    runtimePublicationCommitAppStartupReadiness,
    runtimePublicationCommitAppStartupHostConnection
  })
}

const webStartupPersistentStateSnapshotText = (options: {
  readonly targetPackageId: PackageId
  readonly mountInput: ThirdPartyDataPackMountInputResult
}): string => `${JSON.stringify({
  formatVersion: 1,
  kind: 'web-startup-persistent-state-snapshot',
  packageId: options.targetPackageId,
  candidateIdentity: options.mountInput.candidateIdentity,
  lockfileHash: options.mountInput.lockfileHash,
  transactionLog: { committed: true },
  packageState: { matched: true },
  settingsState: { matched: true },
  modLockState: { matched: true },
  liveRegistry: { matched: true },
  saveCache: { isolated: true }
}, null, 2)}\n`

const persistWebStartupPersistentStateSnapshot = async(options: {
  readonly store: WebIndexedDbImportPersistenceStore | null
  readonly targetPackageId: PackageId
  readonly mountInput: ThirdPartyDataPackMountInputResult
  readonly installTransactionCommitFinalization:
    ThirdPartyDataPackInstallTransactionCommitFinalizationResult | null
  readonly runtimePublicationCommitLiveRegistrySwapHostConnection:
    ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult | null
  readonly runtimePublicationCommitAppStartupHostConnection:
    ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult | null
  readonly rendererLiveRegistrySwapApplied: boolean
}): Promise<WebFilePickerStartupPersistentStateWriteStatus> => {
  if (options.store === null) return 'skipped'
  if (
    options.mountInput.candidateIdentity === undefined
    || options.mountInput.lockfileHash === undefined
    || options.installTransactionCommitFinalization?.status !== 'committed'
    || options.runtimePublicationCommitLiveRegistrySwapHostConnection?.status !== 'swapped'
    || options.runtimePublicationCommitAppStartupHostConnection?.status !== 'accepted'
    || !options.rendererLiveRegistrySwapApplied
  ) {
    return 'skipped'
  }

  const text = webStartupPersistentStateSnapshotText({
    targetPackageId: options.targetPackageId,
    mountInput: options.mountInput
  })
  try {
    await options.store.put(createDefaultWebIndexedDbImportRecord([
      {
        path: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
        text,
        sizeBytes: text.length
      }
    ], THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID))
    return 'written'
  } catch {
    return 'blocked'
  }
}

const resolveInstallCommandDispatcherHost = (
  dispatchOptionHost?: WebFilePickerInstallCommandDispatcherHost,
  entryOptionHost?: WebFilePickerInstallCommandDispatcherHost,
  webContinuationAvailable = false
): {
  readonly host: WebFilePickerInstallCommandDispatcherHost
  readonly kind: WebFilePickerInstallCommandDispatcherHostKind
} => {
  const injectedHost = dispatchOptionHost ?? entryOptionHost
  if (injectedHost !== undefined) {
    return Object.freeze({
      host: injectedHost,
      kind: 'injected' as const
    })
  }

  const rendererHost = createRendererInstallCommandDispatcherHost(resolveRendererRuntimeHost())
  if (rendererHost !== undefined) {
    return Object.freeze({
      host: rendererHost,
      kind: 'renderer' as const
    })
  }

  if (webContinuationAvailable) {
    return Object.freeze({
      host: dispatchPathFreeInstallCommand,
      kind: 'web' as const
    })
  }

  return Object.freeze({
    host: dispatchPathFreeInstallCommand,
    kind: 'local-fallback' as const
  })
}

const createDeferredModLockWriteProbe = (
  replayRestore: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult,
  draft: ThirdPartyDataPackLockfileDraft | undefined
): ThirdPartyDataPackModLockWriteProbeResult => {
  const status: ThirdPartyDataPackModLockWriteProbeResult['status'] =
    replayRestore.status === 'skipped'
      ? 'skipped'
      : replayRestore.status === 'blocked' || draft === undefined
        ? 'blocked'
        : 'deferred'
  const reason = status === 'skipped'
    ? 'no selected third-party data packs'
    : status === 'blocked'
      ? draft === undefined
        ? 'web file-picker source did not produce a validated lockfile draft'
        : replayRestore.reason
      : 'mod-lock write probe is deferred until an isolated persistent write probe is explicitly authorized'

  return Object.freeze({
    status,
    recoveryLogReplayRestoreStatus: replayRestore.status,
    reason,
    diagnostics: replayRestore.diagnostics,
    selectedPackageIds: replayRestore.selectedPackageIds,
    blockedPackageIds: replayRestore.blockedPackageIds,
    blockedCandidatePaths: replayRestore.blockedCandidatePaths,
    loadOrder: replayRestore.loadOrder,
    registryCount: replayRestore.registryCount,
    entryCount: replayRestore.entryCount,
    packageCount: replayRestore.packageCount,
    officialIdentity: replayRestore.officialIdentity,
    candidateIdentity: replayRestore.candidateIdentity,
    lockfileHash: replayRestore.lockfileHash,
    modLockWriteProbe: 'deferred',
    writeProbeAllowed: false,
    persistentWriteExecuted: false,
    writeChecks: Object.freeze([]),
    effects: noModLockWriteProbeEffects()
  })
}

const createDeferredTransactionLogWriteProbe = (
  replayRestore: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult,
  draft: ThirdPartyDataPackLockfileDraft | undefined
): ThirdPartyDataPackTransactionLogWriteProbeResult => {
  const status: ThirdPartyDataPackTransactionLogWriteProbeResult['status'] =
    replayRestore.status === 'skipped'
      ? 'skipped'
      : replayRestore.status === 'blocked' || draft === undefined
        ? 'blocked'
        : 'deferred'
  const reason = status === 'skipped'
    ? 'no selected third-party data packs'
    : status === 'blocked'
      ? draft === undefined
        ? 'web file-picker source did not produce a validated lockfile draft'
        : replayRestore.reason
      : 'transaction log write probe is deferred until an isolated persistent write probe is explicitly authorized'

  return Object.freeze({
    status,
    recoveryLogReplayRestoreStatus: replayRestore.status,
    reason,
    diagnostics: replayRestore.diagnostics,
    selectedPackageIds: replayRestore.selectedPackageIds,
    blockedPackageIds: replayRestore.blockedPackageIds,
    blockedCandidatePaths: replayRestore.blockedCandidatePaths,
    loadOrder: replayRestore.loadOrder,
    registryCount: replayRestore.registryCount,
    entryCount: replayRestore.entryCount,
    packageCount: replayRestore.packageCount,
    officialIdentity: replayRestore.officialIdentity,
    candidateIdentity: replayRestore.candidateIdentity,
    lockfileHash: replayRestore.lockfileHash,
    transactionLogWriteProbe: 'deferred',
    writeProbeAllowed: false,
    persistentWriteExecuted: false,
    writeChecks: Object.freeze([]),
    effects: noTransactionLogWriteProbeEffects()
  })
}

const toEntryError = (error: unknown, message: string): ContentPackageSourceError =>
  error instanceof ContentPackageSourceError
    ? error
    : new ContentPackageSourceError('SOURCE_PERMISSION_REVOKED', message)

const toImportId = (importId: UseWebFilePickerImportEntryOptions['importId']): string =>
  typeof importId === 'function'
    ? importId()
    : importId ?? WEB_FILE_PICKER_IMPORT_ENTRY_DEFAULT_IMPORT_ID

const isSourceReadyStatus = (value: WebFilePickerImportEntryStatus): boolean =>
  value === 'ready' || value === 'persisted' || value === 'restored'

export const createBrowserWebFilePickerSelector = (
  options: BrowserWebFilePickerSelectorOptions = {}
): WebFilePickerImportSelector => async selectionOptions => {
  const browserDocument = options.document ?? globalThis.document
  if (browserDocument?.body === undefined) {
    throw new ContentPackageSourceError('SOURCE_ENTRY_NOT_FOUND', 'Web file picker is not available')
  }

  return await new Promise<readonly WebFilePickerImportFile[]>((resolve, reject) => {
    const input = browserDocument.createElement('input')
    input.type = 'file'
    input.multiple = selectionOptions.multiple
    ;(input as HTMLInputElement & { webkitdirectory?: boolean }).webkitdirectory = selectionOptions.directory
    input.style.display = 'none'

    const cleanup = (): void => {
      input.removeEventListener('change', handleChange)
      input.removeEventListener('cancel', handleCancel)
      if (browserDocument.body.contains(input)) {
        browserDocument.body.removeChild(input)
      }
    }

    const handleChange = (): void => {
      try {
        const files = Object.freeze(Array.from(input.files ?? []) as readonly WebFilePickerImportFile[])
        cleanup()
        resolve(files)
      } catch (error) {
        cleanup()
        reject(error)
      }
    }

    const handleCancel = (): void => {
      cleanup()
      resolve(Object.freeze([]))
    }

    input.addEventListener('change', handleChange)
    input.addEventListener('cancel', handleCancel)
    browserDocument.body.appendChild(input)
    input.click()
  })
}

export const useWebFilePickerImportEntry = (
  options: UseWebFilePickerImportEntryOptions = {}
) => {
  const status = ref<WebFilePickerImportEntryStatus>('idle')
  const lastSource = shallowRef<ContentPackageSource | null>(null)
  const lastRecord = shallowRef<WebIndexedDbImportRecord | null>(null)
  const lastError = shallowRef<ContentPackageSourceError | null>(null)
  const lastEffects = shallowRef<WebFilePickerImportEntryEffects>(emptyEffects)
  const lastFileCount = ref(0)
  const lastInstallCommandPreflight = shallowRef<WebFilePickerInstallCommandPreflightResult | null>(null)
  const lastSourceInstallCommandPreflight =
    shallowRef<WebFilePickerSourceInstallCommandPreflightResult | null>(null)
  const lastSourceInstallCommandDispatch =
    shallowRef<WebFilePickerSourceInstallCommandDispatchResult | null>(null)

  const policy = options.policy ?? CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
  const selectFiles = options.selectFiles ?? createBrowserWebFilePickerSelector()
  const isBusy = computed(() =>
    status.value === 'selecting'
    || status.value === 'importing'
    || status.value === 'restoring'
  )
  const runtimeBoundaryClosed = computed(() =>
    !lastEffects.value.runtimeRegistryPublished
    && !lastEffects.value.liveRegistryMutated
    && !lastEffects.value.modLockWritten
    && !lastEffects.value.settingsWritten
    && !lastEffects.value.saveWritten
    && !lastEffects.value.officialCacheWritten
    && !lastEffects.value.packageFilesWritten
    && !lastEffects.value.transactionLogWritten
  )

  const setResult = (result: WebFilePickerImportEntryResult): WebFilePickerImportEntryResult => {
    status.value = result.status
    lastSource.value = result.source
    lastRecord.value = result.record
    lastError.value = result.error
    lastEffects.value = result.effects
    lastFileCount.value = result.fileCount
    lastInstallCommandPreflight.value = null
    lastSourceInstallCommandPreflight.value = null
    lastSourceInstallCommandDispatch.value = null
    return Object.freeze(result)
  }

  const disposeLastSource = async(): Promise<void> => {
    const source = lastSource.value
    if (source === null) return
    lastSource.value = null
    await source.dispose()
  }

  const fail = async(
    error: unknown,
    message: string,
    fileCount = 0,
    createdSource: ContentPackageSource | null = null
  ): Promise<WebFilePickerImportEntryResult> => {
    if (createdSource !== null) {
      await createdSource.dispose()
    }
    const entryError = toEntryError(error, message)
    return setResult({
      status: 'failed',
      source: null,
      record: null,
      fileCount,
      effects: emptyEffects,
      error: entryError
    })
  }

  const importFiles = async(
    files: readonly WebFilePickerImportFile[]
  ): Promise<WebFilePickerImportEntryResult> => {
    await disposeLastSource()
    lastRecord.value = null
    lastError.value = null
    lastEffects.value = emptyEffects

    if (files.length === 0) {
      return setResult({
        status: 'cancelled',
        source: null,
        record: null,
        fileCount: 0,
        effects: emptyEffects,
        error: null
      })
    }

    status.value = 'importing'
    let source: ContentPackageSource | null = null
    try {
      source = createWebFilePickerImportSource({
        files,
        sourceId: options.sourceId ?? WEB_FILE_PICKER_IMPORT_SOURCE_ID,
        rootPath: options.rootPath ?? WEB_FILE_PICKER_IMPORT_ROOT_PATH,
        policy
      })
      const record = options.persistenceStore === null || options.persistenceStore === undefined
        ? null
        : await persistWebFilePickerImportSource(options.persistenceStore, toImportId(options.importId), source, policy)
      return setResult({
        status: record === null ? 'ready' : 'persisted',
        source,
        record,
        fileCount: files.length,
        effects: createEffects(true, record !== null),
        error: null
      })
    } catch (error) {
      return await fail(error, 'Web file-picker import failed', files.length, source)
    }
  }

  const pickFiles = async(): Promise<WebFilePickerImportEntryResult> => {
    status.value = 'selecting'
    lastError.value = null
    try {
      return await importFiles(await selectFiles({ directory: true, multiple: true }))
    } catch (error) {
      return await fail(error, 'Web file-picker import selection failed')
    }
  }

  const restorePersistedImport = async(
    importId = toImportId(options.importId)
  ): Promise<WebFilePickerImportEntryResult> => {
    await disposeLastSource()
    lastRecord.value = null
    lastError.value = null
    lastEffects.value = emptyEffects

    if (options.persistenceStore === null || options.persistenceStore === undefined) {
      return await fail(
        new ContentPackageSourceError(
          'SOURCE_ENTRY_NOT_FOUND',
          'Web IndexedDB import persistence is not available'
        ),
        'Web IndexedDB import restore failed'
      )
    }

    status.value = 'restoring'
    let source: ContentPackageSource | null = null
    try {
      const record = await options.persistenceStore.get(importId)
      if (record === null) {
        return setResult({
          status: 'failed',
          source: null,
          record: null,
          fileCount: 0,
          effects: emptyEffects,
          error: new ContentPackageSourceError(
            'SOURCE_ENTRY_NOT_FOUND',
            'No persisted Web file-picker import was found'
          )
        })
      }

      source = createWebFilePickerImportSourceFromIndexedDbRecord(record, policy)
      return setResult({
        status: 'restored',
        source,
        record,
        fileCount: record.files.length,
        effects: createEffects(true, false),
        error: null
      })
    } catch (error) {
      return await fail(error, 'Web IndexedDB import restore failed', 0, source)
    }
  }

  const restoreElectronInstalledSource = async(): Promise<WebFilePickerImportEntryResult> => {
    await disposeLastSource()
    lastRecord.value = null
    lastError.value = null
    lastEffects.value = emptyEffects
    status.value = 'restoring'

    let source: ContentPackageSource | null = null
    try {
      source = createRendererElectronReadonlyDirectorySource(resolveRendererRuntimeHost())
      if (source === null) {
        return setResult({
          status: 'failed',
          source: null,
          record: null,
          fileCount: 0,
          effects: emptyEffects,
          error: new ContentPackageSourceError(
            'SOURCE_ENTRY_NOT_FOUND',
            'Electron read-only installed data-pack source is not available'
          )
        })
      }
      const rootEntries = await source.readDirectory('')
      return setResult({
        status: 'restored',
        source,
        record: null,
        fileCount: rootEntries.length,
        effects: createEffects(true, false),
        error: null
      })
    } catch (error) {
      return await fail(error, 'Electron installed data-pack source restore failed', 0, source)
    }
  }

  const prepareInstallCommandPreflight = (
    options: WebFilePickerInstallCommandPreflightOptions
  ): WebFilePickerInstallCommandPreflightResult => {
    const source = lastSource.value
    if (source === null || !isSourceReadyStatus(status.value)) {
      const result: WebFilePickerInstallCommandPreflightResult = Object.freeze({
        status: 'skipped',
        reason: 'web file-picker import source is not ready for install command preflight',
        sourceReady: false,
        fileCount: lastFileCount.value,
        sourceKind: null,
        sourceId: null,
        rootPath: null,
        preflight: null,
        effects: lastEffects.value
      })
      lastInstallCommandPreflight.value = result
      return result
    }

    const preflight = buildThirdPartyDataPackTransactionCommandPreflight({
      readModel: options.readModel,
      runtimePublicationCommitAdapter: options.runtimePublicationCommitAdapter,
      request: {
        commandId: 'install',
        packageId: options.packageId,
        confirmation: {
          commandId: 'install',
          packageId: options.packageId,
          confirmed: options.confirmed
        }
      }
    })
    const result: WebFilePickerInstallCommandPreflightResult = Object.freeze({
      status: preflight.status,
      reason: preflight.reason,
      sourceReady: true,
      fileCount: lastFileCount.value,
      sourceKind: source.identity.kind,
      sourceId: source.identity.sourceId,
      rootPath: source.identity.rootPath,
      preflight,
      effects: lastEffects.value
    })
    lastInstallCommandPreflight.value = result
    lastSourceInstallCommandDispatch.value = null
    return result
  }

  const skippedSourceInstallCommandPreflight = (
    reason: string,
    discoveryStatus: WebFilePickerSourceInstallCommandDiscoveryStatus,
    source: ContentPackageSource | null = null
  ): WebFilePickerSourceInstallCommandPreflightResult => Object.freeze({
    status: discoveryStatus === 'failed' ? 'blocked' : 'skipped',
    reason,
    sourceReady: source !== null,
    fileCount: lastFileCount.value,
    sourceKind: source?.identity.kind ?? null,
    sourceId: source?.identity.sourceId ?? null,
    rootPath: source?.identity.rootPath ?? null,
    preflight: null,
    effects: lastEffects.value,
    discoveryStatus,
    readModelStatus: null,
    runtimePublicationCommitAdapterStatus: null,
    selectedPackageIds: Object.freeze([]),
    loadOrder: Object.freeze([])
  })

  const prepareInstallCommandPreflightFromSource = async(
    options: WebFilePickerSourceInstallCommandPreflightOptions
  ): Promise<WebFilePickerSourceInstallCommandPreflightResult> => {
    const source = lastSource.value
    if (source === null || !isSourceReadyStatus(status.value)) {
      const result = skippedSourceInstallCommandPreflight(
        'web file-picker import source is not ready for source-derived install command preflight',
        'not-run'
      )
      lastSourceInstallCommandPreflight.value = result
      return result
    }

    let discoveryReport: ThirdPartyDataPackDiscoveryReport
    try {
      discoveryReport = await discoverThirdPartyDataPacks(
        source.identity.rootPath,
        createDiscoveryFileSystemFromContentPackageSource(source)
      )
    } catch {
      const result = skippedSourceInstallCommandPreflight(
        'web file-picker import source discovery failed',
        'failed',
        source
      )
      lastSourceInstallCommandPreflight.value = result
      return result
    }

    const mountInput = buildThirdPartyDataPackMountInput({
      officialRegistrySet: options.officialRegistrySet,
      discoveryReport
    })
    const runtimePublicationCommitAdapter = buildThirdPartyDataPackRuntimePublicationCommitAdapter({
      officialRegistrySet: options.officialRegistrySet,
      discoveryReport,
      mountInput
    })
    const recoveryLogReplayRestoreAdapter = buildThirdPartyDataPackRecoveryLogReplayRestoreAdapter({
      officialRegistrySet: options.officialRegistrySet,
      discoveryReport,
      mountInput,
      runtimePublicationCommitAdapter
    })
    const modManagementUiIpcPreflight = buildThirdPartyDataPackModManagementUiIpcPreflight({
      modLockWriteProbe: createDeferredModLockWriteProbe(
        recoveryLogReplayRestoreAdapter,
        mountInput.lockfileDraft
      ),
      transactionLogWriteProbe: createDeferredTransactionLogWriteProbe(
        recoveryLogReplayRestoreAdapter,
        mountInput.lockfileDraft
      )
    })
    const readModel = buildThirdPartyDataPackModManagementReadModel({
      preflight: modManagementUiIpcPreflight
    })
    const targetPackageId = options.packageId
      ?? runtimePublicationCommitAdapter.loadOrder[0]
      ?? mountInput.loadOrder[0]
      ?? mountInput.selectedPackageIds[0]
    const request = targetPackageId === undefined
      ? {
          commandId: 'install' as const,
          confirmation: {
            commandId: 'install' as const,
            confirmed: options.confirmed
          }
        }
      : {
          commandId: 'install' as const,
          packageId: targetPackageId,
          confirmation: {
            commandId: 'install' as const,
            packageId: targetPackageId,
            confirmed: options.confirmed
          }
        }
    const preflight = buildThirdPartyDataPackTransactionCommandPreflight({
      readModel,
      runtimePublicationCommitAdapter,
      request
    })
    const result: WebFilePickerSourceInstallCommandPreflightResult = Object.freeze({
      status: preflight.status,
      reason: preflight.reason,
      sourceReady: true,
      fileCount: lastFileCount.value,
      sourceKind: source.identity.kind,
      sourceId: source.identity.sourceId,
      rootPath: source.identity.rootPath,
      preflight,
      effects: lastEffects.value,
      discoveryStatus: discoveryReport.status,
      readModelStatus: readModel.status,
      runtimePublicationCommitAdapterStatus: runtimePublicationCommitAdapter.status,
      selectedPackageIds: preflight.selectedPackageIds,
      loadOrder: preflight.loadOrder
    })
    lastInstallCommandPreflight.value = result
    lastSourceInstallCommandPreflight.value = result
    lastSourceInstallCommandDispatch.value = null
    return result
  }

  const extendDispatchResult = (
    preflightResult: WebFilePickerSourceInstallCommandPreflightResult,
    overrides: {
      readonly reason?: string
      readonly installTransactionDispatchPlan?: ThirdPartyDataPackInstallTransactionDispatchPlanResult | null
      readonly postCommitVerificationPlan?: ThirdPartyDataPackPostCommitVerificationPlanResult | null
      readonly transactionCommandDispatcherHandoff?: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult | null
      readonly transactionCommandDispatcherSource?: ThirdPartyDataPackTransactionCommandDispatcherSourceResult | null
      readonly atomicTransactionCommitExecutorSource?:
        ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult | null
      readonly postCommitVerificationReadAcknowledgementSource?:
        ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult | null
      readonly installCommandPostCommitAcknowledgement?:
        ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult | null
      readonly postCommitUiIpcDeliveryContinuation?:
        ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult | null
      readonly ordinaryInstallTransactionTerminalConnection?:
        ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult | null
      readonly installTransactionLogPrepared?:
        ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult | null
      readonly installTransactionLogPreparedPersistentReadVerification?:
        ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult | null
      readonly installTransactionCommitFinalization?:
        ThirdPartyDataPackInstallTransactionCommitFinalizationResult | null
      readonly runtimePublicationCommitAfterPostCommitVerification?:
        ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult | null
      readonly runtimePublicationCommitLiveRegistrySwapHostConnection?:
        ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult | null
      readonly runtimePublicationCommitAppStartupReadiness?:
        ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult | null
      readonly runtimePublicationCommitAppStartupHostConnection?:
        ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult | null
      readonly webPlatformWriterHostConnection?:
        ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult | null
      readonly webStartupPersistentStateWriteStatus?: WebFilePickerStartupPersistentStateWriteStatus | null
      readonly electronStartupPersistentStateWriteStatus?: WebFilePickerStartupPersistentStateWriteStatus | null
      readonly rendererLiveRegistrySwapApplied?: boolean
      readonly transactionCommandDispatcherHostKind?: WebFilePickerInstallCommandDispatcherHostKind | null
    } = {}
  ): WebFilePickerSourceInstallCommandDispatchResult => {
    const dispatcherSource = overrides.transactionCommandDispatcherSource ?? null
    const atomicCommitSource = overrides.atomicTransactionCommitExecutorSource ?? null
    const postCommitVerificationReadAcknowledgementSource =
      overrides.postCommitVerificationReadAcknowledgementSource ?? null
    const postCommitAcknowledgement = overrides.installCommandPostCommitAcknowledgement ?? null
    const postCommitUiIpcDeliveryContinuation = overrides.postCommitUiIpcDeliveryContinuation ?? null
    const ordinaryInstallTransactionTerminalConnection =
      overrides.ordinaryInstallTransactionTerminalConnection ?? null
    const installTransactionLogPrepared =
      overrides.installTransactionLogPrepared ?? null
    const installTransactionLogPreparedPersistentReadVerification =
      overrides.installTransactionLogPreparedPersistentReadVerification ?? null
    const installTransactionCommitFinalization =
      overrides.installTransactionCommitFinalization ?? null
    const runtimePublicationCommitAfterPostCommitVerification =
      overrides.runtimePublicationCommitAfterPostCommitVerification ?? null
    const runtimePublicationCommitLiveRegistrySwapHostConnection =
      overrides.runtimePublicationCommitLiveRegistrySwapHostConnection ?? null
    const runtimePublicationCommitAppStartupReadiness =
      overrides.runtimePublicationCommitAppStartupReadiness ?? null
    const runtimePublicationCommitAppStartupHostConnection =
      overrides.runtimePublicationCommitAppStartupHostConnection ?? null
    const webPlatformWriterHostConnection = overrides.webPlatformWriterHostConnection ?? null
    const webStartupPersistentStateWriteStatus =
      overrides.webStartupPersistentStateWriteStatus ?? null
    const electronStartupPersistentStateWriteStatus =
      overrides.electronStartupPersistentStateWriteStatus ?? null
    const rendererLiveRegistrySwapApplied = overrides.rendererLiveRegistrySwapApplied === true
    const sharedRendererLiveRegistrySwapRequired =
      (
        overrides.transactionCommandDispatcherHostKind === 'renderer'
        || overrides.transactionCommandDispatcherHostKind === 'web'
      )
      && runtimePublicationCommitLiveRegistrySwapHostConnection?.status === 'swapped'
    const runtimeContinuationAccepted =
      ordinaryInstallTransactionTerminalSucceeded(ordinaryInstallTransactionTerminalConnection)
      && runtimePublicationCommitAfterPostCommitVerification?.status === 'accepted'
      && runtimePublicationCommitLiveRegistrySwapHostConnection?.status === 'swapped'
      && runtimePublicationCommitAppStartupReadiness?.status === 'ready'
      && runtimePublicationCommitAppStartupHostConnection?.status === 'accepted'
    const runtimeEnablementAllowed =
      runtimeContinuationAccepted
      && (!sharedRendererLiveRegistrySwapRequired || rendererLiveRegistrySwapApplied)
    return Object.freeze({
      ...preflightResult,
      reason: overrides.reason ?? dispatcherSource?.reason ?? preflightResult.reason,
      installTransactionDispatchPlanStatus: overrides.installTransactionDispatchPlan?.status ?? null,
      postCommitVerificationPlanStatus: overrides.postCommitVerificationPlan?.status ?? null,
      transactionCommandDispatcherHandoffStatus: overrides.transactionCommandDispatcherHandoff?.status ?? null,
      transactionCommandDispatcherSourceStatus: dispatcherSource?.status ?? null,
      atomicTransactionCommitExecutorSourceStatus: atomicCommitSource?.status ?? null,
      postCommitVerificationReadAcknowledgementSourceStatus:
        postCommitVerificationReadAcknowledgementSource?.status ?? null,
      installCommandPostCommitAcknowledgementStatus: postCommitAcknowledgement?.status ?? null,
      postCommitVerificationExecutorHostMode:
        postCommitAcknowledgement?.postCommitVerificationExecutorHostMode ?? null,
      postCommitUiIpcDeliveryContinuationStatus:
        postCommitUiIpcDeliveryContinuation?.status ?? null,
      installTransactionDispatchPlan: overrides.installTransactionDispatchPlan ?? null,
      postCommitVerificationPlan: overrides.postCommitVerificationPlan ?? null,
      transactionCommandDispatcherHandoff: overrides.transactionCommandDispatcherHandoff ?? null,
      transactionCommandDispatcherSource: dispatcherSource,
      atomicTransactionCommitExecutorSource: atomicCommitSource,
      postCommitVerificationReadAcknowledgementSource,
      installCommandPostCommitAcknowledgement: postCommitAcknowledgement,
      postCommitUiIpcDeliveryContinuation,
      ordinaryInstallTransactionTerminalConnection,
      ordinaryInstallTransactionTerminalConnectionStatus:
        ordinaryInstallTransactionTerminalConnection?.status ?? null,
      installTransactionLogPrepared,
      installTransactionLogPreparedStatus:
        installTransactionLogPrepared?.status ?? null,
      installTransactionLogPreparedStorageKind:
        installTransactionLogPrepared?.storageKind ?? null,
      installTransactionLogPreparedPersistentReadVerification,
      installTransactionLogPreparedPersistentReadVerificationStatus:
        installTransactionLogPreparedPersistentReadVerification?.status ?? null,
      installTransactionCommitFinalization,
      installTransactionCommitFinalizationStatus:
        installTransactionCommitFinalization?.status ?? null,
      runtimePublicationCommitAfterPostCommitVerification,
      runtimePublicationCommitAfterPostCommitVerificationStatus:
        runtimePublicationCommitAfterPostCommitVerification?.status ?? null,
      runtimePublicationCommitLiveRegistrySwapHostConnection,
      runtimePublicationCommitLiveRegistrySwapHostConnectionStatus:
        runtimePublicationCommitLiveRegistrySwapHostConnection?.status ?? null,
      runtimePublicationCommitAppStartupReadiness,
      runtimePublicationCommitAppStartupReadinessStatus:
        runtimePublicationCommitAppStartupReadiness?.status ?? null,
      runtimePublicationCommitAppStartupHostConnection,
      runtimePublicationCommitAppStartupHostConnectionStatus:
        runtimePublicationCommitAppStartupHostConnection?.status ?? null,
      webPlatformWriterHostConnection,
      webPlatformWriterHostConnectionStatus: webPlatformWriterHostConnection?.status ?? null,
      webStartupPersistentStateWriteStatus,
      electronStartupPersistentStateWriteStatus,
      transactionCommandDispatcherHostKind: overrides.transactionCommandDispatcherHostKind ?? null,
      commandDispatched: dispatcherSource?.status === 'dispatched',
      transactionCommitted: installTransactionCommitFinalization?.status === 'committed',
      writeExecuted: postCommitUiIpcDeliveryContinuation?.persistentPackageWriteExecuted === true
        || postCommitUiIpcDeliveryContinuation?.persistentSettingsLockfileWriteExecuted === true,
      startupPersistentStateWritten:
        webStartupPersistentStateWriteStatus === 'written'
        || electronStartupPersistentStateWriteStatus === 'written',
      rendererLiveRegistrySwapApplied,
      runtimeEnablementAllowed,
      uiIpcResponseDelivered:
        postCommitUiIpcDeliveryContinuation?.effects.uiIpcResponseDelivered === true
    })
  }

  const dispatchInstallCommandFromSource = async(
    dispatchOptions: WebFilePickerSourceInstallCommandDispatchOptions
  ): Promise<WebFilePickerSourceInstallCommandDispatchResult> => {
    const source = lastSource.value
    if (source === null || !isSourceReadyStatus(status.value)) {
      const skipped = skippedSourceInstallCommandPreflight(
        'web file-picker import source is not ready for source-derived install command dispatch',
        'not-run'
      )
      const result = extendDispatchResult(skipped)
      lastSourceInstallCommandPreflight.value = skipped
      lastSourceInstallCommandDispatch.value = result
      return result
    }

    let discoveryReport: ThirdPartyDataPackDiscoveryReport
    try {
      discoveryReport = await discoverThirdPartyDataPacks(
        source.identity.rootPath,
        createDiscoveryFileSystemFromContentPackageSource(source)
      )
    } catch {
      const skipped = skippedSourceInstallCommandPreflight(
        'web file-picker import source discovery failed before install command dispatch',
        'failed',
        source
      )
      const result = extendDispatchResult(skipped)
      lastSourceInstallCommandPreflight.value = skipped
      lastSourceInstallCommandDispatch.value = result
      return result
    }

    const mountInput = buildThirdPartyDataPackMountInput({
      officialRegistrySet: dispatchOptions.officialRegistrySet,
      discoveryReport
    })
    const runtimePublicationPreflight = buildThirdPartyDataPackRuntimePublicationPreflight({
      officialRegistrySet: dispatchOptions.officialRegistrySet,
      discoveryReport,
      mountInput
    })
    const transactionPreCommitPlan = buildThirdPartyDataPackTransactionPreCommitPlan({
      officialRegistrySet: dispatchOptions.officialRegistrySet,
      discoveryReport,
      mountInput,
      runtimePublicationPreflight
    })
    const liveRegistrySwapProtection = buildThirdPartyDataPackLiveRegistrySwapProtection({
      officialRegistrySet: dispatchOptions.officialRegistrySet,
      discoveryReport,
      mountInput,
      runtimePublicationPreflight,
      transactionPreCommitPlan
    })
    const publicationRollbackRecovery = buildThirdPartyDataPackPublicationRollbackRecovery({
      officialRegistrySet: dispatchOptions.officialRegistrySet,
      discoveryReport,
      mountInput,
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      liveRegistrySwapProtection
    })
    const runtimePublicationCommitAdapter = buildThirdPartyDataPackRuntimePublicationCommitAdapter({
      officialRegistrySet: dispatchOptions.officialRegistrySet,
      discoveryReport,
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      liveRegistrySwapProtection,
      publicationRollbackRecovery
    })
    const recoveryLogReplayRestoreAdapter = buildThirdPartyDataPackRecoveryLogReplayRestoreAdapter({
      officialRegistrySet: dispatchOptions.officialRegistrySet,
      discoveryReport,
      mountInput,
      runtimePublicationCommitAdapter
    })
    const modLockWriteProbe = createDeferredModLockWriteProbe(
      recoveryLogReplayRestoreAdapter,
      mountInput.lockfileDraft
    )
    const transactionLogWriteProbe = createDeferredTransactionLogWriteProbe(
      recoveryLogReplayRestoreAdapter,
      mountInput.lockfileDraft
    )
    const modManagementUiIpcPreflight = buildThirdPartyDataPackModManagementUiIpcPreflight({
      modLockWriteProbe,
      transactionLogWriteProbe
    })
    const readModel = buildThirdPartyDataPackModManagementReadModel({
      preflight: modManagementUiIpcPreflight
    })
    const targetPackageId = dispatchOptions.packageId
      ?? runtimePublicationCommitAdapter.loadOrder[0]
      ?? mountInput.loadOrder[0]
      ?? mountInput.selectedPackageIds[0]
    const request = targetPackageId === undefined
      ? {
          commandId: 'install' as const,
          confirmation: {
            commandId: 'install' as const,
            confirmed: dispatchOptions.confirmed
          }
        }
      : {
          commandId: 'install' as const,
          packageId: targetPackageId,
          confirmation: {
            commandId: 'install' as const,
            packageId: targetPackageId,
            confirmed: dispatchOptions.confirmed
          }
        }
    const preflight = buildThirdPartyDataPackTransactionCommandPreflight({
      readModel,
      runtimePublicationCommitAdapter,
      request
    })
    const preflightResult: WebFilePickerSourceInstallCommandPreflightResult = Object.freeze({
      status: preflight.status,
      reason: preflight.reason,
      sourceReady: true,
      fileCount: lastFileCount.value,
      sourceKind: source.identity.kind,
      sourceId: source.identity.sourceId,
      rootPath: source.identity.rootPath,
      preflight,
      effects: lastEffects.value,
      discoveryStatus: discoveryReport.status,
      readModelStatus: readModel.status,
      runtimePublicationCommitAdapterStatus: runtimePublicationCommitAdapter.status,
      selectedPackageIds: preflight.selectedPackageIds,
      loadOrder: preflight.loadOrder
    })

    const installTransactionDispatchPlan = buildThirdPartyDataPackInstallTransactionDispatchPlan({
      transactionCommandPreflight: preflight,
      modLockWriteProbe,
      transactionLogWriteProbe
    })
    const postCommitVerificationPlan = buildThirdPartyDataPackPostCommitVerificationPlan({
      installTransactionDispatchPlan,
      runtimePublicationCommitAdapter
    })
    const transactionCommandDispatcherHandoff = buildThirdPartyDataPackTransactionCommandDispatcherHandoff({
      transactionCommandPreflight: preflight,
      installTransactionDispatchPlan,
      postCommitVerificationPlan
    })
    const dispatcherHost = resolveInstallCommandDispatcherHost(
      dispatchOptions.dispatchTransactionCommand,
      options.dispatchTransactionCommand,
      lastRecord.value !== null
    )
    const readTransactionCommandDispatcherSource = createThirdPartyDataPackTransactionCommandDispatcherSource({
      enabled: true,
      readTransactionCommandDispatcherHandoff: async() => transactionCommandDispatcherHandoff,
      dispatchTransactionCommand: dispatcherHost.host
    })
    let transactionCommandDispatcherSource: ThirdPartyDataPackTransactionCommandDispatcherSourceResult
    try {
      transactionCommandDispatcherSource = await readTransactionCommandDispatcherSource()
    } catch (error) {
      if (error instanceof ThirdPartyDataPackTransactionCommandDispatcherBlockedError) {
        transactionCommandDispatcherSource = error.result
      } else {
        throw error
      }
    }

    const executeInjectedAtomicTransactionCommit = dispatchOptions.executeInjectedAtomicTransactionCommit
      ?? options.executeInjectedAtomicTransactionCommit
    const executeAtomicTransactionCommit = dispatchOptions.executeAtomicTransactionCommit
      ?? options.executeAtomicTransactionCommit
    let atomicTransactionCommitExecutorSource:
      ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult | null = null
    if (
      transactionCommandDispatcherSource.status === 'dispatched'
      && executeInjectedAtomicTransactionCommit !== undefined
    ) {
      const readAtomicTransactionCommitExecutorSource =
        createThirdPartyDataPackAtomicTransactionCommitExecutorPipeline({
          enabled: true,
          readTransactionCommandDispatcherHandoff: async() => transactionCommandDispatcherHandoff,
          readInstallTransactionDispatchPlan: async() => installTransactionDispatchPlan,
          readRuntimePublicationCommitAdapter: async() => runtimePublicationCommitAdapter,
          executeInjectedAtomicTransactionCommit,
          executeAtomicTransactionCommit
        })
      try {
        atomicTransactionCommitExecutorSource = await readAtomicTransactionCommitExecutorSource()
      } catch (error) {
        if (error instanceof ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError) {
          atomicTransactionCommitExecutorSource = error.result
        } else {
          throw error
        }
      }
    }

    const readSettingsLockfileCommitSource = dispatchOptions.readSettingsLockfileCommitSource
      ?? options.readSettingsLockfileCommitSource
    const readPostCommitVerificationExecutorAdapter =
      dispatchOptions.readPostCommitVerificationExecutorAdapter
        ?? options.readPostCommitVerificationExecutorAdapter
    const readPostCommitPersistentState = dispatchOptions.readPostCommitPersistentState
      ?? options.readPostCommitPersistentState
    const executePostCommitVerification = dispatchOptions.executePostCommitVerification
      ?? options.executePostCommitVerification
    let postCommitVerificationReadAcknowledgementSource:
      ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult | null = null
    if (
      atomicTransactionCommitExecutorSource?.status === 'executed'
      && readSettingsLockfileCommitSource !== undefined
      && readPostCommitVerificationExecutorAdapter !== undefined
      && readPostCommitPersistentState !== undefined
      && executePostCommitVerification !== undefined
    ) {
      const readPostCommitVerificationReadAcknowledgementSource =
        createThirdPartyDataPackPostCommitVerificationReadAcknowledgementPipeline({
          enabled: true,
          readSettingsLockfileCommitSource,
          readPostCommitVerificationExecutorAdapter,
          readPostCommitPersistentState,
          executePostCommitVerification
        })
      try {
        postCommitVerificationReadAcknowledgementSource =
          await readPostCommitVerificationReadAcknowledgementSource()
      } catch (error) {
        if (error instanceof ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError) {
          postCommitVerificationReadAcknowledgementSource = error.result
        } else {
          throw error
        }
      }
    }

    const readInstallCommandPostCommitAcknowledgementSource =
      createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource({
        enabled: true,
        readTransactionCommandDispatcherSource: async() => transactionCommandDispatcherSource,
        ...(atomicTransactionCommitExecutorSource === null
          ? {}
          : {
              readAtomicTransactionCommitExecutorSource: async() =>
                atomicTransactionCommitExecutorSource as ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult
            }),
        ...(postCommitVerificationReadAcknowledgementSource === null
          ? {}
          : {
              readPostCommitVerificationReadAcknowledgementSource: async() =>
                postCommitVerificationReadAcknowledgementSource as ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
            })
      })
    let installCommandPostCommitAcknowledgement:
      ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult
    try {
      installCommandPostCommitAcknowledgement = await readInstallCommandPostCommitAcknowledgementSource()
    } catch (error) {
      if (error instanceof ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError) {
        installCommandPostCommitAcknowledgement = error.result
      } else {
        throw error
      }
    }

    let ordinaryInstallTransactionTerminalConnection:
      ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult | null = null
    let installTransactionLogPrepared:
      ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult | null = null
    let installTransactionLogPreparedPersistentReadVerification:
      ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult | null = null
    let installTransactionCommitFinalization:
      ThirdPartyDataPackInstallTransactionCommitFinalizationResult | null = null
    let postCommitUiIpcDeliveryContinuation:
      ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult | null = null
    let runtimePublicationCommitAfterPostCommitVerification:
      ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult | null = null
    let runtimePublicationCommitLiveRegistrySwapHostConnection:
      ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult | null = null
    let runtimePublicationCommitAppStartupReadiness:
      ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult | null = null
    let runtimePublicationCommitAppStartupHostConnection:
      ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult | null = null
    let webPlatformWriterHostConnection:
      ThirdPartyDataPackWebPlatformWriterHostConnectionSourceResult | null = null
    let webStartupPersistentStateWriteStatus:
      WebFilePickerStartupPersistentStateWriteStatus | null = null
    let electronStartupPersistentStateWriteStatus:
      WebFilePickerStartupPersistentStateWriteStatus | null = null
    let rendererLiveRegistrySwapApplied = false
    let rendererOrdinaryInstallTerminalContinuationBlockedReason: string | undefined
    const mountedAppStartupHostEvidence =
      dispatchOptions.mountedAppStartupHostEvidence ?? options.mountedAppStartupHostEvidence
    const rendererOrdinaryInstallTerminalContinuationHost =
      dispatcherHost.kind === 'renderer'
        ? createRendererOrdinaryInstallTerminalContinuationHost(resolveRendererRuntimeHost())
        : undefined
    if (
      dispatcherHost.kind === 'renderer'
      && installCommandPostCommitAcknowledgement.status === 'blocked'
      && targetPackageId !== undefined
      && mountInput.lockfileDraft !== undefined
      && rendererOrdinaryInstallTerminalContinuationHost !== undefined
    ) {
      const packageFilePayload = await readPackageFilePayloadFromSource(
        source,
        mountInput.lockfileDraft,
        targetPackageId
      )
      const continuation = await rendererOrdinaryInstallTerminalContinuationHost({
        transactionCommandDispatcherHandoff,
        installTransactionDispatchPlan,
        runtimePublicationCommitAdapter,
        lockfileDraft: mountInput.lockfileDraft,
        packageFilePayload
      })
      if (continuation.status !== 'ready') {
        rendererOrdinaryInstallTerminalContinuationBlockedReason = continuation.reason
      }
      if (
        continuation.status === 'ready'
        && continuation.installCommandPostCommitAcknowledgement !== undefined
        && continuation.postCommitUiIpcDeliveryContinuation !== undefined
        && continuation.ordinaryInstallTransactionTerminalConnection !== undefined
      ) {
        installCommandPostCommitAcknowledgement = continuation.installCommandPostCommitAcknowledgement
        postCommitUiIpcDeliveryContinuation = continuation.postCommitUiIpcDeliveryContinuation
        ordinaryInstallTransactionTerminalConnection =
          continuation.ordinaryInstallTransactionTerminalConnection
        installTransactionLogPrepared =
          continuation.installTransactionLogPrepared ?? null
        installTransactionLogPreparedPersistentReadVerification =
          continuation.installTransactionLogPreparedPersistentReadVerification ?? null
        installTransactionCommitFinalization =
          continuation.installTransactionCommitFinalization ?? null
        runtimePublicationCommitAfterPostCommitVerification =
          continuation.runtimePublicationCommitAfterPostCommitVerification ?? null
        runtimePublicationCommitLiveRegistrySwapHostConnection =
          continuation.runtimePublicationCommitLiveRegistrySwapHostConnection ?? null
        runtimePublicationCommitAppStartupReadiness =
          continuation.runtimePublicationCommitAppStartupReadiness ?? null
        const continuationRuntimePublicationCommitAppStartupHostConnection =
          continuation.runtimePublicationCommitAppStartupHostConnection ?? null
        runtimePublicationCommitAppStartupHostConnection =
          continuationRuntimePublicationCommitAppStartupHostConnection
        const electronRuntimeContinuationMatchesRendererCandidate =
          runtimeContinuationMatchesRendererCandidate({
            platform: 'electron',
            targetPackageId,
            mountInput,
            runtimePublicationCommitAdapter,
            runtimePublicationCommitAfterPostCommitVerification,
            runtimePublicationCommitLiveRegistrySwapHostConnection,
            runtimePublicationCommitAppStartupReadiness,
            runtimePublicationCommitAppStartupHostConnection:
              continuationRuntimePublicationCommitAppStartupHostConnection
          })
        const electronOrdinaryTerminalSucceeded =
          ordinaryInstallTransactionTerminalSucceeded(ordinaryInstallTransactionTerminalConnection)
        const electronRuntimeContinuationEligible =
          electronRuntimeContinuationMatchesRendererCandidate
          && electronOrdinaryTerminalSucceeded
        if (electronRuntimeContinuationMatchesRendererCandidate && !electronOrdinaryTerminalSucceeded) {
          rendererOrdinaryInstallTerminalContinuationBlockedReason =
            ordinaryInstallTransactionTerminalConnection.reason
        }
        if (
          electronRuntimeContinuationEligible
          && runtimePublicationCommitAfterPostCommitVerification !== null
          && runtimePublicationCommitLiveRegistrySwapHostConnection !== null
        ) {
          const rendererRuntimePublicationCommitAfterPostCommitVerification =
            runtimePublicationCommitAfterPostCommitVerification
          const rendererRuntimePublicationCommitLiveRegistrySwapHostConnection =
            runtimePublicationCommitLiveRegistrySwapHostConnection
          const rendererRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection =
            await createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline({
              enabled: true,
              readRuntimePublicationCommitAfterPostCommitVerification: async() =>
                rendererRuntimePublicationCommitAfterPostCommitVerification,
              readRuntimePublicationNormalStartupAppFactoryBindingHostConnection: async() =>
                createRendererReadyNormalStartupSource(
                  runtimePublicationCommitAdapter,
                  'electron',
                  mountedAppStartupHostEvidence
                )
            })()
          runtimePublicationCommitAppStartupReadiness =
            await createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline({
              enabled: true,
              readRuntimePublicationCommitLiveRegistrySwapHostConnection: async() =>
                rendererRuntimePublicationCommitLiveRegistrySwapHostConnection,
              readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection: async() =>
                rendererRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection
            })()
          runtimePublicationCommitAppStartupHostConnection =
            await createRendererAppStartupHostConnectionFromReadiness({
              platform: 'electron',
              runtimePublicationCommitAppStartupReadiness,
              mountedAppStartupHostEvidence
            })
        }
        if (electronRuntimeContinuationEligible) {
          rendererLiveRegistrySwapApplied = await applySharedRendererLiveRegistrySwapFromVerifiedContinuation({
            platform: 'electron',
            targetPackageId,
            mountInput,
            runtimePublicationCommitAdapter,
            runtimePublicationCommitAfterPostCommitVerification,
            runtimePublicationCommitLiveRegistrySwapHostConnection,
            runtimePublicationCommitAppStartupReadiness,
            runtimePublicationCommitAppStartupHostConnection
          })
        }
        const electronStartupPersistentStateSnapshotWritten =
          continuation.startupPersistentStateSnapshotWrite?.status === 'written'
        electronStartupPersistentStateWriteStatus =
          electronStartupPersistentStateSnapshotWritten
            ? (rendererLiveRegistrySwapApplied ? 'written' : 'blocked')
            : null
      }
    }

    if (
      dispatcherHost.kind === 'web'
      && installCommandPostCommitAcknowledgement.status === 'blocked'
      && targetPackageId !== undefined
      && mountInput.lockfileDraft !== undefined
      && mountInput.candidateRegistrySet !== undefined
      && mountInput.candidateIdentity !== undefined
      && mountInput.lockfileHash !== undefined
      && runtimePublicationCommitAdapter.candidateIdentity !== undefined
      && runtimePublicationCommitAdapter.lockfileHash !== undefined
      && lastRecord.value !== null
    ) {
      const webSettingsLockfileStore = resolveWebSettingsLockfileStore(
        dispatchOptions.webSettingsLockfileStore,
        options.webSettingsLockfileStore
      )
      if (webSettingsLockfileStore === null) {
        rendererOrdinaryInstallTerminalContinuationBlockedReason =
          'Web visible import ordinary continuation requires Web settings-lockfile persistent writer storage'
      }
      const webInstallTransactionLogStore = resolveWebInstallTransactionLogStore(
        dispatchOptions.webInstallTransactionLogStore,
        options.webInstallTransactionLogStore
      )
      if (webInstallTransactionLogStore === null) {
        rendererOrdinaryInstallTerminalContinuationBlockedReason =
          'Web visible import ordinary continuation requires Web install transaction-log IndexedDB storage'
      }
      const packageFilePayload = await readPackageFilePayloadFromSource(
        source,
        mountInput.lockfileDraft,
        targetPackageId
      )
      if (packageFilePayload.length === 0) {
        rendererOrdinaryInstallTerminalContinuationBlockedReason =
          'Web visible import ordinary continuation requires persisted package file payload'
      } else if (webSettingsLockfileStore !== null && webInstallTransactionLogStore !== null) {
        try {
          webPlatformWriterHostConnection = await connectWebSettingsLockfileWriter({
            store: webSettingsLockfileStore,
            mountInput,
            targetPackageId
          })
        } catch (error) {
          if (error instanceof ThirdPartyDataPackWebPlatformWriterHostConnectionBlockedError) {
            webPlatformWriterHostConnection = error.result
          } else {
            throw error
          }
        }
        if (webPlatformWriterHostConnection.status !== 'connected') {
          rendererOrdinaryInstallTerminalContinuationBlockedReason =
            webPlatformWriterHostConnection.reason
        } else {
          installCommandPostCommitAcknowledgement =
            createWebInstallCommandPostCommitAcknowledgement(
              transactionCommandDispatcherSource,
              mountInput,
              targetPackageId
            )
          installTransactionLogPrepared =
            await createWebInstallTransactionLogPrepared({
              store: webInstallTransactionLogStore,
              mountInput,
              targetPackageId,
              packageFilePayload,
              webPlatformWriterHostConnection
            })
          if (installTransactionLogPrepared.status !== 'prepared') {
            rendererOrdinaryInstallTerminalContinuationBlockedReason =
              installTransactionLogPrepared.reason
          } else {
            installTransactionLogPreparedPersistentReadVerification =
              await createWebInstallTransactionLogPreparedReadVerification(
                webInstallTransactionLogStore,
                installTransactionLogPrepared
              )
            if (installTransactionLogPreparedPersistentReadVerification.status !== 'verified') {
              rendererOrdinaryInstallTerminalContinuationBlockedReason =
                installTransactionLogPreparedPersistentReadVerification.reason
            } else {
              installTransactionCommitFinalization =
                await createWebInstallTransactionCommitFinalization(
                  installTransactionLogPreparedPersistentReadVerification
                )
            }
          }

          if (installTransactionCommitFinalization?.status === 'committed') {
            postCommitUiIpcDeliveryContinuation =
              createWebPostCommitUiIpcDeliveryContinuation(installTransactionCommitFinalization)
            ordinaryInstallTransactionTerminalConnection =
              createWebOrdinaryInstallTransactionTerminalConnection(postCommitUiIpcDeliveryContinuation)

            const runtimePublicationContinuation =
              await createWebRuntimePublicationContinuationResults({
                officialRegistrySet: dispatchOptions.officialRegistrySet,
                mountInput,
                runtimePublicationPreflight,
                transactionPreCommitPlan,
                liveRegistrySwapProtection,
                publicationRollbackRecovery,
                runtimePublicationCommitAdapter,
                installTransactionCommitFinalization,
                mountedAppStartupHostEvidence
              })
            runtimePublicationCommitAfterPostCommitVerification =
              runtimePublicationContinuation.runtimePublicationCommitAfterPostCommitVerification
            runtimePublicationCommitLiveRegistrySwapHostConnection =
              runtimePublicationContinuation.runtimePublicationCommitLiveRegistrySwapHostConnection
            runtimePublicationCommitAppStartupReadiness =
              runtimePublicationContinuation.runtimePublicationCommitAppStartupReadiness
            runtimePublicationCommitAppStartupHostConnection =
              runtimePublicationContinuation.runtimePublicationCommitAppStartupHostConnection
            rendererLiveRegistrySwapApplied =
              await applySharedRendererLiveRegistrySwapFromVerifiedContinuation({
                platform: 'web',
                targetPackageId,
                mountInput,
                runtimePublicationCommitAdapter,
                runtimePublicationCommitAfterPostCommitVerification,
                runtimePublicationCommitLiveRegistrySwapHostConnection,
                runtimePublicationCommitAppStartupReadiness,
                runtimePublicationCommitAppStartupHostConnection
              })
            webStartupPersistentStateWriteStatus =
              await persistWebStartupPersistentStateSnapshot({
                store: resolveWebStartupPersistentStateStore(
                  dispatchOptions.startupPersistentStateStore,
                  options.startupPersistentStateStore,
                  options.persistenceStore
                ),
                targetPackageId,
                mountInput,
                installTransactionCommitFinalization,
                runtimePublicationCommitLiveRegistrySwapHostConnection,
                runtimePublicationCommitAppStartupHostConnection,
                rendererLiveRegistrySwapApplied
              })
          } else if (installTransactionCommitFinalization !== null) {
            rendererOrdinaryInstallTerminalContinuationBlockedReason =
              installTransactionCommitFinalization.reason
          }
        }
      }
    }

    const readPostCommitUiIpcDeliveryContinuationSource =
      dispatchOptions.readPostCommitUiIpcDeliveryContinuationSource
        ?? options.readPostCommitUiIpcDeliveryContinuationSource
    if (
      installCommandPostCommitAcknowledgement.status === 'ready'
      && postCommitUiIpcDeliveryContinuation === null
      && readPostCommitUiIpcDeliveryContinuationSource !== undefined
    ) {
      try {
        postCommitUiIpcDeliveryContinuation =
          await readPostCommitUiIpcDeliveryContinuationSource()
      } catch (error) {
        if (error instanceof ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError) {
          postCommitUiIpcDeliveryContinuation = error.result
        } else {
          throw error
        }
      }
    }

    const result = extendDispatchResult(preflightResult, {
      reason: rendererOrdinaryInstallTerminalContinuationBlockedReason,
      installTransactionDispatchPlan,
      postCommitVerificationPlan,
      transactionCommandDispatcherHandoff,
      transactionCommandDispatcherSource,
      atomicTransactionCommitExecutorSource,
      postCommitVerificationReadAcknowledgementSource,
      installCommandPostCommitAcknowledgement,
      postCommitUiIpcDeliveryContinuation,
      ordinaryInstallTransactionTerminalConnection,
      installTransactionLogPrepared,
      installTransactionLogPreparedPersistentReadVerification,
      installTransactionCommitFinalization,
      runtimePublicationCommitAfterPostCommitVerification,
      runtimePublicationCommitLiveRegistrySwapHostConnection,
      runtimePublicationCommitAppStartupReadiness,
      runtimePublicationCommitAppStartupHostConnection,
      webPlatformWriterHostConnection,
      webStartupPersistentStateWriteStatus,
      electronStartupPersistentStateWriteStatus,
      rendererLiveRegistrySwapApplied,
      transactionCommandDispatcherHostKind: dispatcherHost.kind
    })
    lastInstallCommandPreflight.value = result
    lastSourceInstallCommandPreflight.value = preflightResult
    lastSourceInstallCommandDispatch.value = result
    return result
  }

  const reset = async(): Promise<void> => {
    await disposeLastSource()
    status.value = 'idle'
    lastRecord.value = null
    lastError.value = null
    lastEffects.value = emptyEffects
    lastFileCount.value = 0
    lastInstallCommandPreflight.value = null
    lastSourceInstallCommandPreflight.value = null
    lastSourceInstallCommandDispatch.value = null
  }

  return {
    status,
    isBusy,
    runtimeBoundaryClosed,
    lastSource,
    lastRecord,
    lastError,
    lastEffects,
    lastFileCount,
    lastInstallCommandPreflight,
    lastSourceInstallCommandPreflight,
    lastSourceInstallCommandDispatch,
    pickFiles,
    importFiles,
    restorePersistedImport,
    restoreElectronInstalledSource,
    prepareInstallCommandPreflight,
    prepareInstallCommandPreflightFromSource,
    dispatchInstallCommandFromSource,
    reset
  }
}
