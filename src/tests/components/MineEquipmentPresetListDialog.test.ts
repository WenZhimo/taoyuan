import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineEquipmentPresetListDialog from '@/components/game/mining/MineEquipmentPresetListDialog.vue'
import type { EquipmentPreset } from '@/stores/useInventoryStore'

const presets: EquipmentPreset[] = [
  {
    id: 'combat',
    name: '战斗方案',
    weaponDefId: 'iron_sword',
    ringSlot1DefId: null,
    ringSlot2DefId: null,
    hatDefId: null,
    shoeDefId: null
  },
  {
    id: 'mining',
    name: '采矿方案',
    weaponDefId: null,
    ringSlot1DefId: 'miner_ring',
    ringSlot2DefId: null,
    hatDefId: null,
    shoeDefId: null
  }
]

const mountDialog = (props: Partial<InstanceType<typeof MineEquipmentPresetListDialog>['$props']> = {}) =>
  mount(MineEquipmentPresetListDialog, {
    props: {
      show: true,
      presets,
      activePresetId: 'combat',
      ...props
    }
  })

describe('MineEquipmentPresetListDialog', () => {
  it('renders preset list and active marker', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('装备方案')
    expect(wrapper.text()).toContain('战斗方案')
    expect(wrapper.text()).toContain('采矿方案')
    expect(wrapper.text()).toContain('使用中')
    expect(wrapper.get('[data-testid="apply-preset-combat"]').attributes('disabled')).toBeDefined()
  })

  it('renders empty state', () => {
    const wrapper = mountDialog({ presets: [], activePresetId: null })

    expect(wrapper.text()).toContain('暂无方案')
    expect(wrapper.text()).toContain('前往背包装备页创建方案')
  })

  it('emits close, apply, and view actions', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-testid="close-preset-list"]').trigger('click')
    await wrapper.get('[data-testid="apply-preset-mining"]').trigger('click')
    await wrapper.get('[data-testid="view-preset-combat"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('apply-preset')?.[0]).toEqual(['mining'])
    expect(wrapper.emitted('view-preset')?.[0]).toEqual(['combat'])
  })

  it('mounts cheaply enough for repeated preset previews', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ activePresetId: i % 2 === 0 ? 'combat' : 'mining' }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
