import type { RingDef } from '@/types'
import { getOfficialRingById } from '@/domain/mods/contentAccess'
import { RINGS } from './ringDefinitions'

export {
  RINGS,
  CRAFTABLE_RINGS,
  MONSTER_DROP_RINGS,
  BOSS_DROP_RINGS,
  TREASURE_DROP_RINGS
} from './ringDefinitions'

/** 根据ID获取戒指定义 */
export const getRingById = (id: string): RingDef | undefined => {
  return getOfficialRingById(id) ?? RINGS.find(r => r.id === id)
}
