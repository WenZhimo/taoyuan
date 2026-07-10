export interface SellableEquipmentState {
  defId: string
}

export type SellableEquipmentType = 'weapon' | 'ring' | 'hat' | 'shoe'

export interface EquipmentSellPriceLookups<T extends SellableEquipmentState> {
  getWeaponSellPrice: (equipment: T) => number
  getRingSellPrice: (defId: string) => number
  getHatSellPrice: (defId: string) => number
  getShoeSellPrice: (defId: string) => number
}

export interface EquipmentSalePlan<T extends SellableEquipmentState> {
  success: boolean
  message?: string
  sold?: T
  equipment: T[]
  equippedIndex: number
}

export interface RingSalePlan<T extends SellableEquipmentState> {
  success: boolean
  message?: string
  sold?: T
  equipment: T[]
  equippedSlot1: number
  equippedSlot2: number
}

const removeAt = <T>(items: readonly T[], index: number): T[] => {
  return items.filter((_, itemIndex) => itemIndex !== index)
}

export const shiftEquippedIndexAfterSale = (equippedIndex: number, soldIndex: number): number => {
  if (equippedIndex === soldIndex) return -1
  if (equippedIndex > soldIndex) return equippedIndex - 1
  return equippedIndex
}

export const planWeaponSale = <T extends SellableEquipmentState>(
  weapons: readonly T[],
  index: number,
  equippedIndex: number
): EquipmentSalePlan<T> => {
  if (weapons.length <= 1) {
    return { success: false, message: '至少保留一把武器。', equipment: weapons.map(weapon => ({ ...weapon })), equippedIndex }
  }
  if (index === equippedIndex) {
    return { success: false, message: '不能卖出装备中的武器，请先切换。', equipment: weapons.map(weapon => ({ ...weapon })), equippedIndex }
  }
  if (index < 0 || index >= weapons.length) {
    return { success: false, message: '无效索引。', equipment: weapons.map(weapon => ({ ...weapon })), equippedIndex }
  }

  return {
    success: true,
    sold: { ...weapons[index]! },
    equipment: removeAt(weapons, index).map(weapon => ({ ...weapon })),
    equippedIndex: shiftEquippedIndexAfterSale(equippedIndex, index)
  }
}

export const planSingleSlotEquipmentSale = <T extends SellableEquipmentState>(
  equipment: readonly T[],
  index: number,
  equippedIndex: number
): EquipmentSalePlan<T> => {
  if (index < 0 || index >= equipment.length) {
    return { success: false, message: '无效索引。', equipment: equipment.map(item => ({ ...item })), equippedIndex }
  }

  return {
    success: true,
    sold: { ...equipment[index]! },
    equipment: removeAt(equipment, index).map(item => ({ ...item })),
    equippedIndex: shiftEquippedIndexAfterSale(equippedIndex, index)
  }
}

export const planRingSale = <T extends SellableEquipmentState>(
  rings: readonly T[],
  index: number,
  equippedSlot1: number,
  equippedSlot2: number
): RingSalePlan<T> => {
  if (index < 0 || index >= rings.length) {
    return {
      success: false,
      message: '无效索引。',
      equipment: rings.map(ring => ({ ...ring })),
      equippedSlot1,
      equippedSlot2
    }
  }

  return {
    success: true,
    sold: { ...rings[index]! },
    equipment: removeAt(rings, index).map(ring => ({ ...ring })),
    equippedSlot1: shiftEquippedIndexAfterSale(equippedSlot1, index),
    equippedSlot2: shiftEquippedIndexAfterSale(equippedSlot2, index)
  }
}

export const createEquipmentSaleMessage = (equipmentName: string, fallbackName: string, price: number): string => {
  return `卖出了${equipmentName || fallbackName}，获得${price}文。`
}

export const getEquipmentSellPrice = <T extends SellableEquipmentState>(
  type: SellableEquipmentType,
  equipment: T,
  lookups: EquipmentSellPriceLookups<T>
): number => {
  if (type === 'weapon') return lookups.getWeaponSellPrice(equipment)
  if (type === 'ring') return lookups.getRingSellPrice(equipment.defId)
  if (type === 'hat') return lookups.getHatSellPrice(equipment.defId)
  return lookups.getShoeSellPrice(equipment.defId)
}
