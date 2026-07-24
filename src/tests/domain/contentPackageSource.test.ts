import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'
import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  type ContentPackageSource,
  ContentPackageSourceError,
  createDiscoveryFileSystemFromContentPackageSource,
  createMemoryContentPackageSource,
  normalizeContentPackageSourceArchiveEntryPath,
  normalizeContentPackageSourceDirectoryEntries,
  normalizeContentPackageSourceEntryName,
  normalizeContentPackageSourcePath,
  readContentPackageSourceJson,
  validateContentPackageSourceArchiveEntries,
  validateContentPackageSourceIdentity
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

const createMetadataGuardSource = (
  entries: Record<string, { readonly kind: 'file' | 'directory' | 'other'; readonly isSymbolicLink: boolean } | null>,
  hooks?: { readAttempted?: (path: string) => void }
): ContentPackageSource => ({
  identity: {
    contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
    kind: 'memory',
    sourceId: 'memory/json-metadata-guard',
    rootPath: 'packs'
  },
  async getEntry(path) {
    const entry = entries[path]
    if (entry === undefined || entry === null) return null
    return {
      name: path.split('/').pop() ?? 'packs',
      kind: entry.kind,
      isSymbolicLink: entry.isSymbolicLink
    }
  },
  async readDirectory() {
    return []
  },
  async readTextFile(path) {
    hooks?.readAttempted?.(path)
    return toJson(createManifest('should_not_be_read'))
  },
  async dispose() {}
})

