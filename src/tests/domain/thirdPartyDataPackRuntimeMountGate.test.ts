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
import { buildThirdPartyCandidateRegistrySnapshot } from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDiscoveryDirectoryEntry,
  type ThirdPartyDiscoveryFileSystem
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import {
  createThirdPartyDataPackLockfileDraft,
  validateThirdPartyDataPackLockfileDraft
} from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import {
  buildThirdPartyDataPackMountInput,
  type ThirdPartyDataPackMountInputResult
} from '@/domain/mods/thirdPartyDataPackMountInput'
import { buildThirdPartyDataPackMountPreflight } from '@/domain/mods/thirdPartyDataPackMountPreflight'
import { buildThirdPartyDataPackRuntimeMountGate } from '@/domain/mods/thirdPartyDataPackRuntimeMountGate'
import { selectThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackSelection'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const fixtureRoot = path.join(cwd(), 'src/tests/fixtures/mods/third-party-discovery')

type JsonObject = Record<string, unknown>
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-runtime-mount-gate-'))
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
    authors: [{ name: 'Runtime Mount Gate Tester', role: 'developer' }],
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
  const runtimeGate = buildThirdPartyDataPackRuntimeMountGate({
    officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult,
    preflight,
    mountInput
  })
  return {
    officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult,
    preflight,
    mountInput,
    runtimeGate
  }
}

const expectNoWriteEffects = (gate: ReturnType<typeof buildThirdPartyDataPackRuntimeMountGate>): void => {
  expect(gate.effects).toEqual({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    packageFilesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false
  })
  expect(Object.isFrozen(gate.effects)).toBe(true)
}

