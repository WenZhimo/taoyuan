import { assertPureJsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackInstallTransactionLogPreparedCheck,
  ThirdPartyDataPackInstallTransactionLogPreparedEntry,
  ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult,
  ThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter,
  ThirdPartyDataPackInstallTransactionLogPreparedStorageReport
} from './thirdPartyDataPackInstallTransactionLogPreparedCommitHostConnectionPipeline'
import type {
  ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck,
  ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult
} from './thirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationPipeline'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
} from './thirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSource'

export const THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_RECORD_ID = 'active'
export const THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND =
  'web-indexeddb-install-transaction-log-prepared'
export const THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_DATABASE_NAME =
  'taoyuan-web-mod-install-transactions'
export const THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_DATABASE_VERSION = 1
export const THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_OBJECT_STORE_NAME =
  'installTransactionLogPrepared'

export type ThirdPartyDataPackWebInstallTransactionLogPreparedStoreStatus =
  | 'ready'
  | 'written'
  | 'loaded'
  | 'missing'
  | 'failed'
export type ThirdPartyDataPackWebInstallTransactionLogPreparedStoreOperation =
  | 'inspect'
  | 'write'
  | 'read'

export interface ThirdPartyDataPackWebInstallTransactionLogPreparedRecord {
  readonly recordId: typeof THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_RECORD_ID
  readonly targetPackageId: PackageId
  readonly transactionId: string
  readonly entryHash: Sha256Hash
  readonly entry: ThirdPartyDataPackInstallTransactionLogPreparedEntry
}

