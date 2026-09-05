import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackRollbackRecoveryExecutionSource,
  THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_EXECUTION_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_EXECUTION_SOURCE_MODE,
  ThirdPartyDataPackRollbackRecoveryExecutionBlockedError,
  type ThirdPartyDataPackRollbackRecoveryExecutionHostEffectSummary,
  type ThirdPartyDataPackRollbackRecoveryExecutionSourceResult
} from '@/domain/mods/thirdPartyDataPackRollbackRecoveryExecutionSource'
import type {
  ThirdPartyDataPackRollbackRecoverySettlementEffectSummary,
  ThirdPartyDataPackRollbackRecoverySettlementSourceResult
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

const lockfileHash = testHash('d')
const otherCandidateHash = testHash('e')

const settlementEffects = (
  overrides: Partial<ThirdPartyDataPackRollbackRecoverySettlementEffectSummary> = {}
): ThirdPartyDataPackRollbackRecoverySettlementEffectSummary => ({
  rollbackRecoverySettlementSourceCalled: true,
  atomicTransactionCommitOutcomeContractSourceCalled: true,
  recoveryLogReplayRestoreSourceCalled: true,
  rollbackRecoveryRequired: true,
  rollbackRecoveryAcknowledged: true,
  uiIpcResultContinuationAllowed: true,
  commandContinuationAllowed: true,
  successOutcomeAccepted: false,
  failureOutcomeAccepted: false,
  retryOutcomeAccepted: false,
  rollbackOutcomeAccepted: true,
  recoveryLogReplayRestoreHostCalled: true,
  recoveryLogReplayRestoreHostAccepted: true,
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

const createSettlement = (
  overrides: Partial<ThirdPartyDataPackRollbackRecoverySettlementSourceResult> = {}
): ThirdPartyDataPackRollbackRecoverySettlementSourceResult => ({
  kind: 'third-party-rollback-recovery-settlement-source',
  mode: 'default-disabled-rollback-recovery-settlement-source',
  status: 'ready',
  reason: 'third-party rollback recovery settlement accepted matching atomic outcome and recovery acknowledgement',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  atomicTransactionCommitOutcomeContractStatus: 'ready',
  recoveryLogReplayRestoreSourceStatus: 'executed',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  outcomeKind: 'rollback',
  messageKey: 'mods.atomic.commit.install.rollback',
  recovery: 'restore-backup',
  retryable: false,
  rollbackRequired: true,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  recoveryLogReplayRestoreHostAccepted: true,
  rollbackRecoverySettled: true,
  uiIpcResultContinuationAllowed: true,
  commandContinuationAllowed: true,
  checks: [],
  diagnostics: [
    {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'info',
      stage: 'third-party.rollback-recovery-settlement-source.host-accepted',
      messageKey: 'mods.info.lifecycle.transaction.rollbackRecoverySettled',
      packageId,
      recovery: 'none'
    }
  ],
  effects: settlementEffects(),
  ...overrides
})

const createAcceptedHostResult = (
  overrides: Record<string, unknown> = {}
) => ({
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
      stage: 'third-party.rollback-recovery-execution-source.host-accepted',
      messageKey: 'mods.info.lifecycle.transaction.rollbackRecoveryExecutionHostAccepted',
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
  throw new Error('expected rollback recovery execution source to block')
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

describe('third-party rollback recovery execution source', () => {
  it('is disabled by default and does not read settlement or call host', async() => {
    const readRollbackRecoverySettlementSource = vi.fn()
    const executeRollbackRecovery = vi.fn()
    const source = createThirdPartyDataPackRollbackRecoveryExecutionSource({
      readRollbackRecoverySettlementSource,
      executeRollbackRecovery
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_EXECUTION_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_ROLLBACK_RECOVERY_EXECUTION_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.readOnly).toBe(true)
    expect(result.persistentWrite).toBe(false)
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(readRollbackRecoverySettlementSource).not.toHaveBeenCalled()
    expect(executeRollbackRecovery).not.toHaveBeenCalled()
    expect(result.rollbackRecoveryExecutionAcknowledged).toBe(false)
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('skips execution host for committed settlement while allowing continuation', async() => {
    const committedSettlement = createSettlement({
      status: 'skipped',
      reason: 'third-party rollback recovery settlement is not required for committed outcomes',
      outcomeKind: 'committed',
      recovery: 'none',
      retryable: false,
      rollbackRequired: false,
      rollbackRecoverySettled: false,
      recoveryLogReplayRestoreHostAccepted: false,
      effects: settlementEffects({
        recoveryLogReplayRestoreSourceCalled: false,
        rollbackRecoveryRequired: false,
        rollbackRecoveryAcknowledged: false,
        successOutcomeAccepted: true,
        rollbackOutcomeAccepted: false,
        recoveryLogReplayRestoreHostCalled: false,
        recoveryLogReplayRestoreHostAccepted: false
      })
    })
    const readRollbackRecoverySettlementSource = vi.fn(async() => committedSettlement)
    const executeRollbackRecovery = vi.fn()
    const source = createThirdPartyDataPackRollbackRecoveryExecutionSource({
      enabled: true,
      readRollbackRecoverySettlementSource,
      executeRollbackRecovery
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.outcomeKind).toBe('committed')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.uiIpcResultContinuationAllowed).toBe(true)
    expect(result.rollbackRecoveryExecutionAcknowledged).toBe(false)
    expect(readRollbackRecoverySettlementSource).toHaveBeenCalledOnce()
    expect(executeRollbackRecovery).not.toHaveBeenCalled()
    expect(result.effects.successOutcomeAccepted).toBe(true)
    expect(result.effects.rollbackRecoveryExecutionHostCalled).toBe(false)
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('executes an injected path-free rollback recovery acknowledgement after settlement', async() => {
    const executeRollbackRecovery = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope).toMatchObject({
        requestedCommandId: 'install',
        targetPackageId: packageId,
        outcomeKind: 'rollback',
        recovery: 'restore-backup',
        retryable: false,
        rollbackRequired: true,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        blockedCandidateCount: 0,
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        candidateIdentity,
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
    const source = createThirdPartyDataPackRollbackRecoveryExecutionSource({
      enabled: true,
      readRollbackRecoverySettlementSource: async() => createSettlement(),
      executeRollbackRecovery
    })

    const result = await source()

    expect(result.status).toBe('executed')
    expect(result.rollbackRecoverySettlementStatus).toBe('ready')
    expect(result.rollbackRecoveryExecutionHostStatus).toBe('accepted')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.outcomeKind).toBe('rollback')
    expect(result.messageKey).toBe('mods.atomic.commit.install.rollback')
    expect(result.recovery).toBe('restore-backup')
    expect(result.rollbackRequired).toBe(true)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.rollbackRecoverySettled).toBe(true)
    expect(result.rollbackRecoveryExecutionAcknowledged).toBe(true)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.uiIpcResultContinuationAllowed).toBe(true)
    expect(executeRollbackRecovery).toHaveBeenCalledOnce()
    expect(result.effects.rollbackOutcomeAccepted).toBe(true)
    expect(result.effects.rollbackRecoveryExecutionHostCalled).toBe(true)
    expect(result.effects.rollbackRecoveryExecutionHostAccepted).toBe(true)
    expect(result.effects.rollbackRecoveryExecutionAcknowledged).toBe(true)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.rollback-recovery-execution-source.host-accepted',
        packageId
      })
    ]))
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('threads real recovery replay and restore evidence through execution acknowledgement', async() => {
    const executeRollbackRecovery = vi.fn(async() => createAcceptedHostResult({
      effects: hostEffects({
        realRecoveryLogReplayRestoreCalled: true,
        recoveryLogRead: true,
        recoveryLogReplayed: true,
        packageFilesRestored: true,
        rollbackExecuted: true
      })
    }))
    const source = createThirdPartyDataPackRollbackRecoveryExecutionSource({
      enabled: true,
      readRollbackRecoverySettlementSource: async() => createSettlement({
        effects: settlementEffects({
          realRecoveryLogReplayRestoreCalled: true,
          recoveryLogRead: true,
          recoveryLogReplayed: true,
          packageFilesRestored: true,
          rollbackExecuted: true
        })
      }),
      executeRollbackRecovery
    })

    const result = await source()

    expect(result.status).toBe('executed')
    expect(result.effects.realRecoveryLogReplayRestoreCalled).toBe(true)
    expect(result.effects.recoveryLogRead).toBe(true)
    expect(result.effects.recoveryLogReplayed).toBe(true)
    expect(result.effects.packageFilesRestored).toBe(true)
    expect(result.effects.rollbackExecuted).toBe(true)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.transactionLogPrepared).toBe(false)
    expect(result.effects.runtimePublicationCommitted).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expect(executeRollbackRecovery).toHaveBeenCalledOnce()
    expectJsonGraphFrozen(result)
  })

  it('blocks divergent host acknowledgement before continuation', async() => {
    const executeRollbackRecovery = vi.fn(async() => createAcceptedHostResult({
      candidateHash: otherCandidateHash,
      targetPackageId: otherPackageId
    }))
    const source = createThirdPartyDataPackRollbackRecoveryExecutionSource({
      enabled: true,
      readRollbackRecoverySettlementSource: async() => createSettlement(),
      executeRollbackRecovery
    })

    const result = await captureBlockedResult(source)

    expect(result.status).toBe('blocked')
    expect(result.rollbackRecoveryExecutionHostStatus).toBe('accepted')
    expect(result.rollbackRecoveryExecutionAcknowledged).toBe(false)
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.uiIpcResultContinuationAllowed).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.rollback-recovery-execution-source.execution-blocked',
        packageId
      })
    ]))
    expect(executeRollbackRecovery).toHaveBeenCalledOnce()
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe execution host effects and redacts path-bearing evidence', async() => {
    const executeRollbackRecovery = vi.fn(async() => createAcceptedHostResult({
      programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
      diagnostics: [
        {
          code: 'LIFECYCLE-TRANSACTION-001',
          ruleId: 'LIFECYCLE-TRANSACTION-001',
          severity: 'error',
          stage: 'third-party.rollback-recovery-execution-source.host-unsafe',
          messageKey: 'mods.error.lifecycle.transaction.001',
          packageId,
          file: 'C:/Users/LENOVO/taoyuan/userdata/recovery-log.json',
          recovery: 'retry'
        }
      ],
      effects: hostEffects({
        packageFilesRestored: true,
        rollbackExecuted: true
      } as never)
    }))
    const source = createThirdPartyDataPackRollbackRecoveryExecutionSource({
      enabled: true,
      readRollbackRecoverySettlementSource: async() => createSettlement(),
      executeRollbackRecovery
    })

    const result = await captureBlockedResult(source)

    expect(result.status).toBe('blocked')
    expect(result.rollbackRecoveryExecutionAcknowledged).toBe(false)
    expect(result.effects.rollbackRecoveryExecutionHostCalled).toBe(true)
    expect(result.effects.packageFilesRestored).toBe(false)
    expect(result.effects.rollbackExecuted).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.rollback-recovery-execution-source.host-unsafe',
        packageId
      }),
      expect.objectContaining({
        stage: 'third-party.rollback-recovery-execution-source.unsafe-execution-host-result',
        packageId
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('recovery-log.json')
    expect(serialized).not.toContain('programDirectoryPath')
    expectNoRealRecoveryOrWrites(result)
    expectJsonGraphFrozen(result)
  })
})
