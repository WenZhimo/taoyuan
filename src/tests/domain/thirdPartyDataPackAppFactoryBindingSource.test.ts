import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackAppFactoryBindingSource,
  THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_SOURCE_MODE,
  ThirdPartyDataPackAppFactoryBindingBlockedError,
  type ThirdPartyDataPackAppFactoryBindingHostEnvelope,
  type ThirdPartyDataPackAppFactoryBindingHostResult,
  type ThirdPartyDataPackAppFactoryBindingSourceResult
} from '@/domain/mods/thirdPartyDataPackAppFactoryBindingSource'
import type { ThirdPartyDataPackAppFactoryBindingPreflightResult } from '@/domain/mods/thirdPartyDataPackAppFactoryBindingPreflight'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateHash = testHash('c')
const lockfileHash = testHash('d')

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

const persistentStateProofs = {
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true
} as const

const createAppFactoryBindingPreflight = (
  overrides: Partial<ThirdPartyDataPackAppFactoryBindingPreflightResult> = {}
): ThirdPartyDataPackAppFactoryBindingPreflightResult => ({
  platform: 'electron',
  status: 'skipped',
  appBootstrapWiringPreflightStatus: 'skipped',
  startupGateDecision: 'not-required',
  reason: 'no selected third-party data packs',
  appFactoryBindingPreflight: 'skipped',
  readOnly: true,
  appBootstrapWiringPreflightConsumed: false,
  appFactoryBindingPreflightPrepared: false,
  launcherAppFactoryBindingReportPrepared: false,
  gameAppFactoryBindingReportPrepared: false,
  appFactoryBindingAllowed: false,
  appBootstrapWiringAllowed: false,
  normalStartupGateAllowed: false,
  launcherBoundaryAllowed: false,
  launcherAppAllowed: false,
  launcherAppCreationAllowed: false,
  gameAppCreationAllowed: false,
  piniaCreationAllowed: false,
  routerMountAllowed: false,
  saveReadAllowed: false,
  uiIpcResponseDeliveryAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  runtimeEnablementAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateHash,
  lockfileHash,
  retryable: false,
  rollbackRequired: false,
  persistentStateProofs,
  checks: [],
  diagnostics: [],
  appFactoryBindingStages: [],
  appFactoryBindingRequirements: [],
  summary,
  effects: {},
  ...overrides
} as unknown as ThirdPartyDataPackAppFactoryBindingPreflightResult)

const createDeferredAppFactoryBindingPreflight = (
  overrides: Partial<ThirdPartyDataPackAppFactoryBindingPreflightResult> = {}
): ThirdPartyDataPackAppFactoryBindingPreflightResult => createAppFactoryBindingPreflight({
  status: 'deferred',
  appBootstrapWiringPreflightStatus: 'deferred',
  startupGateDecision: 'ready-for-launcher-boundary',
  reason: 'app factory binding preflight is prepared',
  appFactoryBindingPreflight: 'deferred',
  appBootstrapWiringPreflightConsumed: true,
  appFactoryBindingPreflightPrepared: true,
  launcherAppFactoryBindingReportPrepared: true,
  gameAppFactoryBindingReportPrepared: true,
  requestedCommandId: 'install',
  persistentStateProofs,
  ...overrides
})

