import type { HanhaiShopItemDef } from '@/types'

/** 瀚海驿站固定商品（每周都有） */
export const HANHAI_FIXED_ITEMS: HanhaiShopItemDef[] = [
  { itemId: 'hanhai_cactus_seed', name: '仙人掌种子', price: 500, description: '来自西域的奇特植物种子。', weeklyLimit: 5 },
  { itemId: 'hanhai_date_seed', name: '红枣种子', price: 400, description: '丝绸之路带来的果树种子。', weeklyLimit: 5 },
  { itemId: 'hanhai_map', name: '藏宝图', price: 1000, description: '标记着荒原某处宝藏的地图。', weeklyLimit: 1 },
  { itemId: 'mega_bomb_recipe', name: '巨型炸弹配方', price: 5000, description: '据说能炸开整层矿洞的秘方。', weeklyLimit: 1 }
]

/** 瀚海驿站轮换商品池（每周随机抽4个上架） */
export const HANHAI_ROTATING_POOL: HanhaiShopItemDef[] = [
  { itemId: 'hanhai_spice', name: '西域香料', price: 300, description: '异域风情的香料，烹饪佳品。', weeklyLimit: 3 },
  { itemId: 'hanhai_silk', name: '丝绸', price: 800, description: '细腻光滑的上等丝绸。', weeklyLimit: 2 },
  { itemId: 'hanhai_turquoise', name: '绿松石', price: 600, description: '西域特产的珍贵宝石。', weeklyLimit: 2 },
  { itemId: 'hanhai_incense', name: '瀚海沉香', price: 500, description: '西域珍贵香料，送礼佳品。', weeklyLimit: 2 },
  { itemId: 'hanhai_carpet', name: '飞毯碎片', price: 1200, description: '传说中飞毯的残片，珍贵的收藏品。', weeklyLimit: 1 },
  { itemId: 'hanhai_amber', name: '戈壁琥珀', price: 450, description: '戈壁滩的天然琥珀。', weeklyLimit: 3 },
  { itemId: 'hanhai_dried_fruit', name: '西域干果', price: 200, description: '甜蜜的异域干果，恢复体力。', weeklyLimit: 5 },
  { itemId: 'hanhai_pottery', name: '彩陶', price: 350, description: '精致的西域彩陶，送礼佳品。', weeklyLimit: 2 },
  { itemId: 'hanhai_saddle_leather', name: '鞍具皮革', price: 700, description: '上等的西域马具皮革。', weeklyLimit: 2 },
  { itemId: 'hanhai_lapis', name: '青金石', price: 550, description: '深蓝色的珍贵宝石。', weeklyLimit: 2 }
]
