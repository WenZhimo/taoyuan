import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import InventoryView from '@/views/game/InventoryView.vue'
import { useInventoryStore } from '@/stores/useInventoryStore'

vi.mock('@/composables/useGameLog', () => ({
  addLog: vi.fn(),
  showFloat: vi.fn(),
  applyQmsgConfig: vi.fn(),
  _registerPerkChecker: vi.fn()
}))

describe('InventoryView missing-content items', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows the original ID and disables destructive actions for unknown items', async() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const inventoryStore = useInventoryStore()
    inventoryStore.items = [{ itemId: 'missing_pack:ancient_seed', quantity: 3, quality: 'fine' }]

    const wrapper = mount(InventoryView, {
      global: {
        plugins: [pinia],
        stubs: {
          Transition: false
        }
      }
    })

    expect(wrapper.text()).toContain('未知内容（missing_pack:ancient_seed）')

    const itemCell = wrapper.findAll('.cursor-pointer').find(node => node.text().includes('missing_pack:ancient_seed'))
    expect(itemCell).toBeTruthy()
    await itemCell!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('数据已保留')
    const lockButton = wrapper.findAll('button').find(button => button.text().includes('锁定'))
    const discardButton = wrapper.findAll('button').find(button => button.text().includes('丢弃'))
    expect(lockButton?.attributes('disabled')).toBeDefined()
    expect(discardButton).toBeUndefined()

    wrapper.unmount()
  })
})
