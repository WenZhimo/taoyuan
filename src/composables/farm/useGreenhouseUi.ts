import { computed, ref } from 'vue'
import type { GreenhouseBatchSeedOption } from '@/components/game/farm/GreenhouseBatchPlantDialog.vue'
import type { GreenhouseCropStat, GreenhouseStateStat } from '@/components/game/farm/GreenhouseOverviewDialog.vue'
import type { GreenhousePlotSeedOption, GreenhouseBreedingSeedOption } from '@/components/game/farm/GreenhousePlotDialog.vue'
import type { GreenhouseUpgradeMaterialRow } from '@/components/game/farm/GreenhouseUpgradeDialog.vue'
import type { GreenhouseUpgradeDef } from '@/data/buildings'
import type { CropDef, FarmPlot } from '@/types/farm'
import type { FertilizerType } from '@/types'
import type { SeedGenetics } from '@/types/breeding'

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
  greenhousePlots: () => readonly FarmPlot[]
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
  greenhouseUnlocked,
  upgrades,
  breedingSeeds
}: UseGreenhouseUiOptions) => {
  const showGreenhouse = computed(() => greenhouseUnlocked())
  const showGreenhouseModal = ref(false)
  const showGhUpgradeModal = ref(false)
  const showGhBatchPlant = ref(false)

  const ghHarvestableCount = computed(() => greenhousePlots().filter(plot => plot.state === 'harvestable').length)
  const ghTilledEmptyCount = computed(() => greenhousePlots().filter(plot => plot.state === 'tilled').length)
  const ghPlantedCount = computed(() => greenhousePlots().length - ghTilledEmptyCount.value)

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
    for (const plot of greenhousePlots()) {
      const stat = stats[plot.state]
      if (!stat) continue
      stat.count++
      if (stat.firstPlotId === null) stat.firstPlotId = plot.id
    }
    return [stats.tilled!, stats.planted!, stats.growing!, stats.harvestable!]
  })

  const ghCropStats = computed<GreenhouseCropStat[]>(() => {
    const statsByCrop = new Map<string, GreenhouseCropStatAccumulator>()
    const walletGrowth = cropGrowthBonus()

    for (const plot of greenhousePlots()) {
      if (!plot.cropId) continue
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

      stat.count++
      if (plot.state === 'harvestable') stat.harvestable++
      if (plot.state === 'planted' || plot.state === 'growing') {
        stat.growing++
        const fertilizer = plot.fertilizer ? getFertilizerById(plot.fertilizer) : undefined
        const speedup = (fertilizer?.growthSpeedup ?? 0) + walletGrowth
        const effectiveDays = crop ? Math.max(1, Math.floor(crop.growthDays * (1 - speedup))) : 1
        stat.progressSum += Math.min(100, Math.floor((plot.growthDays / effectiveDays) * 100))
        stat.progressCount++
      }
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
  }

  return {
    allSeeds,
    closeGreenhouseDialogs,
    ghBreedingSeedOptions,
    ghCropStats,
    ghHarvestableCount,
    ghPlantableBreedingSeeds,
    ghPlantedCount,
    ghSeedOptions,
    ghStateStats,
    ghTilledEmptyCount,
    ghUpgradeMaterialRows,
    nextGhUpgrade,
    showGhBatchPlant,
    showGhUpgradeModal,
    showGreenhouse,
    showGreenhouseModal
  }
}
