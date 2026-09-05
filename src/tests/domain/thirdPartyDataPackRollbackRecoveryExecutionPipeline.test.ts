import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  ThirdPartyDataPackAtomicTransactionCommitOutcomeEffectSummary
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitOutcomeContract'
import type {
  ThirdPartyDataPackRecoveryLogReplayRestoreSourceEffectSummary,
  ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
} from '@/domain/mods/thirdPartyDataPackRecoveryLogReplayRestoreSource'
import {
  createThirdPartyDataPackRollbackRecoveryExecutionPipeline
} from '@/domain/mods/thirdPartyDataPackRollbackRecoveryExecutionPipeline'
import {
  ThirdPartyDataPackRollbackRecoveryExecutionBlockedError,
  type ThirdPartyDataPackRollbackRecoveryExecutionHostEffectSummary,
  type ThirdPartyDataPackRollbackRecoveryExecutionSourceResult
} from '@/domain/mods/thirdPartyDataPackRollbackRecoveryExecutionSource'

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
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitOutcomeEffectSummary> = {}
): ThirdPartyDataPackAtomicTransactionCommitOutcomeEffectSummary => ({
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

const recoveryEffects = (
  overrides: Partial<ThirdPartyDataPackRecoveryLogReplayRestoreSourceEffectSummary> = {}
): ThirdPartyDataPackRecoveryLogReplayRestoreSourceEffectSummary => ({
  recoveryLogReplayRestoreSourceCalled: true,
  recoveryLogReplayRestoreAdapterSourceCalled: true,
  recoveryLogReplayRestoreHostCalled: true,
  recoveryLogReplayRestoreHostAccepted: true,
  appBootstrapContinuationAllowed: false,
  commandContinuationAllowed: true,
  realRecoveryLogReplayRestoreCalled: false,
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

const hostEffects = (
  overrides: Partial<ThirdPartyDataPackRollbackRecoveryExecutionHostEffectSummary> = {}
): ThirdPartyDataPackRollbackRecoveryExecutionHostEffectSummary => ({
  rollbackRecoveryExecutionHostCalled: true,
  rollbackRecoveryExecutionHostAccepted: true,
  rollbackRecoveryExecutionAcknowledged: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  realRecoveryLogReplayRestoreCalled: false,
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

const createCommitOutcome = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult => ({
  status: 'ready',
  sourcePreflightStatus: 'deferred',
  reason: 'atomic transaction commit outcome contract is ready as a path-free domain source',
  atomicTransactionCommitOutcomeContract: 'ready',
  readOnly: true,
  commitOutcomeNormalized: true,
  commandDispatchAllowed: false,
  atomicCommitExecutionAllowed: false,
  transactionCommitAllowed: false,
  runtimePublicationCommitAllowed: false,
  postCommitVerificationAllowed: false,
  uiIpcResponseAllowed: false,
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
  candidateIdentity,
  lockfileHash,
  checks: [],
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
  outcome: {
    formatVersion: 1,
    kind: 'rollback',
    commandId: 'install',
    packageId,
    candidateHash: candidateIdentity.candidateHash,
    lockfileHash,
    messageKey: 'mods.atomic.commit.install.rollback',
    recovery: 'restore-backup',
    retryable: false,
    rollbackRequired: true,
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
    diagnostics: []
  },
  effects: commitEffects(),
  ...overrides
})

const createRecoverySource = (
  overrides: Partial<ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult> = {}
): ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult => ({
  kind: 'third-party-recovery-log-replay-restore-source',
  mode: 'default-disabled-recovery-log-replay-restore-source',
  status: 'executed',
  reason: 'third-party recovery log replay restore source accepted an injected path-free recovery host result',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: false,
  commandContinuationAllowed: true,
  recoveryLogReplayRestoreAdapterStatus: 'deferred',
  recoveryLogReplayRestoreHostStatus: 'accepted',
  publicationRollbackRecoveryStatus: 'deferred',
  runtimePublicationCommitAdapterStatus: 'deferred',
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  replayRestoreStageSummaries: [
    {
      id: 'recovery-log-replay',
      status: 'deferred'
    }
  ],
  requiredReplayRestoreAdapterIds: [
    'verified-recovery-log-reader',
    'idempotent-recovery-log-replay'
  ],
  diagnostics: [
    {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'info',
      stage: 'third-party.recovery-log-replay-restore-source.host-accepted',
      messageKey: 'mods.info.lifecycle.transaction.recoveryHostAccepted',
      packageId,
      recovery: 'none'
    }
  ],
  effects: recoveryEffects(),
  ...overrides
})

const createAcceptedHostResult = (overrides: Record<string, unknown> = {}) => ({
  status: 'accepted' as const,
  requestedCommandId: 'install' as const,
  targetPackageId: packageId,
  outcomeKind: 'rollback' as const,
  recovery: 'restore-backup' as const,
  retryable: false,
  rollbackRequired: true,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  rollbackRecoverySettlementStatus: 'ready' as const,
  rollbackRecoverySettled: true,
  diagnostics: [
    {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'info',
      stage: 'third-party.rollback-recovery-execution-pipeline.host-accepted',
      messageKey: 'mods.info.lifecycle.transaction.rollbackRecoveryExecutionPipelineHostAccepted',
      packageId,
      recovery: 'none'
    }
  ],
  effects: hostEffects(),
  ...overrides
})

const captureBlockedResult = async(
  source: () => Promise<ThirdPartyDataPackRollbackRecoveryExecutionSourceResult>
): Promise<ThirdPartyDataPackRollbackRecoveryExecutionSourceResult> => {
  try {
    await source()
  } catch (error) {
    expect(error).toBeInstanceOf(ThirdPartyDataPackRollbackRecoveryExecutionBlockedError)
    return (error as ThirdPartyDataPackRollbackRecoveryExecutionBlockedError).result
  }
  throw new Error('expected rollback recovery execution pipeline to block')
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealRecoveryOrWrites = (
  result: ThirdPartyDataPackRollbackRecoveryExecutionSourceResult
): void => {
  expect(result.effects.realRecoveryLogReplayRestoreCalled).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.transactionLogPrepared).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
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
  expect('programDirectoryPath' in result).toBe(false)
  expect('candidateRegistrySet' in result).toBe(false)
  expect('lockfileDraft' in result).toBe(false)
}

describe('third-party rollback recovery execution pipeline', () => {
  it('is disabled by default and does not read upstream sources or call execution host', async() => {
    const readAtomicTransactionCommitOutcomeContract = vi.fn()
    const readRecoveryLogReplayRestoreSource = vi.fn()
    const executeRollbackRecovery = vi.fn()
    const pipeline = createThirdPartyDataPackRollbackRecoveryExecutionPipeline({
      readAtomicTransactionCommitOutcomeContract,
      readRecoveryLogReplayRestoreSource,
      executeRollbackRecovery
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readAtomicTransactionCommitOutcomeContract).not.toHaveBeenCalled()
    expect(readRecoveryLogReplayRestoreSource).not.toHaveBeenCalled()
    expect(executeRollbackRecovery).not.toHaveBeenCalled()
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('threads atomic outcome and recovery acknowledgement through settlement before execution host', async() => {
    const readAtomicTransactionCommitOutcomeContract = vi.fn(async() => createCommitOutcome())
    const readRecoveryLogReplayRestoreSource = vi.fn(async() => createRecoverySource())
    const executeRollbackRecovery = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope).toMatchObject({
        requestedCommandId: 'install',
        targetPackageId: packageId,
        outcomeKind: 'rollback',
        recovery: 'restore-backup',
        rollbackRequired: true,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        rollbackRecoverySettlementStatus: 'ready',
        rollbackRecoverySettled: true,
        rollbackRecoveryExecution: 'deferred'
      })
      expect('programDirectoryPath' in envelope).toBe(false)
      expect('candidateRegistrySet' in envelope).toBe(false)
      return createAcceptedHostResult()
    })
    const pipeline = createThirdPartyDataPackRollbackRecoveryExecutionPipeline({
      enabled: true,
      readAtomicTransactionCommitOutcomeContract,
      readRecoveryLogReplayRestoreSource,
      executeRollbackRecovery
    })

    const result = await pipeline()

    expect(result.status).toBe('executed')
    expect(result.rollbackRecoverySettlementStatus).toBe('ready')
    expect(result.rollbackRecoveryExecutionHostStatus).toBe('accepted')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.outcomeKind).toBe('rollback')
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.rollbackRecoverySettled).toBe(true)
    expect(result.rollbackRecoveryExecutionAcknowledged).toBe(true)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.uiIpcResultContinuationAllowed).toBe(true)
    expect(readAtomicTransactionCommitOutcomeContract).toHaveBeenCalledOnce()
    expect(readRecoveryLogReplayRestoreSource).toHaveBeenCalledOnce()
    expect(executeRollbackRecovery).toHaveBeenCalledOnce()
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.rollback-recovery-execution-pipeline.host-accepted',
        packageId
      })
    ]))
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('accepts rollback-only package restore evidence from the execution host', async() => {
    const readAtomicTransactionCommitOutcomeContract = vi.fn(async() => createCommitOutcome())
    const readRecoveryLogReplayRestoreSource = vi.fn(async() => createRecoverySource({
      reason: 'third-party recovery log replay restore source accepted contained recovery host evidence',
      effects: recoveryEffects({
        realRecoveryLogReplayRestoreCalled: true,
        recoveryLogRead: true,
        recoveryLogReplayed: true,
        packageFilesRestored: true,
        rollbackExecuted: true
      })
    }))
    const executeRollbackRecovery = vi.fn(async() => createAcceptedHostResult({
      effects: hostEffects({
        realRecoveryLogReplayRestoreCalled: true,
        recoveryLogRead: true,
        recoveryLogReplayed: true,
        packageFilesRestored: true,
        rollbackExecuted: true
      })
    }))
    const pipeline = createThirdPartyDataPackRollbackRecoveryExecutionPipeline({
      enabled: true,
      readAtomicTransactionCommitOutcomeContract,
      readRecoveryLogReplayRestoreSource,
      executeRollbackRecovery
    })

    const result = await pipeline()

    expect(result.status).toBe('executed')
    expect(result.outcomeKind).toBe('rollback')
    expect(result.recovery).toBe('restore-backup')
    expect(result.rollbackRequired).toBe(true)
    expect(result.rollbackRecoveryExecutionAcknowledged).toBe(true)
    expect(result.effects.realRecoveryLogReplayRestoreCalled).toBe(true)
    expect(result.effects.recoveryLogRead).toBe(true)
    expect(result.effects.recoveryLogReplayed).toBe(true)
    expect(result.effects.packageFilesRestored).toBe(true)
    expect(result.effects.rollbackExecuted).toBe(true)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.settingsRestored).toBe(false)
    expect(result.effects.lockfileRestored).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expect(executeRollbackRecovery).toHaveBeenCalledOnce()
    expectJsonGraphFrozen(result)
  })

  it('blocks missing upstream settlement prerequisites before calling execution host', async() => {
    const executeRollbackRecovery = vi.fn()
    const pipeline = createThirdPartyDataPackRollbackRecoveryExecutionPipeline({
      enabled: true,
      executeRollbackRecovery
    })

    const result = await captureBlockedResult(pipeline)

    expect(result.status).toBe('blocked')
    expect(result.rollbackRecoveryExecutionAcknowledged).toBe(false)
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.uiIpcResultContinuationAllowed).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.rollback-recovery-execution-source.settlement-source-failed'
      })
    ]))
    expect(executeRollbackRecovery).not.toHaveBeenCalled()
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks upstream candidate drift before execution host acknowledgement', async() => {
    const readAtomicTransactionCommitOutcomeContract = vi.fn(async() => createCommitOutcome())
    const readRecoveryLogReplayRestoreSource = vi.fn(async() => createRecoverySource({
      selectedPackageIds: [otherPackageId],
      candidateIdentity: {
        ...candidateIdentity,
        candidateHash: testHash('e')
      }
    }))
    const executeRollbackRecovery = vi.fn()
    const pipeline = createThirdPartyDataPackRollbackRecoveryExecutionPipeline({
      enabled: true,
      readAtomicTransactionCommitOutcomeContract,
      readRecoveryLogReplayRestoreSource,
      executeRollbackRecovery
    })

    const result = await captureBlockedResult(pipeline)

    expect(result.status).toBe('blocked')
    expect(result.rollbackRecoveryExecutionHostStatus).toBeUndefined()
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.uiIpcResultContinuationAllowed).toBe(false)
    expect(readAtomicTransactionCommitOutcomeContract).toHaveBeenCalledOnce()
    expect(readRecoveryLogReplayRestoreSource).toHaveBeenCalledOnce()
    expect(executeRollbackRecovery).not.toHaveBeenCalled()
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })
})
