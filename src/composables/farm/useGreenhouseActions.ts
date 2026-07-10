import type { Ref } from 'vue'
import { generateGeneticsId, shouldReturnBreedingSeed } from '@/data/breeding'
import { GREENHOUSE_BATCH_LIMIT } from '@/domain/farm/batchLimits'
import { addLog, showFloat } from '@/composables/useGameLog'
import { sfxHarvest, sfxPlant } from '@/composables/useAudio'
import type { ChunkedBatchOptions, ChunkedBatchResult } from './useFarmBatchUi'
import type { GreenhouseUpgradeDef } from '@/data/buildings'
import type { CropDef, FarmPlot } from '@/types/farm'
import type { Quality } from '@/types'
import type { BreedingSeed, SeedGenetics } from '@/types/breeding'

interface HarvestResult {
  cropId: string | null
  genetics: SeedGenetics | null
}

export interface UseGreenhouseActionsOptions {
  activeGhPlotId: Ref<number | null>
  ghTilledEmptyCount: () => number
  nextGhUpgrade: () => GreenhouseUpgradeDef | null | undefined
  showGhBatchPlant: Ref<boolean>
  showGhUpgradeModal: Ref<boolean>
  greenhousePlots: () => readonly FarmPlot[]
  breedingSeeds: () => readonly BreedingSeed[]
  getCropById: (cropId: string) => CropDef | undefined
  getCropName: (cropId: string) => string
  getItemCount: (itemId: string) => number
  removeItem: (itemId: string, quantity?: number, quality?: Quality) => boolean
  addItem: (itemId: string, quantity?: number, quality?: Quality) => boolean
  consumeStamina: (amount: number) => boolean
  stamina: () => number
  earnMoney: (amount: number) => void
  spendMoney: (amount: number) => boolean
  greenhousePlantCrop: (plotId: number, cropId: string) => boolean
  greenhousePlantGeneticSeed: (plotId: number, genetics: SeedGenetics) => boolean
  greenhouseHarvestPlot: (plotId: number) => HarvestResult
  upgradeGreenhouse: (newPlotCount: number) => boolean
  removeBreedingSeed: (seedId: string) => void
  addBreedingSeed: (genetics: SeedGenetics) => boolean
  recordHybridGrown: (hybridId: string) => void
  rollCropQuality: () => Quality
  applyCropBlessing: (quality: Quality) => Quality
  runWithLargeBatchConfirm: (label: string, total: number, run: () => void | Promise<void>, limit?: number) => boolean
  runChunkedBatch: (options: ChunkedBatchOptions) => Promise<ChunkedBatchResult>
}

const QUALITY_NAMES: Record<Quality, string> = {
  normal: '普通',
  fine: '优良',
  excellent: '精品',
  supreme: '极品'
}

