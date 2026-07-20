import { ITEMS } from '@/data/items'
import { CROPS } from '@/data/crops'
import { FISH } from '@/data/fishDefinitions'
import { FORAGE_ITEMS } from '@/data/forageDefinitions'
import { RECIPES } from '@/data/recipes'
import {
  ENCHANTMENTS,
  ENCHANTMENT_EFFECTS,
  ENCHANTMENT_RARITY,
  RANDOM_ENCHANT_IDS
} from '@/data/enchantmentDefinitions'
import {
  MONSTER_DROP_WEAPONS,
  SHOP_WEAPONS,
  TREASURE_DROP_WEAPONS,
  WEAPONS,
  getBaseWeaponSellPrice
} from '@/data/weaponDefinitions'
import { MONSTERS, BOSS_MONSTERS, SKULL_CAVERN_MONSTERS, ZONE_MONSTERS } from '@/data/monsters'
import { HANHAI_FIXED_ITEMS, HANHAI_ROTATING_POOL } from '@/data/hanhaiShopDefinitions'
import { TRADE_EXCHANGE_ITEMS } from '@/data/hanhaiDefinitions'
import { TRADE_SHOP_UPGRADES } from '@/data/hanhaiTradeShopDefinitions'
import { HANHAI_TREASURE_REWARDS } from '@/data/hanhaiTreasureDefinitions'
import { HANHAI_ROULETTE_CONFIG, type HanhaiRouletteDefinition } from '@/data/hanhaiRouletteDefinitions'
import { HANHAI_CASINO_WAGERS } from '@/data/hanhaiCasinoDefinitions'
import { GUILD_DONATIONS, GUILD_LEVELS, GUILD_SHOP_ITEMS, MONSTER_GOALS } from '@/data/guildDefinitions'
import { ACHIEVEMENTS, COMMUNITY_BUNDLES } from '@/data/achievementDefinitions'
import { TRAVELING_MERCHANT_POOL } from '@/data/travelingMerchant'
import { MARKET_CATEGORY_DEFINITIONS, type MarketCategoryDefinition } from '@/data/marketDefinitions'
import { SHOPS, type ShopDef as LegacyShopDef } from '@/data/shops'
import {
  FRUIT_TREE_DEFINITIONS,
  WILD_TREE_DEFINITIONS
} from '@/data/treeDefinitions'
import { MONSTER_DROP_RINGS, RINGS, TREASURE_DROP_RINGS } from '@/data/ringDefinitions'
import { HATS, MONSTER_DROP_HATS, SHOP_HATS, TREASURE_DROP_HATS } from '@/data/hatDefinitions'
import { MONSTER_DROP_SHOES, SHOES, SHOP_SHOES, TREASURE_DROP_SHOES } from '@/data/shoeDefinitions'
import { ANIMAL_DEFS, HAY_PRICE } from '@/data/animalDefinitions'
import { FEED_DEFS } from '@/data/animalFeedDefinitions'
import { WALLET_ITEMS } from '@/data/walletDefinitions'
import { MUSEUM_CATEGORIES, MUSEUM_ITEMS, MUSEUM_MILESTONES } from '@/data/museumDefinitions'
import { NPCS } from '@/data/npcDefinitions'
import { HEART_EVENTS } from '@/data/heartEventDefinitions'
import { HIDDEN_NPCS } from '@/data/hiddenNpcDefinitions'
import { HIDDEN_NPC_HEART_EVENTS } from '@/data/hiddenNpcHeartEventDefinitions'
import { STORY_QUESTS } from '@/data/storyQuestDefinitions'
import { SECRET_NOTES } from '@/data/secretNotes'
import { MORNING_TIPS } from '@/data/tutorials'
import {
  MORNING_CHOICE_EVENTS,
  MORNING_EASTER_EGGS,
  MORNING_NARRATIONS,
  type MorningChoiceEvent as LegacyMorningChoiceEvent,
  type MorningEasterEgg as LegacyMorningEasterEgg,
  type MorningEffect as LegacyMorningEffect,
  type MorningNarration as LegacyMorningNarration
} from '@/data/farmEventDefinitions'
import { SEASON_EVENTS, type SeasonEventDef as LegacySeasonEventDef } from '@/data/seasonEventDefinitions'
import {
  QUEST_TEMPLATES,
  SPECIAL_ORDER_TEMPLATES,
  type SpecialOrderTemplate as LegacySpecialOrderTemplate
} from '@/data/questDefinitions'
import { FARM_MAP_DEFS } from '@/data/farmMapDefinitions'
import {
  ANIMAL_BUILDINGS,
  BUILDING_UPGRADES,
  type AnimalBuildingUpgradeDef as LegacyAnimalBuildingUpgradeDef
} from '@/data/animalBuildingDefinitions'
import { ANIMAL_INCUBATIONS } from '@/data/animalIncubationDefinitions'
import {
  TOOL_UPGRADE_COSTS,
  type ToolUpgradeCost as LegacyToolUpgradeCost
} from '@/data/toolUpgradeDefinitions'
import { PROCESSING_MACHINES } from '@/data/processingMachineDefinitions'
import { PROCESSING_RECIPES } from '@/data/processingRecipeDefinitions'
import {
  EQUIPMENT_SET_DEFINITIONS,
  type EquipmentSetDef as LegacyEquipmentSetDef
} from '@/data/equipmentSetDefinitions'
import { PONDABLE_FISH } from '@/data/fishPondDefinitions'
import { POND_BREEDS } from '@/data/pondBreedDefinitions'
import {
  FISH_POND_FACILITY,
  type FishPondFacilityDef as LegacyFishPondFacilityDef
} from '@/data/fishPondFacilityDefinitions'
import { getTieredHybridDefinitions } from '@/data/breedingDefinitions'
import {
  CAVE_UPGRADES,
  CELLAR_UPGRADES,
  FARMHOUSE_UPGRADES,
  type CaveUpgradeDef as LegacyCaveUpgradeDef,
  type CellarUpgradeDef as LegacyCellarUpgradeDef,
  type FarmhouseUpgradeDef as LegacyFarmhouseUpgradeDef
} from '@/data/buildingUpgradeDefinitions'
import { BAITS, BOMBS, FERTILIZERS, SPRINKLERS, TACKLES } from '@/data/processingCraftDefinitions'
import type {
  AchievementDef as LegacyAchievementDef,
  AnimalDef as LegacyAnimalDef,
  BombDef as LegacyBombDef,
  CommunityBundleDef as LegacyCommunityBundleDef,
  HatDef as LegacyHatDef,
  HeartEventDef as LegacyHeartEventDef,
  MainQuestDef as LegacyMainQuestDef,
  NpcDef as LegacyNpcDef,
  RecipeDef as LegacyRecipeDef,
  ProcessingMachineDef as LegacyProcessingMachineDef,
  ProcessingRecipeDef as LegacyProcessingRecipeDef,
  SprinklerDef as LegacySprinklerDef,
  RingDef as LegacyRingDef,
  ShoeDef as LegacyShoeDef,
  TradeExchangeItemDef,
  HanhaiTreasureRewardDef as LegacyHanhaiTreasureRewardDef,
  TradeShopUpgradeDef as LegacyHanhaiTradeShopUpgradeDef,
  WeaponDef as LegacyWeaponDef
} from '@/types'
import type { HybridDef as LegacyHybridDef } from '@/types/breeding'
import type { PondBreedDef as LegacyPondBreedDef, PondableFishDef as LegacyPondableFishDef } from '@/types/fishPond'
import type { FruitTreeDef as LegacyFruitTreeDef, WildTreeDef as LegacyWildTreeDef } from '@/types'
import type { CropDef as LegacyCropDef } from '@/types/farm'
import type { FishDef as LegacyFishDef, MonsterDef as LegacyMonsterDef } from '@/types/skill'
import type {
  DiscoveryCondition as LegacyHiddenNpcDiscoveryCondition,
  HiddenNpcDef as LegacyHiddenNpcDef
} from '@/types/hiddenNpc'
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
  AnimalBuildingDef,
  AchievementDef,
  AnimalDef,
  AnimalFeedDef,
  AnimalIncubationDef,
  BombDef,
  BuildingUpgradeDef,
  CommunityBundleDef,
  DropTableDef,
  EnchantmentDef,
  EquipmentDef,
  EquipmentSetDef,
  FarmMapDef,
  FishDef,
  FishPondFacilityDef,
  ForageDef,
  ItemDef,
  MarketCategoryDef,
  MuseumCategoryDef,
  MuseumItemDef,
  MuseumMilestoneDef,
  MorningEventDef,
  MorningEventEffect,
  GuildDonationDef,
  GuildGoalDef,
  GuildLevelDef,
  HanhaiTradeExchangeDef,
  HanhaiTradeShopUpgradeDef,
  HanhaiTreasureRewardDef,
  HanhaiRouletteDef,
  HanhaiCasinoWagerDef,
  HeartEventDef,
  HiddenNpcDef,
  CropDef,
  MonsterDef,
  MonsterPoolDef,
  NpcDef,
  PondBreedDef,
  PondableFishDef,
  BreedingHybridDef,
  ProcessingMachineDef,
  ProcessingRecipeDef,
  QuestTemplateDef,
  RecipeDef,
  RecipeIngredient,
  NpcFriendshipLevel,
  SecretNoteDef,
  SeasonEventDef,
  ShopDef,
  ShopOfferDef,
  SprinklerDef,
  StoryQuestDef,
  TagDef,
  ToolUpgradeDef,
  TutorialDef,
  TreeDef,
  WalletItemDef
} from './schemas'
import type { QuestTemplateDef as LegacyQuestTemplateDef } from '@/types/quest'

