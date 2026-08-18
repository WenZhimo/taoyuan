/// <reference types="node" />

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
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
  parseThirdPartyDataPackInstallTransactionLogPreparedText,
  resolveThirdPartyDataPackInstallTransactionLogPreparedStoragePaths,
  type ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource'

const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-install-transaction-log-prepared-'))
  roots.push(root)
  return root
}

const packageId = 'sample_pack' as PackageId
const otherPackageId = 'other_pack' as PackageId
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

const expectJsonGraphFrozen = (value: unknown, path = '$'): void => {
  if (value && typeof value === 'object') {
    expect(Object.isFrozen(value), path).toBe(true)
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      expectJsonGraphFrozen(child, `${path}.${key}`)
    }
  }
}

const expectBoundary = (
  result: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult,
  prepared: boolean,
  priorWrites = prepared
): void => {
  expect(result.effects.transactionLogPrepared).toBe(prepared)
  expect(result.effects.transactionLogWritten).toBe(prepared)
  expect(result.effects.transactionCommitted).toBe(false)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.packageFilesWritten).toBe(priorWrites)
  expect(result.effects.settingsWritten).toBe(priorWrites)
  expect(result.effects.lockfileWritten).toBe(priorWrites)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party install transaction log prepared commit host connection pipeline', () => {
  it('is disabled by default and does not read transaction connection or storage', async() => {
    const readTransactionCommitConnectionSource = vi.fn()
    const storage = {
      write: vi.fn()
    }
    const pipeline = createThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline({
      readTransactionCommitConnectionSource,
      storage
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(result.readOnly).toBe(true)
    expect(readTransactionCommitConnectionSource).not.toHaveBeenCalled()
    expect(storage.write).not.toHaveBeenCalled()
    expect(result.registryCount).toBe(54)
    expect(result.entryCount).toBe(4242)
    expect(result.effects.transactionLogPrepared).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('defers after an accepted connection until transaction-log prepare is explicitly authorized', async() => {
    const storage = {
      write: vi.fn()
    }
    const pipeline = createThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline({
      enabled: true,
      readTransactionCommitConnectionSource: async() => createConnection(),
      storage
    })

    const result = await pipeline()

    expect(result.status).toBe('deferred')
    expect(result.transactionCommitConnectionSourceStatus).toBe('accepted')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.candidateIdentity?.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(result.lockfileHash).toBe(lockfileHash)
    expect(storage.write).not.toHaveBeenCalled()
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'explicit-transaction-log-prepare-authorized',
        status: 'skipped'
      }),
      expect.objectContaining({
        id: 'storage-write-contained',
        status: 'skipped'
      })
    ]))
    expectBoundary(result, false, true)
    expectJsonGraphFrozen(result)
  })

  it('writes only the injected temporary userdata prepared transaction log when authorized', async() => {
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
    const storage = createThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter({
      programDirectoryPath: root
    })
    const pipeline = createThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline({
      enabled: true,
      allowPersistentTransactionLogPrepare: true,
      readTransactionCommitConnectionSource: async() => createConnection(),
      storage,
      transactionId: 'install-transaction-prepared-test',
      createdAtIso: '2026-08-18T00:00:00.000Z'
    })

    const result = await pipeline()
    const paths = resolveThirdPartyDataPackInstallTransactionLogPreparedStoragePaths(root)
    const entry = parseThirdPartyDataPackInstallTransactionLogPreparedText(await readFile(paths.filePath, 'utf8'))

    expect(result.status).toBe('prepared')
    expect(result.readOnly).toBe(false)
    expect(result.transactionId).toBe('install-transaction-prepared-test')
    expect(result.transactionLogEntryHash).toBe(entry.entryHash)
    expect(result.storageStatus).toBe('written')
    expect(result.storageOperation).toBe('prepare-install-transaction')
    expect(result.storageReason).toBe(
      'program-directory userdata install transaction log prepared entry was atomically written'
    )
    expect(result.checks.every(check => check.status === 'satisfied')).toBe(true)
    expect(entry).toMatchObject({
      formatVersion: 1,
      kind: 'third-party-data-pack-install-transaction-log-prepared',
      transactionId: 'install-transaction-prepared-test',
      operation: 'prepare-install-transaction',
      createdAtIso: '2026-08-18T00:00:00.000Z',
      requestedCommandId: 'install',
      targetPackageId: 'sample_pack',
      selectedPackageIds: ['sample_pack'],
      blockedPackageIds: [],
      loadOrder: ['sample_pack'],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      lockfileHash,
      packageFileWriteAcknowledged: true,
      settingsLockfileWriteAcknowledged: true,
      transactionCommitConnectionAcknowledged: true
    })
    expect(entry.candidateIdentity.candidateHash).toBe(candidateIdentity.candidateHash)
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(modLockPath, 'utf8')).toBe(modLockBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(cachePath, 'utf8')).toBe(cacheBefore)
    expect(await readFile(packagePath, 'utf8')).toBe(packageBefore)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain(root)
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('C:/Users')
    expectBoundary(result, true)
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('blocks unsafe connection drift before writing a prepared transaction log', async() => {
    const storage = {
      write: vi.fn()
    }
    const pipeline = createThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline({
      enabled: true,
      allowPersistentTransactionLogPrepare: true,
      readTransactionCommitConnectionSource: async() => createConnection({
        targetPackageId: otherPackageId,
        transactionCommitConnectionAcknowledged: false,
        persistentPackageWriteExecuted: false,
        persistentSettingsLockfileWriteExecuted: false,
        effects: connectionEffects({
          transactionCommitted: true,
          packageFilesWritten: false,
          settingsWritten: false,
          lockfileWritten: false
        } as never)
      }),
      storage
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(storage.write).not.toHaveBeenCalled()
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'transaction-commit-connection-accepted',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'contained-writes-present',
        status: 'blocked'
      }),
      expect.objectContaining({
        id: 'no-upstream-commit-or-read-effects',
        status: 'blocked'
      })
    ]))
    expect(result.effects.transactionLogPrepared).toBe(false)
    expect(result.effects.transactionLogWritten).toBe(false)
    expect(result.effects.transactionCommitted).toBe(false)
    expectJsonGraphFrozen(result)
  })
})
