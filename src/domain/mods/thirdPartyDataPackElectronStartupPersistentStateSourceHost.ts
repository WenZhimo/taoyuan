import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
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
  parseThirdPartyDataPackModLockText,
  THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME,
  THIRD_PARTY_DATA_PACK_MOD_LOCK_MAX_BYTES
} from './thirdPartyDataPackModLockFile'
import type {
  ThirdPartyDataPackLockfileDraft
} from './thirdPartyDataPackLockfileDraft'

export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND =
  'electron-program-directory-startup-persistent-state-source-host'
export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE =
  'electron-program-directory-readonly-isolated-test'
export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_USERDATA_DIRECTORY_NAME =
  'userdata'
export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_DIRECTORY_NAME =
  'mod-startup-state'
export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_FILE_NAME =
  'startup-persistent-state-snapshot.json'
export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_MAX_BYTES =
  16 * 1024 * 1024
export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_STORAGE_KIND =
  'electron-program-directory-userdata-startup-persistent-state'
export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_SETTINGS_FILE_NAME = 'settings.json'
export const THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_SETTINGS_MAX_BYTES = 16 * 1024 * 1024

export type ThirdPartyDataPackElectronStartupPersistentStateSourceHostStatus =
  | 'ready'
  | 'loaded'
  | 'missing'
  | 'blocked'
  | 'failed'
export type ThirdPartyDataPackElectronStartupPersistentStateSourceHostOperation =
  | 'inspect'
  | 'read'
export type ThirdPartyDataPackElectronStartupPersistentStateProgramDirectoryProvider =
  | string
  | (() => string | Promise<string>)

export interface ThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths {
  readonly programDirectoryPath: string
  readonly userDataPath: string
  readonly startupStateDirectoryPath: string
  readonly snapshotFilePath: string
  readonly settingsFilePath: string
  readonly modLockFilePath: string
}

