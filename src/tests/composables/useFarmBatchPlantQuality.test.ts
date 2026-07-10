import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { getCropById } from '@/data'
import { handleBatchPlant, type FarmBatchRunner } from '@/composables/useFarmActions'
import { useFarmStore } from '@/stores/useFarmStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { FarmPlot } from '@/types'

vi.mock('@/composables/useGameLog', () => ({
  addLog: vi.fn(),
  showFloat: vi.fn()
}))

vi.mock('@/composables/useEndDay', () => ({
  handleEndDay: vi.fn()
}))

vi.mock('@/composables/useAudio', () => ({
  sfxDig: vi.fn(),
  sfxPlant: vi.fn(),
  sfxWater: vi.fn(),
  sfxHarvest: vi.fn(),
  sfxLevelUp: vi.fn(),
  sfxBuy: vi.fn(),
  sfxCoin: vi.fn()
}))

const createTilledPlot = (id: number): FarmPlot => ({
  id,
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
  weedyDays: 0
})

const runAll: FarmBatchRunner = async options => {
  const processed = await options.processChunk(0, options.total)
  return {
    total: options.total,
    processed,
    cancelled: false
  }
}

describe('handleBatchPlant quality selection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('consumes only the selected seed quality', async () => {
    const crop = getCropById('cabbage')
    expect(crop).toBeDefined()

    const farmStore = useFarmStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    farmStore.plots = [createTilledPlot(0), createTilledPlot(1)]
    playerStore.stamina = 100
    inventoryStore.addItem(crop!.seedId, 5, 'normal')
    inventoryStore.addItem(crop!.seedId, 3, 'fine')

    await handleBatchPlant(crop!.id, runAll, 'fine')

    expect(inventoryStore.getItemCount(crop!.seedId, 'normal')).toBe(5)
    expect(inventoryStore.getItemCount(crop!.seedId, 'fine')).toBe(1)
    expect(farmStore.plots.every(plot => plot.cropId === crop!.id)).toBe(true)
  })

  it('refunds unused seeds with the originally selected quality', async () => {
    const crop = getCropById('cabbage')
    expect(crop).toBeDefined()

    const farmStore = useFarmStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    farmStore.plots = [createTilledPlot(0), createTilledPlot(1)]
    playerStore.stamina = 100
    inventoryStore.addItem(crop!.seedId, 5, 'normal')
    inventoryStore.addItem(crop!.seedId, 3, 'fine')

    const cancelAfterOne: FarmBatchRunner = async options => {
      const processed = await options.processChunk(0, 1)
      return {
        total: options.total,
        processed,
        cancelled: true
      }
    }

    await handleBatchPlant(crop!.id, cancelAfterOne, 'fine')

    expect(inventoryStore.getItemCount(crop!.seedId, 'normal')).toBe(5)
    expect(inventoryStore.getItemCount(crop!.seedId, 'fine')).toBe(2)
    expect(farmStore.plots.filter(plot => plot.cropId === crop!.id)).toHaveLength(1)
  })
})
