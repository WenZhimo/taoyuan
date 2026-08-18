import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipeline,
  type ThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPlatform
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipeline'
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
  resultStages: [],
  resultRequirements: [],
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

const channelForPlatform = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPlatform
) => ({
  electron: 'electron-preload-response-channel',
  web: 'web-ui-response-event-sink'
})[platform]

const platformEffectFor = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPlatform
) => ({
  electron: 'electronIpcResponseSent',
  web: 'webUiResponsePublished'
})[platform] as 'electronIpcResponseSent' | 'webUiResponsePublished'

const acknowledgementEffectFor = (
  platform: ThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPlatform
) => ({
  electron: 'electronResponseDeliveryAcknowledgementConsumed',
  web: 'webResponseDeliveryAcknowledgementConsumed'
})[platform] as
  | 'electronResponseDeliveryAcknowledgementConsumed'
  | 'webResponseDeliveryAcknowledgementConsumed'

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoPersistentWrites = (
  result: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
): void => {
  expect(result.startupGateHandoffAllowed).toBe(false)
  expect(result.gameAppCreationAllowed).toBe(false)
  expect(result.piniaCreationAllowed).toBe(false)
  expect(result.routerMountAllowed).toBe(false)
  expect(result.saveReadAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)

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

describe('third-party UI/IPC response delivery host connection pipeline', () => {
  it('is disabled by default and does not read upstream handoffs', async() => {
    const readResultNormalizationPreflight = vi.fn()
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn()
    const pipeline = createThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipeline({
      platform: 'web',
      readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.selectedPlatform).toBe('web')
    expect(result.sourceCalled).toBe(false)
    expect(readResultNormalizationPreflight).not.toHaveBeenCalled()
    expect(readPostCommitVerificationUiIpcOutcomeHandoff).not.toHaveBeenCalled()
    expect(result.platformResponseDelivered).toBe(false)
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it.each<ThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPlatform>([
    'electron',
    'web'
  ])('delivers through the in-memory %s host and converges acknowledgement', async(platform) => {
    const readResultNormalizationPreflight = vi.fn(async() => createResultNormalizationPreflight())
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn(async() => createOutcomeHandoff())
    const pipeline = createThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipeline({
      enabled: true,
      platform,
      readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff,
      expectedPackageId: packageId,
      expectedEnvelopeKind: 'success',
      expectedMessageKey: 'mods.ui.ipc.result.install.success'
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.selectedPlatform).toBe(platform)
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
    expect(result.acknowledgement).toEqual({
      status: 'acknowledged',
      channel: channelForPlatform(platform),
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    })
    expect(result.effects[platformEffectFor(platform)]).toBe(true)
    expect(result.effects[acknowledgementEffectFor(platform)]).toBe(true)
    expect(result.effects.uiIpcResponseDelivered).toBe(true)
    expect('deliveryEnvelope' in result).toBe(false)
    expect('electronHost' in result).toBe(false)
    expect('webHost' in result).toBe(false)
    expect('androidHost' in result).toBe(false)
    expect('window' in result).toBe(false)
    expect('document' in result).toBe(false)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks legacy Android host connection selection before upstream reads', async() => {
    const readResultNormalizationPreflight = vi.fn(async() => createResultNormalizationPreflight())
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn(async() => createOutcomeHandoff())
    const pipeline = createThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipeline({
      enabled: true,
      platform: 'android' as unknown as ThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPlatform,
      readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff
    })

    await expect(pipeline()).rejects.toBeInstanceOf(
      ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError
    )

    try {
      await pipeline()
    } catch (error) {
      const result = (error as ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.selectedPlatform).toBe('android')
      expect(result.sourceCalled).toBe(false)
      expect(result.platformResponseDelivered).toBe(false)
      expect(result.deliveryAcknowledgementConsumed).toBe(false)
      expect(readResultNormalizationPreflight).not.toHaveBeenCalled()
      expect(readPostCommitVerificationUiIpcOutcomeHandoff).not.toHaveBeenCalled()
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.missing-source'
        })
      ])
      expect(result.effects.androidUiResponsePublished).toBe(false)
      expect(result.effects.androidResponseDeliveryAcknowledgementConsumed).toBe(false)
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks through the platform pipeline when host expectations reject the envelope', async() => {
    const readResultNormalizationPreflight = vi.fn(async() => createResultNormalizationPreflight())
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn(async() => createOutcomeHandoff())
    const pipeline = createThirdPartyDataPackUiIpcResponseDeliveryHostConnectionPipeline({
      enabled: true,
      platform: 'electron',
      readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff,
      expectedPackageId: alternatePackageId
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
      expect(result.platformResponseDelivered).toBe(false)
      expect(result.deliveryAcknowledgementConsumed).toBe(false)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain(alternatePackageId)
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    }
  })
})
