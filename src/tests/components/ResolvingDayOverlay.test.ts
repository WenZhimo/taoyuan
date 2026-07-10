import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ResolvingDayOverlay from '@/components/game/layout/ResolvingDayOverlay.vue'

describe('ResolvingDayOverlay', () => {
  it('renders the overnight resolving message', () => {
    const wrapper = mount(ResolvingDayOverlay)

    expect(wrapper.text()).toContain('隔夜结算中')
    expect(wrapper.text()).toContain('正在处理作物生长、工坊产出和其他每日事件')
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
