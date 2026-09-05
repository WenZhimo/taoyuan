import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MainMenu from '@/views/MainMenu.vue'
import {
  runThirdPartyRendererUiIpcProductProbe
} from '@/runtime/thirdPartyRendererUiIpcProductProbe'
import { resetLiveContentRegistryForTests } from '@/domain/mods/liveContentRegistry'
import { getOfficialItemDef } from '@/domain/mods/contentAccess'
import {
  publishThirdPartyDataPackMountedAppStartupHostEvidence,
  resetThirdPartyDataPackMountedAppStartupHostEvidenceForTests
} from '@/domain/mods/thirdPartyDataPackMountedAppStartupHostConnection'
import type { WebFilePickerSourceInstallCommandDispatchResult } from '@/composables/useWebFilePickerImportEntry'
import type { WebFilePickerImportFile } from '@/domain/mods/webFilePickerImportSource'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope,
  ThirdPartyDataPackTransactionCommandDispatcherHostResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherSource'
import type {
  ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
} from '@/domain/mods/thirdPartyDataPackElectronOrdinaryInstallTerminalContinuationBridge'

vi.mock('@/composables/useAudio', () => ({
  useAudio: () => ({
    startBgm: vi.fn()
  })
}))

vi.mock('@/composables/useGameLog', () => ({
  addLog: vi.fn(),
  showFloat: vi.fn()
}))

type JsonObject = Record<string, unknown>
type VisibleImportPanelProbeWindow = Window & {
  __TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__?: WebFilePickerSourceInstallCommandDispatchResult
}

