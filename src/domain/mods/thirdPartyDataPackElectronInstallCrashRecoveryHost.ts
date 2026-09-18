import { randomUUID } from 'node:crypto'
import { mkdir, open, readFile, readdir, rename, rmdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { assertPureJsonValue } from './canonicalJson'
import { hashCanonicalJson, sha256Utf8, type Sha256Hash } from './hash'
import type { PackageId } from './ids'

export const THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_FILE_NAME =
  'install-recovery.json'
export const THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_KIND =
  'third-party-data-pack-electron-install-crash-recovery'
export const THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_STORAGE_KIND =
  'electron-program-directory-install-crash-recovery'

const USERDATA_DIRECTORY_NAME = 'userdata'
const TRANSACTION_DIRECTORY_NAME = 'mod-transactions'
const MODS_DIRECTORY_NAME = 'mods'
const TEMP_FILE_PREFIX = `.${THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_FILE_NAME}.tmp-`
const PACKAGE_WRITE_TEMP_FILE_PREFIX = '.taoyuan-package-file-write-probe.tmp-'
const sha256Pattern = /^sha256:[0-9a-f]{64}$/
const crashRecoveryOperations = new Set<ThirdPartyDataPackElectronInstallCrashRecoveryOperation>([
  'install',
  'disable',
  'enable',
  'uninstall'
])

export interface ThirdPartyDataPackElectronInstallCrashRecoveryTarget {
  readonly relativePath: string
}

export type ThirdPartyDataPackElectronInstallCrashRecoveryOperation =
  | 'install'
  | 'disable'
  | 'enable'
  | 'uninstall'

export interface ThirdPartyDataPackElectronInstallCrashRecoveryPrepareInput {
  readonly operation?: ThirdPartyDataPackElectronInstallCrashRecoveryOperation
  readonly targetPackageId: PackageId
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly targets: readonly ThirdPartyDataPackElectronInstallCrashRecoveryTarget[]
  readonly transactionId?: string
  readonly createdAtIso?: string
}

interface ThirdPartyDataPackElectronInstallCrashRecoverySnapshot {
  readonly relativePath: string
  readonly previousContents: string | null
  readonly previousHash: Sha256Hash | null
}

export interface ThirdPartyDataPackElectronInstallCrashRecoveryEntry {
  readonly formatVersion: 1
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_KIND
  readonly transactionId: string
  readonly operation: ThirdPartyDataPackElectronInstallCrashRecoveryOperation
  readonly createdAtIso: string
  readonly targetPackageId: PackageId
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly snapshots: readonly ThirdPartyDataPackElectronInstallCrashRecoverySnapshot[]
  readonly entryHash: Sha256Hash
}

export interface ThirdPartyDataPackElectronInstallCrashRecoveryPrepareResult {
  readonly status: 'prepared' | 'blocked'
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_STORAGE_KIND
  readonly transactionId?: string
  readonly entryHash?: Sha256Hash
  readonly operation?: ThirdPartyDataPackElectronInstallCrashRecoveryOperation
  readonly targetCount: number
  readonly effects: {
    readonly recoveryLogWritten: boolean
    readonly recoveryLogRead: false
    readonly recoveryLogReplayed: false
    readonly packageFilesRestored: false
    readonly settingsRestored: false
    readonly lockfileRestored: false
    readonly startupStateRestored: false
    readonly rollbackExecuted: false
  }
}

export interface ThirdPartyDataPackElectronInstallCrashRecoveryReplayResult {
  readonly status: 'clean' | 'recovered' | 'blocked'
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_STORAGE_KIND
  readonly transactionId?: string
  readonly entryHash?: Sha256Hash
  readonly operation?: ThirdPartyDataPackElectronInstallCrashRecoveryOperation
  readonly restoredFileCount: number
  readonly removedCreatedFileCount: number
  readonly effects: {
    readonly recoveryLogWritten: false
    readonly recoveryLogRead: boolean
    readonly recoveryLogReplayed: boolean
    readonly packageFilesRestored: boolean
    readonly settingsRestored: boolean
    readonly lockfileRestored: boolean
    readonly startupStateRestored: boolean
    readonly rollbackExecuted: boolean
  }
}

export interface ThirdPartyDataPackElectronInstallCrashRecoverySettleResult {
  readonly status: 'settled' | 'blocked'
  readonly storageKind: typeof THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_STORAGE_KIND
  readonly transactionId?: string
  readonly entryHash?: Sha256Hash
  readonly operation?: ThirdPartyDataPackElectronInstallCrashRecoveryOperation
  readonly effects: {
    readonly recoveryLogCleared: boolean
  }
}

export interface ThirdPartyDataPackElectronInstallCrashRecoveryHost {
  prepare(
    input: ThirdPartyDataPackElectronInstallCrashRecoveryPrepareInput
  ): Promise<ThirdPartyDataPackElectronInstallCrashRecoveryPrepareResult>
  replay(): Promise<ThirdPartyDataPackElectronInstallCrashRecoveryReplayResult>
  settle(
    transactionId: string,
    entryHash: Sha256Hash
  ): Promise<ThirdPartyDataPackElectronInstallCrashRecoverySettleResult>
}

export interface ThirdPartyDataPackElectronInstallCrashRecoveryHostOptions {
  readonly programDirectoryPath: string | (() => string | Promise<string>)
}

export interface ThirdPartyDataPackElectronInstallCrashRecoveryPaths {
  readonly programDirectoryPath: string
  readonly transactionDirectoryPath: string
  readonly recoveryFilePath: string
}

const isNotFound = (error: unknown): boolean =>
  error !== null
  && typeof error === 'object'
  && 'code' in error
  && (error as { code?: unknown }).code === 'ENOENT'

const assertInsideDirectory = (directoryPath: string, candidatePath: string): void => {
  const relative = path.relative(path.resolve(directoryPath), path.resolve(candidatePath))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('install crash recovery path escaped its allowed directory')
  }
}

