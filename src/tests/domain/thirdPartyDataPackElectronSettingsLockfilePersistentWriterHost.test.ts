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
  createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHost,
  type ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEffectSummary,
  type ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEnvelope,
  type ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsResult
} from '@/domain/mods/thirdPartyDataPackElectronSettingsLockfilePersistentWriterHost'
import {
  createThirdPartyDataPackSettingsLockfilePersistentWriterSource,
  ThirdPartyDataPackSettingsLockfilePersistentWriterBlockedError,
  type ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfilePersistentWriterSource'
import type {
  ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary,
  ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'
import {
  createThirdPartyDataPackModLockStorageAdapter,
  THIRD_PARTY_DATA_PACK_MOD_LOCK_STORAGE_KIND,
  type ThirdPartyDataPackModLockStorageAdapter,
  type ThirdPartyDataPackModLockStorageReport
} from '@/domain/mods/thirdPartyDataPackModLockStorage'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import { THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME } from '@/domain/mods/thirdPartyDataPackModLockFile'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-electron-settings-lockfile-host-'))
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
  const nextSettings = {
    ...current,
    thirdPartyDataPacks: {
      candidateHash: envelope.candidateHash,
      lockfileHash: envelope.lockfileHash,
      selectedPackageIds: envelope.selectedPackageIds,
      loadOrder: envelope.loadOrder
    }
  }
  const temporaryPath = path.join(userData, `.settings.json.tmp-${process.pid}-${randomUUID()}`)
  await writeFile(temporaryPath, `${JSON.stringify(nextSettings, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, settingsPath)
  return createSettingsResult(envelope)
}

const createReadyStorageReport = (): ThirdPartyDataPackModLockStorageReport => ({
  status: 'ready',
  operation: 'inspect',
  storageKind: THIRD_PARTY_DATA_PACK_MOD_LOCK_STORAGE_KIND,
  reason: 'ready',
  diagnostics: [],
  effects: {
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    runtimeEnablementAllowed: false,
    electronIpcExposed: false,
    packageFilesWritten: false,
    packageBackupsWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false
  }
})

const expectOnlySettingsAndLockfileWrites = (
  result: ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult,
  written: boolean
): void => {
  expect(result.effects.settingsWritten).toBe(written)
  expect(result.effects.lockfileWritten).toBe(written)
  expect(result.effects.packageFilesWritten).toBe(false)
  expect(result.effects.packageBackupsWritten).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.transactionLogWritten).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('Electron settings-lockfile persistent writer host adapter', () => {
  it('writes settings and program-directory userdata mod-lock through the persistent writer source', async() => {
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
    const storage = createThirdPartyDataPackModLockStorageAdapter({ programDirectoryPath: root })
    const host = createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHost({
      modLockStorage: storage,
      readLockfileDraft: async() => draft,
      writeSettings: createAtomicSettingsWriter(root)
    })
    const source = createThirdPartyDataPackSettingsLockfilePersistentWriterSource({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(draft),
      writeSettingsLockfile: host
    })

    const result = await source()
    const readBack = await storage.read()
    const settingsAfter = JSON.parse(await readFile(settingsPath, 'utf8')) as Record<string, unknown>

    expect(result.status).toBe('written')
    expect(result.settingsLockfilePersistentWriterHostStatus).toBe('written')
    expect(result.effects.settingsLockfilePersistentWriterHostWritten).toBe(true)
    expect(result.effects.realSettingsLockfilePersistentWriterHostCalled).toBe(false)
    expectOnlySettingsAndLockfileWrites(result, true)
    expect(readBack.draft).toEqual(draft)
    expect(readBack.report.paths?.filePath).toBe(path.join(userData, THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME))
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
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain(root)
    expect(serialized).not.toContain('settings.json')
    expect(serialized).not.toContain('mod-lock.json')
  }, 30_000)

  it('blocks a mismatched lockfile draft before settings or mod-lock writes run', async() => {
    const root = await createRoot()
    const draft = createDraft()
    const mismatchedDraft = createDraft({ candidateHash: sha('8') })
    const writeSettings = vi.fn(createAtomicSettingsWriter(root))
    const storage = createThirdPartyDataPackModLockStorageAdapter({ programDirectoryPath: root })
    const host = createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHost({
      modLockStorage: storage,
      readLockfileDraft: async() => mismatchedDraft,
      writeSettings
    })
    const source = createThirdPartyDataPackSettingsLockfilePersistentWriterSource({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(draft),
      writeSettingsLockfile: host
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackSettingsLockfilePersistentWriterBlockedError)

    try {
      await source()
    } catch (error) {
      const result = (error as ThirdPartyDataPackSettingsLockfilePersistentWriterBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.electron-settings-lockfile-persistent-writer-host.lockfile-draft-mismatch',
          packageId
        })
      ]))
      expectOnlySettingsAndLockfileWrites(result, false)
      expect(JSON.stringify(result)).not.toContain(root)
    }
    expect(writeSettings).not.toHaveBeenCalled()
    await expect(stat(path.join(root, 'userdata'))).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('blocks unsafe settings writer results before writing mod-lock and strips path diagnostics', async() => {
    const draft = createDraft()
    const storage = {
      inspect: vi.fn(async() => createReadyStorageReport()),
      read: vi.fn(),
      write: vi.fn()
    } as unknown as ThirdPartyDataPackModLockStorageAdapter
    const host = createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHost({
      modLockStorage: storage,
      readLockfileDraft: async() => draft,
      writeSettings: async(envelope) => createSettingsResult(envelope, {
        programDirectoryPath: 'C:/Users/LENOVO/AppData/Roaming/taoyuan/userdata',
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.electron-settings-lockfile-persistent-writer-host.settings-path',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'C:/Users/LENOVO/AppData/Roaming/taoyuan/userdata/settings.json',
            recovery: 'retry'
          }
        ],
        effects: {
          ...settingsEffects(true),
          cacheWritten: true
        } as never
      } as never)
    })
    const source = createThirdPartyDataPackSettingsLockfilePersistentWriterSource({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(draft, {
        blockedPackageIds: [blockedPackageId]
      }),
      writeSettingsLockfile: host
    })

    await expect(source()).rejects.toBeInstanceOf(ThirdPartyDataPackSettingsLockfilePersistentWriterBlockedError)

    try {
      await source()
    } catch (error) {
      const result = (error as ThirdPartyDataPackSettingsLockfilePersistentWriterBlockedError).result
      expect(result.status).toBe('blocked')
      expect(result.blockedPackageIds).toEqual([blockedPackageId])
      expect(result.diagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stage: 'third-party.electron-settings-lockfile-persistent-writer-host.settings-path',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.electron-settings-lockfile-persistent-writer-host.settings-write-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('settings.json')
      expect(serialized).not.toContain('programDirectoryPath')
      expectOnlySettingsAndLockfileWrites(result, false)
    }
    expect(storage.inspect).toHaveBeenCalled()
    expect(storage.write).not.toHaveBeenCalled()
  })
})
