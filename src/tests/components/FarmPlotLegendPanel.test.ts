import { mount } from '@vue/test-utils'
import { Bug, Shovel, Sprout } from 'lucide-vue-next'
import { describe, expect, it } from 'vitest'
import FarmPlotLegendPanel from '@/components/game/farm/FarmPlotLegendPanel.vue'
import type { FarmPlotLegendItem, FarmPlotWarningItem } from '@/components/game/farm/FarmPlotLegendPanel.vue'

const legends: FarmPlotLegendItem[] = [
  { icon: Shovel, color: 'text-muted', label: '荒地' },
  { icon: Sprout, color: 'text-success', label: '已种' }
]

const warnings: FarmPlotWarningItem[] = [
  { color: 'text-danger', text: '还有3块需浇水' },
  { color: 'text-danger', text: '有1块虫害' },
  { color: 'text-success', text: '有2块杂草' }
]

const mountPanel = (props: Partial<InstanceType<typeof FarmPlotLegendPanel>['$props']> = {}) =>
  mount(FarmPlotLegendPanel, {
    props: {
      legends,
      warnings,
      ...props
    }
  })

describe('FarmPlotLegendPanel', () => {
  it('renders plot legends and warnings', () => {
    const wrapper = mountPanel()

    expect(wrapper.text()).toContain('荒地')
    expect(wrapper.text()).toContain('已种')
    expect(wrapper.text()).toContain('还有3块需浇水')
    expect(wrapper.text()).toContain('有1块虫害')
    expect(wrapper.text()).toContain('有2块杂草')
  })

  it('hides warning panel when there are no warnings', () => {
    const wrapper = mountPanel({ warnings: [] })

    expect(wrapper.text()).toContain('荒地')
    expect(wrapper.text()).not.toContain('还有3块需浇水')
    expect(wrapper.find('.border-accent\\/20').exists()).toBe(false)
  })

  it('applies warning color classes', () => {
    const wrapper = mountPanel({ legends: [{ icon: Bug, color: 'text-danger', label: '虫害' }] })

    expect(wrapper.findAll('.text-danger').length).toBeGreaterThanOrEqual(2)
    expect(wrapper.text()).toContain('虫害')
  })

  it('mounts cheaply enough for repeated legend previews', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountPanel({
        warnings: i % 2 === 0 ? warnings : []
      }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(20)
  })
})
