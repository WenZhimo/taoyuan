import type { PondBreedDef } from '@/types/fishPond'
import {
  findOfficialPondBreedByParents,
  getOfficialGen1PondBreedsForFish,
  getOfficialPondBreedById,
  getOfficialPondBreedsByGeneration,
  getOfficialPondBreedsBySpecies
} from '@/domain/mods/contentAccess'
import { POND_BREEDS as LEGACY_POND_BREEDS } from './pondBreedDefinitions'

export { BREED_COUNTS, POND_BREEDS } from './pondBreedDefinitions'

/** 根据品种ID查找 */
export const getBreedById = (breedId: string): PondBreedDef | undefined =>
  getOfficialPondBreedById(breedId) ?? LEGACY_POND_BREEDS.find(b => b.breedId === breedId)

/** 获取指定代数的所有品种 */
export const getBreedsByGeneration = (gen: 1 | 2 | 3 | 4 | 5): PondBreedDef[] => {
  const breeds = getOfficialPondBreedsByGeneration(gen)
  return breeds.length > 0 ? [...breeds] : LEGACY_POND_BREEDS.filter(b => b.generation === gen)
}

/** 获取指定鱼种的所有品种 */
export const getBreedsBySpecies = (baseFishId: string): PondBreedDef[] => {
  const breeds = getOfficialPondBreedsBySpecies(baseFishId)
  return breeds.length > 0 ? [...breeds] : LEGACY_POND_BREEDS.filter(b => b.baseFishId === baseFishId)
}

/** 获取指定鱼种的 Gen1 品种列表 */
export const getGen1BreedsForFish = (fishId: string): PondBreedDef[] => {
  const breeds = getOfficialGen1PondBreedsForFish(fishId)
  return breeds.length > 0
    ? [...breeds]
    : LEGACY_POND_BREEDS.filter(b => b.generation === 1 && b.baseFishId === fishId)
}

/** 根据亲本品种ID查找子代品种（顺序无关） */
export const findBreedByParents = (breedIdA: string, breedIdB: string): PondBreedDef | undefined =>
  findOfficialPondBreedByParents(breedIdA, breedIdB) ??
  LEGACY_POND_BREEDS.find(
    b => (b.parentBreedA === breedIdA && b.parentBreedB === breedIdB) || (b.parentBreedA === breedIdB && b.parentBreedB === breedIdA)
  )