const createAcceptedHostResult = (
  envelope: ThirdPartyDataPackAppFactoryBindingHostEnvelope,
  overrides: Partial<ThirdPartyDataPackAppFactoryBindingHostResult> = {}
): ThirdPartyDataPackAppFactoryBindingHostResult => ({
  status: 'accepted',
  platform: envelope.platform,
  startupGateDecision: envelope.startupGateDecision,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateHash,
  lockfileHash: envelope.lockfileHash,
  persistentStateProofsAccepted: true,
  diagnostics: [],
  effects: {
    appFactoryBindingHostCalled: true,
    appFactoryBindingHostAccepted: true,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    piniaCreated: false,
    routerMounted: false,
    saveRead: false,
    uiIpcResponseDelivered: false,
    commandDispatched: false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  },
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimeOrWriteEffects = (
  result: ThirdPartyDataPackAppFactoryBindingSourceResult,
  continuationAllowed: boolean,
  hostAcknowledged = false
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.appFactoryBindingHostCalled).toBe(hostAcknowledged)
  expect(result.effects.appFactoryBindingHostAccepted).toBe(hostAcknowledged)

  const {
    appFactoryBindingSourceCalled: _appFactoryBindingSourceCalled,
    appFactoryBindingPreflightSourceCalled: _appFactoryBindingPreflightSourceCalled,
    injectedAppFactoryBindingHostCalled: _injectedAppFactoryBindingHostCalled,
    appFactoryBindingHostCalled: _appFactoryBindingHostCalled,
    appFactoryBindingHostAccepted: _appFactoryBindingHostAccepted,
    appBootstrapContinuationAllowed: _appBootstrapContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party app factory binding source', () => {
  it('is disabled by default and does not call the factory binding preflight source', async() => {
    const readAppFactoryBindingPreflight = vi.fn()
    const source = createThirdPartyDataPackAppFactoryBindingSource({
      readAppFactoryBindingPreflight
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.appBootstrapContinuationAllowed).toBe(true)
    expect(readAppFactoryBindingPreflight).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('allows bootstrap to continue when an enabled source reports a skipped factory binding preflight', async() => {
    const readAppFactoryBindingPreflight = vi.fn(async() => createAppFactoryBindingPreflight())
    const source = createThirdPartyDataPackAppFactoryBindingSource({
      enabled: true,
      readAppFactoryBindingPreflight
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readAppFactoryBindingPreflight).toHaveBeenCalledOnce()
    expect(result.appFactoryBindingPreflightSourceStatus).toBe('skipped')
    expect(result.platform).toBe('electron')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.candidateHash).toBe(candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.summary).toEqual(expect.objectContaining({
      selectedPackageCount: 1,
      registryCount: 55,
      entryCount: 4243
    }))
    expectNoRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts a deferred preflight through an injected path-free factory binding host acknowledgement', async() => {
    const readAppFactoryBindingPreflight = vi.fn(async() => createDeferredAppFactoryBindingPreflight())
    const acknowledgeAppFactoryBinding = vi.fn(async(
      envelope: ThirdPartyDataPackAppFactoryBindingHostEnvelope
    ) => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.platform).toBe('electron')
      expect(envelope.startupGateDecision).toBe('ready-for-launcher-boundary')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.selectedPackageIds).toEqual([packageId])
      expect(envelope.loadOrder).toEqual([packageId])
      expect(envelope.candidateHash).toBe(candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.persistentStateProofs).toEqual(persistentStateProofs)
      expect('launcherAppFactory' in envelope).toBe(false)
      expect('gameAppFactory' in envelope).toBe(false)
      expect('pinia' in envelope).toBe(false)
      expect('router' in envelope).toBe(false)
      return createAcceptedHostResult(envelope)
    })
    const source = createThirdPartyDataPackAppFactoryBindingSource({
      enabled: true,
      readAppFactoryBindingPreflight,
      acknowledgeAppFactoryBinding
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readAppFactoryBindingPreflight).toHaveBeenCalledOnce()
    expect(acknowledgeAppFactoryBinding).toHaveBeenCalledOnce()
    expect(result.appFactoryBindingPreflightSourceStatus).toBe('deferred')
    expect(result.appFactoryBindingHostStatus).toBe('accepted')
    expect(result.platform).toBe('electron')
    expect(result.startupGateDecision).toBe('ready-for-launcher-boundary')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.candidateHash).toBe(candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentStateProofs).toEqual(persistentStateProofs)
    expect('launcherAppFactory' in result).toBe(false)
    expect('gameAppFactory' in result).toBe(false)
    expect('launcherApp' in result).toBe(false)
    expect('gameApp' in result).toBe(false)
    expect('pinia' in result).toBe(false)
    expect('router' in result).toBe(false)
    expectNoRuntimeOrWriteEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks deferred factory binding preflight results before any app factory can run', async() => {
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/factory-source-diagnostic')
      }
    }), {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.app-factory-binding-source.blocked-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      file: 'C:/Users/LENOVO/mods/sample_pack/manifest.json',
      recovery: 'retry'
    })
    const source = createThirdPartyDataPackAppFactoryBindingSource({
      enabled: true,
      readAppFactoryBindingPreflight: async() => createDeferredAppFactoryBindingPreflight({
        blockedPackageIds: [blockedPackageId],
        diagnostics: [diagnostic] as never
      })
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackAppFactoryBindingBlockedError)

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackAppFactoryBindingBlockedError)
      const result = (error as ThirdPartyDataPackAppFactoryBindingBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.appBootstrapContinuationAllowed).toBe(false)
      expect(result.appFactoryBindingPreflightSourceStatus).toBe('deferred')
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: 'third-party.app-factory-binding-source.blocked-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.app-factory-binding-source.app-factory-binding-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('manifest.json')
      expect(serialized).not.toContain('hostPath')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks throwing and unsafe injected factory binding host results without exposing paths', async() => {
    const throwingSource = createThirdPartyDataPackAppFactoryBindingSource({
      enabled: true,
      readAppFactoryBindingPreflight: async() => createDeferredAppFactoryBindingPreflight(),
      acknowledgeAppFactoryBinding: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/app-factory-host')
      }
    })
    const unsafeSource = createThirdPartyDataPackAppFactoryBindingSource({
      enabled: true,
      readAppFactoryBindingPreflight: async() => createDeferredAppFactoryBindingPreflight(),
      acknowledgeAppFactoryBinding: async(envelope) => createAcceptedHostResult(envelope, {
        candidateHash: testHash('e'),
        launcherAppFactory: () => undefined,
        effects: {
          ...createAcceptedHostResult(envelope).effects,
          gameAppFactoryCalled: true
        }
      } as unknown as Partial<ThirdPartyDataPackAppFactoryBindingHostResult>)
    })

    await expect(throwingSource()).rejects.toBeInstanceOf(ThirdPartyDataPackAppFactoryBindingBlockedError)
    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackAppFactoryBindingBlockedError)
      const result = (error as ThirdPartyDataPackAppFactoryBindingBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.app-factory-binding-source.binding-host-failed',
          packageId
        })
      ]))
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }

    try {
      await unsafeSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackAppFactoryBindingBlockedError)
      const result = (error as ThirdPartyDataPackAppFactoryBindingBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.appFactoryBindingHostStatus).toBe('accepted')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.app-factory-binding-source.unsafe-binding-host-result',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.app-factory-binding-source.binding-host-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect('launcherAppFactory' in result).toBe(false)
      expectNoRuntimeOrWriteEffects(result, false, true)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks missing and throwing sources without exposing thrown details', async() => {
    const missingSource = createThirdPartyDataPackAppFactoryBindingSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackAppFactoryBindingSource({
      enabled: true,
      readAppFactoryBindingPreflight: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/factory-source')
      }
    })

    await expect(missingSource()).rejects.toBeInstanceOf(ThirdPartyDataPackAppFactoryBindingBlockedError)
    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackAppFactoryBindingBlockedError)
      const result = (error as ThirdPartyDataPackAppFactoryBindingBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.app-factory-binding-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe skipped sources and copies package arrays without reading hostile length getters', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/factory-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackAppFactoryBindingSource({
      enabled: true,
      readAppFactoryBindingPreflight: async() => createAppFactoryBindingPreflight({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        launcherAppFactory: () => undefined,
        gameAppFactory: () => undefined,
        router: { mount: () => undefined }
      } as unknown as Partial<ThirdPartyDataPackAppFactoryBindingPreflightResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackAppFactoryBindingBlockedError)
      const result = (error as ThirdPartyDataPackAppFactoryBindingBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.app-factory-binding-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('factory-source-selected-package-ids')
      expect('launcherAppFactory' in result).toBe(false)
      expect('gameAppFactory' in result).toBe(false)
      expect('router' in result).toBe(false)
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
