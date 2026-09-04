import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackNormalStartupHandoffExecutionSource,
  THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_HANDOFF_EXECUTION_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_HANDOFF_EXECUTION_SOURCE_MODE,
  ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError,
  type ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult,
  type ThirdPartyDataPackNormalStartupHandoffHostEnvelope,
  type ThirdPartyDataPackNormalStartupHandoffHostResult
} from '@/domain/mods/thirdPartyDataPackNormalStartupHandoffExecutionSource'
import type {
  ThirdPartyDataPackStartupGateBootstrapSourceResult
} from '@/domain/mods/thirdPartyDataPackStartupGateBootstrapSource'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

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

const createStartupGateBootstrapEffects = (
  overrides: Partial<ThirdPartyDataPackStartupGateBootstrapSourceResult['effects']> = {}
): ThirdPartyDataPackStartupGateBootstrapSourceResult['effects'] => ({
  startupGateBootstrapSourceCalled: true,
  appBootstrapWiringSourceCalled: false,
  startupPersistentStateSourceCalled: true,
  startupStateSnapshotAccepted: true,
  appFactoryBindingSourceCalled: true,
  appFactoryBindingContinuationAllowed: true,
  appStartupHostConnectionSourceCalled: false,
  appStartupHostConnectionAccepted: false,
  appBootstrapContinuationAllowed: true,
  realRuntimePublicationCommitCalled: false,
  realNormalStartupHostCalled: false,
  launcherAppCreated: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  saveRead: false,
  uiIpcResponseDelivered: false,
  commandDispatched: false,
  thirdPartyRegistryPublished: false,
  liveRegistrySwapped: false,
  runtimeEnablementAllowed: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  packageFilesWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  rollbackExecuted: false,
  diagnosticsWritten: false,
  ...overrides
})

