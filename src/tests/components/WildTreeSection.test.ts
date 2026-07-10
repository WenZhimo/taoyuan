import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import WildTreeSection from '@/components/game/farm/WildTreeSection.vue'
import type { WildTreeSeedOption } from '@/components/game/farm/WildTreeSection.vue'
import type { PlantedWildTree, WildTreeType } from '@/types'

const trees: PlantedWildTree[] = [
  {
    id: 1,
    type: 'pine',
    growthDays: 7,
    mature: false,
    hasTapper: false,
    tapDaysElapsed: 0,
    tapReady: false,
    chopCount: 0
  },
  {
    id: 2,
    type: 'camphor',
    growthDays: 20,
    mature: true,
    hasTapper: true,
    tapDaysElapsed: 8,
    tapReady: true,
    chopCount: 0
  },
  {
    id: 3,
    type: 'mulberry',
    growthDays: 28,
    mature: true,
    hasTapper: false,
    tapDaysElapsed: 0,
    tapReady: false,
    chopCount: 1
  }
]

const plantableWildSeeds: WildTreeSeedOption[] = [
  { type: 'pine', seedItemId: 'pine_seed', name: '松树', count: 5 },
  { type: 'mulberry', seedItemId: 'mulberry_seed', name: '桑树', count: 2 }
]

const treeNames: Record<WildTreeType, string> = {
  pine: '松树',
  camphor: '香樟',
  mulberry: '桑树'
}

const growthDays: Record<WildTreeType, number> = {
  pine: 14,
  camphor: 20,
  mulberry: 28
}

const tapCycleDays: Record<WildTreeType, number> = {
  pine: 7,
  camphor: 8,
  mulberry: 6
}

const mountSection = (props: Partial<InstanceType<typeof WildTreeSection>['$props']> = {}) =>
  mount(WildTreeSection, {
    props: {
      trees,
      plantableWildSeeds,
      hasTapper: true,
      getTreeName: type => treeNames[type],
      getGrowthDays: type => growthDays[type],
      getTapCycleDays: type => tapCycleDays[type],
      ...props
    }
  })

describe('WildTreeSection', () => {
  it('renders wild tree states, progress, and plant buttons', () => {
    const wrapper = mountSection()

    expect(wrapper.text()).toContain('野树')
    expect(wrapper.text()).toContain('共 3 棵')
    expect(wrapper.text()).toContain('松树')
    expect(wrapper.text()).toContain('生长中')
    expect(wrapper.text()).toContain('7/14天')
    expect(wrapper.text()).toContain('香樟')
    expect(wrapper.text()).toContain('可收取')
    expect(wrapper.text()).toContain('已完成')
    expect(wrapper.text()).toContain('桑树')
    expect(wrapper.text()).toContain('伐1/3')
    expect(wrapper.text()).toContain('装采脂器')
    expect(wrapper.text()).toContain('种松树 (×5)')
  })

  it('emits plant, collect, attach tapper, and chop events', async () => {
    const wrapper = mountSection()

    await wrapper.findAll('button').find(button => button.text().includes('种松树'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('收取'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('装采脂器'))?.trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('伐木'))?.trigger('click')

    expect(wrapper.emitted('plant')).toEqual([['pine']])
    expect(wrapper.emitted('collect')).toEqual([[2]])
    expect(wrapper.emitted('attach-tapper')).toEqual([[3]])
    expect(wrapper.emitted('chop')).toEqual([[2]])
  })

  it('renders empty state and missing tapper hint', () => {
    const emptyWrapper = mountSection({ trees: [] })
    expect(emptyWrapper.text()).toContain('暂无野树')
    expect(emptyWrapper.text()).toContain('可使用野树种子种植')

    const noTapperWrapper = mountSection({ hasTapper: false })
    expect(noTapperWrapper.text()).toContain('需制造采脂器')
    expect(noTapperWrapper.text()).not.toContain('装采脂器')
  })

  it('paginates wild trees at 50 per page', async () => {
    const manyTrees = Array.from({ length: 51 }, (_, index) => ({
      ...trees[2]!,
      id: index + 1
    }))
    const wrapper = mountSection({ trees: manyTrees })

    expect(wrapper.text()).toContain('第 1/2 页 · 51 项')
    expect(wrapper.findAll('button').filter(button => button.text() === '伐木')).toHaveLength(50)

    await wrapper.findAll('button').find(button => button.text() === '下一页')?.trigger('click')
    expect(wrapper.findAll('button').filter(button => button.text() === '伐木')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated tree tab previews', () => {
    const iterations = 120
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountSection().unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(35)
  })
})
