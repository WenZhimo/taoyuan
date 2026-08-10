/// <reference types="node" />

import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import type { JsonValue } from '@/domain/mods/canonicalJson'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import type { Sha256Hash } from '@/domain/mods/hash'
import { requirePackageId } from '@/domain/mods/ids'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
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
  validateThirdPartyDataPackLockfileDraft
} from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import { buildThirdPartyDataPackMountPreflight } from '@/domain/mods/thirdPartyDataPackMountPreflight'
import { buildThirdPartyDataPackMountInput } from '@/domain/mods/thirdPartyDataPackMountInput'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const fixtureRoot = path.join(cwd(), 'src/tests/fixtures/mods/third-party-discovery')

type JsonObject = Record<string, unknown>
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-mount-input-'))
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
    authors: [{ name: 'Mount Input Tester', role: 'developer' }],
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
  const mountInput = buildThirdPartyDataPackMountInput({
    officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult,
    preflight
  })
  return {
    officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult,
    preflight,
    mountInput
  }
}

const expectReadOnlyEffects = (input: ReturnType<typeof buildThirdPartyDataPackMountInput>): void => {
  expect(input.effects).toEqual({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    packageFilesWritten: false,
    cacheWritten: false
  })
  expect(Object.isFrozen(input.effects)).toBe(true)
}

