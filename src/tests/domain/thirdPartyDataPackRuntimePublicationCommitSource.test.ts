import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackRuntimePublicationCommitSource,
  THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_SOURCE_KIND,
  THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_SOURCE_MODE,
  ThirdPartyDataPackRuntimePublicationCommitBlockedError,
  type ThirdPartyDataPackRuntimePublicationCommitHostEffectSummary,
  type ThirdPartyDataPackRuntimePublicationCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitSource'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitAdapter'
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

const effects = () => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
} as const)

const hostEffects = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitHostEffectSummary> = {}
): ThirdPartyDataPackRuntimePublicationCommitHostEffectSummary => ({
  runtimePublicationCommitHostCalled: true,
  runtimePublicationCommitHostAccepted: true,
  realRuntimePublicationCommitCalled: false,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
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

const createCommitAdapterResult = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAdapterResult> = {}
): ThirdPartyDataPackRuntimePublicationCommitAdapterResult => ({
  status: 'skipped',
  runtimePublicationPreflightStatus: 'skipped',
  transactionPreCommitPlanStatus: 'skipped',
  liveRegistrySwapProtectionStatus: 'skipped',
  publicationRollbackRecoveryStatus: 'skipped',
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
  runtimePublicationCommit: 'deferred',
  commitAllowed: false,
  publicationAllowed: false,
  writeAllowed: false,
  liveRegistryMutable: false,
  rollbackExecutionAllowed: false,
  commitChecks: [],
  commitStages: [],
  requiredCommitAdapters: [],
  effects: effects(),
  ...overrides
} as unknown as ThirdPartyDataPackRuntimePublicationCommitAdapterResult)

const createDeferredCommitAdapterResult = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationCommitAdapterResult> = {}
): ThirdPartyDataPackRuntimePublicationCommitAdapterResult => createCommitAdapterResult({
  status: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  transactionPreCommitPlanStatus: 'deferred',
  liveRegistrySwapProtectionStatus: 'deferred',
  publicationRollbackRecoveryStatus: 'deferred',
  reason: 'runtime publication commit adapter is inspect-only until atomic commit adapter, persistent writers and post-commit verification exist',
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  lockfileHash,
  commitStages: [
    {
      id: 'commit-adapter-inspection',
      status: 'satisfied',
      adapterIds: [],
      writeBoundaryIds: [],
      rollbackCheckpointIds: [],
      reason: 'safe to inspect'
    },
    {
      id: 'live-registry-publication',
      status: 'deferred',
      adapterIds: ['live-registry-publication-adapter'],
      writeBoundaryIds: ['live-registry'],
      rollbackCheckpointIds: ['before-live-registry-swap'],
      reason: 'publication remains deferred'
    }
  ],
  requiredCommitAdapters: [
    {
      id: 'atomic-runtime-publication-commit-adapter',
      status: 'required',
      reason: 'required'
    },
    {
      id: 'live-registry-publication-adapter',
      status: 'required',
      reason: 'required'
    }
  ],
  effects: effects(),
  ...overrides
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectNoRuntimePublicationOrWrites = (
  result: ThirdPartyDataPackRuntimePublicationCommitSourceResult
): void => {
  expect(result.effects.realRuntimePublicationCommitCalled).toBe(false)
  expect(result.effects.officialRegistryPublished).toBe(false)
  expect(result.effects.thirdPartyRegistryPublished).toBe(false)
  expect(result.effects.liveRegistryMutated).toBe(false)
  expect(result.effects.liveRegistrySwapped).toBe(false)
  expect(result.effects.commandDispatched).toBe(false)
  expect(result.effects.transactionCommitted).toBe(false)
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

describe('third-party runtime publication commit source', () => {
  it('is disabled by default and does not call the commit adapter source', async() => {
    const readRuntimePublicationCommitAdapter = vi.fn()
    const source = createThirdPartyDataPackRuntimePublicationCommitSource({
      readRuntimePublicationCommitAdapter
    })

    const result = await source()

    expect(result.kind).toBe(THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_SOURCE_KIND)
    expect(result.mode).toBe(THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_SOURCE_MODE)
    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.appBootstrapContinuationAllowed).toBe(true)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(readRuntimePublicationCommitAdapter).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectNoRuntimePublicationOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('allows continuation when an enabled commit adapter source reports skipped', async() => {
    const readRuntimePublicationCommitAdapter = vi.fn(async() => createCommitAdapterResult({
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      blockedCandidatePaths: [],
      loadOrder: [packageId],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      candidateIdentity,
      lockfileHash,
      commitStages: [
        {
          id: 'commit-adapter-inspection',
          status: 'skipped',
          adapterIds: [],
          writeBoundaryIds: [],
          rollbackCheckpointIds: [],
          reason: 'skipped'
        }
      ],
      requiredCommitAdapters: [
        {
          id: 'atomic-runtime-publication-commit-adapter',
          status: 'required',
          reason: 'required'
        }
      ]
    }))
    const source = createThirdPartyDataPackRuntimePublicationCommitSource({
      enabled: true,
      readRuntimePublicationCommitAdapter
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(true)
    expect(result.sourceCalled).toBe(true)
    expect(readRuntimePublicationCommitAdapter).toHaveBeenCalledOnce()
    expect(result.runtimePublicationCommitAdapterStatus).toBe('skipped')
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.loadOrder).toEqual([packageId])
    expect(result.registryCount).toBe(55)
    expect(result.entryCount).toBe(4243)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.commitStageSummaries).toEqual([
      {
        id: 'commit-adapter-inspection',
        status: 'skipped'
      }
    ])
    expect(result.requiredCommitAdapterIds).toEqual(['atomic-runtime-publication-commit-adapter'])
    expect('runtimePublicationPreflight' in result).toBe(false)
    expect('transactionPreCommitPlan' in result).toBe(false)
    expect('liveRegistrySwapProtection' in result).toBe(false)
    expect('publicationRollbackRecovery' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expect('lockfileDraft' in result).toBe(false)
    expectNoRuntimePublicationOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks deferred, missing and throwing adapter sources without leaking host details', async() => {
    const missingSource = createThirdPartyDataPackRuntimePublicationCommitSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackRuntimePublicationCommitSource({
      enabled: true,
      readRuntimePublicationCommitAdapter: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/runtime-publication-source')
      }
    })
    const deferredSource = createThirdPartyDataPackRuntimePublicationCommitSource({
      enabled: true,
      readRuntimePublicationCommitAdapter: async() => createDeferredCommitAdapterResult({
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.runtime-publication-commit-source.deferred-source',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/mods/sample_pack/runtime-publication.json',
            recovery: 'retry'
          }
        ] as never
      })
    })

    await expect(missingSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackRuntimePublicationCommitBlockedError
    )
    await expect(deferredSource()).rejects.toBeInstanceOf(
      ThirdPartyDataPackRuntimePublicationCommitBlockedError
    )

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackRuntimePublicationCommitBlockedError)
      const result = (error as ThirdPartyDataPackRuntimePublicationCommitBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.runtime-publication-commit-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoRuntimePublicationOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('accepts an injected path-free runtime publication host acknowledgement without publishing registries', async() => {
    const acknowledgeRuntimePublicationCommit = vi.fn(async envelope => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope).toMatchObject({
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
        commitStageSummaries: [
          {
            id: 'commit-adapter-inspection',
            status: 'satisfied'
          },
          {
            id: 'live-registry-publication',
            status: 'deferred'
          }
        ],
        requiredCommitAdapterIds: [
          'atomic-runtime-publication-commit-adapter',
          'live-registry-publication-adapter'
        ]
      })
      expect('candidateRegistrySet' in envelope).toBe(false)
      expect('liveRegistry' in envelope).toBe(false)
      expect('lockfileDraft' in envelope).toBe(false)
      expect('programDirectoryPath' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        blockedCandidatePaths: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        runtimePublicationCommitAdapterStatus: 'deferred' as const,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.runtime-publication-commit-source.host-accepted',
            messageKey: 'mods.info.lifecycle.transaction.runtimePublicationHostAccepted',
            packageId,
            recovery: 'none'
          }
        ],
        effects: hostEffects()
      }
    })
    const source = createThirdPartyDataPackRuntimePublicationCommitSource({
      enabled: true,
      readRuntimePublicationCommitAdapter: async() => createDeferredCommitAdapterResult(),
      acknowledgeRuntimePublicationCommit
    })

    const result = await source()

    expect(result.status).toBe('accepted')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.runtimePublicationCommitAdapterStatus).toBe('deferred')
    expect(result.runtimePublicationCommitHostStatus).toBe('accepted')
    expect(result.injectedRuntimePublicationHostMode).toBe('injected-test-only')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.requiredCommitAdapterIds).toEqual([
      'atomic-runtime-publication-commit-adapter',
      'live-registry-publication-adapter'
    ])
    expect(acknowledgeRuntimePublicationCommit).toHaveBeenCalledOnce()
    expect(result.effects.injectedRuntimePublicationCommitHostCalled).toBe(true)
    expect(result.effects.runtimePublicationCommitHostCalled).toBe(true)
    expect(result.effects.runtimePublicationCommitHostAccepted).toBe(true)
    expect(result.effects.realRuntimePublicationCommitCalled).toBe(false)
    expect(result.effects.liveRegistrySwapped).toBe(false)
    expect('runtimePublicationCommitAdapter' in result).toBe(false)
    expect('runtimePublicationCommitHost' in result).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('candidateRegistrySet')
    expect(serialized).not.toContain('lockfileDraft')
    expect(serialized).not.toContain('programDirectoryPath')
    expectNoRuntimePublicationOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe runtime publication host acknowledgements without exposing host paths', async() => {
    const source = createThirdPartyDataPackRuntimePublicationCommitSource({
      enabled: true,
      readRuntimePublicationCommitAdapter: async() => createDeferredCommitAdapterResult(),
      acknowledgeRuntimePublicationCommit: async() => ({
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        blockedCandidatePaths: [],
        loadOrder: [packageId],
        registryCount: 55,
        entryCount: 4243,
        packageCount: 1,
        candidateHash: candidateIdentity.candidateHash,
        lockfileHash,
        runtimePublicationCommitAdapterStatus: 'deferred' as const,
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.runtime-publication-commit-source.host-unsafe',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/userdata/runtime-publication.json',
            recovery: 'retry'
          }
        ],
        effects: {
          ...hostEffects(),
          liveRegistrySwapped: true
        } as never
      } as never)
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackRuntimePublicationCommitBlockedError)

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackRuntimePublicationCommitBlockedError)
      const result = (error as ThirdPartyDataPackRuntimePublicationCommitBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.runtimePublicationCommitHostStatus).toBe('accepted')
      expect(result.effects.runtimePublicationCommitHostCalled).toBe(true)
      expect(result.effects.runtimePublicationCommitHostAccepted).toBe(true)
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.runtime-publication-commit-source.host-unsafe',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.runtime-publication-commit-source.unsafe-host-result',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('runtime-publication.json')
      expect(serialized).not.toContain('programDirectoryPath')
      expectNoRuntimePublicationOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks unsafe live-registry or write-effect drift while copying hostile arrays safely', async() => {
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/runtime-publication-source-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const source = createThirdPartyDataPackRuntimePublicationCommitSource({
      enabled: true,
      readRuntimePublicationCommitAdapter: async() => createCommitAdapterResult({
        selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
        blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
        blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
        loadOrder: createHostileArray([packageId], 'load-order'),
        runtimePublicationCommitHost: {
          programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata'
        },
        effects: {
          ...effects(),
          liveRegistryMutated: true
        } as never
      } as unknown as Partial<ThirdPartyDataPackRuntimePublicationCommitAdapterResult>)
    })

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackRuntimePublicationCommitBlockedError)
      const result = (error as ThirdPartyDataPackRuntimePublicationCommitBlockedError).result
      expect(result.status).toBe('blocked')
      expect(lengthRead).toBe(false)
      expect(result.selectedPackageIds).toEqual([packageId])
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
      expect(result.loadOrder).toEqual([packageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.runtime-publication-commit-source.unsafe-source'
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('runtime-publication-source-selected-package-ids')
      expect('runtimePublicationCommitHost' in result).toBe(false)
      expectNoRuntimePublicationOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })
})