const normalizeRelativePath = (value: string): string => {
  if (typeof value !== 'string' || value.length === 0 || path.isAbsolute(value)) {
    throw new Error('install crash recovery target path must be relative')
  }
  const normalized = path.normalize(value)
  if (
    normalized === '.'
    || normalized.startsWith('..')
    || path.isAbsolute(normalized)
  ) {
    throw new Error('install crash recovery target path is unsafe')
  }
  const portable = normalized.split(path.sep).join('/')
  const allowedUserDataPaths = new Set([
    'userdata/settings.json',
    'userdata/mod-lock.json',
    'userdata/mod-startup-state/startup-persistent-state-snapshot.json'
  ])
  if (!portable.startsWith('mods/') && !allowedUserDataPaths.has(portable)) {
    throw new Error('install crash recovery target path is outside the install boundary')
  }
  return portable
}

const resolveProvider = async(
  provider: ThirdPartyDataPackElectronInstallCrashRecoveryHostOptions['programDirectoryPath']
): Promise<string> => typeof provider === 'function' ? await provider() : provider

export const resolveThirdPartyDataPackElectronInstallCrashRecoveryPaths = (
  programDirectoryPath: string
): ThirdPartyDataPackElectronInstallCrashRecoveryPaths => {
  if (!path.isAbsolute(programDirectoryPath)) {
    throw new Error('programDirectoryPath must be absolute')
  }
  const resolvedProgramDirectoryPath = path.resolve(programDirectoryPath)
  const transactionDirectoryPath = path.join(
    resolvedProgramDirectoryPath,
    USERDATA_DIRECTORY_NAME,
    TRANSACTION_DIRECTORY_NAME
  )
  const recoveryFilePath = path.join(
    transactionDirectoryPath,
    THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_FILE_NAME
  )
  assertInsideDirectory(resolvedProgramDirectoryPath, transactionDirectoryPath)
  assertInsideDirectory(transactionDirectoryPath, recoveryFilePath)
  return {
    programDirectoryPath: resolvedProgramDirectoryPath,
    transactionDirectoryPath,
    recoveryFilePath
  }
}

const targetPath = (
  paths: ThirdPartyDataPackElectronInstallCrashRecoveryPaths,
  relativePath: string
): string => {
  const normalized = normalizeRelativePath(relativePath)
  const candidatePath = path.join(paths.programDirectoryPath, ...normalized.split('/'))
  assertInsideDirectory(paths.programDirectoryPath, candidatePath)
  return candidatePath
}

