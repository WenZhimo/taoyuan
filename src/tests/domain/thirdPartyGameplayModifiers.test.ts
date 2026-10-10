import { afterEach, describe, expect, it } from 'vitest'
import type { PackageManifest } from '@/domain/mods/schemas'
import {
  getConfiguredStartingMoney,
  getMonsterHealthBarColor,
  getStartingItems,
  getUnlockedRecipeIds,
  isUnlimitedMoneyActive,
  mergeThirdPartyGameplayModifiers,
  publishThirdPartyGameplayModifiers,
  resetThirdPartyGameplayModifiersForTests
} from '@/domain/mods/thirdPartyGameplayModifiers'

const createManifest = (
  id: string,
  gameplayModifiers: PackageManifest['gameplayModifiers']
): PackageManifest => ({
  id,
  name: { key: `${id}.name`, fallback: id },
  version: '1.0.0',
  gameVersion: '2.4.0',
  engineApiVersion: '1',
  contentSchemaVersion: '1',
  defaultLocale: 'zh-CN',
  locales: { 'zh-CN': 'locales/zh-CN.json' },
  authors: [{ name: 'test' }],
  license: 'MIT',
  gameplayModifiers,
  entrypoints: {}
})

afterEach(() => {
  resetThirdPartyGameplayModifiersForTests()
})

describe('third-party gameplay modifiers', () => {
  it('merges manifests in load order and normalizes content ids for legacy stores', () => {
    const merged = mergeThirdPartyGameplayModifiers([
      createManifest('first_pack', {
        unlimitedMoney: true,
        startingMoney: 1000,
        startingItems: [{ itemId: 'first_pack:seed_a', quantity: 2 }],
        unlockedRecipeIds: ['first_pack:recipe_a']
      }),
      createManifest('second_pack', {
        startingMoney: 2000,
        startingItems: [{ itemId: 'second_pack:seed_b', quantity: 3 }],
        unlockedRecipeIds: ['first_pack:recipe_a', 'second_pack:recipe_b'],
        monsterHealthBarColor: '#f97316'
      })
    ])

    expect(merged).toMatchObject({
      unlimitedMoney: true,
      startingMoney: 2000,
      startingItems: [
        { itemId: 'seed_a', quantity: 2 },
        { itemId: 'seed_b', quantity: 3 }
      ],
      unlockedRecipeIds: ['recipe_a', 'recipe_b'],
      monsterHealthBarColor: '#f97316'
    })
    expect(Object.isFrozen(merged)).toBe(true)
    expect(Object.isFrozen(merged.startingItems)).toBe(true)
  })

  it('selects a deterministic random starting item without mutating the published snapshot', () => {
    publishThirdPartyGameplayModifiers([
      createManifest('test_pack', {
        unlimitedMoney: true,
        randomStartingItems: {
          options: [
            { itemId: 'test_pack:seed_a', quantity: 1 },
            { itemId: 'test_pack:seed_b', quantity: 4 }
          ],
          picks: 1
        }
      })
    ])

    expect(getStartingItems(() => 0)).toEqual([{ itemId: 'seed_b', quantity: 4 }])
    expect(getStartingItems(() => 0.99)).toEqual([{ itemId: 'seed_a', quantity: 1 }])
    expect(isUnlimitedMoneyActive()).toBe(true)
    expect(getConfiguredStartingMoney()).toBe(Number.MAX_SAFE_INTEGER)
    expect(getMonsterHealthBarColor()).toBeUndefined()
    expect(getUnlockedRecipeIds()).toEqual([])
  })
})
