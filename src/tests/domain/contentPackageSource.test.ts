import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'
import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  type ContentPackageSource,
  ContentPackageSourceError,
  createDiscoveryFileSystemFromContentPackageSource,
  createMemoryContentPackageSource,
  normalizeContentPackageSourcePath,
  readContentPackageSourceJson
} from '@/domain/mods/contentPackageSource'
import { discoverThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackDiscovery'

type JsonObject = Record<string, unknown>

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const createManifest = (packageId = 'memory_valid'): JsonObject => ({
  id: packageId,
  name: { key: `${packageId}.package.name`, fallback: packageId },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'Memory Source Tester', role: 'developer' }],
  license: 'MIT',
  dependencies: [],
  entrypoints: { 'taoyuan:item': ['data/items.json'] }
})

const createItem = (id = 'memory_valid:linen_ribbon'): JsonObject => ({
  id,
  name: { key: `${id}.name`, fallback: id },
  category: 'gift',
  description: { key: `${id}.description`, fallback: `${id} description` },
  sellPrice: 8,
  edible: false
})

const createValidSource = () => createMemoryContentPackageSource({
  sourceId: 'memory/test-source',
  rootPath: 'packs',
  files: [
    { path: 'valid-gift-pack/manifest.json', text: toJson(createManifest()) },
    { path: 'valid-gift-pack/locales/zh-CN.json', text: '{}\n' },
    { path: 'valid-gift-pack/data/items.json', text: toJson([createItem()]) }
  ]
})

const createManifestInspectionFailureSource = (): ContentPackageSource => ({
  identity: {
    contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
    kind: 'memory',
    sourceId: 'memory/manifest-inspection-failure',
    rootPath: 'packs'
  },
  async getEntry(path) {
    if (path === '') {
      return { name: 'packs', kind: 'directory', isSymbolicLink: false }
    }
    if (path === 'blocked-pack') {
      return { name: 'blocked-pack', kind: 'directory', isSymbolicLink: false }
    }
    if (path === 'blocked-pack/manifest.json') {
      throw new ContentPackageSourceError(
        'SOURCE_PERMISSION_REVOKED',
        'Source permission was revoked while inspecting manifest',
        path
      )
    }
    return null
  },
  async readDirectory(path) {
    if (path === '') {
      return [{ name: 'blocked-pack', kind: 'directory', isSymbolicLink: false }]
    }
    throw new ContentPackageSourceError('SOURCE_ENTRY_NOT_DIRECTORY', 'Only root can be listed', path)
  },
  async readTextFile(path) {
    throw new ContentPackageSourceError('SOURCE_ENTRY_NOT_FOUND', 'No files can be read', path)
  },
  async dispose() {}
})

