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
import {
  buildThirdPartyDataPackRuntimeAdapterGate,
  type ThirdPartyDataPackRuntimeAdapterGateResult
} from '@/domain/mods/thirdPartyDataPackRuntimeAdapterGate'
import { buildThirdPartyDataPackSourceAdapterGate } from '@/domain/mods/thirdPartyDataPackSourceAdapterGate'
import { buildThirdPartyDataPackRuntimeMountGate } from '@/domain/mods/thirdPartyDataPackRuntimeMountGate'
import { buildThirdPartyDataPackTransactionPreflight } from '@/domain/mods/thirdPartyDataPackTransactionPreflight'
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
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-source-adapter-gate-'))
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
    authors: [{ name: 'Source Adapter Gate Tester', role: 'developer' }],
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
  const sourceAdapterGate = buildThirdPartyDataPackSourceAdapterGate({
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
    runtimeAdapterGate,
    sourceAdapterGate
  }
}

const expectNoWriteEffects = (gate: ReturnType<typeof buildThirdPartyDataPackSourceAdapterGate>): void => {
  expect(gate.effects).toEqual({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    electronIpcExposed: false,
    webImportPersisted: false,
    androidImportPersisted: false,
    platformSourceOpened: false,
    sourceHandlesRetained: false,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false
  })
  expect(Object.isFrozen(gate.effects)).toBe(true)
}

