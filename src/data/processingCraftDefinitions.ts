import type { BaitDef, BombDef, FertilizerDef, SprinklerDef, TackleDef } from '@/types'

/** 洒水器定义 */
export const SPRINKLERS: SprinklerDef[] = [
  {
    id: 'bamboo_sprinkler',
    name: '竹筒洒水器',
    description: '自动灌溉上下左右4块地。',
    range: 4,
    craftCost: [
      { itemId: 'bamboo', quantity: 10 },
      { itemId: 'copper_ore', quantity: 3 }
    ],
    craftMoney: 100
  },
  {
    id: 'copper_sprinkler',
    name: '铜管洒水器',
    description: '自动灌溉周围8块地。',
    range: 8,
    craftCost: [
      { itemId: 'copper_bar', quantity: 3 },
      { itemId: 'iron_bar', quantity: 1 }
    ],
    craftMoney: 500
  },
  {
    id: 'gold_sprinkler',
    name: '金管洒水器',
    description: '自动灌溉周围5×5共24块地。',
    range: 24,
    craftCost: [
      { itemId: 'gold_bar', quantity: 2 },
      { itemId: 'iron_bar', quantity: 2 },
      { itemId: 'quartz', quantity: 1 }
    ],
    craftMoney: 1500
  }
]

/** 肥料定义 */
export const FERTILIZERS: FertilizerDef[] = [
  {
    id: 'basic_fertilizer',
    name: '基础肥料',
    description: '提升作物品质概率+20%。',
    qualityBonus: 0.2,
    craftCost: [
      { itemId: 'wood', quantity: 5 },
      { itemId: 'herb', quantity: 2 }
    ],
    craftMoney: 0,
    shopPrice: 25
  },
  {
    id: 'quality_fertilizer',
    name: '优质肥料',
    description: '提升作物品质概率+40%。',
    qualityBonus: 0.4,
    craftCost: [
      { itemId: 'herb', quantity: 3 },
      { itemId: 'quartz', quantity: 1 }
    ],
    craftMoney: 0,
    shopPrice: 75
  },
  {
    id: 'speed_gro',
    name: '生长激素',
    description: '加速作物生长25%。',
    growthSpeedup: 0.25,
    craftCost: [
      { itemId: 'pine_cone', quantity: 3 },
      { itemId: 'herb', quantity: 1 }
    ],
    craftMoney: 0,
    shopPrice: 50
  },
  {
    id: 'deluxe_speed_gro',
    name: '高级激素',
    description: '加速作物生长33%。',
    growthSpeedup: 0.33,
    craftCost: [
      { itemId: 'quartz', quantity: 1 },
      { itemId: 'firewood', quantity: 3 }
    ],
    craftMoney: 0,
    shopPrice: 100
  },
  {
    id: 'super_hormone',
    name: '超级激素',
    description: '让任何植物只需一天成熟，第二天即可收获。',
    growthSpeedup: 1,
    craftCost: [
      { itemId: 'ginseng', quantity: 1 },
      { itemId: 'herb', quantity: 5 }
    ],
    craftMoney: 0,
    shopPrice: 500
  },
  {
    id: 'retaining_soil',
    name: '保湿土',
    description: '50%概率隔夜保持浇水状态。',
    retainChance: 0.5,
    craftCost: [
      { itemId: 'wood', quantity: 3 },
      { itemId: 'firewood', quantity: 2 }
    ],
    craftMoney: 0,
    shopPrice: 30
  },
  {
    id: 'quality_retaining_soil',
    name: '优质保湿土',
    description: '100%隔夜保持浇水状态。',
    retainChance: 1.0,
    craftCost: [
      { itemId: 'quartz', quantity: 1 },
      { itemId: 'wood', quantity: 5 }
    ],
    craftMoney: 0,
    shopPrice: 80
  }
]

