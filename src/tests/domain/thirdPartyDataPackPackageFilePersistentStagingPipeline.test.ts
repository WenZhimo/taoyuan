/// <reference types="node" />

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { hashCanonicalJson, sha256Utf8, type Sha256Hash } from '@/domain/mods/hash'
import type { ContentId, PackageId, RegistryTypeId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary,
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from '@/domain/mods/thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import type {
  ThirdPartyDataPackLockfileDraft
} from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import {
  createThirdPartyDataPackPackageFilePersistentStagingPipeline,
  type ThirdPartyDataPackPackageFilePersistentStagingPipelineResult
} from '@/domain/mods/thirdPartyDataPackPackageFilePersistentStagingPipeline'
import {
  createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter,
  resolveThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths
} from '@/domain/mods/thirdPartyDataPackPackageFilePersistentWriteProbe'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-package-file-staging-pipeline-'))
  roots.push(root)
  return root
}

const packageId = 'sample_pack' as PackageId
const itemId = `${packageId}:linen_ribbon` as ContentId
const registryId = 'taoyuan:item' as RegistryTypeId

const sha = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

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
      name: 'Pipeline Tester',
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
    fallback: 'Pipeline fixture item.'
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
    officialIdentity: {
      artifactHash: committedMetadata.artifactHash as Sha256Hash,
      contentHash: committedMetadata.contentHash as Sha256Hash,
      schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
      environmentHash: committedMetadata.environmentHash as Sha256Hash,
      snapshotHash: committedMetadata.snapshotHash as Sha256Hash,
      registryCount: 54,
      entryCount: 4242
    },
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
          candidatePath: 'sample-pack',
          manifestPath: 'sample-pack/manifest.json',
          contentFiles: ['sample-pack/data/items.json']
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

const preflightEffects: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightEffectSummary = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  atomicCommitExecutorCalled: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: false,
  lockfileRestored: false,
  settingsWritten: false,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
}

