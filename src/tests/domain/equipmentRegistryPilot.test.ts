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
  CRAFTABLE_SHOES,
  SHOES as LEGACY_SHOES,
  SHOP_SHOES,
  getShoeById
} from '@/data/shoes'
import {
  SHOP_WEAPONS,
  WEAPONS as LEGACY_WEAPONS,
  getWeaponById
} from '@/data/weapons'
import {
  getOfficialEquipmentDef,
  getOfficialEquipmentDefs,
  getOfficialHatById,
  getOfficialHatDefs,
  getOfficialHatsAsLegacy,
  getOfficialShoeById,
  getOfficialShoeDefs,
  getOfficialShoesAsLegacy,
  getOfficialRingById,
  getOfficialRingDefs,
  getOfficialRingsAsLegacy,
  getOfficialWeaponById,
  getOfficialWeaponDefs,
  getOfficialWeaponsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { EquipmentDefSchema, type EquipmentDef as EquipmentContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import type { HatDef as LegacyHatDef, RingDef as LegacyRingDef, ShoeDef as LegacyShoeDef, WeaponDef as LegacyWeaponDef } from '@/types'
import validEquipment from '../fixtures/mods/minimal-valid-package/data/equipment.json'

const localId = (id: string): string => id.slice(id.indexOf(':') + 1)
type WearableEquipmentContentDef = Extract<EquipmentContentDef, { kind: 'ring' | 'hat' | 'shoe' }>
type WeaponEquipmentContentDef = Extract<EquipmentContentDef, { kind: 'weapon' }>

const expectedRingContentDef = (ring: LegacyRingDef): WearableEquipmentContentDef => ({
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

const expectedHatContentDef = (hat: LegacyHatDef): WearableEquipmentContentDef => ({
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

const expectedShoeContentDef = (shoe: LegacyShoeDef): WearableEquipmentContentDef => ({
  id: toOfficialContentId(shoe.id),
  kind: 'shoe',
  name: { key: `taoyuan.equipment.shoe.${shoe.id}.name`, fallback: shoe.name },
  description: { key: `taoyuan.equipment.shoe.${shoe.id}.description`, fallback: shoe.description },
  effects: shoe.effects.map(effect => ({ ...effect })),
  shopPrice: shoe.shopPrice,
  recipe: shoe.recipe
    ? shoe.recipe.map(material => ({
        itemId: toOfficialContentId(material.itemId),
        quantity: material.quantity
      }))
    : null,
  recipeMoney: shoe.recipeMoney,
  obtainSource: { key: `taoyuan.equipment.shoe.${shoe.id}.obtainSource`, fallback: shoe.obtainSource },
  sellPrice: shoe.sellPrice
})

const getExpectedWeaponSellPrice = (weapon: LegacyWeaponDef): number =>
  weapon.shopPrice ? Math.floor(weapon.shopPrice * 0.5) : weapon.attack * 15

const expectedWeaponContentDef = (weapon: LegacyWeaponDef): WeaponEquipmentContentDef => ({
  id: toOfficialContentId(weapon.id),
  kind: 'weapon',
  name: { key: `taoyuan.equipment.weapon.${weapon.id}.name`, fallback: weapon.name },
  description: { key: `taoyuan.equipment.weapon.${weapon.id}.description`, fallback: weapon.description },
  weaponType: weapon.type,
  attack: weapon.attack,
  critRate: weapon.critRate,
  shopPrice: weapon.shopPrice,
  shopMaterials: weapon.shopMaterials.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  })),
  fixedEnchantment: weapon.fixedEnchantment ? toOfficialContentId(weapon.fixedEnchantment) : null,
  sellPrice: getExpectedWeaponSellPrice(weapon)
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

const normalizeLegacyShoe = (shoe: LegacyShoeDef): LegacyShoeDef => ({
  ...shoe,
  effects: shoe.effects.map(effect => ({ ...effect })),
  recipe: shoe.recipe ? shoe.recipe.map(material => ({ ...material })) : null
})

const normalizeLegacyWeapon = (weapon: LegacyWeaponDef): LegacyWeaponDef => ({
  ...weapon,
  shopMaterials: weapon.shopMaterials.map(material => ({ ...material }))
})

const normalizeContentRing = (ring: Readonly<WearableEquipmentContentDef>): LegacyRingDef => ({
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

const normalizeContentHat = (hat: Readonly<WearableEquipmentContentDef>): LegacyHatDef => ({
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

const normalizeContentShoe = (shoe: Readonly<WearableEquipmentContentDef>): LegacyShoeDef => ({
  id: localId(shoe.id),
  name: shoe.name.fallback,
  description: shoe.description.fallback,
  effects: shoe.effects.map(effect => ({ ...effect })),
  shopPrice: shoe.shopPrice ?? null,
  recipe: shoe.recipe
    ? shoe.recipe.map(material => ({
        itemId: localId(material.itemId),
        quantity: material.quantity
      }))
    : null,
  recipeMoney: shoe.recipeMoney,
  obtainSource: shoe.obtainSource.fallback,
  sellPrice: shoe.sellPrice
})

const normalizeContentWeapon = (weapon: Readonly<WeaponEquipmentContentDef>): LegacyWeaponDef => ({
  id: localId(weapon.id),
  name: weapon.name.fallback,
  type: weapon.weaponType,
  attack: weapon.attack,
  critRate: weapon.critRate,
  description: weapon.description.fallback,
  shopPrice: weapon.shopPrice,
  shopMaterials: weapon.shopMaterials.map(material => ({
    itemId: localId(material.itemId),
    quantity: material.quantity
  })),
  fixedEnchantment: weapon.fixedEnchantment ? localId(weapon.fixedEnchantment) : null
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
      { ...base, kind: 'amulet' },
      { ...base, id: 'not namespaced' },
      { ...base, effects: [{ type: 'unknown_effect', value: 1 }] },
      { ...base, recipe: [{ itemId: 'example_mod:test_item', quantity: 0 }] },
      { ...base, recipeMoney: -1 },
      { ...base, sellPrice: -1 },
      { ...base, shopPrice: -1 },
      { ...base, extra: true },
      {
        id: 'example_mod:broken_weapon',
        kind: 'weapon',
        name: { key: 'example_mod.weapon.broken.name', fallback: 'Broken Weapon' },
        description: { key: 'example_mod.weapon.broken.description', fallback: 'Broken weapon' },
        weaponType: 'sword',
        attack: -1,
        critRate: -0.1,
        shopPrice: -1,
        shopMaterials: [{ itemId: 'example_mod:test_item', quantity: 0 }],
        fixedEnchantment: 'not namespaced',
        sellPrice: -1
      }
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
        '/7/extra',
        '/8/attack',
        '/8/critRate',
        '/8/shopPrice',
        '/8/shopMaterials/0/quantity',
        '/8/fixedEnchantment',
        '/8/sellPrice'
      ]))
    }
  })

  it('registers all legacy rings in order with equivalent fields', () => {
    expect(getOfficialEquipmentDefs()).toHaveLength(
      LEGACY_RINGS.length + LEGACY_HATS.length + LEGACY_SHOES.length + Object.values(LEGACY_WEAPONS).length
    )
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

  it('registers all legacy shoes in order with equivalent fields', () => {
    expect(getOfficialShoeDefs().map(shoe => shoe.id)).toEqual(
      LEGACY_SHOES.map(shoe => toOfficialContentId(shoe.id))
    )
    expect(getOfficialShoeDefs().map(normalizeContentShoe)).toEqual(
      LEGACY_SHOES.map(normalizeLegacyShoe)
    )
    expect(getOfficialShoesAsLegacy().map(normalizeLegacyShoe)).toEqual(
      LEGACY_SHOES.map(normalizeLegacyShoe)
    )
    expect(SHOP_SHOES.map(shoe => shoe.id)).toEqual(
      LEGACY_SHOES.filter(shoe => shoe.shopPrice !== null).map(shoe => shoe.id)
    )
    expect(CRAFTABLE_SHOES.map(shoe => shoe.id)).toEqual(
      LEGACY_SHOES.filter(shoe => shoe.recipe !== null).map(shoe => shoe.id)
    )

    for (const shoe of LEGACY_SHOES) {
      expect(getOfficialEquipmentDef(shoe.id)).toEqual(expectedShoeContentDef(shoe))
      expect(getOfficialEquipmentDef(toOfficialContentId(shoe.id))).toBe(getOfficialEquipmentDef(shoe.id))
      expect(getOfficialShoeById(shoe.id)).toEqual(normalizeLegacyShoe(shoe))
      expect(getOfficialShoeById(toOfficialContentId(shoe.id))).toEqual(normalizeLegacyShoe(shoe))
      expect(getShoeById(shoe.id)).toEqual(normalizeLegacyShoe(shoe))
    }
  })

  it('registers all legacy weapons in order with equivalent fields', () => {
    const legacyWeapons = Object.values(LEGACY_WEAPONS)
    expect(getOfficialWeaponDefs().map(weapon => weapon.id)).toEqual(
      legacyWeapons.map(weapon => toOfficialContentId(weapon.id))
    )
    expect(getOfficialWeaponDefs().map(normalizeContentWeapon)).toEqual(
      legacyWeapons.map(normalizeLegacyWeapon)
    )
    expect(getOfficialWeaponsAsLegacy().map(normalizeLegacyWeapon)).toEqual(
      legacyWeapons.map(normalizeLegacyWeapon)
    )
    expect(SHOP_WEAPONS.map(weapon => weapon.id)).toEqual(
      legacyWeapons.filter(weapon => weapon.shopPrice !== null).map(weapon => weapon.id)
    )

    for (const weapon of legacyWeapons) {
      expect(getOfficialEquipmentDef(weapon.id)).toEqual(expectedWeaponContentDef(weapon))
      expect(getOfficialEquipmentDef(toOfficialContentId(weapon.id))).toBe(getOfficialEquipmentDef(weapon.id))
      expect(getOfficialWeaponById(weapon.id)).toEqual(normalizeLegacyWeapon(weapon))
      expect(getOfficialWeaponById(toOfficialContentId(weapon.id))).toEqual(normalizeLegacyWeapon(weapon))
      expect(getWeaponById(weapon.id)).toEqual(normalizeLegacyWeapon(weapon))
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const jadeRing = getOfficialRingDefs().find(ring => localId(ring.id) === 'jade_guard_ring')
    const strawHat = getOfficialHatDefs().find(hat => localId(hat.id) === 'straw_hat')
    const strawSandals = getOfficialShoeDefs().find(shoe => localId(shoe.id) === 'straw_sandals')
    const woodenStick = getOfficialWeaponDefs()[0]
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<EquipmentContentDef>(toOfficialRegistryTypeId('equipment'))

    expect(getOfficialEquipmentDef('missing_equipment')).toBeUndefined()
    expect(getOfficialRingById('missing_ring')).toBeUndefined()
    expect(getOfficialHatById('missing_hat')).toBeUndefined()
    expect(getOfficialShoeById('missing_shoe')).toBeUndefined()
    expect(getOfficialWeaponById('missing_weapon')).toBeUndefined()
    expect(getRingById('missing_ring')).toBeUndefined()
    expect(getHatById('missing_hat')).toBeUndefined()
    expect(getShoeById('missing_shoe')).toBeUndefined()
    expect(getWeaponById('missing_weapon')).toBeUndefined()
    expect(Object.isFrozen(jadeRing)).toBe(true)
    expect(Object.isFrozen(jadeRing?.effects)).toBe(true)
    expect(Object.isFrozen(jadeRing?.effects[0])).toBe(true)
    expect(Object.isFrozen(jadeRing?.recipe)).toBe(true)
    expect(Object.isFrozen(jadeRing?.recipe?.[0])).toBe(true)
    expect(Object.isFrozen(strawHat)).toBe(true)
    expect(Object.isFrozen(strawHat?.effects)).toBe(true)
    expect(Object.isFrozen(strawHat?.effects[0])).toBe(true)
    expect(Object.isFrozen(strawSandals)).toBe(true)
    expect(Object.isFrozen(strawSandals?.effects)).toBe(true)
    expect(Object.isFrozen(strawSandals?.effects[0])).toBe(true)
    expect(Object.isFrozen(woodenStick)).toBe(true)
    expect(Object.isFrozen(woodenStick?.shopMaterials)).toBe(true)
    expect(() => registry.register(OFFICIAL_PACKAGE_ID, expectedRingContentDef(LEGACY_RINGS[0]!)))
      .toThrow(RegistryError)
  })

  it('reports missing equipment item, material and fixed enchantment references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<EquipmentContentDef>(toOfficialRegistryTypeId('equipment'))
    const missingEquipmentItem = toOfficialContentId('missing_equipment_item')
    const missingMaterial = toOfficialContentId('missing_equipment_material')
    const missingWeaponItem = toOfficialContentId('missing_weapon_item')
    const missingWeaponMaterial = toOfficialContentId('missing_weapon_material')
    const missingFixedEnchantment = toOfficialContentId('missing_fixed_enchantment')

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
    registry.register(OFFICIAL_PACKAGE_ID, {
      ...expectedWeaponContentDef(Object.values(LEGACY_WEAPONS)[0]!),
      id: missingWeaponItem,
      shopMaterials: [
        {
          itemId: missingWeaponMaterial,
          quantity: 1
        }
      ],
      fixedEnchantment: missingFixedEnchantment
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
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingWeaponItem,
        fieldPath: '/id'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingWeaponMaterial,
        fieldPath: '/shopMaterials/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('enchantment'),
        contentId: missingFixedEnchantment,
        fieldPath: '/fixedEnchantment'
      })
    ]))
  })
})
