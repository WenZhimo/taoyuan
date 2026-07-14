import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { FarmPlot, PlantedFruitTree, PlantedWildTree, Season } from '@/types'
import { FRUIT_TREE_DEFS } from '@/data/fruitTrees'
import { WILD_TREE_DEFS } from '@/data/wildTrees'
import { useFarmStore } from '@/stores/useFarmStore'

const createPlot = (id: number, overrides: Partial<FarmPlot> = {}): FarmPlot => ({
  id,
  state: 'planted',
  cropId: 'cabbage',
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

describe('farm store end day chunking', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps chunked farm updates equivalent to the original single pass', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1)
    const initialPlots = [
      createPlot(0, { giantCropGroup: 1 }),
      createPlot(1, { infested: true, infestedDays: 2 }),
      createPlot(2, { weedy: true, weedyDays: 3 }),
      createPlot(3, { watered: false, unwateredDays: 1 }),
      createPlot(4, { state: 'wasteland', cropId: null, watered: false })
    ]

    const runUpdate = (chunkSize?: number) => {
      setActivePinia(createPinia())
      const farmStore = useFarmStore()
      farmStore.plots = initialPlots.map(plot => ({ ...plot }))
      const result = farmStore.dailyUpdate(false, chunkSize ? { chunkSize } : {})
      return {
        result,
        plots: farmStore.plots.map(plot => ({ ...plot }))
      }
    }

    expect(runUpdate(2)).toEqual(runUpdate())
  })

  it('reports farm and greenhouse chunk progress at stable boundaries', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1)
    const farmStore = useFarmStore()
    farmStore.plots = Array.from({ length: 5 }, (_, index) => createPlot(index, { giantCropGroup: 1 }))
    farmStore.greenhousePlots = Array.from({ length: 5 }, (_, index) => createPlot(index))
    const farmProgress: number[] = []
    const greenhouseProgress: number[] = []

    farmStore.dailyUpdate(true, {
      chunkSize: 2,
      onChunkComplete: progress => farmProgress.push(progress.processed)
    })
    farmStore.greenhouseDailyUpdate({
      chunkSize: 2,
      onChunkComplete: progress => greenhouseProgress.push(progress.processed)
    })

    expect(farmProgress).toEqual([2, 4, 5])
    expect(greenhouseProgress).toEqual([2, 4, 5])
    expect(farmStore.plots.every(plot => plot.growthDays === 1)).toBe(true)
    expect(farmStore.greenhousePlots.every(plot => plot.growthDays === 1)).toBe(true)
  })

  it('processes 100,000 farm plots within the performance boundary', () => {
    const farmStore = useFarmStore()
    farmStore.plots = Array.from({ length: 100_000 }, (_, index) => createPlot(index, { giantCropGroup: 1 }))
    const progress: number[] = []

    const start = performance.now()
    const result = farmStore.dailyUpdate(true, {
      chunkSize: 2_000,
      onChunkComplete: value => progress.push(value.processed)
    })
    const elapsed = performance.now() - start

    expect(result).toEqual({
      newInfestations: 0,
      pestDeaths: 0,
      newWeeds: 0,
      weedDeaths: 0
    })
    expect(progress).toHaveLength(50)
    expect(progress[progress.length - 1]).toBe(100_000)
    expect(farmStore.plots[0]).toMatchObject({ state: 'growing', growthDays: 1 })
    expect(farmStore.plots[99_999]).toMatchObject({ state: 'growing', growthDays: 1 })
    expect(elapsed).toBeLessThan(5_000)
  })

  it('processes 100,000 greenhouse plots within the performance boundary', () => {
    const farmStore = useFarmStore()
    farmStore.greenhousePlots = Array.from({ length: 100_000 }, (_, index) => createPlot(index))
    const progress: number[] = []

    const start = performance.now()
    farmStore.greenhouseDailyUpdate({
      chunkSize: 2_000,
      onChunkComplete: value => progress.push(value.processed)
    })
    const elapsed = performance.now() - start

    expect(progress).toHaveLength(50)
    expect(progress[progress.length - 1]).toBe(100_000)
    expect(farmStore.greenhousePlots[0]).toMatchObject({ state: 'growing', growthDays: 1, watered: false })
    expect(farmStore.greenhousePlots[99_999]).toMatchObject({ state: 'growing', growthDays: 1, watered: false })
    expect(elapsed).toBeLessThan(5_000)
  })

  it('allows fruit and wild trees beyond the former planting limits', () => {
    const farmStore = useFarmStore()

    for (let i = 0; i < 100; i++) {
      expect(farmStore.plantFruitTree('peach_tree')).toBe(true)
      expect(farmStore.plantWildTree('pine')).toBe(true)
    }

    expect(farmStore.fruitTrees).toHaveLength(100)
    expect(farmStore.wildTrees).toHaveLength(100)
  })

  it('keeps fruit tree maturity, seasonal produce, and year aging equivalent', () => {
    const farmStore = useFarmStore()
    const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter']

    for (const season of seasons) {
      farmStore.fruitTrees = FRUIT_TREE_DEFS.map((tree, index): PlantedFruitTree => ({
        id: index,
        type: tree.type,
        growthDays: tree.growthDays - 1,
        mature: false,
        yearAge: 0,
        todayFruit: false
      }))

      const result = farmStore.dailyFruitTreeUpdate(season)
      expect(farmStore.fruitTrees.every(tree => tree.mature)).toBe(true)
      expect(result.fruits).toEqual(
        FRUIT_TREE_DEFS
          .filter(tree => tree.fruitSeason === season)
          .map(tree => ({ fruitId: tree.fruitId, quality: 'normal' }))
      )
      expect(farmStore.fruitTrees.map(tree => tree.todayFruit)).toEqual(
        FRUIT_TREE_DEFS.map(tree => tree.fruitSeason === season)
      )
    }

    farmStore.fruitTrees.forEach(tree => {
      tree.yearAge = 2
      tree.todayFruit = true
    })
    farmStore.fruitTreeSeasonUpdate(false)
    expect(farmStore.fruitTrees.every(tree => tree.yearAge === 2 && !tree.todayFruit)).toBe(true)
    farmStore.fruitTreeSeasonUpdate(true)
    expect(farmStore.fruitTrees.every(tree => tree.yearAge === 3)).toBe(true)
  })

  it('keeps wild tree growth, tapper timing, and collection equivalent', () => {
    const farmStore = useFarmStore()
    farmStore.wildTrees = WILD_TREE_DEFS.map((tree, index): PlantedWildTree => ({
      id: index,
      type: tree.type,
      growthDays: tree.growthDays - 1,
      mature: false,
      hasTapper: false,
      tapDaysElapsed: 0,
      tapReady: false,
      chopCount: 0
    }))

    expect(farmStore.dailyWildTreeUpdate().products).toEqual([])
    expect(farmStore.wildTrees.every(tree => tree.mature)).toBe(true)
    for (const [index, tree] of farmStore.wildTrees.entries()) {
      expect(farmStore.attachTapper(tree.id)).toBe(true)
      tree.tapDaysElapsed = WILD_TREE_DEFS[index]!.tapCycleDays - 1
    }

    expect(farmStore.dailyWildTreeUpdate().products).toEqual(WILD_TREE_DEFS.map((tree, index) => ({
      treeId: index,
      productId: tree.tapProduct,
      productName: tree.tapProductName
    })))
    for (const [index, tree] of farmStore.wildTrees.entries()) {
      expect(farmStore.collectTapProduct(tree.id)).toBe(WILD_TREE_DEFS[index]!.tapProduct)
      expect(tree).toMatchObject({ tapReady: false, tapDaysElapsed: 0 })
    }
  })

  it('restores every existing tree type without changing the save shape', () => {
    const sourceStore = useFarmStore()
    const payload = sourceStore.serialize()
    payload.fruitTrees = FRUIT_TREE_DEFS.map((tree, index): PlantedFruitTree => ({
      id: 100 + index,
      type: tree.type,
      growthDays: index,
      mature: index % 2 === 0,
      yearAge: index % 4,
      todayFruit: index % 3 === 0
    }))
    payload.wildTrees = WILD_TREE_DEFS.map((tree, index): PlantedWildTree => ({
      id: 200 + index,
      type: tree.type,
      growthDays: index + 1,
      mature: true,
      hasTapper: index !== 0,
      tapDaysElapsed: index,
      tapReady: index === 2,
      chopCount: index
    }))
    payload.nextFruitTreeId = 108
    payload.nextWildTreeId = 203

    setActivePinia(createPinia())
    const restoredStore = useFarmStore()
    restoredStore.deserialize(payload)

    const restored = restoredStore.serialize()
    expect(restored.fruitTrees).toEqual(payload.fruitTrees)
    expect(restored.wildTrees).toEqual(payload.wildTrees)
    expect(restored.nextFruitTreeId).toBe(108)
    expect(restored.nextWildTreeId).toBe(203)
  })

  it('updates 100,000 registered trees without a quantity-order regression', () => {
    const farmStore = useFarmStore()
    farmStore.fruitTrees = Array.from({ length: 50_000 }, (_, id): PlantedFruitTree => ({
      id,
      type: 'peach_tree',
      growthDays: 0,
      mature: false,
      yearAge: 0,
      todayFruit: false
    }))
    farmStore.wildTrees = Array.from({ length: 50_000 }, (_, id): PlantedWildTree => ({
      id,
      type: 'pine',
      growthDays: 0,
      mature: false,
      hasTapper: false,
      tapDaysElapsed: 0,
      tapReady: false,
      chopCount: 0
    }))

    const start = performance.now()
    expect(farmStore.dailyFruitTreeUpdate('winter').fruits).toEqual([])
    expect(farmStore.dailyWildTreeUpdate().products).toEqual([])
    const elapsed = performance.now() - start

    expect(farmStore.fruitTrees[0]?.growthDays).toBe(1)
    expect(farmStore.fruitTrees[49_999]?.growthDays).toBe(1)
    expect(farmStore.wildTrees[0]?.growthDays).toBe(1)
    expect(farmStore.wildTrees[49_999]?.growthDays).toBe(1)
    expect(elapsed).toBeLessThan(5_000)
  })
})
