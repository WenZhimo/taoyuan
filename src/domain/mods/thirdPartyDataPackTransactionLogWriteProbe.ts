import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { mkdir, open, readFile, readdir, rename, stat, unlink } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { assertPureJsonValue, type JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic, type ModDiagnosticSeverity } from './diagnostics'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackLockfileDraft
} from './thirdPartyDataPackLockfileDraft'
import type {
  ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
} from './thirdPartyDataPackRecoveryLogReplayRestoreAdapter'

export const THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_FILE_NAME =
  'transaction-log-write-probe.json'
export const THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_DIRECTORY_NAME =
  'mod-transactions'
export const THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_USERDATA_DIRECTORY_NAME =
  'userdata'
export const THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_STORAGE_KIND =
  'program-directory-userdata-transaction-log-write-probe'
export const THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_MAX_BYTES =
  16 * 1024 * 1024

const TEMP_FILE_PREFIX = `.${THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_FILE_NAME}.tmp-`
const DEFAULT_STALE_TEMP_AGE_MS = 5 * 60 * 1000

export type ThirdPartyDataPackTransactionLogWriteProbeStatus =
  | 'deferred'
  | 'written'
  | 'skipped'
  | 'blocked'
  | 'failed'
export type ThirdPartyDataPackTransactionLogWriteProbeCheckId =
  | 'replay-restore-adapter-deferred'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'draft-package-summary-consistent'
  | 'no-upstream-effects-intact'
  | 'explicit-transaction-log-probe-authorized'
  | 'storage-write-contained'
export type ThirdPartyDataPackTransactionLogWriteProbeStorageStatus =
  | 'written'
  | 'failed'
export type ThirdPartyDataPackTransactionLogWriteProbeStorageOperation =
  | 'write'
export type ThirdPartyDataPackTransactionLogWriteProbeProgramDirectoryProvider =
  | string
  | (() => string | Promise<string>)

