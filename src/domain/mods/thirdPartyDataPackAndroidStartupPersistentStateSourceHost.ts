import { assertPureJsonValue } from './canonicalJson'
import { normalizeContentPackageSourcePath } from './contentPackageSource'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { utf8ByteLength, type Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  AndroidAppDataImportBridgeHost,
  AndroidAppDataImportFileDescriptor
} from './androidAppDataImportBridge'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSnapshotSource,
  ThirdPartyDataPackStartupGatePersistentStateSourceRequest
} from './thirdPartyDataPackStartupGatePersistentStateSourceAdapter'

export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND =
  'android-app-data-startup-persistent-state-source-host'
export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE =
  'android-app-data-readonly-isolated-test'
export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_IMPORT_ID =
  'startup-persistent-state'
export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_DIRECTORY_NAME =
  'mod-startup-state'
export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_FILE_NAME =
  'startup-persistent-state-snapshot.json'
export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_FILE_PATH =
  `${THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_DIRECTORY_NAME}/${THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_FILE_NAME}`
export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_MAX_BYTES =
  16 * 1024 * 1024
export const THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_STORAGE_KIND =
  'android-app-data-startup-persistent-state'

export type ThirdPartyDataPackAndroidStartupPersistentStateSourceHostStatus =
  | 'ready'
  | 'loaded'
  | 'missing'
  | 'blocked'
  | 'failed'
export type ThirdPartyDataPackAndroidStartupPersistentStateSourceHostOperation =
  | 'inspect'
  | 'read'

