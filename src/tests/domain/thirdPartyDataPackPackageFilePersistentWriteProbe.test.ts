/// <reference types="node" />

import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { hashCanonicalJson, sha256Utf8, type Sha256Hash } from '@/domain/mods/hash'
import type { ContentId, PackageId, RegistryTypeId } from '@/domain/mods/ids'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import type {
  ThirdPartyDataPackLockfileDraft
} from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import {
  createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter,
  resolveThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths,
  runThirdPartyDataPackPackageFilePersistentRestoreProbe,
  runThirdPartyDataPackPackageFilePersistentWriteProbe,
  type ThirdPartyDataPackPackageFilePersistentWriteProbeResult,
  type ThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter
} from '@/domain/mods/thirdPartyDataPackPackageFilePersistentWriteProbe'
import type {
  ThirdPartyDataPackPackageFileStagingHostEnvelope
} from '@/domain/mods/thirdPartyDataPackPackageFileStagingSource'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-package-file-write-probe-'))
  roots.push(root)
  return root
}

const packageId = 'sample_pack' as PackageId
const candidatePackagePath = 'sample-pack'
const itemId = `${packageId}:linen_ribbon` as ContentId
const registryId = 'taoyuan:item' as RegistryTypeId

const sha = (fill: string): Sha256Hash =>
  `sha256:${fill.repeat(64)}` as Sha256Hash

const officialIdentity = {
  artifactHash: committedMetadata.artifactHash as Sha256Hash,
  contentHash: committedMetadata.contentHash as Sha256Hash,
  schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
  environmentHash: committedMetadata.environmentHash as Sha256Hash,
  snapshotHash: committedMetadata.snapshotHash as Sha256Hash,
  registryCount: 54,
  entryCount: 4242
}

const candidateIdentity = {
  formatVersion: 1,
  contentHash: sha('a'),
  snapshotHash: sha('b'),
  candidateHash: sha('c')
} as const

const manifest = {
  id: packageId,
  name: {
    key: 'sample_pack.package.name',
    fallback: 'Sample Pack'
  },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: {},
  authors: [
    {
      name: 'Probe Tester',
      role: 'developer'
    }
  ],
  license: 'MIT',
  dependencies: [],
  entrypoints: {
    [registryId]: ['data/items.json']
  }
}

const item = {
  id: itemId,
  name: {
    key: 'sample_pack.item.linen_ribbon.name',
    fallback: 'Linen Ribbon'
  },
  category: 'gift',
  description: {
    key: 'sample_pack.item.linen_ribbon.description',
    fallback: 'Probe fixture item.'
  },
  sellPrice: 8,
  edible: false,
  tags: ['sample_pack:soft_gift']
}

const manifestText = `${JSON.stringify(manifest, null, 2)}\n`
const itemsText = `${JSON.stringify([item], null, 2)}\n`
const manifestHash = hashCanonicalJson(manifest)
const itemCanonicalHash = hashCanonicalJson(item)

const createDraft = (
  options: {
    readonly currentPackageId?: PackageId
    readonly candidateHash?: Sha256Hash
  } = {}
): ThirdPartyDataPackLockfileDraft => {
  const currentPackageId = options.currentPackageId ?? packageId
  const currentCandidateIdentity = {
    ...candidateIdentity,
    candidateHash: options.candidateHash ?? candidateIdentity.candidateHash
  }
  const contentFiles = [
    {
      registryId,
      path: 'data/items.json',
      entryCount: 1,
      entries: [
        {
          registryId,
          contentId: itemId,
          index: 0,
          canonicalHash: itemCanonicalHash
        }
      ]
    }
  ]
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity,
    candidateIdentity: currentCandidateIdentity,
    registryCount: 55,
    entryCount: 4243,
    selectedPackageIds: [currentPackageId],
    loadOrder: [currentPackageId],
    packages: [
      {
        packageId: currentPackageId,
        version: '1.0.0',
        loadIndex: 0,
        source: {
          candidatePath: candidatePackagePath,
          manifestPath: `${candidatePackagePath}/manifest.json`,
          contentFiles: [`${candidatePackagePath}/data/items.json`]
        },
        manifestHash,
        contentHash: hashCanonicalJson({
          manifestHash,
          contentFiles
        }),
        configurationHash: sha('f'),
        resolvedDependencies: [],
        contentFiles
      }
    ]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body) as Sha256Hash
  }
}

