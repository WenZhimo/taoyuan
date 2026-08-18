import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract,
  type ThirdPartyDataPackAtomicTransactionCommitOutcomeEffectSummary,
  type ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  type ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitOutcomeContract'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary,
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'

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

const sourceEffects: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary = {
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

const expectedEffects: ThirdPartyDataPackAtomicTransactionCommitOutcomeEffectSummary = sourceEffects

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
      reason: 'Dispatcher handoff, install dispatch planning, write-probe evidence and runtime commit planning are consistent enough to inspect atomic commit executor requirements.'
    },
    {
      id: 'transaction-log-prepare',
      status: 'deferred',
      requirementIds: ['verified-transaction-log-writer'],
      reason: 'Transaction log preparation remains deferred.'
    },
    {
      id: 'package-files-commit',
      status: 'deferred',
      requirementIds: ['staged-package-file-commit-adapter'],
      reason: 'Package file staging and commit remain deferred.'
    },
    {
      id: 'settings-lockfile-commit',
      status: 'deferred',
      requirementIds: ['settings-lockfile-atomic-commit-adapter'],
      reason: 'Settings and mod-lock writes remain deferred.'
    },
    {
      id: 'runtime-publication-commit',
      status: 'deferred',
      requirementIds: ['runtime-publication-commit-adapter'],
      reason: 'Runtime publication remains deferred.'
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
    },
    {
      id: 'rollback-recovery-handoff',
      status: 'deferred',
      requirementIds: ['rollback-recovery-orchestrator'],
      reason: 'Rollback recovery remains deferred.'
    }
  ],
  executorRequirements: [
    {
      id: 'atomic-transaction-commit-executor',
      status: 'required',
      reason: 'A future executor must coordinate transaction log, package files, settings, mod-lock and runtime publication as one recoverable commit.'
    },
    {
      id: 'verified-transaction-log-writer',
      status: 'required',
      reason: 'A real commit must prepare and verify a transaction log entry.'
    },
    {
      id: 'staged-package-file-commit-adapter',
      status: 'required',
      reason: 'Package files must be staged, verified and restorable.'
    },
    {
      id: 'settings-lockfile-atomic-commit-adapter',
      status: 'required',
      reason: 'Installation settings and mod-lock replacement must be committed atomically.'
    },
    {
      id: 'runtime-publication-commit-adapter',
      status: 'required',
      reason: 'Runtime registry publication must consume verified persistent install state.'
    },
    {
      id: 'post-commit-verification-executor',
      status: 'required',
      reason: 'Success cannot be surfaced until post-commit verification proves identity.'
    },
    {
      id: 'path-free-ui-ipc-result-normalizer',
      status: 'required',
      reason: 'Future UI or IPC results must expose only redacted summaries.'
    },
    {
      id: 'rollback-recovery-orchestrator',
      status: 'required',
      reason: 'Any failed commit step must settle through rollback recovery.'
    }
  ],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  effects: sourceEffects,
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoCommitContractEffects = (
  result: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult
): void => {
  expect(result.effects).toEqual(expectedEffects)
  expect(Object.values(result.effects).every(value => value === false)).toBe(true)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.atomicCommitExecutionAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.runtimePublicationCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.uiIpcResponseAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
}

