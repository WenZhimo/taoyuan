import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import StatusBar from '@/components/game/StatusBar.vue'
import { useGameStore } from '@/stores/useGameStore'
import GameLayout from '@/views/GameLayout.vue'

describe('GameLayout', () => {
  it('mounts after a new game starts without setup errors', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useGameStore().startNewGame()

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/game/farm',
          name: 'farm',
          component: { template: '<div />' }
        }
      ]
    })
    await router.push('/game/farm')
    await router.isReady()

    const wrapper = shallowMount(GameLayout, {
      global: {
        plugins: [pinia, router],
        stubs: {
          RouterView: { template: '<div data-testid="router-view" />' },
          Transition: false
        }
      }
    })

    expect(wrapper.findComponent(StatusBar).exists()).toBe(true)
    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true)

    wrapper.unmount()
  })
})
