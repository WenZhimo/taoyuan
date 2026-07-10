import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FruitTreeSection from '@/components/game/farm/FruitTreeSection.vue'
import type { FruitTreePlantOption } from '@/components/game/farm/FruitTreeSection.vue'
import type { FruitTreeType, PlantedFruitTree } from '@/types'

const trees: PlantedFruitTree[] = [
  {
    id: 1,
    type: 'peach_tree',
    growthDays: 14,
    mature: false,
    yearAge: 0,
    todayFruit: false
  },
  {
    id: 2,
    type: 'lychee_tree',
    growthDays: 28,
    mature: true,
    yearAge: 2,
    todayFruit: false
  },
  {
    id: 3,
    type: 'plum_tree',
    growthDays: 28,
    mature: true,
    yearAge: 1,
    todayFruit: true
  }
]

const plantableSaplings: FruitTreePlantOption[] = [
  { type: 'peach_tree', saplingId: 'peach_sapling', name: '桃树', count: 3 },
  { type: 'lychee_tree', saplingId: 'lychee_sapling', name: '荔枝树', count: 1 }
]

const treeNames: Record<FruitTreeType, string> = {
  peach_tree: '桃树',
  lychee_tree: '荔枝树',
  mandarin_tree: '橘树',
  plum_tree: '梅树',
  apricot_tree: '杏树',
  pomegranate_tree: '石榴树',
  persimmon_tree: '柿树',
  hawthorn_tree: '山楂树'
}

const mountSection = (props: Partial<InstanceType<typeof FruitTreeSection>['$props']> = {}) =>
  mount(FruitTreeSection, {
    props: {
      trees,
      plantableSaplings,
      getTreeName: type => treeNames[type],
      getFruitSeason: type => (type === 'lychee_tree' ? '夏' : '春'),
      ...props
    }
  })

describe('FruitTreeSection', () => {
  it('renders fruit tree states, progress, and plant buttons', () => {
    const wrapper = mountSection()

    expect(wrapper.text()).toContain('果树')
    expect(wrapper.text()).toContain('共 3 棵')
    expect(wrapper.text()).toContain('桃树')
    expect(wrapper.text()).toContain('14/28天')
    expect(wrapper.text()).toContain('荔枝树')
    expect(wrapper.text()).toContain('2年')
    expect(wrapper.text()).toContain('夏产果')
    expect(wrapper.text()).toContain('今日已结果')
    expect(wrapper.text()).toContain('种桃树 (×3)')
  })

  it('emits plant and chop events', async () => {
    const wrapper = mountSection()

    await wrapper.findAll('button').find(button => button.text().includes('种桃树'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('砍伐'))?.trigger('click')

    expect(wrapper.emitted('plant')).toEqual([['peach_tree']])
    expect(wrapper.emitted('chop')).toEqual([[{ id: 1, type: 'peach_tree' }]])
  })

  it('renders empty state and keeps planting available without a tree limit', () => {
    const emptyWrapper = mountSection({ trees: [] })
    expect(emptyWrapper.text()).toContain('暂无果树')
    expect(emptyWrapper.text()).toContain('可在商店购买树苗种植')
    expect(mountSection().text()).toContain('种桃树')
  })

  it('paginates fruit trees at 50 per page', async () => {
    const manyTrees = Array.from({ length: 51 }, (_, index) => ({
      ...trees[0]!,
      id: index + 1
    }))
    const wrapper = mountSection({ trees: manyTrees })

    expect(wrapper.text()).toContain('第 1/2 页 · 51 项')
    expect(wrapper.findAll('button').filter(button => button.text() === '砍伐')).toHaveLength(50)

    await wrapper.findAll('button').find(button => button.text() === '下一页')?.trigger('click')
    expect(wrapper.findAll('button').filter(button => button.text() === '砍伐')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated tree tab previews', () => {
    const iterations = 120
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountSection().unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(60)
  })
})
