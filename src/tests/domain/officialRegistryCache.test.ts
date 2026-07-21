/// <reference types="node" />

import { mkdir, mkdtemp, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createOfficialRegistryCacheText,
  OFFICIAL_REGISTRY_CACHE_FILE_NAME,
  OFFICIAL_REGISTRY_CACHE_FORMAT_VERSION,
  parseOfficialRegistryCacheText,
  OfficialRegistryCacheError
} from '@/domain/mods/officialRegistryCache'
import {
  cleanupOfficialRegistryCacheTempFiles,
  getOfficialRegistryCacheFilePaths,
  readOfficialRegistryCacheFile,
  writeOfficialRegistryCacheFile
} from '@/domain/mods/officialRegistryCacheFile'
import {
  createOfficialContentBootstrap,
  validateOfficialRegistryStructure
} from '@/domain/mods/officialContentBootstrap'
import {
  restoreOfficialPrecompiledRegistryArtifact,
  restoreParsedOfficialPrecompiledRegistryArtifact
} from '@/domain/mods/officialPrecompiled'
import {
  createIngredientAllocationPlan,
  getMaxIngredientCraftQuantity
} from '@/domain/cooking/ingredientPlanner'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_REGISTRY_DEFINITIONS,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import committedArtifact from '@/generated/mods/official-precompiled-registry.json'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'
import type { OfficialPrecompiledRegistryArtifact } from '@/domain/mods/precompiledRegistrySchema'
import type { Sha256Hash } from '@/domain/mods/hash'
import type { CropDef, ItemDef, RecipeDef } from '@/domain/mods/schemas'
import type { RegistrySet } from '@/domain/mods/registry'

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

const createRoot = async (): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taoyuan-official-cache-'))
  roots.push(root)
  return root
}

const buildCacheText = (): string => createOfficialRegistryCacheText(
  committedArtifact as unknown as OfficialPrecompiledRegistryArtifact,
  committedMetadata as unknown
)
const validCacheText = buildCacheText()
const createCacheText = (): string => validCacheText

const createLegacyV1CacheText = (): string => JSON.stringify({
  cacheFormatVersion: 1,
  identity: {
    artifactHash: committedMetadata.artifactHash,
    contentHash: committedMetadata.contentHash,
    schemaSetHash: committedMetadata.schemaSetHash,
    environmentHash: committedMetadata.environmentHash,
    snapshotHash: committedMetadata.snapshotHash
  },
  artifact: committedArtifact
}, null, 2) + '\n'

const restoreCacheFast = (value: unknown) => {
  const parsed = parseOfficialRegistryCacheText(value as string, committedMetadata as unknown)
  return {
    registrySet: restoreParsedOfficialPrecompiledRegistryArtifact(
      OFFICIAL_REGISTRY_DEFINITIONS,
      parsed.artifact
    ),
    verification: 'fast' as const
  }
}

