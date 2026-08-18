import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackStartupGateBootstrapSource,
  THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_MODE,
  ThirdPartyDataPackStartupGateBootstrapBlockedError,
  type ThirdPartyDataPackStartupGateBootstrapSourceResult
} from '@/domain/mods/thirdPartyDataPackStartupGateBootstrapSource'
import type { ThirdPartyDataPackAppBootstrapWiringPreflightResult } from '@/domain/mods/thirdPartyDataPackAppBootstrapWiringPreflight'
import type { ThirdPartyDataPackAppFactoryBindingSourceResult } from '@/domain/mods/thirdPartyDataPackAppFactoryBindingSource'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceResult
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSource'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

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

const createAppBootstrapWiringSource = (
  overrides: Partial<ThirdPartyDataPackAppBootstrapWiringPreflightResult> = {}
): ThirdPartyDataPackAppBootstrapWiringPreflightResult => ({
  status: 'skipped',
  reason: 'no selected third-party data packs',
  appBootstrapWiringPreflight: 'skipped',
  readOnly: true,
  appBootstrapWiringAllowed: false,
  normalStartupGateAllowed: false,
  launcherAppAllowed: false,
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
  candidateHash: testHash('c'),
  lockfileHash: testHash('d'),
  diagnostics: [],
  summary,
  effects: {},
  ...overrides
} as unknown as ThirdPartyDataPackAppBootstrapWiringPreflightResult)

