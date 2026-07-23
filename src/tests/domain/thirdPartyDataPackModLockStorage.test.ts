/// <reference types="node" />

import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { ContentId, PackageId, RegistryTypeId } from '@/domain/mods/ids'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import {
  createThirdPartyDataPackModLockStorageAdapter,
  resolveThirdPartyDataPackModLockStoragePaths,
  THIRD_PARTY_DATA_PACK_MOD_LOCK_STORAGE_KIND,
  THIRD_PARTY_DATA_PACK_MOD_LOCK_USERDATA_DIRECTORY_NAME,
  type ThirdPartyDataPackModLockStorageEffects
} from '@/domain/mods/thirdPartyDataPackModLockStorage'
import { THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME } from '@/domain/mods/thirdPartyDataPackModLockFile'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-mod-lock-storage-'))
  roots.push(root)
  return root
}

const sha = (fill: string): Sha256Hash =>
  `sha256:${fill.repeat(64)}` as Sha256Hash

const createDraft = (
  options: {
    readonly packageId?: PackageId
    readonly itemId?: ContentId
    readonly candidateHash?: Sha256Hash
  } = {}
): ThirdPartyDataPackLockfileDraft => {
  const packageId = options.packageId ?? 'sample_pack' as PackageId
  const itemId = options.itemId ?? `${packageId}:linen_ribbon` as ContentId
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
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
      contentHash: sha('a'),
      snapshotHash: sha('b'),
      candidateHash: options.candidateHash ?? sha('c')
    },
    registryCount: 55,
    entryCount: 4243,
    selectedPackageIds: [packageId],
    loadOrder: [packageId],
    packages: [
      {
        packageId,
        version: '1.0.0',
        loadIndex: 0,
        source: {
          candidatePath: 'sample-pack',
          manifestPath: 'sample-pack/manifest.json',
          contentFiles: ['sample-pack/data/items.json']
        },
        manifestHash: sha('d'),
        contentHash: sha('e'),
        configurationHash: sha('f'),
        resolvedDependencies: [],
        contentFiles: [
          {
            registryId: 'taoyuan:item' as RegistryTypeId,
            path: 'data/items.json',
            entryCount: 1,
            entries: [
              {
                registryId: 'taoyuan:item' as RegistryTypeId,
                contentId: itemId,
                index: 0,
                canonicalHash: sha('1')
              }
            ]
          }
        ]
      }
    ]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body) as Sha256Hash
  }
}

const expectNoRuntimeEffects = (
  effects: ThirdPartyDataPackModLockStorageEffects
): void => {
  expect(effects).toMatchObject({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    runtimeEnablementAllowed: false,
    electronIpcExposed: false,
    packageFilesWritten: false,
    packageBackupsWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false
  })
}

const readTemporaryNames = async(directory: string): Promise<readonly string[]> =>
  (await readdir(directory))
    .filter(name => name.startsWith(`.${THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME}.tmp-`))
    .sort()

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

