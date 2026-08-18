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
import { buildThirdPartyDataPackMountInput } from '@/domain/mods/thirdPartyDataPackMountInput'
import { buildThirdPartyDataPackMountPreflight } from '@/domain/mods/thirdPartyDataPackMountPreflight'
import { buildThirdPartyDataPackRuntimeAdapterGate } from '@/domain/mods/thirdPartyDataPackRuntimeAdapterGate'
import { buildThirdPartyDataPackRuntimeMountGate } from '@/domain/mods/thirdPartyDataPackRuntimeMountGate'
import {
  buildThirdPartyDataPackTransactionPreflight,
  type ThirdPartyDataPackTransactionPreflightResult
} from '@/domain/mods/thirdPartyDataPackTransactionPreflight'
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
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-runtime-adapter-gate-'))
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
    authors: [{ name: 'Runtime Adapter Gate Tester', role: 'developer' }],
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
  const transactionPreflight = buildThirdPartyDataPackTransactionPreflight({
    officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult,
    preflight,
    mountInput,
    runtimeGate
  })
  const runtimeAdapterGate = buildThirdPartyDataPackRuntimeAdapterGate({
    officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult,
    preflight,
    mountInput,
    runtimeGate,
    transactionPreflight
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
    runtimeGate,
    transactionPreflight,
    runtimeAdapterGate
  }
}

const expectNoWriteEffects = (gate: ReturnType<typeof buildThirdPartyDataPackRuntimeAdapterGate>): void => {
  expect(gate.effects).toEqual({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    electronIpcExposed: false,
    webImportPersisted: false,
    androidImportPersisted: false,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false
  })
  expect(Object.isFrozen(gate.effects)).toBe(true)
}

