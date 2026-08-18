import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  type ThirdPartyDataPackElectronResponseDeliveryAcknowledgement,
  type ThirdPartyDataPackElectronResponseDeliverySinkHost
} from '@/domain/mods/thirdPartyDataPackElectronResponseDeliverySinkAdapter'
import {
  createThirdPartyDataPackElectronUiIpcResponseDeliveryPipeline
} from '@/domain/mods/thirdPartyDataPackElectronUiIpcResponseDeliveryPipeline'
import {
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError,
  type ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'
import type {
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffEffectSummary,
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackUiIpcResultNormalizationEffectSummary,
  ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResultNormalizationPreflight'

const packageId = 'sample_pack' as PackageId
const alternatePackageId = 'alternate_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
} as const

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

const createResultNormalizationPreflight = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultNormalizationPreflightResult> = {}
): ThirdPartyDataPackUiIpcResultNormalizationPreflightResult => ({
  status: 'deferred',
  atomicTransactionCommitExecutorPreflightStatus: 'deferred',
  postCommitVerificationExecutorPreflightStatus: 'deferred',
  reason: 'UI/IPC result normalization preflight is inspect-only until atomic commit, post-commit verification, rollback recovery and explicit response delivery are implemented',
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
  resultStages: [
    {
      id: 'ui-ipc-result-normalization-preflight-inspection',
      status: 'satisfied',
      requirementIds: ['path-free-ui-ipc-result-normalizer'],
      reason: 'Result normalization preflight is inspect-only.'
    }
  ],
  resultRequirements: [
    {
      id: 'path-free-ui-ipc-result-normalizer',
      status: 'required',
      reason: 'Future UI/IPC results must expose only redacted outcome summaries.'
    }
  ],
  resultOutcomeStates: [],
  effects: normalizationEffects(),
  ...overrides
} as ThirdPartyDataPackUiIpcResultNormalizationPreflightResult)

