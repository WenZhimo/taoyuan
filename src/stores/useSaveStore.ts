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
  canLoadSaveContentEnvironmentInOfficialSafeMode,
  checkSaveRootCompatibility,
  migrateSaveRoot,
  normalizeSaveContentEnvironment,
  summarizeSaveContentEnvironment,
  validateSavePackageMigrationStep,
  type SaveContentEnvironment,
  type SaveContentEnvironmentSummary,
  type SavePackageMigrationStep,
  type SaveRootCompatibilityStatus
} from '@/domain/save/saveContentEnvironment'
import {
  getCurrentSaveContentEnvironment,
  setCurrentSaveContentEnvironment
} from '@/domain/save/saveContentEnvironmentRuntime'
import {
  createEmptyPersistedPluginData,
  normalizePersistedPluginData,
  replacePersistedPluginDataForOwner,
  SavePluginDataError,
  type PluginSaveDataOwner,
  type PersistedPluginDataEnvelope,
  type PersistedPluginData
} from '@/domain/save/savePluginData'
import {
  createEmptyPersistedPackageSettings,
  normalizePersistedPackageSettings,
  SavePackageSettingsError,
  type PersistedPackageSettings
} from '@/domain/save/savePackageSettings'
import { createDiagnostic, type ModDiagnostic } from '@/domain/mods/diagnostics'

export { parseSaveData } from '@/utils/saveCodec'

const SAVE_KEY_PREFIX = 'taoyuanxiang_save_'
const SAVE_META_KEY_PREFIX = 'taoyuanxiang_save_meta_'
const MAX_SLOTS = 3
const SAVE_FILE_EXT = '.tyx'

type SaveOperation = 'saving' | 'loading' | 'importing'
type SaveOperationFailureReason =
  | 'invalid'
  | 'incompatible'
  | 'copy-migration-required'
  | 'package-migration'
  | 'plugin-data-invalid'
  | 'plugin-data-quota'
  | 'plugin-data-migration'
  | 'package-settings-invalid'
  | 'safe-mode-read-only'
  | 'content-environment-drift'
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
  contentEnvironment?: SaveContentEnvironmentSummary
}

export interface SavePackageUsageReport {
  readonly packageId: string
  readonly usedSlots: readonly number[]
  readonly unverifiableSlots: readonly number[]
}

export type SaveSlotLoadPreviewStatus = 'loadable' | 'safe-mode' | 'environment-mismatch' | 'unavailable'

export interface SaveSlotLoadPreview {
  readonly slot: number
  readonly status: SaveSlotLoadPreviewStatus
  readonly currentEnvironment: SaveContentEnvironmentSummary
  readonly savedEnvironment?: SaveContentEnvironmentSummary
}

const yieldToUi = (): Promise<void> =>
  new Promise(resolve => {
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => resolve())
    else setTimeout(resolve, 0)
  })

const readSaveContentEnvironmentSummary = (
  value: unknown
): SaveContentEnvironmentSummary | undefined => {
  try {
    return summarizeSaveContentEnvironment(normalizeSaveContentEnvironment(value))
  } catch {
    return undefined
  }
}

const createSlotInfo = (slot: number, data: Record<string, any>): SaveSlotInfo => {
  const contentEnvironment = readSaveContentEnvironmentSummary(data.contentEnvironment)
  return {
    slot,
    exists: true,
    year: data.game?.year,
    season: data.game?.season,
    day: data.game?.day,
    money: data.player?.money,
    playerName: data.player?.playerName,
    savedAt: data.savedAt,
    ...(contentEnvironment === undefined ? {} : { contentEnvironment })
  }
}

const isRecord = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const requiredSaveArrayFields = [
  ['farm', 'plots'],
  ['npc', 'npcStates']
] as const

