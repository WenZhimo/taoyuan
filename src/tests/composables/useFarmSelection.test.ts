import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { FARM_PLOT_STATE_LABELS, useFarmSelection } from '@/composables/farm/useFarmSelection'
import type { CropDef, FarmPlot } from '@/types/farm'
import type { FertilizerType } from '@/types'

const makePlot = (overrides: Partial<FarmPlot> = {}): FarmPlot => ({
  id: 0,
  state: 'wasteland',
  cropId: null,
  growthDays: 0,
  watered: false,
  unwateredDays: 0,
  fertilizer: null,
  harvestCount: 0,
  giantCropGroup: null,
  seedGenetics: null,
  infested: false,
  infestedDays: 0,
  weedy: false,
  weedyDays: 0,
  ...overrides
})

const crops: Record<string, CropDef> = {
  cabbage: {
    id: 'cabbage',
    name: '青菜',
    seedId: 'cabbage_seed',
    season: ['spring'],
    growthDays: 5,
    sellPrice: 10,
    seedPrice: 5,
    deepWatering: false,
    description: '测试作物',
    regrowth: true,
    maxHarvests: 3
  },
  turnip: {
    id: 'turnip',
    name: '芜菁',
    seedId: 'turnip_seed',
    season: ['spring'],
    growthDays: 4,
    sellPrice: 8,
    seedPrice: 4,
    deepWatering: false,
    description: '测试作物'
  }
}

const createSelection = () => {
  const plots = ref<FarmPlot[]>([
    makePlot({ id: 4, state: 'growing', cropId: 'cabbage', growthDays: 2, watered: false, fertilizer: 'speed_gro' as FertilizerType }),
    makePlot({ id: 8, state: 'tilled' })
  ])
  const greenhousePlots = ref<FarmPlot[]>([
    makePlot({ id: 100, state: 'harvestable', cropId: 'turnip', growthDays: 4 }),
    makePlot({ id: 101, state: 'planted', cropId: 'missing_crop', growthDays: 1 })
  ])
  const growthBonus = ref(0.1)

  const selection = useFarmSelection({
    plots: () => plots.value,
    greenhousePlots: () => greenhousePlots.value,
    getCropById: cropId => crops[cropId],
    getFertilizerById: fertilizer => (fertilizer === 'speed_gro' ? { name: '速生肥', growthSpeedup: 0.2 } : undefined),
    cropGrowthBonus: () => growthBonus.value
  })

  return {
    greenhousePlots,
    growthBonus,
    plots,
    selection
  }
}

describe('useFarmSelection', () => {
  it('tracks selected farm plot by plot id and derives display state', () => {
    const { selection } = createSelection()

    selection.activePlotId.value = 4

    expect(selection.activePlot.value?.id).toBe(4)
    expect(selection.plotStateLabel.value).toBe(FARM_PLOT_STATE_LABELS.growing)
    expect(selection.plotCropGrowthDays.value).toBe(3)
    expect(selection.plotCropRegrowth.value).toBe(true)
    expect(selection.plotCropMaxHarvests.value).toBe(3)
    expect(selection.plotFertName.value).toBe('速生肥')
    expect(selection.canWater.value).toBe(true)
    expect(selection.canFertilize.value).toBe(false)
  })

  it('keeps greenhouse selection index based to match existing farm view behavior', () => {
    const { selection } = createSelection()

    selection.activeGhPlotId.value = 0

    expect(selection.activeGhPlot.value?.id).toBe(100)
    expect(selection.ghPlotStateLabel.value).toBe(FARM_PLOT_STATE_LABELS.harvestable)
    expect(selection.ghPlotCropGrowthDays.value).toBe(3)
    expect(selection.ghPlotCropRegrowth.value).toBe(false)
    expect(selection.ghPlotCropMaxHarvests.value).toBe(0)
  })

  it('uses existing fallbacks for empty or unknown selected crops', () => {
    const { selection } = createSelection()

    expect(selection.activePlot.value).toBeNull()
    expect(selection.plotStateLabel.value).toBe('')
    expect(selection.plotCropGrowthDays.value).toBe('?')
    expect(selection.ghPlotCropGrowthDays.value).toBe(0)

    selection.activeGhPlotId.value = 1
    expect(selection.ghPlotCropGrowthDays.value).toBe(0)
  })

  it('updates derived values when backing plot lists change', () => {
    const { plots, selection } = createSelection()

    selection.activePlotId.value = 8
    expect(selection.canFertilize.value).toBe(true)

    plots.value[1] = makePlot({ id: 8, state: 'wasteland' })
    expect(selection.canFertilize.value).toBe(false)
    expect(selection.plotStateLabel.value).toBe(FARM_PLOT_STATE_LABELS.wasteland)
  })

  it('keeps repeated selection recalculations cheap', () => {
    const { selection } = createSelection()
    const iterations = 100_000
    const start = performance.now()
    let total = 0

    for (let i = 0; i < iterations; i++) {
      selection.activePlotId.value = i % 2 === 0 ? 4 : 8
      selection.activeGhPlotId.value = i % 2
      total += Number(selection.canWater.value)
      total += Number(selection.ghPlotCropGrowthDays.value)
    }

    expect(total).toBeGreaterThan(0)
    expect((performance.now() - start) / iterations).toBeLessThan(0.02)
  })
})
