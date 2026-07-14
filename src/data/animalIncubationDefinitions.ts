import type { AnimalBuildingType, AnimalType } from '@/types'

export interface AnimalIncubationDef {
  itemId: string
  animalType: AnimalType
  days: number
  building: AnimalBuildingType
}

export type AnimalIncubationMapping = Omit<AnimalIncubationDef, 'itemId'>

/** 孵化映射：蛋 → 动物类型 + 孵化天数 + 所属建筑 */
export const ANIMAL_INCUBATIONS: AnimalIncubationDef[] = [
  { itemId: 'egg', animalType: 'chicken', days: 5, building: 'coop' },
  { itemId: 'duck_egg', animalType: 'duck', days: 7, building: 'coop' },
  { itemId: 'goose_egg', animalType: 'goose', days: 6, building: 'coop' },
  { itemId: 'quail_egg', animalType: 'quail', days: 4, building: 'coop' },
  { itemId: 'pigeon_egg', animalType: 'pigeon', days: 5, building: 'coop' },
  { itemId: 'silkie_egg', animalType: 'silkie', days: 6, building: 'coop' },
  { itemId: 'ostrich_egg', animalType: 'ostrich', days: 10, building: 'barn' }
]

export const INCUBATION_MAP: Record<string, AnimalIncubationMapping> = Object.fromEntries(
  ANIMAL_INCUBATIONS.map(({ itemId, ...mapping }) => [itemId, mapping])
)
