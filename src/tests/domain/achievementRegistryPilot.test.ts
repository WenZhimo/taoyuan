import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  ACHIEVEMENTS as LEGACY_ACHIEVEMENTS,
  COMMUNITY_BUNDLES as LEGACY_COMMUNITY_BUNDLES
} from '@/data/achievementDefinitions'
import {
  getAchievementById,
  getAchievements,
  getBundleById,
  getCommunityBundles
} from '@/data/achievements'
import {
  getOfficialAchievementById,
  getOfficialAchievementDef,
  getOfficialAchievementsAsLegacy,
  getOfficialCommunityBundleById,
  getOfficialCommunityBundleDef,
  getOfficialCommunityBundlesAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError, RegistrySet } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  AchievementDefSchema,
  CommunityBundleDefSchema,
  type AchievementDef as AchievementContentDef,
  type CommunityBundleDef as CommunityBundleContentDef,
  type ItemDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_PACKAGE_ID,
  OFFICIAL_REGISTRY_DEFINITIONS,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { AchievementDef as LegacyAchievementDef, CommunityBundleDef as LegacyCommunityBundleDef } from '@/types'
import validAchievements from '../fixtures/mods/minimal-valid-package/data/achievements.json'
import validCommunityBundles from '../fixtures/mods/minimal-valid-package/data/community-bundles.json'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const expectedAchievementReward = (
  reward: LegacyAchievementDef['reward']
): AchievementContentDef['reward'] => ({
  ...(reward.money !== undefined ? { money: reward.money } : {}),
  ...(reward.items
    ? {
        items: reward.items.map(item => ({
          itemId: toOfficialContentId(item.itemId),
          quantity: item.quantity
        }))
      }
    : {})
})

const expectedAchievementCondition = (
  achievement: LegacyAchievementDef
): AchievementContentDef['condition'] =>
  achievement.condition.type === 'itemDiscovered'
    ? {
        type: 'itemDiscovered',
        itemId: toOfficialContentId(achievement.condition.itemId)
      }
    : (clone(achievement.condition) as AchievementContentDef['condition'])

const expectedAchievementContentDef = (achievement: LegacyAchievementDef): AchievementContentDef => ({
  id: toOfficialContentId(`achievement/${achievement.id}`),
  name: { key: `taoyuan.achievement.${achievement.id}.name`, fallback: achievement.name },
  description: { key: `taoyuan.achievement.${achievement.id}.description`, fallback: achievement.description },
  condition: expectedAchievementCondition(achievement),
  reward: expectedAchievementReward(achievement.reward)
})

const expectedCommunityBundleContentDef = (bundle: LegacyCommunityBundleDef): CommunityBundleContentDef => ({
  id: toOfficialContentId(`community_bundle/${bundle.id}`),
  name: { key: `taoyuan.community_bundle.${bundle.id}.name`, fallback: bundle.name },
  description: { key: `taoyuan.community_bundle.${bundle.id}.description`, fallback: bundle.description },
  requiredItems: bundle.requiredItems.map(item => ({
    itemId: toOfficialContentId(item.itemId),
    quantity: item.quantity
  })),
  reward: {
    ...(bundle.reward.money !== undefined ? { money: bundle.reward.money } : {}),
    ...(bundle.reward.items
      ? {
          items: bundle.reward.items.map(item => ({
            itemId: toOfficialContentId(item.itemId),
            quantity: item.quantity
          }))
        }
      : {}),
    description: {
      key: `taoyuan.community_bundle.${bundle.id}.reward.description`,
      fallback: bundle.reward.description
    }
  }
})

