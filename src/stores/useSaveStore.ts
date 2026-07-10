import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { saveAs } from 'file-saver'
import { useGameStore, SEASON_NAMES } from './useGameStore'
import { usePlayerStore } from './usePlayerStore'
import { useInventoryStore } from './useInventoryStore'
import { useFarmStore } from './useFarmStore'
import { useSkillStore } from './useSkillStore'
import { useNpcStore } from './useNpcStore'
import { useMiningStore } from './useMiningStore'
import { useCookingStore } from './useCookingStore'
import { useProcessingStore } from './useProcessingStore'
import { useAchievementStore } from './useAchievementStore'
import { useAnimalStore } from './useAnimalStore'
import { useHomeStore } from './useHomeStore'
import { useFishingStore } from './useFishingStore'
import { useWalletStore } from './useWalletStore'
import { useQuestStore } from './useQuestStore'
import { useShopStore } from './useShopStore'
import { useSettingsStore } from './useSettingsStore'
import { useWarehouseStore } from './useWarehouseStore'
import { useBreedingStore } from './useBreedingStore'
import { useMuseumStore } from './useMuseumStore'
import { useGuildStore } from './useGuildStore'
import { useSecretNoteStore } from './useSecretNoteStore'
import { useHanhaiStore } from './useHanhaiStore'
import { useFishPondStore } from './useFishPondStore'
import { useTutorialStore } from './useTutorialStore'
import { useHiddenNpcStore } from './useHiddenNpcStore'
import { encodeSaveData, normalizeSaveData } from '@/utils/saveCodec'

export { parseSaveData } from '@/utils/saveCodec'

const SAVE_KEY_PREFIX = 'taoyuanxiang_save_'
const SAVE_META_KEY_PREFIX = 'taoyuanxiang_save_meta_'
const MAX_SLOTS = 3
const SAVE_FILE_EXT = '.tyx'

type SaveOperation = 'saving' | 'loading' | 'importing'

export interface SaveSlotInfo {
  slot: number
  exists: boolean
  year?: number
  season?: string
  day?: number
  money?: number
  playerName?: string
  savedAt?: string
}

const yieldToUi = (): Promise<void> =>
  new Promise(resolve => {
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => resolve())
    else setTimeout(resolve, 0)
  })

const createSlotInfo = (slot: number, data: Record<string, any>): SaveSlotInfo => ({
  slot,
  exists: true,
  year: data.game?.year,
  season: data.game?.season,
  day: data.game?.day,
  money: data.player?.money,
  playerName: data.player?.playerName,
  savedAt: data.savedAt
})

