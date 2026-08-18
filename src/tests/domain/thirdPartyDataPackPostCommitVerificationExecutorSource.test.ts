import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorAdapterEffectSummary,
  ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult,
  ThirdPartyDataPackPostCommitVerificationSummary
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorAdapter'
import {
  createThirdPartyDataPackPostCommitVerificationExecutorSource,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_EXECUTOR_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_EXECUTOR_SOURCE_MODE,
  ThirdPartyDataPackPostCommitVerificationExecutorBlockedError,
  type ThirdPartyDataPackPostCommitVerificationExecutorHostEffectSummary,
  type ThirdPartyDataPackPostCommitVerificationExecutorSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorSource'

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

const summary: ThirdPartyDataPackPostCommitVerificationSummary = {
  selectedPackageCount: 1,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 1,
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  diagnosticCount: 0
}

const adapterEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorAdapterEffectSummary> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorAdapterEffectSummary => ({
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
  injectedVerificationHostCalled: false,
  verificationOutcomeReceived: false,
  verifiedOutcomeReceived: false,
  failedOutcomeReceived: false,
  retryOutcomeReceived: false,
  rollbackOutcomeReceived: false,
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
  diagnosticsWritten: false,
  ...overrides
})

const hostEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorHostEffectSummary> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorHostEffectSummary => ({
  postCommitVerificationExecutorHostCalled: true,
  postCommitVerificationExecutorHostAccepted: true,
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
  diagnosticsWritten: false,
  ...overrides
})

const createAdapterResult = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult => ({
  status: 'skipped',
  sourcePreflightStatus: 'skipped',
  reason: 'no selected third-party data packs',
  postCommitVerificationExecutorAdapter: 'skipped',
  readOnly: true,
  injectedExecutorHostRequired: true,
  injectedExecutorHostMode: 'injected-test-only',
  verificationHostCalled: false,
  verificationOutcomeReceived: false,
  verificationOutcomeNormalized: false,
  verificationExecutionAllowed: false,
  postCommitVerificationAllowed: false,
  transactionLogReadAllowed: false,
  packageStateReadAllowed: false,
  settingsReadAllowed: false,
  lockfileReadAllowed: false,
  liveRegistryReadAllowed: false,
  saveCacheIsolationCheckAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcResponseAllowed: false,
  writeAllowed: false,
  rollbackRecoveryAllowed: false,
  requestedCommandId: undefined,
  targetPackageId: undefined,
  selectedPackageIds: [],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  candidateIdentity: undefined,
  lockfileHash: undefined,
  checks: [],
  diagnostics: [],
  summary: {
    selectedPackageCount: 0,
    blockedPackageCount: 0,
    blockedCandidateCount: 0,
    loadOrderCount: 0,
    registryCount: 54,
    entryCount: 4242,
    packageCount: 0,
    diagnosticCount: 0
  },
  effects: adapterEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult)

const createExecutedAdapterResult = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult => createAdapterResult({
  status: 'executed',
  sourcePreflightStatus: 'deferred',
  reason: 'post-commit verification executor adapter executed the injected-test-only host',
  postCommitVerificationExecutorAdapter: 'executed',
  verificationHostCalled: true,
  verificationOutcomeReceived: true,
  verificationOutcomeNormalized: true,
  verificationExecutionAllowed: true,
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
  lockfileHash,
  outcome: {
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
    summary,
    diagnostics: []
  },
  summary,
  effects: adapterEffects({
    postCommitVerificationExecutorCalled: true,
    injectedVerificationHostCalled: true,
    verificationOutcomeReceived: true,
    verifiedOutcomeReceived: true
  }),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoPersistentReadsOrWrites = (
  result: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult
): void => {
  expect(result.effects.realPostCommitVerificationExecutorCalled).toBe(false)
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

describe('third-party post-commit verification executor source', () => {
  it('is disabled by default and does not call the executor adapter source', async() => {
    const readPostCommitVerificationExecutorAdapter = vi.fn()
    const source = createThirdPartyDataPackPostCommitVerificationExecutorSource({
      readPostCommitVerificationExecutorAdapter
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_EXECUTOR_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_EXECUTOR_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(readPostCommitVerificationExecutorAdapter).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.transactionLogMatched).toBe(false)
    expectNoPersistentReadsOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('allows command continuation when an enabled adapter source reports skipped', async() => {
    const readPostCommitVerificationExecutorAdapter = vi.fn(async() => createAdapterResult({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      candidateIdentity,
      lockfileHash,
      summary
    }))
    const source = createThirdPartyDataPackPostCommitVerificationExecutorSource({
      enabled: true,
      readPostCommitVerificationExecutorAdapter
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readPostCommitVerificationExecutorAdapter).toHaveBeenCalledOnce()
    expect(result.postCommitVerificationExecutorAdapterStatus).toBe('skipped')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect('verificationRequest' in result).toBe(false)
    expect('outcome' in result).toBe(false)
    expect('preflight' in result).toBe(false)
    expectNoPersistentReadsOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('accepts an injected-test-only verified adapter outcome without exposing verifier internals', async() => {
    const source = createThirdPartyDataPackPostCommitVerificationExecutorSource({
      enabled: true,
      readPostCommitVerificationExecutorAdapter: async() => createExecutedAdapterResult()
    })

    const result = await source()

    expect(result.status).toBe('executed')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.postCommitVerificationExecutorAdapterStatus).toBe('executed')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.injectedExecutorHostMode).toBe('injected-test-only')
    expect(result.verificationOutcomeKind).toBe('verified')
    expect(result.transactionLogMatched).toBe(true)
    expect(result.packageStateMatched).toBe(true)
    expect(result.settingsLockfileMatched).toBe(true)
    expect(result.liveRegistryMatched).toBe(true)
    expect(result.saveCacheIsolated).toBe(true)
    expect(result.effects.injectedPostCommitVerificationAdapterExecuted).toBe(true)
    expect(result.effects.injectedVerificationHostCalled).toBe(true)
    expect(result.effects.verificationOutcomeReceived).toBe(true)
    expect(result.effects.verificationOutcomeNormalized).toBe(true)
    expect(result.effects.verifiedOutcomeReceived).toBe(true)
    expect(result.summary).toMatchObject({
      selectedPackageCount: 1,
      registryCount: 55,
      entryCount: 4243,
      diagnosticCount: 0
    })
    expect('verificationRequest' in result).toBe(false)
    expect('outcome' in result).toBe(false)
    expect('verificationHost' in result).toBe(false)
    expectNoPersistentReadsOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('accepts an injected path-free post-commit verification host result without persistent reads or writes', async() => {
    const executePostCommitVerification = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope).toMatchObject({
        requestedCommandId: 'install',
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        lockfileHash,
        verificationOutcomeKind: 'verified',
        transactionLogMatched: true,
        packageStateMatched: true,
        settingsLockfileMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true
      })
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect('verificationRequest' in envelope).toBe(false)
      expect('outcome' in envelope).toBe(false)
      expect('candidateRegistrySet' in envelope).toBe(false)
      expect('programDirectoryPath' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        verificationOutcomeKind: 'verified' as const,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        transactionLogMatched: true,
        packageStateMatched: true,
        settingsLockfileMatched: true,
        liveRegistryMatched: true,
        saveCacheIsolated: true,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.post-commit-verification-executor-source.host-accepted',
            messageKey: 'mods.info.lifecycle.transaction.postCommitVerificationHostAccepted',
            packageId,
            recovery: 'none'
          }
        ],
        effects: hostEffects()
      }
    })
    const source = createThirdPartyDataPackPostCommitVerificationExecutorSource({
      enabled: true,
      readPostCommitVerificationExecutorAdapter: async() => createExecutedAdapterResult(),
      executePostCommitVerification
    })

    const result = await source()

    expect(result.status).toBe('executed')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.postCommitVerificationExecutorAdapterStatus).toBe('executed')
    expect(result.postCommitVerificationExecutorHostStatus).toBe('accepted')
    expect(result.sourcePreflightStatus).toBe('deferred')
    expect(result.verificationOutcomeKind).toBe('verified')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(executePostCommitVerification).toHaveBeenCalledOnce()
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.post-commit-verification-executor-source.host-accepted',
        packageId
      })
    ])
    expect(result.effects.injectedPostCommitVerificationAdapterExecuted).toBe(true)
    expect(result.effects.injectedVerificationHostCalled).toBe(true)
    expect(result.effects.postCommitVerificationExecutorHostCalled).toBe(true)
    expect(result.effects.postCommitVerificationExecutorHostAccepted).toBe(true)
    expect(result.effects.realPostCommitVerificationExecutorCalled).toBe(false)
    expect(result.effects.transactionLogRead).toBe(false)
    expect(result.effects.postCommitVerificationExecuted).toBe(false)
    expect('verificationRequest' in result).toBe(false)
    expect('outcome' in result).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('verificationRequest')
    expect(serialized).not.toContain('candidateRegistrySet')
    expect(serialized).not.toContain('programDirectoryPath')
    expectNoPersistentReadsOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe post-commit verification host results without exposing host details', async() => {
    const executePostCommitVerification = vi.fn(async() => ({
      status: 'accepted' as const,
      requestedCommandId: 'install' as const,
      targetPackageId: packageId,
      verificationOutcomeKind: 'verified' as const,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      transactionLogMatched: true,
      packageStateMatched: true,
      settingsLockfileMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true,
      programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
      diagnostics: [
        {
          code: 'LIFECYCLE-TRANSACTION-001',
          ruleId: 'LIFECYCLE-TRANSACTION-001',
          severity: 'error',
          stage: 'third-party.post-commit-verification-executor-source.host-unsafe',
          messageKey: 'mods.error.lifecycle.transaction.001',
          packageId,
          recovery: 'retry',
          file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/verification.json'
        }
      ],
      effects: {
        ...hostEffects(),
        transactionLogRead: true
      } as never
    }))
    const source = createThirdPartyDataPackPostCommitVerificationExecutorSource({
      enabled: true,
      readPostCommitVerificationExecutorAdapter: async() => createExecutedAdapterResult(),
      executePostCommitVerification
    })

    await expect(source()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPostCommitVerificationExecutorBlockedError
    )

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitVerificationExecutorBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitVerificationExecutorBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.postCommitVerificationExecutorHostStatus).toBe('accepted')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-executor-source.host-unsafe',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-executor-source.unsafe-verification-host-result',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-executor-source.verification-host-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('verification.json')
      expect(serialized).not.toContain('programDirectoryPath')
      expect(result.effects.postCommitVerificationExecutorHostCalled).toBe(true)
      expect(result.effects.postCommitVerificationExecutorHostAccepted).toBe(true)
      expectNoPersistentReadsOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks deferred, missing and throwing adapter sources without leaking host details', async() => {
    const missingSource = createThirdPartyDataPackPostCommitVerificationExecutorSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackPostCommitVerificationExecutorSource({
      enabled: true,
      readPostCommitVerificationExecutorAdapter: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/post-commit-verifier-source')
      }
    })
    const deferredSource = createThirdPartyDataPackPostCommitVerificationExecutorSource({
      enabled: true,
      readPostCommitVerificationExecutorAdapter: async() => createAdapterResult({
        status: 'blocked',
        sourcePreflightStatus: 'deferred',
        targetPackageId: packageId,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.post-commit-verification-executor-source.blocked-source',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/verification.json',
            recovery: 'retry'
          }
        ] as never
      })
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPostCommitVerificationExecutorBlockedError
    )
    await expect(deferredSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPostCommitVerificationExecutorBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitVerificationExecutorBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitVerificationExecutorBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-executor-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoPersistentReadsOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe real-host or read-effect drift while copying hostile arrays safely', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/post-commit-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackPostCommitVerificationExecutorSource({
      enabled: true,
      readPostCommitVerificationExecutorAdapter: async() => createExecutedAdapterResult({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        verificationHost: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...adapterEffects({
            postCommitVerificationExecutorCalled: true,
            injectedVerificationHostCalled: true,
            verificationOutcomeReceived: true,
            verifiedOutcomeReceived: true
          }),
          transactionLogRead: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitVerificationExecutorBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitVerificationExecutorBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-executor-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('post-commit-source-selected-package-ids')
      expect('verificationHost' in result).toBe(false)
      expectNoPersistentReadsOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })
})
