import { describe, expect, it } from 'vitest'
import {
  createEquipmentPresetApplicationMessage,
  createEquipmentPresetState,
  deleteEquipmentPresetState,
  planEquipmentPresetApplication,
  renameEquipmentPresetState,
  saveCurrentEquipmentToPresetState,
  type EquipmentPresetState
} from '@/domain/inventory/equipmentPresets'

const preset: EquipmentPresetState = {
  id: 'combat',
  name: '战斗方案',
  weaponDefId: null,
  ringSlot1DefId: null,
  ringSlot2DefId: null,
  hatDefId: null,
  shoeDefId: null
}

describe('inventory equipment preset rules', () => {
  it('creates empty presets until the max count', () => {
    expect(createEquipmentPresetState([preset], '采矿方案', 'mining')).toEqual({
      success: true,
      presets: [
        preset,
        {
          id: 'mining',
          name: '采矿方案',
          weaponDefId: null,
          ringSlot1DefId: null,
          ringSlot2DefId: null,
          hatDefId: null,
          shoeDefId: null
        }
      ]
    })

    expect(createEquipmentPresetState([preset], '满员方案', 'full', 1)).toEqual({
      success: false,
      presets: [preset]
    })
  })

  it('deletes presets and clears the active id when needed', () => {
    expect(deleteEquipmentPresetState([preset], 'combat', 'combat')).toEqual({
      presets: [],
      activePresetId: null
    })
    expect(deleteEquipmentPresetState([preset], 'other', 'missing')).toEqual({
      presets: [preset],
      activePresetId: 'other'
    })
  })

  it('renames presets while preserving the old name for blank input', () => {
    expect(renameEquipmentPresetState([preset], 'combat', '  新方案  ')[0]?.name).toBe('新方案')
    expect(renameEquipmentPresetState([preset], 'combat', '   ')[0]?.name).toBe('战斗方案')
  })

  it('saves the current equipment selection into the target preset', () => {
    expect(
      saveCurrentEquipmentToPresetState([preset], 'combat', {
        weaponDefId: 'sword',
        ringSlot1DefId: 'ring_a',
        ringSlot2DefId: null,
        hatDefId: 'hat_a',
        shoeDefId: 'shoe_a'
      })
    ).toEqual([
      {
        id: 'combat',
        name: '战斗方案',
        weaponDefId: 'sword',
        ringSlot1DefId: 'ring_a',
        ringSlot2DefId: null,
        hatDefId: 'hat_a',
        shoeDefId: 'shoe_a'
      }
    ])
  })

  it('plans equipment preset application by matching owned equipment indices', () => {
    expect(
      planEquipmentPresetApplication(
        {
          id: 'full',
          name: '全套方案',
          weaponDefId: 'iron_blade',
          ringSlot1DefId: 'ruby_ring',
          ringSlot2DefId: 'emerald_ring',
          hatDefId: 'straw_hat',
          shoeDefId: 'leather_boots'
        },
        {
          weapons: [{ defId: 'wooden_stick' }, { defId: 'iron_blade' }],
          rings: [{ defId: 'ruby_ring' }, { defId: 'emerald_ring' }],
          hats: [{ defId: 'straw_hat' }],
          shoes: [{ defId: 'leather_boots' }]
        }
      )
    ).toEqual({
      weaponIndex: 1,
      ringSlot1Index: 0,
      ringSlot2Index: 1,
      hatIndex: 0,
      shoeIndex: 0,
      missingLabels: []
    })
  })

  it('plans unequip operations and missing labels for unavailable equipment', () => {
    expect(
      planEquipmentPresetApplication(
        {
          id: 'partial',
          name: '残缺方案',
          weaponDefId: 'missing_sword',
          ringSlot1DefId: null,
          ringSlot2DefId: 'missing_ring',
          hatDefId: null,
          shoeDefId: 'missing_shoes'
        },
        {
          weapons: [{ defId: 'wooden_stick' }],
          rings: [{ defId: 'ruby_ring' }],
          hats: [{ defId: 'straw_hat' }],
          shoes: []
        }
      )
    ).toEqual({
      weaponIndex: undefined,
      ringSlot1Index: null,
      ringSlot2Index: undefined,
      hatIndex: null,
      shoeIndex: undefined,
      missingLabels: ['武器', '戒指2', '鞋子']
    })
  })

  it('treats duplicated ring preset slots as an invalid second ring', () => {
    expect(
      planEquipmentPresetApplication(
        {
          id: 'legacy',
          name: '旧方案',
          weaponDefId: null,
          ringSlot1DefId: 'ruby_ring',
          ringSlot2DefId: 'ruby_ring',
          hatDefId: null,
          shoeDefId: null
        },
        {
          weapons: [],
          rings: [{ defId: 'ruby_ring' }],
          hats: [],
          shoes: []
        }
      )
    ).toEqual({
      weaponIndex: undefined,
      ringSlot1Index: 0,
      ringSlot2Index: null,
      hatIndex: null,
      shoeIndex: null,
      missingLabels: ['戒指2（不可与槽1相同）']
    })
  })

  it('creates equipment preset application messages', () => {
    expect(createEquipmentPresetApplicationMessage('全套方案', [])).toBe('已应用方案「全套方案」。')
    expect(createEquipmentPresetApplicationMessage('残缺方案', ['武器', '鞋子'])).toBe(
      '已应用方案「残缺方案」，但武器、鞋子已不在背包中。'
    )
  })
})