const createOutcomeHandoff = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult> = {}
): ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult => ({
  status: 'ready',
  resultNormalizationPreflightStatus: 'deferred',
  atomicCommitOutcomeContractStatus: 'ready',
  postCommitVerificationExecutorAdapterStatus: 'executed',
  reason: 'post-commit verification UI/IPC outcome handoff produced a path-free outcome source; response delivery remains separate',
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
  effects: handoffEffects(true),
  ...overrides
} as ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult)

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimeStartupOrWriteEffects = (
  result: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult,
  continuationAllowed: boolean,
  delivered: boolean
): void => {
  expect(result.startupGateContinuationAllowed).toBe(continuationAllowed)
  expect(result.startupGateHandoffAllowed).toBe(false)
  expect(result.gameAppCreationAllowed).toBe(false)
  expect(result.piniaCreationAllowed).toBe(false)
  expect(result.routerMountAllowed).toBe(false)
  expect(result.saveReadAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.effects.electronIpcResponseSent).toBe(delivered)
  expect(result.effects.uiIpcResponseDelivered).toBe(delivered)
  expect(result.effects.electronResponseDeliveryAcknowledgementConsumed).toBe(delivered)

  const {
    uiIpcResponseDeliveryAcknowledgementConvergenceSourceCalled: _sourceCalled,
    selectedPlatformHandoffSourceCalled: _readerCalled,
    selectedPlatformHandoffAccepted: _accepted,
    deliveryAcknowledgementConverged: _converged,
    startupGateContinuationAllowed: _continuationAllowed,
    electronIpcResponseSent: _electronIpcResponseSent,
    webUiResponsePublished: _webUiResponsePublished,
    androidUiResponsePublished: _androidUiResponsePublished,
    successEnvelopeDelivered: _successEnvelopeDelivered,
    failureEnvelopeDelivered: _failureEnvelopeDelivered,
    retryStateDelivered: _retryStateDelivered,
    rollbackStateDelivered: _rollbackStateDelivered,
    uiIpcResponseDelivered: _uiIpcResponseDelivered,
    electronResponseDeliveryAcknowledgementConsumed: _electronAcknowledgement,
    webResponseDeliveryAcknowledgementConsumed: _webAcknowledgement,
    androidResponseDeliveryAcknowledgementConsumed: _androidAcknowledgement,
    startupGateHandoffPreflightConsumed: _startupGateHandoffPreflightConsumed,
    responseDeliveryStartupGateHandoffPrepared: _responseDeliveryStartupGateHandoffPrepared,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

const createElectronHost = (): ThirdPartyDataPackElectronResponseDeliverySinkHost & {
  readonly deliver: ReturnType<typeof vi.fn>
} => ({
  channel: 'electron-preload-response-channel',
  deliver: vi.fn(async envelope => {
    expect(Object.isFrozen(envelope)).toBe(true)
    expect(envelope.commandId).toBe('install')
    expect(envelope.packageId).toBe(packageId)
    expect(envelope.kind).toBe('success')
    expect(envelope.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect('electronHost' in envelope).toBe(false)
    expect('electronIpcHost' in envelope).toBe(false)
    expect('ipcRenderer' in envelope).toBe(false)
    return {
      status: 'acknowledged',
      channel: 'electron-preload-response-channel',
      packageId: envelope.packageId,
      envelopeKind: envelope.kind,
      messageKey: envelope.messageKey
    } satisfies ThirdPartyDataPackElectronResponseDeliveryAcknowledgement
  })
})

describe('third-party Electron UI/IPC response delivery pipeline', () => {
  it('is disabled by default and does not read upstream handoffs or call the Electron host', async() => {
    const readResultNormalizationPreflight = vi.fn()
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn()
    const host = createElectronHost()
    const pipeline = createThirdPartyDataPackElectronUiIpcResponseDeliveryPipeline({
      readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff,
      host
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.selectedPlatform).toBe('electron')
    expect(result.sourceCalled).toBe(false)
    expect(readResultNormalizationPreflight).not.toHaveBeenCalled()
    expect(readPostCommitVerificationUiIpcOutcomeHandoff).not.toHaveBeenCalled()
    expect(host.deliver).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeStartupOrWriteEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('delivers an Electron response and converges the acknowledgement without touching other platforms', async() => {
    const readResultNormalizationPreflight = vi.fn(async() => createResultNormalizationPreflight())
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn(async() => createOutcomeHandoff())
    const host = createElectronHost()
    const pipeline = createThirdPartyDataPackElectronUiIpcResponseDeliveryPipeline({
      enabled: true,
      readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff,
      host
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.selectedPlatform).toBe('electron')
    expect(result.platformSourceStatus).toBe('ready')
    expect(result.platformResponseDeliveryStatus).toBe('delivered')
    expect(result.startupGateHandoffPreflightStatus).toBe('deferred')
    expect(result.platformResponseDelivered).toBe(true)
    expect(result.deliveryAcknowledgementConsumed).toBe(true)
    expect(result.startupGateHandoffPreflightConsumed).toBe(true)
    expect(result.responseDeliveryStartupGateHandoffPrepared).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.envelopeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.acknowledgement).toEqual({
      status: 'acknowledged',
      channel: 'electron-preload-response-channel',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    })
    expect(readResultNormalizationPreflight).toHaveBeenCalledOnce()
    expect(readPostCommitVerificationUiIpcOutcomeHandoff).toHaveBeenCalledOnce()
    expect(host.deliver).toHaveBeenCalledOnce()
    expect(result.effects.electronIpcResponseSent).toBe(true)
    expect(result.effects.webUiResponsePublished).toBe(false)
    expect(result.effects.androidUiResponsePublished).toBe(false)
    expect('electronHost' in result).toBe(false)
    expect('electronIpcHost' in result).toBe(false)
    expect('deliveryEnvelope' in result).toBe(false)
    expect('startupGateHandoffPreflight' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expectNoRuntimeStartupOrWriteEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks before the Electron host when orchestration inputs drift', async() => {
    const readResultNormalizationPreflight = vi.fn(async() => createResultNormalizationPreflight({
      targetPackageId: alternatePackageId,
      selectedPackageIds: [alternatePackageId],
      loadOrder: [alternatePackageId]
    }))
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn(async() => createOutcomeHandoff())
    const host = createElectronHost()
    const pipeline = createThirdPartyDataPackElectronUiIpcResponseDeliveryPipeline({
      enabled: true,
      readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff,
      host
    })

    await expect(pipeline()).rejects.toBeInstanceOf(
      ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError
    )

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(
        ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError
      )
      const result = (error as ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.platformResponseDelivered).toBe(false)
      expect(result.deliveryAcknowledgementConsumed).toBe(false)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.source-failed'
        })
      ])
      expectNoRuntimeStartupOrWriteEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
    expect(host.deliver).not.toHaveBeenCalled()
  })
})
