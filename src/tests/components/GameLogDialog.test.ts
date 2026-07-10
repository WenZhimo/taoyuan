import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GameLogDialog from '@/components/game/layout/GameLogDialog.vue'

const groups = [
  { label: '第1年 春 第1天', messages: ['播种青菜', '浇水'] },
  { label: '第1年 春 第2天', messages: ['收获青菜'] }
]

const mountDialog = (props: Partial<InstanceType<typeof GameLogDialog>['$props']> = {}) =>
  mount(GameLogDialog, {
    props: {
      groups,
      clearTarget: undefined,
      ...props
    }
  })

describe('GameLogDialog', () => {
  it('renders grouped logs and clear buttons', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('日志')
    expect(wrapper.text()).toContain('第1年 春 第1天')
    expect(wrapper.text()).toContain('播种青菜')
    expect(wrapper.text()).toContain('收获青菜')
    expect(wrapper.text()).toContain('清空全部')
  })

  it('renders an empty state when there are no logs', () => {
    const wrapper = mountDialog({ groups: [] })

    expect(wrapper.text()).toContain('暂无日志记录')
    expect(wrapper.text()).not.toContain('清空全部')
  })

  it('emits close and clear requests', async () => {
    const wrapper = mountDialog()

    await wrapper.find('.absolute').trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('清空全部'))?.trigger('click')
    await wrapper.findAll('button[title="清空该日日志"]')[0]?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('request-clear')).toEqual([[null], ['第1年 春 第1天']])
  })

  it('renders and controls the clear confirmation overlay', async () => {
    const wrapper = mountDialog({ clearTarget: '第1年 春 第1天' })

    expect(wrapper.text()).toContain('确认清空「第1年 春 第1天」的日志？')

    await wrapper.findAll('button').find(button => button.text().includes('取消'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('确认'))?.trigger('click')

    expect(wrapper.emitted('cancel-clear')).toHaveLength(1)
    expect(wrapper.emitted('confirm-clear')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated log previews', () => {
    const manyGroups = Array.from({ length: 20 }, (_, index) => ({
      label: `第${index + 1}天`,
      messages: [`日志 ${index}-1`, `日志 ${index}-2`, `日志 ${index}-3`]
    }))
    const iterations = 50
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ groups: manyGroups, clearTarget: i % 2 === 0 ? undefined : null }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(150)
  })
})
