import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  ContentPackageSourceError,
  createDiscoveryFileSystemFromContentPackageSource,
  normalizeContentPackageSourceDirectoryEntries,
  normalizeContentPackageSourceDirectoryEntry,
  normalizeContentPackageSourcePath,
  normalizeContentPackageSourceTextPayload,
  readContentPackageSourceIdentity,
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

const toElectronReadonlySourceReleaseError = (error: unknown): ContentPackageSourceError =>
  new ContentPackageSourceError(
    sourceErrorCode(error) ?? 'SOURCE_DISPOSED',
    'Content package source release operation failed'
  )

const normalizeIdentityPart = (value: string, fieldName: string): string => {
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

const normalizeElectronReadonlyProbePath = (sourcePath: string): string => {
  if (sourcePath.includes('\\')) {
    throw new ContentPackageSourceError('SOURCE_PATH_UNSAFE', 'Content package source path is unsafe')
  }
  return normalizeContentPackageSourcePath(sourcePath)
}

const createRedactedElectronReadonlySourceIdentity = (): ContentPackageSourceIdentity => ({
  contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  kind: ELECTRON_READONLY_DIRECTORY_PROBE_SOURCE_KIND,
  sourceId: ELECTRON_READONLY_DIRECTORY_PROBE_INVALID_SOURCE_ID,
  rootPath: ELECTRON_READONLY_DIRECTORY_PROBE_ROOT_PATH
})

const safeProbeReportSourceIdentity = (
  source: ContentPackageSource
): ContentPackageSourceIdentity => {
  try {
    return readContentPackageSourceIdentity(source)
  } catch {
    return createRedactedElectronReadonlySourceIdentity()
  }
}

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
  (): ElectronReadonlySourceAdapterProbeEffectSummary => ({
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
  (): ElectronReadonlyRuntimeReadinessProbeEffectSummary => ({
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
): ElectronReadonlyRuntimeReadinessProbeReport => ({
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
  const sourceId = normalizeIdentityPart(
    options.sourceId ?? ELECTRON_READONLY_DIRECTORY_PROBE_SOURCE_ID,
    'sourceId'
  )
  const rootPath = normalizeIdentityPart(
    options.rootPath ?? ELECTRON_READONLY_DIRECTORY_PROBE_ROOT_PATH,
    'rootPath'
  )
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
    identity: {
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: ELECTRON_READONLY_DIRECTORY_PROBE_SOURCE_KIND,
      sourceId,
      rootPath
    },
    async getEntry(sourcePath) {
      assertAvailable()
      const normalizedPath = normalizePath(sourcePath)
      try {
        return normalizeEntry(await options.host.getEntry(normalizedPath))
      } catch (error) {
        throw toContentPackageSourceHostOperationError('inspect', error, normalizedPath)
      }
    },
    async readDirectory(sourcePath) {
      assertAvailable()
      const normalizedPath = normalizePath(sourcePath)
      let entries: readonly ContentPackageSourceDirectoryEntry[]
      try {
        entries = await options.host.readDirectory(normalizedPath)
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
          await options.host.readTextFile(normalizedPath),
          normalizedPath
        )
      } catch (error) {
        throw toContentPackageSourceHostOperationError('read', error, normalizedPath)
      }
    },
    async dispose() {
      disposed = true
      try {
        await options.host.dispose?.()
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

  return {
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
  }
}

export const buildElectronReadonlySourceAdapterProbeReport = async(
  source: ContentPackageSource,
  inspectedPath = ''
): Promise<ElectronReadonlySourceAdapterProbeReport> => {
  const effects = createElectronReadonlySourceAdapterProbeEffects()
  let normalizedInspectedPath = inspectedPath
  let reportedInspectedPath = ELECTRON_READONLY_DIRECTORY_PROBE_UNSAFE_PATH
  try {
    normalizedInspectedPath = normalizeElectronReadonlyProbePath(inspectedPath)
    reportedInspectedPath = normalizedInspectedPath
    const sourceIdentity = readContentPackageSourceIdentity(source, normalizedInspectedPath)
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
    return {
      status: 'ready',
      reason: 'electron read-only source adapter probe inspected the source without enabling runtime mounting',
      sourceIdentity,
      inspectedPath: normalizedInspectedPath,
      inspectedEntryKind: entry.kind,
      effects
    }
  } catch (error) {
    return {
      status: 'blocked',
      reason: errorMessage(error),
      sourceIdentity: safeProbeReportSourceIdentity(source),
      inspectedPath: reportedInspectedPath,
      inspectedEntryKind: null,
      sourceErrorCode: sourceErrorCode(error),
      effects
    }
  }
}
