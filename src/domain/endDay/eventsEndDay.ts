import type { Season } from '@/types'

export interface TradeCompletion {
  itemId: string
  quantity: number
  points: number
}

export interface HiddenNpcAbility {
  id: string
  name: string
  description: string
}

export interface DiscoveryStepLike {
  logMessage?: string
  scenes: readonly unknown[]
}

export interface ExpiredQuestLike {
  description: string
}

export interface OldDateEndDayInput<TStep extends DiscoveryStepLike> {
  dailyNpcReset: () => void
  dailyCookingReset: () => void
  resetDailyBets: () => void
  hanhaiUnlocked: boolean
  dailyTradeUpdate: () => { completed: TradeCompletion[] }
  getItemName: (itemId: string) => string
  checkDiscoveryConditions: () => { npcId: string; step: TStep }[]
  showDiscoveryScene: (npcId: string, step: TStep) => void
  dailyHiddenNpcReset: () => void
  checkAbilityUnlocks: () => HiddenNpcAbility[]
  isAbilityActive: (abilityId: string) => boolean
  getBonusMaxStamina: () => number
  addBonusMaxStamina: (amount: number) => void
  processShippingBox: () => number
  earnMoney: (amount: number) => void
  dailyQuestUpdate: () => ExpiredQuestLike[]
  updateMainQuestProgress: () => void
  addLog: (message: string) => void
}

export interface OldDateEndDayResult {
  completedTradeCount: number
  discoveryCount: number
  unlockedAbilityCount: number
  bonusMaxStaminaAdded: number
  shippingIncome: number
  expiredQuestCount: number
}

export function processOldDateEndDay<TStep extends DiscoveryStepLike>({
  dailyNpcReset,
  dailyCookingReset,
  resetDailyBets,
  hanhaiUnlocked,
  dailyTradeUpdate,
  getItemName,
  checkDiscoveryConditions,
  showDiscoveryScene,
  dailyHiddenNpcReset,
  checkAbilityUnlocks,
  isAbilityActive,
  getBonusMaxStamina,
  addBonusMaxStamina,
  processShippingBox,
  earnMoney,
  dailyQuestUpdate,
  updateMainQuestProgress,
  addLog
}: OldDateEndDayInput<TStep>): OldDateEndDayResult {
  dailyNpcReset()
  dailyCookingReset()
  resetDailyBets()

  const completedTrades = hanhaiUnlocked ? dailyTradeUpdate().completed : []
  for (const trade of completedTrades) {
    addLog(`通商售出${getItemName(trade.itemId)}×${trade.quantity}，获得${trade.points}通商积分。`)
  }

  const discoveries = checkDiscoveryConditions()
  for (const { npcId, step } of discoveries) {
    if (step.logMessage) addLog(step.logMessage)
    if (step.scenes.length > 0) showDiscoveryScene(npcId, step)
  }

  dailyHiddenNpcReset()
  const unlockedAbilities = checkAbilityUnlocks()
  let bonusMaxStaminaAdded = 0
  for (const ability of unlockedAbilities) {
    addLog(`【仙缘】${ability.name}：${ability.description}`)
    if (ability.id === 'shan_weng_3') {
      addBonusMaxStamina(20)
      bonusMaxStaminaAdded += 20
    }
  }

  if (isAbilityActive('shan_weng_3')) {
    const missingBonus = Math.max(0, 20 - getBonusMaxStamina())
    if (missingBonus > 0) {
      addBonusMaxStamina(missingBonus)
      bonusMaxStaminaAdded += missingBonus
    }
  }

  const shippingIncome = processShippingBox()
  if (shippingIncome > 0) {
    earnMoney(shippingIncome)
    addLog(`出货箱结算：收入${shippingIncome}文。`)
  }

  const expiredQuests = dailyQuestUpdate()
  for (const quest of expiredQuests) {
    addLog(`委托「${quest.description}」已过期。`)
  }
  updateMainQuestProgress()

  return {
    completedTradeCount: completedTrades.length,
    discoveryCount: discoveries.length,
    unlockedAbilityCount: unlockedAbilities.length,
    bonusMaxStaminaAdded,
    shippingIncome,
    expiredQuestCount: expiredQuests.length
  }
}

export interface WeatherFarmPlot {
  state: string
  cropId: string | null
}

export interface LightningStrikeResult {
  absorbed: boolean
  hit: boolean
  cropName?: string
}

export interface MarketTrendLike<TCategory> {
  trend: string
  category: TCategory
}

