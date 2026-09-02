import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitPersistentReadsProofs
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentReadsSource'
import type {
  ThirdPartyDataPackPostCommitPersistentVerificationReadSourceEffectSummary,
  ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentVerificationReadSource'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorSourceEffectSummary,
  ThirdPartyDataPackPostCommitVerificationExecutorSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationExecutorSource'
import {
  createThirdPartyDataPackPostCommitVerificationReadAcknowledgementSource,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_READ_ACKNOWLEDGEMENT_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_READ_ACKNOWLEDGEMENT_SOURCE_MODE,
  ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError,
  type ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitVerificationReadAcknowledgementSource'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
}

const lockfileHash = testHash('d')

const persistentReadProofs: ThirdPartyDataPackPostCommitPersistentReadsProofs = {
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true
}

const executorEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorSourceEffectSummary> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorSourceEffectSummary => ({
  postCommitVerificationExecutorSourceCalled: true,
  postCommitVerificationExecutorAdapterSourceCalled: true,
  injectedPostCommitVerificationAdapterExecuted: false,
  injectedVerificationHostCalled: false,
  postCommitVerificationExecutorHostCalled: false,
  postCommitVerificationExecutorHostAccepted: false,
  verificationOutcomeReceived: false,
  verificationOutcomeNormalized: false,
  verifiedOutcomeReceived: false,
  failedOutcomeReceived: false,
  retryOutcomeReceived: false,
  rollbackOutcomeReceived: false,
  realPostCommitVerificationExecutorCalled: false,
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

const readEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentVerificationReadSourceEffectSummary> = {}
): ThirdPartyDataPackPostCommitPersistentVerificationReadSourceEffectSummary => ({
  postCommitPersistentVerificationReadSourceCalled: true,
  postCommitPersistentReadsSourceCalled: true,
  persistentReadsSourceAccepted: false,
  persistentVerificationReadProofAccepted: false,
  realPostCommitPersistentVerificationReadHostCalled: false,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
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
  runtimePublicationCommitted: false,
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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

const createExecutorSourceResult = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorSourceResult> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorSourceResult => ({
  kind: 'third-party-post-commit-verification-executor-source',
  mode: 'default-disabled-post-commit-verification-executor-source',
  status: 'skipped',
  reason: 'no selected third-party data packs',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  commandContinuationAllowed: true,
  postCommitVerificationExecutorAdapterStatus: 'skipped',
  postCommitVerificationExecutorHostStatus: undefined,
  sourcePreflightStatus: 'skipped',
  injectedExecutorHostMode: undefined,
  verificationOutcomeKind: undefined,
  transactionLogMatched: false,
  packageStateMatched: false,
  settingsLockfileMatched: false,
  liveRegistryMatched: false,
  saveCacheIsolated: false,
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
  effects: executorEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackPostCommitVerificationExecutorSourceResult)

const createExecutedExecutorSourceResult = (
  overrides: Partial<ThirdPartyDataPackPostCommitVerificationExecutorSourceResult> = {}
): ThirdPartyDataPackPostCommitVerificationExecutorSourceResult => createExecutorSourceResult({
  status: 'executed',
  reason: 'third-party post-commit verification executor source accepted a verified injected-host outcome',
  postCommitVerificationExecutorAdapterStatus: 'executed',
  sourcePreflightStatus: 'deferred',
  postCommitVerificationExecutorHostMode: 'injected-test-only',
  injectedExecutorHostMode: 'injected-test-only',
  verificationOutcomeKind: 'verified',
  transactionLogMatched: true,
  packageStateMatched: true,
  settingsLockfileMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true,
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
  summary: {
    selectedPackageCount: 1,
    blockedPackageCount: 0,
    blockedCandidateCount: 0,
    loadOrderCount: 1,
    registryCount: 55,
    entryCount: 4243,
    packageCount: 1,
    diagnosticCount: 0
  },
  effects: executorEffects({
    injectedPostCommitVerificationAdapterExecuted: true,
    injectedVerificationHostCalled: true,
    verificationOutcomeReceived: true,
    verificationOutcomeNormalized: true,
    verifiedOutcomeReceived: true
  }),
  ...overrides
})

const createReadSourceResult = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult> = {}
): ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult => ({
  kind: 'third-party-post-commit-persistent-verification-read-source',
  mode: 'default-disabled-post-commit-persistent-verification-read-source',
  status: 'skipped',
  reason: 'no selected third-party data packs',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  postCommitPersistentReadsSourceStatus: 'skipped',
  postCommitPersistentReadsHostStatus: undefined,
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
  lockfileHash: undefined,
  persistentVerificationReadChecks: [],
  diagnostics: [],
  effects: readEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult)

const createReadyReadSourceResult = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult> = {}
): ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult => createReadSourceResult({
  status: 'ready',
  reason: 'third-party post-commit persistent verification read source accepted read proofs',
  postCommitPersistentReadsSourceStatus: 'ready',
  postCommitPersistentReadsHostStatus: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  persistentReadProofs,
  persistentVerificationReadChecks: [],
  effects: readEffects({
    persistentReadsSourceAccepted: true,
    persistentVerificationReadProofAccepted: true
  }),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealEffects = (
  result: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult,
  continuationAllowed: boolean,
  ready: boolean
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.uiIpcResultContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.verifiedOutcomeAcknowledged).toBe(ready)
  expect(result.effects.persistentReadProofAcknowledged).toBe(ready)
  const {
    postCommitVerificationReadAcknowledgementSourceCalled: _ackSourceCalled,
    postCommitVerificationExecutorSourceCalled: _executorSourceCalled,
    postCommitPersistentVerificationReadSourceCalled: _readSourceCalled,
    postCommitVerificationExecutorAccepted: _executorAccepted,
    persistentVerificationReadAccepted: _readAccepted,
    verifiedOutcomeAcknowledged: _outcomeAcknowledged,
    persistentReadProofAcknowledged: _proofAcknowledged,
    realPostCommitVerificationAcknowledgementHostCalled: _realAckHostCalled,
    appBootstrapContinuationAllowed: _appContinuationAllowed,
    commandContinuationAllowed: _commandContinuationAllowed,
    uiIpcResultContinuationAllowed: _uiContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party post-commit verification read acknowledgement source', () => {
  it('is disabled by default and does not call either source', async() => {
    const readPostCommitVerificationExecutorSource = vi.fn()
    const readPostCommitPersistentVerificationReadSource = vi.fn()
    const source = createThirdPartyDataPackPostCommitVerificationReadAcknowledgementSource({
      readPostCommitVerificationExecutorSource,
      readPostCommitPersistentVerificationReadSource
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_READ_ACKNOWLEDGEMENT_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_READ_ACKNOWLEDGEMENT_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.executorSourceCalled).toBe(false)
    expect(result.persistentVerificationReadSourceCalled).toBe(false)
    expect(readPostCommitVerificationExecutorSource).not.toHaveBeenCalled()
    expect(readPostCommitPersistentVerificationReadSource).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRealEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when both upstream sources are safely skipped', async() => {
    const readPostCommitVerificationExecutorSource = vi.fn(async() => createExecutorSourceResult({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1
    }))
    const readPostCommitPersistentVerificationReadSource = vi.fn(async() => createReadSourceResult({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1
    }))
    const source = createThirdPartyDataPackPostCommitVerificationReadAcknowledgementSource({
      enabled: true,
      readPostCommitVerificationExecutorSource,
      readPostCommitPersistentVerificationReadSource
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(readPostCommitVerificationExecutorSource).toHaveBeenCalledOnce()
    expect(readPostCommitPersistentVerificationReadSource).toHaveBeenCalledOnce()
    expect(result.postCommitVerificationExecutorSourceStatus).toBe('skipped')
    expect(result.postCommitPersistentVerificationReadSourceStatus).toBe('skipped')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect('postCommitVerificationExecutorSource' in result).toBe(false)
    expect('postCommitPersistentVerificationReadSource' in result).toBe(false)
    expect('persistentReadsHost' in result).toBe(false)
    expectNoRealEffects(result, true, false)
    expectJsonGraphFrozen(result)
  })

  it('acknowledges a verified executor outcome only when persistent read proofs match', async() => {
    const source = createThirdPartyDataPackPostCommitVerificationReadAcknowledgementSource({
      enabled: true,
      readPostCommitVerificationExecutorSource: async() => createExecutedExecutorSourceResult({
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.post-commit-verification-read-acknowledgement-source.executor-ready',
            messageKey: 'mods.info.lifecycle.transaction.executorReady',
            packageId,
            recovery: 'none'
          }
        ]
      } as never),
      readPostCommitPersistentVerificationReadSource: async() => createReadyReadSourceResult({
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.post-commit-verification-read-acknowledgement-source.read-ready',
            messageKey: 'mods.info.lifecycle.transaction.readReady',
            packageId,
            recovery: 'none'
          }
        ]
      } as never)
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.postCommitVerificationExecutorSourceStatus).toBe('executed')
    expect(result.postCommitVerificationExecutorHostMode).toBe('injected-test-only')
    expect(result.postCommitPersistentVerificationReadSourceStatus).toBe('ready')
    expect(result.verificationOutcomeKind).toBe('verified')
    expect(result.transactionLogMatched).toBe(true)
    expect(result.packageStateMatched).toBe(true)
    expect(result.settingsLockfileMatched).toBe(true)
    expect(result.liveRegistryMatched).toBe(true)
    expect(result.saveCacheIsolated).toBe(true)
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentReadProofs).toEqual(persistentReadProofs)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.post-commit-verification-read-acknowledgement-source.executor-ready'
      }),
      expect.objectContaining({
        stage: 'third-party.post-commit-verification-read-acknowledgement-source.read-ready'
      })
    ])
    expect(result.summary).toMatchObject({
      selectedPackageCount: 1,
      registryCount: 55,
      entryCount: 4243,
      diagnosticCount: 2
    })
    expect('outcome' in result).toBe(false)
    expect('verificationRequest' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoRealEffects(result, true, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks identity drift, failed outcomes and incomplete read proofs', async() => {
    const cases = [
      {
        label: 'candidate drift',
        executor: createExecutedExecutorSourceResult(),
        read: createReadyReadSourceResult({
          candidateIdentity: {
            ...candidateIdentity,
            candidateHash: testHash('e')
          }
        }),
        blockedCheckId: 'candidate-identity-consistent'
      },
      {
        label: 'failed outcome',
        executor: createExecutedExecutorSourceResult({
          verificationOutcomeKind: 'failed',
          transactionLogMatched: false,
          packageStateMatched: false,
          settingsLockfileMatched: false,
          liveRegistryMatched: false,
          saveCacheIsolated: false
        } as never),
        read: createReadyReadSourceResult(),
        blockedCheckId: 'verified-outcome-only'
      },
      {
        label: 'incomplete proof',
        executor: createExecutedExecutorSourceResult(),
        read: createReadyReadSourceResult({
          persistentReadProofs: {
            ...persistentReadProofs,
            modLockStateMatched: false
          }
        }),
        blockedCheckId: 'persistent-read-proofs-consistent'
      }
    ] as const

    for (const currentCase of cases) {
      const source = createThirdPartyDataPackPostCommitVerificationReadAcknowledgementSource({
        enabled: true,
        readPostCommitVerificationExecutorSource: async() => currentCase.executor,
        readPostCommitPersistentVerificationReadSource: async() => currentCase.read
      })

      try {
        await source()
      } catch (error) {
        expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError)
        const result = (error as ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError).result
        expect(result.status).toBe('blocked')
        expect(result.checks).toEqual(expect.arrayContaining([
          expect.objectContaining({
            id: currentCase.blockedCheckId,
            status: 'blocked'
          })
        ]))
        expect(result.diagnostics).toEqual(expect.arrayContaining([
          expect.objectContaining({
            stage: `third-party.post-commit-verification-read-acknowledgement-source.checks.${currentCase.blockedCheckId}`,
            packageId
          }),
          expect.objectContaining({
            stage: 'third-party.post-commit-verification-read-acknowledgement-source.acknowledgement-blocked',
            packageId
          })
        ]))
        expect(JSON.stringify(result)).not.toContain(currentCase.label)
        expectNoRealEffects(result, false, false)
        expectJsonGraphFrozen(result)
      }
    }
  })

  it('blocks missing, throwing and unsafe sources without leaking host paths', async() => {
    const missingExecutorSource = createThirdPartyDataPackPostCommitVerificationReadAcknowledgementSource({
      enabled: true,
      readPostCommitPersistentVerificationReadSource: async() => createReadyReadSourceResult()
    })
    const throwingReadSource = createThirdPartyDataPackPostCommitVerificationReadAcknowledgementSource({
      enabled: true,
      readPostCommitVerificationExecutorSource: async() => createExecutedExecutorSourceResult(),
      readPostCommitPersistentVerificationReadSource: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/post-commit-read-ack-source')
      }
    })
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/post-commit-read-ack-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const unsafeSource = createThirdPartyDataPackPostCommitVerificationReadAcknowledgementSource({
      enabled: true,
      readPostCommitVerificationExecutorSource: async() => createExecutedExecutorSourceResult({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        acknowledgementHost: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...executorEffects({
            injectedPostCommitVerificationAdapterExecuted: true,
            injectedVerificationHostCalled: true,
            verificationOutcomeReceived: true,
            verificationOutcomeNormalized: true,
            verifiedOutcomeReceived: true
          }),
          transactionLogRead: true
        } as never,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.post-commit-verification-read-acknowledgement-source.unsafe-executor',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/ack.json',
            recovery: 'retry'
          }
        ] as never
      } as unknown as Partial<ThirdPartyDataPackPostCommitVerificationExecutorSourceResult>),
      readPostCommitPersistentVerificationReadSource: async() => createReadyReadSourceResult({
        selectedPackageIds: [packageId],
        loadOrder: [packageId]
      })
    })

    await expect(missingExecutorSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError
    )

    try {
      await throwingReadSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.executorSourceCalled).toBe(true)
      expect(result.persistentVerificationReadSourceCalled).toBe(true)
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-read-acknowledgement-source.read-source-failed'
        })
      ]))
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRealEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }

    try {
      await unsafeSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-read-acknowledgement-source.unsafe-executor',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-read-acknowledgement-source.unsafe-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-verification-read-acknowledgement-source.acknowledgement-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('ack.json')
      expect(serialized).not.toContain('post-commit-read-ack-selected-package-ids')
      expect('acknowledgementHost' in result).toBe(false)
      expectNoRealEffects(result, false, false)
      expectJsonGraphFrozen(result)
    }
  })
})
