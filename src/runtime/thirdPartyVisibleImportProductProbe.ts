import {
  getOfficialItemDef,
  getOfficialRecipeDef,
  getOfficialShopOfferDefs
} from '@/domain/mods/contentAccess'
import type { PackageId } from '@/domain/mods/ids'
import type { ThirdPartyDataPackDisableTransactionResult } from '@/domain/mods/thirdPartyDataPackDisableTransaction'
import type { ThirdPartyDataPackEnableTransactionResult } from '@/domain/mods/thirdPartyDataPackEnableTransaction'
import type {
  ThirdPartyDataPackUninstallTransactionResult
} from '@/domain/mods/thirdPartyDataPackUninstallTransaction'
import { CURRENT_GAME_VERSION } from '@/domain/mods/officialContentVersions'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import type { WebFilePickerImportFile } from '@/domain/mods/webFilePickerImportSource'
import {
  createWebIndexedDbImportPersistenceStore,
  type WebIndexedDbImportPersistenceStore
} from '@/domain/mods/webIndexedDbImportPersistence'
import {
  useWebFilePickerImportEntry,
  type WebFilePickerSourceInstallCommandDispatchResult
} from '@/composables/useWebFilePickerImportEntry'

const packageId = 'product_probe_pack' as PackageId
const itemId = `${packageId}:linen_ribbon`
const recipeId = `${packageId}:linen_ribbon_snack`
const shopOfferId = `${packageId}:shop/wanwupu/linen_ribbon/0`
const itemRegistryId = 'taoyuan:item'
const recipeRegistryId = 'taoyuan:recipe'
const shopOfferRegistryId = 'taoyuan:shop_offer'
export const visibleImportPanelProbeResultEventName =
  'taoyuan:third-party-visible-import-panel-result'
export const visibleEnablePanelProbeResultEventName =
  'taoyuan:third-party-visible-enable-panel-result'

type VisibleImportProductProbeEntrypoint = 'composable' | 'main-menu-panel'
type VisibleImportProductProbePackageVariant = 'v1' | 'v2'
type VisibleImportProductProbeOperation = 'install' | 'enable' | 'upgrade' | 'rollback' | 'failure'

const visibleImportProductProbeFixtures = {
  v1: {
    version: '1.0.0',
    itemNameFallback: 'Product Probe Linen Ribbon',
    recipeNameFallback: 'Product Probe Ribbon Snack',
    shopOfferNameFallback: 'Product Probe Ribbon Stand'
  },
  v2: {
    version: '1.1.0',
    itemNameFallback: 'Product Probe Linen Ribbon v2',
    recipeNameFallback: 'Product Probe Ribbon Snack v2',
    shopOfferNameFallback: 'Product Probe Ribbon Stand v2'
  }
} as const satisfies Record<VisibleImportProductProbePackageVariant, {
  readonly version: string
  readonly itemNameFallback: string
  readonly recipeNameFallback: string
  readonly shopOfferNameFallback: string
}>

const expectedItemName = visibleImportProductProbeFixtures.v1.itemNameFallback
const expectedRecipeName = visibleImportProductProbeFixtures.v1.recipeNameFallback
const expectedShopOfferName = visibleImportProductProbeFixtures.v1.shopOfferNameFallback

const packageVariantForOperation = (
  operation: VisibleImportProductProbeOperation | undefined
): VisibleImportProductProbePackageVariant =>
  operation === 'upgrade' ? 'v2' : 'v1'

export interface RunThirdPartyVisibleImportProductProbeOptions {
  readonly persistSource?: boolean
  readonly persistenceStore?: WebIndexedDbImportPersistenceStore | null
  readonly entrypoint?: VisibleImportProductProbeEntrypoint
  readonly operation?: VisibleImportProductProbeOperation
}

export interface RunThirdPartyVisibleDisableProductProbeOptions {
  readonly targetPackageId?: PackageId
  readonly expectBlocked?: boolean
}

export interface RunThirdPartyVisibleUninstallProductProbeOptions {
  readonly targetPackageId?: PackageId
  readonly expectBlocked?: boolean
}

export interface ThirdPartyVisibleImportProductProbeResult {
  readonly schemaVersion: 1
  readonly status: 'ready' | 'blocked'
  readonly reason: string
  readonly entrypoint: VisibleImportProductProbeEntrypoint
  readonly mainMenuPanelOpened: boolean
  readonly panelImportButtonClicked: boolean
  readonly defaultFileInputSelectorUsed: boolean
  readonly targetPackageId: string
  readonly itemId: string
  readonly itemNameFallback?: string
  readonly recipeId: string
  readonly recipeNameFallback?: string
  readonly shopOfferId: string
  readonly shopOfferNameFallback?: string
  readonly fileCount: number
  readonly pickStatus: string
  readonly panelStatusLabels: ThirdPartyVisibleImportPanelStatusLabels
  readonly dispatchPreflightStatus: string | null
  readonly discoveryStatus: string | null
  readonly transactionCommandDispatcherHostKind: string | null
  readonly transactionCommandDispatcherSourceStatus: string | null
  readonly installCommandPostCommitAcknowledgementStatus: string | null
  readonly postCommitVerificationExecutorHostMode: string | null
  readonly postCommitUiIpcDeliveryContinuationStatus: string | null
  readonly ordinaryInstallTransactionTerminalConnectionStatus: string | null
  readonly ordinaryInstallTransactionOutcomeKind: string | null
  readonly installTransactionLogPreparedStatus: string | null
  readonly installTransactionLogPreparedStorageKind: string | null
  readonly installTransactionLogPreparedPersistentReadVerificationStatus: string | null
  readonly installTransactionCommitFinalizationStatus: string | null
  readonly runtimePublicationCommitAfterPostCommitVerificationStatus: string | null
  readonly runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: string | null
  readonly runtimePublicationCommitAppStartupReadinessStatus: string | null
  readonly runtimePublicationCommitAppStartupHostConnectionStatus: string | null
  readonly webStartupPersistentStateWriteStatus: string | null
  readonly electronStartupPersistentStateWriteStatus: string | null
  readonly selectedPackageCount: number
  readonly blockedPackageCount: number
  readonly loadOrderCount: number
  readonly expectedPackageVersion?: string
  readonly registryCount?: number
  readonly entryCount?: number
  readonly packageCount?: number
  readonly diagnosticsCount: number
  readonly contentAccessItemVisibleBefore: boolean
  readonly contentAccessItemVisibleAfter: boolean
  readonly contentAccessRecipeVisibleBefore: boolean
  readonly contentAccessRecipeVisibleAfter: boolean
  readonly contentAccessShopOfferVisibleBefore: boolean
  readonly contentAccessShopOfferVisibleAfter: boolean
  readonly effects: {
    readonly commandDispatched: boolean
    readonly packageFilesWritten: boolean
    readonly settingsWritten: boolean
    readonly lockfileWritten: boolean
    readonly rendererLiveRegistrySwapped: boolean
    readonly runtimeEnablementAllowed: boolean
    readonly uiIpcResponseDelivered: boolean
    readonly transactionCommitted: boolean
    readonly transactionLogPrepared: boolean
    readonly transactionLogRead: boolean
    readonly startupPersistentStateWritten: boolean
    readonly realNormalStartupHostCalled: boolean
    readonly realAppStartupHostCalled: boolean
    readonly gameAppCreated: boolean
    readonly piniaCreated: boolean
    readonly routerMounted: boolean
    readonly savesWritten: false
    readonly cacheWritten: false
    readonly transactionLogWritten: boolean
    readonly rollbackExecuted: boolean
    readonly diagnosticsWritten: false
  }
  readonly operation?: 'install' | 'disable' | 'enable' | 'upgrade' | 'uninstall' | 'rollback' | 'failure'
  readonly disableButtonClicked?: boolean
  readonly enableButtonClicked?: boolean
  readonly uninstallButtonClicked?: boolean
  readonly disableTerminalStatus?: 'ready' | 'blocked' | null
  readonly disableTargetPackageId?: string | null
  readonly disableSelectedPackageCount?: number
  readonly disableBlockedPackageCount?: number
  readonly disableLoadOrderCount?: number
  readonly disableRegistryCount?: number
  readonly disableEntryCount?: number
  readonly disablePackageCount?: number
  readonly disableSettingsWritten?: boolean
  readonly disableLockfileWritten?: boolean
  readonly disableStartupStateWritten?: boolean
  readonly disablePackageFilesPreserved?: boolean
  readonly disableRuntimePublicationExcluded?: boolean
  readonly disableLiveRegistrySwapped?: boolean
  readonly disableAppStartupHandoffAccepted?: boolean
  readonly enableTerminalStatus?: 'ready' | 'blocked' | null
  readonly enableTargetPackageId?: string | null
  readonly enableSelectedPackageCount?: number
  readonly enableBlockedPackageCount?: number
  readonly enableLoadOrderCount?: number
  readonly enableRegistryCount?: number
  readonly enableEntryCount?: number
  readonly enablePackageCount?: number
  readonly enableSettingsWritten?: boolean
  readonly enableLockfileWritten?: boolean
  readonly enableStartupStateWritten?: boolean
  readonly enablePackageFilesPreserved?: boolean
  readonly enableRuntimePublicationIncluded?: boolean
  readonly enableLiveRegistrySwapped?: boolean
  readonly enableAppStartupHandoffAccepted?: boolean
  readonly uninstallTerminalStatus?: 'ready' | 'blocked' | null
  readonly uninstallTargetPackageId?: string | null
  readonly uninstallSelectedPackageCount?: number
  readonly uninstallBlockedPackageCount?: number
  readonly uninstallLoadOrderCount?: number
  readonly uninstallRegistryCount?: number
  readonly uninstallEntryCount?: number
  readonly uninstallPackageCount?: number
  readonly uninstallSettingsWritten?: boolean
  readonly uninstallLockfileWritten?: boolean
  readonly uninstallStartupStateWritten?: boolean
  readonly uninstallPackageFilesRemoved?: boolean
  readonly uninstallRuntimePublicationExcluded?: boolean
  readonly uninstallLiveRegistrySwapped?: boolean
  readonly uninstallAppStartupHandoffAccepted?: boolean
  readonly blockedReason?: string
}