export interface WeatherMarketEndDayInput<TCategory> {
  weather: string
  isRainy: boolean
  tomorrowWeatherName: string
  seasonChanged: boolean
  day: number
  season: Season
  lightningStrike: () => LightningStrikeResult
  addItem: (itemId: string) => unknown
  getPlots: () => readonly WeatherFarmPlot[]
  getCropSeasons: (cropId: string) => readonly Season[] | undefined
  getSeasonName: (season: Season) => string
  getMarketInfo: () => readonly MarketTrendLike<TCategory>[]
  getMarketCategoryName: (category: TCategory) => string
  addLog: (message: string) => void
  showFloat: (message: string, type: 'danger') => void
}

export interface WeatherMarketEndDayResult {
  lightningOutcome: 'none' | 'absorbed' | 'hit'
  cropAtRisk: number
  marketBoomCount: number
  marketCrashCount: number
}

const SEASON_ORDER: readonly Season[] = ['spring', 'summer', 'autumn', 'winter']

export function processWeatherMarketEndDay<TCategory>({
  weather,
  isRainy,
  tomorrowWeatherName,
  seasonChanged,
  day,
  season,
  lightningStrike,
  addItem,
  getPlots,
  getCropSeasons,
  getSeasonName,
  getMarketInfo,
  getMarketCategoryName,
  addLog,
  showFloat
}: WeatherMarketEndDayInput<TCategory>): WeatherMarketEndDayResult {
  let lightningOutcome: WeatherMarketEndDayResult['lightningOutcome'] = 'none'
  if (weather === 'stormy') {
    const strike = lightningStrike()
    if (strike.absorbed) {
      addItem('battery')
      addLog('避雷针吸收了一道闪电！获得了电池组。')
      lightningOutcome = 'absorbed'
    } else if (strike.hit) {
      addLog(`雷暴中一道闪电击中了你的农场，一株${strike.cropName}被毁了！建造避雷针可以防护。`)
      lightningOutcome = 'hit'
    }
  }

  if (isRainy) addLog('今天下雨，作物自动浇水。')
  addLog(`明日天气预报：${tomorrowWeatherName}`)

  let cropAtRisk = 0
  if (!seasonChanged && day >= 25 && day <= 27) {
    const daysLeft = 28 - day
    const nextSeason = SEASON_ORDER[(SEASON_ORDER.indexOf(season) + 1) % SEASON_ORDER.length]!
    for (const plot of getPlots()) {
      if (
        (plot.state === 'planted' || plot.state === 'growing' || plot.state === 'harvestable') &&
        plot.cropId
      ) {
        const cropSeasons = getCropSeasons(plot.cropId)
        if (cropSeasons && !cropSeasons.includes(nextSeason)) cropAtRisk++
      }
    }
    if (cropAtRisk > 0) {
      addLog(
        `距离换季还有${daysLeft}天，${cropAtRisk}株作物不适应${getSeasonName(nextSeason)}季，届时将会枯萎。`
      )
      showFloat(`换季倒计时${daysLeft}天！${cropAtRisk}株作物将枯萎`, 'danger')
    } else {
      addLog(`距离换季还有${daysLeft}天。`)
    }
  }

  const marketInfo = getMarketInfo()
  const booms = marketInfo.filter(entry => entry.trend === 'boom')
  const crashes = marketInfo.filter(entry => entry.trend === 'crash')
  if (booms.length > 0) {
    addLog(`今日行情：${booms.map(entry => getMarketCategoryName(entry.category)).join('、')}价格大涨！`)
  }
  if (crashes.length > 0) {
    addLog(`今日行情：${crashes.map(entry => getMarketCategoryName(entry.category)).join('、')}价格暴跌。`)
  }

  return {
    lightningOutcome,
    cropAtRisk,
    marketBoomCount: booms.length,
    marketCrashCount: crashes.length
  }
}

export interface MorningTipLike {
  id: string
  conditionKey: string
  message: string
}

export interface TutorialFarmPlot {
  state: string
  watered: boolean
}

export interface MorningTutorialEndDayInput {
  enabled: boolean
  year: number
  day: number
  season: Season
  isRainy: boolean
  tips: readonly MorningTipLike[]
  getPlots: () => readonly TutorialFarmPlot[]
  getSprinklerCount: () => number
  getAnimalCount: () => number
  totalCropsHarvested: number
  totalMoneyEarned: number
  totalFishCaught: number
  highestMineFloor: number
  totalRecipesCooked: number
  areAllNpcFriendshipsZero: () => boolean
  isTipShown: (tipId: string) => boolean
  markTipShown: (tipId: string) => void
  hasPanelVisited: (panel: string) => boolean
  getFlag: (key: string) => boolean
  setFlag: (key: string, value?: boolean) => void
  addLog: (message: string) => void
}

export interface MorningTutorialEndDayResult {
  shownTipId: string | null
  temporaryFlagsCleared: boolean
}

