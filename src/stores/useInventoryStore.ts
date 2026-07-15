import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { InventoryItem, Quality, Tool, ToolType, ToolTier, OwnedWeapon, OwnedRing, RingEffectType, OwnedHat, OwnedShoe } from '@/types'
import type { EquipmentPresetState } from '@/domain/inventory/equipmentPresets'

/** 装备方案 */
export type EquipmentPreset = EquipmentPresetState
import { showFloat } from '@/composables/useGameLog'
import { getItemById } from '@/data/items'
import {
  getWeaponById,
  getEnchantmentById,
  getWeaponSellPrice,
  normalizeEnchantmentIds,
  getWeaponEnchantmentIds,
  getOwnedWeaponEnchantments,
  getEnchantmentEffects,
  rollWeightedEnchantment,
  getEnchantmentCost,
  getCustomEnchantmentCost
} from '@/data/weapons'
import { getRingById } from '@/data/rings'
import { getHatById } from '@/data/hats'
import { getShoeById } from '@/data/shoes'
import { getEquipmentSets } from '@/data/equipmentSets'
import {
  addItemToStacks,
  calculateAddableItemQuantity,
  compactItemStacks,
  countCarriedItemQuantity,
  countItemQuantity,
  moveTempItemToStacks,
  removeItemFromStacks
} from '@/domain/inventory/itemStacks'
import { getOfficialSeparateStackTagIds } from '@/domain/mods/contentAccess'
import {
  applyEquipmentEnchantments,
  createCustomizeEnchantmentsResult,
  createDisenchantResult,
  createRandomEnchantmentResult,
  filterEquipmentEffectEnchantmentIds,
  type EnchantmentOperationResult
} from '@/domain/inventory/equipmentEnchantments'
import {
  advanceToolUpgradesOneDay,
  startToolUpgrade,
  upgradeToolTier,
  type CompletedToolUpgrade,
  type PendingToolUpgrade
} from '@/domain/inventory/toolUpgrades'
import {
  createEquipmentSaleMessage,
  getEquipmentSellPrice,
  planRingSale,
  planSingleSlotEquipmentSale,
  planWeaponSale
} from '@/domain/inventory/equipmentSales'
import {
  clampLoadedEquippedIndex,
  migrateSavedActivePresetId,
  migrateSavedCapacity,
  migrateSavedEquipmentPresets,
  migratePendingToolUpgrades,
  migrateSavedHats,
  migrateSavedInventoryItems,
  migrateSavedRings,
  migrateSavedShoes,
  migrateSavedTools,
  migrateSavedWeapons,
  type SerializedInventoryMigrationState
} from '@/domain/inventory/saveMigrations'
import {
  sortEquipmentBySellPrice,
  sortRingsBySellPrice,
  sortWeaponsForInventory
} from '@/domain/inventory/equipmentSorting'
import {
  createActiveEquipmentSetSummaries,
  getActiveEquipmentSetBonuses,
  sumEquipmentBonus,
  type EquipmentBonusSource,
  type EquippedSetPieces
} from '@/domain/inventory/equipmentBonuses'
import {
  expandExtraInventoryCapacity,
  expandStandardInventoryCapacity,
  INITIAL_INVENTORY_CAPACITY,
  MAX_STANDARD_INVENTORY_CAPACITY
} from '@/domain/inventory/capacity'
import { createEquipmentCraftingPlan } from '@/domain/inventory/equipmentCrafting'
import {
  createEquipmentPresetApplicationMessage,
  createEquipmentPresetState,
  deleteEquipmentPresetState,
  planEquipmentPresetApplication,
  renameEquipmentPresetState,
  saveCurrentEquipmentToPresetState
} from '@/domain/inventory/equipmentPresets'
import { usePlayerStore } from './usePlayerStore'
import { useAchievementStore } from './useAchievementStore'

