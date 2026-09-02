import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitEffectSummary,
  ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline,
  type ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline'
import type {
  ThirdPartyDataPackRuntimePublicationCommitSourceEffectSummary,
  ThirdPartyDataPackRuntimePublicationCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitSource'

const packageId = 'sample_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const lockfileHash = testHash('d')
const transactionLogEntryHash = testHash('e')

const postCommitEffects = (
  overrides: Record<string, unknown> = {}
): ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitEffectSummary => ({
  postCommitVerificationAfterInstallTransactionCommitPipelineCalled: true,
  installTransactionCommitFinalizationPipelineCalled: true,
  postCommitVerificationReadAcknowledgementPipelineCalled: true,
  transactionCommitted: true,
  transactionLogCommitted: true,
  postCommitVerificationAcknowledged: true,
  persistentReadProofAcknowledged: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
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
} as unknown as ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitEffectSummary)

const runtimeCommitEffects = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitSourceEffectSummary> = {}
): ThirdPartyDataPackRuntimePublicationCommitSourceEffectSummary => ({
  runtimePublicationCommitSourceCalled: true,
  runtimePublicationCommitAdapterSourceCalled: true,
  injectedRuntimePublicationCommitHostCalled: true,
  runtimePublicationCommitHostCalled: true,
  runtimePublicationCommitHostAccepted: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
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

const createReadyPostCommit = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult> = {}
): ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult => ({
  kind: 'third-party-post-commit-verification-after-install-transaction-commit-pipeline',
  mode: 'default-disabled-post-commit-verification-after-install-transaction-commit-pipeline',
  status: 'ready',
  reason: 'ready committed transaction and post-commit verification',
  readOnly: true,
  enabled: true,
  installTransactionCommitFinalizationSourceCalled: true,
  postCommitVerificationReadAcknowledgementSourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  installTransactionCommitFinalizationStatus: 'committed',
  postCommitVerificationReadAcknowledgementStatus: 'ready',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  verificationOutcomeKind: 'verified',
  transactionLogMatched: true,
  packageStateMatched: true,
  settingsLockfileMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true,
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
  committedTransactionLogEntryHash: transactionLogEntryHash,
  checks: [],
  diagnostics: [],
  effects: postCommitEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult)

const createAcceptedRuntimeCommit = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitSourceResult> = {}
): ThirdPartyDataPackRuntimePublicationCommitSourceResult => ({
  kind: 'third-party-runtime-publication-commit-source',
  mode: 'default-disabled-runtime-publication-commit-source',
  status: 'accepted',
  reason: 'runtime publication commit host accepted',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  runtimePublicationCommitHostStatus: 'accepted',
  injectedRuntimePublicationHostMode: 'injected-test-only',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  runtimePublicationCommitAdapterStatus: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  transactionPreCommitPlanStatus: 'deferred',
  liveRegistrySwapProtectionStatus: 'deferred',
  publicationRollbackRecoveryStatus: 'deferred',
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  commitStageSummaries: [],
  requiredCommitAdapterIds: [],
  diagnostics: [],
  effects: runtimeCommitEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackRuntimePublicationCommitSourceResult)

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectContainedBoundary = (
  result: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult,
  accepted: boolean
): void => {
  expect(result.readOnly).toBe(true)
  expect(result.appBootstrapContinuationAllowed).toBe(accepted)
  expect(result.commandContinuationAllowed).toBe(accepted)
  expect(result.uiIpcResultContinuationAllowed).toBe(accepted)
  expect(result.effects.transactionCommitted).toBe(accepted)
  expect(result.effects.postCommitVerificationAcknowledged).toBe(accepted)
  expect(result.effects.runtimePublicationCommitAcknowledged).toBe(accepted)
  expect(result.effects.realRuntimePublicationCommitCalled).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.liveRegistryMutated).toBe(false)
  expect(result.effects.liveRegistrySwapped).toBe(false)
  expect(result.effects.candidateRegistryExposed).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect('postCommitVerificationAfterInstallTransactionCommit' in result).toBe(false)
  expect('runtimePublicationCommit' in result).toBe(false)
  expect('candidateRegistrySet' in result).toBe(false)
  expect('programDirectoryPath' in result).toBe(false)
}

describe('third-party runtime publication commit after post-commit verification pipeline', () => {
  it('is disabled by default and does not read either source', async() => {
    const readPostCommitVerificationAfterInstallTransactionCommit = vi.fn()
    const readRuntimePublicationCommit = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline({
      readPostCommitVerificationAfterInstallTransactionCommit,
      readRuntimePublicationCommit
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.postCommitVerificationAfterInstallTransactionCommitSourceCalled).toBe(false)
    expect(result.runtimePublicationCommitSourceCalled).toBe(false)
    expect(readPostCommitVerificationAfterInstallTransactionCommit).not.toHaveBeenCalled()
    expect(readRuntimePublicationCommit).not.toHaveBeenCalled()
    expectContainedBoundary(result, false)
    expectJsonGraphFrozen(result)
  })

  it('defers runtime publication until committed post-commit verification is ready', async() => {
    const readPostCommitVerificationAfterInstallTransactionCommit = vi.fn(async() => createReadyPostCommit({
      status: 'deferred',
      reason: 'waiting for post-commit verification readback',
      effects: postCommitEffects({
        transactionCommitted: false,
        transactionLogCommitted: false,
        postCommitVerificationAcknowledged: false,
        persistentReadProofAcknowledged: false,
        appBootstrapContinuationAllowed: false,
        commandContinuationAllowed: false,
        uiIpcResultContinuationAllowed: false
      })
    }))
    const readRuntimePublicationCommit = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline({
      enabled: true,
      readPostCommitVerificationAfterInstallTransactionCommit,
      readRuntimePublicationCommit
    })

    const result = await pipeline()

    expect(result.status).toBe('deferred')
    expect(result.postCommitVerificationAfterInstallTransactionCommitStatus).toBe('deferred')
    expect(result.runtimePublicationCommitSourceCalled).toBe(false)
    expect(readRuntimePublicationCommit).not.toHaveBeenCalled()
    expectContainedBoundary(result, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts runtime publication commit only after ready post-commit verification', async() => {
    const calls: string[] = []
    const readPostCommitVerificationAfterInstallTransactionCommit = vi.fn(async() => {
      calls.push('post-commit-after-transaction')
      return createReadyPostCommit()
    })
    const readRuntimePublicationCommit = vi.fn(async() => {
      calls.push('runtime-publication-commit')
      return createAcceptedRuntimeCommit()
    })
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline({
      enabled: true,
      readPostCommitVerificationAfterInstallTransactionCommit,
      readRuntimePublicationCommit
    })

    const result = await pipeline()

    expect(calls).toEqual([
      'post-commit-after-transaction',
      'runtime-publication-commit'
    ])
    expect(result.status).toBe('accepted')
    expect(result.postCommitVerificationAfterInstallTransactionCommitStatus).toBe('ready')
    expect(result.runtimePublicationCommitStatus).toBe('accepted')
    expect(result.runtimePublicationCommitHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.transactionId).toBe('install-transaction-1')
    expect(result.committedTransactionId).toBe('install-transaction-1')
    expect(result.committedTransactionLogEntryHash).toBe(transactionLogEntryHash)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(readPostCommitVerificationAfterInstallTransactionCommit).toHaveBeenCalledOnce()
    expect(readRuntimePublicationCommit).toHaveBeenCalledOnce()
    expectContainedBoundary(result, true)
    expectJsonGraphFrozen(result)
  })

  it('propagates real runtime publication commit effects after ready post-commit verification', async() => {
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline({
      enabled: true,
      readPostCommitVerificationAfterInstallTransactionCommit: async() => createReadyPostCommit(),
      readRuntimePublicationCommit: async() => createAcceptedRuntimeCommit({
        effects: runtimeCommitEffects({
          realRuntimePublicationCommitCalled: true,
          runtimePublicationCommitted: true
        })
      })
    })

    const result = await pipeline()

    expect(result.status).toBe('accepted')
    expect(result.effects.realRuntimePublicationCommitCalled).toBe(true)
    expect(result.effects.runtimePublicationCommitted).toBe(true)
    expect(result.effects.liveRegistrySwapped).toBe(false)
    expect(result.effects.uiIpcResponseDelivered).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(true)
    expect(result.effects.lockfileWritten).toBe(true)
    expect(result.effects.settingsWritten).toBe(true)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('blocks runtime publication commit summary drift after post-commit verification', async() => {
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline({
      enabled: true,
      readPostCommitVerificationAfterInstallTransactionCommit: async() => createReadyPostCommit(),
      readRuntimePublicationCommit: async() => createAcceptedRuntimeCommit({
        targetPackageId: 'other_pack' as PackageId,
        candidateIdentity: {
          ...candidateIdentity,
          candidateHash: testHash('f')
        },
        lockfileHash: testHash('1'),
        selectedPackageIds: ['other_pack' as PackageId],
        loadOrder: ['other_pack' as PackageId]
      })
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
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
        stage: 'third-party.runtime-publication-commit-after-post-commit-verification.summary-mismatch',
        packageId
      })
    ]))
    expectContainedBoundary(result, false)
    expectJsonGraphFrozen(result)
  })

  it('blocks path-bearing post-commit evidence before calling runtime publication', async() => {
    const readRuntimePublicationCommit = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline({
      enabled: true,
      readPostCommitVerificationAfterInstallTransactionCommit: async() => createReadyPostCommit({
        programDirectoryPath: 'C:/Users/LENOVO/AppData/Local/taoyuan/userdata',
        effects: postCommitEffects({
          runtimePublicationCommitted: true
        })
      } as unknown as Partial<ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult>),
      readRuntimePublicationCommit
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.runtimePublicationCommitSourceCalled).toBe(false)
    expect(readRuntimePublicationCommit).not.toHaveBeenCalled()
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'contained-effects-intact',
        status: 'blocked'
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('programDirectoryPath')
    expectContainedBoundary(result, false)
    expectJsonGraphFrozen(result)
  })
})
