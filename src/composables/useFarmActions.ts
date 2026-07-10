import { ref } from 'vue'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { useBreedingStore } from '@/stores/useBreedingStore'
import { useCookingStore } from '@/stores/useCookingStore'
import { useFarmStore } from '@/stores/useFarmStore'
import { useGameStore } from '@/stores/useGameStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useQuestStore } from '@/stores/useQuestStore'
import { useShopStore } from '@/stores/useShopStore'
import { useSkillStore } from '@/stores/useSkillStore'
import { useWalletStore } from '@/stores/useWalletStore'
import { useHiddenNpcStore } from '@/stores/useHiddenNpcStore'
import { getCropById, getItemById } from '@/data'
import { getFertilizerById } from '@/data/processing'
import { ACTION_TIME_COSTS } from '@/data/timeConstants'
import type { Quality, ItemCategory } from '@/types'
import type { SeedGenetics } from '@/types/breeding'
import type { FertilizerType } from '@/types/processing'
import type { ChunkedBatchOptions, ChunkedBatchResult } from './farm/useFarmBatchUi'
import { shouldReturnBreedingSeed, generateGeneticsId } from '@/data/breeding'
import { FARM_BATCH_LIMIT } from '@/domain/farm/batchLimits'
import { addLog, showFloat } from './useGameLog'
import { handleEndDay } from './useEndDay'
import { sfxDig, sfxPlant, sfxWater, sfxHarvest, sfxLevelUp, sfxBuy, sfxCoin } from './useAudio'

export const QUALITY_NAMES: Record<Quality, string> = {
  normal: '普通',
  fine: '优良',
  excellent: '精品',
  supreme: '极品'
}

/** 仙缘结缘：作物祝福（crop_blessing）概率品质+1 */
const QUALITY_ORDER: Quality[] = ['normal', 'fine', 'excellent', 'supreme']
export const applyCropBlessing = (quality: Quality): Quality => {
  const bondBonus = useHiddenNpcStore().getBondBonusByType('crop_blessing')
  if (bondBonus?.type === 'crop_blessing' && Math.random() < bondBonus.chance) {
    const idx = QUALITY_ORDER.indexOf(quality)
    if (idx < QUALITY_ORDER.length - 1) return QUALITY_ORDER[idx + 1]!
  }
  return quality
}

// 模块级单例状态
const selectedSeed = ref<{ cropId: string; quality?: Quality } | null>(null)

export type FarmBatchRunner = (options: ChunkedBatchOptions) => Promise<ChunkedBatchResult>

const batchCancelMessage = (result: ChunkedBatchResult, unit = '块'): string => {
  const remaining = result.total - result.processed
  return result.cancelled && remaining > 0 ? ` 操作已取消，剩余${remaining}${unit}未处理。` : ''
}

