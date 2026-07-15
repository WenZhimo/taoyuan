import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  WALLET_ITEMS as LEGACY_WALLET_ITEMS,
  getWalletItemById,
  getWalletItems
} from '@/data/wallet'
import {
  getOfficialFishDefsAsLegacy,
  getOfficialWalletItemById,
  getOfficialWalletItemDef,
  getOfficialWalletItemDefs,
  getOfficialWalletItemsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { WalletItemDefSchema, type WalletItemDef as WalletItemContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { useMiningStore } from '@/stores/useMiningStore'
import { useSkillStore } from '@/stores/useSkillStore'
import { useWalletStore } from '@/stores/useWalletStore'
import type { WalletItemDef as LegacyWalletItemDef } from '@/types'
import validWalletItems from '../fixtures/mods/minimal-valid-package/data/wallet-items.json'

const normalizeWalletItem = (item: LegacyWalletItemDef): LegacyWalletItemDef => ({
  ...item,
  effect: { ...item.effect }
})

const expectedWalletItemContentDef = (item: LegacyWalletItemDef): WalletItemContentDef => ({
  id: toOfficialContentId(item.id),
  name: { key: `taoyuan.wallet_item.${item.id}.name`, fallback: item.name },
  description: { key: `taoyuan.wallet_item.${item.id}.description`, fallback: item.description },
  effect: { ...item.effect } as WalletItemContentDef['effect'],
  unlockCondition: {
    key: `taoyuan.wallet_item.${item.id}.unlockCondition`,
    fallback: item.unlockCondition
  }
})

describe('wallet item registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external wallet item JSON before registration', () => {
    const externalWalletItems: unknown = validWalletItems
    const result = validateUnknown(Type.Array(WalletItemDefSchema), externalWalletItems, {
      stage: 'test.wallet-items'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid wallet item shape and effect fields', () => {
    const base = validWalletItems[0]!
    const invalidWalletItems: unknown = [
      { ...base, effect: { ...base.effect, type: 'unknownEffect' } },
      { ...base, effect: { ...base.effect, value: '5%' } },
      { ...base, unlockCondition: { key: '', fallback: 'Broken' } },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(WalletItemDefSchema), invalidWalletItems, {
      stage: 'test.wallet-items.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/effect/type',
        '/1/effect/value',
        '/2/unlockCondition/key',
        '/3/extra'
      ]))
    }
  })

  it('registers all wallet items in legacy order with equivalent fields', () => {
    expect(getOfficialWalletItemDefs()).toHaveLength(LEGACY_WALLET_ITEMS.length)
    expect(getOfficialWalletItemDefs().map(item => item.id)).toEqual(
      LEGACY_WALLET_ITEMS.map(item => toOfficialContentId(item.id))
    )
    expect(getOfficialWalletItemsAsLegacy().map(normalizeWalletItem)).toEqual(
      LEGACY_WALLET_ITEMS.map(normalizeWalletItem)
    )
    expect(getWalletItems().map(normalizeWalletItem)).toEqual(LEGACY_WALLET_ITEMS.map(normalizeWalletItem))

    for (const item of LEGACY_WALLET_ITEMS) {
      expect(getOfficialWalletItemDef(item.id)).toEqual(expectedWalletItemContentDef(item))
      expect(getOfficialWalletItemDef(toOfficialContentId(item.id))).toBe(getOfficialWalletItemDef(item.id))
      expect(getOfficialWalletItemById(item.id)).toEqual(normalizeWalletItem(item))
      expect(getWalletItemById(item.id)).toEqual(normalizeWalletItem(item))
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const seal = getOfficialWalletItemDef('merchant_seal')
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<WalletItemContentDef>(toOfficialRegistryTypeId('wallet_item'))

    expect(getOfficialWalletItemDef('missing_wallet_item')).toBeUndefined()
    expect(getOfficialWalletItemById('missing_wallet_item')).toBeUndefined()
    expect(getWalletItemById('missing_wallet_item')).toBeUndefined()
    expect(Object.isFrozen(seal)).toBe(true)
    expect(Object.isFrozen(seal?.name)).toBe(true)
    expect(Object.isFrozen(seal?.effect)).toBe(true)
    expect(() => registry.register(OFFICIAL_PACKAGE_ID, expectedWalletItemContentDef(LEGACY_WALLET_ITEMS[0]!))).toThrow(
      RegistryError
    )
  })

  it('has no semantic references beyond validated wallet item shape', () => {
    const diagnostics = validateRegistrySemantics(buildOfficialRegistrySetFromStaticData()).filter(
      diagnostic => diagnostic.registryId === toOfficialRegistryTypeId('wallet_item')
    )

    expect(diagnostics).toEqual([])
  })

  it('keeps wallet store unlocks, passive effects and old save restore registry-backed', () => {
    const walletStore = useWalletStore()
    const achievementStore = useAchievementStore()
    const skillStore = useSkillStore()
    const miningStore = useMiningStore()

    achievementStore.stats.totalMoneyEarned = 10_000
    achievementStore.stats.totalRecipesCooked = 10
    achievementStore.stats.totalCropsHarvested = 100
    skillStore.getSkill('foraging').level = 8
    miningStore.safePointFloor = 50
    achievementStore.discoveredItems = getOfficialFishDefsAsLegacy().slice(0, 30).map(fish => fish.id)

    expect(walletStore.checkAndUnlock()).toEqual([
      '商人印章',
      '神农本草',
      '矿工护符',
      '钓翁令牌',
      '厨师帽',
      '土地图腾'
    ])
    expect(walletStore.unlockedDefs.map(item => item.id)).toEqual([
      'merchant_seal',
      'herb_guide',
      'miners_charm',
      'anglers_token',
      'chefs_hat',
      'earth_totem'
    ])
    expect(walletStore.getShopDiscount()).toBe(0.1)
    expect(walletStore.getForageQualityBoost()).toBe(1)
    expect(walletStore.getMiningStaminaReduction()).toBe(0.15)
    expect(walletStore.getFishingCalmBonus()).toBe(0.1)
    expect(walletStore.getCookingRestoreBonus()).toBe(0.25)
    expect(walletStore.getCropGrowthBonus()).toBe(0.1)
    expect(walletStore.unlock('trade_prosperity_seal')).toBe(true)
    expect(walletStore.getTradeBonus()).toBe(0.2)
    expect(walletStore.unlock('missing_wallet_item')).toBe(false)

    walletStore.deserialize({ unlockedItems: ['merchant_seal'] })
    expect(walletStore.has('merchant_seal')).toBe(true)
    expect(walletStore.getShopDiscount()).toBe(0.1)
  })
})