export interface ThirdPartyVisibleImportPanelStatusLabels {
  readonly importStatus?: string
  readonly targetPackage?: string
  readonly preflightStatus?: string
  readonly dispatchStatus?: string
  readonly persistenceStatus?: string
  readonly hostAckStatus?: string
  readonly installOutcomeStatus?: string
  readonly uiIpcDeliveryStatus?: string
  readonly runtimePublicationStatus?: string
  readonly liveRegistryStatus?: string
  readonly appStartupStatus?: string
  readonly startupPersistentStateStatus?: string
  readonly installedManagementStatus?: string
  readonly disableResult?: string
  readonly enableResult?: string
  readonly uninstallResult?: string
}

type MutableThirdPartyVisibleImportPanelStatusLabels = {
  -readonly [Key in keyof ThirdPartyVisibleImportPanelStatusLabels]?:
    ThirdPartyVisibleImportPanelStatusLabels[Key]
}

interface VisibleImportProbeExecution {
  readonly dispatchResult: WebFilePickerSourceInstallCommandDispatchResult | null
  readonly enableTransactionResult?: ThirdPartyDataPackEnableTransactionResult | null
  readonly fileCount: number
  readonly pickStatus: string
  readonly panelStatusLabels: ThirdPartyVisibleImportPanelStatusLabels
  readonly entrypoint: VisibleImportProductProbeEntrypoint
  readonly operation?: VisibleImportProductProbeOperation
  readonly mainMenuPanelOpened: boolean
  readonly panelImportButtonClicked: boolean
  readonly enableButtonClicked?: boolean
  readonly defaultFileInputSelectorUsed: boolean
  readonly blockedReason?: string
}

interface VisibleDisableProbeExecution {
  readonly transactionResult: ThirdPartyDataPackDisableTransactionResult | null
  readonly targetPackageId: PackageId
  readonly panelStatusLabels: ThirdPartyVisibleImportPanelStatusLabels
  readonly entrypoint: 'main-menu-panel'
  readonly mainMenuPanelOpened: boolean
  readonly disableButtonClicked: boolean
  readonly contentAccessItemVisibleBefore: boolean
  readonly contentAccessItemVisibleAfter: boolean
  readonly contentAccessRecipeVisibleBefore: boolean
  readonly contentAccessRecipeVisibleAfter: boolean
  readonly contentAccessShopOfferVisibleBefore: boolean
  readonly contentAccessShopOfferVisibleAfter: boolean
  readonly blockedReason?: string
}

interface VisibleUninstallProbeExecution {
  readonly transactionResult: ThirdPartyDataPackUninstallTransactionResult | null
  readonly targetPackageId: PackageId
  readonly panelStatusLabels: ThirdPartyVisibleImportPanelStatusLabels
  readonly entrypoint: 'main-menu-panel'
  readonly mainMenuPanelOpened: boolean
  readonly uninstallButtonClicked: boolean
  readonly contentAccessItemVisibleBefore: boolean
  readonly contentAccessItemVisibleAfter: boolean
  readonly contentAccessRecipeVisibleBefore: boolean
  readonly contentAccessRecipeVisibleAfter: boolean
  readonly contentAccessShopOfferVisibleBefore: boolean
  readonly contentAccessShopOfferVisibleAfter: boolean
  readonly blockedReason?: string
}

type VisibleImportPanelProbeWindow = Window & {
  __TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__?: WebFilePickerSourceInstallCommandDispatchResult
  __TAOYUAN_VISIBLE_DISABLE_PANEL_RESULT__?: ThirdPartyDataPackDisableTransactionResult
  __TAOYUAN_VISIBLE_ENABLE_PANEL_RESULT__?: ThirdPartyDataPackEnableTransactionResult
  __TAOYUAN_VISIBLE_UNINSTALL_PANEL_RESULT__?: ThirdPartyDataPackUninstallTransactionResult
}

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = (variant: VisibleImportProductProbePackageVariant = 'v1') => ({
  id: packageId,
  name: {
    key: `${packageId}.package.name`,
    fallback: 'Product Probe Pack'
  },
  version: visibleImportProductProbeFixtures[variant].version,
  gameVersion: CURRENT_GAME_VERSION,
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: {
    'zh-CN': 'locales/zh-CN.json'
  },
  authors: [
    {
      name: 'Product Probe',
      role: 'developer'
    }
  ],
  license: 'MIT',
  dependencies: [],
  entrypoints: {
    [itemRegistryId]: ['data/items.json'],
    [recipeRegistryId]: ['data/recipes.json'],
    [shopOfferRegistryId]: ['data/shop-offers.json']
  }
})

const createItem = (variant: VisibleImportProductProbePackageVariant = 'v1') => ({
  id: itemId,
  name: {
    key: `${packageId}.item.linen_ribbon.name`,
    fallback: visibleImportProductProbeFixtures[variant].itemNameFallback
  },
  category: 'gift',
  description: {
    key: `${packageId}.item.linen_ribbon.description`,
    fallback: 'Synthetic item used by the packaged visible import runtime probe.'
  },
  sellPrice: 8,
  edible: false,
  tags: [`${packageId}:soft_gift`]
})

const createRecipe = (variant: VisibleImportProductProbePackageVariant = 'v1') => ({
  id: recipeId,
  name: {
    key: `${packageId}.recipe.linen_ribbon_snack.name`,
    fallback: visibleImportProductProbeFixtures[variant].recipeNameFallback
  },
  ingredients: [
    {
      type: 'item',
      itemId,
      quantity: 1
    }
  ],
  outputItemId: itemId,
  outputQuantity: 1,
  effect: {
    staminaRestore: 2
  },
  unlockSource: 'Product probe',
  description: {
    key: `${packageId}.recipe.linen_ribbon_snack.description`,
    fallback: 'Synthetic recipe used by the packaged visible import runtime probe.'
  }
})

const createShopOffer = (variant: VisibleImportProductProbePackageVariant = 'v1') => ({
  id: shopOfferId,
  shopId: 'taoyuan:wanwupu',
  itemId,
  name: {
    key: `${packageId}.shop_offer.linen_ribbon.name`,
    fallback: visibleImportProductProbeFixtures[variant].shopOfferNameFallback
  },
  description: {
    key: `${packageId}.shop_offer.linen_ribbon.description`,
    fallback: 'Synthetic shop offer used by the packaged visible import runtime probe.'
  },
  groupId: 'product-probe',
  groupName: {
    key: `${packageId}.shop_offer.group.product_probe`,
    fallback: 'Product Probe'
  },
  purchaseKind: 'item',
  price: 12,
  quantity: 1,
  sortOrder: 9999
})

const createFile = (path: string, text: string): WebFilePickerImportFile => Object.freeze({
  name: path.split('/').pop() ?? path,
  webkitRelativePath: path,
  size: text.length,
  text: async() => text
})

const createVisibleImportFiles = (
  variant: VisibleImportProductProbePackageVariant = 'v1'
): readonly WebFilePickerImportFile[] => Object.freeze([
  createFile('product-probe-pack/manifest.json', toJson(createManifest(variant))),
  createFile('product-probe-pack/locales/zh-CN.json', '{}\n'),
  createFile('product-probe-pack/data/items.json', toJson([createItem(variant)])),
  createFile('product-probe-pack/data/recipes.json', toJson([createRecipe(variant)])),
  createFile('product-probe-pack/data/shop-offers.json', toJson([createShopOffer(variant)]))
])

const diagnosticsCountFor = (
  dispatchResult: WebFilePickerSourceInstallCommandDispatchResult | null
): number => {
  if (dispatchResult === null) return 0
  return [
    dispatchResult.preflight?.diagnostics,
    dispatchResult.installCommandPostCommitAcknowledgement?.diagnostics,
    dispatchResult.installTransactionLogPrepared?.diagnostics,
    dispatchResult.installTransactionLogPreparedPersistentReadVerification?.diagnostics,
    dispatchResult.installTransactionCommitFinalization?.diagnostics,
    dispatchResult.postCommitUiIpcDeliveryContinuation?.diagnostics,
    dispatchResult.ordinaryInstallTransactionTerminalConnection?.diagnostics,
    dispatchResult.runtimePublicationCommitAfterPostCommitVerification?.diagnostics,
    dispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnection?.diagnostics,
    dispatchResult.runtimePublicationCommitAppStartupReadiness?.diagnostics,
    dispatchResult.runtimePublicationCommitAppStartupHostConnection?.diagnostics
  ].reduce((total, diagnostics) => total + (Array.isArray(diagnostics) ? diagnostics.length : 0), 0)
}