export interface ThirdPartyDataPackWebInstallTransactionLogPreparedStoreEffects {
  readonly webInstallTransactionLogStoreCalled: boolean
  readonly webInstallTransactionLogStoreWritten: boolean
  readonly webInstallTransactionLogStoreRead: boolean
  readonly transactionCommitted: false
  readonly transactionLogPrepared: boolean
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: false
  readonly lockfileWritten: false
  readonly lockfileRestored: false
  readonly settingsWritten: false
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: boolean
  readonly transactionLogRead: boolean
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackWebInstallTransactionLogPreparedStoreReport {
  readonly status: ThirdPartyDataPackWebInstallTransactionLogPreparedStoreStatus
  readonly operation: ThirdPartyDataPackWebInstallTransactionLogPreparedStoreOperation
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND
  readonly reason: string
  readonly recordId?: typeof THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_RECORD_ID
  readonly targetPackageId?: PackageId
  readonly transactionId?: string
  readonly entryHash?: Sha256Hash
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackWebInstallTransactionLogPreparedStoreEffects
}

export interface ThirdPartyDataPackWebInstallTransactionLogPreparedStoreReadResult {
  readonly report: ThirdPartyDataPackWebInstallTransactionLogPreparedStoreReport
  readonly record: ThirdPartyDataPackWebInstallTransactionLogPreparedRecord | null
}

export interface ThirdPartyDataPackWebInstallTransactionLogPreparedStore {
  inspect(): Promise<ThirdPartyDataPackWebInstallTransactionLogPreparedStoreReport>
  write(
    entry: ThirdPartyDataPackInstallTransactionLogPreparedEntry
  ): Promise<ThirdPartyDataPackWebInstallTransactionLogPreparedStoreReport>
  read(): Promise<ThirdPartyDataPackWebInstallTransactionLogPreparedStoreReadResult>
}

export interface CreateWebIndexedDbInstallTransactionLogPreparedStoreOptions {
  readonly indexedDb?: IDBFactory
  readonly databaseName?: string
  readonly objectStoreName?: string
}

export interface PrepareThirdPartyDataPackWebInstallTransactionLogPreparedOptions {
  readonly store: ThirdPartyDataPackWebInstallTransactionLogPreparedStore
  readonly connection:
    ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
  readonly transactionId?: string
  readonly createdAtIso?: string
}

const sha256Pattern = /^sha256:[0-9a-f]{64}$/

const clonePackageIds = (value: unknown): PackageId[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string')
    ? [...value] as PackageId[]
    : []

const cloneCandidateIdentity = (
  value: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const identity = value as ThirdPartyCandidateIdentitySummary
  return identity.formatVersion === 1
    && typeof identity.contentHash === 'string'
    && sha256Pattern.test(identity.contentHash)
    && typeof identity.snapshotHash === 'string'
    && sha256Pattern.test(identity.snapshotHash)
    && typeof identity.candidateHash === 'string'
    && sha256Pattern.test(identity.candidateHash)
    ? Object.freeze({
        formatVersion: 1,
        contentHash: identity.contentHash,
        snapshotHash: identity.snapshotHash,
        candidateHash: identity.candidateHash
      })
    : undefined
}

const calculateEntryHash = (
  entry: Omit<ThirdPartyDataPackInstallTransactionLogPreparedEntry, 'entryHash'>
): Sha256Hash => hashCanonicalJson(entry) as Sha256Hash

const validateEntry = (
  value: unknown
): ThirdPartyDataPackInstallTransactionLogPreparedEntry => {
  assertPureJsonValue(value)
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Web install transaction log prepared entry must be an object')
  }
  const entry = value as ThirdPartyDataPackInstallTransactionLogPreparedEntry
  const candidateIdentity = cloneCandidateIdentity(entry.candidateIdentity)
  const selectedPackageIds = clonePackageIds(entry.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(entry.blockedPackageIds)
  const loadOrder = clonePackageIds(entry.loadOrder)
  if (
    entry.formatVersion !== 1
    || entry.kind !== 'third-party-data-pack-install-transaction-log-prepared'
    || entry.operation !== 'prepare-install-transaction'
    || entry.requestedCommandId !== 'install'
    || typeof entry.transactionId !== 'string'
    || entry.transactionId.length < 1
    || typeof entry.createdAtIso !== 'string'
    || typeof entry.targetPackageId !== 'string'
    || !sha256Pattern.test(entry.lockfileHash)
    || !sha256Pattern.test(entry.entryHash)
    || candidateIdentity === undefined
    || selectedPackageIds.length === 0
    || !selectedPackageIds.includes(entry.targetPackageId)
    || !loadOrder.includes(entry.targetPackageId)
    || !Number.isSafeInteger(entry.registryCount)
    || !Number.isSafeInteger(entry.entryCount)
    || !Number.isSafeInteger(entry.packageCount)
    || entry.packageCount !== selectedPackageIds.length
    || entry.packageFileWriteAcknowledged !== true
    || entry.settingsLockfileWriteAcknowledged !== true
    || entry.transactionCommitConnectionAcknowledged !== true
  ) {
    throw new Error('Web install transaction log prepared entry structure is invalid')
  }

  const body: Omit<ThirdPartyDataPackInstallTransactionLogPreparedEntry, 'entryHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-install-transaction-log-prepared',
    transactionId: entry.transactionId,
    operation: 'prepare-install-transaction',
    createdAtIso: entry.createdAtIso,
    requestedCommandId: 'install',
    targetPackageId: entry.targetPackageId,
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    registryCount: entry.registryCount,
    entryCount: entry.entryCount,
    packageCount: entry.packageCount,
    candidateIdentity,
    lockfileHash: entry.lockfileHash,
    packageFileWriteAcknowledged: true,
    settingsLockfileWriteAcknowledged: true,
    transactionCommitConnectionAcknowledged: true
  }
  if (entry.entryHash !== calculateEntryHash(body)) {
    throw new Error('Web install transaction log prepared entry self hash does not match its canonical body')
  }
  return deepFreezeObjectGraph({
    ...body,
    entryHash: entry.entryHash
  })
}

const readOwnDataField = (value: unknown, fieldName: string): unknown => {
  if (value === null || typeof value !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (value: unknown, fieldName: string): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    let keys: readonly (string | symbol)[]
    try {
      keys = Reflect.ownKeys(value as object)
    } catch {
      return value
    }
    for (const key of keys) {
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value as object, key)
      } catch {
        continue
      }
      if (descriptor?.enumerable === true && 'value' in descriptor) {
        deepFreezeObjectGraph(descriptor.value)
      }
    }
    Object.freeze(value)
  }
  return value
}