const createStartupGateBootstrapSource = (
  overrides: Partial<ThirdPartyDataPackStartupGateBootstrapSourceResult> = {}
): ThirdPartyDataPackStartupGateBootstrapSourceResult => ({
  status: 'ready',
  reason: 'startup gate bootstrap accepted path-free persistent-state and factory-binding sources',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  startupPersistentStateSourceStatus: 'ready',
  appFactoryBindingSourceStatus: 'ready',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  lockfileHash,
  persistentStateProofs,
  diagnostics: [],
  summary,
  effects: createStartupGateBootstrapEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackStartupGateBootstrapSourceResult)

const createSkippedStartupGateBootstrapSource = (
  overrides: Partial<ThirdPartyDataPackStartupGateBootstrapSourceResult> = {}
): ThirdPartyDataPackStartupGateBootstrapSourceResult => createStartupGateBootstrapSource({
  status: 'skipped',
  reason: 'no selected third-party data packs',
  startupPersistentStateSourceStatus: undefined,
  appFactoryBindingSourceStatus: undefined,
  targetPackageId: packageId,
  persistentStateProofs: undefined,
  effects: createStartupGateBootstrapEffects({
    appBootstrapWiringSourceCalled: true,
    startupPersistentStateSourceCalled: false,
    startupStateSnapshotAccepted: false,
    appFactoryBindingSourceCalled: false,
    appFactoryBindingContinuationAllowed: false
  }),
  ...overrides
})

const createAcceptedHostResult = (
  envelope: ThirdPartyDataPackNormalStartupHandoffHostEnvelope,
  overrides: Partial<ThirdPartyDataPackNormalStartupHandoffHostResult> = {}
): ThirdPartyDataPackNormalStartupHandoffHostResult => ({
  status: 'accepted',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  lockfileHash: envelope.lockfileHash,
  persistentStateProofsAccepted: true,
  diagnostics: [],
  effects: {
    normalStartupHandoffHostCalled: true,
    normalStartupHandoffHostAccepted: true,
    realNormalStartupHostCalled: false,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    gameAppMounted: false,
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
  result: ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult,
  continuationAllowed: boolean,
  hostAcknowledged = false
): void => {
  expect(result.normalStartupContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.normalStartupContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.normalStartupHandoffHostCalled).toBe(hostAcknowledged)
  expect(result.effects.normalStartupHandoffHostAccepted).toBe(hostAcknowledged)

  const {
    normalStartupHandoffExecutionSourceCalled: _normalStartupHandoffExecutionSourceCalled,
    startupGateBootstrapSourceCalled: _startupGateBootstrapSourceCalled,
    injectedNormalStartupHandoffHostCalled: _injectedNormalStartupHandoffHostCalled,
    normalStartupHandoffHostCalled: _normalStartupHandoffHostCalled,
    normalStartupHandoffHostAccepted: _normalStartupHandoffHostAccepted,
    normalStartupContinuationAllowed: _normalStartupContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party normal startup handoff execution source', () => {
  it('is disabled by default and does not call startup bootstrap or handoff host', async() => {
    const readStartupGateBootstrapSource = vi.fn()
    const acknowledgeNormalStartupHandoff = vi.fn()
    const source = createThirdPartyDataPackNormalStartupHandoffExecutionSource({
      readStartupGateBootstrapSource,
      acknowledgeNormalStartupHandoff
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_HANDOFF_EXECUTION_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_NORMAL_STARTUP_HANDOFF_EXECUTION_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readStartupGateBootstrapSource).not.toHaveBeenCalled()
    expect(acknowledgeNormalStartupHandoff).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('allows normal startup to continue when the startup bootstrap source is skipped', async() => {
    const readStartupGateBootstrapSource = vi.fn(async() => createSkippedStartupGateBootstrapSource())
    const acknowledgeNormalStartupHandoff = vi.fn()
    const source = createThirdPartyDataPackNormalStartupHandoffExecutionSource({
      enabled: true,
      readStartupGateBootstrapSource,
      acknowledgeNormalStartupHandoff
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readStartupGateBootstrapSource).toHaveBeenCalledOnce()
    expect(acknowledgeNormalStartupHandoff).not.toHaveBeenCalled()
    expect(result.startupGateBootstrapSourceStatus).toBe('skipped')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.summary).toEqual(expect.objectContaining({
      selectedPackageCount: 1,
      registryCount: 55,
      entryCount: 4243
    }))
    expectNoRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts a ready startup bootstrap through an injected path-free handoff acknowledgement', async() => {
    const readStartupGateBootstrapSource = vi.fn(async() => createStartupGateBootstrapSource())
    const acknowledgeNormalStartupHandoff = vi.fn(async(
      envelope: ThirdPartyDataPackNormalStartupHandoffHostEnvelope
    ) => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.selectedPackageIds).toEqual([packageId])
      expect(envelope.loadOrder).toEqual([packageId])
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.persistentStateProofs).toEqual(persistentStateProofs)
      expect('launcherAppFactory' in envelope).toBe(false)
      expect('gameAppFactory' in envelope).toBe(false)
      expect('pinia' in envelope).toBe(false)
      expect('router' in envelope).toBe(false)
      return createAcceptedHostResult(envelope)
    })
    const source = createThirdPartyDataPackNormalStartupHandoffExecutionSource({
      enabled: true,
      readStartupGateBootstrapSource,
      acknowledgeNormalStartupHandoff
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readStartupGateBootstrapSource).toHaveBeenCalledOnce()
    expect(acknowledgeNormalStartupHandoff).toHaveBeenCalledOnce()
    expect(result.startupGateBootstrapSourceStatus).toBe('ready')
    expect(result.normalStartupHandoffHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentStateProofs).toEqual(persistentStateProofs)
    expect('startupGateBootstrapSource' in result).toBe(false)
    expect('launcherAppFactory' in result).toBe(false)
    expect('gameAppFactory' in result).toBe(false)
    expect('launcherApp' in result).toBe(false)
    expect('gameApp' in result).toBe(false)
    expect('pinia' in result).toBe(false)
    expect('router' in result).toBe(false)
    expectNoRuntimeOrWriteEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts a ready startup bootstrap through a real path-free handoff acknowledgement', async() => {
    const readStartupGateBootstrapSource = vi.fn(async() => createStartupGateBootstrapSource())
    const acknowledgeNormalStartupHandoff = vi.fn(async(
      envelope: ThirdPartyDataPackNormalStartupHandoffHostEnvelope
    ) => {
      const accepted = createAcceptedHostResult(envelope)
      return {
        ...accepted,
        effects: {
          ...accepted.effects,
          realNormalStartupHostCalled: true
        }
      }
    })
    const source = createThirdPartyDataPackNormalStartupHandoffExecutionSource({
      enabled: true,
      readStartupGateBootstrapSource,
      acknowledgeNormalStartupHandoff
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.normalStartupHandoffHostStatus).toBe('accepted')
    expect(result.effects.injectedNormalStartupHandoffHostCalled).toBe(false)
    expect(result.effects.normalStartupHandoffHostCalled).toBe(true)
    expect(result.effects.normalStartupHandoffHostAccepted).toBe(true)
    expect(result.effects.realNormalStartupHostCalled).toBe(true)
    const {
      normalStartupHandoffExecutionSourceCalled: _normalStartupHandoffExecutionSourceCalled,
      startupGateBootstrapSourceCalled: _startupGateBootstrapSourceCalled,
      normalStartupHandoffHostCalled: _normalStartupHandoffHostCalled,
      normalStartupHandoffHostAccepted: _normalStartupHandoffHostAccepted,
      realNormalStartupHostCalled: _realNormalStartupHostCalled,
      normalStartupContinuationAllowed: _normalStartupContinuationAllowed,
      ...realEffects
    } = result.effects
    expect(Object.values(realEffects).every(value => value === false)).toBe(true)
    expectJsonGraphFrozen(result)
  })

  it('blocks missing, throwing and unsafe handoff hosts without exposing paths', async() => {
    const missingHostSource = createThirdPartyDataPackNormalStartupHandoffExecutionSource({
      enabled: true,
      readStartupGateBootstrapSource: async() => createStartupGateBootstrapSource()
    })
    const throwingHostSource = createThirdPartyDataPackNormalStartupHandoffExecutionSource({
      enabled: true,
      readStartupGateBootstrapSource: async() => createStartupGateBootstrapSource(),
      acknowledgeNormalStartupHandoff: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/normal-startup-host')
      }
    })
    const unsafeHostSource = createThirdPartyDataPackNormalStartupHandoffExecutionSource({
      enabled: true,
      readStartupGateBootstrapSource: async() => createStartupGateBootstrapSource(),
      acknowledgeNormalStartupHandoff: async(envelope) => createAcceptedHostResult(envelope, {
        lockfileHash: testHash('e'),
        launcherAppFactory: () => undefined,
        effects: {
          ...createAcceptedHostResult(envelope).effects,
          gameAppCreated: true
        }
      } as unknown as Partial<ThirdPartyDataPackNormalStartupHandoffHostResult>)
    })

    await expect(missingHostSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError
    )
    await expect(throwingHostSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError
    )
    try {
      await throwingHostSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError)
      const result = (error as ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.normal-startup-handoff-execution-source.handoff-host-failed',
          packageId
        })
      ]))
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }

    try {
      await unsafeHostSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError)
      const result = (error as ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.normalStartupHandoffHostStatus).toBe('accepted')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.normal-startup-handoff-execution-source.unsafe-handoff-host-result',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.normal-startup-handoff-execution-source.handoff-host-blocked',
          packageId
        })
      ]))
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect('launcherAppFactory' in result).toBe(false)
      expectNoRuntimeOrWriteEffects(result, false, true)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe bootstrap sources and copies package arrays without reading hostile length getters', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/normal-startup-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackNormalStartupHandoffExecutionSource({
      enabled: true,
      readStartupGateBootstrapSource: async() => createStartupGateBootstrapSource({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        launcherAppFactory: () => undefined,
        effects: {
          ...createStartupGateBootstrapEffects(),
          launcherAppCreated: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackStartupGateBootstrapSourceResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError)
      const result = (error as ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.normal-startup-handoff-execution-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('normal-startup-selected-package-ids')
      expect('programDirectoryPath' in result).toBe(false)
      expect('launcherAppFactory' in result).toBe(false)
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
