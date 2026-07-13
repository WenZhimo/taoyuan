import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { InventoryItem, Quality, Chest, ChestTier, VoidChestRole } from '@/types'
import { getItemById, CHEST_DEFS } from '@/data/items'
import { MAX_STACK as INVENTORY_MAX_STACK, TEMP_CAPACITY, useInventoryStore } from './useInventoryStore'
import {
  addItemToStacks,
  compactItemStacks,
  countItemQuantity,
  normalizeCompositionTags,
  removeItemFromStacks
} from '@/domain/inventory/itemStacks'
import { getOfficialSeparateStackTagIds } from '@/domain/mods/contentAccess'

const INITIAL_MAX_CHESTS = 3
const MAX_CHESTS_CAP = 10
const MAX_STACK = 999
const UNLOCK_COST = 50000

export const useWarehouseStore = defineStore('warehouse', () => {
  const unlocked = ref(false)
  const chests = ref<Chest[]>([])
  const maxChests = ref(INITIAL_MAX_CHESTS)

  const hasVoidChest = computed(() => chests.value.some(c => c.tier === 'void'))

  // ---- 箱子管理 ----

  /** 创建箱子 */
  const addChest = (tier: ChestTier, label?: string): boolean => {
    if (chests.value.length >= maxChests.value) return false
    const def = CHEST_DEFS[tier]
    chests.value.push({
      id: `chest_${Date.now()}`,
      tier,
      label: label ?? def.name,
      items: [],
      voidRole: 'none'
    })
    return true
  }

  /** 删除空箱子 */
  const removeChest = (chestId: string): boolean => {
    const idx = chests.value.findIndex(c => c.id === chestId)
    if (idx === -1) return false
    if (chests.value[idx]!.items.length > 0) return false
    chests.value.splice(idx, 1)
    return true
  }

  /** 重命名箱子 */
  const renameChest = (chestId: string, label: string): boolean => {
    const trimmed = label.trim()
    if (!trimmed || trimmed.length > 8) return false
    const chest = chests.value.find(c => c.id === chestId)
    if (!chest) return false
    chest.label = trimmed
    return true
  }

  /** 获取箱子引用 */
  const getChest = (chestId: string): Chest | undefined => {
    return chests.value.find(c => c.id === chestId)
  }

  /** 获取箱子容量 */
  const getChestCapacity = (chestId: string): number => {
    const chest = chests.value.find(c => c.id === chestId)
    if (!chest) return 0
    return CHEST_DEFS[chest.tier].capacity
  }

  /** 箱子是否已满 */
  const isChestFull = (chestId: string): boolean => {
    const chest = chests.value.find(c => c.id === chestId)
    if (!chest) return true
    return chest.items.length >= CHEST_DEFS[chest.tier].capacity
  }

  // ---- 物品操作 ----

  /** 直接往箱子加物品（内部/自动路由用） */
  const addItemToChest = (
    chestId: string,
    itemId: string,
    quantity: number = 1,
    quality: Quality = 'normal',
    compositionTags?: readonly string[]
  ): boolean => {
    const chest = chests.value.find(c => c.id === chestId)
    if (!chest) return false
    const result = addItemToStacks({
      items: chest.items,
      tempItems: [],
      itemId,
      quantity,
      quality,
      compositionTags,
      separateTagIds: getOfficialSeparateStackTagIds(),
      mainCapacity: CHEST_DEFS[chest.tier].capacity,
      tempCapacity: 0,
      maxStack: MAX_STACK
    })
    chest.items = result.items
    return result.remaining <= 0
  }

  const removeItemFromChest = (chestId: string, itemId: string, quantity: number = 1, quality?: Quality): boolean => {
    const chest = chests.value.find(c => c.id === chestId)
    if (!chest) return false
    const result = removeItemFromStacks({ items: chest.items, itemId, quantity, quality })
    if (!result.success) return false
    chest.items = result.items
    return true
  }

  const getChestItemCount = (chestId: string, itemId: string, quality?: Quality): number => {
    const chest = chests.value.find(c => c.id === chestId)
    return chest ? countItemQuantity(chest.items, itemId, quality) : 0
  }

  const planAddStacksToChest = (chest: Chest, stacks: readonly InventoryItem[]): InventoryItem[] | null => {
    let plannedItems = chest.items
    for (const stack of stacks) {
      const result = addItemToStacks({
        items: plannedItems,
        tempItems: [],
        itemId: stack.itemId,
        quantity: stack.quantity,
        quality: stack.quality,
        compositionTags: stack.compositionTags,
        separateTagIds: getOfficialSeparateStackTagIds(),
        mainCapacity: CHEST_DEFS[chest.tier].capacity,
        tempCapacity: 0,
        maxStack: MAX_STACK
      })
      if (result.remaining > 0) return null
      plannedItems = result.items
    }
    return plannedItems
  }

  const normalizeSavedChestItems = (savedItems: readonly InventoryItem[] | undefined): InventoryItem[] =>
    (savedItems ?? []).map(item => ({
      ...item,
      compositionTags: normalizeCompositionTags(item.compositionTags)
    }))

  const planAddStacksToInventory = (stacks: readonly InventoryItem[]): boolean => {
    const inv = useInventoryStore()
    let plannedItems = inv.items
    let plannedTempItems = inv.tempItems
    for (const stack of stacks) {
      const result = addItemToStacks({
        items: plannedItems,
        tempItems: plannedTempItems,
        itemId: stack.itemId,
        quantity: stack.quantity,
        quality: stack.quality,
        compositionTags: stack.compositionTags,
        separateTagIds: getOfficialSeparateStackTagIds(),
        mainCapacity: inv.capacity,
        tempCapacity: TEMP_CAPACITY,
        maxStack: INVENTORY_MAX_STACK
      })
      if (result.remaining > 0) return false
      plannedItems = result.items
      plannedTempItems = result.tempItems
    }
    return true
  }

  const depositToChest = (chestId: string, itemId: string, quantity: number, quality: Quality): number => {
    const inv = useInventoryStore()
    const chest = chests.value.find(c => c.id === chestId)
    if (!chest) return 0

    let low = 0
    let high = Math.min(quantity, inv.getItemCount(itemId, quality))
    let plannedQuantity = 0

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (mid <= 0) {
        low = 1
        continue
      }
      const removal = removeItemFromStacks({ items: inv.items, itemId, quantity: mid, quality, trackRemoved: true })
      const plannedItems = removal.success ? planAddStacksToChest(chest, removal.removed ?? []) : null
      if (plannedItems) {
        plannedQuantity = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    if (plannedQuantity <= 0) return 0
    const removed = inv.takeItemStacks(itemId, plannedQuantity, quality)
    const plannedItems = planAddStacksToChest(chest, removed)
    if (!plannedItems) {
      for (const stack of removed) inv.addItem(stack.itemId, stack.quantity, stack.quality, stack.compositionTags)
      return 0
    }
    chest.items = plannedItems
    return plannedQuantity
  }

  const withdrawFromChest = (chestId: string, itemId: string, quantity: number, quality: Quality): boolean => {
    const inv = useInventoryStore()
    const chest = chests.value.find(c => c.id === chestId)
    if (!chest) return false

    const available = getChestItemCount(chestId, itemId, quality)
    const actual = Math.min(quantity, available)
    if (actual <= 0) return false

    const removal = removeItemFromStacks({ items: chest.items, itemId, quantity: actual, quality, trackRemoved: true })
    if (!removal.success || !planAddStacksToInventory(removal.removed ?? [])) return false

    chest.items = removal.items
    for (const stack of removal.removed ?? []) {
      inv.addItem(stack.itemId, stack.quantity, stack.quality, stack.compositionTags)
    }
    return true
  }

  const expandMaxChests = (): boolean => {
    if (maxChests.value >= MAX_CHESTS_CAP) return false
    maxChests.value += 1
    return true
  }

  // ---- 虚空箱管理 ----

  /** 设置虚空箱角色（同角色互斥） */
  const setVoidRole = (chestId: string, role: VoidChestRole): boolean => {
    const chest = chests.value.find(c => c.id === chestId)
    if (!chest || chest.tier !== 'void') return false

    // 清除同角色的其他箱子
    if (role !== 'none') {
      for (const c of chests.value) {
        if (c.id !== chestId && c.tier === 'void' && c.voidRole === role) {
          c.voidRole = 'none'
        }
      }
    }
    chest.voidRole = role
    return true
  }

  /** 获取虚空原料箱 */
  const getVoidInputChest = (): Chest | null => {
    return chests.value.find(c => c.tier === 'void' && c.voidRole === 'input') ?? null
  }

  /** 获取虚空成品箱 */
  const getVoidOutputChest = (): Chest | null => {
    return chests.value.find(c => c.tier === 'void' && c.voidRole === 'output') ?? null
  }

  /** 获取所有虚空箱 */
  const getVoidChests = (): Chest[] => {
    return chests.value.filter(c => c.tier === 'void')
  }

  // ---- 箱子排序 ----

  /** 移动箱子位置（上移/下移） */
  const moveChest = (chestId: string, direction: 'up' | 'down'): boolean => {
    const idx = chests.value.findIndex(c => c.id === chestId)
    if (idx === -1) return false
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= chests.value.length) return false
    const temp = chests.value[idx]!
    chests.value[idx] = chests.value[targetIdx]!
    chests.value[targetIdx] = temp
    return true
  }

  // ---- 整理 ----

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

  const qualityOrder: Record<string, number> = { normal: 0, fine: 1, excellent: 2, supreme: 3 }

  /** 一键整理箱子（按分类→物品ID→品质排序，合并同类栈） */
  const sortChest = (chestId: string) => {
    const chest = getChest(chestId)
    if (!chest || chest.items.length === 0) return
    const split = compactItemStacks(chest.items, MAX_STACK, getOfficialSeparateStackTagIds())
    split.sort((a, b) => {
      const defA = getItemById(a.itemId)
      const defB = getItemById(b.itemId)
      const catA = CATEGORY_ORDER[defA?.category ?? 'misc'] ?? 20
      const catB = CATEGORY_ORDER[defB?.category ?? 'misc'] ?? 20
      if (catA !== catB) return catA - catB
      if (a.itemId !== b.itemId) return a.itemId.localeCompare(b.itemId)
      return (qualityOrder[a.quality] ?? 0) - (qualityOrder[b.quality] ?? 0)
    })
    chest.items = split
  }

  const serialize = () => {
    return {
      unlocked: unlocked.value,
      chests: chests.value,
      maxChests: maxChests.value
    }
  }

  const deserialize = (data: Record<string, unknown>) => {
    unlocked.value = (data.unlocked as boolean) ?? false
    maxChests.value = (data.maxChests as number) ?? INITIAL_MAX_CHESTS

    // 旧存档迁移：有 items 无 chests
    if (data.items && !data.chests) {
      const oldItems = normalizeSavedChestItems(data.items as InventoryItem[])
      if (oldItems.length > 0) {
        // 金箱容量36，超出时分多个箱子
        const goldCap = CHEST_DEFS.gold.capacity
        const migratedChests: Chest[] = []
        for (let i = 0; i < oldItems.length; i += goldCap) {
          migratedChests.push({
            id: `migrated_chest_${migratedChests.length + 1}`,
            tier: 'gold',
            label: migratedChests.length === 0 ? '旧仓库' : `旧仓库${migratedChests.length + 1}`,
            items: normalizeSavedChestItems(oldItems.slice(i, i + goldCap)),
            voidRole: 'none'
          })
        }
        chests.value = migratedChests
        // 确保箱子槽位足够容纳迁移的箱子
        if (maxChests.value < migratedChests.length) {
          maxChests.value = migratedChests.length
        }
      } else {
        chests.value = []
      }
    } else {
      chests.value = ((data.chests as Chest[]) ?? []).map(chest => ({
        ...chest,
        items: normalizeSavedChestItems(chest.items),
        voidRole: chest.voidRole ?? 'none'
      }))
    }

    // 兼容旧存档：如果有箱子但未标记解锁，自动解锁
    if (!unlocked.value && chests.value.length > 0) unlocked.value = true
  }

  return {
    unlocked,
    chests,
    maxChests,
    hasVoidChest,
    UNLOCK_COST,
    MAX_CHESTS_CAP,
    addChest,
    removeChest,
    renameChest,
    getChest,
    getChestCapacity,
    isChestFull,
    addItemToChest,
    removeItemFromChest,
    getChestItemCount,
    depositToChest,
    withdrawFromChest,
    expandMaxChests,
    setVoidRole,
    getVoidInputChest,
    getVoidOutputChest,
    getVoidChests,
    moveChest,
    sortChest,
    serialize,
    deserialize
  }
})
