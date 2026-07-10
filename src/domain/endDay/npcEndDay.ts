export interface WeddingUpdateResult {
  weddingToday: boolean
  npcId: string | null
}

export type PregnancyStage = 'early' | 'mid' | 'late' | 'ready'
export type BirthQuality = 'normal' | 'premature' | 'healthy'

export interface PregnancyUpdateResult {
  stageChanged?: { from: PregnancyStage; to: PregnancyStage }
  born?: { name: string; quality: BirthQuality }
  miscarriage?: boolean
}

export interface FamilyEndDayInput {
  dailyWeddingUpdate: () => WeddingUpdateResult
  getWeddingNpcName: (npcId: string) => string
  triggerWeddingEvent: (npcId: string) => void
  dailyPregnancyUpdate: () => PregnancyUpdateResult
  dailyChildUpdate: () => void
  checkChildProposal: () => boolean
  triggerChildProposal: () => void
  getSpouseName: () => string
  addLog: (message: string) => void
}

export interface FamilyEndDayResult {
  weddingTriggered: boolean
  birthLogged: boolean
  stageChangeLogged: boolean
  miscarriageLogged: boolean
  childProposalTriggered: boolean
}

const PREGNANCY_STAGE_LABELS: Record<PregnancyStage, string> = {
  early: '初期',
  mid: '中期',
  late: '后期',
  ready: '待产期'
}

function getBirthQualityMessage(quality: BirthQuality): string {
  if (quality === 'healthy') return '健健康康的！'
  if (quality === 'premature') return '虽然早产了一些，但平安无事。'
  return ''
}

export function processFamilyEndDay({
  dailyWeddingUpdate,
  getWeddingNpcName,
  triggerWeddingEvent,
  dailyPregnancyUpdate,
  dailyChildUpdate,
  checkChildProposal,
  triggerChildProposal,
  getSpouseName,
  addLog
}: FamilyEndDayInput): FamilyEndDayResult {
  const weddingResult = dailyWeddingUpdate()
  const weddingTriggered = weddingResult.weddingToday && weddingResult.npcId !== null
  if (weddingTriggered) {
    const npcId = weddingResult.npcId!
    addLog(`今天是你和${getWeddingNpcName(npcId)}的大喜之日！`)
    triggerWeddingEvent(npcId)
  }

  const pregnancyResult = dailyPregnancyUpdate()
  const birthLogged = pregnancyResult.born !== undefined
  if (pregnancyResult.born) {
    addLog(
      `${pregnancyResult.born.name}出生了！恭喜！${getBirthQualityMessage(pregnancyResult.born.quality)}`
    )
  }

  const stageChangeLogged = pregnancyResult.stageChanged !== undefined
  if (pregnancyResult.stageChanged) {
    addLog(`孕期进入${PREGNANCY_STAGE_LABELS[pregnancyResult.stageChanged.to]}。记得多多照顾配偶。`)
  }

  const miscarriageLogged = pregnancyResult.miscarriage === true
  if (miscarriageLogged) {
    addLog('很遗憾……这次没能迎来新生命。双方都需要一段时间来恢复。')
  }

  dailyChildUpdate()

  const childProposalTriggered = checkChildProposal()
  if (childProposalTriggered) {
    triggerChildProposal()
    addLog(`${getSpouseName()}似乎有话想和你说……`)
  }

  return {
    weddingTriggered,
    birthLogged,
    stageChangeLogged,
    miscarriageLogged,
    childProposalTriggered
  }
}

export interface EndDaySpouseState {
  npcId: string
  friendship: number
}

export interface DailyHelperResult {
  messages: string[]
  allFed: boolean
}

export interface AnimalFeedResult {
  fedCount: number
  noFeedCount: number
}

export interface AnimalFeedingAssistanceInput<TSpouse extends EndDaySpouseState> {
  processDailyHelpers: (tasks: ['feed']) => DailyHelperResult
  getSpouse: () => TSpouse | null
  feedAll: () => AnimalFeedResult
  getSpouseName: (npcId: string) => string
  addLog: (message: string) => void
  random?: () => number
}

export interface AnimalFeedingAssistanceResult<TSpouse extends EndDaySpouseState> {
  spouse: TSpouse | null
  helperFeedSuccess: boolean
  spouseFedSuccess: boolean
}

export function processAnimalFeedingAssistanceEndDay<TSpouse extends EndDaySpouseState>({
  processDailyHelpers,
  getSpouse,
  feedAll,
  getSpouseName,
  addLog,
  random = Math.random
}: AnimalFeedingAssistanceInput<TSpouse>): AnimalFeedingAssistanceResult<TSpouse> {
  const helperFeedResult = processDailyHelpers(['feed'])
  for (const message of helperFeedResult.messages) addLog(message)

  const spouse = getSpouse()
  let spouseFedSuccess = false

  if (spouse && !helperFeedResult.allFed) {
    const bonusChance = spouse.friendship >= 2500 ? 0.1 : 0
    if (random() < 0.4 + bonusChance) {
      const result = feedAll()
      if (result.fedCount > 0) {
        addLog(`${getSpouseName(spouse.npcId)}帮你喂了所有牲畜。`)
        spouseFedSuccess = result.noFeedCount === 0
      } else if (result.noFeedCount > 0) {
        addLog(`${getSpouseName(spouse.npcId)}想帮你喂牲畜，但草料不足。`)
      }
    }
  }

  return {
    spouse,
    helperFeedSuccess: helperFeedResult.allFed,
    spouseFedSuccess
  }
}

