import { describe, expect, it, vi } from 'vitest'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import { createOfficialContentHash } from '@/domain/mods/officialPrecompiled'
import {
  createSerializableRegistrySnapshot,
  RegistrySet,
  type RegistryDefinition,
  type RegistryEntry
} from '@/domain/mods/registry'
import {
  requirePackageId,
  toOfficialContentId,
  toOfficialRegistryTypeId,
  type PackageId
} from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  type ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult,
  ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapExecutionSource'
import {
  buildThirdPartyDataPackLiveRegistrySwapProtection
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapProtection'
import {
  createThirdPartyDataPackInMemoryLiveRegistryReference,
  createThirdPartyDataPackLiveRegistrySwapHost
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapHost'
import {
  buildThirdPartyDataPackPublicationRollbackRecovery,
  type ThirdPartyDataPackPublicationRollbackRecoveryResult
} from '@/domain/mods/thirdPartyDataPackPublicationRollbackRecovery'
import {
  type ThirdPartyDataPackRuntimePublicationCommitHostEffectSummary,
  type ThirdPartyDataPackRuntimePublicationCommitHostEnvelope
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationCommitSource'
import {
  createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline'
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

const registryId = toOfficialRegistryTypeId('runtime_live_registry_host_connection_test')
const officialPackageId = requirePackageId('taoyuan-core')
const packageId = requirePackageId('sample_pack')
const lockfileHash = `sha256:${'d'.repeat(64)}` as Sha256Hash

const definition: RegistryDefinition<RegistryEntry> = {
  registryId,
  description: 'runtime publication live registry host connection test',
  schemaName: 'runtime-live-registry-host-connection-test.schema.json'
}

const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const buildRegistrySet = (
  entries: readonly {
    readonly owner: PackageId
    readonly localId: string
    readonly label: string
  }[]
): RegistrySet => {
  const set = new RegistrySet()
  const registry = set.defineRegistry(definition)
  set.freezeDefinitions()
  for (const entry of entries) {
    const registryEntry: RegistryEntry & { label: string } = {
      id: toOfficialContentId(`runtime-live-registry/${entry.localId}`),
      label: entry.label
    }
    registry.register(entry.owner, registryEntry, {
      file: `content/${entry.localId}.json`,
      localId: entry.localId
    })
  }
  set.freezeEntries()
  return set
}

const summarizeRegistrySet = (registrySet: RegistrySet) => {
  const snapshot = createSerializableRegistrySnapshot(registrySet)
  return {
    registryCount: snapshot.registries.length,
    entryCount: snapshot.registries.reduce((total, registry) => total + registry.entries.length, 0),
    contentHash: createOfficialContentHash(snapshot),
    snapshotHash: snapshot.snapshotHash as Sha256Hash
  }
}

const createOfficialIdentity = (
  registrySet: RegistrySet
): ThirdPartyCandidateOfficialIdentitySummary => {
  const summary = summarizeRegistrySet(registrySet)
  return {
    artifactHash: testHash('a'),
    contentHash: summary.contentHash,
    schemaSetHash: testHash('b'),
    environmentHash: testHash('c'),
    snapshotHash: summary.snapshotHash,
    registryCount: summary.registryCount,
    entryCount: summary.entryCount
  }
}

const createCandidateIdentity = (
  registrySet: RegistrySet,
  officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateIdentitySummary => {
  const summary = summarizeRegistrySet(registrySet)
  return {
    formatVersion: 1,
    contentHash: summary.contentHash,
    snapshotHash: summary.snapshotHash,
    candidateHash: hashCanonicalJson({
      formatVersion: 1,
      officialIdentity,
      selectedPackages: [{
        packageId,
        version: '1.0.0'
      }],
      loadOrder: [packageId],
      contentHash: summary.contentHash,
      snapshotHash: summary.snapshotHash
    })
  }
}

const createHarness = () => {
  const previousRegistrySet = buildRegistrySet([
    {
      owner: officialPackageId,
      localId: 'official_seed',
      label: 'Official seed'
    }
  ])
  const candidateRegistrySet = buildRegistrySet([
    {
      owner: officialPackageId,
      localId: 'official_seed',
      label: 'Official seed'
    },
    {
      owner: packageId,
      localId: 'third_party_seed',
      label: 'Third-party seed'
    }
  ])
  const officialIdentity = createOfficialIdentity(previousRegistrySet)
  const candidateIdentity = createCandidateIdentity(candidateRegistrySet, officialIdentity)
  const candidateSummary = summarizeRegistrySet(candidateRegistrySet)
  return {
    previousRegistrySet,
    candidateRegistrySet,
    officialIdentity,
    candidateIdentity,
    registryCount: candidateSummary.registryCount,
    entryCount: candidateSummary.entryCount
  }
}

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
  harness: ReturnType<typeof createHarness>,
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
  registryCount: harness.registryCount,
  entryCount: harness.entryCount,
  packageCount: 1,
  officialIdentity: harness.officialIdentity,
  candidateIdentity: harness.candidateIdentity,
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
  harness: ReturnType<typeof createHarness>,
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
  registryCount: harness.registryCount,
  entryCount: harness.entryCount,
  packageCount: 1,
  officialIdentity: harness.officialIdentity,
  candidateIdentity: harness.candidateIdentity,
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
  harness: ReturnType<typeof createHarness>,
  overrides: {
    readonly runtime?: Partial<ThirdPartyDataPackRuntimePublicationPreflightResult>
    readonly plan?: Partial<ThirdPartyDataPackTransactionPreCommitPlanResult>
    readonly recovery?: Partial<ThirdPartyDataPackPublicationRollbackRecoveryResult>
  } = {}
) => {
  const runtimePublicationPreflight = createRuntimePublicationPreflight(harness, overrides.runtime)
  const transactionPreCommitPlan = createTransactionPreCommitPlan(harness, overrides.plan)
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

const expectPathFree = (value: unknown): void => {
  const serialized = JSON.stringify(value)
  if (value && typeof value === 'object') {
    expect('liveRegistry' in value).toBe(false)
    expect('liveRegistryReference' in value).toBe(false)
    expect('candidateRegistry' in value).toBe(false)
    expect('candidateSnapshot' in value).toBe(false)
  }
  expect(serialized).not.toContain('candidateRegistrySet')
  expect(serialized).not.toContain('programDirectoryPath')
  expect(serialized).not.toContain('C:/Users')
}

describe('third-party runtime publication live registry swap host connection pipeline', () => {
  it('is disabled by default and does not read upstream reports or call hosts', async() => {
    const harness = createHarness()
    const reference = createThirdPartyDataPackInMemoryLiveRegistryReference(harness.previousRegistrySet)
    const host = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: reference,
      candidateRegistrySet: harness.candidateRegistrySet,
      candidateIdentity: harness.candidateIdentity
    })
    const readRuntimePublicationPreflight = vi.fn()
    const readTransactionPreCommitPlan = vi.fn()
    const readLiveRegistrySwapProtection = vi.fn()
    const readPublicationRollbackRecovery = vi.fn()
    const acknowledgeRuntimePublicationCommit = vi.fn()
    const pipeline = createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline({
      readRuntimePublicationPreflight,
      readTransactionPreCommitPlan,
      readLiveRegistrySwapProtection,
      readPublicationRollbackRecovery,
      acknowledgeRuntimePublicationCommit,
      liveRegistrySwapHost: host
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
    expect(reference.current).toBe(harness.previousRegistrySet)
    expect(host.getLastSwapRecord()).toBeUndefined()
    expect(host.getRetainedPreviousRegistrySet()).toBeUndefined()
    expect(result.effects.liveRegistrySwapped).toBe(false)
    expect(result.effects.runtimeEnablementAllowed).toBe(false)
    expectNoPersistentWrites(result)
    expectJsonGraphFrozen(result)
  })

  it('threads runtime publication acknowledgement into a real in-memory live registry swap host', async() => {
    const harness = createHarness()
    const bundle = createReportBundle(harness)
    const reference = createThirdPartyDataPackInMemoryLiveRegistryReference(harness.previousRegistrySet)
    const host = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: reference,
      candidateRegistrySet: harness.candidateRegistrySet,
      candidateIdentity: harness.candidateIdentity
    })
    const calls: string[] = []
    const acknowledgeRuntimePublicationCommit = vi.fn(async(
      envelope: ThirdPartyDataPackRuntimePublicationCommitHostEnvelope
    ) => {
      calls.push('runtime-publication-host')
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateIdentity.candidateHash).toBe(harness.candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(lockfileHash)
      expect('candidateRegistrySet' in envelope).toBe(false)
      expect('liveRegistry' in envelope).toBe(false)
      return {
        status: 'accepted' as const,
        requestedCommandId: 'install' as const,
        targetPackageId: packageId,
        selectedPackageIds: [packageId],
        blockedPackageIds: [],
        blockedCandidatePaths: [],
        loadOrder: [packageId],
        registryCount: harness.registryCount,
        entryCount: harness.entryCount,
        packageCount: 1,
        candidateHash: harness.candidateIdentity.candidateHash,
        lockfileHash,
        runtimePublicationCommitAdapterStatus: 'deferred' as const,
        effects: runtimeHostEffects()
      }
    })
    const pipeline = createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline({
      enabled: true,
      readRuntimePublicationPreflight: async() => bundle.runtimePublicationPreflight,
      readTransactionPreCommitPlan: async() => bundle.transactionPreCommitPlan,
      readLiveRegistrySwapProtection: async() => bundle.liveRegistrySwapProtection,
      readPublicationRollbackRecovery: async() => bundle.publicationRollbackRecovery,
      acknowledgeRuntimePublicationCommit,
      liveRegistrySwapHost: {
        ...host,
        executeLiveRegistrySwap: async envelope => {
          calls.push('live-registry-swap-host')
          return host.executeLiveRegistrySwap(envelope)
        }
      }
    })

    const result = await pipeline()

    expect(result.status).toBe('swapped')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.liveRegistrySwapHostStatus).toBe('swapped')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(harness.candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(calls).toEqual([
      'runtime-publication-host',
      'live-registry-swap-host'
    ])
    expect(reference.current).toBe(harness.candidateRegistrySet)
    expect(host.getRetainedPreviousRegistrySet()).toBe(harness.previousRegistrySet)
    expect(host.getLastSwapRecord()).toMatchObject({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      previousRegistryCount: 1,
      previousEntryCount: 1,
      candidateRegistryCount: 1,
      candidateEntryCount: 2,
      candidateHash: harness.candidateIdentity.candidateHash,
      lockfileHash,
      sequenceNumber: 1
    })
    expect(result.effects.injectedLiveRegistrySwapHostCalled).toBe(true)
    expect(result.effects.liveRegistrySwapped).toBe(true)
    expect(result.effects.runtimeEnablementAllowed).toBe(true)
    expect(result.effects.officialRegistryPublished).toBe(false)
    expect(result.effects.candidateRegistryExposed).toBe(false)
    expect(acknowledgeRuntimePublicationCommit).toHaveBeenCalledOnce()
    expectNoPersistentWrites(result)
    expectPathFree(result)
    expectPathFree(host.getLastSwapRecord())
    expectJsonGraphFrozen(result)
    expectJsonGraphFrozen(host.getLastSwapRecord())
  })

  it('propagates real host rejection without replacing the live registry reference', async() => {
    const harness = createHarness()
    const bundle = createReportBundle(harness)
    const reference = createThirdPartyDataPackInMemoryLiveRegistryReference(harness.previousRegistrySet)
    const host = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: reference,
      candidateRegistrySet: harness.candidateRegistrySet,
      candidateIdentity: {
        ...harness.candidateIdentity,
        candidateHash: testHash('e')
      }
    })
    const acknowledgeRuntimePublicationCommit = vi.fn(async(
      envelope: ThirdPartyDataPackRuntimePublicationCommitHostEnvelope
    ) => ({
      status: 'accepted' as const,
      requestedCommandId: 'install' as const,
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      blockedCandidatePaths: [],
      loadOrder: [packageId],
      registryCount: harness.registryCount,
      entryCount: harness.entryCount,
      packageCount: 1,
      candidateHash: envelope.candidateIdentity.candidateHash,
      lockfileHash: envelope.lockfileHash,
      runtimePublicationCommitAdapterStatus: 'deferred' as const,
      effects: runtimeHostEffects()
    }))
    const pipeline = createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline({
      enabled: true,
      readRuntimePublicationPreflight: async() => bundle.runtimePublicationPreflight,
      readTransactionPreCommitPlan: async() => bundle.transactionPreCommitPlan,
      readLiveRegistrySwapProtection: async() => bundle.liveRegistrySwapProtection,
      readPublicationRollbackRecovery: async() => bundle.publicationRollbackRecovery,
      acknowledgeRuntimePublicationCommit,
      liveRegistrySwapHost: host
    })

    let blocked: ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError | undefined
    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError)
      blocked = error as ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError
    }

    expect(blocked).toBeDefined()
    const result = blocked!.result
    expect(result.status).toBe('blocked')
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.liveRegistrySwapHostStatus).toBe('blocked')
    expect(result.effects.injectedLiveRegistrySwapHostCalled).toBe(true)
    expect(result.effects.liveRegistrySwapHostAccepted).toBe(false)
    expect(result.effects.liveRegistrySwapped).toBe(false)
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.live-registry-swap-execution-source.unsafe-host-result'
      })
    ]))
    expect(reference.current).toBe(harness.previousRegistrySet)
    expect(host.getRetainedPreviousRegistrySet()).toBeUndefined()
    expect(host.getLastSwapRecord()).toBeUndefined()
    expect(acknowledgeRuntimePublicationCommit).toHaveBeenCalledOnce()
    expectNoPersistentWrites(result)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })
})