export interface ThirdPartyDataPackElectronStartupPersistentStateSourceHostEffects {
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
  readonly electronIpcExposed: false
  readonly electronIpcResponseSent: false
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

export interface ThirdPartyDataPackElectronStartupPersistentStateSourceHostReport {
  readonly status: ThirdPartyDataPackElectronStartupPersistentStateSourceHostStatus
  readonly operation: ThirdPartyDataPackElectronStartupPersistentStateSourceHostOperation
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_STORAGE_KIND
  readonly reason: string
  readonly readOnly: true
  readonly persistentStartupReadAllowed: true
  readonly writeAllowed: false
  readonly programDirectoryContained: boolean
  readonly snapshotFilePresent: boolean
  readonly snapshotFileSizeBytes?: number
  readonly settingsFileRead: boolean
  readonly modLockFileRead: boolean
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackElectronStartupPersistentStateSourceHostEffects
}

interface ElectronStartupSettingsSummary {
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly selectedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
}

export interface ThirdPartyDataPackElectronStartupPersistentStateSourceHostReadResult {
  readonly report: ThirdPartyDataPackElectronStartupPersistentStateSourceHostReport
  readonly snapshot: ThirdPartyDataPackStartupGatePersistentStateSnapshotSource | null
}

export interface ThirdPartyDataPackElectronStartupPersistentStateSourceFileSystem {
  readonly stat: (filePath: string) => Promise<{ readonly size: number }>
  readonly readFile: (filePath: string, encoding: 'utf8') => Promise<string>
}

export interface ThirdPartyDataPackElectronStartupPersistentStateSourceHostOptions {
  readonly programDirectoryPath: ThirdPartyDataPackElectronStartupPersistentStateProgramDirectoryProvider
  readonly fileSystem?: Partial<ThirdPartyDataPackElectronStartupPersistentStateSourceFileSystem>
}

export interface ThirdPartyDataPackElectronStartupPersistentStateSourceHost {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE
  inspect(): Promise<ThirdPartyDataPackElectronStartupPersistentStateSourceHostReport>
  read(
    request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest
  ): Promise<ThirdPartyDataPackStartupGatePersistentStateSnapshotSource>
}

interface ElectronStartupPersistentStateSnapshotFile {
  readonly formatVersion: 1
  readonly kind: 'electron-startup-persistent-state-snapshot'
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

const fileSystem = (
  options: ThirdPartyDataPackElectronStartupPersistentStateSourceHostOptions
): ThirdPartyDataPackElectronStartupPersistentStateSourceFileSystem => ({
  stat: async(filePath) => stat(filePath),
  readFile: async(filePath, encoding) => readFile(filePath, encoding),
  ...options.fileSystem
})

const createEffects = (
  snapshotRead: boolean,
  settingsRead = false,
  modLockRead = false
): ThirdPartyDataPackElectronStartupPersistentStateSourceHostEffects => ({
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
  electronIpcExposed: false,
  electronIpcResponseSent: false,
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

const isNotFound = (error: unknown): boolean =>
  error !== null
  && typeof error === 'object'
  && 'code' in error
  && (error as { code?: unknown }).code === 'ENOENT'

const errorName = (error: unknown): string =>
  error instanceof Error ? error.name : typeof error

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
    readonly status: ThirdPartyDataPackElectronStartupPersistentStateSourceHostStatus
    readonly operation: ThirdPartyDataPackElectronStartupPersistentStateSourceHostOperation
    readonly reason: string
    readonly programDirectoryContained?: boolean
    readonly snapshotFilePresent?: boolean
    readonly snapshotFileSizeBytes?: number
    readonly diagnostics?: readonly ModDiagnostic[]
    readonly snapshotRead?: boolean
    readonly settingsRead?: boolean
    readonly modLockRead?: boolean
  }
): ThirdPartyDataPackElectronStartupPersistentStateSourceHostReport => deepFreezeObjectGraph({
  status: options.status,
  operation: options.operation,
  storageKind: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_STORAGE_KIND,
  reason: options.reason,
  readOnly: true,
  persistentStartupReadAllowed: true,
  writeAllowed: false,
  programDirectoryContained: options.programDirectoryContained ?? false,
  snapshotFilePresent: options.snapshotFilePresent ?? false,
  ...(options.snapshotFileSizeBytes === undefined ? {} : { snapshotFileSizeBytes: options.snapshotFileSizeBytes }),
  settingsFileRead: options.settingsRead === true,
  modLockFileRead: options.modLockRead === true,
  diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
  effects: createEffects(
    options.snapshotRead === true,
    options.settingsRead === true,
    options.modLockRead === true
  )
})

const assertInsideProgramDirectory = (
  programDirectoryPath: string,
  candidate: string
): void => {
  const relative = path.relative(path.resolve(programDirectoryPath), path.resolve(candidate))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('electron startup persistent state path escaped its program directory')
  }
}

const resolveProgramDirectoryPath = async(
  provider: ThirdPartyDataPackElectronStartupPersistentStateProgramDirectoryProvider
): Promise<string> => typeof provider === 'function' ? await provider() : provider

export const resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths = (
  programDirectoryPath: string
): ThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths => {
  if (!path.isAbsolute(programDirectoryPath)) {
    throw new Error('programDirectoryPath must be absolute')
  }

  const resolvedProgramDirectoryPath = path.resolve(programDirectoryPath)
  const userDataPath = path.join(
    resolvedProgramDirectoryPath,
    THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_USERDATA_DIRECTORY_NAME
  )
  const startupStateDirectoryPath = path.join(
    userDataPath,
    THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_DIRECTORY_NAME
  )
  const snapshotFilePath = path.join(
    startupStateDirectoryPath,
    THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_FILE_NAME
  )
  const settingsFilePath = path.join(
    userDataPath,
    THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_SETTINGS_FILE_NAME
  )
  const modLockFilePath = path.join(
    userDataPath,
    THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME
  )
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, userDataPath)
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, startupStateDirectoryPath)
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, snapshotFilePath)
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, settingsFilePath)
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, modLockFilePath)
  return {
    programDirectoryPath: resolvedProgramDirectoryPath,
    userDataPath,
    startupStateDirectoryPath,
    snapshotFilePath,
    settingsFilePath,
    modLockFilePath
  }
}

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

