import { getCropById } from '@/data/crops'
import type { CropDef } from '@/types'
import { requireContentId, toOfficialContentId, toOfficialRegistryTypeId } from './ids'
import type { RegistrySet } from './registry'
import type { ItemDef, RecipeDef, TagDef } from './schemas'
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

export const getOfficialTagDef = (id: string): Readonly<TagDef> | undefined => {
  const contentId = toQueryContentId(id)
  return contentId ? getOfficialRegistrySet().get<TagDef>(toOfficialRegistryTypeId('tag')).get(contentId) : undefined
}

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

export const getOfficialCropById = (id: string): CropDef | undefined => getCropById(id)
