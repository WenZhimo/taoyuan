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

  it('preserves unknown facilities and recipes as read-only processing state', () => {
    const processingStore = useProcessingStore()
    const source = {
      machines: [
        {
          machineType: 'missing_pack:fermenter',
          recipeId: 'missing_pack:ancient_wine',
          inputItemId: 'missing_pack:fruit',
          inputQuality: 'fine' as const,
          daysProcessed: 2,
          totalDays: 5,
          ready: false
        }
      ],
      workshopLevel: 0,
      collapsedGroups: []
    }

    processingStore.deserialize(source)
    const before = JSON.stringify(processingStore.serialize())

    expect(processingStore.isMachineDefinitionAvailable('missing_pack:fermenter')).toBe(false)
    expect(processingStore.isRecipeDefinitionAvailable('missing_pack:ancient_wine')).toBe(false)
    expect(processingStore.isSlotReadOnly(processingStore.machines[0]!)).toBe(true)
    expect(processingStore.cancelProcessing(0)).toBe(false)
    expect(processingStore.collectProduct(0)).toBeNull()
    expect(processingStore.removeMachine(0)).toBe(false)
    expect(processingStore.dailyUpdate()).toEqual({ collected: [], readyNames: [] })
    expect(JSON.stringify(processingStore.serialize())).toBe(before)
  })

  it('does not advance or remove a known facility with an unknown recipe', () => {
    const processingStore = useProcessingStore()
    const source = {
      machines: [
        {
          machineType: 'bee_house',
          recipeId: 'missing_pack:ancient_honey',
          inputItemId: null,
          daysProcessed: 3,
          totalDays: 4,
          ready: false
        }
      ],
      workshopLevel: 0,
      collapsedGroups: []
    }

    processingStore.deserialize(source)
    const before = JSON.stringify(processingStore.serialize())

    expect(processingStore.isSlotReadOnly(processingStore.machines[0]!)).toBe(true)
    expect(processingStore.dailyUpdate()).toEqual({ collected: [], readyNames: [] })
    expect(processingStore.cancelProcessing(0)).toBe(false)
    expect(processingStore.removeMachine(0)).toBe(false)
    expect(JSON.stringify(processingStore.serialize())).toBe(before)
  })

  it('keeps unknown queued recipes unchanged until the data pack returns', () => {
    const processingStore = useProcessingStore()
    const source = {
      machines: [
        {
          machineType: 'seed_maker',
          recipeId: null,
          inputItemId: null,
          daysProcessed: 0,
          totalDays: 0,
          ready: false,
          seedMakerJobs: [
            {
              id: 'missing-job',
              recipeId: 'missing_pack:ancient_seed',
              inputItemId: 'missing_pack:seed',
              inputQuality: 'excellent' as const,
              daysProcessed: 1,
              totalDays: 3,
              ready: false
            }
          ]
        }
      ],
      workshopLevel: 0,
      collapsedGroups: []
    }

    processingStore.deserialize(source)
    const before = JSON.stringify(processingStore.serialize())

    expect(processingStore.isSlotReadOnly(processingStore.machines[0]!)).toBe(true)
    expect(processingStore.dailyUpdate()).toEqual({ collected: [], readyNames: [] })
    expect(processingStore.cancelSeedMakerJob(0, 'missing-job')).toBe(false)
    expect(processingStore.collectSeedMakerJob(0, 'missing-job')).toBeNull()
    expect(processingStore.removeMachine(0)).toBe(false)
    expect(JSON.stringify(processingStore.serialize())).toBe(before)
  })
})