/** 处理地块点击：翻耕/种植/浇水/收获 */
export const handlePlotClick = (plotId: number) => {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const inventoryStore = useInventoryStore()
  const skillStore = useSkillStore()
  const cookingStore = useCookingStore()
  const achievementStore = useAchievementStore()

  const plot = farmStore.plots[plotId]
  if (!plot) return

  if (gameStore.isPastBedtime) {
    addLog('已经凌晨2点了，你必须休息。')
    handleEndDay()
    return
  }

  if (plot.state === 'wasteland') {
    if (!inventoryStore.isToolAvailable('hoe')) {
      addLog('锄头正在升级中，无法开垦。')
      return
    }
    const farmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
    const ringFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
    const ringGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
    const cost = Math.max(
      1,
      Math.floor(
        3 *
          inventoryStore.getToolStaminaMultiplier('hoe') *
          (1 - skillStore.getStaminaReduction('farming')) *
          (1 - farmingBuff) *
          (1 - ringFarmReduction) *
          (1 - ringGlobalReduction)
      )
    )
    if (!playerStore.consumeStamina(cost)) {
      addLog('体力不足，无法开垦。')
      return
    }
    farmStore.tillPlot(plotId)
    sfxDig()
    showFloat(`-${cost}体力`, 'danger')
    addLog(`你开垦了一块荒地。(-${cost}体力)`)
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.till)
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) {
      handleEndDay()
      return
    }
  } else if (plot.state === 'tilled' && selectedSeed.value) {
    const cropDef = getCropById(selectedSeed.value.cropId)
    if (!cropDef) return
    if (!inventoryStore.hasItem(cropDef.seedId)) {
      addLog(`没有${cropDef.name}种子了。`)
      return
    }
    const plantQuality = selectedSeed.value.quality
    const cropFarmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
    const cropRingFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
    const cropRingGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
    const cost = Math.max(
      1,
      Math.floor(
        3 *
          inventoryStore.getToolStaminaMultiplier('hoe') *
          (1 - skillStore.getStaminaReduction('farming')) *
          (1 - cropFarmingBuff) *
          (1 - cropRingFarmReduction) *
          (1 - cropRingGlobalReduction)
      )
    )
    if (!playerStore.consumeStamina(cost)) {
      addLog('体力不足，无法播种。')
      return
    }
    inventoryStore.removeItem(cropDef.seedId, 1, plantQuality)
    farmStore.plantCrop(plotId, cropDef.id)
    sfxPlant()
    showFloat(`-${cost}体力`, 'danger')
    addLog(`种下了${cropDef.name}。(-${cost}体力)`)
    // 种植预警：作物可能无法在本季成熟
    const daysLeft = 28 - gameStore.day
    if (cropDef.growthDays > daysLeft) {
      const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'] as const
      const nextSeason = SEASON_ORDER[(SEASON_ORDER.indexOf(gameStore.season) + 1) % 4]!
      if (!cropDef.season.includes(nextSeason)) {
        showFloat(`${cropDef.name}需${cropDef.growthDays}天，本季仅剩${daysLeft}天！`, 'danger')
        addLog(`注意：${cropDef.name}需要${cropDef.growthDays}天成熟，但本季仅剩${daysLeft}天，换季后将枯萎。`)
      }
    }
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.plant)
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) {
      handleEndDay()
      return
    }
  } else if (plot.state === 'planted' || plot.state === 'growing') {
    if (!inventoryStore.isToolAvailable('wateringCan')) {
      addLog('水壶正在升级中，无法浇水。')
      return
    }
    if (plot.watered) {
      addLog('这块地今天已经浇过水了。')
      return
    }
    const crop = getCropById(plot.cropId!)
    const baseCost = crop?.deepWatering ? 3 : 2
    const farmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
    const waterRingFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
    const waterRingGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
    const cost = Math.max(
      1,
      Math.floor(
        baseCost *
          inventoryStore.getToolStaminaMultiplier('wateringCan') *
          (1 - skillStore.getStaminaReduction('farming')) *
          (1 - farmingBuff) *
          (1 - waterRingFarmReduction) *
          (1 - waterRingGlobalReduction)
      )
    )
    if (!playerStore.consumeStamina(cost)) {
      addLog('体力不足，无法浇水。')
      return
    }
    farmStore.waterPlot(plotId)
    skillStore.addExp('farming', 2)
    sfxWater()
    showFloat(`-${cost}体力`, 'water')
    addLog(`浇水完成。(-${cost}体力)`)
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.water)
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) {
      handleEndDay()
      return
    }
  } else if (plot.state === 'harvestable') {
    if (!inventoryStore.isToolAvailable('scythe')) {
      addLog('镰刀正在升级中，无法收获。')
      return
    }
    // 镰刀收获不消耗体力
    // 在收获清除前读取肥料信息
    const plotFertilizer = plot.fertilizer
    const result = farmStore.harvestPlot(plotId)
    const cropId = result.cropId
    const genetics = result.genetics
    if (cropId) {
      const cropDef = getCropById(cropId)
      const fertDef = plotFertilizer ? getFertilizerById(plotFertilizer) : null
      const ringCropQualityBonus = inventoryStore.getRingEffectValue('crop_quality_bonus')
      const allSkillsBuff = cookingStore.activeBuff?.type === 'all_skills' ? cookingStore.activeBuff.value : 0
      let quality = skillStore.rollCropQualityWithBonus((fertDef?.qualityBonus ?? 0) + ringCropQualityBonus, allSkillsBuff)
      quality = applyCropBlessing(quality)
      // 精耕细作天赋：20% 概率双倍收获
      const intensiveDouble = skillStore.getSkill('farming').perk10 === 'intensive' && Math.random() < 0.2
      // 育种产量加成：yield/100 × 30% 概率双收
      const yieldDouble = genetics && !intensiveDouble && Math.random() < (genetics.yield / 100) * 0.3
      // 桃源田庄：15% 概率额外收获
      const standardDouble = !intensiveDouble && !yieldDouble && gameStore.farmMapType === 'standard' && Math.random() < 0.15
      const harvestQty = intensiveDouble || yieldDouble || standardDouble ? 2 : 1
      inventoryStore.addItem(cropId, harvestQty, quality)
      achievementStore.discoverItem(cropId)
      achievementStore.recordCropHarvest()
      useQuestStore().onItemObtained(cropId, harvestQty)
      const { leveledUp, newLevel } = skillStore.addExp('farming', 10)
      const qualityLabel = quality !== 'normal' ? `(${QUALITY_NAMES[quality]})` : ''
      sfxHarvest()
      const qtyLabel = intensiveDouble || yieldDouble || standardDouble ? '×2' : ''
      showFloat(`+${cropDef?.name ?? cropId}${qtyLabel}${qualityLabel}`, 'success')
      let msg = `收获了${cropDef?.name ?? cropId}${qtyLabel}${qualityLabel}！`
      if (intensiveDouble) msg += ' 精耕细作，双倍丰收！'
      if (yieldDouble) msg += ' 育种产量加成，双倍丰收！'
      if (standardDouble) msg += ' 桃源沃土，额外丰收！'
      // 育种甜度加成：额外铜钱
      if (genetics && genetics.sweetness > 0 && cropDef) {
        const bonusMoney = Math.floor((cropDef.sellPrice * harvestQty * genetics.sweetness) / 200)
        if (bonusMoney > 0) {
          usePlayerStore().earnMoney(bonusMoney)
          msg += ` 甜度加成+${bonusMoney}文`
          showFloat(`+${bonusMoney}文`, 'accent')
        }
      }
      // 杂交种记录
      if (genetics?.isHybrid && genetics.hybridId) {
        useBreedingStore().recordHybridGrown(genetics.hybridId)
      }
      // 育种种子回收
      if (genetics && shouldReturnBreedingSeed(quality)) {
        const returned: SeedGenetics = { ...genetics, id: generateGeneticsId() }
        if (useBreedingStore().addToBox(returned)) {
          msg += ' 育种种子已回收。'
        } else {
          msg += ' 种子箱已满，育种种子丢失！'
        }
      }
      if (leveledUp) {
        msg += ` 农耕提升到${newLevel}级！`
        sfxLevelUp()
      }
      addLog(msg)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.harvest)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) {
        handleEndDay()
        return
      }
    }
  }
}

