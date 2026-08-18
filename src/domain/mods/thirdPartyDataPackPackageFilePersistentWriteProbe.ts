import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { mkdir, open, readFile, readdir, rename, stat, unlink } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { assertPureJsonValue, type JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic, type ModDiagnosticSeverity } from './diagnostics'
import { hashCanonicalJson, normalizePackagePath, sha256Utf8, type Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackLockfileDraft,
  ThirdPartyDataPackLockfileDraftPackage
} from './thirdPartyDataPackLockfileDraft'
import type {
  ThirdPartyDataPackPackageFileStagingHostEnvelope
} from './thirdPartyDataPackPackageFileStagingSource'

export const THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_WRITE_PROBE_STORAGE_KIND =
  'program-directory-mods-package-file-write-probe'
export const THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_WRITE_PROBE_MODS_DIRECTORY_NAME =
  'mods'
export const THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_WRITE_PROBE_BACKUP_DIRECTORY_NAME =
  '.taoyuan-package-file-backups'

const TEMP_FILE_PREFIX = '.taoyuan-package-file-write-probe.tmp-'
const DEFAULT_STALE_TEMP_AGE_MS = 5 * 60 * 1000

export type ThirdPartyDataPackPackageFilePersistentWriteProbeStatus =
  | 'deferred'
  | 'written'
  | 'skipped'
  | 'blocked'
  | 'failed'
export type ThirdPartyDataPackPackageFilePersistentWriteProbeCheckId =
  | 'install-staging-envelope-confirmed'
  | 'target-package-selected'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'draft-package-summary-consistent'
  | 'package-source-summary-consistent'
  | 'package-file-payload-complete'
  | 'package-file-payload-hashes-valid'
  | 'manifest-hash-consistent'
  | 'content-file-entries-consistent'
  | 'explicit-package-file-probe-authorized'
  | 'storage-write-contained'
export type ThirdPartyDataPackPackageFilePersistentWriteProbeStorageStatus =
  | 'written'
  | 'failed'
export type ThirdPartyDataPackPackageFilePersistentWriteProbeStorageOperation =
  | 'write'
