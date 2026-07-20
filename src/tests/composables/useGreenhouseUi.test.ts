import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useGreenhouseUi } from '@/composables/farm/useGreenhouseUi'
import type { GreenhouseUpgradeDef } from '@/data/buildings'
import { CROPS } from '@/data/crops'
import { getOfficialCropDefs } from '@/domain/mods/contentAccess'
import type { CropDef, FarmPlot } from '@/types/farm'
import type { SeedGenetics } from '@/types/breeding'

const makeCrop = (overrides: Partial<CropDef>): CropDef => ({
  id: 'cabbage',
  name: 'Cabbage',
  seedId: 'cabbage_seed',
  season: ['spring'],
  growthDays: 5,
  sellPrice: 10,
  seedPrice: 5,
  deepWatering: false,
  description: 'test crop',
  ...overrides
})

const makePlot = (overrides: Partial<FarmPlot>): FarmPlot => ({
  id: 0,
  state: 'tilled',
  cropId: null,
  growthDays: 0,
  watered: true,
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

const makeGenetics = (overrides: Partial<SeedGenetics>): SeedGenetics => ({
  id: 'seed-1',
  cropId: 'cabbage',
  generation: 1,
  yield: 0,
  sweetness: 0,
  resistance: 0,
  stability: 0,
  mutationRate: 1,
  parentA: null,
  parentB: null,
  parentCropA: null,
  parentCropB: null,
  isHybrid: false,
  hybridId: null,
  ...overrides
})

const upgrades: GreenhouseUpgradeDef[] = [
  {
    level: 1,
    name: 'Level 1',
    description: 'first upgrade',
    cost: 100,
    plotCount: 20,
    gridCols: 5,
    materialCost: [{ itemId: 'wood', quantity: 10 }]
  }
]

interface CreateGreenhouseUiOptions {
  crops?: readonly CropDef[]
  itemCounts?: Record<string, number>
}

const createGreenhouseUi = (options: CreateGreenhouseUiOptions = {}) => {
  const greenhouseUnlocked = ref(true)
  const greenhouseLevel = ref(0)
  const plots = ref<FarmPlot[]>([
    makePlot({ id: 2, state: 'tilled' }),
    makePlot({ id: 3, state: 'harvestable', cropId: 'tomato', growthDays: 6 }),
    makePlot({ id: 4, state: 'growing', cropId: 'cabbage', growthDays: 2, fertilizer: 'speed_gro' }),
    makePlot({ id: 5, state: 'planted', cropId: 'cabbage', growthDays: 1, seedGenetics: makeGenetics({ id: 'gen-plot', generation: 2 }) })
  ])
  const crops = ref<CropDef[]>(options.crops ? [...options.crops] : [
    makeCrop({ id: 'cabbage', name: 'Cabbage', seedId: 'cabbage_seed', growthDays: 5, regrowth: false }),
    makeCrop({ id: 'tomato', name: 'Tomato', seedId: 'tomato_seed', growthDays: 6, regrowth: true })
  ])
  const itemCounts = ref<Record<string, number>>(options.itemCounts ?? {
    cabbage_seed: 4,
    tomato_seed: 0,
    wood: 8
  })
  const breedingSeeds = ref([
    { cropId: 'cabbage', genetics: makeGenetics({ id: 'gen-1', cropId: 'cabbage', generation: 3 }) },
    { cropId: 'missing', genetics: makeGenetics({ id: 'gen-2', cropId: 'missing', generation: 2 }) }
  ])

  const greenhouseUi = useGreenhouseUi({
    breedingSeeds: () => breedingSeeds.value,
    crops: () => crops.value,
    cropGrowthBonus: () => 0.1,
    getCropById: cropId => crops.value.find(crop => crop.id === cropId),
    getFertilizerById: fertilizer => (fertilizer === 'speed_gro' ? { growthSpeedup: 0.2 } : undefined),
    getItemCount: itemId => itemCounts.value[itemId] ?? 0,
    getItemName: itemId => `${itemId} name`,
    getStarRating: genetics => genetics.generation,
    greenhouseLevel: () => greenhouseLevel.value,
    greenhousePlots: () => plots.value,
    greenhouseUnlocked: () => greenhouseUnlocked.value,
    upgrades
  })

  return {
    breedingSeeds,
    greenhouseLevel,
    greenhouseUi,
    greenhouseUnlocked,
    itemCounts,
    plots
  }
}

describe('useGreenhouseUi', () => {
  it('keeps the registry-backed greenhouse seed catalog equivalent to the legacy crop order', () => {
    const itemCounts = Object.fromEntries(CROPS.map((crop, index) => [crop.seedId, index + 1]))
    const { greenhouseUi } = createGreenhouseUi({
      crops: getOfficialCropDefs(),
      itemCounts
    })

    expect(greenhouseUi.allSeeds.value).toEqual(CROPS.map((crop, index) => ({
      cropId: crop.id,
      name: crop.name,
      count: index + 1,
      regrowth: crop.regrowth ?? false
    })))
  })

  it('derives greenhouse counts, state stats, and crop stats', () => {
    const { greenhouseUi } = createGreenhouseUi()

    expect(greenhouseUi.showGreenhouse.value).toBe(true)
    expect(greenhouseUi.ghHarvestableCount.value).toBe(1)
    expect(greenhouseUi.ghTilledEmptyCount.value).toBe(1)
    expect(greenhouseUi.ghFertilizableCount.value).toBe(3)
    expect(greenhouseUi.ghPlantedCount.value).toBe(3)
    expect(greenhouseUi.ghStateStats.value.map(stat => [stat.key, stat.count, stat.firstPlotId])).toEqual([
      ['tilled', 1, 2],
      ['planted', 1, 5],
      ['growing', 1, 4],
      ['harvestable', 1, 3]
    ])

    expect(greenhouseUi.ghCropStats.value.map(stat => ({
      key: stat.key,
      count: stat.count,
      harvestable: stat.harvestable,
      growing: stat.growing,
      avgProgress: stat.avgProgress
    }))).toEqual([
      { key: 'tomato:base', count: 1, harvestable: 1, growing: 0, avgProgress: null },
      { key: 'cabbage:base', count: 1, harvestable: 0, growing: 1, avgProgress: 66 },
      { key: 'cabbage:2', count: 1, harvestable: 0, growing: 1, avgProgress: 25 }
    ])
  })

  it('derives upgrade material rows and seed options reactively', () => {
    const { greenhouseUi, itemCounts } = createGreenhouseUi()

    expect(greenhouseUi.nextGhUpgrade.value?.name).toBe('Level 1')
    expect(greenhouseUi.ghUpgradeMaterialRows.value).toEqual([
      { itemId: 'wood', name: 'wood name', current: 8, required: 10 }
    ])
    expect(greenhouseUi.allSeeds.value).toEqual([
      { cropId: 'cabbage', name: 'Cabbage', count: 4, regrowth: false }
    ])
    expect(greenhouseUi.ghSeedOptions.value).toEqual(greenhouseUi.allSeeds.value)

    itemCounts.value.tomato_seed = 6

    expect(greenhouseUi.allSeeds.value.map(seed => seed.cropId)).toEqual(['cabbage', 'tomato'])
  })

  it('filters greenhouse breeding seeds to known crops and formats display options', () => {
    const { greenhouseUi } = createGreenhouseUi()

    expect(greenhouseUi.ghPlantableBreedingSeeds.value.map(seed => seed.genetics.id)).toEqual(['gen-1'])
    expect(greenhouseUi.ghBreedingSeedOptions.value).toEqual([
      { id: 'gen-1', cropName: 'Cabbage', generation: 3, starRating: 3 }
    ])
  })

  it('closes all greenhouse dialogs together', () => {
    const { greenhouseUi } = createGreenhouseUi()

    greenhouseUi.showGreenhouseModal.value = true
    greenhouseUi.showGhBatchFertilize.value = true
    greenhouseUi.showGhBatchPlant.value = true
    greenhouseUi.showGhUpgradeModal.value = true

    greenhouseUi.closeGreenhouseDialogs()

    expect(greenhouseUi.showGreenhouseModal.value).toBe(false)
    expect(greenhouseUi.showGhBatchFertilize.value).toBe(false)
    expect(greenhouseUi.showGhBatchPlant.value).toBe(false)
    expect(greenhouseUi.showGhUpgradeModal.value).toBe(false)
  })

  it('keeps repeated greenhouse stat derivation over large plot lists cheap', () => {
    const { greenhouseUi, plots } = createGreenhouseUi()
    plots.value = Array.from({ length: 10_000 }, (_, index) =>
      makePlot({
        id: index,
        state: index % 3 === 0 ? 'harvestable' : index % 3 === 1 ? 'growing' : 'tilled',
        cropId: index % 3 === 2 ? null : index % 2 === 0 ? 'cabbage' : 'tomato',
        growthDays: index % 5
      })
    )

    const start = performance.now()

    expect(greenhouseUi.ghHarvestableCount.value).toBe(3334)
    expect(greenhouseUi.ghStateStats.value.reduce((sum, stat) => sum + stat.count, 0)).toBe(10_000)
    expect(greenhouseUi.ghCropStats.value.length).toBeGreaterThan(0)

    expect(performance.now() - start).toBeLessThan(500)
  })
})