const optionalSaveArrayFields = [
  ['game', 'creekCatch'],
  ['inventory', 'items'],
  ['inventory', 'tempItems'],
  ['inventory', 'tools'],
  ['inventory', 'ownedWeapons'],
  ['inventory', 'ownedRings'],
  ['inventory', 'ownedHats'],
  ['inventory', 'ownedShoes'],
  ['inventory', 'equipmentPresets'],
  ['inventory', 'pendingUpgrades'],
  ['farm', 'sprinklers'],
  ['farm', 'fruitTrees'],
  ['farm', 'greenhousePlots'],
  ['farm', 'greenhouseTimers'],
  ['farm', 'wildTrees'],
  ['skill', 'skills'],
  ['npc', 'children'],
  ['processing', 'machines'],
  ['processing', 'collapsedGroups'],
  ['animal', 'buildings'],
  ['animal', 'animals'],
  ['home', 'cellarSlots'],
  ['breeding', 'breedingBox'],
  ['breeding', 'stations'],
  ['hiddenNpc', 'hiddenNpcStates'],
  ['fishPond', 'pendingProducts'],
  ['fishPond', 'discoveredBreeds']
] as const

const saveArrayFieldsWithObjectEntries = [
  ['game', 'creekCatch'],
  ['inventory', 'items'],
  ['inventory', 'tempItems'],
  ['inventory', 'tools'],
  ['inventory', 'ownedWeapons'],
  ['inventory', 'ownedRings'],
  ['inventory', 'ownedHats'],
  ['inventory', 'ownedShoes'],
  ['inventory', 'equipmentPresets'],
  ['inventory', 'pendingUpgrades'],
  ['farm', 'plots'],
  ['farm', 'sprinklers'],
  ['farm', 'fruitTrees'],
  ['farm', 'greenhousePlots'],
  ['farm', 'greenhouseTimers'],
  ['farm', 'wildTrees'],
  ['skill', 'skills'],
  ['npc', 'npcStates'],
  ['npc', 'children'],
  ['animal', 'buildings'],
  ['animal', 'animals'],
  ['home', 'cellarSlots'],
  ['breeding', 'breedingBox'],
  ['breeding', 'stations'],
  ['hiddenNpc', 'hiddenNpcStates'],
  ['fishPond', 'pendingProducts']
] as const

const saveStoreSections = [
  'game',
  'player',
  'inventory',
  'farm',
  'skill',
  'npc',
  'mining',
  'cooking',
  'processing',
  'achievement',
  'animal',
  'home',
  'fishing',
  'wallet',
  'quest',
  'shop',
  'settings',
  'warehouse',
  'breeding',
  'museum',
  'guild',
  'secretNote',
  'hanhai',
  'fishPond',
  'tutorial',
  'hiddenNpc'
] as const

const saveRootShapeDiagnostic = (fieldPath: string, reason: string): ModDiagnostic =>
  createDiagnostic('SAVE-ROOT-001', {
    stage: 'save.root.deserialize',
    fieldPath,
    details: { reason },
    recovery: 'restore-backup'
  })

