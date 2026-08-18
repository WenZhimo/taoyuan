import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource,
  THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_MODE,
  ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffBlockedError,
  type ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult
} from '@/domain/mods/thirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffEffectSummary,
  ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult
} from '@/domain/mods/thirdPartyDataPackWebResponseDeliveryStartupGateHandoff'

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

const envelope: ThirdPartyDataPackUiIpcResultEnvelope = {
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
}

const acknowledgement = {
  status: 'acknowledged' as const,
  channel: 'web-ui-response-event-sink' as const,
  packageId,
  envelopeKind: 'success' as const,
  messageKey: 'mods.ui.ipc.result.install.success'
}

const createHandoffEffects = (
  prepared: boolean,
  overrides: Partial<ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffEffectSummary> = {}
): ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffEffectSummary => ({
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
  webUiResponsePublished: prepared,
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
  successEnvelopeDelivered: prepared,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
  uiIpcResponseDelivered: prepared,
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
  webResponseDeliveryAcknowledgementConsumed: prepared,
  startupGateHandoffPreflightConsumed: prepared,
  responseDeliveryStartupGateHandoffPrepared: prepared,
  ...overrides
})

const createHandoffResult = (
  overrides: Partial<ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult> = {}
): ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult => ({
  kind: 'web-response-delivery-startup-gate-handoff',
  mode: 'readonly-web-response-delivery-startup-gate-handoff',
  platform: 'web',
  status: 'ready',
  webResponseDeliveryStatus: 'delivered',
  startupGateHandoffPreflightStatus: 'deferred',
  reason: 'web response delivery acknowledgement is connected to startup gate handoff evidence',
  webResponseDeliveryStartupGateHandoff: 'ready',
  readOnly: true,
  webResponseDelivered: true,
  deliveryAcknowledgementConsumed: true,
  startupGateHandoffPreflightConsumed: true,
  responseDeliveryStartupGateHandoffPrepared: true,
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
  deliveryEnvelope: envelope,
  acknowledgement,
  checks: [
    {
      id: 'web-response-delivery-delivered',
      status: 'satisfied',
      reason: 'Web response delivery was delivered.'
    },
    {
      id: 'startup-gate-preflight-deferred',
      status: 'satisfied',
      reason: 'Startup gate remains deferred.'
    }
  ],
  diagnostics: [],
  summary,
  effects: createHandoffEffects(true),
  ...overrides
} as unknown as ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult)

