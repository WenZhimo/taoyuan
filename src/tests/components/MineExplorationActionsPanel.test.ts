import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineExplorationActionsPanel from '@/components/game/mining/MineExplorationActionsPanel.vue'

const mountPanel = (props: Partial<InstanceType<typeof MineExplorationActionsPanel>['$props']> = {}) =>
  mount(MineExplorationActionsPanel, {
    props: {
      sweepPreview: { targetFloor: 20, estimatedDamage: 35 },
      canSweepToSafePoint: true,
      remainingCombatTiles: 2,
      autoExploreActive: false,
      bombs: [{ id: 'bomb', name: '炸弹', count: 3 }],
      activeBombId: null,
      hasMonsterLure: true,
      monsterLureCount: 4,
      combatItemCount: 2,
      stairsFound: true,
      stairsUsable: true,
      isInSkullCavern: false,
      ...props
    }
  })

describe('MineExplorationActionsPanel', () => {
  it('renders all available exploration actions', () => {
    const wrapper = mountPanel()

    expect(wrapper.text()).toContain('扫荡至安全点')
    expect(wrapper.text()).toContain('HP-35 · 第20层')
    expect(wrapper.text()).toContain('连战本层')
    expect(wrapper.text()).toContain('2个敌人')
    expect(wrapper.text()).toContain('自动探索')
    expect(wrapper.text()).toContain('炸弹')
    expect(wrapper.text()).toContain('怪物诱饵')
    expect(wrapper.text()).toContain('使用道具')
    expect(wrapper.text()).toContain('下一层')
    expect(wrapper.text()).toContain('离开矿洞')
  })

  it('renders disabled sweep and stairs states', async () => {
    const wrapper = mountPanel({
      canSweepToSafePoint: false,
      stairsUsable: false,
      autoExploreActive: true,
      activeBombId: 'bomb',
      isInSkullCavern: true
    })

    expect(wrapper.text()).toContain('停止自动探索')
    expect(wrapper.text()).toContain('楼梯不可用')
    expect(wrapper.text()).toContain('离开骷髅矿穴')

    await wrapper.get('[data-testid="sweep-to-safe-point"]').trigger('click')
    await wrapper.get('[data-testid="next-floor"]').trigger('click')

    expect(wrapper.emitted('sweep-to-safe-point')).toBeUndefined()
    expect(wrapper.emitted('next-floor')).toBeUndefined()
  })

  it('emits action events', async () => {
    const wrapper = mountPanel()

    await wrapper.get('[data-testid="sweep-to-safe-point"]').trigger('click')
    await wrapper.get('[data-testid="start-chain-battle"]').trigger('click')
    await wrapper.get('[data-testid="toggle-auto-explore"]').trigger('click')
    await wrapper.get('[data-testid="toggle-bomb-bomb"]').trigger('click')
    await wrapper.get('[data-testid="use-monster-lure"]').trigger('click')
    await wrapper.get('[data-testid="open-combat-items"]').trigger('click')
    await wrapper.get('[data-testid="next-floor"]').trigger('click')
    await wrapper.get('[data-testid="request-leave"]').trigger('click')

    expect(wrapper.emitted('sweep-to-safe-point')).toHaveLength(1)
    expect(wrapper.emitted('start-chain-battle')).toHaveLength(1)
    expect(wrapper.emitted('toggle-auto-explore')).toHaveLength(1)
    expect(wrapper.emitted('toggle-bomb-mode')?.[0]).toEqual(['bomb'])
    expect(wrapper.emitted('use-monster-lure')).toHaveLength(1)
    expect(wrapper.emitted('open-combat-items')).toHaveLength(1)
    expect(wrapper.emitted('next-floor')).toHaveLength(1)
    expect(wrapper.emitted('request-leave')).toHaveLength(1)
  })

  it('hides unavailable optional actions', () => {
    const wrapper = mountPanel({
      sweepPreview: { targetFloor: null, estimatedDamage: 0 },
      remainingCombatTiles: 0,
      bombs: [],
      hasMonsterLure: false,
      combatItemCount: 0,
      stairsFound: false
    })

    expect(wrapper.text()).not.toContain('扫荡至安全点')
    expect(wrapper.text()).not.toContain('连战本层')
    expect(wrapper.text()).not.toContain('炸弹')
    expect(wrapper.text()).not.toContain('怪物诱饵')
    expect(wrapper.text()).not.toContain('使用道具')
    expect(wrapper.text()).not.toContain('下一层')
    expect(wrapper.text()).toContain('离开矿洞')
  })

  it('mounts cheaply enough for repeated action panels', () => {
    const iterations = 150
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountPanel({ autoExploreActive: i % 2 === 0, remainingCombatTiles: i % 4 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(30)
  })
})
