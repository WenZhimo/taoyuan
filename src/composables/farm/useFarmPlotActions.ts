import type { Ref } from 'vue'
import { getFertilizerById } from '@/data/processing'
import { ACTION_TIME_COSTS } from '@/data/timeConstants'
import { addLog, showFloat } from '@/composables/useGameLog'
import {
  handleClearWeed,
  handleCurePest,
  handlePlotClick,
  handleRemoveCrop
} from '@/composables/useFarmActions'
import { sfxHarvest } from '@/composables/useAudio'
import type { BreedingSeed } from '@/types/breeding'
import type { FarmPlot, FertilizerType, Quality, SprinklerType } from '@/types'

interface SelectedSeed {
  cropId: string
  quality?: Quality
}

export interface UseFarmPlotActionsOptions {
  activePlotId: Ref<number | null>
  selectedSeed: Ref<SelectedSeed | null>
  plots: () => readonly FarmPlot[]
  breedingSeeds: () => readonly BreedingSeed[]
  getCropName: (cropId: string) => string
  plantGeneticSeed: (plotId: number, genetics: BreedingSeed['genetics']) => boolean
  removeBreedingSeed: (seedId: string) => void
  advanceTime: (minutes: number) => { message?: string }
  addItem: (itemId: string, quantity?: number, quality?: Quality) => boolean
  removeItem: (itemId: string, quantity?: number, quality?: Quality) => boolean
  applyFertilizer: (plotId: number, type: FertilizerType) => boolean
  placeSprinkler: (plotId: number, type: SprinklerType) => boolean
  removeSprinkler: (plotId: number) => SprinklerType | null
  harvestGiantCrop: (plotId: number) => { cropId: string; quantity: number } | null
}

export const useFarmPlotActions = ({
  activePlotId,
  selectedSeed,
  plots,
  breedingSeeds,
  getCropName,
  plantGeneticSeed,
  removeBreedingSeed,
  advanceTime,
  addItem,
  removeItem,
  applyFertilizer,
  placeSprinkler,
  removeSprinkler,
  harvestGiantCrop
}: UseFarmPlotActionsOptions) => {
  const closeActivePlot = () => {
    activePlotId.value = null
  }

  const runPlotClick = (seed: SelectedSeed | null = null) => {
    if (activePlotId.value === null) return
    selectedSeed.value = seed
    handlePlotClick(activePlotId.value)
    selectedSeed.value = null
    closeActivePlot()
  }

  const doTill = () => {
    runPlotClick()
  }

  const doPlant = (cropId: string, quality?: Quality) => {
    runPlotClick({ cropId, quality })
  }

  const doPlantGeneticSeed = (seedId: string) => {
    if (activePlotId.value === null) return
    const seed = breedingSeeds().find(item => item.genetics.id === seedId)
    if (!seed) return
    if (plantGeneticSeed(activePlotId.value, seed.genetics)) {
      removeBreedingSeed(seedId)
      addLog(`种下了育种种子：${getCropName(seed.genetics.cropId)} G${seed.genetics.generation}。`)
      const tr = advanceTime(ACTION_TIME_COSTS.plant)
      if (tr.message) addLog(tr.message)
    }
    closeActivePlot()
  }

  const doWater = () => {
    runPlotClick()
  }

  const doHarvest = () => {
    if (activePlotId.value === null) return
    const plot = plots().find(item => item.id === activePlotId.value)
    if (plot && plot.giantCropGroup !== null) {
      const result = harvestGiantCrop(activePlotId.value)
      if (result) {
        addItem(result.cropId, result.quantity)
        const cropName = getCropName(result.cropId)
        addLog(`收获了巨型${cropName}！获得了${result.quantity}个${cropName}！`)
        showFloat(`巨型${cropName} ×${result.quantity}`, 'accent')
        sfxHarvest()
      }
      closeActivePlot()
      return
    }
    runPlotClick()
  }

  const doRemoveCrop = () => {
    if (activePlotId.value === null) return
    handleRemoveCrop(activePlotId.value)
    closeActivePlot()
  }

  const doCurePest = () => {
    if (activePlotId.value === null) return
    handleCurePest(activePlotId.value)
    closeActivePlot()
  }

  const doClearWeed = () => {
    if (activePlotId.value === null) return
    handleClearWeed(activePlotId.value)
    closeActivePlot()
  }

  const doFertilize = (type: FertilizerType) => {
    if (activePlotId.value === null) return
    if (!removeItem(type)) {
      addLog('没有该肥料了。')
      return
    }
    if (applyFertilizer(activePlotId.value, type)) {
      const fertDef = getFertilizerById(type)
      addLog(`施了${fertDef?.name ?? '肥料'}。`)
    } else {
      addItem(type)
      addLog('无法在此施肥（需要已开垦且未施肥的地块）。')
    }
    closeActivePlot()
  }

  const doPlaceSprinkler = (type: SprinklerType) => {
    if (activePlotId.value === null) return
    if (!removeItem(type)) {
      addLog('没有该洒水器了。')
      return
    }
    if (placeSprinkler(activePlotId.value, type)) {
      addLog('放置了洒水器，周围地块将自动浇水。')
    } else {
      addItem(type)
      addLog('无法在此放置洒水器。')
    }
    closeActivePlot()
  }

  const doRemoveSprinkler = () => {
    if (activePlotId.value === null) return
    const plotId = activePlotId.value
    const type = removeSprinkler(plotId)
    if (type) {
      if (addItem(type)) {
        addLog('拆除了洒水器，已回收到背包。')
      } else {
        placeSprinkler(plotId, type)
        addLog('背包已满，无法回收洒水器。')
      }
    }
    closeActivePlot()
  }

  return {
    doClearWeed,
    doCurePest,
    doFertilize,
    doHarvest,
    doPlaceSprinkler,
    doPlant,
    doPlantGeneticSeed,
    doRemoveCrop,
    doRemoveSprinkler,
    doTill,
    doWater
  }
}
