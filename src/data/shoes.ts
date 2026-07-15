import type { ShoeDef } from '@/types'
import { getOfficialShoeById } from '@/domain/mods/contentAccess'
import { SHOES } from './shoeDefinitions'

export {
  SHOES,
  SHOP_SHOES,
  CRAFTABLE_SHOES,
  MONSTER_DROP_SHOES,
  BOSS_DROP_SHOES,
  TREASURE_DROP_SHOES
} from './shoeDefinitions'

/** 根据ID获取鞋子定义 */
export const getShoeById = (id: string): ShoeDef | undefined => {
  return getOfficialShoeById(id) ?? SHOES.find(s => s.id === id)
}
