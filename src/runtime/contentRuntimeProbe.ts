import {
  createOfficialContentRuntimeReport,
  type OfficialContentRuntimeReport
} from '@/domain/mods/officialContentRuntimeReport'
import {
  getOfficialItemDef,
  getOfficialRecipeDef,
  getOfficialShopOfferDefs
} from '@/domain/mods/contentAccess'
import { isPackageId } from '@/domain/mods/ids'

const productProbePackageId = 'product_probe_pack'
const productProbeItemId = `${productProbePackageId}:linen_ribbon`
const productProbeRecipeId = `${productProbePackageId}:linen_ribbon_snack`
const productProbeShopOfferId = `${productProbePackageId}:shop/wanwupu/linen_ribbon/0`

export interface ThirdPartyStartupGateRuntimeProbeSummary {
  schemaVersion: 1
  observed: boolean
  status?: 'ready' | 'skipped' | 'blocked' | 'unknown'
  sourceCalled: boolean
  enabled?: boolean
  appBootstrapContinuationAllowed?: boolean
  appStartupHostConnectionSourceStatus?: string
  startupPersistentStateSourceStatus?: string
  startupPersistentStateSourceKind?: 'web-indexeddb' | 'electron-program-directory-userdata'
  startupPersistentStateSourceHostMode?: ThirdPartyStartupPersistentStateSourceHostMode
  startupPersistentStateInjectedSourceHostMode?: ThirdPartyStartupPersistentStateSourceHostMode
  startupPersistentStateSourceCalled: boolean
  startupStateSnapshotAccepted: boolean
  startupPersistentStateReadFromIndexedDb: boolean
  startupPersistentStateReadFromElectronUserdata: boolean
  persistentStateProofsAccepted: boolean
  webResponseDeliveryStartupGateHandoffStatus?: string
  responseDeliveryStartupGateHandoffPrepared: boolean
  webResponseDeliveryAcknowledgementConsumed: boolean
  targetPackageId?: string
  selectedPackageCount: number
  blockedPackageCount: number
  loadOrderCount: number
  registryCount?: number
  entryCount?: number
  packageCount?: number
  productProbeItemNameFallback?: string
  productProbeRecipeNameFallback?: string
  productProbeShopOfferNameFallback?: string
  lockfileHashPresent: boolean
  effects: {
    appStartupHostConnectionSourceCalled: boolean
    appStartupHostConnectionAccepted: boolean
    appBootstrapContinuationAllowed: boolean
    startupPersistentStateSourceCalled: boolean
    startupStateSnapshotAccepted: boolean
    uiIpcResponseDelivered: boolean
    commandDispatched: boolean
    thirdPartyRegistryPublished: boolean
    liveRegistrySwapped: boolean
    runtimeEnablementAllowed: boolean
    realRuntimePublicationCommitCalled: boolean
    realNormalStartupHostCalled: boolean
    transactionCommitted: boolean
    runtimePublicationCommitted: boolean
    packageFilesWritten: boolean
    lockfileWritten: boolean
    settingsWritten: boolean
    savesWritten: boolean
    cacheWritten: boolean
    transactionLogWritten: boolean
    rollbackExecuted: boolean
    diagnosticsWritten: boolean
  }
}

export interface ThirdPartyAppStartupHostRuntimeProbeSummary {
  schemaVersion: 1
  observed: boolean
  status?: 'accepted' | 'skipped' | 'blocked' | 'unknown'
  enabled?: boolean
  sourceCalled: boolean
  targetPackageId?: string
  appStartupHostConnectionSourceStatus?: string
  selectedPackageCount: number
  blockedPackageCount: number
  loadOrderCount: number
  registryCount?: number
  entryCount?: number
  packageCount?: number
  lockfileHashPresent: boolean
  effects: {
    realAppStartupHostCalled: boolean
    appStartupHostConnectionAccepted: boolean
    appBootstrapContinuationAllowed: boolean
    officialContentBootstrapped: boolean
    runtimeContentRegistryPublished: boolean
    thirdPartyStartupGateCompleted: boolean
    thirdPartyStartupGateAllowed: boolean
    gameAppCreated: boolean
    piniaCreated: boolean
    routerInstalled: boolean
    routerMounted: boolean
    saveRead: boolean
    uiIpcResponseDelivered: boolean
    commandDispatched: boolean
    thirdPartyRegistryPublished: boolean
    liveRegistrySwapped: boolean
    runtimeEnablementAllowed: boolean
    realRuntimePublicationCommitCalled: boolean
    transactionCommitted: boolean
    runtimePublicationCommitted: boolean
    packageFilesWritten: boolean
    lockfileWritten: boolean
    settingsWritten: boolean
    savesWritten: boolean
    cacheWritten: boolean
    transactionLogWritten: boolean
    rollbackExecuted: boolean
    diagnosticsWritten: boolean
  }
}

export interface ThirdPartyRendererUiIpcRuntimeProbeSummary {
  schemaVersion: 1
  observed: boolean
  status?: 'ready' | 'skipped' | 'blocked' | 'unknown'
  deliveryInputSource?: 'synthetic-success-handoff' | 'install-transaction-commit-finalization'
  selectedPlatform?: 'electron' | 'web' | 'android'
  targetPackageId?: string
  envelopeKind?: 'success' | 'failure' | 'retry' | 'rollback'
  messageKey?: string
  selectedPackageCount: number
  blockedPackageCount: number
  loadOrderCount: number
  registryCount?: number
  entryCount?: number
  packageCount?: number
  lockfileHashPresent: boolean
  platformResponseDelivered: boolean
  deliveryAcknowledgementConsumed: boolean
  webDomResponseEventObserved: boolean
  effects: {
    uiIpcResponseDelivered: boolean
    electronIpcResponseSent: boolean
    webUiResponsePublished: boolean
    androidUiResponsePublished: boolean
    commandDispatched: boolean
    transactionCommitted: boolean
    runtimePublicationCommitted: boolean
    packageFilesWritten: boolean
    lockfileWritten: boolean
    settingsWritten: boolean
    savesWritten: boolean
    cacheWritten: boolean
    transactionLogWritten: boolean
    rollbackExecuted: boolean
    diagnosticsWritten: boolean
  }
}

export interface ThirdPartyElectronInstallCommandDispatchRuntimeProbeSummary {
  schemaVersion: 1
  observed: boolean
  status?: 'dispatched' | 'blocked' | 'unknown'
  requestedCommandId?: 'install'
  targetPackageId?: string
  selectedPackageCount: number
  blockedPackageCount: number
  loadOrderCount: number
  registryCount?: number
  entryCount?: number
  packageCount?: number
  lockfileHashPresent: boolean
  diagnosticsCount: number
  effects: {
    commandDispatcherCalled: boolean
    commandDispatched: boolean
    transactionCommitted: boolean
    postCommitVerificationExecuted: boolean
    uiIpcResponseDelivered: boolean
    packageFilesWritten: boolean
    packageBackupsWritten: boolean
    packageFilesRestored: boolean
    lockfileWritten: boolean
    lockfileRestored: boolean
    settingsWritten: boolean
    settingsRestored: boolean
    savesWritten: boolean
    cacheWritten: boolean
    transactionLogWritten: boolean
    recoveryLogRead: boolean
    recoveryLogReplayed: boolean
    rollbackExecuted: boolean
    diagnosticsWritten: boolean
  }
}

export interface ThirdPartyVisibleImportPanelStatusLabels {
  importStatus?: string
  targetPackage?: string
  preflightStatus?: string
  dispatchStatus?: string
  persistenceStatus?: string
  hostAckStatus?: string
  installOutcomeStatus?: string
  uiIpcDeliveryStatus?: string
  runtimePublicationStatus?: string
  liveRegistryStatus?: string
  appStartupStatus?: string
  startupPersistentStateStatus?: string
  installedManagementStatus?: string
  disableResult?: string
  enableResult?: string
  uninstallResult?: string
}

type ThirdPartyVisibleManagementCommandHostKind =
  | 'web-indexeddb'
  | 'electron-renderer'

