/// <reference types="node" />

import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createDiagnostic } from '@/domain/mods/diagnostics'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { ContentId, PackageId, RegistryTypeId } from '@/domain/mods/ids'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import {
  createThirdPartyDataPackTransactionLogWriteProbeEntry,
  createThirdPartyDataPackTransactionLogWriteProbeStorageAdapter,
  parseThirdPartyDataPackTransactionLogWriteProbeText,
  resolveThirdPartyDataPackTransactionLogWriteProbeStoragePaths,
  THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_FILE_NAME,
  runThirdPartyDataPackTransactionLogWriteProbe,
  type ThirdPartyDataPackTransactionLogWriteProbeResult,
  type ThirdPartyDataPackTransactionLogWriteProbeStorageAdapter
} from '@/domain/mods/thirdPartyDataPackTransactionLogWriteProbe'
import type {
  ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
} from '@/domain/mods/thirdPartyDataPackRecoveryLogReplayRestoreAdapter'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-transaction-log-write-probe-'))
  roots.push(root)
  return root
}

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId

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

const createDraft = (
  options: {
    readonly currentPackageId?: PackageId
    readonly itemId?: ContentId
    readonly candidateHash?: Sha256Hash
  } = {}
): ThirdPartyDataPackLockfileDraft => {
  const currentPackageId = options.currentPackageId ?? packageId
  const itemId = options.itemId ?? `${currentPackageId}:linen_ribbon` as ContentId
  const currentCandidateIdentity = {
    ...candidateIdentity,
    candidateHash: options.candidateHash ?? candidateIdentity.candidateHash
  }
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

const replayRestoreEffects = {
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
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
} as const

const createReplayRestore = (
  draft: ThirdPartyDataPackLockfileDraft,
  overrides: Partial<ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult> = {}
): ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult => ({
  status: 'deferred',
  publicationRollbackRecoveryStatus: 'deferred',
  runtimePublicationCommitAdapterStatus: 'deferred',
  reason: 'recovery log replay and restore adapter is inspect-only until verified log reader, idempotent replay and persistent restore adapters exist',
  diagnostics: [],
  selectedPackageIds: [...draft.selectedPackageIds],
  blockedPackageIds: [],
  blockedCandidatePaths: [],
  loadOrder: [...draft.loadOrder],
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  packageCount: draft.packages.length,
  officialIdentity,
  candidateIdentity: draft.candidateIdentity,
  lockfileHash: draft.lockfileHash,
  recoveryLogReplayRestore: 'deferred',
  recoveryLogReplayAllowed: false,
  persistentRestoreAllowed: false,
  writeAllowed: false,
  liveRegistryMutable: false,
  rollbackExecutionAllowed: false,
  replayRestoreChecks: [],
  replayRestoreStages: [],
  requiredReplayRestoreAdapters: [],
  effects: replayRestoreEffects,
  ...overrides
})

const createWriteFailingStorage = (): ThirdPartyDataPackTransactionLogWriteProbeStorageAdapter => ({
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

const expectOnlyTransactionLogEffect = (
  result: ThirdPartyDataPackTransactionLogWriteProbeResult,
  transactionLogWritten: boolean
): void => {
  expect(result.effects).toMatchObject({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    liveRegistrySwapped: false,
    previousRegistryRestored: false,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: false,
    electronIpcExposed: false,
    packageFilesWritten: false,
    packageBackupsWritten: false,
    packageFilesRestored: false,
    lockfileWritten: false,
    lockfileRestored: false,
    settingsWritten: false,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    recoveryLogRead: false,
    recoveryLogReplayed: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })
  expect(result.effects.transactionLogWritten).toBe(transactionLogWritten)
}

const expectOfficialBaseline = (): void => {
  const registrySet = buildOfficialRegistrySetFromStaticData()
  const snapshot = createSerializableRegistrySnapshot(registrySet)
  expect(registrySet.registryIds()).toHaveLength(54)
  expect(registrySet.registryIds().reduce(
    (total, registryId) => total + registrySet.get(registryId).entries().length,
    0
  )).toBe(4242)
  expect(snapshot.snapshotHash).toBe(committedMetadata.snapshotHash)
}

const readTemporaryNames = async(directory: string): Promise<readonly string[]> =>
  (await readdir(directory))
    .filter(name => name.startsWith(`.${THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_FILE_NAME}.tmp-`))
    .sort()

describe('third-party transaction log write probe adapter', () => {
  it('defers by default without invoking persistent storage', async() => {
    const draft = createDraft()

    const result = await runThirdPartyDataPackTransactionLogWriteProbe({
      recoveryLogReplayRestoreAdapter: createReplayRestore(draft),
      storage: createWriteFailingStorage(),
      draft
    })

    expect(result.status).toBe('deferred')
    expect(result.reason).toBe(
      'transaction log write probe is deferred until an isolated persistent write probe is explicitly authorized'
    )
    expect(result.transactionLogWriteProbe).toBe('deferred')
    expect(result.writeProbeAllowed).toBe(false)
    expect(result.persistentWriteExecuted).toBe(false)
    expect(result.transactionId).toBeUndefined()
    expect(result.transactionLogEntryHash).toBeUndefined()
    expect(result.storageStatus).toBeUndefined()
    expect(result.writeChecks.map(check => ({ id: check.id, status: check.status }))).toEqual([
      { id: 'replay-restore-adapter-deferred', status: 'satisfied' },
      { id: 'candidate-identity-consistent', status: 'satisfied' },
      { id: 'lockfile-hash-consistent', status: 'satisfied' },
      { id: 'draft-package-summary-consistent', status: 'satisfied' },
      { id: 'no-upstream-effects-intact', status: 'satisfied' },
      { id: 'explicit-transaction-log-probe-authorized', status: 'skipped' },
      { id: 'storage-write-contained', status: 'skipped' }
    ])
    expect('draft' in result).toBe(false)
    expect('storageReport' in result).toBe(false)
    expectOnlyTransactionLogEffect(result, false)
    expectJsonGraphFrozen(result)
  })

  it('writes only the injected temporary userdata transaction log when explicitly authorized', async() => {
    const root = await createRoot()
    const userData = path.join(root, 'userdata')
    const settingsPath = path.join(userData, 'settings.json')
    const savePath = path.join(userData, 'Local Storage', 'leveldb', 'save.ldb')
    const officialCachePath = path.join(userData, 'mod-cache', 'sha256-official', 'official-registry-cache-v2.json')
    const packagePath = path.join(root, 'mods', 'sample-pack', 'manifest.json')
    const modLockPath = path.join(userData, 'mod-lock.json')
    const otherTransactionLogPath = path.join(userData, 'mod-transactions', 'existing-recovery.json')
    await mkdir(path.dirname(savePath), { recursive: true })
    await mkdir(path.dirname(officialCachePath), { recursive: true })
    await mkdir(path.dirname(packagePath), { recursive: true })
    await mkdir(path.dirname(otherTransactionLogPath), { recursive: true })
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    await writeFile(officialCachePath, 'official-cache-data', 'utf8')
    await writeFile(packagePath, '{"id":"sample_pack"}\n', 'utf8')
    await writeFile(modLockPath, '{"kind":"previous-lockfile"}\n', 'utf8')
    await writeFile(otherTransactionLogPath, '{"status":"pending"}\n', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const officialCacheBefore = await readFile(officialCachePath, 'utf8')
    const packageBefore = await readFile(packagePath, 'utf8')
    const modLockBefore = await readFile(modLockPath, 'utf8')
    const otherTransactionLogBefore = await readFile(otherTransactionLogPath, 'utf8')
    const draft = createDraft()
    const storage = createThirdPartyDataPackTransactionLogWriteProbeStorageAdapter({ programDirectoryPath: root })

    const result = await runThirdPartyDataPackTransactionLogWriteProbe({
      recoveryLogReplayRestoreAdapter: createReplayRestore(draft),
      storage,
      draft,
      allowPersistentWriteProbe: true,
      transactionId: 'transaction-log-write-probe-test',
      createdAtIso: '2026-08-13T00:00:00.000Z'
    })
    const paths = resolveThirdPartyDataPackTransactionLogWriteProbeStoragePaths(root)
    const transactionLogText = await readFile(paths.filePath, 'utf8')
    const entry = parseThirdPartyDataPackTransactionLogWriteProbeText(transactionLogText)

    expect(result.status).toBe('written')
    expect(result.transactionLogWriteProbe).toBe('written')
    expect(result.writeProbeAllowed).toBe(true)
    expect(result.persistentWriteExecuted).toBe(true)
    expect(result.transactionId).toBe('transaction-log-write-probe-test')
    expect(result.transactionLogEntryHash).toBe(entry.entryHash)
    expect(result.effects.transactionLogWritten).toBe(true)
    expect(result.storageStatus).toBe('written')
    expect(result.storageOperation).toBe('write')
    expect(result.storageReason).toBe(
      'program-directory userdata transaction log write probe was atomically written'
    )
    expect(result.writeChecks.every(check => check.status === 'satisfied')).toBe(true)
    expect(entry).toMatchObject({
      formatVersion: 1,
      kind: 'third-party-data-pack-transaction-log-write-probe',
      transactionId: 'transaction-log-write-probe-test',
      createdAtIso: '2026-08-13T00:00:00.000Z',
      lockfileHash: draft.lockfileHash,
      selectedPackageIds: ['sample_pack'],
      loadOrder: ['sample_pack'],
      registryCount: 55,
      entryCount: 4243,
      packageCount: 1,
      replayRestoreStatus: 'deferred'
    })
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(officialCachePath, 'utf8')).toBe(officialCacheBefore)
    expect(await readFile(packagePath, 'utf8')).toBe(packageBefore)
    expect(await readFile(modLockPath, 'utf8')).toBe(modLockBefore)
    expect(await readFile(otherTransactionLogPath, 'utf8')).toBe(otherTransactionLogBefore)
    expect(JSON.stringify(result)).not.toContain(root)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expectOnlyTransactionLogEffect(result, true)
    expectOfficialBaseline()
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('blocks inconsistent drafts before invoking storage', async() => {
    const draft = createDraft()
    let writeCalled = false
    const storage: ThirdPartyDataPackTransactionLogWriteProbeStorageAdapter = {
      async write() {
        writeCalled = true
        throw new Error('write should not be called')
      }
    }

    const result = await runThirdPartyDataPackTransactionLogWriteProbe({
      recoveryLogReplayRestoreAdapter: createReplayRestore(draft, {
        lockfileHash: sha('9')
      }),
      storage,
      draft,
      allowPersistentWriteProbe: true
    })

    expect(result.status).toBe('blocked')
    expect(writeCalled).toBe(false)
    expect(result.reason).toBe('transaction log write probe inputs are inconsistent')
    expect(result.writeChecks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'lockfile-hash-consistent',
        status: 'blocked'
      })
    ]))
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'LIFECYCLE-TRANSACTION-001',
        stage: 'third-party.transaction-log-write-probe.checks',
        fieldPath: '/writeChecks/lockfile-hash-consistent'
      })
    ]))
    expectOnlyTransactionLogEffect(result, false)
    expectJsonGraphFrozen(result)
  })

  it('reports failed writes while preserving the previous transaction log and temporary files', async() => {
    const root = await createRoot()
    const oldDraft = createDraft()
    const newDraft = createDraft({ candidateHash: sha('8') })
    const oldReplayRestore = createReplayRestore(oldDraft)
    const healthyStorage = createThirdPartyDataPackTransactionLogWriteProbeStorageAdapter({
      programDirectoryPath: root
    })
    await healthyStorage.write(createThirdPartyDataPackTransactionLogWriteProbeEntry(
      oldReplayRestore,
      oldDraft,
      {
        transactionId: 'previous-transaction-log-write-probe',
        createdAtIso: '2026-08-13T00:00:00.000Z'
      }
    ))
    const paths = resolveThirdPartyDataPackTransactionLogWriteProbeStoragePaths(root)
    const oldBytes = await readFile(paths.filePath, 'utf8')
    const failingStorage = createThirdPartyDataPackTransactionLogWriteProbeStorageAdapter({
      programDirectoryPath: root,
      fileOptions: { beforeReplace: () => { throw new Error('simulated transaction log write probe interruption') } }
    })

    const result = await runThirdPartyDataPackTransactionLogWriteProbe({
      recoveryLogReplayRestoreAdapter: createReplayRestore(newDraft),
      storage: failingStorage,
      draft: newDraft,
      allowPersistentWriteProbe: true,
      transactionId: 'failed-transaction-log-write-probe',
      createdAtIso: '2026-08-13T00:00:01.000Z'
    })

    expect(result.status).toBe('failed')
    expect(result.storageStatus).toBe('failed')
    expect(result.effects.transactionLogWritten).toBe(false)
    expect(result.writeChecks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'storage-write-contained',
        status: 'blocked'
      })
    ]))
    expect(await readFile(paths.filePath, 'utf8')).toBe(oldBytes)
    expect(await readTemporaryNames(paths.transactionLogDirectoryPath)).toEqual([])
    expectOnlyTransactionLogEffect(result, false)
    expectJsonGraphFrozen(result)
  }, 30_000)

  it('copies package summaries and diagnostics before exposing reports', async() => {
    const draft = createDraft()
    let lengthRead = false
    const createHostileArray = <T>(values: T[], label: string): T[] =>
      new Proxy(values, {
        get(target, property, receiver) {
          if (property === 'length') {
            lengthRead = true
            throw new Error(`EACCES: stat C:/Users/LENOVO/mods/transaction-log-write-probe-${label}`)
          }
          return Reflect.get(target, property, receiver)
        }
      }) as T[]
    const diagnostic = createDiagnostic('CACHE-INVALID-001', {
      stage: 'third-party.transaction-log-write-probe.proxy-test',
      severity: 'warning',
      packageId,
      relatedPackageIds: createHostileArray([packageId], 'related-package-ids'),
      details: {
        reason: 'proxy diagnostic',
        list: createHostileArray(['first', { stable: true }], 'details-list') as never
      }
    })
    const selectedPackageIds = createHostileArray([packageId], 'selected-package-ids')
    const blockedPackageIds = createHostileArray([blockedPackageId], 'blocked-package-ids')
    const blockedCandidatePaths = createHostileArray(['blocked-pack'], 'blocked-candidate-paths')
    const loadOrder = createHostileArray([packageId], 'load-order')

    const result = await runThirdPartyDataPackTransactionLogWriteProbe({
      recoveryLogReplayRestoreAdapter: createReplayRestore(draft, {
        diagnostics: [diagnostic],
        selectedPackageIds,
        blockedPackageIds,
        blockedCandidatePaths,
        loadOrder
      }),
      storage: createWriteFailingStorage(),
      draft
    })

    expect(result.status).toBe('deferred')
    expect(lengthRead).toBe(false)
    expect(result.selectedPackageIds).toEqual(['sample_pack'])
    expect(result.blockedPackageIds).toEqual(['blocked_pack'])
    expect(result.blockedCandidatePaths).toEqual(['blocked-pack'])
    expect(result.loadOrder).toEqual(['sample_pack'])
    expect(result.diagnostics[0]).toMatchObject({
      code: 'CACHE-INVALID-001',
      stage: 'third-party.transaction-log-write-probe.proxy-test',
      relatedPackageIds: ['sample_pack'],
      details: {
        reason: 'proxy diagnostic',
        list: ['first', { stable: true }]
      }
    })
    expect(Object.is(result.selectedPackageIds, selectedPackageIds)).toBe(false)
    expect(Object.is(result.blockedPackageIds, blockedPackageIds)).toBe(false)
    expect(Object.is(result.blockedCandidatePaths, blockedCandidatePaths)).toBe(false)
    expect(Object.is(result.loadOrder, loadOrder)).toBe(false)
    expect(Object.is(result.diagnostics[0], diagnostic)).toBe(false)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('transaction-log-write-probe-selected-package-ids')
    expectOnlyTransactionLogEffect(result, false)
    expectJsonGraphFrozen(result)
  })
})
