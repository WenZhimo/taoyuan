import { Type } from '@sinclair/typebox'
import { describe, expect, it } from 'vitest'
import {
  MARKET_CATEGORIES,
  MARKET_CATEGORY_DEFINITIONS,
  MARKET_CATEGORY_NAMES,
  SEASON_COEFFICIENTS,
  SUPPLY_THRESHOLDS,
  type MarketCategory
} from '@/data/marketDefinitions'
import {
  getDailyMarketInfo,
  getMarketCategoryName,
  getMarketMultiplier,
  type CategoryMarketInfo,
  type MarketTrend
} from '@/data/market'
import {
  getOfficialMarketCategoriesAsLegacy,
  getOfficialMarketCategoryDef,
  getOfficialMarketCategoryDefs,
  getOfficialMarketCategoryName,
  getOfficialMarketCategoryNamesAsLegacy,
  getOfficialMarketSeasonCoefficients,
  getOfficialMarketSupplyThresholds
} from '@/domain/mods/contentAccess'
import { toOfficialContentId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  MarketCategoryDefSchema,
  type MarketCategoryDef as MarketCategoryContentDef
} from '@/domain/mods/schemas'
import validMarketCategories from '../fixtures/mods/minimal-valid-package/data/market-categories.json'

const expectedContentDef = (category: typeof MARKET_CATEGORY_DEFINITIONS[number]): MarketCategoryContentDef => ({
  id: toOfficialContentId(category.id),
  name: {
    key: `taoyuan.market_category.${category.id}.name`,
    fallback: category.name
  },
  seasonCoefficients: [...category.seasonCoefficients] as [number, number, number, number],
  supplyThresholds: { ...category.supplyThresholds }
})

const seededRandom = (seed: number): (() => number) => {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max)

const lerp = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number => {
  const t = (value - fromMin) / (fromMax - fromMin)
  return toMin + t * (toMax - toMin)
}

const computeLegacySupplyDemand = (category: MarketCategory, recentVolume: number): number => {
  const thresholds = SUPPLY_THRESHOLDS[category]
  if (recentVolume <= 0) return 1.1
  if (recentVolume < thresholds.low) return lerp(recentVolume, 0, thresholds.low, 1.1, 1.0)
  if (recentVolume < thresholds.mid) return lerp(recentVolume, thresholds.low, thresholds.mid, 1.0, 0.9)
  if (recentVolume < thresholds.high) return lerp(recentVolume, thresholds.mid, thresholds.high, 0.9, 0.8)
  return 0.8
}

const toLegacyTrend = (multiplier: number): MarketTrend => {
  if (multiplier >= 1.4) return 'boom'
  if (multiplier > 1.05) return 'rising'
  if (multiplier <= 0.6) return 'crash'
  if (multiplier < 0.95) return 'falling'
  return 'stable'
}

const computeLegacyMultiplier = (
  category: MarketCategory,
  seasonIndex: number,
  rng: () => number,
  recentVolume: number
): number => {
  const season = SEASON_COEFFICIENTS[category][seasonIndex] ?? 1.0
  const supply = computeLegacySupplyDemand(category, recentVolume)
  const random = 0.95 + rng() * 0.1
  return clamp(Math.round(season * supply * random * 100) / 100, 0.5, 2.0)
}

const getLegacyDailyMarketInfo = (
  year: number,
  seasonIndex: number,
  day: number,
  recentShipping: Partial<Record<MarketCategory, number>> = {}
): CategoryMarketInfo[] => {
  const seed = year * 10000 + seasonIndex * 1000 + day * 37 + 7777
  const rng = seededRandom(seed)
  return MARKET_CATEGORIES.map(category => {
    const multiplier = computeLegacyMultiplier(category, seasonIndex, rng, recentShipping[category] ?? 0)
    return {
      category,
      multiplier,
      trend: toLegacyTrend(multiplier)
    }
  })
}

