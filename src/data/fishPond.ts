import type { PondLevel, PondableFishDef } from '@/types/fishPond'
import {
  getOfficialFishPondFacilitiesAsLegacy,
  getOfficialFishPondFacilityById,
  getOfficialPondableFishById,
  getOfficialPondableFishDefsAsLegacy
} from '@/domain/mods/contentAccess'
import { PONDABLE_FISH as LEGACY_PONDABLE_FISH } from './fishPondDefinitions'
import {
  FISH_POND_FACILITY as LEGACY_FISH_POND_FACILITY,
  type FishPondFacilityCost,
  type FishPondFacilityDef
} from './fishPondFacilityDefinitions'

export { PONDABLE_FISH } from './fishPondDefinitions'
export { FISH_POND_FACILITY } from './fishPondFacilityDefinitions'

// === 建造/升级费用 ===

const cloneFacilityCost = (cost: FishPondFacilityCost): FishPondFacilityCost => ({
  money: cost.money,
  materials: cost.materials.map(material => ({ ...material }))
})

const getFishPondFacility = (): FishPondFacilityDef =>
  getOfficialFishPondFacilityById('fish_pond') ?? LEGACY_FISH_POND_FACILITY

export const getFishPondFacilityDefs = (): FishPondFacilityDef[] =>
  [...getOfficialFishPondFacilitiesAsLegacy()]

export const getPondBuildCost = (): FishPondFacilityCost =>
  cloneFacilityCost(getFishPondFacility().buildCost)

export const getPondUpgradeCost = (level: 2 | 3): FishPondFacilityCost | undefined => {
  const upgrade = getFishPondFacility().upgrades.find(candidate => candidate.level === level)
  return upgrade ? cloneFacilityCost(upgrade.cost) : undefined
}

export const getPondCapacity = (level: PondLevel): number =>
  getFishPondFacility().capacities.find(capacity => capacity.level === level)?.capacity
    ?? LEGACY_FISH_POND_FACILITY.capacities.find(capacity => capacity.level === level)!.capacity

export const getPondRuntimeCapacity = (level: PondLevel): number => {
  const facility = getFishPondFacility()
  if (facility.unlimitedAtLevel !== null && level >= facility.unlimitedAtLevel) return Number.POSITIVE_INFINITY
  return getPondCapacity(level)
}

export const POND_BUILD_COST = getPondBuildCost()

export const POND_UPGRADE_COSTS: Record<2 | 3, FishPondFacilityCost> = {
  2: getPondUpgradeCost(2) ?? cloneFacilityCost(LEGACY_FISH_POND_FACILITY.upgrades.find(upgrade => upgrade.level === 2)!.cost),
  3: getPondUpgradeCost(3) ?? cloneFacilityCost(LEGACY_FISH_POND_FACILITY.upgrades.find(upgrade => upgrade.level === 3)!.cost)
}

// === 容量 ===

export const POND_CAPACITY: Record<PondLevel, number> = {
  1: getPondCapacity(1),
  2: getPondCapacity(2),
  3: getPondCapacity(3)
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
