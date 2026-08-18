import { computed, ref, shallowRef } from 'vue'
import {
  CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  ContentPackageSourceError,
  type ContentPackageSource,
  type ContentPackageSourceSafeReadPolicy
} from '@/domain/mods/contentPackageSource'
import {
  WEB_FILE_PICKER_IMPORT_ROOT_PATH,
  WEB_FILE_PICKER_IMPORT_SOURCE_ID,
  createWebFilePickerImportSource,
  type WebFilePickerImportFile
} from '@/domain/mods/webFilePickerImportSource'
import {
  persistWebFilePickerImportSource,
  type WebIndexedDbImportPersistenceStore,
  type WebIndexedDbImportRecord
} from '@/domain/mods/webIndexedDbImportPersistence'

export type WebFilePickerImportEntryStatus =
  | 'idle'
  | 'selecting'
  | 'importing'
  | 'ready'
  | 'persisted'
  | 'cancelled'
  | 'failed'

export interface WebFilePickerImportEntryEffects {
  readonly sourceCreated: boolean
  readonly indexedDbImportPersisted: boolean
  readonly runtimeRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly modLockWritten: false
  readonly settingsWritten: false
  readonly saveWritten: false
  readonly officialCacheWritten: false
  readonly packageFilesWritten: false
  readonly transactionLogWritten: false
}

export interface WebFilePickerImportSelectionOptions {
  readonly directory: boolean
  readonly multiple: boolean
}

export type WebFilePickerImportSelector = (
  options: WebFilePickerImportSelectionOptions
) => Promise<readonly WebFilePickerImportFile[]>

export interface BrowserWebFilePickerSelectorOptions {
  readonly document?: Document
}

export interface UseWebFilePickerImportEntryOptions {
  readonly selectFiles?: WebFilePickerImportSelector
  readonly sourceId?: string
  readonly rootPath?: string
  readonly importId?: string | (() => string)
  readonly policy?: ContentPackageSourceSafeReadPolicy
  readonly persistenceStore?: WebIndexedDbImportPersistenceStore | null
}

export interface WebFilePickerImportEntryResult {
  readonly status: Exclude<WebFilePickerImportEntryStatus, 'idle' | 'selecting' | 'importing'>
  readonly source: ContentPackageSource | null
  readonly record: WebIndexedDbImportRecord | null
  readonly fileCount: number
  readonly effects: WebFilePickerImportEntryEffects
  readonly error: ContentPackageSourceError | null
}

export const WEB_FILE_PICKER_IMPORT_ENTRY_DEFAULT_IMPORT_ID = 'latest-web-file-picker-import'

const createEffects = (
  sourceCreated: boolean,
  indexedDbImportPersisted: boolean
): WebFilePickerImportEntryEffects => Object.freeze({
  sourceCreated,
  indexedDbImportPersisted,
  runtimeRegistryPublished: false,
  liveRegistryMutated: false,
  modLockWritten: false,
  settingsWritten: false,
  saveWritten: false,
  officialCacheWritten: false,
  packageFilesWritten: false,
  transactionLogWritten: false
})

const emptyEffects = createEffects(false, false)

const toEntryError = (error: unknown, message: string): ContentPackageSourceError =>
  error instanceof ContentPackageSourceError
    ? error
    : new ContentPackageSourceError('SOURCE_PERMISSION_REVOKED', message)

const toImportId = (importId: UseWebFilePickerImportEntryOptions['importId']): string =>
  typeof importId === 'function'
    ? importId()
    : importId ?? WEB_FILE_PICKER_IMPORT_ENTRY_DEFAULT_IMPORT_ID

export const createBrowserWebFilePickerSelector = (
  options: BrowserWebFilePickerSelectorOptions = {}
): WebFilePickerImportSelector => async selectionOptions => {
  const browserDocument = options.document ?? globalThis.document
  if (browserDocument?.body === undefined) {
    throw new ContentPackageSourceError('SOURCE_ENTRY_NOT_FOUND', 'Web file picker is not available')
  }

  return await new Promise<readonly WebFilePickerImportFile[]>((resolve, reject) => {
    const input = browserDocument.createElement('input')
    input.type = 'file'
    input.multiple = selectionOptions.multiple
    ;(input as HTMLInputElement & { webkitdirectory?: boolean }).webkitdirectory = selectionOptions.directory
    input.style.display = 'none'

    const cleanup = (): void => {
      input.removeEventListener('change', handleChange)
      input.removeEventListener('cancel', handleCancel)
      if (browserDocument.body.contains(input)) {
        browserDocument.body.removeChild(input)
      }
    }

    const handleChange = (): void => {
      try {
        const files = Object.freeze(Array.from(input.files ?? []) as readonly WebFilePickerImportFile[])
        cleanup()
        resolve(files)
      } catch (error) {
        cleanup()
        reject(error)
      }
    }

    const handleCancel = (): void => {
      cleanup()
      resolve(Object.freeze([]))
    }

    input.addEventListener('change', handleChange)
    input.addEventListener('cancel', handleCancel)
    browserDocument.body.appendChild(input)
    input.click()
  })
}

