import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorHost,
  type ThirdPartyDataPackAtomicTransactionCommitExecutorRequest
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorAdapter'
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

const createHost = (
  execute: ThirdPartyDataPackAtomicTransactionCommitExecutorHost['execute'],
  mode: ThirdPartyDataPackAtomicTransactionCommitExecutorHost['mode'] = 'injected-test-only'
): ThirdPartyDataPackAtomicTransactionCommitExecutorHost => ({
  kind: mode === 'electron-main-visible-import'
    ? 'electron-main-visible-import-atomic-transaction-commit-executor'
    : 'injected-atomic-transaction-commit-executor',
  mode,
  execute
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoPersistentWrites = (
  result: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult
): void => {
  expect(result.commandDispatchAllowed).toBe(false)
  expect(result.transactionCommitAllowed).toBe(false)
  expect(result.runtimePublicationCommitAllowed).toBe(false)
  expect(result.postCommitVerificationAllowed).toBe(false)
  expect(result.uiIpcResponseAllowed).toBe(false)
  expect(result.runtimeEnablementAllowed).toBe(false)
  expect(result.writeAllowed).toBe(false)
  expect(result.rollbackRecoveryAllowed).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.transactionLogPrepared).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.packageBackupsWritten).toBe(false)
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

describe('third-party atomic transaction commit executor adapter', () => {
  it('executes an injected-test-only host and normalizes a path-free committed outcome', async () => {
    const preflight = createAtomicPreflight()
    let receivedRequest: ThirdPartyDataPackAtomicTransactionCommitExecutorRequest | undefined

    const result = await executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter({
      preflight,
      host: createHost(request => {
        receivedRequest = request
        expect(Object.isFrozen(request)).toBe(true)
        return {
          kind: 'committed',
          settled: true,
          packageId: request.packageId,
          candidateIdentity: request.candidateIdentity,
          lockfileHash: request.lockfileHash,
          messageKey: 'mods.atomic.commit.install.committed',
          recovery: 'none'
        }
      })
    })

    expect(result.status).toBe('executed')
    expect(result.atomicTransactionCommitExecutorAdapter).toBe('executed')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.outcomeContractStatus).toBe('ready')
    expect(result.commitHostCalled).toBe(true)
    expect(result.commitOutcomeReceived).toBe(true)
    expect(result.commitOutcomeNormalized).toBe(true)
    expect(result.atomicTransactionCommitExecutorHostMode).toBe('injected-test-only')
    expect(result.injectedExecutorHostMode).toBe('injected-test-only')
    expect(result.atomicCommitExecutionAllowed).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.commitRequest).toEqual({
      formatVersion: 1,
      commandId: 'install',
      packageId,
      candidateIdentity,
      lockfileHash,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      blockedCandidateCount: 0,
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      writeProbeEvidence: {
        modLockWriteProbeStatus: 'written',
        transactionLogWriteProbeStatus: 'written',
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true
      }
    })
    expect(receivedRequest).toBe(result.commitRequest)
    expect(result.outcomeContract?.outcome).toEqual(expect.objectContaining({
      kind: 'committed',
      commandId: 'install',
      packageId,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      messageKey: 'mods.atomic.commit.install.committed'
    }))
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.atomicCommitExecutorCalled).toBe(true)
    expect(result.effects.injectedCommitHostCalled).toBe(true)
    expect(result.effects.commitOutcomeReceived).toBe(true)
    expect(result.effects.committedOutcomeReceived).toBe(true)
    expect('preflight' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('executes an Electron main visible-import host without falling back to injected-test-only mode', async () => {
    const preflight = createAtomicPreflight()

    const result = await executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter({
      preflight,
      host: createHost(request => ({
        kind: 'committed',
        settled: true,
        packageId: request.packageId,
        candidateIdentity: request.candidateIdentity,
        lockfileHash: request.lockfileHash,
        messageKey: 'mods.atomic.commit.install.committed',
        recovery: 'none'
      }), 'electron-main-visible-import')
    })

    expect(result.status).toBe('executed')
    expect(result.injectedExecutorHostRequired).toBe(false)
    expect(result.atomicTransactionCommitExecutorHostMode).toBe('electron-main-visible-import')
    expect(result.injectedExecutorHostMode).toBe('electron-main-visible-import')
    expect(result.effects.atomicCommitExecutorCalled).toBe(true)
    expect(result.effects.injectedCommitHostCalled).toBe(false)
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'commit-host-boundary',
        status: 'satisfied'
      })
    ]))
    expect(result.reason).toBe(
      'atomic transaction commit executor adapter executed a path-free commit outcome host and normalized its outcome'
    )
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('skips or blocks non-ready preflight states while stripping path-bearing diagnostics', async () => {
    let hostCalled = false
    const skipped = await executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter({
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
      host: createHost(() => {
        hostCalled = true
        throw new Error('should not run')
      })
    })
    const blocked = await executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter({
      preflight: createAtomicPreflight({
        status: 'blocked',
        reason: 'atomic preflight blocked before injected executor',
        diagnostics: [
          createDiagnostic('LIFECYCLE-TRANSACTION-001', {
            stage: 'third-party.atomic-transaction-commit-executor-adapter.blocked-source',
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
      })
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.commitHostCalled).toBe(false)
    expect(skipped.commitOutcomeNormalized).toBe(false)
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.commitHostCalled).toBe(false)
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.atomic-transaction-commit-executor-adapter.blocked-source',
        packageId
      })
    ])
    expect(hostCalled).toBe(false)
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expect(JSON.stringify(blocked)).not.toContain('hostPath')
    expectNoPersistentWrites(skipped)
    expectNoPersistentWrites(blocked)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks missing host, non-test host, missing identities and upstream effect drift before execution', async () => {
    const baseHost = createHost(request => ({
      kind: 'committed',
      settled: true,
      packageId: request.packageId,
      candidateIdentity: request.candidateIdentity,
      lockfileHash: request.lockfileHash
    }))
    const cases = [
      {
        label: 'missing host',
        preflight: createAtomicPreflight(),
        host: undefined,
        blockedCheckId: 'injected-commit-host-ready'
      },
      {
        label: 'non-test host',
        preflight: createAtomicPreflight(),
        host: {
          ...baseHost,
          mode: 'real-platform' as never
        },
        blockedCheckId: 'commit-host-boundary'
      },
      {
        label: 'missing target',
        preflight: createAtomicPreflight({ targetPackageId: undefined }),
        host: baseHost,
        blockedCheckId: 'target-package-selected'
      },
      {
        label: 'missing candidate identity',
        preflight: createAtomicPreflight({ candidateIdentity: undefined }),
        host: baseHost,
        blockedCheckId: 'candidate-identity-present'
      },
      {
        label: 'missing lockfile hash',
        preflight: createAtomicPreflight({ lockfileHash: undefined }),
        host: baseHost,
        blockedCheckId: 'lockfile-hash-present'
      },
      {
        label: 'upstream effect drift',
        preflight: createAtomicPreflight({
          effects: {
            ...sourceEffects,
            atomicCommitExecutorCalled: true
          } as never
        }),
        host: baseHost,
        blockedCheckId: 'no-upstream-commit-effects'
      }
    ] as const

    for (const currentCase of cases) {
      const result = await executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter({
        preflight: currentCase.preflight,
        host: currentCase.host
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('atomic transaction commit executor adapter inputs are inconsistent')
      expect(result.commitHostCalled).toBe(false)
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.atomic-transaction-commit-executor-adapter.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).not.toContain(currentCase.label)
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks host failures, invalid outcomes and outcome contract drift without leaking host details', async () => {
    const hostFailure = await executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter({
      preflight: createAtomicPreflight(),
      host: createHost(() => {
        throw new Error('EACCES C:/Users/LENOVO/mods/atomic-executor')
      })
    })
    const invalidOutcome = await executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter({
      preflight: createAtomicPreflight(),
      host: createHost(() => undefined as never)
    })
    const driftOutcome = await executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter({
      preflight: createAtomicPreflight(),
      host: createHost(request => ({
        kind: 'committed',
        settled: true,
        packageId: request.packageId,
        candidateIdentity: {
          ...request.candidateIdentity,
          candidateHash: testHash('e')
        },
        lockfileHash: request.lockfileHash
      }))
    })

    expect(hostFailure.status).toBe('blocked')
    expect(hostFailure.reason).toBe('atomic transaction commit outcome host failed before outcome')
    expect(hostFailure.commitHostCalled).toBe(true)
    expect(hostFailure.commitOutcomeReceived).toBe(false)
    expect(hostFailure.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'commit-outcome-returned',
        status: 'blocked'
      })
    ]))
    expect(invalidOutcome.status).toBe('blocked')
    expect(invalidOutcome.reason).toBe('atomic transaction commit outcome host returned an invalid outcome')
    expect(invalidOutcome.commitHostCalled).toBe(true)
    expect(invalidOutcome.commitOutcomeReceived).toBe(false)
    expect(driftOutcome.status).toBe('blocked')
    expect(driftOutcome.reason).toBe('atomic transaction commit outcome contract rejected host outcome')
    expect(driftOutcome.commitHostCalled).toBe(true)
    expect(driftOutcome.commitOutcomeReceived).toBe(true)
    expect(driftOutcome.outcomeContractStatus).toBe('blocked')
    expect(driftOutcome.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'outcome-contract-ready',
        status: 'blocked'
      })
    ]))
    expect(JSON.stringify(hostFailure)).not.toContain('C:/Users')
    expect(JSON.stringify(hostFailure)).not.toContain('LENOVO')
    expect(JSON.stringify(driftOutcome)).not.toContain(testHash('e'))
    expectNoPersistentWrites(hostFailure)
    expectNoPersistentWrites(invalidOutcome)
    expectNoPersistentWrites(driftOutcome)
    expectJsonGraphFrozen(hostFailure)
    expectJsonGraphFrozen(invalidOutcome)
    expectJsonGraphFrozen(driftOutcome)
  })

  it('copies package summaries and diagnostics without reading hostile proxy lengths', async () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/atomic-executor-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/atomic-executor-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.atomic-transaction-commit-executor-adapter.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')
    const result = await executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter({
      preflight: createAtomicPreflight({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        diagnostics: diagnostics as never
      }),
      host: createHost(request => ({
        kind: 'failed',
        settled: true,
        packageId: request.packageId,
        diagnostics: diagnostics as never,
        recovery: 'retry',
        retryable: true
      }))
    })

    expect(result.status).toBe('executed')
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
        stage: 'third-party.atomic-transaction-commit-executor-adapter.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.atomic-transaction-commit-executor-adapter.proxy-test',
        packageId
      })
    ])
    expect(result.effects.failedOutcomeReceived).toBe(true)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('atomic-executor-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks accessor-based upstream effects without invoking path-bearing getters', async () => {
    let effectGetterRead = false
    const hostileEffects = {
      ...sourceEffects
    }
    Object.defineProperty(hostileEffects, 'atomicCommitExecutorCalled', {
      enumerable: true,
      get() {
        effectGetterRead = true
        throw new Error('C:/Users/LENOVO/mods/atomic-executor-effect-getter')
      }
    })

    const result = await executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter({
      preflight: createAtomicPreflight({
        effects: hostileEffects as never
      }),
      host: createHost(request => ({
        kind: 'committed',
        settled: true,
        packageId: request.packageId,
        candidateIdentity: request.candidateIdentity,
        lockfileHash: request.lockfileHash
      }))
    })

    expect(result.status).toBe('blocked')
    expect(effectGetterRead).toBe(false)
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'no-upstream-commit-effects',
        status: 'blocked'
      })
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })
})
