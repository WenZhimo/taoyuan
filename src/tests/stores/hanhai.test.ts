import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as gameLog from '@/composables/useGameLog'
import { useHanhaiStore } from '@/stores/useHanhaiStore'

describe('hanhai store daily trade update', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(gameLog, 'addLog').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns completed quantities and leaves logging to the end-day processor', () => {
    const hanhaiStore = useHanhaiStore()
    hanhaiStore.tradeSlots = [
      {
        itemId: 'cabbage',
        quality: 'normal',
        quantity: 3,
        daysRemaining: 1,
        pointsReward: 120
      },
      {
        itemId: 'radish',
        quality: 'fine',
        quantity: 2,
        daysRemaining: 2,
        pointsReward: 90
      }
    ]

    const result = hanhaiStore.dailyTradeUpdate()

    expect(result).toEqual({
      completed: [{ itemId: 'cabbage', quantity: 3, points: 120 }]
    })
    expect(hanhaiStore.tradePoints).toBe(120)
    expect(hanhaiStore.tradeSlots).toEqual([
      {
        itemId: 'radish',
        quality: 'fine',
        quantity: 2,
        daysRemaining: 1,
        pointsReward: 90
      }
    ])
    expect(gameLog.addLog).not.toHaveBeenCalled()
  })
})
