import path from 'node:path'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import {
  createThirdPartyDataPackModLockStorageAdapter,
  THIRD_PARTY_DATA_PACK_MOD_LOCK_STORAGE_KIND,
  type ThirdPartyDataPackModLockStorageAdapter,
  type ThirdPartyDataPackModLockStorageEffects,
  type ThirdPartyDataPackModLockStorageOperation,
  type ThirdPartyDataPackModLockStoragePaths,
  type ThirdPartyDataPackModLockStorageReport,
  type ThirdPartyDataPackModLockStorageStatus
} from './thirdPartyDataPackModLockStorage'
import type { ThirdPartyDataPackModLockFileOptions } from './thirdPartyDataPackModLockFile'
import type { ThirdPartyDataPackLockfileDraft } from './thirdPartyDataPackLockfileDraft'

export type ElectronThirdPartyDataPackModLockProgramDirectorySource =
  | 'portable-executable-directory'
  | 'executable-path-directory'

export interface ElectronThirdPartyDataPackModLockPathHost {
  readonly isPackaged: boolean
  readonly executablePath: string
  readonly portableExecutableDirectory?: string | null
  readonly configuredUserDataPath?: string | null
}

export interface ElectronThirdPartyDataPackModLockProgramDirectoryResolution {
  readonly programDirectoryPath: string
  readonly programDirectorySource: ElectronThirdPartyDataPackModLockProgramDirectorySource
  readonly configuredUserDataPath?: string
}

export interface ElectronThirdPartyDataPackModLockStorageProbeEffects
  extends ThirdPartyDataPackModLockStorageEffects {
  readonly electronMainProcessBoundaryInspected: true
  readonly configuredUserDataPathUsed: false
  readonly systemUserDataFallbackAllowed: false
  readonly desktopStartupChanged: false
}

export interface ElectronThirdPartyDataPackModLockStorageProbeReport {
  readonly status: ThirdPartyDataPackModLockStorageStatus
  readonly operation: ThirdPartyDataPackModLockStorageOperation
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_MOD_LOCK_STORAGE_KIND
  readonly reason: string
  readonly programDirectorySource?: ElectronThirdPartyDataPackModLockProgramDirectorySource
  readonly configuredUserDataPath?: string
  readonly paths?: ThirdPartyDataPackModLockStoragePaths
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ElectronThirdPartyDataPackModLockStorageProbeEffects
}

export interface ElectronThirdPartyDataPackModLockStorageProbeReadResult {
  readonly report: ElectronThirdPartyDataPackModLockStorageProbeReport
  readonly draft: ThirdPartyDataPackLockfileDraft | null
}

export interface ElectronThirdPartyDataPackModLockStorageProbeWriteResult {
  readonly report: ElectronThirdPartyDataPackModLockStorageProbeReport
}

export interface CreateElectronThirdPartyDataPackModLockStorageProbeOptions {
  readonly host: ElectronThirdPartyDataPackModLockPathHost
  readonly fileOptions?: ThirdPartyDataPackModLockFileOptions
}

export interface ElectronThirdPartyDataPackModLockStorageProbe {
  inspect(): Promise<ElectronThirdPartyDataPackModLockStorageProbeReport>
  read(): Promise<ElectronThirdPartyDataPackModLockStorageProbeReadResult>
  write(draftValue: unknown): Promise<ElectronThirdPartyDataPackModLockStorageProbeWriteResult>
}

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error)

const pathProbeDiagnostic = (
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
): readonly ModDiagnostic[] => {
  if (
    error !== null
    && typeof error === 'object'
    && 'diagnostics' in error
    && Array.isArray((error as { diagnostics?: unknown }).diagnostics)
  ) {
    return (error as { diagnostics: readonly ModDiagnostic[] }).diagnostics
  }

  return [pathProbeDiagnostic(stage, { message: errorMessage(error) })]
}

const toObservedPath = (value?: string | null): string | undefined =>
  typeof value === 'string' && value.length > 0 ? path.resolve(value) : undefined

const requireAbsolutePath = (value: string, fieldName: string): string => {
  if (!path.isAbsolute(value)) {
    throw new Error(`${fieldName} must be absolute`)
  }
  return path.resolve(value)
}

