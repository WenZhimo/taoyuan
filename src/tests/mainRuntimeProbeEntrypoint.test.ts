import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const bootstrapResult = {
    app: { id: 'app' },
    pinia: { id: 'pinia' },
    router: { id: 'router' }
  }
  return {
    acknowledgeThirdPartyDataPackMountedAppStartupHostConnection: vi.fn(async() => ({
      status: 'ready'
    })),
    bootstrapApplication: vi.fn(async(dependencies: {
      afterMount?: (result: typeof bootstrapResult) => unknown | Promise<unknown>
    }) => {
      await dependencies.afterMount?.(bootstrapResult)
      return bootstrapResult
    }),
    bootstrapOfficialContent: vi.fn(async() => ({ registry: 'official' })),
    bootstrapInstalledStateThirdPartyDataPackStartupGate: vi.fn(async() => ({
      status: 'ready'
    })),
    createApp: vi.fn(() => ({ use: vi.fn(), mount: vi.fn() })),
    createPinia: vi.fn(() => ({ use: vi.fn() })),
    createThirdPartyDataPackInstalledStateStartupGateBootstrapSource: vi.fn(() =>
      vi.fn(async() => ({ status: 'ready' }))
    ),
    createThirdPartyStartupGateProductProbeBootstrapSource: vi.fn(() =>
      vi.fn(async() => ({ status: 'ready' }))
    ),
    createThirdPartyStartupPersistentStateProductProbeBootstrapSource: vi.fn(() =>
      vi.fn(async() => ({ status: 'ready' }))
    ),
    mountAfterRouterReady: vi.fn(async() => undefined),
    publishContentRuntimeProbe: vi.fn(),
    publishOfficialContentRegistrySet: vi.fn(async() => undefined),
    publishThirdPartyDataPackMountedAppStartupHostEvidence: vi.fn(),
    refreshOfficialRegistryDiskCache: vi.fn(async() => undefined),
    reportApplicationStartupFailure: vi.fn(),
    runThirdPartyElectronInstallCommandDispatchProductProbe: vi.fn(async() => ({
      status: 'ready'
    })),
    runThirdPartyRendererUiIpcProductProbe: vi.fn(async() => ({
      deliveryInputSource: 'synthetic-success-handoff',
      responseDeliveryResult: { status: 'ready' },
      webDomResponseEventObserved: true
    })),
    runThirdPartyVisibleDisableProductProbe: vi.fn(async() => ({ status: 'ready' })),
    runThirdPartyVisibleImportProductProbe: vi.fn(async() => ({ status: 'ready' })),
    runThirdPartyVisibleUninstallProductProbe: vi.fn(async() => ({ status: 'ready' })),
    thirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline: vi.fn(
      async() => ({ status: 'ready' })
    )
  }
})

vi.mock('vue', () => ({
  createApp: mocks.createApp,
  toRaw: (value: unknown) => value
}))

vi.mock('pinia', () => ({
  createPinia: mocks.createPinia
}))

vi.mock('@/bootstrap', () => ({
  bootstrapApplication: mocks.bootstrapApplication,
  mountAfterRouterReady: mocks.mountAfterRouterReady,
  reportApplicationStartupFailure: mocks.reportApplicationStartupFailure
}))

vi.mock('@/domain/mods/officialContentBootstrap', () => ({
  bootstrapOfficialContent: mocks.bootstrapOfficialContent
}))

vi.mock('@/domain/mods/liveContentRegistry', () => ({
  publishOfficialContentRegistrySet: mocks.publishOfficialContentRegistrySet
}))

vi.mock('@/domain/mods/officialRegistryCacheRefresh', () => ({
  refreshOfficialRegistryDiskCache: mocks.refreshOfficialRegistryDiskCache
}))

vi.mock('@/domain/mods/thirdPartyDataPackInstalledStateStartupGateBootstrapSource', () => ({
  bootstrapInstalledStateThirdPartyDataPackStartupGate:
    mocks.bootstrapInstalledStateThirdPartyDataPackStartupGate,
  createThirdPartyDataPackInstalledStateStartupGateBootstrapSource:
    mocks.createThirdPartyDataPackInstalledStateStartupGateBootstrapSource
}))

