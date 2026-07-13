import type { Quality } from '@/types'
import { requireContentId, toOfficialContentId, type ContentId } from '@/domain/mods/ids'
import type { ItemDef, RecipeIngredient } from '@/domain/mods/schemas'

export interface LegacyRecipeIngredient {
  itemId: string
  quantity: number
}

export type CookingIngredient = RecipeIngredient | LegacyRecipeIngredient

export interface IngredientInventoryStack {
  itemId: string
  quantity: number
  quality: Quality
}

export interface IngredientAllocation {
  itemId: string
  quality: Quality
  quantity: number
}

export interface IngredientAllocationSlot {
  ingredient: RecipeIngredient
  allocations: IngredientAllocation[]
}

export interface IngredientCandidateQuality {
  quality: Quality
  quantity: number
}

export interface IngredientCandidate {
  itemId: string
  available: number
  lowestQuality: Quality
  qualities: IngredientCandidateQuality[]
  sellPrice: number
}

export type IngredientSelectionMap = Readonly<Record<number, string | undefined>>

export interface IngredientAllocationPlan {
  success: true
  quantity: number
  resultQuality: Quality
  slots: IngredientAllocationSlot[]
  removals: IngredientAllocation[]
}

export interface IngredientAllocationFailure {
  success: false
  missing: RecipeIngredient
}

export type IngredientAllocationResult = IngredientAllocationPlan | IngredientAllocationFailure

const QUALITY_ORDER: Quality[] = ['normal', 'fine', 'excellent', 'supreme']
const QUALITY_RANK = new Map<Quality, number>(QUALITY_ORDER.map((quality, index) => [quality, index]))

const toContentId = (id: string): ContentId => requireContentId(id.includes(':') ? id : toOfficialContentId(id))
const tryContentId = (id: string | undefined): ContentId | null => {
  if (!id) return null
  try {
    return toContentId(id)
  } catch {
    return null
  }
}

export const normalizeCookingIngredient = (ingredient: CookingIngredient): RecipeIngredient => {
  if ('type' in ingredient) {
    if (ingredient.type === 'item') {
      return { ...ingredient, itemId: toContentId(ingredient.itemId) }
    }
    if (ingredient.type === 'tag') {
      return { ...ingredient, tagId: toContentId(ingredient.tagId) }
    }
    return { ...ingredient, tagIds: ingredient.tagIds.map(toContentId) }
  }

  return {
    type: 'item',
    itemId: toContentId(ingredient.itemId),
    quantity: ingredient.quantity
  }
}

const normalizeStacks = (stacks: readonly IngredientInventoryStack[]) => {
  const byItem = new Map<string, Map<Quality, number>>()
  for (const stack of stacks) {
    if (stack.quantity <= 0) continue
    const contentId = toContentId(stack.itemId)
    const byQuality = byItem.get(contentId) ?? new Map<Quality, number>()
    byQuality.set(stack.quality, (byQuality.get(stack.quality) ?? 0) + stack.quantity)
    byItem.set(contentId, byQuality)
  }
  return byItem
}

const buildItemDefinitions = (items: readonly Readonly<ItemDef>[]) =>
  new Map(items.map(item => [item.id, item]))

const toLocalItemId = (id: string): string => id.slice(id.indexOf(':') + 1)

const getItemTags = (item: Readonly<ItemDef> | undefined): readonly string[] => item?.tags ?? []

const matchesIngredient = (
  item: Readonly<ItemDef> | undefined,
  ingredient: RecipeIngredient
): boolean => {
  if (ingredient.type === 'item') return item?.id === ingredient.itemId
  const tags = getItemTags(item)
  if (ingredient.type === 'tag') return tags.includes(ingredient.tagId)
  return ingredient.tagIds.some(tagId => tags.includes(tagId))
}

