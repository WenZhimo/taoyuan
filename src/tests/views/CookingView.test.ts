import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CookingView from '@/views/game/CookingView.vue'
import { useCookingStore } from '@/stores/useCookingStore'
import { useInventoryStore } from '@/stores/useInventoryStore'

const mocks = vi.hoisted(() => ({
  addLog: vi.fn(),
  handleEndDay: vi.fn(),
  sfxClick: vi.fn()
}))

vi.mock('@/composables/useGameLog', () => ({
  addLog: mocks.addLog
}))

vi.mock('@/composables/useEndDay', () => ({
  handleEndDay: mocks.handleEndDay
}))

vi.mock('@/composables/useAudio', () => ({
  sfxClick: mocks.sfxClick
}))

describe('CookingView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mocks.addLog.mockClear()
    mocks.handleEndDay.mockClear()
    mocks.sfxClick.mockClear()
  })

  it('lets players choose a concrete item for a tag ingredient slot before cooking', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const inventoryStore = useInventoryStore()
    const cookingStore = useCookingStore()

    expect(cookingStore.unlockRecipe('steamed_bun')).toBe(true)
    expect(inventoryStore.addItem('wheat_flour', 2, 'fine')).toBe(true)
    expect(inventoryStore.addItem('cabbage', 1, 'supreme')).toBe(true)
    expect(inventoryStore.addItem('carp', 2, 'normal')).toBe(true)

    const wrapper = mount(CookingView, {
      global: {
        plugins: [pinia],
        stubs: {
          Transition: false
        }
      }
    })

    const bunRow = wrapper.findAll('.cursor-pointer').find(row => row.text().includes('馒头'))
    expect(bunRow).toBeTruthy()
    await bunRow!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('素食或肉类材料')
    expect(wrapper.text()).toContain('青菜 · 1')
    expect(wrapper.text()).toContain('鲤鱼 · 2')

    const selector = wrapper.find('select')
    expect(selector.exists()).toBe(true)
    await selector.setValue('cabbage')
    await nextTick()

    expect(wrapper.text()).toContain('将消耗：青菜（极品）×1')
    expect(wrapper.text()).toContain('[优良]')

    const cookButton = wrapper.findAll('button').find(button => button.text().includes('烹饪'))
    expect(cookButton).toBeTruthy()
    await cookButton!.trigger('click')

    expect(inventoryStore.getItemCount('wheat_flour', 'fine')).toBe(1)
    expect(inventoryStore.getItemCount('cabbage', 'supreme')).toBe(0)
    expect(inventoryStore.getItemCount('carp', 'normal')).toBe(2)
    expect(inventoryStore.getItemCount('food_steamed_bun', 'fine')).toBe(1)
    expect(mocks.addLog).toHaveBeenCalledWith('烹饪了【优良】馒头！')

    wrapper.unmount()
  })
})
