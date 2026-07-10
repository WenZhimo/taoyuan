import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as gameLog from '@/composables/useGameLog'
import { useProcessingStore } from '@/stores/useProcessingStore'

describe('processing store end day update', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(gameLog, 'addLog').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns auto-collected and ready outputs while advancing machine state', () => {
    const processingStore = useProcessingStore()
    processingStore.machines = [
      {
        machineType: 'bee_house',
        recipeId: 'honey',
        inputItemId: null,
        daysProcessed: 3,
        totalDays: 4,
        ready: false
      },
      {
        machineType: 'seed_maker',
        recipeId: null,
        inputItemId: null,
        daysProcessed: 0,
        totalDays: 0,
        ready: false,
        seedMakerJobs: [
          {
            id: 'seed-job-1',
            recipeId: 'seed_from_cabbage',
            inputItemId: 'cabbage',
            daysProcessed: 0,
            totalDays: 1,
            ready: false
          }
        ]
      }
    ]

    const result = processingStore.dailyUpdate()

    expect(result).toEqual({
      collected: ['蜂蜜'],
      readyNames: ['青菜种子']
    })
    expect(processingStore.machines[0]).toMatchObject({
      daysProcessed: 0,
      ready: false
    })
    expect(processingStore.machines[1]?.seedMakerJobs?.[0]).toMatchObject({
      daysProcessed: 1,
      ready: true
    })
    expect(gameLog.addLog).not.toHaveBeenCalled()
  })
})
