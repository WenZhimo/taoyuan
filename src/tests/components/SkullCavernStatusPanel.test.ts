import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SkullCavernStatusPanel from '@/components/game/mining/SkullCavernStatusPanel.vue'

const mountPanel = (props: Partial<InstanceType<typeof SkullCavernStatusPanel>['$props']> = {}) =>
  mount(SkullCavernStatusPanel, {
    props: {
      bestFloor: 0,
      safePointFloor: 0,
      ...props
    }
  })

describe('SkullCavernStatusPanel', () => {
  it('renders unexplored skull cavern status', () => {
    const wrapper = mountPanel()

    expect(wrapper.text()).toContain('骷髅矿穴')
    expect(wrapper.text()).toContain('未探索')
    expect(wrapper.text()).toContain('无限层 · 每10层安全点 · 铱矿来源 · 怪物随深度增强')
    expect(wrapper.text()).not.toContain('安全点：第')
  })

  it('renders best floor and safe point when available', () => {
    const wrapper = mountPanel({ bestFloor: 42, safePointFloor: 30 })

    expect(wrapper.text()).toContain('最深 第42层')
    expect(wrapper.text()).toContain('安全点：第30层')
  })

  it('mounts cheaply enough for repeated status previews', () => {
    const iterations = 180
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountPanel({ bestFloor: i, safePointFloor: i - (i % 10) }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(20)
  })
})
