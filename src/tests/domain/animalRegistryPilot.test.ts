import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { ANIMAL_DEFS as LEGACY_ANIMAL_DEFS } from '@/data/animalDefinitions'
import { getAnimalDef, getAnimalDefsByBuilding } from '@/data/animals'
import {
  getOfficialAnimalByType,
  getOfficialAnimalDef,
  getOfficialAnimalDefs,
  getOfficialAnimalDefsAsLegacy,
  getOfficialAnimalDefsByBuilding
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { AnimalDefSchema, type AnimalDef as AnimalContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { AnimalDef as LegacyAnimalDef, AnimalBuildingType } from '@/types'
import validAnimals from '../fixtures/mods/minimal-valid-package/data/animals.json'

const animalBuildings = ['coop', 'barn', 'stable'] as const satisfies readonly AnimalBuildingType[]

const normalizeLegacyAnimal = (animal: LegacyAnimalDef): LegacyAnimalDef => ({
  ...animal,
  friendship: { ...animal.friendship }
})

const expectedAnimalContentDef = (animal: LegacyAnimalDef): AnimalContentDef => ({
  id: toOfficialContentId(animal.type),
  name: { key: `taoyuan.animal.${animal.type}.name`, fallback: animal.name },
  building: animal.building,
  cost: animal.cost,
  ...(animal.productId ? { productItemId: toOfficialContentId(animal.productId) } : {}),
  ...(animal.productName ? { productName: { key: `taoyuan.animal.${animal.type}.product.name`, fallback: animal.productName } } : {}),
  produceDays: animal.produceDays,
  friendship: { ...animal.friendship }
})

describe('animal registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external animal JSON before registration', () => {
    const externalAnimals: unknown = validAnimals
    const result = validateUnknown(Type.Array(AnimalDefSchema), externalAnimals, { stage: 'test.animals' })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid animal shape, building, and numeric bounds', () => {
    const base = validAnimals[0]!
    const invalidAnimals: unknown = [
      { ...base, building: 'pasture' },
      { ...base, cost: -1 },
      { ...base, produceDays: -1 },
      { ...base, produceDays: 1.5 },
      { ...base, friendship: { min: -1, max: 1000 } },
      { ...base, friendship: { min: 0, max: -1 } },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(AnimalDefSchema), invalidAnimals, { stage: 'test.animals.invalid' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/building',
        '/1/cost',
        '/2/produceDays',
        '/3/produceDays',
        '/4/friendship/min',
        '/5/friendship/max',
        '/6/extra'
      ]))
    }
  })

  it('registers all animal definitions in legacy order with equivalent fields', () => {
    expect(getOfficialAnimalDefs()).toHaveLength(LEGACY_ANIMAL_DEFS.length)
    expect(getOfficialAnimalDefs().map(animal => animal.id)).toEqual(
      LEGACY_ANIMAL_DEFS.map(animal => toOfficialContentId(animal.type))
    )
    expect(getOfficialAnimalDefsAsLegacy().map(normalizeLegacyAnimal)).toEqual(
      LEGACY_ANIMAL_DEFS.map(normalizeLegacyAnimal)
    )

    for (const animal of LEGACY_ANIMAL_DEFS) {
      expect(getOfficialAnimalDef(animal.type)).toEqual(expectedAnimalContentDef(animal))
      expect(getOfficialAnimalDef(toOfficialContentId(animal.type))).toBe(getOfficialAnimalDef(animal.type))
      expect(getOfficialAnimalByType(animal.type)).toEqual(animal)
      expect(getAnimalDef(animal.type)).toEqual(animal)
    }
  })

  it('keeps building-filtered animal queries equivalent through the legacy entry point', () => {
    for (const building of animalBuildings) {
      const expected = LEGACY_ANIMAL_DEFS.filter(animal => animal.building === building).map(normalizeLegacyAnimal)

      expect(getOfficialAnimalDefsByBuilding(building).map(normalizeLegacyAnimal)).toEqual(expected)
      expect(getAnimalDefsByBuilding(building).map(normalizeLegacyAnimal)).toEqual(expected)
    }
  })

  it('supports missing IDs and read-only registry entries', () => {
    const chicken = getOfficialAnimalDef('chicken')

    expect(getOfficialAnimalDef('missing_animal')).toBeUndefined()
    expect(getOfficialAnimalByType('missing_animal')).toBeUndefined()
    expect(Object.isFrozen(chicken)).toBe(true)
    expect(Object.isFrozen(chicken?.name)).toBe(true)
    expect(Object.isFrozen(chicken?.friendship)).toBe(true)
  })

  it('reports missing product item references for producing animals', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<AnimalContentDef>(toOfficialRegistryTypeId('animal'))
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('missing_product_animal'),
      name: { key: 'test.animal.missing-product.name', fallback: 'Missing Product Animal' },
      building: 'coop',
      cost: 1,
      productItemId: toOfficialContentId('missing_animal_product'),
      productName: { key: 'test.animal.missing-product.product.name', fallback: 'Missing Product' },
      produceDays: 1,
      friendship: { min: 0, max: 1000 }
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.contentId === toOfficialContentId('missing_animal_product')
    )

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_animal_product'),
        fieldPath: '/productItemId'
      })
    ])
  })

  it('keeps animal store purchase, production, and sale behavior registry-backed', () => {
    const animalStore = useAnimalStore()
    const playerStore = usePlayerStore()
    const coop = animalStore.buildings.find(building => building.type === 'coop')!
    playerStore.money = 2000
    coop.built = true
    coop.level = 1

    expect(animalStore.buyAnimal('chicken', '小鸡')).toBe(true)
    expect(playerStore.money).toBe(1200)
    expect(animalStore.coopAnimals.map(animal => animal.name)).toEqual(['小鸡'])

    const chicken = animalStore.animals[0]!
    chicken.wasFed = true
    chicken.wasPetted = true
    const dailyResult = animalStore.dailyUpdate()

    expect(dailyResult.products).toEqual([{ itemId: 'egg', quality: 'normal' }])
    expect(chicken.wasFed).toBe(false)

    expect(animalStore.sellAnimal(chicken.id)).toEqual({ success: true, refund: 400, name: '小鸡' })
    expect(playerStore.money).toBe(1600)
  })
})
