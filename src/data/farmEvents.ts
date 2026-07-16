import {
  type MorningChoiceEvent,
  type MorningEasterEgg,
  type MorningNarration
} from './farmEventDefinitions'
import {
  getOfficialMorningChoiceEventsAsLegacy,
  getOfficialMorningEasterEggsAsLegacy,
  getOfficialMorningNarrationsAsLegacy
} from '@/domain/mods/contentAccess'

export type {
  MorningChoiceEvent,
  MorningEasterEgg,
  MorningEffect,
  MorningNarration
} from './farmEventDefinitions'

export const MORNING_NARRATIONS: MorningNarration[] = [...getOfficialMorningNarrationsAsLegacy()]

export const NARRATIONS_NO_LOSS: MorningNarration[] =
  MORNING_NARRATIONS.filter(narration => !narration.effect || narration.effect.type !== 'loseCrop')

export const MORNING_CHOICE_EVENTS: MorningChoiceEvent[] = [...getOfficialMorningChoiceEventsAsLegacy()]

export const MORNING_EASTER_EGGS: MorningEasterEgg[] = [...getOfficialMorningEasterEggsAsLegacy()]

export const getMorningNarrations = (): readonly MorningNarration[] =>
  getOfficialMorningNarrationsAsLegacy()

export const getMorningChoiceEvents = (): readonly MorningChoiceEvent[] =>
  getOfficialMorningChoiceEventsAsLegacy()

export const getMorningEasterEggs = (): readonly MorningEasterEgg[] =>
  getOfficialMorningEasterEggsAsLegacy()

export const getNoLossMorningNarrations = (): readonly MorningNarration[] =>
  getMorningNarrations().filter(narration => !narration.effect || narration.effect.type !== 'loseCrop')
