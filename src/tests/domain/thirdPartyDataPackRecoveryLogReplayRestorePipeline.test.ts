import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackPublicationRollbackRecoveryAction,
  ThirdPartyDataPackPublicationRollbackRecoveryEffectSummary,
  ThirdPartyDataPackPublicationRollbackRecoveryResult,
  ThirdPartyDataPackPublicationRollbackRecoveryStage
} from '@/domain/mods/thirdPartyDataPackPublicationRollbackRecovery'
import {
  createThirdPartyDataPackRecoveryLogReplayRestorePipeline
} from '@/domain/mods/thirdPartyDataPackRecoveryLogReplayRestorePipeline'
import {
  ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError,
  type ThirdPartyDataPackRecoveryLogReplayRestoreHostEffectSummary,
  type ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
} from '@/domain/mods/thirdPartyDataPackRecoveryLogReplayRestoreSource'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterEffectSummary,
  ThirdPartyDataPackRuntimePublicationCommitAdapterRequirement,
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult,
  ThirdPartyDataPackRuntimePublicationCommitStage
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = 'sample_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const officialIdentity = {
  artifactHash: committedMetadata.artifactHash as Sha256Hash,
  contentHash: committedMetadata.contentHash as Sha256Hash,
  schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
  environmentHash: committedMetadata.environmentHash as Sha256Hash,
  snapshotHash: committedMetadata.snapshotHash as Sha256Hash,
  registryCount: 54,
  entryCount: 4242
}

const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
} as const

const lockfileHash = testHash('d')

const recoveryEffects = (
  overrides: Partial<ThirdPartyDataPackPublicationRollbackRecoveryEffectSummary> = {}
): ThirdPartyDataPackPublicationRollbackRecoveryEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  rollbackExecuted: false,
  diagnosticsWritten: false,
  ...overrides
})

const commitEffects = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAdapterEffectSummary> = {}
): ThirdPartyDataPackRuntimePublicationCommitAdapterEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  rollbackExecuted: false,
  diagnosticsWritten: false,
  ...overrides
})