const FRUIT_TREE_DEFS = FRUIT_TREE_DEFINITIONS

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
    registryId: toOfficialRegistryTypeId('tree'),
    description: '果树和野树定义',
    schemaName: 'tree.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('fish'),
    description: '鱼类定义',
    schemaName: 'fish.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('forage'),
    description: '竹林采集物定义',
    schemaName: 'forage.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('animal'),
    description: '动物物种定义',
    schemaName: 'animal.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('animal_feed'),
    description: '动物饲料定义',
    schemaName: 'animal-feed.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('wallet_item'),
    description: '钱袋永久被动物品定义',
    schemaName: 'wallet-item.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('museum_category'),
    description: '博物馆分类定义',
    schemaName: 'museum-category.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('museum_item'),
    description: '博物馆可捐赠物品定义',
    schemaName: 'museum-item.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('museum_milestone'),
    description: '博物馆里程碑奖励定义',
    schemaName: 'museum-milestone.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('guild_goal'),
    description: '行会怪物讨伐目标定义',
    schemaName: 'guild-goal.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('guild_donation'),
    description: '行会捐献物品定义',
    schemaName: 'guild-donation.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('guild_level'),
    description: '行会等级经验定义',
    schemaName: 'guild-level.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('npc'),
    description: '村民 NPC 定义',
    schemaName: 'npc.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('heart_event'),
    description: 'NPC 和隐藏仙灵好感事件定义',
    schemaName: 'heart-event.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('hidden_npc'),
    description: '隐藏仙灵 NPC 定义',
    schemaName: 'hidden-npc.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('story_quest'),
    description: 'Story quest definitions',
    schemaName: 'story-quest.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('secret_note'),
    description: '秘密纸条定义',
    schemaName: 'secret-note.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('tutorial'),
    description: '晨间教程提示定义',
    schemaName: 'tutorial.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('morning_event'),
    description: '晨间随机事件定义',
    schemaName: 'morning-event.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('season_event'),
    description: '季节节日事件定义',
    schemaName: 'season-event.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('quest_template'),
    description: '普通委托和特殊订单模板定义',
    schemaName: 'quest-template.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('farm_map'),
    description: '开局田庄地图定义',
    schemaName: 'farm-map.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('animal_building'),
    description: '动物建筑与升级定义',
    schemaName: 'animal-building.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('animal_incubation'),
    description: '动物孵化映射定义',
    schemaName: 'animal-incubation.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('breeding_hybrid'),
    description: '育种杂交品种定义',
    schemaName: 'breeding-hybrid.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('processing_machine'),
    description: '加工机器制造定义',
    schemaName: 'processing-machine.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('processing_recipe'),
    description: '加工配方定义',
    schemaName: 'processing-recipe.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('sprinkler'),
    description: '洒水器制造定义',
    schemaName: 'sprinkler.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('bomb'),
    description: '炸弹制造定义',
    schemaName: 'bomb.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('tool_upgrade'),
    description: '工具升级费用定义',
    schemaName: 'tool-upgrade.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('pondable_fish'),
    description: '鱼塘可养殖鱼种定义',
    schemaName: 'pondable-fish.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('pond_breed'),
    description: '鱼塘品种图鉴定义',
    schemaName: 'pond-breed.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('fish_pond_facility'),
    description: '鱼塘建造、升级和容量定义',
    schemaName: 'fish-pond-facility.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('building_upgrade'),
    description: '农舍、山洞和酒窖升级定义',
    schemaName: 'building-upgrade.schema.json'
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
    registryId: toOfficialRegistryTypeId('equipment'),
    description: '单件装备定义',
    schemaName: 'equipment.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('equipment_set'),
    description: '装备套装定义',
    schemaName: 'equipment-set.schema.json'
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
    registryId: toOfficialRegistryTypeId('achievement'),
    description: '成就定义',
    schemaName: 'achievement.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('community_bundle'),
    description: '祠堂任务定义',
    schemaName: 'community-bundle.schema.json'
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
  },
  {
    registryId: toOfficialRegistryTypeId('market_category'),
    description: '市场行情分类定义',
    schemaName: 'market-category.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('hanhai_trade_exchange'),
    description: '瀚海通商积分兑换定义',
    schemaName: 'hanhai-trade-exchange.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('hanhai_trade_shop_upgrade'),
    description: '瀚海通商店铺升级定义',
    schemaName: 'hanhai-trade-shop-upgrade.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('hanhai_treasure_reward'),
    description: '瀚海藏宝图奖励定义',
    schemaName: 'hanhai-treasure-reward.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('hanhai_roulette'),
    description: '瀚海幸运轮盘配置',
    schemaName: 'hanhai-roulette.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('hanhai_casino_wager'),
    description: '瀚海赌坊固定投注配置',
    schemaName: 'hanhai-casino-wager.schema.json'
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

export const adaptLegacyRingEquipment = (ring: LegacyRingDef): EquipmentDef => ({
  id: toOfficialContentId(ring.id),
  kind: 'ring',
  name: text(`taoyuan.equipment.ring.${ring.id}.name`, ring.name),
  description: text(`taoyuan.equipment.ring.${ring.id}.description`, ring.description),
  effects: ring.effects.map(effect => ({ ...effect })),
  recipe: ring.recipe
    ? ring.recipe.map(material => ({
        itemId: toOfficialContentId(material.itemId),
        quantity: material.quantity
      }))
    : null,
  recipeMoney: ring.recipeMoney,
  obtainSource: text(`taoyuan.equipment.ring.${ring.id}.obtainSource`, ring.obtainSource),
  sellPrice: ring.sellPrice
})

export const adaptLegacyHatEquipment = (hat: LegacyHatDef): EquipmentDef => ({
  id: toOfficialContentId(hat.id),
  kind: 'hat',
  name: text(`taoyuan.equipment.hat.${hat.id}.name`, hat.name),
  description: text(`taoyuan.equipment.hat.${hat.id}.description`, hat.description),
  effects: hat.effects.map(effect => ({ ...effect })),
  shopPrice: hat.shopPrice,
  recipe: hat.recipe
    ? hat.recipe.map(material => ({
        itemId: toOfficialContentId(material.itemId),
        quantity: material.quantity
      }))
    : null,
  recipeMoney: hat.recipeMoney,
  obtainSource: text(`taoyuan.equipment.hat.${hat.id}.obtainSource`, hat.obtainSource),
  sellPrice: hat.sellPrice
})

export const adaptLegacyShoeEquipment = (shoe: LegacyShoeDef): EquipmentDef => ({
  id: toOfficialContentId(shoe.id),
  kind: 'shoe',
  name: text(`taoyuan.equipment.shoe.${shoe.id}.name`, shoe.name),
  description: text(`taoyuan.equipment.shoe.${shoe.id}.description`, shoe.description),
  effects: shoe.effects.map(effect => ({ ...effect })),
  shopPrice: shoe.shopPrice,
  recipe: shoe.recipe
    ? shoe.recipe.map(material => ({
        itemId: toOfficialContentId(material.itemId),
        quantity: material.quantity
      }))
    : null,
  recipeMoney: shoe.recipeMoney,
  obtainSource: text(`taoyuan.equipment.shoe.${shoe.id}.obtainSource`, shoe.obtainSource),
  sellPrice: shoe.sellPrice
})

export const adaptLegacyWeaponEquipment = (weapon: LegacyWeaponDef): EquipmentDef => ({
  id: toOfficialContentId(weapon.id),
  kind: 'weapon',
  name: text(`taoyuan.equipment.weapon.${weapon.id}.name`, weapon.name),
  description: text(`taoyuan.equipment.weapon.${weapon.id}.description`, weapon.description),
  weaponType: weapon.type,
  attack: weapon.attack,
  critRate: weapon.critRate,
  shopPrice: weapon.shopPrice,
  shopMaterials: weapon.shopMaterials.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  })),
  fixedEnchantment: weapon.fixedEnchantment ? toOfficialContentId(weapon.fixedEnchantment) : null,
  sellPrice: getBaseWeaponSellPrice(weapon)
})

export const createOfficialEquipment = (): EquipmentDef[] =>
  [
    ...RINGS.map(adaptLegacyRingEquipment),
    ...HATS.map(adaptLegacyHatEquipment),
    ...SHOES.map(adaptLegacyShoeEquipment),
    ...Object.values(WEAPONS).map(adaptLegacyWeaponEquipment)
  ]

export const adaptLegacyEquipmentSet = (set: LegacyEquipmentSetDef): EquipmentSetDef => ({
  id: toOfficialContentId(set.id),
  name: text(`taoyuan.equipment_set.${set.id}.name`, set.name),
  description: text(`taoyuan.equipment_set.${set.id}.description`, set.description),
  pieces: {
    ...(set.pieces.weapon ? { weapon: toOfficialContentId(set.pieces.weapon) } : {}),
    ring: toOfficialContentId(set.pieces.ring),
    hat: toOfficialContentId(set.pieces.hat),
    shoe: toOfficialContentId(set.pieces.shoe)
  },
  bonuses: set.bonuses.map(bonus => ({
    count: bonus.count,
    effects: bonus.effects.map(effect => ({ ...effect })),
    description: text(`taoyuan.equipment_set.${set.id}.bonus.${bonus.count}`, bonus.description)
  }))
})

export const createOfficialEquipmentSets = (): EquipmentSetDef[] =>
  EQUIPMENT_SET_DEFINITIONS.map(adaptLegacyEquipmentSet)

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

export const adaptLegacyFruitTree = (tree: LegacyFruitTreeDef): TreeDef => ({
  id: toOfficialContentId(tree.type),
  kind: 'fruit',
  name: text(`taoyuan.tree.${tree.type}.name`, tree.name),
  seedItemId: toOfficialContentId(tree.saplingId),
  growthDays: tree.growthDays,
  saplingPrice: tree.saplingPrice,
  fruitItemId: toOfficialContentId(tree.fruitId),
  fruitName: text(`taoyuan.tree.${tree.type}.fruit.name`, tree.fruitName),
  fruitSeason: tree.fruitSeason,
  fruitSellPrice: tree.fruitSellPrice
})

export const adaptLegacyWildTree = (tree: LegacyWildTreeDef): TreeDef => ({
  id: toOfficialContentId(tree.type),
  kind: 'wild',
  name: text(`taoyuan.tree.${tree.type}.name`, tree.name),
  seedItemId: toOfficialContentId(tree.seedItemId),
  growthDays: tree.growthDays,
  tapProductItemId: toOfficialContentId(tree.tapProduct),
  tapProductName: text(`taoyuan.tree.${tree.type}.tap-product.name`, tree.tapProductName),
  tapCycleDays: tree.tapCycleDays
})

export const createOfficialTrees = (): TreeDef[] => [
  ...FRUIT_TREE_DEFINITIONS.map(adaptLegacyFruitTree),
  ...WILD_TREE_DEFINITIONS.map(adaptLegacyWildTree)
]

export const adaptLegacyFish = (fish: LegacyFishDef): FishDef => ({
  id: toOfficialContentId(fish.id),
  name: text(`taoyuan.fish.${fish.id}.name`, fish.name),
  season: [...fish.season],
  weather: [...fish.weather],
  difficulty: fish.difficulty,
  sellPrice: fish.sellPrice,
  description: text(`taoyuan.fish.${fish.id}.description`, fish.description),
  ...(fish.location !== undefined ? { location: fish.location } : {}),
  ...(fish.miniGameSpeed !== undefined ? { miniGameSpeed: fish.miniGameSpeed } : {}),
  ...(fish.miniGameDirChange !== undefined ? { miniGameDirChange: fish.miniGameDirChange } : {})
})

export const createOfficialFish = (): FishDef[] => FISH.map(adaptLegacyFish)

export const adaptLegacyForage = (forage: (typeof FORAGE_ITEMS)[number]): ForageDef => ({
  id: toOfficialContentId(forage.itemId),
  itemId: toOfficialContentId(forage.itemId),
  name: text(`taoyuan.forage.${forage.itemId}.name`, forage.name),
  season: [...forage.season],
  chance: forage.chance,
  expReward: forage.expReward
})

export const createOfficialForage = (): ForageDef[] => FORAGE_ITEMS.map(adaptLegacyForage)

