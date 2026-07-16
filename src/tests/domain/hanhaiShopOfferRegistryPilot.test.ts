import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  HANHAI_FIXED_ITEMS as LEGACY_HANHAI_FIXED_ITEMS,
  HANHAI_ROTATING_POOL as LEGACY_HANHAI_ROTATING_POOL,
  getWeeklyRotatingItems
} from '@/data/hanhai'
import {
  HANHAI_FIXED_ITEMS as LEAF_HANHAI_FIXED_ITEMS,
  HANHAI_ROTATING_POOL as LEAF_HANHAI_ROTATING_POOL
} from '@/data/hanhaiShopDefinitions'
import {
  getOfficialHanhaiFixedShopItems,
  getOfficialHanhaiFixedShopOffers,
  getOfficialHanhaiRotatingPoolAsLegacy,
  getOfficialHanhaiRotatingShopOffers,
  getOfficialHanhaiWeeklyRotatingItems
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import type { ShopOfferDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useGameStore } from '@/stores/useGameStore'
import { useHanhaiStore } from '@/stores/useHanhaiStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { HanhaiShopItemDef } from '@/types'

const expectedShopOffer = (
  item: HanhaiShopItemDef,
  shopId: 'hanhai' | 'hanhai_rotating',
  groupId: 'fixed' | 'rotating',
  groupName: string,
  index: number
): ShopOfferDef => ({
  id: toOfficialContentId(`shop/${shopId}/${groupId}/${item.itemId}/${index}`),
  shopId: toOfficialContentId(shopId),
  itemId: toOfficialContentId(item.itemId),
  name: {
    key: `taoyuan.shop.${shopId}.${item.itemId}.name`,
    fallback: item.name
  },
  description: {
    key: `taoyuan.shop.${shopId}.${item.itemId}.description`,
    fallback: item.description
  },
  groupId,
  groupName: {
    key: `taoyuan.shop.${shopId}.${groupId}.name`,
    fallback: groupName
  },
  price: item.price,
  ...(item.weeklyLimit !== undefined ? { weeklyLimit: item.weeklyLimit } : {}),
  sortOrder: index
})

const legacyWeeklyRotatingItems = (year: number, seasonIndex: number, day: number): HanhaiShopItemDef[] => {
  const weekNumber = Math.ceil(day / 7)
  const seed = year * 10000 + seasonIndex * 100 + weekNumber
  const pool = LEAF_HANHAI_ROTATING_POOL.map(item => ({ ...item }))
  let s = seed
  for (let i = pool.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
  }
  return pool.slice(0, 4)
}

describe('official hanhai shop offer registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps fixed and rotating shop definitions in legacy order with equivalent fields', () => {
    expect(LEGACY_HANHAI_FIXED_ITEMS).toBe(LEAF_HANHAI_FIXED_ITEMS)
    expect(LEGACY_HANHAI_ROTATING_POOL).toBe(LEAF_HANHAI_ROTATING_POOL)

    expect(getOfficialHanhaiFixedShopOffers()).toEqual(
      LEAF_HANHAI_FIXED_ITEMS.map((item, index) => expectedShopOffer(item, 'hanhai', 'fixed', '固定商品', index))
    )
    expect(getOfficialHanhaiRotatingShopOffers()).toEqual(
      LEAF_HANHAI_ROTATING_POOL.map((item, index) => expectedShopOffer(item, 'hanhai_rotating', 'rotating', '轮换商品', index))
    )
    expect(getOfficialHanhaiFixedShopItems()).toEqual(LEAF_HANHAI_FIXED_ITEMS)
    expect(getOfficialHanhaiRotatingPoolAsLegacy()).toEqual(LEAF_HANHAI_ROTATING_POOL)
  })

  it('keeps deterministic weekly rotating stock equivalent to the legacy algorithm', () => {
    const cases = [
      { year: 1, seasonIndex: 0, day: 1 },
      { year: 1, seasonIndex: 2, day: 8 },
      { year: 3, seasonIndex: 1, day: 21 }
    ]

    for (const testCase of cases) {
      const expected = legacyWeeklyRotatingItems(testCase.year, testCase.seasonIndex, testCase.day)
      expect(getOfficialHanhaiWeeklyRotatingItems(testCase.year, testCase.seasonIndex, testCase.day)).toEqual(expected)
      expect(getWeeklyRotatingItems(testCase.year, testCase.seasonIndex, testCase.day)).toEqual(expected)
    }
  })

  it('reports missing Hanhai shop item references in semantic validation', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<ShopOfferDef>(toOfficialRegistryTypeId('shop_offer'))

    registry.register(OFFICIAL_PACKAGE_ID, {
      ...expectedShopOffer(LEAF_HANHAI_FIXED_ITEMS[0]!, 'hanhai', 'fixed', '固定商品', 999),
      id: toOfficialContentId('shop/hanhai/fixed/missing_hanhai_shop_item/999'),
      itemId: toOfficialContentId('missing_hanhai_shop_item'),
      sortOrder: 999
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.code === 'REG-REFERENCE-001'
    )

    expect(diagnostics).toContainEqual(expect.objectContaining({
      registryId: toOfficialRegistryTypeId('item'),
      contentId: toOfficialContentId('missing_hanhai_shop_item'),
      fieldPath: '/itemId'
    }))
  })

  it('routes Hanhai store shop purchase and stock refresh through the registry facade', () => {
    const gameStore = useGameStore()
    const hanhaiStore = useHanhaiStore()
    const playerStore = usePlayerStore()
    const inventoryStore = useInventoryStore()

    gameStore.year = 3
    gameStore.season = 'summer'
    gameStore.day = 21
    hanhaiStore.refreshRotatingStock()
    expect(hanhaiStore.weeklyRotatingStock).toEqual(legacyWeeklyRotatingItems(3, 1, 21))

    playerStore.money = 1000
    expect(hanhaiStore.buyShopItem('hanhai_cactus_seed')).toEqual({
      success: true,
      message: '购买了仙人掌种子。'
    })
    expect(playerStore.money).toBe(500)
    expect(inventoryStore.getItemCount('hanhai_cactus_seed')).toBe(1)
    expect(hanhaiStore.getWeeklyRemaining('hanhai_cactus_seed')).toBe(4)

    hanhaiStore.weeklyPurchases.hanhai_cactus_seed = 5
    expect(hanhaiStore.buyShopItem('hanhai_cactus_seed')).toEqual({
      success: false,
      message: '仙人掌种子本周限购已达上限。'
    })
  })
})
