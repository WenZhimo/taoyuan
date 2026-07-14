import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getOfficialAvailableFish,
  getOfficialFishDefsAsLegacy
} from '@/domain/mods/contentAccess'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { useFishingStore } from '@/stores/useFishingStore'
import { useGameStore } from '@/stores/useGameStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useWalletStore } from '@/stores/useWalletStore'

const mockRandomSequence = (...values: number[]) => {
  let index = 0
  return vi.spyOn(Math, 'random').mockImplementation(() => values[Math.min(index++, values.length - 1)]!)
}

describe('fishing store registry runtime', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reads available fish through the official fish registry facade', () => {
    const gameStore = useGameStore()
    const fishingStore = useFishingStore()

    gameStore.season = 'autumn'
    gameStore.weather = 'rainy'
    fishingStore.setLocation('river')

    expect(fishingStore.availableFish).toEqual(getOfficialAvailableFish('autumn', 'rainy', 'river'))
  })

  it('starts ordinary fishing from the registry-backed availability pool without extra random calls', () => {
    const gameStore = useGameStore()
    const fishingStore = useFishingStore()
    const expectedPool = getOfficialAvailableFish('spring', 'sunny', 'creek')
    const random = mockRandomSequence(0.99, 0)

    gameStore.season = 'spring'
    gameStore.weather = 'sunny'
    fishingStore.setLocation('creek')

    const result = fishingStore.startFishing()

    expect(result.success).toBe(true)
    expect(fishingStore.currentFish?.id).toBe(expectedPool[0]!.id)
    expect(random).toHaveBeenCalledTimes(2)
  })

  it('uses the registry fish list for magic bait while preserving season-ignore behavior', () => {
    const gameStore = useGameStore()
    const fishingStore = useFishingStore()
    const inventoryStore = useInventoryStore()

    gameStore.season = 'winter'
    gameStore.weather = 'sunny'
    fishingStore.setLocation('river')

    expect(fishingStore.availableFish).toHaveLength(0)
    const expectedPool = getOfficialFishDefsAsLegacy().filter(
      fish => (fish.location ?? 'creek') === 'river' && (fish.weather.includes('any') || fish.weather.includes('sunny'))
    )
    expect(expectedPool.length).toBeGreaterThan(0)

    expect(inventoryStore.addItem('magic_bait', 1)).toBe(true)
    expect(fishingStore.equipBait('magic_bait').success).toBe(true)
    const random = mockRandomSequence(0.99, 0)

    const result = fishingStore.startFishing()

    expect(result.success).toBe(true)
    expect(fishingStore.currentFish?.id).toBe(expectedPool[0]!.id)
    expect(random).toHaveBeenCalledTimes(2)
  })

  it('unlocks the angler wallet item from registry-backed fish IDs', () => {
    const achievementStore = useAchievementStore()
    const walletStore = useWalletStore()

    for (const fish of getOfficialFishDefsAsLegacy().slice(0, 30)) {
      achievementStore.discoverItem(fish.id)
    }

    walletStore.checkAndUnlock()

    expect(walletStore.has('anglers_token')).toBe(true)
  })
})
