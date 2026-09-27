import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useInventoryStore } from '@/stores/useInventoryStore'
import CharInfoView from '@/views/game/CharInfoView.vue'

vi.mock('@/composables/useGameLog', () => ({
  addLog: vi.fn(),
  _registerPerkChecker: vi.fn()
}))

describe('CharInfoView missing-content equipment', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows preserved unknown equipment as read-only and keeps its equipped index', async() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const inventoryStore = useInventoryStore()
    inventoryStore.deserialize({
      ownedWeapons: [{ defId: 'missing_pack:ancient_blade', enchantmentIds: ['missing_pack:ancient_enchant'] }],
      equippedWeaponIndex: 0
    })

    const wrapper = mount(CharInfoView, {
      global: {
        plugins: [pinia],
        stubs: {
          Transition: false,
          Button: { template: '<button><slot /></button>' }
        }
      }
    })

    const weaponSlot = wrapper.findAll('.cursor-pointer').find(node => node.text().includes('武器'))
    expect(weaponSlot).toBeTruthy()
    await weaponSlot!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('未知内容（missing_pack:ancient_blade）')
    expect(wrapper.text()).toContain('未知附魔：missing_pack:ancient_enchant')
    const unknownWeapon = wrapper.findAll('[aria-disabled="true"]').find(node => node.text().includes('missing_pack:ancient_blade'))
    expect(unknownWeapon).toBeTruthy()
    await unknownWeapon!.trigger('click')

    expect(inventoryStore.equippedWeaponIndex).toBe(0)
    expect(inventoryStore.ownedWeapons[0]?.defId).toBe('missing_pack:ancient_blade')
    wrapper.unmount()
  })
})
