import { describe, expect, it } from 'vitest'
import { rollChanceQuantity } from '@/domain/drops/rollChanceQuantity'

describe('rollChanceQuantity', () => {
  it('converts chance values into guaranteed quantities plus fractional rolls', () => {
    expect(rollChanceQuantity(0, () => 0)).toBe(0)
    expect(rollChanceQuantity(-1, () => 0)).toBe(0)
    expect(rollChanceQuantity(1, () => 0.99)).toBe(1)
    expect(rollChanceQuantity(2, () => 0.99)).toBe(2)
  })

  it('uses the fractional part as the probability of one extra quantity', () => {
    expect(rollChanceQuantity(0.5, () => 0.49)).toBe(1)
    expect(rollChanceQuantity(0.5, () => 0.5)).toBe(0)
    expect(rollChanceQuantity(1.5, () => 0.49)).toBe(2)
    expect(rollChanceQuantity(1.5, () => 0.5)).toBe(1)
    expect(rollChanceQuantity(2.5, () => 0.49)).toBe(3)
    expect(rollChanceQuantity(2.5, () => 0.5)).toBe(2)
  })

  it('keeps large batches fast enough for repeated drop rolls', () => {
    const iterations = 1_000_000
    const start = performance.now()
    let total = 0

    for (let i = 0; i < iterations; i++) {
      total += rollChanceQuantity(2.5, () => (i % 2 === 0 ? 0.49 : 0.5))
    }

    const elapsed = performance.now() - start
    expect(total).toBe(iterations * 2.5)
    expect(elapsed).toBeLessThan(1_000)
  })
})
