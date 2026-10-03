import { computed, ref } from 'vue'
import type { GreenhouseBatchSeedOption } from '@/components/game/farm/GreenhouseBatchPlantDialog.vue'
import type { GreenhouseCropStat, GreenhouseStateStat } from '@/components/game/farm/GreenhouseOverviewDialog.vue'
import type { GreenhousePlotSeedOption, GreenhouseBreedingSeedOption } from '@/components/game/farm/GreenhousePlotDialog.vue'
import type { GreenhouseUpgradeMaterialRow } from '@/components/game/farm/GreenhouseUpgradeDialog.vue'
import type { GreenhouseUpgradeDef } from '@/data/buildings'
import type { CropDef, FarmPlot, GreenhousePlotTimer } from '@/types/farm'
import type { FertilizerType } from '@/types'
import type { SeedGenetics } from '@/types/breeding'
import { greenhousePlotState } from '@/domain/farm/greenhouseTimers'

export interface GreenhouseSeedSource {
  cropId: string
  genetics: SeedGenetics
}

export interface UseGreenhouseUiOptions {
  crops: () => readonly CropDef[]
  cropGrowthBonus: () => number
  getCropById: (cropId: string) => CropDef | undefined
  getFertilizerById: (fertilizer: FertilizerType) => { growthSpeedup?: number } | undefined
  getItemCount: (itemId: string) => number
  getItemName: (itemId: string) => string
  getStarRating: (genetics: SeedGenetics) => number
  greenhouseLevel: () => number
  greenhousePlots?: () => readonly FarmPlot[]
  greenhouseTimers?: () => readonly GreenhousePlotTimer[]
  greenhousePlotCount?: () => number
  greenhouseUnlocked: () => boolean
  upgrades: readonly GreenhouseUpgradeDef[]
  breedingSeeds: () => readonly GreenhouseSeedSource[]
}

type GreenhouseCropStatAccumulator = GreenhouseCropStat & {
  progressSum: number
  progressCount: number
}

