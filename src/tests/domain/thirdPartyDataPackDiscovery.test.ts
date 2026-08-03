/// <reference types="node" />

import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import { CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS } from '@/domain/mods/contentPackageSource'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDiscoveryDirectoryEntry,
  type ThirdPartyDiscoveryFileSystem
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []
const fixtureRoot = path.join(cwd(), 'src/tests/fixtures/mods/third-party-discovery')

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-pack-discovery-'))
  roots.push(root)
  return root
}

const toEntryKind = (stats: Awaited<ReturnType<typeof lstat>>): ThirdPartyDiscoveryDirectoryEntry['kind'] => {
  if (stats.isFile()) return 'file'
  if (stats.isDirectory()) return 'directory'
  return 'other'
}

const isMissing = (error: unknown): boolean =>
  typeof error === 'object'
  && error !== null
  && 'code' in error
  && (error as { code?: string }).code === 'ENOENT'

const createNodeFileSystem = (readPaths: string[] = []): ThirdPartyDiscoveryFileSystem => ({
  async getEntry(filePath) {
    try {
      const stats = await lstat(filePath)
      return {
        name: path.basename(filePath),
        kind: toEntryKind(stats),
        isSymbolicLink: stats.isSymbolicLink()
      }
    } catch (error) {
      if (isMissing(error)) return null
      throw error
    }
  },
  async readDirectory(directoryPath) {
    const entries = await readdir(directoryPath, { withFileTypes: true })
    return entries.map(entry => ({
      name: entry.name,
      kind: entry.isFile() ? 'file' : entry.isDirectory() ? 'directory' : 'other',
      isSymbolicLink: entry.isSymbolicLink()
    }))
  },
  async readTextFile(filePath) {
    readPaths.push(filePath)
    return readFile(filePath, 'utf8')
  }
})

const countOfficialEntries = (): { registryCount: number; entryCount: number; snapshotHash: string } => {
  const registrySet = buildOfficialRegistrySetFromStaticData()
  const snapshot = createSerializableRegistrySnapshot(registrySet)
  return {
    registryCount: registrySet.registryIds().length,
    entryCount: registrySet.registryIds().reduce(
      (total, registryId) => total + registrySet.get(registryId).entries().length,
      0
    ),
    snapshotHash: snapshot.snapshotHash
  }
}

type JsonObject = Record<string, unknown>

const writeJson = async(filePath: string, value: unknown): Promise<void> => {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const readJsonObject = async(filePath: string): Promise<JsonObject> =>
  JSON.parse(await readFile(filePath, 'utf8')) as JsonObject

const createHostFailure = (message: string, sourcePath?: string): Error & {
  readonly code: 'EACCES'
  readonly sourcePath?: string
} =>
  Object.assign(new Error(message), {
    code: 'EACCES' as const,
    ...(sourcePath === undefined ? {} : { sourcePath })
  })

const createExtraFieldHostFailure = (
  message: string,
  sourcePath: string
): Error & {
  readonly code: 'EACCES'
  readonly sourcePath: string
  readonly hostPath: string
  readonly rawDetails: { readonly hostPath: string }
} =>
  Object.assign(createHostFailure(message, sourcePath), {
    sourcePath,
    hostPath: 'C:/Users/LENOVO/mods/private-pack',
    rawDetails: { hostPath: 'C:/Users/LENOVO/mods/private-pack\nhostile-fragment' }
  })

const createUnsafeCodeHostFailure = (): Error & { readonly code: string } =>
  Object.assign(new Error('Permission denied while reading package source'), {
    code: 'C:/Users/LENOVO/mods/hostile-code\nhostile-fragment'
  })

const createInheritedCodeHostFailure = (): {
  readonly error: Error
  readonly wasCodeRead: () => boolean
} => {
  let codeRead = false
  const error = new Error('Permission denied while inspecting package source')
  const prototype = Object.create(Object.getPrototypeOf(error))
  Object.defineProperty(prototype, 'code', {
    enumerable: true,
    get() {
      codeRead = true
      throw new Error('EACCES: inherited C:/Users/LENOVO/mods/source-code\nhostile-fragment')
    }
  })
  Object.setPrototypeOf(error, prototype)
  return {
    error,
    wasCodeRead: () => codeRead
  }
}

const createHostileFailureMetadata = (): unknown => {
  const failure = Object.create(null) as Record<string | symbol, unknown>
  for (const fieldName of ['message', 'code', 'sourcePath']) {
    Object.defineProperty(failure, fieldName, {
      enumerable: true,
      get() {
        throw new Error(`EACCES: stat C:/Users/LENOVO/mods/${fieldName}\nhostile-fragment`)
      }
    })
  }
  Object.defineProperty(failure, 'toString', {
    enumerable: true,
    get() {
      throw new Error('EACCES: stringify C:/Users/LENOVO/mods/to-string\nhostile-fragment')
    }
  })
  return failure
}

const defineHiddenRawDiscoveryGetter = (
  target: Record<string, unknown>,
  fieldName: string
): { readonly value: Record<string, unknown>; readonly wasRead: () => boolean } => {
  let wasRead = false
  Object.defineProperty(target, fieldName, {
    enumerable: false,
    get() {
      wasRead = true
      throw new Error(`EACCES: hidden C:/Users/LENOVO/mods/private-pack ${fieldName} metadata`)
    }
  })
  return {
    value: target,
    wasRead: () => wasRead
  }
}

const createPack = async(
  root: string,
  directoryName: string,
  options: {
    id?: string
    version?: string
    omitDependencyFields?: boolean
    dependencies?: readonly JsonObject[]
    optionalDependencies?: readonly JsonObject[]
    conflicts?: readonly JsonObject[]
    itemEntries?: readonly JsonObject[]
  } = {}
): Promise<string> => {
  const packRoot = path.join(root, directoryName)
  await cp(path.join(fixtureRoot, 'valid-gift-pack'), packRoot, { recursive: true })
  const packageId = options.id ?? directoryName.replace(/-/g, '_')
  const manifestPath = path.join(packRoot, 'manifest.json')
  const manifest = await readJsonObject(manifestPath)
  manifest.id = packageId
  manifest.name = { key: `${packageId}.package.name`, fallback: packageId }
  manifest.version = options.version ?? '1.0.0'
  manifest.entrypoints = { 'taoyuan:item': ['data/items.json'] }
  if (options.omitDependencyFields) {
    delete manifest.dependencies
    delete manifest.optionalDependencies
    delete manifest.conflicts
  } else {
    manifest.dependencies = [...(options.dependencies ?? [])]
    if (options.optionalDependencies !== undefined) {
      manifest.optionalDependencies = [...options.optionalDependencies]
    } else {
      delete manifest.optionalDependencies
    }
    if (options.conflicts !== undefined) {
      manifest.conflicts = [...options.conflicts]
    } else {
      delete manifest.conflicts
    }
  }
  await writeJson(manifestPath, manifest)
  await writeJson(path.join(packRoot, 'data', 'items.json'), options.itemEntries ?? [
    {
      id: `${packageId}:linen_ribbon`,
      name: { key: `${packageId}.item.linen_ribbon.name`, fallback: 'Linen ribbon' },
      category: 'gift',
      description: { key: `${packageId}.item.linen_ribbon.description`, fallback: 'A test gift.' },
      sellPrice: 8,
      edible: false
    }
  ])
  return packRoot
}

const expectRawDirectoryArrayTrapRejected = async(entries: unknown): Promise<void> => {
  let packageInspected = false
  let readAttempted = false

  const report = await discoverThirdPartyDataPacks('mods', {
    async getEntry(filePath) {
      if (filePath === 'mods/private-pack') packageInspected = true
      return filePath === 'mods'
        ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
        : null
    },
    async readDirectory() {
      return entries as never
    },
    async readTextFile() {
      readAttempted = true
      throw new Error('hostile directory arrays must not be read')
    }
  })

  expect(packageInspected).toBe(false)
  expect(readAttempted).toBe(false)
  expect(report.status).toBe('directory-not-found')
  expect(report.candidates).toEqual([])
  expect(report.issues[0]).toMatchObject({
    kind: 'file-read-failed',
    severity: 'fatal',
    path: '.',
    reason: 'Package source list operation failed'
  })
  expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
    message: 'Package source directory entries metadata could not be read',
    sourceCode: 'SOURCE_ENTRY_UNSAFE'
  })
  expect(JSON.stringify(report)).not.toContain('C:/Users')
  expect(JSON.stringify(report)).not.toContain('LENOVO')
  expect(JSON.stringify(report)).not.toContain('hostile-fragment')
  expect(JSON.stringify(report)).not.toContain('Cannot perform')
  expect(JSON.stringify(report)).not.toContain('IsArray')
  expect(JSON.stringify(report)).not.toContain('revoked')
}

const createRevokedProxy = <T extends object>(target: T): T => {
  const { proxy, revoke } = Proxy.revocable(target, {})
  revoke()
  return proxy
}

const createMalformedRawDiscoveryDirectoryArrayLength = (
  lengthValue: unknown
): {
  readonly entries: unknown
  readonly wasOwnKeysRead: () => boolean
  readonly wasEntryRead: () => boolean
} => {
  let ownKeysRead = false
  let entryRead = false
  const entries = new Proxy(
    [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }],
    {
      get(target, property, receiver) {
        if (property === 'length') return lengthValue
        if (property === '0') {
          entryRead = true
          throw new Error('EACCES: get C:/Users/LENOVO/mods/private-pack\nhostile-fragment')
        }
        return Reflect.get(target, property, receiver)
      },
      ownKeys() {
        ownKeysRead = true
        throw new Error('EACCES: keys C:/Users/LENOVO/mods/private-pack\nhostile-fragment')
      }
    }
  )
  return {
    entries,
    wasOwnKeysRead: () => ownKeysRead,
    wasEntryRead: () => entryRead
  }
}

