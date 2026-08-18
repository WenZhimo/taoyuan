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
import { buildThirdPartyDataPackRuntimeAdapterGate } from '@/domain/mods/thirdPartyDataPackRuntimeAdapterGate'
import { buildThirdPartyDataPackRuntimeMountGate } from '@/domain/mods/thirdPartyDataPackRuntimeMountGate'
import {
  buildThirdPartyDataPackRuntimePublicationPreflight,
  type ThirdPartyDataPackRuntimePublicationPreflightResult
} from '@/domain/mods/thirdPartyDataPackRuntimePublicationPreflight'
import {
  buildThirdPartyDataPackSourceAdapterGate,
  type ThirdPartyDataPackSourceAdapterGateResult
} from '@/domain/mods/thirdPartyDataPackSourceAdapterGate'
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
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-runtime-publication-preflight-'))
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
    authors: [{ name: 'Runtime Publication Preflight Tester', role: 'developer' }],
    license: 'MIT',
    dependencies: [],
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
  const runtimePublicationPreflight = buildThirdPartyDataPackRuntimePublicationPreflight({
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
    sourceAdapterGate,
    runtimePublicationPreflight
  }
}

const expectNoWriteEffects = (preflight: ThirdPartyDataPackRuntimePublicationPreflightResult): void => {
  expect(preflight.effects).toEqual({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    candidateRegistryExposed: false,
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

const expectHandoffChecks = (
  preflight: ThirdPartyDataPackRuntimePublicationPreflightResult,
  status: 'satisfied' | 'skipped' | 'blocked'
): void => {
  expect(preflight.handoffChecks.map(check => ({
    id: check.id,
    status: check.status
  }))).toEqual([
    { id: 'mount-input-ready', status },
    { id: 'candidate-registry-frozen', status },
    { id: 'candidate-snapshot-available', status },
    { id: 'lockfile-draft-available', status },
    { id: 'candidate-identity-matches-source-gate', status },
    { id: 'lockfile-hash-matches-source-gate', status },
    { id: 'source-adapter-boundary-defined', status }
  ])
  expect(preflight.handoffChecks.every(check => check.reason.length > 0)).toBe(true)
  expect(Object.isFrozen(preflight.handoffChecks)).toBe(true)
  expect(preflight.handoffChecks.every(check => Object.isFrozen(check))).toBe(true)
}

const expectRemainingRequirements = (
  preflight: ThirdPartyDataPackRuntimePublicationPreflightResult
): void => {
  expect(preflight.remainingRequirements.map(requirement => ({
    id: requirement.id,
    status: requirement.status
  }))).toEqual([
    { id: 'runtime-publication-commit-adapter', status: 'required' },
    { id: 'live-registry-swap-protection', status: 'required' },
    { id: 'publication-failure-rollback', status: 'required' }
  ])
  expect(preflight.remainingRequirements.every(requirement => requirement.reason.length > 0)).toBe(true)
  expect(Object.isFrozen(preflight.remainingRequirements)).toBe(true)
  expect(preflight.remainingRequirements.every(requirement => Object.isFrozen(requirement))).toBe(true)
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
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

describe('third-party data pack runtime publication preflight', () => {
  it('defers runtime publication for ready handoff inputs without exposing candidate artifacts', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })

    const {
      candidateSnapshot,
      lockfileDraftResult,
      runtimePublicationPreflight
    } = await buildReportsFromRoot(root)

    expect(runtimePublicationPreflight.status).toBe('deferred')
    expect(runtimePublicationPreflight.mountInputStatus).toBe('ready')
    expect(runtimePublicationPreflight.sourceAdapterGateStatus).toBe('deferred')
    expect(runtimePublicationPreflight.reason).toBe(
      'runtime publication handoff is inspect-only until commit adapter, live swap protection and rollback recovery exist'
    )
    expect(runtimePublicationPreflight.runtimePublication).toBe('deferred')
    expect(runtimePublicationPreflight.publicationAllowed).toBe(false)
    expect(runtimePublicationPreflight.candidateRegistryFrozen).toBe(true)
    expect(runtimePublicationPreflight.candidateSnapshotAvailable).toBe(true)
    expect(runtimePublicationPreflight.lockfileDraftAvailable).toBe(true)
    expect(runtimePublicationPreflight.selectedPackageIds).toEqual(['discovery_valid'])
    expect(runtimePublicationPreflight.loadOrder).toEqual(['discovery_valid'])
    expect(runtimePublicationPreflight.registryCount).toBe(54)
    expect(runtimePublicationPreflight.entryCount).toBe(4244)
    expect(runtimePublicationPreflight.packageCount).toBe(1)
    expect(runtimePublicationPreflight.candidateIdentity?.candidateHash).toBe(candidateSnapshot.candidateIdentity?.candidateHash)
    expect(runtimePublicationPreflight.lockfileHash).toBe(lockfileDraftResult.draft?.lockfileHash)
    expectHandoffChecks(runtimePublicationPreflight, 'satisfied')
    expectRemainingRequirements(runtimePublicationPreflight)
    expect('candidateRegistrySet' in runtimePublicationPreflight).toBe(false)
    expect('candidateSnapshot' in runtimePublicationPreflight).toBe(false)
    expect('lockfileDraft' in runtimePublicationPreflight).toBe(false)
    expect('mountInput' in runtimePublicationPreflight).toBe(false)
    expect('sourceAdapterGate' in runtimePublicationPreflight).toBe(false)
    expectNoWriteEffects(runtimePublicationPreflight)
    expectJsonGraphFrozen(runtimePublicationPreflight)
    const frozenOutputSnapshot = JSON.stringify(runtimePublicationPreflight)
    const firstCheck = runtimePublicationPreflight.handoffChecks[0]
    const firstRequirement = runtimePublicationPreflight.remainingRequirements[0]
    if (firstCheck === undefined) throw new Error('Expected at least one frozen handoff check.')
    if (firstRequirement === undefined) throw new Error('Expected at least one frozen publication requirement.')
    expect(() => {
      (runtimePublicationPreflight.handoffChecks as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(() => {
      (runtimePublicationPreflight.remainingRequirements as unknown as unknown[]).push({})
    }).toThrow(TypeError)
    expect(Reflect.set(runtimePublicationPreflight as unknown as Record<string, unknown>, 'status', 'blocked')).toBe(false)
    expect(Reflect.set(firstCheck as unknown as Record<string, unknown>, 'reason', 'mutated')).toBe(false)
    expect(Reflect.set(firstRequirement as unknown as Record<string, unknown>, 'status', 'satisfied')).toBe(false)
    expect(Reflect.set(runtimePublicationPreflight.effects as unknown as Record<string, unknown>, 'cacheWritten', true)).toBe(false)
    expect(JSON.stringify(runtimePublicationPreflight)).toBe(frozenOutputSnapshot)
    expectOfficialBaseline()
  }, 15_000)

  it('skips runtime publication preflight when no third-party packages are selected', async() => {
    const root = await createRoot()

    const { runtimePublicationPreflight } = await buildReportsFromRoot(root)

    expect(runtimePublicationPreflight.status).toBe('skipped')
    expect(runtimePublicationPreflight.mountInputStatus).toBe('skipped')
    expect(runtimePublicationPreflight.sourceAdapterGateStatus).toBe('skipped')
    expect(runtimePublicationPreflight.reason).toBe('no selected third-party data packs')
    expect(runtimePublicationPreflight.registryCount).toBe(54)
    expect(runtimePublicationPreflight.entryCount).toBe(4242)
    expect(runtimePublicationPreflight.packageCount).toBe(0)
    expect(runtimePublicationPreflight.candidateRegistryFrozen).toBe(false)
    expect(runtimePublicationPreflight.candidateSnapshotAvailable).toBe(false)
    expect(runtimePublicationPreflight.lockfileDraftAvailable).toBe(false)
    expectHandoffChecks(runtimePublicationPreflight, 'skipped')
    expect(runtimePublicationPreflight.remainingRequirements).toEqual([])
    expect(Object.isFrozen(runtimePublicationPreflight.remainingRequirements)).toBe(true)
    expectNoWriteEffects(runtimePublicationPreflight)
    expectJsonGraphFrozen(runtimePublicationPreflight)
    expectOfficialBaseline()
  }, 15_000)

  it('blocks runtime publication preflight when upstream handoff reports are blocked', async() => {
    const root = await createRoot()
    await createPack(root, 'bad-schema', {
      id: 'bad_schema',
      items: [createItem('bad_schema:broken', -1)]
    })

    const { runtimePublicationPreflight } = await buildReportsFromRoot(root)

    expect(runtimePublicationPreflight.status).toBe('blocked')
    expect(runtimePublicationPreflight.mountInputStatus).toBe('blocked')
    expect(runtimePublicationPreflight.sourceAdapterGateStatus).toBe('blocked')
    expect(runtimePublicationPreflight.reason).toBe('discovery failed')
    expect(runtimePublicationPreflight.registryCount).toBe(54)
    expect(runtimePublicationPreflight.entryCount).toBe(4242)
    expect(runtimePublicationPreflight.remainingRequirements).toEqual([])
    expect(runtimePublicationPreflight.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'SCHEMA-VALIDATE-001' }),
      expect.objectContaining({ stage: 'third-party.lockfile-draft.candidate' })
    ]))
    expectNoWriteEffects(runtimePublicationPreflight)
    expectJsonGraphFrozen(runtimePublicationPreflight)
    expectOfficialBaseline()
  }, 15_000)

  it('blocks runtime publication preflight when source gate and mount input identities diverge', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })
    const { mountInput, sourceAdapterGate } = await buildReportsFromRoot(root)

    const cases: readonly {
      readonly label: string
      readonly sourceAdapterGate: ThirdPartyDataPackSourceAdapterGateResult
      readonly blockedCheckId: string
    }[] = [
      {
        label: 'candidate hash',
        sourceAdapterGate: {
          ...sourceAdapterGate,
          candidateIdentity: sourceAdapterGate.candidateIdentity === undefined
            ? undefined
            : {
                ...sourceAdapterGate.candidateIdentity,
                candidateHash: testHash('9')
              }
        },
        blockedCheckId: 'candidate-identity-matches-source-gate'
      },
      {
        label: 'lockfile hash',
        sourceAdapterGate: {
          ...sourceAdapterGate,
          lockfileHash: testHash('8')
        },
        blockedCheckId: 'lockfile-hash-matches-source-gate'
      }
    ]

    for (const currentCase of cases) {
      const preflight = buildThirdPartyDataPackRuntimePublicationPreflight({
        mountInput,
        sourceAdapterGate: currentCase.sourceAdapterGate
      } as never)

      expect(preflight.status).toBe('blocked')
      expect(preflight.reason).toBe('runtime publication handoff inputs are inconsistent')
      expect(preflight.remainingRequirements).toEqual([])
      expect(preflight.handoffChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: currentCase.blockedCheckId,
          status: 'blocked'
        })
      ]))
      expect(preflight.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'LIFECYCLE-TRANSACTION-001',
          stage: 'third-party.runtime-publication-preflight.handoff',
          fieldPath: `/handoffChecks/${currentCase.blockedCheckId}`
        })
      ]))
      expect(JSON.stringify(preflight)).toContain(currentCase.label === 'candidate hash'
        ? 'candidate-identity-matches-source-gate'
        : 'lockfile-hash-matches-source-gate')
      expectNoWriteEffects(preflight)
      expectJsonGraphFrozen(preflight)
    }
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
    const mountInputBefore = JSON.stringify(reports.mountInput)
    const sourceAdapterGateBefore = JSON.stringify(reports.sourceAdapterGate)

    const repeated = buildThirdPartyDataPackRuntimePublicationPreflight({
      mountInput: reports.mountInput,
      sourceAdapterGate: reports.sourceAdapterGate
    } as never)

    expect(reports.runtimePublicationPreflight.status).toBe('deferred')
    expect(repeated).toEqual(reports.runtimePublicationPreflight)
    expect(createSerializableRegistrySnapshot(reports.officialRegistrySet)).toEqual(officialBefore)
    expect(JSON.stringify(reports.discoveryReport)).toBe(discoveryBefore)
    expect(JSON.stringify(reports.selectionReport)).toBe(selectionBefore)
    expect(JSON.stringify(reports.candidateSnapshot)).toBe(candidateBefore)
    expect(JSON.stringify(reports.lockfileDraftResult)).toBe(draftBefore)
    expect(JSON.stringify(reports.mountInput)).toBe(mountInputBefore)
    expect(JSON.stringify(reports.sourceAdapterGate)).toBe(sourceAdapterGateBefore)
    expect(await collectFileContents(root)).toEqual(filesBefore)
    expectNoWriteEffects(repeated)
    expectJsonGraphFrozen(repeated)
    expectOfficialBaseline()
  }, 15_000)

  it('copies handoff diagnostics and package summaries without reading hostile proxy lengths', async() => {
    const root = await createRoot()
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(root, 'valid-gift-pack'), { recursive: true })
    const { mountInput, sourceAdapterGate } = await buildReportsFromRoot(root)
    const packageId = requirePackageId('discovery_valid')
    const blockedPackageId = requirePackageId('blocked_pack')
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/runtime-publication-${label}-length`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const relatedPackageIds = createHostileArray([packageId], 'related-package-ids')
    const listDetails = createHostileArray(['first', { stable: true }] as JsonValue[], 'details-list')
    const upstreamDiagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.runtime-publication.test',
      severity: 'warning',
      packageId,
      relatedPackageIds,
      details: {
        reason: 'proxy diagnostic',
        list: listDetails as JsonValue
      }
    })
    const hostileMountInput: ThirdPartyDataPackMountInputResult = {
      ...mountInput,
      selectedPackageIds: createHostileArray([packageId], 'selected-package-ids'),
      blockedPackageIds: createHostileArray([blockedPackageId], 'blocked-package-ids'),
      blockedCandidatePaths: createHostileArray(['blocked-pack'], 'blocked-candidate-paths'),
      loadOrder: createHostileArray([packageId], 'load-order')
    }
    const hostileSourceAdapterGate: ThirdPartyDataPackSourceAdapterGateResult = {
      ...sourceAdapterGate,
      diagnostics: createHostileArray([upstreamDiagnostic], 'diagnostics')
    }

    const preflight = buildThirdPartyDataPackRuntimePublicationPreflight({
      mountInput: hostileMountInput,
      sourceAdapterGate: hostileSourceAdapterGate
    } as never)

    expect(preflight.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(preflight.selectedPackageIds).toEqual(['discovery_valid'])
    expect(preflight.blockedPackageIds).toEqual(['blocked_pack'])
    expect(preflight.blockedCandidatePaths).toEqual(['blocked-pack'])
    expect(preflight.loadOrder).toEqual(['discovery_valid'])
    expect(preflight.diagnostics).toHaveLength(1)
    expect(preflight.diagnostics[0]).toMatchObject({
      code: 'CACHE-INVALID-001',
      stage: 'third-party.runtime-publication.test',
      relatedPackageIds: ['discovery_valid'],
      details: {
        reason: 'proxy diagnostic',
        list: ['first', { stable: true }]
      }
    })
    expect(Object.is(preflight.diagnostics, hostileSourceAdapterGate.diagnostics)).toBe(false)
    expect(Object.is(preflight.diagnostics[0], upstreamDiagnostic)).toBe(false)
    expect(Object.is(preflight.selectedPackageIds, hostileMountInput.selectedPackageIds)).toBe(false)
    expect(Object.isFrozen(preflight.diagnostics)).toBe(true)
    expect(Object.isFrozen(preflight.selectedPackageIds)).toBe(true)
    expect(JSON.stringify(preflight)).not.toContain('C:/Users')
    expect(JSON.stringify(preflight)).not.toContain('LENOVO')
    expect(JSON.stringify(preflight)).not.toContain('runtime-publication-diagnostics-length')
    expectNoWriteEffects(preflight)
    expectJsonGraphFrozen(preflight)
    expectOfficialBaseline()
  }, 15_000)
})
