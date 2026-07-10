import { computed, ref } from 'vue'
import { useQuantityPicker } from '@/composables/game/useQuantityPicker'
import type { Chest, InventoryItem, ItemDef, Quality } from '@/types'

interface VoidChestItemDetail {
  itemId: string
  quality: Quality
  quantity: number
}

export interface VoidQtyModalData {
  mode: 'withdraw' | 'deposit'
  chestId: string
  itemId: string
  quality: Quality
  max: number
}

interface UseVoidChestUiOptions {
  inventoryItems: () => readonly InventoryItem[]
  getChest: (chestId: string) => Chest | undefined
  getVoidChests: () => Chest[]
  depositToChest: (chestId: string, itemId: string, quantity: number, quality: Quality) => number
  withdrawFromChest: (chestId: string, itemId: string, quantity: number, quality: Quality) => boolean
  isChestFull: (chestId: string) => boolean
  getItemById: (itemId: string) => ItemDef | undefined
  addLog: (message: string) => void
  voidChestCapacity: number
}

export const VOID_QUALITY_LABEL: Record<Quality, string> = {
  normal: '普通',
  fine: '优良',
  excellent: '精品',
  supreme: '极品'
}

export const voidQualityClass = (quality: Quality): string => {
  if (quality === 'fine') return 'text-quality-fine'
  if (quality === 'excellent') return 'text-quality-excellent'
  if (quality === 'supreme') return 'text-quality-supreme'
  return ''
}

export const useVoidChestUi = ({
  inventoryItems,
  getChest,
  getVoidChests,
  depositToChest,
  withdrawFromChest,
  isChestFull,
  getItemById,
  addLog,
  voidChestCapacity
}: UseVoidChestUiOptions) => {
  const showVoidModal = ref(false)
  const showVoidDepositModal = ref(false)
  const expandedVoidChestId = ref<string | null>(null)
  const voidDepositChestId = ref<string | null>(null)
  const voidItemDetail = ref<VoidChestItemDetail | null>(null)
  const voidQtyModal = ref<VoidQtyModalData | null>(null)
  const voidQuantityPicker = useQuantityPicker({
    initialQuantity: 1,
    maxQuantity: () => voidQtyModal.value?.max ?? 1
  })

  const voidChests = computed(() => getVoidChests())

  const getItemName = (itemId: string): string => getItemById(itemId)?.name ?? itemId

  const voidDepositableItems = computed(() =>
    inventoryItems().filter(item => {
      if (item.locked) return false
      const def = getItemById(item.itemId)
      return def !== undefined && def.category !== 'seed'
    })
  )

  const voidDuplicateDepositItems = computed(() => {
    if (!expandedVoidChestId.value) return []
    const chest = getChest(expandedVoidChestId.value)
    if (!chest) return []

    const chestItemIds = new Set(chest.items.map(item => item.itemId))
    return inventoryItems().filter(item => {
      if (item.locked) return false
      const def = getItemById(item.itemId)
      if (!def || def.category === 'seed') return false
      return chestItemIds.has(item.itemId)
    })
  })

  const voidItemDef = computed(() => {
    if (!voidItemDetail.value) return null
    return getItemById(voidItemDetail.value.itemId) ?? null
  })

  const toggleVoidChest = (chestId: string) => {
    expandedVoidChestId.value = expandedVoidChestId.value === chestId ? null : chestId
  }

  const openVoidDeposit = (chestId: string) => {
    voidDepositChestId.value = chestId
    showVoidDepositModal.value = true
  }

  const setVoidQty = (value: number) => {
    if (!voidQtyModal.value) return
    voidQuantityPicker.setQuantity(value)
  }

  const executeVoidWithdraw = (chestId: string, itemId: string, quality: Quality, quantity: number) => {
    if (!withdrawFromChest(chestId, itemId, quantity, quality)) {
      addLog('背包已满，无法取出。')
      return
    }
    addLog(`从虚空箱取出了${getItemName(itemId)}×${quantity}。`)
  }

  const executeVoidDeposit = (chestId: string, itemId: string, quality: Quality, quantity: number) => {
    const actualQty = depositToChest(chestId, itemId, quantity, quality)
    if (actualQty <= 0) {
      addLog('虚空箱已满，无法存入。')
      return
    }

    addLog(`存入了${getItemName(itemId)}×${actualQty}到虚空箱。`)
    if (voidDepositableItems.value.length === 0 || isChestFull(chestId)) {
      showVoidDepositModal.value = false
    }
  }

  const openVoidQtyModal = (mode: VoidQtyModalData['mode'], chestId: string, itemId: string, quality: Quality, max: number) => {
    if (max <= 1) {
      if (mode === 'withdraw') executeVoidWithdraw(chestId, itemId, quality, 1)
      else executeVoidDeposit(chestId, itemId, quality, 1)
      return
    }

    voidQtyModal.value = { mode, chestId, itemId, quality, max }
    voidQuantityPicker.resetQuantity(max)
  }

  const openVoidWithdrawQty = (chestId: string, itemId: string, quality: Quality, quantity: number) => {
    openVoidQtyModal('withdraw', chestId, itemId, quality, quantity)
  }

  const openVoidDepositQty = (itemId: string, quality: Quality, quantity: number) => {
    if (!voidDepositChestId.value) return
    openVoidQtyModal('deposit', voidDepositChestId.value, itemId, quality, quantity)
  }

  const handleVoidDepositDuplicates = () => {
    if (!expandedVoidChestId.value) return

    const chestId = expandedVoidChestId.value
    const snapshot = voidDuplicateDepositItems.value.map(item => ({
      itemId: item.itemId,
      quality: item.quality,
      quantity: item.quantity
    }))
    let totalDeposited = 0
    let kindCount = 0

    for (const item of snapshot) {
      const actual = depositToChest(chestId, item.itemId, item.quantity, item.quality)
      if (actual > 0) {
        totalDeposited += actual
        kindCount++
      }
    }

    if (totalDeposited > 0) {
      addLog(`一键存入了${kindCount}种物品，共${totalDeposited}个到虚空箱。`)
    } else {
      addLog('虚空箱已满，无法存入。')
    }
  }

  const confirmVoidQty = () => {
    if (!voidQtyModal.value) return

    const { mode, chestId, itemId, quality } = voidQtyModal.value
    if (mode === 'withdraw') executeVoidWithdraw(chestId, itemId, quality, voidQuantityPicker.quantity.value)
    else executeVoidDeposit(chestId, itemId, quality, voidQuantityPicker.quantity.value)
    voidQtyModal.value = null
  }

  return {
    VOID_QUALITY_LABEL,
    expandedVoidChestId,
    getItemName,
    handleVoidDepositDuplicates,
    openVoidDeposit,
    openVoidDepositQty,
    openVoidWithdrawQty,
    setVoidQty,
    showVoidDepositModal,
    showVoidModal,
    toggleVoidChest,
    voidChestCapacity,
    voidChests,
    voidDepositableItems,
    voidDepositChestId,
    voidDuplicateDepositItems,
    voidItemDef,
    voidItemDetail,
    voidQty: voidQuantityPicker.quantity,
    voidQtyModal,
    voidQualityClass,
    confirmVoidQty
  }
}
