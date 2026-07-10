import { describe, expect, it } from 'vitest'
import {
  countActiveEquipmentSetPieces,
  createActiveEquipmentSetSummaries,
  getActiveEquipmentSetBonuses,
  sumEquipmentBonus,
  type EquipmentSetRef
} from '@/domain/inventory/equipmentBonuses'

const miningSet: EquipmentSetRef = {
  id: 'miner',
  name: 'Miner',
  description: 'Mining set',
  pieces: {
    weapon: 'pickaxe_blade',
    ring: 'miners_ring',
    hat: 'miner_hat',
    shoe: 'miner_boots'
  },
  bonuses: [
    { count: 2, effects: [{ type: 'ore_bonus', value: 1 }], description: 'ore +1' },
    { count: 3, effects: [{ type: 'mining_stamina', value: 0.1 }], description: 'stamina +10%' },
    { count: 4, effects: [{ type: 'attack_bonus', value: 5 }], description: 'attack +5' }
  ]
}

describe('inventory equipment bonus rules', () => {
  it('sums base equipment, enchantment, weapon functional enchantment, and set bonuses', () => {
    expect(
      sumEquipmentBonus('attack_bonus', {
        rings: [
          {
            baseEffects: [{ type: 'attack_bonus', value: 3 }],
            enchantmentEffects: [{ type: 'attack_bonus', value: 2 }]
          },
          {
            baseEffects: [{ type: 'ore_bonus', value: 1 }],
            enchantmentEffects: [{ type: 'attack_bonus', value: 1 }]
          }
        ],
        hat: {
          baseEffects: [{ type: 'attack_bonus', value: 4 }]
        },
        shoe: {
          enchantmentEffects: [{ type: 'attack_bonus', value: 6 }]
        },
        weaponEnchantmentEffects: [
          { type: 'attack_bonus', value: 9 },
          { type: 'crit_rate_bonus', value: 0.1 }
        ],
        setBonuses: [{ type: 'attack_bonus', value: 5 }]
      })
    ).toBe(30)
  })

  it('counts duplicate matching rings as one set piece', () => {
    expect(
      countActiveEquipmentSetPieces(miningSet, {
        weaponDefId: 'pickaxe_blade',
        ringDefIds: ['miners_ring', 'miners_ring'],
        hatDefId: 'miner_hat',
        shoeDefId: 'plain_boots'
      })
    ).toBe(3)
  })

  it('returns active set bonuses by threshold', () => {
    const bonuses = getActiveEquipmentSetBonuses([miningSet], {
      ringDefIds: ['miners_ring'],
      hatDefId: 'miner_hat',
      shoeDefId: 'miner_boots'
    })

    expect(bonuses).toEqual([
      { type: 'ore_bonus', value: 1 },
      { type: 'mining_stamina', value: 0.1 }
    ])
  })

  it('creates UI summaries only for partially active sets', () => {
    expect(
      createActiveEquipmentSetSummaries([miningSet], {
        ringDefIds: ['miners_ring'],
        hatDefId: 'miner_hat'
      })
    ).toEqual([
      {
        id: 'miner',
        name: 'Miner',
        description: 'Mining set',
        equippedCount: 2,
        bonuses: [
          { count: 2, description: 'ore +1', active: true },
          { count: 3, description: 'stamina +10%', active: false },
          { count: 4, description: 'attack +5', active: false }
        ]
      }
    ])

    expect(createActiveEquipmentSetSummaries([miningSet], {})).toEqual([])
  })
})
