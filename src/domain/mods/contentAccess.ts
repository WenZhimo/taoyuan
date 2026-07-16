import type {
  AchievementDef as LegacyAchievementDef,
  AnimalBuildingDef as LegacyAnimalBuildingDef,
  AnimalDef as LegacyAnimalDef,
  CommunityBundleDef as LegacyCommunityBundleDef,
  EnchantmentDef as LegacyEnchantmentDef,
  FishDef as LegacyFishDef,
  FruitTreeDef as LegacyFruitTreeDef,
  HatDef as LegacyHatDef,
  MonsterDef as LegacyMonsterDef,
  NpcDef as LegacyNpcDef,
  ProcessingMachineDef as LegacyProcessingMachineDef,
  ProcessingRecipeDef as LegacyProcessingRecipeDef,
  RingDef as LegacyRingDef,
  ShoeDef as LegacyShoeDef,
  ToolTier,
  ToolType,
  WeaponDef as LegacyWeaponDef,
  WalletItemDef as LegacyWalletItemDef,
  MuseumCategory as LegacyMuseumCategory,
  MuseumItemDef as LegacyMuseumItemDef,
  MuseumMilestone as LegacyMuseumMilestone,
  GuildDonationDef as LegacyGuildDonationDef,
  GuildLevelDef as LegacyGuildLevelDef,
  HeartEventDef as LegacyHeartEventDef,
  MainQuestDef as LegacyMainQuestDef,
  MonsterGoalDef as LegacyGuildGoalDef,
  QuestTemplateDef as LegacyQuestTemplateDef,
  SecretNoteDef as LegacySecretNoteDef,
  WildTreeDef as LegacyWildTreeDef
} from '@/types'
import type { FarmMapDef as LegacyFarmMapDef } from '@/data/farmMapDefinitions'
import type { MorningTipDef as LegacyMorningTipDef } from '@/data/tutorials'
import type {
  MorningChoiceEvent as LegacyMorningChoiceEvent,
  MorningEasterEgg as LegacyMorningEasterEgg,
  MorningEffect as LegacyMorningEffect,
  MorningNarration as LegacyMorningNarration
} from '@/data/farmEventDefinitions'
import type { SeasonEventDef as LegacySeasonEventDef } from '@/data/seasonEventDefinitions'
import type { SpecialOrderTemplate as LegacySpecialOrderTemplate } from '@/data/questDefinitions'
import type { ForageItemDef as LegacyForageItemDef } from '@/data/forageDefinitions'
import type { AnimalFeedDef as LegacyAnimalFeedDef } from '@/data/animalFeedDefinitions'
import type { EquipmentSetDef as LegacyEquipmentSetDef } from '@/data/equipmentSetDefinitions'
import type { AnimalBuildingUpgradeDef as LegacyAnimalBuildingUpgradeDef } from '@/data/animalBuildingDefinitions'
import type {
  AnimalIncubationDef as LegacyAnimalIncubationDef,
  AnimalIncubationMapping as LegacyAnimalIncubationMapping
} from '@/data/animalIncubationDefinitions'
import type { ToolUpgradeCost as LegacyToolUpgradeCost } from '@/data/toolUpgradeDefinitions'
import type { FishingLocation } from '@/types/skill'
import type { CropDef as LegacyCropDef } from '@/types/farm'
import type { PondBreedDef as LegacyPondBreedDef, PondableFishDef as LegacyPondableFishDef } from '@/types/fishPond'
import type { HybridDef as LegacyHybridDef } from '@/types/breeding'
import type {
  DiscoveryCondition as LegacyHiddenNpcDiscoveryCondition,
  HiddenNpcDef as LegacyHiddenNpcDef
} from '@/types/hiddenNpc'
import type {
  FishPondFacilityCost as LegacyFishPondFacilityCost,
  FishPondFacilityDef as LegacyFishPondFacilityDef
} from '@/data/fishPondFacilityDefinitions'
import type {
  CaveUpgradeDef as LegacyCaveUpgradeDef,
  CellarUpgradeDef as LegacyCellarUpgradeDef,
  FarmhouseUpgradeDef as LegacyFarmhouseUpgradeDef
} from '@/data/buildingUpgradeDefinitions'
import { HYBRID_TIER_COUNTS } from '@/data/breedingDefinitions'
import type { ShopDef as LegacyShopDef } from '@/data/shops'
import { requireContentId, toOfficialContentId, toOfficialRegistryTypeId } from './ids'
import {
  MAIN_MINE_BOSS_FLOORS,
  SKULL_CAVERN_BASE_POOL_ID,
  SKULL_CAVERN_BOSS_POOL_ID,
  SKULL_CAVERN_DEPTH_11_POOL_ID,
  getMainMineBossPoolId,
  getMainMineZonePoolId,
  type MainMineZone
} from './monsterPoolIds'
import { resolveMonsterPoolEntries } from './monsterPoolResolution'
import type { RegistrySet } from './registry'
import type {
  AnimalBuildingType,
  AchievementDef as AchievementContentDef,
  AnimalBuildingDef as AnimalBuildingContentDef,
  AnimalDef as AnimalContentDef,
  AnimalFeedDef as AnimalFeedContentDef,
  AnimalIncubationDef as AnimalIncubationContentDef,
  BreedingHybridDef as BreedingHybridContentDef,
  BuildingUpgradeDef as BuildingUpgradeContentDef,
  CaveUpgradeContentDef,
  CellarUpgradeContentDef,
  CommunityBundleDef as CommunityBundleContentDef,
  CropDef,
  DropTableDef,
  EnchantmentDef,
  EquipmentDef as EquipmentContentDef,
  EquipmentSetDef as EquipmentSetContentDef,
  FarmMapDef as FarmMapContentDef,
  FishDef as FishContentDef,
  FishPondFacilityDef as FishPondFacilityContentDef,
  FarmhouseUpgradeContentDef,
  FishWeather,
  ForageDef,
  FruitTreeContentDef,
  ItemDef,
  MuseumCategoryDef as MuseumCategoryContentDef,
  MuseumItemDef as MuseumItemContentDef,
  MuseumMilestoneDef as MuseumMilestoneContentDef,
  GuildDonationDef as GuildDonationContentDef,
  GuildGoalDef as GuildGoalContentDef,
  GuildLevelDef as GuildLevelContentDef,
  HeartEventDef as HeartEventContentDef,
  HiddenNpcDef as HiddenNpcContentDef,
  MonsterDef,
  MonsterPoolDef,
  MorningEventDef as MorningEventContentDef,
  MorningEventEffect,
  NpcDef as NpcContentDef,
  PondBreedDef,
  PondableFishDef,
  ProcessingMachineDef as ProcessingMachineContentDef,
  ProcessingRecipeDef as ProcessingRecipeContentDef,
  QuestTemplateDef as QuestTemplateContentDef,
  RecipeDef,
  Season,
  SecretNoteDef as SecretNoteContentDef,
  SeasonEventDef as SeasonEventContentDef,
  ShopDef,
  ShopOfferDef,
  StoryQuestDef as StoryQuestContentDef,
  TagDef,
  ToolUpgradeDef as ToolUpgradeContentDef,
  TutorialDef as TutorialContentDef,
  TreeDef,
  WalletItemDef as WalletItemContentDef,
  WeaponEquipmentDef,
  WearableEquipmentDef,
  WildTreeContentDef
} from './schemas'
import { buildOfficialRegistrySetFromStaticData } from './staticAdapters'

let officialRegistrySet: RegistrySet | null = null

const getOfficialRegistrySet = (): RegistrySet => {
  if (!officialRegistrySet) {
    officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    officialRegistrySet.freezeEntries()
  }
  return officialRegistrySet
}

const toQueryContentId = (id: string) => {
  try {
    return requireContentId(id.includes(':') ? id : toOfficialContentId(id))
  } catch {
    return null
  }
}

const getLocalContentId = (id: string): string => {
  const contentId = requireContentId(id)
  return contentId.slice(contentId.indexOf(':') + 1)
}

const toSecretNoteQueryContentId = (id: number | string) => {
  const rawId = typeof id === 'number' ? `secret_note/${id}` : id
  return toQueryContentId(rawId.includes(':') || rawId.includes('/') ? rawId : `secret_note/${rawId}`)
}

const toTutorialQueryContentId = (id: string) =>
  toQueryContentId(id.includes(':') || id.includes('/') ? id : `tutorial/${id}`)

const toMorningEventQueryContentId = (id: string) => {
  if (id.includes(':')) return toQueryContentId(id)
  if (id.startsWith('morning_event/')) return toQueryContentId(id)
  return toQueryContentId(`morning_event/${id}`)
}

const toSeasonEventQueryContentId = (id: string) =>
  toQueryContentId(id.includes(':') || id.includes('/') ? id : `season_event/${id}`)

const BOARD_QUEST_TEMPLATE_TYPES = new Set(['delivery', 'fishing', 'mining', 'gathering'])

const toQuestTemplateQueryContentId = (id: string) => {
  if (id.includes(':')) return toQueryContentId(id)
  if (id.startsWith('quest_template/')) return toQueryContentId(id)
  if (BOARD_QUEST_TEMPLATE_TYPES.has(id)) return toQueryContentId(`quest_template/board/${id}`)
  return toQueryContentId(`quest_template/${id}`)
}

const toGuildGoalQueryContentId = (id: string) =>
  toQueryContentId(id.includes(':') || id.includes('/') ? id : `guild_goal/${id}`)

const toGuildDonationQueryContentId = (id: string) =>
  toQueryContentId(id.includes(':') || id.includes('/') ? id : `guild_donation/${id}`)

const toGuildLevelQueryContentId = (level: number | string) => {
  const rawId = typeof level === 'number' ? `guild_level/${level}` : level
  return toQueryContentId(rawId.includes(':') || rawId.includes('/') ? rawId : `guild_level/${rawId}`)
}

const toNpcQueryContentId = (id: string) =>
  toQueryContentId(id.includes(':') || id.includes('/') ? id : `npc/${id}`)

const toHeartEventQueryContentId = (id: string) =>
  toQueryContentId(id.includes(':') || id.includes('/') ? id : `heart_event/${id}`)

const toHiddenNpcQueryContentId = (id: string) =>
  toQueryContentId(id.includes(':') || id.includes('/') ? id : `hidden_npc/${id}`)

const toStoryQuestQueryContentId = (id: string) =>
  toQueryContentId(id.includes(':') || id.includes('/') ? id : `story_quest/${id}`)

const toBreedingHybridQueryContentId = (id: string) => {
  if (id.includes(':')) return toQueryContentId(id)
  if (id.startsWith('breeding_hybrid/')) return toQueryContentId(id)
  return toQueryContentId(`breeding_hybrid/${id}`)
}

const toAchievementQueryContentId = (id: string) =>
  toQueryContentId(id.includes(':') || id.includes('/') ? id : `achievement/${id}`)

const toCommunityBundleQueryContentId = (id: string) =>
  toQueryContentId(id.includes(':') || id.includes('/') ? id : `community_bundle/${id}`)

export const getOfficialTagDef = (id: string): Readonly<TagDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<TagDef>(toOfficialRegistryTypeId('tag')).get(contentId) : undefined
}

export const getOfficialTagDefs = (): readonly Readonly<TagDef>[] =>
  getOfficialRegistrySet().get<TagDef>(toOfficialRegistryTypeId('tag')).values()

export const getOfficialSeparateStackTagIds = (): readonly string[] =>
  getOfficialTagDefs()
    .filter(tag => tag.stackPolicy === 'separate')
    .map(tag => tag.id)

export const getOfficialItemDef = (id: string): Readonly<ItemDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<ItemDef>(toOfficialRegistryTypeId('item')).get(contentId) : undefined
}

export const getOfficialRecipeDef = (id: string): Readonly<RecipeDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<RecipeDef>(toOfficialRegistryTypeId('recipe')).get(contentId) : undefined
}

export const getOfficialShopDef = (id: string): Readonly<ShopDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<ShopDef>(toOfficialRegistryTypeId('shop')).get(contentId) : undefined
}

export const getOfficialItemDefs = (): readonly Readonly<ItemDef>[] =>
  getOfficialRegistrySet().get<ItemDef>(toOfficialRegistryTypeId('item')).values()

export const getOfficialShopDefs = (): readonly Readonly<ShopDef>[] =>
  getOfficialRegistrySet().get<ShopDef>(toOfficialRegistryTypeId('shop')).values()

export const getOfficialShopOfferDefs = (): readonly Readonly<ShopOfferDef>[] =>
  getOfficialRegistrySet().get<ShopOfferDef>(toOfficialRegistryTypeId('shop_offer')).values()

export const getOfficialEnchantmentDef = (id: string): Readonly<EnchantmentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<EnchantmentDef>(toOfficialRegistryTypeId('enchantment')).get(contentId) : undefined
}

export const getOfficialEnchantmentDefs = (): readonly Readonly<EnchantmentDef>[] =>
  getOfficialRegistrySet().get<EnchantmentDef>(toOfficialRegistryTypeId('enchantment')).values()

const toLegacyEnchantmentDef = (enchantment: Readonly<EnchantmentDef>): LegacyEnchantmentDef => ({
  id: getLocalContentId(enchantment.id),
  name: enchantment.name.fallback,
  description: enchantment.description.fallback,
  attackBonus: enchantment.attackBonus,
  critBonus: enchantment.critBonus,
  special: enchantment.special
})