const hasReadyVisibleImportDispatch = (
  execution: VisibleImportProbeExecution,
  contentAccessItemVisibleAfter: boolean,
  contentAccessRecipeVisibleAfter: boolean,
  contentAccessShopOfferVisibleAfter: boolean
): boolean => {
  const dispatchResult = execution.dispatchResult
  const enableTerminal = execution.enableTransactionResult?.terminal ?? null
  const appStartupHostEffects =
    dispatchResult?.runtimePublicationCommitAppStartupHostConnection?.effects
  const isEnable = execution.operation === 'enable'
  const isRollback = execution.operation === 'rollback'
  const isFailure = execution.operation === 'failure'
  const interactionReady = isEnable
    ? execution.enableButtonClicked === true && !execution.defaultFileInputSelectorUsed
    : execution.panelImportButtonClicked && execution.defaultFileInputSelectorUsed
  const panelLabelsReady = isEnable
    ? enableTerminal !== null && hasReadyVisibleEnablePanelLabels(enableTerminal, execution.panelStatusLabels)
    : dispatchResult !== null && (
      isRollback
        ? hasReadyVisibleImportRollbackPanelLabels(dispatchResult, execution.panelStatusLabels)
      : isFailure
        ? hasReadyVisibleImportFailurePanelLabels(dispatchResult, execution.panelStatusLabels)
      : hasReadyVisibleImportPanelLabels(dispatchResult, execution.panelStatusLabels)
    )
  if (isEnable) {
    return enableTerminal?.status === 'ready'
      && execution.entrypoint === 'main-menu-panel'
      && execution.mainMenuPanelOpened
      && interactionReady
      && enableTerminal.targetPackageId === packageId
      && enableTerminal.selectedPackageIds.length === 1
      && enableTerminal.selectedPackageIds[0] === packageId
      && enableTerminal.blockedPackageIds.length === 0
      && enableTerminal.loadOrder.length === 1
      && enableTerminal.loadOrder[0] === packageId
      && enableTerminal.settingsWritten
      && enableTerminal.lockfileWritten
      && enableTerminal.startupStateWritten
      && enableTerminal.packageFilesPreserved
      && enableTerminal.runtimePublicationIncluded
      && enableTerminal.liveRegistrySwapped
      && enableTerminal.appStartupHandoffAccepted
      && panelLabelsReady
      && contentAccessItemVisibleAfter
      && contentAccessRecipeVisibleAfter
      && contentAccessShopOfferVisibleAfter
  }
  if (isFailure) {
    return dispatchResult !== null
      && execution.entrypoint === 'main-menu-panel'
      && execution.mainMenuPanelOpened
      && interactionReady
      && dispatchResult.transactionCommandDispatcherHostKind === 'renderer'
      && dispatchResult.transactionCommandDispatcherSourceStatus === 'dispatched'
      && dispatchResult.installCommandPostCommitAcknowledgementStatus === 'blocked'
      && dispatchResult.postCommitVerificationExecutorHostMode !== 'electron-main-visible-import'
      && dispatchResult.postCommitUiIpcDeliveryContinuationStatus === 'ready'
      && dispatchResult.ordinaryInstallTransactionTerminalConnectionStatus === 'ready'
      && dispatchResult.ordinaryInstallTransactionTerminalConnection?.outcomeKind === 'failure'
      && dispatchResult.ordinaryInstallTransactionTerminalConnection.retryable === true
      && dispatchResult.ordinaryInstallTransactionTerminalConnection.rollbackRequired === false
      && dispatchResult.ordinaryInstallTransactionTerminalConnection.effects?.failureOutcomeAccepted === true
      && dispatchResult.runtimePublicationCommitAfterPostCommitVerificationStatus === null
      && dispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus === null
      && dispatchResult.runtimePublicationCommitAppStartupReadinessStatus === null
      && dispatchResult.runtimePublicationCommitAppStartupHostConnectionStatus === null
      && !dispatchResult.rendererLiveRegistrySwapApplied
      && !dispatchResult.transactionCommitted
      && !dispatchResult.startupPersistentStateWritten
      && !dispatchResult.runtimeEnablementAllowed
      && dispatchResult.uiIpcResponseDelivered
      && dispatchResult.electronStartupPersistentStateWriteStatus === 'blocked'
      && panelLabelsReady
      && !contentAccessItemVisibleAfter
      && !contentAccessRecipeVisibleAfter
      && !contentAccessShopOfferVisibleAfter
  }
  if (isRollback) {
    return dispatchResult !== null
      && execution.entrypoint === 'main-menu-panel'
      && execution.mainMenuPanelOpened
      && interactionReady
      && dispatchResult.transactionCommandDispatcherHostKind === 'renderer'
      && dispatchResult.transactionCommandDispatcherSourceStatus === 'dispatched'
      && dispatchResult.installCommandPostCommitAcknowledgementStatus === 'ready'
      && dispatchResult.postCommitVerificationExecutorHostMode === 'electron-main-visible-import'
      && dispatchResult.postCommitUiIpcDeliveryContinuationStatus === 'ready'
      && dispatchResult.ordinaryInstallTransactionTerminalConnectionStatus === 'ready'
      && dispatchResult.ordinaryInstallTransactionTerminalConnection?.outcomeKind === 'rollback'
      && dispatchResult.ordinaryInstallTransactionTerminalConnection.effects?.rollbackExecuted === true
      && dispatchResult.runtimePublicationCommitAfterPostCommitVerificationStatus === null
      && dispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus === null
      && dispatchResult.runtimePublicationCommitAppStartupReadinessStatus === null
      && dispatchResult.runtimePublicationCommitAppStartupHostConnectionStatus === null
      && !dispatchResult.rendererLiveRegistrySwapApplied
      && !dispatchResult.transactionCommitted
      && !dispatchResult.startupPersistentStateWritten
      && !dispatchResult.runtimeEnablementAllowed
      && dispatchResult.uiIpcResponseDelivered
      && dispatchResult.electronStartupPersistentStateWriteStatus === 'blocked'
      && panelLabelsReady
      && !contentAccessItemVisibleAfter
      && !contentAccessRecipeVisibleAfter
      && !contentAccessShopOfferVisibleAfter
  }
  return dispatchResult !== null
    && execution.entrypoint === 'main-menu-panel'
    && execution.mainMenuPanelOpened
    && interactionReady
    && (
      dispatchResult.transactionCommandDispatcherHostKind === 'renderer'
      || dispatchResult.transactionCommandDispatcherHostKind === 'web'
    )
    && dispatchResult.transactionCommandDispatcherSourceStatus === 'dispatched'
    && dispatchResult.installCommandPostCommitAcknowledgementStatus === 'ready'
    && (
      dispatchResult.transactionCommandDispatcherHostKind !== 'renderer'
      || dispatchResult.postCommitVerificationExecutorHostMode === 'electron-main-visible-import'
    )
    && dispatchResult.installTransactionLogPreparedStatus === 'prepared'
    && dispatchResult.installTransactionLogPreparedPersistentReadVerificationStatus === 'verified'
    && dispatchResult.installTransactionCommitFinalizationStatus === 'committed'
    && dispatchResult.postCommitUiIpcDeliveryContinuationStatus === 'ready'
    && dispatchResult.ordinaryInstallTransactionTerminalConnectionStatus === 'ready'
    && dispatchResult.ordinaryInstallTransactionTerminalConnection?.outcomeKind === 'success'
    && dispatchResult.runtimePublicationCommitAfterPostCommitVerificationStatus === 'accepted'
    && dispatchResult.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus === 'swapped'
    && dispatchResult.runtimePublicationCommitAppStartupReadinessStatus === 'ready'
    && dispatchResult.runtimePublicationCommitAppStartupHostConnectionStatus === 'accepted'
    && dispatchResult.rendererLiveRegistrySwapApplied
    && dispatchResult.transactionCommitted
    && dispatchResult.startupPersistentStateWritten
    && dispatchResult.runtimeEnablementAllowed
    && dispatchResult.uiIpcResponseDelivered
    && panelLabelsReady
    && appStartupHostEffects?.realNormalStartupHostCalled === true
    && appStartupHostEffects?.realAppStartupHostCalled === true
    && appStartupHostEffects?.gameAppCreated === true
    && appStartupHostEffects?.piniaCreated === true
    && appStartupHostEffects?.routerMounted === true
    && contentAccessItemVisibleAfter
    && contentAccessRecipeVisibleAfter
    && contentAccessShopOfferVisibleAfter
}

const createProbePersistenceStore = (
  options: RunThirdPartyVisibleImportProductProbeOptions
): WebIndexedDbImportPersistenceStore | null => {
  if (Object.prototype.hasOwnProperty.call(options, 'persistenceStore')) {
    return options.persistenceStore ?? null
  }
  return options.persistSource === true
    ? createWebIndexedDbImportPersistenceStore()
    : null
}

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'visible import product probe failed'

const delay = async(ms: number): Promise<void> =>
  await new Promise(resolve => window.setTimeout(resolve, ms))

const waitForCondition = async<T>(
  read: () => T | null | undefined | false,
  reason: string,
  timeoutMs = 15_000
): Promise<T> => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const value = read()
    if (value !== null && value !== undefined && value !== false) return value
    await delay(25)
  }
  throw new Error(reason)
}

const findButtonContainingText = (text: string): HTMLButtonElement | null => {
  if (typeof document === 'undefined') return null
  return [...document.querySelectorAll('button')]
    .find(button => button.textContent?.includes(text)) ?? null
}

const readPanelText = (testId: string): string | null =>
  document.querySelector(`[data-testid="${testId}"]`)?.textContent?.trim() ?? null

const setPanelStatusLabel = (
  labels: MutableThirdPartyVisibleImportPanelStatusLabels,
  key: keyof ThirdPartyVisibleImportPanelStatusLabels,
  testId: string
): void => {
  const value = readPanelText(testId)
  if (value !== null) {
    labels[key] = value
  }
}

const readVisibleImportPanelStatusLabels = (): ThirdPartyVisibleImportPanelStatusLabels => {
  const labels: MutableThirdPartyVisibleImportPanelStatusLabels = {}
  setPanelStatusLabel(labels, 'importStatus', 'web-mod-import-status')
  setPanelStatusLabel(labels, 'targetPackage', 'web-mod-target-package')
  setPanelStatusLabel(labels, 'preflightStatus', 'web-mod-preflight-status')
  setPanelStatusLabel(labels, 'dispatchStatus', 'web-mod-dispatch-status')
  setPanelStatusLabel(labels, 'persistenceStatus', 'web-mod-persistence-status')
  setPanelStatusLabel(labels, 'hostAckStatus', 'web-mod-host-ack-status')
  setPanelStatusLabel(labels, 'installOutcomeStatus', 'web-mod-install-outcome-status')
  setPanelStatusLabel(labels, 'uiIpcDeliveryStatus', 'web-mod-ui-ipc-delivery-status')
  setPanelStatusLabel(labels, 'runtimePublicationStatus', 'web-mod-runtime-publication-status')
  setPanelStatusLabel(labels, 'liveRegistryStatus', 'web-mod-live-registry-status')
  setPanelStatusLabel(labels, 'appStartupStatus', 'web-mod-app-startup-status')
  setPanelStatusLabel(labels, 'startupPersistentStateStatus', 'web-mod-startup-persistent-state-status')
  setPanelStatusLabel(labels, 'installedManagementStatus', 'web-mod-installed-management-status')
  setPanelStatusLabel(labels, 'disableResult', 'web-mod-disable-result')
  setPanelStatusLabel(labels, 'enableResult', 'web-mod-enable-result')
  setPanelStatusLabel(labels, 'uninstallResult', 'web-mod-uninstall-result')
  return Object.freeze(labels)
}

