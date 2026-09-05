<template>
  <section data-testid="web-data-pack-import-preflight-panel" class="flex flex-col space-y-3 text-left">
    <div class="text-center">
      <p class="text-accent text-sm">数据包导入与运行时交接</p>
      <p class="text-xs text-muted mt-1">
        读取本地选择的目录，可用时暂存到浏览器 IndexedDB，并继续到安装命令、UI/IPC、运行时发布和启动交接状态；不会写入存档或官方缓存。
      </p>
    </div>

    <div v-if="isNativePlatform" class="border border-danger/40 rounded-xs p-3 text-xs text-danger">
      Android 当前只保证原版可游玩，不开放第三方数据包导入。
    </div>

    <div v-else class="flex flex-col space-y-2">
      <div class="border border-accent/20 rounded-xs p-2 text-xs" data-testid="web-mod-installed-management">
        <div class="flex items-center justify-between gap-2">
          <p class="text-muted">已安装数据包</p>
          <span data-testid="web-mod-installed-management-status" class="text-text">{{ installedManagementStatusLabel }}</span>
        </div>
        <p v-if="installedManagementReason" data-testid="web-mod-installed-management-reason" class="text-danger mt-1">
          {{ installedManagementReason }}
        </p>
        <div v-if="installedRows.length === 0" data-testid="web-mod-installed-empty" class="text-muted mt-1">
          暂无已安装数据包
        </div>
        <div v-else class="flex flex-col divide-y divide-accent/10 mt-1">
          <div
            v-for="row in installedRows"
            :key="row.packageId"
            :data-testid="`web-mod-installed-row-${row.packageId}`"
            class="flex items-center justify-between gap-2 py-2"
          >
            <div class="min-w-0">
              <p class="text-text break-all">{{ row.packageId }}</p>
              <p class="text-muted">v{{ row.version }} · {{ row.status === 'enabled' ? '已启用' : '已禁用' }}</p>
            </div>
            <div class="flex shrink-0 gap-2">
              <Button
                v-if="row.status === 'enabled'"
                class="justify-center"
                :icon="PowerOff"
                :disabled="isPreparing || installedManagementStatus === 'loading'"
                :data-testid="`web-mod-disable-${row.packageId}`"
                @click="disableInstalledPackage(row.packageId)"
              >
                禁用
              </Button>
              <Button
                v-else
                class="justify-center"
                :icon="Power"
                :disabled="isPreparing || installedManagementStatus === 'loading'"
                :data-testid="`web-mod-enable-${row.packageId}`"
                @click="enableInstalledPackage(row.packageId)"
              >
                启用
              </Button>
              <Button
                class="justify-center"
                :icon="Trash2"
                :disabled="isPreparing || installedManagementStatus === 'loading'"
                :data-testid="`web-mod-uninstall-${row.packageId}`"
                @click="uninstallInstalledPackage(row.packageId)"
              >
                卸载
              </Button>
            </div>
          </div>
        </div>
        <p v-if="lastDisableResult" data-testid="web-mod-disable-result" class="text-muted mt-2">
          禁用事务：{{ lastDisableResult.terminal.status === 'ready' ? '已完成' : '已阻断' }} ·
          settings {{ lastDisableResult.terminal.settingsWritten ? '已写入' : '未写入' }} ·
          mod-lock {{ lastDisableResult.terminal.lockfileWritten ? '已写入' : '未写入' }} ·
          startup {{ lastDisableResult.terminal.startupStateWritten ? '已写入' : '未写入' }} ·
          runtime {{ lastDisableResult.terminal.runtimePublicationExcluded ? '已排除' : '未排除' }} ·
          live registry {{ lastDisableResult.terminal.liveRegistrySwapped ? '已切换' : '未切换' }} ·
          handoff {{ lastDisableResult.terminal.appStartupHandoffAccepted ? '已接受' : '未接受' }}
        </p>
        <p v-if="lastEnableResult" data-testid="web-mod-enable-result" class="text-muted mt-2">
          启用事务：{{ lastEnableResult.terminal.status === 'ready' ? '已完成' : '已阻断' }} ·
          settings {{ lastEnableResult.terminal.settingsWritten ? '已写入' : '未写入' }} ·
          mod-lock {{ lastEnableResult.terminal.lockfileWritten ? '已写入' : '未写入' }} ·
          startup {{ lastEnableResult.terminal.startupStateWritten ? '已写入' : '未写入' }} ·
          package {{ lastEnableResult.terminal.packageFilesPreserved ? '已保留' : '未保留' }} ·
          runtime {{ lastEnableResult.terminal.runtimePublicationIncluded ? '已包含' : '未包含' }} ·
          live registry {{ lastEnableResult.terminal.liveRegistrySwapped ? '已切换' : '未切换' }} ·
          handoff {{ lastEnableResult.terminal.appStartupHandoffAccepted ? '已接受' : '未接受' }}
        </p>
        <p v-if="lastUninstallResult" data-testid="web-mod-uninstall-result" class="text-muted mt-2">
          卸载事务：{{ lastUninstallResult.terminal.status === 'ready' ? '已完成' : '已阻断' }} ·
          settings {{ lastUninstallResult.terminal.settingsWritten ? '已写入' : '未写入' }} ·
          mod-lock {{ lastUninstallResult.terminal.lockfileWritten ? '已写入' : '未写入' }} ·
          startup {{ lastUninstallResult.terminal.startupStateWritten ? '已写入' : '未写入' }} ·
          package {{ lastUninstallResult.terminal.packageFilesRemoved ? '已删除' : '未删除' }} ·
          runtime {{ lastUninstallResult.terminal.runtimePublicationExcluded ? '已排除' : '未排除' }} ·
          live registry {{ lastUninstallResult.terminal.liveRegistrySwapped ? '已切换' : '未切换' }} ·
          handoff {{ lastUninstallResult.terminal.appStartupHandoffAccepted ? '已接受' : '未接受' }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="border border-accent/20 rounded-xs p-2">
          <p class="text-muted mb-1">导入状态</p>
          <p data-testid="web-mod-import-status" class="text-text">{{ importStatusLabel }}</p>
        </div>
        <div class="border border-accent/20 rounded-xs p-2">
          <p class="text-muted mb-1">文件数量</p>
          <p data-testid="web-mod-file-count" class="text-text">{{ entry.lastFileCount.value }}</p>
        </div>
        <div class="border border-accent/20 rounded-xs p-2">
          <p class="text-muted mb-1">目标包</p>
          <p data-testid="web-mod-target-package" class="text-text break-all">{{ targetPackageLabel }}</p>
        </div>
        <div class="border border-accent/20 rounded-xs p-2">
          <p class="text-muted mb-1">预检状态</p>
          <p data-testid="web-mod-preflight-status" class="text-text">{{ preflightStatusLabel }}</p>
        </div>
        <div class="border border-accent/20 rounded-xs p-2">
          <p class="text-muted mb-1">派发状态</p>
          <p data-testid="web-mod-dispatch-status" class="text-text">{{ dispatchStatusLabel }}</p>
        </div>
        <div class="border border-accent/20 rounded-xs p-2">
          <p class="text-muted mb-1">浏览器暂存</p>
          <p data-testid="web-mod-persistence-status" class="text-text">{{ persistenceStatusLabel }}</p>
        </div>
      </div>

      <div v-if="selectedPackageLabel !== '无'" class="border border-accent/20 rounded-xs p-2 text-xs">
        <p class="text-muted mb-1">选择结果</p>
        <p data-testid="web-mod-selected-packages" class="text-text break-all">{{ selectedPackageLabel }}</p>
      </div>

      <div v-if="entry.lastError.value" class="border border-danger/40 rounded-xs p-2 text-xs text-danger">
        {{ entry.lastError.value.message }}
      </div>

      <div v-if="lastPreflight" class="border border-accent/20 rounded-xs p-2 text-xs space-y-1">
        <p class="text-muted">命令说明</p>
        <p data-testid="web-mod-preflight-reason" class="text-text">{{ commandReason }}</p>
        <p class="text-muted">
          命令派发：{{ commandDispatchLabel }} ·
          主机确认：<span data-testid="web-mod-host-ack-status">{{ hostAckStatusLabel }}</span> ·
          安装结果：<span data-testid="web-mod-install-outcome-status">{{ installOutcomeStatusLabel }}</span> ·
          UI/IPC：<span data-testid="web-mod-ui-ipc-delivery-status">{{ uiIpcDeliveryStatusLabel }}</span> ·
          运行时发布：<span data-testid="web-mod-runtime-publication-status">{{ runtimePublicationStatusLabel }}</span> ·
          Live Registry：<span data-testid="web-mod-live-registry-status">{{ liveRegistryStatusLabel }}</span> ·
          启动交接：<span data-testid="web-mod-app-startup-status">{{ appStartupStatusLabel }}</span> ·
          下次启动：<span data-testid="web-mod-startup-persistent-state-status">{{ startupPersistentStateStatusLabel }}</span> ·
          事务提交：{{ lastDispatch?.transactionCommitted ? '已提交' : '关闭' }} ·
          写入：{{ lastDispatch?.writeExecuted ? '已执行' : '关闭' }} ·
          运行时启用：{{ lastDispatch?.runtimeEnablementAllowed ? '允许' : '关闭' }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button class="flex-1 justify-center" :icon="Upload" :disabled="isPreparing" @click="runImportPreflight">
          {{ isPreparing ? '预检中...' : '选择数据包目录' }}
        </Button>
        <Button
          class="flex-1 justify-center"
          :icon="Download"
          :disabled="isPreparing || persistenceStore === null"
          @click="runRestorePreflight"
        >
          恢复暂存
        </Button>
        <Button class="justify-center" :icon="RotateCcw" :disabled="isPreparing" @click="resetImport">重置</Button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { Capacitor } from '@capacitor/core'
  import { Download, Power, PowerOff, RotateCcw, Trash2, Upload } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import {
    buildWebFilePickerSourceMountInput,
    useWebFilePickerImportEntry,
    type WebFilePickerAtomicTransactionCommitHost,
    type WebFilePickerInjectedAtomicTransactionCommitHost,
    type WebFilePickerInstallCommandDispatcherHost,
    type WebFilePickerImportSelector,
    type WebFilePickerPostCommitPersistentStateReader,
    type WebFilePickerPostCommitSettingsLockfileCommitSourceReader,
    type WebFilePickerPostCommitUiIpcDeliveryContinuationReader,
    type WebFilePickerPostCommitVerificationExecutor,
    type WebFilePickerPostCommitVerificationExecutorAdapterReader,
    type WebFilePickerMountedAppStartupHostEvidence,
    type WebFilePickerSourceInstallCommandDispatchResult
  } from '@/composables/useWebFilePickerImportEntry'
  import { getOfficialRegistrySet } from '@/domain/mods/officialContentBootstrap'
  import type { RegistrySet } from '@/domain/mods/registry'
  import {
    createWebIndexedDbImportPersistenceStore,
    type WebIndexedDbImportPersistenceStore
  } from '@/domain/mods/webIndexedDbImportPersistence'
  import {
    createWebIndexedDbSettingsLockfilePersistentWriterStore,
    type ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
  } from '@/domain/mods/thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
  import {
    createWebIndexedDbInstallTransactionLogPreparedStore,
    type ThirdPartyDataPackWebInstallTransactionLogPreparedStore
  } from '@/domain/mods/thirdPartyDataPackWebInstallTransactionLogPreparedStorageHost'
  import {
    getThirdPartyDataPackMountedAppStartupHostEvidence
  } from '@/domain/mods/thirdPartyDataPackMountedAppStartupHostConnection'
  import {
    createThirdPartyDataPackElectronDisableCommandRendererHost,
    type ThirdPartyDataPackElectronDisableCommandEnvelope,
    type ThirdPartyDataPackElectronDisableCommandResult
  } from '@/domain/mods/thirdPartyDataPackElectronDisableCommandBridge'
  import {
    createThirdPartyDataPackElectronUninstallCommandRendererHost,
    type ThirdPartyDataPackElectronUninstallCommandEnvelope,
    type ThirdPartyDataPackElectronUninstallCommandResult
  } from '@/domain/mods/thirdPartyDataPackElectronUninstallCommandBridge'
  import {
    createThirdPartyDataPackElectronEnableCommandRendererHost,
    type ThirdPartyDataPackElectronEnableCommandEnvelope,
    type ThirdPartyDataPackElectronEnableCommandResult
  } from '@/domain/mods/thirdPartyDataPackElectronEnableCommandBridge'
  import {
    createThirdPartyDataPackElectronInstalledStateRendererHost
  } from '@/domain/mods/thirdPartyDataPackElectronInstalledStateBridge'
  import type {
    ThirdPartyDataPackDisableTransactionResult
  } from '@/domain/mods/thirdPartyDataPackDisableTransaction'
  import type {
    ThirdPartyDataPackUninstallTransactionResult
  } from '@/domain/mods/thirdPartyDataPackUninstallTransaction'
  import type {
    ThirdPartyDataPackEnableTransactionResult
  } from '@/domain/mods/thirdPartyDataPackEnableTransaction'
  import type { PackageId } from '@/domain/mods/ids'
  import {
    useWebInstalledDataPackManagement,
    type WebInstalledDataPackManagementRow
  } from '@/composables/useWebInstalledDataPackManagement'

  const props = defineProps<{
    selectFiles?: WebFilePickerImportSelector
    officialRegistrySet?: RegistrySet
    persistenceStore?: WebIndexedDbImportPersistenceStore | null
    webSettingsLockfileStore?: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore | null
    webInstallTransactionLogStore?: ThirdPartyDataPackWebInstallTransactionLogPreparedStore | null
    dispatchTransactionCommand?: WebFilePickerInstallCommandDispatcherHost
    executeInjectedAtomicTransactionCommit?: WebFilePickerInjectedAtomicTransactionCommitHost
    executeAtomicTransactionCommit?: WebFilePickerAtomicTransactionCommitHost
    readSettingsLockfileCommitSource?: WebFilePickerPostCommitSettingsLockfileCommitSourceReader
    readPostCommitVerificationExecutorAdapter?: WebFilePickerPostCommitVerificationExecutorAdapterReader
    readPostCommitPersistentState?: WebFilePickerPostCommitPersistentStateReader
    executePostCommitVerification?: WebFilePickerPostCommitVerificationExecutor
    readPostCommitUiIpcDeliveryContinuationSource?: WebFilePickerPostCommitUiIpcDeliveryContinuationReader
    electronDisableCommand?: (
      envelope: ThirdPartyDataPackElectronDisableCommandEnvelope
    ) => Promise<ThirdPartyDataPackElectronDisableCommandResult>
    electronUninstallCommand?: (
      envelope: ThirdPartyDataPackElectronUninstallCommandEnvelope
    ) => Promise<ThirdPartyDataPackElectronUninstallCommandResult>
    electronEnableCommand?: (
      envelope: ThirdPartyDataPackElectronEnableCommandEnvelope
    ) => Promise<ThirdPartyDataPackElectronEnableCommandResult>
  }>()

  const createDefaultPersistenceStore = (): WebIndexedDbImportPersistenceStore | null => {
    if (Capacitor.isNativePlatform()) return null
    try {
      return createWebIndexedDbImportPersistenceStore()
    } catch {
      // IndexedDB can be unavailable in private/test contexts; keep the read-only preflight usable.
      return null
    }
  }

  const createDefaultWebSettingsLockfileStore =
    (): ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore | null => {
      if (Capacitor.isNativePlatform()) return null
      try {
        return createWebIndexedDbSettingsLockfilePersistentWriterStore()
      } catch {
        return null
      }
    }

  const createDefaultWebInstallTransactionLogStore =
    (): ThirdPartyDataPackWebInstallTransactionLogPreparedStore | null => {
      if (Capacitor.isNativePlatform()) return null
      try {
        return createWebIndexedDbInstallTransactionLogPreparedStore()
      } catch {
        return null
      }
    }

  const persistenceStore = props.persistenceStore === undefined
    ? createDefaultPersistenceStore()
    : props.persistenceStore
  const webSettingsLockfileStore = props.webSettingsLockfileStore === undefined
    ? createDefaultWebSettingsLockfileStore()
    : props.webSettingsLockfileStore
  const webInstallTransactionLogStore = props.webInstallTransactionLogStore === undefined
    ? createDefaultWebInstallTransactionLogStore()
    : props.webInstallTransactionLogStore
  const createDefaultElectronInstalledStateReader = () => {
    if (typeof window === 'undefined') return undefined
    const electronApi = (window as Window & {
      electronAPI?: {
        readThirdPartyDataPackInstalledState?: () => Promise<unknown>
      }
    }).electronAPI
    if (typeof electronApi?.readThirdPartyDataPackInstalledState !== 'function') return undefined
    const host = createThirdPartyDataPackElectronInstalledStateRendererHost({
      invoke: async() => await electronApi.readThirdPartyDataPackInstalledState!()
    })
    return host.read
  }
  const readElectronInstalledState = createDefaultElectronInstalledStateReader()
  const createDefaultElectronDisableCommand = () => {
    if (typeof window === 'undefined') return undefined
    const electronApi = (window as Window & {
      electronAPI?: {
        disableThirdPartyDataPack?: (envelope: unknown) => Promise<unknown>
      }
    }).electronAPI
    if (typeof electronApi?.disableThirdPartyDataPack !== 'function') return undefined
    const host = createThirdPartyDataPackElectronDisableCommandRendererHost({
      invoke: async(_channel, envelope) => await electronApi.disableThirdPartyDataPack!(envelope)
    })
    return host.disable
  }
  const electronDisableCommand = props.electronDisableCommand ?? createDefaultElectronDisableCommand()
  const createDefaultElectronUninstallCommand = () => {
    if (typeof window === 'undefined') return undefined
    const electronApi = (window as Window & {
      electronAPI?: {
        uninstallThirdPartyDataPack?: (envelope: unknown) => Promise<unknown>
      }
    }).electronAPI
    if (typeof electronApi?.uninstallThirdPartyDataPack !== 'function') return undefined
    const host = createThirdPartyDataPackElectronUninstallCommandRendererHost({
      invoke: async(_channel, envelope) => await electronApi.uninstallThirdPartyDataPack!(envelope)
    })
    return host.uninstall
  }
  const electronUninstallCommand =
    props.electronUninstallCommand ?? createDefaultElectronUninstallCommand()
  const createDefaultElectronEnableCommand = () => {
    if (typeof window === 'undefined') return undefined
    const electronApi = (window as Window & {
      electronAPI?: {
        enableThirdPartyDataPack?: (envelope: unknown) => Promise<unknown>
      }
    }).electronAPI
    if (typeof electronApi?.enableThirdPartyDataPack !== 'function') return undefined
    const host = createThirdPartyDataPackElectronEnableCommandRendererHost({
      invoke: async(_channel, envelope) => await electronApi.enableThirdPartyDataPack!(envelope)
    })
    return host.enable
  }
  const electronEnableCommand =
    props.electronEnableCommand ?? createDefaultElectronEnableCommand()
  const readMountedAppStartupHostEvidence =
    (): WebFilePickerMountedAppStartupHostEvidence | undefined => {
      const evidence = getThirdPartyDataPackMountedAppStartupHostEvidence()
      if (
        evidence === null
        || evidence.officialContentBootstrapped !== true
        || evidence.runtimeContentRegistryPublished !== true
        || evidence.thirdPartyStartupGateCompleted !== true
        || evidence.thirdPartyStartupGateAllowed !== true
        || evidence.gameAppCreated !== true
        || evidence.piniaCreated !== true
        || evidence.routerInstalled !== true
        || evidence.routerMounted !== true
      ) {
        return undefined
      }
      return Object.freeze({
        realAppStartupHostCalled: true,
        gameAppCreated: true,
        piniaCreated: true,
        routerMounted: true
      })
    }
  const entry = useWebFilePickerImportEntry({
    selectFiles: props.selectFiles,
    persistenceStore,
    webSettingsLockfileStore,
    webInstallTransactionLogStore,
    mountedAppStartupHostEvidence: readMountedAppStartupHostEvidence(),
    dispatchTransactionCommand: props.dispatchTransactionCommand,
    executeInjectedAtomicTransactionCommit: props.executeInjectedAtomicTransactionCommit,
    executeAtomicTransactionCommit: props.executeAtomicTransactionCommit,
    readSettingsLockfileCommitSource: props.readSettingsLockfileCommitSource,
    readPostCommitVerificationExecutorAdapter: props.readPostCommitVerificationExecutorAdapter,
    readPostCommitPersistentState: props.readPostCommitPersistentState,
    executePostCommitVerification: props.executePostCommitVerification,
    readPostCommitUiIpcDeliveryContinuationSource: props.readPostCommitUiIpcDeliveryContinuationSource
  })
  const restoreInstalledPackageSource = async() =>
    readElectronInstalledState === undefined
      ? await entry.restorePersistedImport()
      : await entry.restoreElectronInstalledSource()

  const installedManagement = useWebInstalledDataPackManagement({
    officialRegistrySet: props.officialRegistrySet ?? getOfficialRegistrySet(),
    settingsLockfileStore: readElectronInstalledState === undefined ? webSettingsLockfileStore : null,
    installedPackageStore: readElectronInstalledState === undefined ? persistenceStore : null,
    startupPersistentStateStore: persistenceStore,
    mountedAppStartupEvidence: () => readMountedAppStartupHostEvidence() !== undefined,
    electronDisableCommand,
    electronUninstallCommand,
    electronEnableCommand,
    readEnableMountInput: async(packageId: PackageId) => {
      const result = await restoreInstalledPackageSource()
      if (!isReadyImportStatus(result.status)) return null
      const source = entry.lastSource.value
      if (source === null) return null
      const mountInput = await buildWebFilePickerSourceMountInput({
        source,
        officialRegistrySet: props.officialRegistrySet ?? getOfficialRegistrySet()
      })
      if (
        mountInput.status !== 'ready'
        || !mountInput.selectedPackageIds.includes(packageId)
        || !mountInput.loadOrder.includes(packageId)
        || mountInput.blockedPackageIds.includes(packageId)
      ) {
        return null
      }
      return mountInput
    },
    readElectronInstalledState
  })
  const installedRows = computed<readonly WebInstalledDataPackManagementRow[]>(
    () => installedManagement.rows.value
  )
  const installedManagementStatus = computed(() => installedManagement.status.value)
  const lastDisableResult = computed(() => installedManagement.lastResult.value)
  const lastEnableResult = computed(() => installedManagement.lastEnableResult.value)
  const lastUninstallResult = computed(() => installedManagement.lastUninstallResult.value)
  const installedManagementStatusLabel = computed(() => {
    if (installedManagement.status.value === 'loading') return '读取中'
    if (installedManagement.status.value === 'failed') return '读取失败'
    if (installedManagement.status.value === 'ready') return '已就绪'
    if (installedManagement.status.value === 'blocked') return '已阻断'
    return '未读取'
  })
  const installedManagementReason = computed(() =>
    installedManagement.reason.value || ''
  )
  const isPreparing = ref(false)
  const isNativePlatform = computed(() => Capacitor.isNativePlatform())
  const lastPreflight = computed(() => entry.lastSourceInstallCommandPreflight.value)
  const lastDispatch = computed(() => entry.lastSourceInstallCommandDispatch.value)

  const importStatusLabel = computed(() => {
    if (isPreparing.value) return '预检中'
    if (entry.status.value === 'idle') return '等待选择'
    if (entry.status.value === 'selecting') return '选择中'
    if (entry.status.value === 'importing') return '读取中'
    if (entry.status.value === 'restoring') return '恢复中'
    if (entry.status.value === 'ready') return '已读取'
    if (entry.status.value === 'persisted') return '已暂存'
    if (entry.status.value === 'restored') return '已恢复'
    if (entry.status.value === 'cancelled') return '已取消'
    return '失败'
  })

  const preflightStatusLabel = computed(() => lastPreflight.value?.status ?? '未运行')
  const dispatchStatusLabel = computed(() => lastDispatch.value?.transactionCommandDispatcherSourceStatus ?? '未运行')
  const persistenceStatusLabel = computed(() => {
    if (entry.lastEffects.value.indexedDbImportPersisted) return '已写入 IndexedDB'
    if (entry.lastSource.value?.identity.kind === 'electron-readonly-directory') return '已从程序目录恢复'
    if (entry.status.value === 'restored') return '已从 IndexedDB 恢复'
    if (persistenceStore === null) return '未启用'
    if (entry.status.value === 'failed') return '未写入'
    return '等待写入'
  })
  const commandDispatchLabel = computed(() => lastDispatch.value?.commandDispatched ? '已到达派发边界' : '关闭')
  const hostAckStatusLabel = computed(() => {
    const status = lastDispatch.value
      ?.transactionCommandDispatcherSource
      ?.transactionCommandDispatcherHostStatus
    const hostKind = lastDispatch.value?.transactionCommandDispatcherHostKind
    if (status === 'dispatched') {
      if (hostKind === 'renderer') return '已确认（Electron）'
      if (hostKind === 'web') return '已确认（Web）'
      if (hostKind === 'injected') return '已确认（注入）'
      if (hostKind === 'local-fallback') return '本地预检'
      return '已确认'
    }
    if (status === 'blocked') return '已阻断'
    return '未返回'
  })
  const terminalOutcomeSucceeded = computed(() => {
    const terminal = lastDispatch.value?.ordinaryInstallTransactionTerminalConnection
    return terminal?.status === 'ready'
      && terminal.outcomeKind === 'success'
      && terminal.effects?.successOutcomeAccepted === true
  })
  const terminalOutcomeBlocksRuntime = computed(() => {
    const terminal = lastDispatch.value?.ordinaryInstallTransactionTerminalConnection
    return terminal?.status === 'ready' && !terminalOutcomeSucceeded.value
  })
  const installOutcomeStatusLabel = computed(() => {
    const terminal = lastDispatch.value?.ordinaryInstallTransactionTerminalConnection
    if (terminal?.status === 'ready') {
      if (terminal.outcomeKind === 'failure') return terminal.retryable ? '安装失败，可重试' : '安装失败'
      if (terminal.outcomeKind === 'retry') return '等待重试'
      if (terminal.outcomeKind === 'rollback') return terminal.rollbackRecoverySettled ? '已回滚' : '回滚待确认'
      if (terminalOutcomeSucceeded.value) return '提交后校验已确认'
      return '终端已阻断'
    }
    if (terminal?.status === 'blocked') return '终端已阻断'
    const acknowledgement = lastDispatch.value?.installCommandPostCommitAcknowledgement
    if (acknowledgement === null || acknowledgement === undefined) return '未运行'
    if (acknowledgement.status === 'ready') return '提交后校验已确认'
    if (acknowledgement.status === 'skipped') return '未要求'
    const atomicStatus = acknowledgement.atomicTransactionCommitExecutorSourceStatus
    if (atomicStatus === undefined) return '等待事务主机'
    if (atomicStatus !== 'executed') return '事务主机已阻断'
    if (acknowledgement.postCommitVerificationReadAcknowledgementSourceStatus === undefined) return '等待提交后校验'
    return '已阻断'
  })
  const uiIpcDeliveryStatusLabel = computed(() => {
    const continuation = lastDispatch.value?.postCommitUiIpcDeliveryContinuation
    if (continuation === null || continuation === undefined) {
      const acknowledgement = lastDispatch.value?.installCommandPostCommitAcknowledgement
      if (acknowledgement?.status === 'ready') return '等待终端交付'
      return '未运行'
    }
    if (continuation.status === 'ready') {
      if (continuation.selectedPlatform === 'electron') return '已送达（Electron）'
      if (continuation.selectedPlatform === 'web') return '已送达（Web）'
      return '已送达'
    }
    if (continuation.status === 'skipped') return '未要求'
    return '已阻断'
  })
  const runtimePublicationStatusLabel = computed(() => {
    if (terminalOutcomeBlocksRuntime.value) return '已阻断'
    const status = lastDispatch.value?.runtimePublicationCommitAfterPostCommitVerificationStatus
    if (status === 'accepted') return '已确认'
    if (status === 'skipped') return '未要求'
    if (status === 'blocked') return '已阻断'
    return '未运行'
  })
  const liveRegistryStatusLabel = computed(() => {
    if (terminalOutcomeBlocksRuntime.value) return '已阻断'
    const status = lastDispatch.value?.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus
    if (status === 'swapped') return '已切换'
    if (status === 'skipped') return '未要求'
    if (status === 'blocked') return '已阻断'
    return '未运行'
  })
  const appStartupStatusLabel = computed(() => {
    if (terminalOutcomeBlocksRuntime.value) return '已阻断'
    const readinessStatus = lastDispatch.value?.runtimePublicationCommitAppStartupReadinessStatus
    const hostStatus = lastDispatch.value?.runtimePublicationCommitAppStartupHostConnectionStatus
    if (readinessStatus === 'ready' && hostStatus === 'accepted') {
      const effects = lastDispatch.value?.runtimePublicationCommitAppStartupHostConnection?.effects
      if (
        effects?.realAppStartupHostCalled === true
        && effects.gameAppCreated === true
        && effects.piniaCreated === true
        && effects.routerMounted === true
      ) {
        return '已接入已挂载应用'
      }
      return '已接受'
    }
    if (readinessStatus === 'ready' && (hostStatus === undefined || hostStatus === 'deferred')) return '等待已挂载应用'
    if (readinessStatus === 'blocked' || hostStatus === 'blocked') return '已阻断'
    if (readinessStatus === 'skipped' || hostStatus === 'skipped') return '未要求'
    return '未运行'
  })
  const startupPersistentStateStatusLabel = computed(() => {
    const status = lastDispatch.value?.webStartupPersistentStateWriteStatus
      ?? lastDispatch.value?.electronStartupPersistentStateWriteStatus
    if (status === 'written') return '已写入'
    if (status === 'blocked') return '已阻断'
    if (status === 'skipped') return '未写入'
    return '未运行'
  })
  const commandReason = computed(() => lastDispatch.value?.reason ?? lastPreflight.value?.reason ?? '未运行')
  const targetPackageLabel = computed(() =>
    lastEnableResult.value?.terminal.targetPackageId
      ?? lastDisableResult.value?.terminal.targetPackageId
      ?? lastUninstallResult.value?.terminal.targetPackageId
      ?? lastPreflight.value?.preflight?.targetPackageId
      ?? lastPreflight.value?.selectedPackageIds[0]
      ?? '未选择'
  )
  const selectedPackageLabel = computed(() =>
    lastPreflight.value && lastPreflight.value.selectedPackageIds.length > 0
      ? lastPreflight.value.selectedPackageIds.join(', ')
      : '无'
  )

  const visibleImportPanelProbeResultEventName = 'taoyuan:third-party-visible-import-panel-result'
  const visibleDisablePanelProbeResultEventName = 'taoyuan:third-party-visible-disable-panel-result'
  const visibleEnablePanelProbeResultEventName = 'taoyuan:third-party-visible-enable-panel-result'
  const visibleUninstallPanelProbeResultEventName = 'taoyuan:third-party-visible-uninstall-panel-result'

  type VisibleImportPanelProbeWindow = Window & {
    __TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__?: WebFilePickerSourceInstallCommandDispatchResult
    __TAOYUAN_VISIBLE_DISABLE_PANEL_RESULT__?: ThirdPartyDataPackDisableTransactionResult
    __TAOYUAN_VISIBLE_ENABLE_PANEL_RESULT__?: ThirdPartyDataPackEnableTransactionResult
    __TAOYUAN_VISIBLE_UNINSTALL_PANEL_RESULT__?: ThirdPartyDataPackUninstallTransactionResult
  }

  const shouldPublishVisibleImportPanelProbeResult = (): boolean => {
    if (typeof window === 'undefined') return false
    const search = new URLSearchParams(window.location.search)
    return search.get('taoyuanContentProbe') === '1'
      && (
        search.get('taoyuanThirdPartyVisibleImportProbe') === '1'
        || search.get('taoyuanThirdPartyVisibleImportRollbackProbe') === '1'
        || search.get('taoyuanThirdPartyVisibleImportFailureProbe') === '1'
      )
  }

  const publishVisibleImportPanelProbeResult = (
    result: WebFilePickerSourceInstallCommandDispatchResult
  ): void => {
    if (!shouldPublishVisibleImportPanelProbeResult()) return
    const probeWindow = window as VisibleImportPanelProbeWindow
    Object.defineProperty(probeWindow, '__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__', {
      value: result,
      configurable: true
    })
    window.dispatchEvent(new CustomEvent(visibleImportPanelProbeResultEventName))
  }

  const shouldPublishVisibleDisablePanelProbeResult = (): boolean => {
    if (typeof window === 'undefined') return false
    const search = new URLSearchParams(window.location.search)
    return search.get('taoyuanContentProbe') === '1'
      && search.get('taoyuanThirdPartyVisibleDisableProbe') === '1'
  }

  const publishVisibleDisablePanelProbeResult = (
    result: ThirdPartyDataPackDisableTransactionResult
  ): void => {
    if (!shouldPublishVisibleDisablePanelProbeResult()) return
    const probeWindow = window as VisibleImportPanelProbeWindow
    Object.defineProperty(probeWindow, '__TAOYUAN_VISIBLE_DISABLE_PANEL_RESULT__', {
      value: result,
      configurable: true
    })
    window.dispatchEvent(new CustomEvent(visibleDisablePanelProbeResultEventName))
  }

  const shouldPublishVisibleEnablePanelProbeResult = (): boolean => {
    if (typeof window === 'undefined') return false
    const search = new URLSearchParams(window.location.search)
    return search.get('taoyuanContentProbe') === '1'
      && search.get('taoyuanThirdPartyVisibleEnableProbe') === '1'
  }

  const publishVisibleEnablePanelProbeResult = (
    result: ThirdPartyDataPackEnableTransactionResult
  ): void => {
    if (!shouldPublishVisibleEnablePanelProbeResult()) return
    const probeWindow = window as VisibleImportPanelProbeWindow
    Object.defineProperty(probeWindow, '__TAOYUAN_VISIBLE_ENABLE_PANEL_RESULT__', {
      value: result,
      configurable: true
    })
    window.dispatchEvent(new CustomEvent(visibleEnablePanelProbeResultEventName))
  }

  const shouldPublishVisibleUninstallPanelProbeResult = (): boolean => {
    if (typeof window === 'undefined') return false
    const search = new URLSearchParams(window.location.search)
    return search.get('taoyuanContentProbe') === '1'
      && search.get('taoyuanThirdPartyVisibleUninstallProbe') === '1'
  }

  const publishVisibleUninstallPanelProbeResult = (
    result: ThirdPartyDataPackUninstallTransactionResult
  ): void => {
    if (!shouldPublishVisibleUninstallPanelProbeResult()) return
    const probeWindow = window as VisibleImportPanelProbeWindow
    Object.defineProperty(probeWindow, '__TAOYUAN_VISIBLE_UNINSTALL_PANEL_RESULT__', {
      value: result,
      configurable: true
    })
    window.dispatchEvent(new CustomEvent(visibleUninstallPanelProbeResultEventName))
  }

  const dispatchCurrentImportSource =
    async(packageId?: PackageId): Promise<WebFilePickerSourceInstallCommandDispatchResult> =>
      await entry.dispatchInstallCommandFromSource({
        confirmed: true,
        packageId,
        officialRegistrySet: props.officialRegistrySet ?? getOfficialRegistrySet(),
        dispatchTransactionCommand: props.dispatchTransactionCommand,
        executeInjectedAtomicTransactionCommit: props.executeInjectedAtomicTransactionCommit,
        executeAtomicTransactionCommit: props.executeAtomicTransactionCommit,
        readSettingsLockfileCommitSource: props.readSettingsLockfileCommitSource,
        readPostCommitVerificationExecutorAdapter: props.readPostCommitVerificationExecutorAdapter,
        readPostCommitPersistentState: props.readPostCommitPersistentState,
        executePostCommitVerification: props.executePostCommitVerification,
        readPostCommitUiIpcDeliveryContinuationSource: props.readPostCommitUiIpcDeliveryContinuationSource,
        webSettingsLockfileStore,
        webInstallTransactionLogStore,
        mountedAppStartupHostEvidence: readMountedAppStartupHostEvidence()
      })

  const isReadyImportStatus = (status: string): boolean =>
    status === 'ready' || status === 'persisted' || status === 'restored'

  const runImportPreflight = async(): Promise<void> => {
    if (isNativePlatform.value || isPreparing.value) return
    isPreparing.value = true
    try {
      const result = await entry.pickFiles()
      if (!isReadyImportStatus(result.status)) return
      publishVisibleImportPanelProbeResult(await dispatchCurrentImportSource())
      await installedManagement.refresh()
    } finally {
      isPreparing.value = false
      }
  }

  const runRestorePreflight = async(): Promise<void> => {
    if (isNativePlatform.value || isPreparing.value || persistenceStore === null) return
    isPreparing.value = true
    try {
      const result = await entry.restorePersistedImport()
      if (!isReadyImportStatus(result.status)) return
      publishVisibleImportPanelProbeResult(await dispatchCurrentImportSource())
      await installedManagement.refresh()
    } finally {
      isPreparing.value = false
    }
  }

  const resetImport = (): void => {
    void entry.reset()
  }

  const disableInstalledPackage = async(packageId: string): Promise<void> => {
    if (isNativePlatform.value || isPreparing.value) return
    isPreparing.value = true
    try {
      const result = await installedManagement.disable(packageId as PackageId)
      if (result !== null) publishVisibleDisablePanelProbeResult(result)
    } finally {
      isPreparing.value = false
    }
  }

  const uninstallInstalledPackage = async(packageId: string): Promise<void> => {
    if (isNativePlatform.value || isPreparing.value) return
    isPreparing.value = true
    try {
      const result = await installedManagement.uninstall(packageId as PackageId)
      if (result !== null) publishVisibleUninstallPanelProbeResult(result)
    } finally {
      isPreparing.value = false
    }
  }

  const enableInstalledPackage = async(packageId: string): Promise<void> => {
    if (isNativePlatform.value || isPreparing.value) return
    isPreparing.value = true
    try {
      const result = await installedManagement.enable(packageId as PackageId)
      if (result !== null) publishVisibleEnablePanelProbeResult(result)
    } finally {
      isPreparing.value = false
    }
  }

  onMounted(() => {
    void installedManagement.refresh()
  })
</script>
