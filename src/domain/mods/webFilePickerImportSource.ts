import { strFromU8, unzipSync, type UnzipFileInfo } from 'fflate'
import { compareCodePoints } from './canonicalJson'
import { utf8ByteLength } from './hash'
import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  ContentPackageSourceError,
  assertContentPackageSourceTextWithinLimits,
  normalizeContentPackageSourceDirectoryEntries,
  normalizeContentPackageSourceArchiveEntryPath,
  normalizeContentPackageSourcePath,
  normalizeContentPackageSourceTextPayload,
  toContentPackageSourceHostOperationError,
  validateContentPackageSourceArchiveEntries,
  validateContentPackageSourceIdentity,
  type ContentPackageSource,
  type ContentPackageSourceArchiveEntry,
  type ContentPackageSourceDirectoryEntry,
  type ContentPackageSourceIdentity,
  type ContentPackageSourceSafeReadPolicy,
  type ContentPackageSourceValidatedArchiveEntry
} from './contentPackageSource'

export const WEB_FILE_PICKER_IMPORT_SOURCE_KIND = 'web-file-picker-import'
export const WEB_FILE_PICKER_IMPORT_SOURCE_ID = 'web/file-picker-import'
export const WEB_FILE_PICKER_IMPORT_ROOT_PATH = 'web-import'
export const WEB_FILE_PICKER_IMPORT_ARCHIVE_ACCEPT =
  '.zip,application/zip,application/x-zip-compressed'
export const WEB_FILE_PICKER_IMPORT_ARCHIVE_EXTENSION = '.zip'

export interface WebFilePickerImportFile {
  readonly name: string
  readonly webkitRelativePath?: string
  readonly size?: number
  text(): Promise<string>
  arrayBuffer?(): Promise<ArrayBuffer>
}

export interface CreateWebFilePickerImportSourceOptions {
  readonly files: readonly WebFilePickerImportFile[]
  readonly sourceId?: string
  readonly rootPath?: string
  readonly policy?: ContentPackageSourceSafeReadPolicy
}

export interface ReadWebFilePickerImportArchiveFilesOptions {
  readonly file: WebFilePickerImportFile
  readonly policy?: ContentPackageSourceSafeReadPolicy
}

interface NormalizedWebFilePickerImportFile {
  readonly path: string
  readonly file: WebFilePickerImportFile
  readonly readText: () => Promise<string>
}

const supportedOptionsKeys = new Set(['files', 'sourceId', 'rootPath', 'policy'])
const requiredOptionsKeys = ['files'] as const

const asOptionsObject = (options: unknown): Record<string, unknown> => {
  if (typeof options !== 'object' || options === null || Array.isArray(options)) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'Web file-picker import source options metadata must be an object'
    )
  }
  return options as Record<string, unknown>
}

const readOptionsKeys = (options: Record<string, unknown>): readonly string[] => {
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(options)
  } catch {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'Web file-picker import source options metadata could not be read'
    )
  }

  const stringKeys: string[] = []
  for (const key of keys) {
    if (typeof key !== 'string' || !supportedOptionsKeys.has(key)) {
      throw new ContentPackageSourceError(
        'SOURCE_IDENTITY_INVALID',
        'Web file-picker import source options metadata contains unsupported fields'
      )
    }
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(options, key)
    } catch {
      throw new ContentPackageSourceError(
        'SOURCE_IDENTITY_INVALID',
        'Web file-picker import source options metadata could not be read'
      )
    }
    if (descriptor?.enumerable !== true) {
      throw new ContentPackageSourceError(
        'SOURCE_IDENTITY_INVALID',
        'Web file-picker import source options metadata contains unsupported fields'
      )
    }
    stringKeys.push(key)
  }
  const ownKeys = new Set(stringKeys)
  if (requiredOptionsKeys.some(key => !ownKeys.has(key))) {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'Web file-picker import source options metadata must include files own field'
    )
  }
  return stringKeys
}