const summarizeRepresentativeBehavior = (registrySet: RegistrySet) => {
  const itemRegistry = registrySet.get<ItemDef>(toOfficialRegistryTypeId('item'))
  const recipeRegistry = registrySet.get<RecipeDef>(toOfficialRegistryTypeId('recipe'))
  const cropRegistry = registrySet.get<CropDef>(toOfficialRegistryTypeId('crop'))
  const items = itemRegistry.values()
  const stirFriedCabbage = recipeRegistry.require(toOfficialContentId('stir_fried_cabbage'))
  const steamedBun = recipeRegistry.require(toOfficialContentId('steamed_bun'))
  const fixedInventory = [{ itemId: 'cabbage', quantity: 3, quality: 'normal' as const }]
  const tagInventory = [
    { itemId: 'flour', quantity: 2, quality: 'normal' as const },
    { itemId: 'fish_carp', quantity: 2, quality: 'normal' as const },
    { itemId: 'cabbage', quantity: 1, quality: 'fine' as const }
  ]
  const fixedPlan = createIngredientAllocationPlan({
    ingredients: stirFriedCabbage.ingredients,
    quantity: 3,
    inventory: fixedInventory,
    items
  })
  const tagPlan = createIngredientAllocationPlan({
    ingredients: steamedBun.ingredients,
    quantity: 1,
    inventory: tagInventory,
    items,
    selectedItemIds: { 1: 'cabbage' }
  })

  return {
    itemName: itemRegistry.require(toOfficialContentId('cabbage')).name.fallback,
    recipeName: stirFriedCabbage.name.fallback,
    cropName: cropRegistry.require(toOfficialContentId('cabbage')).name.fallback,
    fixedCanCook: fixedPlan.success,
    fixedMaxCookable: getMaxIngredientCraftQuantity({
      ingredients: stirFriedCabbage.ingredients,
      inventory: fixedInventory,
      items
    }),
    fixedQuality: fixedPlan.success ? fixedPlan.resultQuality : null,
    fixedRemovals: fixedPlan.success ? fixedPlan.removals : [],
    tagCanCook: tagPlan.success,
    tagMaxCookable: getMaxIngredientCraftQuantity({
      ingredients: steamedBun.ingredients,
      inventory: tagInventory,
      items,
      selectedItemIds: { 1: 'cabbage' }
    }),
    tagQuality: tagPlan.success ? tagPlan.resultQuality : null,
    tagRemovals: tagPlan.success ? tagPlan.removals : []
  }
}

const createPaths = (root: string) => getOfficialRegistryCacheFilePaths(
  path.join(root, 'userdata'),
  committedMetadata.environmentHash
)

