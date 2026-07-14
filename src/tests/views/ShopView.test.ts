import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ShopView from '@/views/game/ShopView.vue'
import {
  getOfficialFruitTreeBySaplingId,
  getOfficialShopOfferGroupsForShop
} from '@/domain/mods/contentAccess'
import { useGameStore } from '@/stores/useGameStore'
import { useShopStore } from '@/stores/useShopStore'

const mocks = vi.hoisted(() => ({
  addLog: vi.fn(),
  showFloat: vi.fn(),
  sfxBuy: vi.fn(),
  farmAction: vi.fn()
}))

vi.mock('@/composables/useGameLog', () => ({
  addLog: mocks.addLog,
  showFloat: mocks.showFloat
}))

vi.mock('@/composables/useAudio', () => ({
  sfxBuy: mocks.sfxBuy
}))

vi.mock('@/composables/useFarmActions', () => ({
  handleBuySeed: mocks.farmAction,
  handleSellItem: mocks.farmAction,
  handleSellItemAll: mocks.farmAction,
  handleSellAll: mocks.farmAction,
  QUALITY_NAMES: {
    normal: 'normal',
    fine: 'fine',
    excellent: 'excellent',
    supreme: 'supreme'
  }
}))

describe('ShopView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mocks.addLog.mockClear()
    mocks.showFloat.mockClear()
    mocks.sfxBuy.mockClear()
    mocks.farmAction.mockClear()
  })

  it('renders shop product groups from the official shop offer registry facade', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const gameStore = useGameStore()
    const shopStore = useShopStore()
    gameStore.startNewGame()

    const wrapper = mount(ShopView, {
      global: {
        plugins: [pinia],
        stubs: {
          Transition: false
        }
      }
    })

    shopStore.currentShopId = 'yugupu'
    await nextTick()

    const text = wrapper.text()
    const registryGroups = getOfficialShopOfferGroupsForShop({ shopId: 'yugupu', season: gameStore.season })
    expect(shopStore.currentShopOfferGroups.map(group => group.groupId)).toEqual(registryGroups.map(group => group.groupId))
    for (const group of registryGroups) {
      expect(text).toContain(group.groupName)
      for (const offer of group.offers) {
        expect(text).toContain(offer.name?.fallback)
      }
    }

    wrapper.unmount()
  })

  it('renders every sapling with registry-backed price and tree details', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const gameStore = useGameStore()
    const shopStore = useShopStore()
    gameStore.startNewGame()

    const wrapper = mount(ShopView, {
      global: {
        plugins: [pinia],
        stubs: {
          Transition: false
        }
      }
    })

    shopStore.currentShopId = 'wanwupu'
    await nextTick()

    const text = wrapper.text()
    const offers = getOfficialShopOfferGroupsForShop({ shopId: 'wanwupu', season: gameStore.season })
      .flatMap(group => group.offers)
    const saplingOffers = offers.flatMap(offer => {
      const tree = getOfficialFruitTreeBySaplingId(offer.itemId)
      return tree ? [{ offer, tree }] : []
    })
    expect(saplingOffers).toHaveLength(8)
    for (const { offer, tree } of saplingOffers) {
      expect(offer.price).toBe(tree.saplingPrice)
      expect(text).toContain(`${tree.name}苗`)
      expect(text).toContain(`${tree.growthDays}天成熟`)
      expect(text).toContain(`${tree.fruitName}`)
      expect(text).toContain(`${offer.price}文`)
    }

    wrapper.unmount()
  })
})
