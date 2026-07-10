import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { FarmPlot } from '@/types'
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
})
