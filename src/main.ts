import { createApp, toRaw } from 'vue'
import { createPinia } from 'pinia'
import {
  bootstrapApplication,
  mountAfterRouterReady,
  reportApplicationStartupFailure
} from '@/bootstrap'
import { bootstrapOfficialContent } from '@/domain/mods/officialContentBootstrap'
import { publishOfficialContentRegistrySet } from '@/domain/mods/liveContentRegistry'
import { refreshOfficialRegistryDiskCache } from '@/domain/mods/officialRegistryCacheRefresh'
import {
  bootstrapInstalledStateThirdPartyDataPackStartupGate,
  createThirdPartyDataPackInstalledStateStartupGateBootstrapSource
} from '@/domain/mods/thirdPartyDataPackInstalledStateStartupGateBootstrapSource'
import {
  acknowledgeThirdPartyDataPackMountedAppStartupHostConnection,
  publishThirdPartyDataPackMountedAppStartupHostEvidence
} from '@/domain/mods/thirdPartyDataPackMountedAppStartupHostConnection'
import {
  thirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline'
import type {
  ThirdPartyRendererUiIpcProductProbeResult
} from '@/runtime/thirdPartyRendererUiIpcProductProbe'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHostResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherSource'
import {
  createThirdPartyStartupGateProductProbeBootstrapSource,
  createThirdPartyStartupPersistentStateProductProbeBootstrapSource
} from '@/runtime/thirdPartyStartupGateProductProbe'
import type {
  ThirdPartyVisibleImportProductProbeResult
} from '@/runtime/thirdPartyVisibleImportProductProbe'
import type { PackageId } from '@/domain/mods/ids'
import './app.css'

const runtimeProbeRequested = typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('taoyuanContentProbe') === '1'
const thirdPartyStartupGateProbeRequested = runtimeProbeRequested
  && new URLSearchParams(window.location.search).get('taoyuanThirdPartyStartupGateProbe') === '1'
const thirdPartyStartupPersistentStateProbeRequested = runtimeProbeRequested
  && new URLSearchParams(window.location.search).get('taoyuanThirdPartyStartupPersistentStateProbe') === '1'
const thirdPartyStartupPersistentStateSourceKind = runtimeProbeRequested
  ? new URLSearchParams(window.location.search).get('taoyuanThirdPartyStartupPersistentStateSource')
  : null
const thirdPartyStartupGateProductProbeProfile = runtimeProbeRequested
  ? new URLSearchParams(window.location.search).get('taoyuanThirdPartyStartupGateProductProfile')
  : null
const thirdPartyStartupPersistentStateUsesElectronUserdata =
  thirdPartyStartupPersistentStateSourceKind === 'electron-program-directory-userdata'
const thirdPartyStartupPersistentStateUsesInstalledState = runtimeProbeRequested
  && new URLSearchParams(window.location.search)
    .get('taoyuanThirdPartyStartupPersistentStateInstalledState') === '1'
const thirdPartyRendererUiIpcInstallResultProbeRequested = runtimeProbeRequested
  && new URLSearchParams(window.location.search).get('taoyuanThirdPartyRendererUiIpcInstallResultProbe') === '1'
const thirdPartyElectronInstallCommandDispatchProbeRequested = runtimeProbeRequested
  && new URLSearchParams(window.location.search)
    .get('taoyuanThirdPartyElectronInstallCommandDispatchProbe') === '1'
const thirdPartyVisibleImportProbeRequested = runtimeProbeRequested
  && new URLSearchParams(window.location.search)
    .get('taoyuanThirdPartyVisibleImportProbe') === '1'
const thirdPartyVisibleImportRollbackProbeRequested = runtimeProbeRequested
  && new URLSearchParams(window.location.search)
    .get('taoyuanThirdPartyVisibleImportRollbackProbe') === '1'
const thirdPartyVisibleDisableProbeRequested = runtimeProbeRequested
  && new URLSearchParams(window.location.search)
    .get('taoyuanThirdPartyVisibleDisableProbe') === '1'
const thirdPartyVisibleUninstallProbeRequested = runtimeProbeRequested
  && new URLSearchParams(window.location.search)
    .get('taoyuanThirdPartyVisibleUninstallProbe') === '1'
const thirdPartyVisibleEnableProbeRequested = runtimeProbeRequested
  && new URLSearchParams(window.location.search)
    .get('taoyuanThirdPartyVisibleEnableProbe') === '1'
const thirdPartyVisibleUpgradeProbeRequested = runtimeProbeRequested
  && new URLSearchParams(window.location.search)
    .get('taoyuanThirdPartyVisibleUpgradeProbe') === '1'
const thirdPartyVisibleOperationProbeRequested =
  thirdPartyVisibleImportProbeRequested
  || thirdPartyVisibleImportRollbackProbeRequested
  || thirdPartyVisibleDisableProbeRequested
  || thirdPartyVisibleUninstallProbeRequested
  || thirdPartyVisibleEnableProbeRequested
  || thirdPartyVisibleUpgradeProbeRequested
const thirdPartyVisibleImportPersistSourceProbeRequested = runtimeProbeRequested
  && new URLSearchParams(window.location.search)
    .get('taoyuanThirdPartyVisibleImportPersistSource') === '1'
let thirdPartyRendererUiIpcProductProbeResult: ThirdPartyRendererUiIpcProductProbeResult | undefined
let thirdPartyElectronInstallCommandDispatchProductProbeResult:
  ThirdPartyDataPackTransactionCommandDispatcherHostResult | undefined
let thirdPartyVisibleImportProductProbeResult: ThirdPartyVisibleImportProductProbeResult | undefined
let thirdPartyVisibleDisableProductProbeResult: ThirdPartyVisibleImportProductProbeResult | undefined
let thirdPartyVisibleUninstallProductProbeResult: ThirdPartyVisibleImportProductProbeResult | undefined
const bootstrapThirdPartyStartupGate = thirdPartyStartupPersistentStateProbeRequested
  ? thirdPartyStartupPersistentStateUsesInstalledState
    ? createThirdPartyDataPackInstalledStateStartupGateBootstrapSource({
        ...(typeof window === 'undefined' ? {} : { runtimeHost: window })
      })
    : createThirdPartyStartupPersistentStateProductProbeBootstrapSource({
        ...(typeof window === 'undefined' ? {} : { runtimeHost: window }),
        profile: thirdPartyStartupGateProductProbeProfile === 'electron-ordinary-terminal'
          ? 'electron-ordinary-terminal'
          : 'sample',
        sourceKind: thirdPartyStartupPersistentStateUsesElectronUserdata
          ? 'electron-program-directory-userdata'
          : 'web-indexeddb',
        seedWebStartupPersistentState: true
      })
  : thirdPartyStartupGateProbeRequested
    ? createThirdPartyStartupGateProductProbeBootstrapSource({
        profile: thirdPartyStartupGateProductProbeProfile === 'electron-ordinary-terminal'
          ? 'electron-ordinary-terminal'
          : 'sample'
      })
    : bootstrapInstalledStateThirdPartyDataPackStartupGate

void bootstrapApplication({
  bootstrapOfficialContent,
  publishRuntimeContentRegistry: publishOfficialContentRegistrySet,
  bootstrapThirdPartyStartupGate,
  acknowledgeThirdPartyAppStartupHost: options => {
    publishThirdPartyDataPackMountedAppStartupHostEvidence(options.evidence)
    return acknowledgeThirdPartyDataPackMountedAppStartupHostConnection(options)
  },
  createApp: async () => createApp((await import('./App.vue')).default),
  createPinia,
  configurePinia: pinia => {
    // setup stores do not receive Pinia's built-in $reset implementation.
    pinia.use(({ store }) => {
      const initialState = JSON.parse(JSON.stringify(toRaw(store.$state)))
      store.$reset = () => {
        store.$patch($state => {
          Object.assign($state, JSON.parse(JSON.stringify(initialState)))
        })
      }
    })
  },
  installPinia: (app, pinia) => app.use(pinia),
  getRouter: async () => (await import('@/router')).default,
  installRouter: (app, router) => app.use(router),
  mount: (app, router) => mountAfterRouterReady(app, router),
  afterMount: async () => {
    if (runtimeProbeRequested) {
      if (thirdPartyVisibleImportProbeRequested || thirdPartyVisibleImportRollbackProbeRequested) {
        const { runThirdPartyVisibleImportProductProbe } = await import(
          '@/runtime/thirdPartyVisibleImportProductProbe'
        )
        thirdPartyVisibleImportProductProbeResult =
          await runThirdPartyVisibleImportProductProbe({
            entrypoint: 'main-menu-panel',
            operation: thirdPartyVisibleEnableProbeRequested
              ? 'enable'
              : thirdPartyVisibleImportRollbackProbeRequested
                ? 'rollback'
              : thirdPartyVisibleUpgradeProbeRequested
                ? 'upgrade'
                : 'install',
            persistSource: thirdPartyVisibleImportPersistSourceProbeRequested
          })
      }
      if (thirdPartyVisibleDisableProbeRequested) {
        const { runThirdPartyVisibleDisableProductProbe } = await import(
          '@/runtime/thirdPartyVisibleImportProductProbe'
        )
        thirdPartyVisibleDisableProductProbeResult =
          await runThirdPartyVisibleDisableProductProbe({
            targetPackageId: 'product_probe_pack' as PackageId
          })
      }
      if (thirdPartyVisibleUninstallProbeRequested) {
        const { runThirdPartyVisibleUninstallProductProbe } = await import(
          '@/runtime/thirdPartyVisibleImportProductProbe'
        )
        thirdPartyVisibleUninstallProductProbeResult =
          await runThirdPartyVisibleUninstallProductProbe({
            targetPackageId: 'product_probe_pack' as PackageId
          })
      }
      if (!thirdPartyVisibleOperationProbeRequested || thirdPartyRendererUiIpcInstallResultProbeRequested) {
        const { runThirdPartyRendererUiIpcProductProbe } = await import(
          '@/runtime/thirdPartyRendererUiIpcProductProbe'
        )
        thirdPartyRendererUiIpcProductProbeResult = await runThirdPartyRendererUiIpcProductProbe(
          window,
          {
            deliveryInputSource: thirdPartyRendererUiIpcInstallResultProbeRequested
              ? 'install-transaction-commit-finalization'
              : 'synthetic-success-handoff'
          }
        )
      }
      if (thirdPartyElectronInstallCommandDispatchProbeRequested) {
        const { runThirdPartyElectronInstallCommandDispatchProductProbe } = await import(
          '@/runtime/thirdPartyElectronInstallCommandDispatchProductProbe'
        )
        thirdPartyElectronInstallCommandDispatchProductProbeResult =
          await runThirdPartyElectronInstallCommandDispatchProductProbe(window)
      }
      return
    }
    await thirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline()
  }
}).then(async bootstrapResult => {
  const cacheRefresh = refreshOfficialRegistryDiskCache()
  if (!runtimeProbeRequested) {
    void cacheRefresh
    return
  }
  await cacheRefresh
  const { publishContentRuntimeProbe } = await import('@/runtime/contentRuntimeProbe')
  publishContentRuntimeProbe({
    thirdPartyStartupGateResult: bootstrapResult.thirdPartyStartupGateResult,
    thirdPartyAppStartupHostResult: bootstrapResult.thirdPartyAppStartupHostResult,
    thirdPartyStartupPersistentStateReadFromIndexedDb:
      thirdPartyStartupPersistentStateProbeRequested
      && !thirdPartyStartupPersistentStateUsesElectronUserdata,
    thirdPartyRendererUiIpcResult:
      thirdPartyRendererUiIpcProductProbeResult?.responseDeliveryResult,
    thirdPartyRendererUiIpcDeliveryInputSource:
      thirdPartyRendererUiIpcProductProbeResult?.deliveryInputSource,
    thirdPartyRendererUiIpcWebEventObserved:
      thirdPartyRendererUiIpcProductProbeResult?.webDomResponseEventObserved,
    thirdPartyElectronInstallCommandDispatchResult:
      thirdPartyElectronInstallCommandDispatchProductProbeResult,
    thirdPartyVisibleImportResult:
      thirdPartyVisibleUninstallProductProbeResult
        ?? thirdPartyVisibleDisableProductProbeResult
        ?? thirdPartyVisibleImportProductProbeResult
  })
}).catch(error => {
  reportApplicationStartupFailure(error)
})
