import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  EQUIPMENT_SET_DEFINITIONS as LEGACY_EQUIPMENT_SETS,
  type EquipmentSetDef as LegacyEquipmentSetDef
} from '@/data/equipmentSetDefinitions'
import { EQUIPMENT_SETS, getEquipmentSets, getSetByPieceId } from '@/data/equipmentSets'
import {
  getOfficialEquipmentSetByPieceId,
  getOfficialEquipmentSetDef,
  getOfficialEquipmentSetDefs,
  getOfficialEquipmentSetsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { EquipmentSetDefSchema, type EquipmentSetDef as EquipmentSetContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useInventoryStore } from '@/stores/useInventoryStore'
import validEquipmentSets from '../fixtures/mods/minimal-valid-package/data/equipment-sets.json'

const localId = (id: string): string => id.slice(id.indexOf(':') + 1)

const normalizeLegacySet = (set: LegacyEquipmentSetDef): LegacyEquipmentSetDef => ({
  ...set,
  pieces: { ...set.pieces },
  bonuses: set.bonuses.map(bonus => ({
    ...bonus,
    effects: bonus.effects.map(effect => ({ ...effect }))
  }))
})

const expectedEquipmentSetContentDef = (set: LegacyEquipmentSetDef): EquipmentSetContentDef => ({
  id: toOfficialContentId(set.id),
  name: { key: `taoyuan.equipment_set.${set.id}.name`, fallback: set.name },
  description: { key: `taoyuan.equipment_set.${set.id}.description`, fallback: set.description },
  pieces: {
    ...(set.pieces.weapon ? { weapon: toOfficialContentId(set.pieces.weapon) } : {}),
    ring: toOfficialContentId(set.pieces.ring),
    hat: toOfficialContentId(set.pieces.hat),
    shoe: toOfficialContentId(set.pieces.shoe)
  },
  bonuses: set.bonuses.map(bonus => ({
    count: bonus.count,
    effects: bonus.effects.map(effect => ({ ...effect })),
    description: { key: `taoyuan.equipment_set.${set.id}.bonus.${bonus.count}`, fallback: bonus.description }
  }))
})

const normalizeContentSet = (set: Readonly<EquipmentSetContentDef>) => ({
  id: localId(set.id),
  name: set.name.fallback,
  description: set.description.fallback,
  pieces: {
    ...(set.pieces.weapon ? { weapon: localId(set.pieces.weapon) } : {}),
    ring: localId(set.pieces.ring),
    hat: localId(set.pieces.hat),
    shoe: localId(set.pieces.shoe)
  },
  bonuses: set.bonuses.map(bonus => ({
    count: bonus.count,
    effects: bonus.effects.map(effect => ({ ...effect })),
    description: bonus.description.fallback
  }))
})

describe('equipment set registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external equipment set JSON before registration', () => {
    const externalEquipmentSets: unknown = validEquipmentSets
    const result = validateUnknown(Type.Array(EquipmentSetDefSchema), externalEquipmentSets, {
      stage: 'test.equipment-sets'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid equipment set shapes and effect fields', () => {
    const base = validEquipmentSets[0]!
    const invalidEquipmentSets: unknown = [
      { ...base, pieces: { ...base.pieces, ring: 'not namespaced' } },
      { ...base, bonuses: [{ ...base.bonuses[0], count: 1 }] },
      { ...base, bonuses: [{ ...base.bonuses[0], effects: [] }] },
      { ...base, bonuses: [{ ...base.bonuses[0], effects: [{ type: 'unknown_effect', value: 1 }] }] },
      { ...base, name: { key: '', fallback: 'Broken' } },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(EquipmentSetDefSchema), invalidEquipmentSets, {
      stage: 'test.equipment-sets.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/pieces/ring',
        '/1/bonuses/0/count',
        '/2/bonuses/0/effects',
        '/3/bonuses/0/effects/0/type',
        '/4/name/key',
        '/5/extra'
      ]))
    }
  })

  it('registers all equipment sets in legacy order with equivalent fields', () => {
    expect(getOfficialEquipmentSetDefs()).toHaveLength(LEGACY_EQUIPMENT_SETS.length)
    expect(getOfficialEquipmentSetDefs().map(set => set.id)).toEqual(
      LEGACY_EQUIPMENT_SETS.map(set => toOfficialContentId(set.id))
    )
    expect(getOfficialEquipmentSetDefs().map(normalizeContentSet)).toEqual(
      LEGACY_EQUIPMENT_SETS.map(normalizeLegacySet)
    )
    expect(getOfficialEquipmentSetsAsLegacy().map(normalizeLegacySet)).toEqual(
      LEGACY_EQUIPMENT_SETS.map(normalizeLegacySet)
    )
    expect(getEquipmentSets().map(normalizeLegacySet)).toEqual(LEGACY_EQUIPMENT_SETS.map(normalizeLegacySet))
    expect(EQUIPMENT_SETS).toBe(LEGACY_EQUIPMENT_SETS)

    for (const set of LEGACY_EQUIPMENT_SETS) {
      expect(getOfficialEquipmentSetDef(set.id)).toEqual(expectedEquipmentSetContentDef(set))
      expect(getOfficialEquipmentSetDef(toOfficialContentId(set.id))).toBe(getOfficialEquipmentSetDef(set.id))
    }
  })

  it('keeps getSetByPieceId registry-backed and compatible', () => {
    for (const set of LEGACY_EQUIPMENT_SETS) {
      for (const pieceId of Object.values(set.pieces)) {
        if (!pieceId) continue
        const firstLegacyMatch = LEGACY_EQUIPMENT_SETS.find(candidate =>
          Object.values(candidate.pieces).some(candidatePieceId => candidatePieceId === pieceId)
        )!
        expect(getOfficialEquipmentSetByPieceId(pieceId)).toEqual(normalizeLegacySet(firstLegacyMatch))
        expect(getOfficialEquipmentSetByPieceId(toOfficialContentId(pieceId))).toEqual(normalizeLegacySet(firstLegacyMatch))
        expect(getSetByPieceId(pieceId)).toEqual(normalizeLegacySet(firstLegacyMatch))
      }
    }

    expect(getOfficialEquipmentSetDef('missing_equipment_set')).toBeUndefined()
    expect(getOfficialEquipmentSetByPieceId('missing_piece')).toBeUndefined()
    expect(getSetByPieceId('missing_piece')).toBeUndefined()
  })

  it('supports duplicate ID rejection and read-only registry entries', () => {
    const minerSet = getOfficialEquipmentSetDef('miner_set')
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<EquipmentSetContentDef>(toOfficialRegistryTypeId('equipment_set'))

    expect(Object.isFrozen(minerSet)).toBe(true)
    expect(Object.isFrozen(minerSet?.name)).toBe(true)
    expect(Object.isFrozen(minerSet?.pieces)).toBe(true)
    expect(Object.isFrozen(minerSet?.bonuses)).toBe(true)
    expect(Object.isFrozen(minerSet?.bonuses[0]?.effects[0])).toBe(true)
    expect(() => registry.register(OFFICIAL_PACKAGE_ID, expectedEquipmentSetContentDef(LEGACY_EQUIPMENT_SETS[0]!)))
      .toThrow(RegistryError)
  })

  it('reports missing equipment piece item references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<EquipmentSetContentDef>(toOfficialRegistryTypeId('equipment_set'))
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('invalid_equipment_set'),
      name: { key: 'test.equipment-set.invalid.name', fallback: 'Invalid Set' },
      description: { key: 'test.equipment-set.invalid.description', fallback: 'Invalid set' },
      pieces: {
        ring: toOfficialContentId('missing_set_ring'),
        hat: toOfficialContentId('miner_helmet'),
        shoe: toOfficialContentId('miner_boots')
      },
      bonuses: [
        {
          count: 2,
          effects: [{ type: 'ore_bonus', value: 1 }],
          description: { key: 'test.equipment-set.invalid.bonus.2', fallback: 'Invalid bonus' }
        }
      ]
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.contentId === toOfficialContentId('missing_set_ring')
    )

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_set_ring'),
        fieldPath: '/pieces/ring'
      })
    ])
  })

  it('keeps inventory set bonuses and summaries registry-backed', () => {
    const inventoryStore = useInventoryStore()

    inventoryStore.addRing('miners_ring')
    inventoryStore.addHat('miner_helmet')
    inventoryStore.addShoe('miner_boots')
    expect(inventoryStore.equipRing(0, 0)).toBe(true)
    expect(inventoryStore.equipHat(0)).toBe(true)
    expect(inventoryStore.equipShoe(0)).toBe(true)

    expect(inventoryStore.activeSets).toEqual([
      {
        id: 'miner_set',
        name: '矿工套装',
        description: '专业矿工的标准装备',
        equippedCount: 3,
        bonuses: [
          { count: 2, description: '矿石加成+1', active: true },
          { count: 3, description: '采矿体力消耗-10%', active: true }
        ]
      }
    ])
    expect(inventoryStore.getEquipmentBonus('ore_bonus')).toBe(2)
    expect(inventoryStore.getEquipmentBonus('mining_stamina')).toBeCloseTo(0.47)
  })
})