const getCandidateItemIds = (
  ingredient: RecipeIngredient,
  itemDefinitions: Map<string, Readonly<ItemDef>>,
  availability: Map<string, Map<Quality, number>>,
  selectedItemId?: string
): string[] => {
  if (ingredient.type === 'item') return [ingredient.itemId]

  const selectedContentId = tryContentId(selectedItemId)
  if (selectedContentId) {
    return availability.has(selectedContentId) && matchesIngredient(itemDefinitions.get(selectedContentId), ingredient)
      ? [selectedContentId]
      : []
  }

  return Array.from(availability.keys())
    .filter(itemId => matchesIngredient(itemDefinitions.get(itemId), ingredient))
    .sort((a, b) => {
      const itemA = itemDefinitions.get(a)
      const itemB = itemDefinitions.get(b)
      const priceDiff = (itemA?.sellPrice ?? 0) - (itemB?.sellPrice ?? 0)
      return priceDiff !== 0 ? priceDiff : a.localeCompare(b)
    })
}

const consumeFromCandidates = (
  ingredient: RecipeIngredient,
  needed: number,
  itemDefinitions: Map<string, Readonly<ItemDef>>,
  availability: Map<string, Map<Quality, number>>,
  selectedItemId?: string
): IngredientAllocation[] | null => {
  const candidates = getCandidateItemIds(ingredient, itemDefinitions, availability, selectedItemId)
  const allocations: IngredientAllocation[] = []
  let remaining = needed

  const options = candidates.flatMap(itemId => {
    const byQuality = availability.get(itemId)
    if (!byQuality) return []
    return QUALITY_ORDER.map(quality => ({
      itemId,
      quality,
      available: byQuality.get(quality) ?? 0,
      sellPrice: itemDefinitions.get(itemId)?.sellPrice ?? 0
    })).filter(option => option.available > 0)
  }).sort((a, b) => {
    const qualityDiff = (QUALITY_RANK.get(a.quality) ?? 0) - (QUALITY_RANK.get(b.quality) ?? 0)
    if (qualityDiff !== 0) return qualityDiff
    if (a.sellPrice !== b.sellPrice) return a.sellPrice - b.sellPrice
    return a.itemId.localeCompare(b.itemId)
  })

  for (const option of options) {
    if (remaining <= 0) break
    const take = Math.min(remaining, option.available)
    const byQuality = availability.get(option.itemId)
    if (!byQuality) continue
    byQuality.set(option.quality, (byQuality.get(option.quality) ?? 0) - take)
    allocations.push({ itemId: toLocalItemId(option.itemId), quality: option.quality, quantity: take })
    remaining -= take
  }

  return remaining <= 0 ? allocations : null
}

const compactAllocations = (allocations: readonly IngredientAllocation[]): IngredientAllocation[] => {
  const byKey = new Map<string, IngredientAllocation>()
  for (const allocation of allocations) {
    const key = `${allocation.itemId}\0${allocation.quality}`
    const existing = byKey.get(key)
    if (existing) {
      existing.quantity += allocation.quantity
    } else {
      byKey.set(key, { ...allocation })
    }
  }
  return Array.from(byKey.values()).sort((a, b) => {
    if (a.itemId !== b.itemId) return a.itemId.localeCompare(b.itemId)
    return (QUALITY_RANK.get(a.quality) ?? 0) - (QUALITY_RANK.get(b.quality) ?? 0)
  })
}