export const getOfficialEnchantmentById = (id: string): LegacyEnchantmentDef | undefined => {
  const enchantment = getOfficialEnchantmentDef(id)
  return enchantment ? toLegacyEnchantmentDef(enchantment) : undefined
}

export const getOfficialDropTableDef = (id: string): Readonly<DropTableDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<DropTableDef>(toOfficialRegistryTypeId('drop_table')).get(contentId) : undefined
}

export const getOfficialDropTableDefs = (): readonly Readonly<DropTableDef>[] =>
  getOfficialRegistrySet().get<DropTableDef>(toOfficialRegistryTypeId('drop_table')).values()

export const getOfficialMonsterDef = (id: string): Readonly<MonsterDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<MonsterDef>(toOfficialRegistryTypeId('monster')).get(contentId) : undefined
}

export const getOfficialMonsterDefs = (): readonly Readonly<MonsterDef>[] =>
  getOfficialRegistrySet().get<MonsterDef>(toOfficialRegistryTypeId('monster')).values()

export const getOfficialMonsterPoolDef = (id: string): Readonly<MonsterPoolDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<MonsterPoolDef>(toOfficialRegistryTypeId('monster_pool')).get(contentId)
    : undefined
}

export const getOfficialMonsterPoolDefs = (): readonly Readonly<MonsterPoolDef>[] =>
  getOfficialRegistrySet().get<MonsterPoolDef>(toOfficialRegistryTypeId('monster_pool')).values()

export const resolveOfficialMonsterPool = (id: string): readonly LegacyMonsterDef[] => {
  const pool = getOfficialMonsterPoolDef(id)
  if (!pool) throw new Error(`Missing required official monster pool: ${id}`)
  return resolveMonsterPoolEntries(pool, getOfficialMonsterById)
}

export const getOfficialMainMineZoneMonsters = (zone: MainMineZone): readonly LegacyMonsterDef[] =>
  resolveOfficialMonsterPool(getMainMineZonePoolId(zone))

export const getOfficialMainMineBoss = (floor: number): LegacyMonsterDef | undefined => {
  if (!MAIN_MINE_BOSS_FLOORS.some(candidate => candidate === floor)) return undefined
  const monsters = resolveOfficialMonsterPool(getMainMineBossPoolId(floor))
  if (monsters.length !== 1) throw new Error(`Main mine boss pool must contain exactly one monster: ${floor}`)
  return monsters[0]
}

export const getOfficialSkullCavernBaseMonsters = (): readonly LegacyMonsterDef[] =>
  resolveOfficialMonsterPool(SKULL_CAVERN_BASE_POOL_ID)

export const getOfficialSkullCavernDepthMonsters = (): readonly LegacyMonsterDef[] =>
  resolveOfficialMonsterPool(SKULL_CAVERN_DEPTH_11_POOL_ID)

export const getOfficialSkullCavernBosses = (): readonly LegacyMonsterDef[] =>
  resolveOfficialMonsterPool(SKULL_CAVERN_BOSS_POOL_ID)

const toLegacyMonsterDrops = (monster: Readonly<MonsterDef>): LegacyMonsterDef['drops'] => {
  if (!monster.dropTableId) return []
  const table = getOfficialDropTableDef(monster.dropTableId)
  if (!table) throw new Error(`Missing official monster drop table: ${monster.dropTableId}`)

  return table.entries.map(entry => {
    const minQuantity = entry.minQuantity ?? 1
    const maxQuantity = entry.maxQuantity ?? minQuantity
    if (minQuantity !== 1 || maxQuantity !== 1) {
      throw new Error(`Legacy monster drops cannot represent quantity range for ${monster.id}: ${entry.itemId}`)
    }
    return {
      itemId: getLocalContentId(entry.itemId),
      chance: entry.chance
    }
  })
}

const toLegacyMonsterDef = (monster: Readonly<MonsterDef>): LegacyMonsterDef => ({
  id: getLocalContentId(monster.id),
  name: monster.name.fallback,
  hp: monster.hp,
  attack: monster.attack,
  defense: monster.defense,
  expReward: monster.expReward,
  drops: toLegacyMonsterDrops(monster),
  description: monster.description.fallback
})

export const getOfficialMonsterById = (id: string): LegacyMonsterDef | undefined => {
  const monster = getOfficialMonsterDef(id)
  return monster ? toLegacyMonsterDef(monster) : undefined
}

export const getOfficialMonsterDropTableDef = (monsterId: string): Readonly<DropTableDef> | undefined =>
  getOfficialDropTableDef(monsterId.includes('/') ? monsterId : `drop/monster/${monsterId}`)

export interface OfficialEquipmentDropTableQuery {
  source: 'monster' | 'treasure'
  kind: 'weapon' | 'ring' | 'hat' | 'shoe'
  zone: string
}

export const getOfficialEquipmentDropTableDef = (
  query: OfficialEquipmentDropTableQuery
): Readonly<DropTableDef> | undefined =>
  getOfficialDropTableDef(`drop/equipment/${query.source}/${query.kind}/${query.zone}`)

export const getOfficialEquipmentDef = (id: string): Readonly<EquipmentContentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<EquipmentContentDef>(toOfficialRegistryTypeId('equipment')).get(contentId)
    : undefined
}

export const getOfficialEquipmentDefs = (): readonly Readonly<EquipmentContentDef>[] =>
  getOfficialRegistrySet().get<EquipmentContentDef>(toOfficialRegistryTypeId('equipment')).values()

const toLegacyRingDef = (equipment: Readonly<WearableEquipmentDef>): LegacyRingDef => ({
  id: getLocalContentId(equipment.id),
  name: equipment.name.fallback,
  description: equipment.description.fallback,
  effects: equipment.effects.map(effect => ({ ...effect })),
  recipe: equipment.recipe
    ? equipment.recipe.map(material => ({
        itemId: getLocalContentId(material.itemId),
        quantity: material.quantity
      }))
    : null,
  recipeMoney: equipment.recipeMoney,
  obtainSource: equipment.obtainSource.fallback,
  sellPrice: equipment.sellPrice
})

const toLegacyHatDef = (equipment: Readonly<WearableEquipmentDef>): LegacyHatDef => ({
  id: getLocalContentId(equipment.id),
  name: equipment.name.fallback,
  description: equipment.description.fallback,
  effects: equipment.effects.map(effect => ({ ...effect })),
  shopPrice: equipment.shopPrice ?? null,
  recipe: equipment.recipe
    ? equipment.recipe.map(material => ({
        itemId: getLocalContentId(material.itemId),
        quantity: material.quantity
      }))
    : null,
  recipeMoney: equipment.recipeMoney,
  obtainSource: equipment.obtainSource.fallback,
  sellPrice: equipment.sellPrice
})

const toLegacyShoeDef = (equipment: Readonly<WearableEquipmentDef>): LegacyShoeDef => ({
  id: getLocalContentId(equipment.id),
  name: equipment.name.fallback,
  description: equipment.description.fallback,
  effects: equipment.effects.map(effect => ({ ...effect })),
  shopPrice: equipment.shopPrice ?? null,
  recipe: equipment.recipe
    ? equipment.recipe.map(material => ({
        itemId: getLocalContentId(material.itemId),
        quantity: material.quantity
      }))
    : null,
  recipeMoney: equipment.recipeMoney,
  obtainSource: equipment.obtainSource.fallback,
  sellPrice: equipment.sellPrice
})

export const getOfficialRingDefs = (): readonly Readonly<WearableEquipmentDef>[] =>
  getOfficialEquipmentDefs().filter((equipment): equipment is Readonly<WearableEquipmentDef> => equipment.kind === 'ring')

export const getOfficialRingsAsLegacy = (): readonly LegacyRingDef[] =>
  getOfficialRingDefs().map(toLegacyRingDef)

export const getOfficialRingById = (id: string): LegacyRingDef | undefined => {
  const equipment = getOfficialEquipmentDef(id)
  return equipment?.kind === 'ring' ? toLegacyRingDef(equipment) : undefined
}

export const getOfficialHatDefs = (): readonly Readonly<WearableEquipmentDef>[] =>
  getOfficialEquipmentDefs().filter((equipment): equipment is Readonly<WearableEquipmentDef> => equipment.kind === 'hat')

export const getOfficialHatsAsLegacy = (): readonly LegacyHatDef[] =>
  getOfficialHatDefs().map(toLegacyHatDef)

export const getOfficialHatById = (id: string): LegacyHatDef | undefined => {
  const equipment = getOfficialEquipmentDef(id)
  return equipment?.kind === 'hat' ? toLegacyHatDef(equipment) : undefined
}

export const getOfficialShoeDefs = (): readonly Readonly<WearableEquipmentDef>[] =>
  getOfficialEquipmentDefs().filter((equipment): equipment is Readonly<WearableEquipmentDef> => equipment.kind === 'shoe')

export const getOfficialShoesAsLegacy = (): readonly LegacyShoeDef[] =>
  getOfficialShoeDefs().map(toLegacyShoeDef)

export const getOfficialShoeById = (id: string): LegacyShoeDef | undefined => {
  const equipment = getOfficialEquipmentDef(id)
  return equipment?.kind === 'shoe' ? toLegacyShoeDef(equipment) : undefined
}

const toLegacyWeaponDef = (equipment: Readonly<WeaponEquipmentDef>): LegacyWeaponDef => ({
  id: getLocalContentId(equipment.id),
  name: equipment.name.fallback,
  type: equipment.weaponType,
  attack: equipment.attack,
  critRate: equipment.critRate,
  description: equipment.description.fallback,
  shopPrice: equipment.shopPrice,
  shopMaterials: equipment.shopMaterials.map(material => ({
    itemId: getLocalContentId(material.itemId),
    quantity: material.quantity
  })),
  fixedEnchantment: equipment.fixedEnchantment ? getLocalContentId(equipment.fixedEnchantment) : null
})

export const getOfficialWeaponDefs = (): readonly Readonly<WeaponEquipmentDef>[] =>
  getOfficialEquipmentDefs().filter((equipment): equipment is Readonly<WeaponEquipmentDef> => equipment.kind === 'weapon')

export const getOfficialWeaponsAsLegacy = (): readonly LegacyWeaponDef[] =>
  getOfficialWeaponDefs().map(toLegacyWeaponDef)

export const getOfficialWeaponById = (id: string): LegacyWeaponDef | undefined => {
  const equipment = getOfficialEquipmentDef(id)
  return equipment?.kind === 'weapon' ? toLegacyWeaponDef(equipment) : undefined
}

export const getOfficialEquipmentSetDef = (id: string): Readonly<EquipmentSetContentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<EquipmentSetContentDef>(toOfficialRegistryTypeId('equipment_set')).get(contentId)
    : undefined
}

export const getOfficialEquipmentSetDefs = (): readonly Readonly<EquipmentSetContentDef>[] =>
  getOfficialRegistrySet().get<EquipmentSetContentDef>(toOfficialRegistryTypeId('equipment_set')).values()

const toLegacyEquipmentSetDef = (set: Readonly<EquipmentSetContentDef>): LegacyEquipmentSetDef => ({
  id: getLocalContentId(set.id),
  name: set.name.fallback,
  description: set.description.fallback,
  pieces: {
    ...(set.pieces.weapon ? { weapon: getLocalContentId(set.pieces.weapon) } : {}),
    ring: getLocalContentId(set.pieces.ring),
    hat: getLocalContentId(set.pieces.hat),
    shoe: getLocalContentId(set.pieces.shoe)
  },
  bonuses: set.bonuses.map(bonus => ({
    count: bonus.count,
    effects: bonus.effects.map(effect => ({ ...effect })),
    description: bonus.description.fallback
  }))
})

export const getOfficialEquipmentSetsAsLegacy = (): readonly LegacyEquipmentSetDef[] =>
  getOfficialEquipmentSetDefs().map(toLegacyEquipmentSetDef)

export const getOfficialEquipmentSetByPieceId = (defId: string): LegacyEquipmentSetDef | undefined => {
  const contentId = toQueryContentId(defId)
  if (!contentId) return undefined
  const set = getOfficialEquipmentSetDefs().find(candidate =>
    candidate.pieces.weapon === contentId ||
    candidate.pieces.ring === contentId ||
    candidate.pieces.hat === contentId ||
    candidate.pieces.shoe === contentId
  )
  return set ? toLegacyEquipmentSetDef(set) : undefined
}

export interface OfficialShopOfferQuery {
  shopId: string
  season?: Season
}

export interface OfficialShopOfferGroup {
  groupId: string
  groupName: string
  offers: readonly Readonly<ShopOfferDef>[]
}

const compareShopOffers = (a: Readonly<ShopOfferDef>, b: Readonly<ShopOfferDef>): number =>
  (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id)

export const getOfficialShopOffersForShop = (
  query: OfficialShopOfferQuery
): readonly Readonly<ShopOfferDef>[] => {
  const shopId = toQueryContentId(query.shopId)
  if (!shopId) return []
  return getOfficialShopOfferDefs()
    .filter(offer => offer.shopId === shopId)
    .filter(offer => !query.season || !offer.availableSeasons || offer.availableSeasons.includes(query.season))
    .slice()
    .sort(compareShopOffers)
}

