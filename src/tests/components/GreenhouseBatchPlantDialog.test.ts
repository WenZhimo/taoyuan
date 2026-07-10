import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GreenhouseBatchPlantDialog from '@/components/game/farm/GreenhouseBatchPlantDialog.vue'

const seeds = [
  { cropId: 'cabbage', name: '青菜', count: 20, regrowth: false },
  { cropId: 'tomato', name: '番茄', count: 8, regrowth: true }
]

const mountDialog = (props: Partial<InstanceType<typeof GreenhouseBatchPlantDialog>['$props']> = {}) =>
  mount(GreenhouseBatchPlantDialog, {
    props: {
      seeds,
      tilledEmptyCount: 12,
      ...props
    }
  })

describe('GreenhouseBatchPlantDialog', () => {
  it('renders greenhouse seed options and empty plot count', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('温室一键种植')
    expect(wrapper.text()).toContain('空耕地 12 块')
    expect(wrapper.text()).toContain('青菜')
    expect(wrapper.text()).toContain('×20')
    expect(wrapper.text()).toContain('番茄')
    expect(wrapper.text()).toContain('[多茬]')
    expect(wrapper.text()).toContain('×8')
  })

  it('emits close and selected crop ids', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('button')[0]?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('青菜'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('番茄'))?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('plant')).toEqual([['cabbage'], ['tomato']])
  })

  it('renders an empty seed state', () => {
    const wrapper = mountDialog({ seeds: [] })

    expect(wrapper.text()).toContain('没有可种植的种子')
  })

  it('mounts cheaply enough for repeated seed previews', () => {
    const iterations = 180
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ tilledEmptyCount: i }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(15)
  })
})