describe('content package source contract', () => {
  it('bridges a normalized in-memory source into the shared third-party discovery pipeline', async() => {
    const source = createValidSource()
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    const manifestJson = await readContentPackageSourceJson(source, 'valid-gift-pack/manifest.json')
    const report = await discoverThirdPartyDataPacks(source.identity.rootPath, fileSystem)

    expect(source.identity).toEqual({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/test-source',
      rootPath: 'packs'
    })
    expect(JSON.stringify(source.identity)).not.toContain(cwd())
    expect(manifestJson.ok).toBe(true)
    if (manifestJson.ok) {
      expect(manifestJson.data).toMatchObject({ id: 'memory_valid' })
    }
    expect(report.status).toBe('completed')
    expect(report.summary).toMatchObject({
      scannedEntries: 1,
      candidateCount: 1,
      validPackageCount: 1,
      invalidPackageCount: 0,
      issueCount: 0
    })
    expect(report.candidates[0]?.path).toBe('valid-gift-pack')
    expect(report.candidates[0]?.contentFiles[0]?.path).toBe('data/items.json')
  })

  it('normalizes relative source paths and rejects absolute or escaping paths', async() => {
    const source = createMemoryContentPackageSource({
      sourceId: 'memory/path-source',
      rootPath: 'packs',
      files: [
        { path: 'valid-gift-pack\\manifest.json', text: toJson(createManifest()) },
        { path: 'valid-gift-pack/data/items.json', text: toJson([createItem()]) }
      ]
    })

    expect(normalizeContentPackageSourcePath('valid-gift-pack\\manifest.json')).toBe('valid-gift-pack/manifest.json')
    await expect(source.getEntry('valid-gift-pack/manifest.json')).resolves.toMatchObject({
      name: 'manifest.json',
      kind: 'file',
      isSymbolicLink: false
    })
    expect(() => normalizeContentPackageSourcePath('../outside.json')).toThrow(ContentPackageSourceError)
    expect(() => normalizeContentPackageSourcePath('C:/Users/LENOVO/mod.json')).toThrow(ContentPackageSourceError)
    expect(() => createMemoryContentPackageSource({
      sourceId: 'memory/duplicate-source',
      rootPath: 'packs',
      files: [
        { path: 'pack/manifest.json', text: '{}\n' },
        { path: 'pack\\manifest.json', text: '{}\n' }
      ]
    })).toThrow(ContentPackageSourceError)
  })

  it('keeps file payloads as unknown pure JSON before TypeBox validation', async() => {
    const source = createMemoryContentPackageSource({
      sourceId: 'memory/json-source',
      rootPath: 'packs',
      files: [
        { path: 'pack/manifest.json', text: toJson(createManifest('json_source')) },
        { path: 'pack/broken.json', text: '{ bad json' }
      ]
    })

    const valid = await readContentPackageSourceJson(source, 'pack/manifest.json')
    const invalid = await readContentPackageSourceJson(source, 'pack/broken.json')

    expect(valid.ok).toBe(true)
    if (valid.ok) {
      const data: unknown = valid.data
      expect(data).toMatchObject({ id: 'json_source' })
    }
    expect(invalid).toMatchObject({
      ok: false,
      code: 'SOURCE_JSON_PARSE_FAILED'
    })
  })

  it('reports permission revocation and disposal without retaining platform handles', async() => {
    const revoked = createValidSource()
    const disposed = createValidSource()

    revoked.revoke()
    await disposed.dispose()

    await expect(revoked.readTextFile('valid-gift-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED'
    })
    await expect(disposed.readTextFile('valid-gift-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_DISPOSED'
    })
    expect(await readContentPackageSourceJson(revoked, 'valid-gift-pack/manifest.json')).toMatchObject({
      ok: false,
      code: 'SOURCE_PERMISSION_REVOKED'
    })
    expect(await readContentPackageSourceJson(disposed, 'valid-gift-pack/manifest.json')).toMatchObject({
      ok: false,
      code: 'SOURCE_DISPOSED'
    })
  })

  it('turns unavailable package sources into structured discovery diagnostics', async() => {
    const revoked = createValidSource()
    revoked.revoke()

    const revokedReport = await discoverThirdPartyDataPacks(
      revoked.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(revoked)
    )
    const outsideRootReport = await discoverThirdPartyDataPacks(
      'outside-root',
      createDiscoveryFileSystemFromContentPackageSource(createValidSource())
    )

    expect(revokedReport.status).toBe('directory-not-found')
    expect(revokedReport.summary.issueCount).toBe(1)
    expect(revokedReport.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source inspect operation failed'
    })
    expect(revokedReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })

    expect(outsideRootReport.status).toBe('directory-not-found')
    expect(outsideRootReport.issues[0]).toMatchObject({
      kind: 'path-unsafe',
      severity: 'fatal',
      path: '.'
    })
    expect(outsideRootReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_PATH_OUTSIDE_ROOT'
    })
  })

  it('keeps candidate-level source inspection failures inside the discovery report', async() => {
    const source = createManifestInspectionFailureSource()

    const report = await discoverThirdPartyDataPacks(
      source.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(source)
    )

    expect(report.status).toBe('completed')
    expect(report.summary).toMatchObject({
      scannedEntries: 1,
      candidateCount: 1,
      validPackageCount: 0,
      invalidPackageCount: 1,
      issueCount: 1
    })
    expect(report.candidates[0]).toMatchObject({
      path: 'blocked-pack',
      status: 'invalid'
    })
    expect(report.candidates[0]?.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'error',
      path: 'blocked-pack/manifest.json',
      candidatePath: 'blocked-pack',
      reason: 'Package source inspect operation failed'
    })
    expect(report.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
  })
})
