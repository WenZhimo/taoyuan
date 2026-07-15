import type { NpcDef } from '@/types'
import { getOfficialNpcById, getOfficialNpcsAsLegacy } from '@/domain/mods/contentAccess'
import { NPCS as LEGACY_NPCS } from './npcDefinitions'

export { NPCS } from './npcDefinitions'

/** 获取所有 NPC 定义 */
export const getNpcs = (): readonly NpcDef[] => getOfficialNpcsAsLegacy()

/** 根据ID获取NPC定义 */
export const getNpcById = (id: string): NpcDef | undefined => {
  return getOfficialNpcById(id) ?? LEGACY_NPCS.find(n => n.id === id)
}
