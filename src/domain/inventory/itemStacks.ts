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
}

interface RemoveItemResult {
  success: boolean
  items: InventoryItem[]
}

const QUALITY_CONSUMPTION_ORDER: Quality[] = ['normal', 'fine', 'excellent', 'supreme']

const matchesItem = (item: InventoryItem, { itemId, quality }: ItemMatchInput): boolean => {
  return item.itemId === itemId && (quality === undefined || item.quality === quality)
}

const cloneStacks = (items: readonly InventoryItem[]): InventoryItem[] => items.map(item => ({ ...item }))

const addItemToInventoryStacks = (
  items: InventoryItem[],
  itemId: string,
  quantity: number,
  quality: Quality,
  capacity: number,
  maxStack: number
): number => {
  let remaining = quantity

  for (const slot of items) {
    if (remaining <= 0) break
    if (slot.itemId !== itemId || slot.quality !== quality || slot.quantity >= maxStack) continue

    const canAdd = Math.min(remaining, maxStack - slot.quantity)
    slot.quantity += canAdd
    remaining -= canAdd
  }

  while (remaining > 0 && items.length < capacity) {
    const batch = Math.min(remaining, maxStack)
    items.push({ itemId, quantity: batch, quality })
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
  mainCapacity,
  tempCapacity,
  maxStack
}: AddableQuantityInput): number => {
  const mainStackSpace = items
    .filter(item => matchesItem(item, { itemId, quality }) && item.quantity < maxStack)
    .reduce((space, item) => space + (maxStack - item.quantity), 0)
  const mainEmptySlotSpace = Math.max(0, mainCapacity - items.length) * maxStack

  const tempStackSpace = tempItems
    .filter(item => matchesItem(item, { itemId, quality }) && item.quantity < maxStack)
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
  mainCapacity,
  tempCapacity,
  maxStack
}: AddItemToStacksInput): AddItemToStacksResult => {
  const updatedItems = cloneStacks(items)
  const updatedTempItems = cloneStacks(tempItems)

  let remaining = addItemToInventoryStacks(updatedItems, itemId, quantity, quality, mainCapacity, maxStack)
  if (remaining > 0) {
    remaining = addItemToInventoryStacks(updatedTempItems, itemId, remaining, quality, tempCapacity, maxStack)
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
    maxStack
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
  quality
}: RemoveItemInput): RemoveItemResult => {
  if (countItemQuantity(items, itemId, quality) < quantity) {
    return { success: false, items: cloneStacks(items) }
  }

  const updated = cloneStacks(items)
  let remaining = quantity
  const qualities = quality === undefined ? QUALITY_CONSUMPTION_ORDER : [quality]

  for (const currentQuality of qualities) {
    for (let i = updated.length - 1; i >= 0 && remaining > 0; i--) {
      const slot = updated[i]!
      if (slot.itemId !== itemId || slot.quality !== currentQuality) continue
      const take = Math.min(remaining, slot.quantity)
      slot.quantity -= take
      remaining -= take
      if (slot.quantity <= 0) {
        updated.splice(i, 1)
      }
    }
  }

  return { success: true, items: updated }
}