const createStoreEffects = (
  operation: ThirdPartyDataPackWebInstallTransactionLogPreparedStoreOperation,
  active = false
): ThirdPartyDataPackWebInstallTransactionLogPreparedStoreEffects => Object.freeze({
  webInstallTransactionLogStoreCalled: true,
  webInstallTransactionLogStoreWritten: operation === 'write' && active,
  webInstallTransactionLogStoreRead: operation === 'read' && active,
  transactionCommitted: false,
  transactionLogPrepared: active,
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
  transactionLogWritten: operation === 'write' && active,
  transactionLogRead: operation === 'read' && active,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const createStoreReport = (
  options: {
    readonly status: ThirdPartyDataPackWebInstallTransactionLogPreparedStoreStatus
    readonly operation: ThirdPartyDataPackWebInstallTransactionLogPreparedStoreOperation
    readonly reason: string
    readonly record?: ThirdPartyDataPackWebInstallTransactionLogPreparedRecord
    readonly diagnostics?: readonly ModDiagnostic[]
    readonly active?: boolean
  }
): ThirdPartyDataPackWebInstallTransactionLogPreparedStoreReport => deepFreezeObjectGraph({
  status: options.status,
  operation: options.operation,
  storageKind: THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND,
  reason: options.reason,
  recordId: options.record?.recordId,
  targetPackageId: options.record?.targetPackageId,
  transactionId: options.record?.transactionId,
  entryHash: options.record?.entryHash,
  diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
  effects: createStoreEffects(options.operation, options.active === true)
})

const createStoreErrorReport = (
  operation: ThirdPartyDataPackWebInstallTransactionLogPreparedStoreOperation,
  stage: string,
  error: unknown
): ThirdPartyDataPackWebInstallTransactionLogPreparedStoreReport => createStoreReport({
  status: 'failed',
  operation,
  reason: 'web IndexedDB install transaction-log prepared store failed before publishing partial state',
  diagnostics: [
    createDiagnostic('LIFECYCLE-TRANSACTION-001', {
      stage,
      details: {
        errorName: error instanceof Error ? error.name : typeof error
      },
      recovery: 'retry'
    })
  ]
})

const recordFromEntry = (
  entry: ThirdPartyDataPackInstallTransactionLogPreparedEntry
): ThirdPartyDataPackWebInstallTransactionLogPreparedRecord => {
  const safeEntry = validateEntry(entry)
  return deepFreezeObjectGraph({
    recordId: THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_RECORD_ID,
    targetPackageId: safeEntry.targetPackageId,
    transactionId: safeEntry.transactionId,
    entryHash: safeEntry.entryHash,
    entry: safeEntry
  })
}

const validateRecord = (
  value: unknown
): ThirdPartyDataPackWebInstallTransactionLogPreparedRecord => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Web install transaction log prepared record must be an object')
  }
  const recordId = readOwnStringField(value, 'recordId')
  const targetPackageId = readOwnStringField(value, 'targetPackageId')
  const transactionId = readOwnStringField(value, 'transactionId')
  const entryHash = readOwnStringField(value, 'entryHash')
  const entry = validateEntry(readOwnDataField(value, 'entry'))
  if (
    recordId !== THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_RECORD_ID
    || targetPackageId !== entry.targetPackageId
    || transactionId !== entry.transactionId
    || entryHash !== entry.entryHash
  ) {
    throw new Error('Web install transaction log prepared record identity is inconsistent')
  }
  return deepFreezeObjectGraph({
    recordId: THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_RECORD_ID,
    targetPackageId: entry.targetPackageId,
    transactionId: entry.transactionId,
    entryHash: entry.entryHash,
    entry
  })
}

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
})

const transactionToPromise = (transaction: IDBTransaction): Promise<void> => new Promise((resolve, reject) => {
  transaction.oncomplete = () => resolve()
  transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'))
  transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'))
})

export const createWebIndexedDbInstallTransactionLogPreparedStore = (
  options: CreateWebIndexedDbInstallTransactionLogPreparedStoreOptions = {}
): ThirdPartyDataPackWebInstallTransactionLogPreparedStore => {
  const indexedDb = options.indexedDb ?? globalThis.indexedDB
  if (indexedDb === undefined) {
    throw new Error('Web IndexedDB is not available')
  }
  const databaseName = options.databaseName
    ?? THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_DATABASE_NAME
  const objectStoreName = options.objectStoreName
    ?? THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_OBJECT_STORE_NAME

  const openDatabase = async(): Promise<IDBDatabase> => {
    const request = indexedDb.open(
      databaseName,
      THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_DATABASE_VERSION
    )
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(objectStoreName)) {
        database.createObjectStore(objectStoreName, { keyPath: 'recordId' })
      }
    }
    return requestToPromise(request)
  }

  const withObjectStore = async <T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<T>
  ): Promise<T> => {
    const database = await openDatabase()
    try {
      const transaction = database.transaction(objectStoreName, mode)
      const store = transaction.objectStore(objectStoreName)
      const result = await operation(store)
      await transactionToPromise(transaction)
      return result
    } finally {
      database.close()
    }
  }

  return {
    async inspect() {
      try {
        await withObjectStore('readonly', async() => undefined)
        return createStoreReport({
          status: 'ready',
          operation: 'inspect',
          reason: 'web IndexedDB install transaction-log prepared object store resolved'
        })
      } catch (error) {
        return createStoreErrorReport(
          'inspect',
          'third-party.web-install-transaction-log-prepared-store.inspect',
          error
        )
      }
    },
    async write(entry) {
      try {
        const record = recordFromEntry(entry)
        await withObjectStore('readwrite', async store => {
          await requestToPromise(store.put(record))
        })
        return createStoreReport({
          status: 'written',
          operation: 'write',
          reason: 'web IndexedDB install transaction-log prepared entry was written',
          record,
          active: true
        })
      } catch (error) {
        return createStoreErrorReport(
          'write',
          'third-party.web-install-transaction-log-prepared-store.write',
          error
        )
      }
    },
    async read() {
      try {
        const record = await withObjectStore('readonly', async store => {
          const value = await requestToPromise(
            store.get(THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_RECORD_ID)
          )
          return value === undefined ? null : validateRecord(value)
        })
        return deepFreezeObjectGraph({
          record,
          report: createStoreReport({
            status: record === null ? 'missing' : 'loaded',
            operation: 'read',
            reason: record === null
              ? 'web IndexedDB install transaction-log prepared entry is absent'
              : 'web IndexedDB install transaction-log prepared entry was read back',
            record: record ?? undefined,
            active: record !== null
          })
        })
      } catch (error) {
        return deepFreezeObjectGraph({
          record: null,
          report: createStoreErrorReport(
            'read',
            'third-party.web-install-transaction-log-prepared-store.read',
            error
          )
        })
      }
    }
  }
}

