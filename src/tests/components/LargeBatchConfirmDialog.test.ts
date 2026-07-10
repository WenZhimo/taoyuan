import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LargeBatchConfirmDialog from '@/components/game/farm/LargeBatchConfirmDialog.vue'

const mountDialog = (props: Partial<InstanceType<typeof LargeBatchConfirmDialog>['$props']> = {}) =>
  mount(LargeBatchConfirmDialog, {
    props: {
      label: '温室一键种植',
      total: 100_000,
      limit: 500,
      ...props
    }
  })

describe('LargeBatchConfirmDialog', () => {
  it('renders the operation summary and automatic chunk size', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('批量操作确认')
    expect(wrapper.text()).toContain('温室一键种植目标共有 100,000 项')
    expect(wrapper.text()).toContain('系统会自动按每批 500 项处理全部目标')
    expect(wrapper.text()).toContain('显示实时进度')
  })

  it('emits cancel and confirm events', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('button')[0]?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('取消'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('继续处理'))?.trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(2)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated large-batch confirmations', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ total: 10_000 + i }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
