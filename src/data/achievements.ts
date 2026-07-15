import {
  getOfficialAchievementById,
  getOfficialAchievementsAsLegacy,
  getOfficialCommunityBundleById,
  getOfficialCommunityBundlesAsLegacy
} from '@/domain/mods/contentAccess'
import { ACHIEVEMENTS, COMMUNITY_BUNDLES } from './achievementDefinitions'

export { ACHIEVEMENTS, COMMUNITY_BUNDLES }

/** 获取全部成就定义 */
export const getAchievements = () => getOfficialAchievementsAsLegacy()

/** 根据 ID 查找成就 */
export const getAchievementById = (id: string) =>
  getOfficialAchievementById(id) ?? ACHIEVEMENTS.find(achievement => achievement.id === id)

/** 获取全部祠堂任务定义 */
export const getCommunityBundles = () => getOfficialCommunityBundlesAsLegacy()

/** 根据 ID 查找祠堂任务 */
export const getBundleById = (id: string) =>
  getOfficialCommunityBundleById(id) ?? COMMUNITY_BUNDLES.find(bundle => bundle.id === id)