const readOptionsField = (
  options: Record<string, unknown>,
  fieldName: string
): unknown => {
  try {
    return options[fieldName]
  } catch {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      'Web file-picker import source options metadata could not be read'
    )
  }
}

const normalizeIdentityPart = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string') {
    throw new ContentPackageSourceError(
      'SOURCE_IDENTITY_INVALID',
      `${fieldName} must be a normalized relative identifier`
    )
  }
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

const toWebFileMetadataError = (): ContentPackageSourceError =>
  new ContentPackageSourceError(
    'SOURCE_ENTRY_UNSAFE',
    'Web file-picker import file metadata could not be read'
  )

const readWebFileStringField = (
  file: WebFilePickerImportFile,
  fieldName: 'name' | 'webkitRelativePath'
): string | undefined => {
  try {
    const value = file[fieldName]
    return typeof value === 'string' ? value : undefined
  } catch {
    throw toWebFileMetadataError()
  }
}

const readWebFileSize = (
  file: WebFilePickerImportFile,
  sourcePath?: string
): number | undefined => {
  let value: unknown
  try {
    value = file.size
  } catch {
    throw toWebFileMetadataError()
  }
  if (value === undefined) return undefined
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new ContentPackageSourceError(
      'SOURCE_LIMIT_EXCEEDED',
      'size must be a non-negative safe integer',
      sourcePath
    )
  }
  return value
}

const readWebFileTextMethod = (
  file: WebFilePickerImportFile
): (() => Promise<string>) => {
  let textMethod: unknown
  try {
    textMethod = file.text
  } catch {
    throw toWebFileMetadataError()
  }
  if (typeof textMethod !== 'function') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Web file-picker import file text reader must be a function'
    )
  }
  return () => Promise.resolve(textMethod.call(file) as Promise<string>)
}

const readWebFileArrayBufferMethod = (
  file: WebFilePickerImportFile
): (() => Promise<ArrayBuffer>) => {
  let arrayBufferMethod: unknown
  try {
    arrayBufferMethod = file.arrayBuffer
  } catch {
    throw toWebFileMetadataError()
  }
  if (typeof arrayBufferMethod !== 'function') {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Web file-picker ZIP import file arrayBuffer reader must be a function'
    )
  }
  return () => Promise.resolve(arrayBufferMethod.call(file) as Promise<ArrayBuffer>)
}

const normalizeWebFilePath = (
  pathInput: string,
  policy: ContentPackageSourceSafeReadPolicy
): string => {
  if (pathInput === '' || pathInput.includes('\\')) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      'Content package source path is unsafe'
    )
  }
  const normalizedPath = normalizeContentPackageSourcePath(pathInput, policy)
  if (normalizedPath === '' || normalizedPath !== pathInput) {
    throw new ContentPackageSourceError(
      'SOURCE_PATH_UNSAFE',
      'Content package source path is unsafe'
    )
  }
  return normalizedPath
}

const normalizeWebFile = (
  file: WebFilePickerImportFile,
  policy: ContentPackageSourceSafeReadPolicy
): NormalizedWebFilePickerImportFile => {
  if (typeof file !== 'object' || file === null) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Web file-picker import file metadata must be an object'
    )
  }
  const relativePath = readWebFileStringField(file, 'webkitRelativePath')
  const name = readWebFileStringField(file, 'name')
  if (name === undefined) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Web file-picker import file name metadata must be a string'
    )
  }
  const pathInput = relativePath === undefined || relativePath === '' ? name : relativePath
  const path = normalizeWebFilePath(pathInput, policy)
  const readText = readWebFileTextMethod(file)
  return { path, file, readText }
}

const archiveDiagnosticPath = 'archive.zip'

const isZipArchiveName = (name: string): boolean =>
  name.toLowerCase().endsWith(WEB_FILE_PICKER_IMPORT_ARCHIVE_EXTENSION)

const isArchiveDirectoryEntryName = (name: string): boolean => name.endsWith('/')

