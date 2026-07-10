import { describe, expect, it } from 'vitest'
import { FARM_BATCH_LIMIT, GREENHOUSE_BATCH_LIMIT, shouldConfirmLargeBatch } from '@/domain/farm/batchLimits'

describe('farm batch limits', () => {
  it('uses the same internal chunk size for farm and greenhouse batch work', () => {
    expect(FARM_BATCH_LIMIT).toBe(1000)
    expect(GREENHOUSE_BATCH_LIMIT).toBe(FARM_BATCH_LIMIT)
  })

  it('requires confirmation only when a batch exceeds the internal chunk size', () => {
    expect(shouldConfirmLargeBatch(FARM_BATCH_LIMIT)).toBe(false)
    expect(shouldConfirmLargeBatch(FARM_BATCH_LIMIT + 1)).toBe(true)
    expect(shouldConfirmLargeBatch(100_000)).toBe(true)
  })

  it('keeps repeated large-batch checks cheap', () => {
    const iterations = 1_000_000
    const start = performance.now()
    let total = 0

    for (let i = 0; i < iterations; i++) {
      if (shouldConfirmLargeBatch(i)) total++
    }

    expect(total).toBe(iterations - FARM_BATCH_LIMIT - 1)
    expect(performance.now() - start).toBeLessThan(500)
  })
})
