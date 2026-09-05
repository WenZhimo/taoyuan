import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, session } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import pkg from '../package.json'
import officialCacheMetadata from '../src/generated/mods/official-precompiled-metadata.json'
import officialPrecompiledRegistryArtifact from '../src/generated/mods/official-precompiled-registry.json'
import {
  getOfficialRegistryCacheFilePaths,
  readOfficialRegistryCacheFile,
  writeOfficialRegistryCacheFile
} from '../src/domain/mods/officialRegistryCacheFile'
import { createElectronThirdPartyDataPackModLockStorageProbe } from '../src/domain/mods/electronModLockStorageProbe'
import {
  createElectronReadonlyDirectoryNodeHost,
  toElectronReadonlyDirectorySourceIpcResult
} from '../src/domain/mods/electronReadonlyDirectorySourceHost'
import {
  createDiscoveryFileSystemFromContentPackageSource,
  createMemoryContentPackageSource
} from '../src/domain/mods/contentPackageSource'
import {
  discoverThirdPartyDataPacks
} from '../src/domain/mods/thirdPartyDataPackDiscovery'
import {
  createThirdPartyDataPackElectronIpcResponseDeliveryMainHandler,
  thirdPartyDataPackElectronResponseDeliveryIpcChannel
} from '../src/domain/mods/thirdPartyDataPackElectronIpcResponseDeliveryBridge'
import {
  createThirdPartyDataPackElectronInstallCommandDispatchMainHandler,
  thirdPartyDataPackElectronInstallCommandDispatchIpcChannel
} from '../src/domain/mods/thirdPartyDataPackElectronInstallCommandDispatchBridge'
import {
  thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationIpcChannel
} from '../src/domain/mods/thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationBridge'
import {
  createThirdPartyDataPackElectronStartupPersistentStateReadMainHandler,
  thirdPartyDataPackElectronStartupPersistentStateReadIpcChannel
} from '../src/domain/mods/thirdPartyDataPackElectronStartupPersistentStateIpcBridge'
import {
  createThirdPartyDataPackElectronDisableCommandMainHandler,
  thirdPartyDataPackElectronDisableCommandIpcChannel
} from '../src/domain/mods/thirdPartyDataPackElectronDisableCommandBridge'
import {
  createThirdPartyDataPackElectronEnableCommandMainHandler,
  thirdPartyDataPackElectronEnableCommandIpcChannel
} from '../src/domain/mods/thirdPartyDataPackElectronEnableCommandBridge'
import {
  createThirdPartyDataPackElectronUninstallCommandMainHandler,
  thirdPartyDataPackElectronUninstallCommandIpcChannel
} from '../src/domain/mods/thirdPartyDataPackElectronUninstallCommandBridge'
import {
  createThirdPartyDataPackElectronInstalledStateReadMainHandler,
  thirdPartyDataPackElectronInstalledStateReadIpcChannel
} from '../src/domain/mods/thirdPartyDataPackElectronInstalledStateBridge'
import {
  createThirdPartyDataPackElectronStartupPersistentStateSourceHost,
  resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths
} from '../src/domain/mods/thirdPartyDataPackElectronStartupPersistentStateSourceHost'
import {
  createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline
} from '../src/domain/mods/thirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline'
import {
  createThirdPartyDataPackInstallCommandLifecyclePipeline
} from '../src/domain/mods/thirdPartyDataPackInstallCommandLifecyclePipeline'
import {
  createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource,
  ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError
} from '../src/domain/mods/thirdPartyDataPackInstallCommandPostCommitAcknowledgementSource'
import {
  createThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource,
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionBlockedError
} from '../src/domain/mods/thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource'
import {
  createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline
} from '../src/domain/mods/thirdPartyDataPackInstallTransactionCommitFinalizationPipeline'
import {
  createThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline,
  createThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter
} from '../src/domain/mods/thirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline'
import {
  createThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline
} from '../src/domain/mods/thirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline
} from '../src/domain/mods/thirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline
} from '../src/domain/mods/thirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline
} from '../src/domain/mods/thirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline
} from '../src/domain/mods/thirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline
} from '../src/domain/mods/thirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline'
import {
  buildThirdPartyDataPackRuntimePublicationCommitAdapter
} from '../src/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
import {
  buildThirdPartyDataPackRuntimePublicationPreflight
} from '../src/domain/mods/thirdPartyDataPackRuntimePublicationPreflight'
import {
  buildThirdPartyDataPackTransactionPreCommitPlan
} from '../src/domain/mods/thirdPartyDataPackTransactionPreCommitPlan'
import {
  createThirdPartyDataPackTransactionCommandDispatcherSource,
  ThirdPartyDataPackTransactionCommandDispatcherBlockedError
} from '../src/domain/mods/thirdPartyDataPackTransactionCommandDispatcherSource'
import {
  createThirdPartyDataPackRuntimePublicationCommitSource
} from '../src/domain/mods/thirdPartyDataPackRuntimePublicationCommitSource'
import {
  createThirdPartyDataPackRuntimePublicationCommitHost
} from '../src/domain/mods/thirdPartyDataPackRuntimePublicationCommitHost'
import {
  buildThirdPartyDataPackLiveRegistrySwapProtection
} from '../src/domain/mods/thirdPartyDataPackLiveRegistrySwapProtection'
import {
  buildThirdPartyDataPackPublicationRollbackRecovery
} from '../src/domain/mods/thirdPartyDataPackPublicationRollbackRecovery'
import {
  createThirdPartyDataPackInMemoryLiveRegistryReference
} from '../src/domain/mods/thirdPartyDataPackLiveRegistrySwapHost'
import {
  createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline
} from '../src/domain/mods/thirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline'
import {
  buildThirdPartyDataPackMountInput
} from '../src/domain/mods/thirdPartyDataPackMountInput'
import {
  createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline
} from '../src/domain/mods/thirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline'
import {
  ThirdPartyDataPackOrdinaryInstallTransactionBlockedError
} from '../src/domain/mods/thirdPartyDataPackOrdinaryInstallTransactionPipeline'
import {
  createThirdPartyDataPackRollbackRecoveryExecutionPipeline
} from '../src/domain/mods/thirdPartyDataPackRollbackRecoveryExecutionPipeline'
import {
  createThirdPartyDataPackRecoveryLogReplayRestorePipeline
} from '../src/domain/mods/thirdPartyDataPackRecoveryLogReplayRestorePipeline'
import {
  buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract
} from '../src/domain/mods/thirdPartyDataPackAtomicTransactionCommitOutcomeContract'
import {
  createThirdPartyDataPackPackageFilePersistentStagingPipeline
} from '../src/domain/mods/thirdPartyDataPackPackageFilePersistentStagingPipeline'
import {
  ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError
} from '../src/domain/mods/thirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource'
import {
  createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline
} from '../src/domain/mods/thirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline'
import {
  restoreOfficialPrecompiledRegistryArtifact
} from '../src/domain/mods/officialPrecompiled'
import {
  OFFICIAL_REGISTRY_DEFINITIONS
} from '../src/domain/mods/officialRegistryDefinitions'
import {
  createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter,
  runThirdPartyDataPackPackageFilePersistentRestoreProbe
} from '../src/domain/mods/thirdPartyDataPackPackageFilePersistentWriteProbe'
import {
  configureElectronProgramDirectoryUserData,
  ELECTRON_PROGRAM_DIRECTORY_USERDATA_REQUIRED_REASON,
  resolveElectronProgramDirectoryUserDataPath
} from '../src/domain/mods/electronProgramDirectoryUserDataPolicy'
import { hashCanonicalJson } from '../src/domain/mods/hash'

const runtimeProbeOutputPath = typeof process.env.TAOYUAN_RUNTIME_PROBE_OUTPUT === 'string'
  && path.isAbsolute(process.env.TAOYUAN_RUNTIME_PROBE_OUTPUT)
  ? process.env.TAOYUAN_RUNTIME_PROBE_OUTPUT
  : null
const runtimeProbeEnabled = runtimeProbeOutputPath !== null
const runtimeProbeFault = ['missing', 'corrupt', 'environment-mismatch']
  .includes(process.env.TAOYUAN_RUNTIME_PROBE_FAULT)
  ? process.env.TAOYUAN_RUNTIME_PROBE_FAULT
  : null
const runtimeProbeAutoExit = process.env.TAOYUAN_RUNTIME_PROBE_AUTO_EXIT === '1'
const runtimeProbeModLockWriteRead = process.env.TAOYUAN_RUNTIME_PROBE_MOD_LOCK_WRITE_READ === '1'
const runtimeProbeSettingsLockfileWriteRead =
  process.env.TAOYUAN_RUNTIME_PROBE_SETTINGS_LOCKFILE_WRITE_READ === '1'
const runtimeProbePackageFileWriteRead =
  process.env.TAOYUAN_RUNTIME_PROBE_PACKAGE_FILE_WRITE_READ === '1'
const runtimeProbePackageFileRestore =
  process.env.TAOYUAN_RUNTIME_PROBE_PACKAGE_FILE_RESTORE === '1'
const runtimeProbeInstallTransactionCommitFinalization =
  process.env.TAOYUAN_RUNTIME_PROBE_INSTALL_TRANSACTION_COMMIT_FINALIZATION === '1'
const runtimeProbeInstallCommandLifecycle =
  process.env.TAOYUAN_RUNTIME_PROBE_INSTALL_COMMAND_LIFECYCLE === '1'
const runtimeProbeInstallCommandDispatchIpc =
  process.env.TAOYUAN_RUNTIME_PROBE_INSTALL_COMMAND_DISPATCH_IPC === '1'
const runtimeProbeOrdinaryInstallTerminalConnection =
  process.env.TAOYUAN_RUNTIME_PROBE_ORDINARY_INSTALL_TERMINAL_CONNECTION === '1'
const runtimeProbeOrdinaryInstallTerminalRollback =
  process.env.TAOYUAN_RUNTIME_PROBE_ORDINARY_INSTALL_TERMINAL_ROLLBACK === '1'
const runtimeProbeOrdinaryInstallTerminalSuccess =
  runtimeProbeOrdinaryInstallTerminalConnection && !runtimeProbeOrdinaryInstallTerminalRollback
const runtimeProbeStartupGateReady =
  process.env.TAOYUAN_RUNTIME_PROBE_STARTUP_GATE_READY === '1'
const runtimeProbeStartupPersistentState =
  process.env.TAOYUAN_RUNTIME_PROBE_STARTUP_PERSISTENT_STATE === '1'
const runtimeProbeStartupPersistentStateInstalledState =
  process.env.TAOYUAN_RUNTIME_PROBE_STARTUP_PERSISTENT_STATE_INSTALLED_STATE === '1'
const runtimeProbeVisibleImport =
  process.env.TAOYUAN_RUNTIME_PROBE_VISIBLE_IMPORT === '1'
const runtimeProbeVisibleImportRollback =
  process.env.TAOYUAN_RUNTIME_PROBE_VISIBLE_IMPORT_ROLLBACK === '1'
const runtimeProbeVisibleImportFailure =
  process.env.TAOYUAN_RUNTIME_PROBE_VISIBLE_IMPORT_FAILURE === '1'
const runtimeProbeVisibleDisable =
  process.env.TAOYUAN_RUNTIME_PROBE_VISIBLE_DISABLE === '1'
const runtimeProbeVisibleDisableFailAfterModLockWrite =
  runtimeProbeEnabled
  && runtimeProbeVisibleDisable
  && process.env.TAOYUAN_RUNTIME_PROBE_VISIBLE_DISABLE_FAIL_AFTER_MOD_LOCK_WRITE === '1'
const runtimeProbeVisibleEnable =
  process.env.TAOYUAN_RUNTIME_PROBE_VISIBLE_ENABLE === '1'
const runtimeProbeVisibleUpgrade =
  process.env.TAOYUAN_RUNTIME_PROBE_VISIBLE_UPGRADE === '1'
const runtimeProbeVisibleUninstall =
  process.env.TAOYUAN_RUNTIME_PROBE_VISIBLE_UNINSTALL === '1'
const runtimeProbeVisibleUninstallFailAfterModLockWrite =
  runtimeProbeEnabled
  && runtimeProbeVisibleUninstall
  && process.env.TAOYUAN_RUNTIME_PROBE_VISIBLE_UNINSTALL_FAIL_AFTER_MOD_LOCK_WRITE === '1'
const runtimeProbeVisibleDataPackOperation =
  runtimeProbeVisibleImport
  || runtimeProbeVisibleImportRollback
  || runtimeProbeVisibleImportFailure
  || runtimeProbeVisibleDisable
  || runtimeProbeVisibleEnable
  || runtimeProbeVisibleUpgrade
  || runtimeProbeVisibleUninstall
const runtimeProbeRendererUiIpcProductSurfaceExpected =
  !runtimeProbeVisibleDataPackOperation
  || runtimeProbeInstallTransactionCommitFinalization
  || runtimeProbeOrdinaryInstallTerminalSuccess

const getExecutableDirectoryPath = () =>
  process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath)

const getExecutableUserDataPath = () =>
  resolveElectronProgramDirectoryUserDataPath(getExecutableDirectoryPath()).userDataPath

const getExecutableModsPath = () => path.join(
  getExecutableDirectoryPath(),
  'mods'
)

const configurePackagedUserData = () => {
  try {
    configureElectronProgramDirectoryUserData({
      app,
      fileSystem: {
        writeAccessMode: fs.constants.W_OK,
        mkdirSync: fs.mkdirSync,
        accessSync: fs.accessSync,
        existsSync: fs.existsSync,
        cpSync: fs.cpSync
      },
      programDirectoryPath: getExecutableDirectoryPath(),
      migrateExistingData: !runtimeProbeEnabled,
      migrationEntries: ['Local Storage', 'settings.json']
    })
  } catch (error) {
    console.error(ELECTRON_PROGRAM_DIRECTORY_USERDATA_REQUIRED_REASON)
    throw error
  }
}

configurePackagedUserData()

// 应用根目录（开发时是项目根目录，打包后是 app.asar）
const appRoot = app.getAppPath()

// preload 路径
const preloadPath = path.join(appRoot, 'dist-electron', 'preload.js')

// 构建产物路径（Vite 输出到 docs/）
const docsPath = path.join(appRoot, 'docs')

// 静态资源路径
const publicPath = path.join(appRoot, 'public')

// 设置文件路径
const settingsPath = path.join(app.getPath('userData'), 'settings.json')
const startupLogPath = path.join(app.getPath('userData'), 'startup.log')
const officialCachePaths = getOfficialRegistryCacheFilePaths(
  app.getPath('userData'),
  officialCacheMetadata.environmentHash
)
const electronReadonlyDirectorySourceHost = createElectronReadonlyDirectoryNodeHost(getExecutableModsPath())
const thirdPartyDataPackResponseDeliveryHandler =
  createThirdPartyDataPackElectronIpcResponseDeliveryMainHandler()
const thirdPartyDataPackStartupPersistentStateReadHandler =
  createThirdPartyDataPackElectronStartupPersistentStateReadMainHandler(
    createThirdPartyDataPackElectronStartupPersistentStateSourceHost({
      programDirectoryPath: () => process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath)
    })
  )
let thirdPartyDataPackInstallCommandDispatchIpcProof = null
const thirdPartyDataPackInstallCommandDispatchHandler =
  createThirdPartyDataPackElectronInstallCommandDispatchMainHandler({
    onDispatched: proof => {
      thirdPartyDataPackInstallCommandDispatchIpcProof = proof
    }
  })
const isOfficialRegistryDiskCacheAvailable = () => {
  if (!app.isPackaged) return false
  return path.resolve(app.getPath('userData')) === path.resolve(getExecutableUserDataPath())
}
const startupLogInitialStat = fs.existsSync(startupLogPath)
  ? fs.statSync(startupLogPath)
  : null

const isPathInside = (parent, candidate) => {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate))
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

const probeSha = fill => `sha256:${fill.repeat(64)}`
const syntheticPackageId = 'product_probe_pack'
const syntheticPackageRoot = 'product-probe-pack'
const syntheticRegistryId = 'taoyuan:item'
const syntheticItemId = `${syntheticPackageId}:linen_ribbon`

const createSyntheticPackageManifest = () => ({
  id: syntheticPackageId,
  name: {
    key: 'product_probe_pack.package.name',
    fallback: 'Product Probe Pack'
  },
  version: '1.0.0',
  gameVersion: pkg.version,
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: {},
  authors: [
    {
      name: 'Product Probe',
      role: 'developer'
    }
  ],
  license: 'MIT',
  dependencies: [],
  entrypoints: {
    [syntheticRegistryId]: ['data/items.json']
  }
})

const createSyntheticPackageItem = () => ({
  id: syntheticItemId,
  name: {
    key: 'product_probe_pack.item.linen_ribbon.name',
    fallback: 'Product Probe Linen Ribbon'
  },
  category: 'gift',
  description: {
    key: 'product_probe_pack.item.linen_ribbon.description',
    fallback: 'Synthetic item used by the packaged runtime probe.'
  },
  sellPrice: 8,
  edible: false,
  tags: ['product_probe_pack:soft_gift']
})

const createSyntheticPackageFilePayload = () => {
  const manifest = createSyntheticPackageManifest()
  const item = createSyntheticPackageItem()
  return [
    {
      path: 'manifest.json',
      contents: `${JSON.stringify(manifest, null, 2)}\n`
    },
    {
      path: 'data/items.json',
      contents: `${JSON.stringify([item], null, 2)}\n`
    }
  ]
}

const createSyntheticModLockDraft = () => {
  const manifest = createSyntheticPackageManifest()
  const item = createSyntheticPackageItem()
  const manifestHash = hashCanonicalJson(manifest)
  const contentFiles = [
    {
      registryId: syntheticRegistryId,
      path: 'data/items.json',
      entryCount: 1,
      entries: [
        {
          registryId: syntheticRegistryId,
          contentId: syntheticItemId,
          index: 0,
          canonicalHash: hashCanonicalJson(item)
        }
      ]
    }
  ]
  const body = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity: {
      artifactHash: officialCacheMetadata.artifactHash,
      contentHash: officialCacheMetadata.contentHash,
      schemaSetHash: officialCacheMetadata.schemaSetHash,
      environmentHash: officialCacheMetadata.environmentHash,
      snapshotHash: officialCacheMetadata.snapshotHash,
      registryCount: 54,
      entryCount: 4242
    },
    candidateIdentity: {
      formatVersion: 1,
      contentHash: probeSha('a'),
      snapshotHash: probeSha('b'),
      candidateHash: probeSha('c')
    },
    registryCount: 55,
    entryCount: 4243,
    selectedPackageIds: [syntheticPackageId],
    loadOrder: [syntheticPackageId],
    packages: [
      {
        packageId: syntheticPackageId,
        version: '1.0.0',
        loadIndex: 0,
        source: {
          candidatePath: syntheticPackageRoot,
          manifestPath: `${syntheticPackageRoot}/manifest.json`,
          contentFiles: [`${syntheticPackageRoot}/data/items.json`]
        },
        manifestHash,
        contentHash: hashCanonicalJson({
          manifestHash,
          contentFiles
        }),
        configurationHash: probeSha('f'),
        resolvedDependencies: [],
        contentFiles
      }
    ]
  }

  return {
    ...body,
    lockfileHash: hashCanonicalJson(body)
  }
}

const createSyntheticInstallPersistentStagingLifecycleResult = (draft, packageResult) => ({
  kind: 'third-party-install-persistent-staging-lifecycle-pipeline',
  mode: 'default-disabled-install-persistent-staging-lifecycle-pipeline',
  status: 'ready',
  reason: 'product runtime probe supplies path-free install persistent staging lifecycle acknowledgement',
  readOnly: false,
  enabled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  packageFilePersistentStagingPipelineStatus: packageResult?.status ?? 'written',
  installCommandLifecyclePipelineStatus: 'ready',
  requestedCommandId: 'install',
  targetPackageId: draft.selectedPackageIds[0],
  selectedPackageIds: draft.selectedPackageIds,
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: draft.loadOrder,
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  packageCount: draft.packages.length,
  candidateIdentity: draft.candidateIdentity,
  candidateHash: draft.candidateIdentity.candidateHash,
  lockfileHash: draft.lockfileHash,
  persistentWriteExecuted: packageResult?.persistentWriteExecuted ?? true,
  writtenFileCount: packageResult?.writtenFileCount ?? 1,
  backedUpFileCount: packageResult?.backedUpFileCount ?? 0,
  verificationOutcomeKind: 'verified',
  checks: [],
  diagnostics: [],
  effects: {
    installPersistentStagingLifecyclePipelineCalled: true,
    packageFilePersistentStagingPipelineCalled: true,
    installCommandLifecyclePipelineCalled: true,
    packageFilePersistentWriteAcknowledged: true,
    installCommandLifecycleAcknowledged: true,
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
    packageFilesWritten: packageResult?.effects?.packageFilesWritten ?? true,
    packageBackupsWritten: packageResult?.effects?.packageBackupsWritten ?? false,
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
  }
})

const createSyntheticSettingsLockfileCommitSourceResult = draft => ({
  kind: 'third-party-settings-lockfile-commit-source',
  mode: 'default-disabled-settings-lockfile-commit-source',
  status: 'accepted',
  reason: 'product runtime probe supplies a path-free settings-lockfile commit acknowledgement',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  packageFileStagingSourceStatus: 'accepted',
  packageFileStagingHostStatus: 'accepted',
  settingsLockfileCommitHostStatus: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: draft.selectedPackageIds[0],
  selectedPackageIds: draft.selectedPackageIds,
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: draft.loadOrder,
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  packageCount: draft.packages.length,
  candidateIdentity: draft.candidateIdentity,
  lockfileHash: draft.lockfileHash,
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  diagnostics: [],
  effects: {
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
  }
})

const createSyntheticInstallTransactionCommitConnectionHostResult = envelope => ({
  status: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  persistentPackageWriteExecuted: envelope.persistentPackageWriteExecuted,
  persistentSettingsLockfileWriteExecuted: envelope.persistentSettingsLockfileWriteExecuted,
  writtenFileCount: envelope.writtenFileCount,
  backedUpFileCount: envelope.backedUpFileCount,
  diagnostics: [],
  effects: {
    installTransactionCommitConnectionHostCalled: true,
    installTransactionCommitConnectionHostAccepted: true,
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
  }
})

const createSyntheticAtomicCommitPreflightResult = draft => ({
  status: 'deferred',
  transactionCommandDispatcherHandoffStatus: 'deferred',
  installTransactionDispatchPlanStatus: 'deferred',
  runtimePublicationCommitAdapterStatus: 'deferred',
  reason: 'product runtime probe supplies a path-free atomic transaction commit preflight acknowledgement',
  requestedCommandId: 'install',
  targetPackageId: draft.selectedPackageIds[0],
  selectedPackageIds: draft.selectedPackageIds,
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: draft.loadOrder,
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  packageCount: draft.packages.length,
  candidateIdentity: draft.candidateIdentity,
  lockfileHash: draft.lockfileHash,
  atomicTransactionCommitExecutorPreflight: 'deferred',
  readOnly: true,
  atomicCommitExecutionAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimePublicationCommitAllowed: false,
  runtimeEnablementAllowed: false,
  postCommitVerificationAllowed: false,
  uiIpcResponseAllowed: false,
  rollbackRecoveryAllowed: false,
  executorChecks: [],
  executorStages: [],
  executorRequirements: [],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  diagnostics: [],
  effects: {
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
  }
})