export type ThirdPartyDataPackPackageFilePersistentWriteProbeProgramDirectoryProvider =
  | string
  | (() => string | Promise<string>)

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeCheck {
  readonly id: ThirdPartyDataPackPackageFilePersistentWriteProbeCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile {
  readonly path: string
  readonly contents: string
  readonly sha256?: Sha256Hash
}

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeWrittenFile {
  readonly path: string
  readonly sha256: Sha256Hash
  readonly bytes: number
  readonly backedUp: boolean
}

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths {
  readonly programDirectoryPath: string
  readonly modsDirectoryPath: string
  readonly packageDirectoryPath: string
  readonly backupDirectoryPath: string
}

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeStorageEffects {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly runtimeEnablementAllowed: false
  readonly electronIpcExposed: false
  readonly packageFilesWritten: boolean
  readonly packageBackupsWritten: boolean
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

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeStorageReport {
  readonly status: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageStatus
  readonly operation: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageOperation
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_WRITE_PROBE_STORAGE_KIND
  readonly reason: string
  readonly writtenFiles: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeWrittenFile[]
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageEffects
}

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeStorageWriteResult {
  readonly report: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageReport
}

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeFileSystem {
  mkdir: typeof mkdir
  open: typeof open
  readFile: typeof readFile
  readdir: typeof readdir
  rename: typeof rename
  stat: typeof stat
  unlink: typeof unlink
}

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeFileOptions {
  readonly fileSystem?: Partial<ThirdPartyDataPackPackageFilePersistentWriteProbeFileSystem>
  readonly staleTempAgeMs?: number
  readonly beforeReplace?: () => void | Promise<void>
}

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapterOptions {
  readonly programDirectoryPath: ThirdPartyDataPackPackageFilePersistentWriteProbeProgramDirectoryProvider
  readonly fileOptions?: ThirdPartyDataPackPackageFilePersistentWriteProbeFileOptions
}

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter {
  write(
    packageId: PackageId,
    files: readonly ThirdPartyDataPackPackageFilePersistentWriteProbePreparedFile[]
  ): Promise<ThirdPartyDataPackPackageFilePersistentWriteProbeStorageWriteResult>
}

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly electronIpcExposed: false
  readonly packageFilesWritten: boolean
  readonly packageBackupsWritten: boolean
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

export interface ThirdPartyDataPackPackageFilePersistentWriteProbeResult {
  readonly status: ThirdPartyDataPackPackageFilePersistentWriteProbeStatus
  readonly reason: string
  readonly diagnostics: readonly ModDiagnostic[]
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly packageFileWriteProbe: 'deferred' | 'written'
  readonly writeProbeAllowed: boolean
  readonly persistentWriteExecuted: boolean
  readonly storageKind?: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageReport['storageKind']
  readonly storageStatus?: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageReport['status']
  readonly storageOperation?: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageReport['operation']
  readonly storageReason?: string
  readonly writtenFileCount: number
  readonly backedUpFileCount: number
  readonly writtenFiles: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeWrittenFile[]
  readonly writeChecks: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeCheck[]
  readonly effects: ThirdPartyDataPackPackageFilePersistentWriteProbeEffectSummary
}

export interface RunThirdPartyDataPackPackageFilePersistentWriteProbeOptions {
  readonly envelope: ThirdPartyDataPackPackageFileStagingHostEnvelope
  readonly draft: ThirdPartyDataPackLockfileDraft
  readonly files: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile[]
  readonly storage: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter
  readonly allowPersistentWriteProbe?: boolean
}

export interface ThirdPartyDataPackPackageFilePersistentWriteProbePreparedFile {
  readonly path: string
  readonly contents: string
  readonly sha256: Sha256Hash
  readonly bytes: number
}

interface PackageFilePayloadValidation {
  readonly files: readonly ThirdPartyDataPackPackageFilePersistentWriteProbePreparedFile[]
  readonly pathsValid: boolean
  readonly complete: boolean
  readonly hashesValid: boolean
  readonly manifestHashConsistent: boolean
  readonly contentFileEntriesConsistent: boolean
}

const fileSystem = (
  options?: ThirdPartyDataPackPackageFilePersistentWriteProbeFileOptions
): ThirdPartyDataPackPackageFilePersistentWriteProbeFileSystem => ({
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
  options: {
    readonly packageFilesWritten?: boolean
    readonly packageBackupsWritten?: boolean
  } = {}
): ThirdPartyDataPackPackageFilePersistentWriteProbeEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  electronIpcExposed: false,
  packageFilesWritten: options.packageFilesWritten ?? false,
  packageBackupsWritten: options.packageBackupsWritten ?? false,
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

const storageEffects = (
  options: {
    readonly packageFilesWritten?: boolean
    readonly packageBackupsWritten?: boolean
  } = {}
): ThirdPartyDataPackPackageFilePersistentWriteProbeStorageEffects => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  runtimeEnablementAllowed: false,
  electronIpcExposed: false,
  packageFilesWritten: options.packageFilesWritten ?? false,
  packageBackupsWritten: options.packageBackupsWritten ?? false,
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
const diagnosticCopyFallbackStage = 'third-party.package-file-write-probe.diagnostic-copy'
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
    fieldPath: readDiagnosticStringField(diagnostic, 'fieldPath'),
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

const check = (
  id: ThirdPartyDataPackPackageFilePersistentWriteProbeCheckId,
  status: ThirdPartyDataPackPackageFilePersistentWriteProbeCheck['status'],
  reason: string
): ThirdPartyDataPackPackageFilePersistentWriteProbeCheck => Object.freeze({ id, status, reason })

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const safeNormalizePackagePath = (value: string): string | undefined => {
  try {
    return normalizePackagePath(value)
  } catch {
    return undefined
  }
}

const packageForEnvelope = (
  draft: ThirdPartyDataPackLockfileDraft,
  envelope: ThirdPartyDataPackPackageFileStagingHostEnvelope
): ThirdPartyDataPackLockfileDraftPackage | undefined =>
  draft.packages.find(pkg => pkg.packageId === envelope.targetPackageId)

const expectedRelativePaths = (
  packageDraft: ThirdPartyDataPackLockfileDraftPackage | undefined
): readonly string[] => {
  if (!packageDraft) return Object.freeze([])
  const paths = ['manifest.json', ...packageDraft.contentFiles.map(file => file.path)]
  const normalized = paths
    .map(safeNormalizePackagePath)
    .filter((value): value is string => value !== undefined)
  return Object.freeze([...new Set(normalized)])
}

const sourceSummaryConsistent = (
  packageDraft: ThirdPartyDataPackLockfileDraftPackage | undefined
): boolean => {
  if (!packageDraft) return false
  const candidatePath = safeNormalizePackagePath(packageDraft.source.candidatePath)
  if (!candidatePath) return false
  const expectedManifestPath = `${candidatePath}/manifest.json`
  const expectedContentFiles = packageDraft.contentFiles.map(file => `${candidatePath}/${file.path}`)
  return safeNormalizePackagePath(packageDraft.source.manifestPath) === expectedManifestPath
    && arraysEqual(
      packageDraft.source.contentFiles.map(sourcePath => safeNormalizePackagePath(sourcePath) ?? ''),
      expectedContentFiles
    )
}

const parsePureJson = (contents: string): JsonValue | undefined => {
  try {
    const value = JSON.parse(contents) as JsonValue
    assertPureJsonValue(value)
    return value
  } catch {
    return undefined
  }
}

const manifestHashConsistent = (
  packageDraft: ThirdPartyDataPackLockfileDraftPackage | undefined,
  fileByPath: ReadonlyMap<string, ThirdPartyDataPackPackageFilePersistentWriteProbePreparedFile>
): boolean => {
  const manifest = fileByPath.get('manifest.json')
  if (!packageDraft || !manifest) return false
  const parsed = parsePureJson(manifest.contents)
  return parsed !== undefined && hashCanonicalJson(parsed) === packageDraft.manifestHash
}

const contentFileEntriesConsistent = (
  packageDraft: ThirdPartyDataPackLockfileDraftPackage | undefined,
  fileByPath: ReadonlyMap<string, ThirdPartyDataPackPackageFilePersistentWriteProbePreparedFile>
): boolean => {
  if (!packageDraft) return false
  return packageDraft.contentFiles.every(contentFile => {
    const file = fileByPath.get(contentFile.path)
    if (!file) return false
    const parsed = parsePureJson(file.contents)
    if (!Array.isArray(parsed)) return false
    if (parsed.length !== contentFile.entryCount) return false
    return contentFile.entries.every(entry => {
      const value = parsed[entry.index]
      return value !== undefined && hashCanonicalJson(value) === entry.canonicalHash
    })
  })
}

const validatePayload = (
  packageDraft: ThirdPartyDataPackLockfileDraftPackage | undefined,
  files: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeInputFile[]
): PackageFilePayloadValidation => {
  const expected = expectedRelativePaths(packageDraft)
  const expectedSet = new Set(expected)
  const seen = new Set<string>()
  let pathsValid = true
  let hashesValid = true
  const prepared: ThirdPartyDataPackPackageFilePersistentWriteProbePreparedFile[] = []

  for (const file of files) {
    const normalizedPath = safeNormalizePackagePath(file.path)
    if (!normalizedPath || !expectedSet.has(normalizedPath) || seen.has(normalizedPath)) {
      pathsValid = false
      continue
    }
    const sha256 = sha256Utf8(file.contents)
    if (file.sha256 !== undefined && file.sha256 !== sha256) hashesValid = false
    seen.add(normalizedPath)
    prepared.push({
      path: normalizedPath,
      contents: file.contents,
      sha256,
      bytes: Buffer.byteLength(file.contents, 'utf8')
    })
  }

  const fileByPath = new Map(prepared.map(file => [file.path, file]))
  const complete = pathsValid
    && expected.length > 0
    && expected.every(expectedPath => fileByPath.has(expectedPath))
    && prepared.length === expected.length
  return {
    files: Object.freeze(prepared),
    pathsValid,
    complete,
    hashesValid,
    manifestHashConsistent: complete && manifestHashConsistent(packageDraft, fileByPath),
    contentFileEntriesConsistent: complete && contentFileEntriesConsistent(packageDraft, fileByPath)
  }
}

const storageEffectsContained = (
  report: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageReport
): boolean => report.operation === 'write'
  && report.status === 'written'
  && report.effects.packageFilesWritten === true
  && report.effects.packageFilesRestored === false
  && report.effects.lockfileWritten === false
  && report.effects.settingsWritten === false
  && report.effects.savesWritten === false
  && report.effects.cacheWritten === false
  && report.effects.transactionLogWritten === false
  && report.effects.recoveryLogRead === false
  && report.effects.recoveryLogReplayed === false
  && report.effects.rollbackExecuted === false
  && report.effects.diagnosticsWritten === false

const buildWriteChecks = (
  envelope: ThirdPartyDataPackPackageFileStagingHostEnvelope,
  draft: ThirdPartyDataPackLockfileDraft,
  payload: PackageFilePayloadValidation,
  allowPersistentWriteProbe: boolean,
  storageReport?: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageReport
): readonly ThirdPartyDataPackPackageFilePersistentWriteProbeCheck[] => {
  const packageDraft = packageForEnvelope(draft, envelope)
  return Object.freeze([
    check(
      'install-staging-envelope-confirmed',
      envelope.requestedCommandId === 'install' ? 'satisfied' : 'blocked',
      'Package file persistent write probing only covers the install command staging envelope.'
    ),
    check(
      'target-package-selected',
      packageDraft !== undefined && draft.selectedPackageIds.includes(envelope.targetPackageId)
        ? 'satisfied'
        : 'blocked',
      'The staging target package must exist in the lockfile draft and selected package list.'
    ),
    check(
      'candidate-identity-consistent',
      envelope.candidateIdentity.candidateHash === draft.candidateIdentity.candidateHash
        ? 'satisfied'
        : 'blocked',
      'The staging envelope candidate hash must match the lockfile draft candidate identity.'
    ),
    check(
      'lockfile-hash-consistent',
      envelope.lockfileHash === draft.lockfileHash ? 'satisfied' : 'blocked',
      'The staging envelope lockfile hash must match the draft self hash.'
    ),
    check(
      'draft-package-summary-consistent',
      arraysEqual(clonePackageIds(envelope.selectedPackageIds), clonePackageIds(draft.selectedPackageIds))
        && arraysEqual(clonePackageIds(envelope.loadOrder), clonePackageIds(draft.loadOrder))
        && envelope.registryCount === draft.registryCount
        && envelope.entryCount === draft.entryCount
        && envelope.packageCount === draft.packages.length
        ? 'satisfied'
        : 'blocked',
      'The staging envelope package summary must match the lockfile draft before package files can be probed.'
    ),
    check(
      'package-source-summary-consistent',
      sourceSummaryConsistent(packageDraft) ? 'satisfied' : 'blocked',
      'The lockfile draft source paths must describe manifest and content files under one package candidate root.'
    ),
    check(
      'package-file-payload-complete',
      payload.pathsValid && payload.complete ? 'satisfied' : 'blocked',
      'The package file payload must contain exactly the draft manifest and content files with no extra or unsafe paths.'
    ),
    check(
      'package-file-payload-hashes-valid',
      payload.hashesValid ? 'satisfied' : 'blocked',
      'Any caller-provided package file payload hashes must match the UTF-8 bytes that will be written.'
    ),
    check(
      'manifest-hash-consistent',
      payload.manifestHashConsistent ? 'satisfied' : 'blocked',
      'The manifest payload must match the manifest hash recorded in the lockfile draft package summary.'
    ),
    check(
      'content-file-entries-consistent',
      payload.contentFileEntriesConsistent ? 'satisfied' : 'blocked',
      'Content file payload entries must match the canonical entry hashes recorded in the lockfile draft package summary.'
    ),
    check(
      'explicit-package-file-probe-authorized',
      allowPersistentWriteProbe ? 'satisfied' : 'skipped',
      allowPersistentWriteProbe
        ? 'This call explicitly authorized an isolated package-file write probe.'
        : 'Persistent package-file write probing was not explicitly authorized for this call.'
    ),
    check(
      'storage-write-contained',
      storageReport === undefined
        ? 'skipped'
        : storageEffectsContained(storageReport) ? 'satisfied' : 'blocked',
      'The storage write report must only mark package file and package backup writes.'
    )
  ])
}

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeCheck[]
): readonly ModDiagnostic[] => checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.package-file-write-probe.checks',
    severity: 'error',
    fieldPath: `/writeChecks/${currentCheck.id}`,
    details: {
      reason: currentCheck.reason
    },
    recovery: 'retry'
  }))

