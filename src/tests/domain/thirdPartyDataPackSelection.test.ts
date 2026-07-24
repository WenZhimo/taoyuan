/// <reference types="node" />

import { cp, lstat, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDataPackDiscoveryReport,
  type ThirdPartyDiscoveryDirectoryEntry,
  type ThirdPartyDiscoveryFileSystem
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import { selectThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackSelection'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const fixtureRoot = path.join(cwd(), 'src/tests/fixtures/mods/third-party-discovery')

type JsonObject = Record<string, unknown>

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-pack-selection-'))
  roots.push(root)
  return root
}

const toEntryKind = (stats: Awaited<ReturnType<typeof lstat>>): ThirdPartyDiscoveryDirectoryEntry['kind'] => {
  if (stats.isFile()) return 'file'
  if (stats.isDirectory()) return 'directory'
  return 'other'
}

const isMissing = (error: unknown): boolean =>
  typeof error === 'object'
  && error !== null
  && 'code' in error
  && (error as { code?: string }).code === 'ENOENT'

const createNodeFileSystem = (): ThirdPartyDiscoveryFileSystem => ({
  async getEntry(filePath) {
    try {
      const stats = await lstat(filePath)
      return {
        name: path.basename(filePath),
        kind: toEntryKind(stats),
        isSymbolicLink: stats.isSymbolicLink()
      }
    } catch (error) {
      if (isMissing(error)) return null
      throw error
    }
  },
  async readDirectory(directoryPath) {
    const entries = await readdir(directoryPath, { withFileTypes: true })
    return entries.map(entry => ({
      name: entry.name,
      kind: entry.isFile() ? 'file' : entry.isDirectory() ? 'directory' : 'other',
      isSymbolicLink: entry.isSymbolicLink()
    }))
  },
  async readTextFile(filePath) {
    return readFile(filePath, 'utf8')
  }
})

const writeJson = async(filePath: string, value: unknown): Promise<void> => {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const readJsonObject = async(filePath: string): Promise<JsonObject> =>
  JSON.parse(await readFile(filePath, 'utf8')) as JsonObject

const createPack = async(
  root: string,
  directoryName: string,
  options: {
    id?: string
    version?: string
    gameVersion?: string
    engineApiVersion?: string
    contentSchemaVersion?: string
    dependencies?: readonly JsonObject[]
    optionalDependencies?: readonly JsonObject[]
    itemEntries?: readonly JsonObject[]
  } = {}
): Promise<void> => {
  const packRoot = path.join(root, directoryName)
  await cp(path.join(fixtureRoot, 'valid-gift-pack'), packRoot, { recursive: true })
  const packageId = options.id ?? directoryName.replace(/-/g, '_')
  const manifestPath = path.join(packRoot, 'manifest.json')
  const manifest = await readJsonObject(manifestPath)
  manifest.id = packageId
  manifest.name = { key: `${packageId}.package.name`, fallback: packageId }
  manifest.version = options.version ?? '1.0.0'
  manifest.gameVersion = options.gameVersion ?? manifest.gameVersion
  manifest.engineApiVersion = options.engineApiVersion ?? manifest.engineApiVersion
  manifest.contentSchemaVersion = options.contentSchemaVersion ?? manifest.contentSchemaVersion
  manifest.dependencies = [...(options.dependencies ?? [])]
  if (options.optionalDependencies !== undefined) {
    manifest.optionalDependencies = [...options.optionalDependencies]
  } else {
    delete manifest.optionalDependencies
  }
  delete manifest.conflicts
  manifest.entrypoints = { 'taoyuan:item': ['data/items.json'] }
  await writeJson(manifestPath, manifest)
  await writeJson(path.join(packRoot, 'data', 'items.json'), options.itemEntries ?? [
    {
      id: `${packageId}:linen_ribbon`,
      name: { key: `${packageId}.item.linen_ribbon.name`, fallback: 'Linen ribbon' },
      category: 'gift',
      description: { key: `${packageId}.item.linen_ribbon.description`, fallback: 'A test gift.' },
      sellPrice: 8,
      edible: false
    }
  ])
}

const discover = async(root: string): Promise<ThirdPartyDataPackDiscoveryReport> =>
  discoverThirdPartyDataPacks(root, createNodeFileSystem())

const officialCounts = (): { registryCount: number; entryCount: number; snapshotHash: string } => {
  const registrySet = buildOfficialRegistrySetFromStaticData()
  const snapshot = createSerializableRegistrySnapshot(registrySet)
  return {
    registryCount: registrySet.registryIds().length,
    entryCount: registrySet.registryIds().reduce(
      (total, registryId) => total + registrySet.get(registryId).entries().length,
      0
    ),
    snapshotHash: snapshot.snapshotHash
  }
}

describe('third-party data pack read-only selection', () => {
  it('produces a stable dependency-first load order independent of candidate input order', async() => {
    const root = await createRoot()
    await createPack(root, 'z-app', {
      id: 'z_app',
      dependencies: [{ id: 'a_library', version: '^1.0.0' }],
      optionalDependencies: [{ id: 'm_optional', version: '1.0.0' }]
    })
    await createPack(root, 'b-free', { id: 'b_free' })
    await createPack(root, 'm-optional', { id: 'm_optional' })
    await createPack(root, 'a-library', { id: 'a_library' })

    const report = await discover(root)
    const reversedReport: ThirdPartyDataPackDiscoveryReport = {
      ...report,
      candidates: [...report.candidates].reverse(),
      issues: [...report.issues].reverse()
    }

    expect(selectThirdPartyDataPacks(report).loadOrder).toEqual([
      'a_library',
      'b_free',
      'm_optional',
      'z_app'
    ])
    expect(selectThirdPartyDataPacks(reversedReport).loadOrder).toEqual([
      'a_library',
      'b_free',
      'm_optional',
      'z_app'
    ])
  })

  it('keeps warning-only missing optional dependencies selected', async() => {
    const root = await createRoot()
    await createPack(root, 'optional-warning', {
      id: 'optional_warning',
      optionalDependencies: [{ id: 'missing_optional', version: '^1.0.0' }]
    })

    const discoveryReport = await discover(root)
    const selectionReport = selectThirdPartyDataPacks(discoveryReport)

    expect(discoveryReport.issues).toContainEqual(expect.objectContaining({
      kind: 'optional-dependency-missing',
      severity: 'warning'
    }))
    expect(selectionReport.status).toBe('completed')
    expect(selectionReport.loadOrder).toEqual(['optional_warning'])
    expect(selectionReport.blockedPackages).toEqual([])
  })

  it('propagates blocked required dependencies without publishing dependents', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-library', {
      id: 'bad_library',
      itemEntries: [
        {
          id: 'bad_library:broken',
          name: { key: 'bad_library.item.broken.name', fallback: 'Broken' },
          category: 'gift',
          description: { key: 'bad_library.item.broken.description', fallback: 'Broken.' },
          sellPrice: -1,
          edible: false
        }
      ]
    })
    await createPack(root, 'dependent-app', {
      id: 'dependent_app',
      dependencies: [{ id: 'bad_library', version: '1.0.0' }]
    })

    const selectionReport = selectThirdPartyDataPacks(await discover(root))

    expect(selectionReport.status).toBe('blocked')
    expect(selectionReport.loadOrder).toEqual([])
    expect(selectionReport.blockedPackages).toEqual(expect.arrayContaining([
      expect.objectContaining({
        packageId: 'bad_library',
        reasons: ['discovery-blocked']
      }),
      expect.objectContaining({
        packageId: 'dependent_app',
        reasons: ['required-dependency-blocked']
      })
    ]))
    expect(selectionReport.issues).toContainEqual(expect.objectContaining({
      kind: 'required-dependency-blocked',
      packageId: 'dependent_app',
      relatedPackageIds: ['bad_library']
    }))
  })

  it('blocks every duplicate package id candidate instead of selecting by scan order', async() => {
    const root = await createRoot()
    await createPack(root, 'a-first', { id: 'duplicate_pack', version: '1.0.0' })
    await createPack(root, 'b-second', { id: 'duplicate_pack', version: '2.0.0' })

    const selectionReport = selectThirdPartyDataPacks(await discover(root))

    expect(selectionReport.status).toBe('blocked')
    expect(selectionReport.loadOrder).toEqual([])
    expect(selectionReport.blockedPackages).toHaveLength(2)
    expect(selectionReport.blockedPackages.map(candidate => candidate.reasons)).toEqual([
      ['duplicate-package-id'],
      ['discovery-blocked', 'duplicate-package-id']
    ])
    expect(selectionReport.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: 'duplicate-package-id',
        packageId: 'duplicate_pack'
      })
    ]))
  })

  it('propagates blocked duplicate package ids to required dependents', async() => {
    const root = await createRoot()
    await createPack(root, 'a-first-library', { id: 'duplicate_library', version: '1.0.0' })
    await createPack(root, 'b-second-library', { id: 'duplicate_library', version: '2.0.0' })
    await createPack(root, 'dependent-app', {
      id: 'dependent_app',
      dependencies: [{ id: 'duplicate_library', version: '^1.0.0' }]
    })

    const selectionReport = selectThirdPartyDataPacks(await discover(root))

    expect(selectionReport.status).toBe('blocked')
    expect(selectionReport.loadOrder).toEqual([])
    expect(selectionReport.blockedPackages).toEqual(expect.arrayContaining([
      expect.objectContaining({
        packageId: 'dependent_app',
        reasons: ['required-dependency-blocked']
      })
    ]))
    expect(selectionReport.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: 'required-dependency-blocked',
        packageId: 'dependent_app',
        relatedPackageIds: ['duplicate_library']
      })
    ]))
  })

  it('allows older game-version packages to continue into the staged selection attempt', async() => {
    const root = await createRoot()
    await createPack(root, 'legacy-library', {
      id: 'legacy_library',
      gameVersion: '2.3.0'
    })
    await createPack(root, 'dependent-app', {
      id: 'dependent_app',
      dependencies: [{ id: 'legacy_library', version: '1.0.0' }]
    })

    const selectionReport = selectThirdPartyDataPacks(await discover(root))

    expect(selectionReport.status).toBe('completed')
    expect(selectionReport.loadOrder).toEqual(['legacy_library', 'dependent_app'])
    expect(selectionReport.blockedPackages).toEqual([])
    expect(selectionReport.issues).toEqual([])
  })

  it('blocks forward-version packages and their required dependents before publication', async() => {
    const root = await createRoot()
    await createPack(root, 'future-game', {
      id: 'future_game',
      gameVersion: '3.0.0'
    })
    await createPack(root, 'future-engine', {
      id: 'future_engine',
      engineApiVersion: '2'
    })
    await createPack(root, 'future-schema', {
      id: 'future_schema',
      contentSchemaVersion: '2'
    })
    await createPack(root, 'dependent-app', {
      id: 'dependent_app',
      dependencies: [{ id: 'future_game', version: '1.0.0' }]
    })

    const selectionReport = selectThirdPartyDataPacks(await discover(root))

    expect(selectionReport.status).toBe('blocked')
    expect(selectionReport.loadOrder).toEqual([])
    expect(selectionReport.blockedPackages).toEqual(expect.arrayContaining([
      expect.objectContaining({
        packageId: 'future_game',
        reasons: ['host-version-incompatible']
      }),
      expect.objectContaining({
        packageId: 'future_engine',
        reasons: ['host-version-incompatible']
      }),
      expect.objectContaining({
        packageId: 'future_schema',
        reasons: ['host-version-incompatible']
      }),
      expect.objectContaining({
        packageId: 'dependent_app',
        reasons: ['required-dependency-blocked']
      })
    ]))
    expect(selectionReport.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: 'host-version-incompatible',
        packageId: 'future_game',
        fieldPath: '/gameVersion',
        diagnostics: [expect.objectContaining({ code: 'PKG-VERSION-001' })]
      }),
      expect.objectContaining({
        kind: 'host-version-incompatible',
        packageId: 'future_engine',
        fieldPath: '/engineApiVersion'
      }),
      expect.objectContaining({
        kind: 'host-version-incompatible',
        packageId: 'future_schema',
        fieldPath: '/contentSchemaVersion'
      }),
      expect.objectContaining({
        kind: 'required-dependency-blocked',
        packageId: 'dependent_app',
        relatedPackageIds: ['future_game']
      })
    ]))
  })

  it('diagnoses dependency cycles and returns the acyclic prefix only', async() => {
    const root = await createRoot()
    await createPack(root, 'a-cycle', {
      id: 'a_cycle',
      dependencies: [{ id: 'b_cycle', version: '1.0.0' }]
    })
    await createPack(root, 'b-cycle', {
      id: 'b_cycle',
      dependencies: [{ id: 'a_cycle', version: '1.0.0' }]
    })
    await createPack(root, 'c-free', { id: 'c_free' })

    const selectionReport = selectThirdPartyDataPacks(await discover(root))

    expect(selectionReport.status).toBe('blocked')
    expect(selectionReport.loadOrder).toEqual(['c_free'])
    expect(selectionReport.blockedPackages.map(candidate => candidate.packageId)).toEqual([
      'a_cycle',
      'b_cycle'
    ])
    expect(selectionReport.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: 'dependency-cycle',
        packageId: 'a_cycle',
        diagnostics: [expect.objectContaining({ code: 'PKG-DEPENDENCY-003' })]
      }),
      expect.objectContaining({
        kind: 'dependency-cycle',
        packageId: 'b_cycle'
      })
    ]))
  })

  it('treats compatible optional dependencies as ordering edges including cycles', async() => {
    const root = await createRoot()
    await createPack(root, 'a-optional-cycle', {
      id: 'a_optional_cycle',
      optionalDependencies: [{ id: 'b_optional_cycle', version: '1.0.0' }]
    })
    await createPack(root, 'b-optional-cycle', {
      id: 'b_optional_cycle',
      optionalDependencies: [{ id: 'a_optional_cycle', version: '1.0.0' }]
    })

    const selectionReport = selectThirdPartyDataPacks(await discover(root))

    expect(selectionReport.status).toBe('blocked')
    expect(selectionReport.loadOrder).toEqual([])
    expect(selectionReport.blockedPackages.map(candidate => candidate.packageId)).toEqual([
      'a_optional_cycle',
      'b_optional_cycle'
    ])
    expect(selectionReport.issues.map(issue => issue.kind)).toEqual([
      'dependency-cycle',
      'dependency-cycle'
    ])
  })

  it('does not mutate discovery reports and returns stable repeated results', async() => {
    const root = await createRoot()
    await createPack(root, 'library-pack', { id: 'library_pack' })
    await createPack(root, 'dependent-pack', {
      id: 'dependent_pack',
      dependencies: [{ id: 'library_pack', version: '1.0.0' }]
    })
    const discoveryReport = await discover(root)
    const before = JSON.stringify(discoveryReport)

    const first = selectThirdPartyDataPacks(discoveryReport)
    const second = selectThirdPartyDataPacks(discoveryReport)

    expect(JSON.stringify(discoveryReport)).toBe(before)
    expect(second).toEqual(first)
    expect(first.loadOrder).toEqual(['library_pack', 'dependent_pack'])
  })

  it('keeps official registry hashes unchanged while selecting third-party candidates', async() => {
    const before = officialCounts()
    const root = await createRoot()
    await createPack(root, 'valid-pack', { id: 'valid_pack' })

    const selectionReport = selectThirdPartyDataPacks(await discover(root))
    const after = officialCounts()

    expect(selectionReport.loadOrder).toEqual(['valid_pack'])
    expect(after).toEqual(before)
    expect(after).toEqual({
      registryCount: 54,
      entryCount: 4242,
      snapshotHash: committedMetadata.snapshotHash
    })
    expect(committedMetadata).toMatchObject({
      artifactHash: 'sha256:2948895f8961ff54df5ff91869fd4f07a16db6df1b3274fef921561be5f71732',
      contentHash: 'sha256:588d16eb0f16a193c0fc741fb73908ef0dc99549aff9a0d3b91dfd25c0ee985b',
      schemaSetHash: 'sha256:38c1ce55e1c5ac8f84089f1adf3e11a81ff486ac43db7ac8ec18a55fba11af26',
      environmentHash: 'sha256:4f52687194773d59c5c6260f6170bfa290c180d21d8bb24904bbcee1e3c5e22b',
      snapshotHash: 'sha256:4e87e4bc1d6310d4467335da77603006bf769fdb5c4da45ad927f7ed85a5c4b3'
    })
  })
})
