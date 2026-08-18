import { describe, expect, it, vi } from 'vitest'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { ContentId, PackageId, RegistryTypeId } from '@/domain/mods/ids'
import type {
  ThirdPartyDataPackSettingsLockfileCommitSourceEffectSummary,
  ThirdPartyDataPackSettingsLockfileCommitSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfileCommitSource'
import {
  createThirdPartyDataPackSettingsLockfilePersistentWriterSource,
  ThirdPartyDataPackSettingsLockfilePersistentWriterBlockedError,
  type ThirdPartyDataPackSettingsLockfilePersistentWriterSourceResult
} from '@/domain/mods/thirdPartyDataPackSettingsLockfilePersistentWriterSource'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import {
  createInMemoryWebSettingsLockfilePersistentWriterStore,
  createThirdPartyDataPackWebSettingsLockfilePersistentWriterHost,
  createWebIndexedDbSettingsLockfilePersistentWriterStore,
  THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
  THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_STORAGE_KIND,
  type ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
} from '@/domain/mods/thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const packageId = 'sample_pack' as PackageId
const blockedPackageId = 'blocked_pack' as PackageId
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

const requestSuccess = <T>(result: T): IDBRequest<T> => {
  const request = {
    result,
    error: null,
    onsuccess: null as (() => void) | null,
    onerror: null as (() => void) | null
  }
  queueMicrotask(() => request.onsuccess?.())
  return request as unknown as IDBRequest<T>
}

const completeTransactionAfterRequestHandlers = (transaction: { oncomplete: (() => void) | null }): void => {
  setTimeout(() => transaction.oncomplete?.(), 0)
}

const createFakeIndexedDb = (): IDBFactory => {
  const databases = new Map<string, Map<string, Map<string, unknown>>>()
  const createDatabase = (databaseName: string) => {
    const stores = databases.get(databaseName) ?? new Map<string, Map<string, unknown>>()
    databases.set(databaseName, stores)
    const database = {
      objectStoreNames: {
        contains: (storeName: string) => stores.has(storeName)
      },
      createObjectStore: (storeName: string) => {
        const records = new Map<string, unknown>()
        stores.set(storeName, records)
        return records
      },
      transaction: (storeName: string) => {
        const records = stores.get(storeName)
        if (records === undefined) throw new Error(`missing store ${storeName}`)
        const transaction = {
          error: null,
          oncomplete: null as (() => void) | null,
          onerror: null as (() => void) | null,
          onabort: null as (() => void) | null,
          objectStore: () => ({
            put: (record: { recordId: string }) => {
              records.set(record.recordId, record)
              const request = requestSuccess(undefined)
              completeTransactionAfterRequestHandlers(transaction)
              return request
            },
            get: (recordId: string) => {
              const request = requestSuccess(records.get(recordId))
              completeTransactionAfterRequestHandlers(transaction)
              return request
            }
          })
        }
        completeTransactionAfterRequestHandlers(transaction)
        return transaction as unknown as IDBTransaction
      },
      close: vi.fn()
    }
    return database as unknown as IDBDatabase
  }

  return {
    open: (databaseName: string) => {
      const request = {
        result: createDatabase(databaseName),
        error: null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
        onupgradeneeded: null as (() => void) | null
      }
      queueMicrotask(() => {
        request.onupgradeneeded?.()
        request.onsuccess?.()
      })
      return request as unknown as IDBOpenDBRequest
    }
  } as unknown as IDBFactory
}

describe('Web settings-lockfile persistent writer host', () => {
  it('writes settings and lockfile identity through the existing persistent writer source', async() => {
    const draft = createDraft()
    const store = createInMemoryWebSettingsLockfilePersistentWriterStore()
    const host = createThirdPartyDataPackWebSettingsLockfilePersistentWriterHost({
      store,
      readLockfileDraft: async() => draft
    })
    const source = createThirdPartyDataPackSettingsLockfilePersistentWriterSource({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(draft),
      writeSettingsLockfile: host
    })

    const result = await source()
    const readBack = await store.read()

    expect(result.status).toBe('written')
    expect(result.settingsLockfilePersistentWriterHostStatus).toBe('written')
    expect(result.effects.settingsLockfilePersistentWriterHostWritten).toBe(true)
    expect(result.effects.realSettingsLockfilePersistentWriterHostCalled).toBe(false)
    expectOnlySettingsAndLockfileWrites(result, true)
    expect(readBack.record).toMatchObject({
      recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
      targetPackageId: packageId,
      candidateHash: draft.candidateIdentity.candidateHash,
      lockfileHash: draft.lockfileHash
    })
    expect(readBack.record?.lockfileDraft).toEqual(draft)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('indexedDB')
    expect(serialized).not.toContain('browserStorage')
    expect(serialized).not.toContain('lockfileDraft')
  })

  it('can persist the active record in a Web IndexedDB object store without exposing handles', async() => {
    const draft = createDraft()
    const store = createWebIndexedDbSettingsLockfilePersistentWriterStore({
      indexedDb: createFakeIndexedDb(),
      databaseName: 'test-taoyuan-web-settings-lockfile'
    })
    const host = createThirdPartyDataPackWebSettingsLockfilePersistentWriterHost({
      store,
      readLockfileDraft: async() => draft
    })
    const source = createThirdPartyDataPackSettingsLockfilePersistentWriterSource({
      enabled: true,
      readSettingsLockfileCommitSource: async() => createAcceptedCommitResult(draft),
      writeSettingsLockfile: host
    })

    const result = await source()
    const readBack = await store.read()

    expect(result.status).toBe('written')
    expect(readBack.report.storageKind).toBe(THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_STORAGE_KIND)
    expect(readBack.record?.lockfileHash).toBe(draft.lockfileHash)
    expect(readBack.record?.selectedPackageIds).toEqual([packageId])
    expect(JSON.stringify(result)).not.toContain('test-taoyuan-web-settings-lockfile')
    expect(JSON.stringify(result)).not.toContain('IDB')
    expectOnlySettingsAndLockfileWrites(result, true)
  })

  it('blocks a mismatched lockfile draft before touching the Web store', async() => {
    const draft = createDraft()
    const mismatchedDraft = createDraft({ candidateHash: sha('8') })
    const store = {
      inspect: vi.fn(),
      read: vi.fn(),
      write: vi.fn()
    } as unknown as ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
    const host = createThirdPartyDataPackWebSettingsLockfilePersistentWriterHost({
      store,
      readLockfileDraft: async() => mismatchedDraft
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
          stage: 'third-party.web-settings-lockfile-persistent-writer-host.lockfile-draft-mismatch',
          packageId
        })
      ]))
      expectOnlySettingsAndLockfileWrites(result, false)
    }
    expect(store.inspect).not.toHaveBeenCalled()
    expect(store.write).not.toHaveBeenCalled()
  })

  it('blocks unsafe Web store reports and strips storage path diagnostics', async() => {
    const draft = createDraft()
    const store = {
      inspect: vi.fn(async() => ({
        status: 'ready',
        operation: 'inspect',
        storageKind: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_STORAGE_KIND,
        reason: 'ready',
        diagnostics: [],
        effects: {
          webSettingsLockfileStoreCalled: true,
          webSettingsLockfileStoreWritten: false,
          officialRegistryPublished: false,
          thirdPartyRegistryPublished: false,
          runtimeEnablementAllowed: false,
          webStorageEnvelopeExposed: false,
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
        }
      })),
      read: vi.fn(),
      write: vi.fn(async record => ({
        status: 'written',
        operation: 'write',
        storageKind: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_STORAGE_KIND,
        reason: 'unsafe',
        recordId: record.recordId,
        targetPackageId: record.targetPackageId,
        selectedPackageIds: record.selectedPackageIds,
        blockedPackageIds: record.blockedPackageIds,
        loadOrder: record.loadOrder,
        candidateHash: record.candidateHash,
        lockfileHash: record.lockfileHash,
        indexedDbDatabase: {
          name: 'taoyuan-web-mod-settings-lockfile'
        },
        diagnostics: [
          {
            code: 'LIFECYCLE-TRANSACTION-001',
            ruleId: 'LIFECYCLE-TRANSACTION-001',
            severity: 'error',
            stage: 'third-party.web-settings-lockfile-persistent-writer-host.store-path',
            messageKey: 'mods.error.lifecycle.transaction.001',
            packageId,
            file: 'indexeddb://taoyuan-web-mod-settings-lockfile/settingsLockfile',
            recovery: 'retry'
          }
        ],
        effects: {
          webSettingsLockfileStoreCalled: true,
          webSettingsLockfileStoreWritten: true,
          officialRegistryPublished: false,
          thirdPartyRegistryPublished: false,
          runtimeEnablementAllowed: false,
          webStorageEnvelopeExposed: false,
          packageFilesWritten: false,
          packageBackupsWritten: false,
          packageFilesRestored: false,
          lockfileWritten: true,
          lockfileRestored: false,
          settingsWritten: true,
          settingsRestored: false,
          savesWritten: false,
          cacheWritten: true,
          transactionLogWritten: false,
          recoveryLogRead: false,
          recoveryLogReplayed: false,
          rollbackExecuted: false,
          diagnosticsWritten: false
        }
      }))
    } as unknown as ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
    const host = createThirdPartyDataPackWebSettingsLockfilePersistentWriterHost({
      store,
      readLockfileDraft: async() => draft
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
          stage: 'third-party.web-settings-lockfile-persistent-writer-host.store-path',
          packageId
        }),
        expect.objectContaining({
          stage: 'third-party.web-settings-lockfile-persistent-writer-host.store-write-blocked',
          packageId
        })
      ]))
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain('indexeddb://')
      expect(serialized).not.toContain('taoyuan-web-mod-settings-lockfile')
      expect(serialized).not.toContain('indexedDbDatabase')
      expectOnlySettingsAndLockfileWrites(result, false)
    }
  })
})
