import type { PondLevel, PondableFishDef } from '@/types/fishPond'
import {
  getOfficialPondableFishById,
  getOfficialPondableFishDefsAsLegacy
} from '@/domain/mods/contentAccess'
import { PONDABLE_FISH as LEGACY_PONDABLE_FISH } from './fishPondDefinitions'

export { PONDABLE_FISH } from './fishPondDefinitions'

// === 建造/升级费用 ===

export const POND_BUILD_COST = {
  money: 5000,
  materials: [
    { itemId: 'wood', quantity: 100 },
    { itemId: 'bamboo', quantity: 50 }
  ]
}

export const POND_UPGRADE_COSTS: Record<2 | 3, { money: number; materials: { itemId: string; quantity: number }[] }> = {
  2: {
    money: 10000,
    materials: [
      { itemId: 'wood', quantity: 100 },
      { itemId: 'iron_bar', quantity: 5 }
    ]
  },
  3: {
    money: 25000,
    materials: [
      { itemId: 'wood', quantity: 200 },
      { itemId: 'gold_bar', quantity: 5 },
      { itemId: 'iron_bar', quantity: 10 }
    ]
  }
}

// === 容量 ===

export const POND_CAPACITY: Record<PondLevel, number> = {
  1: 5,
  2: 10,
  3: 20
}

// === 水质参数 ===

/** 基础水质衰减/天 */
export const WATER_QUALITY_DECAY_BASE = 2
/** 密度 > 50% 额外衰减 */
export const WATER_QUALITY_DECAY_HALF = 2
/** 密度 > 80% 额外衰减 */
export const WATER_QUALITY_DECAY_CROWDED = 3
/** 未喂食额外衰减 */
export const WATER_QUALITY_DECAY_HUNGRY = 5

/** 水质低于此值开始有生病概率 */
export const DISEASE_THRESHOLD = 30
/** 每日生病基础概率 */
export const DISEASE_CHANCE_BASE = 0.05
/** 连续生病致死天数 */
export const SICK_DEATH_DAYS = 5

/** 喂食恢复水质 */
export const FEED_WATER_RESTORE = 10
/** 水质改良剂恢复水质 */
export const PURIFIER_WATER_RESTORE = 30

/** 繁殖周期（天） */
export const FISH_BREEDING_DAYS = 3

/** 遗传常量 */
export const GENETICS_FLUCTUATION_BASE = 15
export const POND_MUTATION_JUMP_MIN = 15
export const POND_MUTATION_JUMP_MAX = 30

/** 全部可养殖鱼种定义 */
export const getPondableFishDefs = (): PondableFishDef[] =>
  [...getOfficialPondableFishDefsAsLegacy()]

/** 根据鱼种ID查找可养殖定义 */
export const getPondableFish = (fishId: string): PondableFishDef | undefined => {
  return getOfficialPondableFishById(fishId) ?? LEGACY_PONDABLE_FISH.find(f => f.fishId === fishId)
}

/** 判断鱼是否可养殖 */
export const isPondableFish = (fishId: string): boolean => {
  return getPondableFish(fishId) !== undefined
}
