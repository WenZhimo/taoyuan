/// <reference types="node" />

import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDiscoveryDirectoryEntry,
  type ThirdPartyDiscoveryFileSystem
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import { buildThirdPartyDataPackRepairReport } from '@/domain/mods/thirdPartyDataPackRepairReport'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const fixtureRoot = path.join(cwd(), 'src/tests/fixtures/mods/third-party-discovery')

type JsonObject = Record<string, unknown>

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
