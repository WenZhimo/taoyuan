import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackPostCommitVerificationOutcomeContract,
  type ThirdPartyDataPackPostCommitVerificationOutcomeContractResult,
  type ThirdPartyDataPackPostCommitVerificationOutcomeEffectSummary
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationOutcomeContract'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary,
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorPreflight'
import type {
  ThirdPartyDataPackPostCommitVerificationOutcomeKind
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorAdapter'

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

const sourceEffects: ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary = {
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

const expectedEffects: ThirdPartyDataPackPostCommitVerificationOutcomeEffectSummary = sourceEffects

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
      requirementIds: ['committed-transaction-log-source', 'package-state-source'],
      reason: 'Dispatcher handoff is consistent enough to inspect post-commit verification executor inputs.'
    },
    {
      id: 'transaction-log-entry-read',
      status: 'deferred',
      requirementIds: ['committed-transaction-log-source'],
      reason: 'Transaction log reading remains deferred.'
    },
    {
      id: 'package-state-read',
      status: 'deferred',
      requirementIds: ['package-state-source'],
      reason: 'Package state reading remains deferred.'
    },
    {
      id: 'settings-lockfile-identity-read',
      status: 'deferred',
      requirementIds: ['settings-lockfile-state-source'],
      reason: 'Settings and lockfile reads remain deferred.'
    },
    {
      id: 'live-registry-identity-read',
      status: 'deferred',
      requirementIds: ['live-registry-identity-source'],
      reason: 'Live registry identity reading remains deferred.'
    },
    {
      id: 'save-cache-isolation-check',
      status: 'deferred',
      requirementIds: ['save-cache-isolation-source'],
      reason: 'Save and cache checks remain deferred.'
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
      reason: 'Rollback recovery triggering remains deferred.'
    }
  ],
  executorRequirements: [
    {
      id: 'committed-transaction-log-source',
      status: 'required',
      reason: 'A future executor must read a committed transaction log entry through a redacted, path-free source.'
    },
    {
      id: 'package-state-source',
      status: 'required',
      reason: 'A future executor must verify committed package files against the selected candidate identity.'
    },
    {
      id: 'settings-lockfile-state-source',
      status: 'required',
      reason: 'A future executor must verify settings and mod-lock describe the same lockfile hash and package set.'
    },
    {
      id: 'live-registry-identity-source',
      status: 'required',
      reason: 'A future executor must verify the live registry identity before startup or UI success continues.'
    },
    {
      id: 'save-cache-isolation-source',
      status: 'required',
      reason: 'A future executor must prove player saves and official cache were not mutated by the install transaction.'
    },
    {
      id: 'path-free-ui-ipc-result-normalizer',
      status: 'required',
      reason: 'A future executor must normalize success/failure output before it is exposed to UI or IPC.'
    },
    {
      id: 'rollback-recovery-trigger',
      status: 'required',
      reason: 'A future executor must trigger rollback recovery on any failed verifier before surfacing failure.'
    }
  ],
  effects: sourceEffects,
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoVerificationContractEffects = (
  result: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult
): void => {
  expect(result.effects).toEqual(expectedEffects)
  expect(Object.values(result.effects).every(value => value === false)).toBe(true)
  expect(result.verificationExecutionAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.transactionLogReadAllowed).toBe(false)
  expect(result.packageStateReadAllowed).toBe(false)
  expect(result.settingsReadAllowed).toBe(false)
  expect(result.lockfileReadAllowed).toBe(false)
  expect(result.liveRegistryReadAllowed).toBe(false)
  expect(result.saveCacheIsolationCheckAllowed).toBe(false)
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.uiIpcResponseAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
}

