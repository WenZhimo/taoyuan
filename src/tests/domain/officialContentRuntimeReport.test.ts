import { afterEach, describe, expect, it, vi } from 'vitest'
import { createEnvironmentHash } from '@/domain/mods/environmentHash'
import {
  bootstrapOfficialContent
} from '@/domain/mods/officialContentBootstrap'
import { refreshOfficialRegistryDiskCache } from '@/domain/mods/officialRegistryCacheRefresh'
import { createOfficialContentRuntimeReport } from '@/domain/mods/officialContentRuntimeReport'
import {
  acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope
} from '@/domain/mods/thirdPartyDataPackElectronIpcResponseDeliveryBridge'
import {
  acknowledgeThirdPartyDataPackElectronInstallCommandDispatchIpcEnvelope
} from '@/domain/mods/thirdPartyDataPackElectronInstallCommandDispatchBridge'
import {
  applyOfficialPrecompiledProbeFault,
  getOfficialPrecompiledProbeFault
} from '@/domain/mods/officialPrecompiledRuntime'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'
import {
  createThirdPartyRendererUiIpcRuntimeProbeSummary,
  createThirdPartyElectronInstallCommandDispatchRuntimeProbeSummary,
  createThirdPartyAppStartupHostRuntimeProbeSummary,
  createThirdPartyStartupGateRuntimeProbeSummary,
  createThirdPartyVisibleImportRuntimeProbeSummary,
  isContentRuntimeProbeRequested,
  publishContentRuntimeProbe
} from '@/runtime/contentRuntimeProbe'
import {
  runThirdPartyRendererUiIpcProductProbe
} from '@/runtime/thirdPartyRendererUiIpcProductProbe'
import {
  runThirdPartyElectronInstallCommandDispatchProductProbe
} from '@/runtime/thirdPartyElectronInstallCommandDispatchProductProbe'
import committedArtifact from '@/generated/mods/official-precompiled-registry.json'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const originalUrl = window.location.href

afterEach(() => {
  window.history.replaceState({}, '', originalUrl)
  document.body.replaceChildren()
  Reflect.deleteProperty(window, 'electronAPI')
  Reflect.deleteProperty(window, '__TAOYUAN_CONTENT_RUNTIME_REPORT__')
})

