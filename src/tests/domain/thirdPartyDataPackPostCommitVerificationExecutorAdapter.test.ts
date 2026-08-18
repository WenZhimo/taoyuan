import { describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  executeThirdPartyDataPackPostCommitVerificationExecutorAdapter,
  type ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult,
  type ThirdPartyDataPackPostCommitVerificationExecutorHost,
  type ThirdPartyDataPackPostCommitVerificationExecutorRequest
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorAdapter'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary,
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorPreflight'

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

const createHost = (
  execute: ThirdPartyDataPackPostCommitVerificationExecutorHost['execute']
): ThirdPartyDataPackPostCommitVerificationExecutorHost => ({
  kind: 'injected-post-commit-verification-executor',
  mode: 'injected-test-only',
  execute
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealVerificationReadsOrWrites = (
  result: ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult
): void => {
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
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.transactionLogRead).toBe(false)
  expect(result.effects.packageStateRead).toBe(false)
  expect(result.effects.settingsRead).toBe(false)
  expect(result.effects.lockfileRead).toBe(false)
  expect(result.effects.liveRegistryRead).toBe(false)
  expect(result.effects.saveCacheIsolationChecked).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.packageBackupsWritten).toBe(false)
  expect(result.effects.packageFilesRestored).toBe(false)
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

describe('third-party post-commit verification executor adapter', () => {
  it('executes an injected-test-only host and normalizes a path-free verified outcome', async () => {
    const preflight = createVerificationPreflight()
    let receivedRequest: ThirdPartyDataPackPostCommitVerificationExecutorRequest | undefined

    const result = await executeThirdPartyDataPackPostCommitVerificationExecutorAdapter({
      preflight,
      host: createHost(request => {
        receivedRequest = request
        expect(Object.isFrozen(request)).toBe(true)
        return {
          kind: 'verified',
          settled: true,
          packageId: request.packageId,
          candidateIdentity: request.candidateIdentity,
          lockfileHash: request.lockfileHash,
          transactionLogMatched: true,
          packageStateMatched: true,
          settingsLockfileMatched: true,
          liveRegistryMatched: true,
          saveCacheIsolated: true,
          messageKey: 'mods.post.commit.verification.install.verified',
          recovery: 'none'
        }
      })
    })

    expect(result.status).toBe('executed')
    expect(result.postCommitVerificationExecutorAdapter).toBe('executed')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.verificationHostCalled).toBe(true)
    expect(result.verificationOutcomeReceived).toBe(true)
    expect(result.verificationOutcomeNormalized).toBe(true)
    expect(result.verificationExecutionAllowed).toBe(true)
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.verificationRequest).toEqual({
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
      requiredSourceIds: [
        'committed-transaction-log-source',
        'package-state-source',
        'settings-lockfile-state-source',
        'live-registry-identity-source',
        'save-cache-isolation-source',
        'path-free-ui-ipc-result-normalizer',
        'rollback-recovery-trigger'
      ],
      deferredStageIds: [
        'transaction-log-entry-read',
        'package-state-read',
        'settings-lockfile-identity-read',
        'live-registry-identity-read',
        'save-cache-isolation-check',
        'ui-ipc-result-normalization',
        'rollback-recovery-trigger'
      ]
    })
    expect(receivedRequest).toBe(result.verificationRequest)
    expect(result.outcome).toEqual(expect.objectContaining({
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
      messageKey: 'mods.post.commit.verification.install.verified'
    }))
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.postCommitVerificationExecutorCalled).toBe(true)
    expect(result.effects.injectedVerificationHostCalled).toBe(true)
    expect(result.effects.verificationOutcomeReceived).toBe(true)
    expect(result.effects.verifiedOutcomeReceived).toBe(true)
    expect('preflight' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoRealVerificationReadsOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('skips or blocks non-ready preflight states while stripping path-bearing diagnostics', async () => {
    let hostCalled = false
    const skipped = await executeThirdPartyDataPackPostCommitVerificationExecutorAdapter({
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
      host: createHost(() => {
        hostCalled = true
        throw new Error('should not run')
      })
    })
    const blocked = await executeThirdPartyDataPackPostCommitVerificationExecutorAdapter({
      preflight: createVerificationPreflight({
        status: 'blocked',
        reason: 'verification preflight blocked before injected executor',
        diagnostics: [
          createDiagnostic('LIFECYCLE-TRANSACTION-001', {
            stage: 'third-party.post-commit-verification-executor-adapter.blocked-source',
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
      })
    })

    expect(skipped.status).toBe('skipped')
    expect(skipped.verificationHostCalled).toBe(false)
    expect(skipped.verificationOutcomeNormalized).toBe(false)
    expect(skipped.checks.every(check => check.status === 'skipped')).toBe(true)
    expect(blocked.status).toBe('blocked')
    expect(blocked.verificationHostCalled).toBe(false)
    expect(blocked.diagnostics).toEqual([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.post-commit-verification-executor-adapter.blocked-source',
        packageId
      })
    ])
    expect(hostCalled).toBe(false)
    expect(JSON.stringify(blocked)).not.toContain('C:/Users')
    expect(JSON.stringify(blocked)).not.toContain('LENOVO')
    expect(JSON.stringify(blocked)).not.toContain('hostPath')
    expectNoRealVerificationReadsOrWrites(skipped)
    expectNoRealVerificationReadsOrWrites(blocked)
    expectJsonGraphFrozen(skipped)
    expectJsonGraphFrozen(blocked)
  })

  it('blocks missing host, non-test host, missing identities and upstream effect drift before execution', async () => {
    const baseHost = createHost(request => ({
      kind: 'verified',
      settled: true,
      packageId: request.packageId,
      candidateIdentity: request.candidateIdentity,
      lockfileHash: request.lockfileHash,
      transactionLogMatched: true,
      packageStateMatched: true,
      settingsLockfileMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true
    }))
    const cases = [
      {
        label: 'missing host',
        preflight: createVerificationPreflight(),
        host: undefined,
        blockedCheckId: 'injected-verification-host-ready'
      },
      {
        label: 'non-test host',
        preflight: createVerificationPreflight(),
        host: {
          ...baseHost,
          mode: 'real-platform' as never
        },
        blockedCheckId: 'injected-test-boundary'
      },
      {
        label: 'missing target',
        preflight: createVerificationPreflight({ targetPackageId: undefined }),
        host: baseHost,
        blockedCheckId: 'target-package-selected'
      },
      {
        label: 'missing candidate identity',
        preflight: createVerificationPreflight({ candidateIdentity: undefined }),
        host: baseHost,
        blockedCheckId: 'candidate-identity-present'
      },
      {
        label: 'missing lockfile hash',
        preflight: createVerificationPreflight({ lockfileHash: undefined }),
        host: baseHost,
        blockedCheckId: 'lockfile-hash-present'
      },
      {
        label: 'upstream effect drift',
        preflight: createVerificationPreflight({
          effects: {
            ...sourceEffects,
            transactionLogRead: true
          } as never
        }),
        host: baseHost,
        blockedCheckId: 'no-upstream-verification-effects'
      }
    ] as const

    for (const currentCase of cases) {
      const result = await executeThirdPartyDataPackPostCommitVerificationExecutorAdapter({
        preflight: currentCase.preflight,
        host: currentCase.host
      })

      expect(result.status).toBe('blocked')
      expect(result.reason).toBe('post-commit verification executor adapter inputs are inconsistent')
      expect(result.verificationHostCalled).toBe(false)
      expect(result.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: `third-party.post-commit-verification-executor-adapter.checks.${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(result)).not.toContain(currentCase.label)
      expectNoRealVerificationReadsOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks host failures, invalid outcomes and verification drift without leaking host details', async () => {
    const hostFailure = await executeThirdPartyDataPackPostCommitVerificationExecutorAdapter({
      preflight: createVerificationPreflight(),
      host: createHost(() => {
        throw new Error('EACCES C:/Users/LENOVO/mods/post-commit-verifier')
      })
    })
    const invalidOutcome = await executeThirdPartyDataPackPostCommitVerificationExecutorAdapter({
      preflight: createVerificationPreflight(),
      host: createHost(() => undefined as never)
    })
    const driftOutcome = await executeThirdPartyDataPackPostCommitVerificationExecutorAdapter({
      preflight: createVerificationPreflight(),
      host: createHost(request => ({
        kind: 'verified',
        settled: true,
        packageId: request.packageId,
        candidateIdentity: {
          ...request.candidateIdentity,
          candidateHash: testHash('e')
        },
        lockfileHash: request.lockfileHash,
        transactionLogMatched: true,
        packageStateMatched: true,
        settingsLockfileMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true
      }))
    })
    const missingVerifierSignal = await executeThirdPartyDataPackPostCommitVerificationExecutorAdapter({
      preflight: createVerificationPreflight(),
      host: createHost(request => ({
        kind: 'verified',
        settled: true,
        packageId: request.packageId,
        candidateIdentity: request.candidateIdentity,
        lockfileHash: request.lockfileHash,
        transactionLogMatched: true,
        packageStateMatched: true,
        settingsLockfileMatched: false,
        liveRegistryMatched: true,
        saveCacheIsolated: true
      }))
    })

    expect(hostFailure.status).toBe('blocked')
    expect(hostFailure.reason).toBe('injected post-commit verification host failed before outcome')
    expect(hostFailure.verificationHostCalled).toBe(true)
    expect(hostFailure.verificationOutcomeReceived).toBe(false)
    expect(hostFailure.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'verification-outcome-returned',
        status: 'blocked'
      })
    ]))
    expect(invalidOutcome.status).toBe('blocked')
    expect(invalidOutcome.reason).toBe('injected post-commit verification host returned an invalid outcome')
    expect(invalidOutcome.verificationHostCalled).toBe(true)
    expect(invalidOutcome.verificationOutcomeReceived).toBe(false)
    expect(driftOutcome.status).toBe('blocked')
    expect(driftOutcome.reason).toBe('injected post-commit verification outcome failed adapter normalization')
    expect(driftOutcome.verificationHostCalled).toBe(true)
    expect(driftOutcome.verificationOutcomeReceived).toBe(false)
    expect(missingVerifierSignal.status).toBe('blocked')
    expect(missingVerifierSignal.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'verification-outcome-ready',
        status: 'blocked'
      })
    ]))
    expect(JSON.stringify(hostFailure)).not.toContain('C:/Users')
    expect(JSON.stringify(hostFailure)).not.toContain('LENOVO')
    expect(JSON.stringify(driftOutcome)).not.toContain(testHash('e'))
    expectNoRealVerificationReadsOrWrites(hostFailure)
    expectNoRealVerificationReadsOrWrites(invalidOutcome)
    expectNoRealVerificationReadsOrWrites(driftOutcome)
    expectNoRealVerificationReadsOrWrites(missingVerifierSignal)
    expectJsonGraphFrozen(hostFailure)
    expectJsonGraphFrozen(invalidOutcome)
    expectJsonGraphFrozen(driftOutcome)
    expectJsonGraphFrozen(missingVerifierSignal)
  })

  it('copies package summaries and diagnostics without reading hostile proxy lengths', async () => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/post-commit-verifier-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/post-commit-verifier-diagnostic-prototype')
      }
    }), {
      code: 'CACHE-INVALID-001',
      ruleId: 'CACHE-INVALID-001',
      severity: 'warning',
      stage: 'third-party.post-commit-verification-executor-adapter.proxy-test',
      messageKey: 'mods.error.cache.invalid.001',
      packageId,
      recovery: 'retry'
    })
    const diagnostics = createHostileArray([diagnostic], 'diagnostics')
    const result = await executeThirdPartyDataPackPostCommitVerificationExecutorAdapter({
      preflight: createVerificationPreflight({
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
        stage: 'third-party.post-commit-verification-executor-adapter.proxy-test',
        packageId
      }),
      expect.objectContaining({
        code: 'CACHE-INVALID-001',
        stage: 'third-party.post-commit-verification-executor-adapter.proxy-test',
        packageId
      })
    ])
    expect(result.outcome?.kind).toBe('failed')
    expect(result.outcome?.retryable).toBe(true)
    expect(result.effects.failedOutcomeReceived).toBe(true)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('post-commit-verifier-selected-package-ids')
    expect(JSON.stringify(result)).not.toContain('hostPath')
    expectNoRealVerificationReadsOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks accessor-based upstream effects without invoking path-bearing getters', async () => {
    let effectGetterRead = false
    const hostileEffects = {
      ...sourceEffects
    }
    Object.defineProperty(hostileEffects, 'transactionLogRead', {
      enumerable: true,
      get() {
        effectGetterRead = true
        throw new Error('C:/Users/LENOVO/mods/post-commit-verifier-effect-getter')
      }
    })

    const result = await executeThirdPartyDataPackPostCommitVerificationExecutorAdapter({
      preflight: createVerificationPreflight({
        effects: hostileEffects as never
      }),
      host: createHost(request => ({
        kind: 'verified',
        settled: true,
        packageId: request.packageId,
        candidateIdentity: request.candidateIdentity,
        lockfileHash: request.lockfileHash,
        transactionLogMatched: true,
        packageStateMatched: true,
        settingsLockfileMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true
      }))
    })

    expect(result.status).toBe('blocked')
    expect(effectGetterRead).toBe(false)
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'no-upstream-verification-effects',
        status: 'blocked'
      })
    ]))
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expectNoRealVerificationReadsOrWrites(result)
    expectJsonGraphFrozen(result)
  })
})
