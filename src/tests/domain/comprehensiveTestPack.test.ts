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

describe('comprehensive test pack', () => {
  it('ships the gameplay modifiers needed for PC smoke tests', async() => {
    const manifest = await readJson<{
      gameplayModifiers: {
        unlimitedMoney: boolean
        randomStartingItems: { options: unknown[]; picks: number }
        startingEquipment: unknown[]
        monsterHealthBarColor: string
      }
    }>('manifest.json')

    expect(manifest.gameplayModifiers.unlimitedMoney).toBe(true)
    expect(manifest.gameplayModifiers.randomStartingItems.options.length).toBeGreaterThanOrEqual(5)
    expect(manifest.gameplayModifiers.randomStartingItems.picks).toBeGreaterThanOrEqual(2)
    expect(manifest.gameplayModifiers.startingEquipment).toHaveLength(3)
    expect(manifest.gameplayModifiers.monsterHealthBarColor).toBe('#f97316')
  })

  it('starts with at least three craftable recipes and matching output items', async() => {
    const manifest = await readJson<{ gameplayModifiers: { unlockedRecipeIds: string[]; startingItems: Array<{ itemId: string; quantity: number }> } }>('manifest.json')
    const recipes = await readJson<Array<{ id: string; ingredients: Array<{ type: string; itemId?: string; quantity: number }>; outputItemId: string }>>('data/recipes.json')
    const items = await readJson<Array<{ id: string }>>('data/items.json')
    const inventory = new Map(manifest.gameplayModifiers.startingItems.map(item => [item.itemId, item.quantity]))
    const itemIds = new Set(items.map(item => item.id))
    const unlocked = new Set(manifest.gameplayModifiers.unlockedRecipeIds)
    const craftable = recipes.filter(recipe => unlocked.has(recipe.id)
      && itemIds.has(recipe.outputItemId)
      && recipe.ingredients.every(ingredient => ingredient.type === 'item'
        && (inventory.get(ingredient.itemId!) ?? 0) >= ingredient.quantity))

    expect(craftable.length).toBeGreaterThanOrEqual(3)
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
  })
})
