import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineCombatItemConfirmDialog from '@/components/game/mining/MineCombatItemConfirmDialog.vue'
import type { MineCombatItemOption } from '@/components/game/mining/MineCombatItemListDialog.vue'

const item: MineCombatItemOption = {
  itemId: 'life_talisman',
  name: '生命护符',
  desc: '最大生命值永久+15',
  count: 12
}

const mountDialog = (props: Partial<InstanceType<typeof MineCombatItemConfirmDialog>['$props']> = {}) =>
  mount(MineCombatItemConfirmDialog, {
    props: {
      item,
      canBatch: true,
      quantity: 3,
      ...props
    }
  })

describe('MineCombatItemConfirmDialog', () => {
  it('renders item summary, batch quantity controls, and confirm quantity', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('使用道具')
    expect(wrapper.text()).toContain('生命护符')
    expect(wrapper.text()).toContain('最大生命值永久+15')
    expect(wrapper.text()).toContain('×12')
    expect(wrapper.text()).toContain('使用数量')
    expect(wrapper.text()).toContain('确认使用 ×3')
  })

  it('hides batch controls for non-batch items', () => {
    const wrapper = mountDialog({ canBatch: false })

    expect(wrapper.text()).not.toContain('使用数量')
    expect(wrapper.text()).toContain('确认使用')
    expect(wrapper.text()).not.toContain('确认使用 ×3')
  })

  it('does not render without a pending item', () => {
    const wrapper = mountDialog({ item: null })

    expect(wrapper.text()).toBe('')
  })

  it('emits cancel, quantity, input, and confirm actions', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-testid="cancel-combat-item-x"]').trigger('click')
    await wrapper.get('[data-testid="decrease-combat-item-qty"]').trigger('click')
    await wrapper.get('[data-testid="increase-combat-item-qty"]').trigger('click')
    await wrapper.get('[data-testid="min-combat-item-qty"]').trigger('click')
    await wrapper.get('[data-testid="max-combat-item-qty"]').trigger('click')
    await wrapper.get('[data-testid="combat-item-qty-input"]').setValue('7')
    await wrapper.get('[data-testid="cancel-combat-item"]').trigger('click')
    await wrapper.get('[data-testid="confirm-combat-item"]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(2)
    expect(wrapper.emitted('decrease-quantity')).toHaveLength(1)
    expect(wrapper.emitted('increase-quantity')).toHaveLength(1)
    expect(wrapper.emitted('set-quantity')?.[0]).toEqual([1])
    expect(wrapper.emitted('set-quantity')?.[1]).toEqual([12])
    expect(wrapper.emitted('input-quantity')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated combat item confirmations', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ quantity: (i % item.count) + 1, canBatch: i % 2 === 0 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
