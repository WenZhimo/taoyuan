import { useGameStore, SEASON_NAMES, WEATHER_NAMES } from '@/stores/useGameStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useFarmStore } from '@/stores/useFarmStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useSaveStore } from '@/stores/useSaveStore'
import { useSkillStore } from '@/stores/useSkillStore'
import { useNpcStore } from '@/stores/useNpcStore'
import { useCookingStore } from '@/stores/useCookingStore'
import { useProcessingStore } from '@/stores/useProcessingStore'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { useHomeStore } from '@/stores/useHomeStore'
import { useWalletStore } from '@/stores/useWalletStore'
import { useShopStore } from '@/stores/useShopStore'
import { useQuestStore } from '@/stores/useQuestStore'
import { useFishingStore } from '@/stores/useFishingStore'
import { useBreedingStore } from '@/stores/useBreedingStore'
import { useHanhaiStore } from '@/stores/useHanhaiStore'
import { useFishPondStore } from '@/stores/useFishPondStore'
import { useTutorialStore } from '@/stores/useTutorialStore'
import { useHiddenNpcStore } from '@/stores/useHiddenNpcStore'
import { useMiningStore } from '@/stores/useMiningStore'
import { useWarehouseStore } from '@/stores/useWarehouseStore'
import { getItemById, getTodayEvent, getNpcById, getCropById, getForageItems } from '@/data'
import { getFertilizerById } from '@/data/processing'
import { RECIPES } from '@/data/recipes'
import { CAVE_UNLOCK_EARNINGS } from '@/data/buildings'
import { TOOL_NAMES, TIER_NAMES } from '@/data/upgrades'
import { addLog, showFloat } from './useGameLog'
import { getDailyMarketInfo, getMarketCategoryName } from '@/data/market'
import { showEvent, showFestival, triggerWeddingEvent, triggerPetAdoption, showFarmEvent, showDiscoveryScene } from './useDialogs'
import { sfxSleep, useAudio } from './useAudio'
import {
  getMorningChoiceEvents,
  getMorningEasterEggs,
  getMorningNarrations,
  getNoLossMorningNarrations
} from '@/data/farmEvents'
import { TAB_TO_LOCATION_GROUP, getLocationGroupName } from '@/data/timeConstants'
import { getResourceSleepOptionsForLocation } from '@/domain/sleep/sleepOptions'
import { getOfficialFishDefsAsLegacy, getOfficialMorningTipsAsLegacy } from '@/domain/mods/contentAccess'
import { processFishPondEndDay } from '@/domain/endDay/fishPondEndDay'
import { processCaveEndDay } from '@/domain/endDay/caveEndDay'
import { processFarmPlotEndDay, processFarmTreeEndDay } from '@/domain/endDay/farmEndDay'
import { processGreenhouseEndDay } from '@/domain/endDay/greenhouseEndDay'
import {
  processBreedingEndDay,
  processCellarEndDay,
  processToolUpgradeEndDay,
  processWorkshopEndDay
} from '@/domain/endDay/processingEndDay'
import {
  processAchievementEndDay,
  processMorningTutorialEndDay,
  processOldDateEndDay,
  processSeasonEventEndDay,
  processSeasonEventEffectsEndDay,
  processWeatherMarketEndDay
} from '@/domain/endDay/eventsEndDay'
import {
  processAnimalIncubatorsEndDay,
  processAnimalProductionEndDay,
  processPetEndDay
} from '@/domain/endDay/animalEndDay'
import {
  processAnimalFeedingAssistanceEndDay,
  processFamilyEndDay,
  processMorningAssistanceEndDay,
  processZhijiBonusEndDay
} from '@/domain/endDay/npcEndDay'
import { processFarmMapEndDay } from '@/domain/endDay/farmMapEndDay'
import {
  processAchievementRecipeUnlocks,
  processDailyRecipeUnlocks
} from '@/domain/endDay/recipeEndDay'
import { processMorningRandomEventEndDay } from '@/domain/endDay/morningEventEndDay'
import { processSeasonChangeEndDay } from '@/domain/endDay/seasonEndDay'
import type { LocationGroup } from '@/types'
import router from '@/router'

