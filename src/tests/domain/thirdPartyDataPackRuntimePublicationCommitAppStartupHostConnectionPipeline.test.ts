import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type { ThirdPartyCandidateIdentitySummary } from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline,
  type ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope,
  type ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostEffectSummary,
  type ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult,
  type ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessEffectSummary,
  ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline'

const packageId = 'sample_pack' as PackageId
const otherPackageId = 'other_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const lockfileHash = testHash('d')

const readinessEffects = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessEffectSummary> = {}
): ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessEffectSummary => ({
  runtimePublicationCommitAppStartupReadinessPipelineCalled: true,
  runtimePublicationCommitLiveRegistrySwapHostConnectionPipelineCalled: true,
  runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineCalled: true,
  runtimePublicationCommitAcknowledged: true,
  postCommitVerificationAcknowledged: true,
  liveRegistrySwapAcknowledged: true,
  appFactoryBindingAcknowledged: true,
  normalStartupHandoffAcknowledged: true,
  appStartupReadinessAllowed: true,
  appBootstrapContinuationAllowed: true,
  normalStartupContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  realRuntimePublicationCommitCalled: false,
  realNormalStartupHostCalled: false,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: true,
  liveRegistryMutated: true,
  liveRegistrySwapped: true,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: true,
  launcherAppFactoryCalled: false,
  gameAppFactoryCalled: false,
  launcherAppCreated: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  saveRead: false,
  uiIpcResponseDelivered: false,
  commandDispatched: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
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
  ...overrides
})

const hostEffects = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostEffectSummary> = {}
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostEffectSummary => ({
  appStartupHostCalled: true,
  appStartupHostAccepted: true,
  realAppStartupHostCalled: false,
  launcherAppFactoryCalled: false,
  gameAppFactoryCalled: false,
  launcherAppCreated: false,
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
  diagnosticsWritten: false,
  ...overrides
})

