import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  ContentPackageSourceError,
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

export const buildElectronReadonlySourceAdapterProbeReport = async(
  source: ContentPackageSource,
  inspectedPath = ''
): Promise<ElectronReadonlySourceAdapterProbeReport> => {
  const effects = createElectronReadonlySourceAdapterProbeEffects()
  let normalizedInspectedPath = inspectedPath
  try {
    normalizedInspectedPath = normalizeContentPackageSourcePath(inspectedPath)
    const sourceIdentity = validateContentPackageSourceIdentity(source.identity)
    const entry = await source.getEntry(normalizedInspectedPath)
    return {
      status: 'ready',
      reason: 'electron read-only source adapter probe inspected the source without enabling runtime mounting',
      sourceIdentity,
      inspectedPath: normalizedInspectedPath,
      inspectedEntryKind: entry?.kind ?? null,
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