export const adaptLegacyAnimal = (animal: LegacyAnimalDef): AnimalDef => ({
  id: toOfficialContentId(animal.type),
  name: text(`taoyuan.animal.${animal.type}.name`, animal.name),
  building: animal.building,
  cost: animal.cost,
  ...(animal.productId ? { productItemId: toOfficialContentId(animal.productId) } : {}),
  ...(animal.productName ? { productName: text(`taoyuan.animal.${animal.type}.product.name`, animal.productName) } : {}),
  produceDays: animal.produceDays,
  friendship: { ...animal.friendship }
})

export const createOfficialAnimals = (): AnimalDef[] => ANIMAL_DEFS.map(adaptLegacyAnimal)

export const adaptLegacyAnimalFeed = (feed: (typeof FEED_DEFS)[number]): AnimalFeedDef => ({
  id: toOfficialContentId(feed.id),
  name: text(`taoyuan.animal_feed.${feed.id}.name`, feed.name),
  description: text(`taoyuan.animal_feed.${feed.id}.description`, feed.description),
  price: feed.price
})

export const createOfficialAnimalFeeds = (): AnimalFeedDef[] => FEED_DEFS.map(adaptLegacyAnimalFeed)

export const adaptLegacyWalletItem = (item: (typeof WALLET_ITEMS)[number]): WalletItemDef => ({
  id: toOfficialContentId(item.id),
  name: text(`taoyuan.wallet_item.${item.id}.name`, item.name),
  description: text(`taoyuan.wallet_item.${item.id}.description`, item.description),
  effect: { ...item.effect } as WalletItemDef['effect'],
  unlockCondition: text(`taoyuan.wallet_item.${item.id}.unlockCondition`, item.unlockCondition)
})

export const createOfficialWalletItems = (): WalletItemDef[] => WALLET_ITEMS.map(adaptLegacyWalletItem)

export const adaptLegacyMuseumCategory = (category: (typeof MUSEUM_CATEGORIES)[number]): MuseumCategoryDef => ({
  id: toOfficialContentId(`museum_category/${category.key}`),
  key: category.key,
  label: text(`taoyuan.museum_category.${category.key}.label`, category.label)
})

export const createOfficialMuseumCategories = (): MuseumCategoryDef[] =>
  MUSEUM_CATEGORIES.map(adaptLegacyMuseumCategory)

export const adaptLegacyMuseumItem = (item: (typeof MUSEUM_ITEMS)[number]): MuseumItemDef => ({
  id: toOfficialContentId(item.id),
  itemId: toOfficialContentId(item.id),
  name: text(`taoyuan.museum_item.${item.id}.name`, item.name),
  category: item.category,
  sourceHint: text(`taoyuan.museum_item.${item.id}.sourceHint`, item.sourceHint)
})

export const createOfficialMuseumItems = (): MuseumItemDef[] => MUSEUM_ITEMS.map(adaptLegacyMuseumItem)

export const adaptLegacyMuseumMilestone = (milestone: (typeof MUSEUM_MILESTONES)[number]): MuseumMilestoneDef => ({
  id: toOfficialContentId(`museum_milestone/${milestone.count}`),
  count: milestone.count,
  name: text(`taoyuan.museum_milestone.${milestone.count}.name`, milestone.name),
  reward: {
    ...(milestone.reward.money !== undefined ? { money: milestone.reward.money } : {}),
    ...(milestone.reward.items
      ? {
          items: milestone.reward.items.map(item => ({
            itemId: toOfficialContentId(item.itemId),
            quantity: item.quantity
          }))
        }
      : {})
  }
})

export const createOfficialMuseumMilestones = (): MuseumMilestoneDef[] =>
  MUSEUM_MILESTONES.map(adaptLegacyMuseumMilestone)

export const adaptLegacyGuildGoal = (goal: (typeof MONSTER_GOALS)[number]): GuildGoalDef => ({
  id: toOfficialContentId(`guild_goal/${goal.monsterId}`),
  monsterId: toOfficialContentId(goal.monsterId),
  monsterName: text(`taoyuan.guild_goal.${goal.monsterId}.monsterName`, goal.monsterName),
  zone: goal.zone as GuildGoalDef['zone'],
  killTarget: goal.killTarget,
  reward: {
    ...(goal.reward.money !== undefined ? { money: goal.reward.money } : {}),
    ...(goal.reward.items
      ? {
          items: goal.reward.items.map(item => ({
            itemId: toOfficialContentId(item.itemId),
            quantity: item.quantity
          }))
        }
      : {})
  },
  description: text(`taoyuan.guild_goal.${goal.monsterId}.description`, goal.description)
})

export const createOfficialGuildGoals = (): GuildGoalDef[] => MONSTER_GOALS.map(adaptLegacyGuildGoal)

export const adaptLegacyGuildDonation = (donation: (typeof GUILD_DONATIONS)[number]): GuildDonationDef => ({
  id: toOfficialContentId(`guild_donation/${donation.itemId}`),
  itemId: toOfficialContentId(donation.itemId),
  points: donation.points
})

export const createOfficialGuildDonations = (): GuildDonationDef[] =>
  GUILD_DONATIONS.map(adaptLegacyGuildDonation)

export const adaptLegacyGuildLevel = (level: (typeof GUILD_LEVELS)[number]): GuildLevelDef => ({
  id: toOfficialContentId(`guild_level/${level.level}`),
  level: level.level,
  expRequired: level.expRequired
})

export const createOfficialGuildLevels = (): GuildLevelDef[] => GUILD_LEVELS.map(adaptLegacyGuildLevel)

const adaptNpcDialogues = (
  npcId: string,
  dialogues: LegacyNpcDef['dialogues']
): NpcDef['dialogues'] => ({
  stranger: dialogues.stranger.map((line, index) => text(`taoyuan.npc.${npcId}.dialogues.stranger.${index}`, line)),
  acquaintance: dialogues.acquaintance.map((line, index) => text(`taoyuan.npc.${npcId}.dialogues.acquaintance.${index}`, line)),
  friendly: dialogues.friendly.map((line, index) => text(`taoyuan.npc.${npcId}.dialogues.friendly.${index}`, line)),
  bestFriend: dialogues.bestFriend.map((line, index) => text(`taoyuan.npc.${npcId}.dialogues.bestFriend.${index}`, line))
})

const adaptNpcDialogueList = (
  npcId: string,
  key: 'datingDialogues' | 'zhijiDialogues',
  dialogues: readonly string[] | undefined
) => dialogues?.map((line, index) => text(`taoyuan.npc.${npcId}.${key}.${index}`, line))

const adaptNpcGiftItems = (items: readonly string[]) => items.map(itemId => toOfficialContentId(itemId))
const adaptLegacyHeartEventIds = (eventIds: readonly string[]) =>
  eventIds.map(eventId => toOfficialContentId(`heart_event/${eventId}`))

export const adaptLegacyNpc = (npc: LegacyNpcDef): NpcDef => ({
  id: toOfficialContentId(`npc/${npc.id}`),
  name: text(`taoyuan.npc.${npc.id}.name`, npc.name),
  gender: npc.gender,
  role: text(`taoyuan.npc.${npc.id}.role`, npc.role),
  personality: text(`taoyuan.npc.${npc.id}.personality`, npc.personality),
  lovedItems: adaptNpcGiftItems(npc.lovedItems),
  likedItems: adaptNpcGiftItems(npc.likedItems),
  hatedItems: adaptNpcGiftItems(npc.hatedItems),
  dialogues: adaptNpcDialogues(npc.id, npc.dialogues),
  ...(npc.marriageable !== undefined ? { marriageable: npc.marriageable } : {}),
  ...(npc.heartEventIds ? { heartEventIds: adaptLegacyHeartEventIds(npc.heartEventIds) } : {}),
  ...(npc.datingDialogues ? { datingDialogues: adaptNpcDialogueList(npc.id, 'datingDialogues', npc.datingDialogues) } : {}),
  ...(npc.zhijiDialogues ? { zhijiDialogues: adaptNpcDialogueList(npc.id, 'zhijiDialogues', npc.zhijiDialogues) } : {}),
  ...(npc.zhijiHeartEventIds ? { zhijiHeartEventIds: adaptLegacyHeartEventIds(npc.zhijiHeartEventIds) } : {}),
  ...(npc.birthday ? { birthday: { ...npc.birthday } } : {})
})

export const createOfficialNpcs = (): NpcDef[] => NPCS.map(adaptLegacyNpc)

const heartEventText = (eventId: string, key: string, fallback: string) =>
  text(`taoyuan.heart_event.${eventId}.${key}`, fallback)

const adaptLegacyHeartEventScene = (
  eventId: string,
  scene: LegacyHeartEventDef['scenes'][number],
  index: number
): HeartEventDef['scenes'][number] => ({
  text: heartEventText(eventId, `scenes.${index}.text`, scene.text),
  ...(scene.choices
    ? {
        choices: scene.choices.map((choice, choiceIndex) => ({
          text: heartEventText(eventId, `scenes.${index}.choices.${choiceIndex}.text`, choice.text),
          friendshipChange: choice.friendshipChange,
          response: heartEventText(eventId, `scenes.${index}.choices.${choiceIndex}.response`, choice.response)
        }))
      }
    : {})
})

export const adaptLegacyHeartEvent = (
  event: LegacyHeartEventDef,
  ownerType: 'npc' | 'hidden_npc'
): HeartEventDef => ({
  id: toOfficialContentId(`heart_event/${event.id}`),
  npcId: toOfficialContentId(`${ownerType}/${event.npcId}`),
  requiredFriendship: event.requiredFriendship,
  ...(event.requiresZhiji !== undefined ? { requiresZhiji: event.requiresZhiji } : {}),
  title: heartEventText(event.id, 'title', event.title),
  scenes: event.scenes.map((scene, index) => adaptLegacyHeartEventScene(event.id, scene, index))
})

export const createOfficialHeartEvents = (): HeartEventDef[] =>
  HEART_EVENTS.map(event => adaptLegacyHeartEvent(event, 'npc'))

export const createOfficialHiddenNpcHeartEvents = (): HeartEventDef[] =>
  HIDDEN_NPC_HEART_EVENTS.map(event => adaptLegacyHeartEvent(event, 'hidden_npc'))

const hiddenNpcText = (npcId: string, key: string, fallback: string) =>
  text(`taoyuan.hidden_npc.${npcId}.${key}`, fallback)

const adaptLegacyHiddenNpcScenes = (
  npcId: string,
  scope: string,
  scenes: LegacyHiddenNpcDef['discoverySteps'][number]['scenes']
): HiddenNpcDef['discoverySteps'][number]['scenes'] =>
  scenes.map((scene, index) => ({
    text: hiddenNpcText(npcId, `${scope}.scenes.${index}.text`, scene.text),
    ...(scene.choices
      ? {
          choices: scene.choices.map((choice, choiceIndex) => ({
            text: hiddenNpcText(npcId, `${scope}.scenes.${index}.choices.${choiceIndex}.text`, choice.text),
            friendshipChange: choice.friendshipChange,
            response: hiddenNpcText(npcId, `${scope}.scenes.${index}.choices.${choiceIndex}.response`, choice.response)
          }))
        }
      : {})
  }))

