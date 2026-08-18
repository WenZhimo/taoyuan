/// <reference types="node" />

import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { cwd } from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import {
  CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
  createDiscoveryFileSystemFromContentPackageSource,
  readContentPackageSourceJson
} from '@/domain/mods/contentPackageSource'
import {
  buildElectronReadonlySourceAdapterProbeReport,
  createElectronReadonlyDirectorySource
} from '@/domain/mods/electronContentPackageSourceProbe'
import {
  createElectronReadonlyDirectoryNodeHost,
  toElectronReadonlyDirectorySourceIpcResult
} from '@/domain/mods/electronReadonlyDirectorySourceHost'

const projectRoot = cwd()
const fixtureRoot = path.join(projectRoot, 'src/tests/fixtures/mods/third-party-discovery')
const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-electron-readonly-source-'))
  roots.push(root)
  return root
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
        result[path.relative(root, absolutePath).replace(/\\/g, '/')] = await readFile(absolutePath, 'utf8')
      }
    }
  }
  await visit(root)
  return result
}

describe('electron read-only directory source host', () => {
  it('publishes a production Electron directory source over a fixed mods root', async() => {
    const root = await createRoot()
    const modsRoot = path.join(root, 'mods')
    const userDataRoot = path.join(root, 'userdata')
    await cp(path.join(fixtureRoot, 'valid-gift-pack'), path.join(modsRoot, 'valid-gift-pack'), { recursive: true })
    await mkdir(userDataRoot, { recursive: true })
    await writeFile(path.join(userDataRoot, 'settings.json'), '{"closeToTray":false}\n', 'utf8')
    const before = await collectFileContents(root)
    const source = createElectronReadonlyDirectorySource({
      host: createElectronReadonlyDirectoryNodeHost(modsRoot)
    })

    const sourceReport = await buildElectronReadonlySourceAdapterProbeReport(source)
    const manifestJson = await readContentPackageSourceJson(source, 'valid-gift-pack/manifest.json')
    const discoveryReport = await createDiscoveryFileSystemFromContentPackageSource(source)
      .readDirectory(source.identity.rootPath)
    await source.dispose()

    expect(source.identity).toEqual({
      contractVersion: CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      kind: 'electron-readonly-directory',
      sourceId: 'electron/mods-readonly-directory',
      rootPath: 'mods'
    })
    expect(Object.isFrozen(source.identity)).toBe(true)
    expect(sourceReport).toMatchObject({
      status: 'ready',
      inspectedPath: '',
      inspectedEntryKind: 'directory',
      sourceIdentity: source.identity,
      effects: {
        runtimeEnablementAllowed: false,
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
    expect(manifestJson).toMatchObject({
      ok: true,
      data: { id: 'discovery_valid' }
    })
    expect(discoveryReport).toEqual([
      { name: 'valid-gift-pack', kind: 'directory', isSymbolicLink: false }
    ])
    expect(JSON.stringify(source.identity)).not.toContain(root)
    expect(JSON.stringify(sourceReport)).not.toContain(root)
    expect(await collectFileContents(root)).toEqual(before)
  }, 15_000)

  it('returns structured IPC results without creating a missing mods directory', async() => {
    const root = await createRoot()
    const modsRoot = path.join(root, 'mods')
    const before = await collectFileContents(root)
    const host = createElectronReadonlyDirectoryNodeHost(modsRoot)

    const missingRoot = await toElectronReadonlyDirectorySourceIpcResult(
      'inspect',
      '',
      () => host.getEntry('')
    )
    const unsafePath = await toElectronReadonlyDirectorySourceIpcResult(
      'read',
      '..\\userdata\\settings.json',
      () => host.readTextFile('..\\userdata\\settings.json')
    )
    const hostFailure = await toElectronReadonlyDirectorySourceIpcResult(
      'inspect',
      'private-pack/manifest.json',
      async() => {
        throw new Error(`EACCES: stat ${modsRoot}\\private-pack\\manifest.json`)
      }
    )

    expect(missingRoot).toEqual({ ok: true, value: null })
    expect(unsafePath).toEqual({
      ok: false,
      error: {
        code: 'SOURCE_PATH_UNSAFE',
        message: 'Content package source path is unsafe'
      }
    })
    expect(hostFailure).toMatchObject({
      ok: false,
      error: {
        code: 'SOURCE_ENTRY_NOT_FOUND',
        message: 'Content package source inspect operation failed',
        sourcePath: 'private-pack/manifest.json'
      }
    })
    for (const result of [missingRoot, unsafePath, hostFailure]) {
      expect(JSON.stringify(result)).not.toContain(root)
      expect(JSON.stringify(result)).not.toContain('userdata')
      expect(JSON.stringify(result)).not.toContain('private-pack\\manifest')
    }
    expect(await collectFileContents(root)).toEqual(before)
  })
})