const createDeferredPreflight = (
  draft: ThirdPartyDataPackLockfileDraft,
  overrides: Partial<ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult> = {}
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult => ({
  status: 'deferred',
  transactionCommandDispatcherHandoffStatus: 'deferred',
  installTransactionDispatchPlanStatus: 'deferred',
  runtimePublicationCommitAdapterStatus: 'deferred',
  reason: 'atomic transaction commit executor preflight is inspect-only',
  requestedCommandId: 'install',
  targetPackageId: draft.selectedPackageIds[0],
  selectedPackageIds: draft.selectedPackageIds,
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: draft.loadOrder,
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  packageCount: draft.packages.length,
  candidateIdentity: draft.candidateIdentity,
  lockfileHash: draft.lockfileHash,
  atomicTransactionCommitExecutorPreflight: 'deferred',
  readOnly: true,
  atomicCommitExecutionAllowed: false,
  commandDispatchAllowed: false,
  transactionCommitAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimePublicationCommitAllowed: false,
  runtimeEnablementAllowed: false,
  postCommitVerificationAllowed: false,
  uiIpcResponseAllowed: false,
  rollbackRecoveryAllowed: false,
  executorChecks: [],
  executorStages: [],
  executorRequirements: [],
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  diagnostics: [],
  effects: preflightEffects,
  ...overrides
} as unknown as ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult)

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

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectContainedEffects = (
  result: ThirdPartyDataPackPackageFilePersistentStagingPipelineResult,
  options: {
    readonly packageFilesWritten: boolean
    readonly packageBackupsWritten: boolean
    readonly continuationAllowed: boolean
  }
): void => {
  expect(result.effects.commandContinuationAllowed).toBe(options.continuationAllowed)
  expect(result.effects.appBootstrapContinuationAllowed).toBe(options.continuationAllowed)
  expect(result.effects.packageFilesWritten).toBe(options.packageFilesWritten)
  expect(result.effects.packageBackupsWritten).toBe(options.packageBackupsWritten)
  expect(result.effects.lockfileWritten).toBe(false)
  expect(result.effects.settingsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party package file persistent staging pipeline', () => {
  it('is disabled by default and does not call preflight readers or persistent storage', async() => {
    const readAtomicCommitPreflight = vi.fn()
    const readLockfileDraft = vi.fn()
    const readPackageFilePayload = vi.fn()
    const storage = {
      write: vi.fn()
    }
    const pipeline = createThirdPartyDataPackPackageFilePersistentStagingPipeline({
      readAtomicCommitPreflight,
      readLockfileDraft,
      readPackageFilePayload,
      storage
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(readAtomicCommitPreflight).not.toHaveBeenCalled()
    expect(readLockfileDraft).not.toHaveBeenCalled()
    expect(readPackageFilePayload).not.toHaveBeenCalled()
    expect(storage.write).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expectContainedEffects(result, {
      packageFilesWritten: false,
      packageBackupsWritten: false,
      continuationAllowed: true
    })
    expectJsonGraphFrozen(result)
  })

  it('writes package files through the staging source only when the isolated probe is explicitly authorized', async() => {
    const root = await createRoot()
    const userData = path.join(root, 'userdata')
    const settingsPath = path.join(userData, 'settings.json')
    const savePath = path.join(userData, 'Local Storage', 'leveldb', 'save.ldb')
    const officialCachePath = path.join(userData, 'mod-cache', 'sha256-official', 'official-registry-cache-v2.json')
    const modLockPath = path.join(userData, 'mod-lock.json')
    const transactionLogPath = path.join(userData, 'mod-transactions', 'pending.json')
    const unrelatedPackagePath = path.join(root, 'mods', 'other_pack', 'manifest.json')
    const draft = createDraft()
    const paths = resolveThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths(root, packageId)
    const manifestPath = path.join(paths.packageDirectoryPath, 'manifest.json')
    const itemPath = path.join(paths.packageDirectoryPath, 'data', 'items.json')
    await mkdir(path.dirname(savePath), { recursive: true })
    await mkdir(path.dirname(officialCachePath), { recursive: true })
    await mkdir(path.dirname(transactionLogPath), { recursive: true })
    await mkdir(path.dirname(unrelatedPackagePath), { recursive: true })
    await mkdir(path.dirname(manifestPath), { recursive: true })
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    await writeFile(officialCachePath, 'official-cache-data', 'utf8')
    await writeFile(modLockPath, '{"kind":"previous-lockfile"}\n', 'utf8')
    await writeFile(transactionLogPath, '{"status":"pending"}\n', 'utf8')
    await writeFile(unrelatedPackagePath, '{"id":"other_pack"}\n', 'utf8')
    await writeFile(manifestPath, '{"id":"previous_sample_pack"}\n', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const officialCacheBefore = await readFile(officialCachePath, 'utf8')
    const modLockBefore = await readFile(modLockPath, 'utf8')
    const transactionLogBefore = await readFile(transactionLogPath, 'utf8')
    const unrelatedPackageBefore = await readFile(unrelatedPackagePath, 'utf8')
    const pipeline = createThirdPartyDataPackPackageFilePersistentStagingPipeline({
      enabled: true,
      allowPersistentWriteProbe: true,
      readAtomicCommitPreflight: async() => createDeferredPreflight(draft),
      readLockfileDraft: async envelope => {
        expect(Object.isFrozen(envelope)).toBe(true)
        expect(envelope.targetPackageId).toBe(packageId)
        expect('lockfileDraft' in envelope).toBe(false)
        expect('programDirectoryPath' in envelope).toBe(false)
        return draft
      },
      readPackageFilePayload: async envelope => {
        expect(envelope.candidateIdentity.candidateHash).toBe(draft.candidateIdentity.candidateHash)
        return createFiles()
      },
      storage: createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter({
        programDirectoryPath: root
      })
    })

    const result = await pipeline()

    expect(result.status).toBe('written')
    expect(result.packageFileStagingSourceStatus).toBe('accepted')
    expect(result.packageFilePersistentWriteProbeStatus).toBe('written')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateHash).toBe(draft.candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(draft.lockfileHash)
    expect(result.writtenFiles.map(file => file.path)).toEqual([
      'manifest.json',
      'data/items.json'
    ])
    expect(result.writtenFileCount).toBe(2)
    expect(result.backedUpFileCount).toBe(1)
    expect(await readFile(manifestPath, 'utf8')).toBe(manifestText)
    expect(await readFile(itemPath, 'utf8')).toBe(itemsText)
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(officialCachePath, 'utf8')).toBe(officialCacheBefore)
    expect(await readFile(modLockPath, 'utf8')).toBe(modLockBefore)
    expect(await readFile(transactionLogPath, 'utf8')).toBe(transactionLogBefore)
    expect(await readFile(unrelatedPackagePath, 'utf8')).toBe(unrelatedPackageBefore)
    expectContainedEffects(result, {
      packageFilesWritten: true,
      packageBackupsWritten: true,
      continuationAllowed: true
    })
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain(root)
    expect(serialized).not.toContain('C:/Users')
    expect(serialized).not.toContain('settings.json')
    expect(serialized).not.toContain('mod-lock.json')
    expect(serialized).not.toContain('Local Storage')
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('lockfileDraft')
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('defers package file staging when the persistent write probe is not explicitly authorized', async() => {
    const draft = createDraft()
    const storage = {
      write: vi.fn(async() => {
        throw new Error('write should not be called')
      })
    }
    const pipeline = createThirdPartyDataPackPackageFilePersistentStagingPipeline({
      enabled: true,
      readAtomicCommitPreflight: async() => createDeferredPreflight(draft),
      readLockfileDraft: async() => draft,
      readPackageFilePayload: async() => createFiles(),
      storage
    })

    const result = await pipeline()

    expect(result.status).toBe('deferred')
    expect(result.packageFileStagingSourceStatus).toBe('blocked')
    expect(result.packageFilePersistentWriteProbeStatus).toBe('deferred')
    expect(result.writeProbeAllowed).toBe(false)
    expect(result.persistentWriteExecuted).toBe(false)
    expect(storage.write).not.toHaveBeenCalled()
    expectContainedEffects(result, {
      packageFilesWritten: false,
      packageBackupsWritten: false,
      continuationAllowed: false
    })
    expect(JSON.stringify(result)).not.toContain('programDirectoryPath')
    expectJsonGraphFrozen(result)
  })

  it('blocks missing injected sources before reading package payloads or storage', async() => {
    const readAtomicCommitPreflight = vi.fn()
    const storage = {
      write: vi.fn()
    }
    const pipeline = createThirdPartyDataPackPackageFilePersistentStagingPipeline({
      enabled: true,
      readAtomicCommitPreflight,
      storage
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(readAtomicCommitPreflight).not.toHaveBeenCalled()
    expect(storage.write).not.toHaveBeenCalled()
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        stage: 'third-party.package-file-persistent-staging-pipeline.missing-source'
      })
    ])
    expectContainedEffects(result, {
      packageFilesWritten: false,
      packageBackupsWritten: false,
      continuationAllowed: false
    })
    expectJsonGraphFrozen(result)
  })
})
