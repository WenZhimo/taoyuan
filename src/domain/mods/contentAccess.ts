import type { EnchantmentDef as LegacyEnchantmentDef, MonsterDef as LegacyMonsterDef } from '@/types'
import type { CropDef as LegacyCropDef } from '@/types/farm'
import type { ShopDef as LegacyShopDef } from '@/data/shops'
import { requireContentId, toOfficialContentId, toOfficialRegistryTypeId } from './ids'
import type { RegistrySet } from './registry'
import type {
  CropDef,
  DropTableDef,
  EnchantmentDef,
  ItemDef,
  MonsterDef,
  MonsterPoolDef,
  RecipeDef,
  Season,
  ShopDef,
  ShopOfferDef,
  TagDef
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
