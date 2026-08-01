import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  ContentPackageSourceError,
  createDiscoveryFileSystemFromContentPackageSource,
  normalizeContentPackageSourceDirectoryEntries,
  normalizeContentPackageSourceDirectoryEntry,
  normalizeContentPackageSourcePath,
  normalizeContentPackageSourceTextPayload,
  readContentPackageSourceIdentity,
  validateContentPackageSourceIdentity,
  toContentPackageSourceHostOperationError,
  type ContentPackageSource,
  type ContentPackageSourceDirectoryEntry,
  type ContentPackageSourceEntryKind,
  type ContentPackageSourceErrorCode,
  type ContentPackageSourceIdentity,
  type ContentPackageSourceKind
} from './contentPackageSource'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { RegistrySet } from './registry'
import {
  buildThirdPartyCandidateRegistrySnapshot,
  type ThirdPartyCandidateIdentitySummary,
  type ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDataPackDiscoveryReport,
  type ThirdPartyDataPackDiscoveryStatus
} from './thirdPartyDataPackDiscovery'
import {
  createThirdPartyDataPackLockfileDraft,
  validateThirdPartyDataPackLockfileDraft
} from './thirdPartyDataPackLockfileDraft'
import { buildThirdPartyDataPackMountInput } from './thirdPartyDataPackMountInput'
import { buildThirdPartyDataPackMountPreflight } from './thirdPartyDataPackMountPreflight'
import { buildThirdPartyDataPackRuntimeAdapterGate } from './thirdPartyDataPackRuntimeAdapterGate'
import { buildThirdPartyDataPackRuntimeMountGate } from './thirdPartyDataPackRuntimeMountGate'
import {
  buildThirdPartyDataPackSourceAdapterGate,
  type ThirdPartyDataPackSourceAdapterGateStatus
} from './thirdPartyDataPackSourceAdapterGate'
import { buildThirdPartyDataPackTransactionPreflight } from './thirdPartyDataPackTransactionPreflight'
import { selectThirdPartyDataPacks } from './thirdPartyDataPackSelection'

export const ELECTRON_READONLY_DIRECTORY_PROBE_SOURCE_KIND =
  'electron-readonly-directory-probe' satisfies ContentPackageSourceKind

export const ELECTRON_READONLY_DIRECTORY_PROBE_SOURCE_ID = 'electron/mods-readonly-probe'
export const ELECTRON_READONLY_DIRECTORY_PROBE_ROOT_PATH = 'mods'
const ELECTRON_READONLY_DIRECTORY_PROBE_INVALID_SOURCE_ID = 'electron/invalid-readonly-probe-source'
const ELECTRON_READONLY_DIRECTORY_PROBE_UNSAFE_PATH = '<unsafe-path>'
const supportedElectronReadonlyProbeOptionsKeys = new Set(['host', 'sourceId', 'rootPath'])
const supportedElectronReadonlyProbeHostKeys = new Set(['getEntry', 'readDirectory', 'readTextFile', 'dispose'])
const requiredElectronReadonlyProbeOptionsKeys = ['host'] as const
const requiredElectronReadonlyProbeHostKeys = ['getEntry', 'readDirectory', 'readTextFile'] as const

export interface ElectronReadonlyDirectoryProbeHost {
  getEntry(path: string): Promise<ContentPackageSourceDirectoryEntry | null>
  readDirectory(path: string): Promise<readonly ContentPackageSourceDirectoryEntry[]>
  readTextFile(path: string): Promise<string>
  dispose?(): Promise<void> | void
}

export interface CreateElectronReadonlyDirectoryProbeSourceOptions {
  readonly host: ElectronReadonlyDirectoryProbeHost
  readonly sourceId?: string
  readonly rootPath?: string
}

export interface ElectronReadonlySourceAdapterProbeEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly runtimeEnablementAllowed: false
  readonly electronIpcExposed: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly packageFilesWritten: false
  readonly platformSourceInspected: true
  readonly sourceHandlesRetained: false
}

