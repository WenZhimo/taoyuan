import type { InventoryItem, Quality } from '@/types'

interface ItemMatchInput {
  itemId: string
  quality?: Quality
}

interface AddableQuantityInput {
  items: readonly InventoryItem[]
  tempItems: readonly InventoryItem[]
  itemId: string
  quality: Quality
  compositionTags?: readonly string[]
  separateTagIds?: readonly string[]
  mainCapacity: number
  tempCapacity: number
  maxStack: number
}

interface AddItemToStacksInput {
  items: readonly InventoryItem[]
  tempItems: readonly InventoryItem[]
  itemId: string
  quantity: number
  quality: Quality
  compositionTags?: readonly string[]
  separateTagIds?: readonly string[]
  mainCapacity: number
  tempCapacity: number
  maxStack: number
}

interface AddItemToStacksResult {
  items: InventoryItem[]
  tempItems: InventoryItem[]
  remaining: number
}

interface MoveTempItemToStacksInput {
  items: readonly InventoryItem[]
  tempItems: readonly InventoryItem[]
  tempIndex: number
  separateTagIds?: readonly string[]
  mainCapacity: number
  maxStack: number
}

interface MoveTempItemToStacksResult {
  success: boolean
  items: InventoryItem[]
  tempItems: InventoryItem[]
}

interface RemoveItemInput {
  items: readonly InventoryItem[]
  itemId: string
  quantity: number
  quality?: Quality
  trackRemoved?: boolean
}

interface RemoveItemResult {
  success: boolean
  items: InventoryItem[]
  removed?: InventoryItem[]
}

const QUALITY_CONSUMPTION_ORDER: Quality[] = ['normal', 'fine', 'excellent', 'supreme']

const matchesItem = (item: InventoryItem, { itemId, quality }: ItemMatchInput): boolean => {
  return item.itemId === itemId && (quality === undefined || item.quality === quality)
}

export const normalizeCompositionTags = (tags: readonly string[] | undefined): string[] => {
  return Array.from(new Set(tags ?? [])).filter(Boolean).sort()
}

const cloneStacks = (items: readonly InventoryItem[]): InventoryItem[] =>
  items.map(item => ({
    ...item,
    ...(item.compositionTags !== undefined ? { compositionTags: [...item.compositionTags] } : {})
  }))

const filterSeparateTags = (
  tags: readonly string[] | undefined,
  separateTagIds: readonly string[] | undefined
): string[] => {
  const separate = new Set(separateTagIds ?? [])
  return normalizeCompositionTags(tags).filter(tag => separate.has(tag))
}

const sameTags = (a: readonly string[], b: readonly string[]): boolean => {
  return a.length === b.length && a.every((tag, index) => tag === b[index])
}

const isCompatibleStack = (
  slot: InventoryItem,
  itemId: string,
  quality: Quality,
  compositionTags: readonly string[] | undefined,
  separateTagIds: readonly string[] | undefined
): boolean => {
  if (slot.itemId !== itemId || slot.quality !== quality) return false
  return sameTags(
    filterSeparateTags(slot.compositionTags, separateTagIds),
    filterSeparateTags(compositionTags, separateTagIds)
  )
}

const mergeCompositionTags = (
  currentTags: readonly string[] | undefined,
  incomingTags: readonly string[] | undefined
): string[] | undefined => {
  const merged = normalizeCompositionTags([...(currentTags ?? []), ...(incomingTags ?? [])])
  if (merged.length > 0) return merged
  return currentTags !== undefined || incomingTags !== undefined ? [] : undefined
}

const createStack = (
  itemId: string,
  quantity: number,
  quality: Quality,
  compositionTags: readonly string[] | undefined,
  locked?: boolean
): InventoryItem => ({
  itemId,
  quantity,
  quality,
  ...(locked ? { locked: true } : {}),
  ...(compositionTags !== undefined ? { compositionTags: normalizeCompositionTags(compositionTags) } : {})
})

const addItemToInventoryStacks = (
  items: InventoryItem[],
  itemId: string,
  quantity: number,
  quality: Quality,
  capacity: number,
  maxStack: number,
  compositionTags?: readonly string[],
  separateTagIds?: readonly string[],
  locked?: boolean
): number => {
  let remaining = quantity

  for (const slot of items) {
    if (remaining <= 0) break
    if (!isCompatibleStack(slot, itemId, quality, compositionTags, separateTagIds) || slot.quantity >= maxStack) continue

    const canAdd = Math.min(remaining, maxStack - slot.quantity)
    slot.quantity += canAdd
    if (locked) slot.locked = true
    slot.compositionTags = mergeCompositionTags(slot.compositionTags, compositionTags)
    remaining -= canAdd
  }

  while (remaining > 0 && items.length < capacity) {
    const batch = Math.min(remaining, maxStack)
    items.push(createStack(itemId, batch, quality, compositionTags, locked))
    remaining -= batch
  }

  return remaining
}

export const countItemQuantity = (
  items: readonly InventoryItem[],
  itemId: string,
  quality?: Quality
): number => {
  return items.filter(item => matchesItem(item, { itemId, quality })).reduce((sum, item) => sum + item.quantity, 0)
}

