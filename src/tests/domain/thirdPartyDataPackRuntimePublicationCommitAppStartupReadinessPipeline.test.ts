import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type { ThirdPartyCandidateIdentitySummary } from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline,
  type ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionEffectSummary,
  ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionEffectSummary,
  ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline'

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

const liveSwapEffects = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionEffectSummary> = {}
): ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionEffectSummary => ({
  runtimePublicationCommitLiveRegistrySwapHostConnectionPipelineCalled: true,
  runtimePublicationCommitAfterPostCommitVerificationPipelineCalled: true,
  runtimePublicationLiveRegistrySwapHostConnectionPipelineCalled: true,
  runtimePublicationCommitAcknowledged: true,
  postCommitVerificationAcknowledged: true,
  liveRegistrySwapAcknowledged: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  realRuntimePublicationCommitCalled: false,
  thirdPartyRegistryPublished: true,
  liveRegistryMutated: true,
  liveRegistrySwapped: true,
  runtimeEnablementAllowed: true,
  officialRegistryPublished: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
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

const normalStartupEffects = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionEffectSummary> = {}
): ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionEffectSummary => ({
  runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineCalled: true,
  runtimePublicationCommitAfterPostCommitVerificationPipelineCalled: true,
  normalStartupAppFactoryBindingHostConnectionPipelineCalled: true,
  runtimePublicationCommitAcknowledged: true,
  postCommitVerificationAcknowledged: true,
  appFactoryBindingAcknowledged: true,
  normalStartupHandoffAcknowledged: true,
  appBootstrapContinuationAllowed: true,
  normalStartupContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  realRuntimePublicationCommitCalled: false,
  realNormalStartupHostCalled: false,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
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

const createSwappedLiveRegistry = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult> = {}
): ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult => ({
  kind: 'third-party-runtime-publication-commit-live-registry-swap-host-connection-pipeline',
  mode: 'default-disabled-runtime-publication-commit-live-registry-swap-host-connection-pipeline',
  status: 'swapped',
  reason: 'live registry swap host connection is swapped after accepted post-commit runtime publication',
  readOnly: true,
  enabled: true,
  runtimePublicationCommitAfterPostCommitVerificationSourceCalled: true,
  runtimePublicationLiveRegistrySwapHostConnectionSourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  runtimePublicationCommitAfterPostCommitVerificationStatus: 'accepted',
  liveRegistrySwapStatus: 'swapped',
  liveRegistrySwapHostStatus: 'swapped',
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
  transactionId: 'install-transaction-1',
  committedTransactionId: 'install-transaction-1',
  committedTransactionLogEntryHash: testHash('e'),
  checks: [],
  diagnostics: [],
  effects: liveSwapEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult)

const createReadyNormalStartup = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult> = {}
): ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult => ({
  kind: 'third-party-runtime-publication-commit-normal-startup-app-factory-binding-host-connection-pipeline',
  mode: 'default-disabled-runtime-publication-commit-normal-startup-app-factory-binding-host-connection-pipeline',
  status: 'ready',
  reason: 'normal startup app-factory binding is ready after accepted runtime publication commit',
  readOnly: true,
  enabled: true,
  runtimePublicationCommitAfterPostCommitVerificationSourceCalled: true,
  normalStartupAppFactoryBindingHostConnectionSourceCalled: true,
  appBootstrapContinuationAllowed: true,
  normalStartupContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  runtimePublicationCommitAfterPostCommitVerificationStatus: 'accepted',
  normalStartupAppFactoryBindingHostConnectionStatus: 'ready',
  normalStartupHandoffHostStatus: 'accepted',
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
  effects: normalStartupEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult)

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectPathFree = (value: unknown): void => {
  const serialized = JSON.stringify(value)
  if (value && typeof value === 'object') {
    expect('runtimePublicationCommitLiveRegistrySwapHostConnection' in value).toBe(false)
    expect('runtimePublicationCommitNormalStartupAppFactoryBindingHostConnection' in value).toBe(false)
    expect('candidateRegistrySet' in value).toBe(false)
    expect('candidateSnapshot' in value).toBe(false)
    expect('lockfileDraft' in value).toBe(false)
    expect('programDirectoryPath' in value).toBe(false)
    expect('liveRegistryReference' in value).toBe(false)
    expect('launcherApp' in value).toBe(false)
    expect('gameApp' in value).toBe(false)
    expect('pinia' in value).toBe(false)
    expect('router' in value).toBe(false)
  }
  expect(serialized).not.toContain('C:/Users')
  expect(serialized).not.toContain('LENOVO')
}

const expectNoRealAppStartupOrPersistentWrites = (
  result: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult,
  ready: boolean
): void => {
  expect(result.appStartupReadinessAllowed).toBe(ready)
  expect(result.appBootstrapContinuationAllowed).toBe(ready)
  expect(result.normalStartupContinuationAllowed).toBe(ready)
  expect(result.commandContinuationAllowed).toBe(ready)
  expect(result.uiIpcResultContinuationAllowed).toBe(ready)
  expect(result.effects.runtimePublicationCommitAcknowledged).toBe(ready)
  expect(result.effects.liveRegistrySwapAcknowledged).toBe(ready)
  expect(result.effects.appFactoryBindingAcknowledged).toBe(ready)
  expect(result.effects.normalStartupHandoffAcknowledged).toBe(ready)
  expect(result.effects.thirdPartyRegistryPublished).toBe(ready)
  expect(result.effects.liveRegistryMutated).toBe(ready)
  expect(result.effects.liveRegistrySwapped).toBe(ready)
  expect(result.effects.runtimeEnablementAllowed).toBe(ready)
  expect(result.effects.realRuntimePublicationCommitCalled).toBe(false)
  expect(result.effects.realNormalStartupHostCalled).toBe(false)
  expect(result.effects.launcherAppCreated).toBe(false)
  expect(result.effects.gameAppCreated).toBe(false)
  expect(result.effects.piniaCreated).toBe(false)
  expect(result.effects.routerMounted).toBe(false)
  expect(result.effects.saveRead).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party runtime publication commit app startup readiness pipeline', () => {
  it('is disabled by default and reads neither startup prerequisite source', async() => {
    const readRuntimePublicationCommitLiveRegistrySwapHostConnection = vi.fn()
    const readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline({
      readRuntimePublicationCommitLiveRegistrySwapHostConnection,
      readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.runtimePublicationCommitLiveRegistrySwapHostConnectionSourceCalled).toBe(false)
    expect(result.runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSourceCalled).toBe(false)
    expect(readRuntimePublicationCommitLiveRegistrySwapHostConnection).not.toHaveBeenCalled()
    expect(readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection).not.toHaveBeenCalled()
    expectNoRealAppStartupOrPersistentWrites(result, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('requires live registry swap before normal startup app-factory binding readiness', async() => {
    const calls: string[] = []
    const readRuntimePublicationCommitLiveRegistrySwapHostConnection = vi.fn(async() => {
      calls.push('runtime-publication-commit-live-registry-swap')
      return createSwappedLiveRegistry()
    })
    const readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection = vi.fn(async() => {
      calls.push('runtime-publication-commit-normal-startup-app-factory-binding')
      return createReadyNormalStartup()
    })
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline({
      enabled: true,
      readRuntimePublicationCommitLiveRegistrySwapHostConnection,
      readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection
    })

    const result = await pipeline()

    expect(calls).toEqual([
      'runtime-publication-commit-live-registry-swap',
      'runtime-publication-commit-normal-startup-app-factory-binding'
    ])
    expect(result.status).toBe('ready')
    expect(result.runtimePublicationCommitLiveRegistrySwapHostConnectionStatus).toBe('swapped')
    expect(result.runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionStatus).toBe('ready')
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
    expectNoRealAppStartupOrPersistentWrites(result, true)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('does not evaluate normal startup while live registry swap is deferred', async() => {
    const readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline({
      enabled: true,
      readRuntimePublicationCommitLiveRegistrySwapHostConnection: async() => createSwappedLiveRegistry({
        status: 'deferred',
        reason: 'waiting for live registry swap host acknowledgement',
        appBootstrapContinuationAllowed: false,
        commandContinuationAllowed: false,
        effects: liveSwapEffects({
          liveRegistrySwapAcknowledged: false,
          appBootstrapContinuationAllowed: false,
          commandContinuationAllowed: false,
          thirdPartyRegistryPublished: false,
          liveRegistryMutated: false,
          liveRegistrySwapped: false,
          runtimeEnablementAllowed: false
        })
      }),
      readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection
    })

    const result = await pipeline()

    expect(result.status).toBe('deferred')
    expect(result.runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSourceCalled).toBe(false)
    expect(readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection).not.toHaveBeenCalled()
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'live-registry-swap-after-commit-swapped',
        status: 'blocked'
      })
    ]))
    expectNoRealAppStartupOrPersistentWrites(result, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks normal startup drift after live registry swap readiness', async() => {
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline({
      enabled: true,
      readRuntimePublicationCommitLiveRegistrySwapHostConnection: async() => createSwappedLiveRegistry(),
      readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection: async() => createReadyNormalStartup({
        targetPackageId: otherPackageId,
        selectedPackageIds: [otherPackageId],
        loadOrder: [otherPackageId],
        candidateIdentity: {
          ...candidateIdentity,
          candidateHash: testHash('f')
        },
        candidateHash: testHash('f'),
        lockfileHash: testHash('9')
      })
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionStatus).toBe('ready')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'install-target-consistent',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'candidate-identity-consistent',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'lockfile-hash-consistent',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'package-summary-consistent',
        status: 'blocked'
      })
    ]))
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.runtime-publication-commit-app-startup-readiness.summary-mismatch',
        packageId
      })
    ]))
    expectNoRealAppStartupOrPersistentWrites(result, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks path-bearing normal startup results without exposing raw paths', async() => {
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline({
      enabled: true,
      readRuntimePublicationCommitLiveRegistrySwapHostConnection: async() => createSwappedLiveRegistry(),
      readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection: async() => createReadyNormalStartup({
        programDirectoryPath: 'C:/Users/LENOVO/AppData/Local/taoyuan/userdata',
        effects: normalStartupEffects({
          saveRead: true
        } as unknown as Partial<ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionEffectSummary>)
      } as unknown as Partial<ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult>)
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'normal-startup-app-factory-binding-after-commit-ready',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'contained-effects-intact',
        status: 'blocked'
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('programDirectoryPath')
    expectNoRealAppStartupOrPersistentWrites(result, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })
})
