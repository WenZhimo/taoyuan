import path from 'node:path'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import {
  getThirdPartyDataPackModLockFilePaths,
  readThirdPartyDataPackModLockFile,
  writeThirdPartyDataPackModLockFile,
  type ThirdPartyDataPackModLockFileOptions,
  type ThirdPartyDataPackModLockFilePaths
} from './thirdPartyDataPackModLockFile'
import type { ThirdPartyDataPackLockfileDraft } from './thirdPartyDataPackLockfileDraft'

export const THIRD_PARTY_DATA_PACK_MOD_LOCK_USERDATA_DIRECTORY_NAME = 'userdata'
export const THIRD_PARTY_DATA_PACK_MOD_LOCK_STORAGE_KIND = 'electron-program-directory-userdata'

export type ThirdPartyDataPackModLockStorageStatus =
  | 'ready'
  | 'missing'
  | 'loaded'
  | 'written'
  | 'failed'
export type ThirdPartyDataPackModLockStorageOperation = 'inspect' | 'read' | 'write'
export type ThirdPartyDataPackModLockProgramDirectoryProvider =
  | string
  | (() => string | Promise<string>)

export interface ThirdPartyDataPackModLockStoragePaths {
  readonly programDirectoryPath: string
  readonly userDataPath: string
  readonly filePath: string
}

export interface ThirdPartyDataPackModLockStorageEffects {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly runtimeEnablementAllowed: false
  readonly electronIpcExposed: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly lockfileWritten: boolean
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
}

export interface ThirdPartyDataPackModLockStorageReport {
  readonly status: ThirdPartyDataPackModLockStorageStatus
  readonly operation: ThirdPartyDataPackModLockStorageOperation
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_MOD_LOCK_STORAGE_KIND
  readonly reason: string
  readonly paths?: ThirdPartyDataPackModLockStoragePaths
  readonly diagnostics: readonly ModDiagnostic[]
  readonly effects: ThirdPartyDataPackModLockStorageEffects
}

export interface ThirdPartyDataPackModLockStorageReadResult {
  readonly report: ThirdPartyDataPackModLockStorageReport
  readonly draft: ThirdPartyDataPackLockfileDraft | null
}

export interface ThirdPartyDataPackModLockStorageWriteResult {
  readonly report: ThirdPartyDataPackModLockStorageReport
}

export interface ThirdPartyDataPackModLockStorageAdapterOptions {
  readonly programDirectoryPath: ThirdPartyDataPackModLockProgramDirectoryProvider
  readonly fileOptions?: ThirdPartyDataPackModLockFileOptions
}

export interface ThirdPartyDataPackModLockStorageAdapter {
  inspect(): Promise<ThirdPartyDataPackModLockStorageReport>
  read(): Promise<ThirdPartyDataPackModLockStorageReadResult>
  write(draftValue: unknown): Promise<ThirdPartyDataPackModLockStorageWriteResult>
}

const createEffects = (
  options: { readonly lockfileWritten?: boolean } = {}
): ThirdPartyDataPackModLockStorageEffects => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  runtimeEnablementAllowed: false,
  electronIpcExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: options.lockfileWritten ?? false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false
})

const storageDiagnostic = (
  stage: string,
  details: Record<string, string | number | boolean | null>
): ModDiagnostic => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
  stage,
  details,
  recovery: 'retry'
})

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error)

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

  return [storageDiagnostic(stage, { message: errorMessage(error) })]
}

const createReport = (
  options: {
    readonly status: ThirdPartyDataPackModLockStorageStatus
    readonly operation: ThirdPartyDataPackModLockStorageOperation
    readonly reason: string
    readonly paths?: ThirdPartyDataPackModLockStoragePaths
    readonly diagnostics?: readonly ModDiagnostic[]
    readonly lockfileWritten?: boolean
  }
): ThirdPartyDataPackModLockStorageReport => ({
  status: options.status,
  operation: options.operation,
  storageKind: THIRD_PARTY_DATA_PACK_MOD_LOCK_STORAGE_KIND,
  reason: options.reason,
  paths: options.paths,
  diagnostics: options.diagnostics ?? [],
  effects: createEffects({ lockfileWritten: options.lockfileWritten })
})

