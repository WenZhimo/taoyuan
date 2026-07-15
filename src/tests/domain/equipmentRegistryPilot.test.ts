import { Type } from '@sinclair/typebox'
import { describe, expect, it } from 'vitest'
import {
  CRAFTABLE_RINGS,
  RINGS as LEGACY_RINGS,
  getRingById
} from '@/data/rings'
import {
  CRAFTABLE_HATS,
  HATS as LEGACY_HATS,
  SHOP_HATS,
  getHatById
} from '@/data/hats'
import {
  getOfficialEquipmentDef,
  getOfficialEquipmentDefs,
  getOfficialHatById,
  getOfficialHatDefs,
  getOfficialHatsAsLegacy,
  getOfficialRingById,
  getOfficialRingDefs,
  getOfficialRingsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { EquipmentDefSchema, type EquipmentDef as EquipmentContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import type { HatDef as LegacyHatDef, RingDef as LegacyRingDef } from '@/types'
import validEquipment from '../fixtures/mods/minimal-valid-package/data/equipment.json'

const localId = (id: string): string => id.slice(id.indexOf(':') + 1)

const expectedRingContentDef = (ring: LegacyRingDef): EquipmentContentDef => ({
  id: toOfficialContentId(ring.id),
  kind: 'ring',
  name: { key: `taoyuan.equipment.ring.${ring.id}.name`, fallback: ring.name },
  description: { key: `taoyuan.equipment.ring.${ring.id}.description`, fallback: ring.description },
  effects: ring.effects.map(effect => ({ ...effect })),
  recipe: ring.recipe
    ? ring.recipe.map(material => ({
        itemId: toOfficialContentId(material.itemId),
        quantity: material.quantity
      }))
    : null,
  recipeMoney: ring.recipeMoney,
  obtainSource: { key: `taoyuan.equipment.ring.${ring.id}.obtainSource`, fallback: ring.obtainSource },
  sellPrice: ring.sellPrice
})

const expectedHatContentDef = (hat: LegacyHatDef): EquipmentContentDef => ({
  id: toOfficialContentId(hat.id),
  kind: 'hat',
  name: { key: `taoyuan.equipment.hat.${hat.id}.name`, fallback: hat.name },
  description: { key: `taoyuan.equipment.hat.${hat.id}.description`, fallback: hat.description },
  effects: hat.effects.map(effect => ({ ...effect })),
  shopPrice: hat.shopPrice,
  recipe: hat.recipe
    ? hat.recipe.map(material => ({
        itemId: toOfficialContentId(material.itemId),
        quantity: material.quantity
      }))
    : null,
  recipeMoney: hat.recipeMoney,
  obtainSource: { key: `taoyuan.equipment.hat.${hat.id}.obtainSource`, fallback: hat.obtainSource },
  sellPrice: hat.sellPrice
})

const normalizeLegacyRing = (ring: LegacyRingDef): LegacyRingDef => ({
  ...ring,
  effects: ring.effects.map(effect => ({ ...effect })),
  recipe: ring.recipe ? ring.recipe.map(material => ({ ...material })) : null
})

const normalizeLegacyHat = (hat: LegacyHatDef): LegacyHatDef => ({
  ...hat,
  effects: hat.effects.map(effect => ({ ...effect })),
  recipe: hat.recipe ? hat.recipe.map(material => ({ ...material })) : null
})

const normalizeContentRing = (ring: Readonly<EquipmentContentDef>): LegacyRingDef => ({
  id: localId(ring.id),
  name: ring.name.fallback,
  description: ring.description.fallback,
  effects: ring.effects.map(effect => ({ ...effect })),
  recipe: ring.recipe
    ? ring.recipe.map(material => ({
        itemId: localId(material.itemId),
        quantity: material.quantity
      }))
    : null,
  recipeMoney: ring.recipeMoney,
  obtainSource: ring.obtainSource.fallback,
  sellPrice: ring.sellPrice
})

const normalizeContentHat = (hat: Readonly<EquipmentContentDef>): LegacyHatDef => ({
  id: localId(hat.id),
  name: hat.name.fallback,
  description: hat.description.fallback,
  effects: hat.effects.map(effect => ({ ...effect })),
  shopPrice: hat.shopPrice ?? null,
  recipe: hat.recipe
    ? hat.recipe.map(material => ({
        itemId: localId(material.itemId),
        quantity: material.quantity
      }))
    : null,
  recipeMoney: hat.recipeMoney,
  obtainSource: hat.obtainSource.fallback,
  sellPrice: hat.sellPrice
})

describe('equipment registry pilot', () => {
  it('validates external equipment JSON before registration', () => {
    const externalEquipment: unknown = validEquipment
    const result = validateUnknown(Type.Array(EquipmentDefSchema), externalEquipment, {
      stage: 'test.equipment'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid equipment shapes and numeric bounds', () => {
    const base = validEquipment[0]!
    const invalidEquipment: unknown = [
      { ...base, kind: 'shoe' },
      { ...base, id: 'not namespaced' },
      { ...base, effects: [{ type: 'unknown_effect', value: 1 }] },
      { ...base, recipe: [{ itemId: 'example_mod:test_item', quantity: 0 }] },
      { ...base, recipeMoney: -1 },
      { ...base, sellPrice: -1 },
      { ...base, shopPrice: -1 },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(EquipmentDefSchema), invalidEquipment, {
      stage: 'test.equipment.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/kind',
        '/1/id',
        '/2/effects/0/type',
        '/3/recipe/0/quantity',
        '/4/recipeMoney',
        '/5/sellPrice',
        '/6/shopPrice',
        '/7/extra'
      ]))
    }
  })

  it('registers all legacy rings in order with equivalent fields', () => {
    expect(getOfficialEquipmentDefs()).toHaveLength(LEGACY_RINGS.length + LEGACY_HATS.length)
    expect(getOfficialRingDefs().map(ring => ring.id)).toEqual(
      LEGACY_RINGS.map(ring => toOfficialContentId(ring.id))
    )
    expect(getOfficialRingDefs().map(normalizeContentRing)).toEqual(
      LEGACY_RINGS.map(normalizeLegacyRing)
    )
    expect(getOfficialRingsAsLegacy().map(normalizeLegacyRing)).toEqual(
      LEGACY_RINGS.map(normalizeLegacyRing)
    )
    expect(CRAFTABLE_RINGS.map(ring => ring.id)).toEqual(
      LEGACY_RINGS.filter(ring => ring.recipe !== null).map(ring => ring.id)
    )

    for (const ring of LEGACY_RINGS) {
      expect(getOfficialEquipmentDef(ring.id)).toEqual(expectedRingContentDef(ring))
      expect(getOfficialEquipmentDef(toOfficialContentId(ring.id))).toBe(getOfficialEquipmentDef(ring.id))
      expect(getOfficialRingById(ring.id)).toEqual(normalizeLegacyRing(ring))
      expect(getOfficialRingById(toOfficialContentId(ring.id))).toEqual(normalizeLegacyRing(ring))
      expect(getRingById(ring.id)).toEqual(normalizeLegacyRing(ring))
    }
  })

  it('registers all legacy hats in order with equivalent fields', () => {
    expect(getOfficialHatDefs().map(hat => hat.id)).toEqual(
      LEGACY_HATS.map(hat => toOfficialContentId(hat.id))
    )
    expect(getOfficialHatDefs().map(normalizeContentHat)).toEqual(
      LEGACY_HATS.map(normalizeLegacyHat)
    )
    expect(getOfficialHatsAsLegacy().map(normalizeLegacyHat)).toEqual(
      LEGACY_HATS.map(normalizeLegacyHat)
    )
    expect(SHOP_HATS.map(hat => hat.id)).toEqual(
      LEGACY_HATS.filter(hat => hat.shopPrice !== null).map(hat => hat.id)
    )
    expect(CRAFTABLE_HATS.map(hat => hat.id)).toEqual(
      LEGACY_HATS.filter(hat => hat.recipe !== null).map(hat => hat.id)
    )

    for (const hat of LEGACY_HATS) {
      expect(getOfficialEquipmentDef(hat.id)).toEqual(expectedHatContentDef(hat))
      expect(getOfficialEquipmentDef(toOfficialContentId(hat.id))).toBe(getOfficialEquipmentDef(hat.id))
      expect(getOfficialHatById(hat.id)).toEqual(normalizeLegacyHat(hat))
      expect(getOfficialHatById(toOfficialContentId(hat.id))).toEqual(normalizeLegacyHat(hat))
      expect(getHatById(hat.id)).toEqual(normalizeLegacyHat(hat))
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const jadeRing = getOfficialEquipmentDef('jade_guard_ring')
    const strawHat = getOfficialEquipmentDef('straw_hat')
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<EquipmentContentDef>(toOfficialRegistryTypeId('equipment'))

    expect(getOfficialEquipmentDef('missing_equipment')).toBeUndefined()
    expect(getOfficialRingById('missing_ring')).toBeUndefined()
    expect(getOfficialHatById('missing_hat')).toBeUndefined()
    expect(getRingById('missing_ring')).toBeUndefined()
    expect(getHatById('missing_hat')).toBeUndefined()
    expect(Object.isFrozen(jadeRing)).toBe(true)
    expect(Object.isFrozen(jadeRing?.effects)).toBe(true)
    expect(Object.isFrozen(jadeRing?.effects[0])).toBe(true)
    expect(Object.isFrozen(jadeRing?.recipe)).toBe(true)
    expect(Object.isFrozen(jadeRing?.recipe?.[0])).toBe(true)
    expect(Object.isFrozen(strawHat)).toBe(true)
    expect(Object.isFrozen(strawHat?.effects)).toBe(true)
    expect(Object.isFrozen(strawHat?.effects[0])).toBe(true)
    expect(() => registry.register(OFFICIAL_PACKAGE_ID, expectedRingContentDef(LEGACY_RINGS[0]!)))
      .toThrow(RegistryError)
  })

  it('reports missing equipment item and recipe material references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<EquipmentContentDef>(toOfficialRegistryTypeId('equipment'))
    const missingEquipmentItem = toOfficialContentId('missing_equipment_item')
    const missingMaterial = toOfficialContentId('missing_equipment_material')

    registry.register(OFFICIAL_PACKAGE_ID, {
      ...expectedRingContentDef(LEGACY_RINGS[0]!),
      id: missingEquipmentItem,
      recipe: [
        {
          itemId: missingMaterial,
          quantity: 1
        }
      ]
    })

    const diagnostics = validateRegistrySemantics(registrySet)

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingEquipmentItem,
        fieldPath: '/id'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingMaterial,
        fieldPath: '/recipe/0/itemId'
      })
    ]))
  })
})