const validateSaveRootForDeserialization = (data: Record<string, any>): readonly ModDiagnostic[] => {
  const diagnostics: ModDiagnostic[] = []

  for (const section of saveStoreSections) {
    if (data[section] !== undefined && data[section] !== null && !isRecord(data[section])) {
      diagnostics.push(saveRootShapeDiagnostic(section, 'not-object'))
    }
  }

  for (const [section, field] of requiredSaveArrayFields) {
    const sectionValue = data[section]
    if (!isRecord(sectionValue) || !(field in sectionValue)) continue
    if (!Array.isArray(sectionValue[field])) {
      diagnostics.push(saveRootShapeDiagnostic(`${section}.${field}`, 'not-array'))
    }
  }

  for (const [section, field] of optionalSaveArrayFields) {
    const sectionValue = data[section]
    if (!isRecord(sectionValue) || !(field in sectionValue)) continue
    if (!Array.isArray(sectionValue[field])) {
      diagnostics.push(saveRootShapeDiagnostic(`${section}.${field}`, 'not-array'))
    }
  }

  for (const [section, field] of saveArrayFieldsWithObjectEntries) {
    const sectionValue = data[section]
    const values = isRecord(sectionValue) && Array.isArray(sectionValue[field])
      ? sectionValue[field]
      : []
    for (const [index, value] of values.entries()) {
      if (!isRecord(value)) {
        diagnostics.push(saveRootShapeDiagnostic(`${section}.${field}[${index}]`, 'not-object'))
      }
    }
  }

  const processing = data.processing
  if (isRecord(processing) && Array.isArray(processing.machines)) {
    for (const [index, machine] of processing.machines.entries()) {
      if (!isRecord(machine)) {
        diagnostics.push(saveRootShapeDiagnostic(`processing.machines[${index}]`, 'not-object'))
        continue
      }
      for (const field of ['seedMakerJobs', 'wineJobs']) {
        if (field in machine && !Array.isArray(machine[field])) {
          diagnostics.push(saveRootShapeDiagnostic(`processing.machines[${index}].${field}`, 'not-array'))
        }
      }
    }
  }

  const fishPond = data.fishPond
  if (isRecord(fishPond) && isRecord(fishPond.pond)) {
    for (const field of ['fish', 'nurseryBreeding']) {
      if (field in fishPond.pond && !Array.isArray(fishPond.pond[field])) {
        diagnostics.push(saveRootShapeDiagnostic(`fishPond.pond.${field}`, 'not-array'))
      }
    }
  }

  return diagnostics
}

