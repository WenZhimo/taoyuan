import { Type } from '@sinclair/typebox'
import { describe, expect, it } from 'vitest'
import { FORAGE_ITEMS as LEGACY_FORAGE_ITEMS } from '@/data/forageDefinitions'
import { getForageItems } from '@/data/forage'
import {
  getOfficialForageDef,
  getOfficialForageDefs,
  getOfficialForageItems,
  getOfficialForageItemsBySeason
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { ForageDefSchema, type ForageDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import type { ForageItemDef } from '@/data/forageDefinitions'
import validForage from '../fixtures/mods/minimal-valid-package/data/forage.json'

const seasons = ['spring', 'summer', 'autumn', 'winter'] as const

const normalizeLegacyForage = (forage: ForageItemDef): ForageItemDef => ({
  ...forage,
  season: [...forage.season]
})

describe('forage registry pilot', () => {
  it('validates external forage JSON before registration', () => {
    const externalForage: unknown = validForage
    const result = validateUnknown(Type.Array(ForageDefSchema), externalForage, { stage: 'test.forage' })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid forage shape, availability fields, and numeric bounds', () => {
    const base = validForage[0]!
    const invalidForage: unknown = [
      { ...base, season: [] },
      { ...base, season: ['spring', 'monsoon'] },
      { ...base, chance: -0.01 },
      { ...base, chance: 1.01 },
      { ...base, expReward: -1 },
      { ...base, expReward: 1.5 },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(ForageDefSchema), invalidForage, { stage: 'test.forage.invalid' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/season',
        '/1/season/1',
        '/2/chance',
        '/3/chance',
        '/4/expReward',
        '/5/expReward',
        '/6/extra'
      ]))
    }
  })

  it('registers all bamboo forest forage items in legacy order with equivalent fields', () => {
    expect(getOfficialForageDefs()).toHaveLength(LEGACY_FORAGE_ITEMS.length)
    expect(getOfficialForageDefs().map(forage => forage.id)).toEqual(
      LEGACY_FORAGE_ITEMS.map(forage => toOfficialContentId(forage.itemId))
    )
    expect(getOfficialForageItems().map(normalizeLegacyForage)).toEqual(
      LEGACY_FORAGE_ITEMS.map(normalizeLegacyForage)
    )

    for (const forage of LEGACY_FORAGE_ITEMS) {
      expect(getOfficialForageDef(forage.itemId)).toEqual({
        id: toOfficialContentId(forage.itemId),
        itemId: toOfficialContentId(forage.itemId),
        name: { key: `taoyuan.forage.${forage.itemId}.name`, fallback: forage.name },
        season: forage.season,
        chance: forage.chance,
        expReward: forage.expReward
      })
      expect(getOfficialForageDef(toOfficialContentId(forage.itemId))).toBe(getOfficialForageDef(forage.itemId))
    }
  })

  it('keeps seasonal forage queries equivalent through the legacy entry point', () => {
    for (const season of seasons) {
      const expected = LEGACY_FORAGE_ITEMS.filter(forage => forage.season.includes(season)).map(normalizeLegacyForage)

      expect(getOfficialForageItemsBySeason(season).map(normalizeLegacyForage)).toEqual(expected)
      expect(getForageItems(season).map(normalizeLegacyForage)).toEqual(expected)
    }
  })

  it('supports missing IDs and read-only registry entries', () => {
    const bamboo = getOfficialForageDef('bamboo')

    expect(getOfficialForageDef('missing_forage')).toBeUndefined()
    expect(Object.isFrozen(bamboo)).toBe(true)
    expect(Object.isFrozen(bamboo?.name)).toBe(true)
    expect(Object.isFrozen(bamboo?.season)).toBe(true)
  })

  it('reports missing item references for forage definitions', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<ForageDef>(toOfficialRegistryTypeId('forage'))
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('missing_forage_item'),
      itemId: toOfficialContentId('missing_forage_item'),
      name: { key: 'test.forage.missing-item.name', fallback: 'Missing forage item' },
      season: ['spring'],
      chance: 0.1,
      expReward: 1
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.contentId === toOfficialContentId('missing_forage_item')
    )

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_forage_item'),
        fieldPath: '/itemId'
      })
    ])
  })
})
