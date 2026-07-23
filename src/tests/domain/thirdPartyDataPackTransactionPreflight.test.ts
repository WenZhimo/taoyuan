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
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-transaction-preflight-'))
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
    authors: [{ name: 'Transaction Preflight Tester', role: 'developer' }],
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
    transactionPreflight
  }
}

const expectNoWriteEffects = (preflight: ReturnType<typeof buildThirdPartyDataPackTransactionPreflight>): void => {
  expect(preflight.effects).toEqual({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    packageFilesWritten: false,
    packageBackupsWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false
  })
}

const expectLifecycleOperations = (
  preflight: ReturnType<typeof buildThirdPartyDataPackTransactionPreflight>,
  status: 'deferred' | 'skipped' | 'blocked'
): void => {
  expect(preflight.lifecycleOperations.map(operation => operation.operation)).toEqual([
    'install',
    'upgrade',
    'disable',
    'uninstall'
  ])

  for (const operation of preflight.lifecycleOperations) {
    expect(operation.status).toBe(status)
    expect(operation.currentStage).toBe('discovered')
    expect(operation.commitAllowed).toBe(false)
    expect(operation.reason.length).toBeGreaterThan(0)
    expect(operation.stages.map(stage => stage.id)).toEqual([
      'discovered',
      'staged',
      'verified',
      'resolved',
      'mounted',
      'committed'
    ])
    expect(operation.stages.every(stage => stage.reason.length > 0)).toBe(true)

    if (status === 'deferred') {
      expect(operation.nextStage).toBe('staged')
      expect(operation.stages.map(stage => stage.status)).toEqual([
        'satisfied',
        'deferred',
        'deferred',
        'deferred',
        'deferred',
        'deferred'
      ])
    } else {
      expect(operation.nextStage).toBeUndefined()
      expect(operation.stages.every(stage => stage.status === status)).toBe(true)
    }
  }
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

describe('third-party data pack transaction preflight', () => {
  it('defers lifecycle transaction commits for ready runtime gates until atomic write primitives exist', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const { candidateSnapshot, lockfileDraftResult, transactionPreflight } = await buildReportsFromRoot(root)

    expect(transactionPreflight.status).toBe('deferred')
    expect(transactionPreflight.runtimeGateStatus).toBe('deferred')
    expect(transactionPreflight.reason).toBe(
      'lifecycle transaction commit is intentionally deferred until atomic write and recovery primitives are implemented'
    )
    expect(transactionPreflight.transactionCommit).toBe('deferred')
    expect(transactionPreflight.commitAllowed).toBe(false)
    expect(transactionPreflight.recoveryRequired).toBe(false)
    expect(transactionPreflight.rollbackRequired).toBe(false)
    expect(transactionPreflight.selectedPackageIds).toEqual(['discovery_valid'])
    expect(transactionPreflight.loadOrder).toEqual(['discovery_valid'])
    expect(transactionPreflight.registryCount).toBe(54)
    expect(transactionPreflight.entryCount).toBe(4244)
    expect(transactionPreflight.packageCount).toBe(1)
    expect(transactionPreflight.candidateIdentity?.candidateHash).toBe(candidateSnapshot.candidateIdentity?.candidateHash)
    expect(transactionPreflight.lockfileHash).toBe(lockfileDraftResult.draft?.lockfileHash)
    expect(transactionPreflight.requiredTransactions.map(requirement => requirement.id)).toEqual([
      'staged-package-file-transaction',
      'installation-settings-transaction',
      'mod-lockfile-atomic-commit',
      'transaction-recovery-log',
      'rollback-verification'
    ])
    expectLifecycleOperations(transactionPreflight, 'deferred')
    expect('candidateRegistrySet' in transactionPreflight).toBe(false)
    expect('candidateSnapshot' in transactionPreflight).toBe(false)
    expect('lockfileDraft' in transactionPreflight).toBe(false)
    expect('runtimeGate' in transactionPreflight).toBe(false)
    expectNoWriteEffects(transactionPreflight)
    expectOfficialBaseline()
  }, 15_000)

  it('skips transaction preflight when no third-party packages are selected', async() => {
    const root = await createRoot()

    const { transactionPreflight } = await buildReportsFromRoot(root)

    expect(transactionPreflight.status).toBe('skipped')
    expect(transactionPreflight.runtimeGateStatus).toBe('skipped')
    expect(transactionPreflight.reason).toBe('no selected third-party data packs')
    expect(transactionPreflight.registryCount).toBe(54)
    expect(transactionPreflight.entryCount).toBe(4242)
    expect(transactionPreflight.packageCount).toBe(0)
    expect(transactionPreflight.requiredTransactions).toEqual([])
    expectLifecycleOperations(transactionPreflight, 'skipped')
    expectNoWriteEffects(transactionPreflight)
    expectOfficialBaseline()
  }, 15_000)

  it('blocks transaction preflight when the runtime gate is blocked', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-schema', {
      id: 'bad_schema',
      items: [createItem('bad_schema:broken', -1)]
    })

    const { transactionPreflight } = await buildReportsFromRoot(root)

    expect(transactionPreflight.status).toBe('blocked')
    expect(transactionPreflight.runtimeGateStatus).toBe('blocked')
    expect(transactionPreflight.reason).toBe('discovery failed')
    expect(transactionPreflight.registryCount).toBe(54)
    expect(transactionPreflight.entryCount).toBe(4242)
    expect(transactionPreflight.requiredTransactions).toEqual([])
    expect(transactionPreflight.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'SCHEMA-VALIDATE-001' }),
      expect.objectContaining({ stage: 'third-party.lockfile-draft.candidate' })
    ]))
    expectLifecycleOperations(transactionPreflight, 'blocked')
    expectNoWriteEffects(transactionPreflight)
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

    const repeated = buildThirdPartyDataPackTransactionPreflight({
      officialRegistrySet: reports.officialRegistrySet,
      discoveryReport: reports.discoveryReport,
      selectionReport: reports.selectionReport,
      candidateSnapshot: reports.candidateSnapshot,
      lockfileDraftResult: reports.lockfileDraftResult,
      lockfileValidationResult: reports.lockfileValidationResult,
      preflight: reports.preflight,
      mountInput: reports.mountInput,
      runtimeGate: reports.runtimeGate
    })

    expect(reports.transactionPreflight.status).toBe('deferred')
    expect(repeated).toEqual(reports.transactionPreflight)
    expect(createSerializableRegistrySnapshot(reports.officialRegistrySet)).toEqual(officialBefore)
    expect(JSON.stringify(reports.discoveryReport)).toBe(discoveryBefore)
    expect(JSON.stringify(reports.selectionReport)).toBe(selectionBefore)
    expect(JSON.stringify(reports.candidateSnapshot)).toBe(candidateBefore)
    expect(JSON.stringify(reports.lockfileDraftResult)).toBe(draftBefore)
    expect(JSON.stringify(reports.mountInput)).toBe(inputBefore)
    expect(JSON.stringify(reports.runtimeGate)).toBe(runtimeGateBefore)
    expect(await collectFileContents(root)).toEqual(filesBefore)
    expectNoWriteEffects(repeated)
    expectOfficialBaseline()
  }, 15_000)
})
