import { createDiagnostic, type ModDiagnostic, type ModDiagnosticRecovery, type ModDiagnosticSeverity } from './diagnostics'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyDataPackRuntimeCommandId } from './thirdPartyDataPackRuntimeCommandState'
import type { ThirdPartyDataPackLockfileDraft } from './thirdPartyDataPackLockfileDraft'
import type {
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary,
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult
} from './thirdPartyDataPackSettingsLockfilePersistentWriterSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID = 'active'
export const THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_DATABASE_NAME =
  'taoyuan-web-mod-settings-lockfile'
export const THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_DATABASE_VERSION = 1
export const THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_OBJECT_STORE_NAME =
  'settingsLockfile'
export const THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_STORAGE_KIND =
  'web-indexeddb-settings-lockfile'

export type ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreStatus =
  | 'ready'
  | 'written'
  | 'missing'
  | 'failed'
export type ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreOperation =
  | 'inspect'
  | 'read'
  | 'write'

export interface ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord {
  readonly recordId: typeof THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID
  readonly requestedCommandId: ThirdPartyDataPackRuntimeCommandId
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly lockfileDraft: ThirdPartyDataPackLockfileDraft
}

export interface ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreEffects {
  readonly webSettingsLockfileStoreCalled: boolean
  readonly webSettingsLockfileStoreWritten: boolean
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly runtimeEnablementAllowed: false
  readonly webStorageEnvelopeExposed: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: false
  readonly lockfileWritten: boolean
  readonly lockfileRestored: false
  readonly settingsWritten: boolean
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreReport {
  readonly status: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreStatus
  readonly operation: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreOperation
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_STORAGE_KIND
  readonly reason: string
  readonly recordId?: typeof THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds?: readonly PackageId[]
  readonly blockedPackageIds?: readonly PackageId[]
  readonly loadOrder?: readonly PackageId[]
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreEffects
}

export interface ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreReadResult {
  readonly report: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreReport
  readonly record: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null
}

export interface ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore {
  inspect(): Promise<ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreReport>
  read(): Promise<ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreReadResult>
  write(
    record: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord
  ): Promise<ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreReport>
}

export interface CreateThirdPartyDataPackWebSettingsLockfilePersistentWriterHostOptions {
  readonly store: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore
  readonly readLockfileDraft: () => Awaitable<ThirdPartyDataPackLockfileDraft>
}

export interface CreateWebIndexedDbSettingsLockfilePersistentWriterStoreOptions {
  readonly indexedDb?: IDBFactory
  readonly databaseName?: string
  readonly objectStoreName?: string
}

interface SafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnosticRecovery>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

const forbiddenStoreFields = [
  'indexedDb',
  'indexedDB',
  'indexedDbDatabase',
  'idbDatabase',
  'browserStorage',
  'storageHandle',
  'localStorage',
  'webStorage',
  'fileSystemHandle',
  'directoryHandle',
  'fileHandle',
  'blobUrl',
  'objectUrl',
  'settingsWriter',
  'lockfileWriter',
  'modLockWriter',
  'candidateRegistrySet',
  'candidateSnapshot',
  'programDirectoryPath',
  'userDataPath',
  'absolutePath',
  'resolvedPath',
  'path',
  'filePath',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

const readArrayLength = (value: readonly unknown[]): number | undefined => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  } catch {
    return undefined
  }
  return descriptor && 'value' in descriptor
    && typeof descriptor.value === 'number'
    && Number.isSafeInteger(descriptor.value)
    && descriptor.value >= 0
    ? descriptor.value
    : undefined
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

const cloneStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const length = readArrayLength(value)
  if (length === undefined) return []

  const result: string[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      return []
    }
    if (descriptor?.enumerable !== true || !('value' in descriptor) || typeof descriptor.value !== 'string') {
      return []
    }
    result.push(descriptor.value)
  }
  return result
}

