import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CAVE_UPGRADES as LEGACY_CAVE_UPGRADES,
  CELLAR_UPGRADES as LEGACY_CELLAR_UPGRADES,
  FARMHOUSE_UPGRADES as LEGACY_FARMHOUSE_UPGRADES,
  getCaveUpgrade,
  getCaveUpgrades,
  getCellarUpgrade,
  getCellarUpgrades,
  getFarmhouseUpgrade,
  getFarmhouseUpgrades
} from '@/data/buildings'
import {
  getOfficialBuildingUpgradeDefs,
  getOfficialCaveUpgrade,
  getOfficialCaveUpgradeDef,
  getOfficialCaveUpgrades,
  getOfficialCellarUpgrade,
  getOfficialCellarUpgradeDef,
  getOfficialCellarUpgrades,
  getOfficialFarmhouseUpgrade,
  getOfficialFarmhouseUpgradeDef,
  getOfficialFarmhouseUpgrades
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  BuildingUpgradeDefSchema,
  type BuildingUpgradeDef as BuildingUpgradeContentDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useHomeStore } from '@/stores/useHomeStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type {
  CaveUpgradeDef as LegacyCaveUpgradeDef,
  CellarUpgradeDef as LegacyCellarUpgradeDef,
  FarmhouseUpgradeDef as LegacyFarmhouseUpgradeDef
} from '@/data/buildingUpgradeDefinitions'
import validBuildingUpgrades from '../fixtures/mods/minimal-valid-package/data/building-upgrades.json'

const normalizeFarmhouse = (upgrade: LegacyFarmhouseUpgradeDef): LegacyFarmhouseUpgradeDef => ({
  ...upgrade,
  materialCost: upgrade.materialCost.map(material => ({ ...material }))
})

const normalizeCave = (upgrade: LegacyCaveUpgradeDef): LegacyCaveUpgradeDef => ({
  ...upgrade,
  materialCost: upgrade.materialCost.map(material => ({ ...material })),
  mushroomPool: upgrade.mushroomPool.map(entry => ({ ...entry })),
  fruitPool: [...upgrade.fruitPool]
})

const normalizeCellar = (upgrade: LegacyCellarUpgradeDef): LegacyCellarUpgradeDef => ({
  ...upgrade,
  materialCost: upgrade.materialCost.map(material => ({ ...material }))
})

const materialToContent = (material: { itemId: string; quantity: number }) => ({
  itemId: toOfficialContentId(material.itemId),
  quantity: material.quantity
})

const expectedFarmhouseContentDef = (upgrade: LegacyFarmhouseUpgradeDef): BuildingUpgradeContentDef => ({
  id: toOfficialContentId(`building_upgrade/farmhouse/${upgrade.level}`),
  kind: 'farmhouse',
  level: upgrade.level as 1 | 2 | 3,
  name: { key: `taoyuan.building_upgrade.farmhouse.${upgrade.level}.name`, fallback: upgrade.name },
  description: {
    key: `taoyuan.building_upgrade.farmhouse.${upgrade.level}.description`,
    fallback: upgrade.description
  },
  cost: upgrade.cost,
  materialCost: upgrade.materialCost.map(materialToContent),
  benefit: upgrade.benefit
})

const expectedCaveContentDef = (upgrade: LegacyCaveUpgradeDef): BuildingUpgradeContentDef => ({
  id: toOfficialContentId(`building_upgrade/cave/${upgrade.level}`),
  kind: 'cave',
  level: upgrade.level as 1 | 2 | 3,
  name: { key: `taoyuan.building_upgrade.cave.${upgrade.level}.name`, fallback: upgrade.name },
  mushroomChance: upgrade.mushroomChance,
  fruitBatChance: upgrade.fruitBatChance,
  doubleChance: upgrade.doubleChance,
  cost: upgrade.cost,
  materialCost: upgrade.materialCost.map(materialToContent),
  mushroomPool: upgrade.mushroomPool.map(entry => ({
    itemId: toOfficialContentId(entry.itemId),
    weight: entry.weight
  })),
  fruitPool: upgrade.fruitPool.map(toOfficialContentId)
})

const expectedCellarContentDef = (upgrade: LegacyCellarUpgradeDef): BuildingUpgradeContentDef => ({
  id: toOfficialContentId(`building_upgrade/cellar/${upgrade.level}`),
  kind: 'cellar',
  level: upgrade.level as 1 | 2 | 3 | 4 | 5,
  name: { key: `taoyuan.building_upgrade.cellar.${upgrade.level}.name`, fallback: upgrade.name },
  valuePerCycle: upgrade.valuePerCycle,
  maxSlots: upgrade.maxSlots,
  cost: upgrade.cost,
  materialCost: upgrade.materialCost.map(materialToContent)
})

