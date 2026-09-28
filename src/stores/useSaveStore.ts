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
import {
  CURRENT_SAVE_FORMAT_VERSION,
  checkSaveRootCompatibility,
  normalizeSaveContentEnvironment,
  type SaveContentEnvironment,
  type SaveRootCompatibilityStatus
} from '@/domain/save/saveContentEnvironment'
import {
  getCurrentSaveContentEnvironment,
  setCurrentSaveContentEnvironment
} from '@/domain/save/saveContentEnvironmentRuntime'
import {
  createEmptyPersistedPluginData,
  normalizePersistedPluginData,
  SavePluginDataError,
  type PersistedPluginData
} from '@/domain/save/savePluginData'
import {
  createEmptyPersistedPackageSettings,
  normalizePersistedPackageSettings,
  SavePackageSettingsError,
  type PersistedPackageSettings
} from '@/domain/save/savePackageSettings'
import type { ModDiagnostic } from '@/domain/mods/diagnostics'

export { parseSaveData } from '@/utils/saveCodec'

const SAVE_KEY_PREFIX = 'taoyuanxiang_save_'
const SAVE_META_KEY_PREFIX = 'taoyuanxiang_save_meta_'
const MAX_SLOTS = 3
const SAVE_FILE_EXT = '.tyx'

type SaveOperation = 'saving' | 'loading' | 'importing'
type SaveOperationFailureReason =
  | 'invalid'
  | 'incompatible'
  | 'plugin-data-invalid'
  | 'plugin-data-quota'
  | 'package-settings-invalid'
  | 'slot-protected'
  | 'storage'