export interface ZhijiEndDayState {
  npcId: string
  friendship: number
}

export interface NpcFriendshipState {
  npcId: string
  friendship: number
}

export interface ZhijiBonusEndDayInput<
  TZhiji extends ZhijiEndDayState,
  TNpcState extends NpcFriendshipState
> {
  zhiji: TZhiji | null
  npcStates: readonly TNpcState[]
  getZhijiName: (npcId: string) => string
  addItem: (itemId: string, quantity?: number) => unknown
  getItemName: (itemId: string) => string | undefined
  feedAll: () => AnimalFeedResult
  restoreStamina: (amount: number) => unknown
  addLog: (message: string) => void
  random?: () => number
}

export interface ZhijiBonusEndDayResult {
  bonusTriggered: boolean
}

export function processZhijiBonusEndDay<
  TZhiji extends ZhijiEndDayState,
  TNpcState extends NpcFriendshipState
>({
  zhiji,
  npcStates,
  getZhijiName,
  addItem,
  getItemName,
  feedAll,
  restoreStamina,
  addLog,
  random = Math.random
}: ZhijiBonusEndDayInput<TZhiji, TNpcState>): ZhijiBonusEndDayResult {
  if (!zhiji) return { bonusTriggered: false }

  const zhijiName = getZhijiName(zhiji.npcId)
  const bonusChance = zhiji.friendship >= 2500 ? 0.15 : 0

  switch (zhiji.npcId) {
    case 'a_shi':
      if (random() < 0.3 + bonusChance) {
        const ores = ['copper_ore', 'iron_ore', 'gold_ore']
        const ore = ores[Math.floor(random() * ores.length)]!
        const quantity = 1 + Math.floor(random() * 3)
        addItem(ore, quantity)
        addLog(`${zhijiName}送来了${quantity}个${getItemName(ore) ?? '矿石'}。`)
        return { bonusTriggered: true }
      }
      break
    case 'dan_qing':
      if (random() < 0.2 + bonusChance) {
        for (const npcState of npcStates) {
          if (npcState.npcId !== zhiji.npcId) npcState.friendship += 5
        }
        addLog(`${zhijiName}在村里替你美言了几句。(全村+5好感)`)
        return { bonusTriggered: true }
      }
      break
    case 'a_tie':
      if (random() < 0.3 + bonusChance) {
        const materials = ['iron_ore', 'copper_ore', 'charcoal']
        const material = materials[Math.floor(random() * materials.length)]!
        addItem(material, 2)
        addLog(`${zhijiName}送来了一些打铁的材料。`)
        return { bonusTriggered: true }
      }
      break
    case 'yun_fei':
      if (random() < 0.3 + bonusChance) {
        const items = ['wild_mushroom', 'herb', 'pine_cone']
        const item = items[Math.floor(random() * items.length)]!
        addItem(item)
        addLog(`${zhijiName}从山里带回了${getItemName(item) ?? '东西'}。`)
        return { bonusTriggered: true }
      }
      break
    case 'da_niu':
      if (random() < 0.3 + bonusChance) {
        const result = feedAll()
        if (result.fedCount > 0) addLog(`${zhijiName}帮你喂了所有牲畜。`)
        return { bonusTriggered: true }
      }
      break
    case 'mo_bai':
      if (random() < 0.25 + bonusChance) {
        restoreStamina(15)
        addLog(`${zhijiName}弹了一曲舒缓的琴音，你感觉精神好了些。(+15体力)`)
        return { bonusTriggered: true }
      }
      break
    case 'liu_niang':
      if (random() < 0.2 + bonusChance) {
        for (const npcState of npcStates) {
          if (npcState.npcId !== zhiji.npcId) npcState.friendship += 5
        }
        addLog(`${zhijiName}在村里替你说了好话。(全村+5好感)`)
        return { bonusTriggered: true }
      }
      break
    case 'qiu_yue':
      if (random() < 0.3 + bonusChance) {
        const fish = ['crucian', 'carp', 'grass_carp', 'bass']
        const selectedFish = fish[Math.floor(random() * fish.length)]!
        addItem(selectedFish)
        addLog(`${zhijiName}送来了一条${getItemName(selectedFish) ?? '鱼'}。`)
        return { bonusTriggered: true }
      }
      break
    case 'chun_lan':
      if (random() < 0.25 + bonusChance) {
        addItem('green_tea_drink')
        addLog(`${zhijiName}送来了一壶好茶。`)
        return { bonusTriggered: true }
      }
      break
    case 'xue_qin':
      if (random() < 0.15 + bonusChance) {
        addItem('bamboo')
        addLog(`${zhijiName}送来了一捆竹子。`)
        return { bonusTriggered: true }
      }
      break
    case 'su_su':
      if (random() < 0.25 + bonusChance) {
        const cloths = ['cloth', 'silk_cloth', 'felt']
        const cloth = cloths[Math.floor(random() * cloths.length)]!
        addItem(cloth)
        addLog(`${zhijiName}送来了一匹${getItemName(cloth) ?? '布料'}。`)
        return { bonusTriggered: true }
      }
      break
    case 'hong_dou':
      if (random() < 0.3 + bonusChance) {
        const wines = ['peach_wine', 'jujube_wine', 'corn_wine']
        const wine = wines[Math.floor(random() * wines.length)]!
        addItem(wine)
        addLog(`${zhijiName}送来了一壶${getItemName(wine) ?? '酒'}。`)
        return { bonusTriggered: true }
      }
      break
  }

  return { bonusTriggered: false }
}

