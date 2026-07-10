import { describe, expect, it } from 'vitest'
import type { EnchantmentDef, EquipmentEffect } from '@/types'
import {
  collectEquipmentEffects,
  createHatDetailInfo,
  createRingDetailInfo,
  createShoeDetailInfo,
  createWeaponDetailInfo,
  formatEquipmentEffectRows,
  formatEquipmentEffectValue
} from '@/domain/enchantments/equipmentEffects'
import {
  createWeaponEnchantmentDetailInfo,
  formatEnchantmentDetailRows,
  formatEnchantmentSummary,
  summarizeEnchantments
} from '@/domain/enchantments/summarizeEnchantments'

const enchantments: EnchantmentDef[] = [
  {
    id: 'sharp',
    name: '锋利',
    description: '攻击力+3',
    attackBonus: 3,
    critBonus: 0,
    special: null
  },
  {
    id: 'lucky',
    name: '幸运',
    description: '怪物掉落率+20%',
    attackBonus: 0,
    critBonus: 0,
    special: 'lucky'
  },
  {
    id: 'swift',
    name: '轻捷',
    description: '旅行时间-8%',
    attackBonus: 0,
    critBonus: 0,
    special: null
  }
]

describe('enchantment summaries', () => {
  it('combines duplicate enchantments while preserving first-seen order', () => {
    expect(summarizeEnchantments([enchantments[1]!, enchantments[0]!, enchantments[1]!])).toEqual([
      {
        id: 'lucky',
        name: '幸运',
        description: '怪物掉落率+20%',
        count: 2
      },
      {
        id: 'sharp',
        name: '锋利',
        description: '攻击力+3',
        count: 1
      }
    ])
  })

  it('formats a compact summary with a visible limit', () => {
    expect(formatEnchantmentSummary([enchantments[0]!, enchantments[0]!, enchantments[1]!, enchantments[2]!], { maxVisible: 2 })).toBe(
      '锋利x2、幸运等1种附魔'
    )
  })

  it('keeps full details available through the summarized rows', () => {
    const summary = summarizeEnchantments([enchantments[0]!, enchantments[0]!])

    expect(summary[0]).toMatchObject({
      name: '锋利',
      description: '攻击力+3',
      count: 2
    })
  })

  it('formats full enchantment detail rows for dialogs', () => {
    expect(formatEnchantmentDetailRows([enchantments[0]!, enchantments[0]!, enchantments[1]!])).toEqual([
      { label: '锋利x2', value: '攻击力+3' },
      { label: '幸运', value: '怪物掉落率+20%' }
    ])
  })

  it('creates weapon enchantment detail info only when enchantments exist', () => {
    expect(createWeaponEnchantmentDetailInfo('桃源剑', [])).toBeNull()
    expect(createWeaponEnchantmentDetailInfo('桃源剑', [enchantments[0]!, enchantments[0]!])).toEqual({
      category: '武器附魔',
      name: '桃源剑',
      description: '同种附魔已合并显示。',
      effects: [{ label: '锋利x2', value: '攻击力+3' }]
    })
  })

  it('collects equipment effects in enchantment order', () => {
    const effectsById: Record<string, EquipmentEffect[]> = {
      lucky: [{ type: 'monster_drop_bonus', value: 0.2 }],
      swift: [{ type: 'travel_speed', value: 0.08 }]
    }

    expect(collectEquipmentEffects(['lucky', 'missing', 'swift'], effectsById)).toEqual([
      { type: 'monster_drop_bonus', value: 0.2 },
      { type: 'travel_speed', value: 0.08 }
    ])
  })

  it('formats equipment effect values and display rows consistently', () => {
    expect(formatEquipmentEffectValue({ type: 'attack_bonus', value: 8 })).toBe('+8')
    expect(formatEquipmentEffectValue({ type: 'crit_rate_bonus', value: 0.12 })).toBe('+12%')

    expect(
      formatEquipmentEffectRows([
        { type: 'monster_drop_bonus', value: 1.5 },
        { type: 'combat_regen', value: 3 }
      ])
    ).toEqual([
      { label: '掉落率', value: '+150%' },
      { label: '回合自愈', value: '+3' }
    ])
  })

  it('creates equipment detail dialog info for weapons and wearable gear', () => {
    expect(
      createWeaponDetailInfo(
        {
          id: 'iron_sword',
          name: '铁剑',
          type: 'sword',
          attack: 12,
          critRate: 0.08,
          description: '可靠的铁剑。',
          shopPrice: 1200,
          shopMaterials: [],
          fixedEnchantment: null
        },
        '剑'
      )
    ).toEqual({
      category: '武器',
      name: '铁剑',
      description: '可靠的铁剑。',
      effects: [
        { label: '攻击力', value: '12' },
        { label: '类型', value: '剑' },
        { label: '暴击率', value: '8%' }
      ]
    })

    expect(
      createRingDetailInfo({
        id: 'lucky_ring',
        name: '幸运戒指',
        description: '更容易发现宝物。',
        effects: [{ type: 'treasure_find', value: 0.25 }],
        recipe: null,
        recipeMoney: 0,
        obtainSource: '测试',
        sellPrice: 100
      })
    ).toEqual({
      category: '戒指',
      name: '幸运戒指',
      description: '更容易发现宝物。',
      effects: [{ label: '宝箱概率', value: '+25%' }]
    })

    expect(
      createHatDetailInfo({
        id: 'straw_hat',
        name: '草帽',
        description: '普通草帽。',
        effects: [{ type: 'defense_bonus', value: 0.05 }],
        shopPrice: null,
        recipe: null,
        recipeMoney: 0,
        obtainSource: '测试',
        sellPrice: 10
      }).category
    ).toBe('帽子')

    expect(
      createShoeDetailInfo({
        id: 'travel_boots',
        name: '旅行靴',
        description: '适合赶路。',
        effects: [{ type: 'travel_speed', value: 0.1 }],
        shopPrice: null,
        recipe: null,
        recipeMoney: 0,
        obtainSource: '测试',
        sellPrice: 10
      }).category
    ).toBe('鞋子')
  })

  it('keeps repeated formatting cheap for equipment lists', () => {
    const repeated = Array.from({ length: 100 }, (_, i) => enchantments[i % enchantments.length]!)
    const iterations = 100_000
    const start = performance.now()
    let textLength = 0

    for (let i = 0; i < iterations; i++) {
      textLength += formatEnchantmentSummary(repeated, { maxVisible: 2 }).length
    }

    expect(textLength).toBeGreaterThan(0)
    expect(performance.now() - start).toBeLessThan(1_000)
  })
})
