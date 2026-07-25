/// <reference types="node" />

import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  ContentPackageSourceError,
  createDiscoveryFileSystemFromContentPackageSource,
  readContentPackageSourceJson,
  type ContentPackageSource
} from '@/domain/mods/contentPackageSource'
import {
  buildElectronReadonlySourceAdapterProbeReport,
  buildElectronReadonlyRuntimeReadinessProbeReport,
  createElectronReadonlyDirectoryProbeSource,
  createElectronReadonlyRuntimeReadinessProbeEffects,
  createElectronReadonlySourceAdapterProbeEffects,
  type ElectronReadonlyDirectoryProbeHost
} from '@/domain/mods/electronContentPackageSourceProbe'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { discoverThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackDiscovery'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const projectRoot = cwd()
const fixtureRoot = path.join(projectRoot, 'src/tests/fixtures/mods/third-party-discovery')
const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-electron-source-probe-'))
  roots.push(root)
  return root
}

const isMissing = (error: unknown): boolean =>
  typeof error === 'object'
  && error !== null
  && 'code' in error
  && (error as { code?: string }).code === 'ENOENT'

const toEntryKind = (stats: Awaited<ReturnType<typeof lstat>>) => {
  if (stats.isFile()) return 'file'
  if (stats.isDirectory()) return 'directory'
  return 'other'
}

const mapSourcePath = (root: string, sourcePath: string): string =>
  sourcePath === ''
    ? root
    : path.join(root, ...sourcePath.split('/'))

const createNodeProbeHost = (root: string): ElectronReadonlyDirectoryProbeHost => ({
  async getEntry(sourcePath) {
    try {
      const filePath = mapSourcePath(root, sourcePath)
      const stats = await lstat(filePath)
      return {
        name: sourcePath === '' ? path.basename(root) : path.basename(filePath),
        kind: toEntryKind(stats),
        isSymbolicLink: stats.isSymbolicLink()
      }
    } catch (error) {
      if (isMissing(error)) return null
      throw error
    }
  },
  async readDirectory(sourcePath) {
    const entries = await readdir(mapSourcePath(root, sourcePath), { withFileTypes: true })
    return entries.map(entry => ({
      name: entry.name,
      kind: entry.isFile() ? 'file' : entry.isDirectory() ? 'directory' : 'other',
      isSymbolicLink: entry.isSymbolicLink()
    }))
  },
  async readTextFile(sourcePath) {
    return readFile(mapSourcePath(root, sourcePath), 'utf8')
  }
})

const createPermissionFailureHost = (): ElectronReadonlyDirectoryProbeHost => ({
  async getEntry(sourcePath) {
    if (sourcePath === '') {
      return { name: 'mods', kind: 'directory', isSymbolicLink: false }
    }
    if (sourcePath === 'blocked-pack') {
      return { name: 'blocked-pack', kind: 'directory', isSymbolicLink: false }
    }
    if (sourcePath === 'blocked-pack/manifest.json') {
      throw new ContentPackageSourceError(
        'SOURCE_PERMISSION_REVOKED',
        'Electron probe permission was revoked while inspecting manifest',
        sourcePath
      )
    }
    return null
  },
  async readDirectory(sourcePath) {
    if (sourcePath === '') {
      return [{ name: 'blocked-pack', kind: 'directory', isSymbolicLink: false }]
    }
    throw new ContentPackageSourceError('SOURCE_ENTRY_NOT_DIRECTORY', 'Only root can be listed', sourcePath)
  },
  async readTextFile(sourcePath) {
    throw new ContentPackageSourceError('SOURCE_ENTRY_NOT_FOUND', 'No files can be read', sourcePath)
  }
})

const createInvalidRootHost = (
  entry: { readonly name: string; readonly kind: 'file' | 'directory' | 'other'; readonly isSymbolicLink: boolean } | null,
  hooks?: { readDirectoryAttempted?: () => void }
): ElectronReadonlyDirectoryProbeHost => ({
  async getEntry(sourcePath) {
    return sourcePath === '' ? entry : null
  },
  async readDirectory() {
    hooks?.readDirectoryAttempted?.()
    return []
  },
  async readTextFile(sourcePath) {
    throw new ContentPackageSourceError('SOURCE_ENTRY_NOT_FOUND', 'No files can be read', sourcePath)
  }
})

const collectFileContents = async(root: string): Promise<Record<string, string>> => {
  const result: Record<string, string> = {}
  const visit = async(directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        await visit(absolutePath)
      } else if (entry.isFile()) {
        result[path.relative(root, absolutePath).replace(/\\/g, '/')] = await readFile(absolutePath, 'utf8')
      }
    }
  }
  await visit(root)
  return result
}

const writeReadinessSentinels = async(root: string): Promise<Record<string, string>> => {
  const userDataRoot = path.join(root, 'userdata')
  await mkdir(path.join(userDataRoot, 'Local Storage', 'leveldb'), { recursive: true })
  await mkdir(path.join(userDataRoot, 'mod-cache'), { recursive: true })
  await mkdir(path.join(userDataRoot, 'mod-transactions'), { recursive: true })
  await writeFile(path.join(userDataRoot, 'settings.json'), '{"closeToTray":false}\n', 'utf8')
  await writeFile(path.join(userDataRoot, 'Local Storage', 'leveldb', 'save.ldb'), 'player-save-data', 'utf8')
  await writeFile(path.join(userDataRoot, 'sample.tyx'), 'exported-save-data', 'utf8')
  await writeFile(path.join(userDataRoot, 'mod-cache', 'official.txt'), 'official-cache-data', 'utf8')
  await writeFile(path.join(userDataRoot, 'mod-transactions', 'pending.txt'), 'transaction-log-data', 'utf8')
  return collectFileContents(root)
}