export interface MorningFarmPlot {
  id: number
  state: string
  watered: boolean
}

export interface MorningHarvestResult {
  cropId: string | null
}

export interface MorningAssistanceInput<TSpouse extends EndDaySpouseState> {
  spouse: TSpouse | null
  spouseFedSuccess: boolean
  hasFeedHelper: () => boolean
  markAllFed: () => void
  processDailyHelpers: (tasks: ['water', 'harvest', 'weed']) => DailyHelperResult
  getPlots: () => readonly MorningFarmPlot[]
  waterPlot: (plotId: number) => unknown
  harvestPlot: (plotId: number) => MorningHarvestResult
  isInventoryFull: () => boolean
  addItem: (itemId: string, quantity?: number, quality?: 'normal') => unknown
  getSpouseName: (npcId: string) => string
  getItemName: (itemId: string) => string | undefined
  addLog: (message: string) => void
  random?: () => number
}

export interface MorningAssistanceResult {
  markedAllFed: boolean
  helperMessageCount: number
  spouseWateredCount: number
  spouseCookedItemId: string | null
  spouseHarvestedCount: number
}

const SPOUSE_COOKED_FOOD_IDS = [
  'food_rice_ball',
  'food_congee',
  'food_steamed_bun',
  'food_honey_tea',
  'food_stir_fry',
  'food_dumpling'
] as const

export function processMorningAssistanceEndDay<TSpouse extends EndDaySpouseState>({
  spouse,
  spouseFedSuccess,
  hasFeedHelper,
  markAllFed,
  processDailyHelpers,
  getPlots,
  waterPlot,
  harvestPlot,
  isInventoryFull,
  addItem,
  getSpouseName,
  getItemName,
  addLog,
  random = Math.random
}: MorningAssistanceInput<TSpouse>): MorningAssistanceResult {
  const markedAllFed = hasFeedHelper() || spouseFedSuccess
  if (markedAllFed) markAllFed()

  const helperMorningResult = processDailyHelpers(['water', 'harvest', 'weed'])
  for (const message of helperMorningResult.messages) addLog(message)

  let spouseWateredCount = 0
  let spouseCookedItemId: string | null = null
  let spouseHarvestedCount = 0

  if (spouse) {
    const spouseName = getSpouseName(spouse.npcId)
    const bonusChance = spouse.friendship >= 2500 ? 0.1 : 0
    const highBond = spouse.friendship >= 3000 ? 0.15 : 0

    if (random() < 0.5 + bonusChance + highBond) {
      const unwatered = getPlots().filter(
        plot => (plot.state === 'planted' || plot.state === 'growing') && !plot.watered
      )
      spouseWateredCount = Math.min(unwatered.length, 3 + Math.floor(random() * 4))
      for (let index = 0; index < spouseWateredCount; index++) {
        waterPlot(unwatered[index]!.id)
      }
      if (spouseWateredCount > 0) {
        addLog(`${spouseName}一早帮你浇了${spouseWateredCount}块地。`)
      }
    }

    if (spouse.friendship >= 2000 && random() < 0.3 + bonusChance) {
      spouseCookedItemId =
        SPOUSE_COOKED_FOOD_IDS[Math.floor(random() * SPOUSE_COOKED_FOOD_IDS.length)]!
      addItem(spouseCookedItemId)
      addLog(`${spouseName}一早做了一份${getItemName(spouseCookedItemId) ?? '食物'}。`)
    }

    if (spouse.friendship >= 3000 && !isInventoryFull() && random() < 0.3 + bonusChance) {
      const harvestable = getPlots().filter(plot => plot.state === 'harvestable')
      const harvestCount = Math.min(harvestable.length, 3)
      for (let index = 0; index < harvestCount; index++) {
        if (isInventoryFull()) break
        const result = harvestPlot(harvestable[index]!.id)
        if (result.cropId) {
          addItem(result.cropId, 1, 'normal')
          spouseHarvestedCount++
        }
      }
      if (spouseHarvestedCount > 0) {
        addLog(`${spouseName}一早帮你收了${spouseHarvestedCount}块地的庄稼。`)
      }
    }
  }

  return {
    markedAllFed,
    helperMessageCount: helperMorningResult.messages.length,
    spouseWateredCount,
    spouseCookedItemId,
    spouseHarvestedCount
  }
}
