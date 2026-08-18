import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackLiveRegistrySwapExecutionEffectSummary,
  ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapExecutionSource'
import {
  createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline,
  type ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationEffectSummary,
  ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline'

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

const liveSwapEffects = (
  overrides: Partial<ThirdPartyDataPackLiveRegistrySwapExecutionEffectSummary> = {}
): ThirdPartyDataPackLiveRegistrySwapExecutionEffectSummary => ({
  liveRegistrySwapExecutionSourceCalled: true,
  liveRegistrySwapProtectionSourceCalled: true,
  injectedLiveRegistrySwapHostCalled: true,
  liveRegistrySwapHostCalled: true,
  liveRegistrySwapHostAccepted: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  thirdPartyRegistryPublished: true,
  liveRegistryMutated: true,
  liveRegistrySwapped: true,
  runtimeEnablementAllowed: true,
  officialRegistryPublished: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
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

const createSwappedLiveRegistry = (
  overrides: Partial<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult> = {}
): ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult => ({
  kind: 'third-party-live-registry-swap-execution-source',
  mode: 'default-disabled-live-registry-swap-execution-source',
  status: 'swapped',
  reason: 'live registry swap execution source accepted a runtime-only host swap acknowledgement',
  runtimeOnly: true,
  persistentWrite: false,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  liveRegistrySwapProtectionStatus: 'deferred',
  liveRegistrySwapHostStatus: 'swapped',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  requiredProtectionIds: [
    'single-assignment-live-registry-reference',
    'previous-registry-identity-retention',
    'candidate-artifact-visibility-barrier',
    'post-swap-verification',
    'rollback-restore-diagnostics'
  ],
  diagnostics: [],
  effects: liveSwapEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult)

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
    expect('runtimePublicationLiveRegistrySwapHostConnection' in value).toBe(false)
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

const expectBoundaryEffects = (
  result: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult,
  swapped: boolean
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(swapped)
  expect(result.commandContinuationAllowed).toBe(swapped)
  expect(result.effects.runtimePublicationCommitAcknowledged).toBe(swapped)
  expect(result.effects.postCommitVerificationAcknowledged).toBe(swapped)
  expect(result.effects.liveRegistrySwapAcknowledged).toBe(swapped)
  expect(result.effects.thirdPartyRegistryPublished).toBe(swapped)
  expect(result.effects.liveRegistryMutated).toBe(swapped)
  expect(result.effects.liveRegistrySwapped).toBe(swapped)
  expect(result.effects.runtimeEnablementAllowed).toBe(swapped)
  expect(result.effects.realRuntimePublicationCommitCalled).toBe(false)
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

describe('third-party runtime publication commit live registry swap host connection pipeline', () => {
  it('is disabled by default and reads neither commit nor live registry swap sources', async() => {
    const readRuntimePublicationCommitAfterPostCommitVerification = vi.fn()
    const readRuntimePublicationLiveRegistrySwapHostConnection = vi.fn()
    const pipeline =
      createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline({
        readRuntimePublicationCommitAfterPostCommitVerification,
        readRuntimePublicationLiveRegistrySwapHostConnection
      })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.runtimePublicationCommitAfterPostCommitVerificationSourceCalled).toBe(false)
    expect(result.runtimePublicationLiveRegistrySwapHostConnectionSourceCalled).toBe(false)
    expect(readRuntimePublicationCommitAfterPostCommitVerification).not.toHaveBeenCalled()
    expect(readRuntimePublicationLiveRegistrySwapHostConnection).not.toHaveBeenCalled()
    expectBoundaryEffects(result, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('requires post-commit runtime publication commit before live registry swap host connection', async() => {
    const calls: string[] = []
    const readRuntimePublicationCommitAfterPostCommitVerification = vi.fn(async() => {
      calls.push('runtime-publication-commit-after-post-commit')
      return createAcceptedCommit()
    })
    const readRuntimePublicationLiveRegistrySwapHostConnection = vi.fn(async() => {
      calls.push('runtime-publication-live-registry-swap-host-connection')
      return createSwappedLiveRegistry()
    })
    const pipeline =
      createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline({
        enabled: true,
        readRuntimePublicationCommitAfterPostCommitVerification,
        readRuntimePublicationLiveRegistrySwapHostConnection
      })

    const result = await pipeline()

    expect(calls).toEqual([
      'runtime-publication-commit-after-post-commit',
      'runtime-publication-live-registry-swap-host-connection'
    ])
    expect(result.status).toBe('swapped')
    expect(result.runtimePublicationCommitAfterPostCommitVerificationStatus).toBe('accepted')
    expect(result.liveRegistrySwapStatus).toBe('swapped')
    expect(result.liveRegistrySwapHostStatus).toBe('swapped')
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
    expect(result.committedTransactionId).toBe('install-transaction-1')
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expectBoundaryEffects(result, true)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('does not evaluate live registry swap while post-commit runtime publication commit is deferred', async() => {
    const readRuntimePublicationLiveRegistrySwapHostConnection = vi.fn()
    const pipeline =
      createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline({
        enabled: true,
        readRuntimePublicationCommitAfterPostCommitVerification: async() => createAcceptedCommit({
          status: 'deferred',
          reason: 'waiting for post-commit verification',
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
        readRuntimePublicationLiveRegistrySwapHostConnection
      })

    const result = await pipeline()

    expect(result.status).toBe('deferred')
    expect(result.runtimePublicationLiveRegistrySwapHostConnectionSourceCalled).toBe(false)
    expect(readRuntimePublicationLiveRegistrySwapHostConnection).not.toHaveBeenCalled()
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'runtime-publication-commit-after-post-commit-accepted',
        status: 'blocked'
      })
    ]))
    expectBoundaryEffects(result, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks live registry summary drift after accepted post-commit runtime publication commit', async() => {
    const pipeline =
      createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline({
        enabled: true,
        readRuntimePublicationCommitAfterPostCommitVerification: async() => createAcceptedCommit(),
        readRuntimePublicationLiveRegistrySwapHostConnection: async() => createSwappedLiveRegistry({
          targetPackageId: otherPackageId,
          selectedPackageIds: [otherPackageId],
          loadOrder: [otherPackageId],
          candidateIdentity: {
            ...candidateIdentity,
            candidateHash: testHash('f')
          },
          lockfileHash: testHash('9')
        })
      })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.liveRegistrySwapStatus).toBe('swapped')
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
        stage: 'third-party.runtime-publication-commit-live-registry-swap.summary-mismatch',
        packageId
      })
    ]))
    expectBoundaryEffects(result, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks path-bearing live registry swap results without exposing raw paths', async() => {
    const pipeline =
      createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline({
        enabled: true,
        readRuntimePublicationCommitAfterPostCommitVerification: async() => createAcceptedCommit(),
        readRuntimePublicationLiveRegistrySwapHostConnection: async() => createSwappedLiveRegistry({
          programDirectoryPath: 'C:/Users/LENOVO/AppData/Local/taoyuan/userdata',
          effects: {
            ...liveSwapEffects(),
            commandDispatched: true
          } as unknown as ThirdPartyDataPackLiveRegistrySwapExecutionEffectSummary
        } as unknown as Partial<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult>)
      })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'live-registry-swap-host-swapped',
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
    expectBoundaryEffects(result, false)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })
})
