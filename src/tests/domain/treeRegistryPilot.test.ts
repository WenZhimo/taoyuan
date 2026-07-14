import { Type } from '@sinclair/typebox'
import { describe, expect, it } from 'vitest'
import { FRUIT_TREE_DEFS, getFruitTreeDef } from '@/data/fruitTrees'
import { FRUIT_TREE_DEFINITIONS, WILD_TREE_DEFINITIONS } from '@/data/treeDefinitions'
import { WILD_TREE_DEFS, getWildTreeDef } from '@/data/wildTrees'
import {
  getOfficialFruitTreeById,
  getOfficialFruitTreeBySaplingId,
  getOfficialFruitTreeDefs,
  getOfficialTreeByProductItemId,
  getOfficialTreeDef,
  getOfficialTreeDefs,
  getOfficialWildTreeById,
  getOfficialWildTreeDefs
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { TreeDefSchema, type TreeDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import validTrees from '../fixtures/mods/minimal-valid-package/data/trees.json'

const validFruitTree = {
  id: 'example_mod:test_fruit_tree',
  kind: 'fruit' as const,
  name: {
    key: 'example_mod.tree.test-fruit.name',
    fallback: '测试果树'
  },
  seedItemId: 'example_mod:test_item',
  growthDays: 7,
  saplingPrice: 10,
  fruitItemId: 'example_mod:test_item',
  fruitName: {
    key: 'example_mod.tree.test-fruit.product.name',
    fallback: '测试果实'
  },
  fruitSeason: 'spring' as const,
  fruitSellPrice: 5
}

describe('tree registry pilot', () => {
  it('validates external tree JSON as a discriminated union before registration', () => {
    const externalTrees: unknown = [validTrees[0], validFruitTree]
    const result = validateUnknown(Type.Array(TreeDefSchema), externalTrees, { stage: 'test.trees' })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid kinds, mixed variants, and invalid growth or tap cycles', () => {
    const invalidTrees: unknown = [
      { ...validTrees[0], kind: 'other' },
      { ...validTrees[0], fruitItemId: 'example_mod:test_item' },
      { ...validFruitTree, tapProductItemId: 'example_mod:test_item' },
      { ...validTrees[0], growthDays: 0 },
      { ...validTrees[0], growthDays: -1 },
      { ...validTrees[0], growthDays: 1.5 },
      { ...validTrees[0], tapCycleDays: 0 },
      { ...validTrees[0], tapCycleDays: -1 },
      { ...validTrees[0], tapCycleDays: 1.5 },
      { ...validFruitTree, saplingPrice: -1 },
      { ...validFruitTree, fruitSellPrice: -1 }
    ]
    const result = validateUnknown(Type.Array(TreeDefSchema), invalidTrees, { stage: 'test.trees.invalid' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0', '/1', '/2', '/3', '/4', '/5', '/6', '/7', '/8', '/9', '/10'
      ]))
    }
  })

  it('registers all 8 fruit and 3 wild trees in legacy order with equivalent fields', () => {
    expect(FRUIT_TREE_DEFS).toBe(FRUIT_TREE_DEFINITIONS)
    expect(WILD_TREE_DEFS).toBe(WILD_TREE_DEFINITIONS)
    expect(getOfficialTreeDefs()).toHaveLength(11)
    expect(getOfficialFruitTreeDefs()).toHaveLength(8)
    expect(getOfficialWildTreeDefs()).toHaveLength(3)
    expect(getOfficialTreeDefs().map(tree => tree.id)).toEqual([
      ...FRUIT_TREE_DEFS.map(tree => toOfficialContentId(tree.type)),
      ...WILD_TREE_DEFS.map(tree => toOfficialContentId(tree.type))
    ])

    for (const tree of FRUIT_TREE_DEFS) {
      expect(getOfficialTreeDef(tree.type)).toEqual({
        id: toOfficialContentId(tree.type),
        kind: 'fruit',
        name: { key: `taoyuan.tree.${tree.type}.name`, fallback: tree.name },
        seedItemId: toOfficialContentId(tree.saplingId),
        growthDays: tree.growthDays,
        saplingPrice: tree.saplingPrice,
        fruitItemId: toOfficialContentId(tree.fruitId),
        fruitName: { key: `taoyuan.tree.${tree.type}.fruit.name`, fallback: tree.fruitName },
        fruitSeason: tree.fruitSeason,
        fruitSellPrice: tree.fruitSellPrice
      })
      expect(getOfficialTreeDef(toOfficialContentId(tree.type))).toBe(getOfficialTreeDef(tree.type))
      expect(getOfficialFruitTreeById(tree.type)).toEqual(tree)
      expect(getOfficialFruitTreeById(toOfficialContentId(tree.type))).toEqual(tree)
      expect(getFruitTreeDef(tree.type)).toEqual(tree)
    }
    for (const tree of WILD_TREE_DEFS) {
      expect(getOfficialTreeDef(tree.type)).toEqual({
        id: toOfficialContentId(tree.type),
        kind: 'wild',
        name: { key: `taoyuan.tree.${tree.type}.name`, fallback: tree.name },
        seedItemId: toOfficialContentId(tree.seedItemId),
        growthDays: tree.growthDays,
        tapProductItemId: toOfficialContentId(tree.tapProduct),
        tapProductName: { key: `taoyuan.tree.${tree.type}.tap-product.name`, fallback: tree.tapProductName },
        tapCycleDays: tree.tapCycleDays
      })
      expect(getOfficialTreeDef(toOfficialContentId(tree.type))).toBe(getOfficialTreeDef(tree.type))
      expect(getOfficialWildTreeById(tree.type)).toEqual(tree)
      expect(getOfficialWildTreeById(toOfficialContentId(tree.type))).toEqual(tree)
      expect(getWildTreeDef(tree.type)).toEqual(tree)
    }
  })

  it('queries trees by sapling and produced item without exposing mutable registry data', () => {
    expect(getOfficialFruitTreeBySaplingId('sapling_peach')).toEqual(FRUIT_TREE_DEFS[0])
    expect(getOfficialFruitTreeBySaplingId('taoyuan:sapling_peach')).toEqual(FRUIT_TREE_DEFS[0])
    expect(getOfficialTreeByProductItemId('tree_peach')?.id).toBe(toOfficialContentId('peach_tree'))
    expect(getOfficialTreeByProductItemId('taoyuan:tree_peach')?.id).toBe(toOfficialContentId('peach_tree'))
    expect(getOfficialTreeByProductItemId('pine_resin')?.id).toBe(toOfficialContentId('pine'))
    expect(getOfficialTreeByProductItemId('taoyuan:pine_resin')?.id).toBe(toOfficialContentId('pine'))
    expect(getOfficialTreeDef('missing_tree')).toBeUndefined()
    expect(getOfficialFruitTreeById('pine')).toBeUndefined()
    expect(getOfficialWildTreeById('peach_tree')).toBeUndefined()
    expect(Object.isFrozen(getOfficialTreeDef('peach_tree'))).toBe(true)
    expect(Object.isFrozen(getOfficialTreeDef('peach_tree')?.name)).toBe(true)
  })

  it('reports missing seed, fruit, and tap-product item references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<TreeDef>(toOfficialRegistryTypeId('tree'))
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('invalid_fruit_tree'),
      kind: 'fruit',
      name: { key: 'test.invalid-fruit.name', fallback: 'Invalid fruit' },
      seedItemId: toOfficialContentId('missing_sapling'),
      growthDays: 1,
      saplingPrice: 0,
      fruitItemId: toOfficialContentId('missing_fruit'),
      fruitName: { key: 'test.invalid-fruit.product', fallback: 'Invalid fruit' },
      fruitSeason: 'spring',
      fruitSellPrice: 0
    })
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('invalid_wild_tree'),
      kind: 'wild',
      name: { key: 'test.invalid-wild.name', fallback: 'Invalid wild' },
      seedItemId: toOfficialContentId('missing_seed'),
      growthDays: 1,
      tapProductItemId: toOfficialContentId('missing_tap_product'),
      tapProductName: { key: 'test.invalid-wild.product', fallback: 'Invalid product' },
      tapCycleDays: 1
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(diagnostic =>
      diagnostic.contentId?.startsWith('taoyuan:missing_')
    )
    expect(diagnostics.map(diagnostic => ({
      code: diagnostic.code,
      contentId: diagnostic.contentId,
      fieldPath: diagnostic.fieldPath
    }))).toEqual([
      { code: 'REG-REFERENCE-001', contentId: 'taoyuan:missing_sapling', fieldPath: '/seedItemId' },
      { code: 'REG-REFERENCE-001', contentId: 'taoyuan:missing_fruit', fieldPath: '/fruitItemId' },
      { code: 'REG-REFERENCE-001', contentId: 'taoyuan:missing_seed', fieldPath: '/seedItemId' },
      { code: 'REG-REFERENCE-001', contentId: 'taoyuan:missing_tap_product', fieldPath: '/tapProductItemId' }
    ])
  })
})