const expectRequiredRuntimeAdapters = (
  gate: ReturnType<typeof buildThirdPartyDataPackRuntimeAdapterGate>
): void => {
  expect(gate.requiredAdapters.map(requirement => ({
    id: requirement.id,
    status: requirement.status
  }))).toEqual([
    { id: 'electron-restricted-ipc-source-adapter', status: 'satisfied' },
    { id: 'web-file-picker-indexeddb-adapter', status: 'satisfied' },
    { id: 'shared-core-mount-adapter', status: 'required' },
    { id: 'platform-storage-isolation', status: 'required' }
  ])
  expect(gate.requiredAdapters.every(requirement => requirement.reason.length > 0)).toBe(true)
  expect(Object.isFrozen(gate.requiredAdapters)).toBe(true)
  expect(gate.requiredAdapters.every(requirement => Object.isFrozen(requirement))).toBe(true)
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectRuntimeAdapterGateFrozen = (
  gate: ReturnType<typeof buildThirdPartyDataPackRuntimeAdapterGate>
): void => {
  expectJsonGraphFrozen(gate)
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

describe('third-party data pack runtime adapter gate', () => {
  it('recognizes platform adapters while keeping runtime enablement deferred', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { candidateSnapshot, lockfileDraftResult, runtimeAdapterGate } = await buildReportsFromRoot(root)

    expect(runtimeAdapterGate.status).toBe('deferred')
    expect(runtimeAdapterGate.transactionPreflightStatus).toBe('deferred')
    expect(runtimeAdapterGate.reason).toBe(
      'Web/Electron platform source adapters are defined; runtime enablement remains deferred until publication, transaction and write boundaries are implemented'
    )
    expect(runtimeAdapterGate.adapterReadiness).toBe('platform-sources-defined')
    expect(runtimeAdapterGate.runtimeEnablementAllowed).toBe(false)
    expect(runtimeAdapterGate.selectedPackageIds).toEqual(['discovery_valid'])
    expect(runtimeAdapterGate.loadOrder).toEqual(['discovery_valid'])
    expect(runtimeAdapterGate.registryCount).toBe(54)
    expect(runtimeAdapterGate.entryCount).toBe(4244)
    expect(runtimeAdapterGate.packageCount).toBe(1)
    expect(runtimeAdapterGate.candidateIdentity?.candidateHash).toBe(candidateSnapshot.candidateIdentity?.candidateHash)
    expect(runtimeAdapterGate.lockfileHash).toBe(lockfileDraftResult.draft?.lockfileHash)
    expectRequiredRuntimeAdapters(runtimeAdapterGate)
    expect('candidateRegistrySet' in runtimeAdapterGate).toBe(false)
    expect('candidateSnapshot' in runtimeAdapterGate).toBe(false)
    expect('lockfileDraft' in runtimeAdapterGate).toBe(false)
    expect('transactionPreflight' in runtimeAdapterGate).toBe(false)
    expectNoWriteEffects(runtimeAdapterGate)
    expectRuntimeAdapterGateFrozen(runtimeAdapterGate)
    const frozenOutputSnapshot = JSON.stringify({
      runtimeAdapterGate,
      requiredAdapters: runtimeAdapterGate.requiredAdapters,
      effects: runtimeAdapterGate.effects
    })
    const firstAdapter = runtimeAdapterGate.requiredAdapters[0]
    if (firstAdapter === undefined) throw new Error('Expected at least one frozen runtime adapter requirement.')
    expect(Reflect.set(runtimeAdapterGate as unknown as Record<string, unknown>, 'status', 'blocked')).toBe(false)
    expect(() => {
      (runtimeAdapterGate.selectedPackageIds as unknown as unknown[]).push('mutated')
    }).toThrow(TypeError)
    expect(() => {
      (runtimeAdapterGate.loadOrder as unknown as unknown[]).push('mutated')
    }).toThrow(TypeError)
    expect(Reflect.set(
      runtimeAdapterGate.officialIdentity as unknown as Record<string, unknown>,
      'registryCount',
      1
    )).toBe(false)
    if (!runtimeAdapterGate.candidateIdentity) throw new Error('Expected candidate identity for valid package gate.')
    expect(Reflect.set(
      runtimeAdapterGate.candidateIdentity as unknown as Record<string, unknown>,
      'candidateHash',
      testHash('9')
    )).toBe(false)
    expect(() => {
      (runtimeAdapterGate.requiredAdapters as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(firstAdapter as unknown as Record<string, unknown>, 'reason', 'mutated')).toBe(false)
    expect(Reflect.set(runtimeAdapterGate.effects as unknown as Record<string, unknown>, 'cacheWritten', true)).toBe(false)
    expect(JSON.stringify({
      runtimeAdapterGate,
      requiredAdapters: runtimeAdapterGate.requiredAdapters,
      effects: runtimeAdapterGate.effects
    })).toBe(frozenOutputSnapshot)
    expectOfficialBaseline()
  }, 30_000)

  it('skips runtime adapter gates when no third-party packages are selected', async() => {
    const root = await createRoot()

    const { runtimeAdapterGate } = await buildReportsFromRoot(root)

    expect(runtimeAdapterGate.status).toBe('skipped')
    expect(runtimeAdapterGate.transactionPreflightStatus).toBe('skipped')
    expect(runtimeAdapterGate.reason).toBe('no selected third-party data packs')
    expect(runtimeAdapterGate.registryCount).toBe(54)
    expect(runtimeAdapterGate.entryCount).toBe(4242)
    expect(runtimeAdapterGate.packageCount).toBe(0)
    expect(runtimeAdapterGate.requiredAdapters).toEqual([])
    expectNoWriteEffects(runtimeAdapterGate)
    expectRuntimeAdapterGateFrozen(runtimeAdapterGate)
    expectOfficialBaseline()
  }, 15_000)

  it('blocks runtime adapter gates when transaction preflight is blocked', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-schema', {
      id: 'bad_schema',
      items: [createItem('bad_schema:broken', -1)]
    })

    const { runtimeAdapterGate } = await buildReportsFromRoot(root)

    expect(runtimeAdapterGate.status).toBe('blocked')
    expect(runtimeAdapterGate.transactionPreflightStatus).toBe('blocked')
    expect(runtimeAdapterGate.reason).toBe('discovery failed')
    expect(runtimeAdapterGate.registryCount).toBe(54)
    expect(runtimeAdapterGate.entryCount).toBe(4242)
    expect(runtimeAdapterGate.requiredAdapters).toEqual([])
    expect(runtimeAdapterGate.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'SCHEMA-VALIDATE-001' }),
      expect.objectContaining({ stage: 'third-party.lockfile-draft.candidate' })
    ]))
    expectNoWriteEffects(runtimeAdapterGate)
    expectRuntimeAdapterGateFrozen(runtimeAdapterGate)
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
    const runtimeGateBefore = JSON.stringify(reports.runtimeGate)
    const transactionBefore = JSON.stringify(reports.transactionPreflight)

    const repeated = buildThirdPartyDataPackRuntimeAdapterGate({
      officialRegistrySet: reports.officialRegistrySet,
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot: reports.candidateSnapshot,
      lockfileDraftResult: reports.lockfileDraftResult,
      lockfileValidationResult: reports.lockfileValidationResult,
      preflight: reports.preflight,
      mountInput: reports.mountInput,
      runtimeGate: reports.runtimeGate,
      transactionPreflight: reports.transactionPreflight
    })

    expect(reports.runtimeAdapterGate.status).toBe('deferred')
    expect(repeated).toEqual(reports.runtimeAdapterGate)
    expect(createSerializableRegistrySnapshot(reports.officialRegistrySet)).toEqual(officialBefore)
    expect(JSON.stringify(reports.discoveryReport)).toBe(discoveryBefore)
    expect(JSON.stringify(reports.selectionReport)).toBe(selectionBefore)
    expect(JSON.stringify(reports.candidateSnapshot)).toBe(candidateBefore)
    expect(JSON.stringify(reports.lockfileDraftResult)).toBe(draftBefore)
    expect(JSON.stringify(reports.mountInput)).toBe(inputBefore)
    expect(JSON.stringify(reports.runtimeGate)).toBe(runtimeGateBefore)
    expect(JSON.stringify(reports.transactionPreflight)).toBe(transactionBefore)
    expect(await collectFileContents(root)).toEqual(filesBefore)
    expectNoWriteEffects(repeated)
    expectRuntimeAdapterGateFrozen(repeated)
    expectOfficialBaseline()
  }, 15_000)

  it('copies upstream identity summaries and diagnostics before exposing runtime adapter reports', () => {
    const packageId = requirePackageId('discovery_valid')
    const relatedPackageId = requirePackageId('related_pack')
    let inheritedDetailsRead = false
    const inheritedDetailsPrototype = {}
    Object.defineProperty(inheritedDetailsPrototype, 'hostPath', {
      enumerable: true,
      get() {
        inheritedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/runtime-adapter-diagnostic-detail')
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
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/runtime-adapter-own-diagnostic-detail')
      }
    })
    Object.defineProperty(diagnosticDetails.nested as Record<string, JsonValue>, 'ownHostPath', {
      enumerable: true,
      get() {
        nestedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/runtime-adapter-nested-diagnostic-detail')
      }
    })
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.runtime-adapter.test',
      relatedPackageIds: [relatedPackageId],
      details: diagnosticDetails
    })
    const transactionPreflight: ThirdPartyDataPackTransactionPreflightResult = {
      status: 'deferred',
      runtimeGateStatus: 'deferred',
      reason: 'lifecycle transaction commit is intentionally deferred until atomic write and recovery primitives are implemented',
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
      transactionCommit: 'deferred',
      commitAllowed: false,
      recoveryRequired: false,
      rollbackRequired: false,
      requiredTransactions: [],
      lifecycleOperations: [],
      effects: {
        officialRegistryPublished: false,
        thirdPartyRegistryPublished: false,
        packageFilesWritten: false,
        packageBackupsWritten: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    }

    const gate = buildThirdPartyDataPackRuntimeAdapterGate({
      transactionPreflight
    } as never)

    expect(inheritedDetailsRead).toBe(false)
    expect(ownDetailsRead).toBe(false)
    expect(nestedDetailsRead).toBe(false)
    expect(gate.officialIdentity).toEqual(transactionPreflight.officialIdentity)
    expect(gate.candidateIdentity).toEqual(transactionPreflight.candidateIdentity)
    expect(gate.officialIdentity).not.toBe(transactionPreflight.officialIdentity)
    expect(gate.candidateIdentity).not.toBe(transactionPreflight.candidateIdentity)
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
    expect(gate.diagnostics[0]?.details).not.toHaveProperty('hostPath')
    expect(gate.diagnostics[0]?.details).not.toHaveProperty('ownHostPath')
    expect(Object.is(gate.diagnostics[0]?.details?.nested, upstreamDiagnostic.details?.nested)).toBe(false)
    expect(gate.diagnostics[0]?.details?.nested).not.toHaveProperty('ownHostPath')
    expect(Object.is(gate.diagnostics[0]?.details?.list, upstreamDiagnostic.details?.list)).toBe(false)
    expectRuntimeAdapterGateFrozen(gate)

    const exposedOutputSnapshot = JSON.stringify(gate)
    expect(() => {
      (gate.diagnostics as unknown as unknown[]).push(upstreamDiagnostic)
    }).toThrow(TypeError)
    const exposedDiagnostic = gate.diagnostics[0]
    if (exposedDiagnostic === undefined) throw new Error('Expected copied diagnostic.')
    expect(Reflect.set(exposedDiagnostic as unknown as Record<string, unknown>, 'stage', 'mutated')).toBe(false)
    if (!exposedDiagnostic.relatedPackageIds) throw new Error('Expected copied related package ids.')
    expect(() => {
      (exposedDiagnostic.relatedPackageIds as unknown as unknown[]).push(requirePackageId('mutated_pack'))
    }).toThrow(TypeError)
    const exposedDetails = exposedDiagnostic.details
    if (exposedDetails === undefined) throw new Error('Expected copied diagnostic details.')
    expect(Reflect.set(exposedDetails as unknown as Record<string, unknown>, 'reason', 'mutated')).toBe(false)
    const exposedNestedDetails = exposedDetails.nested
    if (
      exposedNestedDetails === null
      || typeof exposedNestedDetails !== 'object'
      || Array.isArray(exposedNestedDetails)
    ) {
      throw new Error('Expected copied nested diagnostic details.')
    }
    expect(Reflect.set(exposedNestedDetails as Record<string, unknown>, 'count', 2)).toBe(false)
    const exposedListDetails = exposedDetails.list
    if (!Array.isArray(exposedListDetails)) throw new Error('Expected copied list diagnostic details.')
    expect(() => {
      (exposedListDetails as unknown as unknown[]).push('mutated')
    }).toThrow(TypeError)
    expect(JSON.stringify(gate)).toBe(exposedOutputSnapshot)

    const mutableOfficialIdentity = transactionPreflight.officialIdentity as { registryCount: number }
    const mutableCandidateIdentity = transactionPreflight.candidateIdentity as { candidateHash: Sha256Hash }
    mutableOfficialIdentity.registryCount = 1
    mutableCandidateIdentity.candidateHash = testHash('5')
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
    expect(JSON.stringify(gate)).not.toContain('runtime-adapter-diagnostic-detail')
    expect(JSON.stringify(gate)).not.toContain('runtime-adapter-own-diagnostic-detail')
    expect(JSON.stringify(gate)).not.toContain('runtime-adapter-nested-diagnostic-detail')
    expect(gate.officialIdentity.registryCount).toBe(54)
    expect(gate.candidateIdentity?.candidateHash).toBe(testHash('3'))
    expect(gate.diagnostics[0]).toMatchObject({
      stage: 'third-party.runtime-adapter.test',
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

  it('ignores own accessor transaction preflight diagnostic fields before exposing runtime adapter reports', () => {
    const packageId = requirePackageId('discovery_valid')
    const relatedPackageId = requirePackageId('related_pack')
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.runtime-adapter.accessor-test',
      severity: 'warning',
      packageId,
      relatedPackageIds: [relatedPackageId],
      details: { reason: 'original' }
    })
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
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/runtime-adapter-diagnostic-stage')
      }
    })
    Object.defineProperty(upstreamDiagnostic, 'relatedPackageIds', {
      enumerable: true,
      get() {
        relatedPackageIdsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/runtime-adapter-diagnostic-related')
      }
    })
    Object.defineProperty(upstreamDiagnostic, 'details', {
      enumerable: true,
      get() {
        detailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/runtime-adapter-diagnostic-details')
      }
    })
    const transactionPreflight: ThirdPartyDataPackTransactionPreflightResult = {
      status: 'deferred',
      runtimeGateStatus: 'deferred',
      reason: 'lifecycle transaction commit is intentionally deferred until atomic write and recovery primitives are implemented',
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
      transactionCommit: 'deferred',
      commitAllowed: false,
      recoveryRequired: false,
      rollbackRequired: false,
      requiredTransactions: [],
      lifecycleOperations: [],
      effects: {
        officialRegistryPublished: false,
        thirdPartyRegistryPublished: false,
        packageFilesWritten: false,
        packageBackupsWritten: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    }

    const gate = buildThirdPartyDataPackRuntimeAdapterGate({
      transactionPreflight
    } as never)
    const copiedDiagnostic = gate.diagnostics.find(diagnostic => diagnostic.code === originalCode)
    if (!copiedDiagnostic) throw new Error('Expected copied runtime adapter diagnostic.')

    expect(stageRead).toBe(false)
    expect(relatedPackageIdsRead).toBe(false)
    expect(detailsRead).toBe(false)
    expect(copiedDiagnostic).toMatchObject({
      code: originalCode,
      ruleId: originalRuleId,
      severity: originalSeverity,
      stage: 'third-party.runtime-adapter.diagnostic-copy',
      messageKey: originalMessageKey,
      packageId: 'discovery_valid',
      recovery: originalRecovery
    })
    expect(copiedDiagnostic.relatedPackageIds).toBeUndefined()
    expect(copiedDiagnostic.details).toBeUndefined()
    const serialized = JSON.stringify(gate)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('runtime-adapter-diagnostic-stage')
    expect(serialized).not.toContain('runtime-adapter-diagnostic-related')
    expect(serialized).not.toContain('runtime-adapter-diagnostic-details')
    expectNoWriteEffects(gate)
    expectRuntimeAdapterGateFrozen(gate)
    expectOfficialBaseline()
  })

  it('copies transaction preflight diagnostic array details without reading hostile proxy lengths', () => {
    const packageId = requirePackageId('discovery_valid')
    let lengthRead = false
    const listDetails = new Proxy(['first', { stable: true }] as JsonValue[], {
      get(target, property, receiver) {
        if (property === 'length') {
          lengthRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/runtime-adapter-list-length')
        }
        return Reflect.get(target, property, receiver)
      }
    })
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'test.runtime-adapter.proxy-array',
      severity: 'warning',
      packageId,
      relatedPackageIds: [packageId],
      details: {
        reason: 'proxy array details',
        list: listDetails as JsonValue
      }
    })
    const transactionPreflight: ThirdPartyDataPackTransactionPreflightResult = {
      status: 'deferred',
      runtimeGateStatus: 'deferred',
      reason: 'lifecycle transaction commit is intentionally deferred until atomic write and recovery primitives are implemented',
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
      transactionCommit: 'deferred',
      commitAllowed: false,
      recoveryRequired: false,
      rollbackRequired: false,
      requiredTransactions: [],
      lifecycleOperations: [],
      effects: {
        officialRegistryPublished: false,
        thirdPartyRegistryPublished: false,
        packageFilesWritten: false,
        packageBackupsWritten: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    }

    const gate = buildThirdPartyDataPackRuntimeAdapterGate({
      transactionPreflight
    } as never)
    const copiedDiagnostic = gate.diagnostics[0]
    if (copiedDiagnostic === undefined) throw new Error('Expected copied runtime adapter diagnostic.')

    expect(gate.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(copiedDiagnostic).toMatchObject({
      stage: 'test.runtime-adapter.proxy-array',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'proxy array details',
        list: ['first', { stable: true }]
      }
    })
    expect(Object.is(copiedDiagnostic, upstreamDiagnostic)).toBe(false)
    expect(Object.is(copiedDiagnostic.details?.list, listDetails)).toBe(false)
    expect(JSON.stringify(gate)).not.toContain('C:/Users')
    expect(JSON.stringify(gate)).not.toContain('LENOVO')
    expect(JSON.stringify(gate)).not.toContain('runtime-adapter-list-length')
    expectNoWriteEffects(gate)
    expectRuntimeAdapterGateFrozen(gate)
    expectOfficialBaseline()
  })

  it('copies transaction preflight diagnostic related package ids without reading hostile proxy lengths', () => {
    const packageId = requirePackageId('discovery_valid')
    const relatedPackageId = requirePackageId('related_pack')
    let lengthRead = false
    const relatedPackageIds = new Proxy([packageId, relatedPackageId], {
      get(target, property, receiver) {
        if (property === 'length') {
          lengthRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/runtime-adapter-related-package-length')
        }
        return Reflect.get(target, property, receiver)
      }
    }) as ReturnType<typeof requirePackageId>[]
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'test.runtime-adapter.proxy-related-package-ids',
      severity: 'warning',
      packageId,
      relatedPackageIds,
      details: {
        reason: 'proxy related package ids'
      }
    })
    const transactionPreflight: ThirdPartyDataPackTransactionPreflightResult = {
      status: 'deferred',
      runtimeGateStatus: 'deferred',
      reason: 'lifecycle transaction commit is intentionally deferred until atomic write and recovery primitives are implemented',
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
      transactionCommit: 'deferred',
      commitAllowed: false,
      recoveryRequired: false,
      rollbackRequired: false,
      requiredTransactions: [],
      lifecycleOperations: [],
      effects: {
        officialRegistryPublished: false,
        thirdPartyRegistryPublished: false,
        packageFilesWritten: false,
        packageBackupsWritten: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    }

    const gate = buildThirdPartyDataPackRuntimeAdapterGate({
      transactionPreflight
    } as never)
    const copiedDiagnostic = gate.diagnostics[0]
    if (copiedDiagnostic === undefined) throw new Error('Expected copied runtime adapter diagnostic.')

    expect(gate.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(copiedDiagnostic).toMatchObject({
      stage: 'test.runtime-adapter.proxy-related-package-ids',
      relatedPackageIds: ['discovery_valid', 'related_pack'],
      details: {
        reason: 'proxy related package ids'
      }
    })
    expect(Object.is(copiedDiagnostic, upstreamDiagnostic)).toBe(false)
    expect(Object.is(copiedDiagnostic.relatedPackageIds, relatedPackageIds)).toBe(false)
    expect(Object.isFrozen(copiedDiagnostic.relatedPackageIds)).toBe(true)
    expect(JSON.stringify(gate)).not.toContain('C:/Users')
    expect(JSON.stringify(gate)).not.toContain('LENOVO')
    expect(JSON.stringify(gate)).not.toContain('runtime-adapter-related-package-length')
    expectNoWriteEffects(gate)
    expectRuntimeAdapterGateFrozen(gate)
    expectOfficialBaseline()
  })

  it('copies transaction preflight diagnostics without reading hostile proxy lengths', () => {
    const packageId = requirePackageId('discovery_valid')
    let lengthRead = false
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'test.runtime-adapter.proxy-diagnostics',
      severity: 'warning',
      packageId,
      relatedPackageIds: [packageId],
      details: {
        reason: 'proxy diagnostics array'
      }
    })
    const diagnostics = new Proxy([upstreamDiagnostic], {
      get(target, property, receiver) {
        if (property === 'length') {
          lengthRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/runtime-adapter-diagnostics-length')
        }
        return Reflect.get(target, property, receiver)
      }
    }) as ThirdPartyDataPackTransactionPreflightResult['diagnostics']
    const transactionPreflight: ThirdPartyDataPackTransactionPreflightResult = {
      status: 'deferred',
      runtimeGateStatus: 'deferred',
      reason: 'lifecycle transaction commit is intentionally deferred until atomic write and recovery primitives are implemented',
      diagnostics,
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
      transactionCommit: 'deferred',
      commitAllowed: false,
      recoveryRequired: false,
      rollbackRequired: false,
      requiredTransactions: [],
      lifecycleOperations: [],
      effects: {
        officialRegistryPublished: false,
        thirdPartyRegistryPublished: false,
        packageFilesWritten: false,
        packageBackupsWritten: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    }

    const gate = buildThirdPartyDataPackRuntimeAdapterGate({
      transactionPreflight
    } as never)
    const copiedDiagnostic = gate.diagnostics[0]
    if (copiedDiagnostic === undefined) throw new Error('Expected copied runtime adapter diagnostic.')

    expect(gate.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(gate.diagnostics).toHaveLength(1)
    expect(copiedDiagnostic).toMatchObject({
      stage: 'test.runtime-adapter.proxy-diagnostics',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'proxy diagnostics array'
      }
    })
    expect(Object.is(gate.diagnostics, diagnostics)).toBe(false)
    expect(Object.is(copiedDiagnostic, upstreamDiagnostic)).toBe(false)
    expect(Object.is(copiedDiagnostic.relatedPackageIds, upstreamDiagnostic.relatedPackageIds)).toBe(false)
    expect(Object.isFrozen(gate.diagnostics)).toBe(true)
    expect(Object.isFrozen(copiedDiagnostic)).toBe(true)
    expect(JSON.stringify(gate)).not.toContain('C:/Users')
    expect(JSON.stringify(gate)).not.toContain('LENOVO')
    expect(JSON.stringify(gate)).not.toContain('runtime-adapter-diagnostics-length')
    expectNoWriteEffects(gate)
    expectRuntimeAdapterGateFrozen(gate)
    expectOfficialBaseline()
  })

  it('copies transaction preflight package summaries without reading hostile proxy lengths', () => {
    const packageId = requirePackageId('discovery_valid')
    const blockedPackageId = requirePackageId('blocked_pack')
    let lengthRead = false
    const createHostileStringArray = <T extends string>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/runtime-adapter-${label}-length`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const selectedPackageIds = createHostileStringArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileStringArray([blockedPackageId], 'blocked-package-ids')
    const blockedCandidatePaths = createHostileStringArray(['blocked-pack'], 'blocked-candidate-paths')
    const loadOrder = createHostileStringArray([packageId], 'load-order')
    const transactionPreflight: ThirdPartyDataPackTransactionPreflightResult = {
      status: 'deferred',
      runtimeGateStatus: 'deferred',
      reason: 'lifecycle transaction commit is intentionally deferred until atomic write and recovery primitives are implemented',
      diagnostics: [],
      selectedPackageIds,
      blockedPackageIds,
      blockedCandidatePaths,
      loadOrder,
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
      transactionCommit: 'deferred',
      commitAllowed: false,
      recoveryRequired: false,
      rollbackRequired: false,
      requiredTransactions: [],
      lifecycleOperations: [],
      effects: {
        officialRegistryPublished: false,
        thirdPartyRegistryPublished: false,
        packageFilesWritten: false,
        packageBackupsWritten: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    }

    const gate = buildThirdPartyDataPackRuntimeAdapterGate({ transactionPreflight } as never)

    expect(gate.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(gate.selectedPackageIds).toEqual(['discovery_valid'])
    expect(gate.blockedPackageIds).toEqual(['blocked_pack'])
    expect(gate.blockedCandidatePaths).toEqual(['blocked-pack'])
    expect(gate.loadOrder).toEqual(['discovery_valid'])
    expect(Object.is(gate.selectedPackageIds, selectedPackageIds)).toBe(false)
    expect(Object.is(gate.blockedPackageIds, blockedPackageIds)).toBe(false)
    expect(Object.is(gate.blockedCandidatePaths, blockedCandidatePaths)).toBe(false)
    expect(Object.is(gate.loadOrder, loadOrder)).toBe(false)
    expect(Object.isFrozen(gate.selectedPackageIds)).toBe(true)
    expect(Object.isFrozen(gate.blockedPackageIds)).toBe(true)
    expect(Object.isFrozen(gate.blockedCandidatePaths)).toBe(true)
    expect(Object.isFrozen(gate.loadOrder)).toBe(true)
    expect(JSON.stringify(gate)).not.toContain('C:/Users')
    expect(JSON.stringify(gate)).not.toContain('LENOVO')
    expect(JSON.stringify(gate)).not.toContain('runtime-adapter-selected-package-ids-length')
    expectNoWriteEffects(gate)
    expectRuntimeAdapterGateFrozen(gate)
    expectOfficialBaseline()
  })
})
