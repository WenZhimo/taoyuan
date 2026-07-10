import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FarmPlotDetailDialog from '@/components/game/farm/FarmPlotDetailDialog.vue'
import type { FarmPlotSprinklerOption } from '@/components/game/farm/FarmPlotDetailDialog.vue'
import type { FarmBatchFertilizerOption } from '@/components/game/farm/FarmBatchFertilizeDialog.vue'
import type { FarmBatchPlantSeedOption } from '@/components/game/farm/FarmBatchPlantDialog.vue'
import type { BreedingSeed, SeedGenetics } from '@/types/breeding'
import type { FarmPlot, Quality } from '@/types'

const qualityNames: Record<Quality, string> = {
  normal: '普通',
  fine: '良品',
  excellent: '上品',
  supreme: '极品'
}

const makePlot = (overrides: Partial<FarmPlot> = {}): FarmPlot => ({
  id: 4,
  state: 'tilled',
  cropId: null,
  growthDays: 0,
  watered: false,
  unwateredDays: 0,
  fertilizer: null,
  harvestCount: 0,
  giantCropGroup: null,
  seedGenetics: null,
  infested: false,
  infestedDays: 0,
  weedy: false,
  weedyDays: 0,
  ...overrides
})

const genetics: SeedGenetics = {
  id: 'seed_gen_1',
  cropId: 'cabbage',
  generation: 2,
  sweetness: 45,
  yield: 40,
  resistance: 30,
  stability: 50,
  mutationRate: 10,
  parentA: null,
  parentB: null,
  parentCropA: null,
  parentCropB: null,
  isHybrid: false,
  hybridId: null
}

const seeds: FarmBatchPlantSeedOption[] = [
  { cropId: 'cabbage', name: '青菜', quality: 'fine', count: 6, colorClass: 'text-quality-fine', regrowth: false },
  { cropId: 'green_bean', name: '豆角', quality: 'normal', count: 2, colorClass: '', regrowth: true }
]

const breedingSeeds: BreedingSeed[] = [{ genetics, label: '青菜 G2' }]

const fertilizers: FarmBatchFertilizerOption[] = [
  { type: 'basic_fertilizer', itemId: 'basic_fertilizer', name: '普通肥料', count: 4, colorClass: '' }
]

const sprinklers: FarmPlotSprinklerOption[] = [
  { type: 'bamboo_sprinkler', itemId: 'bamboo_sprinkler', name: '竹筒洒水器', count: 1, colorClass: '' }
]

const mountDialog = (props: Partial<InstanceType<typeof FarmPlotDetailDialog>['$props']> = {}) =>
  mount(FarmPlotDetailDialog, {
    props: {
      plot: makePlot(),
      stateLabel: '已耕',
      cropName: '',
      cropGrowthDays: 8,
      cropRegrowth: false,
      cropMaxHarvests: 0,
      fertilizerName: '',
      hasSprinkler: false,
      canWater: false,
      canFertilize: true,
      seeds,
      breedingSeeds,
      fertilizers,
      sprinklers,
      isShopOpen: true,
      shopClosedReason: '万物铺已打烊',
      qualityNames,
      getCropName: cropId => (cropId === 'cabbage' ? '青菜' : cropId),
      getBreedingStarRating: () => 3,
      ...props
    }
  })

