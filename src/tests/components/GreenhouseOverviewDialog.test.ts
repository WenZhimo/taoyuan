import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GreenhouseOverviewDialog from '@/components/game/farm/GreenhouseOverviewDialog.vue'
import type { GreenhouseCropStat, GreenhouseStateStat } from '@/components/game/farm/GreenhouseOverviewDialog.vue'

const stateStats: GreenhouseStateStat[] = [
  { key: 'tilled', label: '空耕地', count: 4, firstPlotId: 1 },
  { key: 'planted', label: '已种', count: 2, firstPlotId: 5 },
  { key: 'growing', label: '生长中', count: 3, firstPlotId: 9 },
  { key: 'harvestable', label: '可收获', count: 1, firstPlotId: null }
]

const cropStats: GreenhouseCropStat[] = [
  {
    key: 'cabbage:base',
    name: '青菜',
    generation: null,
    count: 6,
    harvestable: 2,
    growing: 4,
    firstPlotId: 12,
    avgProgress: 55
  },
  {
    key: 'tomato:3',
    name: '番茄',
    generation: 3,
    count: 3,
    harvestable: 0,
    growing: 3,
    firstPlotId: 18,
    avgProgress: null
  }
]

const mountDialog = (props: Partial<InstanceType<typeof GreenhouseOverviewDialog>['$props']> = {}) =>
  mount(GreenhouseOverviewDialog, {
    props: {
      canUpgrade: true,
      cropStats,
      harvestableCount: 2,
      plantedCount: 9,
      plotCount: 100,
      seedCount: 3,
      stateStats,
      tilledEmptyCount: 4,
      ...props
    }
  })

describe('GreenhouseOverviewDialog', () => {
  it('renders greenhouse summary, actions, state stats, and crop stats', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('温室')
    expect(wrapper.text()).toContain('无季节限制 · 自动浇水 · 100块地')
    expect(wrapper.text()).toContain('一键收获 (2块)')
    expect(wrapper.text()).toContain('一键种植 (4块)')
    expect(wrapper.text()).toContain('升级温室')
    expect(wrapper.text()).toContain('空耕地')
    expect(wrapper.text()).toContain('植物统计')
    expect(wrapper.text()).toContain('9株')
    expect(wrapper.text()).toContain('青菜')
    expect(wrapper.text()).toContain('×6')
    expect(wrapper.text()).toContain('可收获 2 · 生长中 4')
    expect(wrapper.text()).toContain('55%')
    expect(wrapper.text()).toContain('番茄')
    expect(wrapper.text()).toContain('G3')
  })

  it('emits action and selected plot events', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('button')[0]?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('一键收获'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('一键种植'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('升级温室'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('空耕地'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('青菜'))?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('batch-harvest')).toHaveLength(1)
    expect(wrapper.emitted('open-batch-plant')).toHaveLength(1)
    expect(wrapper.emitted('open-upgrade')).toHaveLength(1)
    expect(wrapper.emitted('select-plot')).toEqual([[1], [12]])
  })

  it('disables unavailable batch actions and hides upgrade action', () => {
    const wrapper = mountDialog({
      canUpgrade: false,
      harvestableCount: 0,
      seedCount: 0,
      tilledEmptyCount: 4
    })

    const buttons = wrapper.findAll('button')
    expect(buttons.find(button => button.text().includes('一键收获'))?.attributes('disabled')).toBeDefined()
    expect(buttons.find(button => button.text().includes('一键种植'))?.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).not.toContain('升级温室')
  })

  it('renders empty crop state and does not select state rows without plot ids', async () => {
    const wrapper = mountDialog({ cropStats: [] })

    expect(wrapper.text()).toContain('温室里还没有作物')
    await wrapper.findAll('button').find(button => button.text().includes('可收获'))?.trigger('click')
    expect(wrapper.emitted('select-plot')).toBeUndefined()
  })

  it('mounts cheaply enough for repeated greenhouse summaries', () => {
    const iterations = 120
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ harvestableCount: i % 5 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(35)
  })
})
