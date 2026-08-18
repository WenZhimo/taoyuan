import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import {
  createThirdPartyDataPackElectronUiIpcResponseDeliveryPipeline
} from './thirdPartyDataPackElectronUiIpcResponseDeliveryPipeline'
import {
  createThirdPartyDataPackInMemoryElectronResponseDeliveryHost,
  createThirdPartyDataPackInMemoryWebResponseDeliveryHost,
  type ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostExpectationOptions
} from './thirdPartyDataPackInMemoryUiIpcResponseDeliveryHost'
import type {
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from './thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'
import {
  createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource
} from './thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
} from './thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryPlatformId
} from './thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from './thirdPartyDataPackUiIpcResultNormalizationPreflight'
import {
  createThirdPartyDataPackWebUiIpcResponseDeliveryPipeline
} from './thirdPartyDataPackWebUiIpcResponseDeliveryPipeline'

type Awaitable<T> = T | Promise<T>

export type ThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPlatform =
  Extract<ThirdPartyDataPackUiIpcResponseDeliveryPlatformId, 'electron' | 'web'>

export interface CreateThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipelineOptions {
  readonly enabled?: boolean
  readonly platform?: ThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPlatform
  readonly readResultNormalizationPreflight?: () =>
    Awaitable<ThirdPartyDataPackUiIpcResultNormalizationPreflightResult>
  readonly readPostCommitVerificationUiIpcOutcomeHandoff?: () =>
    Awaitable<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult>
  readonly expectedPackageId?: PackageId
  readonly expectedEnvelopeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly expectedMessageKey?: string
}

const hostExpectations = (
  options: CreateThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipelineOptions
): ThirdPartyDataPackInMemoryUiIpcResponseDeliveryHostExpectationOptions => ({
  expectedPackageId: options.expectedPackageId,
  expectedEnvelopeKind: options.expectedEnvelopeKind,
  expectedMessageKey: options.expectedMessageKey
})

const createBlockedMissingPlatformResult = (
  enabled: boolean
): ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult => Object.freeze({
  kind: 'third-party-ui-ipc-response-delivery-acknowledgement-convergence-source',
  mode: 'default-disabled-ui-ipc-response-delivery-acknowledgement-convergence-source',
  status: enabled ? 'blocked' : 'skipped',
  reason: enabled
    ? 'third-party UI/IPC response delivery host connection pipeline is enabled without a selected platform'
    : 'third-party UI/IPC response delivery host connection pipeline is disabled by default',
  readOnly: true,
  enabled,
  sourceCalled: false,
  startupGateContinuationAllowed: !enabled,
  platformResponseDelivered: false,
  deliveryAcknowledgementConsumed: false,
  startupGateHandoffPreflightConsumed: false,
  responseDeliveryStartupGateHandoffPrepared: false,
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
  selectedPackageIds: [],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  checks: [],
  diagnostics: enabled
    ? [Object.freeze({
        code: 'LIFECYCLE-TRANSACTION-001',
        ruleId: 'LIFECYCLE-TRANSACTION-001',
        severity: 'error',
        stage: 'third-party.ui-ipc-response-delivery-host-connection-pipeline.missing-platform',
        messageKey: 'mods.error.lifecycle.transaction.001',
        recovery: 'retry'
      })]
    : [],
  summary: Object.freeze({
    selectedPackageCount: 0,
    blockedPackageCount: 0,
    blockedCandidateCount: 0,
    loadOrderCount: 0,
    registryCount: 54,
    entryCount: 4242,
    packageCount: 0,
    diagnosticCount: enabled ? 1 : 0
  }),
  effects: Object.freeze({
    uiIpcResponseDeliveryAcknowledgementConvergenceSourceCalled: true,
    selectedPlatformHandoffSourceCalled: false,
    selectedPlatformHandoffAccepted: false,
    deliveryAcknowledgementConverged: false,
    startupGateContinuationAllowed: !enabled,
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
    electronIpcResponseSent: false,
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
    successEnvelopeDelivered: false,
    failureEnvelopeDelivered: false,
    retryStateDelivered: false,
    rollbackStateDelivered: false,
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
    diagnosticsWritten: false,
    electronResponseDeliveryAcknowledgementConsumed: false,
    webResponseDeliveryAcknowledgementConsumed: false,
    androidResponseDeliveryAcknowledgementConsumed: false,
    startupGateHandoffPreflightConsumed: false,
    responseDeliveryStartupGateHandoffPrepared: false
  }),
  lockfileHash: undefined as Sha256Hash | undefined
})

const missingHostConnectionConvergenceSource = (
  options: {
    readonly enabled?: boolean
    readonly platform?: ThirdPartyDataPackUiIpcResponseDeliveryPlatformId
  }
): (() => Promise<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult>) =>
  createThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource({
    enabled: options.enabled,
    platform: options.platform
  })

export const createThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipeline = (
  options: CreateThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult>) => {
  const selectedPlatform = (
    options as { readonly platform?: ThirdPartyDataPackUiIpcResponseDeliveryPlatformId }
  ).platform

  if (selectedPlatform === undefined) {
    return async() => createBlockedMissingPlatformResult(options.enabled === true)
  }

  if (selectedPlatform !== 'electron' && selectedPlatform !== 'web') {
    return missingHostConnectionConvergenceSource({
      enabled: options.enabled,
      platform: selectedPlatform
    })
  }

  const baseOptions = {
    enabled: options.enabled,
    readResultNormalizationPreflight: options.readResultNormalizationPreflight,
    readPostCommitVerificationUiIpcOutcomeHandoff: options.readPostCommitVerificationUiIpcOutcomeHandoff
  }

  switch (selectedPlatform) {
    case 'electron':
      return createThirdPartyDataPackElectronUiIpcResponseDeliveryPipeline({
        ...baseOptions,
        host: createThirdPartyDataPackInMemoryElectronResponseDeliveryHost(hostExpectations(options))
      })
    case 'web':
      return createThirdPartyDataPackWebUiIpcResponseDeliveryPipeline({
        ...baseOptions,
        host: createThirdPartyDataPackInMemoryWebResponseDeliveryHost(hostExpectations(options))
      })
  }
}

export const thirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipeline =
  createThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipeline()