const visibleImportPanelProbeResultKey = '__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__'

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = (packageId = 'main_menu_visible_web_ordinary'): JsonObject => ({
  id: packageId,
  name: { key: `${packageId}.package.name`, fallback: packageId },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Main Menu Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = (id = 'main_menu_visible_web_ordinary:silk_thread'): JsonObject => ({
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

const createValidFiles = (
  packageId = 'main_menu_visible_web_ordinary'
): readonly WebFilePickerImportFile[] => [
  createFile('main-menu-visible-pack/manifest.json', toJson(createManifest(packageId))),
  createFile('main-menu-visible-pack/locales/zh-CN.json', '{}\n'),
  createFile('main-menu-visible-pack/data/items.json', toJson([
    createItem(`${packageId}:silk_thread`)
  ]))
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

const requestSuccess = <T>(result: T): IDBRequest<T> => {
  const request = {
    result,
    error: null,
    onsuccess: null as (() => void) | null,
    onerror: null as (() => void) | null
  }
  queueMicrotask(() => request.onsuccess?.())
  return request as unknown as IDBRequest<T>
}

const completeTransactionAfterRequestHandlers = (
  transaction: { oncomplete: (() => void) | null }
): void => {
  setTimeout(() => transaction.oncomplete?.(), 0)
}

const createFakeIndexedDb = (): IDBFactory => {
  const databases = new Map<string, Map<string, Map<string, unknown>>>()
  const createDatabase = (databaseName: string) => {
    const stores = databases.get(databaseName) ?? new Map<string, Map<string, unknown>>()
    databases.set(databaseName, stores)
    const database = {
      objectStoreNames: {
        contains: (storeName: string) => stores.has(storeName)
      },
      createObjectStore: (storeName: string) => {
        const records = new Map<string, unknown>()
        stores.set(storeName, records)
        return records
      },
      transaction: (storeName: string) => {
        const records = stores.get(storeName)
        if (records === undefined) throw new Error(`missing store ${storeName}`)
        const transaction = {
          error: null,
          oncomplete: null as (() => void) | null,
          onerror: null as (() => void) | null,
          onabort: null as (() => void) | null,
          objectStore: () => ({
            put: (record: { readonly importId?: string; readonly recordId?: string }) => {
              const key = record.importId ?? record.recordId
              if (key === undefined) throw new Error('missing fake IndexedDB key')
              records.set(key, record)
              const request = requestSuccess(undefined)
              completeTransactionAfterRequestHandlers(transaction)
              return request
            },
            get: (recordId: string) => {
              const request = requestSuccess(records.get(recordId))
              completeTransactionAfterRequestHandlers(transaction)
              return request
            },
            getAll: () => {
              const request = requestSuccess([...records.values()])
              completeTransactionAfterRequestHandlers(transaction)
              return request
            },
            delete: (recordId: string) => {
              records.delete(recordId)
              const request = requestSuccess(undefined)
              completeTransactionAfterRequestHandlers(transaction)
              return request
            }
          })
        }
        completeTransactionAfterRequestHandlers(transaction)
        return transaction as unknown as IDBTransaction
      },
      close: vi.fn()
    }
    return database as unknown as IDBDatabase
  }

  return {
    open: (databaseName: string) => {
      const request = {
        result: createDatabase(databaseName),
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
        onupgradeneeded: null as (() => void) | null
      }
      queueMicrotask(() => {
        request.onupgradeneeded?.()
        request.onsuccess?.()
      })
      return request as unknown as IDBOpenDBRequest
    }
  } as unknown as IDBFactory
}

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
    reason: 'Electron ordinary install terminal continuation reached ready main menu handoff',
    installCommandPostCommitAcknowledgement: {
      status: 'ready',
      reason: 'Electron continuation accepted visible main menu install handoff'
    },
    postCommitUiIpcDeliveryContinuation: {
      status: 'ready',
      selectedPlatform: 'electron',
      envelopeKind: 'success',
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
      reason: 'Electron continuation accepted runtime publication after visible main menu install',
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
      reason: 'Electron continuation swapped live registry after visible main menu install',
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
      reason: 'Electron continuation accepted app startup host handoff after visible main menu install',
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
  const postCommit = ready.postCommitUiIpcDeliveryContinuation
  const terminal = ready.ordinaryInstallTransactionTerminalConnection
  const targetPackageId = envelope.transactionCommandDispatcherHandoff.targetPackageId

  return {
    status: 'ready',
    reason: 'Electron continuation reported visible main menu rollback terminal outcome',
    installCommandPostCommitAcknowledgement: ready.installCommandPostCommitAcknowledgement,
    postCommitUiIpcDeliveryContinuation: {
      ...postCommit,
      reason: 'Electron continuation delivered visible main menu rollback response',
      envelopeKind: 'rollback',
      messageKey: 'mods.ui.ipc.result.install.rollback',
      persistentPackageWriteExecuted: false,
      persistentSettingsLockfileWriteExecuted: false,
      writtenFileCount: 0,
      backedUpFileCount: 0,
      transactionCommitConnectionAcknowledged: false,
      startupGateContinuationAllowed: false,
      acknowledgement: {
        status: 'acknowledged',
        platform: 'electron',
        packageId: targetPackageId,
        envelopeKind: 'rollback',
        messageKey: 'mods.ui.ipc.result.install.rollback'
      },
      effects: {
        ...postCommit.effects,
        successEnvelopeDelivered: false,
        rollbackStateDelivered: true,
        packageFilesWritten: false,
        settingsWritten: false,
        lockfileWritten: false,
        transactionCommitted: false,
        runtimePublicationCommitted: false,
        runtimeEnablementAllowed: false,
        uiIpcResponseDelivered: true
      }
    },
    ordinaryInstallTransactionTerminalConnection: {
      ...terminal,
      reason: 'Electron continuation settled visible main menu rollback recovery',
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
        realRecoveryLogReplayRestoreCalled: true,
        recoveryLogRead: true,
        recoveryLogReplayed: true,
        packageFilesRestored: true,
        packageFilesWritten: false,
        settingsWritten: false,
        lockfileWritten: false,
        transactionCommitted: false,
        runtimePublicationCommitted: false,
        rollbackExecuted: true,
        runtimeEnablementAllowed: false
      }
    },
    diagnostics: []
  }
}

const createFailureElectronOrdinaryInstallTerminalContinuationResult = (
  envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
) => {
  const ready = createReadyElectronOrdinaryInstallTerminalContinuationResult(envelope)
  const postCommit = ready.postCommitUiIpcDeliveryContinuation
  const terminal = ready.ordinaryInstallTransactionTerminalConnection
  const targetPackageId = envelope.transactionCommandDispatcherHandoff.targetPackageId

  return {
    status: 'ready',
    reason: 'Electron continuation reported visible main menu retryable failure terminal outcome',
    installCommandPostCommitAcknowledgement: ready.installCommandPostCommitAcknowledgement,
    postCommitUiIpcDeliveryContinuation: {
      ...postCommit,
      reason: 'Electron continuation delivered visible main menu retryable failure response',
      envelopeKind: 'failure',
      messageKey: 'mods.ui.ipc.result.install.failure',
      persistentPackageWriteExecuted: false,
      persistentSettingsLockfileWriteExecuted: false,
      writtenFileCount: 0,
      backedUpFileCount: 0,
      transactionCommitConnectionAcknowledged: false,
      acknowledgement: {
        status: 'acknowledged',
        platform: 'electron',
        packageId: targetPackageId,
        envelopeKind: 'failure',
        messageKey: 'mods.ui.ipc.result.install.failure'
      },
      effects: {
        ...postCommit.effects,
        successEnvelopeDelivered: false,
        failureEnvelopeDelivered: true,
        rollbackStateDelivered: false,
        packageFilesWritten: false,
        settingsWritten: false,
        lockfileWritten: false,
        transactionCommitted: false,
        runtimePublicationCommitted: false,
        runtimeEnablementAllowed: false,
        uiIpcResponseDelivered: true
      }
    },
    ordinaryInstallTransactionTerminalConnection: {
      ...terminal,
      reason: 'Electron continuation settled visible main menu retryable failure',
      outcomeKind: 'failure',
      messageKey: 'mods.atomic.commit.install.failure',
      recovery: 'retry',
      retryable: true,
      rollbackRequired: false,
      rollbackRecoverySettled: false,
      rollbackRecoveryExecutionAcknowledged: false,
      effects: {
        ...terminal.effects,
        successOutcomeAccepted: false,
        failureOutcomeAccepted: true,
        rollbackOutcomeAccepted: false,
        rollbackRecoverySettled: false,
        rollbackRecoveryExecutionAcknowledged: false,
        packageFilesWritten: false,
        settingsWritten: false,
        lockfileWritten: false,
        transactionCommitted: false,
        runtimePublicationCommitted: false,
        rollbackExecuted: false,
        runtimeEnablementAllowed: false
      }
    },
    diagnostics: []
  }
}

const withBrowserFilePickerFiles = (
  files: readonly WebFilePickerImportFile[]
): {
  readonly clickCount: () => number
  readonly restore: () => void
} => {
  let opened = 0
  const createElementSpy = vi.spyOn(document, 'createElement')
  createElementSpy.mockImplementation((tagName, options) => {
    const element = createElementSpy.getMockImplementation() === undefined
      ? document.createElement(tagName, options)
      : Document.prototype.createElement.call(document, tagName, options)
    if (tagName.toLowerCase() !== 'input') return element
    const input = element as HTMLInputElement
    vi.spyOn(input, 'click').mockImplementation(() => {
      opened += 1
      Object.defineProperty(input, 'files', {
        configurable: true,
        value: files
      })
      input.dispatchEvent(new Event('change'))
    })
    return input
  })
  return {
    clickCount: () => opened,
    restore: () => createElementSpy.mockRestore()
  }
}

const withWindowElectronApi = (
  electronAPI: Record<string, unknown>
): (() => void) => {
  const previousDescriptor = Object.getOwnPropertyDescriptor(window, 'electronAPI')
  Object.defineProperty(window, 'electronAPI', {
    configurable: true,
    enumerable: true,
    value: electronAPI
  })
  return () => {
    Reflect.deleteProperty(window, 'electronAPI')
    if (previousDescriptor !== undefined) {
      Object.defineProperty(window, 'electronAPI', previousDescriptor)
    }
  }
}

const withoutWindowElectronApi = (): (() => void) => {
  const previousDescriptor = Object.getOwnPropertyDescriptor(window, 'electronAPI')
  Reflect.deleteProperty(window, 'electronAPI')
  return () => {
    Reflect.deleteProperty(window, 'electronAPI')
    if (previousDescriptor !== undefined) {
      Object.defineProperty(window, 'electronAPI', previousDescriptor)
    }
  }
}

const withGlobalIndexedDb = (indexedDb: IDBFactory): (() => void) => {
  const previousDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB')
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: indexedDb
  })
  return () => {
    Reflect.deleteProperty(globalThis, 'indexedDB')
    if (previousDescriptor !== undefined) {
      Object.defineProperty(globalThis, 'indexedDB', previousDescriptor)
    }
  }
}

const withVisibleImportPanelProbeQuery = (
  probeFlag = 'taoyuanThirdPartyVisibleImportProbe'
): (() => void) => {
  const previousHref = window.location.href
  window.history.replaceState(
    null,
    '',
    `/?taoyuanContentProbe=1&${probeFlag}=1`
  )
  return () => {
    Reflect.deleteProperty(window as VisibleImportPanelProbeWindow, visibleImportPanelProbeResultKey)
    window.history.replaceState(null, '', previousHref)
  }
}

const waitForImportToSettle = async(
  readStatus: () => string
): Promise<void> => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 10))
    await nextTick()
    const status = readStatus()
    if (
      status !== '等待选择'
      && status !== '预检中'
      && status !== '选择中'
      && status !== '读取中'
    ) return
  }
}

