import { ITEMS } from '@/data/items'
import { CROPS } from '@/data/crops'
import { RECIPES } from '@/data/recipes'
import {
  ENCHANTMENTS,
  ENCHANTMENT_EFFECTS,
  ENCHANTMENT_RARITY,
  MONSTER_DROP_WEAPONS,
  RANDOM_ENCHANT_IDS,
  SHOP_WEAPONS,
  TREASURE_DROP_WEAPONS
} from '@/data/weapons'
import { MONSTERS, BOSS_MONSTERS, SKULL_CAVERN_MONSTERS, ZONE_MONSTERS } from '@/data/mine'
import { HANHAI_FIXED_ITEMS, HANHAI_ROTATING_POOL } from '@/data/hanhai'
import { GUILD_SHOP_ITEMS } from '@/data/guild'
import { TRAVELING_MERCHANT_POOL } from '@/data/travelingMerchant'
import { SHOPS, type ShopDef as LegacyShopDef } from '@/data/shops'
import { FRUIT_TREE_DEFS } from '@/data/fruitTrees'
import { MONSTER_DROP_RINGS, TREASURE_DROP_RINGS } from '@/data/rings'
import { MONSTER_DROP_HATS, SHOP_HATS, TREASURE_DROP_HATS } from '@/data/hats'
import { MONSTER_DROP_SHOES, SHOP_SHOES, TREASURE_DROP_SHOES } from '@/data/shoes'
import { HAY_PRICE } from '@/data/animals'
import { BAITS, FERTILIZERS, TACKLES } from '@/data/processing'
import type { RecipeDef as LegacyRecipeDef } from '@/types'
import type { CropDef as LegacyCropDef } from '@/types/farm'
import type { MonsterDef as LegacyMonsterDef } from '@/types/skill'
import {
  requirePackageId,
  toOfficialContentId,
  toOfficialRegistryTypeId,
  type PackageId
} from './ids'
import {
  MAIN_MINE_BOSS_FLOORS,
  MAIN_MINE_ZONES,
  SKULL_CAVERN_BASE_POOL_ID,
  SKULL_CAVERN_BOSS_POOL_ID,
  SKULL_CAVERN_DEPTH_11_POOL_ID,
  getMainMineBossPoolId,
  getMainMineZonePoolId
} from './monsterPoolIds'
import { RegistrySet, type RegistryDefinition, type RegistryEntry } from './registry'
import type {
  DropTableDef,
  EnchantmentDef,
  ItemDef,
  CropDef,
  MonsterDef,
  MonsterPoolDef,
  RecipeDef,
  RecipeIngredient,
  ShopDef,
  ShopOfferDef,
  TagDef
} from './schemas'

export const OFFICIAL_PACKAGE_ID = requirePackageId('taoyuan-core')

const text = (key: string, fallback: string) => ({ key, fallback })
const tag = (id: string) => toOfficialContentId(id)

export const OFFICIAL_REGISTRY_DEFINITIONS = [
  {
    registryId: toOfficialRegistryTypeId('tag'),
    description: '物品和配方标签',
    schemaName: 'tag.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('item'),
    description: '物品定义',
    schemaName: 'item.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('crop'),
    description: '作物定义',
    schemaName: 'crop.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('monster'),
    description: '怪物定义',
    schemaName: 'monster.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('monster_pool'),
    description: '有序怪物候选池',
    schemaName: 'monster-pool.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('enchantment'),
    description: '装备附魔定义',
    schemaName: 'enchantment.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('drop_table'),
    description: '掉落表定义',
    schemaName: 'drop-table.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('recipe'),
    description: '配方定义',
    schemaName: 'recipe.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('shop'),
    description: '商店定义',
    schemaName: 'shop.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('shop_offer'),
    description: '商店商品定义',
    schemaName: 'shop-offer.schema.json'
  }
] as const satisfies readonly RegistryDefinition<RegistryEntry>[]