describe('official content runtime report', () => {
  it('reports the loaded production identity, order and public query checks', async () => {
    await bootstrapOfficialContent()

    const report = createOfficialContentRuntimeReport()

    expect(report).toMatchObject({
      schemaVersion: 1,
      runtimeSource: 'precompiled',
      loadPath: 'precompiled-hit',
      precompiledStatus: 'official-precompiled-hit',
      diagnostics: [],
      registryPhase: 'frozen',
      snapshotFormatVersion: 2,
      registryCount: 54,
      entryCount: 4242,
      hashes: {
        artifactHash: committedMetadata.artifactHash,
        artifactHashSource: 'loaded-product',
        contentHash: committedMetadata.contentHash,
        schemaSetHash: committedMetadata.schemaSetHash,
        environmentHash: committedMetadata.environmentHash,
        snapshotHash: committedMetadata.snapshotHash
      },
      queryChecks: {
        itemName: '青菜',
        recipeName: '炒青菜',
        cropName: '青菜'
      }
    })
    expect(report.registryIds).toEqual(
      committedArtifact.snapshot.registries.map(registry => registry.registryId)
    )
  })

  it.each([
    ['missing', 'missing'],
    ['corrupt', 'corrupt'],
    ['environment-mismatch', 'environment-mismatch']
  ] as const)('accepts the %s fault only in explicit probe mode', (_name, fault) => {
    expect(getOfficialPrecompiledProbeFault(
      `?taoyuanContentProbe=1&taoyuanPrecompiledFault=${fault}`
    )).toBe(fault)
    expect(getOfficialPrecompiledProbeFault(`?taoyuanPrecompiledFault=${fault}`)).toBeNull()
  })

  it('creates isolated missing, corrupt and environment mismatch inputs', () => {
    const text = JSON.stringify(committedArtifact)

    expect(applyOfficialPrecompiledProbeFault(text, 'missing')).toBeNull()
    expect(() => JSON.parse(applyOfficialPrecompiledProbeFault(text, 'corrupt')!)).toThrow()

    const mismatch = JSON.parse(
      applyOfficialPrecompiledProbeFault(text, 'environment-mismatch')!
    ) as typeof committedArtifact
    expect(mismatch.environment.gameVersion).toBe('probe-environment-mismatch')
    expect(mismatch.environmentHash).toBe(createEnvironmentHash(mismatch.environment))
    expect(mismatch.environmentHash).not.toBe(committedMetadata.environmentHash)
  })

  it('publishes a bounded browser and Electron envelope only in probe mode', async () => {
    await bootstrapOfficialContent()
    expect(isContentRuntimeProbeRequested()).toBe(false)
    expect(publishContentRuntimeProbe()).toBeNull()

    window.history.replaceState({}, '', '/?taoyuanContentProbe=1')
    document.title = '桃源乡'
    for (const label of ['新的旅程', '导入存档', '关于游戏']) {
      const button = document.createElement('button')
      button.textContent = label
      document.body.append(button)
    }
    const reportContentRuntimeProbe = vi.fn()
    Object.defineProperty(window, 'electronAPI', {
      configurable: true,
      value: { reportContentRuntimeProbe }
    })

    const envelope = publishContentRuntimeProbe()

    expect(envelope).toMatchObject({
      schemaVersion: 1,
      runtime: {
        runtimeSource: 'precompiled',
        registryCount: 54,
        entryCount: 4242
      },
      thirdPartyStartupGate: {
        schemaVersion: 1,
        observed: false,
        selectedPackageCount: 0,
        blockedPackageCount: 0,
        loadOrderCount: 0,
        lockfileHashPresent: false,
        effects: {
          appStartupHostConnectionSourceCalled: false,
          appStartupHostConnectionAccepted: false,
          uiIpcResponseDelivered: false,
          thirdPartyRegistryPublished: false,
          liveRegistrySwapped: false,
          runtimeEnablementAllowed: false,
          transactionCommitted: false,
          packageFilesWritten: false,
          lockfileWritten: false,
          settingsWritten: false,
          savesWritten: false,
          cacheWritten: false,
          transactionLogWritten: false
        }
      },
      thirdPartyAppStartupHost: {
        schemaVersion: 1,
        observed: false,
        sourceCalled: false,
        selectedPackageCount: 0,
        blockedPackageCount: 0,
        loadOrderCount: 0,
        lockfileHashPresent: false,
        effects: {
          realAppStartupHostCalled: false,
          appStartupHostConnectionAccepted: false,
          appBootstrapContinuationAllowed: false,
          officialContentBootstrapped: false,
          runtimeContentRegistryPublished: false,
          thirdPartyStartupGateCompleted: false,
          thirdPartyStartupGateAllowed: false,
          gameAppCreated: false,
          piniaCreated: false,
          routerInstalled: false,
          routerMounted: false,
          transactionCommitted: false,
          packageFilesWritten: false,
          lockfileWritten: false,
          settingsWritten: false,
          savesWritten: false,
          cacheWritten: false,
          transactionLogWritten: false
        }
      },
      thirdPartyRendererUiIpc: {
        schemaVersion: 1,
        observed: false,
        selectedPackageCount: 0,
        blockedPackageCount: 0,
        loadOrderCount: 0,
        lockfileHashPresent: false,
        platformResponseDelivered: false,
        deliveryAcknowledgementConsumed: false,
        webDomResponseEventObserved: false,
        effects: {
          uiIpcResponseDelivered: false,
          electronIpcResponseSent: false,
          webUiResponsePublished: false,
          androidUiResponsePublished: false,
          transactionCommitted: false,
          packageFilesWritten: false,
          lockfileWritten: false,
          settingsWritten: false,
          savesWritten: false,
          cacheWritten: false,
          transactionLogWritten: false
        }
      },
      thirdPartyElectronInstallCommandDispatch: {
        schemaVersion: 1,
        observed: false,
        selectedPackageCount: 0,
        blockedPackageCount: 0,
        loadOrderCount: 0,
        lockfileHashPresent: false,
        diagnosticsCount: 0,
        effects: {
          commandDispatcherCalled: false,
          commandDispatched: false,
          transactionCommitted: false,
          postCommitVerificationExecuted: false,
          uiIpcResponseDelivered: false,
          packageFilesWritten: false,
          lockfileWritten: false,
          settingsWritten: false,
          savesWritten: false,
          cacheWritten: false,
          transactionLogWritten: false
        }
      },
      thirdPartyVisibleImport: {
        schemaVersion: 1,
        observed: false,
        mainMenuPanelOpened: false,
        panelImportButtonClicked: false,
        defaultFileInputSelectorUsed: false,
        fileCount: 0,
        selectedPackageCount: 0,
        blockedPackageCount: 0,
        loadOrderCount: 0,
        diagnosticsCount: 0,
        contentAccessItemVisibleBefore: false,
        contentAccessItemVisibleAfter: false,
        effects: {
          commandDispatched: false,
          packageFilesWritten: false,
          settingsWritten: false,
          lockfileWritten: false,
          rendererLiveRegistrySwapped: false,
          runtimeEnablementAllowed: false,
          uiIpcResponseDelivered: false,
          transactionCommitted: false,
          savesWritten: false,
          cacheWritten: false,
          transactionLogWritten: false
        }
      },
      ui: {
        documentTitle: '桃源乡',
        locationProtocol: 'http:',
        mainMenuReady: true,
        startupFailureVisible: false
      }
    })
    expect(reportContentRuntimeProbe).toHaveBeenCalledWith(envelope)
    expect((window as Window & {
      __TAOYUAN_CONTENT_RUNTIME_REPORT__?: unknown
    }).__TAOYUAN_CONTENT_RUNTIME_REPORT__).toBe(envelope)
  })

  it('publishes a path-free third-party startup gate summary in probe mode', async () => {
    await bootstrapOfficialContent()
    window.history.replaceState({}, '', '/?taoyuanContentProbe=1')
    for (const label of ['新的旅程', '导入存档', '关于游戏']) {
      const button = document.createElement('button')
      button.textContent = label
      document.body.append(button)
    }

    let hostileGetterRead = false
    const startupGateResult = {
      status: 'ready',
      enabled: true,
      appBootstrapContinuationAllowed: true,
      appStartupHostConnectionSourceStatus: 'accepted',
      targetPackageId: 'sample_pack',
      selectedPackageIds: ['sample_pack'],
      blockedPackageIds: [],
      loadOrder: ['sample_pack'],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      lockfileHash: `sha256:${'d'.repeat(64)}`,
      effects: {
        appStartupHostConnectionSourceCalled: true,
        appStartupHostConnectionAccepted: true,
        appBootstrapContinuationAllowed: true,
        uiIpcResponseDelivered: false,
        commandDispatched: false,
        thirdPartyRegistryPublished: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        realRuntimePublicationCommitCalled: true,
        transactionCommitted: false,
        runtimePublicationCommitted: true,
        packageFilesWritten: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false,
        rollbackExecuted: false,
        diagnosticsWritten: false
      }
    }
    Object.defineProperty(startupGateResult, 'reason', {
      enumerable: true,
      get() {
        hostileGetterRead = true
        throw new Error('C:\\secret\\startup-gate')
      }
    })
    Object.defineProperty(startupGateResult, 'diagnostics', {
      enumerable: true,
      get() {
        hostileGetterRead = true
        throw new Error('C:\\secret\\diagnostic')
      }
    })

    const envelope = publishContentRuntimeProbe({
      thirdPartyStartupGateResult: startupGateResult
    })

    expect(envelope?.thirdPartyStartupGate).toMatchObject({
      schemaVersion: 1,
      observed: true,
      status: 'ready',
      enabled: true,
      appBootstrapContinuationAllowed: true,
      appStartupHostConnectionSourceStatus: 'accepted',
      targetPackageId: 'sample_pack',
      selectedPackageCount: 1,
      blockedPackageCount: 0,
      loadOrderCount: 1,
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      lockfileHashPresent: true,
      effects: {
        appStartupHostConnectionSourceCalled: true,
        appStartupHostConnectionAccepted: true,
        appBootstrapContinuationAllowed: true,
        uiIpcResponseDelivered: false,
        commandDispatched: false,
        thirdPartyRegistryPublished: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        realRuntimePublicationCommitCalled: true,
        transactionCommitted: false,
        runtimePublicationCommitted: true,
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
    expect(hostileGetterRead).toBe(false)
    expect(JSON.stringify(envelope)).not.toContain('C:\\secret')
  })

  it('summarizes mounted app-startup host evidence without exposing app handles', () => {
    let hostileGetterRead = false
    const appStartupHostResult = {
      status: 'accepted',
      enabled: true,
      sourceCalled: true,
      targetPackageId: 'sample_pack',
      appStartupHostConnectionSourceStatus: 'accepted',
      selectedPackageIds: ['sample_pack'],
      blockedPackageIds: [],
      loadOrder: ['sample_pack'],
      registryCount: 54,
      entryCount: 4243,
      packageCount: 1,
      lockfileHashPresent: true,
      effects: {
        realAppStartupHostCalled: true,
        appStartupHostConnectionAccepted: true,
        appBootstrapContinuationAllowed: true,
        officialContentBootstrapped: true,
        runtimeContentRegistryPublished: true,
        thirdPartyStartupGateCompleted: true,
        thirdPartyStartupGateAllowed: true,
        gameAppCreated: true,
        piniaCreated: true,
        routerInstalled: true,
        routerMounted: true,
        saveRead: false,
        uiIpcResponseDelivered: false,
        commandDispatched: false,
        thirdPartyRegistryPublished: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        realRuntimePublicationCommitCalled: true,
        transactionCommitted: false,
        runtimePublicationCommitted: true,
        packageFilesWritten: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false,
        rollbackExecuted: false,
        diagnosticsWritten: false
      }
    }
    Object.defineProperty(appStartupHostResult, 'app', {
      enumerable: true,
      get() {
        hostileGetterRead = true
        throw new Error('C:\\secret\\app-handle')
      }
    })

    const summary = createThirdPartyAppStartupHostRuntimeProbeSummary(appStartupHostResult)

    expect(summary).toMatchObject({
      schemaVersion: 1,
      observed: true,
      status: 'accepted',
      enabled: true,
      sourceCalled: true,
      targetPackageId: 'sample_pack',
      appStartupHostConnectionSourceStatus: 'accepted',
      selectedPackageCount: 1,
      blockedPackageCount: 0,
      loadOrderCount: 1,
      registryCount: 54,
      entryCount: 4243,
      packageCount: 1,
      lockfileHashPresent: true,
      effects: {
        realAppStartupHostCalled: true,
        appStartupHostConnectionAccepted: true,
        appBootstrapContinuationAllowed: true,
        officialContentBootstrapped: true,
        runtimeContentRegistryPublished: true,
        thirdPartyStartupGateCompleted: true,
        thirdPartyStartupGateAllowed: true,
        gameAppCreated: true,
        piniaCreated: true,
        routerInstalled: true,
        routerMounted: true,
        thirdPartyRegistryPublished: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        realRuntimePublicationCommitCalled: true,
        runtimePublicationCommitted: true,
        packageFilesWritten: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    })
    expect(hostileGetterRead).toBe(false)
    expect(JSON.stringify(summary)).not.toContain('C:\\secret')
    expect(JSON.stringify(summary)).not.toContain('app-handle')
    expect(JSON.stringify(summary)).not.toContain('window')
    expect(JSON.stringify(summary)).not.toContain('document')
  })

  it('summarizes Web IndexedDB startup persistent-state probe evidence without exposing hosts', () => {
    const summary = createThirdPartyStartupGateRuntimeProbeSummary({
      status: 'ready',
      enabled: true,
      appBootstrapContinuationAllowed: true,
      appStartupHostConnectionSourceStatus: 'accepted',
      startupPersistentStateSourceStatus: 'ready',
      startupPersistentStateSourceKind: 'web-indexeddb',
      startupPersistentStateSourceHostMode: 'web-indexeddb-startup-persistent-state',
      startupPersistentStateInjectedSourceHostMode: 'web-indexeddb-startup-persistent-state',
      webResponseDeliveryStartupGateHandoffStatus: 'ready',
      responseDeliveryStartupGateHandoffPrepared: true,
      webResponseDeliveryAcknowledgementConsumed: true,
      targetPackageId: 'sample_pack',
      selectedPackageIds: ['sample_pack'],
      blockedPackageIds: [],
      loadOrder: ['sample_pack'],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      lockfileHash: `sha256:${'d'.repeat(64)}`,
      persistentStateProofs: {
        transactionLogCommitted: true,
        packageStateMatched: true,
        settingsStateMatched: true,
        modLockStateMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true
      },
      effects: {
        appStartupHostConnectionSourceCalled: true,
        appStartupHostConnectionAccepted: true,
        appBootstrapContinuationAllowed: true,
        startupPersistentStateSourceCalled: true,
        startupStateSnapshotAccepted: true,
        thirdPartyRegistryPublished: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true
      }
    }, true)

    expect(summary).toMatchObject({
      observed: true,
      status: 'ready',
      startupPersistentStateSourceStatus: 'ready',
      startupPersistentStateSourceKind: 'web-indexeddb',
      startupPersistentStateSourceHostMode: 'web-indexeddb-startup-persistent-state',
      startupPersistentStateInjectedSourceHostMode: 'web-indexeddb-startup-persistent-state',
      startupPersistentStateSourceCalled: true,
      startupStateSnapshotAccepted: true,
      startupPersistentStateReadFromIndexedDb: true,
      persistentStateProofsAccepted: true,
      webResponseDeliveryStartupGateHandoffStatus: 'ready',
      responseDeliveryStartupGateHandoffPrepared: true,
      webResponseDeliveryAcknowledgementConsumed: true,
      selectedPackageCount: 1,
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      effects: {
        appStartupHostConnectionSourceCalled: true,
        appStartupHostConnectionAccepted: true,
        startupPersistentStateSourceCalled: true,
        startupStateSnapshotAccepted: true,
        thirdPartyRegistryPublished: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        transactionCommitted: false,
        packageFilesWritten: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    })
    expect(JSON.stringify(summary)).not.toContain('indexedDb')
    expect(JSON.stringify(summary)).not.toContain('IndexedDB')
    expect(JSON.stringify(summary)).not.toContain('window')
    expect(JSON.stringify(summary)).not.toContain('document')
    expect(JSON.stringify(summary)).not.toContain('C:\\')
  })

  it('preserves startup candidate product probe fallbacks from the startup gate result', () => {
    const summary = createThirdPartyStartupGateRuntimeProbeSummary({
      status: 'ready',
      enabled: true,
      appBootstrapContinuationAllowed: true,
      appStartupHostConnectionSourceStatus: 'accepted',
      startupPersistentStateSourceStatus: 'ready',
      startupPersistentStateSourceKind: 'web-indexeddb',
      targetPackageId: 'product_probe_pack',
      productProbeItemNameFallback: 'Product Probe Linen Ribbon',
      productProbeRecipeNameFallback: 'Product Probe Ribbon Snack',
      productProbeShopOfferNameFallback: 'Product Probe Ribbon Stand',
      selectedPackageIds: ['product_probe_pack'],
      blockedPackageIds: [],
      loadOrder: ['product_probe_pack'],
      registryCount: 54,
      entryCount: 4245,
      packageCount: 1,
      lockfileHash: `sha256:${'d'.repeat(64)}`,
      effects: {
        appStartupHostConnectionSourceCalled: true,
        appStartupHostConnectionAccepted: true,
        appBootstrapContinuationAllowed: true,
        startupPersistentStateSourceCalled: true,
        startupStateSnapshotAccepted: true,
        thirdPartyRegistryPublished: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        realRuntimePublicationCommitCalled: true,
        runtimePublicationCommitted: true
      }
    }, true)

    expect(summary).toMatchObject({
      targetPackageId: 'product_probe_pack',
      productProbeItemNameFallback: 'Product Probe Linen Ribbon',
      productProbeRecipeNameFallback: 'Product Probe Ribbon Snack',
      productProbeShopOfferNameFallback: 'Product Probe Ribbon Stand'
    })
  })

  it('summarizes the probe-only Web renderer UI/IPC delivery bridge without exposing hosts', async () => {
    const runtimeHost = new EventTarget()

    const probe = await runThirdPartyRendererUiIpcProductProbe(runtimeHost)
    const summary = createThirdPartyRendererUiIpcRuntimeProbeSummary(
      probe.responseDeliveryResult,
      probe.deliveryInputSource,
      probe.webDomResponseEventObserved
    )

    expect(probe.webDomResponseEventObserved).toBe(true)
    expect(summary).toMatchObject({
      schemaVersion: 1,
      observed: true,
      status: 'ready',
      deliveryInputSource: 'synthetic-success-handoff',
      selectedPlatform: 'web',
      targetPackageId: 'product_probe_pack',
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success',
      selectedPackageCount: 1,
      blockedPackageCount: 0,
      loadOrderCount: 1,
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      lockfileHashPresent: true,
      platformResponseDelivered: true,
      deliveryAcknowledgementConsumed: true,
      webDomResponseEventObserved: true,
      effects: {
        uiIpcResponseDelivered: true,
        electronIpcResponseSent: false,
        webUiResponsePublished: true,
        androidUiResponsePublished: false,
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
    expect(JSON.stringify(summary)).not.toContain('EventTarget')
    expect(JSON.stringify(summary)).not.toContain('window')
    expect(JSON.stringify(summary)).not.toContain('document')
    expect(JSON.stringify(summary)).not.toContain('C:\\')
  })

  it('summarizes the probe-only Electron renderer UI/IPC delivery bridge from preload', async () => {
    const runtimeHost = new EventTarget() as EventTarget & {
      electronAPI?: {
        deliverThirdPartyDataPackResponse: (
          envelope: ThirdPartyDataPackUiIpcResultEnvelope
        ) => unknown
      }
    }
    const deliverThirdPartyDataPackResponse = vi.fn((
      envelope: ThirdPartyDataPackUiIpcResultEnvelope
    ) => acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope(envelope))
    Object.defineProperty(runtimeHost, 'electronAPI', {
      configurable: true,
      value: { deliverThirdPartyDataPackResponse }
    })

    const probe = await runThirdPartyRendererUiIpcProductProbe(runtimeHost)
    const summary = createThirdPartyRendererUiIpcRuntimeProbeSummary(
      probe.responseDeliveryResult,
      probe.deliveryInputSource,
      probe.webDomResponseEventObserved
    )

    expect(deliverThirdPartyDataPackResponse).toHaveBeenCalledOnce()
    expect(probe.webDomResponseEventObserved).toBe(true)
    expect(summary).toMatchObject({
      schemaVersion: 1,
      observed: true,
      status: 'ready',
      deliveryInputSource: 'synthetic-success-handoff',
      selectedPlatform: 'electron',
      targetPackageId: 'product_probe_pack',
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success',
      selectedPackageCount: 1,
      blockedPackageCount: 0,
      loadOrderCount: 1,
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      lockfileHashPresent: true,
      platformResponseDelivered: true,
      deliveryAcknowledgementConsumed: true,
      webDomResponseEventObserved: true,
      effects: {
        uiIpcResponseDelivered: true,
        electronIpcResponseSent: true,
        webUiResponsePublished: false,
        androidUiResponsePublished: false,
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
    expect(JSON.stringify(summary)).not.toContain('electronAPI')
    expect(JSON.stringify(summary)).not.toContain('window')
    expect(JSON.stringify(summary)).not.toContain('document')
    expect(JSON.stringify(summary)).not.toContain('C:\\')
  })

  it('marks install transaction finalization as the renderer UI/IPC probe input source', async () => {
    const runtimeHost = new EventTarget() as EventTarget & {
      electronAPI?: {
        deliverThirdPartyDataPackResponse: (
          envelope: ThirdPartyDataPackUiIpcResultEnvelope
        ) => unknown
      }
    }
    Object.defineProperty(runtimeHost, 'electronAPI', {
      configurable: true,
      value: {
        deliverThirdPartyDataPackResponse: (
          envelope: ThirdPartyDataPackUiIpcResultEnvelope
        ) => acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope(envelope)
      }
    })

    const probe = await runThirdPartyRendererUiIpcProductProbe(runtimeHost, {
      deliveryInputSource: 'install-transaction-commit-finalization'
    })
    const summary = createThirdPartyRendererUiIpcRuntimeProbeSummary(
      probe.responseDeliveryResult,
      probe.deliveryInputSource,
      probe.webDomResponseEventObserved
    )

    expect(summary).toMatchObject({
      observed: true,
      status: 'ready',
      deliveryInputSource: 'install-transaction-commit-finalization',
      selectedPlatform: 'electron',
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success',
      platformResponseDelivered: true,
      deliveryAcknowledgementConsumed: true,
      webDomResponseEventObserved: true
    })
    expect(JSON.stringify(summary)).not.toContain('electronAPI')
    expect(JSON.stringify(summary)).not.toContain('C:\\')
  })

  it('summarizes the visible import renderer live registry probe without exposing hosts', () => {
    let hostileGetterRead = false
    const probeResult = {
      status: 'ready',
      entrypoint: 'main-menu-panel',
      mainMenuPanelOpened: true,
      panelImportButtonClicked: true,
      defaultFileInputSelectorUsed: true,
      targetPackageId: 'product_probe_pack',
      itemId: 'product_probe_pack:linen_ribbon',
      itemNameFallback: 'Product Probe Linen Ribbon',
      recipeId: 'product_probe_pack:linen_ribbon_snack',
      recipeNameFallback: 'Product Probe Ribbon Snack',
      shopOfferId: 'product_probe_pack:shop/wanwupu/linen_ribbon/0',
      shopOfferNameFallback: 'Product Probe Ribbon Stand',
      fileCount: 5,
      pickStatus: 'ready',
      panelStatusLabels: {
        importStatus: '已暂存',
        targetPackage: 'product_probe_pack',
        preflightStatus: 'deferred',
        dispatchStatus: 'dispatched',
        persistenceStatus: '已写入 IndexedDB',
        hostAckStatus: '已确认（Electron）',
        installOutcomeStatus: '提交后校验已确认',
        uiIpcDeliveryStatus: '已送达（Electron）',
        runtimePublicationStatus: '已确认',
        liveRegistryStatus: '已切换',
        appStartupStatus: '已接入已挂载应用',
        startupPersistentStateStatus: '已写入'
      },
      dispatchPreflightStatus: 'deferred',
      discoveryStatus: 'completed',
      transactionCommandDispatcherHostKind: 'renderer',
      transactionCommandDispatcherSourceStatus: 'dispatched',
      installCommandPostCommitAcknowledgementStatus: 'ready',
      installTransactionLogPreparedStatus: 'prepared',
      installTransactionLogPreparedPersistentReadVerificationStatus: 'verified',
      installTransactionCommitFinalizationStatus: 'committed',
      postCommitUiIpcDeliveryContinuationStatus: 'ready',
      ordinaryInstallTransactionTerminalConnectionStatus: 'ready',
      runtimePublicationCommitAfterPostCommitVerificationStatus: 'accepted',
      runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: 'swapped',
      runtimePublicationCommitAppStartupReadinessStatus: 'ready',
      runtimePublicationCommitAppStartupHostConnectionStatus: 'accepted',
      selectedPackageCount: 1,
      blockedPackageCount: 0,
      loadOrderCount: 1,
      registryCount: 54,
      entryCount: 4245,
      packageCount: 1,
      diagnosticsCount: 9,
      contentAccessItemVisibleBefore: false,
      contentAccessItemVisibleAfter: true,
      contentAccessRecipeVisibleBefore: false,
      contentAccessRecipeVisibleAfter: true,
      contentAccessShopOfferVisibleBefore: false,
      contentAccessShopOfferVisibleAfter: true,
      effects: {
        commandDispatched: true,
        packageFilesWritten: true,
        settingsWritten: true,
        lockfileWritten: true,
        rendererLiveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        uiIpcResponseDelivered: true,
        transactionCommitted: true,
        transactionLogPrepared: true,
        transactionLogRead: true,
        realNormalStartupHostCalled: true,
        realAppStartupHostCalled: true,
        gameAppCreated: true,
        piniaCreated: true,
        routerMounted: true,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: true,
        rollbackExecuted: false,
        diagnosticsWritten: false
      }
    }
    Object.defineProperty(probeResult, 'reason', {
      enumerable: true,
      get() {
        hostileGetterRead = true
        throw new Error('C:\\secret\\visible-import')
      }
    })
    Object.defineProperty(probeResult.panelStatusLabels, 'unsafeHandle', {
      enumerable: true,
      get() {
        hostileGetterRead = true
        throw new Error('C:\\secret\\visible-import-panel')
      }
    })

    const summary = createThirdPartyVisibleImportRuntimeProbeSummary(probeResult)

    expect(summary).toMatchObject({
      schemaVersion: 1,
      observed: true,
      status: 'ready',
      entrypoint: 'main-menu-panel',
      mainMenuPanelOpened: true,
      panelImportButtonClicked: true,
      defaultFileInputSelectorUsed: true,
      targetPackageId: 'product_probe_pack',
      itemId: 'product_probe_pack:linen_ribbon',
      itemNameFallback: 'Product Probe Linen Ribbon',
      recipeId: 'product_probe_pack:linen_ribbon_snack',
      recipeNameFallback: 'Product Probe Ribbon Snack',
      shopOfferId: 'product_probe_pack:shop/wanwupu/linen_ribbon/0',
      shopOfferNameFallback: 'Product Probe Ribbon Stand',
      fileCount: 5,
      pickStatus: 'ready',
      panelStatusLabels: {
        importStatus: '已暂存',
        targetPackage: 'product_probe_pack',
        preflightStatus: 'deferred',
        dispatchStatus: 'dispatched',
        persistenceStatus: '已写入 IndexedDB',
        hostAckStatus: '已确认（Electron）',
        installOutcomeStatus: '提交后校验已确认',
        uiIpcDeliveryStatus: '已送达（Electron）',
        runtimePublicationStatus: '已确认',
        liveRegistryStatus: '已切换',
        appStartupStatus: '已接入已挂载应用',
        startupPersistentStateStatus: '已写入'
      },
      dispatchPreflightStatus: 'deferred',
      discoveryStatus: 'completed',
      transactionCommandDispatcherHostKind: 'renderer',
      transactionCommandDispatcherSourceStatus: 'dispatched',
      installCommandPostCommitAcknowledgementStatus: 'ready',
      installTransactionLogPreparedStatus: 'prepared',
      installTransactionLogPreparedPersistentReadVerificationStatus: 'verified',
      installTransactionCommitFinalizationStatus: 'committed',
      postCommitUiIpcDeliveryContinuationStatus: 'ready',
      ordinaryInstallTransactionTerminalConnectionStatus: 'ready',
      runtimePublicationCommitAfterPostCommitVerificationStatus: 'accepted',
      runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: 'swapped',
      runtimePublicationCommitAppStartupReadinessStatus: 'ready',
      runtimePublicationCommitAppStartupHostConnectionStatus: 'accepted',
      selectedPackageCount: 1,
      blockedPackageCount: 0,
      loadOrderCount: 1,
      registryCount: 54,
      entryCount: 4245,
      packageCount: 1,
      diagnosticsCount: 9,
      contentAccessItemVisibleBefore: false,
      contentAccessItemVisibleAfter: true,
      contentAccessRecipeVisibleBefore: false,
      contentAccessRecipeVisibleAfter: true,
      contentAccessShopOfferVisibleBefore: false,
      contentAccessShopOfferVisibleAfter: true,
      effects: {
        commandDispatched: true,
        packageFilesWritten: true,
        settingsWritten: true,
        lockfileWritten: true,
        rendererLiveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        uiIpcResponseDelivered: true,
        transactionCommitted: true,
        transactionLogPrepared: true,
        transactionLogRead: true,
        realNormalStartupHostCalled: true,
        realAppStartupHostCalled: true,
        gameAppCreated: true,
        piniaCreated: true,
        routerMounted: true,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: true,
        rollbackExecuted: false,
        diagnosticsWritten: false
      }
    })
    expect(hostileGetterRead).toBe(false)
    expect(JSON.stringify(summary)).not.toContain('C:\\secret')
    expect(JSON.stringify(summary)).not.toContain('electronAPI')
    expect(JSON.stringify(summary)).not.toContain('window')
    expect(JSON.stringify(summary)).not.toContain('document')
  })

  it('summarizes the probe-only Electron install command dispatch bridge from preload', async () => {
    const dispatchThirdPartyDataPackInstallCommand = vi.fn(envelope =>
      acknowledgeThirdPartyDataPackElectronInstallCommandDispatchIpcEnvelope(envelope))
    const runtimeHost = {
      electronAPI: {
        dispatchThirdPartyDataPackInstallCommand
      }
    }

    const result = await runThirdPartyElectronInstallCommandDispatchProductProbe(runtimeHost)
    const summary = createThirdPartyElectronInstallCommandDispatchRuntimeProbeSummary(result)

    expect(dispatchThirdPartyDataPackInstallCommand).toHaveBeenCalledOnce()
    expect(summary).toMatchObject({
      schemaVersion: 1,
      observed: true,
      status: 'dispatched',
      requestedCommandId: 'install',
      targetPackageId: 'product_probe_pack',
      selectedPackageCount: 0,
      blockedPackageCount: 0,
      loadOrderCount: 0,
      lockfileHashPresent: false,
      diagnosticsCount: 0,
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
      }
    })
    expect(JSON.stringify(summary)).not.toContain('electronAPI')
    expect(JSON.stringify(summary)).not.toContain('window')
    expect(JSON.stringify(summary)).not.toContain('document')
    expect(JSON.stringify(summary)).not.toContain('C:\\')
  })

  it('omits unsafe package identifiers from third-party startup gate probe summaries', () => {
    expect(createThirdPartyStartupGateRuntimeProbeSummary({
      status: 'ready',
      targetPackageId: 'C:/Users/LENOVO/mods/sample_pack',
      selectedPackageIds: ['sample_pack']
    })).toMatchObject({
      observed: true,
      status: 'ready',
      selectedPackageCount: 1
    })
    expect(createThirdPartyStartupGateRuntimeProbeSummary({
      status: 'ready',
      targetPackageId: 'C:/Users/LENOVO/mods/sample_pack',
      startupPersistentStateSourceHostMode: 'C:/Users/LENOVO/mods/sample_pack',
      selectedPackageIds: ['sample_pack']
    }).targetPackageId).toBeUndefined()
    expect(createThirdPartyStartupGateRuntimeProbeSummary({
      status: 'ready',
      targetPackageId: 'sample_pack',
      startupPersistentStateSourceHostMode: 'C:/Users/LENOVO/mods/sample_pack',
      startupPersistentStateInjectedSourceHostMode: 'unknown-host-mode',
      selectedPackageIds: ['sample_pack']
    })).not.toHaveProperty('startupPersistentStateSourceHostMode')
    expect(createThirdPartyStartupGateRuntimeProbeSummary({
      status: 'ready',
      targetPackageId: 'sample_pack',
      startupPersistentStateSourceHostMode: 'C:/Users/LENOVO/mods/sample_pack',
      startupPersistentStateInjectedSourceHostMode: 'unknown-host-mode',
      selectedPackageIds: ['sample_pack']
    })).not.toHaveProperty('startupPersistentStateInjectedSourceHostMode')
  })

  it('reports cache rebuild diagnostics without exposing filesystem details', async () => {
    await bootstrapOfficialContent()
    const reportContentRuntimeProbe = vi.fn()
    Object.defineProperty(window, 'electronAPI', {
      configurable: true,
      value: {
        readOfficialRegistryCache: vi.fn(async () => null),
        writeOfficialRegistryCache: vi.fn(async () => {
          throw new Error('simulated cache write failure at C:\\secret\\cache.json')
        }),
        reportContentRuntimeProbe
      }
    })

    await expect(refreshOfficialRegistryDiskCache()).resolves.toMatchObject({
      status: 'failed'
    })

    const report = createOfficialContentRuntimeReport()
    expect(report.diskCache).toMatchObject({
      status: 'not-configured',
      writeStatus: 'failed',
      diagnostics: [{
        code: 'CACHE-WRITE-001',
        stage: 'official-content.disk-cache.write',
        severity: expect.any(String),
        recovery: 'retry'
      }]
    })
    expect(JSON.stringify(report)).not.toContain('C:\\secret')
  }, 30_000)
})