export interface ThirdPartyVisibleImportRuntimeProbeSummary {
  schemaVersion: 1
  observed: boolean
  status?: 'ready' | 'blocked' | 'unknown'
  reason?: string
  entrypoint?: string
  mainMenuPanelOpened: boolean
  panelImportButtonClicked: boolean
  defaultFileInputSelectorUsed: boolean
  managementCommandHostKind?: ThirdPartyVisibleManagementCommandHostKind
  managementCommandDispatched?: boolean
  managementUiIpcResponseDelivered?: boolean
  targetPackageId?: string
  itemId?: string
  itemNameFallback?: string
  recipeId?: string
  recipeNameFallback?: string
  shopOfferId?: string
  shopOfferNameFallback?: string
  fileCount: number
  pickStatus?: string
  panelStatusLabels: ThirdPartyVisibleImportPanelStatusLabels
  dispatchPreflightStatus?: string
  discoveryStatus?: string
  transactionCommandDispatcherHostKind?: string
  transactionCommandDispatcherSourceStatus?: string
  installCommandPostCommitAcknowledgementStatus?: string
  postCommitVerificationExecutorHostMode?: string
  postCommitUiIpcDeliveryContinuationStatus?: string
  ordinaryInstallTransactionTerminalConnectionStatus?: string
  ordinaryInstallTransactionOutcomeKind?: string
  installTransactionLogPreparedStatus?: string
  installTransactionLogPreparedStorageKind?: string
  installTransactionLogPreparedPersistentReadVerificationStatus?: string
  installTransactionCommitFinalizationStatus?: string
  runtimePublicationCommitAfterPostCommitVerificationStatus?: string
  runtimePublicationCommitLiveRegistrySwapHostConnectionStatus?: string
  runtimePublicationCommitAppStartupReadinessStatus?: string
  runtimePublicationCommitAppStartupHostConnectionStatus?: string
  webStartupPersistentStateWriteStatus?: string
  electronStartupPersistentStateWriteStatus?: string
  selectedPackageCount: number
  blockedPackageCount: number
  loadOrderCount: number
  registryCount?: number
  entryCount?: number
  packageCount?: number
  diagnosticsCount: number
  contentAccessItemVisibleBefore: boolean
  contentAccessItemVisibleAfter: boolean
  contentAccessRecipeVisibleBefore: boolean
  contentAccessRecipeVisibleAfter: boolean
  contentAccessShopOfferVisibleBefore: boolean
  contentAccessShopOfferVisibleAfter: boolean
  effects: {
    commandDispatched: boolean
    packageFilesWritten: boolean
    settingsWritten: boolean
    lockfileWritten: boolean
    rendererLiveRegistrySwapped: boolean
    runtimeEnablementAllowed: boolean
    uiIpcResponseDelivered: boolean
    transactionCommitted: boolean
    transactionLogPrepared: boolean
    transactionLogRead: boolean
    startupPersistentStateWritten: boolean
    realNormalStartupHostCalled: boolean
    realAppStartupHostCalled: boolean
    gameAppCreated: boolean
    piniaCreated: boolean
    routerMounted: boolean
    savesWritten: boolean
    cacheWritten: boolean
    transactionLogWritten: boolean
    rollbackExecuted: boolean
    diagnosticsWritten: boolean
  }
  operation?: 'install' | 'disable' | 'enable' | 'upgrade' | 'uninstall' | 'rollback' | 'failure'
  disableButtonClicked?: boolean
  enableButtonClicked?: boolean
  uninstallButtonClicked?: boolean
  disableTerminalStatus?: 'ready' | 'blocked'
  disableTargetPackageId?: string
  disableSelectedPackageCount?: number
  disableBlockedPackageCount?: number
  disableLoadOrderCount?: number
  expectedPackageVersion?: string
  disableRegistryCount?: number
  disableEntryCount?: number
  disablePackageCount?: number
  disableSettingsWritten?: boolean
  disableLockfileWritten?: boolean
  disableStartupStateWritten?: boolean
  disablePackageFilesPreserved?: boolean
  disableRuntimePublicationExcluded?: boolean
  disableLiveRegistrySwapped?: boolean
  disableAppStartupHandoffAccepted?: boolean
  enableTerminalStatus?: 'ready' | 'blocked'
  enableTargetPackageId?: string
  enableSelectedPackageCount?: number
  enableBlockedPackageCount?: number
  enableLoadOrderCount?: number
  enableRegistryCount?: number
  enableEntryCount?: number
  enablePackageCount?: number
  enableSettingsWritten?: boolean
  enableLockfileWritten?: boolean
  enableStartupStateWritten?: boolean
  enablePackageFilesPreserved?: boolean
  enableRuntimePublicationIncluded?: boolean
  enableLiveRegistrySwapped?: boolean
  enableAppStartupHandoffAccepted?: boolean
  uninstallTerminalStatus?: 'ready' | 'blocked'
  uninstallTargetPackageId?: string
  uninstallSelectedPackageCount?: number
  uninstallBlockedPackageCount?: number
  uninstallLoadOrderCount?: number
  uninstallRegistryCount?: number
  uninstallEntryCount?: number
  uninstallPackageCount?: number
  uninstallSettingsWritten?: boolean
  uninstallLockfileWritten?: boolean
  uninstallStartupStateWritten?: boolean
  uninstallPackageFilesRemoved?: boolean
  uninstallRuntimePublicationExcluded?: boolean
  uninstallLiveRegistrySwapped?: boolean
  uninstallAppStartupHandoffAccepted?: boolean
}

export interface ContentRuntimeProbeEnvelope {
  schemaVersion: 1
  runtime: OfficialContentRuntimeReport
  thirdPartyStartupGate: ThirdPartyStartupGateRuntimeProbeSummary
  thirdPartyAppStartupHost: ThirdPartyAppStartupHostRuntimeProbeSummary
  thirdPartyRendererUiIpc: ThirdPartyRendererUiIpcRuntimeProbeSummary
  thirdPartyElectronInstallCommandDispatch: ThirdPartyElectronInstallCommandDispatchRuntimeProbeSummary
  thirdPartyVisibleImport: ThirdPartyVisibleImportRuntimeProbeSummary
  ui: {
    documentTitle: string
    locationProtocol: string
    mainMenuReady: boolean
    startupFailureVisible: boolean
  }
}

export interface ContentRuntimeProbeOptions {
  readonly thirdPartyStartupGateResult?: unknown
  readonly thirdPartyAppStartupHostResult?: unknown
  readonly thirdPartyStartupPersistentStateReadFromIndexedDb?: boolean
  readonly thirdPartyRendererUiIpcResult?: unknown
  readonly thirdPartyRendererUiIpcDeliveryInputSource?:
    ThirdPartyRendererUiIpcRuntimeProbeSummary['deliveryInputSource']
  readonly thirdPartyRendererUiIpcWebEventObserved?: boolean
  readonly thirdPartyElectronInstallCommandDispatchResult?: unknown
  readonly thirdPartyVisibleImportResult?: unknown
}

interface ElectronRuntimeProbeReporter {
  reportContentRuntimeProbe?: (report: ContentRuntimeProbeEnvelope) => void
}

type ThirdPartyStartupPersistentStateSourceHostMode =
  | 'injected-test-only'
  | 'web-indexeddb-startup-persistent-state'
  | 'electron-program-directory-startup-persistent-state'

type ProbeWindow = Window & {
  electronAPI?: ElectronRuntimeProbeReporter
  __TAOYUAN_CONTENT_RUNTIME_REPORT__?: ContentRuntimeProbeEnvelope
}

export const isContentRuntimeProbeRequested = (
  search: string = typeof location === 'undefined' ? '' : location.search
): boolean => new URLSearchParams(search).get('taoyuanContentProbe') === '1'

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

