import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary,
  ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'
import {
  createThirdPartyDataPackPostCommitPersistentReadsSource,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READS_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READS_SOURCE_MODE,
  ThirdPartyDataPackPostCommitPersistentReadsBlockedError,
  type ThirdPartyDataPackPostCommitPersistentReadsHostEffectSummary,
  type ThirdPartyDataPackPostCommitPersistentReadsProofs,
  type ThirdPartyDataPackPostCommitPersistentReadsSourceResult
} from '@/domain/mods/thirdPartyDataPackPostCommitPersistentReadsSource'

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

const settingsEffects = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary> = {}
): ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary => ({
  settingsLockfileCommitSourceCalled: true,
  packageFileStagingSourceCalled: true,
  injectedSettingsLockfileCommitHostCalled: false,
  settingsLockfileCommitHostCalled: false,
  settingsLockfileCommitHostAccepted: false,
  realSettingsLockfileCommitHostCalled: false,
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

const createSettingsResult = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitSourceResult> = {}
): ThirdPartyDataPackSettingsLockfileCommitSourceResult => ({
  kind: 'third-party-settings-lockfile-commit-source',
  mode: 'default-disabled-settings-lockfile-commit-source',
  status: 'skipped',
  reason: 'no selected third-party data packs',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  packageFileStagingSourceStatus: 'skipped',
  packageFileStagingHostStatus: undefined,
  settingsLockfileCommitHostStatus: undefined,
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
  effects: settingsEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackSettingsLockfileCommitSourceResult)

const createAcceptedSettingsResult = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitSourceResult> = {}
): ThirdPartyDataPackSettingsLockfileCommitSourceResult => createSettingsResult({
  status: 'accepted',
  reason: 'settings-lockfile commit source accepted an injected host acknowledgement',
  packageFileStagingSourceStatus: 'accepted',
  packageFileStagingHostStatus: 'accepted',
  settingsLockfileCommitHostStatus: 'accepted',
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
  effects: settingsEffects({
    injectedSettingsLockfileCommitHostCalled: true,
    settingsLockfileCommitHostCalled: true,
    settingsLockfileCommitHostAccepted: true
  }),
  ...overrides
})

const persistentReadProofs: ThirdPartyDataPackPostCommitPersistentReadsProofs = {
  transactionLogCommitted: true,
  packageStateMatched: true,
  settingsStateMatched: true,
  modLockStateMatched: true,
  liveRegistryMatched: true,
  saveCacheIsolated: true
}

const hostEffects = (
  overrides: Partial<ThirdPartyDataPackPostCommitPersistentReadsHostEffectSummary> = {}
): ThirdPartyDataPackPostCommitPersistentReadsHostEffectSummary => ({
  postCommitPersistentReadsHostCalled: true,
  postCommitPersistentReadsHostAccepted: true,
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoPersistentReadsOrWrites = (
  result: ThirdPartyDataPackPostCommitPersistentReadsSourceResult,
  continuationAllowed: boolean
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.commandContinuationAllowed).toBe(continuationAllowed)

  const {
    postCommitPersistentReadsSourceCalled: _postCommitPersistentReadsSourceCalled,
    settingsLockfileCommitSourceCalled: _settingsLockfileCommitSourceCalled,
    settingsLockfileCommitHostAccepted: _settingsLockfileCommitHostAccepted,
    injectedPostCommitPersistentReadsHostCalled: _injectedPostCommitPersistentReadsHostCalled,
    postCommitPersistentReadsHostCalled: _postCommitPersistentReadsHostCalled,
    postCommitPersistentReadsHostAccepted: _postCommitPersistentReadsHostAccepted,
    persistentReadProofAccepted: _persistentReadProofAccepted,
    realPostCommitPersistentReadsHostCalled: _realPostCommitPersistentReadsHostCalled,
    appBootstrapContinuationAllowed: _appBootstrapContinuationAllowed,
    commandContinuationAllowed: _commandContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party post-commit persistent reads source', () => {
  it('is disabled by default and does not call the settings-lockfile commit source', async() => {
    const readSettingsLockfileCommitSource = vi.fn()
    const source = createThirdPartyDataPackPostCommitPersistentReadsSource({
      readSettingsLockfileCommitSource
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READS_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_READS_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readSettingsLockfileCommitSource).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.persistentReadProofs).toBeUndefined()
    expectNoPersistentReadsOrWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when an enabled source reports skipped settings-lockfile commit', async() => {
    const readSettingsLockfileCommitSource = vi.fn(async() => createSettingsResult({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1
    }))
    const source = createThirdPartyDataPackPostCommitPersistentReadsSource({
      enabled: true,
      readSettingsLockfileCommitSource
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readSettingsLockfileCommitSource).toHaveBeenCalledOnce()
    expect(result.settingsLockfileCommitSourceStatus).toBe('skipped')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect('settingsLockfileCommitSource' in result).toBe(false)
    expect('postCommitPersistentReadsHost' in result).toBe(false)
    expect('transactionLogReader' in result).toBe(false)
    expectNoPersistentReadsOrWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks accepted settings-lockfile commit before persistent reads can run without a host', async() => {
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/post-commit-persistent-reads-diagnostic')
      }
    }), {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.post-commit-persistent-reads-source.accepted-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      file: 'C:/Users/LENOVO/mods/sample_pack/post-commit-read.json',
      recovery: 'retry'
    })
    const source = createThirdPartyDataPackPostCommitPersistentReadsSource({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedSettingsResult({
        blockedPackageIds: [blockedPackageId],
        diagnostics: [diagnostic] as never
      })
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackPostCommitPersistentReadsBlockedError)

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitPersistentReadsBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitPersistentReadsBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.settingsLockfileCommitSourceStatus).toBe('accepted')
      expect(result.settingsLockfileCommitHostStatus).toBe('accepted')
      expect(result.commandContinuationAllowed).toBe(false)
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(result.lockfileHash).toBe(lockfileHash)
      expect(result.writeProbeEvidence).toEqual({
        modLockWriteProbeStatus: 'written',
        transactionLogWriteProbeStatus: 'written',
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true
      })
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-reads-source.accepted-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-reads-source.reads-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('post-commit-read.json')
      expect(serialized).not.toContain('hostPath')
      expectNoPersistentReadsOrWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('accepts an injected path-free persistent-read proof without real reads or writes', async() => {
    const readPostCommitPersistentState = vi.fn(async envelope => {
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
        candidateIdentity,
        lockfileHash,
        packageFileStagingHostStatus: 'accepted',
        settingsLockfileCommitHostStatus: 'accepted',
        writeProbeEvidence: {
          modLockWriteProbeStatus: 'written',
          transactionLogWriteProbeStatus: 'written',
          modLockPersistentWriteExecuted: true,
          transactionLogPersistentWriteExecuted: true
        }
      })
      expect('transactionLogReader' in envelope).toBe(false)
      expect('settingsReader' in envelope).toBe(false)
      expect('lockfileReader' in envelope).toBe(false)
      expect('programDirectoryPath' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        packageFileStagingHostStatus: 'accepted' as const,
        settingsLockfileCommitHostStatus: 'accepted' as const,
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        persistentReadProofs,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.post-commit-persistent-reads-source.host-accepted',
            messageKey: 'mods.info.lifecycle.transaction.postCommitPersistentReadsAccepted',
            packageId,
            recovery: 'none'
          }
        ],
        effects: hostEffects()
      }
    })
    const source = createThirdPartyDataPackPostCommitPersistentReadsSource({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedSettingsResult(),
      readPostCommitPersistentState
    })

    const result = await source()

    expect(result.status).toBe('ready')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.settingsLockfileCommitSourceStatus).toBe('accepted')
    expect(result.packageFileStagingHostStatus).toBe('accepted')
    expect(result.settingsLockfileCommitHostStatus).toBe('accepted')
    expect(result.postCommitPersistentReadsHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.persistentReadProofs).toEqual(persistentReadProofs)
    expect(readPostCommitPersistentState).toHaveBeenCalledOnce()
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.post-commit-persistent-reads-source.host-accepted',
        packageId
      })
    ])
    expect(result.effects.settingsLockfileCommitHostAccepted).toBe(true)
    expect(result.effects.injectedPostCommitPersistentReadsHostCalled).toBe(true)
    expect(result.effects.postCommitPersistentReadsHostCalled).toBe(true)
    expect(result.effects.postCommitPersistentReadsHostAccepted).toBe(true)
    expect(result.effects.persistentReadProofAccepted).toBe(true)
    expect(result.effects.realPostCommitPersistentReadsHostCalled).toBe(false)
    expect(result.effects.transactionLogRead).toBe(false)
    expect(result.effects.settingsRead).toBe(false)
    expect(result.effects.lockfileRead).toBe(false)
    expect('settingsLockfileCommitSource' in result).toBe(false)
    expect('persistentReadsHost' in result).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('transactionLogReader')
    expect(serialized).not.toContain('programDirectoryPath')
    expectNoPersistentReadsOrWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe persistent-read host results without exposing host paths', async() => {
    const source = createThirdPartyDataPackPostCommitPersistentReadsSource({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedSettingsResult(),
      readPostCommitPersistentState: async() => ({
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        packageFileStagingHostStatus: 'accepted' as const,
        settingsLockfileCommitHostStatus: 'accepted' as const,
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        persistentReadProofs,
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.post-commit-persistent-reads-source.host-unsafe',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/userdata/mod-lock.json',
            recovery: 'retry'
          }
        ],
        effects: {
          ...hostEffects(),
          transactionLogRead: true
        } as never
      })
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackPostCommitPersistentReadsBlockedError)

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitPersistentReadsBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitPersistentReadsBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.postCommitPersistentReadsHostStatus).toBe('accepted')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-reads-source.host-unsafe',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-reads-source.unsafe-read-host-result',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-reads-source.read-host-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('mod-lock.json')
      expect(serialized).not.toContain('programDirectoryPath')
      expect(result.effects.postCommitPersistentReadsHostCalled).toBe(true)
      expect(result.effects.postCommitPersistentReadsHostAccepted).toBe(true)
      expectNoPersistentReadsOrWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks mismatched persistent-read proofs before command continuation', async() => {
    const source = createThirdPartyDataPackPostCommitPersistentReadsSource({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedSettingsResult(),
      readPostCommitPersistentState: async() => ({
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        candidateHash: testHash('e'),
        lockfileHash,
        packageFileStagingHostStatus: 'accepted' as const,
        settingsLockfileCommitHostStatus: 'accepted' as const,
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        persistentReadProofs: {
          ...persistentReadProofs,
          modLockStateMatched: false
        },
        effects: hostEffects()
      })
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackPostCommitPersistentReadsBlockedError)

    try {
      await source()
    } catch (error) {
      const result = (error as ThirdPartyDataPackPostCommitPersistentReadsBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.persistentReadProofs).toEqual({
        ...persistentReadProofs,
        modLockStateMatched: false
      })
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-reads-source.read-host-blocked',
          packageId
        })
      ]))
      expectNoPersistentReadsOrWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks missing, throwing and unsafe sources without leaking host details', async() => {
    const missingSource = createThirdPartyDataPackPostCommitPersistentReadsSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackPostCommitPersistentReadsSource({
      enabled: true,
      readSettingsLockfileCommitSource: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/post-commit-persistent-reads-source')
      }
    })
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/persistent-reads-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const unsafeSource = createThirdPartyDataPackPostCommitPersistentReadsSource({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createSettingsResult({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        transactionLogReader: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...settingsEffects(),
          transactionCommitted: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackSettingsLockfileCommitSourceResult>)
    })

    await expect(missingSource()).rejects.toBeInstanceOf(ThirdPartyDataPackPostCommitPersistentReadsBlockedError)

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitPersistentReadsBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitPersistentReadsBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-reads-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoPersistentReadsOrWrites(result, false)
      expectJsonGraphFrozen(result)
    }

    try {
      await unsafeSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPostCommitPersistentReadsBlockedError)
      const result = (error as ThirdPartyDataPackPostCommitPersistentReadsBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-reads-source.unsafe-source'
        }),
        expect.objectContaining({
          stage: 'third-party.post-commit-persistent-reads-source.reads-blocked'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('persistent-reads-selected-package-ids')
      expect('transactionLogReader' in result).toBe(false)
      expectNoPersistentReadsOrWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
