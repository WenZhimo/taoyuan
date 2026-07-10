import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import WildTreeChopConfirmDialog from '@/components/game/farm/WildTreeChopConfirmDialog.vue'
import type { WildTreeType } from '@/types'

const treeNames: Record<WildTreeType, string> = {
  pine: '松树',
  camphor: '香樟',
  mulberry: '桑树'
}

const mountDialog = (props: Partial<InstanceType<typeof WildTreeChopConfirmDialog>['$props']> = {}) =>
  mount(WildTreeChopConfirmDialog, {
    props: {
      target: { id: 3, type: 'pine', chopCount: 1 },
      getTreeName: type => treeNames[type],
      ...props
    }
  })

describe('WildTreeChopConfirmDialog', () => {
  it('renders normal chop confirmation with remaining chop count', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('伐木')
    expect(wrapper.text()).toContain('松树')
    expect(wrapper.text()).toContain('已伐木 1/3 次')
    expect(wrapper.text()).toContain('再伐 2 次后树将消失')
    expect(wrapper.findAll('button').find(button => button.text().includes('确认伐木'))?.classes()).toContain('!bg-accent')
  })

  it('renders final chop as a dangerous confirmation', () => {
    const wrapper = mountDialog({ target: { id: 4, type: 'mulberry', chopCount: 2 } })
    const confirmButton = wrapper.findAll('button').find(button => button.text() === '确认')

    expect(wrapper.text()).toContain('桑树')
    expect(wrapper.text()).toContain('再伐 1 次后树将消失')
    expect(confirmButton?.classes()).toContain('!bg-danger')
  })

  it('emits close and confirm actions', async () => {
    const wrapper = mountDialog()

    await wrapper.find('.fixed').trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('取消'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('确认伐木'))?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(2)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated confirmations', () => {
    const iterations = 150
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ target: { id: i, type: 'pine', chopCount: i % 3 } }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
