import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackAtomicTransactionCommitExecutorPipeline
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorPipeline'
import {
  ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorHostEffectSummary,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorSource'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionDispatchPlan'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from '@/domain/mods/thirdPartyDataPackTransactionCommandDispatcherHandoff'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
} as const

const lockfileHash = testHash('d')

const handoffEffects = {
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
  diagnosticsWritten: false
} as const

const installEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatched: false,
  transactionCommitted: false,
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
  diagnosticsWritten: false
} as const

const commitEffects = {
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
  diagnosticsWritten: false
} as const

const hostEffects = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorHostEffectSummary> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorHostEffectSummary => ({
  atomicCommitExecutorHostCalled: true,
  atomicCommitExecutorHostAccepted: true,
  transactionCommitted: false,
  transactionLogPrepared: false,
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

const createDispatcherHandoff = (
  overrides: Partial<ThirdPartyDataPackTransactionCommandDispatcherHandoffResult> = {}
): ThirdPartyDataPackTransactionCommandDispatcherHandoffResult => ({
  status: 'deferred',
  transactionCommandPreflightStatus: 'deferred',
  installTransactionDispatchPlanStatus: 'deferred',
  postCommitVerificationPlanStatus: 'deferred',
  reason: 'transaction command dispatcher handoff is inspect-only until real command dispatch, atomic transaction commit, post-commit verification and UI/IPC result delivery are implemented',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  transactionCommandDispatcherHandoff: 'deferred',
  readOnly: true,
  dispatcherHandoffAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  postCommitVerificationAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  handoffChecks: [],
  handoffStages: [
    {
      id: 'dispatcher-handoff-inspection',
      status: 'satisfied',
      requirementIds: ['confirmed-command-envelope', 'install-dispatch-plan-consumer'],
      reason: 'Command preflight, install dispatch planning and post-commit verification planning are consistent enough to inspect dispatcher handoff requirements.'
    },
    {
      id: 'install-transaction-commit',
      status: 'deferred',
      requirementIds: ['atomic-transaction-commit-executor'],
      reason: 'Install transaction commit remains deferred.'
    },
    {
      id: 'post-commit-verification-execution',
      status: 'deferred',
      requirementIds: ['post-commit-verification-executor'],
      reason: 'Post-commit verification execution remains deferred.'
    },
    {
      id: 'ui-ipc-result-handoff',
      status: 'deferred',
      requirementIds: ['path-free-ui-ipc-result'],
      reason: 'UI and IPC result delivery remains deferred.'
    },
    {
      id: 'rollback-recovery-handoff',
      status: 'deferred',
      requirementIds: ['rollback-recovery-orchestrator'],
      reason: 'Rollback recovery remains deferred.'
    }
  ],
  dispatcherRequirements: [
    {
      id: 'atomic-transaction-commit-executor',
      status: 'required',
      reason: 'Persistent mutation must happen through one atomic executor.'
    }
  ],
  effects: handoffEffects,
  ...overrides
} as ThirdPartyDataPackTransactionCommandDispatcherHandoffResult)

const createInstallDispatchPlan = (
  overrides: Partial<ThirdPartyDataPackInstallTransactionDispatchPlanResult> = {}
): ThirdPartyDataPackInstallTransactionDispatchPlanResult => ({
  status: 'deferred',
  transactionCommandPreflightStatus: 'deferred',
  modLockWriteProbeStatus: 'written',
  transactionLogWriteProbeStatus: 'written',
  reason: 'install transaction dispatch plan is inspect-only until command dispatch, persistent package commits, runtime publication and rollback recovery are implemented',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  installTransactionDispatchPlan: 'deferred',
  readOnly: true,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  checks: [],
  stages: [
    {
      id: 'dispatch-plan-inspection',
      status: 'satisfied',
      requirementIds: ['install-command-dispatcher'],
      reason: 'Install command and isolated write-probe evidence are consistent enough to inspect future dispatch requirements.'
    },
    {
      id: 'transaction-log-prepare',
      status: 'deferred',
      requirementIds: ['verified-transaction-log-entry'],
      reason: 'Transaction log preparation remains deferred.'
    },
    {
      id: 'package-file-stage',
      status: 'deferred',
      requirementIds: ['staged-package-file-commit'],
      reason: 'Package file staging remains deferred.'
    },
    {
      id: 'settings-lockfile-commit',
      status: 'deferred',
      requirementIds: ['atomic-settings-lockfile-commit'],
      reason: 'Settings and lockfile commit remains deferred.'
    },
    {
      id: 'runtime-publication-commit',
      status: 'deferred',
      requirementIds: ['runtime-publication-commit-adapter'],
      reason: 'Runtime publication commit remains deferred.'
    }
  ],
  requirements: [
    {
      id: 'verified-transaction-log-entry',
      status: 'required',
      reason: 'A future commit must verify a transaction log entry.'
    },
    {
      id: 'staged-package-file-commit',
      status: 'required',
      reason: 'A future commit must stage package files.'
    },
    {
      id: 'atomic-settings-lockfile-commit',
      status: 'required',
      reason: 'A future commit must replace settings and lockfile atomically.'
    },
    {
      id: 'runtime-publication-commit-adapter',
      status: 'required',
      reason: 'A future commit must hand off runtime publication.'
    }
  ],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  effects: installEffects,
  ...overrides
} as ThirdPartyDataPackInstallTransactionDispatchPlanResult)

const createRuntimeCommitAdapter = (
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
  officialIdentity: {
    artifactHash: testHash('e'),
    contentHash: testHash('f'),
    schemaSetHash: testHash('1'),
    environmentHash: testHash('2'),
    snapshotHash: testHash('3'),
    registryCount: 54,
    entryCount: 4242
  },
  candidateIdentity,
  lockfileHash,
  runtimePublicationCommit: 'deferred',
  commitAllowed: false,
  publicationAllowed: false,
  writeAllowed: false,
  liveRegistryMutable: false,
  rollbackExecutionAllowed: false,
  commitChecks: [],
  commitStages: [
    {
      id: 'commit-adapter-inspection',
      status: 'satisfied',
      adapterIds: ['atomic-runtime-publication-commit-adapter'],
      writeBoundaryIds: [],
      rollbackCheckpointIds: [],
      reason: 'Runtime publication commit adapter inputs are consistent enough to inspect commit requirements.'
    },
    {
      id: 'transaction-log-prepare',
      status: 'deferred',
      adapterIds: ['transaction-log-writer'],
      writeBoundaryIds: ['transaction-log'],
      rollbackCheckpointIds: ['before-transaction-log-write'],
      reason: 'Transaction log preparation remains deferred.'
    },
    {
      id: 'package-files-commit',
      status: 'deferred',
      adapterIds: ['package-file-commit-adapter'],
      writeBoundaryIds: ['package-files', 'package-backups'],
      rollbackCheckpointIds: ['before-package-files-write'],
      reason: 'Package file commit remains deferred.'
    },
    {
      id: 'settings-lockfile-commit',
      status: 'deferred',
      adapterIds: ['settings-lockfile-commit-adapter'],
      writeBoundaryIds: ['installation-settings', 'mod-lockfile'],
      rollbackCheckpointIds: ['before-settings-lockfile-write'],
      reason: 'Settings and lockfile commit remains deferred.'
    },
    {
      id: 'live-registry-publication',
      status: 'deferred',
      adapterIds: ['live-registry-publication-adapter'],
      writeBoundaryIds: ['live-registry'],
      rollbackCheckpointIds: ['before-live-registry-swap'],
      reason: 'Live registry publication remains deferred.'
    },
    {
      id: 'post-commit-verification',
      status: 'deferred',
      adapterIds: ['post-commit-verification-adapter'],
      writeBoundaryIds: [],
      rollbackCheckpointIds: ['after-failure-restore-verification'],
      reason: 'Post-commit verification remains deferred.'
    },
    {
      id: 'rollback-recovery-handoff',
      status: 'deferred',
      adapterIds: ['rollback-recovery-orchestrator'],
      writeBoundaryIds: [],
      rollbackCheckpointIds: ['after-failure-restore-verification'],
      reason: 'Rollback recovery handoff remains deferred.'
    }
  ],
  requiredCommitAdapters: [
    {
      id: 'atomic-runtime-publication-commit-adapter',
      status: 'required',
      reason: 'Runtime publication must be committed through a future atomic adapter.'
    }
  ],
  effects: commitEffects,
  ...overrides
} as ThirdPartyDataPackRuntimePublicationCommitAdapterResult)

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoPersistentWrites = (
  result: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult
): void => {
  expect(result.effects.realAtomicCommitExecutorCalled).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.transactionLogPrepared).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.packageBackupsWritten).toBe(false)
  expect(result.effects.packageFilesRestored).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.recoveryLogRead).toBe(false)
  expect(result.effects.recoveryLogReplayed).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect(result.effects.diagnosticsWritten).toBe(false)
}