export const getOfficialShopOfferGroupsForShop = (
  query: OfficialShopOfferQuery
): readonly OfficialShopOfferGroup[] => {
  const groups = new Map<string, { groupName: string; offers: Readonly<ShopOfferDef>[] }>()
  for (const offer of getOfficialShopOffersForShop(query)) {
    const groupId = offer.groupId ?? 'default'
    const groupName = offer.groupName?.fallback ?? groupId
    const group = groups.get(groupId)
    if (group) {
      group.offers.push(offer)
    } else {
      groups.set(groupId, { groupName, offers: [offer] })
    }
  }
  return Array.from(groups.entries(), ([groupId, group]) => ({
    groupId,
    groupName: group.groupName,
    offers: group.offers
  }))
}

export const getOfficialCropDef = (id: string): Readonly<CropDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<CropDef>(toOfficialRegistryTypeId('crop')).get(contentId) : undefined
}

const toLegacyCropDef = (crop: Readonly<CropDef>): LegacyCropDef => ({
  id: getLocalContentId(crop.id),
  name: crop.name.fallback,
  seedId: getLocalContentId(crop.seedId),
  season: [...crop.season] as LegacyCropDef['season'],
  growthDays: crop.growthDays,
  sellPrice: crop.sellPrice,
  seedPrice: crop.seedPrice,
  deepWatering: crop.deepWatering,
  description: crop.description.fallback,
  ...(crop.regrowth !== undefined ? { regrowth: crop.regrowth } : {}),
  ...(crop.regrowthDays !== undefined ? { regrowthDays: crop.regrowthDays } : {}),
  ...(crop.maxHarvests !== undefined ? { maxHarvests: crop.maxHarvests } : {}),
  ...(crop.giantCropEligible !== undefined ? { giantCropEligible: crop.giantCropEligible } : {})
})

export const getOfficialCropById = (id: string): LegacyCropDef | undefined => {
  const crop = getOfficialCropDef(id)
  return crop ? toLegacyCropDef(crop) : undefined
}

export const getOfficialCropBySeedId = (seedId: string): LegacyCropDef | undefined => {
  const contentId = toQueryContentId(seedId)
  if (!contentId) return undefined
  const crop = getOfficialRegistrySet()
    .get<CropDef>(toOfficialRegistryTypeId('crop'))
    .values()
    .find(candidate => candidate.seedId === contentId)
  return crop ? toLegacyCropDef(crop) : undefined
}

export const getOfficialCropsBySeason = (season: string): readonly LegacyCropDef[] =>
  getOfficialRegistrySet()
    .get<CropDef>(toOfficialRegistryTypeId('crop'))
    .values()
    .filter(crop => crop.season.includes(season as LegacyCropDef['season'][number]))
    .map(toLegacyCropDef)

export const getOfficialCropDefs = (): readonly LegacyCropDef[] =>
  getOfficialRegistrySet().get<CropDef>(toOfficialRegistryTypeId('crop')).values().map(toLegacyCropDef)

export const getOfficialTreeDef = (id: string): Readonly<TreeDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<TreeDef>(toOfficialRegistryTypeId('tree')).get(contentId) : undefined
}

export const getOfficialTreeDefs = (): readonly Readonly<TreeDef>[] =>
  getOfficialRegistrySet().get<TreeDef>(toOfficialRegistryTypeId('tree')).values()

export const getOfficialFishDef = (id: string): Readonly<FishContentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<FishContentDef>(toOfficialRegistryTypeId('fish')).get(contentId) : undefined
}

export const getOfficialFishDefs = (): readonly Readonly<FishContentDef>[] =>
  getOfficialRegistrySet().get<FishContentDef>(toOfficialRegistryTypeId('fish')).values()

export const getOfficialForageDef = (id: string): Readonly<ForageDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<ForageDef>(toOfficialRegistryTypeId('forage')).get(contentId) : undefined
}

export const getOfficialForageDefs = (): readonly Readonly<ForageDef>[] =>
  getOfficialRegistrySet().get<ForageDef>(toOfficialRegistryTypeId('forage')).values()

export const getOfficialAnimalDef = (id: string): Readonly<AnimalContentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<AnimalContentDef>(toOfficialRegistryTypeId('animal')).get(contentId)
    : undefined
}

export const getOfficialAnimalDefs = (): readonly Readonly<AnimalContentDef>[] =>
  getOfficialRegistrySet().get<AnimalContentDef>(toOfficialRegistryTypeId('animal')).values()

export const getOfficialAnimalFeedDef = (id: string): Readonly<AnimalFeedContentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<AnimalFeedContentDef>(toOfficialRegistryTypeId('animal_feed')).get(contentId)
    : undefined
}

export const getOfficialAnimalFeedDefs = (): readonly Readonly<AnimalFeedContentDef>[] =>
  getOfficialRegistrySet().get<AnimalFeedContentDef>(toOfficialRegistryTypeId('animal_feed')).values()

export const getOfficialWalletItemDef = (id: string): Readonly<WalletItemContentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<WalletItemContentDef>(toOfficialRegistryTypeId('wallet_item')).get(contentId)
    : undefined
}

export const getOfficialWalletItemDefs = (): readonly Readonly<WalletItemContentDef>[] =>
  getOfficialRegistrySet().get<WalletItemContentDef>(toOfficialRegistryTypeId('wallet_item')).values()

export const getOfficialMuseumCategoryDef = (id: string): Readonly<MuseumCategoryContentDef> | undefined => {
  const contentId = toQueryContentId(id.includes('/') ? id : `museum_category/${id}`)
  return contentId
    ? getOfficialRegistrySet().get<MuseumCategoryContentDef>(toOfficialRegistryTypeId('museum_category')).get(contentId)
    : undefined
}

export const getOfficialMuseumCategoryDefs = (): readonly Readonly<MuseumCategoryContentDef>[] =>
  getOfficialRegistrySet().get<MuseumCategoryContentDef>(toOfficialRegistryTypeId('museum_category')).values()

export const getOfficialMuseumItemDef = (id: string): Readonly<MuseumItemContentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<MuseumItemContentDef>(toOfficialRegistryTypeId('museum_item')).get(contentId)
    : undefined
}

export const getOfficialMuseumItemDefs = (): readonly Readonly<MuseumItemContentDef>[] =>
  getOfficialRegistrySet().get<MuseumItemContentDef>(toOfficialRegistryTypeId('museum_item')).values()

export const getOfficialMuseumMilestoneDef = (id: number | string): Readonly<MuseumMilestoneContentDef> | undefined => {
  const rawId = typeof id === 'number' ? `museum_milestone/${id}` : id
  const contentId = toQueryContentId(rawId.includes(':') || rawId.includes('/') ? rawId : `museum_milestone/${rawId}`)
  return contentId
    ? getOfficialRegistrySet().get<MuseumMilestoneContentDef>(toOfficialRegistryTypeId('museum_milestone')).get(contentId)
    : undefined
}

export const getOfficialMuseumMilestoneDefs = (): readonly Readonly<MuseumMilestoneContentDef>[] =>
  getOfficialRegistrySet().get<MuseumMilestoneContentDef>(toOfficialRegistryTypeId('museum_milestone')).values()

export const getOfficialGuildGoalDef = (id: string): Readonly<GuildGoalContentDef> | undefined => {
  const contentId = toGuildGoalQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<GuildGoalContentDef>(toOfficialRegistryTypeId('guild_goal')).get(contentId)
    : undefined
}

export const getOfficialGuildGoalDefs = (): readonly Readonly<GuildGoalContentDef>[] =>
  getOfficialRegistrySet().get<GuildGoalContentDef>(toOfficialRegistryTypeId('guild_goal')).values()

export const getOfficialGuildDonationDef = (id: string): Readonly<GuildDonationContentDef> | undefined => {
  const contentId = toGuildDonationQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<GuildDonationContentDef>(toOfficialRegistryTypeId('guild_donation')).get(contentId)
    : undefined
}

export const getOfficialGuildDonationDefs = (): readonly Readonly<GuildDonationContentDef>[] =>
  getOfficialRegistrySet().get<GuildDonationContentDef>(toOfficialRegistryTypeId('guild_donation')).values()

export const getOfficialGuildLevelDef = (level: number | string): Readonly<GuildLevelContentDef> | undefined => {
  const contentId = toGuildLevelQueryContentId(level)
  return contentId
    ? getOfficialRegistrySet().get<GuildLevelContentDef>(toOfficialRegistryTypeId('guild_level')).get(contentId)
    : undefined
}

export const getOfficialGuildLevelDefs = (): readonly Readonly<GuildLevelContentDef>[] =>
  getOfficialRegistrySet().get<GuildLevelContentDef>(toOfficialRegistryTypeId('guild_level')).values()

export const getOfficialNpcDef = (id: string): Readonly<NpcContentDef> | undefined => {
  const contentId = toNpcQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<NpcContentDef>(toOfficialRegistryTypeId('npc')).get(contentId) : undefined
}

export const getOfficialNpcDefs = (): readonly Readonly<NpcContentDef>[] =>
  getOfficialRegistrySet().get<NpcContentDef>(toOfficialRegistryTypeId('npc')).values()

export const getOfficialHeartEventDef = (id: string): Readonly<HeartEventContentDef> | undefined => {
  const contentId = toHeartEventQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<HeartEventContentDef>(toOfficialRegistryTypeId('heart_event')).get(contentId)
    : undefined
}

export const getOfficialHeartEventDefs = (): readonly Readonly<HeartEventContentDef>[] =>
  getOfficialRegistrySet().get<HeartEventContentDef>(toOfficialRegistryTypeId('heart_event')).values()

export const getOfficialHiddenNpcDef = (id: string): Readonly<HiddenNpcContentDef> | undefined => {
  const contentId = toHiddenNpcQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<HiddenNpcContentDef>(toOfficialRegistryTypeId('hidden_npc')).get(contentId)
    : undefined
}

export const getOfficialHiddenNpcDefs = (): readonly Readonly<HiddenNpcContentDef>[] =>
  getOfficialRegistrySet().get<HiddenNpcContentDef>(toOfficialRegistryTypeId('hidden_npc')).values()

export const getOfficialStoryQuestDef = (id: string): Readonly<StoryQuestContentDef> | undefined => {
  const contentId = toStoryQuestQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<StoryQuestContentDef>(toOfficialRegistryTypeId('story_quest')).get(contentId)
    : undefined
}

export const getOfficialStoryQuestDefs = (): readonly Readonly<StoryQuestContentDef>[] =>
  getOfficialRegistrySet().get<StoryQuestContentDef>(toOfficialRegistryTypeId('story_quest')).values()

export const getOfficialAchievementDef = (id: string): Readonly<AchievementContentDef> | undefined => {
  const contentId = toAchievementQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<AchievementContentDef>(toOfficialRegistryTypeId('achievement')).get(contentId)
    : undefined
}

export const getOfficialAchievementDefs = (): readonly Readonly<AchievementContentDef>[] =>
  getOfficialRegistrySet().get<AchievementContentDef>(toOfficialRegistryTypeId('achievement')).values()

export const getOfficialCommunityBundleDef = (id: string): Readonly<CommunityBundleContentDef> | undefined => {
  const contentId = toCommunityBundleQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<CommunityBundleContentDef>(toOfficialRegistryTypeId('community_bundle')).get(contentId)
    : undefined
}

export const getOfficialCommunityBundleDefs = (): readonly Readonly<CommunityBundleContentDef>[] =>
  getOfficialRegistrySet().get<CommunityBundleContentDef>(toOfficialRegistryTypeId('community_bundle')).values()

export const getOfficialSecretNoteDef = (id: number | string): Readonly<SecretNoteContentDef> | undefined => {
  const contentId = toSecretNoteQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<SecretNoteContentDef>(toOfficialRegistryTypeId('secret_note')).get(contentId)
    : undefined
}

export const getOfficialSecretNoteDefs = (): readonly Readonly<SecretNoteContentDef>[] =>
  getOfficialRegistrySet().get<SecretNoteContentDef>(toOfficialRegistryTypeId('secret_note')).values()

export const getOfficialTutorialDef = (id: string): Readonly<TutorialContentDef> | undefined => {
  const contentId = toTutorialQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<TutorialContentDef>(toOfficialRegistryTypeId('tutorial')).get(contentId)
    : undefined
}

export const getOfficialTutorialDefs = (): readonly Readonly<TutorialContentDef>[] =>
  getOfficialRegistrySet().get<TutorialContentDef>(toOfficialRegistryTypeId('tutorial')).values()

export const getOfficialMorningEventDef = (id: string): Readonly<MorningEventContentDef> | undefined => {
  const contentId = toMorningEventQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<MorningEventContentDef>(toOfficialRegistryTypeId('morning_event')).get(contentId)
    : undefined
}

export const getOfficialMorningEventDefs = (): readonly Readonly<MorningEventContentDef>[] =>
  getOfficialRegistrySet().get<MorningEventContentDef>(toOfficialRegistryTypeId('morning_event')).values()

export const getOfficialMorningNarrationEventDefs = ():
  readonly Readonly<Extract<MorningEventContentDef, { kind: 'narration' }>>[] =>
  getOfficialMorningEventDefs().filter(
    (event): event is Readonly<Extract<MorningEventContentDef, { kind: 'narration' }>> =>
      event.kind === 'narration'
  )