describe('official registry disk cache envelope', () => {
  it('creates deterministic cache bytes and restores the official snapshot', () => {
    const text = createCacheText()
    expect(text).toBe(buildCacheText())

    const parsed = parseOfficialRegistryCacheText(text, committedMetadata as unknown)
    expect(parsed.artifactHash).toBe(committedMetadata.artifactHash)
    expect(parsed.validationMode).toBe('fast')
    expect(parsed.envelope.cacheFormatVersion).toBe(OFFICIAL_REGISTRY_CACHE_FORMAT_VERSION)
    expect(parsed.envelope.payloadHash).toBe(committedMetadata.artifactHash)
    expect(parsed.envelope.identity).toEqual({
      artifactHash: committedMetadata.artifactHash,
      contentHash: committedMetadata.contentHash,
      schemaSetHash: committedMetadata.schemaSetHash,
      environmentHash: committedMetadata.environmentHash,
      snapshotHash: committedMetadata.snapshotHash
    })
    expect(parsed.artifact.snapshot).toEqual(committedArtifact.snapshot)
    expect(parsed.artifact.snapshot.registries).toHaveLength(54)
    expect(parsed.artifact.snapshot.registries.reduce(
      (total, registry) => total + registry.entries.length,
      0
    )).toBe(4242)
  })

  it.each([
    ['artifactHash', 'artifactHash'],
    ['contentHash', 'contentHash'],
    ['schemaSetHash', 'schemaSetHash'],
    ['environmentHash', 'environmentHash'],
    ['snapshotHash', 'snapshotHash']
  ] as const)('rejects %s identity mismatch', (_label, key) => {
    const value = JSON.parse(createCacheText()) as Record<string, unknown>
    const identity = value.identity as Record<string, unknown>
    identity[key] = `sha256:${'0'.repeat(64)}`

    expect(() => parseOfficialRegistryCacheText(JSON.stringify(value), committedMetadata as unknown))
      .toThrowError(OfficialRegistryCacheError)
  })

  it.each([
    ['truncated JSON', createCacheText().slice(0, 200), 'invalid-json'],
    ['illegal JSON', 'not-json', 'invalid-json'],
    ['legacy v1 format version', createLegacyV1CacheText(), 'format-version'],
    ['future format version', JSON.stringify({
      cacheFormatVersion: 3,
      identity: JSON.parse(createCacheText()).identity,
      payloadHash: JSON.parse(createCacheText()).payloadHash,
      artifact: JSON.parse(createCacheText()).artifact
    }), 'format-version'],
    ['schema error', JSON.stringify({
      cacheFormatVersion: 2,
      identity: { ...JSON.parse(createCacheText()).identity, artifactHash: undefined },
      payloadHash: JSON.parse(createCacheText()).payloadHash,
      artifact: JSON.parse(createCacheText()).artifact
    }), 'structure']
  ] as const)('rejects %s cache input', (_label, value, kind) => {
    expect(() => parseOfficialRegistryCacheText(value, committedMetadata as unknown))
      .toThrowError(expect.objectContaining({ kind }))
  })

  it('rejects an artifact mutation even when the wrapper identity is unchanged', () => {
    const value = JSON.parse(createCacheText()) as Record<string, unknown>
    const artifact = value.artifact as Record<string, unknown>
    const snapshot = artifact.snapshot as Record<string, unknown>
    const registries = snapshot.registries as Array<Record<string, unknown>>
    const entries = registries[0]!.entries as Array<Record<string, unknown>>
    const entry = entries[0]!.entry as Record<string, unknown>
    entry.id = 'taoyuan:cache-tampered'

    expect(() => parseOfficialRegistryCacheText(JSON.stringify(value), committedMetadata as unknown))
      .toThrowError(expect.objectContaining({ kind: 'identity-mismatch' }))
  })

  it('rejects a payload mutation when the envelope payload hash is unchanged', () => {
    const value = JSON.parse(createCacheText()) as Record<string, unknown>
    const artifact = value.artifact as Record<string, unknown>
    const snapshot = artifact.snapshot as Record<string, unknown>
    const registries = snapshot.registries as Array<Record<string, unknown>>
    const entries = registries[0]!.entries as Array<Record<string, unknown>>
    const entry = entries[0]!.entry as Record<string, unknown>
    entry.id = 'taoyuan:cache-tampered'

    expect(() => parseOfficialRegistryCacheText(JSON.stringify(value), committedMetadata as unknown))
      .toThrowError(expect.objectContaining({ kind: 'identity-mismatch' }))
  })

  it('rejects a structurally valid payload with the wrong official entry count', () => {
    const value = JSON.parse(createCacheText()) as Record<string, unknown>
    const artifact = value.artifact as Record<string, unknown>
    const snapshot = artifact.snapshot as Record<string, unknown>
    const registries = snapshot.registries as Array<Record<string, unknown>>
    const entries = registries[0]!.entries as unknown[]
    entries.pop()

    expect(() => parseOfficialRegistryCacheText(JSON.stringify(value), committedMetadata as unknown))
      .toThrowError(expect.objectContaining({ kind: 'structure' }))
  })
})