const expectRequiredRuntimeGates = (
  gate: ReturnType<typeof buildThirdPartyDataPackRuntimeMountGate>
): void => {
  expect(gate.requiredGates.map(requirement => ({
    id: requirement.id,
    status: requirement.status
  }))).toEqual([
    { id: 'runtime-registry-publication', status: 'required' },
    { id: 'mod-lockfile-write', status: 'required' },
    { id: 'global-settings-persistence', status: 'required' },
    { id: 'save-environment-binding', status: 'required' },
    { id: 'lifecycle-transaction-recovery', status: 'required' }
  ])
  expect(gate.requiredGates.every(requirement => requirement.reason.length > 0)).toBe(true)
  expect(Object.isFrozen(gate.requiredGates)).toBe(true)
  expect(gate.requiredGates.every(requirement => Object.isFrozen(requirement))).toBe(true)
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

describe('third-party data pack runtime mount gate', () => {
  it('defers runtime publication for ready mount inputs until write and transaction gates exist', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { candidateSnapshot, lockfileDraftResult, runtimeGate } = await buildReportsFromRoot(root)

    expect(runtimeGate.status).toBe('deferred')
    expect(runtimeGate.mountInputStatus).toBe('ready')
    expect(runtimeGate.reason).toBe(
      'runtime publication is intentionally deferred until write and transaction gates are implemented'
    )
    expect(runtimeGate.runtimePublication).toBe('deferred')
    expect(runtimeGate.selectedPackageIds).toEqual(['discovery_valid'])
    expect(runtimeGate.loadOrder).toEqual(['discovery_valid'])
    expect(runtimeGate.registryCount).toBe(54)
    expect(runtimeGate.entryCount).toBe(4244)
    expect(runtimeGate.packageCount).toBe(1)
    expect(runtimeGate.candidateIdentity?.candidateHash).toBe(candidateSnapshot.candidateIdentity?.candidateHash)
    expect(runtimeGate.lockfileHash).toBe(lockfileDraftResult.draft?.lockfileHash)
    expectRequiredRuntimeGates(runtimeGate)
    expect('candidateRegistrySet' in runtimeGate).toBe(false)
    expect('candidateSnapshot' in runtimeGate).toBe(false)
    expect('lockfileDraft' in runtimeGate).toBe(false)
    expectNoWriteEffects(runtimeGate)
    const frozenOutputSnapshot = JSON.stringify({
      requiredGates: runtimeGate.requiredGates,
      effects: runtimeGate.effects
    })
    const firstGate = runtimeGate.requiredGates[0]
    if (firstGate === undefined) throw new Error('Expected at least one frozen runtime mount requirement.')
    expect(() => {
      (runtimeGate.requiredGates as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(firstGate as unknown as Record<string, unknown>, 'reason', 'mutated')).toBe(false)
    expect(Reflect.set(runtimeGate.effects as unknown as Record<string, unknown>, 'cacheWritten', true)).toBe(false)
    expect(JSON.stringify({
      requiredGates: runtimeGate.requiredGates,
      effects: runtimeGate.effects
    })).toBe(frozenOutputSnapshot)
    expectOfficialBaseline()
  }, 15_000)

  it('skips the runtime gate when no third-party packages are selected', async() => {
    const root = await createRoot()

    const { runtimeGate } = await buildReportsFromRoot(root)

    expect(runtimeGate.status).toBe('skipped')
    expect(runtimeGate.mountInputStatus).toBe('skipped')
    expect(runtimeGate.reason).toBe('no selected third-party data packs')
    expect(runtimeGate.registryCount).toBe(54)
    expect(runtimeGate.entryCount).toBe(4242)
    expect(runtimeGate.packageCount).toBe(0)
    expect(runtimeGate.requiredGates).toEqual([])
    expect(Object.isFrozen(runtimeGate.requiredGates)).toBe(true)
    expectNoWriteEffects(runtimeGate)
    expectOfficialBaseline()
  }, 15_000)

  it('blocks runtime publication when mount input is blocked', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-schema', {
      id: 'bad_schema',
      items: [createItem('bad_schema:broken', -1)]
    })

    const { runtimeGate } = await buildReportsFromRoot(root)

    expect(runtimeGate.status).toBe('blocked')
    expect(runtimeGate.mountInputStatus).toBe('blocked')
    expect(runtimeGate.reason).toBe('discovery failed')
    expect(runtimeGate.registryCount).toBe(54)
    expect(runtimeGate.entryCount).toBe(4242)
    expect(runtimeGate.requiredGates).toEqual([])
    expect(Object.isFrozen(runtimeGate.requiredGates)).toBe(true)
    expect(runtimeGate.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'SCHEMA-VALIDATE-001' }),
      expect.objectContaining({ stage: 'third-party.lockfile-draft.candidate' })
    ]))
    expectNoWriteEffects(runtimeGate)
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
    const inputBefore = JSON.stringify(reports.mountInput)

    const repeated = buildThirdPartyDataPackRuntimeMountGate({
      officialRegistrySet: reports.officialRegistrySet,
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot: reports.candidateSnapshot,
      lockfileDraftResult: reports.lockfileDraftResult,
      lockfileValidationResult: reports.lockfileValidationResult,
      preflight: reports.preflight,
      mountInput: reports.mountInput
    })

    expect(reports.runtimeGate.status).toBe('deferred')
    expect(repeated).toEqual(reports.runtimeGate)
    expect(createSerializableRegistrySnapshot(reports.officialRegistrySet)).toEqual(officialBefore)
    expect(JSON.stringify(reports.discoveryReport)).toBe(discoveryBefore)
    expect(JSON.stringify(reports.selectionReport)).toBe(selectionBefore)
    expect(JSON.stringify(reports.candidateSnapshot)).toBe(candidateBefore)
    expect(JSON.stringify(reports.lockfileDraftResult)).toBe(draftBefore)
    expect(JSON.stringify(reports.mountInput)).toBe(inputBefore)
    expect(await collectFileContents(root)).toEqual(filesBefore)
    expectNoWriteEffects(repeated)
    expectOfficialBaseline()
  }, 15_000)

  it('copies upstream identity summaries before exposing runtime mount gate reports', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { mountInput } = await buildReportsFromRoot(root)
    const mutableMountInput = {
      ...mountInput,
      officialIdentity: { ...mountInput.officialIdentity },
      candidateIdentity: mountInput.candidateIdentity ? { ...mountInput.candidateIdentity } : undefined
    }
    const runtimeGate = buildThirdPartyDataPackRuntimeMountGate({ mountInput: mutableMountInput } as never)
    const originalCandidateHash = runtimeGate.candidateIdentity?.candidateHash

    expect(runtimeGate.officialIdentity).toEqual(mutableMountInput.officialIdentity)
    expect(runtimeGate.candidateIdentity).toEqual(mutableMountInput.candidateIdentity)
    expect(runtimeGate.officialIdentity).not.toBe(mutableMountInput.officialIdentity)
    expect(runtimeGate.candidateIdentity).not.toBe(mutableMountInput.candidateIdentity)
    expect(originalCandidateHash).toMatch(/^sha256:/)

    const mutableOfficialIdentity = mutableMountInput.officialIdentity as { registryCount: number }
    const mutableCandidateIdentity = mutableMountInput.candidateIdentity as { candidateHash: Sha256Hash }
    mutableOfficialIdentity.registryCount = 1
    mutableCandidateIdentity.candidateHash = testHash('5')

    expect(runtimeGate.officialIdentity.registryCount).toBe(54)
    expect(runtimeGate.candidateIdentity?.candidateHash).toBe(originalCandidateHash)
    expectNoWriteEffects(runtimeGate)
    expectOfficialBaseline()
  }, 15_000)

  it('copies upstream diagnostics before exposing runtime mount gate reports', () => {
    const packageId = requirePackageId('discovery_valid')
    const relatedPackageId = requirePackageId('related_pack')
    let inheritedDetailsRead = false
    const inheritedDetailsPrototype = {}
    Object.defineProperty(inheritedDetailsPrototype, 'hostPath', {
      enumerable: true,
      get() {
        inheritedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/runtime-mount-diagnostic-detail')
      }
    })
    const diagnosticDetails = Object.assign(Object.create(inheritedDetailsPrototype), {
      reason: 'original',
      nested: { count: 1 },
      list: ['original']
    }) as Record<string, JsonValue>
    let ownDetailsRead = false
    let nestedDetailsRead = false
    Object.defineProperty(diagnosticDetails, 'ownHostPath', {
      enumerable: true,
      get() {
        ownDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/runtime-mount-own-diagnostic-detail')
      }
    })
    Object.defineProperty(diagnosticDetails.nested as Record<string, JsonValue>, 'ownHostPath', {
      enumerable: true,
      get() {
        nestedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/runtime-mount-nested-diagnostic-detail')
      }
    })
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.runtime-mount.test',
      relatedPackageIds: [relatedPackageId],
      details: diagnosticDetails
    })
    const mountInput: ThirdPartyDataPackMountInputResult = {
      status: 'ready',
      preflightStatus: 'ready',
      reason: 'mount input is ready',
      diagnostics: [upstreamDiagnostic],
      selectedPackageIds: [packageId],
      blockedPackageIds: [],
      blockedCandidatePaths: [],
      loadOrder: [packageId],
      registryCount: 54,
      entryCount: 4244,
      packageCount: 1,
      officialIdentity: {
        artifactHash: committedMetadata.artifactHash as Sha256Hash,
        contentHash: committedMetadata.contentHash as Sha256Hash,
        schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
        environmentHash: committedMetadata.environmentHash as Sha256Hash,
        snapshotHash: committedMetadata.snapshotHash as Sha256Hash,
        registryCount: 54,
        entryCount: 4242
      },
      candidateIdentity: {
        formatVersion: 1,
        contentHash: testHash('1'),
        snapshotHash: testHash('2'),
        candidateHash: testHash('3')
      },
      lockfileHash: testHash('4'),
      effects: {
        officialRegistryPublished: false,
        thirdPartyRegistryPublished: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        packageFilesWritten: false,
        cacheWritten: false
      },
      runtimePublication: 'deferred',
      preflight: {} as never
    }

    const gate = buildThirdPartyDataPackRuntimeMountGate({ mountInput } as never)

    expect(inheritedDetailsRead).toBe(false)
    expect(ownDetailsRead).toBe(false)
    expect(nestedDetailsRead).toBe(false)
    expect(gate.diagnostics).toHaveLength(1)
    expect(gate.diagnostics[0]).toMatchObject({
      code: upstreamDiagnostic.code,
      ruleId: upstreamDiagnostic.ruleId,
      severity: upstreamDiagnostic.severity,
      stage: upstreamDiagnostic.stage,
      messageKey: upstreamDiagnostic.messageKey,
      relatedPackageIds: [relatedPackageId],
      details: {
        reason: 'original',
        nested: { count: 1 },
        list: ['original']
      },
      recovery: upstreamDiagnostic.recovery
    })
    expect(Object.is(gate.diagnostics[0], upstreamDiagnostic)).toBe(false)
    expect(Object.is(gate.diagnostics[0]?.relatedPackageIds, upstreamDiagnostic.relatedPackageIds)).toBe(false)
    expect(Object.is(gate.diagnostics[0]?.details, upstreamDiagnostic.details)).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(gate.diagnostics[0]?.details, 'hostPath')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(gate.diagnostics[0]?.details, 'ownHostPath')).toBe(false)
    expect(Object.is(gate.diagnostics[0]?.details?.nested, upstreamDiagnostic.details?.nested)).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(gate.diagnostics[0]?.details?.nested, 'ownHostPath')).toBe(false)
    expect(Object.is(gate.diagnostics[0]?.details?.list, upstreamDiagnostic.details?.list)).toBe(false)

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
    expect(ownDetailsRead).toBe(false)
    expect(nestedDetailsRead).toBe(false)
    expect(JSON.stringify(gate)).not.toContain('C:/Users')
    expect(JSON.stringify(gate)).not.toContain('LENOVO')
    expect(JSON.stringify(gate)).not.toContain('runtime-mount-diagnostic-detail')
    expect(JSON.stringify(gate)).not.toContain('runtime-mount-own-diagnostic-detail')
    expect(JSON.stringify(gate)).not.toContain('runtime-mount-nested-diagnostic-detail')
    expect(gate.diagnostics[0]).toMatchObject({
      stage: 'third-party.runtime-mount.test',
      relatedPackageIds: ['related_pack'],
      details: {
        reason: 'original',
        nested: { count: 1 },
        list: ['original']
      }
    })
    expectNoWriteEffects(gate)
    expectOfficialBaseline()
  })
})
