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
  readonly installTransactionCommitFinalizationInputObserved: boolean
  readonly installTransactionCommitFinalizationInputAccepted: boolean
  readonly installTransactionCommitFinalizationInputStatus?: string
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

interface ElectronInstallTransactionCommitFinalizationProbeBridge {
  readonly readThirdPartyDataPackInstallTransactionCommitFinalizationProbe?: () => Promise<unknown>
}

interface ElectronInstallTransactionCommitFinalizationProbeInput {
  readonly status?: string
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount?: number
  readonly entryCount?: number
  readonly packageCount?: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly transactionCommitConnectionAcknowledged: boolean
  readonly persistentPackageWriteExecuted: boolean
  readonly persistentSettingsLockfileWriteExecuted: boolean
}

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

const readOwnStringField = (
  value: unknown,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
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

const readOwnBooleanField = (
  value: unknown,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readArrayLength = (
  value: readonly unknown[]
): number | undefined => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  } catch {
    return undefined
  }
  return descriptor && 'value' in descriptor
    && typeof descriptor.value === 'number'
    && Number.isSafeInteger(descriptor.value)
    && descriptor.value >= 0
    ? descriptor.value
    : undefined
}

const clonePackageIds = (
  value: unknown
): readonly PackageId[] => {
  if (!Array.isArray(value)) return Object.freeze([])
  const length = readArrayLength(value)
  if (length === undefined) return Object.freeze([])

  const result: PackageId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor && typeof descriptor.value === 'string') {
      result.push(descriptor.value as PackageId)
    }
  }
  return Object.freeze(result)
}

const cloneCandidateIdentity = (
  value: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  const formatVersion = readOwnNumberField(value, 'formatVersion')
  const contentHash = readOwnStringField(value, 'contentHash')
  const snapshotHash = readOwnStringField(value, 'snapshotHash')
  const candidateHash = readOwnStringField(value, 'candidateHash')
  if (
    formatVersion !== 1
    || contentHash === undefined
    || snapshotHash === undefined
    || candidateHash === undefined
  ) {
    return undefined
  }
  return Object.freeze({
    formatVersion: 1,
    contentHash: contentHash as Sha256Hash,
    snapshotHash: snapshotHash as Sha256Hash,
    candidateHash: candidateHash as Sha256Hash
  })
}

const readElectronInstallTransactionCommitFinalizationBridge = (
  runtimeHost: unknown
): ElectronInstallTransactionCommitFinalizationProbeBridge | undefined => {
  const electronAPI = readOwnDataField(runtimeHost, 'electronAPI')
  const readProbe = readOwnDataField(
    electronAPI,
    'readThirdPartyDataPackInstallTransactionCommitFinalizationProbe'
  )
  return typeof readProbe === 'function'
    ? { readThirdPartyDataPackInstallTransactionCommitFinalizationProbe: readProbe as () => Promise<unknown> }
    : undefined
}

const readInstallTransactionCommitFinalizationProbeInput = async(
  runtimeHost: unknown,
  deliveryInputSource: ThirdPartyRendererUiIpcProductProbeInputSource
): Promise<ElectronInstallTransactionCommitFinalizationProbeInput | undefined> => {
  if (deliveryInputSource !== 'install-transaction-commit-finalization') return undefined
  const bridge = readElectronInstallTransactionCommitFinalizationBridge(runtimeHost)
  if (bridge === undefined) return undefined

  let rawInput: unknown
  try {
    rawInput = await bridge.readThirdPartyDataPackInstallTransactionCommitFinalizationProbe?.()
  } catch {
    return Object.freeze({
      selectedPackageIds: [],
      blockedPackageIds: [],
      loadOrder: [],
      transactionCommitConnectionAcknowledged: false,
      persistentPackageWriteExecuted: false,
      persistentSettingsLockfileWriteExecuted: false
    })
  }

  return Object.freeze({
    status: readOwnStringField(rawInput, 'status'),
    targetPackageId: readOwnStringField(rawInput, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds: clonePackageIds(readOwnDataField(rawInput, 'selectedPackageIds')),
    blockedPackageIds: clonePackageIds(readOwnDataField(rawInput, 'blockedPackageIds')),
    loadOrder: clonePackageIds(readOwnDataField(rawInput, 'loadOrder')),
    registryCount: readOwnNumberField(rawInput, 'registryCount'),
    entryCount: readOwnNumberField(rawInput, 'entryCount'),
    packageCount: readOwnNumberField(rawInput, 'packageCount'),
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(rawInput, 'candidateIdentity')),
    lockfileHash: readOwnStringField(rawInput, 'lockfileHash') as Sha256Hash | undefined,
    transactionCommitConnectionAcknowledged:
      readOwnBooleanField(rawInput, 'transactionCommitConnectionAcknowledged') === true,
    persistentPackageWriteExecuted:
      readOwnBooleanField(rawInput, 'persistentPackageWriteExecuted') === true,
    persistentSettingsLockfileWriteExecuted:
      readOwnBooleanField(rawInput, 'persistentSettingsLockfileWriteExecuted') === true
  })
}