const storageEffects = (
  prepared: boolean
): ThirdPartyDataPackInstallTransactionLogPreparedStorageReport['effects'] => Object.freeze({
  transactionCommitted: false,
  transactionLogPrepared: prepared,
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
  transactionLogWritten: prepared,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const toStorageReport = (
  report: ThirdPartyDataPackWebInstallTransactionLogPreparedStoreReport
): ThirdPartyDataPackInstallTransactionLogPreparedStorageReport => deepFreezeObjectGraph({
  status: report.status === 'written' ? 'written' : 'failed',
  operation: 'prepare-install-transaction' as const,
  storageKind: THIRD_PARTY_DATA_PACK_WEB_INSTALL_TRANSACTION_LOG_PREPARED_STORAGE_KIND,
  reason: report.reason,
  diagnostics: Object.freeze([...report.diagnostics]),
  effects: storageEffects(report.status === 'written')
})

export const createThirdPartyDataPackWebInstallTransactionLogPreparedStorageAdapter = (
  store: ThirdPartyDataPackWebInstallTransactionLogPreparedStore
): ThirdPartyDataPackInstallTransactionLogPreparedStorageAdapter => ({
  async write(entry) {
    return deepFreezeObjectGraph({
      report: toStorageReport(await store.write(entry))
    })
  }
})

const preparedCheck = (
  id: ThirdPartyDataPackInstallTransactionLogPreparedCheck['id'],
  status: ThirdPartyDataPackInstallTransactionLogPreparedCheck['status'],
  reason: string
): ThirdPartyDataPackInstallTransactionLogPreparedCheck => Object.freeze({ id, status, reason })

const buildPreparedChecks = (
  options: {
    readonly connection: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
    readonly authorized: boolean
    readonly storageReport?: ThirdPartyDataPackInstallTransactionLogPreparedStorageReport
  }
): readonly ThirdPartyDataPackInstallTransactionLogPreparedCheck[] => Object.freeze([
  preparedCheck(
    'transaction-commit-connection-accepted',
    options.connection.status === 'accepted' && options.connection.transactionCommitConnectionAcknowledged
      ? 'satisfied'
      : 'blocked',
    'Web transaction-log prepare requires an accepted transaction commit connection.'
  ),
  preparedCheck(
    'install-target-present',
    options.connection.requestedCommandId === 'install' && options.connection.targetPackageId !== undefined
      ? 'satisfied'
      : 'blocked',
    'Web transaction-log prepare requires an install command target.'
  ),
  preparedCheck(
    'candidate-identity-present',
    options.connection.candidateIdentity?.candidateHash !== undefined
      ? 'satisfied'
      : 'blocked',
    'Web transaction-log prepare requires a candidate identity.'
  ),
  preparedCheck(
    'lockfile-hash-present',
    options.connection.lockfileHash !== undefined
      ? 'satisfied'
      : 'blocked',
    'Web transaction-log prepare requires the candidate lockfile hash.'
  ),
  preparedCheck(
    'contained-writes-present',
    options.connection.persistentPackageWriteExecuted
      && options.connection.persistentSettingsLockfileWriteExecuted
      && options.connection.effects.packageFilesWritten
      && options.connection.effects.settingsWritten
      && options.connection.effects.lockfileWritten
      ? 'satisfied'
      : 'blocked',
    'Web transaction-log prepare requires prior contained package/settings/lockfile write acknowledgements.'
  ),
  preparedCheck(
    'no-upstream-commit-or-read-effects',
    options.connection.effects.transactionCommitted === false
      && options.connection.effects.transactionLogPrepared === false
      && options.connection.effects.runtimePublicationCommitted === false
      && options.connection.effects.postCommitVerificationExecuted === false
      && options.connection.effects.uiIpcResponseDelivered === false
      && options.connection.effects.transactionLogRead === false
      && options.connection.effects.savesWritten === false
      && options.connection.effects.cacheWritten === false
      && options.connection.effects.rollbackExecuted === false
      ? 'satisfied'
      : 'blocked',
    'Web transaction-log prepare requires upstream commit, readback, runtime, UI/IPC and rollback effects to remain absent.'
  ),
  preparedCheck(
    'explicit-transaction-log-prepare-authorized',
    options.authorized ? 'satisfied' : 'skipped',
    options.authorized
      ? 'This Web visible import continuation explicitly authorized the contained transaction-log prepared write.'
      : 'Web transaction-log prepare is deferred until explicitly authorized.'
  ),
  preparedCheck(
    'storage-write-contained',
    options.storageReport === undefined
      ? 'skipped'
      : options.storageReport.status === 'written'
        && options.storageReport.effects.transactionLogPrepared
        && options.storageReport.effects.transactionLogWritten
        && options.storageReport.effects.transactionCommitted === false
        && options.storageReport.effects.packageFilesWritten === false
        && options.storageReport.effects.settingsWritten === false
        && options.storageReport.effects.lockfileWritten === false
        && options.storageReport.effects.savesWritten === false
        && options.storageReport.effects.cacheWritten === false
        && options.storageReport.effects.rollbackExecuted === false
        ? 'satisfied'
        : 'blocked',
    'Web transaction-log store must report only a contained transaction-log prepared write.'
  )
])

const diagnosticsForPreparedBlockedChecks = (
  checks: readonly ThirdPartyDataPackInstallTransactionLogPreparedCheck[],
  packageId?: PackageId
): readonly ModDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: `third-party.web-install-transaction-log-prepared.checks.${currentCheck.id}`,
    packageId,
    recovery: 'retry'
  })))

