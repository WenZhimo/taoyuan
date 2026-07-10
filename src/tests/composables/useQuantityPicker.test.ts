import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { clampQuantity, parseQuantityInput, useQuantityPicker } from '@/composables/game/useQuantityPicker'

describe('useQuantityPicker', () => {
  it('clamps quantities to a minimum of one and the active max', () => {
    expect(clampQuantity(0, 20)).toBe(1)
    expect(clampQuantity(21, 20)).toBe(20)
    expect(clampQuantity(9.9, 20)).toBe(9)
    expect(clampQuantity(Number.NaN, 20)).toBe(1)
    expect(clampQuantity(3, 0)).toBe(1)
  })

  it('parses input strings while preserving the fallback for invalid values', () => {
    expect(parseQuantityInput('13', 1)).toBe(13)
    expect(parseQuantityInput('13abc', 1)).toBe(13)
    expect(parseQuantityInput('abc', 7)).toBe(7)
  })

  it('tracks min/max button state and add helpers', () => {
    const picker = useQuantityPicker({ initialQuantity: 5, maxQuantity: ref(10) })

    expect(picker.quantity.value).toBe(5)
    expect(picker.canDecrease.value).toBe(true)
    expect(picker.canIncrease.value).toBe(true)

    picker.addQuantity(-10)
    expect(picker.quantity.value).toBe(1)
    expect(picker.canDecrease.value).toBe(false)

    picker.addQuantity(99)
    expect(picker.quantity.value).toBe(10)
    expect(picker.canIncrease.value).toBe(false)
  })

  it('responds to changing max values and explicit min/max helpers', () => {
    const maxQuantity = ref(20)
    const picker = useQuantityPicker({ maxQuantity })

    picker.setMaxQuantity()
    expect(picker.quantity.value).toBe(20)

    maxQuantity.value = 3
    picker.setQuantity(picker.quantity.value)
    expect(picker.quantity.value).toBe(3)

    picker.setMinQuantity()
    expect(picker.quantity.value).toBe(1)
  })

  it('sets quantities from text inputs and keeps invalid inputs stable', () => {
    const picker = useQuantityPicker({ initialQuantity: 4, maxQuantity: () => 8 })

    picker.setQuantityFromInput('6')
    expect(picker.quantity.value).toBe(6)

    picker.setQuantityFromInput('not a number')
    expect(picker.quantity.value).toBe(6)

    picker.setQuantityFromInput('99')
    expect(picker.quantity.value).toBe(8)
  })

  it('keeps repeated quantity updates cheap', () => {
    const picker = useQuantityPicker({ maxQuantity: () => 999_999 })
    const iterations = 100_000
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      picker.setQuantity(i)
      picker.addQuantity(i % 3 === 0 ? 1 : -1)
    }

    expect(picker.quantity.value).toBeGreaterThan(0)
    expect((performance.now() - start) / iterations).toBeLessThan(0.01)
  })
})