export interface ElectronReadonlySourceAdapterProbeReport {
  readonly status: 'ready' | 'blocked'
  readonly reason: string
  readonly sourceIdentity: ContentPackageSourceIdentity
  readonly inspectedPath: string
  readonly inspectedEntryKind: ContentPackageSourceEntryKind | null
  readonly sourceErrorCode?: ContentPackageSourceErrorCode
  readonly effects: ElectronReadonlySourceAdapterProbeEffectSummary
}

export interface ElectronReadonlyRuntimeReadinessProbeEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly runtimeEnablementAllowed: false
  readonly electronIpcExposed: false
  readonly webImportPersisted: false
  readonly androidImportPersisted: false
  readonly platformSourceInspected: true
  readonly platformSourceOpened: false
  readonly sourceHandlesRetained: false
  readonly packageFilesWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
}

export type ElectronReadonlyRuntimeReadinessProbeDiscoveryStatus =
  | ThirdPartyDataPackDiscoveryStatus
  | 'not-run'
  | 'failed'

export interface ElectronReadonlyRuntimeReadinessProbeReport {
  readonly status: ThirdPartyDataPackSourceAdapterGateStatus
  readonly reason: string
  readonly sourceProbeStatus: ElectronReadonlySourceAdapterProbeReport['status']
  readonly discoveryStatus: ElectronReadonlyRuntimeReadinessProbeDiscoveryStatus
  readonly mountInputStatus?: string
  readonly runtimeMountGateStatus?: string
  readonly transactionPreflightStatus?: string
  readonly runtimeAdapterGateStatus?: string
  readonly sourceAdapterGateStatus?: ThirdPartyDataPackSourceAdapterGateStatus
  readonly sourceIdentity: ContentPackageSourceIdentity
  readonly selectedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly diagnosticCount: number
  readonly officialIdentity?: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly runtimePublication: 'deferred'
  readonly sourceContractReadiness?: 'defined'
  readonly contentPackageSourceContractStable?: true
  readonly effects: ElectronReadonlyRuntimeReadinessProbeEffectSummary
}

export interface BuildElectronReadonlyRuntimeReadinessProbeReportOptions {
  readonly source: ContentPackageSource
  readonly officialRegistrySet: RegistrySet
}

const electronReadonlySourceErrorCodes: ReadonlySet<string> = new Set<ContentPackageSourceErrorCode>([
  'SOURCE_IDENTITY_INVALID',
  'SOURCE_DUPLICATE_PATH',
  'SOURCE_ENTRY_UNSAFE',
  'SOURCE_ENTRY_NOT_DIRECTORY',
  'SOURCE_ENTRY_NOT_FILE',
  'SOURCE_ENTRY_NOT_FOUND',
  'SOURCE_JSON_NOT_PURE',
  'SOURCE_JSON_PARSE_FAILED',
  'SOURCE_LIMIT_EXCEEDED',
  'SOURCE_PATH_OUTSIDE_ROOT',
  'SOURCE_PATH_UNSAFE',
  'SOURCE_PERMISSION_REVOKED',
  'SOURCE_DISPOSED'
])

const isElectronReadonlySourceErrorCode = (value: unknown): value is ContentPackageSourceErrorCode =>
  typeof value === 'string' && electronReadonlySourceErrorCodes.has(value)

const readStringErrorField = (
  error: unknown,
  fieldName: string
): { readonly status: 'value'; readonly value: string } | { readonly status: 'missing' | 'unreadable' } => {
  if (typeof error !== 'object' || error === null) return { status: 'missing' }
  try {
    const value = (error as Record<string, unknown>)[fieldName]
    return typeof value === 'string'
      ? { status: 'value', value }
      : { status: 'missing' }
  } catch {
    return { status: 'unreadable' }
  }
}

