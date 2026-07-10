import { describe, expect, it } from 'vitest'
import {
  applyEquipmentEnchantments,
  calculateDisenchantCost,
  createCustomizeEnchantmentsResult,
  createDisenchantResult,
  createRandomEnchantmentResult,
  filterEquipmentEffectEnchantmentIds,
  type EnchantableEquipmentState
} from '@/domain/inventory/equipmentEnchantments'

describe('inventory equipment enchantment rules', () => {
  it('mirrors the first enchantment into the legacy enchantmentId field', () => {
    const equipment: EnchantableEquipmentState = { defId: 'wooden_stick', enchantmentId: null, enchantmentIds: [] }

    expect(applyEquipmentEnchantments(equipment, ['sharp', 'lucky'])).toEqual({
      defId: 'wooden_stick',
      enchantmentId: 'sharp',
      enchantmentIds: ['sharp', 'lucky']
    })
  })

  it('clears the legacy enchantmentId field when enchantments are empty', () => {
    const equipment: EnchantableEquipmentState = {
      defId: 'wooden_stick',
      enchantmentId: 'sharp',
      enchantmentIds: ['sharp']
    }

    expect(applyEquipmentEnchantments(equipment, [])).toEqual({
      defId: 'wooden_stick',
      enchantmentId: null,
      enchantmentIds: []
    })
  })

  it('does not mutate the original equipment object or source ids', () => {
    const equipment: EnchantableEquipmentState = { defId: 'wooden_stick', enchantmentId: 'sharp', enchantmentIds: ['sharp'] }
    const enchantmentIds = ['lucky']

    const updated = applyEquipmentEnchantments(equipment, enchantmentIds)
    enchantmentIds.push('fierce')

    expect(updated).toEqual({ defId: 'wooden_stick', enchantmentId: 'lucky', enchantmentIds: ['lucky'] })
    expect(equipment).toEqual({ defId: 'wooden_stick', enchantmentId: 'sharp', enchantmentIds: ['sharp'] })
  })

  it('filters weapon enchantment ids to avoid double-counting combat stats as equipment effects', () => {
    const enchantmentIds = ['sharp', 'scholar', 'swift', 'precise', 'frugal']

    expect(filterEquipmentEffectEnchantmentIds('weapon', enchantmentIds)).toEqual(['scholar', 'swift', 'frugal'])
    expect(filterEquipmentEffectEnchantmentIds('ring', enchantmentIds)).toEqual(enchantmentIds)
    expect(filterEquipmentEffectEnchantmentIds('hat', enchantmentIds)).toEqual(enchantmentIds)
    expect(filterEquipmentEffectEnchantmentIds('shoe', enchantmentIds)).toEqual(enchantmentIds)
  })

  it('creates random enchantment operation results from cost and money', () => {
    expect(createRandomEnchantmentResult('武器', { id: 'sharp', name: '锋利', cost: 1340 }, 1000)).toEqual({
      success: false,
      message: '铜钱不足（需要1340文）。',
      enchantmentId: 'sharp',
      cost: 1340
    })

    expect(createRandomEnchantmentResult('武器', { id: 'sharp', name: '锋利', cost: 1340 }, 1340)).toEqual({
      success: true,
      message: '附魔完成：锋利。',
      enchantmentId: 'sharp',
      enchantmentIds: ['sharp'],
      cost: 1340
    })

    expect(createRandomEnchantmentResult('戒指', { id: '', cost: 0 }, 0, false)).toEqual({
      success: false,
      message: '无效戒指。'
    })
  })

  it('calculates disenchant cost and operation results', () => {
    expect(calculateDisenchantCost(5000, [1340, 7800])).toBe(1024)

    expect(createDisenchantResult('武器', [], 5000, [], 10000)).toEqual({
      success: false,
      message: '这件武器没有附魔。'
    })

    expect(createDisenchantResult('武器', ['sharp', 'lucky'], 5000, [1340, 7800], 1000)).toEqual({
      success: false,
      message: '铜钱不足（需要1024文）。',
      cost: 1024
    })

    expect(createDisenchantResult('武器', ['sharp', 'lucky'], 5000, [1340, 7800], 1024)).toEqual({
      success: true,
      message: '附魔已祛除。',
      enchantmentIds: [],
      cost: 1024
    })
  })

  it('creates customized enchantment operation results', () => {
    expect(createCustomizeEnchantmentsResult('武器', [], 0, 10000)).toEqual({
      success: false,
      message: '请至少选择一种附魔。'
    })

    expect(createCustomizeEnchantmentsResult('武器', ['sharp', 'lucky'], 91400, 1000)).toEqual({
      success: false,
      message: '铜钱不足（需要91400文）。',
      cost: 91400
    })

    const enchantmentIds = ['sharp', 'lucky']
    const result = createCustomizeEnchantmentsResult('武器', enchantmentIds, 91400, 91400)
    enchantmentIds.push('fierce')

    expect(result).toEqual({
      success: true,
      message: '定制附魔完成，共2条附魔。',
      enchantmentIds: ['sharp', 'lucky'],
      cost: 91400
    })
  })
})
