/// <reference types="node" />

import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { requirePackageId } from '@/domain/mods/ids'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDiscoveryDirectoryEntry,
  type ThirdPartyDiscoveryFileSystem
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import { selectThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackSelection'
import { buildThirdPartyCandidateRegistrySnapshot } from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackLockfileDraft,
  validateThirdPartyDataPackLockfileDraft,
  type ThirdPartyDataPackLockfileDraft
} from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const fixtureRoot = path.join(cwd(), 'src/tests/fixtures/mods/third-party-discovery')
const alternateHash = 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

type JsonObject = Record<string, unknown>

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})
const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-lockfile-draft-'))
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
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const createItem = (id: string, sellPrice = 8): JsonObject => ({
  id,
  name: { key: `${id}.name`, fallback: id },
  category: 'gift',
  description: { key: `${id}.description`, fallback: `${id} description` },
  sellPrice,
  edible: false
})

const createPack = async(
  root: string,
  directoryName: string,
  options: {
    id?: string
    version?: string
    dependencies?: readonly JsonObject[]
    optionalDependencies?: readonly JsonObject[]
    items?: readonly JsonObject[]
  } = {}
): Promise<void> => {
  const packageId = options.id ?? directoryName.replace(/-/g, '_')
  const packRoot = path.join(root, directoryName)
  await writeJson(path.join(packRoot, 'manifest.json'), {
    id: packageId,
    name: { key: `${packageId}.package.name`, fallback: packageId },
    version: options.version ?? '1.0.0',
    gameVersion: '2.4.0',
    engineApiVersion: '1',
    contentSchemaVersion: '1',
    defaultLocale: 'zh-CN',
    locales: { 'zh-CN': 'locales/zh-CN.json' },
    authors: [{ name: 'Lockfile Draft Tester', role: 'developer' }],
    license: 'MIT',
    dependencies: [...(options.dependencies ?? [])],
    ...(options.optionalDependencies ? { optionalDependencies: [...options.optionalDependencies] } : {}),
    entrypoints: { 'taoyuan:item': ['data/items.json'] }
  })
  await writeJson(path.join(packRoot, 'locales', 'zh-CN.json'), {})
  await writeJson(path.join(packRoot, 'data', 'items.json'), options.items ?? [
    createItem(`${packageId}:linen_ribbon`)
  ])
}

const collectFileContents = async(root: string): Promise<Record<string, string>> => {
  const result: Record<string, string> = {}
  const visit = async(directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        await visit(absolutePath)
      } else if (entry.isFile()) {
        result[path.relative(root, absolutePath).replace(/\\/g, '/')] = await readFile(absolutePath, 'utf8')
      }
    }
  }
  await visit(root)
  return result
}

const buildReportsFromRoot = async(root: string) => {
  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  const discoveryReport = await discoverThirdPartyDataPacks(root, createNodeFileSystem())
  const selectionReport = selectThirdPartyDataPacks(discoveryReport)
  const candidateSnapshot = buildThirdPartyCandidateRegistrySnapshot({
    officialRegistrySet,
    discoveryReport,
    selectionReport
  })
  const draftResult = createThirdPartyDataPackLockfileDraft({
    discoveryReport,
    selectionReport,
    candidateSnapshot
  })
  return { officialRegistrySet, discoveryReport, selectionReport, candidateSnapshot, draftResult }
}

const mutateDraft = (
  draft: ThirdPartyDataPackLockfileDraft,
  mutation: (draft: ThirdPartyDataPackLockfileDraft) => ThirdPartyDataPackLockfileDraft
): ThirdPartyDataPackLockfileDraft =>
  mutation(JSON.parse(JSON.stringify(draft)) as ThirdPartyDataPackLockfileDraft)

const expectOfficialBaseline = (): void => {
  const registrySet = buildOfficialRegistrySetFromStaticData()
  const snapshot = createSerializableRegistrySnapshot(registrySet)
  expect(registrySet.registryIds()).toHaveLength(54)
  expect(registrySet.registryIds().reduce(
    (total, registryId) => total + registrySet.get(registryId).entries().length,
    0
  )).toBe(4242)
  expect(snapshot.snapshotHash).toBe(committedMetadata.snapshotHash)
  expect(committedMetadata).toMatchObject({
    artifactHash: 'sha256:2948895f8961ff54df5ff91869fd4f07a16db6df1b3274fef921561be5f71732',
    contentHash: 'sha256:588d16eb0f16a193c0fc741fb73908ef0dc99549aff9a0d3b91dfd25c0ee985b',
    schemaSetHash: 'sha256:38c1ce55e1c5ac8f84089f1adf3e11a81ff486ac43db7ac8ec18a55fba11af26',
    environmentHash: 'sha256:4f52687194773d59c5c6260f6170bfa290c180d21d8bb24904bbcee1e3c5e22b',
    snapshotHash: 'sha256:4e87e4bc1d6310d4467335da77603006bf769fdb5c4da45ad927f7ed85a5c4b3'
  })
}

