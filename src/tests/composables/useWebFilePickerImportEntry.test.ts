import { describe, expect, it, vi } from 'vitest'
import {
  createDiscoveryFileSystemFromContentPackageSource,
  readContentPackageSourceJson
} from '@/domain/mods/contentPackageSource'
import { discoverThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackDiscovery'
import type { WebFilePickerImportFile } from '@/domain/mods/webFilePickerImportSource'
import { createInMemoryWebIndexedDbImportPersistenceStore } from '@/domain/mods/webIndexedDbImportPersistence'
import {
  WEB_FILE_PICKER_IMPORT_ENTRY_DEFAULT_IMPORT_ID,
  createBrowserWebFilePickerSelector,
  useWebFilePickerImportEntry
} from '@/composables/useWebFilePickerImportEntry'

type JsonObject = Record<string, unknown>

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = (packageId = 'web_entry'): JsonObject => ({
  id: packageId,
  name: { key: `${packageId}.package.name`, fallback: packageId },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Web Entry Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = (id = 'web_entry:linen_ribbon'): JsonObject => ({
  id,
  name: { key: `${id}.name`, fallback: id },
  category: 'gift',
  description: { key: `${id}.description`, fallback: `${id} description` },
  sellPrice: 8,
  edible: false
})

const createFile = (path: string, text: string): WebFilePickerImportFile => ({
  name: path.split('/').pop() ?? path,
  webkitRelativePath: path,
  size: text.length,
  text: vi.fn(async() => text)
})

const createValidFiles = (packageId = 'web_entry'): readonly WebFilePickerImportFile[] => [
  createFile('valid-gift-pack/manifest.json', toJson(createManifest(packageId))),
  createFile('valid-gift-pack/locales/zh-CN.json', '{}\n'),
  createFile('valid-gift-pack/data/items.json', toJson([createItem(`${packageId}:linen_ribbon`)]))
]

describe('useWebFilePickerImportEntry', () => {
  it('opens the injected selector and exposes a read-only Web ContentPackageSource', async() => {
    const selectFiles = vi.fn(async() => createValidFiles())
    const entry = useWebFilePickerImportEntry({ selectFiles })

    const result = await entry.pickFiles()

    expect(selectFiles).toHaveBeenCalledWith({ directory: true, multiple: true })
    expect(result.status).toBe('ready')
    expect(entry.status.value).toBe('ready')
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
    expect(entry.lastEffects.value).toEqual({
      sourceCreated: true,
      indexedDbImportPersisted: false,
      runtimeRegistryPublished: false,
      liveRegistryMutated: false,
      modLockWritten: false,
      settingsWritten: false,
      saveWritten: false,
      officialCacheWritten: false,
      packageFilesWritten: false,
      transactionLogWritten: false
    })

    expect(result.source?.identity).toMatchObject({
      kind: 'web-file-picker-import',
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import'
    })
    await expect(readContentPackageSourceJson(result.source!, 'valid-gift-pack/manifest.json'))
      .resolves.toMatchObject({ ok: true, data: { id: 'web_entry' } })

    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(result.source!)
    const discoveryReport = await discoverThirdPartyDataPacks(result.source!.identity.rootPath, fileSystem)
    expect(discoveryReport.status).toBe('completed')
    expect(discoveryReport.candidates[0]?.path).toBe('valid-gift-pack')
  })

  it('persists the selected source only when an import store is explicitly provided', async() => {
    const store = createInMemoryWebIndexedDbImportPersistenceStore()
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => createValidFiles('web_entry_persisted')),
      persistenceStore: store
    })

    const result = await entry.pickFiles()

    expect(result.status).toBe('persisted')
    expect(result.record).toMatchObject({
      importId: WEB_FILE_PICKER_IMPORT_ENTRY_DEFAULT_IMPORT_ID,
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import'
    })
    expect(entry.lastEffects.value.indexedDbImportPersisted).toBe(true)
    expect(await store.list()).toEqual([{
      importId: WEB_FILE_PICKER_IMPORT_ENTRY_DEFAULT_IMPORT_ID,
      sourceId: 'web/file-picker-import',
      rootPath: 'web-import',
      fileCount: 3,
      totalBytes: result.record!.files.reduce((total, file) => total + file.sizeBytes, 0)
    }])
  })

  it('treats an empty selection as cancelled without creating a source', async() => {
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => [])
    })

    const result = await entry.pickFiles()

    expect(result).toMatchObject({
      status: 'cancelled',
      source: null,
      record: null,
      fileCount: 0,
      error: null
    })
    expect(entry.lastSource.value).toBeNull()
    expect(entry.lastEffects.value.sourceCreated).toBe(false)
  })

  it('contains selector failures before they leak host paths to UI state', async() => {
    const entry = useWebFilePickerImportEntry({
      selectFiles: vi.fn(async() => {
        throw new Error('NotAllowedError: C:/Users/LENOVO/Downloads/private-pack/manifest.json')
      })
    })

    const result = await entry.pickFiles()

    expect(result.status).toBe('failed')
    expect(result.error).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Web file-picker import selection failed'
    })
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(entry.runtimeBoundaryClosed.value).toBe(true)
  })

  it('configures the browser file input for directory-style multi-file selection', async() => {
    const file = createFile('valid-gift-pack/manifest.json', toJson(createManifest()))
    const createdInputs: HTMLInputElement[] = []
    const fakeDocument = {
      createElement: (tagName: string) => {
        const input = document.createElement(tagName) as HTMLInputElement
        vi.spyOn(input, 'click').mockImplementation(() => {})
        createdInputs.push(input)
        return input
      },
      body: document.body
    } as unknown as Document
    const selector = createBrowserWebFilePickerSelector({ document: fakeDocument })

    const selection = selector({ directory: true, multiple: true })
    const input = createdInputs[0]!
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file]
    })
    input.dispatchEvent(new Event('change'))

    await expect(selection).resolves.toEqual([file])
    expect(input.type).toBe('file')
    expect(input.multiple).toBe(true)
    expect((input as HTMLInputElement & { webkitdirectory?: boolean }).webkitdirectory).toBe(true)
    expect(input.style.display).toBe('none')
  })
})
