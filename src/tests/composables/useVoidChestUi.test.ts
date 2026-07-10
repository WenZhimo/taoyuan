import { describe, expect, it, vi } from 'vitest'
import { useVoidChestUi, VOID_QUALITY_LABEL, voidQualityClass } from '@/composables/layout/useVoidChestUi'
import type { Chest, InventoryItem, ItemDef, Quality } from '@/types'

const itemDefs: Record<string, ItemDef> = {
  cabbage: {
    id: 'cabbage',
    name: '青菜',
    category: 'crop',
    description: '测试作物',
    sellPrice: 10,
    edible: false
  },
  cabbage_seed: {
    id: 'cabbage_seed',
    name: '青菜种子',
    category: 'seed',
    description: '测试种子',
    sellPrice: 2,
    edible: false
  },
  ore: {
    id: 'ore',
    name: '矿石',
    category: 'ore',
    description: '测试矿石',
    sellPrice: 8,
    edible: false
  }
}

const createChest = (): Chest => ({
  id: 'void-1',
  tier: 'void',
  label: '虚空箱一',
  voidRole: 'input',
  items: [{ itemId: 'cabbage', quality: 'normal', quantity: 5 }]
})

const createUi = (overrides: Partial<Parameters<typeof useVoidChestUi>[0]> = {}) => {
  const inventory: InventoryItem[] = [
    { itemId: 'cabbage', quality: 'normal', quantity: 20 },
    { itemId: 'cabbage_seed', quality: 'normal', quantity: 20 },
    { itemId: 'ore', quality: 'fine', quantity: 3 },
    { itemId: 'locked_ore', quality: 'normal', quantity: 9, locked: true }
  ]
  const chest = createChest()
  const logs: string[] = []
  const depositToChest = vi.fn((_chestId: string, itemId: string, quantity: number, quality: Quality) => {
    chest.items.push({ itemId, quality, quantity })
    return quantity
  })
  const withdrawFromChest = vi.fn(() => true)
  const options = {
    inventoryItems: () => inventory,
    getChest: (chestId: string) => (chestId === chest.id ? chest : undefined),
    getVoidChests: () => [chest],
    depositToChest,
    withdrawFromChest,
    isChestFull: () => false,
    getItemById: (itemId: string) => itemDefs[itemId],
    addLog: (message: string) => logs.push(message),
    voidChestCapacity: 999,
    ...overrides
  }

  return {
    chest,
    depositToChest,
    inventory,
    logs,
    ui: useVoidChestUi(options),
    withdrawFromChest
  }
}

describe('useVoidChestUi', () => {
  it('tracks remote chest modal, expanded chest, deposit modal, and item details', () => {
    const { ui } = createUi()

    ui.showVoidModal.value = true
    ui.toggleVoidChest('void-1')
    ui.openVoidDeposit('void-1')
    ui.voidItemDetail.value = { itemId: 'cabbage', quality: 'normal', quantity: 5 }

    expect(ui.showVoidModal.value).toBe(true)
    expect(ui.expandedVoidChestId.value).toBe('void-1')
    expect(ui.showVoidDepositModal.value).toBe(true)
    expect(ui.voidItemDef.value?.name).toBe('青菜')

    ui.toggleVoidChest('void-1')
    expect(ui.expandedVoidChestId.value).toBeNull()
  })

  it('lists depositable items without locked items or seeds', () => {
    const { ui } = createUi()

    expect(ui.voidDepositableItems.value.map(item => item.itemId)).toEqual(['cabbage', 'ore'])
  })

  it('finds duplicate inventory items already present in the expanded chest', () => {
    const { ui } = createUi()

    expect(ui.voidDuplicateDepositItems.value).toEqual([])
    ui.toggleVoidChest('void-1')

    expect(ui.voidDuplicateDepositItems.value.map(item => item.itemId)).toEqual(['cabbage'])
  })

  it('clamps quantity changes to the active modal bounds', () => {
    const { ui } = createUi()

    ui.openVoidWithdrawQty('void-1', 'cabbage', 'normal', 20)
    ui.setVoidQty(0)
    expect(ui.voidQty.value).toBe(1)

    ui.setVoidQty(999)
    expect(ui.voidQty.value).toBe(20)
  })

  it('auto-executes quantity actions when the max quantity is one', () => {
    const { logs, ui, withdrawFromChest } = createUi()

    ui.openVoidWithdrawQty('void-1', 'cabbage', 'normal', 1)

    expect(ui.voidQtyModal.value).toBeNull()
    expect(withdrawFromChest).toHaveBeenCalledWith('void-1', 'cabbage', 1, 'normal')
    expect(logs).toEqual(['从虚空箱取出了青菜×1。'])
  })

  it('confirms deposit quantities and closes the deposit modal when the chest is full', () => {
    const { depositToChest, logs, ui } = createUi({
      isChestFull: () => true
    })

    ui.openVoidDeposit('void-1')
    ui.openVoidDepositQty('ore', 'fine', 3)
    ui.setVoidQty(2)
    ui.confirmVoidQty()

    expect(depositToChest).toHaveBeenCalledWith('void-1', 'ore', 2, 'fine')
    expect(ui.voidQtyModal.value).toBeNull()
    expect(ui.showVoidDepositModal.value).toBe(false)
    expect(logs).toEqual(['存入了矿石×2到虚空箱。'])
  })

  it('uses a duplicate deposit snapshot while depositing repeated items', () => {
    const { depositToChest, logs, ui } = createUi()

    ui.toggleVoidChest('void-1')
    ui.handleVoidDepositDuplicates()

    expect(depositToChest).toHaveBeenCalledTimes(1)
    expect(depositToChest).toHaveBeenCalledWith('void-1', 'cabbage', 20, 'normal')
    expect(logs).toEqual(['一键存入了1种物品，共20个到虚空箱。'])
  })

  it('keeps quality labels and classes stable for dialogs', () => {
    expect(VOID_QUALITY_LABEL.supreme).toBe('极品')
    expect(voidQualityClass('normal')).toBe('')
    expect(voidQualityClass('fine')).toBe('text-quality-fine')
    expect(voidQualityClass('excellent')).toBe('text-quality-excellent')
    expect(voidQualityClass('supreme')).toBe('text-quality-supreme')
  })

  it('runs repeated open and close state changes cheaply', () => {
    const { ui } = createUi()
    const iterations = 5_000
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      ui.showVoidModal.value = true
      ui.toggleVoidChest('void-1')
      ui.toggleVoidChest('void-1')
      ui.showVoidModal.value = false
    }

    const averageMs = (performance.now() - start) / iterations
    expect(averageMs).toBeLessThan(0.1)
  })
})
