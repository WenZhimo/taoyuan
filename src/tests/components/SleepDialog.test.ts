import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SleepDialog from '@/components/game/layout/SleepDialog.vue'

const mountDialog = (props: Partial<InstanceType<typeof SleepDialog>['$props']> = {}) =>
  mount(SleepDialog, {
    props: {
      label: '睡袋休息',
      summary: '铺开睡袋，在矿洞安稳过夜。',
      warning: '',
      ...props
    }
  })

describe('SleepDialog', () => {
  it('renders the selected sleep option and warning lines', () => {
    const wrapper = mountDialog({ warning: '体力仅恢复80%\n损失部分铜钱' })

    expect(wrapper.text()).toContain('睡袋休息')
    expect(wrapper.text()).toContain('铺开睡袋，在矿洞安稳过夜。')
    expect(wrapper.text()).toContain('体力仅恢复80%')
    expect(wrapper.text()).toContain('损失部分铜钱')
  })

  it('emits cancel and confirm actions', async () => {
    const wrapper = mountDialog()
    const buttons = wrapper.findAll('button')

    await buttons.find(button => button.text().includes('再等等'))?.trigger('click')
    await buttons.find(button => button.text().includes('睡袋休息'))?.trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated sleep confirmations', () => {
    const iterations = 300
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ label: i % 2 === 0 ? '休息' : '回家休息' }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
