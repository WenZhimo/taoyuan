import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FarmBatchPlantDialog from '@/components/game/farm/FarmBatchPlantDialog.vue'
import type { FarmBatchBreedingSeedGroup, FarmBatchPlantSeedOption } from '@/components/game/farm/FarmBatchPlantDialog.vue'

const seeds: FarmBatchPlantSeedOption[] = [
  { cropId: 'cabbage', name: '青菜', quality: 'normal', count: 20, colorClass: '', regrowth: false },
  { cropId: 'tomato', name: '番茄', quality: 'fine', count: 8, colorClass: 'text-quality-fine', regrowth: true }
]

const breedingSeedGroups: FarmBatchBreedingSeedGroup[] = [
  { cropId: 'cabbage', name: '青菜', count: 3, minGen: 1, maxGen: 4 }
]

const mountDialog = (props: Partial<InstanceType<typeof FarmBatchPlantDialog>['$props']> = {}) =>
  mount(FarmBatchPlantDialog, {
    props: {
      breedingSeedGroups,
      isShopOpen: true,
      seeds,
      shopClosedReason: '万物铺已打烊',
      tilledEmptyCount: 12,
      ...props
    }
  })

describe('FarmBatchPlantDialog', () => {
  it('renders seed choices, breeding seed groups, and empty plot count', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('一键种植')
    expect(wrapper.text()).toContain('空耕地 12 块')
    expect(wrapper.text()).toContain('青菜')
    expect(wrapper.text()).toContain('×20')
    expect(wrapper.text()).toContain('番茄')
    expect(wrapper.text()).toContain('[多茬]')
    expect(wrapper.text()).toContain('育种种子')
    expect(wrapper.text()).toContain('G1~4')
    expect(wrapper.text()).toContain('×3')
  })

  it('emits close, selected crop ids, breeding crop ids, and shop navigation', async () => {
    const wrapper = mountDialog()

    await wrapper.findAll('button')[0]?.trigger('click')
    await wrapper.get('button[aria-label="优良品质 8 个"]').trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('G1~4'))?.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('plant')).toEqual([['tomato', 'fine']])
    expect(wrapper.emitted('plant-breeding')).toEqual([['cabbage']])

    const emptyWrapper = mountDialog({ breedingSeedGroups: [], seeds: [] })
    await emptyWrapper.findAll('button').find(button => button.text().includes('前往商店购买'))?.trigger('click')
    expect(emptyWrapper.emitted('go-to-shop')).toHaveLength(1)
  })

  it('plants ordinary seeds from the visible quality square', async () => {
    const wrapper = mountDialog({
      seeds: [
        { cropId: 'corn', name: '玉米', quality: 'normal', count: 20, colorClass: '', regrowth: true },
        { cropId: 'persimmon', name: '柿子', quality: 'normal', count: 12, colorClass: '', regrowth: false },
        { cropId: 'chaos_zenith_herb', name: '混极草', quality: 'supreme', count: 5, colorClass: 'text-quality-supreme', regrowth: false }
      ]
    })

    expect(wrapper.text()).toContain('点击右侧品质方块开始种植。')
    await wrapper.get('button[aria-label="普通品质 20 个"]').trigger('click')
    await wrapper.get('button[aria-label="普通品质 12 个"]').trigger('click')

    expect(wrapper.emitted('plant')).toEqual([
      ['corn', 'normal'],
      ['persimmon', 'normal']
    ])
  })

  it('renders closed shop reason when there are no seeds and the shop is closed', () => {
    const wrapper = mountDialog({
      breedingSeedGroups: [],
      isShopOpen: false,
      seeds: [],
      shopClosedReason: '万物铺夜间休息'
    })

    expect(wrapper.text()).toContain('没有当季可种植的种子')
    expect(wrapper.text()).toContain('万物铺夜间休息')
    expect(wrapper.text()).not.toContain('前往商店购买')
  })

  it('mounts cheaply enough for repeated batch plant previews', () => {
    const iterations = 160
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ tilledEmptyCount: i }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(30)
  })
})
