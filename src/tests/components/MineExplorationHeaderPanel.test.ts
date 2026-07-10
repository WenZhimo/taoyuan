import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineExplorationHeaderPanel from '@/components/game/mining/MineExplorationHeaderPanel.vue'

const mountPanel = (props: Partial<InstanceType<typeof MineExplorationHeaderPanel>['$props']> = {}) =>
  mount(MineExplorationHeaderPanel, {
    props: {
      activeFloorNum: 25,
      isInSkullCavern: false,
      zoneName: '冰窟',
      currentFloorSpecial: null,
      remainingMonsters: 0,
      autoExploreActive: false,
      bombModeActive: false,
      weaponDisplayName: '寒铁剑',
      weaponTypeName: '长剑',
      weaponAttack: 42,
      critRateDisplay: '18%',
      weaponEnchantName: '锋利x2',
      ...props
    }
  })

describe('MineExplorationHeaderPanel', () => {
  it('renders floor, zone, weapon summary, and enchantment summary', () => {
    const wrapper = mountPanel()

    expect(wrapper.text()).toContain('第25层')
    expect(wrapper.text()).toContain('冰窟')
    expect(wrapper.text()).toContain('寒铁剑')
    expect(wrapper.text()).toContain('长剑 · 攻击 42 · 暴击 18%')
    expect(wrapper.text()).toContain('锋利x2')
  })

  it('renders special floor, infested warning, auto exploration, and bomb mode prompts', () => {
    const wrapper = mountPanel({
      currentFloorSpecial: 'infested',
      remainingMonsters: 3,
      autoExploreActive: true,
      bombModeActive: true
    })

    expect(wrapper.text()).toContain('感染层')
    expect(wrapper.text()).toContain('还需击败 3 只怪物')
    expect(wrapper.text()).toContain('自动探索中')
    expect(wrapper.text()).toContain('炸弹模式')
  })

  it('hides zone and enchantment summary when unavailable', () => {
    const wrapper = mountPanel({ isInSkullCavern: true, weaponEnchantName: '' })

    expect(wrapper.text()).not.toContain('冰窟')
    expect(wrapper.text()).not.toContain('附魔')
    expect(wrapper.text()).not.toContain('详情')
  })

  it('emits leave, enchantment detail, and cancel bomb actions', async () => {
    const wrapper = mountPanel({ bombModeActive: true })

    await wrapper.get('[data-testid="request-leave"]').trigger('click')
    await wrapper.get('[data-testid="view-enchantment-detail"]').trigger('click')
    await wrapper.get('[data-testid="cancel-bomb-mode"]').trigger('click')

    expect(wrapper.emitted('request-leave')).toHaveLength(1)
    expect(wrapper.emitted('view-enchantment-detail')).toHaveLength(1)
    expect(wrapper.emitted('cancel-bomb-mode')).toHaveLength(1)
  })

  it('mounts cheaply enough for repeated exploration header previews', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountPanel({ activeFloorNum: i + 1, currentFloorSpecial: i % 2 === 0 ? 'treasure' : null }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