export const createIngredientAllocationPlan = (options: {
  ingredients: readonly CookingIngredient[]
  quantity: number
  inventory: readonly IngredientInventoryStack[]
  items: readonly Readonly<ItemDef>[]
  selectedItemIds?: IngredientSelectionMap
}): IngredientAllocationResult => {
  const quantity = Math.floor(options.quantity)
  const ingredients = options.ingredients.map(normalizeCookingIngredient)
  const availability = normalizeStacks(options.inventory)
  const itemDefinitions = buildItemDefinitions(options.items)
  const slots: IngredientAllocationSlot[] = []
  const removals: IngredientAllocation[] = []
  let resultQualityIndex = QUALITY_ORDER.length - 1

  if (quantity <= 0) {
    return { success: false, missing: ingredients[0] ?? { type: 'item', itemId: toOfficialContentId('unknown'), quantity: 1 } }
  }

  for (const [slotIndex, ingredient] of ingredients.entries()) {
    const needed = ingredient.quantity * quantity
    const allocations = consumeFromCandidates(
      ingredient,
      needed,
      itemDefinitions,
      availability,
      options.selectedItemIds?.[slotIndex]
    )
    if (!allocations) return { success: false, missing: ingredient }
    for (const allocation of allocations) {
      removals.push(allocation)
      const qualityIndex = QUALITY_RANK.get(allocation.quality) ?? 0
      if (qualityIndex < resultQualityIndex) resultQualityIndex = qualityIndex
    }
    slots.push({ ingredient, allocations: compactAllocations(allocations) })
  }

  return {
    success: true,
    quantity,
    resultQuality: QUALITY_ORDER[resultQualityIndex] ?? 'normal',
    slots,
    removals: compactAllocations(removals)
  }
}

export const getMaxIngredientCraftQuantity = (options: {
  ingredients: readonly CookingIngredient[]
  inventory: readonly IngredientInventoryStack[]
  items: readonly Readonly<ItemDef>[]
  selectedItemIds?: IngredientSelectionMap
  upperLimit?: number
}): number => {
  const ingredients = options.ingredients.map(normalizeCookingIngredient)
  if (ingredients.length === 0) return 0

  const availability = normalizeStacks(options.inventory)
  const itemDefinitions = buildItemDefinitions(options.items)
  let upper = options.upperLimit ?? Infinity
  for (const [slotIndex, ingredient] of ingredients.entries()) {
    const total = getCandidateItemIds(
      ingredient,
      itemDefinitions,
      availability,
      options.selectedItemIds?.[slotIndex]
    ).reduce((sum, itemId) => {
      const byQuality = availability.get(itemId)
      return sum + (byQuality ? Array.from(byQuality.values()).reduce((inner, count) => inner + count, 0) : 0)
    }, 0)
    upper = Math.min(upper, Math.floor(total / ingredient.quantity))
  }
  if (!Number.isFinite(upper) || upper <= 0) return 0

  let low = 0
  let high = upper
  while (low < high) {
    const mid = Math.ceil((low + high + 1) / 2)
    const plan = createIngredientAllocationPlan({
      ingredients,
      quantity: mid,
      inventory: options.inventory,
      items: options.items,
      selectedItemIds: options.selectedItemIds
    })
    if (plan.success) low = mid
    else high = mid - 1
  }
  return low
}

export const getIngredientCandidates = (options: {
  ingredient: CookingIngredient
  inventory: readonly IngredientInventoryStack[]
  items: readonly Readonly<ItemDef>[]
  selectedItemId?: string
}): IngredientCandidate[] => {
  const ingredient = normalizeCookingIngredient(options.ingredient)
  const availability = normalizeStacks(options.inventory)
  const itemDefinitions = buildItemDefinitions(options.items)
  return getCandidateItemIds(ingredient, itemDefinitions, availability, options.selectedItemId).map(itemId => {
    const byQuality = availability.get(itemId) ?? new Map<Quality, number>()
    const qualities = QUALITY_ORDER.map(quality => ({
      quality,
      quantity: byQuality.get(quality) ?? 0
    })).filter(entry => entry.quantity > 0)
    const available = qualities.reduce((sum, entry) => sum + entry.quantity, 0)
    return {
      itemId: toLocalItemId(itemId),
      available,
      lowestQuality: qualities[0]?.quality ?? 'normal',
      qualities,
      sellPrice: itemDefinitions.get(itemId)?.sellPrice ?? 0
    }
  })
}