export function processMorningTutorialEndDay({
  enabled,
  year,
  day,
  season,
  isRainy,
  tips,
  getPlots,
  getSprinklerCount,
  getAnimalCount,
  totalCropsHarvested,
  totalMoneyEarned,
  totalFishCaught,
  highestMineFloor,
  totalRecipesCooked,
  areAllNpcFriendshipsZero,
  isTipShown,
  markTipShown,
  hasPanelVisited,
  getFlag,
  setFlag,
  addLog
}: MorningTutorialEndDayInput): MorningTutorialEndDayResult {
  if (!enabled || year !== 1) {
    return { shownTipId: null, temporaryFlagsCleared: false }
  }

  const conditions: Record<string, () => boolean> = {
    earlyFirstDay: () => day === 2 && season === 'spring',
    allWasteland: () => getPlots().every(plot => plot.state === 'wasteland') && day > 2,
    tilledNoPlanted: () =>
      getPlots().some(plot => plot.state === 'tilled') &&
      !getPlots().some(
        plot => plot.state === 'planted' || plot.state === 'growing' || plot.state === 'harvestable'
      ),
    plantedUnwatered: () =>
      getPlots().some(
        plot => (plot.state === 'planted' || plot.state === 'growing') && !plot.watered
      ) && !isRainy,
    hasHarvestable: () => getPlots().some(plot => plot.state === 'harvestable'),
    harvestedNeverSold: () => totalCropsHarvested > 0 && totalMoneyEarned === 0,
    earlyGame: () => day <= 4 && season === 'spring',
    staminaWasLow: () => getFlag('staminaWasLow'),
    neverVisitedShop: () => !hasPanelVisited('shop'),
    neverFished: () => totalFishCaught === 0 && day >= 4,
    neverMined: () => highestMineFloor === 0 && day >= 6,
    neverTalkedNpc: () => areAllNpcFriendshipsZero() && day >= 3,
    neverCheckedQuests: () => !hasPanelVisited('quest') && day >= 5,
    neverCooked: () => totalRecipesCooked === 0 && day >= 8,
    firstRainyDay: () => isRainy && !getFlag('seenRain'),
    justChangedSeason: () => getFlag('justChangedSeason'),
    hasCropNoSprinkler: () =>
      getPlots().some(plot => plot.state === 'growing') && getSprinklerCount() === 0 && day >= 11,
    neverHadAnimal: () => getAnimalCount() === 0 && day >= 15
  }

  let shownTipId: string | null = null
  for (const tip of tips) {
    if (isTipShown(tip.id)) continue
    const check = conditions[tip.conditionKey]
    if (check && check()) {
      addLog(tip.message)
      markTipShown(tip.id)
      shownTipId = tip.id
      if (tip.conditionKey === 'firstRainyDay') setFlag('seenRain')
      if (tip.conditionKey === 'justChangedSeason') setFlag('seenSeasonChange')
      break
    }
  }

  setFlag('justChangedSeason', false)
  setFlag('staminaWasLow', false)
  return { shownTipId, temporaryFlagsCleared: true }
}

export interface SeasonEventLike<TFestivalType extends string> {
  interactive?: boolean
  festivalType?: TFestivalType
  narrative: readonly string[]
}

const FESTIVAL_RECIPE_MAP: Record<string, string> = {
  spring_festival: 'spring_roll',
  summer_lantern: 'lotus_lantern_cake',
  autumn_harvest: 'harvest_feast',
  winter_new_year: 'new_year_dumpling',
  yuan_ri: 'nian_gao',
  hua_chao: 'hua_gao',
  shang_si: 'qing_tuan',
  zhong_qiu: 'yue_bing',
  la_ba: 'la_ba_zhou',
  duan_wu: 'dragon_boat_zongzi',
  qi_xi: 'qiao_guo',
  chong_yang: 'chrysanthemum_wine',
  dong_zhi: 'jiaozi',
  nian_mo: 'tangyuan',
  dou_cha: 'dou_cha_yin',
  qiu_yuan: 'zhi_yuan_gao'
}

export interface SeasonEventEffectLike {
  id: string
  name: string
  description: string
  effects: {
    friendshipBonus?: number
    moneyReward?: number
    staminaBonus?: number
    itemReward?: readonly { itemId: string; quantity: number }[]
  }
}

export interface SeasonEventNpcStateLike {
  friendship: number
}

export interface SeasonEventEffectsEndDayInput<TEvent extends SeasonEventEffectLike> {
  event: TEvent
  getNpcStates: () => readonly SeasonEventNpcStateLike[]
  earnMoney: (amount: number) => void
  restoreStamina: (amount: number) => void
  addItem: (itemId: string, quantity: number) => unknown
  unlockRecipe: (recipeId: string) => boolean
  addLog: (message: string) => void
  showFloat: (message: string, type: 'accent' | 'success') => void
}

