import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as gameLog from '@/composables/useGameLog'
import { GUILD_SHOP_ITEMS } from '@/data/guildDefinitions'
import {
  getOfficialGuildShopItemById,
  getOfficialGuildShopItemsAsLegacy,
  getOfficialGuildShopOffers
} from '@/domain/mods/contentAccess'
import * as officialContentBootstrap from '@/domain/mods/officialContentBootstrap'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import type { ShopOfferDef } from '@/domain/mods/schemas'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useGuildStore } from '@/stores/useGuildStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { GuildShopItemDef } from '@/types'

const normalizeGuildItem = (item: GuildShopItemDef): GuildShopItemDef => ({
  ...item,
  ...(item.materials ? { materials: item.materials.map(material => ({ ...material })) } : {})
})

const localId = (id: string): string => id.slice(id.indexOf(':') + 1)

describe('guild shop offer consumers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
    vi.spyOn(gameLog, 'addLog').mockImplementation(() => {})
  })

  it('keeps every guild offer field, order, group and legacy lookup equivalent', () => {
    const offers = getOfficialGuildShopOffers()

    expect(offers.map((offer, index) => ({
      itemId: localId(offer.itemId),
      name: offer.name?.fallback,
      description: offer.description?.fallback,
      price: offer.price,
      contributionCost: offer.contributionCost,
      unlockGuildLevel: offer.unlockGuildLevel,
      dailyLimit: offer.dailyLimit,
      weeklyLimit: offer.weeklyLimit,
      totalLimit: offer.totalLimit,
      purchaseKind: offer.purchaseKind,
      materials: offer.materials?.map(material => ({
        itemId: localId(material.itemId),
        quantity: material.quantity
      })),
      groupId: offer.groupId,
      groupName: offer.groupName?.fallback,
      sortOrder: offer.sortOrder,
      index
    }))).toEqual(GUILD_SHOP_ITEMS.map((item, index) => ({
      itemId: item.itemId,
      name: item.name,
      description: item.description,
      price: item.price,
      contributionCost: item.contributionCost,
      unlockGuildLevel: item.unlockGuildLevel,
      dailyLimit: item.dailyLimit,
      weeklyLimit: item.weeklyLimit,
      totalLimit: item.totalLimit,
      purchaseKind: item.equipType,
      materials: item.materials,
      groupId: 'guild',
      groupName: '行会商品',
      sortOrder: index,
      index
    })))
    expect(getOfficialGuildShopItemsAsLegacy().map(normalizeGuildItem)).toEqual(
      GUILD_SHOP_ITEMS.map(normalizeGuildItem)
    )
    for (const item of GUILD_SHOP_ITEMS) {
      expect(getOfficialGuildShopItemById(item.itemId)).toEqual(normalizeGuildItem(item))
      expect(getOfficialGuildShopItemById(toOfficialContentId(item.itemId))).toEqual(normalizeGuildItem(item))
    }
    expect(getOfficialGuildShopItemById('missing_guild_item')).toBeUndefined()
    expect(getOfficialGuildShopItemById('not namespaced')).toBeUndefined()
  })

  it('preserves unlocks, money purchases, repeated batch purchases and purchase limits', () => {
    const guildStore = useGuildStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    playerStore.money = 1000

    for (const item of GUILD_SHOP_ITEMS) {
      expect(guildStore.isShopItemUnlocked(item.itemId)).toBe(item.unlockGuildLevel === undefined)
    }
    guildStore.guildLevel = 10
    for (const item of GUILD_SHOP_ITEMS) {
      expect(guildStore.isShopItemUnlocked(item.itemId)).toBe(true)
    }
    guildStore.guildLevel = 0

    expect(guildStore.buyShopItem('missing_guild_item')).toBe(false)
    expect(guildStore.buyShopItem('adventurer_ration')).toBe(false)
    expect(playerStore.money).toBe(1000)

    expect(Array.from({ length: 2 }, () => guildStore.buyShopItem('combat_tonic'))).toEqual([true, true])
    expect(playerStore.money).toBe(600)
    expect(inventoryStore.getItemCount('combat_tonic')).toBe(2)
    expect(guildStore.buyShopItem('fortify_brew')).toBe(true)
    expect(guildStore.buyShopItem('fortify_brew')).toBe(false)
    expect(playerStore.money).toBe(100)

    guildStore.guildLevel = 10
    playerStore.money = 20000
    expect(Array.from({ length: 3 }, () => guildStore.buyShopItem('attack_potion'))).toEqual([true, true, false])
    expect(inventoryStore.getItemCount('attack_potion')).toBe(2)
    expect(Array.from({ length: 2 }, () => guildStore.buyShopItem('nuclear_bomb'))).toEqual([true, false])
    expect(inventoryStore.getItemCount('nuclear_bomb')).toBe(1)
  })

  it('preserves contribution, materials, equipment grants, total limits and rollback', () => {
    const guildStore = useGuildStore()
    const inventoryStore = useInventoryStore()
    guildStore.guildLevel = 10
    guildStore.contributionPoints = 1000
    inventoryStore.addItem('gold_bar', 10)
    inventoryStore.addItem('ruby', 4)

    vi.spyOn(inventoryStore, 'addRing').mockReturnValueOnce(false)
    expect(guildStore.buyShopItem('guild_war_ring')).toBe(false)
    expect(guildStore.contributionPoints).toBe(1000)
    expect(inventoryStore.getItemCount('gold_bar')).toBe(10)
    expect(inventoryStore.getItemCount('ruby')).toBe(4)

    expect(guildStore.buyShopItem('guild_war_ring')).toBe(true)
    expect(guildStore.contributionPoints).toBe(800)
    expect(inventoryStore.getItemCount('gold_bar')).toBe(5)
    expect(inventoryStore.getItemCount('ruby')).toBe(2)
    expect(inventoryStore.ownedRings.some(ring => ring.defId === 'guild_war_ring')).toBe(true)

    const beforeSecondPurchase = guildStore.serialize()
    expect(guildStore.buyShopItem('guild_war_ring')).toBe(false)
    expect(guildStore.serialize()).toEqual(beforeSecondPurchase)
    expect(guildStore.buyShopItem('guild_war_helm')).toBe(false)
    expect(guildStore.contributionPoints).toBe(800)
  })

  it('reports missing guild material references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<ShopOfferDef>(toOfficialRegistryTypeId('shop_offer'))
    const missingMaterial = toOfficialContentId('missing_guild_material')
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('shop/guild/test/material_reference'),
      shopId: toOfficialContentId('guild'),
      itemId: toOfficialContentId('combat_tonic'),
      price: 1,
      materials: [{ itemId: missingMaterial, quantity: 1 }]
    })

    expect(validateRegistrySemantics(registrySet)).toContainEqual(expect.objectContaining({
      code: 'REG-REFERENCE-001',
      registryId: toOfficialRegistryTypeId('item'),
      contentId: missingMaterial,
      fieldPath: '/materials/0/itemId'
    }))
  })

  it('fails before side effects when the published registry is unavailable', () => {
    const guildStore = useGuildStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    guildStore.guildLevel = 10
    guildStore.contributionPoints = 500
    playerStore.money = 500
    const serializedBefore = guildStore.serialize()
    const unavailable = new Error('official registry unavailable')
    vi.spyOn(officialContentBootstrap, 'getOfficialRegistrySet').mockImplementation(() => {
      throw unavailable
    })

    expect(() => getOfficialGuildShopItemsAsLegacy()).toThrow(unavailable)
    expect(() => guildStore.buyShopItem('combat_tonic')).toThrow(unavailable)
    expect(guildStore.serialize()).toEqual(serializedBefore)
    expect(playerStore.money).toBe(500)
    expect(inventoryStore.getItemCount('combat_tonic')).toBe(0)
  })
})
