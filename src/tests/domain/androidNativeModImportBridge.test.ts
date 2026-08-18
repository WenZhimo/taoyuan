import { describe, expect, it, vi } from 'vitest'
import {
  createDiscoveryFileSystemFromContentPackageSource,
  readContentPackageSourceJson
} from '@/domain/mods/contentPackageSource'
import { discoverThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackDiscovery'
import {
  createAndroidNativeModImportBridgeHost,
  createAndroidNativeModImportSource,
  type AndroidNativeModImportPlugin
} from '@/domain/mods/androidNativeModImportBridge'

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = () => ({
  id: 'native_android_valid',
  name: { key: 'native_android_valid.package.name', fallback: 'native_android_valid' },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Native Android Import Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = () => ({
  id: 'native_android_valid:paper_charm',
  name: { key: 'native_android_valid.paper_charm.name', fallback: 'paper charm' },
  category: 'gift',
  description: { key: 'native_android_valid.paper_charm.description', fallback: 'paper charm' },
  sellPrice: 8,
  edible: false
})

const createPlugin = (files: Record<string, string>): AndroidNativeModImportPlugin & {
  listImportedFiles: ReturnType<typeof vi.fn>
  readImportedText: ReturnType<typeof vi.fn>
} => ({
  chooseAndCopyImport: vi.fn(async() => ({
    importId: 'native-import',
    files: Object.entries(files).map(([relativePath, text]) => ({
      relativePath,
      sizeBytes: text.length
    }))
  })),
  listImportedFiles: vi.fn(async() => ({
    files: Object.entries(files).map(([relativePath, text]) => ({
      relativePath,
      sizeBytes: text.length
    }))
  })),
  readImportedText: vi.fn(async({ relativePath }: { readonly relativePath: string }) => ({
    text: files[relativePath] ?? ''
  })),
  deleteImport: vi.fn(async() => undefined)
})

describe('android native mod import bridge', () => {
  it('adapts the Capacitor plugin into the app-data host contract', async() => {
    const plugin = createPlugin({
      'native-pack/manifest.json': toJson(createManifest()),
      'native-pack/locales/zh-CN.json': '{}\n',
      'native-pack/data/items.json': toJson([createItem()])
    })
    const host = createAndroidNativeModImportBridgeHost(plugin)

    await expect(host.listImportedFiles('native-import')).resolves.toEqual([
      { relativePath: 'native-pack/manifest.json', sizeBytes: toJson(createManifest()).length },
      { relativePath: 'native-pack/locales/zh-CN.json', sizeBytes: 3 },
      { relativePath: 'native-pack/data/items.json', sizeBytes: toJson([createItem()]).length }
    ])
    await expect(host.readImportedText('native-import', 'native-pack/manifest.json'))
      .resolves.toBe(toJson(createManifest()))
    expect(plugin.listImportedFiles).toHaveBeenCalledWith({ importId: 'native-import' })
    expect(plugin.readImportedText).toHaveBeenCalledWith({
      importId: 'native-import',
      relativePath: 'native-pack/manifest.json'
    })
    expect(Object.isFrozen(host)).toBe(true)
  })

  it('creates a shared read-only source from native app-data import files', async() => {
    const plugin = createPlugin({
      'native-pack/manifest.json': toJson(createManifest()),
      'native-pack/locales/zh-CN.json': '{}\n',
      'native-pack/data/items.json': toJson([createItem()])
    })
    const source = await createAndroidNativeModImportSource({
      plugin,
      importId: 'native-import'
    })
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)
    const manifest = await readContentPackageSourceJson(source, 'native-pack/manifest.json')
    const report = await discoverThirdPartyDataPacks(source.identity.rootPath, fileSystem)

    expect(source.identity).toMatchObject({
      kind: 'android-file-picker-import',
      sourceId: 'android/app-data-import',
      rootPath: 'android-import'
    })
    expect(manifest).toMatchObject({
      ok: true,
      data: { id: 'native_android_valid' }
    })
    expect(report.status).toBe('completed')
    expect(report.candidates[0]?.path).toBe('native-pack')
    expect(JSON.stringify(source.identity)).not.toContain('/data/user')
  })
})
