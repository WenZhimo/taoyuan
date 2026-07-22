/// <reference types="node" />

import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd, execPath } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import {
  discoverThirdPartyDataPacks,
  type ThirdPartyDiscoveryDirectoryEntry,
  type ThirdPartyDiscoveryFileSystem
} from '@/domain/mods/thirdPartyDataPackDiscovery'
import { buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const projectRoot = cwd()
const fixtureRoot = path.join(projectRoot, 'src/tests/fixtures/mods/third-party-discovery')
const tempRoots: string[] = []

interface CliResult {
  readonly code: number | null
  readonly stdout: string
  readonly stderr: string
}

afterEach(async() => {
  await Promise.all(tempRoots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createTempRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-check-packs-'))
  tempRoots.push(root)
  return root
}

const runCli = async(args: readonly string[]): Promise<CliResult> =>
  new Promise(resolve => {
    const child = spawn(
      execPath,
      ['scripts/check-third-party-packs.mjs', ...args],
      { cwd: projectRoot, stdio: ['ignore', 'pipe', 'pipe'] }
    )
    const stdoutChunks: Buffer[] = []
    const stderrChunks: Buffer[] = []
    child.stdout.on('data', chunk => stdoutChunks.push(Buffer.from(chunk)))
    child.stderr.on('data', chunk => stderrChunks.push(Buffer.from(chunk)))
    child.on('close', code => {
      resolve({
        code,
        stdout: Buffer.concat(stdoutChunks).toString('utf8'),
        stderr: Buffer.concat(stderrChunks).toString('utf8')
      })
    })
  })

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

const createNodeFileSystem = (): ThirdPartyDiscoveryFileSystem => ({
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
    return readFile(filePath, 'utf8')
  }
})

const copyPack = async(packName: string, targetRoot: string): Promise<void> => {
  await mkdir(targetRoot, { recursive: true })
  await cp(path.join(fixtureRoot, packName), path.join(targetRoot, packName), { recursive: true })
}

const collectFileContents = async(root: string): Promise<Record<string, string>> => {
  const result: Record<string, string> = {}
  const visit = async(directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        await visit(absolutePath)
      } else if (entry.isFile()) {
        const relativePath = path.relative(root, absolutePath).replace(/\\/g, '/')
        result[relativePath] = await readFile(absolutePath, 'utf8')
      }
    }
  }
  await visit(root)
  return result
}

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