export const getOfficialMorningChoiceEventDefs = ():
  readonly Readonly<Extract<MorningEventContentDef, { kind: 'choice' }>>[] =>
  getOfficialMorningEventDefs().filter(
    (event): event is Readonly<Extract<MorningEventContentDef, { kind: 'choice' }>> => event.kind === 'choice'
  )

export const getOfficialMorningEasterEggEventDefs = ():
  readonly Readonly<Extract<MorningEventContentDef, { kind: 'easter_egg' }>>[] =>
  getOfficialMorningEventDefs().filter(
    (event): event is Readonly<Extract<MorningEventContentDef, { kind: 'easter_egg' }>> =>
      event.kind === 'easter_egg'
  )

export const getOfficialSeasonEventDef = (id: string): Readonly<SeasonEventContentDef> | undefined => {
  const contentId = toSeasonEventQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<SeasonEventContentDef>(toOfficialRegistryTypeId('season_event')).get(contentId)
    : undefined
}

export const getOfficialSeasonEventDefs = (): readonly Readonly<SeasonEventContentDef>[] =>
  getOfficialRegistrySet().get<SeasonEventContentDef>(toOfficialRegistryTypeId('season_event')).values()

export const getOfficialQuestTemplateDef = (id: string): Readonly<QuestTemplateContentDef> | undefined => {
  const contentId = toQuestTemplateQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<QuestTemplateContentDef>(toOfficialRegistryTypeId('quest_template')).get(contentId)
    : undefined
}

export const getOfficialQuestTemplateDefs = (): readonly Readonly<QuestTemplateContentDef>[] =>
  getOfficialRegistrySet().get<QuestTemplateContentDef>(toOfficialRegistryTypeId('quest_template')).values()

export const getOfficialBoardQuestTemplateDefs = (): readonly Readonly<Extract<QuestTemplateContentDef, { kind: 'board' }>>[] =>
  getOfficialQuestTemplateDefs().filter(
    (template): template is Readonly<Extract<QuestTemplateContentDef, { kind: 'board' }>> => template.kind === 'board'
  )

export const getOfficialSpecialOrderTemplateDefs = (): readonly Readonly<Extract<QuestTemplateContentDef, { kind: 'special_order' }>>[] =>
  getOfficialQuestTemplateDefs().filter(
    (template): template is Readonly<Extract<QuestTemplateContentDef, { kind: 'special_order' }>> =>
      template.kind === 'special_order'
  )

export const getOfficialFarmMapDef = (id: string): Readonly<FarmMapContentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<FarmMapContentDef>(toOfficialRegistryTypeId('farm_map')).get(contentId)
    : undefined
}

export const getOfficialFarmMapDefs = (): readonly Readonly<FarmMapContentDef>[] =>
  getOfficialRegistrySet().get<FarmMapContentDef>(toOfficialRegistryTypeId('farm_map')).values()

export const getOfficialAnimalBuildingDef = (id: string): Readonly<AnimalBuildingContentDef> | undefined => {
  const contentId = toQueryContentId(id.includes('/') ? id : `animal_building/${id}`)
  return contentId
    ? getOfficialRegistrySet().get<AnimalBuildingContentDef>(toOfficialRegistryTypeId('animal_building')).get(contentId)
    : undefined
}

export const getOfficialAnimalBuildingDefs = (): readonly Readonly<AnimalBuildingContentDef>[] =>
  getOfficialRegistrySet().get<AnimalBuildingContentDef>(toOfficialRegistryTypeId('animal_building')).values()

export const getOfficialAnimalIncubationDef = (id: string): Readonly<AnimalIncubationContentDef> | undefined => {
  const contentId = toQueryContentId(id.includes('/') ? id : `animal_incubation/${id}`)
  return contentId
    ? getOfficialRegistrySet().get<AnimalIncubationContentDef>(toOfficialRegistryTypeId('animal_incubation')).get(contentId)
    : undefined
}

export const getOfficialAnimalIncubationDefs = (): readonly Readonly<AnimalIncubationContentDef>[] =>
  getOfficialRegistrySet().get<AnimalIncubationContentDef>(toOfficialRegistryTypeId('animal_incubation')).values()

export const getOfficialToolUpgradeDef = (id: string): Readonly<ToolUpgradeContentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<ToolUpgradeContentDef>(toOfficialRegistryTypeId('tool_upgrade')).get(contentId)
    : undefined
}

export const getOfficialToolUpgradeDefs = (): readonly Readonly<ToolUpgradeContentDef>[] =>
  getOfficialRegistrySet().get<ToolUpgradeContentDef>(toOfficialRegistryTypeId('tool_upgrade')).values()

const toLegacyAnimalDef = (animal: Readonly<AnimalContentDef>): LegacyAnimalDef => ({
  type: getLocalContentId(animal.id) as LegacyAnimalDef['type'],
  name: animal.name.fallback,
  building: animal.building as LegacyAnimalDef['building'],
  cost: animal.cost,
  productId: animal.productItemId ? getLocalContentId(animal.productItemId) : '',
  productName: animal.productName?.fallback ?? '',
  produceDays: animal.produceDays,
  friendship: { ...animal.friendship }
})

export const getOfficialAnimalByType = (type: string): LegacyAnimalDef | undefined => {
  const animal = getOfficialAnimalDef(type)
  return animal ? toLegacyAnimalDef(animal) : undefined
}

export const getOfficialAnimalDefsAsLegacy = (): readonly LegacyAnimalDef[] =>
  getOfficialAnimalDefs().map(toLegacyAnimalDef)

export const getOfficialAnimalDefsByBuilding = (building: AnimalBuildingType): readonly LegacyAnimalDef[] =>
  getOfficialAnimalDefs()
    .filter(animal => animal.building === building)
    .map(toLegacyAnimalDef)

const toLegacyAnimalFeedDef = (feed: Readonly<AnimalFeedContentDef>): LegacyAnimalFeedDef => ({
  id: getLocalContentId(feed.id),
  name: feed.name.fallback,
  price: feed.price,
  description: feed.description.fallback
})

export const getOfficialAnimalFeedById = (id: string): LegacyAnimalFeedDef | undefined => {
  const feed = getOfficialAnimalFeedDef(id)
  return feed ? toLegacyAnimalFeedDef(feed) : undefined
}

export const getOfficialAnimalFeedDefsAsLegacy = (): readonly LegacyAnimalFeedDef[] =>
  getOfficialAnimalFeedDefs().map(toLegacyAnimalFeedDef)

const toLegacyWalletItemDef = (item: Readonly<WalletItemContentDef>): LegacyWalletItemDef => ({
  id: getLocalContentId(item.id),
  name: item.name.fallback,
  description: item.description.fallback,
  effect: { ...item.effect },
  unlockCondition: item.unlockCondition.fallback
})

export const getOfficialWalletItemById = (id: string): LegacyWalletItemDef | undefined => {
  const item = getOfficialWalletItemDef(id)
  return item ? toLegacyWalletItemDef(item) : undefined
}

export const getOfficialWalletItemsAsLegacy = (): readonly LegacyWalletItemDef[] =>
  getOfficialWalletItemDefs().map(toLegacyWalletItemDef)

const toLegacyMuseumCategory = (category: Readonly<MuseumCategoryContentDef>) => ({
  key: category.key as LegacyMuseumCategory,
  label: category.label.fallback
})

export const getOfficialMuseumCategoriesAsLegacy = () =>
  getOfficialMuseumCategoryDefs().map(toLegacyMuseumCategory)

const toLegacyMuseumItemDef = (item: Readonly<MuseumItemContentDef>): LegacyMuseumItemDef => ({
  id: getLocalContentId(item.itemId),
  name: item.name.fallback,
  category: item.category as LegacyMuseumItemDef['category'],
  sourceHint: item.sourceHint.fallback
})

export const getOfficialMuseumItemById = (id: string): LegacyMuseumItemDef | undefined => {
  const item = getOfficialMuseumItemDef(id)
  return item ? toLegacyMuseumItemDef(item) : undefined
}

export const getOfficialMuseumItemsAsLegacy = (): readonly LegacyMuseumItemDef[] =>
  getOfficialMuseumItemDefs().map(toLegacyMuseumItemDef)

const toLegacyMuseumMilestoneReward = (
  reward: Readonly<MuseumMilestoneContentDef['reward']>
): LegacyMuseumMilestone['reward'] => ({
  ...(reward.money !== undefined ? { money: reward.money } : {}),
  ...(reward.items
    ? {
        items: reward.items.map(item => ({
          itemId: getLocalContentId(item.itemId),
          quantity: item.quantity
        }))
      }
    : {})
})

const toLegacyMuseumMilestone = (milestone: Readonly<MuseumMilestoneContentDef>): LegacyMuseumMilestone => ({
  count: milestone.count,
  name: milestone.name.fallback,
  reward: toLegacyMuseumMilestoneReward(milestone.reward)
})

export const getOfficialMuseumMilestoneByCount = (count: number): LegacyMuseumMilestone | undefined => {
  const milestone = getOfficialMuseumMilestoneDef(count)
  return milestone ? toLegacyMuseumMilestone(milestone) : undefined
}

export const getOfficialMuseumMilestonesAsLegacy = (): readonly LegacyMuseumMilestone[] =>
  getOfficialMuseumMilestoneDefs().map(toLegacyMuseumMilestone)

const toLegacyGuildGoalReward = (
  reward: Readonly<GuildGoalContentDef['reward']>
): LegacyGuildGoalDef['reward'] => ({
  ...(reward.money !== undefined ? { money: reward.money } : {}),
  ...(reward.items
    ? {
        items: reward.items.map(item => ({
          itemId: getLocalContentId(item.itemId),
          quantity: item.quantity
        }))
      }
    : {})
})

const toLegacyGuildGoalDef = (goal: Readonly<GuildGoalContentDef>): LegacyGuildGoalDef => ({
  monsterId: getLocalContentId(goal.monsterId),
  monsterName: goal.monsterName.fallback,
  zone: goal.zone,
  killTarget: goal.killTarget,
  reward: toLegacyGuildGoalReward(goal.reward),
  description: goal.description.fallback
})

export const getOfficialGuildGoalByMonsterId = (monsterId: string): LegacyGuildGoalDef | undefined => {
  const contentId = toQueryContentId(monsterId)
  const goal = contentId
    ? getOfficialGuildGoalDefs().find(candidate => candidate.monsterId === contentId)
    : undefined
  return goal ? toLegacyGuildGoalDef(goal) : undefined
}

export const getOfficialGuildGoalsAsLegacy = (): readonly LegacyGuildGoalDef[] =>
  getOfficialGuildGoalDefs().map(toLegacyGuildGoalDef)

const toLegacyGuildDonationDef = (donation: Readonly<GuildDonationContentDef>): LegacyGuildDonationDef => ({
  itemId: getLocalContentId(donation.itemId),
  points: donation.points
})

export const getOfficialGuildDonationByItemId = (itemId: string): LegacyGuildDonationDef | undefined => {
  const contentId = toQueryContentId(itemId)
  const donation = contentId
    ? getOfficialGuildDonationDefs().find(candidate => candidate.itemId === contentId)
    : undefined
  return donation ? toLegacyGuildDonationDef(donation) : undefined
}

export const getOfficialGuildDonationsAsLegacy = (): readonly LegacyGuildDonationDef[] =>
  getOfficialGuildDonationDefs().map(toLegacyGuildDonationDef)

const toLegacyGuildLevelDef = (level: Readonly<GuildLevelContentDef>): LegacyGuildLevelDef => ({
  level: level.level,
  expRequired: level.expRequired
})

export const getOfficialGuildLevelByLevel = (level: number): LegacyGuildLevelDef | undefined => {
  const guildLevel = getOfficialGuildLevelDef(level)
  return guildLevel ? toLegacyGuildLevelDef(guildLevel) : undefined
}

export const getOfficialGuildLevelsAsLegacy = (): readonly LegacyGuildLevelDef[] =>
  getOfficialGuildLevelDefs().map(toLegacyGuildLevelDef)

const getLocalNpcId = (contentId: string): string => {
  const localId = getLocalContentId(contentId)
  return localId.startsWith('npc/') ? localId.slice('npc/'.length) : localId
}

const toLegacyNpcDialogues = (
  dialogues: Readonly<NpcContentDef['dialogues']>
): LegacyNpcDef['dialogues'] => ({
  stranger: dialogues.stranger.map(line => line.fallback),
  acquaintance: dialogues.acquaintance.map(line => line.fallback),
  friendly: dialogues.friendly.map(line => line.fallback),
  bestFriend: dialogues.bestFriend.map(line => line.fallback)
})

