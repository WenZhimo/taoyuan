import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineLeaveConfirmDialog from '@/components/game/mining/MineLeaveConfirmDialog.vue'

const mountDialog = (props: Partial<InstanceType<typeof MineLeaveConfirmDialog>['$props']> = {}) =>
  mount(MineLeaveConfirmDialog, {
    props: {
      show: true,
      isSkullCavern: false,
      leaveHint: '当前进度不会保留。',
      ...props
    }
  })

describe('MineLeaveConfirmDialog', () => {
  it('renders normal mine leave confirmation and hint', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('确认离开')
    expect(wrapper.text()).toContain('确定要离开矿洞吗？')
    expect(wrapper.text()).toContain('当前进度不会保留。')
  })

  it('renders skull cavern leave confirmation', () => {
    const wrapper = mountDialog({
      isSkullCavern: true,
      leaveHint: '下次将从第51层开始。'
    })

    expect(wrapper.text()).toContain('确定要离开骷髅矿穴吗？')
    expect(wrapper.text()).toContain('下次将从第51层开始。')
  })

  it('emits cancel and confirm actions', async () => {
    const wrapper = mountDialog()
    const buttons = wrapper.findAll('button')

    await buttons.find(button => button.text().includes('继续探索'))?.trigger('click')
    await buttons.find(button => button.text().includes('确认离开'))?.trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated leave confirmations', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ isSkullCavern: i % 2 === 0 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