const adaptLegacyHiddenNpcDiscoveryCondition = (
  condition: LegacyHiddenNpcDiscoveryCondition
): HiddenNpcDef['discoverySteps'][number]['conditions'][number] => {
  switch (condition.type) {
    case 'season':
      return { type: 'season', season: condition.season }
    case 'weather':
      return { type: 'weather', weather: condition.weather }
    case 'timeRange':
      return { type: 'timeRange', minHour: condition.minHour, maxHour: condition.maxHour }
    case 'location':
      return { type: 'location', panel: condition.panel }
    case 'item':
      return {
        type: 'item',
        itemId: toOfficialContentId(condition.itemId),
        ...(condition.quantity !== undefined ? { quantity: condition.quantity } : {})
      }
    case 'skill':
      return {
        type: 'skill',
        skillType: condition.skillType as Extract<
          HiddenNpcDef['discoverySteps'][number]['conditions'][number],
          { type: 'skill' }
        >['skillType'],
        minLevel: condition.minLevel
      }
    case 'npcFriendship':
      return {
        type: 'npcFriendship',
        npcId: toOfficialContentId(`npc/${condition.npcId}`),
        minFriendship: condition.minFriendship
      }
    case 'questComplete':
      return { type: 'questComplete', questId: toOfficialContentId(`story_quest/${condition.questId}`) }
    case 'mineFloor':
      return { type: 'mineFloor', minFloor: condition.minFloor }
    case 'fishCaught':
      return { type: 'fishCaught', fishId: toOfficialContentId(condition.fishId) }
    case 'money':
      return { type: 'money', minAmount: condition.minAmount }
    case 'yearMin':
      return { type: 'yearMin', year: condition.year }
    case 'day':
      return { type: 'day', day: condition.day }
  }
}

const adaptLegacyHiddenNpcDialogues = (
  npcId: string,
  dialogues: LegacyHiddenNpcDef['dialogues']
): HiddenNpcDef['dialogues'] => ({
  wary: dialogues.wary.map((line, index) => hiddenNpcText(npcId, `dialogues.wary.${index}`, line)),
  curious: dialogues.curious.map((line, index) => hiddenNpcText(npcId, `dialogues.curious.${index}`, line)),
  trusting: dialogues.trusting.map((line, index) => hiddenNpcText(npcId, `dialogues.trusting.${index}`, line)),
  devoted: dialogues.devoted.map((line, index) => hiddenNpcText(npcId, `dialogues.devoted.${index}`, line)),
  eternal: dialogues.eternal.map((line, index) => hiddenNpcText(npcId, `dialogues.eternal.${index}`, line))
})

const adaptLegacyHiddenNpcItemIds = (itemIds: readonly string[]) => itemIds.map(itemId => toOfficialContentId(itemId))

const adaptLegacyHiddenNpcCraftCost = (
  costs: LegacyHiddenNpcDef['courtshipCraftCost'] | LegacyHiddenNpcDef['bondCraftCost']
): HiddenNpcDef['courtshipCraftCost'] =>
  costs.map(cost => ({
    itemId: toOfficialContentId(cost.itemId),
    quantity: cost.quantity
  }))

export const adaptLegacyHiddenNpc = (npc: LegacyHiddenNpcDef): HiddenNpcDef => ({
  id: toOfficialContentId(`hidden_npc/${npc.id}`),
  name: hiddenNpcText(npc.id, 'name', npc.name),
  trueName: hiddenNpcText(npc.id, 'trueName', npc.trueName),
  gender: npc.gender,
  title: hiddenNpcText(npc.id, 'title', npc.title),
  origin: hiddenNpcText(npc.id, 'origin', npc.origin),
  personality: hiddenNpcText(npc.id, 'personality', npc.personality),
  discoverySteps: npc.discoverySteps.map(step => ({
    id: step.id,
    phase: step.phase,
    conditions: step.conditions.map(adaptLegacyHiddenNpcDiscoveryCondition),
    scenes: adaptLegacyHiddenNpcScenes(npc.id, `discoverySteps.${step.id}`, step.scenes),
    ...(step.logMessage ? { logMessage: hiddenNpcText(npc.id, `discoverySteps.${step.id}.logMessage`, step.logMessage) } : {})
  })),
  resonantOfferings: adaptLegacyHiddenNpcItemIds(npc.resonantOfferings),
  pleasedOfferings: adaptLegacyHiddenNpcItemIds(npc.pleasedOfferings),
  repelledOfferings: adaptLegacyHiddenNpcItemIds(npc.repelledOfferings),
  dialogues: adaptLegacyHiddenNpcDialogues(npc.id, npc.dialogues),
  interactionType: npc.interactionType,
  bondable: npc.bondable,
  courtshipItemId: toOfficialContentId(npc.courtshipItemId),
  bondItemId: toOfficialContentId(npc.bondItemId),
  courtshipThreshold: npc.courtshipThreshold,
  bondThreshold: npc.bondThreshold,
  heartEventIds: adaptLegacyHeartEventIds(npc.heartEventIds),
  courtshipDialogues: npc.courtshipDialogues.map((line, index) =>
    hiddenNpcText(npc.id, `courtshipDialogues.${index}`, line)
  ),
  bondBonuses: npc.bondBonuses.map(bonus => ({ ...bonus })),
  abilities: npc.abilities.map((ability, index) => ({
    id: ability.id,
    affinityRequired: ability.affinityRequired,
    name: hiddenNpcText(npc.id, `abilities.${index}.name`, ability.name),
    description: hiddenNpcText(npc.id, `abilities.${index}.description`, ability.description),
    ...(ability.passive ? { passive: { ...ability.passive } } : {})
  })),
  courtshipCraftCost: adaptLegacyHiddenNpcCraftCost(npc.courtshipCraftCost),
  bondCraftCost: adaptLegacyHiddenNpcCraftCost(npc.bondCraftCost),
  manifestationDay: { ...npc.manifestationDay }
})

export const createOfficialHiddenNpcs = (): HiddenNpcDef[] => HIDDEN_NPCS.map(adaptLegacyHiddenNpc)

const questObjectiveLabel = (
  questId: string,
  index: number,
  label: string
) => text(`taoyuan.story_quest.${questId}.objectives.${index}.label`, label)

const adaptLegacyStoryQuestObjective = (
  questId: string,
  objective: LegacyMainQuestDef['objectives'][number],
  index: number
): StoryQuestDef['objectives'][number] => {
  const label = questObjectiveLabel(questId, index, objective.label)
  switch (objective.type) {
    case 'skillLevel':
      return {
        type: 'skillLevel',
        label,
        ...(objective.skillType
          ? {
              skillType: objective.skillType as Extract<
                StoryQuestDef['objectives'][number],
                { type: 'skillLevel' }
              >['skillType']
            }
          : {}),
        target: objective.target ?? 0
      }
    case 'npcFriendship':
      return {
        type: 'npcFriendship',
        label,
        npcId: objective.npcId === '_any' ? '_any' : toOfficialContentId(`npc/${objective.npcId ?? ''}`),
        friendshipLevel: (objective.friendshipLevel ?? 'acquaintance') as NpcFriendshipLevel
      }
    case 'npcAllFriendly':
      return {
        type: 'npcAllFriendly',
        label,
        friendshipLevel: (objective.friendshipLevel ?? 'friendly') as NpcFriendshipLevel
      }
    case 'deliverItem':
      return {
        type: 'deliverItem',
        label,
        itemId: toOfficialContentId(objective.itemId ?? ''),
        itemQuantity: objective.itemQuantity ?? 1
      }
    case 'married':
      return { type: 'married', label }
    case 'hasChild':
      return { type: 'hasChild', label }
    default:
      return {
        type: objective.type,
        label,
        target: objective.target ?? 0
      } as StoryQuestDef['objectives'][number]
  }
}

export const adaptLegacyStoryQuest = (quest: LegacyMainQuestDef): StoryQuestDef => ({
  id: toOfficialContentId(`story_quest/${quest.id}`),
  chapter: quest.chapter,
  order: quest.order,
  title: text(`taoyuan.story_quest.${quest.id}.title`, quest.title),
  description: text(`taoyuan.story_quest.${quest.id}.description`, quest.description),
  npcId: toOfficialContentId(`npc/${quest.npcId}`),
  objectives: quest.objectives.map((objective, index) => adaptLegacyStoryQuestObjective(quest.id, objective, index)),
  moneyReward: quest.moneyReward,
  ...(quest.friendshipReward
    ? {
        friendshipReward: quest.friendshipReward.map(reward => ({
          npcId: toOfficialContentId(`npc/${reward.npcId}`),
          amount: reward.amount
        }))
      }
    : {}),
  ...(quest.itemReward
    ? {
        itemReward: quest.itemReward.map(reward => ({
          itemId: toOfficialContentId(reward.itemId),
          quantity: reward.quantity
        }))
      }
    : {})
})

export const createOfficialStoryQuests = (): StoryQuestDef[] =>
  STORY_QUESTS.map(adaptLegacyStoryQuest)

const adaptAchievementRewardItems = (
  items: NonNullable<LegacyAchievementDef['reward']['items']> | NonNullable<LegacyCommunityBundleDef['reward']['items']>
) =>
  items.map(item => ({
    itemId: toOfficialContentId(item.itemId),
    quantity: item.quantity
  }))

export const adaptLegacyAchievement = (achievement: LegacyAchievementDef): AchievementDef => ({
  id: toOfficialContentId(`achievement/${achievement.id}`),
  name: text(`taoyuan.achievement.${achievement.id}.name`, achievement.name),
  description: text(`taoyuan.achievement.${achievement.id}.description`, achievement.description),
  condition: achievement.condition.type === 'itemDiscovered'
    ? {
        type: 'itemDiscovered',
        itemId: toOfficialContentId(achievement.condition.itemId)
      }
    : { ...achievement.condition },
  reward: {
    ...(achievement.reward.money !== undefined ? { money: achievement.reward.money } : {}),
    ...(achievement.reward.items ? { items: adaptAchievementRewardItems(achievement.reward.items) } : {})
  }
})

export const createOfficialAchievements = (): AchievementDef[] =>
  ACHIEVEMENTS.map(adaptLegacyAchievement)

