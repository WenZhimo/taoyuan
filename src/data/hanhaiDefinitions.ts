import type { TradeExchangeItemDef } from '@/types'

/** 瀚海通商积分兑换商品定义 */
export const TRADE_EXCHANGE_ITEMS: readonly TradeExchangeItemDef[] = [
  { itemId: 'trade_star_fragment', name: '星辰碎片', pointsCost: 50, description: '稀有材料，用于高级制作。', weeklyLimit: 3 },
  { itemId: 'trade_spice_bundle', name: '香料礼包', pointsCost: 40, description: '获得西域香料×5。', weeklyLimit: 3 },
  {
    itemId: 'trade_turquoise_pendant',
    name: '绿松石吊坠',
    pointsCost: 120,
    description: '饰品，攻击+2，防御+3%。',
    totalLimit: 1,
    equipType: 'ring'
  },
  { itemId: 'trade_silk_robe', name: '丝绸长袍', pointsCost: 150, description: '帽子，攻击+3，HP+20。', totalLimit: 1, equipType: 'hat' },
  {
    itemId: 'trade_desert_blade',
    name: '沙漠弯刀',
    pointsCost: 200,
    description: '武器，攻击40，暴击8%。',
    totalLimit: 1,
    equipType: 'weapon'
  },
  {
    itemId: 'trade_prosperity_seal',
    name: '通商金印',
    pointsCost: 300,
    description: '钱袋物品，通商积分获取+20%。',
    totalLimit: 1,
    isWalletItem: true
  }
]
