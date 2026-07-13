import { describe, expect, it } from 'vitest'
import {
  addItemToStacks,
  calculateAddableItemQuantity,
  countCarriedItemQuantity,
  countItemQuantity,
  moveTempItemToStacks,
  removeItemFromStacks
} from '@/domain/inventory/itemStacks'
import type { InventoryItem } from '@/types'

describe('inventory item stack rules', () => {
  const mainItems: InventoryItem[] = [
    { itemId: 'wood', quality: 'normal', quantity: 20 },
    { itemId: 'wood', quality: 'fine', quantity: 5 },
    { itemId: 'stone', quality: 'normal', quantity: 7 }
  ]
  const tempItems: InventoryItem[] = [{ itemId: 'wood', quality: 'normal', quantity: 3 }]

  it('counts item quantities by item and optional quality', () => {
    expect(countItemQuantity(mainItems, 'wood')).toBe(25)
    expect(countItemQuantity(mainItems, 'wood', 'normal')).toBe(20)
    expect(countCarriedItemQuantity(mainItems, tempItems, 'wood')).toBe(28)
    expect(countCarriedItemQuantity(mainItems, tempItems, 'wood', 'normal')).toBe(23)
  })

  it('calculates addable quantity across partial stacks and empty main/temp slots', () => {
    expect(
      calculateAddableItemQuantity({
        items: [{ itemId: 'wood', quality: 'normal', quantity: 90 }],
        tempItems: [{ itemId: 'wood', quality: 'normal', quantity: 95 }],
        itemId: 'wood',
        quality: 'normal',
        mainCapacity: 2,
        tempCapacity: 2,
        maxStack: 100
      })
    ).toBe(215)
  })

  it('ignores mismatched quality when calculating addable quantity', () => {
    expect(
      calculateAddableItemQuantity({
        items: [{ itemId: 'wood', quality: 'fine', quantity: 90 }],
        tempItems: [],
        itemId: 'wood',
        quality: 'normal',
        mainCapacity: 1,
        tempCapacity: 0,
        maxStack: 100
      })
    ).toBe(0)
  })

  it('adds items to existing main stacks before creating new stacks', () => {
    const result = addItemToStacks({
      items: [{ itemId: 'wood', quality: 'normal', quantity: 90 }],
      tempItems: [],
      itemId: 'wood',
      quantity: 15,
      quality: 'normal',
      mainCapacity: 2,
      tempCapacity: 0,
      maxStack: 100
    })

    expect(result).toEqual({
      items: [
        { itemId: 'wood', quality: 'normal', quantity: 100 },
        { itemId: 'wood', quality: 'normal', quantity: 5 }
      ],
      tempItems: [],
      remaining: 0
    })
  })


  it('merges ordinary composition tags but keeps separate-policy tags apart', () => {
    const separateTagIds = ['taoyuan:human_meat']

    const ordinary = addItemToStacks({
      items: [{ itemId: 'food_steamed_bun', quality: 'normal', quantity: 1, compositionTags: ['taoyuan:vegetarian'] }],
      tempItems: [],
      itemId: 'food_steamed_bun',
      quantity: 1,
      quality: 'normal',
      compositionTags: ['taoyuan:meat'],
      separateTagIds,
      mainCapacity: 5,
      tempCapacity: 0,
      maxStack: 100
    })

    expect(ordinary.items).toEqual([
      {
        itemId: 'food_steamed_bun',
        quality: 'normal',
        quantity: 2,
        compositionTags: ['taoyuan:meat', 'taoyuan:vegetarian']
      }
    ])

    const separated = addItemToStacks({
      items: ordinary.items,
      tempItems: [],
      itemId: 'food_steamed_bun',
      quantity: 1,
      quality: 'normal',
      compositionTags: ['taoyuan:human_meat'],
      separateTagIds,
      mainCapacity: 5,
      tempCapacity: 0,
      maxStack: 100
    })

    expect(separated.items).toEqual([
      {
        itemId: 'food_steamed_bun',
        quality: 'normal',
        quantity: 2,
        compositionTags: ['taoyuan:meat', 'taoyuan:vegetarian']
      },
      {
        itemId: 'food_steamed_bun',
        quality: 'normal',
        quantity: 1,
        compositionTags: ['taoyuan:human_meat']
      }
    ])
    expect(countItemQuantity(separated.items, 'food_steamed_bun', 'normal')).toBe(3)
    expect(
      calculateAddableItemQuantity({
        items: [{ itemId: 'food_steamed_bun', quality: 'normal', quantity: 90 }],
        tempItems: [],
        itemId: 'food_steamed_bun',
        quality: 'normal',
        compositionTags: ['taoyuan:human_meat'],
        separateTagIds,
        mainCapacity: 1,
        tempCapacity: 0,
        maxStack: 100
      })
    ).toBe(0)
  })

  it('overflows into temporary stacks when the main inventory is full', () => {
    const result = addItemToStacks({
      items: [
        { itemId: 'wood', quality: 'normal', quantity: 100 },
        { itemId: 'stone', quality: 'normal', quantity: 1 }
      ],
      tempItems: [{ itemId: 'wood', quality: 'normal', quantity: 95 }],
      itemId: 'wood',
      quantity: 10,
      quality: 'normal',
      mainCapacity: 2,
      tempCapacity: 2,
      maxStack: 100
    })

    expect(result).toEqual({
      items: [
        { itemId: 'wood', quality: 'normal', quantity: 100 },
        { itemId: 'stone', quality: 'normal', quantity: 1 }
      ],
      tempItems: [
        { itemId: 'wood', quality: 'normal', quantity: 100 },
        { itemId: 'wood', quality: 'normal', quantity: 5 }
      ],
      remaining: 0
    })
  })

  it('returns the remainder when main and temporary stacks are full', () => {
    const originalItems: InventoryItem[] = [{ itemId: 'wood', quality: 'normal', quantity: 100 }]
    const originalTempItems: InventoryItem[] = [{ itemId: 'stone', quality: 'normal', quantity: 100 }]

    const result = addItemToStacks({
      items: originalItems,
      tempItems: originalTempItems,
      itemId: 'wood',
      quantity: 5,
      quality: 'normal',
      mainCapacity: 1,
      tempCapacity: 1,
      maxStack: 100
    })

    expect(result).toEqual({
      items: [{ itemId: 'wood', quality: 'normal', quantity: 100 }],
      tempItems: [{ itemId: 'stone', quality: 'normal', quantity: 100 }],
      remaining: 5
    })
    expect(result.items).not.toBe(originalItems)
    expect(result.tempItems).not.toBe(originalTempItems)
  })

  it('moves a temporary item into matching main stacks', () => {
    const result = moveTempItemToStacks({
      items: [{ itemId: 'wood', quality: 'normal', quantity: 90 }],
      tempItems: [{ itemId: 'wood', quality: 'normal', quantity: 5 }],
      tempIndex: 0,
      mainCapacity: 1,
      maxStack: 100
    })

    expect(result).toEqual({
      success: true,
      items: [{ itemId: 'wood', quality: 'normal', quantity: 95 }],
      tempItems: []
    })
  })

  it('keeps the remaining temporary quantity when only part can move', () => {
    const result = moveTempItemToStacks({
      items: [{ itemId: 'wood', quality: 'normal', quantity: 95 }],
      tempItems: [{ itemId: 'wood', quality: 'normal', quantity: 20 }],
      tempIndex: 0,
      mainCapacity: 1,
      maxStack: 100
    })

    expect(result).toEqual({
      success: false,
      items: [{ itemId: 'wood', quality: 'normal', quantity: 100 }],
      tempItems: [{ itemId: 'wood', quality: 'normal', quantity: 15 }]
    })
  })

  it('creates a new main stack when moving from temp and capacity is available', () => {
    const result = moveTempItemToStacks({
      items: [{ itemId: 'stone', quality: 'normal', quantity: 100 }],
      tempItems: [{ itemId: 'wood', quality: 'normal', quantity: 5 }],
      tempIndex: 0,
      mainCapacity: 2,
      maxStack: 100
    })

    expect(result).toEqual({
      success: true,
      items: [
        { itemId: 'stone', quality: 'normal', quantity: 100 },
        { itemId: 'wood', quality: 'normal', quantity: 5 }
      ],
      tempItems: []
    })
  })

  it('removes items by quality order without mutating when quantity is insufficient', () => {
    const stacks: InventoryItem[] = [
      { itemId: 'wood', quality: 'normal', quantity: 2 },
      { itemId: 'wood', quality: 'fine', quantity: 3 },
      { itemId: 'wood', quality: 'excellent', quantity: 4 },
      { itemId: 'stone', quality: 'normal', quantity: 9 }
    ]

    const removed = removeItemFromStacks({ items: stacks, itemId: 'wood', quantity: 4 })

    expect(removed.success).toBe(true)
    expect(removed.items).toEqual([
      { itemId: 'wood', quality: 'fine', quantity: 1 },
      { itemId: 'wood', quality: 'excellent', quantity: 4 },
      { itemId: 'stone', quality: 'normal', quantity: 9 }
    ])
    expect(stacks[0]?.quantity).toBe(2)

    const failed = removeItemFromStacks({ items: stacks, itemId: 'wood', quantity: 99 })

    expect(failed.success).toBe(false)
    expect(failed.items).toEqual(stacks)
  })

  it('removes only the requested quality when quality is specified', () => {
    const stacks: InventoryItem[] = [
      { itemId: 'wood', quality: 'normal', quantity: 5 },
      { itemId: 'wood', quality: 'fine', quantity: 5 }
    ]

    expect(removeItemFromStacks({ items: stacks, itemId: 'wood', quantity: 3, quality: 'fine' })).toEqual({
      success: true,
      items: [
        { itemId: 'wood', quality: 'normal', quantity: 5 },
        { itemId: 'wood', quality: 'fine', quantity: 2 }
      ]
    })
  })
})
