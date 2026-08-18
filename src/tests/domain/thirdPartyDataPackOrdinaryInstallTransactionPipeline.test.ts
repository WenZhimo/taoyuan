import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackOrdinaryInstallTransactionPipeline,
  THIRD_PARTY_DATA_PACK_ORDINARY_INSTALL_TRANSACTION_PIPELINE_KIND,
  THIRD_PARTY_DATA_PACK_ORDINARY_INSTALL_TRANSACTION_PIPELINE_MODE,
  ThirdPartyDataPackOrdinaryInstallTransactionBlockedError,
  type ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult
} from '@/domain/mods/thirdPartyDataPackOrdinaryInstallTransactionPipeline'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackModLockTransactionSemanticsEffectSummary,
  ThirdPartyDataPackModLockTransactionSemanticsSourceResult
} from '@/domain/mods/thirdPartyDataPackModLockTransactionSemanticsSource'

const packageId = 'sample_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const lockfileHash = testHash('d')

const semanticsEffects = (
  overrides: Record<string, unknown> = {}
): ThirdPartyDataPackModLockTransactionSemanticsEffectSummary => ({
  modLockTransactionSemanticsSourceCalled: true,
  postCommitUiIpcDeliveryContinuationSourceCalled: true,
  rollbackRecoveryExecutionSourceCalled: false,
  terminalSemanticsCandidateStable: true,
  publicModLockSchemaFrozen: false,
  publicTransactionApiFrozen: false,
  publicApiReleaseAllowed: false,
  publicSchemaSetHashChanged: false,
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
  rollbackRecoverySettled: false,
  rollbackRecoveryExecutionAcknowledged: false,
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
}) as ThirdPartyDataPackModLockTransactionSemanticsEffectSummary

const createSemantics = (
  overrides: Partial<ThirdPartyDataPackModLockTransactionSemanticsSourceResult> & Record<string, unknown> = {}
): ThirdPartyDataPackModLockTransactionSemanticsSourceResult => ({
  kind: 'third-party-mod-lock-transaction-semantics-source',
  mode: 'default-disabled-mod-lock-transaction-semantics-source',
  status: 'candidate-stable',
  reason: 'mod-lock transaction semantics accepted',
  readOnly: false,
  enabled: true,
  sourceCalled: true,
  postCommitUiIpcDeliveryContinuationStatus: 'ready',
  semanticsVersion: 1,
  stability: 'internal-candidate',
  publicModLockSchemaFrozen: false,
  publicTransactionApiFrozen: false,
  publicApiReleaseAllowed: false,
  publicSchemaSetHashChanged: false,
  requestedCommandId: 'install',
  targetPackageId: packageId,
  outcomeKind: 'success',
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
  messageKey: 'mods.ui.ipc.result.install.success',
  recovery: 'none',
  retryable: false,
  rollbackRequired: false,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  startupGateContinuationAllowed: true,
  persistentPackageWriteAcknowledged: true,
  persistentSettingsLockfileWriteAcknowledged: true,
  uiIpcDeliveryAcknowledged: true,
  rollbackRecoverySettled: false,
  rollbackRecoveryExecutionAcknowledged: false,
  checks: [],
  diagnostics: [
    {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'info',
      stage: 'third-party.mod-lock-transaction-semantics-source.terminal-stable',
      messageKey: 'mods.info.lifecycle.transaction.success',
      packageId,
      recovery: 'none'
    }
  ],
  effects: semanticsEffects(),
  ...overrides
})

