import type { HatDef } from '@/types'
import { getOfficialHatById } from '@/domain/mods/contentAccess'
import { HATS } from './hatDefinitions'

export {
  HATS,
  SHOP_HATS,
  CRAFTABLE_HATS,
  MONSTER_DROP_HATS,
  BOSS_DROP_HATS,
  TREASURE_DROP_HATS
} from './hatDefinitions'

/** 根据ID获取帽子定义 */
export const getHatById = (id: string): HatDef | undefined => {
  return getOfficialHatById(id) ?? HATS.find(h => h.id === id)
}
