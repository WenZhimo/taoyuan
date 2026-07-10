import { computed, ref } from 'vue'
import type { InventoryItem, ItemCategory, ItemDef } from '@/types'

export type ShippingFilter = 'all' | ItemCategory

export interface ShippingFilterOption {
  key: ShippingFilter
  label: string
}

export interface ShippingBoxShippableItem extends InventoryItem {
  def: ItemDef
}

export interface UseShippingBoxUiOptions {
  inventoryItems: () => readonly InventoryItem[]
  getItemById: (itemId: string) => ItemDef | undefined
}

const EXCLUDED_SHIPPING_CATEGORIES = new Set<ItemCategory>(['seed', 'machine', 'sprinkler'])

export const SHIPPING_FILTERS: ShippingFilterOption[] = [
  { key: 'all', label: '全部' },
  { key: 'crop', label: '作物' },
  { key: 'fruit', label: '水果' },
  { key: 'fish', label: '鱼类' },
  { key: 'animal_product', label: '畜产' },
  { key: 'processed', label: '加工' },
  { key: 'ore', label: '矿石' },
  { key: 'gem', label: '宝石' },
  { key: 'material', label: '材料' },
  { key: 'food', label: '食物' },
  { key: 'gift', label: '礼物' },
  { key: 'misc', label: '杂物' }
]

export const useShippingBoxUi = ({ inventoryItems, getItemById }: UseShippingBoxUiOptions) => {
  const showShippingBox = ref(false)
  const shippingFilter = ref<ShippingFilter>('all')

  const shippableItems = computed<ShippingBoxShippableItem[]>(() => {
    const items: ShippingBoxShippableItem[] = []
    for (const item of inventoryItems()) {
      const def = getItemById(item.itemId)
      if (!def || EXCLUDED_SHIPPING_CATEGORIES.has(def.category)) continue
      items.push({ ...item, def })
    }
    return items
  })

  const shippableItemsByCategory = computed(() => {
    const groups = new Map<ItemCategory, ShippingBoxShippableItem[]>()
    for (const item of shippableItems.value) {
      const group = groups.get(item.def.category)
      if (group) {
        group.push(item)
      } else {
        groups.set(item.def.category, [item])
      }
    }
    return groups
  })

  const filteredShippableItems = computed(() => {
    if (shippingFilter.value === 'all') return shippableItems.value
    return shippableItemsByCategory.value.get(shippingFilter.value) ?? []
  })

  return {
    filteredShippableItems,
    shippingFilter,
    shippingFilters: SHIPPING_FILTERS,
    shippableItems,
    showShippingBox
  }
}
