import {
  getOfficialFarmMapByType,
  getOfficialFarmMapsAsLegacy
} from '@/domain/mods/contentAccess'
import { FARM_MAP_DEFS as LEGACY_FARM_MAP_DEFS } from './farmMapDefinitions'

export type { FarmMapDef } from './farmMapDefinitions'
export { FARM_MAP_DEFS } from './farmMapDefinitions'

export const getFarmMapDefs = () => getOfficialFarmMapsAsLegacy() ?? LEGACY_FARM_MAP_DEFS

export const getFarmMapByType = (type: string) => {
  return getOfficialFarmMapByType(type) ?? LEGACY_FARM_MAP_DEFS.find(map => map.type === type)
}