export const useSaveStore = defineStore('save', () => {
  /** 当前活跃存档槽位，-1 表示未分配 */
  const activeSlot = ref(-1)
  const contentEnvironment = ref<SaveContentEnvironment>(getCurrentSaveContentEnvironment())
  const loadedSaveContentEnvironment = ref<SaveContentEnvironment | null>(null)
  const pluginDataState = ref<PersistedPluginData>(createEmptyPersistedPluginData())
  const persistedPluginData = ref<PersistedPluginData>(createEmptyPersistedPluginData())
  const pluginDataOwners = new Map<string, PluginSaveDataOwner>()
  const packageMigrations = new Map<string, SavePackageMigrationStep>()
  const packageSettings = ref<PersistedPackageSettings>(createEmptyPersistedPackageSettings())
  const persistedPackageSettings = ref<PersistedPackageSettings>(createEmptyPersistedPackageSettings())
  const isReadOnlySafeMode = ref(false)
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
    } else if (reason === 'copy-migration-required') {
      message = '该模组存档只能在副本中迁移，原槽位不会被覆盖。请使用导入到其他槽位的方式迁移，并保留原存档备份。'
    } else if (reason === 'package-migration') {
      message = nextOperation === 'importing'
        ? '数据包存档迁移失败，导入已拒绝且目标槽位未写入。请保留原文件并检查数据包迁移声明。'
        : '数据包存档迁移失败，游戏未进入且原存档未修改。请先导出备份并检查数据包迁移声明。'
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
    } else if (reason === 'plugin-data-migration') {
      message = nextOperation === 'importing'
        ? '插件私有数据没有可验证的 Schema 迁移路径，导入已拒绝且目标槽位未写入。请保留原文件并检查对应数据包。'
        : '插件私有数据没有可验证的 Schema 迁移路径，操作已拒绝且原存档未修改。请先导出备份，再检查对应数据包。'
    } else if (reason === 'package-settings-invalid') {
      message = nextOperation === 'importing'
        ? '存档级数据包设置结构无效，导入已拒绝且目标槽位未写入。请保留原文件并检查对应数据包。'
        : '存档级数据包设置结构无效，操作已拒绝且原存档未修改。请先导出备份，再检查对应数据包。'
    } else if (reason === 'safe-mode-read-only') {
      message = '当前存档已在安全模式中以只读方式打开，原存档不会被覆盖。请恢复对应数据包后重新加载，或先导出存档。'
    } else if (reason === 'content-environment-drift') {
      message = '当前运行时内容环境已改变，保存已取消以避免用错误环境覆盖存档。请恢复对应数据包后重新加载，或先导出存档。'
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
        : error.diagnostics.some(diagnostic => diagnostic.code === 'SAVE-PLUGIN-DATA-003')
          ? 'plugin-data-migration'
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
    if (status === 'copy-migratable') return 'copy-migration-required'
    if (diagnostics.some(diagnostic => diagnostic.stage === 'save.root.migration')) return 'package-migration'
    if (status === 'incompatible') return 'incompatible'
    if (diagnostics.some(diagnostic => diagnostic.code === 'SAVE-PLUGIN-DATA-002')) {
      return 'plugin-data-quota'
    }
    if (diagnostics.some(diagnostic => diagnostic.code === 'SAVE-PLUGIN-DATA-003')) {
      return 'plugin-data-migration'
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

  const isImportableCompatibility = (status: SaveRootCompatibilityStatus): boolean =>
    isLoadableCompatibility(status) || status === 'copy-migratable'

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

  const getPluginDataOwners = (): readonly PluginSaveDataOwner[] =>
    Array.from(pluginDataOwners.values())

  const getPackageMigrations = (): readonly SavePackageMigrationStep[] =>
    Array.from(packageMigrations.values())

  const checkCompatibility = (value: unknown) =>
    checkSaveRootCompatibility(value, contentEnvironment.value, {
      pluginDataOwners: getPluginDataOwners(),
      packageMigrations: getPackageMigrations()
    })

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
    const compatibility = checkCompatibility(normalized.data)
    if (!isLoadableCompatibility(compatibility.status)) return null
    try {
      return normalizePersistedPluginData(normalized.data.pluginData, {
        owners: getPluginDataOwners()
      })
    } catch {
      return null
    }
  }

  const readExistingPackageSettings = async (slot: number): Promise<PersistedPackageSettings | null> => {
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`)
    if (!raw) return createEmptyPersistedPackageSettings()
    const normalized = await normalizeSaveData(raw)
    if (!normalized) return null
    const compatibility = checkCompatibility(normalized.data)
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

  const inspectPackageUsage = async (packageId: string): Promise<SavePackageUsageReport> => {
    const usedSlots: number[] = []
    const unverifiableSlots: number[] = []

    for (const slotInfo of getSlots()) {
      if (!slotInfo.exists) continue
      const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotInfo.slot}`)
      if (!raw) {
        unverifiableSlots.push(slotInfo.slot)
        continue
      }

      const normalized = await normalizeSaveData(raw)
      if (!normalized) {
        unverifiableSlots.push(slotInfo.slot)
        continue
      }

      try {
        const migration = migrateSaveRoot(normalized.data, {
          pluginDataOwners: getPluginDataOwners(),
          packageMigrations: getPackageMigrations()
        })
        if (migration.environment.packages.some(pkg => pkg.id === packageId)) {
          usedSlots.push(slotInfo.slot)
        }
      } catch {
        unverifiableSlots.push(slotInfo.slot)
      }
    }

    return Object.freeze({
      packageId,
      usedSlots: Object.freeze(usedSlots),
      unverifiableSlots: Object.freeze(unverifiableSlots)
    })
  }

  const inspectSlot = async (slot: number): Promise<SaveSlotInfo | null> => {
    if (slot < 0 || slot >= MAX_SLOTS) return null
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`)
    if (!raw) return null
    try {
      const normalized = await normalizeSaveData(raw)
      if (!normalized) return null
      const migration = migrateSaveRoot(normalized.data, {
        pluginDataOwners: getPluginDataOwners(),
        packageMigrations: getPackageMigrations()
      })
      return createSlotInfo(slot, migration.data)
    } catch {
      return null
    }
  }

  const previewSlotLoad = async (slot: number): Promise<SaveSlotLoadPreview> => {
    const currentEnvironment = summarizeSaveContentEnvironment(contentEnvironment.value)
    const unavailable = (): SaveSlotLoadPreview => Object.freeze({
      slot,
      status: 'unavailable',
      currentEnvironment
    })

    if (slot < 0 || slot >= MAX_SLOTS || operation.value) return unavailable()
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`)
    if (!raw) return unavailable()

    const normalized = await normalizeSaveData(raw)
    if (!normalized) return unavailable()

    const compatibility = checkCompatibility(normalized.data)
    if (isLoadableCompatibility(compatibility.status)) {
      return Object.freeze({ slot, status: 'loadable', currentEnvironment })
    }

    const savedEnvironment = compatibility.migration === undefined
      ? (() => {
          try {
            return summarizeSaveContentEnvironment(normalizeSaveContentEnvironment(normalized.data.contentEnvironment))
          } catch {
            return undefined
          }
        })()
      : summarizeSaveContentEnvironment(compatibility.migration.environment)

    if (
      compatibility.migration !== undefined
      && canLoadSaveContentEnvironmentInOfficialSafeMode(
        compatibility.migration.environment,
        contentEnvironment.value
      )
    ) {
      return Object.freeze({ slot, status: 'safe-mode', currentEnvironment, savedEnvironment })
    }

    if (compatibility.status === 'incompatible' && savedEnvironment !== undefined) {
      return Object.freeze({ slot, status: 'environment-mismatch', currentEnvironment, savedEnvironment })
    }

    return unavailable()
  }

  /** 为新游戏分配一个空闲槽位，无空闲则返回 -1 */
  const assignNewSlot = (): number => {
    const empty = getSlots().find(slot => !slot.exists)
    activeSlot.value = empty?.slot ?? -1
    if (activeSlot.value >= 0) {
      isReadOnlySafeMode.value = false
      loadedSaveContentEnvironment.value = null
      pluginDataState.value = createEmptyPersistedPluginData()
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
      pluginData: normalizePersistedPluginData(pluginDataState.value, {
        previous: previousPluginData,
        enforceGrowth: true,
        owners: getPluginDataOwners()
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

  const applyLoadedSaveData = (data: Record<string, any>): void => {
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
    pluginDataState.value = data.pluginData
    persistedPluginData.value = data.pluginData
    packageSettings.value = data.packageSettings
    persistedPackageSettings.value = data.packageSettings
    loadedSaveContentEnvironment.value = normalizeSaveContentEnvironment(data.contentEnvironment)
  }

  const createDeserializationFailureDiagnostics = (error: unknown): readonly ModDiagnostic[] => [
    createDiagnostic('SAVE-ROOT-001', {
      stage: 'save.root.deserialize',
      details: {
        reason: 'deserialization-failed',
        message: error instanceof Error ? error.message : String(error)
      },
      recovery: 'restore-backup'
    })
  ]

  const captureCurrentSaveState = (): Record<string, any> =>
    buildSaveData(persistedPluginData.value, persistedPackageSettings.value) as Record<string, any>

  const applyLoadedSaveDataSafely = (
    data: Record<string, any>,
    previousState: Record<string, any>
  ): readonly ModDiagnostic[] => {
    try {
      applyLoadedSaveData(data)
      return []
    } catch (error) {
      try {
        applyLoadedSaveData(previousState)
      } catch {
        // A valid in-memory snapshot should always be restorable; keep the original diagnostic if it is not.
      }
      return createDeserializationFailureDiagnostics(error)
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

  const registerPluginSaveDataOwner = (owner: PluginSaveDataOwner): boolean => {
    if (operation.value) return false
    const existing = pluginDataOwners.get(owner.packageId)
    if (existing && existing !== owner) return false
    const nextOwners = existing
      ? getPluginDataOwners()
      : [...getPluginDataOwners(), owner]
    try {
      const nextPluginData = normalizePersistedPluginData(pluginDataState.value, {
        owners: nextOwners
      })
      pluginDataOwners.set(owner.packageId, owner)
      pluginDataState.value = nextPluginData
      return true
    } catch {
      return false
    }
  }

  const unregisterPluginSaveDataOwner = (packageId: PluginSaveDataOwner['packageId']): boolean => {
    if (operation.value) return false
    return pluginDataOwners.delete(packageId)
  }

  const registerSavePackageMigration = (step: SavePackageMigrationStep): boolean => {
    if (operation.value) return false
    try {
      validateSavePackageMigrationStep(step)
    } catch {
      return false
    }
    const key = `${step.packageId}\u0000${step.fromVersion}`
    const existing = packageMigrations.get(key)
    if (existing && existing !== step) return false
    packageMigrations.set(key, step)
    return true
  }

  const unregisterSavePackageMigration = (
    packageId: SavePackageMigrationStep['packageId'],
    fromVersion: string
  ): boolean => {
    if (operation.value) return false
    return packageMigrations.delete(`${packageId}\u0000${fromVersion}`)
  }

  const readPluginSaveData = (
    owner: PluginSaveDataOwner
  ): PersistedPluginDataEnvelope | undefined => {
    if (pluginDataOwners.get(owner.packageId) !== owner) return undefined
    return pluginDataState.value[owner.packageId]
  }

  const writePluginSaveData = (
    owner: PluginSaveDataOwner,
    payload: unknown
  ): boolean => {
    if (operation.value || pluginDataOwners.get(owner.packageId) !== owner) return false
    try {
      pluginDataState.value = replacePersistedPluginDataForOwner(
        pluginDataState.value,
        owner,
        payload
      )
      return true
    } catch {
      return false
    }
  }

  /** 保存到指定槽位 */
  const saveToSlot = async (slot: number): Promise<boolean> => {
    if (slot < 0 || slot >= MAX_SLOTS) return false
    return runOperation('saving', async () => {
      if (isReadOnlySafeMode.value) return failOperation('saving', 'safe-mode-read-only')
      if (
        activeSlot.value === slot
        && loadedSaveContentEnvironment.value !== null
        && loadedSaveContentEnvironment.value.environmentHash !== getCurrentSaveContentEnvironment().environmentHash
      ) {
        return failOperation('saving', 'content-environment-drift')
      }
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
      const compatibility = checkCompatibility(normalized.data)
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
      data.pluginData = normalizePersistedPluginData(data.pluginData, {
        owners: getPluginDataOwners()
      })
      data.packageSettings = normalizePersistedPackageSettings(data.packageSettings)
      const shapeDiagnostics = validateSaveRootForDeserialization(data)
      if (shapeDiagnostics.length > 0) return failOperation('loading', 'invalid', shapeDiagnostics)
      const previousState = captureCurrentSaveState()
      const deserializationDiagnostics = applyLoadedSaveDataSafely(data, previousState)
      if (deserializationDiagnostics.length > 0) {
        return failOperation('loading', 'invalid', deserializationDiagnostics)
      }
      const encoded = await encodeSaveData(data)

      try {
        persistSlot(slot, encoded, data)
      } catch (error) {
        try {
          applyLoadedSaveData(previousState)
        } catch {
          throw new Error('save state rollback failed')
        }
        throw error
      }

      activeSlot.value = slot
      loadedSaveContentEnvironment.value = normalizeSaveContentEnvironment(data.contentEnvironment)
      isReadOnlySafeMode.value = false
      return true
    })
  }

  const canLoadSlotInSafeMode = async (slot: number): Promise<boolean> => {
    if (slot < 0 || slot >= MAX_SLOTS || operation.value) return false
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`)
    if (!raw) return false
    const normalized = await normalizeSaveData(raw)
    if (!normalized) return false
    const compatibility = checkCompatibility(normalized.data)
    return compatibility.migration !== undefined
      && canLoadSaveContentEnvironmentInOfficialSafeMode(
        compatibility.migration.environment,
        contentEnvironment.value
      )
  }

  const loadFromSlotInSafeMode = async (slot: number): Promise<boolean> => {
    if (slot < 0 || slot >= MAX_SLOTS) return false
    return runOperation('loading', async () => {
      const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`)
      if (!raw) return failOperation('loading', 'invalid')
      const normalized = await normalizeSaveData(raw)
      if (!normalized) return failOperation('loading', 'invalid')
      const compatibility = checkCompatibility(normalized.data)
      const migration = compatibility.migration
      if (
        migration === undefined
        || !canLoadSaveContentEnvironmentInOfficialSafeMode(
          migration.environment,
          contentEnvironment.value
        )
      ) {
        return failOperation('loading', 'incompatible', compatibility.diagnostics)
      }

      const data = migration.data
      data.pluginData = normalizePersistedPluginData(data.pluginData, {
        owners: getPluginDataOwners()
      })
      data.packageSettings = normalizePersistedPackageSettings(data.packageSettings)
      const shapeDiagnostics = validateSaveRootForDeserialization(data)
      if (shapeDiagnostics.length > 0) return failOperation('loading', 'invalid', shapeDiagnostics)
      const previousState = captureCurrentSaveState()
      const deserializationDiagnostics = applyLoadedSaveDataSafely(data, previousState)
      if (deserializationDiagnostics.length > 0) {
        return failOperation('loading', 'invalid', deserializationDiagnostics)
      }
      activeSlot.value = slot
      isReadOnlySafeMode.value = true
      return true
    })
  }

  /** 删除指定槽位 */
  const deleteSlot = (slot: number): boolean => {
    if (slot < 0 || slot >= MAX_SLOTS) return false
    localStorage.removeItem(`${SAVE_KEY_PREFIX}${slot}`)
    localStorage.removeItem(`${SAVE_META_KEY_PREFIX}${slot}`)
    if (activeSlot.value === slot) {
      activeSlot.value = -1
      loadedSaveContentEnvironment.value = null
      isReadOnlySafeMode.value = false
    }
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
      const compatibility = checkCompatibility(normalized.data)
      if (!isImportableCompatibility(compatibility.status) || !compatibility.migration) {
        return failOperation(
          'importing',
          classifyCompatibilityFailure(compatibility.status, compatibility.diagnostics),
          compatibility.diagnostics
        )
      }
      const data = compatibility.migration.data
      data.pluginData = normalizePersistedPluginData(data.pluginData, {
        owners: getPluginDataOwners()
      })
      data.packageSettings = normalizePersistedPackageSettings(data.packageSettings)
      const shapeDiagnostics = validateSaveRootForDeserialization(data)
      if (shapeDiagnostics.length > 0) return failOperation('importing', 'invalid', shapeDiagnostics)
      const encoded = await encodeSaveData(data)
      persistSlot(slot, encoded, data)
      return true
    })
  }

  return {
    activeSlot,
    contentEnvironment,
    inspectPackageUsage,
    registerPluginSaveDataOwner,
    unregisterPluginSaveDataOwner,
    registerSavePackageMigration,
    unregisterSavePackageMigration,
    readPluginSaveData,
    writePluginSaveData,
    packageSettings,
    isReadOnlySafeMode,
    operation,
    operationLabel,
    lastOperationFailure,
    isBusy,
    getSlots,
    inspectSlot,
    previewSlotLoad,
    assignNewSlot,
    saveToSlot,
    autoSave,
    loadFromSlot,
    canLoadSlotInSafeMode,
    loadFromSlotInSafeMode,
    deleteSlot,
    exportSave,
    importSave,
    setContentEnvironment
  }
})