export const useGreenhouseUi = ({
  crops,
  cropGrowthBonus,
  getCropById,
  getFertilizerById,
  getItemCount,
  getItemName,
  getStarRating,
  greenhouseLevel,
  greenhousePlots,
  greenhouseTimers,
  greenhousePlotCount,
  greenhouseUnlocked,
  upgrades,
  breedingSeeds
}: UseGreenhouseUiOptions) => {
  const showGreenhouse = computed(() => greenhouseUnlocked())
  const showGreenhouseModal = ref(false)
  const showGhUpgradeModal = ref(false)
  const showGhBatchPlant = ref(false)
  const showGhBatchFertilize = ref(false)

  const legacyPlots = () => greenhousePlots?.() ?? []
  const timers = () => greenhouseTimers?.() ?? []
  const usesCompactTimers = () => greenhouseTimers !== undefined && greenhousePlotCount !== undefined
  const totalPlotCount = () => greenhousePlotCount?.() ?? legacyPlots().length

  const ghHarvestableCount = computed(() => {
    if (!usesCompactTimers()) return legacyPlots().filter(plot => plot.state === 'harvestable').length
    const walletGrowth = cropGrowthBonus()
    return timers().reduce((total, timer) => total + (
      greenhousePlotState(timer, getCropById, getFertilizerById, walletGrowth) === 'harvestable'
        ? timer.plotIds.length
        : 0
    ), 0)
  })
  const ghTilledEmptyCount = computed(() => {
    if (!usesCompactTimers()) return legacyPlots().filter(plot => plot.state === 'tilled').length
    return Math.max(0, totalPlotCount() - timers().reduce((total, timer) => total + (timer.cropId ? timer.plotIds.length : 0), 0))
  })
  const ghFertilizableCount = computed(() => {
    if (!usesCompactTimers()) return legacyPlots().filter(plot =>
      plot.state !== 'wasteland' && (!plot.fertilizer || !plot.retainingSoil || plot.retainingSoil === 'retaining_soil')
    ).length
    const fullyFertilized = new Set<number>()
    for (const timer of timers()) {
      if (timer.fertilizer && timer.retainingSoil === 'quality_retaining_soil') {
        for (const plotId of timer.plotIds) fullyFertilized.add(plotId)
      }
    }
    return Math.max(0, totalPlotCount() - fullyFertilized.size)
  })
  const ghPlantedCount = computed(() => {
    if (!usesCompactTimers()) return legacyPlots().length - ghTilledEmptyCount.value
    return timers().reduce((total, timer) => total + (timer.cropId ? timer.plotIds.length : 0), 0)
  })

  const nextGhUpgrade = computed(() => upgrades[greenhouseLevel()] ?? null)

  const ghUpgradeMaterialRows = computed<GreenhouseUpgradeMaterialRow[]>(() => {
    if (!nextGhUpgrade.value) return []
    return nextGhUpgrade.value.materialCost.map(material => ({
      itemId: material.itemId,
      name: getItemName(material.itemId),
      current: getItemCount(material.itemId),
      required: material.quantity
    }))
  })

  const ghStateStats = computed<GreenhouseStateStat[]>(() => {
    const stats: Record<string, GreenhouseStateStat> = {
      tilled: { key: 'tilled', label: '空耕地', count: 0, firstPlotId: null },
      planted: { key: 'planted', label: '已种', count: 0, firstPlotId: null },
      growing: { key: 'growing', label: '生长中', count: 0, firstPlotId: null },
      harvestable: { key: 'harvestable', label: '可收获', count: 0, firstPlotId: null }
    }
    if (usesCompactTimers()) {
      const occupied = new Set<number>()
      const walletGrowth = cropGrowthBonus()
      for (const timer of timers()) {
        if (!timer.cropId) continue
        const state = greenhousePlotState(timer, getCropById, getFertilizerById, walletGrowth)
        const stat = stats[state]
        if (!stat) continue
        stat.count += timer.plotIds.length
        if (stat.firstPlotId === null) stat.firstPlotId = timer.plotIds[0] ?? null
        for (const plotId of timer.plotIds) occupied.add(plotId)
      }
      if (stats.tilled!.count < totalPlotCount()) {
        for (let plotId = 0; plotId < totalPlotCount(); plotId++) {
          if (!occupied.has(plotId)) {
            stats.tilled!.firstPlotId = plotId
            break
          }
        }
      }
      stats.tilled!.count = Math.max(0, totalPlotCount() - occupied.size)
    } else {
      for (const plot of legacyPlots()) {
        const stat = stats[plot.state]
        if (!stat) continue
        stat.count++
        if (stat.firstPlotId === null) stat.firstPlotId = plot.id
      }
    }
    return [stats.tilled!, stats.planted!, stats.growing!, stats.harvestable!]
  })

  const ghCropStats = computed<GreenhouseCropStat[]>(() => {
    const statsByCrop = new Map<string, GreenhouseCropStatAccumulator>()
    const walletGrowth = cropGrowthBonus()

    const addCropStat = (plot: Pick<FarmPlot, 'id' | 'cropId' | 'growthDays' | 'state' | 'fertilizer' | 'seedGenetics'>, count = 1) => {
      if (!plot.cropId) return
      const crop = getCropById(plot.cropId)
      const generation = plot.seedGenetics?.generation ?? null
      const key = `${plot.cropId}:${generation ?? 'base'}`
      let stat = statsByCrop.get(key)
      if (!stat) {
        stat = {
          key,
          name: crop?.name ?? plot.cropId,
          generation,
          count: 0,
          harvestable: 0,
          growing: 0,
          firstPlotId: plot.id,
          progressSum: 0,
          progressCount: 0,
          avgProgress: null
        }
        statsByCrop.set(key, stat)
      }

      stat.count += count
      if (plot.state === 'harvestable') stat.harvestable += count
      if (plot.state === 'planted' || plot.state === 'growing') {
        stat.growing += count
        const fertilizer = plot.fertilizer ? getFertilizerById(plot.fertilizer) : undefined
        const speedup = (fertilizer?.growthSpeedup ?? 0) + walletGrowth
        const effectiveDays = crop ? Math.max(1, Math.floor(crop.growthDays * (1 - speedup))) : 1
        stat.progressSum += Math.min(100, Math.floor((plot.growthDays / effectiveDays) * 100)) * count
        stat.progressCount += count
      }
    }

    if (usesCompactTimers()) {
      const walletGrowth = cropGrowthBonus()
      for (const timer of timers()) {
        addCropStat({
          id: timer.plotIds[0] ?? 0,
          cropId: timer.cropId,
          growthDays: timer.growthDays,
          state: greenhousePlotState(timer, getCropById, getFertilizerById, walletGrowth),
          fertilizer: timer.fertilizer,
          seedGenetics: timer.seedGenetics
        }, timer.plotIds.length)
      }
    } else {
      for (const plot of legacyPlots()) addCropStat(plot)
    }

    return Array.from(statsByCrop.values())
      .map(stat => ({
        ...stat,
        avgProgress: stat.progressCount > 0 ? Math.round(stat.progressSum / stat.progressCount) : null
      }))
      .sort((a, b) => b.harvestable - a.harvestable || b.count - a.count || a.name.localeCompare(b.name))
  })

  const allSeeds = computed<GreenhouseBatchSeedOption[]>(() => {
    return crops()
      .filter(crop => getItemCount(crop.seedId) > 0)
      .map(crop => ({
        cropId: crop.id,
        name: crop.name,
        count: getItemCount(crop.seedId),
        regrowth: crop.regrowth ?? false
      }))
  })

  const ghSeedOptions = computed<GreenhousePlotSeedOption[]>(() =>
    allSeeds.value.map(seed => ({
      cropId: seed.cropId,
      name: seed.name,
      count: seed.count,
      regrowth: seed.regrowth
    }))
  )

  const ghPlantableBreedingSeeds = computed(() => breedingSeeds().filter(seed => !!getCropById(seed.cropId)))

  const ghBreedingSeedOptions = computed<GreenhouseBreedingSeedOption[]>(() =>
    ghPlantableBreedingSeeds.value.map(seed => ({
      id: seed.genetics.id,
      cropName: getCropById(seed.cropId)?.name ?? seed.cropId,
      generation: seed.genetics.generation,
      starRating: getStarRating(seed.genetics)
    }))
  )

  const closeGreenhouseDialogs = () => {
    showGreenhouseModal.value = false
    showGhUpgradeModal.value = false
    showGhBatchPlant.value = false
    showGhBatchFertilize.value = false
  }

  return {
    allSeeds,
    closeGreenhouseDialogs,
    ghBreedingSeedOptions,
    ghCropStats,
    ghFertilizableCount,
    ghHarvestableCount,
    ghPlantableBreedingSeeds,
    ghPlantedCount,
    ghSeedOptions,
    ghStateStats,
    ghTilledEmptyCount,
    ghUpgradeMaterialRows,
    nextGhUpgrade,
    showGhBatchFertilize,
    showGhBatchPlant,
    showGhUpgradeModal,
    showGreenhouse,
    showGreenhouseModal
  }
}
