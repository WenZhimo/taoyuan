/// <reference types="node" />

import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDiscoveryDirectoryEntry,
  type ThirdPartyDiscoveryFileSystem
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const fixtureRoot = path.join(cwd(), 'src/tests/fixtures/mods/third-party-discovery')

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-pack-discovery-'))
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

const createNodeFileSystem = (readPaths: string[] = []): ThirdPartyDiscoveryFileSystem => ({
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
    readPaths.push(filePath)
    return readFile(filePath, 'utf8')
  }
})

const countOfficialEntries = (): { registryCount: number; entryCount: number; snapshotHash: string } => {
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

type JsonObject = Record<string, unknown>

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
    omitDependencyFields?: boolean
    dependencies?: readonly JsonObject[]
    optionalDependencies?: readonly JsonObject[]
    conflicts?: readonly JsonObject[]
    itemEntries?: readonly JsonObject[]
  } = {}
): Promise<string> => {
  const packRoot = path.join(root, directoryName)
  await cp(path.join(fixtureRoot, 'valid-gift-pack'), packRoot, { recursive: true })
  const packageId = options.id ?? directoryName.replace(/-/g, '_')
  const manifestPath = path.join(packRoot, 'manifest.json')
  const manifest = await readJsonObject(manifestPath)
  manifest.id = packageId
  manifest.name = { key: `${packageId}.package.name`, fallback: packageId }
  manifest.version = options.version ?? '1.0.0'
  manifest.entrypoints = { 'taoyuan:item': ['data/items.json'] }
  if (options.omitDependencyFields) {
    delete manifest.dependencies
    delete manifest.optionalDependencies
    delete manifest.conflicts
  } else {
    manifest.dependencies = [...(options.dependencies ?? [])]
    if (options.optionalDependencies !== undefined) {
      manifest.optionalDependencies = [...options.optionalDependencies]
    } else {
      delete manifest.optionalDependencies
    }
    if (options.conflicts !== undefined) {
      manifest.conflicts = [...options.conflicts]
    } else {
      delete manifest.conflicts
    }
  }
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
  return packRoot
}

