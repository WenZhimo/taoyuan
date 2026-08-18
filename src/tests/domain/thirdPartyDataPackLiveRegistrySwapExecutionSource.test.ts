import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackLiveRegistrySwapExecutionSource,
  ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError,
  type ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult,
  type ThirdPartyDataPackLiveRegistrySwapHostEffectSummary
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapExecutionSource'
import {
  buildThirdPartyDataPackLiveRegistrySwapProtection,
  type ThirdPartyDataPackLiveRegistrySwapProtectionResult
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapProtection'
import type { ThirdPartyDataPackRuntimePublicationPreflightResult } from '@/domain/mods/thirdPartyDataPackRuntimePublicationPreflight'
import type {
  ThirdPartyDataPackTransactionPreCommitPhaseSummary,
  ThirdPartyDataPackTransactionPreCommitPlanResult,
  ThirdPartyDataPackTransactionRollbackCheckpoint,
  ThirdPartyDataPackTransactionWriteBoundary
} from '@/domain/mods/thirdPartyDataPackTransactionPreCommitPlan'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = requirePackageId('discovery_valid')
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
  contentHash: testHash('1'),
  snapshotHash: testHash('2'),
  candidateHash: testHash('3')
} as const

const lockfileHash = testHash('4')

const publicationEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  candidateRegistryExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false
} as const

const liveRegistryBoundary: ThirdPartyDataPackTransactionWriteBoundary = {
  id: 'live-registry',
  status: 'deferred',
  writeAllowed: false,
  reason: 'The live registry reference cannot be swapped until package, settings and lockfile writes are verified.'
}

const liveRegistryPhase: ThirdPartyDataPackTransactionPreCommitPhaseSummary = {
  id: 'live-registry-swap',
  status: 'deferred',
  writeBoundaryIds: ['live-registry'],
  rollbackCheckpointIds: ['before-live-registry-swap'],
  reason: 'Swap the live registry only after package and persistent-state writes are verified.'
}

const liveRegistryRollbackCheckpoint: ThirdPartyDataPackTransactionRollbackCheckpoint = {
  id: 'before-live-registry-swap',
  status: 'required',
  reason: 'The live registry swap must have the previous registry identity available for rollback diagnostics.'
}

const createRuntimePublicationPreflight = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationPreflightResult> = {}
): ThirdPartyDataPackRuntimePublicationPreflightResult => ({
  status: 'deferred',
  mountInputStatus: 'ready',
  sourceAdapterGateStatus: 'deferred',
  reason: 'runtime publication handoff is inspect-only until commit adapter, live swap protection and rollback recovery exist',
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  officialIdentity,
  candidateIdentity,
  lockfileHash,
  runtimePublication: 'deferred',
  publicationAllowed: false,
  candidateRegistryFrozen: true,
  candidateSnapshotAvailable: true,
  lockfileDraftAvailable: true,
  handoffChecks: [],
  remainingRequirements: [],
  effects: publicationEffects,
  ...overrides
})

const createTransactionPreCommitPlan = (
  overrides: Partial<ThirdPartyDataPackTransactionPreCommitPlanResult> = {}
): ThirdPartyDataPackTransactionPreCommitPlanResult => ({
  status: 'deferred',
  transactionPreflightStatus: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  reason: 'transaction pre-commit plan is inspect-only until write adapters, recovery logs and rollback verification exist',
  diagnostics: [],
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  officialIdentity,
  candidateIdentity,
  lockfileHash,
  preCommitPlan: 'deferred',
  commitAllowed: false,
  writeAllowed: false,
  recoveryRequired: false,
  rollbackRequired: false,
  preCommitChecks: [],
  phases: [
    {
      id: 'pre-commit-inspection',
      status: 'satisfied',
      writeBoundaryIds: [],
      rollbackCheckpointIds: [],
      reason: 'Upstream no-write reports are consistent.'
    },
    liveRegistryPhase
  ],
  writeBoundaries: [liveRegistryBoundary],
  rollbackCheckpoints: [liveRegistryRollbackCheckpoint],
  effects: publicationEffects,
  ...overrides
})

