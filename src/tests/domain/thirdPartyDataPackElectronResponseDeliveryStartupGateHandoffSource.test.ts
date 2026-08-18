import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource,
  THIRD_PARTY_DATA_PACK_ELECTRON_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_ELECTRON_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_MODE,
  ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffBlockedError,
  type ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSourceResult
} from '@/domain/mods/thirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffEffectSummary,
  ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffResult
} from '@/domain/mods/thirdPartyDataPackElectronResponseDeliveryStartupGateHandoff'

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
  channel: 'electron-preload-response-channel' as const,
  packageId,
  envelopeKind: 'success' as const,
  messageKey: 'mods.ui.ipc.result.install.success'
}

const createHandoffEffects = (
  prepared: boolean,
  overrides: Partial<ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffEffectSummary> = {}
): ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffEffectSummary => ({
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
  electronIpcResponseSent: prepared,
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
  electronResponseDeliveryAcknowledgementConsumed: prepared,
  startupGateHandoffPreflightConsumed: prepared,
  responseDeliveryStartupGateHandoffPrepared: prepared,
  ...overrides
})

const createHandoffResult = (
  overrides: Partial<ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffResult> = {}
): ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffResult => ({
  kind: 'electron-response-delivery-startup-gate-handoff',
  mode: 'readonly-electron-response-delivery-startup-gate-handoff',
  platform: 'electron',
  status: 'ready',
  electronResponseDeliveryStatus: 'delivered',
  startupGateHandoffPreflightStatus: 'deferred',
  reason: 'electron response delivery acknowledgement is connected to startup gate handoff evidence',
  electronResponseDeliveryStartupGateHandoff: 'ready',
  readOnly: true,
  electronResponseDelivered: true,
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
      id: 'electron-response-delivery-delivered',
      status: 'satisfied',
      reason: 'Electron response delivery was delivered.'
    },
    {
      id: 'electron-delivery-acknowledgement-present',
      status: 'satisfied',
      reason: 'Electron acknowledgement was present.'
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
} as unknown as ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffResult)

const createSkippedHandoffResult = (
  overrides: Partial<ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffResult> = {}
): ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffResult => createHandoffResult({
  status: 'skipped',
  electronResponseDeliveryStatus: 'skipped',
  startupGateHandoffPreflightStatus: 'skipped',
  reason: 'no selected third-party data packs',
  electronResponseDeliveryStartupGateHandoff: 'skipped',
  electronResponseDelivered: false,
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
  result: ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSourceResult,
  continuationAllowed: boolean,
  accepted: boolean
): void => {
  expect(result.startupGateContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.startupGateContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.responseDeliveryStartupGateHandoffAccepted).toBe(accepted)

  const {
    electronResponseDeliveryStartupGateHandoffSourceCalled: _sourceCalled,
    electronResponseDeliveryStartupGateHandoffReaderCalled: _readerCalled,
    responseDeliveryStartupGateHandoffAccepted: _accepted,
    startupGateContinuationAllowed: _continuationAllowed,
    electronIpcResponseSent: _electronIpcResponseSent,
    successEnvelopeDelivered: _successEnvelopeDelivered,
    failureEnvelopeDelivered: _failureEnvelopeDelivered,
    retryStateDelivered: _retryStateDelivered,
    rollbackStateDelivered: _rollbackStateDelivered,
    uiIpcResponseDelivered: _uiIpcResponseDelivered,
    electronResponseDeliveryAcknowledgementConsumed: _electronResponseDeliveryAcknowledgementConsumed,
    startupGateHandoffPreflightConsumed: _startupGateHandoffPreflightConsumed,
    responseDeliveryStartupGateHandoffPrepared: _responseDeliveryStartupGateHandoffPrepared,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party Electron response delivery startup gate handoff source', () => {
  it('is disabled by default and does not call the handoff source', async() => {
    const readElectronResponseDeliveryStartupGateHandoff = vi.fn()
    const source = createThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource({
      readElectronResponseDeliveryStartupGateHandoff
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_ELECTRON_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_ELECTRON_RESPONSE_DELIVERY_STARTUP_GATE_HANDOFF_SOURCE_MODE)
    expect(result.platform).toBe('electron')
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readElectronResponseDeliveryStartupGateHandoff).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoStartupRuntimeOrWriteEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts a ready path-free Electron response delivery startup handoff without exposing source internals', async() => {
    const readElectronResponseDeliveryStartupGateHandoff = vi.fn(async() => createHandoffResult())
    const source = createThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource({
      enabled: true,
      readElectronResponseDeliveryStartupGateHandoff
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readElectronResponseDeliveryStartupGateHandoff).toHaveBeenCalledOnce()
    expect(result.sourceHandoffStatus).toBe('ready')
    expect(result.electronResponseDeliveryStatus).toBe('delivered')
    expect(result.startupGateHandoffPreflightStatus).toBe('deferred')
    expect(result.electronResponseDelivered).toBe(true)
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
    expect('electronResponseDelivery' in result).toBe(false)
    expect('startupGateHandoffPreflight' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoStartupRuntimeOrWriteEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('allows skipped handoffs to continue without accepting Electron delivery evidence', async() => {
    const source = createThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource({
      enabled: true,
      readElectronResponseDeliveryStartupGateHandoff: async() => createSkippedHandoffResult()
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.sourceHandoffStatus).toBe('skipped')
    expect(result.electronResponseDelivered).toBe(false)
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
        throw new Error('C:/Users/LENOVO/mods/electron-startup-handoff-diagnostic')
      }
    }), {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.electron-response-delivery-startup-gate-handoff-source.blocked-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      file: 'C:/Users/LENOVO/mods/sample_pack/startup-handoff.json',
      recovery: 'retry'
    })
    const missingSource = createThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource({
      enabled: true,
      readElectronResponseDeliveryStartupGateHandoff: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/electron-startup-handoff-source')
      }
    })
    const blockedSource = createThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource({
      enabled: true,
      readElectronResponseDeliveryStartupGateHandoff: async() => createHandoffResult({
        status: 'blocked',
        electronResponseDeliveryStartupGateHandoff: 'blocked',
        reason: 'upstream Electron startup handoff blocked',
        blockedPackageIds: [blockedPackageId],
        diagnostics: [diagnostic] as never,
        electronResponseDelivered: false,
        deliveryAcknowledgementConsumed: false,
        startupGateHandoffPreflightConsumed: false,
        responseDeliveryStartupGateHandoffPrepared: false,
        effects: createHandoffEffects(false)
      })
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffBlockedError
    )
    await expect(blockedSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffBlockedError)
      const result = (error as ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.electron-response-delivery-startup-gate-handoff-source.source-failed'
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
      const result = (error as ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.electron-response-delivery-startup-gate-handoff-source.blocked-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.electron-response-delivery-startup-gate-handoff-source.handoff-blocked',
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
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/electron-startup-handoff-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/electron-startup-handoff-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.electron-response-delivery-startup-gate-handoff-source.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const source = createThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffSource({
      enabled: true,
      readElectronResponseDeliveryStartupGateHandoff: async() => createHandoffResult({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        diagnostics: createHostileArray([diagnostic], 'diagnostics') as never,
        electronHost: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...createHandoffEffects(true),
          transactionCommitted: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffBlockedError)
      const result = (error as ThirdPartyDataPackElectronResponseDeliveryStartupGateHandoffBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.electron-response-delivery-startup-gate-handoff-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('electron-startup-handoff-selected-package-ids')
      expect(serialized).not.toContain('hostPath')
      expect('electronHost' in result).toBe(false)
      expectNoStartupRuntimeOrWriteEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })
})
