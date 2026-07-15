import {
  getOfficialGuildDonationByItemId,
  getOfficialGuildDonationsAsLegacy,
  getOfficialGuildGoalByMonsterId,
  getOfficialGuildGoalsAsLegacy,
  getOfficialGuildLevelByLevel,
  getOfficialGuildLevelsAsLegacy
} from '@/domain/mods/contentAccess'
import {
  GUILD_BONUS_PER_LEVEL,
  GUILD_DONATIONS,
  GUILD_LEVELS,
  GUILD_SHOP_ITEMS,
  MONSTER_GOALS
} from './guildDefinitions'

export {
  GUILD_BONUS_PER_LEVEL,
  GUILD_DONATIONS,
  GUILD_LEVELS,
  GUILD_SHOP_ITEMS,
  MONSTER_GOALS
}

/** 获取全部怪物讨伐目标 */
export const getMonsterGoals = () => getOfficialGuildGoalsAsLegacy()

/** 根据怪物 ID 查找讨伐目标 */
export const getMonsterGoalByMonsterId = (monsterId: string) =>
  getOfficialGuildGoalByMonsterId(monsterId) ?? MONSTER_GOALS.find(goal => goal.monsterId === monsterId)

/** 获取全部可捐献物品定义 */
export const getGuildDonations = () => getOfficialGuildDonationsAsLegacy()

/** 根据物品 ID 查找捐献定义 */
export const getGuildDonationByItemId = (itemId: string) =>
  getOfficialGuildDonationByItemId(itemId) ?? GUILD_DONATIONS.find(donation => donation.itemId === itemId)

/** 获取全部公会等级定义 */
export const getGuildLevels = () => getOfficialGuildLevelsAsLegacy()

/** 根据等级查找公会等级定义 */
export const getGuildLevelByLevel = (level: number) =>
  getOfficialGuildLevelByLevel(level) ?? GUILD_LEVELS.find(guildLevel => guildLevel.level === level)