export const resolveElectronThirdPartyDataPackModLockProgramDirectoryPath = (
  host: ElectronThirdPartyDataPackModLockPathHost
): ElectronThirdPartyDataPackModLockProgramDirectoryResolution => {
  if (!host.isPackaged) {
    throw new Error('Electron mod-lock storage probe is only available for packaged builds')
  }

  const configuredUserDataPath = toObservedPath(host.configuredUserDataPath)
  const portableExecutableDirectory = host.portableExecutableDirectory
  if (typeof portableExecutableDirectory === 'string' && portableExecutableDirectory.length > 0) {
    return {
      programDirectoryPath: requireAbsolutePath(
        portableExecutableDirectory,
        'portableExecutableDirectory'
      ),
      programDirectorySource: 'portable-executable-directory',
      configuredUserDataPath
    }
  }

  return {
    programDirectoryPath: path.dirname(requireAbsolutePath(host.executablePath, 'executablePath')),
    programDirectorySource: 'executable-path-directory',
    configuredUserDataPath
  }
}

const createProbeEffects = (
  storageEffects: ThirdPartyDataPackModLockStorageEffects
): ElectronThirdPartyDataPackModLockStorageProbeEffects => ({
  ...storageEffects,
  electronMainProcessBoundaryInspected: true,
  configuredUserDataPathUsed: false,
  systemUserDataFallbackAllowed: false,
  desktopStartupChanged: false
})

const toProbeReport = (
  storageReport: ThirdPartyDataPackModLockStorageReport,
  resolution: ElectronThirdPartyDataPackModLockProgramDirectoryResolution
): ElectronThirdPartyDataPackModLockStorageProbeReport => ({
  status: storageReport.status,
  operation: storageReport.operation,
  storageKind: storageReport.storageKind,
  reason: storageReport.reason,
  programDirectorySource: resolution.programDirectorySource,
  configuredUserDataPath: resolution.configuredUserDataPath,
  paths: storageReport.paths,
  diagnostics: storageReport.diagnostics,
  effects: createProbeEffects(storageReport.effects)
})

const createFailureReport = (
  operation: ThirdPartyDataPackModLockStorageOperation,
  error: unknown
): ElectronThirdPartyDataPackModLockStorageProbeReport => ({
  status: 'failed',
  operation,
  storageKind: THIRD_PARTY_DATA_PACK_MOD_LOCK_STORAGE_KIND,
  reason: 'electron main-process program-directory mod-lock storage path could not be resolved',
  diagnostics: diagnosticsForError(`third-party.mod-lock.electron-path.${operation}`, error),
  effects: createProbeEffects({
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    runtimeEnablementAllowed: false,
    electronIpcExposed: false,
    packageFilesWritten: false,
    packageBackupsWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false
  })
})

const createStorageAdapter = (
  resolution: ElectronThirdPartyDataPackModLockProgramDirectoryResolution,
  fileOptions?: ThirdPartyDataPackModLockFileOptions
): ThirdPartyDataPackModLockStorageAdapter =>
  createThirdPartyDataPackModLockStorageAdapter({
    programDirectoryPath: resolution.programDirectoryPath,
    fileOptions
  })

export const createElectronThirdPartyDataPackModLockStorageProbe = (
  options: CreateElectronThirdPartyDataPackModLockStorageProbeOptions
): ElectronThirdPartyDataPackModLockStorageProbe => {
  const resolve = (): ElectronThirdPartyDataPackModLockProgramDirectoryResolution =>
    resolveElectronThirdPartyDataPackModLockProgramDirectoryPath(options.host)

  return {
    async inspect() {
      try {
        const resolution = resolve()
        const report = await createStorageAdapter(resolution, options.fileOptions).inspect()
        return toProbeReport(report, resolution)
      } catch (error) {
        return createFailureReport('inspect', error)
      }
    },
    async read() {
      try {
        const resolution = resolve()
        const result = await createStorageAdapter(resolution, options.fileOptions).read()
        return {
          draft: result.draft,
          report: toProbeReport(result.report, resolution)
        }
      } catch (error) {
        return {
          draft: null,
          report: createFailureReport('read', error)
        }
      }
    },
    async write(draftValue) {
      try {
        const resolution = resolve()
        const result = await createStorageAdapter(resolution, options.fileOptions).write(draftValue)
        return {
          report: toProbeReport(result.report, resolution)
        }
      } catch (error) {
        return {
          report: createFailureReport('write', error)
        }
      }
    }
  }
}
