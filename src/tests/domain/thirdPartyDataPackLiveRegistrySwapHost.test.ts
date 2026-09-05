import { describe, expect, it } from 'vitest'
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
  createThirdPartyDataPackLiveRegistrySwapExecutionSource
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapExecutionSource'
import {
  createThirdPartyDataPackInMemoryLiveRegistryReference,
  createThirdPartyDataPackLiveRegistrySwapHost
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapHost'
import type {
  ThirdPartyDataPackLiveRegistrySwapProtectionResult,
  ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapProtection'

const registryId = toOfficialRegistryTypeId('live_registry_swap_host_test')
const officialPackageId = requirePackageId('taoyuan-core')
const packageId = requirePackageId('sample_pack')
const lockfileHash = `sha256:${'d'.repeat(64)}` as Sha256Hash

const definition: RegistryDefinition<RegistryEntry> = {
  registryId,
  description: 'live registry swap host test',
  schemaName: 'live-registry-swap-host-test.schema.json'
}

const requiredProtectionIds: readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId[] = [
  'single-assignment-live-registry-reference',
  'previous-registry-identity-retention',
  'candidate-artifact-visibility-barrier',
  'post-swap-verification',
  'rollback-restore-diagnostics'
]

const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const buildRegistrySet = (
  entries: readonly {
    readonly owner: PackageId
    readonly localId: string
    readonly label: string
  }[],
  freeze = true
): RegistrySet => {
  const set = new RegistrySet()
  const registry = set.defineRegistry(definition)
  set.freezeDefinitions()
  for (const entry of entries) {
    const registryEntry: RegistryEntry & { label: string } = {
      id: toOfficialContentId(`live-registry/${entry.localId}`),
      label: entry.label
    }
    registry.register(entry.owner, registryEntry, {
      file: `content/${entry.localId}.json`,
      localId: entry.localId
    })
  }
  if (freeze) set.freezeEntries()
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
  officialIdentity: ThirdPartyCandidateOfficialIdentitySummary,
  options: {
    readonly commandId?: 'install' | 'uninstall'
    readonly targetPackageId?: PackageId
    readonly selectedPackages?: readonly {
      readonly packageId: PackageId
      readonly version: string
    }[]
    readonly selectedPackageIds?: readonly PackageId[]
    readonly blockedPackageIds?: readonly PackageId[]
    readonly loadOrder?: readonly PackageId[]
    readonly remainingPackageIds?: readonly PackageId[]
  } = {}
): ThirdPartyCandidateIdentitySummary => {
  const summary = summarizeRegistrySet(registrySet)
  const selectedPackages = options.selectedPackages ?? [{
    packageId,
    version: '1.0.0'
  }]
  const loadOrder = options.loadOrder ?? selectedPackages.map(selectedPackage => selectedPackage.packageId)
  const identityBody = options.commandId === 'uninstall'
    ? {
      formatVersion: 1,
      commandId: 'uninstall',
      targetPackageId: options.targetPackageId ?? packageId,
      officialIdentity,
      selectedPackageIds: options.selectedPackageIds ?? [],
      blockedPackageIds: options.blockedPackageIds ?? [],
      loadOrder,
      remainingPackageIds: options.remainingPackageIds ?? [],
      contentHash: summary.contentHash,
      snapshotHash: summary.snapshotHash
    }
    : {
      formatVersion: 1,
      officialIdentity,
      selectedPackages,
      loadOrder,
      contentHash: summary.contentHash,
      snapshotHash: summary.snapshotHash
    }
  return {
    formatVersion: 1,
    contentHash: summary.contentHash,
    snapshotHash: summary.snapshotHash,
    candidateHash: hashCanonicalJson(identityBody)
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
  const envelope = {
    requestedCommandId: 'install' as const,
    targetPackageId: packageId,
    selectedPackageIds: [packageId],
    blockedPackageIds: [],
    blockedCandidatePaths: [],
    loadOrder: [packageId],
    registryCount: candidateSummary.registryCount,
    entryCount: candidateSummary.entryCount,
    packageCount: 1,
    officialIdentity,
    candidateIdentity,
    lockfileHash,
    liveRegistrySwap: 'deferred' as const,
    requiredProtectionIds
  }
  return {
    previousRegistrySet,
    candidateRegistrySet,
    officialIdentity,
    candidateIdentity,
    envelope
  }
}

const createProtection = (
  envelope: ReturnType<typeof createHarness>['envelope']
): ThirdPartyDataPackLiveRegistrySwapProtectionResult => ({
  status: 'deferred',
  liveRegistrySwap: 'deferred',
  swapAllowed: false,
  liveRegistryMutable: false,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  blockedCandidatePaths: envelope.blockedCandidatePaths,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  officialIdentity: envelope.officialIdentity,
  candidateIdentity: envelope.candidateIdentity,
  lockfileHash: envelope.lockfileHash,
  protectionChecks: requiredProtectionIds.map(id => ({
    id,
    status: 'satisfied',
    reason: `${id} satisfied`
  })),
  requiredProtections: requiredProtectionIds.map(id => ({
    id,
    status: 'required',
    reason: `${id} required`
  })),
  diagnostics: [],
  effects: {
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
    recoveryLogReplayed: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  }
} as unknown as ThirdPartyDataPackLiveRegistrySwapProtectionResult)

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
    expect('previousRegistry' in value).toBe(false)
    expect('candidateRegistry' in value).toBe(false)
    expect('candidateSnapshot' in value).toBe(false)
  }
  expect(serialized).not.toContain('candidateRegistrySet')
  expect(serialized).not.toContain('programDirectoryPath')
  expect(serialized).not.toContain('C:/Users')
}

describe('third-party live registry swap host', () => {
  it('atomically swaps an in-memory live registry reference and retains the previous registry', async() => {
    const harness = createHarness()
    const reference = createThirdPartyDataPackInMemoryLiveRegistryReference(harness.previousRegistrySet)
    const host = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: reference,
      candidateRegistrySet: harness.candidateRegistrySet,
      candidateIdentity: harness.candidateIdentity
    })

    const result = await host.executeLiveRegistrySwap(harness.envelope)

    expect(result.status).toBe('swapped')
    expect(result.requestedCommandId).toBe('install')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateHash).toBe(harness.candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(result.effects.liveRegistrySwapHostCalled).toBe(true)
    expect(result.effects.liveRegistrySwapHostAccepted).toBe(true)
    expect(result.effects.thirdPartyRegistryPublished).toBe(true)
    expect(result.effects.liveRegistryMutated).toBe(true)
    expect(result.effects.liveRegistrySwapped).toBe(true)
    expect(result.effects.runtimeEnablementAllowed).toBe(true)
    expect(result.effects.lockfileWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.savesWritten).toBe(false)
    expect(result.effects.cacheWritten).toBe(false)
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
    expectJsonGraphFrozen(result)
    expectJsonGraphFrozen(host.getLastSwapRecord())
    expectPathFree(result)
    expectPathFree(host.getLastSwapRecord())
  })

  it('returns an acknowledgement accepted by the existing live registry swap execution source', async() => {
    const harness = createHarness()
    const reference = createThirdPartyDataPackInMemoryLiveRegistryReference(harness.previousRegistrySet)
    const host = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: reference,
      candidateRegistrySet: harness.candidateRegistrySet,
      candidateIdentity: harness.candidateIdentity
    })
    const source = createThirdPartyDataPackLiveRegistrySwapExecutionSource({
      enabled: true,
      readLiveRegistrySwapProtection: async() => createProtection(harness.envelope),
      executeLiveRegistrySwap: host.executeLiveRegistrySwap
    })

    const result = await source()

    expect(result.status).toBe('swapped')
    expect(result.liveRegistrySwapHostStatus).toBe('swapped')
    expect(result.commandContinuationAllowed).toBe(true)
    expect(result.effects.injectedLiveRegistrySwapHostCalled).toBe(true)
    expect(result.effects.liveRegistrySwapped).toBe(true)
    expect(result.effects.runtimeEnablementAllowed).toBe(true)
    expect(reference.current).toBe(harness.candidateRegistrySet)
    expect(host.getRetainedPreviousRegistrySet()).toBe(harness.previousRegistrySet)
    expectPathFree(result)
    expectJsonGraphFrozen(result)
  })

  it('allows an install command to replace entries from the same selected package', async() => {
    const officialRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        label: 'Official seed'
      }
    ])
    const previousRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        label: 'Official seed'
      },
      {
        owner: packageId,
        localId: 'third_party_seed',
        label: 'Third-party seed v1'
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
        label: 'Third-party seed v2'
      }
    ])
    const officialIdentity = createOfficialIdentity(officialRegistrySet)
    const candidateIdentity = createCandidateIdentity(candidateRegistrySet, officialIdentity)
    const candidateSummary = summarizeRegistrySet(candidateRegistrySet)
    const reference = createThirdPartyDataPackInMemoryLiveRegistryReference(previousRegistrySet)
    const host = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: reference,
      candidateRegistrySet,
      candidateIdentity
    })

    const result = await host.executeLiveRegistrySwap({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      blockedCandidatePaths: [],
      loadOrder: [packageId],
      registryCount: candidateSummary.registryCount,
      entryCount: candidateSummary.entryCount,
      packageCount: 1,
      officialIdentity,
      candidateIdentity,
      lockfileHash,
      liveRegistrySwap: 'deferred',
      requiredProtectionIds
    })

    expect(result.status).toBe('swapped')
    expect(reference.current).toBe(candidateRegistrySet)
    expect(host.getRetainedPreviousRegistrySet()).toBe(previousRegistrySet)
    expect(host.getLastSwapRecord()).toMatchObject({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      previousEntryCount: 2,
      candidateEntryCount: 2,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      sequenceNumber: 1
    })
    expect(candidateRegistrySet.get<RegistryEntry>(registryId).get(toOfficialContentId('live-registry/third_party_seed')))
      .toMatchObject({ label: 'Third-party seed v2' })
    expectPathFree(result)
    expectPathFree(host.getLastSwapRecord())
  })

  it('blocks install replacement when the current registry contains an unselected third-party package', async() => {
    const otherPackageId = requirePackageId('other_pack')
    const officialRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        label: 'Official seed'
      }
    ])
    const previousRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        label: 'Official seed'
      },
      {
        owner: otherPackageId,
        localId: 'other_third_party_seed',
        label: 'Other third-party seed'
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
    const officialIdentity = createOfficialIdentity(officialRegistrySet)
    const candidateIdentity = createCandidateIdentity(candidateRegistrySet, officialIdentity)
    const candidateSummary = summarizeRegistrySet(candidateRegistrySet)
    const reference = createThirdPartyDataPackInMemoryLiveRegistryReference(previousRegistrySet)
    const host = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: reference,
      candidateRegistrySet,
      candidateIdentity
    })

    const result = await host.executeLiveRegistrySwap({
      requestedCommandId: 'install',
      targetPackageId: packageId,
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      blockedCandidatePaths: [],
      loadOrder: [packageId],
      registryCount: candidateSummary.registryCount,
      entryCount: candidateSummary.entryCount,
      packageCount: 1,
      officialIdentity,
      candidateIdentity,
      lockfileHash,
      liveRegistrySwap: 'deferred',
      requiredProtectionIds
    })

    expect(result.status).toBe('blocked')
    expect(reference.current).toBe(previousRegistrySet)
    expect(host.getRetainedPreviousRegistrySet()).toBeUndefined()
    expect(host.getLastSwapRecord()).toBeUndefined()
    expectPathFree(result)
  })

  it('allows an uninstall command to remove the enabled target package before publishing official-only runtime', async() => {
    const officialRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        label: 'Official seed'
      }
    ])
    const previousRegistrySet = buildRegistrySet([
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
    const candidateRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        label: 'Official seed'
      }
    ])
    const officialIdentity = createOfficialIdentity(officialRegistrySet)
    const candidateIdentity = createCandidateIdentity(candidateRegistrySet, officialIdentity, {
      commandId: 'uninstall',
      selectedPackages: [],
      selectedPackageIds: [],
      blockedPackageIds: [],
      loadOrder: [],
      remainingPackageIds: []
    })
    const candidateSummary = summarizeRegistrySet(candidateRegistrySet)
    const reference = createThirdPartyDataPackInMemoryLiveRegistryReference(previousRegistrySet)
    const host = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: reference,
      candidateRegistrySet,
      candidateIdentity
    })

    const result = await host.executeLiveRegistrySwap({
      requestedCommandId: 'uninstall',
      targetPackageId: packageId,
      selectedPackageIds: [],
      blockedPackageIds: [],
      blockedCandidatePaths: [],
      loadOrder: [],
      registryCount: candidateSummary.registryCount,
      entryCount: candidateSummary.entryCount,
      packageCount: 0,
      officialIdentity,
      candidateIdentity,
      lockfileHash,
      liveRegistrySwap: 'deferred',
      requiredProtectionIds
    })

    expect(result.status).toBe('swapped')
    expect(result.requestedCommandId).toBe('uninstall')
    expect(result.effects.liveRegistrySwapHostAccepted).toBe(true)
    expect(result.effects.thirdPartyRegistryPublished).toBe(false)
    expect(result.effects.liveRegistrySwapped).toBe(true)
    expect(result.effects.runtimeEnablementAllowed).toBe(true)
    expect(reference.current).toBe(candidateRegistrySet)
    expect(host.getRetainedPreviousRegistrySet()).toBe(previousRegistrySet)
    expect(host.getLastSwapRecord()).toMatchObject({
      requestedCommandId: 'uninstall',
      targetPackageId: packageId,
      selectedPackageIds: [],
      blockedPackageIds: [],
      loadOrder: [],
      previousEntryCount: 2,
      candidateEntryCount: 1,
      candidateHash: candidateIdentity.candidateHash,
      lockfileHash,
      sequenceNumber: 1
    })
    expectPathFree(result)
    expectPathFree(host.getLastSwapRecord())
  })

  it('blocks uninstall when the current registry would still contain another third-party package', async() => {
    const otherPackageId = requirePackageId('other_pack')
    const officialRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        label: 'Official seed'
      }
    ])
    const previousRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        label: 'Official seed'
      },
      {
        owner: packageId,
        localId: 'third_party_seed',
        label: 'Third-party seed'
      },
      {
        owner: otherPackageId,
        localId: 'other_third_party_seed',
        label: 'Other third-party seed'
      }
    ])
    const candidateRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        label: 'Official seed'
      }
    ])
    const officialIdentity = createOfficialIdentity(officialRegistrySet)
    const candidateIdentity = createCandidateIdentity(candidateRegistrySet, officialIdentity, {
      commandId: 'uninstall',
      selectedPackages: [],
      selectedPackageIds: [],
      blockedPackageIds: [],
      loadOrder: [],
      remainingPackageIds: []
    })
    const candidateSummary = summarizeRegistrySet(candidateRegistrySet)
    const reference = createThirdPartyDataPackInMemoryLiveRegistryReference(previousRegistrySet)
    const host = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: reference,
      candidateRegistrySet,
      candidateIdentity
    })

    const result = await host.executeLiveRegistrySwap({
      requestedCommandId: 'uninstall',
      targetPackageId: packageId,
      selectedPackageIds: [],
      blockedPackageIds: [],
      blockedCandidatePaths: [],
      loadOrder: [],
      registryCount: candidateSummary.registryCount,
      entryCount: candidateSummary.entryCount,
      packageCount: 0,
      officialIdentity,
      candidateIdentity,
      lockfileHash,
      liveRegistrySwap: 'deferred',
      requiredProtectionIds
    })

    expect(result.status).toBe('blocked')
    expect(reference.current).toBe(previousRegistrySet)
    expect(host.getRetainedPreviousRegistrySet()).toBeUndefined()
    expect(host.getLastSwapRecord()).toBeUndefined()
    expectPathFree(result)
  })

  it('blocks stale current registry, candidate identity drift and unfrozen candidates without swapping', async() => {
    const staleHarness = createHarness()
    const staleReference = createThirdPartyDataPackInMemoryLiveRegistryReference(buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'different_official_seed',
        label: 'Different official seed'
      }
    ]))
    const staleHost = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: staleReference,
      candidateRegistrySet: staleHarness.candidateRegistrySet,
      candidateIdentity: staleHarness.candidateIdentity
    })

    const staleResult = await staleHost.executeLiveRegistrySwap(staleHarness.envelope)

    expect(staleResult.status).toBe('blocked')
    expect(staleReference.current).not.toBe(staleHarness.candidateRegistrySet)
    expect(staleHost.getRetainedPreviousRegistrySet()).toBeUndefined()
    expect(staleResult.effects.liveRegistrySwapHostCalled).toBe(true)
    expect(staleResult.effects.liveRegistrySwapHostAccepted).toBe(false)
    expect(staleResult.effects.liveRegistrySwapped).toBe(false)
    expectPathFree(staleResult)

    const driftHarness = createHarness()
    const driftReference = createThirdPartyDataPackInMemoryLiveRegistryReference(driftHarness.previousRegistrySet)
    const driftHost = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: driftReference,
      candidateRegistrySet: driftHarness.candidateRegistrySet,
      candidateIdentity: {
        ...driftHarness.candidateIdentity,
        candidateHash: testHash('e')
      }
    })

    const driftResult = await driftHost.executeLiveRegistrySwap(driftHarness.envelope)

    expect(driftResult.status).toBe('blocked')
    expect(driftReference.current).toBe(driftHarness.previousRegistrySet)
    expect(driftHost.getRetainedPreviousRegistrySet()).toBeUndefined()
    expectPathFree(driftResult)

    const unfrozenHarness = createHarness()
    const unfrozenCandidate = buildRegistrySet([
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
    ], false)
    const unfrozenReference = createThirdPartyDataPackInMemoryLiveRegistryReference(unfrozenHarness.previousRegistrySet)
    const unfrozenHost = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: unfrozenReference,
      candidateRegistrySet: unfrozenCandidate,
      candidateIdentity: unfrozenHarness.candidateIdentity
    })

    const unfrozenResult = await unfrozenHost.executeLiveRegistrySwap(unfrozenHarness.envelope)

    expect(unfrozenResult.status).toBe('blocked')
    expect(unfrozenReference.current).toBe(unfrozenHarness.previousRegistrySet)
    expect(unfrozenHost.getRetainedPreviousRegistrySet()).toBeUndefined()
    expectPathFree(unfrozenResult)
  })
})