const isInstallTransactionCommitFinalizationInputAccepted = (
  input: ElectronInstallTransactionCommitFinalizationProbeInput | undefined
): input is ElectronInstallTransactionCommitFinalizationProbeInput => input !== undefined
  && input.status === 'committed'
  && input.targetPackageId === packageId
  && input.selectedPackageIds.length === summary.selectedPackageCount
  && input.selectedPackageIds[0] === packageId
  && input.blockedPackageIds.length === summary.blockedPackageCount
  && input.loadOrder.length === summary.loadOrderCount
  && input.loadOrder[0] === packageId
  && input.registryCount === summary.registryCount
  && input.entryCount === summary.entryCount
  && input.packageCount === summary.packageCount
  && input.candidateIdentity !== undefined
  && input.lockfileHash !== undefined
  && input.transactionCommitConnectionAcknowledged
  && input.persistentPackageWriteExecuted
  && input.persistentSettingsLockfileWriteExecuted

const selectedPackageIdsFrom = (
  input: ElectronInstallTransactionCommitFinalizationProbeInput | undefined
): readonly PackageId[] =>
  isInstallTransactionCommitFinalizationInputAccepted(input) ? input.selectedPackageIds : [packageId]

const candidateIdentityFrom = (
  input: ElectronInstallTransactionCommitFinalizationProbeInput | undefined
): ThirdPartyCandidateIdentitySummary =>
  isInstallTransactionCommitFinalizationInputAccepted(input) && input.candidateIdentity !== undefined
    ? input.candidateIdentity
    : candidateIdentity

const lockfileHashFrom = (
  input: ElectronInstallTransactionCommitFinalizationProbeInput | undefined
): Sha256Hash =>
  isInstallTransactionCommitFinalizationInputAccepted(input) && input.lockfileHash !== undefined
    ? input.lockfileHash
    : lockfileHash

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
    deliveryInputSource: ThirdPartyRendererUiIpcProductProbeInputSource,
    installTransactionCommitFinalizationInput?: ElectronInstallTransactionCommitFinalizationProbeInput
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
    selectedPackageIds: selectedPackageIdsFrom(installTransactionCommitFinalizationInput),
    blockedPackageIds: [],
    blockedCandidateCount: 0,
    loadOrder: selectedPackageIdsFrom(installTransactionCommitFinalizationInput),
    registryCount: summary.registryCount,
    entryCount: summary.entryCount,
    packageCount: summary.packageCount,
    candidateIdentity: candidateIdentityFrom(installTransactionCommitFinalizationInput),
    lockfileHash: lockfileHashFrom(installTransactionCommitFinalizationInput),
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
    deliveryInputSource: ThirdPartyRendererUiIpcProductProbeInputSource,
    installTransactionCommitFinalizationInput?: ElectronInstallTransactionCommitFinalizationProbeInput
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
    selectedPackageIds: selectedPackageIdsFrom(installTransactionCommitFinalizationInput),
    blockedPackageIds: [],
    blockedCandidateCount: 0,
    loadOrder: selectedPackageIdsFrom(installTransactionCommitFinalizationInput),
    registryCount: summary.registryCount,
    entryCount: summary.entryCount,
    packageCount: summary.packageCount,
    candidateIdentity: candidateIdentityFrom(installTransactionCommitFinalizationInput),
    lockfileHash: lockfileHashFrom(installTransactionCommitFinalizationInput),
    checks: [],
    diagnostics: [],
    summary,
    outcome: {
      kind: 'success',
      settled: true,
      packageId,
      candidateIdentity: candidateIdentityFrom(installTransactionCommitFinalizationInput),
      lockfileHash: lockfileHashFrom(installTransactionCommitFinalizationInput),
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
  const installTransactionCommitFinalizationInput =
    await readInstallTransactionCommitFinalizationProbeInput(runtimeHost, deliveryInputSource)
  const installTransactionCommitFinalizationInputObserved =
    installTransactionCommitFinalizationInput !== undefined
  const installTransactionCommitFinalizationInputAccepted =
    isInstallTransactionCommitFinalizationInputAccepted(installTransactionCommitFinalizationInput)
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
      readResultNormalizationPreflight: async() =>
        createProbeNormalizationPreflight(deliveryInputSource, installTransactionCommitFinalizationInput),
      readPostCommitVerificationUiIpcOutcomeHandoff: async() =>
        createProbeOutcomeHandoff(deliveryInputSource, installTransactionCommitFinalizationInput)
    })
    return {
      responseDeliveryResult: await pipeline(),
      webDomResponseEventObserved,
      deliveryInputSource,
      installTransactionCommitFinalizationInputObserved,
      installTransactionCommitFinalizationInputAccepted,
      installTransactionCommitFinalizationInputStatus:
        installTransactionCommitFinalizationInput?.status
    }
  } finally {
    webEventTarget?.removeEventListener(thirdPartyDataPackWebResponseDeliveryEventName, listener)
  }
}
