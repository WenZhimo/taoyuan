/// <reference types="node" />

import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createElectronThirdPartyDataPackModLockStorageProbe,
  resolveElectronThirdPartyDataPackModLockProgramDirectoryPath,
  type ElectronThirdPartyDataPackModLockPathHost,
  type ElectronThirdPartyDataPackModLockStorageProbeEffects
} from '@/domain/mods/electronModLockStorageProbe'
import {
  getThirdPartyDataPackModLockFilePaths,
  THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME,
  writeThirdPartyDataPackModLockFile
} from '@/domain/mods/thirdPartyDataPackModLockFile'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { ContentId, PackageId, RegistryTypeId } from '@/domain/mods/ids'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import {
  THIRD_PARTY_DATA_PACK_MOD_LOCK_STORAGE_KIND,
  THIRD_PARTY_DATA_PACK_MOD_LOCK_USERDATA_DIRECTORY_NAME
} from '@/domain/mods/thirdPartyDataPackModLockStorage'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-electron-mod-lock-probe-'))
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

const createHost = (
  options: {
    readonly programDirectoryPath: string
    readonly configuredUserDataPath?: string
    readonly portableExecutableDirectory?: string | null
    readonly isPackaged?: boolean
  }
): ElectronThirdPartyDataPackModLockPathHost => ({
  isPackaged: options.isPackaged ?? true,
  executablePath: path.join(options.programDirectoryPath, 'taoyuan.exe'),
  portableExecutableDirectory: options.portableExecutableDirectory,
  configuredUserDataPath: options.configuredUserDataPath
})

