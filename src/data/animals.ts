import type { AnimalBuildingDef, AnimalDef, AnimalBuildingType, AnimalType } from '@/types'
import {
  getOfficialAnimalByType,
  getOfficialAnimalDefsByBuilding
} from '@/domain/mods/contentAccess'
import { ANIMAL_DEFS as LEGACY_ANIMAL_DEFS } from './animalDefinitions'

export {
  ANIMAL_DEFS,
  HAY_ITEM_ID,
  HAY_PRICE,
  NOURISHING_FEED_ID,
  PREMIUM_FEED_ID,
  VITALITY_FEED_ID
} from './animalDefinitions'

/** 畜舍定义 */
export const ANIMAL_BUILDINGS: AnimalBuildingDef[] = [
  {
    type: 'coop',
    name: '鸡舍',
    description: '饲养鸡鸭等小型家禽。',
    capacity: 4,
    cost: 4000,
    materialCost: [
      { itemId: 'wood', quantity: 100 },
      { itemId: 'bamboo', quantity: 50 }
    ]
  },
  {
    type: 'barn',
    name: '牲口棚',
    description: '饲养牛羊等大型牲畜。',
    capacity: 4,
    cost: 6000,
    materialCost: [
      { itemId: 'wood', quantity: 150 },
      { itemId: 'iron_ore', quantity: 20 }
    ]
  },
  {
    type: 'stable',
    name: '马厩',
    description: '饲养马匹，骑马出行更快。',
    capacity: 1,
    cost: 10000,
    materialCost: [
      { itemId: 'wood', quantity: 200 },
      { itemId: 'iron_ore', quantity: 30 }
    ]
  }
]

/** 所有饲料定义（UI 遍历用） */
export const FEED_DEFS: { id: string; name: string; price: number; description: string }[] = [
  { id: 'hay', name: '干草', price: 50, description: '基础饲料' },
  { id: 'premium_feed', name: '精饲料', price: 200, description: '心情+60，好感度翻倍' },
  { id: 'nourishing_feed', name: '滋补饲料', price: 250, description: '产出天数-1' },
  { id: 'vitality_feed', name: '活力饲料', price: 300, description: '100%治愈疾病' }
]

export const getAnimalDef = (type: string): AnimalDef | undefined => {
  return getOfficialAnimalByType(type) ?? LEGACY_ANIMAL_DEFS.find(d => d.type === type)
}

export const getAnimalDefsByBuilding = (type: AnimalBuildingType): AnimalDef[] =>
  [...getOfficialAnimalDefsByBuilding(type)]

export const getBuildingDef = (type: string): AnimalBuildingDef | undefined => {
  return ANIMAL_BUILDINGS.find(b => b.type === type)
}

/** 畜舍升级定义: level 2 = 大型 (容量8), level 3 = 豪华 (容量12) */
export const BUILDING_UPGRADES: {
  type: AnimalBuildingType
  level: number
  name: string
  capacity: number
  cost: number
  materialCost: { itemId: string; quantity: number }[]
}[] = [
  {
    type: 'coop',
    level: 2,
    name: '大型鸡舍',
    capacity: 8,
    cost: 10000,
    materialCost: [
      { itemId: 'wood', quantity: 200 },
      { itemId: 'iron_ore', quantity: 15 }
    ]
  },
  {
    type: 'coop',
    level: 3,
    name: '豪华鸡舍',
    capacity: 12,
    cost: 20000,
    materialCost: [
      { itemId: 'wood', quantity: 300 },
      { itemId: 'gold_ore', quantity: 10 }
    ]
  },
  {
    type: 'barn',
    level: 2,
    name: '大型牲口棚',
    capacity: 8,
    cost: 12000,
    materialCost: [
      { itemId: 'wood', quantity: 250 },
      { itemId: 'iron_ore', quantity: 25 }
    ]
  },
  {
    type: 'barn',
    level: 3,
    name: '豪华牲口棚',
    capacity: 12,
    cost: 25000,
    materialCost: [
      { itemId: 'wood', quantity: 400 },
      { itemId: 'gold_ore', quantity: 15 }
    ]
  }
]

export const getBuildingUpgrade = (type: AnimalBuildingType, toLevel: number) => {
  return BUILDING_UPGRADES.find(u => u.type === type && u.level === toLevel)
}

/** 孵化映射：蛋 → 动物类型 + 孵化天数 + 所属建筑 */
export const INCUBATION_MAP: Record<string, { animalType: AnimalType; days: number; building: AnimalBuildingType }> = {
  egg: { animalType: 'chicken', days: 5, building: 'coop' },
  duck_egg: { animalType: 'duck', days: 7, building: 'coop' },
  goose_egg: { animalType: 'goose', days: 6, building: 'coop' },
  quail_egg: { animalType: 'quail', days: 4, building: 'coop' },
  pigeon_egg: { animalType: 'pigeon', days: 5, building: 'coop' },
  silkie_egg: { animalType: 'silkie', days: 6, building: 'coop' },
  ostrich_egg: { animalType: 'ostrich', days: 10, building: 'barn' }
}