const readStringArrayField = (
  value: object,
  fieldName: string
): readonly string[] | undefined => {
  const field = readOwnDataField(value, fieldName)
  if (!Array.isArray(field)) return undefined
  const result: string[] = []
  for (const item of field) {
    if (typeof item !== 'string') return undefined
    result.push(item)
  }
  return Object.freeze(result)
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
): ElectronStartupPersistentStateSnapshotFile | undefined => {
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
    || kind !== 'electron-startup-persistent-state-snapshot'
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
    kind: 'electron-startup-persistent-state-snapshot',
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
  snapshot: ElectronStartupPersistentStateSnapshotFile
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

const arraysEqual = (
  left: readonly string[],
  right: readonly string[]
): boolean => left.length === right.length && left.every((value, index) => value === right[index])

const parseSettingsSummary = (
  text: string
): ElectronStartupSettingsSummary | undefined => {
  let value: unknown
  try {
    value = JSON.parse(text) as unknown
    assertPureJsonValue(value)
  } catch {
    return undefined
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined
  const thirdPartyDataPacks = readOwnDataField(value, 'thirdPartyDataPacks')
  if (
    thirdPartyDataPacks === null
    || typeof thirdPartyDataPacks !== 'object'
    || Array.isArray(thirdPartyDataPacks)
  ) {
    return undefined
  }

  const candidateHash = readOwnStringField(thirdPartyDataPacks, 'candidateHash')
  const lockfileHash = readOwnStringField(thirdPartyDataPacks, 'lockfileHash')
  const selectedPackageIds = readStringArrayField(thirdPartyDataPacks, 'selectedPackageIds')
  const loadOrder = readStringArrayField(thirdPartyDataPacks, 'loadOrder')
  if (
    candidateHash === undefined
    || !sha256Pattern.test(candidateHash)
    || lockfileHash === undefined
    || !sha256Pattern.test(lockfileHash)
    || selectedPackageIds === undefined
    || loadOrder === undefined
  ) {
    return undefined
  }

  return Object.freeze({
    candidateHash: candidateHash as Sha256Hash,
    lockfileHash: lockfileHash as Sha256Hash,
    selectedPackageIds: selectedPackageIds as readonly PackageId[],
    loadOrder: loadOrder as readonly PackageId[]
  })
}

const settingsSummaryMatchesRequest = (
  request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest,
  summary: ElectronStartupSettingsSummary
): boolean => summary.candidateHash === request.candidateIdentity.candidateHash
  && summary.lockfileHash === request.lockfileHash
  && arraysEqual(summary.selectedPackageIds, request.selectedPackageIds)
  && arraysEqual(summary.loadOrder, request.loadOrder)

const modLockDraftMatchesRequest = (
  request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest,
  draft: ThirdPartyDataPackLockfileDraft
): boolean => draft.candidateIdentity.candidateHash === request.candidateIdentity.candidateHash
  && draft.lockfileHash === request.lockfileHash
  && draft.registryCount === request.registryCount
  && draft.entryCount === request.entryCount
  && draft.packages.length === request.packageCount
  && arraysEqual(draft.selectedPackageIds, request.selectedPackageIds)
  && arraysEqual(draft.loadOrder, request.loadOrder)

const createBlockedReadResult = (
  options: {
    readonly reason: string
    readonly snapshotFileSizeBytes: number
    readonly stage: string
    readonly diagnosticsDetails?: Record<string, string | number | boolean | null>
    readonly settingsRead?: boolean
    readonly modLockRead?: boolean
  }
): ThirdPartyDataPackElectronStartupPersistentStateSourceHostReadResult => deepFreezeObjectGraph({
  report: createReport({
    status: 'blocked',
    operation: 'read',
    reason: options.reason,
    programDirectoryContained: true,
    snapshotFilePresent: true,
    snapshotFileSizeBytes: options.snapshotFileSizeBytes,
    snapshotRead: true,
    settingsRead: options.settingsRead,
    modLockRead: options.modLockRead,
    diagnostics: [
      diagnostic(options.stage, options.diagnosticsDetails)
    ]
  }),
  snapshot: null
})

const createFailedReadResult = (
  options: {
    readonly reason: string
    readonly snapshotFileSizeBytes: number
    readonly stage: string
    readonly error: unknown
    readonly settingsRead?: boolean
    readonly modLockRead?: boolean
  }
): ThirdPartyDataPackElectronStartupPersistentStateSourceHostReadResult => deepFreezeObjectGraph({
  report: createReport({
    status: 'failed',
    operation: 'read',
    reason: options.reason,
    programDirectoryContained: true,
    snapshotFilePresent: true,
    snapshotFileSizeBytes: options.snapshotFileSizeBytes,
    snapshotRead: true,
    settingsRead: options.settingsRead,
    modLockRead: options.modLockRead,
    diagnostics: [
      diagnostic(options.stage, {
        errorName: errorName(options.error)
      })
    ]
  }),
  snapshot: null
})

const toSnapshotSource = (
  snapshot: ElectronStartupPersistentStateSnapshotFile
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
  messageKey: 'mods.startup.persistent.state.electron.ready',
  recovery: 'none',
  retryable: false,
  rollbackRequired: false
})

export const readThirdPartyDataPackElectronStartupPersistentStateSnapshot = async(
  options: {
    readonly programDirectoryPath: ThirdPartyDataPackElectronStartupPersistentStateProgramDirectoryProvider
    readonly request: ThirdPartyDataPackStartupGatePersistentStateSourceRequest
    readonly fileSystem?: Partial<ThirdPartyDataPackElectronStartupPersistentStateSourceFileSystem>
  }
): Promise<ThirdPartyDataPackElectronStartupPersistentStateSourceHostReadResult> => {
  let paths: ThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths
  try {
    paths = resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths(
      await resolveProgramDirectoryPath(options.programDirectoryPath)
    )
  } catch (error) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'failed',
        operation: 'read',
        reason: 'electron startup persistent state source path could not be resolved',
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.electron.path', {
            errorName: errorName(error)
          })
        ]
      }),
      snapshot: null
    })
  }

  const fs = fileSystem({
    programDirectoryPath: options.programDirectoryPath,
    fileSystem: options.fileSystem
  })

  let fileSize = 0
  try {
    const fileStat = await fs.stat(paths.snapshotFilePath)
    fileSize = fileStat.size
  } catch (error) {
    if (isNotFound(error)) {
      return deepFreezeObjectGraph({
        report: createReport({
          status: 'missing',
          operation: 'read',
          reason: 'electron startup persistent state snapshot file is absent',
          programDirectoryContained: true,
          snapshotFilePresent: false
        }),
        snapshot: null
      })
    }
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'failed',
        operation: 'read',
        reason: 'electron startup persistent state snapshot file could not be inspected',
        programDirectoryContained: true,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.electron.stat', {
            errorName: errorName(error)
          })
        ]
      }),
      snapshot: null
    })
  }

  if (fileSize > THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_MAX_BYTES) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'blocked',
        operation: 'read',
        reason: 'electron startup persistent state snapshot file exceeds the size limit',
        programDirectoryContained: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes: fileSize,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.electron.size', {
            size: fileSize,
            maxBytes: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_MAX_BYTES
          })
        ]
      }),
      snapshot: null
    })
  }

  let text: string
  try {
    text = await fs.readFile(paths.snapshotFilePath, 'utf8')
  } catch (error) {
    return deepFreezeObjectGraph({
      report: createReport({
        status: 'failed',
        operation: 'read',
        reason: 'electron startup persistent state snapshot file could not be read',
        programDirectoryContained: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes: fileSize,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.electron.read', {
            errorName: errorName(error)
          })
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
        reason: 'electron startup persistent state snapshot file structure is invalid',
        programDirectoryContained: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes: fileSize,
        snapshotRead: true,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.electron.structure')
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
        reason: 'electron startup persistent state snapshot does not match the startup request identity or required proofs',
        programDirectoryContained: true,
        snapshotFilePresent: true,
        snapshotFileSizeBytes: fileSize,
        snapshotRead: true,
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.electron.identity')
        ]
      }),
      snapshot: null
    })
  }

  let settingsSize = 0
  try {
    const settingsStat = await fs.stat(paths.settingsFilePath)
    settingsSize = settingsStat.size
  } catch (error) {
    if (isNotFound(error)) {
      return createBlockedReadResult({
        reason: 'electron startup settings state file is absent',
        snapshotFileSizeBytes: fileSize,
        stage: 'third-party.startup-persistent-state.electron.settings-missing'
      })
    }
    return createFailedReadResult({
      reason: 'electron startup settings state file could not be inspected',
      snapshotFileSizeBytes: fileSize,
      stage: 'third-party.startup-persistent-state.electron.settings-stat',
      error
    })
  }

  if (settingsSize > THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_SETTINGS_MAX_BYTES) {
    return createBlockedReadResult({
      reason: 'electron startup settings state file exceeds the size limit',
      snapshotFileSizeBytes: fileSize,
      stage: 'third-party.startup-persistent-state.electron.settings-size',
      diagnosticsDetails: {
        size: settingsSize,
        maxBytes: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_SETTINGS_MAX_BYTES
      }
    })
  }

  let settingsText: string
  try {
    settingsText = await fs.readFile(paths.settingsFilePath, 'utf8')
  } catch (error) {
    return createFailedReadResult({
      reason: 'electron startup settings state file could not be read',
      snapshotFileSizeBytes: fileSize,
      stage: 'third-party.startup-persistent-state.electron.settings-read',
      error
    })
  }

  const settingsSummary = parseSettingsSummary(settingsText)
  if (settingsSummary === undefined) {
    return createBlockedReadResult({
      reason: 'electron startup settings state structure is invalid',
      snapshotFileSizeBytes: fileSize,
      stage: 'third-party.startup-persistent-state.electron.settings-structure',
      settingsRead: true
    })
  }

  if (!settingsSummaryMatchesRequest(options.request, settingsSummary)) {
    return createBlockedReadResult({
      reason: 'electron startup settings state does not match the startup request identity',
      snapshotFileSizeBytes: fileSize,
      stage: 'third-party.startup-persistent-state.electron.settings-identity',
      settingsRead: true
    })
  }

  let modLockSize = 0
  try {
    const modLockStat = await fs.stat(paths.modLockFilePath)
    modLockSize = modLockStat.size
  } catch (error) {
    if (isNotFound(error)) {
      return createBlockedReadResult({
        reason: 'electron startup mod-lock state file is absent',
        snapshotFileSizeBytes: fileSize,
        stage: 'third-party.startup-persistent-state.electron.mod-lock-missing',
        settingsRead: true
      })
    }
    return createFailedReadResult({
      reason: 'electron startup mod-lock state file could not be inspected',
      snapshotFileSizeBytes: fileSize,
      stage: 'third-party.startup-persistent-state.electron.mod-lock-stat',
      error,
      settingsRead: true
    })
  }

  if (modLockSize > THIRD_PARTY_DATA_PACK_MOD_LOCK_MAX_BYTES) {
    return createBlockedReadResult({
      reason: 'electron startup mod-lock state file exceeds the size limit',
      snapshotFileSizeBytes: fileSize,
      stage: 'third-party.startup-persistent-state.electron.mod-lock-size',
      diagnosticsDetails: {
        size: modLockSize,
        maxBytes: THIRD_PARTY_DATA_PACK_MOD_LOCK_MAX_BYTES
      },
      settingsRead: true
    })
  }

  let modLockText: string
  try {
    modLockText = await fs.readFile(paths.modLockFilePath, 'utf8')
  } catch (error) {
    return createFailedReadResult({
      reason: 'electron startup mod-lock state file could not be read',
      snapshotFileSizeBytes: fileSize,
      stage: 'third-party.startup-persistent-state.electron.mod-lock-read',
      error,
      settingsRead: true
    })
  }

  let modLockDraft: ThirdPartyDataPackLockfileDraft
  try {
    modLockDraft = parseThirdPartyDataPackModLockText(modLockText)
  } catch {
    return createBlockedReadResult({
      reason: 'electron startup mod-lock state structure is invalid',
      snapshotFileSizeBytes: fileSize,
      stage: 'third-party.startup-persistent-state.electron.mod-lock-structure',
      settingsRead: true,
      modLockRead: true
    })
  }

  if (!modLockDraftMatchesRequest(options.request, modLockDraft)) {
    return createBlockedReadResult({
      reason: 'electron startup mod-lock state does not match the startup request identity',
      snapshotFileSizeBytes: fileSize,
      stage: 'third-party.startup-persistent-state.electron.mod-lock-identity',
      settingsRead: true,
      modLockRead: true
    })
  }

  return deepFreezeObjectGraph({
    report: createReport({
      status: 'loaded',
      operation: 'read',
      reason: 'electron startup persistent state snapshot, settings and mod-lock were loaded from program-directory userdata',
      programDirectoryContained: true,
      snapshotFilePresent: true,
      snapshotFileSizeBytes: fileSize,
      snapshotRead: true,
      settingsRead: true,
      modLockRead: true
    }),
    snapshot: toSnapshotSource(parsed)
  })
}

