/// <reference types="node" />

import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline,
  createThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter,
  resolveThirdPartyDataPackInstallTransactionLogPreparedStoragePaths,
  type ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline'
import {
  createThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline,
  type ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource'

const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-install-transaction-log-read-'))
  roots.push(root)
  return root
}

const packageId = 'sample_pack' as PackageId
const sha = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: sha('a'),
  snapshotHash: sha('b'),
  candidateHash: sha('c')
}

const lockfileHash = sha('d')

const connectionEffects = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult['effects']> = {}
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult['effects'] => ({
  installPersistentStagingSettingsLockfileTransactionCommitConnectionSourceCalled: true,
  installPersistentStagingSettingsLockfileLifecyclePipelineCalled: true,
  installTransactionCommitConnectionHostCalled: true,
  installTransactionCommitConnectionHostAccepted: true,
  transactionCommitConnectionAcknowledged: true,
  packageFilePersistentWriteAcknowledged: true,
  installCommandLifecycleAcknowledged: true,
  settingsLockfilePersistentWriterAcknowledged: true,
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

const createConnection = (
  overrides: Partial<ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult> = {}
): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult => ({
  kind: 'third-party-install-persistent-staging-settings-lockfile-transaction-commit-connection-source',
  mode: 'default-disabled-install-persistent-staging-settings-lockfile-transaction-commit-connection-source',
  status: 'accepted',
  reason: 'third-party install persistent staging settings-lockfile transaction commit connection accepted matching contained write acknowledgements',
  readOnly: false,
  enabled: true,
  sourceCalled: true,
  appBootstrapContinuationAllowed: true,
  commandContinuationAllowed: true,
  uiIpcResultContinuationAllowed: true,
  installPersistentStagingSettingsLockfileLifecyclePipelineStatus: 'ready',
  installTransactionCommitConnectionHostStatus: 'accepted',
  requestedCommandId: 'install',
  targetPackageId: packageId,
  selectedPackageIds: [packageId],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [packageId],
  registryCount: 55,
  entryCount: 4243,
  packageCount: 1,
  candidateIdentity,
  candidateHash: candidateIdentity.candidateHash,
  lockfileHash,
  persistentPackageWriteExecuted: true,
  writtenFileCount: 2,
  backedUpFileCount: 1,
  persistentSettingsLockfileWriteExecuted: true,
  transactionCommitConnectionAcknowledged: true,
  checks: [
    {
      id: 'transaction-commit-connection-accepted',
      status: 'satisfied',
      reason: 'accepted'
    }
  ],
  diagnostics: [],
  effects: connectionEffects(),
  ...overrides
} as ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult)

const prepareTransactionLog = async(
  root: string
): Promise<ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult> => {
  const storage = createThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter({
    programDirectoryPath: root
  })
  const pipeline = createThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline({
    enabled: true,
    allowPersistentTransactionLogPrepare: true,
    readTransactionCommitConnectionSource: async() => createConnection(),
    storage,
    transactionId: 'install-transaction-prepared-read-test',
    createdAtIso: '2026-08-18T00:00:00.000Z'
  })
  return pipeline()
}

const expectJsonGraphFrozen = (value: unknown, graphPath = '$'): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value), graphPath).toBe(true)
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      expectJsonGraphFrozen(child, `${graphPath}.${key}`)
    }
  }
}

