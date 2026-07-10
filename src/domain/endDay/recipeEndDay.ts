const NPC_NAME_MAP: Record<string, string> = {
  chen_bo: '陈伯',
  liu_niang: '柳娘',
  a_shi: '阿石',
  qiu_yue: '秋月',
  lin_lao: '林老',
  xiao_man: '小满',
  chun_lan: '春兰',
  xue_qin: '雪芹',
  su_su: '素素',
  hong_dou: '红豆',
  dan_qing: '丹青',
  a_tie: '阿铁',
  yun_fei: '云飞',
  da_niu: '大牛',
  mo_bai: '墨白',
  wang_dashen: '王大婶',
  zhao_mujiang: '赵木匠',
  sun_tiejiang: '孙铁匠',
  zhang_popo: '张婆婆',
  li_yu: '李渔翁',
  zhou_xiucai: '周秀才',
  wu_shen: '吴婶',
  ma_liu: '马六',
  lao_song: '老宋',
  pang_shen: '胖婶',
  a_hua: '阿花',
  shi_tou: '石头',
  hui_niang: '慧娘',
  lao_lu: '老陆',
  liu_cunzhang: '柳村长',
  qian_niang: '钱娘',
  he_zhanggui: '何掌柜',
  qin_dashu: '秦大叔',
  a_fu: '阿福'
}

type FriendshipLevel = 'stranger' | 'acquaintance' | 'friendly' | 'bestFriend'
type RequiredFriendshipLevel = Exclude<FriendshipLevel, 'stranger'>

interface NpcRecipeEntry {
  npcId: string
  level: RequiredFriendshipLevel
  recipeId: string
}

const NPC_RECIPE_MAP: readonly NpcRecipeEntry[] = [
  { npcId: 'chen_bo', level: 'acquaintance', recipeId: 'radish_soup' },
  { npcId: 'qiu_yue', level: 'acquaintance', recipeId: 'braised_carp' },
  { npcId: 'lin_lao', level: 'acquaintance', recipeId: 'herbal_porridge' },
  { npcId: 'liu_niang', level: 'acquaintance', recipeId: 'osmanthus_cake' },
  { npcId: 'a_shi', level: 'acquaintance', recipeId: 'miner_lunch' },
  { npcId: 'xiao_man', level: 'acquaintance', recipeId: 'sweet_osmanthus_tea' },
  { npcId: 'chen_bo', level: 'friendly', recipeId: 'aged_radish_stew' },
  { npcId: 'qiu_yue', level: 'friendly', recipeId: 'maple_grilled_fish' },
  { npcId: 'lin_lao', level: 'friendly', recipeId: 'herbal_pill' },
  { npcId: 'liu_niang', level: 'friendly', recipeId: 'embroidered_cake' },
  { npcId: 'a_shi', level: 'friendly', recipeId: 'deep_mine_stew' },
  { npcId: 'xiao_man', level: 'friendly', recipeId: 'wild_berry_jam' },
  { npcId: 'chen_bo', level: 'bestFriend', recipeId: 'farmers_feast' },
  { npcId: 'qiu_yue', level: 'bestFriend', recipeId: 'autumn_moon_feast' },
  { npcId: 'lin_lao', level: 'bestFriend', recipeId: 'longevity_soup' },
  { npcId: 'liu_niang', level: 'bestFriend', recipeId: 'lovers_pastry' },
  { npcId: 'a_shi', level: 'bestFriend', recipeId: 'forgemasters_meal' },
  { npcId: 'xiao_man', level: 'bestFriend', recipeId: 'spirit_fruit_wine' },
  { npcId: 'da_niu', level: 'friendly', recipeId: 'goat_milk_soup' },
  { npcId: 'da_niu', level: 'bestFriend', recipeId: 'truffle_fried_rice' },
  { npcId: 'lin_lao', level: 'bestFriend', recipeId: 'antler_soup' },
  { npcId: 'chen_bo', level: 'bestFriend', recipeId: 'camel_milk_tea' }
]

const MARRIAGE_RECIPE_MAP: Record<string, string> = {
  liu_niang: 'phoenix_cake',
  a_shi: 'molten_hotpot',
  qiu_yue: 'moonlight_sashimi',
  chun_lan: 'tea_banquet',
  xue_qin: 'snow_plum_soup',
  su_su: 'silk_dumpling',
  hong_dou: 'drunken_chicken',
  dan_qing: 'scholars_porridge',
  a_tie: 'ironforge_stew',
  yun_fei: 'hunters_roast',
  da_niu: 'ranch_milk_soup',
  mo_bai: 'moonlit_tea_rice'
}

const ITEM_RECIPE_MAP = [
  { itemId: 'hanhai_spice', recipeId: 'spiced_lamb', name: '香料烤羊' },
  { itemId: 'hanhai_silk', recipeId: 'silk_dumpling_deluxe', name: '丝路饺子' },
  { itemId: 'hanhai_cactus', recipeId: 'desert_cactus_soup', name: '仙人掌汤' },
  { itemId: 'hanhai_date', recipeId: 'date_cake', name: '枣糕' }
] as const

const LEVEL_ORDER: readonly FriendshipLevel[] = [
  'stranger',
  'acquaintance',
  'friendly',
  'bestFriend'
]

const LEGENDARY_FISH_IDS = [
  'dragonfish',
  'golden_turtle',
  'river_dragon',
  'abyss_leviathan',
  'jade_dragon'
] as const

const SOCIAL_RECIPE_NPC_IDS = [
  'chen_bo',
  'liu_niang',
  'a_shi',
  'qiu_yue',
  'lin_lao',
  'xiao_man'
] as const