export const createThirdPartyDataPackElectronStartupPersistentStateSourceHost = (
  options: ThirdPartyDataPackElectronStartupPersistentStateSourceHostOptions
): ThirdPartyDataPackElectronStartupPersistentStateSourceHost => ({
  kind: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_KIND,
  mode: THIRD_PARTY_DATA_PACK_ELECTRON_STARTUP_PERSISTENT_STATE_SOURCE_HOST_MODE,
  async inspect() {
    try {
      resolveThirdPartyDataPackElectronStartupPersistentStateSourceHostPaths(
        await resolveProgramDirectoryPath(options.programDirectoryPath)
      )
      return createReport({
        status: 'ready',
        operation: 'inspect',
        reason: 'electron startup persistent state source path resolved under program-directory userdata',
        programDirectoryContained: true
      })
    } catch (error) {
      return createReport({
        status: 'failed',
        operation: 'inspect',
        reason: 'electron startup persistent state source path could not be resolved',
        diagnostics: [
          diagnostic('third-party.startup-persistent-state.electron.inspect', {
            errorName: errorName(error)
          })
        ]
      })
    }
  },
  async read(request) {
    const result = await readThirdPartyDataPackElectronStartupPersistentStateSnapshot({
      programDirectoryPath: options.programDirectoryPath,
      request,
      fileSystem: options.fileSystem
    })
    if (result.snapshot === null) {
      throw new Error(result.report.reason)
    }
    return result.snapshot
  }
})
