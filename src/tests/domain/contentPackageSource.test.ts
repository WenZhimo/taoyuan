import { cwd } from 'node:process'
import { describe, expect, it, vi } from 'vitest'
import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
  type ContentPackageSource,
  type ContentPackageSourceDirectoryEntry,
  ContentPackageSourceError,
  assertContentPackageSourceTextWithinLimits,
  createDiscoveryFileSystemFromContentPackageSource,
  createMemoryContentPackageSource,
  normalizeContentPackageSourceArchiveEntryPath,
  normalizeContentPackageSourceDirectoryEntry,
  normalizeContentPackageSourceDirectoryEntries,
  normalizeContentPackageSourceEntryName,
  normalizeContentPackageSourcePath,
  readContentPackageSourceIdentity,
  readContentPackageSourceJson,
  toContentPackageSourceHostOperationError,
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

const defineHostileGetter = <T extends object>(target: T, property: string): T => {
  Object.defineProperty(target, property, {
    enumerable: true,
    get() {
      throw new Error(`EACCES: stat C:/Users/LENOVO/mods/${property}`)
    }
  })
  return target
}

const defineInheritedHostileGetter = <T extends object>(
  target: T,
  property: string
): { readonly value: T, readonly wasRead: () => boolean } => {
  let wasRead = false
  const prototype = {}
  Object.defineProperty(prototype, property, {
    enumerable: true,
    get() {
      wasRead = true
      throw new Error(`EACCES: stat C:/Users/LENOVO/mods/${property}`)
    }
  })
  Object.setPrototypeOf(target, prototype)
  return {
    value: target,
    wasRead: () => wasRead
  }
}

const defineHiddenHostileGetter = <T extends object>(
  target: T,
  property: string
): { readonly value: T, readonly wasRead: () => boolean } => {
  let wasRead = false
  Object.defineProperty(target, property, {
    enumerable: false,
    get() {
      wasRead = true
      throw new Error(`EACCES: hidden C:/Users/LENOVO/mods/${property}`)
    }
  })
  return {
    value: target,
    wasRead: () => wasRead
  }
}

const createRevokedProxy = <T extends object>(target: T): T => {
  const { proxy, revoke } = Proxy.revocable(target, {})
  revoke()
  return proxy
}

const createHostileSourceErrorMetadata = (): ContentPackageSourceError => {
  const error = new ContentPackageSourceError(
    'SOURCE_PERMISSION_REVOKED',
    'Permission denied while reading package source',
    'pack/manifest.json'
  )
  for (const fieldName of ['message', 'code', 'sourcePath']) {
    Object.defineProperty(error, fieldName, {
      enumerable: true,
      get() {
        throw new Error(`EACCES: stat C:/Users/LENOVO/mods/${fieldName}\nhostile-fragment`)
      }
    })
  }
  return error
}

const createUnsafeSourceErrorCode = (
  message: string,
  sourcePath: string
): ContentPackageSourceError => {
  const error = new ContentPackageSourceError('SOURCE_PERMISSION_REVOKED', message, sourcePath)
  Object.defineProperty(error, 'code', {
    enumerable: true,
    value: 'C:/Users/LENOVO/mods/hostile-code\nhostile-fragment'
  })
  return error
}

const createHostileMetadataArray = (): unknown[] => {
  const entries: unknown[] = []
  Object.defineProperty(entries, '0', {
    enumerable: true,
    get() {
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-entry')
    }
  })
  return entries
}

const createHostilePresenceMetadataArray = (entry: unknown): unknown[] =>
  new Proxy([entry], {
    has(target, property) {
      if (property === '0') {
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-presence')
      }
      return Reflect.has(target, property)
    }
  })

const createInheritedIndexMetadataArray = (
  _entry: unknown
): {
  readonly entries: unknown[]
  readonly wasRead: () => boolean
} => {
  const entries = Array(1)
  let wasRead = false
  const prototype = Object.create(Array.prototype)
  Object.defineProperty(prototype, '0', {
    enumerable: true,
    get() {
      wasRead = true
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-inherited-index')
    }
  })
  Object.setPrototypeOf(entries, prototype)
  return { entries, wasRead: () => wasRead }
}

const createHiddenIndexMetadataArray = (
  _entry: unknown
): {
  readonly entries: unknown[]
  readonly wasRead: () => boolean
} => {
  const entries = Array(1)
  let wasRead = false
  Object.defineProperty(entries, '0', {
    enumerable: false,
    get() {
      wasRead = true
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-hidden-index')
    }
  })
  return { entries, wasRead: () => wasRead }
}

const createExtraOwnKeyMetadataArray = (
  extraKey: string
): {
  readonly entries: unknown[]
  readonly wasEntryRead: () => boolean
  readonly wasExtraRead: () => boolean
} => {
  const entries = Array(1)
  let entryRead = false
  let extraRead = false
  Object.defineProperty(entries, '0', {
    enumerable: true,
    get() {
      entryRead = true
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-entry')
    }
  })
  Object.defineProperty(entries, extraKey, {
    enumerable: true,
    get() {
      extraRead = true
      throw new Error(`EACCES: stat C:/Users/LENOVO/mods/${extraKey}`)
    }
  })
  return {
    entries,
    wasEntryRead: () => entryRead,
    wasExtraRead: () => extraRead
  }
}

const createSymbolOwnKeyMetadataArray = (): {
  readonly entries: unknown[]
  readonly wasEntryRead: () => boolean
  readonly wasSymbolRead: () => boolean
} => {
  const entries = Array(1)
  let entryRead = false
  let symbolRead = false
  Object.defineProperty(entries, '0', {
    enumerable: true,
    get() {
      entryRead = true
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-entry')
    }
  })
  Object.defineProperty(entries, Symbol('hostPath'), {
    enumerable: true,
    get() {
      symbolRead = true
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-symbol-hostPath')
    }
  })
  return {
    entries,
    wasEntryRead: () => entryRead,
    wasSymbolRead: () => symbolRead
  }
}

const createMalformedLengthMetadataArray = (
  lengthValue: unknown,
  entry: unknown
): {
  readonly entries: unknown[]
  readonly wasOwnKeysRead: () => boolean
  readonly wasEntryRead: () => boolean
} => {
  let ownKeysRead = false
  let entryRead = false
  const entries = new Proxy([entry], {
    get(target, property, receiver) {
      if (property === 'length') return lengthValue
      if (property === '0') {
        entryRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-entry')
      }
      return Reflect.get(target, property, receiver)
    },
    ownKeys() {
      ownKeysRead = true
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-keys')
    }
  })
  return { entries, wasOwnKeysRead: () => ownKeysRead, wasEntryRead: () => entryRead }
}

const createHostileLengthMetadataArray = (
  fragment: string,
  entry: unknown
): {
  readonly entries: unknown[]
  readonly wasOwnKeysRead: () => boolean
  readonly wasEntryRead: () => boolean
} => {
  let ownKeysRead = false
  let entryRead = false
  const entries = new Proxy([entry], {
    get(target, property, receiver) {
      if (property === 'length') {
        throw new Error(`EACCES: stat C:/Users/LENOVO/mods/${fragment}`)
      }
      if (property === '0') {
        entryRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-entry')
      }
      return Reflect.get(target, property, receiver)
    },
    ownKeys() {
      ownKeysRead = true
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-keys')
    }
  })
  return { entries, wasOwnKeysRead: () => ownKeysRead, wasEntryRead: () => entryRead }
}

const createHostileIndexDescriptorMetadataArray = (
  fragment: string,
  entry: unknown
): {
  readonly entries: unknown[]
  readonly wasDescriptorRead: () => boolean
  readonly wasEntryRead: () => boolean
} => {
  let descriptorRead = false
  let entryRead = false
  const entries = new Proxy([entry], {
    get(target, property, receiver) {
      if (property === '0') {
        entryRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-entry')
      }
      return Reflect.get(target, property, receiver)
    },
    getOwnPropertyDescriptor(target, property) {
      if (property === '0') {
        descriptorRead = true
        throw new Error(`EACCES: stat C:/Users/LENOVO/mods/${fragment}`)
      }
      return Reflect.getOwnPropertyDescriptor(target, property)
    }
  })
  return { entries, wasDescriptorRead: () => descriptorRead, wasEntryRead: () => entryRead }
}

const createOutOfRangeIndexMetadataArray = (
  fragment: string,
  _entry: unknown
): {
  readonly entries: unknown[]
  readonly wasOutOfRangeDescriptorRead: () => boolean
  readonly wasOutOfRangeEntryRead: () => boolean
  readonly wasEntryRead: () => boolean
} => {
  let outOfRangeDescriptorRead = false
  let outOfRangeEntryRead = false
  let entryRead = false
  const entries = Array(1)
  Object.defineProperty(entries, '0', {
    configurable: true,
    enumerable: true,
    get() {
      entryRead = true
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/metadata-array-entry')
    }
  })
  const proxiedEntries = new Proxy(entries, {
    ownKeys() {
      return ['1', '0', 'length']
    },
    get(target, property, receiver) {
      if (property === '1') {
        outOfRangeEntryRead = true
        throw new Error(`EACCES: stat C:/Users/LENOVO/mods/${fragment}-entry`)
      }
      return Reflect.get(target, property, receiver)
    },
    getOwnPropertyDescriptor(target, property) {
      if (property === '1') {
        outOfRangeDescriptorRead = true
        throw new Error(`EACCES: stat C:/Users/LENOVO/mods/${fragment}-descriptor`)
      }
      return Reflect.getOwnPropertyDescriptor(target, property)
    }
  })
  return {
    entries: proxiedEntries,
    wasOutOfRangeDescriptorRead: () => outOfRangeDescriptorRead,
    wasOutOfRangeEntryRead: () => outOfRangeEntryRead,
    wasEntryRead: () => entryRead
  }
}

const createHostileDirectoryMetadataOwnKeys = (): unknown =>
  new Proxy({ name: 'pack', kind: 'directory', isSymbolicLink: false }, {
    ownKeys() {
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/directory-metadata-keys')
    }
  })

const createHostileIdentityMetadataOwnKeys = (): unknown =>
  new Proxy({
    contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
    kind: 'memory',
    sourceId: 'memory/hostile-identity-keys',
    rootPath: 'packs'
  }, {
    ownKeys() {
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/identity-metadata-keys')
    }
  })

const createHostileArchiveMetadataOwnKeys = (): unknown =>
  new Proxy({ path: 'pack/manifest.json', uncompressedSizeBytes: 0 }, {
    ownKeys() {
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-metadata-keys')
    }
  })

const createOverLimitMetadataArray = (
  entryFactory: (index: number) => unknown
): {
  readonly entries: unknown[]
  readonly wasFirstEntryRead: () => boolean
  readonly wasBoundaryEntryRead: () => boolean
} => {
  const limit = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxPackageFileCount
  let firstEntryRead = false
  let boundaryEntryRead = false
  const entries = Array(limit + 1)
  Object.defineProperty(entries, '0', {
    enumerable: true,
    get() {
      firstEntryRead = true
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/hostile-first-entry')
    }
  })
  Object.defineProperty(entries, String(limit), {
    enumerable: true,
    get() {
      boundaryEntryRead = true
      void entryFactory(limit)
      throw new Error('EACCES: stat C:/Users/LENOVO/mods/hostile-boundary-entry')
    }
  })
  return {
    entries,
    wasFirstEntryRead: () => firstEntryRead,
    wasBoundaryEntryRead: () => boundaryEntryRead
  }
}

