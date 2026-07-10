import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGreenhouseActions } from '@/composables/farm/useGreenhouseActions'
import type { UseGreenhouseActionsOptions } from '@/composables/farm/useGreenhouseActions'
import type { ChunkedBatchOptions } from '@/composables/farm/useFarmBatchUi'
import { addLog, showFloat } from '@/composables/useGameLog'
import { sfxHarvest, sfxPlant } from '@/composables/useAudio'
import { GREENHOUSE_BATCH_LIMIT } from '@/domain/farm/batchLimits'
import type { GreenhouseUpgradeDef } from '@/data/buildings'
import type { BreedingSeed, SeedGenetics } from '@/types/breeding'
import type { CropDef, FarmPlot } from '@/types/farm'
vi.mock('@/composables/useGameLog', () => ({
  addLog: vi.fn(),
  showFloat: vi.fn()
}))

vi.mock('@/composables/useAudio', () => ({
  sfxHarvest: vi.fn(),
  sfxPlant: vi.fn()
}))

const makeCrop = (overrides: Partial<CropDef> = {}): CropDef => ({
  id: 'cabbage',
  name: '青菜',
  seedId: 'cabbage_seed',
  season: ['spring'],
  growthDays: 5,
  sellPrice: 10,
  seedPrice: 5,
  deepWatering: false,
  description: '测试作物',
  ...overrides
})

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
  generation: 3,
  sweetness: 40,
  yield: 100,
  resistance: 5,
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

const upgrade: GreenhouseUpgradeDef = {
  level: 1,
  name: '宽敞温室',
  plotCount: 12,
  gridCols: 4,
  cost: 500,
  materialCost: [{ itemId: 'wood', quantity: 20 }],
  description: '测试升级'
}

const createActions = (overrides: Partial<UseGreenhouseActionsOptions> & {
  activeGhPlotId?: number | null
  showGhBatchPlantInitial?: boolean
  showGhBatchFertilizeInitial?: boolean
  showGhUpgradeModalInitial?: boolean
} = {}) => {
  const activeGhPlotId = ref<number | null>(overrides.activeGhPlotId ?? 1)
  const showGhBatchPlant = ref(overrides.showGhBatchPlantInitial ?? true)
  const showGhBatchFertilize = ref(overrides.showGhBatchFertilizeInitial ?? true)
  const showGhUpgradeModal = ref(overrides.showGhUpgradeModalInitial ?? true)
  const plots = ref<FarmPlot[]>(
    overrides.greenhousePlots?.() as FarmPlot[] ?? [
      makePlot({ id: 0, state: 'tilled' }),
      makePlot({ id: 1, state: 'harvestable', cropId: 'cabbage', seedGenetics: makeGenetics() })
    ]
  )
  const breedingSeeds = ref<BreedingSeed[]>(
    overrides.breedingSeeds?.() as BreedingSeed[] ?? [{ genetics: makeGenetics(), label: '青菜 G3' }]
  )
  const getCropById = overrides.getCropById ?? ((cropId: string) => (cropId === 'cabbage' ? makeCrop() : undefined))
  const getItemCount = overrides.getItemCount ?? ((itemId: string) => (itemId === 'cabbage_seed' ? 20 : 99))
  const runChunkedBatch =
    overrides.runChunkedBatch ??
    vi.fn(async ({ total, chunkSize = total, processChunk }: ChunkedBatchOptions) => {
      let processed = 0
      while (processed < total) {
        const end = Math.min(processed + chunkSize, total)
        const requested = end - processed
        const completed = await processChunk(processed, end)
        processed += completed
        if (completed < requested) break
      }
      return { total, processed, cancelled: false }
    })

  const options: UseGreenhouseActionsOptions = {
    activeGhPlotId,
    ghTilledEmptyCount: overrides.ghTilledEmptyCount ?? (() => plots.value.filter(plot => plot.state === 'tilled').length),
    nextGhUpgrade: overrides.nextGhUpgrade ?? (() => upgrade),
    showGhBatchFertilize,
    showGhBatchPlant,
    showGhUpgradeModal,
    greenhousePlots: overrides.greenhousePlots ?? (() => plots.value),
    breedingSeeds: overrides.breedingSeeds ?? (() => breedingSeeds.value),
    getCropById,
    getCropName: overrides.getCropName ?? ((cropId: string) => (cropId === 'cabbage' ? '青菜' : cropId)),
    getItemCount,
    removeItem: overrides.removeItem ?? vi.fn(() => true),
    addItem: overrides.addItem ?? vi.fn(() => true),
    consumeStamina: overrides.consumeStamina ?? vi.fn(() => true),
    stamina: overrides.stamina ?? (() => 99),
    earnMoney: overrides.earnMoney ?? vi.fn(),
    spendMoney: overrides.spendMoney ?? vi.fn(() => true),
    greenhousePlantCrop: overrides.greenhousePlantCrop ?? vi.fn(() => true),
    greenhousePlantGeneticSeed: overrides.greenhousePlantGeneticSeed ?? vi.fn(() => true),
    greenhouseHarvestPlot:
      overrides.greenhouseHarvestPlot ??
      vi.fn(() => ({
        cropId: 'cabbage',
        genetics: makeGenetics()
      })),
    applyGreenhouseFertilizer: overrides.applyGreenhouseFertilizer ?? vi.fn(() => true),
    upgradeGreenhouse: overrides.upgradeGreenhouse ?? vi.fn(() => true),
    removeBreedingSeed: overrides.removeBreedingSeed ?? vi.fn(),
    addBreedingSeed: overrides.addBreedingSeed ?? vi.fn(() => true),
    recordHybridGrown: overrides.recordHybridGrown ?? vi.fn(),
    rollCropQuality: overrides.rollCropQuality ?? (() => 'normal'),
    applyCropBlessing: overrides.applyCropBlessing ?? (quality => quality),
    runWithLargeBatchConfirm: overrides.runWithLargeBatchConfirm ?? vi.fn((_label, _total, run) => {
      void run()
      return true
    }),
    runChunkedBatch
  }

  return {
    actions: useGreenhouseActions(options),
    activeGhPlotId,
    breedingSeeds,
    options,
    plots,
    showGhBatchPlant,
    showGhBatchFertilize,
    showGhUpgradeModal
  }
}

