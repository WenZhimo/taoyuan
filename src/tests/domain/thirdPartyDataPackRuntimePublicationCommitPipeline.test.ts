import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackLiveRegistrySwapProtectionEffectSummary,
  ThirdPartyDataPackLiveRegistrySwapProtectionResult
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapProtection'
import type {
  ThirdPartyDataPackPublicationRollbackRecoveryAction,
  ThirdPartyDataPackPublicationRollbackRecoveryEffectSummary,
  ThirdPartyDataPackPublicationRollbackRecoveryResult
} from '@/domain/mods/thirdPartyDataPackPublicationRollbackRecovery'
import {
  createThirdPartyDataPackRuntimePublicationCommitPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitPipeline'
import {
  ThirdPartyDataPackRuntimePublicationCommitBlockedError,
  type ThirdPartyDataPackRuntimePublicationCommitHostEnvelope,
  type ThirdPartyDataPackRuntimePublicationCommitHostEffectSummary,
  type ThirdPartyDataPackRuntimePublicationCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitSource'
import type {
  ThirdPartyDataPackRuntimePublicationPreflightEffectSummary,
  ThirdPartyDataPackRuntimePublicationPreflightResult,
  ThirdPartyDataPackRuntimePublicationRequirement
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationPreflight'
import type {
  ThirdPartyDataPackTransactionPreCommitPlanResult,
  ThirdPartyDataPackTransactionRollbackCheckpoint,
  ThirdPartyDataPackTransactionWriteBoundary
} from '@/domain/mods/thirdPartyDataPackTransactionPreCommitPlan'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = 'sample_pack' as PackageId
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

const runtimePublicationEffects = (
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

const liveSwapEffects = (
  overrides: Partial<ThirdPartyDataPackLiveRegistrySwapProtectionEffectSummary> = {}
): ThirdPartyDataPackLiveRegistrySwapProtectionEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
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

const recoveryEffects = (
  overrides: Partial<ThirdPartyDataPackPublicationRollbackRecoveryEffectSummary> = {}
): ThirdPartyDataPackPublicationRollbackRecoveryEffectSummary => ({
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
  diagnosticsWritten: false,
  ...overrides
})

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

const recoveryActions: readonly ThirdPartyDataPackPublicationRollbackRecoveryAction[] = [
  'recovery-log-reader',
  'package-file-restore-adapter',
  'settings-lockfile-restore-adapter',
  'previous-live-registry-reference',
  'post-restore-verification',
  'redacted-recovery-diagnostics',
  'idempotent-replay'
].map(id => ({
  id: id as ThirdPartyDataPackPublicationRollbackRecoveryAction['id'],
  status: 'required',
  reason: `${id} remains required.`
}))

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
  effects: runtimePublicationEffects(),
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
  phases: [],
  writeBoundaries,
  rollbackCheckpoints,
  effects: runtimePublicationEffects(),
  ...overrides
})

const createLiveRegistrySwapProtection = (
  overrides: Partial<ThirdPartyDataPackLiveRegistrySwapProtectionResult> = {}
): ThirdPartyDataPackLiveRegistrySwapProtectionResult => ({
  status: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  transactionPreCommitPlanStatus: 'deferred',
  reason: 'live registry swap protection is inspect-only until single-assignment swap, previous registry retention and rollback diagnostics exist',
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
  liveRegistrySwap: 'deferred',
  swapAllowed: false,
  liveRegistryMutable: false,
  protectionChecks: [],
  requiredProtections: [],
  effects: liveSwapEffects(),
  ...overrides
})

const createPublicationRollbackRecovery = (
  overrides: Partial<ThirdPartyDataPackPublicationRollbackRecoveryResult> = {}
): ThirdPartyDataPackPublicationRollbackRecoveryResult => ({
  status: 'deferred',
  runtimePublicationPreflightStatus: 'deferred',
  transactionPreCommitPlanStatus: 'deferred',
  liveRegistrySwapProtectionStatus: 'deferred',
  reason: 'publication rollback recovery is inspect-only until recovery log replay, persistent restore adapters and post-restore verification exist',
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
  rollbackRecovery: 'deferred',
  recoveryAllowed: false,
  rollbackExecutionAllowed: false,
  liveRegistryMutable: false,
  recoveryChecks: [],
  recoveryStages: [],
  requiredRecoveryActions: recoveryActions,
  effects: recoveryEffects(),
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

describe('third-party runtime publication commit pipeline', () => {
  it('is disabled by default and does not read upstream reports or call the publication host', async() => {
    const readRuntimePublicationPreflight = vi.fn()
    const readTransactionPreCommitPlan = vi.fn()
    const readLiveRegistrySwapProtection = vi.fn()
    const readPublicationRollbackRecovery = vi.fn()
    const acknowledgeRuntimePublicationCommit = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitPipeline({
      readRuntimePublicationPreflight,
      readTransactionPreCommitPlan,
      readLiveRegistrySwapProtection,
      readPublicationRollbackRecovery,
      acknowledgeRuntimePublicationCommit
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
    expectNoRuntimePublicationOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('threads publication reports through a path-free runtime publication host acknowledgement', async() => {
    const readRuntimePublicationPreflight = vi.fn(async() => createRuntimePublicationPreflight())
    const readTransactionPreCommitPlan = vi.fn(async() => createTransactionPreCommitPlan())
    const readLiveRegistrySwapProtection = vi.fn(async() => createLiveRegistrySwapProtection())
    const readPublicationRollbackRecovery = vi.fn(async() => createPublicationRollbackRecovery())
    const acknowledgeRuntimePublicationCommit = vi.fn(async(
      envelope: ThirdPartyDataPackRuntimePublicationCommitHostEnvelope
    ) => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.selectedPackageIds).toEqual([packageId])
      expect(envelope.loadOrder).toEqual([packageId])
      expect(envelope.registryCount).toBe(55)
      expect(envelope.entryCount).toBe(4243)
      expect(envelope.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect(envelope.commitStageSummaries.map(stage => stage.id)).toEqual([
        'commit-adapter-inspection',
        'transaction-log-prepare',
        'package-files-commit',
        'settings-lockfile-commit',
        'live-registry-publication',
        'post-commit-verification',
        'rollback-recovery-handoff',
        'commit-diagnostics-finalization'
      ])
      expect(envelope.requiredCommitAdapterIds).toEqual([
        'atomic-runtime-publication-commit-adapter',
        'transaction-log-writer',
        'package-file-commit-adapter',
        'settings-lockfile-commit-adapter',
        'live-registry-publication-adapter',
        'post-commit-verification-adapter',
        'rollback-recovery-orchestrator'
      ])
      expect('runtimePublicationPreflight' in envelope).toBe(false)
      expect('liveRegistry' in envelope).toBe(false)
      expect('candidateRegistrySet' in envelope).toBe(false)
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
            stage: 'third-party.runtime-publication-commit-pipeline.host-accepted',
            messageKey: 'mods.info.lifecycle.transaction.runtimePublicationPipelineHostAccepted',
            packageId,
            recovery: 'none'
          }
        ],
        effects: hostEffects()
      }
    })
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitPipeline({
      enabled: true,
      readRuntimePublicationPreflight,
      readTransactionPreCommitPlan,
      readLiveRegistrySwapProtection,
      readPublicationRollbackRecovery,
      acknowledgeRuntimePublicationCommit
    })

    const result = await pipeline()

    expect(result.status).toBe('accepted')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.runtimePublicationCommitAdapterStatus).toBe('deferred')
    expect(result.runtimePublicationCommitHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.selectedPackageIds).toEqual([packageId])
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(readRuntimePublicationPreflight).toHaveBeenCalledOnce()
    expect(readTransactionPreCommitPlan).toHaveBeenCalledOnce()
    expect(readLiveRegistrySwapProtection).toHaveBeenCalledOnce()
    expect(readPublicationRollbackRecovery).toHaveBeenCalledOnce()
    expect(acknowledgeRuntimePublicationCommit).toHaveBeenCalledOnce()
    expect(result.effects.injectedRuntimePublicationCommitHostCalled).toBe(true)
    expect(result.effects.runtimePublicationCommitHostAccepted).toBe(true)
    expect('runtimePublicationPreflight' in result).toBe(false)
    expect('transactionPreCommitPlan' in result).toBe(false)
    expect('liveRegistrySwapProtection' in result).toBe(false)
    expect('publicationRollbackRecovery' in result).toBe(false)
    expect('candidateRegistrySet' in result).toBe(false)
    expectNoRuntimePublicationOrWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('blocks upstream divergence before calling the runtime publication host', async() => {
    const acknowledgeRuntimePublicationCommit = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitPipeline({
      enabled: true,
      readRuntimePublicationPreflight: async() => createRuntimePublicationPreflight(),
      readTransactionPreCommitPlan: async() => createTransactionPreCommitPlan(),
      readLiveRegistrySwapProtection: async() => createLiveRegistrySwapProtection({
        candidateIdentity: {
          ...candidateIdentity,
          candidateHash: testHash('e')
        }
      }),
      readPublicationRollbackRecovery: async() => createPublicationRollbackRecovery(),
      acknowledgeRuntimePublicationCommit
    })

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackRuntimePublicationCommitBlockedError)
      const result = (error as ThirdPartyDataPackRuntimePublicationCommitBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.commandContinuationAllowed).toBe(false)
      expect(result.runtimePublicationCommitAdapterStatus).toBe('blocked')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.runtime-publication-commit-adapter.checks'
        }),
        expect.objectContaining({
          stage: 'third-party.runtime-publication-commit-source.commit-blocked'
        })
      ]))
      expectNoRuntimePublicationOrWrites(result)
      expectJsonGraphFrozen(result)
    }

    expect(acknowledgeRuntimePublicationCommit).not.toHaveBeenCalled()
  })

  it('contains missing upstream readers as a blocked source failure', async() => {
    const pipeline = createThirdPartyDataPackRuntimePublicationCommitPipeline({
      enabled: true
    })

    try {
      await pipeline()
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
      expect(JSON.stringify(result)).not.toContain('programDirectoryPath')
      expectNoRuntimePublicationOrWrites(result)
      expectJsonGraphFrozen(result)
    }
  })
})
