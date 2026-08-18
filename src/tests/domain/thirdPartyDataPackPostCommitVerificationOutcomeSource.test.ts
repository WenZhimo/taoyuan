import { describe, expect, it, vi } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackPostCommitVerificationOutcomeContract,
  type ThirdPartyDataPackPostCommitVerificationOutcomeContractResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationOutcomeContract'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightEffectSummary,
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorPreflight'
import type {
  ThirdPartyDataPackPostCommitVerificationOutcomeKind
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorAdapter'
import {
  createThirdPartyDataPackPostCommitVerificationOutcomeSource,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_OUTCOME_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_OUTCOME_SOURCE_MODE,
  ThirdPartyDataPackPostCommitVerificationOutcomeSourceBlockedError,
  type ThirdPartyDataPackPostCommitVerificationOutcomeSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationOutcomeSource'

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
  executorStages: [],
  executorRequirements: [],
  effects: sourceEffects,
  ...overrides
})

const createContract = (
  kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind = 'verified',
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationOutcomeContractResult> = {}
): ThirdPartyDataPackPostCommitVerificationOutcomeContractResult => ({
  ...buildThirdPartyDataPackPostCommitVerificationOutcomeContract({
    preflight: createVerificationPreflight(),
    outcome: {
      kind,
      settled: true,
      packageId,
      candidateIdentity: kind === 'verified' ? candidateIdentity : undefined,
      lockfileHash: kind === 'verified' ? lockfileHash : undefined,
      transactionLogMatched: kind === 'verified' ? true : undefined,
      packageStateMatched: kind === 'verified' ? true : undefined,
      settingsLockfileMatched: kind === 'verified' ? true : undefined,
      liveRegistryMatched: kind === 'verified' ? true : undefined,
      saveCacheIsolated: kind === 'verified' ? true : undefined,
      retryable: kind === 'failed',
      rollbackRequired: kind === 'rollback',
      recovery: kind === 'failed' ? 'retry' : 'none'
    }
  }),
  ...overrides
})

