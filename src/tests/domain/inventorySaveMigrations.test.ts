import { describe, expect, it } from 'vitest'
import {
  clampLoadedEquippedIndex,
  migrateSavedActivePresetId,
  migrateSavedCapacity,
  migrateSavedEquipmentPresets,
  migrateSavedInventoryItems,
  migratePendingToolUpgrades,
  migrateSavedHats,
  migrateSavedRings,
  migrateSavedShoes,
  migrateSavedTools,
  migrateSavedWeapons,
  normalizeSavedEquipmentList
} from '@/domain/inventory/saveMigrations'

const normalizeEnchantmentIds = (input: string | string[] | null | undefined): string[] => {
  if (!input) return []
  const raw = Array.isArray(input) ? input : [input]
  return raw.filter(id => id === 'sharp' || id === 'lucky')
}

describe('inventory save migration rules', () => {
  it('filters unknown saved inventory items and preserves valid item data', () => {
    const saved = [
      { itemId: 'wood', quantity: 5, quality: 'normal' as const, locked: true },
      { itemId: 'missing_item', quantity: 1, quality: 'fine' as const }
    ]

    const result = migrateSavedInventoryItems(saved, itemId => itemId === 'wood')
    result[0]!.quantity = 99

    expect(result).toEqual([{ itemId: 'wood', quantity: 99, quality: 'normal', locked: true }])
    expect(saved[0]!.quantity).toBe(5)
  })

  it('migrates simple inventory save fields with fallbacks and cloned presets', () => {
    const presets = [
      {
        id: 'preset-1',
        name: 'Preset',
        weaponDefId: 'wooden_stick',
        ringSlot1DefId: null,
        ringSlot2DefId: null,
        hatDefId: null,
        shoeDefId: null
      }
    ]

    const migratedPresets = migrateSavedEquipmentPresets(presets)
    migratedPresets[0]!.name = 'Changed'

    expect(migrateSavedCapacity(undefined, 24)).toBe(24)
    expect(migrateSavedCapacity(40, 24)).toBe(40)
    expect(migrateSavedActivePresetId(undefined)).toBeNull()
    expect(migrateSavedActivePresetId('preset-1')).toBe('preset-1')
    expect(migratedPresets[0]!.name).toBe('Changed')
    expect(presets[0]!.name).toBe('Preset')
  })

  it('fills missing tools while preserving saved tools', () => {
    expect(migrateSavedTools([{ type: 'hoe', tier: 'iron' }])).toEqual([
      { type: 'hoe', tier: 'iron' },
      { type: 'wateringCan', tier: 'basic' },
      { type: 'pickaxe', tier: 'basic' },
      { type: 'fishingRod', tier: 'basic' },
      { type: 'scythe', tier: 'basic' },
      { type: 'axe', tier: 'basic' },
      { type: 'pan', tier: 'basic' }
    ])
  })

  it('normalizes saved equipment enchantment fields without mutating input', () => {
    const saved = [{ defId: 'ruby_ring', enchantmentId: 'sharp' }, { defId: 'lucky_ring', enchantmentIds: ['missing', 'lucky'] }]

    expect(normalizeSavedEquipmentList(saved, normalizeEnchantmentIds)).toEqual([
      { defId: 'ruby_ring', enchantmentId: 'sharp', enchantmentIds: ['sharp'] },
      { defId: 'lucky_ring', enchantmentId: 'lucky', enchantmentIds: ['lucky'] }
    ])
    expect(saved).toEqual([{ defId: 'ruby_ring', enchantmentId: 'sharp' }, { defId: 'lucky_ring', enchantmentIds: ['missing', 'lucky'] }])
  })

  it('migrates new and legacy weapon save shapes', () => {
    expect(
      migrateSavedWeapons(
        {
          ownedWeapons: [{ defId: 'iron_blade', enchantmentId: 'sharp' }],
          equippedWeaponIndex: 2
        },
        normalizeEnchantmentIds
      )
    ).toEqual({
      ownedWeapons: [{ defId: 'iron_blade', enchantmentId: 'sharp', enchantmentIds: ['sharp'] }],
      equippedWeaponIndex: 2
    })

    expect(migrateSavedWeapons({ weapon: { tier: 'copper' } }, normalizeEnchantmentIds)).toEqual({
      ownedWeapons: [{ defId: 'copper_sword', enchantmentId: null, enchantmentIds: [] }],
      equippedWeaponIndex: 0
    })

    expect(migrateSavedWeapons({ weapon: { tier: 'unknown' } }, normalizeEnchantmentIds).ownedWeapons[0]?.defId).toBe('wooden_stick')
  })

  it('filters pending tool upgrades to active valid entries', () => {
    expect(
      migratePendingToolUpgrades({
        pendingUpgrades: [
          { toolType: 'hoe', targetTier: 'iron', daysRemaining: 2 },
          { toolType: 'axe', targetTier: 'steel', daysRemaining: 0 },
          { toolType: 'pickaxe', daysRemaining: 1 }
        ]
      })
    ).toEqual([{ toolType: 'hoe', targetTier: 'iron', daysRemaining: 2 }])

    expect(migratePendingToolUpgrades({ pendingUpgrade: { toolType: 'axe', targetTier: 'steel', daysRemaining: 1 } })).toEqual([
      { toolType: 'axe', targetTier: 'steel', daysRemaining: 1 }
    ])
  })

  it('normalizes saved wearable gear and clamps invalid equipped indices', () => {
    expect(migrateSavedRings([{ defId: 'ruby_ring', enchantmentId: 'sharp' }], normalizeEnchantmentIds)).toEqual([
      { defId: 'ruby_ring', enchantmentId: 'sharp', enchantmentIds: ['sharp'] }
    ])
    expect(migrateSavedHats([{ defId: 'straw_hat', enchantmentIds: ['lucky'] }], normalizeEnchantmentIds)).toEqual([
      { defId: 'straw_hat', enchantmentId: 'lucky', enchantmentIds: ['lucky'] }
    ])
    expect(migrateSavedShoes([{ defId: 'leather_boots' }], normalizeEnchantmentIds)).toEqual([
      { defId: 'leather_boots', enchantmentId: null, enchantmentIds: [] }
    ])
    expect(clampLoadedEquippedIndex(2, 2)).toBe(-1)
    expect(clampLoadedEquippedIndex(1, 2)).toBe(1)
    expect(clampLoadedEquippedIndex(-1, 0)).toBe(-1)
  })
})
