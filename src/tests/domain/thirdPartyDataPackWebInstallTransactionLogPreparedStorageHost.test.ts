import { describe, expect, it, vi } from 'vitest'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from '@/domain/mods/thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
} from '@/domain/mods/thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource'
import type {
  ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
} from '@/domain/mods/thirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline'
import {
  createInMemoryWebInstallTransactionLogPreparedStore,
  createWebIndexedDbInstallTransactionLogPreparedStore,
  prepareThirdPartyDataPackWebInstallTransactionLogPrepared,
  THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND,
  type ThirdPartyDataPackWebInstallTransactionLogPreparedStore,
  verifyThirdPartyDataPackWebInstallTransactionLogPreparedReadBack
} from '@/domain/mods/thirdPartyDataPackWebInstallTransactionLogPreparedStorageHost'

const packageId = 'web_transaction_pack' as PackageId
const sha = (fill: string): Sha256Hash => `sha256:${fill.repeat(64)}` as Sha256Hash

const candidateIdentity: ThirdPartyCandidateIdentitySummary = {
  formatVersion: 1,
  contentHash: sha('a'),
  snapshotHash: sha('b'),
  candidateHash: sha('c')
}

const lockfileHash = sha('d')

const connectionEffects =
  (): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult['effects'] =>
    ({
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
      diagnosticsWritten: false
    })

const createConnection =
  (): ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult =>
    ({
      kind: 'third-party-install-persistent-staging-settings-lockfile-transaction-commit-connection-source',
      mode: 'default-disabled-install-persistent-staging-settings-lockfile-transaction-commit-connection-source',
      status: 'accepted',
      reason: 'Web transaction-log test accepted prior contained writes',
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
      backedUpFileCount: 0,
      persistentSettingsLockfileWriteExecuted: true,
      transactionCommitConnectionAcknowledged: true,
      checks: [],
      diagnostics: [],
      effects: connectionEffects()
    } as ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult)

const prepareTransactionLog = async(
  store: ThirdPartyDataPackWebInstallTransactionLogPreparedStore
): Promise<ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult> =>
  await prepareThirdPartyDataPackWebInstallTransactionLogPrepared({
    store,
    connection: createConnection(),
    transactionId: 'web-visible-import:test-transaction',
    createdAtIso: '2026-08-27T00:00:00.000Z'
  })

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
            put: (record: { readonly recordId: string }) => {
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

const expectWebTransactionLogBoundary = (
  prepared: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
): void => {
  expect(prepared.status).toBe('prepared')
  expect(prepared.storageKind).toBe(THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND)
  expect(prepared.effects.transactionLogPrepared).toBe(true)
  expect(prepared.effects.transactionLogWritten).toBe(true)
  expect(prepared.effects.transactionCommitted).toBe(false)
  expect(prepared.effects.runtimePublicationCommitted).toBe(false)
  expect(prepared.effects.savesWritten).toBe(false)
  expect(prepared.effects.cacheWritten).toBe(false)
  expect(JSON.stringify(prepared)).not.toContain('indexedDB://')
}

describe('Web install transaction-log prepared storage host', () => {
  it('writes and verifies the prepared entry through the Web store adapter', async() => {
    const store = createInMemoryWebInstallTransactionLogPreparedStore()

    const prepared = await prepareTransactionLog(store)
    const readBack = await store.read()
    const verification = await verifyThirdPartyDataPackWebInstallTransactionLogPreparedReadBack({
      store,
      prepared
    })

    expectWebTransactionLogBoundary(prepared)
    expect(readBack.report.status).toBe('loaded')
    expect(readBack.report.storageKind).toBe(THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND)
    expect(readBack.record?.entryHash).toBe(prepared.transactionLogEntryHash)
    expect(verification.status).toBe('verified')
    expect(verification.readTransactionLogEntryHash).toBe(prepared.transactionLogEntryHash)
    expect(verification.effects.transactionLogRead).toBe(true)
    expect(verification.effects.transactionCommitted).toBe(false)
  })

  it('can use a Web IndexedDB object store without exposing database handles', async() => {
    const store = createWebIndexedDbInstallTransactionLogPreparedStore({
      indexedDb: createFakeIndexedDb(),
      databaseName: 'test-taoyuan-web-transaction-log'
    })

    const prepared = await prepareTransactionLog(store)
    const readBack = await store.read()

    expectWebTransactionLogBoundary(prepared)
    expect(readBack.report.status).toBe('loaded')
    expect(readBack.record?.entry.transactionId).toBe('web-visible-import:test-transaction')
    expect(JSON.stringify(prepared)).not.toContain('test-taoyuan-web-transaction-log')
    expect(JSON.stringify(readBack.report)).not.toContain('IDB')
  })
})
