import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource,
  THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ORCHESTRATION_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ORCHESTRATION_SOURCE_MODE,
  ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationBlockedError,
  type ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationEffectSummary,
  ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff'
import type { ThirdPartyDataPackUiIpcResultEnvelopeSummary } from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
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

const createEffects = (
  prepared: boolean,
  overrides: Partial<ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationEffectSummary> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationEffectSummary => ({
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
  uiIpcOutcomeConsumed: prepared,
  resultEnvelopeNormalized: prepared,
  responseDeliveryPreflightPrepared: prepared,
  platformSplitPrepared: prepared,
  ...overrides
})

const createOrchestrationHandoff = (
  overrides: Partial<ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult => ({
  status: 'deferred',
  resultNormalizationPreflightStatus: 'deferred',
  postCommitVerificationUiIpcOutcomeHandoffStatus: 'ready',
  resultEnvelopeContractStatus: 'ready',
  responseDeliveryPreflightStatus: 'deferred',
  platformSplitContractStatus: 'deferred',
  reason: 'UI/IPC result envelope and platform response delivery orchestration is prepared; real platform sinks and startup handoff remain separate',
  uiIpcResponseDeliveryOrchestrationHandoff: 'deferred',
  readOnly: true,
  orchestrationPrepared: true,
  envelopeNormalized: true,
  deliveryEnvelopePrepared: true,
  platformSplitPrepared: true,
  uiIpcResponseDeliveryAllowed: false,
  electronIpcAllowed: false,
  electronResponseDeliveryAllowed: false,
  webUiBridgeAllowed: false,
  webResponseDeliveryAllowed: false,
  androidUiBridgeAllowed: false,
  androidResponseDeliveryAllowed: false,
  startupGateHandoffAllowed: false,
  deliveryAcknowledgementAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: 'install',
  targetPackageId: packageId,
  envelopeKind: 'success',
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
  deliveryEnvelope: {
    formatVersion: 1,
    kind: 'success',
    commandId: 'install',
    packageId,
    candidateHash: candidateIdentity.candidateHash,
    lockfileHash,
    messageKey: 'mods.ui.ipc.result.install.success',
    recovery: 'none',
    retryable: false,
    rollbackRequired: false,
    summary,
    diagnostics: []
  },
  checks: [],
  diagnostics: [],
  orchestrationStages: [
    {
      id: 'startup-gate-handoff',
      status: 'deferred',
      requirementIds: ['startup-gate-result-handoff'],
      reason: 'Startup gate result handoff remains deferred.'
    }
  ],
  orchestrationRequirements: [],
  platformAdapters: [
    {
      platform: 'electron',
      status: 'deferred',
      stageId: 'electron-response-delivery-adapter',
      transport: 'electron-preload-response-channel',
      requirementIds: ['electron-preload-response-channel', 'delivery-acknowledgement-source'],
      targetPackageId: packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success',
      reason: 'Electron response delivery remains deferred.'
    },
    {
      platform: 'web',
      status: 'deferred',
      stageId: 'web-response-delivery-adapter',
      transport: 'web-ui-response-event-sink',
      requirementIds: ['web-ui-response-event-sink', 'delivery-acknowledgement-source'],
      targetPackageId: packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success',
      reason: 'Web response delivery remains deferred.'
    },
    {
      platform: 'android',
      status: 'deferred',
      stageId: 'android-response-delivery-adapter',
      transport: 'android-native-response-event-sink',
      requirementIds: ['android-native-response-event-sink', 'delivery-acknowledgement-source'],
      targetPackageId: packageId,
      envelopeKind: 'success',
      messageKey: 'mods.ui.ipc.result.install.success',
      reason: 'Android response delivery remains deferred.'
    }
  ],
  summary,
  effects: createEffects(true),
  ...overrides
} as unknown as ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult)

const createSkippedOrchestrationHandoff = (
  overrides: Partial<ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult => createOrchestrationHandoff({
  status: 'skipped',
  resultEnvelopeContractStatus: undefined,
  responseDeliveryPreflightStatus: undefined,
  platformSplitContractStatus: undefined,
  reason: 'no selected third-party data packs',
  uiIpcResponseDeliveryOrchestrationHandoff: 'skipped',
  orchestrationPrepared: false,
  envelopeNormalized: false,
  deliveryEnvelopePrepared: false,
  platformSplitPrepared: false,
  requestedCommandId: undefined,
  targetPackageId: undefined,
  envelopeKind: undefined,
  messageKey: undefined,
  selectedPackageIds: [],
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  candidateIdentity: undefined,
  lockfileHash: undefined,
  deliveryEnvelope: undefined,
  platformAdapters: [],
  effects: createEffects(false),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealDeliveryEffects = (
  result: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSourceResult,
  continuationAllowed: boolean,
  handoffAccepted: boolean
): void => {
  expect(result.responseDeliveryContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.responseDeliveryContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.orchestrationHandoffAccepted).toBe(handoffAccepted)

  const {
    uiIpcResponseDeliveryOrchestrationSourceCalled: _sourceCalled,
    uiIpcResponseDeliveryOrchestrationHandoffSourceCalled: _handoffSourceCalled,
    orchestrationHandoffAccepted: _handoffAccepted,
    responseDeliveryContinuationAllowed: _continuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party UI/IPC response delivery orchestration source', () => {
  it('is disabled by default and does not call the orchestration handoff source', async() => {
    const readUiIpcResponseDeliveryOrchestrationHandoff = vi.fn()
    const source = createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource({
      readUiIpcResponseDeliveryOrchestrationHandoff
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ORCHESTRATION_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_UI_IPC_RESPONSE_DELIVERY_ORCHESTRATION_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readUiIpcResponseDeliveryOrchestrationHandoff).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRealDeliveryEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when an enabled handoff source reports skipped', async() => {
    const readUiIpcResponseDeliveryOrchestrationHandoff = vi.fn(async() => createSkippedOrchestrationHandoff({
      selectedPackageIds: [packageId],
      targetPackageId: packageId,
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      candidateIdentity,
      lockfileHash,
      summary
    }))
    const source = createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource({
      enabled: true,
      readUiIpcResponseDeliveryOrchestrationHandoff
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readUiIpcResponseDeliveryOrchestrationHandoff).toHaveBeenCalledOnce()
    expect(result.orchestrationHandoffStatus).toBe('skipped')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expectNoRealDeliveryEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts a deferred path-free orchestration handoff without exposing delivery internals', async() => {
    const source = createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource({
      enabled: true,
      readUiIpcResponseDeliveryOrchestrationHandoff: async() => createOrchestrationHandoff()
    })

    const result = await source()

    expect(result.status).toBe('deferred')
    expect(result.responseDeliveryContinuationAllowed).toBe(true)
    expect(result.orchestrationHandoffStatus).toBe('deferred')
    expect(result.resultEnvelopeContractStatus).toBe('ready')
    expect(result.responseDeliveryPreflightStatus).toBe('deferred')
    expect(result.platformSplitContractStatus).toBe('deferred')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.envelopeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.platformAdapters.map(adapter => [adapter.platform, adapter.status])).toEqual([
      ['electron', 'deferred'],
      ['web', 'deferred'],
      ['android', 'deferred']
    ])
    expect(result.summary).toMatchObject({
      selectedPackageCount: 1,
      registryCount: 55,
      entryCount: 4243,
      diagnosticCount: 0
    })
    expect('deliveryEnvelope' in result).toBe(false)
    expect('resultNormalizationPreflight' in result).toBe(false)
    expect('postCommitVerificationUiIpcOutcomeHandoff' in result).toBe(false)
    expect('electronHost' in result).toBe(false)
    expect('webHost' in result).toBe(false)
    expect('androidHost' in result).toBe(false)
    expectNoRealDeliveryEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks missing, throwing and blocked handoff sources without leaking host details', async() => {
    const missingSource = createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource({
      enabled: true,
      readUiIpcResponseDeliveryOrchestrationHandoff: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/ui-ipc-orchestration-source')
      }
    })
    const blockedSource = createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource({
      enabled: true,
      readUiIpcResponseDeliveryOrchestrationHandoff: async() => createOrchestrationHandoff({
        status: 'blocked',
        uiIpcResponseDeliveryOrchestrationHandoff: 'blocked',
        blockedPackageIds: [blockedPackageId],
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.ui-ipc-response-delivery-orchestration-source.blocked-source',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/ui-ipc.json',
            recovery: 'retry'
          }
        ] as never,
        effects: createEffects(false)
      })
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationBlockedError
    )
    await expect(blockedSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationBlockedError)
      const result = (error as ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.ui-ipc-response-delivery-orchestration-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRealDeliveryEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe real-platform delivery drift while copying hostile arrays safely', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/ui-ipc-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackUiIpcResponseDeliveryOrchestrationSource({
      enabled: true,
      readUiIpcResponseDeliveryOrchestrationHandoff: async() => createOrchestrationHandoff({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        platformAdapters: createHostileArray(createOrchestrationHandoff().platformAdapters as never, 'platform-adapters'),
        electronHost: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...createEffects(true),
          uiIpcResponseDelivered: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationBlockedError)
      const result = (error as ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.platformAdapters.map(adapter => adapter.platform)).toEqual(['electron', 'web', 'android'])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.ui-ipc-response-delivery-orchestration-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('ui-ipc-source-selected-package-ids')
      expect('electronHost' in result).toBe(false)
      expectNoRealDeliveryEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })
})