/** 从商店购买种子 */
export const handleBuySeed = (seedId: string) => {
  const shopStore = useShopStore()
  const walletStore = useWalletStore()
  const seed = shopStore.availableSeeds.find(s => s.seedId === seedId)
  if (!seed) return
  const discount = walletStore.getShopDiscount()
  const actualPrice = Math.floor(seed.price * (1 - discount))
  if (shopStore.buySeed(seedId)) {
    sfxBuy()
    showFloat(`-${actualPrice}文`, 'danger')
    addLog(`购买了${seed.cropName}种子。(-${actualPrice}文)`)
  } else {
    addLog('铜钱不足或背包已满。')
  }
}

/** 通过商店出售物品 */
export const handleSellItem = (itemId: string, quality: Quality) => {
  const shopStore = useShopStore()
  const itemDef = getItemById(itemId)
  if (!itemDef) return
  const earned = shopStore.sellItem(itemId, 1, quality)
  if (earned > 0) {
    sfxCoin()
    showFloat(`+${earned}文`, 'accent')
    addLog(`卖出了${itemDef.name}。(+${earned}文)`)
  }
}

/** 出售指定物品的全部数量 */
export const handleSellItemAll = (itemId: string, quantity: number, quality: Quality) => {
  const shopStore = useShopStore()
  const itemDef = getItemById(itemId)
  if (!itemDef || quantity <= 0) return
  const earned = shopStore.sellItem(itemId, quantity, quality)
  if (earned > 0) {
    sfxCoin()
    showFloat(`+${earned}文`, 'accent')
    addLog(`卖出了${itemDef.name}×${quantity}。(+${earned}文)`)
  }
}

