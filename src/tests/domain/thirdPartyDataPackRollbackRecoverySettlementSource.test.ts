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
  createThirdPartyDataPackRollbackRecoverySettlementSource,
  THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_SETTLEMENT_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_SETTLEMENT_SOURCE_MODE,
  ThirdPartyDataPackRollbackRecoverySettlementBlockedError,
  type ThirdPartyDataPackRollbackRecoverySettlementSourceResult
} from '@/domain/mods/thirdPartyDataPackRollbackRecoverySettlementSource'

const packageId = 'sample_pack' as PackageId
const otherPackageId = 'other_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const otherCandidateIdentity: ThirdPartyCandidateIdentitySummary = {
  ...candidateIdentity,
  candidateHash: testHash('e')
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

const createCommitOutcome = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult => ({
  status: 'ready',
  sourcePreflightStatus: 'deferred',
  reason: 'atomic transaction commit outcome contract is ready as a path-free domain source; commit execution remains outside this contract',
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const captureBlockedResult = async(
  source: () => Promise<ThirdPartyDataPackRollbackRecoverySettlementSourceResult>
): Promise<ThirdPartyDataPackRollbackRecoverySettlementSourceResult> => {
  try {
    await source()
  } catch (error) {
    expect(error).toBeInstanceOf(ThirdPartyDataPackRollbackRecoverySettlementBlockedError)
    return (error as ThirdPartyDataPackRollbackRecoverySettlementBlockedError).result
  }
  throw new Error('expected rollback recovery settlement source to block')
}

const expectNoRealRecoveryOrWrites = (
  result: ThirdPartyDataPackRollbackRecoverySettlementSourceResult
): void => {
  expect(result.effects.realRecoveryLogReplayRestoreCalled).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
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
  expect('recoveryLogEntry' in result).toBe(false)
  expect('candidateRegistrySet' in result).toBe(false)
}

describe('third-party rollback recovery settlement source', () => {
  it('is disabled by default and does not read outcome or recovery sources', async() => {
    const readAtomicTransactionCommitOutcomeContract = vi.fn()
    const readRecoveryLogReplayRestoreSource = vi.fn()
    const source = createThirdPartyDataPackRollbackRecoverySettlementSource({
      readAtomicTransactionCommitOutcomeContract,
      readRecoveryLogReplayRestoreSource
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_SETTLEMENT_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_SETTLEMENT_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.readOnly).toBe(true)
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(readAtomicTransactionCommitOutcomeContract).not.toHaveBeenCalled()
    expect(readRecoveryLogReplayRestoreSource).not.toHaveBeenCalled()
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('skips recovery source reads for committed outcomes while allowing continuation', async() => {
    const readAtomicTransactionCommitOutcomeContract = vi.fn(async() => createCommitOutcome({
      outcome: {
        ...createCommitOutcome().outcome!,
        kind: 'committed',
        messageKey: 'mods.atomic.commit.install.committed',
        recovery: 'none',
        rollbackRequired: false
      }
    }))
    const readRecoveryLogReplayRestoreSource = vi.fn()
    const source = createThirdPartyDataPackRollbackRecoverySettlementSource({
      enabled: true,
      readAtomicTransactionCommitOutcomeContract,
      readRecoveryLogReplayRestoreSource
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.outcomeKind).toBe('committed')
    expect(result.uiIpcResultContinuationAllowed).toBe(true)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.rollbackRecoverySettled).toBe(false)
    expect(readAtomicTransactionCommitOutcomeContract).toHaveBeenCalledOnce()
    expect(readRecoveryLogReplayRestoreSource).not.toHaveBeenCalled()
    expect(result.effects.successOutcomeAccepted).toBe(true)
    expect(result.effects.recoveryLogReplayRestoreSourceCalled).toBe(false)
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('settles rollback outcome continuation after matching recovery acknowledgement', async() => {
    const readAtomicTransactionCommitOutcomeContract = vi.fn(async() => createCommitOutcome())
    const readRecoveryLogReplayRestoreSource = vi.fn(async() => createRecoverySource())
    const source = createThirdPartyDataPackRollbackRecoverySettlementSource({
      enabled: true,
      readAtomicTransactionCommitOutcomeContract,
      readRecoveryLogReplayRestoreSource
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.atomicTransactionCommitOutcomeContractStatus).toBe('ready')
    expect(result.recoveryLogReplayRestoreSourceStatus).toBe('executed')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.outcomeKind).toBe('rollback')
    expect(result.messageKey).toBe('mods.atomic.commit.install.rollback')
    expect(result.recovery).toBe('restore-backup')
    expect(result.rollbackRequired).toBe(true)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.recoveryLogReplayRestoreHostAccepted).toBe(true)
    expect(result.rollbackRecoverySettled).toBe(true)
    expect(result.uiIpcResultContinuationAllowed).toBe(true)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.recovery-log-replay-restore-source.host-accepted',
        packageId
      })
    ])
    expect(readAtomicTransactionCommitOutcomeContract).toHaveBeenCalledOnce()
    expect(readRecoveryLogReplayRestoreSource).toHaveBeenCalledOnce()
    expect(result.effects.rollbackOutcomeAccepted).toBe(true)
    expect(result.effects.rollbackRecoveryAcknowledged).toBe(true)
    expect(result.effects.recoveryLogReplayRestoreHostCalled).toBe(true)
    expect(result.effects.recoveryLogReplayRestoreHostAccepted).toBe(true)
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks candidate drift before allowing rollback continuation', async() => {
    const readAtomicTransactionCommitOutcomeContract = vi.fn(async() => createCommitOutcome())
    const readRecoveryLogReplayRestoreSource = vi.fn(async() => createRecoverySource({
      candidateIdentity: otherCandidateIdentity
    }))
    const source = createThirdPartyDataPackRollbackRecoverySettlementSource({
      enabled: true,
      readAtomicTransactionCommitOutcomeContract,
      readRecoveryLogReplayRestoreSource
    })

    const result = await captureBlockedResult(source)

    expect(result.status).toBe('blocked')
    expect(result.checks).toContainEqual(expect.objectContaining({
      id: 'candidate-hash-consistent',
      status: 'blocked'
    }))
    expect(result.rollbackRecoverySettled).toBe(false)
    expect(result.uiIpcResultContinuationAllowed).toBe(false)
    expect(readAtomicTransactionCommitOutcomeContract).toHaveBeenCalledOnce()
    expect(readRecoveryLogReplayRestoreSource).toHaveBeenCalledOnce()
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe recovery effect drift and path-bearing host evidence', async() => {
    const readAtomicTransactionCommitOutcomeContract = vi.fn(async() => createCommitOutcome({
      outcome: {
        ...createCommitOutcome().outcome!,
        kind: 'failed',
        rollbackRequired: true,
        retryable: true,
        recovery: 'retry'
      }
    }))
    const readRecoveryLogReplayRestoreSource = vi.fn(async() => createRecoverySource({
      selectedPackageIds: [otherPackageId],
      recoveryHost: {
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
      },
      effects: recoveryEffects({
        packageFilesRestored: true,
        rollbackExecuted: true
      } as never)
    } as never))
    const source = createThirdPartyDataPackRollbackRecoverySettlementSource({
      enabled: true,
      readAtomicTransactionCommitOutcomeContract,
      readRecoveryLogReplayRestoreSource
    })

    const result = await captureBlockedResult(source)

    expect(result.status).toBe('blocked')
    expect(result.outcomeKind).toBe('failed')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'install-target-consistent',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'contained-effects-intact',
        status: 'blocked'
      })
    ]))
    expect(result.effects.rollbackExecuted).toBe(false)
    expect(result.effects.packageFilesRestored).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('programDirectoryPath')
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })
})
