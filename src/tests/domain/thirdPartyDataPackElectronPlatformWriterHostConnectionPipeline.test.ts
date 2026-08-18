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
  createThirdPartyDataPackElectronPlatformWriterHostConnectionPipeline
} from '@/domain/mods/thirdPartyDataPackElectronPlatformWriterHostConnectionPipeline'
import {
  ThirdPartyDataPackElectronPlatformWriterHostConnectionBlockedError,
  type ThirdPartyDataPackElectronPlatformWriterHostConnectionEnvelope,
  type ThirdPartyDataPackElectronPlatformWriterHostConnectionResult,
  type ThirdPartyDataPackElectronPlatformWriterHostConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackElectronPlatformWriterHostConnectionSource'
import {
  createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHost,
  type ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEffectSummary,
  type ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEnvelope,
  type ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsResult
} from '@/domain/mods/thirdPartyDataPackElectronSettingsLockfilePersistentWriterHost'
import {
  createThirdPartyDataPackModLockStorageAdapter
} from '@/domain/mods/thirdPartyDataPackModLockStorage'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import type {
  ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary,
  ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'
import type {
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary,
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfilePersistentWriterSource'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-electron-platform-writer-pipeline-'))
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

const writerEffects = (
  overrides: Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary> = {}
): ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary => ({
  settingsLockfilePersistentWriterHostCalled: true,
  settingsLockfilePersistentWriterHostWritten: true,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: true,
  lockfileRestored: false,
  settingsWritten: true,
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

const createWriterResult = (
  envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  overrides: Partial<ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult> = {}
): ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult => ({
  status: 'written',
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  packageFileStagingHostStatus: envelope.packageFileStagingHostStatus,
  settingsLockfileCommitHostStatus: envelope.settingsLockfileCommitHostStatus,
  modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
  transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
  modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
  transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
  diagnostics: [],
  effects: writerEffects(),
  ...overrides
})

const createAtomicSettingsWriter = (programDirectoryPath: string) => async(
  envelope: ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEnvelope
): Promise<ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsResult> => {
  expect(Object.isFrozen(envelope)).toBe(true)
  const userData = path.join(programDirectoryPath, 'userdata')
  const settingsPath = path.join(userData, 'settings.json')
  await mkdir(userData, { recursive: true })
  let currentSettings: Record<string, unknown> = {}
  try {
    currentSettings = JSON.parse(await readFile(settingsPath, 'utf8')) as Record<string, unknown>
  } catch {
    currentSettings = {}
  }
  const temporaryPath = path.join(userData, `.settings.json.tmp-${process.pid}-${randomUUID()}`)
  await writeFile(temporaryPath, `${JSON.stringify({
    ...currentSettings,
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

const createAcceptedPlatformHostResult = (
  envelope: ThirdPartyDataPackElectronPlatformWriterHostConnectionEnvelope,
  overrides: Partial<ThirdPartyDataPackElectronPlatformWriterHostConnectionResult> = {}
): ThirdPartyDataPackElectronPlatformWriterHostConnectionResult => ({
  status: 'accepted',
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: envelope.selectedPackageIds,
  blockedPackageIds: envelope.blockedPackageIds,
  loadOrder: envelope.loadOrder,
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
  transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
  modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
  transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
  electronRequirementIds: envelope.electronRequirementIds,
  diagnostics: [],
  effects: {
    electronPlatformWriterHostCalled: true,
    electronPlatformWriterHostAccepted: true,
    electronPlatformWriterConnected: true,
    programDirectoryUserdataResolved: true,
    electronIpcExposed: false,
    transactionCommitted: false,
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
  },
  ...overrides
})

const expectContainedPipelineEffects = (
  result: ThirdPartyDataPackElectronPlatformWriterHostConnectionSourceResult,
  connected: boolean,
  upstreamWrites: boolean,
  continuationAllowed = true
): void => {
  expect(result.appBootstrapContinuationAllowed).toBe(continuationAllowed)
  expect(result.commandContinuationAllowed).toBe(continuationAllowed)
  expect(result.effects.electronPlatformWriterConnected).toBe(connected)
  expect(result.effects.programDirectoryUserdataResolved).toBe(connected)
  expect(result.effects.electronPlatformWriterHostAccepted).toBe(connected)
  expect(result.effects.realElectronPlatformWriterHostCalled).toBe(false)
  expect(result.effects.electronIpcExposed).toBe(false)
  expect(result.effects.settingsWritten).toBe(upstreamWrites)
  expect(result.effects.lockfileWritten).toBe(upstreamWrites)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

describe('third-party Electron platform writer host connection pipeline', () => {
  it('is disabled by default and does not call commit readers, persistent writers or platform hosts', async() => {
    const readSettingsLockfileCommitSource = vi.fn()
    const writeSettingsLockfile = vi.fn()
    const connectElectronPlatformWriterHost = vi.fn()
    const pipeline = createThirdPartyDataPackElectronPlatformWriterHostConnectionPipeline({
      readSettingsLockfileCommitSource,
      writeSettingsLockfile,
      connectElectronPlatformWriterHost
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readSettingsLockfileCommitSource).not.toHaveBeenCalled()
    expect(writeSettingsLockfile).not.toHaveBeenCalled()
    expect(connectElectronPlatformWriterHost).not.toHaveBeenCalled()
    expectContainedPipelineEffects(result, false, false)
    expectJsonGraphFrozen(result)
  })

  it('threads the Electron settings-lockfile writer host through platform writer preflight and host acknowledgement', async() => {
    const root = await createRoot()
    const userData = path.join(root, 'userdata')
    const savePath = path.join(userData, 'Local Storage', 'leveldb', 'save.ldb')
    const cachePath = path.join(userData, 'mod-cache', 'sha256-official', 'official-registry-cache-v2.json')
    const packagePath = path.join(root, 'mods', 'sample-pack', 'manifest.json')
    const transactionLogPath = path.join(userData, 'mod-transactions', 'pending.json')
    await mkdir(path.dirname(savePath), { recursive: true })
    await mkdir(path.dirname(cachePath), { recursive: true })
    await mkdir(path.dirname(packagePath), { recursive: true })
    await mkdir(path.dirname(transactionLogPath), { recursive: true })
    await writeFile(savePath, 'player-save-data', 'utf8')
    await writeFile(cachePath, 'official-cache-data', 'utf8')
    await writeFile(packagePath, '{"id":"sample_pack"}\n', 'utf8')
    await writeFile(transactionLogPath, '{"status":"pending"}\n', 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const cacheBefore = await readFile(cachePath, 'utf8')
    const packageBefore = await readFile(packagePath, 'utf8')
    const transactionLogBefore = await readFile(transactionLogPath, 'utf8')
    const draft = createDraft()
    const storage = createThirdPartyDataPackModLockStorageAdapter({ programDirectoryPath: root })
    const writeSettingsLockfile = createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHost({
      modLockStorage: storage,
      readLockfileDraft: async() => draft,
      writeSettings: createAtomicSettingsWriter(root)
    })
    const connectElectronPlatformWriterHost = vi.fn(async(
      envelope: ThirdPartyDataPackElectronPlatformWriterHostConnectionEnvelope
    ) => {
      expect(Object.isFrozen(envelope)).toBe(true)
      expect(envelope.requestedCommandId).toBe('install')
      expect(envelope.targetPackageId).toBe(packageId)
      expect(envelope.candidateIdentity.candidateHash).toBe(draft.candidateIdentity.candidateHash)
      expect(envelope.lockfileHash).toBe(draft.lockfileHash)
      expect(envelope.electronRequirementIds).toEqual([
        'electron-program-directory-userdata-root',
        'electron-mod-lock-json-atomic-writer',
        'electron-settings-json-atomic-writer',
        'electron-path-free-preload-ipc'
      ])
      expect('programDirectoryPath' in envelope).toBe(false)
      return createAcceptedPlatformHostResult(envelope)
    })
    const pipeline = createThirdPartyDataPackElectronPlatformWriterHostConnectionPipeline({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(draft),
      writeSettingsLockfile,
      connectElectronPlatformWriterHost
    })

    const result = await pipeline()
    const readBack = await storage.read()
    const settingsAfter = JSON.parse(await readFile(path.join(userData, 'settings.json'), 'utf8')) as Record<string, unknown>

    expect(result.status).toBe('connected')
    expect(result.electronPlatformWriterAdapterPreflightStatus).toBe('ready')
    expect(result.electronPlatformWriterHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(draft.candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(draft.lockfileHash)
    expect(connectElectronPlatformWriterHost).toHaveBeenCalledOnce()
    expectContainedPipelineEffects(result, true, true)
    expect(readBack.draft).toEqual(draft)
    expect(settingsAfter.thirdPartyDataPacks).toEqual({
      candidateHash: draft.candidateIdentity.candidateHash,
      lockfileHash: draft.lockfileHash,
      selectedPackageIds: [packageId],
      loadOrder: [packageId]
    })
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(cachePath, 'utf8')).toBe(cacheBefore)
    expect(await readFile(packagePath, 'utf8')).toBe(packageBefore)
    expect(await readFile(transactionLogPath, 'utf8')).toBe(transactionLogBefore)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain(root)
    expect(serialized).not.toContain('settings.json')
    expect(serialized).not.toContain('mod-lock.json')
    expect(serialized).not.toContain('Local Storage')
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('constructs the Electron settings-lockfile writer host from program-directory sources', async() => {
    const root = await createRoot()
    const userData = path.join(root, 'userdata')
    const settingsPath = path.join(userData, 'settings.json')
    const savePath = path.join(userData, 'Local Storage', 'leveldb', 'save.ldb')
    const cachePath = path.join(userData, 'mod-cache', 'sha256-official', 'official-registry-cache-v2.json')
    const packagePath = path.join(root, 'mods', 'sample-pack', 'manifest.json')
    const transactionLogPath = path.join(userData, 'mod-transactions', 'pending.json')
    await mkdir(path.dirname(savePath), { recursive: true })
    await mkdir(path.dirname(cachePath), { recursive: true })
    await mkdir(path.dirname(packagePath), { recursive: true })
    await mkdir(path.dirname(transactionLogPath), { recursive: true })
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    await writeFile(cachePath, 'official-cache-data', 'utf8')
    await writeFile(packagePath, '{"id":"sample_pack"}\n', 'utf8')
    await writeFile(transactionLogPath, '{"status":"pending"}\n', 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const cacheBefore = await readFile(cachePath, 'utf8')
    const packageBefore = await readFile(packagePath, 'utf8')
    const transactionLogBefore = await readFile(transactionLogPath, 'utf8')
    const draft = createDraft()
    const readLockfileDraft = vi.fn(async() => draft)
    const writeSettings = vi.fn(createAtomicSettingsWriter(root))
    const connectElectronPlatformWriterHost = vi.fn(async(
      envelope: ThirdPartyDataPackElectronPlatformWriterHostConnectionEnvelope
    ) => createAcceptedPlatformHostResult(envelope))
    const pipeline = createThirdPartyDataPackElectronPlatformWriterHostConnectionPipeline({
      enabled: true,
      programDirectoryPath: root,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(draft),
      readLockfileDraft,
      writeSettings,
      connectElectronPlatformWriterHost
    })

    const result = await pipeline()
    const readBack = await createThirdPartyDataPackModLockStorageAdapter({
      programDirectoryPath: root
    }).read()
    const settingsAfter = JSON.parse(await readFile(settingsPath, 'utf8')) as Record<string, unknown>

    expect(result.status).toBe('connected')
    expect(result.electronPlatformWriterAdapterPreflightStatus).toBe('ready')
    expect(result.electronPlatformWriterHostStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(draft.candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(draft.lockfileHash)
    expect(readLockfileDraft).toHaveBeenCalledOnce()
    expect(writeSettings).toHaveBeenCalledOnce()
    expect(connectElectronPlatformWriterHost).toHaveBeenCalledOnce()
    expect(readBack.draft).toEqual(draft)
    expect(settingsAfter.closeToTray).toBe(false)
    expect(settingsAfter.thirdPartyDataPacks).toEqual({
      candidateHash: draft.candidateIdentity.candidateHash,
      lockfileHash: draft.lockfileHash,
      selectedPackageIds: [packageId],
      loadOrder: [packageId]
    })
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(cachePath, 'utf8')).toBe(cacheBefore)
    expect(await readFile(packagePath, 'utf8')).toBe(packageBefore)
    expect(await readFile(transactionLogPath, 'utf8')).toBe(transactionLogBefore)
    expectContainedPipelineEffects(result, true, true)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain(root)
    expect(serialized).not.toContain('settings.json')
    expect(serialized).not.toContain('mod-lock.json')
    expect(serialized).not.toContain('Local Storage')
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('keeps injected writer precedence when program-directory writer inputs are also supplied', async() => {
    const root = await createRoot()
    const draft = createDraft()
    const readLockfileDraft = vi.fn(async() => draft)
    const writeSettings = vi.fn(createAtomicSettingsWriter(root))
    const writeSettingsLockfile = vi.fn(async(
      envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope
    ) => createWriterResult(envelope))
    const connectElectronPlatformWriterHost = vi.fn(async(
      envelope: ThirdPartyDataPackElectronPlatformWriterHostConnectionEnvelope
    ) => createAcceptedPlatformHostResult(envelope))
    const pipeline = createThirdPartyDataPackElectronPlatformWriterHostConnectionPipeline({
      enabled: true,
      programDirectoryPath: root,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(draft),
      writeSettingsLockfile,
      readLockfileDraft,
      writeSettings,
      connectElectronPlatformWriterHost
    })

    const result = await pipeline()

    expect(result.status).toBe('connected')
    expect(writeSettingsLockfile).toHaveBeenCalledOnce()
    expect(readLockfileDraft).not.toHaveBeenCalled()
    expect(writeSettings).not.toHaveBeenCalled()
    expect(connectElectronPlatformWriterHost).toHaveBeenCalledOnce()
    expectContainedPipelineEffects(result, true, true)
    await expect(stat(path.join(root, 'userdata'))).rejects.toMatchObject({ code: 'ENOENT' })
    expectJsonGraphFrozen(result)
  })

  it('blocks before platform host acknowledgement when the persistent writer host rejects its lockfile draft', async() => {
    const root = await createRoot()
    const draft = createDraft()
    const mismatchedDraft = createDraft({ candidateHash: sha('9') })
    const writeSettings = vi.fn(createAtomicSettingsWriter(root))
    const writeSettingsLockfile = createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHost({
      modLockStorage: createThirdPartyDataPackModLockStorageAdapter({ programDirectoryPath: root }),
      readLockfileDraft: async() => mismatchedDraft,
      writeSettings
    })
    const connectElectronPlatformWriterHost = vi.fn(async(
      envelope: ThirdPartyDataPackElectronPlatformWriterHostConnectionEnvelope
    ) => createAcceptedPlatformHostResult(envelope))
    const pipeline = createThirdPartyDataPackElectronPlatformWriterHostConnectionPipeline({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(draft, {
        blockedPackageIds: [blockedPackageId]
      }),
      writeSettingsLockfile,
      connectElectronPlatformWriterHost
    })

    await expect(pipeline()).rejects.toBeInstanceOf(
      ThirdPartyDataPackElectronPlatformWriterHostConnectionBlockedError
    )

    try {
      await pipeline()
    } catch (error) {
      expect(error).toBeInstanceOf(ThirdPartyDataPackElectronPlatformWriterHostConnectionBlockedError)
      const result = (error as ThirdPartyDataPackElectronPlatformWriterHostConnectionBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.commandContinuationAllowed).toBe(false)
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.electron-platform-writer-host-connection.source-failed'
        })
      ]))
      expectContainedPipelineEffects(result, false, false, false)
      expect(JSON.stringify(result)).not.toContain(root)
    }
    expect(writeSettings).not.toHaveBeenCalled()
    expect(connectElectronPlatformWriterHost).not.toHaveBeenCalled()
    await expect(stat(path.join(root, 'userdata'))).rejects.toMatchObject({ code: 'ENOENT' })
  })
})
