import { describe, expect, it } from 'vitest'
import {
  expandExtraInventoryCapacity,
  expandStandardInventoryCapacity,
  INITIAL_INVENTORY_CAPACITY,
  MAX_STANDARD_INVENTORY_CAPACITY
} from '@/domain/inventory/capacity'

describe('inventory capacity rules', () => {
  it('starts from the established inventory capacity baseline', () => {
    expect(INITIAL_INVENTORY_CAPACITY).toBe(24)
    expect(MAX_STANDARD_INVENTORY_CAPACITY).toBe(60)
  })

  it('expands standard capacity by four slots up to the normal cap', () => {
    expect(expandStandardInventoryCapacity(24)).toEqual({ success: true, capacity: 28 })
    expect(expandStandardInventoryCapacity(58)).toEqual({ success: true, capacity: 60 })
  })

  it('does not standard-expand once the normal cap is reached or exceeded', () => {
    expect(expandStandardInventoryCapacity(60)).toEqual({ success: false, capacity: 60 })
    expect(expandStandardInventoryCapacity(61)).toEqual({ success: false, capacity: 61 })
  })

  it('allows extra capacity expansion beyond the normal cap', () => {
    expect(expandExtraInventoryCapacity(60)).toEqual({ success: true, capacity: 61 })
    expect(expandExtraInventoryCapacity(999)).toEqual({ success: true, capacity: 1000 })
  })
})