describe('official market category registry pilot', () => {
  it('validates external market category JSON before registration', () => {
    const externalMarketCategories: unknown = validMarketCategories
    const result = validateUnknown(Type.Array(MarketCategoryDefSchema), externalMarketCategories, {
      stage: 'test.market-categories'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid market category shapes and bounds', () => {
    const base = validMarketCategories[0]!
    const invalidMarketCategories: unknown = [
      { ...base, id: 'missing_namespace' },
      { ...base, name: 'plain text' },
      { ...base, seasonCoefficients: [1, 1, 1] },
      { ...base, supplyThresholds: { ...base.supplyThresholds, low: -1 } },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(MarketCategoryDefSchema), invalidMarketCategories, {
      stage: 'test.market-categories.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/name',
        '/2/seasonCoefficients',
        '/3/supplyThresholds/low',
        '/4/extra'
      ]))
    }
  })

  it('registers market categories in legacy order with equivalent fields and names', () => {
    expect(getOfficialMarketCategoryDefs()).toHaveLength(MARKET_CATEGORY_DEFINITIONS.length)
    expect(getOfficialMarketCategoryDefs()).toEqual(MARKET_CATEGORY_DEFINITIONS.map(expectedContentDef))
    expect(getOfficialMarketCategoryDefs().map(category => category.id)).toEqual(
      MARKET_CATEGORY_DEFINITIONS.map(category => toOfficialContentId(category.id))
    )
    expect(getOfficialMarketCategoriesAsLegacy()).toEqual(MARKET_CATEGORIES)
    expect(getOfficialMarketCategoryNamesAsLegacy()).toEqual(MARKET_CATEGORY_NAMES)

    for (const category of MARKET_CATEGORY_DEFINITIONS) {
      expect(getOfficialMarketCategoryDef(category.id)).toEqual(expectedContentDef(category))
      expect(getOfficialMarketCategoryDef(toOfficialContentId(category.id))).toBe(
        getOfficialMarketCategoryDef(category.id)
      )
      expect(getOfficialMarketCategoryName(category.id)).toBe(category.name)
      expect(getMarketCategoryName(category.id)).toBe(category.name)
      expect(getOfficialMarketSeasonCoefficients(category.id)).toEqual([...category.seasonCoefficients])
      expect(getOfficialMarketSupplyThresholds(category.id)).toEqual(category.supplyThresholds)
    }
  })

  it('returns defensive copies for mutable market coefficients and thresholds', () => {
    const category = MARKET_CATEGORY_DEFINITIONS[0]!
    const coefficients = getOfficialMarketSeasonCoefficients(category.id)!
    const thresholds = getOfficialMarketSupplyThresholds(category.id)!

    coefficients[0] = 99
    thresholds.low = 99

    expect(getOfficialMarketSeasonCoefficients(category.id)).toEqual([...category.seasonCoefficients])
    expect(getOfficialMarketSupplyThresholds(category.id)).toEqual(category.supplyThresholds)
  })

  it('keeps daily market info and category multiplier equivalent to the legacy algorithm', () => {
    const cases: Array<{
      year: number
      seasonIndex: number
      day: number
      shipping: Partial<Record<MarketCategory, number>>
    }> = [
      { year: 1, seasonIndex: 0, day: 1, shipping: {} },
      { year: 2, seasonIndex: 1, day: 8, shipping: { crop: 12, fish: 30, processed: 4 } },
      { year: 3, seasonIndex: 2, day: 17, shipping: { crop: 120, fruit: 26, ore: 70 } },
      { year: 4, seasonIndex: 3, day: 26, shipping: { gem: 20, animal_product: 0 } }
    ]

    for (const input of cases) {
      expect(getDailyMarketInfo(input.year, input.seasonIndex, input.day, input.shipping)).toEqual(
        getLegacyDailyMarketInfo(input.year, input.seasonIndex, input.day, input.shipping)
      )

      for (const category of MARKET_CATEGORIES) {
        expect(getMarketMultiplier(
          category,
          input.year,
          input.seasonIndex,
          input.day,
          input.shipping[category]
        )).toBe(getLegacyDailyMarketInfo(
          input.year,
          input.seasonIndex,
          input.day,
          { [category]: input.shipping[category] ?? 0 }
        ).find(info => info.category === category)?.multiplier)
      }
    }
  })

  it('keeps unknown market categories outside the fluctuating market model', () => {
    expect(getOfficialMarketCategoryDef('missing_category')).toBeUndefined()
    expect(getOfficialMarketCategoryName('missing_category')).toBeUndefined()
    expect(getMarketMultiplier('missing_category', 1, 0, 1, 999)).toBe(1.0)
  })
})
