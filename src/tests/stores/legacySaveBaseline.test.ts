import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { GREENHOUSE_PLOT_COUNT } from '@/data/buildings'
import { useFarmStore } from '@/stores/useFarmStore'
import { useGameStore } from '@/stores/useGameStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useMiningStore } from '@/stores/useMiningStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSaveStore } from '@/stores/useSaveStore'
import { encodeSaveData } from '@/utils/saveCodec'
import legacySaveFixture from '../fixtures/saves/legacy-v1-baseline.json'

const SAVE_KEY_PREFIX = 'taoyuanxiang_save_'

describe('legacy save baseline fixture', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('loads, migrates, saves, and reloads the legacy baseline save', async() => {
    const legacySaveData: Record<string, unknown> = legacySaveFixture
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, await encodeSaveData(legacySaveData))

    const saveStore = useSaveStore()
    expect(await saveStore.loadFromSlot(0)).toBe(true)

    const gameStore = useGameStore()
    const playerStore = usePlayerStore()
    const inventoryStore = useInventoryStore()
    const farmStore = useFarmStore()
    const miningStore = useMiningStore()

    expect(gameStore.year).toBe(1)
    expect(gameStore.season).toBe('autumn')
    expect(gameStore.currentLocation).toBe('mine')
    expect(playerStore.money).toBe(12345)
    expect(inventoryStore.getItemCount('cabbage')).toBe(45)
    expect(inventoryStore.pendingUpgrades).toHaveLength(1)
    expect(inventoryStore.pendingUpgrades[0]?.toolType).toBe('pickaxe')
    expect(farmStore.plots).toHaveLength(4)
    expect(farmStore.plots[0]?.fertilizer).toBe('basic_fertilizer')
    expect(farmStore.greenhousePlots).toHaveLength(GREENHOUSE_PLOT_COUNT)
    expect(farmStore.greenhousePlots[0]?.fertilizer).toBe('deluxe_speed_gro')
    expect(miningStore.defeatedBosses).toContain('boss_slime_king')
    expect(miningStore.isExploring).toBe(false)
    expect(miningStore.inCombat).toBe(false)
    expect(miningStore.combatMonster).toBeNull()

    expect(await saveStore.saveToSlot(0)).toBe(true)
    setActivePinia(createPinia())
    expect(await useSaveStore().loadFromSlot(0)).toBe(true)
    expect(useInventoryStore().getItemCount('cabbage')).toBe(45)
  })
})