const createEnvelope = (
  draft: ThirdPartyDataPackLockfileDraft,
  overrides: Partial<ThirdPartyDataPackPackageFileStagingHostEnvelope> = {}
): ThirdPartyDataPackPackageFileStagingHostEnvelope => ({
  requestedCommandId: 'install',
  targetPackageId: draft.packages[0]!.packageId,
  selectedPackageIds: [...draft.selectedPackageIds],
  blockedPackageIds: [],
  loadOrder: [...draft.loadOrder],
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  packageCount: draft.packages.length,
  candidateIdentity: draft.candidateIdentity,
  lockfileHash: draft.lockfileHash,
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  ...overrides
})

const createFiles = () => [
  {
    path: 'manifest.json',
    contents: manifestText,
    sha256: sha256Utf8(manifestText)
  },
  {
    path: 'data/items.json',
    contents: itemsText,
    sha256: sha256Utf8(itemsText)
  }
]

const createWriteFailingStorage = (): ThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter => ({
  async write() {
    throw new Error('write should not be called')
  }
})

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectOnlyPackageFileEffects = (
  result: ThirdPartyDataPackPackageFilePersistentWriteProbeResult,
  options: {
    readonly packageFilesWritten: boolean
    readonly packageBackupsWritten: boolean
  }
): void => {
  expect(result.effects.packageFilesWritten).toBe(options.packageFilesWritten)
  expect(result.effects.packageBackupsWritten).toBe(options.packageBackupsWritten)
  const {
    packageFilesWritten: _packageFilesWritten,
    packageBackupsWritten: _packageBackupsWritten,
    ...otherEffects
  } = result.effects
  expect(Object.values(otherEffects).every(value => value === false)).toBe(true)
}

const expectOfficialBaseline = (): void => {
  const registrySet = buildOfficialRegistrySetFromStaticData()
  const snapshot = createSerializableRegistrySnapshot(registrySet)
  expect(registrySet.registryIds()).toHaveLength(54)
  expect(registrySet.registryIds().reduce(
    (total, currentRegistryId) => total + registrySet.get(currentRegistryId).entries().length,
    0
  )).toBe(4242)
  expect(snapshot.snapshotHash).toBe(committedMetadata.snapshotHash)
}

const readTemporaryNames = async(directory: string): Promise<readonly string[]> => {
  try {
    return (await readdir(directory))
      .filter(name => name.startsWith('.taoyuan-package-file-write-probe.tmp-'))
      .sort()
  } catch {
    return []
  }
}

