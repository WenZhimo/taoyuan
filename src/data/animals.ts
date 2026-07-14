import type { AnimalBuildingDef, AnimalDef, AnimalBuildingType } from '@/types'
import {
  getOfficialAnimalByType,
  getOfficialAnimalBuildingByType,
  getOfficialAnimalBuildingDefsAsLegacy,
  getOfficialAnimalBuildingUpgrade,
  getOfficialAnimalDefsByBuilding,
  getOfficialAnimalFeedById,
  getOfficialAnimalFeedDefsAsLegacy,
  getOfficialAnimalIncubationByItemId,
  getOfficialAnimalIncubationDefsAsLegacy,
  getOfficialAnimalIncubationMap
} from '@/domain/mods/contentAccess'
import { ANIMAL_DEFS as LEGACY_ANIMAL_DEFS } from './animalDefinitions'
import { FEED_DEFS as LEGACY_FEED_DEFS } from './animalFeedDefinitions'
import {
  ANIMAL_BUILDINGS as LEGACY_ANIMAL_BUILDINGS,
  BUILDING_UPGRADES as LEGACY_BUILDING_UPGRADES
} from './animalBuildingDefinitions'
import { INCUBATION_MAP as LEGACY_INCUBATION_MAP } from './animalIncubationDefinitions'

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
export {
  ANIMAL_INCUBATIONS,
  INCUBATION_MAP,
  type AnimalIncubationDef,
  type AnimalIncubationMapping
} from './animalIncubationDefinitions'

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

export const getIncubationDef = (itemId: string) => {
  return getOfficialAnimalIncubationByItemId(itemId) ?? LEGACY_INCUBATION_MAP[itemId]
}

export const getIncubationDefs = () => [...getOfficialAnimalIncubationDefsAsLegacy()]

export const getIncubationMap = () => getOfficialAnimalIncubationMap()