const createSkippedHandoffResult = (
  overrides: Partial<ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult> = {}
): ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult => createHandoffResult({
  status: 'skipped',
  webResponseDeliveryStatus: 'skipped',
  startupGateHandoffPreflightStatus: 'skipped',
  reason: 'no selected third-party data packs',
  webResponseDeliveryStartupGateHandoff: 'skipped',
  webResponseDelivered: false,
  deliveryAcknowledgementConsumed: false,
  startupGateHandoffPreflightConsumed: false,
  responseDeliveryStartupGateHandoffPrepared: false,
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
  acknowledgement: undefined,
  checks: [],
  summary: {
    ...summary,
    selectedPackageCount: 0,
    loadOrderCount: 0,
    registryCount: 54,
    entryCount: 4242,
    packageCount: 0
  },
  effects: createHandoffEffects(false),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoStartupRuntimeOrWriteEffects = (
  result: ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSourceResult,
  continuationAllowed: boolean,
  accepted: boolean
): void => {
  expect(result.startupGateContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.startupGateContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.responseDeliveryStartupGateHandoffAccepted).toBe(accepted)

  const {
    webResponseDeliveryStartupGateHandoffSourceCalled: _sourceCalled,
    webResponseDeliveryStartupGateHandoffReaderCalled: _readerCalled,
    responseDeliveryStartupGateHandoffAccepted: _accepted,
    startupGateContinuationAllowed: _continuationAllowed,
    webUiResponsePublished: _webUiResponsePublished,
    successEnvelopeDelivered: _successEnvelopeDelivered,
    failureEnvelopeDelivered: _failureEnvelopeDelivered,
    retryStateDelivered: _retryStateDelivered,
    rollbackStateDelivered: _rollbackStateDelivered,
    uiIpcResponseDelivered: _uiIpcResponseDelivered,
    webResponseDeliveryAcknowledgementConsumed: _webResponseDeliveryAcknowledgementConsumed,
    startupGateHandoffPreflightConsumed: _startupGateHandoffPreflightConsumed,
    responseDeliveryStartupGateHandoffPrepared: _responseDeliveryStartupGateHandoffPrepared,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party Web response delivery startup gate handoff source', () => {
  it('is disabled by default and does not call the handoff source', async() => {
    const readWebResponseDeliveryStartupGateHandoff = vi.fn()
    const source = createThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource({
      readWebResponseDeliveryStartupGateHandoff
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_WEB_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_MODE)
    expect(result.platform).toBe('web')
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readWebResponseDeliveryStartupGateHandoff).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoStartupRuntimeOrWriteEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts a ready path-free Web response delivery startup handoff without exposing source internals', async() => {
    const readWebResponseDeliveryStartupGateHandoff = vi.fn(async() => createHandoffResult())
    const source = createThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource({
      enabled: true,
      readWebResponseDeliveryStartupGateHandoff
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readWebResponseDeliveryStartupGateHandoff).toHaveBeenCalledOnce()
    expect(result.sourceHandoffStatus).toBe('ready')
    expect(result.webResponseDeliveryStatus).toBe('delivered')
    expect(result.startupGateHandoffPreflightStatus).toBe('deferred')
    expect(result.webResponseDelivered).toBe(true)
    expect(result.deliveryAcknowledgementConsumed).toBe(true)
    expect(result.startupGateHandoffPreflightConsumed).toBe(true)
    expect(result.responseDeliveryStartupGateHandoffPrepared).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.envelopeKind).toBe('success')
    expect(result.messageKey).toBe('mods.ui.ipc.result.install.success')
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
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
    expect(result.acknowledgement).toEqual(acknowledgement)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect('deliveryEnvelope' in result).toBe(false)
    expect('webResponseDelivery' in result).toBe(false)
    expect('startupGateHandoffPreflight' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoStartupRuntimeOrWriteEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('allows skipped handoffs to continue without accepting Web delivery evidence', async() => {
    const source = createThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource({
      enabled: true,
      readWebResponseDeliveryStartupGateHandoff: async() => createSkippedHandoffResult()
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.sourceHandoffStatus).toBe('skipped')
    expect(result.webResponseDelivered).toBe(false)
    expect(result.deliveryAcknowledgementConsumed).toBe(false)
    expect(result.deliveryEnvelopeSummary).toBeUndefined()
    expect(result.acknowledgement).toBeUndefined()
    expect(result.selectedPackageIds).toEqual([])
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoStartupRuntimeOrWriteEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('blocks missing, throwing and blocked handoff sources without leaking host paths', async() => {
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/web-startup-handoff-diagnostic')
      }
    }), {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.web-response-delivery-startup-gate-handoff-source.blocked-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      file: 'C:/Users/LENOVO/mods/sample_pack/startup-handoff.json',
      recovery: 'retry'
    })
    const missingSource = createThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource({
      enabled: true,
      readWebResponseDeliveryStartupGateHandoff: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/web-startup-handoff-source')
      }
    })
    const blockedSource = createThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource({
      enabled: true,
      readWebResponseDeliveryStartupGateHandoff: async() => createHandoffResult({
        status: 'blocked',
        webResponseDeliveryStartupGateHandoff: 'blocked',
        reason: 'upstream Web startup handoff blocked',
        blockedPackageIds: [blockedPackageId],
        diagnostics: [diagnostic] as never,
        webResponseDelivered: false,
        deliveryAcknowledgementConsumed: false,
        startupGateHandoffPreflightConsumed: false,
        responseDeliveryStartupGateHandoffPrepared: false,
        effects: createHandoffEffects(false)
      })
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffBlockedError
    )
    await expect(blockedSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffBlockedError)
      const result = (error as ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.web-response-delivery-startup-gate-handoff-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoStartupRuntimeOrWriteEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }

    try {
      await blockedSource()
    } catch (error) {
      const result = (error as ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.web-response-delivery-startup-gate-handoff-source.blocked-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.web-response-delivery-startup-gate-handoff-source.handoff-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('startup-handoff.json')
      expect(serialized).not.toContain('hostPath')
      expectNoStartupRuntimeOrWriteEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe handoff drift while copying package arrays without reading hostile lengths', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/web-startup-handoff-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/web-startup-handoff-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.web-response-delivery-startup-gate-handoff-source.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const source = createThirdPartyDataPackWebResponseDeliveryStartupGateHandoffSource({
      enabled: true,
      readWebResponseDeliveryStartupGateHandoff: async() => createHandoffResult({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        diagnostics: createHostileArray([diagnostic], 'diagnostics') as never,
        webHost: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...createHandoffEffects(true),
          transactionCommitted: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffBlockedError)
      const result = (error as ThirdPartyDataPackWebResponseDeliveryStartupGateHandoffBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.web-response-delivery-startup-gate-handoff-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('web-startup-handoff-selected-package-ids')
      expect(serialized).not.toContain('hostPath')
      expect('webHost' in result).toBe(false)
      expectNoStartupRuntimeOrWriteEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })
})