const errorMessage = (error: unknown): string => {
  const message = readStringErrorField(error, 'message')
  if (message.status === 'value') return message.value
  if (message.status === 'unreadable') return 'Electron read-only source adapter operation failed'
  try {
    return String(error)
  } catch {
    return 'Electron read-only source adapter operation failed'
  }
}

const sourceErrorCode = (error: unknown): ContentPackageSourceErrorCode | undefined => {
  if (!(error instanceof ContentPackageSourceError)) return undefined
  const code = readStringErrorField(error, 'code')
  return code.status === 'value' && isElectronReadonlySourceErrorCode(code.value)
    ? code.value
    : undefined
}

const freezeElectronReadonlySourceAdapterProbeEffects = (
  effects: ElectronReadonlySourceAdapterProbeEffectSummary
): ElectronReadonlySourceAdapterProbeEffectSummary => Object.freeze(effects)

const freezeElectronReadonlyRuntimeReadinessProbeEffects = (
  effects: ElectronReadonlyRuntimeReadinessProbeEffectSummary
): ElectronReadonlyRuntimeReadinessProbeEffectSummary => Object.freeze(effects)

const cloneFrozenOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary | undefined
): ThirdPartyCandidateOfficialIdentitySummary | undefined =>
  identity === undefined ? undefined : Object.freeze({ ...identity })

const cloneFrozenCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined =>
  identity === undefined ? undefined : Object.freeze({ ...identity })

const freezePackageIds = <T extends PackageId>(packageIds: readonly T[]): readonly T[] =>
  Object.freeze([...packageIds])

const freezeElectronReadonlySourceAdapterProbeReport = (
  report: ElectronReadonlySourceAdapterProbeReport
): ElectronReadonlySourceAdapterProbeReport => Object.freeze({
  ...report,
  effects: freezeElectronReadonlySourceAdapterProbeEffects(report.effects)
})

const freezeElectronReadonlyRuntimeReadinessProbeReport = (
  report: ElectronReadonlyRuntimeReadinessProbeReport
): ElectronReadonlyRuntimeReadinessProbeReport => Object.freeze({
  ...report,
  selectedPackageIds: freezePackageIds(report.selectedPackageIds),
  loadOrder: freezePackageIds(report.loadOrder),
  officialIdentity: cloneFrozenOfficialIdentity(report.officialIdentity),
  candidateIdentity: cloneFrozenCandidateIdentity(report.candidateIdentity),
  effects: freezeElectronReadonlyRuntimeReadinessProbeEffects(report.effects)
})

const toElectronReadonlySourceReleaseError = (error: unknown): ContentPackageSourceError =>
  new ContentPackageSourceError(
    sourceErrorCode(error) ?? 'SOURCE_DISPOSED',
    'Content package source release operation failed'
  )

const asProbeMetadataObject = (
  value: unknown,
  code: ContentPackageSourceErrorCode,
  notObjectMessage: string,
  unreadableMessage: string
): Record<string, unknown> => {
  try {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new ContentPackageSourceError(code, notObjectMessage)
    }
  } catch (error) {
    if (error instanceof ContentPackageSourceError) throw error
    throw new ContentPackageSourceError(code, unreadableMessage)
  }
  return value as Record<string, unknown>
}

const readProbeMetadataKeys = (
  metadata: Record<string, unknown>,
  allowedKeys: ReadonlySet<string>,
  code: ContentPackageSourceErrorCode,
  unreadableMessage: string,
  unsupportedMessage: string
): readonly string[] => {
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(metadata)
  } catch {
    throw new ContentPackageSourceError(code, unreadableMessage)
  }
  const stringKeys: string[] = []
  for (const key of keys) {
    if (typeof key !== 'string' || !allowedKeys.has(key)) {
      throw new ContentPackageSourceError(code, unsupportedMessage)
    }
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(metadata, key)
    } catch {
      throw new ContentPackageSourceError(code, unreadableMessage)
    }
    if (descriptor?.enumerable !== true) {
      throw new ContentPackageSourceError(code, unsupportedMessage)
    }
    stringKeys.push(key)
  }
  return stringKeys
}