describe('content package source contract', () => {
  it('bridges a normalized in-memory source into the shared third-party discovery pipeline', async() => {
    const source = createValidSource()
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    const manifestJson = await readContentPackageSourceJson(source, 'valid-gift-pack/manifest.json')
    const manifestEntry = await source.getEntry('valid-gift-pack/manifest.json')
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
    expect(manifestEntry).toMatchObject({
      name: 'manifest.json',
      kind: 'file',
      isSymbolicLink: false
    })
    expect(Object.isFrozen(manifestEntry)).toBe(true)
    expect(Reflect.set(manifestEntry as unknown as Record<string, unknown>, 'kind', 'directory')).toBe(false)
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
    for (const controlCharacterPath of [
      'pack/manifest.json\nsecret',
      'pack/manifest.json\u0000secret',
      'pack/manifest.json\u007Fsecret'
    ]) {
      const error = captureSourceError(() => normalizeContentPackageSourcePath(controlCharacterPath))

      expect(error).toMatchObject({
        code: 'SOURCE_PATH_UNSAFE',
        message: 'Content package source path is unsafe'
      })
      expect(JSON.stringify(error)).not.toContain('secret')
    }
    const duplicateFilePathError = captureSourceError(() => createMemoryContentPackageSource({
      sourceId: 'memory/duplicate-source',
      rootPath: 'packs',
      files: [
        { path: 'LENOVO-private-pack/manifest.json', text: '{}\n' },
        { path: 'LENOVO-private-pack\\manifest.json', text: '{}\n' }
      ]
    }))
    const fileOverDirectoryError = captureSourceError(() => createMemoryContentPackageSource({
      sourceId: 'memory/file-over-directory-source',
      rootPath: 'packs',
      files: [
        { path: 'LENOVO-private-pack/manifest.json', text: '{}\n' },
        { path: 'LENOVO-private-pack', text: '{}\n' }
      ]
    }))
    const directoryOverFileError = captureSourceError(() => createMemoryContentPackageSource({
      sourceId: 'memory/directory-over-file-source',
      rootPath: 'packs',
      files: [
        { path: 'LENOVO-private-pack', text: '{}\n' },
        { path: 'LENOVO-private-pack/manifest.json', text: '{}\n' }
      ]
    }))

    expect(duplicateFilePathError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Duplicate source file path'
    })
    expect(fileOverDirectoryError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Source file path conflicts with a directory path'
    })
    expect(directoryOverFileError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Source directory path conflicts with a file path'
    })
    for (const error of [duplicateFilePathError, fileOverDirectoryError, directoryOverFileError]) {
      expect(JSON.stringify(error)).not.toContain('LENOVO-private-pack')
    }
  })

  it('rejects memory source path conflicts before reading file text payloads', () => {
    const textReads: string[] = []
    const createHostileTextFile = (path: string, fragment: string) => {
      const file: Record<string, unknown> = { path }
      Object.defineProperty(file, 'text', {
        enumerable: true,
        get() {
          textReads.push(fragment)
          throw new Error(`EACCES: read C:/Users/LENOVO/mods/${fragment}`)
        }
      })
      return file
    }

    const duplicateFilePathError = captureSourceError(() => createMemoryContentPackageSource({
      sourceId: 'memory/duplicate-source-text-containment',
      rootPath: 'packs',
      files: [
        createHostileTextFile('LENOVO-private-pack/manifest.json', 'duplicate-first-text'),
        createHostileTextFile('LENOVO-private-pack\\manifest.json', 'duplicate-second-text')
      ] as never
    }))
    const fileOverDirectoryError = captureSourceError(() => createMemoryContentPackageSource({
      sourceId: 'memory/file-over-directory-text-containment',
      rootPath: 'packs',
      files: [
        createHostileTextFile('LENOVO-private-pack/manifest.json', 'directory-child-text'),
        createHostileTextFile('LENOVO-private-pack', 'directory-parent-text')
      ] as never
    }))
    const directoryOverFileError = captureSourceError(() => createMemoryContentPackageSource({
      sourceId: 'memory/directory-over-file-text-containment',
      rootPath: 'packs',
      files: [
        createHostileTextFile('LENOVO-private-pack', 'file-parent-text'),
        createHostileTextFile('LENOVO-private-pack/manifest.json', 'file-child-text')
      ] as never
    }))

    expect(duplicateFilePathError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Duplicate source file path'
    })
    expect(fileOverDirectoryError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Source file path conflicts with a directory path'
    })
    expect(directoryOverFileError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Source directory path conflicts with a file path'
    })
    expect(textReads).toEqual([])
    for (const error of [duplicateFilePathError, fileOverDirectoryError, directoryOverFileError]) {
      expect(JSON.stringify(error)).not.toContain('LENOVO-private-pack')
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('duplicate-first-text')
      expect(JSON.stringify(error)).not.toContain('directory-parent-text')
      expect(JSON.stringify(error)).not.toContain('file-child-text')
    }
  })

  it('narrows memory source options metadata before publishing a source', async() => {
    const source = createMemoryContentPackageSource({
      sourceId: 'memory/options-metadata-source',
      rootPath: 'packs',
      files: [
        { path: 'pack/manifest.json', text: '{}\n' }
      ]
    })

    await expect(source.readTextFile('pack/manifest.json')).resolves.toBe('{}\n')

    const nonObjectError = captureSourceError(() => createMemoryContentPackageSource(null as never))
    expect(nonObjectError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Memory source options metadata must be an object'
    })

    const arrayOptionsError = captureSourceError(() => createMemoryContentPackageSource([] as never))
    expect(arrayOptionsError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Memory source options metadata must be an object'
    })

    const hostileOwnKeysOptions = new Proxy({
      sourceId: 'memory/options-hostile-keys',
      rootPath: 'packs',
      files: []
    }, {
      ownKeys() {
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/memory-options-keys')
      }
    })
    const hostileOwnKeysError = captureSourceError(() =>
      createMemoryContentPackageSource(hostileOwnKeysOptions as never)
    )
    expect(hostileOwnKeysError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Memory source options metadata could not be read'
    })
    expect(JSON.stringify(hostileOwnKeysError)).not.toContain('C:/Users')
    expect(JSON.stringify(hostileOwnKeysError)).not.toContain('LENOVO')

    for (const input of [
      {
        sourceId: 'memory/options-extra-field',
        rootPath: 'packs',
        files: [],
        extra: 'C:/Users/LENOVO/mods/private-extra'
      },
      {
        sourceId: 'memory/options-symbol-field',
        rootPath: 'packs',
        files: [],
        [Symbol('hostPath')]: 'C:/Users/LENOVO/mods/private-symbol'
      }
    ]) {
      const error = captureSourceError(() => createMemoryContentPackageSource(input as never))

      expect(error).toMatchObject({
        code: 'SOURCE_IDENTITY_INVALID',
        message: 'Memory source options metadata contains unsupported fields'
      })
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }

    const inheritedSourceId = defineInheritedHostileGetter({
      rootPath: 'packs',
      files: []
    }, 'sourceId')
    const inheritedSourceIdError = captureSourceError(() =>
      createMemoryContentPackageSource(inheritedSourceId.value as never)
    )
    expect(inheritedSourceIdError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Memory source options metadata must include sourceId, rootPath and files own fields'
    })
    expect(inheritedSourceId.wasRead()).toBe(false)

    const hiddenFiles = defineHiddenHostileGetter({
      sourceId: 'memory/options-hidden-files',
      rootPath: 'packs'
    }, 'files')
    const hiddenFilesError = captureSourceError(() =>
      createMemoryContentPackageSource(hiddenFiles.value as never)
    )
    expect(hiddenFilesError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Memory source options metadata contains unsupported fields'
    })
    expect(hiddenFiles.wasRead()).toBe(false)

    const hostileSourceIdError = captureSourceError(() => createMemoryContentPackageSource(
      defineHostileGetter({
        rootPath: 'packs',
        files: []
      }, 'sourceId') as never
    ))
    expect(hostileSourceIdError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Memory source options metadata could not be read'
    })
    expect(JSON.stringify(hostileSourceIdError)).not.toContain('C:/Users')
    expect(JSON.stringify(hostileSourceIdError)).not.toContain('LENOVO')

    let filesGetterRead = false
    const hostileFilesOptions = {
      sourceId: 'memory/options-hostile-files',
      rootPath: 'packs'
    }
    Object.defineProperty(hostileFilesOptions, 'files', {
      enumerable: true,
      get() {
        filesGetterRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/memory-options-files')
      }
    })
    const hostileFilesError = captureSourceError(() =>
      createMemoryContentPackageSource(hostileFilesOptions as never)
    )
    expect(hostileFilesError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Memory source options metadata could not be read'
    })
    expect(filesGetterRead).toBe(true)
    expect(JSON.stringify(hostileFilesError)).not.toContain('C:/Users')
    expect(JSON.stringify(hostileFilesError)).not.toContain('LENOVO')

    let sourceIdCoerced = false
    let filesReadAfterInvalidSourceId = false
    const invalidSourceIdOptions = {
      sourceId: {
        toString() {
          sourceIdCoerced = true
          throw new Error('C:/Users/LENOVO/mods/memory-options-source-id')
        },
        [Symbol.toPrimitive]() {
          sourceIdCoerced = true
          throw new Error('C:/Users/LENOVO/mods/memory-options-source-id')
        }
      },
      rootPath: 'packs'
    }
    Object.defineProperty(invalidSourceIdOptions, 'files', {
      enumerable: true,
      get() {
        filesReadAfterInvalidSourceId = true
        throw new Error('files must not be read after invalid sourceId')
      }
    })
    const invalidSourceIdError = captureSourceError(() =>
      createMemoryContentPackageSource(invalidSourceIdOptions as never)
    )
    expect(invalidSourceIdError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'sourceId must be a normalized relative identifier'
    })
    expect(sourceIdCoerced).toBe(false)
    expect(filesReadAfterInvalidSourceId).toBe(false)

    let rootPathCoerced = false
    let filesReadAfterInvalidRootPath = false
    const invalidRootPathOptions = {
      sourceId: 'memory/options-invalid-root',
      rootPath: {
        toString() {
          rootPathCoerced = true
          throw new Error('C:/Users/LENOVO/mods/memory-options-root-path')
        },
        [Symbol.toPrimitive]() {
          rootPathCoerced = true
          throw new Error('C:/Users/LENOVO/mods/memory-options-root-path')
        }
      }
    }
    Object.defineProperty(invalidRootPathOptions, 'files', {
      enumerable: true,
      get() {
        filesReadAfterInvalidRootPath = true
        throw new Error('files must not be read after invalid rootPath')
      }
    })
    const invalidRootPathError = captureSourceError(() =>
      createMemoryContentPackageSource(invalidRootPathOptions as never)
    )
    expect(invalidRootPathError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'rootPath must be a normalized relative identifier'
    })
    expect(rootPathCoerced).toBe(false)
    expect(filesReadAfterInvalidRootPath).toBe(false)
  })

  it('requires memory source options metadata fields to be own and enumerable before getters can run', () => {
    const optionsBase: Record<string, unknown> = {
      sourceId: 'memory/options-own-field-containment',
      rootPath: 'packs',
      files: []
    }

    for (const fieldName of ['sourceId', 'rootPath', 'files']) {
      const options = { ...optionsBase }
      delete options[fieldName]
      const inherited = defineInheritedHostileGetter(options, fieldName)

      const error = captureSourceError(() =>
        createMemoryContentPackageSource(inherited.value as never)
      )

      expect(error).toMatchObject({
        code: 'SOURCE_IDENTITY_INVALID',
        message: 'Memory source options metadata must include sourceId, rootPath and files own fields'
      })
      expect(inherited.wasRead()).toBe(false)
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }

    for (const fieldName of ['sourceId', 'rootPath', 'files']) {
      const options = { ...optionsBase }
      delete options[fieldName]
      const hidden = defineHiddenHostileGetter(options, fieldName)

      const error = captureSourceError(() =>
        createMemoryContentPackageSource(hidden.value as never)
      )

      expect(error).toMatchObject({
        code: 'SOURCE_IDENTITY_INVALID',
        message: 'Memory source options metadata contains unsupported fields'
      })
      expect(hidden.wasRead()).toBe(false)
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }
  })

  it('narrows memory source file metadata from unknown before publishing a source', async() => {
    const source = createMemoryContentPackageSource({
      sourceId: 'memory/file-metadata-source',
      rootPath: 'packs',
      files: [
        { path: 'pack\\manifest.json', text: '{}\n' }
      ]
    })

    await expect(source.readTextFile('pack/manifest.json')).resolves.toBe('{}\n')

    let nonArrayLengthRead = false
    const nonArrayFiles = {}
    Object.defineProperty(nonArrayFiles, 'length', {
      enumerable: true,
      get() {
        nonArrayLengthRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/memory-files-length')
      }
    })
    const nonArrayError = captureSourceError(() => createMemoryContentPackageSource({
      sourceId: 'memory/non-array-files',
      rootPath: 'packs',
      files: nonArrayFiles as never
    }))

    expect(nonArrayError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Memory source files metadata must be an array'
    })
    expect(nonArrayLengthRead).toBe(false)
    expect(JSON.stringify(nonArrayError)).not.toContain('C:/Users')
    expect(JSON.stringify(nonArrayError)).not.toContain('LENOVO')

    const malformedFiles = createMalformedLengthMetadataArray(
      'C:/Users/LENOVO/mods/memory-files-length',
      { path: 'pack/manifest.json', text: '{}\n' }
    )
    const malformedArrayError = captureSourceError(() => createMemoryContentPackageSource({
      sourceId: 'memory/malformed-file-array',
      rootPath: 'packs',
      files: malformedFiles.entries as never
    }))

    expect(malformedArrayError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Memory source files metadata must be a dense JSON array'
    })
    expect(malformedFiles.wasOwnKeysRead()).toBe(false)
    expect(malformedFiles.wasEntryRead()).toBe(false)

    const overLimitFiles = createOverLimitMetadataArray(index => ({
      path: 'data/' + index + '.json',
      text: ''
    }))
    const overLimitError = captureSourceError(() => createMemoryContentPackageSource({
      sourceId: 'memory/over-limit-files',
      rootPath: 'packs',
      files: overLimitFiles.entries as never
    }))

    expect(overLimitError).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: 'Memory source exceeds '
        + CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxPackageFileCount
        + ' files: '
        + (CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxPackageFileCount + 1)
    })
    expect(overLimitFiles.wasBoundaryEntryRead()).toBe(false)
    expect(JSON.stringify(overLimitError)).not.toContain('hostile-fragment')

    let pathCoerced = false
    let textCoerced = false
    const hostileFileInputs: readonly unknown[] = [
      null,
      Array(1),
      createHostileMetadataArray(),
      new Proxy({ path: 'pack/manifest.json', text: '{}\n' }, {
        ownKeys() {
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/memory-file-keys')
        }
      }),
      { path: 'pack/manifest.json', text: '{}\n', extra: 'C:/Users/LENOVO/mods/private-extra' },
      { path: 1, text: '{}\n' },
      {
        path: {
          toString() {
            pathCoerced = true
            throw new Error('C:/Users/LENOVO/mods/memory-file-path')
          }
        },
        text: '{}\n'
      },
      { path: 'C:/Users/LENOVO/mods/pack/manifest.json', text: '{}\n' },
      {
        path: 'pack/manifest.json',
        text: {
          toString() {
            textCoerced = true
            throw new Error('C:/Users/LENOVO/mods/memory-file-text')
          }
        }
      }
    ]

    for (const input of hostileFileInputs) {
      const error = captureSourceError(() => createMemoryContentPackageSource({
        sourceId: 'memory/hostile-file-metadata',
        rootPath: 'packs',
        files: [input as never]
      }))

      expect(error.code).toMatch(/^SOURCE_/)
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('memory-file')
    }
    expect(pathCoerced).toBe(false)
    expect(textCoerced).toBe(false)
  })

  it('rejects over-limit memory source files before reading file metadata', () => {
    const limit = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxPackageFileCount
    let firstFileRead = false
    let boundaryFileRead = false
    let pathRead = false
    let textRead = false
    const hostileFile = {
      get path() {
        pathRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/memory-file-count-path')
      },
      get text() {
        textRead = true
        throw new Error('EACCES: read C:/Users/LENOVO/mods/memory-file-count-text')
      }
    }
    const files = Array(limit + 1)
    Object.defineProperty(files, '0', {
      enumerable: true,
      get() {
        firstFileRead = true
        return hostileFile
      }
    })
    Object.defineProperty(files, String(limit), {
      enumerable: true,
      get() {
        boundaryFileRead = true
        return hostileFile
      }
    })

    const error = captureSourceError(() => createMemoryContentPackageSource({
      sourceId: 'memory/over-limit-files-metadata-containment',
      rootPath: 'packs',
      files: files as never
    }))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Memory source exceeds ${limit} files: ${limit + 1}`
    })
    expect(firstFileRead).toBe(false)
    expect(boundaryFileRead).toBe(false)
    expect(pathRead).toBe(false)
    expect(textRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('memory-file-count')
  })

  it('requires memory source file metadata fields to be own and enumerable before getters can run', () => {
    const fileBase: Record<string, unknown> = {
      path: 'pack/manifest.json',
      text: '{}\n'
    }

    for (const fieldName of ['path', 'text']) {
      const file = { ...fileBase }
      delete file[fieldName]
      const inherited = defineInheritedHostileGetter(file, fieldName)

      const error = captureSourceError(() => createMemoryContentPackageSource({
        sourceId: 'memory/inherited-file-metadata',
        rootPath: 'packs',
        files: [inherited.value as never]
      }))

      expect(error).toMatchObject({
        code: 'SOURCE_ENTRY_UNSAFE',
        message: 'Memory source file metadata must include path and text own fields'
      })
      expect(inherited.wasRead()).toBe(false)
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }

    for (const fieldName of ['path', 'text']) {
      const file = { ...fileBase }
      delete file[fieldName]
      const hidden = defineHiddenHostileGetter(file, fieldName)

      const error = captureSourceError(() => createMemoryContentPackageSource({
        sourceId: 'memory/hidden-file-metadata',
        rootPath: 'packs',
        files: [hidden.value as never]
      }))

      expect(error).toMatchObject({
        code: 'SOURCE_ENTRY_UNSAFE',
        message: 'Memory source file metadata contains unsupported fields'
      })
      expect(hidden.wasRead()).toBe(false)
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }
  })

  it('rejects unsupported symbol memory source metadata before own getters can run', () => {
    const optionReads: string[] = []
    let optionSymbolRead = false
    const optionMetadata: Record<PropertyKey, unknown> = {}
    for (const fieldName of ['sourceId', 'rootPath', 'files']) {
      Object.defineProperty(optionMetadata, fieldName, {
        enumerable: true,
        get() {
          optionReads.push(fieldName)
          throw new Error(`EACCES: stat C:/Users/LENOVO/mods/memory-options-${fieldName}`)
        }
      })
    }
    Object.defineProperty(optionMetadata, Symbol('hostPath'), {
      enumerable: true,
      get() {
        optionSymbolRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/memory-options-symbol')
      }
    })

    const optionError = captureSourceError(() =>
      createMemoryContentPackageSource(optionMetadata as never)
    )

    expect(optionError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Memory source options metadata contains unsupported fields'
    })
    expect(optionReads).toEqual([])
    expect(optionSymbolRead).toBe(false)
    expect(JSON.stringify(optionError)).not.toContain('C:/Users')
    expect(JSON.stringify(optionError)).not.toContain('LENOVO')
    expect(JSON.stringify(optionError)).not.toContain('memory-options')

    const fileReads: string[] = []
    let fileSymbolRead = false
    const fileMetadata: Record<PropertyKey, unknown> = {}
    for (const fieldName of ['path', 'text']) {
      Object.defineProperty(fileMetadata, fieldName, {
        enumerable: true,
        get() {
          fileReads.push(fieldName)
          throw new Error(`EACCES: stat C:/Users/LENOVO/mods/memory-file-${fieldName}`)
        }
      })
    }
    Object.defineProperty(fileMetadata, Symbol('hostPath'), {
      enumerable: true,
      get() {
        fileSymbolRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/memory-file-symbol')
      }
    })

    const fileError = captureSourceError(() => createMemoryContentPackageSource({
      sourceId: 'memory/symbol-file-metadata',
      rootPath: 'packs',
      files: [fileMetadata as never]
    }))

    expect(fileError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Memory source file metadata contains unsupported fields'
    })
    expect(fileReads).toEqual([])
    expect(fileSymbolRead).toBe(false)
    expect(JSON.stringify(fileError)).not.toContain('C:/Users')
    expect(JSON.stringify(fileError)).not.toContain('LENOVO')
    expect(JSON.stringify(fileError)).not.toContain('memory-file')
  })

  it('redacts unsafe platform paths before direct reads or discovery diagnostics expose them', async() => {
    const source = createValidSource()

    const directJson = await readContentPackageSourceJson(source, 'C:/Users/LENOVO/mods/manifest.json')
    const discoveryReport = await discoverThirdPartyDataPacks(
      'C:/Users/LENOVO/mods',
      createDiscoveryFileSystemFromContentPackageSource(source)
    )
    const controlCharacterDiscoveryReport = await discoverThirdPartyDataPacks(
      'packs\nsecret',
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
    expect(controlCharacterDiscoveryReport.status).toBe('directory-not-found')
    expect(controlCharacterDiscoveryReport.issues[0]).toMatchObject({
      kind: 'path-unsafe',
      path: '.',
      reason: 'Package source inspect operation failed'
    })
    expect(controlCharacterDiscoveryReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package discovery path is unsafe',
      sourceCode: 'SOURCE_PATH_UNSAFE'
    })
    expect(JSON.stringify(directJson)).not.toContain('C:/Users')
    expect(JSON.stringify(directJson)).not.toContain('LENOVO')
    expect(JSON.stringify(discoveryReport)).not.toContain('C:/Users')
    expect(JSON.stringify(discoveryReport)).not.toContain('LENOVO')
    expect(JSON.stringify(controlCharacterDiscoveryReport)).not.toContain('secret')
  })

  it('rejects non-string source paths before coercion or host operations', async() => {
    let coerced = false
    let inspected = false
    const hostilePath = {
      toString() {
        coerced = true
        throw new Error('C:/Users/LENOVO/mods/hostile-fragment')
      },
      [Symbol.toPrimitive]() {
        coerced = true
        throw new Error('C:/Users/LENOVO/mods/hostile-fragment')
      }
    }
    const directError = captureSourceError(() => normalizeContentPackageSourcePath(hostilePath))
    const source: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/non-string-path-source',
        rootPath: 'packs'
      },
      async getEntry() {
        inspected = true
        throw new Error('non-string paths must be rejected before host inspection')
      },
      async readDirectory() {
        throw new Error('non-string paths must be rejected before directory reads')
      },
      async readTextFile() {
        throw new Error('non-string paths must be rejected before file reads')
      },
      async dispose() {}
    }
    const bridgeError = await captureAsyncSourceError(() =>
      createDiscoveryFileSystemFromContentPackageSource(source).getEntry(hostilePath as unknown as string)
    )

    expect(directError).toMatchObject({
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Content package source path is unsafe'
    })
    expect(bridgeError).toMatchObject({
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Content package discovery path is unsafe'
    })
    expect(coerced).toBe(false)
    expect(inspected).toBe(false)
    expect(JSON.stringify(directError)).not.toContain('C:/Users')
    expect(JSON.stringify(bridgeError)).not.toContain('LENOVO')
    expect(JSON.stringify(bridgeError)).not.toContain('hostile-fragment')
  })

  it('validates directory entry names, duplicate listings and non-file metadata before discovery', async() => {
    expect(normalizeContentPackageSourceEntryName('manifest.json')).toBe('manifest.json')
    let entryNameCoerced = false
    const hostileEntryName = {
      toString() {
        entryNameCoerced = true
        throw new Error('C:/Users/LENOVO/mods/hostile-entry-name')
      },
      [Symbol.toPrimitive]() {
        entryNameCoerced = true
        throw new Error('C:/Users/LENOVO/mods/hostile-entry-name')
      }
    }
    const nonStringEntryNameError = captureSourceError(() =>
      normalizeContentPackageSourceEntryName(hostileEntryName)
    )

    expect(nonStringEntryNameError).toMatchObject({
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Content package source path is unsafe'
    })
    expect(entryNameCoerced).toBe(false)
    expect(JSON.stringify(nonStringEntryNameError)).not.toContain('hostile-entry-name')
    expect(JSON.stringify(nonStringEntryNameError)).not.toContain('C:/Users')
    expect(JSON.stringify(nonStringEntryNameError)).not.toContain('LENOVO')
    const singleEntry = normalizeContentPackageSourceDirectoryEntry({
      name: 'manifest.json',
      kind: 'file',
      isSymbolicLink: false
    })
    expect(Object.isFrozen(singleEntry)).toBe(true)
    expect(Reflect.set(singleEntry as unknown as Record<string, unknown>, 'name', 'mutated.json')).toBe(false)
    expect(normalizeContentPackageSourceDirectoryEntries([
      { name: 'z-pack', kind: 'directory', isSymbolicLink: false },
      { name: 'pipe-pack', kind: 'other', isSymbolicLink: false },
      { name: 'a-pack', kind: 'file', isSymbolicLink: false }
    ])).toEqual([
      { name: 'a-pack', kind: 'file', isSymbolicLink: false },
      { name: 'pipe-pack', kind: 'other', isSymbolicLink: false },
      { name: 'z-pack', kind: 'directory', isSymbolicLink: false }
    ])

    for (const unsafeName of [
      '',
      '.',
      '..',
      '../manifest.json',
      '/manifest.json',
      'C:/pack',
      'pack/name',
      'pack\\name',
      'pack\nname'
    ]) {
      expect(() => normalizeContentPackageSourceEntryName(unsafeName)).toThrow(ContentPackageSourceError)
    }
    const duplicateEntryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      { name: 'LENOVO-private-pack', kind: 'directory', isSymbolicLink: false },
      { name: 'LENOVO-private-pack', kind: 'file', isSymbolicLink: false }
    ]))
    expect(duplicateEntryError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Duplicate source directory entry'
    })
    expect(JSON.stringify(duplicateEntryError)).not.toContain('LENOVO-private-pack')
    expect(captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      { name: 'pipe', kind: 'socket', isSymbolicLink: false } as never
    ])).code).toBe('SOURCE_ENTRY_UNSAFE')

    let symbolicLinkReadAfterUnsupportedKind = false
    const unsupportedKindWithHostileSymbolicLink = { name: 'pipe', kind: 'socket' }
    Object.defineProperty(unsupportedKindWithHostileSymbolicLink, 'isSymbolicLink', {
      enumerable: true,
      get() {
        symbolicLinkReadAfterUnsupportedKind = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/unsupported-kind-symlink')
      }
    })
    const unsupportedKindError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      unsupportedKindWithHostileSymbolicLink as never
    ]))
    expect(unsupportedKindError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Unsupported content package source entry kind'
    })
    expect(symbolicLinkReadAfterUnsupportedKind).toBe(false)
    expect(JSON.stringify(unsupportedKindError)).not.toContain('C:/Users')
    expect(JSON.stringify(unsupportedKindError)).not.toContain('LENOVO')
    expect(JSON.stringify(unsupportedKindError)).not.toContain('unsupported-kind-symlink')

    let kindReadAfterUnsafeName = false
    const unsafeNameWithHostileKind = {
      name: 'private-pack\\nested',
      isSymbolicLink: false
    }
    Object.defineProperty(unsafeNameWithHostileKind, 'kind', {
      enumerable: true,
      get() {
        kindReadAfterUnsafeName = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/unsafe-name-kind')
      }
    })
    const unsafeNameError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      unsafeNameWithHostileKind as never
    ]))
    expect(unsafeNameError).toMatchObject({
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Content package source entry names must be single normalized path segments'
    })
    expect(kindReadAfterUnsafeName).toBe(false)
    expect(JSON.stringify(unsafeNameError)).not.toContain('C:/Users')
    expect(JSON.stringify(unsafeNameError)).not.toContain('LENOVO')
    expect(JSON.stringify(unsafeNameError)).not.toContain('unsafe-name-kind')
    expect(JSON.stringify(unsafeNameError)).not.toContain('private-pack')
    expect(JSON.stringify(unsafeNameError)).not.toContain('nested')

    for (const unsafeNameMetadataEntry of [
      { name: 'private-pack\\nested', kind: 'socket', isSymbolicLink: false } as never,
      { name: '../private-pack', kind: 'directory' } as never
    ]) {
      const error = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([unsafeNameMetadataEntry]))

      expect(error.code).toMatch(/^SOURCE_/)
      expect(JSON.stringify(error)).not.toContain('private-pack')
      expect(JSON.stringify(error)).not.toContain('nested')
    }

    const unsafeKindMetadataError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      { name: 'pack', kind: 'C:/Users/LENOVO/mods/socket', isSymbolicLink: false } as never
    ]))
    expect(unsafeKindMetadataError.code).toBe('SOURCE_ENTRY_UNSAFE')
    expect(JSON.stringify(unsafeKindMetadataError)).not.toContain('C:/Users')
    expect(JSON.stringify(unsafeKindMetadataError)).not.toContain('LENOVO')

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

    let duplicateListingReadAttempted = false
    const duplicateListingSource: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/duplicate-entry-source',
        rootPath: 'packs'
      },
      async getEntry(path) {
        return path === ''
          ? { name: 'packs', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return [
          { name: 'LENOVO-private-pack', kind: 'directory', isSymbolicLink: false },
          { name: 'LENOVO-private-pack', kind: 'file', isSymbolicLink: false }
        ]
      },
      async readTextFile() {
        duplicateListingReadAttempted = true
        throw new Error('duplicate entries must not be read')
      },
      async dispose() {}
    }

    const duplicateListingReport = await discoverThirdPartyDataPacks(
      'packs',
      createDiscoveryFileSystemFromContentPackageSource(duplicateListingSource)
    )

    expect(duplicateListingReadAttempted).toBe(false)
    expect(duplicateListingReport.status).toBe('directory-not-found')
    expect(duplicateListingReport.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(duplicateListingReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Duplicate source directory entry',
      sourceCode: 'SOURCE_DUPLICATE_PATH'
    })
    expect(JSON.stringify(duplicateListingReport)).not.toContain('LENOVO-private-pack')
  })

  it('rejects duplicate directory entry names before reading kind or symlink metadata', () => {
    let kindReadCount = 0
    let symlinkReadCount = 0
    const createDuplicateEntry = () => {
      const entry: Record<string, unknown> = {}
      Object.defineProperty(entry, 'name', {
        enumerable: true,
        value: 'LENOVO-private-pack'
      })
      Object.defineProperty(entry, 'kind', {
        enumerable: true,
        get() {
          kindReadCount += 1
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/directory-duplicate-kind')
        }
      })
      Object.defineProperty(entry, 'isSymbolicLink', {
        enumerable: true,
        get() {
          symlinkReadCount += 1
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/directory-duplicate-symlink')
        }
      })
      return entry
    }

    const error = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      createDuplicateEntry(),
      createDuplicateEntry()
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Duplicate source directory entry'
    })
    expect(kindReadCount).toBe(0)
    expect(symlinkReadCount).toBe(0)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('directory-duplicate')
    expect(JSON.stringify(error)).not.toContain('private-pack')
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
      Array(1),
      createHostileMetadataArray(),
      [createHostileDirectoryMetadataOwnKeys()],
      [null],
      ['C:/Users/LENOVO/mods/pack'],
      [{ name: 1, kind: 'directory', isSymbolicLink: false }],
      [{ name: 'pack', kind: 'directory', isSymbolicLink: false, extra: 'C:/Users/LENOVO/extra' }],
      [{ name: 'pack', kind: 'directory', isSymbolicLink: false, [Symbol('host')]: 'C:/Users/LENOVO/symbol' }],
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
      kind: 'path-unsafe',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_PATH_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
  })

  it('rejects unsupported symbol directory entry metadata before own getters can run', () => {
    let nameRead = false
    let kindRead = false
    let symbolicLinkRead = false
    let symbolRead = false
    const symbolMetadataKey = Symbol('hostPath')
    const directoryEntry = {}
    Object.defineProperty(directoryEntry, 'name', {
      enumerable: true,
      get() {
        nameRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/directory-symbol-name')
      }
    })
    Object.defineProperty(directoryEntry, 'kind', {
      enumerable: true,
      get() {
        kindRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/directory-symbol-kind')
      }
    })
    Object.defineProperty(directoryEntry, 'isSymbolicLink', {
      enumerable: true,
      get() {
        symbolicLinkRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/directory-symbol-symlink')
      }
    })
    Object.defineProperty(directoryEntry, symbolMetadataKey, {
      enumerable: true,
      get() {
        symbolRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/directory-symbol-hostPath\nhostile-fragment')
      }
    })

    const error = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      directoryEntry
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source entry metadata contains unsupported fields'
    })
    expect(nameRead).toBe(false)
    expect(kindRead).toBe(false)
    expect(symbolicLinkRead).toBe(false)
    expect(symbolRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('directory-symbol')
    expect(JSON.stringify(error)).not.toContain('hostile-fragment')
  })

  it('rejects over-limit directory metadata arrays before reading first or boundary entries', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    const { entries, wasFirstEntryRead, wasBoundaryEntryRead } = createOverLimitMetadataArray(index => ({
      name: `pack-${index}`,
      kind: 'directory',
      isSymbolicLink: false
    }))

    const error = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries(entries))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Directory listing exceeds ${limits.maxPackageFileCount} entries: ${limits.maxPackageFileCount + 1}`
    })
    expect(wasFirstEntryRead()).toBe(false)
    expect(wasBoundaryEntryRead()).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('hostile-first-entry')
    expect(JSON.stringify(error)).not.toContain('hostile-boundary-entry')
    expect(JSON.stringify(error)).not.toContain('hostile-fragment')
  })

  it('rejects malformed metadata array lengths before reading keys or entries', () => {
    const directoryArray = createMalformedLengthMetadataArray(
      Number.POSITIVE_INFINITY,
      { name: 'pack', kind: 'directory', isSymbolicLink: false }
    )
    const archiveArray = createMalformedLengthMetadataArray(
      'C:/Users/LENOVO/mods/archive-length',
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0 }
    )

    const directoryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries(
      directoryArray.entries
    ))
    const archiveError = captureSourceError(() => validateContentPackageSourceArchiveEntries(
      archiveArray.entries
    ))

    expect(directoryError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source directory entries metadata must be a dense JSON array'
    })
    expect(archiveError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entries metadata must be a dense JSON array'
    })
    expect(directoryArray.wasOwnKeysRead()).toBe(false)
    expect(directoryArray.wasEntryRead()).toBe(false)
    expect(archiveArray.wasOwnKeysRead()).toBe(false)
    expect(archiveArray.wasEntryRead()).toBe(false)
    for (const error of [directoryError, archiveError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('metadata-array')
    }
  })

  it('redacts unreadable metadata array lengths before reading keys or entries', () => {
    const directoryArray = createHostileLengthMetadataArray(
      'directory-length',
      { name: 'pack', kind: 'directory', isSymbolicLink: false }
    )
    const archiveArray = createHostileLengthMetadataArray(
      'archive-length',
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0 }
    )

    const directoryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries(
      directoryArray.entries
    ))
    const archiveError = captureSourceError(() => validateContentPackageSourceArchiveEntries(
      archiveArray.entries
    ))

    expect(directoryError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source directory entries metadata could not be read'
    })
    expect(archiveError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entries metadata could not be read'
    })
    expect(directoryArray.wasOwnKeysRead()).toBe(false)
    expect(directoryArray.wasEntryRead()).toBe(false)
    expect(archiveArray.wasOwnKeysRead()).toBe(false)
    expect(archiveArray.wasEntryRead()).toBe(false)
    for (const error of [directoryError, archiveError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('directory-length')
      expect(JSON.stringify(error)).not.toContain('archive-length')
      expect(JSON.stringify(error)).not.toContain('metadata-array')
    }
  })

  it('redacts unreadable metadata array index descriptors before reading entries', () => {
    const directoryArray = createHostileIndexDescriptorMetadataArray(
      'directory-index-descriptor',
      { name: 'pack', kind: 'directory', isSymbolicLink: false }
    )
    const archiveArray = createHostileIndexDescriptorMetadataArray(
      'archive-index-descriptor',
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0 }
    )

    const directoryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries(
      directoryArray.entries
    ))
    const archiveError = captureSourceError(() => validateContentPackageSourceArchiveEntries(
      archiveArray.entries
    ))

    expect(directoryError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source directory entries metadata could not be read'
    })
    expect(archiveError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entries metadata could not be read'
    })
    expect(directoryArray.wasDescriptorRead()).toBe(true)
    expect(directoryArray.wasEntryRead()).toBe(false)
    expect(archiveArray.wasDescriptorRead()).toBe(true)
    expect(archiveArray.wasEntryRead()).toBe(false)
    for (const error of [directoryError, archiveError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('index-descriptor')
      expect(JSON.stringify(error)).not.toContain('metadata-array-entry')
    }
  })

  it('rejects metadata arrays with out-of-range indexes before reading descriptors or entries', () => {
    const directoryArray = createOutOfRangeIndexMetadataArray(
      'directory-out-of-range-index',
      { name: 'pack', kind: 'directory', isSymbolicLink: false }
    )
    const archiveArray = createOutOfRangeIndexMetadataArray(
      'archive-out-of-range-index',
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0 }
    )

    const directoryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries(
      directoryArray.entries
    ))
    const archiveError = captureSourceError(() => validateContentPackageSourceArchiveEntries(
      archiveArray.entries
    ))

    expect(directoryError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source directory entries metadata must be a dense JSON array'
    })
    expect(archiveError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entries metadata must be a dense JSON array'
    })
    for (const metadataArray of [directoryArray, archiveArray]) {
      expect(metadataArray.wasOutOfRangeDescriptorRead()).toBe(false)
      expect(metadataArray.wasOutOfRangeEntryRead()).toBe(false)
      expect(metadataArray.wasEntryRead()).toBe(false)
    }
    for (const error of [directoryError, archiveError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('out-of-range-index')
      expect(JSON.stringify(error)).not.toContain('metadata-array-entry')
    }
  })

  it('rejects sparse archive entry arrays before reading later entry metadata', () => {
    let laterPathRead = false
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const archiveEntries = Array(2)
    archiveEntries[1] = {
      get path() {
        laterPathRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sparse-path')
      },
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sparse-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sparse-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries(archiveEntries))

    expect(error).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entries metadata must be a dense JSON array'
    })
    expect(laterPathRead).toBe(false)
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-sparse')
  })

  it('wraps revoked proxy metadata before raw platform errors can escape', () => {
    const revokedIdentityError = captureSourceError(() => validateContentPackageSourceIdentity(
      createRevokedProxy({
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/revoked-identity',
        rootPath: 'packs'
      })
    ))
    const revokedDirectoryArrayError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries(
      createRevokedProxy([{ name: 'pack', kind: 'directory', isSymbolicLink: false }])
    ))
    const revokedDirectoryEntryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      createRevokedProxy({ name: 'pack', kind: 'directory', isSymbolicLink: false })
    ]))
    const revokedArchiveArrayError = captureSourceError(() => validateContentPackageSourceArchiveEntries(
      createRevokedProxy([{ path: 'pack/manifest.json', uncompressedSizeBytes: 0 }])
    ))
    const revokedArchiveEntryError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      createRevokedProxy({ path: 'pack/manifest.json', uncompressedSizeBytes: 0 })
    ]))

    expect(revokedIdentityError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Content package source identity metadata could not be read'
    })
    expect(revokedDirectoryArrayError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source directory entries metadata could not be read'
    })
    expect(revokedDirectoryEntryError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source entry metadata could not be read'
    })
    expect(revokedArchiveArrayError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entries metadata could not be read'
    })
    expect(revokedArchiveEntryError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entry metadata could not be read'
    })
    for (const error of [
      revokedIdentityError,
      revokedDirectoryArrayError,
      revokedDirectoryEntryError,
      revokedArchiveArrayError,
      revokedArchiveEntryError
    ]) {
      expect(JSON.stringify(error)).not.toContain('Cannot perform')
      expect(JSON.stringify(error)).not.toContain('IsArray')
      expect(JSON.stringify(error)).not.toContain('revoked')
    }
  })

  it('redacts unreadable entry metadata keys before reading supported fields', () => {
    const directoryReads = {
      name: false,
      kind: false,
      isSymbolicLink: false
    }
    const directoryEntry = new Proxy({}, {
      ownKeys() {
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/directory-entry-keys')
      },
      get(_target, property) {
        if (property === 'name') {
          directoryReads.name = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/directory-entry-name')
        }
        if (property === 'kind') {
          directoryReads.kind = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/directory-entry-kind')
        }
        if (property === 'isSymbolicLink') {
          directoryReads.isSymbolicLink = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/directory-entry-symlink')
        }
        return undefined
      }
    })
    const archiveReads = {
      path: false,
      uncompressedSizeBytes: false,
      compressedSizeBytes: false
    }
    const archiveEntry = new Proxy({}, {
      ownKeys() {
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-entry-keys')
      },
      get(_target, property) {
        if (property === 'path') {
          archiveReads.path = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-entry-path')
        }
        if (property === 'uncompressedSizeBytes') {
          archiveReads.uncompressedSizeBytes = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-entry-size')
        }
        if (property === 'compressedSizeBytes') {
          archiveReads.compressedSizeBytes = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-entry-compressed-size')
        }
        return undefined
      }
    })

    const directoryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      directoryEntry
    ]))
    const archiveError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      archiveEntry
    ]))

    expect(directoryError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source entry metadata could not be read'
    })
    expect(archiveError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entry metadata could not be read'
    })
    expect(directoryReads).toEqual({
      name: false,
      kind: false,
      isSymbolicLink: false
    })
    expect(archiveReads).toEqual({
      path: false,
      uncompressedSizeBytes: false,
      compressedSizeBytes: false
    })
    for (const error of [directoryError, archiveError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('entry-keys')
      expect(JSON.stringify(error)).not.toContain('entry-name')
      expect(JSON.stringify(error)).not.toContain('entry-kind')
      expect(JSON.stringify(error)).not.toContain('entry-symlink')
      expect(JSON.stringify(error)).not.toContain('entry-path')
      expect(JSON.stringify(error)).not.toContain('entry-size')
      expect(JSON.stringify(error)).not.toContain('entry-compressed-size')
    }
  })

  it('reads metadata array entries from own indexes without invoking presence traps', () => {
    const directoryEntry = { name: 'pack', kind: 'directory', isSymbolicLink: false }
    const archiveEntry = { path: 'pack/manifest.json', uncompressedSizeBytes: 0 }

    expect(normalizeContentPackageSourceDirectoryEntries(
      createHostilePresenceMetadataArray(directoryEntry)
    )).toEqual([directoryEntry])
    expect(validateContentPackageSourceArchiveEntries(
      createHostilePresenceMetadataArray(archiveEntry)
    )).toEqual([archiveEntry])
  })

  it('detaches validated directory metadata from later host object mutations', () => {
    const hostDirectoryEntry: {
      name: string
      kind: 'directory' | 'file' | 'other'
      isSymbolicLink: boolean
    } = {
      name: 'pack',
      kind: 'directory',
      isSymbolicLink: false
    }
    const directoryEntries = normalizeContentPackageSourceDirectoryEntries([hostDirectoryEntry])

    hostDirectoryEntry.name = 'mutated-pack'
    hostDirectoryEntry.kind = 'file'
    hostDirectoryEntry.isSymbolicLink = true

    expect(directoryEntries).toEqual([
      { name: 'pack', kind: 'directory', isSymbolicLink: false }
    ])
    expect(Object.isFrozen(directoryEntries)).toBe(true)
    expect(Object.isFrozen(directoryEntries[0])).toBe(true)
  })

  it('detaches validated metadata arrays from later host array mutations', () => {
    const hostDirectoryEntries: Array<{
      name: string
      kind: 'directory' | 'file' | 'other'
      isSymbolicLink: boolean
    }> = [
      { name: 'pack', kind: 'directory', isSymbolicLink: false },
      { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
    ]
    const hostArchiveEntries: Array<{
      path: string
      uncompressedSizeBytes: number
      compressedSizeBytes?: number
    }> = [
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0 },
      { path: 'pack/data/items.json', uncompressedSizeBytes: 10, compressedSizeBytes: 2 }
    ]

    const directoryEntries = normalizeContentPackageSourceDirectoryEntries(hostDirectoryEntries)
    const archiveEntries = validateContentPackageSourceArchiveEntries(hostArchiveEntries)

    hostDirectoryEntries.splice(0, hostDirectoryEntries.length, {
      name: 'mutated',
      kind: 'file',
      isSymbolicLink: true
    })
    hostArchiveEntries.reverse()
    hostArchiveEntries.push({ path: 'pack/mutated.json', uncompressedSizeBytes: 1 })

    expect(directoryEntries).toEqual([
      { name: 'manifest.json', kind: 'file', isSymbolicLink: false },
      { name: 'pack', kind: 'directory', isSymbolicLink: false }
    ])
    expect(archiveEntries).toEqual([
      { path: 'pack/data/items.json', uncompressedSizeBytes: 10, compressedSizeBytes: 2 },
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0 }
    ])
    expect(Object.is(directoryEntries, hostDirectoryEntries)).toBe(false)
    expect(Object.is(archiveEntries, hostArchiveEntries)).toBe(false)
    expect(Object.isFrozen(directoryEntries)).toBe(true)
    expect(Object.isFrozen(archiveEntries)).toBe(true)
  })

  it('requires metadata array entries to be own indexes before inherited getters can run', () => {
    const directoryArray = createInheritedIndexMetadataArray({
      name: 'pack',
      kind: 'directory',
      isSymbolicLink: false
    })
    const archiveArray = createInheritedIndexMetadataArray({
      path: 'pack/manifest.json',
      uncompressedSizeBytes: 0
    })

    const directoryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries(
      directoryArray.entries
    ))
    const archiveError = captureSourceError(() => validateContentPackageSourceArchiveEntries(
      archiveArray.entries
    ))

    expect(directoryError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source directory entries metadata must be a dense JSON array'
    })
    expect(archiveError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entries metadata must be a dense JSON array'
    })
    expect(directoryArray.wasRead()).toBe(false)
    expect(archiveArray.wasRead()).toBe(false)
    for (const error of [directoryError, archiveError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('metadata-array-inherited-index')
    }
  })

  it('requires metadata array entries to be enumerable own indexes before hidden getters can run', () => {
    const directoryArray = createHiddenIndexMetadataArray({
      name: 'pack',
      kind: 'directory',
      isSymbolicLink: false
    })
    const archiveArray = createHiddenIndexMetadataArray({
      path: 'pack/manifest.json',
      uncompressedSizeBytes: 0
    })

    const directoryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries(
      directoryArray.entries
    ))
    const archiveError = captureSourceError(() => validateContentPackageSourceArchiveEntries(
      archiveArray.entries
    ))

    expect(directoryError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source directory entries metadata must be a dense JSON array'
    })
    expect(archiveError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entries metadata must be a dense JSON array'
    })
    expect(directoryArray.wasRead()).toBe(false)
    expect(archiveArray.wasRead()).toBe(false)
    for (const error of [directoryError, archiveError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('metadata-array-hidden-index')
    }
  })

  it('rejects metadata arrays with extra own keys before entry or host getters can run', () => {
    const directoryArray = createExtraOwnKeyMetadataArray('hostPath')
    const archiveArray = createExtraOwnKeyMetadataArray('archiveHostPath')

    const directoryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries(
      directoryArray.entries
    ))
    const archiveError = captureSourceError(() => validateContentPackageSourceArchiveEntries(
      archiveArray.entries
    ))

    expect(directoryError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source directory entries metadata must be a dense JSON array'
    })
    expect(archiveError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entries metadata must be a dense JSON array'
    })
    expect(directoryArray.wasEntryRead()).toBe(false)
    expect(directoryArray.wasExtraRead()).toBe(false)
    expect(archiveArray.wasEntryRead()).toBe(false)
    expect(archiveArray.wasExtraRead()).toBe(false)
    for (const error of [directoryError, archiveError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('hostPath')
      expect(JSON.stringify(error)).not.toContain('metadata-array-entry')
    }
  })

  it('rejects metadata arrays with symbol own keys before entry or symbol getters can run', () => {
    const directoryArray = createSymbolOwnKeyMetadataArray()
    const archiveArray = createSymbolOwnKeyMetadataArray()

    const directoryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries(
      directoryArray.entries
    ))
    const archiveError = captureSourceError(() => validateContentPackageSourceArchiveEntries(
      archiveArray.entries
    ))

    expect(directoryError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source directory entries metadata must be a dense JSON array'
    })
    expect(archiveError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entries metadata must be a dense JSON array'
    })
    expect(directoryArray.wasEntryRead()).toBe(false)
    expect(directoryArray.wasSymbolRead()).toBe(false)
    expect(archiveArray.wasEntryRead()).toBe(false)
    expect(archiveArray.wasSymbolRead()).toBe(false)
    for (const error of [directoryError, archiveError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('hostPath')
      expect(JSON.stringify(error)).not.toContain('metadata-array')
    }
  })

  it('redacts metadata getter failures before source diagnostics expose host text', async() => {
    const hostileIdentity = defineHostileGetter({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/hostile-identity-field'
    }, 'rootPath')
    const identityError = captureSourceError(() => validateContentPackageSourceIdentity(hostileIdentity))

    expect(identityError.code).toBe('SOURCE_IDENTITY_INVALID')
    expect(JSON.stringify(identityError)).not.toContain('C:/Users')
    expect(JSON.stringify(identityError)).not.toContain('LENOVO')

    const hostileDirectoryEntry = defineHostileGetter({
      kind: 'directory',
      isSymbolicLink: false
    }, 'name')
    const directoryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      hostileDirectoryEntry
    ]))

    expect(directoryError.code).toBe('SOURCE_ENTRY_UNSAFE')
    expect(JSON.stringify(directoryError)).not.toContain('C:/Users')
    expect(JSON.stringify(directoryError)).not.toContain('LENOVO')

    for (const hostileArchiveEntry of [
      defineHostileGetter({ uncompressedSizeBytes: 0 }, 'path'),
      defineHostileGetter({ path: 'pack/manifest.json' }, 'uncompressedSizeBytes'),
      defineHostileGetter({ path: 'pack/manifest.json', uncompressedSizeBytes: 0 }, 'compressedSizeBytes')
    ]) {
      const archiveError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
        hostileArchiveEntry
      ]))

      expect(archiveError.code).toBe('SOURCE_ENTRY_UNSAFE')
      expect(JSON.stringify(archiveError)).not.toContain('C:/Users')
      expect(JSON.stringify(archiveError)).not.toContain('LENOVO')
    }

    let inspected = false
    let readAttempted = false
    const hostileIdentitySource: ContentPackageSource = {
      identity: hostileIdentity as ContentPackageSource['identity'],
      async getEntry() {
        inspected = true
        return { name: 'packs', kind: 'directory', isSymbolicLink: false }
      },
      async readDirectory() {
        return []
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('identity failures must block payload reads')
      },
      async dispose() {}
    }
    const hostileDirectorySource: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/hostile-directory-metadata-field',
        rootPath: 'packs'
      },
      async getEntry(path) {
        return path === ''
          ? { name: 'packs', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return [hostileDirectoryEntry as ContentPackageSourceDirectoryEntry]
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('directory metadata failures must block payload reads')
      },
      async dispose() {}
    }

    const identityReport = await discoverThirdPartyDataPacks(
      'packs',
      createDiscoveryFileSystemFromContentPackageSource(hostileIdentitySource)
    )
    const directoryReport = await discoverThirdPartyDataPacks(
      'packs',
      createDiscoveryFileSystemFromContentPackageSource(hostileDirectorySource)
    )

    expect(inspected).toBe(false)
    expect(readAttempted).toBe(false)
    expect(identityReport.status).toBe('directory-not-found')
    expect(identityReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_IDENTITY_INVALID'
    })
    expect(directoryReport.status).toBe('directory-not-found')
    expect(directoryReport.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      reason: 'Package source list operation failed'
    })
    expect(directoryReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })
    for (const result of [identityReport, directoryReport]) {
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
    }
  })

  it('requires ContentPackageSource required metadata to be own fields before inherited getters can run', () => {
    const identityBase: Record<string, unknown> = {
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/inherited-identity',
      rootPath: 'packs'
    }
    for (const fieldName of ['contractVersion', 'kind', 'sourceId', 'rootPath']) {
      const identity = { ...identityBase }
      delete identity[fieldName]
      const inherited = defineInheritedHostileGetter(identity, fieldName)

      const error = captureSourceError(() => validateContentPackageSourceIdentity(inherited.value))

      expect(error).toMatchObject({
        code: 'SOURCE_IDENTITY_INVALID',
        message: 'Content package source identity metadata must include contractVersion, kind, sourceId and rootPath own fields'
      })
      expect(inherited.wasRead()).toBe(false)
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }

    const directoryEntryBase: Record<string, unknown> = {
      name: 'pack',
      kind: 'directory',
      isSymbolicLink: false
    }
    for (const fieldName of ['name', 'kind', 'isSymbolicLink']) {
      const directoryEntry = { ...directoryEntryBase }
      delete directoryEntry[fieldName]
      const inherited = defineInheritedHostileGetter(directoryEntry, fieldName)

      const error = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
        inherited.value
      ]))

      expect(error).toMatchObject({
        code: 'SOURCE_ENTRY_UNSAFE',
        message: 'Content package source entry metadata must include name, kind and isSymbolicLink own fields'
      })
      expect(inherited.wasRead()).toBe(false)
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }

    const archiveEntryBase: Record<string, unknown> = {
      path: 'pack/manifest.json',
      uncompressedSizeBytes: 0
    }
    for (const fieldName of ['path', 'uncompressedSizeBytes']) {
      const archiveEntry = { ...archiveEntryBase }
      delete archiveEntry[fieldName]
      const inherited = defineInheritedHostileGetter(archiveEntry, fieldName)

      const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
        inherited.value
      ]))

      expect(error).toMatchObject({
        code: 'SOURCE_ENTRY_UNSAFE',
        message: 'Archive entry metadata must include path and uncompressedSizeBytes own fields'
      })
      expect(inherited.wasRead()).toBe(false)
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
    }
  })

  it('requires ContentPackageSource metadata fields to be enumerable before hidden getters can run', () => {
    const hiddenIdentity = defineHiddenHostileGetter({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/hidden-identity-field'
    }, 'rootPath')
    const identityError = captureSourceError(() => validateContentPackageSourceIdentity(hiddenIdentity.value))

    expect(identityError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Content package source identity metadata contains unsupported fields'
    })
    expect(hiddenIdentity.wasRead()).toBe(false)

    const hiddenDirectoryEntry = defineHiddenHostileGetter({
      name: 'pack',
      kind: 'directory'
    }, 'isSymbolicLink')
    const directoryError = captureSourceError(() => normalizeContentPackageSourceDirectoryEntries([
      hiddenDirectoryEntry.value
    ]))

    expect(directoryError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source entry metadata contains unsupported fields'
    })
    expect(hiddenDirectoryEntry.wasRead()).toBe(false)

    const hiddenArchivePath = defineHiddenHostileGetter({
      uncompressedSizeBytes: 0
    }, 'path')
    const archivePathError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      hiddenArchivePath.value
    ]))

    expect(archivePathError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entry metadata contains unsupported fields'
    })
    expect(hiddenArchivePath.wasRead()).toBe(false)

    const hiddenArchiveUncompressedSize = defineHiddenHostileGetter({
      path: 'pack/manifest.json'
    }, 'uncompressedSizeBytes')
    const archiveUncompressedSizeError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      hiddenArchiveUncompressedSize.value
    ]))

    expect(archiveUncompressedSizeError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entry metadata contains unsupported fields'
    })
    expect(hiddenArchiveUncompressedSize.wasRead()).toBe(false)

    const hiddenArchiveCompressedSize = defineHiddenHostileGetter({
      path: 'pack/manifest.json',
      uncompressedSizeBytes: 0
    }, 'compressedSizeBytes')
    const archiveCompressedSizeError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      hiddenArchiveCompressedSize.value
    ]))

    expect(archiveCompressedSizeError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entry metadata contains unsupported fields'
    })
    expect(hiddenArchiveCompressedSize.wasRead()).toBe(false)

    for (const result of [
      identityError,
      directoryError,
      archivePathError,
      archiveUncompressedSizeError,
      archiveCompressedSizeError
    ]) {
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
    }
  })

  it('redacts unreadable source error metadata before direct reads or discovery diagnostics can leak', async() => {
    const source: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/hostile-source-error-metadata',
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
        throw createHostileSourceErrorMetadata()
      },
      async dispose() {}
    }
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    const directJson = await readContentPackageSourceJson(source, 'pack/manifest.json')
    const bridgedReadError = await captureAsyncSourceError(() => fileSystem.readTextFile('packs/pack/manifest.json'))
    const report = await discoverThirdPartyDataPacks(source.identity.rootPath, fileSystem)

    expect(directJson).toMatchObject({
      ok: false,
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: 'Content package source read operation failed'
    })
    expect(bridgedReadError).toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: 'Content package source read operation failed',
      sourcePath: 'pack/manifest.json'
    })
    expect(report.status).toBe('completed')
    expect(report.candidates[0]?.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      path: 'pack/manifest.json',
      reason: 'Package source read operation failed'
    })
    expect(report.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source read operation failed',
      sourceCode: 'SOURCE_ENTRY_NOT_FOUND'
    })
    for (const result of [directJson, bridgedReadError, report]) {
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
      expect(JSON.stringify(result)).not.toContain('hostile-fragment')
    }
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
      'pack/./items.json',
      'pack/data/items.json\nsecret'
    ]) {
      expect(() => normalizeContentPackageSourceArchiveEntryPath(unsafePath)).toThrow(ContentPackageSourceError)
    }
    let archivePathCoerced = false
    const hostileArchivePath = {
      toString() {
        archivePathCoerced = true
        throw new Error('C:/Users/LENOVO/mods/archive-to-string-hostile-fragment')
      },
      [Symbol.toPrimitive]() {
        archivePathCoerced = true
        throw new Error('C:/Users/LENOVO/mods/archive-to-primitive-hostile-fragment')
      }
    }
    const hostileArchivePathError = captureSourceError(() => normalizeContentPackageSourceArchiveEntryPath(
      hostileArchivePath as never
    ))

    expect(hostileArchivePathError).toMatchObject({
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Archive entry paths must be non-empty normalized POSIX paths'
    })
    expect(archivePathCoerced).toBe(false)
    expect(JSON.stringify(hostileArchivePathError)).not.toContain('C:/Users')
    expect(JSON.stringify(hostileArchivePathError)).not.toContain('LENOVO')
    expect(JSON.stringify(hostileArchivePathError)).not.toContain('hostile-fragment')
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
    const duplicateArchivePathError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      { path: 'LENOVO-private-pack/manifest.json', uncompressedSizeBytes: 1 },
      { path: 'LENOVO-private-pack/manifest.json', uncompressedSizeBytes: 1 }
    ]))
    const ancestorArchivePathError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      { path: 'LENOVO-private-pack', uncompressedSizeBytes: 1 },
      { path: 'LENOVO-private-pack/manifest.json', uncompressedSizeBytes: 1 }
    ]))
    const descendantArchivePathError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      { path: 'LENOVO-private-pack/data/items.json', uncompressedSizeBytes: 1 },
      { path: 'LENOVO-private-pack/data', uncompressedSizeBytes: 1 }
    ]))

    expect(duplicateArchivePathError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Duplicate archive entry path'
    })
    expect(ancestorArchivePathError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Archive entry path conflicts with another entry directory prefix'
    })
    expect(descendantArchivePathError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Archive entry path conflicts with another entry directory prefix'
    })
    for (const error of [duplicateArchivePathError, ancestorArchivePathError, descendantArchivePathError]) {
      expect(JSON.stringify(error)).not.toContain('LENOVO-private-pack')
    }
    expect(captureSourceError(() => validateContentPackageSourceArchiveEntries(
      Array.from({ length: limits.maxPackageFileCount + 1 }, (_, index) => ({
        path: `data/${index}.json`,
        uncompressedSizeBytes: 0
      }))
    )).code).toBe('SOURCE_LIMIT_EXCEEDED')
    const overLimitArchiveMetadata = createOverLimitMetadataArray(index => ({
      path: `data/${index}.json`,
      uncompressedSizeBytes: 0
    }))
    const overLimitArchiveError = captureSourceError(() => validateContentPackageSourceArchiveEntries(
      overLimitArchiveMetadata.entries
    ))

    expect(overLimitArchiveError).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Archive exceeds ${limits.maxPackageFileCount} entries: ${limits.maxPackageFileCount + 1}`
    })
    expect(overLimitArchiveMetadata.wasFirstEntryRead()).toBe(false)
    expect(overLimitArchiveMetadata.wasBoundaryEntryRead()).toBe(false)
    expect(JSON.stringify(overLimitArchiveError)).not.toContain('C:/Users')
    expect(JSON.stringify(overLimitArchiveError)).not.toContain('LENOVO')
    expect(JSON.stringify(overLimitArchiveError)).not.toContain('hostile-first-entry')
    expect(JSON.stringify(overLimitArchiveError)).not.toContain('hostile-boundary-entry')
    expect(JSON.stringify(overLimitArchiveError)).not.toContain('hostile-fragment')
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
      { path: 'compressed-a.bin', uncompressedSizeBytes: 0, compressedSizeBytes: limits.maxPackageCompressedBytes },
      { path: 'compressed-b.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 1 }
    ])).code).toBe('SOURCE_LIMIT_EXCEEDED')
    expect(captureSourceError(() => validateContentPackageSourceArchiveEntries([
      { path: 'ratio.bin', uncompressedSizeBytes: limits.maxCompressedRatio + 1, compressedSizeBytes: 1 }
    ])).code).toBe('SOURCE_LIMIT_EXCEEDED')
  })

  it('rejects unsafe archive size metadata before ZIP payloads can become sources', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS

    expect(validateContentPackageSourceArchiveEntries([
      { path: 'ratio-edge.bin', uncompressedSizeBytes: limits.maxCompressedRatio, compressedSizeBytes: 1 },
      { path: 'compressed-budget.bin', uncompressedSizeBytes: 0, compressedSizeBytes: limits.maxPackageCompressedBytes - 1 },
      { path: 'empty.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 0 }
    ])).toEqual([
      { path: 'compressed-budget.bin', uncompressedSizeBytes: 0, compressedSizeBytes: limits.maxPackageCompressedBytes - 1 },
      { path: 'empty.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 0 },
      { path: 'ratio-edge.bin', uncompressedSizeBytes: limits.maxCompressedRatio, compressedSizeBytes: 1 }
    ])

    for (const entry of [
      { path: 'negative.bin', uncompressedSizeBytes: -1 },
      { path: 'fraction.bin', uncompressedSizeBytes: 1.5 },
      { path: 'infinite.bin', uncompressedSizeBytes: Number.POSITIVE_INFINITY },
      { path: 'compressed-negative.bin', uncompressedSizeBytes: 0, compressedSizeBytes: -1 },
      { path: 'compressed-fraction.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 1.5 },
      { path: 'compressed-undefined.bin', uncompressedSizeBytes: 0, compressedSizeBytes: undefined },
      { path: 'zip-bomb.bin', uncompressedSizeBytes: 1, compressedSizeBytes: 0 }
    ]) {
      expect(captureSourceError(() => validateContentPackageSourceArchiveEntries([entry])).code)
        .toBe('SOURCE_LIMIT_EXCEEDED')
    }
  })

  it('rejects over-limit archive entry counts before reading boundary entry metadata', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    let boundaryEntryRead = false
    let boundaryPathRead = false
    let boundaryUncompressedSizeRead = false
    let boundaryCompressedSizeRead = false
    const boundaryEntry = {
      get path() {
        boundaryPathRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-boundary-path')
      },
      get uncompressedSizeBytes() {
        boundaryUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-boundary-uncompressed-size')
      },
      get compressedSizeBytes() {
        boundaryCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-boundary-compressed-size')
      }
    }
    const archiveEntries = Array.from({ length: limits.maxPackageFileCount }, (_, index) => ({
      path: `data/${index}.json`,
      uncompressedSizeBytes: 0
    }))
    Object.defineProperty(archiveEntries, String(limits.maxPackageFileCount), {
      enumerable: true,
      get() {
        boundaryEntryRead = true
        return boundaryEntry
      }
    })

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries(archiveEntries))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Archive exceeds ${limits.maxPackageFileCount} entries: ${limits.maxPackageFileCount + 1}`
    })
    expect(boundaryEntryRead).toBe(false)
    expect(boundaryPathRead).toBe(false)
    expect(boundaryUncompressedSizeRead).toBe(false)
    expect(boundaryCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-boundary')
  })

  it('rejects invalid uncompressed archive size before reading optional compressed metadata', () => {
    let compressedSizeRead = false
    const hostileArchiveEntry = {
      path: 'pack/manifest.json',
      uncompressedSizeBytes: 'C:/Users/LENOVO/mods/archive-uncompressed-size',
      get compressedSizeBytes() {
        compressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([hostileArchiveEntry]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: 'uncompressedSizeBytes must be a non-negative safe integer',
      sourcePath: 'pack/manifest.json'
    })
    expect(compressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-compressed-size')
  })

  it('rejects unreadable uncompressed archive size metadata before compressed or later size reads', () => {
    let uncompressedSizeRead = false
    let compressedSizeRead = false
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const unreadableUncompressedSizeEntry = {
      path: 'a-pack/manifest.json',
      get uncompressedSizeBytes() {
        uncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-uncompressed-size-hostile-fragment')
      },
      get compressedSizeBytes() {
        compressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-compressed-size-hostile-fragment')
      }
    }
    const laterEntry = {
      path: 'b-pack/manifest.json',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      laterEntry,
      unreadableUncompressedSizeEntry
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entry metadata could not be read'
    })
    expect(uncompressedSizeRead).toBe(true)
    expect(compressedSizeRead).toBe(false)
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('hostile-fragment')
    expect(JSON.stringify(error)).not.toContain('archive-later')
  })

  it('rejects non-number archive size metadata before coercion or later size reads', () => {
    let sizeCoerced = false
    let compressedSizeRead = false
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const hostileUncompressedSize = {
      valueOf() {
        sizeCoerced = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-size-valueOf')
      },
      [Symbol.toPrimitive]() {
        sizeCoerced = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-size-to-primitive')
      }
    }
    const hostileArchiveEntry = {
      path: 'a-pack/manifest.json',
      uncompressedSizeBytes: hostileUncompressedSize,
      get compressedSizeBytes() {
        compressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-size-compressed-size')
      }
    }
    const laterArchiveEntry = {
      path: 'b-pack/manifest.json',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-size-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-size-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      hostileArchiveEntry,
      laterArchiveEntry
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: 'uncompressedSizeBytes must be a non-negative safe integer',
      sourcePath: 'a-pack/manifest.json'
    })
    expect(sizeCoerced).toBe(false)
    expect(compressedSizeRead).toBe(false)
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-size')
  })

  it('rejects negative archive size metadata before compressed or later size reads', () => {
    let invalidUncompressedCompressedSizeRead = false
    let invalidCompressedLaterUncompressedSizeRead = false
    let invalidCompressedLaterCompressedSizeRead = false
    const invalidUncompressedEntry = {
      path: 'a-pack/manifest.json',
      uncompressedSizeBytes: -1,
      get compressedSizeBytes() {
        invalidUncompressedCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-negative-compressed-size')
      }
    }
    const invalidCompressedEntry = {
      path: 'a-pack/manifest.json',
      uncompressedSizeBytes: 0,
      compressedSizeBytes: -1
    }
    const laterArchiveEntry = {
      path: 'b-pack/manifest.json',
      get uncompressedSizeBytes() {
        invalidCompressedLaterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-negative-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        invalidCompressedLaterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-negative-later-compressed-size')
      }
    }

    const invalidUncompressedError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      invalidUncompressedEntry,
      laterArchiveEntry
    ]))
    const invalidCompressedError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      invalidCompressedEntry,
      laterArchiveEntry
    ]))

    expect(invalidUncompressedError).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: 'uncompressedSizeBytes must be a non-negative safe integer',
      sourcePath: 'a-pack/manifest.json'
    })
    expect(invalidCompressedError).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: 'compressedSizeBytes must be a non-negative safe integer',
      sourcePath: 'a-pack/manifest.json'
    })
    expect(invalidUncompressedCompressedSizeRead).toBe(false)
    expect(invalidCompressedLaterUncompressedSizeRead).toBe(false)
    expect(invalidCompressedLaterCompressedSizeRead).toBe(false)
    for (const error of [invalidUncompressedError, invalidCompressedError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('archive-negative')
    }
  })

  it('rejects negative optional archive compressed-size metadata in normalized path order before reading later sizes', () => {
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const invalidCompressedEntry = {
      path: 'm-pack/manifest.json',
      uncompressedSizeBytes: 0,
      compressedSizeBytes: -1
    }
    const laterArchiveEntry = {
      path: 'z-pack/manifest.json',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-negative-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-negative-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      laterArchiveEntry,
      invalidCompressedEntry,
      { path: 'a-safe.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 0 }
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: 'compressedSizeBytes must be a non-negative safe integer',
      sourcePath: 'm-pack/manifest.json'
    })
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-negative')
  })

  it('rejects non-finite archive size metadata before compressed or later size reads', () => {
    let invalidUncompressedCompressedSizeRead = false
    let invalidCompressedLaterUncompressedSizeRead = false
    let invalidCompressedLaterCompressedSizeRead = false
    const invalidUncompressedEntry = {
      path: 'a-pack/manifest.json',
      uncompressedSizeBytes: Number.NaN,
      get compressedSizeBytes() {
        invalidUncompressedCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-non-finite-compressed-size')
      }
    }
    const invalidCompressedEntry = {
      path: 'a-pack/manifest.json',
      uncompressedSizeBytes: 0,
      compressedSizeBytes: Number.NEGATIVE_INFINITY
    }
    const laterArchiveEntry = {
      path: 'b-pack/manifest.json',
      get uncompressedSizeBytes() {
        invalidCompressedLaterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-non-finite-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        invalidCompressedLaterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-non-finite-later-compressed-size')
      }
    }

    const invalidUncompressedError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      invalidUncompressedEntry,
      laterArchiveEntry
    ]))
    const invalidCompressedError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      invalidCompressedEntry,
      laterArchiveEntry
    ]))

    expect(invalidUncompressedError).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: 'uncompressedSizeBytes must be a non-negative safe integer',
      sourcePath: 'a-pack/manifest.json'
    })
    expect(invalidCompressedError).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: 'compressedSizeBytes must be a non-negative safe integer',
      sourcePath: 'a-pack/manifest.json'
    })
    expect(invalidUncompressedCompressedSizeRead).toBe(false)
    expect(invalidCompressedLaterUncompressedSizeRead).toBe(false)
    expect(invalidCompressedLaterCompressedSizeRead).toBe(false)
    for (const error of [invalidUncompressedError, invalidCompressedError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('archive-non-finite')
    }
  })

  it('rejects non-finite optional archive compressed-size metadata in normalized path order before reading later sizes', () => {
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const invalidCompressedEntry = {
      path: 'm-pack/manifest.json',
      uncompressedSizeBytes: 0,
      compressedSizeBytes: Number.POSITIVE_INFINITY
    }
    const laterArchiveEntry = {
      path: 'z-pack/manifest.json',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-non-finite-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-non-finite-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      laterArchiveEntry,
      invalidCompressedEntry,
      { path: 'a-safe.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 0 }
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: 'compressedSizeBytes must be a non-negative safe integer',
      sourcePath: 'm-pack/manifest.json'
    })
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-non-finite')
  })

  it('rejects non-number optional archive compressed-size metadata before coercion or later size reads', () => {
    let compressedSizeCoerced = false
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const hostileCompressedSize = {
      valueOf() {
        compressedSizeCoerced = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-compressed-size-valueOf')
      },
      [Symbol.toPrimitive]() {
        compressedSizeCoerced = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-compressed-size-to-primitive')
      }
    }
    const hostileArchiveEntry = {
      path: 'a-pack/manifest.json',
      uncompressedSizeBytes: 0,
      compressedSizeBytes: hostileCompressedSize
    }
    const laterArchiveEntry = {
      path: 'b-pack/manifest.json',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-compressed-size-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-compressed-size-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      hostileArchiveEntry,
      laterArchiveEntry
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: 'compressedSizeBytes must be a non-negative safe integer',
      sourcePath: 'a-pack/manifest.json'
    })
    expect(compressedSizeCoerced).toBe(false)
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-compressed-size')
  })

  it('rejects oversized single archive entries before reading compressed or later size metadata', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    let oversizedCompressedSizeRead = false
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const oversizedEntry = {
      path: 'a-oversized.bin',
      uncompressedSizeBytes: limits.maxSingleFileBytes + 1,
      get compressedSizeBytes() {
        oversizedCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-oversized-compressed-size')
      }
    }
    const laterEntry = {
      path: 'b-later.bin',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      oversizedEntry,
      laterEntry
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Archive entry exceeds ${limits.maxSingleFileBytes} bytes: ${limits.maxSingleFileBytes + 1}`,
      sourcePath: 'a-oversized.bin'
    })
    expect(oversizedCompressedSizeRead).toBe(false)
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-oversized-compressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-later')
  })

  it('rejects oversized single archive entries in normalized path order before reading later size metadata', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    let oversizedCompressedSizeRead = false
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const oversizedEntry = {
      path: 'm-oversized.bin',
      uncompressedSizeBytes: limits.maxSingleFileBytes + 1,
      get compressedSizeBytes() {
        oversizedCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-oversized-compressed-size')
      }
    }
    const laterEntry = {
      path: 'z-later.bin',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      laterEntry,
      oversizedEntry,
      { path: 'a-safe.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 0 }
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Archive entry exceeds ${limits.maxSingleFileBytes} bytes: ${limits.maxSingleFileBytes + 1}`,
      sourcePath: 'm-oversized.bin'
    })
    expect(oversizedCompressedSizeRead).toBe(false)
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-oversized-compressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-later-uncompressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-later-compressed-size')
  })

  it('rejects unreadable optional archive compressed-size metadata before reading later sizes', () => {
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const unreadableCompressedSizeEntry = {
      path: 'a-pack/manifest.json',
      uncompressedSizeBytes: 1,
      get compressedSizeBytes() {
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-compressed-size-hostile-fragment')
      }
    }
    const laterEntry = {
      path: 'b-pack/manifest.json',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      laterEntry,
      unreadableCompressedSizeEntry
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entry metadata could not be read'
    })
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('hostile-fragment')
    expect(JSON.stringify(error)).not.toContain('archive-later')
  })

  it('rejects unreadable optional archive compressed-size metadata in normalized path order before reading later sizes', () => {
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const unreadableCompressedSizeEntry = {
      path: 'm-pack/manifest.json',
      uncompressedSizeBytes: 1,
      get compressedSizeBytes() {
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-compressed-size-hostile-fragment')
      }
    }
    const laterEntry = {
      path: 'z-pack/manifest.json',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      laterEntry,
      unreadableCompressedSizeEntry,
      { path: 'a-safe.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 0 }
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entry metadata could not be read'
    })
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('hostile-fragment')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-later-uncompressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-later-compressed-size')
  })

  it('rejects archive total uncompressed budget before reading later size metadata', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    let overflowingCompressedSizeRead = false
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const overflowingEntry = {
      path: 'b-overflow.bin',
      uncompressedSizeBytes: 1,
      get compressedSizeBytes() {
        overflowingCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-overflow-compressed-size')
      }
    }
    const laterEntry = {
      path: 'c-later.bin',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      { path: 'a-baseline-0.bin', uncompressedSizeBytes: limits.maxSingleFileBytes },
      { path: 'a-baseline-1.bin', uncompressedSizeBytes: limits.maxSingleFileBytes },
      { path: 'a-baseline-2.bin', uncompressedSizeBytes: limits.maxSingleFileBytes },
      { path: 'a-baseline-3.bin', uncompressedSizeBytes: limits.maxSingleFileBytes },
      overflowingEntry,
      laterEntry
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Archive exceeds ${limits.maxPackageUncompressedBytes} total uncompressed bytes: ${limits.maxPackageUncompressedBytes + 1}`,
      sourcePath: 'b-overflow.bin'
    })
    expect(overflowingCompressedSizeRead).toBe(false)
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-overflow-compressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-later-uncompressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-later-compressed-size')
  })

  it('rejects archive total uncompressed budget in normalized path order before reading later size metadata', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    let overflowingCompressedSizeRead = false
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const overflowingEntry = {
      path: 'm-overflow.bin',
      uncompressedSizeBytes: 1,
      get compressedSizeBytes() {
        overflowingCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-overflow-compressed-size')
      }
    }
    const laterEntry = {
      path: 'z-later.bin',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      laterEntry,
      overflowingEntry,
      { path: 'a-baseline-3.bin', uncompressedSizeBytes: limits.maxSingleFileBytes },
      { path: 'a-baseline-2.bin', uncompressedSizeBytes: limits.maxSingleFileBytes },
      { path: 'a-baseline-1.bin', uncompressedSizeBytes: limits.maxSingleFileBytes },
      { path: 'a-baseline-0.bin', uncompressedSizeBytes: limits.maxSingleFileBytes }
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Archive exceeds ${limits.maxPackageUncompressedBytes} total uncompressed bytes: ${limits.maxPackageUncompressedBytes + 1}`,
      sourcePath: 'm-overflow.bin'
    })
    expect(overflowingCompressedSizeRead).toBe(false)
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-overflow-compressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-later-uncompressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-later-compressed-size')
  })

  it('rejects archive total compressed budget before reading later size metadata', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const laterEntry = {
      path: 'c-later.bin',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      { path: 'a-baseline.bin', uncompressedSizeBytes: 0, compressedSizeBytes: limits.maxPackageCompressedBytes },
      { path: 'b-overflow.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 1 },
      laterEntry
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Archive exceeds ${limits.maxPackageCompressedBytes} total compressed bytes: ${limits.maxPackageCompressedBytes + 1}`,
      sourcePath: 'b-overflow.bin'
    })
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-later-uncompressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-later-compressed-size')
  })

  it('rejects archive total compressed budget in normalized path order before reading later size metadata', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const laterEntry = {
      path: 'z-later.bin',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      laterEntry,
      { path: 'm-overflow.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 1 },
      { path: 'a-baseline.bin', uncompressedSizeBytes: 0, compressedSizeBytes: limits.maxPackageCompressedBytes }
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Archive exceeds ${limits.maxPackageCompressedBytes} total compressed bytes: ${limits.maxPackageCompressedBytes + 1}`,
      sourcePath: 'm-overflow.bin'
    })
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-later-uncompressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-later-compressed-size')
  })

  it('rejects archive compression ratio before reading later size metadata', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const laterEntry = {
      path: 'b-later.bin',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      {
        path: 'a-zip-bomb.bin',
        uncompressedSizeBytes: limits.maxCompressedRatio + 1,
        compressedSizeBytes: 1
      },
      laterEntry
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Archive entry exceeds ${limits.maxCompressedRatio}:1 compression ratio`,
      sourcePath: 'a-zip-bomb.bin'
    })
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-later-uncompressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-later-compressed-size')
  })

  it('rejects archive compression ratio in normalized path order before reading later size metadata', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const laterEntry = {
      path: 'z-later.bin',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-ratio-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-ratio-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      laterEntry,
      {
        path: 'm-zip-bomb.bin',
        uncompressedSizeBytes: limits.maxCompressedRatio + 1,
        compressedSizeBytes: 1
      },
      {
        path: 'a-safe.bin',
        uncompressedSizeBytes: limits.maxCompressedRatio,
        compressedSizeBytes: 1
      }
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Archive entry exceeds ${limits.maxCompressedRatio}:1 compression ratio`,
      sourcePath: 'm-zip-bomb.bin'
    })
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-ratio-later-uncompressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-ratio-later-compressed-size')
  })

  it('rejects zero compressed archive zip-bomb metadata before reading later size metadata', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const laterEntry = {
      path: 'b-later.bin',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-zero-compressed-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-zero-compressed-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      {
        path: 'a-zero-compressed-zip-bomb.bin',
        uncompressedSizeBytes: 1,
        compressedSizeBytes: 0
      },
      laterEntry
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Archive entry exceeds ${limits.maxCompressedRatio}:1 compression ratio`,
      sourcePath: 'a-zero-compressed-zip-bomb.bin'
    })
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-zero-compressed-later-uncompressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-zero-compressed-later-compressed-size')
  })

  it('rejects zero compressed archive zip-bomb metadata in normalized path order before reading later size metadata', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const laterEntry = {
      path: 'z-later.bin',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-zero-compressed-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-zero-compressed-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      laterEntry,
      {
        path: 'm-zero-compressed-zip-bomb.bin',
        uncompressedSizeBytes: 1,
        compressedSizeBytes: 0
      },
      {
        path: 'a-empty.bin',
        uncompressedSizeBytes: 0,
        compressedSizeBytes: 0
      }
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Archive entry exceeds ${limits.maxCompressedRatio}:1 compression ratio`,
      sourcePath: 'm-zero-compressed-zip-bomb.bin'
    })
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-zero-compressed-later-uncompressed-size')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-zero-compressed-later-compressed-size')
  })

  it('rejects unsafe archive entry paths before reading size metadata', () => {
    let uncompressedSizeRead = false
    let compressedSizeRead = false
    const hostileArchiveEntry = {
      path: 'pack/data/items.json\nhostile-fragment',
      get uncompressedSizeBytes() {
        uncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-size')
      },
      get compressedSizeBytes() {
        compressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([hostileArchiveEntry]))

    expect(error).toMatchObject({
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Archive entry paths must be non-empty normalized POSIX paths'
    })
    expect(uncompressedSizeRead).toBe(false)
    expect(compressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('hostile-fragment')
  })

  it('rejects platform-separated archive entry paths before reading size metadata', () => {
    let uncompressedSizeRead = false
    let compressedSizeRead = false
    const hostileArchiveEntry = {
      path: 'pack\\data\\items.json',
      get uncompressedSizeBytes() {
        uncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-size')
      },
      get compressedSizeBytes() {
        compressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([hostileArchiveEntry]))

    expect(error).toMatchObject({
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Archive entry paths must be non-empty normalized POSIX paths'
    })
    expect(uncompressedSizeRead).toBe(false)
    expect(compressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('pack\\\\data')
  })

  it('rejects over-limit archive entry paths before reading size metadata', () => {
    const limits = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS
    const overDepthPath = 'a/'.repeat(limits.maxPathDepth) + 'manifest.json'
    const overBytePath = `${'a'.repeat(limits.maxPathUtf8Bytes + 1)}.json`
    const readState = {
      uncompressedSizeRead: false,
      compressedSizeRead: false
    }
    const createHostileArchiveEntry = (archivePath: string) => ({
      path: archivePath,
      get uncompressedSizeBytes() {
        readState.uncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-path-limit-size')
      },
      get compressedSizeBytes() {
        readState.compressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-path-limit-compressed-size')
      }
    })

    const overDepthError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      createHostileArchiveEntry(overDepthPath)
    ]))
    const overByteError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      createHostileArchiveEntry(overBytePath)
    ]))

    expect(overDepthError).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: `Package path exceeds ${limits.maxPathDepth} segments: ${limits.maxPathDepth + 1}`,
      sourcePath: overDepthPath
    })
    expect(overByteError).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED'
    })
    expect(overByteError.message).toContain(`Package path exceeds ${limits.maxPathUtf8Bytes} UTF-8 bytes`)
    expect(overByteError.sourcePath).toBe(overBytePath)
    expect(readState.uncompressedSizeRead).toBe(false)
    expect(readState.compressedSizeRead).toBe(false)
    for (const error of [overDepthError, overByteError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('archive-path-limit')
    }
  })

  it('rejects non-string archive entry path metadata before coercion or size reads', () => {
    let pathCoerced = false
    let uncompressedSizeRead = false
    let compressedSizeRead = false
    const hostileArchivePath = {
      toString() {
        pathCoerced = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-path-to-string')
      },
      [Symbol.toPrimitive]() {
        pathCoerced = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-path-to-primitive')
      }
    }
    const hostileArchiveEntry = {
      path: hostileArchivePath,
      get uncompressedSizeBytes() {
        uncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-path-uncompressed-size')
      },
      get compressedSizeBytes() {
        compressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-path-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([hostileArchiveEntry]))

    expect(error).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entry path metadata must be a string'
    })
    expect(pathCoerced).toBe(false)
    expect(uncompressedSizeRead).toBe(false)
    expect(compressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-path')
  })

  it('rejects archive path conflicts before reading size metadata', () => {
    let sizeMetadataReadCount = 0
    const createHostileArchiveEntry = (archivePath: string) => ({
      path: archivePath,
      get uncompressedSizeBytes() {
        sizeMetadataReadCount += 1
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-conflict-size')
      },
      get compressedSizeBytes() {
        sizeMetadataReadCount += 1
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-conflict-compressed-size')
      }
    })

    const duplicatePathError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      createHostileArchiveEntry('LENOVO-private-pack/manifest.json'),
      createHostileArchiveEntry('LENOVO-private-pack/manifest.json')
    ]))

    expect(duplicatePathError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Duplicate archive entry path'
    })
    expect(sizeMetadataReadCount).toBe(0)
    expect(JSON.stringify(duplicatePathError)).not.toContain('C:/Users')
    expect(JSON.stringify(duplicatePathError)).not.toContain('LENOVO')
    expect(JSON.stringify(duplicatePathError)).not.toContain('archive-conflict')
    expect(JSON.stringify(duplicatePathError)).not.toContain('private-pack')

    const prefixConflictError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      createHostileArchiveEntry('LENOVO-private-pack'),
      createHostileArchiveEntry('LENOVO-private-pack/manifest.json')
    ]))
    const reversePrefixConflictError = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      createHostileArchiveEntry('LENOVO-private-pack/manifest.json'),
      createHostileArchiveEntry('LENOVO-private-pack')
    ]))

    expect(prefixConflictError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Archive entry path conflicts with another entry directory prefix'
    })
    expect(reversePrefixConflictError).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Archive entry path conflicts with another entry directory prefix'
    })
    expect(sizeMetadataReadCount).toBe(0)
    for (const error of [prefixConflictError, reversePrefixConflictError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('archive-conflict')
      expect(JSON.stringify(error)).not.toContain('private-pack')
    }
  })

  it('rejects duplicate archive paths in normalized path order before reading sorted-later sizes', () => {
    let duplicateSizeReadCount = 0
    let laterUncompressedSizeRead = false
    let laterCompressedSizeRead = false
    const createDuplicateArchiveEntry = () => ({
      path: 'm-pack/manifest.json',
      get uncompressedSizeBytes() {
        duplicateSizeReadCount += 1
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-duplicate-size')
      },
      get compressedSizeBytes() {
        duplicateSizeReadCount += 1
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-duplicate-compressed-size')
      }
    })
    const laterArchiveEntry = {
      path: 'z-pack/manifest.json',
      get uncompressedSizeBytes() {
        laterUncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-duplicate-later-uncompressed-size')
      },
      get compressedSizeBytes() {
        laterCompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-sorted-duplicate-later-compressed-size')
      }
    }

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([
      laterArchiveEntry,
      createDuplicateArchiveEntry(),
      { path: 'a-safe.bin', uncompressedSizeBytes: 0, compressedSizeBytes: 0 },
      createDuplicateArchiveEntry()
    ]))

    expect(error).toMatchObject({
      code: 'SOURCE_DUPLICATE_PATH',
      message: 'Duplicate archive entry path'
    })
    expect(duplicateSizeReadCount).toBe(0)
    expect(laterUncompressedSizeRead).toBe(false)
    expect(laterCompressedSizeRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-sorted-duplicate')
    expect(JSON.stringify(error)).not.toContain('m-pack')
  })

  it('does not read absent optional archive compressed-size metadata', () => {
    let compressedSizeRead = false
    const archiveEntry = new Proxy({ path: 'pack/manifest.json', uncompressedSizeBytes: 0 }, {
      get(target, property, receiver) {
        if (property === 'compressedSizeBytes') {
          compressedSizeRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-compressed-size')
        }
        return Reflect.get(target, property, receiver)
      }
    })

    expect(validateContentPackageSourceArchiveEntries([archiveEntry])).toEqual([
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0 }
    ])
    expect(compressedSizeRead).toBe(false)
  })

  it('rejects unsupported archive entry metadata before own getters can run', () => {
    let pathRead = false
    let uncompressedSizeRead = false
    let extraMetadataRead = false
    const archiveEntry = {}
    Object.defineProperty(archiveEntry, 'path', {
      enumerable: true,
      get() {
        pathRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-extra-path')
      }
    })
    Object.defineProperty(archiveEntry, 'uncompressedSizeBytes', {
      enumerable: true,
      get() {
        uncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-extra-size')
      }
    })
    Object.defineProperty(archiveEntry, 'hostPath', {
      enumerable: true,
      get() {
        extraMetadataRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-extra-hostPath\nhostile-fragment')
      }
    })

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([archiveEntry]))

    expect(error).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entry metadata contains unsupported fields'
    })
    expect(pathRead).toBe(false)
    expect(uncompressedSizeRead).toBe(false)
    expect(extraMetadataRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-extra')
    expect(JSON.stringify(error)).not.toContain('hostile-fragment')
  })

  it('rejects unsupported symbol archive metadata before own getters can run', () => {
    let pathRead = false
    let uncompressedSizeRead = false
    let symbolMetadataRead = false
    const symbolMetadataKey = Symbol('hostPath')
    const archiveEntry = {}
    Object.defineProperty(archiveEntry, 'path', {
      enumerable: true,
      get() {
        pathRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-symbol-path')
      }
    })
    Object.defineProperty(archiveEntry, 'uncompressedSizeBytes', {
      enumerable: true,
      get() {
        uncompressedSizeRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-symbol-size')
      }
    })
    Object.defineProperty(archiveEntry, symbolMetadataKey, {
      enumerable: true,
      get() {
        symbolMetadataRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/archive-symbol-hostPath\nhostile-fragment')
      }
    })

    const error = captureSourceError(() => validateContentPackageSourceArchiveEntries([archiveEntry]))

    expect(error).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Archive entry metadata contains unsupported fields'
    })
    expect(pathRead).toBe(false)
    expect(uncompressedSizeRead).toBe(false)
    expect(symbolMetadataRead).toBe(false)
    expect(JSON.stringify(error)).not.toContain('C:/Users')
    expect(JSON.stringify(error)).not.toContain('LENOVO')
    expect(JSON.stringify(error)).not.toContain('archive-symbol')
    expect(JSON.stringify(error)).not.toContain('hostile-fragment')
  })

  it('freezes normalized directory and archive metadata before exposing safe-read results', () => {
    const directoryEntries = normalizeContentPackageSourceDirectoryEntries([
      { name: 'pack', kind: 'directory', isSymbolicLink: false },
      { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
    ])
    const archiveEntries = validateContentPackageSourceArchiveEntries([
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0 },
      { path: 'pack/data/items.json', uncompressedSizeBytes: 10, compressedSizeBytes: 2 }
    ])

    expect(Object.isFrozen(directoryEntries)).toBe(true)
    expect(Object.isFrozen(directoryEntries[0])).toBe(true)
    expect(Object.isFrozen(directoryEntries[1])).toBe(true)
    expect(Object.isFrozen(archiveEntries)).toBe(true)
    expect(Object.isFrozen(archiveEntries[0])).toBe(true)
    expect(Object.isFrozen(archiveEntries[1])).toBe(true)
    expect(() => {
      (directoryEntries as ContentPackageSourceDirectoryEntry[]).push({
        name: 'mutated',
        kind: 'file',
        isSymbolicLink: false
      })
    }).toThrow(TypeError)
    expect(() => {
      (directoryEntries[0] as { name: string }).name = 'mutated'
    }).toThrow(TypeError)
    expect(() => {
      (archiveEntries as Array<{ path: string; uncompressedSizeBytes: number }>).push({
        path: 'pack/mutated.json',
        uncompressedSizeBytes: 0
      })
    }).toThrow(TypeError)
    expect(() => {
      (archiveEntries[0] as { path: string }).path = 'pack/mutated.json'
    }).toThrow(TypeError)
    expect(directoryEntries.map(entry => entry.name)).toEqual(['manifest.json', 'pack'])
    expect(archiveEntries.map(entry => entry.path)).toEqual(['pack/data/items.json', 'pack/manifest.json'])
  })

  it('detaches validated archive metadata from later host object mutations', () => {
    const hostArchiveEntry = {
      path: 'pack/manifest.json',
      uncompressedSizeBytes: 0,
      compressedSizeBytes: 0
    }
    const archiveEntries = validateContentPackageSourceArchiveEntries([hostArchiveEntry])

    hostArchiveEntry.path = 'pack/mutated.json'
    hostArchiveEntry.uncompressedSizeBytes = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxSingleFileBytes
    hostArchiveEntry.compressedSizeBytes = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxPackageCompressedBytes

    expect(archiveEntries).toEqual([
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0, compressedSizeBytes: 0 }
    ])
    expect(Object.isFrozen(archiveEntries)).toBe(true)
    expect(Object.isFrozen(archiveEntries[0])).toBe(true)
  })

  it('ignores inherited optional archive compressed-size metadata before prototype getters can run', () => {
    const inherited = defineInheritedHostileGetter({
      path: 'pack/manifest.json',
      uncompressedSizeBytes: 0
    }, 'compressedSizeBytes')

    expect(validateContentPackageSourceArchiveEntries([inherited.value])).toEqual([
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0 }
    ])
    expect(inherited.wasRead()).toBe(false)
  })

  it('narrows archive entry metadata from unknown before ZIP payloads can become sources', () => {
    expect(validateContentPackageSourceArchiveEntries([
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0 },
      { path: 'pack/data/items.json', uncompressedSizeBytes: 10, compressedSizeBytes: 2 }
    ] as unknown)).toEqual([
      { path: 'pack/data/items.json', uncompressedSizeBytes: 10, compressedSizeBytes: 2 },
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0 }
    ])

    const hostileInputs: readonly unknown[] = [
      null,
      Array(1),
      createHostileMetadataArray(),
      createHostileArchiveMetadataOwnKeys(),
      { path: 1, uncompressedSizeBytes: 0 },
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0, extra: 'C:/Users/LENOVO/extra' },
      { path: 'pack/manifest.json', uncompressedSizeBytes: 0, [Symbol('host')]: 'C:/Users/LENOVO/symbol' },
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
    const validatedIdentity = validateContentPackageSourceIdentity(source.identity)
    const readIdentity = readContentPackageSourceIdentity(source)

    expect(validatedIdentity).toEqual(source.identity)
    expect(readIdentity).toEqual(source.identity)
    expect(Object.isFrozen(source.identity)).toBe(true)
    expect(Object.isFrozen(validatedIdentity)).toBe(true)
    expect(Object.isFrozen(readIdentity)).toBe(true)
    expect(() => validateContentPackageSourceIdentity({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory\\not-normalized',
      rootPath: 'packs'
    } as never)).toThrow(ContentPackageSourceError)
    for (const { fieldName, patch } of [
      { fieldName: 'sourceId', patch: { sourceId: '' } },
      { fieldName: 'rootPath', patch: { rootPath: '' } }
    ]) {
      const error = captureSourceError(() => validateContentPackageSourceIdentity({
        ...source.identity,
        ...patch
      }))

      expect(error).toMatchObject({
        code: 'SOURCE_IDENTITY_INVALID',
        message: `${fieldName} must be non-empty and already normalized`
      })
    }
    expect(() => createMemoryContentPackageSource({
      sourceId: '',
      rootPath: 'packs',
      files: []
    })).toThrow(ContentPackageSourceError)
    expect(() => createMemoryContentPackageSource({
      sourceId: 'memory/empty-root',
      rootPath: '',
      files: []
    })).toThrow(ContentPackageSourceError)
    for (const { fieldName, sourceId, rootPath } of [
      {
        fieldName: 'sourceId',
        sourceId: 'memory\\not-normalized',
        rootPath: 'packs'
      },
      {
        fieldName: 'rootPath',
        sourceId: 'memory/root-not-normalized',
        rootPath: 'packs\\private'
      }
    ]) {
      const error = captureSourceError(() => createMemoryContentPackageSource({
        sourceId,
        rootPath,
        files: []
      }))

      expect(error).toMatchObject({
        code: 'SOURCE_IDENTITY_INVALID',
        message: `${fieldName} must be non-empty and already normalized`
      })
      expect(JSON.stringify(error)).not.toContain('not-normalized')
      expect(JSON.stringify(error)).not.toContain('private')
      expect(JSON.stringify(error)).not.toContain('\\')
    }
    const controlCharacterIdentityError = captureSourceError(() => validateContentPackageSourceIdentity({
      ...source.identity,
      sourceId: 'memory/source\nsecret'
    }))
    expect(controlCharacterIdentityError).toMatchObject({
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'sourceId must be a normalized relative identifier'
    })
    expect(JSON.stringify(controlCharacterIdentityError)).not.toContain('secret')

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

    for (const unsupportedIdentity of [
      {
        ...source.identity,
        extra: 'C:/Users/LENOVO/mods/identity-extra'
      },
      {
        ...source.identity,
        [Symbol('host')]: 'C:/Users/LENOVO/mods/identity-symbol'
      },
      createHostileIdentityMetadataOwnKeys()
    ]) {
      const error = captureSourceError(() => validateContentPackageSourceIdentity(unsupportedIdentity))

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

    let emptyIdentityInspected = false
    const emptyIdentitySource: ContentPackageSource = {
      ...source,
      identity: {
        ...source.identity,
        rootPath: ''
      },
      async getEntry() {
        emptyIdentityInspected = true
        throw new Error('empty identities must be rejected before source inspection')
      }
    }
    const emptyIdentityReport = await discoverThirdPartyDataPacks(
      'packs',
      createDiscoveryFileSystemFromContentPackageSource(emptyIdentitySource)
    )

    expect(emptyIdentityInspected).toBe(false)
    expect(emptyIdentityReport.status).toBe('directory-not-found')
    expect(emptyIdentityReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_IDENTITY_INVALID',
      message: 'rootPath must be non-empty and already normalized'
    })

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

    let extraIdentityInspected = false
    const extraIdentitySource: ContentPackageSource = {
      ...source,
      identity: {
        ...source.identity,
        extra: 'C:/Users/LENOVO/mods/identity-extra'
      } as ContentPackageSource['identity'],
      async getEntry() {
        extraIdentityInspected = true
        throw new Error('extra identity fields must be rejected before source inspection')
      }
    }
    const extraIdentityReport = await discoverThirdPartyDataPacks(
      'packs',
      createDiscoveryFileSystemFromContentPackageSource(extraIdentitySource)
    )

    expect(extraIdentityInspected).toBe(false)
    expect(extraIdentityReport.status).toBe('directory-not-found')
    expect(extraIdentityReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_IDENTITY_INVALID',
      message: 'Content package source identity metadata contains unsupported fields'
    })
    expect(JSON.stringify(extraIdentityReport)).not.toContain('C:/Users')
    expect(JSON.stringify(extraIdentityReport)).not.toContain('LENOVO')

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

  it('detaches validated source identities from later host identity mutation', () => {
    const hostIdentity: ContentPackageSource['identity'] = {
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/mutable-source-identity',
      rootPath: 'packs'
    }
    const source: ContentPackageSource = {
      get identity(): ContentPackageSource['identity'] {
        return hostIdentity
      },
      async getEntry() {
        throw new Error('identity detachment checks should not inspect entries')
      },
      async readDirectory() {
        throw new Error('identity detachment checks should not list directories')
      },
      async readTextFile() {
        throw new Error('identity detachment checks should not read payloads')
      },
      async dispose() {}
    }

    const validatedIdentity = validateContentPackageSourceIdentity(hostIdentity)
    const readIdentity = readContentPackageSourceIdentity(source)
    const hostIdentityForMutation = hostIdentity as { sourceId: string; rootPath: string }
    hostIdentityForMutation.sourceId = 'C:/Users/LENOVO/mods/mutated-source'
    hostIdentityForMutation.rootPath = 'C:/Users/LENOVO/mods/mutated-root'

    expect(validatedIdentity).toEqual({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/mutable-source-identity',
      rootPath: 'packs'
    })
    expect(readIdentity).toEqual(validatedIdentity)
    expect(validatedIdentity).not.toBe(hostIdentity)
    expect(readIdentity).not.toBe(hostIdentity)
    expect(Object.isFrozen(validatedIdentity)).toBe(true)
    expect(Object.isFrozen(readIdentity)).toBe(true)
    expect(JSON.stringify({ validatedIdentity, readIdentity })).not.toContain('C:/Users')
    expect(JSON.stringify({ validatedIdentity, readIdentity })).not.toContain('LENOVO')
  })

  it('reuses a validated source identity inside the discovery bridge', async() => {
    let identityReads = 0
    const hostOperations: string[] = []
    const source: ContentPackageSource = {
      get identity(): ContentPackageSource['identity'] {
        identityReads += 1
        if (identityReads === 1) {
          return {
            contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
            kind: 'memory',
            sourceId: 'memory/discovery-identity-cache',
            rootPath: 'packs'
          }
        }
        throw new Error('EACCES: lstat C:/Users/LENOVO/mods/identity-after-bridge-validation')
      },
      async getEntry(path) {
        hostOperations.push(`inspect:${path}`)
        if (path === '') return { name: 'packs', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack') return { name: 'pack', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory(path) {
        hostOperations.push(`list:${path}`)
        return path === ''
          ? [{ name: 'pack', kind: 'directory', isSymbolicLink: false }]
          : []
      },
      async readTextFile(path) {
        hostOperations.push(`read:${path}`)
        return toJson(createManifest('discovery_identity_cache'))
      },
      async dispose() {}
    }
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    await expect(fileSystem.getEntry('packs')).resolves.toEqual({
      name: 'packs',
      kind: 'directory',
      isSymbolicLink: false
    })
    await expect(fileSystem.readDirectory('packs')).resolves.toEqual([
      { name: 'pack', kind: 'directory', isSymbolicLink: false }
    ])
    await expect(fileSystem.readTextFile('packs/pack/manifest.json'))
      .resolves.toContain('discovery_identity_cache')

    expect(identityReads).toBe(1)
    expect(hostOperations).toEqual([
      'inspect:',
      'inspect:',
      'list:',
      'inspect:pack/manifest.json',
      'read:pack/manifest.json'
    ])
    expect(JSON.stringify({ hostOperations })).not.toContain('C:/Users')
    expect(JSON.stringify({ hostOperations })).not.toContain('LENOVO')
  })

  it('detaches cached discovery identities from later host identity mutation', async() => {
    let identityReads = 0
    const hostOperations: string[] = []
    const mutableIdentity: ContentPackageSource['identity'] = {
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/mutable-discovery-identity',
      rootPath: 'packs'
    }
    const source: ContentPackageSource = {
      get identity(): ContentPackageSource['identity'] {
        identityReads += 1
        return mutableIdentity
      },
      async getEntry(path) {
        hostOperations.push(`inspect:${path}`)
        if (path === '') return { name: 'packs', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack') return { name: 'pack', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory(path) {
        hostOperations.push(`list:${path}`)
        return path === ''
          ? [{ name: 'pack', kind: 'directory', isSymbolicLink: false }]
          : []
      },
      async readTextFile(path) {
        hostOperations.push(`read:${path}`)
        return toJson(createManifest('mutable_identity_cache'))
      },
      async dispose() {}
    }
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    await expect(fileSystem.getEntry('packs')).resolves.toEqual({
      name: 'packs',
      kind: 'directory',
      isSymbolicLink: false
    })
    const mutableIdentityForMutation = mutableIdentity as { sourceId: string; rootPath: string }
    mutableIdentityForMutation.sourceId = 'C:/Users/LENOVO/mods/mutated-source'
    mutableIdentityForMutation.rootPath = 'C:/Users/LENOVO/mods/mutated-root'

    await expect(fileSystem.readDirectory('packs')).resolves.toEqual([
      { name: 'pack', kind: 'directory', isSymbolicLink: false }
    ])
    await expect(fileSystem.readTextFile('packs/pack/manifest.json'))
      .resolves.toContain('mutable_identity_cache')

    expect(identityReads).toBe(1)
    expect(hostOperations).toEqual([
      'inspect:',
      'inspect:',
      'list:',
      'inspect:pack/manifest.json',
      'read:pack/manifest.json'
    ])
    expect(JSON.stringify({ hostOperations })).not.toContain('C:/Users')
    expect(JSON.stringify({ hostOperations })).not.toContain('LENOVO')
  })

  it('keeps cached discovery identities while revoked sources stay structured and path-free', async() => {
    let identityReads = 0
    let revoked = false
    const hostOperations: string[] = []
    const source: ContentPackageSource = {
      get identity(): ContentPackageSource['identity'] {
        identityReads += 1
        if (identityReads === 1) {
          return {
            contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
            kind: 'memory',
            sourceId: 'memory/revoked-after-bridge-validation',
            rootPath: 'packs'
          }
        }
        throw new Error('EACCES: lstat C:/Users/LENOVO/mods/identity-after-revocation')
      },
      async getEntry(path) {
        hostOperations.push(`inspect:${path}`)
        if (revoked) {
          throw new ContentPackageSourceError(
            'SOURCE_PERMISSION_REVOKED',
            `EACCES: lstat C:/Users/LENOVO/mods/${path}`,
            path
          )
        }
        if (path === '') return { name: 'packs', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack/manifest.json') return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        return null
      },
      async readDirectory() {
        throw new Error('revoked bridge sources must stop before directory reads')
      },
      async readTextFile() {
        throw new Error('revoked bridge sources must stop before payload reads')
      },
      async dispose() {}
    }
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    await expect(fileSystem.getEntry('packs')).resolves.toEqual({
      name: 'packs',
      kind: 'directory',
      isSymbolicLink: false
    })
    revoked = true

    const bridgedReadError = await captureAsyncSourceError(() => fileSystem.readTextFile('packs/pack/manifest.json'))
    const discoveryReport = await discoverThirdPartyDataPacks('packs', fileSystem)

    expect(identityReads).toBe(1)
    expect(bridgedReadError).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source inspect operation failed',
      sourcePath: 'pack/manifest.json'
    })
    expect(discoveryReport.status).toBe('directory-not-found')
    expect(discoveryReport.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source inspect operation failed'
    })
    expect(discoveryReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source inspect operation failed',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    expect(hostOperations).toEqual([
      'inspect:',
      'inspect:pack/manifest.json',
      'inspect:'
    ])
    for (const result of [bridgedReadError, discoveryReport, { hostOperations }]) {
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
      expect(JSON.stringify(result)).not.toContain('identity-after-revocation')
    }
  })

  it('keeps cached discovery identities while disposed sources stay structured and path-free', async() => {
    let identityReads = 0
    let disposed = false
    const hostOperations: string[] = []
    const source: ContentPackageSource = {
      get identity(): ContentPackageSource['identity'] {
        identityReads += 1
        if (identityReads === 1) {
          return {
            contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
            kind: 'memory',
            sourceId: 'memory/disposed-after-bridge-validation',
            rootPath: 'packs'
          }
        }
        throw new Error('EACCES: lstat C:/Users/LENOVO/mods/identity-after-disposal')
      },
      async getEntry(path) {
        hostOperations.push(`inspect:${path}`)
        if (disposed) {
          throw new ContentPackageSourceError(
            'SOURCE_DISPOSED',
            `EACCES: lstat C:/Users/LENOVO/mods/${path}`,
            path
          )
        }
        if (path === '') return { name: 'packs', kind: 'directory', isSymbolicLink: false }
        if (path === 'pack/manifest.json') return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        return null
      },
      async readDirectory() {
        throw new Error('disposed bridge sources must stop before directory reads')
      },
      async readTextFile() {
        throw new Error('disposed bridge sources must stop before payload reads')
      },
      async dispose() {
        disposed = true
      }
    }
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    await expect(fileSystem.getEntry('packs')).resolves.toEqual({
      name: 'packs',
      kind: 'directory',
      isSymbolicLink: false
    })
    await source.dispose()

    const bridgedReadError = await captureAsyncSourceError(() => fileSystem.readTextFile('packs/pack/manifest.json'))
    const discoveryReport = await discoverThirdPartyDataPacks('packs', fileSystem)

    expect(identityReads).toBe(1)
    expect(bridgedReadError).toMatchObject({
      code: 'SOURCE_DISPOSED',
      message: 'Content package source inspect operation failed',
      sourcePath: 'pack/manifest.json'
    })
    expect(discoveryReport.status).toBe('directory-not-found')
    expect(discoveryReport.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source inspect operation failed'
    })
    expect(discoveryReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source inspect operation failed',
      sourceCode: 'SOURCE_DISPOSED'
    })
    expect(hostOperations).toEqual([
      'inspect:',
      'inspect:pack/manifest.json',
      'inspect:'
    ])
    for (const result of [bridgedReadError, discoveryReport, { hostOperations }]) {
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
      expect(JSON.stringify(result)).not.toContain('identity-after-disposal')
    }
  })

  it('keeps cached discovery identities when payload reads become unavailable', async() => {
    const cases = [
      {
        label: 'revocation',
        code: 'SOURCE_PERMISSION_REVOKED' as const,
        sourceId: 'memory/bridge-read-revoked-after-validation'
      },
      {
        label: 'disposal',
        code: 'SOURCE_DISPOSED' as const,
        sourceId: 'memory/bridge-read-disposed-after-validation'
      }
    ]

    for (const lifecycleCase of cases) {
      let identityReads = 0
      let payloadUnavailable = false
      const hostOperations: string[] = []
      const source: ContentPackageSource = {
        get identity(): ContentPackageSource['identity'] {
          identityReads += 1
          if (identityReads === 1) {
            return {
              contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
              kind: 'memory',
              sourceId: lifecycleCase.sourceId,
              rootPath: 'packs'
            }
          }
          throw new Error(`EACCES: lstat C:/Users/LENOVO/mods/bridge-identity-after-read-${lifecycleCase.label}`)
        },
        async getEntry(path) {
          hostOperations.push(`inspect:${path}`)
          if (path === '') return { name: 'packs', kind: 'directory', isSymbolicLink: false }
          if (path === 'pack') return { name: 'pack', kind: 'directory', isSymbolicLink: false }
          if (path === 'pack/manifest.json') {
            return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
          }
          return null
        },
        async readDirectory(path) {
          hostOperations.push(`list:${path}`)
          return path === ''
            ? [{ name: 'pack', kind: 'directory', isSymbolicLink: false }]
            : []
        },
        async readTextFile(path) {
          hostOperations.push(`read:${path}`)
          if (payloadUnavailable) {
            throw new ContentPackageSourceError(
              lifecycleCase.code,
              `EACCES: open C:/Users/LENOVO/mods/${path}`,
              path
            )
          }
          return toJson(createManifest('bridge_read_lifecycle'))
        },
        async dispose() {
          payloadUnavailable = true
        }
      }
      const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

      await expect(fileSystem.getEntry('packs')).resolves.toEqual({
        name: 'packs',
        kind: 'directory',
        isSymbolicLink: false
      })
      if (lifecycleCase.code === 'SOURCE_DISPOSED') {
        await source.dispose()
      } else {
        payloadUnavailable = true
      }

      const bridgedReadError = await captureAsyncSourceError(() => fileSystem.readTextFile('packs/pack/manifest.json'))
      const discoveryReport = await discoverThirdPartyDataPacks('packs', fileSystem)

      expect(identityReads).toBe(1)
      expect(bridgedReadError).toMatchObject({
        code: lifecycleCase.code,
        message: 'Content package source read operation failed',
        sourcePath: 'pack/manifest.json'
      })
      expect(discoveryReport.status).toBe('completed')
      expect(discoveryReport.candidates[0]).toMatchObject({
        path: 'pack',
        status: 'invalid'
      })
      expect(discoveryReport.candidates[0]?.issues[0]).toMatchObject({
        kind: 'file-read-failed',
        path: 'pack/manifest.json',
        candidatePath: 'pack',
        reason: 'Package source read operation failed'
      })
      expect(discoveryReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
        message: 'Content package source read operation failed',
        sourceCode: lifecycleCase.code
      })
      expect(hostOperations).toContain('read:pack/manifest.json')
      for (const result of [bridgedReadError, discoveryReport, { hostOperations }]) {
        expect(JSON.stringify(result)).not.toContain('C:/Users')
        expect(JSON.stringify(result)).not.toContain('LENOVO')
        expect(JSON.stringify(result)).not.toContain(`bridge-identity-after-read-${lifecycleCase.label}`)
      }
    }
  })

  it('keeps cached discovery identities when directory listings become unavailable', async() => {
    const cases = [
      {
        label: 'revocation',
        code: 'SOURCE_PERMISSION_REVOKED' as const,
        sourceId: 'memory/bridge-list-revoked-after-validation'
      },
      {
        label: 'disposal',
        code: 'SOURCE_DISPOSED' as const,
        sourceId: 'memory/bridge-list-disposed-after-validation'
      }
    ]

    for (const lifecycleCase of cases) {
      let identityReads = 0
      let listingUnavailable = false
      const hostOperations: string[] = []
      const source: ContentPackageSource = {
        get identity(): ContentPackageSource['identity'] {
          identityReads += 1
          if (identityReads === 1) {
            return {
              contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
              kind: 'memory',
              sourceId: lifecycleCase.sourceId,
              rootPath: 'packs'
            }
          }
          throw new Error(`EACCES: lstat C:/Users/LENOVO/mods/bridge-identity-after-list-${lifecycleCase.label}`)
        },
        async getEntry(path) {
          hostOperations.push(`inspect:${path}`)
          if (path === '') return { name: 'packs', kind: 'directory', isSymbolicLink: false }
          if (path === 'pack') return { name: 'pack', kind: 'directory', isSymbolicLink: false }
          return null
        },
        async readDirectory(path) {
          hostOperations.push(`list:${path}`)
          if (listingUnavailable) {
            throw new ContentPackageSourceError(
              lifecycleCase.code,
              `EACCES: scandir C:/Users/LENOVO/mods/${path}`,
              path
            )
          }
          return path === ''
            ? [{ name: 'pack', kind: 'directory', isSymbolicLink: false }]
            : [{ name: 'manifest.json', kind: 'file', isSymbolicLink: false }]
        },
        async readTextFile() {
          throw new Error('directory listing lifecycle checks should not read payloads')
        },
        async dispose() {
          listingUnavailable = true
        }
      }
      const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

      await expect(fileSystem.getEntry('packs')).resolves.toEqual({
        name: 'packs',
        kind: 'directory',
        isSymbolicLink: false
      })
      if (lifecycleCase.code === 'SOURCE_DISPOSED') {
        await source.dispose()
      } else {
        listingUnavailable = true
      }

      const bridgedListError = await captureAsyncSourceError(() => fileSystem.readDirectory('packs/pack'))
      const discoveryReport = await discoverThirdPartyDataPacks('packs', fileSystem)

      expect(identityReads).toBe(1)
      expect(bridgedListError).toMatchObject({
        code: lifecycleCase.code,
        message: 'Content package source list operation failed',
        sourcePath: 'pack'
      })
      expect(discoveryReport.status).toBe('directory-not-found')
      expect(discoveryReport.issues[0]).toMatchObject({
        kind: 'file-read-failed',
        severity: 'fatal',
        path: '.',
        reason: 'Package source list operation failed'
      })
      expect(discoveryReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
        message: 'Content package source list operation failed',
        sourceCode: lifecycleCase.code
      })
      expect(hostOperations).toEqual([
        'inspect:',
        'inspect:pack',
        'list:pack',
        'inspect:',
        'inspect:',
        'list:'
      ])
      for (const result of [bridgedListError, discoveryReport, { hostOperations }]) {
        expect(JSON.stringify(result)).not.toContain('C:/Users')
        expect(JSON.stringify(result)).not.toContain('LENOVO')
        expect(JSON.stringify(result)).not.toContain(`bridge-identity-after-list-${lifecycleCase.label}`)
      }
    }
  })

  it('reuses a validated source identity for direct JSON reads', async() => {
    let identityReads = 0
    const hostOperations: string[] = []
    const source: ContentPackageSource = {
      get identity(): ContentPackageSource['identity'] {
        identityReads += 1
        if (identityReads === 1) {
          return {
            contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
            kind: 'memory',
            sourceId: 'memory/direct-json-identity-cache',
            rootPath: 'packs'
          }
        }
        throw new Error('EACCES: lstat C:/Users/LENOVO/mods/direct-json-identity')
      },
      async getEntry(path) {
        hostOperations.push(`inspect:${path}`)
        if (path === 'pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory() {
        throw new Error('direct JSON reads should not list directories')
      },
      async readTextFile(path) {
        hostOperations.push(`read:${path}`)
        return toJson(createManifest('direct_json_identity_cache'))
      },
      async dispose() {}
    }
    const sourceIdentity = readContentPackageSourceIdentity(source)

    const result = await readContentPackageSourceJson(
      source,
      'pack/manifest.json',
      CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
      sourceIdentity
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toMatchObject({ id: 'direct_json_identity_cache' })
    }
    expect(identityReads).toBe(1)
    expect(hostOperations).toEqual([
      'inspect:pack/manifest.json',
      'read:pack/manifest.json'
    ])
    expect(JSON.stringify({ result, hostOperations })).not.toContain('C:/Users')
    expect(JSON.stringify({ result, hostOperations })).not.toContain('LENOVO')
  })

  it('revalidates caller-provided direct JSON identities before inspecting source entries', async() => {
    let identityReads = 0
    let rootPathRead = false
    let inspected = false
    const source: ContentPackageSource = {
      get identity(): ContentPackageSource['identity'] {
        identityReads += 1
        throw new Error('source identity must not be read when caller supplies identity')
      },
      async getEntry() {
        inspected = true
        throw new Error('invalid caller identities must be rejected before source inspection')
      },
      async readDirectory() {
        throw new Error('invalid caller identities must not list directories')
      },
      async readTextFile() {
        throw new Error('invalid caller identities must not read payloads')
      },
      async dispose() {}
    }
    const hostileCallerIdentity = {
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/direct-json-hostile-caller-identity'
    }
    Object.defineProperty(hostileCallerIdentity, 'rootPath', {
      enumerable: true,
      get() {
        rootPathRead = true
        throw new Error('EACCES: lstat C:/Users/LENOVO/mods/direct-json-caller-identity')
      }
    })

    const result = await readContentPackageSourceJson(
      source,
      'pack/manifest.json',
      CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
      hostileCallerIdentity
    )

    expect(result).toMatchObject({
      ok: false,
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Content package source identity metadata could not be read'
    })
    expect(identityReads).toBe(0)
    expect(rootPathRead).toBe(true)
    expect(inspected).toBe(false)
    expect(JSON.stringify(result)).not.toContain('C:/Users')
    expect(JSON.stringify(result)).not.toContain('LENOVO')
    expect(JSON.stringify(result)).not.toContain('direct-json-caller-identity')

    let ownKeysRead = false
    const unreadableCallerIdentity = new Proxy({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/direct-json-unreadable-caller-identity',
      rootPath: 'packs'
    }, {
      ownKeys() {
        ownKeysRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/direct-json-caller-ownKeys')
      }
    })

    const unreadableResult = await readContentPackageSourceJson(
      source,
      'pack/manifest.json',
      CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
      unreadableCallerIdentity
    )

    expect(unreadableResult).toMatchObject({
      ok: false,
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Content package source identity metadata could not be read'
    })
    expect(identityReads).toBe(0)
    expect(ownKeysRead).toBe(true)
    expect(inspected).toBe(false)
    expect(JSON.stringify(unreadableResult)).not.toContain('C:/Users')
    expect(JSON.stringify(unreadableResult)).not.toContain('LENOVO')
    expect(JSON.stringify(unreadableResult)).not.toContain('ownKeys')
    expect(JSON.stringify(unreadableResult)).not.toContain('direct-json-unreadable-caller-identity')

    let inheritedRootPathRead = false
    const inheritedIdentityPrototype = {}
    Object.defineProperty(inheritedIdentityPrototype, 'rootPath', {
      enumerable: true,
      get() {
        inheritedRootPathRead = true
        throw new Error('EACCES: inherited C:/Users/LENOVO/mods/direct-json-caller-rootPath')
      }
    })
    const inheritedCallerIdentity = Object.create(inheritedIdentityPrototype)
    Object.assign(inheritedCallerIdentity, {
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/direct-json-inherited-caller-identity'
    })

    const inheritedResult = await readContentPackageSourceJson(
      source,
      'pack/manifest.json',
      CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
      inheritedCallerIdentity
    )

    expect(inheritedResult).toMatchObject({
      ok: false,
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Content package source identity metadata must include contractVersion, kind, sourceId and rootPath own fields'
    })
    expect(identityReads).toBe(0)
    expect(inheritedRootPathRead).toBe(false)
    expect(inspected).toBe(false)
    expect(JSON.stringify(inheritedResult)).not.toContain('C:/Users')
    expect(JSON.stringify(inheritedResult)).not.toContain('LENOVO')
    expect(JSON.stringify(inheritedResult)).not.toContain('direct-json-caller-rootPath')

    const hiddenCallerIdentity = defineHiddenHostileGetter({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/direct-json-hidden-caller-identity'
    }, 'rootPath')

    const hiddenResult = await readContentPackageSourceJson(
      source,
      'pack/manifest.json',
      CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
      hiddenCallerIdentity.value
    )

    expect(hiddenResult).toMatchObject({
      ok: false,
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Content package source identity metadata contains unsupported fields'
    })
    expect(identityReads).toBe(0)
    expect(hiddenCallerIdentity.wasRead()).toBe(false)
    expect(inspected).toBe(false)
    expect(JSON.stringify(hiddenResult)).not.toContain('C:/Users')
    expect(JSON.stringify(hiddenResult)).not.toContain('LENOVO')
    expect(JSON.stringify(hiddenResult)).not.toContain('direct-json-hidden-caller-identity')

    let extraHostPathRead = false
    const extraFieldCallerIdentity = {
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/direct-json-extra-caller-identity',
      rootPath: 'packs'
    }
    Object.defineProperty(extraFieldCallerIdentity, 'hostPath', {
      enumerable: true,
      get() {
        extraHostPathRead = true
        throw new Error('EACCES: stat C:/Users/LENOVO/mods/direct-json-caller-hostPath')
      }
    })

    const extraFieldResult = await readContentPackageSourceJson(
      source,
      'pack/manifest.json',
      CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
      extraFieldCallerIdentity
    )

    expect(extraFieldResult).toMatchObject({
      ok: false,
      code: 'SOURCE_IDENTITY_INVALID',
      message: 'Content package source identity metadata contains unsupported fields'
    })
    expect(identityReads).toBe(0)
    expect(extraHostPathRead).toBe(false)
    expect(inspected).toBe(false)
    expect(JSON.stringify(extraFieldResult)).not.toContain('C:/Users')
    expect(JSON.stringify(extraFieldResult)).not.toContain('LENOVO')
    expect(JSON.stringify(extraFieldResult)).not.toContain('hostPath')
    expect(JSON.stringify(extraFieldResult)).not.toContain('direct-json-extra-caller-identity')
  })

  it('detaches caller-provided direct JSON identities from later caller object mutation', async() => {
    const callerIdentity = {
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'memory',
      sourceId: 'memory/direct-json-mutable-caller-identity',
      rootPath: 'packs'
    }
    const hostOperations: string[] = []
    const source: ContentPackageSource = {
      get identity(): ContentPackageSource['identity'] {
        throw new Error('source identity must not be read when caller supplies identity')
      },
      async getEntry(path) {
        hostOperations.push(`inspect:${path}`)
        callerIdentity.sourceId = 'C:/Users/LENOVO/mods/mutated-direct-json-caller-sourceId'
        callerIdentity.rootPath = 'C:/Users/LENOVO/mods/mutated-direct-json-caller-rootPath'
        if (path === 'pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory() {
        throw new Error('direct JSON identity mutation checks should not list directories')
      },
      async readTextFile(path) {
        hostOperations.push(`read:${path}`)
        return toJson(createManifest('direct_json_mutable_caller_identity'))
      },
      async dispose() {}
    }

    const result = await readContentPackageSourceJson(
      source,
      'pack/manifest.json',
      CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
      callerIdentity
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toMatchObject({ id: 'direct_json_mutable_caller_identity' })
    }
    expect(hostOperations).toEqual([
      'inspect:pack/manifest.json',
      'read:pack/manifest.json'
    ])
    expect(JSON.stringify({ result, hostOperations })).not.toContain('C:/Users')
    expect(JSON.stringify({ result, hostOperations })).not.toContain('LENOVO')
    expect(JSON.stringify({ result, hostOperations })).not.toContain('mutated-direct-json-caller')
  })

  it('keeps caller-validated direct JSON identities while unavailable sources stay structured and path-free', async() => {
    const cases = [
      {
        label: 'revocation',
        code: 'SOURCE_PERMISSION_REVOKED' as const,
        sourceId: 'memory/direct-json-revoked-after-validation'
      },
      {
        label: 'disposal',
        code: 'SOURCE_DISPOSED' as const,
        sourceId: 'memory/direct-json-disposed-after-validation'
      }
    ]

    for (const lifecycleCase of cases) {
      let identityReads = 0
      let unavailable = false
      const hostOperations: string[] = []
      const source: ContentPackageSource = {
        get identity(): ContentPackageSource['identity'] {
          identityReads += 1
          if (identityReads === 1) {
            return {
              contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
              kind: 'memory',
              sourceId: lifecycleCase.sourceId,
              rootPath: 'packs'
            }
          }
          throw new Error(`EACCES: lstat C:/Users/LENOVO/mods/identity-after-${lifecycleCase.label}`)
        },
        async getEntry(path) {
          hostOperations.push(`inspect:${path}`)
          if (unavailable) {
            throw new ContentPackageSourceError(
              lifecycleCase.code,
              `EACCES: lstat C:/Users/LENOVO/mods/${path}`,
              path
            )
          }
          if (path === 'pack/manifest.json') {
            return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
          }
          return null
        },
        async readDirectory() {
          throw new Error('direct JSON lifecycle checks should not list directories')
        },
        async readTextFile() {
          throw new Error('unavailable direct JSON sources must stop before payload reads')
        },
        async dispose() {
          unavailable = true
        }
      }
      const sourceIdentity = readContentPackageSourceIdentity(source)
      if (lifecycleCase.code === 'SOURCE_DISPOSED') {
        await source.dispose()
      } else {
        unavailable = true
      }

      const result = await readContentPackageSourceJson(
        source,
        'pack/manifest.json',
        CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
        sourceIdentity
      )

      expect(result).toMatchObject({
        ok: false,
        code: lifecycleCase.code,
        message: 'Content package source inspect operation failed'
      })
      expect(identityReads).toBe(1)
      expect(hostOperations).toEqual(['inspect:pack/manifest.json'])
      for (const observable of [result, { hostOperations }]) {
        expect(JSON.stringify(observable)).not.toContain('C:/Users')
        expect(JSON.stringify(observable)).not.toContain('LENOVO')
        expect(JSON.stringify(observable)).not.toContain(`identity-after-${lifecycleCase.label}`)
      }
    }
  })

  it('keeps caller-validated direct JSON identities when payload reads become unavailable', async() => {
    const cases = [
      {
        label: 'revocation',
        code: 'SOURCE_PERMISSION_REVOKED' as const,
        sourceId: 'memory/direct-json-read-revoked-after-validation'
      },
      {
        label: 'disposal',
        code: 'SOURCE_DISPOSED' as const,
        sourceId: 'memory/direct-json-read-disposed-after-validation'
      }
    ]

    for (const lifecycleCase of cases) {
      let identityReads = 0
      let payloadUnavailable = false
      const hostOperations: string[] = []
      const source: ContentPackageSource = {
        get identity(): ContentPackageSource['identity'] {
          identityReads += 1
          if (identityReads === 1) {
            return {
              contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
              kind: 'memory',
              sourceId: lifecycleCase.sourceId,
              rootPath: 'packs'
            }
          }
          throw new Error(`EACCES: lstat C:/Users/LENOVO/mods/identity-after-read-${lifecycleCase.label}`)
        },
        async getEntry(path) {
          hostOperations.push(`inspect:${path}`)
          if (path === 'pack/manifest.json') {
            return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
          }
          return null
        },
        async readDirectory() {
          throw new Error('direct JSON read lifecycle checks should not list directories')
        },
        async readTextFile(path) {
          hostOperations.push(`read:${path}`)
          if (payloadUnavailable) {
            throw new ContentPackageSourceError(
              lifecycleCase.code,
              `EACCES: open C:/Users/LENOVO/mods/${path}`,
              path
            )
          }
          return toJson(createManifest('direct_json_read_lifecycle'))
        },
        async dispose() {
          payloadUnavailable = true
        }
      }
      const sourceIdentity = readContentPackageSourceIdentity(source)
      if (lifecycleCase.code === 'SOURCE_DISPOSED') {
        await source.dispose()
      } else {
        payloadUnavailable = true
      }

      const result = await readContentPackageSourceJson(
        source,
        'pack/manifest.json',
        CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
        sourceIdentity
      )

      expect(result).toMatchObject({
        ok: false,
        code: lifecycleCase.code,
        message: 'Content package source read operation failed'
      })
      expect(identityReads).toBe(1)
      expect(hostOperations).toEqual([
        'inspect:pack/manifest.json',
        'read:pack/manifest.json'
      ])
      for (const observable of [result, { hostOperations }]) {
        expect(JSON.stringify(observable)).not.toContain('C:/Users')
        expect(JSON.stringify(observable)).not.toContain('LENOVO')
        expect(JSON.stringify(observable)).not.toContain(`identity-after-read-${lifecycleCase.label}`)
      }
    }
  })

  it('keeps file payloads as unknown pure JSON before TypeBox validation', async() => {
    const source = createMemoryContentPackageSource({
      sourceId: 'memory/json-source',
      rootPath: 'packs',
      files: [
        { path: 'pack/manifest.json', text: toJson(createManifest('json_source')) },
        { path: 'pack/broken.json', text: '{ bad json' },
        {
          path: 'pack/host-path-fragment.json',
          text: 'C:/Users/LENOVO/private-pack/manifest.json\nhostile-fragment'
        }
      ]
    })

    const valid = await readContentPackageSourceJson(source, 'pack/manifest.json')
    const invalid = await readContentPackageSourceJson(source, 'pack/broken.json')
    const unsafeInvalid = await readContentPackageSourceJson(source, 'pack/host-path-fragment.json')
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
    expect(unsafeInvalid).toMatchObject({
      ok: false,
      code: 'SOURCE_JSON_PARSE_FAILED',
      message: 'JSON parsing failed'
    })
    expect(JSON.stringify(unsafeInvalid)).not.toContain('C:/Users')
    expect(JSON.stringify(unsafeInvalid)).not.toContain('LENOVO')
    expect(JSON.stringify(unsafeInvalid)).not.toContain('hostile-fragment')
    expect(oversized).toMatchObject({
      ok: false,
      code: 'SOURCE_LIMIT_EXCEEDED'
    })
  })

  it('does not stringify object JSON parse failures before direct JSON diagnostics', async() => {
    const source = createMemoryContentPackageSource({
      sourceId: 'memory/json-parse-object-failure',
      rootPath: 'packs',
      files: [
        { path: 'pack/manifest.json', text: toJson(createManifest('json_parse_object_failure')) }
      ]
    })
    let inheritedMessageRead = false
    let stringified = false
    const prototype = {}
    Object.defineProperty(prototype, 'message', {
      enumerable: true,
      get() {
        inheritedMessageRead = true
        throw new Error('EACCES: inherited C:/Users/LENOVO/mods/json-parse-message')
      }
    })
    const parseFailure = Object.create(prototype) as { toString: () => string }
    Object.defineProperty(parseFailure, 'toString', {
      enumerable: true,
      value() {
        stringified = true
        return 'C:/Users/LENOVO/mods/json-parse-to-string\nhostile-fragment'
      }
    })
    const parseSpy = vi.spyOn(JSON, 'parse').mockImplementationOnce(() => {
      throw parseFailure
    })

    try {
      const result = await readContentPackageSourceJson(source, 'pack/manifest.json')

      expect(result).toMatchObject({
        ok: false,
        code: 'SOURCE_JSON_PARSE_FAILED',
        message: 'JSON parsing failed'
      })
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
      expect(JSON.stringify(result)).not.toContain('hostile-fragment')
      expect(parseSpy).toHaveBeenCalledTimes(1)
    } finally {
      parseSpy.mockRestore()
    }

    expect(inheritedMessageRead).toBe(false)
    expect(stringified).toBe(false)
  })

  it('freezes direct JSON read result graphs before callers validate data', async() => {
    const source = createMemoryContentPackageSource({
      sourceId: 'memory/frozen-json-result',
      rootPath: 'packs',
      files: [
        {
          path: 'pack/manifest.json',
          text: toJson({
            ...createManifest('frozen_json_result'),
            authors: [{ name: 'Frozen Result Tester', role: 'developer' }]
          })
        },
        { path: 'pack/broken.json', text: '{ bad json' }
      ]
    })

    const valid = await readContentPackageSourceJson(source, 'pack/manifest.json')
    const invalid = await readContentPackageSourceJson(source, 'pack/broken.json')
    const sourceError = await readContentPackageSourceJson(source, '../userdata/settings.json')
    const beforeMutation = JSON.stringify({ valid, invalid, sourceError })

    expect(valid.ok).toBe(true)
    expect(invalid).toMatchObject({
      ok: false,
      code: 'SOURCE_JSON_PARSE_FAILED'
    })
    expect(sourceError).toMatchObject({
      ok: false,
      code: 'SOURCE_PATH_UNSAFE'
    })
    expect(Object.isFrozen(valid)).toBe(true)
    expect(Object.isFrozen(invalid)).toBe(true)
    expect(Object.isFrozen(sourceError)).toBe(true)

    if (!valid.ok) throw new Error('Expected direct JSON read to succeed.')
    const manifest = valid.data as {
      id: string
      name: { fallback: string }
      authors: Array<{ name: string; role: string }>
    }
    expect(Object.isFrozen(manifest)).toBe(true)
    expect(Object.isFrozen(manifest.name)).toBe(true)
    expect(Object.isFrozen(manifest.authors)).toBe(true)
    expect(Object.isFrozen(manifest.authors[0])).toBe(true)

    expect(Reflect.set(manifest, 'id', 'mutated')).toBe(false)
    expect(Reflect.set(manifest.name, 'fallback', 'mutated')).toBe(false)
    expect(() => manifest.authors.push({ name: 'Mutated', role: 'developer' })).toThrow(TypeError)
    expect(Reflect.set(invalid as unknown as Record<string, unknown>, 'message', 'mutated')).toBe(false)
    expect(Reflect.set(sourceError as unknown as Record<string, unknown>, 'code', 'SOURCE_ENTRY_NOT_FOUND')).toBe(false)
    expect(JSON.stringify({ valid, invalid, sourceError })).toBe(beforeMutation)
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

  it('redacts unsafe text payload source paths before helper errors expose host text', () => {
    const hostileSourcePath = 'C:/Users/LENOVO/mods/private-pack/manifest.json\nhostile-fragment'
    const malformedPayloadError = captureSourceError(() =>
      assertContentPackageSourceTextWithinLimits(
        { leaked: 'C:/Users/LENOVO/private-pack/manifest.json' } as never,
        hostileSourcePath
      )
    )
    const oversizedPayloadError = captureSourceError(() =>
      assertContentPackageSourceTextWithinLimits('xx', hostileSourcePath, {
        ...CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS,
        maxSingleFileBytes: 1
      })
    )
    const safeSourcePathError = captureSourceError(() =>
      assertContentPackageSourceTextWithinLimits({ leaked: true } as never, 'pack/manifest.json')
    )

    expect(malformedPayloadError).toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source text payload must be a string'
    })
    expect(malformedPayloadError.sourcePath).toBeUndefined()
    expect(oversizedPayloadError).toMatchObject({
      code: 'SOURCE_LIMIT_EXCEEDED',
      message: 'Source text file exceeds 1 bytes: 2'
    })
    expect(oversizedPayloadError.sourcePath).toBeUndefined()
    expect(safeSourcePathError.sourcePath).toBe('pack/manifest.json')
    for (const error of [malformedPayloadError, oversizedPayloadError]) {
      expect(JSON.stringify(error)).not.toContain('C:/Users')
      expect(JSON.stringify(error)).not.toContain('LENOVO')
      expect(JSON.stringify(error)).not.toContain('hostile-fragment')
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

  it('freezes bridged discovery directory listing outputs before callers can mutate them', async() => {
    const rawEntry: { name: string; kind: 'file'; isSymbolicLink: boolean } = {
      name: 'manifest.json',
      kind: 'file',
      isSymbolicLink: false
    }
    const source = createMetadataGuardSource({
      'pack/valid-dir': { kind: 'directory', isSymbolicLink: false }
    }, {
      directoryEntries: [rawEntry]
    })
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    const entries = await fileSystem.readDirectory('packs/pack/valid-dir')
    const serializedBeforeMutationAttempts = JSON.stringify(entries)

    expect(Object.isFrozen(entries)).toBe(true)
    expect(Object.isFrozen(entries[0])).toBe(true)
    expect(() => {
      (entries as ContentPackageSourceDirectoryEntry[]).push({
        name: 'mutated.json',
        kind: 'file',
        isSymbolicLink: false
      })
    }).toThrow(TypeError)
    expect(() => {
      (entries[0] as { name: string }).name = 'mutated.json'
    }).toThrow(TypeError)

    rawEntry.name = 'LENOVO-private-entry.json'

    expect(JSON.stringify(entries)).toBe(serializedBeforeMutationAttempts)
    expect(JSON.stringify(entries)).not.toContain('LENOVO-private-entry')
  })

  it('keeps source preflight diagnostic messages path-free', async() => {
    const outsideRootDirectoryReadAttempts: string[] = []
    const source = createMetadataGuardSource({
      'LENOVO-private-pack/missing.json': null,
      'LENOVO-private-pack/directory.json': { kind: 'directory', isSymbolicLink: false },
      'LENOVO-private-pack/symlink.json': { kind: 'file', isSymbolicLink: true },
      'LENOVO-private-pack/file-as-dir': { kind: 'file', isSymbolicLink: false }
    }, {
      directoryReadAttempted: path => {
        outsideRootDirectoryReadAttempts.push(path)
      }
    })
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    const directMissing = await readContentPackageSourceJson(source, 'LENOVO-private-pack/missing.json')
    const directDirectory = await readContentPackageSourceJson(source, 'LENOVO-private-pack/directory.json')
    const directSymlink = await readContentPackageSourceJson(source, 'LENOVO-private-pack/symlink.json')
    const bridgedMissing = await captureAsyncSourceError(() =>
      fileSystem.readTextFile('packs/LENOVO-private-pack/missing.json')
    )
    const bridgedDirectory = await captureAsyncSourceError(() =>
      fileSystem.readTextFile('packs/LENOVO-private-pack/directory.json')
    )
    const bridgedSymlink = await captureAsyncSourceError(() =>
      fileSystem.readTextFile('packs/LENOVO-private-pack/symlink.json')
    )
    const bridgedFileAsDirectory = await captureAsyncSourceError(() =>
      fileSystem.readDirectory('packs/LENOVO-private-pack/file-as-dir')
    )
    const bridgedOutsideRoot = await captureAsyncSourceError(() =>
      fileSystem.getEntry('LENOVO-private-root/manifest.json')
    )
    const bridgedOutsideRootDirectory = await captureAsyncSourceError(() =>
      fileSystem.readDirectory('LENOVO-private-root')
    )

    expect(directMissing).toMatchObject({
      ok: false,
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: 'Source path was not found'
    })
    expect(directDirectory).toMatchObject({
      ok: false,
      code: 'SOURCE_ENTRY_NOT_FILE',
      message: 'Source path is not a file'
    })
    expect(directSymlink).toMatchObject({
      ok: false,
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Source path must not be a symbolic link'
    })
    expect(bridgedMissing).toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: 'Source path was not found',
      sourcePath: 'LENOVO-private-pack/missing.json'
    })
    expect(bridgedDirectory).toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FILE',
      message: 'Source path is not a file',
      sourcePath: 'LENOVO-private-pack/directory.json'
    })
    expect(bridgedSymlink).toMatchObject({
      code: 'SOURCE_PATH_UNSAFE',
      message: 'Source path must not be a symbolic link',
      sourcePath: 'LENOVO-private-pack/symlink.json'
    })
    expect(bridgedFileAsDirectory).toMatchObject({
      code: 'SOURCE_ENTRY_NOT_DIRECTORY',
      message: 'Source path is not a directory',
      sourcePath: 'LENOVO-private-pack/file-as-dir'
    })
    expect(bridgedOutsideRoot).toMatchObject({
      code: 'SOURCE_PATH_OUTSIDE_ROOT',
      message: 'Discovery path is outside source root',
      sourcePath: 'LENOVO-private-root/manifest.json'
    })
    expect(bridgedOutsideRootDirectory).toMatchObject({
      code: 'SOURCE_PATH_OUTSIDE_ROOT',
      message: 'Discovery path is outside source root',
      sourcePath: 'LENOVO-private-root'
    })
    expect(outsideRootDirectoryReadAttempts).toEqual([])

    for (const message of [
      directMissing.ok ? '' : directMissing.message,
      directDirectory.ok ? '' : directDirectory.message,
      directSymlink.ok ? '' : directSymlink.message,
      bridgedMissing.message,
      bridgedDirectory.message,
      bridgedSymlink.message,
      bridgedFileAsDirectory.message,
      bridgedOutsideRoot.message,
      bridgedOutsideRootDirectory.message
    ]) {
      expect(message).not.toContain('LENOVO-private-pack')
      expect(message).not.toContain('LENOVO-private-root')
    }
  })

  it('redacts legacy path-bearing source preflight messages from host errors', async() => {
    const source: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/path-bearing-preflight-message',
        rootPath: 'packs'
      },
      async getEntry(path) {
        if (path === '') return { name: 'packs', kind: 'directory', isSymbolicLink: false }
        if (path === 'LENOVO-private-pack') {
          return { name: 'LENOVO-private-pack', kind: 'directory', isSymbolicLink: false }
        }
        if (path === 'LENOVO-private-pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory(path) {
        if (path === '') return [{ name: 'LENOVO-private-pack', kind: 'directory', isSymbolicLink: false }]
        if (path === 'LENOVO-private-pack') return [{ name: 'manifest.json', kind: 'file', isSymbolicLink: false }]
        return []
      },
      async readTextFile(path) {
        throw new ContentPackageSourceError(
          'SOURCE_ENTRY_NOT_FILE',
          `Source path is not a file: ${path}`,
          path
        )
      },
      async dispose() {}
    }

    const directJson = await readContentPackageSourceJson(source, 'LENOVO-private-pack/manifest.json')
    const bridgedReadError = await captureAsyncSourceError(() =>
      createDiscoveryFileSystemFromContentPackageSource(source)
        .readTextFile('packs/LENOVO-private-pack/manifest.json')
    )

    expect(directJson).toMatchObject({
      ok: false,
      code: 'SOURCE_ENTRY_NOT_FILE',
      message: 'Content package source read operation failed'
    })
    expect(bridgedReadError).toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FILE',
      message: 'Content package source read operation failed',
      sourcePath: 'LENOVO-private-pack/manifest.json'
    })
    expect(directJson.ok).toBe(false)
    if (!directJson.ok) {
      expect(directJson.message).not.toContain('LENOVO-private-pack')
    }
    expect(bridgedReadError.message).not.toContain('LENOVO-private-pack')
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

  it('reports permission revocation and idempotent disposal without retaining platform handles', async() => {
    const revoked = createValidSource()
    const disposed = createValidSource()

    revoked.revoke()
    await disposed.dispose()
    await expect(disposed.dispose()).resolves.toBeUndefined()

    await expect(revoked.getEntry('valid-gift-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED'
    })
    await expect(revoked.readDirectory('valid-gift-pack')).rejects.toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED'
    })
    await expect(revoked.readTextFile('valid-gift-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED'
    })
    await expect(disposed.getEntry('valid-gift-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_DISPOSED'
    })
    await expect(disposed.readDirectory('valid-gift-pack')).rejects.toMatchObject({
      code: 'SOURCE_DISPOSED'
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

  it('redacts path-free host source error messages before direct reads or discovery diagnostics expose raw text', async() => {
    const sourceErrorReadFailureSource: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/source-error-path-free-read-failure',
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
        throw new ContentPackageSourceError('SOURCE_PERMISSION_REVOKED', 'hostile-fragment', path)
      },
      async readTextFile(path) {
        throw new ContentPackageSourceError('SOURCE_PERMISSION_REVOKED', 'hostile-fragment', path)
      },
      async dispose() {}
    }
    const sourceErrorInspectFailureSource: ContentPackageSource = {
      ...sourceErrorReadFailureSource,
      identity: {
        ...sourceErrorReadFailureSource.identity,
        sourceId: 'memory/source-error-path-free-inspect-failure'
      },
      async getEntry(path) {
        throw new ContentPackageSourceError('SOURCE_PERMISSION_REVOKED', 'hostile-fragment', path)
      }
    }
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(sourceErrorReadFailureSource)

    const directJson = await readContentPackageSourceJson(sourceErrorReadFailureSource, 'pack/manifest.json')
    const bridgedReadError = await captureAsyncSourceError(() => fileSystem.readTextFile('packs/pack/manifest.json'))
    const readFailureReport = await discoverThirdPartyDataPacks(
      sourceErrorReadFailureSource.identity.rootPath,
      fileSystem
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
      expect(JSON.stringify(result)).not.toContain('hostile-fragment')
    }
  })

  it('strips extra source error fields before direct JSON, bridge or discovery callers serialize host paths', async() => {
    const createExtraFieldSourceError = (
      message: string,
      sourcePath: string
    ): ContentPackageSourceError => {
      const error = new ContentPackageSourceError('SOURCE_PERMISSION_REVOKED', message, sourcePath)
      Object.defineProperty(error, 'hostPath', {
        enumerable: true,
        value: `C:/Users/LENOVO/mods/${sourcePath}\nhostile-fragment`
      })
      return error
    }
    const source: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/source-error-extra-field',
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
        throw createExtraFieldSourceError('Content package source permission was revoked', path)
      },
      async readTextFile(path) {
        throw createExtraFieldSourceError('Content package source permission was revoked', path)
      },
      async dispose() {}
    }
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(source)

    const directJson = await readContentPackageSourceJson(source, 'pack/manifest.json')
    const bridgedReadError = await captureAsyncSourceError(() => fileSystem.readTextFile('packs/pack/manifest.json'))
    const bridgedListError = await captureAsyncSourceError(() => fileSystem.readDirectory('packs/pack'))
    const readFailureReport = await discoverThirdPartyDataPacks(source.identity.rootPath, fileSystem)
    const listFailureReport = await discoverThirdPartyDataPacks('packs/pack', fileSystem)

    expect(directJson).toMatchObject({
      ok: false,
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source permission was revoked'
    })
    expect(bridgedReadError).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source permission was revoked',
      sourcePath: 'pack/manifest.json'
    })
    expect(bridgedListError).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source permission was revoked',
      sourcePath: 'pack'
    })
    expect(readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source permission was revoked',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    expect(listFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source permission was revoked',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    for (const result of [directJson, bridgedReadError, bridgedListError, readFailureReport, listFailureReport]) {
      expect(JSON.stringify(result)).not.toContain('hostPath')
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
      expect(JSON.stringify(result)).not.toContain('hostile-fragment')
    }
  })

  it('strips extra source error fields at the host operation sanitizer boundary', () => {
    const hostError = new ContentPackageSourceError(
      'SOURCE_PERMISSION_REVOKED',
      'Content package source permission was revoked',
      'pack/manifest.json'
    )
    Object.defineProperty(hostError, 'hostPath', {
      enumerable: true,
      value: 'C:/Users/LENOVO/mods/pack/manifest.json\nhostile-fragment'
    })

    const cleanedError = toContentPackageSourceHostOperationError(
      'read',
      hostError,
      'pack/manifest.json'
    )

    expect(cleanedError).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source permission was revoked',
      sourcePath: 'pack/manifest.json'
    })
    expect(cleanedError).not.toBe(hostError)
    expect(Object.prototype.hasOwnProperty.call(cleanedError, 'hostPath')).toBe(false)
    expect(JSON.stringify(cleanedError)).not.toContain('hostPath')
    expect(JSON.stringify(cleanedError)).not.toContain('C:/Users')
    expect(JSON.stringify(cleanedError)).not.toContain('LENOVO')
    expect(JSON.stringify(cleanedError)).not.toContain('hostile-fragment')
  })

  it('redacts unsafe source paths at the host operation sanitizer boundary', () => {
    const unsafeHostPath = 'C:/Users/LENOVO/mods/pack/manifest.json'
    const unsafeControlPath = 'pack/manifest.json\nhostile-fragment'
    const rawHostError = new Error('EACCES: stat C:/Users/LENOVO/mods/pack/manifest.json')
    const hostSourceError = new ContentPackageSourceError(
      'SOURCE_PERMISSION_REVOKED',
      'EACCES: stat C:/Users/LENOVO/mods/pack/manifest.json',
      unsafeHostPath
    )

    const cleanedRawError = toContentPackageSourceHostOperationError(
      'inspect',
      rawHostError,
      unsafeHostPath
    )
    const cleanedSourceError = toContentPackageSourceHostOperationError(
      'read',
      hostSourceError,
      unsafeControlPath
    )

    expect(cleanedRawError).toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: 'Content package source inspect operation failed'
    })
    expect(cleanedRawError.sourcePath).toBeUndefined()
    expect(cleanedSourceError).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source read operation failed'
    })
    expect(cleanedSourceError.sourcePath).toBeUndefined()
    for (const cleanedError of [cleanedRawError, cleanedSourceError]) {
      expect(JSON.stringify(cleanedError)).not.toContain('C:/Users')
      expect(JSON.stringify(cleanedError)).not.toContain('LENOVO')
      expect(JSON.stringify(cleanedError)).not.toContain('hostile-fragment')
    }
  })

  it('redacts mismatched source paths at the host operation sanitizer boundary', () => {
    const mismatchedPathError = new ContentPackageSourceError(
      'SOURCE_PERMISSION_REVOKED',
      'Content package source permission was revoked',
      'other-pack/manifest.json'
    )
    const hostPathError = new ContentPackageSourceError(
      'SOURCE_PERMISSION_REVOKED',
      'Content package source permission was revoked',
      'C:/Users/LENOVO/mods/pack/manifest.json'
    )

    const cleanedMismatchedPathError = toContentPackageSourceHostOperationError(
      'read',
      mismatchedPathError,
      'pack/manifest.json'
    )
    const cleanedHostPathError = toContentPackageSourceHostOperationError(
      'inspect',
      hostPathError,
      'pack'
    )

    expect(cleanedMismatchedPathError).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source read operation failed',
      sourcePath: 'pack/manifest.json'
    })
    expect(cleanedHostPathError).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source inspect operation failed',
      sourcePath: 'pack'
    })
    for (const cleanedError of [cleanedMismatchedPathError, cleanedHostPathError]) {
      expect(JSON.stringify(cleanedError)).not.toContain('other-pack')
      expect(JSON.stringify(cleanedError)).not.toContain('C:/Users')
      expect(JSON.stringify(cleanedError)).not.toContain('LENOVO')
    }
  })

  it('detaches sanitized host operation errors from later host error mutation', () => {
    const hostError = new ContentPackageSourceError(
      'SOURCE_PERMISSION_REVOKED',
      'Content package source permission was revoked',
      'pack/manifest.json'
    )

    const cleanedError = toContentPackageSourceHostOperationError(
      'read',
      hostError,
      'pack/manifest.json'
    )
    const beforeMutation = JSON.stringify(cleanedError)
    Object.assign(hostError as { code: string; message: string; sourcePath: string }, {
      code: 'SOURCE_PATH_UNSAFE',
      message: 'EACCES: stat C:/Users/LENOVO/mods/pack/manifest.json',
      sourcePath: 'C:/Users/LENOVO/mods/pack/manifest.json'
    })
    Object.defineProperty(hostError, 'hostPath', {
      configurable: true,
      enumerable: true,
      value: 'C:/Users/LENOVO/mods/pack/manifest.json\nhostile-fragment'
    })

    expect(cleanedError).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source permission was revoked',
      sourcePath: 'pack/manifest.json'
    })
    expect(JSON.stringify(cleanedError)).toBe(beforeMutation)
    expect(JSON.stringify(cleanedError)).not.toContain('C:/Users')
    expect(JSON.stringify(cleanedError)).not.toContain('LENOVO')
    expect(JSON.stringify(cleanedError)).not.toContain('hostile-fragment')
  })

  it('ignores inherited source error metadata getters before host operation sanitizing', () => {
    const hostError = new ContentPackageSourceError(
      'SOURCE_PERMISSION_REVOKED',
      'Content package source permission was revoked',
      'pack/manifest.json'
    )
    Reflect.deleteProperty(hostError, 'code')
    Reflect.deleteProperty(hostError, 'message')
    Reflect.deleteProperty(hostError, 'sourcePath')
    const readFields: string[] = []
    const inheritedMetadata = Object.create(ContentPackageSourceError.prototype)
    for (const fieldName of ['code', 'message', 'sourcePath'] as const) {
      Object.defineProperty(inheritedMetadata, fieldName, {
        enumerable: true,
        get() {
          readFields.push(fieldName)
          throw new Error(`EACCES: inherited C:/Users/LENOVO/mods/${fieldName}\nhostile-fragment`)
        }
      })
    }
    Object.setPrototypeOf(hostError, inheritedMetadata)

    expect(hostError).toBeInstanceOf(ContentPackageSourceError)
    const cleanedError = toContentPackageSourceHostOperationError(
      'read',
      hostError,
      'pack/manifest.json'
    )

    expect(readFields).toEqual([])
    expect(cleanedError).toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: 'Content package source read operation failed',
      sourcePath: 'pack/manifest.json'
    })
    expect(JSON.stringify(cleanedError)).not.toContain('C:/Users')
    expect(JSON.stringify(cleanedError)).not.toContain('LENOVO')
    expect(JSON.stringify(cleanedError)).not.toContain('hostile-fragment')
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

    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(sourceErrorReadFailureSource)
    const directJson = await readContentPackageSourceJson(
      sourceErrorReadFailureSource,
      'pack/manifest.json'
    )
    const bridgedListError = await captureAsyncSourceError(() => fileSystem.readDirectory('packs/pack'))
    const readFailureReport = await discoverThirdPartyDataPacks(
      sourceErrorReadFailureSource.identity.rootPath,
      fileSystem
    )
    const listFailureReport = await discoverThirdPartyDataPacks('packs/pack', fileSystem)
    const inspectFailureReport = await discoverThirdPartyDataPacks(
      sourceErrorInspectFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(sourceErrorInspectFailureSource)
    )

    expect(directJson).toMatchObject({
      ok: false,
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source read operation failed'
    })
    expect(bridgedListError).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source list operation failed',
      sourcePath: 'pack'
    })
    expect(readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source read operation failed',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    expect(listFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source list operation failed',
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
    expect(JSON.stringify(bridgedListError)).not.toContain('C:/Users')
    expect(JSON.stringify(bridgedListError)).not.toContain('LENOVO')
    expect(JSON.stringify(listFailureReport)).not.toContain('C:/Users')
    expect(JSON.stringify(listFailureReport)).not.toContain('LENOVO')
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
      },
      async readDirectory(path) {
        if (path === '') return [{ name: 'pack', kind: 'directory', isSymbolicLink: false }]
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

    const posixFileSystem = createDiscoveryFileSystemFromContentPackageSource(posixSourceErrorReadFailureSource)
    const posixDirectJson = await readContentPackageSourceJson(
      posixSourceErrorReadFailureSource,
      'pack/manifest.json'
    )
    const posixBridgedListError = await captureAsyncSourceError(() => posixFileSystem.readDirectory('packs/pack'))
    const posixReadFailureReport = await discoverThirdPartyDataPacks(
      posixSourceErrorReadFailureSource.identity.rootPath,
      posixFileSystem
    )
    const posixListFailureReport = await discoverThirdPartyDataPacks('packs/pack', posixFileSystem)
    const posixInspectFailureReport = await discoverThirdPartyDataPacks(
      posixSourceErrorInspectFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(posixSourceErrorInspectFailureSource)
    )

    expect(posixDirectJson).toMatchObject({
      ok: false,
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source read operation failed'
    })
    expect(posixBridgedListError).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source list operation failed',
      sourcePath: 'pack'
    })
    expect(posixReadFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source read operation failed',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    expect(posixListFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source list operation failed',
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
    expect(JSON.stringify(posixBridgedListError)).not.toContain('/Users')
    expect(JSON.stringify(posixBridgedListError)).not.toContain('LENOVO')
    expect(JSON.stringify(posixListFailureReport)).not.toContain('/Users')
    expect(JSON.stringify(posixListFailureReport)).not.toContain('LENOVO')
    expect(JSON.stringify(posixInspectFailureReport)).not.toContain('/Users')
    expect(JSON.stringify(posixInspectFailureReport)).not.toContain('LENOVO')
  })

  it('redacts mismatched source error paths before diagnostics can misattribute package reads', async() => {
    const mismatchedSourcePathFailureSource: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/source-error-mismatched-source-path',
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
          'other-pack'
        )
      },
      async readTextFile() {
        throw new ContentPackageSourceError(
          'SOURCE_PERMISSION_REVOKED',
          'Permission denied while reading package source',
          'other-pack/manifest.json'
        )
      },
      async dispose() {}
    }
    const mismatchedInspectFailureSource: ContentPackageSource = {
      ...mismatchedSourcePathFailureSource,
      identity: {
        ...mismatchedSourcePathFailureSource.identity,
        sourceId: 'memory/source-error-mismatched-inspect-path'
      },
      async getEntry() {
        throw new ContentPackageSourceError(
          'SOURCE_PERMISSION_REVOKED',
          'Permission denied while inspecting package source',
          'other-pack'
        )
      }
    }
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(mismatchedSourcePathFailureSource)

    const directJson = await readContentPackageSourceJson(
      mismatchedSourcePathFailureSource,
      'pack/manifest.json'
    )
    const bridgedReadError = await captureAsyncSourceError(() => fileSystem.readTextFile('packs/pack/manifest.json'))
    const readFailureReport = await discoverThirdPartyDataPacks(
      mismatchedSourcePathFailureSource.identity.rootPath,
      fileSystem
    )
    const inspectFailureReport = await discoverThirdPartyDataPacks(
      mismatchedInspectFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(mismatchedInspectFailureSource)
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
      expect(JSON.stringify(result)).not.toContain('other-pack')
    }
  })

  it('redacts unsafe source error codes before direct reads or discovery diagnostics expose host text', async() => {
    const unsafeCodeReadFailureSource: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/source-error-unsafe-code-read-failure',
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
        throw createUnsafeSourceErrorCode('Permission denied while listing package source', path)
      },
      async readTextFile(path) {
        throw createUnsafeSourceErrorCode('Permission denied while reading package source', path)
      },
      async dispose() {}
    }
    const unsafeCodeInspectFailureSource: ContentPackageSource = {
      ...unsafeCodeReadFailureSource,
      identity: {
        ...unsafeCodeReadFailureSource.identity,
        sourceId: 'memory/source-error-unsafe-code-inspect-failure'
      },
      async getEntry(path) {
        throw createUnsafeSourceErrorCode('Permission denied while inspecting package source', path)
      }
    }
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(unsafeCodeReadFailureSource)

    const directJson = await readContentPackageSourceJson(
      unsafeCodeReadFailureSource,
      'pack/manifest.json'
    )
    const bridgedReadError = await captureAsyncSourceError(() => fileSystem.readTextFile('packs/pack/manifest.json'))
    const bridgedListError = await captureAsyncSourceError(() => fileSystem.readDirectory('packs/pack'))
    const readFailureReport = await discoverThirdPartyDataPacks(
      unsafeCodeReadFailureSource.identity.rootPath,
      fileSystem
    )
    const listFailureReport = await discoverThirdPartyDataPacks('packs/pack', fileSystem)
    const inspectFailureReport = await discoverThirdPartyDataPacks(
      unsafeCodeInspectFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(unsafeCodeInspectFailureSource)
    )

    expect(directJson).toMatchObject({
      ok: false,
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: 'Content package source read operation failed'
    })
    expect(bridgedReadError).toMatchObject({
      code: 'SOURCE_ENTRY_NOT_FOUND',
      message: 'Content package source read operation failed',
      sourcePath: 'pack/manifest.json'
    })
    expect(bridgedListError).toMatchObject({
      code: 'SOURCE_ENTRY_NOT_DIRECTORY',
      message: 'Content package source list operation failed',
      sourcePath: 'pack'
    })
    expect(readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source read operation failed',
      sourceCode: 'SOURCE_ENTRY_NOT_FOUND'
    })
    expect(listFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source list operation failed',
      sourceCode: 'SOURCE_ENTRY_NOT_DIRECTORY'
    })
    expect(inspectFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source inspect operation failed',
      sourceCode: 'SOURCE_ENTRY_NOT_FOUND'
    })
    for (const result of [directJson, bridgedReadError, bridgedListError, readFailureReport, listFailureReport, inspectFailureReport]) {
      expect(JSON.stringify(result)).not.toContain('C:/Users')
      expect(JSON.stringify(result)).not.toContain('LENOVO')
      expect(JSON.stringify(result)).not.toContain('hostile-fragment')
      expect(JSON.stringify(result)).not.toContain('\\n')
    }
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

  it('redacts control-character source errors before diagnostics expose hostile text', async() => {
    const controlCharacterSourcePathFailureSource: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'memory',
        sourceId: 'memory/source-error-control-source-path',
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
          `${path}\nhostile-fragment`
        )
      },
      async readTextFile(path) {
        throw new ContentPackageSourceError(
          'SOURCE_PERMISSION_REVOKED',
          'Permission denied while reading package source',
          `${path}\nhostile-fragment`
        )
      },
      async dispose() {}
    }
    const controlCharacterMessageFailureSource: ContentPackageSource = {
      ...controlCharacterSourcePathFailureSource,
      identity: {
        ...controlCharacterSourcePathFailureSource.identity,
        sourceId: 'memory/source-error-control-message'
      },
      async getEntry(path) {
        throw new ContentPackageSourceError(
          'SOURCE_PERMISSION_REVOKED',
          `Permission denied while inspecting package source\nhostile-fragment`,
          path
        )
      }
    }
    const fileSystem = createDiscoveryFileSystemFromContentPackageSource(controlCharacterSourcePathFailureSource)

    const directJson = await readContentPackageSourceJson(
      controlCharacterSourcePathFailureSource,
      'pack/manifest.json'
    )
    const bridgedReadError = await captureAsyncSourceError(() => fileSystem.readTextFile('packs/pack/manifest.json'))
    const bridgedListError = await captureAsyncSourceError(() => fileSystem.readDirectory('packs/pack'))
    const readFailureReport = await discoverThirdPartyDataPacks(
      controlCharacterSourcePathFailureSource.identity.rootPath,
      fileSystem
    )
    const listFailureReport = await discoverThirdPartyDataPacks('packs/pack', fileSystem)
    const inspectFailureReport = await discoverThirdPartyDataPacks(
      controlCharacterMessageFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(controlCharacterMessageFailureSource)
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
    expect(bridgedListError).toMatchObject({
      code: 'SOURCE_PERMISSION_REVOKED',
      message: 'Content package source list operation failed',
      sourcePath: 'pack'
    })
    expect(readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source read operation failed',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    expect(listFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source list operation failed',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    expect(inspectFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source inspect operation failed',
      sourceCode: 'SOURCE_PERMISSION_REVOKED'
    })
    for (const result of [directJson, bridgedReadError, bridgedListError, readFailureReport, listFailureReport, inspectFailureReport]) {
      expect(JSON.stringify(result)).not.toContain('hostile-fragment')
      expect(JSON.stringify(result)).not.toContain('\\n')
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
