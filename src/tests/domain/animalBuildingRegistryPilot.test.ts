import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  ANIMAL_BUILDINGS as LEGACY_ANIMAL_BUILDINGS,
  BUILDING_UPGRADES as LEGACY_BUILDING_UPGRADES,
  type AnimalBuildingUpgradeDef as LegacyAnimalBuildingUpgradeDef
} from '@/data/animalBuildingDefinitions'
import { getBuildingDef, getBuildingDefs, getBuildingUpgrade } from '@/data/animals'
import {
  getOfficialAnimalBuildingByType,
  getOfficialAnimalBuildingDef,
  getOfficialAnimalBuildingDefs,
  getOfficialAnimalBuildingDefsAsLegacy,
  getOfficialAnimalBuildingUpgrade
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { AnimalBuildingDefSchema, type AnimalBuildingDef as AnimalBuildingContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { AnimalBuildingDef as LegacyAnimalBuildingDef } from '@/types'
import validAnimalBuildings from '../fixtures/mods/minimal-valid-package/data/animal-buildings.json'

const normalizeBuilding = (building: LegacyAnimalBuildingDef): LegacyAnimalBuildingDef => ({
  ...building,
  materialCost: building.materialCost.map(material => ({ ...material }))
})

const normalizeUpgrade = (upgrade: LegacyAnimalBuildingUpgradeDef): LegacyAnimalBuildingUpgradeDef => ({
  ...upgrade,
  materialCost: upgrade.materialCost.map(material => ({ ...material }))
})

const expectedBuildingContentDef = (building: LegacyAnimalBuildingDef): AnimalBuildingContentDef => ({
  id: toOfficialContentId(`animal_building/${building.type}`),
  building: building.type,
  name: { key: `taoyuan.animal_building.${building.type}.name`, fallback: building.name },
  description: { key: `taoyuan.animal_building.${building.type}.description`, fallback: building.description },
  capacity: building.capacity,
  cost: building.cost,
  materialCost: building.materialCost.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  })),
  upgrades: LEGACY_BUILDING_UPGRADES
    .filter(upgrade => upgrade.type === building.type)
    .map(upgrade => ({
      level: upgrade.level,
      name: {
        key: `taoyuan.animal_building.${building.type}.upgrade.${upgrade.level}.name`,
        fallback: upgrade.name
      },
      capacity: upgrade.capacity,
      cost: upgrade.cost,
      materialCost: upgrade.materialCost.map(material => ({
        itemId: toOfficialContentId(material.itemId),
        quantity: material.quantity
      }))
    }))
})

