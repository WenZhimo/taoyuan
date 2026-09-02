import { describe, expect, it, vi } from 'vitest'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { ContentId, PackageId, RegistryTypeId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackWebStartupPersistentStateSourceHost,
  readThirdPartyDataPackWebStartupPersistentStateSnapshot,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_MAX_BYTES,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE,
  THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_STORAGE_KIND,
  type ThirdPartyDataPackWebStartupPersistentStateSourceHostReport
} from '@/domain/mods/thirdPartyDataPackWebStartupPersistentStateSourceHost'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceRequest
} from '@/domain/mods/thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import type {
  ThirdPartyDataPackLockfileDraft
} from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import {
  createInMemoryWebSettingsLockfilePersistentWriterStore,
  THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID
} from '@/domain/mods/thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
import {
  createDefaultWebIndexedDbImportRecord,
  createInMemoryWebIndexedDbImportPersistenceStore,
  type WebIndexedDbImportPersistenceStore
} from '@/domain/mods/webIndexedDbImportPersistence'

const packageId = 'sample_pack' as PackageId
const testHash = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity = {
  formatVersion: 1,
  contentHash: testHash('a'),
  snapshotHash: testHash('b'),
  candidateHash: testHash('c')
} as const

const createLockfileDraft = (
  options: {
    readonly packageId?: PackageId
    readonly candidateIdentity?: typeof candidateIdentity
  } = {}
): ThirdPartyDataPackLockfileDraft => {
  const selectedPackageId = options.packageId ?? packageId
  const itemId = `${selectedPackageId}:linen_ribbon` as ContentId
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity: {
      artifactHash: testHash('0'),
      contentHash: testHash('1'),
      schemaSetHash: testHash('2'),
      environmentHash: testHash('3'),
      snapshotHash: testHash('4'),
      registryCount: 54,
      entryCount: 4242
    },
    candidateIdentity: options.candidateIdentity ?? candidateIdentity,
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
        manifestHash: testHash('5'),
        contentHash: testHash('6'),
        configurationHash: testHash('7'),
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
                canonicalHash: testHash('8')
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

const modLockDraft = createLockfileDraft()
const lockfileHash = modLockDraft.lockfileHash

const createRequest = (
  overrides: Partial<ThirdPartyDataPackStartupGatePersistentStateSourceRequest> = {}
): ThirdPartyDataPackStartupGatePersistentStateSourceRequest => ({
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
  ],
  ...overrides
})

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createSnapshotFile = (
  overrides: Record<string, unknown> = {}
): Record<string, unknown> => ({
  formatVersion: 1,
  kind: 'web-startup-persistent-state-snapshot',
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

const createStoreWithSnapshot = async(
  text = toJson(createSnapshotFile()),
  sizeBytes = text.length
): Promise<WebIndexedDbImportPersistenceStore> => {
  const store = createInMemoryWebIndexedDbImportPersistenceStore()
  await store.put(createDefaultWebIndexedDbImportRecord([
    {
      path: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
      text,
      sizeBytes
    }
  ], THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID, 'web/indexeddb-startup-state', 'web-startup-state'))
  return store
}

const createSettingsLockfileStore = async(
  draft: ThirdPartyDataPackLockfileDraft = modLockDraft
) => {
  const store = createInMemoryWebSettingsLockfilePersistentWriterStore()
  const targetPackageId = draft.selectedPackageIds[0]!
  await store.write({
    recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
    requestedCommandId: 'install',
    targetPackageId,
    selectedPackageIds: draft.selectedPackageIds,
    blockedPackageIds: [],
    loadOrder: draft.loadOrder,
    candidateHash: draft.candidateIdentity.candidateHash,
    lockfileHash: draft.lockfileHash,
    lockfileDraft: draft
  })
  return store
}

const createRawStoreWithSnapshot = (
  text: string,
  sizeBytes = text.length
): WebIndexedDbImportPersistenceStore => ({
  put: vi.fn(),
  get: vi.fn(async() => ({
    importId: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID,
    sourceId: 'web/indexeddb-startup-state',
    rootPath: 'web-startup-state',
    files: Object.freeze([
      Object.freeze({
        path: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH,
        text,
        sizeBytes
      })
    ])
  })),
  list: vi.fn(),
  delete: vi.fn()
})

const expectNoWrites = (value: ThirdPartyDataPackWebStartupPersistentStateSourceHostReport): void => {
  expect(value.writeAllowed).toBe(false)
  expect(value.effects.packageFilesWritten).toBe(false)
  expect(value.effects.lockfileWritten).toBe(false)
  expect(value.effects.settingsWritten).toBe(false)
  expect(value.effects.savesWritten).toBe(false)
  expect(value.effects.cacheWritten).toBe(false)
  expect(value.effects.transactionLogWritten).toBe(false)
  expect(value.effects.rollbackExecuted).toBe(false)
  expect(value.effects.diagnosticsWritten).toBe(false)
}

describe('third-party Web startup persistent state source host', () => {
  it('loads a startup snapshot only after the Web settings-lockfile record matches', async() => {
    const store = await createStoreWithSnapshot()
    const settingsLockfileStore = await createSettingsLockfileStore()
    const host = createThirdPartyDataPackWebStartupPersistentStateSourceHost({
      store,
      settingsLockfileStore
    })
    const inspect = await host.inspect()
    const read = await readThirdPartyDataPackWebStartupPersistentStateSnapshot({
      store,
      settingsLockfileStore,
      request: createRequest()
    })
    const snapshot = await host.read(createRequest())

    expect(host).toMatchObject({
      kind: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
      mode: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE
    })
    expect(inspect).toMatchObject({
      status: 'ready',
      operation: 'inspect',
      storageKind: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_STORAGE_KIND,
      indexedDbRecordScoped: true,
      snapshotFilePresent: false
    })
    expect(read.report).toMatchObject({
      status: 'loaded',
      operation: 'read',
      storageKind: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_STORAGE_KIND,
      indexedDbRecordScoped: true,
      snapshotFilePresent: true,
      settingsLockfileRecordPresent: true,
      settingsLockfileRecordRead: true,
      modLockDraftRead: true,
      persistentStartupReadAllowed: true,
      writeAllowed: false
    })
    expect(read.report.effects.startupPersistentStateSnapshotRead).toBe(true)
    expect(read.report.effects.settingsStateRead).toBe(true)
    expect(read.report.effects.modLockStateRead).toBe(true)
    expect(read.snapshot).toEqual(expect.objectContaining({
      kind: 'startup-persistent-state-snapshot',
      settled: true,
      packageId,
      lockfileHash,
      messageKey: 'mods.startup.persistent.state.web.ready'
    }))
    expect(snapshot).toEqual(read.snapshot)
    expect(Object.isFrozen(read.report)).toBe(true)
    expect(Object.isFrozen(read.snapshot)).toBe(true)
    expectNoWrites(read.report)
    expect(JSON.stringify(read)).not.toContain(THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH)
    expect(JSON.stringify(read)).not.toContain('C:/Users')
  })

  it('reports absent IndexedDB startup records without leaking host errors', async() => {
    const missing = await readThirdPartyDataPackWebStartupPersistentStateSnapshot({
      store: createInMemoryWebIndexedDbImportPersistenceStore(),
      request: createRequest()
    })
    const failingStore: WebIndexedDbImportPersistenceStore = {
      put: vi.fn(),
      get: vi.fn(async() => {
        throw new Error('IndexedDB C:/Users/LENOVO/AppData/private startup state failure')
      }),
      list: vi.fn(),
      delete: vi.fn()
    }
    const failed = await readThirdPartyDataPackWebStartupPersistentStateSnapshot({
      store: failingStore,
      request: createRequest()
    })

    expect(missing.report.status).toBe('missing')
    expect(missing.snapshot).toBeNull()
    expect(failed.report.status).toBe('failed')
    expect(failed.report.reason).toBe('web startup persistent state IndexedDB record could not be read')
    expect(failed.snapshot).toBeNull()
    expect(JSON.stringify(failed)).not.toContain('C:/Users')
    expect(JSON.stringify(failed)).not.toContain('LENOVO')
    expectNoWrites(missing.report)
    expectNoWrites(failed.report)
  })

  it('blocks invalid, oversized and identity-drifted snapshots before returning startup proof', async() => {
    const invalid = await readThirdPartyDataPackWebStartupPersistentStateSnapshot({
      store: await createStoreWithSnapshot('{"kind":"bad"}\n'),
      request: createRequest()
    })
    const oversized = await readThirdPartyDataPackWebStartupPersistentStateSnapshot({
      store: createRawStoreWithSnapshot(
        toJson(createSnapshotFile()),
        THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_MAX_BYTES + 1
      ),
      request: createRequest()
    })
    const drift = await readThirdPartyDataPackWebStartupPersistentStateSnapshot({
      store: await createStoreWithSnapshot(toJson(createSnapshotFile({
        lockfileHash: testHash('e')
      }))),
      request: createRequest()
    })

    expect(invalid.report).toMatchObject({
      status: 'blocked',
      reason: 'web startup persistent state snapshot file structure is invalid'
    })
    expect(oversized.report).toMatchObject({
      status: 'blocked',
      reason: 'web startup persistent state snapshot file exceeds the size limit'
    })
    expect(drift.report).toMatchObject({
      status: 'blocked',
      reason: 'web startup persistent state snapshot does not match the startup request identity or required proofs'
    })
    expect(invalid.snapshot).toBeNull()
    expect(oversized.snapshot).toBeNull()
    expect(drift.snapshot).toBeNull()
    expect(JSON.stringify(drift)).not.toContain(testHash('e'))
    expectNoWrites(invalid.report)
    expectNoWrites(oversized.report)
    expectNoWrites(drift.report)
  })

  it('blocks missing or drifted Web settings-lockfile records after the startup snapshot is present', async() => {
    const snapshotStore = await createStoreWithSnapshot()
    const missing = await readThirdPartyDataPackWebStartupPersistentStateSnapshot({
      store: snapshotStore,
      settingsLockfileStore: createInMemoryWebSettingsLockfilePersistentWriterStore(),
      request: createRequest()
    })
    const driftCandidateIdentity = {
      ...candidateIdentity,
      candidateHash: testHash('e')
    }
    const drift = await readThirdPartyDataPackWebStartupPersistentStateSnapshot({
      store: snapshotStore,
      settingsLockfileStore: await createSettingsLockfileStore(createLockfileDraft({
        candidateIdentity: driftCandidateIdentity
      })),
      request: createRequest()
    })

    expect(missing.report).toMatchObject({
      status: 'blocked',
      reason: 'web startup settings-lockfile state record is absent',
      settingsLockfileRecordRead: false,
      modLockDraftRead: false
    })
    expect(missing.report.effects.startupPersistentStateSnapshotRead).toBe(true)
    expect(missing.report.effects.settingsStateRead).toBe(false)
    expect(missing.report.effects.modLockStateRead).toBe(false)
    expect(missing.snapshot).toBeNull()
    expect(drift.report).toMatchObject({
      status: 'blocked',
      reason: 'web startup settings-lockfile state does not match the startup request identity',
      settingsLockfileRecordPresent: true,
      settingsLockfileRecordRead: true,
      modLockDraftRead: true
    })
    expect(drift.report.effects.startupPersistentStateSnapshotRead).toBe(true)
    expect(drift.report.effects.settingsStateRead).toBe(true)
    expect(drift.report.effects.modLockStateRead).toBe(true)
    expect(drift.snapshot).toBeNull()
    expect(JSON.stringify(drift)).not.toContain(testHash('e'))
    expectNoWrites(missing.report)
    expectNoWrites(drift.report)
  })
})
