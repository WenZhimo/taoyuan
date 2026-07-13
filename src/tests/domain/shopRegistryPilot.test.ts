import { describe, expect, it } from 'vitest'
import { SHOPS, getShopById, getShopClosedReason, isShopAvailable } from '@/data/shops'
import {
  getOfficialShopById,
  getOfficialShopDef,
  getOfficialShopDefs
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { createSerializableRegistrySnapshot } from '@/domain/mods/registry'
import type { ShopDef, ShopOfferDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_PACKAGE_ID,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import type { ShopDef as LegacyShopDef } from '@/data/shops'

const localId = (id: string): string => id.slice(id.indexOf(':') + 1)

const normalizeOfficialShop = (shop: Readonly<ShopDef>) => ({
  id: localId(shop.id),
  name: shop.name.fallback,
  description: shop.description.fallback,
  npcName: shop.npcName.fallback,
  closedDays: [...shop.closedDays],
  openHour: shop.openHour,
  closeHour: shop.closeHour,
  closedWeathers: [...shop.closedWeathers],
  closedSeasons: [...shop.closedSeasons]
})

const normalizeLegacyShop = (shop: LegacyShopDef) => ({
  ...shop,
  closedDays: [...shop.closedDays],
  closedWeathers: [...shop.closedWeathers],
  closedSeasons: [...shop.closedSeasons]
})

describe('official shop registry pilot', () => {
  it('keeps official shop registry fields equivalent to the legacy shop table', () => {
    const officialShops = getOfficialShopDefs()
      .map(normalizeOfficialShop)
      .sort((a, b) => a.id.localeCompare(b.id))
    const legacyShops = SHOPS.map(normalizeLegacyShop).sort((a, b) => a.id.localeCompare(b.id))

    expect(officialShops).toEqual(legacyShops)
  })

  it('keeps legacy shop query shape and schedule helpers unchanged', () => {
    for (const shop of SHOPS) {
      const officialShop = getOfficialShopById(shop.id)
      expect(officialShop, shop.id).toEqual(getShopById(shop.id))
      expect(getOfficialShopById(toOfficialContentId(shop.id)), shop.id).toEqual(shop)

      expect(isShopAvailable(officialShop!, 3, shop.openHour, 'sunny', 'spring'))
        .toBe(isShopAvailable(shop, 3, shop.openHour, 'sunny', 'spring'))
      expect(getShopClosedReason(officialShop!, 3, shop.openHour - 1, 'sunny', 'spring'))
        .toBe(getShopClosedReason(shop, 3, shop.openHour - 1, 'sunny', 'spring'))
    }

    expect(getOfficialShopById('missing_shop')).toBeUndefined()
    expect(getOfficialShopDef('not a valid id')).toBeUndefined()
  })

  it('includes shops in the official snapshot and still reports invalid shop product item references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const shopRegistry = registrySet.get<ShopDef>(toOfficialRegistryTypeId('shop'))
    const shopOfferRegistry = registrySet.get<ShopOfferDef>(toOfficialRegistryTypeId('shop_offer'))

    expect(shopRegistry.values().map(shop => localId(shop.id)).sort()).toEqual(SHOPS.map(shop => shop.id).sort())

    shopOfferRegistry.register(
      OFFICIAL_PACKAGE_ID,
      {
        id: toOfficialContentId('shop/wanwupu/missing_product/0'),
        shopId: toOfficialContentId('wanwupu'),
        itemId: toOfficialContentId('missing_product'),
        price: 1
      },
      { file: 'src/tests/domain/shopRegistryPilot.test.ts' }
    )

    const diagnostics = validateRegistrySemantics(registrySet)
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_product'),
        fieldPath: '/itemId'
      })
    )

    expect(createSerializableRegistrySnapshot(buildOfficialRegistrySetFromStaticData()).registries)
      .toEqual(expect.arrayContaining([expect.objectContaining({ registryId: toOfficialRegistryTypeId('shop') })]))
  })
})
