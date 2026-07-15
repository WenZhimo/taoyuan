import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  GUILD_DONATIONS as LEGACY_GUILD_DONATIONS,
  GUILD_LEVELS as LEGACY_GUILD_LEVELS,
  MONSTER_GOALS as LEGACY_MONSTER_GOALS
} from '@/data/guildDefinitions'
import {
  getGuildDonationByItemId,
  getGuildDonations,
  getGuildLevelByLevel,
  getGuildLevels,
  getMonsterGoalByMonsterId,
  getMonsterGoals
} from '@/data/guild'
import {
  getOfficialGuildDonationByItemId,
  getOfficialGuildDonationDef,
  getOfficialGuildDonationsAsLegacy,
  getOfficialGuildGoalByMonsterId,
  getOfficialGuildGoalDef,
  getOfficialGuildGoalsAsLegacy,
  getOfficialGuildLevelByLevel,
  getOfficialGuildLevelDef,
  getOfficialGuildLevelsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError, RegistrySet } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  GuildDonationDefSchema,
  GuildGoalDefSchema,
  GuildLevelDefSchema,
  type GuildDonationDef as GuildDonationContentDef,
  type GuildGoalDef as GuildGoalContentDef,
  type GuildLevelDef as GuildLevelContentDef,
  type ItemDef,
  type MonsterDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_PACKAGE_ID,
  OFFICIAL_REGISTRY_DEFINITIONS,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import { useGuildStore } from '@/stores/useGuildStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { GuildDonationDef, GuildLevelDef, MonsterGoalDef } from '@/types'
import validGuildDonations from '../fixtures/mods/minimal-valid-package/data/guild-donations.json'
import validGuildGoals from '../fixtures/mods/minimal-valid-package/data/guild-goals.json'
import validGuildLevels from '../fixtures/mods/minimal-valid-package/data/guild-levels.json'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const expectedGuildGoalContentDef = (goal: MonsterGoalDef): GuildGoalContentDef => ({
  id: toOfficialContentId(`guild_goal/${goal.monsterId}`),
  monsterId: toOfficialContentId(goal.monsterId),
  monsterName: { key: `taoyuan.guild_goal.${goal.monsterId}.monsterName`, fallback: goal.monsterName },
  zone: goal.zone as GuildGoalContentDef['zone'],
  killTarget: goal.killTarget,
  reward: {
    ...(goal.reward.money !== undefined ? { money: goal.reward.money } : {}),
    ...(goal.reward.items
      ? {
          items: goal.reward.items.map(item => ({
            itemId: toOfficialContentId(item.itemId),
            quantity: item.quantity
          }))
        }
      : {})
  },
  description: { key: `taoyuan.guild_goal.${goal.monsterId}.description`, fallback: goal.description }
})

const expectedGuildDonationContentDef = (donation: GuildDonationDef): GuildDonationContentDef => ({
  id: toOfficialContentId(`guild_donation/${donation.itemId}`),
  itemId: toOfficialContentId(donation.itemId),
  points: donation.points
})

const expectedGuildLevelContentDef = (level: GuildLevelDef): GuildLevelContentDef => ({
  id: toOfficialContentId(`guild_level/${level.level}`),
  level: level.level,
  expRequired: level.expRequired
})

