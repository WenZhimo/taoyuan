import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VoidChestDepositDialog from '@/components/game/layout/VoidChestDepositDialog.vue'
import type { InventoryItem, Quality } from '@/types'

const items: InventoryItem[] = [
  { itemId: 'cabbage', quality: 'normal', quantity: 20 },
  { itemId: 'void_ore', quality: 'supreme', quantity: 3 }
]

const qualityLabels: Record<Quality, string> = {
  normal: '普通',
  fine: '优良',
  excellent: '精品',
  supreme: '极品'
}

const mountDialog = (dialogItems = items) =>
  mount(VoidChestDepositDialog, {
    props: {
      items: dialogItems,
      qualityLabels,
      qualityClass: (quality: Quality) => (quality === 'normal' ? '' : `quality-${quality}`),
      getItemName: (itemId: string) => (itemId === 'cabbage' ? '青菜' : '虚空矿')
    }
  })

describe('VoidChestDepositDialog', () => {
  it('renders depositable items and quality labels', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('存入物品')
    expect(wrapper.text()).toContain('青菜')
    expect(wrapper.text()).toContain('虚空矿')
    expect(wrapper.text()).toContain('极品')
    expect(wrapper.text()).toContain('×20')
  })

  it('emits close and selected item details', async () => {
    const wrapper = mountDialog()

    await wrapper.find('button').trigger('click')
    await wrapper.findAll('.cursor-pointer')[1]?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('select-item')?.[0]).toEqual(['void_ore', 'supreme', 3])
  })

  it('mounts cheaply enough for repeated deposit lists', () => {
    const manyItems = Array.from({ length: 50 }, (_, index) => ({
      itemId: `item-${index}`,
      quality: index % 2 === 0 ? 'normal' : 'fine',
      quantity: index + 1
    })) as InventoryItem[]
    const iterations = 80
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog(manyItems).unmount()
    }

    expect(performance.now() - start).toBeLessThan(4_000)
  })
})