export const createOfficialTags = (): TagDef[] => [
  {
    id: toOfficialContentId('vegetarian'),
    name: text('taoyuan.tag.vegetarian.name', '素食'),
    description: text('taoyuan.tag.vegetarian.description', '不含肉类的材料或制品'),
    propagateToCraftedOutput: true,
    stackPolicy: 'merge'
  },
  {
    id: toOfficialContentId('meat'),
    name: text('taoyuan.tag.meat.name', '肉类'),
    description: text('taoyuan.tag.meat.description', '肉类材料或制品'),
    propagateToCraftedOutput: true,
    stackPolicy: 'merge'
  },
  {
    id: toOfficialContentId('protein'),
    name: text('taoyuan.tag.protein.name', '蛋白质'),
    propagateToCraftedOutput: true,
    stackPolicy: 'merge'
  },
  {
    id: toOfficialContentId('human_meat'),
    name: text('taoyuan.tag.human_meat.name', '人肉'),
    propagateToCraftedOutput: true,
    stackPolicy: 'separate',
    behaviorSensitive: true
  }
]

const deriveLegacyItemTags = (item: (typeof ITEMS)[number]): ItemDef['tags'] | undefined => {
  const tags = new Set<NonNullable<ItemDef['tags']>[number]>()
  if (item.category === 'crop' || item.category === 'fruit') tags.add(tag('vegetarian'))
  if (item.category === 'fish') {
    tags.add(tag('meat'))
    tags.add(tag('protein'))
  }
  if (item.category === 'animal_product' && item.edible) tags.add(tag('protein'))
  return tags.size > 0 ? Array.from(tags).sort() : undefined
}

export const adaptLegacyItem = (item: (typeof ITEMS)[number]): ItemDef => ({
  id: toOfficialContentId(item.id),
  name: text(`taoyuan.item.${item.id}.name`, item.name),
  category: item.category,
  description: text(`taoyuan.item.${item.id}.description`, item.description),
  sellPrice: item.sellPrice,
  edible: item.edible,
  staminaRestore: item.staminaRestore,
  healthRestore: item.healthRestore,
  tags: deriveLegacyItemTags(item)
})

export const adaptLegacyCrop = (crop: LegacyCropDef): CropDef => ({
  id: toOfficialContentId(crop.id),
  name: text(`taoyuan.crop.${crop.id}.name`, crop.name),
  seedId: toOfficialContentId(crop.seedId),
  season: crop.season,
  growthDays: crop.growthDays,
  sellPrice: crop.sellPrice,
  seedPrice: crop.seedPrice,
  deepWatering: crop.deepWatering,
  description: text(`taoyuan.crop.${crop.id}.description`, crop.description),
  ...(crop.regrowth !== undefined ? { regrowth: crop.regrowth } : {}),
  ...(crop.regrowthDays !== undefined ? { regrowthDays: crop.regrowthDays } : {}),
  ...(crop.maxHarvests !== undefined ? { maxHarvests: crop.maxHarvests } : {}),
  ...(crop.giantCropEligible !== undefined ? { giantCropEligible: crop.giantCropEligible } : {})
})

export const normalizeLegacyRecipeIngredient = (
  ingredient: LegacyRecipeDef['ingredients'][number]
): RecipeIngredient => ({
  type: 'item',
  itemId: toOfficialContentId(ingredient.itemId),
  quantity: ingredient.quantity
})

const adaptLegacyRecipeIngredients = (recipe: LegacyRecipeDef): RecipeIngredient[] => {
  const ingredients = recipe.ingredients.map(normalizeLegacyRecipeIngredient)
  if (recipe.id !== 'steamed_bun') return ingredients
  return [
    ...ingredients,
    {
      type: 'anyOfTags',
      tagIds: [tag('vegetarian'), tag('meat')],
      quantity: 1
    }
  ]
}

export const adaptLegacyRecipe = (recipe: LegacyRecipeDef): RecipeDef => ({
  id: toOfficialContentId(recipe.id),
  name: text(`taoyuan.recipe.${recipe.id}.name`, recipe.name),
  ingredients: adaptLegacyRecipeIngredients(recipe),
  outputItemId: toOfficialContentId(`food_${recipe.id}`),
  outputQuantity: 1,
  effect: {
    staminaRestore: recipe.effect.staminaRestore,
    ...(recipe.effect.healthRestore !== undefined ? { healthRestore: recipe.effect.healthRestore } : {}),
    ...(recipe.effect.buff ? { buff: { ...recipe.effect.buff } } : {})
  },
  unlockSource: recipe.unlockSource,
  description: text(`taoyuan.recipe.${recipe.id}.description`, recipe.description),
  ...(recipe.requiredSkill ? { requiredSkill: { ...recipe.requiredSkill } } : {})
})

