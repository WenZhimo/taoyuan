import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GreenhouseEntry from '@/components/game/farm/GreenhouseEntry.vue'

const mountEntry = (props: Partial<InstanceType<typeof GreenhouseEntry>['$props']> = {}) =>
  mount(GreenhouseEntry, {
    props: {
      harvestableCount: 0,
      plotCount: 24,
      ...props
    }
  })

describe('GreenhouseEntry', () => {
  it('renders greenhouse plot count without harvest hint when empty', () => {
    const wrapper = mountEntry()

    expect(wrapper.text()).toContain('温室')
    expect(wrapper.text()).toContain('24块地')
    expect(wrapper.text()).not.toContain('可收获')
  })

  it('renders harvestable count', () => {
    const wrapper = mountEntry({ harvestableCount: 5, plotCount: 48 })

    expect(wrapper.text()).toContain('5块可收获')
    expect(wrapper.text()).toContain('48块地')
  })

  it('emits open when clicked', async () => {
    const wrapper = mountEntry()

    await wrapper.find('.cursor-pointer').trigger('click')
    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated entry previews', () => {
    const iterations = 180
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountEntry({ harvestableCount: i % 8, plotCount: 24 + i }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(20)
  })
})