vi.mock('@/domain/mods/thirdPartyDataPackMountedAppStartupHostConnection', () => ({
  acknowledgeThirdPartyDataPackMountedAppStartupHostConnection:
    mocks.acknowledgeThirdPartyDataPackMountedAppStartupHostConnection,
  publishThirdPartyDataPackMountedAppStartupHostEvidence:
    mocks.publishThirdPartyDataPackMountedAppStartupHostEvidence
}))

vi.mock('@/domain/mods/thirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline', () => ({
  thirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline:
    mocks.thirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline
}))

vi.mock('@/runtime/thirdPartyStartupGateProductProbe', () => ({
  createThirdPartyStartupGateProductProbeBootstrapSource:
    mocks.createThirdPartyStartupGateProductProbeBootstrapSource,
  createThirdPartyStartupPersistentStateProductProbeBootstrapSource:
    mocks.createThirdPartyStartupPersistentStateProductProbeBootstrapSource
}))

vi.mock('@/runtime/thirdPartyVisibleImportProductProbe', () => ({
  runThirdPartyVisibleImportProductProbe: mocks.runThirdPartyVisibleImportProductProbe,
  runThirdPartyVisibleDisableProductProbe: mocks.runThirdPartyVisibleDisableProductProbe,
  runThirdPartyVisibleUninstallProductProbe: mocks.runThirdPartyVisibleUninstallProductProbe
}))

vi.mock('@/runtime/thirdPartyRendererUiIpcProductProbe', () => ({
  runThirdPartyRendererUiIpcProductProbe: mocks.runThirdPartyRendererUiIpcProductProbe
}))

vi.mock('@/runtime/thirdPartyElectronInstallCommandDispatchProductProbe', () => ({
  runThirdPartyElectronInstallCommandDispatchProductProbe:
    mocks.runThirdPartyElectronInstallCommandDispatchProductProbe
}))

vi.mock('@/runtime/contentRuntimeProbe', () => ({
  publishContentRuntimeProbe: mocks.publishContentRuntimeProbe
}))

