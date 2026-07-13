import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCookingStore } from '@/stores/useCookingStore'
import { useInventoryStore } from '@/stores/useInventoryStore'

describe('cooking store material planning', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps canCook, maxCookable, quality preview, and ingredient removal equivalent for fixed-item recipes', () => {
    const inventoryStore = useInventoryStore()
    const cookingStore = useCookingStore()

    expect(inventoryStore.addItem('cabbage', 1, 'normal')).toBe(true)
    expect(inventoryStore.addItem('cabbage', 5, 'supreme')).toBe(true)

    expect(cookingStore.canCook('stir_fried_cabbage')).toBe(true)
    expect(cookingStore.maxCookable('stir_fried_cabbage')).toBe(3)
    expect(cookingStore.previewCookQuality('stir_fried_cabbage')).toBe('normal')

    expect(cookingStore.cook('stir_fried_cabbage', 5)).toEqual({
      success: true,
      message: '烹饪了3份炒青菜！'
    })

    expect(inventoryStore.getItemCount('cabbage')).toBe(0)
    expect(inventoryStore.getItemCount('food_stir_fried_cabbage', 'normal')).toBe(3)
  })

  it('does not remove partial ingredients when the unified plan fails', () => {
    const inventoryStore = useInventoryStore()
    const cookingStore = useCookingStore()

    expect(inventoryStore.addItem('cabbage', 1, 'normal')).toBe(true)

    expect(cookingStore.canCook('stir_fried_cabbage')).toBe(false)
    expect(cookingStore.maxCookable('stir_fried_cabbage')).toBe(0)
    expect(cookingStore.cook('stir_fried_cabbage', 1)).toEqual({
      success: false,
      message: '材料不足。'
    })
    expect(inventoryStore.getItemCount('cabbage')).toBe(1)
  })

  it('keeps the legacy quality preview when a fixed-item recipe is short on quantity', () => {
    const inventoryStore = useInventoryStore()
    const cookingStore = useCookingStore()

    expect(inventoryStore.addItem('cabbage', 1, 'supreme')).toBe(true)

    expect(cookingStore.canCook('stir_fried_cabbage')).toBe(false)
    expect(cookingStore.maxCookable('stir_fried_cabbage')).toBe(0)
    expect(cookingStore.previewCookQuality('stir_fried_cabbage')).toBe('supreme')
    expect(inventoryStore.getItemCount('cabbage', 'supreme')).toBe(1)
  })
})