export const adaptLegacyCommunityBundle = (bundle: LegacyCommunityBundleDef): CommunityBundleDef => ({
  id: toOfficialContentId(`community_bundle/${bundle.id}`),
  name: text(`taoyuan.community_bundle.${bundle.id}.name`, bundle.name),
  description: text(`taoyuan.community_bundle.${bundle.id}.description`, bundle.description),
  requiredItems: bundle.requiredItems.map(item => ({
    itemId: toOfficialContentId(item.itemId),
    quantity: item.quantity
  })),
  reward: {
    ...(bundle.reward.money !== undefined ? { money: bundle.reward.money } : {}),
    ...(bundle.reward.items ? { items: adaptAchievementRewardItems(bundle.reward.items) } : {}),
    description: text(`taoyuan.community_bundle.${bundle.id}.reward.description`, bundle.reward.description)
  }
})

export const createOfficialCommunityBundles = (): CommunityBundleDef[] =>
  COMMUNITY_BUNDLES.map(adaptLegacyCommunityBundle)

export const adaptLegacySecretNote = (note: (typeof SECRET_NOTES)[number]): SecretNoteDef => ({
  id: toOfficialContentId(`secret_note/${note.id}`),
  noteId: note.id,
  type: note.type,
  title: text(`taoyuan.secret_note.${note.id}.title`, note.title),
  content: text(`taoyuan.secret_note.${note.id}.content`, note.content),
  usable: note.usable,
  ...(note.reward
    ? {
        reward: {
          ...(note.reward.money !== undefined ? { money: note.reward.money } : {}),
          ...(note.reward.items
            ? {
                items: note.reward.items.map(item => ({
                  itemId: toOfficialContentId(item.itemId),
                  quantity: item.quantity
                }))
              }
            : {})
        }
      }
    : {})
})

export const createOfficialSecretNotes = (): SecretNoteDef[] => SECRET_NOTES.map(adaptLegacySecretNote)

export const adaptLegacyMorningTip = (tip: (typeof MORNING_TIPS)[number]): TutorialDef => ({
  id: toOfficialContentId(`tutorial/${tip.id}`),
  tipId: tip.id,
  priority: tip.priority,
  conditionKey: tip.conditionKey as TutorialDef['conditionKey'],
  message: text(`taoyuan.tutorial.${tip.id}.message`, tip.message)
})

export const createOfficialTutorials = (): TutorialDef[] => MORNING_TIPS.map(adaptLegacyMorningTip)

const adaptLegacyMorningEffect = (effect: LegacyMorningEffect): MorningEventEffect => {
  if (effect.type === 'gainItem') {
    return {
      type: effect.type,
      itemId: toOfficialContentId(effect.itemId),
      qty: effect.qty
    }
  }
  return effect
}

export const adaptLegacyMorningNarration = (
  narration: LegacyMorningNarration,
  index: number
): MorningEventDef => ({
  id: toOfficialContentId(`morning_event/narration/${index}`),
  eventId: `narration/${index}`,
  kind: 'narration',
  message: text(`taoyuan.morning_event.narration.${index}.message`, narration.message),
  ...(narration.effect ? { effect: adaptLegacyMorningEffect(narration.effect) } : {})
})

export const adaptLegacyMorningChoiceEvent = (event: LegacyMorningChoiceEvent): MorningEventDef => ({
  id: toOfficialContentId(`morning_event/choice/${event.id}`),
  eventId: `choice/${event.id}`,
  kind: 'choice',
  message: text(`taoyuan.morning_event.choice.${event.id}.message`, event.message),
  choices: event.choices.map((choice, index) => ({
    label: text(`taoyuan.morning_event.choice.${event.id}.choices.${index}.label`, choice.label),
    result: text(`taoyuan.morning_event.choice.${event.id}.choices.${index}.result`, choice.result),
    ...(choice.effect ? { effect: adaptLegacyMorningEffect(choice.effect) } : {})
  }))
})

export const adaptLegacyMorningEasterEgg = (
  egg: LegacyMorningEasterEgg,
  index: number
): MorningEventDef => ({
  id: toOfficialContentId(`morning_event/easter_egg/${index}`),
  eventId: `easter_egg/${index}`,
  kind: 'easter_egg',
  message: text(`taoyuan.morning_event.easter_egg.${index}.message`, egg.message),
  ...(egg.effect ? { effect: adaptLegacyMorningEffect(egg.effect) } : {})
})

export const createOfficialMorningEvents = (): MorningEventDef[] => [
  ...MORNING_NARRATIONS.map(adaptLegacyMorningNarration),
  ...MORNING_CHOICE_EVENTS.map(adaptLegacyMorningChoiceEvent),
  ...MORNING_EASTER_EGGS.map(adaptLegacyMorningEasterEgg)
]

export const adaptLegacySeasonEvent = (event: LegacySeasonEventDef): SeasonEventDef => ({
  id: toOfficialContentId(`season_event/${event.id}`),
  eventId: event.id,
  name: text(`taoyuan.season_event.${event.id}.name`, event.name),
  season: event.season,
  day: event.day,
  description: text(`taoyuan.season_event.${event.id}.description`, event.description),
  effects: {
    ...(event.effects.friendshipBonus !== undefined ? { friendshipBonus: event.effects.friendshipBonus } : {}),
    ...(event.effects.moneyReward !== undefined ? { moneyReward: event.effects.moneyReward } : {}),
    ...(event.effects.staminaBonus !== undefined ? { staminaBonus: event.effects.staminaBonus } : {}),
    ...(event.effects.itemReward
      ? {
          itemReward: event.effects.itemReward.map(item => ({
            itemId: toOfficialContentId(item.itemId),
            quantity: item.quantity
          }))
        }
      : {})
  },
  narrative: event.narrative.map((line, index) =>
    text(`taoyuan.season_event.${event.id}.narrative.${index}`, line)
  ),
  ...(event.interactive !== undefined ? { interactive: event.interactive } : {}),
  ...(event.festivalType !== undefined ? { festivalType: event.festivalType } : {})
})

export const createOfficialSeasonEvents = (): SeasonEventDef[] => SEASON_EVENTS.map(adaptLegacySeasonEvent)

export const adaptLegacyQuestTemplate = (template: LegacyQuestTemplateDef): QuestTemplateDef => ({
  id: toOfficialContentId(`quest_template/board/${template.type}`),
  templateId: template.type,
  kind: 'board',
  type: template.type as Extract<QuestTemplateDef, { kind: 'board' }>['type'],
  targets: template.targets.map((target, index) => ({
    itemId: toOfficialContentId(target.itemId),
    name: text(`taoyuan.quest_template.${template.type}.targets.${index}.name`, target.name),
    minQty: target.minQty,
    maxQty: target.maxQty,
    seasons: [...target.seasons],
    unitPrice: target.unitPrice
  })),
  npcPool: template.npcPool.map(npcId => toOfficialContentId(`npc/${npcId}`)),
  rewardMultiplier: template.rewardMultiplier,
  friendshipReward: template.friendshipReward
})

const getSpecialOrderTemplateContentKey = (template: LegacySpecialOrderTemplate): string =>
  `quest_template/special_order/tier_${template.tier}/${template.targetItemId}_${template.npcId}`

export const adaptLegacySpecialOrderTemplate = (template: LegacySpecialOrderTemplate): QuestTemplateDef => {
  const key = getSpecialOrderTemplateContentKey(template)
  return {
    id: toOfficialContentId(key),
    templateId: key.slice('quest_template/'.length),
    kind: 'special_order',
    name: text(`taoyuan.${key}.name`, template.name),
    targetItemId: toOfficialContentId(template.targetItemId),
    targetItemName: text(`taoyuan.${key}.targetItemName`, template.targetItemName),
    quantity: template.quantity,
    days: template.days,
    moneyReward: template.moneyReward,
    itemReward: template.itemReward.map(item => ({
      itemId: toOfficialContentId(item.itemId),
      quantity: item.quantity
    })),
    seasons: [...template.seasons],
    npcId: toOfficialContentId(`npc/${template.npcId}`),
    tier: template.tier
  }
}

export const createOfficialQuestTemplates = (): QuestTemplateDef[] => [
  ...QUEST_TEMPLATES.map(adaptLegacyQuestTemplate),
  ...SPECIAL_ORDER_TEMPLATES.map(adaptLegacySpecialOrderTemplate)
]

export const adaptLegacyFarmMap = (map: (typeof FARM_MAP_DEFS)[number]): FarmMapDef => ({
  id: toOfficialContentId(map.type),
  type: map.type,
  name: text(`taoyuan.farm_map.${map.type}.name`, map.name),
  description: text(`taoyuan.farm_map.${map.type}.description`, map.description),
  bonus: text(`taoyuan.farm_map.${map.type}.bonus`, map.bonus)
})

export const createOfficialFarmMaps = (): FarmMapDef[] => FARM_MAP_DEFS.map(adaptLegacyFarmMap)

const getAnimalBuildingUpgrades = (type: LegacyAnimalBuildingUpgradeDef['type']): LegacyAnimalBuildingUpgradeDef[] =>
  BUILDING_UPGRADES.filter(upgrade => upgrade.type === type)

export const adaptLegacyAnimalBuilding = (building: (typeof ANIMAL_BUILDINGS)[number]): AnimalBuildingDef => ({
  id: toOfficialContentId(`animal_building/${building.type}`),
  building: building.type,
  name: text(`taoyuan.animal_building.${building.type}.name`, building.name),
  description: text(`taoyuan.animal_building.${building.type}.description`, building.description),
  capacity: building.capacity,
  cost: building.cost,
  materialCost: building.materialCost.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  })),
  upgrades: getAnimalBuildingUpgrades(building.type).map(upgrade => ({
    level: upgrade.level,
    name: text(`taoyuan.animal_building.${building.type}.upgrade.${upgrade.level}.name`, upgrade.name),
    capacity: upgrade.capacity,
    cost: upgrade.cost,
    materialCost: upgrade.materialCost.map(material => ({
      itemId: toOfficialContentId(material.itemId),
      quantity: material.quantity
    }))
  }))
})

export const createOfficialAnimalBuildings = (): AnimalBuildingDef[] =>
  ANIMAL_BUILDINGS.map(adaptLegacyAnimalBuilding)

export const adaptLegacyAnimalIncubation = (incubation: (typeof ANIMAL_INCUBATIONS)[number]): AnimalIncubationDef => ({
  id: toOfficialContentId(`animal_incubation/${incubation.itemId}`),
  itemId: toOfficialContentId(incubation.itemId),
  animalId: toOfficialContentId(incubation.animalType),
  building: incubation.building,
  days: incubation.days
})

export const createOfficialAnimalIncubations = (): AnimalIncubationDef[] =>
  ANIMAL_INCUBATIONS.map(adaptLegacyAnimalIncubation)

export const adaptLegacyBreedingHybrid = (hybrid: LegacyHybridDef, tier: number): BreedingHybridDef => ({
  id: toOfficialContentId(`breeding_hybrid/${hybrid.id}`),
  name: text(`taoyuan.breeding_hybrid.${hybrid.id}.name`, hybrid.name),
  parentCropA: toOfficialContentId(hybrid.parentCropA),
  parentCropB: toOfficialContentId(hybrid.parentCropB),
  minSweetness: hybrid.minSweetness,
  minYield: hybrid.minYield,
  tier,
  resultCropId: toOfficialContentId(hybrid.resultCropId),
  baseGenetics: { ...hybrid.baseGenetics },
  discoveryText: text(`taoyuan.breeding_hybrid.${hybrid.id}.discovery`, hybrid.discoveryText)
})

