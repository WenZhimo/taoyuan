import { describe, expect, it } from 'vitest'
import {
  CacheEnvironmentError,
  createEnvironmentHash,
  normalizeCacheEnvironmentIdentity
} from '@/domain/mods/environmentHash'

const hash = (digit: string) => `sha256:${digit.repeat(64)}`

const createIdentity = () => ({
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  loaderVersion: '1',
  contentCompilerVersion: '1',
  schemaSetHash: hash('1'),
  cacheFormatVersion: 1,
  trustPolicyVersion: 'builtin-official-1',
  packages: [
    {
      id: 'addon',
      version: '1.0.0',
      contentHash: hash('2'),
      configurationHash: hash('3'),
      loadIndex: 1,
      resolvedDependencies: ['z_dependency', 'a_dependency']
    },
    {
      id: 'taoyuan-core',
      version: '2.4.0',
      contentHash: hash('4'),
      configurationHash: hash('5'),
      loadIndex: 0,
      resolvedDependencies: []
    }
  ]
})

describe('cache environment hash', () => {
  it('normalizes package and dependency order without locale or object-order input', () => {
    const identity = createIdentity()
    const reordered = {
      packages: [
        { ...identity.packages[1] },
        { ...identity.packages[0], resolvedDependencies: ['a_dependency', 'z_dependency'] }
      ],
      trustPolicyVersion: identity.trustPolicyVersion,
      cacheFormatVersion: identity.cacheFormatVersion,
      schemaSetHash: identity.schemaSetHash,
      contentCompilerVersion: identity.contentCompilerVersion,
      loaderVersion: identity.loaderVersion,
      contentSchemaVersion: identity.contentSchemaVersion,
      engineApiVersion: identity.engineApiVersion,
      gameVersion: identity.gameVersion
    }

    expect(createEnvironmentHash(reordered)).toBe(createEnvironmentHash(identity))
    expect(normalizeCacheEnvironmentIdentity(reordered).packages.map(pkg => pkg.id))
      .toEqual(['taoyuan-core', 'addon'])
    expect(normalizeCacheEnvironmentIdentity(reordered).packages[1]?.resolvedDependencies)
      .toEqual(['a_dependency', 'z_dependency'])
  })

  it.each([
    ['gameVersion', '2.4.1'],
    ['engineApiVersion', '2'],
    ['contentSchemaVersion', '2'],
    ['loaderVersion', '2'],
    ['contentCompilerVersion', '2'],
    ['schemaSetHash', hash('6')],
    ['cacheFormatVersion', 2],
    ['trustPolicyVersion', 'builtin-official-2']
  ] as const)('changes when stable field %s changes', (field, replacement) => {
    const identity = createIdentity()
    expect(createEnvironmentHash({ ...identity, [field]: replacement }))
      .not.toBe(createEnvironmentHash(identity))
  })

  it('changes when package content, configuration, order, or dependencies change', () => {
    const identity = createIdentity()
    const variants = [
      { ...identity, packages: identity.packages.map((pkg, index) => index === 0 ? { ...pkg, contentHash: hash('7') } : pkg) },
      { ...identity, packages: identity.packages.map((pkg, index) => index === 0 ? { ...pkg, configurationHash: hash('8') } : pkg) },
      { ...identity, packages: identity.packages.map((pkg, index) => ({ ...pkg, loadIndex: index })) },
      { ...identity, packages: identity.packages.map((pkg, index) => index === 0 ? { ...pkg, resolvedDependencies: ['different'] } : pkg) }
    ]

    for (const variant of variants) {
      expect(createEnvironmentHash(variant)).not.toBe(createEnvironmentHash(identity))
    }
  })

  it('rejects malformed, duplicate, and non-JSON identities before hashing', () => {
    const duplicateIds = createIdentity()
    duplicateIds.packages[0]!.id = 'taoyuan-core'
    expect(() => createEnvironmentHash(duplicateIds)).toThrow(CacheEnvironmentError)

    const duplicateIndexes = createIdentity()
    duplicateIndexes.packages[0]!.loadIndex = 0
    expect(() => createEnvironmentHash(duplicateIndexes)).toThrow(CacheEnvironmentError)

    const malformed = createIdentity() as ReturnType<typeof createIdentity> & { platform?: string }
    malformed.platform = 'win32'
    expect(() => createEnvironmentHash(malformed)).toThrow(CacheEnvironmentError)

    const cyclic = createIdentity() as ReturnType<typeof createIdentity> & { runtime?: unknown }
    cyclic.runtime = cyclic
    expect(() => createEnvironmentHash(cyclic)).toThrow(CacheEnvironmentError)
  })
})