const diagnosticsForStorageFailure = (): readonly ModDiagnostic[] => [
  createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.package-file-write-probe.storage',
    severity: 'error',
    details: {
      reason: 'package file storage adapter did not complete a contained write'
    },
    recovery: 'retry'
  })
]

const createStorageReport = (
  options: {
    readonly status: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageStatus
    readonly reason: string
    readonly writtenFiles?: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeWrittenFile[]
    readonly diagnostics?: readonly ModDiagnostic[]
  }
): ThirdPartyDataPackPackageFilePersistentWriteProbeStorageReport => {
  const writtenFiles = Object.freeze([...(options.writtenFiles ?? [])])
  return deepFreezeObjectGraph({
    status: options.status,
    operation: 'write',
    storageKind: THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_WRITE_PROBE_STORAGE_KIND,
    reason: options.reason,
    writtenFiles,
    diagnostics: cloneDiagnostics(options.diagnostics ?? []),
    effects: storageEffects({
      packageFilesWritten: options.status === 'written' && writtenFiles.length > 0,
      packageBackupsWritten: writtenFiles.some(file => file.backedUp)
    })
  })
}

const assertInsideDirectory = (directory: string, candidate: string): void => {
  const relative = path.relative(path.resolve(directory), path.resolve(candidate))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('package file write probe path escaped its directory')
  }
}

