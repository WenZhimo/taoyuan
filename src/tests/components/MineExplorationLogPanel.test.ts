import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineExplorationLogPanel from '@/components/game/mining/MineExplorationLogPanel.vue'

const mountPanel = (props: Partial<InstanceType<typeof MineExplorationLogPanel>['$props']> = {}) =>
  mount(MineExplorationLogPanel, {
    props: {
      logs: ['进入矿洞。', '发现矿石。', '获得铜矿石。'],
      ...props
    }
  })

describe('MineExplorationLogPanel', () => {
  it('renders exploration logs and highlights the latest one', () => {
    const wrapper = mountPanel()
    const rows = wrapper.findAll('p')

    expect(wrapper.text()).toContain('进入矿洞。')
    expect(wrapper.text()).toContain('发现矿石。')
    expect(wrapper.text()).toContain('获得铜矿石。')
    expect(rows[0]?.classes()).not.toContain('text-text')
    expect(rows[2]?.classes()).toContain('text-text')
  })

  it('renders an empty log list without rows', () => {
    const wrapper = mountPanel({ logs: [] })

    expect(wrapper.findAll('p')).toHaveLength(0)
  })

  it('mounts cheaply enough for repeated log previews', () => {
    const iterations = 300
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountPanel({ logs: [`第${i}层`, `获得矿石${i}`] }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(20)
  })
})
