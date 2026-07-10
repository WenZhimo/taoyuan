import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineCombatStatusPanel from '@/components/game/mining/MineCombatStatusPanel.vue'
import type { CombatStatusEffect } from '@/types'

const poisonStatus: CombatStatusEffect = {
  type: 'poison',
  name: '中毒',
  power: 4,
  remainingTurns: 2,
  source: 'monster'
}

const mountPanel = (props: Partial<InstanceType<typeof MineCombatStatusPanel>['$props']> = {}) =>
  mount(MineCombatStatusPanel, {
    props: {
      playerHp: 75,
      playerMaxHp: 100,
      playerHpPercent: 75,
      playerIsLowHp: false,
      playerStatuses: [],
      playerAnim: '',
      playerFloat: null,
      monsterName: '岩石史莱姆',
      monsterHp: 30,
      monsterMaxHp: 60,
      monsterStatuses: [],
      monsterAnim: '',
      monsterFloat: null,
      combatIsBoss: false,
      getStatusDetail: status => `${status.name}:${status.power}`,
      ...props
    }
  })

describe('MineCombatStatusPanel', () => {
  it('renders player and monster health summaries', () => {
    const wrapper = mountPanel()

    expect(wrapper.text()).toContain('你')
    expect(wrapper.text()).toContain('75/100')
    expect(wrapper.text()).toContain('VS')
    expect(wrapper.text()).toContain('岩石史莱姆')
    expect(wrapper.text()).toContain('30/60')
  })

  it('renders boss marker, statuses, animation classes, and floating text', () => {
    const wrapper = mountPanel({
      playerIsLowHp: true,
      playerStatuses: [poisonStatus],
      playerAnim: 'anim-hurt',
      playerFloat: { text: '-12', key: 1 },
      monsterStatuses: [{ ...poisonStatus, type: 'burn', name: '燃烧', remainingTurns: null }],
      monsterAnim: 'anim-hit',
      monsterFloat: { text: '-28', key: 2 },
      combatIsBoss: true
    })

    expect(wrapper.text()).toContain('[BOSS]')
    expect(wrapper.text()).toContain('中毒2')
    expect(wrapper.text()).toContain('燃烧')
    expect(wrapper.text()).toContain('-12')
    expect(wrapper.text()).toContain('-28')
    expect(wrapper.get('.border-accent\\/10').classes()).toContain('anim-hurt')
    expect(wrapper.get('.border-danger\\/20').classes()).toContain('anim-hit')
    expect(wrapper.find('[title="中毒:4"]').exists()).toBe(true)
  })

  it('clamps health bar widths and handles missing monster max hp', () => {
    const wrapper = mountPanel({
      playerHpPercent: 150,
      monsterHp: 10,
      monsterMaxHp: undefined
    })

    const bars = wrapper.findAll('.transition-all')
    expect(bars[0]?.attributes('style')).toContain('width: 100%')
    expect(bars[1]?.attributes('style')).toContain('width: 0%')
  })

  it('mounts cheaply enough for repeated combat previews', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountPanel({
        playerHp: 100 - (i % 80),
        monsterHp: 60 - (i % 40),
        combatIsBoss: i % 5 === 0
      }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
