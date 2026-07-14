import { Type } from '@sinclair/typebox'
import { describe, expect, it } from 'vitest'
import { FISH, getAvailableFish, getFishById } from '@/data/fish'
import {
  getOfficialAvailableFish,
  getOfficialFishById,
  getOfficialFishDef,
  getOfficialFishDefs,
  getOfficialFishDefsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { FishDefSchema, type FishDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import type { FishDef as LegacyFishDef, FishingLocation } from '@/types'
import validFish from '../fixtures/mods/minimal-valid-package/data/fish.json'

const seasons = ['spring', 'summer', 'autumn', 'winter'] as const
const weathers = ['sunny', 'rainy', 'stormy', 'snowy', 'windy'] as const
const locations = ['creek', 'pond', 'river', 'mine', 'waterfall', 'swamp'] as const

const normalizeLegacyFish = (fish: LegacyFishDef): LegacyFishDef => ({
  ...fish,
  season: [...fish.season],
  weather: [...fish.weather]
})

describe('fish registry pilot', () => {
  it('validates external fish JSON before registration', () => {
    const externalFish: unknown = validFish
    const result = validateUnknown(Type.Array(FishDefSchema), externalFish, { stage: 'test.fish' })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid fish shape, availability fields, and numeric bounds', () => {
    const base = validFish[0]!
    const invalidFish: unknown = [
      { ...base, season: [] },
      { ...base, weather: ['green_rain'] },
      { ...base, difficulty: 'mythic' },
      { ...base, sellPrice: -1 },
      { ...base, location: 'ocean' },
      { ...base, miniGameSpeed: -0.1 },
      { ...base, miniGameDirChange: -0.01 },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(FishDefSchema), invalidFish, { stage: 'test.fish.invalid' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/season',
        '/1/weather/0',
        '/2/difficulty',
        '/3/sellPrice',
        '/4/location',
        '/5/miniGameSpeed',
        '/6/miniGameDirChange',
        '/7/extra'
      ]))
    }
  })

  it('registers all fish in legacy order with equivalent fields', () => {
    expect(getOfficialFishDefs()).toHaveLength(FISH.length)
    expect(getOfficialFishDefs().map(fish => fish.id)).toEqual(FISH.map(fish => toOfficialContentId(fish.id)))
    expect(getOfficialFishDefsAsLegacy().map(normalizeLegacyFish)).toEqual(FISH.map(normalizeLegacyFish))

    for (const fish of FISH) {
      expect(getOfficialFishDef(fish.id)).toEqual({
        id: toOfficialContentId(fish.id),
        name: { key: `taoyuan.fish.${fish.id}.name`, fallback: fish.name },
        season: fish.season,
        weather: fish.weather,
        difficulty: fish.difficulty,
        sellPrice: fish.sellPrice,
        description: { key: `taoyuan.fish.${fish.id}.description`, fallback: fish.description },
        ...(fish.location !== undefined ? { location: fish.location } : {}),
        ...(fish.miniGameSpeed !== undefined ? { miniGameSpeed: fish.miniGameSpeed } : {}),
        ...(fish.miniGameDirChange !== undefined ? { miniGameDirChange: fish.miniGameDirChange } : {})
      })
      expect(getOfficialFishDef(toOfficialContentId(fish.id))).toBe(getOfficialFishDef(fish.id))
      expect(getOfficialFishById(fish.id)).toEqual(getFishById(fish.id))
      expect(getOfficialFishById(toOfficialContentId(fish.id))).toEqual(getFishById(fish.id))
    }
  })

  it('keeps availability queries equivalent across seasons, weather, and locations', () => {
    for (const season of seasons) {
      for (const weather of weathers) {
        expect(getOfficialAvailableFish(season, weather).map(normalizeLegacyFish)).toEqual(
          getAvailableFish(season, weather).map(normalizeLegacyFish)
        )
        for (const location of locations) {
          expect(getOfficialAvailableFish(season, weather, location).map(normalizeLegacyFish)).toEqual(
            getAvailableFish(season, weather, location).map(normalizeLegacyFish)
          )
        }
      }
    }
  })

  it('supports missing IDs and read-only registry entries without mutating legacy objects', () => {
    const crucian = getOfficialFishDef('crucian')

    expect(getOfficialFishDef('missing_fish')).toBeUndefined()
    expect(getOfficialFishById('missing_fish')).toBeUndefined()
    expect(getOfficialAvailableFish('spring', 'sunny', 'creek' as FishingLocation).length).toBeGreaterThan(0)
    expect(Object.isFrozen(crucian)).toBe(true)
    expect(Object.isFrozen(crucian?.name)).toBe(true)
    expect(Object.isFrozen(crucian?.season)).toBe(true)
    expect(Object.isFrozen(crucian?.weather)).toBe(true)
  })

  it('reports missing item references for fish definitions', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<FishDef>(toOfficialRegistryTypeId('fish'))
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('missing_fish_item'),
      name: { key: 'test.fish.missing-item.name', fallback: 'Missing Fish Item' },
      season: ['spring'],
      weather: ['any'],
      difficulty: 'easy',
      sellPrice: 1,
      description: { key: 'test.fish.missing-item.description', fallback: 'Missing item' },
      location: 'creek'
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.contentId === toOfficialContentId('missing_fish_item')
    )

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_fish_item'),
        fieldPath: '/id'
      })
    ])
  })
})