export const useGreenhouseActions = ({
  activeGhPlotId,
  ghTilledEmptyCount,
  nextGhUpgrade,
  showGhBatchPlant,
  showGhUpgradeModal,
  greenhousePlots,
  breedingSeeds,
  getCropById,
  getCropName,
  getItemCount,
  removeItem,
  addItem,
  consumeStamina,
  stamina,
  earnMoney,
  spendMoney,
  greenhousePlantCrop,
  greenhousePlantGeneticSeed,
  greenhouseHarvestPlot,
  upgradeGreenhouse,
  removeBreedingSeed,
  addBreedingSeed,
  recordHybridGrown,
  rollCropQuality,
  applyCropBlessing,
  runWithLargeBatchConfirm,
  runChunkedBatch
}: UseGreenhouseActionsOptions) => {
  const closeActiveGreenhousePlot = () => {
    activeGhPlotId.value = null
  }

  const rollHarvestQuality = () => applyCropBlessing(rollCropQuality())

  const applyHarvestRewards = (cropId: string, genetics: SeedGenetics | null, quality: Quality) => {
    const cropDef = getCropById(cropId)
    const yieldDouble = genetics && Math.random() < (genetics.yield / 100) * 0.3
    const harvestQty = yieldDouble ? 2 : 1
    addItem(cropId, harvestQty, quality)

    let bonusMoney = 0
    if (genetics && genetics.sweetness > 0 && cropDef) {
      bonusMoney = Math.floor((cropDef.sellPrice * harvestQty * genetics.sweetness) / 200)
      if (bonusMoney > 0) earnMoney(bonusMoney)
    }

    if (genetics?.isHybrid && genetics.hybridId) {
      recordHybridGrown(genetics.hybridId)
    }

    let seedReturned = false
    let seedLost = false
    if (genetics && shouldReturnBreedingSeed(quality)) {
      const returned: SeedGenetics = { ...genetics, id: generateGeneticsId() }
      seedReturned = addBreedingSeed(returned)
      seedLost = !seedReturned
    }

    return {
      bonusMoney,
      cropName: cropDef?.name ?? cropId,
      harvestQty,
      seedLost,
      seedReturned,
      yieldDouble
    }
  }

  const doGhPlant = (cropId: string) => {
    if (activeGhPlotId.value === null) return
    const crop = getCropById(cropId)
    if (!crop) return
    if (!removeItem(crop.seedId)) {
      addLog('背包中没有该种子了。')
      return
    }
    if (greenhousePlantCrop(activeGhPlotId.value, cropId)) {
      addLog(`在温室中播种了${crop.name}。`)
    } else {
      addItem(crop.seedId)
    }
    closeActiveGreenhousePlot()
  }

  const doGhHarvest = () => {
    if (activeGhPlotId.value === null) return
    if (!consumeStamina(1)) {
      addLog('体力不足，无法收获。')
      return
    }
    const result = greenhouseHarvestPlot(activeGhPlotId.value)
    if (result.cropId) {
      const quality = rollHarvestQuality()
      const rewards = applyHarvestRewards(result.cropId, result.genetics, quality)
      const qualityLabel = quality !== 'normal' ? `(${QUALITY_NAMES[quality]})` : ''
      const qtyLabel = rewards.yieldDouble ? '×2' : ''
      sfxHarvest()
      showFloat(`+${rewards.cropName}${qtyLabel}${qualityLabel}`, 'success')
      let msg = `在温室收获了${rewards.cropName}${qtyLabel}${qualityLabel}！(-1体力)`
      if (rewards.yieldDouble) msg += ' 育种产量加成！'
      if (rewards.bonusMoney > 0) msg += ` 甜度加成+${rewards.bonusMoney}文`
      if (rewards.seedReturned) msg += ' 育种种子已回收。'
      if (rewards.seedLost) msg += ' 种子箱已满，育种种子丢失！'
      addLog(msg)
    }
    closeActiveGreenhousePlot()
  }

  const doGhBatchHarvest = async (confirmed = false) => {
    const targets = greenhousePlots().filter(plot => plot.state === 'harvestable')
    const plannedTotal = Math.min(targets.length, Math.max(0, Math.floor(stamina())))
    if (!confirmed) {
      runWithLargeBatchConfirm('温室一键收获', plannedTotal, () => doGhBatchHarvest(true), GREENHOUSE_BATCH_LIMIT)
      return
    }
    if (plannedTotal <= 0) {
      addLog('体力不足或没有可收获的温室作物。')
      return
    }

    let harvested = 0
    let seedsReturned = 0
    let totalBonusMoney = 0
    const batchResult = await runChunkedBatch({
      label: '温室一键收获',
      total: plannedTotal,
      chunkSize: GREENHOUSE_BATCH_LIMIT,
      processChunk: (start, end) => {
        let completed = 0
        for (let index = start; index < end; index++) {
          if (!consumeStamina(1)) break
          const { cropId, genetics } = greenhouseHarvestPlot(targets[index]!.id)
          if (!cropId) break
          harvested++
          completed++
          const rewards = applyHarvestRewards(cropId, genetics, rollHarvestQuality())
          totalBonusMoney += rewards.bonusMoney
          if (rewards.seedReturned) seedsReturned++
        }
        return completed
      }
    })

    if (harvested > 0) {
      sfxHarvest()
      showFloat(`温室收获 ×${harvested}`, 'success')
      let msg = `在温室一键收获了${harvested}株作物。(-${harvested}体力)`
      if (totalBonusMoney > 0) msg += ` 甜度加成+${totalBonusMoney}文`
      if (batchResult.cancelled && batchResult.total > batchResult.processed) {
        msg += ` 操作已取消，剩余${batchResult.total - batchResult.processed}株未处理。`
      }
      addLog(msg)
    }
    if (seedsReturned > 0) {
      addLog(`${seedsReturned}颗育种种子已回收到种子箱。`)
    }
  }

  const doGhPlantGeneticSeed = (seedId: string) => {
    if (activeGhPlotId.value === null) return
    const seed = breedingSeeds().find(item => item.genetics.id === seedId)
    if (!seed) return
    if (greenhousePlantGeneticSeed(activeGhPlotId.value, seed.genetics)) {
      removeBreedingSeed(seedId)
      addLog(`在温室种下了育种种子：${getCropName(seed.genetics.cropId)} G${seed.genetics.generation}。`)
    }
    closeActiveGreenhousePlot()
  }

  const doGhBatchPlant = async (cropId: string, confirmed = false) => {
    const crop = getCropById(cropId)
    if (!crop) return
    const seedCount = getItemCount(crop.seedId)
    const affordableByStamina = Math.max(0, Math.floor(stamina()))
    const plannedTotal = Math.min(seedCount, affordableByStamina, ghTilledEmptyCount())
    if (!confirmed) {
      runWithLargeBatchConfirm('温室一键种植', plannedTotal, () => doGhBatchPlant(cropId, true), GREENHOUSE_BATCH_LIMIT)
      return
    }

    const plantLimit = plannedTotal
    if (plantLimit <= 0) {
      addLog('体力不足或种子不够，无法种植。')
      showGhBatchPlant.value = false
      return
    }

    if (!removeItem(crop.seedId, plantLimit)) {
      addLog('背包中没有足够的种子。')
      showGhBatchPlant.value = false
      return
    }

    let planted = 0
    const targets = greenhousePlots().filter(plot => plot.state === 'tilled').slice(0, plantLimit)
    const batchResult = await runChunkedBatch({
      label: `温室一键种植${crop.name}`,
      total: plantLimit,
      chunkSize: GREENHOUSE_BATCH_LIMIT,
      processChunk: (start, end) => {
        let completed = 0
        for (let index = start; index < end; index++) {
          if (!consumeStamina(1)) break
          if (!greenhousePlantCrop(targets[index]!.id, cropId)) break
          planted++
          completed++
        }
        return completed
      }
    })
    if (planted < plantLimit) {
      addItem(crop.seedId, plantLimit - planted)
    }

    if (planted > 0) {
      sfxPlant()
      showFloat(`温室种植 ${crop.name} ×${planted}`, 'success')
      let msg = `在温室一键种植了${planted}株${crop.name}。(-${planted}体力)`
      if (batchResult.cancelled && batchResult.total > batchResult.processed) {
        msg += ` 操作已取消，剩余${batchResult.total - batchResult.processed}株未处理。`
      }
      addLog(msg)
    } else {
      addLog('体力不足或种子不够，无法种植。')
    }
    showGhBatchPlant.value = false
  }

  const handleGhUpgrade = () => {
    const upgrade = nextGhUpgrade()
    if (!upgrade) return
    for (const mat of upgrade.materialCost) {
      if (getItemCount(mat.itemId) < mat.quantity) {
        addLog('材料不足，无法升级温室。')
        return
      }
    }
    if (!spendMoney(upgrade.cost)) {
      addLog('铜钱不足，无法升级温室。')
      return
    }
    for (const mat of upgrade.materialCost) {
      removeItem(mat.itemId, mat.quantity)
    }
    upgradeGreenhouse(upgrade.plotCount)
    addLog(`温室已升级至${upgrade.name}！（${upgrade.plotCount}个地块）`)
    showGhUpgradeModal.value = false
  }

  return {
    doGhBatchHarvest,
    doGhBatchPlant,
    doGhHarvest,
    doGhPlant,
    doGhPlantGeneticSeed,
    handleGhUpgrade
  }
}