const assertProbeMetadataHasRequiredKeys = (
  keys: readonly string[],
  requiredKeys: readonly string[],
  code: ContentPackageSourceErrorCode,
  message: string
): void => {
  const ownKeys = new Set(keys)
  if (requiredKeys.some(key => !ownKeys.has(key))) {
    throw new ContentPackageSourceError(code, message)
  }
}

const readProbeMetadataField = (
  metadata: Record<string, unknown>,
  fieldName: string,
  code: ContentPackageSourceErrorCode,
  message: string
): unknown => {
  try {
    return metadata[fieldName]
  } catch {
    throw new ContentPackageSourceError(code, message)
  }
}

const normalizeElectronReadonlyProbeHost = (
  host: unknown
): ElectronReadonlyDirectoryProbeHost => {
  const hostMetadata = asProbeMetadataObject(
    host,
    'SOURCE_ENTRY_UNSAFE',
    'Electron read-only source adapter host metadata must be an object',
    'Electron read-only source adapter host metadata could not be read'
  )
  const keys = readProbeMetadataKeys(
    hostMetadata,
    supportedElectronReadonlyProbeHostKeys,
    'SOURCE_ENTRY_UNSAFE',
    'Electron read-only source adapter host metadata could not be read',
    'Electron read-only source adapter host metadata contains unsupported fields'
  )
  assertProbeMetadataHasRequiredKeys(
    keys,
    requiredElectronReadonlyProbeHostKeys,
    'SOURCE_ENTRY_UNSAFE',
    'Electron read-only source adapter host metadata must include getEntry, readDirectory and readTextFile own fields'
  )
  const getEntry = readProbeMetadataField(
    hostMetadata,
    'getEntry',
    'SOURCE_ENTRY_UNSAFE',
    'Electron read-only source adapter host metadata could not be read'
  )
  const readDirectory = readProbeMetadataField(
    hostMetadata,
    'readDirectory',
    'SOURCE_ENTRY_UNSAFE',
    'Electron read-only source adapter host metadata could not be read'
  )
  const readTextFile = readProbeMetadataField(
    hostMetadata,
    'readTextFile',
    'SOURCE_ENTRY_UNSAFE',
    'Electron read-only source adapter host metadata could not be read'
  )
  if (
    typeof getEntry !== 'function'
    || typeof readDirectory !== 'function'
    || typeof readTextFile !== 'function'
  ) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Electron read-only source adapter host methods must be functions'
    )
  }
  const dispose = keys.includes('dispose')
    ? readProbeMetadataField(
      hostMetadata,
      'dispose',
      'SOURCE_ENTRY_UNSAFE',
      'Electron read-only source adapter host metadata could not be read'
    )
    : undefined
  if (dispose !== undefined && typeof dispose !== 'function') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Electron read-only source adapter host dispose must be a function'
    )
  }

  return {
    getEntry: sourcePath => getEntry.call(hostMetadata, sourcePath),
    readDirectory: sourcePath => readDirectory.call(hostMetadata, sourcePath),
    readTextFile: sourcePath => readTextFile.call(hostMetadata, sourcePath),
    dispose: dispose === undefined
      ? undefined
      : () => dispose.call(hostMetadata)
  }
}