export const countCarriedItemQuantity = (
  items: readonly InventoryItem[],
  tempItems: readonly InventoryItem[],
  itemId: string,
  quality?: Quality
): number => {
  return countItemQuantity(items, itemId, quality) + countItemQuantity(tempItems, itemId, quality)
}

export const calculateAddableItemQuantity = ({
  items,
  tempItems,
  itemId,
  quality,
  compositionTags,
  separateTagIds,
  mainCapacity,
  tempCapacity,
  maxStack
}: AddableQuantityInput): number => {
  const mainStackSpace = items
    .filter(item => isCompatibleStack(item, itemId, quality, compositionTags, separateTagIds) && item.quantity < maxStack)
    .reduce((space, item) => space + (maxStack - item.quantity), 0)
  const mainEmptySlotSpace = Math.max(0, mainCapacity - items.length) * maxStack

  const tempStackSpace = tempItems
    .filter(item => isCompatibleStack(item, itemId, quality, compositionTags, separateTagIds) && item.quantity < maxStack)
    .reduce((space, item) => space + (maxStack - item.quantity), 0)
  const tempEmptySlotSpace = Math.max(0, tempCapacity - tempItems.length) * maxStack

  return mainStackSpace + mainEmptySlotSpace + tempStackSpace + tempEmptySlotSpace
}

export const addItemToStacks = ({
  items,
  tempItems,
  itemId,
  quantity,
  quality,
  compositionTags,
  separateTagIds,
  mainCapacity,
  tempCapacity,
  maxStack
}: AddItemToStacksInput): AddItemToStacksResult => {
  const updatedItems = cloneStacks(items)
  const updatedTempItems = cloneStacks(tempItems)

  let remaining = addItemToInventoryStacks(
    updatedItems,
    itemId,
    quantity,
    quality,
    mainCapacity,
    maxStack,
    compositionTags,
    separateTagIds
  )
  if (remaining > 0) {
    remaining = addItemToInventoryStacks(
      updatedTempItems,
      itemId,
      remaining,
      quality,
      tempCapacity,
      maxStack,
      compositionTags,
      separateTagIds
    )
  }

  return {
    items: updatedItems,
    tempItems: updatedTempItems,
    remaining
  }
}

export const moveTempItemToStacks = ({
  items,
  tempItems,
  tempIndex,
  separateTagIds,
  mainCapacity,
  maxStack
}: MoveTempItemToStacksInput): MoveTempItemToStacksResult => {
  const updatedItems = cloneStacks(items)
  const updatedTempItems = cloneStacks(tempItems)
  const tempSlot = updatedTempItems[tempIndex]

  if (!tempSlot) {
    return { success: false, items: updatedItems, tempItems: updatedTempItems }
  }

  const { itemId, quality } = tempSlot
  const remaining = addItemToInventoryStacks(
    updatedItems,
    itemId,
    tempSlot.quantity,
    quality,
    mainCapacity,
    maxStack,
    tempSlot.compositionTags,
    separateTagIds,
    tempSlot.locked
  )

  if (remaining <= 0) {
    updatedTempItems.splice(tempIndex, 1)
    return { success: true, items: updatedItems, tempItems: updatedTempItems }
  }

  tempSlot.quantity = remaining
  return { success: false, items: updatedItems, tempItems: updatedTempItems }
}

export const removeItemFromStacks = ({
  items,
  itemId,
  quantity,
  quality,
  trackRemoved
}: RemoveItemInput): RemoveItemResult => {
  if (countItemQuantity(items, itemId, quality) < quantity) {
    return { success: false, items: cloneStacks(items) }
  }

  const updated = cloneStacks(items)
  const removed: InventoryItem[] = []
  let remaining = quantity
  const qualities = quality === undefined ? QUALITY_CONSUMPTION_ORDER : [quality]

  for (const currentQuality of qualities) {
    for (let i = updated.length - 1; i >= 0 && remaining > 0; i--) {
      const slot = updated[i]!
      if (slot.itemId !== itemId || slot.quality !== currentQuality) continue
      const take = Math.min(remaining, slot.quantity)
      if (trackRemoved) {
        removed.push(createStack(slot.itemId, take, slot.quality, slot.compositionTags, slot.locked))
      }
      slot.quantity -= take
      remaining -= take
      if (slot.quantity <= 0) {
        updated.splice(i, 1)
      }
    }
  }

  return {
    success: true,
    items: updated,
    ...(trackRemoved ? { removed: compactItemStacks(removed, Number.MAX_SAFE_INTEGER) } : {})
  }
}

export const compactItemStacks = (
  items: readonly InventoryItem[],
  maxStack: number,
  separateTagIds?: readonly string[]
): InventoryItem[] => {
  const compacted: InventoryItem[] = []
  for (const item of items) {
    addItemToInventoryStacks(
      compacted,
      item.itemId,
      item.quantity,
      item.quality,
      Number.MAX_SAFE_INTEGER,
      maxStack,
      item.compositionTags,
      separateTagIds,
      item.locked
    )
  }
  return compacted
}