const expectedPanelHostAckStatus = (
  dispatchResult: WebFilePickerSourceInstallCommandDispatchResult
): string =>
  dispatchResult.transactionCommandDispatcherHostKind === 'renderer'
    ? '已确认（Electron）'
    : '已确认（Web）'

const expectedPanelUiIpcDeliveryStatus = (
  dispatchResult: WebFilePickerSourceInstallCommandDispatchResult
): string =>
  dispatchResult.transactionCommandDispatcherHostKind === 'renderer'
    ? '已送达（Electron）'
    : '已送达（Web）'

const hasReadyVisibleImportPanelLabels = (
  dispatchResult: WebFilePickerSourceInstallCommandDispatchResult,
  labels: ThirdPartyVisibleImportPanelStatusLabels
): boolean =>
  labels.importStatus === '已暂存'
  && labels.targetPackage === dispatchResult.preflight?.targetPackageId
  && labels.dispatchStatus === 'dispatched'
  && labels.persistenceStatus === '已写入 IndexedDB'
  && labels.hostAckStatus === expectedPanelHostAckStatus(dispatchResult)
  && labels.installOutcomeStatus === '提交后校验已确认'
  && labels.uiIpcDeliveryStatus === expectedPanelUiIpcDeliveryStatus(dispatchResult)
  && labels.runtimePublicationStatus === '已确认'
  && labels.liveRegistryStatus === '已切换'
  && labels.appStartupStatus === '已接入已挂载应用'
  && labels.startupPersistentStateStatus === '已写入'

const hasReadyVisibleImportRollbackPanelLabels = (
  dispatchResult: WebFilePickerSourceInstallCommandDispatchResult,
  labels: ThirdPartyVisibleImportPanelStatusLabels
): boolean =>
  labels.importStatus === '已暂存'
  && labels.targetPackage === dispatchResult.preflight?.targetPackageId
  && labels.dispatchStatus === 'dispatched'
  && labels.persistenceStatus === '已写入 IndexedDB'
  && labels.hostAckStatus === expectedPanelHostAckStatus(dispatchResult)
  && labels.installOutcomeStatus === '已回滚'
  && labels.uiIpcDeliveryStatus === expectedPanelUiIpcDeliveryStatus(dispatchResult)
  && labels.runtimePublicationStatus === '已阻断'
  && labels.liveRegistryStatus === '已阻断'
  && labels.appStartupStatus === '已阻断'
  && labels.startupPersistentStateStatus === '已阻断'

const hasReadyVisibleImportFailurePanelLabels = (
  dispatchResult: WebFilePickerSourceInstallCommandDispatchResult,
  labels: ThirdPartyVisibleImportPanelStatusLabels
): boolean =>
  labels.importStatus === '已暂存'
  && labels.targetPackage === dispatchResult.preflight?.targetPackageId
  && labels.dispatchStatus === 'dispatched'
  && labels.persistenceStatus === '已写入 IndexedDB'
  && labels.hostAckStatus === expectedPanelHostAckStatus(dispatchResult)
  && labels.installOutcomeStatus === '安装失败，可重试'
  && labels.uiIpcDeliveryStatus === expectedPanelUiIpcDeliveryStatus(dispatchResult)
  && labels.runtimePublicationStatus === '已阻断'
  && labels.liveRegistryStatus === '已阻断'
  && labels.appStartupStatus === '已阻断'
  && labels.startupPersistentStateStatus === '已阻断'

const hasReadyVisibleEnablePanelLabels = (
  terminal: ThirdPartyDataPackEnableTransactionResult['terminal'],
  labels: ThirdPartyVisibleImportPanelStatusLabels
): boolean =>
  labels.importStatus === '已恢复'
  && labels.targetPackage === terminal.targetPackageId
  && (labels.persistenceStatus === '已从程序目录恢复' || labels.persistenceStatus === '已从 IndexedDB 恢复')
  && labels.installedManagementStatus === '已就绪'
  && labels.enableResult?.includes('启用事务：已完成') === true
  && labels.enableResult.includes('settings 已写入')
  && labels.enableResult.includes('mod-lock 已写入')
  && labels.enableResult.includes('startup 已写入')
  && labels.enableResult.includes('package 已保留')
  && labels.enableResult.includes('runtime 已包含')
  && labels.enableResult.includes('live registry 已切换')
  && labels.enableResult.includes('handoff 已接受')

const toPickStatus = (label: string | null): string => {
  if (label === '已暂存') return 'persisted'
  if (label === '已读取') return 'ready'
  if (label === '已恢复') return 'restored'
  if (label === '已取消') return 'cancelled'
  if (label === '失败') return 'failed'
  return 'unknown'
}

const installDefaultFileInputProbeSelector = (
  files: readonly WebFilePickerImportFile[]
) => {
  if (typeof HTMLInputElement === 'undefined') {
    return {
      clickCount: () => 0,
      restore: () => {}
    }
  }

  let clickCount = 0
  const originalClick = HTMLInputElement.prototype.click
  HTMLInputElement.prototype.click = function click() {
    if (this.type !== 'file') {
      originalClick.call(this)
      return
    }
    clickCount += 1
    Object.defineProperty(this, 'files', {
      configurable: true,
      value: files
    })
    this.dispatchEvent(new Event('change'))
  }
  return {
    clickCount: () => clickCount,
    restore: () => {
      HTMLInputElement.prototype.click = originalClick
    }
  }
}

