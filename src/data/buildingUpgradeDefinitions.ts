import type { FarmhouseLevel } from '@/types'

export interface BuildingUpgradeMaterial {
  itemId: string
  quantity: number
}

/** 农舍升级定义 */
export interface FarmhouseUpgradeDef {
  level: FarmhouseLevel
  name: string
  description: string
  cost: number
  materialCost: BuildingUpgradeMaterial[]
  benefit: string
}

export const FARMHOUSE_UPGRADES: FarmhouseUpgradeDef[] = [
  {
    level: 1,
    name: '砖房',
    description: '升级厨房，烹饪体力恢复+20%。',
    cost: 10000,
    materialCost: [{ itemId: 'wood', quantity: 200 }],
    benefit: 'kitchen_bonus'
  },
  {
    level: 2,
    name: '宅院',
    description: '宽敞的院落，每晚额外恢复10%体力。',
    cost: 65000,
    materialCost: [
      { itemId: 'wood', quantity: 100 },
      { itemId: 'iron_ore', quantity: 50 }
    ],
    benefit: 'stamina_bonus'
  },
  {
    level: 3,
    name: '酒窖',
    description: '地下酒窖，可陈酿美酒提升品质。',
    cost: 100000,
    materialCost: [
      { itemId: 'wood', quantity: 100 },
      { itemId: 'gold_ore', quantity: 30 }
    ],
    benefit: 'cellar'
  }
]

/** 山洞升级定义 */
export interface CaveUpgradeDef {
  level: number
  name: string
  mushroomChance: number
  fruitBatChance: number
  doubleChance: number
  cost: number
  materialCost: BuildingUpgradeMaterial[]
  mushroomPool: { itemId: string; weight: number }[]
  fruitPool: string[]
}

export const CAVE_UPGRADES: CaveUpgradeDef[] = [
  {
    level: 1,
    name: '山洞',
    mushroomChance: 0.6,
    fruitBatChance: 0.5,
    doubleChance: 0,
    cost: 0,
    materialCost: [],
    mushroomPool: [{ itemId: 'wild_mushroom', weight: 1 }],
    fruitPool: ['tree_peach', 'lychee', 'mandarin', 'plum_blossom']
  },
  {
    level: 2,
    name: '山洞·贰',
    mushroomChance: 0.7,
    fruitBatChance: 0.6,
    doubleChance: 0,
    cost: 15000,
    materialCost: [
      { itemId: 'wood', quantity: 100 },
      { itemId: 'iron_bar', quantity: 5 }
    ],
    mushroomPool: [
      { itemId: 'wild_mushroom', weight: 70 },
      { itemId: 'herb', weight: 30 }
    ],
    fruitPool: ['tree_peach', 'lychee', 'mandarin', 'plum_blossom', 'apricot', 'pomegranate']
  },
  {
    level: 3,
    name: '山洞·叁',
    mushroomChance: 0.8,
    fruitBatChance: 0.7,
    doubleChance: 0.25,
    cost: 40000,
    materialCost: [
      { itemId: 'wood', quantity: 200 },
      { itemId: 'gold_bar', quantity: 10 }
    ],
    mushroomPool: [
      { itemId: 'wild_mushroom', weight: 50 },
      { itemId: 'herb', weight: 35 },
      { itemId: 'ginseng', weight: 15 }
    ],
    fruitPool: ['tree_peach', 'lychee', 'mandarin', 'plum_blossom', 'apricot', 'pomegranate', 'persimmon', 'hawthorn']
  }
]

/** 酒窖升级定义 */
export interface CellarUpgradeDef {
  level: number
  name: string
  valuePerCycle: number
  maxSlots: number
  cost: number
  materialCost: BuildingUpgradeMaterial[]
}

export const CELLAR_UPGRADES: CellarUpgradeDef[] = [
  { level: 1, name: '酒窖', valuePerCycle: 100, maxSlots: 6, cost: 0, materialCost: [] },
  {
    level: 2,
    name: '酒窖·贰',
    valuePerCycle: 125,
    maxSlots: 9,
    cost: 30000,
    materialCost: [
      { itemId: 'wood', quantity: 200 },
      { itemId: 'iron_bar', quantity: 10 }
    ]
  },
  {
    level: 3,
    name: '酒窖·叁',
    valuePerCycle: 150,
    maxSlots: 12,
    cost: 60000,
    materialCost: [
      { itemId: 'wood', quantity: 300 },
      { itemId: 'gold_bar', quantity: 10 }
    ]
  },
  {
    level: 4,
    name: '酒窖·肆',
    valuePerCycle: 175,
    maxSlots: 15,
    cost: 100000,
    materialCost: [
      { itemId: 'wood', quantity: 400 },
      { itemId: 'gold_bar', quantity: 20 }
    ]
  },
  {
    level: 5,
    name: '酒窖·伍',
    valuePerCycle: 200,
    maxSlots: 18,
    cost: 150000,
    materialCost: [
      { itemId: 'wood', quantity: 500 },
      { itemId: 'iridium_bar', quantity: 5 }
    ]
  }
]