export const useSaveStore = defineStore('save', () => {
  /** 当前活跃存档槽位，-1 表示未分配 */
  const activeSlot = ref(-1)
  const operation = ref<SaveOperation | null>(null)
  const isBusy = computed(() => operation.value !== null)
  const operationLabel = computed(() => {
    if (operation.value === 'saving') return '正在压缩并保存存档...'
    if (operation.value === 'loading') return '正在读取并解压存档...'
    if (operation.value === 'importing') return '正在导入并转换存档...'
    return ''
  })

  const runOperation = async (
    nextOperation: SaveOperation,
    task: () => Promise<boolean>
  ): Promise<boolean> => {
    if (operation.value) return false
    operation.value = nextOperation
    await yieldToUi()
    try {
      return await task()
    } catch {
      return false
    } finally {
      operation.value = null
    }
  }

  const writeSlotMetadata = (slot: number, data: Record<string, any>) => {
    localStorage.setItem(`${SAVE_META_KEY_PREFIX}${slot}`, JSON.stringify(createSlotInfo(slot, data)))
  }

  /** 获取槽位摘要。完整存档不再在此处反复解密。 */
  const getSlots = (): SaveSlotInfo[] => {
    const slots: SaveSlotInfo[] = []
    for (let i = 0; i < MAX_SLOTS; i++) {
      const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${i}`)
      if (!raw) {
        localStorage.removeItem(`${SAVE_META_KEY_PREFIX}${i}`)
        slots.push({ slot: i, exists: false })
        continue
      }

      try {
        const metadata = localStorage.getItem(`${SAVE_META_KEY_PREFIX}${i}`)
        if (metadata) {
          slots.push({ ...JSON.parse(metadata), slot: i, exists: true })
        } else {
          slots.push({ slot: i, exists: true })
        }
      } catch {
        slots.push({ slot: i, exists: true })
      }
    }
    return slots
  }

  /** 为新游戏分配一个空闲槽位，无空闲则返回 -1 */
  const assignNewSlot = (): number => {
    const empty = getSlots().find(slot => !slot.exists)
    activeSlot.value = empty?.slot ?? -1
    return activeSlot.value
  }

  const buildSaveData = (): Record<string, unknown> => {
    const gameStore = useGameStore()
    const playerStore = usePlayerStore()
    const inventoryStore = useInventoryStore()
    const farmStore = useFarmStore()
    const skillStore = useSkillStore()
    const npcStore = useNpcStore()
    const miningStore = useMiningStore()
    const cookingStore = useCookingStore()
    const processingStore = useProcessingStore()
    const achievementStore = useAchievementStore()
    const animalStore = useAnimalStore()
    const homeStore = useHomeStore()
    const fishingStore = useFishingStore()
    const walletStore = useWalletStore()
    const questStore = useQuestStore()
    const shopStore = useShopStore()
    const settingsStore = useSettingsStore()
    const warehouseStore = useWarehouseStore()
    const breedingStore = useBreedingStore()
    const museumStore = useMuseumStore()
    const guildStore = useGuildStore()
    const secretNoteStore = useSecretNoteStore()
    const hanhaiStore = useHanhaiStore()
    const fishPondStore = useFishPondStore()
    const tutorialStore = useTutorialStore()
    const hiddenNpcStore = useHiddenNpcStore()

    return {
      game: gameStore.serialize(),
      player: playerStore.serialize(),
      inventory: inventoryStore.serialize(),
      farm: farmStore.serialize(),
      skill: skillStore.serialize(),
      npc: npcStore.serialize(),
      mining: miningStore.serialize(),
      cooking: cookingStore.serialize(),
      processing: processingStore.serialize(),
      achievement: achievementStore.serialize(),
      animal: animalStore.serialize(),
      home: homeStore.serialize(),
      fishing: fishingStore.serialize(),
      wallet: walletStore.serialize(),
      quest: questStore.serialize(),
      shop: shopStore.serialize(),
      settings: settingsStore.serialize(),
      warehouse: warehouseStore.serialize(),
      breeding: breedingStore.serialize(),
      museum: museumStore.serialize(),
      guild: guildStore.serialize(),
      secretNote: secretNoteStore.serialize(),
      hanhai: hanhaiStore.serialize(),
      fishPond: fishPondStore.serialize(),
      tutorial: tutorialStore.serialize(),
      hiddenNpc: hiddenNpcStore.serialize(),
      savedAt: new Date().toISOString()
    }
  }

  /** 保存到指定槽位 */
  const saveToSlot = async (slot: number): Promise<boolean> => {
    if (slot < 0 || slot >= MAX_SLOTS) return false
    return runOperation('saving', async () => {
      const data = buildSaveData()
      const encoded = await encodeSaveData(data)
      localStorage.setItem(`${SAVE_KEY_PREFIX}${slot}`, encoded)
      writeSlotMetadata(slot, data)
      activeSlot.value = slot
      return true
    })
  }

  /** 自动存档到当前活跃槽位 */
  const autoSave = async (): Promise<boolean> => {
    if (activeSlot.value < 0) return false
    return saveToSlot(activeSlot.value)
  }

  /** 从指定槽位加载 */
  const loadFromSlot = async (slot: number): Promise<boolean> => {
    if (slot < 0 || slot >= MAX_SLOTS) return false
    return runOperation('loading', async () => {
      const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`)
      if (!raw) return false
      const normalized = await normalizeSaveData(raw)
      if (!normalized) return false
      const { data, encoded } = normalized

      const gameStore = useGameStore()
      const playerStore = usePlayerStore()
      const inventoryStore = useInventoryStore()
      const farmStore = useFarmStore()
      const skillStore = useSkillStore()
      const npcStore = useNpcStore()
      const miningStore = useMiningStore()
      const cookingStore = useCookingStore()
      const processingStore = useProcessingStore()
      const achievementStore = useAchievementStore()
      const animalStore = useAnimalStore()
      const homeStore = useHomeStore()
      const fishingStore = useFishingStore()
      const walletStore = useWalletStore()
      const questStore = useQuestStore()
      const shopStore = useShopStore()
      const settingsStore = useSettingsStore()
      const warehouseStore = useWarehouseStore()
      const breedingStore = useBreedingStore()
      const museumStore = useMuseumStore()
      const guildStore = useGuildStore()
      const secretNoteStore = useSecretNoteStore()
      const hanhaiStore = useHanhaiStore()
      const fishPondStore = useFishPondStore()
      const tutorialStore = useTutorialStore()
      const hiddenNpcStore = useHiddenNpcStore()

      gameStore.deserialize(data.game)
      playerStore.deserialize(data.player)
      inventoryStore.deserialize(data.inventory)
      farmStore.deserialize(data.farm)
      if (data.skill) skillStore.deserialize(data.skill)
      if (data.npc) npcStore.deserialize(data.npc)
      if (data.mining) miningStore.deserialize(data.mining)
      if (data.cooking) cookingStore.deserialize(data.cooking)
      if (data.processing) processingStore.deserialize(data.processing)
      if (data.achievement) achievementStore.deserialize(data.achievement)
      if (data.animal) animalStore.deserialize(data.animal)
      if (data.home) homeStore.deserialize(data.home)
      if (data.fishing) fishingStore.deserialize(data.fishing)
      if (data.wallet) walletStore.deserialize(data.wallet)
      if (data.quest) questStore.deserialize(data.quest)
      if (data.shop) shopStore.deserialize(data.shop)
      if (data.settings) settingsStore.deserialize(data.settings)
      if (data.warehouse) warehouseStore.deserialize(data.warehouse)
      if (data.breeding) breedingStore.deserialize(data.breeding)
      if (data.museum) museumStore.deserialize(data.museum)
      if (data.guild) guildStore.deserialize(data.guild)
      if (data.secretNote) secretNoteStore.deserialize(data.secretNote)
      if (data.hanhai) hanhaiStore.deserialize(data.hanhai)
      if (data.fishPond) fishPondStore.deserialize(data.fishPond)
      if (data.tutorial) tutorialStore.deserialize(data.tutorial)
      if (data.hiddenNpc) hiddenNpcStore.deserialize(data.hiddenNpc)

      if (encoded !== raw) localStorage.setItem(`${SAVE_KEY_PREFIX}${slot}`, encoded)
      writeSlotMetadata(slot, data)
      activeSlot.value = slot
      return true
    })
  }

  /** 删除指定槽位 */
  const deleteSlot = (slot: number): boolean => {
    if (slot < 0 || slot >= MAX_SLOTS) return false
    localStorage.removeItem(`${SAVE_KEY_PREFIX}${slot}`)
    localStorage.removeItem(`${SAVE_META_KEY_PREFIX}${slot}`)
    if (activeSlot.value === slot) activeSlot.value = -1
    return true
  }

  /** 导出存档为加密文件 */
  const exportSave = (slot: number): boolean => {
    try {
      const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`)
      if (!raw) return false
      const blob = new Blob([raw], { type: 'application/octet-stream' })
      const info = getSlots().find(item => item.slot === slot)
      const hasDate = info?.year !== undefined && info.season !== undefined && info.day !== undefined
      const name =
        info?.exists && hasDate
          ? `桃源乡_存档${slot + 1}_第${info.year}年${SEASON_NAMES[info.season as keyof typeof SEASON_NAMES] ?? info.season}第${info.day}天`
          : `桃源乡_存档${slot + 1}`
      saveAs(blob, `${name}${SAVE_FILE_EXT}`)
      return true
    } catch {
      return false
    }
  }

  /** 从文件导入存档到指定槽位，并自动转换为压缩格式 */
  const importSave = async (slot: number, fileContent: string): Promise<boolean> => {
    if (slot < 0 || slot >= MAX_SLOTS) return false
    return runOperation('importing', async () => {
      const normalized = await normalizeSaveData(fileContent)
      if (!normalized) return false
      localStorage.setItem(`${SAVE_KEY_PREFIX}${slot}`, normalized.encoded)
      writeSlotMetadata(slot, normalized.data)
      return true
    })
  }

  return {
    activeSlot,
    operation,
    operationLabel,
    isBusy,
    getSlots,
    assignNewSlot,
    saveToSlot,
    autoSave,
    loadFromSlot,
    deleteSlot,
    exportSave,
    importSave
  }
})
