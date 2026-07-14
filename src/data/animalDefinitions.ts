import type { AnimalDef } from '@/types'

/** 动物定义 */
export const ANIMAL_DEFS: AnimalDef[] = [
  // ===== 鸡舍动物 (8种) =====
  {
    type: 'chicken',
    name: '鸡',
    building: 'coop',
    cost: 800,
    productId: 'egg',
    productName: '鸡蛋',
    produceDays: 1,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'duck',
    name: '鸭',
    building: 'coop',
    cost: 1200,
    productId: 'duck_egg',
    productName: '鸭蛋',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'rabbit',
    name: '兔',
    building: 'coop',
    cost: 2000,
    productId: 'rabbit_fur',
    productName: '兔毛',
    produceDays: 3,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'goose',
    name: '鹅',
    building: 'coop',
    cost: 1500,
    productId: 'goose_egg',
    productName: '鹅蛋',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'quail',
    name: '鹌鹑',
    building: 'coop',
    cost: 500,
    productId: 'quail_egg',
    productName: '鹌鹑蛋',
    produceDays: 1,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'pigeon',
    name: '鸽子',
    building: 'coop',
    cost: 1000,
    productId: 'pigeon_egg',
    productName: '鸽子蛋',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'silkie',
    name: '乌骨鸡',
    building: 'coop',
    cost: 3000,
    productId: 'silkie_egg',
    productName: '乌鸡蛋',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'peacock',
    name: '孔雀',
    building: 'coop',
    cost: 8000,
    productId: 'peacock_feather',
    productName: '孔雀羽',
    produceDays: 4,
    friendship: { min: 0, max: 1000 }
  },
  // ===== 牲口棚动物 (11种) =====
  {
    type: 'cow',
    name: '牛',
    building: 'barn',
    cost: 1500,
    productId: 'milk',
    productName: '牛奶',
    produceDays: 1,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'sheep',
    name: '羊',
    building: 'barn',
    cost: 8000,
    productId: 'wool',
    productName: '羊毛',
    produceDays: 3,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'goat',
    name: '山羊',
    building: 'barn',
    cost: 4000,
    productId: 'goat_milk',
    productName: '羊奶',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'pig',
    name: '猪',
    building: 'barn',
    cost: 16000,
    productId: 'truffle',
    productName: '松露',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'buffalo',
    name: '水牛',
    building: 'barn',
    cost: 3000,
    productId: 'buffalo_milk',
    productName: '水牛奶',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'yak',
    name: '牦牛',
    building: 'barn',
    cost: 5000,
    productId: 'yak_milk',
    productName: '牦牛奶',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'alpaca',
    name: '羊驼',
    building: 'barn',
    cost: 6000,
    productId: 'alpaca_wool',
    productName: '羊驼毛',
    produceDays: 3,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'deer',
    name: '鹿',
    building: 'barn',
    cost: 12000,
    productId: 'antler_velvet',
    productName: '鹿茸',
    produceDays: 5,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'donkey',
    name: '驴',
    building: 'barn',
    cost: 3000,
    productId: 'donkey_milk',
    productName: '驴奶',
    produceDays: 3,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'camel',
    name: '骆驼',
    building: 'barn',
    cost: 7000,
    productId: 'camel_milk',
    productName: '驼奶',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'ostrich',
    name: '鸵鸟',
    building: 'barn',
    cost: 10000,
    productId: 'ostrich_egg',
    productName: '鸵鸟蛋',
    produceDays: 3,
    friendship: { min: 0, max: 1000 }
  },
  // ===== 马厩 (1种) =====
  {
    type: 'horse',
    name: '马',
    building: 'stable',
    cost: 5000,
    productId: '',
    productName: '',
    produceDays: 0,
    friendship: { min: 0, max: 1000 }
  }
]

/** 干草物品ID */
export const HAY_ITEM_ID = 'hay'

/** 干草购买价格 */
export const HAY_PRICE = 50

export const PREMIUM_FEED_ID = 'premium_feed'
export const NOURISHING_FEED_ID = 'nourishing_feed'
export const VITALITY_FEED_ID = 'vitality_feed'
