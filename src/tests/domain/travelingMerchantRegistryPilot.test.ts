import { describe, expect, it } from 'vitest'
import { CROPS } from '@/data/crops'
import { getItemById } from '@/data/items'
import {
  TRAVELING_MERCHANT_POOL,
  generateMerchantStock,
  type TravelingMerchantStock
} from '@/data/travelingMerchant'
import {
  getOfficialTravelingMerchantOffers,
  getOfficialTravelingMerchantPoolAsLegacy
} from '@/domain/mods/contentAccess'
import type { Season } from '@/types'

const localId = (id: string): string => id.slice(id.indexOf(':') + 1)

const seededRandom = (seed: number): (() => number) => {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

const generateLegacyMerchantStock = (
  year: number,
  seasonIndex: number,
  day: number,
  currentSeason: Season
): TravelingMerchantStock[] => {
  const seed = year * 10000 + seasonIndex * 1000 + day * 37
  const rng = seededRandom(seed)
  const stock: TravelingMerchantStock[] = []

  const shuffled = [...TRAVELING_MERCHANT_POOL].sort(() => rng() - 0.5)
  const generalCount = 3 + Math.floor(rng() * 2)
  for (let i = 0; i < Math.min(generalCount, shuffled.length); i++) {
    const item = shuffled[i]!
    const priceVariation = 0.85 + rng() * 0.3
    let price = Math.floor(item.basePrice * priceVariation)
    const def = getItemById(item.itemId)
    if (def && def.sellPrice > 0) price = Math.max(price, def.sellPrice * 2)
    stock.push({
      itemId: item.itemId,
      name: item.name,
      price,
      quantity: 1 + Math.floor(rng() * 2)
    })
  }

  const otherSeasonCrops = CROPS.filter(c => !c.season.includes(currentSeason) && c.seedPrice > 0)
  if (otherSeasonCrops.length > 0) {
    const shuffledCrops = [...otherSeasonCrops].sort(() => rng() - 0.5)
    const seedCount = 1 + Math.floor(rng() * 2)
    for (let i = 0; i < Math.min(seedCount, shuffledCrops.length); i++) {
      const crop = shuffledCrops[i]!
      stock.push({
        itemId: crop.seedId,
        name: `${crop.name}种子`,
        price: Math.max(Math.floor(crop.seedPrice * 4), crop.sellPrice * 2),
        quantity: 3 + Math.floor(rng() * 3)
      })
    }
  }

  return stock
}

describe('official traveling merchant shop offer registry pilot', () => {
  it('projects the legacy traveling merchant pool into shop offers without changing order or values', () => {
    expect(getOfficialTravelingMerchantPoolAsLegacy()).toEqual(TRAVELING_MERCHANT_POOL)
    expect(getOfficialTravelingMerchantOffers().map(offer => ({
      itemId: localId(offer.itemId),
      name: offer.name?.fallback,
      price: offer.price,
      groupId: offer.groupId,
      groupName: offer.groupName?.fallback
    }))).toEqual(TRAVELING_MERCHANT_POOL.map(item => ({
      itemId: item.itemId,
      name: item.name,
      price: item.basePrice,
      groupId: 'traveling',
      groupName: '旅行商人'
    })))
  })

  it('keeps deterministic stock generation equivalent to the legacy pool algorithm', () => {
    const cases: Array<{ year: number; seasonIndex: number; day: number; season: Season }> = [
      { year: 1, seasonIndex: 0, day: 5, season: 'spring' },
      { year: 2, seasonIndex: 1, day: 12, season: 'summer' },
      { year: 3, seasonIndex: 2, day: 19, season: 'autumn' },
      { year: 4, seasonIndex: 3, day: 26, season: 'winter' }
    ]

    for (const input of cases) {
      expect(generateMerchantStock(input.year, input.seasonIndex, input.day, input.season))
        .toEqual(generateLegacyMerchantStock(input.year, input.seasonIndex, input.day, input.season))
    }
  })
})
