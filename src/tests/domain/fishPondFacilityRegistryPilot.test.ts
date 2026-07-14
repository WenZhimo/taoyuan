import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { FISH_POND_FACILITY as LEGACY_FISH_POND_FACILITY } from '@/data/fishPondFacilityDefinitions'
import {
  POND_BUILD_COST,
  POND_CAPACITY,
  POND_UPGRADE_COSTS,
  getFishPondFacilityDefs,
  getPondBuildCost,
  getPondCapacity,
  getPondRuntimeCapacity,
  getPondUpgradeCost
} from '@/data/fishPond'
import {
  getOfficialFishPondFacilitiesAsLegacy,
  getOfficialFishPondFacilityById,
  getOfficialFishPondFacilityDef,
  getOfficialFishPondFacilityDefs
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  FishPondFacilityDefSchema,
  type FishPondFacilityDef as FishPondFacilityContentDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useFishPondStore } from '@/stores/useFishPondStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { FishPondFacilityDef as LegacyFishPondFacilityDef } from '@/data/fishPondFacilityDefinitions'
import validFishPondFacilities from '../fixtures/mods/minimal-valid-package/data/fish-pond-facilities.json'

const normalizeCost = (cost: LegacyFishPondFacilityDef['buildCost']): LegacyFishPondFacilityDef['buildCost'] => ({
  money: cost.money,
  materials: cost.materials.map(material => ({ ...material }))
})

const normalizeFacility = (facility: LegacyFishPondFacilityDef): LegacyFishPondFacilityDef => ({
  ...facility,
  buildCost: normalizeCost(facility.buildCost),
  capacities: facility.capacities.map(capacity => ({ ...capacity })),
  upgrades: facility.upgrades.map(upgrade => ({
    ...upgrade,
    cost: normalizeCost(upgrade.cost)
  }))
})

const expectedFacilityContentDef = (facility: LegacyFishPondFacilityDef): FishPondFacilityContentDef => ({
  id: toOfficialContentId(facility.id),
  name: { key: `taoyuan.fish_pond_facility.${facility.id}.name`, fallback: facility.name },
  description: {
    key: `taoyuan.fish_pond_facility.${facility.id}.description`,
    fallback: facility.description
  },
  buildCost: {
    money: facility.buildCost.money,
    materials: facility.buildCost.materials.map(material => ({
      itemId: toOfficialContentId(material.itemId),
      quantity: material.quantity
    }))
  },
  capacities: facility.capacities.map(capacity => ({ ...capacity })),
  upgrades: facility.upgrades.map(upgrade => ({
    level: upgrade.level,
    capacity: upgrade.capacity,
    cost: {
      money: upgrade.cost.money,
      materials: upgrade.cost.materials.map(material => ({
        itemId: toOfficialContentId(material.itemId),
        quantity: material.quantity
      }))
    }
  })),
  unlimitedAtLevel: facility.unlimitedAtLevel
})