/** 鱼饵定义 */
export const BAITS: BaitDef[] = [
  {
    id: 'standard_bait',
    name: '普通鱼饵',
    description: '使鱼更安静，降低猛冲概率。',
    behaviorModifier: { calm: 0.1, struggle: 0, dash: -0.1 },
    craftCost: [{ itemId: 'herb', quantity: 2 }],
    craftMoney: 0,
    shopPrice: 5
  },
  {
    id: 'wild_bait',
    name: '野生鱼饵',
    description: '25%概率获得双倍鱼获。',
    doubleCatchChance: 0.25,
    craftCost: [
      { itemId: 'herb', quantity: 3 },
      { itemId: 'wild_berry', quantity: 1 },
      { itemId: 'firewood', quantity: 2 }
    ],
    craftMoney: 0,
    shopPrice: 25
  },
  {
    id: 'magic_bait',
    name: '魔法鱼饵',
    description: '无视季节限制，可钓到所有鱼。',
    ignoresSeason: true,
    craftCost: [
      { itemId: 'ginseng', quantity: 1 },
      { itemId: 'gold_ore', quantity: 1 }
    ],
    craftMoney: 0,
    shopPrice: 120
  },
  {
    id: 'deluxe_bait',
    name: '精致鱼饵',
    description: '鱼更安静，挣扎成功率+5%。',
    behaviorModifier: { calm: 0.15, struggle: 0, dash: -0.1 },
    struggleBonus: 0.05,
    craftCost: [
      { itemId: 'herb', quantity: 3 },
      { itemId: 'ginseng', quantity: 1 }
    ],
    craftMoney: 0,
    shopPrice: 80
  },
  {
    id: 'targeted_bait',
    name: '定向鱼饵',
    description: '困难鱼权重×2，传说鱼权重×1.5。',
    hardWeightMult: 2,
    legendaryWeightMult: 1.5,
    craftCost: [
      { itemId: 'magic_bait', quantity: 1 },
      { itemId: 'gold_ore', quantity: 1 }
    ],
    craftMoney: 0,
    shopPrice: 180
  }
]

/** 浮漂定义 */
export const TACKLES: TackleDef[] = [
  {
    id: 'spinner',
    name: '旋转浮漂',
    description: '减少50%钓鱼体力消耗。',
    maxDurability: 20,
    requiredRodTier: 'iron',
    staminaReduction: 0.5,
    craftCost: [
      { itemId: 'iron_ore', quantity: 3 },
      { itemId: 'bamboo', quantity: 2 }
    ],
    craftMoney: 0,
    shopPrice: 250
  },
  {
    id: 'trap_bobber',
    name: '陷阱浮漂',
    description: '断线时获得1次额外机会。',
    maxDurability: 20,
    requiredRodTier: 'iron',
    extraBreakChance: 1,
    craftCost: [
      { itemId: 'copper_ore', quantity: 5 },
      { itemId: 'wood', quantity: 5 }
    ],
    craftMoney: 0,
    shopPrice: 200
  },
  {
    id: 'cork_bobber',
    name: '软木浮漂',
    description: '挣扎时成功率+25%。',
    maxDurability: 20,
    requiredRodTier: 'iron',
    struggleBonus: 0.25,
    craftCost: [
      { itemId: 'wood', quantity: 10 },
      { itemId: 'iron_ore', quantity: 2 }
    ],
    craftMoney: 0,
    shopPrice: 250
  },
  {
    id: 'quality_bobber',
    name: '品质浮漂',
    description: '钓到的鱼品质+1档。',
    maxDurability: 20,
    requiredRodTier: 'iron',
    qualityBoost: 1,
    craftCost: [
      { itemId: 'gold_ore', quantity: 2 },
      { itemId: 'copper_ore', quantity: 3 }
    ],
    craftMoney: 0,
    shopPrice: 500
  },
  {
    id: 'lead_bobber',
    name: '铅坠浮漂',
    description: '减少鱼猛冲和翻腾概率各10%。',
    maxDurability: 20,
    requiredRodTier: 'iron',
    dangerReduction: 0.1,
    craftCost: [
      { itemId: 'iron_ore', quantity: 5 },
      { itemId: 'wood', quantity: 3 }
    ],
    craftMoney: 0,
    shopPrice: 200
  }
]

/** 炸弹定义 */
export const BOMBS: BombDef[] = [
  {
    id: 'cherry_bomb',
    name: '爆竹',
    description: '小范围爆破，一次获取3份矿石。',
    oreMultiplier: 3,
    clearsMonster: false,
    craftCost: [
      { itemId: 'copper_ore', quantity: 12 },
      { itemId: 'firewood', quantity: 15 }
    ],
    craftMoney: 100,
    shopPrice: null
  },
  {
    id: 'bomb',
    name: '火药包',
    description: '大范围爆破，获取5份矿石并清除怪物。',
    oreMultiplier: 5,
    clearsMonster: true,
    craftCost: [
      { itemId: 'iron_ore', quantity: 12 },
      { itemId: 'firewood', quantity: 18 },
      { itemId: 'quartz', quantity: 5 }
    ],
    craftMoney: 250,
    shopPrice: null
  },
  {
    id: 'mega_bomb',
    name: '雷火弹',
    description: '超大范围爆破，获取8份矿石并清除怪物。',
    oreMultiplier: 8,
    clearsMonster: true,
    craftCost: [
      { itemId: 'gold_ore', quantity: 18 },
      { itemId: 'iron_ore', quantity: 15 },
      { itemId: 'firewood', quantity: 25 },
      { itemId: 'ruby', quantity: 3 }
    ],
    craftMoney: 500,
    shopPrice: null
  }
]
