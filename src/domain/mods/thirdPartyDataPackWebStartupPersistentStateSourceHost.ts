import { assertPureJsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSnapshotSource,
  ThirdPartyDataPackStartupGatePersistentStateSourceRequest
} from './thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import {
  type WebIndexedDbImportPersistenceStore,
  type WebIndexedDbImportFileRecord
} from './webIndexedDbImportPersistence'
import {
  THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
  type ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord,
  type ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
} from './thirdPartyDataPackWebSettingsLockfilePersistentWriterHost'

export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND =
  'web-indexeddb-startup-persistent-state-source-host'
export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE =
  'web-indexeddb-readonly-isolated-test'
export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID =
  'startup-persistent-state'
export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_DIRECTORY_NAME =
  'mod-startup-state'
export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_NAME =
  'startup-persistent-state-snapshot.json'
export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH =
  `${THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_DIRECTORY_NAME}/${THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_NAME}`
export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_MAX_BYTES =
  16 * 1024 * 1024
export const THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_STORAGE_KIND =
  'web-indexeddb-startup-persistent-state'

export type ThirdPartyDataPackWebStartupPersistentStateSourceHostStatus =
  | 'ready'
  | 'loaded'
  | 'missing'
  | 'blocked'
  | 'failed'
export type ThirdPartyDataPackWebStartupPersistentStateSourceHostOperation =
  | 'inspect'
  | 'read'

export interface ThirdPartyDataPackWebStartupPersistentStateSourceHostEffects {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly modManagementUiMounted: false
  readonly launcherAppMounted: false
  readonly gameAppCreated: false
  readonly piniaCreated: false
  readonly routerMounted: false
  readonly webFilePickerOpened: false
  readonly webUiBridgeOpened: false
  readonly webUiResponsePublished: false
  readonly commandDispatched: false
  readonly transactionCommitted: false
  readonly runtimePublicationCommitted: false
  readonly startupPersistentStateSnapshotRead: boolean
  readonly settingsStateRead: boolean
  readonly modLockStateRead: boolean
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: false
  readonly lockfileWritten: false
  readonly lockfileRestored: false
  readonly settingsWritten: false
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackWebStartupPersistentStateSourceHostReport {
  readonly status: ThirdPartyDataPackWebStartupPersistentStateSourceHostStatus
  readonly operation: ThirdPartyDataPackWebStartupPersistentStateSourceHostOperation
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_STORAGE_KIND
  readonly reason: string
  readonly readOnly: true
  readonly persistentStartupReadAllowed: true
  readonly writeAllowed: false
  readonly indexedDbRecordScoped: boolean
  readonly snapshotFilePresent: boolean
  readonly settingsLockfileRecordPresent: boolean
  readonly settingsLockfileRecordRead: boolean
  readonly modLockDraftRead: boolean
  readonly snapshotFileSizeBytes?: number
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackWebStartupPersistentStateSourceHostEffects
}

export interface ThirdPartyDataPackWebStartupPersistentStateSourceHostReadResult {
  readonly report: ThirdPartyDataPackWebStartupPersistentStateSourceHostReport
  readonly snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshotSource | null
}

export interface ThirdPartyDataPackWebStartupPersistentStateSourceHostOptions {
  readonly store: WebIndexedDbImportPersistenceStore
  readonly settingsLockfileStore?: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
  readonly importId?: string
}

export interface ThirdPartyDataPackWebStartupPersistentStateSourceHost {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE
  inspect(): Promise<ThirdPartyDataPackWebStartupPersistentStateSourceHostReport>
  read(
    request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest
  ): Promise<ThirdPartyDataPackStartupGatePersistentStateSnapshotSource>
}

interface WebStartupPersistentStateSnapshotFile {
  readonly formatVersion: 1
  readonly kind: 'web-startup-persistent-state-snapshot'
  readonly packageId: PackageId
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly transactionLog: { readonly committed: boolean }
  readonly packageState: { readonly matched: boolean, readonly removed?: boolean }
  readonly settingsState: { readonly matched: boolean }
  readonly modLockState: { readonly matched: boolean }
  readonly liveRegistry: { readonly matched: boolean }
  readonly saveCache: { readonly isolated: boolean }
}

const sha256Pattern = /^sha256:[0-9a-f]{64}$/
const identifierPattern = /^[A-Za-z0-9._/-]+$/

const createEffects = (
  snapshotRead: boolean,
  settingsRead: boolean,
  modLockRead: boolean
): ThirdPartyDataPackWebStartupPersistentStateSourceHostEffects => ({
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
  webFilePickerOpened: false,
  webUiBridgeOpened: false,
  webUiResponsePublished: false,
  commandDispatched: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  startupPersistentStateSnapshotRead: snapshotRead,
  settingsStateRead: settingsRead,
  modLockStateRead: modLockRead,
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

const diagnostic = (
  stage: string,
  details: Record<string, string | number | boolean | null> = {}
): ModDiagnostic => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
  stage,
  details,
  recovery: 'retry'
})

const errorName = (error: unknown): string =>
  error instanceof Error ? error.name : typeof error

const normalizeImportId = (value: string): string => {
  if (
    value === ''
    || value.includes('\\')
    || value.startsWith('/')
    || value.includes('..')
    || !identifierPattern.test(value)
  ) {
    throw new Error('web startup persistent state importId must be a normalized relative identifier')
  }
  return value
}

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    if (!Object.isFrozen(value)) Object.freeze(value)
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
  }
  return value
}

