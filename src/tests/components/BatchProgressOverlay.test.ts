import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BatchProgressOverlay from '@/components/game/farm/BatchProgressOverlay.vue'

const mountOverlay = (props: Partial<InstanceType<typeof BatchProgressOverlay>['$props']> = {}) =>
  mount(BatchProgressOverlay, {
    props: {
      label: '一键种植青菜',
      total: 100_000,
      processed: 36_000,
      cancelRequested: false,
      ...props
    }
  })

describe('BatchProgressOverlay', () => {
  it('renders the active operation, counts, and percentage', () => {
    const wrapper = mountOverlay()

    expect(wrapper.text()).toContain('一键种植青菜')
    expect(wrapper.text()).toContain('正在处理 36,000 / 100,000')
    expect(wrapper.text()).toContain('36%')
    expect(wrapper.find('[style*="width: 36%"]').exists()).toBe(true)
  })

  it('emits cancel and shows the stopping state', async () => {
    const wrapper = mountOverlay()

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)

    await wrapper.setProps({ cancelRequested: true })
    expect(wrapper.text()).toContain('正在停止')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('mounts cheaply enough for frequent progress updates', () => {
    const iterations = 200
    const start = performance.now()

    for (let index = 0; index < iterations; index++) {
      mountOverlay({ processed: index * 500 }).unmount()
    }

    expect((performance.now() - start) / iterations).toBeLessThan(25)
  })
})
