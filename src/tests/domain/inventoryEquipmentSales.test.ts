import { describe, expect, it } from 'vitest'
import {
  createEquipmentSaleMessage,
  getEquipmentSellPrice,
  planRingSale,
  planSingleSlotEquipmentSale,
  planWeaponSale,
  shiftEquippedIndexAfterSale
} from '@/domain/inventory/equipmentSales'

const weapons = [{ defId: 'wooden_stick' }, { defId: 'rusty_sword' }, { defId: 'iron_blade' }]

describe('inventory equipment sale rules', () => {
  it('shifts equipped indices after sold equipment is removed', () => {
    expect(shiftEquippedIndexAfterSale(2, 0)).toBe(1)
    expect(shiftEquippedIndexAfterSale(1, 1)).toBe(-1)
    expect(shiftEquippedIndexAfterSale(0, 2)).toBe(0)
    expect(shiftEquippedIndexAfterSale(-1, 0)).toBe(-1)
  })

  it('plans weapon sale restrictions before mutating inventory', () => {
    expect(planWeaponSale([{ defId: 'wooden_stick' }], 0, 0)).toEqual({
      success: false,
      message: '至少保留一把武器。',
      equipment: [{ defId: 'wooden_stick' }],
      equippedIndex: 0
    })

    expect(planWeaponSale(weapons, 1, 1)).toEqual({
      success: false,
      message: '不能卖出装备中的武器，请先切换。',
      equipment: weapons,
      equippedIndex: 1
    })

    expect(planWeaponSale(weapons, 9, 0)).toEqual({
      success: false,
      message: '无效索引。',
      equipment: weapons,
      equippedIndex: 0
    })
  })

  it('plans weapon sale and equipped index correction', () => {
    expect(planWeaponSale(weapons, 0, 2)).toEqual({
      success: true,
      sold: { defId: 'wooden_stick' },
      equipment: [{ defId: 'rusty_sword' }, { defId: 'iron_blade' }],
      equippedIndex: 1
    })
  })

  it('plans ring sale for two independent equipped slots', () => {
    const rings = [{ defId: 'ruby_ring' }, { defId: 'emerald_ring' }, { defId: 'lucky_ring' }]

    expect(planRingSale(rings, 1, 0, 2)).toEqual({
      success: true,
      sold: { defId: 'emerald_ring' },
      equipment: [{ defId: 'ruby_ring' }, { defId: 'lucky_ring' }],
      equippedSlot1: 0,
      equippedSlot2: 1
    })

    expect(planRingSale(rings, 0, 0, 2)).toMatchObject({
      success: true,
      equippedSlot1: -1,
      equippedSlot2: 1
    })
  })

  it('plans single-slot equipment sale for hats and shoes', () => {
    const hats = [{ defId: 'straw_hat' }, { defId: 'miner_hat' }]

    expect(planSingleSlotEquipmentSale(hats, 0, 1)).toEqual({
      success: true,
      sold: { defId: 'straw_hat' },
      equipment: [{ defId: 'miner_hat' }],
      equippedIndex: 0
    })

    expect(planSingleSlotEquipmentSale(hats, 9, 1)).toEqual({
      success: false,
      message: '无效索引。',
      equipment: hats,
      equippedIndex: 1
    })
  })

  it('creates equipment sale messages with fallback names', () => {
    expect(createEquipmentSaleMessage('铁剑', '武器', 1200)).toBe('卖出了铁剑，获得1200文。')
    expect(createEquipmentSaleMessage('', '戒指', 0)).toBe('卖出了戒指，获得0文。')
  })

  it('resolves sell price by equipment type through injected lookups', () => {
    const lookups = {
      getWeaponSellPrice: (equipment: { defId: string }) => (equipment.defId === 'iron_blade' ? 400 : 0),
      getRingSellPrice: (defId: string) => (defId === 'dragon_ring' ? 2500 : 0),
      getHatSellPrice: (defId: string) => (defId === 'dragon_helm' ? 4000 : 0),
      getShoeSellPrice: (defId: string) => (defId === 'dragon_scale_boots' ? 4000 : 0)
    }

    expect(getEquipmentSellPrice('weapon', { defId: 'iron_blade' }, lookups)).toBe(400)
    expect(getEquipmentSellPrice('ring', { defId: 'dragon_ring' }, lookups)).toBe(2500)
    expect(getEquipmentSellPrice('hat', { defId: 'dragon_helm' }, lookups)).toBe(4000)
    expect(getEquipmentSellPrice('shoe', { defId: 'dragon_scale_boots' }, lookups)).toBe(4000)
  })
})