const clonePackageIds = (value: unknown): PackageId[] => cloneStringList(value) as PackageId[]

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const hasForbiddenField = (value: unknown, fieldNames: readonly string[]): boolean => {
  if (value === null || typeof value !== 'object') return false
  return fieldNames.some(fieldName => {
    try {
      return Reflect.getOwnPropertyDescriptor(value, fieldName) !== undefined
    } catch {
      return true
    }
  })
}

const safeDiagnostic = (
  diagnostic: unknown,
  fallbackStage: string,
  packageId?: PackageId
): SafeDiagnostic => {
  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  const severity = readOwnStringField(diagnostic, 'severity')
  const recovery = readOwnStringField(diagnostic, 'recovery')
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readOwnStringField(diagnostic, 'stage') ?? fallbackStage,
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? `mods.error.${code.toLowerCase().replace(/-/g, '.')}`,
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined ?? packageId,
    recovery: diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)
      ? recovery as ModDiagnosticRecovery
      : 'retry'
  })
}

const safeDiagnostics = (
  diagnostics: readonly unknown[] | undefined,
  fallbackStage: string,
  packageId?: PackageId
): SafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return []
  const length = readArrayLength(diagnostics)
  if (length === undefined) return []

  const result: SafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor) {
      result.push(safeDiagnostic(descriptor.value, fallbackStage, packageId))
    }
  }
  return result
}

const commandDiagnostic = (stage: string, packageId?: PackageId): SafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

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