describe('third-party data pack read-only discovery', () => {
  it('reports missing and empty discovery roots without throwing', async() => {
    const root = await createRoot()
    const fileSystem = createNodeFileSystem()

    const missing = await discoverThirdPartyDataPacks(path.join(root, 'missing'), fileSystem)
    expect(missing.status).toBe('directory-not-found')
    expect(missing.candidates).toEqual([])
    expect(missing.issues.map(issue => issue.kind)).toEqual(['directory-not-found'])

    const emptyRoot = path.join(root, 'empty')
    await mkdir(emptyRoot)
    const empty = await discoverThirdPartyDataPacks(emptyRoot, fileSystem)
    expect(empty.status).toBe('empty')
    expect(empty.candidates).toEqual([])
    expect(empty.issues.map(issue => issue.kind)).toEqual(['empty-directory'])
  })

  it('discovers valid packages and reports each invalid package class deterministically', async() => {
    const report = await discoverThirdPartyDataPacks(fixtureRoot, createNodeFileSystem())

    expect(report.status).toBe('completed')
    expect(report.summary).toMatchObject({
      scannedEntries: 9,
      candidateCount: 8,
      validPackageCount: 1,
      invalidPackageCount: 7
    })
    expect(report.issues.map(issue => issue.kind)).toEqual(expect.arrayContaining([
      'non-json-file',
      'schema-validation-failed',
      'json-parse-failed',
      'content-file-missing',
      'missing-manifest',
      'path-unsafe',
      'unsupported-registry'
    ]))

    const valid = report.candidates.find(candidate => candidate.path === 'valid-gift-pack')
    expect(valid).toMatchObject({
      status: 'valid',
      packageId: 'discovery_valid',
      contentFiles: [
        { registryId: 'taoyuan:item', path: 'data/items.json', entryCount: 1 },
        { registryId: 'taoyuan:tag', path: 'data/tags.json', entryCount: 1 }
      ]
    })

    const badSchema = report.candidates.find(candidate => candidate.path === 'bad-schema-pack')
    expect(badSchema?.status).toBe('invalid')
    expect(badSchema?.contentFiles).toEqual([])
    expect(badSchema?.issues).toContainEqual(expect.objectContaining({
      kind: 'schema-validation-failed',
      path: 'bad-schema-pack/data/items.json',
      fieldPath: '/0/sellPrice'
    }))

    const invalidJson = report.candidates.find(candidate => candidate.path === 'invalid-json-pack')
    expect(invalidJson?.issues).toContainEqual(expect.objectContaining({
      kind: 'json-parse-failed',
      path: 'invalid-json-pack/data/items.json'
    }))

    const missingContent = report.candidates.find(candidate => candidate.path === 'missing-content-pack')
    expect(missingContent?.issues).toContainEqual(expect.objectContaining({
      kind: 'content-file-missing',
      path: 'missing-content-pack/data/missing-items.json'
    }))

    const noManifest = report.candidates.find(candidate => candidate.path === 'no-manifest-pack')
    expect(noManifest?.issues).toContainEqual(expect.objectContaining({
      kind: 'missing-manifest',
      path: 'no-manifest-pack/manifest.json'
    }))

    const unsupportedRegistry = report.candidates.find(candidate => candidate.path === 'unsupported-registry-pack')
    expect(unsupportedRegistry?.issues).toContainEqual(expect.objectContaining({
      kind: 'unsupported-registry',
      path: 'unsupported-registry-pack/manifest.json',
      registryId: 'example_mod:unknown_registry'
    }))

    for (const issue of report.issues) {
      expect(issue.path).not.toContain(fixtureRoot)
      for (const diagnostic of issue.diagnostics) {
        expect(diagnostic.file).not.toContain(fixtureRoot)
      }
    }
  })

  it('accepts legacy manifests that omit dependency fields', async() => {
    const root = await createRoot()
    await createPack(root, 'legacy-manifest-pack', {
      id: 'legacy_manifest',
      omitDependencyFields: true
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.summary).toMatchObject({
      validPackageCount: 1,
      invalidPackageCount: 0,
      issueCount: 0
    })
    expect(report.candidates[0]?.manifest?.dependencies).toBeUndefined()
  })

  it('accepts exact, minimum and caret dependency ranges when the target package satisfies them', async() => {
    const root = await createRoot()
    await createPack(root, 'library-pack', { id: 'library_pack', version: '1.2.3' })
    await createPack(root, 'exact-dependent', {
      id: 'exact_dependent',
      dependencies: [{ id: 'library_pack', version: '1.2.3' }]
    })
    await createPack(root, 'minimum-dependent', {
      id: 'minimum_dependent',
      dependencies: [{ id: 'library_pack', version: '>=1.0.0' }]
    })
    await createPack(root, 'caret-dependent', {
      id: 'caret_dependent',
      dependencies: [{ id: 'library_pack', version: '^1.0.0' }]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.summary).toMatchObject({
      candidateCount: 4,
      validPackageCount: 4,
      invalidPackageCount: 0,
      issueCount: 0
    })
  })

  it('reports missing and mismatched required dependencies as blocking errors', async() => {
    const root = await createRoot()
    await createPack(root, 'missing-dependent', {
      id: 'missing_dependent',
      dependencies: [{ id: 'missing_library', version: '1.0.0' }]
    })
    await createPack(root, 'old-library', { id: 'old_library', version: '2.0.0' })
    await createPack(root, 'mismatch-dependent', {
      id: 'mismatch_dependent',
      dependencies: [{ id: 'old_library', version: '^1.0.0' }]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'dependency-missing',
      packageId: 'missing_dependent',
      relatedPackageIds: ['missing_library'],
      severity: 'error'
    }))
    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'dependency-version-mismatch',
      packageId: 'mismatch_dependent',
      relatedPackageIds: ['old_library'],
      severity: 'error'
    }))
    expect(report.summary.invalidPackageCount).toBe(2)
  })

  it('keeps missing optional dependencies as warnings but blocks optional version mismatches', async() => {
    const root = await createRoot()
    await createPack(root, 'optional-warning', {
      id: 'optional_warning',
      optionalDependencies: [{ id: 'missing_optional', version: '^1.0.0' }]
    })
    await createPack(root, 'optional-library', { id: 'optional_library', version: '2.0.0' })
    await createPack(root, 'optional-mismatch', {
      id: 'optional_mismatch',
      optionalDependencies: [{ id: 'optional_library', version: '^1.0.0' }]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'optional-dependency-missing',
      packageId: 'optional_warning',
      severity: 'warning'
    }))
    expect(report.candidates.find(candidate => candidate.packageId === 'optional_warning')?.status).toBe('valid')
    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'dependency-version-mismatch',
      packageId: 'optional_mismatch',
      severity: 'error'
    }))
    expect(report.candidates.find(candidate => candidate.packageId === 'optional_mismatch')?.status).toBe('invalid')
  })

  it('reports explicit package conflicts as blocking diagnostics', async() => {
    const root = await createRoot()
    await createPack(root, 'conflicted-library', { id: 'conflicted_library', version: '1.5.0' })
    await createPack(root, 'conflict-declarer', {
      id: 'conflict_declarer',
      conflicts: [{ id: 'conflicted_library', version: '^1.0.0' }]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'package-conflict',
      packageId: 'conflict_declarer',
      relatedPackageIds: ['conflicted_library'],
      severity: 'error'
    }))
    expect(report.summary.invalidPackageCount).toBe(1)
  })

  it('reports same-package duplicate registry entry ids as blocking errors', async() => {
    const root = await createRoot()
    const duplicateItem = {
      id: 'duplicate_pack:shared_item',
      name: { key: 'duplicate.item.name', fallback: 'Shared item' },
      category: 'gift',
      description: { key: 'duplicate.item.description', fallback: 'Duplicate test item.' },
      sellPrice: 10,
      edible: false
    }
    await createPack(root, 'duplicate-pack', {
      id: 'duplicate_pack',
      itemEntries: [
        duplicateItem,
        { ...duplicateItem, sellPrice: 11 }
      ]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'registry-entry-duplicate',
      packageId: 'duplicate_pack',
      registryId: 'taoyuan:item',
      contentId: 'duplicate_pack:shared_item',
      severity: 'error'
    }))
    expect(report.candidates[0]?.status).toBe('invalid')
  })

  it('reports cross-package registry conflicts and identical duplicates separately', async() => {
    const root = await createRoot()
    const sharedItem = {
      id: 'shared_namespace:festival_token',
      name: { key: 'shared.item.name', fallback: 'Festival token' },
      category: 'gift',
      description: { key: 'shared.item.description', fallback: 'Shared test item.' },
      sellPrice: 10,
      edible: false
    }
    await createPack(root, 'a-first-shared', { id: 'first_shared', itemEntries: [sharedItem] })
    await createPack(root, 'b-identical-shared', { id: 'identical_shared', itemEntries: [sharedItem] })
    await createPack(root, 'c-conflicting-shared', {
      id: 'conflicting_shared',
      itemEntries: [{ ...sharedItem, sellPrice: 99 }]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'registry-entry-duplicate-identical',
      packageId: 'identical_shared',
      registryId: 'taoyuan:item',
      contentId: 'shared_namespace:festival_token',
      severity: 'warning'
    }))
    expect(report.candidates.find(candidate => candidate.packageId === 'identical_shared')?.status).toBe('valid')
    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'registry-entry-conflict',
      packageId: 'conflicting_shared',
      registryId: 'taoyuan:item',
      contentId: 'shared_namespace:festival_token',
      severity: 'error'
    }))
    expect(report.candidates.find(candidate => candidate.packageId === 'conflicting_shared')?.status).toBe('invalid')
  })

  it('keeps official registry counts and hashes unchanged after scanning invalid third-party packages', async() => {
    const before = countOfficialEntries()
    const report = await discoverThirdPartyDataPacks(fixtureRoot, createNodeFileSystem())
    const after = countOfficialEntries()

    expect(report.summary.invalidPackageCount).toBeGreaterThan(0)
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

  it('does not read or modify player data while discovering package candidates', async() => {
    const root = await createRoot()
    const modsRoot = path.join(root, 'mods')
    const userDataRoot = path.join(root, 'userdata')
    const settingsPath = path.join(userDataRoot, 'settings.json')
    const savePath = path.join(userDataRoot, 'Local Storage', 'leveldb', 'save.ldb')
    await mkdir(path.dirname(savePath), { recursive: true })
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(modsRoot, 'valid-gift-pack'), { recursive: true })
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const readPaths: string[] = []

    const report = await discoverThirdPartyDataPacks(modsRoot, createNodeFileSystem(readPaths))

    expect(report.summary.validPackageCount).toBe(1)
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(readPaths.map(item => item.replace(/\\/g, '/')))
      .not.toEqual(expect.arrayContaining([
        expect.stringContaining('/userdata/')
      ]))
  })

  it('does not read unrelated large files in a mixed package directory', async() => {
    const root = await createRoot()
    const modsRoot = path.join(root, 'mods')
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(modsRoot, 'valid-gift-pack'), { recursive: true })
    await writeFile(path.join(modsRoot, 'large-video.bin'), 'x'.repeat(1024 * 1024), 'utf8')
    for (let index = 0; index < 500; index += 1) {
      await writeFile(path.join(modsRoot, `note-${index}.txt`), 'skip', 'utf8')
    }
    const readPaths: string[] = []

    const startedAt = performance.now()
    const report = await discoverThirdPartyDataPacks(modsRoot, createNodeFileSystem(readPaths))
    const durationMs = performance.now() - startedAt

    expect(report.summary.validPackageCount).toBe(1)
    expect(report.summary.scannedEntries).toBe(502)
    expect(durationMs).toBeLessThan(2_500)
    expect(readPaths.map(item => path.basename(item)).sort()).toEqual([
      'items.json',
      'manifest.json',
      'tags.json'
    ])
  }, 30_000)

  it('does not follow symbolic link candidates', async() => {
    let readAttempted = false
    const fileSystem: ThirdPartyDiscoveryFileSystem = {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory' }
        return null
      },
      async readDirectory() {
        return [{ name: 'linked-pack', kind: 'directory', isSymbolicLink: true }]
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('symlink candidate must not be read')
      }
    }

    const report = await discoverThirdPartyDataPacks('mods', fileSystem)

    expect(readAttempted).toBe(false)
    expect(report.candidates).toEqual([])
    expect(report.issues).toEqual([
      expect.objectContaining({
        kind: 'path-unsafe',
        path: 'linked-pack',
        severity: 'fatal'
      })
    ])
  })
})