const createPreparedEntry = (
  options: {
    readonly connection: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
    readonly transactionId: string
    readonly createdAtIso: string
  }
): ThirdPartyDataPackInstallTransactionLogPreparedEntry => {
  const candidateIdentity = cloneCandidateIdentity(options.connection.candidateIdentity)
  if (
    options.connection.requestedCommandId !== 'install'
    || options.connection.targetPackageId === undefined
    || candidateIdentity === undefined
    || options.connection.lockfileHash === undefined
  ) {
    throw new Error('Web install transaction log prepared entry requires an accepted install identity')
  }

  const body: Omit<ThirdPartyDataPackInstallTransactionLogPreparedEntry, 'entryHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-install-transaction-log-prepared',
    transactionId: options.transactionId,
    operation: 'prepare-install-transaction',
    createdAtIso: options.createdAtIso,
    requestedCommandId: 'install',
    targetPackageId: options.connection.targetPackageId,
    selectedPackageIds: clonePackageIds(options.connection.selectedPackageIds),
    blockedPackageIds: clonePackageIds(options.connection.blockedPackageIds),
    loadOrder: clonePackageIds(options.connection.loadOrder),
    registryCount: options.connection.registryCount,
    entryCount: options.connection.entryCount,
    packageCount: options.connection.packageCount,
    candidateIdentity,
    lockfileHash: options.connection.lockfileHash,
    packageFileWriteAcknowledged: true,
    settingsLockfileWriteAcknowledged: true,
    transactionCommitConnectionAcknowledged: true
  }
  return validateEntry({
    ...body,
    entryHash: calculateEntryHash(body)
  })
}

