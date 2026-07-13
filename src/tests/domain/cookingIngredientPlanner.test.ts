import { describe, expect, it } from 'vitest'
import {
  createIngredientAllocationPlan,
  getMaxIngredientCraftQuantity,
  normalizeCookingIngredient,
  type IngredientInventoryStack
} from '@/domain/cooking/ingredientPlanner'
import { getOfficialCropById, getOfficialItemDef, getOfficialItemDefs, getOfficialRecipeDef } from '@/domain/mods/contentAccess'
import { toOfficialContentId } from '@/domain/mods/ids'
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
})

