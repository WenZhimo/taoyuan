export const INITIAL_INVENTORY_CAPACITY = 24
export const MAX_STANDARD_INVENTORY_CAPACITY = 60
export const STANDARD_INVENTORY_CAPACITY_INCREMENT = 4
export const EXTRA_INVENTORY_CAPACITY_INCREMENT = 1

export interface InventoryCapacityExpansionResult {
  success: boolean
  capacity: number
}

export const expandStandardInventoryCapacity = (
  currentCapacity: number,
  maxCapacity = MAX_STANDARD_INVENTORY_CAPACITY,
  increment = STANDARD_INVENTORY_CAPACITY_INCREMENT
): InventoryCapacityExpansionResult => {
  if (currentCapacity >= maxCapacity) {
    return { success: false, capacity: currentCapacity }
  }

  return {
    success: true,
    capacity: Math.min(currentCapacity + increment, maxCapacity)
  }
}

export const expandExtraInventoryCapacity = (
  currentCapacity: number,
  increment = EXTRA_INVENTORY_CAPACITY_INCREMENT
): InventoryCapacityExpansionResult => ({
  success: true,
  capacity: currentCapacity + increment
})