const normalizeElectronReadonlyProbeOptions = (
  options: unknown
): CreateElectronReadonlyDirectoryProbeSourceOptions => {
  const optionsMetadata = asProbeMetadataObject(
    options,
    'SOURCE_IDENTITY_INVALID',
    'Electron read-only source adapter options metadata must be an object',
    'Electron read-only source adapter options metadata could not be read'
  )
  const keys = readProbeMetadataKeys(
    optionsMetadata,
    supportedElectronReadonlyProbeOptionsKeys,
    'SOURCE_IDENTITY_INVALID',
    'Electron read-only source adapter options metadata could not be read',
    'Electron read-only source adapter options metadata contains unsupported fields'
  )
  assertProbeMetadataHasRequiredKeys(
    keys,
    requiredElectronReadonlyProbeOptionsKeys,
    'SOURCE_IDENTITY_INVALID',
    'Electron read-only source adapter options metadata must include host own field'
  )
  const host = normalizeElectronReadonlyProbeHost(readProbeMetadataField(
    optionsMetadata,
    'host',
    'SOURCE_IDENTITY_INVALID',
    'Electron read-only source adapter options metadata could not be read'
  ))
  const sourceId = keys.includes('sourceId')
    ? readProbeMetadataField(
      optionsMetadata,
      'sourceId',
      'SOURCE_IDENTITY_INVALID',
      'Electron read-only source adapter options metadata could not be read'
    )
    : undefined
  const rootPath = keys.includes('rootPath')
    ? readProbeMetadataField(
      optionsMetadata,
      'rootPath',
      'SOURCE_IDENTITY_INVALID',
      'Electron read-only source adapter options metadata could not be read'
    )
    : undefined
  return {
    host,
    sourceId: sourceId as string | undefined,
    rootPath: rootPath as string | undefined
  }
}

const normalizeIdentityPart = (value: unknown, fieldName: string): string => {
  let normalized: string
  try {
    normalized = normalizeContentPackageSourcePath(value)
  } catch {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      `${fieldName} must be a normalized relative identifier`
    )
  }
  if (normalized === '' || normalized !== value) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      `${fieldName} must be non-empty and already normalized`
    )
  }
  return normalized
}

const normalizeElectronReadonlyProbePath = (sourcePath: unknown): string => {
  if (typeof sourcePath !== 'string') {
    throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', 'Content package source path is unsafe')
  }
  if (sourcePath.includes('\\')) {
    throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', 'Content package source path is unsafe')
  }
  return normalizeContentPackageSourcePath(sourcePath)
}

const createRedactedElectronReadonlySourceIdentity = (): ContentPackageSourceIdentity =>
  validateContentPackageSourceIdentity({
    contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
    kind: ELECTRON_READONLY_DIRECTORY_PROBE_SOURCE_KIND,
    sourceId: ELECTRON_READONLY_DIRECTORY_PROBE_INVALID_SOURCE_ID,
    rootPath: ELECTRON_READONLY_DIRECTORY_PROBE_ROOT_PATH
  })

const normalizeEntry = (
  entry: ContentPackageSourceDirectoryEntry | null
): ContentPackageSourceDirectoryEntry | null => {
  if (entry === null) return null
  return normalizeContentPackageSourceDirectoryEntry(entry)
}

const sourcePathEntryName = (
  sourcePath: string,
  sourceIdentity: ContentPackageSourceIdentity
): string => {
  const pathForName = sourcePath === '' ? sourceIdentity.rootPath : sourcePath
  const separatorIndex = pathForName.lastIndexOf('/')
  return separatorIndex === -1 ? pathForName : pathForName.slice(separatorIndex + 1)
}

const assertDirectoryProbeRoot = (
  entry: ContentPackageSourceDirectoryEntry | null,
  sourcePath: string,
  expectedName: string
): ContentPackageSourceDirectoryEntry => {
  if (entry === null) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_NOT_FOUND',
      'Electron read-only source adapter probe root was not found',
      sourcePath
    )
  }
  if (entry.name !== expectedName) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Electron read-only source adapter probe root metadata does not match requested path',
      sourcePath
    )
  }
  if (entry.kind !== 'directory') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_NOT_DIRECTORY',
      'Electron read-only source adapter probe root must be a directory',
      sourcePath
    )
  }
  if (entry.isSymbolicLink) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      'Electron read-only source adapter probe root must not be a symbolic link',
      sourcePath
    )
  }
  return entry
}

