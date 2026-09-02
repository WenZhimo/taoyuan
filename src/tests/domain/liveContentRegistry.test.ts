import { afterEach, describe, expect, it, vi } from 'vitest'
import { getOfficialItemDef, getOfficialItemDefs } from '@/domain/mods/contentAccess'
import { createOfficialContentHash } from '@/domain/mods/officialPrecompiled'
import {
  getCurrentContentRegistrySet,
  getLiveContentRegistryReference,
  getOfficialBaselineContentRegistrySet,
  publishOfficialContentRegistrySet,
  resetLiveContentRegistryForTests
} from '@/domain/mods/liveContentRegistry'
import {
  createSerializableRegistrySnapshot,
  RegistrySet,
  type RegistryDefinition
} from '@/domain/mods/registry'
import {
  hashCanonicalJson,
  type Sha256Hash
} from '@/domain/mods/hash'
import {
  requirePackageId,
  toOfficialContentId,
  toOfficialRegistryTypeId,
  type PackageId
} from '@/domain/mods/ids'
import type { ItemDef } from '@/domain/mods/schemas'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackLiveRegistrySwapHost
} from '@/domain/mods/thirdPartyDataPackLiveRegistrySwapHost'
import * as officialContentBootstrap from '@/domain/mods/officialContentBootstrap'

const officialPackageId = requirePackageId('taoyuan-core')
const packageId = requirePackageId('sample_pack')
const lockfileHash = `sha256:${'d'.repeat(64)}` as Sha256Hash

const itemRegistryDefinition: RegistryDefinition<ItemDef> = {
  registryId: toOfficialRegistryTypeId('item'),
  description: 'runtime content registry test items',
  schemaName: 'item.schema.json'
}

const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const createItem = (localId: string, name: string): ItemDef => ({
  id: toOfficialContentId(localId),
  name: { key: `test.item.${localId}.name`, fallback: name },
  category: 'misc',
  description: { key: `test.item.${localId}.description`, fallback: name },
  sellPrice: 1,
  edible: false
})

const buildRegistrySet = (
  entries: readonly {
    readonly owner: PackageId
    readonly localId: string
    readonly name: string
  }[]
): RegistrySet => {
  const registrySet = new RegistrySet()
  const itemRegistry = registrySet.defineRegistry(itemRegistryDefinition)
  registrySet.freezeDefinitions()
  for (const entry of entries) {
    itemRegistry.register(entry.owner, createItem(entry.localId, entry.name), {
      file: `content/${entry.localId}.json`,
      localId: entry.localId
    })
  }
  registrySet.freezeEntries()
  return registrySet
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

describe('live content registry', () => {
  afterEach(() => {
    resetLiveContentRegistryForTests()
    vi.restoreAllMocks()
  })

  it('falls back to the official registry getter until a runtime reference is published', () => {
    const officialRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        name: 'Official seed'
      }
    ])
    const getOfficialRegistrySet = vi
      .spyOn(officialContentBootstrap, 'getOfficialRegistrySet')
      .mockReturnValue(officialRegistrySet)

    expect(getCurrentContentRegistrySet()).toBe(officialRegistrySet)
    expect(getOfficialItemDef('official_seed')?.name.fallback).toBe('Official seed')
    expect(getOfficialRegistrySet).toHaveBeenCalledTimes(2)
  })

  it('routes normal content access through the accepted live registry swap reference', async() => {
    const officialRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        name: 'Official seed'
      }
    ])
    const candidateRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        name: 'Official seed'
      },
      {
        owner: packageId,
        localId: 'third_party_seed',
        name: 'Third-party seed'
      }
    ])
    const officialIdentity = createOfficialIdentity(officialRegistrySet)
    const candidateIdentity = createCandidateIdentity(candidateRegistrySet, officialIdentity)
    const candidateSummary = summarizeRegistrySet(candidateRegistrySet)

    const reference = publishOfficialContentRegistrySet(officialRegistrySet)
    const host = createThirdPartyDataPackLiveRegistrySwapHost({
      liveRegistryReference: reference,
      candidateRegistrySet,
      candidateIdentity
    })

    expect(getLiveContentRegistryReference()).toBe(reference)
    expect(getOfficialItemDef('official_seed')?.name.fallback).toBe('Official seed')
    expect(getOfficialItemDef('third_party_seed')).toBeUndefined()

    await expect(host.executeLiveRegistrySwap({
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
      requiredProtectionIds: [
        'single-assignment-live-registry-reference',
        'previous-registry-identity-retention',
        'candidate-artifact-visibility-barrier',
        'post-swap-verification',
        'rollback-restore-diagnostics'
      ]
    })).resolves.toMatchObject({
      status: 'swapped',
      effects: {
        liveRegistrySwapped: true,
        runtimeEnablementAllowed: true,
        packageFilesWritten: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    })

    expect(reference.current).toBe(candidateRegistrySet)
    expect(getCurrentContentRegistrySet()).toBe(candidateRegistrySet)
    expect(getOfficialItemDef('third_party_seed')?.name.fallback).toBe('Third-party seed')
    expect(getOfficialItemDefs().map(item => item.id)).toEqual([
      toOfficialContentId('official_seed'),
      toOfficialContentId('third_party_seed')
    ])
  })

  it('does not clobber an already swapped live registry when the same official baseline is republished', () => {
    const officialRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        name: 'Official seed'
      }
    ])
    const candidateRegistrySet = buildRegistrySet([
      {
        owner: packageId,
        localId: 'third_party_seed',
        name: 'Third-party seed'
      }
    ])

    const reference = publishOfficialContentRegistrySet(officialRegistrySet)
    reference.current = candidateRegistrySet

    expect(publishOfficialContentRegistrySet(officialRegistrySet)).toBe(reference)
    expect(getCurrentContentRegistrySet()).toBe(candidateRegistrySet)
    expect(getOfficialItemDef('third_party_seed')?.name.fallback).toBe('Third-party seed')
    expect(getOfficialBaselineContentRegistrySet()).toBe(officialRegistrySet)
  })

  it('keeps the official baseline separate from the current third-party registry', () => {
    const officialRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        name: 'Official seed'
      }
    ])
    const candidateRegistrySet = buildRegistrySet([
      {
        owner: officialPackageId,
        localId: 'official_seed',
        name: 'Official seed'
      },
      {
        owner: packageId,
        localId: 'third_party_seed',
        name: 'Third-party seed'
      }
    ])

    const reference = publishOfficialContentRegistrySet(officialRegistrySet)
    reference.current = candidateRegistrySet

    expect(getCurrentContentRegistrySet()).toBe(candidateRegistrySet)
    expect(getOfficialBaselineContentRegistrySet()).toBe(officialRegistrySet)
    expect(getOfficialBaselineContentRegistrySet())
      .not.toBe(getCurrentContentRegistrySet())
  })
})
