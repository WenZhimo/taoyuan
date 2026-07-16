import type { QuestTemplateDef, QuestType } from '@/types/quest'
import type { Season } from '@/types/game'

export const QUEST_TEMPLATES: QuestTemplateDef[] = [
  {
    type: 'delivery',
    targets: [
      // 常见作物 — 混合季节
      { itemId: 'cabbage', name: '青菜', minQty: 2, maxQty: 5, seasons: ['spring'], unitPrice: 35 },
      { itemId: 'radish', name: '萝卜', minQty: 2, maxQty: 4, seasons: ['spring'], unitPrice: 55 },
      { itemId: 'potato', name: '土豆', minQty: 2, maxQty: 4, seasons: ['spring'], unitPrice: 50 },
      { itemId: 'rice', name: '稻米', minQty: 2, maxQty: 5, seasons: ['summer'], unitPrice: 40 },
      { itemId: 'watermelon', name: '西瓜', minQty: 1, maxQty: 3, seasons: ['summer'], unitPrice: 80 },
      { itemId: 'chili', name: '辣椒', minQty: 2, maxQty: 4, seasons: ['summer'], unitPrice: 45 },
      { itemId: 'pumpkin', name: '南瓜', minQty: 1, maxQty: 3, seasons: ['autumn'], unitPrice: 100 },
      { itemId: 'sweet_potato', name: '红薯', minQty: 2, maxQty: 4, seasons: ['autumn'], unitPrice: 60 },
      { itemId: 'winter_wheat', name: '冬小麦', minQty: 2, maxQty: 5, seasons: ['winter'], unitPrice: 45 },
      { itemId: 'garlic', name: '大蒜', minQty: 2, maxQty: 4, seasons: ['winter'], unitPrice: 50 }
    ],
    npcPool: ['chen_bo', 'liu_niang', 'lin_lao', 'xiao_man'],
    rewardMultiplier: 3,
    friendshipReward: 5
  },
  {
    type: 'fishing',
    targets: [
      { itemId: 'crucian', name: '鲫鱼', minQty: 1, maxQty: 3, seasons: [], unitPrice: 15 },
      { itemId: 'carp', name: '鲤鱼', minQty: 1, maxQty: 2, seasons: ['spring', 'summer'], unitPrice: 25 },
      { itemId: 'grass_carp', name: '草鱼', minQty: 1, maxQty: 2, seasons: ['summer', 'autumn'], unitPrice: 30 },
      { itemId: 'catfish', name: '鲶鱼', minQty: 1, maxQty: 2, seasons: ['summer'], unitPrice: 40 },
      { itemId: 'bass', name: '鲈鱼', minQty: 1, maxQty: 2, seasons: ['autumn'], unitPrice: 35 },
      { itemId: 'loach', name: '泥鳅', minQty: 1, maxQty: 3, seasons: ['summer', 'autumn'], unitPrice: 20 },
      { itemId: 'creek_shrimp', name: '溪虾', minQty: 2, maxQty: 4, seasons: ['spring', 'summer', 'autumn'], unitPrice: 30 },
      { itemId: 'silver_carp', name: '白鲢', minQty: 1, maxQty: 2, seasons: ['summer'], unitPrice: 25 }
    ],
    npcPool: ['qiu_yue', 'chen_bo', 'lin_lao'],
    rewardMultiplier: 3,
    friendshipReward: 3
  },
  {
    type: 'mining',
    targets: [
      { itemId: 'copper_ore', name: '铜矿', minQty: 3, maxQty: 8, seasons: [], unitPrice: 10 },
      { itemId: 'iron_ore', name: '铁矿', minQty: 3, maxQty: 6, seasons: [], unitPrice: 20 },
      { itemId: 'gold_ore', name: '金矿', minQty: 2, maxQty: 4, seasons: [], unitPrice: 40 },
      { itemId: 'quartz', name: '石英', minQty: 1, maxQty: 3, seasons: [], unitPrice: 30 },
      { itemId: 'jade', name: '翡翠', minQty: 1, maxQty: 2, seasons: [], unitPrice: 80 }
    ],
    npcPool: ['a_shi', 'xiao_man', 'chen_bo'],
    rewardMultiplier: 2,
    friendshipReward: 3
  },
  {
    type: 'gathering',
    targets: [
      { itemId: 'wood', name: '木材', minQty: 5, maxQty: 10, seasons: [], unitPrice: 5 },
      { itemId: 'herb', name: '草药', minQty: 2, maxQty: 5, seasons: ['spring', 'summer', 'autumn'], unitPrice: 15 },
      { itemId: 'firewood', name: '柴火', minQty: 5, maxQty: 10, seasons: [], unitPrice: 3 },
      { itemId: 'bamboo', name: '竹子', minQty: 3, maxQty: 6, seasons: ['spring', 'summer'], unitPrice: 10 },
      { itemId: 'pine_cone', name: '松果', minQty: 2, maxQty: 4, seasons: ['autumn', 'winter'], unitPrice: 10 },
      { itemId: 'wild_mushroom', name: '野蘑菇', minQty: 2, maxQty: 4, seasons: ['autumn'], unitPrice: 20 },
      { itemId: 'wild_berry', name: '野果', minQty: 3, maxQty: 5, seasons: ['summer'], unitPrice: 10 },
      { itemId: 'ginseng', name: '人参', minQty: 1, maxQty: 2, seasons: ['autumn', 'winter'], unitPrice: 50 }
    ],
    npcPool: ['lin_lao', 'liu_niang', 'xiao_man'],
    rewardMultiplier: 3,
    friendshipReward: 5
  }
]