const preparedEffects = (
  options: {
    readonly prepared: boolean
    readonly connection?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
  }
): ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult['effects'] => Object.freeze({
  installTransactionLogPreparedPipelineCalled: true,
  transactionCommitConnectionSourceCalled: options.connection !== undefined,
  transactionCommitConnectionAcknowledged:
    options.connection?.effects.transactionCommitConnectionAcknowledged ?? false,
  packageFilePersistentWriteAcknowledged:
    options.connection?.effects.packageFilePersistentWriteAcknowledged ?? false,
  settingsLockfilePersistentWriterAcknowledged:
    options.connection?.effects.settingsLockfilePersistentWriterAcknowledged ?? false,
  transactionLogPrepareAuthorized: true,
  transactionLogPrepared: options.prepared,
  transactionLogWritten: options.prepared,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: options.connection?.effects.packageFilesWritten ?? false,
  packageBackupsWritten: options.connection?.effects.packageBackupsWritten ?? false,
  packageFilesRestored: false,
  lockfileWritten: options.connection?.effects.lockfileWritten ?? false,
  lockfileRestored: false,
  settingsWritten: options.connection?.effects.settingsWritten ?? false,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const createPreparedResult = (
  options: {
    readonly status: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult['status']
    readonly reason: string
    readonly connection?: ThirdPartyDataPackInstallPersistentStagingSettingsLockfileTransactionCommitConnectionSourceResult
    readonly entry?: ThirdPartyDataPackInstallTransactionLogPreparedEntry
    readonly storageReport?: ThirdPartyDataPackInstallTransactionLogPreparedStorageReport
    readonly checks?: readonly ThirdPartyDataPackInstallTransactionLogPreparedCheck[]
    readonly diagnostics?: readonly ModDiagnostic[]
  }
): ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult => {
  const selectedPackageIds = clonePackageIds(options.connection?.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(options.connection?.blockedPackageIds)
  const loadOrder = clonePackageIds(options.connection?.loadOrder)
  const prepared = options.status === 'prepared'
  return deepFreezeObjectGraph({
    kind: 'third-party-install-transaction-log-prepared-commit-host-connection-pipeline',
    mode: 'default-disabled-install-transaction-log-prepared-commit-host-connection-pipeline',
    status: options.status,
    reason: options.reason,
    readOnly: !prepared,
    enabled: true,
    sourceCalled: options.connection !== undefined,
    transactionCommitConnectionSourceStatus: options.connection?.status,
    requestedCommandId: options.connection?.requestedCommandId,
    targetPackageId: options.connection?.targetPackageId,
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    registryCount: options.connection?.registryCount ?? 54,
    entryCount: options.connection?.entryCount ?? 4242,
    packageCount: options.connection?.packageCount ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(options.connection?.candidateIdentity),
    lockfileHash: options.connection?.lockfileHash,
    transactionId: options.entry?.transactionId,
    transactionLogEntryHash: options.entry?.entryHash,
    storageKind: options.storageReport?.storageKind,
    storageStatus: options.storageReport?.status,
    storageOperation: options.storageReport?.operation,
    storageReason: options.storageReport?.reason,
    checks: options.checks ?? Object.freeze([]),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: preparedEffects({
      prepared,
      connection: options.connection
    })
  })
}

export const prepareThirdPartyDataPackWebInstallTransactionLogPrepared = async(
  options: PrepareThirdPartyDataPackWebInstallTransactionLogPreparedOptions
): Promise<ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult> => {
  const preChecks = buildPreparedChecks({
    connection: options.connection,
    authorized: true
  })
  const preDiagnostics = diagnosticsForPreparedBlockedChecks(preChecks, options.connection.targetPackageId)
  if (preDiagnostics.length > 0) {
    return createPreparedResult({
      status: 'blocked',
      reason: 'Web install transaction-log prepare requires accepted contained write acknowledgements',
      connection: options.connection,
      checks: preChecks,
      diagnostics: preDiagnostics
    })
  }

  const entry = createPreparedEntry({
    connection: options.connection,
    transactionId: options.transactionId ?? `web-visible-import:${options.connection.lockfileHash}`,
    createdAtIso: options.createdAtIso ?? new Date().toISOString()
  })
  const storageReport = (await createThirdPartyDataPackWebInstallTransactionLogPreparedStorageAdapter(
    options.store
  ).write(entry)).report
  const writeChecks = buildPreparedChecks({
    connection: options.connection,
    authorized: true,
    storageReport
  })
  const writeDiagnostics = diagnosticsForPreparedBlockedChecks(writeChecks, options.connection.targetPackageId)
  if (storageReport.status !== 'written' || writeDiagnostics.length > 0) {
    return createPreparedResult({
      status: 'failed',
      reason: 'Web install transaction-log prepared entry was not written as a contained IndexedDB record',
      connection: options.connection,
      entry,
      storageReport,
      checks: writeChecks,
      diagnostics: [
        ...storageReport.diagnostics,
        ...writeDiagnostics
      ]
    })
  }

  return createPreparedResult({
    status: 'prepared',
    reason: 'Web install transaction-log prepared entry was written to IndexedDB after matching contained writes',
    connection: options.connection,
    entry,
    storageReport,
    checks: writeChecks,
    diagnostics: storageReport.diagnostics
  })
}

const packageListsEqual = (left: readonly PackageId[], right: readonly PackageId[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const preparedResultHasContainedEffects = (
  prepared: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
): boolean => prepared.status === 'prepared'
  && prepared.effects.transactionLogPrepared === true
  && prepared.effects.transactionLogWritten === true
  && prepared.effects.transactionCommitted === false
  && prepared.effects.runtimePublicationCommitted === false
  && prepared.effects.postCommitVerificationExecuted === false
  && prepared.effects.uiIpcResponseDelivered === false
  && prepared.effects.savesWritten === false
  && prepared.effects.cacheWritten === false
  && prepared.effects.recoveryLogRead === false
  && prepared.effects.recoveryLogReplayed === false
  && prepared.effects.rollbackExecuted === false
  && prepared.effects.diagnosticsWritten === false

const entryMatchesPreparedResult = (
  entry: ThirdPartyDataPackInstallTransactionLogPreparedEntry,
  prepared: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
): boolean => prepared.status === 'prepared'
  && prepared.requestedCommandId === 'install'
  && prepared.targetPackageId === entry.targetPackageId
  && prepared.transactionId === entry.transactionId
  && prepared.transactionLogEntryHash === entry.entryHash
  && prepared.candidateIdentity?.candidateHash === entry.candidateIdentity.candidateHash
  && prepared.lockfileHash === entry.lockfileHash
  && prepared.registryCount === entry.registryCount
  && prepared.entryCount === entry.entryCount
  && prepared.packageCount === entry.packageCount
  && packageListsEqual(prepared.selectedPackageIds, entry.selectedPackageIds)
  && packageListsEqual(prepared.blockedPackageIds, entry.blockedPackageIds)
  && packageListsEqual(prepared.loadOrder, entry.loadOrder)

const readbackCheck = (
  id: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck['id'],
  status: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck['status'],
  reason: string
): ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck =>
  Object.freeze({ id, status, reason })

const buildReadbackChecks = (
  options: {
    readonly prepared: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
    readonly entry?: ThirdPartyDataPackInstallTransactionLogPreparedEntry
    readonly readAvailable: boolean
  }
): readonly ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck[] => {
  const entry = options.entry
  return Object.freeze([
    readbackCheck(
      'prepared-pipeline-prepared',
      options.prepared.status === 'prepared' && options.prepared.transactionLogEntryHash !== undefined
        ? 'satisfied'
        : 'blocked',
      'Web transaction-log readback requires a prepared transaction-log pipeline result.'
    ),
    readbackCheck(
      'transaction-log-read-verification-authorized',
      'satisfied',
      'This Web visible import continuation explicitly authorized contained transaction-log readback.'
    ),
    readbackCheck(
      'program-directory-present',
      options.readAvailable ? 'satisfied' : 'blocked',
      'Web transaction-log readback resolved its IndexedDB transaction-log record instead of a program directory.'
    ),
    readbackCheck(
      'transaction-log-file-readable',
      entry !== undefined ? 'satisfied' : 'blocked',
      'Web transaction-log readback requires the prepared IndexedDB record to be readable.'
    ),
    readbackCheck(
      'entry-hash-matched',
      entry !== undefined && options.prepared.transactionLogEntryHash === entry.entryHash
        ? 'satisfied'
        : 'blocked',
      'Read Web transaction-log entry hash must match the prepared acknowledgement.'
    ),
    readbackCheck(
      'install-target-consistent',
      entry !== undefined
        && options.prepared.targetPackageId === entry.targetPackageId
        && options.prepared.transactionId === entry.transactionId
        ? 'satisfied'
        : 'blocked',
      'Read Web transaction-log entry must target the same install command and transaction id.'
    ),
    readbackCheck(
      'candidate-hash-consistent',
      entry !== undefined
        && options.prepared.candidateIdentity?.candidateHash === entry.candidateIdentity.candidateHash
        ? 'satisfied'
        : 'blocked',
      'Read Web transaction-log entry candidate hash must match the prepared acknowledgement.'
    ),
    readbackCheck(
      'lockfile-hash-consistent',
      entry !== undefined && options.prepared.lockfileHash === entry.lockfileHash
        ? 'satisfied'
        : 'blocked',
      'Read Web transaction-log entry lockfile hash must match the prepared acknowledgement.'
    ),
    readbackCheck(
      'package-summary-consistent',
      entry !== undefined && entryMatchesPreparedResult(entry, options.prepared)
        ? 'satisfied'
        : 'blocked',
      'Read Web transaction-log entry package summary must match the prepared acknowledgement.'
    ),
    readbackCheck(
      'contained-read-effects',
      preparedResultHasContainedEffects(options.prepared) ? 'satisfied' : 'blocked',
      'Web transaction-log readback requires prior write effects to remain contained.'
    )
  ])
}

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck[],
  packageId?: PackageId
): readonly ModDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: `third-party.web-install-transaction-log-prepared-readback.checks.${currentCheck.id}`,
    packageId,
    recovery: 'retry'
  })))