const readOwnBooleanField = (
  value: unknown,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readOwnNumberField = (
  value: unknown,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isSafeInteger(field) && field >= 0
    ? field
    : undefined
}

const readOwnStringField = (
  value: unknown,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readStartupPersistentStateSourceHostMode = (
  value: unknown,
  fieldName: string
): ThirdPartyStartupPersistentStateSourceHostMode | undefined => {
  const mode = readOwnStringField(value, fieldName)
  return mode === 'injected-test-only'
    || mode === 'web-indexeddb-startup-persistent-state'
    || mode === 'electron-program-directory-startup-persistent-state'
    ? mode
    : undefined
}

const readVisibleManagementCommandHostKind = (
  value: unknown
): ThirdPartyVisibleManagementCommandHostKind | undefined => {
  const hostKind = readOwnStringField(value, 'managementCommandHostKind')
  return hostKind === 'web-indexeddb' || hostKind === 'electron-renderer'
    ? hostKind
    : undefined
}

const readOwnArrayLength = (
  value: unknown
): number => {
  if (!Array.isArray(value)) return 0
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  } catch {
    return 0
  }
  return descriptor && 'value' in descriptor
    && typeof descriptor.value === 'number'
    && Number.isSafeInteger(descriptor.value)
    && descriptor.value >= 0
    ? descriptor.value
    : 0
}

const readPersistentStateProofsAccepted = (
  result: unknown
): boolean => {
  const proofs = readOwnDataField(result, 'persistentStateProofs')
  return readOwnBooleanField(proofs, 'transactionLogCommitted') === true
    && readOwnBooleanField(proofs, 'packageStateMatched') === true
    && readOwnBooleanField(proofs, 'settingsStateMatched') === true
    && readOwnBooleanField(proofs, 'modLockStateMatched') === true
    && readOwnBooleanField(proofs, 'liveRegistryMatched') === true
    && readOwnBooleanField(proofs, 'saveCacheIsolated') === true
}

const readStartupGateStatus = (
  result: unknown
): ThirdPartyStartupGateRuntimeProbeSummary['status'] => {
  const status = readOwnStringField(result, 'status')
  return status === 'ready' || status === 'skipped' || status === 'blocked'
    ? status
    : 'unknown'
}

const readAppStartupHostStatus = (
  result: unknown
): ThirdPartyAppStartupHostRuntimeProbeSummary['status'] => {
  const status = readOwnStringField(result, 'status')
  return status === 'accepted' || status === 'skipped' || status === 'blocked'
    ? status
    : 'unknown'
}

const readRendererUiIpcStatus = (
  result: unknown
): ThirdPartyRendererUiIpcRuntimeProbeSummary['status'] => {
  const status = readOwnStringField(result, 'status')
  return status === 'ready' || status === 'skipped' || status === 'blocked'
    ? status
    : 'unknown'
}

const readRendererUiIpcPlatform = (
  result: unknown
): ThirdPartyRendererUiIpcRuntimeProbeSummary['selectedPlatform'] => {
  const platform = readOwnStringField(result, 'selectedPlatform')
  return platform === 'electron' || platform === 'web' || platform === 'android'
    ? platform
    : undefined
}

const readRendererUiIpcEnvelopeKind = (
  result: unknown
): ThirdPartyRendererUiIpcRuntimeProbeSummary['envelopeKind'] => {
  const kind = readOwnStringField(result, 'envelopeKind')
  return kind === 'success' || kind === 'failure' || kind === 'retry' || kind === 'rollback'
    ? kind
    : undefined
}

const readElectronInstallCommandDispatchStatus = (
  result: unknown
): ThirdPartyElectronInstallCommandDispatchRuntimeProbeSummary['status'] => {
  const status = readOwnStringField(result, 'status')
  return status === 'dispatched' || status === 'blocked'
    ? status
    : 'unknown'
}

const readVisibleImportStatus = (
  result: unknown
): ThirdPartyVisibleImportRuntimeProbeSummary['status'] => {
  const status = readOwnStringField(result, 'status')
  return status === 'ready' || status === 'blocked' ? status : 'unknown'
}

const readVisibleImportPanelStatusLabels = (
  result: unknown
): ThirdPartyVisibleImportPanelStatusLabels => {
  const labels = readOwnDataField(result, 'panelStatusLabels')
  const importStatus = readOwnStringField(labels, 'importStatus')
  const targetPackage = readOwnStringField(labels, 'targetPackage')
  const preflightStatus = readOwnStringField(labels, 'preflightStatus')
  const dispatchStatus = readOwnStringField(labels, 'dispatchStatus')
  const persistenceStatus = readOwnStringField(labels, 'persistenceStatus')
  const hostAckStatus = readOwnStringField(labels, 'hostAckStatus')
  const installOutcomeStatus = readOwnStringField(labels, 'installOutcomeStatus')
  const uiIpcDeliveryStatus = readOwnStringField(labels, 'uiIpcDeliveryStatus')
  const runtimePublicationStatus = readOwnStringField(labels, 'runtimePublicationStatus')
  const liveRegistryStatus = readOwnStringField(labels, 'liveRegistryStatus')
  const appStartupStatus = readOwnStringField(labels, 'appStartupStatus')
  const startupPersistentStateStatus = readOwnStringField(labels, 'startupPersistentStateStatus')
  const installedManagementStatus = readOwnStringField(labels, 'installedManagementStatus')
  const disableResult = readOwnStringField(labels, 'disableResult')
  const enableResult = readOwnStringField(labels, 'enableResult')
  const uninstallResult = readOwnStringField(labels, 'uninstallResult')
  return {
    ...(importStatus !== undefined ? { importStatus } : {}),
    ...(targetPackage !== undefined ? { targetPackage } : {}),
    ...(preflightStatus !== undefined ? { preflightStatus } : {}),
    ...(dispatchStatus !== undefined ? { dispatchStatus } : {}),
    ...(persistenceStatus !== undefined ? { persistenceStatus } : {}),
    ...(hostAckStatus !== undefined ? { hostAckStatus } : {}),
    ...(installOutcomeStatus !== undefined ? { installOutcomeStatus } : {}),
    ...(uiIpcDeliveryStatus !== undefined ? { uiIpcDeliveryStatus } : {}),
    ...(runtimePublicationStatus !== undefined ? { runtimePublicationStatus } : {}),
    ...(liveRegistryStatus !== undefined ? { liveRegistryStatus } : {}),
    ...(appStartupStatus !== undefined ? { appStartupStatus } : {}),
    ...(startupPersistentStateStatus !== undefined ? { startupPersistentStateStatus } : {}),
    ...(installedManagementStatus !== undefined ? { installedManagementStatus } : {}),
    ...(disableResult !== undefined ? { disableResult } : {}),
    ...(enableResult !== undefined ? { enableResult } : {}),
    ...(uninstallResult !== undefined ? { uninstallResult } : {})
  }
}

const readInstallRequestedCommandId = (
  result: unknown
): 'install' | undefined =>
  readOwnStringField(result, 'requestedCommandId') === 'install' ? 'install' : undefined

const defaultStartupGateEffects = (): ThirdPartyStartupGateRuntimeProbeSummary['effects'] => ({
  appStartupHostConnectionSourceCalled: false,
  appStartupHostConnectionAccepted: false,
  appBootstrapContinuationAllowed: false,
  startupPersistentStateSourceCalled: false,
  startupStateSnapshotAccepted: false,
  uiIpcResponseDelivered: false,
  commandDispatched: false,
  thirdPartyRegistryPublished: false,
  liveRegistrySwapped: false,
  runtimeEnablementAllowed: false,
  realRuntimePublicationCommitCalled: false,
  realNormalStartupHostCalled: false,
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

const defaultAppStartupHostEffects =
  (): ThirdPartyAppStartupHostRuntimeProbeSummary['effects'] => ({
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
    saveRead: false,
    uiIpcResponseDelivered: false,
    commandDispatched: false,
    thirdPartyRegistryPublished: false,
    liveRegistrySwapped: false,
    runtimeEnablementAllowed: false,
    realRuntimePublicationCommitCalled: false,
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

const createProductProbeContentFallbackSummary = (
  result: unknown,
  targetPackageId: string | undefined
): Partial<Pick<
  ThirdPartyStartupGateRuntimeProbeSummary,
  'productProbeItemNameFallback'
  | 'productProbeRecipeNameFallback'
  | 'productProbeShopOfferNameFallback'
>> => {
  if (targetPackageId !== productProbePackageId) return {}
  const resultItemNameFallback = readOwnStringField(result, 'productProbeItemNameFallback')
  const resultRecipeNameFallback = readOwnStringField(result, 'productProbeRecipeNameFallback')
  const resultShopOfferNameFallback = readOwnStringField(result, 'productProbeShopOfferNameFallback')
  const shopOffer = getOfficialShopOfferDefs().find(
    currentOffer => currentOffer.id === productProbeShopOfferId
  )
  const itemNameFallback = resultItemNameFallback
    ?? getOfficialItemDef(productProbeItemId)?.name.fallback
  const recipeNameFallback = resultRecipeNameFallback
    ?? getOfficialRecipeDef(productProbeRecipeId)?.name.fallback
  const shopOfferNameFallback = resultShopOfferNameFallback
    ?? shopOffer?.name?.fallback
  return {
    ...(itemNameFallback === undefined ? {} : { productProbeItemNameFallback: itemNameFallback }),
    ...(recipeNameFallback === undefined ? {} : { productProbeRecipeNameFallback: recipeNameFallback }),
    ...(shopOfferNameFallback === undefined ? {} : { productProbeShopOfferNameFallback: shopOfferNameFallback })
  }
}

const defaultElectronInstallCommandDispatchEffects =
  (): ThirdPartyElectronInstallCommandDispatchRuntimeProbeSummary['effects'] => ({
    commandDispatcherCalled: false,
    commandDispatched: false,
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

const defaultRendererUiIpcEffects = (): ThirdPartyRendererUiIpcRuntimeProbeSummary['effects'] => ({
  uiIpcResponseDelivered: false,
  electronIpcResponseSent: false,
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
})

const defaultVisibleImportEffects =
  (): ThirdPartyVisibleImportRuntimeProbeSummary['effects'] => ({
    commandDispatched: false,
    packageFilesWritten: false,
    settingsWritten: false,
    lockfileWritten: false,
    rendererLiveRegistrySwapped: false,
    runtimeEnablementAllowed: false,
    uiIpcResponseDelivered: false,
    transactionCommitted: false,
    transactionLogPrepared: false,
    transactionLogRead: false,
    startupPersistentStateWritten: false,
    realNormalStartupHostCalled: false,
    realAppStartupHostCalled: false,
    gameAppCreated: false,
    piniaCreated: false,
    routerMounted: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })

export const createThirdPartyStartupGateRuntimeProbeSummary = (
  result: unknown,
  startupPersistentStateReadFromIndexedDb = false
): ThirdPartyStartupGateRuntimeProbeSummary => {
  if (result === undefined || result === null || typeof result !== 'object') {
    return {
      schemaVersion: 1,
      observed: false,
      sourceCalled: false,
      startupPersistentStateSourceCalled: false,
      startupStateSnapshotAccepted: false,
      startupPersistentStateReadFromIndexedDb: false,
      startupPersistentStateReadFromElectronUserdata: false,
      persistentStateProofsAccepted: false,
      responseDeliveryStartupGateHandoffPrepared: false,
      webResponseDeliveryAcknowledgementConsumed: false,
      selectedPackageCount: 0,
      blockedPackageCount: 0,
      loadOrderCount: 0,
      lockfileHashPresent: false,
      effects: defaultStartupGateEffects()
    }
  }

  const effects = readOwnDataField(result, 'effects')
  const targetPackageId = readOwnStringField(result, 'targetPackageId')
  const startupPersistentStateSourceKind = readOwnStringField(result, 'startupPersistentStateSourceKind')
  const startupPersistentStateSourceHostMode = readStartupPersistentStateSourceHostMode(
    result,
    'startupPersistentStateSourceHostMode'
  )
  const startupPersistentStateInjectedSourceHostMode = readStartupPersistentStateSourceHostMode(
    result,
    'startupPersistentStateInjectedSourceHostMode'
  )
  const startupPersistentStateSourceCalled =
    readOwnBooleanField(effects, 'startupPersistentStateSourceCalled') === true
  const startupStateSnapshotAccepted =
    readOwnBooleanField(effects, 'startupStateSnapshotAccepted') === true
  return {
    schemaVersion: 1,
    observed: true,
    status: readStartupGateStatus(result),
    sourceCalled: readOwnBooleanField(result, 'sourceCalled') === true,
    enabled: readOwnBooleanField(result, 'enabled'),
    appBootstrapContinuationAllowed: readOwnBooleanField(result, 'appBootstrapContinuationAllowed'),
    appStartupHostConnectionSourceStatus: readOwnStringField(result, 'appStartupHostConnectionSourceStatus'),
    startupPersistentStateSourceStatus: readOwnStringField(result, 'startupPersistentStateSourceStatus'),
    ...(startupPersistentStateSourceKind === 'web-indexeddb'
      || startupPersistentStateSourceKind === 'electron-program-directory-userdata'
      ? { startupPersistentStateSourceKind }
      : {}),
    ...(startupPersistentStateSourceHostMode === undefined
      ? {}
      : { startupPersistentStateSourceHostMode }),
    ...(startupPersistentStateInjectedSourceHostMode === undefined
      ? {}
      : { startupPersistentStateInjectedSourceHostMode }),
    startupPersistentStateSourceCalled,
    startupStateSnapshotAccepted,
    startupPersistentStateReadFromIndexedDb:
      (startupPersistentStateReadFromIndexedDb || startupPersistentStateSourceKind === 'web-indexeddb')
      && startupStateSnapshotAccepted,
    startupPersistentStateReadFromElectronUserdata:
      startupPersistentStateSourceKind === 'electron-program-directory-userdata'
      && startupStateSnapshotAccepted,
    persistentStateProofsAccepted: readPersistentStateProofsAccepted(result),
    webResponseDeliveryStartupGateHandoffStatus:
      readOwnStringField(result, 'webResponseDeliveryStartupGateHandoffStatus'),
    responseDeliveryStartupGateHandoffPrepared:
      readOwnBooleanField(result, 'responseDeliveryStartupGateHandoffPrepared') === true,
    webResponseDeliveryAcknowledgementConsumed:
      readOwnBooleanField(result, 'webResponseDeliveryAcknowledgementConsumed') === true,
    ...(targetPackageId !== undefined && isPackageId(targetPackageId)
      ? { targetPackageId }
      : {}),
    ...createProductProbeContentFallbackSummary(result, targetPackageId),
    selectedPackageCount: readOwnArrayLength(readOwnDataField(result, 'selectedPackageIds')),
    blockedPackageCount: readOwnArrayLength(readOwnDataField(result, 'blockedPackageIds')),
    loadOrderCount: readOwnArrayLength(readOwnDataField(result, 'loadOrder')),
    registryCount: readOwnNumberField(result, 'registryCount'),
    entryCount: readOwnNumberField(result, 'entryCount'),
    packageCount: readOwnNumberField(result, 'packageCount'),
    lockfileHashPresent: readOwnStringField(result, 'lockfileHash') !== undefined,
    effects: {
      appStartupHostConnectionSourceCalled:
        readOwnBooleanField(effects, 'appStartupHostConnectionSourceCalled') === true,
      appStartupHostConnectionAccepted:
        readOwnBooleanField(effects, 'appStartupHostConnectionAccepted') === true,
      appBootstrapContinuationAllowed:
        readOwnBooleanField(effects, 'appBootstrapContinuationAllowed') === true,
      startupPersistentStateSourceCalled,
      startupStateSnapshotAccepted,
      uiIpcResponseDelivered: readOwnBooleanField(effects, 'uiIpcResponseDelivered') === true,
      commandDispatched: readOwnBooleanField(effects, 'commandDispatched') === true,
      thirdPartyRegistryPublished:
        readOwnBooleanField(effects, 'thirdPartyRegistryPublished') === true,
      liveRegistrySwapped: readOwnBooleanField(effects, 'liveRegistrySwapped') === true,
      runtimeEnablementAllowed:
        readOwnBooleanField(effects, 'runtimeEnablementAllowed') === true,
      realRuntimePublicationCommitCalled:
        readOwnBooleanField(effects, 'realRuntimePublicationCommitCalled') === true,
      realNormalStartupHostCalled:
        readOwnBooleanField(effects, 'realNormalStartupHostCalled') === true,
      transactionCommitted: readOwnBooleanField(effects, 'transactionCommitted') === true,
      runtimePublicationCommitted: readOwnBooleanField(effects, 'runtimePublicationCommitted') === true,
      packageFilesWritten: readOwnBooleanField(effects, 'packageFilesWritten') === true,
      lockfileWritten: readOwnBooleanField(effects, 'lockfileWritten') === true,
      settingsWritten: readOwnBooleanField(effects, 'settingsWritten') === true,
      savesWritten: readOwnBooleanField(effects, 'savesWritten') === true,
      cacheWritten: readOwnBooleanField(effects, 'cacheWritten') === true,
      transactionLogWritten: readOwnBooleanField(effects, 'transactionLogWritten') === true,
      rollbackExecuted: readOwnBooleanField(effects, 'rollbackExecuted') === true,
      diagnosticsWritten: readOwnBooleanField(effects, 'diagnosticsWritten') === true
    }
  }
}

export const createThirdPartyAppStartupHostRuntimeProbeSummary = (
  result: unknown
): ThirdPartyAppStartupHostRuntimeProbeSummary => {
  if (result === undefined || result === null || typeof result !== 'object') {
    return {
      schemaVersion: 1,
      observed: false,
      sourceCalled: false,
      selectedPackageCount: 0,
      blockedPackageCount: 0,
      loadOrderCount: 0,
      lockfileHashPresent: false,
      effects: defaultAppStartupHostEffects()
    }
  }

  const effects = readOwnDataField(result, 'effects')
  const targetPackageId = readOwnStringField(result, 'targetPackageId')
  return {
    schemaVersion: 1,
    observed: true,
    status: readAppStartupHostStatus(result),
    enabled: readOwnBooleanField(result, 'enabled'),
    sourceCalled: readOwnBooleanField(result, 'sourceCalled') === true,
    ...(targetPackageId !== undefined && isPackageId(targetPackageId)
      ? { targetPackageId }
      : {}),
    appStartupHostConnectionSourceStatus:
      readOwnStringField(result, 'appStartupHostConnectionSourceStatus'),
    selectedPackageCount: readOwnArrayLength(readOwnDataField(result, 'selectedPackageIds')),
    blockedPackageCount: readOwnArrayLength(readOwnDataField(result, 'blockedPackageIds')),
    loadOrderCount: readOwnArrayLength(readOwnDataField(result, 'loadOrder')),
    registryCount: readOwnNumberField(result, 'registryCount'),
    entryCount: readOwnNumberField(result, 'entryCount'),
    packageCount: readOwnNumberField(result, 'packageCount'),
    lockfileHashPresent: readOwnBooleanField(result, 'lockfileHashPresent') === true,
    effects: {
      realAppStartupHostCalled:
        readOwnBooleanField(effects, 'realAppStartupHostCalled') === true,
      appStartupHostConnectionAccepted:
        readOwnBooleanField(effects, 'appStartupHostConnectionAccepted') === true,
      appBootstrapContinuationAllowed:
        readOwnBooleanField(effects, 'appBootstrapContinuationAllowed') === true,
      officialContentBootstrapped:
        readOwnBooleanField(effects, 'officialContentBootstrapped') === true,
      runtimeContentRegistryPublished:
        readOwnBooleanField(effects, 'runtimeContentRegistryPublished') === true,
      thirdPartyStartupGateCompleted:
        readOwnBooleanField(effects, 'thirdPartyStartupGateCompleted') === true,
      thirdPartyStartupGateAllowed:
        readOwnBooleanField(effects, 'thirdPartyStartupGateAllowed') === true,
      gameAppCreated: readOwnBooleanField(effects, 'gameAppCreated') === true,
      piniaCreated: readOwnBooleanField(effects, 'piniaCreated') === true,
      routerInstalled: readOwnBooleanField(effects, 'routerInstalled') === true,
      routerMounted: readOwnBooleanField(effects, 'routerMounted') === true,
      saveRead: readOwnBooleanField(effects, 'saveRead') === true,
      uiIpcResponseDelivered:
        readOwnBooleanField(effects, 'uiIpcResponseDelivered') === true,
      commandDispatched: readOwnBooleanField(effects, 'commandDispatched') === true,
      thirdPartyRegistryPublished:
        readOwnBooleanField(effects, 'thirdPartyRegistryPublished') === true,
      liveRegistrySwapped: readOwnBooleanField(effects, 'liveRegistrySwapped') === true,
      runtimeEnablementAllowed:
        readOwnBooleanField(effects, 'runtimeEnablementAllowed') === true,
      realRuntimePublicationCommitCalled:
        readOwnBooleanField(effects, 'realRuntimePublicationCommitCalled') === true,
      transactionCommitted: readOwnBooleanField(effects, 'transactionCommitted') === true,
      runtimePublicationCommitted:
        readOwnBooleanField(effects, 'runtimePublicationCommitted') === true,
      packageFilesWritten: readOwnBooleanField(effects, 'packageFilesWritten') === true,
      lockfileWritten: readOwnBooleanField(effects, 'lockfileWritten') === true,
      settingsWritten: readOwnBooleanField(effects, 'settingsWritten') === true,
      savesWritten: readOwnBooleanField(effects, 'savesWritten') === true,
      cacheWritten: readOwnBooleanField(effects, 'cacheWritten') === true,
      transactionLogWritten:
        readOwnBooleanField(effects, 'transactionLogWritten') === true,
      rollbackExecuted: readOwnBooleanField(effects, 'rollbackExecuted') === true,
      diagnosticsWritten: readOwnBooleanField(effects, 'diagnosticsWritten') === true
    }
  }
}

export const createThirdPartyRendererUiIpcRuntimeProbeSummary = (
  result: unknown,
  deliveryInputSource?: ThirdPartyRendererUiIpcRuntimeProbeSummary['deliveryInputSource'],
  webDomResponseEventObserved = false
): ThirdPartyRendererUiIpcRuntimeProbeSummary => {
  if (result === undefined || result === null || typeof result !== 'object') {
    return {
      schemaVersion: 1,
      observed: false,
      selectedPackageCount: 0,
      blockedPackageCount: 0,
      loadOrderCount: 0,
      lockfileHashPresent: false,
      platformResponseDelivered: false,
      deliveryAcknowledgementConsumed: false,
      webDomResponseEventObserved: false,
      effects: defaultRendererUiIpcEffects()
    }
  }

  const effects = readOwnDataField(result, 'effects')
  const targetPackageId = readOwnStringField(result, 'targetPackageId')
  return {
    schemaVersion: 1,
    observed: true,
    status: readRendererUiIpcStatus(result),
    ...(deliveryInputSource !== undefined ? { deliveryInputSource } : {}),
    selectedPlatform: readRendererUiIpcPlatform(result),
    ...(targetPackageId !== undefined && isPackageId(targetPackageId)
      ? { targetPackageId }
      : {}),
    envelopeKind: readRendererUiIpcEnvelopeKind(result),
    messageKey: readOwnStringField(result, 'messageKey'),
    selectedPackageCount: readOwnArrayLength(readOwnDataField(result, 'selectedPackageIds')),
    blockedPackageCount: readOwnArrayLength(readOwnDataField(result, 'blockedPackageIds')),
    loadOrderCount: readOwnArrayLength(readOwnDataField(result, 'loadOrder')),
    registryCount: readOwnNumberField(result, 'registryCount'),
    entryCount: readOwnNumberField(result, 'entryCount'),
    packageCount: readOwnNumberField(result, 'packageCount'),
    lockfileHashPresent: readOwnStringField(result, 'lockfileHash') !== undefined,
    platformResponseDelivered: readOwnBooleanField(result, 'platformResponseDelivered') === true,
    deliveryAcknowledgementConsumed:
      readOwnBooleanField(result, 'deliveryAcknowledgementConsumed') === true,
    webDomResponseEventObserved,
    effects: {
      uiIpcResponseDelivered: readOwnBooleanField(effects, 'uiIpcResponseDelivered') === true,
      electronIpcResponseSent: readOwnBooleanField(effects, 'electronIpcResponseSent') === true,
      webUiResponsePublished: readOwnBooleanField(effects, 'webUiResponsePublished') === true,
      androidUiResponsePublished: readOwnBooleanField(effects, 'androidUiResponsePublished') === true,
      commandDispatched: readOwnBooleanField(effects, 'commandDispatched') === true,
      transactionCommitted: readOwnBooleanField(effects, 'transactionCommitted') === true,
      runtimePublicationCommitted:
        readOwnBooleanField(effects, 'runtimePublicationCommitted') === true,
      packageFilesWritten: readOwnBooleanField(effects, 'packageFilesWritten') === true,
      lockfileWritten: readOwnBooleanField(effects, 'lockfileWritten') === true,
      settingsWritten: readOwnBooleanField(effects, 'settingsWritten') === true,
      savesWritten: readOwnBooleanField(effects, 'savesWritten') === true,
      cacheWritten: readOwnBooleanField(effects, 'cacheWritten') === true,
      transactionLogWritten: readOwnBooleanField(effects, 'transactionLogWritten') === true,
      rollbackExecuted: readOwnBooleanField(effects, 'rollbackExecuted') === true,
      diagnosticsWritten: readOwnBooleanField(effects, 'diagnosticsWritten') === true
    }
  }
}

export const createThirdPartyElectronInstallCommandDispatchRuntimeProbeSummary = (
  result: unknown
): ThirdPartyElectronInstallCommandDispatchRuntimeProbeSummary => {
  if (result === undefined || result === null || typeof result !== 'object') {
    return {
      schemaVersion: 1,
      observed: false,
      selectedPackageCount: 0,
      blockedPackageCount: 0,
      loadOrderCount: 0,
      lockfileHashPresent: false,
      diagnosticsCount: 0,
      effects: defaultElectronInstallCommandDispatchEffects()
    }
  }

  const effects = readOwnDataField(result, 'effects')
  const targetPackageId = readOwnStringField(result, 'targetPackageId')
  return {
    schemaVersion: 1,
    observed: true,
    status: readElectronInstallCommandDispatchStatus(result),
    requestedCommandId: readInstallRequestedCommandId(result),
    ...(targetPackageId !== undefined && isPackageId(targetPackageId)
      ? { targetPackageId }
      : {}),
    selectedPackageCount: readOwnArrayLength(readOwnDataField(result, 'selectedPackageIds')),
    blockedPackageCount: readOwnArrayLength(readOwnDataField(result, 'blockedPackageIds')),
    loadOrderCount: readOwnArrayLength(readOwnDataField(result, 'loadOrder')),
    registryCount: readOwnNumberField(result, 'registryCount'),
    entryCount: readOwnNumberField(result, 'entryCount'),
    packageCount: readOwnNumberField(result, 'packageCount'),
    lockfileHashPresent: readOwnStringField(result, 'lockfileHash') !== undefined,
    diagnosticsCount: readOwnArrayLength(readOwnDataField(result, 'diagnostics')),
    effects: {
      commandDispatcherCalled:
        readOwnBooleanField(effects, 'commandDispatcherCalled') === true,
      commandDispatched: readOwnBooleanField(effects, 'commandDispatched') === true,
      transactionCommitted: readOwnBooleanField(effects, 'transactionCommitted') === true,
      postCommitVerificationExecuted:
        readOwnBooleanField(effects, 'postCommitVerificationExecuted') === true,
      uiIpcResponseDelivered: readOwnBooleanField(effects, 'uiIpcResponseDelivered') === true,
      packageFilesWritten: readOwnBooleanField(effects, 'packageFilesWritten') === true,
      packageBackupsWritten: readOwnBooleanField(effects, 'packageBackupsWritten') === true,
      packageFilesRestored: readOwnBooleanField(effects, 'packageFilesRestored') === true,
      lockfileWritten: readOwnBooleanField(effects, 'lockfileWritten') === true,
      lockfileRestored: readOwnBooleanField(effects, 'lockfileRestored') === true,
      settingsWritten: readOwnBooleanField(effects, 'settingsWritten') === true,
      settingsRestored: readOwnBooleanField(effects, 'settingsRestored') === true,
      savesWritten: readOwnBooleanField(effects, 'savesWritten') === true,
      cacheWritten: readOwnBooleanField(effects, 'cacheWritten') === true,
      transactionLogWritten: readOwnBooleanField(effects, 'transactionLogWritten') === true,
      recoveryLogRead: readOwnBooleanField(effects, 'recoveryLogRead') === true,
      recoveryLogReplayed: readOwnBooleanField(effects, 'recoveryLogReplayed') === true,
      rollbackExecuted: readOwnBooleanField(effects, 'rollbackExecuted') === true,
      diagnosticsWritten: readOwnBooleanField(effects, 'diagnosticsWritten') === true
    }
  }
}

export const createThirdPartyVisibleImportRuntimeProbeSummary = (
  result: unknown
): ThirdPartyVisibleImportRuntimeProbeSummary => {
  if (result === undefined || result === null || typeof result !== 'object') {
    return {
      schemaVersion: 1,
      observed: false,
      mainMenuPanelOpened: false,
      panelImportButtonClicked: false,
      defaultFileInputSelectorUsed: false,
      fileCount: 0,
      panelStatusLabels: {},
      selectedPackageCount: 0,
      blockedPackageCount: 0,
      loadOrderCount: 0,
      diagnosticsCount: 0,
      contentAccessItemVisibleBefore: false,
      contentAccessItemVisibleAfter: false,
      contentAccessRecipeVisibleBefore: false,
      contentAccessRecipeVisibleAfter: false,
      contentAccessShopOfferVisibleBefore: false,
      contentAccessShopOfferVisibleAfter: false,
      effects: defaultVisibleImportEffects()
    }
  }

  const effects = readOwnDataField(result, 'effects')
  const targetPackageId = readOwnStringField(result, 'targetPackageId')
  const operation = readOwnStringField(result, 'operation')
  const disableButtonClicked = readOwnBooleanField(result, 'disableButtonClicked')
  const enableButtonClicked = readOwnBooleanField(result, 'enableButtonClicked')
  const uninstallButtonClicked = readOwnBooleanField(result, 'uninstallButtonClicked')
  const managementCommandHostKind = readVisibleManagementCommandHostKind(result)
  const managementCommandDispatched = readOwnBooleanField(result, 'managementCommandDispatched')
  const managementUiIpcResponseDelivered =
    readOwnBooleanField(result, 'managementUiIpcResponseDelivered')
  const disableTerminalStatus = readOwnStringField(result, 'disableTerminalStatus')
  const disableTargetPackageId = readOwnStringField(result, 'disableTargetPackageId')
  const disableSelectedPackageCount = readOwnNumberField(result, 'disableSelectedPackageCount')
  const disableBlockedPackageCount = readOwnNumberField(result, 'disableBlockedPackageCount')
  const disableLoadOrderCount = readOwnNumberField(result, 'disableLoadOrderCount')
  const disableRegistryCount = readOwnNumberField(result, 'disableRegistryCount')
  const disableEntryCount = readOwnNumberField(result, 'disableEntryCount')
  const disablePackageCount = readOwnNumberField(result, 'disablePackageCount')
  const disableSettingsWritten = readOwnBooleanField(result, 'disableSettingsWritten')
  const disableLockfileWritten = readOwnBooleanField(result, 'disableLockfileWritten')
  const disableStartupStateWritten = readOwnBooleanField(result, 'disableStartupStateWritten')
  const disablePackageFilesPreserved = readOwnBooleanField(result, 'disablePackageFilesPreserved')
  const disableRuntimePublicationExcluded = readOwnBooleanField(result, 'disableRuntimePublicationExcluded')
  const disableLiveRegistrySwapped = readOwnBooleanField(result, 'disableLiveRegistrySwapped')
  const disableAppStartupHandoffAccepted = readOwnBooleanField(result, 'disableAppStartupHandoffAccepted')
  const enableTerminalStatus = readOwnStringField(result, 'enableTerminalStatus')
  const enableTargetPackageId = readOwnStringField(result, 'enableTargetPackageId')
  const enableSelectedPackageCount = readOwnNumberField(result, 'enableSelectedPackageCount')
  const enableBlockedPackageCount = readOwnNumberField(result, 'enableBlockedPackageCount')
  const enableLoadOrderCount = readOwnNumberField(result, 'enableLoadOrderCount')
  const enableRegistryCount = readOwnNumberField(result, 'enableRegistryCount')
  const enableEntryCount = readOwnNumberField(result, 'enableEntryCount')
  const enablePackageCount = readOwnNumberField(result, 'enablePackageCount')
  const enableSettingsWritten = readOwnBooleanField(result, 'enableSettingsWritten')
  const enableLockfileWritten = readOwnBooleanField(result, 'enableLockfileWritten')
  const enableStartupStateWritten = readOwnBooleanField(result, 'enableStartupStateWritten')
  const enablePackageFilesPreserved = readOwnBooleanField(result, 'enablePackageFilesPreserved')
  const enableRuntimePublicationIncluded = readOwnBooleanField(result, 'enableRuntimePublicationIncluded')
  const enableLiveRegistrySwapped = readOwnBooleanField(result, 'enableLiveRegistrySwapped')
  const enableAppStartupHandoffAccepted = readOwnBooleanField(result, 'enableAppStartupHandoffAccepted')
  const uninstallTerminalStatus = readOwnStringField(result, 'uninstallTerminalStatus')
  const uninstallTargetPackageId = readOwnStringField(result, 'uninstallTargetPackageId')
  const uninstallSelectedPackageCount = readOwnNumberField(result, 'uninstallSelectedPackageCount')
  const uninstallBlockedPackageCount = readOwnNumberField(result, 'uninstallBlockedPackageCount')
  const uninstallLoadOrderCount = readOwnNumberField(result, 'uninstallLoadOrderCount')
  const uninstallRegistryCount = readOwnNumberField(result, 'uninstallRegistryCount')
  const uninstallEntryCount = readOwnNumberField(result, 'uninstallEntryCount')
  const uninstallPackageCount = readOwnNumberField(result, 'uninstallPackageCount')
  const uninstallSettingsWritten = readOwnBooleanField(result, 'uninstallSettingsWritten')
  const uninstallLockfileWritten = readOwnBooleanField(result, 'uninstallLockfileWritten')
  const uninstallStartupStateWritten = readOwnBooleanField(result, 'uninstallStartupStateWritten')
  const uninstallPackageFilesRemoved = readOwnBooleanField(result, 'uninstallPackageFilesRemoved')
  const uninstallRuntimePublicationExcluded = readOwnBooleanField(result, 'uninstallRuntimePublicationExcluded')
  const uninstallLiveRegistrySwapped = readOwnBooleanField(result, 'uninstallLiveRegistrySwapped')
  const uninstallAppStartupHandoffAccepted = readOwnBooleanField(result, 'uninstallAppStartupHandoffAccepted')
  return {
    schemaVersion: 1,
    observed: true,
    status: readVisibleImportStatus(result),
    reason: readOwnStringField(result, 'reason'),
    entrypoint: readOwnStringField(result, 'entrypoint'),
    mainMenuPanelOpened: readOwnBooleanField(result, 'mainMenuPanelOpened') === true,
    panelImportButtonClicked: readOwnBooleanField(result, 'panelImportButtonClicked') === true,
    defaultFileInputSelectorUsed:
      readOwnBooleanField(result, 'defaultFileInputSelectorUsed') === true,
    ...(managementCommandHostKind === undefined ? {} : { managementCommandHostKind }),
    ...(managementCommandDispatched === undefined ? {} : { managementCommandDispatched }),
    ...(managementUiIpcResponseDelivered === undefined
      ? {}
      : { managementUiIpcResponseDelivered }),
    ...(targetPackageId !== undefined && isPackageId(targetPackageId)
      ? { targetPackageId }
      : {}),
    itemId: readOwnStringField(result, 'itemId'),
    itemNameFallback: readOwnStringField(result, 'itemNameFallback'),
    recipeId: readOwnStringField(result, 'recipeId'),
    recipeNameFallback: readOwnStringField(result, 'recipeNameFallback'),
    shopOfferId: readOwnStringField(result, 'shopOfferId'),
    shopOfferNameFallback: readOwnStringField(result, 'shopOfferNameFallback'),
    fileCount: readOwnNumberField(result, 'fileCount') ?? 0,
    pickStatus: readOwnStringField(result, 'pickStatus'),
    panelStatusLabels: readVisibleImportPanelStatusLabels(result),
    dispatchPreflightStatus: readOwnStringField(result, 'dispatchPreflightStatus'),
    discoveryStatus: readOwnStringField(result, 'discoveryStatus'),
    transactionCommandDispatcherHostKind:
      readOwnStringField(result, 'transactionCommandDispatcherHostKind'),
    transactionCommandDispatcherSourceStatus:
      readOwnStringField(result, 'transactionCommandDispatcherSourceStatus'),
    installCommandPostCommitAcknowledgementStatus:
      readOwnStringField(result, 'installCommandPostCommitAcknowledgementStatus'),
    postCommitVerificationExecutorHostMode:
      readOwnStringField(result, 'postCommitVerificationExecutorHostMode'),
    postCommitUiIpcDeliveryContinuationStatus:
      readOwnStringField(result, 'postCommitUiIpcDeliveryContinuationStatus'),
    ordinaryInstallTransactionTerminalConnectionStatus:
      readOwnStringField(result, 'ordinaryInstallTransactionTerminalConnectionStatus'),
    ordinaryInstallTransactionOutcomeKind:
      readOwnStringField(result, 'ordinaryInstallTransactionOutcomeKind'),
    installTransactionLogPreparedStatus:
      readOwnStringField(result, 'installTransactionLogPreparedStatus'),
    installTransactionLogPreparedStorageKind:
      readOwnStringField(result, 'installTransactionLogPreparedStorageKind'),
    installTransactionLogPreparedPersistentReadVerificationStatus:
      readOwnStringField(result, 'installTransactionLogPreparedPersistentReadVerificationStatus'),
    installTransactionCommitFinalizationStatus:
      readOwnStringField(result, 'installTransactionCommitFinalizationStatus'),
    runtimePublicationCommitAfterPostCommitVerificationStatus:
      readOwnStringField(result, 'runtimePublicationCommitAfterPostCommitVerificationStatus'),
    runtimePublicationCommitLiveRegistrySwapHostConnectionStatus:
      readOwnStringField(result, 'runtimePublicationCommitLiveRegistrySwapHostConnectionStatus'),
    runtimePublicationCommitAppStartupReadinessStatus:
      readOwnStringField(result, 'runtimePublicationCommitAppStartupReadinessStatus'),
    runtimePublicationCommitAppStartupHostConnectionStatus:
      readOwnStringField(result, 'runtimePublicationCommitAppStartupHostConnectionStatus'),
    webStartupPersistentStateWriteStatus:
      readOwnStringField(result, 'webStartupPersistentStateWriteStatus'),
    electronStartupPersistentStateWriteStatus:
      readOwnStringField(result, 'electronStartupPersistentStateWriteStatus'),
    selectedPackageCount: readOwnNumberField(result, 'selectedPackageCount') ?? 0,
    blockedPackageCount: readOwnNumberField(result, 'blockedPackageCount') ?? 0,
    loadOrderCount: readOwnNumberField(result, 'loadOrderCount') ?? 0,
    expectedPackageVersion: readOwnStringField(result, 'expectedPackageVersion'),
    registryCount: readOwnNumberField(result, 'registryCount'),
    entryCount: readOwnNumberField(result, 'entryCount'),
    packageCount: readOwnNumberField(result, 'packageCount'),
    diagnosticsCount: readOwnNumberField(result, 'diagnosticsCount') ?? 0,
    contentAccessItemVisibleBefore:
      readOwnBooleanField(result, 'contentAccessItemVisibleBefore') === true,
    contentAccessItemVisibleAfter:
      readOwnBooleanField(result, 'contentAccessItemVisibleAfter') === true,
    contentAccessRecipeVisibleBefore:
      readOwnBooleanField(result, 'contentAccessRecipeVisibleBefore') === true,
    contentAccessRecipeVisibleAfter:
      readOwnBooleanField(result, 'contentAccessRecipeVisibleAfter') === true,
    contentAccessShopOfferVisibleBefore:
      readOwnBooleanField(result, 'contentAccessShopOfferVisibleBefore') === true,
    contentAccessShopOfferVisibleAfter:
      readOwnBooleanField(result, 'contentAccessShopOfferVisibleAfter') === true,
    ...(operation === 'install'
      || operation === 'disable'
      || operation === 'enable'
      || operation === 'upgrade'
      || operation === 'uninstall'
      || operation === 'rollback'
      || operation === 'failure'
      ? { operation }
      : {}),
    ...(disableButtonClicked === undefined ? {} : { disableButtonClicked }),
    ...(enableButtonClicked === undefined ? {} : { enableButtonClicked }),
    ...(uninstallButtonClicked === undefined ? {} : { uninstallButtonClicked }),
    ...(disableTerminalStatus === 'ready' || disableTerminalStatus === 'blocked'
      ? { disableTerminalStatus }
      : {}),
    ...(disableTargetPackageId === undefined ? {} : { disableTargetPackageId }),
    ...(disableSelectedPackageCount === undefined ? {} : { disableSelectedPackageCount }),
    ...(disableBlockedPackageCount === undefined ? {} : { disableBlockedPackageCount }),
    ...(disableLoadOrderCount === undefined ? {} : { disableLoadOrderCount }),
    ...(disableRegistryCount === undefined ? {} : { disableRegistryCount }),
    ...(disableEntryCount === undefined ? {} : { disableEntryCount }),
    ...(disablePackageCount === undefined ? {} : { disablePackageCount }),
    ...(disableSettingsWritten === undefined ? {} : { disableSettingsWritten }),
    ...(disableLockfileWritten === undefined ? {} : { disableLockfileWritten }),
    ...(disableStartupStateWritten === undefined ? {} : { disableStartupStateWritten }),
    ...(disablePackageFilesPreserved === undefined ? {} : { disablePackageFilesPreserved }),
    ...(disableRuntimePublicationExcluded === undefined ? {} : { disableRuntimePublicationExcluded }),
    ...(disableLiveRegistrySwapped === undefined ? {} : { disableLiveRegistrySwapped }),
    ...(disableAppStartupHandoffAccepted === undefined ? {} : { disableAppStartupHandoffAccepted }),
    ...(enableTerminalStatus === 'ready' || enableTerminalStatus === 'blocked'
      ? { enableTerminalStatus }
      : {}),
    ...(enableTargetPackageId === undefined ? {} : { enableTargetPackageId }),
    ...(enableSelectedPackageCount === undefined ? {} : { enableSelectedPackageCount }),
    ...(enableBlockedPackageCount === undefined ? {} : { enableBlockedPackageCount }),
    ...(enableLoadOrderCount === undefined ? {} : { enableLoadOrderCount }),
    ...(enableRegistryCount === undefined ? {} : { enableRegistryCount }),
    ...(enableEntryCount === undefined ? {} : { enableEntryCount }),
    ...(enablePackageCount === undefined ? {} : { enablePackageCount }),
    ...(enableSettingsWritten === undefined ? {} : { enableSettingsWritten }),
    ...(enableLockfileWritten === undefined ? {} : { enableLockfileWritten }),
    ...(enableStartupStateWritten === undefined ? {} : { enableStartupStateWritten }),
    ...(enablePackageFilesPreserved === undefined ? {} : { enablePackageFilesPreserved }),
    ...(enableRuntimePublicationIncluded === undefined ? {} : { enableRuntimePublicationIncluded }),
    ...(enableLiveRegistrySwapped === undefined ? {} : { enableLiveRegistrySwapped }),
    ...(enableAppStartupHandoffAccepted === undefined ? {} : { enableAppStartupHandoffAccepted }),
    ...(uninstallTerminalStatus === 'ready' || uninstallTerminalStatus === 'blocked'
      ? { uninstallTerminalStatus }
      : {}),
    ...(uninstallTargetPackageId === undefined ? {} : { uninstallTargetPackageId }),
    ...(uninstallSelectedPackageCount === undefined ? {} : { uninstallSelectedPackageCount }),
    ...(uninstallBlockedPackageCount === undefined ? {} : { uninstallBlockedPackageCount }),
    ...(uninstallLoadOrderCount === undefined ? {} : { uninstallLoadOrderCount }),
    ...(uninstallRegistryCount === undefined ? {} : { uninstallRegistryCount }),
    ...(uninstallEntryCount === undefined ? {} : { uninstallEntryCount }),
    ...(uninstallPackageCount === undefined ? {} : { uninstallPackageCount }),
    ...(uninstallSettingsWritten === undefined ? {} : { uninstallSettingsWritten }),
    ...(uninstallLockfileWritten === undefined ? {} : { uninstallLockfileWritten }),
    ...(uninstallStartupStateWritten === undefined ? {} : { uninstallStartupStateWritten }),
    ...(uninstallPackageFilesRemoved === undefined ? {} : { uninstallPackageFilesRemoved }),
    ...(uninstallRuntimePublicationExcluded === undefined ? {} : { uninstallRuntimePublicationExcluded }),
    ...(uninstallLiveRegistrySwapped === undefined ? {} : { uninstallLiveRegistrySwapped }),
    ...(uninstallAppStartupHandoffAccepted === undefined ? {} : { uninstallAppStartupHandoffAccepted }),
    effects: {
      commandDispatched: readOwnBooleanField(effects, 'commandDispatched') === true,
      packageFilesWritten: readOwnBooleanField(effects, 'packageFilesWritten') === true,
      settingsWritten: readOwnBooleanField(effects, 'settingsWritten') === true,
      lockfileWritten: readOwnBooleanField(effects, 'lockfileWritten') === true,
      rendererLiveRegistrySwapped:
        readOwnBooleanField(effects, 'rendererLiveRegistrySwapped') === true,
      runtimeEnablementAllowed:
        readOwnBooleanField(effects, 'runtimeEnablementAllowed') === true,
      uiIpcResponseDelivered: readOwnBooleanField(effects, 'uiIpcResponseDelivered') === true,
      transactionCommitted: readOwnBooleanField(effects, 'transactionCommitted') === true,
      transactionLogPrepared: readOwnBooleanField(effects, 'transactionLogPrepared') === true,
      transactionLogRead: readOwnBooleanField(effects, 'transactionLogRead') === true,
      startupPersistentStateWritten:
        readOwnBooleanField(effects, 'startupPersistentStateWritten') === true,
      realNormalStartupHostCalled:
        readOwnBooleanField(effects, 'realNormalStartupHostCalled') === true,
      realAppStartupHostCalled:
        readOwnBooleanField(effects, 'realAppStartupHostCalled') === true,
      gameAppCreated: readOwnBooleanField(effects, 'gameAppCreated') === true,
      piniaCreated: readOwnBooleanField(effects, 'piniaCreated') === true,
      routerMounted: readOwnBooleanField(effects, 'routerMounted') === true,
      savesWritten: readOwnBooleanField(effects, 'savesWritten') === true,
      cacheWritten: readOwnBooleanField(effects, 'cacheWritten') === true,
      transactionLogWritten: readOwnBooleanField(effects, 'transactionLogWritten') === true,
      rollbackExecuted: readOwnBooleanField(effects, 'rollbackExecuted') === true,
      diagnosticsWritten: readOwnBooleanField(effects, 'diagnosticsWritten') === true
    }
  }
}

export const publishContentRuntimeProbe = (
  options: ContentRuntimeProbeOptions = {}
): ContentRuntimeProbeEnvelope | null => {
  if (!isContentRuntimeProbeRequested() || typeof window === 'undefined') return null

  const buttonTexts = [...document.querySelectorAll('button')]
    .map(button => button.textContent?.trim() ?? '')
  const report: ContentRuntimeProbeEnvelope = {
    schemaVersion: 1,
    runtime: createOfficialContentRuntimeReport(),
    thirdPartyStartupGate: createThirdPartyStartupGateRuntimeProbeSummary(
      options.thirdPartyStartupGateResult,
      options.thirdPartyStartupPersistentStateReadFromIndexedDb === true
    ),
    thirdPartyAppStartupHost: createThirdPartyAppStartupHostRuntimeProbeSummary(
      options.thirdPartyAppStartupHostResult
    ),
    thirdPartyRendererUiIpc: createThirdPartyRendererUiIpcRuntimeProbeSummary(
      options.thirdPartyRendererUiIpcResult,
      options.thirdPartyRendererUiIpcDeliveryInputSource,
      options.thirdPartyRendererUiIpcWebEventObserved === true
    ),
    thirdPartyElectronInstallCommandDispatch:
      createThirdPartyElectronInstallCommandDispatchRuntimeProbeSummary(
        options.thirdPartyElectronInstallCommandDispatchResult
      ),
    thirdPartyVisibleImport: createThirdPartyVisibleImportRuntimeProbeSummary(
      options.thirdPartyVisibleImportResult
    ),
    ui: {
      documentTitle: document.title,
      locationProtocol: location.protocol,
      mainMenuReady: ['新的旅程', '导入存档', '关于游戏']
        .every(label => buttonTexts.includes(label)),
      startupFailureVisible: document.querySelector('.startup-failure') !== null
    }
  }

  const probeWindow = window as ProbeWindow
  Object.defineProperty(probeWindow, '__TAOYUAN_CONTENT_RUNTIME_REPORT__', {
    value: report,
    configurable: true
  })
  probeWindow.electronAPI?.reportContentRuntimeProbe?.(report)
  return report
}