const INITIAL_CAPACITY = INITIAL_INVENTORY_CAPACITY
const MAX_CAPACITY = MAX_STANDARD_INVENTORY_CAPACITY
export const MAX_STACK = 999_999_999
export const TEMP_CAPACITY = 10
export type EnchantableEquipmentType = 'weapon' | 'ring' | 'hat' | 'shoe'
type EnchantableEquipment = OwnedWeapon | OwnedRing | OwnedHat | OwnedShoe
type EnchantResult = EnchantmentOperationResult

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>([])
  const capacity = ref(INITIAL_CAPACITY)
  const tools = ref<Tool[]>([
    { type: 'wateringCan', tier: 'basic' },
    { type: 'hoe', tier: 'basic' },
    { type: 'pickaxe', tier: 'basic' },
    { type: 'fishingRod', tier: 'basic' },
    { type: 'scythe', tier: 'basic' },
    { type: 'axe', tier: 'basic' },
    { type: 'pan', tier: 'basic' }
  ])

  /** 拥有的武器列表 */
  const ownedWeapons = ref<OwnedWeapon[]>([{ defId: 'wooden_stick', enchantmentId: null, enchantmentIds: [] }])
  /** 当前装备的武器索引 */
  const equippedWeaponIndex = ref(0)

  /** 拥有的戒指列表 */
  const ownedRings = ref<OwnedRing[]>([])
  /** 装备的戒指索引（2个槽位，-1 = 空） */
  const equippedRingSlot1 = ref(-1)
  const equippedRingSlot2 = ref(-1)

  /** 拥有的帽子列表 */
  const ownedHats = ref<OwnedHat[]>([])
  /** 当前装备的帽子索引（-1 = 空） */
  const equippedHatIndex = ref(-1)

  /** 拥有的鞋子列表 */
  const ownedShoes = ref<OwnedShoe[]>([])
  /** 当前装备的鞋子索引（-1 = 空） */
  const equippedShoeIndex = ref(-1)

  /** 装备方案列表 */
  const equipmentPresets = ref<EquipmentPreset[]>([])
  /** 当前使用的方案ID */
  const activePresetId = ref<string | null>(null)

  /** 正在升级中的工具（2天等待期） */
  const pendingUpgrades = ref<PendingToolUpgrade[]>([])
  const pendingUpgrade = computed(() => pendingUpgrades.value[0] ?? null)

  const isFull = computed(() => items.value.length >= capacity.value)

  /** 临时背包（溢出缓冲区） */
  const tempItems = ref<InventoryItem[]>([])
  const isTempFull = computed(() => tempItems.value.length >= TEMP_CAPACITY)
  /** 主背包+临时背包均满 */
  const isAllFull = computed(() => isFull.value && isTempFull.value)

  /** 获取当前装备的武器 */
  const getEquippedWeapon = (): OwnedWeapon => {
    return ownedWeapons.value[equippedWeaponIndex.value] ?? { defId: 'wooden_stick', enchantmentId: null, enchantmentIds: [] }
  }

  /** 获取武器攻击力（含附魔加成） */
  const getWeaponAttack = (): number => {
    const owned = getEquippedWeapon()
    const def = getWeaponById(owned.defId)
    if (!def) return 5
    let attack = def.attack
    for (const enchant of getOwnedWeaponEnchantments(owned)) {
      attack += enchant.attackBonus
    }
    return attack
  }

  /** 获取武器暴击率（含附魔加成） */
  const getWeaponCritRate = (): number => {
    const owned = getEquippedWeapon()
    const def = getWeaponById(owned.defId)
    if (!def) return 0.02
    let critRate = def.critRate
    for (const enchant of getOwnedWeaponEnchantments(owned)) {
      critRate += enchant.critBonus
    }
    return critRate
  }

  /** 添加武器到收藏 */
  const addWeapon = (defId: string, enchantment: string | string[] | null = null): boolean => {
    const enchantmentIds = normalizeEnchantmentIds(enchantment)
    ownedWeapons.value.push({ defId, enchantmentId: enchantmentIds[0] ?? null, enchantmentIds })
    useAchievementStore().discoverItem(defId)
    return true
  }

  /** 检查是否已拥有某武器（不含附魔区分） */
  const hasWeapon = (defId: string): boolean => {
    return ownedWeapons.value.some(w => w.defId === defId)
  }

  /** 检查是否已拥有完全相同的武器（同defId + 同附魔） */
  const hasWeaponExact = (defId: string, enchantment: string | string[] | null): boolean => {
    const target = normalizeEnchantmentIds(enchantment).join('|')
    return ownedWeapons.value.some(w => w.defId === defId && getWeaponEnchantmentIds(w).join('|') === target)
  }

  /** 装备武器（按索引） */
  const equipWeapon = (index: number): boolean => {
    if (index < 0 || index >= ownedWeapons.value.length) return false
    equippedWeaponIndex.value = index
    return true
  }

  const getEquipmentInstance = (type: EnchantableEquipmentType, index: number): EnchantableEquipment | null => {
    const collections = {
      weapon: ownedWeapons.value,
      ring: ownedRings.value,
      hat: ownedHats.value,
      shoe: ownedShoes.value
    } satisfies Record<EnchantableEquipmentType, EnchantableEquipment[]>
    return collections[type][index] ?? null
  }

  const getEquipmentTypeName = (type: EnchantableEquipmentType): string => {
    return { weapon: '武器', ring: '戒指', hat: '帽子', shoe: '鞋子' }[type]
  }

  const getEquipmentBaseSellPrice = (type: EnchantableEquipmentType, equipment: EnchantableEquipment): number => {
    return getEquipmentSellPrice(type, equipment, {
      getWeaponSellPrice: item => getWeaponSellPrice(item.defId, (item as OwnedWeapon).enchantmentIds ?? (item as OwnedWeapon).enchantmentId),
      getRingSellPrice: defId => getRingById(defId)?.sellPrice ?? 0,
      getHatSellPrice: defId => getHatById(defId)?.sellPrice ?? 0,
      getShoeSellPrice: defId => getShoeById(defId)?.sellPrice ?? 0
    })
  }

  const setEquipmentEnchantments = (type: EnchantableEquipmentType, index: number, enchantmentIds: string[]): boolean => {
    const equipment = getEquipmentInstance(type, index)
    if (!equipment) return false
    const normalized = normalizeEnchantmentIds(enchantmentIds)
    Object.assign(equipment, applyEquipmentEnchantments(equipment, normalized))
    return true
  }

  const randomlyEnchantEquipment = (type: EnchantableEquipmentType, index: number): EnchantResult => {
    const equipment = getEquipmentInstance(type, index)
    const typeName = getEquipmentTypeName(type)
    if (!equipment) return createRandomEnchantmentResult(typeName, { id: '', cost: 0 }, 0, false)
    const enchantmentId = rollWeightedEnchantment()
    const cost = getEnchantmentCost(enchantmentId)
    const enchant = getEnchantmentById(enchantmentId)
    const playerStore = usePlayerStore()
    const result = createRandomEnchantmentResult(typeName, { id: enchantmentId, name: enchant?.name, cost }, playerStore.money)
    if (!result.success) return result
    playerStore.spendMoney(cost)
    setEquipmentEnchantments(type, index, [enchantmentId])
    return result
  }

  const disenchantEquipment = (type: EnchantableEquipmentType, index: number): EnchantResult => {
    const equipment = getEquipmentInstance(type, index)
    const typeName = getEquipmentTypeName(type)
    if (!equipment) return createDisenchantResult(typeName, [], 0, [], 0, false)
    const enchantmentIds = getWeaponEnchantmentIds(equipment)
    const price = getEquipmentBaseSellPrice(type, equipment)
    const enchantmentCosts = enchantmentIds.map(id => getEnchantmentCost(id))
    const playerStore = usePlayerStore()
    const result = createDisenchantResult(typeName, enchantmentIds, price, enchantmentCosts, playerStore.money)
    if (!result.success) return result
    playerStore.spendMoney(result.cost ?? 0)
    setEquipmentEnchantments(type, index, [])
    return result
  }

  const customizeEquipmentEnchantments = (type: EnchantableEquipmentType, index: number, enchantmentIds: string[]): EnchantResult => {
    const equipment = getEquipmentInstance(type, index)
    const typeName = getEquipmentTypeName(type)
    if (!equipment) return createCustomizeEnchantmentsResult(typeName, [], 0, 0, false)
    const normalized = normalizeEnchantmentIds(enchantmentIds)
    const cost = getCustomEnchantmentCost(normalized)
    const playerStore = usePlayerStore()
    const result = createCustomizeEnchantmentsResult(typeName, normalized, cost, playerStore.money)
    if (!result.success) return result
    playerStore.spendMoney(cost)
    setEquipmentEnchantments(type, index, normalized)
    return result
  }

  const getEquipmentEnchantmentEffects = (type: EnchantableEquipmentType, equipment: EnchantableEquipment) => {
    const ids = getWeaponEnchantmentIds(equipment)
    return getEnchantmentEffects(filterEquipmentEffectEnchantmentIds(type, ids))
  }

  const setWeaponEnchantments = (index: number, enchantmentIds: string[]): boolean => {
    return setEquipmentEnchantments('weapon', index, enchantmentIds)
  }

  const randomlyEnchantWeapon = (index: number): EnchantResult => randomlyEnchantEquipment('weapon', index)

  const disenchantWeapon = (index: number): EnchantResult => disenchantEquipment('weapon', index)

  const customizeWeaponEnchantments = (index: number, enchantmentIds: string[]): EnchantResult =>
    customizeEquipmentEnchantments('weapon', index, enchantmentIds)

  /** 卖出武器（不能卖装备中的武器，不能卖唯一武器） */
  const sellWeapon = (index: number): { success: boolean; message: string } => {
    const sale = planWeaponSale(ownedWeapons.value, index, equippedWeaponIndex.value)
    if (!sale.success || !sale.sold) return { success: false, message: sale.message ?? '无效索引。' }
    const weapon = sale.sold
    const price = getEquipmentBaseSellPrice('weapon', weapon)
    const playerStore = usePlayerStore()
    playerStore.earnMoney(price)
    ownedWeapons.value = sale.equipment
    equippedWeaponIndex.value = sale.equippedIndex
    const def = getWeaponById(weapon.defId)
    return { success: true, message: createEquipmentSaleMessage(def?.name ?? '', '武器', price) }
  }

  /** 添加物品到背包 */
  const addItem = (
    itemId: string,
    quantity: number = 1,
    quality: Quality = 'normal',
    compositionTags?: readonly string[]
  ): boolean => {
    // 校验物品是否存在
    if (!getItemById(itemId)) return false
    // 自动注册到图鉴
    useAchievementStore().discoverItem(itemId)
    const result = addItemToStacks({
      items: items.value,
      tempItems: tempItems.value,
      itemId,
      quantity,
      quality,
      compositionTags,
      separateTagIds: getOfficialSeparateStackTagIds(),
      mainCapacity: capacity.value,
      tempCapacity: TEMP_CAPACITY,
      maxStack: MAX_STACK
    })
    items.value = result.items
    tempItems.value = result.tempItems
    const { remaining } = result

    if (remaining > 0) {
      const name = getItemById(itemId)?.name ?? itemId
      showFloat(`背包已满！${name}×${remaining}丢失了`, 'danger')
    } else {
      // 背包快满预警：剩余格数 ≤ 3 时提示一次
      const freeSlots = capacity.value - items.value.length
      if (freeSlots <= 3) {
        showFloat(`背包快满了！剩余${freeSlots}格`, 'accent')
      }
    }

    return remaining <= 0
  }

  /** 移除物品（支持跨栈删除）。quality 不传时优先消耗低品质 */
  const removeItem = (itemId: string, quantity: number = 1, quality?: Quality): boolean => {
    const result = removeItemFromStacks({ items: items.value, itemId, quantity, quality })
    if (!result.success) return false
    items.value = result.items
    return true
  }

  const takeItemStacks = (itemId: string, quantity: number = 1, quality?: Quality): InventoryItem[] => {
    const result = removeItemFromStacks({ items: items.value, itemId, quantity, quality, trackRemoved: true })
    if (!result.success) return []
    items.value = result.items
    return result.removed ?? []
  }

  /** 查询物品数量 */
  const getItemCount = (itemId: string, quality?: Quality): number => {
    return countItemQuantity(items.value, itemId, quality)
  }

  /** 查询随身物品数量（主背包 + 临时背包） */
  const getCarriedItemCount = (itemId: string, quality?: Quality): number => {
    return countCarriedItemQuantity(items.value, tempItems.value, itemId, quality)
  }

  /** 检查是否拥有足够数量 */
  const hasItem = (itemId: string, quantity: number = 1): boolean => {
    return getItemCount(itemId) >= quantity
  }

  /** 检查随身是否携带足够数量（主背包 + 临时背包） */
  const hasCarriedItem = (itemId: string, quantity: number = 1): boolean => {
    return getCarriedItemCount(itemId) >= quantity
  }

  /** 查询当前还能放入多少同类物品（主背包 + 临时背包） */
  const getAddableItemQuantity = (
    itemId: string,
    quality: Quality = 'normal',
    compositionTags?: readonly string[]
  ): number => {
    if (!getItemById(itemId)) return 0
    return calculateAddableItemQuantity({
      items: items.value,
      tempItems: tempItems.value,
      itemId,
      quality,
      compositionTags,
      separateTagIds: getOfficialSeparateStackTagIds(),
      mainCapacity: capacity.value,
      tempCapacity: TEMP_CAPACITY,
      maxStack: MAX_STACK
    })
  }

  /** 检查是否能完整放入物品，避免购买时先扣钱后部分溢出 */
  const canAddItem = (
    itemId: string,
    quantity: number = 1,
    quality: Quality = 'normal',
    compositionTags?: readonly string[]
  ): boolean => {
    return getAddableItemQuantity(itemId, quality, compositionTags) >= quantity
  }

  /** 物品分类排序优先级 */
  const CATEGORY_ORDER: Record<string, number> = {
    seed: 0,
    crop: 1,
    fruit: 2,
    fish: 3,
    animal_product: 4,
    processed: 5,
    food: 6,
    ore: 7,
    gem: 8,
    material: 9,
    machine: 10,
    sprinkler: 11,
    fertilizer: 12,
    bait: 13,
    tackle: 14,
    bomb: 15,
    sapling: 16,
    gift: 17,
    fossil: 18,
    artifact: 19,
    misc: 20
  }

  /** 切换物品锁定状态 */
  const toggleLock = (itemId: string, quality: Quality) => {
    const slot = items.value.find(i => i.itemId === itemId && i.quality === quality)
    if (slot) slot.locked = !slot.locked
  }

  /** 一键整理背包（按分类→物品ID→品质排序，合并同类栈） */
  const sortItems = () => {
    const split = compactItemStacks(items.value, MAX_STACK, getOfficialSeparateStackTagIds())
    // 按分类 → 物品ID → 品质排序
    const qualityOrder: Record<string, number> = { normal: 0, fine: 1, excellent: 2, supreme: 3 }
    split.sort((a, b) => {
      const defA = getItemById(a.itemId)
      const defB = getItemById(b.itemId)
      const catA = CATEGORY_ORDER[defA?.category ?? 'misc'] ?? 20
      const catB = CATEGORY_ORDER[defB?.category ?? 'misc'] ?? 20
      if (catA !== catB) return catA - catB
      if (a.itemId !== b.itemId) return a.itemId.localeCompare(b.itemId)
      return (qualityOrder[a.quality] ?? 0) - (qualityOrder[b.quality] ?? 0)
    })
    items.value = split
  }

  /** 扩容背包 */
  const expandCapacity = (): boolean => {
    const result = expandStandardInventoryCapacity(capacity.value, MAX_CAPACITY)
    capacity.value = result.capacity
    return result.success
  }

  /** 超限扩容背包（+1格，突破 MAX_CAPACITY） */
  const expandCapacityExtra = (): boolean => {
    const result = expandExtraInventoryCapacity(capacity.value)
    capacity.value = result.capacity
    return result.success
  }

  /** 将临时背包中的物品转移到主背包 */
  const moveFromTemp = (index: number): boolean => {
    if (index < 0 || index >= tempItems.value.length) return false
    const result = moveTempItemToStacks({
      items: items.value,
      tempItems: tempItems.value,
      tempIndex: index,
      separateTagIds: getOfficialSeparateStackTagIds(),
      mainCapacity: capacity.value,
      maxStack: MAX_STACK
    })
    items.value = result.items
    tempItems.value = result.tempItems
    return result.success
  }

  /** 一键将所有可转移的临时背包物品移入主背包 */
  const moveAllFromTemp = (): number => {
    let movedCount = 0
    for (let i = tempItems.value.length - 1; i >= 0; i--) {
      if (moveFromTemp(i)) movedCount++
    }
    return movedCount
  }

  /** 丢弃临时背包中的物品 */
  const discardTempItem = (index: number): boolean => {
    if (index < 0 || index >= tempItems.value.length) return false
    tempItems.value.splice(index, 1)
    return true
  }

  /** 获取工具 */
  const getTool = (type: ToolType): Tool | undefined => {
    return tools.value.find(t => t.type === type)
  }

  /** 获取工具等级对应的体力消耗倍率 */
  const getToolStaminaMultiplier = (type: ToolType): number => {
    const tool = getTool(type)
    if (!tool) return 1
    const multipliers: Record<ToolTier, number> = { basic: 1.0, iron: 0.8, steel: 0.6, iridium: 0.4 }
    return multipliers[tool.tier]
  }

  /** 获取工具等级对应的批量操作数量（蓄力机制） */
  const getToolBatchCount = (type: ToolType): number => {
    const tool = getTool(type)
    if (!tool) return 1
    const counts: Record<ToolTier, number> = { basic: 1, iron: 2, steel: 4, iridium: 8 }
    return counts[tool.tier]
  }

  /** 升级工具 */
  const upgradeTool = (type: ToolType): boolean => {
    const result = upgradeToolTier(tools.value, type)
    if (!result.success) return false
    tools.value = result.tools
    return true
  }

  /** 检查工具是否可用（未在升级中） */
  const isToolAvailable = (type: ToolType): boolean => {
    return !pendingUpgrades.value.some(upgrade => upgrade.toolType === type)
  }

  /** 开始升级工具（进入2天等待期） */
  const startUpgrade = (type: ToolType, targetTier: ToolTier): boolean => {
    const result = startToolUpgrade(pendingUpgrades.value, type, targetTier)
    pendingUpgrades.value = result.pendingUpgrades
    return result.success
  }

  /** 每日升级进度更新，返回完成的工具名 */
  const dailyUpgradeUpdate = (): CompletedToolUpgrade[] => {
    const result = advanceToolUpgradesOneDay(pendingUpgrades.value)
    pendingUpgrades.value = result.pendingUpgrades
    for (const upgrade of result.completed) {
      upgradeTool(upgrade.toolType)
    }
    return result.completed
  }

  // ============================================================
  // 戒指系统
  // ============================================================

  /** 添加戒指到收藏 */
  const addRing = (defId: string): boolean => {
    ownedRings.value.push({ defId, enchantmentId: null, enchantmentIds: [] })
    useAchievementStore().discoverItem(defId)
    return true
  }

  /** 检查是否已拥有某戒指 */
  const hasRing = (defId: string): boolean => {
    return ownedRings.value.some(r => r.defId === defId)
  }

  /** 装备戒指到指定槽位（0 或 1），禁止两个槽位装备同defId戒指 */
  const equipRing = (ringIndex: number, slot: 0 | 1): boolean => {
    if (ringIndex < 0 || ringIndex >= ownedRings.value.length) return false
    const targetSlot = slot === 0 ? equippedRingSlot1 : equippedRingSlot2
    const otherSlot = slot === 0 ? equippedRingSlot2 : equippedRingSlot1
    // 已在目标槽位，无操作
    if (targetSlot.value === ringIndex) return true
    // 同一枚戒指在另一个槽位 → 交换
    if (otherSlot.value === ringIndex) {
      otherSlot.value = targetSlot.value // 可能是 -1
      targetSlot.value = ringIndex
      return true
    }
    // 禁止两个槽位装备同defId戒指
    const targetDefId = ownedRings.value[ringIndex]!.defId
    if (otherSlot.value >= 0 && otherSlot.value < ownedRings.value.length && ownedRings.value[otherSlot.value]!.defId === targetDefId) {
      return false
    }
    targetSlot.value = ringIndex
    return true
  }

  /** 卸下戒指（指定槽位） */
  const unequipRing = (slot: 0 | 1): boolean => {
    if (slot === 0) {
      if (equippedRingSlot1.value < 0) return false
      equippedRingSlot1.value = -1
    } else {
      if (equippedRingSlot2.value < 0) return false
      equippedRingSlot2.value = -1
    }
    return true
  }

  /** 卖出戒指（自动卸下已装备的戒指） */
  const sellRing = (index: number): { success: boolean; message: string } => {
    const sale = planRingSale(ownedRings.value, index, equippedRingSlot1.value, equippedRingSlot2.value)
    if (!sale.success || !sale.sold) return { success: false, message: sale.message ?? '无效索引。' }
    const ring = sale.sold
    const def = getRingById(ring.defId)
    const price = getEquipmentBaseSellPrice('ring', ring)
    const playerStore = usePlayerStore()
    playerStore.earnMoney(price)
    ownedRings.value = sale.equipment
    equippedRingSlot1.value = sale.equippedSlot1
    equippedRingSlot2.value = sale.equippedSlot2
    return { success: true, message: createEquipmentSaleMessage(def?.name ?? '', '戒指', price) }
  }

  const getRingBonusSource = (index: number): EquipmentBonusSource | null => {
    const ring = ownedRings.value[index]
    if (!ring) return null
    return {
      baseEffects: getRingById(ring.defId)?.effects ?? [],
      enchantmentEffects: getEquipmentEnchantmentEffects('ring', ring)
    }
  }

  const getHatBonusSource = (): EquipmentBonusSource | null => {
    const hat = ownedHats.value[equippedHatIndex.value]
    if (!hat) return null
    return {
      baseEffects: getHatById(hat.defId)?.effects ?? [],
      enchantmentEffects: getEquipmentEnchantmentEffects('hat', hat)
    }
  }

  const getShoeBonusSource = (): EquipmentBonusSource | null => {
    const shoe = ownedShoes.value[equippedShoeIndex.value]
    if (!shoe) return null
    return {
      baseEffects: getShoeById(shoe.defId)?.effects ?? [],
      enchantmentEffects: getEquipmentEnchantmentEffects('shoe', shoe)
    }
  }

  const getEquippedSetPieces = (): EquippedSetPieces => ({
    weaponDefId: ownedWeapons.value[equippedWeaponIndex.value]?.defId ?? null,
    ringDefIds: [
      ownedRings.value[equippedRingSlot1.value]?.defId ?? null,
      ownedRings.value[equippedRingSlot2.value]?.defId ?? null
    ],
    hatDefId: ownedHats.value[equippedHatIndex.value]?.defId ?? null,
    shoeDefId: ownedShoes.value[equippedShoeIndex.value]?.defId ?? null
  })

  /** 查询某种装备效果的合计值（戒指+帽子+鞋子叠加） */
  const getEquipmentBonus = (effectType: RingEffectType): number => {
    const weapon = ownedWeapons.value[equippedWeaponIndex.value]
    return sumEquipmentBonus(effectType, {
      rings: [getRingBonusSource(equippedRingSlot1.value), getRingBonusSource(equippedRingSlot2.value)],
      hat: getHatBonusSource(),
      shoe: getShoeBonusSource(),
      weaponEnchantmentEffects: weapon ? getEquipmentEnchantmentEffects('weapon', weapon) : [],
      setBonuses: activeSetBonuses.value
    })
  }

  /** 查询某种戒指效果的合计值（代理到 getEquipmentBonus，包含帽子/鞋子加成） */
  const getRingEffectValue = (effectType: RingEffectType): number => {
    return getEquipmentBonus(effectType)
  }

  // ============================================================
  // 套装系统
  // ============================================================

  /** 当前激活的套装奖励效果列表 */
  const activeSetBonuses = computed(() => {
    return getActiveEquipmentSetBonuses(getEquipmentSets(), getEquippedSetPieces())
  })

  /** 套装激活状态（供UI显示） */
  const activeSets = computed(() => {
    return createActiveEquipmentSetSummaries(getEquipmentSets(), getEquippedSetPieces())
  })

  /** 合成戒指 */
  const craftRing = (defId: string): { success: boolean; message: string } => {
    const def = getRingById(defId)
    const playerStore = usePlayerStore()
    const plan = createEquipmentCraftingPlan(
      def,
      '戒指',
      playerStore.money,
      itemId => getItemCount(itemId),
      itemId => getItemById(itemId)?.name
    )
    if (!plan.success) return { success: false, message: plan.message }

    for (const mat of plan.materials) {
      removeItem(mat.itemId, mat.quantity)
    }
    playerStore.spendMoney(plan.moneyCost)

    addRing(defId)
    return { success: true, message: plan.message }
  }

  // ============================================================
  // 帽子系统
  // ============================================================

  /** 添加帽子到收藏 */
  const addHat = (defId: string): boolean => {
    ownedHats.value.push({ defId, enchantmentId: null, enchantmentIds: [] })
    useAchievementStore().discoverItem(defId)
    return true
  }

  /** 检查是否已拥有某帽子 */
  const hasHat = (defId: string): boolean => {
    return ownedHats.value.some(h => h.defId === defId)
  }

  /** 装备帽子 */
  const equipHat = (index: number): boolean => {
    if (index < 0 || index >= ownedHats.value.length) return false
    equippedHatIndex.value = index
    return true
  }

  /** 卸下帽子 */
  const unequipHat = (): boolean => {
    if (equippedHatIndex.value < 0) return false
    equippedHatIndex.value = -1
    return true
  }

  /** 卖出帽子 */
  const sellHat = (index: number): { success: boolean; message: string } => {
    const sale = planSingleSlotEquipmentSale(ownedHats.value, index, equippedHatIndex.value)
    if (!sale.success || !sale.sold) return { success: false, message: sale.message ?? '无效索引。' }
    const hat = sale.sold
    const def = getHatById(hat.defId)
    const price = getEquipmentBaseSellPrice('hat', hat)
    const playerStore = usePlayerStore()
    playerStore.earnMoney(price)
    ownedHats.value = sale.equipment
    equippedHatIndex.value = sale.equippedIndex
    return { success: true, message: createEquipmentSaleMessage(def?.name ?? '', '帽子', price) }
  }

  /** 合成帽子 */
  const craftHat = (defId: string): { success: boolean; message: string } => {
    const def = getHatById(defId)
    const playerStore = usePlayerStore()
    const plan = createEquipmentCraftingPlan(
      def,
      '帽子',
      playerStore.money,
      itemId => getItemCount(itemId),
      itemId => getItemById(itemId)?.name
    )
    if (!plan.success) return { success: false, message: plan.message }

    for (const mat of plan.materials) {
      removeItem(mat.itemId, mat.quantity)
    }
    playerStore.spendMoney(plan.moneyCost)
    addHat(defId)
    return { success: true, message: plan.message }
  }

  // ============================================================
  // 鞋子系统
  // ============================================================

  /** 添加鞋子到收藏 */
  const addShoe = (defId: string): boolean => {
    ownedShoes.value.push({ defId, enchantmentId: null, enchantmentIds: [] })
    useAchievementStore().discoverItem(defId)
    return true
  }

  /** 检查是否已拥有某鞋子 */
  const hasShoe = (defId: string): boolean => {
    return ownedShoes.value.some(s => s.defId === defId)
  }

  /** 装备鞋子 */
  const equipShoe = (index: number): boolean => {
    if (index < 0 || index >= ownedShoes.value.length) return false
    equippedShoeIndex.value = index
    return true
  }

  /** 卸下鞋子 */
  const unequipShoe = (): boolean => {
    if (equippedShoeIndex.value < 0) return false
    equippedShoeIndex.value = -1
    return true
  }

  /** 卖出鞋子 */
  const sellShoe = (index: number): { success: boolean; message: string } => {
    const sale = planSingleSlotEquipmentSale(ownedShoes.value, index, equippedShoeIndex.value)
    if (!sale.success || !sale.sold) return { success: false, message: sale.message ?? '无效索引。' }
    const shoe = sale.sold
    const def = getShoeById(shoe.defId)
    const price = getEquipmentBaseSellPrice('shoe', shoe)
    const playerStore = usePlayerStore()
    playerStore.earnMoney(price)
    ownedShoes.value = sale.equipment
    equippedShoeIndex.value = sale.equippedIndex
    return { success: true, message: createEquipmentSaleMessage(def?.name ?? '', '鞋子', price) }
  }

  /** 合成鞋子 */
  const craftShoe = (defId: string): { success: boolean; message: string } => {
    const def = getShoeById(defId)
    const playerStore = usePlayerStore()
    const plan = createEquipmentCraftingPlan(
      def,
      '鞋子',
      playerStore.money,
      itemId => getItemCount(itemId),
      itemId => getItemById(itemId)?.name
    )
    if (!plan.success) return { success: false, message: plan.message }

    for (const mat of plan.materials) {
      removeItem(mat.itemId, mat.quantity)
    }
    playerStore.spendMoney(plan.moneyCost)
    addShoe(defId)
    return { success: true, message: plan.message }
  }

  // ============================================================
  // 装备方案系统
  // ============================================================

  /** 创建空方案 */
  const createEquipmentPreset = (name: string): boolean => {
    const result = createEquipmentPresetState(equipmentPresets.value, name, Date.now().toString())
    equipmentPresets.value = result.presets
    return result.success
  }

  /** 删除方案 */
  const deleteEquipmentPreset = (id: string) => {
    const result = deleteEquipmentPresetState(equipmentPresets.value, activePresetId.value, id)
    equipmentPresets.value = result.presets
    activePresetId.value = result.activePresetId
  }

  /** 重命名方案 */
  const renameEquipmentPreset = (id: string, name: string) => {
    equipmentPresets.value = renameEquipmentPresetState(equipmentPresets.value, id, name)
  }

  /** 将当前装备保存到方案 */
  const saveCurrentToPreset = (id: string) => {
    equipmentPresets.value = saveCurrentEquipmentToPresetState(equipmentPresets.value, id, {
      weaponDefId: ownedWeapons.value[equippedWeaponIndex.value]?.defId ?? null,
      ringSlot1DefId: equippedRingSlot1.value >= 0 ? (ownedRings.value[equippedRingSlot1.value]?.defId ?? null) : null,
      ringSlot2DefId: equippedRingSlot2.value >= 0 ? (ownedRings.value[equippedRingSlot2.value]?.defId ?? null) : null,
      hatDefId: equippedHatIndex.value >= 0 ? (ownedHats.value[equippedHatIndex.value]?.defId ?? null) : null,
      shoeDefId: equippedShoeIndex.value >= 0 ? (ownedShoes.value[equippedShoeIndex.value]?.defId ?? null) : null
    })
  }

  /** 应用装备方案 */
  const applyEquipmentPreset = (id: string): { success: boolean; message: string } => {
    const preset = equipmentPresets.value.find(p => p.id === id)
    if (!preset) return { success: false, message: '方案不存在。' }

    const plan = planEquipmentPresetApplication(preset, {
      weapons: ownedWeapons.value,
      rings: ownedRings.value,
      hats: ownedHats.value,
      shoes: ownedShoes.value
    })

    if (plan.weaponIndex !== undefined && plan.weaponIndex !== null) equipWeapon(plan.weaponIndex)
    if (plan.ringSlot1Index === null) unequipRing(0)
    else if (plan.ringSlot1Index !== undefined) equipRing(plan.ringSlot1Index, 0)
    if (plan.ringSlot2Index === null) unequipRing(1)
    else if (plan.ringSlot2Index !== undefined) equipRing(plan.ringSlot2Index, 1)
    if (plan.hatIndex === null) unequipHat()
    else if (plan.hatIndex !== undefined) equipHat(plan.hatIndex)
    if (plan.shoeIndex === null) unequipShoe()
    else if (plan.shoeIndex !== undefined) equipShoe(plan.shoeIndex)

    activePresetId.value = id

    return { success: true, message: createEquipmentPresetApplicationMessage(preset.name, plan.missingLabels) }
  }

  // ============================================================
  // 装备整理
  // ============================================================

  /** 一键整理所有装备（按价值降序，装备中的置顶） */
  const sortEquipment = () => {
    const weaponSort = sortWeaponsForInventory(ownedWeapons.value, equippedWeaponIndex.value, weapon => {
      const def = getWeaponById(weapon.defId)
      return {
        attack: def?.attack ?? 0,
        enchantmentAttackBonus: getOwnedWeaponEnchantments(weapon).reduce((sum, enchant) => sum + enchant.attackBonus, 0)
      }
    })
    ownedWeapons.value = weaponSort.equipment
    equippedWeaponIndex.value = weaponSort.equippedIndex

    const ringSort = sortRingsBySellPrice(
      ownedRings.value,
      equippedRingSlot1.value,
      equippedRingSlot2.value,
      ring => getRingById(ring.defId)?.sellPrice ?? 0
    )
    ownedRings.value = ringSort.equipment
    equippedRingSlot1.value = ringSort.equippedSlot1
    equippedRingSlot2.value = ringSort.equippedSlot2

    const hatSort = sortEquipmentBySellPrice(ownedHats.value, equippedHatIndex.value, hat => getHatById(hat.defId)?.sellPrice ?? 0)
    ownedHats.value = hatSort.equipment
    equippedHatIndex.value = hatSort.equippedIndex

    const shoeSort = sortEquipmentBySellPrice(ownedShoes.value, equippedShoeIndex.value, shoe => getShoeById(shoe.defId)?.sellPrice ?? 0)
    ownedShoes.value = shoeSort.equipment
    equippedShoeIndex.value = shoeSort.equippedIndex
  }

  const serialize = () => {
    return {
      items: items.value,
      capacity: capacity.value,
      tempItems: tempItems.value,
      tools: tools.value,
      ownedWeapons: ownedWeapons.value,
      equippedWeaponIndex: equippedWeaponIndex.value,
      pendingUpgrade: pendingUpgrade.value,
      pendingUpgrades: pendingUpgrades.value,
      ownedRings: ownedRings.value,
      equippedRingSlot1: equippedRingSlot1.value,
      equippedRingSlot2: equippedRingSlot2.value,
      ownedHats: ownedHats.value,
      equippedHatIndex: equippedHatIndex.value,
      ownedShoes: ownedShoes.value,
      equippedShoeIndex: equippedShoeIndex.value,
      equipmentPresets: equipmentPresets.value,
      activePresetId: activePresetId.value
    }
  }

  const deserialize = (data: SerializedInventoryMigrationState) => {
    const isKnownItem = (itemId: string): boolean => Boolean(getItemById(itemId))

    items.value = migrateSavedInventoryItems(data.items, isKnownItem)
    capacity.value = migrateSavedCapacity(data.capacity, INITIAL_CAPACITY)
    tempItems.value = migrateSavedInventoryItems(data.tempItems, isKnownItem)
    tools.value = migrateSavedTools(data.tools)

    const migratedWeapons = migrateSavedWeapons(data, normalizeEnchantmentIds)
    ownedWeapons.value = migratedWeapons.ownedWeapons
    equippedWeaponIndex.value = migratedWeapons.equippedWeaponIndex

    pendingUpgrades.value = migratePendingToolUpgrades(data)

    ownedRings.value = migrateSavedRings(data.ownedRings, normalizeEnchantmentIds)
    equippedRingSlot1.value = data.equippedRingSlot1 ?? -1
    equippedRingSlot2.value = data.equippedRingSlot2 ?? -1
    equippedRingSlot1.value = clampLoadedEquippedIndex(equippedRingSlot1.value, ownedRings.value.length)
    equippedRingSlot2.value = clampLoadedEquippedIndex(equippedRingSlot2.value, ownedRings.value.length)

    ownedHats.value = migrateSavedHats(data.ownedHats, normalizeEnchantmentIds)
    equippedHatIndex.value = data.equippedHatIndex ?? -1
    equippedHatIndex.value = clampLoadedEquippedIndex(equippedHatIndex.value, ownedHats.value.length)

    ownedShoes.value = migrateSavedShoes(data.ownedShoes, normalizeEnchantmentIds)
    equippedShoeIndex.value = data.equippedShoeIndex ?? -1
    equippedShoeIndex.value = clampLoadedEquippedIndex(equippedShoeIndex.value, ownedShoes.value.length)

    // 装备方案（向后兼容旧存档）
    equipmentPresets.value = migrateSavedEquipmentPresets(data.equipmentPresets)
    activePresetId.value = migrateSavedActivePresetId(data.activePresetId)
  }

  return {
    items,
    capacity,
    tools,
    ownedWeapons,
    equippedWeaponIndex,
    pendingUpgrade,
    pendingUpgrades,
    isFull,
    tempItems,
    isTempFull,
    isAllFull,
    addItem,
    removeItem,
    takeItemStacks,
    getItemCount,
    getCarriedItemCount,
    hasItem,
    hasCarriedItem,
    getAddableItemQuantity,
    canAddItem,
    expandCapacity,
    expandCapacityExtra,
    MAX_CAPACITY,
    moveFromTemp,
    moveAllFromTemp,
    discardTempItem,
    sortItems,
    toggleLock,
    getTool,
    getToolStaminaMultiplier,
    getToolBatchCount,
    upgradeTool,
    isToolAvailable,
    startUpgrade,
    dailyUpgradeUpdate,
    getWeaponAttack,
    getWeaponCritRate,
    getEquippedWeapon,
    addWeapon,
    hasWeapon,
    hasWeaponExact,
    equipWeapon,
    getEquipmentInstance,
    setEquipmentEnchantments,
    randomlyEnchantEquipment,
    disenchantEquipment,
    customizeEquipmentEnchantments,
    setWeaponEnchantments,
    randomlyEnchantWeapon,
    disenchantWeapon,
    customizeWeaponEnchantments,
    sellWeapon,
    ownedRings,
    equippedRingSlot1,
    equippedRingSlot2,
    addRing,
    hasRing,
    equipRing,
    unequipRing,
    sellRing,
    getRingEffectValue,
    getEquipmentBonus,
    craftRing,
    activeSets,
    ownedHats,
    equippedHatIndex,
    addHat,
    hasHat,
    equipHat,
    unequipHat,
    sellHat,
    craftHat,
    ownedShoes,
    equippedShoeIndex,
    addShoe,
    hasShoe,
    equipShoe,
    unequipShoe,
    sellShoe,
    craftShoe,
    equipmentPresets,
    activePresetId,
    createEquipmentPreset,
    deleteEquipmentPreset,
    renameEquipmentPreset,
    saveCurrentToPreset,
    applyEquipmentPreset,
    sortEquipment,
    serialize,
    deserialize
  }
})