// 委托类型描述映射（预留）
export const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  delivery: '送',
  fishing: '钓',
  mining: '采',
  gathering: '收集',
  special_order: '特殊'
}

/** 特殊订单模板 */
export interface SpecialOrderTemplate {
  name: string
  targetItemId: string
  targetItemName: string
  quantity: number
  days: number
  moneyReward: number
  itemReward: { itemId: string; quantity: number }[]
  seasons: Season[]
  npcId: string
  /** 难度梯度: 1=第7天(简单), 2=第14天(普通), 3=第21天(困难), 4=第28天(极难) */
  tier: number
}

/** 按梯度分层的特殊订单模板 */
export const SPECIAL_ORDER_TEMPLATES: SpecialOrderTemplate[] = [
  // === 第1梯度 (第7天): 简单, 7天时限, 数量少, 奖励适中 ===
  {
    name: '铜矿采购',
    targetItemId: 'copper_ore',
    targetItemName: '铜矿',
    quantity: 15,
    days: 7,
    moneyReward: 600,
    itemReward: [{ itemId: 'iron_ore', quantity: 3 }],
    seasons: [],
    npcId: 'a_shi',
    tier: 1
  },
  {
    name: '鲜鱼征集',
    targetItemId: 'crucian',
    targetItemName: '鲫鱼',
    quantity: 8,
    days: 7,
    moneyReward: 500,
    itemReward: [{ itemId: 'standard_bait', quantity: 10 }],
    seasons: [],
    npcId: 'qiu_yue',
    tier: 1
  },
  {
    name: '蔬菜采购',
    targetItemId: 'cabbage',
    targetItemName: '青菜',
    quantity: 10,
    days: 7,
    moneyReward: 500,
    itemReward: [{ itemId: 'basic_fertilizer', quantity: 5 }],
    seasons: ['spring'],
    npcId: 'liu_niang',
    tier: 1
  },
  {
    name: '木材备料',
    targetItemId: 'wood',
    targetItemName: '木材',
    quantity: 30,
    days: 7,
    moneyReward: 400,
    itemReward: [{ itemId: 'charcoal', quantity: 5 }],
    seasons: [],
    npcId: 'chen_bo',
    tier: 1
  },
  // === 第2梯度 (第14天): 普通, 7天时限, 数量中等, 奖励较好 ===
  {
    name: '铁矿备料',
    targetItemId: 'iron_ore',
    targetItemName: '铁矿',
    quantity: 15,
    days: 7,
    moneyReward: 1200,
    itemReward: [{ itemId: 'charcoal', quantity: 10 }],
    seasons: [],
    npcId: 'a_shi',
    tier: 2
  },
  {
    name: '珍鱼征集令',
    targetItemId: 'catfish',
    targetItemName: '鲶鱼',
    quantity: 5,
    days: 7,
    moneyReward: 1000,
    itemReward: [{ itemId: 'standard_bait', quantity: 20 }],
    seasons: ['summer'],
    npcId: 'qiu_yue',
    tier: 2
  },
  {
    name: '冬储备战',
    targetItemId: 'winter_wheat',
    targetItemName: '冬小麦',
    quantity: 15,
    days: 7,
    moneyReward: 1200,
    itemReward: [{ itemId: 'seed_garlic', quantity: 5 }],
    seasons: ['winter'],
    npcId: 'chen_bo',
    tier: 2
  },
  {
    name: '药材收集',
    targetItemId: 'herb',
    targetItemName: '草药',
    quantity: 15,
    days: 7,
    moneyReward: 800,
    itemReward: [{ itemId: 'quality_fertilizer', quantity: 3 }],
    seasons: ['spring', 'summer', 'autumn'],
    npcId: 'lin_lao',
    tier: 2
  },
  // === 第3梯度 (第21天): 困难, 7天时限, 数量大, 奖励丰厚 ===
  {
    name: '丰收计划',
    targetItemId: 'pumpkin',
    targetItemName: '南瓜',
    quantity: 10,
    days: 7,
    moneyReward: 2000,
    itemReward: [{ itemId: 'quality_fertilizer', quantity: 5 }],
    seasons: ['autumn'],
    npcId: 'liu_niang',
    tier: 3
  },
  {
    name: '西瓜大丰收',
    targetItemId: 'watermelon',
    targetItemName: '西瓜',
    quantity: 10,
    days: 7,
    moneyReward: 2200,
    itemReward: [{ itemId: 'seed_watermelon', quantity: 5 }],
    seasons: ['summer'],
    npcId: 'xiao_man',
    tier: 3
  },
  {
    name: '深层金矿',
    targetItemId: 'gold_ore',
    targetItemName: '金矿',
    quantity: 15,
    days: 7,
    moneyReward: 2500,
    itemReward: [{ itemId: 'gold_ore', quantity: 5 }],
    seasons: [],
    npcId: 'a_shi',
    tier: 3
  },
  {
    name: '药材囤积',
    targetItemId: 'ginseng',
    targetItemName: '人参',
    quantity: 6,
    days: 7,
    moneyReward: 2000,
    itemReward: [{ itemId: 'herb', quantity: 15 }],
    seasons: ['autumn', 'winter'],
    npcId: 'lin_lao',
    tier: 3
  },
  // === 第4梯度 (第28天): 极难, 7天时限, 数量极大, 奖励最丰厚 ===
  {
    name: '矿石大征集',
    targetItemId: 'gold_ore',
    targetItemName: '金矿',
    quantity: 25,
    days: 7,
    moneyReward: 4000,
    itemReward: [
      { itemId: 'gold_ore', quantity: 10 },
      { itemId: 'jade', quantity: 2 }
    ],
    seasons: [],
    npcId: 'a_shi',
    tier: 4
  },
  {
    name: '丰年盛宴',
    targetItemId: 'pumpkin',
    targetItemName: '南瓜',
    quantity: 20,
    days: 7,
    moneyReward: 4500,
    itemReward: [
      { itemId: 'quality_fertilizer', quantity: 10 },
      { itemId: 'speed_gro', quantity: 5 }
    ],
    seasons: ['autumn'],
    npcId: 'liu_niang',
    tier: 4
  },
  {
    name: '渔王挑战',
    targetItemId: 'catfish',
    targetItemName: '鲶鱼',
    quantity: 12,
    days: 7,
    moneyReward: 3500,
    itemReward: [{ itemId: 'wild_bait', quantity: 10 }],
    seasons: ['summer'],
    npcId: 'qiu_yue',
    tier: 4
  },
  {
    name: '冬日大囤货',
    targetItemId: 'winter_wheat',
    targetItemName: '冬小麦',
    quantity: 30,
    days: 7,
    moneyReward: 3500,
    itemReward: [
      { itemId: 'seed_garlic', quantity: 10 },
      { itemId: 'charcoal', quantity: 10 }
    ],
    seasons: ['winter'],
    npcId: 'chen_bo',
    tier: 4
  }
]

export const TIER_LABELS = ['简单', '普通', '困难', '极难']
export const TIER_FRIENDSHIP = [5, 8, 12, 15]