const expectNoRuntimeEffects = (
  effects: ElectronThirdPartyDataPackModLockStorageProbeEffects
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
    transactionLogWritten: false,
    electronMainProcessBoundaryInspected: true,
    configuredUserDataPathUsed: false,
    systemUserDataFallbackAllowed: false,
    desktopStartupChanged: false
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

describe('electron main-process mod-lock storage path probe', () => {
  it('resolves packaged executable directory userdata without using configured system userData', async() => {
    const root = await createRoot()
    const programDirectoryPath = path.join(root, 'pkg', 'win-unpacked')
    const systemUserDataPath = path.join(root, 'system-user-data')
    const host = createHost({ programDirectoryPath, configuredUserDataPath: systemUserDataPath })
    const resolution = resolveElectronThirdPartyDataPackModLockProgramDirectoryPath(host)
    const probe = createElectronThirdPartyDataPackModLockStorageProbe({ host })

    const report = await probe.inspect()

    expect(resolution).toEqual({
      programDirectoryPath,
      programDirectorySource: 'executable-path-directory',
      configuredUserDataPath: systemUserDataPath
    })
    expect(report).toMatchObject({
      status: 'ready',
      operation: 'inspect',
      storageKind: THIRD_PARTY_DATA_PACK_MOD_LOCK_STORAGE_KIND,
      programDirectorySource: 'executable-path-directory',
      configuredUserDataPath: systemUserDataPath,
      paths: {
        programDirectoryPath,
        userDataPath: path.join(programDirectoryPath, THIRD_PARTY_DATA_PACK_MOD_LOCK_USERDATA_DIRECTORY_NAME),
        filePath: path.join(programDirectoryPath, THIRD_PARTY_DATA_PACK_MOD_LOCK_USERDATA_DIRECTORY_NAME, 'mod-lock.json')
      }
    })
    expectNoRuntimeEffects(report.effects)
    expect(report.effects.lockfileWritten).toBe(false)
    await expect(stat(path.join(programDirectoryPath, 'userdata'))).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(stat(systemUserDataPath)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('uses PORTABLE_EXECUTABLE_DIR style overrides before process executable dirname', async() => {
    const root = await createRoot()
    const defaultProgramDirectoryPath = path.join(root, 'default', 'win-unpacked')
    const portableProgramDirectoryPath = path.join(root, 'portable', 'win-unpacked')
    const host = createHost({
      programDirectoryPath: defaultProgramDirectoryPath,
      portableExecutableDirectory: portableProgramDirectoryPath
    })
    const probe = createElectronThirdPartyDataPackModLockStorageProbe({ host })

    const report = await probe.inspect()

    expect(report).toMatchObject({
      status: 'ready',
      programDirectorySource: 'portable-executable-directory',
      paths: {
        programDirectoryPath: portableProgramDirectoryPath,
        userDataPath: path.join(portableProgramDirectoryPath, 'userdata'),
        filePath: path.join(portableProgramDirectoryPath, 'userdata', 'mod-lock.json')
      }
    })
    expectNoRuntimeEffects(report.effects)
    await expect(stat(path.join(defaultProgramDirectoryPath, 'userdata'))).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(stat(path.join(portableProgramDirectoryPath, 'userdata'))).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('does not fall back to app.getPath("userData") when program-directory lockfile is missing', async() => {
    const root = await createRoot()
    const programDirectoryPath = path.join(root, 'pkg', 'win-unpacked')
    const systemUserDataPath = path.join(root, 'system-user-data')
    const systemPaths = getThirdPartyDataPackModLockFilePaths(systemUserDataPath)
    const systemDraft = createDraft({ packageId: 'system_pack' as PackageId })
    await writeThirdPartyDataPackModLockFile(systemPaths, systemDraft)
    const systemBytes = await readFile(systemPaths.filePath, 'utf8')
    const probe = createElectronThirdPartyDataPackModLockStorageProbe({
      host: createHost({ programDirectoryPath, configuredUserDataPath: systemUserDataPath })
    })

    const read = await probe.read()

    expect(read.draft).toBeNull()
    expect(read.report).toMatchObject({
      status: 'missing',
      programDirectorySource: 'executable-path-directory',
      configuredUserDataPath: systemUserDataPath,
      paths: {
        programDirectoryPath,
        userDataPath: path.join(programDirectoryPath, 'userdata'),
        filePath: path.join(programDirectoryPath, 'userdata', 'mod-lock.json')
      }
    })
    expectNoRuntimeEffects(read.report.effects)
    expect(await readFile(systemPaths.filePath, 'utf8')).toBe(systemBytes)
    await expect(stat(path.join(programDirectoryPath, 'userdata'))).rejects.toMatchObject({ code: 'ENOENT' })
  }, 30_000)

  it('writes and reads only program-directory userdata while preserving saves, settings, packages and caches', async() => {
    const root = await createRoot()
    const programDirectoryPath = path.join(root, 'pkg', 'win-unpacked')
    const systemUserDataPath = path.join(root, 'system-user-data')
    const userDataPath = path.join(programDirectoryPath, 'userdata')
    const settingsPath = path.join(userDataPath, 'settings.json')
    const savePath = path.join(userDataPath, 'Local Storage', 'leveldb', 'save.ldb')
    const officialCachePath = path.join(userDataPath, 'mod-cache', 'sha256-official', 'official-registry-cache-v2.json')
    const packagePath = path.join(programDirectoryPath, 'mods', 'sample-pack', 'manifest.json')
    const transactionLogPath = path.join(userDataPath, 'mod-transactions', 'pending.json')
    const systemSettingsPath = path.join(systemUserDataPath, 'settings.json')
    await mkdir(path.dirname(savePath), { recursive: true })
    await mkdir(path.dirname(officialCachePath), { recursive: true })
    await mkdir(path.dirname(packagePath), { recursive: true })
    await mkdir(path.dirname(transactionLogPath), { recursive: true })
    await mkdir(systemUserDataPath, { recursive: true })
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    await writeFile(officialCachePath, 'official-cache-data', 'utf8')
    await writeFile(packagePath, '{"id":"sample_pack"}\n', 'utf8')
    await writeFile(transactionLogPath, '{"status":"pending"}\n', 'utf8')
    await writeFile(systemSettingsPath, '{"closeToTray":true}\n', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const officialCacheBefore = await readFile(officialCachePath, 'utf8')
    const packageBefore = await readFile(packagePath, 'utf8')
    const transactionLogBefore = await readFile(transactionLogPath, 'utf8')
    const systemSettingsBefore = await readFile(systemSettingsPath, 'utf8')
    const draft = createDraft()
    const probe = createElectronThirdPartyDataPackModLockStorageProbe({
      host: createHost({ programDirectoryPath, configuredUserDataPath: systemUserDataPath })
    })

    const write = await probe.write(draft)
    const read = await probe.read()

    expect(write.report).toMatchObject({
      status: 'written',
      operation: 'write',
      paths: {
        programDirectoryPath,
        userDataPath,
        filePath: path.join(userDataPath, THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME)
      }
    })
    expect(write.report.effects.lockfileWritten).toBe(true)
    expectNoRuntimeEffects(write.report.effects)
    expect(read.report.status).toBe('loaded')
    expect(read.draft).toEqual(draft)
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(officialCachePath, 'utf8')).toBe(officialCacheBefore)
    expect(await readFile(packagePath, 'utf8')).toBe(packageBefore)
    expect(await readFile(transactionLogPath, 'utf8')).toBe(transactionLogBefore)
    expect(await readFile(systemSettingsPath, 'utf8')).toBe(systemSettingsBefore)
    expectOfficialBaseline()
  }, 30_000)

  it('reports unavailable paths and failed writes without creating unrelated userdata', async() => {
    const root = await createRoot()
    const programDirectoryPath = path.join(root, 'pkg', 'win-unpacked')
    const nonPackaged = createElectronThirdPartyDataPackModLockStorageProbe({
      host: createHost({ programDirectoryPath, isPackaged: false })
    })
    const invalidOverride = createElectronThirdPartyDataPackModLockStorageProbe({
      host: createHost({
        programDirectoryPath,
        portableExecutableDirectory: 'relative-portable-dir'
      })
    })

    const nonPackagedReport = await nonPackaged.inspect()
    const invalidOverrideReport = await invalidOverride.inspect()

    expect(nonPackagedReport).toMatchObject({
      status: 'failed',
      operation: 'inspect'
    })
    expect(invalidOverrideReport).toMatchObject({
      status: 'failed',
      operation: 'inspect'
    })
    expect(nonPackagedReport.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'LIFECYCLE-TRANSACTION-001' })
    ]))
    expectNoRuntimeEffects(nonPackagedReport.effects)
    await expect(stat(path.join(programDirectoryPath, 'userdata'))).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('preserves the previous valid lockfile when probe writes are interrupted or replacement fails', async() => {
    const root = await createRoot()
    const programDirectoryPath = path.join(root, 'pkg', 'win-unpacked')
    const host = createHost({ programDirectoryPath })
    const oldDraft = createDraft()
    const newDraft = createDraft({ candidateHash: sha('8') })
    const probe = createElectronThirdPartyDataPackModLockStorageProbe({ host })
    const paths = getThirdPartyDataPackModLockFilePaths(path.join(programDirectoryPath, 'userdata'))
    await probe.write(oldDraft)
    const oldBytes = await readFile(paths.filePath, 'utf8')

    const interrupted = await createElectronThirdPartyDataPackModLockStorageProbe({
      host,
      fileOptions: { beforeReplace: () => { throw new Error('simulated interruption') } }
    }).write(newDraft)
    const failedReplace = await createElectronThirdPartyDataPackModLockStorageProbe({
      host,
      fileOptions: { fileSystem: { rename: async() => { throw new Error('simulated replace failure') } } }
    }).write(newDraft)
    const read = await probe.read()

    expect(interrupted.report.status).toBe('failed')
    expect(interrupted.report.effects.lockfileWritten).toBe(false)
    expect(failedReplace.report.status).toBe('failed')
    expect(failedReplace.report.effects.lockfileWritten).toBe(false)
    expect(read.draft).toEqual(oldDraft)
    expect(await readFile(paths.filePath, 'utf8')).toBe(oldBytes)
    expect(await readTemporaryNames(paths.directory)).toEqual([])
  }, 30_000)
})
