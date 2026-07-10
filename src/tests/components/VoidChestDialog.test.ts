import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VoidChestDialog from '@/components/game/layout/VoidChestDialog.vue'
import type { Chest, ItemDef, Quality } from '@/types'

const chests: Chest[] = [
  {
    id: 'void-1',
    tier: 'void',
    label: '虚空箱一',
    voidRole: 'input',
    items: [
      { itemId: 'cabbage', quality: 'normal', quantity: 20 },
      { itemId: 'void_ore', quality: 'supreme', quantity: 3 }
    ]
  },
  {
    id: 'void-2',
    tier: 'void',
    label: '虚空箱二',
    voidRole: 'output',
    items: []
  }
]

const itemDef: ItemDef = {
  id: 'void_ore',
  name: '虚空矿',
  category: 'ore',
  description: '来自深渊尽头的矿石。',
  sellPrice: 60,
  edible: false
}

const qualityLabels: Record<Quality, string> = {
  normal: '普通',
  fine: '优良',
  excellent: '精品',
  supreme: '极品'
}

const mountDialog = (props: Partial<InstanceType<typeof VoidChestDialog>['$props']> = {}) =>
  mount(VoidChestDialog, {
    props: {
      chests,
      expandedChestId: 'void-1',
      capacity: 999,
      duplicateDepositCount: 1,
      depositableCount: 2,
      itemDetail: null,
      itemDef: null,
      qualityLabels,
      qualityClass: (quality: Quality) => (quality === 'normal' ? '' : `quality-${quality}`),
      getItemName: (itemId: string) => (itemId === 'cabbage' ? '青菜' : itemId === 'void_ore' ? '虚空矿' : itemId),
      ...props
    }
  })

describe('VoidChestDialog', () => {
  it('renders void chests, roles, item stacks, and action buttons', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('虚空箱')
    expect(wrapper.text()).toContain('虚空箱一')
    expect(wrapper.text()).toContain('原料箱')
    expect(wrapper.text()).toContain('2/999')
    expect(wrapper.text()).toContain('青菜')
    expect(wrapper.text()).toContain('×20')
    expect(wrapper.text()).toContain('一键存入重复物品')
    expect(wrapper.text()).toContain('存入')
  })

  it('renders empty chest and empty-list states', () => {
    const expandedEmpty = mountDialog({ expandedChestId: 'void-2' })
    const noChests = mountDialog({ chests: [] })

    expect(expandedEmpty.text()).toContain('箱子是空的')
    expect(expandedEmpty.text()).toContain('点击下方「存入」添加')
    expect(noChests.text()).toContain('还没有虚空箱')
  })

  it('emits close, toggle, withdraw, and deposit actions', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('button')[0]?.trigger('click')
    await wrapper.findAll('.border.border-accent\\/10')[0]?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('取出'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('一键存入重复物品'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text() === '存入')?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('toggle-chest')?.[0]).toEqual(['void-1'])
    expect(wrapper.emitted('withdraw')?.[0]).toEqual(['void-1', 'cabbage', 'normal', 20])
    expect(wrapper.emitted('deposit-duplicates')).toHaveLength(1)
    expect(wrapper.emitted('open-deposit')?.[0]).toEqual(['void-1'])
  })

  it('renders and closes item detail information', async () => {
    const wrapper = mountDialog({
      itemDetail: { itemId: 'void_ore', quality: 'supreme', quantity: 3 },
      itemDef
    })

    expect(wrapper.text()).toContain('虚空矿')
    expect(wrapper.text()).toContain('来自深渊尽头的矿石。')
    expect(wrapper.text()).toContain('极品')
    expect(wrapper.text()).toContain('60文')

    await wrapper.findAll('button').find(button => button.classes().includes('absolute'))?.trigger('click')
    expect(wrapper.emitted('close-item-detail')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated remote chest previews', () => {
    const iterations = 80
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ expandedChestId: i % 2 === 0 ? 'void-1' : 'void-2' }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(40)
  })
})