const hostEffects = (
  overrides: Partial<ThirdPartyDataPackRecoveryLogReplayRestoreHostEffectSummary> = {}
): ThirdPartyDataPackRecoveryLogReplayRestoreHostEffectSummary => ({
  recoveryLogReplayRestoreHostCalled: true,
  recoveryLogReplayRestoreHostAccepted: true,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
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

const recoveryActions: readonly ThirdPartyDataPackPublicationRollbackRecoveryAction[] = [
  'recovery-log-reader',
  'package-file-restore-adapter',
  'settings-lockfile-restore-adapter',
  'previous-live-registry-reference',
  'post-restore-verification',
  'redacted-recovery-diagnostics',
  'idempotent-replay'
].map(id => ({
  id: id as ThirdPartyDataPackPublicationRollbackRecoveryAction['id'],
  status: 'required',
  reason: `${id} remains required.`
}))

const recoveryStages: readonly ThirdPartyDataPackPublicationRollbackRecoveryStage[] = [
  {
    id: 'recovery-plan-inspection',
    status: 'satisfied',
    actionIds: [],
    rollbackCheckpointIds: [],
    reason: 'inspection ready'
  },
  {
    id: 'failure-capture',
    status: 'deferred',
    actionIds: ['recovery-log-reader'],
    rollbackCheckpointIds: ['before-transaction-log-write'],
    reason: 'failure capture remains deferred'
  },
  {
    id: 'transaction-log-replay',
    status: 'deferred',
    actionIds: ['recovery-log-reader', 'idempotent-replay'],
    rollbackCheckpointIds: ['before-transaction-log-write'],
    reason: 'transaction replay remains deferred'
  },
  {
    id: 'package-files-restore',
    status: 'deferred',
    actionIds: ['package-file-restore-adapter'],
    rollbackCheckpointIds: ['before-package-files-write'],
    reason: 'package restore remains deferred'
  },
  {
    id: 'settings-lockfile-restore',
    status: 'deferred',
    actionIds: ['settings-lockfile-restore-adapter'],
    rollbackCheckpointIds: ['before-settings-lockfile-write'],
    reason: 'settings and lockfile restore remains deferred'
  },
  {
    id: 'live-registry-restore',
    status: 'deferred',
    actionIds: ['previous-live-registry-reference'],
    rollbackCheckpointIds: ['before-live-registry-swap'],
    reason: 'live registry restore remains deferred'
  },
  {
    id: 'post-rollback-verification',
    status: 'deferred',
    actionIds: ['post-restore-verification'],
    rollbackCheckpointIds: ['after-failure-restore-verification'],
    reason: 'post restore verification remains deferred'
  },
  {
    id: 'recovery-diagnostics-finalization',
    status: 'deferred',
    actionIds: ['redacted-recovery-diagnostics'],
    rollbackCheckpointIds: ['after-failure-restore-verification'],
    reason: 'diagnostics finalization remains deferred'
  }
]

const commitStages: readonly ThirdPartyDataPackRuntimePublicationCommitStage[] = [
  {
    id: 'rollback-recovery-handoff',
    status: 'deferred',
    adapterIds: ['rollback-recovery-orchestrator'],
    writeBoundaryIds: [],
    rollbackCheckpointIds: ['after-failure-restore-verification'],
    reason: 'commit must hand off failed steps to rollback recovery'
  }
]

const requiredCommitAdapters: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirement[] = [
  {
    id: 'rollback-recovery-orchestrator',
    status: 'required',
    reason: 'rollback recovery remains required'
  }
]

const createPublicationRollbackRecovery = (
  overrides: Partial<ThirdPartyDataPackPublicationRollbackRecoveryResult> = {}
): ThirdPartyDataPackPublicationRollbackRecoveryResult => ({
  status: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  transactionPreCommitPlanStatus: 'deferred',
  liveRegistrySwapProtectionStatus: 'deferred',
  reason: 'publication rollback recovery is inspect-only until recovery log replay, persistent restore adapters and post-restore verification exist',
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  officialIdentity,
  candidateIdentity,
  lockfileHash,
  rollbackRecovery: 'deferred',
  recoveryAllowed: false,
  rollbackExecutionAllowed: false,
  liveRegistryMutable: false,
  recoveryChecks: [],
  recoveryStages,
  requiredRecoveryActions: recoveryActions,
  effects: recoveryEffects(),
  ...overrides
})

const createRuntimePublicationCommitAdapter = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAdapterResult> = {}
): ThirdPartyDataPackRuntimePublicationCommitAdapterResult => ({
  status: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  transactionPreCommitPlanStatus: 'deferred',
  liveRegistrySwapProtectionStatus: 'deferred',
  publicationRollbackRecoveryStatus: 'deferred',
  reason: 'runtime publication commit adapter is inspect-only until atomic commit adapter, persistent writers and post-commit verification exist',
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  officialIdentity,
  candidateIdentity,
  lockfileHash,
  runtimePublicationCommit: 'deferred',
  commitAllowed: false,
  publicationAllowed: false,
  writeAllowed: false,
  liveRegistryMutable: false,
  rollbackExecutionAllowed: false,
  commitChecks: [],
  commitStages,
  requiredCommitAdapters,
  effects: commitEffects(),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRecoveryReadsRestoresOrWrites = (
  result: ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
): void => {
  expect(result.effects.realRecoveryLogReplayRestoreCalled).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.packageBackupsWritten).toBe(false)
  expect(result.effects.packageFilesRestored).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.lockfileRestored).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.settingsRestored).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.recoveryLogRead).toBe(false)
  expect(result.effects.recoveryLogReplayed).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect(result.effects.diagnosticsWritten).toBe(false)
}