/** 一键出售背包中所有可出售物品 */
export const handleSellAll = (filterCategories?: ItemCategory[]) => {
  const shopStore = useShopStore()
  const inventoryStore = useInventoryStore()
  let totalEarned = 0
  let totalCount = 0
  const allowed = filterCategories && filterCategories.length > 0 ? new Set(filterCategories) : null
  // 快照当前可卖物品（避免遍历中修改数组）
  const sellable = inventoryStore.items
    .filter(inv => {
      const def = getItemById(inv.itemId)
      return def && def.category !== 'seed' && !inv.locked && (!allowed || allowed.has(def.category))
    })
    .map(inv => ({ itemId: inv.itemId, quantity: inv.quantity, quality: inv.quality }))
  for (const item of sellable) {
    const earned = shopStore.sellItem(item.itemId, item.quantity, item.quality)
    if (earned > 0) {
      totalEarned += earned
      totalCount += item.quantity
    }
  }
  if (totalEarned > 0) {
    sfxCoin()
    showFloat(`+${totalEarned}文`, 'accent')
    addLog(`一键出售了${totalCount}件物品。(+${totalEarned}文)`)
  }
}

/** 一键浇水（浇所有未浇水地块，体力不足时自动停止） */
export const handleBatchWater = async (runBatch: FarmBatchRunner) => {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const inventoryStore = useInventoryStore()
  const skillStore = useSkillStore()
  const cookingStore = useCookingStore()

  if (!inventoryStore.isToolAvailable('wateringCan')) {
    addLog('水壶正在升级中，无法浇水。')
    return
  }

  if (gameStore.isPastBedtime) {
    addLog('已经凌晨2点了，你必须休息。')
    handleEndDay()
    return
  }

  const targets = farmStore.plots.filter(p => (p.state === 'planted' || p.state === 'growing') && !p.watered)
  if (targets.length === 0) {
    addLog('没有需要浇水的地块。')
    return
  }

  let watered = 0
  const batchRingFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
  const batchRingGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
  const farmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
  const toolMultiplier = inventoryStore.getToolStaminaMultiplier('wateringCan')
  const skillReduction = skillStore.getStaminaReduction('farming')
  const batchResult = await runBatch({
    label: '一键浇水',
    total: targets.length,
    chunkSize: FARM_BATCH_LIMIT,
    processChunk: (start, end) => {
      let completed = 0
      for (let index = start; index < end; index++) {
        const plot = targets[index]!
        const crop = getCropById(plot.cropId!)
        const baseCost = crop?.deepWatering ? 3 : 2
        const cost = Math.max(
          1,
          Math.floor(
            baseCost *
              toolMultiplier *
              (1 - skillReduction) *
              (1 - farmingBuff) *
              (1 - batchRingFarmReduction) *
              (1 - batchRingGlobalReduction)
          )
        )
        if (!playerStore.consumeStamina(cost)) break
        farmStore.waterPlot(plot.id)
        skillStore.addExp('farming', 2)
        watered++
        completed++
      }
      return completed
    }
  })

  if (watered > 0) {
    sfxWater()
    addLog(`一键浇水了${watered}块地。${batchCancelMessage(batchResult)}`)
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.batchWater * inventoryStore.getToolStaminaMultiplier('wateringCan'))
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) handleEndDay()
  } else {
    addLog('体力不足，无法浇水。')
  }
}

/** 一键开垦（开垦所有荒地，体力不足时自动停止） */
export const handleBatchTill = async (runBatch: FarmBatchRunner) => {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const inventoryStore = useInventoryStore()
  const skillStore = useSkillStore()
  const cookingStore = useCookingStore()

  if (!inventoryStore.isToolAvailable('hoe')) {
    addLog('锄头正在升级中，无法开垦。')
    return
  }

  if (gameStore.isPastBedtime) {
    addLog('已经凌晨2点了，你必须休息。')
    handleEndDay()
    return
  }

  const targets = farmStore.plots.filter(p => p.state === 'wasteland')
  if (targets.length === 0) {
    addLog('没有需要开垦的荒地。')
    return
  }

  let tilled = 0
  const tillRingFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
  const tillRingGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
  const farmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
  const cost = Math.max(
    1,
    Math.floor(
      3 *
        inventoryStore.getToolStaminaMultiplier('hoe') *
        (1 - skillStore.getStaminaReduction('farming')) *
        (1 - farmingBuff) *
        (1 - tillRingFarmReduction) *
        (1 - tillRingGlobalReduction)
    )
  )
  const batchResult = await runBatch({
    label: '一键开垦',
    total: targets.length,
    chunkSize: FARM_BATCH_LIMIT,
    processChunk: (start, end) => {
      let completed = 0
      for (let index = start; index < end; index++) {
        const plot = targets[index]!
        if (!playerStore.consumeStamina(cost)) break
        farmStore.tillPlot(plot.id)
        tilled++
        completed++
      }
      return completed
    }
  })

  if (tilled > 0) {
    sfxDig()
    addLog(`一键开垦了${tilled}块荒地。${batchCancelMessage(batchResult)}`)
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.batchTill * inventoryStore.getToolStaminaMultiplier('hoe'))
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) handleEndDay()
  } else {
    addLog('体力不足，无法开垦。')
  }
}