export interface ThirdPartyDataPackTransactionLogWriteProbeCheck {
  readonly id: ThirdPartyDataPackTransactionLogWriteProbeCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionLogWriteProbeEntry {
  readonly formatVersion: 1
  readonly kind: 'third-party-data-pack-transaction-log-write-probe'
  readonly transactionId: string
  readonly operation: 'prepare-third-party-data-pack-transaction'
  readonly createdAtIso: string
  readonly officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly selectedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly replayRestoreStatus: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult['status']
  readonly entryHash: Sha256Hash
}

export interface ThirdPartyDataPackTransactionLogWriteProbeStoragePaths {
  readonly programDirectoryPath: string
  readonly userDataPath: string
  readonly transactionLogDirectoryPath: string
  readonly filePath: string
}

export interface ThirdPartyDataPackTransactionLogWriteProbeStorageEffects {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly runtimeEnablementAllowed: false
  readonly electronIpcExposed: false
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
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackTransactionLogWriteProbeStorageReport {
  readonly status: ThirdPartyDataPackTransactionLogWriteProbeStorageStatus
  readonly operation: ThirdPartyDataPackTransactionLogWriteProbeStorageOperation
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_STORAGE_KIND
  readonly reason: string
  readonly paths?: ThirdPartyDataPackTransactionLogWriteProbeStoragePaths
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackTransactionLogWriteProbeStorageEffects
}

export interface ThirdPartyDataPackTransactionLogWriteProbeStorageWriteResult {
  readonly report: ThirdPartyDataPackTransactionLogWriteProbeStorageReport
}

export interface ThirdPartyDataPackTransactionLogWriteProbeFileSystem {
  mkdir: typeof mkdir
  open: typeof open
  readFile: typeof readFile
  readdir: typeof readdir
  rename: typeof rename
  stat: typeof stat
  unlink: typeof unlink
}

export interface ThirdPartyDataPackTransactionLogWriteProbeFileOptions {
  readonly fileSystem?: Partial<ThirdPartyDataPackTransactionLogWriteProbeFileSystem>
  readonly staleTempAgeMs?: number
  readonly beforeReplace?: () => void | Promise<void>
}

export interface ThirdPartyDataPackTransactionLogWriteProbeStorageAdapterOptions {
  readonly programDirectoryPath: ThirdPartyDataPackTransactionLogWriteProbeProgramDirectoryProvider
  readonly fileOptions?: ThirdPartyDataPackTransactionLogWriteProbeFileOptions
}

export interface ThirdPartyDataPackTransactionLogWriteProbeStorageAdapter {
  write(
    entry: ThirdPartyDataPackTransactionLogWriteProbeEntry
  ): Promise<ThirdPartyDataPackTransactionLogWriteProbeStorageWriteResult>
}

export interface ThirdPartyDataPackTransactionLogWriteProbeEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly electronIpcExposed: false
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
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackTransactionLogWriteProbeResult {
  readonly status: ThirdPartyDataPackTransactionLogWriteProbeStatus
  readonly recoveryLogReplayRestoreStatus: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult['status']
  readonly reason: string
  readonly diagnostics: readonly ModDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly transactionId?: string
  readonly transactionLogEntryHash?: Sha256Hash
  readonly transactionLogWriteProbe: 'deferred' | 'written'
  readonly writeProbeAllowed: boolean
  readonly persistentWriteExecuted: boolean
  readonly storageKind?: ThirdPartyDataPackTransactionLogWriteProbeStorageReport['storageKind']
  readonly storageStatus?: ThirdPartyDataPackTransactionLogWriteProbeStorageReport['status']
  readonly storageOperation?: ThirdPartyDataPackTransactionLogWriteProbeStorageReport['operation']
  readonly storageReason?: string
  readonly writeChecks: readonly ThirdPartyDataPackTransactionLogWriteProbeCheck[]
  readonly effects: ThirdPartyDataPackTransactionLogWriteProbeEffectSummary
}

export interface RunThirdPartyDataPackTransactionLogWriteProbeOptions {
  readonly recoveryLogReplayRestoreAdapter: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
  readonly storage: ThirdPartyDataPackTransactionLogWriteProbeStorageAdapter
  readonly draft: ThirdPartyDataPackLockfileDraft
  readonly allowPersistentWriteProbe?: boolean
  readonly transactionId?: string
  readonly createdAtIso?: string
}

const fileSystem = (
  options?: ThirdPartyDataPackTransactionLogWriteProbeFileOptions
): ThirdPartyDataPackTransactionLogWriteProbeFileSystem => ({
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  stat,
  unlink,
  ...options?.fileSystem
})

const createEffectSummary = (
  options: { readonly transactionLogWritten?: boolean } = {}
): ThirdPartyDataPackTransactionLogWriteProbeEffectSummary => ({
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
  transactionLogWritten: options.transactionLogWritten ?? false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const storageEffects = (
  options: { readonly transactionLogWritten?: boolean } = {}
): ThirdPartyDataPackTransactionLogWriteProbeStorageEffects => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
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
  transactionLogWritten: options.transactionLogWritten ?? false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

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
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor && typeof descriptor.value === 'string') {
      result.push(descriptor.value)
    }
  }
  return Object.freeze(result) as string[]
}

const clonePackageIds = (value: unknown): PackageId[] =>
  cloneStringList(value) as PackageId[]

const readDiagnosticDataField = (
  diagnostic: ModDiagnostic,
  fieldName: keyof ModDiagnostic
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(diagnostic, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readDiagnosticStringField = (
  diagnostic: ModDiagnostic,
  fieldName: keyof ModDiagnostic
): string | undefined => {
  const value = readDiagnosticDataField(diagnostic, fieldName)
  return typeof value === 'string' ? value : undefined
}

const diagnosticCopyFallbackCode = 'LIFECYCLE-TRANSACTION-001'
const diagnosticCopyFallbackStage = 'third-party.transaction-log-write-probe.diagnostic-copy'
const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnostic['recovery']>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

const fallbackMessageKey = (code: string): string =>
  `mods.error.${code.toLowerCase().replace(/-/g, '.')}`

const cloneJsonValue = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) {
    const length = readArrayLength(value)
    if (length === undefined) return []

    const result: JsonValue[] = []
    for (let index = 0; index < length; index += 1) {
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
      } catch {
        result.push(null)
        continue
      }
      result.push(descriptor?.enumerable === true && 'value' in descriptor
        ? cloneJsonValue(descriptor.value as JsonValue)
        : null)
    }
    return result
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, JsonValue> = {}
    let keys: readonly (string | symbol)[]
    try {
      keys = Reflect.ownKeys(value)
    } catch {
      return result
    }
    for (const key of keys) {
      if (typeof key !== 'string') continue
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value, key)
      } catch {
        continue
      }
      if (descriptor?.enumerable === true && 'value' in descriptor) {
        result[key] = cloneJsonValue(descriptor.value as JsonValue)
      }
    }
    return result
  }
  return value
}

