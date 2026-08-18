/// <reference types="node" />

import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, stat, writeFile, rename } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { ContentId, PackageId, RegistryTypeId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline'
import {
  type ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEffectSummary,
  type ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEnvelope,
  type ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsResult
} from '@/domain/mods/thirdPartyDataPackElectronSettingsLockfilePersistentWriterHost'
import {
  createThirdPartyDataPackModLockStorageAdapter
} from '@/domain/mods/thirdPartyDataPackModLockStorage'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import type {
  ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingLifecyclePipeline'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipeline'
import type {
  ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary,
  ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const packageId = 'sample_pack' as PackageId

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-electron-settings-lockfile-connection-'))
  roots.push(root)
  return root
}

const sha = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const createDraft = (
  options: {
    readonly candidateHash?: Sha256Hash
    readonly packageId?: PackageId
  } = {}
): ThirdPartyDataPackLockfileDraft => {
  const selectedPackageId = options.packageId ?? packageId
  const itemId = `${selectedPackageId}:linen_ribbon` as ContentId
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
    selectedPackageIds: [selectedPackageId],
    loadOrder: [selectedPackageId],
    packages: [
      {
        packageId: selectedPackageId,
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

const commitEffects = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary> = {}
): ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary => ({
  settingsLockfileCommitSourceCalled: true,
  packageFileStagingSourceCalled: true,
  injectedSettingsLockfileCommitHostCalled: true,
  settingsLockfileCommitHostCalled: true,
  settingsLockfileCommitHostAccepted: true,
  realSettingsLockfileCommitHostCalled: false,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
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
  diagnosticsWritten: false,
  ...overrides
})

const createAcceptedCommitResult = (
  draft: ThirdPartyDataPackLockfileDraft,
  overrides: Partial<ThirdPartyDataPackSettingsLockfileCommitSourceResult> = {}
): ThirdPartyDataPackSettingsLockfileCommitSourceResult => ({
  kind: 'third-party-settings-lockfile-commit-source',
  mode: 'default-disabled-settings-lockfile-commit-source',
  status: 'accepted',
  reason: 'settings-lockfile commit source accepted an injected host acknowledgement',
  readOnly: true,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  packageFileStagingSourceStatus: 'accepted',
  packageFileStagingHostStatus: 'accepted',
  settingsLockfileCommitHostStatus: 'accepted',
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
  writeProbeEvidence: {
    modLockWriteProbeStatus: 'written',
    transactionLogWriteProbeStatus: 'written',
    modLockPersistentWriteExecuted: true,
    transactionLogPersistentWriteExecuted: true
  },
  diagnostics: [],
  effects: commitEffects(),
  ...overrides
} as ThirdPartyDataPackSettingsLockfileCommitSourceResult)

const stagingLifecycleEffects = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult['effects']> = {}
): ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult['effects'] => ({
  installPersistentStagingLifecyclePipelineCalled: true,
  packageFilePersistentStagingPipelineCalled: true,
  installCommandLifecyclePipelineCalled: true,
  packageFilePersistentWriteAcknowledged: true,
  installCommandLifecycleAcknowledged: true,
  commandDispatched: true,
  atomicCommitExecutorAcknowledged: true,
  postCommitVerificationAcknowledged: true,
  persistentReadProofAcknowledged: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
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
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
  packageFilesWritten: true,
  packageBackupsWritten: true,
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
  diagnosticsWritten: false,
  ...overrides
})

const createStagingLifecycleResult = (
  draft: ThirdPartyDataPackLockfileDraft,
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult> = {}
): ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult => ({
  kind: 'third-party-install-persistent-staging-lifecycle-pipeline',
  mode: 'default-disabled-install-persistent-staging-lifecycle-pipeline',
  status: 'ready',
  reason: 'third-party install persistent staging lifecycle accepted matching package-file writes and install command acknowledgement',
  readOnly: false,
  enabled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  packageFilePersistentStagingPipelineStatus: 'written',
  installCommandLifecyclePipelineStatus: 'ready',
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
  candidateHash: draft.candidateIdentity.candidateHash,
  lockfileHash: draft.lockfileHash,
  persistentWriteExecuted: true,
  writtenFileCount: 2,
  backedUpFileCount: 1,
  verificationOutcomeKind: 'verified',
  checks: [
    {
      id: 'install-target-consistent',
      status: 'satisfied',
      reason: 'same target'
    }
  ],
  diagnostics: [],
  effects: stagingLifecycleEffects(),
  ...overrides
} as ThirdPartyDataPackInstallPersistentStagingLifecyclePipelineResult)

const settingsEffects = (
  written = true
): ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEffectSummary => ({
  settingsWriterCalled: true,
  settingsWritten: written,
  lockfileWritten: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const createSettingsResult = (
  envelope: ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEnvelope,
  overrides: Partial<ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsResult> = {}
): ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsResult => ({
  status: 'written',
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  candidateHash: envelope.candidateHash,
  lockfileHash: envelope.lockfileHash,
  diagnostics: [],
  effects: settingsEffects(true),
  ...overrides
})

const createAtomicSettingsWriter = (programDirectoryPath: string) => async(
  envelope: ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEnvelope
): Promise<ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsResult> => {
  expect(Object.isFrozen(envelope)).toBe(true)
  const userData = path.join(programDirectoryPath, 'userdata')
  const settingsPath = path.join(userData, 'settings.json')
  await mkdir(userData, { recursive: true })
  let current: Record<string, unknown> = {}
  try {
    current = JSON.parse(await readFile(settingsPath, 'utf8')) as Record<string, unknown>
  } catch {
    current = {}
  }
  const temporaryPath = path.join(userData, `.settings.json.tmp-${process.pid}-${randomUUID()}`)
  await writeFile(temporaryPath, `${JSON.stringify({
    ...current,
    thirdPartyDataPacks: {
      candidateHash: envelope.candidateHash,
      lockfileHash: envelope.lockfileHash,
      selectedPackageIds: envelope.selectedPackageIds,
      loadOrder: envelope.loadOrder
    }
  }, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, settingsPath)
  return createSettingsResult(envelope)
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

const expectContainedLifecycle = (
  result: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileLifecyclePipelineResult,
  ready: boolean,
  settingsWrites: boolean
): void => {
  expect(result.commandContinuationAllowed).toBe(ready)
  expect(result.uiIpcResultContinuationAllowed).toBe(ready)
  expect(result.effects.commandContinuationAllowed).toBe(ready)
  expect(result.effects.uiIpcResultContinuationAllowed).toBe(ready)
  expect(result.effects.packageFilesWritten).toBe(true)
  expect(result.effects.packageBackupsWritten).toBe(true)
  expect(result.effects.settingsWritten).toBe(settingsWrites)
  expect(result.effects.lockfileWritten).toBe(settingsWrites)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party Electron settings-lockfile persistent writer host connection pipeline', () => {
  it('is disabled by default and does not read lifecycle, commit, draft or settings writer sources', async() => {
    const readInstallPersistentStagingLifecyclePipeline = vi.fn()
    const readSettingsLockfileCommitSource = vi.fn()
    const readLockfileDraft = vi.fn()
    const writeSettings = vi.fn()
    const pipeline = createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline({
      programDirectoryPath: 'unused-program-directory',
      readInstallPersistentStagingLifecyclePipeline,
      readSettingsLockfileCommitSource,
      readLockfileDraft,
      writeSettings
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.installPersistentStagingLifecyclePipelineStatus).toBeUndefined()
    expect(result.settingsLockfilePersistentWriterSourceStatus).toBeUndefined()
    expect(readInstallPersistentStagingLifecyclePipeline).not.toHaveBeenCalled()
    expect(readSettingsLockfileCommitSource).not.toHaveBeenCalled()
    expect(readLockfileDraft).not.toHaveBeenCalled()
    expect(writeSettings).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.effects.installPersistentStagingLifecyclePipelineCalled).toBe(false)
    expect(result.effects.settingsLockfilePersistentWriterSourceCalled).toBe(false)
    expect(result.effects.packageFilesWritten).toBe(false)
    expect(result.effects.settingsWritten).toBe(false)
    expect(result.effects.lockfileWritten).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('connects install staging lifecycle to the real Electron settings and mod-lock writer host', async() => {
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
    const saveBefore = await readFile(savePath, 'utf8')
    const officialCacheBefore = await readFile(officialCachePath, 'utf8')
    const packageBefore = await readFile(packagePath, 'utf8')
    const transactionLogBefore = await readFile(transactionLogPath, 'utf8')
    const draft = createDraft()
    const calls: string[] = []
    const pipeline = createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline({
      enabled: true,
      programDirectoryPath: root,
      readInstallPersistentStagingLifecyclePipeline: async() => {
        calls.push('install-persistent-staging-lifecycle')
        return createStagingLifecycleResult(draft)
      },
      readSettingsLockfileCommitSource: async() => {
        calls.push('settings-lockfile-commit-source')
        return createAcceptedCommitResult(draft)
      },
      readLockfileDraft: async() => {
        calls.push('lockfile-draft')
        return draft
      },
      writeSettings: async envelope => {
        calls.push('settings-writer')
        return createAtomicSettingsWriter(root)(envelope)
      }
    })

    const result = await pipeline()
    const readBack = await createThirdPartyDataPackModLockStorageAdapter({
      programDirectoryPath: root
    }).read()
    const settingsAfter = JSON.parse(await readFile(settingsPath, 'utf8')) as Record<string, unknown>

    expect(result.status).toBe('ready')
    expect(result.installPersistentStagingLifecyclePipelineStatus).toBe('ready')
    expect(result.settingsLockfilePersistentWriterSourceStatus).toBe('written')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateHash).toBe(draft.candidateIdentity.candidateHash)
    expect(result.candidateIdentity?.candidateHash).toBe(draft.candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(draft.lockfileHash)
    expect(result.persistentPackageWriteExecuted).toBe(true)
    expect(result.persistentSettingsLockfileWriteExecuted).toBe(true)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(result.effects.settingsLockfilePersistentWriterAcknowledged).toBe(true)
    expect(calls).toEqual([
      'install-persistent-staging-lifecycle',
      'settings-lockfile-commit-source',
      'lockfile-draft',
      'settings-writer'
    ])
    expect(readBack.draft).toEqual(draft)
    expect(settingsAfter.closeToTray).toBe(false)
    expect(settingsAfter.thirdPartyDataPacks).toEqual({
      candidateHash: draft.candidateIdentity.candidateHash,
      lockfileHash: draft.lockfileHash,
      selectedPackageIds: [packageId],
      loadOrder: [packageId]
    })
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(officialCachePath, 'utf8')).toBe(officialCacheBefore)
    expect(await readFile(packagePath, 'utf8')).toBe(packageBefore)
    expect(await readFile(transactionLogPath, 'utf8')).toBe(transactionLogBefore)
    expectContainedLifecycle(result, true, true)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain(root)
    expect(serialized).not.toContain('settings.json')
    expect(serialized).not.toContain('mod-lock.json')
    expect(serialized).not.toContain('Local Storage')
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('blocks before settings or mod-lock writes when the real host sees lockfile draft drift', async() => {
    const root = await createRoot()
    const draft = createDraft()
    const mismatchedDraft = createDraft({ candidateHash: sha('9') })
    const writeSettings = vi.fn(createAtomicSettingsWriter(root))
    const pipeline = createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostConnectionPipeline({
      enabled: true,
      programDirectoryPath: root,
      readInstallPersistentStagingLifecyclePipeline: async() => createStagingLifecycleResult(draft),
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(draft),
      readLockfileDraft: async() => mismatchedDraft,
      writeSettings
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.commandContinuationAllowed).toBe(false)
    expect(result.installPersistentStagingLifecyclePipelineStatus).toBe('ready')
    expect(result.settingsLockfilePersistentWriterSourceStatus).toBe('blocked')
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: 'third-party.electron-settings-lockfile-persistent-writer-host.lockfile-draft-mismatch',
        packageId
      }),
      expect.objectContaining({
        stage: 'third-party.install-persistent-staging-settings-lockfile-lifecycle-pipeline.settings-writer-source-failed',
        packageId
      })
    ]))
    expect(writeSettings).not.toHaveBeenCalled()
    expectContainedLifecycle(result, false, false)
    expect(JSON.stringify(result)).not.toContain(root)
    await expect(stat(path.join(root, 'userdata'))).rejects.toMatchObject({ code: 'ENOENT' })
    expectJsonGraphFrozen(result)
  })
})