const toLegacyNpcDef = (npc: Readonly<NpcContentDef>): LegacyNpcDef => ({
  id: getLocalNpcId(npc.id),
  name: npc.name.fallback,
  gender: npc.gender,
  role: npc.role.fallback,
  personality: npc.personality.fallback,
  lovedItems: npc.lovedItems.map(getLocalContentId),
  likedItems: npc.likedItems.map(getLocalContentId),
  hatedItems: npc.hatedItems.map(getLocalContentId),
  dialogues: toLegacyNpcDialogues(npc.dialogues),
  ...(npc.marriageable !== undefined ? { marriageable: npc.marriageable } : {}),
  ...(npc.heartEventIds ? { heartEventIds: npc.heartEventIds.map(getLocalHeartEventId) } : {}),
  ...(npc.datingDialogues ? { datingDialogues: npc.datingDialogues.map(line => line.fallback) } : {}),
  ...(npc.zhijiDialogues ? { zhijiDialogues: npc.zhijiDialogues.map(line => line.fallback) } : {}),
  ...(npc.zhijiHeartEventIds ? { zhijiHeartEventIds: npc.zhijiHeartEventIds.map(getLocalHeartEventId) } : {}),
  ...(npc.birthday ? { birthday: { ...npc.birthday } } : {})
})

export const getOfficialNpcById = (id: string): LegacyNpcDef | undefined => {
  const npc = getOfficialNpcDef(id)
  return npc ? toLegacyNpcDef(npc) : undefined
}

export const getOfficialNpcsAsLegacy = (): readonly LegacyNpcDef[] =>
  getOfficialNpcDefs().map(toLegacyNpcDef)

const getLocalHeartEventId = (contentId: string): string => {
  const localId = getLocalContentId(contentId)
  return localId.startsWith('heart_event/') ? localId.slice('heart_event/'.length) : localId
}

const getLocalHeartEventOwnerId = (contentId: string): string => {
  const localId = getLocalContentId(contentId)
  if (localId.startsWith('npc/')) return localId.slice('npc/'.length)
  if (localId.startsWith('hidden_npc/')) return localId.slice('hidden_npc/'.length)
  return localId
}

const isHeartEventForOwnerType = (
  event: Readonly<HeartEventContentDef>,
  ownerType: 'npc' | 'hidden_npc'
): boolean =>
  getLocalContentId(event.npcId).startsWith(`${ownerType}/`)

const toHeartEventOwnerQueryContentId = (
  id: string,
  ownerType: 'npc' | 'hidden_npc'
) => toQueryContentId(id.includes(':') || id.includes('/') ? id : `${ownerType}/${id}`)

const toLegacyHeartEventScene = (
  scene: Readonly<HeartEventContentDef['scenes'][number]>
): LegacyHeartEventDef['scenes'][number] => ({
  text: scene.text.fallback,
  ...(scene.choices
    ? {
        choices: scene.choices.map(choice => ({
          text: choice.text.fallback,
          friendshipChange: choice.friendshipChange,
          response: choice.response.fallback
        }))
      }
    : {})
})

const toLegacyHeartEventDef = (event: Readonly<HeartEventContentDef>): LegacyHeartEventDef => ({
  id: getLocalHeartEventId(event.id),
  npcId: getLocalHeartEventOwnerId(event.npcId),
  requiredFriendship: event.requiredFriendship,
  ...(event.requiresZhiji !== undefined ? { requiresZhiji: event.requiresZhiji } : {}),
  title: event.title.fallback,
  scenes: event.scenes.map(toLegacyHeartEventScene)
})

export const getOfficialHeartEventById = (id: string): LegacyHeartEventDef | undefined => {
  const event = getOfficialHeartEventDef(id)
  return event && isHeartEventForOwnerType(event, 'npc') ? toLegacyHeartEventDef(event) : undefined
}

export const getOfficialHeartEventsForNpc = (npcId: string): readonly LegacyHeartEventDef[] => {
  const contentId = toHeartEventOwnerQueryContentId(npcId, 'npc')
  if (!contentId) return []
  return getOfficialHeartEventDefs()
    .filter(event => event.npcId === contentId)
    .map(toLegacyHeartEventDef)
}

export const getOfficialHiddenNpcHeartEventById = (id: string): LegacyHeartEventDef | undefined => {
  const event = getOfficialHeartEventDef(id)
  return event && isHeartEventForOwnerType(event, 'hidden_npc') ? toLegacyHeartEventDef(event) : undefined
}

export const getOfficialHiddenNpcHeartEvents = (npcId: string): readonly LegacyHeartEventDef[] => {
  const contentId = toHeartEventOwnerQueryContentId(npcId, 'hidden_npc')
  if (!contentId) return []
  return getOfficialHeartEventDefs()
    .filter(event => event.npcId === contentId)
    .map(toLegacyHeartEventDef)
}

const getLocalStoryQuestId = (contentId: string): string => {
  const localId = getLocalContentId(contentId)
  return localId.startsWith('story_quest/') ? localId.slice('story_quest/'.length) : localId
}

const getLocalHiddenNpcId = (contentId: string): string => {
  const localId = getLocalContentId(contentId)
  return localId.startsWith('hidden_npc/') ? localId.slice('hidden_npc/'.length) : localId
}

const toLegacyHiddenNpcScene = (
  scene: Readonly<HiddenNpcContentDef['discoverySteps'][number]['scenes'][number]>
): LegacyHiddenNpcDef['discoverySteps'][number]['scenes'][number] => ({
  text: scene.text.fallback,
  ...(scene.choices
    ? {
        choices: scene.choices.map(choice => ({
          text: choice.text.fallback,
          friendshipChange: choice.friendshipChange,
          response: choice.response.fallback
        }))
      }
    : {})
})

const toLegacyHiddenNpcDiscoveryCondition = (
  condition: Readonly<HiddenNpcContentDef['discoverySteps'][number]['conditions'][number]>
): LegacyHiddenNpcDiscoveryCondition => {
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
        itemId: getLocalContentId(condition.itemId),
        ...(condition.quantity !== undefined ? { quantity: condition.quantity } : {})
      }
    case 'skill':
      return { type: 'skill', skillType: condition.skillType, minLevel: condition.minLevel }
    case 'npcFriendship':
      return {
        type: 'npcFriendship',
        npcId: getLocalNpcId(condition.npcId),
        minFriendship: condition.minFriendship
      }
    case 'questComplete':
      return { type: 'questComplete', questId: getLocalStoryQuestId(condition.questId) }
    case 'mineFloor':
      return { type: 'mineFloor', minFloor: condition.minFloor }
    case 'fishCaught':
      return { type: 'fishCaught', fishId: getLocalContentId(condition.fishId) }
    case 'money':
      return { type: 'money', minAmount: condition.minAmount }
    case 'yearMin':
      return { type: 'yearMin', year: condition.year }
    case 'day':
      return { type: 'day', day: condition.day }
  }
}

const toLegacyHiddenNpcDialogues = (
  dialogues: Readonly<HiddenNpcContentDef['dialogues']>
): LegacyHiddenNpcDef['dialogues'] => ({
  wary: dialogues.wary.map(line => line.fallback),
  curious: dialogues.curious.map(line => line.fallback),
  trusting: dialogues.trusting.map(line => line.fallback),
  devoted: dialogues.devoted.map(line => line.fallback),
  eternal: dialogues.eternal.map(line => line.fallback)
})

const toLegacyHiddenNpcCraftCost = (
  costs: Readonly<HiddenNpcContentDef['courtshipCraftCost'] | HiddenNpcContentDef['bondCraftCost']>
): LegacyHiddenNpcDef['courtshipCraftCost'] =>
  costs.map(cost => ({
    itemId: getLocalContentId(cost.itemId),
    quantity: cost.quantity
  }))

const toLegacyHiddenNpcDef = (npc: Readonly<HiddenNpcContentDef>): LegacyHiddenNpcDef => ({
  id: getLocalHiddenNpcId(npc.id),
  name: npc.name.fallback,
  trueName: npc.trueName.fallback,
  gender: npc.gender,
  title: npc.title.fallback,
  origin: npc.origin.fallback,
  personality: npc.personality.fallback,
  discoverySteps: npc.discoverySteps.map(step => ({
    id: step.id,
    phase: step.phase,
    conditions: step.conditions.map(toLegacyHiddenNpcDiscoveryCondition),
    scenes: step.scenes.map(toLegacyHiddenNpcScene),
    ...(step.logMessage ? { logMessage: step.logMessage.fallback } : {})
  })),
  resonantOfferings: npc.resonantOfferings.map(getLocalContentId),
  pleasedOfferings: npc.pleasedOfferings.map(getLocalContentId),
  repelledOfferings: npc.repelledOfferings.map(getLocalContentId),
  dialogues: toLegacyHiddenNpcDialogues(npc.dialogues),
  interactionType: npc.interactionType,
  bondable: npc.bondable,
  courtshipItemId: getLocalContentId(npc.courtshipItemId),
  bondItemId: getLocalContentId(npc.bondItemId),
  courtshipThreshold: npc.courtshipThreshold,
  bondThreshold: npc.bondThreshold,
  heartEventIds: npc.heartEventIds.map(getLocalHeartEventId),
  courtshipDialogues: npc.courtshipDialogues.map(line => line.fallback),
  bondBonuses: npc.bondBonuses.map(bonus => ({ ...bonus })),
  abilities: npc.abilities.map(ability => ({
    id: ability.id,
    affinityRequired: ability.affinityRequired,
    name: ability.name.fallback,
    description: ability.description.fallback,
    ...(ability.passive ? { passive: { ...ability.passive } } : {})
  })),
  courtshipCraftCost: toLegacyHiddenNpcCraftCost(npc.courtshipCraftCost),
  bondCraftCost: toLegacyHiddenNpcCraftCost(npc.bondCraftCost),
  manifestationDay: { ...npc.manifestationDay }
})

export const getOfficialHiddenNpcById = (id: string): LegacyHiddenNpcDef | undefined => {
  const npc = getOfficialHiddenNpcDef(id)
  return npc ? toLegacyHiddenNpcDef(npc) : undefined
}

export const getOfficialHiddenNpcsAsLegacy = (): readonly LegacyHiddenNpcDef[] =>
  getOfficialHiddenNpcDefs().map(toLegacyHiddenNpcDef)

const toLegacyStoryQuestObjective = (
  objective: Readonly<StoryQuestContentDef['objectives'][number]>
): LegacyMainQuestDef['objectives'][number] => {
  const label = objective.label.fallback
  switch (objective.type) {
    case 'skillLevel':
      return {
        type: 'skillLevel',
        label,
        ...(objective.skillType ? { skillType: objective.skillType } : {}),
        target: objective.target
      }
    case 'npcFriendship':
      return {
        type: 'npcFriendship',
        label,
        npcId: objective.npcId === '_any' ? '_any' : getLocalNpcId(objective.npcId),
        friendshipLevel: objective.friendshipLevel
      }
    case 'npcAllFriendly':
      return {
        type: 'npcAllFriendly',
        label,
        friendshipLevel: objective.friendshipLevel
      }
    case 'deliverItem':
      return {
        type: 'deliverItem',
        label,
        itemId: getLocalContentId(objective.itemId),
        itemQuantity: objective.itemQuantity
      }
    case 'married':
      return { type: 'married', label }
    case 'hasChild':
      return { type: 'hasChild', label }
    default:
      return {
        type: objective.type,
        label,
        target: objective.target
      } as LegacyMainQuestDef['objectives'][number]
  }
}

const toLegacyStoryQuestDef = (quest: Readonly<StoryQuestContentDef>): LegacyMainQuestDef => ({
  id: getLocalStoryQuestId(quest.id),
  chapter: quest.chapter,
  order: quest.order,
  title: quest.title.fallback,
  description: quest.description.fallback,
  npcId: getLocalNpcId(quest.npcId),
  objectives: quest.objectives.map(toLegacyStoryQuestObjective),
  moneyReward: quest.moneyReward,
  ...(quest.friendshipReward
    ? {
        friendshipReward: quest.friendshipReward.map(reward => ({
          npcId: getLocalNpcId(reward.npcId),
          amount: reward.amount
        }))
      }
    : {}),
  ...(quest.itemReward
    ? {
        itemReward: quest.itemReward.map(reward => ({
          itemId: getLocalContentId(reward.itemId),
          quantity: reward.quantity
        }))
      }
    : {})
})

export const getOfficialStoryQuestById = (id: string): LegacyMainQuestDef | undefined => {
  const quest = getOfficialStoryQuestDef(id)
  return quest ? toLegacyStoryQuestDef(quest) : undefined
}

export const getOfficialStoryQuestsAsLegacy = (): readonly LegacyMainQuestDef[] =>
  getOfficialStoryQuestDefs().map(toLegacyStoryQuestDef)

export const getOfficialStoryQuestByOrder = (
  chapter: number,
  order: number
): LegacyMainQuestDef | undefined => {
  const quest = getOfficialStoryQuestDefs().find(candidate => candidate.chapter === chapter && candidate.order === order)
  return quest ? toLegacyStoryQuestDef(quest) : undefined
}

export const getOfficialNextStoryQuest = (currentId: string): LegacyMainQuestDef | undefined => {
  const contentId = toStoryQuestQueryContentId(currentId)
  if (!contentId) return undefined
  const quests = getOfficialStoryQuestDefs()
  const index = quests.findIndex(candidate => candidate.id === contentId)
  const nextQuest = index >= 0 ? quests[index + 1] : undefined
  return nextQuest ? toLegacyStoryQuestDef(nextQuest) : undefined
}

export const getOfficialChapterStoryQuests = (chapter: number): readonly LegacyMainQuestDef[] =>
  getOfficialStoryQuestDefs()
    .filter(quest => quest.chapter === chapter)
    .map(toLegacyStoryQuestDef)