const createSyntheticNoRealLifecycleEffects = () => ({
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

const createSyntheticRollbackOutcomeContract = draft =>
  buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract({
    preflight: createSyntheticAtomicCommitPreflightResult(draft),
    outcome: {
      kind: 'rollback',
      settled: true,
      packageId: draft.selectedPackageIds[0],
      candidateIdentity: draft.candidateIdentity,
      lockfileHash: draft.lockfileHash,
      messageKey: 'mods.atomic.commit.install.rollback',
      recovery: 'restore-backup',
      retryable: false,
      rollbackRequired: true,
      diagnostics: []
    }
  })

const createRealRecoveryLogReplayRestoreHostResult = (envelope, restoreResult) => ({
  status: 'accepted',
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  replayRestoreStageIds: envelope.replayRestoreStageIds,
  requiredReplayRestoreAdapterIds: envelope.requiredReplayRestoreAdapterIds,
  diagnostics: [],
  effects: {
    ...createSyntheticNoRealLifecycleEffects(),
    recoveryLogReplayRestoreHostCalled: true,
    recoveryLogReplayRestoreHostAccepted: true,
    realRecoveryLogReplayRestoreCalled: true,
    recoveryLogRead: true,
    recoveryLogReplayed: true,
    packageFilesRestored: restoreResult.effects.packageFilesRestored === true,
    rollbackExecuted: restoreResult.effects.rollbackExecuted === true
  }
})

const createSyntheticRollbackRecoveryExecutionHostResult = (
  envelope,
  restoreResult,
  recoveryLogReplayRestoreSource
) => ({
  status: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: envelope.targetPackageId,
  outcomeKind: envelope.outcomeKind,
  messageKey: envelope.messageKey,
  recovery: envelope.recovery,
  retryable: envelope.retryable,
  rollbackRequired: true,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  blockedCandidateCount: envelope.blockedCandidateCount,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateHash,
  lockfileHash: envelope.lockfileHash,
  rollbackRecoverySettlementStatus: 'ready',
  rollbackRecoverySettled: true,
  diagnostics: [],
  effects: {
    ...createSyntheticNoRealLifecycleEffects(),
    rollbackRecoveryExecutionHostCalled: true,
    rollbackRecoveryExecutionHostAccepted: true,
    rollbackRecoveryExecutionAcknowledged: true,
    commandContinuationAllowed: true,
    uiIpcResultContinuationAllowed: true,
    realRecoveryLogReplayRestoreCalled:
      recoveryLogReplayRestoreSource?.effects?.realRecoveryLogReplayRestoreCalled === true,
    recoveryLogRead: recoveryLogReplayRestoreSource?.effects?.recoveryLogRead === true,
    recoveryLogReplayed: recoveryLogReplayRestoreSource?.effects?.recoveryLogReplayed === true,
    packageFilesRestored: restoreResult.effects.packageFilesRestored === true,
    rollbackExecuted: restoreResult.effects.rollbackExecuted === true
  }
})

const createSyntheticTransactionCommandDispatcherHandoffResult = draft => ({
  status: 'deferred',
  transactionCommandPreflightStatus: 'deferred',
  installTransactionDispatchPlanStatus: 'deferred',
  postCommitVerificationPlanStatus: 'deferred',
  reason: 'product runtime probe supplies a path-free transaction command dispatcher handoff',
  requestedCommandId: 'install',
  targetPackageId: draft.selectedPackageIds[0],
  diagnostics: [],
  selectedPackageIds: draft.selectedPackageIds,
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: draft.loadOrder,
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  packageCount: draft.packages.length,
  candidateIdentity: draft.candidateIdentity,
  lockfileHash: draft.lockfileHash,
  transactionCommandDispatcherHandoff: 'deferred',
  readOnly: true,
  dispatcherHandoffAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  handoffChecks: [],
  handoffStages: [
    {
      id: 'dispatcher-handoff-inspection',
      status: 'satisfied',
      requirementIds: ['confirmed-command-envelope'],
      reason: 'Command handoff is consistent enough to inspect lifecycle execution.'
    },
    {
      id: 'install-transaction-commit',
      status: 'deferred',
      requirementIds: ['atomic-transaction-commit-executor'],
      reason: 'Install transaction commit remains deferred.'
    },
    {
      id: 'post-commit-verification-execution',
      status: 'deferred',
      requirementIds: ['post-commit-verification-executor'],
      reason: 'Post-commit verification remains deferred.'
    },
    {
      id: 'ui-ipc-result-handoff',
      status: 'deferred',
      requirementIds: ['path-free-ui-ipc-result'],
      reason: 'UI and IPC result delivery remains deferred.'
    },
    {
      id: 'rollback-recovery-handoff',
      status: 'deferred',
      requirementIds: ['rollback-recovery-orchestrator'],
      reason: 'Rollback recovery remains deferred.'
    }
  ],
  dispatcherRequirements: [
    {
      id: 'atomic-transaction-commit-executor',
      status: 'required',
      reason: 'Persistent mutation must happen through one atomic executor.'
    }
  ],
  effects: createSyntheticNoRealLifecycleEffects()
})

const createSyntheticInstallTransactionDispatchPlanResult = draft => ({
  status: 'deferred',
  transactionCommandPreflightStatus: 'deferred',
  modLockWriteProbeStatus: 'written',
  transactionLogWriteProbeStatus: 'written',
  reason: 'product runtime probe supplies a path-free install transaction dispatch plan',
  requestedCommandId: 'install',
  targetPackageId: draft.selectedPackageIds[0],
  diagnostics: [],
  selectedPackageIds: draft.selectedPackageIds,
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: draft.loadOrder,
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  packageCount: draft.packages.length,
  installTransactionDispatchPlan: 'deferred',
  readOnly: true,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  checks: [],
  stages: [
    {
      id: 'dispatch-plan-inspection',
      status: 'satisfied',
      requirementIds: ['install-command-dispatcher'],
      reason: 'Install command and isolated write-probe evidence are consistent.'
    },
    {
      id: 'transaction-log-prepare',
      status: 'deferred',
      requirementIds: ['verified-transaction-log-entry'],
      reason: 'Transaction log preparation remains deferred.'
    },
    {
      id: 'package-file-stage',
      status: 'deferred',
      requirementIds: ['staged-package-file-commit'],
      reason: 'Package file staging remains deferred.'
    },
    {
      id: 'settings-lockfile-commit',
      status: 'deferred',
      requirementIds: ['atomic-settings-lockfile-commit'],
      reason: 'Settings and lockfile commit remains deferred.'
    },
    {
      id: 'runtime-publication-commit',
      status: 'deferred',
      requirementIds: ['runtime-publication-commit-adapter'],
      reason: 'Runtime publication commit remains deferred.'
    }
  ],
  requirements: [
    {
      id: 'verified-transaction-log-entry',
      status: 'required',
      reason: 'A future commit must verify a transaction log entry.'
    },
    {
      id: 'staged-package-file-commit',
      status: 'required',
      reason: 'A future commit must stage package files.'
    },
    {
      id: 'atomic-settings-lockfile-commit',
      status: 'required',
      reason: 'A future commit must replace settings and lockfile atomically.'
    },
    {
      id: 'runtime-publication-commit-adapter',
      status: 'required',
      reason: 'A future commit must hand off runtime publication.'
    }
  ],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  effects: createSyntheticNoRealLifecycleEffects()
})

const createSyntheticRuntimePublicationCommitAdapterResult = draft => ({
  status: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  transactionPreCommitPlanStatus: 'deferred',
  liveRegistrySwapProtectionStatus: 'deferred',
  publicationRollbackRecoveryStatus: 'deferred',
  reason: 'product runtime probe supplies a path-free runtime publication commit adapter',
  diagnostics: [],
  selectedPackageIds: draft.selectedPackageIds,
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: draft.loadOrder,
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  packageCount: draft.packages.length,
  officialIdentity: {
    artifactHash: officialCacheMetadata.artifactHash,
    contentHash: officialCacheMetadata.contentHash,
    schemaSetHash: officialCacheMetadata.schemaSetHash,
    environmentHash: officialCacheMetadata.environmentHash,
    snapshotHash: officialCacheMetadata.snapshotHash,
    registryCount: 54,
    entryCount: 4242
  },
  candidateIdentity: draft.candidateIdentity,
  lockfileHash: draft.lockfileHash,
  runtimePublicationCommit: 'deferred',
  commitAllowed: false,
  publicationAllowed: false,
  writeAllowed: false,
  liveRegistryMutable: false,
  rollbackExecutionAllowed: false,
  commitChecks: [],
  commitStages: [
    {
      id: 'commit-adapter-inspection',
      status: 'satisfied',
      adapterIds: ['atomic-runtime-publication-commit-adapter'],
      writeBoundaryIds: [],
      rollbackCheckpointIds: [],
      reason: 'Runtime publication commit adapter inputs are consistent.'
    },
    {
      id: 'transaction-log-prepare',
      status: 'deferred',
      adapterIds: ['transaction-log-writer'],
      writeBoundaryIds: ['transaction-log'],
      rollbackCheckpointIds: ['before-transaction-log-write'],
      reason: 'Transaction log preparation remains deferred.'
    },
    {
      id: 'package-files-commit',
      status: 'deferred',
      adapterIds: ['package-file-commit-adapter'],
      writeBoundaryIds: ['package-files', 'package-backups'],
      rollbackCheckpointIds: ['before-package-files-write'],
      reason: 'Package file commit remains deferred.'
    },
    {
      id: 'settings-lockfile-commit',
      status: 'deferred',
      adapterIds: ['settings-lockfile-commit-adapter'],
      writeBoundaryIds: ['installation-settings', 'mod-lockfile'],
      rollbackCheckpointIds: ['before-settings-lockfile-write'],
      reason: 'Settings and lockfile commit remains deferred.'
    },
    {
      id: 'live-registry-publication',
      status: 'deferred',
      adapterIds: ['live-registry-publication-adapter'],
      writeBoundaryIds: ['live-registry'],
      rollbackCheckpointIds: ['before-live-registry-swap'],
      reason: 'Live registry publication remains deferred.'
    },
    {
      id: 'post-commit-verification',
      status: 'deferred',
      adapterIds: ['post-commit-verification-adapter'],
      writeBoundaryIds: [],
      rollbackCheckpointIds: ['after-failure-restore-verification'],
      reason: 'Post-commit verification remains deferred.'
    },
    {
      id: 'rollback-recovery-handoff',
      status: 'deferred',
      adapterIds: ['rollback-recovery-orchestrator'],
      writeBoundaryIds: [],
      rollbackCheckpointIds: ['after-failure-restore-verification'],
      reason: 'Rollback recovery handoff remains deferred.'
    }
  ],
  requiredCommitAdapters: [
    {
      id: 'atomic-runtime-publication-commit-adapter',
      status: 'required',
      reason: 'Runtime publication must be committed through a future atomic adapter.'
    }
  ],
  effects: createSyntheticNoRealLifecycleEffects()
})

const createSyntheticPostCommitVerificationSummary = draft => ({
  selectedPackageCount: draft.selectedPackageIds.length,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: draft.loadOrder.length,
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  packageCount: draft.packages.length,
  diagnosticCount: 0
})

const createSyntheticPostCommitVerificationExecutorAdapterResult = (
  draft,
  hostMode = 'injected-test-only'
) => ({
  status: 'executed',
  sourcePreflightStatus: 'deferred',
  reason: hostMode === 'electron-main-visible-import'
    ? 'Electron visible import supplies a post-commit verification adapter acknowledgement'
    : 'product runtime probe supplies an injected post-commit verification adapter acknowledgement',
  postCommitVerificationExecutorAdapter: 'executed',
  readOnly: true,
  injectedExecutorHostRequired: true,
  postCommitVerificationExecutorHostMode: hostMode,
  injectedExecutorHostMode: hostMode,
  verificationHostCalled: true,
  verificationOutcomeReceived: true,
  verificationOutcomeNormalized: true,
  verificationExecutionAllowed: true,
  postCommitVerificationAllowed: false,
  transactionLogReadAllowed: false,
  packageStateReadAllowed: false,
  settingsReadAllowed: false,
  lockfileReadAllowed: false,
  liveRegistryReadAllowed: false,
  saveCacheIsolationCheckAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: 'install',
  targetPackageId: draft.selectedPackageIds[0],
  selectedPackageIds: draft.selectedPackageIds,
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: draft.loadOrder,
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  packageCount: draft.packages.length,
  candidateIdentity: draft.candidateIdentity,
  lockfileHash: draft.lockfileHash,
  checks: [],
  diagnostics: [],
  outcome: {
    formatVersion: 1,
    kind: 'verified',
    commandId: 'install',
    packageId: draft.selectedPackageIds[0],
    candidateHash: draft.candidateIdentity.candidateHash,
    lockfileHash: draft.lockfileHash,
    transactionLogMatched: true,
    packageStateMatched: true,
    settingsLockfileMatched: true,
    liveRegistryMatched: true,
    saveCacheIsolated: true,
    messageKey: 'mods.post.commit.verification.install.verified',
    recovery: 'none',
    retryable: false,
    rollbackRequired: false,
    summary: createSyntheticPostCommitVerificationSummary(draft),
    diagnostics: []
  },
  summary: createSyntheticPostCommitVerificationSummary(draft),
  effects: {
    ...createSyntheticNoRealLifecycleEffects(),
    postCommitVerificationExecutorCalled: true,
    injectedVerificationHostCalled: true,
    verificationOutcomeReceived: true,
    verifiedOutcomeReceived: true,
    failedOutcomeReceived: false,
    retryOutcomeReceived: false,
    rollbackOutcomeReceived: false
  }
})

const createModLockProbe = () => createElectronThirdPartyDataPackModLockStorageProbe({
  host: {
    isPackaged: app.isPackaged,
    executablePath: process.execPath,
    portableExecutableDirectory: process.env.PORTABLE_EXECUTABLE_DIR || null,
    configuredUserDataPath: app.getPath('userData')
  }
})

const readOptionalFile = filePath => {
  try {
    return {
      exists: true,
      contents: fs.readFileSync(filePath, 'utf8')
    }
  } catch {
    return {
      exists: false,
      contents: null
    }
  }
}

const writeJsonFileAtomically = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.tmp-disable-${process.pid}-${Date.now()}`
  )
  const contents = `${JSON.stringify(value, null, 2)}\n`
  let fileDescriptor
  try {
    fileDescriptor = fs.openSync(temporaryPath, 'wx')
    fs.writeFileSync(fileDescriptor, contents, 'utf8')
    fs.fsyncSync(fileDescriptor)
  } finally {
    if (fileDescriptor !== undefined) fs.closeSync(fileDescriptor)
  }
  try {
    fs.renameSync(temporaryPath, filePath)
  } catch (error) {
    try {
      fs.unlinkSync(temporaryPath)
    } catch {}
    throw error
  }
}

const restoreOptionalFile = (filePath, previous) => {
  if (previous.exists) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, previous.contents, 'utf8')
    return
  }
  try {
    fs.unlinkSync(filePath)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

const rollbackModLockFile = async (filePath, previous, blockedMessage) => {
  if (previous.exists) {
    const previousLockfile = await createModLockProbe().write(
      JSON.parse(previous.contents)
    )
    if (previousLockfile.report.status !== 'written') {
      throw new Error(blockedMessage)
    }
    return
  }
  restoreOptionalFile(filePath, previous)
}

const writeElectronDisabledState = async envelope => {
  const record = envelope.record
  const draft = record.lockfileDraft
  if (
    record.targetPackageId !== envelope.targetPackageId
    || draft.selectedPackageIds.length !== 0
    || draft.loadOrder.length !== 0
    || !draft.packages.some(currentPackage => currentPackage.packageId === envelope.targetPackageId)
  ) {
    throw new Error('Electron disable state does not describe an installed package transition')
  }

  const programDirectoryPath = getExecutableDirectoryPath()
  const startupPaths = resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths(
    programDirectoryPath
  )
  const settingsPrevious = readOptionalFile(settingsPath)
  const modLockPrevious = readOptionalFile(startupPaths.modLockFilePath)
  const startupPrevious = readOptionalFile(startupPaths.snapshotFilePath)
  let modLockWritten = false

  try {
    const lockfileResult = await createModLockProbe().write(draft)
    if (lockfileResult.report.status !== 'written') {
      throw new Error('Electron disable mod-lock write was blocked')
    }
    modLockWritten = true
    if (runtimeProbeVisibleDisableFailAfterModLockWrite) {
      throw new Error('Electron disable runtime probe failed after mod-lock write')
    }

    let currentSettings = {}
    try {
      currentSettings = settingsPrevious.exists ? JSON.parse(settingsPrevious.contents) : {}
    } catch {
      currentSettings = {}
    }
    writeJsonFileAtomically(settingsPath, {
      ...currentSettings,
      thirdPartyDataPacks: {
        commandId: 'disable',
        targetPackageId: envelope.targetPackageId,
        candidateHash: record.candidateHash,
        lockfileHash: record.lockfileHash,
        selectedPackageIds: [],
        blockedPackageIds: [envelope.targetPackageId],
        loadOrder: []
      }
    })

    writeJsonFileAtomically(startupPaths.snapshotFilePath, envelope.startupSnapshot)

    return {
      settingsWritten: true,
      lockfileWritten: true,
      startupStateWritten: true
    }
  } catch (error) {
    try {
      restoreOptionalFile(startupPaths.snapshotFilePath, startupPrevious)
      restoreOptionalFile(settingsPath, settingsPrevious)
      if (modLockWritten) {
        await rollbackModLockFile(
          startupPaths.modLockFilePath,
          modLockPrevious,
          'Electron disable rollback of mod-lock was blocked'
        )
      }
    } catch {
      // The IPC terminal remains blocked; the next startup will revalidate all three files.
    }
    throw error
  }
}

const isSafeRelativeDataPackPath = value =>
  typeof value === 'string'
  && value.length > 0
  && !path.isAbsolute(value)
  && !value.includes('\\')
  && !value.split('/').includes('..')

const assertSafePackageRemovalPlan = (modsPath, targetPackage) => {
  const source = targetPackage?.source
  if (
    source === null
    || typeof source !== 'object'
    || !isSafeRelativeDataPackPath(source.candidatePath)
    || !isSafeRelativeDataPackPath(source.manifestPath)
    || !Array.isArray(source.contentFiles)
  ) {
    throw new Error('Electron uninstall package source paths are not removable')
  }

  const packageRootPath = path.resolve(modsPath, source.candidatePath)
  if (!isPathInside(modsPath, packageRootPath) || path.resolve(packageRootPath) === path.resolve(modsPath)) {
    throw new Error('Electron uninstall package root escaped the mods directory')
  }
  for (const filePath of [source.manifestPath, ...source.contentFiles]) {
    if (!isSafeRelativeDataPackPath(filePath)) {
      throw new Error('Electron uninstall package file path is not removable')
    }
    const absolutePath = path.resolve(modsPath, filePath)
    if (!isPathInside(packageRootPath, absolutePath)) {
      throw new Error('Electron uninstall package file escaped the package root')
    }
  }
  if (!fs.statSync(packageRootPath).isDirectory()) {
    throw new Error('Electron uninstall package root is unavailable')
  }
  return packageRootPath
}

const assertSafePackagePreservationPlan = (modsPath, targetPackage) => {
  const source = targetPackage?.source
  if (
    source === null
    || typeof source !== 'object'
    || !isSafeRelativeDataPackPath(source.candidatePath)
    || !isSafeRelativeDataPackPath(source.manifestPath)
    || !Array.isArray(source.contentFiles)
  ) {
    throw new Error('Electron enable package source paths are not preservable')
  }

  const packageRootPath = path.resolve(modsPath, source.candidatePath)
  if (!isPathInside(modsPath, packageRootPath) || path.resolve(packageRootPath) === path.resolve(modsPath)) {
    throw new Error('Electron enable package root escaped the mods directory')
  }
  if (!fs.statSync(packageRootPath).isDirectory()) {
    throw new Error('Electron enable package root is unavailable')
  }
  for (const filePath of [source.manifestPath, ...source.contentFiles]) {
    if (!isSafeRelativeDataPackPath(filePath)) {
      throw new Error('Electron enable package file path is not preservable')
    }
    const absolutePath = path.resolve(modsPath, filePath)
    if (!isPathInside(packageRootPath, absolutePath)) {
      throw new Error('Electron enable package file escaped the package root')
    }
    if (!fs.statSync(absolutePath).isFile()) {
      throw new Error('Electron enable package file is unavailable')
    }
  }
  return packageRootPath
}

const parseJsonObjectOrNull = text => {
  try {
    const value = JSON.parse(text)
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? value
      : null
  } catch {
    return null
  }
}

const writeElectronUninstalledState = async envelope => {
  const record = envelope.record
  const draft = record.lockfileDraft
  if (
    record.requestedCommandId !== 'uninstall'
    || record.targetPackageId !== envelope.targetPackageId
    || draft.selectedPackageIds.length !== 0
    || draft.loadOrder.length !== 0
    || draft.packages.some(currentPackage => currentPackage.packageId === envelope.targetPackageId)
  ) {
    throw new Error('Electron uninstall state does not describe a disabled package removal')
  }

  const programDirectoryPath = getExecutableDirectoryPath()
  const startupPaths = resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths(
    programDirectoryPath
  )
  const settingsPrevious = readOptionalFile(settingsPath)
  const modLockPrevious = readOptionalFile(startupPaths.modLockFilePath)
  const startupPrevious = readOptionalFile(startupPaths.snapshotFilePath)
  const currentModLock = await createModLockProbe().read()
  if (currentModLock.report.status !== 'loaded' || currentModLock.draft === null) {
    throw new Error('Electron uninstall requires a loaded disabled mod-lock')
  }

  const previousDraft = currentModLock.draft
  const targetPackage = previousDraft.packages.find(
    currentPackage => currentPackage.packageId === envelope.targetPackageId
  )
  const currentSettings = settingsPrevious.exists
    ? parseJsonObjectOrNull(settingsPrevious.contents)
    : null
  const currentDataPacks = currentSettings?.thirdPartyDataPacks
  const currentStateMatchesPreviousDraft = currentDataPacks !== null
    && typeof currentDataPacks === 'object'
    && currentDataPacks.targetPackageId === envelope.targetPackageId
    && currentDataPacks.candidateHash === previousDraft.candidateIdentity.candidateHash
    && currentDataPacks.lockfileHash === previousDraft.lockfileHash
  const currentPackageIsDisabled = currentStateMatchesPreviousDraft
    && currentDataPacks.commandId === 'disable'
    && previousDraft.selectedPackageIds.length === 0
    && previousDraft.loadOrder.length === 0
    && stringListsMatch(currentDataPacks.selectedPackageIds, [])
    && stringListsMatch(currentDataPacks.blockedPackageIds, [envelope.targetPackageId])
    && stringListsMatch(currentDataPacks.loadOrder, [])
  const currentPackageIsEnabled = currentStateMatchesPreviousDraft
    && (currentDataPacks.commandId === 'install' || currentDataPacks.commandId === 'enable')
    && stringListsMatch(previousDraft.selectedPackageIds, [envelope.targetPackageId])
    && stringListsMatch(previousDraft.loadOrder, [envelope.targetPackageId])
    && stringListsMatch(currentDataPacks.selectedPackageIds, [envelope.targetPackageId])
    && stringListsMatch(currentDataPacks.blockedPackageIds, [])
    && stringListsMatch(currentDataPacks.loadOrder, [envelope.targetPackageId])
  if (
    targetPackage === undefined
    || (!currentPackageIsDisabled && !currentPackageIsEnabled)
  ) {
    throw new Error('Electron uninstall requires the current package to be installed')
  }

  const modsPath = getExecutableModsPath()
  const packageRootPath = assertSafePackageRemovalPlan(modsPath, targetPackage)
  const backupParentPath = path.join(startupPaths.userDataPath, 'mod-uninstall-backups')
  fs.mkdirSync(backupParentPath, { recursive: true })
  const safeBackupName = envelope.targetPackageId.replace(/[^A-Za-z0-9._-]/g, '_')
  const backupRootPath = fs.mkdtempSync(path.join(backupParentPath, `${safeBackupName}-`))
  const backupPackageRootPath = path.join(backupRootPath, 'package')
  let packageFilesRemoved = false
  let modLockWritten = false

  try {
    fs.cpSync(packageRootPath, backupPackageRootPath, {
      recursive: true,
      errorOnExist: true
    })
    fs.rmSync(packageRootPath, { recursive: true, force: true })
    packageFilesRemoved = true

    const lockfileResult = await createModLockProbe().write(draft)
    if (lockfileResult.report.status !== 'written') {
      throw new Error('Electron uninstall mod-lock write was blocked')
    }
    modLockWritten = true
    if (runtimeProbeVisibleUninstallFailAfterModLockWrite) {
      throw new Error('Electron uninstall runtime probe failed after mod-lock write')
    }

    writeJsonFileAtomically(settingsPath, {
      ...currentSettings,
      thirdPartyDataPacks: {
        commandId: 'uninstall',
        targetPackageId: envelope.targetPackageId,
        candidateHash: record.candidateHash,
        lockfileHash: record.lockfileHash,
        selectedPackageIds: [],
        blockedPackageIds: [],
        loadOrder: []
      }
    })

    writeJsonFileAtomically(startupPaths.snapshotFilePath, envelope.startupSnapshot)
    fs.rmSync(backupRootPath, { recursive: true, force: true })

    return {
      settingsWritten: true,
      lockfileWritten: true,
      startupStateWritten: true,
      packageFilesRemoved: true
    }
  } catch (error) {
    try {
      restoreOptionalFile(startupPaths.snapshotFilePath, startupPrevious)
      restoreOptionalFile(settingsPath, settingsPrevious)
      if (modLockWritten) {
        await rollbackModLockFile(
          startupPaths.modLockFilePath,
          modLockPrevious,
          'Electron uninstall rollback of mod-lock was blocked'
        )
      }
      if (packageFilesRemoved) {
        fs.rmSync(packageRootPath, { recursive: true, force: true })
        fs.cpSync(backupPackageRootPath, packageRootPath, { recursive: true })
      }
    } catch {
      // The IPC terminal remains blocked; the next startup will revalidate all files.
    } finally {
      fs.rmSync(backupRootPath, { recursive: true, force: true })
    }
    throw error
  }
}

const writeElectronEnabledState = async envelope => {
  const record = envelope.record
  const draft = record.lockfileDraft
  const enabledPackage = draft.packages.find(
    currentPackage => currentPackage.packageId === envelope.targetPackageId
  )
  if (
    record.requestedCommandId !== 'enable'
    || record.targetPackageId !== envelope.targetPackageId
    || draft.selectedPackageIds.length !== 1
    || draft.selectedPackageIds[0] !== envelope.targetPackageId
    || draft.loadOrder.length !== 1
    || draft.loadOrder[0] !== envelope.targetPackageId
    || draft.packages.length === 0
    || enabledPackage === undefined
  ) {
    throw new Error('Electron enable state does not describe a disabled package activation')
  }

  const programDirectoryPath = getExecutableDirectoryPath()
  const startupPaths = resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths(
    programDirectoryPath
  )
  const settingsPrevious = readOptionalFile(settingsPath)
  const modLockPrevious = readOptionalFile(startupPaths.modLockFilePath)
  const startupPrevious = readOptionalFile(startupPaths.snapshotFilePath)
  const currentModLock = await createModLockProbe().read()
  if (currentModLock.report.status !== 'loaded' || currentModLock.draft === null) {
    throw new Error('Electron enable requires a loaded disabled mod-lock')
  }

  const previousDraft = currentModLock.draft
  const disabledPackage = previousDraft.packages.find(
    currentPackage => currentPackage.packageId === envelope.targetPackageId
  )
  const currentSettings = settingsPrevious.exists
    ? parseJsonObjectOrNull(settingsPrevious.contents)
    : null
  const currentDataPacks = currentSettings?.thirdPartyDataPacks
  if (
    disabledPackage === undefined
    || previousDraft.selectedPackageIds.length !== 0
    || previousDraft.loadOrder.length !== 0
    || currentDataPacks === null
    || typeof currentDataPacks !== 'object'
    || currentDataPacks.commandId !== 'disable'
    || currentDataPacks.targetPackageId !== envelope.targetPackageId
    || currentDataPacks.candidateHash !== previousDraft.candidateIdentity.candidateHash
    || currentDataPacks.lockfileHash !== previousDraft.lockfileHash
    || !stringListsMatch(currentDataPacks.selectedPackageIds, [])
    || !stringListsMatch(currentDataPacks.blockedPackageIds, [envelope.targetPackageId])
    || !stringListsMatch(currentDataPacks.loadOrder, [])
    || disabledPackage.source?.candidatePath !== enabledPackage.source?.candidatePath
  ) {
    throw new Error('Electron enable requires the current package to be disabled')
  }

  const modsPath = getExecutableModsPath()
  assertSafePackagePreservationPlan(modsPath, disabledPackage)
  assertSafePackagePreservationPlan(modsPath, enabledPackage)
  let modLockWritten = false

  try {
    const lockfileResult = await createModLockProbe().write(draft)
    if (lockfileResult.report.status !== 'written') {
      throw new Error('Electron enable mod-lock write was blocked')
    }
    modLockWritten = true

    writeJsonFileAtomically(settingsPath, {
      ...currentSettings,
      thirdPartyDataPacks: {
        commandId: 'enable',
        targetPackageId: envelope.targetPackageId,
        candidateHash: record.candidateHash,
        lockfileHash: record.lockfileHash,
        selectedPackageIds: [envelope.targetPackageId],
        blockedPackageIds: [],
        loadOrder: [envelope.targetPackageId]
      }
    })

    writeJsonFileAtomically(startupPaths.snapshotFilePath, envelope.startupSnapshot)

    return {
      settingsWritten: true,
      lockfileWritten: true,
      startupStateWritten: true
    }
  } catch (error) {
    try {
      restoreOptionalFile(startupPaths.snapshotFilePath, startupPrevious)
      restoreOptionalFile(settingsPath, settingsPrevious)
      if (modLockWritten) {
        await rollbackModLockFile(
          startupPaths.modLockFilePath,
          modLockPrevious,
          'Electron enable rollback of mod-lock was blocked'
        )
      }
    } catch {
      // The IPC terminal remains blocked; the next startup will revalidate all three files.
    }
    throw error
  }
}

const stringListsMatch = (left, right) =>
  Array.isArray(left)
  && Array.isArray(right)
  && left.length === right.length
  && left.every((value, index) => value === right[index])

const readElectronInstalledState = async () => {
  const modLockRead = await createModLockProbe().read()
  if (modLockRead.report.status === 'missing') {
    return {
      status: 'missing',
      record: null,
      packageFilesPreserved: false
    }
  }
  if (modLockRead.report.status !== 'loaded' || modLockRead.draft === null) {
    return {
      status: 'blocked',
      record: null,
      packageFilesPreserved: false,
      reason: 'Electron installed data-pack mod-lock could not be loaded'
    }
  }

  const settingsFile = readOptionalFile(settingsPath)
  if (!settingsFile.exists) {
    return {
      status: 'blocked',
      record: null,
      packageFilesPreserved: false,
      reason: 'Electron installed data-pack settings are missing'
    }
  }

  let settingsValue
  try {
    settingsValue = JSON.parse(settingsFile.contents)
  } catch {
    return {
      status: 'blocked',
      record: null,
      packageFilesPreserved: false,
      reason: 'Electron installed data-pack settings are invalid'
    }
  }

  const settingsDataPacks = settingsValue?.thirdPartyDataPacks
  if (settingsDataPacks === undefined) {
    return {
      status: 'missing',
      record: null,
      packageFilesPreserved: false,
      reason: 'Electron installed data-pack settings are not managed'
    }
  }
  if (settingsDataPacks === null || typeof settingsDataPacks !== 'object') {
    return {
      status: 'blocked',
      record: null,
      packageFilesPreserved: false,
      reason: 'Electron installed data-pack settings are not managed'
    }
  }

  const draft = modLockRead.draft
  const selectedPackageIds = settingsDataPacks.selectedPackageIds
  const blockedPackageIds = settingsDataPacks.blockedPackageIds
  const loadOrder = settingsDataPacks.loadOrder
  const commandId = settingsDataPacks.commandId
  const targetPackageId = settingsDataPacks.targetPackageId
  const candidateHash = settingsDataPacks.candidateHash
  const lockfileHash = settingsDataPacks.lockfileHash
  const effectiveCommandId = commandId === undefined ? 'install' : commandId
  const effectiveTargetPackageId = typeof targetPackageId === 'string'
    ? targetPackageId
    : Array.isArray(selectedPackageIds) ? selectedPackageIds[0] : undefined

  const targetPackageIsInDraft = draft.packages.some(
    currentPackage => currentPackage.packageId === effectiveTargetPackageId
  )
  if (
    (
      effectiveCommandId !== 'install'
      && effectiveCommandId !== 'enable'
      && effectiveCommandId !== 'disable'
      && effectiveCommandId !== 'uninstall'
    )
    || typeof effectiveTargetPackageId !== 'string'
    || !Array.isArray(selectedPackageIds)
    || !Array.isArray(blockedPackageIds)
    || !Array.isArray(loadOrder)
    || typeof candidateHash !== 'string'
    || typeof lockfileHash !== 'string'
    || candidateHash !== draft.candidateIdentity.candidateHash
    || lockfileHash !== draft.lockfileHash
    || !stringListsMatch(selectedPackageIds, draft.selectedPackageIds)
    || !stringListsMatch(loadOrder, draft.loadOrder)
    || !stringListsMatch(blockedPackageIds, effectiveCommandId === 'disable'
      ? [effectiveTargetPackageId]
      : [])
    || (effectiveCommandId !== 'uninstall' && !targetPackageIsInDraft)
    || (effectiveCommandId === 'uninstall' && targetPackageIsInDraft)
    || ((effectiveCommandId === 'install' || effectiveCommandId === 'enable')
      && (selectedPackageIds.length === 0 || selectedPackageIds[0] !== effectiveTargetPackageId))
    || (effectiveCommandId === 'disable'
      && (selectedPackageIds.length !== 0 || loadOrder.length !== 0))
    || (effectiveCommandId === 'uninstall'
      && (selectedPackageIds.length !== 0 || blockedPackageIds.length !== 0 || loadOrder.length !== 0))
  ) {
    return {
      status: 'blocked',
      record: null,
      packageFilesPreserved: false,
      reason: 'Electron installed data-pack settings do not match mod-lock'
    }
  }

  const modsPath = getExecutableModsPath()
  const packageFilesPreserved = effectiveCommandId === 'uninstall' && draft.packages.length === 0
    ? false
    : draft.packages.every(currentPackage => {
      const source = currentPackage.source
      if (
        source === null
        || typeof source !== 'object'
        || !isSafeRelativeDataPackPath(source.candidatePath)
        || !isSafeRelativeDataPackPath(source.manifestPath)
        || !Array.isArray(source.contentFiles)
      ) return false

      const requiredFiles = [source.manifestPath, ...source.contentFiles]
      return requiredFiles.every(filePath => {
        if (!isSafeRelativeDataPackPath(filePath)) return false
        const absolutePath = path.resolve(modsPath, filePath)
        if (!isPathInside(modsPath, absolutePath)) return false
        try {
          return fs.statSync(absolutePath).isFile()
        } catch {
          return false
        }
      })
    })
  if (!packageFilesPreserved && effectiveCommandId !== 'uninstall') {
    return {
      status: 'blocked',
      record: null,
      packageFilesPreserved: false,
      reason: 'Electron installed data-pack files are unavailable'
    }
  }

  return {
    status: 'ready',
    record: {
      recordId: 'active',
      requestedCommandId: effectiveCommandId,
      targetPackageId: effectiveTargetPackageId,
      selectedPackageIds: [...selectedPackageIds],
      blockedPackageIds: [...blockedPackageIds],
      loadOrder: [...loadOrder],
      candidateHash,
      lockfileHash,
      lockfileDraft: draft
    },
    packageFilesPreserved
  }
}

const thirdPartyDataPackInstalledStateReadHandler =
  createThirdPartyDataPackElectronInstalledStateReadMainHandler({
    readInstalledState: readElectronInstalledState
  })

const thirdPartyDataPackDisableCommandHandler =
  createThirdPartyDataPackElectronDisableCommandMainHandler({
    writeDisabledState: writeElectronDisabledState
  })

const thirdPartyDataPackEnableCommandHandler =
  createThirdPartyDataPackElectronEnableCommandMainHandler({
    writeEnabledState: writeElectronEnabledState
  })

const thirdPartyDataPackUninstallCommandHandler =
  createThirdPartyDataPackElectronUninstallCommandMainHandler({
    writeUninstalledState: writeElectronUninstalledState
  })

const createPathFreeModLockProbeReport = (report, options = {}) => {
  const userDataPath = app.getPath('userData')
  const paths = report.paths
  const modLockUserDataPath = paths?.userDataPath
  const modLockPath = paths?.filePath

  return {
    status: report.status,
    operation: options.operation ?? report.operation,
    storageKind: report.storageKind,
    programDirectorySource: report.programDirectorySource ?? null,
    diagnosticsCount: report.diagnostics.length,
    configuredUserDataObserved: typeof report.configuredUserDataPath === 'string',
    programDirectoryUserDataResolved: typeof modLockUserDataPath === 'string',
    programDirectoryUserDataMatchesConfiguredUserData:
      typeof modLockUserDataPath === 'string'
        && path.resolve(modLockUserDataPath) === path.resolve(userDataPath),
    modLockInsideProgramUserData:
      typeof modLockUserDataPath === 'string'
        && typeof modLockPath === 'string'
        && isPathInside(modLockUserDataPath, modLockPath),
    modLockInsideConfiguredUserData:
      typeof modLockPath === 'string' && isPathInside(userDataPath, modLockPath),
    effects: {
      officialRegistryPublished: report.effects.officialRegistryPublished,
      thirdPartyRegistryPublished: report.effects.thirdPartyRegistryPublished,
      runtimeEnablementAllowed: report.effects.runtimeEnablementAllowed,
      electronIpcExposed: report.effects.electronIpcExposed,
      packageFilesWritten: report.effects.packageFilesWritten,
      packageBackupsWritten: report.effects.packageBackupsWritten,
      lockfileWritten: options.lockfileWritten ?? report.effects.lockfileWritten,
      settingsWritten: report.effects.settingsWritten,
      savesWritten: report.effects.savesWritten,
      cacheWritten: report.effects.cacheWritten,
      transactionLogWritten: report.effects.transactionLogWritten,
      electronMainProcessBoundaryInspected: report.effects.electronMainProcessBoundaryInspected,
      configuredUserDataPathUsed: report.effects.configuredUserDataPathUsed,
      systemUserDataFallbackAllowed: report.effects.systemUserDataFallbackAllowed,
      desktopStartupChanged: report.effects.desktopStartupChanged
    },
    ...options.extra
  }
}

const settingsWriterEffects = written => ({
  settingsWriterCalled: true,
  settingsWritten: written,
  lockfileWritten: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const createSettingsWriterResult = (envelope, status = 'written') => ({
  status,
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  candidateHash: envelope.candidateHash,
  lockfileHash: envelope.lockfileHash,
  diagnostics: [],
  effects: settingsWriterEffects(status === 'written')
})

const writeProbeSettings = async envelope => {
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true })
  let current = {}
  try {
    current = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
  } catch {
    current = {}
  }

  const next = {
    ...current,
    thirdPartyDataPacks: {
      commandId: envelope.requestedCommandId,
      targetPackageId: envelope.targetPackageId,
      candidateHash: envelope.candidateHash,
      lockfileHash: envelope.lockfileHash,
      selectedPackageIds: envelope.selectedPackageIds,
      blockedPackageIds: envelope.blockedPackageIds,
      loadOrder: envelope.loadOrder
    }
  }
  const temporaryPath = path.join(
    path.dirname(settingsPath),
    `.settings.json.tmp-${process.pid}-${Date.now()}`
  )
  const fileDescriptor = fs.openSync(temporaryPath, 'w')
  try {
    fs.writeFileSync(fileDescriptor, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
    fs.fsyncSync(fileDescriptor)
  } finally {
    fs.closeSync(fileDescriptor)
  }
  fs.renameSync(temporaryPath, settingsPath)
  return createSettingsWriterResult(envelope)
}

const writeElectronStartupPersistentStateSnapshot = (
  programDirectoryPath,
  finalization
) => {
  const paths = resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths(
    programDirectoryPath
  )
  fs.mkdirSync(paths.startupStateDirectoryPath, { recursive: true })

  const snapshot = {
    formatVersion: 1,
    kind: 'electron-startup-persistent-state-snapshot',
    packageId: finalization.targetPackageId,
    candidateIdentity: finalization.candidateIdentity,
    lockfileHash: finalization.lockfileHash,
    transactionLog: { committed: true },
    packageState: { matched: true },
    settingsState: { matched: true },
    modLockState: { matched: true },
    liveRegistry: { matched: true },
    saveCache: { isolated: true }
  }
  const contents = `${JSON.stringify(snapshot, null, 2)}\n`
  const temporaryPath = path.join(
    paths.startupStateDirectoryPath,
    `.startup-persistent-state-snapshot.json.tmp-${process.pid}-${Date.now()}`
  )
  let fileDescriptor
  try {
    fileDescriptor = fs.openSync(temporaryPath, 'wx')
    fs.writeFileSync(fileDescriptor, contents, 'utf8')
    fs.fsyncSync(fileDescriptor)
  } finally {
    if (fileDescriptor !== undefined) fs.closeSync(fileDescriptor)
  }

  try {
    fs.renameSync(temporaryPath, paths.snapshotFilePath)
  } catch (error) {
    try {
      fs.unlinkSync(temporaryPath)
    } catch {}
    throw error
  }

  return {
    status: 'written',
    storageKind: 'electron-program-directory-userdata-startup-persistent-state',
    targetPackageId: finalization.targetPackageId,
    snapshotWritten: true
  }
}

const safeSettingsSummary = settingsValue => {
  const thirdPartyDataPacks = settingsValue?.thirdPartyDataPacks
  return thirdPartyDataPacks && typeof thirdPartyDataPacks === 'object'
    ? {
        candidateHash: typeof thirdPartyDataPacks.candidateHash === 'string'
          ? thirdPartyDataPacks.candidateHash
          : null,
        lockfileHash: typeof thirdPartyDataPacks.lockfileHash === 'string'
          ? thirdPartyDataPacks.lockfileHash
          : null,
        selectedPackageIds: Array.isArray(thirdPartyDataPacks.selectedPackageIds)
          ? thirdPartyDataPacks.selectedPackageIds.filter(value => typeof value === 'string')
          : [],
        loadOrder: Array.isArray(thirdPartyDataPacks.loadOrder)
          ? thirdPartyDataPacks.loadOrder.filter(value => typeof value === 'string')
          : []
      }
    : null
}

const createSettingsLockfileWriterProbeReport = async () => {
  const shouldExerciseWriteRead =
    runtimeProbeSettingsLockfileWriteRead && !!process.env.PORTABLE_EXECUTABLE_DIR

  if (!shouldExerciseWriteRead) {
    return {
      status: 'skipped',
      operation: 'inspect',
      diagnosticsCount: 0,
      settingsThirdPartyDataPacksMatched: false,
      modLockDraftRoundTripMatched: false,
      effects: {
        settingsWritten: false,
        lockfileWritten: false,
        packageFilesWritten: false,
        packageBackupsWritten: false,
        transactionCommitted: false,
        runtimePublicationCommitted: false,
        uiIpcResponseDelivered: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false,
        rollbackExecuted: false,
        diagnosticsWritten: false
      }
    }
  }

  const draft = createSyntheticModLockDraft()
  const pipeline = createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline({
    enabled: true,
    programDirectoryPath: process.env.PORTABLE_EXECUTABLE_DIR,
    readInstallPersistentStagingLifecyclePipeline: async() =>
      createSyntheticInstallPersistentStagingLifecycleResult(draft),
    readSettingsLockfileCommitSource: async() =>
      createSyntheticSettingsLockfileCommitSourceResult(draft),
    readLockfileDraft: async() => draft,
    writeSettings: writeProbeSettings
  })
  const result = await pipeline()
  const modLockRead = await createModLockProbe().read()
  let settingsValue = {}
  try {
    settingsValue = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
  } catch {
    settingsValue = {}
  }
  const settingsSummary = safeSettingsSummary(settingsValue)

  return {
    status: result.status,
    operation: 'write-read',
    installPersistentStagingLifecycleStatus:
      result.installPersistentStagingLifecyclePipelineStatus ?? null,
    settingsLockfilePersistentWriterSourceStatus:
      result.settingsLockfilePersistentWriterSourceStatus ?? null,
    targetPackageId: result.targetPackageId ?? null,
    selectedPackageCount: result.selectedPackageIds.length,
    blockedPackageCount: result.blockedPackageIds.length,
    loadOrderCount: result.loadOrder.length,
    registryCount: result.registryCount,
    entryCount: result.entryCount,
    packageCount: result.packageCount,
    candidateHashPresent: typeof result.candidateHash === 'string',
    lockfileHashPresent: typeof result.lockfileHash === 'string',
    commandContinuationAllowed: result.commandContinuationAllowed,
    uiIpcResultContinuationAllowed: result.uiIpcResultContinuationAllowed,
    persistentPackageWriteAcknowledged: result.persistentPackageWriteExecuted,
    persistentSettingsLockfileWriteExecuted: result.persistentSettingsLockfileWriteExecuted,
    diagnosticsCount: result.diagnostics.length,
    settingsThirdPartyDataPacksMatched: JSON.stringify(settingsSummary) === JSON.stringify({
      candidateHash: draft.candidateIdentity.candidateHash,
      lockfileHash: draft.lockfileHash,
      selectedPackageIds: draft.selectedPackageIds,
      loadOrder: draft.loadOrder
    }),
    modLockDraftRoundTripMatched: JSON.stringify(modLockRead.draft) === JSON.stringify(draft),
    effects: {
      settingsWritten: result.effects.settingsWritten,
      lockfileWritten: result.effects.lockfileWritten,
      packageFilesWritten: false,
      packageBackupsWritten: false,
      transactionCommitted: result.effects.transactionCommitted,
      runtimePublicationCommitted: result.effects.runtimePublicationCommitted,
      uiIpcResponseDelivered: result.effects.uiIpcResponseDelivered,
      savesWritten: result.effects.savesWritten,
      cacheWritten: result.effects.cacheWritten,
      transactionLogWritten: result.effects.transactionLogWritten,
      rollbackExecuted: result.effects.rollbackExecuted,
      diagnosticsWritten: result.effects.diagnosticsWritten
    }
  }
}

const createPackageFilePersistentStagingProbePipeline = (
  draft,
  storage = createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter({
    programDirectoryPath: process.env.PORTABLE_EXECUTABLE_DIR
  })
) =>
  createThirdPartyDataPackPackageFilePersistentStagingPipeline({
    enabled: true,
    allowPersistentWriteProbe: true,
    readAtomicCommitPreflight: async() => createSyntheticAtomicCommitPreflightResult(draft),
    readLockfileDraft: async() => draft,
    readPackageFilePayload: async() => createSyntheticPackageFilePayload(),
    storage
  })

const createPackageFilePersistentStagingProbeReport = async () => {
  const shouldExerciseWriteRead =
    runtimeProbePackageFileWriteRead && !!process.env.PORTABLE_EXECUTABLE_DIR

  if (!shouldExerciseWriteRead) {
    return {
      status: 'skipped',
      operation: 'inspect',
      diagnosticsCount: 0,
      writtenFileCount: 0,
      backedUpFileCount: 0,
      effects: {
        packageFilesWritten: false,
        packageBackupsWritten: false,
        settingsWritten: false,
        lockfileWritten: false,
        transactionCommitted: false,
        runtimePublicationCommitted: false,
        uiIpcResponseDelivered: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false,
        rollbackExecuted: false,
        diagnosticsWritten: false
      }
    }
  }

  const draft = createSyntheticModLockDraft()
  const pipeline = createPackageFilePersistentStagingProbePipeline(draft)
  const result = await pipeline()

  return {
    status: result.status,
    operation: 'write-read',
    packageFileStagingSourceStatus: result.packageFileStagingSourceStatus ?? null,
    packageFilePersistentWriteProbeStatus: result.packageFilePersistentWriteProbeStatus ?? null,
    targetPackageId: result.targetPackageId ?? null,
    selectedPackageCount: result.selectedPackageIds.length,
    blockedPackageCount: result.blockedPackageIds.length,
    loadOrderCount: result.loadOrder.length,
    registryCount: result.registryCount,
    entryCount: result.entryCount,
    packageCount: result.packageCount,
    candidateHashPresent: typeof result.candidateHash === 'string',
    lockfileHashPresent: typeof result.lockfileHash === 'string',
    commandContinuationAllowed: result.effects.commandContinuationAllowed,
    appBootstrapContinuationAllowed: result.effects.appBootstrapContinuationAllowed,
    packageFileWriteProbe: result.packageFileWriteProbe,
    writeProbeAllowed: result.writeProbeAllowed,
    persistentWriteExecuted: result.persistentWriteExecuted,
    writtenFileCount: result.writtenFileCount,
    backedUpFileCount: result.backedUpFileCount,
    writtenFilePaths: result.writtenFiles.map(file => file.path),
    diagnosticsCount: result.diagnostics.length,
    effects: {
      packageFilesWritten: result.effects.packageFilesWritten,
      packageBackupsWritten: result.effects.packageBackupsWritten,
      settingsWritten: result.effects.settingsWritten,
      lockfileWritten: result.effects.lockfileWritten,
      transactionCommitted: result.effects.transactionCommitted,
      runtimePublicationCommitted: result.effects.runtimePublicationCommitted,
      uiIpcResponseDelivered: result.effects.uiIpcResponseDelivered,
      savesWritten: result.effects.savesWritten,
      cacheWritten: result.effects.cacheWritten,
      transactionLogWritten: result.effects.transactionLogWritten,
      rollbackExecuted: result.effects.rollbackExecuted,
      diagnosticsWritten: result.effects.diagnosticsWritten
    }
  }
}

const createPackageFileRestoreProbeReport = async () => {
  const shouldExerciseRestore =
    runtimeProbePackageFileRestore && !!process.env.PORTABLE_EXECUTABLE_DIR

  if (!shouldExerciseRestore) {
    return {
      status: 'skipped',
      operation: 'inspect',
      diagnosticsCount: 0,
      restoredFileCount: 0,
      backupRestoredFileCount: 0,
      removedCreatedFileCount: 0,
      effects: {
        packageFilesWritten: false,
        packageBackupsWritten: false,
        packageFilesRestored: false,
        settingsWritten: false,
        lockfileWritten: false,
        transactionCommitted: false,
        runtimePublicationCommitted: false,
        uiIpcResponseDelivered: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false,
        rollbackExecuted: false,
        diagnosticsWritten: false
      }
    }
  }

  const draft = createSyntheticModLockDraft()
  const storage = createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter({
    programDirectoryPath: process.env.PORTABLE_EXECUTABLE_DIR
  })
  const pipeline = createPackageFilePersistentStagingProbePipeline(draft, storage)
  const writeResult = await pipeline()
  const restoreResult = await runThirdPartyDataPackPackageFilePersistentRestoreProbe({
    packageId: draft.selectedPackageIds[0],
    writtenFiles: writeResult.writtenFiles,
    storage,
    allowPersistentRestoreProbe: true
  })

  return {
    status: restoreResult.status,
    operation: 'write-restore',
    packageFilePersistentStagingStatus: writeResult.status,
    packageFilePersistentWriteProbeStatus: writeResult.packageFilePersistentWriteProbeStatus ?? null,
    targetPackageId: restoreResult.targetPackageId,
    selectedPackageCount: writeResult.selectedPackageIds.length,
    blockedPackageCount: writeResult.blockedPackageIds.length,
    loadOrderCount: writeResult.loadOrder.length,
    registryCount: writeResult.registryCount,
    entryCount: writeResult.entryCount,
    packageCount: writeResult.packageCount,
    candidateHashPresent: typeof writeResult.candidateHash === 'string',
    lockfileHashPresent: typeof writeResult.lockfileHash === 'string',
    packageFileRestoreProbe: restoreResult.packageFileRestoreProbe,
    restoreProbeAllowed: restoreResult.restoreProbeAllowed,
    persistentRestoreExecuted: restoreResult.persistentRestoreExecuted,
    writtenFileCount: writeResult.writtenFileCount,
    backedUpFileCount: writeResult.backedUpFileCount,
    restoredFileCount: restoreResult.restoredFileCount,
    backupRestoredFileCount: restoreResult.backupRestoredFileCount,
    removedCreatedFileCount: restoreResult.removedCreatedFileCount,
    restoredFilePaths: restoreResult.restoredFiles.map(file => file.path),
    diagnosticsCount: writeResult.diagnostics.length + restoreResult.diagnostics.length,
    effects: {
      packageFilesWritten: writeResult.effects.packageFilesWritten,
      packageBackupsWritten: writeResult.effects.packageBackupsWritten,
      packageFilesRestored: restoreResult.effects.packageFilesRestored,
      settingsWritten: false,
      lockfileWritten: false,
      transactionCommitted: false,
      runtimePublicationCommitted: false,
      uiIpcResponseDelivered: false,
      savesWritten: false,
      cacheWritten: false,
      transactionLogWritten: false,
      rollbackExecuted: restoreResult.effects.rollbackExecuted,
      diagnosticsWritten: restoreResult.effects.diagnosticsWritten
    }
  }
}

const packageIdListsMatch = (left, right) =>
  Array.isArray(left)
  && Array.isArray(right)
  && left.length === right.length
  && left.every((value, index) => value === right[index])

const installCommandDispatchIpcProofMatchesEnvelope = (proof, envelope) =>
  proof?.status === 'dispatched'
  && proof.requestedCommandId === envelope.requestedCommandId
  && proof.targetPackageId === envelope.targetPackageId
  && packageIdListsMatch(proof.selectedPackageIds, envelope.selectedPackageIds)
  && packageIdListsMatch(proof.blockedPackageIds, envelope.blockedPackageIds)
  && packageIdListsMatch(proof.loadOrder, envelope.loadOrder)
  && proof.registryCount === envelope.registryCount
  && proof.entryCount === envelope.entryCount
  && proof.packageCount === envelope.packageCount
  && proof.candidateIdentity?.formatVersion === envelope.candidateIdentity.formatVersion
  && proof.candidateIdentity?.contentHash === envelope.candidateIdentity.contentHash
  && proof.candidateIdentity?.snapshotHash === envelope.candidateIdentity.snapshotHash
  && proof.candidateIdentity?.candidateHash === envelope.candidateIdentity.candidateHash
  && proof.lockfileHash === envelope.lockfileHash

const createBlockedInstallCommandDispatchIpcProofResult = envelope => ({
  status: 'blocked',
  requestedCommandId: 'install',
  targetPackageId: envelope.targetPackageId,
  diagnostics: [
    {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.electron-install-command-lifecycle.ipc-dispatch-proof-missing',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId: envelope.targetPackageId,
      recovery: 'retry'
    }
  ],
  effects: {
    ...createSyntheticNoRealLifecycleEffects(),
    commandDispatcherCalled: true,
    commandDispatched: false
  }
})

const createBlockedOrdinaryInstallTerminalContinuationResult = (
  reason,
  diagnostics = []
) => ({
  status: 'blocked',
  reason,
  diagnostics: Array.isArray(diagnostics) ? diagnostics : []
})

const safePipelineStatus = result => {
  const status = result?.status
  return typeof status === 'string' && status.length > 0 ? status : 'not-run'
}

const safePipelineReason = result => {
  const reason = result?.reason
  return typeof reason === 'string' && reason.length > 0 ? reason : 'not-run'
}

const safeFirstDiagnosticStage = result => {
  const diagnostic = Array.isArray(result?.diagnostics) ? result.diagnostics[0] : undefined
  if (diagnostic === undefined || diagnostic === null || typeof diagnostic !== 'object') return 'none'
  const stage = typeof diagnostic.stage === 'string' ? diagnostic.stage : 'unknown-stage'
  const fieldPath = typeof diagnostic.fieldPath === 'string' ? diagnostic.fieldPath : ''
  return `${stage}${fieldPath}`
}

const installCommandDispatchIpcProofMatchesEnvelopeSafely = (proof, envelope) => {
  try {
    return installCommandDispatchIpcProofMatchesEnvelope(proof, envelope)
  } catch {
    return false
  }
}

const createOrdinaryInstallTerminalSettingsLockfileCommitSourceResult = draft => ({
  ...createSyntheticSettingsLockfileCommitSourceResult(draft),
  reason: 'Electron ordinary install terminal continuation accepted settings-lockfile commit handoff evidence'
})

const createOrdinaryInstallTerminalAtomicPreflightResult = draft => ({
  ...createSyntheticAtomicCommitPreflightResult(draft),
  reason: 'Electron ordinary install terminal continuation supplies a path-free atomic preflight acknowledgement'
})

const createOrdinaryInstallTerminalDispatchHostResult = envelope => ({
  status: 'dispatched',
  requestedCommandId: 'install',
  targetPackageId: envelope.targetPackageId,
  effects: {
    ...createSyntheticNoRealLifecycleEffects(),
    commandDispatcherCalled: true,
    commandDispatched: true
  }
})

const createOrdinaryInstallTerminalAtomicCommitHostResult = envelope => ({
  status: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: envelope.targetPackageId,
  commitOutcomeKind: envelope.commitOutcomeKind,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  diagnostics: [],
  effects: {
    ...createSyntheticNoRealLifecycleEffects(),
    atomicCommitExecutorHostCalled: true,
    atomicCommitExecutorHostAccepted: true
  }
})

const createOrdinaryInstallTerminalPersistentReadStateResult = envelope => ({
  status: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  packageFileStagingHostStatus: envelope.packageFileStagingHostStatus,
  settingsLockfileCommitHostStatus: envelope.settingsLockfileCommitHostStatus,
  modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
  transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
  modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
  transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
  persistentReadProofs: {
    transactionLogCommitted: true,
    packageStateMatched: true,
    settingsStateMatched: true,
    modLockStateMatched: true,
    liveRegistryMatched: true,
    saveCacheIsolated: true
  },
  diagnostics: [],
  effects: {
    ...createSyntheticNoRealLifecycleEffects(),
    postCommitPersistentReadsHostCalled: true,
    postCommitPersistentReadsHostAccepted: true
  }
})

const createOrdinaryInstallTerminalPostCommitVerificationHostResult = envelope => ({
  status: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: envelope.targetPackageId,
  verificationOutcomeKind: envelope.verificationOutcomeKind,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  transactionLogMatched: envelope.transactionLogMatched,
  packageStateMatched: envelope.packageStateMatched,
  settingsLockfileMatched: envelope.settingsLockfileMatched,
  liveRegistryMatched: envelope.liveRegistryMatched,
  saveCacheIsolated: envelope.saveCacheIsolated,
  diagnostics: [],
  effects: {
    ...createSyntheticNoRealLifecycleEffects(),
    postCommitVerificationExecutorHostCalled: true,
    postCommitVerificationExecutorHostAccepted: true
  }
})

const createPathFreeInstallTransactionCommitConnectionHostResult = envelope => ({
  status: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  persistentPackageWriteExecuted: envelope.persistentPackageWriteExecuted,
  persistentSettingsLockfileWriteExecuted: envelope.persistentSettingsLockfileWriteExecuted,
  writtenFileCount: envelope.writtenFileCount,
  backedUpFileCount: envelope.backedUpFileCount,
  diagnostics: [],
  effects: {
    installTransactionCommitConnectionHostCalled: true,
    installTransactionCommitConnectionHostAccepted: true,
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
  }
})

const createOrdinaryInstallTerminalPostCommitPersistentReadWriteHostResult = envelope => ({
  status: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  persistentPackageWriteExecuted: envelope.persistentPackageWriteExecuted,
  persistentSettingsLockfileWriteExecuted: envelope.persistentSettingsLockfileWriteExecuted,
  writtenFileCount: envelope.writtenFileCount,
  backedUpFileCount: envelope.backedUpFileCount,
  transactionCommitConnectionAcknowledged: envelope.transactionCommitConnectionAcknowledged,
  diagnostics: [],
  effects: {
    postCommitPersistentReadWriteConnectionHostCalled: true,
    postCommitPersistentReadWriteConnectionHostAccepted: true,
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
  }
})

const createOrdinaryInstallTerminalUiIpcSummary = source => ({
  selectedPackageCount: source.selectedPackageIds.length,
  blockedPackageCount: source.blockedPackageIds.length,
  blockedCandidateCount: 0,
  loadOrderCount: source.loadOrder.length,
  registryCount: source.registryCount,
  entryCount: source.entryCount,
  packageCount: source.packageCount,
  diagnosticCount: 0
})

const createOrdinaryInstallTerminalUiIpcConvergenceEffects = () => ({
  uiIpcResponseDeliveryAcknowledgementConvergenceSourceCalled: true,
  selectedPlatformHandoffSourceCalled: true,
  selectedPlatformHandoffAccepted: true,
  deliveryAcknowledgementConverged: true,
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
  electronIpcResponseSent: true,
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
  successEnvelopeDelivered: true,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
  uiIpcResponseDelivered: true,
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
  electronResponseDeliveryAcknowledgementConsumed: true,
  webResponseDeliveryAcknowledgementConsumed: false,
  androidResponseDeliveryAcknowledgementConsumed: false,
  startupGateHandoffPreflightConsumed: true,
  responseDeliveryStartupGateHandoffPrepared: true
})

const createOrdinaryInstallTerminalUiIpcConvergenceResult = source => {
  const summary = createOrdinaryInstallTerminalUiIpcSummary(source)
  const targetPackageId = source.targetPackageId
  return {
    kind: 'third-party-ui-ipc-response-delivery-acknowledgement-convergence-source',
    mode: 'default-disabled-ui-ipc-response-delivery-acknowledgement-convergence-source',
    selectedPlatform: 'electron',
    status: 'ready',
    reason: 'Electron ordinary install terminal continuation acknowledged visible install success delivery',
    readOnly: true,
    enabled: true,
    sourceCalled: true,
    startupGateContinuationAllowed: true,
    platformSourceStatus: 'ready',
    platformResponseDeliveryStatus: 'delivered',
    startupGateHandoffPreflightStatus: 'deferred',
    platformResponseDelivered: true,
    deliveryAcknowledgementConsumed: true,
    startupGateHandoffPreflightConsumed: true,
    responseDeliveryStartupGateHandoffPrepared: true,
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
    selectedPackageIds: source.selectedPackageIds,
    blockedPackageIds: source.blockedPackageIds,
    blockedCandidateCount: 0,
    loadOrder: source.loadOrder,
    registryCount: source.registryCount,
    entryCount: source.entryCount,
    packageCount: source.packageCount,
    candidateIdentity: source.candidateIdentity,
    lockfileHash: source.lockfileHash,
    deliveryEnvelopeSummary: {
      formatVersion: 1,
      kind: 'success',
      commandId: 'install',
      packageId: targetPackageId,
      candidateHash: source.candidateHash,
      lockfileHash: source.lockfileHash,
      messageKey: 'mods.ui.ipc.result.install.success',
      recovery: 'none',
      retryable: false,
      rollbackRequired: false,
      summary,
      diagnosticCount: 0
    },
    acknowledgement: {
      status: 'acknowledged',
      channel: 'electron-preload-response-channel',
      packageId: targetPackageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    },
    checks: [],
    diagnostics: [],
    summary,
    effects: createOrdinaryInstallTerminalUiIpcConvergenceEffects()
  }
}

const createOrdinaryInstallTerminalRollbackUiIpcContinuationResult = source => {
  const summary = createOrdinaryInstallTerminalUiIpcSummary(source)
  const targetPackageId = source.targetPackageId
  return {
    kind: 'third-party-post-commit-ui-ipc-delivery-continuation-source',
    mode: 'default-disabled-post-commit-ui-ipc-delivery-continuation-source',
    selectedPlatform: 'electron',
    status: 'ready',
    reason: 'Electron visible import acknowledged rollback delivery without runtime publication',
    readOnly: true,
    enabled: true,
    sourceCalled: true,
    postCommitPersistentReadWriteConnectionStatus: 'accepted',
    uiIpcResponseDeliveryAcknowledgementConvergenceStatus: 'ready',
    requestedCommandId: 'install',
    targetPackageId,
    envelopeKind: 'rollback',
    messageKey: 'mods.ui.ipc.result.install.rollback',
    selectedPackageIds: source.selectedPackageIds,
    blockedPackageIds: source.blockedPackageIds,
    blockedCandidateCount: source.blockedCandidateCount ?? 0,
    loadOrder: source.loadOrder,
    registryCount: source.registryCount,
    entryCount: source.entryCount,
    packageCount: source.packageCount,
    candidateIdentity: source.candidateIdentity,
    candidateHash: source.candidateHash,
    lockfileHash: source.lockfileHash,
    deliverySummary: {
      formatVersion: 1,
      kind: 'rollback',
      commandId: 'install',
      packageId: targetPackageId,
      candidateHash: source.candidateHash,
      lockfileHash: source.lockfileHash,
      messageKey: 'mods.ui.ipc.result.install.rollback',
      recovery: 'restore-backup',
      retryable: false,
      rollbackRequired: true,
      summary,
      diagnosticCount: 0
    },
    acknowledgement: {
      status: 'acknowledged',
      platform: 'electron',
      packageId: targetPackageId,
      envelopeKind: 'rollback',
      messageKey: 'mods.ui.ipc.result.install.rollback'
    },
    persistentPackageWriteExecuted: false,
    persistentSettingsLockfileWriteExecuted: false,
    writtenFileCount: 0,
    backedUpFileCount: 0,
    transactionCommitConnectionAcknowledged: false,
    postCommitPersistentReadWriteConnectionAcknowledged: true,
    uiIpcDeliveryAcknowledged: true,
    commandContinuationAllowed: true,
    uiIpcResultContinuationAllowed: true,
    startupGateContinuationAllowed: false,
    checks: [],
    diagnostics: [],
    summary,
    effects: {
      ...createOrdinaryInstallTerminalUiIpcConvergenceEffects(),
      startupGateContinuationAllowed: false,
      successEnvelopeDelivered: false,
      rollbackStateDelivered: true,
      runtimeEnablementAllowed: false,
      packageFilesWritten: false,
      packageBackupsWritten: false,
      settingsWritten: false,
      lockfileWritten: false,
      transactionLogWritten: false,
      rollbackExecuted: false
    }
  }
}

const createOrdinaryInstallTerminalFailureUiIpcContinuationResult = source => {
  const candidateHash = source.candidateHash ?? source.candidateIdentity?.candidateHash
  const summary = createOrdinaryInstallTerminalUiIpcSummary(source)
  const targetPackageId = source.targetPackageId
  return {
    kind: 'third-party-post-commit-ui-ipc-delivery-continuation-source',
    mode: 'default-disabled-post-commit-ui-ipc-delivery-continuation-source',
    selectedPlatform: 'electron',
    status: 'ready',
    reason: 'Electron visible import delivered retryable failure without runtime publication',
    readOnly: true,
    enabled: true,
    sourceCalled: true,
    postCommitPersistentReadWriteConnectionStatus: 'accepted',
    uiIpcResponseDeliveryAcknowledgementConvergenceStatus: 'ready',
    requestedCommandId: 'install',
    targetPackageId,
    envelopeKind: 'failure',
    messageKey: 'mods.ui.ipc.result.install.failure',
    recovery: 'retry',
    retryable: true,
    rollbackRequired: false,
    selectedPackageIds: source.selectedPackageIds,
    blockedPackageIds: source.blockedPackageIds,
    blockedCandidateCount: source.blockedCandidateCount ?? 0,
    loadOrder: source.loadOrder,
    registryCount: source.registryCount,
    entryCount: source.entryCount,
    packageCount: source.packageCount,
    candidateIdentity: source.candidateIdentity,
    candidateHash,
    lockfileHash: source.lockfileHash,
    deliverySummary: {
      formatVersion: 1,
      kind: 'failure',
      commandId: 'install',
      packageId: targetPackageId,
      candidateHash,
      lockfileHash: source.lockfileHash,
      messageKey: 'mods.ui.ipc.result.install.failure',
      recovery: 'retry',
      retryable: true,
      rollbackRequired: false,
      summary,
      diagnosticCount: 0
    },
    acknowledgement: {
      status: 'acknowledged',
      platform: 'electron',
      packageId: targetPackageId,
      envelopeKind: 'failure',
      messageKey: 'mods.ui.ipc.result.install.failure'
    },
    persistentPackageWriteExecuted: false,
    persistentSettingsLockfileWriteExecuted: false,
    writtenFileCount: 0,
    backedUpFileCount: 0,
    transactionCommitConnectionAcknowledged: false,
    postCommitPersistentReadWriteConnectionAcknowledged: true,
    uiIpcDeliveryAcknowledged: true,
    commandContinuationAllowed: true,
    uiIpcResultContinuationAllowed: true,
    startupGateContinuationAllowed: true,
    checks: [],
    diagnostics: [],
    summary,
    effects: {
      ...createOrdinaryInstallTerminalUiIpcConvergenceEffects(),
      successEnvelopeDelivered: false,
      failureEnvelopeDelivered: true,
      rollbackStateDelivered: false,
      runtimeEnablementAllowed: false,
      packageFilesWritten: false,
      packageBackupsWritten: false,
      settingsWritten: false,
      lockfileWritten: false,
      transactionLogWritten: false,
      rollbackExecuted: false
    }
  }
}

const electronVisibleImportContinuationRootPath = 'electron-visible-import'
const electronVisibleImportContinuationSourceId = 'electron-visible-import-continuation'

const stringArraysEqual = (left = [], right = []) =>
  left.length === right.length && left.every((value, index) => value === right[index])

const candidateIdentitiesEqual = (left, right) => left !== undefined
  && right !== undefined
  && left.formatVersion === right.formatVersion
  && left.contentHash === right.contentHash
  && left.snapshotHash === right.snapshotHash
  && left.candidateHash === right.candidateHash

const runtimePublicationSummariesMatch = (left, right) => left !== undefined
  && right !== undefined
  && left.status === 'deferred'
  && right.status === 'deferred'
  && left.lockfileHash === right.lockfileHash
  && left.registryCount === right.registryCount
  && left.entryCount === right.entryCount
  && left.packageCount === right.packageCount
  && stringArraysEqual(left.selectedPackageIds, right.selectedPackageIds)
  && stringArraysEqual(left.blockedPackageIds, right.blockedPackageIds)
  && stringArraysEqual(left.blockedCandidatePaths, right.blockedCandidatePaths)
  && stringArraysEqual(left.loadOrder, right.loadOrder)
  && candidateIdentitiesEqual(left.candidateIdentity, right.candidateIdentity)

const createVisibleImportContinuationMemorySource = (packageFilePayload, lockfileDraft) => {
  const packageDraft = lockfileDraft?.packages?.[0]
  const candidatePath = typeof packageDraft?.source?.candidatePath === 'string'
    ? packageDraft.source.candidatePath
    : syntheticPackageRoot
  return createMemoryContentPackageSource({
    sourceId: electronVisibleImportContinuationSourceId,
    rootPath: electronVisibleImportContinuationRootPath,
    files: packageFilePayload.map(file => ({
      path: `${candidatePath}/${file.path}`,
      text: file.contents
    }))
  })
}

const createRuntimePublicationContinuationContext = async(
  packageFilePayload,
  lockfileDraft,
  rendererRuntimePublicationCommitAdapter
) => {
  const source = createVisibleImportContinuationMemorySource(packageFilePayload, lockfileDraft)
  const discoveryReport = await discoverThirdPartyDataPacks(
    source.identity.rootPath,
    createDiscoveryFileSystemFromContentPackageSource(source)
  )
  const officialRegistrySet = restoreOfficialPrecompiledRegistryArtifact(
    OFFICIAL_REGISTRY_DEFINITIONS,
    officialPrecompiledRegistryArtifact,
    officialCacheMetadata.environmentHash
  )
  const mountInput = buildThirdPartyDataPackMountInput({
    officialRegistrySet,
    discoveryReport
  })
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
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection,
    publicationRollbackRecovery
  })

  if (
    mountInput.status !== 'ready'
    || mountInput.candidateRegistrySet === undefined
    || mountInput.candidateIdentity === undefined
    || mountInput.lockfileDraft === undefined
    || mountInput.lockfileHash === undefined
    || (
      lockfileDraft !== undefined
      && lockfileDraft.lockfileHash !== mountInput.lockfileHash
    )
    || (
      rendererRuntimePublicationCommitAdapter !== undefined
      && !runtimePublicationSummariesMatch(
        runtimePublicationCommitAdapter,
        rendererRuntimePublicationCommitAdapter
      )
    )
  ) {
    return undefined
  }

  return {
    officialRegistrySet,
    discoveryReport,
    mountInput,
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection,
    publicationRollbackRecovery,
    runtimePublicationCommitAdapter
  }
}

const createRealRecoveryLogReplayRestoreSourceResult = async(
  packageFilePayload,
  lockfileDraft,
  runtimePublicationCommitAdapter,
  restoreResult
) => {
  const context = await createRuntimePublicationContinuationContext(
    packageFilePayload,
    lockfileDraft,
    runtimePublicationCommitAdapter
  )
  if (context === undefined) {
    throw new Error('Electron recovery log replay/restore requires a matching runtime publication context')
  }

  const pipeline = createThirdPartyDataPackRecoveryLogReplayRestorePipeline({
    enabled: true,
    readPublicationRollbackRecovery: async() => context.publicationRollbackRecovery,
    readRuntimePublicationCommitAdapter: async() => context.runtimePublicationCommitAdapter,
    executeRecoveryLogReplayRestore: async envelope =>
      createRealRecoveryLogReplayRestoreHostResult(envelope, restoreResult)
  })

  return pipeline()
}

const createOrdinaryInstallTerminalPostCommitAfterInstallTransactionCommitResult = (
  source,
  finalization
) => ({
  status: 'ready',
  reason: 'Electron visible import reached committed post-commit verification evidence for runtime publication handoff',
  readOnly: true,
  enabled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
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
  checks: [],
  diagnostics: [],
  effects: {
    postCommitVerificationAfterInstallTransactionCommitPipelineCalled: true,
    installTransactionCommitFinalizationPipelineCalled: true,
    postCommitVerificationReadAcknowledgementPipelineCalled: true,
    transactionCommitted: finalization.effects.transactionCommitted === true,
    transactionLogCommitted: finalization.effects.transactionLogCommitted === true,
    postCommitVerificationAcknowledged: true,
    persistentReadProofAcknowledged: true,
    appBootstrapContinuationAllowed: true,
    commandContinuationAllowed: true,
    uiIpcResultContinuationAllowed: true,
    transactionLogPrepared: finalization.effects.transactionLogPrepared === true,
    transactionLogWritten: finalization.effects.transactionLogWritten === true,
    transactionLogRead: finalization.effects.transactionLogRead === true,
    packageFilesWritten: finalization.effects.packageFilesWritten === true,
    packageBackupsWritten: finalization.effects.packageBackupsWritten === true,
    lockfileWritten: finalization.effects.lockfileWritten === true,
    settingsWritten: finalization.effects.settingsWritten === true
  }
})

const createOrdinaryInstallTerminalReadyNormalStartupSource = source => ({
  kind: 'third-party-normal-startup-handoff-execution-source',
  mode: 'default-disabled-normal-startup-handoff-execution-source',
  status: 'ready',
  reason: 'Electron visible import normal startup handoff accepted runtime publication continuation',
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
  diagnostics: [],
  summary: createOrdinaryInstallTerminalUiIpcSummary({
    ...source,
    targetPackageId: source.selectedPackageIds[0]
  }),
  effects: {
    normalStartupHandoffExecutionSourceCalled: true,
    startupGateBootstrapSourceCalled: true,
    injectedNormalStartupHandoffHostCalled: true,
    normalStartupHandoffHostCalled: true,
    normalStartupHandoffHostAccepted: true,
    normalStartupContinuationAllowed: true
  }
})

const createOrdinaryInstallTerminalAcceptedAppStartupHostResult = envelope => ({
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
  diagnostics: [],
  effects: {
    appStartupHostCalled: true,
    appStartupHostAccepted: true,
    realAppStartupHostCalled: false,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
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
  }
})

const createRuntimePublicationContinuationResults = async(
  context,
  installTransactionCommitFinalization
) => {
  const source = context.runtimePublicationCommitAdapter
  const runtimePublicationCommitHost = createThirdPartyDataPackRuntimePublicationCommitHost({
    selectedPackageIds: source.selectedPackageIds,
    blockedPackageIds: source.blockedPackageIds,
    blockedCandidatePaths: source.blockedCandidatePaths,
    loadOrder: source.loadOrder,
    registryCount: source.registryCount,
    entryCount: source.entryCount,
    packageCount: source.packageCount,
    candidateIdentity: source.candidateIdentity,
    lockfileHash: source.lockfileHash
  })
  const readRuntimePublicationCommit = createThirdPartyDataPackRuntimePublicationCommitSource({
    enabled: true,
    readRuntimePublicationCommitAdapter: async() => source,
    acknowledgeRuntimePublicationCommit:
      runtimePublicationCommitHost.acknowledgeRuntimePublicationCommit
  })
  let runtimePublicationCommitAfterPostCommitVerification
  const readRuntimePublicationCommitAfterPostCommitVerification = async() => {
    runtimePublicationCommitAfterPostCommitVerification ??=
      createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline({
        enabled: true,
        readPostCommitVerificationAfterInstallTransactionCommit: async() =>
          createOrdinaryInstallTerminalPostCommitAfterInstallTransactionCommitResult(
            source,
            installTransactionCommitFinalization
          ),
        readRuntimePublicationCommit
      })()
    return runtimePublicationCommitAfterPostCommitVerification
  }

  const liveRegistryReference = createThirdPartyDataPackInMemoryLiveRegistryReference(
    context.officialRegistrySet
  )
  const readRuntimePublicationLiveRegistrySwapHostConnection =
    createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline({
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
        createOrdinaryInstallTerminalReadyNormalStartupSource(source)
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
    await createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
      enabled: true,
      platform: 'electron',
      readRuntimePublicationCommitAppStartupReadiness: async() =>
        runtimePublicationCommitAppStartupReadiness,
      acknowledgeAppStartupHostWiring: async envelope =>
        createOrdinaryInstallTerminalAcceptedAppStartupHostResult(envelope)
    })()

  return {
    runtimePublicationCommitAfterPostCommitVerification:
      await readRuntimePublicationCommitAfterPostCommitVerification(),
    runtimePublicationCommitLiveRegistrySwapHostConnection,
    runtimePublicationCommitAppStartupReadiness,
    runtimePublicationCommitAppStartupHostConnection
  }
}

const continueOrdinaryInstallTerminalFromRenderer = async envelope => {
  if (!envelope || typeof envelope !== 'object') {
    return createBlockedOrdinaryInstallTerminalContinuationResult(
      'Electron ordinary install terminal continuation requires a structured envelope'
    )
  }

  const transactionCommandDispatcherHandoff = envelope.transactionCommandDispatcherHandoff
  const installTransactionDispatchPlan = envelope.installTransactionDispatchPlan
  const runtimePublicationCommitAdapter = envelope.runtimePublicationCommitAdapter
  const lockfileDraft = envelope.lockfileDraft
  const packageFilePayload = envelope.packageFilePayload

  if (
    !installCommandDispatchIpcProofMatchesEnvelopeSafely(
      thirdPartyDataPackInstallCommandDispatchIpcProof,
      transactionCommandDispatcherHandoff
    )
  ) {
    return createBlockedOrdinaryInstallTerminalContinuationResult(
      'Electron ordinary install terminal continuation requires a matching renderer dispatch proof'
    )
  }

  if (
    !lockfileDraft
    || !Array.isArray(lockfileDraft.packages)
    || !Array.isArray(packageFilePayload)
  ) {
    return createBlockedOrdinaryInstallTerminalContinuationResult(
      'Electron ordinary install terminal continuation requires a validated lockfile draft and package payload'
    )
  }

  const targetPackageId = transactionCommandDispatcherHandoff.targetPackageId
  if (
    typeof targetPackageId !== 'string'
    || !lockfileDraft.packages.some(currentPackage => currentPackage.packageId === targetPackageId)
  ) {
    return createBlockedOrdinaryInstallTerminalContinuationResult(
      'Electron ordinary install terminal continuation requires a target package in the lockfile draft'
    )
  }

  let installCommandPostCommitAcknowledgement
  let packageFilePersistentStaging
  let packageFilePersistentStagingResult
  let settingsLockfileLifecycle
  let settingsLockfileLifecycleResult
  let transactionCommitConnection
  let transactionCommitConnectionResult
  let installTransactionLogPrepared
  let installTransactionLogPreparedPersistentReadVerification
  let installTransactionCommitFinalization
  let postCommitUiIpcDeliveryContinuation
  const programDirectoryPath = process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath)

  const readSettingsLockfileCommitSource = async() =>
    createOrdinaryInstallTerminalSettingsLockfileCommitSourceResult(lockfileDraft)

  const installCommandLifecyclePipeline = createThirdPartyDataPackInstallCommandLifecyclePipeline({
    enabled: true,
    readTransactionCommandDispatcherHandoff: async() => transactionCommandDispatcherHandoff,
    readInstallTransactionDispatchPlan: async() => installTransactionDispatchPlan,
    readRuntimePublicationCommitAdapter: async() => runtimePublicationCommitAdapter,
    dispatchTransactionCommand: async currentEnvelope => (
      installCommandDispatchIpcProofMatchesEnvelopeSafely(
        thirdPartyDataPackInstallCommandDispatchIpcProof,
        currentEnvelope
      )
        ? createOrdinaryInstallTerminalDispatchHostResult(currentEnvelope)
        : createBlockedInstallCommandDispatchIpcProofResult(currentEnvelope)
    ),
    executeAtomicTransactionCommitOutcomeHost: {
      kind: 'electron-main-visible-import-atomic-transaction-commit-executor',
      mode: 'electron-main-visible-import',
      execute: request => ({
        kind: 'committed',
        settled: true,
        packageId: request.packageId,
        candidateIdentity: request.candidateIdentity,
        lockfileHash: request.lockfileHash,
        messageKey: 'mods.atomic.commit.install.committed',
        recovery: 'none'
      })
    },
    executeAtomicTransactionCommit: async currentEnvelope =>
      createOrdinaryInstallTerminalAtomicCommitHostResult(currentEnvelope),
    readSettingsLockfileCommitSource,
    readPostCommitVerificationExecutorAdapter: async() =>
      createSyntheticPostCommitVerificationExecutorAdapterResult(
        lockfileDraft,
        'electron-main-visible-import'
      ),
    readPostCommitPersistentState: async currentEnvelope =>
      createOrdinaryInstallTerminalPersistentReadStateResult(currentEnvelope),
    executePostCommitVerification: async currentEnvelope =>
      createOrdinaryInstallTerminalPostCommitVerificationHostResult(currentEnvelope)
  })

  const readInstallCommandLifecyclePipeline = async() => {
    installCommandPostCommitAcknowledgement ??= installCommandLifecyclePipeline().catch(error => {
      if (error instanceof ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError) {
        return error.result
      }
      throw error
    })
    return installCommandPostCommitAcknowledgement
  }

  const packageFilePersistentStagingStorage =
    createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter({
      programDirectoryPath
    })
  const packageFilePersistentStagingPipeline = createThirdPartyDataPackPackageFilePersistentStagingPipeline({
    enabled: true,
    allowPersistentWriteProbe: true,
    readAtomicCommitPreflight: async() => createOrdinaryInstallTerminalAtomicPreflightResult(lockfileDraft),
    readLockfileDraft: async() => lockfileDraft,
    readPackageFilePayload: async() => packageFilePayload,
    storage: packageFilePersistentStagingStorage
  })

  const readPackageFilePersistentStagingPipeline = async() => {
    packageFilePersistentStaging ??= packageFilePersistentStagingPipeline()
    packageFilePersistentStagingResult = await packageFilePersistentStaging
    return packageFilePersistentStagingResult
  }

  const settingsLockfileLifecyclePipeline =
    createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline({
      enabled: true,
      programDirectoryPath,
      readPackageFilePersistentStagingPipeline,
      readInstallCommandLifecyclePipeline,
      readSettingsLockfileCommitSource,
      readLockfileDraft: async() => lockfileDraft,
      writeSettings: writeProbeSettings
    })

  const readSettingsLockfileLifecyclePipeline = async() => {
    settingsLockfileLifecycle ??= settingsLockfileLifecyclePipeline()
    settingsLockfileLifecycleResult = await settingsLockfileLifecycle
    return settingsLockfileLifecycleResult
  }

  const transactionCommitConnectionSource =
    createThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource({
      enabled: true,
      readInstallPersistentStagingSettingsLockfileLifecyclePipeline: readSettingsLockfileLifecyclePipeline,
      acknowledgeInstallTransactionCommit: async currentEnvelope =>
        createPathFreeInstallTransactionCommitConnectionHostResult(currentEnvelope)
    })

  const readTransactionCommitConnectionSource = async() => {
    transactionCommitConnection ??= transactionCommitConnectionSource().catch(error => {
      if (error instanceof ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionBlockedError) {
        transactionCommitConnectionResult = error.result
      }
      throw error
    })
    transactionCommitConnectionResult = await transactionCommitConnection
    return transactionCommitConnectionResult
  }

  const installTransactionLogPreparedPipeline =
    createThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline({
      enabled: true,
      allowPersistentTransactionLogPrepare: true,
      readTransactionCommitConnectionSource,
      storage: createThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter({
        programDirectoryPath
      })
    })

  const readInstallTransactionLogPrepared = async() => {
    installTransactionLogPrepared ??= installTransactionLogPreparedPipeline()
    return installTransactionLogPrepared
  }

  const installTransactionLogPreparedPersistentReadVerificationPipeline =
    createThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline({
      enabled: true,
      allowPersistentTransactionLogReadVerification: true,
      readInstallTransactionLogPreparedPipeline: readInstallTransactionLogPrepared,
      programDirectoryPath
    })

  const readInstallTransactionLogPreparedPersistentReadVerification = async() => {
    installTransactionLogPreparedPersistentReadVerification ??=
      installTransactionLogPreparedPersistentReadVerificationPipeline()
    return installTransactionLogPreparedPersistentReadVerification
  }

  const installTransactionCommitFinalizationPipeline =
    createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline({
      enabled: true,
      allowInstallTransactionCommitFinalization: true,
      readPreparedTransactionLogVerification:
        readInstallTransactionLogPreparedPersistentReadVerification
    })

  const readInstallTransactionCommitFinalization = async() => {
    installTransactionCommitFinalization ??= installTransactionCommitFinalizationPipeline()
    return installTransactionCommitFinalization
  }

  const postCommitUiIpcDeliveryContinuationPipeline =
    createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline({
      enabled: true,
      readTransactionCommitConnectionSource,
      acknowledgePostCommitPersistentReadWrite: async currentEnvelope =>
        createOrdinaryInstallTerminalPostCommitPersistentReadWriteHostResult(currentEnvelope),
      readUiIpcResponseDeliveryAcknowledgementConvergenceSource: async() =>
        createOrdinaryInstallTerminalUiIpcConvergenceResult(
          await readTransactionCommitConnectionSource()
        )
    })

  const readPostCommitUiIpcDeliveryContinuation = async() => {
    postCommitUiIpcDeliveryContinuation ??= postCommitUiIpcDeliveryContinuationPipeline().catch(error => {
      if (error instanceof ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError) {
        return error.result
      }
      throw error
    })
    return postCommitUiIpcDeliveryContinuation
  }

  const ordinaryInstallTerminalPipeline =
    createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline({
      enabled: true,
      readPostCommitUiIpcDeliveryContinuationSource: readPostCommitUiIpcDeliveryContinuation
    })

  if (runtimeProbeVisibleImportFailure) {
    const readFailureTransactionCommandDispatcherSource =
      createThirdPartyDataPackTransactionCommandDispatcherSource({
        enabled: true,
        readTransactionCommandDispatcherHandoff: async() => transactionCommandDispatcherHandoff,
        dispatchTransactionCommand: async currentEnvelope => (
          installCommandDispatchIpcProofMatchesEnvelopeSafely(
            thirdPartyDataPackInstallCommandDispatchIpcProof,
            currentEnvelope
          )
            ? createOrdinaryInstallTerminalDispatchHostResult(currentEnvelope)
            : createBlockedInstallCommandDispatchIpcProofResult(currentEnvelope)
        )
      })
    const readFailureInstallCommandPostCommitAcknowledgement =
      createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource({
        enabled: true,
        readTransactionCommandDispatcherSource: async() => {
          try {
            return await readFailureTransactionCommandDispatcherSource()
          } catch (error) {
            if (error instanceof ThirdPartyDataPackTransactionCommandDispatcherBlockedError) {
              return error.result
            }
            throw error
          }
        }
      })
    let failureInstallCommandPostCommitAcknowledgementResult
    try {
      failureInstallCommandPostCommitAcknowledgementResult =
        await readFailureInstallCommandPostCommitAcknowledgement()
    } catch (error) {
      if (error instanceof ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError) {
        failureInstallCommandPostCommitAcknowledgementResult = error.result
      } else {
        throw error
      }
    }
    const postCommitFailureUiIpcDeliveryContinuation =
      createOrdinaryInstallTerminalFailureUiIpcContinuationResult(
        failureInstallCommandPostCommitAcknowledgementResult
      )
    const failureOrdinaryInstallTerminalPipeline =
      createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline({
        enabled: true,
        readPostCommitUiIpcDeliveryContinuationSource: async() =>
          postCommitFailureUiIpcDeliveryContinuation
      })
    let failureOrdinaryInstallTransactionTerminalConnection
    try {
      failureOrdinaryInstallTransactionTerminalConnection =
        await failureOrdinaryInstallTerminalPipeline()
    } catch (error) {
      if (error instanceof ThirdPartyDataPackOrdinaryInstallTransactionBlockedError) {
        failureOrdinaryInstallTransactionTerminalConnection = error.result
      } else {
        throw error
      }
    }

    if (
      postCommitFailureUiIpcDeliveryContinuation.status !== 'ready'
      || failureOrdinaryInstallTransactionTerminalConnection.status !== 'ready'
      || failureOrdinaryInstallTransactionTerminalConnection.outcomeKind !== 'failure'
      || failureOrdinaryInstallTransactionTerminalConnection.retryable !== true
      || failureOrdinaryInstallTransactionTerminalConnection.rollbackRequired !== false
      || failureOrdinaryInstallTransactionTerminalConnection.effects.failureOutcomeAccepted !== true
    ) {
      return createBlockedOrdinaryInstallTerminalContinuationResult(
        [
          'Electron visible import failure did not reach retryable terminal state',
          `ack=${failureInstallCommandPostCommitAcknowledgementResult.status}`,
          `postCommit=${safePipelineStatus(postCommitFailureUiIpcDeliveryContinuation)}`,
          `ordinary=${safePipelineStatus(failureOrdinaryInstallTransactionTerminalConnection)}`,
          `ordinaryReason=${safePipelineReason(failureOrdinaryInstallTransactionTerminalConnection)}`,
          `ordinaryDiag=${safeFirstDiagnosticStage(failureOrdinaryInstallTransactionTerminalConnection)}`
        ].join('; '),
        [
          ...failureInstallCommandPostCommitAcknowledgementResult.diagnostics,
          ...postCommitFailureUiIpcDeliveryContinuation.diagnostics,
          ...failureOrdinaryInstallTransactionTerminalConnection.diagnostics
        ]
      )
    }

    return {
      status: 'ready',
      reason: 'Electron visible renderer import reached retryable failure terminal without runtime publication handoff',
      installCommandPostCommitAcknowledgement: failureInstallCommandPostCommitAcknowledgementResult,
      postCommitUiIpcDeliveryContinuation: postCommitFailureUiIpcDeliveryContinuation,
      ordinaryInstallTransactionTerminalConnection:
        failureOrdinaryInstallTransactionTerminalConnection,
      diagnostics: [
        ...failureInstallCommandPostCommitAcknowledgementResult.diagnostics,
        ...postCommitFailureUiIpcDeliveryContinuation.diagnostics,
        ...failureOrdinaryInstallTransactionTerminalConnection.diagnostics
      ]
    }
  }

  const installCommandPostCommitAcknowledgementResult =
    await readInstallCommandLifecyclePipeline()

  if (runtimeProbeVisibleImportRollback) {
    const packageFilePersistentStagingResult =
      await readPackageFilePersistentStagingPipeline()
    const packageFileRestoreResult =
      await runThirdPartyDataPackPackageFilePersistentRestoreProbe({
        packageId: targetPackageId,
        writtenFiles: packageFilePersistentStagingResult.writtenFiles,
        storage: packageFilePersistentStagingStorage,
        allowPersistentRestoreProbe: true
      })
    let recoveryLogReplayRestoreSource
    const rollbackRecoveryExecutionPipeline =
      createThirdPartyDataPackRollbackRecoveryExecutionPipeline({
        enabled: true,
        readAtomicTransactionCommitOutcomeContract: async() =>
          createSyntheticRollbackOutcomeContract(lockfileDraft),
        readRecoveryLogReplayRestoreSource: async() => {
          recoveryLogReplayRestoreSource ??=
            await createRealRecoveryLogReplayRestoreSourceResult(
              packageFilePayload,
              lockfileDraft,
              runtimePublicationCommitAdapter,
              packageFileRestoreResult
            )
          return recoveryLogReplayRestoreSource
        },
        executeRollbackRecovery: async currentEnvelope =>
          createSyntheticRollbackRecoveryExecutionHostResult(
            currentEnvelope,
            packageFileRestoreResult,
            recoveryLogReplayRestoreSource
          )
      })
    const rollbackRecoveryExecution = await rollbackRecoveryExecutionPipeline()
    const rollbackOrdinaryInstallTerminalPipeline =
      createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline({
        enabled: true,
        readRollbackRecoveryExecutionSource: async() => rollbackRecoveryExecution
      })

    let rollbackOrdinaryInstallTransactionTerminalConnection
    try {
      rollbackOrdinaryInstallTransactionTerminalConnection =
        await rollbackOrdinaryInstallTerminalPipeline()
    } catch (error) {
      if (error instanceof ThirdPartyDataPackOrdinaryInstallTransactionBlockedError) {
        rollbackOrdinaryInstallTransactionTerminalConnection = error.result
      } else {
        throw error
      }
    }

    const postCommitRollbackUiIpcDeliveryContinuation =
      createOrdinaryInstallTerminalRollbackUiIpcContinuationResult(
        rollbackOrdinaryInstallTransactionTerminalConnection
      )

    if (
      installCommandPostCommitAcknowledgementResult.status !== 'ready'
      || packageFilePersistentStagingResult.status !== 'written'
      || packageFileRestoreResult.status !== 'restored'
      || rollbackRecoveryExecution.status !== 'executed'
      || rollbackRecoveryExecution.effects.realRecoveryLogReplayRestoreCalled !== true
      || rollbackRecoveryExecution.effects.recoveryLogRead !== true
      || rollbackRecoveryExecution.effects.recoveryLogReplayed !== true
      || rollbackOrdinaryInstallTransactionTerminalConnection.status !== 'ready'
      || rollbackOrdinaryInstallTransactionTerminalConnection.outcomeKind !== 'rollback'
      || rollbackOrdinaryInstallTransactionTerminalConnection.effects.realRecoveryLogReplayRestoreCalled !== true
      || rollbackOrdinaryInstallTransactionTerminalConnection.effects.recoveryLogRead !== true
      || rollbackOrdinaryInstallTransactionTerminalConnection.effects.recoveryLogReplayed !== true
      || rollbackOrdinaryInstallTransactionTerminalConnection.effects.rollbackExecuted !== true
      || postCommitRollbackUiIpcDeliveryContinuation.status !== 'ready'
    ) {
      return createBlockedOrdinaryInstallTerminalContinuationResult(
        [
          'Electron visible import rollback did not reach restored terminal state',
          `ack=${installCommandPostCommitAcknowledgementResult.status}`,
          `package=${packageFilePersistentStagingResult.status}`,
          `restore=${packageFileRestoreResult.status}`,
          `rollback=${rollbackRecoveryExecution.status}`,
          `ordinary=${safePipelineStatus(rollbackOrdinaryInstallTransactionTerminalConnection)}`,
          `ordinaryReason=${safePipelineReason(rollbackOrdinaryInstallTransactionTerminalConnection)}`,
          `restoreDiag=${safeFirstDiagnosticStage(packageFileRestoreResult)}`,
          `rollbackDiag=${safeFirstDiagnosticStage(rollbackRecoveryExecution)}`,
          `ordinaryDiag=${safeFirstDiagnosticStage(rollbackOrdinaryInstallTransactionTerminalConnection)}`
        ].join('; '),
        [
          ...installCommandPostCommitAcknowledgementResult.diagnostics,
          ...packageFilePersistentStagingResult.diagnostics,
          ...packageFileRestoreResult.diagnostics,
          ...rollbackRecoveryExecution.diagnostics,
          ...rollbackOrdinaryInstallTransactionTerminalConnection.diagnostics,
          ...postCommitRollbackUiIpcDeliveryContinuation.diagnostics
        ]
      )
    }

    return {
      status: 'ready',
      reason: 'Electron visible renderer import reached rollback terminal with real recovery log replay/restore evidence',
      installCommandPostCommitAcknowledgement: installCommandPostCommitAcknowledgementResult,
      postCommitUiIpcDeliveryContinuation: postCommitRollbackUiIpcDeliveryContinuation,
      ordinaryInstallTransactionTerminalConnection:
        rollbackOrdinaryInstallTransactionTerminalConnection,
      diagnostics: [
        ...installCommandPostCommitAcknowledgementResult.diagnostics,
        ...packageFilePersistentStagingResult.diagnostics,
        ...packageFileRestoreResult.diagnostics,
        ...rollbackRecoveryExecution.diagnostics,
        ...rollbackOrdinaryInstallTransactionTerminalConnection.diagnostics,
        ...postCommitRollbackUiIpcDeliveryContinuation.diagnostics
      ]
    }
  }

  const installTransactionLogPreparedResult =
    await readInstallTransactionLogPrepared()
  const installTransactionLogPreparedPersistentReadVerificationResult =
    await readInstallTransactionLogPreparedPersistentReadVerification()
  const installTransactionCommitFinalizationResult =
    await readInstallTransactionCommitFinalization()

  if (
    installCommandPostCommitAcknowledgementResult.status !== 'ready'
    || installTransactionLogPreparedResult.status !== 'prepared'
    || installTransactionLogPreparedPersistentReadVerificationResult.status !== 'verified'
    || installTransactionCommitFinalizationResult.status !== 'committed'
  ) {
    return createBlockedOrdinaryInstallTerminalContinuationResult(
      [
        'Electron ordinary install terminal continuation did not finalize a verified install transaction',
        `ack=${installCommandPostCommitAcknowledgementResult.status}`,
        `package=${safePipelineStatus(packageFilePersistentStagingResult)}`,
        `settings=${safePipelineStatus(settingsLockfileLifecycleResult)}`,
        `connection=${safePipelineStatus(transactionCommitConnectionResult)}`,
        `prepared=${installTransactionLogPreparedResult.status}`,
        `read=${installTransactionLogPreparedPersistentReadVerificationResult.status}`,
        `finalization=${installTransactionCommitFinalizationResult.status}`,
        `packageReason=${safePipelineReason(packageFilePersistentStagingResult)}`,
        `packageDiag=${safeFirstDiagnosticStage(packageFilePersistentStagingResult)}`,
        `settingsDiag=${safeFirstDiagnosticStage(settingsLockfileLifecycleResult)}`,
        `connectionDiag=${safeFirstDiagnosticStage(transactionCommitConnectionResult)}`
      ].join('; '),
      [
        ...installCommandPostCommitAcknowledgementResult.diagnostics,
        ...installTransactionLogPreparedResult.diagnostics,
        ...installTransactionLogPreparedPersistentReadVerificationResult.diagnostics,
        ...installTransactionCommitFinalizationResult.diagnostics
      ]
    )
  }

  const postCommitUiIpcDeliveryContinuationResult =
    await readPostCommitUiIpcDeliveryContinuation()

  let ordinaryInstallTransactionTerminalConnection
  try {
    ordinaryInstallTransactionTerminalConnection = await ordinaryInstallTerminalPipeline()
  } catch (error) {
    if (error instanceof ThirdPartyDataPackOrdinaryInstallTransactionBlockedError) {
      ordinaryInstallTransactionTerminalConnection = error.result
    } else {
      throw error
    }
  }

  if (
    installCommandPostCommitAcknowledgementResult.status !== 'ready'
    || installTransactionLogPreparedResult.status !== 'prepared'
    || installTransactionLogPreparedPersistentReadVerificationResult.status !== 'verified'
    || installTransactionCommitFinalizationResult.status !== 'committed'
    || postCommitUiIpcDeliveryContinuationResult.status !== 'ready'
    || ordinaryInstallTransactionTerminalConnection.status !== 'ready'
  ) {
    return createBlockedOrdinaryInstallTerminalContinuationResult(
      [
        'Electron ordinary install terminal continuation did not reach ready terminal state',
        `ack=${installCommandPostCommitAcknowledgementResult.status}`,
        `prepared=${installTransactionLogPreparedResult.status}`,
        `read=${installTransactionLogPreparedPersistentReadVerificationResult.status}`,
        `finalization=${installTransactionCommitFinalizationResult.status}`,
        `postCommit=${safePipelineStatus(postCommitUiIpcDeliveryContinuationResult)}`,
        `ordinary=${safePipelineStatus(ordinaryInstallTransactionTerminalConnection)}`,
        `postCommitReason=${safePipelineReason(postCommitUiIpcDeliveryContinuationResult)}`,
        `ordinaryReason=${safePipelineReason(ordinaryInstallTransactionTerminalConnection)}`,
        `postCommitDiag=${safeFirstDiagnosticStage(postCommitUiIpcDeliveryContinuationResult)}`,
        `ordinaryDiag=${safeFirstDiagnosticStage(ordinaryInstallTransactionTerminalConnection)}`
      ].join('; '),
      [
        ...installCommandPostCommitAcknowledgementResult.diagnostics,
        ...installTransactionLogPreparedResult.diagnostics,
        ...installTransactionLogPreparedPersistentReadVerificationResult.diagnostics,
        ...installTransactionCommitFinalizationResult.diagnostics,
        ...postCommitUiIpcDeliveryContinuationResult.diagnostics,
        ...ordinaryInstallTransactionTerminalConnection.diagnostics
      ]
    )
  }

  let runtimePublicationContinuation
  try {
    const runtimeContinuationContext = await createRuntimePublicationContinuationContext(
      packageFilePayload,
      lockfileDraft,
      runtimePublicationCommitAdapter
    )
    if (
      runtimeContinuationContext === undefined
      || runtimeContinuationContext.runtimePublicationCommitAdapter.selectedPackageIds[0] !== targetPackageId
      || installTransactionCommitFinalizationResult.targetPackageId !== targetPackageId
    ) {
      return createBlockedOrdinaryInstallTerminalContinuationResult(
        'Electron ordinary install terminal continuation could not rebuild a matching runtime publication context from package payload'
      )
    }
    runtimePublicationContinuation =
      await createRuntimePublicationContinuationResults(
        runtimeContinuationContext,
        installTransactionCommitFinalizationResult
      )
  } catch {
    return createBlockedOrdinaryInstallTerminalContinuationResult(
      'Electron ordinary install terminal continuation failed while composing runtime publication handoff'
    )
  }

  if (
    runtimePublicationContinuation.runtimePublicationCommitAfterPostCommitVerification.status !== 'accepted'
    || runtimePublicationContinuation.runtimePublicationCommitLiveRegistrySwapHostConnection.status !== 'swapped'
    || runtimePublicationContinuation.runtimePublicationCommitAppStartupReadiness.status !== 'ready'
    || runtimePublicationContinuation.runtimePublicationCommitAppStartupHostConnection.status !== 'accepted'
  ) {
    return createBlockedOrdinaryInstallTerminalContinuationResult(
      'Electron ordinary install terminal continuation did not reach runtime publication startup handoff',
      [
        ...runtimePublicationContinuation.runtimePublicationCommitAfterPostCommitVerification.diagnostics,
        ...runtimePublicationContinuation.runtimePublicationCommitLiveRegistrySwapHostConnection.diagnostics,
        ...runtimePublicationContinuation.runtimePublicationCommitAppStartupReadiness.diagnostics,
        ...runtimePublicationContinuation.runtimePublicationCommitAppStartupHostConnection.diagnostics
      ]
    )
  }

  let startupPersistentStateSnapshotWrite
  try {
    startupPersistentStateSnapshotWrite = writeElectronStartupPersistentStateSnapshot(
      programDirectoryPath,
      installTransactionCommitFinalizationResult
    )
  } catch {
    return createBlockedOrdinaryInstallTerminalContinuationResult(
      'Electron ordinary install terminal continuation could not persist startup state snapshot under program-directory userdata'
    )
  }

  return {
    status: 'ready',
    reason: 'Electron ordinary install terminal continuation reached verified terminal handoff from visible renderer import',
    installCommandPostCommitAcknowledgement: installCommandPostCommitAcknowledgementResult,
    installTransactionLogPrepared: installTransactionLogPreparedResult,
    installTransactionLogPreparedPersistentReadVerification:
      installTransactionLogPreparedPersistentReadVerificationResult,
    installTransactionCommitFinalization: installTransactionCommitFinalizationResult,
    postCommitUiIpcDeliveryContinuation: postCommitUiIpcDeliveryContinuationResult,
    ordinaryInstallTransactionTerminalConnection,
    startupPersistentStateSnapshotWrite,
    ...runtimePublicationContinuation,
    diagnostics: [
      ...installCommandPostCommitAcknowledgementResult.diagnostics,
      ...installTransactionLogPreparedResult.diagnostics,
      ...installTransactionLogPreparedPersistentReadVerificationResult.diagnostics,
      ...installTransactionCommitFinalizationResult.diagnostics,
      ...postCommitUiIpcDeliveryContinuationResult.diagnostics,
      ...ordinaryInstallTransactionTerminalConnection.diagnostics,
      ...runtimePublicationContinuation.runtimePublicationCommitAfterPostCommitVerification.diagnostics,
      ...runtimePublicationContinuation.runtimePublicationCommitLiveRegistrySwapHostConnection.diagnostics,
      ...runtimePublicationContinuation.runtimePublicationCommitAppStartupReadiness.diagnostics,
      ...runtimePublicationContinuation.runtimePublicationCommitAppStartupHostConnection.diagnostics
    ]
  }
}

const createInstallCommandLifecycleProbeReport = async (
  installCommandDispatchIpcProof = null
) => {
  const shouldExerciseInstallCommandLifecycle =
    runtimeProbeInstallCommandLifecycle && !!process.env.PORTABLE_EXECUTABLE_DIR

  if (!shouldExerciseInstallCommandLifecycle) {
    return {
      status: 'skipped',
      operation: 'inspect',
      diagnosticsCount: 0,
      effects: {
        installCommandLifecycleReady: false,
        commandDispatched: false,
        atomicCommitExecutorAcknowledged: false,
        injectedCommitHostCalled: false,
        realAtomicCommitExecutorCalled: false,
        postCommitVerificationAcknowledged: false,
        persistentReadProofAcknowledged: false,
        packageFilesWritten: false,
        packageBackupsWritten: false,
        packageFilesRestored: false,
        settingsWritten: false,
        lockfileWritten: false,
        transactionCommitted: false,
        transactionLogPrepared: false,
        runtimePublicationCommitted: false,
        postCommitVerificationExecuted: false,
        uiIpcResponseDelivered: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false,
        rollbackExecuted: false,
        diagnosticsWritten: false
      }
    }
  }

  const draft = createSyntheticModLockDraft()
  const lifecycleCalls = []
  let electronIpcDispatchProofAccepted = false
  const pipeline = createThirdPartyDataPackInstallCommandLifecyclePipeline({
    enabled: true,
    readTransactionCommandDispatcherHandoff: async() =>
      createSyntheticTransactionCommandDispatcherHandoffResult(draft),
    readInstallTransactionDispatchPlan: async() =>
      createSyntheticInstallTransactionDispatchPlanResult(draft),
    readRuntimePublicationCommitAdapter: async() =>
      createSyntheticRuntimePublicationCommitAdapterResult(draft),
    dispatchTransactionCommand: async envelope => {
      if (runtimeProbeInstallCommandDispatchIpc) {
        lifecycleCalls.push('electron-ipc-command-dispatch-proof')
        if (!installCommandDispatchIpcProofMatchesEnvelope(installCommandDispatchIpcProof, envelope)) {
          return createBlockedInstallCommandDispatchIpcProofResult(envelope)
        }
        electronIpcDispatchProofAccepted = true
      } else {
        lifecycleCalls.push('command-dispatch')
      }
      return {
        status: 'dispatched',
        requestedCommandId: 'install',
        targetPackageId: envelope.targetPackageId,
        effects: {
          ...createSyntheticNoRealLifecycleEffects(),
          commandDispatcherCalled: true,
          commandDispatched: true
        }
      }
    },
    executeAtomicTransactionCommitOutcomeHost: {
      kind: 'electron-main-visible-import-atomic-transaction-commit-executor',
      mode: 'electron-main-visible-import',
      execute: request => {
        lifecycleCalls.push('electron-main-visible-import-atomic-commit')
        return {
          kind: 'committed',
          settled: true,
          packageId: request.packageId,
          candidateIdentity: request.candidateIdentity,
          lockfileHash: request.lockfileHash,
          messageKey: 'mods.atomic.commit.install.committed',
          recovery: 'none'
        }
      }
    },
    executeAtomicTransactionCommit: async envelope => {
      lifecycleCalls.push('atomic-commit-host')
      return {
        status: 'accepted',
        requestedCommandId: 'install',
        targetPackageId: envelope.targetPackageId,
        commitOutcomeKind: envelope.commitOutcomeKind,
        candidateHash: envelope.candidateIdentity.candidateHash,
        lockfileHash: envelope.lockfileHash,
        effects: {
          ...createSyntheticNoRealLifecycleEffects(),
          atomicCommitExecutorHostCalled: true,
          atomicCommitExecutorHostAccepted: true
        }
      }
    },
    readSettingsLockfileCommitSource: async() =>
      createSyntheticSettingsLockfileCommitSourceResult(draft),
    readPostCommitVerificationExecutorAdapter: async() =>
      createSyntheticPostCommitVerificationExecutorAdapterResult(
        draft,
        'electron-main-visible-import'
      ),
    readPostCommitPersistentState: async envelope => {
      lifecycleCalls.push('persistent-read-host')
      return {
        status: 'accepted',
        requestedCommandId: 'install',
        targetPackageId: envelope.targetPackageId,
        selectedPackageIds: envelope.selectedPackageIds,
        blockedPackageIds: envelope.blockedPackageIds,
        loadOrder: envelope.loadOrder,
        registryCount: envelope.registryCount,
        entryCount: envelope.entryCount,
        packageCount: envelope.packageCount,
        candidateHash: envelope.candidateIdentity.candidateHash,
        lockfileHash: envelope.lockfileHash,
        packageFileStagingHostStatus: envelope.packageFileStagingHostStatus,
        settingsLockfileCommitHostStatus: envelope.settingsLockfileCommitHostStatus,
        modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
        transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
        modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
        transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
        persistentReadProofs: {
          transactionLogCommitted: true,
          packageStateMatched: true,
          settingsStateMatched: true,
          modLockStateMatched: true,
          liveRegistryMatched: true,
          saveCacheIsolated: true
        },
        effects: {
          ...createSyntheticNoRealLifecycleEffects(),
          postCommitPersistentReadsHostCalled: true,
          postCommitPersistentReadsHostAccepted: true
        }
      }
    },
    executePostCommitVerification: async envelope => {
      lifecycleCalls.push('post-commit-verification-host')
      return {
        status: 'accepted',
        requestedCommandId: 'install',
        targetPackageId: envelope.targetPackageId,
        verificationOutcomeKind: envelope.verificationOutcomeKind,
        candidateHash: envelope.candidateIdentity.candidateHash,
        lockfileHash: envelope.lockfileHash,
        transactionLogMatched: envelope.transactionLogMatched,
        packageStateMatched: envelope.packageStateMatched,
        settingsLockfileMatched: envelope.settingsLockfileMatched,
        liveRegistryMatched: envelope.liveRegistryMatched,
        saveCacheIsolated: envelope.saveCacheIsolated,
        effects: {
          ...createSyntheticNoRealLifecycleEffects(),
          postCommitVerificationExecutorHostCalled: true,
          postCommitVerificationExecutorHostAccepted: true
        }
      }
    }
  })

  let result
  try {
    result = await pipeline()
  } catch (error) {
    if (error instanceof ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError) {
      result = error.result
    } else {
      throw error
    }
  }

  return {
    status: result.status,
    operation: runtimeProbeInstallCommandDispatchIpc
      ? 'lifecycle-from-electron-ipc-dispatch-atomic-commit-post-commit-acknowledgement'
      : 'lifecycle-from-command-dispatch-atomic-commit-post-commit-acknowledgement',
    dispatchInputSource: runtimeProbeInstallCommandDispatchIpc
      ? 'electron-ipc-dispatch-proof'
      : 'synthetic-command-dispatch-host',
    electronIpcDispatchProofObserved: installCommandDispatchIpcProof?.status === 'dispatched',
    electronIpcDispatchProofAccepted,
    transactionCommandDispatcherSourceStatus: result.transactionCommandDispatcherSourceStatus ?? null,
    atomicTransactionCommitExecutorSourceStatus: result.atomicTransactionCommitExecutorSourceStatus ?? null,
    atomicTransactionCommitExecutorHostMode: result.atomicTransactionCommitExecutorHostMode ?? null,
    postCommitVerificationExecutorHostMode: result.postCommitVerificationExecutorHostMode ?? null,
    postCommitVerificationReadAcknowledgementSourceStatus:
      result.postCommitVerificationReadAcknowledgementSourceStatus ?? null,
    verificationOutcomeKind: result.verificationOutcomeKind ?? null,
    targetPackageId: result.targetPackageId ?? null,
    selectedPackageCount: result.selectedPackageIds.length,
    blockedPackageCount: result.blockedPackageIds.length,
    loadOrderCount: result.loadOrder.length,
    registryCount: result.registryCount,
    entryCount: result.entryCount,
    packageCount: result.packageCount,
    candidateHashPresent: typeof result.candidateIdentity?.candidateHash === 'string',
    lockfileHashPresent: typeof result.lockfileHash === 'string',
    commandContinuationAllowed: result.commandContinuationAllowed,
    uiIpcResultContinuationAllowed: result.uiIpcResultContinuationAllowed,
    lifecycleCallOrder: lifecycleCalls,
    checksSatisfied: result.checks.every(check => check.status === 'satisfied'),
    diagnosticsCount: result.diagnostics.length,
    effects: {
      installCommandLifecycleReady: result.status === 'ready',
      commandDispatched: result.effects.commandDispatched,
      atomicCommitExecutorAcknowledged: result.effects.atomicCommitExecutorAcknowledged,
      injectedCommitHostCalled: result.effects.injectedCommitHostCalled,
      realAtomicCommitExecutorCalled: result.effects.realAtomicCommitExecutorCalled,
      postCommitVerificationAcknowledged: result.effects.postCommitVerificationAcknowledged,
      persistentReadProofAcknowledged: result.effects.persistentReadProofAcknowledged,
      packageFilesWritten: result.effects.packageFilesWritten,
      packageBackupsWritten: result.effects.packageBackupsWritten,
      packageFilesRestored: result.effects.packageFilesRestored,
      settingsWritten: result.effects.settingsWritten,
      lockfileWritten: result.effects.lockfileWritten,
      transactionCommitted: result.effects.transactionCommitted,
      transactionLogPrepared: result.effects.transactionLogPrepared,
      runtimePublicationCommitted: result.effects.runtimePublicationCommitted,
      postCommitVerificationExecuted: result.effects.postCommitVerificationExecuted,
      uiIpcResponseDelivered: result.effects.uiIpcResponseDelivered,
      savesWritten: result.effects.savesWritten,
      cacheWritten: result.effects.cacheWritten,
      transactionLogWritten: result.effects.transactionLogWritten,
      rollbackExecuted: result.effects.rollbackExecuted,
      diagnosticsWritten: result.effects.diagnosticsWritten
    }
  }
}

const createInstallTransactionCommitFinalizationProbeReport = async () => {
  const shouldExerciseCommitFinalization =
    runtimeProbeInstallTransactionCommitFinalization && !!process.env.PORTABLE_EXECUTABLE_DIR

  if (!shouldExerciseCommitFinalization) {
    return {
      status: 'skipped',
      operation: 'inspect',
      diagnosticsCount: 0,
      effects: {
        packageFilesWritten: false,
        packageBackupsWritten: false,
        settingsWritten: false,
        lockfileWritten: false,
        transactionLogPrepared: false,
        transactionLogWritten: false,
        transactionLogRead: false,
        transactionCommitted: false,
        transactionLogCommitted: false,
        runtimePublicationCommitted: false,
        uiIpcResponseDelivered: false,
        savesWritten: false,
        cacheWritten: false,
        rollbackExecuted: false,
        diagnosticsWritten: false
      }
    }
  }

  const programDirectoryPath = process.env.PORTABLE_EXECUTABLE_DIR
  const draft = createSyntheticModLockDraft()
  const packagePipeline = createPackageFilePersistentStagingProbePipeline(draft)
  const packageResult = await packagePipeline()
  const settingsLockfileLifecyclePipeline =
    createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline({
      enabled: true,
      programDirectoryPath,
      readInstallPersistentStagingLifecyclePipeline: async() =>
        createSyntheticInstallPersistentStagingLifecycleResult(draft, packageResult),
      readSettingsLockfileCommitSource: async() =>
        createSyntheticSettingsLockfileCommitSourceResult(draft),
      readLockfileDraft: async() => draft,
      writeSettings: writeProbeSettings
    })
  const settingsLockfileLifecycle = await settingsLockfileLifecyclePipeline()
  const transactionCommitConnectionSource =
    createThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource({
      enabled: true,
      readInstallPersistentStagingSettingsLockfileLifecyclePipeline: async() => settingsLockfileLifecycle,
      acknowledgeInstallTransactionCommit: async envelope =>
        createSyntheticInstallTransactionCommitConnectionHostResult(envelope)
    })
  const transactionCommitConnection = await transactionCommitConnectionSource()
  const preparedTransactionLogPipeline =
    createThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline({
      enabled: true,
      allowPersistentTransactionLogPrepare: true,
      readTransactionCommitConnectionSource: async() => transactionCommitConnection,
      storage: createThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter({
        programDirectoryPath
      }),
      transactionId: 'product-probe-install-transaction-commit',
      createdAtIso: '2026-08-20T00:00:00.000Z'
    })
  const preparedTransactionLog = await preparedTransactionLogPipeline()
  const preparedReadVerificationPipeline =
    createThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline({
      enabled: true,
      allowPersistentTransactionLogReadVerification: true,
      readInstallTransactionLogPreparedPipeline: async() => preparedTransactionLog,
      programDirectoryPath
    })
  const preparedReadVerification = await preparedReadVerificationPipeline()
  const commitFinalizationPipeline = createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline({
    enabled: true,
    allowInstallTransactionCommitFinalization: true,
    readPreparedTransactionLogVerification: async() => preparedReadVerification
  })
  const finalization = await commitFinalizationPipeline()
  const transactionLogEntryHash = preparedTransactionLog.transactionLogEntryHash ?? null
  const readTransactionLogEntryHash = preparedReadVerification.readTransactionLogEntryHash ?? null

  return {
    status: finalization.status,
    operation: 'write-read-finalize',
    packageFilePersistentStagingStatus: packageResult.status,
    settingsLockfileLifecycleStatus: settingsLockfileLifecycle.status,
    transactionCommitConnectionStatus: transactionCommitConnection.status,
    preparedTransactionLogStatus: preparedTransactionLog.status,
    preparedReadVerificationStatus: preparedReadVerification.status,
    targetPackageId: finalization.targetPackageId ?? null,
    selectedPackageCount: finalization.selectedPackageIds.length,
    blockedPackageCount: finalization.blockedPackageIds.length,
    loadOrderCount: finalization.loadOrder.length,
    registryCount: finalization.registryCount,
    entryCount: finalization.entryCount,
    packageCount: finalization.packageCount,
    candidateHashPresent: typeof finalization.candidateHash === 'string',
    lockfileHashPresent: typeof finalization.lockfileHash === 'string',
    transactionId: finalization.transactionId ?? null,
    committedTransactionId: finalization.committedTransactionId ?? null,
    transactionLogEntryHashPresent: typeof transactionLogEntryHash === 'string',
    readTransactionLogEntryHashMatched:
      transactionLogEntryHash !== null && transactionLogEntryHash === readTransactionLogEntryHash,
    committedTransactionLogEntryHashMatched:
      finalization.committedTransactionLogEntryHash === preparedReadVerification.transactionLogEntryHash,
    transactionCommitConnectionAcknowledged:
      transactionCommitConnection.transactionCommitConnectionAcknowledged === true,
    persistentPackageWriteExecuted:
      transactionCommitConnection.persistentPackageWriteExecuted === true,
    persistentSettingsLockfileWriteExecuted:
      transactionCommitConnection.persistentSettingsLockfileWriteExecuted === true,
    writtenFileCount: transactionCommitConnection.writtenFileCount,
    backedUpFileCount: transactionCommitConnection.backedUpFileCount,
    finalizationAuthorized: finalization.authorized,
    checksSatisfied: finalization.checks.every(check => check.status === 'satisfied'),
    diagnosticsCount:
      packageResult.diagnostics.length
      + settingsLockfileLifecycle.diagnostics.length
      + transactionCommitConnection.diagnostics.length
      + preparedTransactionLog.diagnostics.length
      + preparedReadVerification.diagnostics.length
      + finalization.diagnostics.length,
    effects: {
      packageFilesWritten: packageResult.effects.packageFilesWritten,
      packageBackupsWritten: packageResult.effects.packageBackupsWritten,
      settingsWritten: settingsLockfileLifecycle.effects.settingsWritten,
      lockfileWritten: settingsLockfileLifecycle.effects.lockfileWritten,
      transactionLogPrepared: preparedTransactionLog.effects.transactionLogPrepared,
      transactionLogWritten: preparedTransactionLog.effects.transactionLogWritten,
      transactionLogRead: preparedReadVerification.effects.transactionLogRead,
      transactionCommitted: finalization.effects.transactionCommitted,
      transactionLogCommitted: finalization.effects.transactionLogCommitted,
      runtimePublicationCommitted: finalization.effects.runtimePublicationCommitted,
      uiIpcResponseDelivered: finalization.effects.uiIpcResponseDelivered,
      savesWritten: finalization.effects.savesWritten,
      cacheWritten: finalization.effects.cacheWritten,
      rollbackExecuted: finalization.effects.rollbackExecuted,
      diagnosticsWritten: finalization.effects.diagnosticsWritten
    }
  }
}

const createPostCommitUiIpcDeliveryContinuationTerminalEvidence = (
  draft,
  installTransactionCommitFinalizationProbe,
  rendererUiIpc,
  installCommandLifecycleProbe
) => {
  const installCommandLifecycleReady = installCommandLifecycleProbe?.status === 'ready'
    && installCommandLifecycleProbe?.targetPackageId === syntheticPackageId
    && installCommandLifecycleProbe?.atomicTransactionCommitExecutorHostMode === 'electron-main-visible-import'
    && installCommandLifecycleProbe?.postCommitVerificationExecutorHostMode === 'electron-main-visible-import'
    && installCommandLifecycleProbe?.effects?.installCommandLifecycleReady === true
    && installCommandLifecycleProbe?.effects?.commandDispatched === true
    && installCommandLifecycleProbe?.effects?.atomicCommitExecutorAcknowledged === true
    && installCommandLifecycleProbe?.effects?.injectedCommitHostCalled === false
    && installCommandLifecycleProbe?.effects?.realAtomicCommitExecutorCalled === true
    && installCommandLifecycleProbe?.effects?.postCommitVerificationAcknowledged === true
    && installCommandLifecycleProbe?.effects?.persistentReadProofAcknowledged === true

  const rendererUiIpcReady = rendererUiIpc?.observed === true
    && rendererUiIpc.status === 'ready'
    && rendererUiIpc.deliveryInputSource === 'install-transaction-commit-finalization'
    && rendererUiIpc.selectedPlatform === 'electron'
    && rendererUiIpc.targetPackageId === syntheticPackageId
    && rendererUiIpc.envelopeKind === 'success'
    && rendererUiIpc.messageKey === 'mods.ui.ipc.result.install.success'
    && rendererUiIpc.platformResponseDelivered === true
    && rendererUiIpc.deliveryAcknowledgementConsumed === true
    && rendererUiIpc.effects?.uiIpcResponseDelivered === true
    && rendererUiIpc.effects?.electronIpcResponseSent === true

  const commitFinalized = installTransactionCommitFinalizationProbe?.status === 'committed'
    && installTransactionCommitFinalizationProbe?.targetPackageId === syntheticPackageId
    && installTransactionCommitFinalizationProbe?.transactionCommitConnectionAcknowledged === true
    && installTransactionCommitFinalizationProbe?.persistentPackageWriteExecuted === true
    && installTransactionCommitFinalizationProbe?.persistentSettingsLockfileWriteExecuted === true

  return {
    kind: 'third-party-post-commit-ui-ipc-delivery-continuation-source',
    mode: 'default-disabled-post-commit-ui-ipc-delivery-continuation-source',
    status: installCommandLifecycleReady && rendererUiIpcReady && commitFinalized ? 'ready' : 'blocked',
    reason: installCommandLifecycleReady && rendererUiIpcReady && commitFinalized
      ? 'product runtime probe observed install command lifecycle, install commit finalization and renderer UI/IPC acknowledgement before ordinary install terminal semantics'
      : 'product runtime probe could not observe install command lifecycle, install commit finalization and renderer UI/IPC acknowledgement',
    readOnly: false,
    enabled: true,
    sourceCalled: true,
    postCommitPersistentReadWriteConnectionStatus: commitFinalized ? 'accepted' : 'blocked',
    uiIpcResponseDeliveryAcknowledgementConvergenceStatus: rendererUiIpcReady ? 'ready' : 'blocked',
    selectedPlatform: rendererUiIpc?.selectedPlatform === 'electron' ? 'electron' : undefined,
    requestedCommandId: 'install',
    targetPackageId: draft.selectedPackageIds[0],
    selectedPackageIds: draft.selectedPackageIds,
    blockedPackageIds: [],
    blockedCandidateCount: 0,
    loadOrder: draft.loadOrder,
    registryCount: draft.registryCount,
    entryCount: draft.entryCount,
    packageCount: draft.packages.length,
    candidateIdentity: draft.candidateIdentity,
    candidateHash: draft.candidateIdentity.candidateHash,
    lockfileHash: draft.lockfileHash,
    envelopeKind: rendererUiIpc?.envelopeKind === 'success' ? 'success' : undefined,
    messageKey: rendererUiIpc?.messageKey === 'mods.ui.ipc.result.install.success'
      ? 'mods.ui.ipc.result.install.success'
      : undefined,
    deliverySummary: {
      selectedPackageCount: rendererUiIpc?.selectedPackageCount ?? 0,
      blockedPackageCount: rendererUiIpc?.blockedPackageCount ?? 0,
      blockedCandidateCount: 0,
      loadOrderCount: rendererUiIpc?.loadOrderCount ?? 0,
      registryCount: rendererUiIpc?.registryCount ?? draft.registryCount,
      entryCount: rendererUiIpc?.entryCount ?? draft.entryCount,
      packageCount: rendererUiIpc?.packageCount ?? draft.packages.length,
      diagnosticCount: 0
    },
    acknowledgement: rendererUiIpcReady
      ? {
          status: 'acknowledged',
          platform: 'electron',
          packageId: draft.selectedPackageIds[0],
          envelopeKind: 'success',
          messageKey: 'mods.ui.ipc.result.install.success'
        }
      : undefined,
    persistentPackageWriteExecuted:
      installTransactionCommitFinalizationProbe?.persistentPackageWriteExecuted === true,
    persistentSettingsLockfileWriteExecuted:
      installTransactionCommitFinalizationProbe?.persistentSettingsLockfileWriteExecuted === true,
    writtenFileCount: installTransactionCommitFinalizationProbe?.writtenFileCount ?? 0,
    backedUpFileCount: installTransactionCommitFinalizationProbe?.backedUpFileCount ?? 0,
    transactionCommitConnectionAcknowledged:
      installTransactionCommitFinalizationProbe?.transactionCommitConnectionAcknowledged === true,
    postCommitPersistentReadWriteConnectionAcknowledged: commitFinalized,
    uiIpcDeliveryAcknowledged: rendererUiIpcReady,
    commandContinuationAllowed: installCommandLifecycleReady && rendererUiIpcReady && commitFinalized,
    uiIpcResultContinuationAllowed: installCommandLifecycleReady && rendererUiIpcReady && commitFinalized,
    startupGateContinuationAllowed: installCommandLifecycleReady && rendererUiIpcReady && commitFinalized,
    checks: [],
    diagnostics: [],
    effects: {
      postCommitUiIpcDeliveryContinuationSourceCalled: true,
      postCommitPersistentReadWriteConnectionSourceCalled: true,
      uiIpcResponseDeliveryAcknowledgementConvergenceSourceCalled: true,
      postCommitPersistentReadWriteConnectionAcknowledged: commitFinalized,
      uiIpcDeliveryAcknowledgementConverged: rendererUiIpcReady,
      commandContinuationAllowed: installCommandLifecycleReady && rendererUiIpcReady && commitFinalized,
      uiIpcResultContinuationAllowed: installCommandLifecycleReady && rendererUiIpcReady && commitFinalized,
      startupGateContinuationAllowed: installCommandLifecycleReady && rendererUiIpcReady && commitFinalized,
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
      successEnvelopeDelivered: rendererUiIpcReady,
      failureEnvelopeDelivered: false,
      retryStateDelivered: false,
      rollbackStateDelivered: false,
      uiIpcResponseDelivered: rendererUiIpcReady,
      packageFilesWritten:
        installTransactionCommitFinalizationProbe?.effects?.packageFilesWritten === true,
      packageBackupsWritten:
        installTransactionCommitFinalizationProbe?.effects?.packageBackupsWritten === true,
      packageFilesRestored: false,
      lockfileWritten:
        installTransactionCommitFinalizationProbe?.effects?.lockfileWritten === true,
      lockfileRestored: false,
      settingsWritten:
        installTransactionCommitFinalizationProbe?.effects?.settingsWritten === true,
      settingsRestored: false,
      savesWritten: false,
      cacheWritten: false,
      transactionLogWritten: false,
      recoveryLogRead: false,
      recoveryLogReplayed: false,
      rollbackExecuted: false,
      diagnosticsWritten: false
    }
  }
}

const createOrdinaryInstallTerminalConnectionProbeReport = async (
  installTransactionCommitFinalizationProbe,
  rendererUiIpc,
  installCommandLifecycleProbe
) => {
  const shouldExerciseOrdinaryInstallTerminal =
    runtimeProbeOrdinaryInstallTerminalConnection && !!process.env.PORTABLE_EXECUTABLE_DIR

  if (!shouldExerciseOrdinaryInstallTerminal) {
    return {
      status: 'skipped',
      operation: 'inspect',
      diagnosticsCount: 0,
      effects: {
        ordinaryInstallTransactionReady: false,
        successOutcomeAccepted: false,
        rollbackOutcomeAccepted: false,
        realRecoveryLogReplayRestoreCalled: false,
        packageFilesWritten: false,
        packageFilesRestored: false,
        settingsWritten: false,
        lockfileWritten: false,
        uiIpcResponseDelivered: false,
        transactionLogPrepared: false,
        transactionLogRead: false,
        transactionCommitted: false,
        transactionLogCommitted: false,
        runtimePublicationCommitted: false,
        recoveryLogRead: false,
        recoveryLogReplayed: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false,
        rollbackExecuted: false,
        diagnosticsWritten: false
      }
    }
  }

  const draft = createSyntheticModLockDraft()
  if (runtimeProbeOrdinaryInstallTerminalRollback) {
    const packageFilePayload = createSyntheticPackageFilePayload()
    const recoveryRuntimeContinuationContext =
      await createRuntimePublicationContinuationContext(packageFilePayload, undefined, undefined)
    if (recoveryRuntimeContinuationContext?.mountInput?.lockfileDraft === undefined) {
      throw new Error('Electron ordinary install rollback probe could not rebuild a runtime publication draft')
    }
    const rollbackDraft = recoveryRuntimeContinuationContext.mountInput.lockfileDraft
    const storage = createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter({
      programDirectoryPath: process.env.PORTABLE_EXECUTABLE_DIR
    })
    const packagePipeline = createPackageFilePersistentStagingProbePipeline(rollbackDraft, storage)
    const packageResult = await packagePipeline()
    const restoreResult = await runThirdPartyDataPackPackageFilePersistentRestoreProbe({
      packageId: rollbackDraft.selectedPackageIds[0],
      writtenFiles: packageResult.writtenFiles,
      storage,
      allowPersistentRestoreProbe: true
    })
    let recoveryLogReplayRestoreSource
    const rollbackPipeline = createThirdPartyDataPackRollbackRecoveryExecutionPipeline({
      enabled: true,
      readAtomicTransactionCommitOutcomeContract: async() =>
        createSyntheticRollbackOutcomeContract(rollbackDraft),
      readRecoveryLogReplayRestoreSource: async() => {
        recoveryLogReplayRestoreSource ??=
          await createRealRecoveryLogReplayRestoreSourceResult(
            packageFilePayload,
            rollbackDraft,
            undefined,
            restoreResult
          )
        return recoveryLogReplayRestoreSource
      },
      executeRollbackRecovery: async envelope =>
        createSyntheticRollbackRecoveryExecutionHostResult(
          envelope,
          restoreResult,
          recoveryLogReplayRestoreSource
        )
    })
    const rollbackSource = await rollbackPipeline()
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline({
      enabled: true,
      readRollbackRecoveryExecutionSource: async() => rollbackSource
    })

    let result
    try {
      result = await pipeline()
    } catch (error) {
      if (error instanceof ThirdPartyDataPackOrdinaryInstallTransactionBlockedError) {
        result = error.result
      } else {
        throw error
      }
    }

    return {
      status: result.status,
      operation: 'terminal-from-product-package-restore-rollback',
      packageFilePersistentStagingStatus: packageResult.status,
      packageFileRestoreStatus: restoreResult.status,
      recoveryLogReplayRestoreSourceStatus: recoveryLogReplayRestoreSource?.status ?? null,
      recoveryLogReplayRestoreHostStatus: recoveryLogReplayRestoreSource?.recoveryLogReplayRestoreHostStatus ?? null,
      rollbackRecoveryExecutionStatus: rollbackSource.status,
      modLockTransactionSemanticsStatus: result.modLockTransactionSemanticsStatus ?? null,
      outcomeKind: result.outcomeKind ?? null,
      recovery: result.recovery,
      rollbackRequired: result.rollbackRequired,
      targetPackageId: result.targetPackageId ?? null,
      selectedPackageCount: result.selectedPackageIds.length,
      blockedPackageCount: result.blockedPackageIds.length,
      loadOrderCount: result.loadOrder.length,
      registryCount: result.registryCount,
      entryCount: result.entryCount,
      packageCount: result.packageCount,
      candidateHashPresent: typeof result.candidateHash === 'string',
      lockfileHashPresent: typeof result.lockfileHash === 'string',
      restoredFileCount: restoreResult.restoredFileCount,
      backupRestoredFileCount: restoreResult.backupRestoredFileCount,
      removedCreatedFileCount: restoreResult.removedCreatedFileCount,
      persistentPackageWriteAcknowledged: result.persistentPackageWriteAcknowledged,
      persistentSettingsLockfileWriteAcknowledged: result.persistentSettingsLockfileWriteAcknowledged,
      uiIpcDeliveryAcknowledged: result.uiIpcDeliveryAcknowledged,
      rollbackRecoverySettled: result.rollbackRecoverySettled,
      rollbackRecoveryExecutionAcknowledged: result.rollbackRecoveryExecutionAcknowledged,
      ordinaryInstallTransactionReady: result.ordinaryInstallTransactionReady,
      commandContinuationAllowed: result.commandContinuationAllowed,
      uiIpcResultContinuationAllowed: result.uiIpcResultContinuationAllowed,
      startupGateContinuationAllowed: result.startupGateContinuationAllowed,
      checksSatisfied: result.checks.every(check => check.status === 'satisfied'),
      diagnosticsCount:
        packageResult.diagnostics.length
        + restoreResult.diagnostics.length
        + rollbackSource.diagnostics.length
        + result.diagnostics.length,
      effects: {
        ordinaryInstallTransactionReady: result.effects.ordinaryInstallTransactionReady,
        successOutcomeAccepted: result.effects.successOutcomeAccepted,
        rollbackOutcomeAccepted: result.effects.rollbackOutcomeAccepted,
        realRecoveryLogReplayRestoreCalled: result.effects.realRecoveryLogReplayRestoreCalled,
        packageFilesWritten: result.effects.packageFilesWritten,
        packageFilesRestored: result.effects.packageFilesRestored,
        settingsWritten: result.effects.settingsWritten,
        lockfileWritten: result.effects.lockfileWritten,
        uiIpcResponseDelivered: result.effects.uiIpcResponseDelivered,
        transactionLogPrepared: false,
        transactionLogRead: false,
        transactionCommitted: false,
        transactionLogCommitted: false,
        runtimePublicationCommitted: result.effects.runtimePublicationCommitted,
        recoveryLogRead: result.effects.recoveryLogRead,
        recoveryLogReplayed: result.effects.recoveryLogReplayed,
        savesWritten: result.effects.savesWritten,
        cacheWritten: result.effects.cacheWritten,
        transactionLogWritten: result.effects.transactionLogWritten,
        rollbackExecuted: result.effects.rollbackExecuted,
        diagnosticsWritten: result.effects.diagnosticsWritten
      }
    }
  }

  const source = createPostCommitUiIpcDeliveryContinuationTerminalEvidence(
    draft,
    installTransactionCommitFinalizationProbe,
    rendererUiIpc,
    installCommandLifecycleProbe
  )
  const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline({
    enabled: true,
    readPostCommitUiIpcDeliveryContinuationSource: async() => source
  })

  let result
  try {
    result = await pipeline()
  } catch (error) {
    if (error instanceof ThirdPartyDataPackOrdinaryInstallTransactionBlockedError) {
      result = error.result
    } else {
      throw error
    }
  }

  return {
    status: result.status,
    operation: 'terminal-from-product-lifecycle-commit-ui-ipc',
    postCommitUiIpcDeliveryContinuationStatus: source.status,
    installCommandLifecycleStatus: installCommandLifecycleProbe?.status ?? null,
    installTransactionCommitFinalizationStatus: installTransactionCommitFinalizationProbe?.status ?? null,
    rendererUiIpcStatus: rendererUiIpc?.status ?? null,
    rendererUiIpcDeliveryInputSource: rendererUiIpc?.deliveryInputSource ?? null,
    modLockTransactionSemanticsStatus: result.modLockTransactionSemanticsStatus ?? null,
    outcomeKind: result.outcomeKind ?? null,
    targetPackageId: result.targetPackageId ?? null,
    selectedPackageCount: result.selectedPackageIds.length,
    blockedPackageCount: result.blockedPackageIds.length,
    loadOrderCount: result.loadOrder.length,
    registryCount: result.registryCount,
    entryCount: result.entryCount,
    packageCount: result.packageCount,
    candidateHashPresent: typeof result.candidateHash === 'string',
    lockfileHashPresent: typeof result.lockfileHash === 'string',
    persistentPackageWriteAcknowledged: result.persistentPackageWriteAcknowledged,
    persistentSettingsLockfileWriteAcknowledged: result.persistentSettingsLockfileWriteAcknowledged,
    uiIpcDeliveryAcknowledged: result.uiIpcDeliveryAcknowledged,
    ordinaryInstallTransactionReady: result.ordinaryInstallTransactionReady,
    commandContinuationAllowed: result.commandContinuationAllowed,
    uiIpcResultContinuationAllowed: result.uiIpcResultContinuationAllowed,
    startupGateContinuationAllowed: result.startupGateContinuationAllowed,
    checksSatisfied: result.checks.every(check => check.status === 'satisfied'),
    diagnosticsCount: result.diagnostics.length,
    effects: {
      ordinaryInstallTransactionReady: result.effects.ordinaryInstallTransactionReady,
      successOutcomeAccepted: result.effects.successOutcomeAccepted,
      rollbackOutcomeAccepted: result.effects.rollbackOutcomeAccepted,
      realRecoveryLogReplayRestoreCalled: result.effects.realRecoveryLogReplayRestoreCalled,
      packageFilesWritten: result.effects.packageFilesWritten,
      packageFilesRestored: result.effects.packageFilesRestored,
      settingsWritten: result.effects.settingsWritten,
      lockfileWritten: result.effects.lockfileWritten,
      uiIpcResponseDelivered: result.effects.uiIpcResponseDelivered,
      transactionLogPrepared:
        installTransactionCommitFinalizationProbe?.effects?.transactionLogPrepared === true,
      transactionLogRead:
        installTransactionCommitFinalizationProbe?.effects?.transactionLogRead === true,
      transactionCommitted:
        installTransactionCommitFinalizationProbe?.effects?.transactionCommitted === true,
      transactionLogCommitted:
        installTransactionCommitFinalizationProbe?.effects?.transactionLogCommitted === true,
      runtimePublicationCommitted: result.effects.runtimePublicationCommitted,
      recoveryLogRead: result.effects.recoveryLogRead,
      recoveryLogReplayed: result.effects.recoveryLogReplayed,
      savesWritten: result.effects.savesWritten,
      cacheWritten: result.effects.cacheWritten,
      transactionLogWritten:
        installTransactionCommitFinalizationProbe?.effects?.transactionLogWritten === true,
      rollbackExecuted: result.effects.rollbackExecuted,
      diagnosticsWritten: result.effects.diagnosticsWritten
    }
  }
}

const createModLockStorageProbeReport = async () => {
  const probe = createModLockProbe()
  const shouldExerciseWriteRead = runtimeProbeModLockWriteRead && !!process.env.PORTABLE_EXECUTABLE_DIR

  if (!shouldExerciseWriteRead) {
    return createPathFreeModLockProbeReport(await probe.inspect())
  }

  const draft = createSyntheticModLockDraft()
  const writeResult = await probe.write(draft)
  const readResult = await probe.read()
  const report = writeResult.report.status === 'written'
    ? readResult.report
    : writeResult.report

  return createPathFreeModLockProbeReport(report, {
    operation: 'write-read',
    lockfileWritten: writeResult.report.effects.lockfileWritten,
    extra: {
      writeStatus: writeResult.report.status,
      readStatus: readResult.report.status,
      draftRoundTripMatched: JSON.stringify(readResult.draft) === JSON.stringify(draft)
    }
  })
}

const writeRuntimeProbeOutput = (value, exitCode = 0) => {
  if (!runtimeProbeOutputPath) return
  try {
    const serialized = JSON.stringify(value, null, 2) + '\n'
    if (Buffer.byteLength(serialized, 'utf8') > 1_000_000) {
      throw new Error('Runtime probe report exceeded the size limit')
    }
    fs.mkdirSync(path.dirname(runtimeProbeOutputPath), { recursive: true })
    const temporaryPath = `${runtimeProbeOutputPath}.tmp-${process.pid}`
    fs.writeFileSync(temporaryPath, serialized, 'utf8')
    fs.renameSync(temporaryPath, runtimeProbeOutputPath)
    process.exitCode = exitCode
  } catch (error) {
    console.error('Failed to write runtime probe output:', error)
    process.exitCode = 1
  }
  if (runtimeProbeAutoExit) {
    isQuitting = true
    setImmediate(() => app.quit())
  }
}

const writeRuntimeProbeFailure = code => {
  writeRuntimeProbeOutput({
    schemaVersion: 1,
    target: 'electron',
    probeError: code
  }, 1)
}

const readElectronProductSurface = async () => {
  if (!win || win.isDestroyed()) {
    return {
      schemaVersion: 1,
      webDataPackImportPanelVisible: false,
      responseDeliverySummaryVisible: false,
      responseDeliverySummaryText: null
    }
  }
  return await win.webContents.executeJavaScript(
    `(() => {
      const text = node => typeof node?.textContent === 'string'
        ? node.textContent.replace(/\\s+/g, ' ').trim()
        : null
      const importPanel = document.querySelector('[data-testid="web-data-pack-import-preflight-panel"]')
      const responseSummary = document.querySelector('[data-testid="web-mod-response-delivery-summary"]')
      return {
        schemaVersion: 1,
        webDataPackImportPanelVisible: importPanel !== null,
        responseDeliverySummaryVisible: responseSummary !== null,
        responseDeliverySummaryText: text(responseSummary)
      }
    })()`,
    true
  )
}

const waitForElectronProductSurface = async (timeoutMs = 10_000) => {
  const deadline = Date.now() + timeoutMs
  let latest = null
  while (Date.now() < deadline) {
    latest = await readElectronProductSurface()
    if (
      runtimeProbeRendererUiIpcProductSurfaceExpected
        ? latest?.responseDeliverySummaryVisible === true
        : latest?.webDataPackImportPanelVisible === true
    ) return latest
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  return latest
}

const appendStartupLog = message => {
  try {
    fs.appendFileSync(startupLogPath, `[${new Date().toISOString()}] ${message}\n`, 'utf8')
  } catch (e) {
    console.error('Failed to write startup log:', e)
  }
}

// 默认设置
const defaultSettings = {
  closeToTray: false, // 关闭窗口时隐藏到托盘
  autoLaunch: false // 开机自启动
}

// 读取设置
const loadSettings = () => {
  try {
    if (fs.existsSync(settingsPath)) {
      return { ...defaultSettings, ...JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) }
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
  return { ...defaultSettings }
}

// 保存设置
const saveSettings = s => {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(s, null, 2))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}

let settings = loadSettings()
let win = null
let tray = null
let isQuitting = false

// 销毁托盘
const destroyTray = () => {
  if (tray) {
    tray.destroy()
    tray = null
  }
}

// 设置开机自启动
const setAutoLaunch = enable => {
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: app.getPath('exe')
  })
}

// 创建托盘
const createTray = () => {
  if (tray) return

  const iconPath = path.join(publicPath, 'favicon.ico')
  const trayIcon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty()

  tray = new Tray(trayIcon)
  tray.setToolTip(pkg.title)

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示窗口', click: () => win?.show() },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => win?.show())
}

// 创建应用菜单
const createAppMenu = () => {
  const template = [
    {
      label: '设置',
      submenu: [
        {
          label: '关闭时最小化到托盘',
          type: 'checkbox',
          checked: settings.closeToTray,
          click: menuItem => {
            settings.closeToTray = menuItem.checked
            saveSettings(settings)
            if (settings.closeToTray) {
              createTray()
            } else {
              destroyTray()
            }
          }
        },
        {
          label: '开机自动启动',
          type: 'checkbox',
          checked: settings.autoLaunch,
          click: menuItem => {
            settings.autoLaunch = menuItem.checked
            saveSettings(settings)
            setAutoLaunch(settings.autoLaunch)
          }
        },
        {
          label: '退出游戏',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            isQuitting = true
            app.quit()
          }
        }
      ]
    },
    {
      label: '开发',
      submenu: [
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => win?.webContents.toggleDevTools()
        },
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click: () => win?.webContents.reload()
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 创建窗口
const createWindow = () => {
  win = new BrowserWindow({
    title: pkg.title,
    icon: path.join(publicPath, 'favicon.ico'),
    width: 1024,
    height: 768,
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    }
  })

  createAppMenu()
  const loadOptions = runtimeProbeEnabled
    ? {
        query: {
          taoyuanContentProbe: '1',
          ...(runtimeProbeStartupGateReady
            || runtimeProbeOrdinaryInstallTerminalSuccess
            || runtimeProbeStartupPersistentState
            ? { taoyuanThirdPartyStartupGateProbe: '1' }
            : {}),
          ...(runtimeProbeOrdinaryInstallTerminalSuccess || runtimeProbeStartupPersistentState
            ? { taoyuanThirdPartyStartupGateProductProfile: 'electron-ordinary-terminal' }
            : {}),
          ...(runtimeProbeStartupPersistentState
            ? {
                taoyuanThirdPartyStartupPersistentStateProbe: '1',
                taoyuanThirdPartyStartupPersistentStateSource:
                  'electron-program-directory-userdata'
              }
            : {}),
          ...(runtimeProbeStartupPersistentStateInstalledState
            ? { taoyuanThirdPartyStartupPersistentStateInstalledState: '1' }
            : {}),
          ...(runtimeProbeInstallTransactionCommitFinalization
            || runtimeProbeOrdinaryInstallTerminalSuccess
            ? { taoyuanThirdPartyRendererUiIpcInstallResultProbe: '1' }
            : {}),
          ...(runtimeProbeInstallCommandDispatchIpc
            ? { taoyuanThirdPartyElectronInstallCommandDispatchProbe: '1' }
            : {}),
          ...(runtimeProbeVisibleImport || runtimeProbeVisibleImportFailure
            ? { taoyuanThirdPartyVisibleImportProbe: '1' }
            : {}),
          ...(runtimeProbeVisibleImportRollback
            ? { taoyuanThirdPartyVisibleImportRollbackProbe: '1' }
            : {}),
          ...(runtimeProbeVisibleImportFailure
            ? { taoyuanThirdPartyVisibleImportFailureProbe: '1' }
            : {}),
          ...(runtimeProbeVisibleEnable
            ? { taoyuanThirdPartyVisibleEnableProbe: '1' }
            : {}),
          ...(runtimeProbeVisibleUpgrade
            ? { taoyuanThirdPartyVisibleUpgradeProbe: '1' }
            : {}),
          ...(runtimeProbeVisibleDisable
            ? { taoyuanThirdPartyVisibleDisableProbe: '1' }
            : {}),
          ...(runtimeProbeVisibleDisableFailAfterModLockWrite
            ? { taoyuanThirdPartyVisibleDisableExpectBlocked: '1' }
            : {}),
          ...(runtimeProbeVisibleUninstall
            ? { taoyuanThirdPartyVisibleUninstallProbe: '1' }
            : {}),
          ...(runtimeProbeVisibleUninstallFailAfterModLockWrite
            ? { taoyuanThirdPartyVisibleUninstallExpectBlocked: '1' }
            : {}),
          ...(runtimeProbeFault ? { taoyuanPrecompiledFault: runtimeProbeFault } : {})
        }
      }
    : undefined
  void win.loadFile(path.join(docsPath, 'index.html'), loadOptions)
  if (runtimeProbeEnabled) {
    win.webContents.once('did-fail-load', () => writeRuntimeProbeFailure('renderer-load-failed'))
  }

  // WebDAV CORS 绕过：对所有非同源请求注入 CORS 响应头
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const headers = { ...details.responseHeaders }
    headers['access-control-allow-origin'] = ['*']
    headers['access-control-allow-methods'] = ['GET, PUT, DELETE, PROPFIND, HEAD, OPTIONS']
    headers['access-control-allow-headers'] = ['Authorization, Content-Type, Depth']
    // 剥离 WWW-Authenticate 防止浏览器弹出原生认证对话框（由应用自行处理认证错误）
    delete headers['www-authenticate']
    delete headers['WWW-Authenticate']
    callback({ responseHeaders: headers })
  })

  // 窗口关闭事件
  win.on('close', e => {
    if (settings.closeToTray && !isQuitting) {
      e.preventDefault()
      win.hide()
      createTray()
    }
  })
}

// IPC 处理
ipcMain.handle('get-settings', () => settings)

ipcMain.handle('set-settings', (_, newSettings) => {
  settings = { ...settings, ...newSettings }
  saveSettings(settings)

  // 处理开机自启动
  setAutoLaunch(settings.autoLaunch)

  // 处理托盘
  if (settings.closeToTray) {
    createTray()
  } else {
    destroyTray()
  }

  return { needRestart: false }
})

ipcMain.handle('restart-window', () => {
  if (win) {
    const bounds = win.getBounds()
    win.destroy()
    createWindow()
    win.setBounds(bounds)
  }
})

ipcMain.handle('quit-app', () => {
  isQuitting = true
  app.quit()
})

ipcMain.handle('official-registry-cache-read', async () => {
  if (!isOfficialRegistryDiskCacheAvailable()) return null
  return await readOfficialRegistryCacheFile(officialCachePaths)
})

ipcMain.handle('official-registry-cache-write', async (_event, contents) => {
  if (!isOfficialRegistryDiskCacheAvailable()) {
    throw new Error('Official registry disk cache is unavailable outside executable userdata')
  }
  if (typeof contents !== 'string') {
    throw new TypeError('Official registry disk cache contents must be JSON text')
  }
  await writeOfficialRegistryCacheFile(
    officialCachePaths,
    contents,
    officialCacheMetadata
  )
  return { status: 'written' }
})

ipcMain.handle('electron-readonly-directory-source-get-entry', async (_event, sourcePath) =>
  toElectronReadonlyDirectorySourceIpcResult(
    'inspect',
    sourcePath,
    () => electronReadonlyDirectorySourceHost.getEntry(sourcePath)
  ))

ipcMain.handle('electron-readonly-directory-source-read-directory', async (_event, sourcePath) =>
  toElectronReadonlyDirectorySourceIpcResult(
    'list',
    sourcePath,
    () => electronReadonlyDirectorySourceHost.readDirectory(sourcePath)
  ))

ipcMain.handle('electron-readonly-directory-source-read-text-file', async (_event, sourcePath) =>
  toElectronReadonlyDirectorySourceIpcResult(
    'read',
    sourcePath,
    () => electronReadonlyDirectorySourceHost.readTextFile(sourcePath)
  ))

ipcMain.handle(thirdPartyDataPackElectronResponseDeliveryIpcChannel, (_event, envelope) =>
  thirdPartyDataPackResponseDeliveryHandler(envelope))

ipcMain.handle(thirdPartyDataPackElectronInstallCommandDispatchIpcChannel, (_event, envelope) =>
  thirdPartyDataPackInstallCommandDispatchHandler(envelope))

ipcMain.handle(thirdPartyDataPackElectronDisableCommandIpcChannel, (_event, envelope) =>
  thirdPartyDataPackDisableCommandHandler(envelope))

ipcMain.handle(thirdPartyDataPackElectronEnableCommandIpcChannel, (_event, envelope) =>
  thirdPartyDataPackEnableCommandHandler(envelope))

ipcMain.handle(thirdPartyDataPackElectronUninstallCommandIpcChannel, (_event, envelope) =>
  thirdPartyDataPackUninstallCommandHandler(envelope))

ipcMain.handle(thirdPartyDataPackElectronInstalledStateReadIpcChannel, () =>
  thirdPartyDataPackInstalledStateReadHandler())

ipcMain.handle(thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationIpcChannel, (_event, envelope) =>
  continueOrdinaryInstallTerminalFromRenderer(envelope))

ipcMain.handle(thirdPartyDataPackElectronStartupPersistentStateReadIpcChannel, (_event, request) =>
  thirdPartyDataPackStartupPersistentStateReadHandler(request))

ipcMain.on('startup-failure', (_event, message) => {
  if (typeof message !== 'string') return
  appendStartupLog(`[taoyuan-core] ${message.slice(0, 100_000)}`)
})

ipcMain.on('content-runtime-probe', (_event, report) => {
  if (!runtimeProbeEnabled) return
  if (
    !report
    || typeof report !== 'object'
    || report.schemaVersion !== 1
    || !report.runtime
    || typeof report.runtime !== 'object'
  ) {
    writeRuntimeProbeFailure('invalid-renderer-report')
    return
  }

  void (async() => {
    const userDataPath = app.getPath('userData')
    const expectedUserDataPath = getExecutableUserDataPath()
    const storagePath = session.defaultSession.storagePath
    const startupLogCurrentStat = fs.existsSync(startupLogPath)
      ? fs.statSync(startupLogPath)
      : null
    const startupLogChanged = startupLogInitialStat === null
      ? startupLogCurrentStat !== null
      : startupLogCurrentStat === null
        || startupLogInitialStat.size !== startupLogCurrentStat.size
        || startupLogInitialStat.mtimeMs !== startupLogCurrentStat.mtimeMs
    const modLockStorageProbe = await createModLockStorageProbeReport()
    const settingsLockfileWriterProbe = await createSettingsLockfileWriterProbeReport()
    const packageFilePersistentStagingProbe = await createPackageFilePersistentStagingProbeReport()
    const packageFileRestoreProbe = await createPackageFileRestoreProbeReport()
    const installCommandLifecycleProbe = await createInstallCommandLifecycleProbeReport(
      thirdPartyDataPackInstallCommandDispatchIpcProof
    )
    const installTransactionCommitFinalizationProbe =
      await createInstallTransactionCommitFinalizationProbeReport()
    const ordinaryInstallTerminalConnectionProbe =
      await createOrdinaryInstallTerminalConnectionProbeReport(
        installTransactionCommitFinalizationProbe,
        report.thirdPartyRendererUiIpc,
        installCommandLifecycleProbe
      )
    const electronProductSurface = await waitForElectronProductSurface()

    writeRuntimeProbeOutput({
      schemaVersion: 1,
      target: 'electron',
      runtime: report,
      electronProductSurface,
      electron: {
        isPackaged: app.isPackaged,
        userDataLocation: process.env.PORTABLE_EXECUTABLE_DIR
          ? 'probe-isolated-directory'
          : 'executable-directory',
        userDataMatchesConfiguredDirectory:
          path.resolve(userDataPath) === path.resolve(expectedUserDataPath),
        settingsInsideUserData: isPathInside(userDataPath, settingsPath),
        sessionStorageInsideUserData:
          typeof storagePath === 'string' && isPathInside(userDataPath, storagePath),
        officialCacheInsideUserData: isPathInside(userDataPath, officialCachePaths.filePath),
        officialCacheExists: fs.existsSync(officialCachePaths.filePath),
        startupLogChanged,
        modLockStorageProbe,
        settingsLockfileWriterProbe,
        packageFilePersistentStagingProbe,
        packageFileRestoreProbe,
        installCommandLifecycleProbe,
        installTransactionCommitFinalizationProbe,
        ordinaryInstallTerminalConnectionProbe
      }
    })
  })().catch(error => {
    console.error('Failed to create Electron runtime probe report:', error)
    writeRuntimeProbeFailure('electron-runtime-probe-failed')
  })
})

app.whenReady().then(() => {
  createWindow()

  if (runtimeProbeEnabled) {
    setTimeout(() => writeRuntimeProbeFailure('runtime-report-timeout'), 120_000)
  }

  // 如果启用了托盘功能，创建托盘
  if (settings.closeToTray) {
    createTray()
  }

  // 应用开机自启动设置
  setAutoLaunch(settings.autoLaunch)
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win) {
    win.show()
  } else {
    createWindow()
  }
})
