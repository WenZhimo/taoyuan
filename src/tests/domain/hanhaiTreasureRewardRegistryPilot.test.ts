import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HANHAI_TREASURE_REWARDS as LEGACY_HANHAI_TREASURE_REWARDS } from '@/data/hanhai'
import { HANHAI_TREASURE_REWARDS as LEAF_HANHAI_TREASURE_REWARDS } from '@/data/hanhaiTreasureDefinitions'
import * as gameLog from '@/composables/useGameLog'
import {
  getOfficialHanhaiTreasureRewardDef,
  getOfficialHanhaiTreasureRewardDefs,
  getOfficialHanhaiTreasureRewardForRoll,
  getOfficialHanhaiTreasureRewardsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  HanhaiTreasureRewardDefSchema,
  type HanhaiTreasureRewardDef as HanhaiTreasureRewardContentDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useHanhaiStore } from '@/stores/useHanhaiStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { HanhaiTreasureRewardDef as LegacyHanhaiTreasureRewardDef } from '@/types'
import validHanhaiTreasureRewards from '../fixtures/mods/minimal-valid-package/data/hanhai-treasure-rewards.json'

const expectedContentDef = (
  reward: LegacyHanhaiTreasureRewardDef
): HanhaiTreasureRewardContentDef => ({
  id: toOfficialContentId(`hanhai_treasure_reward/${reward.id}`),
  rollMaxExclusive: reward.rollMaxExclusive,
  money: reward.money,
  items: reward.items.map(item => ({
    itemId: toOfficialContentId(item.itemId),
    name: {
      key: `taoyuan.hanhai.treasure_reward.${reward.id}.item.${item.itemId}.name`,
      fallback: item.name
    },
    quantity: item.quantity
  }))
})

