import { describe, expect, it } from 'vitest'
import { CROPS, getCropById, getCropBySeedId, getCropsBySeason } from '@/data/crops'
import {
  getOfficialCropById,
  getOfficialCropBySeedId,
  getOfficialCropDef,
  getOfficialCropDefs,
  getOfficialCropsBySeason
} from '@/domain/mods/contentAccess'
import { requirePackageId, toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistrySet } from '@/domain/mods/registry'
import { type CropDef, type ItemDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_REGISTRY_DEFINITIONS } from '@/domain/mods/staticAdapters'
import type { CropDef as LegacyCropDef } from '@/types/farm'

const normalizeLegacyCrop = (crop: LegacyCropDef): LegacyCropDef => ({
  ...crop,
  season: [...crop.season]
})

const createTestItem = (id: string): ItemDef => ({
  id: toOfficialContentId(id),
  name: { key: `test.item.${id}.name`, fallback: id },
  category: 'crop',
  description: { key: `test.item.${id}.description`, fallback: id },
  sellPrice: 1,
  edible: false
})

describe('crop registry pilot', () => {
  it('keeps the official crop query facade equivalent to the legacy crop table', () => {
    expect(getOfficialCropDefs().map(normalizeLegacyCrop)).toEqual(CROPS.map(normalizeLegacyCrop))

    for (const crop of CROPS) {
      expect(getOfficialCropById(crop.id)).toEqual(getCropById(crop.id))
      expect(getOfficialCropBySeedId(crop.seedId)).toEqual(getCropBySeedId(crop.seedId))
    }

    expect(getOfficialCropById('missing_crop')).toBeUndefined()
    expect(getOfficialCropBySeedId('missing_seed')).toBeUndefined()
  })

  it('keeps official crop season queries equivalent to the legacy crop table', () => {
    for (const season of ['spring', 'summer', 'autumn', 'winter']) {
      expect(getOfficialCropsBySeason(season).map(normalizeLegacyCrop)).toEqual(
        getCropsBySeason(season).map(normalizeLegacyCrop)
      )
    }
  })

  it('stores crop definitions with namespaced item and seed references', () => {
    const cabbage = getOfficialCropDef('cabbage')
    const ancientFruit = getOfficialCropDef('taoyuan:ancient_fruit')

    expect(cabbage?.id).toBe(toOfficialContentId('cabbage'))
    expect(cabbage?.name.fallback).toBe('青菜')
    expect(cabbage?.seedId).toBe(toOfficialContentId('seed_cabbage'))
    expect(cabbage?.description.fallback).toBe('最基础的蔬菜，容易种植。')
    expect(ancientFruit?.regrowth).toBe(true)
    expect(ancientFruit?.regrowthDays).toBe(7)
    expect(ancientFruit?.maxHarvests).toBe(6)
  })

  it('reports missing crop seed item references during semantic validation', () => {
    const owner = requirePackageId('test_mod')
    const registrySet = new RegistrySet()
    for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) registrySet.defineRegistry(definition)
    registrySet.freezeDefinitions()

    registrySet.get<ItemDef>(toOfficialRegistryTypeId('item')).register(owner, createTestItem('test_crop'))
    registrySet.get<CropDef>(toOfficialRegistryTypeId('crop')).register(owner, {
      id: toOfficialContentId('test_crop'),
      name: { key: 'test.crop.name', fallback: 'Test Crop' },
      seedId: toOfficialContentId('missing_seed'),
      season: ['spring'],
      growthDays: 1,
      sellPrice: 1,
      seedPrice: 1,
      deepWatering: false,
      description: { key: 'test.crop.description', fallback: 'Test crop' }
    })

    const cropDiagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.registryId === toOfficialRegistryTypeId('item')
    )

    expect(cropDiagnostics).toEqual([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_seed'),
        fieldPath: '/seedId'
      })
    ])
  })
})