const cloneDiagnosticPackageIds = (value: unknown): PackageId[] | undefined => {
  const result = clonePackageIds(value)
  return result.length > 0 ? Object.freeze(result) as PackageId[] : undefined
}

const cloneDiagnosticDetails = (
  details: ModDiagnostic['details']
): ModDiagnostic['details'] => {
  if (details === undefined) return undefined
  const result: Record<string, JsonValue> = {}
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(details)
  } catch {
    return result
  }
  for (const key of keys) {
    if (typeof key !== 'string') continue
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(details, key)
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor) {
      result[key] = cloneJsonValue(descriptor.value as JsonValue)
    }
  }
  return result
}

const cloneDiagnostic = (diagnostic: ModDiagnostic): ModDiagnostic => {
  const code = readDiagnosticStringField(diagnostic, 'code') ?? diagnosticCopyFallbackCode
  const severity = readDiagnosticDataField(diagnostic, 'severity')
  const recovery = readDiagnosticDataField(diagnostic, 'recovery')
  return {
    code,
    ruleId: readDiagnosticStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readDiagnosticStringField(diagnostic, 'stage') ?? diagnosticCopyFallbackStage,
    messageKey: readDiagnosticStringField(diagnostic, 'messageKey') ?? fallbackMessageKey(code),
    packageId: readDiagnosticStringField(diagnostic, 'packageId') as PackageId | undefined,
    file: readDiagnosticStringField(diagnostic, 'file'),
    fieldPath: readDiagnosticStringField(diagnostic, 'fieldPath'),
    registryId: readDiagnosticStringField(diagnostic, 'registryId') as ModDiagnostic['registryId'],
    contentId: readDiagnosticStringField(diagnostic, 'contentId') as ModDiagnostic['contentId'],
    relatedPackageIds: cloneDiagnosticPackageIds(readDiagnosticDataField(diagnostic, 'relatedPackageIds')),
    details: cloneDiagnosticDetails(readDiagnosticDataField(diagnostic, 'details') as ModDiagnostic['details']),
    recovery: diagnosticRecoveries.has(recovery as ModDiagnostic['recovery'])
      ? recovery as ModDiagnostic['recovery']
      : 'none'
  }
}

const cloneDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return []
  const length = readArrayLength(diagnostics)
  if (length === undefined) return []

  const result: ModDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor) {
      result.push(cloneDiagnostic(descriptor.value as ModDiagnostic))
    }
  }
  return result
}

const cloneOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateOfficialIdentitySummary => ({ ...identity })

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : { ...identity }

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
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

const check = (
  id: ThirdPartyDataPackTransactionLogWriteProbeCheckId,
  status: ThirdPartyDataPackTransactionLogWriteProbeCheck['status'],
  reason: string
): ThirdPartyDataPackTransactionLogWriteProbeCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackTransactionLogWriteProbeCheck[] => Object.freeze([
  'replay-restore-adapter-deferred',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'draft-package-summary-consistent',
  'no-upstream-effects-intact',
  'explicit-transaction-log-probe-authorized',
  'storage-write-contained'
].map(id => check(id as ThirdPartyDataPackTransactionLogWriteProbeCheckId, 'skipped', reason)))

const everyEffectFalse = (effects: object): boolean =>
  Object.values(effects).every(value => value === false)

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const upstreamEffectsIntact = (
  replayRestore: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
): boolean =>
  replayRestore.recoveryLogReplayAllowed === false
  && replayRestore.persistentRestoreAllowed === false
  && replayRestore.writeAllowed === false
  && replayRestore.liveRegistryMutable === false
  && replayRestore.rollbackExecutionAllowed === false
  && everyEffectFalse(replayRestore.effects)