describe('building upgrade registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('validates external building upgrade JSON before registration', () => {
    const externalUpgrades: unknown = validBuildingUpgrades
    const result = validateUnknown(Type.Array(BuildingUpgradeDefSchema), externalUpgrades, {
      stage: 'test.building-upgrades'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid building upgrade shapes and numeric bounds', () => {
    const farmhouse = validBuildingUpgrades[0]!
    const cave = validBuildingUpgrades[1]!
    const cellar = validBuildingUpgrades[2]!
    const invalidUpgrades: unknown = [
      { ...farmhouse, level: 4 },
      { ...farmhouse, cost: -1 },
      { ...farmhouse, materialCost: [{ itemId: 'example_mod:test_item', quantity: 0 }] },
      { ...cave, mushroomChance: 1.1 },
      { ...cave, mushroomPool: [{ itemId: 'example_mod:test_item', weight: 0 }] },
      { ...cave, fruitPool: [] },
      { ...cellar, maxSlots: 0 },
      { ...cellar, valuePerCycle: -1 },
      { ...cellar, extra: true }
    ]
    const result = validateUnknown(Type.Array(BuildingUpgradeDefSchema), invalidUpgrades, {
      stage: 'test.building-upgrades.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/level',
        '/1/cost',
        '/2/materialCost/0/quantity',
        '/3/mushroomChance',
        '/4/mushroomPool/0/weight',
        '/5/fruitPool',
        '/6/maxSlots',
        '/7/valuePerCycle',
        '/8/extra'
      ]))
    }
  })

  it('registers farmhouse, cave and cellar upgrades in legacy order with equivalent fields', () => {
    expect(getOfficialBuildingUpgradeDefs().map(upgrade => upgrade.id)).toEqual([
      ...LEGACY_FARMHOUSE_UPGRADES.map(upgrade => toOfficialContentId(`building_upgrade/farmhouse/${upgrade.level}`)),
      ...LEGACY_CAVE_UPGRADES.map(upgrade => toOfficialContentId(`building_upgrade/cave/${upgrade.level}`)),
      ...LEGACY_CELLAR_UPGRADES.map(upgrade => toOfficialContentId(`building_upgrade/cellar/${upgrade.level}`))
    ])
    expect(getOfficialFarmhouseUpgrades().map(normalizeFarmhouse)).toEqual(
      LEGACY_FARMHOUSE_UPGRADES.map(normalizeFarmhouse)
    )
    expect(getOfficialCaveUpgrades().map(normalizeCave)).toEqual(LEGACY_CAVE_UPGRADES.map(normalizeCave))
    expect(getOfficialCellarUpgrades().map(normalizeCellar)).toEqual(
      LEGACY_CELLAR_UPGRADES.map(normalizeCellar)
    )
    expect(getFarmhouseUpgrades().map(normalizeFarmhouse)).toEqual(LEGACY_FARMHOUSE_UPGRADES.map(normalizeFarmhouse))
    expect(getCaveUpgrades().map(normalizeCave)).toEqual(LEGACY_CAVE_UPGRADES.map(normalizeCave))
    expect(getCellarUpgrades().map(normalizeCellar)).toEqual(LEGACY_CELLAR_UPGRADES.map(normalizeCellar))

    for (const upgrade of LEGACY_FARMHOUSE_UPGRADES) {
      expect(getOfficialFarmhouseUpgradeDef(upgrade.level)).toEqual(expectedFarmhouseContentDef(upgrade))
      expect(getOfficialFarmhouseUpgrade(upgrade.level)).toEqual(normalizeFarmhouse(upgrade))
      expect(getFarmhouseUpgrade(upgrade.level)).toEqual(normalizeFarmhouse(upgrade))
    }
    for (const upgrade of LEGACY_CAVE_UPGRADES) {
      expect(getOfficialCaveUpgradeDef(upgrade.level)).toEqual(expectedCaveContentDef(upgrade))
      expect(getOfficialCaveUpgrade(upgrade.level)).toEqual(normalizeCave(upgrade))
      expect(getCaveUpgrade(upgrade.level)).toEqual(normalizeCave(upgrade))
    }
    for (const upgrade of LEGACY_CELLAR_UPGRADES) {
      expect(getOfficialCellarUpgradeDef(upgrade.level)).toEqual(expectedCellarContentDef(upgrade))
      expect(getOfficialCellarUpgrade(upgrade.level)).toEqual(normalizeCellar(upgrade))
      expect(getCellarUpgrade(upgrade.level)).toEqual(normalizeCellar(upgrade))
    }
  })

  it('supports missing levels and read-only registry entries', () => {
    const farmhouse = getOfficialFarmhouseUpgradeDef(1)
    const cave = getOfficialCaveUpgradeDef(1)
    const cellar = getOfficialCellarUpgradeDef(1)

    expect(getOfficialFarmhouseUpgrade(9)).toBeUndefined()
    expect(getOfficialCaveUpgrade(9)).toBeUndefined()
    expect(getOfficialCellarUpgrade(9)).toBeUndefined()
    expect(getFarmhouseUpgrade(9)).toBeUndefined()
    expect(getCaveUpgrade(9)).toBeUndefined()
    expect(getCellarUpgrade(9)).toBeUndefined()
    expect(Object.isFrozen(farmhouse)).toBe(true)
    expect(Object.isFrozen(farmhouse?.name)).toBe(true)
    expect(Object.isFrozen(farmhouse?.materialCost[0])).toBe(true)
    expect(Object.isFrozen(cave?.mushroomPool[0])).toBe(true)
    expect(Object.isFrozen(cellar?.materialCost)).toBe(true)
  })

  it('reports missing material, mushroom and fruit item references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<BuildingUpgradeContentDef>(toOfficialRegistryTypeId('building_upgrade'))
    const missingMaterial = toOfficialContentId('missing_upgrade_material')
    const missingMushroom = toOfficialContentId('missing_mushroom')
    const missingFruit = toOfficialContentId('missing_fruit')
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('building_upgrade/cave/invalid_refs'),
      kind: 'cave',
      level: 1,
      name: { key: 'test.building-upgrade.invalid.name', fallback: 'Invalid Cave' },
      mushroomChance: 0.5,
      fruitBatChance: 0.5,
      doubleChance: 0,
      cost: 1,
      materialCost: [{ itemId: missingMaterial, quantity: 1 }],
      mushroomPool: [{ itemId: missingMushroom, weight: 1 }],
      fruitPool: [missingFruit]
    })

    const diagnostics = validateRegistrySemantics(registrySet)

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingMaterial,
        fieldPath: '/materialCost/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingMushroom,
        fieldPath: '/mushroomPool/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingFruit,
        fieldPath: '/fruitPool/0'
      })
    ]))
  })

  it('keeps home store farmhouse, cave and cellar behavior registry-backed', () => {
    const homeStore = useHomeStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    playerStore.money = 150_000
    expect(inventoryStore.addItem('wood', 500)).toBe(true)
    expect(inventoryStore.addItem('iron_bar', 15)).toBe(true)
    expect(inventoryStore.addItem('iron_ore', 50)).toBe(true)

    expect(homeStore.upgradeFarmhouse()).toBe(true)
    expect(homeStore.farmhouseLevel).toBe(1)
    expect(homeStore.getKitchenBonus()).toBe(1.2)
    expect(playerStore.money).toBe(140_000)
    expect(inventoryStore.getItemCount('wood')).toBe(300)

    expect(homeStore.unlockCave()).toBe(true)
    expect(homeStore.upgradeCave()).toBe(true)
    expect(homeStore.caveLevel).toBe(2)
    expect(homeStore.caveName).toBe('山洞·贰')
    expect(playerStore.money).toBe(125_000)
    expect(inventoryStore.getItemCount('wood')).toBe(200)
    expect(inventoryStore.getItemCount('iron_bar')).toBe(10)

    homeStore.farmhouseLevel = 3
    expect(homeStore.upgradeCellar()).toBe(true)
    expect(homeStore.cellarLevel).toBe(2)
    expect(homeStore.cellarMaxSlots).toBe(9)
    expect(homeStore.cellarValuePerCycle).toBe(125)
    expect(playerStore.money).toBe(95_000)
    expect(inventoryStore.getItemCount('wood')).toBe(0)
    expect(inventoryStore.getItemCount('iron_bar')).toBe(0)

    homeStore.caveLevel = 3
    homeStore.chooseCave('mushroom')
    homeStore.caveDaysActive = 224
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)

    expect(homeStore.dailyCaveUpdate()).toEqual([
      { itemId: 'wild_mushroom', quantity: 2, quality: 'supreme' }
    ])

    homeStore.cellarLevel = 5
    expect(homeStore.cellarMaxSlots).toBe(Number.POSITIVE_INFINITY)
  })
})
