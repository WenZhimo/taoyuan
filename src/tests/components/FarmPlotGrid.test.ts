import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Sprout, Wheat } from 'lucide-vue-next'
import FarmPlotGrid from '@/components/game/farm/FarmPlotGrid.vue'
import type { FarmPlot } from '@/types/farm'

const plots: FarmPlot[] = [
  {
    id: 0,
    state: 'growing',
    cropId: 'cabbage',
    growthDays: 2,
    watered: false,
    unwateredDays: 0,
    fertilizer: 'basic_fertilizer',
    harvestCount: 0,
    giantCropGroup: null,
    seedGenetics: null,
    infested: true,
    infestedDays: 1,
    weedy: true,
    weedyDays: 1
  },
  {
    id: 1,
    state: 'harvestable',
    cropId: 'tomato',
    growthDays: 5,
    watered: true,
    unwateredDays: 0,
    fertilizer: null,
    harvestCount: 0,
    giantCropGroup: null,
    seedGenetics: null,
    infested: false,
    infestedDays: 0,
    weedy: false,
    weedyDays: 0
  }
]

const mountGrid = (props: Partial<InstanceType<typeof FarmPlotGrid>['$props']> = {}) =>
  mount(FarmPlotGrid, {
    props: {
      farmSize: 2,
      getCropName: cropId => (cropId === 'cabbage' ? '青菜' : '番茄'),
      getPlotDisplay: plot => ({
        bg: plot.state === 'harvestable' ? 'bg-accent/20' : 'bg-success/10',
        color: plot.state === 'harvestable' ? 'text-accent' : 'text-success',
        icon: plot.state === 'harvestable' ? Wheat : Sprout
      }),
      getPlotTooltip: plot => `地块 ${plot.id + 1}`,
      hasSprinkler: plotId => plotId === 1,
      isSprinklerCovered: plotId => plotId === 1,
      needsWater: plot => plot.id === 0,
      plots,
      ...props
    }
  })

describe('FarmPlotGrid', () => {
  it('renders plots with crop names, classes, titles, and state badges', () => {
    const wrapper = mountGrid()
    const buttons = wrapper.findAll('button')

    expect(buttons).toHaveLength(2)
    expect(buttons[0]?.classes()).toContain('aspect-square')
    expect(buttons[0]?.classes()).toContain('min-w-0')
    expect(buttons[0]?.classes()).toContain('border-2')
    expect(buttons[0]?.classes()).toContain('border-danger/50')
    expect(buttons[0]?.attributes('title')).toBe('地块 1')
    expect(buttons[0]?.text()).toContain('青菜')
    expect(buttons[0]?.find('.text-danger').exists()).toBe(true)
    expect(buttons[0]?.find('.text-success').exists()).toBe(true)

    expect(buttons[1]?.classes()).toContain('border-water/40')
    expect(buttons[1]?.classes()).toContain('hover:border-accent/60')
    expect(buttons[1]?.text()).toContain('番茄')
  })

  it('emits selected plot id when a plot is clicked', async () => {
    const wrapper = mountGrid()

    await wrapper.findAll('button')[1]?.trigger('click')

    expect(wrapper.emitted('select-plot')).toEqual([[1]])
  })

  it('mounts cheaply enough for repeated farm plot previews', () => {
    const iterations = 180
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountGrid({ farmSize: 2 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(40)
  })
})