const storageEffectsContained = (
  report: ThirdPartyDataPackTransactionLogWriteProbeStorageReport
): boolean =>
  report.operation === 'write'
  && report.status === 'written'
  && report.effects.transactionLogWritten === true
  && report.effects.officialRegistryPublished === false
  && report.effects.thirdPartyRegistryPublished === false
  && report.effects.runtimeEnablementAllowed === false
  && report.effects.electronIpcExposed === false
  && report.effects.packageFilesWritten === false
  && report.effects.packageBackupsWritten === false
  && report.effects.packageFilesRestored === false
  && report.effects.lockfileWritten === false
  && report.effects.lockfileRestored === false
  && report.effects.settingsWritten === false
  && report.effects.settingsRestored === false
  && report.effects.savesWritten === false
  && report.effects.cacheWritten === false
  && report.effects.recoveryLogRead === false
  && report.effects.recoveryLogReplayed === false
  && report.effects.rollbackExecuted === false
  && report.effects.diagnosticsWritten === false

const buildWriteChecks = (
  replayRestore: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult,
  draft: ThirdPartyDataPackLockfileDraft,
  allowPersistentWriteProbe: boolean,
  storageReport?: ThirdPartyDataPackTransactionLogWriteProbeStorageReport
): readonly ThirdPartyDataPackTransactionLogWriteProbeCheck[] => Object.freeze([
  check(
    'replay-restore-adapter-deferred',
    replayRestore.status === 'deferred' ? 'satisfied' : 'blocked',
    'Recovery replay and restore adapter must remain deferred before an isolated transaction-log write probe can run.'
  ),
  check(
    'candidate-identity-consistent',
    replayRestore.candidateIdentity?.candidateHash !== undefined
      && replayRestore.candidateIdentity.candidateHash === draft.candidateIdentity.candidateHash
      ? 'satisfied'
      : 'blocked',
    'The draft candidate hash must match the upstream replay/restore candidate identity.'
  ),
  check(
    'lockfile-hash-consistent',
    replayRestore.lockfileHash !== undefined && replayRestore.lockfileHash === draft.lockfileHash
      ? 'satisfied'
      : 'blocked',
    'The draft self hash must match the upstream lockfile hash before any transaction log probe can run.'
  ),
  check(
    'draft-package-summary-consistent',
    arraysEqual(clonePackageIds(replayRestore.selectedPackageIds), clonePackageIds(draft.selectedPackageIds))
      && arraysEqual(clonePackageIds(replayRestore.loadOrder), clonePackageIds(draft.loadOrder))
      && replayRestore.packageCount === draft.packages.length
      && replayRestore.registryCount === draft.registryCount
      && replayRestore.entryCount === draft.entryCount
      ? 'satisfied'
      : 'blocked',
    'The draft selected package ids, load order, package count and registry totals must match the upstream summary.'
  ),
  check(
    'no-upstream-effects-intact',
    upstreamEffectsIntact(replayRestore) ? 'satisfied' : 'blocked',
    'Upstream replay/restore planning must still expose only false publication, replay, restore and write effects.'
  ),
  check(
    'explicit-transaction-log-probe-authorized',
    allowPersistentWriteProbe ? 'satisfied' : 'skipped',
    allowPersistentWriteProbe
      ? 'This call explicitly authorized an isolated transaction-log write probe.'
      : 'Persistent transaction-log write probing was not explicitly authorized for this call.'
  ),
  check(
    'storage-write-contained',
    storageReport === undefined
      ? 'skipped'
      : storageEffectsContained(storageReport) ? 'satisfied' : 'blocked',
    'The storage write report must be a write operation that only marks transactionLogWritten and leaves every other runtime/storage effect false.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackTransactionLogWriteProbeCheck[]
): readonly ModDiagnostic[] => checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.transaction-log-write-probe.checks',
    severity: 'error',
    fieldPath: `/writeChecks/${currentCheck.id}`,
    details: {
      reason: currentCheck.reason
    },
    recovery: 'retry'
  }))

const diagnosticsForUnexpectedError = (): readonly ModDiagnostic[] => [
  createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.transaction-log-write-probe.storage',
    severity: 'error',
    details: {
      reason: 'transaction log storage adapter threw before returning a write report'
    },
    recovery: 'retry'
  })
]

