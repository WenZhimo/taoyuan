import type { AnimalBuildingDef, AnimalDef, AnimalBuildingType, AnimalType } from '@/types'
import {
  getOfficialAnimalByType,
  getOfficialAnimalBuildingByType,
  getOfficialAnimalBuildingDefsAsLegacy,
  getOfficialAnimalBuildingUpgrade,
  getOfficialAnimalDefsByBuilding,
  getOfficialAnimalFeedById,
  getOfficialAnimalFeedDefsAsLegacy
} from '@/domain/mods/contentAccess'
import { ANIMAL_DEFS as LEGACY_ANIMAL_DEFS } from './animalDefinitions'
import { FEED_DEFS as LEGACY_FEED_DEFS } from './animalFeedDefinitions'
import {
  ANIMAL_BUILDINGS as LEGACY_ANIMAL_BUILDINGS,
  BUILDING_UPGRADES as LEGACY_BUILDING_UPGRADES
} from './animalBuildingDefinitions'

export {
  ANIMAL_DEFS,
  HAY_ITEM_ID,
  HAY_PRICE,
  NOURISHING_FEED_ID,
  PREMIUM_FEED_ID,
  VITALITY_FEED_ID
} from './animalDefinitions'
export { FEED_DEFS, type AnimalFeedDef } from './animalFeedDefinitions'
export { ANIMAL_BUILDINGS, BUILDING_UPGRADES, type AnimalBuildingUpgradeDef } from './animalBuildingDefinitions'

export const getAnimalDef = (type: string): AnimalDef | undefined => {
  return getOfficialAnimalByType(type) ?? LEGACY_ANIMAL_DEFS.find(d => d.type === type)
}

export const getAnimalDefsByBuilding = (type: AnimalBuildingType): AnimalDef[] =>
  [...getOfficialAnimalDefsByBuilding(type)]

export const getFeedDef = (id: string) => {
  return getOfficialAnimalFeedById(id) ?? LEGACY_FEED_DEFS.find(feed => feed.id === id)
}

export const getFeedDefs = () => [...getOfficialAnimalFeedDefsAsLegacy()]

export const getBuildingDefs = (): AnimalBuildingDef[] => [...getOfficialAnimalBuildingDefsAsLegacy()]

export const getBuildingDef = (type: string): AnimalBuildingDef | undefined => {
  return getOfficialAnimalBuildingByType(type) ?? LEGACY_ANIMAL_BUILDINGS.find(b => b.type === type)
}

export const getBuildingUpgrade = (type: AnimalBuildingType, toLevel: number) => {
  return getOfficialAnimalBuildingUpgrade(type, toLevel) ?? LEGACY_BUILDING_UPGRADES.find(u => u.type === type && u.level === toLevel)
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
