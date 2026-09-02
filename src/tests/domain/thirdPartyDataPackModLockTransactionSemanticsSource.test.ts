import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackModLockTransactionSemanticsSource,
  THIRD_PARTY_DATA_PACK_MOD_LOCK_TRANSACTION_SEMANTICS_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_MOD_LOCK_TRANSACTION_SEMANTICS_SOURCE_MODE,
  ThirdPartyDataPackModLockTransactionSemanticsBlockedError,
  type ThirdPartyDataPackModLockTransactionSemanticsSourceResult
} from '@/domain/mods/thirdPartyDataPackModLockTransactionSemanticsSource'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationEffectSummary,
  ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource'
import type {
  ThirdPartyDataPackRollbackRecoveryExecutionEffectSummary,
  ThirdPartyDataPackRollbackRecoveryExecutionSourceResult
} from '@/domain/mods/thirdPartyDataPackRollbackRecoveryExecutionSource'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from '@/domain/mods/thirdPartyDataPackUiIpcResultEnvelopeContract'

const packageId = 'sample_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const lockfileHash = testHash('d')

const summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
}

const postCommitEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationEffectSummary> = {}
): ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationEffectSummary => ({
  postCommitUiIpcDeliveryContinuationSourceCalled: true,
  postCommitPersistentReadWriteConnectionSourceCalled: true,
  uiIpcResponseDeliveryAcknowledgementConvergenceSourceCalled: true,
  postCommitPersistentReadWriteConnectionAcknowledged: true,
  uiIpcDeliveryAcknowledgementConverged: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  startupGateContinuationAllowed: true,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  launcherAppMounted: false,
  gameAppCreated: false,
  piniaCreated: false,
  routerMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  atomicCommitExecutorCalled: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveRead: false,
  saveCacheIsolationChecked: false,
  successEnvelopeDelivered: true,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
  uiIpcResponseDelivered: true,
  packageFilesWritten: true,
  packageBackupsWritten: true,
  packageFilesRestored: false,
  lockfileWritten: true,
  lockfileRestored: false,
  settingsWritten: true,
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

const rollbackEffects = (
  overrides: Partial<ThirdPartyDataPackRollbackRecoveryExecutionEffectSummary> = {}
): ThirdPartyDataPackRollbackRecoveryExecutionEffectSummary => ({
  rollbackRecoveryExecutionSourceCalled: true,
  rollbackRecoverySettlementSourceCalled: true,
  injectedRollbackRecoveryExecutionHostCalled: true,
  rollbackRecoveryExecutionHostCalled: true,
  rollbackRecoveryExecutionHostAccepted: true,
  rollbackRecoveryRequired: true,
  rollbackRecoverySettled: true,
  rollbackRecoveryExecutionAcknowledged: true,
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

const createPostCommit = (
  overrides: Partial<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult> = {}
): ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult => ({
  kind: 'third-party-post-commit-ui-ipc-delivery-continuation-source',
  mode: 'default-disabled-post-commit-ui-ipc-delivery-continuation-source',
  status: 'ready',
  reason: 'post-commit UI/IPC continuation accepted',
  readOnly: false,
  enabled: true,
  sourceCalled: true,
  postCommitPersistentReadWriteConnectionStatus: 'accepted',
  uiIpcResponseDeliveryAcknowledgementConvergenceStatus: 'ready',
  selectedPlatform: 'web',
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
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  envelopeKind: 'success',
  messageKey: 'mods.ui.ipc.result.install.success',
  deliverySummary: summary,
  acknowledgement: {
    status: 'acknowledged',
    platform: 'web',
    packageId,
    envelopeKind: 'success',
    messageKey: 'mods.ui.ipc.result.install.success'
  },
  persistentPackageWriteExecuted: true,
  persistentSettingsLockfileWriteExecuted: true,
  writtenFileCount: 2,
  backedUpFileCount: 1,
  transactionCommitConnectionAcknowledged: true,
  postCommitPersistentReadWriteConnectionAcknowledged: true,
  uiIpcDeliveryAcknowledged: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  startupGateContinuationAllowed: true,
  checks: [],
  diagnostics: [
    {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'info',
      stage: 'third-party.post-commit-ui-ipc-delivery-continuation-source.host-accepted',
      messageKey: 'mods.info.lifecycle.transaction.success',
      packageId,
      recovery: 'none'
    }
  ],
  effects: postCommitEffects(),
  ...overrides
})

const createSkippedPostCommit = (): ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult =>
  createPostCommit({
    status: 'skipped',
    reason: 'post-commit path skipped',
    readOnly: true,
    sourceCalled: false,
    requestedCommandId: undefined,
    targetPackageId: undefined,
    selectedPackageIds: [],
    loadOrder: [],
    registryCount: 54,
    entryCount: 4242,
    packageCount: 0,
    candidateIdentity: undefined,
    candidateHash: undefined,
    lockfileHash: undefined,
    envelopeKind: undefined,
    messageKey: undefined,
    acknowledgement: undefined,
    persistentPackageWriteExecuted: false,
    persistentSettingsLockfileWriteExecuted: false,
    writtenFileCount: 0,
    backedUpFileCount: 0,
    transactionCommitConnectionAcknowledged: false,
    postCommitPersistentReadWriteConnectionAcknowledged: false,
    uiIpcDeliveryAcknowledged: false,
    commandContinuationAllowed: false,
    uiIpcResultContinuationAllowed: false,
    startupGateContinuationAllowed: false,
    diagnostics: [],
    effects: postCommitEffects({
      postCommitPersistentReadWriteConnectionAcknowledged: false,
      uiIpcDeliveryAcknowledgementConverged: false,
      commandContinuationAllowed: false,
      uiIpcResultContinuationAllowed: false,
      startupGateContinuationAllowed: false,
      successEnvelopeDelivered: false,
      uiIpcResponseDelivered: false,
      packageFilesWritten: false,
      packageBackupsWritten: false,
      lockfileWritten: false,
      settingsWritten: false
    })
  })

const createRollback = (
  overrides: Partial<ThirdPartyDataPackRollbackRecoveryExecutionSourceResult> = {}
): ThirdPartyDataPackRollbackRecoveryExecutionSourceResult => ({
  kind: 'third-party-rollback-recovery-execution-source',
  mode: 'default-disabled-rollback-recovery-execution-source',
  status: 'executed',
  reason: 'rollback recovery execution acknowledged',
  readOnly: true,
  persistentWrite: false,
  enabled: true,
  sourceCalled: true,
  rollbackRecoverySettlementStatus: 'ready',
  rollbackRecoveryExecutionHostStatus: 'accepted',
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
  rollbackRecoverySettled: true,
  rollbackRecoveryExecutionAcknowledged: true,
  uiIpcResultContinuationAllowed: true,
  commandContinuationAllowed: true,
  diagnostics: [
    {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'info',
      stage: 'third-party.rollback-recovery-execution-source.host-accepted',
      messageKey: 'mods.info.lifecycle.transaction.rollback',
      packageId,
      recovery: 'none'
    }
  ],
  effects: rollbackEffects(),
  ...overrides
})

const captureBlockedResult = async(
  source: () => Promise<ThirdPartyDataPackModLockTransactionSemanticsSourceResult>
): Promise<ThirdPartyDataPackModLockTransactionSemanticsSourceResult> => {
  try {
    await source()
  } catch (error) {
    expect(error).toBeInstanceOf(ThirdPartyDataPackModLockTransactionSemanticsBlockedError)
    return (error as ThirdPartyDataPackModLockTransactionSemanticsBlockedError).result
  }
  throw new Error('expected mod-lock transaction semantics source to block')
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoPublicOrRuntimeEffects = (
  result: ThirdPartyDataPackModLockTransactionSemanticsSourceResult,
  stable: boolean,
  options: { readonly rollbackRestoreAllowed?: boolean } = {}
): void => {
  expect(result.publicModLockSchemaFrozen).toBe(false)
  expect(result.publicTransactionApiFrozen).toBe(false)
  expect(result.publicApiReleaseAllowed).toBe(false)
  expect(result.publicSchemaSetHashChanged).toBe(false)
  expect(result.effects.terminalSemanticsCandidateStable).toBe(stable)
  expect(result.effects.publicModLockSchemaFrozen).toBe(false)
  expect(result.effects.publicTransactionApiFrozen).toBe(false)
  expect(result.effects.publicApiReleaseAllowed).toBe(false)
  expect(result.effects.publicSchemaSetHashChanged).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.transactionLogPrepared).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.transactionLogRead).toBe(false)
  expect(result.effects.packageStateRead).toBe(false)
  expect(result.effects.settingsRead).toBe(false)
  expect(result.effects.lockfileRead).toBe(false)
  expect(result.effects.liveRegistryRead).toBe(false)
  expect(result.effects.saveRead).toBe(false)
  expect(result.effects.saveCacheIsolationChecked).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.packageFilesRestored).toBe(options.rollbackRestoreAllowed === true)
  expect(result.effects.rollbackExecuted).toBe(options.rollbackRestoreAllowed === true)
  expect('publicJsonSchema' in result).toBe(false)
  expect('lockfileDraft' in result).toBe(false)
  expect('candidateRegistrySet' in result).toBe(false)
  expect('programDirectoryPath' in result).toBe(false)
}

describe('third-party mod-lock transaction semantics source', () => {
  it('is disabled by default and does not read terminal sources', async() => {
    const readPostCommitUiIpcDeliveryContinuationSource = vi.fn()
    const readRollbackRecoveryExecutionSource = vi.fn()
    const source = createThirdPartyDataPackModLockTransactionSemanticsSource({
      readPostCommitUiIpcDeliveryContinuationSource,
      readRollbackRecoveryExecutionSource
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_MOD_LOCK_TRANSACTION_SEMANTICS_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_MOD_LOCK_TRANSACTION_SEMANTICS_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(readPostCommitUiIpcDeliveryContinuationSource).not.toHaveBeenCalled()
    expect(readRollbackRecoveryExecutionSource).not.toHaveBeenCalled()
    expectNoPublicOrRuntimeEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts post-commit UI/IPC success as internal candidate semantics without freezing public API', async() => {
    const readPostCommitUiIpcDeliveryContinuationSource = vi.fn(async() => createPostCommit())
    const readRollbackRecoveryExecutionSource = vi.fn()
    const source = createThirdPartyDataPackModLockTransactionSemanticsSource({
      enabled: true,
      readPostCommitUiIpcDeliveryContinuationSource,
      readRollbackRecoveryExecutionSource
    })

    const result = await source()

    expect(result.status).toBe('candidate-stable')
    expect(result.stability).toBe('internal-candidate')
    expect(result.postCommitUiIpcDeliveryContinuationStatus).toBe('ready')
    expect(result.rollbackRecoveryExecutionStatus).toBeUndefined()
    expect(result.outcomeKind).toBe('success')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.uiIpcResultContinuationAllowed).toBe(true)
    expect(result.startupGateContinuationAllowed).toBe(true)
    expect(result.persistentPackageWriteAcknowledged).toBe(true)
    expect(result.persistentSettingsLockfileWriteAcknowledged).toBe(true)
    expect(result.uiIpcDeliveryAcknowledged).toBe(true)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(readPostCommitUiIpcDeliveryContinuationSource).toHaveBeenCalledOnce()
    expect(readRollbackRecoveryExecutionSource).not.toHaveBeenCalled()
    expect(result.effects.successEnvelopeDelivered).toBe(true)
    expect(result.effects.packageFilesWritten).toBe(true)
    expect(result.effects.lockfileWritten).toBe(true)
    expect(result.effects.settingsWritten).toBe(true)
    expectNoPublicOrRuntimeEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('falls through a skipped post-commit path and accepts rollback recovery semantics', async() => {
    const readPostCommitUiIpcDeliveryContinuationSource = vi.fn(async() => createSkippedPostCommit())
    const readRollbackRecoveryExecutionSource = vi.fn(async() => createRollback({
      effects: rollbackEffects({
        packageFilesRestored: true,
        rollbackExecuted: true
      })
    }))
    const source = createThirdPartyDataPackModLockTransactionSemanticsSource({
      enabled: true,
      readPostCommitUiIpcDeliveryContinuationSource,
      readRollbackRecoveryExecutionSource
    })

    const result = await source()

    expect(result.status).toBe('candidate-stable')
    expect(result.postCommitUiIpcDeliveryContinuationStatus).toBeUndefined()
    expect(result.rollbackRecoveryExecutionStatus).toBe('executed')
    expect(result.outcomeKind).toBe('rollback')
    expect(result.recovery).toBe('restore-backup')
    expect(result.rollbackRequired).toBe(true)
    expect(result.rollbackRecoverySettled).toBe(true)
    expect(result.rollbackRecoveryExecutionAcknowledged).toBe(true)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.uiIpcResultContinuationAllowed).toBe(true)
    expect(result.effects.rollbackStateDelivered).toBe(true)
    expect(result.effects.rollbackRecoveryExecutionAcknowledged).toBe(true)
    expect(result.effects.packageFilesRestored).toBe(true)
    expect(result.effects.rollbackExecuted).toBe(true)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(readPostCommitUiIpcDeliveryContinuationSource).toHaveBeenCalledOnce()
    expect(readRollbackRecoveryExecutionSource).toHaveBeenCalledOnce()
    expectNoPublicOrRuntimeEffects(result, true, { rollbackRestoreAllowed: true })
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe terminal sources and redacts path-bearing evidence', async() => {
    const readPostCommitUiIpcDeliveryContinuationSource = vi.fn(async() => createPostCommit({
      webHost: { path: 'C:/Users/LENOVO/taoyuan/mods/sample_pack' },
      effects: postCommitEffects({
        transactionCommitted: true,
        savesWritten: true
      } as never),
      diagnostics: [
        {
          code: 'LIFECYCLE-TRANSACTION-001',
          ruleId: 'LIFECYCLE-TRANSACTION-001',
          severity: 'error',
          stage: 'third-party.mod-lock-transaction-semantics-source.host-unsafe',
          messageKey: 'mods.error.lifecycle.transaction.001',
          packageId,
          file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/mod-lock.json',
          recovery: 'retry'
        }
      ]
    } as unknown as Partial<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult>))
    const source = createThirdPartyDataPackModLockTransactionSemanticsSource({
      enabled: true,
      readPostCommitUiIpcDeliveryContinuationSource
    })

    const result = await captureBlockedResult(source)

    expect(result.status).toBe('blocked')
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.uiIpcResultContinuationAllowed).toBe(false)
    expect(result.checks).toContainEqual(expect.objectContaining({
      id: 'contained-effects-intact',
      status: 'blocked'
    }))
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.mod-lock-transaction-semantics-source.host-unsafe',
        packageId
      }),
      expect.objectContaining({
        stage: 'third-party.mod-lock-transaction-semantics-source.terminal-blocked',
        packageId
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('mod-lock.json')
    expect(serialized).not.toContain('webHost')
    expectNoPublicOrRuntimeEffects(result, false)
    expectJsonGraphFrozen(result)
  })
})