const createPersistentStateSource = (
  overrides: Partial<ThirdPartyDataPackStartupGatePersistentStateSourceResult> = {}
): ThirdPartyDataPackStartupGatePersistentStateSourceResult => ({
  status: 'ready',
  reason: 'path-free persistent startup state snapshot accepted',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  normalStartupContinuationAllowed: true,
  sourceAdapterStatus: 'executed',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  lockfileHash: testHash('d'),
  persistentStateProofs,
  diagnostics: [],
  summary,
  effects: {
    startupGatePersistentStateSourceCalled: true,
    persistentStateSourceAdapterCalled: true,
    startupStateSnapshotAccepted: true,
    normalStartupContinuationAllowed: true,
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
} as unknown as ThirdPartyDataPackStartupGatePersistentStateSourceResult)

const createAppFactoryBindingSource = (
  overrides: Partial<ThirdPartyDataPackAppFactoryBindingSourceResult> = {}
): ThirdPartyDataPackAppFactoryBindingSourceResult => ({
  status: 'skipped',
  reason: 'factory binding still disabled',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  appFactoryBindingPreflightSourceStatus: 'skipped',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  lockfileHash: testHash('d'),
  diagnostics: [],
  summary,
  effects: {
    appFactoryBindingSourceCalled: true,
    appFactoryBindingPreflightSourceCalled: true,
    injectedAppFactoryBindingHostCalled: false,
    appFactoryBindingHostCalled: false,
    appFactoryBindingHostAccepted: false,
    realAppFactoryBindingHostCalled: false,
    appBootstrapContinuationAllowed: true,
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
} as unknown as ThirdPartyDataPackAppFactoryBindingSourceResult)

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimeOrWriteEffects = (
  result: ThirdPartyDataPackStartupGateBootstrapSourceResult,
  continuationAllowed: boolean
): void => {
  expect(result.effects.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  const {
    startupGateBootstrapSourceCalled: _startupGateBootstrapSourceCalled,
    appBootstrapWiringSourceCalled: _appBootstrapWiringSourceCalled,
    startupPersistentStateSourceCalled: _startupPersistentStateSourceCalled,
    startupStateSnapshotAccepted: _startupStateSnapshotAccepted,
    appFactoryBindingSourceCalled: _appFactoryBindingSourceCalled,
    appFactoryBindingContinuationAllowed: _appFactoryBindingContinuationAllowed,
    appBootstrapContinuationAllowed: _appBootstrapContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party startup gate bootstrap source', () => {
  it('is disabled by default and does not call the app bootstrap wiring source', async() => {
    const readAppBootstrapWiringPreflight = vi.fn()
    const readStartupGatePersistentStateSource = vi.fn()
    const readAppFactoryBindingSource = vi.fn()
    const bootstrapThirdPartyStartupGate = createThirdPartyDataPackStartupGateBootstrapSource({
      readAppBootstrapWiringPreflight,
      readStartupGatePersistentStateSource,
      readAppFactoryBindingSource
    })

    const result = await bootstrapThirdPartyStartupGate()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_STARTUP_GATE_BOOTSTRAP_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.appBootstrapContinuationAllowed).toBe(true)
    expect(readAppBootstrapWiringPreflight).not.toHaveBeenCalled()
    expect(readStartupGatePersistentStateSource).not.toHaveBeenCalled()
    expect(readAppFactoryBindingSource).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('allows bootstrap to continue when an enabled source reports a skipped third-party gate', async() => {
    const readAppBootstrapWiringPreflight = vi.fn(async() => createAppBootstrapWiringSource())
    const bootstrapThirdPartyStartupGate = createThirdPartyDataPackStartupGateBootstrapSource({
      enabled: true,
      readAppBootstrapWiringPreflight
    })

    const result = await bootstrapThirdPartyStartupGate()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readAppBootstrapWiringPreflight).toHaveBeenCalledOnce()
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.summary).toEqual(expect.objectContaining({
      selectedPackageCount: 1,
      registryCount: 55,
      entryCount: 4243
    }))
    expectNoRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts path-free persistent-state and factory-binding sources before app state creation', async() => {
    const readStartupGatePersistentStateSource = vi.fn(async() => createPersistentStateSource())
    const readAppFactoryBindingSource = vi.fn(async() => createAppFactoryBindingSource({
      status: 'ready',
      reason: 'factory binding host acknowledged path-free app factories',
      appFactoryBindingPreflightSourceStatus: 'deferred',
      appFactoryBindingHostStatus: 'accepted',
      startupGateDecision: 'ready-for-launcher-boundary',
      persistentStateProofs,
      effects: {
        ...createAppFactoryBindingSource().effects,
        injectedAppFactoryBindingHostCalled: true,
        appFactoryBindingHostCalled: true,
        appFactoryBindingHostAccepted: true
      }
    }))
    const bootstrapThirdPartyStartupGate = createThirdPartyDataPackStartupGateBootstrapSource({
      enabled: true,
      readStartupGatePersistentStateSource,
      readAppFactoryBindingSource
    })

    const result = await bootstrapThirdPartyStartupGate()

    expect(result.status).toBe('ready')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readStartupGatePersistentStateSource).toHaveBeenCalledOnce()
    expect(readAppFactoryBindingSource).toHaveBeenCalledOnce()
    expect(result.startupPersistentStateSourceStatus).toBe('ready')
    expect(result.appFactoryBindingSourceStatus).toBe('ready')
    expect(result.appBootstrapWiringSourceStatus).toBeUndefined()
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.lockfileHash).toBe(testHash('d'))
    expect(result.persistentStateProofs).toEqual(persistentStateProofs)
    expect(result.effects.startupPersistentStateSourceCalled).toBe(true)
    expect(result.effects.startupStateSnapshotAccepted).toBe(true)
    expect(result.effects.appFactoryBindingSourceCalled).toBe(true)
    expect(result.effects.appFactoryBindingContinuationAllowed).toBe(true)
    expect('startupStateSnapshot' in result).toBe(false)
    expect('launcherAppFactory' in result).toBe(false)
    expect('gameAppFactory' in result).toBe(false)
    expectNoRuntimeOrWriteEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks deferred or failed startup gate source results without leaking host paths', async() => {
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/bootstrap-source-diagnostic')
      }
    }), {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.startup-gate-bootstrap.blocked-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      file: 'C:/Users/LENOVO/mods/sample_pack/manifest.json',
      recovery: 'retry'
    })
    const bootstrapThirdPartyStartupGate = createThirdPartyDataPackStartupGateBootstrapSource({
      enabled: true,
      readAppBootstrapWiringPreflight: async() => createAppBootstrapWiringSource({
        status: 'deferred',
        appBootstrapWiringPreflight: 'deferred',
        blockedPackageIds: [blockedPackageId],
        diagnostics: [diagnostic] as never
      })
    })

    await expect(bootstrapThirdPartyStartupGate()).rejects.toBeInstanceOf(
      ThirdPartyDataPackStartupGateBootstrapBlockedError
    )

    try {
      await bootstrapThirdPartyStartupGate()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackStartupGateBootstrapBlockedError)
      const result = (error as ThirdPartyDataPackStartupGateBootstrapBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.appBootstrapContinuationAllowed).toBe(false)
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: 'third-party.startup-gate-bootstrap.blocked-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.startup-gate-bootstrap-source.app-bootstrap-blocked',
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

  it('blocks unsafe persistent-state or factory-binding chain sources without leaking paths', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/bootstrap-chain-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const bootstrapThirdPartyStartupGate = createThirdPartyDataPackStartupGateBootstrapSource({
      enabled: true,
      readStartupGatePersistentStateSource: async() => createPersistentStateSource({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        effects: {
          ...createPersistentStateSource().effects,
          transactionCommitted: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackStartupGatePersistentStateSourceResult>),
      readAppFactoryBindingSource: async() => createAppFactoryBindingSource({
        launcherAppFactory: () => undefined
      } as unknown as Partial<ThirdPartyDataPackAppFactoryBindingSourceResult>)
    })

    await expect(bootstrapThirdPartyStartupGate()).rejects.toBeInstanceOf(
      ThirdPartyDataPackStartupGateBootstrapBlockedError
    )

    try {
      await bootstrapThirdPartyStartupGate()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackStartupGateBootstrapBlockedError)
      const result = (error as ThirdPartyDataPackStartupGateBootstrapBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.startup-gate-bootstrap-source.unsafe-persistent-state-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('bootstrap-chain-selected-package-ids')
      expect('programDirectoryPath' in result).toBe(false)
      expect('launcherAppFactory' in result).toBe(false)
      expectNoRuntimeOrWriteEffects(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks source failures before app state creation without exposing thrown error details', async() => {
    const bootstrapThirdPartyStartupGate = createThirdPartyDataPackStartupGateBootstrapSource({
      enabled: true,
      readAppBootstrapWiringPreflight: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/bootstrap-source')
      }
    })

    try {
      await bootstrapThirdPartyStartupGate()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackStartupGateBootstrapBlockedError)
      const result = (error as ThirdPartyDataPackStartupGateBootstrapBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.startup-gate-bootstrap-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRuntimeOrWriteEffects(result, false)
    }
  })
})
