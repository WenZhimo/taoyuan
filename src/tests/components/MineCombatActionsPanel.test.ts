import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineCombatActionsPanel from '@/components/game/mining/MineCombatActionsPanel.vue'

const mountPanel = (props: Partial<InstanceType<typeof MineCombatActionsPanel>['$props']> = {}) =>
  mount(MineCombatActionsPanel, {
    props: {
      combatAnimLock: false,
      combatIsBoss: false,
      weaponAttack: 42,
      autoCombatMode: 'off',
      combatItemCount: 3,
      presetCount: 2,
      activePresetName: '采矿套装',
      ...props
    }
  })

describe('MineCombatActionsPanel', () => {
  it('renders combat actions, auto combat modes, item entry, and preset entry', () => {
    const wrapper = mountPanel()

    expect(wrapper.text()).toContain('攻击')
    expect(wrapper.text()).toContain('42攻击力')
    expect(wrapper.text()).toContain('防御')
    expect(wrapper.text()).toContain('逃跑')
    expect(wrapper.text()).toContain('智能')
    expect(wrapper.text()).toContain('使用道具')
    expect(wrapper.text()).toContain('3种')
    expect(wrapper.text()).toContain('切换装备方案')
    expect(wrapper.text()).toContain('采矿套装')
  })

  it('emits manual combat and auto combat mode events', async () => {
    const wrapper = mountPanel({ autoCombatMode: 'smart' })

    await wrapper.get('[data-testid="combat-attack"]').trigger('click')
    await wrapper.get('[data-testid="combat-defend"]').trigger('click')
    await wrapper.get('[data-testid="combat-flee"]').trigger('click')
    await wrapper.get('[data-testid="auto-combat-smart"]').trigger('click')
    await wrapper.get('[data-testid="auto-combat-attack"]').trigger('click')
    await wrapper.get('[data-testid="auto-combat-defend"]').trigger('click')
    await wrapper.get('[data-testid="auto-combat-off"]').trigger('click')

    expect(wrapper.emitted('combat-action')).toEqual([[ 'attack' ], [ 'defend' ], [ 'flee' ]])
    expect(wrapper.emitted('set-auto-combat-mode')).toEqual([[ 'off' ], [ 'attack' ], [ 'defend' ], [ 'off' ]])
  })

  it('disables locked combat actions and boss fleeing', async () => {
    const lockedWrapper = mountPanel({ combatAnimLock: true })
    expect(lockedWrapper.get('[data-testid="combat-attack"]').attributes('disabled')).toBeDefined()
    expect(lockedWrapper.get('[data-testid="combat-defend"]').attributes('disabled')).toBeDefined()
    expect(lockedWrapper.get('[data-testid="combat-flee"]').attributes('disabled')).toBeDefined()

    const bossWrapper = mountPanel({ combatIsBoss: true })
    expect(bossWrapper.get('[data-testid="combat-flee"]').attributes('disabled')).toBeDefined()
    expect(bossWrapper.text()).toContain('无法')
    expect(bossWrapper.text()).toContain('BOSS战')
  })

  it('hides optional item and preset entries when unavailable', () => {
    const wrapper = mountPanel({ combatItemCount: 0, presetCount: 0, activePresetName: '' })

    expect(wrapper.find('[data-testid="open-combat-items"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="open-preset-list"]').exists()).toBe(false)
  })

  it('emits entry events for item and preset dialogs', async () => {
    const wrapper = mountPanel()

    await wrapper.get('[data-testid="open-combat-items"]').trigger('click')
    await wrapper.get('[data-testid="open-preset-list"]').trigger('click')

    expect(wrapper.emitted('open-combat-items')).toHaveLength(1)
    expect(wrapper.emitted('open-preset-list')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated combat action previews', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountPanel({
        combatIsBoss: i % 4 === 0,
        autoCombatMode: i % 3 === 0 ? 'attack' : 'off',
        combatItemCount: i % 2,
        presetCount: i % 3
      }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
