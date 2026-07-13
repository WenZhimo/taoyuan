import { ITEMS } from '@/data/items'
import { RECIPES } from '@/data/recipes'
import { ENCHANTMENTS } from '@/data/weapons'
import { MONSTERS, BOSS_MONSTERS, SKULL_CAVERN_MONSTERS } from '@/data/mine'
import { HANHAI_FIXED_ITEMS, HANHAI_ROTATING_POOL } from '@/data/hanhai'
import { GUILD_SHOP_ITEMS } from '@/data/guild'
import { TRAVELING_MERCHANT_POOL } from '@/data/travelingMerchant'
import type { RecipeDef as LegacyRecipeDef } from '@/types'
import type { MonsterDef as LegacyMonsterDef } from '@/types/skill'
import {
  requirePackageId,
  toOfficialContentId,
  toOfficialRegistryTypeId,
  type PackageId
} from './ids'
import { RegistrySet, type RegistryDefinition, type RegistryEntry } from './registry'
import type {
  DropTableDef,
  EnchantmentDef,
  ItemDef,
  MonsterDef,
  RecipeDef,
  RecipeIngredient,
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
    registryId: toOfficialRegistryTypeId('monster'),
    description: '怪物定义',
    schemaName: 'monster.schema.json'
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

export const normalizeLegacyRecipeIngredient = (
  ingredient: LegacyRecipeDef['ingredients'][number]
): RecipeIngredient => ({
  type: 'item',
  itemId: toOfficialContentId(ingredient.itemId),
  quantity: ingredient.quantity
})

export const adaptLegacyRecipe = (recipe: LegacyRecipeDef): RecipeDef => ({
  id: toOfficialContentId(recipe.id),
  name: text(`taoyuan.recipe.${recipe.id}.name`, recipe.name),
  ingredients: recipe.ingredients.map(normalizeLegacyRecipeIngredient),
  outputItemId: toOfficialContentId(`food_${recipe.id}`),
  outputQuantity: 1,
  description: text(`taoyuan.recipe.${recipe.id}.description`, recipe.description)
})

export const adaptLegacyEnchantment = (id: string, enchantment: (typeof ENCHANTMENTS)[string]): EnchantmentDef => ({
  id: toOfficialContentId(id),
  name: text(`taoyuan.enchantment.${id}.name`, enchantment.name),
  description: text(`taoyuan.enchantment.${id}.description`, enchantment.description),
  attackBonus: enchantment.attackBonus,
  critBonus: enchantment.critBonus,
  special: enchantment.special
})

const createMonsterDropTableId = (monsterId: string): ReturnType<typeof toOfficialContentId> =>
  toOfficialContentId(`drop/monster/${monsterId}`)

export const adaptLegacyMonsterDropTable = (monster: LegacyMonsterDef): DropTableDef => ({
  id: createMonsterDropTableId(monster.id),
  entries: monster.drops.map(drop => ({
    itemId: toOfficialContentId(drop.itemId),
    chance: drop.chance,
    minQuantity: 1,
    maxQuantity: 1
  }))
})

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

const createShopOffer = (
  shopId: string,
  itemId: string,
  price: number,
  index: number,
  name?: string,
  weeklyLimit?: number
): ShopOfferDef => ({
  id: toOfficialContentId(`shop/${shopId}/${itemId}/${index}`),
  shopId: toOfficialContentId(shopId),
  itemId: toOfficialContentId(itemId),
  name: name ? text(`taoyuan.shop.${shopId}.${itemId}.name`, name) : undefined,
  price,
  weeklyLimit
})

export const createOfficialShopOffers = (): ShopOfferDef[] => [
  ...HANHAI_FIXED_ITEMS.map((item, index) =>
    createShopOffer('hanhai', item.itemId, item.price, index, item.name, item.weeklyLimit)
  ),
  ...HANHAI_ROTATING_POOL.map((item, index) =>
    createShopOffer('hanhai_rotating', item.itemId, item.price, index, item.name, item.weeklyLimit)
  ),
  ...GUILD_SHOP_ITEMS.map((item, index) =>
    createShopOffer('guild', item.itemId, item.price, index, item.name, item.weeklyLimit)
  ),
  ...TRAVELING_MERCHANT_POOL.map((item, index) =>
    createShopOffer('traveling_merchant', item.itemId, item.basePrice, index, item.name)
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
  const monsterRegistry = registrySet.get<MonsterDef>(toOfficialRegistryTypeId('monster'))
  const enchantmentRegistry = registrySet.get<EnchantmentDef>(toOfficialRegistryTypeId('enchantment'))
  const dropTableRegistry = registrySet.get<DropTableDef>(toOfficialRegistryTypeId('drop_table'))
  const recipeRegistry = registrySet.get<RecipeDef>(toOfficialRegistryTypeId('recipe'))
  const shopOfferRegistry = registrySet.get<ShopOfferDef>(toOfficialRegistryTypeId('shop_offer'))

  for (const tag of createOfficialTags()) tagRegistry.register(owner, tag, { file: 'src/domain/mods/staticAdapters.ts' })
  for (const item of ITEMS.map(adaptLegacyItem)) itemRegistry.register(owner, item, { file: 'src/data/items.ts' })
  for (const recipe of RECIPES.map(adaptLegacyRecipe)) recipeRegistry.register(owner, recipe, { file: 'src/data/recipes.ts' })
  for (const [id, enchantment] of Object.entries(ENCHANTMENTS)) {
    enchantmentRegistry.register(owner, adaptLegacyEnchantment(id, enchantment), { file: 'src/data/weapons.ts' })
  }

  const monsters = uniqueMonsters()
  for (const table of monsters.filter(monster => monster.drops.length > 0).map(adaptLegacyMonsterDropTable)) {
    dropTableRegistry.register(owner, table, { file: 'src/data/mine.ts' })
  }
  for (const monster of monsters.map(adaptLegacyMonster)) {
    monsterRegistry.register(owner, monster, { file: 'src/data/mine.ts' })
  }
  for (const offer of createOfficialShopOffers()) {
    shopOfferRegistry.register(owner, offer, { file: 'src/data/*shop*.ts' })
  }

  return registrySet
}
