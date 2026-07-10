import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineCombatDialog from '@/components/game/mining/MineCombatDialog.vue'
import type { CombatStatusEffect } from '@/types'

const poisonStatus: CombatStatusEffect = {
  type: 'poison',
  name: '中毒',
  power: 3,
  remainingTurns: 2,
  source: 'monster'
}

const mountDialog = (props: Partial<InstanceType<typeof MineCombatDialog>['$props']> = {}) =>
  mount(MineCombatDialog, {
    props: {
      show: true,
      combatIsBoss: false,
      playerHp: 80,
      playerMaxHp: 120,
      playerHpPercent: 66,
      playerIsLowHp: false,
      playerStatuses: [poisonStatus],
      playerAnim: '',
      playerFloat: null,
      monsterName: '岩石史莱姆',
      monsterHp: 20,
      monsterMaxHp: 50,
      monsterStatuses: [],
      monsterAnim: '',
      monsterFloat: null,
      combatAnimLock: false,
      weaponAttack: 42,
      autoCombatMode: 'off',
      combatItemCount: 2,
      presetCount: 1,
      activePresetName: '采矿套装',
      combatLog: ['遭遇怪物。', '你造成22点伤害。'],
      getStatusDetail: status => `${status.name}:${status.power}`,
      ...props
    }
  })

describe('MineCombatDialog', () => {
  it('renders title, status panel, actions panel, and combat log', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('遭遇怪物')
    expect(wrapper.text()).toContain('80/120')
    expect(wrapper.text()).toContain('岩石史莱姆')
    expect(wrapper.text()).toContain('42攻击力')
    expect(wrapper.text()).toContain('采矿套装')
    expect(wrapper.text()).toContain('你造成22点伤害。')
  })

  it('renders boss title and disabled flee copy for boss combat', () => {
    const wrapper = mountDialog({ combatIsBoss: true })

    expect(wrapper.text()).toContain('BOSS 战')
    expect(wrapper.text()).toContain('[BOSS]')
    expect(wrapper.text()).toContain('无法')
    expect(wrapper.get('[data-testid="combat-flee"]').attributes('disabled')).toBeDefined()
  })

  it('hides when show is false', () => {
    const wrapper = mountDialog({ show: false })

    expect(wrapper.text()).not.toContain('遭遇怪物')
    expect(wrapper.find('.game-panel').exists()).toBe(false)
  })

  it('forwards combat, auto combat, item, and preset events', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-testid="combat-attack"]').trigger('click')
    await wrapper.get('[data-testid="auto-combat-attack"]').trigger('click')
    await wrapper.get('[data-testid="open-combat-items"]').trigger('click')
    await wrapper.get('[data-testid="open-preset-list"]').trigger('click')

    expect(wrapper.emitted('combat-action')).toEqual([[ 'attack' ]])
    expect(wrapper.emitted('set-auto-combat-mode')).toEqual([[ 'attack' ]])
    expect(wrapper.emitted('open-combat-items')).toHaveLength(1)
    expect(wrapper.emitted('open-preset-list')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated combat dialog previews', () => {
    const iterations = 120
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({
        combatIsBoss: i % 5 === 0,
        playerHp: 120 - (i % 50),
        monsterHp: 50 - (i % 30)
      }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(35)
  })
})