export const useWebFilePickerImportEntry = (
  options: UseWebFilePickerImportEntryOptions = {}
) => {
  const status = ref<WebFilePickerImportEntryStatus>('idle')
  const lastSource = shallowRef<ContentPackageSource | null>(null)
  const lastRecord = shallowRef<WebIndexedDbImportRecord | null>(null)
  const lastError = shallowRef<ContentPackageSourceError | null>(null)
  const lastEffects = shallowRef<WebFilePickerImportEntryEffects>(emptyEffects)

  const policy = options.policy ?? CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
  const selectFiles = options.selectFiles ?? createBrowserWebFilePickerSelector()
  const isBusy = computed(() => status.value === 'selecting' || status.value === 'importing')
  const runtimeBoundaryClosed = computed(() =>
    !lastEffects.value.runtimeRegistryPublished
    && !lastEffects.value.liveRegistryMutated
    && !lastEffects.value.modLockWritten
    && !lastEffects.value.settingsWritten
    && !lastEffects.value.saveWritten
    && !lastEffects.value.officialCacheWritten
    && !lastEffects.value.packageFilesWritten
    && !lastEffects.value.transactionLogWritten
  )

  const setResult = (result: WebFilePickerImportEntryResult): WebFilePickerImportEntryResult => {
    status.value = result.status
    lastSource.value = result.source
    lastRecord.value = result.record
    lastError.value = result.error
    lastEffects.value = result.effects
    return Object.freeze(result)
  }

  const disposeLastSource = async(): Promise<void> => {
    const source = lastSource.value
    if (source === null) return
    lastSource.value = null
    await source.dispose()
  }

  const fail = async(
    error: unknown,
    message: string,
    fileCount = 0,
    createdSource: ContentPackageSource | null = null
  ): Promise<WebFilePickerImportEntryResult> => {
    if (createdSource !== null) {
      await createdSource.dispose()
    }
    const entryError = toEntryError(error, message)
    return setResult({
      status: 'failed',
      source: null,
      record: null,
      fileCount,
      effects: emptyEffects,
      error: entryError
    })
  }

  const importFiles = async(
    files: readonly WebFilePickerImportFile[]
  ): Promise<WebFilePickerImportEntryResult> => {
    await disposeLastSource()
    lastRecord.value = null
    lastError.value = null
    lastEffects.value = emptyEffects

    if (files.length === 0) {
      return setResult({
        status: 'cancelled',
        source: null,
        record: null,
        fileCount: 0,
        effects: emptyEffects,
        error: null
      })
    }

    status.value = 'importing'
    let source: ContentPackageSource | null = null
    try {
      source = createWebFilePickerImportSource({
        files,
        sourceId: options.sourceId ?? WEB_FILE_PICKER_IMPORT_SOURCE_ID,
        rootPath: options.rootPath ?? WEB_FILE_PICKER_IMPORT_ROOT_PATH,
        policy
      })
      const record = options.persistenceStore === null || options.persistenceStore === undefined
        ? null
        : await persistWebFilePickerImportSource(options.persistenceStore, toImportId(options.importId), source, policy)
      return setResult({
        status: record === null ? 'ready' : 'persisted',
        source,
        record,
        fileCount: files.length,
        effects: createEffects(true, record !== null),
        error: null
      })
    } catch (error) {
      return await fail(error, 'Web file-picker import failed', files.length, source)
    }
  }

  const pickFiles = async(): Promise<WebFilePickerImportEntryResult> => {
    status.value = 'selecting'
    lastError.value = null
    try {
      return await importFiles(await selectFiles({ directory: true, multiple: true }))
    } catch (error) {
      return await fail(error, 'Web file-picker import selection failed')
    }
  }

  const reset = async(): Promise<void> => {
    await disposeLastSource()
    status.value = 'idle'
    lastRecord.value = null
    lastError.value = null
    lastEffects.value = emptyEffects
  }

  return {
    status,
    isBusy,
    runtimeBoundaryClosed,
    lastSource,
    lastRecord,
    lastError,
    lastEffects,
    pickFiles,
    importFiles,
    reset
  }
}
