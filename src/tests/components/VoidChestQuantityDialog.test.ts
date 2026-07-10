import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VoidChestQuantityDialog from '@/components/game/layout/VoidChestQuantityDialog.vue'
import type { Quality } from '@/types'

const qualityLabels: Record<Quality, string> = {
  normal: '普通',
  fine: '优良',
  excellent: '精品',
  supreme: '极品'
}

const mountDialog = (props: Partial<InstanceType<typeof VoidChestQuantityDialog>['$props']> = {}) =>
  mount(VoidChestQuantityDialog, {
    props: {
      modal: { mode: 'deposit', chestId: 'void-1', itemId: 'void_ore', quality: 'supreme', max: 20 },
      quantity: 10,
      qualityLabels,
      qualityClass: (quality: Quality) => (quality === 'normal' ? '' : `quality-${quality}`),
      getItemName: () => '虚空矿',
      ...props
    }
  })

describe('VoidChestQuantityDialog', () => {
  it('renders quantity controls and item quality', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('存入')
    expect(wrapper.text()).toContain('虚空矿')
    expect(wrapper.text()).toContain('极品')
    expect(wrapper.text()).toContain('存入 ×10')
    expect(wrapper.find('input').attributes('max')).toBe('20')
  })

  it('emits quantity changes from buttons and input', async () => {
    const wrapper = mountDialog()
    const buttons = wrapper.findAll('button')

    await buttons.find(button => button.text() === '-')?.trigger('click')
    await buttons.find(button => button.text() === '+')?.trigger('click')
    await buttons.find(button => button.text() === '最少')?.trigger('click')
    await buttons.find(button => button.text() === '最大')?.trigger('click')
    await wrapper.find('input').setValue('13')

    expect(wrapper.emitted('change-quantity')).toEqual([[9], [11], [1], [20], [13]])
  })

  it('emits close and confirm actions', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('button')[0]?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('存入 ×10'))?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('disables lower and upper bounds when quantity reaches limits', () => {
    const minWrapper = mountDialog({ quantity: 1 })
    const maxWrapper = mountDialog({ quantity: 20 })

    expect(minWrapper.findAll('button').find(button => button.text() === '-')?.attributes('disabled')).toBeDefined()
    expect(minWrapper.findAll('button').find(button => button.text() === '最少')?.attributes('disabled')).toBeDefined()
    expect(maxWrapper.findAll('button').find(button => button.text() === '+')?.attributes('disabled')).toBeDefined()
    expect(maxWrapper.findAll('button').find(button => button.text() === '最大')?.attributes('disabled')).toBeDefined()
  })

  it('mounts cheaply enough for repeated quantity previews', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ quantity: (i % 20) + 1 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(35)
  })
})
