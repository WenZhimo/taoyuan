import type { CropDef as LegacyCropDef } from '@/types/farm'
import { requireContentId, toOfficialContentId, toOfficialRegistryTypeId } from './ids'
import type { RegistrySet } from './registry'
import type { CropDef, ItemDef, RecipeDef, TagDef } from './schemas'
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

export const getOfficialItemDefs = (): readonly Readonly<ItemDef>[] =>
  getOfficialRegistrySet().get<ItemDef>(toOfficialRegistryTypeId('item')).values()

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

export const getOfficialCropDefs = (): readonly LegacyCropDef[] =>
  getOfficialRegistrySet().get<CropDef>(toOfficialRegistryTypeId('crop')).values().map(toLegacyCropDef)
