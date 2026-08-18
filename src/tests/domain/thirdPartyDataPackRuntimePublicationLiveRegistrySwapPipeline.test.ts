import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId } from '@/domain/mods/ids'
import {
  buildThirdPartyDataPackLiveRegistrySwapProtection
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapProtection'
import {
  type ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult,
  ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError,
  type ThirdPartyDataPackLiveRegistrySwapHostEffectSummary
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapExecutionSource'
import {
  buildThirdPartyDataPackPublicationRollbackRecovery,
  type ThirdPartyDataPackPublicationRollbackRecoveryResult
} from '@/domain/mods/thirdPartyDataPackPublicationRollbackRecovery'
import {
  createThirdPartyDataPackRuntimePublicationLiveRegistrySwapPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationLiveRegistrySwapPipeline'
import {
  type ThirdPartyDataPackRuntimePublicationCommitHostEffectSummary,
  type ThirdPartyDataPackRuntimePublicationCommitHostEnvelope
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitSource'
import type {
  ThirdPartyDataPackRuntimePublicationPreflightEffectSummary,
  ThirdPartyDataPackRuntimePublicationPreflightResult,
  ThirdPartyDataPackRuntimePublicationRequirement
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationPreflight'
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
  contentHash: testHash('5'),
  snapshotHash: testHash('6'),
  candidateHash: testHash('7')
} as const

const lockfileHash = testHash('8')

const publicationEffects = (
  overrides: Partial<ThirdPartyDataPackRuntimePublicationPreflightEffectSummary> = {}
): ThirdPartyDataPackRuntimePublicationPreflightEffectSummary => ({
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
  transactionLogWritten: false,
  ...overrides
})

const runtimePublicationRequirements: readonly ThirdPartyDataPackRuntimePublicationRequirement[] = [
  {
    id: 'runtime-publication-commit-adapter',
    status: 'required',
    reason: 'Define the final atomic commit adapter before replacing the live GameApp registry reference.'
  },
  {
    id: 'live-registry-swap-protection',
    status: 'required',
    reason: 'Define single-assignment live registry swap protection.'
  },
  {
    id: 'publication-failure-rollback',
    status: 'required',
    reason: 'Define rollback diagnostics and recovery before failed publication can affect startup or saves.'
  }
]

const writeBoundaries: readonly ThirdPartyDataPackTransactionWriteBoundary[] = [
  'transaction-log',
  'package-files',
  'package-backups',
  'installation-settings',
  'mod-lockfile',
  'live-registry',
  'player-saves',
  'official-cache'
].map(id => ({
  id: id as ThirdPartyDataPackTransactionWriteBoundary['id'],
  status: 'deferred',
  writeAllowed: false,
  reason: `${id} writes remain deferred.`
}))

const rollbackCheckpoints: readonly ThirdPartyDataPackTransactionRollbackCheckpoint[] = [
  'before-transaction-log-write',
  'before-package-files-write',
  'before-settings-lockfile-write',
  'before-live-registry-swap',
  'after-failure-restore-verification'
].map(id => ({
  id: id as ThirdPartyDataPackTransactionRollbackCheckpoint['id'],
  status: 'required',
  reason: `${id} remains required.`
}))

const preCommitInspectionPhase: ThirdPartyDataPackTransactionPreCommitPhaseSummary = {
  id: 'pre-commit-inspection',
  status: 'satisfied',
  writeBoundaryIds: [],
  rollbackCheckpointIds: [],
  reason: 'Upstream no-write reports are consistent.'
}

const liveRegistryPhase: ThirdPartyDataPackTransactionPreCommitPhaseSummary = {
  id: 'live-registry-swap',
  status: 'deferred',
  writeBoundaryIds: ['live-registry'],
  rollbackCheckpointIds: ['before-live-registry-swap'],
  reason: 'The live registry swap remains deferred until runtime publication is acknowledged.'
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
  remainingRequirements: runtimePublicationRequirements,
  effects: publicationEffects(),
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
  phases: [preCommitInspectionPhase, liveRegistryPhase],
  writeBoundaries,
  rollbackCheckpoints,
  effects: publicationEffects(),
  ...overrides
})

const createReportBundle = (
  overrides: {
    readonly runtime?: Partial<ThirdPartyDataPackRuntimePublicationPreflightResult>
    readonly plan?: Partial<ThirdPartyDataPackTransactionPreCommitPlanResult>
    readonly recovery?: Partial<ThirdPartyDataPackPublicationRollbackRecoveryResult>
  } = {}
) => {
  const runtimePublicationPreflight = createRuntimePublicationPreflight(overrides.runtime)
  const transactionPreCommitPlan = createTransactionPreCommitPlan(overrides.plan)
  const liveRegistrySwapProtection = buildThirdPartyDataPackLiveRegistrySwapProtection({
    runtimePublicationPreflight,
    transactionPreCommitPlan
  } as never)
  const publicationRollbackRecovery = {
    ...buildThirdPartyDataPackPublicationRollbackRecovery({
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      liveRegistrySwapProtection
    } as never),
    ...overrides.recovery
  } as ThirdPartyDataPackPublicationRollbackRecoveryResult
  return {
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection,
    publicationRollbackRecovery
  }
}

const runtimeHostEffects = (
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

const liveSwapHostEffects = (
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

const expectNoPersistentWrites = (
  result: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
): void => {
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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

describe('third-party runtime publication live registry swap pipeline', () => {
  it('is disabled by default and does not read upstream reports or call hosts', async() => {
    const bundle = createReportBundle()
    const readRuntimePublicationPreflight = vi.fn(async() => bundle.runtimePublicationPreflight)
    const readTransactionPreCommitPlan = vi.fn(async() => bundle.transactionPreCommitPlan)
    const readLiveRegistrySwapProtection = vi.fn(async() => bundle.liveRegistrySwapProtection)
    const readPublicationRollbackRecovery = vi.fn(async() => bundle.publicationRollbackRecovery)
    const acknowledgeRuntimePublicationCommit = vi.fn()
    const executeLiveRegistrySwap = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationLiveRegistrySwapPipeline({
      readRuntimePublicationPreflight,
      readTransactionPreCommitPlan,
      readLiveRegistrySwapProtection,
      readPublicationRollbackRecovery,
      acknowledgeRuntimePublicationCommit,
      executeLiveRegistrySwap
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readRuntimePublicationPreflight).not.toHaveBeenCalled()
    expect(readTransactionPreCommitPlan).not.toHaveBeenCalled()
    expect(readLiveRegistrySwapProtection).not.toHaveBeenCalled()
    expect(readPublicationRollbackRecovery).not.toHaveBeenCalled()
    expect(acknowledgeRuntimePublicationCommit).not.toHaveBeenCalled()
    expect(executeLiveRegistrySwap).not.toHaveBeenCalled()
    expect(result.effects.liveRegistrySwapped).toBe(false)
    expect(result.effects.runtimeEnablementAllowed).toBe(false)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('threads runtime publication acknowledgement before the live registry swap host', async() => {
    const calls: string[] = []
    const bundle = createReportBundle()
    const acknowledgeRuntimePublicationCommit = vi.fn(async(
      envelope: ThirdPartyDataPackRuntimePublicationCommitHostEnvelope
    ) => {
      calls.push('runtime-publication-host')
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.selectedPackageIds).toEqual([packageId])
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect('runtimePublicationPreflight' in envelope).toBe(false)
      expect('liveRegistry' in envelope).toBe(false)
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
        effects: runtimeHostEffects()
      }
    })
    const executeLiveRegistrySwap = vi.fn(async envelope => {
      calls.push('live-registry-swap-host')
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.officialIdentity).toEqual(officialIdentity)
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.requiredProtectionIds).toEqual([
        'single-assignment-live-registry-reference',
        'previous-registry-identity-retention',
        'candidate-artifact-visibility-barrier',
        'post-swap-verification',
        'rollback-restore-diagnostics'
      ])
      expect('runtimePublicationCommitAdapter' in envelope).toBe(false)
      expect('liveRegistry' in envelope).toBe(false)
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
        effects: liveSwapHostEffects()
      }
    })
    const pipeline = createThirdPartyDataPackRuntimePublicationLiveRegistrySwapPipeline({
      enabled: true,
      readRuntimePublicationPreflight: async() => bundle.runtimePublicationPreflight,
      readTransactionPreCommitPlan: async() => bundle.transactionPreCommitPlan,
      readLiveRegistrySwapProtection: async() => bundle.liveRegistrySwapProtection,
      readPublicationRollbackRecovery: async() => bundle.publicationRollbackRecovery,
      acknowledgeRuntimePublicationCommit,
      executeLiveRegistrySwap
    })

    const result = await pipeline()

    expect(result.status).toBe('swapped')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.liveRegistrySwapProtectionStatus).toBe('deferred')
    expect(result.liveRegistrySwapHostStatus).toBe('swapped')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(calls).toEqual([
      'runtime-publication-host',
      'live-registry-swap-host'
    ])
    expect(acknowledgeRuntimePublicationCommit).toHaveBeenCalledOnce()
    expect(executeLiveRegistrySwap).toHaveBeenCalledOnce()
    expect(result.effects.injectedLiveRegistrySwapHostCalled).toBe(true)
    expect(result.effects.liveRegistrySwapped).toBe(true)
    expect(result.effects.runtimeEnablementAllowed).toBe(true)
    expect(result.effects.officialRegistryPublished).toBe(false)
    expect(result.effects.candidateRegistryExposed).toBe(false)
    expect('runtimePublicationCommitAdapter' in result).toBe(false)
    expect('runtimePublicationPreflight' in result).toBe(false)
    expect('liveRegistry' in result).toBe(false)
    expect('programDirectoryPath' in result).toBe(false)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks runtime publication divergence before the live registry swap host', async() => {
    const acknowledgeRuntimePublicationCommit = vi.fn()
    const executeLiveRegistrySwap = vi.fn()
    const divergentRecovery = {
      candidateIdentity: {
        ...candidateIdentity,
        candidateHash: testHash('9')
      }
    } as Partial<ThirdPartyDataPackPublicationRollbackRecoveryResult>
    const bundle = createReportBundle({
      recovery: divergentRecovery
    })
    const pipeline = createThirdPartyDataPackRuntimePublicationLiveRegistrySwapPipeline({
      enabled: true,
      readRuntimePublicationPreflight: async() => bundle.runtimePublicationPreflight,
      readTransactionPreCommitPlan: async() => bundle.transactionPreCommitPlan,
      readLiveRegistrySwapProtection: async() => bundle.liveRegistrySwapProtection,
      readPublicationRollbackRecovery: async() => bundle.publicationRollbackRecovery,
      acknowledgeRuntimePublicationCommit,
      executeLiveRegistrySwap
    })

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError)
      const result = (error as ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.sourceCalled).toBe(true)
      expect(result.commandContinuationAllowed).toBe(false)
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          stage: 'third-party.live-registry-swap-execution-source.source-failed'
        })
      ])
      expect(JSON.stringify(result)).not.toContain('programDirectoryPath')
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expectNoPersistentWrites(result)
      expectJsonGraphFrozen(result)
    }

    expect(acknowledgeRuntimePublicationCommit).not.toHaveBeenCalled()
    expect(executeLiveRegistrySwap).not.toHaveBeenCalled()
  })
})