export const createOfficialBreedingHybrids = (): BreedingHybridDef[] =>
  getTieredHybridDefinitions().map(({ definition, tier }) => adaptLegacyBreedingHybrid(definition, tier))

export const adaptLegacyProcessingMachine = (machine: LegacyProcessingMachineDef): ProcessingMachineDef => ({
  id: toOfficialContentId(machine.id),
  name: text(`taoyuan.processing_machine.${machine.id}.name`, machine.name),
  description: text(`taoyuan.processing_machine.${machine.id}.description`, machine.description),
  craftCost: machine.craftCost.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  })),
  craftMoney: machine.craftMoney,
  ...(machine.autoCollect === undefined ? {} : { autoCollect: machine.autoCollect })
})

export const createOfficialProcessingMachines = (): ProcessingMachineDef[] =>
  PROCESSING_MACHINES.map(adaptLegacyProcessingMachine)

const adaptLegacyProcessingRecipeBase = (recipe: LegacyProcessingRecipeDef) => ({
  id: toOfficialContentId(recipe.id),
  machineId: toOfficialContentId(recipe.machineType),
  name: text(`taoyuan.processing_recipe.${recipe.id}.name`, recipe.name),
  outputItemId: toOfficialContentId(recipe.outputItemId),
  outputQuantity: recipe.outputQuantity,
  processingDays: recipe.processingDays,
  description: text(`taoyuan.processing_recipe.${recipe.id}.description`, recipe.description)
})

export const adaptLegacyProcessingRecipe = (recipe: LegacyProcessingRecipeDef): ProcessingRecipeDef => {
  const base = adaptLegacyProcessingRecipeBase(recipe)
  if (recipe.inputItemId === null) {
    return {
      ...base,
      inputItemId: null,
      inputQuantity: 0
    }
  }
  return {
    ...base,
    inputItemId: toOfficialContentId(recipe.inputItemId),
    inputQuantity: recipe.inputQuantity
  }
}

export const createOfficialProcessingRecipes = (): ProcessingRecipeDef[] =>
  PROCESSING_RECIPES.map(adaptLegacyProcessingRecipe)

export const adaptLegacySprinkler = (sprinkler: LegacySprinklerDef): SprinklerDef => ({
  id: toOfficialContentId(sprinkler.id),
  name: text(`taoyuan.sprinkler.${sprinkler.id}.name`, sprinkler.name),
  description: text(`taoyuan.sprinkler.${sprinkler.id}.description`, sprinkler.description),
  range: sprinkler.range,
  craftCost: sprinkler.craftCost.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  })),
  craftMoney: sprinkler.craftMoney
})

export const createOfficialSprinklers = (): SprinklerDef[] =>
  SPRINKLERS.map(adaptLegacySprinkler)

export const adaptLegacyBomb = (bomb: LegacyBombDef): BombDef => ({
  id: toOfficialContentId(bomb.id),
  name: text(`taoyuan.bomb.${bomb.id}.name`, bomb.name),
  description: text(`taoyuan.bomb.${bomb.id}.description`, bomb.description),
  oreMultiplier: bomb.oreMultiplier,
  clearsMonster: bomb.clearsMonster,
  craftCost: bomb.craftCost.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  })),
  craftMoney: bomb.craftMoney,
  shopPrice: bomb.shopPrice
})

export const createOfficialBombs = (): BombDef[] =>
  BOMBS.map(adaptLegacyBomb)

const toolUpgradeIdSegment = (toolType: keyof typeof TOOL_UPGRADE_COSTS): string =>
  toolType.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

export const adaptLegacyToolUpgrade = (
  toolType: keyof typeof TOOL_UPGRADE_COSTS,
  cost: LegacyToolUpgradeCost
): ToolUpgradeDef => ({
  id: toOfficialContentId(`tool_upgrade/${toolUpgradeIdSegment(toolType)}/${cost.fromTier}_to_${cost.toTier}`),
  toolType,
  fromTier: cost.fromTier,
  toTier: cost.toTier,
  money: cost.money,
  materials: cost.materials.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  }))
})

export const createOfficialToolUpgrades = (): ToolUpgradeDef[] =>
  Object.entries(TOOL_UPGRADE_COSTS).flatMap(([toolType, costs]) =>
    costs.map(cost => adaptLegacyToolUpgrade(toolType as keyof typeof TOOL_UPGRADE_COSTS, cost))
  )

export const adaptLegacyPondableFish = (fish: LegacyPondableFishDef): PondableFishDef => ({
  id: toOfficialContentId(fish.fishId),
  fishItemId: toOfficialContentId(fish.fishId),
  name: text(`taoyuan.pondable_fish.${fish.fishId}.name`, fish.name),
  maturityDays: fish.maturityDays,
  baseProductionRate: fish.baseProductionRate,
  productItemId: toOfficialContentId(fish.productItemId),
  defaultGenetics: { ...fish.defaultGenetics }
})

export const createOfficialPondableFish = (): PondableFishDef[] => PONDABLE_FISH.map(adaptLegacyPondableFish)

export const adaptLegacyPondBreed = (breed: LegacyPondBreedDef): PondBreedDef => ({
  id: toOfficialContentId(breed.breedId),
  name: text(`taoyuan.pond_breed.${breed.breedId}.name`, breed.name),
  generation: breed.generation,
  baseFishId: toOfficialContentId(breed.baseFishId),
  parentBreedA: breed.parentBreedA ? toOfficialContentId(breed.parentBreedA) : null,
  parentBreedB: breed.parentBreedB ? toOfficialContentId(breed.parentBreedB) : null
})

export const createOfficialPondBreeds = (): PondBreedDef[] => POND_BREEDS.map(adaptLegacyPondBreed)

const adaptLegacyFishPondFacilityCost = (
  cost: LegacyFishPondFacilityDef['buildCost']
): FishPondFacilityDef['buildCost'] => ({
  money: cost.money,
  materials: cost.materials.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  }))
})

export const adaptLegacyFishPondFacility = (facility: LegacyFishPondFacilityDef): FishPondFacilityDef => ({
  id: toOfficialContentId(facility.id),
  name: text(`taoyuan.fish_pond_facility.${facility.id}.name`, facility.name),
  description: text(`taoyuan.fish_pond_facility.${facility.id}.description`, facility.description),
  buildCost: adaptLegacyFishPondFacilityCost(facility.buildCost),
  capacities: facility.capacities.map(capacity => ({ ...capacity })),
  upgrades: facility.upgrades.map(upgrade => ({
    level: upgrade.level,
    capacity: upgrade.capacity,
    cost: adaptLegacyFishPondFacilityCost(upgrade.cost)
  })),
  unlimitedAtLevel: facility.unlimitedAtLevel
})

export const createOfficialFishPondFacilities = (): FishPondFacilityDef[] => [
  adaptLegacyFishPondFacility(FISH_POND_FACILITY)
]

const adaptBuildingUpgradeMaterial = (
  material: LegacyFarmhouseUpgradeDef['materialCost'][number]
): BuildingUpgradeDef['materialCost'][number] => ({
  itemId: toOfficialContentId(material.itemId),
  quantity: material.quantity
})

export const adaptLegacyFarmhouseUpgrade = (upgrade: LegacyFarmhouseUpgradeDef): BuildingUpgradeDef => ({
  id: toOfficialContentId(`building_upgrade/farmhouse/${upgrade.level}`),
  kind: 'farmhouse',
  level: upgrade.level as 1 | 2 | 3,
  name: text(`taoyuan.building_upgrade.farmhouse.${upgrade.level}.name`, upgrade.name),
  description: text(`taoyuan.building_upgrade.farmhouse.${upgrade.level}.description`, upgrade.description),
  cost: upgrade.cost,
  materialCost: upgrade.materialCost.map(adaptBuildingUpgradeMaterial),
  benefit: upgrade.benefit
})

export const adaptLegacyCaveUpgrade = (upgrade: LegacyCaveUpgradeDef): BuildingUpgradeDef => ({
  id: toOfficialContentId(`building_upgrade/cave/${upgrade.level}`),
  kind: 'cave',
  level: upgrade.level as 1 | 2 | 3,
  name: text(`taoyuan.building_upgrade.cave.${upgrade.level}.name`, upgrade.name),
  mushroomChance: upgrade.mushroomChance,
  fruitBatChance: upgrade.fruitBatChance,
  doubleChance: upgrade.doubleChance,
  cost: upgrade.cost,
  materialCost: upgrade.materialCost.map(adaptBuildingUpgradeMaterial),
  mushroomPool: upgrade.mushroomPool.map(entry => ({
    itemId: toOfficialContentId(entry.itemId),
    weight: entry.weight
  })),
  fruitPool: upgrade.fruitPool.map(toOfficialContentId)
})

export const adaptLegacyCellarUpgrade = (upgrade: LegacyCellarUpgradeDef): BuildingUpgradeDef => ({
  id: toOfficialContentId(`building_upgrade/cellar/${upgrade.level}`),
  kind: 'cellar',
  level: upgrade.level as 1 | 2 | 3 | 4 | 5,
  name: text(`taoyuan.building_upgrade.cellar.${upgrade.level}.name`, upgrade.name),
  valuePerCycle: upgrade.valuePerCycle,
  maxSlots: upgrade.maxSlots,
  cost: upgrade.cost,
  materialCost: upgrade.materialCost.map(adaptBuildingUpgradeMaterial)
})

