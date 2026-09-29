import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProcessingView from '@/views/game/ProcessingView.vue'
import { useProcessingStore } from '@/stores/useProcessingStore'

vi.mock('@/composables/useGameLog', () => ({
  addLog: vi.fn(),
  showFloat: vi.fn(),
  applyQmsgConfig: vi.fn(),
  _registerPerkChecker: vi.fn()
}))

vi.mock('@/composables/useAudio', () => ({
  sfxClick: vi.fn()
}))

vi.mock('@/composables/useEndDay', () => ({
  handleEndDay: vi.fn()
}))

describe('ProcessingView missing-content machines', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows unknown facilities and recipes as preserved read-only content', async() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const processingStore = useProcessingStore()
    processingStore.deserialize({
      machines: [
        {
          machineType: 'missing_pack:fermenter',
          recipeId: 'missing_pack:ancient_wine',
          inputItemId: 'missing_pack:fruit',
          inputQuality: 'fine',
          daysProcessed: 2,
          totalDays: 5,
          ready: false
        }
      ],
      workshopLevel: 0,
      collapsedGroups: []
    })

    const wrapper = mount(ProcessingView, {
      global: {
        plugins: [pinia],
        stubs: {
          Transition: false,
          Button: { template: '<button><slot /></button>' },
          PaginationControls: { template: '<div />' }
        }
      }
    })
    await nextTick()

    expect(wrapper.text()).toContain('未知设施（原 ID：missing_pack:fermenter）')
    expect(wrapper.text()).toContain('未知配方（原 ID：missing_pack:ancient_wine）')
    expect(wrapper.text()).toContain('数据已保留，当前只读。')
    expect(wrapper.text()).not.toContain('取消加工')
    expect(processingStore.machines[0]?.machineType).toBe('missing_pack:fermenter')
    wrapper.unmount()
  })
})