const getLegacyEnchantmentRarity = (id: string): number => ENCHANTMENT_RARITY[id] ?? 1

const getLegacyEnchantmentRandomWeight = (id: string): number => {
  if (!RANDOM_ENCHANT_IDS.includes(id)) return 0
  const rarity = getLegacyEnchantmentRarity(id)
  return 1 / (rarity * rarity)
}

export const adaptLegacyEnchantment = (id: string, enchantment: (typeof ENCHANTMENTS)[string]): EnchantmentDef => ({
  id: toOfficialContentId(id),
  name: text(`taoyuan.enchantment.${id}.name`, enchantment.name),
  description: text(`taoyuan.enchantment.${id}.description`, enchantment.description),
  rarity: getLegacyEnchantmentRarity(id),
  randomWeight: getLegacyEnchantmentRandomWeight(id),
  attackBonus: enchantment.attackBonus,
  critBonus: enchantment.critBonus,
  special: enchantment.special,
  effects: (ENCHANTMENT_EFFECTS[id] ?? []).map(effect => ({ ...effect }))
})

const createMonsterDropTableId = (monsterId: string): ReturnType<typeof toOfficialContentId> =>
  toOfficialContentId(`drop/monster/${monsterId}`)

type EquipmentDropSource = 'monster' | 'treasure'
type EquipmentDropKind = 'weapon' | 'ring' | 'hat' | 'shoe'

const createEquipmentDropTableId = (
  source: EquipmentDropSource,
  kind: EquipmentDropKind,
  zone: string
): ReturnType<typeof toOfficialContentId> => toOfficialContentId(`drop/equipment/${source}/${kind}/${zone}`)

const adaptLegacyEquipmentDropTable = <T>(
  source: EquipmentDropSource,
  kind: EquipmentDropKind,
  zone: string,
  drops: readonly T[],
  getItemId: (drop: T) => string,
  getChance: (drop: T) => number
): DropTableDef => ({
  id: createEquipmentDropTableId(source, kind, zone),
  entries: drops.map(drop => ({
    itemId: toOfficialContentId(getItemId(drop)),
    chance: getChance(drop),
    minQuantity: 1,
    maxQuantity: 1
  }))
})

export const adaptLegacyMonsterDropTable = (monster: LegacyMonsterDef): DropTableDef => ({
  id: createMonsterDropTableId(monster.id),
  entries: monster.drops.map(drop => ({
    itemId: toOfficialContentId(drop.itemId),
    chance: drop.chance,
    minQuantity: 1,
    maxQuantity: 1
  }))
})

export const createOfficialEquipmentDropTables = (): DropTableDef[] => {
  const tables: DropTableDef[] = []

  const addTables = <T>(
    source: EquipmentDropSource,
    kind: EquipmentDropKind,
    pools: Record<string, readonly T[]>,
    getItemId: (drop: T) => string,
    getChance: (drop: T) => number
  ) => {
    for (const [zone, drops] of Object.entries(pools)) {
      tables.push(adaptLegacyEquipmentDropTable(source, kind, zone, drops, getItemId, getChance))
    }
  }

  addTables('monster', 'weapon', MONSTER_DROP_WEAPONS, drop => drop.weaponId, drop => drop.chance)
  addTables('monster', 'ring', MONSTER_DROP_RINGS, drop => drop.ringId, drop => drop.chance)
  addTables('monster', 'hat', MONSTER_DROP_HATS, drop => drop.hatId, drop => drop.chance)
  addTables('monster', 'shoe', MONSTER_DROP_SHOES, drop => drop.shoeId, drop => drop.chance)
  addTables('treasure', 'weapon', TREASURE_DROP_WEAPONS, drop => drop.weaponId, drop => drop.chance)
  addTables('treasure', 'ring', TREASURE_DROP_RINGS, drop => drop.ringId, drop => drop.chance)
  addTables('treasure', 'hat', TREASURE_DROP_HATS, drop => drop.hatId, drop => drop.chance)
  addTables('treasure', 'shoe', TREASURE_DROP_SHOES, drop => drop.shoeId, drop => drop.chance)

  return tables
}