/** 一键收获（收获所有成熟作物，不消耗体力） */
export const handleBatchHarvest = async (runBatch: FarmBatchRunner) => {
  const gameStore = useGameStore()
  const farmStore = useFarmStore()
  const inventoryStore = useInventoryStore()
  const skillStore = useSkillStore()
  const cookingStore = useCookingStore()
  const achievementStore = useAchievementStore()
  const questStore = useQuestStore()
  const breedingStore = useBreedingStore()
  const playerStore = usePlayerStore()

  if (!inventoryStore.isToolAvailable('scythe')) {
    addLog('镰刀正在升级中，无法收获。')
    return
  }

  if (gameStore.isPastBedtime) {
    addLog('已经凌晨2点了，你必须休息。')
    handleEndDay()
    return
  }

  let harvested = 0
  let seedsReturned = 0
  const cropCounts = new Map<string, number>()
  const recordHarvest = (name: string) => {
    cropCounts.set(name, (cropCounts.get(name) ?? 0) + 1)
  }

  // 先收获巨型作物
  const giantGroupPlots = new Map<number, number>()
  for (const plot of farmStore.plots) {
    if (plot.state === 'harvestable' && plot.giantCropGroup !== null && !giantGroupPlots.has(plot.giantCropGroup)) {
      giantGroupPlots.set(plot.giantCropGroup, plot.id)
    }
  }

  // 再收获普通作物
  const targets = farmStore.plots.filter(p => p.state === 'harvestable' && p.giantCropGroup === null)
  const giantPlotIds = Array.from(giantGroupPlots.values())
  const totalTasks = giantPlotIds.length + targets.length
  const batchRingCropQuality = inventoryStore.getRingEffectValue('crop_quality_bonus')
  const batchAllSkillsBuff = cookingStore.activeBuff?.type === 'all_skills' ? cookingStore.activeBuff.value : 0
  const intensiveFarming = skillStore.getSkill('farming').perk10 === 'intensive'
  const batchResult = await runBatch({
    label: '一键收获',
    total: totalTasks,
    chunkSize: FARM_BATCH_LIMIT,
    processChunk: (start, end) => {
      let completed = 0
      for (let index = start; index < end; index++) {
        if (index < giantPlotIds.length) {
          const result = farmStore.harvestGiantCrop(giantPlotIds[index]!)
          if (!result) break
          const cropDef = getCropById(result.cropId)
          inventoryStore.addItem(result.cropId, result.quantity)
          achievementStore.discoverItem(result.cropId)
          achievementStore.recordCropHarvest()
          questStore.onItemObtained(result.cropId, result.quantity)
          skillStore.addExp('farming', 10)
          harvested++
          completed++
          recordHarvest(`巨型${cropDef?.name ?? result.cropId}x${result.quantity}`)
          continue
        }

        const plot = targets[index - giantPlotIds.length]!
        const plotFertilizer = plot.fertilizer
        const result = farmStore.harvestPlot(plot.id)
        const cropId = result.cropId
        const genetics = result.genetics
        if (!cropId) break

        const cropDef = getCropById(cropId)
        const fertDef = plotFertilizer ? getFertilizerById(plotFertilizer) : null
        let quality = skillStore.rollCropQualityWithBonus(
          (fertDef?.qualityBonus ?? 0) + batchRingCropQuality,
          batchAllSkillsBuff
        )
        quality = applyCropBlessing(quality)
        const intensiveDouble = intensiveFarming && Math.random() < 0.2
        const yieldDouble = genetics && !intensiveDouble && Math.random() < (genetics.yield / 100) * 0.3
        const standardDouble = !intensiveDouble && !yieldDouble && gameStore.farmMapType === 'standard' && Math.random() < 0.15
        const harvestQty = intensiveDouble || yieldDouble || standardDouble ? 2 : 1
        inventoryStore.addItem(cropId, harvestQty, quality)
        achievementStore.discoverItem(cropId)
        achievementStore.recordCropHarvest()
        questStore.onItemObtained(cropId, harvestQty)
        skillStore.addExp('farming', 10)
        harvested++
        completed++
        recordHarvest(cropDef?.name ?? cropId)

        if (genetics && genetics.sweetness > 0 && cropDef) {
          const bonusMoney = Math.floor((cropDef.sellPrice * harvestQty * genetics.sweetness) / 200)
          if (bonusMoney > 0) playerStore.earnMoney(bonusMoney)
        }
        if (genetics?.isHybrid && genetics.hybridId) {
          breedingStore.recordHybridGrown(genetics.hybridId)
        }
        if (genetics && shouldReturnBreedingSeed(quality)) {
          const returned: SeedGenetics = { ...genetics, id: generateGeneticsId() }
          if (breedingStore.addToBox(returned)) seedsReturned++
        }
      }
      return completed
    }
  })

  if (seedsReturned > 0) {
    addLog(`${seedsReturned}颗育种种子已回收到种子箱。`)
  }

  if (harvested > 0) {
    sfxHarvest()
    const cropSummary = Array.from(cropCounts.entries())
      .map(([name, count]) => (count > 1 ? `${name}x${count}` : name))
      .join('、')
    addLog(`一键收获了${harvested}株作物：${cropSummary}。${batchCancelMessage(batchResult, '项')}`)
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.batchHarvest * inventoryStore.getToolStaminaMultiplier('scythe'))
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) handleEndDay()
  } else {
    addLog('没有可收获的作物。')
  }
}

