import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope,
  thirdPartyDataPackElectronResponseDeliveryIpcChannel,
  type ThirdPartyDataPackElectronIpcResponseDeliveryBridge
} from '@/domain/mods/thirdPartyDataPackElectronIpcResponseDeliveryBridge'
import {
  createThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline,
  type ThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgePlatform
} from '@/domain/mods/thirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline'
import {
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError,
  type ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'
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
  platform: ThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgePlatform
) => ({
  electron: 'electron-preload-response-channel',
  web: 'web-ui-response-event-sink'
})[platform]

const platformEffectFor = (
  platform: ThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgePlatform
) => ({
  electron: 'electronIpcResponseSent',
  web: 'webUiResponsePublished'
})[platform] as 'electronIpcResponseSent' | 'webUiResponsePublished'

const acknowledgementEffectFor = (
  platform: ThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgePlatform
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

type RealBridgeOptions = {
  readonly electronBridge?: ThirdPartyDataPackElectronIpcResponseDeliveryBridge
  readonly webTarget?: EventTarget
  readonly expectBridgeCalled: () => void
}

type RealBridgeScenario = {
  readonly platform: ThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgePlatform
  readonly options: () => RealBridgeOptions
}

const realBridgeScenarios: readonly RealBridgeScenario[] = [
  {
    platform: 'electron',
    options: () => {
      const invocations: {
        readonly channel: string
        readonly envelope: ThirdPartyDataPackUiIpcResultEnvelope
      }[] = []
      return {
        electronBridge: {
          invoke: (channel, envelope) => {
            invocations.push({ channel, envelope })
            return acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope(envelope)
          }
        },
        expectBridgeCalled: () => {
          expect(invocations).toHaveLength(1)
          expect(invocations[0]?.channel).toBe(thirdPartyDataPackElectronResponseDeliveryIpcChannel)
        }
      }
    }
  },
  {
    platform: 'web',
    options: () => {
      const target = new EventTarget()
      const events: ThirdPartyDataPackWebDomResponseDeliveryEvent[] = []
      target.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, event => {
        events.push(event as ThirdPartyDataPackWebDomResponseDeliveryEvent)
      })
      return {
        webTarget: target,
        expectBridgeCalled: () => {
          expect(events).toHaveLength(1)
          expect(events[0]?.detail.channel).toBe('web-ui-response-event-sink')
        }
      }
    }
  }
]

describe('third-party real platform UI/IPC response delivery bridge connection pipeline', () => {
  it('is disabled by default and does not read upstream handoffs or require a platform bridge', async() => {
    const readResultNormalizationPreflight = vi.fn()
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn()
    const pipeline = createThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline({
      platform: 'electron',
      readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.selectedPlatform).toBe('electron')
    expect(result.sourceCalled).toBe(false)
    expect(readResultNormalizationPreflight).not.toHaveBeenCalled()
    expect(readPostCommitVerificationUiIpcOutcomeHandoff).not.toHaveBeenCalled()
    expect(result.platformResponseDelivered).toBe(false)
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it.each(realBridgeScenarios)('delivers through the real %s platform bridge and converges acknowledgement', async({
    platform,
    options
  }) => {
    const {
      expectBridgeCalled,
      ...bridgeOptions
    } = options()
    const readResultNormalizationPreflight = vi.fn(async() => createResultNormalizationPreflight())
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn(async() => createOutcomeHandoff())
    const pipeline = createThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline({
      enabled: true,
      platform,
      readResultNormalizationPreflight,
      readPostCommitVerificationUiIpcOutcomeHandoff,
      ...bridgeOptions
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
    expectBridgeCalled()
    expect('deliveryEnvelope' in result).toBe(false)
    expect('electronBridge' in result).toBe(false)
    expect('webTarget' in result).toBe(false)
    expect('androidPlugin' in result).toBe(false)
    expect('window' in result).toBe(false)
    expect('document' in result).toBe(false)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it.each<ThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgePlatform>([
    'electron',
    'web'
  ])('blocks enabled %s delivery before upstream reads when the required bridge is missing', async(platform) => {
    const readResultNormalizationPreflight = vi.fn(async() => createResultNormalizationPreflight())
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn(async() => createOutcomeHandoff())
    const pipeline = createThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline({
      enabled: true,
      platform,
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
      expect(result.selectedPlatform).toBe(platform)
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
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks Android real bridge selection before upstream reads under vanilla-only Android scope', async() => {
    const readResultNormalizationPreflight = vi.fn(async() => createResultNormalizationPreflight())
    const readPostCommitVerificationUiIpcOutcomeHandoff = vi.fn(async() => createOutcomeHandoff())
    const pipeline = createThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgeConnectionPipeline({
      enabled: true,
      platform: 'android' as unknown as ThirdPartyDataPackRealPlatformUiIpcResponseDeliveryBridgePlatform,
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
})
