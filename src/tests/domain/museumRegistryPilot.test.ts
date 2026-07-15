import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  MUSEUM_CATEGORIES as LEGACY_MUSEUM_CATEGORIES,
  MUSEUM_ITEMS as LEGACY_MUSEUM_ITEMS,
  MUSEUM_MILESTONES as LEGACY_MUSEUM_MILESTONES
} from '@/data/museumDefinitions'
import {
  getMuseumCategories,
  getMuseumItemById,
  getMuseumItems,
  getMuseumMilestoneByCount,
  getMuseumMilestones
} from '@/data/museum'
import {
  getOfficialMuseumCategoriesAsLegacy,
  getOfficialMuseumCategoryDef,
  getOfficialMuseumItemById,
  getOfficialMuseumItemDef,
  getOfficialMuseumItemDefs,
  getOfficialMuseumItemsAsLegacy,
  getOfficialMuseumMilestoneByCount,
  getOfficialMuseumMilestoneDef,
  getOfficialMuseumMilestoneDefs,
  getOfficialMuseumMilestonesAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError, RegistrySet } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  MuseumCategoryDefSchema,
  MuseumItemDefSchema,
  MuseumMilestoneDefSchema,
  type ItemDef,
  type MuseumCategoryDef as MuseumCategoryContentDef,
  type MuseumItemDef as MuseumItemContentDef,
  type MuseumMilestoneDef as MuseumMilestoneContentDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_PACKAGE_ID,
  OFFICIAL_REGISTRY_DEFINITIONS,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useMuseumStore } from '@/stores/useMuseumStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { MuseumItemDef as LegacyMuseumItemDef, MuseumMilestone as LegacyMuseumMilestone } from '@/types'
import validMuseumCategories from '../fixtures/mods/minimal-valid-package/data/museum-categories.json'
import validMuseumItems from '../fixtures/mods/minimal-valid-package/data/museum-items.json'
import validMuseumMilestones from '../fixtures/mods/minimal-valid-package/data/museum-milestones.json'

const normalizeMuseumItem = (item: LegacyMuseumItemDef): LegacyMuseumItemDef => ({ ...item })
const normalizeMuseumMilestone = (milestone: LegacyMuseumMilestone): LegacyMuseumMilestone =>
  JSON.parse(JSON.stringify(milestone))

const expectedMuseumCategoryContentDef = (
  category: (typeof LEGACY_MUSEUM_CATEGORIES)[number]
): MuseumCategoryContentDef => ({
  id: toOfficialContentId(`museum_category/${category.key}`),
  key: category.key,
  label: { key: `taoyuan.museum_category.${category.key}.label`, fallback: category.label }
})

const expectedMuseumItemContentDef = (item: LegacyMuseumItemDef): MuseumItemContentDef => ({
  id: toOfficialContentId(item.id),
  itemId: toOfficialContentId(item.id),
  name: { key: `taoyuan.museum_item.${item.id}.name`, fallback: item.name },
  category: item.category,
  sourceHint: { key: `taoyuan.museum_item.${item.id}.sourceHint`, fallback: item.sourceHint }
})

const expectedMuseumMilestoneContentDef = (milestone: LegacyMuseumMilestone): MuseumMilestoneContentDef => ({
  id: toOfficialContentId(`museum_milestone/${milestone.count}`),
  count: milestone.count,
  name: { key: `taoyuan.museum_milestone.${milestone.count}.name`, fallback: milestone.name },
  reward: {
    ...(milestone.reward.money !== undefined ? { money: milestone.reward.money } : {}),
    ...(milestone.reward.items
      ? {
          items: milestone.reward.items.map(item => ({
            itemId: toOfficialContentId(item.itemId),
            quantity: item.quantity
          }))
        }
      : {})
  }
})

