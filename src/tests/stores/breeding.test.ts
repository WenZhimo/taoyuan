import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as gameLog from '@/composables/useGameLog'
import { useBreedingStore } from '@/stores/useBreedingStore'
import type { SeedGenetics } from '@/types'

const createGenetics = (id: string): SeedGenetics => ({
  id,
  cropId: 'cabbage',
  generation: 0,
  sweetness: 50,
  yield: 50,
  resistance: 50,
  stability: 100,
  mutationRate: 1,
  parentA: null,
  parentB: null,
  parentCropA: null,
  parentCropB: null,
  isHybrid: false,
  hybridId: null
})

describe('breeding store end day update', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(gameLog, 'addLog').mockImplementation(() => {})
    vi.spyOn(Math, 'random').mockReturnValue(1)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns completion logs while preserving breeding state updates', () => {
    const breedingStore = useBreedingStore()
    breedingStore.deserialize({
      stations: [
        {
          parentA: createGenetics('parent-a'),
          parentB: createGenetics('parent-b'),
          daysProcessed: 0,
          totalDays: 1,
          result: null,
          ready: false
        }
      ],
      stationCount: 1
    })

    const result = breedingStore.dailyUpdate()

    expect(result.completedCount).toBe(1)
    expect(result.logs).toHaveLength(1)
    expect(result.logs[0]).toMatch(/^育种完成：.+（\d星）。$/)
    expect(breedingStore.stations[0]).toMatchObject({
      daysProcessed: 1,
      ready: true
    })
    expect(breedingStore.stations[0]?.result).not.toBeNull()
    expect(gameLog.addLog).not.toHaveBeenCalled()
  })
})
