/// <reference types="node" />

import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { requirePackageId } from '@/domain/mods/ids'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDataPackDiscoveryReport,
  type ThirdPartyDiscoveryDirectoryEntry,
  type ThirdPartyDiscoveryFileSystem
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import { buildThirdPartyDataPackRepairReport } from '@/domain/mods/thirdPartyDataPackRepairReport'
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
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-repair-report-'))
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

const readJsonObject = async(filePath: string): Promise<JsonObject> =>
  JSON.parse(await readFile(filePath, 'utf8')) as JsonObject

const createItem = (id: string, sellPrice = 8): JsonObject => ({
  id,
  name: { key: `${id}.name`, fallback: id },
  category: 'gift',
  description: { key: `${id}.description`, fallback: `${id} description` },
  sellPrice,
  edible: false
})

const copyPack = async(
  root: string,
  directoryName: string,
  options: {
    id?: string
    omitDependencies?: boolean
    itemSellPrice?: number
  } = {}
): Promise<void> => {
  const packRoot = path.join(root, directoryName)
  await cp(path.join(fixtureRoot, 'valid-gift-pack'), packRoot, { recursive: true })
  const packageId = options.id ?? directoryName.replace(/-/g, '_')
  const manifestPath = path.join(packRoot, 'manifest.json')
  const manifest = await readJsonObject(manifestPath)
  manifest.id = packageId
  manifest.name = { key: `${packageId}.package.name`, fallback: packageId }
  manifest.entrypoints = { 'taoyuan:item': ['data/items.json'] }
  if (options.omitDependencies) {
    delete manifest.dependencies
  } else {
    manifest.dependencies = []
  }
  await writeJson(manifestPath, manifest)
  await writeJson(path.join(packRoot, 'data', 'items.json'), [
    createItem(`${packageId}:linen_ribbon`, options.itemSellPrice ?? 8)
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

const buildReport = async(root: string) => {
  const discoveryReport = await discoverThirdPartyDataPacks(root, createNodeFileSystem())
  return buildThirdPartyDataPackRepairReport(discoveryReport)
}

const expectNoWriteEffects = (report: ReturnType<typeof buildThirdPartyDataPackRepairReport>): void => {
  expect(report.effects).toEqual({
    stagedNormalizedResultMutated: false,
    packageFilesWritten: false,
    registryPublished: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false
  })
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

describe('third-party data pack repair report', () => {
  it('returns clean when a candidate needs no whitelisted repair', async() => {
    const root = await createRoot()
    await copyPack(root, 'clean-pack', { id: 'clean_pack' })

    const report = await buildReport(root)

    expect(report.status).toBe('clean')
    expect(report.actions).toEqual([])
    expect(report.summary).toMatchObject({
      candidateCount: 1,
      whitelistedActionCount: 0,
      blockedActionCount: 0
    })
    expectNoWriteEffects(report)
    expectOfficialBaseline()
  }, 15_000)

  it('reports legacy missing dependencies as a whitelisted staged normalization', async() => {
    const root = await createRoot()
    await copyPack(root, 'legacy-pack', {
      id: 'legacy_pack',
      omitDependencies: true
    })

    const report = await buildReport(root)

    expect(report.status).toBe('repairable')
    expect(report.actions).toEqual([
      expect.objectContaining({
        ruleId: 'PKG-REPAIR-MANIFEST-DEPENDENCIES-DEFAULT',
        decision: 'whitelisted',
        packagePath: 'legacy-pack',
        packageId: 'legacy_pack',
        file: 'legacy-pack/manifest.json',
        fieldPath: '/dependencies',
        beforeSummary: 'missing',
        afterSummary: '[]',
        diagnostics: []
      })
    ])
    expect(report.summary).toMatchObject({
      whitelistedActionCount: 1,
      blockedActionCount: 0
    })
    expectNoWriteEffects(report)
  }, 15_000)

  it('blocks non-whitelisted schema errors without masking diagnostics', async() => {
    const root = await createRoot()
    await copyPack(root, 'bad-schema', {
      id: 'bad_schema',
      itemSellPrice: -1
    })

    const report = await buildReport(root)

    expect(report.status).toBe('blocked')
    expect(report.summary.blockedActionCount).toBe(1)
    expect(report.actions).toEqual([
      expect.objectContaining({
        ruleId: 'PKG-REPAIR-NOT-WHITELISTED',
        decision: 'blocked',
        packagePath: 'bad-schema',
        packageId: 'bad_schema',
        file: 'bad-schema/data/items.json',
        fieldPath: '/0/sellPrice',
        beforeSummary: 'schema-validation-failed',
        afterSummary: 'unchanged'
      })
    ])
    expect(report.diagnostics).toEqual([
      expect.objectContaining({
        code: 'SCHEMA-VALIDATE-001',
        stage: 'third-party.discovery.content'
      })
    ])
    expectNoWriteEffects(report)
  }, 15_000)

  it('copies upstream diagnostics before exposing repair actions and report diagnostics', async() => {
    const root = await createRoot()
    await copyPack(root, 'bad-schema', {
      id: 'bad_schema',
      itemSellPrice: -1
    })
    const discoveryReport = createMutableDiscoveryReport(
      await discoverThirdPartyDataPacks(root, createNodeFileSystem())
    )
    const upstreamDiagnostic = discoveryReport.candidates
      .flatMap(candidate => candidate.issues)
      .flatMap(issue => issue.diagnostics)[0]
    if (!upstreamDiagnostic) throw new Error('Expected schema diagnostics for invalid test package.')

    upstreamDiagnostic.relatedPackageIds = [requirePackageId('related_pack')]
    let inheritedDetailsRead = false
    let ownDetailsRead = false
    let nestedDetailsRead = false
    let listDetailsRead = false
    const inheritedDetailsPrototype = {}
    Object.defineProperty(inheritedDetailsPrototype, 'hostPath', {
      enumerable: true,
      get() {
        inheritedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/repair-report-diagnostic-detail')
      }
    })
    const diagnosticDetails = Object.assign(Object.create(inheritedDetailsPrototype), {
      ...(upstreamDiagnostic.details ?? {}),
      reason: 'original diagnostic',
      nested: { marker: 'original' },
      list: ['original']
    }) as NonNullable<typeof upstreamDiagnostic.details>
    Object.defineProperty(diagnosticDetails, 'ownHostPath', {
      enumerable: true,
      get() {
        ownDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/repair-report-own-diagnostic-detail')
      }
    })
    Object.defineProperty(diagnosticDetails.nested as Record<string, unknown>, 'ownHostPath', {
      enumerable: true,
      get() {
        nestedDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/repair-report-nested-diagnostic-detail')
      }
    })
    Object.defineProperty(diagnosticDetails.list as unknown[], '1', {
      enumerable: true,
      get() {
        listDetailsRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/repair-report-list-diagnostic-detail')
      }
    })
    upstreamDiagnostic.details = diagnosticDetails
    const originalStage = upstreamDiagnostic.stage

    const report = buildThirdPartyDataPackRepairReport(discoveryReport)
    const actionDiagnostic = report.actions[0]?.diagnostics[0]
    const reportDiagnostic = report.diagnostics[0]
    if (!actionDiagnostic || !reportDiagnostic) throw new Error('Expected copied repair diagnostics.')
    expect(inheritedDetailsRead).toBe(false)
    expect(ownDetailsRead).toBe(false)
    expect(nestedDetailsRead).toBe(false)
    expect(listDetailsRead).toBe(false)

    upstreamDiagnostic.stage = 'third-party.discovery.mutated'
    upstreamDiagnostic.relatedPackageIds?.push(requirePackageId('mutated_pack'))
    const upstreamDetails = upstreamDiagnostic.details
    if (!upstreamDetails) throw new Error('Expected mutable upstream diagnostic details.')
    upstreamDetails.reason = 'mutated'
    const nestedDetails = upstreamDetails.nested as Record<string, unknown>
    nestedDetails.marker = 'mutated'
    const listDetails = upstreamDetails.list as unknown[]
    listDetails.push('mutated')

    expect(Object.is(actionDiagnostic, upstreamDiagnostic)).toBe(false)
    expect(Object.is(reportDiagnostic, upstreamDiagnostic)).toBe(false)
    expect(Object.is(reportDiagnostic, actionDiagnostic)).toBe(false)
    expect(actionDiagnostic.details && 'hostPath' in actionDiagnostic.details).toBe(false)
    expect(Reflect.getOwnPropertyDescriptor(actionDiagnostic.details ?? {}, 'ownHostPath')).toBeUndefined()
    expect(reportDiagnostic.details && 'hostPath' in reportDiagnostic.details).toBe(false)
    expect(Reflect.getOwnPropertyDescriptor(reportDiagnostic.details ?? {}, 'ownHostPath')).toBeUndefined()
    expect(Reflect.getOwnPropertyDescriptor(
      actionDiagnostic.details?.nested as Record<string, unknown>,
      'ownHostPath'
    )).toBeUndefined()
    expect(Reflect.getOwnPropertyDescriptor(
      reportDiagnostic.details?.nested as Record<string, unknown>,
      'ownHostPath'
    )).toBeUndefined()
    expect(actionDiagnostic.stage).toBe(originalStage)
    expect(actionDiagnostic.relatedPackageIds).toEqual(['related_pack'])
    expect(actionDiagnostic.details?.reason).toBe('original diagnostic')
    expect((actionDiagnostic.details?.nested as Record<string, unknown>)?.marker).toBe('original')
    expect(actionDiagnostic.details?.list).toEqual(['original', null])
    expect(reportDiagnostic.stage).toBe(originalStage)
    expect(reportDiagnostic.relatedPackageIds).toEqual(['related_pack'])
    expect(reportDiagnostic.details?.reason).toBe('original diagnostic')
    expect((reportDiagnostic.details?.nested as Record<string, unknown>)?.marker).toBe('original')
    expect(reportDiagnostic.details?.list).toEqual(['original', null])
    expect(report.diagnostics.some(diagnostic => diagnostic.stage === 'third-party.discovery.mutated')).toBe(false)
    expect(inheritedDetailsRead).toBe(false)
    expect(ownDetailsRead).toBe(false)
    expect(nestedDetailsRead).toBe(false)
    expect(listDetailsRead).toBe(false)
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
    expect(JSON.stringify(report)).not.toContain('repair-report-diagnostic-detail')
    expect(JSON.stringify(report)).not.toContain('repair-report-own-diagnostic-detail')
    expect(JSON.stringify(report)).not.toContain('repair-report-nested-diagnostic-detail')
    expect(JSON.stringify(report)).not.toContain('repair-report-list-diagnostic-detail')
    expectNoWriteEffects(report)
  }, 15_000)

  it('freezes exposed repair report output graphs', async() => {
    const root = await createRoot()
    await copyPack(root, 'bad-schema', {
      id: 'bad_schema',
      itemSellPrice: -1
    })
    const discoveryReport = createMutableDiscoveryReport(
      await discoverThirdPartyDataPacks(root, createNodeFileSystem())
    )
    const upstreamDiagnostic = discoveryReport.candidates
      .flatMap(candidate => candidate.issues)
      .flatMap(issue => issue.diagnostics)[0]
    if (!upstreamDiagnostic) throw new Error('Expected schema diagnostics for invalid test package.')

    upstreamDiagnostic.relatedPackageIds = [requirePackageId('related_pack')]
    upstreamDiagnostic.details = {
      ...(upstreamDiagnostic.details ?? {}),
      nested: { marker: 'original' },
      list: ['original']
    }

    const report = buildThirdPartyDataPackRepairReport(discoveryReport)
    const beforeMutationAttempts = JSON.stringify(report)
    const blockedAction = report.actions[0]
    const actionDiagnostic = blockedAction?.diagnostics[0]
    const reportDiagnostic = report.diagnostics[0]
    if (!blockedAction || !actionDiagnostic || !reportDiagnostic) {
      throw new Error('Expected blocked action and copied repair diagnostics.')
    }
    const actionDetails = actionDiagnostic.details
    const reportDetails = reportDiagnostic.details
    if (!actionDetails || !reportDetails) throw new Error('Expected diagnostic details.')
    if (!actionDiagnostic.relatedPackageIds || !reportDiagnostic.relatedPackageIds) {
      throw new Error('Expected related package ids.')
    }

    expect(Object.isFrozen(report)).toBe(true)
    expect(Object.isFrozen(report.actions)).toBe(true)
    expect(Object.isFrozen(blockedAction)).toBe(true)
    expect(Object.isFrozen(blockedAction.diagnostics)).toBe(true)
    expect(Object.isFrozen(actionDiagnostic)).toBe(true)
    expect(Object.isFrozen(actionDiagnostic.relatedPackageIds)).toBe(true)
    expect(Object.isFrozen(actionDetails)).toBe(true)
    expect(Object.isFrozen(actionDetails.nested)).toBe(true)
    expect(Object.isFrozen(actionDetails.list)).toBe(true)
    expect(Object.isFrozen(report.diagnostics)).toBe(true)
    expect(Object.isFrozen(reportDiagnostic)).toBe(true)
    expect(Object.isFrozen(reportDiagnostic.relatedPackageIds)).toBe(true)
    expect(Object.isFrozen(reportDetails)).toBe(true)
    expect(Object.isFrozen(reportDetails.nested)).toBe(true)
    expect(Object.isFrozen(reportDetails.list)).toBe(true)
    expect(Object.isFrozen(report.effects)).toBe(true)
    expect(Object.isFrozen(report.summary)).toBe(true)

    expect(Reflect.set(report, 'status', 'clean')).toBe(false)
    expect(() => (report.actions as unknown as unknown[]).push({})).toThrow(TypeError)
    expect(() => (blockedAction.diagnostics as unknown as unknown[]).push({})).toThrow(TypeError)
    expect(Reflect.set(actionDiagnostic, 'stage', 'third-party.discovery.mutated')).toBe(false)
    expect(() => (actionDiagnostic.relatedPackageIds as unknown as unknown[]).push('mutated_pack'))
      .toThrow(TypeError)
    expect(Reflect.set(actionDetails, 'nested', { marker: 'mutated' })).toBe(false)
    expect(Reflect.set(actionDetails.nested as Record<string, unknown>, 'marker', 'mutated')).toBe(false)
    expect(() => (actionDetails.list as unknown[]).push('mutated')).toThrow(TypeError)
    expect(Reflect.set(reportDiagnostic, 'stage', 'third-party.discovery.mutated')).toBe(false)
    expect(() => (reportDiagnostic.relatedPackageIds as unknown as unknown[]).push('mutated_pack'))
      .toThrow(TypeError)
    expect(Reflect.set(reportDetails.nested as Record<string, unknown>, 'marker', 'mutated')).toBe(false)
    expect(() => (reportDetails.list as unknown[]).push('mutated')).toThrow(TypeError)
    expect(Reflect.set(report.effects, 'cacheWritten', true)).toBe(false)
    expect(Reflect.set(report.summary, 'diagnosticCount', 999)).toBe(false)

    expect(JSON.stringify(report)).toBe(beforeMutationAttempts)
    expectNoWriteEffects(report)
  }, 15_000)

  it('is deterministic and does not mutate package files, saves, settings or official registries', async() => {
    const root = await createRoot()
    const packsRoot = path.join(root, 'packs')
    const userDataRoot = path.join(root, 'userdata')
    await copyPack(packsRoot, 'legacy-pack', {
      id: 'legacy_pack',
      omitDependencies: true
    })
    await mkdir(path.join(userDataRoot, 'Local Storage', 'leveldb'), { recursive: true })
    await writeFile(path.join(userDataRoot, 'settings.json'), '{"closeToTray":false}\n', 'utf8')
    await writeFile(path.join(userDataRoot, 'Local Storage', 'leveldb', 'save.ldb'), 'player-save-data', 'utf8')
    const filesBefore = await collectFileContents(root)
    const officialBefore = createSerializableRegistrySnapshot(buildOfficialRegistrySetFromStaticData())
    const discoveryReport = await discoverThirdPartyDataPacks(packsRoot, createNodeFileSystem())
    const discoveryBefore = JSON.stringify(discoveryReport)

    const first = buildThirdPartyDataPackRepairReport(discoveryReport)
    const second = buildThirdPartyDataPackRepairReport(discoveryReport)

    expect(second).toEqual(first)
    expect(JSON.stringify(discoveryReport)).toBe(discoveryBefore)
    expect(await collectFileContents(root)).toEqual(filesBefore)
    expect(createSerializableRegistrySnapshot(buildOfficialRegistrySetFromStaticData())).toEqual(officialBefore)
    expectNoWriteEffects(first)
    expectOfficialBaseline()
  }, 15_000)
})