export const adaptLegacyMonster = (monster: LegacyMonsterDef): MonsterDef => ({
  id: toOfficialContentId(monster.id),
  name: text(`taoyuan.monster.${monster.id}.name`, monster.name),
  hp: monster.hp,
  attack: monster.attack,
  defense: monster.defense,
  expReward: monster.expReward,
  dropTableId: monster.drops.length > 0 ? createMonsterDropTableId(monster.id) : undefined,
  description: text(`taoyuan.monster.${monster.id}.description`, monster.description)
})

const adaptLegacyMonsterPool = (
  id: ReturnType<typeof toOfficialContentId>,
  monsters: readonly LegacyMonsterDef[]
): MonsterPoolDef => ({
  id,
  entries: monsters.map(monster => ({ monsterId: toOfficialContentId(monster.id) }))
})

export const createOfficialMonsterPools = (): MonsterPoolDef[] => [
  ...MAIN_MINE_ZONES.map(zone => adaptLegacyMonsterPool(getMainMineZonePoolId(zone), ZONE_MONSTERS[zone])),
  ...MAIN_MINE_BOSS_FLOORS.map(floor => adaptLegacyMonsterPool(getMainMineBossPoolId(floor), [BOSS_MONSTERS[floor]!])),
  adaptLegacyMonsterPool(SKULL_CAVERN_BASE_POOL_ID, Object.values(SKULL_CAVERN_MONSTERS)),
  adaptLegacyMonsterPool(SKULL_CAVERN_DEPTH_11_POOL_ID, [MONSTERS.shadow_lurker!, MONSTERS.bone_dragon!]),
  adaptLegacyMonsterPool(
    SKULL_CAVERN_BOSS_POOL_ID,
    MAIN_MINE_BOSS_FLOORS.map(floor => BOSS_MONSTERS[floor]!)
  )
]

export const adaptLegacyShop = (shop: LegacyShopDef): ShopDef => ({
  id: toOfficialContentId(shop.id),
  name: text(`taoyuan.shop.${shop.id}.name`, shop.name),
  description: text(`taoyuan.shop.${shop.id}.description`, shop.description),
  npcName: text(`taoyuan.shop.${shop.id}.npcName`, shop.npcName),
  closedDays: [...shop.closedDays],
  openHour: shop.openHour,
  closeHour: shop.closeHour,
  closedWeathers: [...shop.closedWeathers],
  closedSeasons: [...shop.closedSeasons]
})

export const createOfficialShops = (): ShopDef[] => SHOPS.map(adaptLegacyShop)

interface LegacyShopOfferInput {
  shopId: string
  itemId: string
  price: number
  index: number
  groupId?: string
  groupName?: string
  name?: string
  description?: string
  purchaseKind?: ShopOfferDef['purchaseKind']
  weeklyLimit?: number
  availableSeasons?: ShopOfferDef['availableSeasons']
}

const createShopOffer = (offer: LegacyShopOfferInput): ShopOfferDef => ({
  id: toOfficialContentId(`shop/${offer.shopId}/${offer.groupId ?? 'default'}/${offer.itemId}/${offer.index}`),
  shopId: toOfficialContentId(offer.shopId),
  itemId: toOfficialContentId(offer.itemId),
  ...(offer.name ? { name: text(`taoyuan.shop.${offer.shopId}.${offer.itemId}.name`, offer.name) } : {}),
  ...(offer.description ? { description: text(`taoyuan.shop.${offer.shopId}.${offer.itemId}.description`, offer.description) } : {}),
  ...(offer.groupId ? { groupId: offer.groupId } : {}),
  ...(offer.groupName ? { groupName: text(`taoyuan.shop.${offer.shopId}.${offer.groupId}.name`, offer.groupName) } : {}),
  ...(offer.purchaseKind ? { purchaseKind: offer.purchaseKind } : {}),
  price: offer.price,
  ...(offer.weeklyLimit !== undefined ? { weeklyLimit: offer.weeklyLimit } : {}),
  sortOrder: offer.index,
  ...(offer.availableSeasons ? { availableSeasons: [...offer.availableSeasons] } : {})
})

