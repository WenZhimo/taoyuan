import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  SPRINKLERS as LEGACY_SPRINKLERS,
  getSprinklerById,
  getSprinklers
} from '@/data/processing'
import {
  getOfficialSprinklerById,
  getOfficialSprinklerDef,
  getOfficialSprinklerDefs,
  getOfficialSprinklersAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { SprinklerDefSchema, type SprinklerDef as SprinklerContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useFarmStore } from '@/stores/useFarmStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useProcessingStore } from '@/stores/useProcessingStore'
import type { SprinklerDef as LegacySprinklerDef } from '@/types'

const normalizeSprinkler = (sprinkler: LegacySprinklerDef): LegacySprinklerDef => ({
  ...sprinkler,
  craftCost: sprinkler.craftCost.map(material => ({ ...material }))
})

const expectedSprinklerContentDef = (sprinkler: LegacySprinklerDef): SprinklerContentDef => ({
  id: toOfficialContentId(sprinkler.id),
  name: { key: `taoyuan.sprinkler.${sprinkler.id}.name`, fallback: sprinkler.name },
  description: { key: `taoyuan.sprinkler.${sprinkler.id}.description`, fallback: sprinkler.description },
  range: sprinkler.range,
  craftCost: sprinkler.craftCost.map(material => ({
    itemId: toOfficialContentId(material.itemId),
    quantity: material.quantity
  })),
  craftMoney: sprinkler.craftMoney
})

const validExternalSprinklers: unknown = [
  {
    id: 'example_mod:test_sprinkler',
    name: { key: 'example_mod.sprinkler.test.name', fallback: 'Test Sprinkler' },
    description: { key: 'example_mod.sprinkler.test.description', fallback: 'Waters nearby plots.' },
    range: 4,
    craftCost: [{ itemId: 'example_mod:test_item', quantity: 1 }],
    craftMoney: 0
  }
]

describe('sprinkler registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external sprinkler JSON before registration', () => {
    const result = validateUnknown(Type.Array(SprinklerDefSchema), validExternalSprinklers, {
      stage: 'test.sprinklers'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid sprinkler shapes and numeric bounds', () => {
    const base = (validExternalSprinklers as readonly [SprinklerContentDef])[0]
    const invalidSprinklers: unknown = [
      { ...base, id: 'not namespaced' },
      { ...base, name: { key: '', fallback: 'No key' } },
      { ...base, range: 5 },
      { ...base, craftCost: [{ itemId: 'example_mod:test_item', quantity: 0 }] },
      { ...base, craftCost: [{ itemId: 'not namespaced', quantity: 1 }] },
      { ...base, craftMoney: -1 },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(SprinklerDefSchema), invalidSprinklers, {
      stage: 'test.sprinklers.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/name/key',
        '/2/range',
        '/3/craftCost/0/quantity',
        '/4/craftCost/0/itemId',
        '/5/craftMoney',
        '/6/extra'
      ]))
    }
  })

  it('registers all sprinklers in legacy order with equivalent fields', () => {
    expect(getOfficialSprinklerDefs()).toHaveLength(LEGACY_SPRINKLERS.length)
    expect(getOfficialSprinklerDefs().map(sprinkler => sprinkler.id)).toEqual(
      LEGACY_SPRINKLERS.map(sprinkler => toOfficialContentId(sprinkler.id))
    )
    expect(getOfficialSprinklerDefs()).toEqual(
      LEGACY_SPRINKLERS.map(expectedSprinklerContentDef)
    )
    expect(getOfficialSprinklersAsLegacy().map(normalizeSprinkler)).toEqual(
      LEGACY_SPRINKLERS.map(normalizeSprinkler)
    )
    expect(getSprinklers().map(normalizeSprinkler)).toEqual(
      LEGACY_SPRINKLERS.map(normalizeSprinkler)
    )

    for (const sprinkler of LEGACY_SPRINKLERS) {
      expect(getOfficialSprinklerDef(sprinkler.id)).toEqual(expectedSprinklerContentDef(sprinkler))
      expect(getOfficialSprinklerDef(toOfficialContentId(sprinkler.id))).toBe(getOfficialSprinklerDef(sprinkler.id))
      expect(getOfficialSprinklerById(sprinkler.id)).toEqual(normalizeSprinkler(sprinkler))
      expect(getSprinklerById(sprinkler.id)).toEqual(normalizeSprinkler(sprinkler))
    }
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const bamboo = getOfficialSprinklerDef('bamboo_sprinkler')
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<SprinklerContentDef>(toOfficialRegistryTypeId('sprinkler'))

    expect(getOfficialSprinklerDef('missing_sprinkler')).toBeUndefined()
    expect(getOfficialSprinklerById('missing_sprinkler')).toBeUndefined()
    expect(getSprinklerById('missing_sprinkler')).toBeUndefined()
    expect(Object.isFrozen(bamboo)).toBe(true)
    expect(Object.isFrozen(bamboo?.name)).toBe(true)
    expect(Object.isFrozen(bamboo?.craftCost)).toBe(true)
    expect(Object.isFrozen(bamboo?.craftCost[0])).toBe(true)
    expect(() => registry.register(
      OFFICIAL_PACKAGE_ID,
      expectedSprinklerContentDef(LEGACY_SPRINKLERS[0]!)
    )).toThrow(RegistryError)
  })

  it('reports missing craft material item references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<SprinklerContentDef>(toOfficialRegistryTypeId('sprinkler'))
    const missingMaterial = toOfficialContentId('missing_sprinkler_material')
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('sprinkler/missing_material'),
      name: { key: 'test.sprinkler.missing.name', fallback: 'Missing Material Sprinkler' },
      description: { key: 'test.sprinkler.missing.description', fallback: 'Missing material' },
      range: 4,
      craftCost: [{ itemId: missingMaterial, quantity: 1 }],
      craftMoney: 1
    })

    const diagnostics = validateRegistrySemantics(registrySet)

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingMaterial,
        fieldPath: '/craftCost/0/itemId'
      })
    ]))
  })

  it('keeps crafting and coverage behavior registry-backed', () => {
    const processingStore = useProcessingStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    const farmStore = useFarmStore()

    playerStore.money = 100
    expect(inventoryStore.addItem('bamboo', 10)).toBe(true)
    expect(inventoryStore.addItem('copper_ore', 3)).toBe(true)

    expect(processingStore.craftSprinkler('bamboo_sprinkler')).toBe(true)
    expect(playerStore.money).toBe(0)
    expect(inventoryStore.getItemCount('bamboo')).toBe(0)
    expect(inventoryStore.getItemCount('copper_ore')).toBe(0)
    expect(inventoryStore.getItemCount('bamboo_sprinkler')).toBe(1)

    farmStore.resetFarm(4)
    expect(farmStore.placeSprinkler(5, 'bamboo_sprinkler')).toBe(true)
    expect([...farmStore.getAllWateredBySprinklers()].sort((a, b) => a - b)).toEqual([1, 4, 5, 6, 9])
  })
})
