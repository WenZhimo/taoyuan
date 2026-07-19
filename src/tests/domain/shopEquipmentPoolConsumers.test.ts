import { afterEach, describe, expect, it, vi } from 'vitest'
import { CRAFTABLE_HATS, SHOP_HATS } from '@/data/hats'
import { CRAFTABLE_RINGS } from '@/data/rings'
import { CRAFTABLE_SHOES, SHOP_SHOES } from '@/data/shoes'
import { SHOP_WEAPONS } from '@/data/weapons'
import {
  getOfficialCraftableHatsAsLegacy,
  getOfficialCraftableRingsAsLegacy,
  getOfficialCraftableShoesAsLegacy,
  getOfficialShopHatsAsLegacy,
  getOfficialShopOffersForShop,
  getOfficialShopShoesAsLegacy,
  getOfficialShopWeaponsAsLegacy
} from '@/domain/mods/contentAccess'
import * as officialContentBootstrap from '@/domain/mods/officialContentBootstrap'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const localId = (id: string): string => id.slice(id.indexOf(':') + 1)

describe('shop equipment pool registry consumers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('projects all shop and craftable equipment pools in legacy order and shape', () => {
    expect(getOfficialShopWeaponsAsLegacy().map(clone)).toEqual(SHOP_WEAPONS.map(clone))
    expect(getOfficialShopHatsAsLegacy().map(clone)).toEqual(SHOP_HATS.map(clone))
    expect(getOfficialShopShoesAsLegacy().map(clone)).toEqual(SHOP_SHOES.map(clone))
    expect(getOfficialCraftableRingsAsLegacy().map(clone)).toEqual(CRAFTABLE_RINGS.map(clone))
    expect(getOfficialCraftableHatsAsLegacy().map(clone)).toEqual(CRAFTABLE_HATS.map(clone))
    expect(getOfficialCraftableShoesAsLegacy().map(clone)).toEqual(CRAFTABLE_SHOES.map(clone))
  })

  it('keeps equipment pools aligned with every official shop offer', () => {
    expect(getOfficialShopOffersForShop({ shopId: 'biaoju' }).map(offer => localId(offer.itemId)))
      .toEqual(getOfficialShopWeaponsAsLegacy().map(weapon => weapon.id))

    const textileOffers = getOfficialShopOffersForShop({ shopId: 'chouduanzhuang' })
    expect(textileOffers.filter(offer => offer.purchaseKind === 'hat').map(offer => localId(offer.itemId)))
      .toEqual(getOfficialShopHatsAsLegacy().map(hat => hat.id))
    expect(textileOffers.filter(offer => offer.purchaseKind === 'shoe').map(offer => localId(offer.itemId)))
      .toEqual(getOfficialShopShoesAsLegacy().map(shoe => shoe.id))
  })

  it('fails before purchase or crafting side effects when the registry is unavailable', () => {
    const unavailable = new Error('official registry unavailable')
    const sideEffect = vi.fn()
    vi.spyOn(officialContentBootstrap, 'getOfficialRegistrySet').mockImplementation(() => {
      throw unavailable
    })

    expect(() => {
      getOfficialShopWeaponsAsLegacy()
      getOfficialShopHatsAsLegacy()
      getOfficialShopShoesAsLegacy()
      getOfficialCraftableRingsAsLegacy()
      getOfficialCraftableHatsAsLegacy()
      getOfficialCraftableShoesAsLegacy()
      sideEffect()
    }).toThrow(unavailable)
    expect(sideEffect).not.toHaveBeenCalled()
  })
})
