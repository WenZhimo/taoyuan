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
  buildThirdPartyDataPackRuntimeMountGate,
  type ThirdPartyDataPackRuntimeMountGateResult
} from '@/domain/mods/thirdPartyDataPackRuntimeMountGate'
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
  expect(Object.isFrozen(preflight.effects)).toBe(true)
}

const expectRequiredTransactions = (
  preflight: ReturnType<typeof buildThirdPartyDataPackTransactionPreflight>
): void => {
  expect(preflight.requiredTransactions.map(requirement => ({
    id: requirement.id,
    status: requirement.status
  }))).toEqual([
    { id: 'staged-package-file-transaction', status: 'required' },
    { id: 'installation-settings-transaction', status: 'required' },
    { id: 'mod-lockfile-atomic-commit', status: 'required' },
    { id: 'transaction-recovery-log', status: 'required' },
    { id: 'rollback-verification', status: 'required' }
  ])
  expect(preflight.requiredTransactions.every(requirement => requirement.reason.length > 0)).toBe(true)
  expect(Object.isFrozen(preflight.requiredTransactions)).toBe(true)
  expect(preflight.requiredTransactions.every(requirement => Object.isFrozen(requirement))).toBe(true)
}

const expectLifecycleOperations = (
  preflight: ReturnType<typeof buildThirdPartyDataPackTransactionPreflight>,
  status: 'deferred' | 'skipped' | 'blocked'
): void => {
  expect(Object.isFrozen(preflight.lifecycleOperations)).toBe(true)
  expect(preflight.lifecycleOperations.map(operation => operation.operation)).toEqual([
    'install',
    'upgrade',
    'disable',
    'uninstall'
  ])

  for (const operation of preflight.lifecycleOperations) {
    expect(Object.isFrozen(operation)).toBe(true)
    expect(operation.status).toBe(status)
    expect(operation.currentStage).toBe('discovered')
    expect(operation.commitAllowed).toBe(false)
    expect(operation.reason.length).toBeGreaterThan(0)
    expect(Object.isFrozen(operation.stages)).toBe(true)
    expect(operation.stages.every(stage => Object.isFrozen(stage))).toBe(true)
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
    expectRequiredTransactions(transactionPreflight)
    expectLifecycleOperations(transactionPreflight, 'deferred')
    expect('candidateRegistrySet' in transactionPreflight).toBe(false)
    expect('candidateSnapshot' in transactionPreflight).toBe(false)
    expect('lockfileDraft' in transactionPreflight).toBe(false)
    expect('runtimeGate' in transactionPreflight).toBe(false)
    expectNoWriteEffects(transactionPreflight)
    const frozenOutputSnapshot = JSON.stringify({
      requiredTransactions: transactionPreflight.requiredTransactions,
      lifecycleOperations: transactionPreflight.lifecycleOperations,
      effects: transactionPreflight.effects
    })
    const firstRequirement = transactionPreflight.requiredTransactions[0]
    const firstOperation = transactionPreflight.lifecycleOperations[0]
    const firstStage = firstOperation?.stages[0]
    if (firstRequirement === undefined) throw new Error('Expected at least one frozen transaction requirement.')
    if (firstOperation === undefined) throw new Error('Expected at least one frozen lifecycle operation.')
    if (firstStage === undefined) throw new Error('Expected at least one frozen lifecycle stage.')
    expect(() => {
      (transactionPreflight.requiredTransactions as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(firstRequirement as unknown as Record<string, unknown>, 'reason', 'mutated')).toBe(false)
    expect(() => {
      (transactionPreflight.lifecycleOperations as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(firstOperation as unknown as Record<string, unknown>, 'operation', 'mutated')).toBe(false)
    expect(() => {
      (firstOperation.stages as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(firstStage as unknown as Record<string, unknown>, 'reason', 'mutated')).toBe(false)
    expect(Reflect.set(transactionPreflight.effects as unknown as Record<string, unknown>, 'cacheWritten', true)).toBe(false)
    expect(JSON.stringify({
      requiredTransactions: transactionPreflight.requiredTransactions,
      lifecycleOperations: transactionPreflight.lifecycleOperations,
      effects: transactionPreflight.effects
    })).toBe(frozenOutputSnapshot)
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
    expect(Object.isFrozen(transactionPreflight.requiredTransactions)).toBe(true)
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
    expect(Object.isFrozen(transactionPreflight.requiredTransactions)).toBe(true)
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

  it('copies upstream identity summaries and diagnostics before exposing transaction preflight reports', () => {
    const packageId = requirePackageId('discovery_valid')
    const relatedPackageId = requirePackageId('related_pack')
    let inheritedDetailsRead = false
    const inheritedDetailsPrototype = {}
    Object.defineProperty(inheritedDetailsPrototype, 'hostPath', {
      enumerable: true,
      get() {
        inheritedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/transaction-preflight-diagnostic-detail')
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
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/transaction-preflight-own-diagnostic-detail')
      }
    })
    Object.defineProperty(diagnosticDetails.nested as Record<string, JsonValue>, 'ownHostPath', {
      enumerable: true,
      get() {
        nestedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/transaction-preflight-nested-diagnostic-detail')
      }
    })
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.transaction-preflight.test',
      relatedPackageIds: [relatedPackageId],
      details: diagnosticDetails
    })
    const runtimeGate: ThirdPartyDataPackRuntimeMountGateResult = {
      status: 'deferred',
      mountInputStatus: 'ready',
      reason: 'runtime publication is intentionally deferred until write and transaction gates are implemented',
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
      runtimePublication: 'deferred',
      requiredGates: [],
      effects: {
        officialRegistryPublished: false,
        thirdPartyRegistryPublished: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        packageFilesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    }

    const preflight = buildThirdPartyDataPackTransactionPreflight({
      runtimeGate
    } as never)

    expect(inheritedDetailsRead).toBe(false)
    expect(ownDetailsRead).toBe(false)
    expect(nestedDetailsRead).toBe(false)
    expect(preflight.officialIdentity).toEqual(runtimeGate.officialIdentity)
    expect(preflight.candidateIdentity).toEqual(runtimeGate.candidateIdentity)
    expect(preflight.officialIdentity).not.toBe(runtimeGate.officialIdentity)
    expect(preflight.candidateIdentity).not.toBe(runtimeGate.candidateIdentity)
    expect(preflight.diagnostics).toHaveLength(1)
    expect(preflight.diagnostics[0]).toMatchObject({
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
    expect(Object.is(preflight.diagnostics[0], upstreamDiagnostic)).toBe(false)
    expect(Object.is(preflight.diagnostics[0]?.relatedPackageIds, upstreamDiagnostic.relatedPackageIds)).toBe(false)
    expect(Object.is(preflight.diagnostics[0]?.details, upstreamDiagnostic.details)).toBe(false)
    expect(preflight.diagnostics[0]?.details).not.toHaveProperty('hostPath')
    expect(preflight.diagnostics[0]?.details).not.toHaveProperty('ownHostPath')
    expect(Object.is(preflight.diagnostics[0]?.details?.nested, upstreamDiagnostic.details?.nested)).toBe(false)
    expect(preflight.diagnostics[0]?.details?.nested).not.toHaveProperty('ownHostPath')
    expect(Object.is(preflight.diagnostics[0]?.details?.list, upstreamDiagnostic.details?.list)).toBe(false)

    const mutableOfficialIdentity = runtimeGate.officialIdentity as { registryCount: number }
    const mutableCandidateIdentity = runtimeGate.candidateIdentity as { candidateHash: Sha256Hash }
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
    expect(JSON.stringify(preflight)).not.toContain('C:/Users')
    expect(JSON.stringify(preflight)).not.toContain('LENOVO')
    expect(JSON.stringify(preflight)).not.toContain('transaction-preflight-diagnostic-detail')
    expect(JSON.stringify(preflight)).not.toContain('transaction-preflight-own-diagnostic-detail')
    expect(JSON.stringify(preflight)).not.toContain('transaction-preflight-nested-diagnostic-detail')
    expect(preflight.officialIdentity.registryCount).toBe(54)
    expect(preflight.candidateIdentity?.candidateHash).toBe(testHash('3'))
    expect(preflight.diagnostics[0]).toMatchObject({
      stage: 'third-party.transaction-preflight.test',
      relatedPackageIds: ['related_pack'],
      details: {
        reason: 'original',
        nested: { count: 1 },
        list: ['original']
      }
    })
    expectNoWriteEffects(preflight)
    expectOfficialBaseline()
  })

  it('ignores own accessor runtime gate diagnostic fields before exposing transaction preflight reports', () => {
    const packageId = requirePackageId('discovery_valid')
    const relatedPackageId = requirePackageId('related_pack')
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.transaction-preflight.accessor-test',
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
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/transaction-preflight-diagnostic-stage')
      }
    })
    Object.defineProperty(upstreamDiagnostic, 'relatedPackageIds', {
      enumerable: true,
      get() {
        relatedPackageIdsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/transaction-preflight-diagnostic-related')
      }
    })
    Object.defineProperty(upstreamDiagnostic, 'details', {
      enumerable: true,
      get() {
        detailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/transaction-preflight-diagnostic-details')
      }
    })
    const runtimeGate: ThirdPartyDataPackRuntimeMountGateResult = {
      status: 'deferred',
      mountInputStatus: 'ready',
      reason: 'runtime publication is intentionally deferred until write and transaction gates are implemented',
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
      runtimePublication: 'deferred',
      requiredGates: [],
      effects: {
        officialRegistryPublished: false,
        thirdPartyRegistryPublished: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        packageFilesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    }

    const preflight = buildThirdPartyDataPackTransactionPreflight({
      runtimeGate
    } as never)
    const copiedDiagnostic = preflight.diagnostics.find(diagnostic => diagnostic.code === originalCode)
    if (!copiedDiagnostic) throw new Error('Expected copied transaction preflight diagnostic.')

    expect(stageRead).toBe(false)
    expect(relatedPackageIdsRead).toBe(false)
    expect(detailsRead).toBe(false)
    expect(copiedDiagnostic).toMatchObject({
      code: originalCode,
      ruleId: originalRuleId,
      severity: originalSeverity,
      stage: 'third-party.transaction-preflight.diagnostic-copy',
      messageKey: originalMessageKey,
      packageId: 'discovery_valid',
      recovery: originalRecovery
    })
    expect(copiedDiagnostic.relatedPackageIds).toBeUndefined()
    expect(copiedDiagnostic.details).toBeUndefined()
    const serialized = JSON.stringify(preflight)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('LENOVO')
    expect(serialized).not.toContain('transaction-preflight-diagnostic-stage')
    expect(serialized).not.toContain('transaction-preflight-diagnostic-related')
    expect(serialized).not.toContain('transaction-preflight-diagnostic-details')
    expectNoWriteEffects(preflight)
    expectOfficialBaseline()
  })

  it('copies runtime gate diagnostic array details without reading hostile proxy lengths', () => {
    const packageId = requirePackageId('discovery_valid')
    let lengthRead = false
    const listDetails = new Proxy(['first', { stable: true }] as JsonValue[], {
      get(target, property, receiver) {
        if (property === 'length') {
          lengthRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/transaction-preflight-list-length')
        }
        return Reflect.get(target, property, receiver)
      }
    })
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'test.transaction-preflight.proxy-array',
      severity: 'warning',
      packageId,
      relatedPackageIds: [packageId],
      details: {
        reason: 'proxy array details',
        list: listDetails as JsonValue
      }
    })
    const runtimeGate: ThirdPartyDataPackRuntimeMountGateResult = {
      status: 'deferred',
      mountInputStatus: 'ready',
      reason: 'runtime publication is intentionally deferred until write and transaction gates are implemented',
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
      runtimePublication: 'deferred',
      requiredGates: [],
      effects: {
        officialRegistryPublished: false,
        thirdPartyRegistryPublished: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        packageFilesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    }

    const preflight = buildThirdPartyDataPackTransactionPreflight({
      runtimeGate
    } as never)
    const copiedDiagnostic = preflight.diagnostics[0]
    if (copiedDiagnostic === undefined) throw new Error('Expected copied transaction preflight diagnostic.')

    expect(preflight.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(copiedDiagnostic).toMatchObject({
      stage: 'test.transaction-preflight.proxy-array',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'proxy array details',
        list: ['first', { stable: true }]
      }
    })
    expect(Object.is(copiedDiagnostic, upstreamDiagnostic)).toBe(false)
    expect(Object.is(copiedDiagnostic.details?.list, listDetails)).toBe(false)
    expect(JSON.stringify(preflight)).not.toContain('C:/Users')
    expect(JSON.stringify(preflight)).not.toContain('LENOVO')
    expect(JSON.stringify(preflight)).not.toContain('transaction-preflight-list-length')
    expectNoWriteEffects(preflight)
    expectOfficialBaseline()
  })

  it('copies runtime gate diagnostic related package ids without reading hostile proxy lengths', () => {
    const packageId = requirePackageId('discovery_valid')
    const relatedPackageId = requirePackageId('related_pack')
    let lengthRead = false
    const relatedPackageIds = new Proxy([packageId, relatedPackageId], {
      get(target, property, receiver) {
        if (property === 'length') {
          lengthRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/transaction-preflight-related-package-length')
        }
        return Reflect.get(target, property, receiver)
      }
    }) as ReturnType<typeof requirePackageId>[]
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'test.transaction-preflight.proxy-related-package-ids',
      severity: 'warning',
      packageId,
      relatedPackageIds,
      details: {
        reason: 'proxy related package ids'
      }
    })
    const runtimeGate: ThirdPartyDataPackRuntimeMountGateResult = {
      status: 'deferred',
      mountInputStatus: 'ready',
      reason: 'runtime publication is intentionally deferred until write and transaction gates are implemented',
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
      runtimePublication: 'deferred',
      requiredGates: [],
      effects: {
        officialRegistryPublished: false,
        thirdPartyRegistryPublished: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        packageFilesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false
      }
    }

    const preflight = buildThirdPartyDataPackTransactionPreflight({
      runtimeGate
    } as never)
    const copiedDiagnostic = preflight.diagnostics[0]
    if (copiedDiagnostic === undefined) throw new Error('Expected copied transaction preflight diagnostic.')

    expect(preflight.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(copiedDiagnostic).toMatchObject({
      stage: 'test.transaction-preflight.proxy-related-package-ids',
      relatedPackageIds: ['discovery_valid', 'related_pack'],
      details: {
        reason: 'proxy related package ids'
      }
    })
    expect(Object.is(copiedDiagnostic, upstreamDiagnostic)).toBe(false)
    expect(Object.is(copiedDiagnostic.relatedPackageIds, relatedPackageIds)).toBe(false)
    expect(Object.isFrozen(copiedDiagnostic.relatedPackageIds)).toBe(true)
    expect(JSON.stringify(preflight)).not.toContain('C:/Users')
    expect(JSON.stringify(preflight)).not.toContain('LENOVO')
    expect(JSON.stringify(preflight)).not.toContain('transaction-preflight-related-package-length')
    expectNoWriteEffects(preflight)
    expectOfficialBaseline()
  })
})
