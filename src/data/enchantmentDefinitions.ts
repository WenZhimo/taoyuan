import type { EquipmentEffect, EnchantmentDef } from '@/types'

/** 附魔定义 */
export const ENCHANTMENTS: Record<string, EnchantmentDef> = {
  sharp: {
    id: 'sharp',
    name: '锋利',
    description: '攻击力+3',
    attackBonus: 3,
    critBonus: 0,
    special: null
  },
  fierce: {
    id: 'fierce',
    name: '炽热',
    description: '攻击力+5',
    attackBonus: 5,
    critBonus: 0,
    special: null
  },
  precise: {
    id: 'precise',
    name: '精准',
    description: '暴击率+10%',
    attackBonus: 0,
    critBonus: 0.1,
    special: null
  },
  vampiric: {
    id: 'vampiric',
    name: '吸血',
    description: '造成伤害的15%回复HP',
    attackBonus: 0,
    critBonus: 0,
    special: 'vampiric'
  },
  sturdy: {
    id: 'sturdy',
    name: '坚韧',
    description: '受到伤害-15%',
    attackBonus: 0,
    critBonus: 0,
    special: 'sturdy'
  },
  lucky: {
    id: 'lucky',
    name: '幸运',
    description: '怪物掉落率+20%',
    attackBonus: 0,
    critBonus: 0,
    special: 'lucky'
  },
  venom: {
    id: 'venom',
    name: '淬毒',
    description: '攻击时有概率使敌人中毒',
    attackBonus: 0,
    critBonus: 0,
    special: 'poison'
  },
  flame: {
    id: 'flame',
    name: '燃焰',
    description: '攻击时有概率点燃敌人',
    attackBonus: 2,
    critBonus: 0,
    special: 'burn'
  },
  frost: {
    id: 'frost',
    name: '霜寒',
    description: '攻击时有概率冻结敌人',
    attackBonus: 0,
    critBonus: 0.05,
    special: 'freeze'
  },
  irradiated: {
    id: 'irradiated',
    name: '辐照',
    description: '攻击时有概率附加辐射',
    attackBonus: 0,
    critBonus: 0,
    special: 'radiation'
  },
  scholar: {
    id: 'scholar',
    name: '学识',
    description: '技能经验+20%',
    attackBonus: 0,
    critBonus: 0,
    special: null
  },
  beloved: {
    id: 'beloved',
    name: '亲和',
    description: '聊天与送礼好感+25%',
    attackBonus: 0,
    critBonus: 0,
    special: null
  },
  regenerating: {
    id: 'regenerating',
    name: '回春',
    description: '战斗中每回合回复3HP',
    attackBonus: 0,
    critBonus: 0,
    special: null
  },
  treasure: {
    id: 'treasure',
    name: '寻宝',
    description: '宝箱与稀有发现概率+10%',
    attackBonus: 0,
    critBonus: 0,
    special: null
  },
  swift: {
    id: 'swift',
    name: '轻捷',
    description: '旅行时间-8%',
    attackBonus: 0,
    critBonus: 0,
    special: null
  },
  frugal: {
    id: 'frugal',
    name: '节用',
    description: '体力消耗-5%',
    attackBonus: 0,
    critBonus: 0,
    special: null
  }
}

/** 附魔稀有度：数值越高越稀有，价格越贵 */
export const ENCHANTMENT_RARITY: Record<string, number> = {
  sharp: 1,
  fierce: 2,
  precise: 2,
  venom: 3,
  flame: 3,
  sturdy: 3,
  vampiric: 4,
  lucky: 4,
  frost: 4,
  scholar: 4,
  beloved: 4,
  regenerating: 4,
  treasure: 4,
  swift: 3,
  frugal: 3,
  irradiated: 5
}

/** 可用于随机附魔的 ID 列表 */
export const RANDOM_ENCHANT_IDS = [
  'sharp',
  'fierce',
  'precise',
  'venom',
  'flame',
  'sturdy',
  'swift',
  'frugal',
  'vampiric',
  'lucky',
  'frost',
  'scholar',
  'beloved',
  'regenerating',
  'treasure',
  'irradiated'
]

export const ENCHANTMENT_EFFECTS: Partial<Record<string, EquipmentEffect[]>> = {
  sharp: [{ type: 'attack_bonus', value: 3 }],
  fierce: [{ type: 'attack_bonus', value: 5 }],
  precise: [{ type: 'crit_rate_bonus', value: 0.1 }],
  vampiric: [{ type: 'vampiric', value: 0.15 }],
  sturdy: [{ type: 'defense_bonus', value: 0.15 }],
  lucky: [
    { type: 'monster_drop_bonus', value: 0.2 },
    { type: 'luck', value: 0.05 }
  ],
  scholar: [{ type: 'exp_bonus', value: 0.2 }],
  beloved: [{ type: 'gift_friendship', value: 0.25 }],
  regenerating: [{ type: 'combat_regen', value: 3 }],
  treasure: [{ type: 'treasure_find', value: 0.1 }],
  swift: [{ type: 'travel_speed', value: 0.08 }],
  frugal: [{ type: 'stamina_reduction', value: 0.05 }]
}