/** 一键种植（在所有空耕地上种植指定作物） */
export const handleBatchPlant = async (cropId: string, runBatch: FarmBatchRunner, seedQuality?: Quality) => {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const inventoryStore = useInventoryStore()
  const skillStore = useSkillStore()
  const cookingStore = useCookingStore()

  if (!inventoryStore.isToolAvailable('hoe')) {
    addLog('锄头正在升级中，无法播种。')
    return
  }

  if (gameStore.isPastBedtime) {
    addLog('已经凌晨2点了，你必须休息。')
    handleEndDay()
    return
  }

  const cropDef = getCropById(cropId)
  if (!cropDef) return

  const targets = farmStore.plots.filter(p => p.state === 'tilled')
  if (targets.length === 0) {
    addLog('没有可种植的空耕地。')
    return
  }

  const plantRingFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
  const plantRingGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
  const farmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
  const cost = Math.max(
    1,
    Math.floor(
      3 *
        inventoryStore.getToolStaminaMultiplier('hoe') *
        (1 - skillStore.getStaminaReduction('farming')) *
        (1 - farmingBuff) *
        (1 - plantRingFarmReduction) *
        (1 - plantRingGlobalReduction)
    )
  )
  const planned = Math.min(targets.length, inventoryStore.getItemCount(cropDef.seedId, seedQuality), Math.floor(playerStore.stamina / cost))
  if (planned <= 0) {
    addLog('体力不足或种子不够，无法种植。')
    return
  }
  if (!inventoryStore.removeItem(cropDef.seedId, planned, seedQuality)) {
    addLog('体力不足或种子不够，无法种植。')
    return
  }
  if (!playerStore.consumeStamina(planned * cost)) {
    inventoryStore.addItem(cropDef.seedId, planned, seedQuality)
    addLog('体力不足或种子不够，无法种植。')
    return
  }

  let planted = 0
  const batchResult = await runBatch({
    label: `一键种植${cropDef.name}`,
    total: planned,
    chunkSize: FARM_BATCH_LIMIT,
    processChunk: (start, end) => {
      let completed = 0
      for (let index = start; index < end; index++) {
        if (!farmStore.plantCrop(targets[index]!.id, cropDef.id)) break
        planted++
        completed++
      }
      return completed
    }
  })
  const unused = planned - planted
  if (unused > 0) {
    inventoryStore.addItem(cropDef.seedId, unused, seedQuality)
    playerStore.restoreStamina(unused * cost)
  }

  if (planted > 0) {
    sfxPlant()
    addLog(`一键种植了${planted}株${cropDef.name}。${batchCancelMessage(batchResult, '株')}`)
    // 种植预警：作物可能无法在本季成熟
    const daysLeft = 28 - gameStore.day
    if (cropDef.growthDays > daysLeft) {
      const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'] as const
      const nextSeason = SEASON_ORDER[(SEASON_ORDER.indexOf(gameStore.season) + 1) % 4]!
      if (!cropDef.season.includes(nextSeason)) {
        showFloat(`${cropDef.name}需${cropDef.growthDays}天，本季仅剩${daysLeft}天！`, 'danger')
        addLog(`注意：${cropDef.name}需要${cropDef.growthDays}天成熟，但本季仅剩${daysLeft}天，换季后将枯萎。`)
      }
    }
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.plant * Math.min(planted, 3))
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) handleEndDay()
  } else {
    addLog('体力不足或种子不够，无法种植。')
  }
}

