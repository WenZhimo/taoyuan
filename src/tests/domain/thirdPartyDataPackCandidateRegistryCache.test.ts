import { describe, expect, it } from 'vitest'
import metadataJson from '@/generated/mods/official-precompiled-metadata.json'
import {
  createOfficialContentHash
} from '@/domain/mods/officialPrecompiled'
import {
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import {
  createSerializableRegistrySnapshot
} from '@/domain/mods/registry'
import {
  createThirdPartyDataPackCandidateRegistryCacheEnvironmentHash,
  createThirdPartyDataPackCandidateRegistryCacheText,
  createInMemoryThirdPartyDataPackCandidateRegistryCacheStore,
  parseThirdPartyDataPackCandidateRegistryCacheText
} from '@/domain/mods/thirdPartyDataPackCandidateRegistryCache'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import type {
  ThirdPartyCandidateOfficialIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'

const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const createDraft = (): ThirdPartyDataPackLockfileDraft => {
  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  const snapshot = createSerializableRegistrySnapshot(officialRegistrySet)
  const officialIdentity: ThirdPartyCandidateOfficialIdentitySummary = {
    artifactHash: metadataJson.artifactHash as Sha256Hash,
    contentHash: createOfficialContentHash(snapshot),
    schemaSetHash: metadataJson.schemaSetHash as Sha256Hash,
    environmentHash: metadataJson.environmentHash as Sha256Hash,
    snapshotHash: snapshot.snapshotHash as Sha256Hash,
    registryCount: snapshot.registries.length,
    entryCount: snapshot.registries.reduce((total, registry) => total + registry.entries.length, 0)
  }
  const packageDraft: ThirdPartyDataPackLockfileDraft['packages'][number] = {
    packageId: 'cache_test_pack' as PackageId,
    version: '1.0.0',
    loadIndex: 0,
    source: {
      candidatePath: 'cache_test_pack',
      manifestPath: 'cache_test_pack/manifest.json',
      contentFiles: []
    },
    manifestHash: testHash('1'),
    contentHash: testHash('2'),
    configurationHash: testHash('3'),
    resolvedDependencies: [],
    contentFiles: []
  }
  const candidateIdentityBody = {
    formatVersion: 1,
    officialIdentity,
    selectedPackages: [{ packageId: packageDraft.packageId, version: packageDraft.version }],
    loadOrder: [packageDraft.packageId],
    contentHash: createOfficialContentHash(snapshot),
    snapshotHash: snapshot.snapshotHash
  }
  const candidateIdentity = {
    formatVersion: 1 as const,
    contentHash: candidateIdentityBody.contentHash,
    snapshotHash: snapshot.snapshotHash as Sha256Hash,
    candidateHash: hashCanonicalJson(candidateIdentityBody)
  }
  const body = {
    formatVersion: 1 as const,
    kind: 'third-party-data-pack-lockfile-draft' as const,
    officialIdentity,
    candidateIdentity,
    registryCount: officialIdentity.registryCount,
    entryCount: officialIdentity.entryCount,
    selectedPackageIds: [packageDraft.packageId],
    loadOrder: [packageDraft.packageId],
    packages: [packageDraft]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body)
  }
}

describe('third-party candidate registry cache', () => {
  it('round-trips a frozen candidate snapshot and derives a stable environment key', () => {
    const draft = createDraft()
    const snapshot = createSerializableRegistrySnapshot(buildOfficialRegistrySetFromStaticData())
    const contents = createThirdPartyDataPackCandidateRegistryCacheText(snapshot, draft)
    const restored = parseThirdPartyDataPackCandidateRegistryCacheText(contents)

    expect(restored.envelope.environmentHash).toBe(
      createThirdPartyDataPackCandidateRegistryCacheEnvironmentHash(draft)
    )
    expect(restored.envelope.lockfileDraft.lockfileHash).toBe(draft.lockfileHash)
    expect(restored.envelope.candidateSnapshot.snapshotHash).toBe(snapshot.snapshotHash)
    expect(restored.candidateRegistrySet.currentPhase).toBe('frozen')
    expect(restored.candidateRegistrySet.registryIds()).toEqual(
      buildOfficialRegistrySetFromStaticData().registryIds()
    )
  })

  it('rejects a cache when the payload or environment identity changes', () => {
    const draft = createDraft()
    const snapshot = createSerializableRegistrySnapshot(buildOfficialRegistrySetFromStaticData())
    const contents = createThirdPartyDataPackCandidateRegistryCacheText(snapshot, draft)
    const value = JSON.parse(contents) as Record<string, unknown>

    value.payloadHash = testHash('f')
    expect(() => parseThirdPartyDataPackCandidateRegistryCacheText(JSON.stringify(value)))
      .toThrow('payload hash')

    const secondValue = JSON.parse(contents) as Record<string, unknown>
    secondValue.environmentHash = testHash('e')
    expect(() => parseThirdPartyDataPackCandidateRegistryCacheText(JSON.stringify(secondValue)))
      .toThrow('environment hash')
  })

  it('keeps cache records isolated by environment hash', async() => {
    const store = createInMemoryThirdPartyDataPackCandidateRegistryCacheStore()
    const draft = createDraft()
    const snapshot = createSerializableRegistrySnapshot(buildOfficialRegistrySetFromStaticData())
    const contents = createThirdPartyDataPackCandidateRegistryCacheText(snapshot, draft)
    const environmentHash = createThirdPartyDataPackCandidateRegistryCacheEnvironmentHash(draft)

    await store.write(environmentHash, contents)

    expect(await store.read(environmentHash)).toBe(contents)
    expect(await store.read(testHash('0'))).toBeNull()
  })
})
