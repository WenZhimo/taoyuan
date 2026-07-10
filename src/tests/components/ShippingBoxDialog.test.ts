import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ShippingBoxDialog from '@/components/game/farm/ShippingBoxDialog.vue'
import type { ShippingBoxShippableItem, ShippingFilterOption } from '@/components/game/farm/ShippingBoxDialog.vue'
import type { InventoryItem, Quality } from '@/types'

const boxEntries: InventoryItem[] = [
  { itemId: 'cabbage', quality: 'normal', quantity: 3 },
  { itemId: 'ruby', quality: 'supreme', quantity: 1 }
]

const items: ShippingBoxShippableItem[] = [
  {
    itemId: 'cabbage',
    quality: 'normal',
    quantity: 20,
    def: { id: 'cabbage', name: '青菜', category: 'crop', description: '', sellPrice: 20, edible: true }
  },
  {
    itemId: 'ruby',
    quality: 'supreme',
    quantity: 2,
    def: { id: 'ruby', name: '红宝石', category: 'gem', description: '', sellPrice: 120, edible: false }
  }
]

const filters: ShippingFilterOption[] = [
  { key: 'all', label: '全部' },
  { key: 'crop', label: '作物' },
  { key: 'gem', label: '宝石' }
]

const calculateSellPrice = (_itemId: string, quantity: number, quality: Quality) => quantity * (quality === 'supreme' ? 200 : 20)

const mountDialog = (props: Partial<InstanceType<typeof ShippingBoxDialog>['$props']> = {}) =>
  mount(ShippingBoxDialog, {
    props: {
      activeFilter: 'all',
      boxEntries,
      calculateSellPrice,
      filteredItems: items,
      filters,
      getItemName: itemId => (itemId === 'cabbage' ? '青菜' : '红宝石'),
      items,
      sellBonusPercent: 15,
      shippedItems: ['cabbage'],
      total: 260,
      ...props
    }
  })

describe('ShippingBoxDialog', () => {
  it('renders shipping box entries, income, bonus, filters, and shippable items', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('出货箱')
    expect(wrapper.text()).toContain('放入的物品将在次日结算。')
    expect(wrapper.text()).toContain('售价 +15%')
    expect(wrapper.text()).toContain('已放入')
    expect(wrapper.text()).toContain('青菜')
    expect(wrapper.text()).toContain('×3')
    expect(wrapper.text()).toContain('红宝石')
    expect(wrapper.text()).toContain('≈200文')
    expect(wrapper.text()).toContain('预计收入：260文')
    expect(wrapper.text()).toContain('背包物品')
    expect(wrapper.text()).toContain('2/2')
    expect(wrapper.text()).toContain('全部')
    expect(wrapper.text()).toContain('作物')
    expect(wrapper.text()).toContain('[已出货]')
    expect(wrapper.text()).toContain('放入1')
  })

  it('emits close, filter, add, and remove events', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('button')[0]?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('作物'))?.trigger('click')
    await wrapper.findAll('button').filter(button => button.text().includes('全部'))[2]?.trigger('click')
    await wrapper.findAll('.cursor-pointer')[0]?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('filter')).toEqual([['crop']])
    expect(wrapper.emitted('add-item')).toEqual([['ruby', 2, 'supreme']])
    expect(wrapper.emitted('remove-item')).toEqual([['cabbage', 3, 'normal']])
  })

  it('renders empty box and empty inventory states', () => {
    const wrapper = mountDialog({
      boxEntries: [],
      filteredItems: [],
      items: [],
      sellBonusPercent: 0,
      total: 0
    })

    expect(wrapper.text()).toContain('出货箱是空的')
    expect(wrapper.text()).toContain('背包中没有可出货的物品')
    expect(wrapper.text()).not.toContain('售价 +')
  })

  it('renders empty filtered category state', () => {
    const wrapper = mountDialog({
      activeFilter: 'gem',
      filteredItems: []
    })

    expect(wrapper.text()).toContain('0/2')
    expect(wrapper.text()).toContain('该分类没有可出货物品')
  })

  it('mounts cheaply enough for repeated shipping box previews', () => {
    const iterations = 120
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ total: i }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(35)
  })
})
