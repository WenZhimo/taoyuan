export interface SortableEquipmentState {
  defId: string
}

export interface WeaponSortStats {
  attack: number
  enchantmentAttackBonus: number
}

export interface EquipmentSortPlan<T extends SortableEquipmentState> {
  equipment: T[]
  equippedIndex: number
}

export interface RingSortPlan<T extends SortableEquipmentState> {
  equipment: T[]
  equippedSlot1: number
  equippedSlot2: number
}

const cloneEquipment = <T extends SortableEquipmentState>(equipment: T): T => ({ ...equipment })

const findPreservedIndex = <T extends SortableEquipmentState>(equipment: readonly T[], preserved: T | undefined, fallbackIndex: number): number => {
  if (!preserved) return fallbackIndex
  const index = equipment.indexOf(preserved)
  return index >= 0 ? index : fallbackIndex
}

export const sortWeaponsForInventory = <T extends SortableEquipmentState>(
  weapons: readonly T[],
  equippedIndex: number,
  getStats: (weapon: T) => WeaponSortStats
): EquipmentSortPlan<T> => {
  const equippedWeapon = equippedIndex >= 0 ? weapons[equippedIndex] : undefined
  const sortedWeapons = [...weapons].sort((a, b) => {
    const statsA = getStats(a)
    const statsB = getStats(b)
    const attackDiff = statsB.attack - statsA.attack
    if (attackDiff !== 0) return attackDiff

    const enchantmentDiff = statsB.enchantmentAttackBonus - statsA.enchantmentAttackBonus
    if (enchantmentDiff !== 0) return enchantmentDiff

    return a.defId.localeCompare(b.defId)
  })

  return {
    equipment: sortedWeapons.map(cloneEquipment),
    equippedIndex: findPreservedIndex(sortedWeapons, equippedWeapon, 0)
  }
}

export const sortEquipmentBySellPrice = <T extends SortableEquipmentState>(
  equipment: readonly T[],
  equippedIndex: number,
  getSellPrice: (equipment: T) => number
): EquipmentSortPlan<T> => {
  const equippedEquipment = equippedIndex >= 0 ? equipment[equippedIndex] : undefined
  const sortedEquipment = [...equipment].sort((a, b) => {
    const priceDiff = getSellPrice(b) - getSellPrice(a)
    if (priceDiff !== 0) return priceDiff
    return a.defId.localeCompare(b.defId)
  })

  return {
    equipment: sortedEquipment.map(cloneEquipment),
    equippedIndex: findPreservedIndex(sortedEquipment, equippedEquipment, -1)
  }
}

export const sortRingsBySellPrice = <T extends SortableEquipmentState>(
  rings: readonly T[],
  equippedSlot1: number,
  equippedSlot2: number,
  getSellPrice: (ring: T) => number
): RingSortPlan<T> => {
  const equippedRing1 = equippedSlot1 >= 0 ? rings[equippedSlot1] : undefined
  const equippedRing2 = equippedSlot2 >= 0 ? rings[equippedSlot2] : undefined
  const sortedRings = [...rings].sort((a, b) => {
    const priceDiff = getSellPrice(b) - getSellPrice(a)
    if (priceDiff !== 0) return priceDiff
    return a.defId.localeCompare(b.defId)
  })

  return {
    equipment: sortedRings.map(cloneEquipment),
    equippedSlot1: findPreservedIndex(sortedRings, equippedRing1, -1),
    equippedSlot2: findPreservedIndex(sortedRings, equippedRing2, -1)
  }
}