const readArchiveBytes = async(
  file: WebFilePickerImportFile,
  policy: ContentPackageSourceSafeReadPolicy
): Promise<Uint8Array> => {
  const declaredSize = readWebFileSize(file, undefined)
  if (declaredSize !== undefined && declaredSize > policy.maxPackageCompressedBytes) {
    throw new ContentPackageSourceError(
      'SOURCE_LIMIT_EXCEEDED',
      `Archive exceeds ${policy.maxPackageCompressedBytes} total compressed bytes: ${declaredSize}`,
      archiveDiagnosticPath
    )
  }

  const readArrayBuffer = readWebFileArrayBufferMethod(file)
  let buffer: ArrayBuffer
  try {
    buffer = await readArrayBuffer()
  } catch (error) {
    throw toContentPackageSourceHostOperationError('read', error, archiveDiagnosticPath, 'SOURCE_ENTRY_UNSAFE')
  }
  if (!(buffer instanceof ArrayBuffer)) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Web file-picker ZIP import payload must be an ArrayBuffer',
      archiveDiagnosticPath
    )
  }
  const bytes = new Uint8Array(buffer)
  if (bytes.byteLength > policy.maxPackageCompressedBytes) {
    throw new ContentPackageSourceError(
      'SOURCE_LIMIT_EXCEEDED',
      `Archive exceeds ${policy.maxPackageCompressedBytes} total compressed bytes: ${bytes.byteLength}`,
      archiveDiagnosticPath
    )
  }
  return bytes
}

const collectArchiveEntryMetadata = (
  archiveBytes: Uint8Array,
  policy: ContentPackageSourceSafeReadPolicy
) => {
  const entries: ContentPackageSourceArchiveEntry[] = []
  try {
    unzipSync(archiveBytes, {
      filter: (file: UnzipFileInfo) => {
        if (!isArchiveDirectoryEntryName(file.name)) {
          entries.push(Object.freeze({
            path: file.name,
            uncompressedSizeBytes: file.originalSize,
            compressedSizeBytes: file.size
          }))
        }
        return false
      }
    })
  } catch (error) {
    if (error instanceof ContentPackageSourceError) throw error
    throw toContentPackageSourceHostOperationError('read', error, archiveDiagnosticPath, 'SOURCE_ENTRY_UNSAFE')
  }
  return validateContentPackageSourceArchiveEntries(entries, policy)
}

const extractValidatedArchiveFiles = (
  archiveBytes: Uint8Array,
  entries: readonly ContentPackageSourceValidatedArchiveEntry[],
  policy: ContentPackageSourceSafeReadPolicy
): readonly WebFilePickerImportFile[] => {
  const selectedPaths = new Set(entries.map(entry => entry.path))
  let extracted: Record<string, Uint8Array>
  try {
    extracted = unzipSync(archiveBytes, {
      filter: (file: UnzipFileInfo) => {
        if (isArchiveDirectoryEntryName(file.name)) return false
        const normalizedPath = normalizeContentPackageSourceArchiveEntryPath(file.name, policy)
        return selectedPaths.has(normalizedPath)
      }
    })
  } catch (error) {
    if (error instanceof ContentPackageSourceError) throw error
    throw toContentPackageSourceHostOperationError('read', error, archiveDiagnosticPath, 'SOURCE_ENTRY_UNSAFE')
  }

  return Object.freeze(entries.map(entry => {
    const payload = extracted[entry.path]
    if (payload === undefined) {
      throw new ContentPackageSourceError(
        'SOURCE_ENTRY_NOT_FOUND',
        'Validated archive entry was not extracted',
        entry.path
      )
    }
    let text: string
    try {
      text = assertContentPackageSourceTextWithinLimits(strFromU8(payload), entry.path, policy)
    } catch (error) {
      if (error instanceof ContentPackageSourceError) throw error
      throw toContentPackageSourceHostOperationError('read', error, entry.path, 'SOURCE_ENTRY_UNSAFE')
    }
    return Object.freeze({
      name: entryName(entry.path, entry.path),
      webkitRelativePath: entry.path,
      size: utf8ByteLength(text),
      text: async() => text
    })
  }))
}