describe('FarmPlotDetailDialog', () => {
  it('renders tilled plot planting, breeding seed, fertilizer, and sprinkler options', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('地块 #5')
    expect(wrapper.text()).toContain('已耕')
    expect(wrapper.text()).toContain('种植')
    expect(wrapper.text()).toContain('青菜')
    expect(wrapper.text()).toContain('[良品]')
    expect(wrapper.text()).toContain('豆角')
    expect(wrapper.text()).toContain('[多茬]')
    expect(wrapper.text()).toContain('育种种子')
    expect(wrapper.text()).toContain('青菜 G2')
    expect(wrapper.text()).toContain('施肥')
    expect(wrapper.text()).toContain('普通肥料')
    expect(wrapper.text()).toContain('洒水器')
    expect(wrapper.text()).toContain('竹筒洒水器')
  })

  it('emits planting, breeding, fertilizer, sprinkler, and close events', async () => {
    const wrapper = mountDialog()

    await wrapper.find('.fixed').trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('青菜'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('青菜 G2'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('普通肥料'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('竹筒洒水器'))?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('plant')).toEqual([['cabbage', 'fine']])
    expect(wrapper.emitted('plant-breeding-seed')).toEqual([['seed_gen_1']])
    expect(wrapper.emitted('fertilize')).toEqual([['basic_fertilizer']])
    expect(wrapper.emitted('place-sprinkler')).toEqual([['bamboo_sprinkler']])
  })

  it('renders crop status actions and emits field operations', async () => {
    const wrapper = mountDialog({
      plot: makePlot({
        state: 'growing',
        cropId: 'cabbage',
        growthDays: 4,
        watered: false,
        fertilizer: 'basic_fertilizer',
        infested: true,
        infestedDays: 2,
        weedy: true,
        weedyDays: 1
      }),
      stateLabel: '生长中',
      cropName: '青菜',
      cropGrowthDays: 8,
      cropRegrowth: true,
      cropMaxHarvests: 3,
      fertilizerName: '普通肥料',
      hasSprinkler: true,
      canWater: true,
      canFertilize: false
    })

    expect(wrapper.text()).toContain('生长中')
    expect(wrapper.text()).toContain('青菜')
    expect(wrapper.text()).toContain('[多茬 0/3]')
    expect(wrapper.text()).toContain('未浇水')
    expect(wrapper.text()).toContain('普通肥料')
    expect(wrapper.text()).toContain('虫害(2天)')
    expect(wrapper.text()).toContain('杂草(1天)')
    expect(wrapper.text()).toContain('4/8天')
    expect(wrapper.text()).toContain('拆除洒水器')

    await wrapper.findAll('button').find(button => button.text().includes('浇水'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('除虫'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('除草'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('铲除'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('拆除洒水器'))?.trigger('click')

    expect(wrapper.emitted('water')).toHaveLength(1)
    expect(wrapper.emitted('cure-pest')).toHaveLength(1)
    expect(wrapper.emitted('clear-weed')).toHaveLength(1)
    expect(wrapper.emitted('remove-crop')).toHaveLength(1)
    expect(wrapper.emitted('remove-sprinkler')).toHaveLength(1)
  })

  it('renders wasteland and harvestable actions', async () => {
    const wastelandWrapper = mountDialog({ plot: makePlot({ state: 'wasteland' }), stateLabel: '荒地' })
    await wastelandWrapper.findAll('button').find(button => button.text().includes('开垦'))?.trigger('click')
    expect(wastelandWrapper.emitted('till')).toHaveLength(1)

    const harvestWrapper = mountDialog({
      plot: makePlot({ state: 'harvestable', cropId: 'cabbage', giantCropGroup: 1 }),
      stateLabel: '可收获',
      cropName: '青菜'
    })
    expect(harvestWrapper.text()).toContain('（巨型）')
    expect(harvestWrapper.text()).toContain('收获可获得大量作物')

    await harvestWrapper.findAll('button').find(button => button.text().includes('收获'))?.trigger('click')
    expect(harvestWrapper.emitted('harvest')).toHaveLength(1)
  })

  it('renders seed empty state and shop actions', async () => {
    const wrapper = mountDialog({ seeds: [], breedingSeeds: [] })

    expect(wrapper.text()).toContain('背包中没有当季可种植的种子')
    await wrapper.findAll('button').find(button => button.text().includes('前往商店购买'))?.trigger('click')
    expect(wrapper.emitted('go-to-shop')).toHaveLength(1)

    const closedWrapper = mountDialog({ seeds: [], breedingSeeds: [], isShopOpen: false })
    expect(closedWrapper.text()).toContain('万物铺已打烊')
  })

  it('mounts cheaply enough for repeated plot detail previews', () => {
    const iterations = 100
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ plot: makePlot({ id: i, growthDays: i % 8 }) }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(45)
  })
})
