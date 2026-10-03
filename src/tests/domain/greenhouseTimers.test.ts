import { describe, expect, it } from 'vitest'
import { createGreenhousePlotTimer, mergeGreenhousePlotTimers } from '@/domain/farm/greenhouseTimers'

describe('greenhouse plot timers', () => {
  it('merges timers with identical crop state and keeps plot ids deterministic', () => {
    const merged = mergeGreenhousePlotTimers([
      createGreenhousePlotTimer(8, 'cabbage'),
      createGreenhousePlotTimer(2, 'cabbage'),
      createGreenhousePlotTimer(8, 'cabbage'),
      createGreenhousePlotTimer(4, 'tomato')
    ])

    expect(merged).toHaveLength(2)
    expect(merged.find(timer => timer.cropId === 'cabbage')?.plotIds).toEqual([2, 8])
    expect(merged.find(timer => timer.cropId === 'tomato')?.plotIds).toEqual([4])
  })

  it('keeps fertilizer and breeding state as merge boundaries', () => {
    const base = createGreenhousePlotTimer(1, 'cabbage')
    const fertilized = createGreenhousePlotTimer(2, 'cabbage', { fertilizer: 'quality_fertilizer' })
    const breeding = createGreenhousePlotTimer(3, 'cabbage', {
      seedGenetics: {
        id: 'seed-1',
        cropId: 'cabbage',
        generation: 2,
        sweetness: 10,
        yield: 20,
        resistance: 30,
        stability: 50,
        mutationRate: 2,
        parentA: null,
        parentB: null,
        parentCropA: null,
        parentCropB: null,
        isHybrid: false,
        hybridId: null
      }
    })

    expect(mergeGreenhousePlotTimers([base, fertilized, breeding])).toHaveLength(3)
  })
})