const assertInsideProgramDirectory = (programDirectoryPath: string, candidate: string): void => {
  const relative = path.relative(path.resolve(programDirectoryPath), path.resolve(candidate))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('package file write probe path escaped its program directory')
  }
}

const isNotFound = (error: unknown): boolean =>
  error !== null
  && typeof error === 'object'
  && 'code' in error
  && (error as { code?: unknown }).code === 'ENOENT'

const isTemporaryName = (name: string): boolean => name.startsWith(TEMP_FILE_PREFIX)

export const resolveThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths = (
  programDirectoryPath: string,
  packageId: PackageId
): ThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths => {
  if (!path.isAbsolute(programDirectoryPath)) {
    throw new Error('programDirectoryPath must be absolute')
  }

  const packageDirectoryName = normalizePackagePath(packageId)
  const resolvedProgramDirectoryPath = path.resolve(programDirectoryPath)
  const modsDirectoryPath = path.join(
    resolvedProgramDirectoryPath,
    THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_WRITE_PROBE_MODS_DIRECTORY_NAME
  )
  const packageDirectoryPath = path.join(modsDirectoryPath, packageDirectoryName)
  const backupDirectoryPath = path.join(
    packageDirectoryPath,
    THIRD_PARTY_DATA_PACK_PACKAGE_FILE_PERSISTENT_WRITE_PROBE_BACKUP_DIRECTORY_NAME
  )
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, modsDirectoryPath)
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, packageDirectoryPath)
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, backupDirectoryPath)
  assertInsideDirectory(modsDirectoryPath, packageDirectoryPath)
  assertInsideDirectory(packageDirectoryPath, backupDirectoryPath)
  return {
    programDirectoryPath: resolvedProgramDirectoryPath,
    modsDirectoryPath,
    packageDirectoryPath,
    backupDirectoryPath
  }
}

