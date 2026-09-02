import { describe, expect, it, vi } from 'vitest'
import {
  acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope
} from '@/domain/mods/thirdPartyDataPackElectronIpcResponseDeliveryBridge'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline'
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

const createResultNormalizationPreflight = (): ThirdPartyDataPackUiIpcResultNormalizationPreflightResult => ({
  status: 'deferred',
  atomicTransactionCommitExecutorPreflightStatus: 'deferred',
  postCommitVerificationExecutorPreflightStatus: 'deferred',
  reason: 'UI/IPC result normalization preflight is inspect-only until explicit response delivery is implemented',
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

  const serialized = JSON.stringify(result)
  expect(serialized).not.toContain('C:/Users')
  expect('runtimeHost' in result).toBe(false)
  expect('electronAPI' in result).toBe(false)
  expect('electronBridge' in result).toBe(false)
  expect('webTarget' in result).toBe(false)
  expect('window' in result).toBe(false)
  expect('document' in result).toBe(false)
  expect('deliveryEnvelope' in result).toBe(false)
}

const createReaders = () => ({
  readResultNormalizationPreflight: vi.fn(async() => createResultNormalizationPreflight()),
  readPostCommitVerificationUiIpcOutcomeHandoff: vi.fn(async() => createOutcomeHandoff())
})

describe('third-party renderer UI/IPC response delivery bridge connection pipeline', () => {
  it('is disabled by default and does not resolve renderer hosts or upstream handoffs', async() => {
    const resolveRuntimeHost = vi.fn(() => {
      throw new Error('C:/Users/LENOVO/hostile-renderer-host')
    })
    const readers = createReaders()
    const pipeline = createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline({
      platform: 'electron',
      resolveRuntimeHost,
      ...readers
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.selectedPlatform).toBe('electron')
    expect(resolveRuntimeHost).not.toHaveBeenCalled()
    expect(readers.readResultNormalizationPreflight).not.toHaveBeenCalled()
    expect(readers.readPostCommitVerificationUiIpcOutcomeHandoff).not.toHaveBeenCalled()
    expect(result.platformResponseDelivered).toBe(false)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('selects the Electron preload bridge from a safe renderer host', async() => {
    const delivered: ThirdPartyDataPackUiIpcResultEnvelope[] = []
    const runtimeHost = {
      electronAPI: {
        deliverThirdPartyDataPackResponse: vi.fn(async(envelope: ThirdPartyDataPackUiIpcResultEnvelope) => {
          delivered.push(envelope)
          return acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope(envelope)
        })
      }
    }
    const readers = createReaders()
    const pipeline = createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline({
      enabled: true,
      runtimeHost,
      ...readers
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.selectedPlatform).toBe('electron')
    expect(result.platformResponseDeliveryStatus).toBe('delivered')
    expect(runtimeHost.electronAPI.deliverThirdPartyDataPackResponse).toHaveBeenCalledOnce()
    expect(delivered).toHaveLength(1)
    expect(delivered[0]?.kind).toBe('success')
    expect(result.acknowledgement).toEqual({
      status: 'acknowledged',
      channel: 'electron-preload-response-channel',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    })
    expect(result.effects.electronIpcResponseSent).toBe(true)
    expect(result.effects.electronResponseDeliveryAcknowledgementConsumed).toBe(true)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('selects a Web EventTarget when no Electron bridge is present', async() => {
    const runtimeHost = new EventTarget()
    const events: ThirdPartyDataPackWebDomResponseDeliveryEvent[] = []
    runtimeHost.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, event => {
      events.push(event as ThirdPartyDataPackWebDomResponseDeliveryEvent)
    })
    const readers = createReaders()
    const pipeline = createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline({
      enabled: true,
      runtimeHost,
      ...readers
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.selectedPlatform).toBe('web')
    expect(result.platformResponseDeliveryStatus).toBe('delivered')
    expect(events).toHaveLength(1)
    expect(events[0]?.detail.channel).toBe('web-ui-response-event-sink')
    expect(events[0]?.detail.envelope.kind).toBe('success')
    expect(result.acknowledgement).toEqual({
      status: 'acknowledged',
      channel: 'web-ui-response-event-sink',
      packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success'
    })
    expect(result.effects.webUiResponsePublished).toBe(true)
    expect(result.effects.webResponseDeliveryAcknowledgementConsumed).toBe(true)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('selects a Window-like Web event target across renderer realms', async() => {
    const events: ThirdPartyDataPackWebDomResponseDeliveryEvent[] = []
    const listener = (event: Event) => {
      events.push(event as ThirdPartyDataPackWebDomResponseDeliveryEvent)
    }
    window.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, listener)
    const readers = createReaders()
    const pipeline = createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline({
      enabled: true,
      runtimeHost: window,
      ...readers
    })

    try {
      const result = await pipeline()

      expect(result.status).toBe('ready')
      expect(result.selectedPlatform).toBe('web')
      expect(result.platformResponseDeliveryStatus).toBe('delivered')
      expect(events).toHaveLength(1)
      expect(events[0]?.detail.channel).toBe('web-ui-response-event-sink')
      expect(events[0]?.detail.envelope.packageId).toBe(packageId)
      expect(result.effects.webUiResponsePublished).toBe(true)
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    } finally {
      window.removeEventListener(thirdPartyDataPackWebResponseDeliveryEventName, listener)
    }
  })

  it('prefers Electron when the renderer host exposes both Electron and Web surfaces', async() => {
    const runtimeHost = new EventTarget() as EventTarget & {
      electronAPI?: { deliverThirdPartyDataPackResponse: (envelope: ThirdPartyDataPackUiIpcResultEnvelope) => unknown }
    }
    Object.defineProperty(runtimeHost, 'electronAPI', {
      value: {
        deliverThirdPartyDataPackResponse: vi.fn((envelope: ThirdPartyDataPackUiIpcResultEnvelope) =>
          acknowledgeThirdPartyDataPackElectronResponseDeliveryIpcEnvelope(envelope)
        )
      }
    })
    const webEvents: Event[] = []
    runtimeHost.addEventListener(thirdPartyDataPackWebResponseDeliveryEventName, event => {
      webEvents.push(event)
    })
    const readers = createReaders()
    const pipeline = createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline({
      enabled: true,
      runtimeHost,
      ...readers
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.selectedPlatform).toBe('electron')
    expect(runtimeHost.electronAPI?.deliverThirdPartyDataPackResponse).toHaveBeenCalledOnce()
    expect(webEvents).toHaveLength(1)
    expect((webEvents[0] as ThirdPartyDataPackWebDomResponseDeliveryEvent | undefined)
      ?.detail.envelope.packageId).toBe(packageId)
    expect(result.effects.electronIpcResponseSent).toBe(true)
    expect(result.effects.webUiResponsePublished).toBe(false)
    expectNoPersistentWrites(result)
  })

  it('blocks explicit Electron selection with an accessor-backed host before upstream reads', async() => {
    let getterRead = false
    const runtimeHost = {}
    Object.defineProperty(runtimeHost, 'electronAPI', {
      get() {
        getterRead = true
        throw new Error('C:/Users/LENOVO/hostile-electron-api')
      }
    })
    const readers = createReaders()
    const pipeline = createThirdPartyDataPackRendererUiIpcResponseDeliveryBridgeConnectionPipeline({
      enabled: true,
      platform: 'electron',
      runtimeHost,
      ...readers
    })

    await expect(pipeline()).rejects.toBeInstanceOf(
      ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError
    )

    try {
      await pipeline()
    } catch (error) {
      const result = (error as ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.selectedPlatform).toBe('electron')
      expect(result.sourceCalled).toBe(false)
      expect(getterRead).toBe(false)
      expect(readers.readResultNormalizationPreflight).not.toHaveBeenCalled()
      expect(readers.readPostCommitVerificationUiIpcOutcomeHandoff).not.toHaveBeenCalled()
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.ui-ipc-response-delivery-acknowledgement-convergence-source.missing-source'
        })
      ])
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    }
  })
})