export const getOfficialFirstStoryQuest = (): LegacyMainQuestDef | undefined => {
  const firstQuest = getOfficialStoryQuestDefs()[0]
  return firstQuest ? toLegacyStoryQuestDef(firstQuest) : undefined
}

const toLegacyAchievementReward = (
  reward: Readonly<AchievementContentDef['reward']>
): LegacyAchievementDef['reward'] => ({
  ...(reward.money !== undefined ? { money: reward.money } : {}),
  ...(reward.items
    ? {
        items: reward.items.map(item => ({
          itemId: getLocalContentId(item.itemId),
          quantity: item.quantity
        }))
      }
    : {})
})

const toLegacyAchievementCondition = (
  condition: Readonly<AchievementContentDef['condition']>
): LegacyAchievementDef['condition'] =>
  condition.type === 'itemDiscovered'
    ? { type: 'itemDiscovered', itemId: getLocalContentId(condition.itemId) }
    : { ...condition } as LegacyAchievementDef['condition']

const toLegacyAchievementDef = (achievement: Readonly<AchievementContentDef>): LegacyAchievementDef => ({
  id: getLocalContentId(achievement.id).replace(/^achievement\//, ''),
  name: achievement.name.fallback,
  description: achievement.description.fallback,
  condition: toLegacyAchievementCondition(achievement.condition),
  reward: toLegacyAchievementReward(achievement.reward)
})

export const getOfficialAchievementById = (id: string): LegacyAchievementDef | undefined => {
  const achievement = getOfficialAchievementDef(id)
  return achievement ? toLegacyAchievementDef(achievement) : undefined
}

export const getOfficialAchievementsAsLegacy = (): readonly LegacyAchievementDef[] =>
  getOfficialAchievementDefs().map(toLegacyAchievementDef)

const toLegacyCommunityBundleReward = (
  reward: Readonly<CommunityBundleContentDef['reward']>
): LegacyCommunityBundleDef['reward'] => ({
  ...(reward.money !== undefined ? { money: reward.money } : {}),
  ...(reward.items
    ? {
        items: reward.items.map(item => ({
          itemId: getLocalContentId(item.itemId),
          quantity: item.quantity
        }))
      }
    : {}),
  description: reward.description.fallback
})

const toLegacyCommunityBundleDef = (
  bundle: Readonly<CommunityBundleContentDef>
): LegacyCommunityBundleDef => ({
  id: getLocalContentId(bundle.id).replace(/^community_bundle\//, ''),
  name: bundle.name.fallback,
  description: bundle.description.fallback,
  requiredItems: bundle.requiredItems.map(item => ({
    itemId: getLocalContentId(item.itemId),
    quantity: item.quantity
  })),
  reward: toLegacyCommunityBundleReward(bundle.reward)
})

export const getOfficialCommunityBundleById = (id: string): LegacyCommunityBundleDef | undefined => {
  const bundle = getOfficialCommunityBundleDef(id)
  return bundle ? toLegacyCommunityBundleDef(bundle) : undefined
}

export const getOfficialCommunityBundlesAsLegacy = (): readonly LegacyCommunityBundleDef[] =>
  getOfficialCommunityBundleDefs().map(toLegacyCommunityBundleDef)

const toLegacySecretNoteReward = (
  reward: Readonly<NonNullable<SecretNoteContentDef['reward']>>
): NonNullable<LegacySecretNoteDef['reward']> => ({
  ...(reward.money !== undefined ? { money: reward.money } : {}),
  ...(reward.items
    ? {
        items: reward.items.map(item => ({
          itemId: getLocalContentId(item.itemId),
          quantity: item.quantity
        }))
      }
    : {})
})

const toLegacySecretNoteDef = (note: Readonly<SecretNoteContentDef>): LegacySecretNoteDef => ({
  id: note.noteId,
  type: note.type,
  title: note.title.fallback,
  content: note.content.fallback,
  usable: note.usable,
  ...(note.reward ? { reward: toLegacySecretNoteReward(note.reward) } : {})
})

export const getOfficialSecretNoteById = (id: number | string): LegacySecretNoteDef | undefined => {
  const note = getOfficialSecretNoteDef(id)
  return note ? toLegacySecretNoteDef(note) : undefined
}

export const getOfficialSecretNotesAsLegacy = (): readonly LegacySecretNoteDef[] =>
  getOfficialSecretNoteDefs().map(toLegacySecretNoteDef)

const toLegacyMorningTipDef = (tip: Readonly<TutorialContentDef>): LegacyMorningTipDef => ({
  id: tip.tipId,
  priority: tip.priority,
  conditionKey: tip.conditionKey,
  message: tip.message.fallback
})

export const getOfficialTutorialById = (id: string): LegacyMorningTipDef | undefined => {
  const tip = getOfficialTutorialDef(id)
  return tip ? toLegacyMorningTipDef(tip) : undefined
}

export const getOfficialMorningTipsAsLegacy = (): readonly LegacyMorningTipDef[] =>
  getOfficialTutorialDefs().map(toLegacyMorningTipDef)

const toLegacyMorningEffect = (effect: Readonly<MorningEventEffect>): LegacyMorningEffect => {
  if (effect.type === 'gainItem') {
    return {
      type: effect.type,
      itemId: getLocalContentId(effect.itemId),
      qty: effect.qty
    }
  }
  return effect
}

const toLegacyMorningNarration = (
  event: Readonly<Extract<MorningEventContentDef, { kind: 'narration' }>>
): LegacyMorningNarration => ({
  message: event.message.fallback,
  ...(event.effect ? { effect: toLegacyMorningEffect(event.effect) } : {})
})

const toLegacyMorningChoiceEvent = (
  event: Readonly<Extract<MorningEventContentDef, { kind: 'choice' }>>
): LegacyMorningChoiceEvent => ({
  id: event.eventId.replace(/^choice\//, ''),
  message: event.message.fallback,
  choices: event.choices.map(choice => ({
    label: choice.label.fallback,
    result: choice.result.fallback,
    ...(choice.effect ? { effect: toLegacyMorningEffect(choice.effect) } : {})
  }))
})

const toLegacyMorningEasterEgg = (
  event: Readonly<Extract<MorningEventContentDef, { kind: 'easter_egg' }>>
): LegacyMorningEasterEgg => ({
  message: event.message.fallback,
  ...(event.effect ? { effect: toLegacyMorningEffect(event.effect) } : {})
})

export const getOfficialMorningNarrationsAsLegacy = (): readonly LegacyMorningNarration[] =>
  getOfficialMorningNarrationEventDefs().map(toLegacyMorningNarration)

export const getOfficialMorningChoiceEventsAsLegacy = (): readonly LegacyMorningChoiceEvent[] =>
  getOfficialMorningChoiceEventDefs().map(toLegacyMorningChoiceEvent)

export const getOfficialMorningEasterEggsAsLegacy = (): readonly LegacyMorningEasterEgg[] =>
  getOfficialMorningEasterEggEventDefs().map(toLegacyMorningEasterEgg)

const toLegacySeasonEventEffects = (
  effects: Readonly<SeasonEventContentDef['effects']>
): LegacySeasonEventDef['effects'] => ({
  ...(effects.friendshipBonus !== undefined ? { friendshipBonus: effects.friendshipBonus } : {}),
  ...(effects.moneyReward !== undefined ? { moneyReward: effects.moneyReward } : {}),
  ...(effects.itemReward
    ? {
        itemReward: effects.itemReward.map(item => ({
          itemId: getLocalContentId(item.itemId),
          quantity: item.quantity
        }))
      }
    : {}),
  ...(effects.staminaBonus !== undefined ? { staminaBonus: effects.staminaBonus } : {})
})

const toLegacySeasonEventDef = (event: Readonly<SeasonEventContentDef>): LegacySeasonEventDef => ({
  id: event.eventId,
  name: event.name.fallback,
  season: event.season,
  day: event.day,
  description: event.description.fallback,
  effects: toLegacySeasonEventEffects(event.effects),
  narrative: event.narrative.map(line => line.fallback),
  ...(event.interactive !== undefined ? { interactive: event.interactive } : {}),
  ...(event.festivalType !== undefined ? { festivalType: event.festivalType } : {})
})

export const getOfficialSeasonEventById = (id: string): LegacySeasonEventDef | undefined => {
  const event = getOfficialSeasonEventDef(id)
  return event ? toLegacySeasonEventDef(event) : undefined
}

export const getOfficialSeasonEventsAsLegacy = (): readonly LegacySeasonEventDef[] =>
  getOfficialSeasonEventDefs().map(toLegacySeasonEventDef)

export const getOfficialTodaySeasonEvent = (season: Season, day: number): LegacySeasonEventDef | undefined => {
  const event = getOfficialSeasonEventDefs().find(candidate => candidate.season === season && candidate.day === day)
  return event ? toLegacySeasonEventDef(event) : undefined
}

const toLegacyQuestTemplateTarget = (
  target: Readonly<Extract<QuestTemplateContentDef, { kind: 'board' }>['targets'][number]>
): LegacyQuestTemplateDef['targets'][number] => ({
  itemId: getLocalContentId(target.itemId),
  name: target.name.fallback,
  minQty: target.minQty,
  maxQty: target.maxQty,
  seasons: [...target.seasons] as LegacyQuestTemplateDef['targets'][number]['seasons'],
  unitPrice: target.unitPrice
})

const toLegacyQuestTemplateDef = (
  template: Readonly<Extract<QuestTemplateContentDef, { kind: 'board' }>>
): LegacyQuestTemplateDef => ({
  type: template.type,
  targets: template.targets.map(toLegacyQuestTemplateTarget),
  npcPool: template.npcPool.map(getLocalNpcId),
  rewardMultiplier: template.rewardMultiplier,
  friendshipReward: template.friendshipReward
})

const toLegacySpecialOrderTemplate = (
  template: Readonly<Extract<QuestTemplateContentDef, { kind: 'special_order' }>>
): LegacySpecialOrderTemplate => ({
  name: template.name.fallback,
  targetItemId: getLocalContentId(template.targetItemId),
  targetItemName: template.targetItemName.fallback,
  quantity: template.quantity,
  days: template.days,
  moneyReward: template.moneyReward,
  itemReward: template.itemReward.map(item => ({
    itemId: getLocalContentId(item.itemId),
    quantity: item.quantity
  })),
  seasons: [...template.seasons] as LegacySpecialOrderTemplate['seasons'],
  npcId: getLocalNpcId(template.npcId),
  tier: template.tier
})

export const getOfficialQuestTemplatesAsLegacy = (): readonly LegacyQuestTemplateDef[] =>
  getOfficialBoardQuestTemplateDefs().map(toLegacyQuestTemplateDef)

export const getOfficialSpecialOrderTemplatesAsLegacy = (): readonly LegacySpecialOrderTemplate[] =>
  getOfficialSpecialOrderTemplateDefs().map(toLegacySpecialOrderTemplate)

const toLegacyFarmMapDef = (map: Readonly<FarmMapContentDef>): LegacyFarmMapDef => ({
  type: map.type as LegacyFarmMapDef['type'],
  name: map.name.fallback,
  description: map.description.fallback,
  bonus: map.bonus.fallback
})

export const getOfficialFarmMapByType = (type: string): LegacyFarmMapDef | undefined => {
  const map = getOfficialFarmMapDef(type)
  return map ? toLegacyFarmMapDef(map) : undefined
}

export const getOfficialFarmMapsAsLegacy = (): readonly LegacyFarmMapDef[] =>
  getOfficialFarmMapDefs().map(toLegacyFarmMapDef)

const toLegacyAnimalBuildingMaterial = (material: Readonly<AnimalBuildingContentDef['materialCost'][number]>) => ({
  itemId: getLocalContentId(material.itemId),
  quantity: material.quantity
})

const toLegacyAnimalBuildingUpgradeDef = (
  building: Readonly<AnimalBuildingContentDef>,
  upgrade: Readonly<AnimalBuildingContentDef['upgrades'][number]>
): LegacyAnimalBuildingUpgradeDef => ({
  type: building.building as LegacyAnimalBuildingUpgradeDef['type'],
  level: upgrade.level,
  name: upgrade.name.fallback,
  capacity: upgrade.capacity,
  cost: upgrade.cost,
  materialCost: upgrade.materialCost.map(toLegacyAnimalBuildingMaterial)
})

const toLegacyAnimalBuildingDef = (building: Readonly<AnimalBuildingContentDef>): LegacyAnimalBuildingDef => ({
  type: building.building as LegacyAnimalBuildingDef['type'],
  name: building.name.fallback,
  description: building.description.fallback,
  capacity: building.capacity,
  cost: building.cost,
  materialCost: building.materialCost.map(toLegacyAnimalBuildingMaterial)
})

export const getOfficialAnimalBuildingByType = (type: string): LegacyAnimalBuildingDef | undefined => {
  const building = getOfficialAnimalBuildingDefs().find(candidate => candidate.building === type)
  return building ? toLegacyAnimalBuildingDef(building) : undefined
}

export const getOfficialAnimalBuildingDefsAsLegacy = (): readonly LegacyAnimalBuildingDef[] =>
  getOfficialAnimalBuildingDefs().map(toLegacyAnimalBuildingDef)

export const getOfficialAnimalBuildingUpgrade = (
  type: AnimalBuildingType,
  toLevel: number
): LegacyAnimalBuildingUpgradeDef | undefined => {
  const building = getOfficialAnimalBuildingDefs().find(candidate => candidate.building === type)
  const upgrade = building?.upgrades.find(candidate => candidate.level === toLevel)
  return building && upgrade ? toLegacyAnimalBuildingUpgradeDef(building, upgrade) : undefined
}

const toLegacyAnimalIncubationDef = (incubation: Readonly<AnimalIncubationContentDef>): LegacyAnimalIncubationDef => ({
  itemId: getLocalContentId(incubation.itemId),
  animalType: getLocalContentId(incubation.animalId) as LegacyAnimalIncubationDef['animalType'],
  days: incubation.days,
  building: incubation.building as LegacyAnimalIncubationDef['building']
})

const toLegacyAnimalIncubationMapping = (
  incubation: Readonly<AnimalIncubationContentDef>
): LegacyAnimalIncubationMapping => ({
  animalType: getLocalContentId(incubation.animalId) as LegacyAnimalIncubationMapping['animalType'],
  days: incubation.days,
  building: incubation.building as LegacyAnimalIncubationMapping['building']
})

export const getOfficialAnimalIncubationByItemId = (itemId: string): LegacyAnimalIncubationMapping | undefined => {
  const direct = getOfficialAnimalIncubationDef(itemId)
  if (direct) return toLegacyAnimalIncubationMapping(direct)
  const incubation = getOfficialAnimalIncubationDefs().find(candidate => getLocalContentId(candidate.itemId) === itemId)
  return incubation ? toLegacyAnimalIncubationMapping(incubation) : undefined
}

export const getOfficialAnimalIncubationDefsAsLegacy = (): readonly LegacyAnimalIncubationDef[] =>
  getOfficialAnimalIncubationDefs().map(toLegacyAnimalIncubationDef)

export const getOfficialAnimalIncubationMap = (): Record<string, LegacyAnimalIncubationMapping> =>
  Object.fromEntries(
    getOfficialAnimalIncubationDefs().map(incubation => [
      getLocalContentId(incubation.itemId),
      toLegacyAnimalIncubationMapping(incubation)
    ])
  )

export const getOfficialBreedingHybridDef = (id: string): Readonly<BreedingHybridContentDef> | undefined => {
  const contentId = toBreedingHybridQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<BreedingHybridContentDef>(toOfficialRegistryTypeId('breeding_hybrid')).get(contentId)
    : undefined
}

export const getOfficialBreedingHybridDefs = (): readonly Readonly<BreedingHybridContentDef>[] =>
  getOfficialRegistrySet().get<BreedingHybridContentDef>(toOfficialRegistryTypeId('breeding_hybrid')).values()

const toLocalBreedingHybridId = (id: string): string =>
  getLocalContentId(id).replace(/^breeding_hybrid\//, '')

const toLegacyBreedingHybridDef = (hybrid: Readonly<BreedingHybridContentDef>): LegacyHybridDef => ({
  id: toLocalBreedingHybridId(hybrid.id),
  name: hybrid.name.fallback,
  parentCropA: getLocalContentId(hybrid.parentCropA),
  parentCropB: getLocalContentId(hybrid.parentCropB),
  minSweetness: hybrid.minSweetness,
  minYield: hybrid.minYield,
  resultCropId: getLocalContentId(hybrid.resultCropId),
  baseGenetics: { ...hybrid.baseGenetics },
  discoveryText: hybrid.discoveryText.fallback
})

export const getOfficialBreedingHybridById = (id: string): LegacyHybridDef | undefined => {
  const hybrid = getOfficialBreedingHybridDef(id)
  return hybrid ? toLegacyBreedingHybridDef(hybrid) : undefined
}

export const getOfficialBreedingHybridDefsAsLegacy = (): readonly LegacyHybridDef[] =>
  getOfficialBreedingHybridDefs().map(toLegacyBreedingHybridDef)

const toLocalQueryId = (id: string): string => id.includes(':') ? getLocalContentId(id) : id

export const findOfficialBreedingHybridByParents = (
  cropIdA: string,
  cropIdB: string
): LegacyHybridDef | undefined => {
  const parentA = toLocalQueryId(cropIdA)
  const parentB = toLocalQueryId(cropIdB)
  const hybrid = getOfficialBreedingHybridDefs().find(candidate => {
    const candidateParentA = getLocalContentId(candidate.parentCropA)
    const candidateParentB = getLocalContentId(candidate.parentCropB)
    return (
      (candidateParentA === parentA && candidateParentB === parentB) ||
      (candidateParentA === parentB && candidateParentB === parentA)
    )
  })
  return hybrid ? toLegacyBreedingHybridDef(hybrid) : undefined
}

export const getOfficialBreedingHybridTier = (hybridId: string): number => {
  const target = toBreedingHybridQueryContentId(hybridId)
  if (!target) return 1
  let offset = 0
  const hybrids = getOfficialBreedingHybridDefs()
  for (let tier = 0; tier < HYBRID_TIER_COUNTS.length; tier++) {
    const count = HYBRID_TIER_COUNTS[tier]!
    for (let index = 0; index < count; index++) {
      if (hybrids[offset + index]?.id === target) return tier + 1
    }
    offset += count
  }
  return 1
}

export const getOfficialProcessingMachineDef = (id: string): Readonly<ProcessingMachineContentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<ProcessingMachineContentDef>(toOfficialRegistryTypeId('processing_machine')).get(contentId)
    : undefined
}

export const getOfficialProcessingMachineDefs = (): readonly Readonly<ProcessingMachineContentDef>[] =>
  getOfficialRegistrySet().get<ProcessingMachineContentDef>(toOfficialRegistryTypeId('processing_machine')).values()

const toLegacyProcessingMachineDef = (
  machine: Readonly<ProcessingMachineContentDef>
): LegacyProcessingMachineDef => ({
  id: getLocalContentId(machine.id) as LegacyProcessingMachineDef['id'],
  name: machine.name.fallback,
  description: machine.description.fallback,
  craftCost: machine.craftCost.map(material => ({
    itemId: getLocalContentId(material.itemId),
    quantity: material.quantity
  })),
  craftMoney: machine.craftMoney,
  ...(machine.autoCollect === undefined ? {} : { autoCollect: machine.autoCollect })
})

export const getOfficialProcessingMachineById = (id: string): LegacyProcessingMachineDef | undefined => {
  const machine = getOfficialProcessingMachineDef(id)
  return machine ? toLegacyProcessingMachineDef(machine) : undefined
}

export const getOfficialProcessingMachinesAsLegacy = (): readonly LegacyProcessingMachineDef[] =>
  getOfficialProcessingMachineDefs().map(toLegacyProcessingMachineDef)

export const getOfficialProcessingRecipeDef = (id: string): Readonly<ProcessingRecipeContentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<ProcessingRecipeContentDef>(toOfficialRegistryTypeId('processing_recipe')).get(contentId)
    : undefined
}

export const getOfficialProcessingRecipeDefs = (): readonly Readonly<ProcessingRecipeContentDef>[] =>
  getOfficialRegistrySet().get<ProcessingRecipeContentDef>(toOfficialRegistryTypeId('processing_recipe')).values()

const toLegacyProcessingRecipeDef = (
  recipe: Readonly<ProcessingRecipeContentDef>
): LegacyProcessingRecipeDef => ({
  id: getLocalContentId(recipe.id),
  machineType: getLocalContentId(recipe.machineId) as LegacyProcessingRecipeDef['machineType'],
  name: recipe.name.fallback,
  inputItemId: recipe.inputItemId === null ? null : getLocalContentId(recipe.inputItemId),
  inputQuantity: recipe.inputQuantity,
  outputItemId: getLocalContentId(recipe.outputItemId),
  outputQuantity: recipe.outputQuantity,
  processingDays: recipe.processingDays,
  description: recipe.description.fallback
})

export const getOfficialProcessingRecipeById = (id: string): LegacyProcessingRecipeDef | undefined => {
  const recipe = getOfficialProcessingRecipeDef(id)
  return recipe ? toLegacyProcessingRecipeDef(recipe) : undefined
}

export const getOfficialProcessingRecipesAsLegacy = (): readonly LegacyProcessingRecipeDef[] =>
  getOfficialProcessingRecipeDefs().map(toLegacyProcessingRecipeDef)

export const getOfficialProcessingRecipesForMachine = (
  machineType: string
): readonly LegacyProcessingRecipeDef[] => {
  const machineId = toQueryContentId(machineType)
  if (!machineId) return []
  return getOfficialProcessingRecipeDefs()
    .filter(recipe => recipe.machineId === machineId)
    .map(toLegacyProcessingRecipeDef)
}

const toLegacyToolUpgradeCost = (upgrade: Readonly<ToolUpgradeContentDef>): LegacyToolUpgradeCost => ({
  fromTier: upgrade.fromTier,
  toTier: upgrade.toTier,
  money: upgrade.money,
  materials: upgrade.materials.map(material => ({
    itemId: getLocalContentId(material.itemId),
    quantity: material.quantity
  }))
})

export const getOfficialToolUpgradeCost = (
  type: ToolType,
  currentTier: ToolTier
): LegacyToolUpgradeCost | undefined => {
  const upgrade = getOfficialToolUpgradeDefs().find(candidate =>
    candidate.toolType === type && candidate.fromTier === currentTier
  )
  return upgrade ? toLegacyToolUpgradeCost(upgrade) : undefined
}

export const getOfficialToolUpgradeCosts = (): Record<ToolType, LegacyToolUpgradeCost[]> => {
  const costs: Record<ToolType, LegacyToolUpgradeCost[]> = {
    wateringCan: [],
    hoe: [],
    pickaxe: [],
    scythe: [],
    axe: [],
    fishingRod: [],
    pan: []
  }
  for (const upgrade of getOfficialToolUpgradeDefs()) {
    costs[upgrade.toolType].push(toLegacyToolUpgradeCost(upgrade))
  }
  return costs
}

export const getOfficialPondableFishDef = (id: string): Readonly<PondableFishDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<PondableFishDef>(toOfficialRegistryTypeId('pondable_fish')).get(contentId)
    : undefined
}

export const getOfficialPondableFishDefs = (): readonly Readonly<PondableFishDef>[] =>
  getOfficialRegistrySet().get<PondableFishDef>(toOfficialRegistryTypeId('pondable_fish')).values()

const toLegacyPondableFishDef = (fish: Readonly<PondableFishDef>): LegacyPondableFishDef => ({
  fishId: getLocalContentId(fish.fishItemId),
  name: fish.name.fallback,
  maturityDays: fish.maturityDays,
  baseProductionRate: fish.baseProductionRate,
  productItemId: getLocalContentId(fish.productItemId),
  defaultGenetics: { ...fish.defaultGenetics }
})

export const getOfficialPondableFishById = (id: string): LegacyPondableFishDef | undefined => {
  const fish = getOfficialPondableFishDef(id)
  return fish ? toLegacyPondableFishDef(fish) : undefined
}

export const getOfficialPondableFishDefsAsLegacy = (): readonly LegacyPondableFishDef[] =>
  getOfficialPondableFishDefs().map(toLegacyPondableFishDef)

export const getOfficialPondBreedDef = (id: string): Readonly<PondBreedDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<PondBreedDef>(toOfficialRegistryTypeId('pond_breed')).get(contentId)
    : undefined
}

