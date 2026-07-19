import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAchievements, getCommunityBundles } from '@/data/achievements'
import { ITEMS, getItemById } from '@/data/items'
import { getOfficialItemDef, getOfficialItemsAsLegacy } from '@/domain/mods/contentAccess'
import * as officialContentBootstrap from '@/domain/mods/officialContentBootstrap'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useNpcStore } from '@/stores/useNpcStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useShopStore } from '@/stores/useShopStore'
import { useSkillStore } from '@/stores/useSkillStore'
import type { ItemCategory, ItemDef } from '@/types'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const SHIPPABLE_CATEGORIES: ItemCategory[] = [
  'crop',
  'fish',
  'animal_product',
  'processed',
  'fruit',
  'ore',
  'gem',
  'material',
  'misc',
  'food',
  'gift'
]

const countByCategory = (items: readonly ItemDef[]) => {
  const counts = new Map<ItemCategory, number>()
  for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
  return [...counts.entries()]
}

describe('achievement item registry consumers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  it('projects every official item to the exact ordered legacy catalog', () => {
    const officialItems = getOfficialItemsAsLegacy()

    expect(officialItems.map(clone)).toEqual(ITEMS.map(clone))
    expect(officialItems.map(item => item.id)).toEqual(ITEMS.map(item => item.id))
    expect(countByCategory(officialItems)).toEqual(countByCategory(ITEMS))

    for (const item of ITEMS) {
      expect(getOfficialItemDef(item.id)?.name.fallback).toBe(item.name)
      expect(getItemById(item.id)).toEqual(item)
    }
    expect(getOfficialItemDef('missing_item')).toBeUndefined()
    expect(getItemById('missing_item')).toBeUndefined()
  })

  it('keeps full-shipment and perfection catalog denominators unchanged', () => {
    const officialItems = getOfficialItemsAsLegacy()
    const shippableItems = officialItems.filter(item => SHIPPABLE_CATEGORIES.includes(item.category))
    const legacyShippableItems = ITEMS.filter(item => SHIPPABLE_CATEGORIES.includes(item.category))
    expect(shippableItems.map(item => item.id)).toEqual(legacyShippableItems.map(item => item.id))

    const achievementStore = useAchievementStore()
    const shopStore = useShopStore()
    const skillStore = useSkillStore()
    const npcStore = useNpcStore()
    shopStore.shippedItems.push(...shippableItems.map(item => item.id))
    achievementStore.discoveredItems.push(...officialItems.map(item => item.id))

    expect(achievementStore.checkAchievements().map(achievement => achievement.id)).toContain('full_shipment')

    const achievementRate = achievementStore.completedAchievements.length / getAchievements().length
    const bundleRate = achievementStore.completedBundles.length / getCommunityBundles().length
    const skillRate = skillStore.skills.reduce((sum, skill) => sum + skill.level, 0) / skillStore.skills.length / 10
    const friendlyCount = npcStore.npcStates.filter(npc => {
      const level = npcStore.getFriendshipLevel(npc.npcId)
      return level === 'friendly' || level === 'bestFriend'
    }).length
    const friendRate = npcStore.npcStates.length > 0 ? friendlyCount / npcStore.npcStates.length : 0
    const expected = Math.floor((
      achievementRate * 0.25 +
      0.2 +
      bundleRate * 0.15 +
      0.15 +
      skillRate * 0.15 +
      friendRate * 0.1
    ) * 100)

    expect(achievementStore.perfectionPercent).toBe(expected)
  })

  it('fails before achievement state changes when the published registry is unavailable', () => {
    const playerStore = usePlayerStore()
    const inventoryStore = useInventoryStore()
    const shopStore = useShopStore()
    const playerBefore = playerStore.serialize()
    const inventoryBefore = inventoryStore.serialize()
    const shippedBefore = [...shopStore.shippedItems]
    const unavailable = new Error('official registry unavailable')
    vi.spyOn(officialContentBootstrap, 'getOfficialRegistrySet').mockImplementation(() => {
      throw unavailable
    })

    expect(() => getOfficialItemsAsLegacy()).toThrow(unavailable)
    expect(() => useAchievementStore()).toThrow(unavailable)
    expect(playerStore.serialize()).toEqual(playerBefore)
    expect(inventoryStore.serialize()).toEqual(inventoryBefore)
    expect(shopStore.shippedItems).toEqual(shippedBefore)
  })
})