const createPack = async(
  root: string,
  directoryName: string,
  options: {
    id?: string
    version?: string
    dependencies?: readonly JsonObject[]
    optionalDependencies?: readonly JsonObject[]
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
  manifest.dependencies = [...(options.dependencies ?? [])]
  if (options.optionalDependencies !== undefined) {
    manifest.optionalDependencies = [...options.optionalDependencies]
  } else {
    delete manifest.optionalDependencies
  }
  manifest.entrypoints = { 'taoyuan:item': ['data/items.json'] }
  await writeJson(manifestPath, manifest)
  await writeJson(path.join(packRoot, 'data', 'items.json'), [
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

describe('third-party data pack check CLI', () => {
  it('prints a successful report and exits 0 for valid packages', async() => {
    const root = await createTempRoot()
    const packRoot = path.join(root, 'valid-gift-pack')
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), packRoot, { recursive: true })

    const result = await runCli([packRoot])

    expect(result.code).toBe(0)
    expect(result.stderr).toBe('')
    expect(result.stdout).toContain('Taoyuan third-party data pack check')
    expect(result.stdout).toContain(`Scan root: ${packRoot}`)
    expect(result.stdout).toContain('Discovered packages: 1')
    expect(result.stdout).toContain('Valid packages: 1')
    expect(result.stdout).toContain('Invalid packages: 0')
    expect(result.stdout).toContain('Package: valid-gift-pack')
    expect(result.stdout).toContain('id: discovery_valid')
    expect(result.stdout).toContain('version: 1.0.0')
    expect(result.stdout).toContain('Selection:')
    expect(result.stdout).toContain('status: completed')
    expect(result.stdout).toContain('selectedPackages: 1')
    expect(result.stdout).toContain('loadOrder:')
    expect(result.stdout).toContain('1. discovery_valid@1.0.0 (valid-gift-pack)')
    expect(result.stdout).toContain('Candidate Snapshot:')
    expect(result.stdout).toContain('status: valid')
    expect(result.stdout).toContain('registryCount: 54')
    expect(result.stdout).toContain('entryCount: 4244')
    expect(result.stdout).toContain('selectedPackageIds: discovery_valid')
    expect(result.stdout).toContain('blockedPackageIds: (empty)')
    expect(result.stdout).toContain('loadOrder: discovery_valid')
    expect(result.stdout).toContain(`officialSnapshotHash: ${committedMetadata.snapshotHash}`)
    expect(result.stdout).toContain('candidateSnapshotHash: sha256:')
    expect(result.stdout).toContain('Result: OK')
  })

  it('returns non-zero for missing roots and argument errors without crashing', async() => {
    const root = await createTempRoot()

    const missing = await runCli([path.join(root, 'missing')])
    expect(missing.code).toBe(1)
    expect(missing.stdout).toContain('Discovery status: directory-not-found')
    expect(missing.stdout).toContain('[directory-not-found]')
    expect(missing.stdout).toContain('Candidate Snapshot:')
    expect(missing.stdout).toContain('status: invalid')
    expect(missing.stdout).toContain('registryCount: 54')
    expect(missing.stdout).toContain('entryCount: 4242')
    expect(missing.stdout).toContain('Result: FAILED')
    expect(missing.stderr).toBe('')

    const invalidArgs = await runCli([])
    expect(invalidArgs.code).toBe(2)
    expect(invalidArgs.stderr).toContain('Expected exactly one directory argument')
    expect(invalidArgs.stderr).toContain('Usage: pnpm run mod:check-packs -- <directory>')
  })

  it('reports JSON parse and Schema errors through diagnostics', async() => {
    const root = await createTempRoot()
    const packsRoot = path.join(root, 'packs')
    await copyPack('invalid-json-pack', packsRoot)
    await copyPack('bad-schema-pack', packsRoot)

    const result = await runCli([packsRoot])

    expect(result.code).toBe(1)
    expect(result.stderr).toBe('')
    expect(result.stdout).toContain('Invalid packages: 2')
    expect(result.stdout).toContain('[json-parse-failed] invalid-json-pack/data/items.json')
    expect(result.stdout).toContain('[schema-validation-failed] bad-schema-pack/data/items.json')
    expect(result.stdout).toContain('fieldPath: /0/sellPrice')
    expect(result.stdout).toContain('category: json')
    expect(result.stdout).toContain('category: schema')
    expect(result.stdout).toContain('Candidate Snapshot:')
    expect(result.stdout).toContain('status: invalid')
    expect(result.stdout).toContain('entryCount: 4242')
  })

  it('reports unsafe paths, missing entrypoints, non-JSON entrypoints and unsupported registries', async() => {
    const root = await createTempRoot()
    const packsRoot = path.join(root, 'packs')
    await copyPack('unsafe-path-pack', packsRoot)
    await copyPack('missing-content-pack', packsRoot)
    await copyPack('non-json-entrypoint-pack', packsRoot)
    await copyPack('unsupported-registry-pack', packsRoot)

    const result = await runCli([packsRoot])

    expect(result.code).toBe(1)
    expect(result.stderr).toBe('')
    expect(result.stdout).toContain('[path-unsafe] unsafe-path-pack/')
    expect(result.stdout).toContain('[content-file-missing] missing-content-pack/data/missing-items.json')
    expect(result.stdout).toContain('[non-json-file] non-json-entrypoint-pack/data/items.txt')
    expect(result.stdout).toContain('[unsupported-registry] unsupported-registry-pack/manifest.json')
    expect(result.stdout).toContain('registryId: example_mod:unknown_registry')
    expect(result.stdout).toContain('category: entrypoint')
    expect(result.stdout).toContain('Candidate Snapshot:')
    expect(result.stdout).toContain('status: invalid')
    expect(result.stdout).toContain('entryCount: 4242')
  })

  it('returns non-zero and prints dependency diagnostics for missing required dependencies', async() => {
    const root = await createTempRoot()
    const packsRoot = path.join(root, 'packs')
    await mkdir(packsRoot, { recursive: true })
    await createPack(packsRoot, 'missing-dependent', {
      id: 'missing_dependent',
      dependencies: [{ id: 'missing_library', version: '1.0.0' }]
    })

    const result = await runCli([packsRoot])

    expect(result.code).toBe(1)
    expect(result.stderr).toBe('')
    expect(result.stdout).toContain('[dependency-missing] missing-dependent/manifest.json')
    expect(result.stdout).toContain('category: dependency')
    expect(result.stdout).toContain('relatedPackageIds: missing_library')
    expect(result.stdout).toContain('diagnostic: PKG-DEPENDENCY-001')
    expect(result.stdout).toContain('Selection:')
    expect(result.stdout).toContain('blockedPackages: 1')
    expect(result.stdout).toContain('reasons: discovery-blocked')
    expect(result.stdout).toContain('Candidate Snapshot:')
    expect(result.stdout).toContain('status: invalid')
    expect(result.stdout).toContain('selectedPackageIds: (empty)')
    expect(result.stdout).toContain('blockedPackageIds: missing_dependent')
    expect(result.stdout).toContain('entryCount: 4242')
    expect(result.stdout).toContain('Result: FAILED')
  })

  it('prints stable load order and selection cycle diagnostics', async() => {
    const root = await createTempRoot()
    const packsRoot = path.join(root, 'packs')
    await mkdir(packsRoot, { recursive: true })
    await createPack(packsRoot, 'z-app', {
      id: 'z_app',
      dependencies: [{ id: 'a_library', version: '1.0.0' }]
    })
    await createPack(packsRoot, 'a-library', { id: 'a_library' })

    const ordered = await runCli([packsRoot])
    expect(ordered.code).toBe(0)
    expect(ordered.stdout).toContain('1. a_library@1.0.0 (a-library)')
    expect(ordered.stdout).toContain('2. z_app@1.0.0 (z-app)')
    expect(ordered.stdout).toContain('Candidate Snapshot:')
    expect(ordered.stdout).toContain('status: valid')
    expect(ordered.stdout).toContain('selectedPackageIds: a_library, z_app')
    expect(ordered.stdout).toContain('loadOrder: a_library, z_app')
    expect(ordered.stdout).toContain('entryCount: 4244')

    const cycleRoot = await createTempRoot()
    const cyclePacksRoot = path.join(cycleRoot, 'packs')
    await mkdir(cyclePacksRoot, { recursive: true })
    await createPack(cyclePacksRoot, 'a-cycle', {
      id: 'a_cycle',
      dependencies: [{ id: 'b_cycle', version: '1.0.0' }]
    })
    await createPack(cyclePacksRoot, 'b-cycle', {
      id: 'b_cycle',
      dependencies: [{ id: 'a_cycle', version: '1.0.0' }]
    })

    const cycle = await runCli([cyclePacksRoot])
    expect(cycle.code).toBe(1)
    expect(cycle.stdout).toContain('Selection:')
    expect(cycle.stdout).toContain('status: blocked')
    expect(cycle.stdout).toContain('reasons: dependency-cycle')
    expect(cycle.stdout).toContain('[dependency-cycle] a-cycle/manifest.json')
    expect(cycle.stdout).toContain('diagnostic: PKG-DEPENDENCY-003')
    expect(cycle.stdout).toContain('Candidate Snapshot:')
    expect(cycle.stdout).toContain('status: invalid')
    expect(cycle.stdout).toContain('blockedPackageIds: a_cycle, b_cycle')
    expect(cycle.stdout).toContain('entryCount: 4242')
    expect(cycle.stdout).toContain('Result: FAILED')
  })

  it('exits 0 while still printing warning diagnostics for missing optional dependencies', async() => {
    const root = await createTempRoot()
    const packsRoot = path.join(root, 'packs')
    await mkdir(packsRoot, { recursive: true })
    await createPack(packsRoot, 'optional-warning', {
      id: 'optional_warning',
      optionalDependencies: [{ id: 'missing_optional', version: '^1.0.0' }]
    })

    const result = await runCli([packsRoot])

    expect(result.code).toBe(0)
    expect(result.stderr).toBe('')
    expect(result.stdout).toContain('Valid packages: 1')
    expect(result.stdout).toContain('Invalid packages: 0')
    expect(result.stdout).toContain('[optional-dependency-missing] optional-warning/manifest.json')
    expect(result.stdout).toContain('severity: warning')
    expect(result.stdout).toContain('Selection:')
    expect(result.stdout).toContain('status: completed')
    expect(result.stdout).toContain('1. optional_warning@1.0.0 (optional-warning)')
    expect(result.stdout).toContain('Candidate Snapshot:')
    expect(result.stdout).toContain('status: valid')
    expect(result.stdout).toContain('selectedPackageIds: optional_warning')
    expect(result.stdout).toContain('entryCount: 4243')
    expect(result.stdout).toContain('Result: OK')
  })

  it('stays read-only for fixtures, player userdata and official registry artifacts', async() => {
    const root = await createTempRoot()
    const packsRoot = path.join(root, 'packs')
    const userDataRoot = path.join(root, 'userdata')
    await copyPack('valid-gift-pack', packsRoot)
    await mkdir(path.join(userDataRoot, 'Local Storage', 'leveldb'), { recursive: true })
    await writeFile(path.join(userDataRoot, 'settings.json'), '{"closeToTray":false}\n', 'utf8')
    await writeFile(path.join(userDataRoot, 'Local Storage', 'leveldb', 'save.ldb'), 'player-save-data', 'utf8')
    const filesBefore = await collectFileContents(root)
    const officialBefore = countOfficialEntries()

    const result = await runCli([packsRoot])

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('Candidate Snapshot:')
    expect(result.stdout).toContain('status: valid')
    expect(result.stdout).toContain('entryCount: 4244')
    expect(await collectFileContents(root)).toEqual(filesBefore)
    expect(countOfficialEntries()).toEqual(officialBefore)
    expect(officialBefore).toEqual({
      registryCount: 54,
      entryCount: 4242,
      snapshotHash: committedMetadata.snapshotHash
    })
  }, 15_000)

  it('matches the existing discovery entrypoint summary and issue kinds', async() => {
    const directReport = await discoverThirdPartyDataPacks(fixtureRoot, createNodeFileSystem())

    const result = await runCli([fixtureRoot])

    expect(result.code).toBe(1)
    expect(result.stdout).toContain(`Discovered packages: ${directReport.summary.candidateCount}`)
    expect(result.stdout).toContain(`Valid packages: ${directReport.summary.validPackageCount}`)
    expect(result.stdout).toContain(`Invalid packages: ${directReport.summary.invalidPackageCount}`)
    expect(result.stdout).toContain(`Issues: ${directReport.summary.issueCount}`)
    expect(result.stdout).toContain('Candidate Snapshot:')
    expect(result.stdout).toContain('status: invalid')
    expect(result.stdout).toContain('entryCount: 4242')
    for (const kind of new Set(directReport.issues.map(issue => issue.kind))) {
      expect(result.stdout).toContain(`[${kind}]`)
    }
  })
})
