import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackRecoveryLogReplayRestoreAdapterEffectSummary,
  ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult,
  ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirement,
  ThirdPartyDataPackRecoveryLogReplayRestoreStage
} from '@/domain/mods/thirdPartyDataPackRecoveryLogReplayRestoreAdapter'
import {
  createThirdPartyDataPackRecoveryLogReplayRestoreSource,
  THIRD_PARTY_DATA_PACK_RECOVERY_LOG_REPLAY_RESTORE_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_RECOVERY_LOG_REPLAY_RESTORE_SOURCE_MODE,
  ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError,
  type ThirdPartyDataPackRecoveryLogReplayRestoreHostEffectSummary,
  type ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
} from '@/domain/mods/thirdPartyDataPackRecoveryLogReplayRestoreSource'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const officialIdentity = {
  artifactHash: committedMetadata.artifactHash as Sha256Hash,
  contentHash: committedMetadata.contentHash as Sha256Hash,
  schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
  environmentHash: committedMetadata.environmentHash as Sha256Hash,
  snapshotHash: committedMetadata.snapshotHash as Sha256Hash,
  registryCount: 54,
  entryCount: 4242
}

const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
} as const

const lockfileHash = testHash('d')

const replayRestoreStages: readonly ThirdPartyDataPackRecoveryLogReplayRestoreStage[] = [
  {
    id: 'replay-restore-adapter-inspection',
    status: 'satisfied',
    adapterIds: [],
    recoveryActionIds: [],
    upstreamStageIds: ['recovery-plan-inspection'],
    reason: 'inspection ready'
  },
  {
    id: 'recovery-log-load',
    status: 'deferred',
    adapterIds: ['verified-recovery-log-reader'],
    recoveryActionIds: ['recovery-log-reader'],
    upstreamStageIds: ['failure-capture'],
    reason: 'log load remains deferred'
  },
  {
    id: 'recovery-log-replay',
    status: 'deferred',
    adapterIds: ['idempotent-recovery-log-replay', 'interrupted-recovery-resume-guard'],
    recoveryActionIds: ['recovery-log-reader', 'idempotent-replay'],
    upstreamStageIds: ['transaction-log-replay'],
    reason: 'replay remains deferred'
  }
]

const requiredReplayRestoreAdapters: readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirement[] = [
  {
    id: 'verified-recovery-log-reader',
    status: 'required',
    reason: 'required'
  },
  {
    id: 'idempotent-recovery-log-replay',
    status: 'required',
    reason: 'required'
  },
  {
    id: 'package-file-restore-adapter',
    status: 'required',
    reason: 'required'
  }
]

const adapterEffects = (
  overrides: Partial<ThirdPartyDataPackRecoveryLogReplayRestoreAdapterEffectSummary> = {}
): ThirdPartyDataPackRecoveryLogReplayRestoreAdapterEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
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
  overrides: Partial<ThirdPartyDataPackRecoveryLogReplayRestoreHostEffectSummary> = {}
): ThirdPartyDataPackRecoveryLogReplayRestoreHostEffectSummary => ({
  recoveryLogReplayRestoreHostCalled: true,
  recoveryLogReplayRestoreHostAccepted: true,
  realRecoveryLogReplayRestoreCalled: false,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
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
  overrides: Partial<ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult> = {}
): ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult => ({
  status: 'skipped',
  publicationRollbackRecoveryStatus: 'skipped',
  runtimePublicationCommitAdapterStatus: 'skipped',
  reason: 'no selected third-party data packs',
  diagnostics: [],
  selectedPackageIds: [],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [],
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  officialIdentity,
  candidateIdentity: undefined,
  lockfileHash: undefined,
  recoveryLogReplayRestore: 'deferred',
  recoveryLogReplayAllowed: false,
  persistentRestoreAllowed: false,
  writeAllowed: false,
  liveRegistryMutable: false,
  rollbackExecutionAllowed: false,
  replayRestoreChecks: [],
  replayRestoreStages: [],
  requiredReplayRestoreAdapters: [],
  effects: adapterEffects(),
  ...overrides
} as unknown as ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult)

const createDeferredAdapterResult = (
  overrides: Partial<ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult> = {}
): ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult => createAdapterResult({
  status: 'deferred',
  publicationRollbackRecoveryStatus: 'deferred',
  runtimePublicationCommitAdapterStatus: 'deferred',
  reason: 'recovery log replay and restore adapter is inspect-only until verified log reader, idempotent replay and persistent restore adapters exist',
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  replayRestoreStages,
  requiredReplayRestoreAdapters,
  effects: adapterEffects(),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRecoveryReadsRestoresOrWrites = (
  result: ThirdPartyDataPackRecoveryLogReplayRestoreSourceResult
): void => {
  expect(result.effects.realRecoveryLogReplayRestoreCalled).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.packageBackupsWritten).toBe(false)
  expect(result.effects.packageFilesRestored).toBe(false)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.lockfileRestored).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.settingsRestored).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.recoveryLogRead).toBe(false)
  expect(result.effects.recoveryLogReplayed).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
  expect(result.effects.diagnosticsWritten).toBe(false)
}