/** 一键施肥（给所有未施肥的非荒地施指定肥料） */
export const handleBatchFertilize = async (fertilizerType: FertilizerType, runBatch: FarmBatchRunner) => {
  const gameStore = useGameStore()
  const farmStore = useFarmStore()
  const inventoryStore = useInventoryStore()

  if (gameStore.isPastBedtime) {
    addLog('已经凌晨2点了，你必须休息。')
    handleEndDay()
    return
  }

  const fertDef = getFertilizerById(fertilizerType)
  if (!fertDef) return

  const targets = farmStore.plots.filter(p => p.state !== 'wasteland' && !p.fertilizer)
  if (targets.length === 0) {
    addLog('没有可施肥的地块。')
    return
  }

  const planned = Math.min(targets.length, inventoryStore.getItemCount(fertilizerType))
  if (planned <= 0 || !inventoryStore.removeItem(fertilizerType, planned)) {
    addLog('肥料不足，无法施肥。')
    return
  }
  let applied = 0
  const batchResult = await runBatch({
    label: `一键施肥：${fertDef.name}`,
    total: planned,
    chunkSize: FARM_BATCH_LIMIT,
    processChunk: (start, end) => {
      let completed = 0
      for (let index = start; index < end; index++) {
        if (!farmStore.applyFertilizer(targets[index]!.id, fertilizerType)) break
        applied++
        completed++
      }
      return completed
    }
  })
  const unused = planned - applied
  if (unused > 0) inventoryStore.addItem(fertilizerType, unused)

  if (applied > 0) {
    showFloat(`施肥 ×${applied}`, 'success')
    addLog(`一键施了${applied}块地的${fertDef.name}。${batchCancelMessage(batchResult)}`)
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.plant * Math.min(applied, 3))
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) handleEndDay()
  } else {
    addLog('肥料不足，无法施肥。')
  }
}

/** 铲除单块作物 */
export const handleRemoveCrop = (plotId: number) => {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const skillStore = useSkillStore()
  const cookingStore = useCookingStore()
  const inventoryStore = useInventoryStore()

  if (gameStore.isPastBedtime) {
    addLog('已经凌晨2点了，你必须休息。')
    handleEndDay()
    return
  }

  const plot = farmStore.plots[plotId]
  if (!plot) return
  if (plot.state !== 'planted' && plot.state !== 'growing' && plot.state !== 'harvestable') {
    addLog('该地块没有作物可以铲除。')
    return
  }

  const farmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
  const ringFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
  const ringGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
  const cost = Math.max(
    1,
    Math.floor(
      2 * (1 - skillStore.getStaminaReduction('farming')) * (1 - farmingBuff) * (1 - ringFarmReduction) * (1 - ringGlobalReduction)
    )
  )
  if (!playerStore.consumeStamina(cost)) {
    addLog('体力不足，无法铲除。')
    return
  }

  const result = farmStore.removeCrop(plotId)
  if (result.cropId) {
    const cropDef = getCropById(result.cropId)
    sfxDig()
    addLog(`铲除了${cropDef?.name ?? result.cropId}。`)
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.till)
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) handleEndDay()
  }
}

/** 除虫（单块） */
export const handleCurePest = (plotId: number) => {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const skillStore = useSkillStore()
  const cookingStore = useCookingStore()
  const inventoryStore = useInventoryStore()

  if (gameStore.isPastBedtime) {
    addLog('已经凌晨2点了，你必须休息。')
    handleEndDay()
    return
  }

  const plot = farmStore.plots[plotId]
  if (!plot || !plot.infested) {
    addLog('该地块没有虫害。')
    return
  }

  const farmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
  const ringFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
  const ringGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
  const cost = Math.max(
    1,
    Math.floor(
      2 * (1 - skillStore.getStaminaReduction('farming')) * (1 - farmingBuff) * (1 - ringFarmReduction) * (1 - ringGlobalReduction)
    )
  )
  if (!playerStore.consumeStamina(cost)) {
    addLog('体力不足，无法除虫。')
    return
  }

  if (farmStore.curePest(plotId)) {
    sfxDig()
    addLog('清除了虫害。')
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.till)
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) handleEndDay()
  }
}