const resolveProgramDirectoryPath = async(
  provider: ThirdPartyDataPackPackageFilePersistentWriteProbeProgramDirectoryProvider
): Promise<string> => typeof provider === 'function' ? await provider() : provider

const cleanupTemporaryFiles = async(
  directoryPath: string,
  options?: ThirdPartyDataPackPackageFilePersistentWriteProbeFileOptions
): Promise<void> => {
  const fs = fileSystem(options)
  const staleAgeMs = options?.staleTempAgeMs ?? DEFAULT_STALE_TEMP_AGE_MS
  const cutoff = Date.now() - staleAgeMs
  let entries
  try {
    entries = await fs.readdir(directoryPath, { withFileTypes: true })
  } catch (error) {
    if (isNotFound(error)) return
    throw error
  }

  await Promise.all(entries
    .filter(entry => entry.isFile() && isTemporaryName(entry.name))
    .map(async entry => {
      const temporaryPath = path.join(directoryPath, entry.name)
      assertInsideDirectory(directoryPath, temporaryPath)
      try {
        const fileStat = await fs.stat(temporaryPath)
        if (fileStat.mtimeMs > cutoff) return
        await fs.unlink(temporaryPath)
      } catch (error) {
        if (!isNotFound(error)) throw error
      }
    }))
}

const targetPathFor = (
  paths: ThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths,
  relativePath: string
): string => {
  const normalizedPath = normalizePackagePath(relativePath)
  const targetPath = path.join(paths.packageDirectoryPath, normalizedPath)
  assertInsideDirectory(paths.packageDirectoryPath, targetPath)
  return targetPath
}