describe('useGreenhouseActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
  })

  it('plants a normal greenhouse seed and closes the selected plot', () => {
    const greenhousePlantCrop = vi.fn(() => true)
    const removeItem = vi.fn(() => true)
    const { actions, activeGhPlotId } = createActions({ greenhousePlantCrop, removeItem })

    actions.doGhPlant('cabbage')

    expect(removeItem).toHaveBeenCalledWith('cabbage_seed')
    expect(greenhousePlantCrop).toHaveBeenCalledWith(1, 'cabbage')
    expect(addLog).toHaveBeenCalledWith('在温室中播种了青菜。')
    expect(activeGhPlotId.value).toBeNull()
  })

  it('fertilizes a selected greenhouse plot and closes it', () => {
    const removeItem = vi.fn(() => true)
    const applyGreenhouseFertilizer = vi.fn(() => true)
    const { actions, activeGhPlotId } = createActions({ applyGreenhouseFertilizer, removeItem })

    actions.doGhFertilize('basic_fertilizer')

    expect(removeItem).toHaveBeenCalledWith('basic_fertilizer')
    expect(applyGreenhouseFertilizer).toHaveBeenCalledWith(1, 'basic_fertilizer')
    expect(showFloat).toHaveBeenCalledWith('温室施肥', 'success')
    expect(activeGhPlotId.value).toBeNull()
  })

  it('batch fertilizes eligible greenhouse plots in chunks', async () => {
    const removeItem = vi.fn(() => true)
    const applyGreenhouseFertilizer = vi.fn(() => true)
    const plots = [
      makePlot({ id: 0 }),
      makePlot({ id: 1, state: 'growing', cropId: 'cabbage' }),
      makePlot({ id: 2, fertilizer: 'quality_fertilizer' })
    ]
    const { actions, showGhBatchFertilize } = createActions({
      applyGreenhouseFertilizer,
      getItemCount: itemId => (itemId === 'basic_fertilizer' ? 5 : 0),
      greenhousePlots: () => plots,
      removeItem
    })

    await actions.doGhBatchFertilize('basic_fertilizer', true)

    expect(removeItem).toHaveBeenCalledWith('basic_fertilizer', 2)
    expect(applyGreenhouseFertilizer).toHaveBeenCalledTimes(2)
    expect(showFloat).toHaveBeenCalledWith('温室施肥 ×2', 'success')
    expect(showGhBatchFertilize.value).toBe(false)
  })

  it('harvests once with quality, sweetness, and returned breeding seed rewards', () => {
    vi.mocked(Math.random).mockReturnValue(0)
    const addItem = vi.fn(() => true)
    const earnMoney = vi.fn()
    const addBreedingSeed = vi.fn(() => true)
    const greenhouseHarvestPlot = vi.fn(() => ({ cropId: 'cabbage', genetics: makeGenetics({ sweetness: 50 }) }))
    const { actions, activeGhPlotId } = createActions({
      addBreedingSeed,
      addItem,
      earnMoney,
      greenhouseHarvestPlot,
      rollCropQuality: () => 'fine'
    })

    actions.doGhHarvest()

    expect(greenhouseHarvestPlot).toHaveBeenCalledWith(1)
    expect(addItem).toHaveBeenCalledWith('cabbage', 2, 'fine')
    expect(earnMoney).toHaveBeenCalledWith(5)
    expect(addBreedingSeed).toHaveBeenCalled()
    expect(showFloat).toHaveBeenCalledWith('+青菜×2(优良)', 'success')
    expect(sfxHarvest).toHaveBeenCalled()
    expect(activeGhPlotId.value).toBeNull()
  })

  it('queues batch harvest behind the large batch confirmation callback', async () => {
    const queued = { run: null as (() => void | Promise<void>) | null }
    const runWithLargeBatchConfirm = vi.fn((_label: string, _total: number, run: () => void | Promise<void>) => {
      queued.run = run
      return false
    })
    const greenhouseHarvestPlot = vi.fn(() => ({ cropId: 'cabbage', genetics: null }))
    const plots = Array.from({ length: GREENHOUSE_BATCH_LIMIT + 1 }, (_, id) =>
      makePlot({ id, state: 'harvestable', cropId: 'cabbage' })
    )
    const { actions } = createActions({
      greenhouseHarvestPlot,
      greenhousePlots: () => plots,
      stamina: () => GREENHOUSE_BATCH_LIMIT + 1,
      runWithLargeBatchConfirm
    })

    await actions.doGhBatchHarvest()

    expect(runWithLargeBatchConfirm).toHaveBeenCalledWith('温室一键收获', GREENHOUSE_BATCH_LIMIT + 1, expect.any(Function), GREENHOUSE_BATCH_LIMIT)
    expect(greenhouseHarvestPlot).not.toHaveBeenCalled()

    const queuedRun = queued.run
    if (!queuedRun) throw new Error('expected batch action to be queued')
    await queuedRun()

    expect(greenhouseHarvestPlot).toHaveBeenCalledTimes(GREENHOUSE_BATCH_LIMIT + 1)
    expect(addLog).toHaveBeenCalledWith(expect.stringContaining(`在温室一键收获了${GREENHOUSE_BATCH_LIMIT + 1}株作物。`))
  })

  it('batch plants only tilled plots and closes the batch dialog', async () => {
    const removeItem = vi.fn(() => true)
    const addItem = vi.fn(() => true)
    const greenhousePlantCrop = vi.fn(() => true)
    const consumeStamina = vi.fn(() => true)
    const plots = [
      makePlot({ id: 0, state: 'tilled' }),
      makePlot({ id: 1, state: 'harvestable', cropId: 'cabbage' }),
      makePlot({ id: 2, state: 'tilled' })
    ]
    const { actions, showGhBatchPlant } = createActions({
      addItem,
      consumeStamina,
      getItemCount: itemId => (itemId === 'cabbage_seed' ? 5 : 0),
      ghTilledEmptyCount: () => 2,
      greenhousePlantCrop,
      greenhousePlots: () => plots,
      removeItem,
      stamina: () => 5
    })

    await actions.doGhBatchPlant('cabbage', true)

    expect(removeItem).toHaveBeenCalledWith('cabbage_seed', 2)
    expect(greenhousePlantCrop).toHaveBeenCalledTimes(2)
    expect(addItem).not.toHaveBeenCalledWith('cabbage_seed', expect.any(Number))
    expect(sfxPlant).toHaveBeenCalled()
    expect(showGhBatchPlant.value).toBe(false)
  })

  it('upgrades greenhouse only after materials and money are available', () => {
    const removeItem = vi.fn(() => true)
    const spendMoney = vi.fn(() => true)
    const upgradeGreenhouse = vi.fn(() => true)
    const { actions, showGhUpgradeModal } = createActions({
      getItemCount: itemId => (itemId === 'wood' ? 20 : 0),
      removeItem,
      spendMoney,
      upgradeGreenhouse
    })

    actions.handleGhUpgrade()

    expect(spendMoney).toHaveBeenCalledWith(500)
    expect(removeItem).toHaveBeenCalledWith('wood', 20)
    expect(upgradeGreenhouse).toHaveBeenCalledWith(12)
    expect(showGhUpgradeModal.value).toBe(false)
  })
})
