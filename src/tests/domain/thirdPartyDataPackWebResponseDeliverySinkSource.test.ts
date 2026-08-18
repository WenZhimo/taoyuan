import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight,
  type ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract,
  type ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'
import {
  createThirdPartyDataPackWebResponseDeliverySinkSource,
  THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_SINK_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_SINK_SOURCE_MODE,
  ThirdPartyDataPackWebResponseDeliverySinkBlockedError,
  type ThirdPartyDataPackWebResponseDeliverySinkSourceResult
} from '@/domain/mods/thirdPartyDataPackWebResponseDeliverySinkSource'

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

const sourceEffects: ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary = {
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
}

const summary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
} as const

const createEnvelopeContract = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelopeContractResult> = {}
): ThirdPartyDataPackUiIpcResultEnvelopeContractResult => ({
  status: 'ready',
  sourcePreflightStatus: 'deferred',
  reason: 'UI/IPC result envelope contract is ready as a path-free domain source; response delivery remains disabled',
  resultEnvelopeContract: 'ready',
  readOnly: true,
  envelopeNormalized: true,
  uiIpcResponseDeliveryAllowed: false,
  electronIpcAllowed: false,
  webUiBridgeAllowed: false,
  androidUiBridgeAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: 'install',
  targetPackageId: packageId,
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
  envelope: {
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
  effects: sourceEffects,
  ...overrides
})

const createResponseDeliveryPreflight = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelopeContractResult> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult =>
  buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight({
    envelopeContract: createEnvelopeContract(overrides)
  })

const createPlatformSplitContract = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultEnvelopeContractResult> = {}
): ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult =>
  buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract({
    responseDeliveryPreflight: createResponseDeliveryPreflight(overrides)
  })

const createAcknowledgement = (envelope: ThirdPartyDataPackUiIpcResultEnvelope) => ({
  status: 'acknowledged' as const,
  channel: 'web-ui-response-event-sink' as const,
  packageId: envelope.packageId,
  envelopeKind: envelope.kind,
  messageKey: envelope.messageKey
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimeOrPersistentEffects = (
  result: ThirdPartyDataPackWebResponseDeliverySinkSourceResult,
  delivered: boolean
): void => {
  expect(result.uiIpcResponseDeliveryAllowed).toBe(delivered)
  expect(result.electronIpcAllowed).toBe(false)
  expect(result.electronResponseDeliveryAllowed).toBe(false)
  expect(result.webUiBridgeAllowed).toBe(delivered)
  expect(result.webResponseDeliveryAllowed).toBe(delivered)
  expect(result.androidUiBridgeAllowed).toBe(false)
  expect(result.androidResponseDeliveryAllowed).toBe(false)
  expect(result.startupGateHandoffAllowed).toBe(false)
  expect(result.deliveryAcknowledgementAllowed).toBe(delivered)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
  if (delivered) expect(result.effects.webSinkHostCalled).toBe(true)
  expect(result.effects.deliveryAcknowledgementReceived).toBe(delivered)
  expect(result.effects.webResponseDelivered).toBe(delivered)
  expect(result.effects.officialRegistryPublished).toBe(false)
  expect(result.effects.thirdPartyRegistryPublished).toBe(false)
  expect(result.effects.liveRegistryMutated).toBe(false)
  expect(result.effects.electronIpcResponseSent).toBe(false)
  expect(result.effects.webFilePickerOpened).toBe(false)
  expect(result.effects.webUiBridgeOpened).toBe(false)
  expect(result.effects.webUiResponsePublished).toBe(delivered)
  expect(result.effects.androidFilePickerOpened).toBe(false)
  expect(result.effects.androidUiBridgeOpened).toBe(false)
  expect(result.effects.androidUiResponsePublished).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.atomicCommitExecutorCalled).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.packageBackupsWritten).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect(result.effects.diagnosticsWritten).toBe(false)
}

