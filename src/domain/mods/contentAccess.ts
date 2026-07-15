import type {
  AnimalBuildingDef as LegacyAnimalBuildingDef,
  AnimalDef as LegacyAnimalDef,
  EnchantmentDef as LegacyEnchantmentDef,
  FishDef as LegacyFishDef,
  FruitTreeDef as LegacyFruitTreeDef,
  HatDef as LegacyHatDef,
  MonsterDef as LegacyMonsterDef,
  RingDef as LegacyRingDef,
  ShoeDef as LegacyShoeDef,
  ToolTier,
  ToolType,
  WeaponDef as LegacyWeaponDef,
  WalletItemDef as LegacyWalletItemDef,
  WildTreeDef as LegacyWildTreeDef
} from '@/types'
import type { FarmMapDef as LegacyFarmMapDef } from '@/data/farmMapDefinitions'
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
import type {
  FishPondFacilityCost as LegacyFishPondFacilityCost,
  FishPondFacilityDef as LegacyFishPondFacilityDef
} from '@/data/fishPondFacilityDefinitions'
import type {
  CaveUpgradeDef as LegacyCaveUpgradeDef,
  CellarUpgradeDef as LegacyCellarUpgradeDef,
  FarmhouseUpgradeDef as LegacyFarmhouseUpgradeDef
} from '@/data/buildingUpgradeDefinitions'
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
  AnimalBuildingDef as AnimalBuildingContentDef,
  AnimalDef as AnimalContentDef,
  AnimalFeedDef as AnimalFeedContentDef,
  AnimalIncubationDef as AnimalIncubationContentDef,
  BuildingUpgradeDef as BuildingUpgradeContentDef,
  CaveUpgradeContentDef,
  CellarUpgradeContentDef,
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
  MonsterDef,
  MonsterPoolDef,
  PondBreedDef,
  PondableFishDef,
  RecipeDef,
  Season,
  ShopDef,
  ShopOfferDef,
  TagDef,
  ToolUpgradeDef as ToolUpgradeContentDef,
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
