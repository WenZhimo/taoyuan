import type { TradeShopUpgradeDef } from '@/types'

/** 通商店铺升级定义 */
export const TRADE_SHOP_UPGRADES: TradeShopUpgradeDef[] = [
  { level: 1, name: '小摊', maxSlots: 2, sellDays: 3, cost: 0, materialCost: [] },
  {
    level: 2,
    name: '商铺',
    maxSlots: 3,
    sellDays: 3,
    cost: 20000,
    materialCost: [
      { itemId: 'wood', quantity: 150 },
      { itemId: 'iron_bar', quantity: 5 }
    ]
  },
  {
    level: 3,
    name: '大商铺',
    maxSlots: 4,
    sellDays: 2,
    cost: 50000,
    materialCost: [
      { itemId: 'wood', quantity: 250 },
      { itemId: 'gold_bar', quantity: 5 }
    ]
  },
  {
    level: 4,
    name: '商行',
    maxSlots: 5,
    sellDays: 2,
    cost: 100000,
    materialCost: [
      { itemId: 'wood', quantity: 400 },
      { itemId: 'gold_bar', quantity: 15 }
    ]
  },
  {
    level: 5,
    name: '商会',
    maxSlots: 6,
    sellDays: 1,
    cost: 200000,
    materialCost: [
      { itemId: 'wood', quantity: 500 },
      { itemId: 'iridium_bar', quantity: 3 }
    ]
  }
]
