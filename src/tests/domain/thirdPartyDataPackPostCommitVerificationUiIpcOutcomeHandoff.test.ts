import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract,
  type ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  type ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitOutcomeContract'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary,
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import {
  executeThirdPartyDataPackPostCommitVerificationExecutorAdapter,
  type ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult,
  type ThirdPartyDataPackPostCommitVerificationExecutorHost,
  type ThirdPartyDataPackPostCommitVerificationOutcomeKind
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorAdapter'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary,
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorPreflight'
import {
  buildThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff,
  type ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'
import {
  buildThirdPartyDataPackUiIpcResultNormalizationPreflight,
  type ThirdPartyDataPackUiIpcResultNormalizationEffectSummary,
  type ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from '@/domain/mods/thirdPartyDataPackUiIpcResultNormalizationPreflight'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const alternatePackageId = 'alternate_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
} as const

const lockfileHash = testHash('d')

const atomicEffects: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary = {
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
  diagnosticsWritten: false
}

const verificationPreflightEffects: ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary = {
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
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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
}

const normalizationEffects: ThirdPartyDataPackUiIpcResultNormalizationEffectSummary = {
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
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
  successEnvelopeDelivered: false,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
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
}

const createAtomicPreflight = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult => ({
  status: 'deferred',
  transactionCommandDispatcherHandoffStatus: 'deferred',
  installTransactionDispatchPlanStatus: 'deferred',
  runtimePublicationCommitAdapterStatus: 'deferred',
  reason: 'atomic transaction commit executor preflight is inspect-only until real transaction-log, package, settings, lockfile, runtime publication and rollback adapters exist',
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
  atomicTransactionCommitExecutorPreflight: 'deferred',
  readOnly: true,
  atomicCommitExecutionAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimePublicationCommitAllowed: false,
  runtimeEnablementAllowed: false,
  postCommitVerificationAllowed: false,
  uiIpcResponseAllowed: false,
  rollbackRecoveryAllowed: false,
  executorChecks: [],
  executorStages: [
    {
      id: 'atomic-commit-executor-preflight-inspection',
      status: 'satisfied',
      requirementIds: ['atomic-transaction-commit-executor'],
      reason: 'Atomic commit executor preflight is inspect-only.'
    },
    {
      id: 'post-commit-verification-handoff',
      status: 'deferred',
      requirementIds: ['post-commit-verification-executor'],
      reason: 'Post-commit verification handoff remains deferred.'
    },
    {
      id: 'ui-ipc-result-normalization',
      status: 'deferred',
      requirementIds: ['path-free-ui-ipc-result-normalizer'],
      reason: 'UI/IPC result normalization remains deferred.'
    }
  ],
  executorRequirements: [
    {
      id: 'path-free-ui-ipc-result-normalizer',
      status: 'required',
      reason: 'Future UI or IPC results must expose only redacted outcome summaries.'
    }
  ],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'deferred',
    transactionLogWriteProbeStatus: 'deferred',
    modLockPersistentWriteExecuted: false,
    transactionLogPersistentWriteExecuted: false
  },
  effects: atomicEffects,
  ...overrides
})

const createVerificationPreflight = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult => ({
  status: 'deferred',
  transactionCommandDispatcherHandoffStatus: 'deferred',
  reason: 'post-commit verification executor preflight is inspect-only until real committed state, live registry identity and UI/IPC result delivery exist',
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
  postCommitVerificationExecutorPreflight: 'deferred',
  readOnly: true,
  verificationExecutionAllowed: false,
  postCommitVerificationAllowed: false,
  transactionLogReadAllowed: false,
  packageStateReadAllowed: false,
  settingsReadAllowed: false,
  lockfileReadAllowed: false,
  liveRegistryReadAllowed: false,
  saveCacheIsolationCheckAllowed: false,
  rollbackTriggerAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  executorChecks: [],
  executorStages: [
    {
      id: 'post-commit-executor-preflight-inspection',
      status: 'satisfied',
      requirementIds: ['committed-transaction-log-source'],
      reason: 'Post-commit executor preflight is inspect-only.'
    },
    {
      id: 'ui-ipc-result-normalization',
      status: 'deferred',
      requirementIds: ['path-free-ui-ipc-result-normalizer'],
      reason: 'UI/IPC result normalization remains deferred.'
    },
    {
      id: 'rollback-recovery-trigger',
      status: 'deferred',
      requirementIds: ['rollback-recovery-trigger'],
      reason: 'Rollback trigger remains deferred.'
    }
  ],
  executorRequirements: [
    {
      id: 'path-free-ui-ipc-result-normalizer',
      status: 'required',
      reason: 'Future UI or IPC results must expose only redacted outcome summaries.'
    }
  ],
  effects: verificationPreflightEffects,
  ...overrides
})

const createVerificationHost = (
  kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind
): ThirdPartyDataPackPostCommitVerificationExecutorHost => ({
  kind: 'injected-post-commit-verification-executor',
  mode: 'injected-test-only',
  execute: request => ({
    kind,
    settled: true,
    packageId: request.packageId,
    candidateIdentity: request.candidateIdentity,
    lockfileHash: request.lockfileHash,
    transactionLogMatched: kind === 'verified',
    packageStateMatched: kind === 'verified',
    settingsLockfileMatched: kind === 'verified',
    liveRegistryMatched: kind === 'verified',
    saveCacheIsolated: kind === 'verified',
    recovery: kind === 'rollback' ? 'restore-backup' : kind === 'retry' ? 'retry' : 'none',
    retryable: kind === 'retry',
    rollbackRequired: kind === 'rollback'
  })
})

const createNormalizationPreflight = (
  overrides: Partial<ThirdPartyDataPackUiIpcResultNormalizationPreflightResult> = {}
): ThirdPartyDataPackUiIpcResultNormalizationPreflightResult => ({
  ...buildThirdPartyDataPackUiIpcResultNormalizationPreflight({
    atomicTransactionCommitExecutorPreflight: createAtomicPreflight(),
    postCommitVerificationExecutorPreflight: createVerificationPreflight()
  }),
  effects: normalizationEffects,
  ...overrides
})

const createAtomicOutcomeContract = (
  kind: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind = 'committed',
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult => ({
  ...buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract({
    preflight: createAtomicPreflight(),
    outcome: {
      kind,
      settled: true,
      packageId,
      candidateIdentity,
      lockfileHash,
      recovery: kind === 'rollback' ? 'restore-backup' : kind === 'retry' ? 'retry' : 'none',
      retryable: kind === 'retry',
      rollbackRequired: kind === 'rollback'
    }
  }),
  ...overrides
})

const createVerificationAdapterResult = async (
  kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind = 'verified',
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult> = {}
): Promise<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult> => ({
  ...await executeThirdPartyDataPackPostCommitVerificationExecutorAdapter({
    preflight: createVerificationPreflight(),
    host: createVerificationHost(kind)
  }),
  ...overrides
})

const createReadyInputs = async (
  overrides: {
    readonly preflight?: Partial<ThirdPartyDataPackUiIpcResultNormalizationPreflightResult>
    readonly atomic?: Partial<ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult>
    readonly verification?: Partial<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult>
    readonly atomicKind?: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
    readonly verificationKind?: ThirdPartyDataPackPostCommitVerificationOutcomeKind
  } = {}
) => ({
  resultNormalizationPreflight: createNormalizationPreflight(overrides.preflight),
  atomicCommitOutcomeContract: createAtomicOutcomeContract(overrides.atomicKind, overrides.atomic),
  postCommitVerificationExecutorAdapter: await createVerificationAdapterResult(
    overrides.verificationKind,
    overrides.verification
  )
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealEffects = (
  result: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult,
  prepared: boolean
): void => {
  expect(result.uiIpcResponseDeliveryAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.atomicCommitExecutionAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.runtimePublicationCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
  expect(result.effects.atomicCommitOutcomeConsumed).toBe(prepared)
  expect(result.effects.postCommitVerificationOutcomeConsumed).toBe(prepared)
  expect(result.effects.uiIpcOutcomePrepared).toBe(prepared)
  const {
    atomicCommitOutcomeConsumed: _atomicCommitOutcomeConsumed,
    postCommitVerificationOutcomeConsumed: _postCommitVerificationOutcomeConsumed,
    uiIpcOutcomePrepared: _uiIpcOutcomePrepared,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

const expectBlockedCheck = (
  result: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult,
  id: string
): void => {
  expect(result.status).toBe('blocked')
  expect(result.outcome).toBeUndefined()
  expect(result.checks.find(check => check.id === id)?.status).toBe('blocked')
  expect(result.diagnostics.some(diagnostic => diagnostic.stage.endsWith(id))).toBe(true)
  expectNoRealEffects(result, false)
}

describe('third-party post-commit verification UI/IPC outcome handoff', () => {
  it('prepares a verified commit as a frozen path-free success outcome without delivery effects', async () => {
    const result = buildThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff(await createReadyInputs())

    expect(result.status).toBe('ready')
    expect(result.postCommitVerificationUiIpcOutcomeHandoff).toBe('ready')
    expect(result.uiIpcOutcomePrepared).toBe(true)
    expect(result.resultNormalizationPreflightStatus).toBe('deferred')
    expect(result.atomicCommitOutcomeContractStatus).toBe('ready')
    expect(result.postCommitVerificationExecutorAdapterStatus).toBe('executed')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.blockedCandidateCount).toBe(0)
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.packageCount).toBe(1)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.summary).toEqual({
      selectedPackageCount: 1,
      blockedPackageCount: 0,
      blockedCandidateCount: 0,
      loadOrderCount: 1,
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      diagnosticCount: 0
    })
    expect(result.outcome).toEqual({
      kind: 'success',
      settled: true,
      packageId,
      candidateIdentity,
      lockfileHash,
      diagnostics: [],
      messageKey: 'mods.ui.ipc.result.install.success',
      recovery: 'none',
      retryable: false,
      rollbackRequired: false
    })
    expect('preflight' in result).toBe(false)
    expect('atomicPreflight' in result).toBe(false)
    expect('verificationPreflight' in result).toBe(false)
    expect('verificationRequest' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoRealEffects(result, true)
    expectJsonGraphFrozen(result)
  })

  it('maps failed, retry and rollback post-commit outcomes into UI/IPC outcome sources', async () => {
    const cases = [
      {
        atomicKind: 'failed' as const,
        verificationKind: 'failed' as const,
        expectedKind: 'failure' as const,
        expectedRecovery: 'none' as const,
        expectedRetryable: false,
        expectedRollbackRequired: false
      },
      {
        atomicKind: 'retry' as const,
        verificationKind: 'retry' as const,
        expectedKind: 'retry' as const,
        expectedRecovery: 'retry' as const,
        expectedRetryable: true,
        expectedRollbackRequired: false
      },
      {
        atomicKind: 'rollback' as const,
        verificationKind: 'rollback' as const,
        expectedKind: 'rollback' as const,
        expectedRecovery: 'restore-backup' as const,
        expectedRetryable: false,
        expectedRollbackRequired: true
      }
    ]

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff(await createReadyInputs(currentCase))

      expect(result.status).toBe('ready')
      expect(result.outcomeKind).toBe(currentCase.expectedKind)
      expect(result.messageKey).toBe(`mods.ui.ipc.result.install.${currentCase.expectedKind}`)
      expect(result.outcome).toMatchObject({
        kind: currentCase.expectedKind,
        recovery: currentCase.expectedRecovery,
        retryable: currentCase.expectedRetryable,
        rollbackRequired: currentCase.expectedRollbackRequired
      })
      expectNoRealEffects(result, true)
    }
  })

  it('skips or blocks unsafe upstream states while stripping path-bearing diagnostics', async () => {
    const skipped = buildThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff(await createReadyInputs({
      preflight: {
        status: 'skipped',
        reason: 'no selected third-party data packs',
        requestedCommandId: undefined,
        targetPackageId: undefined,
        selectedPackageIds: [],
        loadOrder: [],
        registryCount: 54,
        entryCount: 4242,
        packageCount: 0,
        candidateIdentity: undefined,
        lockfileHash: undefined
      }
    }))
    const blocked = buildThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff(await createReadyInputs({
      preflight: {
        status: 'blocked',
        reason: 'normalization blocked before handoff',
        diagnostics: [
          createDiagnostic('LIFECYCLE-TRANSACTION-001', {
            stage: 'third-party.post-commit-verification-ui-ipc-outcome-handoff.path-strip-test',
            severity: 'error',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/outcome.json',
            fieldPath: '/outcome/C:/Users/LENOVO',
            details: {
              hostPath: 'C:/Users/LENOVO/taoyuan/mods/sample_pack',
              message: 'contains private path'
            },
            recovery: 'retry'
          })
        ]
      }
    }))

    expect(skipped.status).toBe('skipped')
    expect(skipped.uiIpcOutcomePrepared).toBe(false)
    expect(skipped.diagnostics).toEqual([])
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expectNoRealEffects(skipped, false)

    expect(blocked.status).toBe('blocked')
    expect(blocked.uiIpcOutcomePrepared).toBe(false)
    expect(blocked.diagnostics).toEqual([
      {
        code: 'LIFECYCLE-TRANSACTION-001',
        ruleId: 'LIFECYCLE-TRANSACTION-001',
        severity: 'error',
        stage: 'third-party.post-commit-verification-ui-ipc-outcome-handoff.path-strip-test',
        messageKey: 'mods.error.lifecycle.transaction.001',
        packageId,
        recovery: 'retry'
      }
    ])
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expect(JSON.stringify(blocked)).not.toContain('hostPath')
    expectNoRealEffects(blocked, false)
  })

  it('blocks drift across command, package, identity, lockfile, outcome and effect inputs', async () => {
    const base = await createReadyInputs()
    const driftCases = [
      {
        name: 'non-deferred normalization preflight',
        preflight: {
          ...base.resultNormalizationPreflight,
          status: 'ready' as never
        },
        atomic: base.atomicCommitOutcomeContract,
        verification: base.postCommitVerificationExecutorAdapter,
        blockedCheckId: 'result-normalization-preflight-deferred'
      },
      {
        name: 'atomic outcome missing',
        preflight: base.resultNormalizationPreflight,
        atomic: {
          ...base.atomicCommitOutcomeContract,
          outcome: undefined
        },
        verification: base.postCommitVerificationExecutorAdapter,
        blockedCheckId: 'atomic-commit-outcome-ready'
      },
      {
        name: 'verification outcome missing',
        preflight: base.resultNormalizationPreflight,
        atomic: base.atomicCommitOutcomeContract,
        verification: {
          ...base.postCommitVerificationExecutorAdapter,
          outcome: undefined
        },
        blockedCheckId: 'post-commit-verification-executed'
      },
      {
        name: 'command mismatch',
        preflight: {
          ...base.resultNormalizationPreflight,
          requestedCommandId: undefined
        },
        atomic: base.atomicCommitOutcomeContract,
        verification: base.postCommitVerificationExecutorAdapter,
        blockedCheckId: 'install-command-consistent'
      },
      {
        name: 'target drift',
        preflight: base.resultNormalizationPreflight,
        atomic: {
          ...base.atomicCommitOutcomeContract,
          targetPackageId: alternatePackageId
        },
        verification: base.postCommitVerificationExecutorAdapter,
        blockedCheckId: 'target-package-consistent'
      },
      {
        name: 'package summary drift',
        preflight: base.resultNormalizationPreflight,
        atomic: {
          ...base.atomicCommitOutcomeContract,
          registryCount: base.atomicCommitOutcomeContract.registryCount + 1
        },
        verification: base.postCommitVerificationExecutorAdapter,
        blockedCheckId: 'package-summary-consistent'
      },
      {
        name: 'candidate hash drift',
        preflight: base.resultNormalizationPreflight,
        atomic: {
          ...base.atomicCommitOutcomeContract,
          outcome: {
            ...base.atomicCommitOutcomeContract.outcome,
            candidateHash: testHash('e')
          } as never
        },
        verification: base.postCommitVerificationExecutorAdapter,
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        name: 'lockfile hash drift',
        preflight: base.resultNormalizationPreflight,
        atomic: base.atomicCommitOutcomeContract,
        verification: {
          ...base.postCommitVerificationExecutorAdapter,
          outcome: {
            ...base.postCommitVerificationExecutorAdapter.outcome,
            lockfileHash: testHash('f')
          } as never
        },
        blockedCheckId: 'lockfile-hash-consistent'
      },
      {
        name: 'failed commit with verified post-commit outcome',
        preflight: base.resultNormalizationPreflight,
        atomic: createAtomicOutcomeContract('failed'),
        verification: base.postCommitVerificationExecutorAdapter,
        blockedCheckId: 'commit-verification-outcome-consistent'
      },
      {
        name: 'atomic source effect drift',
        preflight: base.resultNormalizationPreflight,
        atomic: {
          ...base.atomicCommitOutcomeContract,
          effects: {
            ...base.atomicCommitOutcomeContract.effects,
            commandDispatched: true as never
          }
        },
        verification: base.postCommitVerificationExecutorAdapter,
        blockedCheckId: 'no-ui-ipc-handoff-effects-intact'
      },
      {
        name: 'verification read effect drift',
        preflight: base.resultNormalizationPreflight,
        atomic: base.atomicCommitOutcomeContract,
        verification: {
          ...base.postCommitVerificationExecutorAdapter,
          effects: {
            ...base.postCommitVerificationExecutorAdapter.effects,
            lockfileRead: true as never
          }
        },
        blockedCheckId: 'no-ui-ipc-handoff-effects-intact'
      }
    ]

    for (const currentCase of driftCases) {
      const result = buildThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff({
        resultNormalizationPreflight: currentCase.preflight,
        atomicCommitOutcomeContract: currentCase.atomic,
        postCommitVerificationExecutorAdapter: currentCase.verification
      })
      expectBlockedCheck(result, currentCase.blockedCheckId)
      expect(result.reason, currentCase.name).toBe('post-commit verification UI/IPC outcome handoff inputs are inconsistent')
    }
  })

  it('does not invoke hostile package-array or diagnostic getters while blocking unsafe input', async () => {
    const hostilePackages = [packageId] as PackageId[]
    const hostileDiagnostics = [
      createDiagnostic('LIFECYCLE-TRANSACTION-001', {
        stage: 'third-party.post-commit-verification-ui-ipc-outcome-handoff.hostile-diagnostic',
        packageId: blockedPackageId
      })
    ]
    let packageGetterRead = false
    let diagnosticGetterRead = false
    Object.defineProperty(hostilePackages, '0', {
      enumerable: true,
      get: () => {
        packageGetterRead = true
        throw new Error('C:/Users/LENOVO/hostile-package-array')
      }
    })
    Object.defineProperty(hostileDiagnostics, '0', {
      enumerable: true,
      get: () => {
        diagnosticGetterRead = true
        throw new Error('C:/Users/LENOVO/hostile-diagnostic-array')
      }
    })

    const result = buildThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff(await createReadyInputs({
      preflight: {
        selectedPackageIds: hostilePackages,
        diagnostics: hostileDiagnostics
      }
    }))

    expect(result.status).toBe('blocked')
    expect(result.selectedPackageIds).toEqual([])
    expect(result.diagnostics.map(diagnostic => diagnostic.stage)).toEqual([
      'third-party.post-commit-verification-ui-ipc-outcome-handoff.checks.target-package-consistent',
      'third-party.post-commit-verification-ui-ipc-outcome-handoff.checks.package-summary-consistent'
    ])
    expect(packageGetterRead).toBe(false)
    expect(diagnosticGetterRead).toBe(false)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expectNoRealEffects(result, false)
  })
})