export const readWebFilePickerImportArchiveFiles = async(
  options: ReadWebFilePickerImportArchiveFilesOptions
): Promise<readonly WebFilePickerImportFile[]> => {
  const policy = options.policy ?? CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
  const file = options.file
  if (typeof file !== 'object' || file === null) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Web file-picker ZIP import file metadata must be an object'
    )
  }
  const name = readWebFileStringField(file, 'name')
  if (name === undefined) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Web file-picker ZIP import file name metadata must be a string'
    )
  }
  if (!isZipArchiveName(name)) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Web file-picker ZIP import requires a .zip file'
    )
  }

  const archiveBytes = await readArchiveBytes(file, policy)
  const entries = collectArchiveEntryMetadata(archiveBytes, policy)
  return extractValidatedArchiveFiles(archiveBytes, entries, policy)
}

const readFiles = (
  files: unknown,
  policy: ContentPackageSourceSafeReadPolicy
): readonly NormalizedWebFilePickerImportFile[] => {
  if (!Array.isArray(files)) {
    throw new ContentPackageSourceError(
      'SOURCE_ENTRY_UNSAFE',
      'Web file-picker import files metadata must be an array'
    )
  }
  if (files.length > policy.maxPackageFileCount) {
    throw new ContentPackageSourceError(
      'SOURCE_LIMIT_EXCEEDED',
      `Web file-picker import exceeds ${policy.maxPackageFileCount} files: ${files.length}`
    )
  }
  return files.map(file => normalizeWebFile(file as WebFilePickerImportFile, policy))
}

const parentPath = (sourcePath: string): string => {
  const separatorIndex = sourcePath.lastIndexOf('/')
  return separatorIndex === -1 ? '' : sourcePath.slice(0, separatorIndex)
}

const entryName = (sourcePath: string, fallback: string): string => {
  const separatorIndex = sourcePath.lastIndexOf('/')
  return separatorIndex === -1 ? sourcePath || fallback : sourcePath.slice(separatorIndex + 1)
}

const toDirectoryEntry = (
  name: string,
  kind: ContentPackageSourceDirectoryEntry['kind']
): ContentPackageSourceDirectoryEntry => Object.freeze({
  name,
  kind,
  isSymbolicLink: false
})

const createSourceIdentity = (
  sourceId: string,
  rootPath: string
): ContentPackageSourceIdentity => validateContentPackageSourceIdentity({
  contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  kind: WEB_FILE_PICKER_IMPORT_SOURCE_KIND,
  sourceId,
  rootPath
})

