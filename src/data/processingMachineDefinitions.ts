import type { ProcessingMachineDef } from '@/types'

/** 加工机器定义 */
export const PROCESSING_MACHINES: ProcessingMachineDef[] = [
  {
    id: 'wine_workshop',
    name: '酒坊',
    description: '将水果/作物酿成美酒，售价翻三倍。',
    craftCost: [
      { itemId: 'wood', quantity: 30 },
      { itemId: 'copper_ore', quantity: 5 },
      { itemId: 'iron_ore', quantity: 3 }
    ],
    craftMoney: 300
  },
  {
    id: 'sauce_jar',
    name: '酱缸',
    description: '将作物腌制成酱菜蜜饯，稳定增值。',
    craftCost: [
      { itemId: 'wood', quantity: 20 },
      { itemId: 'copper_ore', quantity: 8 },
      { itemId: 'quartz', quantity: 1 }
    ],
    craftMoney: 200
  },
  {
    id: 'bee_house',
    name: '蜂箱',
    description: '每4天自动产出蜂蜜。',
    craftCost: [
      { itemId: 'wood', quantity: 40 },
      { itemId: 'iron_ore', quantity: 2 },
      { itemId: 'bamboo', quantity: 10 }
    ],
    craftMoney: 250
  },
  {
    id: 'oil_press',
    name: '油坊',
    description: '将芝麻或种子榨成食用油。',
    craftCost: [
      { itemId: 'wood', quantity: 15 },
      { itemId: 'iron_ore', quantity: 5 },
      { itemId: 'gold_ore', quantity: 1 }
    ],
    craftMoney: 350
  },
  {
    id: 'mayo_maker',
    name: '蛋黄酱机',
    description: '将鸡蛋或鸭蛋制成蛋黄酱。',
    craftCost: [
      { itemId: 'wood', quantity: 15 },
      { itemId: 'copper_ore', quantity: 5 },
      { itemId: 'quartz', quantity: 1 }
    ],
    craftMoney: 200
  },
  {
    id: 'seed_maker',
    name: '种子制造机',
    description: '将成熟作物转化为种子。',
    craftCost: [
      { itemId: 'wood', quantity: 20 },
      { itemId: 'iron_ore', quantity: 5 },
      { itemId: 'gold_ore', quantity: 2 }
    ],
    craftMoney: 500
  },
  {
    id: 'crystal_duplicator',
    name: '结晶复制机',
    description: '投入宝石后缓慢复制，获得双倍产出。',
    craftCost: [
      { itemId: 'gold_ore', quantity: 5 },
      { itemId: 'iron_ore', quantity: 3 },
      { itemId: 'quartz', quantity: 2 }
    ],
    craftMoney: 500
  },
  {
    id: 'smoker',
    name: '烟熏机',
    description: '将鱼烟熏处理，售价翻倍。',
    craftCost: [
      { itemId: 'wood', quantity: 20 },
      { itemId: 'iron_ore', quantity: 3 },
      { itemId: 'firewood', quantity: 5 }
    ],
    craftMoney: 300
  },
  {
    id: 'dehydrator',
    name: '脱水机',
    description: '将蘑菇或水果脱水保存，增值出售。',
    craftCost: [
      { itemId: 'wood', quantity: 15 },
      { itemId: 'iron_ore', quantity: 2 },
      { itemId: 'firewood', quantity: 10 }
    ],
    craftMoney: 200
  },
  {
    id: 'recycler',
    name: '回收机',
    description: '将垃圾回收转化为有用材料。',
    craftCost: [
      { itemId: 'wood', quantity: 25 },
      { itemId: 'iron_ore', quantity: 5 },
      { itemId: 'copper_ore', quantity: 5 }
    ],
    craftMoney: 150
  },
  {
    id: 'cheese_press',
    name: '乳酪机',
    description: '将牛奶制成美味的奶酪。',
    craftCost: [
      { itemId: 'iron_ore', quantity: 5 },
      { itemId: 'wood', quantity: 15 },
      { itemId: 'copper_ore', quantity: 3 }
    ],
    craftMoney: 400
  },
  {
    id: 'loom',
    name: '织布机',
    description: '将毛线和丝织成布匹。',
    craftCost: [
      { itemId: 'wood', quantity: 20 },
      { itemId: 'iron_ore', quantity: 3 },
      { itemId: 'bamboo', quantity: 10 }
    ],
    craftMoney: 300
  },
  {
    id: 'furnace',
    name: '熔炉',
    description: '将矿石冶炼成金属锭。完成后自动收取。',
    craftCost: [
      { itemId: 'copper_ore', quantity: 10 },
      { itemId: 'iron_ore', quantity: 5 },
      { itemId: 'quartz', quantity: 2 }
    ],
    craftMoney: 500,
    autoCollect: true
  },
  {
    id: 'charcoal_kiln',
    name: '炭窑',
    description: '将木材烧制成木炭。',
    craftCost: [
      { itemId: 'wood', quantity: 20 },
      { itemId: 'copper_ore', quantity: 3 },
      { itemId: 'firewood', quantity: 10 }
    ],
    craftMoney: 150
  },
  {
    id: 'mill',
    name: '石磨',
    description: '将谷物磨成面粉。',
    craftCost: [
      { itemId: 'wood', quantity: 25 },
      { itemId: 'iron_ore', quantity: 3 },
      { itemId: 'quartz', quantity: 1 }
    ],
    craftMoney: 350
  },
  {
    id: 'worm_bin',
    name: '蚯蚓箱',
    description: '每2天自动产出鱼饵。',
    craftCost: [
      { itemId: 'wood', quantity: 15 },
      { itemId: 'herb', quantity: 5 },
      { itemId: 'firewood', quantity: 5 }
    ],
    craftMoney: 200
  },
  {
    id: 'tea_maker',
    name: '制茶机',
    description: '将茶叶和花卉泡制成饮品。',
    craftCost: [
      { itemId: 'wood', quantity: 15 },
      { itemId: 'iron_ore', quantity: 2 },
      { itemId: 'bamboo', quantity: 5 }
    ],
    craftMoney: 250
  },
  {
    id: 'tofu_press',
    name: '豆腐坊',
    description: '将豆类磨制成豆腐和酱料。',
    craftCost: [
      { itemId: 'wood', quantity: 20 },
      { itemId: 'iron_ore', quantity: 3 },
      { itemId: 'quartz', quantity: 1 }
    ],
    craftMoney: 300
  },
  {
    id: 'herb_grinder',
    name: '药碾',
    description: '将草药研磨成药膏和精华。',
    craftCost: [
      { itemId: 'iron_ore', quantity: 5 },
      { itemId: 'quartz', quantity: 2 },
      { itemId: 'gold_ore', quantity: 1 }
    ],
    craftMoney: 400
  },
  {
    id: 'incense_maker',
    name: '制香坊',
    description: '将树脂和花卉制成香料。',
    craftCost: [
      { itemId: 'wood', quantity: 15 },
      { itemId: 'bamboo', quantity: 10 },
      { itemId: 'firewood', quantity: 5 }
    ],
    craftMoney: 200
  }
]