export interface SaveOperationFailure {
  readonly operation: SaveOperation
  readonly reason: SaveOperationFailureReason
  readonly diagnostics: readonly ModDiagnostic[]
  readonly message: string
}

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
  const contentEnvironment = ref<SaveContentEnvironment>(getCurrentSaveContentEnvironment())
  const pluginData = ref<PersistedPluginData>(createEmptyPersistedPluginData())
  const persistedPluginData = ref<PersistedPluginData>(createEmptyPersistedPluginData())
  const packageSettings = ref<PersistedPackageSettings>(createEmptyPersistedPackageSettings())
  const persistedPackageSettings = ref<PersistedPackageSettings>(createEmptyPersistedPackageSettings())
  const operation = ref<SaveOperation | null>(null)
  const lastOperationFailure = ref<SaveOperationFailure | null>(null)
  const isBusy = computed(() => operation.value !== null)
  const operationLabel = computed(() => {
    if (operation.value === 'saving') return '正在压缩并保存存档...'
    if (operation.value === 'loading') return '正在读取并解压存档...'
    if (operation.value === 'importing') return '正在导入并转换存档...'
    return ''
  })

  const createOperationFailure = (
    nextOperation: SaveOperation,
    reason: SaveOperationFailureReason,
    diagnostics: readonly ModDiagnostic[] = []
  ): SaveOperationFailure => {
    let message: string
    if (reason === 'incompatible') {
      message = nextOperation === 'importing'
        ? '导入存档的内容环境与当前环境不匹配，目标槽位未写入。请切换到匹配的数据包状态后重试；原文件仍可保留备份。'
        : '存档内容环境与当前环境不匹配，游戏未进入且原存档未修改。请切换到匹配的数据包状态后重试，或先导出备份。'
    } else if (reason === 'plugin-data-quota') {
      message = nextOperation === 'saving'
        ? '插件私有数据超过保存配额，本次保存已拒绝，旧存档未覆盖。请先导出备份并检查对应数据包。'
        : nextOperation === 'importing'
          ? '插件私有数据超过导入配额，目标槽位未写入。请保留原文件并联系对应数据包维护者。'
          : '插件私有数据超过加载配额，游戏未进入且原存档未修改。请保留原文件并联系对应数据包维护者。'
    } else if (reason === 'plugin-data-invalid') {
      message = nextOperation === 'importing'
        ? '插件私有数据完整性校验失败，导入已拒绝且目标槽位未写入。请保留原文件并检查对应数据包。'
        : '插件私有数据完整性校验失败，操作已拒绝且原存档未修改。请先导出备份，再检查对应数据包。'
    } else if (reason === 'package-settings-invalid') {
      message = nextOperation === 'importing'
        ? '存档级数据包设置结构无效，导入已拒绝且目标槽位未写入。请保留原文件并检查对应数据包。'
        : '存档级数据包设置结构无效，操作已拒绝且原存档未修改。请先导出备份，再检查对应数据包。'
    } else if (reason === 'slot-protected') {
      message = '目标槽位无法安全验证，保存已取消以避免覆盖原档。请先导出该槽位备份，或改用空槽。'
    } else if (reason === 'invalid') {
      message = nextOperation === 'importing'
        ? '存档文件无法读取或不符合当前格式，目标槽位未写入。请保留原文件并检查文件完整性。'
        : '存档无法读取或校验失败，游戏未进入且原存档未修改。请先从槽位菜单导出备份。'
    } else {
      message = '存档操作未能完成，写入状态未确认。请保留现有备份，检查存储空间后再试。'
    }

    return { operation: nextOperation, reason, diagnostics, message }
  }

  const failOperation = (
    nextOperation: SaveOperation,
    reason: SaveOperationFailureReason,
    diagnostics: readonly ModDiagnostic[] = []
  ): false => {
    lastOperationFailure.value = createOperationFailure(nextOperation, reason, diagnostics)
    return false
  }

  const classifyThrownFailure = (nextOperation: SaveOperation, error: unknown): false => {
    if (error instanceof SavePluginDataError) {
      const reason = error.diagnostics.some(diagnostic => diagnostic.code === 'SAVE-PLUGIN-DATA-002')
        ? 'plugin-data-quota'
        : 'plugin-data-invalid'
      return failOperation(nextOperation, reason, error.diagnostics)
    }
    if (error instanceof SavePackageSettingsError) {
      return failOperation(nextOperation, 'package-settings-invalid', error.diagnostics)
    }
    return failOperation(nextOperation, 'storage')
  }

  const classifyCompatibilityFailure = (
    status: SaveRootCompatibilityStatus,
    diagnostics: readonly ModDiagnostic[]
  ): SaveOperationFailureReason => {
    if (status === 'incompatible') return 'incompatible'
    if (diagnostics.some(diagnostic => diagnostic.code === 'SAVE-PLUGIN-DATA-002')) {
      return 'plugin-data-quota'
    }
    if (diagnostics.some(diagnostic => diagnostic.code === 'SAVE-PLUGIN-DATA-001')) {
      return 'plugin-data-invalid'
    }
    if (diagnostics.some(diagnostic => diagnostic.code === 'SAVE-PACKAGE-SETTINGS-001')) {
      return 'package-settings-invalid'
    }
    return 'invalid'
  }

  const isLoadableCompatibility = (status: SaveRootCompatibilityStatus): boolean =>
    status === 'compatible' || status === 'migratable'

  const runOperation = async (
    nextOperation: SaveOperation,
    task: () => Promise<boolean>
  ): Promise<boolean> => {
    if (operation.value) return false
    operation.value = nextOperation
    lastOperationFailure.value = null
    await yieldToUi()
    try {
      return await task()
    } catch (error) {
      return classifyThrownFailure(nextOperation, error)
    } finally {
      operation.value = null
    }
  }

  const restoreStoredValue = (key: string, value: string | null) => {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  }

  const persistSlot = (slot: number, encoded: string, data: Record<string, any>) => {
    const saveKey = `${SAVE_KEY_PREFIX}${slot}`
    const metadataKey = `${SAVE_META_KEY_PREFIX}${slot}`
    const previousSave = localStorage.getItem(saveKey)
    const previousMetadata = localStorage.getItem(metadataKey)
    const metadata = JSON.stringify(createSlotInfo(slot, data))

    try {
      localStorage.setItem(saveKey, encoded)
      localStorage.setItem(metadataKey, metadata)
    } catch (error) {
      let rollbackFailed = false
      try {
        restoreStoredValue(saveKey, previousSave)
      } catch {
        rollbackFailed = true
      }
      try {
        restoreStoredValue(metadataKey, previousMetadata)
      } catch {
        rollbackFailed = true
      }

      if (
        rollbackFailed ||
        localStorage.getItem(saveKey) !== previousSave ||
        localStorage.getItem(metadataKey) !== previousMetadata
      ) {
        throw new Error('save slot rollback failed')
      }
      throw error
    }
  }

  const readExistingPluginData = async (slot: number): Promise<PersistedPluginData | null> => {
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`)
    if (!raw) return createEmptyPersistedPluginData()
    const normalized = await normalizeSaveData(raw)
    if (!normalized) return null
    const compatibility = checkSaveRootCompatibility(normalized.data, contentEnvironment.value)
    if (!isLoadableCompatibility(compatibility.status)) return null
    try {
      return normalizePersistedPluginData(normalized.data.pluginData)
    } catch {
      return null
    }
  }

  const readExistingPackageSettings = async (slot: number): Promise<PersistedPackageSettings | null> => {
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`)
    if (!raw) return createEmptyPersistedPackageSettings()
    const normalized = await normalizeSaveData(raw)
    if (!normalized) return null
    const compatibility = checkSaveRootCompatibility(normalized.data, contentEnvironment.value)
    if (!isLoadableCompatibility(compatibility.status)) return null
    try {
      return normalizePersistedPackageSettings(normalized.data.packageSettings)
    } catch {
      return null
    }
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
    if (activeSlot.value >= 0) {
      pluginData.value = createEmptyPersistedPluginData()
      persistedPluginData.value = createEmptyPersistedPluginData()
      packageSettings.value = createEmptyPersistedPackageSettings()
      persistedPackageSettings.value = createEmptyPersistedPackageSettings()
    }
    return activeSlot.value
  }

  const buildSaveData = (
    previousPluginData: PersistedPluginData = createEmptyPersistedPluginData(),
    previousPackageSettings: PersistedPackageSettings = createEmptyPersistedPackageSettings()
  ): Record<string, unknown> => {
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
      saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
      contentEnvironment: contentEnvironment.value,
      pluginData: normalizePersistedPluginData(pluginData.value, {
        previous: previousPluginData,
        enforceGrowth: true
      }),
      packageSettings: normalizePersistedPackageSettings({
        ...previousPackageSettings,
        ...packageSettings.value
      }),
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

  const setContentEnvironment = (value: unknown): boolean => {
    try {
      contentEnvironment.value = normalizeSaveContentEnvironment(value)
      setCurrentSaveContentEnvironment(contentEnvironment.value)
      return true
    } catch {
      return false
    }
  }

  /** 保存到指定槽位 */
  const saveToSlot = async (slot: number): Promise<boolean> => {
    if (slot < 0 || slot >= MAX_SLOTS) return false
    return runOperation('saving', async () => {
      const previousPluginData = await readExistingPluginData(slot)
      const previousPackageSettings = await readExistingPackageSettings(slot)
      if (!previousPluginData || !previousPackageSettings) return failOperation('saving', 'slot-protected')
      const data = buildSaveData(persistedPluginData.value, previousPackageSettings)
      const encoded = await encodeSaveData(data)
      persistSlot(slot, encoded, data)
      activeSlot.value = slot
      persistedPluginData.value = data.pluginData as PersistedPluginData
      persistedPackageSettings.value = data.packageSettings as PersistedPackageSettings
      packageSettings.value = data.packageSettings as PersistedPackageSettings
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
      if (!raw) return failOperation('loading', 'invalid')
      const normalized = await normalizeSaveData(raw)
      if (!normalized) return failOperation('loading', 'invalid')
      const compatibility = checkSaveRootCompatibility(normalized.data, contentEnvironment.value)
      if (!isLoadableCompatibility(compatibility.status) || !compatibility.migration) {
        return failOperation(
          'loading',
          classifyCompatibilityFailure(compatibility.status, compatibility.diagnostics),
          compatibility.diagnostics
        )
      }
      const data = compatibility.migration.data
      const previousPluginData = await readExistingPluginData(slot)
      if (!previousPluginData) return failOperation('loading', 'invalid')
      data.pluginData = normalizePersistedPluginData(data.pluginData)
      data.packageSettings = normalizePersistedPackageSettings(data.packageSettings)
      const encoded = await encodeSaveData(data)

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

      persistSlot(slot, encoded, data)

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
      pluginData.value = data.pluginData
      persistedPluginData.value = data.pluginData
      packageSettings.value = data.packageSettings
      persistedPackageSettings.value = data.packageSettings

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
      if (!normalized) return failOperation('importing', 'invalid')
      const compatibility = checkSaveRootCompatibility(normalized.data, contentEnvironment.value)
      if (!isLoadableCompatibility(compatibility.status) || !compatibility.migration) {
        return failOperation(
          'importing',
          classifyCompatibilityFailure(compatibility.status, compatibility.diagnostics),
          compatibility.diagnostics
        )
      }
      const data = compatibility.migration.data
      data.packageSettings = normalizePersistedPackageSettings(data.packageSettings)
      const encoded = await encodeSaveData(data)
      persistSlot(slot, encoded, data)
      return true
    })
  }

  return {
    activeSlot,
    contentEnvironment,
    pluginData,
    packageSettings,
    operation,
    operationLabel,
    lastOperationFailure,
    isBusy,
    getSlots,
    assignNewSlot,
    saveToSlot,
    autoSave,
    loadFromSlot,
    deleteSlot,
    exportSave,
    importSave,
    setContentEnvironment
  }
})
