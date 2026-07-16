import type { SeedGenetics, HybridDef, SeedStarRating } from '@/types/breeding'
import type { Quality } from '@/types'
import {
  findOfficialBreedingHybridByParents,
  getOfficialBreedingHybridById,
  getOfficialBreedingHybridDefsAsLegacy,
  getOfficialBreedingHybridTier
} from '@/domain/mods/contentAccess'
import { getCropById } from './crops'

// === 常量 ===

/** 种子箱基础容量 */
export const BASE_BREEDING_BOX = 30

/** 种子箱升级定义 */
export const SEED_BOX_UPGRADES = [
  {
    level: 1,
    cost: 5000,
    materials: [
      { itemId: 'wood', quantity: 50 },
      { itemId: 'copper_bar', quantity: 5 }
    ]
  },
  {
    level: 2,
    cost: 15000,
    materials: [
      { itemId: 'iron_bar', quantity: 8 },
      { itemId: 'pine_resin', quantity: 10 }
    ]
  },
  {
    level: 3,
    cost: 30000,
    materials: [
      { itemId: 'gold_bar', quantity: 5 },
      { itemId: 'cloth', quantity: 3 },
      { itemId: 'wood', quantity: 100 }
    ]
  },
  {
    level: 4,
    cost: 50000,
    materials: [
      { itemId: 'gold_bar', quantity: 10 },
      { itemId: 'silk_cloth', quantity: 5 },
      { itemId: 'battery', quantity: 3 }
    ]
  },
  {
    level: 5,
    cost: 80000,
    materials: [
      { itemId: 'iridium_bar', quantity: 5 },
      { itemId: 'dream_silk', quantity: 3 },
      { itemId: 'moon_herb', quantity: 5 }
    ]
  }
]

/** 每级种子箱容量增量 */
export const SEED_BOX_UPGRADE_INCREMENT = 15

/** 育种加工天数 */
export const BREEDING_DAYS = 2

/** 属性上限 */
export const STAT_CAP = 100

/** 基础波动幅度 */
export const BASE_MUTATION_MAGNITUDE = 8

/** 每代稳定度增长 */
export const GENERATIONAL_STABILITY_GAIN = 3

/** 稳定度上限 */
export const MAX_STABILITY = 95

/** 变异时属性跳动范围 */
export const MUTATION_JUMP_MIN = 15
export const MUTATION_JUMP_MAX = 30

/** 变异时变异率自身浮动 */
export const MUTATION_RATE_DRIFT = 5

/** 变异正向概率（增加方向） */
export const MUTATION_POSITIVE_CHANCE = 0.6

/** 收获育种作物时按品质返还种子的概率 */
export const SEED_RETURN_CHANCE: Record<Quality, number> = {
  normal: 0.5,
  fine: 0.7,
  excellent: 0.9,
  supreme: 1.0
}

/** 判断收获时是否返还育种种子 */
export const shouldReturnBreedingSeed = (quality: Quality): boolean => {
  return Math.random() < (SEED_RETURN_CHANCE[quality] ?? 0)
}

/** 育种台制造费用 */
export const BREEDING_STATION_COST = {
  money: 100000,
  materials: [
    { itemId: 'wood', quantity: 30 },
    { itemId: 'iron_ore', quantity: 10 },
    { itemId: 'gold_ore', quantity: 3 }
  ]
}

/** 育种台最大数量 */
export const MAX_BREEDING_STATIONS = 10

// === 辅助函数 ===

let _nextGeneticsId = 1

/** 生成唯一基因ID */
export const generateGeneticsId = (): string => {
  return `gen_${Date.now()}_${_nextGeneticsId++}`
}

/** 限制属性值在 0-100 */
export const clampStat = (value: number): number => {
  return Math.max(0, Math.min(STAT_CAP, Math.round(value)))
}

/** 限制变异率在 1-50 */
export const clampMutationRate = (value: number): number => {
  return Math.max(1, Math.min(50, Math.round(value)))
}

/** 根据作物ID计算默认基因属性 */
export const getDefaultGenetics = (cropId: string): Omit<SeedGenetics, 'id'> => {
  const crop = getCropById(cropId)
  if (!crop) {
    return {
      cropId,
      generation: 0,
      sweetness: 20,
      yield: 20,
      resistance: 20,
      stability: 50,
      mutationRate: 10,
      parentA: null,
      parentB: null,
      parentCropA: null,
      parentCropB: null,
      isHybrid: false,
      hybridId: null
    }
  }

  // 贵/慢的作物属性更高
  const priceScore = Math.min(crop.sellPrice / 350, 1) // 350 = 雪莲售价
  const growthScore = Math.min(crop.growthDays / 12, 1) // 12 = 雪莲生长天数

  const baseSweetness = clampStat(15 + Math.round(priceScore * 40))
  const baseYield = clampStat(15 + Math.round(growthScore * 35))
  const baseResistance = clampStat(10 + Math.round((priceScore + growthScore) * 15))

  return {
    cropId,
    generation: 0,
    sweetness: baseSweetness,
    yield: baseYield,
    resistance: baseResistance,
    stability: 50,
    mutationRate: 10,
    parentA: null,
    parentB: null,
    parentCropA: null,
    parentCropB: null,
    isHybrid: false,
    hybridId: null
  }
}

/** 计算总属性 */
export const getTotalStats = (g: SeedGenetics): number => {
  return g.sweetness + g.yield + g.resistance
}

/** 获取星级评分 */
export const getStarRating = (g: SeedGenetics): SeedStarRating => {
  const total = getTotalStats(g)
  if (total >= 250) return 5
  if (total >= 200) return 4
  if (total >= 150) return 3
  if (total >= 100) return 2
  return 1
}

/** 生成种子显示标签 */
export const makeSeedLabel = (g: SeedGenetics): string => {
  const crop = getCropById(g.cropId)
  const name = crop?.name ?? g.cropId
  return `${name} G${g.generation}`
}

// === 杂交配方 ===

export { HYBRID_DEFINITIONS, HYBRID_TIER_COUNTS } from './breedingDefinitions'
export const HYBRID_DEFS: HybridDef[] = [...getOfficialBreedingHybridDefsAsLegacy()]

/** 杂交品种阶层 (tier) 划分：基于 HYBRID_DEFS 数组顺序 */
/** 获取杂交品种所属阶层 (1-10) */
export const getHybridTier = (hybridId: string): number => getOfficialBreedingHybridTier(hybridId)

/** 查找可能的杂交配方 */
export const findPossibleHybrid = (cropIdA: string, cropIdB: string): HybridDef | null => {
  return findOfficialBreedingHybridByParents(cropIdA, cropIdB) ?? null
}

/** 根据杂交种ID查找配方 */
export const findPossibleHybridById = (hybridId: string): HybridDef | null => {
  return getOfficialBreedingHybridById(hybridId) ?? null
}

/** 种子制造机产出育种种子的概率 */
export const getSeedMakerGeneticChance = (farmingLevel: number): number => {
  return 0.3 + farmingLevel * 0.03
}
