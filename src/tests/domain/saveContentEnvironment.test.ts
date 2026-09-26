import { describe, expect, it } from 'vitest'
import {
  CURRENT_SAVE_FORMAT_VERSION,
  checkSaveRootCompatibility,
  createOfficialSaveContentEnvironment,
  createSaveContentEnvironmentFromLockfileDraft,
  createSaveContentEnvironment,
  migrateSaveRoot,
  normalizeSaveContentEnvironment,
  SaveContentEnvironmentError
} from '@/domain/save/saveContentEnvironment'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'

const createLegacyRoot = () => ({
  game: { year: 2, season: 'summer', day: 4 },
  player: { money: 12 },
  savedAt: '2026-09-26T00:00:00.000Z'
})

const createAlternateEnvironment = () => {
  const official = createOfficialSaveContentEnvironment()
  const identity = {
    gameVersion: official.gameVersion,
    engineApiVersion: official.engineApiVersion,
    contentSchemaVersion: official.contentSchemaVersion,
    loaderVersion: official.loaderVersion,
    contentCompilerVersion: official.contentCompilerVersion,
    schemaSetHash: official.schemaSetHash,
    cacheFormatVersion: official.cacheFormatVersion,
    trustPolicyVersion: official.trustPolicyVersion,
    packages: official.packages
  }
  return createSaveContentEnvironment({
    ...identity,
    packages: identity.packages.map(pkg => ({
      ...pkg,
      configurationHash: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    }))
  })
}

const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const createLockfileDraft = (): ThirdPartyDataPackLockfileDraft => {
  const official = createOfficialSaveContentEnvironment()
  const libraryPackageId = 'library_pack' as PackageId
  const selectedPackageId = 'selected_pack' as PackageId
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity: {
      artifactHash: testHash('a'),
      contentHash: official.packages[0]!.contentHash as Sha256Hash,
      schemaSetHash: official.schemaSetHash as Sha256Hash,
      environmentHash: testHash('b'),
      snapshotHash: testHash('c'),
      registryCount: 54,
      entryCount: 4242
    },
    candidateIdentity: {
      formatVersion: 1,
      contentHash: testHash('d'),
      snapshotHash: testHash('e'),
      candidateHash: testHash('f')
    },
    registryCount: 56,
    entryCount: 4244,
    selectedPackageIds: [libraryPackageId, selectedPackageId],
    loadOrder: [libraryPackageId, selectedPackageId],
    packages: [
      {
        packageId: libraryPackageId,
        version: '1.0.0',
        loadIndex: 0,
        source: {
          candidatePath: 'library-pack',
          manifestPath: 'library-pack/manifest.json',
          contentFiles: []
        },
        manifestHash: testHash('0'),
        contentHash: testHash('1'),
        configurationHash: testHash('2'),
        resolvedDependencies: [],
        contentFiles: []
      },
      {
        packageId: selectedPackageId,
        version: '2.0.0',
        loadIndex: 1,
        source: {
          candidatePath: 'selected-pack',
          manifestPath: 'selected-pack/manifest.json',
          contentFiles: []
        },
        manifestHash: testHash('3'),
        contentHash: testHash('4'),
        configurationHash: testHash('5'),
        resolvedDependencies: [libraryPackageId],
        contentFiles: []
      }
    ]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body) as Sha256Hash
  }
}

describe('save content environment', () => {
  it('migrates a legacy root without mutating the input and writes the current root version', () => {
    const legacy = createLegacyRoot()
    const before = structuredClone(legacy)
    const result = migrateSaveRoot(legacy)

    expect(result.status).toBe('legacy-migrated')
    expect(result.data.saveFormatVersion).toBe(CURRENT_SAVE_FORMAT_VERSION)
    expect(result.data.contentEnvironment).toEqual(createOfficialSaveContentEnvironment())
    expect(legacy).toEqual(before)
  })

  it('accepts the current environment only when the identity hash is valid', () => {
    const environment = createOfficialSaveContentEnvironment()
    expect(normalizeSaveContentEnvironment(environment)).toEqual(environment)

    const tampered = { ...environment, environmentHash: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' }
    expect(() => normalizeSaveContentEnvironment(tampered)).toThrow(SaveContentEnvironmentError)
  })

  it('derives the save environment from the verified lockfile and selected package set', () => {
    const draft = createLockfileDraft()
    const before = structuredClone(draft)

    const environment = createSaveContentEnvironmentFromLockfileDraft(
      draft,
      ['library_pack', 'selected_pack'] as PackageId[]
    )

    expect(environment.packages.map(pkg => pkg.id)).toEqual([
      'taoyuan-core',
      'library_pack',
      'selected_pack'
    ])
    expect(environment.packages.map(pkg => pkg.loadIndex)).toEqual([0, 1, 2])
    expect(environment.packages[2]).toMatchObject({
      id: 'selected_pack',
      version: '2.0.0',
      resolvedDependencies: ['library_pack']
    })
    expect(environment.environmentHash).toMatch(/^sha256:[0-9a-f]{64}$/)
    expect(draft).toEqual(before)
  })

  it('excludes packages that are not selected from the save environment', () => {
    const environment = createSaveContentEnvironmentFromLockfileDraft(
      createLockfileDraft(),
      []
    )

    expect(environment.packages.map(pkg => pkg.id)).toEqual(['taoyuan-core'])
  })

  it('blocks a save from another package environment without changing the saved root', () => {
    const current = createOfficialSaveContentEnvironment()
    const alternate = createAlternateEnvironment()
    const root = {
      ...createLegacyRoot(),
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      contentEnvironment: alternate
    }

    const result = checkSaveRootCompatibility(root, current)

    expect(result.status).toBe('incompatible')
    expect(result.migration?.data.contentEnvironment).toEqual(alternate)
    expect(root.contentEnvironment).toEqual(alternate)
    expect(result.diagnostics[0]?.code).toBe('SAVE-ENVIRONMENT-001')
  })

  it('rejects an unsupported current root instead of treating it as legacy', () => {
    const result = checkSaveRootCompatibility({
      ...createLegacyRoot(),
      saveFormatVersion: 99
    }, createOfficialSaveContentEnvironment())

    expect(result.status).toBe('invalid')
    expect(result.diagnostics[0]?.stage).toBe('save.root.format')
  })
})