/** 一键除虫（清除所有虫害地块，体力不足时自动停止） */
export const handleBatchCurePest = async (runBatch: FarmBatchRunner) => {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const skillStore = useSkillStore()
  const cookingStore = useCookingStore()
  const inventoryStore = useInventoryStore()

  if (gameStore.isPastBedtime) {
    addLog('已经凌晨2点了，你必须休息。')
    handleEndDay()
    return
  }

  const targets = farmStore.plots.filter(p => p.infested)
  if (targets.length === 0) {
    addLog('没有需要除虫的地块。')
    return
  }

  let cured = 0
  const batchRingFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
  const batchRingGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
  const farmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
  const cost = Math.max(
    1,
    Math.floor(
      2 *
        (1 - skillStore.getStaminaReduction('farming')) *
        (1 - farmingBuff) *
        (1 - batchRingFarmReduction) *
        (1 - batchRingGlobalReduction)
    )
  )
  const batchResult = await runBatch({
    label: '一键除虫',
    total: targets.length,
    chunkSize: FARM_BATCH_LIMIT,
    processChunk: (start, end) => {
      let completed = 0
      for (let index = start; index < end; index++) {
        if (!playerStore.consumeStamina(cost)) break
        farmStore.curePest(targets[index]!.id)
        cured++
        completed++
      }
      return completed
    }
  })

  if (cured > 0) {
    sfxDig()
    addLog(`一键除虫了${cured}块地。${batchCancelMessage(batchResult)}`)
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.batchTill)
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) handleEndDay()
  } else {
    addLog('体力不足，无法除虫。')
  }
}

/** 除草（单块） */
export const handleClearWeed = (plotId: number) => {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const skillStore = useSkillStore()
  const cookingStore = useCookingStore()
  const inventoryStore = useInventoryStore()

  if (gameStore.isPastBedtime) {
    addLog('已经凌晨2点了，你必须休息。')
    handleEndDay()
    return
  }

  const plot = farmStore.plots[plotId]
  if (!plot || !plot.weedy) {
    addLog('该地块没有杂草。')
    return
  }

  const farmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
  const ringFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
  const ringGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
  const cost = Math.max(
    1,
    Math.floor(
      2 * (1 - skillStore.getStaminaReduction('farming')) * (1 - farmingBuff) * (1 - ringFarmReduction) * (1 - ringGlobalReduction)
    )
  )
  if (!playerStore.consumeStamina(cost)) {
    addLog('体力不足，无法除草。')
    return
  }

  if (farmStore.clearWeed(plotId)) {
    sfxDig()
    addLog('清除了杂草。')
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.till)
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) handleEndDay()
  }
}

/** 一键除草（清除所有杂草地块，体力不足时自动停止） */
export const handleBatchClearWeed = async (runBatch: FarmBatchRunner) => {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const skillStore = useSkillStore()
  const cookingStore = useCookingStore()
  const inventoryStore = useInventoryStore()

  if (gameStore.isPastBedtime) {
    addLog('已经凌晨2点了，你必须休息。')
    handleEndDay()
    return
  }

  const targets = farmStore.plots.filter(p => p.weedy)
  if (targets.length === 0) {
    addLog('没有需要除草的地块。')
    return
  }

  let cleared = 0
  const batchRingFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
  const batchRingGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
  const farmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
  const cost = Math.max(
    1,
    Math.floor(
      2 *
        (1 - skillStore.getStaminaReduction('farming')) *
        (1 - farmingBuff) *
        (1 - batchRingFarmReduction) *
        (1 - batchRingGlobalReduction)
    )
  )
  const batchResult = await runBatch({
    label: '一键除草',
    total: targets.length,
    chunkSize: FARM_BATCH_LIMIT,
    processChunk: (start, end) => {
      let completed = 0
      for (let index = start; index < end; index++) {
        if (!playerStore.consumeStamina(cost)) break
        farmStore.clearWeed(targets[index]!.id)
        cleared++
        completed++
      }
      return completed
    }
  })

  if (cleared > 0) {
    sfxDig()
    addLog(`一键除草了${cleared}块地。${batchCancelMessage(batchResult)}`)
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.batchTill)
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) handleEndDay()
  } else {
    addLog('体力不足，无法除草。')
  }
}

export const useFarmActions = () => {
  return {
    selectedSeed,
    handlePlotClick,
    handleBuySeed,
    handleSellItem,
    handleSellItemAll,
    handleSellAll,
    handleBatchWater,
    handleBatchTill,
    handleBatchHarvest,
    QUALITY_NAMES
  }
}
