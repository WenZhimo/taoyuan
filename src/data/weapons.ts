import type { EquipmentEffect, WeaponDef, EnchantmentDef } from '@/types'
import {
  formatEnchantmentSummary as formatEnchantmentSummaryFromDefs,
  summarizeEnchantments as summarizeEnchantmentDefs,
  type EnchantmentSummary,
  type EnchantmentSummaryFormatOptions
} from '@/domain/enchantments/summarizeEnchantments'
import { collectEquipmentEffects } from '@/domain/enchantments/equipmentEffects'
import { getOfficialWeaponById } from '@/domain/mods/contentAccess'
import {
  ENCHANTMENTS,
  ENCHANTMENT_EFFECTS,
  ENCHANTMENT_RARITY,
  RANDOM_ENCHANT_IDS
} from './enchantmentDefinitions'
import { WEAPONS, getBaseWeaponSellPrice } from './weaponDefinitions'

export {
  ENCHANTMENTS,
  ENCHANTMENT_EFFECTS,
  ENCHANTMENT_RARITY,
  RANDOM_ENCHANT_IDS
} from './enchantmentDefinitions'
export {
  BOSS_DROP_WEAPONS,
  MONSTER_DROP_WEAPONS,
  SHOP_WEAPONS,
  TREASURE_DROP_WEAPONS,
  WEAPON_TYPE_NAMES,
  WEAPONS
} from './weaponDefinitions'

export type WeaponEnchantInput = string | string[] | null | undefined

export const normalizeEnchantmentIds = (input: WeaponEnchantInput): string[] => {
  if (!input) return []
  const raw = Array.isArray(input) ? input : [input]
  return raw.filter(id => Boolean(ENCHANTMENTS[id]))
}

export const getWeaponEnchantmentIds = (weapon: { enchantmentId?: string | null; enchantmentIds?: string[] }): string[] => {
  return normalizeEnchantmentIds(weapon.enchantmentIds && weapon.enchantmentIds.length > 0 ? weapon.enchantmentIds : weapon.enchantmentId)
}

export const getWeaponEnchantments = (input: WeaponEnchantInput): EnchantmentDef[] => {
  return normalizeEnchantmentIds(input)
    .map(id => ENCHANTMENTS[id])
    .filter((enchant): enchant is EnchantmentDef => Boolean(enchant))
}

export const getOwnedWeaponEnchantments = (weapon: { enchantmentId?: string | null; enchantmentIds?: string[] }): EnchantmentDef[] => {
  return getWeaponEnchantmentIds(weapon)
    .map(id => ENCHANTMENTS[id])
    .filter((enchant): enchant is EnchantmentDef => Boolean(enchant))
}

export const getOwnedEquipmentEnchantments = (equipment: { enchantmentId?: string | null; enchantmentIds?: string[] }): EnchantmentDef[] =>
  getOwnedWeaponEnchantments(equipment)

export const summarizeEnchantments = (input: WeaponEnchantInput | EnchantmentDef[]): EnchantmentSummary[] => {
  const enchantments = Array.isArray(input) && input.length > 0 && typeof input[0] === 'object' ? (input as EnchantmentDef[]) : getWeaponEnchantments(input as WeaponEnchantInput)
  return summarizeEnchantmentDefs(enchantments)
}

export const formatEnchantmentSummary = (input: WeaponEnchantInput | EnchantmentDef[], options: EnchantmentSummaryFormatOptions = {}): string => {
  const enchantments = Array.isArray(input) && input.length > 0 && typeof input[0] === 'object' ? (input as EnchantmentDef[]) : getWeaponEnchantments(input as WeaponEnchantInput)
  return formatEnchantmentSummaryFromDefs(enchantments, options)
}

export const getEnchantmentEffects = (enchantmentIds: WeaponEnchantInput): EquipmentEffect[] => {
  return collectEquipmentEffects(normalizeEnchantmentIds(enchantmentIds), ENCHANTMENT_EFFECTS)
}

export const getEnchantmentCost = (enchantmentId: string): number => {
  const enchant = ENCHANTMENTS[enchantmentId]
  if (!enchant) return 0
  const rarity = ENCHANTMENT_RARITY[enchantmentId] ?? 1
  const rarityBase = [0, 800, 1600, 3200, 6000, 10000][rarity] ?? 12000
  const attackCost = enchant.attackBonus * 180
  const critCost = Math.round(enchant.critBonus * 12000)
  const specialCost = enchant.special ? rarity * 450 : 0
  return rarityBase + attackCost + critCost + specialCost
}

export const getCustomEnchantmentCost = (enchantmentIds: string[]): number => {
  return normalizeEnchantmentIds(enchantmentIds).reduce((sum, id) => sum + getEnchantmentCost(id), 0) * 10
}

export const rollWeightedEnchantment = (): string => {
  const entries = RANDOM_ENCHANT_IDS.map(id => {
    const rarity = ENCHANTMENT_RARITY[id] ?? 1
    return { id, weight: 1 / (rarity * rarity) }
  })
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = Math.random() * total
  for (const entry of entries) {
    roll -= entry.weight
    if (roll <= 0) return entry.id
  }
  return entries[0]!.id
}

/** 随机获取一个附魔（30% 概率触发） */
export const rollRandomEnchantment = (): string | null => {
  if (Math.random() >= 0.3) return null
  return rollWeightedEnchantment()
}

export const getWeaponById = (id: string): WeaponDef | undefined => {
  return getOfficialWeaponById(id) ?? WEAPONS[id]
}

/** 根据 ID 获取附魔定义 */
export const getEnchantmentById = (id: string): EnchantmentDef | undefined => {
  return ENCHANTMENTS[id]
}

/** 计算武器卖出价格 */
export const getWeaponSellPrice = (defId: string, enchantment: WeaponEnchantInput): number => {
  const def = getWeaponById(defId)
  if (!def) return 0
  const base = getBaseWeaponSellPrice(def)
  // 附魔额外加价
  const enchantmentIds = normalizeEnchantmentIds(enchantment)
  const enchantmentValue = enchantmentIds.reduce((sum, id) => sum + Math.floor(getEnchantmentCost(id) * 0.2), 0)
  return base + enchantmentValue
}

/** 获取附魔武器的显示名称 */
export const getWeaponDisplayName = (defId: string, enchantment: WeaponEnchantInput): string => {
  const weapon = getWeaponById(defId)
  if (!weapon) return defId
  const enchantments = getWeaponEnchantments(enchantment)
  if (enchantments.length === 0) return weapon.name
  const summary = summarizeEnchantments(enchantments)
  const nameSummary = formatEnchantmentSummary(enchantments, { maxVisible: 2 })
  if (summary.length <= 2) return `${nameSummary}的${weapon.name}`
  return `${summary[0]?.name ?? nameSummary}等${summary.length}种附魔的${weapon.name}`
}
