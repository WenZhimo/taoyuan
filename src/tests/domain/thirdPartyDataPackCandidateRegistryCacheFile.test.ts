/// <reference types="node" />

import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  getThirdPartyDataPackCandidateRegistryCacheFilePaths,
  readThirdPartyDataPackCandidateRegistryCacheFile,
  writeThirdPartyDataPackCandidateRegistryCacheFile
} from '@/domain/mods/thirdPartyDataPackCandidateRegistryCacheFile'
import { THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_MAX_BYTES } from '@/domain/mods/thirdPartyDataPackCandidateRegistryCache'
import type { Sha256Hash } from '@/domain/mods/hash'

const roots: string[] = []
const environmentHash = `sha256:${'b'.repeat(64)}` as Sha256Hash

afterEach(async() => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

describe('third-party Electron candidate registry cache file', () => {
  it('resolves only to program-directory userdata and reports a missing cache', async() => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-third-party-cache-'))
    roots.push(root)
    const paths = getThirdPartyDataPackCandidateRegistryCacheFilePaths(
      path.join(root, 'userdata'),
      environmentHash
    )

    expect(paths.directory).toContain(path.join('userdata', 'mod-cache', 'sha256-'))
    expect(paths.filePath).toContain('third-party-registry-cache-v1.json')
    expect(await readThirdPartyDataPackCandidateRegistryCacheFile(paths)).toBeNull()
  })

  it('rejects malformed or oversized writes before touching the cache directory', async() => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-third-party-cache-'))
    roots.push(root)
    const paths = getThirdPartyDataPackCandidateRegistryCacheFilePaths(
      path.join(root, 'userdata'),
      environmentHash
    )

    await expect(writeThirdPartyDataPackCandidateRegistryCacheFile(paths, 'not-json'))
      .rejects.toThrow('not valid JSON')
    await expect(stat(paths.directory)).rejects.toMatchObject({ code: 'ENOENT' })

    const oversized = 'x'.repeat(THIRD_PARTY_DATA_PACK_CANDIDATE_REGISTRY_CACHE_MAX_BYTES + 1)
    await expect(writeThirdPartyDataPackCandidateRegistryCacheFile(paths, oversized))
      .rejects.toThrow('exceeds the size limit')
    await expect(stat(paths.directory)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('reads a corrupt file without escaping its cache directory', async() => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-third-party-cache-'))
    roots.push(root)
    const paths = getThirdPartyDataPackCandidateRegistryCacheFilePaths(
      path.join(root, 'userdata'),
      environmentHash
    )
    await mkdir(paths.directory, { recursive: true })
    await writeFile(paths.filePath, 'not-json', 'utf8')

    expect(await readThirdPartyDataPackCandidateRegistryCacheFile(paths)).toBe('not-json')
    expect(await readFile(paths.filePath, 'utf8')).toBe('not-json')
  })
})