const createReport = (
  options: {
    readonly status: ThirdPartyDataPackWebStartupPersistentStateSourceHostStatus
    readonly operation: ThirdPartyDataPackWebStartupPersistentStateSourceHostOperation
    readonly reason: string
    readonly indexedDbRecordScoped?: boolean
    readonly snapshotFilePresent?: boolean
    readonly snapshotFileSizeBytes?: number
    readonly settingsLockfileRecordPresent?: boolean
    readonly settingsLockfileRecordRead?: boolean
    readonly modLockDraftRead?: boolean
    readonly diagnostics?: readonly ModDiagnostic[]
    readonly snapshotRead?: boolean
    readonly settingsRead?: boolean
    readonly modLockRead?: boolean
  }
): ThirdPartyDataPackWebStartupPersistentStateSourceHostReport => deepFreezeObjectGraph({
  status: options.status,
  operation: options.operation,
  storageKind: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_STORAGE_KIND,
  reason: options.reason,
  readOnly: true,
  persistentStartupReadAllowed: true,
  writeAllowed: false,
  indexedDbRecordScoped: options.indexedDbRecordScoped ?? false,
  snapshotFilePresent: options.snapshotFilePresent ?? false,
  settingsLockfileRecordPresent: options.settingsLockfileRecordPresent ?? false,
  settingsLockfileRecordRead: options.settingsLockfileRecordRead ?? false,
  modLockDraftRead: options.modLockDraftRead ?? false,
  ...(options.snapshotFileSizeBytes === undefined ? {} : { snapshotFileSizeBytes: options.snapshotFileSizeBytes }),
  diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
  effects: createEffects(
    options.snapshotRead === true,
    options.settingsRead === true,
    options.modLockRead === true
  )
})