const readVerificationEffects = (
  options: {
    readonly verified: boolean
    readonly prepared: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
  }
): ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult['effects'] =>
  Object.freeze({
    installTransactionLogPreparedPersistentReadVerificationPipelineCalled: true,
    installTransactionLogPreparedPipelineCalled: true,
    transactionLogPrepareAcknowledged: options.prepared.status === 'prepared',
    transactionLogReadVerificationAuthorized: true,
    transactionLogReadVerified: options.verified,
    transactionLogPrepared: options.prepared.effects.transactionLogPrepared,
    transactionLogWritten: options.prepared.effects.transactionLogWritten,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
    uiIpcResponseDelivered: false,
    transactionLogRead: options.verified,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveCacheIsolationChecked: false,
    packageFilesWritten: options.prepared.effects.packageFilesWritten,
    packageBackupsWritten: options.prepared.effects.packageBackupsWritten,
    packageFilesRestored: false,
    lockfileWritten: options.prepared.effects.lockfileWritten,
    lockfileRestored: false,
    settingsWritten: options.prepared.effects.settingsWritten,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    recoveryLogRead: false,
    recoveryLogReplayed: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })

const createReadVerificationResult = (
  options: {
    readonly status: ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult['status']
    readonly reason: string
    readonly prepared: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
    readonly entry?: ThirdPartyDataPackInstallTransactionLogPreparedEntry
    readonly checks: readonly ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationCheck[]
    readonly diagnostics?: readonly ModDiagnostic[]
  }
): ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult =>
  deepFreezeObjectGraph({
    kind: 'third-party-install-transaction-log-prepared-persistent-read-verification-pipeline',
    mode: 'default-disabled-install-transaction-log-prepared-persistent-read-verification-pipeline',
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: true,
    sourceCalled: true,
    authorized: true,
    preparedPipelineStatus: options.prepared.status,
    requestedCommandId: options.prepared.requestedCommandId,
    targetPackageId: options.prepared.targetPackageId,
    selectedPackageIds: [...options.prepared.selectedPackageIds],
    blockedPackageIds: [...options.prepared.blockedPackageIds],
    loadOrder: [...options.prepared.loadOrder],
    registryCount: options.prepared.registryCount,
    entryCount: options.prepared.entryCount,
    packageCount: options.prepared.packageCount,
    candidateIdentity: options.prepared.candidateIdentity,
    lockfileHash: options.prepared.lockfileHash,
    transactionId: options.prepared.transactionId,
    transactionLogEntryHash: options.prepared.transactionLogEntryHash,
    readTransactionLogEntryHash: options.entry?.entryHash,
    checks: options.checks,
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: readVerificationEffects({
      verified: options.status === 'verified',
      prepared: options.prepared
    })
  })

