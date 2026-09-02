import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline'
import {
  ThirdPartyDataPackOrdinaryInstallTransactionBlockedError,
  type ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult
} from '@/domain/mods/thirdPartyDataPackOrdinaryInstallTransactionPipeline'
import type {
  ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationEffectSummary,
  ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource'
import type {
  ThirdPartyDataPackRollbackRecoveryExecutionEffectSummary,
  ThirdPartyDataPackRollbackRecoveryExecutionSourceResult
} from '@/domain/mods/thirdPartyDataPackRollbackRecoveryExecutionSource'

const packageId = 'sample_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const lockfileHash = testHash('d')

const terminalSummary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
} as const

const postCommitEffects = (
  overrides: Record<string, unknown> = {}
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
} as unknown as ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationEffectSummary)

const rollbackEffects = (
  overrides: Record<string, unknown> = {}
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
} as unknown as ThirdPartyDataPackRollbackRecoveryExecutionEffectSummary)

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
  selectedPlatform: 'electron',
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
  deliverySummary: terminalSummary,
  acknowledgement: {
    status: 'acknowledged',
    platform: 'electron',
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
  diagnostics: [],
  effects: postCommitEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult)

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

const createRollback = (): ThirdPartyDataPackRollbackRecoveryExecutionSourceResult => ({
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
  diagnostics: [],
  effects: rollbackEffects({
    packageFilesRestored: true,
    rollbackExecuted: true
  })
} as unknown as ThirdPartyDataPackRollbackRecoveryExecutionSourceResult)

const captureBlockedResult = async(
  pipeline: () => Promise<ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult>
): Promise<ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult> => {
  try {
    await pipeline()
  } catch (error) {
    expect(error).toBeInstanceOf(ThirdPartyDataPackOrdinaryInstallTransactionBlockedError)
    return (error as ThirdPartyDataPackOrdinaryInstallTransactionBlockedError).result
  }
  throw new Error('expected ordinary install terminal connection pipeline to block')
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealTransactionEffects = (
  result: ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult,
  ready: boolean,
  options: { readonly rollbackRestoreAllowed?: boolean } = {}
): void => {
  expect(result.ordinaryInstallTransactionReady).toBe(ready)
  expect(result.publicModLockSchemaFrozen).toBe(false)
  expect(result.publicTransactionApiFrozen).toBe(false)
  expect(result.publicApiReleaseAllowed).toBe(false)
  expect(result.publicSchemaSetHashChanged).toBe(false)
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
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.packageFilesRestored).toBe(options.rollbackRestoreAllowed === true)
  expect(result.effects.rollbackExecuted).toBe(options.rollbackRestoreAllowed === true)
  expect('postCommitUiIpcDeliveryContinuationSource' in result).toBe(false)
  expect('rollbackRecoveryExecutionSource' in result).toBe(false)
  expect('programDirectoryPath' in result).toBe(false)
}

describe('third-party ordinary install transaction terminal connection pipeline', () => {
  it('is disabled by default and does not read terminal sources', async() => {
    const readPostCommitUiIpcDeliveryContinuationSource = vi.fn()
    const readRollbackRecoveryExecutionSource = vi.fn()
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline({
      readPostCommitUiIpcDeliveryContinuationSource,
      readRollbackRecoveryExecutionSource
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.pipelineCalled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readPostCommitUiIpcDeliveryContinuationSource).not.toHaveBeenCalled()
    expect(readRollbackRecoveryExecutionSource).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRealTransactionEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('threads a post-commit UI/IPC terminal source into ordinary install readiness', async() => {
    const calls: string[] = []
    const readPostCommitUiIpcDeliveryContinuationSource = vi.fn(async() => {
      calls.push('post-commit-terminal')
      return createPostCommit()
    })
    const readRollbackRecoveryExecutionSource = vi.fn()
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline({
      enabled: true,
      readPostCommitUiIpcDeliveryContinuationSource,
      readRollbackRecoveryExecutionSource
    })

    const result = await pipeline()

    expect(calls).toEqual(['post-commit-terminal'])
    expect(readRollbackRecoveryExecutionSource).not.toHaveBeenCalled()
    expect(result.status).toBe('ready')
    expect(result.modLockTransactionSemanticsStatus).toBe('candidate-stable')
    expect(result.outcomeKind).toBe('success')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentPackageWriteAcknowledged).toBe(true)
    expect(result.persistentSettingsLockfileWriteAcknowledged).toBe(true)
    expect(result.uiIpcDeliveryAcknowledged).toBe(true)
    expect(result.effects.successOutcomeAccepted).toBe(true)
    expect(result.effects.packageFilesWritten).toBe(true)
    expect(result.effects.settingsWritten).toBe(true)
    expect(result.effects.lockfileWritten).toBe(true)
    expectNoRealTransactionEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('falls through skipped post-commit and accepts rollback recovery terminal source', async() => {
    const calls: string[] = []
    const readPostCommitUiIpcDeliveryContinuationSource = vi.fn(async() => {
      calls.push('post-commit-skipped')
      return createSkippedPostCommit()
    })
    const readRollbackRecoveryExecutionSource = vi.fn(async() => {
      calls.push('rollback-terminal')
      return createRollback()
    })
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline({
      enabled: true,
      readPostCommitUiIpcDeliveryContinuationSource,
      readRollbackRecoveryExecutionSource
    })

    const result = await pipeline()

    expect(calls).toEqual(['post-commit-skipped', 'rollback-terminal'])
    expect(result.status).toBe('ready')
    expect(result.outcomeKind).toBe('rollback')
    expect(result.rollbackRequired).toBe(true)
    expect(result.rollbackRecoverySettled).toBe(true)
    expect(result.rollbackRecoveryExecutionAcknowledged).toBe(true)
    expect(result.effects.rollbackOutcomeAccepted).toBe(true)
    expect(result.effects.packageFilesRestored).toBe(true)
    expect(result.effects.rollbackExecuted).toBe(true)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expectNoRealTransactionEffects(result, true, { rollbackRestoreAllowed: true })
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe terminal sources without exposing host paths', async() => {
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionTerminalConnectionPipeline({
      enabled: true,
      readPostCommitUiIpcDeliveryContinuationSource: async() => createPostCommit({
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.ordinary-install-terminal-connection.host-unsafe',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/userdata/mod-lock.json',
            recovery: 'retry'
          } as never
        ],
        effects: postCommitEffects({
          transactionCommitted: true,
          savesWritten: true
        })
      } as unknown as Partial<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult>)
    })

    const result = await captureBlockedResult(pipeline)

    expect(result.status).toBe('blocked')
    expect(result.ordinaryInstallTransactionReady).toBe(false)
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.uiIpcResultContinuationAllowed).toBe(false)
    expect(result.modLockTransactionSemanticsStatus).toBe('blocked')
    expect(result.checks).toContainEqual(expect.objectContaining({
      id: 'mod-lock-transaction-semantics-candidate-stable',
      status: 'blocked'
    }))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('mod-lock.json')
    expect(serialized).not.toContain('programDirectoryPath')
    expectNoRealTransactionEffects(result, false)
    expectJsonGraphFrozen(result)
  })
})
