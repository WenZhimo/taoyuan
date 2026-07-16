import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TRADE_SHOP_UPGRADES as LEGACY_HANHAI_TRADE_SHOP_UPGRADES } from '@/data/hanhai'
import { TRADE_SHOP_UPGRADES as LEAF_HANHAI_TRADE_SHOP_UPGRADES } from '@/data/hanhaiTradeShopDefinitions'
import * as gameLog from '@/composables/useGameLog'
import {
  getOfficialHanhaiTradeShopUpgrade,
  getOfficialHanhaiTradeShopUpgradeDef,
  getOfficialHanhaiTradeShopUpgradeDefs,
  getOfficialHanhaiTradeShopUpgradesAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  HanhaiTradeShopUpgradeDefSchema,
  type HanhaiTradeShopUpgradeDef as HanhaiTradeShopUpgradeContentDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useHanhaiStore } from '@/stores/useHanhaiStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { TradeShopUpgradeDef as LegacyTradeShopUpgradeDef } from '@/types'
import validHanhaiTradeShopUpgrades from '../fixtures/mods/minimal-valid-package/data/hanhai-trade-shop-upgrades.json'

const expectedContentDef = (upgrade: LegacyTradeShopUpgradeDef): HanhaiTradeShopUpgradeContentDef => ({
  id: toOfficialContentId(`hanhai_trade_shop_upgrade/${upgrade.level}`),
  level: upgrade.level,
  name: {
    key: `taoyuan.hanhai.trade_shop_upgrade.${upgrade.level}.name`,
    fallback: upgrade.name
  },
  maxSlots: upgrade.maxSlots,
  sellDays: upgrade.sellDays,
  cost: upgrade.cost,
  materialCost: upgrade.materialCost.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  }))
})

describe('official hanhai trade shop upgrade registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(gameLog, 'addLog').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates external hanhai trade shop upgrade JSON before registration', () => {
    const externalUpgrades: unknown = validHanhaiTradeShopUpgrades
    const result = validateUnknown(Type.Array(HanhaiTradeShopUpgradeDefSchema), externalUpgrades, {
      stage: 'test.hanhai-trade-shop-upgrade'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid hanhai trade shop upgrade shapes and numeric bounds', () => {
    const base = validHanhaiTradeShopUpgrades[0]!
    const invalidUpgrades: unknown = [
      { ...base, id: 'missing_namespace' },
      { ...base, name: 'plain text' },
      { ...base, level: 0 },
      { ...base, maxSlots: 0 },
      { ...base, sellDays: 0 },
      { ...base, cost: -1 },
      { ...base, materialCost: [{ itemId: 'example_mod:test_item', quantity: 0 }] },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(HanhaiTradeShopUpgradeDefSchema), invalidUpgrades, {
      stage: 'test.hanhai-trade-shop-upgrade.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/name',
        '/2/level',
        '/3/maxSlots',
        '/4/sellDays',
        '/5/cost',
        '/6/materialCost/0/quantity',
        '/7/extra'
      ]))
    }
  })

  it('registers Hanhai trade shop upgrades in legacy order with equivalent fields', () => {
    expect(LEGACY_HANHAI_TRADE_SHOP_UPGRADES).toBe(LEAF_HANHAI_TRADE_SHOP_UPGRADES)
    expect(getOfficialHanhaiTradeShopUpgradeDefs()).toHaveLength(LEGACY_HANHAI_TRADE_SHOP_UPGRADES.length)
    expect(getOfficialHanhaiTradeShopUpgradeDefs()).toEqual(
      LEGACY_HANHAI_TRADE_SHOP_UPGRADES.map(expectedContentDef)
    )
    expect(getOfficialHanhaiTradeShopUpgradeDefs().map(upgrade => upgrade.id)).toEqual(
      LEGACY_HANHAI_TRADE_SHOP_UPGRADES.map(upgrade =>
        toOfficialContentId(`hanhai_trade_shop_upgrade/${upgrade.level}`)
      )
    )
    expect(getOfficialHanhaiTradeShopUpgradesAsLegacy()).toEqual(LEGACY_HANHAI_TRADE_SHOP_UPGRADES)

    for (const upgrade of LEGACY_HANHAI_TRADE_SHOP_UPGRADES) {
      expect(getOfficialHanhaiTradeShopUpgradeDef(upgrade.level)).toEqual(expectedContentDef(upgrade))
      expect(getOfficialHanhaiTradeShopUpgradeDef(`hanhai_trade_shop_upgrade/${upgrade.level}`)).toBe(
        getOfficialHanhaiTradeShopUpgradeDef(upgrade.level)
      )
      expect(getOfficialHanhaiTradeShopUpgradeDef(toOfficialContentId(`hanhai_trade_shop_upgrade/${upgrade.level}`))).toBe(
        getOfficialHanhaiTradeShopUpgradeDef(upgrade.level)
      )
      expect(getOfficialHanhaiTradeShopUpgrade(upgrade.level)).toEqual(upgrade)
    }
  })

  it('reports missing material references in semantic validation', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<HanhaiTradeShopUpgradeContentDef>(
      toOfficialRegistryTypeId('hanhai_trade_shop_upgrade')
    )
    const missingMaterial = toOfficialContentId('missing_hanhai_trade_shop_material')

    registry.register(OFFICIAL_PACKAGE_ID, {
      ...expectedContentDef(LEGACY_HANHAI_TRADE_SHOP_UPGRADES[1]!),
      id: toOfficialContentId('hanhai_trade_shop_upgrade/missing_material'),
      level: 99,
      materialCost: [{ itemId: missingMaterial, quantity: 1 }]
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.code === 'REG-REFERENCE-001'
    )

    expect(diagnostics).toContainEqual(expect.objectContaining({
      registryId: toOfficialRegistryTypeId('item'),
      contentId: missingMaterial,
      fieldPath: '/materialCost/0/itemId'
    }))
  })

  it('keeps Hanhai store trade shop upgrade behavior registry-backed', () => {
    const hanhaiStore = useHanhaiStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    expect(hanhaiStore.tradeShopConfig).toEqual(LEGACY_HANHAI_TRADE_SHOP_UPGRADES[0])
    expect(hanhaiStore.nextTradeShopUpgrade).toEqual(LEGACY_HANHAI_TRADE_SHOP_UPGRADES[1])

    playerStore.money = 20_000
    expect(inventoryStore.addItem('wood', 150)).toBe(true)
    expect(inventoryStore.addItem('iron_bar', 5)).toBe(true)

    expect(hanhaiStore.upgradeTradeShop()).toEqual({
      success: true,
      message: '店铺升级为「商铺」！'
    })
    expect(hanhaiStore.tradeShopLevel).toBe(2)
    expect(hanhaiStore.tradeShopConfig).toEqual(LEGACY_HANHAI_TRADE_SHOP_UPGRADES[1])
    expect(hanhaiStore.nextTradeShopUpgrade).toEqual(LEGACY_HANHAI_TRADE_SHOP_UPGRADES[2])
    expect(playerStore.money).toBe(0)
    expect(inventoryStore.getItemCount('wood')).toBe(0)
    expect(inventoryStore.getItemCount('iron_bar')).toBe(0)
    expect(gameLog.addLog).toHaveBeenCalledWith('通商店铺升级为「商铺」！槽位3个，售卖周期3天。')

    hanhaiStore.tradeShopLevel = 5
    expect(hanhaiStore.nextTradeShopUpgrade).toBeUndefined()
    expect(hanhaiStore.upgradeTradeShop()).toEqual({
      success: false,
      message: '店铺已满级。'
    })
  })
})