const expectSatisfiedSourceContracts = (
  gate: ReturnType<typeof buildThirdPartyDataPackSourceAdapterGate>
): void => {
  expect(gate.requiredSourceContracts.map(contract => ({
    id: contract.id,
    status: contract.status
  }))).toEqual([
    { id: 'source-identity-validation', status: 'satisfied' },
    { id: 'pure-json-read-boundary', status: 'satisfied' },
    { id: 'normalized-relative-paths', status: 'satisfied' },
    { id: 'permission-revocation-diagnostics', status: 'satisfied' },
    { id: 'source-lifecycle-release', status: 'satisfied' }
  ])
  expect(gate.requiredSourceContracts.every(contract => contract.reason.length > 0)).toBe(true)
  expect(Object.isFrozen(gate.requiredSourceContracts)).toBe(true)
  expect(gate.requiredSourceContracts.every(contract => Object.isFrozen(contract))).toBe(true)
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectSourceAdapterGateFrozen = (
  gate: ReturnType<typeof buildThirdPartyDataPackSourceAdapterGate>
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

describe('third-party data pack source adapter gate', () => {
  it('keeps runtime adapters deferred after the shared source contract is defined', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { candidateSnapshot, lockfileDraftResult, sourceAdapterGate } = await buildReportsFromRoot(root)

    expect(sourceAdapterGate.status).toBe('deferred')
    expect(sourceAdapterGate.runtimeAdapterGateStatus).toBe('deferred')
    expect(sourceAdapterGate.reason).toBe(
      'content package source contract is defined; runtime platform source adapters remain intentionally deferred'
    )
    expect(sourceAdapterGate.sourceContractReadiness).toBe('defined')
    expect(sourceAdapterGate.contentPackageSourceContractStable).toBe(true)
    expect(sourceAdapterGate.runtimeEnablementAllowed).toBe(false)
    expect(sourceAdapterGate.selectedPackageIds).toEqual(['discovery_valid'])
    expect(sourceAdapterGate.loadOrder).toEqual(['discovery_valid'])
    expect(sourceAdapterGate.registryCount).toBe(54)
    expect(sourceAdapterGate.entryCount).toBe(4244)
    expect(sourceAdapterGate.packageCount).toBe(1)
    expect(sourceAdapterGate.candidateIdentity?.candidateHash).toBe(candidateSnapshot.candidateIdentity?.candidateHash)
    expect(sourceAdapterGate.lockfileHash).toBe(lockfileDraftResult.draft?.lockfileHash)
    expectSatisfiedSourceContracts(sourceAdapterGate)
    expect('candidateRegistrySet' in sourceAdapterGate).toBe(false)
    expect('candidateSnapshot' in sourceAdapterGate).toBe(false)
    expect('lockfileDraft' in sourceAdapterGate).toBe(false)
    expect('transactionPreflight' in sourceAdapterGate).toBe(false)
    expect('runtimeAdapterGate' in sourceAdapterGate).toBe(false)
    expect('platformSource' in sourceAdapterGate).toBe(false)
    expectNoWriteEffects(sourceAdapterGate)
    expectSourceAdapterGateFrozen(sourceAdapterGate)
    const frozenOutputSnapshot = JSON.stringify(sourceAdapterGate)
    const firstContract = sourceAdapterGate.requiredSourceContracts[0]
    if (firstContract === undefined) throw new Error('Expected at least one frozen source contract requirement.')
    expect(() => {
      (sourceAdapterGate.requiredSourceContracts as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(sourceAdapterGate as unknown as Record<string, unknown>, 'status', 'blocked')).toBe(false)
    expect(() => {
      (sourceAdapterGate.selectedPackageIds as unknown as unknown[]).push('mutated')
    }).toThrow(TypeError)
    expect(() => {
      (sourceAdapterGate.loadOrder as unknown as unknown[]).push('mutated')
    }).toThrow(TypeError)
    expect(Reflect.set(
      sourceAdapterGate.officialIdentity as unknown as Record<string, unknown>,
      'registryCount',
      1
    )).toBe(false)
    if (!sourceAdapterGate.candidateIdentity) throw new Error('Expected candidate identity for valid package gate.')
    expect(Reflect.set(
      sourceAdapterGate.candidateIdentity as unknown as Record<string, unknown>,
      'candidateHash',
      testHash('9')
    )).toBe(false)
    expect(Reflect.set(firstContract as unknown as Record<string, unknown>, 'reason', 'mutated')).toBe(false)
    expect(Reflect.set(sourceAdapterGate.effects as unknown as Record<string, unknown>, 'cacheWritten', true)).toBe(false)
    expect(JSON.stringify(sourceAdapterGate)).toBe(frozenOutputSnapshot)
    expectOfficialBaseline()
  }, 15_000)

  it('skips source adapter gates when no third-party packages are selected', async() => {
    const root = await createRoot()

    const { sourceAdapterGate } = await buildReportsFromRoot(root)

    expect(sourceAdapterGate.status).toBe('skipped')
    expect(sourceAdapterGate.runtimeAdapterGateStatus).toBe('skipped')
    expect(sourceAdapterGate.reason).toBe('no selected third-party data packs')
    expect(sourceAdapterGate.registryCount).toBe(54)
    expect(sourceAdapterGate.entryCount).toBe(4242)
    expect(sourceAdapterGate.packageCount).toBe(0)
    expect(sourceAdapterGate.sourceContractReadiness).toBe('defined')
    expect(sourceAdapterGate.contentPackageSourceContractStable).toBe(true)
    expectSatisfiedSourceContracts(sourceAdapterGate)
    expectNoWriteEffects(sourceAdapterGate)
    expectSourceAdapterGateFrozen(sourceAdapterGate)
    expectOfficialBaseline()
  }, 15_000)

  it('blocks source adapter gates when the runtime adapter gate is blocked', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-schema', {
      id: 'bad_schema',
      items: [createItem('bad_schema:broken', -1)]
    })

    const { sourceAdapterGate } = await buildReportsFromRoot(root)

    expect(sourceAdapterGate.status).toBe('blocked')
    expect(sourceAdapterGate.runtimeAdapterGateStatus).toBe('blocked')
    expect(sourceAdapterGate.reason).toBe('discovery failed')
    expect(sourceAdapterGate.registryCount).toBe(54)
    expect(sourceAdapterGate.entryCount).toBe(4242)
    expect(sourceAdapterGate.sourceContractReadiness).toBe('defined')
    expect(sourceAdapterGate.contentPackageSourceContractStable).toBe(true)
    expectSatisfiedSourceContracts(sourceAdapterGate)
    expect(sourceAdapterGate.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'SCHEMA-VALIDATE-001' }),
      expect.objectContaining({ stage: 'third-party.lockfile-draft.candidate' })
    ]))
    expectNoWriteEffects(sourceAdapterGate)
    expectSourceAdapterGateFrozen(sourceAdapterGate)
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
    const adapterBefore = JSON.stringify(reports.runtimeAdapterGate)

    const repeated = buildThirdPartyDataPackSourceAdapterGate({
      officialRegistrySet: reports.officialRegistrySet,
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot: reports.candidateSnapshot,
      lockfileDraftResult: reports.lockfileDraftResult,
      lockfileValidationResult: reports.lockfileValidationResult,
      preflight: reports.preflight,
      mountInput: reports.mountInput,
      runtimeGate: reports.runtimeGate,
      transactionPreflight: reports.transactionPreflight,
      runtimeAdapterGate: reports.runtimeAdapterGate
    })

    expect(reports.sourceAdapterGate.status).toBe('deferred')
    expect(repeated).toEqual(reports.sourceAdapterGate)
    expect(createSerializableRegistrySnapshot(reports.officialRegistrySet)).toEqual(officialBefore)
    expect(JSON.stringify(reports.discoveryReport)).toBe(discoveryBefore)
    expect(JSON.stringify(reports.selectionReport)).toBe(selectionBefore)
    expect(JSON.stringify(reports.candidateSnapshot)).toBe(candidateBefore)
    expect(JSON.stringify(reports.lockfileDraftResult)).toBe(draftBefore)
    expect(JSON.stringify(reports.mountInput)).toBe(inputBefore)
    expect(JSON.stringify(reports.runtimeGate)).toBe(runtimeGateBefore)
    expect(JSON.stringify(reports.transactionPreflight)).toBe(transactionBefore)
    expect(JSON.stringify(reports.runtimeAdapterGate)).toBe(adapterBefore)
    expect(await collectFileContents(root)).toEqual(filesBefore)
    expectNoWriteEffects(repeated)
    expectSourceAdapterGateFrozen(repeated)
    expectOfficialBaseline()
  }, 30_000)

  it('copies upstream identity summaries and diagnostics before exposing source adapter reports', () => {
    const packageId = requirePackageId('discovery_valid')
    const relatedPackageId = requirePackageId('related_pack')
    let inheritedDetailsRead = false
    const inheritedDetailsPrototype = {}
    Object.defineProperty(inheritedDetailsPrototype, 'hostPath', {
      enumerable: true,
      get() {
        inheritedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/source-adapter-diagnostic-detail')
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
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/source-adapter-own-diagnostic-detail')
      }
    })
    Object.defineProperty(diagnosticDetails.nested as Record<string, JsonValue>, 'ownHostPath', {
      enumerable: true,
      get() {
        nestedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/source-adapter-nested-diagnostic-detail')
      }
    })
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.source-adapter.test',
      relatedPackageIds: [relatedPackageId],
      details: diagnosticDetails
    })
    const runtimeAdapterGate: ThirdPartyDataPackRuntimeAdapterGateResult = {
      status: 'deferred',
      transactionPreflightStatus: 'deferred',
      reason: 'runtime platform adapters are intentionally deferred until desktop, web and android source boundaries are implemented',
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
      adapterReadiness: 'deferred',
      runtimeEnablementAllowed: false,
      requiredAdapters: [],
      effects: {
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
      }
    }

    const gate = buildThirdPartyDataPackSourceAdapterGate({
      runtimeAdapterGate
    } as never)

    expect(inheritedDetailsRead).toBe(false)
    expect(ownDetailsRead).toBe(false)
    expect(nestedDetailsRead).toBe(false)
    expect(gate.officialIdentity).toEqual(runtimeAdapterGate.officialIdentity)
    expect(gate.candidateIdentity).toEqual(runtimeAdapterGate.candidateIdentity)
    expect(gate.officialIdentity).not.toBe(runtimeAdapterGate.officialIdentity)
    expect(gate.candidateIdentity).not.toBe(runtimeAdapterGate.candidateIdentity)
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
    expectSourceAdapterGateFrozen(gate)

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

    const mutableOfficialIdentity = runtimeAdapterGate.officialIdentity as { registryCount: number }
    const mutableCandidateIdentity = runtimeAdapterGate.candidateIdentity as { candidateHash: Sha256Hash }
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

    expect(gate.officialIdentity.registryCount).toBe(54)
    expect(gate.candidateIdentity?.candidateHash).toBe(testHash('3'))
    expect(gate.diagnostics[0]).toMatchObject({
      stage: 'third-party.source-adapter.test',
      relatedPackageIds: ['related_pack'],
      details: {
        reason: 'original',
        nested: { count: 1 },
        list: ['original']
      }
    })
    expect(inheritedDetailsRead).toBe(false)
    expect(ownDetailsRead).toBe(false)
    expect(nestedDetailsRead).toBe(false)
    expect(JSON.stringify(gate)).not.toContain('C:/Users')
    expect(JSON.stringify(gate)).not.toContain('LENOVO')
    expect(JSON.stringify(gate)).not.toContain('source-adapter-diagnostic-detail')
    expect(JSON.stringify(gate)).not.toContain('source-adapter-own-diagnostic-detail')
    expect(JSON.stringify(gate)).not.toContain('source-adapter-nested-diagnostic-detail')
    expectNoWriteEffects(gate)
    expectOfficialBaseline()
  })

  it('ignores own accessor runtime adapter diagnostic fields before exposing source adapter reports', () => {
    const packageId = requirePackageId('discovery_valid')
    const relatedPackageId = requirePackageId('related_pack')
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.source-adapter.accessor-test',
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
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/source-adapter-diagnostic-stage')
      }
    })
    Object.defineProperty(upstreamDiagnostic, 'relatedPackageIds', {
      enumerable: true,
      get() {
        relatedPackageIdsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/source-adapter-diagnostic-related')
      }
    })
    Object.defineProperty(upstreamDiagnostic, 'details', {
      enumerable: true,
      get() {
        detailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/source-adapter-diagnostic-details')
      }
    })
    const runtimeAdapterGate: ThirdPartyDataPackRuntimeAdapterGateResult = {
      status: 'deferred',
      transactionPreflightStatus: 'deferred',
      reason: 'runtime platform adapters are intentionally deferred until desktop, web and android source boundaries are implemented',
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
      adapterReadiness: 'deferred',
      runtimeEnablementAllowed: false,
      requiredAdapters: [],
      effects: {
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
      }
    }

    const gate = buildThirdPartyDataPackSourceAdapterGate({
      runtimeAdapterGate
    } as never)
    const copiedDiagnostic = gate.diagnostics.find(diagnostic => diagnostic.code === originalCode)
    if (!copiedDiagnostic) throw new Error('Expected copied source adapter diagnostic.')

    expect(stageRead).toBe(false)
    expect(relatedPackageIdsRead).toBe(false)
    expect(detailsRead).toBe(false)
    expect(copiedDiagnostic).toMatchObject({
      code: originalCode,
      ruleId: originalRuleId,
      severity: originalSeverity,
      stage: 'third-party.source-adapter.diagnostic-copy',
      messageKey: originalMessageKey,
      recovery: originalRecovery
    })
    expect(copiedDiagnostic.relatedPackageIds).toBeUndefined()
    expect(copiedDiagnostic.details).toBeUndefined()
    expect(Object.isFrozen(copiedDiagnostic)).toBe(true)
    const serialized = JSON.stringify(gate)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('source-adapter-diagnostic-stage')
    expect(serialized).not.toContain('source-adapter-diagnostic-related')
    expect(serialized).not.toContain('source-adapter-diagnostic-details')
    expectNoWriteEffects(gate)
    expectSourceAdapterGateFrozen(gate)
    expectOfficialBaseline()
  })

  it('copies proxy array diagnostic details without reading hostile length getters', () => {
    const packageId = requirePackageId('discovery_valid')
    const relatedPackageId = requirePackageId('related_pack')
    let lengthRead = false
    const listDetails = new Proxy(['first', { stable: true }] as JsonValue[], {
      get(target, property, receiver) {
        if (property === 'length') {
          lengthRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/source-adapter-list-length')
        }
        return Reflect.get(target, property, receiver)
      }
    })
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.source-adapter.proxy-array-test',
      relatedPackageIds: [relatedPackageId],
      details: {
        reason: 'proxy array details',
        list: listDetails as JsonValue
      }
    })
    const runtimeAdapterGate: ThirdPartyDataPackRuntimeAdapterGateResult = {
      status: 'deferred',
      transactionPreflightStatus: 'deferred',
      reason: 'runtime platform adapters are intentionally deferred until desktop, web and android source boundaries are implemented',
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
      adapterReadiness: 'deferred',
      runtimeEnablementAllowed: false,
      requiredAdapters: [],
      effects: {
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
      }
    }

    const gate = buildThirdPartyDataPackSourceAdapterGate({
      runtimeAdapterGate
    } as never)

    expect(gate.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(gate.diagnostics).toHaveLength(1)
    expect(gate.diagnostics[0]).toMatchObject({
      code: upstreamDiagnostic.code,
      ruleId: upstreamDiagnostic.ruleId,
      severity: upstreamDiagnostic.severity,
      stage: upstreamDiagnostic.stage,
      messageKey: upstreamDiagnostic.messageKey,
      relatedPackageIds: [relatedPackageId],
      details: {
        reason: 'proxy array details',
        list: ['first', { stable: true }]
      },
      recovery: upstreamDiagnostic.recovery
    })
    expect(Object.is(gate.diagnostics[0], upstreamDiagnostic)).toBe(false)
    expect(Object.is(gate.diagnostics[0]?.details, upstreamDiagnostic.details)).toBe(false)
    expect(Object.is(gate.diagnostics[0]?.details?.list, listDetails)).toBe(false)
    const exposedListDetails = gate.diagnostics[0]?.details?.list
    if (!Array.isArray(exposedListDetails)) throw new Error('Expected copied list diagnostic details.')
    expect(() => {
      (exposedListDetails as unknown as unknown[]).push('mutated')
    }).toThrow(TypeError)
    expect(lengthRead).toBe(false)
    const serialized = JSON.stringify(gate)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('source-adapter-list-length')
    expectNoWriteEffects(gate)
    expectSourceAdapterGateFrozen(gate)
    expectOfficialBaseline()
  })
})
