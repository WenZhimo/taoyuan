/// <reference types="node" />

import { mkdir, mkdtemp, readFile, readdir, rm, stat, utimes, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { hashCanonicalJson, type Sha256Hash } from '@/domain/mods/hash'
import type { ContentId, PackageId, RegistryTypeId } from '@/domain/mods/ids'
import {
  createThirdPartyDataPackModLockText,
  cleanupThirdPartyDataPackModLockTempFiles,
  getThirdPartyDataPackModLockFilePaths,
  parseThirdPartyDataPackModLockText,
  readThirdPartyDataPackModLockFile,
  THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME,
  ThirdPartyDataPackModLockFileError,
  writeThirdPartyDataPackModLockFile
} from '@/domain/mods/thirdPartyDataPackModLockFile'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const roots: string[] = []

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async(): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-mod-lock-file-'))
  roots.push(root)
  return root
}

const sha = (fill: string): Sha256Hash =>
  `sha256:${fill.repeat(64)}` as Sha256Hash

const createDraft = (
  options: {
    readonly packageId?: PackageId
    readonly itemId?: ContentId
    readonly candidateHash?: Sha256Hash
  } = {}
): ThirdPartyDataPackLockfileDraft => {
  const packageId = options.packageId ?? 'sample_pack' as PackageId
  const itemId = options.itemId ?? `${packageId}:linen_ribbon` as ContentId
  const body: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> = {
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity: {
      artifactHash: committedMetadata.artifactHash as Sha256Hash,
      contentHash: committedMetadata.contentHash as Sha256Hash,
      schemaSetHash: committedMetadata.schemaSetHash as Sha256Hash,
      environmentHash: committedMetadata.environmentHash as Sha256Hash,
      snapshotHash: committedMetadata.snapshotHash as Sha256Hash,
      registryCount: 54,
      entryCount: 4242
    },
    candidateIdentity: {
      formatVersion: 1,
      contentHash: sha('a'),
      snapshotHash: sha('b'),
      candidateHash: options.candidateHash ?? sha('c')
    },
    registryCount: 55,
    entryCount: 4243,
    selectedPackageIds: [packageId],
    loadOrder: [packageId],
    packages: [
      {
        packageId,
        version: '1.0.0',
        loadIndex: 0,
        source: {
          candidatePath: 'sample-pack',
          manifestPath: 'sample-pack/manifest.json',
          contentFiles: ['sample-pack/data/items.json']
        },
        manifestHash: sha('d'),
        contentHash: sha('e'),
        configurationHash: sha('f'),
        resolvedDependencies: [],
        contentFiles: [
          {
            registryId: 'taoyuan:item' as RegistryTypeId,
            path: 'data/items.json',
            entryCount: 1,
            entries: [
              {
                registryId: 'taoyuan:item' as RegistryTypeId,
                contentId: itemId,
                index: 0,
                canonicalHash: sha('1')
              }
            ]
          }
        ]
      }
    ]
  }
  return {
    ...body,
    lockfileHash: hashCanonicalJson(body) as Sha256Hash
  }
}

const mutateDraftWithoutRehash = (
  draft: ThirdPartyDataPackLockfileDraft
): ThirdPartyDataPackLockfileDraft => ({
  ...draft,
  candidateIdentity: {
    ...draft.candidateIdentity,
    candidateHash: sha('9')
  }
})

const readDirectoryNames = async(directory: string): Promise<readonly string[]> =>
  (await readdir(directory)).sort()

const readTemporaryNames = async(directory: string): Promise<readonly string[]> =>
  (await readDirectoryNames(directory))
    .filter(name => name.startsWith(`.${THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME}.tmp-`))