describe('guild registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external guild JSON before registration', () => {
    const externalGoals: unknown = validGuildGoals
    const externalDonations: unknown = validGuildDonations
    const externalLevels: unknown = validGuildLevels

    expect(validateUnknown(Type.Array(GuildGoalDefSchema), externalGoals, { stage: 'test.guild-goals' }).ok).toBe(true)
    expect(validateUnknown(Type.Array(GuildDonationDefSchema), externalDonations, { stage: 'test.guild-donations' }).ok).toBe(true)
    expect(validateUnknown(Type.Array(GuildLevelDefSchema), externalLevels, { stage: 'test.guild-levels' }).ok).toBe(true)
  })

  it('rejects invalid guild shapes and extra properties', () => {
    const invalidGoals: unknown = [
      { ...validGuildGoals[0], zone: 'unknown' },
      { ...validGuildGoals[0], killTarget: 0 },
      { ...validGuildGoals[0], reward: { items: [{ itemId: 'bad id', quantity: 0 }] }, extra: true }
    ]
    const invalidDonations: unknown = [
      { ...validGuildDonations[0], itemId: 'bad id' },
      { ...validGuildDonations[0], points: 0 }
    ]
    const invalidLevels: unknown = [
      { ...validGuildLevels[0], level: 0 },
      { ...validGuildLevels[0], expRequired: -1 }
    ]

    const goalResult = validateUnknown(Type.Array(GuildGoalDefSchema), invalidGoals, { stage: 'test.guild-goals.invalid' })
    const donationResult = validateUnknown(Type.Array(GuildDonationDefSchema), invalidDonations, { stage: 'test.guild-donations.invalid' })
    const levelResult = validateUnknown(Type.Array(GuildLevelDefSchema), invalidLevels, { stage: 'test.guild-levels.invalid' })

    expect(goalResult.ok).toBe(false)
    expect(donationResult.ok).toBe(false)
    expect(levelResult.ok).toBe(false)
    if (!goalResult.ok) {
      expect(goalResult.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(
        expect.arrayContaining(['/0/zone', '/1/killTarget', '/2/reward/items/0/itemId', '/2/reward/items/0/quantity', '/2/extra'])
      )
    }
    if (!donationResult.ok) {
      expect(donationResult.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(
        expect.arrayContaining(['/0/itemId', '/1/points'])
      )
    }
    if (!levelResult.ok) {
      expect(levelResult.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(
        expect.arrayContaining(['/0/level', '/1/expRequired'])
      )
    }
  })

  it('registers guild goals, donations and levels with equivalent legacy fields', () => {
    expect(getOfficialGuildGoalsAsLegacy().map(clone)).toEqual(LEGACY_MONSTER_GOALS.map(clone))
    expect(getMonsterGoals().map(clone)).toEqual(LEGACY_MONSTER_GOALS.map(clone))
    for (const goal of LEGACY_MONSTER_GOALS) {
      expect(getOfficialGuildGoalDef(goal.monsterId)).toEqual(expectedGuildGoalContentDef(goal))
      expect(getOfficialGuildGoalDef(`guild_goal/${goal.monsterId}`)).toBe(getOfficialGuildGoalDef(goal.monsterId))
      expect(getOfficialGuildGoalByMonsterId(goal.monsterId)).toEqual(clone(goal))
      expect(getOfficialGuildGoalByMonsterId(toOfficialContentId(goal.monsterId))).toEqual(clone(goal))
      expect(getMonsterGoalByMonsterId(goal.monsterId)).toEqual(clone(goal))
      expect(getMonsterGoalByMonsterId(toOfficialContentId(goal.monsterId))).toEqual(clone(goal))
    }

    expect(getOfficialGuildDonationsAsLegacy().map(clone)).toEqual(LEGACY_GUILD_DONATIONS.map(clone))
    expect(getGuildDonations().map(clone)).toEqual(LEGACY_GUILD_DONATIONS.map(clone))
    for (const donation of LEGACY_GUILD_DONATIONS) {
      expect(getOfficialGuildDonationDef(donation.itemId)).toEqual(expectedGuildDonationContentDef(donation))
      expect(getOfficialGuildDonationByItemId(donation.itemId)).toEqual(clone(donation))
      expect(getOfficialGuildDonationByItemId(toOfficialContentId(donation.itemId))).toEqual(clone(donation))
      expect(getGuildDonationByItemId(donation.itemId)).toEqual(clone(donation))
      expect(getGuildDonationByItemId(toOfficialContentId(donation.itemId))).toEqual(clone(donation))
    }

    expect(getOfficialGuildLevelsAsLegacy().map(clone)).toEqual(LEGACY_GUILD_LEVELS.map(clone))
    expect(getGuildLevels().map(clone)).toEqual(LEGACY_GUILD_LEVELS.map(clone))
    for (const level of LEGACY_GUILD_LEVELS) {
      expect(getOfficialGuildLevelDef(level.level)).toEqual(expectedGuildLevelContentDef(level))
      expect(getOfficialGuildLevelByLevel(level.level)).toEqual(clone(level))
      expect(getGuildLevelByLevel(level.level)).toEqual(clone(level))
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const firstGoal = getOfficialGuildGoalDef(LEGACY_MONSTER_GOALS[0]!.monsterId)
    const firstDonation = getOfficialGuildDonationDef(LEGACY_GUILD_DONATIONS[0]!.itemId)
    const firstLevel = getOfficialGuildLevelDef(LEGACY_GUILD_LEVELS[0]!.level)
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const goalRegistry = registrySet.get<GuildGoalContentDef>(toOfficialRegistryTypeId('guild_goal'))
    const donationRegistry = registrySet.get<GuildDonationContentDef>(toOfficialRegistryTypeId('guild_donation'))
    const levelRegistry = registrySet.get<GuildLevelContentDef>(toOfficialRegistryTypeId('guild_level'))

    expect(getOfficialGuildGoalDef('missing_goal')).toBeUndefined()
    expect(getOfficialGuildGoalByMonsterId('missing_goal')).toBeUndefined()
    expect(getMonsterGoalByMonsterId('missing_goal')).toBeUndefined()
    expect(getOfficialGuildDonationDef('missing_item')).toBeUndefined()
    expect(getOfficialGuildDonationByItemId('missing_item')).toBeUndefined()
    expect(getGuildDonationByItemId('missing_item')).toBeUndefined()
    expect(getOfficialGuildLevelDef(99)).toBeUndefined()
    expect(getOfficialGuildLevelByLevel(99)).toBeUndefined()
    expect(getGuildLevelByLevel(99)).toBeUndefined()
    expect(Object.isFrozen(firstGoal)).toBe(true)
    expect(Object.isFrozen(firstGoal?.reward)).toBe(true)
    expect(Object.isFrozen(firstDonation)).toBe(true)
    expect(Object.isFrozen(firstLevel)).toBe(true)
    expect(() => goalRegistry.register(OFFICIAL_PACKAGE_ID, expectedGuildGoalContentDef(LEGACY_MONSTER_GOALS[0]!))).toThrow(RegistryError)
    expect(() => donationRegistry.register(OFFICIAL_PACKAGE_ID, expectedGuildDonationContentDef(LEGACY_GUILD_DONATIONS[0]!))).toThrow(RegistryError)
    expect(() => levelRegistry.register(OFFICIAL_PACKAGE_ID, expectedGuildLevelContentDef(LEGACY_GUILD_LEVELS[0]!))).toThrow(RegistryError)
  })

  it('reports missing guild monster, reward item and donation item references during semantic validation', () => {
    const registrySet = new RegistrySet()
    const owner = OFFICIAL_PACKAGE_ID
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()
    const copperOreItem: ItemDef = {
      id: toOfficialContentId('copper_ore'),
      name: { key: 'taoyuan.item.copper_ore.name', fallback: '??' },
      category: 'ore',
      description: { key: 'taoyuan.item.copper_ore.description', fallback: '??' },
      sellPrice: 10,
      edible: false
    }
    const monster: MonsterDef = {
      id: toOfficialContentId('mud_worm'),
      name: { key: 'taoyuan.monster.mud_worm.name', fallback: '??' },
      hp: 1,
      attack: 0,
      defense: 0,
      expReward: 0,
      description: { key: 'taoyuan.monster.mud_worm.description', fallback: '??' }
    }
    const brokenGoal: GuildGoalContentDef = {
      id: toOfficialContentId('guild_goal/missing_monster'),
      monsterId: toOfficialContentId('missing_monster'),
      monsterName: { key: 'taoyuan.guild_goal.missing.monsterName', fallback: 'Missing' },
      zone: 'shallow',
      killTarget: 1,
      reward: { items: [{ itemId: toOfficialContentId('missing_goal_reward'), quantity: 1 }] },
      description: { key: 'taoyuan.guild_goal.missing.description', fallback: 'Missing' }
    }
    const brokenDonation: GuildDonationContentDef = {
      id: toOfficialContentId('guild_donation/missing_donation_item'),
      itemId: toOfficialContentId('missing_donation_item'),
      points: 1
    }

    registrySet.get<ItemDef>(toOfficialRegistryTypeId('item')).register(owner, copperOreItem)
    registrySet.get<MonsterDef>(toOfficialRegistryTypeId('monster')).register(owner, monster)
    registrySet.get<GuildGoalContentDef>(toOfficialRegistryTypeId('guild_goal')).register(owner, brokenGoal)
    registrySet.get<GuildDonationContentDef>(toOfficialRegistryTypeId('guild_donation')).register(owner, brokenDonation)

    const diagnostics = validateRegistrySemantics(registrySet).filter(diagnostic =>
      diagnostic.fieldPath === '/monsterId' ||
      diagnostic.fieldPath === '/reward/items/0/itemId' ||
      diagnostic.fieldPath === '/itemId'
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('monster'),
        contentId: toOfficialContentId('missing_monster'),
        fieldPath: '/monsterId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_goal_reward'),
        fieldPath: '/reward/items/0/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_donation_item'),
        fieldPath: '/itemId'
      })
    ]))
  })

  it('keeps goal claims, donations, level-up and old save migration registry-backed', () => {
    const guildStore = useGuildStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    const startingMoney = playerStore.money

    for (let i = 0; i < 25; i++) guildStore.recordKill('mud_worm')
    expect(guildStore.completedGoalCount).toBe(1)
    expect(guildStore.claimableGoals.map(goal => goal.monsterId)).toContain('mud_worm')
    expect(guildStore.claimGoal('mud_worm')).toBe(true)
    expect(playerStore.money).toBe(startingMoney + 200)
    expect(guildStore.contributionPoints).toBe(35)
    expect(guildStore.claimGoal('mud_worm')).toBe(false)

    inventoryStore.addItem('copper_ore', 50)
    expect(guildStore.donateItem('copper_ore', 50)).toEqual({ success: true, pointsGained: 100 })
    expect(inventoryStore.getItemCount('copper_ore')).toBe(0)
    expect(guildStore.guildExp).toBe(100)
    expect(guildStore.guildLevel).toBe(1)

    const restored = guildStore.serialize()
    guildStore.deserialize(restored)
    expect(guildStore.claimedGoals).toEqual(['mud_worm'])
    expect(guildStore.guildLevel).toBe(1)

    guildStore.deserialize({
      monsterKills: {},
      claimedGoals: ['mud_worm'],
      encounteredMonsters: []
    } as unknown as ReturnType<typeof guildStore.serialize>)
    expect(guildStore.contributionPoints).toBe(35)
    expect(guildStore.guildExp).toBe(0)
    expect(guildStore.guildLevel).toBe(0)
  })
})