const readPanelDispatchResult = (probeWindow: Window): WebFilePickerSourceInstallCommandDispatchResult | null =>
  (probeWindow as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__ ?? null

const readPanelEnableResult = (
  probeWindow: Window
): ThirdPartyDataPackEnableTransactionResult | null =>
  (probeWindow as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_ENABLE_PANEL_RESULT__ ?? null

const readProbeShopOfferNameFallback = (): string | undefined =>
  getOfficialShopOfferDefs().find(offer => offer.id === shopOfferId)?.name?.fallback

const waitForPanelDispatchResult = async(
  probeWindow: Window
): Promise<WebFilePickerSourceInstallCommandDispatchResult> =>
  await waitForCondition(
    () => readPanelDispatchResult(probeWindow),
    'visible import panel did not publish the dispatch result'
  )

const clearPanelDispatchResult = (probeWindow: Window): void => {
  Reflect.deleteProperty(probeWindow, '__TAOYUAN_VISIBLE_IMPORT_PANEL_RESULT__')
}

const waitForPanelEnableResult = async(
  probeWindow: Window
): Promise<ThirdPartyDataPackEnableTransactionResult> =>
  await waitForCondition(
    () => readPanelEnableResult(probeWindow),
    'visible enable panel did not publish the enable transaction result'
  )

const clearPanelEnableResult = (probeWindow: Window): void => {
  Reflect.deleteProperty(probeWindow, '__TAOYUAN_VISIBLE_ENABLE_PANEL_RESULT__')
}

const runComposableImportProbe = async(
  options: RunThirdPartyVisibleImportProductProbeOptions
): Promise<VisibleImportProbeExecution> => {
  const operation = options.operation ?? 'install'
  const variant = packageVariantForOperation(operation)
  const entry = useWebFilePickerImportEntry({
    selectFiles: async() => createVisibleImportFiles(variant),
    persistenceStore: createProbePersistenceStore(options)
  })

  const pickResult = await entry.pickFiles()
  let dispatchResult: WebFilePickerSourceInstallCommandDispatchResult | null = null
  if (pickResult.status === 'ready' || pickResult.status === 'persisted' || pickResult.status === 'restored') {
    dispatchResult = await entry.dispatchInstallCommandFromSource({
      confirmed: true,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })
  }

  return Object.freeze({
    dispatchResult,
    fileCount: pickResult.fileCount,
    pickStatus: pickResult.status,
    panelStatusLabels: Object.freeze({}),
    entrypoint: 'composable',
    operation,
    mainMenuPanelOpened: false,
    panelImportButtonClicked: false,
    defaultFileInputSelectorUsed: false
  })
}

const runMainMenuPanelImportProbe = async(
  options: RunThirdPartyVisibleImportProductProbeOptions
): Promise<VisibleImportProbeExecution> => {
  const operation = options.operation ?? 'install'
  const variant = packageVariantForOperation(operation)
  const fixture = visibleImportProductProbeFixtures[variant]
  const blocksRuntime = operation === 'rollback' || operation === 'failure'
  const probeWindow = window
  const fileInputProbe = installDefaultFileInputProbeSelector(createVisibleImportFiles(variant))
  let mainMenuPanelOpened = false
  let panelImportButtonClicked = false
  let dispatchResult: WebFilePickerSourceInstallCommandDispatchResult | null = null
  try {
    clearPanelDispatchResult(probeWindow)
    const mainMenuButton = await waitForCondition(
      () => findButtonContainingText('数据包预检'),
      'visible import probe could not find the MainMenu data-pack preflight button'
    )
    mainMenuButton.click()
    await waitForCondition(
      () => document.querySelector('[data-testid="web-data-pack-import-preflight-panel"]'),
      'visible import probe could not open the data-pack preflight panel'
    )
    mainMenuPanelOpened = true

    const panelImportButton = await waitForCondition(
      () => findButtonContainingText('选择数据包目录'),
      'visible import probe could not find the panel import button'
    )
    const dispatchResultPromise = waitForPanelDispatchResult(probeWindow)
    panelImportButtonClicked = true
    panelImportButton.click()
    const readyDispatchResult = await dispatchResultPromise
    dispatchResult = readyDispatchResult
    if (!blocksRuntime) {
      await waitForCondition(
        () =>
          getOfficialItemDef(itemId)?.name.fallback === fixture.itemNameFallback
          && getOfficialRecipeDef(recipeId)?.name.fallback === fixture.recipeNameFallback
          && readProbeShopOfferNameFallback() === fixture.shopOfferNameFallback,
        'visible import panel did not publish the imported item, recipe, and shop offer to contentAccess'
      )
    }
    const stableLabel = await waitForCondition(
      () => {
        const label = readPanelText('web-mod-import-status')
        return label !== null && !['等待选择', '预检中', '选择中', '读取中'].includes(label)
          ? label
          : false
      },
      'visible import panel did not settle its import status'
    )
    const panelStatusLabels = await waitForCondition(
      () => {
        const labels = readVisibleImportPanelStatusLabels()
        return (
          operation === 'rollback'
            ? hasReadyVisibleImportRollbackPanelLabels(readyDispatchResult, labels)
          : operation === 'failure'
            ? hasReadyVisibleImportFailurePanelLabels(readyDispatchResult, labels)
            : hasReadyVisibleImportPanelLabels(readyDispatchResult, labels)
        )
          ? labels
          : false
      },
      blocksRuntime
        ? 'visible import panel did not render the non-success terminal labels'
        : 'visible import panel did not render the ordinary install runtime handoff labels'
    )

    return Object.freeze({
      dispatchResult: readyDispatchResult,
      fileCount: readyDispatchResult.fileCount,
      pickStatus: toPickStatus(stableLabel),
      panelStatusLabels,
      entrypoint: 'main-menu-panel',
      operation,
      mainMenuPanelOpened,
      panelImportButtonClicked,
      defaultFileInputSelectorUsed: fileInputProbe.clickCount() > 0
    })
  } catch (error) {
    dispatchResult ??= readPanelDispatchResult(probeWindow)
    return Object.freeze({
      dispatchResult,
      fileCount: dispatchResult?.fileCount ?? 0,
      pickStatus: toPickStatus(readPanelText('web-mod-import-status')),
      panelStatusLabels: readVisibleImportPanelStatusLabels(),
      entrypoint: 'main-menu-panel',
      operation,
      mainMenuPanelOpened,
      panelImportButtonClicked,
      defaultFileInputSelectorUsed: fileInputProbe.clickCount() > 0,
      blockedReason: toErrorMessage(error)
    })
  } finally {
    fileInputProbe.restore()
  }
}

const runMainMenuPanelEnableProbe = async(): Promise<VisibleImportProbeExecution> => {
  const probeWindow = window
  let mainMenuPanelOpened = false
  let enableButtonClicked = false
  try {
    clearPanelEnableResult(probeWindow)
    const mainMenuButton = await waitForCondition(
      () => findButtonContainingText('数据包预检'),
      'visible enable probe could not find the MainMenu data-pack preflight button'
    )
    mainMenuButton.click()
    await waitForCondition(
      () => document.querySelector('[data-testid="web-data-pack-import-preflight-panel"]'),
      'visible enable probe could not open the data-pack preflight panel'
    )
    mainMenuPanelOpened = true

    const enableButton = await waitForCondition(
      () => document.querySelector(
        `[data-testid="web-mod-enable-${packageId}"]`
      ) as HTMLButtonElement | null,
      'visible enable probe could not find the disabled installed package action'
    )
    const transactionResultPromise = waitForPanelEnableResult(probeWindow)
    enableButtonClicked = true
    enableButton.click()
    const transactionResult = await transactionResultPromise
    await waitForCondition(
      () =>
        getOfficialItemDef(itemId)?.name.fallback === expectedItemName
        && getOfficialRecipeDef(recipeId)?.name.fallback === expectedRecipeName
        && readProbeShopOfferNameFallback() === expectedShopOfferName,
      'visible enable panel did not publish the enabled item, recipe, and shop offer to contentAccess'
    )
    await waitForCondition(
      () => document.querySelector(
        `[data-testid="web-mod-installed-row-${packageId}"]`
      )?.textContent?.includes('已启用') === true,
      'visible enable panel did not show the installed package as enabled'
    )
    const stableLabel = await waitForCondition(
      () => {
        const label = readPanelText('web-mod-import-status')
        return label !== null && !['等待选择', '预检中', '选择中', '读取中', '恢复中'].includes(label)
          ? label
          : false
      },
      'visible enable panel did not settle its import status'
    )
    const panelStatusLabels = await waitForCondition(
      () => {
        const labels = readVisibleImportPanelStatusLabels()
        return hasReadyVisibleEnablePanelLabels(transactionResult.terminal, labels)
          ? labels
          : false
      },
      'visible enable panel did not render the enable transaction terminal labels'
    )

    return Object.freeze({
      dispatchResult: null,
      enableTransactionResult: transactionResult,
      fileCount: Number(readPanelText('web-mod-file-count') ?? 0),
      pickStatus: toPickStatus(stableLabel),
      panelStatusLabels,
      entrypoint: 'main-menu-panel' as const,
      operation: 'enable' as const,
      mainMenuPanelOpened,
      panelImportButtonClicked: false,
      enableButtonClicked,
      defaultFileInputSelectorUsed: false
    })
  } catch (error) {
    return Object.freeze({
      dispatchResult: null,
      enableTransactionResult: readPanelEnableResult(probeWindow),
      fileCount: Number(readPanelText('web-mod-file-count') ?? 0),
      pickStatus: toPickStatus(readPanelText('web-mod-import-status')),
      panelStatusLabels: readVisibleImportPanelStatusLabels(),
      entrypoint: 'main-menu-panel' as const,
      operation: 'enable' as const,
      mainMenuPanelOpened,
      panelImportButtonClicked: false,
      enableButtonClicked,
      defaultFileInputSelectorUsed: false,
      blockedReason: toErrorMessage(error)
    })
  }
}

const clearPanelDisableResult = (probeWindow: Window): void => {
  Reflect.deleteProperty(probeWindow, '__TAOYUAN_VISIBLE_DISABLE_PANEL_RESULT__')
}

const readPanelDisableResult = (
  probeWindow: Window
): ThirdPartyDataPackDisableTransactionResult | null =>
  (probeWindow as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_DISABLE_PANEL_RESULT__ ?? null

const clearPanelUninstallResult = (probeWindow: Window): void => {
  Reflect.deleteProperty(probeWindow, '__TAOYUAN_VISIBLE_UNINSTALL_PANEL_RESULT__')
}

const readPanelUninstallResult = (
  probeWindow: Window
): ThirdPartyDataPackUninstallTransactionResult | null =>
  (probeWindow as VisibleImportPanelProbeWindow).__TAOYUAN_VISIBLE_UNINSTALL_PANEL_RESULT__ ?? null

const runMainMenuPanelDisableProbe = async(
  options: RunThirdPartyVisibleDisableProductProbeOptions = {}
): Promise<VisibleDisableProbeExecution> => {
  const probeWindow = window
  const targetPackageId = options.targetPackageId ?? packageId
  const contentAccessItemVisibleBefore = getOfficialItemDef(itemId) !== undefined
  const contentAccessRecipeVisibleBefore = getOfficialRecipeDef(recipeId) !== undefined
  const contentAccessShopOfferVisibleBefore = readProbeShopOfferNameFallback() !== undefined
  let mainMenuPanelOpened = false
  let disableButtonClicked = false
  try {
    clearPanelDisableResult(probeWindow)
    const mainMenuButton = await waitForCondition(
      () => findButtonContainingText('数据包预检'),
      'visible disable probe could not find the MainMenu data-pack preflight button'
    )
    mainMenuButton.click()
    await waitForCondition(
      () => document.querySelector('[data-testid="web-data-pack-import-preflight-panel"]'),
      'visible disable probe could not open the data-pack preflight panel'
    )
    mainMenuPanelOpened = true

    const disableButton = await waitForCondition(
      () => document.querySelector(
        `[data-testid="web-mod-disable-${targetPackageId}"]`
      ) as HTMLButtonElement | null,
      'visible disable probe could not find the enabled installed package action'
    )
    disableButtonClicked = true
    disableButton.click()
    const transactionResult = await waitForCondition(
      () => readPanelDisableResult(probeWindow),
      'visible disable panel did not publish the disable transaction result'
    )
    if (options.expectBlocked === true) {
      await waitForCondition(
        () => readPanelDisableResult(probeWindow)?.terminal.status === 'blocked'
          && document.querySelector(
            `[data-testid="web-mod-installed-row-${targetPackageId}"]`
          )?.textContent?.includes('已启用') === true,
        'visible disable panel did not keep the installed package enabled after blocked disable'
      )
    } else {
      await waitForCondition(
        () => document.querySelector(
          `[data-testid="web-mod-installed-row-${targetPackageId}"]`
        )?.textContent?.includes('已禁用') === true,
        'visible disable panel did not show the installed package as disabled'
      )
    }
    const panelStatusLabels = readVisibleImportPanelStatusLabels()
    const contentAccessItemVisibleAfter = getOfficialItemDef(itemId) !== undefined
    const contentAccessRecipeVisibleAfter = getOfficialRecipeDef(recipeId) !== undefined
    const contentAccessShopOfferVisibleAfter = readProbeShopOfferNameFallback() !== undefined

    return Object.freeze({
      transactionResult,
      targetPackageId,
      panelStatusLabels,
      entrypoint: 'main-menu-panel' as const,
      mainMenuPanelOpened,
      disableButtonClicked,
      contentAccessItemVisibleBefore,
      contentAccessItemVisibleAfter,
      contentAccessRecipeVisibleBefore,
      contentAccessRecipeVisibleAfter,
      contentAccessShopOfferVisibleBefore,
      contentAccessShopOfferVisibleAfter
    })
  } catch (error) {
    return Object.freeze({
      transactionResult: readPanelDisableResult(probeWindow),
      targetPackageId,
      panelStatusLabels: readVisibleImportPanelStatusLabels(),
      entrypoint: 'main-menu-panel' as const,
      mainMenuPanelOpened,
      disableButtonClicked,
      contentAccessItemVisibleBefore,
      contentAccessItemVisibleAfter: getOfficialItemDef(itemId) !== undefined,
      contentAccessRecipeVisibleBefore,
      contentAccessRecipeVisibleAfter: getOfficialRecipeDef(recipeId) !== undefined,
      contentAccessShopOfferVisibleBefore,
      contentAccessShopOfferVisibleAfter: readProbeShopOfferNameFallback() !== undefined,
      blockedReason: toErrorMessage(error)
    })
  }
}

const runMainMenuPanelUninstallProbe = async(
  options: RunThirdPartyVisibleUninstallProductProbeOptions = {}
): Promise<VisibleUninstallProbeExecution> => {
  const probeWindow = window
  const targetPackageId = options.targetPackageId ?? packageId
  const contentAccessItemVisibleBefore = getOfficialItemDef(itemId) !== undefined
  const contentAccessRecipeVisibleBefore = getOfficialRecipeDef(recipeId) !== undefined
  const contentAccessShopOfferVisibleBefore = readProbeShopOfferNameFallback() !== undefined
  let mainMenuPanelOpened = false
  let uninstallButtonClicked = false
  try {
    clearPanelUninstallResult(probeWindow)
    const mainMenuButton = await waitForCondition(
      () => findButtonContainingText('数据包预检'),
      'visible uninstall probe could not find the MainMenu data-pack preflight button'
    )
    mainMenuButton.click()
    await waitForCondition(
      () => document.querySelector('[data-testid="web-data-pack-import-preflight-panel"]'),
      'visible uninstall probe could not open the data-pack preflight panel'
    )
    mainMenuPanelOpened = true

    const uninstallButton = await waitForCondition(
      () => document.querySelector(
        `[data-testid="web-mod-uninstall-${targetPackageId}"]`
      ) as HTMLButtonElement | null,
      'visible uninstall probe could not find the disabled installed package action'
    )
    uninstallButtonClicked = true
    uninstallButton.click()
    const transactionResult = await waitForCondition(
      () => readPanelUninstallResult(probeWindow),
      'visible uninstall panel did not publish the uninstall transaction result'
    )
    if (options.expectBlocked === true) {
      await waitForCondition(
        () => readPanelUninstallResult(probeWindow)?.terminal.status === 'blocked'
          && document.querySelector(`[data-testid="web-mod-installed-row-${targetPackageId}"]`) !== null,
        'visible uninstall panel did not keep the installed package row after blocked uninstall'
      )
    } else {
      await waitForCondition(
        () => document.querySelector(`[data-testid="web-mod-installed-row-${targetPackageId}"]`) === null
          || document.querySelector('[data-testid="web-mod-installed-empty"]') !== null,
        'visible uninstall panel did not remove the installed package row'
      )
    }
    const panelStatusLabels = readVisibleImportPanelStatusLabels()
    const contentAccessItemVisibleAfter = getOfficialItemDef(itemId) !== undefined
    const contentAccessRecipeVisibleAfter = getOfficialRecipeDef(recipeId) !== undefined
    const contentAccessShopOfferVisibleAfter = readProbeShopOfferNameFallback() !== undefined

    return Object.freeze({
      transactionResult,
      targetPackageId,
      panelStatusLabels,
      entrypoint: 'main-menu-panel' as const,
      mainMenuPanelOpened,
      uninstallButtonClicked,
      contentAccessItemVisibleBefore,
      contentAccessItemVisibleAfter,
      contentAccessRecipeVisibleBefore,
      contentAccessRecipeVisibleAfter,
      contentAccessShopOfferVisibleBefore,
      contentAccessShopOfferVisibleAfter
    })
  } catch (error) {
    return Object.freeze({
      transactionResult: readPanelUninstallResult(probeWindow),
      targetPackageId,
      panelStatusLabels: readVisibleImportPanelStatusLabels(),
      entrypoint: 'main-menu-panel' as const,
      mainMenuPanelOpened,
      uninstallButtonClicked,
      contentAccessItemVisibleBefore,
      contentAccessItemVisibleAfter: getOfficialItemDef(itemId) !== undefined,
      contentAccessRecipeVisibleBefore,
      contentAccessRecipeVisibleAfter: getOfficialRecipeDef(recipeId) !== undefined,
      contentAccessShopOfferVisibleBefore,
      contentAccessShopOfferVisibleAfter: readProbeShopOfferNameFallback() !== undefined,
      blockedReason: toErrorMessage(error)
    })
  }
}

export const runThirdPartyVisibleImportProductProbe = async(
  options: RunThirdPartyVisibleImportProductProbeOptions = {}
): Promise<ThirdPartyVisibleImportProductProbeResult> => {
  const operation = options.operation ?? 'install'
  const fixture = visibleImportProductProbeFixtures[packageVariantForOperation(operation)]
  const contentAccessItemVisibleBefore = getOfficialItemDef(itemId) !== undefined
  const contentAccessRecipeVisibleBefore = getOfficialRecipeDef(recipeId) !== undefined
  const contentAccessShopOfferVisibleBefore = readProbeShopOfferNameFallback() !== undefined
  const execution = options.entrypoint === 'main-menu-panel'
    ? operation === 'enable'
      ? await runMainMenuPanelEnableProbe()
      : await runMainMenuPanelImportProbe({ ...options, operation })
    : await runComposableImportProbe(options)
  const dispatchResult = execution.dispatchResult
  const visibleItem = getOfficialItemDef(itemId)
  const visibleRecipe = getOfficialRecipeDef(recipeId)
  const visibleShopOfferNameFallback = readProbeShopOfferNameFallback()
  const contentAccessItemVisibleAfter = visibleItem?.name.fallback === fixture.itemNameFallback
  const contentAccessRecipeVisibleAfter =
    visibleRecipe?.name.fallback === fixture.recipeNameFallback
  const contentAccessShopOfferVisibleAfter =
    visibleShopOfferNameFallback === fixture.shopOfferNameFallback
  const status = hasReadyVisibleImportDispatch(
    execution,
    contentAccessItemVisibleAfter,
    contentAccessRecipeVisibleAfter,
    contentAccessShopOfferVisibleAfter
  )
    ? 'ready'
    : 'blocked'
  const enableTerminal = execution.enableTransactionResult?.terminal ?? null
  const effects: ThirdPartyVisibleImportProductProbeResult['effects'] = operation === 'enable'
    ? {
        commandDispatched: false,
        packageFilesWritten: false,
        settingsWritten: enableTerminal?.settingsWritten === true,
        lockfileWritten: enableTerminal?.lockfileWritten === true,
        rendererLiveRegistrySwapped: enableTerminal?.liveRegistrySwapped === true,
        runtimeEnablementAllowed: enableTerminal?.runtimePublicationIncluded === true,
        uiIpcResponseDelivered: false,
        transactionCommitted: enableTerminal?.status === 'ready',
        transactionLogPrepared: false,
        transactionLogRead: false,
        startupPersistentStateWritten: enableTerminal?.startupStateWritten === true,
        realNormalStartupHostCalled: false,
        realAppStartupHostCalled: enableTerminal?.appStartupHandoffAccepted === true,
        gameAppCreated: enableTerminal?.appStartupHandoffAccepted === true,
        piniaCreated: enableTerminal?.appStartupHandoffAccepted === true,
        routerMounted: enableTerminal?.appStartupHandoffAccepted === true,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false,
        rollbackExecuted: false,
        diagnosticsWritten: false
      }
    : {
        commandDispatched: dispatchResult?.commandDispatched === true,
        packageFilesWritten:
          dispatchResult?.postCommitUiIpcDeliveryContinuation?.persistentPackageWriteExecuted === true,
        settingsWritten:
          dispatchResult?.postCommitUiIpcDeliveryContinuation?.persistentSettingsLockfileWriteExecuted === true,
        lockfileWritten:
          dispatchResult?.postCommitUiIpcDeliveryContinuation?.persistentSettingsLockfileWriteExecuted === true,
        rendererLiveRegistrySwapped: dispatchResult?.rendererLiveRegistrySwapApplied === true,
        runtimeEnablementAllowed: dispatchResult?.runtimeEnablementAllowed === true,
        uiIpcResponseDelivered: dispatchResult?.uiIpcResponseDelivered === true,
        transactionCommitted: dispatchResult?.transactionCommitted === true,
        transactionLogPrepared:
          dispatchResult?.installTransactionLogPrepared?.effects.transactionLogPrepared === true,
        transactionLogRead:
          dispatchResult?.installTransactionLogPreparedPersistentReadVerification?.effects.transactionLogRead === true,
        startupPersistentStateWritten: dispatchResult?.startupPersistentStateWritten === true,
        realNormalStartupHostCalled:
          dispatchResult?.runtimePublicationCommitAppStartupHostConnection?.effects.realNormalStartupHostCalled === true,
        realAppStartupHostCalled:
          dispatchResult?.runtimePublicationCommitAppStartupHostConnection?.effects.realAppStartupHostCalled === true,
        gameAppCreated:
          dispatchResult?.runtimePublicationCommitAppStartupHostConnection?.effects.gameAppCreated === true,
        piniaCreated:
          dispatchResult?.runtimePublicationCommitAppStartupHostConnection?.effects.piniaCreated === true,
        routerMounted:
          dispatchResult?.runtimePublicationCommitAppStartupHostConnection?.effects.routerMounted === true,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten:
          dispatchResult?.installTransactionCommitFinalization?.effects.transactionLogWritten === true,
        rollbackExecuted:
          dispatchResult?.ordinaryInstallTransactionTerminalConnection?.effects.rollbackExecuted === true,
        diagnosticsWritten: false
      }

  return Object.freeze({
    schemaVersion: 1,
    status,
    reason: status === 'ready'
      ? operation === 'enable'
        ? 'visible MainMenu panel enabled the disabled package through the enable transaction terminal'
        : operation === 'rollback'
        ? 'visible MainMenu panel reached rollback terminal without runtime publication or startup persistence'
        : operation === 'failure'
          ? 'visible MainMenu panel reached retryable failure terminal without runtime publication or startup persistence'
        : 'visible MainMenu panel reached ordinary terminal runtime publication and item, recipe, and shop offer visibility'
      : execution.blockedReason
        ?? enableTerminal?.reason
        ?? dispatchResult?.reason
        ?? 'visible import did not reach item, recipe, and shop offer visibility',
    entrypoint: execution.entrypoint,
    ...(execution.operation === 'enable'
      || execution.operation === 'upgrade'
      || execution.operation === 'rollback'
      || execution.operation === 'failure'
      ? { operation: execution.operation }
      : {}),
    mainMenuPanelOpened: execution.mainMenuPanelOpened,
    panelImportButtonClicked: execution.panelImportButtonClicked,
    ...(execution.enableButtonClicked === undefined ? {} : { enableButtonClicked: execution.enableButtonClicked }),
    defaultFileInputSelectorUsed: execution.defaultFileInputSelectorUsed,
    targetPackageId: packageId,
    itemId,
    ...(visibleItem?.name.fallback !== undefined ? { itemNameFallback: visibleItem.name.fallback } : {}),
    recipeId,
    ...(visibleRecipe?.name.fallback !== undefined ? { recipeNameFallback: visibleRecipe.name.fallback } : {}),
    shopOfferId,
    ...(visibleShopOfferNameFallback !== undefined
      ? { shopOfferNameFallback: visibleShopOfferNameFallback }
      : {}),
    fileCount: execution.fileCount,
    pickStatus: execution.pickStatus,
    panelStatusLabels: execution.panelStatusLabels,
    dispatchPreflightStatus: dispatchResult?.status ?? null,
    discoveryStatus: dispatchResult?.discoveryStatus ?? null,
    transactionCommandDispatcherHostKind: dispatchResult?.transactionCommandDispatcherHostKind ?? null,
    transactionCommandDispatcherSourceStatus:
      dispatchResult?.transactionCommandDispatcherSourceStatus ?? null,
    installCommandPostCommitAcknowledgementStatus:
      dispatchResult?.installCommandPostCommitAcknowledgementStatus ?? null,
    postCommitVerificationExecutorHostMode:
      dispatchResult?.postCommitVerificationExecutorHostMode ?? null,
    postCommitUiIpcDeliveryContinuationStatus:
      dispatchResult?.postCommitUiIpcDeliveryContinuationStatus ?? null,
    ordinaryInstallTransactionTerminalConnectionStatus:
      dispatchResult?.ordinaryInstallTransactionTerminalConnectionStatus ?? null,
    ordinaryInstallTransactionOutcomeKind:
      dispatchResult?.ordinaryInstallTransactionTerminalConnection?.outcomeKind ?? null,
    installTransactionLogPreparedStatus:
      dispatchResult?.installTransactionLogPreparedStatus ?? null,
    installTransactionLogPreparedStorageKind:
      dispatchResult?.installTransactionLogPreparedStorageKind ?? null,
    installTransactionLogPreparedPersistentReadVerificationStatus:
      dispatchResult?.installTransactionLogPreparedPersistentReadVerificationStatus ?? null,
    installTransactionCommitFinalizationStatus:
      dispatchResult?.installTransactionCommitFinalizationStatus ?? null,
    runtimePublicationCommitAfterPostCommitVerificationStatus:
      dispatchResult?.runtimePublicationCommitAfterPostCommitVerificationStatus ?? null,
    runtimePublicationCommitLiveRegistrySwapHostConnectionStatus:
      dispatchResult?.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus ?? null,
    runtimePublicationCommitAppStartupReadinessStatus:
      dispatchResult?.runtimePublicationCommitAppStartupReadinessStatus ?? null,
    runtimePublicationCommitAppStartupHostConnectionStatus:
      dispatchResult?.runtimePublicationCommitAppStartupHostConnectionStatus ?? null,
    webStartupPersistentStateWriteStatus:
      dispatchResult?.webStartupPersistentStateWriteStatus ?? null,
    electronStartupPersistentStateWriteStatus:
      dispatchResult?.electronStartupPersistentStateWriteStatus ?? null,
    selectedPackageCount: enableTerminal?.selectedPackageIds.length ?? dispatchResult?.selectedPackageIds.length ?? 0,
    blockedPackageCount: enableTerminal?.blockedPackageIds.length ?? dispatchResult?.preflight?.blockedPackageIds.length ?? 0,
    loadOrderCount: enableTerminal?.loadOrder.length ?? dispatchResult?.loadOrder.length ?? 0,
    expectedPackageVersion: fixture.version,
    registryCount: enableTerminal?.registryCount ?? dispatchResult?.preflight?.registryCount,
    entryCount: enableTerminal?.entryCount ?? dispatchResult?.preflight?.entryCount,
    packageCount: enableTerminal?.packageCount ?? dispatchResult?.preflight?.packageCount,
    diagnosticsCount: operation === 'enable'
      ? execution.enableTransactionResult === undefined || enableTerminal?.status === 'blocked' ? 1 : 0
      : diagnosticsCountFor(dispatchResult),
    contentAccessItemVisibleBefore,
    contentAccessItemVisibleAfter,
    contentAccessRecipeVisibleBefore,
    contentAccessRecipeVisibleAfter,
    contentAccessShopOfferVisibleBefore,
    contentAccessShopOfferVisibleAfter,
    ...(operation === 'enable'
      ? {
          enableTerminalStatus: enableTerminal?.status ?? null,
          enableTargetPackageId: enableTerminal?.targetPackageId ?? null,
          enableSelectedPackageCount: enableTerminal?.selectedPackageIds.length ?? 0,
          enableBlockedPackageCount: enableTerminal?.blockedPackageIds.length ?? 0,
          enableLoadOrderCount: enableTerminal?.loadOrder.length ?? 0,
          enableRegistryCount: enableTerminal?.registryCount,
          enableEntryCount: enableTerminal?.entryCount,
          enablePackageCount: enableTerminal?.packageCount,
          enableSettingsWritten: enableTerminal?.settingsWritten === true,
          enableLockfileWritten: enableTerminal?.lockfileWritten === true,
          enableStartupStateWritten: enableTerminal?.startupStateWritten === true,
          enablePackageFilesPreserved: enableTerminal?.packageFilesPreserved === true,
          enableRuntimePublicationIncluded: enableTerminal?.runtimePublicationIncluded === true,
          enableLiveRegistrySwapped: enableTerminal?.liveRegistrySwapped === true,
          enableAppStartupHandoffAccepted: enableTerminal?.appStartupHandoffAccepted === true
        }
      : {}),
    effects
  })
}

export const runThirdPartyVisibleDisableProductProbe = async(
  options: RunThirdPartyVisibleDisableProductProbeOptions = {}
): Promise<ThirdPartyVisibleImportProductProbeResult> => {
  const execution = await runMainMenuPanelDisableProbe(options)
  const terminal = execution.transactionResult?.terminal ?? null
  const ready = terminal?.status === 'ready'
    && terminal.targetPackageId === execution.targetPackageId
    && terminal.selectedPackageIds.length === 0
    && terminal.blockedPackageIds.length === 1
    && terminal.blockedPackageIds[0] === execution.targetPackageId
    && terminal.loadOrder.length === 0
    && terminal.settingsWritten
    && terminal.lockfileWritten
    && terminal.startupStateWritten
    && terminal.packageFilesPreserved
    && terminal.runtimePublicationExcluded
    && terminal.liveRegistrySwapped
    && terminal.appStartupHandoffAccepted
    && !execution.contentAccessItemVisibleAfter
    && !execution.contentAccessRecipeVisibleAfter
    && !execution.contentAccessShopOfferVisibleAfter
  const status = ready ? 'ready' : 'blocked'

  return Object.freeze({
    schemaVersion: 1,
    status,
    reason: ready
      ? 'visible MainMenu panel disabled the installed package and removed its runtime content'
      : execution.blockedReason
        ?? terminal?.reason
        ?? 'visible disable panel did not reach a ready disable transaction terminal',
    operation: 'disable' as const,
    entrypoint: execution.entrypoint,
    mainMenuPanelOpened: execution.mainMenuPanelOpened,
    panelImportButtonClicked: false,
    disableButtonClicked: execution.disableButtonClicked,
    defaultFileInputSelectorUsed: false,
    targetPackageId: execution.targetPackageId,
    itemId,
    recipeId,
    shopOfferId,
    fileCount: 0,
    pickStatus: 'not-run',
    panelStatusLabels: execution.panelStatusLabels,
    dispatchPreflightStatus: null,
    discoveryStatus: null,
    transactionCommandDispatcherHostKind: null,
    transactionCommandDispatcherSourceStatus: null,
    installCommandPostCommitAcknowledgementStatus: null,
    postCommitVerificationExecutorHostMode: null,
    postCommitUiIpcDeliveryContinuationStatus: null,
    ordinaryInstallTransactionTerminalConnectionStatus: null,
    ordinaryInstallTransactionOutcomeKind: null,
    installTransactionLogPreparedStatus: null,
    installTransactionLogPreparedStorageKind: null,
    installTransactionLogPreparedPersistentReadVerificationStatus: null,
    installTransactionCommitFinalizationStatus: null,
    runtimePublicationCommitAfterPostCommitVerificationStatus: null,
    runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: null,
    runtimePublicationCommitAppStartupReadinessStatus: null,
    runtimePublicationCommitAppStartupHostConnectionStatus: null,
    webStartupPersistentStateWriteStatus: null,
    electronStartupPersistentStateWriteStatus: null,
    selectedPackageCount: terminal?.selectedPackageIds.length ?? 0,
    blockedPackageCount: terminal?.blockedPackageIds.length ?? 0,
    loadOrderCount: terminal?.loadOrder.length ?? 0,
    registryCount: terminal?.registryCount,
    entryCount: terminal?.entryCount,
    packageCount: terminal?.packageCount,
    diagnosticsCount: execution.transactionResult
      ? execution.transactionResult.terminal.status === 'blocked' ? 1 : 0
      : 0,
    contentAccessItemVisibleBefore: execution.contentAccessItemVisibleBefore,
    contentAccessItemVisibleAfter: execution.contentAccessItemVisibleAfter,
    contentAccessRecipeVisibleBefore: execution.contentAccessRecipeVisibleBefore,
    contentAccessRecipeVisibleAfter: execution.contentAccessRecipeVisibleAfter,
    contentAccessShopOfferVisibleBefore: execution.contentAccessShopOfferVisibleBefore,
    contentAccessShopOfferVisibleAfter: execution.contentAccessShopOfferVisibleAfter,
    disableTerminalStatus: terminal?.status ?? null,
    disableTargetPackageId: terminal?.targetPackageId ?? null,
    disableSelectedPackageCount: terminal?.selectedPackageIds.length ?? 0,
    disableBlockedPackageCount: terminal?.blockedPackageIds.length ?? 0,
    disableLoadOrderCount: terminal?.loadOrder.length ?? 0,
    disableRegistryCount: terminal?.registryCount,
    disableEntryCount: terminal?.entryCount,
    disablePackageCount: terminal?.packageCount,
    disableSettingsWritten: terminal?.settingsWritten === true,
    disableLockfileWritten: terminal?.lockfileWritten === true,
    disableStartupStateWritten: terminal?.startupStateWritten === true,
    disablePackageFilesPreserved: terminal?.packageFilesPreserved === true,
    disableRuntimePublicationExcluded: terminal?.runtimePublicationExcluded === true,
    disableLiveRegistrySwapped: terminal?.liveRegistrySwapped === true,
    disableAppStartupHandoffAccepted: terminal?.appStartupHandoffAccepted === true,
    blockedReason: execution.blockedReason,
    effects: {
      commandDispatched: false,
      packageFilesWritten: false,
      settingsWritten: terminal?.settingsWritten === true,
      lockfileWritten: terminal?.lockfileWritten === true,
      rendererLiveRegistrySwapped: terminal?.liveRegistrySwapped === true,
      runtimeEnablementAllowed: false,
      uiIpcResponseDelivered: false,
      transactionCommitted: terminal?.status === 'ready',
      transactionLogPrepared: false,
      transactionLogRead: false,
      startupPersistentStateWritten: terminal?.startupStateWritten === true,
      realNormalStartupHostCalled: false,
      realAppStartupHostCalled: terminal?.appStartupHandoffAccepted === true,
      gameAppCreated: terminal?.appStartupHandoffAccepted === true,
      piniaCreated: terminal?.appStartupHandoffAccepted === true,
      routerMounted: terminal?.appStartupHandoffAccepted === true,
      savesWritten: false as const,
      cacheWritten: false as const,
      transactionLogWritten: false,
      rollbackExecuted: false as const,
      diagnosticsWritten: false as const
    }
  })
}

export const runThirdPartyVisibleUninstallProductProbe = async(
  options: RunThirdPartyVisibleUninstallProductProbeOptions = {}
): Promise<ThirdPartyVisibleImportProductProbeResult> => {
  const execution = await runMainMenuPanelUninstallProbe(options)
  const terminal = execution.transactionResult?.terminal ?? null
  const ready = terminal?.status === 'ready'
    && terminal.targetPackageId === execution.targetPackageId
    && terminal.selectedPackageIds.length === 0
    && terminal.blockedPackageIds.length === 0
    && terminal.loadOrder.length === 0
    && terminal.settingsWritten
    && terminal.lockfileWritten
    && terminal.startupStateWritten
    && terminal.packageFilesRemoved
    && terminal.runtimePublicationExcluded
    && terminal.liveRegistrySwapped
    && terminal.appStartupHandoffAccepted
    && !execution.contentAccessItemVisibleAfter
    && !execution.contentAccessRecipeVisibleAfter
    && !execution.contentAccessShopOfferVisibleAfter
  const status = ready ? 'ready' : 'blocked'

  return Object.freeze({
    schemaVersion: 1,
    status,
    reason: ready
      ? 'visible MainMenu panel uninstalled the installed package and preserved official-only runtime'
      : execution.blockedReason
        ?? terminal?.reason
        ?? 'visible uninstall panel did not reach a ready uninstall transaction terminal',
    operation: 'uninstall' as const,
    entrypoint: execution.entrypoint,
    mainMenuPanelOpened: execution.mainMenuPanelOpened,
    panelImportButtonClicked: false,
    uninstallButtonClicked: execution.uninstallButtonClicked,
    defaultFileInputSelectorUsed: false,
    targetPackageId: execution.targetPackageId,
    itemId,
    recipeId,
    shopOfferId,
    fileCount: 0,
    pickStatus: 'not-run',
    panelStatusLabels: execution.panelStatusLabels,
    dispatchPreflightStatus: null,
    discoveryStatus: null,
    transactionCommandDispatcherHostKind: null,
    transactionCommandDispatcherSourceStatus: null,
    installCommandPostCommitAcknowledgementStatus: null,
    postCommitVerificationExecutorHostMode: null,
    postCommitUiIpcDeliveryContinuationStatus: null,
    ordinaryInstallTransactionTerminalConnectionStatus: null,
    ordinaryInstallTransactionOutcomeKind: null,
    installTransactionLogPreparedStatus: null,
    installTransactionLogPreparedStorageKind: null,
    installTransactionLogPreparedPersistentReadVerificationStatus: null,
    installTransactionCommitFinalizationStatus: null,
    runtimePublicationCommitAfterPostCommitVerificationStatus: null,
    runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: null,
    runtimePublicationCommitAppStartupReadinessStatus: null,
    runtimePublicationCommitAppStartupHostConnectionStatus: null,
    webStartupPersistentStateWriteStatus: null,
    electronStartupPersistentStateWriteStatus: null,
    selectedPackageCount: terminal?.selectedPackageIds.length ?? 0,
    blockedPackageCount: terminal?.blockedPackageIds.length ?? 0,
    loadOrderCount: terminal?.loadOrder.length ?? 0,
    registryCount: terminal?.registryCount,
    entryCount: terminal?.entryCount,
    packageCount: terminal?.packageCount,
    diagnosticsCount: execution.transactionResult
      ? execution.transactionResult.terminal.status === 'blocked' ? 1 : 0
      : 0,
    contentAccessItemVisibleBefore: execution.contentAccessItemVisibleBefore,
    contentAccessItemVisibleAfter: execution.contentAccessItemVisibleAfter,
    contentAccessRecipeVisibleBefore: execution.contentAccessRecipeVisibleBefore,
    contentAccessRecipeVisibleAfter: execution.contentAccessRecipeVisibleAfter,
    contentAccessShopOfferVisibleBefore: execution.contentAccessShopOfferVisibleBefore,
    contentAccessShopOfferVisibleAfter: execution.contentAccessShopOfferVisibleAfter,
    uninstallTerminalStatus: terminal?.status ?? null,
    uninstallTargetPackageId: terminal?.targetPackageId ?? null,
    uninstallSelectedPackageCount: terminal?.selectedPackageIds.length ?? 0,
    uninstallBlockedPackageCount: terminal?.blockedPackageIds.length ?? 0,
    uninstallLoadOrderCount: terminal?.loadOrder.length ?? 0,
    uninstallRegistryCount: terminal?.registryCount,
    uninstallEntryCount: terminal?.entryCount,
    uninstallPackageCount: terminal?.packageCount,
    uninstallSettingsWritten: terminal?.settingsWritten === true,
    uninstallLockfileWritten: terminal?.lockfileWritten === true,
    uninstallStartupStateWritten: terminal?.startupStateWritten === true,
    uninstallPackageFilesRemoved: terminal?.packageFilesRemoved === true,
    uninstallRuntimePublicationExcluded: terminal?.runtimePublicationExcluded === true,
    uninstallLiveRegistrySwapped: terminal?.liveRegistrySwapped === true,
    uninstallAppStartupHandoffAccepted: terminal?.appStartupHandoffAccepted === true,
    blockedReason: execution.blockedReason,
    effects: {
      commandDispatched: false,
      packageFilesWritten: false,
      settingsWritten: terminal?.settingsWritten === true,
      lockfileWritten: terminal?.lockfileWritten === true,
      rendererLiveRegistrySwapped: terminal?.liveRegistrySwapped === true,
      runtimeEnablementAllowed: false,
      uiIpcResponseDelivered: false,
      transactionCommitted: terminal?.status === 'ready',
      transactionLogPrepared: false,
      transactionLogRead: false,
      startupPersistentStateWritten: terminal?.startupStateWritten === true,
      realNormalStartupHostCalled: false,
      realAppStartupHostCalled: terminal?.appStartupHandoffAccepted === true,
      gameAppCreated: terminal?.appStartupHandoffAccepted === true,
      piniaCreated: terminal?.appStartupHandoffAccepted === true,
      routerMounted: terminal?.appStartupHandoffAccepted === true,
      savesWritten: false as const,
      cacheWritten: false as const,
      transactionLogWritten: false,
      rollbackExecuted: false as const,
      diagnosticsWritten: false as const
    }
  })
}
