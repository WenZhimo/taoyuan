import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { SHIPPING_FILTERS, useShippingBoxUi } from '@/composables/farm/useShippingBoxUi'
import type { InventoryItem, ItemDef } from '@/types'

const makeItemDef = (id: string, category: ItemDef['category']): ItemDef => ({
  id,
  category,
  description: `${id} description`,
  edible: false,
  name: `${id} name`,
  sellPrice: 10
})

const itemDefs: Record<string, ItemDef> = {
  cabbage: makeItemDef('cabbage', 'crop'),
  fish: makeItemDef('fish', 'fish'),
  seed: makeItemDef('seed', 'seed'),
  machine: makeItemDef('machine', 'machine'),
  sprinkler: makeItemDef('sprinkler', 'sprinkler'),
  gem: makeItemDef('gem', 'gem')
}

const makeInventoryItem = (itemId: string, quantity = 1): InventoryItem => ({
  itemId,
  quantity,
  quality: 'normal'
})

const createShippingBoxUi = (items: InventoryItem[]) => {
  const inventoryItems = ref(items)
  const shippingUi = useShippingBoxUi({
    inventoryItems: () => inventoryItems.value,
    getItemById: itemId => itemDefs[itemId]
  })

  return {
    inventoryItems,
    shippingUi
  }
}

describe('useShippingBoxUi', () => {
  it('keeps the existing shipping filter order and labels', () => {
    expect(SHIPPING_FILTERS.map(filter => filter.key)).toEqual([
      'all',
      'crop',
      'fruit',
      'fish',
      'animal_product',
      'processed',
      'ore',
      'gem',
      'material',
      'food',
      'gift',
      'misc'
    ])
  })

  it('builds shippable items while excluding non-shipping categories and unknown item definitions', () => {
    const { shippingUi } = createShippingBoxUi([
      makeInventoryItem('cabbage'),
      makeInventoryItem('fish'),
      makeInventoryItem('seed'),
      makeInventoryItem('machine'),
      makeInventoryItem('sprinkler'),
      makeInventoryItem('missing')
    ])

    expect(shippingUi.shippableItems.value.map(item => item.itemId)).toEqual(['cabbage', 'fish'])
    expect(shippingUi.shippableItems.value[0]?.def.name).toBe('cabbage name')
  })

  it('filters shippable items by the selected category', () => {
    const { shippingUi } = createShippingBoxUi([makeInventoryItem('cabbage'), makeInventoryItem('fish'), makeInventoryItem('gem')])

    expect(shippingUi.filteredShippableItems.value.map(item => item.itemId)).toEqual(['cabbage', 'fish', 'gem'])

    shippingUi.shippingFilter.value = 'fish'
    expect(shippingUi.filteredShippableItems.value.map(item => item.itemId)).toEqual(['fish'])

    shippingUi.shippingFilter.value = 'material'
    expect(shippingUi.filteredShippableItems.value).toEqual([])
  })

  it('reacts when the backing inventory changes', () => {
    const { inventoryItems, shippingUi } = createShippingBoxUi([makeInventoryItem('cabbage')])

    shippingUi.shippingFilter.value = 'gem'
    expect(shippingUi.filteredShippableItems.value).toEqual([])

    inventoryItems.value = [makeInventoryItem('cabbage'), makeInventoryItem('gem', 3)]
    expect(shippingUi.filteredShippableItems.value.map(item => item.itemId)).toEqual(['gem'])
    expect(shippingUi.filteredShippableItems.value[0]?.quantity).toBe(3)
  })

  it('reacts when the backing inventory is mutated in place', () => {
    const { inventoryItems, shippingUi } = createShippingBoxUi([makeInventoryItem('cabbage')])

    expect(shippingUi.shippableItems.value[0]?.quantity).toBe(1)

    inventoryItems.value[0]!.quantity += 2
    expect(shippingUi.shippableItems.value[0]?.quantity).toBe(3)

    inventoryItems.value.push(makeInventoryItem('gem', 4))
    shippingUi.shippingFilter.value = 'gem'
    expect(shippingUi.filteredShippableItems.value.map(item => item.itemId)).toEqual(['gem'])
  })

  it('keeps repeated filtering over large inventories cheap', () => {
    const largeInventory = Array.from({ length: 10_000 }, (_, index) => makeInventoryItem(index % 2 === 0 ? 'cabbage' : 'seed'))
    const { shippingUi } = createShippingBoxUi(largeInventory)
    const iterations = 100

    const buildStart = performance.now()
    expect(shippingUi.shippableItems.value.length).toBe(5_000)
    const buildDuration = performance.now() - buildStart

    const switchStart = performance.now()
    let total = 0

    for (let i = 0; i < iterations; i++) {
      shippingUi.shippingFilter.value = i % 2 === 0 ? 'all' : 'crop'
      total += shippingUi.filteredShippableItems.value.length
    }

    expect(total).toBe(500_000)
    expect(buildDuration).toBeLessThan(500)
    expect((performance.now() - switchStart) / iterations).toBeLessThan(5)
  })
})
