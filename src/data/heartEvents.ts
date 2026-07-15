import type { HeartEventDef } from '@/types'
import {
  getOfficialHeartEventById,
  getOfficialHeartEventsForNpc
} from '@/domain/mods/contentAccess'
import {
  HEART_EVENTS as LEGACY_HEART_EVENTS,
  WEDDING_EVENT
} from './heartEventDefinitions'

export { HEART_EVENTS, WEDDING_EVENT } from './heartEventDefinitions'

/** 根据NPC ID获取其所有心事件 */
export const getHeartEventsForNpc = (npcId: string): HeartEventDef[] => {
  const events = getOfficialHeartEventsForNpc(npcId)
  return events.length > 0 ? [...events] : LEGACY_HEART_EVENTS.filter(event => event.npcId === npcId)
}

/** 根据事件ID获取心事件定义 */
export const getHeartEventById = (id: string): HeartEventDef | undefined =>
  getOfficialHeartEventById(id) ?? LEGACY_HEART_EVENTS.find(event => event.id === id) ?? (WEDDING_EVENT.id === id ? WEDDING_EVENT : undefined)
