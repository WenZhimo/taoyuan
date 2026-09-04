import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import WebDataPackImportPreflightPanel from '@/components/game/mods/WebDataPackImportPreflightPanel.vue'
import {
  publishOfficialContentRegistrySet,
  resetLiveContentRegistryForTests
} from '@/domain/mods/liveContentRegistry'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { getOfficialItemDef } from '@/domain/mods/contentAccess'
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
  ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
} from '@/domain/mods/thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationBridge'
import { createInMemoryWebIndexedDbImportPersistenceStore } from '@/domain/mods/webIndexedDbImportPersistence'
import {
  createInMemoryWebSettingsLockfilePersistentWriterStore,
  THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID
} from '@/domain/mods/thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
import {
  createInMemoryWebInstallTransactionLogPreparedStore
} from '@/domain/mods/thirdPartyDataPackWebInstallTransactionLogPreparedStorageHost'
import {
  publishThirdPartyDataPackMountedAppStartupHostEvidence,
  resetThirdPartyDataPackMountedAppStartupHostEvidenceForTests
} from '@/domain/mods/thirdPartyDataPackMountedAppStartupHostConnection'
import type { WebFilePickerImportFile } from '@/domain/mods/webFilePickerImportSource'
import type {
  WebFilePickerPostCommitPersistentStateReader,
  WebFilePickerPostCommitSettingsLockfileCommitSourceReader,
  WebFilePickerPostCommitUiIpcDeliveryContinuationReader,
  WebFilePickerPostCommitVerificationExecutor,
  WebFilePickerPostCommitVerificationExecutorAdapterReader
} from '@/composables/useWebFilePickerImportEntry'

