import { computed, ref } from 'vue'
import type { CropDef, FarmPlot } from '@/types/farm'
import type { FertilizerType } from '@/types'

type CropLookup = (cropId: string) => CropDef | undefined
type FertilizerLookup = (fertilizer: FertilizerType) => { growthSpeedup?: number; name?: string } | undefined

export const FARM_PLOT_STATE_LABELS: Record<FarmPlot['state'], string> = {
  wasteland: '荒地',
  tilled: '已耕',
  planted: '已种',
  growing: '生长中',
  harvestable: '可收获'
}

export interface UseFarmSelectionOptions {
  plots: () => readonly FarmPlot[]
  greenhousePlots: () => readonly FarmPlot[]
  getCropById: CropLookup
  getFertilizerById: FertilizerLookup
  cropGrowthBonus: () => number
}

const getEffectiveGrowthDays = (
  plot: FarmPlot | null,
  fallback: number | string,
  getCropById: CropLookup,
  getFertilizerById: FertilizerLookup,
  cropGrowthBonus: () => number
) => {
  if (!plot?.cropId) return fallback
  const baseDays = getCropById(plot.cropId)?.growthDays
  if (!baseDays) return fallback
  const fertilizer = plot.fertilizer ? getFertilizerById(plot.fertilizer) : undefined
  const speedup = (fertilizer?.growthSpeedup ?? 0) + cropGrowthBonus()
  return speedup > 0 ? Math.max(1, Math.floor(baseDays * (1 - speedup))) : baseDays
}

const getCropRegrowth = (plot: FarmPlot | null, getCropById: CropLookup): boolean => {
  if (!plot?.cropId) return false
  return getCropById(plot.cropId)?.regrowth ?? false
}

const getCropMaxHarvests = (plot: FarmPlot | null, getCropById: CropLookup): number => {
  if (!plot?.cropId) return 0
  return getCropById(plot.cropId)?.maxHarvests ?? 0
}

export const useFarmSelection = ({ plots, greenhousePlots, getCropById, getFertilizerById, cropGrowthBonus }: UseFarmSelectionOptions) => {
  const activePlotId = ref<number | null>(null)
  const activePlot = computed(() => (activePlotId.value !== null ? (plots().find(plot => plot.id === activePlotId.value) ?? null) : null))

  const activeGhPlotId = ref<number | null>(null)
  const activeGhPlot = computed(() => (activeGhPlotId.value !== null ? (greenhousePlots()[activeGhPlotId.value] ?? null) : null))

  const plotStateLabel = computed(() => (activePlot.value ? FARM_PLOT_STATE_LABELS[activePlot.value.state] : ''))
  const ghPlotStateLabel = computed(() => (activeGhPlot.value ? FARM_PLOT_STATE_LABELS[activeGhPlot.value.state] : ''))

  const plotCropGrowthDays = computed(() => getEffectiveGrowthDays(activePlot.value, '?', getCropById, getFertilizerById, cropGrowthBonus))
  const ghPlotCropGrowthDays = computed(() => getEffectiveGrowthDays(activeGhPlot.value, 0, getCropById, getFertilizerById, cropGrowthBonus) as number)

  const plotCropRegrowth = computed(() => getCropRegrowth(activePlot.value, getCropById))
  const ghPlotCropRegrowth = computed(() => getCropRegrowth(activeGhPlot.value, getCropById))

  const plotCropMaxHarvests = computed(() => getCropMaxHarvests(activePlot.value, getCropById))
  const ghPlotCropMaxHarvests = computed(() => getCropMaxHarvests(activeGhPlot.value, getCropById))

  const plotFertName = computed(() => {
    if (!activePlot.value?.fertilizer) return ''
    return getFertilizerById(activePlot.value.fertilizer)?.name ?? activePlot.value.fertilizer
  })

  const canWater = computed(() => {
    if (!activePlot.value) return false
    return (activePlot.value.state === 'planted' || activePlot.value.state === 'growing') && !activePlot.value.watered
  })

  const canFertilize = computed(() => {
    if (!activePlot.value) return false
    return activePlot.value.state !== 'wasteland' && !activePlot.value.fertilizer
  })

  return {
    activeGhPlot,
    activeGhPlotId,
    activePlot,
    activePlotId,
    canFertilize,
    canWater,
    ghPlotCropGrowthDays,
    ghPlotCropMaxHarvests,
    ghPlotCropRegrowth,
    ghPlotStateLabel,
    plotCropGrowthDays,
    plotCropMaxHarvests,
    plotCropRegrowth,
    plotFertName,
    plotStateLabel
  }
}