export const createOfficialBuildingUpgrades = (): BuildingUpgradeDef[] => [
  ...FARMHOUSE_UPGRADES.map(adaptLegacyFarmhouseUpgrade),
  ...CAVE_UPGRADES.map(adaptLegacyCaveUpgrade),
  ...CELLAR_UPGRADES.map(adaptLegacyCellarUpgrade)
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
  contributionCost?: number
  unlockGuildLevel?: number
  dailyLimit?: number
  weeklyLimit?: number
  totalLimit?: number
  materials?: readonly { itemId: string, quantity: number }[]
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
  ...(offer.contributionCost !== undefined ? { contributionCost: offer.contributionCost } : {}),
  ...(offer.unlockGuildLevel !== undefined ? { unlockGuildLevel: offer.unlockGuildLevel } : {}),
  ...(offer.dailyLimit !== undefined ? { dailyLimit: offer.dailyLimit } : {}),
  ...(offer.weeklyLimit !== undefined ? { weeklyLimit: offer.weeklyLimit } : {}),
  ...(offer.totalLimit !== undefined ? { totalLimit: offer.totalLimit } : {}),
  ...(offer.materials ? {
    materials: offer.materials.map(material => ({
      itemId: toOfficialContentId(material.itemId),
      quantity: material.quantity
    }))
  } : {}),
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
      description: item.description,
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
      description: item.description,
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
      description: item.description,
      purchaseKind: item.equipType,
      contributionCost: item.contributionCost,
      unlockGuildLevel: item.unlockGuildLevel,
      dailyLimit: item.dailyLimit,
      weeklyLimit: item.weeklyLimit,
      totalLimit: item.totalLimit,
      materials: item.materials
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

export const adaptMarketCategory = (category: MarketCategoryDefinition): MarketCategoryDef => ({
  id: toOfficialContentId(category.id),
  name: text(`taoyuan.market_category.${category.id}.name`, category.name),
  seasonCoefficients: [...category.seasonCoefficients] as [number, number, number, number],
  supplyThresholds: { ...category.supplyThresholds }
})

export const createOfficialMarketCategories = (): MarketCategoryDef[] =>
  MARKET_CATEGORY_DEFINITIONS.map(adaptMarketCategory)

export const adaptHanhaiTradeExchange = (item: TradeExchangeItemDef): HanhaiTradeExchangeDef => ({
  id: toOfficialContentId(`hanhai_trade_exchange/${item.itemId}`),
  itemId: toOfficialContentId(item.itemId),
  name: text(`taoyuan.hanhai.trade_exchange.${item.itemId}.name`, item.name),
  pointsCost: item.pointsCost,
  description: text(`taoyuan.hanhai.trade_exchange.${item.itemId}.description`, item.description),
  ...(item.weeklyLimit !== undefined ? { weeklyLimit: item.weeklyLimit } : {}),
  ...(item.totalLimit !== undefined ? { totalLimit: item.totalLimit } : {}),
  ...(item.isWalletItem !== undefined ? { isWalletItem: item.isWalletItem } : {}),
  ...(item.equipType !== undefined ? { equipType: item.equipType } : {})
})

export const createOfficialHanhaiTradeExchangeItems = (): HanhaiTradeExchangeDef[] =>
  TRADE_EXCHANGE_ITEMS.map(adaptHanhaiTradeExchange)

const adaptHanhaiTradeShopMaterial = (
  material: LegacyHanhaiTradeShopUpgradeDef['materialCost'][number]
): HanhaiTradeShopUpgradeDef['materialCost'][number] => ({
  itemId: toOfficialContentId(material.itemId),
  quantity: material.quantity
})

export const adaptHanhaiTradeShopUpgrade = (
  upgrade: LegacyHanhaiTradeShopUpgradeDef
): HanhaiTradeShopUpgradeDef => ({
  id: toOfficialContentId(`hanhai_trade_shop_upgrade/${upgrade.level}`),
  level: upgrade.level,
  name: text(`taoyuan.hanhai.trade_shop_upgrade.${upgrade.level}.name`, upgrade.name),
  maxSlots: upgrade.maxSlots,
  sellDays: upgrade.sellDays,
  cost: upgrade.cost,
  materialCost: upgrade.materialCost.map(adaptHanhaiTradeShopMaterial)
})

export const createOfficialHanhaiTradeShopUpgrades = (): HanhaiTradeShopUpgradeDef[] =>
  TRADE_SHOP_UPGRADES.map(adaptHanhaiTradeShopUpgrade)

const adaptHanhaiTreasureRewardItem = (
  reward: LegacyHanhaiTreasureRewardDef,
  item: LegacyHanhaiTreasureRewardDef['items'][number]
): HanhaiTreasureRewardDef['items'][number] => ({
  itemId: toOfficialContentId(item.itemId),
  name: text(`taoyuan.hanhai.treasure_reward.${reward.id}.item.${item.itemId}.name`, item.name),
  quantity: item.quantity
})

export const adaptHanhaiTreasureReward = (
  reward: LegacyHanhaiTreasureRewardDef
): HanhaiTreasureRewardDef => ({
  id: toOfficialContentId(`hanhai_treasure_reward/${reward.id}`),
  rollMaxExclusive: reward.rollMaxExclusive,
  money: reward.money,
  items: reward.items.map(item => adaptHanhaiTreasureRewardItem(reward, item))
})

export const createOfficialHanhaiTreasureRewards = (): HanhaiTreasureRewardDef[] =>
  HANHAI_TREASURE_REWARDS.map(adaptHanhaiTreasureReward)

export const adaptHanhaiRoulette = (
  config: HanhaiRouletteDefinition
): HanhaiRouletteDef => ({
  id: toOfficialContentId(`hanhai_roulette/${config.id}`),
  outcomes: config.outcomes.map((outcome, index) => ({
    label: text(`taoyuan.hanhai.roulette.${config.id}.outcome.${index}.label`, outcome.label),
    multiplier: outcome.multiplier,
    chance: outcome.chance
  })),
  betTiers: [...config.betTiers]
})

export const createOfficialHanhaiRoulettes = (): HanhaiRouletteDef[] => [
  adaptHanhaiRoulette(HANHAI_ROULETTE_CONFIG)
]

export const adaptHanhaiCasinoWager = (
  wager: typeof HANHAI_CASINO_WAGERS[number]
): HanhaiCasinoWagerDef => ({
  id: toOfficialContentId(`hanhai_casino_wager/${wager.id}`),
  betAmount: wager.betAmount,
  winMultiplier: wager.winMultiplier
})

export const createOfficialHanhaiCasinoWagers = (): HanhaiCasinoWagerDef[] =>
  HANHAI_CASINO_WAGERS.map(adaptHanhaiCasinoWager)

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
  const treeRegistry = registrySet.get<TreeDef>(toOfficialRegistryTypeId('tree'))
  const fishRegistry = registrySet.get<FishDef>(toOfficialRegistryTypeId('fish'))
  const forageRegistry = registrySet.get<ForageDef>(toOfficialRegistryTypeId('forage'))
  const animalRegistry = registrySet.get<AnimalDef>(toOfficialRegistryTypeId('animal'))
  const animalFeedRegistry = registrySet.get<AnimalFeedDef>(toOfficialRegistryTypeId('animal_feed'))
  const walletItemRegistry = registrySet.get<WalletItemDef>(toOfficialRegistryTypeId('wallet_item'))
  const museumCategoryRegistry = registrySet.get<MuseumCategoryDef>(toOfficialRegistryTypeId('museum_category'))
  const museumItemRegistry = registrySet.get<MuseumItemDef>(toOfficialRegistryTypeId('museum_item'))
  const museumMilestoneRegistry = registrySet.get<MuseumMilestoneDef>(toOfficialRegistryTypeId('museum_milestone'))
  const guildGoalRegistry = registrySet.get<GuildGoalDef>(toOfficialRegistryTypeId('guild_goal'))
  const guildDonationRegistry = registrySet.get<GuildDonationDef>(toOfficialRegistryTypeId('guild_donation'))
  const guildLevelRegistry = registrySet.get<GuildLevelDef>(toOfficialRegistryTypeId('guild_level'))
  const npcRegistry = registrySet.get<NpcDef>(toOfficialRegistryTypeId('npc'))
  const heartEventRegistry = registrySet.get<HeartEventDef>(toOfficialRegistryTypeId('heart_event'))
  const hiddenNpcRegistry = registrySet.get<HiddenNpcDef>(toOfficialRegistryTypeId('hidden_npc'))
  const storyQuestRegistry = registrySet.get<StoryQuestDef>(toOfficialRegistryTypeId('story_quest'))
  const secretNoteRegistry = registrySet.get<SecretNoteDef>(toOfficialRegistryTypeId('secret_note'))
  const tutorialRegistry = registrySet.get<TutorialDef>(toOfficialRegistryTypeId('tutorial'))
  const morningEventRegistry = registrySet.get<MorningEventDef>(toOfficialRegistryTypeId('morning_event'))
  const seasonEventRegistry = registrySet.get<SeasonEventDef>(toOfficialRegistryTypeId('season_event'))
  const questTemplateRegistry = registrySet.get<QuestTemplateDef>(toOfficialRegistryTypeId('quest_template'))
  const farmMapRegistry = registrySet.get<FarmMapDef>(toOfficialRegistryTypeId('farm_map'))
  const animalBuildingRegistry = registrySet.get<AnimalBuildingDef>(toOfficialRegistryTypeId('animal_building'))
  const animalIncubationRegistry = registrySet.get<AnimalIncubationDef>(toOfficialRegistryTypeId('animal_incubation'))
  const breedingHybridRegistry = registrySet.get<BreedingHybridDef>(toOfficialRegistryTypeId('breeding_hybrid'))
  const processingMachineRegistry = registrySet.get<ProcessingMachineDef>(toOfficialRegistryTypeId('processing_machine'))
  const processingRecipeRegistry = registrySet.get<ProcessingRecipeDef>(toOfficialRegistryTypeId('processing_recipe'))
  const sprinklerRegistry = registrySet.get<SprinklerDef>(toOfficialRegistryTypeId('sprinkler'))
  const bombRegistry = registrySet.get<BombDef>(toOfficialRegistryTypeId('bomb'))
  const toolUpgradeRegistry = registrySet.get<ToolUpgradeDef>(toOfficialRegistryTypeId('tool_upgrade'))
  const pondableFishRegistry = registrySet.get<PondableFishDef>(toOfficialRegistryTypeId('pondable_fish'))
  const pondBreedRegistry = registrySet.get<PondBreedDef>(toOfficialRegistryTypeId('pond_breed'))
  const fishPondFacilityRegistry = registrySet.get<FishPondFacilityDef>(toOfficialRegistryTypeId('fish_pond_facility'))
  const buildingUpgradeRegistry = registrySet.get<BuildingUpgradeDef>(toOfficialRegistryTypeId('building_upgrade'))
  const monsterRegistry = registrySet.get<MonsterDef>(toOfficialRegistryTypeId('monster'))
  const monsterPoolRegistry = registrySet.get<MonsterPoolDef>(toOfficialRegistryTypeId('monster_pool'))
  const enchantmentRegistry = registrySet.get<EnchantmentDef>(toOfficialRegistryTypeId('enchantment'))
  const equipmentRegistry = registrySet.get<EquipmentDef>(toOfficialRegistryTypeId('equipment'))
  const equipmentSetRegistry = registrySet.get<EquipmentSetDef>(toOfficialRegistryTypeId('equipment_set'))
  const dropTableRegistry = registrySet.get<DropTableDef>(toOfficialRegistryTypeId('drop_table'))
  const recipeRegistry = registrySet.get<RecipeDef>(toOfficialRegistryTypeId('recipe'))
  const achievementRegistry = registrySet.get<AchievementDef>(toOfficialRegistryTypeId('achievement'))
  const communityBundleRegistry = registrySet.get<CommunityBundleDef>(toOfficialRegistryTypeId('community_bundle'))
  const shopRegistry = registrySet.get<ShopDef>(toOfficialRegistryTypeId('shop'))
  const shopOfferRegistry = registrySet.get<ShopOfferDef>(toOfficialRegistryTypeId('shop_offer'))
  const marketCategoryRegistry = registrySet.get<MarketCategoryDef>(toOfficialRegistryTypeId('market_category'))
  const hanhaiTradeExchangeRegistry = registrySet.get<HanhaiTradeExchangeDef>(toOfficialRegistryTypeId('hanhai_trade_exchange'))
  const hanhaiTradeShopUpgradeRegistry = registrySet.get<HanhaiTradeShopUpgradeDef>(toOfficialRegistryTypeId('hanhai_trade_shop_upgrade'))
  const hanhaiTreasureRewardRegistry = registrySet.get<HanhaiTreasureRewardDef>(toOfficialRegistryTypeId('hanhai_treasure_reward'))
  const hanhaiRouletteRegistry = registrySet.get<HanhaiRouletteDef>(toOfficialRegistryTypeId('hanhai_roulette'))
  const hanhaiCasinoWagerRegistry = registrySet.get<HanhaiCasinoWagerDef>(toOfficialRegistryTypeId('hanhai_casino_wager'))

  for (const tag of createOfficialTags()) tagRegistry.register(owner, tag, { file: 'src/domain/mods/staticAdapters.ts' })
  for (const item of ITEMS.map(adaptLegacyItem)) itemRegistry.register(owner, item, { file: 'src/data/items.ts' })
  for (const crop of CROPS.map(adaptLegacyCrop)) cropRegistry.register(owner, crop, { file: 'src/data/crops.ts' })
  for (const tree of createOfficialTrees()) treeRegistry.register(owner, tree, { file: 'src/data/treeDefinitions.ts' })
  for (const fish of createOfficialFish()) fishRegistry.register(owner, fish, { file: 'src/data/fishDefinitions.ts' })
  for (const forage of createOfficialForage()) forageRegistry.register(owner, forage, { file: 'src/data/forageDefinitions.ts' })
  for (const animal of createOfficialAnimals()) animalRegistry.register(owner, animal, { file: 'src/data/animalDefinitions.ts' })
  for (const feed of createOfficialAnimalFeeds()) {
    animalFeedRegistry.register(owner, feed, { file: 'src/data/animalFeedDefinitions.ts' })
  }
  for (const item of createOfficialWalletItems()) {
    walletItemRegistry.register(owner, item, { file: 'src/data/walletDefinitions.ts' })
  }
  for (const category of createOfficialMuseumCategories()) {
    museumCategoryRegistry.register(owner, category, { file: 'src/data/museumDefinitions.ts' })
  }
  for (const item of createOfficialMuseumItems()) {
    museumItemRegistry.register(owner, item, { file: 'src/data/museumDefinitions.ts' })
  }
  for (const milestone of createOfficialMuseumMilestones()) {
    museumMilestoneRegistry.register(owner, milestone, { file: 'src/data/museumDefinitions.ts' })
  }
  for (const goal of createOfficialGuildGoals()) {
    guildGoalRegistry.register(owner, goal, { file: 'src/data/guildDefinitions.ts' })
  }
  for (const donation of createOfficialGuildDonations()) {
    guildDonationRegistry.register(owner, donation, { file: 'src/data/guildDefinitions.ts' })
  }
  for (const level of createOfficialGuildLevels()) {
    guildLevelRegistry.register(owner, level, { file: 'src/data/guildDefinitions.ts' })
  }
  for (const npc of createOfficialNpcs()) {
    npcRegistry.register(owner, npc, { file: 'src/data/npcDefinitions.ts' })
  }
  for (const event of createOfficialHeartEvents()) {
    heartEventRegistry.register(owner, event, { file: 'src/data/heartEventDefinitions.ts' })
  }
  for (const npc of createOfficialHiddenNpcs()) {
    hiddenNpcRegistry.register(owner, npc, { file: 'src/data/hiddenNpcDefinitions.ts' })
  }
  for (const event of createOfficialHiddenNpcHeartEvents()) {
    heartEventRegistry.register(owner, event, { file: 'src/data/hiddenNpcHeartEventDefinitions.ts' })
  }
  for (const quest of createOfficialStoryQuests()) {
    storyQuestRegistry.register(owner, quest, { file: 'src/data/storyQuestDefinitions.ts' })
  }
  for (const achievement of createOfficialAchievements()) {
    achievementRegistry.register(owner, achievement, { file: 'src/data/achievementDefinitions.ts' })
  }
  for (const bundle of createOfficialCommunityBundles()) {
    communityBundleRegistry.register(owner, bundle, { file: 'src/data/achievementDefinitions.ts' })
  }
  for (const note of createOfficialSecretNotes()) {
    secretNoteRegistry.register(owner, note, { file: 'src/data/secretNotes.ts' })
  }
  for (const tip of createOfficialTutorials()) {
    tutorialRegistry.register(owner, tip, { file: 'src/data/tutorials.ts' })
  }
  for (const event of createOfficialMorningEvents()) {
    morningEventRegistry.register(owner, event, { file: 'src/data/farmEventDefinitions.ts' })
  }
  for (const event of createOfficialSeasonEvents()) {
    seasonEventRegistry.register(owner, event, { file: 'src/data/seasonEventDefinitions.ts' })
  }
  for (const template of createOfficialQuestTemplates()) {
    questTemplateRegistry.register(owner, template, { file: 'src/data/questDefinitions.ts' })
  }
  for (const map of createOfficialFarmMaps()) {
    farmMapRegistry.register(owner, map, { file: 'src/data/farmMapDefinitions.ts' })
  }
  for (const building of createOfficialAnimalBuildings()) {
    animalBuildingRegistry.register(owner, building, { file: 'src/data/animalBuildingDefinitions.ts' })
  }
  for (const incubation of createOfficialAnimalIncubations()) {
    animalIncubationRegistry.register(owner, incubation, { file: 'src/data/animalIncubationDefinitions.ts' })
  }
  for (const hybrid of createOfficialBreedingHybrids()) {
    breedingHybridRegistry.register(owner, hybrid, { file: 'src/data/breedingDefinitions.ts' })
  }
  for (const machine of createOfficialProcessingMachines()) {
    processingMachineRegistry.register(owner, machine, { file: 'src/data/processingMachineDefinitions.ts' })
  }
  for (const recipe of createOfficialProcessingRecipes()) {
    processingRecipeRegistry.register(owner, recipe, { file: 'src/data/processingRecipeDefinitions.ts' })
  }
  for (const sprinkler of createOfficialSprinklers()) {
    sprinklerRegistry.register(owner, sprinkler, { file: 'src/data/processingCraftDefinitions.ts' })
  }
  for (const bomb of createOfficialBombs()) {
    bombRegistry.register(owner, bomb, { file: 'src/data/processingCraftDefinitions.ts' })
  }
  for (const upgrade of createOfficialToolUpgrades()) {
    toolUpgradeRegistry.register(owner, upgrade, { file: 'src/data/toolUpgradeDefinitions.ts' })
  }
  for (const fish of createOfficialPondableFish()) {
    pondableFishRegistry.register(owner, fish, { file: 'src/data/fishPondDefinitions.ts' })
  }
  for (const breed of createOfficialPondBreeds()) {
    pondBreedRegistry.register(owner, breed, { file: 'src/data/pondBreedDefinitions.ts' })
  }
  for (const facility of createOfficialFishPondFacilities()) {
    fishPondFacilityRegistry.register(owner, facility, { file: 'src/data/fishPondFacilityDefinitions.ts' })
  }
  for (const upgrade of createOfficialBuildingUpgrades()) {
    buildingUpgradeRegistry.register(owner, upgrade, { file: 'src/data/buildingUpgradeDefinitions.ts' })
  }
  for (const recipe of RECIPES.map(adaptLegacyRecipe)) recipeRegistry.register(owner, recipe, { file: 'src/data/recipes.ts' })
  for (const shop of createOfficialShops()) shopRegistry.register(owner, shop, { file: 'src/data/shops.ts' })
  for (const [id, enchantment] of Object.entries(ENCHANTMENTS)) {
    enchantmentRegistry.register(owner, adaptLegacyEnchantment(id, enchantment), { file: 'src/data/enchantmentDefinitions.ts' })
  }
  for (const equipment of createOfficialEquipment()) {
    equipmentRegistry.register(owner, equipment, {
      file: equipment.kind === 'weapon'
        ? 'src/data/weaponDefinitions.ts'
        : equipment.kind === 'hat'
          ? 'src/data/hatDefinitions.ts'
          : equipment.kind === 'shoe'
            ? 'src/data/shoeDefinitions.ts'
            : 'src/data/ringDefinitions.ts'
    })
  }
  for (const set of createOfficialEquipmentSets()) {
    equipmentSetRegistry.register(owner, set, { file: 'src/data/equipmentSetDefinitions.ts' })
  }

  const monsters = uniqueMonsters()
  for (const table of monsters.filter(monster => monster.drops.length > 0).map(adaptLegacyMonsterDropTable)) {
    dropTableRegistry.register(owner, table, { file: 'src/data/monsters.ts' })
  }
  for (const table of createOfficialEquipmentDropTables()) {
    dropTableRegistry.register(owner, table, { file: 'src/data/*equipment-drops*.ts' })
  }
  for (const monster of monsters.map(adaptLegacyMonster)) {
    monsterRegistry.register(owner, monster, { file: 'src/data/monsters.ts' })
  }
  for (const pool of createOfficialMonsterPools()) {
    monsterPoolRegistry.register(owner, pool, { file: 'src/data/monsters.ts' })
  }
  for (const offer of createOfficialShopOffers()) {
    shopOfferRegistry.register(owner, offer, { file: 'src/data/*shop*.ts' })
  }
  for (const category of createOfficialMarketCategories()) {
    marketCategoryRegistry.register(owner, category, { file: 'src/data/marketDefinitions.ts' })
  }
  for (const item of createOfficialHanhaiTradeExchangeItems()) {
    hanhaiTradeExchangeRegistry.register(owner, item, { file: 'src/data/hanhaiDefinitions.ts' })
  }
  for (const upgrade of createOfficialHanhaiTradeShopUpgrades()) {
    hanhaiTradeShopUpgradeRegistry.register(owner, upgrade, { file: 'src/data/hanhaiTradeShopDefinitions.ts' })
  }
  for (const reward of createOfficialHanhaiTreasureRewards()) {
    hanhaiTreasureRewardRegistry.register(owner, reward, { file: 'src/data/hanhaiTreasureDefinitions.ts' })
  }
  for (const roulette of createOfficialHanhaiRoulettes()) {
    hanhaiRouletteRegistry.register(owner, roulette, { file: 'src/data/hanhaiRouletteDefinitions.ts' })
  }
  for (const wager of createOfficialHanhaiCasinoWagers()) {
    hanhaiCasinoWagerRegistry.register(owner, wager, { file: 'src/data/hanhaiCasinoDefinitions.ts' })
  }

  return registrySet
}