const assertInsideProgramDirectory = (
  programDirectoryPath: string,
  candidate: string
): void => {
  const relative = path.relative(path.resolve(programDirectoryPath), path.resolve(candidate))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('mod-lock userdata path escaped its program directory')
  }
}

const toStoragePaths = (
  programDirectoryPath: string,
  filePaths: ThirdPartyDataPackModLockFilePaths
): ThirdPartyDataPackModLockStoragePaths => ({
  programDirectoryPath,
  userDataPath: filePaths.directory,
  filePath: filePaths.filePath
})

const resolveProgramDirectoryPath = async(
  provider: ThirdPartyDataPackModLockProgramDirectoryProvider
): Promise<string> => typeof provider === 'function' ? await provider() : provider

export const resolveThirdPartyDataPackModLockStoragePaths = (
  programDirectoryPath: string
): ThirdPartyDataPackModLockStoragePaths => {
  if (!path.isAbsolute(programDirectoryPath)) {
    throw new Error('programDirectoryPath must be absolute')
  }

  const resolvedProgramDirectoryPath = path.resolve(programDirectoryPath)
  const userDataPath = path.join(
    resolvedProgramDirectoryPath,
    THIRD_PARTY_DATA_PACK_MOD_LOCK_USERDATA_DIRECTORY_NAME
  )
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, userDataPath)
  const filePaths = getThirdPartyDataPackModLockFilePaths(userDataPath)
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, filePaths.filePath)
  return toStoragePaths(resolvedProgramDirectoryPath, filePaths)
}

const toFilePaths = (
  paths: ThirdPartyDataPackModLockStoragePaths
): ThirdPartyDataPackModLockFilePaths => ({
  directory: paths.userDataPath,
  filePath: paths.filePath
})

export const createThirdPartyDataPackModLockStorageAdapter = (
  options: ThirdPartyDataPackModLockStorageAdapterOptions
): ThirdPartyDataPackModLockStorageAdapter => {
  const resolvePaths = async(): Promise<ThirdPartyDataPackModLockStoragePaths> =>
    resolveThirdPartyDataPackModLockStoragePaths(await resolveProgramDirectoryPath(options.programDirectoryPath))

  return {
    async inspect() {
      try {
        const paths = await resolvePaths()
        return createReport({
          status: 'ready',
          operation: 'inspect',
          reason: 'program-directory userdata mod-lock storage path resolved',
          paths
        })
      } catch (error) {
        return createReport({
          status: 'failed',
          operation: 'inspect',
          reason: 'program-directory userdata mod-lock storage path could not be resolved',
          diagnostics: diagnosticsForError('third-party.mod-lock.storage.inspect', error)
        })
      }
    },
    async read() {
      try {
        const paths = await resolvePaths()
        const draft = await readThirdPartyDataPackModLockFile(toFilePaths(paths), options.fileOptions)
        return {
          draft,
          report: createReport({
            status: draft ? 'loaded' : 'missing',
            operation: 'read',
            reason: draft
              ? 'program-directory userdata mod-lock file was loaded and validated'
              : 'program-directory userdata mod-lock file is absent',
            paths
          })
        }
      } catch (error) {
        return {
          draft: null,
          report: createReport({
            status: 'failed',
            operation: 'read',
            reason: 'program-directory userdata mod-lock file could not be loaded',
            diagnostics: diagnosticsForError('third-party.mod-lock.storage.read', error)
          })
        }
      }
    },
    async write(draftValue) {
      try {
        const paths = await resolvePaths()
        await writeThirdPartyDataPackModLockFile(toFilePaths(paths), draftValue, options.fileOptions)
        return {
          report: createReport({
            status: 'written',
            operation: 'write',
            reason: 'program-directory userdata mod-lock file was atomically written',
            paths,
            lockfileWritten: true
          })
        }
      } catch (error) {
        return {
          report: createReport({
            status: 'failed',
            operation: 'write',
            reason: 'program-directory userdata mod-lock file write failed before publishing partial state',
            diagnostics: diagnosticsForError('third-party.mod-lock.storage.write', error)
          })
        }
      }
    }
  }
}