export const verifyThirdPartyDataPackWebInstallTransactionLogPreparedReadBack = async(options: {
  readonly store: ThirdPartyDataPackWebInstallTransactionLogPreparedStore
  readonly prepared: ThirdPartyDataPackInstallTransactionLogPreparedPipelineResult
}): Promise<ThirdPartyDataPackInstallTransactionLogPreparedPersistentReadVerificationResult> => {
  const readResult = await options.store.read()
  const entry = readResult.record?.entry
  const checks = buildReadbackChecks({
    prepared: options.prepared,
    entry,
    readAvailable: readResult.report.status === 'loaded'
  })
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, options.prepared.targetPackageId)

  if (
    readResult.report.status === 'loaded'
    && entry !== undefined
    && entryMatchesPreparedResult(entry, options.prepared)
    && blockedDiagnostics.length === 0
  ) {
    return createReadVerificationResult({
      status: 'verified',
      reason: 'Web install transaction-log prepared entry was read back from IndexedDB and matched the prepared acknowledgement',
      prepared: options.prepared,
      entry,
      checks
    })
  }

  return createReadVerificationResult({
    status: 'failed',
    reason: readResult.report.status === 'failed'
      ? readResult.report.reason
      : 'Web install transaction-log prepared entry could not be verified from IndexedDB',
    prepared: options.prepared,
    entry,
    checks,
    diagnostics: [
      ...readResult.report.diagnostics,
      ...blockedDiagnostics
    ]
  })
}

export const createInMemoryWebInstallTransactionLogPreparedStore =
  (): ThirdPartyDataPackWebInstallTransactionLogPreparedStore => {
    let record: ThirdPartyDataPackWebInstallTransactionLogPreparedRecord | null = null
    return {
      async inspect() {
        return createStoreReport({
          status: 'ready',
          operation: 'inspect',
          reason: 'in-memory Web install transaction-log prepared store resolved'
        })
      },
      async write(entry) {
        record = recordFromEntry(entry)
        return createStoreReport({
          status: 'written',
          operation: 'write',
          reason: 'in-memory Web install transaction-log prepared entry was written',
          record,
          active: true
        })
      },
      async read() {
        return deepFreezeObjectGraph({
          record,
          report: createStoreReport({
            status: record === null ? 'missing' : 'loaded',
            operation: 'read',
            reason: record === null
              ? 'in-memory Web install transaction-log prepared entry is absent'
              : 'in-memory Web install transaction-log prepared entry was read back',
            record: record ?? undefined,
            active: record !== null
          })
        })
      }
    }
  }