afterEach(() => {
  Reflect.deleteProperty(window as VisibleImportPanelProbeWindow, visibleImportPanelProbeResultKey)
  resetLiveContentRegistryForTests()
  resetThirdPartyDataPackMountedAppStartupHostEvidenceForTests()
  vi.restoreAllMocks()
})

const mountMainMenu = async(options: {
  readonly stubWebDataPackImportPreflightPanel?: boolean
} = {}) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: MainMenu }]
  })
  await router.push('/')
  await router.isReady()

  return mount(MainMenu, {
    global: {
      plugins: [pinia, router],
      stubs: {
        Button: {
          props: ['icon', 'iconSize'],
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\')"><slot /></button>'
        },
        Transition: false,
        ...(options.stubWebDataPackImportPreflightPanel === false
          ? {}
          : {
              WebDataPackImportPreflightPanel: {
                template: '<div data-testid="web-data-pack-import-preflight-panel-stub" />'
              }
            })
      }
    }
  })
}

describe('MainMenu Web data pack import entry', () => {
  it('opens the player-visible Web data pack preflight panel from the main menu', async() => {
    const wrapper = await mountMainMenu()

    await wrapper.findAll('button').find(button => button.text().includes('数据包预检'))!.trigger('click')

    expect(wrapper.find('[data-testid="web-data-pack-import-preflight-panel-stub"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('drives the real panel from the main menu visible action into Web ordinary runtime handoff', async() => {
    const packageId = 'main_menu_visible_web_ordinary'
    const itemId = `${packageId}:silk_thread`
    const restoreIndexedDb = withGlobalIndexedDb(createFakeIndexedDb())
    const restoreElectronApi = withoutWindowElectronApi()
    const restoreVisibleImportPanelProbe = withVisibleImportPanelProbeQuery()
    const filePicker = withBrowserFilePickerFiles(createValidFiles())
    publishMountedAppStartupHostEvidence()
    const wrapper = await mountMainMenu({ stubWebDataPackImportPreflightPanel: false })

    try {
      expect(getOfficialItemDef(itemId)).toBeUndefined()
      await wrapper.findAll('button').find(button => button.text().includes('数据包预检'))!.trigger('click')
      await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
      expect(filePicker.clickCount()).toBe(1)
      await waitForImportToSettle(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

      expect(wrapper.find('[data-testid="web-data-pack-import-preflight-panel"]').exists()).toBe(true)
      expect(wrapper.get('[data-testid="web-mod-import-status"]').text()).toBe('已暂存')
      expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe('main_menu_visible_web_ordinary')
      expect(wrapper.get('[data-testid="web-mod-dispatch-status"]').text()).toBe('dispatched')
      expect(wrapper.get('[data-testid="web-mod-persistence-status"]').text()).toBe('已写入 IndexedDB')
      expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（Web）')
      expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('提交后校验已确认')
      expect(wrapper.get('[data-testid="web-mod-ui-ipc-delivery-status"]').text()).toBe('已送达（Web）')
      expect(wrapper.get('[data-testid="web-mod-runtime-publication-status"]').text()).toBe('已确认')
      expect(wrapper.get('[data-testid="web-mod-live-registry-status"]').text()).toBe('已切换')
      expect(wrapper.get('[data-testid="web-mod-app-startup-status"]').text()).toBe('已接入已挂载应用')
      expect(wrapper.get('[data-testid="web-mod-startup-persistent-state-status"]').text()).toBe('已写入')
      expect(getOfficialItemDef(itemId)?.name.fallback).toBe(itemId)
      expect((window as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__).toMatchObject({
        selectedPackageIds: [packageId],
        loadOrder: [packageId],
        preflight: { targetPackageId: packageId },
        transactionCommandDispatcherHostKind: 'web',
        transactionCommandDispatcherSourceStatus: 'dispatched',
        installCommandPostCommitAcknowledgementStatus: 'ready',
        ordinaryInstallTransactionTerminalConnectionStatus: 'ready',
        runtimePublicationCommitAfterPostCommitVerificationStatus: 'accepted',
        runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: 'swapped',
        runtimePublicationCommitAppStartupReadinessStatus: 'ready',
        runtimePublicationCommitAppStartupHostConnectionStatus: 'accepted',
        runtimePublicationCommitAppStartupHostConnection: {
          effects: {
            realNormalStartupHostCalled: true,
            realAppStartupHostCalled: true,
            gameAppCreated: true,
            piniaCreated: true,
            routerMounted: true
          }
        },
        rendererLiveRegistrySwapApplied: true,
        runtimeEnablementAllowed: true,
        uiIpcResponseDelivered: true,
        startupPersistentStateWritten: true
      })
      expect(wrapper.text()).toContain('事务提交：已提交')
      expect(wrapper.text()).toContain('写入：已执行')
      expect(wrapper.text()).toContain('运行时启用：允许')
      expect(wrapper.text()).not.toContain('C:/Users')
      expect(wrapper.text()).not.toContain('LENOVO')
      expect(JSON.stringify((window as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__))
        .not.toContain('C:/Users')
      expect(JSON.stringify((window as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__))
        .not.toContain('LENOVO')
    } finally {
      wrapper.unmount()
      filePicker.restore()
      restoreVisibleImportPanelProbe()
      restoreElectronApi()
      restoreIndexedDb()
    }
  })

  it('drives the real panel from the main menu visible action into Electron ordinary runtime handoff', async() => {
    const packageId = 'main_menu_visible_electron_ordinary'
    const itemId = `${packageId}:silk_thread`
    const dispatchThirdPartyDataPackInstallCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const continueThirdPartyDataPackOrdinaryInstallTerminal = vi.fn(async(
      envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
    ) => createReadyElectronOrdinaryInstallTerminalContinuationResult(envelope))
    const restoreIndexedDb = withGlobalIndexedDb(createFakeIndexedDb())
    const restoreElectronApi = withWindowElectronApi({
      dispatchThirdPartyDataPackInstallCommand,
      continueThirdPartyDataPackOrdinaryInstallTerminal
    })
    const filePicker = withBrowserFilePickerFiles(createValidFiles(packageId))
    publishMountedAppStartupHostEvidence()
    const wrapper = await mountMainMenu({ stubWebDataPackImportPreflightPanel: false })

    try {
      expect(getOfficialItemDef(itemId)).toBeUndefined()
      await wrapper.findAll('button').find(button => button.text().includes('数据包预检'))!.trigger('click')
      await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
      expect(filePicker.clickCount()).toBe(1)
      await waitForImportToSettle(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

      expect(dispatchThirdPartyDataPackInstallCommand).toHaveBeenCalledOnce()
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal).toHaveBeenCalledOnce()
      expect(dispatchThirdPartyDataPackInstallCommand.mock.calls[0]?.[0]).toMatchObject({
        requestedCommandId: 'install',
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        registryCount: 54,
        entryCount: 4243,
        packageCount: 1
      })
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal.mock.calls[0]?.[0]).toMatchObject({
        transactionCommandDispatcherHandoff: {
          requestedCommandId: 'install',
          targetPackageId: packageId,
          selectedPackageIds: [packageId]
        },
        lockfileDraft: {
          packages: [expect.objectContaining({ packageId })]
        }
      })
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal.mock.calls[0]?.[0]
        .packageFilePayload.map(file => file.path)).toEqual(['manifest.json', 'data/items.json'])
      expect(wrapper.find('[data-testid="web-data-pack-import-preflight-panel"]').exists()).toBe(true)
      expect(wrapper.get('[data-testid="web-mod-import-status"]').text()).toBe('已暂存')
      expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe(packageId)
      expect(wrapper.get('[data-testid="web-mod-dispatch-status"]').text()).toBe('dispatched')
      expect(wrapper.get('[data-testid="web-mod-persistence-status"]').text()).toBe('已写入 IndexedDB')
      expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（Electron）')
      expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('提交后校验已确认')
      expect(wrapper.get('[data-testid="web-mod-ui-ipc-delivery-status"]').text()).toBe('已送达（Electron）')
      expect(wrapper.get('[data-testid="web-mod-runtime-publication-status"]').text()).toBe('已确认')
      expect(wrapper.get('[data-testid="web-mod-live-registry-status"]').text()).toBe('已切换')
      expect(wrapper.get('[data-testid="web-mod-app-startup-status"]').text()).toBe('已接入已挂载应用')
      expect(wrapper.get('[data-testid="web-mod-startup-persistent-state-status"]').text()).toBe('已写入')
      expect(getOfficialItemDef(itemId)?.name.fallback).toBe(itemId)
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
      filePicker.restore()
      restoreElectronApi()
      restoreIndexedDb()
    }
  })

  it('publishes the visible import panel result for Electron rollback probe queries', async() => {
    const packageId = 'main_menu_visible_electron_rollback'
    const itemId = `${packageId}:silk_thread`
    const dispatchThirdPartyDataPackInstallCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const continueThirdPartyDataPackOrdinaryInstallTerminal = vi.fn(async(
      envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
    ) => createRollbackElectronOrdinaryInstallTerminalContinuationResult(envelope))
    const restoreIndexedDb = withGlobalIndexedDb(createFakeIndexedDb())
    const restoreElectronApi = withWindowElectronApi({
      dispatchThirdPartyDataPackInstallCommand,
      continueThirdPartyDataPackOrdinaryInstallTerminal
    })
    const restoreVisibleImportPanelProbe = withVisibleImportPanelProbeQuery(
      'taoyuanThirdPartyVisibleImportRollbackProbe'
    )
    const filePicker = withBrowserFilePickerFiles(createValidFiles(packageId))
    publishMountedAppStartupHostEvidence()
    const wrapper = await mountMainMenu({ stubWebDataPackImportPreflightPanel: false })

    try {
      expect(getOfficialItemDef(itemId)).toBeUndefined()
      await wrapper.findAll('button').find(button => button.text().includes('数据包预检'))!.trigger('click')
      await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
      expect(filePicker.clickCount()).toBe(1)
      await waitForImportToSettle(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

      expect(dispatchThirdPartyDataPackInstallCommand).toHaveBeenCalledOnce()
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal).toHaveBeenCalledOnce()
      expect(wrapper.get('[data-testid="web-mod-import-status"]').text()).toBe('已暂存')
      expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe(packageId)
      expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（Electron）')
      expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('已回滚')
      expect(wrapper.get('[data-testid="web-mod-ui-ipc-delivery-status"]').text()).toBe('已送达（Electron）')
      expect(wrapper.get('[data-testid="web-mod-runtime-publication-status"]').text()).toBe('已阻断')
      expect(wrapper.get('[data-testid="web-mod-live-registry-status"]').text()).toBe('已阻断')
      expect(wrapper.get('[data-testid="web-mod-app-startup-status"]').text()).toBe('已阻断')
      expect(wrapper.get('[data-testid="web-mod-startup-persistent-state-status"]').text()).toBe('已阻断')
      expect(getOfficialItemDef(itemId)).toBeUndefined()
      expect((window as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__).toMatchObject({
        preflight: { targetPackageId: packageId },
        selectedPackageIds: [packageId],
        loadOrder: [packageId],
        transactionCommandDispatcherHostKind: 'renderer',
        transactionCommandDispatcherSourceStatus: 'dispatched',
        installCommandPostCommitAcknowledgementStatus: 'ready',
        postCommitUiIpcDeliveryContinuationStatus: 'ready',
        ordinaryInstallTransactionTerminalConnectionStatus: 'ready',
        ordinaryInstallTransactionTerminalConnection: {
          outcomeKind: 'rollback',
          effects: {
            rollbackExecuted: true
          }
        },
        installTransactionLogPreparedStatus: null,
        installTransactionCommitFinalizationStatus: null,
        runtimePublicationCommitAfterPostCommitVerificationStatus: null,
        runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: null,
        runtimePublicationCommitAppStartupReadinessStatus: null,
        runtimePublicationCommitAppStartupHostConnectionStatus: null,
        electronStartupPersistentStateWriteStatus: 'blocked',
        rendererLiveRegistrySwapApplied: false,
        runtimeEnablementAllowed: false,
        startupPersistentStateWritten: false,
        uiIpcResponseDelivered: true
      })
      expect(JSON.stringify((window as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__))
        .not.toContain('C:/Users')
      expect(JSON.stringify((window as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__))
        .not.toContain('LENOVO')
    } finally {
      wrapper.unmount()
      filePicker.restore()
      restoreVisibleImportPanelProbe()
      restoreElectronApi()
      restoreIndexedDb()
    }
  })

  it('publishes the visible import panel result for Electron retryable failure probe queries', async() => {
    const packageId = 'main_menu_visible_electron_failure'
    const itemId = `${packageId}:silk_thread`
    const dispatchThirdPartyDataPackInstallCommand = vi.fn(async(
      envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
    ) => createDispatchedHostResult(envelope))
    const continueThirdPartyDataPackOrdinaryInstallTerminal = vi.fn(async(
      envelope: ThirdPartyDataPackElectronOrdinaryInstallTerminalContinuationEnvelope
    ) => createFailureElectronOrdinaryInstallTerminalContinuationResult(envelope))
    const restoreIndexedDb = withGlobalIndexedDb(createFakeIndexedDb())
    const restoreElectronApi = withWindowElectronApi({
      dispatchThirdPartyDataPackInstallCommand,
      continueThirdPartyDataPackOrdinaryInstallTerminal
    })
    const restoreVisibleImportPanelProbe = withVisibleImportPanelProbeQuery(
      'taoyuanThirdPartyVisibleImportFailureProbe'
    )
    const filePicker = withBrowserFilePickerFiles(createValidFiles(packageId))
    publishMountedAppStartupHostEvidence()
    const wrapper = await mountMainMenu({ stubWebDataPackImportPreflightPanel: false })

    try {
      expect(getOfficialItemDef(itemId)).toBeUndefined()
      await wrapper.findAll('button').find(button => button.text().includes('数据包预检'))!.trigger('click')
      await wrapper.findAll('button').find(button => button.text().includes('选择数据包目录'))!.trigger('click')
      expect(filePicker.clickCount()).toBe(1)
      await waitForImportToSettle(() => wrapper.get('[data-testid="web-mod-import-status"]').text())

      expect(dispatchThirdPartyDataPackInstallCommand).toHaveBeenCalledOnce()
      expect(continueThirdPartyDataPackOrdinaryInstallTerminal).toHaveBeenCalledOnce()
      expect(wrapper.get('[data-testid="web-mod-import-status"]').text()).toBe('已暂存')
      expect(wrapper.get('[data-testid="web-mod-target-package"]').text()).toBe(packageId)
      expect(wrapper.get('[data-testid="web-mod-host-ack-status"]').text()).toBe('已确认（Electron）')
      expect(wrapper.get('[data-testid="web-mod-install-outcome-status"]').text()).toBe('安装失败，可重试')
      expect(wrapper.get('[data-testid="web-mod-ui-ipc-delivery-status"]').text()).toBe('已送达（Electron）')
      expect(wrapper.get('[data-testid="web-mod-runtime-publication-status"]').text()).toBe('已阻断')
      expect(wrapper.get('[data-testid="web-mod-live-registry-status"]').text()).toBe('已阻断')
      expect(wrapper.get('[data-testid="web-mod-app-startup-status"]').text()).toBe('已阻断')
      expect(wrapper.get('[data-testid="web-mod-startup-persistent-state-status"]').text()).toBe('已阻断')
      expect(getOfficialItemDef(itemId)).toBeUndefined()
      expect((window as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__).toMatchObject({
        preflight: { targetPackageId: packageId },
        selectedPackageIds: [packageId],
        loadOrder: [packageId],
        transactionCommandDispatcherHostKind: 'renderer',
        transactionCommandDispatcherSourceStatus: 'dispatched',
        installCommandPostCommitAcknowledgementStatus: 'ready',
        postCommitUiIpcDeliveryContinuationStatus: 'ready',
        ordinaryInstallTransactionTerminalConnectionStatus: 'ready',
        ordinaryInstallTransactionTerminalConnection: {
          outcomeKind: 'failure',
          retryable: true,
          rollbackRequired: false,
          effects: {
            failureOutcomeAccepted: true,
            rollbackExecuted: false
          }
        },
        installTransactionLogPreparedStatus: null,
        installTransactionCommitFinalizationStatus: null,
        runtimePublicationCommitAfterPostCommitVerificationStatus: null,
        runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: null,
        runtimePublicationCommitAppStartupReadinessStatus: null,
        runtimePublicationCommitAppStartupHostConnectionStatus: null,
        electronStartupPersistentStateWriteStatus: 'blocked',
        rendererLiveRegistrySwapApplied: false,
        runtimeEnablementAllowed: false,
        startupPersistentStateWritten: false,
        uiIpcResponseDelivered: true
      })
      expect(JSON.stringify((window as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__))
        .not.toContain('C:/Users')
      expect(JSON.stringify((window as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__))
        .not.toContain('LENOVO')
    } finally {
      wrapper.unmount()
      filePicker.restore()
      restoreVisibleImportPanelProbe()
      restoreElectronApi()
      restoreIndexedDb()
    }
  })

  it('surfaces renderer Web UI response delivery pipeline envelopes in the data pack panel', async() => {
    const wrapper = await mountMainMenu()

    const probe = await runThirdPartyRendererUiIpcProductProbe(window, {
      deliveryInputSource: 'install-transaction-commit-finalization'
    })
    await wrapper.vm.$nextTick()

    expect(probe.webDomResponseEventObserved).toBe(true)
    expect(probe.responseDeliveryResult.status).toBe('ready')
    expect(probe.deliveryInputSource).toBe('install-transaction-commit-finalization')
    expect(wrapper.find('[data-testid="web-data-pack-import-preflight-panel-stub"]').exists()).toBe(true)
    const summary = wrapper.get('[data-testid="web-mod-response-delivery-summary"]').text()
    expect(summary).toContain('成功')
    expect(summary).toContain('product_probe_pack')
    expect(summary).toContain('mods.ui.ipc.result.install.success')
    expect(summary).not.toContain('C:/Users')
    expect(summary).not.toContain('LENOVO')

    wrapper.unmount()
  })
})