describe('animal building registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external animal building JSON before registration', () => {
    const externalBuildings: unknown = validAnimalBuildings
    const result = validateUnknown(Type.Array(AnimalBuildingDefSchema), externalBuildings, {
      stage: 'test.animal-buildings'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid animal building shape and numeric bounds', () => {
    const base = validAnimalBuildings[0]!
    const invalidBuildings: unknown = [
      { ...base, building: 'pasture' },
      { ...base, capacity: 0 },
      { ...base, cost: -1 },
      { ...base, materialCost: [{ itemId: 'example_mod:test_item', quantity: 0 }] },
      { ...base, upgrades: [{ ...base.upgrades[0], level: 1 }] },
      { ...base, upgrades: [{ ...base.upgrades[0], capacity: 0 }] },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(AnimalBuildingDefSchema), invalidBuildings, {
      stage: 'test.animal-buildings.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/building',
        '/1/capacity',
        '/2/cost',
        '/3/materialCost/0/quantity',
        '/4/upgrades/0/level',
        '/5/upgrades/0/capacity',
        '/6/extra'
      ]))
    }
  })

  it('registers all animal buildings and upgrades in legacy order with equivalent fields', () => {
    expect(getOfficialAnimalBuildingDefs()).toHaveLength(LEGACY_ANIMAL_BUILDINGS.length)
    expect(getOfficialAnimalBuildingDefs().map(building => building.id)).toEqual(
      LEGACY_ANIMAL_BUILDINGS.map(building => toOfficialContentId(`animal_building/${building.type}`))
    )
    expect(getOfficialAnimalBuildingDefsAsLegacy().map(normalizeBuilding)).toEqual(
      LEGACY_ANIMAL_BUILDINGS.map(normalizeBuilding)
    )
    expect(getBuildingDefs().map(normalizeBuilding)).toEqual(LEGACY_ANIMAL_BUILDINGS.map(normalizeBuilding))

    for (const building of LEGACY_ANIMAL_BUILDINGS) {
      expect(getOfficialAnimalBuildingDef(`animal_building/${building.type}`)).toEqual(expectedBuildingContentDef(building))
      expect(getOfficialAnimalBuildingByType(building.type)).toEqual(building)
      expect(getBuildingDef(building.type)).toEqual(building)
    }

    for (const upgrade of LEGACY_BUILDING_UPGRADES) {
      expect(getOfficialAnimalBuildingUpgrade(upgrade.type, upgrade.level)).toEqual(normalizeUpgrade(upgrade))
      expect(getBuildingUpgrade(upgrade.type, upgrade.level)).toEqual(upgrade)
    }
  })

  it('supports missing IDs and read-only registry entries', () => {
    const coop = getOfficialAnimalBuildingDef('animal_building/coop')

    expect(getOfficialAnimalBuildingDef('animal_building/missing')).toBeUndefined()
    expect(getOfficialAnimalBuildingByType('missing')).toBeUndefined()
    expect(getBuildingDef('missing')).toBeUndefined()
    expect(getOfficialAnimalBuildingUpgrade('coop', 9)).toBeUndefined()
    expect(Object.isFrozen(coop)).toBe(true)
    expect(Object.isFrozen(coop?.name)).toBe(true)
    expect(Object.isFrozen(coop?.materialCost)).toBe(true)
    expect(Object.isFrozen(coop?.materialCost[0])).toBe(true)
    expect(Object.isFrozen(coop?.upgrades[0]?.materialCost[0])).toBe(true)
  })

  it('reports missing building and upgrade material references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<AnimalBuildingContentDef>(toOfficialRegistryTypeId('animal_building'))
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('animal_building/missing_material'),
      building: 'coop',
      name: { key: 'test.animal-building.missing.name', fallback: 'Missing Material Building' },
      description: { key: 'test.animal-building.missing.description', fallback: 'Missing materials' },
      capacity: 1,
      cost: 1,
      materialCost: [{ itemId: toOfficialContentId('missing_build_material'), quantity: 1 }],
      upgrades: [
        {
          level: 2,
          name: { key: 'test.animal-building.missing.upgrade.name', fallback: 'Missing Upgrade Material' },
          capacity: 2,
          cost: 1,
          materialCost: [{ itemId: toOfficialContentId('missing_upgrade_material'), quantity: 1 }]
        }
      ]
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic =>
        diagnostic.contentId === toOfficialContentId('missing_build_material') ||
        diagnostic.contentId === toOfficialContentId('missing_upgrade_material')
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_build_material'),
        fieldPath: '/materialCost/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_upgrade_material'),
        fieldPath: '/upgrades/0/materialCost/0/itemId'
      })
    ]))
  })

  it('keeps animal store build and upgrade behavior registry-backed', () => {
    const animalStore = useAnimalStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    playerStore.money = 20_000
    expect(inventoryStore.addItem('wood', 300)).toBe(true)
    expect(inventoryStore.addItem('bamboo', 50)).toBe(true)
    expect(inventoryStore.addItem('iron_ore', 15)).toBe(true)

    expect(animalStore.buildBuilding('coop')).toBe(true)
    expect(playerStore.money).toBe(16_000)
    expect(inventoryStore.getItemCount('wood')).toBe(200)
    expect(inventoryStore.getItemCount('bamboo')).toBe(0)
    expect(animalStore.buildings.find(building => building.type === 'coop')).toEqual({
      type: 'coop',
      built: true,
      level: 1
    })

    expect(animalStore.upgradeBuilding('coop')).toBe(true)
    expect(playerStore.money).toBe(6_000)
    expect(inventoryStore.getItemCount('wood')).toBe(0)
    expect(inventoryStore.getItemCount('iron_ore')).toBe(0)
    expect(animalStore.buildings.find(building => building.type === 'coop')?.level).toBe(2)
  })
})
