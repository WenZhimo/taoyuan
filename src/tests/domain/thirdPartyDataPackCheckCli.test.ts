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
    expect(result.stdout).toContain('Result: OK')
  })

  it('returns non-zero for missing roots and argument errors without crashing', async() => {
    const root = await createTempRoot()

    const missing = await runCli([path.join(root, 'missing')])
    expect(missing.code).toBe(1)
    expect(missing.stdout).toContain('Discovery status: directory-not-found')
    expect(missing.stdout).toContain('[directory-not-found]')
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
    expect(await collectFileContents(root)).toEqual(filesBefore)
    expect(countOfficialEntries()).toEqual(officialBefore)
    expect(officialBefore).toEqual({
      registryCount: 54,
      entryCount: 4242,
      snapshotHash: committedMetadata.snapshotHash
    })
  })

  it('matches the existing discovery entrypoint summary and issue kinds', async() => {
    const directReport = await discoverThirdPartyDataPacks(fixtureRoot, createNodeFileSystem())

    const result = await runCli([fixtureRoot])

    expect(result.code).toBe(1)
    expect(result.stdout).toContain(`Discovered packages: ${directReport.summary.candidateCount}`)
    expect(result.stdout).toContain(`Valid packages: ${directReport.summary.validPackageCount}`)
    expect(result.stdout).toContain(`Invalid packages: ${directReport.summary.invalidPackageCount}`)
    expect(result.stdout).toContain(`Issues: ${directReport.summary.issueCount}`)
    for (const kind of new Set(directReport.issues.map(issue => issue.kind))) {
      expect(result.stdout).toContain(`[${kind}]`)
    }
  })
})
