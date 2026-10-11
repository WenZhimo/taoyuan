import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createDiscoveryFileSystemFromContentPackageSource } from '@/domain/mods/contentPackageSource'
import { discoverThirdPartyDataPacks } from '@/domain/mods/thirdPartyDataPackDiscovery'
import {
  createWebFilePickerImportSource,
  readWebFilePickerImportArchiveFiles
} from '@/domain/mods/webFilePickerImportSource'

const packageRoot = path.resolve('test-mods/comprehensive-test-pack')

const readJson = async <T>(relativePath: string): Promise<T> =>
  JSON.parse(await readFile(path.join(packageRoot, relativePath), 'utf8')) as T

const expectedEntrypoints = {
  'taoyuan:tag': 'data/tags.json',
  'taoyuan:item': 'data/items.json',
  'taoyuan:crop': 'data/crops.json',
  'taoyuan:monster': 'data/monsters.json',
  'taoyuan:drop_table': 'data/drop-tables.json',
  'taoyuan:enchantment': 'data/enchantments.json',
  'taoyuan:equipment': 'data/equipment.json',
  'taoyuan:recipe': 'data/recipes.json'
} as const

describe('comprehensive test pack', () => {
  it('is a pure data package without gameplay modifiers', async() => {
    const manifest = await readJson<{
      gameplayModifiers?: unknown
      entrypoints: Record<string, string[]>
    }>('manifest.json')

    expect(manifest.gameplayModifiers).toBeUndefined()
    expect(manifest.entrypoints).toEqual(
      Object.fromEntries(Object.entries(expectedEntrypoints).map(([registryId, file]) => [registryId, [file]]))
    )
  })

  it('ships the intended namespaced data definitions', async() => {
    const expectedIds = [
      'taoyuan_test_suite:seed_radish',
      'taoyuan_test_suite:radish_crop',
      'taoyuan_test_suite:hearty_soup',
      'taoyuan_test_suite:ember_blade',
      'taoyuan_test_suite:ember_edge',
      'taoyuan_test_suite:training_slime',
      'taoyuan_test_suite:training_drop',
      'taoyuan_test_suite:seed'
    ]
    const entries = await Promise.all(Object.values(expectedEntrypoints).map(relativePath =>
      readJson<Array<{ id: string }>>(relativePath)
    ))
    const ids = new Set(entries.flat().map(entry => entry.id))

    for (const id of expectedIds) expect(ids.has(id)).toBe(true)
    expect(entries.flat().every(entry => entry.id.startsWith('taoyuan_test_suite:'))).toBe(true)
  })

  it('round-trips the shipped ZIP through the Web archive import source', async() => {
    const archiveBytes = await readFile(path.resolve('test-mods/comprehensive-test-pack.zip'))
    const archiveBuffer = new ArrayBuffer(archiveBytes.byteLength)
    new Uint8Array(archiveBuffer).set(archiveBytes)
    const files = await readWebFilePickerImportArchiveFiles({
      file: {
        name: 'comprehensive-test-pack.zip',
        size: archiveBytes.byteLength,
        text: async() => {
          throw new Error('ZIP imports must use arrayBuffer')
        },
        arrayBuffer: async() => archiveBuffer
      }
    })
    const source = createDiscoveryFileSystemFromContentPackageSource(
      createWebFilePickerImportSource({ files })
    )
    const report = await discoverThirdPartyDataPacks('web-import', source)

    expect(report.summary.validPackageCount).toBe(1)
    expect(report.summary.issueCount).toBe(0)
    expect(report.candidates[0]?.packageId).toBe('taoyuan_test_suite')
    expect(report.candidates[0]?.contentFiles.map(file => file.registryId).sort()).toEqual(
      Object.keys(expectedEntrypoints).sort()
    )
  })
})