export const createWebFilePickerImportSource = (
  options: CreateWebFilePickerImportSourceOptions
): ContentPackageSource => {
  const optionsMetadata = asOptionsObject(options)
  const optionKeys = readOptionsKeys(optionsMetadata)
  const policy = (optionKeys.includes('policy')
    ? readOptionsField(optionsMetadata, 'policy')
    : CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS) as ContentPackageSourceSafeReadPolicy
  const sourceId = normalizeIdentityPart(
    optionKeys.includes('sourceId')
      ? readOptionsField(optionsMetadata, 'sourceId')
      : WEB_FILE_PICKER_IMPORT_SOURCE_ID,
    'sourceId'
  )
  const rootPath = normalizeIdentityPart(
    optionKeys.includes('rootPath')
      ? readOptionsField(optionsMetadata, 'rootPath')
      : WEB_FILE_PICKER_IMPORT_ROOT_PATH,
    'rootPath'
  )
  const rootName = entryName(rootPath, rootPath)
  const normalizedFiles = readFiles(readOptionsField(optionsMetadata, 'files'), policy)
  const fileReaders = new Map<string, NormalizedWebFilePickerImportFile>()
  const directories = new Set<string>([''])
  let disposed = false

  for (const file of normalizedFiles) {
    if (fileReaders.has(file.path)) {
      throw new ContentPackageSourceError('SOURCE_DUPLICATE_PATH', 'Duplicate source file path')
    }
    if (directories.has(file.path)) {
      throw new ContentPackageSourceError(
        'SOURCE_DUPLICATE_PATH',
        'Source file path conflicts with a directory path'
      )
    }
    let directory = parentPath(file.path)
    while (directory !== '') {
      if (fileReaders.has(directory)) {
        throw new ContentPackageSourceError(
          'SOURCE_DUPLICATE_PATH',
          'Source directory path conflicts with a file path'
        )
      }
      directories.add(directory)
      directory = parentPath(directory)
    }
    fileReaders.set(file.path, file)
  }

  const assertAvailable = (): void => {
    if (disposed) {
      throw new ContentPackageSourceError(
        'SOURCE_DISPOSED',
        'Web file-picker import source has been disposed'
      )
    }
  }

  const getEntry = (sourcePath: string): ContentPackageSourceDirectoryEntry | null => {
    const normalizedPath = normalizeContentPackageSourcePath(sourcePath, policy)
    if (fileReaders.has(normalizedPath)) {
      return toDirectoryEntry(entryName(normalizedPath, rootName), 'file')
    }
    if (directories.has(normalizedPath)) {
      return toDirectoryEntry(entryName(normalizedPath, rootName), 'directory')
    }
    return null
  }

  return {
    identity: createSourceIdentity(sourceId, rootPath),
    async getEntry(sourcePath) {
      assertAvailable()
      return getEntry(sourcePath)
    },
    async readDirectory(sourcePath) {
      assertAvailable()
      const normalizedPath = normalizeContentPackageSourcePath(sourcePath, policy)
      if (!directories.has(normalizedPath)) {
        throw new ContentPackageSourceError(
          'SOURCE_ENTRY_NOT_DIRECTORY',
          'Source path is not a directory',
          normalizedPath
        )
      }

      const entries = new Map<string, ContentPackageSourceDirectoryEntry>()
      for (const directoryPath of directories) {
        if (directoryPath === normalizedPath || parentPath(directoryPath) !== normalizedPath) continue
        const name = entryName(directoryPath, rootName)
        entries.set(name, toDirectoryEntry(name, 'directory'))
      }
      for (const filePath of [...fileReaders.keys()].sort(compareCodePoints)) {
        if (parentPath(filePath) !== normalizedPath) continue
        const name = entryName(filePath, rootName)
        entries.set(name, toDirectoryEntry(name, 'file'))
      }
      return normalizeContentPackageSourceDirectoryEntries([...entries.values()], policy)
    },
    async readTextFile(sourcePath) {
      assertAvailable()
      const normalizedPath = normalizeContentPackageSourcePath(sourcePath, policy)
      const file = fileReaders.get(normalizedPath)
      if (file === undefined) {
        const entry = getEntry(normalizedPath)
        throw new ContentPackageSourceError(
          entry?.kind === 'directory' ? 'SOURCE_ENTRY_NOT_FILE' : 'SOURCE_ENTRY_NOT_FOUND',
          entry?.kind === 'directory' ? 'Source path is not a file' : 'Source path was not found',
          normalizedPath
        )
      }
      const size = readWebFileSize(file.file, normalizedPath)
      if (size !== undefined && size > policy.maxSingleFileBytes) {
        throw new ContentPackageSourceError(
          'SOURCE_LIMIT_EXCEEDED',
          `Source text file exceeds ${policy.maxSingleFileBytes} bytes: ${size}`,
          normalizedPath
        )
      }
      try {
        return normalizeContentPackageSourceTextPayload(await file.readText(), normalizedPath)
      } catch (error) {
        throw toContentPackageSourceHostOperationError('read', error, normalizedPath)
      }
    },
    async dispose() {
      disposed = true
      fileReaders.clear()
      directories.clear()
    }
  }
}
