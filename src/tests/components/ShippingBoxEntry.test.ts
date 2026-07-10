import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ShippingBoxEntry from '@/components/game/farm/ShippingBoxEntry.vue'

const mountEntry = (props: Partial<InstanceType<typeof ShippingBoxEntry>['$props']> = {}) =>
  mount(ShippingBoxEntry, {
    props: {
      boxItemKinds: 0,
      total: 0,
      ...props
    }
  })

describe('ShippingBoxEntry', () => {
  it('renders empty shipping box state', () => {
    const wrapper = mountEntry()

    expect(wrapper.text()).toContain('出货箱')
    expect(wrapper.text()).toContain('空')
    expect(wrapper.text()).not.toContain('种')
  })

  it('renders item kinds and estimated total', () => {
    const wrapper = mountEntry({ boxItemKinds: 4, total: 360 })

    expect(wrapper.text()).toContain('4种')
    expect(wrapper.text()).toContain('≈360文')
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
      mountEntry({ boxItemKinds: i % 6, total: i * 10 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(20)
  })
})
