import { Type } from '@sinclair/typebox'
import { describe, expect, it } from 'vitest'
import {
  TOOL_NAMES,
  TIER_NAMES,
  TOOL_UPGRADE_COSTS as LEGACY_TOOL_UPGRADE_COSTS,
  getUpgradeCost,
  type ToolUpgradeCost as LegacyToolUpgradeCost
} from '@/data/upgrades'
import {
  getOfficialToolUpgradeCost,
  getOfficialToolUpgradeCosts,
  getOfficialToolUpgradeDef,
  getOfficialToolUpgradeDefs
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  ToolUpgradeDefSchema,
  type ToolUpgradeDef as ToolUpgradeContentDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import type { ToolType } from '@/types'
import validToolUpgrades from '../fixtures/mods/minimal-valid-package/data/tool-upgrades.json'

const toolTypes = Object.keys(LEGACY_TOOL_UPGRADE_COSTS) as ToolType[]

const materialToContent = (material: LegacyToolUpgradeCost['materials'][number]) => ({
  itemId: toOfficialContentId(material.itemId),
  quantity: material.quantity
})

const toolUpgradeIdSegment = (toolType: ToolType): string =>
  toolType.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

const expectedToolUpgradeContentDef = (
  toolType: ToolType,
  cost: LegacyToolUpgradeCost
): ToolUpgradeContentDef => ({
  id: toOfficialContentId(`tool_upgrade/${toolUpgradeIdSegment(toolType)}/${cost.fromTier}_to_${cost.toTier}`),
  toolType,
  fromTier: cost.fromTier,
  toTier: cost.toTier,
  money: cost.money,
  materials: cost.materials.map(materialToContent)
})

describe('tool upgrade registry pilot', () => {
  it('validates external tool upgrade JSON before registration', () => {
    const externalToolUpgrades: unknown = validToolUpgrades
    const result = validateUnknown(Type.Array(ToolUpgradeDefSchema), externalToolUpgrades, {
      stage: 'test.tool-upgrades'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid tool upgrade shapes and numeric bounds', () => {
    const base = validToolUpgrades[0]!
    const invalidToolUpgrades: unknown = [
      { ...base, toolType: 'shovel' },
      { ...base, fromTier: 'bronze' },
      { ...base, money: -1 },
      { ...base, materials: [{ itemId: 'example_mod:test_item', quantity: 0 }] },
      { ...base, materials: [{ itemId: 'not namespaced', quantity: 1 }] },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(ToolUpgradeDefSchema), invalidToolUpgrades, {
      stage: 'test.tool-upgrades.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/toolType',
        '/1/fromTier',
        '/2/money',
        '/3/materials/0/quantity',
        '/4/materials/0/itemId',
        '/5/extra'
      ]))
    }
  })

  it('registers all tool upgrade costs in legacy order with equivalent fields', () => {
    const expectedContentDefs = toolTypes.flatMap(toolType =>
      LEGACY_TOOL_UPGRADE_COSTS[toolType].map(cost => expectedToolUpgradeContentDef(toolType, cost))
    )

    expect(getOfficialToolUpgradeDefs()).toEqual(expectedContentDefs)
    expect(getOfficialToolUpgradeCosts()).toEqual(LEGACY_TOOL_UPGRADE_COSTS)

    for (const toolType of toolTypes) {
      for (const cost of LEGACY_TOOL_UPGRADE_COSTS[toolType]) {
        const id = `tool_upgrade/${toolUpgradeIdSegment(toolType)}/${cost.fromTier}_to_${cost.toTier}`
        expect(getOfficialToolUpgradeDef(id)).toEqual(expectedToolUpgradeContentDef(toolType, cost))
        expect(getOfficialToolUpgradeDef(toOfficialContentId(id))).toBe(getOfficialToolUpgradeDef(id))
        expect(getOfficialToolUpgradeCost(toolType, cost.fromTier)).toEqual(cost)
        expect(getUpgradeCost(toolType, cost.fromTier)).toEqual(cost)
      }
      expect(getOfficialToolUpgradeCost(toolType, 'iridium')).toBeUndefined()
      expect(getUpgradeCost(toolType, 'iridium')).toBeUndefined()
    }
  })

  it('preserves player-visible tool and tier labels', () => {
    expect(TOOL_NAMES).toEqual({
      wateringCan: '水壶',
      hoe: '锄头',
      pickaxe: '镐',
      fishingRod: '鱼竿',
      scythe: '镰刀',
      axe: '斧头',
      pan: '淘金盘'
    })
    expect(TIER_NAMES).toEqual({
      basic: '初始',
      iron: '铁制',
      steel: '精钢',
      iridium: '铱金'
    })
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const hoeUpgrade = getOfficialToolUpgradeDef('tool_upgrade/hoe/basic_to_iron')
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<ToolUpgradeContentDef>(toOfficialRegistryTypeId('tool_upgrade'))

    expect(getOfficialToolUpgradeDef('tool_upgrade/hoe/iridium_to_mythic')).toBeUndefined()
    expect(Object.isFrozen(hoeUpgrade)).toBe(true)
    expect(Object.isFrozen(hoeUpgrade?.materials)).toBe(true)
    expect(Object.isFrozen(hoeUpgrade?.materials[0])).toBe(true)
    expect(() => registry.register(
      OFFICIAL_PACKAGE_ID,
      expectedToolUpgradeContentDef('hoe', LEGACY_TOOL_UPGRADE_COSTS.hoe[0]!)
    )).toThrow(RegistryError)
  })

  it('reports missing upgrade material item references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<ToolUpgradeContentDef>(toOfficialRegistryTypeId('tool_upgrade'))
    const missingMaterial = toOfficialContentId('missing_tool_upgrade_material')
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('tool_upgrade/hoe/basic_to_invalid_refs'),
      toolType: 'hoe',
      fromTier: 'basic',
      toTier: 'iron',
      money: 1,
      materials: [{ itemId: missingMaterial, quantity: 1 }]
    })

    const diagnostics = validateRegistrySemantics(registrySet)

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingMaterial,
        fieldPath: '/materials/0/itemId'
      })
    ]))
  })
})