const backupPathFor = (
  paths: ThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths,
  relativePath: string
): string => {
  const normalizedPath = normalizePackagePath(relativePath)
  const targetPath = path.join(paths.backupDirectoryPath, `${normalizedPath}.backup`)
  assertInsideDirectory(paths.packageDirectoryPath, targetPath)
  assertInsideDirectory(paths.backupDirectoryPath, targetPath)
  return targetPath
}

const atomicWriteUtf8File = async(
  targetPath: string,
  contents: string,
  expectedSha256: Sha256Hash,
  options?: ThirdPartyDataPackPackageFilePersistentWriteProbeFileOptions
): Promise<void> => {
  const fs = fileSystem(options)
  const targetDirectoryPath = path.dirname(targetPath)
  await fs.mkdir(targetDirectoryPath, { recursive: true })
  await cleanupTemporaryFiles(targetDirectoryPath, options)
  const temporaryPath = path.join(
    targetDirectoryPath,
    `${TEMP_FILE_PREFIX}${process.pid}-${randomUUID()}`
  )
  assertInsideDirectory(targetDirectoryPath, temporaryPath)
  let handle: Awaited<ReturnType<typeof open>> | null = null
  try {
    handle = await fs.open(temporaryPath, 'wx')
    await handle.writeFile(contents, 'utf8')
    await handle.sync()
    await handle.close()
    handle = null

    const reread = await fs.readFile(temporaryPath, 'utf8')
    if (reread !== contents || sha256Utf8(reread) !== expectedSha256) {
      throw new Error('package file write probe temporary file changed before replace')
    }
    await options?.beforeReplace?.()
    await fs.rename(temporaryPath, targetPath)
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined)
    await fs.unlink(temporaryPath).catch(() => undefined)
    throw error
  }
}

const writePackageFiles = async(
  paths: ThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths,
  files: readonly ThirdPartyDataPackPackageFilePersistentWriteProbePreparedFile[],
  options?: ThirdPartyDataPackPackageFilePersistentWriteProbeFileOptions
): Promise<readonly ThirdPartyDataPackPackageFilePersistentWriteProbeWrittenFile[]> => {
  const fs = fileSystem(options)
  const writtenFiles: ThirdPartyDataPackPackageFilePersistentWriteProbeWrittenFile[] = []
  for (const file of files) {
    const targetPath = targetPathFor(paths, file.path)
    let backedUp = false
    try {
      const existing = await fs.readFile(targetPath, 'utf8')
      const backupPath = backupPathFor(paths, file.path)
      await atomicWriteUtf8File(backupPath, existing, sha256Utf8(existing), options)
      backedUp = true
    } catch (error) {
      if (!isNotFound(error)) throw error
    }
    await atomicWriteUtf8File(targetPath, file.contents, file.sha256, options)
    writtenFiles.push({
      path: file.path,
      sha256: file.sha256,
      bytes: file.bytes,
      backedUp
    })
  }
  return Object.freeze(writtenFiles)
}

export const createThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter = (
  options: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapterOptions
): ThirdPartyDataPackPackageFilePersistentWriteProbeStorageAdapter => {
  const resolvePaths = async(
    packageId: PackageId
  ): Promise<ThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths> =>
    resolveThirdPartyDataPackPackageFilePersistentWriteProbeStoragePaths(
      await resolveProgramDirectoryPath(options.programDirectoryPath),
      packageId
    )

  return {
    async write(packageId, files) {
      try {
        const paths = await resolvePaths(packageId)
        const writtenFiles = await writePackageFiles(paths, files, options.fileOptions)
        return deepFreezeObjectGraph({
          report: createStorageReport({
            status: 'written',
            reason: 'program-directory mods package files were atomically written by the isolated probe',
            writtenFiles
          })
        })
      } catch {
        return deepFreezeObjectGraph({
          report: createStorageReport({
            status: 'failed',
            reason: 'program-directory mods package file write probe failed before reporting committed package state',
            diagnostics: diagnosticsForStorageFailure()
          })
        })
      }
    }
  }
}

const freezeResult = (
  result: ThirdPartyDataPackPackageFilePersistentWriteProbeResult
): ThirdPartyDataPackPackageFilePersistentWriteProbeResult => deepFreezeObjectGraph(result)

