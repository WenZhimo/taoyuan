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
  createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline,
  type ThirdPartyDataPackInstallTransactionCommitFinalizationResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionCommitFinalizationPipeline'
import {
  createThirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline,
  createThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter,
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
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-install-transaction-finalization-'))
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
    transactionId: 'install-transaction-commit-finalization-test',
    createdAtIso: '2026-08-18T00:00:00.000Z'
  })
  return pipeline()
}

const verifyPreparedRead = async(
  root: string
): Promise<ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult> => {
  const prepared = await prepareTransactionLog(root)
  const pipeline = createThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline({
    enabled: true,
    allowPersistentTransactionLogReadVerification: true,
    readInstallTransactionLogPreparedPipeline: async() => prepared,
    programDirectoryPath: root
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

const expectFinalizationBoundary = (
  result: ThirdPartyDataPackInstallTransactionCommitFinalizationResult,
  committed: boolean
): void => {
  expect(result.readOnly).toBe(true)
  expect(result.effects.transactionCommitted).toBe(committed)
  expect(result.effects.transactionLogCommitted).toBe(committed)
  expect(result.effects.runtimePublicationCommitted).toBe(false)
  expect(result.effects.postCommitVerificationExecuted).toBe(false)
  expect(result.effects.uiIpcResponseDelivered).toBe(false)
  expect(result.effects.transactionLogPrepared).toBe(true)
  expect(result.effects.transactionLogWritten).toBe(true)
  expect(result.effects.transactionLogRead).toBe(true)
  expect(result.effects.packageStateRead).toBe(false)
  expect(result.effects.settingsRead).toBe(false)
  expect(result.effects.lockfileRead).toBe(false)
  expect(result.effects.liveRegistryRead).toBe(false)
  expect(result.effects.savesWritten).toBe(false)
  expect(result.effects.cacheWritten).toBe(false)
  expect(result.effects.rollbackExecuted).toBe(false)
}

describe('third-party install transaction commit finalization pipeline', () => {
  it('is disabled by default and does not read the prepared verification source', async() => {
    const readPreparedTransactionLogVerification = vi.fn()
    const pipeline = createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline({
      readPreparedTransactionLogVerification
    })

    const result = await pipeline()

    expect(result.status).toBe('skipped')
    expect(result.enabled).toBe(false)
    expect(result.sourceCalled).toBe(false)
    expect(readPreparedTransactionLogVerification).not.toHaveBeenCalled()
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.transactionLogCommitted).toBe(false)
    expectJsonGraphFrozen(result)
  })

  it('defers verified prepared readback until commit finalization is explicitly authorized', async() => {
    const root = await createRoot()
    const verified = await verifyPreparedRead(root)
    const pipeline = createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline({
      enabled: true,
      readPreparedTransactionLogVerification: async() => verified
    })

    const result = await pipeline()

    expect(result.status).toBe('deferred')
    expect(result.preparedReadVerificationStatus).toBe('verified')
    expect(result.transactionLogEntryHash).toBe(verified.transactionLogEntryHash)
    expect(result.committedTransactionId).toBeUndefined()
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'explicit-commit-finalization-authorized',
        status: 'skipped'
      })
    ]))
    expectFinalizationBoundary(result, false)
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('emits a path-free committed acknowledgement without touching package, settings, save or cache files', async() => {
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
    const verified = await verifyPreparedRead(root)
    const pipeline = createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline({
      enabled: true,
      allowInstallTransactionCommitFinalization: true,
      readPreparedTransactionLogVerification: async() => verified
    })

    const result = await pipeline()

    expect(result.status).toBe('committed')
    expect(result.targetPackageId).toBe(packageId)
    expect(result.transactionId).toBe('install-transaction-commit-finalization-test')
    expect(result.committedTransactionId).toBe(result.transactionId)
    expect(result.committedTransactionLogEntryHash).toBe(verified.transactionLogEntryHash)
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
    expectFinalizationBoundary(result, true)
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('blocks unsafe prepared readback drift before finalization', async() => {
    const root = await createRoot()
    const verified = await verifyPreparedRead(root)
    const unsafeReadback = {
      ...verified,
      effects: {
        ...verified.effects,
        runtimePublicationCommitted: true
      }
    } as unknown as ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
    const pipeline = createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline({
      enabled: true,
      allowInstallTransactionCommitFinalization: true,
      readPreparedTransactionLogVerification: async() => unsafeReadback
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.committedTransactionId).toBeUndefined()
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'contained-read-effects',
        status: 'blocked'
      })
    ]))
    expect(result.effects.transactionCommitted).toBe(false)
    expect(result.effects.runtimePublicationCommitted).toBe(false)
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('blocks path-bearing prepared readback evidence and redacts the committed result', async() => {
    const root = await createRoot()
    const verified = await verifyPreparedRead(root)
    const unsafeReadback = {
      ...verified,
      programDirectoryPath: root
    } as unknown as ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
    const pipeline = createThirdPartyDataPackInstallTransactionCommitFinalizationPipeline({
      enabled: true,
      allowInstallTransactionCommitFinalization: true,
      readPreparedTransactionLogVerification: async() => unsafeReadback
    })

    const result = await pipeline()

    expect(result.status).toBe('blocked')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'contained-read-effects',
        status: 'blocked'
      })
    ]))
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain(root)
    expect(serialized).not.toContain('programDirectoryPath')
    expect(serialized).not.toContain('Local Storage')
    expectFinalizationBoundary(result, false)
    expectJsonGraphFrozen(result)
  }, 30_000)
})
