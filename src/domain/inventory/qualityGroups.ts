import type { InventoryItem, Quality } from '@/types'

export const QUALITY_ORDER: readonly Quality[] = ['normal', 'fine', 'excellent', 'supreme']

export interface QualityQuantityEntry<T extends InventoryItem = InventoryItem> {
  quality: Quality
  quantity: number
  locked: boolean
  items: T[]
}

export interface InventoryQualityGroup<T extends InventoryItem = InventoryItem> {
  itemId: string
  totalQuantity: number
  hasLockedItems: boolean
  qualities: QualityQuantityEntry<T>[]
}

export const groupInventoryItemsByQuality = <T extends InventoryItem>(items: readonly T[]): InventoryQualityGroup<T>[] => {
  const grouped = new Map<
    string,
    {
      group: InventoryQualityGroup<T>
      qualities: Map<Quality, QualityQuantityEntry<T>>
    }
  >()

  for (const item of items) {
    if (item.quantity <= 0) continue

    let state = grouped.get(item.itemId)
    if (!state) {
      state = {
        group: {
          itemId: item.itemId,
          totalQuantity: 0,
          hasLockedItems: false,
          qualities: []
        },
        qualities: new Map()
      }
      grouped.set(item.itemId, state)
    }

    let qualityEntry = state.qualities.get(item.quality)
    if (!qualityEntry) {
      qualityEntry = {
        quality: item.quality,
        quantity: 0,
        locked: true,
        items: []
      }
      state.qualities.set(item.quality, qualityEntry)
    }

    qualityEntry.quantity += item.quantity
    qualityEntry.items.push(item)
    qualityEntry.locked = qualityEntry.locked && item.locked === true
    state.group.totalQuantity += item.quantity
    state.group.hasLockedItems = state.group.hasLockedItems || item.locked === true
  }

  return [...grouped.values()].map(({ group, qualities }) => ({
    ...group,
    qualities: QUALITY_ORDER.flatMap(quality => {
      const entry = qualities.get(quality)
      return entry ? [entry] : []
    })
  }))
}

export const findQualityQuantity = <T extends InventoryItem>(
  group: InventoryQualityGroup<T> | undefined,
  quality: Quality
): QualityQuantityEntry<T> | undefined => group?.qualities.find(entry => entry.quality === quality)
