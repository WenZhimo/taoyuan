import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPackageFileStagingSourceEffectSummary,
  ThirdPartyDataPackPackageFileStagingSourceResult
} from '@/domain/mods/thirdPartyDataPackPackageFileStagingSource'
import {
  createThirdPartyDataPackSettingsLockfileCommitSource,
  THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_COMMIT_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_COMMIT_SOURCE_MODE,
  ThirdPartyDataPackSettingsLockfileCommitBlockedError,
  type ThirdPartyDataPackSettingsLockfileCommitHostEffectSummary,
  type ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'

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

const stagingEffects = (
  overrides: Partial<ThirdPartyDataPackPackageFileStagingSourceEffectSummary> = {}
): ThirdPartyDataPackPackageFileStagingSourceEffectSummary => ({
  packageFileStagingSourceCalled: true,
  atomicCommitPreflightSourceCalled: true,
  injectedPackageFileStagingHostCalled: false,
  packageFileStagingHostCalled: false,
  packageFileStagingHostAccepted: false,
  realPackageFileStagingHostCalled: false,
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

const createStagingResult = (
  overrides: Partial<ThirdPartyDataPackPackageFileStagingSourceResult> = {}
): ThirdPartyDataPackPackageFileStagingSourceResult => ({
  kind: 'third-party-package-file-staging-source',
  mode: 'default-disabled-package-file-staging-source',
  status: 'skipped',
  reason: 'no selected third-party data packs',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  atomicCommitPreflightStatus: 'skipped',
  packageFileStagingHostStatus: undefined,
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
  effects: stagingEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackPackageFileStagingSourceResult)

const createAcceptedStagingResult = (
  overrides: Partial<ThirdPartyDataPackPackageFileStagingSourceResult> = {}
): ThirdPartyDataPackPackageFileStagingSourceResult => createStagingResult({
  status: 'accepted',
  reason: 'package file staging source accepted an injected host acknowledgement',
  atomicCommitPreflightStatus: 'deferred',
  packageFileStagingHostStatus: 'accepted',
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
  effects: stagingEffects({
    injectedPackageFileStagingHostCalled: true,
    packageFileStagingHostCalled: true,
    packageFileStagingHostAccepted: true
  }),
  ...overrides
})

const commitHostEffects = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitHostEffectSummary> = {}
): ThirdPartyDataPackSettingsLockfileCommitHostEffectSummary => ({
  settingsLockfileCommitHostCalled: true,
  settingsLockfileCommitHostAccepted: true,
  transactionCommitted: false,
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimeOrPersistentWrites = (
  result: ThirdPartyDataPackSettingsLockfileCommitSourceResult,
  continuationAllowed: boolean
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.commandContinuationAllowed).toBe(continuationAllowed)

  const {
    settingsLockfileCommitSourceCalled: _settingsLockfileCommitSourceCalled,
    packageFileStagingSourceCalled: _packageFileStagingSourceCalled,
    injectedSettingsLockfileCommitHostCalled: _injectedSettingsLockfileCommitHostCalled,
    settingsLockfileCommitHostCalled: _settingsLockfileCommitHostCalled,
    settingsLockfileCommitHostAccepted: _settingsLockfileCommitHostAccepted,
    realSettingsLockfileCommitHostCalled: _realSettingsLockfileCommitHostCalled,
    appBootstrapContinuationAllowed: _appBootstrapContinuationAllowed,
    commandContinuationAllowed: _commandContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party settings-lockfile commit source', () => {
  it('is disabled by default and does not call the package file staging source', async() => {
    const readPackageFileStagingSource = vi.fn()
    const source = createThirdPartyDataPackSettingsLockfileCommitSource({
      readPackageFileStagingSource
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_COMMIT_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_SETTINGS_LOCKFILE_COMMIT_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readPackageFileStagingSource).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrPersistentWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when an enabled source reports skipped package file staging', async() => {
    const readPackageFileStagingSource = vi.fn(async() => createStagingResult({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1
    }))
    const source = createThirdPartyDataPackSettingsLockfileCommitSource({
      enabled: true,
      readPackageFileStagingSource
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readPackageFileStagingSource).toHaveBeenCalledOnce()
    expect(result.packageFileStagingSourceStatus).toBe('skipped')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect('packageFileStagingSource' in result).toBe(false)
    expect('settingsLockfileCommitHost' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expectNoRuntimeOrPersistentWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks accepted staging before settings-lockfile commit can run without a host', async() => {
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/settings-lockfile-diagnostic')
      }
    }), {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.settings-lockfile-commit-source.accepted-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      file: 'C:/Users/LENOVO/mods/sample_pack/package.json',
      recovery: 'retry'
    })
    const source = createThirdPartyDataPackSettingsLockfileCommitSource({
      enabled: true,
      readPackageFileStagingSource: async() => createAcceptedStagingResult({
        blockedPackageIds: [blockedPackageId],
        diagnostics: [diagnostic] as never
      })
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackSettingsLockfileCommitBlockedError)

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackSettingsLockfileCommitBlockedError)
      const result = (error as ThirdPartyDataPackSettingsLockfileCommitBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.packageFileStagingSourceStatus).toBe('accepted')
      expect(result.packageFileStagingHostStatus).toBe('accepted')
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
          stage: 'third-party.settings-lockfile-commit-source.accepted-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.settings-lockfile-commit-source.commit-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('package.json')
      expect(serialized).not.toContain('hostPath')
      expectNoRuntimeOrPersistentWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('accepts an injected path-free settings-lockfile commit host without real writes', async() => {
    const commitSettingsLockfile = vi.fn(async envelope => {
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
        writeProbeEvidence: {
          modLockWriteProbeStatus: 'written',
          transactionLogWriteProbeStatus: 'written',
          modLockPersistentWriteExecuted: true,
          transactionLogPersistentWriteExecuted: true
        }
      })
      expect('settingsWriter' in envelope).toBe(false)
      expect('lockfileWriter' in envelope).toBe(false)
      expect('lockfileDraft' in envelope).toBe(false)
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
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.settings-lockfile-commit-source.host-accepted',
            messageKey: 'mods.info.lifecycle.transaction.settingsLockfileCommitHostAccepted',
            packageId,
            recovery: 'none'
          }
        ],
        effects: commitHostEffects()
      }
    })
    const source = createThirdPartyDataPackSettingsLockfileCommitSource({
      enabled: true,
      readPackageFileStagingSource: async() => createAcceptedStagingResult(),
      commitSettingsLockfile
    })

    const result = await source()

    expect(result.status).toBe('accepted')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.packageFileStagingSourceStatus).toBe('accepted')
    expect(result.packageFileStagingHostStatus).toBe('accepted')
    expect(result.settingsLockfileCommitHostStatus).toBe('accepted')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(commitSettingsLockfile).toHaveBeenCalledOnce()
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.settings-lockfile-commit-source.host-accepted',
        packageId
      })
    ])
    expect(result.effects.injectedSettingsLockfileCommitHostCalled).toBe(true)
    expect(result.effects.settingsLockfileCommitHostCalled).toBe(true)
    expect(result.effects.settingsLockfileCommitHostAccepted).toBe(true)
    expect(result.effects.realSettingsLockfileCommitHostCalled).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    expect('packageFileStagingSource' in result).toBe(false)
    expect('settingsLockfileCommitHost' in result).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('lockfileDraft')
    expect(serialized).not.toContain('programDirectoryPath')
    expectNoRuntimeOrPersistentWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe settings-lockfile host results without exposing host paths', async() => {
    const source = createThirdPartyDataPackSettingsLockfileCommitSource({
      enabled: true,
      readPackageFileStagingSource: async() => createAcceptedStagingResult(),
      commitSettingsLockfile: async() => ({
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
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.settings-lockfile-commit-source.host-unsafe',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/userdata/mod-lock.json',
            recovery: 'retry'
          }
        ],
        effects: {
          ...commitHostEffects(),
          settingsWritten: true
        } as never
      })
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackSettingsLockfileCommitBlockedError)

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackSettingsLockfileCommitBlockedError)
      const result = (error as ThirdPartyDataPackSettingsLockfileCommitBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.settingsLockfileCommitHostStatus).toBe('accepted')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.settings-lockfile-commit-source.host-unsafe',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.settings-lockfile-commit-source.unsafe-commit-host-result',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.settings-lockfile-commit-source.commit-host-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('mod-lock.json')
      expect(serialized).not.toContain('programDirectoryPath')
      expect(result.effects.settingsLockfileCommitHostCalled).toBe(true)
      expect(result.effects.settingsLockfileCommitHostAccepted).toBe(true)
      expectNoRuntimeOrPersistentWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe skipped sources and copies package arrays without reading hostile lengths', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/settings-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackSettingsLockfileCommitSource({
      enabled: true,
      readPackageFileStagingSource: async() => createStagingResult({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        settingsWriter: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...stagingEffects(),
          settingsWritten: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackPackageFileStagingSourceResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackSettingsLockfileCommitBlockedError)
      const result = (error as ThirdPartyDataPackSettingsLockfileCommitBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.settings-lockfile-commit-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('settings-selected-package-ids')
      expect('settingsWriter' in result).toBe(false)
      expectNoRuntimeOrPersistentWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
