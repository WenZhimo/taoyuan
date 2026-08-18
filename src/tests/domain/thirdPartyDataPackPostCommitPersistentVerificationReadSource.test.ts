import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitPersistentReadsProofs,
  ThirdPartyDataPackPostCommitPersistentReadsSourceEffectSummary,
  ThirdPartyDataPackPostCommitPersistentReadsSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentReadsSource'
import {
  createThirdPartyDataPackPostCommitPersistentVerificationReadSource,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_VERIFICATION_READ_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_VERIFICATION_READ_SOURCE_MODE,
  ThirdPartyDataPackPostCommitPersistentVerificationReadSourceBlockedError,
  type ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentVerificationReadSource'

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

const readsEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentReadsSourceEffectSummary> = {}
): ThirdPartyDataPackPostCommitPersistentReadsSourceEffectSummary => ({
  postCommitPersistentReadsSourceCalled: true,
  settingsLockfileCommitSourceCalled: true,
  settingsLockfileCommitHostAccepted: false,
  injectedPostCommitPersistentReadsHostCalled: false,
  postCommitPersistentReadsHostCalled: false,
  postCommitPersistentReadsHostAccepted: false,
  persistentReadProofAccepted: false,
  realPostCommitPersistentReadsHostCalled: false,
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
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
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

const createReadsResult = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentReadsSourceResult> = {}
): ThirdPartyDataPackPostCommitPersistentReadsSourceResult => ({
  kind: 'third-party-post-commit-persistent-reads-source',
  mode: 'default-disabled-post-commit-persistent-reads-source',
  status: 'skipped',
  reason: 'no selected third-party data packs',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  settingsLockfileCommitSourceStatus: 'skipped',
  packageFileStagingHostStatus: undefined,
  settingsLockfileCommitHostStatus: undefined,
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
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'skipped',
    transactionLogWriteProbeStatus: 'skipped',
    modLockPersistentWriteExecuted: false,
    transactionLogPersistentWriteExecuted: false
  },
  diagnostics: [],
  effects: readsEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackPostCommitPersistentReadsSourceResult)

const createReadyReadsResult = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentReadsSourceResult> = {}
): ThirdPartyDataPackPostCommitPersistentReadsSourceResult => createReadsResult({
  status: 'ready',
  reason: 'third-party post-commit persistent reads source accepted an injected path-free read proof',
  settingsLockfileCommitSourceStatus: 'accepted',
  packageFileStagingHostStatus: 'accepted',
  settingsLockfileCommitHostStatus: 'accepted',
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
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  persistentReadProofs,
  effects: readsEffects({
    settingsLockfileCommitHostAccepted: true,
    injectedPostCommitPersistentReadsHostCalled: true,
    postCommitPersistentReadsHostCalled: true,
    postCommitPersistentReadsHostAccepted: true,
    persistentReadProofAccepted: true
  }),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRealReadsOrWrites = (
  result: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult,
  continuationAllowed: boolean
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  const {
    postCommitPersistentVerificationReadSourceCalled: _postCommitPersistentVerificationReadSourceCalled,
    postCommitPersistentReadsSourceCalled: _postCommitPersistentReadsSourceCalled,
    persistentReadsSourceAccepted: _persistentReadsSourceAccepted,
    persistentVerificationReadProofAccepted: _persistentVerificationReadProofAccepted,
    realPostCommitPersistentVerificationReadHostCalled: _realPostCommitPersistentVerificationReadHostCalled,
    appBootstrapContinuationAllowed: _appBootstrapContinuationAllowed,
    commandContinuationAllowed: _commandContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party post-commit persistent verification read source', () => {
  it('is disabled by default and does not call the persistent reads source', async() => {
    const readPostCommitPersistentReadsSource = vi.fn()
    const source = createThirdPartyDataPackPostCommitPersistentVerificationReadSource({
      readPostCommitPersistentReadsSource
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_VERIFICATION_READ_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_VERIFICATION_READ_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readPostCommitPersistentReadsSource).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.persistentReadProofs).toBeUndefined()
    expect(result.persistentVerificationReadChecks.every(check => check.status === 'skipped')).toBe(true)
    expectNoRealReadsOrWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when persistent reads are skipped', async() => {
    const readPostCommitPersistentReadsSource = vi.fn(async() => createReadsResult({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      blockedCandidatePaths: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1
    }))
    const source = createThirdPartyDataPackPostCommitPersistentVerificationReadSource({
      enabled: true,
      readPostCommitPersistentReadsSource
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readPostCommitPersistentReadsSource).toHaveBeenCalledOnce()
    expect(result.postCommitPersistentReadsSourceStatus).toBe('skipped')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect('postCommitPersistentReadsSource' in result).toBe(false)
    expect('verificationReadHost' in result).toBe(false)
    expect('transactionLogReader' in result).toBe(false)
    expectNoRealReadsOrWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('accepts complete path-free persistent read proofs without real reads or writes', async() => {
    const source = createThirdPartyDataPackPostCommitPersistentVerificationReadSource({
      enabled: true,
      readPostCommitPersistentReadsSource: async() => createReadyReadsResult({
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.post-commit-persistent-verification-read-source.proof-ready',
            messageKey: 'mods.info.lifecycle.transaction.persistentVerificationReadReady',
            packageId,
            recovery: 'none'
          }
        ] as never
      })
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.postCommitPersistentReadsSourceStatus).toBe('ready')
    expect(result.postCommitPersistentReadsHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentReadProofs).toEqual(persistentReadProofs)
    expect(result.persistentVerificationReadChecks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.post-commit-persistent-verification-read-source.proof-ready',
        packageId
      })
    ])
    expect(result.effects.persistentReadsSourceAccepted).toBe(true)
    expect(result.effects.persistentVerificationReadProofAccepted).toBe(true)
    expect(result.effects.realPostCommitPersistentVerificationReadHostCalled).toBe(false)
    expect(result.effects.transactionLogRead).toBe(false)
    expect(result.effects.packageStateRead).toBe(false)
    expect(result.effects.settingsRead).toBe(false)
    expect(result.effects.lockfileRead).toBe(false)
    expect(result.effects.liveRegistryRead).toBe(false)
    expect(result.effects.saveCacheIsolationChecked).toBe(false)
    expect('persistentReadsHost' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoRealReadsOrWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks incomplete proofs before command continuation', async() => {
    const source = createThirdPartyDataPackPostCommitPersistentVerificationReadSource({
      enabled: true,
      readPostCommitPersistentReadsSource: async() => createReadyReadsResult({
        persistentReadProofs: {
          ...persistentReadProofs,
          liveRegistryMatched: false
        }
      })
    })

    await expect(source()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPostCommitPersistentVerificationReadSourceBlockedError
    )

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitPersistentVerificationReadSourceBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitPersistentVerificationReadSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.persistentReadProofs).toEqual({
        ...persistentReadProofs,
        liveRegistryMatched: false
      })
      expect(result.persistentVerificationReadChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'live-registry-matched',
          status: 'blocked'
        })
      ]))
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-verification-read-source.checks.live-registry-matched',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-verification-read-source.verification-read-blocked',
          packageId
        })
      ]))
      expectNoRealReadsOrWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks missing, throwing and unsafe sources without leaking host details', async() => {
    const missingSource = createThirdPartyDataPackPostCommitPersistentVerificationReadSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackPostCommitPersistentVerificationReadSource({
      enabled: true,
      readPostCommitPersistentReadsSource: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/persistent-verification-read-source')
      }
    })
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/persistent-verification-read-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const unsafeSource = createThirdPartyDataPackPostCommitPersistentVerificationReadSource({
      enabled: true,
      readPostCommitPersistentReadsSource: async() => createReadyReadsResult({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        transactionLogReader: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.post-commit-persistent-verification-read-source.unsafe-input',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/userdata/mod-lock.json',
            recovery: 'retry'
          }
        ] as never,
        effects: {
          ...readsEffects({
            settingsLockfileCommitHostAccepted: true,
            injectedPostCommitPersistentReadsHostCalled: true,
            postCommitPersistentReadsHostCalled: true,
            postCommitPersistentReadsHostAccepted: true,
            persistentReadProofAccepted: true
          }),
          transactionLogRead: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackPostCommitPersistentReadsSourceResult>)
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPostCommitPersistentVerificationReadSourceBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitPersistentVerificationReadSourceBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitPersistentVerificationReadSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-verification-read-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRealReadsOrWrites(result, false)
      expectJsonGraphFrozen(result)
    }

    try {
      await unsafeSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitPersistentVerificationReadSourceBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitPersistentVerificationReadSourceBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-verification-read-source.unsafe-input',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-verification-read-source.unsafe-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-verification-read-source.verification-read-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('mod-lock.json')
      expect(serialized).not.toContain('persistent-verification-read-selected-package-ids')
      expect('transactionLogReader' in result).toBe(false)
      expectNoRealReadsOrWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
