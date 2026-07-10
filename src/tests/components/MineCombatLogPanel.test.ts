import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineCombatLogPanel from '@/components/game/mining/MineCombatLogPanel.vue'

const mountPanel = (props: Partial<InstanceType<typeof MineCombatLogPanel>['$props']> = {}) =>
  mount(MineCombatLogPanel, {
    props: {
      logs: ['遭遇怪物。', '你造成12点伤害。', '获得战利品。'],
      ...props
    }
  })

describe('MineCombatLogPanel', () => {
  it('renders combat logs and highlights the latest one', () => {
    const wrapper = mountPanel()
    const rows = wrapper.findAll('p')

    expect(wrapper.text()).toContain('遭遇怪物。')
    expect(wrapper.text()).toContain('你造成12点伤害。')
    expect(wrapper.text()).toContain('获得战利品。')
    expect(rows[0]?.classes()).toContain('text-muted')
    expect(rows[1]?.classes()).toContain('text-muted')
    expect(rows[2]?.classes()).toContain('text-text')
  })

  it('renders an empty combat log list without rows', () => {
    const wrapper = mountPanel({ logs: [] })

    expect(wrapper.findAll('p')).toHaveLength(0)
  })

  it('mounts cheaply enough for repeated combat log previews', () => {
    const iterations = 300
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountPanel({ logs: [`第${i}回合`, `造成${i}点伤害`] }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(20)
  })
})