const createSkippedContract = (): ThirdPartyDataPackPostCommitVerificationOutcomeContractResult =>
  buildThirdPartyDataPackPostCommitVerificationOutcomeContract({
    preflight: createVerificationPreflight({
      status: 'skipped',
      reason: 'no selected third-party data packs',
      requestedCommandId: undefined,
      targetPackageId: undefined,
      selectedPackageIds: [],
      blockedPackageIds: [],
      blockedCandidatePaths: [],
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoPersistentReadsOrWrites = (
  result: ThirdPartyDataPackPostCommitVerificationOutcomeSourceResult,
  continuationAllowed: boolean
): void => {
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.uiIpcResultContinuationAllowed).toBe(continuationAllowed)
  const {
    postCommitVerificationOutcomeSourceCalled: _postCommitVerificationOutcomeSourceCalled,
    postCommitVerificationOutcomeContractSourceCalled: _postCommitVerificationOutcomeContractSourceCalled,
    outcomeContractAccepted: _outcomeContractAccepted,
    verificationOutcomeNormalized: _verificationOutcomeNormalized,
    verifiedOutcomeAccepted: _verifiedOutcomeAccepted,
    failedOutcomeAccepted: _failedOutcomeAccepted,
    retryOutcomeAccepted: _retryOutcomeAccepted,
    rollbackOutcomeAccepted: _rollbackOutcomeAccepted,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party post-commit verification outcome source', () => {
  it('is disabled by default and does not call the outcome contract reader', async() => {
    const readPostCommitVerificationOutcomeContract = vi.fn()
    const source = createThirdPartyDataPackPostCommitVerificationOutcomeSource({
      readPostCommitVerificationOutcomeContract
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_OUTCOME_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_OUTCOME_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readPostCommitVerificationOutcomeContract).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.verificationOutcomeKind).toBeUndefined()
    expectNoPersistentReadsOrWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when an enabled outcome contract source reports skipped', async() => {
    const readPostCommitVerificationOutcomeContract = vi.fn(async() => createSkippedContract())
    const source = createThirdPartyDataPackPostCommitVerificationOutcomeSource({
      enabled: true,
      readPostCommitVerificationOutcomeContract
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readPostCommitVerificationOutcomeContract).toHaveBeenCalledOnce()
    expect(result.outcomeContractStatus).toBe('skipped')
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.selectedPackageIds).toEqual([])
    expect(result.verificationOutcomeKind).toBeUndefined()
    expect('preflight' in result).toBe(false)
    expect('outcome' in result).toBe(false)
    expect('outcomeSource' in result).toBe(false)
    expectNoPersistentReadsOrWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts a path-free verified outcome contract without exposing persistent-read internals', async() => {
    const source = createThirdPartyDataPackPostCommitVerificationOutcomeSource({
      enabled: true,
      readPostCommitVerificationOutcomeContract: async() => createContract()
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.outcomeContractStatus).toBe('ready')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.verificationOutcomeKind).toBe('verified')
    expect(result.messageKey).toBe('mods.post.commit.verification.install.verified')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.transactionLogMatched).toBe(true)
    expect(result.packageStateMatched).toBe(true)
    expect(result.settingsLockfileMatched).toBe(true)
    expect(result.liveRegistryMatched).toBe(true)
    expect(result.saveCacheIsolated).toBe(true)
    expect(result.effects.outcomeContractAccepted).toBe(true)
    expect(result.effects.verificationOutcomeNormalized).toBe(true)
    expect(result.effects.verifiedOutcomeAccepted).toBe(true)
    expect('preflight' in result).toBe(false)
    expect('outcome' in result).toBe(false)
    expect('outcomeSource' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('candidateSnapshot' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoPersistentReadsOrWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts failed, retry and rollback outcome kinds as path-free flags', async() => {
    const cases: readonly ThirdPartyDataPackPostCommitVerificationOutcomeKind[] = ['failed', 'retry', 'rollback']

    for (const kind of cases) {
      const source = createThirdPartyDataPackPostCommitVerificationOutcomeSource({
        enabled: true,
        readPostCommitVerificationOutcomeContract: async() => createContract(kind)
      })

      const result = await source()

      expect(result.status).toBe('ready')
      expect(result.verificationOutcomeKind).toBe(kind)
      expect(result.messageKey).toBe(`mods.post.commit.verification.install.${kind}`)
      expect(result.transactionLogMatched).toBe(false)
      expect(result.packageStateMatched).toBe(false)
      expect(result.settingsLockfileMatched).toBe(false)
      expect(result.liveRegistryMatched).toBe(false)
      expect(result.saveCacheIsolated).toBe(false)
      expect(result.retryable).toBe(kind === 'retry' || kind === 'failed')
      expect(result.rollbackRequired).toBe(kind === 'rollback')
      expect('outcome' in result).toBe(false)
      expectNoPersistentReadsOrWrites(result, true)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks missing, throwing and blocked contract sources without leaking host details', async() => {
    const missingSource = createThirdPartyDataPackPostCommitVerificationOutcomeSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackPostCommitVerificationOutcomeSource({
      enabled: true,
      readPostCommitVerificationOutcomeContract: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/post-commit-outcome-source')
      }
    })
    const blockedSource = createThirdPartyDataPackPostCommitVerificationOutcomeSource({
      enabled: true,
      readPostCommitVerificationOutcomeContract: async() => buildThirdPartyDataPackPostCommitVerificationOutcomeContract({
        preflight: createVerificationPreflight({
          status: 'blocked',
          reason: 'verification preflight blocked before outcome source',
          diagnostics: [
            createDiagnostic('LIFECYCLE-TRANSACTION-001', {
              stage: 'third-party.post-commit-verification-outcome-source.blocked-contract',
              severity: 'error',
              packageId,
              file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/verification.json',
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
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPostCommitVerificationOutcomeSourceBlockedError
    )
    await expect(blockedSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPostCommitVerificationOutcomeSourceBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitVerificationOutcomeSourceBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitVerificationOutcomeSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-outcome-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoPersistentReadsOrWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe ready sources and copies package arrays without reading hostile lengths', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/post-commit-outcome-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const readyContract = createContract()
    const source = createThirdPartyDataPackPostCommitVerificationOutcomeSource({
      enabled: true,
      readPostCommitVerificationOutcomeContract: async() => ({
        ...readyContract,
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        postCommitVerificationHost: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...readyContract.effects,
          transactionLogRead: true
        } as never
      } as unknown as ThirdPartyDataPackPostCommitVerificationOutcomeContractResult)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitVerificationOutcomeSourceBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitVerificationOutcomeSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-outcome-source.unsafe-source'
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-outcome-source.outcome-blocked'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('post-commit-outcome-source-selected-package-ids')
      expect('postCommitVerificationHost' in result).toBe(false)
      expectNoPersistentReadsOrWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