interface EndDayOptions {
  wakePanel?: string
  wakeLocationGroup?: LocationGroup
  forceRecoveryMode?: 'normal' | 'late' | 'passout'
}

const SLEEPING_BAG_ITEM_ID = 'sleeping_bag'

const hasSleepingBag = (): boolean => {
  const inventoryStore = useInventoryStore()
  if (inventoryStore.hasCarriedItem(SLEEPING_BAG_ITEM_ID)) return true

  const warehouseStore = useWarehouseStore()
  return warehouseStore.chests.some(chest => chest.items.some(item => item.itemId === SLEEPING_BAG_ITEM_ID && item.quantity > 0))
}

export const getResourceSleepOptions = (): EndDayOptions | null => {
  const gameStore = useGameStore()
  const routeName = router.currentRoute.value.name
  const routeGroup = typeof routeName === 'string' ? (TAB_TO_LOCATION_GROUP[routeName] ?? null) : null
  return getResourceSleepOptionsForLocation({
    routeLocationGroup: routeGroup,
    currentLocationGroup: gameStore.currentLocationGroup,
    hasSleepingBag: hasSleepingBag()
  })
}

export const handleSleepOrPassOut = (): boolean => {
  const sleepOptions = getResourceSleepOptions()
  if (sleepOptions?.wakeLocationGroup) {
    addLog(`撑到深夜，你在${getLocationGroupName(sleepOptions.wakeLocationGroup)}铺开睡袋过夜。`)
    handleEndDay(sleepOptions)
    return true
  }
  handleEndDay()
  return false
}

export const handleAdvanceTimeResult = (result: { passedOut: boolean; message: string }): boolean => {
  const shouldUseSleepingBag = result.passedOut && !!getResourceSleepOptions()
  if (result.message && !shouldUseSleepingBag) addLog(result.message)
  if (!result.passedOut) return false
  handleSleepOrPassOut()
  return true
}

