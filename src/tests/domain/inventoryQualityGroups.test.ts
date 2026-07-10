import { describe, expect, it } from 'vitest'
import { groupInventoryItemsByQuality } from '@/domain/inventory/qualityGroups'
import type { InventoryItem } from '@/types'

describe('inventory quality groups', () => {
  it('merges the same item while preserving ordered quality quantities', () => {
    const items: InventoryItem[] = [
      { itemId: 'cabbage', quality: 'supreme', quantity: 4 },
      { itemId: 'cabbage', quality: 'normal', quantity: 4 },
      { itemId: 'cabbage', quality: 'fine', quantity: 20 },
      { itemId: 'cabbage', quality: 'excellent', quantity: 3 },
      { itemId: 'ruby', quality: 'normal', quantity: 2 }
    ]

    const groups = groupInventoryItemsByQuality(items)

    expect(groups).toHaveLength(2)
    expect(groups[0]?.itemId).toBe('cabbage')
    expect(groups[0]?.totalQuantity).toBe(31)
    expect(groups[0]?.qualities.map(entry => [entry.quality, entry.quantity])).toEqual([
      ['normal', 4],
      ['fine', 20],
      ['excellent', 3],
      ['supreme', 4]
    ])
  })

  it('combines duplicate stacks without mutating source items', () => {
    const items: InventoryItem[] = [
      { itemId: 'cabbage', quality: 'normal', quantity: 2, locked: true },
      { itemId: 'cabbage', quality: 'normal', quantity: 3, locked: false }
    ]
    const snapshot = structuredClone(items)

    const [group] = groupInventoryItemsByQuality(items)

    expect(group?.qualities[0]?.quantity).toBe(5)
    expect(group?.qualities[0]?.locked).toBe(false)
    expect(group?.hasLockedItems).toBe(true)
    expect(items).toEqual(snapshot)
  })

  it('ignores empty stacks', () => {
    expect(groupInventoryItemsByQuality([{ itemId: 'cabbage', quality: 'normal', quantity: 0 }])).toEqual([])
  })
})
