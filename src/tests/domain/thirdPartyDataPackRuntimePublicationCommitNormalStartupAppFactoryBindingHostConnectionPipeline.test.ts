import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline,
  type ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationEffectSummary,
  ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline'
import type {
  ThirdPartyDataPackNormalStartupHandoffExecutionSourceEffectSummary,
  ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult
} from '@/domain/mods/thirdPartyDataPackNormalStartupHandoffExecutionSource'

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

const commitEffects = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationEffectSummary> = {}
): ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationEffectSummary => ({
  runtimePublicationCommitAfterPostCommitVerificationPipelineCalled: true,
  postCommitVerificationAfterInstallTransactionCommitPipelineCalled: true,
  runtimePublicationCommitPipelineCalled: true,
  runtimePublicationCommitHostAccepted: true,
  transactionCommitted: true,
  transactionLogCommitted: true,
  postCommitVerificationAcknowledged: true,
  persistentReadProofAcknowledged: true,
  runtimePublicationCommitAcknowledged: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  realRuntimePublicationCommitCalled: false,
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
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  transactionLogPrepared: true,
  transactionLogWritten: true,
  transactionLogRead: true,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
  packageFilesWritten: true,
  packageBackupsWritten: true,
  packageFilesRestored: false,
  lockfileWritten: true,
  lockfileRestored: false,
  settingsWritten: true,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false,
  ...overrides
})

const normalStartupEffects = (
  overrides: Record<string, boolean> = {}
): ThirdPartyDataPackNormalStartupHandoffExecutionSourceEffectSummary => ({
  normalStartupHandoffExecutionSourceCalled: true,
  startupGateBootstrapSourceCalled: true,
  injectedNormalStartupHandoffHostCalled: true,
  normalStartupHandoffHostCalled: true,
  normalStartupHandoffHostAccepted: true,
  realNormalStartupHostCalled: false,
  normalStartupContinuationAllowed: true,
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
  diagnosticsWritten: false,
  ...overrides
})