const createProtection = (
  overrides: Partial<ThirdPartyDataPackLiveRegistrySwapProtectionResult> = {}
): ThirdPartyDataPackLiveRegistrySwapProtectionResult => ({
  ...buildThirdPartyDataPackLiveRegistrySwapProtection({
    runtimePublicationPreflight: createRuntimePublicationPreflight(),
    transactionPreCommitPlan: createTransactionPreCommitPlan()
  } as never),
  ...overrides
})

const hostEffects = (
  overrides: Partial<ThirdPartyDataPackLiveRegistrySwapHostEffectSummary> = {}
): ThirdPartyDataPackLiveRegistrySwapHostEffectSummary => ({
  liveRegistrySwapHostCalled: true,
  liveRegistrySwapHostAccepted: true,
  thirdPartyRegistryPublished: true,
  liveRegistryMutated: true,
  liveRegistrySwapped: true,
  runtimeEnablementAllowed: true,
  officialRegistryPublished: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
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

const expectNoPersistentWrites = (result: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult): void => {
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

describe('third-party live registry swap execution source', () => {
  it('is disabled by default and does not read protection or call the host', async() => {
    const readLiveRegistrySwapProtection = vi.fn()
    const executeLiveRegistrySwap = vi.fn()
    const source = createThirdPartyDataPackLiveRegistrySwapExecutionSource({
      readLiveRegistrySwapProtection,
      executeLiveRegistrySwap
    })

    const result = await source()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(readLiveRegistrySwapProtection).not.toHaveBeenCalled()
    expect(executeLiveRegistrySwap).not.toHaveBeenCalled()
    expect(result.effects.liveRegistrySwapped).toBe(false)
    expect(result.effects.runtimeEnablementAllowed).toBe(false)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('executes an injected runtime-only live registry swap without persistent writes', async() => {
    const executeLiveRegistrySwap = vi.fn(async envelope => {
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
        officialIdentity,
        candidateIdentity,
        lockfileHash,
        liveRegistrySwap: 'deferred',
        requiredProtectionIds: [
          'single-assignment-live-registry-reference',
          'previous-registry-identity-retention',
          'candidate-artifact-visibility-barrier',
          'post-swap-verification',
          'rollback-restore-diagnostics'
        ]
      })
      expect('liveRegistry' in envelope).toBe(false)
      expect('candidateRegistrySet' in envelope).toBe(false)
      expect('programDirectoryPath' in envelope).toBe(false)
      return {
        status: 'swapped' as const,
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
        protectionStatus: 'deferred' as const,
        requiredProtectionIds: envelope.requiredProtectionIds,
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'info',
            stage: 'third-party.live-registry-swap-execution-source.host-swapped',
            messageKey: 'mods.info.lifecycle.transaction.liveRegistrySwapHostAccepted',
            packageId,
            recovery: 'none'
          }
        ],
        effects: hostEffects()
      }
    })
    const source = createThirdPartyDataPackLiveRegistrySwapExecutionSource({
      enabled: true,
      readLiveRegistrySwapProtection: async() => createProtection(),
      executeLiveRegistrySwap
    })

    const result = await source()

    expect(result.status).toBe('swapped')
    expect(result.runtimeOnly).toBe(true)
    expect(result.persistentWrite).toBe(false)
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.liveRegistrySwapProtectionStatus).toBe('deferred')
    expect(result.liveRegistrySwapHostStatus).toBe('swapped')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.requiredProtectionIds).toEqual([
      'single-assignment-live-registry-reference',
      'previous-registry-identity-retention',
      'candidate-artifact-visibility-barrier',
      'post-swap-verification',
      'rollback-restore-diagnostics'
    ])
    expect(executeLiveRegistrySwap).toHaveBeenCalledOnce()
    expect(result.effects.injectedLiveRegistrySwapHostCalled).toBe(true)
    expect(result.effects.liveRegistrySwapHostAccepted).toBe(true)
    expect(result.effects.thirdPartyRegistryPublished).toBe(true)
    expect(result.effects.liveRegistryMutated).toBe(true)
    expect(result.effects.liveRegistrySwapped).toBe(true)
    expect(result.effects.runtimeEnablementAllowed).toBe(true)
    expect(result.effects.officialRegistryPublished).toBe(false)
    expect(result.effects.candidateRegistryExposed).toBe(false)
    expect('liveRegistry' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('lockfileDraft')
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe host swaps without leaking host paths', async() => {
    const source = createThirdPartyDataPackLiveRegistrySwapExecutionSource({
      enabled: true,
      readLiveRegistrySwapProtection: async() => createProtection(),
      executeLiveRegistrySwap: async() => ({
        status: 'swapped' as const,
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
        protectionStatus: 'deferred' as const,
        requiredProtectionIds: [
          'single-assignment-live-registry-reference',
          'previous-registry-identity-retention',
          'candidate-artifact-visibility-barrier',
          'post-swap-verification',
          'rollback-restore-diagnostics'
        ],
        programDirectoryPath: 'C:/Users/LENOVO/taoyuan/userdata',
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.live-registry-swap-execution-source.host-unsafe',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/taoyuan/userdata/live-registry.json',
            recovery: 'retry'
          }
        ],
        effects: hostEffects({
          settingsWritten: true
        } as never)
      } as never)
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError)

    try {
      await source()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError)
      const result = (error as ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.liveRegistrySwapHostStatus).toBe('swapped')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.live-registry-swap-execution-source.host-unsafe',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.live-registry-swap-execution-source.unsafe-host-result',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.live-registry-swap-execution-source.swap-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('live-registry.json')
      expect(serialized).not.toContain('programDirectoryPath')
      expect(result.effects.liveRegistrySwapHostCalled).toBe(true)
      expect(result.effects.liveRegistrySwapped).toBe(true)
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    }
  })

  it('blocks missing, throwing and unsafe protection sources', async() => {
    const missingSource = createThirdPartyDataPackLiveRegistrySwapExecutionSource({
      enabled: true
    })
    const throwingSource = createThirdPartyDataPackLiveRegistrySwapExecutionSource({
      enabled: true,
      readLiveRegistrySwapProtection: async() => {
        throw new Error('EACCES: C:/Users/LENOVO/mods/live-registry-swap-source')
      }
    })
    const deferredWithoutHost = createThirdPartyDataPackLiveRegistrySwapExecutionSource({
      enabled: true,
      readLiveRegistrySwapProtection: async() => createProtection()
    })
    const unsafeSource = createThirdPartyDataPackLiveRegistrySwapExecutionSource({
      enabled: true,
      readLiveRegistrySwapProtection: async() => createProtection({
        liveRegistry: { current: 'unsafe' },
        effects: {
          officialRegistryPublished: false,
          thirdPartyRegistryPublished: false,
          liveRegistryMutated: true,
          liveRegistrySwapped: false,
          previousRegistryReleased: false,
          candidateRegistryExposed: false,
          packageFilesWritten: false,
          packageBackupsWritten: false,
          lockfileWritten: false,
          settingsWritten: false,
          savesWritten: false,
          cacheWritten: false,
          transactionLogWritten: false
        }
      } as never)
    })

    await expect(missingSource()).rejects.toBeInstanceOf(ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError)
    await expect(deferredWithoutHost()).rejects.toBeInstanceOf(ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError)
    await expect(unsafeSource()).rejects.toBeInstanceOf(ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError)

    try {
      await throwingSource()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError)
      const result = (error as ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.live-registry-swap-execution-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect((error as Error).message).not.toContain('C:/Users')
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    }
  })
})
