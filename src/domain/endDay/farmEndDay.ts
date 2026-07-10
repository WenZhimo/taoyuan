import type { Quality, Season } from '@/types'
import type { EndDayChunkOptions } from './types'

export interface FarmPlotDailyResult {
  newInfestations: number
  pestDeaths: number
  newWeeds: number
  weedDeaths: number
}

export interface FarmPlotEndDayInput {
  isRainy: boolean
  scarecrowCount: number
  dailyUpdate: (isRainy: boolean, chunkOptions?: EndDayChunkOptions) => FarmPlotDailyResult
  chunkOptions?: EndDayChunkOptions
}

export interface FarmPlotEndDayResult extends FarmPlotDailyResult {
  logs: string[]
}

export function processFarmPlotEndDay({
  isRainy,
  scarecrowCount,
  dailyUpdate,
  chunkOptions
}: FarmPlotEndDayInput): FarmPlotEndDayResult {
  const dailyResult = dailyUpdate(isRainy, chunkOptions)
  const logs: string[] = []

  if (dailyResult.newInfestations > 0) {
    logs.push(
      `虫害来袭！${dailyResult.newInfestations}块地遭到了虫害侵袭。${scarecrowCount > 0 ? '稻草人降低了虫害风险。' : '放置稻草人可以降低虫害概率。'}`
    )
  }
  if (dailyResult.pestDeaths > 0) {
    logs.push(`${dailyResult.pestDeaths}株作物因虫害持续太久而枯死了！及时除虫可以拯救作物。`)
  }
  if (dailyResult.newWeeds > 0) {
    logs.push(
      `杂草蔓延！${dailyResult.newWeeds}块地长出了杂草。${scarecrowCount > 0 ? '稻草人抑制了杂草蔓延。' : '放置稻草人可以减少杂草。'}`
    )
  }
  if (dailyResult.weedDeaths > 0) {
    logs.push(`${dailyResult.weedDeaths}株作物被杂草覆盖窒息而死！及时除草可以拯救作物。`)
  }

  return {
    ...dailyResult,
    logs
  }
}

export interface FruitTreeProduct {
  fruitId: string
  quality: Quality
}

export interface WildTreeProduct {
  treeId: number
  productId: string
  productName: string
}

export interface FarmTreeEndDayInput {
  season: Season
  dailyFruitTreeUpdate: (season: Season) => { fruits: FruitTreeProduct[] }
  dailyWildTreeUpdate: () => { products: WildTreeProduct[] }
  addItem: (itemId: string, quantity?: number, quality?: Quality) => unknown
}

export interface FarmTreeEndDayResult {
  logs: string[]
  fruitCount: number
  wildTreeProductCount: number
}

export function processFarmTreeEndDay({
  season,
  dailyFruitTreeUpdate,
  dailyWildTreeUpdate,
  addItem
}: FarmTreeEndDayInput): FarmTreeEndDayResult {
  const logs: string[] = []

  const fruitResult = dailyFruitTreeUpdate(season)
  for (const fruit of fruitResult.fruits) {
    addItem(fruit.fruitId, 1, fruit.quality)
  }
  if (fruitResult.fruits.length > 0) {
    logs.push(`果树产出了${fruitResult.fruits.length}个水果。`)
  }

  const wildTreeResult = dailyWildTreeUpdate()
  for (const product of wildTreeResult.products) {
    addItem(product.productId)
  }
  if (wildTreeResult.products.length > 0) {
    logs.push(`采脂器收获了${wildTreeResult.products.map(product => product.productName).join('、')}。`)
  }

  return {
    logs,
    fruitCount: fruitResult.fruits.length,
    wildTreeProductCount: wildTreeResult.products.length
  }
}
