import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as gameLog from '@/composables/useGameLog'
import { useInventoryStore } from '@/stores/useInventoryStore'
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

  it('runs multiple wine recipes and repeated batches in one workshop', () => {
    const inventoryStore = useInventoryStore()
    const processingStore = useProcessingStore()
    inventoryStore.addItem('watermelon', 2)
    inventoryStore.addItem('osmanthus', 1)
    processingStore.machines = [
      {
        machineType: 'wine_workshop',
        recipeId: null,
        inputItemId: null,
        daysProcessed: 0,
        totalDays: 0,
        ready: false
      }
    ]

    expect(processingStore.startProcessing(0, 'wine_watermelon')).toBe(true)
    expect(processingStore.startProcessing(0, 'wine_osmanthus')).toBe(true)
    expect(processingStore.startProcessing(0, 'wine_watermelon')).toBe(true)
    expect(processingStore.machines[0]?.wineJobs?.map(job => job.recipeId)).toEqual([
      'wine_watermelon',
      'wine_osmanthus',
      'wine_watermelon'
    ])
    expect(inventoryStore.getItemCount('watermelon')).toBe(0)
    expect(inventoryStore.getItemCount('osmanthus')).toBe(0)

    processingStore.dailyUpdate()
    processingStore.dailyUpdate()
    const result = processingStore.dailyUpdate()

    expect(result.readyNames).toEqual(['西瓜酒', '桂花酿', '西瓜酒'])
    expect(processingStore.machines[0]?.wineJobs?.every(job => job.ready)).toBe(true)

    const firstJobId = processingStore.machines[0]?.wineJobs?.[0]?.id
    expect(firstJobId).toBeTruthy()
    expect(processingStore.collectWineJob(0, firstJobId!)).toBe('watermelon_wine')
    expect(inventoryStore.getItemCount('watermelon_wine')).toBe(1)
    expect(processingStore.machines[0]?.wineJobs).toHaveLength(2)
  })

  it('migrates a legacy single wine job into the wine queue', () => {
    const processingStore = useProcessingStore()

    processingStore.deserialize({
      machines: [
        {
          machineType: 'wine_workshop',
          recipeId: 'wine_peach',
          inputItemId: 'peach',
          daysProcessed: 2,
          totalDays: 3,
          ready: false
        }
      ],
      workshopLevel: 0,
      collapsedGroups: []
    })

    expect(processingStore.machines[0]).toMatchObject({
      recipeId: null,
      inputItemId: null,
      daysProcessed: 0,
      totalDays: 0,
      ready: false
    })
    expect(processingStore.machines[0]?.wineJobs?.[0]).toMatchObject({
      recipeId: 'wine_peach',
      inputItemId: 'peach',
      daysProcessed: 2,
      totalDays: 3,
      ready: false
    })
  })
})