export interface ThirdPartyDataPackAndroidStartupPersistentStateSourceHostEffects {
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
  readonly androidFilePickerOpened: false
  readonly androidUiBridgeOpened: false
  readonly androidUiResponsePublished: false
  readonly commandDispatched: false
  readonly transactionCommitted: false
  readonly runtimePublicationCommitted: false
  readonly startupPersistentStateSnapshotRead: boolean
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

export interface ThirdPartyDataPackAndroidStartupPersistentStateSourceHostReport {
  readonly status: ThirdPartyDataPackAndroidStartupPersistentStateSourceHostStatus
  readonly operation: ThirdPartyDataPackAndroidStartupPersistentStateSourceHostOperation
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_STORAGE_KIND
  readonly reason: string
  readonly readOnly: true
  readonly persistentStartupReadAllowed: true
  readonly writeAllowed: false
  readonly appDataImportScoped: boolean
  readonly snapshotFilePresent: boolean
  readonly snapshotFileSizeBytes?: number
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackAndroidStartupPersistentStateSourceHostEffects
}

export interface ThirdPartyDataPackAndroidStartupPersistentStateSourceHostReadResult {
  readonly report: ThirdPartyDataPackAndroidStartupPersistentStateSourceHostReport
  readonly snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshotSource | null
}

export interface ThirdPartyDataPackAndroidStartupPersistentStateSourceHostOptions {
  readonly host: AndroidAppDataImportBridgeHost
  readonly importId?: string
}

export interface ThirdPartyDataPackAndroidStartupPersistentStateSourceHost {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE
  inspect(): Promise<ThirdPartyDataPackAndroidStartupPersistentStateSourceHostReport>
  read(
    request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest
  ): Promise<ThirdPartyDataPackStartupGatePersistentStateSnapshotSource>
}

interface AndroidStartupPersistentStateSnapshotFile {
  readonly formatVersion: 1
  readonly kind: 'android-startup-persistent-state-snapshot'
  readonly packageId: PackageId
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly transactionLog: { readonly committed: boolean }
  readonly packageState: { readonly matched: boolean }
  readonly settingsState: { readonly matched: boolean }
  readonly modLockState: { readonly matched: boolean }
  readonly liveRegistry: { readonly matched: boolean }
  readonly saveCache: { readonly isolated: boolean }
}

const sha256Pattern = /^sha256:[0-9a-f]{64}$/
const identifierPattern = /^[A-Za-z0-9._/-]+$/

const createEffects = (
  snapshotRead: boolean
): ThirdPartyDataPackAndroidStartupPersistentStateSourceHostEffects => ({
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
  androidFilePickerOpened: false,
  androidUiBridgeOpened: false,
  androidUiResponsePublished: false,
  commandDispatched: false,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  startupPersistentStateSnapshotRead: snapshotRead,
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
    throw new Error('android startup persistent state importId must be a normalized relative identifier')
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
    readonly status: ThirdPartyDataPackAndroidStartupPersistentStateSourceHostStatus
    readonly operation: ThirdPartyDataPackAndroidStartupPersistentStateSourceHostOperation
    readonly reason: string
    readonly appDataImportScoped?: boolean
    readonly snapshotFilePresent?: boolean
    readonly snapshotFileSizeBytes?: number
    readonly diagnostics?: readonly ModDiagnostic[]
    readonly snapshotRead?: boolean
  }
): ThirdPartyDataPackAndroidStartupPersistentStateSourceHostReport => deepFreezeObjectGraph({
  status: options.status,
  operation: options.operation,
  storageKind: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_STORAGE_KIND,
  reason: options.reason,
  readOnly: true,
  persistentStartupReadAllowed: true,
  writeAllowed: false,
  appDataImportScoped: options.appDataImportScoped ?? false,
  snapshotFilePresent: options.snapshotFilePresent ?? false,
  ...(options.snapshotFileSizeBytes === undefined ? {} : { snapshotFileSizeBytes: options.snapshotFileSizeBytes }),
  diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
  effects: createEffects(options.snapshotRead === true)
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

const readHostMethod = <Name extends keyof AndroidAppDataImportBridgeHost>(
  host: unknown,
  fieldName: Name
): AndroidAppDataImportBridgeHost[Name] | undefined => {
  if (host === null || typeof host !== 'object') return undefined
  const field = readOwnDataField(host, fieldName)
  return typeof field === 'function'
    ? field as AndroidAppDataImportBridgeHost[Name]
    : undefined
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
): AndroidStartupPersistentStateSnapshotFile | undefined => {
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
  const settingsStateMatched = readNestedBoolean(value, 'settingsState', 'matched')
  const modLockStateMatched = readNestedBoolean(value, 'modLockState', 'matched')
  const liveRegistryMatched = readNestedBoolean(value, 'liveRegistry', 'matched')
  const saveCacheIsolated = readNestedBoolean(value, 'saveCache', 'isolated')

  if (
    formatVersion !== 1
    || kind !== 'android-startup-persistent-state-snapshot'
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
    kind: 'android-startup-persistent-state-snapshot',
    packageId: packageId as PackageId,
    candidateIdentity,
    lockfileHash: lockfileHash as Sha256Hash,
    transactionLog: { committed: transactionLogCommitted },
    packageState: { matched: packageStateMatched },
    settingsState: { matched: settingsStateMatched },
    modLockState: { matched: modLockStateMatched },
    liveRegistry: { matched: liveRegistryMatched },
    saveCache: { isolated: saveCacheIsolated }
  })
}

const snapshotMatchesRequest = (
  request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest,
  snapshot: AndroidStartupPersistentStateSnapshotFile
): boolean => snapshot.packageId === request.packageId
  && snapshot.candidateIdentity.candidateHash === request.candidateIdentity.candidateHash
  && snapshot.lockfileHash === request.lockfileHash
  && snapshot.transactionLog.committed === true
  && snapshot.packageState.matched === true
  && snapshot.settingsState.matched === true
  && snapshot.modLockState.matched === true
  && snapshot.liveRegistry.matched === true
  && snapshot.saveCache.isolated === true

const toSnapshotSource = (
  snapshot: AndroidStartupPersistentStateSnapshotFile
): ThirdPartyDataPackStartupGatePersistentStateSnapshotSource => Object.freeze({
  kind: 'startup-persistent-state-snapshot',
  settled: true,
  packageId: snapshot.packageId,
  candidateIdentity: snapshot.candidateIdentity,
  lockfileHash: snapshot.lockfileHash,
  transactionLogCommitted: snapshot.transactionLog.committed,
  packageStateMatched: snapshot.packageState.matched,
  settingsStateMatched: snapshot.settingsState.matched,
  modLockStateMatched: snapshot.modLockState.matched,
  liveRegistryMatched: snapshot.liveRegistry.matched,
  saveCacheIsolated: snapshot.saveCache.isolated,
  messageKey: 'mods.startup.persistent.state.android.ready',
  recovery: 'none',
  retryable: false,
  rollbackRequired: false
})

const normalizeDescriptorPath = (path: string): string => {
  if (
    path === ''
    || path.includes('\\')
    || path.startsWith('/')
    || /^[A-Za-z]:[\\/]/.test(path)
    || /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(path)
  ) {
    throw new Error('android startup persistent state descriptor path is unsafe')
  }
  const normalized = normalizeContentPackageSourcePath(path)
  if (normalized === '' || normalized !== path) {
    throw new Error('android startup persistent state descriptor path is unsafe')
  }
  return normalized
}

const cloneDescriptor = (
  value: unknown
): AndroidAppDataImportFileDescriptor | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const relativePath = readOwnStringField(value, 'relativePath')
  if (relativePath === undefined) return undefined
  const normalizedPath = normalizeDescriptorPath(relativePath)
  const sizeBytes = readOwnDataField(value, 'sizeBytes')
  if (
    sizeBytes !== undefined
    && (
      typeof sizeBytes !== 'number'
      || !Number.isSafeInteger(sizeBytes)
      || sizeBytes < 0
    )
  ) {
    return undefined
  }
  return Object.freeze({
    relativePath: normalizedPath,
    ...(sizeBytes === undefined ? {} : { sizeBytes })
  })
}

const cloneDescriptors = (
  files: readonly AndroidAppDataImportFileDescriptor[]
): readonly AndroidAppDataImportFileDescriptor[] | undefined => {
  if (!Array.isArray(files)) return undefined
  let lengthDescriptor: PropertyDescriptor | undefined
  try {
    lengthDescriptor = Reflect.getOwnPropertyDescriptor(files, 'length')
  } catch {
    return undefined
  }
  if (
    lengthDescriptor === undefined
    || !('value' in lengthDescriptor)
    || typeof lengthDescriptor.value !== 'number'
    || !Number.isSafeInteger(lengthDescriptor.value)
    || lengthDescriptor.value < 0
  ) {
    return undefined
  }
  const result: AndroidAppDataImportFileDescriptor[] = []
  for (let index = 0; index < lengthDescriptor.value; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(files, String(index))
    } catch {
      return undefined
    }
    if (descriptor?.enumerable !== true || !('value' in descriptor)) return undefined
    let file: AndroidAppDataImportFileDescriptor | undefined
    try {
      file = cloneDescriptor(descriptor.value)
    } catch {
      return undefined
    }
    if (file === undefined) return undefined
    result.push(file)
  }
  return Object.freeze(result)
}