describe('official registry disk cache file', () => {
  it('isolates the cache from settings and save-like files', async () => {
    const root = await createRoot()
    const userData = path.join(root, 'userdata')
    const paths = createPaths(root)
    const settingsPath = path.join(userData, 'settings.json')
    const savePath = path.join(userData, 'Local Storage', 'leveldb', 'save')
    await mkdir(path.dirname(settingsPath), { recursive: true })
    await mkdir(path.dirname(savePath), { recursive: true })
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')

    await writeOfficialRegistryCacheFile(paths, createCacheText(), committedMetadata as unknown)
    const firstWrite = await readOfficialRegistryCacheFile(paths)
    await writeOfficialRegistryCacheFile(paths, createCacheText(), committedMetadata as unknown)

    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
    expect(paths.filePath.startsWith(path.join(userData, 'mod-cache'))).toBe(true)
    expect(await readOfficialRegistryCacheFile(paths)).toBe(firstWrite)
    expect(firstWrite).toBe(createCacheText())
  }, 30_000)

  it('returns null for a missing cache and removes only stale temporary files', async () => {
    const root = await createRoot()
    const paths = createPaths(root)
    expect(await readOfficialRegistryCacheFile(paths)).toBeNull()

    await mkdir(paths.directory, { recursive: true })
    await writeFile(path.join(paths.directory, 'unrelated.tmp'), 'keep', 'utf8')
    const staleTemp = path.join(paths.directory, `.${OFFICIAL_REGISTRY_CACHE_FILE_NAME}.tmp-stale`)
    await writeFile(staleTemp, 'stale', 'utf8')
    const old = new Date(Date.now() - 60_000)
    await utimes(staleTemp, old, old)

    await cleanupOfficialRegistryCacheTempFiles(paths, { staleTempAgeMs: 0 })

    await expect(stat(staleTemp)).rejects.toMatchObject({ code: 'ENOENT' })
    expect(await readFile(path.join(paths.directory, 'unrelated.tmp'), 'utf8')).toBe('keep')
  })

  it('preserves the previous cache when writing is interrupted or replacement fails', async () => {
    const root = await createRoot()
    const paths = createPaths(root)
    const oldContents = createCacheText() + '\n'
    const newContents = createCacheText()
    await writeOfficialRegistryCacheFile(paths, oldContents, committedMetadata as unknown)

    await expect(writeOfficialRegistryCacheFile(
      paths,
      newContents,
      committedMetadata as unknown,
      { beforeReplace: () => { throw new Error('simulated interruption') } }
    )).rejects.toThrow('simulated interruption')
    expect(await readOfficialRegistryCacheFile(paths)).toBe(oldContents)

    await expect(writeOfficialRegistryCacheFile(
      paths,
      newContents,
      committedMetadata as unknown,
      { fileSystem: { rename: async () => { throw new Error('simulated replace failure') } } }
    )).rejects.toThrow('simulated replace failure')
    expect(await readOfficialRegistryCacheFile(paths)).toBe(oldContents)
  }, 30_000)

  it('does not expose a half-written cache to concurrent readers', async () => {
    const root = await createRoot()
    const paths = createPaths(root)
    const oldContents = createCacheText() + '\n'
    const newContents = createCacheText()
    await writeOfficialRegistryCacheFile(paths, oldContents, committedMetadata as unknown)

    let signalReady!: () => void
    let release!: () => void
    const ready = new Promise<void>(resolve => { signalReady = resolve })
    const gate = new Promise<void>(resolve => { release = resolve })
    const writing = writeOfficialRegistryCacheFile(
      paths,
      newContents,
      committedMetadata as unknown,
      {
        beforeReplace: async () => {
          signalReady()
          await gate
        }
      }
    )
    await ready
    expect(await readOfficialRegistryCacheFile(paths)).toBe(oldContents)
    release()
    await writing
    expect(await readOfficialRegistryCacheFile(paths)).toBe(newContents)
  }, 30_000)

  it('does not modify settings or saves while an invalid cache falls back', async () => {
    const root = await createRoot()
    const userData = path.join(root, 'userdata')
    const paths = createPaths(root)
    const settingsPath = path.join(userData, 'settings.json')
    const savePath = path.join(userData, 'Local Storage', 'leveldb', 'save')
    await mkdir(paths.directory, { recursive: true })
    await mkdir(path.dirname(savePath), { recursive: true })
    await writeFile(paths.filePath, 'not-json', 'utf8')
    await writeFile(settingsPath, '{"closeToTray":false}\n', 'utf8')
    await writeFile(savePath, 'player-save-data', 'utf8')
    const settingsBefore = await readFile(settingsPath, 'utf8')
    const saveBefore = await readFile(savePath, 'utf8')

    const bootstrap = createOfficialContentBootstrap({
      buildRegistrySet: vi.fn(buildOfficialRegistrySetFromStaticData),
      validateStructure: validateOfficialRegistryStructure,
      validateSemantics: validateRegistrySemantics,
      freezeRegistrySet: registrySet => registrySet.freezeEntries(),
      diskCache: {
        isAvailable: () => true,
        load: () => readOfficialRegistryCacheFile(paths),
        restore: value => restoreParsedOfficialPrecompiledRegistryArtifact(
          OFFICIAL_REGISTRY_DEFINITIONS,
          parseOfficialRegistryCacheText(value as string, committedMetadata as unknown).artifact
        )
      },
      precompiled: {
        load: async () => committedArtifact,
        restore: value => restoreOfficialPrecompiledRegistryArtifact(
          OFFICIAL_REGISTRY_DEFINITIONS,
          value,
          committedMetadata.environmentHash as Sha256Hash
        )
      }
    })

    const restored = await bootstrap.bootstrap()
    expect(restored.registryIds()).toHaveLength(54)
    expect(bootstrap.getLastReport()).toMatchObject({
      source: 'precompiled',
      diskCacheStatus: 'cache-invalid-json'
    })
    expect(await readFile(settingsPath, 'utf8')).toBe(settingsBefore)
    expect(await readFile(savePath, 'utf8')).toBe(saveBefore)
  }, 30_000)
})

