import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline'
import type {
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary,
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'
import {
  thirdPartyDataPackWebResponseDeliveryEventName
} from '@/domain/mods/thirdPartyDataPackWebDomResponseDeliveryBridge'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackUiIpcResultNormalizationEffectSummary,
  ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResultNormalizationPreflight'

export interface ThirdPartyRendererUiIpcProductProbeResult {
  readonly responseDeliveryResult: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
  readonly webDomResponseEventObserved: boolean
  readonly deliveryInputSource: ThirdPartyRendererUiIpcProductProbeInputSource
}

export type ThirdPartyRendererUiIpcProductProbeInputSource =
  | 'synthetic-success-handoff'
  | 'install-transaction-commit-finalization'

export interface ThirdPartyRendererUiIpcProductProbeOptions {
  readonly deliveryInputSource?: ThirdPartyRendererUiIpcProductProbeInputSource
}

const packageId = 'product_probe_pack' as PackageId
const lockfileHash = `sha256:${'d'.repeat(64)}` as Sha256Hash

const hash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: hash('a'),
  snapshotHash: hash('b'),
  candidateHash: hash('c')
}

const summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
}

const noNormalizationEffects = (): ThirdPartyDataPackUiIpcResultNormalizationEffectSummary => ({
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
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
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
  diagnosticsWritten: false
})

const noHandoffEffects = (): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary => ({
  ...noNormalizationEffects(),
  atomicCommitOutcomeConsumed: true,
  postCommitVerificationOutcomeConsumed: true,
  uiIpcOutcomePrepared: true
})

const createProbeNormalizationPreflight =
  (
    deliveryInputSource: ThirdPartyRendererUiIpcProductProbeInputSource
  ): ThirdPartyDataPackUiIpcResultNormalizationPreflightResult => ({
    status: 'deferred',
    atomicTransactionCommitExecutorPreflightStatus: 'deferred',
    postCommitVerificationExecutorPreflightStatus: 'deferred',
    reason: deliveryInputSource === 'install-transaction-commit-finalization'
      ? 'product runtime probe supplies a path-free UI/IPC normalization preflight for an install transaction commit finalization result'
      : 'product runtime probe supplies a path-free UI/IPC normalization preflight',
    requestedCommandId: 'install',
    targetPackageId: packageId,
    diagnostics: [],
    selectedPackageIds: [packageId],
    blockedPackageIds: [],
    blockedCandidateCount: 0,
    loadOrder: [packageId],
    registryCount: summary.registryCount,
    entryCount: summary.entryCount,
    packageCount: summary.packageCount,
    candidateIdentity,
    lockfileHash,
    uiIpcResultNormalizationPreflight: 'deferred',
    readOnly: true,
    successEnvelopeAllowed: false,
    failureEnvelopeAllowed: false,
    retryStateAllowed: false,
    rollbackStateAllowed: false,
    uiIpcResponseDeliveryAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    resultChecks: [],
    resultStages: [],
    resultRequirements: [],
    resultOutcomeStates: [],
    effects: noNormalizationEffects()
  })

const createProbeOutcomeHandoff =
  (
    deliveryInputSource: ThirdPartyRendererUiIpcProductProbeInputSource
  ): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult => ({
    status: 'ready',
    resultNormalizationPreflightStatus: 'deferred',
    atomicCommitOutcomeContractStatus: 'ready',
    postCommitVerificationExecutorAdapterStatus: 'executed',
    reason: deliveryInputSource === 'install-transaction-commit-finalization'
      ? 'product runtime probe supplies a path-free post-commit UI/IPC outcome handoff sourced from install transaction commit finalization'
      : 'product runtime probe supplies a path-free post-commit UI/IPC outcome handoff',
    postCommitVerificationUiIpcOutcomeHandoff: 'ready',
    readOnly: true,
    uiIpcOutcomePrepared: true,
    uiIpcResponseDeliveryAllowed: false,
    commandDispatchAllowed: false,
    atomicCommitExecutionAllowed: false,
    transactionCommitAllowed: false,
    runtimePublicationCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: 'install',
    targetPackageId: packageId,
    outcomeKind: 'success',
    messageKey: 'mods.ui.ipc.result.install.success',
    selectedPackageIds: [packageId],
    blockedPackageIds: [],
    blockedCandidateCount: 0,
    loadOrder: [packageId],
    registryCount: summary.registryCount,
    entryCount: summary.entryCount,
    packageCount: summary.packageCount,
    candidateIdentity,
    lockfileHash,
    checks: [],
    diagnostics: [],
    summary,
    outcome: {
      kind: 'success',
      settled: true,
      packageId,
      candidateIdentity,
      lockfileHash,
      diagnostics: [],
      messageKey: 'mods.ui.ipc.result.install.success',
      recovery: 'none',
      retryable: false,
      rollbackRequired: false
    },
    effects: noHandoffEffects()
  })

const webEventTargetFromHost = (runtimeHost: unknown): EventTarget | undefined => {
  if (typeof EventTarget !== 'undefined' && runtimeHost instanceof EventTarget) return runtimeHost
  if (runtimeHost === null || typeof runtimeHost !== 'object') return undefined

  try {
    const candidate = runtimeHost as Partial<EventTarget>
    return typeof candidate.addEventListener === 'function'
      && typeof candidate.removeEventListener === 'function'
      && typeof candidate.dispatchEvent === 'function'
      ? candidate as EventTarget
      : undefined
  } catch {
    return undefined
  }
}

export const runThirdPartyRendererUiIpcProductProbe = async(
  runtimeHost: unknown = typeof window === 'undefined' ? undefined : window,
  options: ThirdPartyRendererUiIpcProductProbeOptions = {}
): Promise<ThirdPartyRendererUiIpcProductProbeResult> => {
  const deliveryInputSource = options.deliveryInputSource ?? 'synthetic-success-handoff'
  const webEventTarget = webEventTargetFromHost(runtimeHost)
  let webDomResponseEventObserved = false
  const listener = () => {
    webDomResponseEventObserved = true
  }

  webEventTarget?.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, listener, { once: true })
  try {
    const pipeline = createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline({
      enabled: true,
      runtimeHost,
      readResultNormalizationPreflight: async() => createProbeNormalizationPreflight(deliveryInputSource),
      readPostCommitVerificationUiIpcOutcomeHandoff: async() => createProbeOutcomeHandoff(deliveryInputSource)
    })
    return {
      responseDeliveryResult: await pipeline(),
      webDomResponseEventObserved,
      deliveryInputSource
    }
  } finally {
    webEventTarget?.removeEventListener(thirdPartyDataPackWebResponseDeliveryEventName, listener)
  }
}
