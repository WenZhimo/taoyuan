import { describe, expect, it } from 'vitest'
import {
  canLoadSaveContentEnvironmentInOfficialSafeMode,
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

const createOfficialVersionEnvironment = (gameVersion: string) => {
  const official = createOfficialSaveContentEnvironment()
  return createSaveContentEnvironment({
    engineApiVersion: official.engineApiVersion,
    contentSchemaVersion: official.contentSchemaVersion,
    loaderVersion: official.loaderVersion,
    contentCompilerVersion: official.contentCompilerVersion,
    schemaSetHash: official.schemaSetHash,
    cacheFormatVersion: official.cacheFormatVersion,
    trustPolicyVersion: official.trustPolicyVersion,
    gameVersion,
    packages: official.packages.map(pkg => ({ ...pkg, version: gameVersion }))
  })
}

const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const createThirdPartyEnvironment = (
  version: string,
  contentFill: string,
  configurationFill: string
) => {
  const official = createOfficialSaveContentEnvironment()
  return createSaveContentEnvironment({
    gameVersion: official.gameVersion,
    engineApiVersion: official.engineApiVersion,
    contentSchemaVersion: official.contentSchemaVersion,
    loaderVersion: official.loaderVersion,
    contentCompilerVersion: official.contentCompilerVersion,
    schemaSetHash: official.schemaSetHash,
    cacheFormatVersion: official.cacheFormatVersion,
    trustPolicyVersion: official.trustPolicyVersion,
    packages: [
      official.packages[0]!,
      {
        id: 'example_pack' as PackageId,
        version,
        contentHash: testHash(contentFill),
        configurationHash: testHash(configurationFill),
        loadIndex: 1,
        resolvedDependencies: []
      }
    ]
  })
}

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
    expect(result.data.packageSettings).toEqual({})
    expect(legacy).toEqual(before)
  })

  it('migrates a v2 root to the current root while preserving unknown package settings', () => {
    const packageSettings = {
      example_pack: {
        schemaVersion: '1',
        values: { 'example_pack:feature_enabled': false }
      }
    }
    const root = {
      ...createLegacyRoot(),
      saveFormatVersion: 2,
      contentEnvironment: createOfficialSaveContentEnvironment(),
      packageSettings
    }

    const result = migrateSaveRoot(root)

    expect(result.status).toBe('legacy-migrated')
    expect(result.data.saveFormatVersion).toBe(CURRENT_SAVE_FORMAT_VERSION)
    expect(result.packageSettings).toEqual(packageSettings)
    expect(result.data.packageSettings).toEqual(packageSettings)
    expect(root.packageSettings).toEqual(packageSettings)
  })

  it('rejects malformed package settings before compatibility can approve the root', () => {
    const result = checkSaveRootCompatibility({
      ...createLegacyRoot(),
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      contentEnvironment: createOfficialSaveContentEnvironment(),
      packageSettings: { example_pack: { schemaVersion: '1', values: { enabled: true } } }
    }, createOfficialSaveContentEnvironment())

    expect(result.status).toBe('invalid')
    expect(result.diagnostics[0]?.code).toBe('SAVE-PACKAGE-SETTINGS-001')
  })

  it('accepts the current environment only when the identity hash is valid', () => {
    const environment = createOfficialSaveContentEnvironment()
    expect(normalizeSaveContentEnvironment(environment)).toEqual(environment)

    const tampered = { ...environment, environmentHash: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' }
    expect(() => normalizeSaveContentEnvironment(tampered)).toThrow(SaveContentEnvironmentError)
  })

  it('allows official-only safe mode only when the saved official identity is unchanged', () => {
    const official = createOfficialSaveContentEnvironment()
    const thirdParty = createThirdPartyEnvironment('1.0.0', 'a', 'b')

    expect(canLoadSaveContentEnvironmentInOfficialSafeMode(thirdParty, official)).toBe(true)
    expect(canLoadSaveContentEnvironmentInOfficialSafeMode(official, official)).toBe(false)

    const changedOfficial = createSaveContentEnvironment({
      gameVersion: official.gameVersion,
      engineApiVersion: official.engineApiVersion,
      contentSchemaVersion: official.contentSchemaVersion,
      loaderVersion: official.loaderVersion,
      contentCompilerVersion: official.contentCompilerVersion,
      schemaSetHash: official.schemaSetHash,
      cacheFormatVersion: official.cacheFormatVersion,
      trustPolicyVersion: official.trustPolicyVersion,
      packages: official.packages.map(pkg => ({
        ...pkg,
        configurationHash: testHash('a')
      }))
    })
    expect(canLoadSaveContentEnvironmentInOfficialSafeMode(thirdParty, changedOfficial)).toBe(false)
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
      contentEnvironment: alternate,
      packageSettings: {}
    }

    const result = checkSaveRootCompatibility(root, current)

    expect(result.status).toBe('incompatible')
    expect(result.migration?.data.contentEnvironment).toEqual(alternate)
    expect(root.contentEnvironment).toEqual(alternate)
    expect(result.diagnostics[0]?.code).toBe('SAVE-ENVIRONMENT-001')
  })

  it('allows an official-only forward migration when content identity is unchanged', () => {
    const savedEnvironment = createOfficialVersionEnvironment('2.3.0')
    const currentEnvironment = createOfficialVersionEnvironment('2.4.0')
    const root = {
      ...createLegacyRoot(),
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      contentEnvironment: savedEnvironment,
      packageSettings: {}
    }

    const result = checkSaveRootCompatibility(root, currentEnvironment)

    expect(result.status).toBe('migratable')
    expect(result.migration?.environment).toEqual(currentEnvironment)
    expect(result.migration?.data.contentEnvironment).toEqual(currentEnvironment)
    expect(root.contentEnvironment).toEqual(savedEnvironment)
    expect(result.diagnostics[0]).toMatchObject({
      code: 'SAVE-ENVIRONMENT-001',
      details: expect.objectContaining({ reason: 'official-version-forward-migration' })
    })
  })

  it('rejects an official downgrade instead of opening it as writable', () => {
    const savedEnvironment = createOfficialVersionEnvironment('2.4.0')
    const currentEnvironment = createOfficialVersionEnvironment('2.3.0')
    const result = checkSaveRootCompatibility({
      ...createLegacyRoot(),
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      contentEnvironment: savedEnvironment,
      packageSettings: {}
    }, currentEnvironment)

    expect(result.status).toBe('incompatible')
    expect(result.diagnostics[0]).toMatchObject({
      details: expect.objectContaining({ reason: 'environment-mismatch' })
    })
  })

  it('allows a declared third-party forward migration only as a copy', () => {
    const savedEnvironment = createThirdPartyEnvironment('1.0.0', 'a', 'b')
    const currentEnvironment = createThirdPartyEnvironment('1.1.0', 'c', 'd')
    const root = {
      ...createLegacyRoot(),
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      contentEnvironment: savedEnvironment,
      packageSettings: {}
    }

    const result = checkSaveRootCompatibility(root, currentEnvironment, {
      packageMigrations: [{
        packageId: 'example_pack' as PackageId,
        fromVersion: '1.0.0',
        toVersion: '1.1.0',
        migrate: data => ({
          ...data,
          game: { ...data.game, year: 3 }
        })
      }]
    })

    expect(result.status).toBe('copy-migratable')
    expect(result.migration?.status).toBe('third-party-copy-migrated')
    expect(result.migration?.writeMode).toBe('copy-only')
    expect(result.migration?.data.game).toMatchObject({ year: 3 })
    expect(result.migration?.data.contentEnvironment).toEqual(currentEnvironment)
    expect(root.game).toEqual({ year: 2, season: 'summer', day: 4 })
    expect(root.contentEnvironment).toEqual(savedEnvironment)
  })

  it('follows every declared third-party migration step in order', () => {
    const savedEnvironment = createThirdPartyEnvironment('1.0.0', 'a', 'b')
    const currentEnvironment = createThirdPartyEnvironment('1.2.0', 'e', 'f')
    const result = checkSaveRootCompatibility({
      ...createLegacyRoot(),
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      contentEnvironment: savedEnvironment,
      packageSettings: {}
    }, currentEnvironment, {
      packageMigrations: [
        {
          packageId: 'example_pack' as PackageId,
          fromVersion: '1.0.0',
          toVersion: '1.1.0',
          migrate: data => ({ ...data, player: { ...data.player, money: 20 } })
        },
        {
          packageId: 'example_pack' as PackageId,
          fromVersion: '1.1.0',
          toVersion: '1.2.0',
          migrate: data => ({ ...data, player: { ...data.player, money: data.player.money + 1 } })
        }
      ]
    })

    expect(result.status).toBe('copy-migratable')
    expect(result.migration?.data.player).toMatchObject({ money: 21 })
  })

  it('rejects a package migration descriptor that moves backward', () => {
    const result = checkSaveRootCompatibility({
      ...createLegacyRoot(),
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      contentEnvironment: createThirdPartyEnvironment('1.0.0', 'a', 'b'),
      packageSettings: {}
    }, createThirdPartyEnvironment('1.1.0', 'c', 'd'), {
      packageMigrations: [{
        packageId: 'example_pack' as PackageId,
        fromVersion: '1.1.0',
        toVersion: '1.0.0',
        migrate: data => data
      }]
    })

    expect(result.status).toBe('incompatible')
    expect(result.diagnostics[0]).toMatchObject({
      details: expect.objectContaining({ reason: 'non-forward-migration' })
    })
  })

  it('rejects a third-party environment when any package migration path is missing', () => {
    const savedEnvironment = createThirdPartyEnvironment('1.0.0', 'a', 'b')
    const currentEnvironment = createThirdPartyEnvironment('1.1.0', 'c', 'd')
    const result = checkSaveRootCompatibility({
      ...createLegacyRoot(),
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      contentEnvironment: savedEnvironment,
      packageSettings: {}
    }, currentEnvironment)

    expect(result.status).toBe('incompatible')
    expect(result.diagnostics[0]).toMatchObject({
      code: 'SAVE-ENVIRONMENT-001',
      details: expect.objectContaining({ reason: 'migration-path-missing' })
    })
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