export const createElectronReadonlySourceAdapterProbeEffects =
  (): ElectronReadonlySourceAdapterProbeEffectSummary => freezeElectronReadonlySourceAdapterProbeEffects({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    runtimeEnablementAllowed: false,
    electronIpcExposed: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    packageFilesWritten: false,
    platformSourceInspected: true,
    sourceHandlesRetained: false
  })

export const createElectronReadonlyRuntimeReadinessProbeEffects =
  (): ElectronReadonlyRuntimeReadinessProbeEffectSummary => freezeElectronReadonlyRuntimeReadinessProbeEffects({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    runtimeEnablementAllowed: false,
    electronIpcExposed: false,
    webImportPersisted: false,
    androidImportPersisted: false,
    platformSourceInspected: true,
    platformSourceOpened: false,
    sourceHandlesRetained: false,
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false
  })

const countRegistryEntries = (registrySet: RegistrySet): number =>
  registrySet.registryIds().reduce(
    (total, registryId) => total + registrySet.get(registryId).entries().length,
    0
  )

const createBlockedReadinessReport = (
  reason: string,
  sourceProbeStatus: ElectronReadonlySourceAdapterProbeReport['status'],
  sourceIdentity: ContentPackageSourceIdentity,
  officialRegistrySet: RegistrySet,
  discoveryStatus: ElectronReadonlyRuntimeReadinessProbeDiscoveryStatus,
  diagnosticCount: number
): ElectronReadonlyRuntimeReadinessProbeReport => freezeElectronReadonlyRuntimeReadinessProbeReport({
  status: 'blocked',
  reason,
  sourceProbeStatus,
  discoveryStatus,
  sourceIdentity,
  selectedPackageIds: [],
  loadOrder: [],
  registryCount: officialRegistrySet.registryIds().length,
  entryCount: countRegistryEntries(officialRegistrySet),
  packageCount: 0,
  diagnosticCount,
  runtimePublication: 'deferred',
  effects: createElectronReadonlyRuntimeReadinessProbeEffects()
})

const bindValidatedSourceIdentity = (
  source: ContentPackageSource,
  sourceIdentity: ContentPackageSourceIdentity
): ContentPackageSource => ({
  identity: sourceIdentity,
  getEntry: path => source.getEntry(path),
  readDirectory: path => source.readDirectory(path),
  readTextFile: path => source.readTextFile(path),
  dispose: () => source.dispose()
})

export const createElectronReadonlyDirectoryProbeSource = (
  options: CreateElectronReadonlyDirectoryProbeSourceOptions
): ContentPackageSource => {
  const normalizedOptions = normalizeElectronReadonlyProbeOptions(options)
  const sourceId = normalizeIdentityPart(
    normalizedOptions.sourceId ?? ELECTRON_READONLY_DIRECTORY_PROBE_SOURCE_ID,
    'sourceId'
  )
  const rootPath = normalizeIdentityPart(
    normalizedOptions.rootPath ?? ELECTRON_READONLY_DIRECTORY_PROBE_ROOT_PATH,
    'rootPath'
  )
  const host = normalizedOptions.host
  let disposed = false

  const assertAvailable = (): void => {
    if (disposed) {
      throw new ContentPackageSourceError(
        'SOURCE_DISPOSED',
        'Electron read-only source adapter probe has been disposed'
      )
    }
  }

  const normalizePath = (sourcePath: string): string => normalizeElectronReadonlyProbePath(sourcePath)

  return {
    identity: validateContentPackageSourceIdentity({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: ELECTRON_READONLY_DIRECTORY_PROBE_SOURCE_KIND,
      sourceId,
      rootPath
    }),
    async getEntry(sourcePath) {
      assertAvailable()
      const normalizedPath = normalizePath(sourcePath)
      try {
        return normalizeEntry(await host.getEntry(normalizedPath))
      } catch (error) {
        throw toContentPackageSourceHostOperationError('inspect', error, normalizedPath)
      }
    },
    async readDirectory(sourcePath) {
      assertAvailable()
      const normalizedPath = normalizePath(sourcePath)
      let entries: readonly ContentPackageSourceDirectoryEntry[]
      try {
        entries = await host.readDirectory(normalizedPath)
      } catch (error) {
        throw toContentPackageSourceHostOperationError(
          'list',
          error,
          normalizedPath,
          'SOURCE_ENTRY_NOT_DIRECTORY'
        )
      }
      return normalizeContentPackageSourceDirectoryEntries(entries)
    },
    async readTextFile(sourcePath) {
      assertAvailable()
      const normalizedPath = normalizePath(sourcePath)
      try {
        return normalizeContentPackageSourceTextPayload(
          await host.readTextFile(normalizedPath),
          normalizedPath
        )
      } catch (error) {
        throw toContentPackageSourceHostOperationError('read', error, normalizedPath)
      }
    },
    async dispose() {
      if (disposed) return
      disposed = true
      try {
        await host.dispose?.()
      } catch (error) {
        throw toElectronReadonlySourceReleaseError(error)
      }
    }
  }
}

