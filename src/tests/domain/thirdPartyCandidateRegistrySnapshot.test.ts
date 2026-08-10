/// <reference types="node" />

import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createSerializableRegistrySnapshot,
  RegistryError,
  type RegistryEntry
} from '@/domain/mods/registry'
import type { JsonValue } from '@/domain/mods/canonicalJson'
import {
  requireContentId,
  requirePackageId,
  requireRegistryTypeId
} from '@/domain/mods/ids'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDataPackDiscoveryReport,
  type ThirdPartyDiscoveryDirectoryEntry,
  type ThirdPartyDiscoveryFileSystem
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import { selectThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackSelection'
import { buildThirdPartyCandidateRegistrySnapshot } from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const fixtureRoot = path.join(cwd(), 'src/tests/fixtures/mods/third-party-discovery')

type JsonObject = Record<string, unknown>

const createMutableDiscoveryReport = (
  report: ThirdPartyDataPackDiscoveryReport
): ThirdPartyDataPackDiscoveryReport =>
  structuredClone(report) as ThirdPartyDataPackDiscoveryReport

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-candidate-snapshot-'))
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

const createRecipe = (id: string): JsonObject => ({
  id,
  name: { key: `${id}.name`, fallback: id },
  ingredients: [
    {
      type: 'item',
      itemId: 'missing_pack:missing_item',
      quantity: 1
    }
  ],
  outputItemId: 'missing_pack:missing_food',
  outputQuantity: 1,
  effect: { staminaRestore: 1 },
  unlockSource: 'test',
  description: { key: `${id}.description`, fallback: `${id} description` }
})

const createPack = async(
  root: string,
  directoryName: string,
  options: {
    id?: string
    version?: string
    dependencies?: readonly JsonObject[]
    optionalDependencies?: readonly JsonObject[]
    tags?: readonly JsonObject[]
    items?: readonly JsonObject[]
    recipes?: readonly JsonObject[]
  } = {}
): Promise<void> => {
  const packageId = options.id ?? directoryName.replace(/-/g, '_')
  const packRoot = path.join(root, directoryName)
  const entrypoints: Record<string, string[]> = {}
  if (options.tags) entrypoints['taoyuan:tag'] = ['data/tags.json']
  if (options.items) entrypoints['taoyuan:item'] = ['data/items.json']
  if (options.recipes) entrypoints['taoyuan:recipe'] = ['data/recipes.json']

  await writeJson(path.join(packRoot, 'manifest.json'), {
    id: packageId,
    name: { key: `${packageId}.package.name`, fallback: packageId },
    version: options.version ?? '1.0.0',
    gameVersion: '2.4.0',
    engineApiVersion: '1',
    contentSchemaVersion: '1',
    defaultLocale: 'zh-CN',
    locales: { 'zh-CN': 'locales/zh-CN.json' },
    authors: [{ name: 'Candidate Snapshot Tester', role: 'developer' }],
    license: 'MIT',
    dependencies: [...(options.dependencies ?? [])],
    ...(options.optionalDependencies ? { optionalDependencies: [...options.optionalDependencies] } : {}),
    entrypoints
  })
  await writeJson(path.join(packRoot, 'locales', 'zh-CN.json'), {})
  if (options.tags) await writeJson(path.join(packRoot, 'data', 'tags.json'), options.tags)
  if (options.items) await writeJson(path.join(packRoot, 'data', 'items.json'), options.items)
  if (options.recipes) await writeJson(path.join(packRoot, 'data', 'recipes.json'), options.recipes)
}

const buildCandidateFromRoot = async(root: string) => {
  const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
  const discoveryReport = await discoverThirdPartyDataPacks(root, createNodeFileSystem())
  const selectionReport = selectThirdPartyDataPacks(discoveryReport)
  const result = buildThirdPartyCandidateRegistrySnapshot({
    officialRegistrySet,
    discoveryReport,
    selectionReport
  })
  return { officialRegistrySet, discoveryReport, selectionReport, result }
}

const countOfficialEntries = () => {
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

const expectOfficialBaseline = (): void => {
  expect(countOfficialEntries()).toEqual({
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
}

describe('third-party candidate registry snapshot', () => {
  it('builds a frozen read-only candidate snapshot in stable load order', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { result } = await buildCandidateFromRoot(root)

    expect(result.status).toBe('valid')
    expect(result.selectedPackageIds).toEqual(['discovery_valid'])
    expect(result.loadOrder).toEqual(['discovery_valid'])
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4244)
    expect(result.officialIdentity).toMatchObject({
      registryCount: 54,
      entryCount: 4242,
      artifactHash: committedMetadata.artifactHash,
      contentHash: committedMetadata.contentHash,
      schemaSetHash: committedMetadata.schemaSetHash,
      environmentHash: committedMetadata.environmentHash,
      snapshotHash: committedMetadata.snapshotHash
    })
    expect(result.candidateIdentity?.snapshotHash).toBe(result.candidateSnapshot?.snapshotHash)

    const itemRegistry = result.candidateRegistrySet!.get<RegistryEntry>(requireRegistryTypeId('taoyuan:item'))
    const item = itemRegistry.get(requireContentId('discovery_valid:linen_ribbon'))
    expect(item).toBeDefined()
    expect(Object.isFrozen(item)).toBe(true)
    expect(result.candidateRegistrySet?.currentPhase).toBe('frozen')
    expect(() => itemRegistry.register(requirePackageId('probe_pack'), { id: 'probe_pack:item' }))
      .toThrow(RegistryError)
  })

  it('freezes the exposed serializable candidate snapshot', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { result } = await buildCandidateFromRoot(root)
    const candidateSnapshot = result.candidateSnapshot
    if (!candidateSnapshot) throw new Error('Expected a valid candidate snapshot.')
    const firstRegistry = candidateSnapshot.registries[0]
    if (!firstRegistry) throw new Error('Expected candidate snapshot registries.')
    const firstRecord = firstRegistry.entries[0]
    if (!firstRecord) throw new Error('Expected candidate snapshot entries.')

    expect(result.status).toBe('valid')
    expect(Object.isFrozen(candidateSnapshot)).toBe(true)
    expect(Object.isFrozen(candidateSnapshot.registries)).toBe(true)
    expect(Object.isFrozen(firstRegistry)).toBe(true)
    expect(Object.isFrozen(firstRegistry.entries)).toBe(true)
    expect(Object.isFrozen(firstRecord)).toBe(true)
    expect(Object.isFrozen(firstRecord.source)).toBe(true)
    expect(Object.isFrozen(firstRecord.entry)).toBe(true)

    const mutableSnapshot = candidateSnapshot as unknown as {
      snapshotHash: string
      registries: unknown[]
    }
    expect(() => {
      mutableSnapshot.snapshotHash = 'sha256:0000000000000000000000000000000000000000000000000000000000000000'
    }).toThrow(TypeError)
    expect(() => {
      mutableSnapshot.registries.push({})
    }).toThrow(TypeError)
    expect(candidateSnapshot.snapshotHash).toBe(result.candidateIdentity?.snapshotHash)
    expect(candidateSnapshot.registries).toHaveLength(54)
  })

  it('freezes exposed candidate snapshot result graphs', async() => {
    const validRoot = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(validRoot, 'valid-gift-pack'), { recursive: true })
    const { result: validResult } = await buildCandidateFromRoot(validRoot)

    const skippedRoot = await createRoot()
    const { result: skippedResult } = await buildCandidateFromRoot(skippedRoot)

    const invalidRoot = await createRoot()
    await createPack(invalidRoot, 'bad-schema', {
      id: 'bad_schema',
      items: [createItem('bad_schema:broken', -1)]
    })
    const { result: invalidResult } = await buildCandidateFromRoot(invalidRoot)
    const invalidDiagnostic = invalidResult.diagnostics[0]
    if (!invalidDiagnostic) throw new Error('Expected invalid candidate diagnostics.')

    const beforeMutation = JSON.stringify({ validResult, skippedResult, invalidResult })

    expect(validResult.status).toBe('valid')
    expect(Object.isFrozen(validResult)).toBe(true)
    expect(Object.isFrozen(validResult.sourceSummary)).toBe(true)
    expect(Object.isFrozen(validResult.selectedPackageIds)).toBe(true)
    expect(Object.isFrozen(validResult.blockedPackageIds)).toBe(true)
    expect(Object.isFrozen(validResult.blockedCandidatePaths)).toBe(true)
    expect(Object.isFrozen(validResult.loadOrder)).toBe(true)
    expect(Object.isFrozen(validResult.diagnostics)).toBe(true)
    expect(Object.isFrozen(validResult.officialIdentity)).toBe(true)
    expect(Object.isFrozen(validResult.candidateIdentity)).toBe(true)
    expect(Object.isFrozen(validResult.candidateSnapshot)).toBe(true)
    expect(Object.isFrozen(validResult.candidateRegistrySet)).toBe(true)

    expect(skippedResult.status).toBe('skipped')
    expect(Object.isFrozen(skippedResult)).toBe(true)
    expect(Object.isFrozen(skippedResult.sourceSummary)).toBe(true)
    expect(Object.isFrozen(skippedResult.selectedPackageIds)).toBe(true)
    expect(Object.isFrozen(skippedResult.blockedPackageIds)).toBe(true)
    expect(Object.isFrozen(skippedResult.blockedCandidatePaths)).toBe(true)
    expect(Object.isFrozen(skippedResult.loadOrder)).toBe(true)
    expect(Object.isFrozen(skippedResult.diagnostics)).toBe(true)
    expect(Object.isFrozen(skippedResult.officialIdentity)).toBe(true)
    expect(skippedResult.candidateIdentity).toBeUndefined()
    expect(skippedResult.candidateSnapshot).toBeUndefined()
    expect(skippedResult.candidateRegistrySet).toBeUndefined()

    expect(invalidResult.status).toBe('invalid')
    expect(Object.isFrozen(invalidResult)).toBe(true)
    expect(Object.isFrozen(invalidResult.sourceSummary)).toBe(true)
    expect(Object.isFrozen(invalidResult.selectedPackageIds)).toBe(true)
    expect(Object.isFrozen(invalidResult.blockedPackageIds)).toBe(true)
    expect(Object.isFrozen(invalidResult.blockedCandidatePaths)).toBe(true)
    expect(Object.isFrozen(invalidResult.loadOrder)).toBe(true)
    expect(Object.isFrozen(invalidResult.diagnostics)).toBe(true)
    expect(Object.isFrozen(invalidDiagnostic)).toBe(true)
    expect(Object.isFrozen(invalidResult.officialIdentity)).toBe(true)
    if (invalidDiagnostic.relatedPackageIds) {
      expect(Object.isFrozen(invalidDiagnostic.relatedPackageIds)).toBe(true)
    }
    if (invalidDiagnostic.details) {
      expect(Object.isFrozen(invalidDiagnostic.details)).toBe(true)
    }
    expect(invalidResult.candidateIdentity).toBeUndefined()
    expect(invalidResult.candidateSnapshot).toBeUndefined()
    expect(invalidResult.candidateRegistrySet).toBeUndefined()

    expect(() => (validResult.selectedPackageIds as unknown as unknown[]).push('mutated_pack')).toThrow(TypeError)
    expect(() => (validResult.loadOrder as unknown as unknown[]).push('mutated_pack')).toThrow(TypeError)
    expect(() => (validResult.candidateSnapshot!.registries as unknown as unknown[]).push({})).toThrow(TypeError)
    expect(() => (skippedResult.blockedCandidatePaths as unknown as unknown[]).push('mutated-path')).toThrow(TypeError)
    expect(() => (invalidResult.diagnostics as unknown as unknown[]).push({})).toThrow(TypeError)
    expect(Reflect.set(validResult.sourceSummary as unknown as Record<string, unknown>, 'selectedPackageCount', 99)).toBe(false)
    expect(Reflect.set(validResult.officialIdentity as unknown as Record<string, unknown>, 'entryCount', 1)).toBe(false)
    expect(Reflect.set(validResult.candidateIdentity! as unknown as Record<string, unknown>, 'candidateHash', 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(false)
    expect(Reflect.set(validResult.candidateRegistrySet! as unknown as Record<string, unknown>, 'phase', 'registering-entries')).toBe(false)
    expect(Reflect.set(invalidDiagnostic as unknown as Record<string, unknown>, 'stage', 'mutated')).toBe(false)
    if (invalidDiagnostic.details) {
      expect(Reflect.set(invalidDiagnostic.details as unknown as Record<string, unknown>, 'reason', 'mutated')).toBe(false)
    }

    expect(JSON.stringify({ validResult, skippedResult, invalidResult })).toBe(beforeMutation)
    expectOfficialBaseline()
  }, 15_000)

  it('returns skipped for an empty discovery root without changing official counts', async() => {
    const root = await createRoot()

    const { result } = await buildCandidateFromRoot(root)

    expect(result.status).toBe('skipped')
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.candidateRegistrySet).toBeUndefined()
    expect(result.candidateIdentity).toBeUndefined()
    expectOfficialBaseline()
  })

  it('produces deterministic candidate identity for repeated multi-package builds', async() => {
    const root = await createRoot()
    await createPack(root, 'z-app', {
      id: 'z_app',
      dependencies: [{ id: 'a_library', version: '^1.0.0' }],
      items: [createItem('z_app:tea_cloth')]
    })
    await createPack(root, 'a-library', {
      id: 'a_library',
      items: [createItem('a_library:library_token')]
    })

    const first = await buildCandidateFromRoot(root)
    const second = buildThirdPartyCandidateRegistrySnapshot({
      officialRegistrySet: first.officialRegistrySet,
      discoveryReport: first.discoveryReport,
      selectionReport: first.selectionReport
    })

    expect(first.result.status).toBe('valid')
    expect(first.result.loadOrder).toEqual(['a_library', 'z_app'])
    expect(first.result.entryCount).toBe(4244)
    expect(second.candidateIdentity).toEqual(first.result.candidateIdentity)
    expect(second.candidateSnapshot).toEqual(first.result.candidateSnapshot)
  }, 15_000)

  it('invalidates the whole candidate when a required dependency is blocked by Schema errors', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-library', {
      id: 'bad_library',
      items: [createItem('bad_library:broken', -1)]
    })
    await createPack(root, 'dependent-app', {
      id: 'dependent_app',
      dependencies: [{ id: 'bad_library', version: '1.0.0' }],
      items: [createItem('dependent_app:gift')]
    })

    const { result } = await buildCandidateFromRoot(root)

    expect(result.status).toBe('invalid')
    expect(result.candidateRegistrySet).toBeUndefined()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.blockedPackageIds).toEqual(['bad_library', 'dependent_app'])
    expect(result.diagnostics.map(diagnostic => diagnostic.code)).toEqual(expect.arrayContaining([
      'SCHEMA-VALIDATE-001',
      'PKG-DEPENDENCY-001'
    ]))
    expectOfficialBaseline()
  })

  it('copies upstream discovery diagnostics before exposing invalid results', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-library', {
      id: 'bad_library',
      items: [createItem('bad_library:broken', -1)]
    })
    await createPack(root, 'dependent-app', {
      id: 'dependent_app',
      dependencies: [{ id: 'bad_library', version: '1.0.0' }],
      items: [createItem('dependent_app:gift')]
    })
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    const discoveryReport = createMutableDiscoveryReport(
      await discoverThirdPartyDataPacks(root, createNodeFileSystem())
    )
    const selectionReport = selectThirdPartyDataPacks(discoveryReport)
    const upstreamDiagnostic = discoveryReport.issues.flatMap(issue => issue.diagnostics)[0]
    if (!upstreamDiagnostic) throw new Error('Expected discovery diagnostics for invalid test package.')

    upstreamDiagnostic.relatedPackageIds = [requirePackageId('related_pack')]
    upstreamDiagnostic.details = {
      ...(upstreamDiagnostic.details ?? {}),
      reason: 'original diagnostic',
      nested: { marker: 'original' },
      list: ['original']
    }
    const originalStage = upstreamDiagnostic.stage
    const originalReason = upstreamDiagnostic.details.reason

    const result = buildThirdPartyCandidateRegistrySnapshot({
      officialRegistrySet,
      discoveryReport,
      selectionReport
    })
    const copiedDiagnostic = result.diagnostics.find(diagnostic => diagnostic.stage === originalStage)

    upstreamDiagnostic.stage = 'third-party.discovery.mutated'
    upstreamDiagnostic.relatedPackageIds?.push(requirePackageId('mutated_pack'))
    const upstreamDetails = upstreamDiagnostic.details
    if (!upstreamDetails) throw new Error('Expected copied diagnostic details.')
    upstreamDetails.reason = 'mutated'
    const nestedDetails = upstreamDetails.nested as Record<string, unknown>
    nestedDetails.marker = 'mutated'
    const listDetails = upstreamDetails.list as unknown[]
    listDetails.push('mutated')

    expect(result.status).toBe('invalid')
    expect(copiedDiagnostic).toMatchObject({
      stage: originalStage,
      relatedPackageIds: ['related_pack'],
      details: {
        reason: originalReason,
        nested: { marker: 'original' },
        list: ['original']
      }
    })
    expect(result.diagnostics.some(diagnostic => diagnostic.stage === 'third-party.discovery.mutated')).toBe(false)
    expectOfficialBaseline()
  })

  it('ignores inherited discovery diagnostic details before exposing invalid results', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-library', {
      id: 'bad_library',
      items: [createItem('bad_library:broken', -1)]
    })
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    const discoveryReport = createMutableDiscoveryReport(
      await discoverThirdPartyDataPacks(root, createNodeFileSystem())
    )
    const selectionReport = selectThirdPartyDataPacks(discoveryReport)
    const upstreamDiagnostic = discoveryReport.issues.flatMap(issue => issue.diagnostics)[0]
    if (!upstreamDiagnostic) throw new Error('Expected discovery diagnostics for invalid test package.')

    let inheritedDetailsRead = false
    const inheritedDetailsPrototype = {}
    Object.defineProperty(inheritedDetailsPrototype, 'hostPath', {
      enumerable: true,
      get() {
        inheritedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/candidate-snapshot-diagnostics')
      }
    })
    upstreamDiagnostic.details = Object.assign(Object.create(inheritedDetailsPrototype), {
      reason: 'original diagnostic',
      nested: { marker: 'original' },
      list: ['original']
    }) as NonNullable<typeof upstreamDiagnostic.details>
    const originalStage = upstreamDiagnostic.stage

    const result = buildThirdPartyCandidateRegistrySnapshot({
      officialRegistrySet,
      discoveryReport,
      selectionReport
    })
    const copiedDiagnostic = result.diagnostics.find(diagnostic => diagnostic.stage === originalStage)
    if (!copiedDiagnostic) throw new Error('Expected copied candidate snapshot diagnostic.')

    expect(result.status).toBe('invalid')
    expect(inheritedDetailsRead).toBe(false)
    expect(copiedDiagnostic.details).toMatchObject({
      reason: 'original diagnostic',
      nested: { marker: 'original' },
      list: ['original']
    })
    expect(copiedDiagnostic.details).not.toHaveProperty('hostPath')
    expect(Object.isFrozen(copiedDiagnostic.details)).toBe(true)
    expect(Object.isFrozen(copiedDiagnostic.details?.nested)).toBe(true)
    expect(Object.isFrozen(copiedDiagnostic.details?.list)).toBe(true)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('candidate-snapshot-diagnostics')
    expectOfficialBaseline()
  })

  it('ignores own accessor discovery diagnostic details before exposing invalid results', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-library', {
      id: 'bad_library',
      items: [createItem('bad_library:broken', -1)]
    })
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    const discoveryReport = createMutableDiscoveryReport(
      await discoverThirdPartyDataPacks(root, createNodeFileSystem())
    )
    const selectionReport = selectThirdPartyDataPacks(discoveryReport)
    const upstreamDiagnostic = discoveryReport.issues.flatMap(issue => issue.diagnostics)[0]
    if (!upstreamDiagnostic) throw new Error('Expected discovery diagnostics for invalid test package.')

    let ownDetailsRead = false
    const listDetails = ['original', 'placeholder'] as JsonValue[]
    Object.defineProperty(listDetails, '1', {
      enumerable: true,
      get() {
        ownDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/candidate-snapshot-list-diagnostic-detail')
      }
    })
    const nestedDetails: Record<string, JsonValue> = { marker: 'original' }
    Object.defineProperty(nestedDetails, 'ownHostPath', {
      enumerable: true,
      get() {
        ownDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/candidate-snapshot-nested-diagnostic-detail')
      }
    })
    const diagnosticDetails = {
      reason: 'original diagnostic',
      nested: nestedDetails,
      list: listDetails
    } as NonNullable<typeof upstreamDiagnostic.details>
    Object.defineProperty(diagnosticDetails, 'ownHostPath', {
      enumerable: true,
      get() {
        ownDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/candidate-snapshot-own-diagnostic-detail')
      }
    })
    upstreamDiagnostic.details = diagnosticDetails
    const originalStage = upstreamDiagnostic.stage

    const result = buildThirdPartyCandidateRegistrySnapshot({
      officialRegistrySet,
      discoveryReport,
      selectionReport
    })
    const copiedDiagnostic = result.diagnostics.find(diagnostic => diagnostic.stage === originalStage)
    if (!copiedDiagnostic) throw new Error('Expected copied candidate snapshot diagnostic.')

    expect(result.status).toBe('invalid')
    expect(ownDetailsRead).toBe(false)
    expect(copiedDiagnostic.details).toMatchObject({
      reason: 'original diagnostic',
      nested: { marker: 'original' },
      list: ['original', null]
    })
    expect(Object.prototype.hasOwnProperty.call(copiedDiagnostic.details, 'ownHostPath')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(copiedDiagnostic.details?.nested, 'ownHostPath')).toBe(false)
    expect(Object.isFrozen(copiedDiagnostic.details)).toBe(true)
    expect(Object.isFrozen(copiedDiagnostic.details?.nested)).toBe(true)
    expect(Object.isFrozen(copiedDiagnostic.details?.list)).toBe(true)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('candidate-snapshot-own-diagnostic-detail')
    expect(JSON.stringify(result)).not.toContain('candidate-snapshot-nested-diagnostic-detail')
    expect(JSON.stringify(result)).not.toContain('candidate-snapshot-list-diagnostic-detail')
    expectOfficialBaseline()
  })

  it('ignores own accessor discovery diagnostic fields before exposing invalid results', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-library', {
      id: 'bad_library',
      items: [createItem('bad_library:broken', -1)]
    })
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    const discoveryReport = createMutableDiscoveryReport(
      await discoverThirdPartyDataPacks(root, createNodeFileSystem())
    )
    const selectionReport = selectThirdPartyDataPacks(discoveryReport)
    const upstreamDiagnostic = discoveryReport.issues.flatMap(issue => issue.diagnostics)[0]
    if (!upstreamDiagnostic) throw new Error('Expected discovery diagnostics for invalid test package.')

    const originalCode = upstreamDiagnostic.code
    const originalRuleId = upstreamDiagnostic.ruleId
    const originalSeverity = upstreamDiagnostic.severity
    const originalMessageKey = upstreamDiagnostic.messageKey
    const originalRecovery = upstreamDiagnostic.recovery
    let stageRead = false
    let relatedPackageIdsRead = false
    let detailsRead = false
    Object.defineProperty(upstreamDiagnostic, 'stage', {
      enumerable: true,
      get() {
        stageRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/candidate-snapshot-diagnostic-stage')
      }
    })
    Object.defineProperty(upstreamDiagnostic, 'relatedPackageIds', {
      enumerable: true,
      get() {
        relatedPackageIdsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/candidate-snapshot-diagnostic-related')
      }
    })
    Object.defineProperty(upstreamDiagnostic, 'details', {
      enumerable: true,
      get() {
        detailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/candidate-snapshot-diagnostic-details')
      }
    })

    const result = buildThirdPartyCandidateRegistrySnapshot({
      officialRegistrySet,
      discoveryReport,
      selectionReport
    })
    const copiedDiagnostic = result.diagnostics.find(diagnostic => diagnostic.code === originalCode)
    if (!copiedDiagnostic) throw new Error('Expected copied candidate snapshot diagnostic.')

    expect(stageRead).toBe(false)
    expect(relatedPackageIdsRead).toBe(false)
    expect(detailsRead).toBe(false)
    expect(copiedDiagnostic).toMatchObject({
      code: originalCode,
      ruleId: originalRuleId,
      severity: originalSeverity,
      stage: 'third-party.candidate.diagnostic-copy',
      messageKey: originalMessageKey,
      recovery: originalRecovery
    })
    expect(copiedDiagnostic.relatedPackageIds).toBeUndefined()
    expect(copiedDiagnostic.details).toBeUndefined()
    expect(Object.isFrozen(copiedDiagnostic)).toBe(true)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('candidate-snapshot-diagnostic-stage')
    expect(JSON.stringify(result)).not.toContain('candidate-snapshot-diagnostic-related')
    expect(JSON.stringify(result)).not.toContain('candidate-snapshot-diagnostic-details')
    expectOfficialBaseline()
  })

  it('copies discovery diagnostic related package ids without reading hostile proxy lengths', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-library', {
      id: 'bad_library',
      items: [createItem('bad_library:broken', -1)]
    })
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    const discoveryReport = createMutableDiscoveryReport(
      await discoverThirdPartyDataPacks(root, createNodeFileSystem())
    )
    const selectionReport = selectThirdPartyDataPacks(discoveryReport)
    const upstreamDiagnostic = discoveryReport.issues.flatMap(issue => issue.diagnostics)[0]
    if (!upstreamDiagnostic) throw new Error('Expected discovery diagnostics for invalid test package.')

    let lengthRead = false
    const relatedPackageIds = new Proxy([
      requirePackageId('related_pack'),
      requirePackageId('second_pack')
    ], {
      get(target, property, receiver) {
        if (property === 'length') {
          lengthRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/candidate-snapshot-related-length')
        }
        return Reflect.get(target, property, receiver)
      }
    })
    upstreamDiagnostic.relatedPackageIds = relatedPackageIds
    const originalStage = upstreamDiagnostic.stage

    const result = buildThirdPartyCandidateRegistrySnapshot({
      officialRegistrySet,
      discoveryReport,
      selectionReport
    })
    const copiedDiagnostic = result.diagnostics.find(diagnostic => diagnostic.stage === originalStage)
    if (!copiedDiagnostic) throw new Error('Expected copied candidate snapshot diagnostic.')

    expect(result.status).toBe('invalid')
    expect(lengthRead).toBe(false)
    expect(copiedDiagnostic.relatedPackageIds).toEqual(['related_pack', 'second_pack'])
    expect(Object.is(copiedDiagnostic.relatedPackageIds, relatedPackageIds)).toBe(false)
    expect(Object.isFrozen(copiedDiagnostic.relatedPackageIds)).toBe(true)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('candidate-snapshot-related-length')
    expectOfficialBaseline()
  })

  it('copies discovery diagnostic array details without reading hostile proxy lengths', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-library', {
      id: 'bad_library',
      items: [createItem('bad_library:broken', -1)]
    })
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    const discoveryReport = createMutableDiscoveryReport(
      await discoverThirdPartyDataPacks(root, createNodeFileSystem())
    )
    const selectionReport = selectThirdPartyDataPacks(discoveryReport)
    const upstreamDiagnostic = discoveryReport.issues.flatMap(issue => issue.diagnostics)[0]
    if (!upstreamDiagnostic) throw new Error('Expected discovery diagnostics for invalid test package.')

    let lengthRead = false
    const listDetails = new Proxy(['first', { stable: true }] as JsonValue[], {
      get(target, property, receiver) {
        if (property === 'length') {
          lengthRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/candidate-snapshot-list-length')
        }
        return Reflect.get(target, property, receiver)
      }
    })
    upstreamDiagnostic.details = {
      reason: 'candidate snapshot warning',
      list: listDetails as JsonValue
    }
    const originalStage = upstreamDiagnostic.stage

    const result = buildThirdPartyCandidateRegistrySnapshot({
      officialRegistrySet,
      discoveryReport,
      selectionReport
    })
    const copiedDiagnostic = result.diagnostics.find(diagnostic => diagnostic.stage === originalStage)
    if (!copiedDiagnostic) throw new Error('Expected copied candidate snapshot diagnostic.')

    expect(result.status).toBe('invalid')
    expect(copiedDiagnostic.details).toMatchObject({
      reason: 'candidate snapshot warning',
      list: ['first', { stable: true }]
    })
    expect(lengthRead).toBe(false)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('candidate-snapshot-list-length')
    expectOfficialBaseline()
  })

  it('rejects third-party entries that collide with official content ids', async() => {
    const root = await createRoot()
    await createPack(root, 'official-conflict', {
      id: 'official_conflict',
      items: [createItem('taoyuan:stone')]
    })

    const { result } = await buildCandidateFromRoot(root)

    expect(result.status).toBe('invalid')
    expect(result.candidateSnapshot).toBeUndefined()
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      code: 'REG-DUPLICATE-001',
      stage: 'third-party.candidate.official-conflict',
      packageId: 'official_conflict',
      registryId: 'taoyuan:item',
      contentId: 'taoyuan:stone',
      relatedPackageIds: ['taoyuan-core']
    }))
    expectOfficialBaseline()
  })

  it('rejects selected third-party packages that duplicate the same registry entry', async() => {
    const root = await createRoot()
    const sharedItem = createItem('shared_namespace:festival_token')
    await createPack(root, 'a-first-shared', {
      id: 'first_shared',
      items: [sharedItem]
    })
    await createPack(root, 'b-identical-shared', {
      id: 'identical_shared',
      items: [sharedItem]
    })

    const { selectionReport, result } = await buildCandidateFromRoot(root)

    expect(selectionReport.status).toBe('completed')
    expect(result.status).toBe('invalid')
    expect(result.candidateRegistrySet).toBeUndefined()
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      code: 'REG-DUPLICATE-001',
      stage: 'third-party.candidate.duplicate-entry',
      packageId: 'identical_shared',
      registryId: 'taoyuan:item',
      contentId: 'shared_namespace:festival_token',
      relatedPackageIds: ['first_shared']
    }))
  })

  it('does not merge acyclic package prefixes when selection reports dependency cycles', async() => {
    const root = await createRoot()
    await createPack(root, 'a-cycle', {
      id: 'a_cycle',
      dependencies: [{ id: 'b_cycle', version: '1.0.0' }],
      items: [createItem('a_cycle:gift')]
    })
    await createPack(root, 'b-cycle', {
      id: 'b_cycle',
      dependencies: [{ id: 'a_cycle', version: '1.0.0' }],
      items: [createItem('b_cycle:gift')]
    })
    await createPack(root, 'c-free', {
      id: 'c_free',
      items: [createItem('c_free:gift')]
    })

    const { selectionReport, result } = await buildCandidateFromRoot(root)

    expect(selectionReport.loadOrder).toEqual(['c_free'])
    expect(selectionReport.status).toBe('blocked')
    expect(result.status).toBe('invalid')
    expect(result.entryCount).toBe(4242)
    expect(result.candidateSnapshot).toBeUndefined()
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      code: 'PKG-DEPENDENCY-003'
    }))
  })

  it('rejects candidates that pass Schema but fail cross-registry semantic validation', async() => {
    const root = await createRoot()
    await createPack(root, 'semantic-error', {
      id: 'semantic_error',
      recipes: [createRecipe('semantic_error:missing_food_recipe')]
    })

    const { result } = await buildCandidateFromRoot(root)

    expect(result.status).toBe('invalid')
    expect(result.candidateRegistrySet).toBeUndefined()
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        packageId: 'semantic_error',
        registryId: 'taoyuan:item',
        contentId: 'missing_pack:missing_item'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        packageId: 'semantic_error',
        registryId: 'taoyuan:item',
        contentId: 'missing_pack:missing_food'
      })
    ]))
    expectOfficialBaseline()
  })

  it('does not mutate official registry, discovery report or selection report while building', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    const officialBefore = createSerializableRegistrySnapshot(officialRegistrySet)
    const discoveryReport = await discoverThirdPartyDataPacks(root, createNodeFileSystem())
    const selectionReport = selectThirdPartyDataPacks(discoveryReport)
    const discoveryBefore = JSON.stringify(discoveryReport)
    const selectionBefore = JSON.stringify(selectionReport)

    const result = buildThirdPartyCandidateRegistrySnapshot({
      officialRegistrySet,
      discoveryReport,
      selectionReport
    })
    const officialAfter = createSerializableRegistrySnapshot(officialRegistrySet)

    expect(result.status).toBe('valid')
    expect(officialAfter).toEqual(officialBefore)
    expect(JSON.stringify(discoveryReport)).toBe(discoveryBefore)
    expect(JSON.stringify(selectionReport)).toBe(selectionBefore)
    expect(officialAfter.registries).toHaveLength(54)
    expect(countOfficialEntries()).toEqual({
      registryCount: 54,
      entryCount: 4242,
      snapshotHash: committedMetadata.snapshotHash
    })
  })
})
