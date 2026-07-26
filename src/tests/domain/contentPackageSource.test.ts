import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'
import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  type ContentPackageSource,
  type ContentPackageSourceDirectoryEntry,
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
  entries: Record<
    string,
    {
      readonly kind: 'file' | 'directory' | 'other'
      readonly isSymbolicLink: boolean
      readonly name?: string
    } | null
  >,
  hooks?: {
    readAttempted?: (path: string) => void
    directoryReadAttempted?: (path: string) => void
    directoryEntries?: readonly ContentPackageSourceDirectoryEntry[]
  }
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
      name: entry.name ?? (path === '' ? 'packs' : path.split('/').pop() ?? 'packs'),
      kind: entry.kind,
      isSymbolicLink: entry.isSymbolicLink
    }
  },
  async readDirectory(path) {
    hooks?.directoryReadAttempted?.(path)
    return hooks?.directoryEntries ?? []
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

const captureAsyncSourceError = async(fn: () => Promise<unknown>): Promise<ContentPackageSourceError> => {
  try {
    await fn()
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
    const absolutePathError = captureSourceError(() => normalizeContentPackageSourcePath('C:/Users/LENOVO/mod.json'))
    expect(absolutePathError).toMatchObject({
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Content package source path is unsafe'
    })
    expect(JSON.stringify(absolutePathError)).not.toContain('C:/Users')
    expect(JSON.stringify(absolutePathError)).not.toContain('LENOVO')
    expect(() => createMemoryContentPackageSource({
      sourceId: 'memory/duplicate-source',
      rootPath: 'packs',
      files: [
        { path: 'pack/manifest.json', text: '{}\n' },
        { path: 'pack\\manifest.json', text: '{}\n' }
      ]
    })).toThrow(ContentPackageSourceError)
  })

  it('redacts unsafe platform paths before direct reads or discovery diagnostics expose them', async() => {
    const source = createValidSource()

    const directJson = await readContentPackageSourceJson(source, 'C:/Users/LENOVO/mods/manifest.json')
    const discoveryReport = await discoverThirdPartyDataPacks(
      'C:/Users/LENOVO/mods',
      createDiscoveryFileSystemFromContentPackageSource(source)
    )

    expect(directJson).toMatchObject({
      ok: false,
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Content package source path is unsafe'
    })
    expect(discoveryReport.status).toBe('directory-not-found')
    expect(discoveryReport.issues[0]).toMatchObject({
      kind: 'path-unsafe',
      path: '.',
      reason: 'Package source inspect operation failed'
    })
    expect(discoveryReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package discovery path is unsafe',
      sourceCode: 'SOURCE_PATH_UNSAFE'
    })
    expect(JSON.stringify(directJson)).not.toContain('C:/Users')
    expect(JSON.stringify(directJson)).not.toContain('LENOVO')
    expect(JSON.stringify(discoveryReport)).not.toContain('C:/Users')
    expect(JSON.stringify(discoveryReport)).not.toContain('LENOVO')
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
    for (const unsafeMetadataEntry of [
      { name: 'C:/Users/LENOVO/mods/pack', kind: 'socket', isSymbolicLink: false } as never,
      { name: 'pack', kind: 'C:/Users/LENOVO/mods/socket', isSymbolicLink: false } as never,
      { name: 'C:/Users/LENOVO/mods/pack', kind: 'directory' } as never
    ]) {
      const error = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([unsafeMetadataEntry]))

      expect(error.code).toBe('SOURCE_ENTRY_UNSAFE')
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }

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

  it('narrows directory entry metadata from unknown before discovery can inspect packages', async() => {
    for (const hostileEntries of [
      'C:/Users/LENOVO/mods' as unknown,
      [null],
      ['C:/Users/LENOVO/mods/pack'],
      [{ name: 1, kind: 'directory', isSymbolicLink: false }],
      [{ name: 'pack', kind: 1, isSymbolicLink: false }],
      [{ name: 'pack', kind: 'directory', isSymbolicLink: 'C:/Users/LENOVO/symlink' }]
    ]) {
      const error = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries(hostileEntries))

      expect(error.code).toBe('SOURCE_ENTRY_UNSAFE')
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }

    let readAttempted = false
    const source: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/unknown-entry-source',
        rootPath: 'packs'
      },
      async getEntry(path) {
        return path === ''
          ? { name: 'packs', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return [{ name: 'C:/Users/LENOVO/private-pack', kind: 1, isSymbolicLink: false } as never]
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('malformed entries must not be read')
      },
      async dispose() {}
    }

    const report = await discoverThirdPartyDataPacks(
      'packs',
      createDiscoveryFileSystemFromContentPackageSource(source)
    )

    expect(readAttempted).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
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
      { path: 'data/items.json', uncompressedSizeBytes: 100, compressedSizeBytes: 1 },
      { path: 'manifest.json', uncompressedSizeBytes: 1, compressedSizeBytes: 1 }
    ])
    expect(captureSourceError(() => validateContentPackageSourceArchiveEntries([
      { path: 'manifest.json', uncompressedSizeBytes: 1 },
      { path: 'manifest.json', uncompressedSizeBytes: 1 }
    ])).code).toBe('SOURCE_DUPLICATE_PATH')
    expect(captureSourceError(() => validateContentPackageSourceArchiveEntries([
      { path: 'pack', uncompressedSizeBytes: 1 },
      { path: 'pack/manifest.json', uncompressedSizeBytes: 1 }
    ])).code).toBe('SOURCE_DUPLICATE_PATH')
    expect(captureSourceError(() => validateContentPackageSourceArchiveEntries([
      { path: 'pack/data/items.json', uncompressedSizeBytes: 1 },
      { path: 'pack/data', uncompressedSizeBytes: 1 }
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
      { path: 'ratio-edge.bin', uncompressedSizeBytes: limits.maxCompressedRatio, compressedSizeBytes: 1 },
      { path: 'empty.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 0 }
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

  it('narrows archive entry metadata from unknown before ZIP payloads can become sources', () => {
    expect(validateContentPackageSourceArchiveEntries([
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0, compressedSizeBytes: undefined },
      { path: 'pack/data/items.json', uncompressedSizeBytes: 10, compressedSizeBytes: 2 }
    ] as unknown)).toEqual([
      { path: 'pack/data/items.json', uncompressedSizeBytes: 10, compressedSizeBytes: 2 },
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0 }
    ])

    const hostileInputs: readonly unknown[] = [
      null,
      { path: 1, uncompressedSizeBytes: 0 },
      { path: 'C:/Users/LENOVO/mods/pack/manifest.json', uncompressedSizeBytes: 0 },
      { path: 'pack/manifest.json', uncompressedSizeBytes: 'C:/Users/LENOVO/size' },
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0, compressedSizeBytes: 'C:/Users/LENOVO/size' }
    ]

    for (const input of hostileInputs) {
      const error = captureSourceError(() => validateContentPackageSourceArchiveEntries(
        Array.isArray(input) ? input : [input]
      ))

      expect(error.code).toMatch(/^SOURCE_/)
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }

    const nonArrayError = captureSourceError(() => validateContentPackageSourceArchiveEntries(
      'C:/Users/LENOVO/mods/archive.zip' as unknown
    ))

    expect(nonArrayError.code).toBe('SOURCE_ENTRY_UNSAFE')
    expect(JSON.stringify(nonArrayError)).not.toContain('C:/Users')
    expect(JSON.stringify(nonArrayError)).not.toContain('LENOVO')
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

    for (const hostileIdentityPatch of [
      { contractVersion: 'C:/Users/LENOVO/mods/source-version' },
      { kind: 'C:/Users/LENOVO/mods/source-kind' },
      { sourceId: 'C:/Users/LENOVO/mods/source-id' },
      { rootPath: 'C:/Users/LENOVO/mods/root' },
      { sourceId: 1 },
      { rootPath: 1 }
    ]) {
      const hostileIdentity = {
        ...source.identity,
        ...hostileIdentityPatch
      } as never
      const error = captureSourceError(() => validateContentPackageSourceIdentity(hostileIdentity))

      expect(error.code).toBe('SOURCE_IDENTITY_INVALID')
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }

    for (const malformedIdentity of [
      null,
      'C:/Users/LENOVO/mods/source',
      ['C:/Users/LENOVO/mods/source']
    ]) {
      const error = captureSourceError(() => validateContentPackageSourceIdentity(malformedIdentity))

      expect(error.code).toBe('SOURCE_IDENTITY_INVALID')
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }

    const absoluteIdentitySource: ContentPackageSource = {
      ...source,
      identity: {
        ...source.identity,
        sourceId: 'C:/Users/LENOVO/mods'
      }
    }
    const redactedReport = await discoverThirdPartyDataPacks(
      'packs',
      createDiscoveryFileSystemFromContentPackageSource(absoluteIdentitySource)
    )

    expect(redactedReport.status).toBe('directory-not-found')
    expect(redactedReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_IDENTITY_INVALID',
      message: 'sourceId must be a normalized relative identifier'
    })
    expect(JSON.stringify(redactedReport)).not.toContain('C:/Users')
    expect(JSON.stringify(redactedReport)).not.toContain('LENOVO')

    let inspected = false
    const malformedIdentitySource: ContentPackageSource = {
      ...source,
      identity: null as unknown as ContentPackageSource['identity'],
      async getEntry() {
        inspected = true
        throw new Error('malformed identities must be rejected before source inspection')
      }
    }
    const malformedReport = await discoverThirdPartyDataPacks(
      'packs',
      createDiscoveryFileSystemFromContentPackageSource(malformedIdentitySource)
    )

    expect(inspected).toBe(false)
    expect(malformedReport.status).toBe('directory-not-found')
    expect(malformedReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_IDENTITY_INVALID',
      message: 'Content package source identity must be an object'
    })
    expect(JSON.stringify(malformedReport)).not.toContain('C:/Users')
    expect(JSON.stringify(malformedReport)).not.toContain('LENOVO')

    let hostileIdentityInspected = false
    const hostileIdentityGetterSource: ContentPackageSource = {
      get identity(): ContentPackageSource['identity'] {
        throw new Error('EACCES: lstat C:/Users/LENOVO/mods/hostile-identity')
      },
      async getEntry() {
        hostileIdentityInspected = true
        throw new Error('hostile identity getters must be rejected before source inspection')
      },
      async readDirectory() {
        throw new Error('hostile identity getters must be rejected before directory reads')
      },
      async readTextFile() {
        throw new Error('hostile identity getters must be rejected before file reads')
      },
      async dispose() {}
    }
    const hostileIdentityReport = await discoverThirdPartyDataPacks(
      'packs',
      createDiscoveryFileSystemFromContentPackageSource(hostileIdentityGetterSource)
    )

    expect(hostileIdentityInspected).toBe(false)
    expect(hostileIdentityReport.status).toBe('directory-not-found')
    expect(hostileIdentityReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_IDENTITY_INVALID',
      message: 'Content package source identity operation failed'
    })
    expect(JSON.stringify(hostileIdentityReport)).not.toContain('C:/Users')
    expect(JSON.stringify(hostileIdentityReport)).not.toContain('LENOVO')
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

  it('narrows text payloads from unknown before JSON parsing and discovery parsing', async() => {
    const source: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/text-payload-guard',
        rootPath: 'packs'
      },
      async getEntry(path) {
        if (path === '') return { name: 'packs', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack') return { name: 'pack', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack/manifest.json') return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        return null
      },
      async readDirectory(path) {
        if (path === '') return [{ name: 'pack', kind: 'directory', isSymbolicLink: false }]
        return []
      },
      async readTextFile() {
        return { leaked: 'C:/Users/LENOVO/private-pack/manifest.json' } as never
      },
      async dispose() {}
    }
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    const directJson = await readContentPackageSourceJson(source, 'pack/manifest.json')
    const bridgedReadError = await captureAsyncSourceError(() => fileSystem.readTextFile('packs/pack/manifest.json'))
    const discoveryReport = await discoverThirdPartyDataPacks(source.identity.rootPath, fileSystem)

    expect(directJson).toMatchObject({
      ok: false,
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source text payload must be a string'
    })
    expect(bridgedReadError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source text payload must be a string'
    })
    expect(discoveryReport.status).toBe('completed')
    expect(discoveryReport.candidates[0]?.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      path: 'pack/manifest.json',
      reason: 'Package source read operation failed'
    })
    expect(discoveryReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source text payload must be a string'
    })
    for (const result of [directJson, bridgedReadError, discoveryReport]) {
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
    }
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

  it('checks file metadata before bridged discovery reads expose payload text', async() => {
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
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    await expect(fileSystem.readTextFile('packs/../userdata/settings.json')).rejects.toMatchObject({
      code: 'SOURCE_PATH_UNSAFE'
    })
    await expect(fileSystem.readTextFile('packs/pack/missing.json')).rejects.toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FOUND'
    })
    await expect(fileSystem.readTextFile('packs/pack/directory.json')).rejects.toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FILE'
    })
    await expect(fileSystem.readTextFile('packs/pack/symlink.json')).rejects.toMatchObject({
      code: 'SOURCE_PATH_UNSAFE'
    })
    await expect(fileSystem.readTextFile('packs/pack/valid.json')).resolves.toContain('should_not_be_read')

    expect(readAttempts).toEqual(['pack/valid.json'])
  })

  it('checks directory metadata before bridged discovery listings expose entries', async() => {
    const directoryReadAttempts: string[] = []
    const source = createMetadataGuardSource({
      'pack/missing': null,
      'pack/file.json': { kind: 'file', isSymbolicLink: false },
      'pack/symlink-dir': { kind: 'directory', isSymbolicLink: true },
      'pack/valid-dir': { kind: 'directory', isSymbolicLink: false }
    }, {
      directoryReadAttempted: path => {
        directoryReadAttempts.push(path)
      },
      directoryEntries: [{ name: 'manifest.json', kind: 'file', isSymbolicLink: false }]
    })
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    await expect(fileSystem.readDirectory('packs/../userdata')).rejects.toMatchObject({
      code: 'SOURCE_PATH_UNSAFE'
    })
    await expect(fileSystem.readDirectory('packs/pack/missing')).rejects.toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FOUND'
    })
    await expect(fileSystem.readDirectory('packs/pack/file.json')).rejects.toMatchObject({
      code: 'SOURCE_ENTRY_NOT_DIRECTORY'
    })
    await expect(fileSystem.readDirectory('packs/pack/symlink-dir')).rejects.toMatchObject({
      code: 'SOURCE_PATH_UNSAFE'
    })
    await expect(fileSystem.readDirectory('packs/pack/valid-dir')).resolves.toEqual([
      { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
    ])

    expect(directoryReadAttempts).toEqual(['pack/valid-dir'])
  })

  it('rejects mismatched source metadata names before reads and listings expose data', async() => {
    const readAttempts: string[] = []
    const directoryReadAttempts: string[] = []
    const source = createMetadataGuardSource({
      'pack/manifest.json': { name: 'LENOVO', kind: 'file', isSymbolicLink: false },
      'pack/valid.json': { kind: 'file', isSymbolicLink: false },
      'pack/list': { name: 'private-user-pack', kind: 'directory', isSymbolicLink: false }
    }, {
      readAttempted: path => {
        readAttempts.push(path)
      },
      directoryReadAttempted: path => {
        directoryReadAttempts.push(path)
      }
    })
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    const directJson = await readContentPackageSourceJson(source, 'pack/manifest.json')
    const inspectError = await captureAsyncSourceError(() => fileSystem.getEntry('packs/pack/manifest.json'))
    const readError = await captureAsyncSourceError(() => fileSystem.readTextFile('packs/pack/manifest.json'))
    const listError = await captureAsyncSourceError(() => fileSystem.readDirectory('packs/pack/list'))

    expect(directJson).toMatchObject({
      ok: false,
      code: 'SOURCE_ENTRY_UNSAFE'
    })
    expect(inspectError.code).toBe('SOURCE_ENTRY_UNSAFE')
    expect(readError.code).toBe('SOURCE_ENTRY_UNSAFE')
    expect(listError.code).toBe('SOURCE_ENTRY_UNSAFE')
    for (const result of [directJson, inspectError, readError, listError]) {
      expect(JSON.stringify(result)).not.toContain('LENOVO')
      expect(JSON.stringify(result)).not.toContain('private-user-pack')
    }
    await expect(fileSystem.readTextFile('packs/pack/valid.json')).resolves.toContain('should_not_be_read')

    expect(readAttempts).toEqual(['pack/valid.json'])
    expect(directoryReadAttempts).toEqual([])
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

  it('redacts raw host failures before direct reads or discovery diagnostics expose paths', async() => {
    const rawReadFailureSource: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/raw-host-read-failure',
        rootPath: 'packs'
      },
      async getEntry(path) {
        if (path === '') return { name: 'packs', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack') return { name: 'pack', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack/manifest.json') return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        return null
      },
      async readDirectory(path) {
        if (path === '') return [{ name: 'pack', kind: 'directory', isSymbolicLink: false }]
        throw new Error(`EACCES: scandir C:/Users/LENOVO/mods/${path}`)
      },
      async readTextFile(path) {
        throw new Error(`EACCES: open C:/Users/LENOVO/mods/${path}`)
      },
      async dispose() {}
    }
    const rawInspectFailureSource: ContentPackageSource = {
      ...rawReadFailureSource,
      identity: {
        ...rawReadFailureSource.identity,
        sourceId: 'memory/raw-host-inspect-failure'
      },
      async getEntry(path) {
        throw new Error(`EACCES: lstat C:/Users/LENOVO/mods/${path}`)
      }
    }

    const directJson = await readContentPackageSourceJson(rawReadFailureSource, 'pack/manifest.json')
    const readFailureReport = await discoverThirdPartyDataPacks(
      rawReadFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(rawReadFailureSource)
    )
    const inspectFailureReport = await discoverThirdPartyDataPacks(
      rawInspectFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(rawInspectFailureSource)
    )

    expect(directJson).toMatchObject({
      ok: false,
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: 'Content package source read operation failed'
    })
    expect(readFailureReport.status).toBe('completed')
    expect(readFailureReport.candidates[0]?.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      path: 'pack/manifest.json',
      reason: 'Package source read operation failed'
    })
    expect(readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source read operation failed',
      sourceCode: 'SOURCE_ENTRY_NOT_FOUND'
    })
    expect(inspectFailureReport.status).toBe('directory-not-found')
    expect(inspectFailureReport.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      path: '.',
      reason: 'Package source inspect operation failed'
    })
    expect(inspectFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source inspect operation failed',
      sourceCode: 'SOURCE_ENTRY_NOT_FOUND'
    })
    expect(JSON.stringify(directJson)).not.toContain('C:/Users')
    expect(JSON.stringify(directJson)).not.toContain('LENOVO')
    expect(JSON.stringify(readFailureReport)).not.toContain('C:/Users')
    expect(JSON.stringify(readFailureReport)).not.toContain('LENOVO')
    expect(JSON.stringify(inspectFailureReport)).not.toContain('C:/Users')
    expect(JSON.stringify(inspectFailureReport)).not.toContain('LENOVO')
  })

  it('redacts host path messages even when host failures use source errors', async() => {
    const sourceErrorReadFailureSource: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/source-error-host-path-read-failure',
        rootPath: 'packs'
      },
      async getEntry(path) {
        if (path === '') return { name: 'packs', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack') return { name: 'pack', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack/manifest.json') return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        return null
      },
      async readDirectory(path) {
        if (path === '') return [{ name: 'pack', kind: 'directory', isSymbolicLink: false }]
        throw new ContentPackageSourceError(
          'SOURCE_PERMISSION_REVOKED',
          `EACCES: scandir C:/Users/LENOVO/mods/${path}`,
          path
        )
      },
      async readTextFile(path) {
        throw new ContentPackageSourceError(
          'SOURCE_PERMISSION_REVOKED',
          `EACCES: open C:/Users/LENOVO/mods/${path}`,
          path
        )
      },
      async dispose() {}
    }
    const sourceErrorInspectFailureSource: ContentPackageSource = {
      ...sourceErrorReadFailureSource,
      identity: {
        ...sourceErrorReadFailureSource.identity,
        sourceId: 'memory/source-error-host-path-inspect-failure'
      },
      async getEntry(path) {
        throw new ContentPackageSourceError(
          'SOURCE_PERMISSION_REVOKED',
          `EACCES: lstat C:/Users/LENOVO/mods/${path}`,
          path
        )
      }
    }

    const directJson = await readContentPackageSourceJson(
      sourceErrorReadFailureSource,
      'pack/manifest.json'
    )
    const readFailureReport = await discoverThirdPartyDataPacks(
      sourceErrorReadFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(sourceErrorReadFailureSource)
    )
    const inspectFailureReport = await discoverThirdPartyDataPacks(
      sourceErrorInspectFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(sourceErrorInspectFailureSource)
    )

    expect(directJson).toMatchObject({
      ok: false,
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source read operation failed'
    })
    expect(readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source read operation failed',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    expect(inspectFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source inspect operation failed',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    expect(JSON.stringify(directJson)).not.toContain('C:/Users')
    expect(JSON.stringify(directJson)).not.toContain('LENOVO')
    expect(JSON.stringify(readFailureReport)).not.toContain('C:/Users')
    expect(JSON.stringify(readFailureReport)).not.toContain('LENOVO')
    expect(JSON.stringify(inspectFailureReport)).not.toContain('C:/Users')
    expect(JSON.stringify(inspectFailureReport)).not.toContain('LENOVO')

    const posixSourceErrorReadFailureSource: ContentPackageSource = {
      ...sourceErrorReadFailureSource,
      identity: {
        ...sourceErrorReadFailureSource.identity,
        sourceId: 'memory/source-error-posix-host-path-read-failure'
      },
      async readTextFile(path) {
        throw new ContentPackageSourceError(
          'SOURCE_PERMISSION_REVOKED',
          `EACCES:/Users/LENOVO/mods/${path}`,
          path
        )
      }
    }
    const posixSourceErrorInspectFailureSource: ContentPackageSource = {
      ...sourceErrorReadFailureSource,
      identity: {
        ...sourceErrorReadFailureSource.identity,
        sourceId: 'memory/source-error-posix-host-path-inspect-failure'
      },
      async getEntry(path) {
        throw new ContentPackageSourceError(
          'SOURCE_PERMISSION_REVOKED',
          `EACCES:/Users/LENOVO/mods/${path}`,
          path
        )
      }
    }

    const posixDirectJson = await readContentPackageSourceJson(
      posixSourceErrorReadFailureSource,
      'pack/manifest.json'
    )
    const posixReadFailureReport = await discoverThirdPartyDataPacks(
      posixSourceErrorReadFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(posixSourceErrorReadFailureSource)
    )
    const posixInspectFailureReport = await discoverThirdPartyDataPacks(
      posixSourceErrorInspectFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(posixSourceErrorInspectFailureSource)
    )

    expect(posixDirectJson).toMatchObject({
      ok: false,
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source read operation failed'
    })
    expect(posixReadFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source read operation failed',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    expect(posixInspectFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source inspect operation failed',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    expect(JSON.stringify(posixDirectJson)).not.toContain('/Users')
    expect(JSON.stringify(posixDirectJson)).not.toContain('LENOVO')
    expect(JSON.stringify(posixReadFailureReport)).not.toContain('/Users')
    expect(JSON.stringify(posixReadFailureReport)).not.toContain('LENOVO')
    expect(JSON.stringify(posixInspectFailureReport)).not.toContain('/Users')
    expect(JSON.stringify(posixInspectFailureReport)).not.toContain('LENOVO')
  })

  it('redacts host source paths even when source error messages are stable', async() => {
    const sourcePathFailureSource: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/source-error-host-source-path',
        rootPath: 'packs'
      },
      async getEntry(path) {
        if (path === '') return { name: 'packs', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack') return { name: 'pack', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack/manifest.json') return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        return null
      },
      async readDirectory(path) {
        if (path === '') return [{ name: 'pack', kind: 'directory', isSymbolicLink: false }]
        throw new ContentPackageSourceError(
          'SOURCE_PERMISSION_REVOKED',
          'Permission denied while listing package source',
          `C:/Users/LENOVO/mods/${path}`
        )
      },
      async readTextFile(path) {
        throw new ContentPackageSourceError(
          'SOURCE_PERMISSION_REVOKED',
          'Permission denied while reading package source',
          `C:/Users/LENOVO/mods/${path}`
        )
      },
      async dispose() {}
    }
    const sourcePathInspectFailureSource: ContentPackageSource = {
      ...sourcePathFailureSource,
      identity: {
        ...sourcePathFailureSource.identity,
        sourceId: 'memory/source-error-host-source-path-inspect'
      },
      async getEntry(path) {
        throw new ContentPackageSourceError(
          'SOURCE_PERMISSION_REVOKED',
          'Permission denied while inspecting package source',
          `C:/Users/LENOVO/mods/${path}`
        )
      }
    }
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(sourcePathFailureSource)

    const directJson = await readContentPackageSourceJson(sourcePathFailureSource, 'pack/manifest.json')
    const bridgedReadError = await captureAsyncSourceError(() => fileSystem.readTextFile('packs/pack/manifest.json'))
    const readFailureReport = await discoverThirdPartyDataPacks(
      sourcePathFailureSource.identity.rootPath,
      fileSystem
    )
    const inspectFailureReport = await discoverThirdPartyDataPacks(
      sourcePathInspectFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(sourcePathInspectFailureSource)
    )

    expect(directJson).toMatchObject({
      ok: false,
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source read operation failed'
    })
    expect(bridgedReadError).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source read operation failed',
      sourcePath: 'pack/manifest.json'
    })
    expect(readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source read operation failed',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    expect(inspectFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source inspect operation failed',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    for (const result of [directJson, bridgedReadError, readFailureReport, inspectFailureReport]) {
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
    }
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
