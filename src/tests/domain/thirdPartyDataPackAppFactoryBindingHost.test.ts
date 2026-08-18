import { describe, expect, it } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackAppFactoryBindingHost,
  THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_HOST_KIND,
  type ThirdPartyDataPackAppFactoryBindingHost
} from '@/domain/mods/thirdPartyDataPackAppFactoryBindingHost'
import {
  createThirdPartyDataPackAppFactoryBindingSource,
  type ThirdPartyDataPackAppFactoryBindingHostEnvelope
} from '@/domain/mods/thirdPartyDataPackAppFactoryBindingSource'
import type {
  ThirdPartyDataPackAppFactoryBindingPreflightResult
} from '@/domain/mods/thirdPartyDataPackAppFactoryBindingPreflight'

const packageId = 'sample_pack' as PackageId
const alternatePackageId = 'alternate_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateHash = testHash('c')
const lockfileHash = testHash('d')

const persistentStateProofs = {
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true
} as const

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

const createEnvelope = (
  overrides: Partial<ThirdPartyDataPackAppFactoryBindingHostEnvelope> = {}
): ThirdPartyDataPackAppFactoryBindingHostEnvelope => Object.freeze({
  platform: 'electron',
  startupGateDecision: 'ready-for-launcher-boundary',
  targetPackageId: packageId,
  selectedPackageIds: Object.freeze([packageId]),
  blockedPackageIds: Object.freeze([]),
  loadOrder: Object.freeze([packageId]),
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateHash,
  lockfileHash,
  persistentStateProofs,
  ...overrides
} as ThirdPartyDataPackAppFactoryBindingHostEnvelope)

const createDeferredPreflight = (
  overrides: Partial<ThirdPartyDataPackAppFactoryBindingPreflightResult> = {}
): ThirdPartyDataPackAppFactoryBindingPreflightResult => ({
  platform: 'electron',
  status: 'deferred',
  appBootstrapWiringPreflightStatus: 'deferred',
  startupGateDecision: 'ready-for-launcher-boundary',
  reason: 'app factory binding preflight is prepared',
  appFactoryBindingPreflight: 'deferred',
  readOnly: true,
  appBootstrapWiringPreflightConsumed: true,
  appFactoryBindingPreflightPrepared: true,
  launcherAppFactoryBindingReportPrepared: true,
  gameAppFactoryBindingReportPrepared: true,
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
  requestedCommandId: 'install',
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoFactoryOrRuntimeEffects = (
  result: Awaited<ReturnType<ThirdPartyDataPackAppFactoryBindingHost['acknowledgeAppFactoryBinding']>>,
  accepted: boolean
): void => {
  expect(result.effects.appFactoryBindingHostCalled).toBe(true)
  expect(result.effects.appFactoryBindingHostAccepted).toBe(accepted)

  const {
    appFactoryBindingHostCalled: _appFactoryBindingHostCalled,
    appFactoryBindingHostAccepted: _appFactoryBindingHostAccepted,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

const expectPathFree = (value: unknown): void => {
  const serialized = JSON.stringify(value)
  if (value && typeof value === 'object') {
    expect('rawEnvelope' in value).toBe(false)
    expect('launcherAppFactory' in value).toBe(false)
    expect('gameAppFactory' in value).toBe(false)
    expect('launcherApp' in value).toBe(false)
    expect('gameApp' in value).toBe(false)
    expect('pinia' in value).toBe(false)
    expect('router' in value).toBe(false)
    expect('programDirectoryPath' in value).toBe(false)
  }
  expect(serialized).not.toContain('C:/Users')
  expect(serialized).not.toContain('LENOVO')
}

describe('third-party app factory binding host', () => {
  it('records a path-free factory binding acknowledgement without creating app factories', async() => {
    const host = createThirdPartyDataPackAppFactoryBindingHost({
      expectedPlatform: 'electron',
      expectedPackageId: packageId
    })

    const result = await host.acknowledgeAppFactoryBinding(createEnvelope())

    expect(host.kind).toBe(THIRD_PARTY_DATA_PACK_APP_FACTORY_BINDING_HOST_KIND)
    expect(Object.isFrozen(host)).toBe(true)
    expect(result.status).toBe('accepted')
    expect(result.platform).toBe('electron')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateHash).toBe(candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentStateProofsAccepted).toBe(true)
    expectNoFactoryOrRuntimeEffects(result, true)
    expectJsonGraphFrozen(result)
    expectPathFree(result)

    const records = host.getBindingRecords()
    expect(records).toEqual([{
      sequence: 1,
      platform: 'electron',
      startupGateDecision: 'ready-for-launcher-boundary',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      candidateHash,
      lockfileHash,
      persistentStateProofsAccepted: true,
      launcherAppFactoryBindingReportPrepared: true,
      gameAppFactoryBindingReportPrepared: true
    }])
    expect(host.getLastBindingRecord()).toEqual(records[0])
    expectJsonGraphFrozen(records)
    expectPathFree(records)

    host.clearBindingRecords()
    expect(host.getBindingRecords()).toEqual([])
    expect(host.getLastBindingRecord()).toBeUndefined()
  })

  it('returns an acknowledgement accepted by the existing app factory binding source', async() => {
    const host = createThirdPartyDataPackAppFactoryBindingHost({
      expectedPlatform: 'electron',
      expectedPackageId: packageId
    })
    const source = createThirdPartyDataPackAppFactoryBindingSource({
      enabled: true,
      readAppFactoryBindingPreflight: async() => createDeferredPreflight(),
      acknowledgeAppFactoryBinding: host.acknowledgeAppFactoryBinding
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.appFactoryBindingHostStatus).toBe('accepted')
    expect(result.appBootstrapContinuationAllowed).toBe(true)
    expect(result.effects.appFactoryBindingHostCalled).toBe(true)
    expect(result.effects.appFactoryBindingHostAccepted).toBe(true)
    expect(result.effects.launcherAppFactoryCalled).toBe(false)
    expect(result.effects.gameAppFactoryCalled).toBe(false)
    expect(host.getLastBindingRecord()).toMatchObject({
      sequence: 1,
      targetPackageId: packageId,
      candidateHash,
      lockfileHash
    })
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('rejects unfrozen, unsafe or mismatched envelopes without storing records', async() => {
    const host = createThirdPartyDataPackAppFactoryBindingHost({
      expectedPackageId: packageId
    })
    const unfrozenEnvelope = {
      ...createEnvelope()
    } as ThirdPartyDataPackAppFactoryBindingHostEnvelope
    const unsafeEnvelope = Object.freeze({
      ...createEnvelope(),
      launcherAppFactory: () => undefined,
      programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
    }) as unknown as ThirdPartyDataPackAppFactoryBindingHostEnvelope
    const mismatchedEnvelope = createEnvelope({
      targetPackageId: alternatePackageId,
      selectedPackageIds: [alternatePackageId],
      loadOrder: [alternatePackageId]
    })

    const unfrozenResult = await host.acknowledgeAppFactoryBinding(unfrozenEnvelope)
    const unsafeResult = await host.acknowledgeAppFactoryBinding(unsafeEnvelope)
    const mismatchedResult = await host.acknowledgeAppFactoryBinding(mismatchedEnvelope)

    for (const result of [unfrozenResult, unsafeResult, mismatchedResult]) {
      expect(result.status).toBe('blocked')
      expectNoFactoryOrRuntimeEffects(result, false)
      expectJsonGraphFrozen(result)
      expectPathFree(result)
    }
    expect(host.getBindingRecords()).toEqual([])
  })
})
