import type { HeartEventDef } from '@/types'
import {
  getOfficialHiddenNpcHeartEventById,
  getOfficialHiddenNpcHeartEvents
} from '@/domain/mods/contentAccess'
import { HIDDEN_NPC_HEART_EVENTS as LEGACY_HIDDEN_NPC_HEART_EVENTS } from './hiddenNpcHeartEventDefinitions'

export { HIDDEN_NPC_HEART_EVENTS } from './hiddenNpcHeartEventDefinitions'

/** 根据NPC ID获取心事件列表 */
export const getHiddenNpcHeartEvents = (npcId: string): HeartEventDef[] => {
  const events = getOfficialHiddenNpcHeartEvents(npcId)
  return events.length > 0 ? [...events] : LEGACY_HIDDEN_NPC_HEART_EVENTS.filter(event => event.npcId === npcId)
}

/** 根据事件ID获取心事件 */
export const getHiddenNpcHeartEventById = (eventId: string): HeartEventDef | undefined =>
  getOfficialHiddenNpcHeartEventById(eventId) ?? LEGACY_HIDDEN_NPC_HEART_EVENTS.find(event => event.id === eventId)
