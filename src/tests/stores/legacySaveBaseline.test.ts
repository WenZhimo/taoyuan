import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { GREENHOUSE_PLOT_COUNT } from '@/data/buildings'
import { useFarmStore } from '@/stores/useFarmStore'
import { useGameStore } from '@/stores/useGameStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useMiningStore } from '@/stores/useMiningStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSaveStore } from '@/stores/useSaveStore'
import { encodeSaveData, parseSaveData } from '@/utils/saveCodec'
import { createOfficialSaveContentEnvironment, createSaveContentEnvironment } from '@/domain/save/saveContentEnvironment'
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
    const migrated = await parseSaveData(localStorage.getItem(`${SAVE_KEY_PREFIX}0`) ?? '')
    expect(migrated?.saveFormatVersion).toBe(2)
    expect(migrated?.contentEnvironment).toMatchObject({
      formatVersion: 1,
      environmentHash: expect.stringMatching(/^sha256:[0-9a-f]{64}$/)
    })

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

  it('rejects a save from another content environment without rewriting the slot', async() => {
    const official = createOfficialSaveContentEnvironment()
    const alternate = createSaveContentEnvironment({
      gameVersion: official.gameVersion,
      engineApiVersion: official.engineApiVersion,
      contentSchemaVersion: official.contentSchemaVersion,
      loaderVersion: official.loaderVersion,
      contentCompilerVersion: official.contentCompilerVersion,
      schemaSetHash: official.schemaSetHash,
      cacheFormatVersion: official.cacheFormatVersion,
      trustPolicyVersion: official.trustPolicyVersion,
      packages: official.packages.map(pkg => ({
        ...pkg,
        configurationHash: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }))
    })
    const incompatible = {
      ...legacySaveFixture,
      saveFormatVersion: 2,
      contentEnvironment: alternate
    }
    const encoded = await encodeSaveData(incompatible)
    localStorage.setItem(`${SAVE_KEY_PREFIX}0`, encoded)

    const saveStore = useSaveStore()
    expect(await saveStore.loadFromSlot(0)).toBe(false)
    expect(localStorage.getItem(`${SAVE_KEY_PREFIX}0`)).toBe(encoded)
    expect(useGameStore().isGameStarted).toBe(false)
  })
})