export const buildElectronReadonlyRuntimeReadinessProbeReport = async(
  options: BuildElectronReadonlyRuntimeReadinessProbeReportOptions
): Promise<ElectronReadonlyRuntimeReadinessProbeReport> => {
  const sourceProbe = await buildElectronReadonlySourceAdapterProbeReport(options.source)
  if (sourceProbe.status !== 'ready') {
    return createBlockedReadinessReport(
      sourceProbe.reason,
      sourceProbe.status,
      sourceProbe.sourceIdentity,
      options.officialRegistrySet,
      'not-run',
      sourceProbe.sourceErrorCode ? 1 : 0
    )
  }

  let discoveryReport: ThirdPartyDataPackDiscoveryReport
  try {
    discoveryReport = await discoverThirdPartyDataPacks(
      sourceProbe.sourceIdentity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(
        bindValidatedSourceIdentity(options.source, sourceProbe.sourceIdentity)
      )
    )
  } catch (error) {
    return createBlockedReadinessReport(
      errorMessage(error),
      sourceProbe.status,
      sourceProbe.sourceIdentity,
      options.officialRegistrySet,
      'failed',
      1
    )
  }
  if (discoveryReport.status === 'directory-not-found') {
    return createBlockedReadinessReport(
      'discovery failed',
      sourceProbe.status,
      sourceProbe.sourceIdentity,
      options.officialRegistrySet,
      discoveryReport.status,
      discoveryReport.summary.issueCount
    )
  }

  const selectionReport = selectThirdPartyDataPacks(discoveryReport)
  const candidateSnapshot = buildThirdPartyCandidateRegistrySnapshot({
    officialRegistrySet: options.officialRegistrySet,
    discoveryReport,
    selectionReport
  })
  const lockfileDraftResult = createThirdPartyDataPackLockfileDraft({
    discoveryReport,
    selectionReport,
    candidateSnapshot
  })
  const lockfileValidationResult = validateThirdPartyDataPackLockfileDraft({
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    draft: lockfileDraftResult.draft
  })
  const preflight = buildThirdPartyDataPackMountPreflight({
    officialRegistrySet: options.officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult
  })
  const mountInput = buildThirdPartyDataPackMountInput({
    officialRegistrySet: options.officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult,
    preflight
  })
  const runtimeGate = buildThirdPartyDataPackRuntimeMountGate({
    officialRegistrySet: options.officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult,
    preflight,
    mountInput
  })
  const transactionPreflight = buildThirdPartyDataPackTransactionPreflight({
    officialRegistrySet: options.officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult,
    preflight,
    mountInput,
    runtimeGate
  })
  const runtimeAdapterGate = buildThirdPartyDataPackRuntimeAdapterGate({
    officialRegistrySet: options.officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult,
    preflight,
    mountInput,
    runtimeGate,
    transactionPreflight
  })
  const sourceAdapterGate = buildThirdPartyDataPackSourceAdapterGate({
    officialRegistrySet: options.officialRegistrySet,
    discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult,
    preflight,
    mountInput,
    runtimeGate,
    transactionPreflight,
    runtimeAdapterGate
  })

  return freezeElectronReadonlyRuntimeReadinessProbeReport({
    status: sourceAdapterGate.status,
    reason: sourceAdapterGate.reason,
    sourceProbeStatus: sourceProbe.status,
    discoveryStatus: discoveryReport.status,
    mountInputStatus: mountInput.status,
    runtimeMountGateStatus: runtimeGate.status,
    transactionPreflightStatus: transactionPreflight.status,
    runtimeAdapterGateStatus: runtimeAdapterGate.status,
    sourceAdapterGateStatus: sourceAdapterGate.status,
    sourceIdentity: sourceProbe.sourceIdentity,
    selectedPackageIds: [...sourceAdapterGate.selectedPackageIds],
    loadOrder: [...sourceAdapterGate.loadOrder],
    registryCount: sourceAdapterGate.registryCount,
    entryCount: sourceAdapterGate.entryCount,
    packageCount: sourceAdapterGate.packageCount,
    diagnosticCount: sourceAdapterGate.diagnostics.length,
    officialIdentity: sourceAdapterGate.officialIdentity,
    candidateIdentity: sourceAdapterGate.candidateIdentity,
    lockfileHash: sourceAdapterGate.lockfileHash,
    runtimePublication: 'deferred',
    sourceContractReadiness: sourceAdapterGate.sourceContractReadiness,
    contentPackageSourceContractStable: sourceAdapterGate.contentPackageSourceContractStable,
    effects: createElectronReadonlyRuntimeReadinessProbeEffects()
  })
}

