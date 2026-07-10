import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineMapDialog, { type MineMapZone } from '@/components/game/mining/MineMapDialog.vue'

const zones: MineMapZone[] = [
  {
    id: 'shallow',
    name: '浅矿·土石洞穴',
    start: 1,
    end: 20,
    reached: true,
    bossName: '岩甲王',
    bossDefeated: true,
    progress: 100,
    isCurrentZone: false,
    barColor: 'bg-success'
  },
  {
    id: 'frost',
    name: '冰窟·冰霜暗河',
    start: 21,
    end: 40,
    reached: true,
    bossName: '寒霜兽',
    bossDefeated: false,
    progress: 40,
    isCurrentZone: true,
    barColor: 'bg-accent'
  },
  {
    id: 'lava',
    name: '熔岩层·地火暗涌',
    start: 41,
    end: 60,
    reached: false,
    bossName: '熔岩领主',
    bossDefeated: false,
    progress: 0,
    isCurrentZone: false,
    barColor: 'bg-bg'
  }
]

const mountDialog = (props: Partial<InstanceType<typeof MineMapDialog>['$props']> = {}) =>
  mount(MineMapDialog, {
    props: {
      show: true,
      safePointFloor: 25,
      zones,
      ...props
    }
  })

describe('MineMapDialog', () => {
  it('renders safe point and mine zones', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('矿洞地图')
    expect(wrapper.text()).toContain('安全点：第25层')
    expect(wrapper.text()).toContain('浅矿·土石洞穴')
    expect(wrapper.text()).toContain('岩甲王')
    expect(wrapper.text()).toContain('冰窟·冰霜暗河')
    expect(wrapper.text()).toContain('寒霜兽')
  })

  it('renders entrance safe point text', () => {
    const wrapper = mountDialog({ safePointFloor: 0 })

    expect(wrapper.text()).toContain('安全点：入口')
  })

  it('emits close from close button', async () => {
    const wrapper = mountDialog()

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated map previews', () => {
    const iterations = 120
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ safePointFloor: i % 120 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(30)
  })
})
