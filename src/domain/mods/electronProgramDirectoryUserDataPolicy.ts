import path from 'node:path'

export const ELECTRON_PROGRAM_DIRECTORY_USERDATA_DIRECTORY_NAME = 'userdata'
export const ELECTRON_PROGRAM_DIRECTORY_USERDATA_REQUIRED_REASON =
  'packaged Electron must use executable-directory userdata; system user profile fallback is disabled'

export type ElectronProgramDirectoryUserDataStatus =
  | 'skipped'
  | 'already-configured'
  | 'configured'

export type ElectronProgramDirectoryUserDataPolicyErrorCode =
  | 'program-directory-path-invalid'
  | 'program-directory-userdata-unavailable'
  | 'program-directory-userdata-not-applied'

export interface ElectronProgramDirectoryUserDataApp {
  readonly isPackaged: boolean
  getPath(name: 'userData'): string
  setPath(name: 'userData', value: string): void
}

export interface ElectronProgramDirectoryUserDataFileSystem {
  readonly writeAccessMode: number
  mkdirSync(directoryPath: string, options: { readonly recursive: true }): void
  accessSync(directoryPath: string, mode: number): void
  existsSync(filePath: string): boolean
  cpSync(
    sourcePath: string,
    targetPath: string,
    options: { readonly recursive: true }
  ): void
}

export interface ElectronProgramDirectoryUserDataPaths {
  readonly programDirectoryPath: string
  readonly userDataPath: string
}

export interface ConfigureElectronProgramDirectoryUserDataOptions {
  readonly app: ElectronProgramDirectoryUserDataApp
  readonly fileSystem: ElectronProgramDirectoryUserDataFileSystem
  readonly programDirectoryPath: string
  readonly migrateExistingData?: boolean
  readonly migrationEntries?: readonly string[]
}

export interface ElectronProgramDirectoryUserDataPolicyResult {
  readonly status: ElectronProgramDirectoryUserDataStatus
  readonly reason: string
  readonly fallbackAllowed: false
  readonly programDirectoryPath?: string
  readonly previousUserDataPath?: string
  readonly userDataPath?: string
  readonly migratedEntries: readonly string[]
}

export class ElectronProgramDirectoryUserDataPolicyError extends Error {
  readonly code: ElectronProgramDirectoryUserDataPolicyErrorCode
  readonly fallbackAllowed = false

  constructor(code: ElectronProgramDirectoryUserDataPolicyErrorCode) {
    super(ELECTRON_PROGRAM_DIRECTORY_USERDATA_REQUIRED_REASON)
    this.name = 'ElectronProgramDirectoryUserDataPolicyError'
    this.code = code
  }
}

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreezeObjectGraph(child)
    }
  }
  return value
}

const createResult = (
  result: ElectronProgramDirectoryUserDataPolicyResult
): ElectronProgramDirectoryUserDataPolicyResult => deepFreezeObjectGraph({
  ...result,
  migratedEntries: Object.freeze([...result.migratedEntries])
})

const pathsEqual = (left: string, right: string): boolean =>
  path.resolve(left) === path.resolve(right)

const assertInsideProgramDirectory = (
  programDirectoryPath: string,
  candidatePath: string
): void => {
  const relative = path.relative(path.resolve(programDirectoryPath), path.resolve(candidatePath))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new ElectronProgramDirectoryUserDataPolicyError('program-directory-path-invalid')
  }
}

const assertRelativeMigrationEntry = (entry: string): void => {
  if (entry.length === 0 || path.isAbsolute(entry)) {
    throw new ElectronProgramDirectoryUserDataPolicyError('program-directory-path-invalid')
  }
  const normalized = path.normalize(entry)
  if (normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
    throw new ElectronProgramDirectoryUserDataPolicyError('program-directory-path-invalid')
  }
}

export const resolveElectronProgramDirectoryUserDataPath = (
  programDirectoryPath: string
): ElectronProgramDirectoryUserDataPaths => {
  if (!path.isAbsolute(programDirectoryPath)) {
    throw new ElectronProgramDirectoryUserDataPolicyError('program-directory-path-invalid')
  }

  const resolvedProgramDirectoryPath = path.resolve(programDirectoryPath)
  const userDataPath = path.join(
    resolvedProgramDirectoryPath,
    ELECTRON_PROGRAM_DIRECTORY_USERDATA_DIRECTORY_NAME
  )
  assertInsideProgramDirectory(resolvedProgramDirectoryPath, userDataPath)
  return Object.freeze({
    programDirectoryPath: resolvedProgramDirectoryPath,
    userDataPath
  })
}

const migrateExistingEntries = (
  options: {
    readonly fileSystem: ElectronProgramDirectoryUserDataFileSystem
    readonly previousUserDataPath: string
    readonly userDataPath: string
    readonly migrationEntries: readonly string[]
  }
): readonly string[] => {
  const migratedEntries: string[] = []
  for (const entry of options.migrationEntries) {
    assertRelativeMigrationEntry(entry)
    const sourcePath = path.join(options.previousUserDataPath, entry)
    const targetPath = path.join(options.userDataPath, entry)
    assertInsideProgramDirectory(options.userDataPath, targetPath)
    if (options.fileSystem.existsSync(sourcePath) && !options.fileSystem.existsSync(targetPath)) {
      options.fileSystem.cpSync(sourcePath, targetPath, { recursive: true })
      migratedEntries.push(entry)
    }
  }
  return Object.freeze(migratedEntries)
}

export const configureElectronProgramDirectoryUserData = (
  options: ConfigureElectronProgramDirectoryUserDataOptions
): ElectronProgramDirectoryUserDataPolicyResult => {
  if (!options.app.isPackaged) {
    return createResult({
      status: 'skipped',
      reason: 'Electron is not packaged; program-directory userdata policy is inactive',
      fallbackAllowed: false,
      migratedEntries: []
    })
  }

  const paths = resolveElectronProgramDirectoryUserDataPath(options.programDirectoryPath)
  const previousUserDataPath = options.app.getPath('userData')
  if (pathsEqual(previousUserDataPath, paths.userDataPath)) {
    return createResult({
      status: 'already-configured',
      reason: 'Electron userData already points to executable-directory userdata',
      fallbackAllowed: false,
      programDirectoryPath: paths.programDirectoryPath,
      previousUserDataPath,
      userDataPath: paths.userDataPath,
      migratedEntries: []
    })
  }

  try {
    options.fileSystem.mkdirSync(paths.userDataPath, { recursive: true })
    options.fileSystem.accessSync(paths.userDataPath, options.fileSystem.writeAccessMode)
    const migratedEntries = options.migrateExistingData === true
      ? migrateExistingEntries({
          fileSystem: options.fileSystem,
          previousUserDataPath,
          userDataPath: paths.userDataPath,
          migrationEntries: options.migrationEntries ?? []
        })
      : Object.freeze([])
    options.app.setPath('userData', paths.userDataPath)
    if (!pathsEqual(options.app.getPath('userData'), paths.userDataPath)) {
      throw new ElectronProgramDirectoryUserDataPolicyError('program-directory-userdata-not-applied')
    }
    return createResult({
      status: 'configured',
      reason: 'Electron userData is configured to executable-directory userdata',
      fallbackAllowed: false,
      programDirectoryPath: paths.programDirectoryPath,
      previousUserDataPath,
      userDataPath: paths.userDataPath,
      migratedEntries
    })
  } catch (error) {
    if (error instanceof ElectronProgramDirectoryUserDataPolicyError) throw error
    throw new ElectronProgramDirectoryUserDataPolicyError('program-directory-userdata-unavailable')
  }
}
