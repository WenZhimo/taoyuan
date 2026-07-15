import type { MainQuestDef } from '@/types'
import {
  getOfficialChapterStoryQuests,
  getOfficialFirstStoryQuest,
  getOfficialNextStoryQuest,
  getOfficialStoryQuestById,
  getOfficialStoryQuestByOrder,
  getOfficialStoryQuestsAsLegacy
} from '@/domain/mods/contentAccess'
import { STORY_QUESTS as LEGACY_STORY_QUESTS } from './storyQuestDefinitions'

export { CHAPTER_TITLES, STORY_QUESTS } from './storyQuestDefinitions'

export const getStoryQuests = (): readonly MainQuestDef[] =>
  getOfficialStoryQuestsAsLegacy()

export const getStoryQuestCount = (): number => getStoryQuests().length

/** 根据ID获取主线任务 */
export const getStoryQuestById = (id: string): MainQuestDef | undefined => {
  return getOfficialStoryQuestById(id) ?? LEGACY_STORY_QUESTS.find(q => q.id === id)
}

/** 根据章节和序号获取主线任务 */
export const getStoryQuestByOrder = (chapter: number, order: number): MainQuestDef | undefined => {
  return getOfficialStoryQuestByOrder(chapter, order) ?? LEGACY_STORY_QUESTS.find(q => q.chapter === chapter && q.order === order)
}

/** 获取下一个主线任务 */
export const getNextStoryQuest = (currentId: string): MainQuestDef | undefined => {
  return getOfficialNextStoryQuest(currentId) ?? (() => {
    const idx = LEGACY_STORY_QUESTS.findIndex(q => q.id === currentId)
    if (idx === -1 || idx >= LEGACY_STORY_QUESTS.length - 1) return undefined
    return LEGACY_STORY_QUESTS[idx + 1]
  })()
}

/** 获取某章的所有主线任务 */
export const getChapterQuests = (chapter: number): readonly MainQuestDef[] => {
  const quests = getOfficialChapterStoryQuests(chapter)
  return quests.length > 0 ? quests : LEGACY_STORY_QUESTS.filter(q => q.chapter === chapter)
}

/** 获取第一个主线任务 */
export const getFirstStoryQuest = (): MainQuestDef => {
  return getOfficialFirstStoryQuest() ?? LEGACY_STORY_QUESTS[0]!
}