import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallTransactionCommitFinalizationEffectSummary,
  ThirdPartyDataPackInstallTransactionCommitFinalizationResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionCommitFinalizationPipeline'
import {
  createThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline,
  type ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline'
import type {
  ThirdPartyDataPackPostCommitPersistentReadsProofs
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentReadsSource'
import type {
  ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceEffectSummary,
  ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationReadAcknowledgementSource'

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

const persistentReadProofs: ThirdPartyDataPackPostCommitPersistentReadsProofs = {
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true
}

const summary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
}

const finalizationEffects = (
  overrides: Record<string, unknown> = {}
): ThirdPartyDataPackInstallTransactionCommitFinalizationEffectSummary => ({
  installTransactionCommitFinalizationPipelineCalled: true,
  installTransactionLogPreparedPersistentReadVerificationPipelineCalled: true,
  transactionLogPrepareAcknowledged: true,
  transactionLogReadVerificationAcknowledged: true,
  transactionCommitFinalizationAuthorized: true,
  transactionCommitted: true,
  transactionLogCommitted: true,
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
} as unknown as ThirdPartyDataPackInstallTransactionCommitFinalizationEffectSummary)

const acknowledgementEffects = (
  overrides: Record<string, unknown> = {}
): ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceEffectSummary => ({
  postCommitVerificationReadAcknowledgementSourceCalled: true,
  postCommitVerificationExecutorSourceCalled: true,
  postCommitPersistentVerificationReadSourceCalled: true,
  postCommitVerificationExecutorAccepted: true,
  persistentVerificationReadAccepted: true,
  verifiedOutcomeAcknowledged: true,
  persistentReadProofAcknowledged: true,
  realPostCommitVerificationAcknowledgementHostCalled: false,
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
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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
} as unknown as ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceEffectSummary)

const createCommittedFinalization = (
  overrides: Partial<ThirdPartyDataPackInstallTransactionCommitFinalizationResult> = {}
): ThirdPartyDataPackInstallTransactionCommitFinalizationResult => ({
  kind: 'third-party-install-transaction-commit-finalization-pipeline',
  mode: 'default-disabled-install-transaction-commit-finalization-pipeline',
  status: 'committed',
  reason: 'committed transaction acknowledgement',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  authorized: true,
  preparedReadVerificationStatus: 'verified',
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
  transactionLogEntryHash,
  readTransactionLogEntryHash: transactionLogEntryHash,
  committedTransactionId: 'install-transaction-1',
  committedTransactionLogEntryHash: transactionLogEntryHash,
  checks: [],
  diagnostics: [],
  effects: finalizationEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackInstallTransactionCommitFinalizationResult)

const createReadyAcknowledgement = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult> = {}
): ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult => ({
  kind: 'third-party-post-commit-verification-read-acknowledgement-source',
  mode: 'default-disabled-post-commit-verification-read-acknowledgement-source',
  status: 'ready',
  reason: 'ready verified read acknowledgement',
  readOnly: true,
  enabled: true,
  executorSourceCalled: true,
  persistentVerificationReadSourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  postCommitVerificationExecutorSourceStatus: 'executed',
  postCommitPersistentVerificationReadSourceStatus: 'ready',
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
  blockedCandidateCount: 0,
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  persistentReadProofs,
  checks: [],
  diagnostics: [],
  summary,
  effects: acknowledgementEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult)

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectContainedBoundary = (
  result: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult,
  ready: boolean
): void => {
  expect(result.readOnly).toBe(true)
  expect(result.appBootstrapContinuationAllowed).toBe(ready)
  expect(result.commandContinuationAllowed).toBe(ready)
  expect(result.uiIpcResultContinuationAllowed).toBe(ready)
  expect(result.effects.transactionCommitted).toBe(ready)
  expect(result.effects.transactionLogCommitted).toBe(ready)
  expect(result.effects.postCommitVerificationAcknowledged).toBe(ready)
  expect(result.effects.persistentReadProofAcknowledged).toBe(ready)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.packageStateRead).toBe(false)
  expect(result.effects.settingsRead).toBe(false)
  expect(result.effects.lockfileRead).toBe(false)
  expect(result.effects.liveRegistryRead).toBe(false)
  expect(result.effects.saveCacheIsolationChecked).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect('installTransactionCommitFinalization' in result).toBe(false)
  expect('postCommitVerificationReadAcknowledgement' in result).toBe(false)
  expect('programDirectoryPath' in result).toBe(false)
}

describe('third-party post-commit verification after install transaction commit pipeline', () => {
  it('is disabled by default and does not call commit finalization or post-commit acknowledgement', async() => {
    const readInstallTransactionCommitFinalization = vi.fn()
    const readPostCommitVerificationReadAcknowledgement = vi.fn()
    const pipeline = createThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline({
      readInstallTransactionCommitFinalization,
      readPostCommitVerificationReadAcknowledgement
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.installTransactionCommitFinalizationSourceCalled).toBe(false)
    expect(result.postCommitVerificationReadAcknowledgementSourceCalled).toBe(false)
    expect(readInstallTransactionCommitFinalization).not.toHaveBeenCalled()
    expect(readPostCommitVerificationReadAcknowledgement).not.toHaveBeenCalled()
    expectContainedBoundary(result, false)
    expectJsonGraphFrozen(result)
  })

  it('defers with commit finalization and does not call post-commit acknowledgement early', async() => {
    const readInstallTransactionCommitFinalization = vi.fn(async() => createCommittedFinalization({
      status: 'deferred',
      reason: 'waiting for finalization authorization',
      committedTransactionId: undefined,
      committedTransactionLogEntryHash: undefined,
      effects: finalizationEffects({
        transactionCommitted: false,
        transactionLogCommitted: false
      })
    }))
    const readPostCommitVerificationReadAcknowledgement = vi.fn()
    const pipeline = createThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline({
      enabled: true,
      readInstallTransactionCommitFinalization,
      readPostCommitVerificationReadAcknowledgement
    })

    const result = await pipeline()

    expect(result.status).toBe('deferred')
    expect(result.installTransactionCommitFinalizationStatus).toBe('deferred')
    expect(result.postCommitVerificationReadAcknowledgementSourceCalled).toBe(false)
    expect(readPostCommitVerificationReadAcknowledgement).not.toHaveBeenCalled()
    expectContainedBoundary(result, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts verified post-commit read acknowledgement only after committed transaction finalization', async() => {
    const calls: string[] = []
    const readInstallTransactionCommitFinalization = vi.fn(async() => {
      calls.push('commit-finalization')
      return createCommittedFinalization()
    })
    const readPostCommitVerificationReadAcknowledgement = vi.fn(async() => {
      calls.push('post-commit-read-acknowledgement')
      return createReadyAcknowledgement()
    })
    const pipeline = createThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline({
      enabled: true,
      readInstallTransactionCommitFinalization,
      readPostCommitVerificationReadAcknowledgement
    })

    const result = await pipeline()

    expect(calls).toEqual([
      'commit-finalization',
      'post-commit-read-acknowledgement'
    ])
    expect(result.status).toBe('ready')
    expect(result.installTransactionCommitFinalizationStatus).toBe('committed')
    expect(result.postCommitVerificationReadAcknowledgementStatus).toBe('ready')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.transactionId).toBe('install-transaction-1')
    expect(result.committedTransactionId).toBe('install-transaction-1')
    expect(result.committedTransactionLogEntryHash).toBe(transactionLogEntryHash)
    expect(result.verificationOutcomeKind).toBe('verified')
    expect(result.transactionLogMatched).toBe(true)
    expect(result.packageStateMatched).toBe(true)
    expect(result.settingsLockfileMatched).toBe(true)
    expect(result.liveRegistryMatched).toBe(true)
    expect(result.saveCacheIsolated).toBe(true)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(readInstallTransactionCommitFinalization).toHaveBeenCalledOnce()
    expect(readPostCommitVerificationReadAcknowledgement).toHaveBeenCalledOnce()
    expectContainedBoundary(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks identity drift between committed transaction and post-commit acknowledgement', async() => {
    const pipeline = createThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline({
      enabled: true,
      readInstallTransactionCommitFinalization: async() => createCommittedFinalization(),
      readPostCommitVerificationReadAcknowledgement: async() => createReadyAcknowledgement({
        candidateIdentity: {
          ...candidateIdentity,
          candidateHash: testHash('f')
        },
        lockfileHash: testHash('1'),
        targetPackageId: 'other_pack' as PackageId
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
      })
    ]))
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.post-commit-verification-after-install-transaction-commit-pipeline.checks.install-target-consistent',
        packageId
      })
    ]))
    expectContainedBoundary(result, false)
    expectJsonGraphFrozen(result)
  })

  it('blocks path-bearing or effect-drift sources and redacts unsafe host evidence', async() => {
    const pipeline = createThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline({
      enabled: true,
      readInstallTransactionCommitFinalization: async() => createCommittedFinalization({
        programDirectoryPath: 'C:/Users/LENOVO/AppData/Local/taoyuan/userdata',
        effects: finalizationEffects({
          runtimePublicationCommitted: true
        })
      } as unknown as Partial<ThirdPartyDataPackInstallTransactionCommitFinalizationResult>),
      readPostCommitVerificationReadAcknowledgement: async() => createReadyAcknowledgement({
        persistentReadsHost: {
          root: 'C:/Users/LENOVO/AppData/Local/taoyuan/userdata/Local Storage'
        },
        effects: acknowledgementEffects({
          savesWritten: true
        })
      } as unknown as Partial<ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult>)
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.postCommitVerificationReadAcknowledgementSourceCalled).toBe(false)
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
    expect(serialized).not.toContain('Local Storage')
    expectContainedBoundary(result, false)
    expectJsonGraphFrozen(result)
  })
})
