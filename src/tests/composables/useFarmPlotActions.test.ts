import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFarmPlotActions } from '@/composables/farm/useFarmPlotActions'
import type { UseFarmPlotActionsOptions } from '@/composables/farm/useFarmPlotActions'
import { ACTION_TIME_COSTS } from '@/data/timeConstants'
import { addLog, showFloat } from '@/composables/useGameLog'
import {
  handleClearWeed,
  handleCurePest,
  handlePlotClick,
  handleRemoveCrop
} from '@/composables/useFarmActions'
import { sfxHarvest } from '@/composables/useAudio'
import type { BreedingSeed, SeedGenetics } from '@/types/breeding'
import type { FarmPlot, Quality, SprinklerType } from '@/types'

vi.mock('@/composables/useGameLog', () => ({
  addLog: vi.fn(),
  showFloat: vi.fn()
}))

vi.mock('@/composables/useAudio', () => ({
  sfxHarvest: vi.fn()
}))

vi.mock('@/composables/useFarmActions', () => ({
  handleClearWeed: vi.fn(),
  handleCurePest: vi.fn(),
  handlePlotClick: vi.fn(),
  handleRemoveCrop: vi.fn()
}))

const makePlot = (overrides: Partial<FarmPlot> = {}): FarmPlot => ({
  id: 0,
  state: 'tilled',
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

const makeGenetics = (overrides: Partial<SeedGenetics> = {}): SeedGenetics => ({
  id: 'gene-1',
  cropId: 'cabbage',
  generation: 2,
  sweetness: 10,
  yield: 5,
  resistance: 3,
  stability: 50,
  mutationRate: 2,
  parentA: null,
  parentB: null,
  parentCropA: null,
  parentCropB: null,
  isHybrid: false,
  hybridId: null,
  ...overrides
})

const createPlotActions = (overrides: {
  activePlotId?: number | null
  plots?: FarmPlot[]
  breedingSeeds?: BreedingSeed[]
  plantGeneticSeed?: UseFarmPlotActionsOptions['plantGeneticSeed']
  addItem?: UseFarmPlotActionsOptions['addItem']
  removeItem?: UseFarmPlotActionsOptions['removeItem']
  applyFertilizer?: UseFarmPlotActionsOptions['applyFertilizer']
  placeSprinkler?: UseFarmPlotActionsOptions['placeSprinkler']
  removeSprinkler?: UseFarmPlotActionsOptions['removeSprinkler']
  harvestGiantCrop?: UseFarmPlotActionsOptions['harvestGiantCrop']
} = {}) => {
  const activePlotId = ref<number | null>(overrides.activePlotId ?? 2)
  const selectedSeed = ref<{ cropId: string; quality?: Quality } | null>(null)
  const plots = ref<FarmPlot[]>(overrides.plots ?? [makePlot({ id: 2 })])
  const breedingSeeds = ref<BreedingSeed[]>(overrides.breedingSeeds ?? [])

  const actions = useFarmPlotActions({
    activePlotId,
    selectedSeed,
    plots: () => plots.value,
    breedingSeeds: () => breedingSeeds.value,
    getCropName: cropId => (cropId === 'cabbage' ? '青菜' : cropId),
    plantGeneticSeed: overrides.plantGeneticSeed ?? vi.fn(() => true),
    removeBreedingSeed: vi.fn(),
    advanceTime: vi.fn(() => ({ message: 'time advanced' })),
    addItem: overrides.addItem ?? vi.fn(() => true),
    removeItem: overrides.removeItem ?? vi.fn(() => true),
    applyFertilizer: overrides.applyFertilizer ?? vi.fn(() => true),
    placeSprinkler: overrides.placeSprinkler ?? vi.fn(() => true),
    removeSprinkler: overrides.removeSprinkler ?? vi.fn((_plotId: number): SprinklerType => 'bamboo_sprinkler'),
    harvestGiantCrop: overrides.harvestGiantCrop ?? vi.fn(() => null)
  })

  return {
    actions,
    activePlotId,
    breedingSeeds,
    plots,
    selectedSeed
  }
}

describe('useFarmPlotActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('forwards basic plot actions through handlePlotClick and closes the plot dialog', () => {
    const { actions, activePlotId, selectedSeed } = createPlotActions()

    actions.doPlant('cabbage', 'fine')

    expect(handlePlotClick).toHaveBeenCalledWith(2)
    expect(selectedSeed.value).toBeNull()
    expect(activePlotId.value).toBeNull()
  })

  it('uses existing single-plot handlers for remove crop, pest, and weed actions', () => {
    const { actions, activePlotId } = createPlotActions()

    actions.doRemoveCrop()
    activePlotId.value = 2
    actions.doCurePest()
    activePlotId.value = 2
    actions.doClearWeed()

    expect(handleRemoveCrop).toHaveBeenCalledWith(2)
    expect(handleCurePest).toHaveBeenCalledWith(2)
    expect(handleClearWeed).toHaveBeenCalledWith(2)
    expect(activePlotId.value).toBeNull()
  })

  it('handles breeding seed planting and advances time only after a successful plant', () => {
    const plantGeneticSeed = vi.fn(() => true)
    const removeBreedingSeed = vi.fn()
    const advanceTime = vi.fn(() => ({ message: '过了10分钟' }))
    const seed: BreedingSeed = {
      genetics: makeGenetics(),
      label: '青菜 G2'
    }
    const activePlotId = ref<number | null>(2)
    const selectedSeed = ref(null)

    const actions = useFarmPlotActions({
      activePlotId,
      selectedSeed,
      plots: () => [makePlot({ id: 2 })],
      breedingSeeds: () => [seed],
      getCropName: () => '青菜',
      plantGeneticSeed,
      removeBreedingSeed,
      advanceTime,
      addItem: vi.fn(() => true),
      removeItem: vi.fn(() => true),
      applyFertilizer: vi.fn(() => true),
      placeSprinkler: vi.fn(() => true),
      removeSprinkler: vi.fn(() => null),
      harvestGiantCrop: vi.fn(() => null)
    })

    actions.doPlantGeneticSeed('gene-1')

    expect(plantGeneticSeed).toHaveBeenCalledWith(2, seed.genetics)
    expect(removeBreedingSeed).toHaveBeenCalledWith('gene-1')
    expect(advanceTime).toHaveBeenCalledWith(ACTION_TIME_COSTS.plant)
    expect(addLog).toHaveBeenCalledWith('种下了育种种子：青菜 G2。')
    expect(activePlotId.value).toBeNull()
  })

  it('falls back to normal harvest handling when the active plot is missing', () => {
    const harvestGiantCrop = vi.fn(() => ({ cropId: 'cabbage', quantity: 9 }))
    const { actions, activePlotId } = createPlotActions({
      plots: [],
      harvestGiantCrop
    })

    actions.doHarvest()

    expect(harvestGiantCrop).not.toHaveBeenCalled()
    expect(handlePlotClick).toHaveBeenCalledWith(2)
    expect(activePlotId.value).toBeNull()
  })

  it('uses the giant crop branch before falling back to normal harvest handling', () => {
    const addItem = vi.fn(() => true)
    const harvestGiantCrop = vi.fn(() => ({ cropId: 'cabbage', quantity: 9 }))
    const { actions, activePlotId } = createPlotActions({
      plots: [makePlot({ id: 2, state: 'harvestable', cropId: 'cabbage', giantCropGroup: 1 })],
      addItem,
      harvestGiantCrop
    })

    actions.doHarvest()

    expect(harvestGiantCrop).toHaveBeenCalledWith(2)
    expect(addItem).toHaveBeenCalledWith('cabbage', 9)
    expect(addLog).toHaveBeenCalledWith('收获了巨型青菜！获得了9个青菜！')
    expect(showFloat).toHaveBeenCalledWith('巨型青菜 ×9', 'accent')
    expect(sfxHarvest).toHaveBeenCalled()
    expect(handlePlotClick).not.toHaveBeenCalled()
    expect(activePlotId.value).toBeNull()
  })

  it('restores items when fertilizer or sprinkler placement fails', () => {
    const addItem = vi.fn(() => true)
    const { actions } = createPlotActions({
      addItem,
      applyFertilizer: vi.fn(() => false),
      placeSprinkler: vi.fn(() => false)
    })

    actions.doFertilize('speed_gro')
    const second = createPlotActions({
      addItem,
      applyFertilizer: vi.fn(() => true),
      placeSprinkler: vi.fn(() => false)
    })
    second.actions.doPlaceSprinkler('bamboo_sprinkler')

    expect(addItem).toHaveBeenCalledWith('speed_gro')
    expect(addItem).toHaveBeenCalledWith('bamboo_sprinkler')
  })
})
