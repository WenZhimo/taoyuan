import type { EnchantmentDef } from '@/types'

export interface EnchantmentSummary {
  id: string
  name: string
  description: string
  count: number
}

export interface EnchantmentDetailRow {
  label: string
  value: string
}

export interface WeaponEnchantmentDetailInfo {
  category: string
  name: string
  description: string
  effects: EnchantmentDetailRow[]
}

export interface EnchantmentSummaryFormatOptions {
  maxVisible?: number
}

export const summarizeEnchantments = (enchantments: readonly EnchantmentDef[]): EnchantmentSummary[] => {
  const summary = new Map<string, EnchantmentSummary>()

  for (const enchant of enchantments) {
    const current = summary.get(enchant.id)
    if (current) {
      current.count += 1
    } else {
      summary.set(enchant.id, {
        id: enchant.id,
        name: enchant.name,
        description: enchant.description,
        count: 1
      })
    }
  }

  return [...summary.values()]
}

export const formatEnchantmentSummary = (
  enchantments: readonly EnchantmentDef[],
  options: EnchantmentSummaryFormatOptions = {}
): string => {
  const summary = summarizeEnchantments(enchantments)
  const maxVisible = Math.max(1, options.maxVisible ?? 4)
  const visible = summary.slice(0, maxVisible)
  const names = visible
    .map(enchant => (enchant.count > 1 ? `${enchant.name}x${enchant.count}` : enchant.name))
    .join('、')

  if (summary.length > visible.length) return `${names}等${summary.length - visible.length}种附魔`
  return names
}

export const formatEnchantmentDetailRows = (enchantments: readonly EnchantmentDef[]): EnchantmentDetailRow[] => {
  return summarizeEnchantments(enchantments).map(enchant => ({
    label: enchant.count > 1 ? `${enchant.name}x${enchant.count}` : enchant.name,
    value: enchant.description
  }))
}

export const createWeaponEnchantmentDetailInfo = (
  weaponDisplayName: string,
  enchantments: readonly EnchantmentDef[]
): WeaponEnchantmentDetailInfo | null => {
  const effects = formatEnchantmentDetailRows(enchantments)
  if (effects.length === 0) return null

  return {
    category: '武器附魔',
    name: weaponDisplayName,
    description: '同种附魔已合并显示。',
    effects
  }
}