const transactionLogDiagnostic = (
  stage: string,
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
  stage,
  details,
  recovery: 'retry'
})

const diagnosticsForError = (
  stage: string,
  error: unknown
): readonly ModDiagnostic[] => [
  transactionLogDiagnostic(stage, {
    message: error instanceof Error ? error.message : String(error)
  })
]

const createStorageReport = (
  options: {
    readonly status: ThirdPartyDataPackTransactionLogWriteProbeStorageStatus
    readonly reason: string
    readonly paths?: ThirdPartyDataPackTransactionLogWriteProbeStoragePaths
    readonly diagnostics?: readonly ModDiagnostic[]
    readonly transactionLogWritten?: boolean
  }
): ThirdPartyDataPackTransactionLogWriteProbeStorageReport => deepFreezeObjectGraph({
  status: options.status,
  operation: 'write',
  storageKind: THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_STORAGE_KIND,
  reason: options.reason,
  paths: options.paths === undefined ? undefined : { ...options.paths },
  diagnostics: cloneDiagnostics(options.diagnostics ?? []),
  effects: storageEffects({ transactionLogWritten: options.transactionLogWritten })
})

const assertInsideDirectory = (directory: string, candidate: string): void => {
  const relative = path.relative(path.resolve(directory), path.resolve(candidate))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('transaction log write probe path escaped its directory')
  }
}

const assertInsideProgramDirectory = (
  programDirectoryPath: string,
  candidate: string
): void => {
  const relative = path.relative(path.resolve(programDirectoryPath), path.resolve(candidate))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('transaction log write probe path escaped its program directory')
  }
}

const isNotFound = (error: unknown): boolean =>
  error !== null
  && typeof error === 'object'
  && 'code' in error
  && (error as { code?: unknown }).code === 'ENOENT'

const isTemporaryName = (name: string): boolean => name.startsWith(TEMP_FILE_PREFIX)

const calculateEntryHash = (
  entry: Omit<ThirdPartyDataPackTransactionLogWriteProbeEntry, 'entryHash'>
): Sha256Hash => hashCanonicalJson(entry) as Sha256Hash

const assertTransactionLogEntry = (
  value: unknown
): ThirdPartyDataPackTransactionLogWriteProbeEntry => {
  assertPureJsonValue(value)
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('transaction log write probe entry must be a JSON object')
  }
  const entry = value as ThirdPartyDataPackTransactionLogWriteProbeEntry
  if (
    entry.formatVersion !== 1
    || entry.kind !== 'third-party-data-pack-transaction-log-write-probe'
    || entry.operation !== 'prepare-third-party-data-pack-transaction'
    || typeof entry.transactionId !== 'string'
    || entry.transactionId.length < 1
    || typeof entry.createdAtIso !== 'string'
    || typeof entry.lockfileHash !== 'string'
    || !/^sha256:[0-9a-f]{64}$/.test(entry.lockfileHash)
    || typeof entry.entryHash !== 'string'
    || !/^sha256:[0-9a-f]{64}$/.test(entry.entryHash)
    || !Array.isArray(entry.selectedPackageIds)
    || !Array.isArray(entry.loadOrder)
    || !Number.isInteger(entry.registryCount)
    || !Number.isInteger(entry.entryCount)
    || !Number.isInteger(entry.packageCount)
    || entry.replayRestoreStatus !== 'deferred'
    || entry.candidateIdentity?.candidateHash === undefined
  ) {
    throw new Error('transaction log write probe entry structure is invalid')
  }
  const { entryHash: _entryHash, ...body } = entry
  const expectedHash = calculateEntryHash(body)
  if (entry.entryHash !== expectedHash) {
    throw new Error('transaction log write probe entry self hash does not match its canonical body')
  }
  return entry
}

