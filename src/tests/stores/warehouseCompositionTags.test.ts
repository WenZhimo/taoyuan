import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useWarehouseStore } from '@/stores/useWarehouseStore'

describe('warehouse composition tag stacking', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('merges ordinary crafted tags but keeps separate-policy stacks apart in chests', () => {
    const warehouseStore = useWarehouseStore()
    expect(warehouseStore.addChest('wood', '??')).toBe(true)
    const chestId = warehouseStore.chests[0]!.id

    expect(warehouseStore.addItemToChest(chestId, 'food_steamed_bun', 1, 'normal', ['taoyuan:vegetarian'])).toBe(true)
    expect(warehouseStore.addItemToChest(chestId, 'food_steamed_bun', 1, 'normal', ['taoyuan:meat'])).toBe(true)
    expect(warehouseStore.addItemToChest(chestId, 'food_steamed_bun', 1, 'normal', ['taoyuan:human_meat'])).toBe(true)

    warehouseStore.sortChest(chestId)

    expect(warehouseStore.chests[0]!.items).toEqual([
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
  })

  it('preserves composition tags when depositing to and withdrawing from a chest', () => {
    const inventoryStore = useInventoryStore()
    const warehouseStore = useWarehouseStore()
    expect(warehouseStore.addChest('wood', '??')).toBe(true)
    const chestId = warehouseStore.chests[0]!.id

    expect(inventoryStore.addItem('food_steamed_bun', 1, 'fine', ['taoyuan:human_meat'])).toBe(true)
    expect(warehouseStore.depositToChest(chestId, 'food_steamed_bun', 1, 'fine')).toBe(1)
    expect(inventoryStore.getItemCount('food_steamed_bun', 'fine')).toBe(0)
    expect(warehouseStore.chests[0]!.items[0]?.compositionTags).toEqual(['taoyuan:human_meat'])

    expect(warehouseStore.withdrawFromChest(chestId, 'food_steamed_bun', 1, 'fine')).toBe(true)
    expect(warehouseStore.getChestItemCount(chestId, 'food_steamed_bun', 'fine')).toBe(0)
    expect(inventoryStore.items.find(item => item.itemId === 'food_steamed_bun')?.compositionTags).toEqual([
      'taoyuan:human_meat'
    ])
  })
})