describe('achievement registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external achievement and community bundle JSON before registration', () => {
    const externalAchievements: unknown = validAchievements
    const externalBundles: unknown = validCommunityBundles

    expect(validateUnknown(Type.Array(AchievementDefSchema), externalAchievements, {
      stage: 'test.achievements'
    }).ok).toBe(true)
    expect(validateUnknown(Type.Array(CommunityBundleDefSchema), externalBundles, {
      stage: 'test.community-bundles'
    }).ok).toBe(true)
  })

  it('rejects invalid achievement and community bundle shapes', () => {
    const invalidAchievements: unknown = [
      { ...validAchievements[0], condition: { type: 'skillLevel', skillType: 'unknown', level: 1 } },
      { ...validAchievements[0], reward: { items: [{ itemId: 'bad id', quantity: 0 }] } },
      { ...validAchievements[0], extra: true }
    ]
    const invalidBundles: unknown = [
      { ...validCommunityBundles[0], requiredItems: [] },
      { ...validCommunityBundles[0], requiredItems: [{ itemId: 'bad id', quantity: 0 }] },
      { ...validCommunityBundles[0], reward: { description: { key: '', fallback: 'Broken' } } }
    ]

    const achievementResult = validateUnknown(Type.Array(AchievementDefSchema), invalidAchievements, {
      stage: 'test.achievements.invalid'
    })
    const bundleResult = validateUnknown(Type.Array(CommunityBundleDefSchema), invalidBundles, {
      stage: 'test.community-bundles.invalid'
    })

    expect(achievementResult.ok).toBe(false)
    expect(bundleResult.ok).toBe(false)
    if (!achievementResult.ok) {
      expect(achievementResult.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(
        expect.arrayContaining(['/0/condition/skillType', '/1/reward/items/0/itemId', '/1/reward/items/0/quantity', '/2/extra'])
      )
    }
    if (!bundleResult.ok) {
      expect(bundleResult.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(
        expect.arrayContaining(['/0/requiredItems', '/1/requiredItems/0/itemId', '/1/requiredItems/0/quantity', '/2/reward/description/key'])
      )
    }
  })

  it('registers achievements and community bundles with equivalent legacy fields', () => {
    expect(getOfficialAchievementsAsLegacy().map(clone)).toEqual(LEGACY_ACHIEVEMENTS.map(clone))
    expect(getAchievements().map(clone)).toEqual(LEGACY_ACHIEVEMENTS.map(clone))
    for (const achievement of LEGACY_ACHIEVEMENTS) {
      expect(getOfficialAchievementDef(achievement.id)).toEqual(expectedAchievementContentDef(achievement))
      expect(getOfficialAchievementDef(`achievement/${achievement.id}`)).toBe(getOfficialAchievementDef(achievement.id))
      expect(getOfficialAchievementDef(toOfficialContentId(`achievement/${achievement.id}`))).toBe(
        getOfficialAchievementDef(achievement.id)
      )
      expect(getOfficialAchievementById(achievement.id)).toEqual(clone(achievement))
      expect(getAchievementById(achievement.id)).toEqual(clone(achievement))
    }

    expect(getOfficialCommunityBundlesAsLegacy().map(clone)).toEqual(LEGACY_COMMUNITY_BUNDLES.map(clone))
    expect(getCommunityBundles().map(clone)).toEqual(LEGACY_COMMUNITY_BUNDLES.map(clone))
    for (const bundle of LEGACY_COMMUNITY_BUNDLES) {
      expect(getOfficialCommunityBundleDef(bundle.id)).toEqual(expectedCommunityBundleContentDef(bundle))
      expect(getOfficialCommunityBundleDef(`community_bundle/${bundle.id}`)).toBe(getOfficialCommunityBundleDef(bundle.id))
      expect(getOfficialCommunityBundleById(bundle.id)).toEqual(clone(bundle))
      expect(getBundleById(bundle.id)).toEqual(clone(bundle))
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const firstAchievement = getOfficialAchievementDef(LEGACY_ACHIEVEMENTS[0]!.id)
    const firstBundle = getOfficialCommunityBundleDef(LEGACY_COMMUNITY_BUNDLES[0]!.id)
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const achievementRegistry = registrySet.get<AchievementContentDef>(toOfficialRegistryTypeId('achievement'))
    const bundleRegistry = registrySet.get<CommunityBundleContentDef>(toOfficialRegistryTypeId('community_bundle'))

    expect(getOfficialAchievementDef('missing_achievement')).toBeUndefined()
    expect(getOfficialAchievementById('missing_achievement')).toBeUndefined()
    expect(getAchievementById('missing_achievement')).toBeUndefined()
    expect(getOfficialCommunityBundleDef('missing_bundle')).toBeUndefined()
    expect(getOfficialCommunityBundleById('missing_bundle')).toBeUndefined()
    expect(getBundleById('missing_bundle')).toBeUndefined()
    expect(Object.isFrozen(firstAchievement)).toBe(true)
    expect(Object.isFrozen(firstAchievement?.reward)).toBe(true)
    expect(Object.isFrozen(firstBundle)).toBe(true)
    expect(Object.isFrozen(firstBundle?.requiredItems)).toBe(true)
    expect(() =>
      achievementRegistry.register(OFFICIAL_PACKAGE_ID, expectedAchievementContentDef(LEGACY_ACHIEVEMENTS[0]!))
    ).toThrow(RegistryError)
    expect(() =>
      bundleRegistry.register(OFFICIAL_PACKAGE_ID, expectedCommunityBundleContentDef(LEGACY_COMMUNITY_BUNDLES[0]!))
    ).toThrow(RegistryError)
  })

  it('reports missing achievement and community bundle item references during semantic validation', () => {
    const registrySet = new RegistrySet()
    const owner = OFFICIAL_PACKAGE_ID
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()
    const item: ItemDef = {
      id: toOfficialContentId('cabbage'),
      name: { key: 'taoyuan.item.cabbage.name', fallback: '青菜' },
      category: 'crop',
      description: { key: 'taoyuan.item.cabbage.description', fallback: '青菜' },
      sellPrice: 80,
      edible: true
    }
    const brokenAchievement: AchievementContentDef = {
      id: toOfficialContentId('achievement/broken'),
      name: { key: 'taoyuan.achievement.broken.name', fallback: 'Broken' },
      description: { key: 'taoyuan.achievement.broken.description', fallback: 'Broken' },
      condition: { type: 'itemDiscovered', itemId: toOfficialContentId('missing_condition_item') },
      reward: { items: [{ itemId: toOfficialContentId('missing_achievement_reward'), quantity: 1 }] }
    }
    const brokenBundle: CommunityBundleContentDef = {
      id: toOfficialContentId('community_bundle/broken'),
      name: { key: 'taoyuan.community_bundle.broken.name', fallback: 'Broken' },
      description: { key: 'taoyuan.community_bundle.broken.description', fallback: 'Broken' },
      requiredItems: [{ itemId: toOfficialContentId('missing_required_item'), quantity: 1 }],
      reward: {
        items: [{ itemId: toOfficialContentId('missing_bundle_reward'), quantity: 1 }],
        description: { key: 'taoyuan.community_bundle.broken.reward.description', fallback: 'Broken' }
      }
    }

    registrySet.get<ItemDef>(toOfficialRegistryTypeId('item')).register(owner, item)
    registrySet.get<AchievementContentDef>(toOfficialRegistryTypeId('achievement')).register(owner, brokenAchievement)
    registrySet.get<CommunityBundleContentDef>(toOfficialRegistryTypeId('community_bundle')).register(owner, brokenBundle)

    const diagnostics = validateRegistrySemantics(registrySet).filter(diagnostic =>
      diagnostic.fieldPath === '/condition/itemId' ||
      diagnostic.fieldPath === '/reward/items/0/itemId' ||
      diagnostic.fieldPath === '/requiredItems/0/itemId'
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_condition_item'),
        fieldPath: '/condition/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_achievement_reward'),
        fieldPath: '/reward/items/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_required_item'),
        fieldPath: '/requiredItems/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_bundle_reward'),
        fieldPath: '/reward/items/0/itemId'
      })
    ]))
  })

  it('keeps achievement rewards, bundle submission and old save migration registry-backed', () => {
    const achievementStore = useAchievementStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    const startingMoney = playerStore.money
    achievementStore.discoverItem('spirit_peach')
    expect(achievementStore.checkAchievements().map(achievement => achievement.id)).toContain('spirit_peach_found')
    expect(playerStore.money).toBe(startingMoney + 300)

    const springBundle = getCommunityBundles().find(bundle => bundle.id === 'spring_bundle')!
    for (const item of springBundle.requiredItems) inventoryStore.addItem(item.itemId, item.quantity)
    const bundleMoney = playerStore.money
    for (const item of springBundle.requiredItems) {
      expect(achievementStore.submitToBundle(springBundle.id, item.itemId, item.quantity)).toBe(true)
    }

    expect(achievementStore.isBundleComplete('spring_bundle')).toBe(true)
    expect(playerStore.money).toBe(bundleMoney + 500)
    expect(inventoryStore.getItemCount('seed_peach')).toBe(3)

    const restored = achievementStore.serialize()
    achievementStore.deserialize(restored)
    expect(achievementStore.completedAchievements).toContain('spirit_peach_found')
    expect(achievementStore.completedBundles).toContain('spring_bundle')

    achievementStore.deserialize({
      discoveredItems: [],
      discoveryTimes: {},
      completedAchievements: [],
      bundleSubmissions: {},
      completedBundles: [],
      stats: {
        totalCropsHarvested: 0,
        totalFishCaught: 0,
        totalMoneyEarned: 0,
        highestMineFloor: 0,
        totalRecipesCooked: 0,
        skullCavernBestFloor: 0
      }
    } as unknown as ReturnType<typeof achievementStore.serialize>)
    expect(achievementStore.stats.totalMonstersKilled).toBe(0)
    expect(achievementStore.stats.totalBreedingsDone).toBe(0)
    expect(achievementStore.stats.totalHybridsDiscovered).toBe(0)
    expect(achievementStore.stats.highestHybridTier).toBe(0)
  })
})
