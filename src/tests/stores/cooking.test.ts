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

  it('uses the registry tag-material plan for canCook, max quantity, preview, and removal', () => {
    const inventoryStore = useInventoryStore()
    const cookingStore = useCookingStore()

    expect(cookingStore.unlockRecipe('steamed_bun')).toBe(true)
    expect(inventoryStore.addItem('wheat_flour', 2, 'fine')).toBe(true)
    expect(inventoryStore.addItem('cabbage', 1, 'supreme')).toBe(true)
    expect(inventoryStore.addItem('carp', 2, 'normal')).toBe(true)

    expect(cookingStore.canCook('steamed_bun')).toBe(true)
    expect(cookingStore.maxCookable('steamed_bun')).toBe(2)
    expect(cookingStore.previewCookQuality('steamed_bun')).toBe('normal')
    expect(cookingStore.maxCookable('steamed_bun', { 1: 'cabbage' })).toBe(1)
    expect(cookingStore.previewCookQuality('steamed_bun', { 1: 'cabbage' })).toBe('fine')

    expect(cookingStore.getRecipeIngredientCandidates('steamed_bun', 1).map(candidate => candidate.itemId)).toEqual([
      'carp',
      'cabbage'
    ])
    expect(cookingStore.cook('steamed_bun', 1, { 1: 'cabbage' })).toEqual({
      success: true,
      message: '烹饪了【优良】馒头！'
    })

    expect(inventoryStore.getItemCount('wheat_flour', 'fine')).toBe(1)
    expect(inventoryStore.getItemCount('cabbage', 'supreme')).toBe(0)
    expect(inventoryStore.getItemCount('carp', 'normal')).toBe(2)
    expect(inventoryStore.getItemCount('food_steamed_bun', 'fine')).toBe(1)
    expect(inventoryStore.items.find(item => item.itemId === 'food_steamed_bun')?.compositionTags).toEqual([
      'taoyuan:vegetarian'
    ])
  })

  it('does not partially remove ingredients when a manual tag selection is unavailable', () => {
    const inventoryStore = useInventoryStore()
    const cookingStore = useCookingStore()

    expect(cookingStore.unlockRecipe('steamed_bun')).toBe(true)
    expect(inventoryStore.addItem('wheat_flour', 1, 'fine')).toBe(true)
    expect(inventoryStore.addItem('carp', 1, 'normal')).toBe(true)

    expect(cookingStore.canCook('steamed_bun', { 1: 'cabbage' })).toBe(false)
    expect(cookingStore.maxCookable('steamed_bun', { 1: 'cabbage' })).toBe(0)
    expect(cookingStore.cook('steamed_bun', 1, { 1: 'cabbage' })).toEqual({
      success: false,
      message: '材料不足。'
    })

    expect(inventoryStore.getItemCount('wheat_flour', 'fine')).toBe(1)
    expect(inventoryStore.getItemCount('carp', 'normal')).toBe(1)
    expect(inventoryStore.getItemCount('food_steamed_bun')).toBe(0)
  })
})