export const getOfficialPondBreedDefs = (): readonly Readonly<PondBreedDef>[] =>
  getOfficialRegistrySet().get<PondBreedDef>(toOfficialRegistryTypeId('pond_breed')).values()

const toLegacyPondBreedDef = (breed: Readonly<PondBreedDef>): LegacyPondBreedDef => ({
  breedId: getLocalContentId(breed.id),
  name: breed.name.fallback,
  generation: breed.generation,
  baseFishId: getLocalContentId(breed.baseFishId),
  parentBreedA: breed.parentBreedA ? getLocalContentId(breed.parentBreedA) : null,
  parentBreedB: breed.parentBreedB ? getLocalContentId(breed.parentBreedB) : null
})

export const getOfficialPondBreedById = (id: string): LegacyPondBreedDef | undefined => {
  const breed = getOfficialPondBreedDef(id)
  return breed ? toLegacyPondBreedDef(breed) : undefined
}

export const getOfficialPondBreedDefsAsLegacy = (): readonly LegacyPondBreedDef[] =>
  getOfficialPondBreedDefs().map(toLegacyPondBreedDef)

export const getOfficialPondBreedsByGeneration = (
  generation: LegacyPondBreedDef['generation']
): readonly LegacyPondBreedDef[] =>
  getOfficialPondBreedDefs()
    .filter(breed => breed.generation === generation)
    .map(toLegacyPondBreedDef)

export const getOfficialPondBreedsBySpecies = (baseFishId: string): readonly LegacyPondBreedDef[] => {
  const contentId = toQueryContentId(baseFishId)
  if (!contentId) return []
  return getOfficialPondBreedDefs()
    .filter(breed => breed.baseFishId === contentId)
    .map(toLegacyPondBreedDef)
}

export const getOfficialGen1PondBreedsForFish = (fishId: string): readonly LegacyPondBreedDef[] =>
  getOfficialPondBreedsBySpecies(fishId).filter(breed => breed.generation === 1)