const storeEffects = (
  operation: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreOperation,
  written = false
): ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreEffects => Object.freeze({
  webSettingsLockfileStoreCalled: true,
  webSettingsLockfileStoreWritten: operation === 'write' && written,
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  runtimeEnablementAllowed: false,
  webStorageEnvelopeExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: operation === 'write' && written,
  lockfileRestored: false,
  settingsWritten: operation === 'write' && written,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const storeReport = (
  options: {
    readonly status: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreStatus
    readonly operation: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreOperation
    readonly reason: string
    readonly record?: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord
    readonly diagnostics?: readonly ModDiagnostic[]
    readonly written?: boolean
  }
): ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreReport => deepFreezeObjectGraph({
  status: options.status,
  operation: options.operation,
  storageKind: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_STORAGE_KIND,
  reason: options.reason,
  recordId: options.record?.recordId,
  targetPackageId: options.record?.targetPackageId,
  selectedPackageIds: options.record ? [...options.record.selectedPackageIds] : undefined,
  blockedPackageIds: options.record ? [...options.record.blockedPackageIds] : undefined,
  loadOrder: options.record ? [...options.record.loadOrder] : undefined,
  candidateHash: options.record?.candidateHash,
  lockfileHash: options.record?.lockfileHash,
  diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
  effects: storeEffects(options.operation, options.written === true)
})

const storeErrorReport = (
  operation: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreOperation,
  stage: string,
  error: unknown
): ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreReport => storeReport({
  status: 'failed',
  operation,
  reason: 'web settings-lockfile persistent store failed before publishing partial state',
  diagnostics: [
    createDiagnostic('LIFECYCLE-TRANSACTION-001', {
      stage,
      details: {
        message: error instanceof Error ? error.message : String(error)
      },
      recovery: 'retry'
    })
  ]
})

const hostEffects = (
  written: boolean
): ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary => Object.freeze({
  settingsLockfilePersistentWriterHostCalled: true,
  settingsLockfilePersistentWriterHostWritten: written,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: written,
  lockfileRestored: false,
  settingsWritten: written,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const hostResult = (
  envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  status: 'written' | 'blocked',
  diagnostics: readonly SafeDiagnostic[]
): ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult => deepFreezeObjectGraph({
  status,
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: [...envelope.selectedPackageIds],
  blockedPackageIds: [...envelope.blockedPackageIds],
  loadOrder: [...envelope.loadOrder],
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  packageFileStagingHostStatus: envelope.packageFileStagingHostStatus,
  settingsLockfileCommitHostStatus: envelope.settingsLockfileCommitHostStatus,
  modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
  transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
  modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
  transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
  diagnostics: Object.freeze([...diagnostics]),
  effects: hostEffects(status === 'written')
})

const draftBodyHash = (draft: ThirdPartyDataPackLockfileDraft): Sha256Hash => {
  const { lockfileHash: _lockfileHash, ...body } = draft
  return hashCanonicalJson(body) as Sha256Hash
}

const draftMatchesEnvelope = (
  envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  draft: ThirdPartyDataPackLockfileDraft
): boolean => draft.lockfileHash === envelope.lockfileHash
  && draft.lockfileHash === draftBodyHash(draft)
  && draft.candidateIdentity.candidateHash === envelope.candidateIdentity.candidateHash
  && draft.registryCount === envelope.registryCount
  && draft.entryCount === envelope.entryCount
  && draft.packages.length === envelope.packageCount
  && arraysEqual(draft.selectedPackageIds, envelope.selectedPackageIds)
  && arraysEqual(draft.loadOrder, envelope.loadOrder)

const recordFromEnvelope = (
  envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  draft: ThirdPartyDataPackLockfileDraft
): ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord => deepFreezeObjectGraph({
  recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: [...envelope.selectedPackageIds],
  blockedPackageIds: [...envelope.blockedPackageIds],
  loadOrder: [...envelope.loadOrder],
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  lockfileDraft: draft
})

const validateRecord = (
  value: unknown
): ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Web settings-lockfile record must be an object')
  }
  const recordId = readOwnStringField(value, 'recordId')
  const requestedCommandId = readOwnStringField(value, 'requestedCommandId')
  const targetPackageId = readOwnStringField(value, 'targetPackageId')
  const candidateHash = readOwnStringField(value, 'candidateHash')
  const lockfileHash = readOwnStringField(value, 'lockfileHash')
  const lockfileDraft = readOwnDataField(value, 'lockfileDraft') as ThirdPartyDataPackLockfileDraft | undefined
  const selectedPackageIds = clonePackageIds(readOwnDataField(value, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(value, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(value, 'loadOrder'))
  const installRecord = requestedCommandId === 'install'
    && selectedPackageIds.length > 0
    && selectedPackageIds.includes(targetPackageId as PackageId)
    && loadOrder.includes(targetPackageId as PackageId)
  const disableRecord = requestedCommandId === 'disable'
    && selectedPackageIds.length === 0
    && loadOrder.length === 0
    && blockedPackageIds.length === 1
    && blockedPackageIds[0] === targetPackageId
  if (
    recordId !== THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID
    || (requestedCommandId !== 'install' && requestedCommandId !== 'disable')
    || targetPackageId === undefined
    || !candidateHash?.startsWith('sha256:')
    || !lockfileHash?.startsWith('sha256:')
    || lockfileDraft === undefined
    || (!installRecord && !disableRecord)
    || lockfileDraft.lockfileHash !== lockfileHash
    || lockfileDraft.candidateIdentity?.candidateHash !== candidateHash
    || !arraysEqual(lockfileDraft.selectedPackageIds, selectedPackageIds)
    || !arraysEqual(lockfileDraft.loadOrder, loadOrder)
  ) {
    throw new Error('Web settings-lockfile record identity is inconsistent')
  }
  return deepFreezeObjectGraph({
    recordId: THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID,
    requestedCommandId: requestedCommandId as ThirdPartyDataPackRuntimeCommandId,
    targetPackageId: targetPackageId as PackageId,
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    candidateHash: candidateHash as Sha256Hash,
    lockfileHash: lockfileHash as Sha256Hash,
    lockfileDraft
  })
}

const inspectReportContained = (
  report: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreReport
): boolean => report.status === 'ready'
  && report.operation === 'inspect'
  && report.storageKind === THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_STORAGE_KIND
  && report.effects.webSettingsLockfileStoreCalled === true
  && report.effects.webSettingsLockfileStoreWritten === false
  && report.effects.settingsWritten === false
  && report.effects.lockfileWritten === false
  && report.effects.packageFilesWritten === false
  && report.effects.packageBackupsWritten === false
  && report.effects.savesWritten === false
  && report.effects.cacheWritten === false
  && report.effects.transactionLogWritten === false
  && !hasForbiddenField(report, forbiddenStoreFields)
  && !hasForbiddenField(report.effects, forbiddenStoreFields)

const writeReportMatchesRecord = (
  record: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord,
  report: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreReport
): boolean => report.status === 'written'
  && report.operation === 'write'
  && report.storageKind === THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_STORAGE_KIND
  && report.recordId === record.recordId
  && report.targetPackageId === record.targetPackageId
  && arraysEqual(clonePackageIds(report.selectedPackageIds), record.selectedPackageIds)
  && arraysEqual(clonePackageIds(report.blockedPackageIds), record.blockedPackageIds)
  && arraysEqual(clonePackageIds(report.loadOrder), record.loadOrder)
  && report.candidateHash === record.candidateHash
  && report.lockfileHash === record.lockfileHash
  && report.effects.webSettingsLockfileStoreCalled === true
  && report.effects.webSettingsLockfileStoreWritten === true
  && report.effects.settingsWritten === true
  && report.effects.lockfileWritten === true
  && report.effects.packageFilesWritten === false
  && report.effects.packageBackupsWritten === false
  && report.effects.savesWritten === false
  && report.effects.cacheWritten === false
  && report.effects.transactionLogWritten === false
  && !hasForbiddenField(report, forbiddenStoreFields)
  && !hasForbiddenField(report.effects, forbiddenStoreFields)

export const createThirdPartyDataPackWebSettingsLockfilePersistentWriterHost = (
  options: CreateThirdPartyDataPackWebSettingsLockfilePersistentWriterHostOptions
): ((
  envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope
) => Promise<ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult>) => async envelope => {
  const packageId = envelope.targetPackageId
  let draft: ThirdPartyDataPackLockfileDraft
  try {
    draft = await options.readLockfileDraft()
  } catch {
    return hostResult(envelope, 'blocked', [
      commandDiagnostic('third-party.web-settings-lockfile-persistent-writer-host.lockfile-draft-failed', packageId)
    ])
  }

  if (!draftMatchesEnvelope(envelope, draft)) {
    return hostResult(envelope, 'blocked', [
      commandDiagnostic('third-party.web-settings-lockfile-persistent-writer-host.lockfile-draft-mismatch', packageId)
    ])
  }

  let inspectReport: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreReport
  try {
    inspectReport = await options.store.inspect()
  } catch {
    return hostResult(envelope, 'blocked', [
      commandDiagnostic('third-party.web-settings-lockfile-persistent-writer-host.store-inspect-threw', packageId)
    ])
  }

  if (!inspectReportContained(inspectReport)) {
    return hostResult(envelope, 'blocked', [
      ...safeDiagnostics(
        inspectReport.diagnostics as readonly unknown[],
        'third-party.web-settings-lockfile-persistent-writer-host.store-inspect',
        packageId
      ),
      commandDiagnostic('third-party.web-settings-lockfile-persistent-writer-host.store-inspect-blocked', packageId)
    ])
  }

  const record = recordFromEnvelope(envelope, draft)
  let writeReport: ThirdPartyDataPackWebSettingsLockfilePersistentWriterStoreReport
  try {
    writeReport = await options.store.write(record)
  } catch {
    return hostResult(envelope, 'blocked', [
      commandDiagnostic('third-party.web-settings-lockfile-persistent-writer-host.store-write-threw', packageId)
    ])
  }

  const writeDiagnostics = safeDiagnostics(
    writeReport.diagnostics as readonly unknown[],
    'third-party.web-settings-lockfile-persistent-writer-host.store-write',
    packageId
  )
  if (!writeReportMatchesRecord(record, writeReport)) {
    return hostResult(envelope, 'blocked', [
      ...writeDiagnostics,
      commandDiagnostic('third-party.web-settings-lockfile-persistent-writer-host.store-write-blocked', packageId)
    ])
  }

  return hostResult(envelope, 'written', writeDiagnostics)
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

export const createWebIndexedDbSettingsLockfilePersistentWriterStore = (
  options: CreateWebIndexedDbSettingsLockfilePersistentWriterStoreOptions = {}
): ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore => {
  const indexedDb = options.indexedDb ?? globalThis.indexedDB
  if (indexedDb === undefined) {
    throw new Error('Web IndexedDB is not available')
  }
  const databaseName = options.databaseName ?? THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_DATABASE_NAME
  const objectStoreName = options.objectStoreName ?? THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_OBJECT_STORE_NAME

  const openDatabase = async(): Promise<IDBDatabase> => {
    const request = indexedDb.open(databaseName, THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_DATABASE_VERSION)
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
        return storeReport({
          status: 'ready',
          operation: 'inspect',
          reason: 'web IndexedDB settings-lockfile object store resolved'
        })
      } catch (error) {
        return storeErrorReport(
          'inspect',
          'third-party.web-settings-lockfile-persistent-writer-store.inspect',
          error
        )
      }
    },
    async read() {
      try {
        const record = await withObjectStore('readonly', async store => {
          const value = await requestToPromise(
            store.get(THIRD_PARTY_DATA_PACK_WEB_SETTINGS_LOCKFILE_RECORD_ID)
          )
          return value === undefined ? null : validateRecord(value)
        })
        return deepFreezeObjectGraph({
          record,
          report: storeReport({
            status: record === null ? 'missing' : 'ready',
            operation: 'read',
            reason: record === null
              ? 'web IndexedDB settings-lockfile record is absent'
              : 'web IndexedDB settings-lockfile record was loaded',
            record: record ?? undefined
          })
        })
      } catch (error) {
        return deepFreezeObjectGraph({
          record: null,
          report: storeErrorReport(
            'read',
            'third-party.web-settings-lockfile-persistent-writer-store.read',
            error
          )
        })
      }
    },
    async write(record) {
      try {
        const validatedRecord = validateRecord(record)
        await withObjectStore('readwrite', async store => {
          await requestToPromise(store.put(validatedRecord))
        })
        return storeReport({
          status: 'written',
          operation: 'write',
          reason: 'web IndexedDB settings-lockfile record was written',
          record: validatedRecord,
          written: true
        })
      } catch (error) {
        return storeErrorReport(
          'write',
          'third-party.web-settings-lockfile-persistent-writer-store.write',
          error
        )
      }
    }
  }
}

export const createInMemoryWebSettingsLockfilePersistentWriterStore =
  (): ThirdPartyDataPackWebSettingsLockfilePersistentWriterStore => {
    let record: ThirdPartyDataPackWebSettingsLockfilePersistentWriterRecord | null = null
    return {
      async inspect() {
        return storeReport({
          status: 'ready',
          operation: 'inspect',
          reason: 'in-memory web settings-lockfile store resolved'
        })
      },
      async read() {
        return deepFreezeObjectGraph({
          record,
          report: storeReport({
            status: record === null ? 'missing' : 'ready',
            operation: 'read',
            reason: record === null
              ? 'in-memory web settings-lockfile record is absent'
              : 'in-memory web settings-lockfile record was loaded',
            record: record ?? undefined
          })
        })
      },
      async write(nextRecord) {
        record = validateRecord(nextRecord)
        return storeReport({
          status: 'written',
          operation: 'write',
          reason: 'in-memory web settings-lockfile record was written',
          record,
          written: true
        })
      }
    }
  }