const findSnapshotFile = (
  files: readonly AndroidAppDataImportFileDescriptor[]
): AndroidAppDataImportFileDescriptor | undefined => files.find(file =>
  file.relativePath === THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_FILE_PATH
)

export const readThirdPartyDataPackAndroidStartupPersistentStateSnapshot = async(
  options: {
    readonly host: AndroidAppDataImportBridgeHost
    readonly importId?: string
    readonly request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest
  }
): Promise<ThirdPartyDataPackAndroidStartupPersistentStateSourceHostReadResult> => {
  let importId: string
  try {
    importId = normalizeImportId(options.importId ?? THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_IMPORT_ID)
  } catch (error) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'failed',
        operation: 'read',
        reason: 'android startup persistent state source import id could not be resolved',
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.android.import-id', {
            errorName: errorName(error)
          })
        ]
      }),
      snapshot: null
    })
  }

  const listImportedFiles = readHostMethod(options.host, 'listImportedFiles')
  const readImportedText = readHostMethod(options.host, 'readImportedText')
  if (listImportedFiles === undefined || readImportedText === undefined) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'failed',
        operation: 'read',
        reason: 'android startup persistent state app-data host is not readable',
        appDataImportScoped: true,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.android.host')
        ]
      }),
      snapshot: null
    })
  }

  let files: readonly AndroidAppDataImportFileDescriptor[]
  try {
    files = await listImportedFiles.call(options.host, importId)
  } catch (error) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'failed',
        operation: 'read',
        reason: 'android startup persistent state app-data files could not be listed',
        appDataImportScoped: true,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.android.list', {
            errorName: errorName(error)
          })
        ]
      }),
      snapshot: null
    })
  }

  const descriptors = cloneDescriptors(files)
  if (descriptors === undefined) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'blocked',
        operation: 'read',
        reason: 'android startup persistent state app-data file metadata is invalid',
        appDataImportScoped: true,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.android.metadata')
        ]
      }),
      snapshot: null
    })
  }

  const snapshotFile = findSnapshotFile(descriptors)
  if (snapshotFile === undefined) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'missing',
        operation: 'read',
        reason: 'android startup persistent state snapshot file is absent',
        appDataImportScoped: true,
        snapshotFilePresent: false
      }),
      snapshot: null
    })
  }

  if (
    snapshotFile.sizeBytes !== undefined
    && snapshotFile.sizeBytes > THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_MAX_BYTES
  ) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'blocked',
        operation: 'read',
        reason: 'android startup persistent state snapshot file exceeds the size limit',
        appDataImportScoped: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes: snapshotFile.sizeBytes,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.android.size', {
            size: snapshotFile.sizeBytes,
            maxBytes: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_MAX_BYTES
          })
        ]
      }),
      snapshot: null
    })
  }

  let text: string
  try {
    text = await readImportedText.call(options.host, importId, snapshotFile.relativePath)
  } catch (error) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'failed',
        operation: 'read',
        reason: 'android startup persistent state snapshot file could not be read',
        appDataImportScoped: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes: snapshotFile.sizeBytes,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.android.read', {
            errorName: errorName(error)
          })
        ]
      }),
      snapshot: null
    })
  }

  const actualSizeBytes = utf8ByteLength(text)
  const snapshotFileSizeBytes = snapshotFile.sizeBytes ?? actualSizeBytes
  if (actualSizeBytes > THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_MAX_BYTES) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'blocked',
        operation: 'read',
        reason: 'android startup persistent state snapshot file exceeds the size limit',
        appDataImportScoped: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes: actualSizeBytes,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.android.size', {
            size: actualSizeBytes,
            maxBytes: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_MAX_BYTES
          })
        ]
      }),
      snapshot: null
    })
  }

  if (snapshotFile.sizeBytes !== undefined && snapshotFile.sizeBytes !== actualSizeBytes) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'blocked',
        operation: 'read',
        reason: 'android startup persistent state snapshot file size metadata does not match payload size',
        appDataImportScoped: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.android.size-mismatch')
        ]
      }),
      snapshot: null
    })
  }

  const parsed = parseSnapshotFile(text)
  if (parsed === undefined) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'blocked',
        operation: 'read',
        reason: 'android startup persistent state snapshot file structure is invalid',
        appDataImportScoped: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes,
        snapshotRead: true,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.android.structure')
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
        reason: 'android startup persistent state snapshot does not match the startup request identity or required proofs',
        appDataImportScoped: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes,
        snapshotRead: true,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.android.identity')
        ]
      }),
      snapshot: null
    })
  }

  return deepFreezeObjectGraph({
    report: createReport({
      status: 'loaded',
      operation: 'read',
      reason: 'android startup persistent state snapshot was loaded from app data',
      appDataImportScoped: true,
      snapshotFilePresent: true,
      snapshotFileSizeBytes,
      snapshotRead: true
    }),
    snapshot: toSnapshotSource(parsed)
  })
}

