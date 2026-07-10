import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FarmBatchFertilizeDialog from '@/components/game/farm/FarmBatchFertilizeDialog.vue'
import type { FarmBatchFertilizerOption } from '@/components/game/farm/FarmBatchFertilizeDialog.vue'

const fertilizers: FarmBatchFertilizerOption[] = [
  { type: 'basic_fertilizer', itemId: 'basic_fertilizer', name: '基础肥料', count: 12, colorClass: '' },
  { type: 'quality_fertilizer', itemId: 'quality_fertilizer', name: '高级肥料', count: 4, colorClass: 'text-quality-fine' }
]

const mountDialog = (props: Partial<InstanceType<typeof FarmBatchFertilizeDialog>['$props']> = {}) =>
  mount(FarmBatchFertilizeDialog, {
    props: {
      fertilizableCount: 6,
      fertilizers,
      ...props
    }
  })

describe('FarmBatchFertilizeDialog', () => {
  it('renders fertilizer choices and fertilizable plot count', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('一键施肥')
    expect(wrapper.text()).toContain('可施肥地块 6 块')
    expect(wrapper.text()).toContain('基础肥料')
    expect(wrapper.text()).toContain('×12')
    expect(wrapper.text()).toContain('高级肥料')
    expect(wrapper.text()).toContain('×4')
  })

  it('emits close and selected fertilizer type', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('button')[0]?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('高级肥料'))?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('fertilize')).toEqual([['quality_fertilizer']])
  })

  it('renders empty fertilizer state', () => {
    const wrapper = mountDialog({ fertilizers: [] })

    expect(wrapper.text()).toContain('没有可用的肥料')
  })

  it('mounts cheaply enough for repeated batch fertilize previews', () => {
    const iterations = 180
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ fertilizableCount: i }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
