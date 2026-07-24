import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  ContentPackageSourceError,
  createDiscoveryFileSystemFromContentPackageSource,
  normalizeContentPackageSourceDirectoryEntries,
  normalizeContentPackageSourceDirectoryEntry,
  normalizeContentPackageSourcePath,
  validateContentPackageSourceIdentity,
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

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error)

const sourceErrorCode = (error: unknown): ContentPackageSourceErrorCode | undefined =>
  error instanceof ContentPackageSourceError ? error.code : undefined

const normalizeIdentityPart = (value: string, fieldName: string): string => {
  let normalized: string
  try {
    normalized = normalizeContentPackageSourcePath(value)
  } catch (error) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      `${fieldName} must be a normalized relative identifier: ${errorMessage(error)}`,
      value
    )
  }
  if (normalized === '' || normalized !== value) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      `${fieldName} must be non-empty and already normalized`,
      value
    )
  }
  return normalized
}

const normalizeEntry = (
  entry: ContentPackageSourceDirectoryEntry | null
): ContentPackageSourceDirectoryEntry | null => {
  if (entry === null) return null
  return normalizeContentPackageSourceDirectoryEntry(entry)
}

const assertDirectoryProbeRoot = (
  entry: ContentPackageSourceDirectoryEntry | null,
  sourcePath: string
): ContentPackageSourceDirectoryEntry => {
  if (entry === null) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_NOT_FOUND',
      'Electron read-only source adapter probe root was not found',
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

  const normalizePath = (sourcePath: string): string => normalizeContentPackageSourcePath(sourcePath)

  return {
    identity: {
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: ELECTRON_READONLY_DIRECTORY_PROBE_SOURCE_KIND,
      sourceId,
      rootPath
    },
    async getEntry(sourcePath) {
      assertAvailable()
      return normalizeEntry(await options.host.getEntry(normalizePath(sourcePath)))
    },
    async readDirectory(sourcePath) {
      assertAvailable()
      const entries = await options.host.readDirectory(normalizePath(sourcePath))
      return normalizeContentPackageSourceDirectoryEntries(entries)
    },
    async readTextFile(sourcePath) {
      assertAvailable()
      return options.host.readTextFile(normalizePath(sourcePath))
    },
    async dispose() {
      disposed = true
      await options.host.dispose?.()
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
      options.source.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(options.source)
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
  try {
    normalizedInspectedPath = normalizeContentPackageSourcePath(inspectedPath)
    const sourceIdentity = validateContentPackageSourceIdentity(source.identity)
    const entry = assertDirectoryProbeRoot(
      await source.getEntry(normalizedInspectedPath),
      normalizedInspectedPath
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
      sourceIdentity: source.identity,
      inspectedPath: normalizedInspectedPath,
      inspectedEntryKind: null,
      sourceErrorCode: sourceErrorCode(error),
      effects
    }
  }
}
