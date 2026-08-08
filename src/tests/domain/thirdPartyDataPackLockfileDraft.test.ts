/// <reference types="node" />

import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import type { JsonValue } from '@/domain/mods/canonicalJson'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId } from '@/domain/mods/ids'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { ThirdPartyDataPackLockfileDraftSchema } from '@/domain/mods/schemas'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDiscoveryDirectoryEntry,
  type ThirdPartyDiscoveryFileSystem
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import { selectThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackSelection'
import {
  buildThirdPartyCandidateRegistrySnapshot,
  type ThirdPartyCandidateRegistrySnapshotResult
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
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
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

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

const createMutableCandidateIdentityFixture = (
  snapshot: ThirdPartyCandidateRegistrySnapshotResult
): ThirdPartyCandidateRegistrySnapshotResult => ({
  ...snapshot,
  officialIdentity: { ...snapshot.officialIdentity },
  ...(snapshot.candidateIdentity ? { candidateIdentity: { ...snapshot.candidateIdentity } } : {})
})

const mutateDraft = (
  draft: ThirdPartyDataPackLockfileDraft,
  mutation: (draft: ThirdPartyDataPackLockfileDraft) => ThirdPartyDataPackLockfileDraft
): ThirdPartyDataPackLockfileDraft =>
  mutation(JSON.parse(JSON.stringify(draft)) as ThirdPartyDataPackLockfileDraft)

const cloneDraftAsJson = (draft: ThirdPartyDataPackLockfileDraft): JsonObject =>
  JSON.parse(JSON.stringify(draft)) as JsonObject

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

  it('freezes exposed lockfile draft and validation output graphs', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const reports = await buildReportsFromRoot(root)
    const validation = validateThirdPartyDataPackLockfileDraft({
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot: reports.candidateSnapshot,
      draft: reports.draftResult.draft
    })
    const missingDraftValidation = validateThirdPartyDataPackLockfileDraft({
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot: reports.candidateSnapshot
    })
    const draftResult = reports.draftResult
    const draft = draftResult.draft!
    const firstPackage = draft.packages[0]!
    const firstContentFile = firstPackage.contentFiles[0]!
    const firstContentEntry = firstContentFile.entries[0]!
    const beforeMutation = JSON.stringify({
      draftResult,
      validation,
      missingDraftValidation
    })

    expect(draftResult.status).toBe('valid')
    expect(validation.status).toBe('valid')
    expect(missingDraftValidation.status).toBe('invalid')
    expect(Object.isFrozen(draftResult)).toBe(true)
    expect(Object.isFrozen(draftResult.diagnostics)).toBe(true)
    expect(Object.isFrozen(draftResult.selectedPackageIds)).toBe(true)
    expect(Object.isFrozen(draftResult.blockedPackageIds)).toBe(true)
    expect(Object.isFrozen(draftResult.loadOrder)).toBe(true)
    expect(Object.isFrozen(draftResult.officialIdentity)).toBe(true)
    expect(Object.isFrozen(draftResult.candidateIdentity)).toBe(true)
    expect(Object.isFrozen(draft)).toBe(true)
    expect(Object.isFrozen(draft.officialIdentity)).toBe(true)
    expect(Object.isFrozen(draft.candidateIdentity)).toBe(true)
    expect(Object.isFrozen(draft.selectedPackageIds)).toBe(true)
    expect(Object.isFrozen(draft.loadOrder)).toBe(true)
    expect(Object.isFrozen(draft.packages)).toBe(true)
    expect(Object.isFrozen(firstPackage)).toBe(true)
    expect(Object.isFrozen(firstPackage.source)).toBe(true)
    expect(Object.isFrozen(firstPackage.source.contentFiles)).toBe(true)
    expect(Object.isFrozen(firstPackage.resolvedDependencies)).toBe(true)
    expect(Object.isFrozen(firstPackage.contentFiles)).toBe(true)
    expect(Object.isFrozen(firstContentFile)).toBe(true)
    expect(Object.isFrozen(firstContentFile.entries)).toBe(true)
    expect(Object.isFrozen(firstContentEntry)).toBe(true)
    expect(Object.isFrozen(validation)).toBe(true)
    expect(Object.isFrozen(validation.diagnostics)).toBe(true)
    expect(Object.isFrozen(validation.expectedDraft)).toBe(true)
    expect(Object.isFrozen(missingDraftValidation)).toBe(true)
    expect(Object.isFrozen(missingDraftValidation.diagnostics)).toBe(true)
    expect(Object.isFrozen(missingDraftValidation.diagnostics[0])).toBe(true)
    expect(Object.isFrozen(missingDraftValidation.diagnostics[0]?.details)).toBe(true)
    expect(Object.isFrozen(missingDraftValidation.expectedDraft)).toBe(true)

    expect(() => (draftResult.selectedPackageIds as unknown as unknown[]).push('mutated_pack')).toThrow(TypeError)
    expect(() => (draft.loadOrder as unknown as unknown[]).push('mutated_pack')).toThrow(TypeError)
    expect(() => (draft.packages as unknown as unknown[]).push({})).toThrow(TypeError)
    expect(() => (firstPackage.source.contentFiles as unknown as unknown[]).push('mutated.json')).toThrow(TypeError)
    expect(() => (firstPackage.resolvedDependencies as unknown as unknown[]).push('mutated_pack')).toThrow(TypeError)
    expect(() => (firstContentFile.entries as unknown as unknown[]).push({})).toThrow(TypeError)
    expect(Reflect.set(draftResult.officialIdentity as unknown as Record<string, unknown>, 'registryCount', 1)).toBe(false)
    expect(Reflect.set(draft.candidateIdentity as unknown as Record<string, unknown>, 'candidateHash', alternateHash)).toBe(false)
    expect(Reflect.set(firstPackage.source as unknown as Record<string, unknown>, 'manifestPath', 'mutated.json')).toBe(false)
    expect(Reflect.set(firstContentEntry as unknown as Record<string, unknown>, 'contentId', 'mutated:item')).toBe(false)
    expect(Reflect.set(missingDraftValidation.diagnostics[0] as unknown as Record<string, unknown>, 'stage', 'mutated')).toBe(false)
    expect(Reflect.set(missingDraftValidation.diagnostics[0]?.details as unknown as Record<string, unknown>, 'reason', 'mutated')).toBe(false)

    expect(JSON.stringify({
      draftResult,
      validation,
      missingDraftValidation
    })).toBe(beforeMutation)

    const skippedRoot = await createRoot()
    const skippedReports = await buildReportsFromRoot(skippedRoot)

    expect(skippedReports.draftResult.status).toBe('skipped')
    expect(Object.isFrozen(skippedReports.draftResult)).toBe(true)
    expect(Object.isFrozen(skippedReports.draftResult.diagnostics)).toBe(true)
    expect(Object.isFrozen(skippedReports.draftResult.selectedPackageIds)).toBe(true)
    expect(Object.isFrozen(skippedReports.draftResult.blockedPackageIds)).toBe(true)
    expect(Object.isFrozen(skippedReports.draftResult.loadOrder)).toBe(true)
    expect(Object.isFrozen(skippedReports.draftResult.officialIdentity)).toBe(true)
    expect(skippedReports.draftResult.draft).toBeUndefined()

    const invalidRoot = await createRoot()
    await createPack(invalidRoot, 'bad-schema', {
      id: 'bad_schema',
      items: [createItem('bad_schema:broken', -1)]
    })
    const invalidReports = await buildReportsFromRoot(invalidRoot)

    expect(invalidReports.draftResult.status).toBe('invalid')
    expect(Object.isFrozen(invalidReports.draftResult)).toBe(true)
    expect(Object.isFrozen(invalidReports.draftResult.diagnostics)).toBe(true)
    expect(invalidReports.draftResult.diagnostics.length).toBeGreaterThan(0)
    expect(invalidReports.draftResult.diagnostics.every(diagnostic => Object.isFrozen(diagnostic))).toBe(true)
    expect(invalidReports.draftResult.diagnostics.every(diagnostic =>
      diagnostic.details === undefined || Object.isFrozen(diagnostic.details)
    )).toBe(true)
    expect(invalidReports.draftResult.draft).toBeUndefined()
    expectOfficialBaseline()
  }, 15_000)

  it('validates generated drafts through the internal TypeBox schema candidate', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })
    const reports = await buildReportsFromRoot(root)

    const schemaResult = validateUnknown(ThirdPartyDataPackLockfileDraftSchema, reports.draftResult.draft, {
      stage: 'test.lockfile-draft.schema',
      file: 'third-party-data-pack-lockfile-draft.schema.json'
    })

    expect(reports.draftResult.status).toBe('valid')
    expect(schemaResult.ok).toBe(true)
  }, 15_000)

  it('rejects non-object draft input before semantic validation', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })
    const reports = await buildReportsFromRoot(root)

    const validation = validateThirdPartyDataPackLockfileDraft({
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot: reports.candidateSnapshot,
      draft: 'not a lockfile draft'
    })

    expect(validation.status).toBe('invalid')
    expect(validation.expectedDraft).toEqual(reports.draftResult.draft)
    expect(validation.diagnostics).toContainEqual(expect.objectContaining({
      code: 'SCHEMA-VALIDATE-001',
      stage: 'third-party.lockfile-draft.schema',
      fieldPath: '/'
    }))
  }, 15_000)

  it('rejects malformed draft shapes before comparing lockfile semantics', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })
    const reports = await buildReportsFromRoot(root)
    const draft = reports.draftResult.draft!

    const withExtraProperty = cloneDraftAsJson(draft)
    withExtraProperty.unexpected = true

    const withInvalidPackageId = cloneDraftAsJson(draft)
    withInvalidPackageId.selectedPackageIds = ['Invalid Package!']

    const withInvalidHash = cloneDraftAsJson(draft)
    withInvalidHash.lockfileHash = 'sha256:not-a-real-hash'

    const withUnsafeDotDotPath = cloneDraftAsJson(draft)
    const dotDotPackages = withUnsafeDotDotPath.packages as JsonObject[]
    const dotDotSource = dotDotPackages[0]!.source as JsonObject
    dotDotSource.candidatePath = '../valid-gift-pack'

    const withUnsafeDrivePath = cloneDraftAsJson(draft)
    const drivePackages = withUnsafeDrivePath.packages as JsonObject[]
    const driveSource = drivePackages[0]!.source as JsonObject
    driveSource.manifestPath = 'C:/mods/valid-gift-pack/manifest.json'

    const withUnsafeBackslashPath = cloneDraftAsJson(draft)
    const backslashPackages = withUnsafeBackslashPath.packages as JsonObject[]
    const backslashSource = backslashPackages[0]!.source as JsonObject
    backslashSource.contentFiles = ['valid-gift-pack\\data\\items.json']

    const cases: Array<{ readonly value: unknown; readonly fieldPath: string }> = [
      { value: withExtraProperty, fieldPath: '/unexpected' },
      { value: withInvalidPackageId, fieldPath: '/selectedPackageIds/0' },
      { value: withInvalidHash, fieldPath: '/lockfileHash' },
      { value: withUnsafeDotDotPath, fieldPath: '/packages/0/source/candidatePath' },
      { value: withUnsafeDrivePath, fieldPath: '/packages/0/source/manifestPath' },
      { value: withUnsafeBackslashPath, fieldPath: '/packages/0/source/contentFiles/0' }
    ]

    for (const testCase of cases) {
      const validation = validateThirdPartyDataPackLockfileDraft({
        discoveryReport: reports.discoveryReport,
        selectionReport: reports.selectionReport,
        candidateSnapshot: reports.candidateSnapshot,
        draft: testCase.value
      })

      expect(validation.status).toBe('invalid')
      expect(validation.diagnostics).toContainEqual(expect.objectContaining({
        code: 'SCHEMA-VALIDATE-001',
        stage: 'third-party.lockfile-draft.schema',
        fieldPath: testCase.fieldPath
      }))
    }
  }, 15_000)

  it('keeps host-path draft values out of schema validation diagnostics', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })
    const reports = await buildReportsFromRoot(root)
    const draft = cloneDraftAsJson(reports.draftResult.draft!)
    const packages = draft.packages as JsonObject[]
    const source = packages[0]!.source as JsonObject
    let hostileToStringRead = false
    const hostilePathObject = {
      toString() {
        hostileToStringRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/lockfile-schema-to-string')
      }
    }

    source.candidatePath = 'C:/Users/LENOVO/mods/lockfile-schema-path'
    source.manifestPath = hostilePathObject

    const validation = validateThirdPartyDataPackLockfileDraft({
      ...reports,
      draft
    })

    expect(validation.status).toBe('invalid')
    expect(hostileToStringRead).toBe(false)
    expect(validation.diagnostics).toContainEqual(expect.objectContaining({
      code: 'SCHEMA-VALIDATE-001',
      stage: 'third-party.lockfile-draft.schema',
      fieldPath: '/packages/0/source/candidatePath'
    }))
    expect(validation.diagnostics).toContainEqual(expect.objectContaining({
      code: 'SCHEMA-VALIDATE-001',
      stage: 'third-party.lockfile-draft.schema',
      fieldPath: '/packages/0/source/manifestPath'
    }))
    expect(JSON.stringify(validation)).not.toContain('C:/Users')
    expect(JSON.stringify(validation)).not.toContain('LENOVO')
    expect(JSON.stringify(validation)).not.toContain('lockfile-schema-path')
    expect(JSON.stringify(validation)).not.toContain('lockfile-schema-to-string')
    expectOfficialBaseline()
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

  it('copies upstream identity summaries before exposing draft reports', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const reports = await buildReportsFromRoot(root)
    const candidateSnapshot = createMutableCandidateIdentityFixture(reports.candidateSnapshot)
    const draftResult = createThirdPartyDataPackLockfileDraft({
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot
    })
    const draft = draftResult.draft!
    const originalCandidateHash = draftResult.candidateIdentity?.candidateHash
    const originalLockfileHash = draft.lockfileHash

    expect(draftResult.status).toBe('valid')
    expect(draftResult.officialIdentity).toEqual(candidateSnapshot.officialIdentity)
    expect(draftResult.candidateIdentity).toEqual(candidateSnapshot.candidateIdentity)
    expect(draft.officialIdentity).toEqual(candidateSnapshot.officialIdentity)
    expect(draft.candidateIdentity).toEqual(candidateSnapshot.candidateIdentity)
    expect(draftResult.officialIdentity).not.toBe(candidateSnapshot.officialIdentity)
    expect(draftResult.candidateIdentity).not.toBe(candidateSnapshot.candidateIdentity)
    expect(draft.officialIdentity).not.toBe(candidateSnapshot.officialIdentity)
    expect(draft.candidateIdentity).not.toBe(candidateSnapshot.candidateIdentity)
    expect(draft.officialIdentity).not.toBe(draftResult.officialIdentity)
    expect(draft.candidateIdentity).not.toBe(draftResult.candidateIdentity)
    expect(originalCandidateHash).toMatch(/^sha256:/)

    const mutableOfficialIdentity = candidateSnapshot.officialIdentity as { registryCount: number }
    const mutableCandidateIdentity = candidateSnapshot.candidateIdentity as { candidateHash: Sha256Hash }
    mutableOfficialIdentity.registryCount = 1
    mutableCandidateIdentity.candidateHash = testHash('6')

    expect(draftResult.officialIdentity.registryCount).toBe(54)
    expect(draftResult.candidateIdentity?.candidateHash).toBe(originalCandidateHash)
    expect(draft.officialIdentity.registryCount).toBe(54)
    expect(draft.candidateIdentity.candidateHash).toBe(originalCandidateHash)
    expect(draft.lockfileHash).toBe(originalLockfileHash)
    expectOfficialBaseline()
  }, 15_000)

  it('copies upstream candidate snapshot diagnostics before exposing draft reports', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const reports = await buildReportsFromRoot(root)
    let inheritedHostPathRead = false
    const inheritedDetailsPrototype = {}
    Object.defineProperty(inheritedDetailsPrototype, 'hostPath', {
      enumerable: true,
      get() {
        inheritedHostPathRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/lockfile-draft-diagnostic-detail')
      }
    })
    const diagnosticDetails = Object.assign(Object.create(inheritedDetailsPrototype), {
      reason: 'candidate warning',
      nested: {
        status: 'original',
        values: ['first', { stable: true }]
      }
    })
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'test.lockfile-draft.upstream',
      severity: 'warning',
      packageId: requirePackageId('discovery_valid'),
      relatedPackageIds: [requirePackageId('discovery_valid')],
      details: diagnosticDetails
    })
    const candidateSnapshot = {
      ...reports.candidateSnapshot,
      diagnostics: [upstreamDiagnostic]
    }

    const draftResult = createThirdPartyDataPackLockfileDraft({
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot
    })

    expect(draftResult.status).toBe('valid')
    expect(draftResult.diagnostics).toEqual([upstreamDiagnostic])
    expect(draftResult.diagnostics[0]).not.toBe(upstreamDiagnostic)
    expect(draftResult.diagnostics[0]!.relatedPackageIds).not.toBe(upstreamDiagnostic.relatedPackageIds)
    expect(draftResult.diagnostics[0]!.details).not.toBe(upstreamDiagnostic.details)
    expect(draftResult.diagnostics[0]!.details).not.toHaveProperty('hostPath')
    expect(inheritedHostPathRead).toBe(false)

    upstreamDiagnostic.stage = 'mutated'
    upstreamDiagnostic.relatedPackageIds!.push(requirePackageId('other_package'))
    const mutableDetails = upstreamDiagnostic.details as {
      reason: string
      nested: {
        status: string
        values: Array<string | { stable: boolean }>
      }
    }
    mutableDetails.reason = 'mutated'
    mutableDetails.nested.status = 'mutated'
    const nestedObject = mutableDetails.nested.values[1] as { stable: boolean }
    nestedObject.stable = false

    expect(draftResult.diagnostics[0]).toMatchObject({
      stage: 'test.lockfile-draft.upstream',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'candidate warning',
        nested: {
          status: 'original',
          values: ['first', { stable: true }]
        }
      }
    })
    expect(JSON.stringify(draftResult)).not.toContain('lockfile-draft-diagnostic-detail')
    expectOfficialBaseline()
  }, 15_000)

  it('ignores own accessor candidate snapshot diagnostic details before exposing draft reports', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const reports = await buildReportsFromRoot(root)
    let ownDetailsRead = false
    const listDetails = ['first', 'placeholder'] as JsonValue[]
    Object.defineProperty(listDetails, '1', {
      enumerable: true,
      get() {
        ownDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/lockfile-draft-list-diagnostic-detail')
      }
    })
    const nestedDetails: Record<string, JsonValue> = { marker: 'original' }
    Object.defineProperty(nestedDetails, 'ownHostPath', {
      enumerable: true,
      get() {
        ownDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/lockfile-draft-nested-diagnostic-detail')
      }
    })
    const diagnosticDetails = {
      reason: 'candidate warning',
      nested: nestedDetails,
      list: listDetails
    } as Record<string, JsonValue>
    Object.defineProperty(diagnosticDetails, 'ownHostPath', {
      enumerable: true,
      get() {
        ownDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/lockfile-draft-own-diagnostic-detail')
      }
    })
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'test.lockfile-draft.own-accessor',
      severity: 'warning',
      packageId: requirePackageId('discovery_valid'),
      relatedPackageIds: [requirePackageId('discovery_valid')],
      details: diagnosticDetails
    })
    const candidateSnapshot = {
      ...reports.candidateSnapshot,
      diagnostics: [upstreamDiagnostic]
    }

    const draftResult = createThirdPartyDataPackLockfileDraft({
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot
    })
    const copiedDiagnostic = draftResult.diagnostics[0]

    expect(draftResult.status).toBe('valid')
    expect(ownDetailsRead).toBe(false)
    expect(copiedDiagnostic).toMatchObject({
      stage: 'test.lockfile-draft.own-accessor',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'candidate warning',
        nested: { marker: 'original' },
        list: ['first', null]
      }
    })
    expect(Object.is(copiedDiagnostic, upstreamDiagnostic)).toBe(false)
    expect(Object.is(copiedDiagnostic?.details, diagnosticDetails)).toBe(false)
    expect(Object.is(copiedDiagnostic?.details?.nested, nestedDetails)).toBe(false)
    expect(Object.is(copiedDiagnostic?.details?.list, listDetails)).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(copiedDiagnostic?.details, 'ownHostPath')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(copiedDiagnostic?.details?.nested, 'ownHostPath')).toBe(false)
    expect(Object.isFrozen(copiedDiagnostic?.details)).toBe(true)
    expect(Object.isFrozen(copiedDiagnostic?.details?.nested)).toBe(true)
    expect(Object.isFrozen(copiedDiagnostic?.details?.list)).toBe(true)
    expect(JSON.stringify(draftResult)).not.toContain('C:/Users')
    expect(JSON.stringify(draftResult)).not.toContain('LENOVO')
    expect(JSON.stringify(draftResult)).not.toContain('lockfile-draft-own-diagnostic-detail')
    expect(JSON.stringify(draftResult)).not.toContain('lockfile-draft-nested-diagnostic-detail')
    expect(JSON.stringify(draftResult)).not.toContain('lockfile-draft-list-diagnostic-detail')
    expectOfficialBaseline()
  }, 15_000)

  it('copies candidate snapshot diagnostic array details without reading hostile proxy lengths', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const reports = await buildReportsFromRoot(root)
    let lengthRead = false
    const listDetails = new Proxy(['first', { stable: true }] as JsonValue[], {
      get(target, property, receiver) {
        if (property === 'length') {
          lengthRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/lockfile-draft-list-length')
        }
        return Reflect.get(target, property, receiver)
      }
    })
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'test.lockfile-draft.proxy-array',
      severity: 'warning',
      packageId: requirePackageId('discovery_valid'),
      details: {
        reason: 'candidate warning',
        list: listDetails as JsonValue
      }
    })
    const candidateSnapshot = {
      ...reports.candidateSnapshot,
      diagnostics: [upstreamDiagnostic]
    }

    const draftResult = createThirdPartyDataPackLockfileDraft({
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot
    })

    expect(draftResult.status).toBe('valid')
    expect(draftResult.diagnostics[0]?.details).toMatchObject({
      reason: 'candidate warning',
      list: ['first', { stable: true }]
    })
    expect(lengthRead).toBe(false)
    expect(JSON.stringify(draftResult)).not.toContain('C:/Users')
    expect(JSON.stringify(draftResult)).not.toContain('LENOVO')
    expect(JSON.stringify(draftResult)).not.toContain('lockfile-draft-list-length')
    expectOfficialBaseline()
  }, 15_000)
})
