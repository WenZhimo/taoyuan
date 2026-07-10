import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FarmFieldHeader from '@/components/game/farm/FarmFieldHeader.vue'

const mountHeader = (props: Partial<InstanceType<typeof FarmFieldHeader>['$props']> = {}) =>
  mount(FarmFieldHeader, {
    props: {
      farmSize: 12,
      scarecrows: 2,
      lightningRods: 1,
      tutorialHint: '先开垦荒地',
      farmMapType: 'standard',
      creekCatchCount: 0,
      surfaceOreName: '铜矿石',
      surfaceOreQuantity: 0,
      ...props
    }
  })

describe('FarmFieldHeader', () => {
  it('renders farm status, protection counts, tutorial hint, and batch action entry', () => {
    const wrapper = mountHeader()

    expect(wrapper.text()).toContain('田庄 (12×12)')
    expect(wrapper.text()).toContain('稻草人 2')
    expect(wrapper.text()).toContain('避雷针 1')
    expect(wrapper.text()).toContain('先开垦荒地')
    expect(wrapper.text()).toContain('一键操作')
  })

  it('renders missing scarecrow state and hides empty optional entries', () => {
    const wrapper = mountHeader({ scarecrows: 0, lightningRods: 0, tutorialHint: null })

    expect(wrapper.text()).toContain('无稻草人')
    expect(wrapper.text()).not.toContain('避雷针')
    expect(wrapper.text()).not.toContain('溪流鱼获')
    expect(wrapper.text()).not.toContain('地表矿脉')
  })

  it('renders and emits riverland creek catch action', async () => {
    const wrapper = mountHeader({ farmMapType: 'riverland', creekCatchCount: 3 })

    expect(wrapper.text()).toContain('溪流鱼获')
    expect(wrapper.text()).toContain('溪流中捕获了3条鱼')

    await wrapper.findAll('.cursor-pointer').find(node => node.text().includes('溪流鱼获'))?.trigger('click')
    expect(wrapper.emitted('collect-creek-catch')).toHaveLength(1)
  })

  it('renders and emits hilltop surface ore action', async () => {
    const wrapper = mountHeader({ farmMapType: 'hilltop', surfaceOreName: '铁矿石', surfaceOreQuantity: 6 })

    expect(wrapper.text()).toContain('地表矿脉')
    expect(wrapper.text()).toContain('发现铁矿石×6')
    expect(wrapper.text()).toContain('开采（-5体力）')

    await wrapper.findAll('.cursor-pointer').find(node => node.text().includes('地表矿脉'))?.trigger('click')
    expect(wrapper.emitted('mine-surface-ore')).toHaveLength(1)
  })

  it('emits batch action entry', async () => {
    const wrapper = mountHeader()

    await wrapper.findAll('button').find(button => button.text().includes('一键操作'))?.trigger('click')
    expect(wrapper.emitted('open-batch-actions')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated field header previews', () => {
    const iterations = 150
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountHeader({ creekCatchCount: i % 5, surfaceOreQuantity: i % 7 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(30)
  })
})
