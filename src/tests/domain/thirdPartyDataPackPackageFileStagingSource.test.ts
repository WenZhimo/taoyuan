import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary,
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import {
  createThirdPartyDataPackPackageFileStagingSource,
  THIRD_PARTY_DATA_PACK_PACKAGE_FILE_STAGING_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_PACKAGE_FILE_STAGING_SOURCE_MODE,
  ThirdPartyDataPackPackageFileStagingBlockedError,
  type ThirdPartyDataPackPackageFileStagingHostEffectSummary,
  type ThirdPartyDataPackPackageFileStagingSourceResult
} from '@/domain/mods/thirdPartyDataPackPackageFileStagingSource'

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

const preflightEffects: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary = {
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

const createPreflight = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult => ({
  status: 'skipped',
  transactionCommandDispatcherHandoffStatus: 'skipped',
  installTransactionDispatchPlanStatus: 'skipped',
  runtimePublicationCommitAdapterStatus: 'skipped',
  reason: 'no selected third-party data packs',
  requestedCommandId: undefined,
  targetPackageId: undefined,
  diagnostics: [],
  selectedPackageIds: [],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  candidateIdentity: undefined,
  lockfileHash: undefined,
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
  executorStages: [],
  executorRequirements: [],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'skipped',
    transactionLogWriteProbeStatus: 'skipped',
    modLockPersistentWriteExecuted: false,
    transactionLogPersistentWriteExecuted: false
  },
  effects: preflightEffects,
  ...overrides
} as unknown as ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult)