describe('fish pond facility registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external fish pond facility JSON before registration', () => {
    const externalFacilities: unknown = validFishPondFacilities
    const result = validateUnknown(Type.Array(FishPondFacilityDefSchema), externalFacilities, {
      stage: 'test.fish-pond-facilities'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid fish pond facility shape and numeric bounds', () => {
    const base = validFishPondFacilities[0]!
    const invalidFacilities: unknown = [
      { ...base, buildCost: { ...base.buildCost, money: -1 } },
      { ...base, buildCost: { ...base.buildCost, materials: [{ itemId: 'example_mod:test_item', quantity: 0 }] } },
      { ...base, capacities: [{ level: 0, capacity: 1 }] },
      { ...base, capacities: [{ level: 1, capacity: 0 }] },
      { ...base, upgrades: [{ ...base.upgrades[0], level: 1 }] },
      { ...base, upgrades: [{ ...base.upgrades[0], capacity: 0 }] },
      {
        ...base,
        upgrades: [
          {
            ...base.upgrades[0],
            cost: {
              ...base.upgrades[0]!.cost,
              materials: [{ itemId: 'example_mod:test_item', quantity: 0 }]
            }
          }
        ]
      },
      { ...base, unlimitedAtLevel: 4 },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(FishPondFacilityDefSchema), invalidFacilities, {
      stage: 'test.fish-pond-facilities.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/buildCost/money',
        '/1/buildCost/materials/0/quantity',
        '/2/capacities/0/level',
        '/3/capacities/0/capacity',
        '/4/upgrades/0/level',
        '/5/upgrades/0/capacity',
        '/6/upgrades/0/cost/materials/0/quantity',
        '/7/unlimitedAtLevel',
        '/8/extra'
      ]))
    }
  })

  it('registers the fish pond facility with equivalent legacy cost and capacity fields', () => {
    expect(getOfficialFishPondFacilityDefs()).toHaveLength(1)
    expect(getOfficialFishPondFacilityDefs().map(facility => facility.id)).toEqual([
      toOfficialContentId(LEGACY_FISH_POND_FACILITY.id)
    ])
    expect(getOfficialFishPondFacilityDef('fish_pond')).toEqual(
      expectedFacilityContentDef(LEGACY_FISH_POND_FACILITY)
    )
    expect(getOfficialFishPondFacilityById('fish_pond')).toEqual(
      normalizeFacility(LEGACY_FISH_POND_FACILITY)
    )
    expect(getOfficialFishPondFacilitiesAsLegacy().map(normalizeFacility)).toEqual([
      normalizeFacility(LEGACY_FISH_POND_FACILITY)
    ])
    expect(getFishPondFacilityDefs().map(normalizeFacility)).toEqual([
      normalizeFacility(LEGACY_FISH_POND_FACILITY)
    ])
    expect(getPondBuildCost()).toEqual(normalizeCost(LEGACY_FISH_POND_FACILITY.buildCost))
    expect(POND_BUILD_COST).toEqual(getPondBuildCost())
    expect(getPondUpgradeCost(2)).toEqual(normalizeCost(LEGACY_FISH_POND_FACILITY.upgrades[0]!.cost))
    expect(getPondUpgradeCost(3)).toEqual(normalizeCost(LEGACY_FISH_POND_FACILITY.upgrades[1]!.cost))
    expect(POND_UPGRADE_COSTS).toEqual({ 2: getPondUpgradeCost(2), 3: getPondUpgradeCost(3) })
    expect(POND_CAPACITY).toEqual({ 1: 5, 2: 10, 3: 20 })
    expect(getPondCapacity(1)).toBe(5)
    expect(getPondCapacity(2)).toBe(10)
    expect(getPondCapacity(3)).toBe(20)
    expect(getPondRuntimeCapacity(1)).toBe(5)
    expect(getPondRuntimeCapacity(2)).toBe(10)
    expect(getPondRuntimeCapacity(3)).toBe(Number.POSITIVE_INFINITY)
  })

  it('supports missing IDs and read-only registry entries', () => {
    const facility = getOfficialFishPondFacilityDef('fish_pond')

    expect(getOfficialFishPondFacilityDef('missing_fish_pond')).toBeUndefined()
    expect(getOfficialFishPondFacilityById('missing_fish_pond')).toBeUndefined()
    expect(Object.isFrozen(facility)).toBe(true)
    expect(Object.isFrozen(facility?.name)).toBe(true)
    expect(Object.isFrozen(facility?.buildCost.materials)).toBe(true)
    expect(Object.isFrozen(facility?.buildCost.materials[0])).toBe(true)
    expect(Object.isFrozen(facility?.capacities[0])).toBe(true)
    expect(Object.isFrozen(facility?.upgrades[0]?.cost.materials[0])).toBe(true)
  })

  it('reports missing build and upgrade material references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<FishPondFacilityContentDef>(toOfficialRegistryTypeId('fish_pond_facility'))
    const missingBuildMaterial = toOfficialContentId('missing_pond_build_material')
    const missingUpgradeMaterial = toOfficialContentId('missing_pond_upgrade_material')
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('invalid_fish_pond_facility'),
      name: { key: 'test.fish-pond-facility.invalid.name', fallback: 'Invalid Fish Pond Facility' },
      description: { key: 'test.fish-pond-facility.invalid.description', fallback: 'Invalid materials' },
      buildCost: {
        money: 1,
        materials: [{ itemId: missingBuildMaterial, quantity: 1 }]
      },
      capacities: [
        { level: 1, capacity: 1 },
        { level: 2, capacity: 2 },
        { level: 3, capacity: 3 }
      ],
      upgrades: [
        {
          level: 2,
          capacity: 2,
          cost: {
            money: 1,
            materials: [{ itemId: missingUpgradeMaterial, quantity: 1 }]
          }
        }
      ],
      unlimitedAtLevel: null
    })

    const diagnostics = validateRegistrySemantics(registrySet)

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingBuildMaterial,
        fieldPath: '/buildCost/materials/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingUpgradeMaterial,
        fieldPath: '/upgrades/0/cost/materials/0/itemId'
      })
    ]))
  })

  it('keeps fish pond store build, upgrade and unlimited capacity behavior registry-backed', () => {
    const fishPondStore = useFishPondStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    playerStore.money = 20_000
    expect(inventoryStore.addItem('wood', 200)).toBe(true)
    expect(inventoryStore.addItem('bamboo', 50)).toBe(true)
    expect(inventoryStore.addItem('iron_bar', 5)).toBe(true)

    expect(fishPondStore.buildPond()).toBe(true)
    expect(playerStore.money).toBe(15_000)
    expect(inventoryStore.getItemCount('wood')).toBe(100)
    expect(inventoryStore.getItemCount('bamboo')).toBe(0)
    expect(fishPondStore.pond.built).toBe(true)
    expect(fishPondStore.pond.level).toBe(1)
    expect(fishPondStore.capacity).toBe(5)

    expect(fishPondStore.upgradePond()).toBe(true)
    expect(playerStore.money).toBe(5_000)
    expect(inventoryStore.getItemCount('wood')).toBe(0)
    expect(inventoryStore.getItemCount('iron_bar')).toBe(0)
    expect(fishPondStore.pond.level).toBe(2)
    expect(fishPondStore.capacity).toBe(10)

    fishPondStore.pond.level = 3
    expect(fishPondStore.capacity).toBe(Number.POSITIVE_INFINITY)
  })
})