export const createThirdPartyDataPackAndroidStartupPersistentStateSourceHost = (
  options: ThirdPartyDataPackAndroidStartupPersistentStateSourceHostOptions
): ThirdPartyDataPackAndroidStartupPersistentStateSourceHost => ({
  kind: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
  mode: THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE,
  async inspect() {
    try {
      normalizeImportId(options.importId ?? THIRD_PARTY_DATA_PACK_ANDROID_STARTUP_PERSISTENT_STATE_IMPORT_ID)
      if (
        readHostMethod(options.host, 'listImportedFiles') === undefined
        || readHostMethod(options.host, 'readImportedText') === undefined
      ) {
        throw new Error('android startup persistent state app-data host is not readable')
      }
      return createReport({
        status: 'ready',
        operation: 'inspect',
        reason: 'android startup persistent state source is scoped to one app-data import',
        appDataImportScoped: true
      })
    } catch (error) {
      return createReport({
        status: 'failed',
        operation: 'inspect',
        reason: 'android startup persistent state source could not be resolved',
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.android.inspect', {
            errorName: errorName(error)
          })
        ]
      })
    }
  },
  async read(request) {
    const result = await readThirdPartyDataPackAndroidStartupPersistentStateSnapshot({
      host: options.host,
      importId: options.importId,
      request
    })
    if (result.snapshot === null) {
      throw new Error(result.report.reason)
    }
    return result.snapshot
  }
})