const expectFrozenMountInputOutput = (
  input: ReturnType<typeof buildThirdPartyDataPackMountInput>
): void => {
  expect(Object.isFrozen(input)).toBe(true)
  expect(Object.isFrozen(input.diagnostics)).toBe(true)
  expect(input.diagnostics.every(diagnostic => Object.isFrozen(diagnostic))).toBe(true)
  expect(input.diagnostics.every(diagnostic =>
    diagnostic.relatedPackageIds === undefined || Object.isFrozen(diagnostic.relatedPackageIds)
  )).toBe(true)
  expect(input.diagnostics.every(diagnostic =>
    diagnostic.details === undefined || Object.isFrozen(diagnostic.details)
  )).toBe(true)
  expect(Object.isFrozen(input.selectedPackageIds)).toBe(true)
  expect(Object.isFrozen(input.blockedPackageIds)).toBe(true)
  expect(Object.isFrozen(input.blockedCandidatePaths)).toBe(true)
  expect(Object.isFrozen(input.loadOrder)).toBe(true)
  expect(Object.isFrozen(input.officialIdentity)).toBe(true)
  expect(input.candidateIdentity === undefined || Object.isFrozen(input.candidateIdentity)).toBe(true)
  expect(Object.isFrozen(input.preflight)).toBe(true)
  expect(input.candidateSnapshot === undefined || Object.isFrozen(input.candidateSnapshot)).toBe(true)
  expect(input.candidateSnapshot === undefined || Object.isFrozen(input.candidateSnapshot.registries)).toBe(true)
  expect(input.candidateSnapshot?.registries.every(registry => Object.isFrozen(registry))).not.toBe(false)
  expect(input.candidateSnapshot?.registries.every(registry => Object.isFrozen(registry.entries))).not.toBe(false)
  expect(input.candidateSnapshot?.registries.every(registry =>
    registry.entries.every(entry => Object.isFrozen(entry) && Object.isFrozen(entry.source) && Object.isFrozen(entry.entry))
  )).not.toBe(false)
  expect(input.lockfileDraft === undefined || Object.isFrozen(input.lockfileDraft)).toBe(true)
  expect(input.lockfileDraft === undefined || Object.isFrozen(input.lockfileDraft.selectedPackageIds)).toBe(true)
  expect(input.lockfileDraft === undefined || Object.isFrozen(input.lockfileDraft.loadOrder)).toBe(true)
  expect(input.lockfileDraft === undefined || Object.isFrozen(input.lockfileDraft.packages)).toBe(true)
  expect(input.lockfileDraft?.packages.every(pkg => Object.isFrozen(pkg))).not.toBe(false)
  expect(input.lockfileDraft?.packages.every(pkg =>
    Object.isFrozen(pkg.source)
    && Object.isFrozen(pkg.source.contentFiles)
    && Object.isFrozen(pkg.resolvedDependencies)
    && Object.isFrozen(pkg.contentFiles)
    && pkg.contentFiles.every(file => Object.isFrozen(file) && Object.isFrozen(file.entries))
  )).not.toBe(false)
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

describe('third-party data pack mount input', () => {
  it('prepares a frozen in-memory mount input only for ready preflights', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { candidateSnapshot, lockfileDraftResult, mountInput } = await buildReportsFromRoot(root)

    expect(mountInput.status).toBe('ready')
    expect(mountInput.preflightStatus).toBe('ready')
    expect(mountInput.reason).toBe('ready for future runtime mount adapter')
    expect(mountInput.runtimePublication).toBe('deferred')
    expect(mountInput.selectedPackageIds).toEqual(['discovery_valid'])
    expect(mountInput.loadOrder).toEqual(['discovery_valid'])
    expect(mountInput.registryCount).toBe(54)
    expect(mountInput.entryCount).toBe(4244)
    expect(mountInput.packageCount).toBe(1)
    expect(mountInput.candidateIdentity?.candidateHash).toBe(candidateSnapshot.candidateIdentity?.candidateHash)
    expect(mountInput.lockfileHash).toBe(lockfileDraftResult.draft?.lockfileHash)
    expect(mountInput.candidateRegistrySet?.currentPhase).toBe('frozen')
    expect(mountInput.candidateSnapshot?.snapshotHash).toBe(candidateSnapshot.candidateSnapshot?.snapshotHash)
    expect(mountInput.lockfileDraft).toEqual(lockfileDraftResult.draft)
    expect(mountInput.lockfileDraft).not.toBe(lockfileDraftResult.draft)
    expectReadOnlyEffects(mountInput)
    expectFrozenMountInputOutput(mountInput)
    const frozenOutputSnapshot = JSON.stringify({
      selectedPackageIds: mountInput.selectedPackageIds,
      loadOrder: mountInput.loadOrder,
      officialIdentity: mountInput.officialIdentity,
      candidateIdentity: mountInput.candidateIdentity,
      effects: mountInput.effects,
      candidateSnapshot: mountInput.candidateSnapshot,
      lockfileDraft: mountInput.lockfileDraft
    })
    expect(Reflect.set(mountInput as unknown as Record<string, unknown>, 'reason', 'mutated')).toBe(false)
    expect(() => {
      (mountInput.selectedPackageIds as unknown as unknown[]).push('mutated_pack')
    }).toThrow(TypeError)
    expect(() => {
      (mountInput.loadOrder as unknown as unknown[]).push('mutated_pack')
    }).toThrow(TypeError)
    expect(Reflect.set(mountInput.officialIdentity as unknown as Record<string, unknown>, 'registryCount', 1)).toBe(false)
    if (mountInput.candidateIdentity === undefined) throw new Error('Expected frozen candidate identity.')
    expect(Reflect.set(mountInput.candidateIdentity as unknown as Record<string, unknown>, 'candidateHash', testHash('7'))).toBe(false)
    expect(Reflect.set(mountInput.effects as unknown as Record<string, unknown>, 'cacheWritten', true)).toBe(false)
    const firstRegistry = mountInput.candidateSnapshot?.registries[0]
    if (firstRegistry === undefined) throw new Error('Expected frozen candidate snapshot registry.')
    expect(() => {
      (mountInput.candidateSnapshot?.registries as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(firstRegistry as unknown as Record<string, unknown>, 'registryId', 'mutated')).toBe(false)
    const firstPackage = mountInput.lockfileDraft?.packages[0]
    if (firstPackage === undefined) throw new Error('Expected frozen lockfile draft package.')
    expect(() => {
      (mountInput.lockfileDraft?.packages as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(firstPackage as unknown as Record<string, unknown>, 'version', '9.9.9')).toBe(false)
    expect(JSON.stringify({
      selectedPackageIds: mountInput.selectedPackageIds,
      loadOrder: mountInput.loadOrder,
      officialIdentity: mountInput.officialIdentity,
      candidateIdentity: mountInput.candidateIdentity,
      effects: mountInput.effects,
      candidateSnapshot: mountInput.candidateSnapshot,
      lockfileDraft: mountInput.lockfileDraft
    })).toBe(frozenOutputSnapshot)
    expectOfficialBaseline()
  }, 15_000)

  it('does not expose candidate artifacts when there are no selected packages', async() => {
    const root = await createRoot()

    const { mountInput } = await buildReportsFromRoot(root)

    expect(mountInput.status).toBe('skipped')
    expect(mountInput.preflightStatus).toBe('skipped')
    expect(mountInput.reason).toBe('no selected third-party data packs')
    expect(mountInput.registryCount).toBe(54)
    expect(mountInput.entryCount).toBe(4242)
    expect(mountInput.packageCount).toBe(0)
    expect(mountInput.candidateRegistrySet).toBeUndefined()
    expect(mountInput.candidateSnapshot).toBeUndefined()
    expect(mountInput.lockfileDraft).toBeUndefined()
    expectReadOnlyEffects(mountInput)
    expectFrozenMountInputOutput(mountInput)
    expectOfficialBaseline()
  }, 15_000)

  it('blocks invalid preflights and retains only diagnostics plus official identity', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-schema', {
      id: 'bad_schema',
      items: [createItem('bad_schema:broken', -1)]
    })

    const { mountInput } = await buildReportsFromRoot(root)

    expect(mountInput.status).toBe('blocked')
    expect(mountInput.preflightStatus).toBe('rolled-back')
    expect(mountInput.reason).toBe('discovery failed')
    expect(mountInput.registryCount).toBe(54)
    expect(mountInput.entryCount).toBe(4242)
    expect(mountInput.candidateRegistrySet).toBeUndefined()
    expect(mountInput.candidateSnapshot).toBeUndefined()
    expect(mountInput.lockfileDraft).toBeUndefined()
    expect(mountInput.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'SCHEMA-VALIDATE-001' }),
      expect.objectContaining({ stage: 'third-party.lockfile-draft.candidate' })
    ]))
    expectReadOnlyEffects(mountInput)
    expectFrozenMountInputOutput(mountInput)
    expectOfficialBaseline()
  }, 15_000)

  it('is deterministic and does not mutate reports, package files, saves or settings', async() => {
    const root = await createRoot()
    const packsRoot = path.join(root, 'packs')
    const userDataRoot = path.join(root, 'userdata')
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(packsRoot, 'valid-gift-pack'), { recursive: true })
    await mkdir(path.join(userDataRoot, 'Local Storage', 'leveldb'), { recursive: true })
    await writeFile(path.join(userDataRoot, 'settings.json'), '{"closeToTray":false}\n', 'utf8')
    await writeFile(path.join(userDataRoot, 'Local Storage', 'leveldb', 'save.ldb'), 'player-save-data', 'utf8')
    const filesBefore = await collectFileContents(root)
    const reports = await buildReportsFromRoot(packsRoot)
    const officialBefore = createSerializableRegistrySnapshot(reports.officialRegistrySet)
    const discoveryBefore = JSON.stringify(reports.discoveryReport)
    const selectionBefore = JSON.stringify(reports.selectionReport)
    const candidateBefore = JSON.stringify(reports.candidateSnapshot)
    const draftBefore = JSON.stringify(reports.lockfileDraftResult)

    const repeated = buildThirdPartyDataPackMountInput({
      officialRegistrySet: reports.officialRegistrySet,
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot: reports.candidateSnapshot,
      lockfileDraftResult: reports.lockfileDraftResult,
      lockfileValidationResult: reports.lockfileValidationResult,
      preflight: reports.preflight
    })

    expect(reports.mountInput.status).toBe('ready')
    expect(repeated).toEqual(reports.mountInput)
    expect(createSerializableRegistrySnapshot(reports.officialRegistrySet)).toEqual(officialBefore)
    expect(JSON.stringify(reports.discoveryReport)).toBe(discoveryBefore)
    expect(JSON.stringify(reports.selectionReport)).toBe(selectionBefore)
    expect(JSON.stringify(reports.candidateSnapshot)).toBe(candidateBefore)
    expect(JSON.stringify(reports.lockfileDraftResult)).toBe(draftBefore)
    expect(await collectFileContents(root)).toEqual(filesBefore)
    expectReadOnlyEffects(repeated)
    expectOfficialBaseline()
  }, 15_000)

  it('copies upstream identity summaries before exposing mount input reports', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const {
      officialRegistrySet,
      discoveryReport,
      selectionReport,
      candidateSnapshot,
      lockfileDraftResult,
      lockfileValidationResult,
      preflight
    } = await buildReportsFromRoot(root)
    const mutablePreflight = {
      ...preflight,
      officialIdentity: { ...preflight.officialIdentity },
      candidateIdentity: preflight.candidateIdentity ? { ...preflight.candidateIdentity } : undefined
    }
    const mountInput = buildThirdPartyDataPackMountInput({
      officialRegistrySet,
      discoveryReport,
      selectionReport,
      candidateSnapshot,
      lockfileDraftResult,
      lockfileValidationResult,
      preflight: mutablePreflight
    })
    const originalCandidateHash = mountInput.candidateIdentity?.candidateHash

    expect(mountInput.officialIdentity).toEqual(mutablePreflight.officialIdentity)
    expect(mountInput.candidateIdentity).toEqual(mutablePreflight.candidateIdentity)
    expect(mountInput.officialIdentity).not.toBe(mutablePreflight.officialIdentity)
    expect(mountInput.candidateIdentity).not.toBe(mutablePreflight.candidateIdentity)
    expect(originalCandidateHash).toMatch(/^sha256:/)

    const mutableOfficialIdentity = mutablePreflight.officialIdentity as { registryCount: number }
    const mutableCandidateIdentity = mutablePreflight.candidateIdentity as { candidateHash: Sha256Hash }
    mutableOfficialIdentity.registryCount = 1
    mutableCandidateIdentity.candidateHash = testHash('5')

    expect(mountInput.officialIdentity.registryCount).toBe(54)
    expect(mountInput.candidateIdentity?.candidateHash).toBe(originalCandidateHash)
    expectReadOnlyEffects(mountInput)
    expectFrozenMountInputOutput(mountInput)
    expectOfficialBaseline()
  }, 15_000)

  it('copies upstream diagnostics before exposing mount input reports', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { officialRegistrySet, discoveryReport, selectionReport, candidateSnapshot, lockfileDraftResult, lockfileValidationResult, preflight } = await buildReportsFromRoot(root)
    const relatedPackageId = requirePackageId('related_pack')
    let inheritedDetailsRead = false
    const inheritedDetailsPrototype = {}
    Object.defineProperty(inheritedDetailsPrototype, 'hostPath', {
      enumerable: true,
      get() {
        inheritedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/mount-input-diagnostic-detail')
      }
    })
    const diagnosticDetails = Object.assign(Object.create(inheritedDetailsPrototype), {
      reason: 'original',
      nested: { count: 1 },
      list: ['original']
    }) as Record<string, JsonValue>
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.mount-input.test',
      relatedPackageIds: [relatedPackageId],
      details: diagnosticDetails
    })
    const mutablePreflight = {
      ...preflight,
      diagnostics: [...preflight.diagnostics, upstreamDiagnostic]
    }

    const mountInput = buildThirdPartyDataPackMountInput({
      officialRegistrySet,
      discoveryReport,
      selectionReport,
      candidateSnapshot,
      lockfileDraftResult,
      lockfileValidationResult,
      preflight: mutablePreflight
    })

    expect(inheritedDetailsRead).toBe(false)
    expect(mountInput.diagnostics).toEqual([upstreamDiagnostic])
    expect(mountInput.diagnostics[0]).not.toBe(upstreamDiagnostic)
    expect(mountInput.diagnostics[0]?.relatedPackageIds).not.toBe(upstreamDiagnostic.relatedPackageIds)
    expect(mountInput.diagnostics[0]?.details).not.toBe(upstreamDiagnostic.details)
    expect(mountInput.diagnostics[0]?.details).not.toHaveProperty('hostPath')
    expect(mountInput.diagnostics[0]?.details?.nested).not.toBe(upstreamDiagnostic.details?.nested)
    expect(mountInput.diagnostics[0]?.details?.list).not.toBe(upstreamDiagnostic.details?.list)
    expectFrozenMountInputOutput(mountInput)
    expect(Object.isFrozen(mountInput.diagnostics[0])).toBe(true)
    expect(Object.isFrozen(mountInput.diagnostics[0]?.relatedPackageIds)).toBe(true)
    expect(Object.isFrozen(mountInput.diagnostics[0]?.details)).toBe(true)
    expect(Object.isFrozen(mountInput.diagnostics[0]?.details?.nested)).toBe(true)
    expect(Object.isFrozen(mountInput.diagnostics[0]?.details?.list)).toBe(true)
    expect(Reflect.set(mountInput.diagnostics[0] as unknown as Record<string, unknown>, 'stage', 'mutated')).toBe(false)
    expect(() => {
      (mountInput.diagnostics as unknown as unknown[]).push(upstreamDiagnostic)
    }).toThrow(TypeError)

    upstreamDiagnostic.stage = 'mutated'
    upstreamDiagnostic.relatedPackageIds?.push(requirePackageId('mutated_pack'))
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

    expect(inheritedDetailsRead).toBe(false)
    expect(JSON.stringify(mountInput)).not.toContain('C:/Users')
    expect(JSON.stringify(mountInput)).not.toContain('LENOVO')
    expect(JSON.stringify(mountInput)).not.toContain('mount-input-diagnostic-detail')
    expect(mountInput.diagnostics[0]).toMatchObject({
      stage: 'third-party.mount-input.test',
      relatedPackageIds: ['related_pack'],
      details: {
        reason: 'original',
        nested: { count: 1 },
        list: ['original']
      }
    })
    expectReadOnlyEffects(mountInput)
    expectOfficialBaseline()
  }, 15_000)

  it('ignores own accessor preflight diagnostic details before exposing mount input reports', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { officialRegistrySet, discoveryReport, selectionReport, candidateSnapshot, lockfileDraftResult, lockfileValidationResult, preflight } = await buildReportsFromRoot(root)
    let ownDetailsRead = false
    const listDetails = ['first', 'placeholder'] as JsonValue[]
    Object.defineProperty(listDetails, '1', {
      enumerable: true,
      get() {
        ownDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/mount-input-list-diagnostic-detail')
      }
    })
    const nestedDetails: Record<string, JsonValue> = { marker: 'original' }
    Object.defineProperty(nestedDetails, 'ownHostPath', {
      enumerable: true,
      get() {
        ownDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/mount-input-nested-diagnostic-detail')
      }
    })
    const diagnosticDetails = {
      reason: 'preflight warning',
      nested: nestedDetails,
      list: listDetails
    } as Record<string, JsonValue>
    Object.defineProperty(diagnosticDetails, 'ownHostPath', {
      enumerable: true,
      get() {
        ownDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/mount-input-own-diagnostic-detail')
      }
    })
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'test.mount-input.own-accessor',
      severity: 'warning',
      packageId: requirePackageId('discovery_valid'),
      relatedPackageIds: [requirePackageId('discovery_valid')],
      details: diagnosticDetails
    })
    const mutablePreflight = {
      ...preflight,
      diagnostics: [upstreamDiagnostic],
      stages: preflight.stages.map(currentStage =>
        currentStage.name === 'runtime-publish'
          ? { ...currentStage, diagnostics: [upstreamDiagnostic] }
          : currentStage
      )
    }

    const mountInput = buildThirdPartyDataPackMountInput({
      officialRegistrySet,
      discoveryReport,
      selectionReport,
      candidateSnapshot,
      lockfileDraftResult,
      lockfileValidationResult,
      preflight: mutablePreflight
    })
    const copiedDiagnostic = mountInput.diagnostics[0]
    const copiedStageDiagnostic = mountInput.preflight.stages
      .find(currentStage => currentStage.name === 'runtime-publish')
      ?.diagnostics[0]
    if (copiedDiagnostic === undefined || copiedStageDiagnostic === undefined) {
      throw new Error('Expected copied mount input diagnostics.')
    }

    expect(mountInput.status).toBe('ready')
    expect(ownDetailsRead).toBe(false)
    expect(copiedDiagnostic).toMatchObject({
      stage: 'test.mount-input.own-accessor',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'preflight warning',
        nested: { marker: 'original' },
        list: ['first', null]
      }
    })
    expect(copiedStageDiagnostic).toMatchObject(copiedDiagnostic)
    expect(Object.is(copiedDiagnostic, upstreamDiagnostic)).toBe(false)
    expect(Object.is(copiedDiagnostic?.details, diagnosticDetails)).toBe(false)
    expect(Object.is(copiedDiagnostic?.details?.nested, nestedDetails)).toBe(false)
    expect(Object.is(copiedDiagnostic?.details?.list, listDetails)).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(copiedDiagnostic?.details, 'ownHostPath')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(copiedDiagnostic?.details?.nested, 'ownHostPath')).toBe(false)
    expect(Object.isFrozen(copiedDiagnostic?.details)).toBe(true)
    expect(Object.isFrozen(copiedDiagnostic?.details?.nested)).toBe(true)
    expect(Object.isFrozen(copiedDiagnostic?.details?.list)).toBe(true)
    expect(Object.isFrozen(copiedStageDiagnostic?.details)).toBe(true)
    expect(JSON.stringify(mountInput)).not.toContain('C:/Users')
    expect(JSON.stringify(mountInput)).not.toContain('LENOVO')
    expect(JSON.stringify(mountInput)).not.toContain('mount-input-own-diagnostic-detail')
    expect(JSON.stringify(mountInput)).not.toContain('mount-input-nested-diagnostic-detail')
    expect(JSON.stringify(mountInput)).not.toContain('mount-input-list-diagnostic-detail')
    expectReadOnlyEffects(mountInput)
    expectFrozenMountInputOutput(mountInput)
    expectOfficialBaseline()
  }, 15_000)

  it('copies preflight diagnostic array details without reading hostile proxy lengths', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { officialRegistrySet, discoveryReport, selectionReport, candidateSnapshot, lockfileDraftResult, lockfileValidationResult, preflight } = await buildReportsFromRoot(root)
    let lengthRead = false
    const listDetails = new Proxy(['first', { stable: true }] as JsonValue[], {
      get(target, property, receiver) {
        if (property === 'length') {
          lengthRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/mount-input-list-length')
        }
        return Reflect.get(target, property, receiver)
      }
    })
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'test.mount-input.proxy-array',
      severity: 'warning',
      packageId: requirePackageId('discovery_valid'),
      relatedPackageIds: [requirePackageId('discovery_valid')],
      details: {
        reason: 'proxy array details',
        list: listDetails as JsonValue
      }
    })
    const mutablePreflight = {
      ...preflight,
      diagnostics: [upstreamDiagnostic],
      stages: preflight.stages.map(currentStage =>
        currentStage.name === 'runtime-publish'
          ? { ...currentStage, diagnostics: [upstreamDiagnostic] }
          : currentStage
      )
    }

    const mountInput = buildThirdPartyDataPackMountInput({
      officialRegistrySet,
      discoveryReport,
      selectionReport,
      candidateSnapshot,
      lockfileDraftResult,
      lockfileValidationResult,
      preflight: mutablePreflight
    })
    const copiedDiagnostic = mountInput.diagnostics[0]
    const copiedStageDiagnostic = mountInput.preflight.stages
      .find(currentStage => currentStage.name === 'runtime-publish')
      ?.diagnostics[0]
    if (copiedDiagnostic === undefined || copiedStageDiagnostic === undefined) {
      throw new Error('Expected copied mount input diagnostics.')
    }

    expect(mountInput.status).toBe('ready')
    expect(lengthRead).toBe(false)
    expect(copiedDiagnostic).toMatchObject({
      stage: 'test.mount-input.proxy-array',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'proxy array details',
        list: ['first', { stable: true }]
      }
    })
    expect(copiedStageDiagnostic).toMatchObject(copiedDiagnostic)
    expect(Object.is(copiedDiagnostic, upstreamDiagnostic)).toBe(false)
    expect(Object.is(copiedDiagnostic.details?.list, listDetails)).toBe(false)
    expect(Object.isFrozen(copiedDiagnostic.details?.list)).toBe(true)
    expect(Object.isFrozen(copiedStageDiagnostic.details?.list)).toBe(true)
    expect(JSON.stringify(mountInput)).not.toContain('C:/Users')
    expect(JSON.stringify(mountInput)).not.toContain('LENOVO')
    expect(JSON.stringify(mountInput)).not.toContain('mount-input-list-length')
    expectReadOnlyEffects(mountInput)
    expectFrozenMountInputOutput(mountInput)
    expectOfficialBaseline()
  }, 15_000)

  it('copies preflight diagnostic related package ids without reading hostile proxy lengths', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { officialRegistrySet, discoveryReport, selectionReport, candidateSnapshot, lockfileDraftResult, lockfileValidationResult, preflight } = await buildReportsFromRoot(root)
    let lengthRead = false
    const relatedPackageIds = new Proxy([
      requirePackageId('discovery_valid'),
      requirePackageId('related_pack')
    ], {
      get(target, property, receiver) {
        if (property === 'length') {
          lengthRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/mount-input-related-package-length')
        }
        return Reflect.get(target, property, receiver)
      }
    }) as ReturnType<typeof requirePackageId>[]
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'test.mount-input.proxy-related-package-ids',
      severity: 'warning',
      packageId: requirePackageId('discovery_valid'),
      relatedPackageIds,
      details: {
        reason: 'proxy related package ids'
      }
    })
    const mutablePreflight = {
      ...preflight,
      diagnostics: [upstreamDiagnostic],
      stages: preflight.stages.map(currentStage =>
        currentStage.name === 'runtime-publish'
          ? { ...currentStage, diagnostics: [upstreamDiagnostic] }
          : currentStage
      )
    }

    const mountInput = buildThirdPartyDataPackMountInput({
      officialRegistrySet,
      discoveryReport,
      selectionReport,
      candidateSnapshot,
      lockfileDraftResult,
      lockfileValidationResult,
      preflight: mutablePreflight
    })
    const copiedDiagnostic = mountInput.diagnostics[0]
    const copiedStageDiagnostic = mountInput.preflight.stages
      .find(currentStage => currentStage.name === 'runtime-publish')
      ?.diagnostics[0]
    if (copiedDiagnostic === undefined || copiedStageDiagnostic === undefined) {
      throw new Error('Expected copied mount input diagnostics.')
    }

    expect(mountInput.status).toBe('ready')
    expect(lengthRead).toBe(false)
    expect(copiedDiagnostic).toMatchObject({
      stage: 'test.mount-input.proxy-related-package-ids',
      relatedPackageIds: ['discovery_valid', 'related_pack'],
      details: {
        reason: 'proxy related package ids'
      }
    })
    expect(copiedStageDiagnostic).toMatchObject(copiedDiagnostic)
    expect(Object.is(copiedDiagnostic.relatedPackageIds, relatedPackageIds)).toBe(false)
    expect(Object.is(copiedStageDiagnostic.relatedPackageIds, relatedPackageIds)).toBe(false)
    expect(Object.isFrozen(copiedDiagnostic.relatedPackageIds)).toBe(true)
    expect(Object.isFrozen(copiedStageDiagnostic.relatedPackageIds)).toBe(true)
    expect(JSON.stringify(mountInput)).not.toContain('C:/Users')
    expect(JSON.stringify(mountInput)).not.toContain('LENOVO')
    expect(JSON.stringify(mountInput)).not.toContain('mount-input-related-package-length')
    expectReadOnlyEffects(mountInput)
    expectFrozenMountInputOutput(mountInput)
    expectOfficialBaseline()
  }, 15_000)

  it('copies the serializable candidate snapshot before exposing mount input artifacts', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { candidateSnapshot, mountInput } = await buildReportsFromRoot(root)
    const upstreamSnapshot = candidateSnapshot.candidateSnapshot!
    const exposedSnapshot = mountInput.candidateSnapshot!
    const originalSnapshotHash = exposedSnapshot.snapshotHash

    expect(exposedSnapshot).toEqual(upstreamSnapshot)
    expect(exposedSnapshot).not.toBe(upstreamSnapshot)
    expect(exposedSnapshot.registries).not.toBe(upstreamSnapshot.registries)
    expect(Object.isFrozen(upstreamSnapshot)).toBe(true)
    expect(Object.isFrozen(upstreamSnapshot.registries)).toBe(true)
    expect(originalSnapshotHash).toMatch(/^sha256:/)

    const mutableUpstreamSnapshot = upstreamSnapshot as {
      snapshotHash: Sha256Hash
      registries: unknown[]
    }
    expect(() => {
      mutableUpstreamSnapshot.snapshotHash = testHash('6')
    }).toThrow(TypeError)
    expect(() => {
      mutableUpstreamSnapshot.registries.length = 0
    }).toThrow(TypeError)

    expect(mountInput.candidateSnapshot?.snapshotHash).toBe(originalSnapshotHash)
    expect(mountInput.candidateSnapshot?.registries).toHaveLength(54)
    expectReadOnlyEffects(mountInput)
    expectFrozenMountInputOutput(mountInput)
    expectOfficialBaseline()
  }, 15_000)
})