describe('third-party package file persistent write probe', () => {
  it('defers by default without invoking persistent storage', async() => {
    const draft = createDraft()

    const result = await runThirdPartyDataPackPackageFilePersistentWriteProbe({
      envelope: createEnvelope(draft),
      draft,
      files: createFiles(),
      storage: createWriteFailingStorage()
    })

    expect(result.status).toBe('deferred')
    expect(result.reason).toBe(
      'package file write probe is deferred until an isolated persistent write probe is explicitly authorized'
    )
    expect(result.packageFileWriteProbe).toBe('deferred')
    expect(result.writeProbeAllowed).toBe(false)
    expect(result.persistentWriteExecuted).toBe(false)
    expect(result.writtenFileCount).toBe(0)
    expect(result.writeChecks.map(check => ({ id: check.id, status: check.status }))).toEqual([
      { id: 'install-staging-envelope-confirmed', status: 'satisfied' },
      { id: 'target-package-selected', status: 'satisfied' },
      { id: 'candidate-identity-consistent', status: 'satisfied' },
      { id: 'lockfile-hash-consistent', status: 'satisfied' },
      { id: 'draft-package-summary-consistent', status: 'satisfied' },
      { id: 'package-source-summary-consistent', status: 'satisfied' },
      { id: 'package-file-payload-complete', status: 'satisfied' },
      { id: 'package-file-payload-hashes-valid', status: 'satisfied' },
      { id: 'manifest-hash-consistent', status: 'satisfied' },
      { id: 'content-file-entries-consistent', status: 'satisfied' },
      { id: 'explicit-package-file-probe-authorized', status: 'skipped' },
      { id: 'storage-write-contained', status: 'skipped' }
    ])
    expectOnlyPackageFileEffects(result, {
      packageFilesWritten: false,
      packageBackupsWritten: false
    })
    expectJsonGraphFrozen(result)
  })

  it('writes only package files under the injected temporary mods root when explicitly authorized', async() => {
    const root = await createRoot()
    const userData = path.join(root, 'userdata')
    const settingsPath = path.join(userData, 'settings.json')
    const savePath = path.join(userData, 'Local Storage', 'leveldb', 'save.ldb')
    const officialCachePath = path.join(userData, 'mod-cache', 'sha256-official', 'official-registry-cache-v2.json')
    const modLockPath = path.join(userData, 'mod-lock.json')
    const transactionLogPath = path.join(userData, 'mod-transactions', 'pending.json')
    const otherPackagePath = path.join(root, 'mods', 'other_pack', 'manifest.json')
    const paths = resolveThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths(root, candidatePackagePath)
    const manifestPath = path.join(paths.packageDirectoryPath, 'manifest.json')
    const itemPath = path.join(paths.packageDirectoryPath, 'data', 'items.json')
    const backupManifestPath = path.join(
      paths.backupDirectoryPath,
      'manifest.json.backup'
    )
    await mkdir(path.dirname(savePath), { recursive: true })
    await mkdir(path.dirname(officialCachePath), { recursive: true })
    await mkdir(path.dirname(transactionLogPath), { recursive: true })
    await mkdir(path.dirname(otherPackagePath), { recursive: true })
    await mkdir(path.dirname(manifestPath), { recursive: true })
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    await writeFile(officialCachePath, 'official-cache-data', 'utf8')
    await writeFile(modLockPath, '{"kind":"previous-lockfile"}\n', 'utf8')
    await writeFile(transactionLogPath, '{"status":"pending"}\n', 'utf8')
    await writeFile(otherPackagePath, '{"id":"other_pack"}\n', 'utf8')
    await writeFile(manifestPath, '{"id":"previous_sample_pack"}\n', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const officialCacheBefore = await readFile(officialCachePath, 'utf8')
    const modLockBefore = await readFile(modLockPath, 'utf8')
    const transactionLogBefore = await readFile(transactionLogPath, 'utf8')
    const otherPackageBefore = await readFile(otherPackagePath, 'utf8')
    const previousManifest = await readFile(manifestPath, 'utf8')
    const draft = createDraft()
    const storage = createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter({
      programDirectoryPath: root
    })

    const result = await runThirdPartyDataPackPackageFilePersistentWriteProbe({
      envelope: createEnvelope(draft),
      draft,
      files: createFiles(),
      storage,
      allowPersistentWriteProbe: true
    })

    expect(result.status).toBe('written')
    expect(result.packageFileWriteProbe).toBe('written')
    expect(result.writeProbeAllowed).toBe(true)
    expect(result.persistentWriteExecuted).toBe(true)
    expect(result.storageStatus).toBe('written')
    expect(result.storageOperation).toBe('write')
    expect(result.writtenFiles.map(file => file.path)).toEqual([
      'manifest.json',
      'data/items.json'
    ])
    expect(result.writtenFiles.map(file => file.packagePath)).toEqual([
      candidatePackagePath,
      candidatePackagePath
    ])
    expect(result.writtenFileCount).toBe(2)
    expect(result.backedUpFileCount).toBe(1)
    expect(await readFile(manifestPath, 'utf8')).toBe(manifestText)
    expect(await readFile(itemPath, 'utf8')).toBe(itemsText)
    expect(await readFile(backupManifestPath, 'utf8')).toBe(previousManifest)
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(officialCachePath, 'utf8')).toBe(officialCacheBefore)
    expect(await readFile(modLockPath, 'utf8')).toBe(modLockBefore)
    expect(await readFile(transactionLogPath, 'utf8')).toBe(transactionLogBefore)
    expect(await readFile(otherPackagePath, 'utf8')).toBe(otherPackageBefore)
    expect(JSON.stringify(result)).not.toContain(root)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('programDirectoryPath')
    expectOnlyPackageFileEffects(result, {
      packageFilesWritten: true,
      packageBackupsWritten: true
    })
    expectOfficialBaseline()
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('restores backed up package files and removes newly created files when explicitly authorized', async() => {
    const root = await createRoot()
    const userData = path.join(root, 'userdata')
    const settingsPath = path.join(userData, 'settings.json')
    const savePath = path.join(userData, 'Local Storage', 'leveldb', 'save.ldb')
    const officialCachePath = path.join(userData, 'mod-cache', 'sha256-official', 'official-registry-cache-v2.json')
    const modLockPath = path.join(userData, 'mod-lock.json')
    const transactionLogPath = path.join(userData, 'mod-transactions', 'pending.json')
    const otherPackagePath = path.join(root, 'mods', 'other_pack', 'manifest.json')
    const paths = resolveThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths(root, candidatePackagePath)
    const manifestPath = path.join(paths.packageDirectoryPath, 'manifest.json')
    const itemPath = path.join(paths.packageDirectoryPath, 'data', 'items.json')
    await mkdir(path.dirname(savePath), { recursive: true })
    await mkdir(path.dirname(officialCachePath), { recursive: true })
    await mkdir(path.dirname(transactionLogPath), { recursive: true })
    await mkdir(path.dirname(otherPackagePath), { recursive: true })
    await mkdir(path.dirname(manifestPath), { recursive: true })
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    await writeFile(officialCachePath, 'official-cache-data', 'utf8')
    await writeFile(modLockPath, '{"kind":"previous-lockfile"}\n', 'utf8')
    await writeFile(transactionLogPath, '{"status":"pending"}\n', 'utf8')
    await writeFile(otherPackagePath, '{"id":"other_pack"}\n', 'utf8')
    await writeFile(manifestPath, '{"id":"previous_sample_pack"}\n', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const officialCacheBefore = await readFile(officialCachePath, 'utf8')
    const modLockBefore = await readFile(modLockPath, 'utf8')
    const transactionLogBefore = await readFile(transactionLogPath, 'utf8')
    const otherPackageBefore = await readFile(otherPackagePath, 'utf8')
    const previousManifest = await readFile(manifestPath, 'utf8')
    const draft = createDraft()
    const storage = createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter({
      programDirectoryPath: root
    })

    const writeResult = await runThirdPartyDataPackPackageFilePersistentWriteProbe({
      envelope: createEnvelope(draft),
      draft,
      files: createFiles(),
      storage,
      allowPersistentWriteProbe: true
    })
    const deferredRestore = await runThirdPartyDataPackPackageFilePersistentRestoreProbe({
      packageId,
      writtenFiles: writeResult.writtenFiles,
      storage
    })
    const restoreResult = await runThirdPartyDataPackPackageFilePersistentRestoreProbe({
      packageId,
      writtenFiles: writeResult.writtenFiles,
      storage,
      allowPersistentRestoreProbe: true
    })

    expect(writeResult.status).toBe('written')
    expect(writeResult.writtenFiles.map(file => file.packagePath)).toEqual([
      candidatePackagePath,
      candidatePackagePath
    ])
    expect(await readFile(manifestPath, 'utf8')).toBe(previousManifest)
    await expect(readFile(itemPath, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
    expect(deferredRestore.status).toBe('deferred')
    expect(deferredRestore.persistentRestoreExecuted).toBe(false)
    expect(restoreResult.status).toBe('restored')
    expect(restoreResult.storageStatus).toBe('restored')
    expect(restoreResult.storageOperation).toBe('restore')
    expect(restoreResult.packageFileRestoreProbe).toBe('restored')
    expect(restoreResult.restoreProbeAllowed).toBe(true)
    expect(restoreResult.persistentRestoreExecuted).toBe(true)
    expect(restoreResult.restoredFileCount).toBe(2)
    expect(restoreResult.backupRestoredFileCount).toBe(1)
    expect(restoreResult.removedCreatedFileCount).toBe(1)
    expect(restoreResult.restoredFiles).toEqual([
      {
        path: 'manifest.json',
        restoredFromBackup: true,
        removedCreatedFile: false
      },
      {
        path: 'data/items.json',
        restoredFromBackup: false,
        removedCreatedFile: true
      }
    ])
    expect(restoreResult.effects.packageFilesRestored).toBe(true)
    expect(restoreResult.effects.rollbackExecuted).toBe(true)
    expect(restoreResult.effects.packageFilesWritten).toBe(false)
    expect(restoreResult.effects.packageBackupsWritten).toBe(false)
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(officialCachePath, 'utf8')).toBe(officialCacheBefore)
    expect(await readFile(modLockPath, 'utf8')).toBe(modLockBefore)
    expect(await readFile(transactionLogPath, 'utf8')).toBe(transactionLogBefore)
    expect(await readFile(otherPackagePath, 'utf8')).toBe(otherPackageBefore)
    expect(JSON.stringify(restoreResult)).not.toContain(root)
    expect(JSON.stringify(restoreResult)).not.toContain('C:/Users')
    expect(JSON.stringify(restoreResult)).not.toContain('programDirectoryPath')
    expectJsonGraphFrozen(restoreResult)
  }, 30_000)

  it('restores legacy package-id written file evidence when candidate package path is absent', async() => {
    const root = await createRoot()
    const storage = createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter({
      programDirectoryPath: root
    })
    const paths = resolveThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths(root, packageId)
    const manifestPath = path.join(paths.packageDirectoryPath, 'manifest.json')
    const itemPath = path.join(paths.packageDirectoryPath, 'data', 'items.json')
    const backupManifestPath = path.join(paths.backupDirectoryPath, 'manifest.json.backup')
    const previousManifest = '{"id":"legacy_previous_sample_pack"}\n'
    await mkdir(path.dirname(itemPath), { recursive: true })
    await mkdir(path.dirname(backupManifestPath), { recursive: true })
    await writeFile(manifestPath, manifestText, 'utf8')
    await writeFile(itemPath, itemsText, 'utf8')
    await writeFile(backupManifestPath, previousManifest, 'utf8')

    const restoreResult = await runThirdPartyDataPackPackageFilePersistentRestoreProbe({
      packageId,
      writtenFiles: [
        {
          path: 'manifest.json',
          sha256: sha256Utf8(manifestText),
          bytes: manifestText.length,
          backedUp: true
        },
        {
          path: 'data/items.json',
          sha256: sha256Utf8(itemsText),
          bytes: itemsText.length,
          backedUp: false
        }
      ],
      storage,
      allowPersistentRestoreProbe: true
    })

    expect(restoreResult.status).toBe('restored')
    expect(await readFile(manifestPath, 'utf8')).toBe(previousManifest)
    await expect(readFile(itemPath, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
    expect(JSON.stringify(restoreResult)).not.toContain(root)
    expectJsonGraphFrozen(restoreResult)
  }, 30_000)

  it('blocks inconsistent envelope and draft identities before invoking storage', async() => {
    const draft = createDraft()
    let writeCalled = false
    const storage: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter = {
      async write() {
        writeCalled = true
        throw new Error('write should not be called')
      }
    }

    const result = await runThirdPartyDataPackPackageFilePersistentWriteProbe({
      envelope: createEnvelope(draft, {
        lockfileHash: sha('9')
      }),
      draft,
      files: createFiles(),
      storage,
      allowPersistentWriteProbe: true
    })

    expect(result.status).toBe('blocked')
    expect(writeCalled).toBe(false)
    expect(result.reason).toBe('package file write probe inputs are inconsistent')
    expect(result.writeChecks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'lockfile-hash-consistent',
        status: 'blocked'
      })
    ]))
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.package-file-write-probe.checks',
        fieldPath: '/writeChecks/lockfile-hash-consistent'
      })
    ]))
    expectOnlyPackageFileEffects(result, {
      packageFilesWritten: false,
      packageBackupsWritten: false
    })
    expectJsonGraphFrozen(result)
  })

  it('blocks unsafe or extra package paths before invoking storage', async() => {
    const draft = createDraft()
    let writeCalled = false
    const storage: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter = {
      async write() {
        writeCalled = true
        throw new Error('write should not be called')
      }
    }

    const result = await runThirdPartyDataPackPackageFilePersistentWriteProbe({
      envelope: createEnvelope(draft),
      draft,
      files: [
        ...createFiles(),
        {
          path: '../escape.json',
          contents: '{}\n'
        }
      ],
      storage,
      allowPersistentWriteProbe: true
    })

    expect(result.status).toBe('blocked')
    expect(writeCalled).toBe(false)
    expect(result.writeChecks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'package-file-payload-complete',
        status: 'blocked'
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('escape.json')
    expect(serialized).not.toContain('C:/Users')
    expectOnlyPackageFileEffects(result, {
      packageFilesWritten: false,
      packageBackupsWritten: false
    })
    expectJsonGraphFrozen(result)
  })

  it('reports failed writes while preserving previous package files and temporary files', async() => {
    const root = await createRoot()
    const paths = resolveThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths(root, candidatePackagePath)
    const manifestPath = path.join(paths.packageDirectoryPath, 'manifest.json')
    await mkdir(path.dirname(manifestPath), { recursive: true })
    await writeFile(manifestPath, '{"id":"previous_sample_pack"}\n', 'utf8')
    const previousManifest = await readFile(manifestPath, 'utf8')
    const draft = createDraft()
    const storage = createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter({
      programDirectoryPath: root,
      fileOptions: {
        beforeReplace: () => {
          throw new Error('simulated package file write probe interruption')
        }
      }
    })

    const result = await runThirdPartyDataPackPackageFilePersistentWriteProbe({
      envelope: createEnvelope(draft),
      draft,
      files: createFiles(),
      storage,
      allowPersistentWriteProbe: true
    })

    expect(result.status).toBe('failed')
    expect(result.storageStatus).toBe('failed')
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(await readFile(manifestPath, 'utf8')).toBe(previousManifest)
    expect(await readTemporaryNames(paths.packageDirectoryPath)).toEqual([])
    expect(await readTemporaryNames(paths.backupDirectoryPath)).toEqual([])
    expect(JSON.stringify(result)).not.toContain(root)
    expectOnlyPackageFileEffects(result, {
      packageFilesWritten: false,
      packageBackupsWritten: false
    })
    expectJsonGraphFrozen(result)
  }, 30_000)
})