const entryHash = (
  entry: Omit<ThirdPartyDataPackElectronInstallCrashRecoveryEntry, 'entryHash'>
): Sha256Hash => hashCanonicalJson(entry) as Sha256Hash

const parseEntry = (text: string): ThirdPartyDataPackElectronInstallCrashRecoveryEntry => {
  const value = JSON.parse(text) as unknown
  assertPureJsonValue(value)
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('install crash recovery entry must be an object')
  }
  const entry = value as ThirdPartyDataPackElectronInstallCrashRecoveryEntry
  if (
    entry.formatVersion !== 1
    || entry.kind !== THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_KIND
    || !crashRecoveryOperations.has(entry.operation)
    || typeof entry.transactionId !== 'string'
    || entry.transactionId.length === 0
    || typeof entry.createdAtIso !== 'string'
    || typeof entry.targetPackageId !== 'string'
    || !sha256Pattern.test(entry.candidateHash)
    || !sha256Pattern.test(entry.lockfileHash)
    || !sha256Pattern.test(entry.entryHash)
    || !Array.isArray(entry.snapshots)
    || entry.snapshots.length === 0
  ) {
    throw new Error('install crash recovery entry structure is invalid')
  }

  const seen = new Set<string>()
  for (const snapshot of entry.snapshots) {
    if (snapshot === null || typeof snapshot !== 'object') {
      throw new Error('install crash recovery snapshot is invalid')
    }
    const normalized = normalizeRelativePath(snapshot.relativePath)
    if (normalized !== snapshot.relativePath || seen.has(normalized)) {
      throw new Error('install crash recovery snapshot paths are invalid')
    }
    seen.add(normalized)
    if (
      snapshot.previousContents !== null
      && typeof snapshot.previousContents !== 'string'
    ) {
      throw new Error('install crash recovery snapshot contents are invalid')
    }
    if (
      snapshot.previousContents === null
        ? snapshot.previousHash !== null
        : snapshot.previousHash !== sha256Utf8(snapshot.previousContents)
    ) {
      throw new Error('install crash recovery snapshot hash is invalid')
    }
  }

  const { entryHash: _entryHash, ...body } = entry
  if (entry.entryHash !== entryHash(body)) {
    throw new Error('install crash recovery entry hash is invalid')
  }
  return entry
}

const atomicWrite = async(filePath: string, contents: string): Promise<void> => {
  const directoryPath = path.dirname(filePath)
  await mkdir(directoryPath, { recursive: true })
  const temporaryPath = path.join(
    directoryPath,
    `${TEMP_FILE_PREFIX}${process.pid}-${randomUUID()}`
  )
  assertInsideDirectory(directoryPath, temporaryPath)
  let handle: Awaited<ReturnType<typeof open>> | null = null
  try {
    handle = await open(temporaryPath, 'wx')
    await handle.writeFile(contents, 'utf8')
    await handle.sync()
    await handle.close()
    handle = null
    if (await readFile(temporaryPath, 'utf8') !== contents) {
      throw new Error('install crash recovery temporary write changed before replace')
    }
    await rename(temporaryPath, filePath)
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined)
    await unlink(temporaryPath).catch(() => undefined)
    throw error
  }
}

