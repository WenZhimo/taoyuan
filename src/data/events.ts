import type { Season } from '@/types'
import {
  getOfficialSeasonEventsAsLegacy,
  getOfficialTodaySeasonEvent
} from '@/domain/mods/contentAccess'
import type { SeasonEventDef } from './seasonEventDefinitions'

export type { SeasonEventDef } from './seasonEventDefinitions'

export const SEASON_EVENTS: readonly SeasonEventDef[] = getOfficialSeasonEventsAsLegacy()

/** 根据季节和日期获取当天事件 */
export const getTodayEvent = (season: Season, day: number): SeasonEventDef | undefined =>
  getOfficialTodaySeasonEvent(season, day)
