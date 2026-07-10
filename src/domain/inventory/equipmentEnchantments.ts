export interface EnchantableEquipmentState {
  defId: string
  enchantmentId?: string | null
  enchantmentIds?: string[]
}

export interface EnchantmentCostRef {
  id: string
  name?: string
  cost: number
}

export interface EnchantmentOperationResult {
  success: boolean
  message: string
  enchantmentId?: string
  enchantmentIds?: string[]
  cost?: number
}

export type EnchantableEquipmentEffectType = 'weapon' | 'ring' | 'hat' | 'shoe'

const WEAPON_EQUIPMENT_EFFECT_ENCHANT_IDS = new Set(['scholar', 'beloved', 'regenerating', 'treasure', 'swift', 'frugal'])

export const applyEquipmentEnchantments = <T extends EnchantableEquipmentState>(
  equipment: T,
  enchantmentIds: readonly string[]
): T => {
  const normalized = [...enchantmentIds]
  return {
    ...equipment,
    enchantmentId: normalized[0] ?? null,
    enchantmentIds: normalized
  }
}

export const filterEquipmentEffectEnchantmentIds = (
  type: EnchantableEquipmentEffectType,
  enchantmentIds: readonly string[]
): string[] => {
  if (type !== 'weapon') return [...enchantmentIds]
  return enchantmentIds.filter(id => WEAPON_EQUIPMENT_EFFECT_ENCHANT_IDS.has(id))
}

export const createRandomEnchantmentResult = (
  equipmentTypeName: string,
  enchantment: EnchantmentCostRef,
  money: number,
  hasEquipment = true
): EnchantmentOperationResult => {
  if (!hasEquipment) return { success: false, message: `无效${equipmentTypeName}。` }
  if (money < enchantment.cost) {
    return {
      success: false,
      message: `铜钱不足（需要${enchantment.cost}文）。`,
      enchantmentId: enchantment.id,
      cost: enchantment.cost
    }
  }
  return {
    success: true,
    message: `附魔完成：${enchantment.name ?? enchantment.id}。`,
    enchantmentId: enchantment.id,
    enchantmentIds: [enchantment.id],
    cost: enchantment.cost
  }
}

export const calculateDisenchantCost = (baseSellPrice: number, enchantmentCosts: readonly number[]): number => {
  const enchantValue = enchantmentCosts.reduce((sum, cost) => sum + Math.floor(cost * 0.2), 0)
  return Math.max(300, Math.floor((baseSellPrice + enchantValue) * 0.15))
}

export const createDisenchantResult = (
  equipmentTypeName: string,
  currentEnchantmentIds: readonly string[],
  baseSellPrice: number,
  enchantmentCosts: readonly number[],
  money: number,
  hasEquipment = true
): EnchantmentOperationResult => {
  if (!hasEquipment) return { success: false, message: `无效${equipmentTypeName}。` }
  if (currentEnchantmentIds.length === 0) return { success: false, message: `这件${equipmentTypeName}没有附魔。` }

  const cost = calculateDisenchantCost(baseSellPrice, enchantmentCosts)
  if (money < cost) return { success: false, message: `铜钱不足（需要${cost}文）。`, cost }

  return { success: true, message: '附魔已祛除。', enchantmentIds: [], cost }
}

export const createCustomizeEnchantmentsResult = (
  equipmentTypeName: string,
  normalizedEnchantmentIds: readonly string[],
  cost: number,
  money: number,
  hasEquipment = true
): EnchantmentOperationResult => {
  if (!hasEquipment) return { success: false, message: `无效${equipmentTypeName}。` }
  if (normalizedEnchantmentIds.length === 0) return { success: false, message: '请至少选择一种附魔。' }
  if (money < cost) return { success: false, message: `铜钱不足（需要${cost}文）。`, cost }

  return {
    success: true,
    message: `定制附魔完成，共${normalizedEnchantmentIds.length}条附魔。`,
    enchantmentIds: [...normalizedEnchantmentIds],
    cost
  }
}