describe('third-party data pack lockfile draft', () => {
  it('creates a deterministic read-only draft for a valid candidate snapshot', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const first = await buildReportsFromRoot(root)
    const second = createThirdPartyDataPackLockfileDraft({
      discoveryReport: first.discoveryReport,
      selectionReport: first.selectionReport,
      candidateSnapshot: first.candidateSnapshot
    })

    expect(first.draftResult.status).toBe('valid')
    expect(first.draftResult.draft).toBeDefined()
    expect(second).toEqual(first.draftResult)
    expect(first.draftResult.draft).toMatchObject({
      formatVersion: 1,
      kind: 'third-party-data-pack-lockfile-draft',
      registryCount: 54,
      entryCount: 4244,
      selectedPackageIds: ['discovery_valid'],
      loadOrder: ['discovery_valid']
    })
    expect(first.draftResult.draft!.packages).toHaveLength(1)
    expect(first.draftResult.draft!.packages[0]).toMatchObject({
      packageId: 'discovery_valid',
      version: '1.0.0',
      loadIndex: 0,
      source: {
        candidatePath: 'valid-gift-pack',
        manifestPath: 'valid-gift-pack/manifest.json'
      },
      resolvedDependencies: []
    })
    expect(first.draftResult.draft!.packages[0]!.source.manifestPath).not.toMatch(/^[A-Za-z]:/)
    expect(first.draftResult.draft!.packages[0]!.contentHash).toMatch(/^sha256:/)
    expect(first.draftResult.draft!.lockfileHash).toMatch(/^sha256:/)
  }, 15_000)

  it('validates matching drafts against the current package set and official baseline', async() => {
    const root = await createRoot()
    await createPack(root, 'a-library', { id: 'a_library' })
    await createPack(root, 'z-app', {
      id: 'z_app',
      version: '2.0.0',
      dependencies: [{ id: 'a_library', version: '1.0.0' }]
    })
    const reports = await buildReportsFromRoot(root)

    const validation = validateThirdPartyDataPackLockfileDraft({
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot: reports.candidateSnapshot,
      draft: reports.draftResult.draft
    })

    expect(reports.draftResult.status).toBe('valid')
    expect(reports.draftResult.draft!.loadOrder).toEqual(['a_library', 'z_app'])
    expect(reports.draftResult.draft!.packages.map(pkg => pkg.packageId)).toEqual(['a_library', 'z_app'])
    expect(reports.draftResult.draft!.packages[1]!.resolvedDependencies).toEqual(['a_library'])
    expect(validation.status).toBe('valid')
    expect(validation.diagnostics).toEqual([])
  }, 15_000)

  it('diagnoses package id, version and load order mismatches', async() => {
    const root = await createRoot()
    await createPack(root, 'a-library', { id: 'a_library' })
    await createPack(root, 'z-app', {
      id: 'z_app',
      dependencies: [{ id: 'a_library', version: '1.0.0' }]
    })
    const reports = await buildReportsFromRoot(root)
    const draft = reports.draftResult.draft!

    const packageIdMismatch = validateThirdPartyDataPackLockfileDraft({
      ...reports,
      draft: mutateDraft(draft, current => ({
        ...current,
        selectedPackageIds: [requirePackageId('different_package')]
      }))
    })
    const versionMismatch = validateThirdPartyDataPackLockfileDraft({
      ...reports,
      draft: mutateDraft(draft, current => ({
        ...current,
        packages: current.packages.map(pkg =>
          pkg.packageId === 'z_app' ? { ...pkg, version: '9.9.9' } : pkg
        )
      }))
    })
    const loadOrderMismatch = validateThirdPartyDataPackLockfileDraft({
      ...reports,
      draft: mutateDraft(draft, current => ({
        ...current,
        loadOrder: [...current.loadOrder].reverse()
      }))
    })

    expect(packageIdMismatch.status).toBe('invalid')
    expect(packageIdMismatch.diagnostics).toContainEqual(expect.objectContaining({
      stage: 'third-party.lockfile-draft.package-set'
    }))
    expect(versionMismatch.status).toBe('invalid')
    expect(versionMismatch.diagnostics).toContainEqual(expect.objectContaining({
      stage: 'third-party.lockfile-draft.package-version',
      packageId: 'z_app',
      relatedPackageIds: ['z_app']
    }))
    expect(loadOrderMismatch.status).toBe('invalid')
    expect(loadOrderMismatch.diagnostics).toContainEqual(expect.objectContaining({
      stage: 'third-party.lockfile-draft.load-order'
    }))
  }, 15_000)

  it('diagnoses package content hash and official baseline mismatches', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })
    const reports = await buildReportsFromRoot(root)
    const draft = reports.draftResult.draft!

    const contentMismatch = validateThirdPartyDataPackLockfileDraft({
      ...reports,
      draft: mutateDraft(draft, current => ({
        ...current,
        packages: current.packages.map(pkg => ({
          ...pkg,
          contentHash: alternateHash
        }))
      }))
    })
    const officialMismatch = validateThirdPartyDataPackLockfileDraft({
      ...reports,
      draft: mutateDraft(draft, current => ({
        ...current,
        officialIdentity: {
          ...current.officialIdentity,
          snapshotHash: alternateHash
        }
      }))
    })

    expect(contentMismatch.status).toBe('invalid')
    expect(contentMismatch.diagnostics).toContainEqual(expect.objectContaining({
      stage: 'third-party.lockfile-draft.package-content-hash',
      packageId: 'discovery_valid',
      relatedPackageIds: ['discovery_valid']
    }))
    expect(officialMismatch.status).toBe('invalid')
    expect(officialMismatch.diagnostics).toContainEqual(expect.objectContaining({
      stage: 'third-party.lockfile-draft.official-baseline',
      fieldPath: '/officialIdentity/snapshotHash'
    }))
  }, 15_000)

  it('does not create a valid draft for invalid candidate snapshots', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-schema', {
      id: 'bad_schema',
      items: [createItem('bad_schema:broken', -1)]
    })

    const reports = await buildReportsFromRoot(root)

    expect(reports.candidateSnapshot.status).toBe('invalid')
    expect(reports.draftResult.status).toBe('invalid')
    expect(reports.draftResult.draft).toBeUndefined()
    expect(reports.draftResult.diagnostics).toContainEqual(expect.objectContaining({
      stage: 'third-party.lockfile-draft.candidate'
    }))
    expectOfficialBaseline()
  }, 15_000)

  it('handles the no third-party pack case explicitly', async() => {
    const root = await createRoot()

    const reports = await buildReportsFromRoot(root)
    const validation = validateThirdPartyDataPackLockfileDraft({
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot: reports.candidateSnapshot
    })

    expect(reports.candidateSnapshot.status).toBe('skipped')
    expect(reports.draftResult.status).toBe('skipped')
    expect(reports.draftResult.draft).toBeUndefined()
    expect(validation.status).toBe('valid')
    expect(validation.diagnostics).toEqual([])
    expectOfficialBaseline()
  }, 15_000)

  it('does not mutate reports, registries, saves, settings or files', async() => {
    const root = await createRoot()
    const packsRoot = path.join(root, 'packs')
    const userDataRoot = path.join(root, 'userdata')
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(packsRoot, 'valid-gift-pack'), { recursive: true })
    await mkdir(path.join(userDataRoot, 'Local Storage', 'leveldb'), { recursive: true })
    await writeFile(path.join(userDataRoot, 'settings.json'), '{"closeToTray":false}\n', 'utf8')
    await writeFile(path.join(userDataRoot, 'Local Storage', 'leveldb', 'save.ldb'), 'player-save-data', 'utf8')
    const filesBefore = await collectFileContents(root)

    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    const officialBefore = createSerializableRegistrySnapshot(officialRegistrySet)
    const discoveryReport = await discoverThirdPartyDataPacks(packsRoot, createNodeFileSystem())
    const selectionReport = selectThirdPartyDataPacks(discoveryReport)
    const candidateSnapshot = buildThirdPartyCandidateRegistrySnapshot({
      officialRegistrySet,
      discoveryReport,
      selectionReport
    })
    const discoveryBefore = JSON.stringify(discoveryReport)
    const selectionBefore = JSON.stringify(selectionReport)
    const candidateBefore = JSON.stringify(candidateSnapshot)

    const draftResult = createThirdPartyDataPackLockfileDraft({
      discoveryReport,
      selectionReport,
      candidateSnapshot
    })
    const validation = validateThirdPartyDataPackLockfileDraft({
      discoveryReport,
      selectionReport,
      candidateSnapshot,
      draft: draftResult.draft
    })

    expect(draftResult.status).toBe('valid')
    expect(validation.status).toBe('valid')
    expect(createSerializableRegistrySnapshot(officialRegistrySet)).toEqual(officialBefore)
    expect(JSON.stringify(discoveryReport)).toBe(discoveryBefore)
    expect(JSON.stringify(selectionReport)).toBe(selectionBefore)
    expect(JSON.stringify(candidateSnapshot)).toBe(candidateBefore)
    expect(await collectFileContents(root)).toEqual(filesBefore)
    expectOfficialBaseline()
  }, 15_000)

  it('keeps official precompiled baseline counts and hashes unchanged', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const reports = await buildReportsFromRoot(root)

    expect(reports.draftResult.status).toBe('valid')
    expect(reports.draftResult.officialIdentity).toMatchObject({
      registryCount: 54,
      entryCount: 4242,
      artifactHash: committedMetadata.artifactHash,
      contentHash: committedMetadata.contentHash,
      schemaSetHash: committedMetadata.schemaSetHash,
      environmentHash: committedMetadata.environmentHash,
      snapshotHash: committedMetadata.snapshotHash
    })
    expectOfficialBaseline()
  }, 15_000)
})