const coreShopItemOffers: LegacyShopOfferInput[] = [
  ...CROPS.filter(crop => crop.seedPrice > 0).map((crop, index) => ({
    shopId: 'wanwupu',
    itemId: crop.seedId,
    price: crop.seedPrice,
    index,
    groupId: 'seasonal_seeds',
    groupName: '当季种子',
    name: `${crop.name}种子`,
    description: `${crop.growthDays}天成熟 → 售${crop.sellPrice}文`,
    purchaseKind: 'seed' as const,
    availableSeasons: crop.season
  })),
  ...FRUIT_TREE_DEFS.map((tree, index) => ({
    shopId: 'wanwupu',
    itemId: tree.saplingId,
    price: tree.saplingPrice,
    index: 100 + index,
    groupId: 'goods',
    groupName: '杂货',
    name: `${tree.name}苗`,
    description: `28天成熟 · ${tree.fruitName}`
  })),
  ...[
    { itemId: 'hay', name: '干草', price: HAY_PRICE, description: '喂养牲畜用' },
    { itemId: 'wood', name: '木材', price: 50, description: '建筑和加工的基础材料' },
    { itemId: 'sleeping_bag', name: '睡袋', price: 1200, description: '资源地点可原地过夜' },
    { itemId: 'rain_totem', name: '雨图腾', price: 300, description: '使用后可以让明天下雨' }
  ].map((item, index) => ({
    shopId: 'wanwupu',
    itemId: item.itemId,
    price: item.price,
    index: 100 + FRUIT_TREE_DEFS.length + index,
    groupId: 'goods',
    groupName: '杂货',
    name: item.name,
    description: item.description
  })),
  ...[
    { itemId: 'copper_ore', name: '铜矿', price: 100, description: '矿洞中常见的铜矿' },
    { itemId: 'iron_ore', name: '铁矿', price: 200, description: '中层矿洞出产的铁矿' },
    { itemId: 'gold_ore', name: '金矿', price: 400, description: '深层矿洞出产的金矿' },
    { itemId: 'copper_bar', name: '铜锭', price: 300, description: '冶炼好的铜锭' },
    { itemId: 'iron_bar', name: '铁锭', price: 600, description: '冶炼好的铁锭' },
    { itemId: 'gold_bar', name: '金锭', price: 1200, description: '冶炼好的金锭' },
    { itemId: 'charcoal', name: '木炭', price: 100, description: '烧制的木炭' }
  ].map((item, index) => ({
    shopId: 'tiejiangpu',
    itemId: item.itemId,
    price: item.price,
    index,
    groupId: 'materials',
    groupName: '材料',
    name: item.name,
    description: item.description
  })),
  ...SHOP_WEAPONS.map((weapon, index) => ({
    shopId: 'biaoju',
    itemId: weapon.id,
    price: weapon.shopPrice!,
    index,
    groupId: 'weapons',
    groupName: '武器',
    name: weapon.name,
    description: weapon.description,
    purchaseKind: 'weapon' as const
  })),
  ...BAITS.filter(bait => bait.shopPrice !== null).map((bait, index) => ({
    shopId: 'yugupu',
    itemId: bait.id,
    price: bait.shopPrice!,
    index,
    groupId: 'baits',
    groupName: '鱼饵',
    name: bait.name,
    description: bait.description
  })),
  ...TACKLES.filter(tackle => tackle.shopPrice !== null).map((tackle, index) => ({
    shopId: 'yugupu',
    itemId: tackle.id,
    price: tackle.shopPrice!,
    index: 100 + index,
    groupId: 'tackles',
    groupName: '浮漂',
    name: tackle.name,
    description: tackle.description
  })),
  {
    shopId: 'yugupu',
    itemId: 'crab_pot',
    price: 1500,
    index: 200,
    groupId: 'tools',
    groupName: '其他商品',
    name: '蟹笼',
    description: '放置在钓鱼地点，每日自动捕获水产（需鱼饵）'
  },
  ...FERTILIZERS.filter(fertilizer => fertilizer.shopPrice !== null).map((fertilizer, index) => ({
    shopId: 'yaopu',
    itemId: fertilizer.id,
    price: fertilizer.shopPrice!,
    index: index,
    groupId: 'fertilizers',
    groupName: '肥料',
    name: fertilizer.name,
    description: fertilizer.description
  })),
  ...[
    { itemId: 'herb', name: '草药', price: 50, description: '山间野生的草药' },
    { itemId: 'ginseng', name: '人参', price: 600, description: '极其珍贵的野生人参' },
    { itemId: 'animal_medicine', name: '兽药', price: 150, description: '治疗生病的牲畜' },
    { itemId: 'premium_feed', name: '精饲料', price: 200, description: '提升动物心情和好感' },
    { itemId: 'nourishing_feed', name: '滋补饲料', price: 250, description: '加速动物产出' },
    { itemId: 'vitality_feed', name: '活力饲料', price: 300, description: '喂食必定治愈疾病' },
    { itemId: 'fish_feed', name: '鱼饲料', price: 30, description: '鱼塘专用饲料' },
    { itemId: 'water_purifier', name: '水质改良剂', price: 100, description: '改善鱼塘水质' }
  ].map((item, index) => ({
    shopId: 'yaopu',
    itemId: item.itemId,
    price: item.price,
    index: 100 + index,
    groupId: 'medicine',
    groupName: '药材',
    name: item.name,
    description: item.description
  })),
  ...[
    { itemId: 'cloth', name: '布匹', price: 1200, description: '用羊毛纺织的布匹' },
    { itemId: 'silk_cloth', name: '丝绸', price: 500, description: '华美的丝绸' },
    { itemId: 'alpaca_cloth', name: '羊驼绒', price: 900, description: '极其柔软的羊驼绒布' },
    { itemId: 'felt', name: '毛毡', price: 600, description: '用兔毛压制的毛毡' },
    { itemId: 'silk_ribbon', name: '丝帕', price: 500, description: '精心绣制的丝帕' },
    { itemId: 'jade_ring', name: '翡翠戒指', price: 1500, description: '可以用来求婚' },
    { itemId: 'zhiji_jade', name: '知己玉佩', price: 1500, description: '赠予同性挚友可结为知己' },
    { itemId: 'pine_incense', name: '松香', price: 250, description: '清新的松香' },
    { itemId: 'camphor_incense', name: '樟脑香', price: 400, description: '提神醒脑' },
    { itemId: 'osmanthus_incense', name: '桂花香', price: 800, description: '馥郁的桂花香' }
  ].map((item, index) => ({
    shopId: 'chouduanzhuang',
    itemId: item.itemId,
    price: item.price,
    index,
    groupId: 'textiles',
    groupName: '布匹',
    name: item.name,
    description: item.description
  })),
  ...SHOP_HATS.map((hat, index) => ({
    shopId: 'chouduanzhuang',
    itemId: hat.id,
    price: hat.shopPrice!,
    index: 100 + index,
    groupId: 'hats',
    groupName: '帽子',
    name: hat.name,
    description: hat.description,
    purchaseKind: 'hat' as const
  })),
  ...SHOP_SHOES.map((shoe, index) => ({
    shopId: 'chouduanzhuang',
    itemId: shoe.id,
    price: shoe.shopPrice!,
    index: 200 + index,
    groupId: 'shoes',
    groupName: '鞋子',
    name: shoe.name,
    description: shoe.description,
    purchaseKind: 'shoe' as const
  }))
]