export const findOfficialPondBreedByParents = (
  breedIdA: string,
  breedIdB: string
): LegacyPondBreedDef | undefined => {
  const parentA = toQueryContentId(breedIdA)
  const parentB = toQueryContentId(breedIdB)
  if (!parentA || !parentB) return undefined
  const breed = getOfficialPondBreedDefs().find(candidate =>
    (candidate.parentBreedA === parentA && candidate.parentBreedB === parentB) ||
    (candidate.parentBreedA === parentB && candidate.parentBreedB === parentA)
  )
  return breed ? toLegacyPondBreedDef(breed) : undefined
}

export const getOfficialFishPondFacilityDef = (
  id: string = 'fish_pond'
): Readonly<FishPondFacilityContentDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId
    ? getOfficialRegistrySet().get<FishPondFacilityContentDef>(toOfficialRegistryTypeId('fish_pond_facility')).get(contentId)
    : undefined
}

export const getOfficialFishPondFacilityDefs = (): readonly Readonly<FishPondFacilityContentDef>[] =>
  getOfficialRegistrySet().get<FishPondFacilityContentDef>(toOfficialRegistryTypeId('fish_pond_facility')).values()

const toLegacyFishPondFacilityCost = (
  cost: Readonly<FishPondFacilityContentDef['buildCost']>
): LegacyFishPondFacilityCost => ({
  money: cost.money,
  materials: cost.materials.map(material => ({
    itemId: getLocalContentId(material.itemId),
    quantity: material.quantity
  }))
})

const toLegacyFishPondFacilityDef = (
  facility: Readonly<FishPondFacilityContentDef>
): LegacyFishPondFacilityDef => ({
  id: getLocalContentId(facility.id),
  name: facility.name.fallback,
  description: facility.description.fallback,
  buildCost: toLegacyFishPondFacilityCost(facility.buildCost),
  capacities: facility.capacities.map(capacity => ({ ...capacity })),
  upgrades: facility.upgrades.map(upgrade => ({
    level: upgrade.level,
    capacity: upgrade.capacity,
    cost: toLegacyFishPondFacilityCost(upgrade.cost)
  })),
  unlimitedAtLevel: facility.unlimitedAtLevel
})

export const getOfficialFishPondFacilityById = (
  id: string = 'fish_pond'
): LegacyFishPondFacilityDef | undefined => {
  const facility = getOfficialFishPondFacilityDef(id)
  return facility ? toLegacyFishPondFacilityDef(facility) : undefined
}

export const getOfficialFishPondFacilitiesAsLegacy = (): readonly LegacyFishPondFacilityDef[] =>
  getOfficialFishPondFacilityDefs().map(toLegacyFishPondFacilityDef)

export const getOfficialBuildingUpgradeDefs = (): readonly Readonly<BuildingUpgradeContentDef>[] =>
  getOfficialRegistrySet().get<BuildingUpgradeContentDef>(toOfficialRegistryTypeId('building_upgrade')).values()

export const getOfficialFarmhouseUpgradeDef = (
  level: number
): Readonly<FarmhouseUpgradeContentDef> | undefined =>
  getOfficialBuildingUpgradeDefs().find(
    (upgrade): upgrade is Readonly<FarmhouseUpgradeContentDef> =>
      upgrade.kind === 'farmhouse' && upgrade.level === level
  )

export const getOfficialCaveUpgradeDef = (level: number): Readonly<CaveUpgradeContentDef> | undefined =>
  getOfficialBuildingUpgradeDefs().find(
    (upgrade): upgrade is Readonly<CaveUpgradeContentDef> =>
      upgrade.kind === 'cave' && upgrade.level === level
  )

export const getOfficialCellarUpgradeDef = (level: number): Readonly<CellarUpgradeContentDef> | undefined =>
  getOfficialBuildingUpgradeDefs().find(
    (upgrade): upgrade is Readonly<CellarUpgradeContentDef> =>
      upgrade.kind === 'cellar' && upgrade.level === level
  )

const toLegacyBuildingUpgradeMaterial = (
  material: Readonly<BuildingUpgradeContentDef['materialCost'][number]>
) => ({
  itemId: getLocalContentId(material.itemId),
  quantity: material.quantity
})

const toLegacyFarmhouseUpgrade = (
  upgrade: Readonly<FarmhouseUpgradeContentDef>
): LegacyFarmhouseUpgradeDef => ({
  level: upgrade.level,
  name: upgrade.name.fallback,
  description: upgrade.description.fallback,
  cost: upgrade.cost,
  materialCost: upgrade.materialCost.map(toLegacyBuildingUpgradeMaterial),
  benefit: upgrade.benefit
})

const toLegacyCaveUpgrade = (upgrade: Readonly<CaveUpgradeContentDef>): LegacyCaveUpgradeDef => ({
  level: upgrade.level,
  name: upgrade.name.fallback,
  mushroomChance: upgrade.mushroomChance,
  fruitBatChance: upgrade.fruitBatChance,
  doubleChance: upgrade.doubleChance,
  cost: upgrade.cost,
  materialCost: upgrade.materialCost.map(toLegacyBuildingUpgradeMaterial),
  mushroomPool: upgrade.mushroomPool.map(entry => ({
    itemId: getLocalContentId(entry.itemId),
    weight: entry.weight
  })),
  fruitPool: upgrade.fruitPool.map(getLocalContentId)
})

const toLegacyCellarUpgrade = (upgrade: Readonly<CellarUpgradeContentDef>): LegacyCellarUpgradeDef => ({
  level: upgrade.level,
  name: upgrade.name.fallback,
  valuePerCycle: upgrade.valuePerCycle,
  maxSlots: upgrade.maxSlots,
  cost: upgrade.cost,
  materialCost: upgrade.materialCost.map(toLegacyBuildingUpgradeMaterial)
})

export const getOfficialFarmhouseUpgrade = (level: number): LegacyFarmhouseUpgradeDef | undefined => {
  const upgrade = getOfficialFarmhouseUpgradeDef(level)
  return upgrade ? toLegacyFarmhouseUpgrade(upgrade) : undefined
}

export const getOfficialFarmhouseUpgrades = (): readonly LegacyFarmhouseUpgradeDef[] =>
  getOfficialBuildingUpgradeDefs()
    .filter((upgrade): upgrade is Readonly<FarmhouseUpgradeContentDef> => upgrade.kind === 'farmhouse')
    .map(toLegacyFarmhouseUpgrade)

export const getOfficialCaveUpgrade = (level: number): LegacyCaveUpgradeDef | undefined => {
  const upgrade = getOfficialCaveUpgradeDef(level)
  return upgrade ? toLegacyCaveUpgrade(upgrade) : undefined
}

export const getOfficialCaveUpgrades = (): readonly LegacyCaveUpgradeDef[] =>
  getOfficialBuildingUpgradeDefs()
    .filter((upgrade): upgrade is Readonly<CaveUpgradeContentDef> => upgrade.kind === 'cave')
    .map(toLegacyCaveUpgrade)

export const getOfficialCellarUpgrade = (level: number): LegacyCellarUpgradeDef | undefined => {
  const upgrade = getOfficialCellarUpgradeDef(level)
  return upgrade ? toLegacyCellarUpgrade(upgrade) : undefined
}

export const getOfficialCellarUpgrades = (): readonly LegacyCellarUpgradeDef[] =>
  getOfficialBuildingUpgradeDefs()
    .filter((upgrade): upgrade is Readonly<CellarUpgradeContentDef> => upgrade.kind === 'cellar')
    .map(toLegacyCellarUpgrade)

const toLegacyForageItemDef = (forage: Readonly<ForageDef>): LegacyForageItemDef => ({
  itemId: getLocalContentId(forage.itemId),
  name: forage.name.fallback,
  season: [...forage.season] as LegacyForageItemDef['season'],
  chance: forage.chance,
  expReward: forage.expReward
})

export const getOfficialForageItems = (): readonly LegacyForageItemDef[] =>
  getOfficialForageDefs().map(toLegacyForageItemDef)

export const getOfficialForageItemsBySeason = (season: string): readonly LegacyForageItemDef[] =>
  getOfficialForageDefs()
    .filter(forage => forage.season.includes(season as LegacyForageItemDef['season'][number]))
    .map(toLegacyForageItemDef)

const toLegacyFishDef = (fish: Readonly<FishContentDef>): LegacyFishDef => ({
  id: getLocalContentId(fish.id),
  name: fish.name.fallback,
  season: [...fish.season] as LegacyFishDef['season'],
  weather: [...fish.weather] as LegacyFishDef['weather'],
  difficulty: fish.difficulty,
  sellPrice: fish.sellPrice,
  description: fish.description.fallback,
  ...(fish.location !== undefined ? { location: fish.location } : {}),
  ...(fish.miniGameSpeed !== undefined ? { miniGameSpeed: fish.miniGameSpeed } : {}),
  ...(fish.miniGameDirChange !== undefined ? { miniGameDirChange: fish.miniGameDirChange } : {})
})

export const getOfficialFishById = (id: string): LegacyFishDef | undefined => {
  const fish = getOfficialFishDef(id)
  return fish ? toLegacyFishDef(fish) : undefined
}

export const getOfficialFishDefsAsLegacy = (): readonly LegacyFishDef[] =>
  getOfficialFishDefs().map(toLegacyFishDef)

export const getOfficialAvailableFish = (
  season: string,
  weather: string,
  location?: FishingLocation
): readonly LegacyFishDef[] =>
  getOfficialFishDefs()
    .filter(fish => fish.season.includes(season as LegacyFishDef['season'][number]))
    .filter(fish => fish.weather.includes('any') || fish.weather.includes(weather as FishWeather))
    .filter(fish => !location || (fish.location ?? 'creek') === location)
    .map(toLegacyFishDef)

export const getOfficialFruitTreeDefs = (): readonly Readonly<FruitTreeContentDef>[] =>
  getOfficialTreeDefs().filter((tree): tree is Readonly<FruitTreeContentDef> => tree.kind === 'fruit')

export const getOfficialWildTreeDefs = (): readonly Readonly<WildTreeContentDef>[] =>
  getOfficialTreeDefs().filter((tree): tree is Readonly<WildTreeContentDef> => tree.kind === 'wild')

const toLegacyFruitTreeDef = (
  tree: Readonly<Extract<TreeDef, { kind: 'fruit' }>>
): LegacyFruitTreeDef => ({
  type: getLocalContentId(tree.id) as LegacyFruitTreeDef['type'],
  name: tree.name.fallback,
  saplingId: getLocalContentId(tree.seedItemId),
  saplingPrice: tree.saplingPrice,
  fruitId: getLocalContentId(tree.fruitItemId),
  fruitName: tree.fruitName.fallback,
  fruitSeason: tree.fruitSeason,
  growthDays: tree.growthDays,
  fruitSellPrice: tree.fruitSellPrice
})

const toLegacyWildTreeDef = (
  tree: Readonly<Extract<TreeDef, { kind: 'wild' }>>
): LegacyWildTreeDef => ({
  type: getLocalContentId(tree.id) as LegacyWildTreeDef['type'],
  name: tree.name.fallback,
  seedItemId: getLocalContentId(tree.seedItemId),
  growthDays: tree.growthDays,
  tapProduct: getLocalContentId(tree.tapProductItemId),
  tapCycleDays: tree.tapCycleDays,
  tapProductName: tree.tapProductName.fallback
})

export const getOfficialFruitTreeById = (id: string): LegacyFruitTreeDef | undefined => {
  const tree = getOfficialTreeDef(id)
  return tree?.kind === 'fruit' ? toLegacyFruitTreeDef(tree) : undefined
}

export const getOfficialWildTreeById = (id: string): LegacyWildTreeDef | undefined => {
  const tree = getOfficialTreeDef(id)
  return tree?.kind === 'wild' ? toLegacyWildTreeDef(tree) : undefined
}

export const getOfficialFruitTreeBySaplingId = (seedItemId: string): LegacyFruitTreeDef | undefined => {
  const contentId = toQueryContentId(seedItemId)
  if (!contentId) return undefined
  const tree = getOfficialFruitTreeDefs().find(candidate => candidate.seedItemId === contentId)
  return tree ? toLegacyFruitTreeDef(tree) : undefined
}

export const getOfficialTreeByProductItemId = (productItemId: string): Readonly<TreeDef> | undefined => {
  const contentId = toQueryContentId(productItemId)
  if (!contentId) return undefined
  return getOfficialTreeDefs().find(tree =>
    tree.kind === 'fruit'
      ? tree.fruitItemId === contentId
      : tree.tapProductItemId === contentId
  )
}

const toLegacyShopDef = (shop: Readonly<ShopDef>): LegacyShopDef => ({
  id: getLocalContentId(shop.id),
  name: shop.name.fallback,
  description: shop.description.fallback,
  npcName: shop.npcName.fallback,
  closedDays: [...shop.closedDays] as LegacyShopDef['closedDays'],
  openHour: shop.openHour,
  closeHour: shop.closeHour,
  closedWeathers: [...shop.closedWeathers] as LegacyShopDef['closedWeathers'],
  closedSeasons: [...shop.closedSeasons] as LegacyShopDef['closedSeasons']
})

export const getOfficialShopById = (id: string): LegacyShopDef | undefined => {
  const shop = getOfficialShopDef(id)
  return shop ? toLegacyShopDef(shop) : undefined
}
