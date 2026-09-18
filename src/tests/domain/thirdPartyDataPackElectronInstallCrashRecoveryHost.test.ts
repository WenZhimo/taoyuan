import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createThirdPartyDataPackElectronInstallCrashRecoveryHost,
  resolveThirdPartyDataPackElectronInstallCrashRecoveryPaths
} from '@/domain/mods/thirdPartyDataPackElectronInstallCrashRecoveryHost'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { PackageId } from '@/domain/mods/ids'

const roots: string[] = []
const testHash = (digit: string): Sha256Hash => `sha256:${digit.repeat(64)}` as Sha256Hash
const testPackageId = 'sample' as PackageId

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-install-crash-recovery-'))
  roots.push(root)
  return root
}

const writeText = async(root: string, relativePath: string, contents: string): Promise<void> => {
  const filePath = path.join(root, ...relativePath.split('/'))
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, contents, 'utf8')
}

const readOptionalText = async(root: string, relativePath: string): Promise<string | null> => {
  try {
    return await readFile(path.join(root, ...relativePath.split('/')), 'utf8')
  } catch (error) {
    if (
      error !== null
      && typeof error === 'object'
      && 'code' in error
      && (error as { code?: unknown }).code === 'ENOENT'
    ) return null
    throw error
  }
}

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