export interface SeasonEventEffectsEndDayResult {
  friendshipUpdatedCount: number
  itemRewardCount: number
  festivalRecipeUnlocked: boolean
}

export function processSeasonEventEffectsEndDay<TEvent extends SeasonEventEffectLike>({
  event,
  getNpcStates,
  earnMoney,
  restoreStamina,
  addItem,
  unlockRecipe,
  addLog,
  showFloat
}: SeasonEventEffectsEndDayInput<TEvent>): SeasonEventEffectsEndDayResult {
  const { effects } = event
  let friendshipUpdatedCount = 0

  if (effects.friendshipBonus) {
    for (const state of getNpcStates()) {
      state.friendship += effects.friendshipBonus
      friendshipUpdatedCount++
    }
  }
  if (effects.moneyReward) {
    earnMoney(effects.moneyReward)
    showFloat(`+${effects.moneyReward}文`, 'accent')
  }
  if (effects.staminaBonus) {
    restoreStamina(effects.staminaBonus)
    showFloat(`+${effects.staminaBonus}体力`, 'success')
  }

  const itemRewards = effects.itemReward ?? []
  for (const item of itemRewards) addItem(item.itemId, item.quantity)

  addLog(`【${event.name}】${event.description}`)

  const festivalRecipe = FESTIVAL_RECIPE_MAP[event.id]
  const festivalRecipeUnlocked = festivalRecipe !== undefined && unlockRecipe(festivalRecipe)
  if (festivalRecipeUnlocked) addLog('节日活动解锁了新食谱！')

  return {
    friendshipUpdatedCount,
    itemRewardCount: itemRewards.length,
    festivalRecipeUnlocked
  }
}

export interface SeasonEventEndDayInput<
  TFestivalType extends string,
  TEvent extends SeasonEventLike<TFestivalType>
> {
  event: TEvent | undefined
  year: number
  season: Season
  applyEventEffects: (event: TEvent) => void
  showFestival: (festivalType: TFestivalType) => void
  startFestivalBgm: (season: Season) => void
  showEvent: (event: TEvent, narrative: string[]) => void
}

export function processSeasonEventEndDay<
  TFestivalType extends string,
  TEvent extends SeasonEventLike<TFestivalType>
>({
  event,
  year,
  season,
  applyEventEffects,
  showFestival,
  startFestivalBgm,
  showEvent
}: SeasonEventEndDayInput<TFestivalType, TEvent>): boolean {
  if (!event) return false

  applyEventEffects(event)
  if (event.interactive && event.festivalType) {
    showFestival(event.festivalType)
  } else {
    startFestivalBgm(season)
  }

  const ordinals = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  const yearText = year <= ordinals.length ? ordinals[year - 1]! : String(year)
  const narrative = event.narrative.map(line => line.replace('{year}', yearText))
  showEvent(event, narrative)
  return true
}

export interface AchievementLike {
  name: string
  reward: {
    money?: number
  }
}

export interface AchievementEndDayInput<TAchievement extends AchievementLike> {
  checkAchievements: () => readonly TAchievement[]
  addLog: (message: string) => void
  showFloat: (message: string, type: 'accent') => void
  checkAchievementRecipes: () => void
  caveUnlocked: boolean
  totalMoneyEarned: number
  caveUnlockEarnings: number
  unlockCave: () => void
}

export interface AchievementEndDayResult {
  achievementCount: number
  caveUnlocked: boolean
}

export function processAchievementEndDay<TAchievement extends AchievementLike>({
  checkAchievements,
  addLog,
  showFloat,
  checkAchievementRecipes,
  caveUnlocked,
  totalMoneyEarned,
  caveUnlockEarnings,
  unlockCave
}: AchievementEndDayInput<TAchievement>): AchievementEndDayResult {
  const achievements = checkAchievements()
  for (const achievement of achievements) {
    addLog(
      `【成就达成】${achievement.name}！${achievement.reward.money ? `获得${achievement.reward.money}文` : ''}`
    )
    showFloat(`成就: ${achievement.name}`, 'accent')
  }

  checkAchievementRecipes()

  const shouldUnlockCave = !caveUnlocked && totalMoneyEarned >= caveUnlockEarnings
  if (shouldUnlockCave) {
    unlockCave()
    addLog('你的累计收入引起了注意……村后的山洞已为你开放！去设施面板选择山洞用途吧。')
  }

  return {
    achievementCount: achievements.length,
    caveUnlocked: shouldUnlockCave
  }
}