const createAcceptedCommit = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult> = {}
): ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult => ({
  kind: 'third-party-runtime-publication-commit-after-post-commit-verification-pipeline',
  mode: 'default-disabled-runtime-publication-commit-after-post-commit-verification-pipeline',
  status: 'accepted',
  reason: 'runtime publication commit accepted after committed post-commit verification',
  readOnly: true,
  enabled: true,
  postCommitVerificationAfterInstallTransactionCommitSourceCalled: true,
  runtimePublicationCommitSourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  postCommitVerificationAfterInstallTransactionCommitStatus: 'ready',
  runtimePublicationCommitStatus: 'accepted',
  runtimePublicationCommitHostStatus: 'accepted',
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
  effects: commitEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult)

const createReadyNormalStartup = (
  overrides: Partial<ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult> = {}
): ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult => ({
  kind: 'third-party-normal-startup-handoff-execution-source',
  mode: 'default-disabled-normal-startup-handoff-execution-source',
  status: 'ready',
  reason: 'normal startup handoff accepted',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  normalStartupContinuationAllowed: true,
  startupGateBootstrapSourceStatus: 'ready',
  normalStartupHandoffHostStatus: 'accepted',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  lockfileHash,
  persistentStateProofs: {
    transactionLogCommitted: true,
    packageStateMatched: true,
    settingsStateMatched: true,
    modLockStateMatched: true,
    liveRegistryMatched: true,
    saveCacheIsolated: true
  },
  diagnostics: [],
  summary: {
    selectedPackageCount: 1,
    blockedPackageCount: 0,
    blockedCandidateCount: 0,
    loadOrderCount: 1,
    registryCount: 55,
    entryCount: 4243,
    packageCount: 1,
    diagnosticCount: 0
  },
  effects: normalStartupEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult)

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectPathFree = (value: unknown): void => {
  const serialized = JSON.stringify(value)
  if (value && typeof value === 'object') {
    expect('runtimePublicationCommitAfterPostCommitVerification' in value).toBe(false)
    expect('normalStartupAppFactoryBindingHostConnection' in value).toBe(false)
    expect('candidateRegistrySet' in value).toBe(false)
    expect('candidateSnapshot' in value).toBe(false)
    expect('lockfileDraft' in value).toBe(false)
    expect('programDirectoryPath' in value).toBe(false)
    expect('launcherApp' in value).toBe(false)
    expect('gameApp' in value).toBe(false)
    expect('pinia' in value).toBe(false)
    expect('router' in value).toBe(false)
  }
  expect(serialized).not.toContain('C:/Users')
  expect(serialized).not.toContain('LENOVO')
}

const expectNoRealStartupOrWrites = (
  result: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult,
  ready: boolean
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(ready)
  expect(result.normalStartupContinuationAllowed).toBe(ready)
  expect(result.commandContinuationAllowed).toBe(ready)
  expect(result.uiIpcResultContinuationAllowed).toBe(ready)
  expect(result.effects.runtimePublicationCommitAcknowledged).toBe(ready)
  expect(result.effects.appFactoryBindingAcknowledged).toBe(ready)
  expect(result.effects.normalStartupHandoffAcknowledged).toBe(ready)
  expect(result.effects.realRuntimePublicationCommitCalled).toBe(false)
  expect(result.effects.realNormalStartupHostCalled).toBe(false)
  expect(result.effects.liveRegistryMutated).toBe(false)
  expect(result.effects.liveRegistrySwapped).toBe(false)
  expect(result.effects.launcherAppCreated).toBe(false)
  expect(result.effects.gameAppCreated).toBe(false)
  expect(result.effects.piniaCreated).toBe(false)
  expect(result.effects.routerMounted).toBe(false)
  expect(result.effects.saveRead).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party runtime publication commit normal startup app-factory binding host connection pipeline', () => {
  it('is disabled by default and reads neither commit nor normal startup sources', async() => {
    const readRuntimePublicationCommitAfterPostCommitVerification = vi.fn()
    const readRuntimePublicationNormalStartupAppFactoryBindingHostConnection = vi.fn()
    const pipeline =
      createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline({
        readRuntimePublicationCommitAfterPostCommitVerification,
        readRuntimePublicationNormalStartupAppFactoryBindingHostConnection
      })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.runtimePublicationCommitAfterPostCommitVerificationSourceCalled).toBe(false)
    expect(result.normalStartupAppFactoryBindingHostConnectionSourceCalled).toBe(false)
    expect(readRuntimePublicationCommitAfterPostCommitVerification).not.toHaveBeenCalled()
    expect(readRuntimePublicationNormalStartupAppFactoryBindingHostConnection).not.toHaveBeenCalled()
    expectNoRealStartupOrWrites(result, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('requires accepted runtime publication commit before normal startup app-factory binding', async() => {
    const calls: string[] = []
    const readRuntimePublicationCommitAfterPostCommitVerification = vi.fn(async() => {
      calls.push('runtime-publication-commit-after-post-commit')
      return createAcceptedCommit()
    })
    const readRuntimePublicationNormalStartupAppFactoryBindingHostConnection = vi.fn(async() => {
      calls.push('normal-startup-app-factory-binding')
      return createReadyNormalStartup()
    })
    const pipeline =
      createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline({
        enabled: true,
        readRuntimePublicationCommitAfterPostCommitVerification,
        readRuntimePublicationNormalStartupAppFactoryBindingHostConnection
      })

    const result = await pipeline()

    expect(calls).toEqual([
      'runtime-publication-commit-after-post-commit',
      'normal-startup-app-factory-binding'
    ])
    expect(result.status).toBe('ready')
    expect(result.runtimePublicationCommitAfterPostCommitVerificationStatus).toBe('accepted')
    expect(result.normalStartupAppFactoryBindingHostConnectionStatus).toBe('ready')
    expect(result.normalStartupHandoffHostStatus).toBe('accepted')
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
    expectNoRealStartupOrWrites(result, true)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('propagates real normal-startup host evidence without exposing app or router handles', async() => {
    const pipeline =
      createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline({
        enabled: true,
        readRuntimePublicationCommitAfterPostCommitVerification: async() => createAcceptedCommit(),
        readRuntimePublicationNormalStartupAppFactoryBindingHostConnection: async() => createReadyNormalStartup({
          effects: normalStartupEffects({
            injectedNormalStartupHandoffHostCalled: false,
            realNormalStartupHostCalled: true
          })
        })
      })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.realNormalStartupHostCalled).toBe(true)
    expect(result.effects.realRuntimePublicationCommitCalled).toBe(false)
    expect(result.effects.launcherAppCreated).toBe(false)
    expect(result.effects.gameAppCreated).toBe(false)
    expect(result.effects.piniaCreated).toBe(false)
    expect(result.effects.routerMounted).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('does not evaluate normal startup while runtime publication commit is deferred', async() => {
    const readRuntimePublicationNormalStartupAppFactoryBindingHostConnection = vi.fn()
    const pipeline =
      createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline({
        enabled: true,
        readRuntimePublicationCommitAfterPostCommitVerification: async() => createAcceptedCommit({
          status: 'deferred',
          reason: 'waiting for runtime publication commit',
          appBootstrapContinuationAllowed: false,
          commandContinuationAllowed: false,
          uiIpcResultContinuationAllowed: false,
          effects: commitEffects({
            runtimePublicationCommitHostAccepted: false,
            runtimePublicationCommitAcknowledged: false,
            appBootstrapContinuationAllowed: false,
            commandContinuationAllowed: false,
            uiIpcResultContinuationAllowed: false
          })
        }),
        readRuntimePublicationNormalStartupAppFactoryBindingHostConnection
      })

    const result = await pipeline()

    expect(result.status).toBe('deferred')
    expect(result.normalStartupAppFactoryBindingHostConnectionSourceCalled).toBe(false)
    expect(readRuntimePublicationNormalStartupAppFactoryBindingHostConnection).not.toHaveBeenCalled()
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'runtime-publication-commit-after-post-commit-accepted',
        status: 'blocked'
      })
    ]))
    expectNoRealStartupOrWrites(result, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks normal startup summary drift after accepted runtime publication commit', async() => {
    const pipeline =
      createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline({
        enabled: true,
        readRuntimePublicationCommitAfterPostCommitVerification: async() => createAcceptedCommit(),
        readRuntimePublicationNormalStartupAppFactoryBindingHostConnection: async() => createReadyNormalStartup({
          targetPackageId: otherPackageId,
          selectedPackageIds: [otherPackageId],
          loadOrder: [otherPackageId],
          lockfileHash: testHash('f')
        })
      })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.normalStartupAppFactoryBindingHostConnectionStatus).toBe('ready')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'install-target-consistent',
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
        stage: 'third-party.runtime-publication-commit-normal-startup-app-factory-binding.summary-mismatch',
        packageId
      })
    ]))
    expectNoRealStartupOrWrites(result, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks path-bearing normal startup results without exposing raw paths', async() => {
    const pipeline =
      createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline({
        enabled: true,
        readRuntimePublicationCommitAfterPostCommitVerification: async() => createAcceptedCommit(),
        readRuntimePublicationNormalStartupAppFactoryBindingHostConnection: async() => createReadyNormalStartup({
          programDirectoryPath: 'C:/Users/LENOVO/AppData/Local/taoyuan/userdata',
          effects: normalStartupEffects({
            saveRead: true
          })
        } as unknown as Partial<ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult>)
      })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'normal-startup-app-factory-binding-ready',
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
    expectNoRealStartupOrWrites(result, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })
})
