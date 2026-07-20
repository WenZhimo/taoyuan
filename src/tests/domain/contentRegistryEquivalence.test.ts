import { describe, expect, it } from 'vitest'
import { ITEMS, getItemById } from '@/data/items'
import { CROPS } from '@/data/crops'
import { RECIPES, getRecipeById } from '@/data/recipes'
import {
  getOfficialCropDef,
  getOfficialItemDefs,
  getOfficialRecipeDef,
  getOfficialRecipesAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId } from '@/domain/mods/ids'
import type { ItemDef, RecipeDef, RecipeIngredient } from '@/domain/mods/schemas'
import type { ItemDef as LegacyItemDef } from '@/types'
import type { RecipeDef as LegacyRecipeDef } from '@/types/skill'
import type { CropDef as LegacyCropDef } from '@/types/farm'

const localId = (id: string): string => id.slice(id.indexOf(':') + 1)

const expectedItemTags = (item: LegacyItemDef): string[] | undefined => {
  const tags = new Set<string>()
  if (item.category === 'crop' || item.category === 'fruit') tags.add(toOfficialContentId('vegetarian'))
  if (item.category === 'fish') {
    tags.add(toOfficialContentId('meat'))
    tags.add(toOfficialContentId('protein'))
  }
  if (item.category === 'animal_product' && item.edible) tags.add(toOfficialContentId('protein'))
  return tags.size > 0 ? Array.from(tags).sort() : undefined
}

const normalizeOfficialItem = (item: Readonly<ItemDef>) => ({
  id: localId(item.id),
  name: item.name.fallback,
  category: item.category,
  description: item.description.fallback,
  sellPrice: item.sellPrice,
  edible: item.edible,
  ...(item.staminaRestore !== undefined ? { staminaRestore: item.staminaRestore } : {}),
  ...(item.healthRestore !== undefined ? { healthRestore: item.healthRestore } : {}),
  ...(item.tags !== undefined ? { tags: [...item.tags].sort() } : {})
})

const normalizeLegacyItem = (item: LegacyItemDef) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  description: item.description,
  sellPrice: item.sellPrice,
  edible: item.edible,
  ...(item.staminaRestore !== undefined ? { staminaRestore: item.staminaRestore } : {}),
  ...(item.healthRestore !== undefined ? { healthRestore: item.healthRestore } : {}),
  ...(expectedItemTags(item) !== undefined ? { tags: expectedItemTags(item) } : {})
})

const normalizeOfficialCrop = (crop: NonNullable<ReturnType<typeof getOfficialCropDef>>) => ({
  id: localId(crop.id),
  name: crop.name.fallback,
  seedId: localId(crop.seedId),
  season: [...crop.season],
  growthDays: crop.growthDays,
  sellPrice: crop.sellPrice,
  seedPrice: crop.seedPrice,
  deepWatering: crop.deepWatering,
  description: crop.description.fallback,
  ...(crop.regrowth !== undefined ? { regrowth: crop.regrowth } : {}),
  ...(crop.regrowthDays !== undefined ? { regrowthDays: crop.regrowthDays } : {}),
  ...(crop.maxHarvests !== undefined ? { maxHarvests: crop.maxHarvests } : {}),
  ...(crop.giantCropEligible !== undefined ? { giantCropEligible: crop.giantCropEligible } : {})
})

const normalizeLegacyCrop = (crop: LegacyCropDef) => ({
  ...crop,
  season: [...crop.season]
})

const normalizeIngredient = (ingredient: RecipeIngredient) => {
  if (ingredient.type === 'item') {
    return { type: 'item' as const, itemId: ingredient.itemId, quantity: ingredient.quantity }
  }
  if (ingredient.type === 'tag') {
    return { type: 'tag' as const, tagId: ingredient.tagId, quantity: ingredient.quantity }
  }
  return { type: 'anyOfTags' as const, tagIds: [...ingredient.tagIds].sort(), quantity: ingredient.quantity }
}

const expectedRecipeIngredients = (recipe: LegacyRecipeDef): RecipeIngredient[] => {
  const ingredients: RecipeIngredient[] = recipe.ingredients.map(ingredient => ({
    type: 'item',
    itemId: toOfficialContentId(ingredient.itemId),
    quantity: ingredient.quantity
  }))

  if (recipe.id === 'steamed_bun') {
    ingredients.push({
      type: 'anyOfTags',
      tagIds: [toOfficialContentId('vegetarian'), toOfficialContentId('meat')],
      quantity: 1
    })
  }

  return ingredients
}

const normalizeOfficialRecipe = (recipe: Readonly<RecipeDef>) => ({
  id: localId(recipe.id),
  name: recipe.name.fallback,
  ingredients: recipe.ingredients.map(normalizeIngredient),
  outputItemId: localId(recipe.outputItemId),
  outputQuantity: recipe.outputQuantity,
  effect: recipe.effect,
  unlockSource: recipe.unlockSource,
  description: recipe.description.fallback,
  ...(recipe.requiredSkill !== undefined ? { requiredSkill: recipe.requiredSkill } : {})
})

const normalizeLegacyRecipe = (recipe: LegacyRecipeDef) => ({
  id: recipe.id,
  name: recipe.name,
  ingredients: expectedRecipeIngredients(recipe).map(normalizeIngredient),
  outputItemId: `food_${recipe.id}`,
  outputQuantity: 1,
  effect: recipe.effect,
  unlockSource: recipe.unlockSource,
  description: recipe.description,
  ...(recipe.requiredSkill !== undefined ? { requiredSkill: recipe.requiredSkill } : {})
})

describe('official content registry equivalence', () => {
  it('keeps official item registry fields equivalent to the legacy item table', () => {
    const officialItems = getOfficialItemDefs().map(normalizeOfficialItem).sort((a, b) => a.id.localeCompare(b.id))
    const legacyItems = ITEMS.map(normalizeLegacyItem).sort((a, b) => a.id.localeCompare(b.id))

    expect(officialItems).toEqual(legacyItems)
  })

  it('keeps official crop registry fields equivalent to the legacy crop table', () => {
    for (const crop of CROPS) {
      const officialCrop = getOfficialCropDef(crop.id)
      expect(officialCrop, crop.id).toBeDefined()
      expect(normalizeOfficialCrop(officialCrop!)).toEqual(normalizeLegacyCrop(crop))
    }
  })

  it('keeps official recipe registry fields equivalent while isolating the steamed bun tag-material pilot', () => {
    for (const recipe of RECIPES) {
      const officialRecipe = getOfficialRecipeDef(recipe.id)
      expect(officialRecipe, recipe.id).toBeDefined()
      expect(normalizeOfficialRecipe(officialRecipe!)).toEqual(normalizeLegacyRecipe(recipe))
    }
  })

  it('projects the full official recipe list back to the ordered legacy shape', () => {
    expect(getOfficialRecipesAsLegacy()).toEqual(RECIPES)
  })

  it('keeps legacy item and recipe query entrypoints equivalent to the old local shapes', () => {
    for (const item of ITEMS) {
      expect(normalizeLegacyItem(getItemById(item.id)!)).toEqual(normalizeLegacyItem(item))
    }

    for (const recipe of RECIPES) {
      expect(getRecipeById(recipe.id)).toEqual(recipe)
    }

    expect(getRecipeById('steamed_bun')?.ingredients).toEqual([
      { itemId: 'wheat_flour', quantity: 1 }
    ])
  })
})
