import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TRADE_EXCHANGE_ITEMS as LEGACY_HANHAI_TRADE_EXCHANGE_ITEMS } from '@/data/hanhai'
import { TRADE_EXCHANGE_ITEMS as LEAF_HANHAI_TRADE_EXCHANGE_ITEMS } from '@/data/hanhaiDefinitions'
import * as gameLog from '@/composables/useGameLog'
import {
  getOfficialHanhaiTradeExchangeDef,
  getOfficialHanhaiTradeExchangeDefs,
  getOfficialHanhaiTradeExchangeItem,
  getOfficialHanhaiTradeExchangeItemsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  HanhaiTradeExchangeDefSchema,
  type HanhaiTradeExchangeDef as HanhaiTradeExchangeContentDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useHanhaiStore } from '@/stores/useHanhaiStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useWalletStore } from '@/stores/useWalletStore'
import type { TradeExchangeItemDef as LegacyTradeExchangeItemDef } from '@/types'
import validHanhaiTradeExchanges from '../fixtures/mods/minimal-valid-package/data/hanhai-trade-exchanges.json'

const expectedContentDef = (item: LegacyTradeExchangeItemDef): HanhaiTradeExchangeContentDef => ({
  id: toOfficialContentId(`hanhai_trade_exchange/${item.itemId}`),
  itemId: toOfficialContentId(item.itemId),
  name: {
    key: `taoyuan.hanhai.trade_exchange.${item.itemId}.name`,
    fallback: item.name
  },
  pointsCost: item.pointsCost,
  description: {
    key: `taoyuan.hanhai.trade_exchange.${item.itemId}.description`,
    fallback: item.description
  },
  ...(item.weeklyLimit !== undefined ? { weeklyLimit: item.weeklyLimit } : {}),
  ...(item.totalLimit !== undefined ? { totalLimit: item.totalLimit } : {}),
  ...(item.isWalletItem !== undefined ? { isWalletItem: item.isWalletItem } : {}),
  ...(item.equipType !== undefined ? { equipType: item.equipType } : {})
})

describe('official hanhai trade exchange registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(gameLog, 'addLog').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates external hanhai trade exchange JSON before registration', () => {
    const externalTradeExchanges: unknown = validHanhaiTradeExchanges
    const result = validateUnknown(Type.Array(HanhaiTradeExchangeDefSchema), externalTradeExchanges, {
      stage: 'test.hanhai-trade-exchange'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid hanhai trade exchange shapes and bounds', () => {
    const base = validHanhaiTradeExchanges[0]!
    const invalidTradeExchanges: unknown = [
      { ...base, id: 'missing_namespace' },
      { ...base, name: 'plain text' },
      { ...base, pointsCost: -1 },
      { ...base, weeklyLimit: -1 },
      { ...base, equipType: 'amulet' },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(HanhaiTradeExchangeDefSchema), invalidTradeExchanges, {
      stage: 'test.hanhai-trade-exchange.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/name',
        '/2/pointsCost',
        '/3/weeklyLimit',
        '/4/equipType',
        '/5/extra'
      ]))
    }
  })

  it('registers hanhai trade exchange items in legacy order with equivalent fields', () => {
    expect(LEGACY_HANHAI_TRADE_EXCHANGE_ITEMS).toBe(LEAF_HANHAI_TRADE_EXCHANGE_ITEMS)
    expect(getOfficialHanhaiTradeExchangeDefs()).toHaveLength(LEGACY_HANHAI_TRADE_EXCHANGE_ITEMS.length)
    expect(getOfficialHanhaiTradeExchangeDefs()).toEqual(
      LEGACY_HANHAI_TRADE_EXCHANGE_ITEMS.map(expectedContentDef)
    )
    expect(getOfficialHanhaiTradeExchangeDefs().map(item => item.id)).toEqual(
      LEGACY_HANHAI_TRADE_EXCHANGE_ITEMS.map(item => toOfficialContentId(`hanhai_trade_exchange/${item.itemId}`))
    )
    expect(getOfficialHanhaiTradeExchangeItemsAsLegacy()).toEqual(LEGACY_HANHAI_TRADE_EXCHANGE_ITEMS)

    for (const item of LEGACY_HANHAI_TRADE_EXCHANGE_ITEMS) {
      expect(getOfficialHanhaiTradeExchangeDef(item.itemId)).toEqual(expectedContentDef(item))
      expect(getOfficialHanhaiTradeExchangeDef(`hanhai_trade_exchange/${item.itemId}`)).toBe(
        getOfficialHanhaiTradeExchangeDef(item.itemId)
      )
      expect(getOfficialHanhaiTradeExchangeDef(toOfficialContentId(`hanhai_trade_exchange/${item.itemId}`))).toBe(
        getOfficialHanhaiTradeExchangeDef(item.itemId)
      )
      expect(getOfficialHanhaiTradeExchangeItem(item.itemId)).toEqual(item)
    }
  })

  it('reports missing item and wallet item references in semantic validation', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<HanhaiTradeExchangeContentDef>(toOfficialRegistryTypeId('hanhai_trade_exchange'))

    registry.register(OFFICIAL_PACKAGE_ID, {
      ...expectedContentDef(LEGACY_HANHAI_TRADE_EXCHANGE_ITEMS[0]!),
      id: toOfficialContentId('hanhai_trade_exchange/missing_item'),
      itemId: toOfficialContentId('missing_hanhai_trade_item')
    })
    registry.register(OFFICIAL_PACKAGE_ID, {
      ...expectedContentDef(LEGACY_HANHAI_TRADE_EXCHANGE_ITEMS[1]!),
      id: toOfficialContentId('hanhai_trade_exchange/missing_wallet_item'),
      itemId: toOfficialContentId('missing_hanhai_wallet_item'),
      isWalletItem: true
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.code === 'REG-REFERENCE-001'
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_hanhai_trade_item'),
        fieldPath: '/itemId'
      }),
      expect.objectContaining({
        registryId: toOfficialRegistryTypeId('wallet_item'),
        contentId: toOfficialContentId('missing_hanhai_wallet_item'),
        fieldPath: '/itemId'
      })
    ]))
  })

  it('keeps spice bundle and wallet item exchange behavior unchanged', () => {
    const hanhaiStore = useHanhaiStore()
    const inventoryStore = useInventoryStore()
    const walletStore = useWalletStore()

    hanhaiStore.tradePoints = 340

    expect(hanhaiStore.exchangeItem('trade_spice_bundle')).toEqual({
      success: true,
      message: '获得西域香料×5！'
    })
    expect(hanhaiStore.tradePoints).toBe(300)
    expect(hanhaiStore.weeklyExchangePurchases.trade_spice_bundle).toBe(1)
    expect(inventoryStore.getItemCount('hanhai_spice')).toBe(5)

    expect(hanhaiStore.exchangeItem('trade_prosperity_seal')).toEqual({
      success: true,
      message: '兑换了通商金印，已加入钱袋！'
    })
    expect(hanhaiStore.tradePoints).toBe(0)
    expect(hanhaiStore.totalExchangePurchases.trade_prosperity_seal).toBe(1)
    expect(walletStore.has('trade_prosperity_seal')).toBe(true)

    expect(hanhaiStore.exchangeItem('trade_prosperity_seal')).toEqual({
      success: false,
      message: '通商金印已达兑换上限。'
    })
    expect(hanhaiStore.exchangeItem('missing_exchange_item')).toEqual({
      success: false,
      message: '兑换物品不存在。'
    })
  })
})
