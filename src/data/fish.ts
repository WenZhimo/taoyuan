import type { FishDef, FishingLocation } from '@/types'
import { getOfficialAvailableFish, getOfficialFishById } from '@/domain/mods/contentAccess'

export { FISHING_LOCATIONS, FISH } from './fishDefinitions'

/** 根据ID获取鱼 */
export const getFishById = (id: string): FishDef | undefined =>
  getOfficialFishById(id)

/** 获取当前季节、天气和地点可钓到的鱼 */
export const getAvailableFish = (season: string, weather: string, location?: FishingLocation): FishDef[] =>
  [...getOfficialAvailableFish(season, weather, location)]