describe('official registry disk cache performance', () => {
  it('hits the disk cache without invoking the static content build', async () => {
    const cacheText = createCacheText()
    const buildRegistrySet = vi.fn(buildOfficialRegistrySetFromStaticData)
    const validateStructure = vi.fn(validateOfficialRegistryStructure)
    const validateSemantics = vi.fn(validateRegistrySemantics)
    const freezeRegistrySet = vi.fn((registrySet: RegistrySet) => registrySet.freezeEntries())
    const bootstrap = createOfficialContentBootstrap({
      buildRegistrySet,
      validateStructure,
      validateSemantics,
      freezeRegistrySet,
      diskCache: {
        isAvailable: () => true,
        load: async () => cacheText,
        restore: restoreCacheFast
      },
      precompiled: {
        load: async () => {
          throw new Error('bundled precompile should not be read after cache hit')
        },
        restore: () => { throw new Error('bundled restore should not run') }
      }
    })

    const startedAt = performance.now()
    const restored = await bootstrap.bootstrap()
    const durationMs = performance.now() - startedAt
    expect(buildRegistrySet).not.toHaveBeenCalled()
    expect(validateStructure).not.toHaveBeenCalled()
    expect(validateSemantics).not.toHaveBeenCalled()
    expect(freezeRegistrySet).not.toHaveBeenCalled()
    expect(restored.currentPhase).toBe('frozen')
    expect(bootstrap.getLastReport()).toMatchObject({
      source: 'disk-cache',
      loadPath: 'disk-cache-fast-hit',
      diskCacheStatus: 'disk-cache-fast-hit'
    })
    expect(durationMs).toBeLessThan(1_500)
    console.info(`official registry disk cache fast hit: ${durationMs.toFixed(2)}ms`)
  }, 30_000)

  it('can still report a full-verified disk cache hit and matches fast public behavior', async () => {
    const cacheText = createCacheText()
    const fastSet = restoreCacheFast(cacheText).registrySet
    const fullSet = restoreParsedOfficialPrecompiledRegistryArtifact(
      OFFICIAL_REGISTRY_DEFINITIONS,
      parseOfficialRegistryCacheText(
        cacheText,
        committedMetadata as unknown,
        { validationMode: 'full' }
      ).artifact
    )
    const bootstrap = createOfficialContentBootstrap({
      buildRegistrySet: vi.fn(buildOfficialRegistrySetFromStaticData),
      validateStructure: validateOfficialRegistryStructure,
      validateSemantics: validateRegistrySemantics,
      freezeRegistrySet: registrySet => registrySet.freezeEntries(),
      diskCache: {
        isAvailable: () => true,
        load: async () => cacheText,
        restore: value => restoreParsedOfficialPrecompiledRegistryArtifact(
          OFFICIAL_REGISTRY_DEFINITIONS,
          parseOfficialRegistryCacheText(
            value as string,
            committedMetadata as unknown,
            { validationMode: 'full' }
          ).artifact
        )
      }
    })

    await bootstrap.bootstrap()

    expect(bootstrap.getLastReport()).toMatchObject({
      source: 'disk-cache',
      loadPath: 'disk-cache-full-verified-hit',
      diskCacheStatus: 'disk-cache-full-verified-hit'
    })
    expect(summarizeRepresentativeBehavior(fastSet))
      .toEqual(summarizeRepresentativeBehavior(fullSet))
    expect(fastSet.registryIds()).toHaveLength(54)
    expect(fastSet.registryIds().reduce(
      (total, registryId) => total + fastSet.get(registryId).entries().length,
      0
    )).toBe(4242)
  }, 30_000)

  it('measures invalid-cache fallback to the bundled official artifact', async () => {
    const buildRegistrySet = vi.fn(buildOfficialRegistrySetFromStaticData)
    const bootstrap = createOfficialContentBootstrap({
      buildRegistrySet,
      validateStructure: validateOfficialRegistryStructure,
      validateSemantics: validateRegistrySemantics,
      freezeRegistrySet: registrySet => registrySet.freezeEntries(),
      diskCache: {
        isAvailable: () => true,
        load: async () => 'not-json',
        restore: value => restoreParsedOfficialPrecompiledRegistryArtifact(
          OFFICIAL_REGISTRY_DEFINITIONS,
          parseOfficialRegistryCacheText(value as string, committedMetadata as unknown).artifact
        )
      },
      precompiled: {
        load: async () => committedArtifact,
        restore: value => restoreOfficialPrecompiledRegistryArtifact(
          OFFICIAL_REGISTRY_DEFINITIONS,
          value,
          committedMetadata.environmentHash as Sha256Hash
        )
      }
    })

    const startedAt = performance.now()
    const restored = await bootstrap.bootstrap()
    const durationMs = performance.now() - startedAt
    expect(buildRegistrySet).not.toHaveBeenCalled()
    expect(restored.registryIds()).toHaveLength(54)
    expect(bootstrap.getLastReport()).toMatchObject({
      source: 'precompiled',
      loadPath: 'disk-cache-invalid-fallback',
      diskCacheStatus: 'cache-invalid-json',
      precompiledStatus: 'official-precompiled-hit'
    })
    expect(durationMs).toBeLessThan(10_000)
    console.info(`official registry invalid-cache fallback: ${durationMs.toFixed(2)}ms`)
  }, 30_000)

  it('measures complete static fallback without reducing official content', async () => {
    const buildRegistrySet = vi.fn(buildOfficialRegistrySetFromStaticData)
    const bootstrap = createOfficialContentBootstrap({
      buildRegistrySet,
      validateStructure: validateOfficialRegistryStructure,
      validateSemantics: validateRegistrySemantics,
      freezeRegistrySet: registrySet => registrySet.freezeEntries(),
      diskCache: {
        isAvailable: () => true,
        load: async () => 'not-json',
        restore: value => restoreParsedOfficialPrecompiledRegistryArtifact(
          OFFICIAL_REGISTRY_DEFINITIONS,
          parseOfficialRegistryCacheText(value as string, committedMetadata as unknown).artifact
        )
      },
      precompiled: {
        load: async () => null,
        restore: () => { throw new Error('missing bundled artifact must not restore') }
      }
    })

    const startedAt = performance.now()
    const restored = await bootstrap.bootstrap()
    const durationMs = performance.now() - startedAt
    const entryCount = restored.registryIds().reduce(
      (total, registryId) => total + restored.get(registryId).entries().length,
      0
    )
    expect(buildRegistrySet).toHaveBeenCalledOnce()
    expect(restored.registryIds()).toHaveLength(54)
    expect(entryCount).toBe(4242)
    expect(bootstrap.getLastReport()).toMatchObject({
      source: 'static',
      loadPath: 'static-fallback',
      diskCacheStatus: 'cache-invalid-json',
      precompiledStatus: 'cache-miss-not-found'
    })
    expect(durationMs).toBeLessThan(10_000)
    console.info(`official registry static fallback: ${durationMs.toFixed(2)}ms`)
  }, 30_000)
})
