import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FruitTreeChopConfirmDialog from '@/components/game/farm/FruitTreeChopConfirmDialog.vue'
import type { FruitTreeType } from '@/types'

const treeNames: Record<FruitTreeType, string> = {
  peach_tree: '桃树',
  lychee_tree: '荔枝树',
  mandarin_tree: '橘树',
  plum_tree: '梅树',
  apricot_tree: '杏树',
  pomegranate_tree: '石榴树',
  persimmon_tree: '柿树',
  hawthorn_tree: '山楂树'
}

const mountDialog = (props: Partial<InstanceType<typeof FruitTreeChopConfirmDialog>['$props']> = {}) =>
  mount(FruitTreeChopConfirmDialog, {
    props: {
      target: { id: 2, type: 'peach_tree' },
      getTreeName: type => treeNames[type],
      ...props
    }
  })

describe('FruitTreeChopConfirmDialog', () => {
  it('renders fruit tree chop warning with tree name', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('砍伐果树')
    expect(wrapper.text()).toContain('桃树')
    expect(wrapper.text()).toContain('砍伐后不可恢复')
    expect(wrapper.text()).toContain('确认砍伐')
  })

  it('emits close and confirm actions', async () => {
    const wrapper = mountDialog()

    await wrapper.find('.fixed').trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('取消'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('确认砍伐'))?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(2)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated confirmations', () => {
    const iterations = 150
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ target: { id: i, type: 'peach_tree' } }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
