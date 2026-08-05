/// <reference types="node" />

import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import type { JsonValue } from '@/domain/mods/canonicalJson'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
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
  validateThirdPartyDataPackLockfileDraft
} from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import { buildThirdPartyDataPackMountPreflight } from '@/domain/mods/thirdPartyDataPackMountPreflight'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const fixtureRoot = path.join(cwd(), 'src/tests/fixtures/mods/third-party-discovery')

type JsonObject = Record<string, unknown>
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-mount-preflight-'))
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
    authors: [{ name: 'Mount Preflight Tester', role: 'developer' }],
    license: 'MIT',
    dependencies: [...(options.dependencies ?? [])],
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
  const lockfileDraftResult = createThirdPartyDataPackLockfileDraft({
    discoveryReport,
    selectionReport,
    candidateSnapshot
  })
  const lockfileValidationResult = validateThirdPartyDataPackLockfileDraft({
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    draft: lockfileDraftResult.draft
  })
  const preflight = buildThirdPartyDataPackMountPreflight({
    officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult
  })
  return {
    officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult,
    preflight
  }
}

const createMutableCandidateIdentityFixture = (
  snapshot: ThirdPartyCandidateRegistrySnapshotResult
): ThirdPartyCandidateRegistrySnapshotResult => ({
  ...snapshot,
  officialIdentity: { ...snapshot.officialIdentity },
  ...(snapshot.candidateIdentity ? { candidateIdentity: { ...snapshot.candidateIdentity } } : {})
})

const stageStatusByName = (preflight: ReturnType<typeof buildThirdPartyDataPackMountPreflight>) =>
  new Map(preflight.stages.map(stage => [stage.name, stage.status]))

const expectReadOnlyEffects = (preflight: ReturnType<typeof buildThirdPartyDataPackMountPreflight>): void => {
  expect(preflight.effects).toEqual({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    packageFilesWritten: false,
    cacheWritten: false
  })
  expect(Object.isFrozen(preflight.effects)).toBe(true)
}

const expectFrozenPreflightOutput = (
  preflight: ReturnType<typeof buildThirdPartyDataPackMountPreflight>
): void => {
  expect(Object.isFrozen(preflight)).toBe(true)
  expect(Object.isFrozen(preflight.stages)).toBe(true)
  expect(preflight.stages.every(stage => Object.isFrozen(stage))).toBe(true)
  expect(preflight.stages.every(stage => Object.isFrozen(stage.diagnostics))).toBe(true)
  expect(preflight.stages.every(stage => stage.details === undefined || Object.isFrozen(stage.details))).toBe(true)
  expect(Object.isFrozen(preflight.diagnostics)).toBe(true)
  expect(preflight.diagnostics.every(diagnostic => Object.isFrozen(diagnostic))).toBe(true)
  expect(preflight.diagnostics.every(diagnostic =>
    diagnostic.relatedPackageIds === undefined || Object.isFrozen(diagnostic.relatedPackageIds)
  )).toBe(true)
  expect(preflight.diagnostics.every(diagnostic =>
    diagnostic.details === undefined || Object.isFrozen(diagnostic.details)
  )).toBe(true)
  expect(Object.isFrozen(preflight.selectedPackageIds)).toBe(true)
  expect(Object.isFrozen(preflight.blockedPackageIds)).toBe(true)
  expect(Object.isFrozen(preflight.blockedCandidatePaths)).toBe(true)
  expect(Object.isFrozen(preflight.loadOrder)).toBe(true)
  expect(Object.isFrozen(preflight.officialIdentity)).toBe(true)
  expect(preflight.candidateIdentity === undefined || Object.isFrozen(preflight.candidateIdentity)).toBe(true)
  expect(Object.isFrozen(preflight.rollback)).toBe(true)
}

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