export const createThirdPartyDataPackTransactionLogWriteProbeEntry = (
  replayRestore: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult,
  draft: ThirdPartyDataPackLockfileDraft,
  options: {
    readonly transactionId?: string
    readonly createdAtIso?: string
  } = {}
): ThirdPartyDataPackTransactionLogWriteProbeEntry => {
  if (replayRestore.candidateIdentity === undefined || replayRestore.lockfileHash === undefined) {
    throw new Error('transaction log write probe requires candidate identity and lockfile hash')
  }
  const body: Omit<ThirdPartyDataPackTransactionLogWriteProbeEntry, 'entryHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-transaction-log-write-probe',
    transactionId: options.transactionId ?? randomUUID(),
    operation: 'prepare-third-party-data-pack-transaction',
    createdAtIso: options.createdAtIso ?? new Date().toISOString(),
    officialIdentity: cloneOfficialIdentity(replayRestore.officialIdentity),
    candidateIdentity: cloneCandidateIdentity(replayRestore.candidateIdentity)!,
    lockfileHash: replayRestore.lockfileHash,
    selectedPackageIds: clonePackageIds(draft.selectedPackageIds),
    loadOrder: clonePackageIds(draft.loadOrder),
    registryCount: draft.registryCount,
    entryCount: draft.entryCount,
    packageCount: draft.packages.length,
    replayRestoreStatus: replayRestore.status
  }
  return deepFreezeObjectGraph({
    ...body,
    entryHash: calculateEntryHash(body)
  })
}

const createTransactionLogWriteProbeText = (
  entry: ThirdPartyDataPackTransactionLogWriteProbeEntry
): string => {
  const validated = assertTransactionLogEntry(entry)
  return `${JSON.stringify(validated, null, 2)}\n`
}

export const parseThirdPartyDataPackTransactionLogWriteProbeText = (
  text: string
): ThirdPartyDataPackTransactionLogWriteProbeEntry =>
  deepFreezeObjectGraph(assertTransactionLogEntry(JSON.parse(text) as unknown))

export const resolveThirdPartyDataPackTransactionLogWriteProbeStoragePaths = (
  programDirectoryPath: string
): ThirdPartyDataPackTransactionLogWriteProbeStoragePaths => {
  if (!path.isAbsolute(programDirectoryPath)) {
    throw new Error('programDirectoryPath must be absolute')
  }

  const resolvedProgramDirectoryPath = path.resolve(programDirectoryPath)
  const userDataPath = path.join(
    resolvedProgramDirectoryPath,
    THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_USERDATA_DIRECTORY_NAME
  )
  const transactionLogDirectoryPath = path.join(
    userDataPath,
    THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_DIRECTORY_NAME
  )
  const filePath = path.join(
    transactionLogDirectoryPath,
    THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_FILE_NAME
  )
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, userDataPath)
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, transactionLogDirectoryPath)
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, filePath)
  assertInsideDirectory(transactionLogDirectoryPath, filePath)
  return {
    programDirectoryPath: resolvedProgramDirectoryPath,
    userDataPath,
    transactionLogDirectoryPath,
    filePath
  }
}

const resolveProgramDirectoryPath = async(
  provider: ThirdPartyDataPackTransactionLogWriteProbeProgramDirectoryProvider
): Promise<string> => typeof provider === 'function' ? await provider() : provider

const cleanupTemporaryFiles = async(
  paths: ThirdPartyDataPackTransactionLogWriteProbeStoragePaths,
  options?: ThirdPartyDataPackTransactionLogWriteProbeFileOptions
): Promise<void> => {
  const fs = fileSystem(options)
  const staleAgeMs = options?.staleTempAgeMs ?? DEFAULT_STALE_TEMP_AGE_MS
  const cutoff = Date.now() - staleAgeMs
  let entries
  try {
    entries = await fs.readdir(paths.transactionLogDirectoryPath, { withFileTypes: true })
  } catch (error) {
    if (isNotFound(error)) return
    throw error
  }

  await Promise.all(entries
    .filter(entry => entry.isFile() && isTemporaryName(entry.name))
    .map(async entry => {
      const temporaryPath = path.join(paths.transactionLogDirectoryPath, entry.name)
      assertInsideDirectory(paths.transactionLogDirectoryPath, temporaryPath)
      try {
        const fileStat = await fs.stat(temporaryPath)
        if (fileStat.mtimeMs > cutoff) return
        await fs.unlink(temporaryPath)
      } catch (error) {
        if (!isNotFound(error)) throw error
      }
    }))
}

