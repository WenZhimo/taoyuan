import {
  getOfficialMuseumCategoriesAsLegacy,
  getOfficialMuseumItemById,
  getOfficialMuseumItemsAsLegacy,
  getOfficialMuseumMilestoneByCount,
  getOfficialMuseumMilestonesAsLegacy
} from '@/domain/mods/contentAccess'
import { MUSEUM_CATEGORIES, MUSEUM_ITEMS, MUSEUM_MILESTONES } from './museumDefinitions'

export { MUSEUM_CATEGORIES, MUSEUM_ITEMS, MUSEUM_MILESTONES }

/** 获取博物馆可捐赠物品全目录 */
export const getMuseumItems = () => getOfficialMuseumItemsAsLegacy()

/** 获取博物馆分类标签 */
export const getMuseumCategories = () => getOfficialMuseumCategoriesAsLegacy()

/** 获取博物馆里程碑奖励 */
export const getMuseumMilestones = () => getOfficialMuseumMilestonesAsLegacy()

/** 根据ID查找博物馆物品 */
export const getMuseumItemById = (id: string) =>
  getOfficialMuseumItemById(id) ?? MUSEUM_ITEMS.find(item => item.id === id)

/** 根据捐赠数量查找博物馆里程碑 */
export const getMuseumMilestoneByCount = (count: number) =>
  getOfficialMuseumMilestoneByCount(count) ?? MUSEUM_MILESTONES.find(milestone => milestone.count === count)