const readOptional = async(filePath: string): Promise<string | null> => {
  try {
    return await readFile(filePath, 'utf8')
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

const removeEmptyPackageDirectories = async(
  paths: ThirdPartyDataPackElectronInstallCrashRecoveryPaths,
  filePath: string
): Promise<void> => {
  const modsDirectoryPath = path.join(paths.programDirectoryPath, MODS_DIRECTORY_NAME)
  if (!path.resolve(filePath).startsWith(`${path.resolve(modsDirectoryPath)}${path.sep}`)) return
  let currentDirectoryPath = path.dirname(filePath)
  while (currentDirectoryPath !== modsDirectoryPath) {
    try {
      await rmdir(currentDirectoryPath)
    } catch (error) {
      if (
        isNotFound(error)
        || (error !== null
          && typeof error === 'object'
          && 'code' in error
          && ['ENOTEMPTY', 'EEXIST'].includes(String((error as { code?: unknown }).code)))
      ) return
      throw error
    }
    const parentDirectoryPath = path.dirname(currentDirectoryPath)
    if (parentDirectoryPath === currentDirectoryPath) return
    currentDirectoryPath = parentDirectoryPath
  }
}

const cleanupInterruptedPackageWriteTemporaryFiles = async(
  paths: ThirdPartyDataPackElectronInstallCrashRecoveryPaths,
  entry: ThirdPartyDataPackElectronInstallCrashRecoveryEntry
): Promise<void> => {
  const directories = new Set(entry.snapshots
    .filter(snapshot => snapshot.relativePath.startsWith('mods/'))
    .map(snapshot => path.dirname(targetPath(paths, snapshot.relativePath))))
  for (const directoryPath of directories) {
    let entries
    try {
      entries = await readdir(directoryPath, { withFileTypes: true })
    } catch (error) {
      if (isNotFound(error)) continue
      throw error
    }
    for (const directoryEntry of entries) {
      if (directoryEntry.isFile() && isThirdPartyDataPackPackageWriteTemporaryFileName(directoryEntry.name)) {
        await unlink(path.join(directoryPath, directoryEntry.name)).catch(error => {
          if (!isNotFound(error)) throw error
        })
      }
    }
  }
}

const createPrepareResult = (
  status: 'prepared' | 'blocked',
  targetCount: number,
  entry?: ThirdPartyDataPackElectronInstallCrashRecoveryEntry
): ThirdPartyDataPackElectronInstallCrashRecoveryPrepareResult => Object.freeze({
  status,
  storageKind: THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_STORAGE_KIND,
  transactionId: entry?.transactionId,
  entryHash: entry?.entryHash,
  operation: entry?.operation,
  targetCount,
  effects: Object.freeze({
    recoveryLogWritten: status === 'prepared',
    recoveryLogRead: false as const,
    recoveryLogReplayed: false as const,
    packageFilesRestored: false as const,
    settingsRestored: false as const,
    lockfileRestored: false as const,
    startupStateRestored: false as const,
    rollbackExecuted: false as const
  })
})

const createReplayResult = (
  status: 'clean' | 'recovered' | 'blocked',
  options: {
    readonly entry?: ThirdPartyDataPackElectronInstallCrashRecoveryEntry
    readonly restoredFileCount?: number
    readonly removedCreatedFileCount?: number
  } = {}
): ThirdPartyDataPackElectronInstallCrashRecoveryReplayResult => {
  const snapshots = options.entry?.snapshots ?? []
  const recovered = status === 'recovered'
  const restoredPaths = new Set(snapshots.map(snapshot => snapshot.relativePath))
  return Object.freeze({
    status,
    storageKind: THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_STORAGE_KIND,
    transactionId: options.entry?.transactionId,
    entryHash: options.entry?.entryHash,
    operation: options.entry?.operation,
    restoredFileCount: options.restoredFileCount ?? 0,
    removedCreatedFileCount: options.removedCreatedFileCount ?? 0,
    effects: Object.freeze({
      recoveryLogWritten: false as const,
      recoveryLogRead: status !== 'clean',
      recoveryLogReplayed: recovered,
      packageFilesRestored: recovered && [...restoredPaths].some(value => value.startsWith('mods/')),
      settingsRestored: recovered && restoredPaths.has('userdata/settings.json'),
      lockfileRestored: recovered && restoredPaths.has('userdata/mod-lock.json'),
      startupStateRestored: recovered
        && restoredPaths.has('userdata/mod-startup-state/startup-persistent-state-snapshot.json'),
      rollbackExecuted: recovered
    })
  })
}

const readEntry = async(
  paths: ThirdPartyDataPackElectronInstallCrashRecoveryPaths
): Promise<ThirdPartyDataPackElectronInstallCrashRecoveryEntry | null> => {
  try {
    return parseEntry(await readFile(paths.recoveryFilePath, 'utf8'))
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

export const createThirdPartyDataPackElectronInstallCrashRecoveryHost = (
  options: ThirdPartyDataPackElectronInstallCrashRecoveryHostOptions
): ThirdPartyDataPackElectronInstallCrashRecoveryHost => {
  const resolvePaths = async() => resolveThirdPartyDataPackElectronInstallCrashRecoveryPaths(
    await resolveProvider(options.programDirectoryPath)
  )

  return {
    async prepare(input) {
      let targetCount = 0
      try {
        const paths = await resolvePaths()
        if (await readOptional(paths.recoveryFilePath) !== null) {
          return createPrepareResult('blocked', 0)
        }
        const relativePaths = [...new Set(
          input.targets.map(target => normalizeRelativePath(target.relativePath))
        )].sort()
        targetCount = relativePaths.length
        if (
          relativePaths.length === 0
          || !sha256Pattern.test(input.candidateHash)
          || !sha256Pattern.test(input.lockfileHash)
        ) {
          return createPrepareResult('blocked', targetCount)
        }
        const snapshots: ThirdPartyDataPackElectronInstallCrashRecoverySnapshot[] = []
        for (const relativePath of relativePaths) {
          const previousContents = await readOptional(targetPath(paths, relativePath))
          snapshots.push(Object.freeze({
            relativePath,
            previousContents,
            previousHash: previousContents === null ? null : sha256Utf8(previousContents)
          }))
        }
        const body: Omit<ThirdPartyDataPackElectronInstallCrashRecoveryEntry, 'entryHash'> = {
          formatVersion: 1,
          kind: THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_KIND,
          transactionId: input.transactionId ?? randomUUID(),
          operation: input.operation ?? 'install',
          createdAtIso: input.createdAtIso ?? new Date().toISOString(),
          targetPackageId: input.targetPackageId,
          candidateHash: input.candidateHash,
          lockfileHash: input.lockfileHash,
          snapshots: Object.freeze(snapshots)
        }
        const entry = Object.freeze({ ...body, entryHash: entryHash(body) })
        await atomicWrite(paths.recoveryFilePath, `${JSON.stringify(entry, null, 2)}\n`)
        parseEntry(await readFile(paths.recoveryFilePath, 'utf8'))
        return createPrepareResult('prepared', targetCount, entry)
      } catch {
        return createPrepareResult('blocked', targetCount)
      }
    },

    async replay() {
      let entry: ThirdPartyDataPackElectronInstallCrashRecoveryEntry | undefined
      try {
        const paths = await resolvePaths()
        const loaded = await readEntry(paths)
        if (loaded === null) return createReplayResult('clean')
        entry = loaded
        let restoredFileCount = 0
        let removedCreatedFileCount = 0
        for (const snapshot of entry.snapshots) {
          const filePath = targetPath(paths, snapshot.relativePath)
          if (snapshot.previousContents === null) {
            try {
              await unlink(filePath)
              removedCreatedFileCount += 1
            } catch (error) {
              if (!isNotFound(error)) throw error
            }
            await removeEmptyPackageDirectories(paths, filePath)
          } else {
            await atomicWrite(filePath, snapshot.previousContents)
            restoredFileCount += 1
          }
        }
        await cleanupInterruptedPackageWriteTemporaryFiles(paths, entry)
        await unlink(paths.recoveryFilePath)
        return createReplayResult('recovered', {
          entry,
          restoredFileCount,
          removedCreatedFileCount
        })
      } catch {
        return createReplayResult('blocked', { entry })
      }
    },

    async settle(transactionId, expectedEntryHash) {
      try {
        const paths = await resolvePaths()
        const entry = await readEntry(paths)
        if (
          entry === null
          || entry.transactionId !== transactionId
          || entry.entryHash !== expectedEntryHash
        ) {
          return Object.freeze({
            status: 'blocked' as const,
            storageKind: THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_STORAGE_KIND,
            transactionId: entry?.transactionId,
            entryHash: entry?.entryHash,
            operation: entry?.operation,
            effects: Object.freeze({ recoveryLogCleared: false })
          })
        }
        await unlink(paths.recoveryFilePath)
        return Object.freeze({
          status: 'settled' as const,
          storageKind: THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_STORAGE_KIND,
          transactionId: entry.transactionId,
          entryHash: entry.entryHash,
          operation: entry.operation,
          effects: Object.freeze({ recoveryLogCleared: true })
        })
      } catch {
        return Object.freeze({
          status: 'blocked' as const,
          storageKind: THIRD_PARTY_DATA_PACK_ELECTRON_INSTALL_CRASH_RECOVERY_STORAGE_KIND,
          effects: Object.freeze({ recoveryLogCleared: false })
        })
      }
    }
  }
}

export const isThirdPartyDataPackPackageWriteTemporaryFileName = (
  fileName: string
): boolean => fileName.startsWith(PACKAGE_WRITE_TEMP_FILE_PREFIX)
