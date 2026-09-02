import { afterEach, describe, expect, it } from 'vitest'
import {
  acknowledgeThirdPartyDataPackMountedAppStartupHostConnection,
  getThirdPartyDataPackMountedAppStartupHostEvidence,
  publishThirdPartyDataPackMountedAppStartupHostEvidence,
  resetThirdPartyDataPackMountedAppStartupHostEvidenceForTests,
  type ThirdPartyDataPackMountedAppStartupHostConnectionEvidence
} from '@/domain/mods/thirdPartyDataPackMountedAppStartupHostConnection'

const readyStartupGateResult = {
  status: 'ready',
  enabled: true,
  appBootstrapContinuationAllowed: true,
  appStartupHostConnectionSourceStatus: 'accepted',
  targetPackageId: 'sample_pack',
  selectedPackageIds: ['sample_pack'],
  blockedPackageIds: [],
  loadOrder: ['sample_pack'],
  registryCount: 54,
  entryCount: 4243,
  packageCount: 1,
  lockfileHash: `sha256:${'d'.repeat(64)}`,
  effects: {
    thirdPartyRegistryPublished: true,
    liveRegistrySwapped: true,
    runtimeEnablementAllowed: true,
    realRuntimePublicationCommitCalled: true,
    runtimePublicationCommitted: true
  }
}

const mountedEvidence = (
  overrides: Partial<ThirdPartyDataPackMountedAppStartupHostConnectionEvidence> = {}
): ThirdPartyDataPackMountedAppStartupHostConnectionEvidence => ({
  officialContentBootstrapped: true,
  runtimeContentRegistryPublished: true,
  thirdPartyStartupGateCompleted: true,
  thirdPartyStartupGateAllowed: true,
  gameAppCreated: true,
  piniaCreated: true,
  routerInstalled: true,
  routerMounted: true,
  ...overrides
})

const expectFrozenGraph = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectFrozenGraph(child)
  }
}

afterEach(() => {
  resetThirdPartyDataPackMountedAppStartupHostEvidenceForTests()
})

describe('third-party mounted app startup host connection', () => {
  it('publishes a frozen clone of the latest post-mount bootstrap evidence', () => {
    const mutableEvidence = { ...mountedEvidence() }
    const published = publishThirdPartyDataPackMountedAppStartupHostEvidence(mutableEvidence)

    mutableEvidence.runtimeContentRegistryPublished = false

    expect(published).not.toBe(mutableEvidence)
    expect(Object.isFrozen(published)).toBe(true)
    expect(getThirdPartyDataPackMountedAppStartupHostEvidence()).toEqual({
      officialContentBootstrapped: true,
      runtimeContentRegistryPublished: true,
      thirdPartyStartupGateCompleted: true,
      thirdPartyStartupGateAllowed: true,
      gameAppCreated: true,
      piniaCreated: true,
      routerInstalled: true,
      routerMounted: true
    })

    resetThirdPartyDataPackMountedAppStartupHostEvidenceForTests()
    expect(getThirdPartyDataPackMountedAppStartupHostEvidence()).toBeNull()
  })

  it('accepts a ready startup gate only after the real app bootstrap has mounted', () => {
    const result = acknowledgeThirdPartyDataPackMountedAppStartupHostConnection({
      thirdPartyStartupGateResult: readyStartupGateResult,
      evidence: mountedEvidence()
    })

    expect(result).toMatchObject({
      status: 'accepted',
      enabled: true,
      sourceCalled: true,
      targetPackageId: 'sample_pack',
      appStartupHostConnectionSourceStatus: 'accepted',
      selectedPackageIds: ['sample_pack'],
      blockedPackageIds: [],
      loadOrder: ['sample_pack'],
      registryCount: 54,
      entryCount: 4243,
      packageCount: 1,
      lockfileHashPresent: true,
      effects: {
        realAppStartupHostCalled: true,
        appStartupHostConnectionAccepted: true,
        appBootstrapContinuationAllowed: true,
        officialContentBootstrapped: true,
        runtimeContentRegistryPublished: true,
        thirdPartyStartupGateCompleted: true,
        thirdPartyStartupGateAllowed: true,
        gameAppCreated: true,
        piniaCreated: true,
        routerInstalled: true,
        routerMounted: true,
        thirdPartyRegistryPublished: true,
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        realRuntimePublicationCommitCalled: true,
        runtimePublicationCommitted: true,
        packageFilesWritten: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    })
    expect(JSON.stringify(result)).not.toContain('window')
    expect(JSON.stringify(result)).not.toContain('document')
    expect(JSON.stringify(result)).not.toContain('routerInstance')
    expectFrozenGraph(result)
  })

  it('does not claim a real app-startup handoff for skipped startup gates', () => {
    const result = acknowledgeThirdPartyDataPackMountedAppStartupHostConnection({
      thirdPartyStartupGateResult: {
        status: 'skipped',
        enabled: false,
        appBootstrapContinuationAllowed: true
      },
      evidence: mountedEvidence({
        thirdPartyStartupGateCompleted: true,
        thirdPartyStartupGateAllowed: true
      })
    })

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.effects.realAppStartupHostCalled).toBe(false)
    expect(result.effects.gameAppCreated).toBe(false)
    expect(result.effects.piniaCreated).toBe(false)
    expect(result.effects.routerMounted).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
  })

  it('blocks a ready startup gate when post-mount evidence is incomplete', () => {
    const result = acknowledgeThirdPartyDataPackMountedAppStartupHostConnection({
      thirdPartyStartupGateResult: readyStartupGateResult,
      evidence: mountedEvidence({
        runtimeContentRegistryPublished: false
      })
    })

    expect(result.status).toBe('blocked')
    expect(result.targetPackageId).toBe('sample_pack')
    expect(result.effects.realAppStartupHostCalled).toBe(false)
    expect(result.effects.runtimeContentRegistryPublished).toBe(false)
    expect(result.effects.gameAppCreated).toBe(false)
  })

  it('does not read accessor-backed unsafe startup gate fields', () => {
    let getterRead = false
    const startupGateResult = {
      status: 'ready',
      enabled: true,
      appBootstrapContinuationAllowed: true,
      appStartupHostConnectionSourceStatus: 'accepted',
      selectedPackageIds: ['sample_pack'],
      blockedPackageIds: [],
      loadOrder: ['sample_pack'],
      effects: {}
    }
    Object.defineProperty(startupGateResult, 'targetPackageId', {
      enumerable: true,
      get() {
        getterRead = true
        throw new Error('C:/Users/LENOVO/mods/sample_pack')
      }
    })

    const result = acknowledgeThirdPartyDataPackMountedAppStartupHostConnection({
      thirdPartyStartupGateResult: startupGateResult,
      evidence: mountedEvidence()
    })

    expect(getterRead).toBe(false)
    expect(result.status).toBe('blocked')
    expect(result.targetPackageId).toBeUndefined()
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
  })
})