const writeTransactionLogWriteProbeFile = async(
  paths: ThirdPartyDataPackTransactionLogWriteProbeStoragePaths,
  entry: ThirdPartyDataPackTransactionLogWriteProbeEntry,
  options?: ThirdPartyDataPackTransactionLogWriteProbeFileOptions
): Promise<void> => {
  const fs = fileSystem(options)
  const contents = createTransactionLogWriteProbeText(entry)
  if (Buffer.byteLength(contents, 'utf8') > THIRD_PARTY_DATA_PACK_TRANSACTION_LOG_WRITE_PROBE_MAX_BYTES) {
    throw new Error('transaction log write probe entry exceeds the size limit')
  }

  await fs.mkdir(paths.transactionLogDirectoryPath, { recursive: true })
  await cleanupTemporaryFiles(paths, options)
  const temporaryPath = path.join(
    paths.transactionLogDirectoryPath,
    `${TEMP_FILE_PREFIX}${process.pid}-${randomUUID()}`
  )
  assertInsideDirectory(paths.transactionLogDirectoryPath, temporaryPath)
  let handle: Awaited<ReturnType<typeof open>> | null = null
  try {
    handle = await fs.open(temporaryPath, 'wx')
    await handle.writeFile(contents, 'utf8')
    await handle.sync()
    await handle.close()
    handle = null

    const reread = await fs.readFile(temporaryPath, 'utf8')
    if (reread !== contents) {
      throw new Error('transaction log write probe temporary file changed before replace')
    }
    parseThirdPartyDataPackTransactionLogWriteProbeText(reread)
    await options?.beforeReplace?.()
    await fs.rename(temporaryPath, paths.filePath)
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined)
    await fs.unlink(temporaryPath).catch(() => undefined)
    throw error
  }
}

export const createThirdPartyDataPackTransactionLogWriteProbeStorageAdapter = (
  options: ThirdPartyDataPackTransactionLogWriteProbeStorageAdapterOptions
): ThirdPartyDataPackTransactionLogWriteProbeStorageAdapter => {
  const resolvePaths = async(): Promise<ThirdPartyDataPackTransactionLogWriteProbeStoragePaths> =>
    resolveThirdPartyDataPackTransactionLogWriteProbeStoragePaths(
      await resolveProgramDirectoryPath(options.programDirectoryPath)
    )

  return {
    async write(entry) {
      try {
        const paths = await resolvePaths()
        await writeTransactionLogWriteProbeFile(paths, entry, options.fileOptions)
        return deepFreezeObjectGraph({
          report: createStorageReport({
            status: 'written',
            reason: 'program-directory userdata transaction log write probe was atomically written',
            paths,
            transactionLogWritten: true
          })
        })
      } catch (error) {
        return deepFreezeObjectGraph({
          report: createStorageReport({
            status: 'failed',
            reason: 'program-directory userdata transaction log write probe failed before publishing partial state',
            diagnostics: diagnosticsForError('third-party.transaction-log-write-probe.storage.write', error)
          })
        })
      }
    }
  }
}

const freezeResult = (
  result: ThirdPartyDataPackTransactionLogWriteProbeResult
): ThirdPartyDataPackTransactionLogWriteProbeResult => deepFreezeObjectGraph(result)