const baseResult = (
  status: ThirdPartyDataPackPackageFilePersistentWriteProbeStatus,
  reason: string,
  envelope: ThirdPartyDataPackPackageFileStagingHostEnvelope,
  writeChecks: readonly ThirdPartyDataPackPackageFilePersistentWriteProbeCheck[],
  diagnostics: readonly ModDiagnostic[],
  options: {
    readonly storageReport?: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageReport
    readonly packageFilesWritten?: boolean
  } = {}
): ThirdPartyDataPackPackageFilePersistentWriteProbeResult => {
  const writtenFiles = Object.freeze([...(options.storageReport?.writtenFiles ?? [])])
  const packageBackupsWritten = writtenFiles.some(file => file.backedUp)
  return freezeResult({
    status,
    reason,
    diagnostics: cloneDiagnostics(diagnostics),
    targetPackageId: envelope.targetPackageId,
    selectedPackageIds: clonePackageIds(envelope.selectedPackageIds),
    blockedPackageIds: clonePackageIds(envelope.blockedPackageIds),
    loadOrder: clonePackageIds(envelope.loadOrder),
    registryCount: envelope.registryCount,
    entryCount: envelope.entryCount,
    packageCount: envelope.packageCount,
    candidateIdentity: { ...envelope.candidateIdentity },
    lockfileHash: envelope.lockfileHash,
    packageFileWriteProbe: options.packageFilesWritten ? 'written' : 'deferred',
    writeProbeAllowed: writeChecks.some(currentCheck =>
      currentCheck.id === 'explicit-package-file-probe-authorized'
      && currentCheck.status === 'satisfied'
    ),
    persistentWriteExecuted: options.packageFilesWritten ?? false,
    storageKind: options.storageReport?.storageKind,
    storageStatus: options.storageReport?.status,
    storageOperation: options.storageReport?.operation,
    storageReason: options.storageReport?.reason,
    writtenFileCount: writtenFiles.length,
    backedUpFileCount: writtenFiles.filter(file => file.backedUp).length,
    writtenFiles,
    writeChecks,
    effects: createEffectSummary({
      packageFilesWritten: options.packageFilesWritten,
      packageBackupsWritten
    })
  })
}

export const runThirdPartyDataPackPackageFilePersistentWriteProbe = async(
  options: RunThirdPartyDataPackPackageFilePersistentWriteProbeOptions
): Promise<ThirdPartyDataPackPackageFilePersistentWriteProbeResult> => {
  const envelope = options.envelope
  const packageDraft = packageForEnvelope(options.draft, envelope)
  const payload = validatePayload(packageDraft, options.files)
  const preWriteChecks = buildWriteChecks(
    envelope,
    options.draft,
    payload,
    options.allowPersistentWriteProbe === true
  )
  const preWriteBlockedDiagnostics = diagnosticsForBlockedChecks(preWriteChecks)
  if (preWriteBlockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'package file write probe inputs are inconsistent',
      envelope,
      preWriteChecks,
      preWriteBlockedDiagnostics
    )
  }

  if (options.allowPersistentWriteProbe !== true) {
    return baseResult(
      'deferred',
      'package file write probe is deferred until an isolated persistent write probe is explicitly authorized',
      envelope,
      preWriteChecks,
      []
    )
  }

  let storageReport: ThirdPartyDataPackPackageFilePersistentWriteProbeStorageReport
  try {
    storageReport = (await options.storage.write(envelope.targetPackageId, payload.files)).report
  } catch {
    return baseResult(
      'failed',
      'package file storage adapter failed before returning a write report',
      envelope,
      buildWriteChecks(envelope, options.draft, payload, true),
      diagnosticsForStorageFailure()
    )
  }

  const writeChecks = buildWriteChecks(envelope, options.draft, payload, true, storageReport)
  const blockedDiagnostics = diagnosticsForBlockedChecks(writeChecks)
  if (storageReport.status !== 'written' || blockedDiagnostics.length > 0) {
    return baseResult(
      'failed',
      'package file storage adapter did not complete a contained package-file-only write',
      envelope,
      writeChecks,
      [
        ...cloneDiagnostics(storageReport.diagnostics),
        ...blockedDiagnostics
      ],
      { storageReport }
    )
  }

  return baseResult(
    'written',
    'package file write probe completed an isolated package-file-only persistent write',
    envelope,
    writeChecks,
    cloneDiagnostics(storageReport.diagnostics),
    {
      storageReport,
      packageFilesWritten: true
    }
  )
}