type JsonObject = Record<string, unknown>

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = (packageId = 'web_panel_entry'): JsonObject => ({
  id: packageId,
  name: { key: `${packageId}.package.name`, fallback: packageId },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Web Panel Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = (id = 'web_panel_entry:linen_ribbon'): JsonObject => ({
  id,
  name: { key: `${id}.name`, fallback: id },
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

const createValidFiles = (packageId = 'web_panel_entry'): readonly WebFilePickerImportFile[] => [
  createFile('valid-panel-pack/manifest.json', toJson(createManifest(packageId))),
  createFile('valid-panel-pack/locales/zh-CN.json', '{}\n'),
  createFile('valid-panel-pack/data/items.json', toJson([createItem(`${packageId}:linen_ribbon`)]))
]

const publishMountedAppStartupHostEvidence = () =>
  publishThirdPartyDataPackMountedAppStartupHostEvidence({
    officialContentBootstrapped: true,
    runtimeContentRegistryPublished: true,
    thirdPartyStartupGateCompleted: true,
    thirdPartyStartupGateAllowed: true,
    gameAppCreated: true,
    piniaCreated: true,
    routerInstalled: true,
    routerMounted: true
  })

afterEach(() => {
  resetLiveContentRegistryForTests()
  resetThirdPartyDataPackMountedAppStartupHostEvidenceForTests()
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

const waitForPreflight = async(
  readStatus: () => string
): Promise<void> => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 10))
    await nextTick()
    if (readStatus() !== '预检中') return
  }
}

const expectRuntimeHandoffStatusLabels = (
  wrapper: { get: (selector: string) => { text: () => string } },
  expected: {
    readonly runtimePublication: string
    readonly liveRegistry: string
    readonly appStartup: string
  }
): void => {
  expect(wrapper.get('[data-testid="web-mod-runtime-publication-status"]').text())
    .toBe(expected.runtimePublication)
  expect(wrapper.get('[data-testid="web-mod-live-registry-status"]').text())
    .toBe(expected.liveRegistry)
  expect(wrapper.get('[data-testid="web-mod-app-startup-status"]').text())
    .toBe(expected.appStartup)
}

const createReadyElectronOrdinaryInstallTerminalContinuationResult = (
  envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
) => {
  const handoff = envelope.transactionCommandDispatcherHandoff
  const targetPackageId = handoff.targetPackageId
  const runtimePublicationEvidence = {
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
    diagnostics: []
  }

  return {
    status: 'ready',
    reason: 'Electron ordinary install terminal continuation reached ready panel handoff',
    installCommandPostCommitAcknowledgement: {
      status: 'ready',
      reason: 'Electron continuation accepted visible panel install handoff'
    },
    postCommitUiIpcDeliveryContinuation: {
      status: 'ready',
      selectedPlatform: 'electron',
      persistentPackageWriteExecuted: true,
      persistentSettingsLockfileWriteExecuted: true,
      effects: {
        uiIpcResponseDelivered: true
      }
    },
    ordinaryInstallTransactionTerminalConnection: {
      status: 'ready',
      reason: 'Electron continuation reached ordinary install terminal success semantics',
      targetPackageId,
      outcomeKind: 'success',
      recovery: 'none',
      retryable: false,
      rollbackRequired: false,
      rollbackRecoverySettled: false,
      rollbackRecoveryExecutionAcknowledged: false,
      effects: {
        ordinaryInstallTransactionReady: true,
        successOutcomeAccepted: true,
        failureOutcomeAccepted: false,
        retryOutcomeAccepted: false,
        rollbackOutcomeAccepted: false,
        rollbackRecoverySettled: false,
        rollbackRecoveryExecutionAcknowledged: false,
        packageFilesRestored: false,
        rollbackExecuted: false,
        runtimeEnablementAllowed: false
      }
    },
    installTransactionLogPrepared: {
      status: 'prepared',
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
    runtimePublicationCommitAfterPostCommitVerification: {
      kind: 'third-party-runtime-publication-commit-after-post-commit-verification-pipeline',
      mode: 'default-disabled-runtime-publication-commit-after-post-commit-verification-pipeline',
      status: 'accepted',
      reason: 'Electron continuation accepted runtime publication after visible panel install',
      readOnly: true,
      enabled: true,
      appBootstrapContinuationAllowed: true,
      commandContinuationAllowed: true,
      uiIpcResultContinuationAllowed: true,
      ...runtimePublicationEvidence,
      effects: {
        realRuntimePublicationCommitCalled: true,
        runtimePublicationCommitted: true,
        transactionCommitted: true,
        postCommitVerificationAcknowledged: true
      }
    },
    runtimePublicationCommitLiveRegistrySwapHostConnection: {
      kind: 'third-party-runtime-publication-commit-live-registry-swap-host-connection-pipeline',
      mode: 'default-disabled-runtime-publication-commit-live-registry-swap-host-connection-pipeline',
      status: 'swapped',
      reason: 'Electron continuation swapped live registry after visible panel install',
      readOnly: true,
      enabled: true,
      appBootstrapContinuationAllowed: true,
      commandContinuationAllowed: true,
      ...runtimePublicationEvidence,
      effects: {
        realRuntimePublicationCommitCalled: true,
        runtimePublicationCommitted: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true
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
      runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: 'swapped',
      runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionStatus: 'ready',
      ...runtimePublicationEvidence,
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
        realRuntimePublicationCommitCalled: true
      }
    },
    runtimePublicationCommitAppStartupHostConnection: {
      kind: 'third-party-runtime-publication-commit-app-startup-host-connection-pipeline',
      mode: 'default-disabled-runtime-publication-commit-app-startup-host-connection-pipeline',
      platform: 'electron',
      status: 'accepted',
      reason: 'Electron continuation accepted app startup host handoff after visible panel install',
      ...runtimePublicationEvidence,
      effects: {
        appStartupHostAccepted: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true
      }
    },
    startupPersistentStateSnapshotWrite: {
      status: 'written',
      storageKind: 'electron-program-directory-userdata-startup-persistent-state',
      targetPackageId,
      snapshotWritten: true
    },
    diagnostics: []
  }
}

const createRollbackElectronOrdinaryInstallTerminalContinuationResult = (
  envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
) => {
  const ready = createReadyElectronOrdinaryInstallTerminalContinuationResult(envelope)
  const terminal = ready.ordinaryInstallTransactionTerminalConnection
  return {
    ...ready,
    reason: 'Electron ordinary install terminal continuation reported rollback terminal outcome',
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
  }
}

describe('WebDataPackImportPreflightPanel', () => {
  it('connects the visible Web import action to source-derived install command dispatch', async() => {
    const selectFiles = vi.fn(async() => createValidFiles())
    const dispatchTransactionCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const persistenceStore = createInMemoryWebIndexedDbImportPersistenceStore()
    const wrapper = mount(WebDataPackImportPreflightPanel, {
      props: {
        selectFiles,
        officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
        persistenceStore,
        dispatchTransactionCommand
      }
    })

    await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
    await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

    expect(selectFiles).toHaveBeenCalledWith({ directory: true, multiple: true })
    expect(wrapper.get('[data-testid="web-mod-import-status"]').text()).toBe('已暂存')
    expect(wrapper.get('[data-testid="web-mod-file-count"]').text()).toBe('3')
    expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe('web_panel_entry')
    expect(wrapper.get('[data-testid="web-mod-preflight-status"]').text()).toBe('deferred')
    expect(wrapper.get('[data-testid="web-mod-dispatch-status"]').text()).toBe('dispatched')
    expect(wrapper.get('[data-testid="web-mod-persistence-status"]').text()).toBe('已写入 IndexedDB')
    expect(wrapper.get('[data-testid="web-mod-selected-packages"]').text()).toBe('web_panel_entry')
    expect(wrapper.get('[data-testid="web-mod-preflight-reason"]').text())
      .toContain('third-party transaction command dispatcher accepted')
    expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（注入）')
    expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('等待事务主机')
    expect(wrapper.text()).toContain('命令派发：已到达派发边界')
    expect(wrapper.text()).toContain('安装结果：等待事务主机')
    expect(wrapper.text()).toContain('事务提交：关闭')
    expect(wrapper.text()).toContain('写入：关闭')
    expect(wrapper.text()).toContain('运行时启用：关闭')
    expect(dispatchTransactionCommand).toHaveBeenCalledOnce()
    expect(dispatchTransactionCommand.mock.calls[0]?.[0]).toMatchObject({
      requestedCommandId: 'install',
      targetPackageId: 'web_panel_entry',
      selectedPackageIds: ['web_panel_entry'],
      loadOrder: ['web_panel_entry'],
      registryCount: 54,
      entryCount: 4243,
      packageCount: 1
    })
    expect(wrapper.text()).not.toContain('C:/Users')
    expect(wrapper.text()).not.toContain('LENOVO')
    expect(await persistenceStore.list()).toEqual([{
      importId: 'latest-web-file-picker-import',
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import',
      fileCount: 3,
      totalBytes: expect.any(Number)
    }])

    await wrapper.findAll('button').find(button => button.text().includes('重置'))!.trigger('click')
    await nextTick()
    await wrapper.findAll('button').find(button => button.text().includes('恢复暂存'))!.trigger('click')
    await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

    expect(selectFiles).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-testid="web-mod-import-status"]').text()).toBe('已恢复')
    expect(wrapper.get('[data-testid="web-mod-file-count"]').text()).toBe('3')
    expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe('web_panel_entry')
    expect(wrapper.get('[data-testid="web-mod-preflight-status"]').text()).toBe('deferred')
    expect(wrapper.get('[data-testid="web-mod-dispatch-status"]').text()).toBe('dispatched')
    expect(wrapper.get('[data-testid="web-mod-persistence-status"]').text()).toBe('已从 IndexedDB 恢复')
    expect(wrapper.get('[data-testid="web-mod-selected-packages"]').text()).toBe('web_panel_entry')
    expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（注入）')
    expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('等待事务主机')
    expect(dispatchTransactionCommand).toHaveBeenCalledTimes(2)
    expect(dispatchTransactionCommand.mock.calls[1]?.[0]).toMatchObject({
      requestedCommandId: 'install',
      targetPackageId: 'web_panel_entry',
      selectedPackageIds: ['web_panel_entry'],
      loadOrder: ['web_panel_entry']
    })

    wrapper.unmount()
  })

  it('surfaces injected atomic commit host acknowledgement while waiting for post-commit verification', async() => {
    const selectFiles = vi.fn(async() => createValidFiles('web_panel_atomic_host'))
    const dispatchTransactionCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const executeInjectedAtomicTransactionCommit = createInjectedAtomicTransactionCommitHost()
    const executeAtomicTransactionCommit = vi.fn(async(
      envelope: ThirdPartyDataPackAtomicTransactionCommitExecutorHostEnvelope
    ) => createAcceptedAtomicTransactionCommitHostResult(envelope))
    const wrapper = mount(WebDataPackImportPreflightPanel, {
      props: {
        selectFiles,
        officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
        persistenceStore: createInMemoryWebIndexedDbImportPersistenceStore(),
        dispatchTransactionCommand,
        executeInjectedAtomicTransactionCommit,
        executeAtomicTransactionCommit
      }
    })

    await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
    await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

    expect(dispatchTransactionCommand).toHaveBeenCalledOnce()
    expect(executeInjectedAtomicTransactionCommit.execute).toHaveBeenCalledOnce()
    expect(executeAtomicTransactionCommit).toHaveBeenCalledOnce()
    expect(executeAtomicTransactionCommit.mock.calls[0]?.[0]).toMatchObject({
      requestedCommandId: 'install',
      targetPackageId: 'web_panel_atomic_host',
      selectedPackageIds: ['web_panel_atomic_host'],
      loadOrder: ['web_panel_atomic_host'],
      registryCount: 54,
      entryCount: 4243,
      packageCount: 1,
      commitOutcomeKind: 'committed'
    })
    expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe('web_panel_atomic_host')
    expect(wrapper.get('[data-testid="web-mod-preflight-status"]').text()).toBe('deferred')
    expect(wrapper.get('[data-testid="web-mod-dispatch-status"]').text()).toBe('dispatched')
    expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（注入）')
    expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('等待提交后校验')
    expectRuntimeHandoffStatusLabels(wrapper, {
      runtimePublication: '未运行',
      liveRegistry: '未运行',
      appStartup: '未运行'
    })
    expect(wrapper.text()).toContain('命令派发：已到达派发边界')
    expect(wrapper.text()).toContain('安装结果：等待提交后校验')
    expect(wrapper.text()).toContain('事务提交：关闭')
    expect(wrapper.text()).toContain('写入：关闭')
    expect(wrapper.text()).toContain('运行时启用：关闭')
    expect(wrapper.text()).not.toContain('C:/Users')
    expect(wrapper.text()).not.toContain('LENOVO')
    expect(JSON.stringify(executeAtomicTransactionCommit.mock.calls[0]?.[0])).not.toContain('C:/Users')
    expect(JSON.stringify(executeAtomicTransactionCommit.mock.calls[0]?.[0])).not.toContain('LENOVO')

    wrapper.unmount()
  })

  it('surfaces injected post-commit read acknowledgement without enabling writes', async() => {
    const selectFiles = vi.fn(async() => createValidFiles('web_panel_post_commit_ready'))
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
    const wrapper = mount(WebDataPackImportPreflightPanel, {
      props: {
        selectFiles,
        officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
        persistenceStore: createInMemoryWebIndexedDbImportPersistenceStore(),
        dispatchTransactionCommand,
        executeInjectedAtomicTransactionCommit,
        executeAtomicTransactionCommit,
        ...postCommitReaders
      }
    })

    await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
    await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

    expect(dispatchTransactionCommand).toHaveBeenCalledOnce()
    expect(executeInjectedAtomicTransactionCommit.execute).toHaveBeenCalledOnce()
    expect(executeAtomicTransactionCommit).toHaveBeenCalledOnce()
    expect(postCommitReaders.readSettingsLockfileCommitSource).toHaveBeenCalledOnce()
    expect(postCommitReaders.readPostCommitPersistentState).toHaveBeenCalledOnce()
    expect(postCommitReaders.readPostCommitVerificationExecutorAdapter).toHaveBeenCalledOnce()
    expect(postCommitReaders.executePostCommitVerification).toHaveBeenCalledOnce()
    expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe('web_panel_post_commit_ready')
    expect(wrapper.get('[data-testid="web-mod-preflight-status"]').text()).toBe('deferred')
    expect(wrapper.get('[data-testid="web-mod-dispatch-status"]').text()).toBe('dispatched')
    expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（注入）')
    expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('提交后校验已确认')
    expect(wrapper.get('[data-testid="web-mod-ui-ipc-delivery-status"]').text()).toBe('等待终端交付')
    expectRuntimeHandoffStatusLabels(wrapper, {
      runtimePublication: '未运行',
      liveRegistry: '未运行',
      appStartup: '未运行'
    })
    expect(wrapper.text()).toContain('命令派发：已到达派发边界')
    expect(wrapper.text()).toContain('安装结果：提交后校验已确认')
    expect(wrapper.text()).toContain('UI/IPC：等待终端交付')
    expect(wrapper.text()).toContain('事务提交：关闭')
    expect(wrapper.text()).toContain('写入：关闭')
    expect(wrapper.text()).toContain('运行时启用：关闭')
    expect(wrapper.text()).not.toContain('已完成')
    expect(wrapper.text()).not.toContain('C:/Users')
    expect(wrapper.text()).not.toContain('LENOVO')

    wrapper.unmount()
  })

  it('surfaces ready post-commit UI/IPC delivery continuation without claiming full completion', async() => {
    const selectFiles = vi.fn(async() => createValidFiles('web_panel_ui_ipc_ready'))
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
    const wrapper = mount(WebDataPackImportPreflightPanel, {
      props: {
        selectFiles,
        officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
        persistenceStore: createInMemoryWebIndexedDbImportPersistenceStore(),
        dispatchTransactionCommand,
        executeInjectedAtomicTransactionCommit,
        executeAtomicTransactionCommit,
        ...postCommitReaders,
        readPostCommitUiIpcDeliveryContinuationSource
      }
    })

    await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
    await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

    expect(dispatchTransactionCommand).toHaveBeenCalledOnce()
    expect(executeInjectedAtomicTransactionCommit.execute).toHaveBeenCalledOnce()
    expect(executeAtomicTransactionCommit).toHaveBeenCalledOnce()
    expect(postCommitReaders.readSettingsLockfileCommitSource).toHaveBeenCalledOnce()
    expect(postCommitReaders.readPostCommitPersistentState).toHaveBeenCalledOnce()
    expect(postCommitReaders.readPostCommitVerificationExecutorAdapter).toHaveBeenCalledOnce()
    expect(postCommitReaders.executePostCommitVerification).toHaveBeenCalledOnce()
    expect(readPostCommitUiIpcDeliveryContinuationSource).toHaveBeenCalledOnce()
    expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe('web_panel_ui_ipc_ready')
    expect(wrapper.get('[data-testid="web-mod-preflight-status"]').text()).toBe('deferred')
    expect(wrapper.get('[data-testid="web-mod-dispatch-status"]').text()).toBe('dispatched')
    expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（注入）')
    expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('提交后校验已确认')
    expect(wrapper.get('[data-testid="web-mod-ui-ipc-delivery-status"]').text()).toBe('已送达（Web）')
    expectRuntimeHandoffStatusLabels(wrapper, {
      runtimePublication: '未运行',
      liveRegistry: '未运行',
      appStartup: '未运行'
    })
    expect(wrapper.text()).toContain('安装结果：提交后校验已确认')
    expect(wrapper.text()).toContain('UI/IPC：已送达（Web）')
    expect(wrapper.text()).toContain('事务提交：关闭')
    expect(wrapper.text()).toContain('写入：已执行')
    expect(wrapper.text()).toContain('运行时启用：关闭')
    expect(wrapper.text()).not.toContain('已完成')
    expect(wrapper.text()).not.toContain('C:/Users')
    expect(wrapper.text()).not.toContain('LENOVO')

    wrapper.unmount()
  })

  it('uses the default renderer install command host from the visible panel when no dispatcher prop is injected', async() => {
    const selectFiles = vi.fn(async() => createValidFiles('web_panel_default_host'))
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
    publishMountedAppStartupHostEvidence()
    const wrapper = mount(WebDataPackImportPreflightPanel, {
      props: {
        selectFiles,
        officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
        persistenceStore: createInMemoryWebIndexedDbImportPersistenceStore()
      }
    })

    try {
      await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
      await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

      expect(dispatchThirdPartyDataPackInstallCommand).toHaveBeenCalledOnce()
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal).toHaveBeenCalledOnce()
      expect(dispatchThirdPartyDataPackInstallCommand.mock.calls[0]?.[0]).toMatchObject({
        requestedCommandId: 'install',
        targetPackageId: 'web_panel_default_host',
        selectedPackageIds: ['web_panel_default_host'],
        blockedPackageIds: [],
        loadOrder: ['web_panel_default_host'],
        registryCount: 54,
        entryCount: 4243,
        packageCount: 1
      })
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal.mock.calls[0]?.[0]).toMatchObject({
        transactionCommandDispatcherHandoff: {
          requestedCommandId: 'install',
          targetPackageId: 'web_panel_default_host',
          selectedPackageIds: ['web_panel_default_host']
        },
        lockfileDraft: {
          packages: [expect.objectContaining({ packageId: 'web_panel_default_host' })]
        }
      })
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal.mock.calls[0]?.[0]
        .packageFilePayload.map(file => file.path)).toEqual(['manifest.json', 'data/items.json'])
      expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe('web_panel_default_host')
      expect(wrapper.get('[data-testid="web-mod-preflight-status"]').text()).toBe('deferred')
      expect(wrapper.get('[data-testid="web-mod-dispatch-status"]').text()).toBe('dispatched')
      expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（Electron）')
      expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('提交后校验已确认')
      expect(wrapper.get('[data-testid="web-mod-ui-ipc-delivery-status"]').text()).toBe('已送达（Electron）')
      expectRuntimeHandoffStatusLabels(wrapper, {
        runtimePublication: '已确认',
        liveRegistry: '已切换',
        appStartup: '已接入已挂载应用'
      })
      expect(wrapper.text()).toContain('命令派发：已到达派发边界')
      expect(wrapper.text()).toContain('安装结果：提交后校验已确认')
      expect(wrapper.text()).toContain('UI/IPC：已送达（Electron）')
      expect(wrapper.get('[data-testid="web-mod-startup-persistent-state-status"]').text()).toBe('已写入')
      expect(wrapper.text()).toContain('事务提交：已提交')
      expect(wrapper.text()).toContain('写入：已执行')
      expect(wrapper.text()).toContain('运行时启用：允许')
      expect(wrapper.text()).not.toContain('C:/Users')
      expect(wrapper.text()).not.toContain('LENOVO')
      expect(JSON.stringify(dispatchThirdPartyDataPackInstallCommand.mock.calls[0]?.[0])).not.toContain('C:/Users')
      expect(JSON.stringify(dispatchThirdPartyDataPackInstallCommand.mock.calls[0]?.[0])).not.toContain('LENOVO')
      expect(JSON.stringify(continueThirdPartyDataPackOrdinaryInstallTerminal.mock.calls[0]?.[0]))
        .not.toContain('C:/Users')
      expect(JSON.stringify(continueThirdPartyDataPackOrdinaryInstallTerminal.mock.calls[0]?.[0]))
        .not.toContain('LENOVO')
    } finally {
      wrapper.unmount()
      restoreElectronApi()
    }
  })

  it('surfaces terminal rollback without showing runtime enablement as accepted', async() => {
    const selectFiles = vi.fn(async() => createValidFiles('web_panel_terminal_rollback'))
    const dispatchThirdPartyDataPackInstallCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const continueThirdPartyDataPackOrdinaryInstallTerminal = vi.fn(async(
      envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
    ) => createRollbackElectronOrdinaryInstallTerminalContinuationResult(envelope))
    const restoreElectronApi = withWindowElectronApi({
      dispatchThirdPartyDataPackInstallCommand,
      continueThirdPartyDataPackOrdinaryInstallTerminal
    })
    publishMountedAppStartupHostEvidence()
    const wrapper = mount(WebDataPackImportPreflightPanel, {
      props: {
        selectFiles,
        officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
        persistenceStore: createInMemoryWebIndexedDbImportPersistenceStore()
      }
    })

    try {
      await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
      await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

      expect(dispatchThirdPartyDataPackInstallCommand).toHaveBeenCalledOnce()
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal).toHaveBeenCalledOnce()
      expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe('web_panel_terminal_rollback')
      expect(wrapper.get('[data-testid="web-mod-dispatch-status"]').text()).toBe('dispatched')
      expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（Electron）')
      expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('已回滚')
      expect(wrapper.get('[data-testid="web-mod-ui-ipc-delivery-status"]').text()).toBe('已送达（Electron）')
      expectRuntimeHandoffStatusLabels(wrapper, {
        runtimePublication: '已阻断',
        liveRegistry: '已阻断',
        appStartup: '已阻断'
      })
      expect(wrapper.get('[data-testid="web-mod-startup-persistent-state-status"]').text()).toBe('已阻断')
      expect(wrapper.text()).toContain('安装结果：已回滚')
      expect(wrapper.text()).toContain('运行时启用：关闭')
      expect(wrapper.text()).not.toContain('运行时启用：允许')
      expect(wrapper.text()).not.toContain('C:/Users')
      expect(wrapper.text()).not.toContain('LENOVO')
    } finally {
      wrapper.unmount()
      restoreElectronApi()
    }
  })

  it('blocks runtime handoff labels when an Electron terminal omits the success outcome evidence', async() => {
    const selectFiles = vi.fn(async() => createValidFiles('web_panel_terminal_status_only'))
    const dispatchThirdPartyDataPackInstallCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const continueThirdPartyDataPackOrdinaryInstallTerminal = vi.fn(async(
      envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
    ) => {
      const ready = createReadyElectronOrdinaryInstallTerminalContinuationResult(envelope)
      const {
        outcomeKind: _outcomeKind,
        effects: _effects,
        ...terminalWithoutOutcome
      } = ready.ordinaryInstallTransactionTerminalConnection
      return {
        ...ready,
        ordinaryInstallTransactionTerminalConnection: terminalWithoutOutcome
      }
    })
    const restoreElectronApi = withWindowElectronApi({
      dispatchThirdPartyDataPackInstallCommand,
      continueThirdPartyDataPackOrdinaryInstallTerminal
    })
    publishMountedAppStartupHostEvidence()
    const wrapper = mount(WebDataPackImportPreflightPanel, {
      props: {
        selectFiles,
        officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
        persistenceStore: createInMemoryWebIndexedDbImportPersistenceStore()
      }
    })

    try {
      await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
      await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

      expect(dispatchThirdPartyDataPackInstallCommand).toHaveBeenCalledOnce()
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal).toHaveBeenCalledOnce()
      expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe('web_panel_terminal_status_only')
      expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('终端已阻断')
      expectRuntimeHandoffStatusLabels(wrapper, {
        runtimePublication: '已阻断',
        liveRegistry: '已阻断',
        appStartup: '已阻断'
      })
      expect(wrapper.get('[data-testid="web-mod-startup-persistent-state-status"]').text()).toBe('已阻断')
      expect(wrapper.text()).toContain('运行时启用：关闭')
      expect(wrapper.text()).not.toContain('运行时启用：允许')
      expect(wrapper.text()).not.toContain('C:/Users')
      expect(wrapper.text()).not.toContain('LENOVO')
    } finally {
      wrapper.unmount()
      restoreElectronApi()
    }
  })

  it('uses the Web ordinary continuation when a persisted source is available without injected or Electron hosts', async() => {
    const selectFiles = vi.fn(async() => createValidFiles('web_panel_web_ordinary'))
    const webSettingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const webInstallTransactionLogStore = createInMemoryWebInstallTransactionLogPreparedStore()
    const persistenceStore = createInMemoryWebIndexedDbImportPersistenceStore()
    const wrapper = mount(WebDataPackImportPreflightPanel, {
      props: {
        selectFiles,
        officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
        persistenceStore,
        webSettingsLockfileStore,
        webInstallTransactionLogStore
      }
    })

    await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
    await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

    expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe('web_panel_web_ordinary')
    expect(wrapper.get('[data-testid="web-mod-dispatch-status"]').text()).toBe('dispatched')
    expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（Web）')
    expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('提交后校验已确认')
    expect(wrapper.get('[data-testid="web-mod-ui-ipc-delivery-status"]').text()).toBe('已送达（Web）')
    expectRuntimeHandoffStatusLabels(wrapper, {
      runtimePublication: '已确认',
      liveRegistry: '已切换',
      appStartup: '等待已挂载应用'
    })
    expect(wrapper.text()).toContain('命令派发：已到达派发边界')
    expect(wrapper.text()).toContain('安装结果：提交后校验已确认')
    expect(wrapper.text()).toContain('UI/IPC：已送达（Web）')
    expect(wrapper.get('[data-testid="web-mod-startup-persistent-state-status"]').text()).toBe('未写入')
    expect(wrapper.text()).toContain('事务提交：已提交')
    expect(wrapper.text()).toContain('写入：已执行')
    expect(wrapper.text()).toContain('运行时启用：关闭')
    const readSettingsLockfile = await webSettingsLockfileStore.read()
    const readTransactionLog = await webInstallTransactionLogStore.read()
    expect(readSettingsLockfile.record).toMatchObject({
      recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
      targetPackageId: 'web_panel_web_ordinary',
      selectedPackageIds: ['web_panel_web_ordinary'],
      loadOrder: ['web_panel_web_ordinary']
    })
    expect(readSettingsLockfile.record?.lockfileDraft.packages[0]?.packageId)
      .toBe('web_panel_web_ordinary')
    expect(readTransactionLog.report.status).toBe('loaded')
    expect(readTransactionLog.record?.targetPackageId).toBe('web_panel_web_ordinary')
    expect(wrapper.text()).not.toContain('C:/Users')
    expect(wrapper.text()).not.toContain('LENOVO')

    wrapper.unmount()
  })

  it('labels no-persistence path-free fallback acknowledgement as local preflight', async() => {
    const selectFiles = vi.fn(async() => createValidFiles('web_panel_local_fallback'))
    const wrapper = mount(WebDataPackImportPreflightPanel, {
      props: {
        selectFiles,
        officialRegistrySet: buildOfficialRegistrySetFromStaticData(),
        persistenceStore: null
      }
    })

    await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
    await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

    expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe('web_panel_local_fallback')
    expect(wrapper.get('[data-testid="web-mod-dispatch-status"]').text()).toBe('dispatched')
    expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('本地预检')
    expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('等待事务主机')
    expect(wrapper.get('[data-testid="web-mod-ui-ipc-delivery-status"]').text()).toBe('未运行')
    expectRuntimeHandoffStatusLabels(wrapper, {
      runtimePublication: '未运行',
      liveRegistry: '未运行',
      appStartup: '未运行'
    })
    expect(wrapper.text()).toContain('命令派发：已到达派发边界')
    expect(wrapper.text()).toContain('安装结果：等待事务主机')
    expect(wrapper.text()).toContain('事务提交：关闭')
    expect(wrapper.text()).toContain('写入：关闭')
    expect(wrapper.text()).toContain('运行时启用：关闭')
    expect(wrapper.text()).not.toContain('C:/Users')
    expect(wrapper.text()).not.toContain('LENOVO')

    wrapper.unmount()
  })

  it('disables and re-enables an installed package from the visible management list', async() => {
    const packageId = 'web_panel_disable_visible'
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    publishOfficialContentRegistrySet(officialRegistrySet)
    publishMountedAppStartupHostEvidence()
    const persistenceStore = createInMemoryWebIndexedDbImportPersistenceStore()
    const webSettingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const webInstallTransactionLogStore = createInMemoryWebInstallTransactionLogPreparedStore()
    const wrapper = mount(WebDataPackImportPreflightPanel, {
      props: {
        selectFiles: vi.fn(async() => createValidFiles(packageId)),
        officialRegistrySet,
        persistenceStore,
        webSettingsLockfileStore,
        webInstallTransactionLogStore
      }
    })

    try {
      await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
      await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

      const disableButton = wrapper.get(`[data-testid="web-mod-disable-${packageId}"]`)
      expect(wrapper.get(`[data-testid="web-mod-installed-row-${packageId}"]`).text()).toContain('已启用')
      expect(getOfficialItemDef(`${packageId}:linen_ribbon`)?.name.fallback)
        .toBe(`${packageId}:linen_ribbon`)

      await disableButton.trigger('click')
      await waitForPreflight(() => wrapper.get('[data-testid="web-mod-disable-result"]').text())

      expect(wrapper.get(`[data-testid="web-mod-installed-row-${packageId}"]`).text()).toContain('已禁用')
      expect(wrapper.find(`[data-testid="web-mod-disable-${packageId}"]`).exists()).toBe(false)
      expect(wrapper.get(`[data-testid="web-mod-enable-${packageId}"]`).text()).toContain('启用')
      expect(wrapper.get('[data-testid="web-mod-disable-result"]').text()).toContain('禁用事务：已完成')
      expect(wrapper.get('[data-testid="web-mod-disable-result"]').text()).toContain('settings 已写入')
      expect(wrapper.get('[data-testid="web-mod-disable-result"]').text()).toContain('mod-lock 已写入')
      expect(wrapper.get('[data-testid="web-mod-disable-result"]').text()).toContain('startup 已写入')
      expect(wrapper.get('[data-testid="web-mod-disable-result"]').text()).toContain('runtime 已排除')
      expect(wrapper.get('[data-testid="web-mod-disable-result"]').text()).toContain('live registry 已切换')
      expect(wrapper.get('[data-testid="web-mod-disable-result"]').text()).toContain('handoff 已接受')
      expect(getOfficialItemDef(`${packageId}:linen_ribbon`)).toBeUndefined()

      await wrapper.get(`[data-testid="web-mod-enable-${packageId}"]`).trigger('click')
      await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

      expect(wrapper.get(`[data-testid="web-mod-installed-row-${packageId}"]`).text()).toContain('已启用')
      expect(wrapper.get(`[data-testid="web-mod-disable-${packageId}"]`).text()).toContain('禁用')
      expect(wrapper.find(`[data-testid="web-mod-enable-${packageId}"]`).exists()).toBe(false)
      expect(wrapper.get('[data-testid="web-mod-import-status"]').text()).toBe('已恢复')
      expect(wrapper.get('[data-testid="web-mod-dispatch-status"]').text()).toBe('dispatched')
      expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（Web）')
      expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('提交后校验已确认')
      expect(wrapper.get('[data-testid="web-mod-ui-ipc-delivery-status"]').text()).toBe('已送达（Web）')
      expectRuntimeHandoffStatusLabels(wrapper, {
        runtimePublication: '已确认',
        liveRegistry: '已切换',
        appStartup: '已接入已挂载应用'
      })
      expect(wrapper.get('[data-testid="web-mod-startup-persistent-state-status"]').text()).toBe('已写入')
      expect(wrapper.text()).toContain('事务提交：已提交')
      expect(wrapper.text()).toContain('写入：已执行')
      expect(wrapper.text()).toContain('运行时启用：允许')
      expect(getOfficialItemDef(`${packageId}:linen_ribbon`)?.name.fallback)
        .toBe(`${packageId}:linen_ribbon`)
      expect((await webSettingsLockfileStore.read()).record).toMatchObject({
        recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId]
      })
      expect(wrapper.text()).not.toContain('C:/Users')
      expect(wrapper.text()).not.toContain('LENOVO')
    } finally {
      wrapper.unmount()
    }
  })

  it('uninstalls a disabled package from the visible management list', async() => {
    const packageId = 'web_panel_uninstall_visible'
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
    publishOfficialContentRegistrySet(officialRegistrySet)
    publishMountedAppStartupHostEvidence()
    const persistenceStore = createInMemoryWebIndexedDbImportPersistenceStore()
    const webSettingsLockfileStore = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const webInstallTransactionLogStore = createInMemoryWebInstallTransactionLogPreparedStore()
    const wrapper = mount(WebDataPackImportPreflightPanel, {
      props: {
        selectFiles: vi.fn(async() => createValidFiles(packageId)),
        officialRegistrySet,
        persistenceStore,
        webSettingsLockfileStore,
        webInstallTransactionLogStore
      }
    })

    try {
      await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
      await waitForPreflight(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

      expect(wrapper.get(`[data-testid="web-mod-installed-row-${packageId}"]`).text()).toContain('已启用')
      expect(getOfficialItemDef(`${packageId}:linen_ribbon`)?.name.fallback)
        .toBe(`${packageId}:linen_ribbon`)

      await wrapper.get(`[data-testid="web-mod-disable-${packageId}"]`).trigger('click')
      await waitForPreflight(() => wrapper.get('[data-testid="web-mod-disable-result"]').text())

      expect(wrapper.get(`[data-testid="web-mod-installed-row-${packageId}"]`).text()).toContain('已禁用')
      expect(wrapper.get(`[data-testid="web-mod-uninstall-${packageId}"]`).text()).toContain('卸载')
      expect(getOfficialItemDef(`${packageId}:linen_ribbon`)).toBeUndefined()

      await wrapper.get(`[data-testid="web-mod-uninstall-${packageId}"]`).trigger('click')
      await waitForPreflight(() => wrapper.get('[data-testid="web-mod-uninstall-result"]').text())

      expect(wrapper.find(`[data-testid="web-mod-installed-row-${packageId}"]`).exists()).toBe(false)
      expect(wrapper.get('[data-testid="web-mod-installed-empty"]').text()).toContain('暂无已安装数据包')
      expect(wrapper.get('[data-testid="web-mod-uninstall-result"]').text()).toContain('卸载事务：已完成')
      expect(wrapper.get('[data-testid="web-mod-uninstall-result"]').text()).toContain('settings 已写入')
      expect(wrapper.get('[data-testid="web-mod-uninstall-result"]').text()).toContain('mod-lock 已写入')
      expect(wrapper.get('[data-testid="web-mod-uninstall-result"]').text()).toContain('startup 已写入')
      expect(wrapper.get('[data-testid="web-mod-uninstall-result"]').text()).toContain('package 已删除')
      expect(wrapper.get('[data-testid="web-mod-uninstall-result"]').text()).toContain('runtime 已排除')
      expect(wrapper.get('[data-testid="web-mod-uninstall-result"]').text()).toContain('live registry 已切换')
      expect(wrapper.get('[data-testid="web-mod-uninstall-result"]').text()).toContain('handoff 已接受')
      expect(getOfficialItemDef(`${packageId}:linen_ribbon`)).toBeUndefined()
      const uninstalledRecord = (await webSettingsLockfileStore.read()).record
      expect(uninstalledRecord).toMatchObject({
        recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
        requestedCommandId: 'uninstall',
        targetPackageId: packageId,
        selectedPackageIds: [],
        blockedPackageIds: [],
        loadOrder: []
      })
      expect(uninstalledRecord?.lockfileDraft.packages).toEqual([])
      expect(await persistenceStore.get('latest-web-file-picker-import')).toBeNull()
      expect(wrapper.text()).not.toContain('C:/Users')
      expect(wrapper.text()).not.toContain('LENOVO')
    } finally {
      wrapper.unmount()
    }
  })
})