const createDeferredPreflight = (
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult => createPreflight({
  status: 'deferred',
  transactionCommandDispatcherHandoffStatus: 'deferred',
  installTransactionDispatchPlanStatus: 'deferred',
  runtimePublicationCommitAdapterStatus: 'deferred',
  reason: 'atomic transaction commit executor preflight is inspect-only',
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
  executorChecks: [
    {
      id: 'commit-stages-deferred',
      status: 'satisfied',
      reason: 'package file staging remains deferred'
    }
  ],
  executorStages: [
    {
      id: 'package-files-commit',
      status: 'deferred',
      requirementIds: ['staged-package-file-commit-adapter'],
      reason: 'package file staging is ready for a later explicit source boundary'
    }
  ],
  executorRequirements: [
    {
      id: 'staged-package-file-commit-adapter',
      status: 'required',
      reason: 'package files must be staged before settings and lockfile state can commit'
    }
  ],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  ...overrides
})

const hostEffects = (
  overrides: Partial<ThirdPartyDataPackPackageFileStagingHostEffectSummary> = {}
): ThirdPartyDataPackPackageFileStagingHostEffectSummary => ({
  packageFileStagingHostCalled: true,
  packageFileStagingHostAccepted: true,
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
  result: ThirdPartyDataPackPackageFileStagingSourceResult,
  continuationAllowed: boolean
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.commandContinuationAllowed).toBe(continuationAllowed)

  const {
    packageFileStagingSourceCalled: _packageFileStagingSourceCalled,
    atomicCommitPreflightSourceCalled: _atomicCommitPreflightSourceCalled,
    injectedPackageFileStagingHostCalled: _injectedPackageFileStagingHostCalled,
    packageFileStagingHostCalled: _packageFileStagingHostCalled,
    packageFileStagingHostAccepted: _packageFileStagingHostAccepted,
    realPackageFileStagingHostCalled: _realPackageFileStagingHostCalled,
    appBootstrapContinuationAllowed: _appBootstrapContinuationAllowed,
    commandContinuationAllowed: _commandContinuationAllowed,
    ...realEffects
  } = result.effects
  expect(Object.values(realEffects).every(value => value === false)).toBe(true)
}

describe('third-party package file staging source', () => {
  it('is disabled by default and does not call the atomic commit preflight source', async() => {
    const readAtomicCommitPreflight = vi.fn()
    const source = createThirdPartyDataPackPackageFileStagingSource({
      readAtomicCommitPreflight
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_PACKAGE_FILE_STAGING_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_PACKAGE_FILE_STAGING_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readAtomicCommitPreflight).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimeOrPersistentWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when an enabled source reports a skipped atomic preflight', async() => {
    const readAtomicCommitPreflight = vi.fn(async() => createPreflight({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1
    }))
    const source = createThirdPartyDataPackPackageFileStagingSource({
      enabled: true,
      readAtomicCommitPreflight
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readAtomicCommitPreflight).toHaveBeenCalledOnce()
    expect(result.atomicCommitPreflightStatus).toBe('skipped')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.blockedPackageIds).toEqual([])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect('atomicTransactionCommitExecutorPreflight' in result).toBe(false)
    expect('packageFileStagingHost' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expectNoRuntimeOrPersistentWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks deferred preflights before package file staging can run without a host', async() => {
    const diagnostic = Object.assign(Object.create({
      get hostPath() {
        throw new Error('C:/Users/LENOVO/mods/package-staging-diagnostic')
      }
    }), {
      code: 'LIFECYCLE-TRANSACTION-001',
      ruleId: 'LIFECYCLE-TRANSACTION-001',
      severity: 'error',
      stage: 'third-party.package-file-staging-source.deferred-source',
      messageKey: 'mods.error.lifecycle.transaction.001',
      packageId,
      file: 'C:/Users/LENOVO/mods/sample_pack/package.json',
      recovery: 'retry'
    })
    const source = createThirdPartyDataPackPackageFileStagingSource({
      enabled: true,
      readAtomicCommitPreflight: async() => createDeferredPreflight({
        blockedPackageIds: [blockedPackageId],
        diagnostics: [diagnostic] as never
      })
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackPackageFileStagingBlockedError)

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPackageFileStagingBlockedError)
      const result = (error as ThirdPartyDataPackPackageFileStagingBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.atomicCommitPreflightStatus).toBe('deferred')
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
          stage: 'third-party.package-file-staging-source.deferred-source',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.package-file-staging-source.staging-blocked',
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

  it('accepts an injected path-free package file staging host without running real writes', async() => {
    const stagePackageFiles = vi.fn(async envelope => {
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
        writeProbeEvidence: {
          modLockWriteProbeStatus: 'written',
          transactionLogWriteProbeStatus: 'written',
          modLockPersistentWriteExecuted: true,
          transactionLogPersistentWriteExecuted: true
        }
      })
      expect('atomicTransactionCommitExecutorPreflight' in envelope).toBe(false)
      expect('packageWriter' in envelope).toBe(false)
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
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.package-file-staging-source.host-accepted',
            messageKey: 'mods.info.lifecycle.transaction.packageFileStagingHostAccepted',
            packageId,
            recovery: 'none'
          }
        ],
        effects: hostEffects()
      }
    })
    const source = createThirdPartyDataPackPackageFileStagingSource({
      enabled: true,
      readAtomicCommitPreflight: async() => createDeferredPreflight(),
      stagePackageFiles
    })

    const result = await source()

    expect(result.status).toBe('accepted')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.atomicCommitPreflightStatus).toBe('deferred')
    expect(result.packageFileStagingHostStatus).toBe('accepted')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(stagePackageFiles).toHaveBeenCalledOnce()
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.package-file-staging-source.host-accepted',
        packageId
      })
    ])
    expect(result.effects.injectedPackageFileStagingHostCalled).toBe(true)
    expect(result.effects.packageFileStagingHostCalled).toBe(true)
    expect(result.effects.packageFileStagingHostAccepted).toBe(true)
    expect(result.effects.realPackageFileStagingHostCalled).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.packageBackupsWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect('atomicTransactionCommitExecutorPreflight' in result).toBe(false)
    expect('packageFileStagingHost' in result).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('lockfileDraft')
    expect(serialized).not.toContain('programDirectoryPath')
    expectNoRuntimeOrPersistentWrites(result, true)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe package staging host results without exposing host paths', async() => {
    const source = createThirdPartyDataPackPackageFileStagingSource({
      enabled: true,
      readAtomicCommitPreflight: async() => createDeferredPreflight(),
      stagePackageFiles: async() => ({
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
        modLockWriteProbeStatus: 'written' as const,
        transactionLogWriteProbeStatus: 'written' as const,
        modLockPersistentWriteExecuted: true,
        transactionLogPersistentWriteExecuted: true,
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/mods',
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.package-file-staging-source.host-unsafe',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/mods/sample_pack/package.json',
            recovery: 'retry'
          }
        ],
        effects: {
          ...hostEffects(),
          packageFilesWritten: true
        } as never
      })
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackPackageFileStagingBlockedError)

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPackageFileStagingBlockedError)
      const result = (error as ThirdPartyDataPackPackageFileStagingBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.packageFileStagingHostStatus).toBe('accepted')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.package-file-staging-source.host-unsafe',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.package-file-staging-source.unsafe-staging-host-result',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.package-file-staging-source.staging-host-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('package.json')
      expect(serialized).not.toContain('programDirectoryPath')
      expect(result.effects.packageFileStagingHostCalled).toBe(true)
      expect(result.effects.packageFileStagingHostAccepted).toBe(true)
      expectNoRuntimeOrPersistentWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks missing and throwing sources without exposing thrown details', async() => {
    const missingSource = createThirdPartyDataPackPackageFileStagingSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackPackageFileStagingSource({
      enabled: true,
      readAtomicCommitPreflight: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/package-staging-source')
      }
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackPackageFileStagingBlockedError
    )
    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPackageFileStagingBlockedError)
      const result = (error as ThirdPartyDataPackPackageFileStagingBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.package-file-staging-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
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
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/package-staging-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackPackageFileStagingSource({
      enabled: true,
      readAtomicCommitPreflight: async() => createPreflight({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        packageWriter: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/mods'
        },
        effects: {
          ...preflightEffects,
          packageFilesWritten: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackPackageFileStagingBlockedError)
      const result = (error as ThirdPartyDataPackPackageFileStagingBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.package-file-staging-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('package-staging-selected-package-ids')
      expect('packageWriter' in result).toBe(false)
      expectNoRuntimeOrPersistentWrites(result, false)
      expectJsonGraphFrozen(result)
    }
  })
})
