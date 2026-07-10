import type { EquipmentEffect, EquipmentEffectType, HatDef, RingDef, ShoeDef, WeaponDef } from '@/types'

export const EQUIPMENT_EFFECT_NAMES: Record<EquipmentEffectType, string> = {
  attack_bonus: '攻击力',
  crit_rate_bonus: '暴击率',
  defense_bonus: '防御',
  vampiric: '吸血',
  max_hp_bonus: '最大HP',
  stamina_reduction: '体力消耗',
  mining_stamina: '采矿体力',
  farming_stamina: '农作体力',
  fishing_stamina: '钓鱼体力',
  crop_quality_bonus: '作物品质',
  crop_growth_bonus: '作物生长',
  fish_quality_bonus: '鱼类品质',
  fishing_calm: '钓鱼稳定',
  sell_price_bonus: '售价加成',
  shop_discount: '商店折扣',
  gift_friendship: '送礼好感',
  monster_drop_bonus: '掉落率',
  exp_bonus: '经验加成',
  treasure_find: '宝箱概率',
  ore_bonus: '矿石加成',
  luck: '幸运',
  travel_speed: '旅行加速',
  combat_regen: '回合自愈'
}

export const PERCENT_EQUIPMENT_EFFECTS: ReadonlySet<EquipmentEffectType> = new Set([
  'crit_rate_bonus',
  'vampiric',
  'stamina_reduction',
  'mining_stamina',
  'farming_stamina',
  'fishing_stamina',
  'crop_quality_bonus',
  'crop_growth_bonus',
  'fish_quality_bonus',
  'fishing_calm',
  'sell_price_bonus',
  'shop_discount',
  'gift_friendship',
  'monster_drop_bonus',
  'exp_bonus',
  'treasure_find',
  'ore_bonus',
  'luck',
  'travel_speed',
  'defense_bonus'
])

export const collectEquipmentEffects = (
  enchantmentIds: readonly string[],
  effectsByEnchantmentId: Readonly<Record<string, readonly EquipmentEffect[] | undefined>>
): EquipmentEffect[] => {
  const effects: EquipmentEffect[] = []
  for (const id of enchantmentIds) {
    effects.push(...(effectsByEnchantmentId[id] ?? []))
  }
  return effects
}

export const formatEquipmentEffectValue = (effect: EquipmentEffect): string => {
  if (PERCENT_EQUIPMENT_EFFECTS.has(effect.type)) return `+${Math.round(effect.value * 100)}%`
  return `+${effect.value}`
}

export const formatEquipmentEffectRows = (effects: readonly EquipmentEffect[]): { label: string; value: string }[] => {
  return effects.map(effect => ({
    label: EQUIPMENT_EFFECT_NAMES[effect.type],
    value: formatEquipmentEffectValue(effect)
  }))
}

export interface EquipmentDetailInfo {
  category: string
  name: string
  description: string
  effects: { label: string; value: string }[]
}

export const createWeaponDetailInfo = (weapon: WeaponDef, weaponTypeName: string): EquipmentDetailInfo => ({
  category: '武器',
  name: weapon.name,
  description: weapon.description,
  effects: [
    { label: '攻击力', value: `${weapon.attack}` },
    { label: '类型', value: weaponTypeName },
    { label: '暴击率', value: `${Math.round(weapon.critRate * 100)}%` }
  ]
})

export const createRingDetailInfo = (ring: RingDef): EquipmentDetailInfo => ({
  category: '戒指',
  name: ring.name,
  description: ring.description,
  effects: formatEquipmentEffectRows(ring.effects)
})

export const createHatDetailInfo = (hat: HatDef): EquipmentDetailInfo => ({
  category: '帽子',
  name: hat.name,
  description: hat.description,
  effects: formatEquipmentEffectRows(hat.effects)
})

export const createShoeDetailInfo = (shoe: ShoeDef): EquipmentDetailInfo => ({
  category: '鞋子',
  name: shoe.name,
  description: shoe.description,
  effects: formatEquipmentEffectRows(shoe.effects)
})