/** 日结算处理 */
export const handleEndDay = (options: EndDayOptions = {}) => {
  sfxSleep()

  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const inventoryStore = useInventoryStore()
  const saveStore = useSaveStore()
  const npcStore = useNpcStore()
  const cookingStore = useCookingStore()
  const processingStore = useProcessingStore()
  const achievementStore = useAchievementStore()
  const animalStore = useAnimalStore()
  const homeStore = useHomeStore()
  const questStore = useQuestStore()
  const skillStore = useSkillStore()
  const tutorialStore = useTutorialStore()
  const resolvedOptions = options.wakeLocationGroup ? options : (getResourceSleepOptions() ?? options)

  // 新手引导：记录体力低标记（在 dailyReset 之前）
  if (playerStore.stamina < 20) tutorialStore.setFlag('staminaWasLow')

  // 恢复模式
  let recoveryMode: 'normal' | 'late' | 'passout'
  if (resolvedOptions.forceRecoveryMode) {
    recoveryMode = resolvedOptions.forceRecoveryMode
  } else if (playerStore.stamina <= 0 || gameStore.hour >= 26) {
    recoveryMode = 'passout'
  } else if (gameStore.hour >= 24) {
    recoveryMode = 'late'
  } else {
    recoveryMode = 'normal'
  }

  // 矿洞结算：睡袋过夜保留探索进度，普通睡觉/晕厥则离开矿洞
  const miningStore = useMiningStore()
  if (miningStore.isExploring) {
    if (resolvedOptions.wakeLocationGroup === 'mine') miningStore.clearCombatForSleep()
    else miningStore.leaveMine()
  }

  const farmPlotEndDay = processFarmPlotEndDay({
    isRainy: gameStore.isRainy,
    scarecrowCount: farmStore.scarecrows,
    dailyUpdate: farmStore.dailyUpdate
  })
  const workshopEndDay = processWorkshopEndDay({
    dailyWorkshopUpdate: processingStore.dailyUpdate
  })
  for (const msg of workshopEndDay.logs) addLog(msg)

  // 育种台进度更新
  const breedingStore = useBreedingStore()
  const breedingEndDay = processBreedingEndDay({
    dailyBreedingUpdate: breedingStore.dailyUpdate
  })
  for (const msg of breedingEndDay.logs) addLog(msg)

  // 戒指效果：作物生长加速
  const ringGrowthBonus = inventoryStore.getRingEffectValue('crop_growth_bonus')
  const walletGrowthBonus = useWalletStore().getCropGrowthBonus()
  if (ringGrowthBonus > 0) {
    for (const plot of farmStore.plots) {
      if ((plot.state === 'growing' || plot.state === 'planted') && plot.watered) {
        plot.growthDays += ringGrowthBonus
        const crop = getCropById(plot.cropId!)
        if (crop) {
          const fertDef = plot.fertilizer ? getFertilizerById(plot.fertilizer) : null
          const speedup = (fertDef?.growthSpeedup ?? 0) + walletGrowthBonus
          const effectiveDays = Math.max(1, Math.floor(crop.growthDays * (1 - speedup)))
          if (plot.growthDays >= effectiveDays) {
            plot.state = 'harvestable'
          }
        }
      }
    }
  }

  // 绿雨额外效果：作物加速生长 + 野树加速
  if (gameStore.weather === 'green_rain') {
    for (const plot of farmStore.plots) {
      if ((plot.state === 'growing' || plot.state === 'planted') && plot.watered) {
        plot.growthDays += 0.5
        const crop = getCropById(plot.cropId!)
        if (crop) {
          const fertDef = plot.fertilizer ? getFertilizerById(plot.fertilizer) : null
          const speedup = (fertDef?.growthSpeedup ?? 0) + walletGrowthBonus
          const effectiveDays = Math.max(1, Math.floor(crop.growthDays * (1 - speedup)))
          if (plot.growthDays >= effectiveDays) {
            plot.state = 'harvestable'
          }
        }
      }
    }
    for (const tree of farmStore.wildTrees) {
      if (!tree.mature) {
        tree.growthDays += 1
      }
    }
    addLog('绿雨滋润了大地，作物和树木生长加速！')
  }

  // 工具升级进度
  const toolUpgradeEndDay = processToolUpgradeEndDay({
    dailyUpgradeUpdate: inventoryStore.dailyUpgradeUpdate,
    getToolName: toolType => TOOL_NAMES[toolType],
    getTierName: tier => TIER_NAMES[tier]
  })
  for (const msg of toolUpgradeEndDay.logs) addLog(msg)

  // 乌鸦袭击（在其他日常处理前）
  const crowResult = farmStore.crowAttack()
  if (crowResult.attacked) {
    addLog(`乌鸦袭击了你的农场，一株${crowResult.cropName}被吃掉了！放个稻草人保护作物吧。`)
  }

  // 虫害和杂草日志
  for (const msg of farmPlotEndDay.logs) addLog(msg)

  processMorningRandomEventEndDay({
    narrations: getMorningNarrations(),
    noLossNarrations: getNoLossMorningNarrations(),
    choiceEvents: getMorningChoiceEvents(),
    easterEggs: getMorningEasterEggs(),
    getPlots: () => farmStore.plots,
    getNpcStates: () => npcStore.npcStates,
    getCropName: cropId => getCropById(cropId)?.name,
    addItem: inventoryStore.addItem,
    earnMoney: playerStore.earnMoney,
    showChoiceEvent: showFarmEvent,
    addLog
  })

  // 巨型作物检查
  const giantCrops = farmStore.checkGiantCrops()
  for (const gc of giantCrops) {
    addLog(`巨型${gc.cropName}出现了！3×3的作物合体成了巨型作物！`)
  }

  // 雇工喂食结算（必须在 animalStore.dailyUpdate 之前，确保喂食状态生效）
  // 每天仅消耗一次草料：此处喂食用于过夜检查，dailyUpdate 后用 markAllFed 标记新一天
  const animalFeedingAssistance = processAnimalFeedingAssistanceEndDay({
    processDailyHelpers: npcStore.processDailyHelpers,
    getSpouse: npcStore.getSpouse,
    feedAll: animalStore.feedAll,
    getSpouseName: npcId => getNpcById(npcId)?.name ?? '配偶',
    addLog
  })
  const { spouse, spouseFedSuccess } = animalFeedingAssistance

  // 知己每日加成（在 dailyReset 之前）
  processZhijiBonusEndDay({
    zhiji: npcStore.getZhiji(),
    npcStates: npcStore.npcStates,
    getZhijiName: npcId => getNpcById(npcId)?.name ?? '知己',
    addItem: inventoryStore.addItem,
    getItemName: itemId => getItemById(itemId)?.name,
    feedAll: animalStore.feedAll,
    restoreStamina: playerStore.restoreStamina,
    addLog
  })

  const hanhaiStore = useHanhaiStore()
  const hiddenNpcStore = useHiddenNpcStore()
  const shopStore = useShopStore()
  processOldDateEndDay({
    dailyNpcReset: npcStore.dailyReset,
    dailyCookingReset: cookingStore.dailyReset,
    resetDailyBets: hanhaiStore.resetDailyBets,
    hanhaiUnlocked: hanhaiStore.unlocked,
    dailyTradeUpdate: hanhaiStore.dailyTradeUpdate,
    getItemName: itemId => getItemById(itemId)?.name ?? itemId,
    checkDiscoveryConditions: hiddenNpcStore.checkDiscoveryConditions,
    showDiscoveryScene,
    dailyHiddenNpcReset: hiddenNpcStore.dailyReset,
    checkAbilityUnlocks: hiddenNpcStore.checkAbilityUnlocks,
    isAbilityActive: hiddenNpcStore.isAbilityActive,
    getBonusMaxStamina: () => playerStore.bonusMaxStamina,
    addBonusMaxStamina: playerStore.addBonusMaxStamina,
    processShippingBox: shopStore.processShippingBox,
    earnMoney: playerStore.earnMoney,
    dailyQuestUpdate: questStore.dailyUpdate,
    updateMainQuestProgress: questStore.updateMainQuestProgress,
    addLog
  })

  // === 日期推进 ===
  const { seasonChanged, oldSeason } = gameStore.nextDay()

  // === 晨间结算（新日期） ===

  // 瀚海轮换商品刷新（使用新日期，每周首日或首次加载时刷新）
  if (hanhaiStore.unlocked && (gameStore.day % 7 === 1 || hanhaiStore.weeklyRotatingStock.length === 0)) {
    hanhaiStore.refreshRotatingStock()
  }

  // 动物产出
  const animalProductionEndDay = processAnimalProductionEndDay({
    dailyUpdate: animalStore.dailyUpdate,
    addItem: inventoryStore.addItem
  })
  for (const msg of animalProductionEndDay.logs) addLog(msg)

  // 晨间标记：dailyUpdate 已重置 wasFed，若有喂食雇工或配偶喂食成功则标记新一天已喂食（不再消耗草料）
  processMorningAssistanceEndDay({
    spouse,
    spouseFedSuccess,
    hasFeedHelper: () => npcStore.hiredHelpers.some(helper => helper.task === 'feed'),
    markAllFed: animalStore.markAllFed,
    processDailyHelpers: npcStore.processDailyHelpers,
    getPlots: () => farmStore.plots,
    waterPlot: farmStore.waterPlot,
    harvestPlot: farmStore.harvestPlot,
    isInventoryFull: () => inventoryStore.isFull,
    addItem: inventoryStore.addItem,
    getSpouseName: npcId => getNpcById(npcId)?.name ?? '配偶',
    getItemName: itemId => getItemById(itemId)?.name,
    addLog
  })

  // 孵化器更新
  const animalIncubatorsEndDay = processAnimalIncubatorsEndDay({
    dailyIncubatorUpdate: animalStore.dailyIncubatorUpdate,
    dailyBarnIncubatorUpdate: animalStore.dailyBarnIncubatorUpdate
  })
  for (const msg of animalIncubatorsEndDay.logs) addLog(msg)

  // 宠物每日更新
  const petEndDay = processPetEndDay({
    dailyPetUpdate: animalStore.dailyPetUpdate,
    getPetName: () => animalStore.pet?.name ?? '宠物',
    getItemName: itemId => getItemById(itemId)?.name ?? itemId
  })
  for (const msg of petEndDay.logs) addLog(msg)

  // 鱼塘每日更新
  const fishPondStore = useFishPondStore()
  const fishPondEndDay = processFishPondEndDay({
    pondBuilt: fishPondStore.pond.built,
    dailyUpdate: fishPondStore.dailyUpdate,
    addItem: inventoryStore.addItem
  })
  for (const msg of fishPondEndDay.logs) addLog(msg)

  // 蟹笼装饵雇工结算（在收获之前）
  const helperBaitResult = npcStore.processDailyHelpers(['bait'])
  for (const msg of helperBaitResult.messages) addLog(msg)

  // 蟹笼收获
  const fishingStore = useFishingStore()
  const crabPotHarvest = fishingStore.collectCrabPots()
  if (crabPotHarvest.length > 0) {
    const names = crabPotHarvest.map(c => c.name).join('、')
    addLog(`蟹笼捕获了${names}。`)
  }

  // 洞穴产出
  const caveEndDay = processCaveEndDay({
    caveChoice: homeStore.caveChoice,
    incrementActiveDays: () => {
      homeStore.caveDaysActive++
    },
    dailyCaveUpdate: homeStore.dailyCaveUpdate,
    addItem: inventoryStore.addItem,
    getItemName: itemId => getItemById(itemId)?.name ?? itemId
  })
  for (const msg of caveEndDay.logs) addLog(msg)

  // 果树和野生树木更新
  const farmTreeEndDay = processFarmTreeEndDay({
    season: gameStore.season,
    dailyFruitTreeUpdate: farmStore.dailyFruitTreeUpdate,
    dailyWildTreeUpdate: farmStore.dailyWildTreeUpdate,
    addItem: inventoryStore.addItem
  })
  for (const msg of farmTreeEndDay.logs) addLog(msg)

  // 温室更新
  processGreenhouseEndDay({
    greenhouseUnlocked: homeStore.greenhouseUnlocked,
    dailyUpdate: farmStore.greenhouseDailyUpdate
  })

  // 酒窖更新
  const cellarEndDay = processCellarEndDay({
    farmhouseLevel: homeStore.farmhouseLevel,
    cellarValuePerCycle: homeStore.cellarValuePerCycle,
    dailyCellarUpdate: homeStore.dailyCellarUpdate,
    getItemName: itemId => getItemById(itemId)?.name ?? itemId
  })
  for (const msg of cellarEndDay.logs) addLog(msg)

  // 钱包解锁检查
  const walletStore = useWalletStore()
  const newWalletItems = walletStore.checkAndUnlock()
  for (const name of newWalletItems) {
    addLog(`解锁了钱袋物品：${name}！`)
  }

  processFamilyEndDay({
    dailyWeddingUpdate: npcStore.dailyWeddingUpdate,
    getWeddingNpcName: npcId => getNpcById(npcId)?.name ?? '心上人',
    triggerWeddingEvent,
    dailyPregnancyUpdate: npcStore.dailyPregnancyUpdate,
    dailyChildUpdate: npcStore.dailyChildUpdate,
    checkChildProposal: npcStore.checkChildProposal,
    triggerChildProposal: npcStore.triggerChildProposal,
    getSpouseName: () => getNpcById(npcStore.getSpouse()?.npcId ?? '')?.name ?? '配偶',
    addLog
  })

  // 为新的一天生成委托（在 nextDay 之后，使用新季节和新日期）
  questStore.generateDailyQuests(gameStore.season, gameStore.day)

  // 每7天生成一个特殊订单 (第7/14/21/28天, 梯度递增)
  const specialOrderDays: Record<number, number> = { 7: 1, 14: 2, 21: 3, 28: 4 }
  const tier = specialOrderDays[gameStore.day]
  if (tier && !questStore.specialOrder) {
    questStore.generateSpecialOrder(gameStore.season, tier)
  }

  // 新一天如果下雨，立即浇水所有作物（让玩家看到已浇水状态）
  if (gameStore.isRainy) {
    for (const plot of farmStore.plots) {
      if (plot.state === 'planted' || plot.state === 'growing') {
        plot.watered = true
        plot.unwateredDays = 0
      }
    }
  }

  const bedHour = gameStore.hour
  const { moneyLost, recoveryPct } = playerStore.dailyReset(recoveryMode, bedHour)

  // 仙灵结缘每日奖励（必须在 dailyReset 之后，否则 stamina_restore 会被覆盖）
  const bondMessages = hiddenNpcStore.dailyBondBonus()
  for (const msg of bondMessages.messages) addLog(msg)

  let summary: string
  if (recoveryMode === 'passout') {
    summary =
      moneyLost > 0
        ? `你体力耗尽倒下了……有人把你送回家。丢失了${moneyLost}文。次日仅恢复50%体力。`
        : `你体力耗尽倒下了……次日仅恢复50%体力。`
  } else if (recoveryMode === 'late') {
    const pct = Math.round(recoveryPct * 100)
    summary = `你熬夜到很晚才睡……次日仅恢复${pct}%体力。`
  } else {
    summary = '美好的一天结束了。'
  }

  addLog(summary)

  // 换季处理
  processSeasonChangeEndDay({
    seasonChanged,
    oldSeason,
    newSeason: gameStore.season,
    farmMapType: gameStore.farmMapType,
    getFarmingLevel: () => skillStore.getSkill('farming').level,
    onSeasonChange: farmStore.onSeasonChange,
    getSeasonName: season => SEASON_NAMES[season],
    fruitTreeSeasonUpdate: farmStore.fruitTreeSeasonUpdate,
    applyFertileSoil: farmStore.applyFertileSoil,
    setTutorialFlag: tutorialStore.setFlag,
    addLog
  })

  processWeatherMarketEndDay({
    weather: gameStore.weather,
    isRainy: gameStore.isRainy,
    tomorrowWeatherName: WEATHER_NAMES[gameStore.tomorrowWeather],
    seasonChanged,
    day: gameStore.day,
    season: gameStore.season,
    lightningStrike: farmStore.lightningStrike,
    addItem: itemId => inventoryStore.addItem(itemId),
    getPlots: () => farmStore.plots,
    getCropSeasons: cropId => getCropById(cropId)?.season,
    getSeasonName: season => SEASON_NAMES[season],
    getMarketInfo: () =>
      getDailyMarketInfo(gameStore.year, gameStore.seasonIndex, gameStore.day, shopStore.getRecentShipping()),
    getMarketCategoryName,
    addLog,
    showFloat
  })

  processMorningTutorialEndDay({
    enabled: tutorialStore.enabled,
    year: gameStore.year,
    day: gameStore.day,
    season: gameStore.season,
    isRainy: gameStore.isRainy,
    tips: getOfficialMorningTipsAsLegacy(),
    getPlots: () => farmStore.plots,
    getSprinklerCount: () => farmStore.sprinklers.length,
    getAnimalCount: () => animalStore.animals.length,
    totalCropsHarvested: achievementStore.stats.totalCropsHarvested,
    totalMoneyEarned: achievementStore.stats.totalMoneyEarned,
    totalFishCaught: achievementStore.stats.totalFishCaught,
    highestMineFloor: achievementStore.stats.highestMineFloor,
    totalRecipesCooked: achievementStore.stats.totalRecipesCooked,
    areAllNpcFriendshipsZero: () => npcStore.npcStates.every(npc => npc.friendship === 0),
    isTipShown: tutorialStore.isTipShown,
    markTipShown: tutorialStore.markTipShown,
    hasPanelVisited: tutorialStore.hasPanelVisited,
    getFlag: tutorialStore.getFlag,
    setFlag: tutorialStore.setFlag,
    addLog
  })

  processDailyRecipeUnlocks({
    getFriendshipLevel: npcStore.getFriendshipLevel,
    getSpouse: npcStore.getSpouse,
    recipes: RECIPES,
    getSkillLevel: skillType => skillStore.getSkill(skillType).level,
    hasItem: inventoryStore.hasItem,
    unlockRecipe: cookingStore.unlockRecipe,
    addLog
  })

  processSeasonEventEndDay({
    event: getTodayEvent(gameStore.season, gameStore.day),
    year: gameStore.year,
    season: gameStore.season,
    applyEventEffects: event =>
      processSeasonEventEffectsEndDay({
        event,
        getNpcStates: () => npcStore.npcStates,
        earnMoney: playerStore.earnMoney,
        restoreStamina: playerStore.restoreStamina,
        addItem: inventoryStore.addItem,
        unlockRecipe: cookingStore.unlockRecipe,
        addLog,
        showFloat
      }),
    showFestival,
    startFestivalBgm: season => useAudio().startFestivalBgm(season),
    showEvent: (event, narrative) => showEvent({ ...event, narrative })
  })

  processAchievementEndDay({
    checkAchievements: achievementStore.checkAchievements,
    addLog,
    showFloat,
    checkAchievementRecipes: () =>
      processAchievementRecipeUnlocks({
        stats: achievementStore.stats,
        discoveredCount: achievementStore.discoveredCount,
        getFriendshipLevel: npcStore.getFriendshipLevel,
        isDiscovered: achievementStore.isDiscovered,
        unlockRecipe: cookingStore.unlockRecipe,
        addLog
      }),
    caveUnlocked: homeStore.caveUnlocked,
    totalMoneyEarned: achievementStore.stats.totalMoneyEarned,
    caveUnlockEarnings: CAVE_UNLOCK_EARNINGS,
    unlockCave: homeStore.unlockCave
  })

  processFarmMapEndDay({
    farmMapType: gameStore.farmMapType,
    year: gameStore.year,
    isRainy: gameStore.isRainy,
    getCombatLevel: () => skillStore.getSkill('combat').level,
    addSkillExp: skillStore.addExp,
    rollForageQuality: skillStore.rollForageQuality,
    addItem: inventoryStore.addItem,
    takeDamage: playerStore.takeDamage,
    getPlots: () => farmStore.plots,
    removeCrop: farmStore.removeCrop,
    getCropName: cropId => getCropById(cropId)?.name,
    getItemName: itemId => getItemById(itemId)?.name,
    getForageItems: () => getForageItems(gameStore.season),
    getSeasonFish: () =>
      getOfficialFishDefsAsLegacy().filter(
        fish =>
          (fish.location ?? 'creek') === 'creek' &&
          fish.season.includes(gameStore.season as (typeof fish.season)[number])
      ),
    hasSurfaceOrePatch: () => gameStore.surfaceOrePatch !== null,
    setSurfaceOrePatch: patch => {
      gameStore.surfaceOrePatch = patch
    },
    getCreekCatch: () => gameStore.creekCatch,
    setCreekCatch: catches => {
      gameStore.creekCatch = catches
    },
    addLog
  })

  // 宠物领养触发（春季第一年第7天起，每天检查直到领养）
  if (gameStore.day >= 7 && gameStore.year === 1 && gameStore.season === 'spring' && !animalStore.pet) {
    triggerPetAdoption()
  }

  if (resolvedOptions.wakeLocationGroup) {
    gameStore.currentLocationGroup = resolvedOptions.wakeLocationGroup
  }

  // 回到指定页面（默认农场，防止留在商铺等页面继续操作）
  void router.push({ name: resolvedOptions.wakePanel ?? 'farm' })

  // 自动存档
  void saveStore.autoSave()
}

export const useEndDay = () => {
  return { handleEndDay }
}
