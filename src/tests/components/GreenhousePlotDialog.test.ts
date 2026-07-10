import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GreenhousePlotDialog from '@/components/game/farm/GreenhousePlotDialog.vue'
import type { GreenhouseBreedingSeedOption, GreenhousePlotSeedOption } from '@/components/game/farm/GreenhousePlotDialog.vue'
import type { FarmBatchFertilizerOption } from '@/components/game/farm/FarmBatchFertilizeDialog.vue'
import type { SeedGenetics } from '@/types/breeding'
import type { FarmPlot } from '@/types/farm'

const plot: FarmPlot = {
  id: 2,
  state: 'tilled',
  cropId: null,
  growthDays: 0,
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

const genetics: SeedGenetics = {
  id: 'gene-1',
  cropId: 'cabbage',
  generation: 3,
  sweetness: 12,
  yield: 8,
  resistance: 5,
  stability: 40,
  mutationRate: 3,
  parentA: null,
  parentB: null,
  parentCropA: null,
  parentCropB: null,
  isHybrid: false,
  hybridId: null
}

const seeds: GreenhousePlotSeedOption[] = [
  { cropId: 'cabbage', name: '青菜', count: 20, regrowth: false },
  { cropId: 'tomato', name: '番茄', count: 8, regrowth: true }
]

const breedingSeeds: GreenhouseBreedingSeedOption[] = [
  { id: 'gene-1', cropName: '青菜', generation: 3, starRating: 4 }
]

const fertilizers: FarmBatchFertilizerOption[] = [
  { type: 'basic_fertilizer', itemId: 'basic_fertilizer', name: '基础肥料', count: 6, colorClass: '' }
]

const mountDialog = (props: Partial<InstanceType<typeof GreenhousePlotDialog>['$props']> = {}) =>
  mount(GreenhousePlotDialog, {
    props: {
      breedingSeeds,
      canFertilize: true,
      cropGrowthDays: 5,
      cropMaxHarvests: 3,
      cropName: '',
      cropRegrowth: false,
      fertilizerName: '',
      fertilizers,
      isShopOpen: true,
      plot,
      seeds,
      shopClosedReason: '万物铺已打烊',
      stateLabel: '空耕地',
      ...props
    }
  })

describe('GreenhousePlotDialog', () => {
  it('renders plot details, crop growth, greenhouse traits, and genetics', () => {
    const wrapper = mountDialog({
      cropName: '青菜',
      cropRegrowth: true,
      plot: {
        ...plot,
        state: 'growing',
        cropId: 'cabbage',
        fertilizer: 'basic_fertilizer',
        growthDays: 2,
        harvestCount: 1,
        seedGenetics: genetics
      },
      fertilizerName: '基础肥料',
      stateLabel: '生长中'
    })

    expect(wrapper.text()).toContain('温室地块 #3')
    expect(wrapper.text()).toContain('生长中')
    expect(wrapper.text()).toContain('青菜')
    expect(wrapper.text()).toContain('[多茬 1/3]')
    expect(wrapper.text()).toContain('2/5天')
    expect(wrapper.text()).toContain('自动浇水 · 无季节限制')
    expect(wrapper.text()).toContain('G3 甜12 产8 抗5')
    expect(wrapper.text()).toContain('基础肥料')
  })

  it('renders seed and breeding seed choices and emits selected ids', async () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('种植')
    expect(wrapper.text()).toContain('青菜')
    expect(wrapper.text()).toContain('(×20)')
    expect(wrapper.text()).toContain('番茄')
    expect(wrapper.text()).toContain('[多茬]')
    expect(wrapper.text()).toContain('育种种子')
    expect(wrapper.text()).toContain('G3')
    expect(wrapper.findAll('[data-testid="breeding-star"]')).toHaveLength(4)

    await wrapper.findAll('button')[0]?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('青菜'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('G3'))?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('plant')).toEqual([['cabbage']])
    expect(wrapper.emitted('plant-breeding-seed')).toEqual([['gene-1']])
  })

  it('renders fertilizer choices and emits the selected fertilizer', async () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('施肥')
    expect(wrapper.text()).toContain('基础肥料')
    expect(wrapper.text()).toContain('×6')

    await wrapper.findAll('button').find(button => button.text().includes('基础肥料'))?.trigger('click')
    expect(wrapper.emitted('fertilize')).toEqual([['basic_fertilizer']])
  })

  it('renders shop action when no seeds are available and the shop is open', async () => {
    const wrapper = mountDialog({ breedingSeeds: [], seeds: [] })

    expect(wrapper.text()).toContain('背包中没有种子')
    expect(wrapper.text()).toContain('前往商店购买')

    await wrapper.findAll('button').find(button => button.text().includes('前往商店购买'))?.trigger('click')
    expect(wrapper.emitted('go-to-shop')).toHaveLength(1)
  })

  it('renders closed shop reason when no seeds are available and the shop is closed', () => {
    const wrapper = mountDialog({
      breedingSeeds: [],
      isShopOpen: false,
      seeds: [],
      shopClosedReason: '万物铺夜间休息'
    })

    expect(wrapper.text()).toContain('背包中没有种子')
    expect(wrapper.text()).toContain('万物铺夜间休息')
    expect(wrapper.text()).not.toContain('前往商店购买')
  })

  it('shows harvest action for harvestable plots', async () => {
    const wrapper = mountDialog({
      cropName: '青菜',
      plot: { ...plot, state: 'harvestable', cropId: 'cabbage', growthDays: 5 },
      stateLabel: '可收获'
    })

    expect(wrapper.text()).toContain('收获')
    await wrapper.findAll('button').find(button => button.text().includes('收获'))?.trigger('click')
    expect(wrapper.emitted('harvest')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated greenhouse plot previews', () => {
    const iterations = 180
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ plot: { ...plot, id: i } }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(45)
  })
})