describe('third-party recovery log replay restore pipeline', () => {
  it('is disabled by default and does not read upstream reports or call the recovery host', async() => {
    const readPublicationRollbackRecovery = vi.fn()
    const readRuntimePublicationCommitAdapter = vi.fn()
    const executeRecoveryLogReplayRestore = vi.fn()
    const pipeline = createThirdPartyDataPackRecoveryLogReplayRestorePipeline({
      readPublicationRollbackRecovery,
      readRuntimePublicationCommitAdapter,
      executeRecoveryLogReplayRestore
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readPublicationRollbackRecovery).not.toHaveBeenCalled()
    expect(readRuntimePublicationCommitAdapter).not.toHaveBeenCalled()
    expect(executeRecoveryLogReplayRestore).not.toHaveBeenCalled()
    expectNoRecoveryReadsRestoresOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('threads rollback recovery and runtime commit reports through a path-free replay/restore host', async() => {
    const readPublicationRollbackRecovery = vi.fn(async() => createPublicationRollbackRecovery())
    const readRuntimePublicationCommitAdapter = vi.fn(async() => createRuntimePublicationCommitAdapter())
    const executeRecoveryLogReplayRestore = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.selectedPackageIds).toEqual([packageId])
      expect(envelope.loadOrder).toEqual([packageId])
      expect(envelope.registryCount).toBe(55)
      expect(envelope.entryCount).toBe(4243)
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.recoveryLogReplayRestore).toBe('deferred')
      expect(envelope.replayRestoreStageIds).toEqual([
        'replay-restore-adapter-inspection',
        'recovery-log-load',
        'recovery-log-replay',
        'package-files-restore',
        'settings-lockfile-restore',
        'live-registry-restore',
        'post-restore-verification',
        'recovery-diagnostics-finalization'
      ])
      expect(envelope.requiredReplayRestoreAdapterIds).toEqual([
        'verified-recovery-log-reader',
        'idempotent-recovery-log-replay',
        'package-file-restore-adapter',
        'settings-lockfile-restore-adapter',
        'live-registry-restore-adapter',
        'post-restore-verification-adapter',
        'redacted-recovery-diagnostics-adapter',
        'interrupted-recovery-resume-guard'
      ])
      expect('publicationRollbackRecovery' in envelope).toBe(false)
      expect('runtimePublicationCommitAdapter' in envelope).toBe(false)
      expect('recoveryLogReader' in envelope).toBe(false)
      expect('programDirectoryPath' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        replayRestoreStageIds: envelope.replayRestoreStageIds,
        requiredReplayRestoreAdapterIds: envelope.requiredReplayRestoreAdapterIds,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.recovery-log-replay-restore-pipeline.host-accepted',
            messageKey: 'mods.info.lifecycle.transaction.recoveryPipelineHostAccepted',
            packageId,
            recovery: 'none'
          }
        ],
        effects: hostEffects()
      }
    })
    const pipeline = createThirdPartyDataPackRecoveryLogReplayRestorePipeline({
      enabled: true,
      readPublicationRollbackRecovery,
      readRuntimePublicationCommitAdapter,
      executeRecoveryLogReplayRestore
    })

    const result = await pipeline()

    expect(result.status).toBe('executed')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.recoveryLogReplayRestoreAdapterStatus).toBe('deferred')
    expect(result.recoveryLogReplayRestoreHostStatus).toBe('accepted')
    expect(result.publicationRollbackRecoveryStatus).toBe('deferred')
    expect(result.runtimePublicationCommitAdapterStatus).toBe('deferred')
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(readPublicationRollbackRecovery).toHaveBeenCalledOnce()
    expect(readRuntimePublicationCommitAdapter).toHaveBeenCalledOnce()
    expect(executeRecoveryLogReplayRestore).toHaveBeenCalledOnce()
    expect(result.effects.recoveryLogReplayRestoreHostCalled).toBe(true)
    expect(result.effects.recoveryLogReplayRestoreHostAccepted).toBe(true)
    expect(result.effects.realRecoveryLogReplayRestoreCalled).toBe(false)
    expect('publicationRollbackRecovery' in result).toBe(false)
    expect('runtimePublicationCommitAdapter' in result).toBe(false)
    expect('recoveryLogEntry' in result).toBe(false)
    expectNoRecoveryReadsRestoresOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks upstream divergence before calling the recovery host', async() => {
    const executeRecoveryLogReplayRestore = vi.fn()
    const pipeline = createThirdPartyDataPackRecoveryLogReplayRestorePipeline({
      enabled: true,
      readPublicationRollbackRecovery: async() => createPublicationRollbackRecovery(),
      readRuntimePublicationCommitAdapter: async() => createRuntimePublicationCommitAdapter({
        candidateIdentity: {
          ...candidateIdentity,
          candidateHash: testHash('e')
        }
      }),
      executeRecoveryLogReplayRestore
    })

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError)
      const result = (error as ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.commandContinuationAllowed).toBe(false)
      expect(result.recoveryLogReplayRestoreAdapterStatus).toBe('blocked')
      expect(result.blockedPackageIds).toEqual([])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.recovery-log-replay-restore-adapter.checks'
        }),
        expect.objectContaining({
          stage: 'third-party.recovery-log-replay-restore-source.recovery-blocked'
        })
      ]))
      expectNoRecoveryReadsRestoresOrWrites(result)
      expectJsonGraphFrozen(result)
    }

    expect(executeRecoveryLogReplayRestore).not.toHaveBeenCalled()
  })

  it('contains missing upstream readers as a blocked pipeline source failure', async() => {
    const pipeline = createThirdPartyDataPackRecoveryLogReplayRestorePipeline({
      enabled: true
    })

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError)
      const result = (error as ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.recovery-log-replay-restore-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('programDirectoryPath')
      expectNoRecoveryReadsRestoresOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })
})