export const createOfficialShopOffers = (): ShopOfferDef[] => [
  ...coreShopItemOffers.map(createShopOffer),
  ...HANHAI_FIXED_ITEMS.map((item, index) =>
    createShopOffer({
      shopId: 'hanhai',
      itemId: item.itemId,
      price: item.price,
      index,
      groupId: 'fixed',
      groupName: '固定商品',
      name: item.name,
      weeklyLimit: item.weeklyLimit
    })
  ),
  ...HANHAI_ROTATING_POOL.map((item, index) =>
    createShopOffer({
      shopId: 'hanhai_rotating',
      itemId: item.itemId,
      price: item.price,
      index,
      groupId: 'rotating',
      groupName: '轮换商品',
      name: item.name,
      weeklyLimit: item.weeklyLimit
    })
  ),
  ...GUILD_SHOP_ITEMS.map((item, index) =>
    createShopOffer({
      shopId: 'guild',
      itemId: item.itemId,
      price: item.price,
      index,
      groupId: 'guild',
      groupName: '行会商品',
      name: item.name,
      weeklyLimit: item.weeklyLimit
    })
  ),
  ...TRAVELING_MERCHANT_POOL.map((item, index) =>
    createShopOffer({
      shopId: 'traveling_merchant',
      itemId: item.itemId,
      price: item.basePrice,
      index,
      groupId: 'traveling',
      groupName: '旅行商人',
      name: item.name
    })
  )
]

