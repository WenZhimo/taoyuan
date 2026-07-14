import { Type } from '@sinclair/typebox'
import { describe, expect, it } from 'vitest'
import { FEED_DEFS as LEGACY_FEED_DEFS, type AnimalFeedDef as LegacyAnimalFeedDef } from '@/data/animalFeedDefinitions'
import { getFeedDef, getFeedDefs } from '@/data/animals'
import {
  getOfficialAnimalFeedById,
  getOfficialAnimalFeedDef,
  getOfficialAnimalFeedDefs,
  getOfficialAnimalFeedDefsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { AnimalFeedDefSchema, type AnimalFeedDef as AnimalFeedContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import validAnimalFeeds from '../fixtures/mods/minimal-valid-package/data/animal-feeds.json'

const normalizeLegacyFeed = (feed: LegacyAnimalFeedDef): LegacyAnimalFeedDef => ({ ...feed })

const expectedAnimalFeedContentDef = (feed: LegacyAnimalFeedDef): AnimalFeedContentDef => ({
  id: toOfficialContentId(feed.id),
  name: { key: `taoyuan.animal_feed.${feed.id}.name`, fallback: feed.name },
  description: { key: `taoyuan.animal_feed.${feed.id}.description`, fallback: feed.description },
  price: feed.price
})

describe('animal feed registry pilot', () => {
  it('validates external animal feed JSON before registration', () => {
    const externalFeeds: unknown = validAnimalFeeds
    const result = validateUnknown(Type.Array(AnimalFeedDefSchema), externalFeeds, { stage: 'test.animal-feeds' })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid animal feed shape and numeric bounds', () => {
    const base = validAnimalFeeds[0]!
    const invalidFeeds: unknown = [
      { ...base, price: -1 },
      { ...base, price: 1.5 },
      { ...base, name: { key: '', fallback: 'Broken' } },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(AnimalFeedDefSchema), invalidFeeds, {
      stage: 'test.animal-feeds.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(
        expect.arrayContaining(['/0/price', '/1/price', '/2/name/key', '/3/extra'])
      )
    }
  })

  it('registers all feed definitions in legacy order with equivalent fields', () => {
    expect(getOfficialAnimalFeedDefs()).toHaveLength(LEGACY_FEED_DEFS.length)
    expect(getOfficialAnimalFeedDefs().map(feed => feed.id)).toEqual(
      LEGACY_FEED_DEFS.map(feed => toOfficialContentId(feed.id))
    )
    expect(getOfficialAnimalFeedDefsAsLegacy().map(normalizeLegacyFeed)).toEqual(
      LEGACY_FEED_DEFS.map(normalizeLegacyFeed)
    )
    expect(getFeedDefs().map(normalizeLegacyFeed)).toEqual(LEGACY_FEED_DEFS.map(normalizeLegacyFeed))

    for (const feed of LEGACY_FEED_DEFS) {
      expect(getOfficialAnimalFeedDef(feed.id)).toEqual(expectedAnimalFeedContentDef(feed))
      expect(getOfficialAnimalFeedDef(toOfficialContentId(feed.id))).toBe(getOfficialAnimalFeedDef(feed.id))
      expect(getOfficialAnimalFeedById(feed.id)).toEqual(feed)
      expect(getFeedDef(feed.id)).toEqual(feed)
    }
  })

  it('supports missing IDs and read-only registry entries', () => {
    const hay = getOfficialAnimalFeedDef('hay')

    expect(getOfficialAnimalFeedDef('missing_feed')).toBeUndefined()
    expect(getOfficialAnimalFeedById('missing_feed')).toBeUndefined()
    expect(getFeedDef('missing_feed')).toBeUndefined()
    expect(Object.isFrozen(hay)).toBe(true)
    expect(Object.isFrozen(hay?.name)).toBe(true)
    expect(Object.isFrozen(hay?.description)).toBe(true)
  })

  it('reports missing feed item references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<AnimalFeedContentDef>(toOfficialRegistryTypeId('animal_feed'))
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('missing_feed_item'),
      name: { key: 'test.animal-feed.missing.name', fallback: 'Missing Feed' },
      description: { key: 'test.animal-feed.missing.description', fallback: 'Missing feed item' },
      price: 1
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.contentId === toOfficialContentId('missing_feed_item')
    )

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_feed_item'),
        fieldPath: '/id'
      })
    ])
  })
})