describe('official hanhai treasure reward registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(gameLog, 'addLog').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates external hanhai treasure reward JSON before registration', () => {
    const externalRewards: unknown = validHanhaiTreasureRewards
    const result = validateUnknown(Type.Array(HanhaiTreasureRewardDefSchema), externalRewards, {
      stage: 'test.hanhai-treasure-reward'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid hanhai treasure reward shapes and numeric bounds', () => {
    const base = validHanhaiTreasureRewards[0]!
    const invalidRewards: unknown = [
      { ...base, id: 'missing_namespace' },
      { ...base, rollMaxExclusive: 0 },
      { ...base, rollMaxExclusive: 1.1 },
      { ...base, money: -1 },
      { ...base, items: [{ itemId: 'example_mod:test_item', name: base.items[0]!.name, quantity: 0 }] },
      { ...base, items: [{ itemId: 'example_mod:test_item', name: 'plain text', quantity: 1 }] },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(HanhaiTreasureRewardDefSchema), invalidRewards, {
      stage: 'test.hanhai-treasure-reward.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/rollMaxExclusive',
        '/2/rollMaxExclusive',
        '/3/money',
        '/4/items/0/quantity',
        '/5/items/0/name',
        '/6/extra'
      ]))
    }
  })

  it('registers Hanhai treasure rewards in legacy order with equivalent fields', () => {
    expect(LEGACY_HANHAI_TREASURE_REWARDS).toBe(LEAF_HANHAI_TREASURE_REWARDS)
    expect(getOfficialHanhaiTreasureRewardDefs()).toHaveLength(LEGACY_HANHAI_TREASURE_REWARDS.length)
    expect(getOfficialHanhaiTreasureRewardDefs()).toEqual(
      LEGACY_HANHAI_TREASURE_REWARDS.map(expectedContentDef)
    )
    expect(getOfficialHanhaiTreasureRewardsAsLegacy()).toEqual(LEGACY_HANHAI_TREASURE_REWARDS)

    for (const reward of LEGACY_HANHAI_TREASURE_REWARDS) {
      expect(getOfficialHanhaiTreasureRewardDef(reward.id)).toEqual(expectedContentDef(reward))
      expect(getOfficialHanhaiTreasureRewardDef(`hanhai_treasure_reward/${reward.id}`)).toBe(
        getOfficialHanhaiTreasureRewardDef(reward.id)
      )
      expect(getOfficialHanhaiTreasureRewardDef(toOfficialContentId(`hanhai_treasure_reward/${reward.id}`))).toBe(
        getOfficialHanhaiTreasureRewardDef(reward.id)
      )
    }

    expect(getOfficialHanhaiTreasureRewardForRoll(0.049)).toEqual(LEGACY_HANHAI_TREASURE_REWARDS[0])
    expect(getOfficialHanhaiTreasureRewardForRoll(0.05)).toEqual(LEGACY_HANHAI_TREASURE_REWARDS[1])
    expect(getOfficialHanhaiTreasureRewardForRoll(0.99)).toEqual(LEGACY_HANHAI_TREASURE_REWARDS[3])
  })

  it('reports missing treasure reward item references in semantic validation', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<HanhaiTreasureRewardContentDef>(
      toOfficialRegistryTypeId('hanhai_treasure_reward')
    )
    const missingItem = toOfficialContentId('missing_hanhai_treasure_reward_item')

    registry.register(OFFICIAL_PACKAGE_ID, {
      ...expectedContentDef(LEGACY_HANHAI_TREASURE_REWARDS[0]!),
      id: toOfficialContentId('hanhai_treasure_reward/missing_item'),
      items: [
        {
          itemId: missingItem,
          name: {
            key: 'taoyuan.hanhai.treasure_reward.missing_item.item.name',
            fallback: '缺失物品'
          },
          quantity: 1
        }
      ]
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.code === 'REG-REFERENCE-001'
    )

    expect(diagnostics).toContainEqual(expect.objectContaining({
      registryId: toOfficialRegistryTypeId('item'),
      contentId: missingItem,
      fieldPath: '/items/0/itemId'
    }))
  })

  it('keeps Hanhai treasure map grand reward behavior registry-backed', () => {
    const hanhaiStore = useHanhaiStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.04)

    playerStore.money = 0
    expect(inventoryStore.addItem('hanhai_map', 1)).toBe(true)

    const result = hanhaiStore.useTreasureMap()

    expect(randomSpy).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      success: true,
      message: '寻宝成功！获得：5000文、绿松石×2',
      rewards: [
        { itemId: '', name: '5000文', quantity: 1 },
        { itemId: 'hanhai_turquoise', name: '绿松石', quantity: 2 }
      ]
    })
    expect(playerStore.money).toBe(5000)
    expect(inventoryStore.getItemCount('hanhai_map')).toBe(0)
    expect(inventoryStore.getItemCount('hanhai_turquoise')).toBe(2)
    expect(gameLog.addLog).toHaveBeenCalledWith('使用藏宝图寻宝，发现了：5000文、绿松石×2！')
  })

  it('keeps Hanhai treasure map consolation reward behavior registry-backed', () => {
    const hanhaiStore = useHanhaiStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99)

    playerStore.money = 0
    expect(inventoryStore.addItem('hanhai_map', 1)).toBe(true)

    const result = hanhaiStore.useTreasureMap()

    expect(randomSpy).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      success: true,
      message: '寻宝成功！获得：500文',
      rewards: [{ itemId: '', name: '500文', quantity: 1 }]
    })
    expect(playerStore.money).toBe(500)
    expect(inventoryStore.getItemCount('hanhai_map')).toBe(0)
    expect(inventoryStore.getItemCount('hanhai_turquoise')).toBe(0)
    expect(inventoryStore.getItemCount('hanhai_spice')).toBe(0)
    expect(inventoryStore.getItemCount('hanhai_silk')).toBe(0)
    expect(gameLog.addLog).toHaveBeenCalledWith('使用藏宝图寻宝，发现了：500文！')
  })
})
