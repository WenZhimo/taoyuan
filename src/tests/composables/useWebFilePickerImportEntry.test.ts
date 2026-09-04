import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createDiscoveryFileSystemFromContentPackageSource,
  readContentPackageSourceJson,
  type ContentPackageSourceDirectoryEntry
} from '@/domain/mods/contentPackageSource'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId, type PackageId } from '@/domain/mods/ids'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { getOfficialItemDef } from '@/domain/mods/contentAccess'
import { resetLiveContentRegistryForTests } from '@/domain/mods/liveContentRegistry'
import { discoverThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackDiscovery'
import type {
  ThirdPartyDataPackModManagementCommandId,
  ThirdPartyDataPackModManagementReadModel
} from '@/domain/mods/thirdPartyDataPackModManagementReadModel'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorHost
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorAdapter'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope,
  ThirdPartyDataPackAtomicTransactionCommitExecutorHostResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorSource'
import type {
  ThirdPartyDataPackPostCommitPersistentReadsProofs
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentReadsSource'
import type {
  ThirdPartyDataPackPostCommitVerificationSummary
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorAdapter'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope,
  ThirdPartyDataPackTransactionCommandDispatcherHostResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherSource'
import type {
  ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope,
  ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult
} from '@/domain/mods/thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationBridge'
import type { WebFilePickerImportFile } from '@/domain/mods/webFilePickerImportSource'
import { createInMemoryWebIndexedDbImportPersistenceStore } from '@/domain/mods/webIndexedDbImportPersistence'
import {
  createInMemoryWebSettingsLockfilePersistentWriterStore,
  THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID
} from '@/domain/mods/thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
import {
  createInMemoryWebInstallTransactionLogPreparedStore,
  THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND
} from '@/domain/mods/thirdPartyDataPackWebInstallTransactionLogPreparedStorageHost'
import {
  readThirdPartyDataPackWebStartupPersistentStateSnapshot
} from '@/domain/mods/thirdPartyDataPackWebStartupPersistentStateSourceHost'
import {
  WEB_FILE_PICKER_IMPORT_ENTRY_DEFAULT_IMPORT_ID,
  createBrowserWebFilePickerSelector,
  type WebFilePickerPostCommitPersistentStateReader,
  type WebFilePickerPostCommitSettingsLockfileCommitSourceReader,
  type WebFilePickerPostCommitUiIpcDeliveryContinuationReader,
  type WebFilePickerPostCommitVerificationExecutor,
  type WebFilePickerPostCommitVerificationExecutorAdapterReader,
  useWebFilePickerImportEntry
} from '@/composables/useWebFilePickerImportEntry'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

type JsonObject = Record<string, unknown>

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = (packageId = 'web_entry', version = '1.0.0'): JsonObject => ({
  id: packageId,
  name: { key: `${packageId}.package.name`, fallback: packageId },
  version,
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Web Entry Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = (
  id = 'web_entry:linen_ribbon',
  nameFallback = id
): JsonObject => ({
  id,
  name: { key: `${id}.name`, fallback: nameFallback },
  category: 'gift',
  description: { key: `${id}.description`, fallback: `${id} description` },
  sellPrice: 8,
  edible: false
})

const createFile = (path: string, text: string): WebFilePickerImportFile => ({
  name: path.split('/').pop() ?? path,
  webkitRelativePath: path,
  size: text.length,
  text: vi.fn(async() => text)
})

const createValidFiles = (
  packageId = 'web_entry',
  options: {
    readonly version?: string
    readonly itemNameFallback?: string
  } = {}
): readonly WebFilePickerImportFile[] => [
  createFile('valid-gift-pack/manifest.json', toJson(createManifest(packageId, options.version ?? '1.0.0'))),
  createFile('valid-gift-pack/locales/zh-CN.json', '{}\n'),
  createFile('valid-gift-pack/data/items.json', toJson([
    createItem(`${packageId}:linen_ribbon`, options.itemNameFallback)
  ]))
]

const createElectronReadonlyDirectoryHost = async(
  files: readonly WebFilePickerImportFile[]
) => {
  const directories = new Set<string>([''])
  const fileTexts = new Map<string, string>()
  for (const file of files) {
    const sourcePath = file.webkitRelativePath || file.name
    fileTexts.set(sourcePath, await file.text())
    const parts = sourcePath.split('/')
    for (let index = 1; index < parts.length; index += 1) {
      directories.add(parts.slice(0, index).join('/'))
    }
  }

  const entryName = (sourcePath: string): string =>
    sourcePath.split('/').filter(Boolean).pop() ?? 'mods'
  const entry = (
    sourcePath: string,
    kind: ContentPackageSourceDirectoryEntry['kind']
  ): ContentPackageSourceDirectoryEntry => ({
    name: entryName(sourcePath),
    kind,
    isSymbolicLink: false
  })

  return {
    getEntry: vi.fn(async(sourcePath: string) => {
      const value = directories.has(sourcePath)
        ? entry(sourcePath, 'directory')
        : fileTexts.has(sourcePath)
          ? entry(sourcePath, 'file')
          : null
      return { ok: true, value }
    }),
    readDirectory: vi.fn(async(sourcePath: string) => {
      const prefix = sourcePath === '' ? '' : `${sourcePath}/`
      const entries = new Map<string, ContentPackageSourceDirectoryEntry>()
      for (const directoryPath of directories) {
        if (directoryPath === sourcePath || !directoryPath.startsWith(prefix)) continue
        const relativePath = directoryPath.slice(prefix.length)
        if (!relativePath.includes('/')) entries.set(relativePath, entry(directoryPath, 'directory'))
      }
      for (const filePath of fileTexts.keys()) {
        if (!filePath.startsWith(prefix)) continue
        const relativePath = filePath.slice(prefix.length)
        if (!relativePath.includes('/')) entries.set(relativePath, entry(filePath, 'file'))
      }
      return { ok: true, value: [...entries.values()] }
    }),
    readTextFile: vi.fn(async(sourcePath: string) => {
      const text = fileTexts.get(sourcePath)
      if (text === undefined) throw new Error(`missing source file: ${sourcePath}`)
      return { ok: true, value: text }
    })
  }
}

const webEntryPackageId = requirePackageId('web_entry')
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash
const officialIdentity = {
  artifactHash: committedMetadata.artifactHash as Sha256Hash,
  contentHash: committedMetadata.contentHash as Sha256Hash,
  schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
  environmentHash: committedMetadata.environmentHash as Sha256Hash,
  snapshotHash: committedMetadata.snapshotHash as Sha256Hash,
  registryCount: 54,
  entryCount: 4242
}
const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('1'),
  snapshotHash: testHash('2'),
  candidateHash: testHash('3')
} as const
const lockfileHash = testHash('4')
const mountedAppStartupHostEvidence = Object.freeze({
  realAppStartupHostCalled: true,
  gameAppCreated: true,
  piniaCreated: true,
  routerMounted: true
} as const)
const commandIds: readonly ThirdPartyDataPackModManagementCommandId[] = [
  'install',
  'enable',
  'disable',
  'upgrade',
  'uninstall'
]
const readModelEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
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
} as const
const commitAdapterEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
} as const

afterEach(() => {
  resetLiveContentRegistryForTests()
  vi.restoreAllMocks()
})

const createDispatchedHostResult = (
  envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
): ThirdPartyDataPackTransactionCommandDispatcherHostResult => Object.freeze({
  status: 'dispatched',
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  diagnostics: [],
  effects: {
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
  } as const
})

const createInjectedAtomicTransactionCommitHost = (): ThirdPartyDataPackAtomicTransactionCommitExecutorHost => ({
  kind: 'injected-atomic-transaction-commit-executor',
  mode: 'injected-test-only',
  execute: vi.fn(request => ({
    kind: 'committed' as const,
    settled: true as const,
    packageId: request.packageId,
    candidateIdentity: request.candidateIdentity,
    lockfileHash: request.lockfileHash,
    messageKey: 'mods.atomic.commit.install.committed',
    recovery: 'none' as const
  }))
})

const createAcceptedAtomicTransactionCommitHostResult = (
  envelope: ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope
): ThirdPartyDataPackAtomicTransactionCommitExecutorHostResult => Object.freeze({
  status: 'accepted',
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  commitOutcomeKind: envelope.commitOutcomeKind,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  diagnostics: [],
  effects: {
    atomicCommitExecutorHostCalled: true,
    atomicCommitExecutorHostAccepted: true,
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
  } as const
})

const withWindowElectronApi = (
  electronAPI: Record<string, unknown>
): (() => void) => {
  const previousDescriptor = Reflect.getOwnPropertyDescriptor(window, 'electronAPI')
  Object.defineProperty(window, 'electronAPI', {
    configurable: true,
    enumerable: true,
    value: electronAPI
  })
  return () => {
    if (previousDescriptor === undefined) {
      Reflect.deleteProperty(window, 'electronAPI')
      return
    }
    Object.defineProperty(window, 'electronAPI', previousDescriptor)
  }
}

const createReadModel = (
  packageId: PackageId = webEntryPackageId
): ThirdPartyDataPackModManagementReadModel => ({
  status: 'ready',
  reason: 'Read-only mod management model is ready for future UI rendering; command dispatch, IPC and writes remain disabled.',
  sourcePreflightStatus: 'deferred',
  readModelKind: 'third-party-data-pack-mod-management-read-model',
  readOnly: true,
  readModelAvailable: true,
  uiMountAllowed: false,
  ipcAllowed: false,
  commandDispatchAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  summary: {
    officialRegistryCount: 54,
    officialEntryCount: 4242,
    candidateRegistryCount: 55,
    candidateEntryCount: 4243,
    packageCount: 1,
    selectedPackageCount: 1,
    blockedPackageCount: 0,
    blockedCandidateCount: 0,
    loadOrderCount: 1
  },
  identity: {
    official: officialIdentity,
    candidate: candidateIdentity,
    lockfileHash
  },
  packageRows: [{
    packageId,
    status: 'selected',
    loadOrderIndex: 0,
    reason: 'Package is selected in the current preflight load order.'
  }],
  diagnostics: [],
  stageRows: [],
  requirementRows: [],
  commandStates: commandIds.map(id => ({
    id,
    status: 'disabled',
    requiresExplicitConfirmation: true,
    reason: 'Commands are disabled until explicit confirmation, transaction command dispatch and persistent write boundaries are wired.'
  })),
  effects: readModelEffects
})

const createRuntimePublicationCommitAdapter = (
  packageId: PackageId = webEntryPackageId
): ThirdPartyDataPackRuntimePublicationCommitAdapterResult => ({
  status: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  transactionPreCommitPlanStatus: 'deferred',
  liveRegistrySwapProtectionStatus: 'deferred',
  publicationRollbackRecoveryStatus: 'deferred',
  reason: 'runtime publication commit adapter is inspect-only until atomic commit adapter, persistent writers and post-commit verification exist',
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  officialIdentity,
  candidateIdentity,
  lockfileHash,
  runtimePublicationCommit: 'deferred',
  commitAllowed: false,
  publicationAllowed: false,
  writeAllowed: false,
  liveRegistryMutable: false,
  rollbackExecutionAllowed: false,
  commitChecks: [],
  commitStages: [],
  requiredCommitAdapters: [],
  effects: commitAdapterEffects
})

const persistentReadProofs: ThirdPartyDataPackPostCommitPersistentReadsProofs = {
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true
}

const noPostCommitReadWriteEffects = {
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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
} as const

const createPostCommitVerificationSummary = (
  envelope: ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope
): ThirdPartyDataPackPostCommitVerificationSummary => ({
  selectedPackageCount: envelope.selectedPackageIds.length,
  blockedPackageCount: envelope.blockedPackageIds.length,
  blockedCandidateCount: 0,
  loadOrderCount: envelope.loadOrder.length,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  diagnosticCount: 0
})

const createReadyPostCommitReaders = (
  readAtomicEnvelope: () => ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope | null
): {
  readonly readSettingsLockfileCommitSource: WebFilePickerPostCommitSettingsLockfileCommitSourceReader
  readonly readPostCommitVerificationExecutorAdapter: WebFilePickerPostCommitVerificationExecutorAdapterReader
  readonly readPostCommitPersistentState: WebFilePickerPostCommitPersistentStateReader
  readonly executePostCommitVerification: WebFilePickerPostCommitVerificationExecutor
} => {
  const requireAtomicEnvelope = (): ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope => {
    const envelope = readAtomicEnvelope()
    if (envelope === null) throw new Error('atomic commit envelope was not captured')
    return envelope
  }

  return {
    readSettingsLockfileCommitSource: vi.fn(async() => {
      const envelope = requireAtomicEnvelope()
      return {
        kind: 'third-party-settings-lockfile-commit-source',
        mode: 'default-disabled-settings-lockfile-commit-source',
        status: 'accepted',
        reason: 'settings-lockfile commit source accepted an injected host acknowledgement',
        readOnly: true,
        enabled: true,
        sourceCalled: true,
        appBootstrapContinuationAllowed: true,
        commandContinuationAllowed: true,
        packageFileStagingSourceStatus: 'accepted',
        packageFileStagingHostStatus: 'accepted',
        settingsLockfileCommitHostStatus: 'accepted',
        requestedCommandId: envelope.requestedCommandId,
        targetPackageId: envelope.targetPackageId,
        selectedPackageIds: envelope.selectedPackageIds,
        blockedPackageIds: envelope.blockedPackageIds,
        blockedCandidatePaths: [],
        loadOrder: envelope.loadOrder,
        registryCount: envelope.registryCount,
        entryCount: envelope.entryCount,
        packageCount: envelope.packageCount,
        candidateIdentity: envelope.candidateIdentity,
        lockfileHash: envelope.lockfileHash,
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
      } as const
    }) as WebFilePickerPostCommitSettingsLockfileCommitSourceReader,
    readPostCommitVerificationExecutorAdapter: vi.fn(async() => {
      const envelope = requireAtomicEnvelope()
      const summary = createPostCommitVerificationSummary(envelope)
      return {
        status: 'executed',
        sourcePreflightStatus: 'deferred',
        reason: 'post-commit verification executor adapter executed the injected-test-only host',
        postCommitVerificationExecutorAdapter: 'executed',
        readOnly: true,
        injectedExecutorHostRequired: true,
        postCommitVerificationExecutorHostMode: 'injected-test-only',
        injectedExecutorHostMode: 'injected-test-only',
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
        requestedCommandId: envelope.requestedCommandId,
        targetPackageId: envelope.targetPackageId,
        selectedPackageIds: envelope.selectedPackageIds,
        blockedPackageIds: envelope.blockedPackageIds,
        blockedCandidateCount: 0,
        loadOrder: envelope.loadOrder,
        registryCount: envelope.registryCount,
        entryCount: envelope.entryCount,
        packageCount: envelope.packageCount,
        candidateIdentity: envelope.candidateIdentity,
        lockfileHash: envelope.lockfileHash,
        checks: [],
        diagnostics: [],
        outcome: {
          formatVersion: 1,
          kind: 'verified',
          commandId: envelope.requestedCommandId,
          packageId: envelope.targetPackageId,
          candidateHash: envelope.candidateIdentity.candidateHash,
          lockfileHash: envelope.lockfileHash,
          transactionLogMatched: true,
          packageStateMatched: true,
          settingsLockfileMatched: true,
          liveRegistryMatched: true,
          saveCacheIsolated: true,
          messageKey: 'mods.post.commit.verification.install.verified',
          recovery: 'none',
          retryable: false,
          rollbackRequired: false,
          summary,
          diagnostics: []
        },
        summary,
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
          transactionCommitted: false,
          postCommitVerificationExecutorCalled: true,
          injectedVerificationHostCalled: true,
          verificationOutcomeReceived: true,
          verifiedOutcomeReceived: true,
          failedOutcomeReceived: false,
          retryOutcomeReceived: false,
          rollbackOutcomeReceived: false,
          postCommitVerificationExecuted: false,
          ...noPostCommitReadWriteEffects
        }
      } as const
    }) as WebFilePickerPostCommitVerificationExecutorAdapterReader,
    readPostCommitPersistentState: vi.fn(async envelope => ({
      status: 'accepted' as const,
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
      packageFileStagingHostStatus: envelope.packageFileStagingHostStatus,
      settingsLockfileCommitHostStatus: envelope.settingsLockfileCommitHostStatus,
      modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
      transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
      modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
      transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
      persistentReadProofs,
      diagnostics: [],
      effects: {
        postCommitPersistentReadsHostCalled: true,
        postCommitPersistentReadsHostAccepted: true,
        ...noPostCommitReadWriteEffects
      }
    } as const)) as WebFilePickerPostCommitPersistentStateReader,
    executePostCommitVerification: vi.fn(async envelope => ({
      status: 'accepted' as const,
      requestedCommandId: envelope.requestedCommandId,
      targetPackageId: envelope.targetPackageId,
      verificationOutcomeKind: envelope.verificationOutcomeKind,
      candidateHash: envelope.candidateIdentity.candidateHash,
      lockfileHash: envelope.lockfileHash,
      transactionLogMatched: true,
      packageStateMatched: true,
      settingsLockfileMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true,
      diagnostics: [],
      effects: {
        postCommitVerificationExecutorHostCalled: true,
        postCommitVerificationExecutorHostAccepted: true,
        postCommitVerificationExecuted: false,
        ...noPostCommitReadWriteEffects
      }
    } as const)) as WebFilePickerPostCommitVerificationExecutor
  }
}

const createReadyPostCommitUiIpcDeliveryContinuation = (
  readAtomicEnvelope: () => ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope | null
): WebFilePickerPostCommitUiIpcDeliveryContinuationReader => vi.fn(async() => {
  const envelope = readAtomicEnvelope()
  if (envelope === null) throw new Error('atomic commit envelope was not captured')
  const deliverySummary = createPostCommitVerificationSummary(envelope)
  return {
    kind: 'third-party-post-commit-ui-ipc-delivery-continuation-source',
    mode: 'default-disabled-post-commit-ui-ipc-delivery-continuation-source',
    status: 'ready',
    reason: 'post-commit UI/IPC continuation accepted injected terminal delivery evidence',
    readOnly: false,
    enabled: true,
    sourceCalled: true,
    postCommitPersistentReadWriteConnectionStatus: 'accepted',
    uiIpcResponseDeliveryAcknowledgementConvergenceStatus: 'ready',
    selectedPlatform: 'web',
    requestedCommandId: envelope.requestedCommandId,
    targetPackageId: envelope.targetPackageId,
    selectedPackageIds: envelope.selectedPackageIds,
    blockedPackageIds: envelope.blockedPackageIds,
    blockedCandidateCount: 0,
    loadOrder: envelope.loadOrder,
    registryCount: envelope.registryCount,
    entryCount: envelope.entryCount,
    packageCount: envelope.packageCount,
    candidateIdentity: envelope.candidateIdentity,
    candidateHash: envelope.candidateIdentity.candidateHash,
    lockfileHash: envelope.lockfileHash,
    envelopeKind: 'success',
    messageKey: 'mods.ui.ipc.result.install.success',
    deliverySummary,
    acknowledgement: {
      status: 'acknowledged',
      platform: 'web',
      packageId: envelope.targetPackageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    },
    persistentPackageWriteExecuted: true,
    persistentSettingsLockfileWriteExecuted: true,
    writtenFileCount: 2,
    backedUpFileCount: 1,
    transactionCommitConnectionAcknowledged: true,
    postCommitPersistentReadWriteConnectionAcknowledged: true,
    uiIpcDeliveryAcknowledged: true,
    commandContinuationAllowed: true,
    uiIpcResultContinuationAllowed: true,
    startupGateContinuationAllowed: true,
    checks: [],
    diagnostics: [],
    effects: {
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
      packageBackupsWritten: true,
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
    }
  } as const
}) as WebFilePickerPostCommitUiIpcDeliveryContinuationReader

const createReadyElectronOrdinaryInstallTerminalContinuationResult = (
  envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
): ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult => {
  const handoff = envelope.transactionCommandDispatcherHandoff
  const targetPackageId = handoff.targetPackageId ?? webEntryPackageId
  const summary = {
    selectedPackageCount: handoff.selectedPackageIds.length,
    blockedPackageCount: handoff.blockedPackageIds.length,
    blockedCandidateCount: 0,
    loadOrderCount: handoff.loadOrder.length,
    registryCount: handoff.registryCount,
    entryCount: handoff.entryCount,
    packageCount: handoff.packageCount,
    diagnosticCount: 0
  }

  return {
    status: 'ready',
    reason: 'Electron ordinary install terminal continuation reached ready test handoff',
    installCommandPostCommitAcknowledgement: {
      status: 'ready',
      reason: 'Electron continuation accepted renderer dispatch, persistent writes and post-commit verification',
      requestedCommandId: 'install',
      targetPackageId,
      selectedPackageIds: handoff.selectedPackageIds,
      blockedPackageIds: handoff.blockedPackageIds,
      loadOrder: handoff.loadOrder,
      registryCount: handoff.registryCount,
      entryCount: handoff.entryCount,
      packageCount: handoff.packageCount,
      candidateIdentity: handoff.candidateIdentity,
      lockfileHash: handoff.lockfileHash,
      commandContinuationAllowed: true,
      uiIpcResultContinuationAllowed: true,
      checks: [],
      diagnostics: [],
      effects: {
        commandDispatched: true,
        atomicCommitExecutorAcknowledged: true,
        postCommitVerificationAcknowledged: true,
        persistentReadProofAcknowledged: true,
        transactionCommitted: false,
        runtimePublicationCommitted: false,
        packageFilesWritten: true,
        settingsWritten: true,
        lockfileWritten: true
      }
    },
    installTransactionLogPrepared: {
      status: 'prepared',
      requestedCommandId: 'install',
      targetPackageId,
      selectedPackageIds: handoff.selectedPackageIds,
      blockedPackageIds: handoff.blockedPackageIds,
      loadOrder: handoff.loadOrder,
      registryCount: handoff.registryCount,
      entryCount: handoff.entryCount,
      packageCount: handoff.packageCount,
      candidateIdentity: handoff.candidateIdentity,
      lockfileHash: handoff.lockfileHash,
      diagnostics: [],
      effects: {
        transactionLogPrepared: true,
        transactionLogWritten: true,
        transactionCommitted: false,
        packageFilesWritten: true,
        settingsWritten: true,
        lockfileWritten: true
      }
    },
    installTransactionLogPreparedPersistentReadVerification: {
      status: 'verified',
      requestedCommandId: 'install',
      targetPackageId,
      selectedPackageIds: handoff.selectedPackageIds,
      blockedPackageIds: handoff.blockedPackageIds,
      loadOrder: handoff.loadOrder,
      registryCount: handoff.registryCount,
      entryCount: handoff.entryCount,
      packageCount: handoff.packageCount,
      candidateIdentity: handoff.candidateIdentity,
      lockfileHash: handoff.lockfileHash,
      diagnostics: [],
      effects: {
        transactionLogPrepared: true,
        transactionLogWritten: true,
        transactionLogRead: true,
        transactionCommitted: false,
        packageFilesWritten: true,
        settingsWritten: true,
        lockfileWritten: true
      }
    },
    installTransactionCommitFinalization: {
      status: 'committed',
      requestedCommandId: 'install',
      targetPackageId,
      selectedPackageIds: handoff.selectedPackageIds,
      blockedPackageIds: handoff.blockedPackageIds,
      loadOrder: handoff.loadOrder,
      registryCount: handoff.registryCount,
      entryCount: handoff.entryCount,
      packageCount: handoff.packageCount,
      candidateIdentity: handoff.candidateIdentity,
      lockfileHash: handoff.lockfileHash,
      diagnostics: [],
      effects: {
        transactionCommitted: true,
        transactionLogCommitted: true,
        transactionLogPrepared: true,
        transactionLogWritten: true,
        transactionLogRead: true,
        packageFilesWritten: true,
        settingsWritten: true,
        lockfileWritten: true
      }
    },
    postCommitUiIpcDeliveryContinuation: {
      kind: 'third-party-post-commit-ui-ipc-delivery-continuation-source',
      mode: 'default-disabled-post-commit-ui-ipc-delivery-continuation-source',
      status: 'ready',
      reason: 'Electron continuation delivered visible import success response',
      readOnly: false,
      enabled: true,
      sourceCalled: true,
      postCommitPersistentReadWriteConnectionStatus: 'accepted',
      uiIpcResponseDeliveryAcknowledgementConvergenceStatus: 'ready',
      selectedPlatform: 'electron',
      requestedCommandId: 'install',
      targetPackageId,
      selectedPackageIds: handoff.selectedPackageIds,
      blockedPackageIds: handoff.blockedPackageIds,
      blockedCandidateCount: 0,
      loadOrder: handoff.loadOrder,
      registryCount: handoff.registryCount,
      entryCount: handoff.entryCount,
      packageCount: handoff.packageCount,
      candidateIdentity: handoff.candidateIdentity,
      candidateHash: handoff.candidateIdentity?.candidateHash,
      lockfileHash: handoff.lockfileHash,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success',
      deliverySummary: summary,
      acknowledgement: {
        status: 'acknowledged',
        platform: 'electron',
        packageId: targetPackageId,
        envelopeKind: 'success',
        messageKey: 'mods.ui.ipc.result.install.success'
      },
      persistentPackageWriteExecuted: true,
      persistentSettingsLockfileWriteExecuted: true,
      writtenFileCount: envelope.packageFilePayload.length,
      backedUpFileCount: 0,
      transactionCommitConnectionAcknowledged: true,
      postCommitPersistentReadWriteConnectionAcknowledged: true,
      uiIpcDeliveryAcknowledged: true,
      commandContinuationAllowed: true,
      uiIpcResultContinuationAllowed: true,
      startupGateContinuationAllowed: true,
      checks: [],
      diagnostics: [],
      effects: {
        uiIpcResponseDelivered: true,
        successEnvelopeDelivered: true,
        transactionCommitted: false,
        runtimePublicationCommitted: false,
        packageFilesWritten: true,
        packageBackupsWritten: false,
        settingsWritten: true,
        lockfileWritten: true
      }
    },
    ordinaryInstallTransactionTerminalConnection: {
      kind: 'third-party-ordinary-install-transaction-pipeline',
      mode: 'default-disabled-ordinary-install-transaction-pipeline',
      status: 'ready',
      reason: 'Electron continuation reached ordinary install terminal semantics',
      readOnly: false,
      enabled: true,
      pipelineCalled: true,
      sourceCalled: true,
      semanticsVersion: 1,
      stability: 'internal-candidate',
      publicModLockSchemaFrozen: false,
      publicTransactionApiFrozen: false,
      publicApiReleaseAllowed: false,
      publicSchemaSetHashChanged: false,
      requestedCommandId: 'install',
      targetPackageId,
      selectedPackageIds: handoff.selectedPackageIds,
      blockedPackageIds: handoff.blockedPackageIds,
      blockedCandidateCount: 0,
      loadOrder: handoff.loadOrder,
      registryCount: handoff.registryCount,
      entryCount: handoff.entryCount,
      packageCount: handoff.packageCount,
      candidateIdentity: handoff.candidateIdentity,
      candidateHash: handoff.candidateIdentity?.candidateHash,
      lockfileHash: handoff.lockfileHash,
      outcomeKind: 'success',
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
      rollbackRecoverySettled: false,
      rollbackRecoveryExecutionAcknowledged: false,
      ordinaryInstallTransactionReady: true,
      checks: [],
      diagnostics: [],
      effects: {
        ordinaryInstallTransactionReady: true,
        successOutcomeAccepted: true,
        failureOutcomeAccepted: false,
        retryOutcomeAccepted: false,
        rollbackOutcomeAccepted: false,
        rollbackRecoverySettled: false,
        rollbackRecoveryExecutionAcknowledged: false,
        transactionCommitted: false,
        runtimePublicationCommitted: false,
        runtimeEnablementAllowed: false,
        uiIpcResponseDelivered: true,
        packageFilesWritten: true,
        packageFilesRestored: false,
        rollbackExecuted: false,
        lockfileWritten: true,
        settingsWritten: true
      }
    },
    runtimePublicationCommitAfterPostCommitVerification: {
      kind: 'third-party-runtime-publication-commit-after-post-commit-verification-pipeline',
      mode: 'default-disabled-runtime-publication-commit-after-post-commit-verification-pipeline',
      status: 'accepted',
      reason: 'Electron continuation accepted runtime publication commit after post-commit verification',
      readOnly: true,
      enabled: true,
      postCommitVerificationAfterInstallTransactionCommitSourceCalled: true,
      runtimePublicationCommitSourceCalled: true,
      appBootstrapContinuationAllowed: true,
      commandContinuationAllowed: true,
      uiIpcResultContinuationAllowed: true,
      requestedCommandId: 'install',
      targetPackageId,
      selectedPackageIds: handoff.selectedPackageIds,
      blockedPackageIds: handoff.blockedPackageIds,
      loadOrder: handoff.loadOrder,
      registryCount: handoff.registryCount,
      entryCount: handoff.entryCount,
      packageCount: handoff.packageCount,
      candidateIdentity: handoff.candidateIdentity,
      candidateHash: handoff.candidateIdentity?.candidateHash,
      lockfileHash: handoff.lockfileHash,
      checks: [],
      diagnostics: [],
      effects: {
        runtimePublicationCommitAfterPostCommitVerificationPipelineCalled: true,
        postCommitVerificationAfterInstallTransactionCommitPipelineCalled: true,
        runtimePublicationCommitPipelineCalled: true,
        runtimePublicationCommitHostAccepted: true,
        transactionCommitted: true,
        transactionLogCommitted: true,
        postCommitVerificationAcknowledged: true,
        persistentReadProofAcknowledged: true,
        runtimePublicationCommitAcknowledged: true,
        appBootstrapContinuationAllowed: true,
        commandContinuationAllowed: true,
        uiIpcResultContinuationAllowed: true,
        realRuntimePublicationCommitCalled: true,
        runtimePublicationCommitted: true
      }
    },
    runtimePublicationCommitLiveRegistrySwapHostConnection: {
      kind: 'third-party-runtime-publication-commit-live-registry-swap-host-connection-pipeline',
      mode: 'default-disabled-runtime-publication-commit-live-registry-swap-host-connection-pipeline',
      status: 'swapped',
      reason: 'Electron continuation swapped live registry after runtime publication commit',
      readOnly: true,
      enabled: true,
      runtimePublicationCommitAfterPostCommitVerificationSourceCalled: true,
      runtimePublicationLiveRegistrySwapHostConnectionSourceCalled: true,
      appBootstrapContinuationAllowed: true,
      commandContinuationAllowed: true,
      requestedCommandId: 'install',
      targetPackageId,
      selectedPackageIds: handoff.selectedPackageIds,
      blockedPackageIds: handoff.blockedPackageIds,
      loadOrder: handoff.loadOrder,
      registryCount: handoff.registryCount,
      entryCount: handoff.entryCount,
      packageCount: handoff.packageCount,
      candidateIdentity: handoff.candidateIdentity,
      candidateHash: handoff.candidateIdentity?.candidateHash,
      lockfileHash: handoff.lockfileHash,
      checks: [],
      diagnostics: [],
      effects: {
        runtimePublicationCommitLiveRegistrySwapHostConnectionPipelineCalled: true,
        runtimePublicationCommitAfterPostCommitVerificationPipelineCalled: true,
        runtimePublicationLiveRegistrySwapHostConnectionPipelineCalled: true,
        runtimePublicationCommitAcknowledged: true,
        postCommitVerificationAcknowledged: true,
        liveRegistrySwapAcknowledged: true,
        appBootstrapContinuationAllowed: true,
        commandContinuationAllowed: true,
        thirdPartyRegistryPublished: true,
        liveRegistryMutated: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        realRuntimePublicationCommitCalled: true,
        runtimePublicationCommitted: true
      }
    },
    runtimePublicationCommitAppStartupReadiness: {
      kind: 'third-party-runtime-publication-commit-app-startup-readiness-pipeline',
      mode: 'default-disabled-runtime-publication-commit-app-startup-readiness-pipeline',
      status: 'ready',
      reason: 'Electron continuation reached app startup readiness after live registry swap',
      readOnly: true,
      runtimeOnly: true,
      persistentWrite: false,
      enabled: true,
      runtimePublicationCommitLiveRegistrySwapHostConnectionSourceCalled: true,
      runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSourceCalled: true,
      appStartupReadinessAllowed: true,
      appBootstrapContinuationAllowed: true,
      normalStartupContinuationAllowed: true,
      commandContinuationAllowed: true,
      uiIpcResultContinuationAllowed: true,
      requestedCommandId: 'install',
      targetPackageId,
      selectedPackageIds: handoff.selectedPackageIds,
      blockedPackageIds: handoff.blockedPackageIds,
      loadOrder: handoff.loadOrder,
      registryCount: handoff.registryCount,
      entryCount: handoff.entryCount,
      packageCount: handoff.packageCount,
      candidateIdentity: handoff.candidateIdentity,
      candidateHash: handoff.candidateIdentity?.candidateHash,
      lockfileHash: handoff.lockfileHash,
      checks: [],
      diagnostics: [],
      effects: {
        runtimePublicationCommitAppStartupReadinessPipelineCalled: true,
        runtimePublicationCommitLiveRegistrySwapHostConnectionPipelineCalled: true,
        runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineCalled: true,
        runtimePublicationCommitAcknowledged: true,
        postCommitVerificationAcknowledged: true,
        liveRegistrySwapAcknowledged: true,
        appFactoryBindingAcknowledged: true,
        normalStartupHandoffAcknowledged: true,
        appStartupReadinessAllowed: true,
        appBootstrapContinuationAllowed: true,
        normalStartupContinuationAllowed: true,
        commandContinuationAllowed: true,
        uiIpcResultContinuationAllowed: true,
        thirdPartyRegistryPublished: true,
        liveRegistryMutated: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        realRuntimePublicationCommitCalled: true,
        runtimePublicationCommitted: true
      }
    },
    runtimePublicationCommitAppStartupHostConnection: {
      kind: 'third-party-runtime-publication-commit-app-startup-host-connection-pipeline',
      mode: 'default-disabled-runtime-publication-commit-app-startup-host-connection-pipeline',
      platform: 'electron',
      status: 'accepted',
      reason: 'Electron continuation accepted app startup host wiring after readiness',
      readOnly: true,
      runtimeOnly: true,
      persistentWrite: false,
      enabled: true,
      runtimePublicationCommitAppStartupReadinessSourceCalled: true,
      appStartupHostConnectionCalled: true,
      appStartupReadinessAllowed: true,
      appStartupHostWiringAllowed: true,
      appBootstrapContinuationAllowed: true,
      normalStartupContinuationAllowed: true,
      commandContinuationAllowed: true,
      uiIpcResultContinuationAllowed: true,
      requestedCommandId: 'install',
      targetPackageId,
      selectedPackageIds: handoff.selectedPackageIds,
      blockedPackageIds: handoff.blockedPackageIds,
      loadOrder: handoff.loadOrder,
      registryCount: handoff.registryCount,
      entryCount: handoff.entryCount,
      packageCount: handoff.packageCount,
      candidateIdentity: handoff.candidateIdentity,
      candidateHash: handoff.candidateIdentity?.candidateHash,
      lockfileHash: handoff.lockfileHash,
      checks: [],
      diagnostics: [],
      effects: {
        runtimePublicationCommitAppStartupHostConnectionPipelineCalled: true,
        runtimePublicationCommitAppStartupReadinessPipelineCalled: true,
        injectedAppStartupHostCalled: true,
        appStartupHostCalled: true,
        appStartupHostAccepted: true,
        runtimePublicationCommitAcknowledged: true,
        postCommitVerificationAcknowledged: true,
        liveRegistrySwapAcknowledged: true,
        appFactoryBindingAcknowledged: true,
        normalStartupHandoffAcknowledged: true,
        appStartupReadinessAcknowledged: true,
        appStartupHostWiringAllowed: true,
        appBootstrapContinuationAllowed: true,
        normalStartupContinuationAllowed: true,
        commandContinuationAllowed: true,
        uiIpcResultContinuationAllowed: true,
        thirdPartyRegistryPublished: true,
        liveRegistryMutated: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        realRuntimePublicationCommitCalled: true,
        runtimePublicationCommitted: true
      }
    },
    startupPersistentStateSnapshotWrite: {
      status: 'written',
      storageKind: 'electron-program-directory-userdata-startup-persistent-state',
      targetPackageId,
      snapshotWritten: true
    },
    diagnostics: []
  } as unknown as ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult
}

const mismatchElectronContinuationCandidateIdentity = <T extends {
  readonly candidateIdentity?: {
    readonly formatVersion: number
    readonly contentHash: Sha256Hash
    readonly snapshotHash: Sha256Hash
    readonly candidateHash: Sha256Hash
  }
  readonly candidateHash?: Sha256Hash
}>(summary: T): T => {
  const mismatchedIdentity = {
    ...summary.candidateIdentity!,
    candidateHash: testHash('9')
  }
  return {
    ...summary,
    candidateIdentity: mismatchedIdentity,
    candidateHash: mismatchedIdentity.candidateHash
  } as T
}

const electronContinuationMismatchCases: readonly {
  readonly name: string
  readonly mutate: (
    ready: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult
  ) => ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult
}[] = [
  {
    name: 'post-commit runtime publication summary',
    mutate: ready => ({
      ...ready,
      runtimePublicationCommitAfterPostCommitVerification:
        mismatchElectronContinuationCandidateIdentity(
          ready.runtimePublicationCommitAfterPostCommitVerification!
        )
    } as ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult)
  },
  {
    name: 'live registry swap summary',
    mutate: ready => ({
      ...ready,
      runtimePublicationCommitLiveRegistrySwapHostConnection:
        mismatchElectronContinuationCandidateIdentity(
          ready.runtimePublicationCommitLiveRegistrySwapHostConnection!
        )
    } as ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult)
  },
  {
    name: 'app startup readiness summary',
    mutate: ready => ({
      ...ready,
      runtimePublicationCommitAppStartupReadiness:
        mismatchElectronContinuationCandidateIdentity(
          ready.runtimePublicationCommitAppStartupReadiness!
        )
    } as ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult)
  },
  {
    name: 'app startup host summary',
    mutate: ready => ({
      ...ready,
      runtimePublicationCommitAppStartupHostConnection:
        mismatchElectronContinuationCandidateIdentity(
          ready.runtimePublicationCommitAppStartupHostConnection!
        )
    } as ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult)
  }
]

describe('useWebFilePickerImportEntry', () => {
  it('opens the injected selector and exposes a read-only Web ContentPackageSource', async() => {
    const selectFiles = vi.fn(async() => createValidFiles())
    const entry = useWebFilePickerImportEntry({ selectFiles })

    const result = await entry.pickFiles()

    expect(selectFiles).toHaveBeenCalledWith({ directory: true, multiple: true })
    expect(result.status).toBe('ready')
    expect(entry.status.value).toBe('ready')
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
    expect(entry.lastEffects.value).toEqual({
      sourceCreated: true,
      indexedDbImportPersisted: false,
      runtimeRegistryPublished: false,
      liveRegistryMutated: false,
      modLockWritten: false,
      settingsWritten: false,
      saveWritten: false,
      officialCacheWritten: false,
      packageFilesWritten: false,
      transactionLogWritten: false
    })

    expect(result.source?.identity).toMatchObject({
      kind: 'web-file-picker-import',
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import'
    })
    await expect(readContentPackageSourceJson(result.source!, 'valid-gift-pack/manifest.json'))
      .resolves.toMatchObject({ ok: true, data: { id: 'web_entry' } })

    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(result.source!)
    const discoveryReport = await discoverThirdPartyDataPacks(result.source!.identity.rootPath, fileSystem)
    expect(discoveryReport.status).toBe('completed')
    expect(discoveryReport.candidates[0]?.path).toBe('valid-gift-pack')
  })

  it('preflights a confirmed install command from a ready Web import without dispatching or writing', async() => {
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId))
    })

    const importResult = await entry.pickFiles()
    const preflightResult = entry.prepareInstallCommandPreflight({
      packageId: webEntryPackageId,
      confirmed: true,
      readModel: createReadModel(),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter()
    })

    expect(preflightResult).toMatchObject({
      status: 'deferred',
      sourceReady: true,
      fileCount: importResult.fileCount,
      sourceKind: 'web-file-picker-import',
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import'
    })
    expect(preflightResult.preflight).toMatchObject({
      status: 'deferred',
      requestedCommandId: 'install',
      targetPackageId: webEntryPackageId,
      commandDispatchAllowed: false,
      commitAllowed: false,
      writeAllowed: false,
      runtimeEnablementAllowed: false,
      uiMountAllowed: false,
      ipcAllowed: false
    })
    expect(preflightResult.preflight?.preflightChecks.every(check => check.status === 'satisfied')).toBe(true)
    expect(preflightResult.preflight?.stages.map(stage => ({ id: stage.id, status: stage.status }))).toEqual([
      { id: 'command-preflight-inspection', status: 'satisfied' },
      { id: 'explicit-user-confirmation', status: 'satisfied' },
      { id: 'transaction-command-dispatcher', status: 'deferred' },
      { id: 'runtime-commit-handoff', status: 'deferred' },
      { id: 'post-command-diagnostics', status: 'deferred' }
    ])
    expect(entry.lastInstallCommandPreflight.value).toBe(preflightResult)
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
    expect(preflightResult.effects).toBe(entry.lastEffects.value)
    expect(JSON.stringify(preflightResult)).not.toContain('C:/Users')
    expect(JSON.stringify(preflightResult)).not.toContain('LENOVO')
  })

  it('derives a confirmed install command preflight from the ready Web import source', async() => {
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId))
    })

    const importResult = await entry.pickFiles()
    const preflightResult = await entry.prepareInstallCommandPreflightFromSource({
      packageId: webEntryPackageId,
      confirmed: true,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })

    expect(preflightResult).toMatchObject({
      status: 'deferred',
      sourceReady: true,
      fileCount: importResult.fileCount,
      sourceKind: 'web-file-picker-import',
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import',
      discoveryStatus: 'completed',
      readModelStatus: 'ready',
      runtimePublicationCommitAdapterStatus: 'deferred'
    })
    expect(preflightResult.selectedPackageIds).toEqual([webEntryPackageId])
    expect(preflightResult.loadOrder).toEqual([webEntryPackageId])
    expect(preflightResult.preflight).toMatchObject({
      status: 'deferred',
      requestedCommandId: 'install',
      targetPackageId: webEntryPackageId,
      readModelStatus: 'ready',
      runtimePublicationCommitAdapterStatus: 'deferred',
      commandDispatchAllowed: false,
      commitAllowed: false,
      writeAllowed: false,
      runtimeEnablementAllowed: false,
      uiMountAllowed: false,
      ipcAllowed: false
    })
    expect(preflightResult.preflight?.preflightChecks.every(check => check.status === 'satisfied')).toBe(true)
    expect(entry.lastInstallCommandPreflight.value).toBe(preflightResult)
    expect(entry.lastSourceInstallCommandPreflight.value).toBe(preflightResult)
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
    expect(preflightResult.effects).toBe(entry.lastEffects.value)
    expect(JSON.stringify(preflightResult)).not.toContain('C:/Users')
    expect(JSON.stringify(preflightResult)).not.toContain('LENOVO')
  })

  it('auto-targets the first selected package when deriving install command preflight from source', async() => {
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId))
    })

    await entry.pickFiles()
    const preflightResult = await entry.prepareInstallCommandPreflightFromSource({
      confirmed: true,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })

    expect(preflightResult.status).toBe('deferred')
    expect(preflightResult.selectedPackageIds).toEqual([webEntryPackageId])
    expect(preflightResult.preflight?.targetPackageId).toBe(webEntryPackageId)
    expect(preflightResult.preflight?.preflightChecks.every(check => check.status === 'satisfied')).toBe(true)
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
  })

  it('dispatches a source-derived install command through the path-free dispatcher boundary', async() => {
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId))
    })

    await entry.pickFiles()
    const dispatchResult = await entry.dispatchInstallCommandFromSource({
      confirmed: true,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })


    expect(dispatchResult).toMatchObject({
      status: 'deferred',
      sourceReady: true,
      discoveryStatus: 'completed',
      readModelStatus: 'ready',
      runtimePublicationCommitAdapterStatus: 'deferred',
      installTransactionDispatchPlanStatus: 'deferred',
      postCommitVerificationPlanStatus: 'deferred',
      transactionCommandDispatcherHandoffStatus: 'deferred',
      transactionCommandDispatcherSourceStatus: 'dispatched',
      installCommandPostCommitAcknowledgementStatus: 'blocked',
      transactionCommandDispatcherHostKind: 'local-fallback',
      commandDispatched: true,
      transactionCommitted: false,
      writeExecuted: false,
      runtimeEnablementAllowed: false,
      uiIpcResponseDelivered: false
    })
    expect(dispatchResult.preflight?.targetPackageId).toBe(webEntryPackageId)
    expect(dispatchResult.installTransactionDispatchPlan?.targetPackageId).toBe(webEntryPackageId)
    expect(dispatchResult.postCommitVerificationPlan?.targetPackageId).toBe(webEntryPackageId)
    expect(dispatchResult.transactionCommandDispatcherHandoff?.targetPackageId).toBe(webEntryPackageId)
    expect(dispatchResult.transactionCommandDispatcherSource?.targetPackageId).toBe(webEntryPackageId)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.targetPackageId).toBe(webEntryPackageId)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.transactionCommandDispatcherSourceStatus)
      .toBe('dispatched')
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.atomicTransactionCommitExecutorSourceStatus)
      .toBeUndefined()
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.checks).toContainEqual(expect.objectContaining({
      id: 'atomic-commit-executed',
      status: 'blocked'
    }))
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.commandDispatched).toBe(true)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.transactionCommitted).toBe(false)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.packageFilesWritten).toBe(false)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.lockfileWritten).toBe(false)
    expect(dispatchResult.transactionCommandDispatcherHostKind).toBe('local-fallback')
    expect(dispatchResult.transactionCommandDispatcherSource?.effects.commandDispatched).toBe(true)
    expect(dispatchResult.transactionCommandDispatcherSource?.effects.transactionCommitted).toBe(false)
    expect(dispatchResult.transactionCommandDispatcherSource?.effects.packageFilesWritten).toBe(false)
    expect(dispatchResult.transactionCommandDispatcherSource?.effects.lockfileWritten).toBe(false)
    expect(dispatchResult.transactionCommandDispatcherSource?.effects.settingsWritten).toBe(false)
    expect(dispatchResult.transactionCommandDispatcherSource?.effects.savesWritten).toBe(false)
    expect(dispatchResult.transactionCommandDispatcherSource?.effects.cacheWritten).toBe(false)
    expect(entry.lastInstallCommandPreflight.value).toBe(dispatchResult)
    expect(entry.lastSourceInstallCommandDispatch.value).toBe(dispatchResult)
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
    expect(JSON.stringify(dispatchResult)).not.toContain('C:/Users')
    expect(JSON.stringify(dispatchResult)).not.toContain('LENOVO')
  })

  it('forwards a source-derived install command envelope to an injected dispatcher host', async() => {
    const dispatchTransactionCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId)),
      dispatchTransactionCommand
    })

    await entry.pickFiles()
    const dispatchResult = await entry.dispatchInstallCommandFromSource({
      confirmed: true,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })

    expect(dispatchTransactionCommand).toHaveBeenCalledOnce()
    expect(dispatchTransactionCommand.mock.calls[0]?.[0]).toMatchObject({
      requestedCommandId: 'install',
      targetPackageId: webEntryPackageId,
      selectedPackageIds: [webEntryPackageId],
      blockedPackageIds: [],
      loadOrder: [webEntryPackageId],
      registryCount: 54,
      entryCount: 4243,
      packageCount: 1,
      candidateIdentity: { formatVersion: 1 },
      lockfileHash: expect.stringMatching(/^sha256:[0-9a-f]{64}$/)
    })
    expect(dispatchResult.transactionCommandDispatcherSourceStatus).toBe('dispatched')
    expect(dispatchResult.installCommandPostCommitAcknowledgementStatus).toBe('blocked')
    expect(dispatchResult.transactionCommandDispatcherHostKind).toBe('injected')
    expect(dispatchResult.transactionCommandDispatcherSource?.effects.commandDispatched).toBe(true)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.atomicTransactionCommitExecutorSourceStatus)
      .toBeUndefined()
    expect(dispatchResult.transactionCommitted).toBe(false)
    expect(dispatchResult.writeExecuted).toBe(false)
    expect(dispatchResult.runtimeEnablementAllowed).toBe(false)
    expect(dispatchResult.uiIpcResponseDelivered).toBe(false)
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
    expect(JSON.stringify(dispatchTransactionCommand.mock.calls[0]?.[0])).not.toContain('C:/Users')
    expect(JSON.stringify(dispatchResult)).not.toContain('LENOVO')
  })

  it('threads an injected atomic commit host after dispatch without treating the install as settled', async() => {
    const dispatchTransactionCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const executeInjectedAtomicTransactionCommit = createInjectedAtomicTransactionCommitHost()
    const executeAtomicTransactionCommit = vi.fn(async(
      envelope: ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope
    ) => createAcceptedAtomicTransactionCommitHostResult(envelope))
    const readPostCommitUiIpcDeliveryContinuationSource =
      vi.fn() as WebFilePickerPostCommitUiIpcDeliveryContinuationReader
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId)),
      dispatchTransactionCommand,
      executeInjectedAtomicTransactionCommit,
      executeAtomicTransactionCommit,
      readPostCommitUiIpcDeliveryContinuationSource
    })

    await entry.pickFiles()
    const dispatchResult = await entry.dispatchInstallCommandFromSource({
      confirmed: true,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })

    expect(dispatchTransactionCommand).toHaveBeenCalledOnce()
    expect(executeInjectedAtomicTransactionCommit.execute).toHaveBeenCalledOnce()
    expect(executeAtomicTransactionCommit).toHaveBeenCalledOnce()
    expect(dispatchResult.transactionCommandDispatcherSourceStatus).toBe('dispatched')
    expect(dispatchResult.atomicTransactionCommitExecutorSourceStatus).toBe('executed')
    expect(dispatchResult.installCommandPostCommitAcknowledgementStatus).toBe('blocked')
    expect(readPostCommitUiIpcDeliveryContinuationSource).not.toHaveBeenCalled()
    expect(dispatchResult.postCommitUiIpcDeliveryContinuationStatus).toBeNull()
    expect(dispatchResult.atomicTransactionCommitExecutorSource?.atomicTransactionCommitExecutorHostStatus)
      .toBe('accepted')
    expect(dispatchResult.atomicTransactionCommitExecutorSource?.commitOutcomeKind).toBe('committed')
    expect(dispatchResult.atomicTransactionCommitExecutorSource?.targetPackageId).toBe(webEntryPackageId)
    expect(dispatchResult.atomicTransactionCommitExecutorSource?.effects.injectedAtomicCommitAdapterExecuted)
      .toBe(true)
    expect(dispatchResult.atomicTransactionCommitExecutorSource?.effects.atomicCommitExecutorHostAccepted)
      .toBe(true)
    expect(dispatchResult.atomicTransactionCommitExecutorSource?.effects.transactionCommitted).toBe(false)
    expect(dispatchResult.atomicTransactionCommitExecutorSource?.effects.packageFilesWritten).toBe(false)
    expect(dispatchResult.atomicTransactionCommitExecutorSource?.effects.lockfileWritten).toBe(false)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.atomicTransactionCommitExecutorSourceStatus)
      .toBe('executed')
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.postCommitVerificationReadAcknowledgementSourceStatus)
      .toBeUndefined()
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.atomicCommitExecutorAcknowledged)
      .toBe(true)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.postCommitVerificationAcknowledged)
      .toBe(false)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.checks).toContainEqual(expect.objectContaining({
      id: 'post-commit-acknowledgement-ready',
      status: 'blocked'
    }))
    expect(dispatchResult.transactionCommitted).toBe(false)
    expect(dispatchResult.writeExecuted).toBe(false)
    expect(dispatchResult.runtimeEnablementAllowed).toBe(false)
    expect(dispatchResult.uiIpcResponseDelivered).toBe(false)
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
    expect(JSON.stringify(dispatchResult)).not.toContain('C:/Users')
    expect(JSON.stringify(dispatchResult)).not.toContain('LENOVO')
  })

  it('threads injected post-commit readers after atomic commit without enabling real writes', async() => {
    const dispatchTransactionCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const executeInjectedAtomicTransactionCommit = createInjectedAtomicTransactionCommitHost()
    let atomicEnvelope: ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope | null = null
    const executeAtomicTransactionCommit = vi.fn(async(
      envelope: ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope
    ) => {
      atomicEnvelope = envelope
      return createAcceptedAtomicTransactionCommitHostResult(envelope)
    })
    const postCommitReaders = createReadyPostCommitReaders(() => atomicEnvelope)
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId)),
      dispatchTransactionCommand,
      executeInjectedAtomicTransactionCommit,
      executeAtomicTransactionCommit,
      ...postCommitReaders
    })

    await entry.pickFiles()
    const dispatchResult = await entry.dispatchInstallCommandFromSource({
      confirmed: true,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })

    expect(dispatchTransactionCommand).toHaveBeenCalledOnce()
    expect(executeInjectedAtomicTransactionCommit.execute).toHaveBeenCalledOnce()
    expect(executeAtomicTransactionCommit).toHaveBeenCalledOnce()
    expect(postCommitReaders.readSettingsLockfileCommitSource).toHaveBeenCalledOnce()
    expect(postCommitReaders.readPostCommitPersistentState).toHaveBeenCalledOnce()
    expect(postCommitReaders.readPostCommitVerificationExecutorAdapter).toHaveBeenCalledOnce()
    expect(postCommitReaders.executePostCommitVerification).toHaveBeenCalledOnce()
    expect(dispatchResult.transactionCommandDispatcherSourceStatus).toBe('dispatched')
    expect(dispatchResult.atomicTransactionCommitExecutorSourceStatus).toBe('executed')
    expect(dispatchResult.postCommitVerificationReadAcknowledgementSourceStatus).toBe('ready')
    expect(dispatchResult.postCommitVerificationExecutorHostMode).toBe('injected-test-only')
    expect(dispatchResult.installCommandPostCommitAcknowledgementStatus).toBe('ready')
    expect(dispatchResult.postCommitVerificationReadAcknowledgementSource?.targetPackageId)
      .toBe(webEntryPackageId)
    expect(dispatchResult.postCommitVerificationReadAcknowledgementSource?.effects.persistentReadProofAcknowledged)
      .toBe(true)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.postCommitVerificationReadAcknowledgementSourceStatus)
      .toBe('ready')
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.postCommitVerificationExecutorHostMode)
      .toBe('injected-test-only')
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.postCommitVerificationAcknowledged)
      .toBe(true)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.persistentReadProofAcknowledged)
      .toBe(true)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.commandContinuationAllowed)
      .toBe(true)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.transactionCommitted).toBe(false)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.packageFilesWritten).toBe(false)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.lockfileWritten).toBe(false)
    expect(dispatchResult.installCommandPostCommitAcknowledgement?.effects.settingsWritten).toBe(false)
    expect(dispatchResult.transactionCommitted).toBe(false)
    expect(dispatchResult.writeExecuted).toBe(false)
    expect(dispatchResult.runtimeEnablementAllowed).toBe(false)
    expect(dispatchResult.uiIpcResponseDelivered).toBe(false)
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
    expect(JSON.stringify(dispatchResult)).not.toContain('C:/Users')
    expect(JSON.stringify(dispatchResult)).not.toContain('LENOVO')
  })

  it('threads a ready post-commit UI/IPC continuation only after post-commit acknowledgement is ready', async() => {
    const dispatchTransactionCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const executeInjectedAtomicTransactionCommit = createInjectedAtomicTransactionCommitHost()
    let atomicEnvelope: ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope | null = null
    const executeAtomicTransactionCommit = vi.fn(async(
      envelope: ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope
    ) => {
      atomicEnvelope = envelope
      return createAcceptedAtomicTransactionCommitHostResult(envelope)
    })
    const postCommitReaders = createReadyPostCommitReaders(() => atomicEnvelope)
    const readPostCommitUiIpcDeliveryContinuationSource =
      createReadyPostCommitUiIpcDeliveryContinuation(() => atomicEnvelope)
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId)),
      dispatchTransactionCommand,
      executeInjectedAtomicTransactionCommit,
      executeAtomicTransactionCommit,
      ...postCommitReaders,
      readPostCommitUiIpcDeliveryContinuationSource
    })

    await entry.pickFiles()
    const dispatchResult = await entry.dispatchInstallCommandFromSource({
      confirmed: true,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })

    expect(dispatchResult.installCommandPostCommitAcknowledgementStatus).toBe('ready')
    expect(readPostCommitUiIpcDeliveryContinuationSource).toHaveBeenCalledOnce()
    expect(dispatchResult.postCommitUiIpcDeliveryContinuationStatus).toBe('ready')
    expect(dispatchResult.postCommitUiIpcDeliveryContinuation?.targetPackageId)
      .toBe(webEntryPackageId)
    expect(dispatchResult.postCommitUiIpcDeliveryContinuation?.candidateHash)
      .toBe(dispatchResult.installCommandPostCommitAcknowledgement?.candidateIdentity?.candidateHash)
    expect(dispatchResult.postCommitUiIpcDeliveryContinuation?.lockfileHash)
      .toBe(dispatchResult.installCommandPostCommitAcknowledgement?.lockfileHash)
    expect(dispatchResult.postCommitUiIpcDeliveryContinuation?.effects.successEnvelopeDelivered)
      .toBe(true)
    expect(dispatchResult.postCommitUiIpcDeliveryContinuation?.effects.uiIpcResponseDelivered)
      .toBe(true)
    expect(dispatchResult.writeExecuted).toBe(true)
    expect(dispatchResult.uiIpcResponseDelivered).toBe(true)
    expect(dispatchResult.transactionCommitted).toBe(false)
    expect(dispatchResult.runtimeEnablementAllowed).toBe(false)
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
    expect(JSON.stringify(dispatchResult)).not.toContain('C:/Users')
    expect(JSON.stringify(dispatchResult)).not.toContain('LENOVO')
  })

  it('uses the renderer host dispatcher when no explicit dispatcher host is injected', async() => {
    const dispatchThirdPartyDataPackInstallCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const continueThirdPartyDataPackOrdinaryInstallTerminal = vi.fn(async(
      envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
    ) => createReadyElectronOrdinaryInstallTerminalContinuationResult(envelope))
    const restoreElectronApi = withWindowElectronApi({
      dispatchThirdPartyDataPackInstallCommand,
      continueThirdPartyDataPackOrdinaryInstallTerminal
    })
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId))
    })

    try {
      await entry.pickFiles()
      expect(getOfficialItemDef(`${webEntryPackageId}:linen_ribbon`)).toBeUndefined()
      const dispatchResult = await entry.dispatchInstallCommandFromSource({
        confirmed: true,
        officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
        mountedAppStartupHostEvidence
      })

      expect(dispatchThirdPartyDataPackInstallCommand).toHaveBeenCalledOnce()
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal).toHaveBeenCalledOnce()
      expect(dispatchThirdPartyDataPackInstallCommand.mock.calls[0]?.[0]).toMatchObject({
        requestedCommandId: 'install',
        targetPackageId: webEntryPackageId,
        selectedPackageIds: [webEntryPackageId],
        loadOrder: [webEntryPackageId],
        registryCount: 54,
        entryCount: 4243,
        packageCount: 1
      })
      const continuationEnvelope = continueThirdPartyDataPackOrdinaryInstallTerminal.mock.calls[0]?.[0]
      expect(continuationEnvelope?.transactionCommandDispatcherHandoff).toMatchObject({
        requestedCommandId: 'install',
        targetPackageId: webEntryPackageId,
        selectedPackageIds: [webEntryPackageId],
        loadOrder: [webEntryPackageId]
      })
      expect(continuationEnvelope?.installTransactionDispatchPlan.status).toBe('deferred')
      expect(continuationEnvelope?.runtimePublicationCommitAdapter.status).toBe('deferred')
      expect(continuationEnvelope?.lockfileDraft.packages[0]?.packageId).toBe(webEntryPackageId)
      expect(continuationEnvelope?.packageFilePayload.map(file => file.path))
        .toEqual(['manifest.json', 'data/items.json'])
      expect(continuationEnvelope?.packageFilePayload.every(file =>
        typeof file.sha256 === 'string' && /^sha256:[0-9a-f]{64}$/.test(file.sha256)
      )).toBe(true)
      expect(continuationEnvelope?.packageFilePayload[0]?.contents).toContain(webEntryPackageId)
      expect(continuationEnvelope?.packageFilePayload[1]?.contents)
        .toContain(`${webEntryPackageId}:linen_ribbon`)
      expect(dispatchResult.transactionCommandDispatcherSourceStatus).toBe('dispatched')
      expect(dispatchResult.installCommandPostCommitAcknowledgementStatus).toBe('ready')
      expect(dispatchResult.installTransactionLogPreparedStatus).toBe('prepared')
      expect(dispatchResult.installTransactionLogPreparedPersistentReadVerificationStatus).toBe('verified')
      expect(dispatchResult.installTransactionCommitFinalizationStatus).toBe('committed')
      expect(dispatchResult.postCommitUiIpcDeliveryContinuationStatus).toBe('ready')
      expect(dispatchResult.ordinaryInstallTransactionTerminalConnectionStatus).toBe('ready')
      expect(dispatchResult.runtimePublicationCommitAfterPostCommitVerificationStatus).toBe('accepted')
      expect(dispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus).toBe('swapped')
      expect(dispatchResult.runtimePublicationCommitAppStartupReadinessStatus).toBe('ready')
      expect(dispatchResult.runtimePublicationCommitAppStartupHostConnectionStatus).toBe('accepted')
      expect(dispatchResult.transactionCommandDispatcherHostKind).toBe('renderer')
      expect(dispatchResult.transactionCommandDispatcherSource?.effects.commandDispatched).toBe(true)
      expect(dispatchResult.postCommitUiIpcDeliveryContinuation?.selectedPlatform).toBe('electron')
      expect(dispatchResult.ordinaryInstallTransactionTerminalConnection?.ordinaryInstallTransactionReady)
        .toBe(true)
      expect(dispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnection?.effects.liveRegistrySwapped)
        .toBe(true)
      expect(dispatchResult.runtimePublicationCommitAppStartupHostConnection?.effects.appStartupHostAccepted)
        .toBe(true)
      expect(dispatchResult.runtimePublicationCommitAppStartupHostConnection?.effects.realNormalStartupHostCalled)
        .toBe(true)
      expect(dispatchResult.runtimePublicationCommitAppStartupHostConnection?.effects.realAppStartupHostCalled)
        .toBe(true)
      expect(dispatchResult.runtimePublicationCommitAppStartupHostConnection?.effects.gameAppCreated)
        .toBe(true)
      expect(dispatchResult.runtimePublicationCommitAppStartupHostConnection?.effects.piniaCreated)
        .toBe(true)
      expect(dispatchResult.runtimePublicationCommitAppStartupHostConnection?.effects.routerMounted)
        .toBe(true)
      expect(dispatchResult.transactionCommitted).toBe(true)
      expect(dispatchResult.writeExecuted).toBe(true)
      expect(dispatchResult.electronStartupPersistentStateWriteStatus).toBe('written')
      expect(dispatchResult.startupPersistentStateWritten).toBe(true)
      expect(dispatchResult.rendererLiveRegistrySwapApplied).toBe(true)
      expect(dispatchResult.runtimeEnablementAllowed).toBe(true)
      expect(dispatchResult.uiIpcResponseDelivered).toBe(true)
      expect(getOfficialItemDef(`${webEntryPackageId}:linen_ribbon`)?.name.fallback)
        .toBe(`${webEntryPackageId}:linen_ribbon`)
      expect(entry.runtimeBoundaryClosed.value).toBe(true)
      expect(JSON.stringify(dispatchThirdPartyDataPackInstallCommand.mock.calls[0]?.[0])).not.toContain('C:/Users')
      expect(JSON.stringify(continuationEnvelope)).not.toContain('C:/Users')
      expect(JSON.stringify(continuationEnvelope)).not.toContain('LENOVO')
      expect(JSON.stringify(dispatchResult)).not.toContain('LENOVO')
    } finally {
      restoreElectronApi()
    }
  })

  it('restores Electron installed package files and dispatches re-enable through the renderer host', async() => {
    const dispatchThirdPartyDataPackInstallCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const continueThirdPartyDataPackOrdinaryInstallTerminal = vi.fn(async(
      envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
    ) => createReadyElectronOrdinaryInstallTerminalContinuationResult(envelope))
    const electronReadonlyDirectorySource = await createElectronReadonlyDirectoryHost(
      createValidFiles(webEntryPackageId)
    )
    const restoreElectronApi = withWindowElectronApi({
      electronReadonlyDirectorySource,
      dispatchThirdPartyDataPackInstallCommand,
      continueThirdPartyDataPackOrdinaryInstallTerminal
    })
    const entry = useWebFilePickerImportEntry()

    try {
      const restoreResult = await entry.restoreElectronInstalledSource()
      const dispatchResult = await entry.dispatchInstallCommandFromSource({
        packageId: webEntryPackageId,
        confirmed: true,
        officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
        mountedAppStartupHostEvidence
      })

      expect(restoreResult.status).toBe('restored')
      expect(restoreResult.record).toBeNull()
      expect(restoreResult.fileCount).toBe(1)
      expect(entry.lastRecord.value).toBeNull()
      expect(entry.lastSource.value?.identity.kind).toBe('electron-readonly-directory')
      expect(entry.lastEffects.value.indexedDbImportPersisted).toBe(false)
      expect(electronReadonlyDirectorySource.readDirectory).toHaveBeenCalledWith('')
      expect(dispatchThirdPartyDataPackInstallCommand).toHaveBeenCalledOnce()
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal).toHaveBeenCalledOnce()
      expect(dispatchThirdPartyDataPackInstallCommand.mock.calls[0]?.[0]).toMatchObject({
        requestedCommandId: 'install',
        targetPackageId: webEntryPackageId,
        selectedPackageIds: [webEntryPackageId],
        blockedPackageIds: [],
        loadOrder: [webEntryPackageId]
      })
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal.mock.calls[0]?.[0]
        .packageFilePayload.map(file => file.path)).toEqual(['manifest.json', 'data/items.json'])
      expect(dispatchResult.transactionCommandDispatcherHostKind).toBe('renderer')
      expect(dispatchResult.installCommandPostCommitAcknowledgementStatus).toBe('ready')
      expect(dispatchResult.ordinaryInstallTransactionTerminalConnectionStatus).toBe('ready')
      expect(dispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus).toBe('swapped')
      expect(dispatchResult.runtimePublicationCommitAppStartupHostConnectionStatus).toBe('accepted')
      expect(dispatchResult.electronStartupPersistentStateWriteStatus).toBe('written')
      expect(dispatchResult.rendererLiveRegistrySwapApplied).toBe(true)
      expect(dispatchResult.runtimeEnablementAllowed).toBe(true)
      expect(getOfficialItemDef(`${webEntryPackageId}:linen_ribbon`)?.name.fallback)
        .toBe(`${webEntryPackageId}:linen_ribbon`)
      expect(JSON.stringify(dispatchResult)).not.toContain('C:/Users')
      expect(JSON.stringify(dispatchResult)).not.toContain('LENOVO')
    } finally {
      restoreElectronApi()
    }
  })

  it.each(electronContinuationMismatchCases)(
    'does not publish renderer live content when Electron continuation $name mismatches the renderer candidate',
    async({ mutate }) => {
      const dispatchThirdPartyDataPackInstallCommand = vi.fn(async(
        envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
      ) => createDispatchedHostResult(envelope))
      const continueThirdPartyDataPackOrdinaryInstallTerminal = vi.fn(async(
        envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
      ) => {
        const ready = createReadyElectronOrdinaryInstallTerminalContinuationResult(envelope)
        return mutate(ready)
      })
      const restoreElectronApi = withWindowElectronApi({
        dispatchThirdPartyDataPackInstallCommand,
        continueThirdPartyDataPackOrdinaryInstallTerminal
      })
      const entry = useWebFilePickerImportEntry({
        selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId))
      })

      try {
        await entry.pickFiles()
        const dispatchResult = await entry.dispatchInstallCommandFromSource({
          confirmed: true,
          officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
          mountedAppStartupHostEvidence
        })

        expect(dispatchResult.runtimePublicationCommitAfterPostCommitVerificationStatus).toBe('accepted')
        expect(dispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus).toBe('swapped')
        expect(dispatchResult.runtimePublicationCommitAppStartupReadinessStatus).toBe('ready')
        expect(dispatchResult.rendererLiveRegistrySwapApplied).toBe(false)
        expect(dispatchResult.runtimeEnablementAllowed).toBe(false)
        expect(dispatchResult.electronStartupPersistentStateWriteStatus).toBe('blocked')
        expect(dispatchResult.startupPersistentStateWritten).toBe(false)
        expect(getOfficialItemDef(`${webEntryPackageId}:linen_ribbon`)).toBeUndefined()
        expect(JSON.stringify(dispatchResult)).not.toContain('C:/Users')
        expect(JSON.stringify(dispatchResult)).not.toContain('LENOVO')
      } finally {
        restoreElectronApi()
      }
    }
  )

  it('does not publish renderer live content when Electron continuation reports rollback terminal outcome', async() => {
    const dispatchThirdPartyDataPackInstallCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const continueThirdPartyDataPackOrdinaryInstallTerminal = vi.fn(async(
      envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
    ) => {
      const ready = createReadyElectronOrdinaryInstallTerminalContinuationResult(envelope)
      const terminal = ready.ordinaryInstallTransactionTerminalConnection!
      return {
        ...ready,
        reason: 'Electron continuation reported rollback terminal outcome',
        ordinaryInstallTransactionTerminalConnection: {
          ...terminal,
          reason: 'Electron continuation settled by rollback recovery',
          outcomeKind: 'rollback',
          messageKey: 'mods.atomic.commit.install.rollback',
          recovery: 'restore-backup',
          retryable: false,
          rollbackRequired: true,
          rollbackRecoverySettled: true,
          rollbackRecoveryExecutionAcknowledged: true,
          effects: {
            ...terminal.effects,
            successOutcomeAccepted: false,
            rollbackOutcomeAccepted: true,
            rollbackRecoverySettled: true,
            rollbackRecoveryExecutionAcknowledged: true,
            packageFilesRestored: true,
            rollbackExecuted: true,
            runtimeEnablementAllowed: false
          }
        }
      } as ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationResult
    })
    const restoreElectronApi = withWindowElectronApi({
      dispatchThirdPartyDataPackInstallCommand,
      continueThirdPartyDataPackOrdinaryInstallTerminal
    })
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId))
    })

    try {
      await entry.pickFiles()
      const dispatchResult = await entry.dispatchInstallCommandFromSource({
        confirmed: true,
        officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
        mountedAppStartupHostEvidence
      })

      expect(dispatchResult.ordinaryInstallTransactionTerminalConnectionStatus).toBe('ready')
      expect(dispatchResult.ordinaryInstallTransactionTerminalConnection?.outcomeKind).toBe('rollback')
      expect(dispatchResult.ordinaryInstallTransactionTerminalConnection?.effects.rollbackOutcomeAccepted)
        .toBe(true)
      expect(dispatchResult.runtimePublicationCommitAfterPostCommitVerificationStatus).toBe('accepted')
      expect(dispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus).toBe('swapped')
      expect(dispatchResult.runtimePublicationCommitAppStartupReadinessStatus).toBe('ready')
      expect(dispatchResult.rendererLiveRegistrySwapApplied).toBe(false)
      expect(dispatchResult.runtimeEnablementAllowed).toBe(false)
      expect(dispatchResult.electronStartupPersistentStateWriteStatus).toBe('blocked')
      expect(dispatchResult.startupPersistentStateWritten).toBe(false)
      expect(getOfficialItemDef(`${webEntryPackageId}:linen_ribbon`)).toBeUndefined()
      expect(JSON.stringify(dispatchResult)).not.toContain('C:/Users')
      expect(JSON.stringify(dispatchResult)).not.toContain('LENOVO')
    } finally {
      restoreElectronApi()
    }
  })

  it('skips install command preflight until a Web import source is ready', () => {
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId))
    })

    const preflightResult = entry.prepareInstallCommandPreflight({
      packageId: webEntryPackageId,
      confirmed: true,
      readModel: createReadModel(),
      runtimePublicationCommitAdapter: createRuntimePublicationCommitAdapter()
    })

    expect(preflightResult).toEqual({
      status: 'skipped',
      reason: 'web file-picker import source is not ready for install command preflight',
      sourceReady: false,
      fileCount: 0,
      sourceKind: null,
      sourceId: null,
      rootPath: null,
      preflight: null,
      effects: entry.lastEffects.value
    })
    expect(entry.lastInstallCommandPreflight.value).toBe(preflightResult)
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
  })

  it('skips source-derived install command preflight until a Web import source is ready', async() => {
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles(webEntryPackageId))
    })

    const preflightResult = await entry.prepareInstallCommandPreflightFromSource({
      packageId: webEntryPackageId,
      confirmed: true,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })

    expect(preflightResult).toEqual({
      status: 'skipped',
      reason: 'web file-picker import source is not ready for source-derived install command preflight',
      sourceReady: false,
      fileCount: 0,
      sourceKind: null,
      sourceId: null,
      rootPath: null,
      preflight: null,
      effects: entry.lastEffects.value,
      discoveryStatus: 'not-run',
      readModelStatus: null,
      runtimePublicationCommitAdapterStatus: null,
      selectedPackageIds: [],
      loadOrder: []
    })
    expect(entry.lastSourceInstallCommandPreflight.value).toBe(preflightResult)
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
  })

  it('persists the selected source only when an import store is explicitly provided', async() => {
    const store = createInMemoryWebIndexedDbImportPersistenceStore()
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles('web_entry_persisted')),
      persistenceStore: store
    })

    const result = await entry.pickFiles()

    expect(result.status).toBe('persisted')
    expect(result.record).toMatchObject({
      importId: WEB_FILE_PICKER_IMPORT_ENTRY_DEFAULT_IMPORT_ID,
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import'
    })
    expect(entry.lastEffects.value.indexedDbImportPersisted).toBe(true)
    expect(await store.list()).toEqual([{
      importId: WEB_FILE_PICKER_IMPORT_ENTRY_DEFAULT_IMPORT_ID,
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import',
      fileCount: 3,
      totalBytes: result.record!.files.reduce((total, file) => total + file.sizeBytes, 0)
    }])
  })

  it('restores a persisted Web import source and dispatches source-derived install command without reopening the picker', async() => {
    const store = createInMemoryWebIndexedDbImportPersistenceStore()
    const webSettingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const webInstallTransactionLogStore = createInMemoryWebInstallTransactionLogPreparedStore()
    const selectFiles = vi.fn(async() => createValidFiles(webEntryPackageId))
    const entry = useWebFilePickerImportEntry({
      selectFiles,
      persistenceStore: store,
      webSettingsLockfileStore,
      webInstallTransactionLogStore
    })

    await entry.pickFiles()
    await entry.reset()
    const restoreResult = await entry.restorePersistedImport()
    const dispatchResult = await entry.dispatchInstallCommandFromSource({
      confirmed: true,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
      mountedAppStartupHostEvidence
    })

    expect(selectFiles).toHaveBeenCalledTimes(1)
    expect(restoreResult.status).toBe('restored')
    expect(restoreResult.record).toMatchObject({
      importId: WEB_FILE_PICKER_IMPORT_ENTRY_DEFAULT_IMPORT_ID,
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import'
    })
    expect(restoreResult.fileCount).toBe(3)
    expect(entry.status.value).toBe('restored')
    expect(entry.lastEffects.value).toEqual({
      sourceCreated: true,
      indexedDbImportPersisted: false,
      runtimeRegistryPublished: false,
      liveRegistryMutated: false,
      modLockWritten: false,
      settingsWritten: false,
      saveWritten: false,
      officialCacheWritten: false,
      packageFilesWritten: false,
      transactionLogWritten: false
    })
    const readSettingsLockfile = await webSettingsLockfileStore.read()
    const readTransactionLog = await webInstallTransactionLogStore.read()


    expect(dispatchResult).toMatchObject({
      status: 'deferred',
      sourceReady: true,
      discoveryStatus: 'completed',
      readModelStatus: 'ready',
      runtimePublicationCommitAdapterStatus: 'deferred',
      transactionCommandDispatcherSourceStatus: 'dispatched',
      installCommandPostCommitAcknowledgementStatus: 'ready',
      installTransactionLogPreparedStatus: 'prepared',
      installTransactionLogPreparedStorageKind:
        THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND,
      installTransactionLogPreparedPersistentReadVerificationStatus: 'verified',
      installTransactionCommitFinalizationStatus: 'committed',
      postCommitUiIpcDeliveryContinuationStatus: 'ready',
      ordinaryInstallTransactionTerminalConnectionStatus: 'ready',
      runtimePublicationCommitAfterPostCommitVerificationStatus: 'accepted',
      runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: 'swapped',
      runtimePublicationCommitAppStartupReadinessStatus: 'ready',
      runtimePublicationCommitAppStartupHostConnectionStatus: 'accepted',
      webPlatformWriterHostConnectionStatus: 'connected',
      webStartupPersistentStateWriteStatus: 'written',
      transactionCommandDispatcherHostKind: 'web',
      commandDispatched: true,
      transactionCommitted: true,
      writeExecuted: true,
      startupPersistentStateWritten: true,
      rendererLiveRegistrySwapApplied: true,
      runtimeEnablementAllowed: true,
      uiIpcResponseDelivered: true
    })
    expect(dispatchResult.selectedPackageIds).toEqual([webEntryPackageId])
    expect(dispatchResult.postCommitUiIpcDeliveryContinuation?.selectedPlatform).toBe('web')
    expect(dispatchResult.postCommitUiIpcDeliveryContinuation?.persistentPackageWriteExecuted).toBe(true)
    expect(dispatchResult.postCommitUiIpcDeliveryContinuation?.persistentSettingsLockfileWriteExecuted).toBe(true)
    expect(dispatchResult.webPlatformWriterHostConnection?.effects.settingsWritten).toBe(true)
    expect(dispatchResult.webPlatformWriterHostConnection?.effects.lockfileWritten).toBe(true)
    expect(dispatchResult.installTransactionLogPrepared?.storageKind)
      .toBe(THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND)
    expect(readTransactionLog.report.status).toBe('loaded')
    expect(readTransactionLog.report.storageKind)
      .toBe(THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND)
    expect(readTransactionLog.record?.entryHash)
      .toBe(dispatchResult.installTransactionLogPrepared?.transactionLogEntryHash)
    expect(dispatchResult.installTransactionLogPreparedPersistentReadVerification?.readTransactionLogEntryHash)
      .toBe(readTransactionLog.record?.entryHash)
    expect(readSettingsLockfile.record).toMatchObject({
      recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
      targetPackageId: webEntryPackageId,
      selectedPackageIds: [webEntryPackageId],
      loadOrder: [webEntryPackageId]
    })
    expect(readSettingsLockfile.record?.lockfileDraft.packages[0]?.packageId).toBe(webEntryPackageId)
    const startupSnapshot = await readThirdPartyDataPackWebStartupPersistentStateSnapshot({
      store,
      settingsLockfileStore: webSettingsLockfileStore,
      request: {
        formatVersion: 1,
        commandId: 'install',
        packageId: webEntryPackageId,
        candidateIdentity: dispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnection!.candidateIdentity!,
        lockfileHash: dispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnection!.lockfileHash!,
        selectedPackageIds: dispatchResult.selectedPackageIds,
        blockedPackageIds: dispatchResult.preflight!.blockedPackageIds,
        blockedCandidateCount: 0,
        loadOrder: dispatchResult.loadOrder,
        registryCount: dispatchResult.preflight!.registryCount,
        entryCount: dispatchResult.preflight!.entryCount,
        packageCount: dispatchResult.preflight!.packageCount,
        requiredSourceIds: [
          'committed-transaction-log-source',
          'package-state-source',
          'settings-state-source',
          'mod-lock-state-source',
          'live-registry-identity-source',
          'save-cache-isolation-source',
          'startup-failure-reporting-source',
          'no-startup-read-write-side-effect-guard'
        ],
        deferredStageIds: [
          'transaction-log-state-read',
          'package-state-read',
          'settings-state-read',
          'mod-lock-state-read',
          'live-registry-identity-read',
          'save-cache-isolation-read',
          'startup-failure-reporting',
          'launcher-gameapp-gate'
        ]
      }
    })
    expect(startupSnapshot.report.status).toBe('loaded')
    expect(startupSnapshot.report.settingsLockfileRecordPresent).toBe(true)
    expect(startupSnapshot.report.settingsLockfileRecordRead).toBe(true)
    expect(startupSnapshot.report.modLockDraftRead).toBe(true)
    expect(startupSnapshot.report.effects.settingsStateRead).toBe(true)
    expect(startupSnapshot.report.effects.modLockStateRead).toBe(true)
    expect(startupSnapshot.snapshot).toMatchObject({
      kind: 'startup-persistent-state-snapshot',
      packageId: webEntryPackageId,
      transactionLogCommitted: true,
      packageStateMatched: true,
      settingsStateMatched: true,
      modLockStateMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true
    })
    expect(dispatchResult.ordinaryInstallTransactionTerminalConnection?.ordinaryInstallTransactionReady)
      .toBe(true)
    expect(dispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnection?.effects.liveRegistrySwapped)
      .toBe(true)
    expect(dispatchResult.runtimePublicationCommitAppStartupHostConnection?.effects.appStartupHostAccepted)
      .toBe(true)
    expect(dispatchResult.runtimePublicationCommitAppStartupHostConnection?.effects.realNormalStartupHostCalled)
      .toBe(true)
    expect(dispatchResult.runtimePublicationCommitAppStartupHostConnection?.effects.realAppStartupHostCalled)
      .toBe(true)
    expect(dispatchResult.runtimePublicationCommitAppStartupHostConnection?.effects.gameAppCreated)
      .toBe(true)
    expect(dispatchResult.runtimePublicationCommitAppStartupHostConnection?.effects.piniaCreated)
      .toBe(true)
    expect(dispatchResult.runtimePublicationCommitAppStartupHostConnection?.effects.routerMounted)
      .toBe(true)
    expect(getOfficialItemDef(`${webEntryPackageId}:linen_ribbon`)?.name.fallback)
      .toBe(`${webEntryPackageId}:linen_ribbon`)
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
    expect(JSON.stringify(dispatchResult)).not.toContain('C:/Users')
    expect(JSON.stringify(dispatchResult)).not.toContain('LENOVO')
  })

  it('replaces a same-package Web install through ordinary persisted install state', async() => {
    const packageId = requirePackageId('web_entry_replace')
    const store = createInMemoryWebIndexedDbImportPersistenceStore()
    const webSettingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const webInstallTransactionLogStore = createInMemoryWebInstallTransactionLogPreparedStore()
    const selectFiles = vi.fn()
      .mockResolvedValueOnce(createValidFiles(packageId, {
        version: '1.0.0',
        itemNameFallback: 'web entry replace v1'
      }))
      .mockResolvedValueOnce(createValidFiles(packageId, {
        version: '1.1.0',
        itemNameFallback: 'web entry replace v2'
      }))
    const entry = useWebFilePickerImportEntry({
      selectFiles,
      persistenceStore: store,
      webSettingsLockfileStore,
      webInstallTransactionLogStore
    })

    await entry.pickFiles()
    const firstDispatchResult = await entry.dispatchInstallCommandFromSource({
      confirmed: true,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
      mountedAppStartupHostEvidence
    })
    const firstSettingsLockfile = await webSettingsLockfileStore.read()

    expect(firstSettingsLockfile.record).toMatchObject({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      loadOrder: [packageId]
    })
    expect(firstSettingsLockfile.record?.lockfileDraft.packages[0]?.version).toBe('1.0.0')
    expect(getOfficialItemDef(`${packageId}:linen_ribbon`)?.name.fallback)
      .toBe('web entry replace v1')

    await entry.pickFiles()
    const replacementDispatchResult = await entry.dispatchInstallCommandFromSource({
      confirmed: true,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
      mountedAppStartupHostEvidence
    })
    const replacementSettingsLockfile = await webSettingsLockfileStore.read()
    const replacementStartupSnapshot = await readThirdPartyDataPackWebStartupPersistentStateSnapshot({
      store,
      settingsLockfileStore: webSettingsLockfileStore,
      request: {
        formatVersion: 1,
        commandId: 'install',
        packageId,
        candidateIdentity:
          replacementDispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnection!.candidateIdentity!,
        lockfileHash:
          replacementDispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnection!.lockfileHash!,
        selectedPackageIds: replacementDispatchResult.selectedPackageIds,
        blockedPackageIds: replacementDispatchResult.preflight!.blockedPackageIds,
        blockedCandidateCount: 0,
        loadOrder: replacementDispatchResult.loadOrder,
        registryCount: replacementDispatchResult.preflight!.registryCount,
        entryCount: replacementDispatchResult.preflight!.entryCount,
        packageCount: replacementDispatchResult.preflight!.packageCount,
        requiredSourceIds: [
          'committed-transaction-log-source',
          'package-state-source',
          'settings-state-source',
          'mod-lock-state-source',
          'live-registry-identity-source',
          'save-cache-isolation-source',
          'startup-failure-reporting-source',
          'no-startup-read-write-side-effect-guard'
        ],
        deferredStageIds: [
          'transaction-log-state-read',
          'package-state-read',
          'settings-state-read',
          'mod-lock-state-read',
          'live-registry-identity-read',
          'save-cache-isolation-read',
          'startup-failure-reporting',
          'launcher-gameapp-gate'
        ]
      }
    })

    expect(selectFiles).toHaveBeenCalledTimes(2)
    expect(firstDispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnection?.candidateHash)
      .not.toBe(replacementDispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnection?.candidateHash)
    expect(replacementSettingsLockfile.record).toMatchObject({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId]
    })
    expect(replacementSettingsLockfile.record?.lockfileDraft.packages).toHaveLength(1)
    expect(replacementSettingsLockfile.record?.lockfileDraft.packages[0]).toMatchObject({
      packageId,
      version: '1.1.0'
    })
    expect(getOfficialItemDef(`${packageId}:linen_ribbon`)?.name.fallback)
      .toBe('web entry replace v2')
    expect(replacementDispatchResult).toMatchObject({
      transactionCommandDispatcherHostKind: 'web',
      transactionCommandDispatcherSourceStatus: 'dispatched',
      ordinaryInstallTransactionTerminalConnectionStatus: 'ready',
      runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: 'swapped',
      runtimePublicationCommitAppStartupHostConnectionStatus: 'accepted',
      webStartupPersistentStateWriteStatus: 'written',
      commandDispatched: true,
      transactionCommitted: true,
      startupPersistentStateWritten: true,
      rendererLiveRegistrySwapApplied: true,
      runtimeEnablementAllowed: true
    })
    expect(replacementStartupSnapshot.report.status).toBe('loaded')
    expect(replacementStartupSnapshot.snapshot).toMatchObject({
      kind: 'startup-persistent-state-snapshot',
      packageId,
      transactionLogCommitted: true,
      packageStateMatched: true,
      settingsStateMatched: true,
      modLockStateMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true
    })
    expect(JSON.stringify(replacementDispatchResult)).not.toContain('C:/Users')
    expect(JSON.stringify(replacementStartupSnapshot)).not.toContain('C:/Users')
    expect(JSON.stringify(replacementSettingsLockfile)).not.toContain('LENOVO')
  })

  it('treats an empty selection as cancelled without creating a source', async() => {
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => [])
    })

    const result = await entry.pickFiles()

    expect(result).toMatchObject({
      status: 'cancelled',
      source: null,
      record: null,
      fileCount: 0,
      error: null
    })
    expect(entry.lastSource.value).toBeNull()
    expect(entry.lastEffects.value.sourceCreated).toBe(false)
  })

  it('contains selector failures before they leak host paths to UI state', async() => {
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => {
        throw new Error('NotAllowedError: C:/Users/LENOVO/Downloads/private-pack/manifest.json')
      })
    })

    const result = await entry.pickFiles()

    expect(result.status).toBe('failed')
    expect(result.error).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Web file-picker import selection failed'
    })
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
  })

  it('configures the browser file input for directory-style multi-file selection', async() => {
    const file = createFile('valid-gift-pack/manifest.json', toJson(createManifest()))
    const createdInputs: HTMLInputElement[] = []
    const fakeDocument = {
      createElement: (tagName: string) => {
        const input = document.createElement(tagName) as HTMLInputElement
        vi.spyOn(input, 'click').mockImplementation(() => {})
        createdInputs.push(input)
        return input
      },
      body: document.body
    } as unknown as Document
    const selector = createBrowserWebFilePickerSelector({ document: fakeDocument })

    const selection = selector({ directory: true, multiple: true })
    const input = createdInputs[0]!
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file]
    })
    input.dispatchEvent(new Event('change'))

    await expect(selection).resolves.toEqual([file])
    expect(input.type).toBe('file')
    expect(input.multiple).toBe(true)
    expect((input as HTMLInputElement & { webkitdirectory?: boolean }).webkitdirectory).toBe(true)
    expect(input.style.display).toBe('none')
  })
})
