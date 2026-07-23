/// <reference types="node" />

import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
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
import { buildThirdPartyDataPackSourceAdapterGate } from '@/domain/mods/thirdPartyDataPackSourceAdapterGate'
import { buildThirdPartyDataPackRuntimeMountGate } from '@/domain/mods/thirdPartyDataPackRuntimeMountGate'
import { buildThirdPartyDataPackTransactionPreflight } from '@/domain/mods/thirdPartyDataPackTransactionPreflight'
import { selectThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackSelection'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const fixtureRoot = path.join(cwd(), 'src/tests/fixtures/mods/third-party-discovery')

type JsonObject = Record<string, unknown>

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
    expectOfficialBaseline()
  }, 15_000)
})
