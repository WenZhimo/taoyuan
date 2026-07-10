import { describe, expect, it } from 'vitest'
import { createEquipmentCraftingPlan, type CraftableEquipmentDef } from '@/domain/inventory/equipmentCrafting'

const craftableRing: CraftableEquipmentDef = {
  id: 'quartz_ring',
  name: '石英明环',
  recipe: [
    { itemId: 'copper_bar', quantity: 2 },
    { itemId: 'quartz', quantity: 2 }
  ],
  recipeMoney: 200
}

describe('inventory equipment crafting rules', () => {
  it('rejects missing or non-craftable equipment definitions', () => {
    expect(createEquipmentCraftingPlan(undefined, '戒指', 999, () => 999, () => undefined)).toEqual({
      success: false,
      message: '该戒指无法合成。',
      materials: [],
      moneyCost: 0
    })

    expect(
      createEquipmentCraftingPlan({ ...craftableRing, recipe: null }, '戒指', 999, () => 999, () => undefined)
    ).toEqual({
      success: false,
      message: '该戒指无法合成。',
      materials: [],
      moneyCost: 0
    })
  })

  it('reports the first missing material with display name fallback', () => {
    const result = createEquipmentCraftingPlan(
      craftableRing,
      '戒指',
      999,
      itemId => (itemId === 'copper_bar' ? 2 : 1),
      itemId => (itemId === 'quartz' ? '石英' : undefined)
    )

    expect(result).toEqual({
      success: false,
      message: '材料不足：石英。',
      materials: [],
      moneyCost: 0
    })
  })

  it('checks money after materials and returns the required cost', () => {
    expect(createEquipmentCraftingPlan(craftableRing, '戒指', 199, () => 999, () => undefined)).toEqual({
      success: false,
      message: '铜钱不足（需要200文）。',
      materials: [],
      moneyCost: 200
    })
  })

  it('returns a successful immutable consumption plan', () => {
    const result = createEquipmentCraftingPlan(craftableRing, '戒指', 200, () => 999, () => undefined)
    craftableRing.recipe![0]!.quantity = 99

    expect(result).toEqual({
      success: true,
      message: '合成了石英明环！',
      materials: [
        { itemId: 'copper_bar', quantity: 2 },
        { itemId: 'quartz', quantity: 2 }
      ],
      moneyCost: 200
    })
  })
})
