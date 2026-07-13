import { describe, expect, it } from 'vitest'
import {
  createIngredientAllocationPlan,
  getIngredientCandidates,
  getMaxIngredientCraftQuantity,
  normalizeCookingIngredient,
  type IngredientInventoryStack
} from '@/domain/cooking/ingredientPlanner'
import { getOfficialCropById, getOfficialItemDef, getOfficialItemDefs, getOfficialRecipeDef } from '@/domain/mods/contentAccess'
import { toOfficialContentId } from '@/domain/mods/ids'
import { getRecipeById } from '@/data/recipes'
import type { ItemDef } from '@/domain/mods/schemas'

const item = (id: string, tags: string[] = [], sellPrice = 1, category: ItemDef['category'] = 'material'): ItemDef => ({
  id: toOfficialContentId(id),
  name: { key: `test.item.${id}.name`, fallback: id },
  category,
  description: { key: `test.item.${id}.description`, fallback: id },
  sellPrice,
  edible: false,
  tags: tags.map(toOfficialContentId)
})

describe('cooking ingredient planner', () => {
  it('normalizes legacy itemId + quantity ingredients into registry item ingredients', () => {
    expect(normalizeCookingIngredient({ itemId: 'cabbage', quantity: 2 })).toEqual({
      type: 'item',
      itemId: toOfficialContentId('cabbage'),
      quantity: 2
    })
  })

  it('keeps legacy fixed-item recipes equivalent for max quantity and quality planning', () => {
    const inventory: IngredientInventoryStack[] = [
      { itemId: 'cabbage', quantity: 1, quality: 'normal' },
      { itemId: 'cabbage', quantity: 5, quality: 'supreme' }
    ]

    const max = getMaxIngredientCraftQuantity({
      ingredients: [{ itemId: 'cabbage', quantity: 2 }],
      inventory,
      items: getOfficialItemDefs()
    })
    expect(max).toBe(3)

    const plan = createIngredientAllocationPlan({
      ingredients: [{ itemId: 'cabbage', quantity: 2 }],
      quantity: 3,
      inventory,
      items: getOfficialItemDefs()
    })

    expect(plan.success).toBe(true)
    if (!plan.success) return
    expect(plan.resultQuality).toBe('normal')
    expect(plan.removals).toEqual([
      { itemId: 'cabbage', quality: 'normal', quantity: 1 },
      { itemId: 'cabbage', quality: 'supreme', quantity: 5 }
    ])
  })

  it('supports the flour plus any vegetarian or meat pilot recipe expression', () => {
    const ingredients = [
      { type: 'item' as const, itemId: toOfficialContentId('wheat_flour'), quantity: 1 },
      {
        type: 'anyOfTags' as const,
        tagIds: [toOfficialContentId('vegetarian'), toOfficialContentId('meat')],
        quantity: 1
      }
    ]
    const inventory: IngredientInventoryStack[] = [
      { itemId: 'wheat_flour', quantity: 2, quality: 'fine' },
      { itemId: 'cabbage', quantity: 1, quality: 'supreme' },
      { itemId: 'carp', quantity: 2, quality: 'normal' }
    ]

    const plan = createIngredientAllocationPlan({
      ingredients,
      quantity: 2,
      inventory,
      items: [
        item('wheat_flour', [], 5),
        item('cabbage', ['vegetarian'], 10, 'crop'),
        item('carp', ['meat'], 20, 'fish')
      ]
    })

    expect(plan.success).toBe(true)
    if (!plan.success) return
    expect(plan.resultQuality).toBe('normal')
    expect(plan.slots[1]?.allocations).toEqual([{ itemId: 'carp', quality: 'normal', quantity: 2 }])

    const selectedPlan = createIngredientAllocationPlan({
      ingredients,
      quantity: 1,
      inventory,
      items: [
        item('wheat_flour', [], 5),
        item('cabbage', ['vegetarian'], 10, 'crop'),
        item('carp', ['meat'], 20, 'fish')
      ],
      selectedItemIds: { 1: 'cabbage' }
    })

    expect(selectedPlan.success).toBe(true)
    if (!selectedPlan.success) return
    expect(selectedPlan.resultQuality).toBe('fine')
    expect(selectedPlan.slots[1]?.allocations).toEqual([{ itemId: 'cabbage', quality: 'supreme', quantity: 1 }])
  })

  it('returns stable ingredient candidates for tag slots and respects manual selection in max quantity', () => {
    const ingredients = [
      { type: 'anyOfTags' as const, tagIds: [toOfficialContentId('vegetarian'), toOfficialContentId('meat')], quantity: 1 }
    ]
    const inventory: IngredientInventoryStack[] = [
      { itemId: 'cabbage', quantity: 1, quality: 'supreme' },
      { itemId: 'carp', quantity: 2, quality: 'normal' }
    ]
    const items = [
      item('cabbage', ['vegetarian'], 52, 'crop'),
      item('carp', ['meat'], 37, 'fish')
    ]

    expect(getIngredientCandidates({ ingredient: ingredients[0]!, inventory, items }).map(candidate => candidate.itemId)).toEqual([
      'carp',
      'cabbage'
    ])
    expect(getMaxIngredientCraftQuantity({ ingredients, inventory, items })).toBe(3)
    expect(getMaxIngredientCraftQuantity({ ingredients, inventory, items, selectedItemIds: { 0: 'cabbage' } })).toBe(1)
  })

  it('does not count the same inventory unit twice across overlapping tag slots', () => {
    const ingredients = [
      { type: 'tag' as const, tagId: toOfficialContentId('vegetarian'), quantity: 1 },
      { type: 'tag' as const, tagId: toOfficialContentId('protein'), quantity: 1 }
    ]
    const items = [item('tofu', ['vegetarian', 'protein'], 3, 'processed')]

    expect(createIngredientAllocationPlan({
      ingredients,
      quantity: 1,
      inventory: [{ itemId: 'tofu', quantity: 1, quality: 'normal' }],
      items
    }).success).toBe(false)

    const plan = createIngredientAllocationPlan({
      ingredients,
      quantity: 1,
      inventory: [{ itemId: 'tofu', quantity: 2, quality: 'normal' }],
      items
    })

    expect(plan.success).toBe(true)
    if (!plan.success) return
    expect(plan.removals).toEqual([{ itemId: 'tofu', quality: 'normal', quantity: 2 }])
  })

  it('exposes the official Tag/Item/Crop/Recipe query pilot without changing local IDs', () => {
    const cabbageItem = getOfficialItemDef('cabbage')
    const cabbageCrop = getOfficialCropById('cabbage')
    const recipe = getOfficialRecipeDef('stir_fried_cabbage')

    expect(cabbageItem?.name.fallback).toBe('青菜')
    expect(cabbageItem?.tags).toContain(toOfficialContentId('vegetarian'))
    expect(cabbageCrop?.name).toBe('青菜')
    expect(recipe?.ingredients).toEqual([
      { type: 'item', itemId: toOfficialContentId('cabbage'), quantity: 2 }
    ])
  })

  it('exposes the steamed bun registry pilot without changing the legacy static recipe', () => {
    expect(getRecipeById('steamed_bun')?.ingredients).toEqual([
      { itemId: 'wheat_flour', quantity: 1 }
    ])
    expect(getOfficialRecipeDef('steamed_bun')?.ingredients).toEqual([
      { type: 'item', itemId: toOfficialContentId('wheat_flour'), quantity: 1 },
      {
        type: 'anyOfTags',
        tagIds: [toOfficialContentId('vegetarian'), toOfficialContentId('meat')],
        quantity: 1
      }
    ])
  })
})

