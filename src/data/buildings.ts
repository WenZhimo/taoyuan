import {
  getOfficialCaveUpgrade,
  getOfficialCaveUpgrades,
  getOfficialCellarUpgrade,
  getOfficialCellarUpgrades,
  getOfficialFarmhouseUpgrade,
  getOfficialFarmhouseUpgrades
} from '@/domain/mods/contentAccess'
import {
  CAVE_UPGRADES as LEGACY_CAVE_UPGRADES,
  CELLAR_UPGRADES as LEGACY_CELLAR_UPGRADES,
  FARMHOUSE_UPGRADES as LEGACY_FARMHOUSE_UPGRADES
} from './buildingUpgradeDefinitions'
export {
  CAVE_UPGRADES,
  CELLAR_UPGRADES,
  FARMHOUSE_UPGRADES
} from './buildingUpgradeDefinitions'
export type {
  BuildingUpgradeMaterial,
  CaveUpgradeDef,
  CellarUpgradeDef,
  FarmhouseUpgradeDef
} from './buildingUpgradeDefinitions'

/** 山洞解锁条件 — 累计收入达到此值 */
export const CAVE_UNLOCK_EARNINGS = 25000

/** 蘑菇洞每天产出概率 */
export const CAVE_MUSHROOM_DAILY_CHANCE = 0.6

/** 蝙蝠洞每天产出概率 */
export const CAVE_FRUIT_BAT_DAILY_CHANCE = 0.5

/** 山洞品质随时间提升阈值（天数） */
export const CAVE_QUALITY_THRESHOLDS = [
  { days: 0, quality: 'normal' as const },
  { days: 56, quality: 'fine' as const },
  { days: 112, quality: 'excellent' as const },
  { days: 224, quality: 'supreme' as const }
]

/** 根据等级获取山洞升级定义 */
export const getCaveUpgrade = (level: number) => {
  return getOfficialCaveUpgrade(level) ?? LEGACY_CAVE_UPGRADES.find(u => u.level === level)
}

export const getCaveUpgrades = () => getOfficialCaveUpgrades() ?? LEGACY_CAVE_UPGRADES

/** 根据天数获取山洞品质 */
export const getCaveQuality = (daysActive: number): 'normal' | 'fine' | 'excellent' | 'supreme' => {
  let result: 'normal' | 'fine' | 'excellent' | 'supreme' = 'normal'
  for (const t of CAVE_QUALITY_THRESHOLDS) {
    if (daysActive >= t.days) result = t.quality
  }
  return result
}

/** 仓库解锁材料需求 */
export const WAREHOUSE_UNLOCK_MATERIALS = [
  { itemId: 'wood', quantity: 300 },
  { itemId: 'iron_ore', quantity: 20 }
]

/** 温室解锁价格 */
export const GREENHOUSE_UNLOCK_COST = 35000

/** 温室材料需求 */
export const GREENHOUSE_MATERIAL_COST = [
  { itemId: 'wood', quantity: 200 },
  { itemId: 'iron_ore', quantity: 30 },
  { itemId: 'gold_ore', quantity: 10 }
]

/** 温室地块数 */
export const GREENHOUSE_PLOT_COUNT = 1000 * 100

/** 温室升级定义 */
export interface GreenhouseUpgradeDef {
  level: number
  name: string
  plotCount: number
  gridCols: number
  cost: number
  materialCost: { itemId: string; quantity: number }[]
  description: string
}

export const GREENHOUSE_UPGRADES: GreenhouseUpgradeDef[] = []

/** 酒窖增值周期天数 */
export const CELLAR_VALUE_CYCLE_DAYS = 7

export const getCellarUpgrade = (level: number) =>
  getOfficialCellarUpgrade(level) ?? LEGACY_CELLAR_UPGRADES.find(u => u.level === level)

export const getCellarUpgrades = () => getOfficialCellarUpgrades() ?? LEGACY_CELLAR_UPGRADES

export const getFarmhouseUpgrade = (level: number) => {
  return getOfficialFarmhouseUpgrade(level) ?? LEGACY_FARMHOUSE_UPGRADES.find(u => u.level === level)
}

export const getFarmhouseUpgrades = () => getOfficialFarmhouseUpgrades() ?? LEGACY_FARMHOUSE_UPGRADES
