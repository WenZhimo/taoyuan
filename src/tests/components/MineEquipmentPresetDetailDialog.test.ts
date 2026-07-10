import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MineEquipmentPresetDetailDialog from '@/components/game/mining/MineEquipmentPresetDetailDialog.vue'
import type { EquipmentPreset } from '@/stores/useInventoryStore'

const preset: EquipmentPreset = {
  id: 'combat',
  name: '战斗方案',
  weaponDefId: 'rusty_sword',
  ringSlot1DefId: 'basic_ring',
  ringSlot2DefId: null,
  hatDefId: 'straw_hat',
  shoeDefId: 'cloth_shoes'
}

const mountDialog = (props: Partial<InstanceType<typeof MineEquipmentPresetDetailDialog>['$props']> = {}) =>
  mount(MineEquipmentPresetDetailDialog, {
    props: {
      show: true,
      preset,
      ...props
    }
  })

describe('MineEquipmentPresetDetailDialog', () => {
  it('renders preset equipment rows and empty slots', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('战斗方案')
    expect(wrapper.text()).toContain('武器')
    expect(wrapper.text()).toContain('戒指1')
    expect(wrapper.text()).toContain('戒指2')
    expect(wrapper.text()).toContain('帽子')
    expect(wrapper.text()).toContain('鞋子')
    expect(wrapper.text()).toContain('无')
  })

  it('emits close and equipment detail actions', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-testid="close-preset-detail"]').trigger('click')
    await wrapper.get('[data-testid="preset-equipment-武器"]').trigger('click')
    await wrapper.get('[data-testid="preset-equipment-戒指1"]').trigger('click')
    await wrapper.get('[data-testid="preset-equipment-戒指2"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('view-equipment')?.[0]).toEqual(['weapon', 'rusty_sword'])
    expect(wrapper.emitted('view-equipment')?.[1]).toEqual(['ring', 'basic_ring'])
    expect(wrapper.emitted('view-equipment')).toHaveLength(2)
  })

  it('does not render without a selected preset', () => {
    const wrapper = mountDialog({ preset: null })

    expect(wrapper.text()).toBe('')
  })

  it('mounts cheaply enough for repeated preset detail previews', () => {
    const iterations = 200
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountDialog({ show: i % 2 === 0 }).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(25)
  })
})