const expectReadBoundary = (
  result: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult,
  verified: boolean
): void => {
  expect(result.readOnly).toBe(true)
  expect(result.effects.transactionLogReadVerified).toBe(verified)
  expect(result.effects.transactionLogRead).toBe(verified)
  expect(result.effects.transactionLogPrepared).toBe(true)
  expect(result.effects.transactionLogWritten).toBe(true)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.packageStateRead).toBe(false)
  expect(result.effects.settingsRead).toBe(false)
  expect(result.effects.lockfileRead).toBe(false)
  expect(result.effects.liveRegistryRead).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party install transaction log prepared persistent read verification pipeline', () => {
  it('is disabled by default and does not read prepared source or transaction log file', async() => {
    const readInstallTransactionLogPreparedPipeline = vi.fn()
    const readFileSpy = vi.fn()
    const statSpy = vi.fn()
    const pipeline = createThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline({
      readInstallTransactionLogPreparedPipeline,
      programDirectoryPath: 'C:/not-used',
      fileOptions: {
        fileSystem: {
          readFile: readFileSpy as never,
          stat: statSpy as never
        }
      }
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readInstallTransactionLogPreparedPipeline).not.toHaveBeenCalled()
    expect(readFileSpy).not.toHaveBeenCalled()
    expect(statSpy).not.toHaveBeenCalled()
    expect(result.effects.transactionLogRead).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('defers after a prepared acknowledgement until persistent read verification is authorized', async() => {
    const root = await createRoot()
    const prepared = await prepareTransactionLog(root)
    const readFileSpy = vi.fn(readFile)
    const statSpy = vi.fn(stat)
    const pipeline = createThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline({
      enabled: true,
      readInstallTransactionLogPreparedPipeline: async() => prepared,
      programDirectoryPath: root,
      fileOptions: {
        fileSystem: {
          readFile: readFileSpy as never,
          stat: statSpy as never
        }
      }
    })

    const result = await pipeline()

    expect(result.status).toBe('deferred')
    expect(result.preparedPipelineStatus).toBe('prepared')
    expect(result.transactionLogEntryHash).toBe(prepared.transactionLogEntryHash)
    expect(readFileSpy).not.toHaveBeenCalled()
    expect(statSpy).not.toHaveBeenCalled()
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'transaction-log-read-verification-authorized',
        status: 'skipped'
      })
    ]))
    expectReadBoundary(result, false)
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('reads only the injected userdata prepared transaction log and verifies the acknowledgement', async() => {
    const root = await createRoot()
    const userData = path.join(root, 'userdata')
    const settingsPath = path.join(userData, 'settings.json')
    const modLockPath = path.join(userData, 'mod-lock.json')
    const savePath = path.join(userData, 'Local Storage', 'leveldb', 'save.ldb')
    const cachePath = path.join(userData, 'mod-cache', 'sha256-official', 'official-registry-cache-v2.json')
    const packagePath = path.join(root, 'mods', 'sample-pack', 'manifest.json')
    await mkdir(path.dirname(savePath), { recursive: true })
    await mkdir(path.dirname(cachePath), { recursive: true })
    await mkdir(path.dirname(packagePath), { recursive: true })
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(modLockPath, '{"kind":"previous-lockfile"}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    await writeFile(cachePath, 'official-cache-data', 'utf8')
    await writeFile(packagePath, '{"id":"sample_pack"}\n', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const modLockBefore = await readFile(modLockPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const cacheBefore = await readFile(cachePath, 'utf8')
    const packageBefore = await readFile(packagePath, 'utf8')
    const prepared = await prepareTransactionLog(root)
    const pipeline = createThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline({
      enabled: true,
      allowPersistentTransactionLogReadVerification: true,
      readInstallTransactionLogPreparedPipeline: async() => prepared,
      programDirectoryPath: root
    })

    const result = await pipeline()

    expect(result.status).toBe('verified')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.transactionId).toBe('install-transaction-prepared-read-test')
    expect(result.transactionLogEntryHash).toBe(prepared.transactionLogEntryHash)
    expect(result.readTransactionLogEntryHash).toBe(prepared.transactionLogEntryHash)
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(modLockPath, 'utf8')).toBe(modLockBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(cachePath, 'utf8')).toBe(cacheBefore)
    expect(await readFile(packagePath, 'utf8')).toBe(packageBefore)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain(root)
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('Local Storage')
    expectReadBoundary(result, true)
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('fails if the prepared transaction log content no longer matches the acknowledgement', async() => {
    const root = await createRoot()
    const prepared = await prepareTransactionLog(root)
    const paths = resolveThirdPartyDataPackInstallTransactionLogPreparedStoragePaths(root)
    const tampered = (await readFile(paths.filePath, 'utf8')).replace(
      '"targetPackageId": "sample_pack"',
      '"targetPackageId": "other_pack"'
    )
    await writeFile(paths.filePath, tampered, 'utf8')
    const pipeline = createThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline({
      enabled: true,
      allowPersistentTransactionLogReadVerification: true,
      readInstallTransactionLogPreparedPipeline: async() => prepared,
      programDirectoryPath: root
    })

    const result = await pipeline()

    expect(result.status).toBe('failed')
    expect(result.effects.transactionLogRead).toBe(false)
    expect(result.diagnostics.length).toBeGreaterThan(0)
    expect(result.reason).toContain('could not be read')
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('blocks unsafe prepared acknowledgement drift before reading the transaction log file', async() => {
    const root = await createRoot()
    const prepared = await prepareTransactionLog(root)
    const unsafePrepared = {
      ...prepared,
      effects: {
        ...prepared.effects,
        transactionCommitted: true
      }
    } as unknown as ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
    const readFileSpy = vi.fn(readFile)
    const statSpy = vi.fn(stat)
    const pipeline = createThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline({
      enabled: true,
      allowPersistentTransactionLogReadVerification: true,
      readInstallTransactionLogPreparedPipeline: async() => unsafePrepared,
      programDirectoryPath: root,
      fileOptions: {
        fileSystem: {
          readFile: readFileSpy as never,
          stat: statSpy as never
        }
      }
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(readFileSpy).not.toHaveBeenCalled()
    expect(statSpy).not.toHaveBeenCalled()
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'contained-read-effects',
        status: 'blocked'
      })
    ]))
    expect(result.effects.transactionLogRead).toBe(false)
    expect(result.effects.transactionCommitted).toBe(false)
    expectJsonGraphFrozen(result)
  }, 30_000)
})