const createSkippedSemantics = (): ThirdPartyDataPackModLockTransactionSemanticsSourceResult =>
  createSemantics({
    status: 'skipped',
    reason: 'semantics skipped',
    readOnly: true,
    sourceCalled: false,
    postCommitUiIpcDeliveryContinuationStatus: undefined,
    requestedCommandId: undefined,
    targetPackageId: undefined,
    outcomeKind: undefined,
    selectedPackageIds: [],
    loadOrder: [],
    registryCount: 54,
    entryCount: 4242,
    packageCount: 0,
    candidateIdentity: undefined,
    candidateHash: undefined,
    lockfileHash: undefined,
    messageKey: undefined,
    commandContinuationAllowed: false,
    uiIpcResultContinuationAllowed: false,
    startupGateContinuationAllowed: false,
    persistentPackageWriteAcknowledged: false,
    persistentSettingsLockfileWriteAcknowledged: false,
    uiIpcDeliveryAcknowledged: false,
    diagnostics: [],
    effects: semanticsEffects({
      modLockTransactionSemanticsSourceCalled: false,
      postCommitUiIpcDeliveryContinuationSourceCalled: false,
      terminalSemanticsCandidateStable: false,
      successEnvelopeDelivered: false,
      uiIpcResponseDelivered: false,
      packageFilesWritten: false,
      packageBackupsWritten: false,
      lockfileWritten: false,
      settingsWritten: false
    })
  })

const createRollbackSemantics = (): ThirdPartyDataPackModLockTransactionSemanticsSourceResult =>
  createSemantics({
    readOnly: true,
    postCommitUiIpcDeliveryContinuationStatus: undefined,
    rollbackRecoveryExecutionStatus: 'executed',
    outcomeKind: 'rollback',
    messageKey: 'mods.atomic.commit.install.rollback',
    recovery: 'restore-backup',
    rollbackRequired: true,
    persistentPackageWriteAcknowledged: false,
    persistentSettingsLockfileWriteAcknowledged: false,
    uiIpcDeliveryAcknowledged: false,
    rollbackRecoverySettled: true,
    rollbackRecoveryExecutionAcknowledged: true,
    effects: semanticsEffects({
      postCommitUiIpcDeliveryContinuationSourceCalled: false,
      rollbackRecoveryExecutionSourceCalled: true,
      successEnvelopeDelivered: false,
      rollbackStateDelivered: true,
      uiIpcResponseDelivered: false,
      rollbackRecoverySettled: true,
      rollbackRecoveryExecutionAcknowledged: true,
      packageFilesWritten: false,
      packageBackupsWritten: false,
      lockfileWritten: false,
      settingsWritten: false
    })
  })