const baseResult = (
  status: ThirdPartyDataPackTransactionLogWriteProbeStatus,
  reason: string,
  replayRestore: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult,
  writeChecks: readonly ThirdPartyDataPackTransactionLogWriteProbeCheck[],
  diagnostics: readonly ModDiagnostic[],
  options: {
    readonly entry?: ThirdPartyDataPackTransactionLogWriteProbeEntry
    readonly storageReport?: ThirdPartyDataPackTransactionLogWriteProbeStorageReport
    readonly transactionLogWritten?: boolean
  } = {}
): ThirdPartyDataPackTransactionLogWriteProbeResult => freezeResult({
  status,
  recoveryLogReplayRestoreStatus: replayRestore.status,
  reason,
  diagnostics: cloneDiagnostics(diagnostics),
  selectedPackageIds: clonePackageIds(replayRestore.selectedPackageIds),
  blockedPackageIds: clonePackageIds(replayRestore.blockedPackageIds),
  blockedCandidatePaths: cloneStringList(replayRestore.blockedCandidatePaths),
  loadOrder: clonePackageIds(replayRestore.loadOrder),
  registryCount: replayRestore.registryCount,
  entryCount: replayRestore.entryCount,
  packageCount: replayRestore.packageCount,
  officialIdentity: cloneOfficialIdentity(replayRestore.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(replayRestore.candidateIdentity),
  lockfileHash: replayRestore.lockfileHash,
  transactionId: options.entry?.transactionId,
  transactionLogEntryHash: options.entry?.entryHash,
  transactionLogWriteProbe: options.transactionLogWritten ? 'written' : 'deferred',
  writeProbeAllowed: writeChecks.some(currentCheck =>
    currentCheck.id === 'explicit-transaction-log-probe-authorized'
    && currentCheck.status === 'satisfied'
  ),
  persistentWriteExecuted: options.transactionLogWritten ?? false,
  storageKind: options.storageReport?.storageKind,
  storageStatus: options.storageReport?.status,
  storageOperation: options.storageReport?.operation,
  storageReason: options.storageReport?.reason,
  writeChecks,
  effects: createEffectSummary({ transactionLogWritten: options.transactionLogWritten })
})

export const runThirdPartyDataPackTransactionLogWriteProbe = async(
  options: RunThirdPartyDataPackTransactionLogWriteProbeOptions
): Promise<ThirdPartyDataPackTransactionLogWriteProbeResult> => {
  const replayRestore = options.recoveryLogReplayRestoreAdapter

  if (replayRestore.status === 'skipped') {
    const reason = 'no selected third-party data packs'
    return baseResult(
      'skipped',
      reason,
      replayRestore,
      skippedChecks(reason),
      []
    )
  }

  if (replayRestore.status === 'blocked') {
    return baseResult(
      'blocked',
      replayRestore.reason,
      replayRestore,
      skippedChecks(replayRestore.reason),
      cloneDiagnostics(replayRestore.diagnostics)
    )
  }

  const preWriteChecks = buildWriteChecks(
    replayRestore,
    options.draft,
    options.allowPersistentWriteProbe === true
  )
  const preWriteBlockedDiagnostics = diagnosticsForBlockedChecks(preWriteChecks)
  if (preWriteBlockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'transaction log write probe inputs are inconsistent',
      replayRestore,
      preWriteChecks,
      [
        ...cloneDiagnostics(replayRestore.diagnostics),
        ...preWriteBlockedDiagnostics
      ]
    )
  }

  if (options.allowPersistentWriteProbe !== true) {
    return baseResult(
      'deferred',
      'transaction log write probe is deferred until an isolated persistent write probe is explicitly authorized',
      replayRestore,
      preWriteChecks,
      cloneDiagnostics(replayRestore.diagnostics)
    )
  }

  const entry = createThirdPartyDataPackTransactionLogWriteProbeEntry(
    replayRestore,
    options.draft,
    {
      transactionId: options.transactionId,
      createdAtIso: options.createdAtIso
    }
  )

  let storageReport: ThirdPartyDataPackTransactionLogWriteProbeStorageReport
  try {
    storageReport = (await options.storage.write(entry)).report
  } catch {
    return baseResult(
      'failed',
      'transaction log storage adapter failed before returning a write report',
      replayRestore,
      buildWriteChecks(replayRestore, options.draft, true),
      [
        ...cloneDiagnostics(replayRestore.diagnostics),
        ...diagnosticsForUnexpectedError()
      ],
      { entry }
    )
  }

  const writeChecks = buildWriteChecks(replayRestore, options.draft, true, storageReport)
  const blockedDiagnostics = diagnosticsForBlockedChecks(writeChecks)
  if (storageReport.status !== 'written' || blockedDiagnostics.length > 0) {
    return baseResult(
      'failed',
      'transaction log storage adapter did not complete a contained transaction-log-only write',
      replayRestore,
      writeChecks,
      [
        ...cloneDiagnostics(replayRestore.diagnostics),
        ...cloneDiagnostics(storageReport.diagnostics),
        ...blockedDiagnostics
      ],
      { entry, storageReport }
    )
  }

  return baseResult(
    'written',
    'transaction log write probe completed an isolated transaction-log-only persistent write',
    replayRestore,
    writeChecks,
    [
      ...cloneDiagnostics(replayRestore.diagnostics),
      ...cloneDiagnostics(storageReport.diagnostics)
    ],
    {
      entry,
      storageReport,
      transactionLogWritten: true
    }
  )
}