describe('third-party post-commit verification outcome contract', () => {
  it('normalizes a settled verified outcome as a path-free domain contract without read or write effects', () => {
    const result = buildThirdPartyDataPackPostCommitVerificationOutcomeContract({
      preflight: createVerificationPreflight(),
      outcome: {
        kind: 'verified',
        settled: true,
        packageId,
        candidateIdentity,
        lockfileHash,
        transactionLogMatched: true,
        packageStateMatched: true,
        settingsLockfileMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true,
        messageKey: 'mods.post.commit.verification.install.verified',
        recovery: 'none'
      }
    })

    expect(result.status).toBe('ready')
    expect(result.postCommitVerificationOutcomeContract).toBe('ready')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.verificationOutcomeNormalized).toBe(true)
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
      kind: 'verified',
      commandId: 'install',
      packageId,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      transactionLogMatched: true,
      packageStateMatched: true,
      settingsLockfileMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true,
      messageKey: 'mods.post.commit.verification.install.verified',
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
    expectNoVerificationContractEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('normalizes failed, retry and rollback outcomes without requiring identity proof when they do not drift', () => {
    const cases: readonly ThirdPartyDataPackPostCommitVerificationOutcomeKind[] = ['failed', 'retry', 'rollback']

    for (const kind of cases) {
      const result = buildThirdPartyDataPackPostCommitVerificationOutcomeContract({
        preflight: createVerificationPreflight(),
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
      expect(result.outcome?.messageKey).toBe(`mods.post.commit.verification.install.${kind}`)
      expectNoVerificationContractEffects(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('skips or blocks non-ready verification preflight while stripping path-bearing diagnostics', () => {
    const skipped = buildThirdPartyDataPackPostCommitVerificationOutcomeContract({
      preflight: createVerificationPreflight({
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
        kind: 'verified',
        settled: true,
        packageId
      }
    })
    const blocked = buildThirdPartyDataPackPostCommitVerificationOutcomeContract({
      preflight: createVerificationPreflight({
        status: 'blocked',
        reason: 'verification preflight blocked before outcome normalization',
        diagnostics: [
          createDiagnostic('LIFECYCLE-TRANSACTION-001', {
            stage: 'third-party.post-commit-verification-outcome-contract.blocked-source',
            severity: 'error',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/verification.json',
            fieldPath: '/verification/C:/Users/LENOVO',
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
    expect(skipped.verificationOutcomeNormalized).toBe(false)
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.verificationOutcomeNormalized).toBe(false)
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.post-commit-verification-outcome-contract.blocked-source',
        packageId
      })
    ])
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expect(JSON.stringify(blocked)).not.toContain('hostPath')
    expectNoVerificationContractEffects(skipped)
    expectNoVerificationContractEffects(blocked)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks unsettled outcomes, target drift, identity drift, lockfile drift, missing verified signals, unknown kinds and effect drift', () => {
    const cases = [
      {
        label: 'unsettled',
        preflight: createVerificationPreflight(),
        outcome: {
          kind: 'verified',
          settled: false,
          packageId,
          candidateIdentity,
          lockfileHash,
          transactionLogMatched: true,
          packageStateMatched: true,
          settingsLockfileMatched: true,
          liveRegistryMatched: true,
          saveCacheIsolated: true
        },
        blockedCheckId: 'settled-verification-outcome-source'
      },
      {
        label: 'target drift',
        preflight: createVerificationPreflight(),
        outcome: {
          kind: 'verified',
          settled: true,
          packageId: blockedPackageId,
          candidateIdentity,
          lockfileHash,
          transactionLogMatched: true,
          packageStateMatched: true,
          settingsLockfileMatched: true,
          liveRegistryMatched: true,
          saveCacheIsolated: true
        },
        blockedCheckId: 'target-package-consistent'
      },
      {
        label: 'candidate drift',
        preflight: createVerificationPreflight(),
        outcome: {
          kind: 'verified',
          settled: true,
          packageId,
          candidateIdentity: {
            ...candidateIdentity,
            candidateHash: testHash('e')
          },
          lockfileHash,
          transactionLogMatched: true,
          packageStateMatched: true,
          settingsLockfileMatched: true,
          liveRegistryMatched: true,
          saveCacheIsolated: true
        },
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        label: 'lockfile drift',
        preflight: createVerificationPreflight(),
        outcome: {
          kind: 'verified',
          settled: true,
          packageId,
          candidateIdentity,
          lockfileHash: testHash('f'),
          transactionLogMatched: true,
          packageStateMatched: true,
          settingsLockfileMatched: true,
          liveRegistryMatched: true,
          saveCacheIsolated: true
        },
        blockedCheckId: 'lockfile-hash-consistent'
      },
      {
        label: 'missing verified signal',
        preflight: createVerificationPreflight(),
        outcome: {
          kind: 'verified',
          settled: true,
          packageId,
          candidateIdentity,
          lockfileHash,
          transactionLogMatched: true,
          packageStateMatched: true,
          settingsLockfileMatched: false,
          liveRegistryMatched: true,
          saveCacheIsolated: true
        },
        blockedCheckId: 'verified-state-signals-consistent'
      },
      {
        label: 'unknown kind',
        preflight: createVerificationPreflight(),
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
        preflight: createVerificationPreflight({
          effects: {
            ...sourceEffects,
            transactionLogRead: true
          } as never
        }),
        outcome: {
          kind: 'failed',
          settled: true,
          packageId
        },
        blockedCheckId: 'no-verification-source-effects-intact'
      }
    ] as const

    for (const currentCase of cases) {
      const result = buildThirdPartyDataPackPostCommitVerificationOutcomeContract({
        preflight: currentCase.preflight,
        outcome: currentCase.outcome
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('post-commit verification outcome contract inputs are inconsistent')
      expect(result.outcome).toBeUndefined()
      expect(result.verificationOutcomeNormalized).toBe(false)
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.post-commit-verification-outcome-contract.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).not.toContain(currentCase.label)
      expectNoVerificationContractEffects(result)
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
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/post-commit-outcome-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/post-commit-outcome-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.post-commit-verification-outcome-contract.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')

    const result = buildThirdPartyDataPackPostCommitVerificationOutcomeContract({
      preflight: createVerificationPreflight({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
        loadOrder: createHostileArray([packageId], 'load-order'),
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
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([blockedPackageId])
    expect(result.blockedCandidateCount).toBe(1)
    expect(result.loadOrder).toEqual([packageId])
    expect(result.summary).toMatchObject({
      selectedPackageCount: 1,
      blockedPackageCount: 1,
      blockedCandidateCount: 1,
      diagnosticCount: 2
    })
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.post-commit-verification-outcome-contract.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.post-commit-verification-outcome-contract.proxy-test',
        packageId
      })
    ])
    expect(result.outcome?.diagnostics).toHaveLength(2)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('post-commit-outcome-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoVerificationContractEffects(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks accessor-based upstream effects without invoking path-bearing getters', () => {
    let effectGetterRead = false
    const hostileEffects = {
      ...sourceEffects
    }
    Object.defineProperty(hostileEffects, 'transactionLogRead', {
      enumerable: true,
      get() {
        effectGetterRead = true
        throw new Error('C:/Users/LENOVO/mods/post-commit-outcome-effect-getter')
      }
    })

    const result = buildThirdPartyDataPackPostCommitVerificationOutcomeContract({
      preflight: createVerificationPreflight({
        effects: hostileEffects as never
      }),
      outcome: {
        kind: 'verified',
        settled: true,
        packageId,
        candidateIdentity,
        lockfileHash,
        transactionLogMatched: true,
        packageStateMatched: true,
        settingsLockfileMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true
      }
    })

    expect(result.status).toBe('blocked')
    expect(effectGetterRead).toBe(false)
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'no-verification-source-effects-intact',
        status: 'blocked'
      })
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expectNoVerificationContractEffects(result)
    expectJsonGraphFrozen(result)
  })
})