describe('third-party atomic transaction commit outcome contract', () => {
  it('normalizes a settled committed outcome as a path-free domain contract without commit effects', () => {
    const result = buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract({
      preflight: createAtomicPreflight(),
      outcome: {
        kind: 'committed',
        settled: true,
        packageId,
        candidateIdentity,
        lockfileHash,
        messageKey: 'mods.atomic.commit.install.committed',
        recovery: 'none'
      }
    })

    expect(result.status).toBe('ready')
    expect(result.atomicTransactionCommitOutcomeContract).toBe('ready')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.commitOutcomeNormalized).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
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
      formatVersion: 1,
      kind: 'committed',
      commandId: 'install',
      packageId,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      messageKey: 'mods.atomic.commit.install.committed',
      recovery: 'none',
      retryable: false,
      rollbackRequired: false,
      summary: result.summary,
      diagnostics: []
    })
    expect('preflight' in result).toBe(false)
    expect('outcomeSource' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoCommitContractEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('normalizes failed, retry and rollback outcomes without requiring identity proof when they do not drift', () => {
    const cases: readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeKind[] = ['failed', 'retry', 'rollback']

    for (const kind of cases) {
      const result = buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract({
        preflight: createAtomicPreflight(),
        outcome: {
          kind,
          settled: true,
          packageId,
          recovery: kind === 'failed' ? 'retry' : 'restore-backup',
          retryable: kind === 'failed',
          rollbackRequired: kind === 'rollback'
        }
      })

      expect(result.status).toBe('ready')
      expect(result.outcome?.kind).toBe(kind)
      expect(result.outcome?.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(result.outcome?.lockfileHash).toBe(lockfileHash)
      expect(result.outcome?.retryable).toBe(kind === 'retry' || kind === 'failed')
      expect(result.outcome?.rollbackRequired).toBe(kind === 'rollback')
      expect(result.outcome?.messageKey).toBe(`mods.atomic.commit.install.${kind}`)
      expectNoCommitContractEffects(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('skips or blocks non-ready atomic preflight while stripping path-bearing diagnostics', () => {
    const skipped = buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract({
      preflight: createAtomicPreflight({
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
      }),
      outcome: {
        kind: 'committed',
        settled: true,
        packageId
      }
    })
    const blocked = buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract({
      preflight: createAtomicPreflight({
        status: 'blocked',
        reason: 'atomic preflight blocked before outcome normalization',
        diagnostics: [
          createDiagnostic('LIFECYCLE-TRANSACTION-001', {
            stage: 'third-party.atomic-transaction-commit-outcome-contract.blocked-source',
            severity: 'error',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/transaction.json',
            fieldPath: '/commit/C:/Users/LENOVO',
            details: {
              hostPath: 'C:/Users/LENOVO/taoyuan/mods/sample_pack'
            },
            recovery: 'retry'
          })
        ] as never
      }),
      outcome: {
        kind: 'failed',
        settled: true,
        packageId
      }
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.commitOutcomeNormalized).toBe(false)
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.commitOutcomeNormalized).toBe(false)
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.atomic-transaction-commit-outcome-contract.blocked-source',
        packageId
      })
    ])
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expect(JSON.stringify(blocked)).not.toContain('hostPath')
    expectNoCommitContractEffects(skipped)
    expectNoCommitContractEffects(blocked)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks unsettled outcomes, target drift, identity drift, lockfile drift, unknown kinds and commit-effect drift', () => {
    const cases = [
      {
        label: 'unsettled',
        preflight: createAtomicPreflight(),
        outcome: {
          kind: 'committed',
          settled: false,
          packageId,
          candidateIdentity,
          lockfileHash
        },
        blockedCheckId: 'settled-commit-outcome-source'
      },
      {
        label: 'target drift',
        preflight: createAtomicPreflight(),
        outcome: {
          kind: 'committed',
          settled: true,
          packageId: blockedPackageId,
          candidateIdentity,
          lockfileHash
        },
        blockedCheckId: 'target-package-consistent'
      },
      {
        label: 'candidate drift',
        preflight: createAtomicPreflight(),
        outcome: {
          kind: 'committed',
          settled: true,
          packageId,
          candidateIdentity: {
            ...candidateIdentity,
            candidateHash: testHash('e')
          },
          lockfileHash
        },
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        label: 'lockfile drift',
        preflight: createAtomicPreflight(),
        outcome: {
          kind: 'committed',
          settled: true,
          packageId,
          candidateIdentity,
          lockfileHash: testHash('f')
        },
        blockedCheckId: 'lockfile-hash-consistent'
      },
      {
        label: 'unknown kind',
        preflight: createAtomicPreflight(),
        outcome: {
          kind: 'paused',
          settled: true,
          packageId,
          candidateIdentity,
          lockfileHash
        } as never,
        blockedCheckId: 'outcome-kind-supported'
      },
      {
        label: 'effect drift',
        preflight: createAtomicPreflight({
          effects: {
            ...sourceEffects,
            transactionCommitted: true
          } as never
        }),
        outcome: {
          kind: 'committed',
          settled: true,
          packageId,
          candidateIdentity,
          lockfileHash
        },
        blockedCheckId: 'no-commit-source-effects-intact'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract({
        preflight: currentCase.preflight,
        outcome: currentCase.outcome
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('atomic transaction commit outcome contract inputs are inconsistent')
      expect(result.outcome).toBeUndefined()
      expect(result.commitOutcomeNormalized).toBe(false)
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.atomic-transaction-commit-outcome-contract.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).not.toContain(currentCase.label)
      expectNoCommitContractEffects(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('copies package summaries and diagnostics without reading hostile proxy lengths', () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/atomic-outcome-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/atomic-outcome-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.atomic-transaction-commit-outcome-contract.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const selectedPackageIds = createHostileArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileArray([blockedPackageId], 'blocked-package-ids')
    const blockedCandidatePaths = createHostileArray(['blocked-pack'], 'blocked-candidate-paths')
    const loadOrder = createHostileArray([packageId], 'load-order')
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')

    const result = buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract({
      preflight: createAtomicPreflight({
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder,
        diagnostics: diagnostics as never
      }),
      outcome: {
        kind: 'failed',
        settled: true,
        packageId,
        diagnostics: diagnostics as never,
        recovery: 'retry',
        retryable: true
      }
    })

    expect(result.status).toBe('ready')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['sample_pack'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.blockedCandidateCount).toBe(1)
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.summary).toMatchObject({
      selectedPackageCount: 1,
      blockedPackageCount: 1,
      blockedCandidateCount: 1,
      diagnosticCount: 2
    })
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.atomic-transaction-commit-outcome-contract.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.atomic-transaction-commit-outcome-contract.proxy-test',
        packageId
      })
    ])
    expect(result.outcome?.diagnostics).toHaveLength(2)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('atomic-outcome-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoCommitContractEffects(result)
    expectJsonGraphFrozen(result)
  })
})