const createReadyReadiness = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult> = {}
): ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult => ({
  kind: 'third-party-runtime-publication-commit-app-startup-readiness-pipeline',
  mode: 'default-disabled-runtime-publication-commit-app-startup-readiness-pipeline',
  status: 'ready',
  reason: 'app startup readiness is satisfied after live-registry swap and normal-startup app-factory binding',
  readOnly: true,
  runtimeOnly: true,
  persistentWrite: false,
  enabled: true,
  runtimePublicationCommitLiveRegistrySwapHostConnectionSourceCalled: true,
  runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSourceCalled: true,
  appStartupReadinessAllowed: true,
  appBootstrapContinuationAllowed: true,
  normalStartupContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: 'swapped',
  runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionStatus: 'ready',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  checks: [],
  diagnostics: [],
  effects: readinessEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult)

const createAcceptedHostResult = (
  envelope: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope,
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult> = {}
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult => ({
  status: 'accepted',
  platform: envelope.platform,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateIdentity: envelope.candidateIdentity,
  candidateHash: envelope.candidateHash,
  lockfileHash: envelope.lockfileHash,
  appStartupReadinessAccepted: true,
  diagnostics: [],
  effects: hostEffects(),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectPathFree = (value: unknown): void => {
  const serialized = JSON.stringify(value)
  if (value && typeof value === 'object') {
    expect('runtimePublicationCommitAppStartupReadiness' in value).toBe(false)
    expect('appStartupHost' in value).toBe(false)
    expect('rawEnvelope' in value).toBe(false)
    expect('candidateRegistrySet' in value).toBe(false)
    expect('candidateSnapshot' in value).toBe(false)
    expect('lockfileDraft' in value).toBe(false)
    expect('programDirectoryPath' in value).toBe(false)
    expect('launcherAppFactory' in value).toBe(false)
    expect('gameAppFactory' in value).toBe(false)
    expect('launcherApp' in value).toBe(false)
    expect('gameApp' in value).toBe(false)
    expect('pinia' in value).toBe(false)
    expect('router' in value).toBe(false)
  }
  expect(serialized).not.toContain('C:/Users')
  expect(serialized).not.toContain('LENOVO')
}

const expectNoRealStartupOrPersistentWrites = (
  result: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult,
  readinessReady: boolean,
  accepted: boolean,
  hostCalled = accepted,
  hostAccepted = accepted
): void => {
  expect(result.appStartupReadinessAllowed).toBe(readinessReady)
  expect(result.appStartupHostWiringAllowed).toBe(accepted)
  expect(result.appBootstrapContinuationAllowed).toBe(accepted)
  expect(result.normalStartupContinuationAllowed).toBe(accepted)
  expect(result.commandContinuationAllowed).toBe(accepted)
  expect(result.uiIpcResultContinuationAllowed).toBe(accepted)
  expect(result.effects.runtimePublicationCommitAcknowledged).toBe(readinessReady)
  expect(result.effects.liveRegistrySwapAcknowledged).toBe(readinessReady)
  expect(result.effects.appFactoryBindingAcknowledged).toBe(readinessReady)
  expect(result.effects.normalStartupHandoffAcknowledged).toBe(readinessReady)
  expect(result.effects.appStartupReadinessAcknowledged).toBe(readinessReady)
  expect(result.effects.appStartupHostCalled).toBe(hostCalled)
  expect(result.effects.appStartupHostAccepted).toBe(hostAccepted)
  expect(result.effects.thirdPartyRegistryPublished).toBe(readinessReady)
  expect(result.effects.liveRegistryMutated).toBe(readinessReady)
  expect(result.effects.liveRegistrySwapped).toBe(readinessReady)
  expect(result.effects.runtimeEnablementAllowed).toBe(readinessReady)
  expect(result.effects.realAppStartupHostCalled).toBe(false)
  expect(result.effects.launcherAppFactoryCalled).toBe(false)
  expect(result.effects.gameAppFactoryCalled).toBe(false)
  expect(result.effects.launcherAppCreated).toBe(false)
  expect(result.effects.gameAppCreated).toBe(false)
  expect(result.effects.piniaCreated).toBe(false)
  expect(result.effects.routerMounted).toBe(false)
  expect(result.effects.saveRead).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party runtime publication commit app startup host connection pipeline', () => {
  it('is disabled by default and reads neither readiness nor host source', async() => {
    const readRuntimePublicationCommitAppStartupReadiness = vi.fn()
    const acknowledgeAppStartupHostWiring = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
      platform: 'electron',
      readRuntimePublicationCommitAppStartupReadiness,
      acknowledgeAppStartupHostWiring
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.runtimePublicationCommitAppStartupReadinessSourceCalled).toBe(false)
    expect(result.appStartupHostConnectionCalled).toBe(false)
    expect(readRuntimePublicationCommitAppStartupReadiness).not.toHaveBeenCalled()
    expect(acknowledgeAppStartupHostWiring).not.toHaveBeenCalled()
    expectNoRealStartupOrPersistentWrites(result, false, false, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('requires an explicit Web or Electron platform before reading startup readiness', async() => {
    const readRuntimePublicationCommitAppStartupReadiness = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
      enabled: true,
      readRuntimePublicationCommitAppStartupReadiness
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.reason).toContain('Web or Electron')
    expect(result.runtimePublicationCommitAppStartupReadinessSourceCalled).toBe(false)
    expect(readRuntimePublicationCommitAppStartupReadiness).not.toHaveBeenCalled()
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.runtime-publication-commit-app-startup-host.missing-platform'
      })
    ])
    expectNoRealStartupOrPersistentWrites(result, false, false, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('accepts a Web/Electron app startup host acknowledgement after app-startup readiness', async() => {
    const calls: string[] = []
    const readRuntimePublicationCommitAppStartupReadiness = vi.fn(async() => {
      calls.push('app-startup-readiness')
      return createReadyReadiness()
    })
    const acknowledgeAppStartupHostWiring = vi.fn(async(
      envelope: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope
    ) => {
      calls.push('app-startup-host')
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.platform).toBe('electron')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.selectedPackageIds).toEqual([packageId])
      expect(envelope.blockedPackageIds).toEqual([])
      expect(envelope.loadOrder).toEqual([packageId])
      expect(envelope.registryCount).toBe(55)
      expect(envelope.entryCount).toBe(4243)
      expect(envelope.packageCount).toBe(1)
      expect(envelope.candidateIdentity).toEqual(candidateIdentity)
      expect(envelope.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.appStartupReadinessAccepted).toBe(true)
      expect('launcherAppFactory' in envelope).toBe(false)
      expect('gameAppFactory' in envelope).toBe(false)
      expect('pinia' in envelope).toBe(false)
      expect('router' in envelope).toBe(false)
      return createAcceptedHostResult(envelope)
    })
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
      enabled: true,
      platform: 'electron',
      readRuntimePublicationCommitAppStartupReadiness,
      acknowledgeAppStartupHostWiring
    })

    const result = await pipeline()

    expect(calls).toEqual(['app-startup-readiness', 'app-startup-host'])
    expect(result.platform).toBe('electron')
    expect(result.status).toBe('accepted')
    expect(result.appStartupReadinessStatus).toBe('ready')
    expect(result.appStartupHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.candidateIdentity).toEqual(candidateIdentity)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expectNoRealStartupOrPersistentWrites(result, true, true)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('propagates real runtime publication commit from readiness through app-startup host acceptance', async() => {
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
      enabled: true,
      platform: 'web',
      readRuntimePublicationCommitAppStartupReadiness: async() => createReadyReadiness({
        effects: readinessEffects({
          realRuntimePublicationCommitCalled: true,
          runtimePublicationCommitted: true
        })
      }),
      acknowledgeAppStartupHostWiring: async envelope =>
        createAcceptedHostResult(envelope)
    })

    const result = await pipeline()

    expect(result.status).toBe('accepted')
    expect(result.effects.realRuntimePublicationCommitCalled).toBe(true)
    expect(result.effects.runtimePublicationCommitted).toBe(true)
    expect(result.effects.realAppStartupHostCalled).toBe(false)
    expect(result.effects.launcherAppCreated).toBe(false)
    expect(result.effects.gameAppCreated).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('propagates real normal-startup host evidence from app-startup readiness', async() => {
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
      enabled: true,
      platform: 'web',
      readRuntimePublicationCommitAppStartupReadiness: async() => createReadyReadiness({
        effects: readinessEffects({
          realNormalStartupHostCalled: true
        })
      }),
      acknowledgeAppStartupHostWiring: async envelope =>
        createAcceptedHostResult(envelope)
    })

    const result = await pipeline()

    expect(result.status).toBe('accepted')
    expect(result.effects.realNormalStartupHostCalled).toBe(true)
    expect(result.effects.realRuntimePublicationCommitCalled).toBe(false)
    expect(result.effects.realAppStartupHostCalled).toBe(false)
    expect(result.effects.gameAppCreated).toBe(false)
    expect(result.effects.piniaCreated).toBe(false)
    expect(result.effects.routerMounted).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('accepts path-free mounted app startup host evidence without exposing runtime handles', async() => {
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
      enabled: true,
      platform: 'web',
      readRuntimePublicationCommitAppStartupReadiness: async() => createReadyReadiness({
        effects: readinessEffects({
          realRuntimePublicationCommitCalled: true,
          runtimePublicationCommitted: true
        })
      }),
      acknowledgeAppStartupHostWiring: async envelope =>
        createAcceptedHostResult(envelope, {
          effects: hostEffects({
            realAppStartupHostCalled: true,
            gameAppCreated: true,
            piniaCreated: true,
            routerMounted: true
          })
        })
    })

    const result = await pipeline()

    expect(result.status).toBe('accepted')
    expect(result.effects.realRuntimePublicationCommitCalled).toBe(true)
    expect(result.effects.runtimePublicationCommitted).toBe(true)
    expect(result.effects.realAppStartupHostCalled).toBe(true)
    expect(result.effects.gameAppCreated).toBe(true)
    expect(result.effects.piniaCreated).toBe(true)
    expect(result.effects.routerMounted).toBe(true)
    expect(result.effects.launcherAppCreated).toBe(false)
    expect(result.effects.saveRead).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('defers host wiring when app-startup readiness is ready but no host is injected', async() => {
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
      enabled: true,
      platform: 'web',
      readRuntimePublicationCommitAppStartupReadiness: async() => createReadyReadiness()
    })

    const result = await pipeline()

    expect(result.platform).toBe('web')
    expect(result.status).toBe('deferred')
    expect(result.appStartupReadinessStatus).toBe('ready')
    expect(result.appStartupHostConnectionCalled).toBe(false)
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'app-startup-readiness-ready',
        status: 'satisfied'
      }),
      expect.objectContaining({
        id: 'app-startup-host-accepted',
        status: 'skipped'
      })
    ]))
    expectNoRealStartupOrPersistentWrites(result, true, false, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('does not call the startup host while readiness is deferred', async() => {
    const acknowledgeAppStartupHostWiring = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
      enabled: true,
      platform: 'electron',
      readRuntimePublicationCommitAppStartupReadiness: async() => createReadyReadiness({
        status: 'deferred',
        reason: 'waiting for app startup readiness',
        appStartupReadinessAllowed: false,
        appBootstrapContinuationAllowed: false,
        normalStartupContinuationAllowed: false,
        commandContinuationAllowed: false,
        uiIpcResultContinuationAllowed: false,
        effects: readinessEffects({
          runtimePublicationCommitAcknowledged: false,
          postCommitVerificationAcknowledged: false,
          liveRegistrySwapAcknowledged: false,
          appFactoryBindingAcknowledged: false,
          normalStartupHandoffAcknowledged: false,
          appStartupReadinessAllowed: false,
          appBootstrapContinuationAllowed: false,
          normalStartupContinuationAllowed: false,
          commandContinuationAllowed: false,
          uiIpcResultContinuationAllowed: false,
          thirdPartyRegistryPublished: false,
          liveRegistryMutated: false,
          liveRegistrySwapped: false,
          runtimeEnablementAllowed: false
        })
      }),
      acknowledgeAppStartupHostWiring
    })

    const result = await pipeline()

    expect(result.status).toBe('deferred')
    expect(result.appStartupHostConnectionCalled).toBe(false)
    expect(acknowledgeAppStartupHostWiring).not.toHaveBeenCalled()
    expectNoRealStartupOrPersistentWrites(result, false, false, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks path-bearing or drifting host acknowledgements without exposing raw handles', async() => {
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
      enabled: true,
      platform: 'electron',
      readRuntimePublicationCommitAppStartupReadiness: async() => createReadyReadiness(),
      acknowledgeAppStartupHostWiring: async(envelope) => createAcceptedHostResult(envelope, {
        targetPackageId: otherPackageId,
        selectedPackageIds: [otherPackageId],
        loadOrder: [otherPackageId],
        candidateHash: testHash('e'),
        rawEnvelope: envelope,
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        effects: hostEffects({
          launcherAppCreated: true
        } as unknown as Partial<ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostEffectSummary>)
      } as unknown as Partial<ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult>)
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.appStartupHostStatus).toBe('accepted')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'app-startup-host-accepted',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'install-target-consistent',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'candidate-identity-consistent',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'package-summary-consistent',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'contained-effects-intact',
        status: 'blocked'
      })
    ]))
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.runtime-publication-commit-app-startup-host.unsafe-host-result',
        packageId
      }),
      expect.objectContaining({
        stage: 'third-party.runtime-publication-commit-app-startup-host.summary-mismatch',
        packageId
      })
    ]))
    expectNoRealStartupOrPersistentWrites(result, true, false, true, true)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('copies package arrays and diagnostics without reading hostile length getters', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/app-startup-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/app-startup-diagnostic')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.app-startup.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline({
      enabled: true,
      platform: 'web',
      readRuntimePublicationCommitAppStartupReadiness: async() => createReadyReadiness({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        diagnostics: createHostileArray([diagnostic], 'diagnostics') as never
      })
    })

    const result = await pipeline()

    expect(result.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.app-startup.proxy-test',
        packageId
      })
    ])
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('hostPath')
    expect(serialized).not.toContain('app-startup-selected-package-ids')
    expectNoRealStartupOrPersistentWrites(result, true, false, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })
})
