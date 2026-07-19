import { afterEach, describe, expect, it, vi } from 'vitest'
import { SHOPS, getShopClosedReason, isShopAvailable } from '@/data/shops'
import { getOfficialShopById, getOfficialShopsAsLegacy } from '@/domain/mods/contentAccess'
import * as officialContentBootstrap from '@/domain/mods/officialContentBootstrap'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

describe('shop definition registry consumers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('projects every shop in the exact legacy navigation order and shape', () => {
    expect(getOfficialShopsAsLegacy().map(clone)).toEqual(SHOPS.map(clone))
  })

  it('keeps current-shop lookup and every closure reason unchanged', () => {
    for (const shop of getOfficialShopsAsLegacy()) {
      expect(getOfficialShopById(shop.id)).toEqual(shop)
      expect(isShopAvailable(shop, 3, shop.openHour, 'sunny', 'spring'))
        .toBe(isShopAvailable(SHOPS.find(candidate => candidate.id === shop.id)!, 3, shop.openHour, 'sunny', 'spring'))
      expect(getShopClosedReason(shop, 3, shop.openHour - 1, 'sunny', 'spring'))
        .toBe(getShopClosedReason(SHOPS.find(candidate => candidate.id === shop.id)!, 3, shop.openHour - 1, 'sunny', 'spring'))
    }

    expect(getOfficialShopById('missing_shop')).toBeUndefined()
  })

  it('fails before navigation state can change when the registry is unavailable', () => {
    const unavailable = new Error('official registry unavailable')
    let currentShopId: string | null = null
    vi.spyOn(officialContentBootstrap, 'getOfficialRegistrySet').mockImplementation(() => {
      throw unavailable
    })

    expect(() => {
      const shop = getOfficialShopsAsLegacy()[0]
      currentShopId = shop?.id ?? null
    }).toThrow(unavailable)
    expect(currentShopId).toBeNull()
  })
})
