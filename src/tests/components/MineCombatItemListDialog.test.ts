import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineCombatItemListDialog, { type MineCombatItemOption } from '@/components/game/mining/MineCombatItemListDialog.vue'

const items: MineCombatItemOption[] = [
  { itemId: 'bomb', name: '炸弹', desc: '战斗中造成50点无视防御伤害', count: 3 },
  { itemId: 'life_talisman', name: '生命护符', desc: '最大生命值永久+15', count: 12 }
]

const mountDialog = (props: Partial<InstanceType<typeof MineCombatItemListDialog>['$props']> = {}) =>
  mount(MineCombatItemListDialog, {
    props: {
      show: true,
      items,
      ...props
    }
  })

describe('MineCombatItemListDialog', () => {
  it('renders available combat items and counts', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('使用道具')
    expect(wrapper.text()).toContain('炸弹')
    expect(wrapper.text()).toContain('战斗中造成50点无视防御伤害')
    expect(wrapper.text()).toContain('×3')
    expect(wrapper.text()).toContain('生命护符')
    expect(wrapper.text()).toContain('×12')
  })

  it('renders empty state', () => {
    const wrapper = mountDialog({ items: [] })

    expect(wrapper.text()).toContain('没有可用道具')
  })

  it('emits close and selected item actions', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-testid="close-combat-items"]').trigger('click')
    await wrapper.get('[data-testid="combat-item-bomb"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('select-item')?.[0]).toEqual(['bomb'])
  })

  it('mounts cheaply enough for repeated combat item previews', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ items: i % 2 === 0 ? items : [] }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