describe('third-party mod-lock program-directory storage adapter', () => {
  it('resolves program-directory userdata paths without creating files or directories', async() => {
    const root = await createRoot()
    const paths = resolveThirdPartyDataPackModLockStoragePaths(root)
    const adapter = createThirdPartyDataPackModLockStorageAdapter({ programDirectoryPath: () => root })

    const report = await adapter.inspect()

    expect(paths).toEqual({
      programDirectoryPath: root,
      userDataPath: path.join(root, THIRD_PARTY_DATA_PACK_MOD_LOCK_USERDATA_DIRECTORY_NAME),
      filePath: path.join(root, THIRD_PARTY_DATA_PACK_MOD_LOCK_USERDATA_DIRECTORY_NAME, 'mod-lock.json')
    })
    expect(report).toMatchObject({
      status: 'ready',
      operation: 'inspect',
      storageKind: THIRD_PARTY_DATA_PACK_MOD_LOCK_STORAGE_KIND,
      paths
    })
    expectNoRuntimeEffects(report.effects)
    expect(report.effects.lockfileWritten).toBe(false)
    await expect(stat(paths.userDataPath)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('reports missing and invalid path states without creating userdata', async() => {
    const root = await createRoot()
    const adapter = createThirdPartyDataPackModLockStorageAdapter({ programDirectoryPath: root })
    const paths = resolveThirdPartyDataPackModLockStoragePaths(root)

    const missing = await adapter.read()
    const invalid = await createThirdPartyDataPackModLockStorageAdapter({
      programDirectoryPath: 'relative-program-directory'
    }).inspect()

    expect(missing.draft).toBeNull()
    expect(missing.report.status).toBe('missing')
    expect(missing.report.paths).toEqual(paths)
    expectNoRuntimeEffects(missing.report.effects)
    expect(invalid.status).toBe('failed')
    expect(invalid.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'LIFECYCLE-TRANSACTION-001' })
    ]))
    await expect(stat(paths.userDataPath)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('writes and reads only userdata mod-lock while preserving saves, settings, package files and caches', async() => {
    const root = await createRoot()
    const userData = path.join(root, 'userdata')
    const settingsPath = path.join(userData, 'settings.json')
    const savePath = path.join(userData, 'Local Storage', 'leveldb', 'save.ldb')
    const officialCachePath = path.join(userData, 'mod-cache', 'sha256-official', 'official-registry-cache-v2.json')
    const packagePath = path.join(root, 'mods', 'sample-pack', 'manifest.json')
    const transactionLogPath = path.join(userData, 'mod-transactions', 'pending.json')
    await mkdir(path.dirname(savePath), { recursive: true })
    await mkdir(path.dirname(officialCachePath), { recursive: true })
    await mkdir(path.dirname(packagePath), { recursive: true })
    await mkdir(path.dirname(transactionLogPath), { recursive: true })
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    await writeFile(officialCachePath, 'official-cache-data', 'utf8')
    await writeFile(packagePath, '{"id":"sample_pack"}\n', 'utf8')
    await writeFile(transactionLogPath, '{"status":"pending"}\n', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const officialCacheBefore = await readFile(officialCachePath, 'utf8')
    const packageBefore = await readFile(packagePath, 'utf8')
    const transactionLogBefore = await readFile(transactionLogPath, 'utf8')
    const draft = createDraft()
    const adapter = createThirdPartyDataPackModLockStorageAdapter({ programDirectoryPath: root })

    const write = await adapter.write(draft)
    const read = await adapter.read()

    expect(write.report.status).toBe('written')
    expect(write.report.effects.lockfileWritten).toBe(true)
    expectNoRuntimeEffects(write.report.effects)
    expect(read.report.status).toBe('loaded')
    expect(read.draft).toEqual(draft)
    expect(read.report.paths?.filePath).toBe(path.join(userData, THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME))
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(officialCachePath, 'utf8')).toBe(officialCacheBefore)
    expect(await readFile(packagePath, 'utf8')).toBe(packageBefore)
    expect(await readFile(transactionLogPath, 'utf8')).toBe(transactionLogBefore)
    expectOfficialBaseline()
  }, 30_000)

  it('reports write failures while preserving the previous valid lockfile and clearing temporary files', async() => {
    const root = await createRoot()
    const oldDraft = createDraft()
    const newDraft = createDraft({ candidateHash: sha('8') })
    const adapter = createThirdPartyDataPackModLockStorageAdapter({ programDirectoryPath: root })
    const paths = resolveThirdPartyDataPackModLockStoragePaths(root)
    await adapter.write(oldDraft)
    const oldBytes = await readFile(paths.filePath, 'utf8')

    const interrupted = await createThirdPartyDataPackModLockStorageAdapter({
      programDirectoryPath: root,
      fileOptions: { beforeReplace: () => { throw new Error('simulated interruption') } }
    }).write(newDraft)
    const failedReplace = await createThirdPartyDataPackModLockStorageAdapter({
      programDirectoryPath: root,
      fileOptions: { fileSystem: { rename: async() => { throw new Error('simulated replace failure') } } }
    }).write(newDraft)
    const read = await adapter.read()

    expect(interrupted.report.status).toBe('failed')
    expect(interrupted.report.effects.lockfileWritten).toBe(false)
    expect(failedReplace.report.status).toBe('failed')
    expect(failedReplace.report.effects.lockfileWritten).toBe(false)
    expect(read.draft).toEqual(oldDraft)
    expect(await readFile(paths.filePath, 'utf8')).toBe(oldBytes)
    expect(await readTemporaryNames(paths.userDataPath)).toEqual([])
  }, 30_000)
})