describe('third-party recovery log replay restore source', () => {
  it('is disabled by default and does not call the replay restore adapter source', async() => {
    const readRecoveryLogReplayRestoreAdapter = vi.fn()
    const source = createThirdPartyDataPackRecoveryLogReplayRestoreSource({
      readRecoveryLogReplayRestoreAdapter
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_RECOVERY_LOG_REPLAY_RESTORE_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_RECOVERY_LOG_REPLAY_RESTORE_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.appBootstrapContinuationAllowed).toBe(true)
    expect(result.commandContinuationAllowed).toBe(false)
    expect(readRecoveryLogReplayRestoreAdapter).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRecoveryReadsRestoresOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('allows app bootstrap continuation when an enabled adapter source reports skipped', async() => {
    const readRecoveryLogReplayRestoreAdapter = vi.fn(async() => createAdapterResult({
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      blockedCandidatePaths: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      candidateIdentity,
      lockfileHash,
      replayRestoreStages: [
        {
          id: 'replay-restore-adapter-inspection',
          status: 'skipped',
          adapterIds: [],
          recoveryActionIds: [],
          upstreamStageIds: [],
          reason: 'skipped'
        }
      ],
      requiredReplayRestoreAdapters
    }))
    const source = createThirdPartyDataPackRecoveryLogReplayRestoreSource({
      enabled: true,
      readRecoveryLogReplayRestoreAdapter
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readRecoveryLogReplayRestoreAdapter).toHaveBeenCalledOnce()
    expect(result.recoveryLogReplayRestoreAdapterStatus).toBe('skipped')
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.replayRestoreStageSummaries).toEqual([
      {
        id: 'replay-restore-adapter-inspection',
        status: 'skipped'
      }
    ])
    expect(result.requiredReplayRestoreAdapterIds).toEqual([
      'verified-recovery-log-reader',
      'idempotent-recovery-log-replay',
      'package-file-restore-adapter'
    ])
    expect('publicationRollbackRecovery' in result).toBe(false)
    expect('runtimePublicationCommitAdapter' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoRecoveryReadsRestoresOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('accepts an injected path-free recovery host result without replaying or restoring persistent state', async() => {
    const executeRecoveryLogReplayRestore = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope).toMatchObject({
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        lockfileHash,
        recoveryLogReplayRestore: 'deferred',
        replayRestoreStageIds: [
          'replay-restore-adapter-inspection',
          'recovery-log-load',
          'recovery-log-replay'
        ],
        requiredReplayRestoreAdapterIds: [
          'verified-recovery-log-reader',
          'idempotent-recovery-log-replay',
          'package-file-restore-adapter'
        ]
      })
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect('publicationRollbackRecovery' in envelope).toBe(false)
      expect('runtimePublicationCommitAdapter' in envelope).toBe(false)
      expect('candidateRegistrySet' in envelope).toBe(false)
      expect('programDirectoryPath' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        replayRestoreStageIds: envelope.replayRestoreStageIds,
        requiredReplayRestoreAdapterIds: envelope.requiredReplayRestoreAdapterIds,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.recovery-log-replay-restore-source.host-accepted',
            messageKey: 'mods.info.lifecycle.transaction.recoveryHostAccepted',
            packageId,
            recovery: 'none'
          }
        ],
        effects: hostEffects()
      }
    })
    const source = createThirdPartyDataPackRecoveryLogReplayRestoreSource({
      enabled: true,
      readRecoveryLogReplayRestoreAdapter: async() => createDeferredAdapterResult(),
      executeRecoveryLogReplayRestore
    })

    const result = await source()

    expect(result.status).toBe('executed')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.recoveryLogReplayRestoreAdapterStatus).toBe('deferred')
    expect(result.recoveryLogReplayRestoreHostStatus).toBe('accepted')
    expect(result.publicationRollbackRecoveryStatus).toBe('deferred')
    expect(result.runtimePublicationCommitAdapterStatus).toBe('deferred')
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(executeRecoveryLogReplayRestore).toHaveBeenCalledOnce()
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.recovery-log-replay-restore-source.host-accepted',
        packageId
      })
    ])
    expect(result.effects.recoveryLogReplayRestoreHostCalled).toBe(true)
    expect(result.effects.recoveryLogReplayRestoreHostAccepted).toBe(true)
    expect(result.effects.realRecoveryLogReplayRestoreCalled).toBe(false)
    expect(result.effects.recoveryLogRead).toBe(false)
    expect(result.effects.recoveryLogReplayed).toBe(false)
    expect(result.effects.rollbackExecuted).toBe(false)
    expect('recoveryLogEntry' in result).toBe(false)
    expect('publicationRollbackRecovery' in result).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('candidateRegistrySet')
    expect(serialized).not.toContain('programDirectoryPath')
    expectNoRecoveryReadsRestoresOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('accepts contained real-host replay and package restore evidence', async() => {
    const executeRecoveryLogReplayRestore = vi.fn(async envelope => ({
      status: 'accepted' as const,
      candidateHash: envelope.candidateIdentity.candidateHash,
      lockfileHash,
      replayRestoreStageIds: envelope.replayRestoreStageIds,
      requiredReplayRestoreAdapterIds: envelope.requiredReplayRestoreAdapterIds,
      diagnostics: [],
      effects: hostEffects({
        realRecoveryLogReplayRestoreCalled: true,
        recoveryLogRead: true,
        recoveryLogReplayed: true,
        packageFilesRestored: true,
        rollbackExecuted: true
      })
    }))
    const source = createThirdPartyDataPackRecoveryLogReplayRestoreSource({
      enabled: true,
      readRecoveryLogReplayRestoreAdapter: async() => createDeferredAdapterResult(),
      executeRecoveryLogReplayRestore
    })

    const result = await source()

    expect(result.status).toBe('executed')
    expect(result.reason).toContain('contained recovery host evidence')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.effects.recoveryLogReplayRestoreHostCalled).toBe(true)
    expect(result.effects.recoveryLogReplayRestoreHostAccepted).toBe(true)
    expect(result.effects.realRecoveryLogReplayRestoreCalled).toBe(true)
    expect(result.effects.recoveryLogRead).toBe(true)
    expect(result.effects.recoveryLogReplayed).toBe(true)
    expect(result.effects.packageFilesRestored).toBe(true)
    expect(result.effects.rollbackExecuted).toBe(true)
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.runtimePublicationCommitted).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe recovery host results without exposing host details', async() => {
    const executeRecoveryLogReplayRestore = vi.fn(async() => ({
      status: 'accepted' as const,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      replayRestoreStageIds: [
        'replay-restore-adapter-inspection',
        'recovery-log-load',
        'recovery-log-replay'
      ],
      requiredReplayRestoreAdapterIds: [
        'verified-recovery-log-reader',
        'idempotent-recovery-log-replay',
        'package-file-restore-adapter'
      ],
      programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
      diagnostics: [
        {
          code: 'LIFECYCLE-TRANSACTION-001',
          ruleId: 'LIFECYCLE-TRANSACTION-001',
          severity: 'error',
          stage: 'third-party.recovery-log-replay-restore-source.host-unsafe',
          messageKey: 'mods.error.lifecycle.transaction.001',
          packageId,
          file: 'C:/Users/LENOVO/taoyuan/userdata/recovery.log',
          recovery: 'retry'
        }
      ],
      effects: {
        ...hostEffects(),
        recoveryLogRead: true
      } as never
    } as never))
    const source = createThirdPartyDataPackRecoveryLogReplayRestoreSource({
      enabled: true,
      readRecoveryLogReplayRestoreAdapter: async() => createDeferredAdapterResult(),
      executeRecoveryLogReplayRestore
    })

    await expect(source()).rejects.toBeInstanceOf(
      ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError
    )

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError)
      const result = (error as ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.recoveryLogReplayRestoreHostStatus).toBe('accepted')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.recovery-log-replay-restore-source.host-unsafe',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.recovery-log-replay-restore-source.unsafe-recovery-host-result',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.recovery-log-replay-restore-source.recovery-host-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('recovery.log')
      expect(serialized).not.toContain('programDirectoryPath')
      expect(result.effects.recoveryLogReplayRestoreHostCalled).toBe(true)
      expect(result.effects.recoveryLogReplayRestoreHostAccepted).toBe(true)
      expectNoRecoveryReadsRestoresOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks deferred, missing and throwing adapter sources without leaking host details', async() => {
    const missingSource = createThirdPartyDataPackRecoveryLogReplayRestoreSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackRecoveryLogReplayRestoreSource({
      enabled: true,
      readRecoveryLogReplayRestoreAdapter: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/recovery-source')
      }
    })
    const deferredWithoutHost = createThirdPartyDataPackRecoveryLogReplayRestoreSource({
      enabled: true,
      readRecoveryLogReplayRestoreAdapter: async() => createDeferredAdapterResult()
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError
    )
    await expect(deferredWithoutHost()).rejects.toBeInstanceOf(
      ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError)
      const result = (error as ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.recovery-log-replay-restore-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRecoveryReadsRestoresOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe replay/restore source drift while copying hostile arrays safely', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/recovery-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackRecoveryLogReplayRestoreSource({
      enabled: true,
      readRecoveryLogReplayRestoreAdapter: async() => createDeferredAdapterResult({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        recoveryHost: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...adapterEffects(),
          packageFilesRestored: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError)
      const result = (error as ThirdPartyDataPackRecoveryLogReplayRestoreBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.recovery-log-replay-restore-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('recovery-source-selected-package-ids')
      expect('recoveryHost' in result).toBe(false)
      expectNoRecoveryReadsRestoresOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })
})