describe('third-party data pack mount preflight', () => {
  it('marks valid candidate and lockfile drafts ready without publishing runtime state', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { preflight } = await buildReportsFromRoot(root)
    const stages = stageStatusByName(preflight)

    expect(preflight.status).toBe('ready')
    expect(stages.get('discovery')).toBe('completed')
    expect(stages.get('selection')).toBe('completed')
    expect(stages.get('candidate-snapshot')).toBe('completed')
    expect(stages.get('lockfile-draft')).toBe('completed')
    expect(stages.get('lockfile-validation')).toBe('completed')
    expect(stages.get('runtime-publish')).toBe('deferred')
    expect(stages.get('rollback')).toBe('skipped')
    expect(preflight.selectedPackageIds).toEqual(['discovery_valid'])
    expect(preflight.loadOrder).toEqual(['discovery_valid'])
    expect(preflight.registryCount).toBe(54)
    expect(preflight.entryCount).toBe(4244)
    expect(preflight.packageCount).toBe(1)
    expect(preflight.lockfileHash).toMatch(/^sha256:/)
    expect(preflight.candidateIdentity?.candidateHash).toMatch(/^sha256:/)
    expect(preflight.rollback).toMatchObject({
      required: false,
      retainedOfficialRegistryCount: 54,
      retainedOfficialEntryCount: 4242
    })
    expectReadOnlyEffects(preflight)
    expectFrozenPreflightOutput(preflight)
    const frozenOutputSnapshot = JSON.stringify({
      stages: preflight.stages,
      selectedPackageIds: preflight.selectedPackageIds,
      loadOrder: preflight.loadOrder,
      officialIdentity: preflight.officialIdentity,
      candidateIdentity: preflight.candidateIdentity,
      effects: preflight.effects,
      rollback: preflight.rollback
    })
    const firstStage = preflight.stages[0]
    if (firstStage === undefined) throw new Error('Expected at least one frozen preflight stage.')
    expect(() => {
      (preflight.stages as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(firstStage as unknown as Record<string, unknown>, 'status', 'failed')).toBe(false)
    if (firstStage.details !== undefined) {
      expect(Reflect.set(firstStage.details as Record<string, unknown>, 'candidateCount', 999)).toBe(false)
    }
    expect(() => {
      (preflight.selectedPackageIds as unknown as unknown[]).push('mutated_pack')
    }).toThrow(TypeError)
    expect(() => {
      (preflight.loadOrder as unknown as unknown[]).push('mutated_pack')
    }).toThrow(TypeError)
    expect(Reflect.set(preflight.officialIdentity as unknown as Record<string, unknown>, 'registryCount', 1)).toBe(false)
    if (preflight.candidateIdentity !== undefined) {
      expect(Reflect.set(preflight.candidateIdentity as unknown as Record<string, unknown>, 'candidateHash', testHash('5'))).toBe(false)
    }
    expect(Reflect.set(preflight.effects as unknown as Record<string, unknown>, 'cacheWritten', true)).toBe(false)
    expect(Reflect.set(preflight.rollback as unknown as Record<string, unknown>, 'reason', 'mutated')).toBe(false)
    expect(JSON.stringify({
      stages: preflight.stages,
      selectedPackageIds: preflight.selectedPackageIds,
      loadOrder: preflight.loadOrder,
      officialIdentity: preflight.officialIdentity,
      candidateIdentity: preflight.candidateIdentity,
      effects: preflight.effects,
      rollback: preflight.rollback
    })).toBe(frozenOutputSnapshot)
    expectOfficialBaseline()
  }, 15_000)

  it('skips cleanly when no third-party package is selected', async() => {
    const root = await createRoot()

    const { preflight } = await buildReportsFromRoot(root)
    const stages = stageStatusByName(preflight)

    expect(preflight.status).toBe('skipped')
    expect(stages.get('discovery')).toBe('skipped')
    expect(stages.get('selection')).toBe('skipped')
    expect(stages.get('candidate-snapshot')).toBe('skipped')
    expect(stages.get('lockfile-draft')).toBe('skipped')
    expect(stages.get('lockfile-validation')).toBe('skipped')
    expect(stages.get('rollback')).toBe('skipped')
    expect(preflight.selectedPackageIds).toEqual([])
    expect(preflight.registryCount).toBe(54)
    expect(preflight.entryCount).toBe(4242)
    expect(preflight.lockfileHash).toBeUndefined()
    expectReadOnlyEffects(preflight)
    expectOfficialBaseline()
  }, 15_000)

  it('rolls back invalid candidates and retains the official baseline', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-schema', {
      id: 'bad_schema',
      items: [createItem('bad_schema:broken', -1)]
    })

    const { preflight } = await buildReportsFromRoot(root)
    const stages = stageStatusByName(preflight)

    expect(preflight.status).toBe('rolled-back')
    expect(stages.get('discovery')).toBe('failed')
    expect(stages.get('selection')).toBe('skipped')
    expect(stages.get('candidate-snapshot')).toBe('failed')
    expect(stages.get('lockfile-draft')).toBe('failed')
    expect(stages.get('rollback')).toBe('completed')
    expect(preflight.registryCount).toBe(54)
    expect(preflight.entryCount).toBe(4242)
    expect(preflight.rollback).toMatchObject({
      required: true,
      reason: 'discovery failed',
      retainedOfficialRegistryCount: 54,
      retainedOfficialEntryCount: 4242,
      discardedCandidateRegistry: true,
      discardedLockfileDraft: true
    })
    expect(preflight.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'SCHEMA-VALIDATE-001' }),
      expect.objectContaining({ stage: 'third-party.lockfile-draft.candidate' })
    ]))
    expectReadOnlyEffects(preflight)
    expectOfficialBaseline()
  }, 15_000)

  it('is deterministic for repeated preflights over the same reports', async() => {
    const root = await createRoot()
    await createPack(root, 'z-app', {
      id: 'z_app',
      dependencies: [{ id: 'a_library', version: '1.0.0' }]
    })
    await createPack(root, 'a-library', { id: 'a_library' })
    const reports = await buildReportsFromRoot(root)

    const repeated = buildThirdPartyDataPackMountPreflight({
      officialRegistrySet: reports.officialRegistrySet,
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot: reports.candidateSnapshot,
      lockfileDraftResult: reports.lockfileDraftResult,
      lockfileValidationResult: reports.lockfileValidationResult
    })

    expect(reports.preflight.status).toBe('ready')
    expect(reports.preflight.loadOrder).toEqual(['a_library', 'z_app'])
    expect(repeated).toEqual(reports.preflight)
  }, 15_000)

  it('does not mutate reports, official registries, package files, saves or settings', async() => {
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
    const lockfileDraftResult = createThirdPartyDataPackLockfileDraft({
      discoveryReport,
      selectionReport,
      candidateSnapshot
    })
    const lockfileValidationResult = validateThirdPartyDataPackLockfileDraft({
      discoveryReport,
      selectionReport,
      candidateSnapshot,
      draft: lockfileDraftResult.draft
    })
    const discoveryBefore = JSON.stringify(discoveryReport)
    const selectionBefore = JSON.stringify(selectionReport)
    const candidateBefore = JSON.stringify(candidateSnapshot)
    const draftBefore = JSON.stringify(lockfileDraftResult)

    const preflight = buildThirdPartyDataPackMountPreflight({
      officialRegistrySet,
      discoveryReport,
      selectionReport,
      candidateSnapshot,
      lockfileDraftResult,
      lockfileValidationResult
    })

    expect(preflight.status).toBe('ready')
    expect(createSerializableRegistrySnapshot(officialRegistrySet)).toEqual(officialBefore)
    expect(JSON.stringify(discoveryReport)).toBe(discoveryBefore)
    expect(JSON.stringify(selectionReport)).toBe(selectionBefore)
    expect(JSON.stringify(candidateSnapshot)).toBe(candidateBefore)
    expect(JSON.stringify(lockfileDraftResult)).toBe(draftBefore)
    expect(await collectFileContents(root)).toEqual(filesBefore)
    expectReadOnlyEffects(preflight)
    expectOfficialBaseline()
  }, 15_000)

  it('copies upstream identity summaries before exposing preflight reports', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const reports = await buildReportsFromRoot(root)
    const candidateSnapshot = createMutableCandidateIdentityFixture(reports.candidateSnapshot)
    const preflight = buildThirdPartyDataPackMountPreflight({
      officialRegistrySet: reports.officialRegistrySet,
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot,
      lockfileDraftResult: reports.lockfileDraftResult,
      lockfileValidationResult: reports.lockfileValidationResult
    })
    const originalCandidateHash = preflight.candidateIdentity?.candidateHash

    expect(preflight.officialIdentity).toEqual(candidateSnapshot.officialIdentity)
    expect(preflight.candidateIdentity).toEqual(candidateSnapshot.candidateIdentity)
    expect(preflight.officialIdentity).not.toBe(candidateSnapshot.officialIdentity)
    expect(preflight.candidateIdentity).not.toBe(candidateSnapshot.candidateIdentity)
    expect(originalCandidateHash).toMatch(/^sha256:/)

    const mutableOfficialIdentity = candidateSnapshot.officialIdentity as { registryCount: number }
    const mutableCandidateIdentity = candidateSnapshot.candidateIdentity as { candidateHash: Sha256Hash }
    mutableOfficialIdentity.registryCount = 1
    mutableCandidateIdentity.candidateHash = testHash('5')

    expect(preflight.officialIdentity.registryCount).toBe(54)
    expect(preflight.candidateIdentity?.candidateHash).toBe(originalCandidateHash)
    expectReadOnlyEffects(preflight)
    expectOfficialBaseline()
  }, 15_000)

  it('copies upstream diagnostics before exposing preflight reports', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { officialRegistrySet, discoveryReport, selectionReport, candidateSnapshot, lockfileDraftResult, lockfileValidationResult } = await buildReportsFromRoot(root)
    const relatedPackageId = 'related_pack' as PackageId
    let inheritedDetailsRead = false
    const inheritedDetailsPrototype = {}
    Object.defineProperty(inheritedDetailsPrototype, 'hostPath', {
      enumerable: true,
      get() {
        inheritedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/mount-preflight-diagnostic-detail')
      }
    })
    const diagnosticDetails = Object.assign(Object.create(inheritedDetailsPrototype), {
      reason: 'original',
      nested: { count: 1 },
      list: ['original', { stable: true }]
    }) as Record<string, JsonValue>
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.mount-preflight.test',
      severity: 'warning',
      packageId: 'discovery_valid' as PackageId,
      relatedPackageIds: [relatedPackageId],
      details: diagnosticDetails
    })
    const candidateSnapshotWithDiagnostic = {
      ...candidateSnapshot,
      diagnostics: [upstreamDiagnostic]
    }

    const preflight = buildThirdPartyDataPackMountPreflight({
      officialRegistrySet,
      discoveryReport,
      selectionReport,
      candidateSnapshot: candidateSnapshotWithDiagnostic,
      lockfileDraftResult,
      lockfileValidationResult
    })
    const candidateStage = preflight.stages.find(stage => stage.name === 'candidate-snapshot')
    if (!candidateStage) throw new Error('Expected candidate snapshot stage.')

    expect(inheritedDetailsRead).toBe(false)
    expect(preflight.status).toBe('ready')
    expect(candidateStage.diagnostics).toEqual([upstreamDiagnostic])
    expect(preflight.diagnostics).toEqual([upstreamDiagnostic])
    expect(candidateStage.diagnostics[0]).not.toBe(upstreamDiagnostic)
    expect(preflight.diagnostics[0]).not.toBe(upstreamDiagnostic)
    expect(candidateStage.diagnostics[0]?.relatedPackageIds).not.toBe(upstreamDiagnostic.relatedPackageIds)
    expect(preflight.diagnostics[0]?.relatedPackageIds).not.toBe(upstreamDiagnostic.relatedPackageIds)
    expect(candidateStage.diagnostics[0]?.details).not.toBe(upstreamDiagnostic.details)
    expect(preflight.diagnostics[0]?.details).not.toBe(upstreamDiagnostic.details)
    expect(candidateStage.diagnostics[0]?.details).not.toHaveProperty('hostPath')
    expect(preflight.diagnostics[0]?.details).not.toHaveProperty('hostPath')
    expect(candidateStage.diagnostics[0]?.details?.nested).not.toBe(upstreamDiagnostic.details?.nested)
    expect(preflight.diagnostics[0]?.details?.list).not.toBe(upstreamDiagnostic.details?.list)
    expectFrozenPreflightOutput(preflight)
    expect(Object.isFrozen(candidateStage.diagnostics[0])).toBe(true)
    expect(Object.isFrozen(candidateStage.diagnostics[0]?.relatedPackageIds)).toBe(true)
    expect(Object.isFrozen(candidateStage.diagnostics[0]?.details)).toBe(true)
    expect(Object.isFrozen(candidateStage.diagnostics[0]?.details?.nested)).toBe(true)
    expect(Object.isFrozen(candidateStage.diagnostics[0]?.details?.list)).toBe(true)
    expect(Reflect.set(candidateStage.diagnostics[0] as unknown as Record<string, unknown>, 'stage', 'mutated')).toBe(false)
    expect(() => {
      (candidateStage.diagnostics as unknown as unknown[]).push(upstreamDiagnostic)
    }).toThrow(TypeError)

    upstreamDiagnostic.stage = 'mutated'
    upstreamDiagnostic.relatedPackageIds?.push('mutated_pack' as PackageId)
    const upstreamDetails = upstreamDiagnostic.details
    if (upstreamDetails === undefined) throw new Error('Expected copied diagnostic details.')
    upstreamDetails.reason = 'mutated'
    const nestedDetails = upstreamDetails.nested
    if (nestedDetails === null || typeof nestedDetails !== 'object' || Array.isArray(nestedDetails)) {
      throw new Error('Expected copied nested diagnostic details.')
    }
    nestedDetails.count = 2
    const listDetails = upstreamDetails.list
    if (!Array.isArray(listDetails)) throw new Error('Expected copied list diagnostic details.')
    listDetails.push('mutated')
    const listObject = listDetails[1]
    if (listObject === null || typeof listObject !== 'object' || Array.isArray(listObject)) {
      throw new Error('Expected copied nested list object.')
    }
    listObject.stable = false

    expect(inheritedDetailsRead).toBe(false)
    expect(JSON.stringify(preflight)).not.toContain('C:/Users')
    expect(JSON.stringify(preflight)).not.toContain('LENOVO')
    expect(JSON.stringify(preflight)).not.toContain('mount-preflight-diagnostic-detail')
    const expectedDiagnostic = {
      stage: 'third-party.mount-preflight.test',
      relatedPackageIds: ['related_pack'],
      details: {
        reason: 'original',
        nested: { count: 1 },
        list: ['original', { stable: true }]
      }
    }
    expect(candidateStage.diagnostics[0]).toMatchObject(expectedDiagnostic)
    expect(preflight.diagnostics[0]).toMatchObject(expectedDiagnostic)
    expectReadOnlyEffects(preflight)
    expectOfficialBaseline()
  }, 15_000)
})
