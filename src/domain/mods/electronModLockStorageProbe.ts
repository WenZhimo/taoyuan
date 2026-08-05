import path from 'node:path'
import type { JsonValue } from './canonicalJson'
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

const cloneJsonValue = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) return value.map(item => cloneJsonValue(item))
  if (value !== null && typeof value === 'object') {
    const result: Record<string, JsonValue> = {}
    for (const [key, entryValue] of Object.entries(value)) result[key] = cloneJsonValue(entryValue)
    return result
  }
  return value
}

const cloneDiagnosticDetails = (
  details: ModDiagnostic['details']
): ModDiagnostic['details'] => {
  if (details === undefined) return undefined
  const result: Record<string, JsonValue> = {}
  for (const [key, value] of Object.entries(details)) result[key] = cloneJsonValue(value)
  return result
}

const cloneDiagnostic = (diagnostic: ModDiagnostic): ModDiagnostic => ({
  code: diagnostic.code,
  ruleId: diagnostic.ruleId,
  severity: diagnostic.severity,
  stage: diagnostic.stage,
  messageKey: diagnostic.messageKey,
  packageId: diagnostic.packageId,
  file: diagnostic.file,
  fieldPath: diagnostic.fieldPath,
  registryId: diagnostic.registryId,
  contentId: diagnostic.contentId,
  relatedPackageIds: diagnostic.relatedPackageIds ? [...diagnostic.relatedPackageIds] : undefined,
  details: cloneDiagnosticDetails(diagnostic.details),
  recovery: diagnostic.recovery
})

const cloneDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] =>
  diagnostics.map(diagnostic => cloneDiagnostic(diagnostic))

const readOwnDiagnostics = (error: unknown): readonly ModDiagnostic[] | undefined => {
  if (error === null || typeof error !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(error, 'diagnostics')
  } catch {
    return undefined
  }
  if (descriptor === undefined || !('value' in descriptor) || !Array.isArray(descriptor.value)) {
    return undefined
  }
  return descriptor.value as readonly ModDiagnostic[]
}

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) deepFreezeObjectGraph(child)
  }
  return value
}

const cloneStoragePaths = (
  paths: ThirdPartyDataPackModLockStoragePaths | undefined
): ThirdPartyDataPackModLockStoragePaths | undefined =>
  paths === undefined ? undefined : { ...paths }

const freezeProbeReport = (
  report: ElectronThirdPartyDataPackModLockStorageProbeReport
): ElectronThirdPartyDataPackModLockStorageProbeReport => deepFreezeObjectGraph(report)

const freezeProbeReadResult = (
  result: ElectronThirdPartyDataPackModLockStorageProbeReadResult
): ElectronThirdPartyDataPackModLockStorageProbeReadResult => deepFreezeObjectGraph(result)

const freezeProbeWriteResult = (
  result: ElectronThirdPartyDataPackModLockStorageProbeWriteResult
): ElectronThirdPartyDataPackModLockStorageProbeWriteResult => deepFreezeObjectGraph(result)

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
  const diagnostics = readOwnDiagnostics(error)
  if (diagnostics !== undefined) return cloneDiagnostics(diagnostics)

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
): ElectronThirdPartyDataPackModLockStorageProbeReport => freezeProbeReport({
  status: storageReport.status,
  operation: storageReport.operation,
  storageKind: storageReport.storageKind,
  reason: storageReport.reason,
  programDirectorySource: resolution.programDirectorySource,
  configuredUserDataPath: resolution.configuredUserDataPath,
  paths: cloneStoragePaths(storageReport.paths),
  diagnostics: cloneDiagnostics(storageReport.diagnostics),
  effects: createProbeEffects(storageReport.effects)
})

const createFailureReport = (
  operation: ThirdPartyDataPackModLockStorageOperation,
  error: unknown
): ElectronThirdPartyDataPackModLockStorageProbeReport => freezeProbeReport({
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
        return freezeProbeReadResult({
          draft: result.draft,
          report: toProbeReport(result.report, resolution)
        })
      } catch (error) {
        return freezeProbeReadResult({
          draft: null,
          report: createFailureReport('read', error)
        })
      }
    },
    async write(draftValue) {
      try {
        const resolution = resolve()
        const result = await createStorageAdapter(resolution, options.fileOptions).write(draftValue)
        return freezeProbeWriteResult({
          report: toProbeReport(result.report, resolution)
        })
      } catch (error) {
        return freezeProbeWriteResult({
          report: createFailureReport('write', error)
        })
      }
    }
  }
}