const captureSourceError = (fn: () => unknown): ContentPackageSourceError => {
  try {
    fn()
  } catch (error) {
    expect(error).toBeInstanceOf(ContentPackageSourceError)
    return error as ContentPackageSourceError
  }
  throw new Error('Expected ContentPackageSourceError')
}

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

  it('validates directory entry names, duplicate listings and non-file metadata before discovery', async() => {
    expect(normalizeContentPackageSourceEntryName('manifest.json')).toBe('manifest.json')
    expect(normalizeContentPackageSourceDirectoryEntries([
      { name: 'z-pack', kind: 'directory', isSymbolicLink: false },
      { name: 'pipe-pack', kind: 'other', isSymbolicLink: false },
      { name: 'a-pack', kind: 'file', isSymbolicLink: false }
    ])).toEqual([
      { name: 'a-pack', kind: 'file', isSymbolicLink: false },
      { name: 'pipe-pack', kind: 'other', isSymbolicLink: false },
      { name: 'z-pack', kind: 'directory', isSymbolicLink: false }
    ])

    for (const unsafeName of ['', '.', '..', '../manifest.json', '/manifest.json', 'C:/pack', 'pack/name', 'pack\\name']) {
      expect(() => normalizeContentPackageSourceEntryName(unsafeName)).toThrow(ContentPackageSourceError)
    }
    expect(captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      { name: 'pack', kind: 'directory', isSymbolicLink: false },
      { name: 'pack', kind: 'file', isSymbolicLink: false }
    ])).code).toBe('SOURCE_DUPLICATE_PATH')
    expect(captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      { name: 'pipe', kind: 'socket', isSymbolicLink: false } as never
    ])).code).toBe('SOURCE_ENTRY_UNSAFE')

    let readAttempted = false
    const source: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/other-entry-source',
        rootPath: 'packs'
      },
      async getEntry(path) {
        return path === ''
          ? { name: 'packs', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return [{ name: 'pipe-pack', kind: 'other', isSymbolicLink: false }]
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('non-file entries must not be read')
      },
      async dispose() {}
    }

    const report = await discoverThirdPartyDataPacks(
      'packs',
      createDiscoveryFileSystemFromContentPackageSource(source)
    )

    expect(readAttempted).toBe(false)
    expect(report.status).toBe('completed')
    expect(report.candidates).toEqual([])
    expect(report.issues).toEqual([
      expect.objectContaining({
        kind: 'missing-manifest',
        path: 'pipe-pack',
        severity: 'warning'
      })
    ])
  })

  it('turns hostile source directory entry names into structured unsafe-path diagnostics', async() => {
    const source: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/hostile-entry-source',
        rootPath: 'packs'
      },
      async getEntry(path) {
        return path === ''
          ? { name: 'packs', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return [{ name: '../userdata', kind: 'directory', isSymbolicLink: false }]
      },
      async readTextFile() {
        throw new Error('unsafe entries must not be read')
      },
      async dispose() {}
    }

    const report = await discoverThirdPartyDataPacks(
      'packs',
      createDiscoveryFileSystemFromContentPackageSource(source)
    )

    expect(report.status).toBe('directory-not-found')
    expect(report.issues[0]).toMatchObject({
      kind: 'path-unsafe',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_PATH_UNSAFE'
    })
  })

  it('validates archive entry paths and resource guardrails without extracting archives', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS

    expect(normalizeContentPackageSourceArchiveEntryPath('pack/data/items.json')).toBe('pack/data/items.json')
    for (const unsafePath of [
      '',
      '../outside.json',
      '/absolute.json',
      'C:/Users/LENOVO/mod.json',
      'pack\\data\\items.json',
      'pack/./items.json'
    ]) {
      expect(() => normalizeContentPackageSourceArchiveEntryPath(unsafePath)).toThrow(ContentPackageSourceError)
    }
    expect(captureSourceError(() => normalizeContentPackageSourceArchiveEntryPath(
      'a/'.repeat(limits.maxPathDepth) + 'manifest.json'
    )).code).toBe('SOURCE_LIMIT_EXCEEDED')
    expect(captureSourceError(() => normalizeContentPackageSourceArchiveEntryPath(
      `${'a'.repeat(limits.maxPathUtf8Bytes + 1)}.json`
    )).code).toBe('SOURCE_LIMIT_EXCEEDED')

    expect(validateContentPackageSourceArchiveEntries([
      { path: 'manifest.json', uncompressedSizeBytes: 1, compressedSizeBytes: 1 },
      { path: 'data/items.json', uncompressedSizeBytes: 100, compressedSizeBytes: 1 }
    ])).toEqual([
      { path: 'manifest.json', uncompressedSizeBytes: 1, compressedSizeBytes: 1 },
      { path: 'data/items.json', uncompressedSizeBytes: 100, compressedSizeBytes: 1 }
    ])
    expect(captureSourceError(() => validateContentPackageSourceArchiveEntries([
      { path: 'manifest.json', uncompressedSizeBytes: 1 },
      { path: 'manifest.json', uncompressedSizeBytes: 1 }
    ])).code).toBe('SOURCE_DUPLICATE_PATH')
    expect(captureSourceError(() => validateContentPackageSourceArchiveEntries(
      Array.from({ length: limits.maxPackageFileCount + 1 }, (_, index) => ({
        path: `data/${index}.json`,
        uncompressedSizeBytes: 0
      }))
    )).code).toBe('SOURCE_LIMIT_EXCEEDED')
    expect(captureSourceError(() => validateContentPackageSourceArchiveEntries([
      { path: 'large.bin', uncompressedSizeBytes: limits.maxSingleFileBytes + 1 }
    ])).code).toBe('SOURCE_LIMIT_EXCEEDED')
    expect(captureSourceError(() => validateContentPackageSourceArchiveEntries(
      Array.from({ length: 5 }, (_, index) => ({
        path: `data/${index}.bin`,
        uncompressedSizeBytes: limits.maxSingleFileBytes
      }))
    )).code).toBe('SOURCE_LIMIT_EXCEEDED')
    expect(captureSourceError(() => validateContentPackageSourceArchiveEntries([
      { path: 'ratio.bin', uncompressedSizeBytes: limits.maxCompressedRatio + 1, compressedSizeBytes: 1 }
    ])).code).toBe('SOURCE_LIMIT_EXCEEDED')
  })

  it('rejects unsafe archive size metadata before ZIP payloads can become sources', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS

    expect(validateContentPackageSourceArchiveEntries([
      { path: 'empty.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 0 },
      { path: 'ratio-edge.bin', uncompressedSizeBytes: limits.maxCompressedRatio, compressedSizeBytes: 1 }
    ])).toEqual([
      { path: 'empty.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 0 },
      { path: 'ratio-edge.bin', uncompressedSizeBytes: limits.maxCompressedRatio, compressedSizeBytes: 1 }
    ])

    for (const entry of [
      { path: 'negative.bin', uncompressedSizeBytes: -1 },
      { path: 'fraction.bin', uncompressedSizeBytes: 1.5 },
      { path: 'infinite.bin', uncompressedSizeBytes: Number.POSITIVE_INFINITY },
      { path: 'compressed-negative.bin', uncompressedSizeBytes: 0, compressedSizeBytes: -1 },
      { path: 'compressed-fraction.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 1.5 },
      { path: 'zip-bomb.bin', uncompressedSizeBytes: 1, compressedSizeBytes: 0 }
    ]) {
      expect(captureSourceError(() => validateContentPackageSourceArchiveEntries([entry])).code)
        .toBe('SOURCE_LIMIT_EXCEEDED')
    }
  })

  it('validates source identity before a platform source can enter discovery', async() => {
    const source = createValidSource()

    expect(validateContentPackageSourceIdentity(source.identity)).toEqual(source.identity)
    expect(() => validateContentPackageSourceIdentity({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory\\not-normalized',
      rootPath: 'packs'
    } as never)).toThrow(ContentPackageSourceError)

    const invalidVersionSource: ContentPackageSource = {
      ...source,
      identity: {
        ...source.identity,
        contractVersion: 999
      } as never
    }
    const report = await discoverThirdPartyDataPacks(
      'packs',
      createDiscoveryFileSystemFromContentPackageSource(invalidVersionSource)
    )

    expect(report.status).toBe('directory-not-found')
    expect(report.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source inspect operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_IDENTITY_INVALID'
    })
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
    const oversized = await readContentPackageSourceJson(source, 'pack/manifest.json', {
      ...CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
      maxSingleFileBytes: 1
    })

    expect(valid.ok).toBe(true)
    if (valid.ok) {
      const data: unknown = valid.data
      expect(data).toMatchObject({ id: 'json_source' })
    }
    expect(invalid).toMatchObject({
      ok: false,
      code: 'SOURCE_JSON_PARSE_FAILED'
    })
    expect(oversized).toMatchObject({
      ok: false,
      code: 'SOURCE_LIMIT_EXCEEDED'
    })
  })

  it('checks file metadata before direct JSON reads expose payload text', async() => {
    const readAttempts: string[] = []
    const source = createMetadataGuardSource({
      'pack/missing.json': null,
      'pack/directory.json': { kind: 'directory', isSymbolicLink: false },
      'pack/symlink.json': { kind: 'file', isSymbolicLink: true },
      'pack/valid.json': { kind: 'file', isSymbolicLink: false }
    }, {
      readAttempted: path => {
        readAttempts.push(path)
      }
    })

    await expect(readContentPackageSourceJson(source, '../userdata/settings.json')).resolves.toMatchObject({
      ok: false,
      code: 'SOURCE_PATH_UNSAFE'
    })
    await expect(readContentPackageSourceJson(source, 'pack/missing.json')).resolves.toMatchObject({
      ok: false,
      code: 'SOURCE_ENTRY_NOT_FOUND'
    })
    await expect(readContentPackageSourceJson(source, 'pack/directory.json')).resolves.toMatchObject({
      ok: false,
      code: 'SOURCE_ENTRY_NOT_FILE'
    })
    await expect(readContentPackageSourceJson(source, 'pack/symlink.json')).resolves.toMatchObject({
      ok: false,
      code: 'SOURCE_PATH_UNSAFE'
    })
    await expect(readContentPackageSourceJson(source, 'pack/valid.json')).resolves.toMatchObject({
      ok: true
    })

    expect(readAttempts).toEqual(['pack/valid.json'])
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