const getNpcName = (npcId: string): string => NPC_NAME_MAP[npcId] ?? npcId

const meetsLevel = (current: string, required: RequiredFriendshipLevel): boolean =>
  LEVEL_ORDER.indexOf(current as FriendshipLevel) >= LEVEL_ORDER.indexOf(required)

export interface SkillRecipeLike<TSkillType extends string> {
  id: string
  name: string
  requiredSkill?: {
    type: TSkillType
    level: number
  }
}

export interface RecipeSpouseLike {
  npcId: string
}

export interface DailyRecipeUnlockInput<
  TSkillType extends string,
  TSpouse extends RecipeSpouseLike
> {
  getFriendshipLevel: (npcId: string) => string
  getSpouse: () => TSpouse | null
  recipes: readonly SkillRecipeLike<TSkillType>[]
  getSkillLevel: (skillType: TSkillType) => number
  hasItem: (itemId: string) => boolean
  unlockRecipe: (recipeId: string) => boolean
  addLog: (message: string) => void
}

export interface DailyRecipeUnlockResult {
  npcRecipes: number
  marriageRecipes: number
  skillRecipes: number
  itemRecipes: number
}

export function processDailyRecipeUnlocks<
  TSkillType extends string,
  TSpouse extends RecipeSpouseLike
>({
  getFriendshipLevel,
  getSpouse,
  recipes,
  getSkillLevel,
  hasItem,
  unlockRecipe,
  addLog
}: DailyRecipeUnlockInput<TSkillType, TSpouse>): DailyRecipeUnlockResult {
  let npcRecipes = 0
  let marriageRecipes = 0
  let skillRecipes = 0
  let itemRecipes = 0

  for (const entry of NPC_RECIPE_MAP) {
    const level = getFriendshipLevel(entry.npcId)
    if (meetsLevel(level, entry.level) && unlockRecipe(entry.recipeId)) {
      const levelName =
        entry.level === 'acquaintance' ? '相识' : entry.level === 'friendly' ? '相知' : '挚友'
      addLog(`${getNpcName(entry.npcId)}（${levelName}）寄来了新食谱！`)
      npcRecipes++
    }
  }

  const spouse = getSpouse()
  if (spouse) {
    const marriageRecipe = MARRIAGE_RECIPE_MAP[spouse.npcId]
    if (marriageRecipe && unlockRecipe(marriageRecipe)) {
      addLog(`${getNpcName(spouse.npcId)}教你了新的料理秘方！`)
      marriageRecipes++
    }
    if (unlockRecipe('peacock_feast')) {
      addLog('婚后生活解锁了新食谱：孔雀宴！')
      marriageRecipes++
    }
  }

  for (const recipe of recipes) {
    if (
      recipe.requiredSkill &&
      getSkillLevel(recipe.requiredSkill.type) >= recipe.requiredSkill.level &&
      unlockRecipe(recipe.id)
    ) {
      addLog(`技能提升解锁了新食谱：${recipe.name}！`)
      skillRecipes++
    }
  }

  for (const entry of ITEM_RECIPE_MAP) {
    if (hasItem(entry.itemId) && unlockRecipe(entry.recipeId)) {
      addLog(`获得了新食谱：${entry.name}！`)
      itemRecipes++
    }
  }

  return { npcRecipes, marriageRecipes, skillRecipes, itemRecipes }
}

export interface AchievementRecipeStats {
  totalFishCaught: number
  totalCropsHarvested: number
  highestMineFloor: number
  totalRecipesCooked: number
}

export interface AchievementRecipeUnlockInput {
  stats: AchievementRecipeStats
  discoveredCount: number
  getFriendshipLevel: (npcId: string) => string
  isDiscovered: (itemId: string) => boolean
  unlockRecipe: (recipeId: string) => boolean
  addLog: (message: string) => void
}

export function processAchievementRecipeUnlocks({
  stats,
  discoveredCount,
  getFriendshipLevel,
  isDiscovered,
  unlockRecipe,
  addLog
}: AchievementRecipeUnlockInput): number {
  const checks = [
    { condition: stats.totalFishCaught >= 1, recipeId: 'first_catch_soup', message: '初次钓鱼' },
    {
      condition: stats.totalCropsHarvested >= 100,
      recipeId: 'bountiful_porridge',
      message: '收获百次作物'
    },
    { condition: stats.highestMineFloor >= 30, recipeId: 'miners_glory', message: '矿洞探索' },
    {
      condition: stats.totalRecipesCooked >= 20,
      recipeId: 'chef_special',
      message: '烹饪达人'
    },
    {
      condition:
        SOCIAL_RECIPE_NPC_IDS.filter(npcId =>
          meetsLevel(getFriendshipLevel(npcId), 'friendly')
        ).length >= 3,
      recipeId: 'social_tea',
      message: '社交达人'
    },
    { condition: stats.totalFishCaught >= 20, recipeId: 'anglers_platter', message: '钓鱼好手' },
    {
      condition: LEGENDARY_FISH_IDS.some(itemId => isDiscovered(itemId)),
      recipeId: 'legendary_feast',
      message: '传说猎人'
    },
    { condition: stats.highestMineFloor >= 50, recipeId: 'abyss_stew', message: '深渊探索' },
    {
      condition: discoveredCount >= 50,
      recipeId: 'collectors_banquet',
      message: '收藏达人'
    }
  ]

  let unlockedCount = 0
  for (const check of checks) {
    if (check.condition && unlockRecipe(check.recipeId)) {
      addLog(`【成就食谱】${check.message}解锁了新食谱！`)
      unlockedCount++
    }
  }
  return unlockedCount
}
