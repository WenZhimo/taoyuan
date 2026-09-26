import { describe, expect, it } from 'vitest'
import {
  CURRENT_SAVE_FORMAT_VERSION,
  checkSaveRootCompatibility,
  createOfficialSaveContentEnvironment,
  createSaveContentEnvironment,
  migrateSaveRoot,
  normalizeSaveContentEnvironment,
  SaveContentEnvironmentError
} from '@/domain/save/saveContentEnvironment'

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