const captureBlockedResult = async(
  pipeline: () => Promise<ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult>
): Promise<ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult> => {
  try {
    await pipeline()
  } catch (error) {
    expect(error).toBeInstanceOf(ThirdPartyDataPackOrdinaryInstallTransactionBlockedError)
    return (error as ThirdPartyDataPackOrdinaryInstallTransactionBlockedError).result
  }
  throw new Error('expected ordinary install transaction pipeline to block')
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoPublicOrRealTransactionEffects = (
  result: ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult,
  ready: boolean
): void => {
  expect(result.publicModLockSchemaFrozen).toBe(false)
  expect(result.publicTransactionApiFrozen).toBe(false)
  expect(result.publicApiReleaseAllowed).toBe(false)
  expect(result.publicSchemaSetHashChanged).toBe(false)
  expect(result.effects.ordinaryInstallTransactionReady).toBe(ready)
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
  expect(result.effects.recoveryLogRead).toBe(false)
  expect(result.effects.recoveryLogReplayed).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect('modLockStorage' in result).toBe(false)
  expect('transactionLogStorage' in result).toBe(false)
  expect('publicJsonSchema' in result).toBe(false)
  expect('programDirectoryPath' in result).toBe(false)
}

describe('third-party ordinary install transaction pipeline', () => {
  it('is disabled by default and does not read mod-lock transaction semantics', async() => {
    const readModLockTransactionSemanticsSource = vi.fn()
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionPipeline({
      readModLockTransactionSemanticsSource
    })

    const result = await pipeline()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_ORDINARY_INSTALL_TRANSACTION_PIPELINE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_ORDINARY_INSTALL_TRANSACTION_PIPELINE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.pipelineCalled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(readModLockTransactionSemanticsSource).not.toHaveBeenCalled()
    expectNoPublicOrRealTransactionEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('accepts success semantics as an internal ordinary install transaction terminal', async() => {
    const readModLockTransactionSemanticsSource = vi.fn(async() => createSemantics())
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionPipeline({
      enabled: true,
      readModLockTransactionSemanticsSource
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.modLockTransactionSemanticsStatus).toBe('candidate-stable')
    expect(result.outcomeKind).toBe('success')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
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
    expect(result.effects.successOutcomeAccepted).toBe(true)
    expect(result.effects.packageFilesWritten).toBe(true)
    expect(result.effects.lockfileWritten).toBe(true)
    expect(result.effects.settingsWritten).toBe(true)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(readModLockTransactionSemanticsSource).toHaveBeenCalledOnce()
    expectNoPublicOrRealTransactionEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts rollback semantics as a settled ordinary install transaction terminal', async() => {
    const readModLockTransactionSemanticsSource = vi.fn(async() => createRollbackSemantics())
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionPipeline({
      enabled: true,
      readModLockTransactionSemanticsSource
    })

    const result = await pipeline()

    expect(result.status).toBe('ready')
    expect(result.outcomeKind).toBe('rollback')
    expect(result.recovery).toBe('restore-backup')
    expect(result.rollbackRequired).toBe(true)
    expect(result.rollbackRecoverySettled).toBe(true)
    expect(result.rollbackRecoveryExecutionAcknowledged).toBe(true)
    expect(result.effects.rollbackOutcomeAccepted).toBe(true)
    expect(result.effects.rollbackStateDelivered).toBe(true)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expectNoPublicOrRealTransactionEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('keeps skipped semantics as a skipped transaction without fabricating readiness', async() => {
    const readModLockTransactionSemanticsSource = vi.fn(async() => createSkippedSemantics())
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionPipeline({
      enabled: true,
      readModLockTransactionSemanticsSource
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.modLockTransactionSemanticsStatus).toBe('skipped')
    expect(result.ordinaryInstallTransactionReady).toBe(false)
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.uiIpcResultContinuationAllowed).toBe(false)
    expect(readModLockTransactionSemanticsSource).toHaveBeenCalledOnce()
    expectNoPublicOrRealTransactionEffects(result, false)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe terminal semantics and redacts path-bearing evidence', async() => {
    const readModLockTransactionSemanticsSource = vi.fn(async() => createSemantics({
      programDirectoryPath: 'C:/Users/LENOVO/taoyuan',
      effects: semanticsEffects({
        transactionCommitted: true,
        savesWritten: true
      }),
      diagnostics: [
        {
          code: 'LIFECYCLE-TRANSACTION-001',
          ruleId: 'LIFECYCLE-TRANSACTION-001',
          severity: 'error',
          stage: 'third-party.ordinary-install-transaction-pipeline.host-unsafe',
          messageKey: 'C:/Users/LENOVO/taoyuan/userdata/mod-lock.json',
          packageId,
          recovery: 'retry'
        }
      ]
    }))
    const pipeline = createThirdPartyDataPackOrdinaryInstallTransactionPipeline({
      enabled: true,
      readModLockTransactionSemanticsSource
    })

    const result = await captureBlockedResult(pipeline)

    expect(result.status).toBe('blocked')
    expect(result.ordinaryInstallTransactionReady).toBe(false)
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.uiIpcResultContinuationAllowed).toBe(false)
    expect(result.checks).toContainEqual(expect.objectContaining({
      id: 'contained-effects-intact',
      status: 'blocked'
    }))
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.ordinary-install-transaction-pipeline.host-unsafe',
        packageId
      }),
      expect.objectContaining({
        stage: 'third-party.ordinary-install-transaction-pipeline.terminal-blocked',
        packageId
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('mod-lock.json')
    expect(serialized).not.toContain('programDirectoryPath')
    expectNoPublicOrRealTransactionEffects(result, false)
    expectJsonGraphFrozen(result)
  })
})
