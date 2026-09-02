/// <reference types="node" />

import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import {
  requireContentId,
  requireRegistryTypeId,
  type PackageId
} from '@/domain/mods/ids'
import {
  createThirdPartyDataPackElectronStartupPersistentStateSourceHost,
  readThirdPartyDataPackElectronStartupPersistentStateSnapshot,
  resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_FILE_NAME,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_MAX_BYTES,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE,
  THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_STORAGE_KIND,
  type ThirdPartyDataPackElectronStartupPersistentStateSourceHostEffects
} from '@/domain/mods/thirdPartyDataPackElectronStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceRequest
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import type {
  ThirdPartyDataPackLockfileDraft
} from '@/domain/mods/thirdPartyDataPackLockfileDraft'

const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-electron-startup-state-source-'))
  roots.push(root)
  return root
}

const packageId = 'sample_pack' as PackageId

const candidateIdentity = {
  formatVersion: 1,
  contentHash: `sha256:${'a'.repeat(64)}` as Sha256Hash,
  snapshotHash: `sha256:${'b'.repeat(64)}` as Sha256Hash,
  candidateHash: `sha256:${'c'.repeat(64)}` as Sha256Hash
} as const

const createModLockDraft = (): ThirdPartyDataPackLockfileDraft => {
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity: {
      artifactHash: `sha256:${'1'.repeat(64)}` as Sha256Hash,
      contentHash: `sha256:${'2'.repeat(64)}` as Sha256Hash,
      schemaSetHash: `sha256:${'3'.repeat(64)}` as Sha256Hash,
      environmentHash: `sha256:${'4'.repeat(64)}` as Sha256Hash,
      snapshotHash: `sha256:${'5'.repeat(64)}` as Sha256Hash,
      registryCount: 54,
      entryCount: 4242
    },
    candidateIdentity,
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
          candidatePath: 'installed-pack',
          manifestPath: 'installed-pack/manifest.json',
          contentFiles: [
            'installed-pack/data/items.json'
          ]
        },
        manifestHash: `sha256:${'6'.repeat(64)}` as Sha256Hash,
        contentHash: `sha256:${'7'.repeat(64)}` as Sha256Hash,
        configurationHash: `sha256:${'8'.repeat(64)}` as Sha256Hash,
        resolvedDependencies: [],
        contentFiles: [
          {
            registryId: requireRegistryTypeId('taoyuan:item'),
            path: 'data/items.json',
            entryCount: 1,
            entries: [
              {
                registryId: requireRegistryTypeId('taoyuan:item'),
                contentId: requireContentId(`${packageId}:linen_ribbon`),
                index: 0,
                canonicalHash: `sha256:${'9'.repeat(64)}` as Sha256Hash
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

const modLockDraft = createModLockDraft()
const lockfileHash = modLockDraft.lockfileHash

const request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest = {
  formatVersion: 1,
  commandId: 'install',
  packageId,
  candidateIdentity,
  lockfileHash,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidateCount: 0,
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  requiredSourceIds: [
    'committed-transaction-log-source',
    'package-state-source',
    'settings-state-source',
    'mod-lock-state-source',
    'live-registry-identity-source',
    'save-cache-isolation-source',
    'startup-failure-reporting-source',
    'no-startup-read-write-side-effect-guard'
  ],
  deferredStageIds: [
    'transaction-log-state-read',
    'package-state-read',
    'settings-state-read',
    'mod-lock-state-read',
    'live-registry-identity-read',
    'save-cache-isolation-read',
    'startup-failure-reporting',
    'launcher-gameapp-gate'
  ]
}

const createSnapshotFile = (
  overrides: Record<string, unknown> = {}
) => ({
  formatVersion: 1,
  kind: 'electron-startup-persistent-state-snapshot',
  packageId,
  candidateIdentity,
  lockfileHash,
  transactionLog: { committed: true },
  packageState: { matched: true },
  settingsState: { matched: true },
  modLockState: { matched: true },
  liveRegistry: { matched: true },
  saveCache: { isolated: true },
  ...overrides
})

const writeSnapshot = async(
  root: string,
  value: unknown = createSnapshotFile()
): Promise<string> => {
  const paths = resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths(root)
  await mkdir(paths.startupStateDirectoryPath, { recursive: true })
  await writeFile(paths.snapshotFilePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  return paths.snapshotFilePath
}

const createSettingsFile = (
  overrides: Record<string, unknown> = {}
) => ({
  closeToTray: false,
  thirdPartyDataPacks: {
    candidateHash: candidateIdentity.candidateHash,
    lockfileHash,
    selectedPackageIds: [packageId],
    loadOrder: [packageId],
    ...overrides
  }
})

const writeSettingsAndModLock = async(
  root: string,
  options: {
    readonly settingsOverrides?: Record<string, unknown>
    readonly modLock?: unknown
  } = {}
) => {
  const paths = resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths(root)
  await mkdir(paths.userDataPath, { recursive: true })
  await writeFile(paths.settingsFilePath, `${JSON.stringify(
    createSettingsFile(options.settingsOverrides),
    null,
    2
  )}\n`, 'utf8')
  await writeFile(paths.modLockFilePath, `${JSON.stringify(options.modLock ?? modLockDraft, null, 2)}\n`, 'utf8')
  return paths
}

const expectNoPersistentWrites = (
  effects: ThirdPartyDataPackElectronStartupPersistentStateSourceHostEffects
): void => {
  expect(effects).toMatchObject({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    liveRegistrySwapped: false,
    previousRegistryRestored: false,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: false,
    modManagementUiMounted: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    piniaCreated: false,
    routerMounted: false,
    electronIpcExposed: false,
    electronIpcResponseSent: false,
    commandDispatched: false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
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
  })
}

const expectJsonGraphFrozen = (value: unknown): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true)
    for (const child of Object.values(value as Record<string, unknown>)) expectJsonGraphFrozen(child)
  }
}

describe('third-party Electron startup persistent state source host', () => {
  it('resolves program-directory userdata paths without creating files or directories', async() => {
    const root = await createRoot()
    const paths = resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths(root)
    const host = createThirdPartyDataPackElectronStartupPersistentStateSourceHost({
      programDirectoryPath: () => root
    })

    const report = await host.inspect()

    expect(paths).toEqual({
      programDirectoryPath: root,
      userDataPath: path.join(root, 'userdata'),
      startupStateDirectoryPath: path.join(root, 'userdata', 'mod-startup-state'),
      snapshotFilePath: path.join(root, 'userdata', 'mod-startup-state', THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_FILE_NAME),
      settingsFilePath: path.join(root, 'userdata', 'settings.json'),
      modLockFilePath: path.join(root, 'userdata', 'mod-lock.json')
    })
    expect(host.kind).toBe(THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND)
    expect(host.mode).toBe(THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE)
    expect(report).toMatchObject({
      status: 'ready',
      operation: 'inspect',
      storageKind: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_STORAGE_KIND,
      readOnly: true,
      persistentStartupReadAllowed: true,
      writeAllowed: false,
      programDirectoryContained: true
    })
    expectNoPersistentWrites(report.effects)
    expect(report.effects.startupPersistentStateSnapshotRead).toBe(false)
    await expect(stat(paths.userDataPath)).rejects.toMatchObject({ code: 'ENOENT' })
    expect(JSON.stringify(report)).not.toContain(root)
  })

  it('loads a path-free startup snapshot from isolated program-directory userdata while preserving adjacent data', async() => {
    const root = await createRoot()
    const paths = await writeSettingsAndModLock(root)
    const settingsPath = paths.settingsFilePath
    const userData = paths.userDataPath
    const savePath = path.join(userData, 'Local Storage', 'leveldb', 'save.ldb')
    const officialCachePath = path.join(userData, 'mod-cache', 'sha256-official', 'official-registry-cache-v2.json')
    const packagePath = path.join(root, 'mods', 'sample-pack', 'manifest.json')
    const modLockPath = paths.modLockFilePath
    const transactionLogPath = path.join(userData, 'mod-transactions', 'committed.json')
    await mkdir(path.dirname(savePath), { recursive: true })
    await mkdir(path.dirname(officialCachePath), { recursive: true })
    await mkdir(path.dirname(packagePath), { recursive: true })
    await mkdir(path.dirname(transactionLogPath), { recursive: true })
    await writeFile(savePath, 'player-save-data', 'utf8')
    await writeFile(officialCachePath, 'official-cache-data', 'utf8')
    await writeFile(packagePath, '{"id":"sample_pack"}\n', 'utf8')
    await writeFile(transactionLogPath, '{"status":"committed"}\n', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const officialCacheBefore = await readFile(officialCachePath, 'utf8')
    const packageBefore = await readFile(packagePath, 'utf8')
    const modLockBefore = await readFile(modLockPath, 'utf8')
    const transactionLogBefore = await readFile(transactionLogPath, 'utf8')
    await writeSnapshot(root)
    const host = createThirdPartyDataPackElectronStartupPersistentStateSourceHost({
      programDirectoryPath: root
    })

    const result = await readThirdPartyDataPackElectronStartupPersistentStateSnapshot({
      programDirectoryPath: root,
      request
    })
    const snapshot = await host.read(request)

    expect(result.report.status).toBe('loaded')
    expect(result.report.snapshotFilePresent).toBe(true)
    expect(result.report.snapshotFileSizeBytes).toBeGreaterThan(0)
    expect(result.report.effects.startupPersistentStateSnapshotRead).toBe(true)
    expect(result.report.settingsFileRead).toBe(true)
    expect(result.report.modLockFileRead).toBe(true)
    expect(result.report.effects.settingsStateRead).toBe(true)
    expect(result.report.effects.modLockStateRead).toBe(true)
    expect(result.snapshot).toEqual({
      kind: 'startup-persistent-state-snapshot',
      settled: true,
      packageId,
      candidateIdentity,
      lockfileHash,
      transactionLogCommitted: true,
      packageStateMatched: true,
      settingsStateMatched: true,
      modLockStateMatched: true,
      liveRegistryMatched: true,
      saveCacheIsolated: true,
      messageKey: 'mods.startup.persistent.state.electron.ready',
      recovery: 'none',
      retryable: false,
      rollbackRequired: false
    })
    expect(snapshot).toEqual(result.snapshot)
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(officialCachePath, 'utf8')).toBe(officialCacheBefore)
    expect(await readFile(packagePath, 'utf8')).toBe(packageBefore)
    expect(await readFile(modLockPath, 'utf8')).toBe(modLockBefore)
    expect(await readFile(transactionLogPath, 'utf8')).toBe(transactionLogBefore)
    expectNoPersistentWrites(result.report.effects)
    expect(JSON.stringify(result)).not.toContain(root)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('reports missing, invalid and identity-drift snapshots without leaking host paths', async() => {
    const missingRoot = await createRoot()
    const invalidRoot = await createRoot()
    const driftRoot = await createRoot()
    await writeSnapshot(invalidRoot, { ...createSnapshotFile(), lockfileHash: 'not-a-hash' })
    await writeSnapshot(driftRoot, createSnapshotFile({
      candidateIdentity: {
        ...candidateIdentity,
        candidateHash: `sha256:${'e'.repeat(64)}`
      }
    }))

    const missing = await readThirdPartyDataPackElectronStartupPersistentStateSnapshot({
      programDirectoryPath: missingRoot,
      request
    })
    const invalid = await readThirdPartyDataPackElectronStartupPersistentStateSnapshot({
      programDirectoryPath: invalidRoot,
      request
    })
    const drift = await readThirdPartyDataPackElectronStartupPersistentStateSnapshot({
      programDirectoryPath: driftRoot,
      request
    })
    const relativePath = await readThirdPartyDataPackElectronStartupPersistentStateSnapshot({
      programDirectoryPath: 'relative-program-directory',
      request
    })

    expect(missing.report.status).toBe('missing')
    expect(missing.snapshot).toBeNull()
    expect(invalid.report.status).toBe('blocked')
    expect(invalid.report.reason).toBe('electron startup persistent state snapshot file structure is invalid')
    expect(drift.report.status).toBe('blocked')
    expect(drift.report.reason).toBe(
      'electron startup persistent state snapshot does not match the startup request identity or required proofs'
    )
    expect(relativePath.report.status).toBe('failed')
    for (const current of [missing, invalid, drift, relativePath]) {
      expect(current.snapshot).toBeNull()
      expectNoPersistentWrites(current.report.effects)
      const serialized = JSON.stringify(current)
      expect(serialized).not.toContain(missingRoot)
      expect(serialized).not.toContain(invalidRoot)
      expect(serialized).not.toContain(driftRoot)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expectJsonGraphFrozen(current)
    }
  })

  it('blocks settings and mod-lock state drift after the startup snapshot is present', async() => {
    const settingsDriftRoot = await createRoot()
    await writeSnapshot(settingsDriftRoot)
    await writeSettingsAndModLock(settingsDriftRoot, {
      settingsOverrides: {
        lockfileHash: `sha256:${'f'.repeat(64)}`
      }
    })

    const { lockfileHash: _lockfileHash, ...modLockBody } = modLockDraft
    const driftedModLockBody = {
      ...modLockBody,
      candidateIdentity: {
        ...candidateIdentity,
        candidateHash: `sha256:${'e'.repeat(64)}` as Sha256Hash
      }
    }
    const modLockDriftRoot = await createRoot()
    await writeSnapshot(modLockDriftRoot)
    await writeSettingsAndModLock(modLockDriftRoot, {
      modLock: {
        ...driftedModLockBody,
        lockfileHash: hashCanonicalJson(driftedModLockBody) as Sha256Hash
      }
    })

    const settingsDrift = await readThirdPartyDataPackElectronStartupPersistentStateSnapshot({
      programDirectoryPath: settingsDriftRoot,
      request
    })
    const modLockDrift = await readThirdPartyDataPackElectronStartupPersistentStateSnapshot({
      programDirectoryPath: modLockDriftRoot,
      request
    })

    expect(settingsDrift.report.status).toBe('blocked')
    expect(settingsDrift.report.reason)
      .toBe('electron startup settings state does not match the startup request identity')
    expect(settingsDrift.report.effects.startupPersistentStateSnapshotRead).toBe(true)
    expect(settingsDrift.report.effects.settingsStateRead).toBe(true)
    expect(settingsDrift.report.effects.modLockStateRead).toBe(false)
    expect(settingsDrift.snapshot).toBeNull()
    expect(modLockDrift.report.status).toBe('blocked')
    expect(modLockDrift.report.reason)
      .toBe('electron startup mod-lock state does not match the startup request identity')
    expect(modLockDrift.report.effects.startupPersistentStateSnapshotRead).toBe(true)
    expect(modLockDrift.report.effects.settingsStateRead).toBe(true)
    expect(modLockDrift.report.effects.modLockStateRead).toBe(true)
    expect(modLockDrift.snapshot).toBeNull()
    for (const current of [settingsDrift, modLockDrift]) {
      expectNoPersistentWrites(current.report.effects)
      const serialized = JSON.stringify(current)
      expect(serialized).not.toContain(settingsDriftRoot)
      expect(serialized).not.toContain(modLockDriftRoot)
      expect(serialized).not.toContain('C:/Users')
      expectJsonGraphFrozen(current)
    }
  })

  it('blocks oversize files and host read errors as path-free startup-source failures', async() => {
    const oversizeRoot = await createRoot()
    const readErrorRoot = await createRoot()
    await writeSnapshot(oversizeRoot)
    await writeSnapshot(readErrorRoot)

    const oversize = await readThirdPartyDataPackElectronStartupPersistentStateSnapshot({
      programDirectoryPath: oversizeRoot,
      request,
      fileSystem: {
        stat: async() => ({
          size: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_MAX_BYTES + 1
        })
      }
    })
    const readError = await readThirdPartyDataPackElectronStartupPersistentStateSnapshot({
      programDirectoryPath: readErrorRoot,
      request,
      fileSystem: {
        readFile: async() => {
          throw new Error('EACCES: C:/Users/LENOVO/mods/startup-state-source')
        }
      }
    })
    const host = createThirdPartyDataPackElectronStartupPersistentStateSourceHost({
      programDirectoryPath: readErrorRoot,
      fileSystem: {
        readFile: async() => {
          throw new Error('EACCES: C:/Users/LENOVO/mods/startup-state-source-host')
        }
      }
    })

    await expect(host.read(request)).rejects.toThrow(
      'electron startup persistent state snapshot file could not be read'
    )
    expect(oversize.report.status).toBe('blocked')
    expect(oversize.report.snapshotFileSizeBytes)
      .toBe(THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_MAX_BYTES + 1)
    expect(readError.report.status).toBe('failed')
    expect(readError.report.reason).toBe('electron startup persistent state snapshot file could not be read')
    for (const current of [oversize, readError]) {
      expect(current.snapshot).toBeNull()
      expectNoPersistentWrites(current.report.effects)
      const serialized = JSON.stringify(current)
      expect(serialized).not.toContain(oversizeRoot)
      expect(serialized).not.toContain(readErrorRoot)
      expect(serialized).not.toContain('C:/Users')
      expect(serialized).not.toContain('LENOVO')
      expect(serialized).not.toContain('startup-state-source')
      expectJsonGraphFrozen(current)
    }
  })
})