describe('third-party atomic transaction commit executor pipeline', () => {
  it('is disabled by default and does not read upstream reports or call hosts', async() => {
    const readTransactionCommandDispatcherHandoff = vi.fn()
    const readInstallTransactionDispatchPlan = vi.fn()
    const readRuntimePublicationCommitAdapter = vi.fn()
    const executeInjectedAtomicTransactionCommit = {
      kind: 'injected-atomic-transaction-commit-executor' as const,
      mode: 'injected-test-only' as const,
      execute: vi.fn()
    }
    const executeAtomicTransactionCommit = vi.fn()
    const pipeline = createThirdPartyDataPackAtomicTransactionCommitExecutorPipeline({
      readTransactionCommandDispatcherHandoff,
      readInstallTransactionDispatchPlan,
      readRuntimePublicationCommitAdapter,
      executeInjectedAtomicTransactionCommit,
      executeAtomicTransactionCommit
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readTransactionCommandDispatcherHandoff).not.toHaveBeenCalled()
    expect(readInstallTransactionDispatchPlan).not.toHaveBeenCalled()
    expect(readRuntimePublicationCommitAdapter).not.toHaveBeenCalled()
    expect(executeInjectedAtomicTransactionCommit.execute).not.toHaveBeenCalled()
    expect(executeAtomicTransactionCommit).not.toHaveBeenCalled()
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('threads handoff, dispatch plan and runtime commit adapter through injected host acknowledgements', async() => {
    const executeInjectedAtomicTransactionCommit = {
      kind: 'injected-atomic-transaction-commit-executor' as const,
      mode: 'injected-test-only' as const,
      execute: vi.fn(request => {
        expect(Object.isFrozen(request)).toBe(true)
        expect(request.commandId).toBe('install')
        expect(request.packageId).toBe(packageId)
        expect(request.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
        expect(request.lockfileHash).toBe(lockfileHash)
        expect('candidateRegistrySet' in request).toBe(false)
        expect('programDirectoryPath' in request).toBe(false)
        return {
          kind: 'committed' as const,
          settled: true as const,
          packageId: request.packageId,
          candidateIdentity: request.candidateIdentity,
          lockfileHash: request.lockfileHash,
          messageKey: 'mods.atomic.commit.install.committed',
          recovery: 'none' as const
        }
      })
    }
    const executeAtomicTransactionCommit = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.commitOutcomeKind).toBe('committed')
      expect('commitRequest' in envelope).toBe(false)
      expect('outcomeContract' in envelope).toBe(false)
      expect('candidateRegistrySet' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        commitOutcomeKind: 'committed' as const,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        effects: hostEffects()
      }
    })
    const pipeline = createThirdPartyDataPackAtomicTransactionCommitExecutorPipeline({
      enabled: true,
      readTransactionCommandDispatcherHandoff: async() => createDispatcherHandoff(),
      readInstallTransactionDispatchPlan: async() => createInstallDispatchPlan(),
      readRuntimePublicationCommitAdapter: async() => createRuntimeCommitAdapter(),
      executeInjectedAtomicTransactionCommit,
      executeAtomicTransactionCommit
    })

    const result = await pipeline()

    expect(result.status).toBe('executed')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.atomicTransactionCommitExecutorAdapterStatus).toBe('executed')
    expect(result.atomicTransactionCommitExecutorHostStatus).toBe('accepted')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.outcomeContractStatus).toBe('ready')
    expect(result.commitOutcomeKind).toBe('committed')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(executeInjectedAtomicTransactionCommit.execute).toHaveBeenCalledOnce()
    expect(executeAtomicTransactionCommit).toHaveBeenCalledOnce()
    expect(result.effects.injectedAtomicCommitAdapterExecuted).toBe(true)
    expect(result.effects.injectedCommitHostCalled).toBe(true)
    expect(result.effects.atomicCommitExecutorHostCalled).toBe(true)
    expect(result.effects.atomicCommitExecutorHostAccepted).toBe(true)
    expect('commitRequest' in result).toBe(false)
    expect('outcomeContract' in result).toBe(false)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks before injected commit hosts when upstream reports diverge', async() => {
    const executeInjectedAtomicTransactionCommit = {
      kind: 'injected-atomic-transaction-commit-executor' as const,
      mode: 'injected-test-only' as const,
      execute: vi.fn()
    }
    const executeAtomicTransactionCommit = vi.fn()
    const pipeline = createThirdPartyDataPackAtomicTransactionCommitExecutorPipeline({
      enabled: true,
      readTransactionCommandDispatcherHandoff: async() => createDispatcherHandoff(),
      readInstallTransactionDispatchPlan: async() => createInstallDispatchPlan(),
      readRuntimePublicationCommitAdapter: async() => createRuntimeCommitAdapter({
        selectedPackageIds: [packageId, blockedPackageId],
        packageCount: 2
      }),
      executeInjectedAtomicTransactionCommit,
      executeAtomicTransactionCommit
    })

    await expect(pipeline()).rejects.toBeInstanceOf(
      ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError
    )

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError)
      const result = (error as ThirdPartyDataPackAtomicTransactionCommitExecutorBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.commandContinuationAllowed).toBe(false)
      expect(result.atomicTransactionCommitExecutorAdapterStatus).toBe('blocked')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.atomic-transaction-commit-executor-source.executor-blocked'
        })
      ]))
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    }
    expect(executeInjectedAtomicTransactionCommit.execute).not.toHaveBeenCalled()
    expect(executeAtomicTransactionCommit).not.toHaveBeenCalled()
  })
})
