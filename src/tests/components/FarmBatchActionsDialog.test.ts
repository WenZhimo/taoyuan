import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FarmBatchActionsDialog from '@/components/game/farm/FarmBatchActionsDialog.vue'

const mountDialog = (props: Partial<InstanceType<typeof FarmBatchActionsDialog>['$props']> = {}) =>
  mount(FarmBatchActionsDialog, {
    props: {
      canFertilize: true,
      canPlant: true,
      fertilizableCount: 4,
      harvestableCount: 3,
      infestedCount: 2,
      tilledEmptyCount: 5,
      unwateredCount: 6,
      wastelandCount: 1,
      weedyCount: 7,
      ...props
    }
  })

describe('FarmBatchActionsDialog', () => {
  it('renders all batch actions with their current counts', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('一键操作')
    expect(wrapper.text()).toContain('一键浇水')
    expect(wrapper.text()).toContain('6 块')
    expect(wrapper.text()).toContain('一键开垦')
    expect(wrapper.text()).toContain('1 块')
    expect(wrapper.text()).toContain('一键收获')
    expect(wrapper.text()).toContain('3 块')
    expect(wrapper.text()).toContain('一键种植')
    expect(wrapper.text()).toContain('5 块')
    expect(wrapper.text()).toContain('一键施肥')
    expect(wrapper.text()).toContain('4 块')
    expect(wrapper.text()).toContain('一键除虫')
    expect(wrapper.text()).toContain('2 块')
    expect(wrapper.text()).toContain('一键除草')
    expect(wrapper.text()).toContain('7 块')
  })

  it('emits close and selected action events', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('button')[0]?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('一键浇水'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('一键种植'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('一键除草'))?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('action')).toEqual([['water'], ['plant'], ['clearWeed']])
  })

  it('disables unavailable actions', () => {
    const wrapper = mountDialog({
      canFertilize: false,
      canPlant: false,
      harvestableCount: 0,
      infestedCount: 0,
      unwateredCount: 0,
      wastelandCount: 0,
      weedyCount: 0
    })

    const buttons = wrapper.findAll('button')
    expect(buttons.find(button => button.text().includes('一键浇水'))?.attributes('disabled')).toBeDefined()
    expect(buttons.find(button => button.text().includes('一键开垦'))?.attributes('disabled')).toBeDefined()
    expect(buttons.find(button => button.text().includes('一键收获'))?.attributes('disabled')).toBeDefined()
    expect(buttons.find(button => button.text().includes('一键种植'))?.attributes('disabled')).toBeDefined()
    expect(buttons.find(button => button.text().includes('一键施肥'))?.attributes('disabled')).toBeDefined()
    expect(buttons.find(button => button.text().includes('一键除虫'))?.attributes('disabled')).toBeDefined()
    expect(buttons.find(button => button.text().includes('一键除草'))?.attributes('disabled')).toBeDefined()
  })

  it('mounts cheaply enough for repeated batch previews', () => {
    const iterations = 150
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ unwateredCount: i }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(35)
  })
})
