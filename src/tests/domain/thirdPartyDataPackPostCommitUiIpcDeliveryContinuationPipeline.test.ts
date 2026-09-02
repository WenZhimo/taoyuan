import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope
} from '@/domain/mods/thirdPartyDataPackElectronIpcResponseDeliveryBridge'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionEffectSummary,
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostEffectSummary,
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult,
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource'
import {
  createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline'
import type {
  ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult
} from '@/domain/mods/thirdPartyDataPackOrdinaryInstallTransactionPipeline'
import {
  createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline
} from '@/domain/mods/thirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline'
import {
  ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError,
  type ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource'
import type {
  ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostEffectSummary,
  ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentReadWriteConnectionSource'
import type {
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary,
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackUiIpcResultNormalizationEffectSummary,
  ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResultNormalizationPreflight'
import {
  thirdPartyDataPackWebResponseDeliveryEventName,
  type ThirdPartyDataPackWebDomResponseDeliveryEvent
} from '@/domain/mods/thirdPartyDataPackWebDomResponseDeliveryBridge'

const packageId = 'sample_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const lockfileHash = testHash('d')

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

const transactionEffects = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionEffectSummary> = {}
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionEffectSummary => ({
  installPersistentStagingSettingsLockfileTransactionCommitConnectionSourceCalled: true,
  installPersistentStagingSettingsLockfileLifecyclePipelineCalled: true,
  installTransactionCommitConnectionHostCalled: true,
  installTransactionCommitConnectionHostAccepted: true,
  transactionCommitConnectionAcknowledged: true,
  packageFilePersistentWriteAcknowledged: true,
  installCommandLifecycleAcknowledged: true,
  settingsLockfilePersistentWriterAcknowledged: true,
  commandDispatched: true,
  atomicCommitExecutorAcknowledged: true,
  postCommitVerificationAcknowledged: true,
  persistentReadProofAcknowledged: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
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
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
  packageFilesWritten: true,
  packageBackupsWritten: true,
  packageFilesRestored: false,
  lockfileWritten: true,
  lockfileRestored: false,
  settingsWritten: true,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false,
  ...overrides
})

const lifecycleEffects = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult['effects']> = {}
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult['effects'] => ({
  installPersistentStagingSettingsLockfileLifecyclePipelineCalled: true,
  installPersistentStagingLifecyclePipelineCalled: true,
  settingsLockfilePersistentWriterSourceCalled: true,
  packageFilePersistentWriteAcknowledged: true,
  installCommandLifecycleAcknowledged: true,
  settingsLockfilePersistentWriterAcknowledged: true,
  commandDispatched: true,
  atomicCommitExecutorAcknowledged: true,
  postCommitVerificationAcknowledged: true,
  persistentReadProofAcknowledged: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
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
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
  packageFilesWritten: true,
  packageBackupsWritten: true,
  packageFilesRestored: false,
  lockfileWritten: true,
  lockfileRestored: false,
  settingsWritten: true,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false,
  ...overrides
})

const transactionHostEffects = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostEffectSummary> = {}
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostEffectSummary => ({
  installTransactionCommitConnectionHostCalled: true,
  installTransactionCommitConnectionHostAccepted: true,
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
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
  diagnosticsWritten: false,
  ...overrides
})

const postCommitHostEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostEffectSummary> = {}
): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostEffectSummary => ({
  postCommitPersistentReadWriteConnectionHostCalled: true,
  postCommitPersistentReadWriteConnectionHostAccepted: true,
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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
  ...overrides
})

const normalizationEffects = (): ThirdPartyDataPackUiIpcResultNormalizationEffectSummary => ({
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

const handoffEffects = (
  prepared: boolean
): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary => ({
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
  diagnosticsWritten: false,
  atomicCommitOutcomeConsumed: prepared,
  postCommitVerificationOutcomeConsumed: prepared,
  uiIpcOutcomePrepared: prepared
})

const createTransactionConnectionResult = (): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult => ({
  kind: 'third-party-install-persistent-staging-settings-lockfile-transaction-commit-connection-source',
  mode: 'default-disabled-install-persistent-staging-settings-lockfile-transaction-commit-connection-source',
  status: 'accepted',
  reason: 'transaction commit connection accepted',
  readOnly: false,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  installPersistentStagingSettingsLockfileLifecyclePipelineStatus: 'ready',
  installTransactionCommitConnectionHostStatus: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  persistentPackageWriteExecuted: true,
  writtenFileCount: 2,
  backedUpFileCount: 1,
  persistentSettingsLockfileWriteExecuted: true,
  transactionCommitConnectionAcknowledged: true,
  checks: [],
  diagnostics: [],
  effects: transactionEffects()
} as ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult)

const createLifecycleResult = (): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult => ({
  kind: 'third-party-install-persistent-staging-settings-lockfile-lifecycle-pipeline',
  mode: 'default-disabled-install-persistent-staging-settings-lockfile-lifecycle-pipeline',
  status: 'ready',
  reason: 'third-party install persistent staging settings-lockfile lifecycle accepted matching package-file and settings-lockfile write acknowledgements',
  readOnly: false,
  enabled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  installPersistentStagingLifecyclePipelineStatus: 'ready',
  settingsLockfilePersistentWriterSourceStatus: 'written',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  persistentPackageWriteExecuted: true,
  writtenFileCount: 2,
  backedUpFileCount: 1,
  persistentSettingsLockfileWriteExecuted: true,
  checks: [],
  diagnostics: [],
  effects: lifecycleEffects()
} as ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult)

const createTransactionHostResult = (): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionHostResult => ({
  status: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  persistentPackageWriteExecuted: true,
  persistentSettingsLockfileWriteExecuted: true,
  writtenFileCount: 2,
  backedUpFileCount: 1,
  diagnostics: [],
  effects: transactionHostEffects()
})

const createPostCommitHostResult = (): ThirdPartyDataPackPostCommitPersistentReadWriteConnectionHostResult => ({
  status: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  persistentPackageWriteExecuted: true,
  persistentSettingsLockfileWriteExecuted: true,
  writtenFileCount: 2,
  backedUpFileCount: 1,
  transactionCommitConnectionAcknowledged: true,
  diagnostics: [],
  effects: postCommitHostEffects()
})

const createResultNormalizationPreflight = (): ThirdPartyDataPackUiIpcResultNormalizationPreflightResult => ({
  status: 'deferred',
  atomicTransactionCommitExecutorPreflightStatus: 'deferred',
  postCommitVerificationExecutorPreflightStatus: 'deferred',
  reason: 'UI/IPC result normalization preflight is inspect-only until explicit response delivery',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
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
  effects: normalizationEffects()
} as ThirdPartyDataPackUiIpcResultNormalizationPreflightResult)

const createOutcomeHandoff = (): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult => ({
  status: 'ready',
  resultNormalizationPreflightStatus: 'deferred',
  atomicCommitOutcomeContractStatus: 'ready',
  postCommitVerificationExecutorAdapterStatus: 'executed',
  reason: 'post-commit verification UI/IPC outcome handoff produced a path-free outcome source',
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
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
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
  effects: handoffEffects(true)
} as ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult)

const createPipelineOptions = () => ({
  enabled: true,
  readTransactionCommitConnectionSource: vi.fn(async() => createTransactionConnectionResult()),
  acknowledgePostCommitPersistentReadWrite: vi.fn(async envelope => {
    expect(Object.isFrozen(envelope)).toBe(true)
    expect(envelope).toMatchObject({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      lockfileHash,
      persistentPackageWriteExecuted: true,
      persistentSettingsLockfileWriteExecuted: true,
      writtenFileCount: 2,
      backedUpFileCount: 1,
      transactionCommitConnectionAcknowledged: true
    })
    expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
    expect('programDirectoryPath' in envelope).toBe(false)
    expect('candidateRegistrySet' in envelope).toBe(false)
    return createPostCommitHostResult()
  }),
  platform: 'web' as const,
  readResultNormalizationPreflight: vi.fn(async() => createResultNormalizationPreflight()),
  readPostCommitVerificationUiIpcOutcomeHandoff: vi.fn(async() => createOutcomeHandoff()),
  expectedPackageId: packageId,
  expectedEnvelopeKind: 'success' as const,
  expectedMessageKey: 'mods.ui.ipc.result.install.success'
})

const createPipelineOptionsWithComposedTransactionConnection = () => ({
  enabled: true,
  readInstallPersistentStagingSettingsLockfileLifecyclePipeline: vi.fn(async() => createLifecycleResult()),
  acknowledgeInstallTransactionCommit: vi.fn(async envelope => {
    expect(Object.isFrozen(envelope)).toBe(true)
    expect(envelope).toMatchObject({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      lockfileHash,
      persistentPackageWriteExecuted: true,
      persistentSettingsLockfileWriteExecuted: true,
      writtenFileCount: 2,
      backedUpFileCount: 1
    })
    expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
    expect('programDirectoryPath' in envelope).toBe(false)
    expect('candidateRegistrySet' in envelope).toBe(false)
    return createTransactionHostResult()
  }),
  acknowledgePostCommitPersistentReadWrite: vi.fn(async envelope => {
    expect(Object.isFrozen(envelope)).toBe(true)
    expect(envelope).toMatchObject({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      lockfileHash,
      persistentPackageWriteExecuted: true,
      persistentSettingsLockfileWriteExecuted: true,
      writtenFileCount: 2,
      backedUpFileCount: 1,
      transactionCommitConnectionAcknowledged: true
    })
    expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
    expect('programDirectoryPath' in envelope).toBe(false)
    expect('candidateRegistrySet' in envelope).toBe(false)
    return createPostCommitHostResult()
  }),
  platform: 'web' as const,
  readResultNormalizationPreflight: vi.fn(async() => createResultNormalizationPreflight()),
  readPostCommitVerificationUiIpcOutcomeHandoff: vi.fn(async() => createOutcomeHandoff()),
  expectedPackageId: packageId,
  expectedEnvelopeKind: 'success' as const,
  expectedMessageKey: 'mods.ui.ipc.result.install.success'
})

const createElectronRendererHost = () => {
  const delivered: ThirdPartyDataPackUiIpcResultEnvelope[] = []
  const runtimeHost = new EventTarget() as EventTarget & {
    electronAPI?: {
      deliverThirdPartyDataPackResponse: (envelope: ThirdPartyDataPackUiIpcResultEnvelope) => unknown
    }
  }
  Object.defineProperty(runtimeHost, 'electronAPI', {
    value: {
      deliverThirdPartyDataPackResponse: vi.fn(async(envelope: ThirdPartyDataPackUiIpcResultEnvelope) => {
        delivered.push(envelope)
        return acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope(envelope)
      })
    }
  })
  return { runtimeHost, delivered }
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const captureBlockedResult = async(
  source: () => Promise<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult>
): Promise<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult> => {
  try {
    await source()
  } catch (error) {
    expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError)
    return (error as ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError).result
  }
  throw new Error('expected post-commit UI/IPC delivery continuation pipeline to block')
}

const expectNoRuntimeDrift = (
  result: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
): void => {
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.transactionLogPrepared).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.transactionLogRead).toBe(false)
  expect(result.effects.packageStateRead).toBe(false)
  expect(result.effects.settingsRead).toBe(false)
  expect(result.effects.lockfileRead).toBe(false)
  expect(result.effects.liveRegistryRead).toBe(false)
  expect(result.effects.saveRead).toBe(false)
  expect(result.effects.saveCacheIsolationChecked).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect('electronHost' in result).toBe(false)
  expect('webHost' in result).toBe(false)
  expect('androidHost' in result).toBe(false)
  expect('programDirectoryPath' in result).toBe(false)
  expect('candidateRegistrySet' in result).toBe(false)
}

const expectOrdinaryInstallNoRuntimeDrift = (
  result: ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult
): void => {
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.transactionLogPrepared).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.transactionLogRead).toBe(false)
  expect(result.effects.packageStateRead).toBe(false)
  expect(result.effects.settingsRead).toBe(false)
  expect(result.effects.lockfileRead).toBe(false)
  expect(result.effects.liveRegistryRead).toBe(false)
  expect(result.effects.saveRead).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect(result.publicModLockSchemaFrozen).toBe(false)
  expect(result.publicTransactionApiFrozen).toBe(false)
  expect(result.publicApiReleaseAllowed).toBe(false)
}

describe('third-party post-commit UI/IPC delivery continuation pipeline', () => {
  it('is disabled by default and does not read post-commit or UI/IPC inputs', async() => {
    const readTransactionCommitConnectionSource = vi.fn()
    const acknowledgePostCommitPersistentReadWrite = vi.fn()
    const readResultNormalizationPreflight = vi.fn()
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn()
    const pipeline = createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline({
      platform: 'web',
      readTransactionCommitConnectionSource,
      acknowledgePostCommitPersistentReadWrite,
      readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readTransactionCommitConnectionSource).not.toHaveBeenCalled()
    expect(acknowledgePostCommitPersistentReadWrite).not.toHaveBeenCalled()
    expect(readResultNormalizationPreflight).not.toHaveBeenCalled()
    expect(readPostCommitVerificationUiIpcOutcomeHandoff).not.toHaveBeenCalled()
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('composes post-commit read/write and Web UI/IPC host delivery into a ready continuation', async() => {
    const options = createPipelineOptions()
    const pipeline = createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline(options)

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.selectedPlatform).toBe('web')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.envelopeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.postCommitPersistentReadWriteConnectionStatus).toBe('accepted')
    expect(result.uiIpcResponseDeliveryAcknowledgementConvergenceStatus).toBe('ready')
    expect(result.persistentPackageWriteExecuted).toBe(true)
    expect(result.persistentSettingsLockfileWriteExecuted).toBe(true)
    expect(result.uiIpcDeliveryAcknowledged).toBe(true)
    expect(result.effects.uiIpcResponseDelivered).toBe(true)
    expect(options.readTransactionCommitConnectionSource).toHaveBeenCalledOnce()
    expect(options.acknowledgePostCommitPersistentReadWrite).toHaveBeenCalledOnce()
    expect(options.readResultNormalizationPreflight).toHaveBeenCalledOnce()
    expect(options.readPostCommitVerificationUiIpcOutcomeHandoff).toHaveBeenCalledOnce()
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expectNoRuntimeDrift(result)
    expectJsonGraphFrozen(result)
  })

  it('composes transaction commit connection from settings-lockfile lifecycle before UI/IPC delivery', async() => {
    const options = createPipelineOptionsWithComposedTransactionConnection()
    const pipeline = createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline(options)

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.postCommitPersistentReadWriteConnectionStatus).toBe('accepted')
    expect(result.uiIpcResponseDeliveryAcknowledgementConvergenceStatus).toBe('ready')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.transactionCommitConnectionAcknowledged).toBe(true)
    expect(result.persistentPackageWriteExecuted).toBe(true)
    expect(result.persistentSettingsLockfileWriteExecuted).toBe(true)
    expect(result.uiIpcDeliveryAcknowledged).toBe(true)
    expect(options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline).toHaveBeenCalledOnce()
    expect(options.acknowledgeInstallTransactionCommit).toHaveBeenCalledOnce()
    expect(options.acknowledgePostCommitPersistentReadWrite).toHaveBeenCalledOnce()
    expect(options.readResultNormalizationPreflight).toHaveBeenCalledOnce()
    expect(options.readPostCommitVerificationUiIpcOutcomeHandoff).toHaveBeenCalledOnce()
    expectNoRuntimeDrift(result)
    expectJsonGraphFrozen(result)
  })

  it('can deliver the post-commit UI/IPC continuation through the renderer Web bridge', async() => {
    const options = createPipelineOptionsWithComposedTransactionConnection()
    const runtimeHost = new EventTarget()
    const events: ThirdPartyDataPackWebDomResponseDeliveryEvent[] = []
    runtimeHost.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, event => {
      events.push(event as ThirdPartyDataPackWebDomResponseDeliveryEvent)
    })
    const pipeline = createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline({
      ...options,
      useRendererUiIpcResponseDeliveryBridge: true,
      runtimeHost
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.selectedPlatform).toBe('web')
    expect(result.uiIpcDeliveryAcknowledged).toBe(true)
    expect(result.effects.uiIpcResponseDelivered).toBe(true)
    expect(events).toHaveLength(1)
    expect(events[0]?.detail.channel).toBe('web-ui-response-event-sink')
    expect(events[0]?.detail.envelope.kind).toBe('success')
    expect(events[0]?.detail.envelope.summary).toEqual(summary)
    expect(options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline).toHaveBeenCalledOnce()
    expect(options.acknowledgeInstallTransactionCommit).toHaveBeenCalledOnce()
    expect(options.acknowledgePostCommitPersistentReadWrite).toHaveBeenCalledOnce()
    expect(options.readResultNormalizationPreflight).toHaveBeenCalledOnce()
    expect(options.readPostCommitVerificationUiIpcOutcomeHandoff).toHaveBeenCalledOnce()
    expect('runtimeHost' in result).toBe(false)
    expect('webTarget' in result).toBe(false)
    expectNoRuntimeDrift(result)
    expectJsonGraphFrozen(result)
  })

  it('can deliver the post-commit UI/IPC continuation through the renderer Electron bridge', async() => {
    const optionsWithWebDefault = createPipelineOptionsWithComposedTransactionConnection()
    const { platform: _unusedPlatform, ...options } = optionsWithWebDefault
    const { runtimeHost, delivered } = createElectronRendererHost()
    const webEvents: Event[] = []
    runtimeHost.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, event => {
      webEvents.push(event)
    })
    const pipeline = createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline({
      ...options,
      useRendererUiIpcResponseDeliveryBridge: true,
      runtimeHost
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.selectedPlatform).toBe('electron')
    expect(result.acknowledgement).toEqual({
      status: 'acknowledged',
      platform: 'electron',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    })
    expect(result.uiIpcDeliveryAcknowledged).toBe(true)
    expect(result.effects.uiIpcResponseDelivered).toBe(true)
    expect(runtimeHost.electronAPI?.deliverThirdPartyDataPackResponse).toHaveBeenCalledOnce()
    expect(delivered).toHaveLength(1)
    expect(delivered[0]?.kind).toBe('success')
    expect(delivered[0]?.summary).toEqual(summary)
    expect(webEvents).toHaveLength(1)
    expect((webEvents[0] as ThirdPartyDataPackWebDomResponseDeliveryEvent | undefined)
      ?.detail.envelope.packageId).toBe(packageId)
    expect(options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline).toHaveBeenCalledOnce()
    expect(options.acknowledgeInstallTransactionCommit).toHaveBeenCalledOnce()
    expect(options.acknowledgePostCommitPersistentReadWrite).toHaveBeenCalledOnce()
    expect(options.readResultNormalizationPreflight).toHaveBeenCalledOnce()
    expect(options.readPostCommitVerificationUiIpcOutcomeHandoff).toHaveBeenCalledOnce()
    expect('runtimeHost' in result).toBe(false)
    expect('electronAPI' in result).toBe(false)
    expect('webTarget' in result).toBe(false)
    expectNoRuntimeDrift(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks an unsupported Android platform selection without delivering an Android response', async() => {
    const options = createPipelineOptions()
    const pipeline = createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationPipeline({
      ...options,
      platform: 'android' as never
    })

    const result = await captureBlockedResult(pipeline)

    expect(result.status).toBe('blocked')
    expect(result.selectedPlatform).toBe('android')
    expect(result.uiIpcDeliveryAcknowledged).toBe(false)
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expect(options.readResultNormalizationPreflight).not.toHaveBeenCalled()
    expect(options.readPostCommitVerificationUiIpcOutcomeHandoff).not.toHaveBeenCalled()
    expectNoRuntimeDrift(result)
    expectJsonGraphFrozen(result)
  })

  it('lets ordinary install terminal connection compose the success terminal path from lower-level inputs', async() => {
    const options = createPipelineOptions()
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline(options)

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.modLockTransactionSemanticsStatus).toBe('candidate-stable')
    expect(result.outcomeKind).toBe('success')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentPackageWriteAcknowledged).toBe(true)
    expect(result.persistentSettingsLockfileWriteAcknowledged).toBe(true)
    expect(result.uiIpcDeliveryAcknowledged).toBe(true)
    expect(result.effects.successOutcomeAccepted).toBe(true)
    expect(result.effects.packageFilesWritten).toBe(true)
    expect(result.effects.settingsWritten).toBe(true)
    expect(result.effects.lockfileWritten).toBe(true)
    expect(options.readTransactionCommitConnectionSource).toHaveBeenCalledOnce()
    expect(options.acknowledgePostCommitPersistentReadWrite).toHaveBeenCalledOnce()
    expect(options.readResultNormalizationPreflight).toHaveBeenCalledOnce()
    expect(options.readPostCommitVerificationUiIpcOutcomeHandoff).toHaveBeenCalledOnce()
    expectOrdinaryInstallNoRuntimeDrift(result)
    expectJsonGraphFrozen(result)
  })

  it('lets ordinary install terminal connection compose the transaction connection from lifecycle inputs', async() => {
    const options = createPipelineOptionsWithComposedTransactionConnection()
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline(options)

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.modLockTransactionSemanticsStatus).toBe('candidate-stable')
    expect(result.outcomeKind).toBe('success')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentPackageWriteAcknowledged).toBe(true)
    expect(result.persistentSettingsLockfileWriteAcknowledged).toBe(true)
    expect(result.uiIpcDeliveryAcknowledged).toBe(true)
    expect(result.effects.successOutcomeAccepted).toBe(true)
    expect(result.effects.packageFilesWritten).toBe(true)
    expect(result.effects.settingsWritten).toBe(true)
    expect(result.effects.lockfileWritten).toBe(true)
    expect(options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline).toHaveBeenCalledOnce()
    expect(options.acknowledgeInstallTransactionCommit).toHaveBeenCalledOnce()
    expect(options.acknowledgePostCommitPersistentReadWrite).toHaveBeenCalledOnce()
    expect(options.readResultNormalizationPreflight).toHaveBeenCalledOnce()
    expect(options.readPostCommitVerificationUiIpcOutcomeHandoff).toHaveBeenCalledOnce()
    expectOrdinaryInstallNoRuntimeDrift(result)
    expectJsonGraphFrozen(result)
  })

  it('lets ordinary install terminal connection preserve renderer Web bridge delivery inputs', async() => {
    const options = createPipelineOptionsWithComposedTransactionConnection()
    const runtimeHost = new EventTarget()
    const events: ThirdPartyDataPackWebDomResponseDeliveryEvent[] = []
    runtimeHost.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, event => {
      events.push(event as ThirdPartyDataPackWebDomResponseDeliveryEvent)
    })
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline({
      ...options,
      useRendererUiIpcResponseDeliveryBridge: true,
      runtimeHost
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.modLockTransactionSemanticsStatus).toBe('candidate-stable')
    expect(result.outcomeKind).toBe('success')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.uiIpcDeliveryAcknowledged).toBe(true)
    expect(result.effects.successOutcomeAccepted).toBe(true)
    expect(result.effects.uiIpcResponseDelivered).toBe(true)
    expect(events).toHaveLength(1)
    expect(events[0]?.detail.channel).toBe('web-ui-response-event-sink')
    expect(events[0]?.detail.envelope.kind).toBe('success')
    expect(events[0]?.detail.envelope.summary).toEqual(summary)
    expect(options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline).toHaveBeenCalledOnce()
    expect(options.acknowledgeInstallTransactionCommit).toHaveBeenCalledOnce()
    expect(options.acknowledgePostCommitPersistentReadWrite).toHaveBeenCalledOnce()
    expect(options.readResultNormalizationPreflight).toHaveBeenCalledOnce()
    expect(options.readPostCommitVerificationUiIpcOutcomeHandoff).toHaveBeenCalledOnce()
    expect('runtimeHost' in result).toBe(false)
    expect('webTarget' in result).toBe(false)
    expectOrdinaryInstallNoRuntimeDrift(result)
    expectJsonGraphFrozen(result)
  })

  it('lets ordinary install terminal connection preserve renderer Electron bridge delivery inputs', async() => {
    const optionsWithWebDefault = createPipelineOptionsWithComposedTransactionConnection()
    const { platform: _unusedPlatform, ...options } = optionsWithWebDefault
    const { runtimeHost, delivered } = createElectronRendererHost()
    const webEvents: Event[] = []
    runtimeHost.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, event => {
      webEvents.push(event)
    })
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline({
      ...options,
      useRendererUiIpcResponseDeliveryBridge: true,
      runtimeHost
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.modLockTransactionSemanticsStatus).toBe('candidate-stable')
    expect(result.outcomeKind).toBe('success')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.uiIpcDeliveryAcknowledged).toBe(true)
    expect(result.effects.successOutcomeAccepted).toBe(true)
    expect(result.effects.uiIpcResponseDelivered).toBe(true)
    expect(runtimeHost.electronAPI?.deliverThirdPartyDataPackResponse).toHaveBeenCalledOnce()
    expect(delivered).toHaveLength(1)
    expect(delivered[0]?.kind).toBe('success')
    expect(delivered[0]?.summary).toEqual(summary)
    expect(webEvents).toHaveLength(1)
    expect((webEvents[0] as ThirdPartyDataPackWebDomResponseDeliveryEvent | undefined)
      ?.detail.envelope.packageId).toBe(packageId)
    expect(options.readInstallPersistentStagingSettingsLockfileLifecyclePipeline).toHaveBeenCalledOnce()
    expect(options.acknowledgeInstallTransactionCommit).toHaveBeenCalledOnce()
    expect(options.acknowledgePostCommitPersistentReadWrite).toHaveBeenCalledOnce()
    expect(options.readResultNormalizationPreflight).toHaveBeenCalledOnce()
    expect(options.readPostCommitVerificationUiIpcOutcomeHandoff).toHaveBeenCalledOnce()
    expectOrdinaryInstallNoRuntimeDrift(result)
    expectJsonGraphFrozen(result)
  })
})
