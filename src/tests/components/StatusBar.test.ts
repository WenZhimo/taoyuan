import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import StatusBar from '@/components/game/StatusBar.vue'
import { useGameStore } from '@/stores/useGameStore'
import { usePlayerStore } from '@/stores/usePlayerStore'

const createStatusBarState = () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const gameStore = useGameStore()
  const playerStore = usePlayerStore()

  gameStore.year = 2
  gameStore.season = 'summer'
  gameStore.day = 8
  gameStore.hour = 18.5
  gameStore.weather = 'rainy'
  playerStore.playerName = '测试玩家'
  playerStore.money = 1234
  playerStore.stamina = 72

  return { gameStore, pinia, playerStore }
}

const mountStatusBar = (pinia: Pinia) =>
  mount(StatusBar, {
    global: {
      plugins: [pinia]
    }
  })

describe('StatusBar', () => {
  it('renders the current game and player status', () => {
    const { pinia } = createStatusBarState()
    const wrapper = mountStatusBar(pinia)

    expect(wrapper.text()).toContain('测试玩家')
    expect(wrapper.text()).toContain('第2年')
    expect(wrapper.text()).toContain('夏 第8天')
    expect(wrapper.text()).toContain('晚上 18:30')
    expect(wrapper.text()).toContain('雨')
    expect(wrapper.text()).toContain('1234文')
    expect(wrapper.text()).toContain('72/')
  })

  it('emits the nap request from the status bar entry', async () => {
    const { pinia } = createStatusBarState()
    const wrapper = mountStatusBar(pinia)

    await wrapper.findAll('button').find(button => button.text().includes('小憩'))?.trigger('click')

    expect(wrapper.emitted('request-nap')).toHaveLength(1)
  })

  it('shows the hp bar while the player is in a mine', () => {
    const { gameStore, pinia, playerStore } = createStatusBarState()
    gameStore.currentLocationGroup = 'mine'
    playerStore.hp = playerStore.getMaxHp()

    const wrapper = mountStatusBar(pinia)

    expect(wrapper.text()).toContain(`${playerStore.hp}/${playerStore.getMaxHp()}`)
  })

  it('mounts cheaply enough for repeated layout updates', () => {
    const { pinia } = createStatusBarState()
    const iterations = 150
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      mountStatusBar(pinia).unmount()
    }

    const averageMountMs = (performance.now() - start) / iterations
    expect(averageMountMs).toBeLessThan(40)
  })
})
