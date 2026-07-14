import type {
  AnimalDef as LegacyAnimalDef,
  EnchantmentDef as LegacyEnchantmentDef,
  FishDef as LegacyFishDef,
  FruitTreeDef as LegacyFruitTreeDef,
  MonsterDef as LegacyMonsterDef,
  WildTreeDef as LegacyWildTreeDef
} from '@/types'
import type { ForageItemDef as LegacyForageItemDef } from '@/data/forageDefinitions'
import type { FishingLocation } from '@/types/skill'
import type { CropDef as LegacyCropDef } from '@/types/farm'
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
  AnimalDef as AnimalContentDef,
  CropDef,
  DropTableDef,
  EnchantmentDef,
  FishDef as FishContentDef,
  FishWeather,
  ForageDef,
  FruitTreeContentDef,
  ItemDef,
  MonsterDef,
  MonsterPoolDef,
  RecipeDef,
  Season,
  ShopDef,
  ShopOfferDef,
  TagDef,
  TreeDef,
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
