import { describe, expect, it } from 'vitest'
import { sortEquipmentBySellPrice, sortRingsBySellPrice, sortWeaponsForInventory } from '@/domain/inventory/equipmentSorting'

describe('inventory equipment sorting rules', () => {
  it('sorts weapons by attack, enchantment attack bonus, then id while preserving equipped instance', () => {
    const wooden: { defId: string; enchantmentIds?: string[] } = { defId: 'wooden_stick' }
    const ironLucky: { defId: string; enchantmentIds?: string[] } = { defId: 'iron_blade', enchantmentIds: ['lucky'] }
    const ironSharp: { defId: string; enchantmentIds?: string[] } = { defId: 'iron_blade', enchantmentIds: ['sharp'] }
    const copper: { defId: string; enchantmentIds?: string[] } = { defId: 'copper_sword' }

    const result = sortWeaponsForInventory([wooden, ironLucky, ironSharp, copper], 1, weapon => ({
      attack: weapon.defId === 'iron_blade' ? 12 : weapon.defId === 'copper_sword' ? 8 : 3,
      enchantmentAttackBonus: weapon.enchantmentIds?.includes('sharp') ? 3 : 0
    }))

    expect(result.equipment).toEqual([ironSharp, ironLucky, copper, wooden])
    expect(result.equippedIndex).toBe(1)
  })

  it('sorts wearable equipment by sell price and id while preserving equipped index', () => {
    const equipment = [{ defId: 'cheap_hat' }, { defId: 'z_hat' }, { defId: 'a_hat' }]
    const prices: Record<string, number> = {
      cheap_hat: 10,
      z_hat: 100,
      a_hat: 100
    }

    const result = sortEquipmentBySellPrice(equipment, 1, item => prices[item.defId] ?? 0)

    expect(result.equipment).toEqual([{ defId: 'a_hat' }, { defId: 'z_hat' }, { defId: 'cheap_hat' }])
    expect(result.equippedIndex).toBe(1)
  })

  it('sorts rings while preserving both equipped slots independently', () => {
    const rings = [{ defId: 'cheap_ring' }, { defId: 'z_ring' }, { defId: 'a_ring' }]
    const prices: Record<string, number> = {
      cheap_ring: 10,
      z_ring: 100,
      a_ring: 100
    }

    const result = sortRingsBySellPrice(rings, 0, 1, ring => prices[ring.defId] ?? 0)

    expect(result.equipment).toEqual([{ defId: 'a_ring' }, { defId: 'z_ring' }, { defId: 'cheap_ring' }])
    expect(result.equippedSlot1).toBe(2)
    expect(result.equippedSlot2).toBe(1)
  })

  it('does not mutate source arrays or equipment objects', () => {
    const equipment = [{ defId: 'b', marker: 1 }, { defId: 'a', marker: 2 }]

    const result = sortEquipmentBySellPrice(equipment, -1, () => 0)
    result.equipment[0]!.marker = 99

    expect(equipment).toEqual([{ defId: 'b', marker: 1 }, { defId: 'a', marker: 2 }])
  })
})