const createOverLimitRawDiscoveryDirectoryArray = (): {
  readonly entries: unknown
  readonly wasOwnKeysRead: () => boolean
  readonly wasEntryRead: () => boolean
} => {
  let ownKeysRead = false
  let entryRead = false
  const limit = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxPackageFileCount
  const entries = new Proxy(
    [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }],
    {
      get(target, property, receiver) {
        if (property === 'length') return limit + 1
        if (property === '0') {
          entryRead = true
          throw new Error('EACCES: get C:/Users/LENOVO/mods/private-pack\nhostile-fragment')
        }
        return Reflect.get(target, property, receiver)
      },
      ownKeys() {
        ownKeysRead = true
        throw new Error('EACCES: keys C:/Users/LENOVO/mods/private-pack\nhostile-fragment')
      }
    }
  )
  return {
    entries,
    wasOwnKeysRead: () => ownKeysRead,
    wasEntryRead: () => entryRead
  }
}

describe('third-party data pack read-only discovery', () => {
  it('reports missing, symlinked, non-directory and empty discovery roots without throwing or reading payloads', async() => {
    const root = await createRoot()
    const fileSystem = createNodeFileSystem()

    const missing = await discoverThirdPartyDataPacks(path.join(root, 'missing'), fileSystem)
    expect(missing.status).toBe('directory-not-found')
    expect(missing.candidates).toEqual([])
    expect(missing.issues.map(issue => issue.kind)).toEqual(['directory-not-found'])

    const fileRootPath = path.join(root, 'not-a-directory.json')
    await writeFile(fileRootPath, '{}\n', 'utf8')
    const fileRoot = await discoverThirdPartyDataPacks(fileRootPath, fileSystem)
    expect(fileRoot.status).toBe('directory-not-found')
    expect(fileRoot.candidates).toEqual([])
    expect(fileRoot.issues).toEqual([
      expect.objectContaining({
        kind: 'directory-not-found',
        severity: 'info',
        path: '.',
        reason: 'Discovery root directory does not exist'
      })
    ])

    let otherRootListed = false
    let otherRootRead = false
    const otherRoot = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        return filePath === 'mods'
          ? { name: 'mods', kind: 'other', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        otherRootListed = true
        throw new Error('non-directory discovery root must not be listed')
      },
      async readTextFile() {
        otherRootRead = true
        throw new Error('non-directory discovery root must not be read')
      }
    })
    expect(otherRootListed).toBe(false)
    expect(otherRootRead).toBe(false)
    expect(otherRoot.status).toBe('directory-not-found')
    expect(otherRoot.candidates).toEqual([])
    expect(otherRoot.issues).toEqual([
      expect.objectContaining({
        kind: 'directory-not-found',
        severity: 'info',
        path: '.',
        reason: 'Discovery root directory does not exist'
      })
    ])

    let symlinkRootListed = false
    let symlinkRootRead = false
    const symlinkRoot = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: true }
          : null
      },
      async readDirectory() {
        symlinkRootListed = true
        throw new Error('symlinked discovery root must not be listed')
      },
      async readTextFile() {
        symlinkRootRead = true
        throw new Error('symlinked discovery root must not be read')
      }
    })
    expect(symlinkRootListed).toBe(false)
    expect(symlinkRootRead).toBe(false)
    expect(symlinkRoot.status).toBe('directory-not-found')
    expect(symlinkRoot.candidates).toEqual([])
    expect(symlinkRoot.issues).toEqual([
      expect.objectContaining({
        kind: 'path-unsafe',
        severity: 'fatal',
        path: '.',
        reason: 'Discovery root is a symbolic link'
      })
    ])

    const emptyRoot = path.join(root, 'empty')
    await mkdir(emptyRoot)
    const empty = await discoverThirdPartyDataPacks(emptyRoot, fileSystem)
    expect(empty.status).toBe('empty')
    expect(empty.candidates).toEqual([])
    expect(empty.issues.map(issue => issue.kind)).toEqual(['empty-directory'])
  })

  it('rejects malformed discovery root getEntry metadata before listing packages', async() => {
    let hostPathRead = false
    let rootListed = false
    let rootRead = false
    const rootEntry = {
      name: 'mods',
      kind: 'directory',
      isSymbolicLink: false
    }
    Object.defineProperty(rootEntry, 'hostPath', {
      enumerable: true,
      get() {
        hostPathRead = true
        throw new Error('EACCES: root metadata C:/Users/LENOVO/mods')
      }
    })

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        return filePath === 'mods' ? rootEntry as never : null
      },
      async readDirectory() {
        rootListed = true
        throw new Error('malformed discovery root metadata must not be listed')
      },
      async readTextFile() {
        rootRead = true
        throw new Error('malformed discovery root metadata must not read payloads')
      }
    })

    expect(hostPathRead).toBe(false)
    expect(rootListed).toBe(false)
    expect(rootRead).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source inspect operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source entry metadata contains unsupported fields',
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
    expect(JSON.stringify(report)).not.toContain('hostPath')
  })

  it('redacts unreadable discovery root getEntry metadata before listing packages', async() => {
    let rootMetadataKeysRead = false
    let rootListed = false
    let rootRead = false
    const rootEntry = new Proxy({
      name: 'mods',
      kind: 'directory',
      isSymbolicLink: false
    }, {
      ownKeys() {
        rootMetadataKeysRead = true
        throw new Error('EACCES: root metadata C:/Users/LENOVO/mods')
      }
    })

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        return filePath === 'mods' ? rootEntry as never : null
      },
      async readDirectory() {
        rootListed = true
        throw new Error('unreadable discovery root metadata must not be listed')
      },
      async readTextFile() {
        rootRead = true
        throw new Error('unreadable discovery root metadata must not read payloads')
      }
    })

    expect(rootMetadataKeysRead).toBe(true)
    expect(rootListed).toBe(false)
    expect(rootRead).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source inspect operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source entry metadata could not be read',
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
  })

  it('discovers valid packages and reports each invalid package class deterministically', async() => {
    const report = await discoverThirdPartyDataPacks(fixtureRoot, createNodeFileSystem())

    expect(report.status).toBe('completed')
    expect(report.summary).toMatchObject({
      scannedEntries: 9,
      candidateCount: 8,
      validPackageCount: 1,
      invalidPackageCount: 7
    })
    expect(report.issues.map(issue => issue.kind)).toEqual(expect.arrayContaining([
      'non-json-file',
      'schema-validation-failed',
      'json-parse-failed',
      'content-file-missing',
      'missing-manifest',
      'path-unsafe',
      'unsupported-registry'
    ]))

    const valid = report.candidates.find(candidate => candidate.path === 'valid-gift-pack')
    expect(valid).toMatchObject({
      status: 'valid',
      packageId: 'discovery_valid',
      contentFiles: [
        { registryId: 'taoyuan:item', path: 'data/items.json', entryCount: 1 },
        { registryId: 'taoyuan:tag', path: 'data/tags.json', entryCount: 1 }
      ]
    })

    const badSchema = report.candidates.find(candidate => candidate.path === 'bad-schema-pack')
    expect(badSchema?.status).toBe('invalid')
    expect(badSchema?.contentFiles).toEqual([])
    expect(badSchema?.issues).toContainEqual(expect.objectContaining({
      kind: 'schema-validation-failed',
      path: 'bad-schema-pack/data/items.json',
      fieldPath: '/0/sellPrice'
    }))

    const invalidJson = report.candidates.find(candidate => candidate.path === 'invalid-json-pack')
    expect(invalidJson?.issues).toContainEqual(expect.objectContaining({
      kind: 'json-parse-failed',
      path: 'invalid-json-pack/data/items.json'
    }))

    const missingContent = report.candidates.find(candidate => candidate.path === 'missing-content-pack')
    expect(missingContent?.issues).toContainEqual(expect.objectContaining({
      kind: 'content-file-missing',
      path: 'missing-content-pack/data/missing-items.json'
    }))

    const noManifest = report.candidates.find(candidate => candidate.path === 'no-manifest-pack')
    expect(noManifest?.issues).toContainEqual(expect.objectContaining({
      kind: 'missing-manifest',
      path: 'no-manifest-pack/manifest.json'
    }))

    const unsupportedRegistry = report.candidates.find(candidate => candidate.path === 'unsupported-registry-pack')
    expect(unsupportedRegistry?.issues).toContainEqual(expect.objectContaining({
      kind: 'unsupported-registry',
      path: 'unsupported-registry-pack/manifest.json',
      registryId: 'example_mod:unknown_registry'
    }))

    for (const issue of report.issues) {
      expect(issue.path).not.toContain(fixtureRoot)
      for (const diagnostic of issue.diagnostics) {
        expect(diagnostic.file).not.toContain(fixtureRoot)
      }
    }
  })

  it('redacts unsafe JSON parse fragments before discovery diagnostics expose host text', async() => {
    const root = await createRoot()
    const packRoot = await createPack(root, 'host-path-json-pack')
    await writeFile(
      path.join(packRoot, 'data', 'items.json'),
      'C:/Users/LENOVO/private-pack/manifest.json\nhostile-fragment',
      'utf8'
    )

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())
    const invalidJson = report.candidates.find(candidate => candidate.path === 'host-path-json-pack')
    const issue = invalidJson?.issues.find(item => item.kind === 'json-parse-failed')

    expect(issue).toMatchObject({
      kind: 'json-parse-failed',
      path: 'host-path-json-pack/data/items.json'
    })
    expect(issue?.diagnostics[0]?.details).toMatchObject({
      reason: 'JSON parsing failed',
      message: 'JSON parsing failed'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
    expect(JSON.stringify(report)).not.toContain('hostile-fragment')
  })

  it('redacts unsafe absolute, platform-separator and control-character entrypoint paths from diagnostics', async() => {
    const root = await createRoot()
    const readPaths: string[] = []
    const packRoot = await createPack(root, 'absolute-entrypoint-pack')
    const manifestPath = path.join(packRoot, 'manifest.json')
    const manifest = await readJsonObject(manifestPath)
    manifest.entrypoints = { 'taoyuan:item': ['C:/Users/LENOVO/secrets/items.json'] }
    await writeJson(manifestPath, manifest)
    const backslashPackRoot = await createPack(root, 'backslash-entrypoint-pack')
    const backslashManifestPath = path.join(backslashPackRoot, 'manifest.json')
    const backslashManifest = await readJsonObject(backslashManifestPath)
    backslashManifest.entrypoints = { 'taoyuan:item': ['data\\items.json'] }
    await writeJson(backslashManifestPath, backslashManifest)
    const controlPackRoot = await createPack(root, 'control-entrypoint-pack')
    const controlManifestPath = path.join(controlPackRoot, 'manifest.json')
    const controlManifest = await readJsonObject(controlManifestPath)
    controlManifest.entrypoints = { 'taoyuan:item': ['data/items.json\nhostile-fragment'] }
    await writeJson(controlManifestPath, controlManifest)

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem(readPaths))
    const issues = report.issues.filter(item => item.kind === 'path-unsafe')

    expect(report.summary).toMatchObject({
      candidateCount: 3,
      validPackageCount: 0,
      invalidPackageCount: 3
    })
    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: 'path-unsafe',
        path: 'absolute-entrypoint-pack/<unsafe-path>',
        reason: 'Package path is absolute, empty, or escapes the package root'
      }),
      expect.objectContaining({
        kind: 'path-unsafe',
        path: 'backslash-entrypoint-pack/<unsafe-path>',
        reason: 'Package path is absolute, empty, or escapes the package root'
      }),
      expect.objectContaining({
        kind: 'path-unsafe',
        path: 'control-entrypoint-pack/<unsafe-path>',
        reason: 'Package path is absolute, empty, or escapes the package root'
      })
    ]))
    for (const issue of issues) {
      expect(issue.diagnostics[0]?.details).toMatchObject({
        message: 'Package path is absolute, empty, or escapes the package root'
      })
    }
    expect(readPaths.some(item => item.includes('secrets'))).toBe(false)
    expect(readPaths.some(item => item.includes('items.json'))).toBe(false)
    expect(readPaths.some(item => item.includes('hostile-fragment'))).toBe(false)
    expect(JSON.stringify(issues)).not.toContain('C:/Users')
    expect(JSON.stringify(issues)).not.toContain('LENOVO')
    expect(JSON.stringify(issues)).not.toContain('hostile-fragment')
  })

  it('rejects malformed raw discovery root entry names before composing package paths', async() => {
    let outsideRootInspected = false
    let readAttempted = false

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath.includes('userdata')) outsideRootInspected = true
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return [{ name: '../userdata', kind: 'directory', isSymbolicLink: false } as never]
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('malformed root entries must not be read')
      }
    })

    expect(outsideRootInspected).toBe(false)
    expect(readAttempted).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'path-unsafe',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source entry name is unsafe',
      sourceCode: 'SOURCE_PATH_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('userdata')
  })

  it('rejects platform-separator raw discovery root entry names before composing package paths', async() => {
    const inspectedPaths: string[] = []
    let readAttempted = false

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        inspectedPaths.push(filePath)
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return [{ name: 'private-pack\\nested', kind: 'directory', isSymbolicLink: false } as never]
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('platform-separated root entries must not be read')
      }
    })

    expect(inspectedPaths).toEqual(['mods'])
    expect(readAttempted).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'path-unsafe',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source entry name is unsafe',
      sourceCode: 'SOURCE_PATH_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('private-pack')
    expect(JSON.stringify(report)).not.toContain('nested')
  })

  it('rejects unsafe raw discovery entry names before reading kind or symbolic-link metadata', async() => {
    const inspectedPaths: string[] = []
    let readAttempted = false
    let kindRead = false
    let symbolicLinkRead = false
    const listingEntry = { name: 'private-pack\\nested' }
    Object.defineProperties(listingEntry, {
      kind: {
        enumerable: true,
        get() {
          kindRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/raw-entry-kind')
        }
      },
      isSymbolicLink: {
        enumerable: true,
        get() {
          symbolicLinkRead = true
          throw new Error('EACCES: stat C:/Users/LENOVO/mods/raw-entry-symlink')
        }
      }
    })

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        inspectedPaths.push(filePath)
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return [listingEntry as never]
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('unsafe raw entries must not be read')
      }
    })

    expect(inspectedPaths).toEqual(['mods'])
    expect(readAttempted).toBe(false)
    expect(kindRead).toBe(false)
    expect(symbolicLinkRead).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'path-unsafe',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source entry name is unsafe',
      sourceCode: 'SOURCE_PATH_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
    expect(JSON.stringify(report)).not.toContain('raw-entry')
    expect(JSON.stringify(report)).not.toContain('private-pack')
    expect(JSON.stringify(report)).not.toContain('nested')
  })

  it('rejects control-character raw discovery root entry names before composing package paths', async() => {
    const inspectedPaths: string[] = []
    let readAttempted = false

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        inspectedPaths.push(filePath)
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return [{ name: 'private-pack\nhostile-fragment', kind: 'directory', isSymbolicLink: false } as never]
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('control-character root entries must not be read')
      }
    })

    expect(inspectedPaths).toEqual(['mods'])
    expect(readAttempted).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'path-unsafe',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source entry name is unsafe',
      sourceCode: 'SOURCE_PATH_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('private-pack')
    expect(JSON.stringify(report)).not.toContain('hostile-fragment')
  })

  it('rejects malformed raw discovery directory array metadata before inspecting packages', async() => {
    let packageInspected = false
    let readAttempted = false
    const entries = [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }] as unknown[]
    Object.defineProperty(entries, Symbol('C:/Users/LENOVO/raw-directory-list'), {
      enumerable: true,
      value: 'hostile-fragment'
    })

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods/private-pack') packageInspected = true
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return entries as never
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('malformed directory arrays must not be read')
      }
    })

    expect(packageInspected).toBe(false)
    expect(readAttempted).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source directory entries metadata contains unsupported fields',
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
  })

  it('rejects malformed raw discovery directory array lengths before reading keys or entries', async() => {
    let packageInspected = false
    let readAttempted = false
    const hostileArray = createMalformedRawDiscoveryDirectoryArrayLength(
      'C:/Users/LENOVO/mods/raw-directory-length'
    )

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods/private-pack') packageInspected = true
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return hostileArray.entries as never
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('malformed directory array lengths must not be read')
      }
    })

    expect(packageInspected).toBe(false)
    expect(readAttempted).toBe(false)
    expect(hostileArray.wasOwnKeysRead()).toBe(false)
    expect(hostileArray.wasEntryRead()).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source directory entries must be dense',
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
    expect(JSON.stringify(report)).not.toContain('hostile-fragment')
    expect(JSON.stringify(report)).not.toContain('raw-directory-length')
  })

  it('rejects over-limit raw discovery directory arrays before reading keys or entries', async() => {
    let packageInspected = false
    let readAttempted = false
    const hostileArray = createOverLimitRawDiscoveryDirectoryArray()
    const limit = CONTENT_PACKAGE_SOURCE_SAFE_READ_LIMITS.maxPackageFileCount

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods/private-pack') packageInspected = true
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return hostileArray.entries as never
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('over-limit directory arrays must not be read')
      }
    })

    expect(packageInspected).toBe(false)
    expect(readAttempted).toBe(false)
    expect(hostileArray.wasOwnKeysRead()).toBe(false)
    expect(hostileArray.wasEntryRead()).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: `Package source directory entries exceed ${limit} entries: ${limit + 1}`,
      sourceCode: 'SOURCE_LIMIT_EXCEEDED'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
    expect(JSON.stringify(report)).not.toContain('hostile-fragment')
  })

  it('reads raw discovery directory array entries from own indexes without invoking presence traps', async() => {
    let presenceChecked = false
    const inspectedPaths: string[] = []
    const entries = new Proxy(
      [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }],
      {
        has(target, property) {
          if (property === '0') {
            presenceChecked = true
            throw new Error('EACCES: has C:/Users/LENOVO/mods/private-pack\nhostile-fragment')
          }
          return Reflect.has(target, property)
        }
      }
    )

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        inspectedPaths.push(filePath)
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath === 'mods/private-pack/manifest.json') return null
        return null
      },
      async readDirectory() {
        return entries as never
      },
      async readTextFile() {
        throw new Error('presence-trap arrays must not reach payload reads')
      }
    })

    expect(presenceChecked).toBe(false)
    expect(inspectedPaths).toEqual(['mods', 'mods/private-pack/manifest.json'])
    expect(report.status).toBe('completed')
    expect(report.summary).toMatchObject({
      scannedEntries: 1,
      candidateCount: 1,
      validPackageCount: 0,
      invalidPackageCount: 1
    })
    expect(report.candidates[0]?.issues[0]).toMatchObject({
      kind: 'missing-manifest',
      path: 'private-pack/manifest.json'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
    expect(JSON.stringify(report)).not.toContain('hostile-fragment')
  })

  it('rejects inherited raw discovery directory array indexes before inspecting packages', async() => {
    let packageInspected = false
    let readAttempted = false
    let inheritedIndexRead = false
    const entries = [] as unknown[]
    Object.defineProperty(entries, 'length', { value: 1 })
    Object.setPrototypeOf(entries, Object.create(Array.prototype, {
      0: {
        enumerable: true,
        get() {
          inheritedIndexRead = true
          throw new Error('EACCES: inherited C:/Users/LENOVO/mods/private-pack index metadata')
        }
      }
    }))

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods/private-pack') packageInspected = true
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return entries as never
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('inherited directory array indexes must not be read')
      }
    })

    expect(packageInspected).toBe(false)
    expect(readAttempted).toBe(false)
    expect(inheritedIndexRead).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source directory entries must be dense',
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
  })

  it('rejects non-enumerable raw discovery directory array indexes before inspecting packages', async() => {
    let packageInspected = false
    let readAttempted = false
    let hiddenIndexRead = false
    const entries = Array(1)
    Object.defineProperty(entries, '0', {
      enumerable: false,
      get() {
        hiddenIndexRead = true
        throw new Error('EACCES: hidden C:/Users/LENOVO/mods/private-pack index metadata')
      }
    })

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods/private-pack') packageInspected = true
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return entries as never
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('hidden directory array indexes must not be read')
      }
    })

    expect(packageInspected).toBe(false)
    expect(readAttempted).toBe(false)
    expect(hiddenIndexRead).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source directory entries must be dense',
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
  })

  it('rejects raw discovery directory array index getter traps before inspecting packages', async() => {
    const entries = new Proxy(
      [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }],
      {
        get(target, property, receiver) {
          if (property === '0') {
            throw new Error('EACCES: get C:/Users/LENOVO/mods/private-pack\nhostile-fragment')
          }
          return Reflect.get(target, property, receiver)
        }
      }
    )

    await expectRawDirectoryArrayTrapRejected(entries)
  })

  it('wraps revoked raw discovery directory arrays as structured diagnostics', async() => {
    const entries = createRevokedProxy([{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }])

    let packageInspected = false
    let readAttempted = false
    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods/private-pack') packageInspected = true
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return entries as never
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('revoked directory arrays must not reach payload reads')
      }
    })

    expect(packageInspected).toBe(false)
    expect(readAttempted).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source list operation failed'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
    expect(JSON.stringify(report)).not.toContain('hostile-fragment')
    expect(JSON.stringify(report)).not.toContain('Cannot perform')
    expect(JSON.stringify(report)).not.toContain('IsArray')
    expect(JSON.stringify(report)).not.toContain('revoked')
  })

  it('wraps revoked raw discovery entry metadata as structured diagnostics', async() => {
    let packageInspected = false
    let listingReadAttempted = false
    const listingEntry = createRevokedProxy({
      name: 'private-pack',
      kind: 'directory',
      isSymbolicLink: false
    })

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods/private-pack') packageInspected = true
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return [listingEntry as never]
      },
      async readTextFile() {
        listingReadAttempted = true
        throw new Error('revoked entry metadata must not reach payload reads')
      }
    })

    expect(packageInspected).toBe(false)
    expect(listingReadAttempted).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(report.candidates).toEqual([])
    expect(report.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source entry metadata could not be read',
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
    expect(JSON.stringify(report)).not.toContain('hostile-fragment')
    expect(JSON.stringify(report)).not.toContain('Cannot perform')
    expect(JSON.stringify(report)).not.toContain('IsArray')
    expect(JSON.stringify(report)).not.toContain('revoked')
  })

  it('rejects inherited raw discovery name and kind metadata before reading packages', async() => {
    const inheritedMetadataCases = [
      {
        fieldName: 'name',
        ownFields: { kind: 'directory', isSymbolicLink: false },
        expectedMessage: 'Package source entry name metadata must be a string'
      },
      {
        fieldName: 'kind',
        ownFields: { name: 'private-pack', isSymbolicLink: false },
        expectedMessage: 'Unsupported package source entry kind'
      }
    ] as const

    for (const inheritedCase of inheritedMetadataCases) {
      let packageInspected = false
      let listingReadAttempted = false
      let inheritedMetadataRead = false
      const listingEntry = Object.create({
        get [inheritedCase.fieldName]() {
          inheritedMetadataRead = true
          throw new Error(`EACCES: inherited C:/Users/LENOVO/mods/private-pack ${inheritedCase.fieldName} metadata`)
        }
      }) as Record<string, unknown>
      Object.defineProperties(
        listingEntry,
        Object.fromEntries(
          Object.entries(inheritedCase.ownFields).map(([fieldName, value]) => [
            fieldName,
            { enumerable: true, value }
          ])
        )
      )

      const report = await discoverThirdPartyDataPacks('mods', {
        async getEntry(filePath) {
          if (filePath === 'mods/private-pack') packageInspected = true
          return filePath === 'mods'
            ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
            : null
        },
        async readDirectory() {
          return [listingEntry as never]
        },
        async readTextFile() {
          listingReadAttempted = true
          throw new Error('inherited entry metadata must not reach payload reads')
        }
      })

      expect(packageInspected).toBe(false)
      expect(listingReadAttempted).toBe(false)
      expect(inheritedMetadataRead).toBe(false)
      expect(report.status).toBe('directory-not-found')
      expect(report.candidates).toEqual([])
      expect(report.issues[0]).toMatchObject({
        kind: 'file-read-failed',
        severity: 'fatal',
        path: '.',
        reason: 'Package source list operation failed'
      })
      expect(report.issues[0]?.diagnostics[0]?.details).toMatchObject({
        message: inheritedCase.expectedMessage,
        sourceCode: 'SOURCE_ENTRY_UNSAFE'
      })
      expect(JSON.stringify(report)).not.toContain('C:/Users')
      expect(JSON.stringify(report)).not.toContain('LENOVO')
    }
  })

  it('rejects raw discovery entries without explicit own symbolic-link flags before reading packages', async() => {
    let packageInspected = false
    let listingReadAttempted = false
    let inheritedListingSymlinkRead = false
    const listingEntry = Object.create({
      get isSymbolicLink() {
        inheritedListingSymlinkRead = true
        throw new Error('EACCES: inherited C:/Users/LENOVO/mods/private-pack symlink metadata')
      }
    }) as Record<string, unknown>
    Object.defineProperties(listingEntry, {
      name: { enumerable: true, value: 'private-pack' },
      kind: { enumerable: true, value: 'directory' }
    })
    const listingReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods/private-pack') packageInspected = true
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return [listingEntry as never]
      },
      async readTextFile() {
        listingReadAttempted = true
        throw new Error('missing symbolic-link metadata must not reach payload reads')
      }
    })

    expect(packageInspected).toBe(false)
    expect(listingReadAttempted).toBe(false)
    expect(inheritedListingSymlinkRead).toBe(false)
    expect(listingReport.status).toBe('directory-not-found')
    expect(listingReport.candidates).toEqual([])
    expect(listingReport.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(listingReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source entry must expose an explicit symbolic-link flag',
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })

    let manifestReadAttempted = false
    let inheritedManifestSymlinkRead = false
    const manifestEntry = Object.create({
      get isSymbolicLink() {
        inheritedManifestSymlinkRead = true
        throw new Error('EACCES: inherited C:/Users/LENOVO/mods/manifest symlink metadata')
      }
    }) as Record<string, unknown>
    Object.defineProperties(manifestEntry, {
      name: { enumerable: true, value: 'manifest.json' },
      kind: { enumerable: true, value: 'file' }
    })
    const manifestReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath === 'mods/private-pack/manifest.json') {
          return manifestEntry as never
        }
        return null
      },
      async readDirectory(filePath) {
        if (filePath === 'mods') {
          return [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }]
        }
        throw new Error(`Unexpected directory read: ${filePath}`)
      },
      async readTextFile() {
        manifestReadAttempted = true
        throw new Error('missing symbolic-link metadata must stop before manifest reads')
      }
    })

    expect(manifestReadAttempted).toBe(false)
    expect(inheritedManifestSymlinkRead).toBe(false)
    expect(manifestReport.status).toBe('completed')
    expect(manifestReport.summary).toMatchObject({
      candidateCount: 1,
      validPackageCount: 0,
      invalidPackageCount: 1
    })
    expect(manifestReport.candidates[0]?.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      path: 'private-pack/manifest.json',
      reason: 'Package source inspect operation failed'
    })
    expect(manifestReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source entry must expose an explicit symbolic-link flag',
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })

    for (const report of [listingReport, manifestReport]) {
      expect(JSON.stringify(report)).not.toContain('C:/Users')
      expect(JSON.stringify(report)).not.toContain('LENOVO')
    }
  })

  it('rejects non-enumerable raw discovery entry metadata before reading packages', async() => {
    let packageInspected = false
    let listingReadAttempted = false
    const listingEntry = defineHiddenRawDiscoveryGetter({
      name: 'private-pack',
      kind: 'directory'
    }, 'isSymbolicLink')

    const listingReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods/private-pack') packageInspected = true
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        return [listingEntry.value as never]
      },
      async readTextFile() {
        listingReadAttempted = true
        throw new Error('hidden listing metadata must not reach payload reads')
      }
    })

    expect(packageInspected).toBe(false)
    expect(listingReadAttempted).toBe(false)
    expect(listingEntry.wasRead()).toBe(false)
    expect(listingReport.status).toBe('directory-not-found')
    expect(listingReport.candidates).toEqual([])
    expect(listingReport.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(listingReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source entry metadata contains unsupported fields',
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })

    let manifestReadAttempted = false
    const manifestEntry = defineHiddenRawDiscoveryGetter({
      name: 'manifest.json',
      kind: 'file'
    }, 'isSymbolicLink')
    const manifestReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath === 'mods/private-pack/manifest.json') return manifestEntry.value as never
        return null
      },
      async readDirectory(filePath) {
        if (filePath === 'mods') {
          return [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }]
        }
        throw new Error(`Unexpected directory read: ${filePath}`)
      },
      async readTextFile() {
        manifestReadAttempted = true
        throw new Error('hidden manifest metadata must not reach payload reads')
      }
    })

    expect(manifestReadAttempted).toBe(false)
    expect(manifestEntry.wasRead()).toBe(false)
    expect(manifestReport.candidates[0]?.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      path: 'private-pack/manifest.json',
      reason: 'Package source inspect operation failed'
    })
    expect(manifestReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source entry metadata contains unsupported fields',
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })

    for (const report of [listingReport, manifestReport]) {
      expect(JSON.stringify(report)).not.toContain('C:/Users')
      expect(JSON.stringify(report)).not.toContain('LENOVO')
    }
  })

  it('rejects malformed raw getEntry metadata before reading entrypoint payloads', async() => {
    const readPaths: string[] = []
    const manifest = {
      id: 'raw_metadata_pack',
      name: { key: 'raw_metadata_pack.package.name', fallback: 'Raw metadata pack' },
      version: '1.0.0',
      gameVersion: '2.4.0',
      engineApiVersion: '1',
      contentSchemaVersion: '1',
      defaultLocale: 'zh-CN',
      locales: { 'zh-CN': 'locales/zh-CN.json' },
      authors: [{ name: 'Raw Metadata Safety Tester', role: 'developer' }],
      license: 'MIT',
      dependencies: [],
      entrypoints: { 'taoyuan:item': ['data/items.json'] }
    }

    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath === 'mods/raw-metadata-pack') {
          return { name: 'raw-metadata-pack', kind: 'directory', isSymbolicLink: false }
        }
        if (filePath === 'mods/raw-metadata-pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        if (filePath === 'mods/raw-metadata-pack/data') {
          return { name: '../userdata', kind: 'directory', isSymbolicLink: false } as never
        }
        return null
      },
      async readDirectory(directoryPath) {
        if (directoryPath === 'mods') {
          return [{ name: 'raw-metadata-pack', kind: 'directory', isSymbolicLink: false }]
        }
        throw new Error(`Unexpected directory read: ${directoryPath}`)
      },
      async readTextFile(filePath) {
        readPaths.push(filePath)
        if (filePath === 'mods/raw-metadata-pack/manifest.json') {
          return `${JSON.stringify(manifest, null, 2)}\n`
        }
        throw new Error('malformed entrypoint metadata must stop before payload reads')
      }
    })

    expect(readPaths).toEqual(['mods/raw-metadata-pack/manifest.json'])
    expect(report.summary).toMatchObject({
      candidateCount: 1,
      validPackageCount: 0,
      invalidPackageCount: 1
    })
    expect(report.candidates[0]?.issues).toContainEqual(expect.objectContaining({
      kind: 'path-unsafe',
      path: 'raw-metadata-pack/data/items.json',
      reason: 'Package source inspect operation failed'
    }))
    expect(report.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source entry name is unsafe',
      sourceCode: 'SOURCE_PATH_UNSAFE'
    })
    expect(JSON.stringify(report)).not.toContain('userdata')
  })

  it('redacts raw file system failures before discovery diagnostics expose host text', async() => {
    const inspectFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry() {
        throw createHostFailure('EACCES: lstat C:/Users/LENOVO/mods\nhostile-fragment')
      },
      async readDirectory() {
        throw new Error('inspect failure must stop before listing')
      },
      async readTextFile() {
        throw new Error('inspect failure must stop before reading')
      }
    })

    const listFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        throw createHostFailure('EACCES: scandir C:/Users/LENOVO/mods\nhostile-fragment')
      },
      async readTextFile() {
        throw new Error('list failure must stop before reading')
      }
    })

    const readFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath === 'mods/private-pack') {
          return { name: 'private-pack', kind: 'directory', isSymbolicLink: false }
        }
        if (filePath === 'mods/private-pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory(filePath) {
        if (filePath === 'mods') {
          return [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }]
        }
        return []
      },
      async readTextFile() {
        throw createHostFailure(
          'EACCES: open \\\\LENOVO\\mods\\private-pack\\manifest.json',
          'C:/Users/LENOVO/mods/private-pack/manifest.json'
        )
      }
    })

    expect(inspectFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source inspect operation failed',
      sourceCode: 'EACCES'
    })
    expect(listFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source list operation failed',
      sourceCode: 'EACCES'
    })
    expect(readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source read operation failed',
      sourceCode: 'EACCES'
    })
    for (const report of [inspectFailureReport, listFailureReport, readFailureReport]) {
      expect(JSON.stringify(report)).not.toContain('C:/Users')
      expect(JSON.stringify(report)).not.toContain('LENOVO')
      expect(JSON.stringify(report)).not.toContain('hostile-fragment')
    }
  })

  it('redacts unsafe raw file system source paths even when messages look safe', async() => {
    const inspectFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry() {
        throw createHostFailure(
          'Permission denied while inspecting package source',
          'C:/Users/LENOVO/mods/private-pack'
        )
      },
      async readDirectory() {
        throw new Error('inspect source-path failure must stop before listing')
      },
      async readTextFile() {
        throw new Error('inspect source-path failure must stop before reading')
      }
    })

    const listFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        throw createHostFailure(
          'Permission denied while listing package source',
          'C:/Users/LENOVO/mods'
        )
      },
      async readTextFile() {
        throw new Error('list source-path failure must stop before reading')
      }
    })

    const readFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath === 'mods/private-pack') {
          return { name: 'private-pack', kind: 'directory', isSymbolicLink: false }
        }
        if (filePath === 'mods/private-pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory(filePath) {
        if (filePath === 'mods') {
          return [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }]
        }
        return []
      },
      async readTextFile() {
        throw createHostFailure(
          'Permission denied while reading package source',
          'C:/Users/LENOVO/mods/private-pack/manifest.json'
        )
      }
    })

    expect(inspectFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source inspect operation failed',
      sourceCode: 'EACCES'
    })
    expect(listFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source list operation failed',
      sourceCode: 'EACCES'
    })
    expect(readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source read operation failed',
      sourceCode: 'EACCES'
    })
    for (const report of [inspectFailureReport, listFailureReport, readFailureReport]) {
      expect(JSON.stringify(report)).not.toContain('C:/Users')
      expect(JSON.stringify(report)).not.toContain('LENOVO')
    }
  })

  it('redacts control-character raw file system source paths even when messages look safe', async() => {
    const inspectFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry() {
        throw createHostFailure(
          'Permission denied while inspecting package source',
          'mods/private-pack\nhostile-fragment'
        )
      },
      async readDirectory() {
        throw new Error('inspect control-character source-path failure must stop before listing')
      },
      async readTextFile() {
        throw new Error('inspect control-character source-path failure must stop before reading')
      }
    })

    const listFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        throw createHostFailure(
          'Permission denied while listing package source',
          'mods\nhostile-fragment'
        )
      },
      async readTextFile() {
        throw new Error('list control-character source-path failure must stop before reading')
      }
    })

    const readFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath === 'mods/private-pack') {
          return { name: 'private-pack', kind: 'directory', isSymbolicLink: false }
        }
        if (filePath === 'mods/private-pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory(filePath) {
        if (filePath === 'mods') {
          return [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }]
        }
        return []
      },
      async readTextFile() {
        throw createHostFailure(
          'Permission denied while reading package source',
          'mods/private-pack/manifest.json\nhostile-fragment'
        )
      }
    })

    expect(inspectFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source inspect operation failed',
      sourceCode: 'EACCES'
    })
    expect(listFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source list operation failed',
      sourceCode: 'EACCES'
    })
    expect(readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source read operation failed',
      sourceCode: 'EACCES'
    })
    for (const report of [inspectFailureReport, listFailureReport, readFailureReport]) {
      expect(JSON.stringify(report)).not.toContain('hostile-fragment')
      expect(JSON.stringify(report)).not.toContain('\\n')
    }
  })

  it('ignores extra raw file system failure fields before diagnostics expose host text', async() => {
    const inspectFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry() {
        throw createExtraFieldHostFailure(
          'Permission denied while inspecting package source',
          'mods/private-pack'
        )
      },
      async readDirectory() {
        throw new Error('inspect extra-field failure must stop before listing')
      },
      async readTextFile() {
        throw new Error('inspect extra-field failure must stop before reading')
      }
    })

    const listFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        throw createExtraFieldHostFailure(
          'Permission denied while listing package source',
          'mods'
        )
      },
      async readTextFile() {
        throw new Error('list extra-field failure must stop before reading')
      }
    })

    const readFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath === 'mods/private-pack') {
          return { name: 'private-pack', kind: 'directory', isSymbolicLink: false }
        }
        if (filePath === 'mods/private-pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory(filePath) {
        if (filePath === 'mods') {
          return [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }]
        }
        return []
      },
      async readTextFile() {
        throw createExtraFieldHostFailure(
          'Permission denied while reading package source',
          'mods/private-pack/manifest.json'
        )
      }
    })

    expect(inspectFailureReport.issues[0]?.diagnostics[0]?.details).toEqual({
      reason: 'Package source inspect operation failed',
      message: 'Package source inspect operation failed',
      sourceCode: 'EACCES'
    })
    expect(listFailureReport.issues[0]?.diagnostics[0]?.details).toEqual({
      reason: 'Package source list operation failed',
      message: 'Package source list operation failed',
      sourceCode: 'EACCES'
    })
    expect(readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toEqual({
      reason: 'Package source read operation failed',
      message: 'Package source read operation failed',
      sourceCode: 'EACCES'
    })
    for (const report of [inspectFailureReport, listFailureReport, readFailureReport]) {
      expect(JSON.stringify(report)).not.toContain('hostPath')
      expect(JSON.stringify(report)).not.toContain('rawDetails')
      expect(JSON.stringify(report)).not.toContain('C:/Users')
      expect(JSON.stringify(report)).not.toContain('LENOVO')
      expect(JSON.stringify(report)).not.toContain('hostile-fragment')
    }
  })

  it('redacts unstructured raw file system failure messages even when they look path-free', async() => {
    const inspectFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry() {
        throw new Error('hostile-fragment')
      },
      async readDirectory() {
        throw new Error('inspect failure must stop before listing')
      },
      async readTextFile() {
        throw new Error('inspect failure must stop before reading')
      }
    })

    const listFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        throw new Error('hostile-fragment')
      },
      async readTextFile() {
        throw new Error('list failure must stop before reading')
      }
    })

    const readFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath === 'mods/private-pack') {
          return { name: 'private-pack', kind: 'directory', isSymbolicLink: false }
        }
        if (filePath === 'mods/private-pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory(filePath) {
        if (filePath === 'mods') {
          return [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }]
        }
        return []
      },
      async readTextFile() {
        throw new Error('hostile-fragment')
      }
    })

    const codedInspectFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry() {
        throw createHostFailure('hostile-fragment')
      },
      async readDirectory() {
        throw new Error('coded inspect failure must stop before listing')
      },
      async readTextFile() {
        throw new Error('coded inspect failure must stop before reading')
      }
    })

    expect(inspectFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source inspect operation failed'
    })
    expect(listFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source list operation failed'
    })
    expect(readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source read operation failed'
    })
    expect(codedInspectFailureReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Package source inspect operation failed',
      sourceCode: 'EACCES'
    })
    for (const report of [
      inspectFailureReport,
      listFailureReport,
      readFailureReport,
      codedInspectFailureReport
    ]) {
      expect(JSON.stringify(report)).not.toContain('hostile-fragment')
    }
  })

  it('redacts unsafe raw file system failure codes before diagnostics expose host text', async() => {
    const inspectFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry() {
        throw createUnsafeCodeHostFailure()
      },
      async readDirectory() {
        throw new Error('inspect failure must stop before listing')
      },
      async readTextFile() {
        throw new Error('inspect failure must stop before reading')
      }
    })

    const listFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        throw createUnsafeCodeHostFailure()
      },
      async readTextFile() {
        throw new Error('list failure must stop before reading')
      }
    })

    const readFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath === 'mods/private-pack') {
          return { name: 'private-pack', kind: 'directory', isSymbolicLink: false }
        }
        if (filePath === 'mods/private-pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory(filePath) {
        if (filePath === 'mods') {
          return [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }]
        }
        return []
      },
      async readTextFile() {
        throw createUnsafeCodeHostFailure()
      }
    })

    const inspectDetails = inspectFailureReport.issues[0]?.diagnostics[0]?.details ?? {}
    const listDetails = listFailureReport.issues[0]?.diagnostics[0]?.details ?? {}
    const readDetails = readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details ?? {}

    expect(inspectDetails).toMatchObject({ message: 'Package source inspect operation failed' })
    expect(listDetails).toMatchObject({ message: 'Package source list operation failed' })
    expect(readDetails).toMatchObject({ message: 'Package source read operation failed' })
    expect(inspectDetails).not.toHaveProperty('sourceCode')
    expect(listDetails).not.toHaveProperty('sourceCode')
    expect(readDetails).not.toHaveProperty('sourceCode')
    for (const report of [inspectFailureReport, listFailureReport, readFailureReport]) {
      expect(JSON.stringify(report)).not.toContain('C:/Users')
      expect(JSON.stringify(report)).not.toContain('LENOVO')
      expect(JSON.stringify(report)).not.toContain('hostile-fragment')
    }
  })

  it('ignores inherited raw file system failure code metadata before diagnostics', async() => {
    const inheritedFailure = createInheritedCodeHostFailure()
    const report = await discoverThirdPartyDataPacks('mods', {
      async getEntry() {
        throw inheritedFailure.error
      },
      async readDirectory() {
        throw new Error('inherited raw failure metadata must stop before listing')
      },
      async readTextFile() {
        throw new Error('inherited raw failure metadata must stop before reading')
      }
    })

    const details = report.issues[0]?.diagnostics[0]?.details ?? {}

    expect(inheritedFailure.wasCodeRead()).toBe(false)
    expect(report.status).toBe('directory-not-found')
    expect(details).toMatchObject({
      message: 'Package source inspect operation failed'
    })
    expect(details).not.toHaveProperty('sourceCode')
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
    expect(JSON.stringify(report)).not.toContain('source-code')
    expect(JSON.stringify(report)).not.toContain('hostile-fragment')
  })

  it('redacts unreadable raw file system failure metadata before diagnostics can crash or leak', async() => {
    const inspectFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry() {
        throw createHostileFailureMetadata()
      },
      async readDirectory() {
        throw new Error('inspect failure must stop before listing')
      },
      async readTextFile() {
        throw new Error('inspect failure must stop before reading')
      }
    })

    const listFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        return filePath === 'mods'
          ? { name: 'mods', kind: 'directory', isSymbolicLink: false }
          : null
      },
      async readDirectory() {
        throw createHostileFailureMetadata()
      },
      async readTextFile() {
        throw new Error('list failure must stop before reading')
      }
    })

    const readFailureReport = await discoverThirdPartyDataPacks('mods', {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath === 'mods/private-pack') {
          return { name: 'private-pack', kind: 'directory', isSymbolicLink: false }
        }
        if (filePath === 'mods/private-pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory(filePath) {
        if (filePath === 'mods') {
          return [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }]
        }
        return []
      },
      async readTextFile() {
        throw createHostileFailureMetadata()
      }
    })

    const inspectDetails = inspectFailureReport.issues[0]?.diagnostics[0]?.details ?? {}
    const listDetails = listFailureReport.issues[0]?.diagnostics[0]?.details ?? {}
    const readDetails = readFailureReport.candidates[0]?.issues[0]?.diagnostics[0]?.details ?? {}

    expect(inspectDetails).toMatchObject({ message: 'Package source inspect operation failed' })
    expect(listDetails).toMatchObject({ message: 'Package source list operation failed' })
    expect(readDetails).toMatchObject({ message: 'Package source read operation failed' })
    expect(inspectDetails).not.toHaveProperty('sourceCode')
    expect(listDetails).not.toHaveProperty('sourceCode')
    expect(readDetails).not.toHaveProperty('sourceCode')
    for (const report of [inspectFailureReport, listFailureReport, readFailureReport]) {
      expect(JSON.stringify(report)).not.toContain('C:/Users')
      expect(JSON.stringify(report)).not.toContain('LENOVO')
      expect(JSON.stringify(report)).not.toContain('hostile-fragment')
    }
  })

  it('accepts legacy manifests that omit dependency fields', async() => {
    const root = await createRoot()
    await createPack(root, 'legacy-manifest-pack', {
      id: 'legacy_manifest',
      omitDependencyFields: true
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.summary).toMatchObject({
      validPackageCount: 1,
      invalidPackageCount: 0,
      issueCount: 0
    })
    expect(report.candidates[0]?.manifest?.dependencies).toBeUndefined()
  })

  it('accepts exact, minimum and caret dependency ranges when the target package satisfies them', async() => {
    const root = await createRoot()
    await createPack(root, 'library-pack', { id: 'library_pack', version: '1.2.3' })
    await createPack(root, 'exact-dependent', {
      id: 'exact_dependent',
      dependencies: [{ id: 'library_pack', version: '1.2.3' }]
    })
    await createPack(root, 'minimum-dependent', {
      id: 'minimum_dependent',
      dependencies: [{ id: 'library_pack', version: '>=1.0.0' }]
    })
    await createPack(root, 'caret-dependent', {
      id: 'caret_dependent',
      dependencies: [{ id: 'library_pack', version: '^1.0.0' }]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.summary).toMatchObject({
      candidateCount: 4,
      validPackageCount: 4,
      invalidPackageCount: 0,
      issueCount: 0
    })
  })

  it('reports missing and mismatched required dependencies as blocking errors', async() => {
    const root = await createRoot()
    await createPack(root, 'missing-dependent', {
      id: 'missing_dependent',
      dependencies: [{ id: 'missing_library', version: '1.0.0' }]
    })
    await createPack(root, 'old-library', { id: 'old_library', version: '2.0.0' })
    await createPack(root, 'mismatch-dependent', {
      id: 'mismatch_dependent',
      dependencies: [{ id: 'old_library', version: '^1.0.0' }]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'dependency-missing',
      packageId: 'missing_dependent',
      relatedPackageIds: ['missing_library'],
      severity: 'error'
    }))
    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'dependency-version-mismatch',
      packageId: 'mismatch_dependent',
      relatedPackageIds: ['old_library'],
      severity: 'error'
    }))
    expect(report.summary.invalidPackageCount).toBe(2)
  })

  it('copies and freezes candidate issue diagnostics before exposing top-level discovery issues', async() => {
    const root = await createRoot()
    await createPack(root, 'missing-dependent', {
      id: 'missing_dependent',
      dependencies: [{ id: 'missing_library', version: '1.0.0' }]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())
    const candidateIssue = report.candidates[0]?.issues.find(issue => issue.kind === 'dependency-missing')
    const topLevelIssue = report.issues.find(issue => issue.kind === 'dependency-missing')
    if (!candidateIssue || !topLevelIssue) throw new Error('Expected a dependency-missing discovery issue')

    const candidateDiagnostic = candidateIssue.diagnostics[0]
    const topLevelDiagnostic = topLevelIssue.diagnostics[0]
    if (!candidateDiagnostic || !topLevelDiagnostic) throw new Error('Expected a dependency-missing diagnostic')

    expect(candidateIssue).not.toBe(topLevelIssue)
    expect(candidateIssue.relatedPackageIds).not.toBe(topLevelIssue.relatedPackageIds)
    expect(candidateDiagnostic).not.toBe(topLevelDiagnostic)
    expect(candidateDiagnostic.relatedPackageIds).not.toBe(topLevelDiagnostic.relatedPackageIds)
    expect(candidateDiagnostic.details).not.toBe(topLevelDiagnostic.details)
    expect(topLevelIssue.relatedPackageIds).toEqual(['missing_library'])
    expect(topLevelDiagnostic).toMatchObject({
      stage: 'third-party.discovery.dependency-missing',
      relatedPackageIds: ['missing_library'],
      details: {
        reason: 'Required dependency package is missing',
        dependencyId: 'missing_library',
        range: '1.0.0'
      }
    })
    expect(Object.isFrozen(report)).toBe(true)
    expect(Object.isFrozen(report.candidates)).toBe(true)
    expect(Object.isFrozen(report.issues)).toBe(true)
    expect(Object.isFrozen(report.summary)).toBe(true)
    expect(Object.isFrozen(report.candidates[0])).toBe(true)
    expect(Object.isFrozen(report.candidates[0]?.issues)).toBe(true)
    expect(Object.isFrozen(candidateIssue)).toBe(true)
    expect(Object.isFrozen(candidateIssue.relatedPackageIds)).toBe(true)
    expect(Object.isFrozen(candidateIssue.diagnostics)).toBe(true)
    expect(Object.isFrozen(candidateDiagnostic)).toBe(true)
    expect(Object.isFrozen(candidateDiagnostic.relatedPackageIds)).toBe(true)
    expect(Object.isFrozen(candidateDiagnostic.details)).toBe(true)
    expect(Object.isFrozen(topLevelIssue)).toBe(true)
    expect(Object.isFrozen(topLevelIssue.relatedPackageIds)).toBe(true)
    expect(Object.isFrozen(topLevelIssue.diagnostics)).toBe(true)
    expect(Object.isFrozen(topLevelDiagnostic)).toBe(true)
    expect(Object.isFrozen(topLevelDiagnostic.relatedPackageIds)).toBe(true)
    expect(Object.isFrozen(topLevelDiagnostic.details)).toBe(true)

    const reportJsonBeforeMutationAttempts = JSON.stringify(report)
    type MutableIssue = {
      relatedPackageIds?: string[]
      diagnostics: Array<{
        stage: string
        relatedPackageIds?: string[]
        details?: Record<string, unknown>
      }>
    }
    type MutableReport = {
      status: string
      candidates: unknown[]
      issues: unknown[]
      summary: { issueCount: number }
    }

    const mutableReport = report as unknown as MutableReport
    const mutableCandidateIssue = candidateIssue as unknown as MutableIssue
    expect(() => { mutableReport.status = 'empty' }).toThrow(TypeError)
    expect(() => { mutableReport.candidates.push({}) }).toThrow(TypeError)
    expect(() => { mutableReport.issues.push({}) }).toThrow(TypeError)
    expect(() => { mutableReport.summary.issueCount = 999 }).toThrow(TypeError)
    expect(() => { mutableCandidateIssue.relatedPackageIds![0] = 'mutated_dependency' }).toThrow(TypeError)
    expect(() => { mutableCandidateIssue.diagnostics[0]!.stage = 'mutated-candidate-stage' }).toThrow(TypeError)
    expect(() => {
      mutableCandidateIssue.diagnostics[0]!.relatedPackageIds![0] = 'mutated_diagnostic_dependency'
    }).toThrow(TypeError)
    expect(() => {
      mutableCandidateIssue.diagnostics[0]!.details!.reason = 'mutated candidate reason'
    }).toThrow(TypeError)

    expect(topLevelIssue.relatedPackageIds).toEqual(['missing_library'])
    expect(topLevelDiagnostic).toMatchObject({
      stage: 'third-party.discovery.dependency-missing',
      relatedPackageIds: ['missing_library'],
      details: { reason: 'Required dependency package is missing' }
    })

    const mutableTopLevelIssue = topLevelIssue as unknown as MutableIssue
    expect(() => { mutableTopLevelIssue.relatedPackageIds![0] = 'mutated_top_dependency' }).toThrow(TypeError)
    expect(() => { mutableTopLevelIssue.diagnostics[0]!.stage = 'mutated-top-stage' }).toThrow(TypeError)
    expect(() => {
      mutableTopLevelIssue.diagnostics[0]!.relatedPackageIds![0] = 'mutated_top_diagnostic_dependency'
    }).toThrow(TypeError)
    expect(() => {
      mutableTopLevelIssue.diagnostics[0]!.details!.reason = 'mutated top reason'
    }).toThrow(TypeError)

    expect(JSON.stringify(report)).toBe(reportJsonBeforeMutationAttempts)
    expect(candidateIssue.relatedPackageIds).toEqual(['missing_library'])
    expect(candidateDiagnostic).toMatchObject({
      stage: 'third-party.discovery.dependency-missing',
      relatedPackageIds: ['missing_library'],
      details: { reason: 'Required dependency package is missing' }
    })
  })

  it('freezes copied candidate manifests and content files before exposing discovery candidates', async() => {
    const root = await createRoot()
    await createPack(root, 'frozen-candidate', {
      id: 'frozen_candidate',
      dependencies: [{ id: 'base_library', version: '^1.0.0' }],
      optionalDependencies: [{ id: 'optional_library', version: '>=1.0.0' }],
      conflicts: [{ id: 'blocked_library', version: '2.0.0' }]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())
    const candidate = report.candidates[0]
    const manifest = candidate?.manifest
    const contentFile = candidate?.contentFiles[0]
    const contentEntry = contentFile?.entries[0]
    const validatedEntry = contentFile?.validatedEntries[0]
    if (!candidate || !manifest || !contentFile || !contentEntry || !validatedEntry) {
      throw new Error('Expected a discovered candidate with manifest and content entries.')
    }

    expect(Object.isFrozen(manifest)).toBe(true)
    expect(Object.isFrozen(manifest.name)).toBe(true)
    expect(Object.isFrozen(manifest.authors)).toBe(true)
    expect(Object.isFrozen(manifest.authors[0])).toBe(true)
    expect(Object.isFrozen(manifest.entrypoints)).toBe(true)
    expect(Object.isFrozen(manifest.entrypoints['taoyuan:item'])).toBe(true)
    expect(Object.isFrozen(manifest.dependencies)).toBe(true)
    expect(Object.isFrozen(manifest.optionalDependencies)).toBe(true)
    expect(Object.isFrozen(manifest.conflicts)).toBe(true)
    expect(Object.isFrozen(candidate.contentFiles)).toBe(true)
    expect(Object.isFrozen(contentFile)).toBe(true)
    expect(Object.isFrozen(contentFile.entries)).toBe(true)
    expect(Object.isFrozen(contentEntry)).toBe(true)
    expect(Object.isFrozen(contentFile.validatedEntries)).toBe(true)
    expect(Object.isFrozen(validatedEntry)).toBe(true)
    expect(Object.isFrozen((validatedEntry as unknown as JsonObject).name)).toBe(true)

    expect(manifest.entrypoints['taoyuan:item']).toEqual(['data/items.json'])
    expect(contentFile).toMatchObject({
      registryId: 'taoyuan:item',
      path: 'data/items.json',
      entryCount: 1
    })
    expect(contentEntry).toMatchObject({
      registryId: 'taoyuan:item',
      contentId: 'frozen_candidate:linen_ribbon',
      path: 'data/items.json',
      index: 0
    })
    expect(validatedEntry).toMatchObject({
      id: 'frozen_candidate:linen_ribbon',
      name: {
        fallback: 'Linen ribbon'
      }
    })

    const mutableManifest = manifest as unknown as {
      name: { fallback: string }
      entrypoints: Record<string, string[]>
      dependencies: Array<{ id: string }>
    }
    const mutableContentFiles = candidate.contentFiles as unknown as unknown[]
    const mutableContentFile = contentFile as unknown as {
      path: string
      entries: Array<{ path: string }>
      validatedEntries: Array<{ name: { fallback: string } }>
    }

    expect(() => { mutableManifest.name.fallback = 'Mutated package' }).toThrow(TypeError)
    expect(() => { mutableManifest.entrypoints['taoyuan:item']!.push('data/extra.json') }).toThrow(TypeError)
    expect(() => { mutableManifest.dependencies[0]!.id = 'mutated_library' }).toThrow(TypeError)
    expect(() => { mutableContentFiles.push({}) }).toThrow(TypeError)
    expect(() => { mutableContentFile.path = 'mutated/items.json' }).toThrow(TypeError)
    expect(() => { mutableContentFile.entries[0]!.path = 'mutated/items.json' }).toThrow(TypeError)
    expect(() => { mutableContentFile.validatedEntries[0]!.name.fallback = 'Mutated item' }).toThrow(TypeError)
  })

  it('keeps missing optional dependencies as warnings but blocks optional version mismatches', async() => {
    const root = await createRoot()
    await createPack(root, 'optional-warning', {
      id: 'optional_warning',
      optionalDependencies: [{ id: 'missing_optional', version: '^1.0.0' }]
    })
    await createPack(root, 'optional-library', { id: 'optional_library', version: '2.0.0' })
    await createPack(root, 'optional-mismatch', {
      id: 'optional_mismatch',
      optionalDependencies: [{ id: 'optional_library', version: '^1.0.0' }]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'optional-dependency-missing',
      packageId: 'optional_warning',
      severity: 'warning'
    }))
    expect(report.candidates.find(candidate => candidate.packageId === 'optional_warning')?.status).toBe('valid')
    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'dependency-version-mismatch',
      packageId: 'optional_mismatch',
      severity: 'error'
    }))
    expect(report.candidates.find(candidate => candidate.packageId === 'optional_mismatch')?.status).toBe('invalid')
  })

  it('reports explicit package conflicts as blocking diagnostics', async() => {
    const root = await createRoot()
    await createPack(root, 'conflicted-library', { id: 'conflicted_library', version: '1.5.0' })
    await createPack(root, 'conflict-declarer', {
      id: 'conflict_declarer',
      conflicts: [{ id: 'conflicted_library', version: '^1.0.0' }]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'package-conflict',
      packageId: 'conflict_declarer',
      relatedPackageIds: ['conflicted_library'],
      severity: 'error'
    }))
    expect(report.summary.invalidPackageCount).toBe(1)
  })

  it('reports same-package duplicate registry entry ids as blocking errors', async() => {
    const root = await createRoot()
    const duplicateItem = {
      id: 'duplicate_pack:shared_item',
      name: { key: 'duplicate.item.name', fallback: 'Shared item' },
      category: 'gift',
      description: { key: 'duplicate.item.description', fallback: 'Duplicate test item.' },
      sellPrice: 10,
      edible: false
    }
    await createPack(root, 'duplicate-pack', {
      id: 'duplicate_pack',
      itemEntries: [
        duplicateItem,
        { ...duplicateItem, sellPrice: 11 }
      ]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'registry-entry-duplicate',
      packageId: 'duplicate_pack',
      registryId: 'taoyuan:item',
      contentId: 'duplicate_pack:shared_item',
      severity: 'error'
    }))
    expect(report.candidates[0]?.status).toBe('invalid')
  })

  it('reports cross-package registry conflicts and identical duplicates separately', async() => {
    const root = await createRoot()
    const sharedItem = {
      id: 'shared_namespace:festival_token',
      name: { key: 'shared.item.name', fallback: 'Festival token' },
      category: 'gift',
      description: { key: 'shared.item.description', fallback: 'Shared test item.' },
      sellPrice: 10,
      edible: false
    }
    await createPack(root, 'a-first-shared', { id: 'first_shared', itemEntries: [sharedItem] })
    await createPack(root, 'b-identical-shared', { id: 'identical_shared', itemEntries: [sharedItem] })
    await createPack(root, 'c-conflicting-shared', {
      id: 'conflicting_shared',
      itemEntries: [{ ...sharedItem, sellPrice: 99 }]
    })

    const report = await discoverThirdPartyDataPacks(root, createNodeFileSystem())

    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'registry-entry-duplicate-identical',
      packageId: 'identical_shared',
      registryId: 'taoyuan:item',
      contentId: 'shared_namespace:festival_token',
      severity: 'warning'
    }))
    expect(report.candidates.find(candidate => candidate.packageId === 'identical_shared')?.status).toBe('valid')
    expect(report.issues).toContainEqual(expect.objectContaining({
      kind: 'registry-entry-conflict',
      packageId: 'conflicting_shared',
      registryId: 'taoyuan:item',
      contentId: 'shared_namespace:festival_token',
      severity: 'error'
    }))
    expect(report.candidates.find(candidate => candidate.packageId === 'conflicting_shared')?.status).toBe('invalid')
  })

  it('keeps official registry counts and hashes unchanged after scanning invalid third-party packages', async() => {
    const before = countOfficialEntries()
    const report = await discoverThirdPartyDataPacks(fixtureRoot, createNodeFileSystem())
    const after = countOfficialEntries()

    expect(report.summary.invalidPackageCount).toBeGreaterThan(0)
    expect(after).toEqual(before)
    expect(after).toEqual({
      registryCount: 54,
      entryCount: 4242,
      snapshotHash: committedMetadata.snapshotHash
    })
    expect(committedMetadata).toMatchObject({
      artifactHash: 'sha256:2948895f8961ff54df5ff91869fd4f07a16db6df1b3274fef921561be5f71732',
      contentHash: 'sha256:588d16eb0f16a193c0fc741fb73908ef0dc99549aff9a0d3b91dfd25c0ee985b',
      schemaSetHash: 'sha256:38c1ce55e1c5ac8f84089f1adf3e11a81ff486ac43db7ac8ec18a55fba11af26',
      environmentHash: 'sha256:4f52687194773d59c5c6260f6170bfa290c180d21d8bb24904bbcee1e3c5e22b',
      snapshotHash: 'sha256:4e87e4bc1d6310d4467335da77603006bf769fdb5c4da45ad927f7ed85a5c4b3'
    })
  })

  it('does not read or modify player data while discovering package candidates', async() => {
    const root = await createRoot()
    const modsRoot = path.join(root, 'mods')
    const userDataRoot = path.join(root, 'userdata')
    const settingsPath = path.join(userDataRoot, 'settings.json')
    const savePath = path.join(userDataRoot, 'Local Storage', 'leveldb', 'save.ldb')
    await mkdir(path.dirname(savePath), { recursive: true })
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(modsRoot, 'valid-gift-pack'), { recursive: true })
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const readPaths: string[] = []

    const report = await discoverThirdPartyDataPacks(modsRoot, createNodeFileSystem(readPaths))

    expect(report.summary.validPackageCount).toBe(1)
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(readPaths.map(item => item.replace(/\\/g, '/')))
      .not.toEqual(expect.arrayContaining([
        expect.stringContaining('/userdata/')
      ]))
  })

  it('does not read unrelated large files in a mixed package directory', async() => {
    const root = await createRoot()
    const modsRoot = path.join(root, 'mods')
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(modsRoot, 'valid-gift-pack'), { recursive: true })
    await writeFile(path.join(modsRoot, 'large-video.bin'), 'x'.repeat(1024 * 1024), 'utf8')
    for (let index = 0; index < 500; index += 1) {
      await writeFile(path.join(modsRoot, `note-${index}.txt`), 'skip', 'utf8')
    }
    const readPaths: string[] = []

    const startedAt = performance.now()
    const report = await discoverThirdPartyDataPacks(modsRoot, createNodeFileSystem(readPaths))
    const durationMs = performance.now() - startedAt

    expect(report.summary.validPackageCount).toBe(1)
    expect(report.summary.scannedEntries).toBe(502)
    expect(durationMs).toBeLessThan(2_500)
    expect(readPaths.map(item => path.basename(item)).sort()).toEqual([
      'items.json',
      'manifest.json',
      'tags.json'
    ])
  }, 30_000)

  it('does not follow symbolic link candidates', async() => {
    let readAttempted = false
    const fileSystem: ThirdPartyDiscoveryFileSystem = {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        return null
      },
      async readDirectory() {
        return [{ name: 'linked-pack', kind: 'directory', isSymbolicLink: true }]
      },
      async readTextFile() {
        readAttempted = true
        throw new Error('symlink candidate must not be read')
      }
    }

    const report = await discoverThirdPartyDataPacks('mods', fileSystem)

    expect(readAttempted).toBe(false)
    expect(report.candidates).toEqual([])
    expect(report.issues).toEqual([
      expect.objectContaining({
        kind: 'path-unsafe',
        path: 'linked-pack',
        severity: 'fatal'
      })
    ])
  })

  it('rejects symbolic links in entrypoint parent directories before reading payload files', async() => {
    const readPaths: string[] = []
    const manifest = {
      id: 'symlink_parent_pack',
      name: { key: 'symlink_parent_pack.package.name', fallback: 'Symlink parent pack' },
      version: '1.0.0',
      gameVersion: '2.4.0',
      engineApiVersion: '1',
      contentSchemaVersion: '1',
      defaultLocale: 'zh-CN',
      locales: { 'zh-CN': 'locales/zh-CN.json' },
      authors: [{ name: 'Safety Tester', role: 'developer' }],
      license: 'MIT',
      dependencies: [],
      entrypoints: { 'taoyuan:item': ['data/items.json'] }
    }
    const fileSystem: ThirdPartyDiscoveryFileSystem = {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath === 'mods/symlink-parent-pack/manifest.json') {
          return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        }
        if (filePath === 'mods/symlink-parent-pack/data') {
          return { name: 'data', kind: 'directory', isSymbolicLink: true }
        }
        return null
      },
      async readDirectory(directoryPath) {
        if (directoryPath === 'mods') {
          return [{ name: 'symlink-parent-pack', kind: 'directory', isSymbolicLink: false }]
        }
        throw new Error(`Unexpected directory read: ${directoryPath}`)
      },
      async readTextFile(filePath) {
        readPaths.push(filePath)
        if (filePath === 'mods/symlink-parent-pack/manifest.json') {
          return `${JSON.stringify(manifest, null, 2)}\n`
        }
        throw new Error('symlinked content payload must not be read')
      }
    }

    const report = await discoverThirdPartyDataPacks('mods', fileSystem)

    expect(readPaths).toEqual(['mods/symlink-parent-pack/manifest.json'])
    expect(report.summary).toMatchObject({
      candidateCount: 1,
      validPackageCount: 0,
      invalidPackageCount: 1
    })
    expect(report.candidates[0]?.issues).toContainEqual(expect.objectContaining({
      kind: 'path-unsafe',
      path: 'symlink-parent-pack/data/items.json',
      reason: 'Package content path crosses a symbolic link'
    }))
  })

  it('rejects non-directory entrypoint parents and directory payloads before reading payload files', async() => {
    const readPaths: string[] = []
    const makeManifest = (id: string, fallback: string): JsonObject => ({
      id,
      name: { key: `${id}.package.name`, fallback },
      version: '1.0.0',
      gameVersion: '2.4.0',
      engineApiVersion: '1',
      contentSchemaVersion: '1',
      defaultLocale: 'zh-CN',
      locales: { 'zh-CN': 'locales/zh-CN.json' },
      authors: [{ name: 'Entrypoint Safety Tester', role: 'developer' }],
      license: 'MIT',
      dependencies: [],
      entrypoints: { 'taoyuan:item': ['data/items.json'] }
    })
    const manifests: Record<string, JsonObject> = {
      'mods/file-parent-pack/manifest.json': makeManifest('file_parent_pack', 'File parent pack'),
      'mods/directory-payload-pack/manifest.json': makeManifest('directory_payload_pack', 'Directory payload pack')
    }

    const fileSystem: ThirdPartyDiscoveryFileSystem = {
      async getEntry(filePath) {
        if (filePath === 'mods') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        if (filePath.endsWith('/manifest.json')) return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
        if (filePath === 'mods/file-parent-pack/data') {
          return { name: 'data', kind: 'file', isSymbolicLink: false }
        }
        if (filePath === 'mods/directory-payload-pack/data') {
          return { name: 'data', kind: 'directory', isSymbolicLink: false }
        }
        if (filePath === 'mods/directory-payload-pack/data/items.json') {
          return { name: 'items.json', kind: 'directory', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory(directoryPath) {
        if (directoryPath === 'mods') {
          return [
            { name: 'file-parent-pack', kind: 'directory', isSymbolicLink: false },
            { name: 'directory-payload-pack', kind: 'directory', isSymbolicLink: false }
          ]
        }
        throw new Error(`Unexpected directory read: ${directoryPath}`)
      },
      async readTextFile(filePath) {
        readPaths.push(filePath)
        const manifest = manifests[filePath]
        if (manifest) return `${JSON.stringify(manifest, null, 2)}\n`
        throw new Error('non-file entrypoints must stop before payload reads')
      }
    }

    const report = await discoverThirdPartyDataPacks('mods', fileSystem)

    expect(readPaths).toEqual([
      'mods/directory-payload-pack/manifest.json',
      'mods/file-parent-pack/manifest.json'
    ])
    expect(report.summary).toMatchObject({
      candidateCount: 2,
      validPackageCount: 0,
      invalidPackageCount: 2
    })
    expect(report.candidates.find(candidate => candidate.path === 'file-parent-pack')?.issues)
      .toContainEqual(expect.objectContaining({
        kind: 'content-file-missing',
        path: 'file-parent-pack/data/items.json',
        reason: 'Manifest entrypoint parent is not a directory'
      }))
    expect(report.candidates.find(candidate => candidate.path === 'directory-payload-pack')?.issues)
      .toContainEqual(expect.objectContaining({
        kind: 'content-file-missing',
        path: 'directory-payload-pack/data/items.json',
        reason: 'Manifest entrypoint is not a file'
      }))
    expect(report.candidates.flatMap(candidate => candidate.contentFiles)).toEqual([])
  })
})
