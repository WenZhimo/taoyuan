import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ResolvingDayOverlay from '@/components/game/layout/ResolvingDayOverlay.vue'

describe('ResolvingDayOverlay', () => {
  it('renders the overnight resolving message', () => {
    const wrapper = mount(ResolvingDayOverlay)

    expect(wrapper.text()).toContain('隔夜结算中')
    expect(wrapper.text()).toContain('阶段 1 / 1：准备结算')
    expect(wrapper.text()).toContain('当前处理 0 / 1')
    expect(wrapper.classes()).toContain('fixed')
  })

  it('mounts cheaply enough for repeated day-resolution transitions', () => {
    const iterations = 300
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mount(ResolvingDayOverlay).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(10)
  })
})
