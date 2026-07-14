import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  ANIMAL_INCUBATIONS as LEGACY_ANIMAL_INCUBATIONS,
  INCUBATION_MAP as LEGACY_INCUBATION_MAP,
  type AnimalIncubationDef as LegacyAnimalIncubationDef
} from '@/data/animalIncubationDefinitions'
import { getIncubationDef, getIncubationDefs, getIncubationMap } from '@/data/animals'
import {
  getOfficialAnimalIncubationByItemId,
  getOfficialAnimalIncubationDef,
  getOfficialAnimalIncubationDefs,
  getOfficialAnimalIncubationDefsAsLegacy,
  getOfficialAnimalIncubationMap
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { AnimalIncubationDefSchema, type AnimalIncubationDef as AnimalIncubationContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import validAnimalIncubations from '../fixtures/mods/minimal-valid-package/data/animal-incubations.json'

const normalizeIncubation = (incubation: LegacyAnimalIncubationDef): LegacyAnimalIncubationDef => ({ ...incubation })

const expectedIncubationContentDef = (incubation: LegacyAnimalIncubationDef): AnimalIncubationContentDef => ({
  id: toOfficialContentId(`animal_incubation/${incubation.itemId}`),
  itemId: toOfficialContentId(incubation.itemId),
  animalId: toOfficialContentId(incubation.animalType),
  building: incubation.building,
  days: incubation.days
})

describe('animal incubation registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('validates external animal incubation JSON before registration', () => {
    const externalIncubations: unknown = validAnimalIncubations
    const result = validateUnknown(Type.Array(AnimalIncubationDefSchema), externalIncubations, {
      stage: 'test.animal-incubations'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid animal incubation shape and numeric bounds', () => {
    const base = validAnimalIncubations[0]!
    const invalidIncubations: unknown = [
      { ...base, itemId: 'not namespaced' },
      { ...base, animalId: 'not namespaced' },
      { ...base, building: 'pasture' },
      { ...base, days: 0 },
      { ...base, days: 1.5 },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(AnimalIncubationDefSchema), invalidIncubations, {
      stage: 'test.animal-incubations.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/itemId',
        '/1/animalId',
        '/2/building',
        '/3/days',
        '/4/days',
        '/5/extra'
      ]))
    }
  })

  it('registers all incubation mappings in legacy order with equivalent fields', () => {
    expect(getOfficialAnimalIncubationDefs()).toHaveLength(LEGACY_ANIMAL_INCUBATIONS.length)
    expect(getOfficialAnimalIncubationDefs().map(incubation => incubation.id)).toEqual(
      LEGACY_ANIMAL_INCUBATIONS.map(incubation => toOfficialContentId(`animal_incubation/${incubation.itemId}`))
    )
    expect(getOfficialAnimalIncubationDefsAsLegacy().map(normalizeIncubation)).toEqual(
      LEGACY_ANIMAL_INCUBATIONS.map(normalizeIncubation)
    )
    expect(getIncubationDefs().map(normalizeIncubation)).toEqual(
      LEGACY_ANIMAL_INCUBATIONS.map(normalizeIncubation)
    )
    expect(getOfficialAnimalIncubationMap()).toEqual(LEGACY_INCUBATION_MAP)
    expect(getIncubationMap()).toEqual(LEGACY_INCUBATION_MAP)

    for (const incubation of LEGACY_ANIMAL_INCUBATIONS) {
      expect(getOfficialAnimalIncubationDef(`animal_incubation/${incubation.itemId}`)).toEqual(
        expectedIncubationContentDef(incubation)
      )
      expect(getOfficialAnimalIncubationByItemId(incubation.itemId)).toEqual(LEGACY_INCUBATION_MAP[incubation.itemId])
      expect(getIncubationDef(incubation.itemId)).toEqual(LEGACY_INCUBATION_MAP[incubation.itemId])
    }
  })

  it('supports missing IDs and read-only registry entries', () => {
    const egg = getOfficialAnimalIncubationDef('animal_incubation/egg')

    expect(getOfficialAnimalIncubationDef('animal_incubation/missing')).toBeUndefined()
    expect(getOfficialAnimalIncubationByItemId('missing')).toBeUndefined()
    expect(getIncubationDef('missing')).toBeUndefined()
    expect(Object.isFrozen(egg)).toBe(true)
  })

  it('reports missing egg item and animal references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<AnimalIncubationContentDef>(toOfficialRegistryTypeId('animal_incubation'))
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('animal_incubation/missing_refs'),
      itemId: toOfficialContentId('missing_egg_item'),
      animalId: toOfficialContentId('missing_hatched_animal'),
      building: 'coop',
      days: 1
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic =>
        diagnostic.contentId === toOfficialContentId('missing_egg_item') ||
        diagnostic.contentId === toOfficialContentId('missing_hatched_animal')
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: toOfficialContentId('missing_egg_item'),
        fieldPath: '/itemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('animal'),
        contentId: toOfficialContentId('missing_hatched_animal'),
        fieldPath: '/animalId'
      })
    ]))
  })

  it('keeps coop and barn incubator behavior registry-backed', () => {
    const animalStore = useAnimalStore()
    const inventoryStore = useInventoryStore()
    const coop = animalStore.buildings.find(building => building.type === 'coop')!
    const barn = animalStore.buildings.find(building => building.type === 'barn')!
    coop.built = true
    coop.level = 2
    barn.built = true
    barn.level = 2

    expect(inventoryStore.addItem('duck_egg', 1)).toBe(true)
    expect(animalStore.startIncubation('duck_egg')).toEqual({
      success: true,
      message: '开始孵化鸭，预计7天后孵出。'
    })
    expect(inventoryStore.getItemCount('duck_egg')).toBe(0)
    animalStore.incubating!.daysLeft = 1
    expect(animalStore.dailyIncubatorUpdate().hatched).toEqual({ type: 'duck', name: '鸭1' })
    expect(animalStore.coopAnimals.map(animal => animal.type)).toEqual(['duck'])

    expect(inventoryStore.addItem('ostrich_egg', 1)).toBe(true)
    expect(animalStore.startBarnIncubation('ostrich_egg')).toEqual({
      success: true,
      message: '开始在牲口棚孵化鸵鸟，预计10天后孵出。'
    })
    expect(inventoryStore.getItemCount('ostrich_egg')).toBe(0)
    animalStore.barnIncubating!.daysLeft = 1
    expect(animalStore.dailyBarnIncubatorUpdate().hatched).toEqual({ type: 'ostrich', name: '鸵鸟1' })
    expect(animalStore.barnAnimals.map(animal => animal.type)).toEqual(['ostrich'])
  })
})