describe('museum registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external museum JSON before registration', () => {
    const externalMuseumCategories: unknown = validMuseumCategories
    const externalMuseumItems: unknown = validMuseumItems
    const externalMuseumMilestones: unknown = validMuseumMilestones

    expect(validateUnknown(Type.Array(MuseumCategoryDefSchema), externalMuseumCategories, {
      stage: 'test.museum-categories'
    }).ok).toBe(true)
    expect(validateUnknown(Type.Array(MuseumItemDefSchema), externalMuseumItems, {
      stage: 'test.museum-items'
    }).ok).toBe(true)
    expect(validateUnknown(Type.Array(MuseumMilestoneDefSchema), externalMuseumMilestones, {
      stage: 'test.museum-milestones'
    }).ok).toBe(true)
  })

  it('rejects invalid museum shapes and extra properties', () => {
    const invalidMuseumCategories: unknown = [
      { ...validMuseumCategories[0], key: 'unknown' },
      { ...validMuseumCategories[0], label: { key: '', fallback: 'Broken' } }
    ]
    const invalidMuseumItems: unknown = [
      { ...validMuseumItems[0], category: 'unknown' },
      { ...validMuseumItems[0], itemId: 'bad id' },
      { ...validMuseumItems[0], extra: true }
    ]
    const invalidMuseumMilestones: unknown = [
      { ...validMuseumMilestones[0], count: 0 },
      { ...validMuseumMilestones[0], reward: { items: [{ itemId: 'bad id', quantity: 0 }] } }
    ]

    const categoryResult = validateUnknown(Type.Array(MuseumCategoryDefSchema), invalidMuseumCategories, {
      stage: 'test.museum-categories.invalid'
    })
    const itemResult = validateUnknown(Type.Array(MuseumItemDefSchema), invalidMuseumItems, {
      stage: 'test.museum-items.invalid'
    })
    const milestoneResult = validateUnknown(Type.Array(MuseumMilestoneDefSchema), invalidMuseumMilestones, {
      stage: 'test.museum-milestones.invalid'
    })

    expect(categoryResult.ok).toBe(false)
    expect(itemResult.ok).toBe(false)
    expect(milestoneResult.ok).toBe(false)
    if (!categoryResult.ok) {
      expect(categoryResult.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(
        expect.arrayContaining(['/0/key', '/1/label/key'])
      )
    }
    if (!itemResult.ok) {
      expect(itemResult.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(
        expect.arrayContaining(['/0/category', '/1/itemId', '/2/extra'])
      )
    }
    if (!milestoneResult.ok) {
      expect(milestoneResult.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(
        expect.arrayContaining(['/0/count', '/1/reward/items/0/itemId', '/1/reward/items/0/quantity'])
      )
    }
  })

  it('registers museum categories, items and milestones with equivalent legacy fields', () => {
    expect(getOfficialMuseumCategoriesAsLegacy()).toEqual(LEGACY_MUSEUM_CATEGORIES)
    expect(getMuseumCategories()).toEqual(LEGACY_MUSEUM_CATEGORIES)
    for (const category of LEGACY_MUSEUM_CATEGORIES) {
      expect(getOfficialMuseumCategoryDef(category.key)).toEqual(expectedMuseumCategoryContentDef(category))
      expect(getOfficialMuseumCategoryDef(`museum_category/${category.key}`)).toBe(getOfficialMuseumCategoryDef(category.key))
    }

    expect(getOfficialMuseumItemDefs()).toHaveLength(LEGACY_MUSEUM_ITEMS.length)
    expect(getOfficialMuseumItemDefs().map(item => item.id)).toEqual(
      LEGACY_MUSEUM_ITEMS.map(item => toOfficialContentId(item.id))
    )
    expect(getOfficialMuseumItemsAsLegacy().map(normalizeMuseumItem)).toEqual(
      LEGACY_MUSEUM_ITEMS.map(normalizeMuseumItem)
    )
    expect(getMuseumItems().map(normalizeMuseumItem)).toEqual(LEGACY_MUSEUM_ITEMS.map(normalizeMuseumItem))
    for (const item of LEGACY_MUSEUM_ITEMS) {
      expect(getOfficialMuseumItemDef(item.id)).toEqual(expectedMuseumItemContentDef(item))
      expect(getOfficialMuseumItemDef(toOfficialContentId(item.id))).toBe(getOfficialMuseumItemDef(item.id))
      expect(getOfficialMuseumItemById(item.id)).toEqual(normalizeMuseumItem(item))
      expect(getMuseumItemById(item.id)).toEqual(normalizeMuseumItem(item))
    }

    expect(getOfficialMuseumMilestoneDefs().map(milestone => milestone.id)).toEqual(
      LEGACY_MUSEUM_MILESTONES.map(milestone => toOfficialContentId(`museum_milestone/${milestone.count}`))
    )
    expect(getOfficialMuseumMilestonesAsLegacy().map(normalizeMuseumMilestone)).toEqual(
      LEGACY_MUSEUM_MILESTONES.map(normalizeMuseumMilestone)
    )
    expect(getMuseumMilestones().map(normalizeMuseumMilestone)).toEqual(
      LEGACY_MUSEUM_MILESTONES.map(normalizeMuseumMilestone)
    )
    for (const milestone of LEGACY_MUSEUM_MILESTONES) {
      expect(getOfficialMuseumMilestoneDef(milestone.count)).toEqual(expectedMuseumMilestoneContentDef(milestone))
      expect(getOfficialMuseumMilestoneDef(String(milestone.count))).toBe(getOfficialMuseumMilestoneDef(milestone.count))
      expect(getOfficialMuseumMilestoneDef(`museum_milestone/${milestone.count}`)).toBe(
        getOfficialMuseumMilestoneDef(milestone.count)
      )
      expect(getOfficialMuseumMilestoneByCount(milestone.count)).toEqual(normalizeMuseumMilestone(milestone))
      expect(getMuseumMilestoneByCount(milestone.count)).toEqual(normalizeMuseumMilestone(milestone))
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const firstItem = getOfficialMuseumItemDef('copper_ore')
    const firstMilestone = getOfficialMuseumMilestoneDef(5)
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const itemRegistry = registrySet.get<MuseumItemContentDef>(toOfficialRegistryTypeId('museum_item'))
    const milestoneRegistry = registrySet.get<MuseumMilestoneContentDef>(toOfficialRegistryTypeId('museum_milestone'))

    expect(getOfficialMuseumItemDef('missing_museum_item')).toBeUndefined()
    expect(getOfficialMuseumItemById('missing_museum_item')).toBeUndefined()
    expect(getMuseumItemById('missing_museum_item')).toBeUndefined()
    expect(getOfficialMuseumMilestoneDef(999)).toBeUndefined()
    expect(getOfficialMuseumMilestoneByCount(999)).toBeUndefined()
    expect(getMuseumMilestoneByCount(999)).toBeUndefined()
    expect(Object.isFrozen(firstItem)).toBe(true)
    expect(Object.isFrozen(firstItem?.name)).toBe(true)
    expect(Object.isFrozen(firstMilestone?.reward)).toBe(true)
    expect(() => itemRegistry.register(OFFICIAL_PACKAGE_ID, expectedMuseumItemContentDef(LEGACY_MUSEUM_ITEMS[0]!))).toThrow(
      RegistryError
    )
    expect(() =>
      milestoneRegistry.register(OFFICIAL_PACKAGE_ID, expectedMuseumMilestoneContentDef(LEGACY_MUSEUM_MILESTONES[0]!))
    ).toThrow(RegistryError)
  })

  it('reports missing museum item, category and reward references during semantic validation', () => {
    const registrySet = new RegistrySet()
    const owner = OFFICIAL_PACKAGE_ID
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()
    const copperOreItem: ItemDef = {
      id: toOfficialContentId('copper_ore'),
      name: { key: 'taoyuan.item.copper_ore.name', fallback: '铜矿' },
      category: 'ore',
      description: { key: 'taoyuan.item.copper_ore.description', fallback: '铜矿' },
      sellPrice: 10,
      edible: false
    }
    const oreCategory: MuseumCategoryContentDef = {
      id: toOfficialContentId('museum_category/ore'),
      key: 'ore',
      label: { key: 'taoyuan.museum_category.ore.label', fallback: '矿石' }
    }
    const brokenItem: MuseumItemContentDef = {
      id: toOfficialContentId('missing_museum_item'),
      itemId: toOfficialContentId('missing_museum_item'),
      name: { key: 'taoyuan.museum_item.missing.name', fallback: 'Missing' },
      category: 'ore',
      sourceHint: { key: 'taoyuan.museum_item.missing.sourceHint', fallback: 'Missing' }
    }
    const brokenCategoryItem: MuseumItemContentDef = {
      ...brokenItem,
      id: toOfficialContentId('broken_category_museum_item'),
      itemId: toOfficialContentId('copper_ore'),
      category: 'spirit'
    }
    const brokenMilestone: MuseumMilestoneContentDef = {
      id: toOfficialContentId('museum_milestone/999'),
      count: 999,
      name: { key: 'taoyuan.museum_milestone.999.name', fallback: 'Broken' },
      reward: {
        items: [{ itemId: toOfficialContentId('missing_milestone_reward'), quantity: 1 }]
      }
    }

    registrySet.get<ItemDef>(toOfficialRegistryTypeId('item')).register(owner, copperOreItem)
    registrySet.get<MuseumCategoryContentDef>(toOfficialRegistryTypeId('museum_category')).register(owner, oreCategory)
    registrySet.get<MuseumItemContentDef>(toOfficialRegistryTypeId('museum_item')).register(owner, brokenItem)
    registrySet.get<MuseumItemContentDef>(toOfficialRegistryTypeId('museum_item')).register(owner, brokenCategoryItem)
    registrySet.get<MuseumMilestoneContentDef>(toOfficialRegistryTypeId('museum_milestone')).register(owner, brokenMilestone)

    const diagnostics = validateRegistrySemantics(registrySet).filter(diagnostic =>
      diagnostic.fieldPath === '/itemId' ||
      diagnostic.fieldPath === '/category' ||
      diagnostic.fieldPath === '/reward/items/0/itemId'
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_museum_item'),
        fieldPath: '/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('museum_category'),
        contentId: toOfficialContentId('museum_category/spirit'),
        fieldPath: '/category'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_milestone_reward'),
        fieldPath: '/reward/items/0/itemId'
      })
    ]))
  })

  it('keeps donation, milestone rewards and old save restore registry-backed', () => {
    const museumStore = useMuseumStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    inventoryStore.addItem('copper_ore', 2)
    expect(museumStore.totalCount).toBe(LEGACY_MUSEUM_ITEMS.length)
    expect(museumStore.canDonate('copper_ore')).toBe(true)
    expect(museumStore.donateItem('copper_ore')).toBe(true)
    expect(museumStore.isDonated('copper_ore')).toBe(true)
    expect(inventoryStore.getItemCount('copper_ore')).toBe(1)
    expect(museumStore.donateItem('missing_museum_item')).toBe(false)

    const firstFive = LEGACY_MUSEUM_ITEMS.slice(0, 5).map(item => item.id)
    museumStore.deserialize({ donatedItems: firstFive, claimedMilestones: [] })
    const startingMoney = playerStore.money
    expect(museumStore.claimableMilestones.map(milestone => milestone.count)).toEqual([5])
    expect(museumStore.claimMilestone(5)).toBe(true)
    expect(playerStore.money).toBe(startingMoney + 300)
    expect(museumStore.claimedMilestones).toEqual([5])

    const restored = museumStore.serialize()
    museumStore.deserialize(restored)
    expect(museumStore.isDonated(firstFive[0]!)).toBe(true)
    expect(museumStore.claimMilestone(5)).toBe(false)
  })
})