const expectOfficialBaseline = (): void => {
  const registrySet = buildOfficialRegistrySetFromStaticData()
  const snapshot = createSerializableRegistrySnapshot(registrySet)
  expect(registrySet.registryIds()).toHaveLength(54)
  expect(registrySet.registryIds().reduce(
    (total, registryId) => total + registrySet.get(registryId).entries().length,
    0
  )).toBe(4242)
  expect(snapshot.snapshotHash).toBe(committedMetadata.snapshotHash)
  expect(committedMetadata).toMatchObject({
    artifactHash: 'sha256:2948895f8961ff54df5ff91869fd4f07a16db6df1b3274fef921561be5f71732',
    contentHash: 'sha256:588d16eb0f16a193c0fc741fb73908ef0dc99549aff9a0d3b91dfd25c0ee985b',
    schemaSetHash: 'sha256:38c1ce55e1c5ac8f84089f1adf3e11a81ff486ac43db7ac8ec18a55fba11af26',
    environmentHash: 'sha256:4f52687194773d59c5c6260f6170bfa290c180d21d8bb24904bbcee1e3c5e22b',
    snapshotHash: 'sha256:4e87e4bc1d6310d4467335da77603006bf769fdb5c4da45ad927f7ed85a5c4b3'
  })
}

describe('electron content package source read-only probe', () => {
  it('inspects a controlled mods directory through the shared source contract', async() => {
    const root = await createRoot()
    const modsRoot = path.join(root, 'mods')
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(modsRoot, 'valid-gift-pack'), { recursive: true })
    const source = createElectronReadonlyDirectoryProbeSource({
      host: createNodeProbeHost(modsRoot)
    })

    const report = await buildElectronReadonlySourceAdapterProbeReport(source)
    const manifestJson = await readContentPackageSourceJson(source, 'valid-gift-pack/manifest.json')
    const discoveryReport = await discoverThirdPartyDataPacks(
      source.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(source)
    )

    expect(source.identity).toEqual({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'electron-readonly-directory-probe',
      sourceId: 'electron/mods-readonly-probe',
      rootPath: 'mods'
    })
    expect(JSON.stringify(source.identity)).not.toContain(root)
    expect(JSON.stringify(source.identity)).not.toContain(path.sep)
    expect(report).toMatchObject({
      status: 'ready',
      inspectedPath: '',
      inspectedEntryKind: 'directory',
      effects: {
        runtimeEnablementAllowed: false,
        electronIpcExposed: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false,
        packageFilesWritten: false,
        platformSourceInspected: true,
        sourceHandlesRetained: false
      }
    })
    expect(manifestJson.ok).toBe(true)
    if (manifestJson.ok) {
      const data: unknown = manifestJson.data
      expect(data).toMatchObject({ id: 'discovery_valid' })
    }
    expect(discoveryReport.status).toBe('completed')
    expect(discoveryReport.summary).toMatchObject({
      scannedEntries: 1,
      candidateCount: 1,
      validPackageCount: 1,
      invalidPackageCount: 0,
      issueCount: 0
    })
    expect(discoveryReport.candidates[0]?.path).toBe('valid-gift-pack')
    expectOfficialBaseline()
  }, 15_000)

  it('does not write lockfiles, settings, saves, caches, package files or transaction logs', async() => {
    const root = await createRoot()
    const modsRoot = path.join(root, 'mods')
    const userDataRoot = path.join(root, 'userdata')
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(modsRoot, 'valid-gift-pack'), { recursive: true })
    await mkdir(path.join(userDataRoot, 'Local Storage', 'leveldb'), { recursive: true })
    await writeFile(path.join(userDataRoot, 'settings.json'), '{"closeToTray":false}\n', 'utf8')
    await writeFile(path.join(userDataRoot, 'Local Storage', 'leveldb', 'save.ldb'), 'player-save-data', 'utf8')
    const before = await collectFileContents(root)
    const source = createElectronReadonlyDirectoryProbeSource({
      host: createNodeProbeHost(modsRoot)
    })

    const report = await buildElectronReadonlySourceAdapterProbeReport(source)
    const discoveryReport = await discoverThirdPartyDataPacks(
      source.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(source)
    )
    await source.dispose()

    expect(report.status).toBe('ready')
    expect(discoveryReport.summary.validPackageCount).toBe(1)
    expect(createElectronReadonlySourceAdapterProbeEffects()).toEqual({
      officialRegistryPublished: false,
      thirdPartyRegistryPublished: false,
      runtimeEnablementAllowed: false,
      electronIpcExposed: false,
      lockfileWritten: false,
      settingsWritten: false,
      savesWritten: false,
      cacheWritten: false,
      transactionLogWritten: false,
      packageFilesWritten: false,
      platformSourceInspected: true,
      sourceHandlesRetained: false
    })
    expect(await collectFileContents(root)).toEqual(before)
    expectOfficialBaseline()
  }, 15_000)

  it('carries a sample pack to the deferred runtime boundary without exposing paths or writing data', async() => {
    const root = await createRoot()
    const modsRoot = path.join(root, 'mods')
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(modsRoot, 'valid-gift-pack'), { recursive: true })
    const before = await writeReadinessSentinels(root)
    const source = createElectronReadonlyDirectoryProbeSource({
      host: createNodeProbeHost(modsRoot)
    })

    const report = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })
    await source.dispose()

    expect(report).toMatchObject({
      status: 'deferred',
      reason: 'content package source contract is defined; runtime platform source adapters remain intentionally deferred',
      sourceProbeStatus: 'ready',
      discoveryStatus: 'completed',
      mountInputStatus: 'ready',
      runtimeMountGateStatus: 'deferred',
      transactionPreflightStatus: 'deferred',
      runtimeAdapterGateStatus: 'deferred',
      sourceAdapterGateStatus: 'deferred',
      sourceIdentity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'electron-readonly-directory-probe',
        sourceId: 'electron/mods-readonly-probe',
        rootPath: 'mods'
      },
      selectedPackageIds: ['discovery_valid'],
      loadOrder: ['discovery_valid'],
      registryCount: 54,
      entryCount: 4244,
      packageCount: 1,
      diagnosticCount: 0,
      runtimePublication: 'deferred',
      sourceContractReadiness: 'defined',
      contentPackageSourceContractStable: true,
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(report.officialIdentity).toMatchObject({
      registryCount: 54,
      entryCount: 4242,
      contentHash: committedMetadata.contentHash,
      snapshotHash: committedMetadata.snapshotHash
    })
    expect(report.candidateIdentity?.candidateHash).toMatch(/^sha256:/)
    expect(report.lockfileHash).toMatch(/^sha256:/)
    expect('candidateRegistrySet' in report).toBe(false)
    expect('candidateSnapshot' in report).toBe(false)
    expect('lockfileDraft' in report).toBe(false)
    expect('sourceAdapterGate' in report).toBe(false)
    expect(JSON.stringify(report)).not.toContain(root)
    expect(JSON.stringify(report)).not.toContain(path.sep)
    expect(await collectFileContents(root)).toEqual(before)
    expectOfficialBaseline()
  }, 15_000)

  it('skips runtime readiness when the Electron read-only source has no packages', async() => {
    const root = await createRoot()
    const modsRoot = path.join(root, 'mods')
    await mkdir(modsRoot, { recursive: true })
    const before = await writeReadinessSentinels(root)
    const source = createElectronReadonlyDirectoryProbeSource({
      host: createNodeProbeHost(modsRoot)
    })

    const report = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })
    await source.dispose()

    expect(report).toMatchObject({
      status: 'skipped',
      reason: 'no selected third-party data packs',
      sourceProbeStatus: 'ready',
      discoveryStatus: 'empty',
      mountInputStatus: 'skipped',
      runtimeMountGateStatus: 'skipped',
      transactionPreflightStatus: 'skipped',
      runtimeAdapterGateStatus: 'skipped',
      sourceAdapterGateStatus: 'skipped',
      selectedPackageIds: [],
      loadOrder: [],
      registryCount: 54,
      entryCount: 4242,
      packageCount: 0,
      diagnosticCount: 1,
      runtimePublication: 'deferred',
      sourceContractReadiness: 'defined',
      contentPackageSourceContractStable: true,
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(report.officialIdentity).toMatchObject({
      registryCount: 54,
      entryCount: 4242,
      contentHash: committedMetadata.contentHash,
      snapshotHash: committedMetadata.snapshotHash
    })
    expect(report.candidateIdentity).toBeUndefined()
    expect(report.lockfileHash).toBeUndefined()
    expect('candidateRegistrySet' in report).toBe(false)
    expect('candidateSnapshot' in report).toBe(false)
    expect('lockfileDraft' in report).toBe(false)
    expect('sourceAdapterGate' in report).toBe(false)
    expect(JSON.stringify(report)).not.toContain(root)
    expect(JSON.stringify(report)).not.toContain(path.sep)
    expect(await collectFileContents(root)).toEqual(before)
    expectOfficialBaseline()
  }, 15_000)

  it('blocks runtime readiness for invalid packages without exposing candidate artifacts or writing data', async() => {
    const root = await createRoot()
    const modsRoot = path.join(root, 'mods')
    await cp(path.join(fixtureRoot, 'bad-schema-pack'), path.join(modsRoot, 'bad-schema-pack'), { recursive: true })
    const before = await writeReadinessSentinels(root)
    const source = createElectronReadonlyDirectoryProbeSource({
      host: createNodeProbeHost(modsRoot)
    })

    const report = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })
    await source.dispose()

    expect(report).toMatchObject({
      status: 'blocked',
      reason: 'discovery failed',
      sourceProbeStatus: 'ready',
      discoveryStatus: 'completed',
      mountInputStatus: 'blocked',
      runtimeMountGateStatus: 'blocked',
      transactionPreflightStatus: 'blocked',
      runtimeAdapterGateStatus: 'blocked',
      sourceAdapterGateStatus: 'blocked',
      selectedPackageIds: [],
      loadOrder: [],
      registryCount: 54,
      entryCount: 4242,
      packageCount: 0,
      runtimePublication: 'deferred',
      sourceContractReadiness: 'defined',
      contentPackageSourceContractStable: true,
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(report.diagnosticCount).toBeGreaterThan(0)
    expect(report.officialIdentity).toMatchObject({
      registryCount: 54,
      entryCount: 4242,
      contentHash: committedMetadata.contentHash,
      snapshotHash: committedMetadata.snapshotHash
    })
    expect(report.candidateIdentity).toBeUndefined()
    expect(report.lockfileHash).toBeUndefined()
    expect('candidateRegistrySet' in report).toBe(false)
    expect('candidateSnapshot' in report).toBe(false)
    expect('lockfileDraft' in report).toBe(false)
    expect('sourceAdapterGate' in report).toBe(false)
    expect(JSON.stringify(report)).not.toContain(root)
    expect(JSON.stringify(report)).not.toContain(path.sep)
    expect(await collectFileContents(root)).toEqual(before)
    expectOfficialBaseline()
  }, 15_000)

  it('rejects unsafe paths and releases the source lifecycle', async() => {
    const root = await createRoot()
    const modsRoot = path.join(root, 'mods')
    await mkdir(modsRoot, { recursive: true })
    const source = createElectronReadonlyDirectoryProbeSource({
      host: createNodeProbeHost(modsRoot)
    })

    await expect(source.readTextFile('../userdata/settings.json')).rejects.toMatchObject({
      code: 'SOURCE_PATH_UNSAFE'
    })
    expect(() => createElectronReadonlyDirectoryProbeSource({
      host: createNodeProbeHost(modsRoot),
      sourceId: 'C:/Users/LENOVO/mods'
    })).toThrow(ContentPackageSourceError)

    await source.dispose()
    await expect(source.getEntry('')).rejects.toMatchObject({
      code: 'SOURCE_DISPOSED'
    })

    const report = await buildElectronReadonlySourceAdapterProbeReport(source)
    expect(report).toMatchObject({
      status: 'blocked',
      sourceErrorCode: 'SOURCE_DISPOSED',
      effects: {
        runtimeEnablementAllowed: false,
        sourceHandlesRetained: false
      }
    })
  })

  it('redacts Electron host release failures before callers or reports expose paths', async() => {
    const source = createElectronReadonlyDirectoryProbeSource({
      host: {
        async getEntry(sourcePath) {
          if (sourcePath === '') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
          return null
        },
        async readDirectory() {
          return []
        },
        async readTextFile() {
          throw new Error('release failure test does not read package payloads')
        },
        async dispose() {
          throw new Error('EBUSY: close C:/Users/LENOVO/mods/.probe-handle')
        }
      }
    })

    let releaseError: unknown
    try {
      await source.dispose()
    } catch (error) {
      releaseError = error
    }
    const report = await buildElectronReadonlySourceAdapterProbeReport(source)

    expect(releaseError).toBeInstanceOf(ContentPackageSourceError)
    expect(releaseError).toMatchObject({
      code: 'SOURCE_DISPOSED',
      message: 'Content package source release operation failed'
    })
    expect(report).toMatchObject({
      status: 'blocked',
      reason: 'Electron read-only source adapter probe has been disposed',
      sourceErrorCode: 'SOURCE_DISPOSED',
      effects: {
        runtimeEnablementAllowed: false,
        electronIpcExposed: false,
        sourceHandlesRetained: false
      }
    })
    expect(JSON.stringify(releaseError)).not.toContain('C:/Users')
    expect(JSON.stringify(releaseError)).not.toContain('LENOVO')
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
    expectOfficialBaseline()
  })

  it('redacts invalid Electron source identities in blocked probe reports', async() => {
    const source: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'electron-readonly-directory-probe',
        sourceId: 'C:/Users/LENOVO/mods',
        rootPath: 'mods'
      },
      async getEntry() {
        throw new Error('invalid identities must be rejected before source inspection')
      },
      async readDirectory() {
        throw new Error('invalid identities must be rejected before directory reads')
      },
      async readTextFile() {
        throw new Error('invalid identities must be rejected before file reads')
      },
      async dispose() {}
    }

    const sourceReport = await buildElectronReadonlySourceAdapterProbeReport(source)
    const readinessReport = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })

    expect(sourceReport).toMatchObject({
      status: 'blocked',
      reason: 'sourceId must be a normalized relative identifier',
      sourceIdentity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'electron-readonly-directory-probe',
        sourceId: 'electron/invalid-readonly-probe-source',
        rootPath: 'mods'
      },
      sourceErrorCode: 'SOURCE_IDENTITY_INVALID',
      effects: {
        runtimeEnablementAllowed: false,
        electronIpcExposed: false,
        sourceHandlesRetained: false
      }
    })
    expect(readinessReport).toMatchObject({
      status: 'blocked',
      reason: 'sourceId must be a normalized relative identifier',
      sourceProbeStatus: 'blocked',
      discoveryStatus: 'not-run',
      sourceIdentity: sourceReport.sourceIdentity,
      registryCount: 54,
      entryCount: 4242,
      diagnosticCount: 1,
      runtimePublication: 'deferred',
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(JSON.stringify(sourceReport)).not.toContain('C:/Users')
    expect(JSON.stringify(sourceReport)).not.toContain('LENOVO')
    expect(JSON.stringify(readinessReport)).not.toContain('C:/Users')
    expect(JSON.stringify(readinessReport)).not.toContain('LENOVO')

    let inspected = false
    const malformedIdentitySource: ContentPackageSource = {
      ...source,
      identity: null as unknown as ContentPackageSource['identity'],
      async getEntry() {
        inspected = true
        throw new Error('malformed identities must be rejected before source inspection')
      }
    }
    const malformedSourceReport = await buildElectronReadonlySourceAdapterProbeReport(malformedIdentitySource)
    const malformedReadinessReport = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source: malformedIdentitySource,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })

    expect(inspected).toBe(false)
    expect(malformedSourceReport).toMatchObject({
      status: 'blocked',
      reason: 'Content package source identity must be an object',
      sourceIdentity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'electron-readonly-directory-probe',
        sourceId: 'electron/invalid-readonly-probe-source',
        rootPath: 'mods'
      },
      sourceErrorCode: 'SOURCE_IDENTITY_INVALID'
    })
    expect(malformedReadinessReport).toMatchObject({
      status: 'blocked',
      reason: 'Content package source identity must be an object',
      sourceProbeStatus: 'blocked',
      discoveryStatus: 'not-run',
      sourceIdentity: malformedSourceReport.sourceIdentity,
      registryCount: 54,
      entryCount: 4242,
      diagnosticCount: 1,
      runtimePublication: 'deferred',
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(JSON.stringify(malformedSourceReport)).not.toContain('C:/Users')
    expect(JSON.stringify(malformedSourceReport)).not.toContain('LENOVO')
    expect(JSON.stringify(malformedReadinessReport)).not.toContain('C:/Users')
    expect(JSON.stringify(malformedReadinessReport)).not.toContain('LENOVO')

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
    const hostileIdentitySourceReport = await buildElectronReadonlySourceAdapterProbeReport(
      hostileIdentityGetterSource
    )
    const hostileIdentityReadinessReport = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source: hostileIdentityGetterSource,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })

    expect(hostileIdentityInspected).toBe(false)
    expect(hostileIdentitySourceReport).toMatchObject({
      status: 'blocked',
      reason: 'Content package source identity operation failed',
      sourceIdentity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'electron-readonly-directory-probe',
        sourceId: 'electron/invalid-readonly-probe-source',
        rootPath: 'mods'
      },
      sourceErrorCode: 'SOURCE_IDENTITY_INVALID'
    })
    expect(hostileIdentityReadinessReport).toMatchObject({
      status: 'blocked',
      reason: 'Content package source identity operation failed',
      sourceProbeStatus: 'blocked',
      discoveryStatus: 'not-run',
      sourceIdentity: hostileIdentitySourceReport.sourceIdentity,
      registryCount: 54,
      entryCount: 4242,
      diagnosticCount: 1,
      runtimePublication: 'deferred',
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(JSON.stringify(hostileIdentitySourceReport)).not.toContain('C:/Users')
    expect(JSON.stringify(hostileIdentitySourceReport)).not.toContain('LENOVO')
    expect(JSON.stringify(hostileIdentityReadinessReport)).not.toContain('C:/Users')
    expect(JSON.stringify(hostileIdentityReadinessReport)).not.toContain('LENOVO')
    expectOfficialBaseline()
  })

  it('reuses the validated source identity for readiness discovery roots', async() => {
    let identityReads = 0
    let rootInspected = false
    const source: ContentPackageSource = {
      get identity(): ContentPackageSource['identity'] {
        identityReads += 1
        if (identityReads === 1) {
          return {
            contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
            kind: 'electron-readonly-directory-probe',
            sourceId: 'electron/mods-readonly-probe',
            rootPath: 'mods'
          }
        }
        throw new Error('EACCES: lstat C:/Users/LENOVO/mods/identity-after-probe')
      },
      async getEntry(sourcePath) {
        if (sourcePath === '') {
          rootInspected = true
          return { name: 'mods', kind: 'directory', isSymbolicLink: false }
        }
        return null
      },
      async readDirectory() {
        return []
      },
      async readTextFile() {
        throw new Error('readiness should not read file payloads for an unavailable identity')
      },
      async dispose() {}
    }

    const report = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })

    expect(rootInspected).toBe(true)
    expect(identityReads).toBeGreaterThan(1)
    expect(report).toMatchObject({
      status: 'blocked',
      reason: 'discovery failed',
      sourceProbeStatus: 'ready',
      discoveryStatus: 'directory-not-found',
      sourceIdentity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'electron-readonly-directory-probe',
        sourceId: 'electron/mods-readonly-probe',
        rootPath: 'mods'
      },
      selectedPackageIds: [],
      loadOrder: [],
      registryCount: 54,
      entryCount: 4242,
      packageCount: 0,
      runtimePublication: 'deferred',
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(report.diagnosticCount).toBeGreaterThan(0)
    expect(JSON.stringify(report)).not.toContain('C:/Users')
    expect(JSON.stringify(report)).not.toContain('LENOVO')
    expectOfficialBaseline()
  })

  it('redacts raw Electron host failures before probe or discovery diagnostics expose paths', async() => {
    const inspectFailureSource = createElectronReadonlyDirectoryProbeSource({
      host: {
        async getEntry(sourcePath) {
          throw new Error(`EACCES: lstat C:/Users/LENOVO/mods/${sourcePath}`)
        },
        async readDirectory(sourcePath) {
          throw new Error(`EACCES: scandir C:/Users/LENOVO/mods/${sourcePath}`)
        },
        async readTextFile(sourcePath) {
          throw new Error(`EACCES: open C:/Users/LENOVO/mods/${sourcePath}`)
        }
      }
    })
    const readFailureSource = createElectronReadonlyDirectoryProbeSource({
      host: {
        async getEntry(sourcePath) {
          if (sourcePath === '') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
          if (sourcePath === 'broken-pack') {
            return { name: 'broken-pack', kind: 'directory', isSymbolicLink: false }
          }
          if (sourcePath === 'broken-pack/manifest.json') {
            return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
          }
          return null
        },
        async readDirectory(sourcePath) {
          if (sourcePath === '') return [{ name: 'broken-pack', kind: 'directory', isSymbolicLink: false }]
          throw new Error(`EACCES: scandir C:/Users/LENOVO/mods/${sourcePath}`)
        },
        async readTextFile(sourcePath) {
          throw new Error(`EACCES: open C:/Users/LENOVO/mods/${sourcePath}`)
        }
      }
    })

    const sourceReport = await buildElectronReadonlySourceAdapterProbeReport(inspectFailureSource)
    const readinessReport = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source: inspectFailureSource,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })
    const discoveryReport = await discoverThirdPartyDataPacks(
      readFailureSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(readFailureSource)
    )
    await inspectFailureSource.dispose()
    await readFailureSource.dispose()

    expect(sourceReport).toMatchObject({
      status: 'blocked',
      reason: 'Content package source inspect operation failed',
      sourceErrorCode: 'SOURCE_ENTRY_NOT_FOUND',
      effects: {
        runtimeEnablementAllowed: false,
        electronIpcExposed: false,
        sourceHandlesRetained: false
      }
    })
    expect(readinessReport).toMatchObject({
      status: 'blocked',
      reason: 'Content package source inspect operation failed',
      sourceProbeStatus: 'blocked',
      discoveryStatus: 'not-run',
      diagnosticCount: 1,
      runtimePublication: 'deferred',
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(discoveryReport.status).toBe('completed')
    expect(discoveryReport.candidates[0]?.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      path: 'broken-pack/manifest.json',
      reason: 'Package source read operation failed'
    })
    expect(discoveryReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source read operation failed',
      sourceCode: 'SOURCE_ENTRY_NOT_FOUND'
    })
    expect(JSON.stringify(sourceReport)).not.toContain('C:/Users')
    expect(JSON.stringify(sourceReport)).not.toContain('LENOVO')
    expect(JSON.stringify(readinessReport)).not.toContain('C:/Users')
    expect(JSON.stringify(readinessReport)).not.toContain('LENOVO')
    expect(JSON.stringify(discoveryReport)).not.toContain('C:/Users')
    expect(JSON.stringify(discoveryReport)).not.toContain('LENOVO')
    expectOfficialBaseline()
  }, 15_000)

  it('redacts arbitrary source inspect failures before Electron probe reports expose host paths', async() => {
    const source: ContentPackageSource = {
      identity: {
        contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
        kind: 'electron-readonly-directory-probe',
        sourceId: 'electron/mods-readonly-probe',
        rootPath: 'mods'
      },
      async getEntry(sourcePath) {
        throw new Error(`EACCES: lstat C:/Users/LENOVO/mods/${sourcePath}`)
      },
      async readDirectory() {
        throw new Error('probe must stop before directory reads')
      },
      async readTextFile() {
        throw new Error('probe must stop before file reads')
      },
      async dispose() {}
    }

    const sourceReport = await buildElectronReadonlySourceAdapterProbeReport(source)
    const readinessReport = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })

    expect(sourceReport).toMatchObject({
      status: 'blocked',
      reason: 'Content package source inspect operation failed',
      sourceErrorCode: 'SOURCE_ENTRY_NOT_FOUND',
      sourceIdentity: source.identity,
      effects: {
        runtimeEnablementAllowed: false,
        electronIpcExposed: false,
        sourceHandlesRetained: false
      }
    })
    expect(readinessReport).toMatchObject({
      status: 'blocked',
      reason: 'Content package source inspect operation failed',
      sourceProbeStatus: 'blocked',
      discoveryStatus: 'not-run',
      registryCount: 54,
      entryCount: 4242,
      diagnosticCount: 1,
      runtimePublication: 'deferred',
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(JSON.stringify(sourceReport)).not.toContain('C:/Users')
    expect(JSON.stringify(sourceReport)).not.toContain('LENOVO')
    expect(JSON.stringify(readinessReport)).not.toContain('C:/Users')
    expect(JSON.stringify(readinessReport)).not.toContain('LENOVO')
    expectOfficialBaseline()
  })

  it('narrows malformed Electron host text payloads before JSON or discovery parsing', async() => {
    const root = await createRoot()
    const before = await writeReadinessSentinels(root)
    const source = createElectronReadonlyDirectoryProbeSource({
      host: {
        async getEntry(sourcePath) {
          if (sourcePath === '') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
          if (sourcePath === 'private-pack') return { name: 'private-pack', kind: 'directory', isSymbolicLink: false }
          if (sourcePath === 'private-pack/manifest.json') {
            return { name: 'manifest.json', kind: 'file', isSymbolicLink: false }
          }
          return null
        },
        async readDirectory(sourcePath) {
          if (sourcePath === '') return [{ name: 'private-pack', kind: 'directory', isSymbolicLink: false }]
          return []
        },
        async readTextFile() {
          return { leaked: 'C:/Users/LENOVO/mods/private-pack/manifest.json' } as never
        }
      }
    })

    await expect(source.readTextFile('private-pack/manifest.json')).rejects.toMatchObject({
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source text payload must be a string'
    })
    const directJson = await readContentPackageSourceJson(source, 'private-pack/manifest.json')
    const discoveryReport = await discoverThirdPartyDataPacks(
      source.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(source)
    )
    await source.dispose()

    expect(directJson).toMatchObject({
      ok: false,
      code: 'SOURCE_ENTRY_UNSAFE',
      message: 'Content package source text payload must be a string'
    })
    expect(discoveryReport.status).toBe('completed')
    expect(discoveryReport.candidates[0]?.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      path: 'private-pack/manifest.json',
      reason: 'Package source read operation failed'
    })
    expect(discoveryReport.candidates[0]?.issues[0]?.diagnostics[0]?.details).toMatchObject({
      message: 'Content package source text payload must be a string',
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })
    expect(JSON.stringify(directJson)).not.toContain('C:/Users')
    expect(JSON.stringify(directJson)).not.toContain('LENOVO')
    expect(JSON.stringify(discoveryReport)).not.toContain('C:/Users')
    expect(JSON.stringify(discoveryReport)).not.toContain('LENOVO')
    expect(await collectFileContents(root)).toEqual(before)
    expectOfficialBaseline()
  }, 15_000)

  it('blocks non-directory Electron source roots before discovery', async() => {
    const root = await createRoot()
    const before = await writeReadinessSentinels(root)
    let readDirectoryAttempted = false
    const source = createElectronReadonlyDirectoryProbeSource({
      host: createInvalidRootHost(
        { name: 'mods', kind: 'file', isSymbolicLink: false },
        { readDirectoryAttempted: () => { readDirectoryAttempted = true } }
      )
    })

    const sourceReport = await buildElectronReadonlySourceAdapterProbeReport(source)
    const readinessReport = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })
    await source.dispose()

    expect(sourceReport).toMatchObject({
      status: 'blocked',
      inspectedPath: '',
      inspectedEntryKind: null,
      sourceErrorCode: 'SOURCE_ENTRY_NOT_DIRECTORY',
      effects: {
        runtimeEnablementAllowed: false,
        electronIpcExposed: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false,
        packageFilesWritten: false,
        platformSourceInspected: true,
        sourceHandlesRetained: false
      }
    })
    expect(readinessReport).toMatchObject({
      status: 'blocked',
      sourceProbeStatus: 'blocked',
      discoveryStatus: 'not-run',
      selectedPackageIds: [],
      loadOrder: [],
      registryCount: 54,
      entryCount: 4242,
      packageCount: 0,
      diagnosticCount: 1,
      runtimePublication: 'deferred',
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(readDirectoryAttempted).toBe(false)
    expect(JSON.stringify(readinessReport)).not.toContain(root)
    expect(JSON.stringify(readinessReport)).not.toContain(path.sep)
    expect(await collectFileContents(root)).toEqual(before)
    expectOfficialBaseline()
  }, 15_000)

  it('blocks symbolic-link Electron source roots before discovery', async() => {
    const root = await createRoot()
    const before = await writeReadinessSentinels(root)
    let readDirectoryAttempted = false
    const source = createElectronReadonlyDirectoryProbeSource({
      host: createInvalidRootHost(
        { name: 'mods', kind: 'directory', isSymbolicLink: true },
        { readDirectoryAttempted: () => { readDirectoryAttempted = true } }
      )
    })

    const sourceReport = await buildElectronReadonlySourceAdapterProbeReport(source)
    const readinessReport = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })
    await source.dispose()

    expect(sourceReport).toMatchObject({
      status: 'blocked',
      inspectedPath: '',
      inspectedEntryKind: null,
      sourceErrorCode: 'SOURCE_PATH_UNSAFE',
      effects: {
        runtimeEnablementAllowed: false,
        electronIpcExposed: false,
        lockfileWritten: false,
        settingsWritten: false,
        savesWritten: false,
        cacheWritten: false,
        transactionLogWritten: false,
        packageFilesWritten: false,
        platformSourceInspected: true,
        sourceHandlesRetained: false
      }
    })
    expect(sourceReport.reason).toContain('symbolic link')
    expect(readinessReport).toMatchObject({
      status: 'blocked',
      sourceProbeStatus: 'blocked',
      discoveryStatus: 'not-run',
      selectedPackageIds: [],
      loadOrder: [],
      registryCount: 54,
      entryCount: 4242,
      packageCount: 0,
      diagnosticCount: 1,
      runtimePublication: 'deferred',
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(readinessReport.reason).toContain('symbolic link')
    expect(readDirectoryAttempted).toBe(false)
    expect(JSON.stringify(readinessReport)).not.toContain(root)
    expect(JSON.stringify(readinessReport)).not.toContain(path.sep)
    expect(await collectFileContents(root)).toEqual(before)
    expectOfficialBaseline()
  }, 15_000)

  it('blocks missing Electron source roots before discovery', async() => {
    const root = await createRoot()
    const before = await writeReadinessSentinels(root)
    let readDirectoryAttempted = false
    const source = createElectronReadonlyDirectoryProbeSource({
      host: createInvalidRootHost(null, {
        readDirectoryAttempted: () => { readDirectoryAttempted = true }
      })
    })

    const report = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })
    await source.dispose()

    expect(report).toMatchObject({
      status: 'blocked',
      sourceProbeStatus: 'blocked',
      discoveryStatus: 'not-run',
      selectedPackageIds: [],
      loadOrder: [],
      registryCount: 54,
      entryCount: 4242,
      packageCount: 0,
      diagnosticCount: 1,
      runtimePublication: 'deferred',
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(report.reason).toContain('root was not found')
    expect(readDirectoryAttempted).toBe(false)
    expect(JSON.stringify(report)).not.toContain(root)
    expect(JSON.stringify(report)).not.toContain(path.sep)
    expect(await collectFileContents(root)).toEqual(before)
    expectOfficialBaseline()
  }, 15_000)

  it('narrows malformed Electron directory entry metadata before discovery can read packages', async() => {
    const root = await createRoot()
    const before = await writeReadinessSentinels(root)
    let readDirectoryAttempted = false
    const malformedRootSource = createElectronReadonlyDirectoryProbeSource({
      host: {
        async getEntry() {
          return {
            name: 'C:/Users/LENOVO/mods',
            kind: 1,
            isSymbolicLink: false
          } as never
        },
        async readDirectory() {
          readDirectoryAttempted = true
          return []
        },
        async readTextFile() {
          throw new Error('malformed root metadata must not be read')
        }
      }
    })

    const sourceReport = await buildElectronReadonlySourceAdapterProbeReport(malformedRootSource)
    const readinessReport = await buildElectronReadonlyRuntimeReadinessProbeReport({
      source: malformedRootSource,
      officialRegistrySet: buildOfficialRegistrySetFromStaticData()
    })
    await malformedRootSource.dispose()

    expect(sourceReport).toMatchObject({
      status: 'blocked',
      inspectedPath: '',
      inspectedEntryKind: null,
      sourceErrorCode: 'SOURCE_ENTRY_UNSAFE',
      effects: {
        runtimeEnablementAllowed: false,
        electronIpcExposed: false,
        sourceHandlesRetained: false
      }
    })
    expect(readinessReport).toMatchObject({
      status: 'blocked',
      sourceProbeStatus: 'blocked',
      discoveryStatus: 'not-run',
      registryCount: 54,
      entryCount: 4242,
      diagnosticCount: 1,
      runtimePublication: 'deferred',
      effects: createElectronReadonlyRuntimeReadinessProbeEffects()
    })
    expect(readDirectoryAttempted).toBe(false)
    expect(JSON.stringify(sourceReport)).not.toContain('C:/Users')
    expect(JSON.stringify(sourceReport)).not.toContain('LENOVO')
    expect(JSON.stringify(readinessReport)).not.toContain('C:/Users')
    expect(JSON.stringify(readinessReport)).not.toContain('LENOVO')

    let readAttempted = false
    const malformedListingSource = createElectronReadonlyDirectoryProbeSource({
      host: {
        async getEntry(sourcePath) {
          if (sourcePath === '') return { name: 'mods', kind: 'directory', isSymbolicLink: false }
          return null
        },
        async readDirectory() {
          return [{ name: 'private-pack', kind: 'C:/Users/LENOVO/socket', isSymbolicLink: false } as never]
        },
        async readTextFile() {
          readAttempted = true
          throw new Error('malformed listing metadata must not be read')
        }
      }
    })

    const discoveryReport = await discoverThirdPartyDataPacks(
      malformedListingSource.identity.rootPath,
      createDiscoveryFileSystemFromContentPackageSource(malformedListingSource)
    )
    await malformedListingSource.dispose()

    expect(readAttempted).toBe(false)
    expect(discoveryReport.status).toBe('directory-not-found')
    expect(discoveryReport.issues[0]).toMatchObject({
      kind: 'file-read-failed',
      severity: 'fatal',
      path: '.',
      reason: 'Package source list operation failed'
    })
    expect(discoveryReport.issues[0]?.diagnostics[0]?.details).toMatchObject({
      sourceCode: 'SOURCE_ENTRY_UNSAFE'
    })
    expect(JSON.stringify(discoveryReport)).not.toContain('C:/Users')
    expect(JSON.stringify(discoveryReport)).not.toContain('LENOVO')
    expect(await collectFileContents(root)).toEqual(before)
    expectOfficialBaseline()
  }, 15_000)

  it('keeps Electron probe read failures inside structured discovery diagnostics', async() => {
    const source = createElectronReadonlyDirectoryProbeSource({
      host: createPermissionFailureHost()
    })

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
    expectOfficialBaseline()
  })
})
