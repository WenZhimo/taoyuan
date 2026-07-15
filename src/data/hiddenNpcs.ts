import type { HiddenNpcDef } from '@/types/hiddenNpc'
import {
  getOfficialHiddenNpcById,
  getOfficialHiddenNpcsAsLegacy
} from '@/domain/mods/contentAccess'
import { HIDDEN_NPCS as LEGACY_HIDDEN_NPCS } from './hiddenNpcDefinitions'

export { HIDDEN_NPCS } from './hiddenNpcDefinitions'

export const getHiddenNpcs = (): readonly HiddenNpcDef[] =>
  getOfficialHiddenNpcsAsLegacy()

/** 根据ID获取隐藏NPC定义 */
export const getHiddenNpcById = (id: string): HiddenNpcDef | undefined =>
  getOfficialHiddenNpcById(id) ?? LEGACY_HIDDEN_NPCS.find(npc => npc.id === id)