describe('third-party Electron install crash recovery host', () => {
  it('reports a clean startup when no interrupted install exists', async() => {
    const root = await createRoot()
    const host = createThirdPartyDataPackElectronInstallCrashRecoveryHost({
      programDirectoryPath: root
    })

    const result = await host.replay()

    expect(result.status).toBe('clean')
    expect(result.effects.recoveryLogRead).toBe(false)
    expect(result.effects.recoveryLogReplayed).toBe(false)
    expect(result.effects.rollbackExecuted).toBe(false)
  })

  it('restores pre-install files and removes files created before interruption', async() => {
    const root = await createRoot()
    const previousSettings = '{"closeToTray":false}\n'
    const previousManifest = '{"id":"sample","version":"1.0.0"}\n'
    await writeText(root, 'userdata/settings.json', previousSettings)
    await writeText(root, 'mods/sample/manifest.json', previousManifest)

    const host = createThirdPartyDataPackElectronInstallCrashRecoveryHost({
      programDirectoryPath: root
    })
    const prepared = await host.prepare({
      targetPackageId: testPackageId,
      candidateHash: testHash('a'),
      lockfileHash: testHash('b'),
      transactionId: 'interrupted-install',
      createdAtIso: '2026-09-18T00:00:00.000Z',
      targets: [
        { relativePath: 'userdata/settings.json' },
        { relativePath: 'userdata/mod-lock.json' },
        { relativePath: 'userdata/mod-startup-state/startup-persistent-state-snapshot.json' },
        { relativePath: 'mods/sample/manifest.json' },
        { relativePath: 'mods/sample/data/items.json' }
      ]
    })
    expect(prepared.status).toBe('prepared')

    await writeText(root, 'userdata/settings.json', '{"thirdPartyDataPacks":{}}\n')
    await writeText(root, 'userdata/mod-lock.json', '{"partial":true}\n')
    await writeText(root, 'userdata/mod-startup-state/startup-persistent-state-snapshot.json', '{}\n')
    await writeText(root, 'mods/sample/manifest.json', '{"id":"sample","version":"2.0.0"}\n')
    await writeText(root, 'mods/sample/data/items.json', '[]\n')
    await writeText(root, 'mods/sample/data/.taoyuan-package-file-write-probe.tmp-interrupted', 'temp')

    const recovered = await host.replay()

    expect(recovered.status).toBe('recovered')
    expect(recovered.transactionId).toBe('interrupted-install')
    expect(recovered.operation).toBe('install')
    expect(recovered.restoredFileCount).toBe(2)
    expect(recovered.removedCreatedFileCount).toBe(3)
    expect(recovered.effects).toMatchObject({
      recoveryLogRead: true,
      recoveryLogReplayed: true,
      packageFilesRestored: true,
      settingsRestored: true,
      lockfileRestored: true,
      startupStateRestored: true,
      rollbackExecuted: true
    })
    expect(await readOptionalText(root, 'userdata/settings.json')).toBe(previousSettings)
    expect(await readOptionalText(root, 'userdata/mod-lock.json')).toBeNull()
    expect(await readOptionalText(
      root,
      'userdata/mod-startup-state/startup-persistent-state-snapshot.json'
    )).toBeNull()
    expect(await readOptionalText(root, 'mods/sample/manifest.json')).toBe(previousManifest)
    expect(await readOptionalText(root, 'mods/sample/data/items.json')).toBeNull()
    expect(await readOptionalText(
      root,
      'mods/sample/data/.taoyuan-package-file-write-probe.tmp-interrupted'
    )).toBeNull()
    expect(await readOptionalText(
      root,
      'userdata/mod-transactions/install-recovery.json'
    )).toBeNull()
    expect((await host.replay()).status).toBe('clean')
  })

  it('settles only the matching prepared recovery log', async() => {
    const root = await createRoot()
    const host = createThirdPartyDataPackElectronInstallCrashRecoveryHost({
      programDirectoryPath: root
    })
    const prepared = await host.prepare({
      targetPackageId: testPackageId,
      candidateHash: testHash('a'),
      lockfileHash: testHash('b'),
      transactionId: 'completed-install',
      targets: [{ relativePath: 'userdata/settings.json' }]
    })
    expect(prepared.status).toBe('prepared')
    expect(prepared.entryHash).toBeDefined()

    const mismatch = await host.settle('other-install', prepared.entryHash!)
    expect(mismatch.status).toBe('blocked')
    expect(mismatch.effects.recoveryLogCleared).toBe(false)

    const settled = await host.settle('completed-install', prepared.entryHash!)
    expect(settled.status).toBe('settled')
    expect(settled.operation).toBe('install')
    expect(settled.effects.recoveryLogCleared).toBe(true)
    expect((await host.replay()).status).toBe('clean')
  })

  it.each(['disable', 'enable', 'uninstall'] as const)(
    'replays an interrupted %s lifecycle write from the same recovery boundary',
    async(operation) => {
      const root = await createRoot()
      const previousSettings = `{"operation":"before-${operation}"}\n`
      await writeText(root, 'userdata/settings.json', previousSettings)
      const host = createThirdPartyDataPackElectronInstallCrashRecoveryHost({
        programDirectoryPath: root
      })
      const prepared = await host.prepare({
        operation,
        targetPackageId: testPackageId,
        candidateHash: testHash('a'),
        lockfileHash: testHash('b'),
        transactionId: `interrupted-${operation}`,
        targets: [{ relativePath: 'userdata/settings.json' }]
      })
      expect(prepared).toMatchObject({
        status: 'prepared',
        operation,
        transactionId: `interrupted-${operation}`
      })

      await writeText(root, 'userdata/settings.json', `{"operation":"partial-${operation}"}\n`)
      const recovered = await host.replay()

      expect(recovered).toMatchObject({
        status: 'recovered',
        operation,
        transactionId: `interrupted-${operation}`
      })
      expect(await readOptionalText(root, 'userdata/settings.json')).toBe(previousSettings)
    }
  )

  it('blocks unsafe targets and corrupt recovery entries without touching files', async() => {
    const root = await createRoot()
    const host = createThirdPartyDataPackElectronInstallCrashRecoveryHost({
      programDirectoryPath: root
    })
    const unsafe = await host.prepare({
      targetPackageId: testPackageId,
      candidateHash: testHash('a'),
      lockfileHash: testHash('b'),
      targets: [{ relativePath: '../settings.json' }]
    })
    expect(unsafe.status).toBe('blocked')

    const paths = resolveThirdPartyDataPackElectronInstallCrashRecoveryPaths(root)
    await mkdir(paths.transactionDirectoryPath, { recursive: true })
    await writeFile(paths.recoveryFilePath, '{"corrupt":true}\n', 'utf8')
    const corrupt = await host.replay()
    expect(corrupt.status).toBe('blocked')
    expect(corrupt.effects.recoveryLogReplayed).toBe(false)
    expect(await readOptionalText(
      root,
      'userdata/mod-transactions/install-recovery.json'
    )).not.toBeNull()
  })
})