describe('main runtime probe entrypoint', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    window.history.replaceState(null, '', '/')
  })

  it('runs the visible import product probe for rollback-only Electron query wiring', async() => {
    const visibleImportResult = {
      status: 'ready',
      operation: 'rollback'
    }
    mocks.runThirdPartyVisibleImportProductProbe.mockResolvedValueOnce(visibleImportResult)
    window.history.replaceState(
      null,
      '',
      '/?taoyuanContentProbe=1&taoyuanThirdPartyVisibleImportRollbackProbe=1'
    )

    await import('@/main')

    await vi.waitFor(() => {
      expect(mocks.runThirdPartyVisibleImportProductProbe).toHaveBeenCalledWith({
        entrypoint: 'main-menu-panel',
        operation: 'rollback',
        persistSource: false
      })
    })
    expect(mocks.runThirdPartyRendererUiIpcProductProbe).not.toHaveBeenCalled()
    expect(mocks.publishContentRuntimeProbe).toHaveBeenCalledWith(
      expect.objectContaining({
        thirdPartyVisibleImportResult: visibleImportResult
      })
    )
  })

  it('runs the visible import product probe for retryable failure Electron query wiring', async() => {
    const visibleImportResult = {
      status: 'ready',
      operation: 'failure'
    }
    mocks.runThirdPartyVisibleImportProductProbe.mockResolvedValueOnce(visibleImportResult)
    window.history.replaceState(
      null,
      '',
      '/?taoyuanContentProbe=1&taoyuanThirdPartyVisibleImportFailureProbe=1'
    )

    await import('@/main')

    await vi.waitFor(() => {
      expect(mocks.runThirdPartyVisibleImportProductProbe).toHaveBeenCalledWith({
        entrypoint: 'main-menu-panel',
        operation: 'failure',
        persistSource: false
      })
    })
    expect(mocks.runThirdPartyRendererUiIpcProductProbe).not.toHaveBeenCalled()
    expect(mocks.publishContentRuntimeProbe).toHaveBeenCalledWith(
      expect.objectContaining({
        thirdPartyVisibleImportResult: visibleImportResult
      })
    )
  })

  it('runs the visible import product probe for blocked replacement query wiring', async() => {
    const visibleImportResult = {
      status: 'blocked',
      operation: 'upgrade'
    }
    mocks.runThirdPartyVisibleImportProductProbe.mockResolvedValueOnce(visibleImportResult)
    window.history.replaceState(
      null,
      '',
      '/?taoyuanContentProbe=1&taoyuanThirdPartyVisibleUpgradeProbe=1&taoyuanThirdPartyVisibleUpgradeExpectBlocked=1'
    )

    await import('@/main')

    await vi.waitFor(() => {
      expect(mocks.runThirdPartyVisibleImportProductProbe).toHaveBeenCalledWith({
        entrypoint: 'main-menu-panel',
        operation: 'upgrade',
        persistSource: false,
        expectBlocked: true
      })
    })
    expect(mocks.runThirdPartyRendererUiIpcProductProbe).not.toHaveBeenCalled()
    expect(mocks.publishContentRuntimeProbe).toHaveBeenCalledWith(
      expect.objectContaining({
        thirdPartyVisibleImportResult: visibleImportResult
      })
    )
  })

  it('treats replacement write-failure query wiring as a blocked product probe', async() => {
    const visibleImportResult = {
      status: 'blocked',
      operation: 'upgrade'
    }
    mocks.runThirdPartyVisibleImportProductProbe.mockResolvedValueOnce(visibleImportResult)
    window.history.replaceState(
      null,
      '',
      '/?taoyuanContentProbe=1&taoyuanThirdPartyVisibleUpgradeProbe=1&taoyuanThirdPartyVisibleUpgradeFailAfterModLockWrite=1'
    )

    await import('@/main')

    await vi.waitFor(() => {
      expect(mocks.runThirdPartyVisibleImportProductProbe).toHaveBeenCalledWith({
        entrypoint: 'main-menu-panel',
        operation: 'upgrade',
        persistSource: false,
        expectBlocked: true
      })
    })
    expect(mocks.runThirdPartyRendererUiIpcProductProbe).not.toHaveBeenCalled()
    expect(mocks.publishContentRuntimeProbe).toHaveBeenCalledWith(
      expect.objectContaining({
        thirdPartyVisibleImportResult: visibleImportResult
      })
    )
  })

  it('passes blocked ZIP replacement query wiring into the product probe', async() => {
    const visibleImportResult = {
      status: 'blocked',
      operation: 'upgrade',
      archiveImportButtonClicked: true
    }
    mocks.runThirdPartyVisibleImportProductProbe.mockResolvedValueOnce(visibleImportResult)
    window.history.replaceState(
      null,
      '',
      '/?taoyuanContentProbe=1&taoyuanThirdPartyVisibleUpgradeProbe=1&taoyuanThirdPartyVisibleUpgradeExpectBlocked=1&taoyuanThirdPartyVisibleArchiveImportProbe=1'
    )

    await import('@/main')

    await vi.waitFor(() => {
      expect(mocks.runThirdPartyVisibleImportProductProbe).toHaveBeenCalledWith({
        entrypoint: 'main-menu-panel',
        operation: 'upgrade',
        persistSource: false,
        archiveImport: true,
        expectBlocked: true
      })
    })
    expect(mocks.runThirdPartyRendererUiIpcProductProbe).not.toHaveBeenCalled()
    expect(mocks.publishContentRuntimeProbe).toHaveBeenCalledWith(
      expect.objectContaining({
        thirdPartyVisibleImportResult: visibleImportResult
      })
    )
  })

  it('passes visible ZIP archive import probe query wiring into the product probe', async() => {
    const visibleImportResult = {
      status: 'ready',
      archiveImportButtonClicked: true
    }
    mocks.runThirdPartyVisibleImportProductProbe.mockResolvedValueOnce(visibleImportResult)
    window.history.replaceState(
      null,
      '',
      '/?taoyuanContentProbe=1&taoyuanThirdPartyVisibleImportProbe=1&taoyuanThirdPartyVisibleImportPersistSource=1&taoyuanThirdPartyVisibleArchiveImportProbe=1'
    )

    await import('@/main')

    await vi.waitFor(() => {
      expect(mocks.runThirdPartyVisibleImportProductProbe).toHaveBeenCalledWith({
        entrypoint: 'main-menu-panel',
        operation: 'install',
        persistSource: true,
        archiveImport: true
      })
    })
    expect(mocks.runThirdPartyRendererUiIpcProductProbe).not.toHaveBeenCalled()
    expect(mocks.publishContentRuntimeProbe).toHaveBeenCalledWith(
      expect.objectContaining({
        thirdPartyVisibleImportResult: visibleImportResult
      })
    )
  })

  it('passes dependency ZIP archive import query wiring into the product probe', async() => {
    const visibleImportResult = {
      status: 'ready',
      archiveImportButtonClicked: true,
      dependencyPackageId: 'a_product_probe_library'
    }
    mocks.runThirdPartyVisibleImportProductProbe.mockResolvedValueOnce(visibleImportResult)
    window.history.replaceState(
      null,
      '',
      '/?taoyuanContentProbe=1&taoyuanThirdPartyVisibleImportProbe=1&taoyuanThirdPartyVisibleImportPersistSource=1&taoyuanThirdPartyVisibleArchiveImportProbe=1&taoyuanThirdPartyVisibleDependencyProbe=1'
    )

    await import('@/main')

    await vi.waitFor(() => {
      expect(mocks.runThirdPartyVisibleImportProductProbe).toHaveBeenCalledWith({
        entrypoint: 'main-menu-panel',
        operation: 'install',
        persistSource: true,
        includeDependency: true,
        archiveImport: true
      })
    })
    expect(mocks.runThirdPartyRendererUiIpcProductProbe).not.toHaveBeenCalled()
    expect(mocks.publishContentRuntimeProbe).toHaveBeenCalledWith(
      expect.objectContaining({
        thirdPartyVisibleImportResult: visibleImportResult
      })
    )
  })

  it('runs the visible disable product probe for installed package query wiring', async() => {
    const visibleDisableResult = {
      status: 'ready',
      operation: 'disable',
      targetPackageId: 'product_probe_pack',
      dependencyPackageId: 'a_product_probe_library'
    }
    mocks.runThirdPartyVisibleDisableProductProbe.mockResolvedValueOnce(visibleDisableResult)
    window.history.replaceState(
      null,
      '',
      '/?taoyuanContentProbe=1&taoyuanThirdPartyVisibleDisableProbe=1&taoyuanThirdPartyVisibleDependencyProbe=1'
    )

    await import('@/main')

    await vi.waitFor(() => {
      expect(mocks.runThirdPartyVisibleDisableProductProbe).toHaveBeenCalledWith({
        targetPackageId: 'product_probe_pack',
        includeDependency: true,
        expectBlocked: false
      })
    })
    expect(mocks.runThirdPartyVisibleImportProductProbe).not.toHaveBeenCalled()
    expect(mocks.runThirdPartyRendererUiIpcProductProbe).not.toHaveBeenCalled()
    expect(mocks.publishContentRuntimeProbe).toHaveBeenCalledWith(
      expect.objectContaining({
        thirdPartyVisibleImportResult: visibleDisableResult
      })
    )
  })

  it('routes Web visible disable write-failure probes as blocked management runs', async() => {
    const visibleDisableResult = {
      status: 'blocked',
      operation: 'disable',
      targetPackageId: 'product_probe_pack'
    }
    mocks.runThirdPartyVisibleDisableProductProbe.mockResolvedValueOnce(visibleDisableResult)
    window.history.replaceState(
      null,
      '',
      '/?taoyuanContentProbe=1&taoyuanThirdPartyVisibleDisableProbe=1&taoyuanThirdPartyVisibleDisableFailAfterModLockWrite=1'
    )

    await import('@/main')

    await vi.waitFor(() => {
      expect(mocks.runThirdPartyVisibleDisableProductProbe).toHaveBeenCalledWith({
        targetPackageId: 'product_probe_pack',
        expectBlocked: true
      })
    })
    expect(mocks.runThirdPartyVisibleImportProductProbe).not.toHaveBeenCalled()
    expect(mocks.runThirdPartyRendererUiIpcProductProbe).not.toHaveBeenCalled()
    expect(mocks.publishContentRuntimeProbe).toHaveBeenCalledWith(
      expect.objectContaining({
        thirdPartyVisibleImportResult: visibleDisableResult
      })
    )
  })

  it('routes Web visible uninstall write-failure probes as blocked management runs', async() => {
    const visibleUninstallResult = {
      status: 'blocked',
      operation: 'uninstall',
      targetPackageId: 'product_probe_pack'
    }
    mocks.runThirdPartyVisibleUninstallProductProbe.mockResolvedValueOnce(visibleUninstallResult)
    window.history.replaceState(
      null,
      '',
      '/?taoyuanContentProbe=1&taoyuanThirdPartyVisibleUninstallProbe=1&taoyuanThirdPartyVisibleUninstallFailAfterModLockWrite=1'
    )

    await import('@/main')

    await vi.waitFor(() => {
      expect(mocks.runThirdPartyVisibleUninstallProductProbe).toHaveBeenCalledWith({
        targetPackageId: 'product_probe_pack',
        expectBlocked: true
      })
    })
    expect(mocks.runThirdPartyVisibleImportProductProbe).not.toHaveBeenCalled()
    expect(mocks.runThirdPartyRendererUiIpcProductProbe).not.toHaveBeenCalled()
    expect(mocks.publishContentRuntimeProbe).toHaveBeenCalledWith(
      expect.objectContaining({
        thirdPartyVisibleImportResult: visibleUninstallResult
      })
    )
  })

  it('runs the visible import product probe for enable-only query wiring', async() => {
    const visibleImportResult = {
      status: 'ready',
      operation: 'enable'
    }
    mocks.runThirdPartyVisibleImportProductProbe.mockResolvedValueOnce(visibleImportResult)
    window.history.replaceState(
      null,
      '',
      '/?taoyuanContentProbe=1&taoyuanThirdPartyVisibleEnableProbe=1'
    )

    await import('@/main')

    await vi.waitFor(() => {
      expect(mocks.runThirdPartyVisibleImportProductProbe).toHaveBeenCalledWith({
        entrypoint: 'main-menu-panel',
        operation: 'enable',
        persistSource: false
      })
    })
    expect(mocks.runThirdPartyRendererUiIpcProductProbe).not.toHaveBeenCalled()
    expect(mocks.publishContentRuntimeProbe).toHaveBeenCalledWith(
      expect.objectContaining({
        thirdPartyVisibleImportResult: visibleImportResult
      })
    )
  })

  it('routes Web visible enable write-failure probes as blocked management runs', async() => {
    const visibleImportResult = {
      status: 'blocked',
      operation: 'enable'
    }
    mocks.runThirdPartyVisibleImportProductProbe.mockResolvedValueOnce(visibleImportResult)
    window.history.replaceState(
      null,
      '',
      '/?taoyuanContentProbe=1&taoyuanThirdPartyVisibleEnableProbe=1&taoyuanThirdPartyVisibleEnableFailAfterModLockWrite=1'
    )

    await import('@/main')

    await vi.waitFor(() => {
      expect(mocks.runThirdPartyVisibleImportProductProbe).toHaveBeenCalledWith({
        entrypoint: 'main-menu-panel',
        operation: 'enable',
        persistSource: false,
        expectBlocked: true
      })
    })
    expect(mocks.runThirdPartyRendererUiIpcProductProbe).not.toHaveBeenCalled()
    expect(mocks.publishContentRuntimeProbe).toHaveBeenCalledWith(
      expect.objectContaining({
        thirdPartyVisibleImportResult: visibleImportResult
      })
    )
  })
})