describe('third-party mod-lock atomic file boundary', () => {
  it('writes and reads a validated draft under userdata without touching settings, saves or official cache', async() => {
    const root = await createRoot()
    const userData = path.join(root, 'userdata')
    const paths = getThirdPartyDataPackModLockFilePaths(userData)
    const settingsPath = path.join(userData, 'settings.json')
    const savePath = path.join(userData, 'Local Storage', 'leveldb', 'save.ldb')
    const officialCachePath = path.join(userData, 'mod-cache', 'sha256-official', 'official-registry-cache-v2.json')
    await mkdir(path.dirname(savePath), { recursive: true })
    await mkdir(path.dirname(officialCachePath), { recursive: true })
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    await writeFile(officialCachePath, 'official-cache-data', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')
    const officialCacheBefore = await readFile(officialCachePath, 'utf8')
    const draft = createDraft()

    await writeThirdPartyDataPackModLockFile(paths, draft)
    const firstBytes = await readFile(paths.filePath, 'utf8')
    await writeThirdPartyDataPackModLockFile(paths, draft)

    expect(paths.directory).toBe(userData)
    expect(paths.filePath).toBe(path.join(userData, THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME))
    expect(await readThirdPartyDataPackModLockFile(paths)).toEqual(draft)
    expect(await readFile(paths.filePath, 'utf8')).toBe(firstBytes)
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(await readFile(officialCachePath, 'utf8')).toBe(officialCacheBefore)
    expect(await readDirectoryNames(userData)).toEqual([
      'Local Storage',
      'mod-cache',
      THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME,
      'settings.json'
    ].sort())
  }, 30_000)

  it('returns null for a missing lockfile and removes only stale mod-lock temporary files', async() => {
    const root = await createRoot()
    const paths = getThirdPartyDataPackModLockFilePaths(path.join(root, 'userdata'))

    expect(await readThirdPartyDataPackModLockFile(paths)).toBeNull()

    await mkdir(paths.directory, { recursive: true })
    await writeFile(path.join(paths.directory, 'unrelated.tmp'), 'keep', 'utf8')
    await writeFile(path.join(paths.directory, '.official-registry-cache-v2.json.tmp-keep'), 'keep', 'utf8')
    const staleTemp = path.join(paths.directory, `.${THIRD_PARTY_DATA_PACK_MOD_LOCK_FILE_NAME}.tmp-stale`)
    await writeFile(staleTemp, 'stale', 'utf8')
    const old = new Date(Date.now() - 60_000)
    await utimes(staleTemp, old, old)

    await cleanupThirdPartyDataPackModLockTempFiles(paths, { staleTempAgeMs: 0 })

    await expect(stat(staleTemp)).rejects.toMatchObject({ code: 'ENOENT' })
    expect(await readFile(path.join(paths.directory, 'unrelated.tmp'), 'utf8')).toBe('keep')
    expect(await readFile(path.join(paths.directory, '.official-registry-cache-v2.json.tmp-keep'), 'utf8')).toBe('keep')
  })

  it('preserves the previous valid lockfile when writing is interrupted or replacement fails', async() => {
    const root = await createRoot()
    const paths = getThirdPartyDataPackModLockFilePaths(path.join(root, 'userdata'))
    const oldDraft = createDraft()
    const newDraft = createDraft({ candidateHash: sha('8') })
    await writeThirdPartyDataPackModLockFile(paths, oldDraft)
    const oldBytes = await readFile(paths.filePath, 'utf8')

    await expect(writeThirdPartyDataPackModLockFile(
      paths,
      newDraft,
      { beforeReplace: () => { throw new Error('simulated interruption') } }
    )).rejects.toThrow('simulated interruption')
    expect(await readThirdPartyDataPackModLockFile(paths)).toEqual(oldDraft)
    expect(await readFile(paths.filePath, 'utf8')).toBe(oldBytes)

    await expect(writeThirdPartyDataPackModLockFile(
      paths,
      newDraft,
      { fileSystem: { rename: async() => { throw new Error('simulated replace failure') } } }
    )).rejects.toThrow('simulated replace failure')
    expect(await readThirdPartyDataPackModLockFile(paths)).toEqual(oldDraft)
    expect(await readTemporaryNames(paths.directory)).toEqual([])
  }, 30_000)

  it('does not expose a half-written lockfile to concurrent readers', async() => {
    const root = await createRoot()
    const paths = getThirdPartyDataPackModLockFilePaths(path.join(root, 'userdata'))
    const oldDraft = createDraft()
    const newDraft = createDraft({ candidateHash: sha('7') })
    await writeThirdPartyDataPackModLockFile(paths, oldDraft)

    let signalReady!: () => void
    let release!: () => void
    const ready = new Promise<void>(resolve => { signalReady = resolve })
    const gate = new Promise<void>(resolve => { release = resolve })
    const writing = writeThirdPartyDataPackModLockFile(
      paths,
      newDraft,
      {
        beforeReplace: async() => {
          signalReady()
          await gate
        }
      }
    )

    await ready
    expect(await readThirdPartyDataPackModLockFile(paths)).toEqual(oldDraft)
    release()
    await writing
    expect(await readThirdPartyDataPackModLockFile(paths)).toEqual(newDraft)
  }, 30_000)

  it('rejects invalid JSON, schema errors and self-hash mismatches without publishing them', async() => {
    const root = await createRoot()
    const paths = getThirdPartyDataPackModLockFilePaths(path.join(root, 'userdata'))
    const oldDraft = createDraft()
    await writeThirdPartyDataPackModLockFile(paths, oldDraft)

    expect(() => parseThirdPartyDataPackModLockText('not-json'))
      .toThrowError(expect.objectContaining({ kind: 'invalid-json' }))

    expect(() => parseThirdPartyDataPackModLockText(JSON.stringify({
      ...oldDraft,
      unexpected: true
    }))).toThrowError(expect.objectContaining({ kind: 'structure' }))

    const invalidSelfHash = mutateDraftWithoutRehash(oldDraft)
    expect(() => parseThirdPartyDataPackModLockText(JSON.stringify(invalidSelfHash)))
      .toThrowError(expect.objectContaining({ kind: 'self-hash' }))
    await expect(writeThirdPartyDataPackModLockFile(paths, invalidSelfHash))
      .rejects.toThrowError(ThirdPartyDataPackModLockFileError)
    expect(await readThirdPartyDataPackModLockFile(paths)).toEqual(oldDraft)
  }, 30_000)

  it('creates deterministic lockfile bytes for the same validated draft', () => {
    const draft = createDraft()
    const clonedDraft = JSON.parse(JSON.stringify(draft)) as ThirdPartyDataPackLockfileDraft

    expect(createThirdPartyDataPackModLockText(clonedDraft))
      .toBe(createThirdPartyDataPackModLockText(draft))
    expect(parseThirdPartyDataPackModLockText(createThirdPartyDataPackModLockText(draft)))
      .toEqual(draft)
  })
})