const uniqueMonsters = (): LegacyMonsterDef[] => {
  const byId = new Map<string, LegacyMonsterDef>()
  for (const monster of [
    ...Object.values(MONSTERS),
    ...Object.values(BOSS_MONSTERS),
    ...Object.values(SKULL_CAVERN_MONSTERS)
  ]) {
    if (!byId.has(monster.id)) byId.set(monster.id, monster)
  }
  return Array.from(byId.values())
}

export const buildOfficialRegistrySetFromStaticData = (owner: PackageId = OFFICIAL_PACKAGE_ID): RegistrySet => {
  const registrySet = new RegistrySet()
  for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
  registrySet.freezeDefinitions()

  const tagRegistry = registrySet.get<TagDef>(toOfficialRegistryTypeId('tag'))
  const itemRegistry = registrySet.get<ItemDef>(toOfficialRegistryTypeId('item'))
  const cropRegistry = registrySet.get<CropDef>(toOfficialRegistryTypeId('crop'))
  const monsterRegistry = registrySet.get<MonsterDef>(toOfficialRegistryTypeId('monster'))
  const monsterPoolRegistry = registrySet.get<MonsterPoolDef>(toOfficialRegistryTypeId('monster_pool'))
  const enchantmentRegistry = registrySet.get<EnchantmentDef>(toOfficialRegistryTypeId('enchantment'))
  const dropTableRegistry = registrySet.get<DropTableDef>(toOfficialRegistryTypeId('drop_table'))
  const recipeRegistry = registrySet.get<RecipeDef>(toOfficialRegistryTypeId('recipe'))
  const shopRegistry = registrySet.get<ShopDef>(toOfficialRegistryTypeId('shop'))
  const shopOfferRegistry = registrySet.get<ShopOfferDef>(toOfficialRegistryTypeId('shop_offer'))

  for (const tag of createOfficialTags()) tagRegistry.register(owner, tag, { file: 'src/domain/mods/staticAdapters.ts' })
  for (const item of ITEMS.map(adaptLegacyItem)) itemRegistry.register(owner, item, { file: 'src/data/items.ts' })
  for (const crop of CROPS.map(adaptLegacyCrop)) cropRegistry.register(owner, crop, { file: 'src/data/crops.ts' })
  for (const recipe of RECIPES.map(adaptLegacyRecipe)) recipeRegistry.register(owner, recipe, { file: 'src/data/recipes.ts' })
  for (const shop of createOfficialShops()) shopRegistry.register(owner, shop, { file: 'src/data/shops.ts' })
  for (const [id, enchantment] of Object.entries(ENCHANTMENTS)) {
    enchantmentRegistry.register(owner, adaptLegacyEnchantment(id, enchantment), { file: 'src/data/weapons.ts' })
  }

  const monsters = uniqueMonsters()
  for (const table of monsters.filter(monster => monster.drops.length > 0).map(adaptLegacyMonsterDropTable)) {
    dropTableRegistry.register(owner, table, { file: 'src/data/mine.ts' })
  }
  for (const table of createOfficialEquipmentDropTables()) {
    dropTableRegistry.register(owner, table, { file: 'src/data/*equipment-drops*.ts' })
  }
  for (const monster of monsters.map(adaptLegacyMonster)) {
    monsterRegistry.register(owner, monster, { file: 'src/data/mine.ts' })
  }
  for (const pool of createOfficialMonsterPools()) {
    monsterPoolRegistry.register(owner, pool, { file: 'src/data/mine.ts' })
  }
  for (const offer of createOfficialShopOffers()) {
    shopOfferRegistry.register(owner, offer, { file: 'src/data/*shop*.ts' })
  }

  return registrySet
}