describe('third-party Web response delivery sink source', () => {
  it('is disabled by default and does not call platform split or Web sink host sources', async() => {
    const readUiIpcResponseDeliveryPlatformSplitContract = vi.fn()
    const host = {
      channel: 'web-ui-response-event-sink' as const,
      deliver: vi.fn((envelope: ThirdPartyDataPackUiIpcResultEnvelope) => createAcknowledgement(envelope))
    }
    const source = createThirdPartyDataPackWebResponseDeliverySinkSource({
      readUiIpcResponseDeliveryPlatformSplitContract,
      host
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_SINK_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_SINK_SOURCE_MODE)
    expect(result.platform).toBe('web')
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.webSinkAdapterCalled).toBe(false)
    expect(readUiIpcResponseDeliveryPlatformSplitContract).not.toHaveBeenCalled()
    expect(host.deliver).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrPersistentEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('delivers through the injected fixed Web sink host when explicitly enabled', async() => {
    const platformSplit = createPlatformSplitContract()
    let deliveredEnvelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined
    const readUiIpcResponseDeliveryPlatformSplitContract = vi.fn(async() => platformSplit)
    const host = {
      channel: 'web-ui-response-event-sink' as const,
      deliver: vi.fn((envelope: ThirdPartyDataPackUiIpcResultEnvelope) => {
        deliveredEnvelope = envelope
        return createAcknowledgement(envelope)
      })
    }
    const source = createThirdPartyDataPackWebResponseDeliverySinkSource({
      enabled: true,
      readUiIpcResponseDeliveryPlatformSplitContract,
      host
    })

    const result = await source()

    expect(result.status).toBe('delivered')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(result.webSinkAdapterCalled).toBe(true)
    expect(result.webResponseDelivered).toBe(true)
    expect(result.responseDeliveryContinuationAllowed).toBe(true)
    expect(result.platformSplitContractStatus).toBe('deferred')
    expect(result.sourcePlatformSplitStatus).toBe('deferred')
    expect(result.webResponseDeliverySinkAdapterStatus).toBe('delivered')
    expect(readUiIpcResponseDeliveryPlatformSplitContract).toHaveBeenCalledOnce()
    expect(host.deliver).toHaveBeenCalledOnce()
    expect(deliveredEnvelope).toBeDefined()
    expect(result.deliveryEnvelopeSummary).toEqual({
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
      diagnosticCount: 0
    })
    expect(result.acknowledgement).toEqual(createAcknowledgement(deliveredEnvelope!))
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.envelopeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect('deliveryEnvelope' in result).toBe(false)
    expect('platformSplitContract' in result).toBe(false)
    expect('responseDeliveryPreflight' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoRuntimeOrPersistentEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when an enabled platform split source reports skipped', async() => {
    const readUiIpcResponseDeliveryPlatformSplitContract = vi.fn(async() => createPlatformSplitContract({
      status: 'skipped',
      reason: 'no selected third-party data packs',
      resultEnvelopeContract: 'skipped',
      envelopeNormalized: false,
      requestedCommandId: undefined,
      targetPackageId: undefined,
      selectedPackageIds: [],
      loadOrder: [],
      registryCount: 54,
      entryCount: 4242,
      packageCount: 0,
      candidateIdentity: undefined,
      lockfileHash: undefined,
      envelope: undefined
    }))
    const host = {
      channel: 'web-ui-response-event-sink' as const,
      deliver: vi.fn((envelope: ThirdPartyDataPackUiIpcResultEnvelope) => createAcknowledgement(envelope))
    }
    const source = createThirdPartyDataPackWebResponseDeliverySinkSource({
      enabled: true,
      readUiIpcResponseDeliveryPlatformSplitContract,
      host
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.sourceCalled).toBe(true)
    expect(result.webSinkAdapterCalled).toBe(true)
    expect(result.webResponseDelivered).toBe(false)
    expect(result.platformSplitContractStatus).toBe('skipped')
    expect(result.webResponseDeliverySinkAdapterStatus).toBe('skipped')
    expect(host.deliver).not.toHaveBeenCalled()
    expect(result.deliveryEnvelopeSummary).toBeUndefined()
    expect(result.acknowledgement).toBeUndefined()
    expectNoRuntimeOrPersistentEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('blocks missing sources, host failures and invalid acknowledgements without leaking host paths', async() => {
    const missingSource = createThirdPartyDataPackWebResponseDeliverySinkSource({
      enabled: true,
      host: {
        channel: 'web-ui-response-event-sink',
        deliver: envelope => createAcknowledgement(envelope)
      }
    })
    const throwingSource = createThirdPartyDataPackWebResponseDeliverySinkSource({
      enabled: true,
      readUiIpcResponseDeliveryPlatformSplitContract: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/web-source-platform-split')
      },
      host: {
        channel: 'web-ui-response-event-sink',
        deliver: envelope => createAcknowledgement(envelope)
      }
    })
    const hostFailureSource = createThirdPartyDataPackWebResponseDeliverySinkSource({
      enabled: true,
      readUiIpcResponseDeliveryPlatformSplitContract: async() => createPlatformSplitContract(),
      host: {
        channel: 'web-ui-response-event-sink',
        deliver: () => {
          throw new Error('EACCES C:/Users/LENOVO/mods/web-source-host')
        }
      }
    })
    const invalidAcknowledgementSource = createThirdPartyDataPackWebResponseDeliverySinkSource({
      enabled: true,
      readUiIpcResponseDeliveryPlatformSplitContract: async() => createPlatformSplitContract(),
      host: {
        channel: 'web-ui-response-event-sink',
        deliver: envelope => ({
          ...createAcknowledgement(envelope),
          messageKey: 'mods.ui.ipc.result.install.other'
        })
      }
    })

    await expect(missingSource()).rejects.toBeInstanceOf(ThirdPartyDataPackWebResponseDeliverySinkBlockedError)

    for (const currentSource of [throwingSource, hostFailureSource, invalidAcknowledgementSource]) {
      try {
        await currentSource()
      } catch (error) {
        expect(error).toBeInstanceOf(ThirdPartyDataPackWebResponseDeliverySinkBlockedError)
        const result = (error as ThirdPartyDataPackWebResponseDeliverySinkBlockedError).result
        expect(result.status).toBe('blocked')
        expect(result.responseDeliveryContinuationAllowed).toBe(false)
        expect(result.webResponseDelivered).toBe(false)
        expect(result.diagnostics).toEqual(expect.arrayContaining([
          expect.objectContaining({
            code: 'LIFECYCLE-TRANSACTION-001'
          })
        ]))
        expect(JSON.stringify(result)).not.toContain('C:/Users')
        expect(JSON.stringify(result)).not.toContain('LENOVO')
        expect(JSON.stringify(result)).not.toContain('mods.ui.ipc.result.install.other')
        expect((error as Error).message).not.toContain('C:/Users')
        expectNoRuntimeOrPersistentEffects(result, false)
        expectJsonGraphFrozen(result)
      }
    }
  })

  it('blocks unsafe platform split drift while copying hostile arrays safely', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/web-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/web-source-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.web-response-delivery-sink-source.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const platformSplit = createPlatformSplitContract()
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')
    const hostilePlatformSplit = {
      ...platformSplit,
      selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
      blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
      loadOrder: createHostileArray([packageId], 'load-order'),
      diagnostics: diagnostics as never,
      deliveryEnvelope: {
        ...platformSplit.deliveryEnvelope!,
        diagnostics: diagnostics as never,
        summary: {
          ...summary,
          blockedPackageCount: 1,
          diagnosticCount: 1
        }
      },
      effects: {
        ...platformSplit.effects,
        webUiResponsePublished: true
      }
    } as unknown as ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
    const source = createThirdPartyDataPackWebResponseDeliverySinkSource({
      enabled: true,
      readUiIpcResponseDeliveryPlatformSplitContract: async() => hostilePlatformSplit,
      host: {
        channel: 'web-ui-response-event-sink',
        deliver: envelope => createAcknowledgement(envelope)
      }
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackWebResponseDeliverySinkBlockedError)
      const result = (error as ThirdPartyDataPackWebResponseDeliverySinkBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.web-response-delivery-sink-source.delivery-blocked'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('web-source-selected-package-ids')
      expect(serialized).not.toContain('hostPath')
      expect('platformSplitContract' in result).toBe(false)
      expectNoRuntimeOrPersistentEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