const readOwnDataField = (
  value: object,
  fieldName: string
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnNumberField = (
  value: object,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

const readOwnBooleanField = (
  value: object,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const cloneCandidateIdentity = (
  value: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  if (value === null || value === undefined || typeof value !== 'object') return undefined
  const formatVersion = readOwnNumberField(value, 'formatVersion')
  const contentHash = readOwnStringField(value, 'contentHash')
  const snapshotHash = readOwnStringField(value, 'snapshotHash')
  const candidateHash = readOwnStringField(value, 'candidateHash')
  if (
    formatVersion !== 1
    || contentHash === undefined
    || snapshotHash === undefined
    || candidateHash === undefined
    || !sha256Pattern.test(contentHash)
    || !sha256Pattern.test(snapshotHash)
    || !sha256Pattern.test(candidateHash)
  ) {
    return undefined
  }
  return Object.freeze({
    formatVersion: 1,
    contentHash: contentHash as Sha256Hash,
    snapshotHash: snapshotHash as Sha256Hash,
    candidateHash: candidateHash as Sha256Hash
  })
}

const readNestedBoolean = (
  value: object,
  sectionName: string,
  fieldName: string
): boolean | undefined => {
  const section = readOwnDataField(value, sectionName)
  return section !== null && section !== undefined && typeof section === 'object'
    ? readOwnBooleanField(section, fieldName)
    : undefined
}

const parseSnapshotFile = (
  text: string
): WebStartupPersistentStateSnapshotFile | undefined => {
  let value: unknown
  try {
    value = JSON.parse(text) as unknown
    assertPureJsonValue(value)
  } catch {
    return undefined
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined

  const formatVersion = readOwnNumberField(value, 'formatVersion')
  const kind = readOwnStringField(value, 'kind')
  const packageId = readOwnStringField(value, 'packageId')
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(value, 'candidateIdentity'))
  const lockfileHash = readOwnStringField(value, 'lockfileHash')
  const transactionLogCommitted = readNestedBoolean(value, 'transactionLog', 'committed')
  const packageStateMatched = readNestedBoolean(value, 'packageState', 'matched')
  const packageStateRemoved = readNestedBoolean(value, 'packageState', 'removed')
  const settingsStateMatched = readNestedBoolean(value, 'settingsState', 'matched')
  const modLockStateMatched = readNestedBoolean(value, 'modLockState', 'matched')
  const liveRegistryMatched = readNestedBoolean(value, 'liveRegistry', 'matched')
  const saveCacheIsolated = readNestedBoolean(value, 'saveCache', 'isolated')

  if (
    formatVersion !== 1
    || kind !== 'web-startup-persistent-state-snapshot'
    || packageId === undefined
    || candidateIdentity === undefined
    || lockfileHash === undefined
    || !sha256Pattern.test(lockfileHash)
    || transactionLogCommitted === undefined
    || packageStateMatched === undefined
    || settingsStateMatched === undefined
    || modLockStateMatched === undefined
    || liveRegistryMatched === undefined
    || saveCacheIsolated === undefined
  ) {
    return undefined
  }

  return deepFreezeObjectGraph({
    formatVersion: 1,
    kind: 'web-startup-persistent-state-snapshot',
    packageId: packageId as PackageId,
    candidateIdentity,
    lockfileHash: lockfileHash as Sha256Hash,
    transactionLog: { committed: transactionLogCommitted },
    packageState: {
      matched: packageStateMatched,
      ...(packageStateRemoved === undefined ? {} : { removed: packageStateRemoved })
    },
    settingsState: { matched: settingsStateMatched },
    modLockState: { matched: modLockStateMatched },
    liveRegistry: { matched: liveRegistryMatched },
    saveCache: { isolated: saveCacheIsolated }
  })
}

const snapshotMatchesRequest = (
  request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest,
  snapshot: WebStartupPersistentStateSnapshotFile
): boolean => snapshot.packageId === request.packageId
  && snapshot.candidateIdentity.candidateHash === request.candidateIdentity.candidateHash
  && snapshot.lockfileHash === request.lockfileHash
  && snapshot.transactionLog.committed === true
  && snapshot.packageState.matched === true
  && (request.commandId !== 'uninstall' || snapshot.packageState.removed === true)
  && snapshot.settingsState.matched === true
  && snapshot.modLockState.matched === true
  && snapshot.liveRegistry.matched === true
  && snapshot.saveCache.isolated === true

const arraysEqual = <T>(left: readonly T[], right: readonly T[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const settingsLockfileRecordMatchesRequest = (
  request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest,
  record: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord
): boolean => record.recordId === THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID
  && record.requestedCommandId === request.commandId
  && record.targetPackageId === request.packageId
  && record.candidateHash === request.candidateIdentity.candidateHash
  && record.lockfileHash === request.lockfileHash
  && arraysEqual(record.selectedPackageIds, request.selectedPackageIds)
  && arraysEqual(record.blockedPackageIds, request.blockedPackageIds)
  && arraysEqual(record.loadOrder, request.loadOrder)
  && record.lockfileDraft.lockfileHash === request.lockfileHash
  && record.lockfileDraft.candidateIdentity.candidateHash === request.candidateIdentity.candidateHash
  && record.lockfileDraft.registryCount === request.registryCount
  && record.lockfileDraft.entryCount === request.entryCount
  && record.lockfileDraft.packages.length === request.packageCount
  && arraysEqual(record.lockfileDraft.selectedPackageIds, request.selectedPackageIds)
  && arraysEqual(record.lockfileDraft.loadOrder, request.loadOrder)

const toSnapshotSource = (
  snapshot: WebStartupPersistentStateSnapshotFile
): ThirdPartyDataPackStartupGatePersistentStateSnapshotSource => Object.freeze({
  kind: 'startup-persistent-state-snapshot',
  settled: true,
  packageId: snapshot.packageId,
  candidateIdentity: snapshot.candidateIdentity,
  lockfileHash: snapshot.lockfileHash,
  transactionLogCommitted: snapshot.transactionLog.committed,
  packageStateMatched: snapshot.packageState.matched,
  ...(snapshot.packageState.removed === undefined
    ? {}
    : { packageStateRemoved: snapshot.packageState.removed }),
  settingsStateMatched: snapshot.settingsState.matched,
  modLockStateMatched: snapshot.modLockState.matched,
  liveRegistryMatched: snapshot.liveRegistry.matched,
  saveCacheIsolated: snapshot.saveCache.isolated,
  messageKey: 'mods.startup.persistent.state.web.ready',
  recovery: 'none',
  retryable: false,
  rollbackRequired: false
})

const findSnapshotFile = (
  files: readonly WebIndexedDbImportFileRecord[]
): WebIndexedDbImportFileRecord | undefined => files.find(file =>
  file.path === THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_FILE_PATH
)

export const readThirdPartyDataPackWebStartupPersistentStateSnapshot = async(
  options: {
    readonly store: WebIndexedDbImportPersistenceStore
    readonly settingsLockfileStore?: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
    readonly importId?: string
    readonly request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest
  }
): Promise<ThirdPartyDataPackWebStartupPersistentStateSourceHostReadResult> => {
  let importId: string
  try {
    importId = normalizeImportId(options.importId ?? THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID)
  } catch (error) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'failed',
        operation: 'read',
        reason: 'web startup persistent state source import id could not be resolved',
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.web.import-id', {
            errorName: errorName(error)
          })
        ]
      }),
      snapshot: null
    })
  }

  let record
  try {
    record = await options.store.get(importId)
  } catch (error) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'failed',
        operation: 'read',
        reason: 'web startup persistent state IndexedDB record could not be read',
        indexedDbRecordScoped: true,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.web.indexeddb-read', {
            errorName: errorName(error)
          })
        ]
      }),
      snapshot: null
    })
  }

  if (record === null) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'missing',
        operation: 'read',
        reason: 'web startup persistent state IndexedDB record is absent',
        indexedDbRecordScoped: true,
        snapshotFilePresent: false
      }),
      snapshot: null
    })
  }

  const snapshotFile = findSnapshotFile(record.files)
  if (snapshotFile === undefined) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'missing',
        operation: 'read',
        reason: 'web startup persistent state snapshot file is absent',
        indexedDbRecordScoped: true,
        snapshotFilePresent: false
      }),
      snapshot: null
    })
  }

  if (snapshotFile.sizeBytes > THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_MAX_BYTES) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'blocked',
        operation: 'read',
        reason: 'web startup persistent state snapshot file exceeds the size limit',
        indexedDbRecordScoped: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes: snapshotFile.sizeBytes,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.web.size', {
            size: snapshotFile.sizeBytes,
            maxBytes: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_MAX_BYTES
          })
        ]
      }),
      snapshot: null
    })
  }

  const parsed = parseSnapshotFile(snapshotFile.text)
  if (parsed === undefined) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'blocked',
        operation: 'read',
        reason: 'web startup persistent state snapshot file structure is invalid',
        indexedDbRecordScoped: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes: snapshotFile.sizeBytes,
        snapshotRead: true,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.web.structure')
        ]
      }),
      snapshot: null
    })
  }

  if (!snapshotMatchesRequest(options.request, parsed)) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'blocked',
        operation: 'read',
        reason: 'web startup persistent state snapshot does not match the startup request identity or required proofs',
        indexedDbRecordScoped: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes: snapshotFile.sizeBytes,
        snapshotRead: true,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.web.identity')
        ]
      }),
      snapshot: null
    })
  }

  if (options.settingsLockfileStore !== undefined) {
    let settingsLockfileRead
    try {
      settingsLockfileRead = await options.settingsLockfileStore.read()
    } catch (error) {
      return deepFreezeObjectGraph({
        report: createReport({
          status: 'failed',
          operation: 'read',
          reason: 'web startup settings-lockfile state record could not be read',
          indexedDbRecordScoped: true,
          snapshotFilePresent: true,
          snapshotFileSizeBytes: snapshotFile.sizeBytes,
          snapshotRead: true,
          diagnostics: [
            diagnostic('third-party.startup-persistent-state.web.settings-lockfile-read', {
              errorName: errorName(error)
            })
          ]
        }),
        snapshot: null
      })
    }

    if (settingsLockfileRead.record === null) {
      return deepFreezeObjectGraph({
        report: createReport({
          status: 'blocked',
          operation: 'read',
          reason: 'web startup settings-lockfile state record is absent',
          indexedDbRecordScoped: true,
          snapshotFilePresent: true,
          snapshotFileSizeBytes: snapshotFile.sizeBytes,
          snapshotRead: true,
          diagnostics: [
            diagnostic('third-party.startup-persistent-state.web.settings-lockfile-missing')
          ]
        }),
        snapshot: null
      })
    }

    if (settingsLockfileRead.report.status !== 'ready') {
      return deepFreezeObjectGraph({
        report: createReport({
          status: 'failed',
          operation: 'read',
          reason: 'web startup settings-lockfile state record could not be validated',
          indexedDbRecordScoped: true,
          snapshotFilePresent: true,
          snapshotFileSizeBytes: snapshotFile.sizeBytes,
          snapshotRead: true,
          diagnostics: [
            diagnostic('third-party.startup-persistent-state.web.settings-lockfile-invalid', {
              storeStatus: settingsLockfileRead.report.status
            })
          ]
        }),
        snapshot: null
      })
    }

    if (!settingsLockfileRecordMatchesRequest(options.request, settingsLockfileRead.record)) {
      return deepFreezeObjectGraph({
        report: createReport({
          status: 'blocked',
          operation: 'read',
          reason: 'web startup settings-lockfile state does not match the startup request identity',
          indexedDbRecordScoped: true,
          snapshotFilePresent: true,
          snapshotFileSizeBytes: snapshotFile.sizeBytes,
          snapshotRead: true,
          settingsLockfileRecordPresent: true,
          settingsLockfileRecordRead: true,
          modLockDraftRead: true,
          settingsRead: true,
          modLockRead: true,
          diagnostics: [
            diagnostic('third-party.startup-persistent-state.web.settings-lockfile-identity')
          ]
        }),
        snapshot: null
      })
    }
  }

  return deepFreezeObjectGraph({
    report: createReport({
      status: 'loaded',
      operation: 'read',
      reason: options.settingsLockfileStore === undefined
        ? 'web startup persistent state snapshot was loaded from IndexedDB'
        : 'web startup persistent state snapshot and settings-lockfile were loaded from IndexedDB',
      indexedDbRecordScoped: true,
      snapshotFilePresent: true,
      snapshotFileSizeBytes: snapshotFile.sizeBytes,
      snapshotRead: true,
      settingsLockfileRecordPresent: options.settingsLockfileStore !== undefined,
      settingsLockfileRecordRead: options.settingsLockfileStore !== undefined,
      modLockDraftRead: options.settingsLockfileStore !== undefined,
      settingsRead: options.settingsLockfileStore !== undefined,
      modLockRead: options.settingsLockfileStore !== undefined
    }),
    snapshot: toSnapshotSource(parsed)
  })
}

export const createThirdPartyDataPackWebStartupPersistentStateSourceHost = (
  options: ThirdPartyDataPackWebStartupPersistentStateSourceHostOptions
): ThirdPartyDataPackWebStartupPersistentStateSourceHost => ({
  kind: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
  mode: THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE,
  async inspect() {
    try {
      normalizeImportId(options.importId ?? THIRD_PARTY_DATA_PACK_WEB_STARTUP_PERSISTENT_STATE_IMPORT_ID)
      return createReport({
        status: 'ready',
        operation: 'inspect',
        reason: 'web startup persistent state source is scoped to one IndexedDB record',
        indexedDbRecordScoped: true
      })
    } catch (error) {
      return createReport({
        status: 'failed',
        operation: 'inspect',
        reason: 'web startup persistent state source import id could not be resolved',
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.web.inspect', {
            errorName: errorName(error)
          })
        ]
      })
    }
  },
  async read(request) {
    const result = await readThirdPartyDataPackWebStartupPersistentStateSnapshot({
      store: options.store,
      settingsLockfileStore: options.settingsLockfileStore,
      importId: options.importId,
      request
    })
    if (result.snapshot === null) {
      throw new Error(result.report.reason)
    }
    return result.snapshot
  }
})
