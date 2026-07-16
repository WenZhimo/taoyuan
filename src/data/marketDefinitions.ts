export type MarketCategory = 'crop' | 'fish' | 'animal_product' | 'processed' | 'fruit' | 'ore' | 'gem'

export interface MarketSupplyThresholds {
  low: number
  mid: number
  high: number
}

export interface MarketCategoryDefinition {
  id: MarketCategory
  name: string
  seasonCoefficients: readonly [number, number, number, number]
  supplyThresholds: MarketSupplyThresholds
}

export const MARKET_CATEGORY_DEFINITIONS: readonly MarketCategoryDefinition[] = [
  {
    id: 'crop',
    name: '农产品',
    seasonCoefficients: [1.0, 0.9, 0.85, 1.2],
    supplyThresholds: { low: 20, mid: 50, high: 100 }
  },
  {
    id: 'fish',
    name: '鱼类',
    seasonCoefficients: [1.0, 0.9, 1.0, 1.15],
    supplyThresholds: { low: 10, mid: 25, high: 50 }
  },
  {
    id: 'animal_product',
    name: '畜产品',
    seasonCoefficients: [1.0, 0.95, 1.0, 1.1],
    supplyThresholds: { low: 10, mid: 25, high: 50 }
  },
  {
    id: 'processed',
    name: '加工品',
    seasonCoefficients: [0.95, 1.0, 1.1, 1.05],
    supplyThresholds: { low: 5, mid: 15, high: 30 }
  },
  {
    id: 'fruit',
    name: '水果',
    seasonCoefficients: [1.1, 0.85, 0.9, 1.2],
    supplyThresholds: { low: 10, mid: 25, high: 50 }
  },
  {
    id: 'ore',
    name: '矿石',
    seasonCoefficients: [1.0, 1.05, 1.0, 0.9],
    supplyThresholds: { low: 15, mid: 40, high: 80 }
  },
  {
    id: 'gem',
    name: '宝石',
    seasonCoefficients: [1.0, 1.05, 1.0, 0.9],
    supplyThresholds: { low: 3, mid: 8, high: 15 }
  }
]

export const MARKET_CATEGORIES = MARKET_CATEGORY_DEFINITIONS.map(category => category.id) as readonly MarketCategory[]

export const MARKET_CATEGORY_NAMES = Object.fromEntries(
  MARKET_CATEGORY_DEFINITIONS.map(category => [category.id, category.name])
) as Record<MarketCategory, string>

export const SEASON_COEFFICIENTS = Object.fromEntries(
  MARKET_CATEGORY_DEFINITIONS.map(category => [category.id, [...category.seasonCoefficients]])
) as Record<MarketCategory, [number, number, number, number]>

export const SUPPLY_THRESHOLDS = Object.fromEntries(
  MARKET_CATEGORY_DEFINITIONS.map(category => [category.id, { ...category.supplyThresholds }])
) as Record<MarketCategory, MarketSupplyThresholds>