export const buildElectronReadonlySourceAdapterProbeReport = async(
  source: ContentPackageSource,
  inspectedPath = ''
): Promise<ElectronReadonlySourceAdapterProbeReport> => {
  const effects = createElectronReadonlySourceAdapterProbeEffects()
  let normalizedInspectedPath = inspectedPath
  let reportedInspectedPath = ELECTRON_READONLY_DIRECTORY_PROBE_UNSAFE_PATH
  let validatedSourceIdentity: ContentPackageSourceIdentity | undefined
  const fallbackSourceIdentity = createRedactedElectronReadonlySourceIdentity()
  try {
    normalizedInspectedPath = normalizeElectronReadonlyProbePath(inspectedPath)
    reportedInspectedPath = normalizedInspectedPath
    const sourceIdentity = readContentPackageSourceIdentity(source, normalizedInspectedPath)
    validatedSourceIdentity = sourceIdentity
    let inspectedEntry: ContentPackageSourceDirectoryEntry | null
    try {
      inspectedEntry = await source.getEntry(normalizedInspectedPath)
    } catch (error) {
      throw toContentPackageSourceHostOperationError('inspect', error, normalizedInspectedPath)
    }
    const entry = assertDirectoryProbeRoot(
      normalizeEntry(inspectedEntry),
      normalizedInspectedPath,
      sourcePathEntryName(normalizedInspectedPath, sourceIdentity)
    )
    return freezeElectronReadonlySourceAdapterProbeReport({
      status: 'ready',
      reason: 'electron read-only source adapter probe inspected the source without enabling runtime mounting',
      sourceIdentity,
      inspectedPath: normalizedInspectedPath,
      inspectedEntryKind: entry.kind,
      effects
    })
  } catch (error) {
    return freezeElectronReadonlySourceAdapterProbeReport({
      status: 'blocked',
      reason: errorMessage(error),
      sourceIdentity: validatedSourceIdentity ?? fallbackSourceIdentity,
      inspectedPath: reportedInspectedPath,
      inspectedEntryKind: null,
      sourceErrorCode: sourceErrorCode(error),
      effects
    })
  }
}
