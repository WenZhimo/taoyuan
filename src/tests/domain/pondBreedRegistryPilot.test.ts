import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BREED_COUNTS, POND_BREEDS as LEGACY_POND_BREEDS } from '@/data/pondBreedDefinitions'
import {
  findBreedByParents,
  getBreedById,
  getBreedsByGeneration,
  getBreedsBySpecies,
  getGen1BreedsForFish
} from '@/data/pondBreeds'
import {
  findOfficialPondBreedByParents,
  getOfficialGen1PondBreedsForFish,
  getOfficialPondBreedById,
  getOfficialPondBreedDef,
  getOfficialPondBreedDefs,
  getOfficialPondBreedDefsAsLegacy,
  getOfficialPondBreedsByGeneration,
  getOfficialPondBreedsBySpecies
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { PondBreedDefSchema, type PondBreedDef as PondBreedContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useFishPondStore } from '@/stores/useFishPondStore'
import type { PondBreedDef as LegacyPondBreedDef, PondFish } from '@/types/fishPond'
import validPondBreeds from '../fixtures/mods/minimal-valid-package/data/pond-breeds.json'

const normalizeLegacyPondBreed = (breed: LegacyPondBreedDef): LegacyPondBreedDef => ({ ...breed })

const expectedPondBreedContentDef = (breed: LegacyPondBreedDef): PondBreedContentDef => ({
  id: toOfficialContentId(breed.breedId),
  name: { key: `taoyuan.pond_breed.${breed.breedId}.name`, fallback: breed.name },
  generation: breed.generation,
  baseFishId: toOfficialContentId(breed.baseFishId),
  parentBreedA: breed.parentBreedA ? toOfficialContentId(breed.parentBreedA) : null,
  parentBreedB: breed.parentBreedB ? toOfficialContentId(breed.parentBreedB) : null
})

describe('pond breed registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates external pond breed JSON before registration', () => {
    const externalPondBreeds: unknown = validPondBreeds
    const result = validateUnknown(Type.Array(PondBreedDefSchema), externalPondBreeds, {
      stage: 'test.pond-breeds'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid pond breed shape and generation values', () => {
    const base = validPondBreeds[0]!
    const invalidPondBreeds: unknown = [
      { ...base, generation: 0 },
      { ...base, generation: 6 },
      { ...base, baseFishId: 'missing_namespace' },
      { ...base, parentBreedA: 'missing_namespace' },
      { ...base, parentBreedB: 'missing_namespace' },
      { ...base, parentBreedA: 1 },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(PondBreedDefSchema), invalidPondBreeds, {
      stage: 'test.pond-breeds.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/generation',
        '/1/generation',
        '/2/baseFishId',
        '/3/parentBreedA',
        '/4/parentBreedB',
        '/5/parentBreedA',
        '/6/extra'
      ]))
    }
  })

  it('registers all pond breeds in legacy order with equivalent fields', () => {
    expect(getOfficialPondBreedDefs()).toHaveLength(LEGACY_POND_BREEDS.length)
    expect(getOfficialPondBreedDefs().map(breed => breed.id)).toEqual(
      LEGACY_POND_BREEDS.map(breed => toOfficialContentId(breed.breedId))
    )
    expect(getOfficialPondBreedDefsAsLegacy().map(normalizeLegacyPondBreed)).toEqual(
      LEGACY_POND_BREEDS.map(normalizeLegacyPondBreed)
    )

    for (const breed of LEGACY_POND_BREEDS) {
      expect(getOfficialPondBreedDef(breed.breedId)).toEqual(expectedPondBreedContentDef(breed))
      expect(getOfficialPondBreedDef(toOfficialContentId(breed.breedId))).toBe(
        getOfficialPondBreedDef(breed.breedId)
      )
      expect(getOfficialPondBreedById(breed.breedId)).toEqual(normalizeLegacyPondBreed(breed))
      expect(getBreedById(breed.breedId)).toEqual(normalizeLegacyPondBreed(breed))
    }
  })

  it('keeps generation, species and parent compatibility queries equivalent', () => {
    expect(BREED_COUNTS).toEqual({ 1: 200, 2: 100, 3: 50, 4: 30, 5: 20 })
    for (const generation of [1, 2, 3, 4, 5] as const) {
      expect(getOfficialPondBreedsByGeneration(generation).map(normalizeLegacyPondBreed)).toEqual(
        getBreedsByGeneration(generation).map(normalizeLegacyPondBreed)
      )
      expect(getBreedsByGeneration(generation)).toHaveLength(BREED_COUNTS[generation]!)
    }

    expect(getOfficialPondBreedsBySpecies('crucian').map(normalizeLegacyPondBreed)).toEqual(
      getBreedsBySpecies('crucian').map(normalizeLegacyPondBreed)
    )
    expect(getOfficialGen1PondBreedsForFish('crucian').map(normalizeLegacyPondBreed)).toEqual(
      getGen1BreedsForFish('crucian').map(normalizeLegacyPondBreed)
    )

    const child = getBreedById('g2_001')!
    expect(findOfficialPondBreedByParents(child.parentBreedA!, child.parentBreedB!)).toEqual(child)
    expect(findOfficialPondBreedByParents(child.parentBreedB!, child.parentBreedA!)).toEqual(child)
    expect(findBreedByParents(child.parentBreedA!, child.parentBreedB!)).toEqual(child)
    expect(findBreedByParents(child.parentBreedB!, child.parentBreedA!)).toEqual(child)
  })

  it('supports missing IDs and read-only registry entries', () => {
    const breed = getOfficialPondBreedDef('g1_001')

    expect(getOfficialPondBreedDef('missing_breed')).toBeUndefined()
    expect(getOfficialPondBreedById('missing_breed')).toBeUndefined()
    expect(getOfficialPondBreedsBySpecies('missing_fish')).toEqual([])
    expect(getOfficialGen1PondBreedsForFish('missing_fish')).toEqual([])
    expect(findOfficialPondBreedByParents('missing_a', 'missing_b')).toBeUndefined()
    expect(Object.isFrozen(breed)).toBe(true)
    expect(Object.isFrozen(breed?.name)).toBe(true)
  })

  it('reports missing pondable fish and parent breed references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<PondBreedContentDef>(toOfficialRegistryTypeId('pond_breed'))
    const missingFishId = toOfficialContentId('missing_pondable_fish_ref')
    const missingParentId = toOfficialContentId('missing_parent_breed')
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('invalid_pond_breed'),
      name: { key: 'test.pond-breed.invalid.name', fallback: 'Invalid Pond Breed' },
      generation: 2,
      baseFishId: missingFishId,
      parentBreedA: missingParentId,
      parentBreedB: toOfficialContentId('g1_001')
    })

    const diagnostics = validateRegistrySemantics(registrySet)

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('pondable_fish'),
        contentId: missingFishId,
        fieldPath: '/baseFishId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('pond_breed'),
        contentId: missingParentId,
        fieldPath: '/parentBreedA'
      })
    ]))
  })

  it('keeps fish pond breeding behavior registry-backed', () => {
    const fishPondStore = useFishPondStore()
    fishPondStore.pond.built = true
    fishPondStore.pond.level = 2
    fishPondStore.pond.waterQuality = 100
    fishPondStore.pond.fedToday = false
    const genetics = { weight: 50, growthRate: 50, diseaseRes: 100, qualityGene: 30, mutationRate: 10 }
    const parentA: PondFish = {
      id: 'parent-a',
      fishId: 'crucian',
      name: '银鲫',
      genetics: { ...genetics },
      daysInPond: 5,
      mature: true,
      sick: false,
      sickDays: 0,
      breedId: 'g1_001'
    }
    const parentB: PondFish = {
      id: 'parent-b',
      fishId: 'crucian',
      name: '金鲫',
      genetics: { ...genetics },
      daysInPond: 5,
      mature: true,
      sick: false,
      sickDays: 0,
      breedId: 'g1_002'
    }
    fishPondStore.pond.fish.push(parentA, parentB)
    fishPondStore.pond.nurseryBreeding.push({
      id: 'pair-1',
      parentA: parentA.id,
      parentB: parentB.id,
      daysLeft: 1,
      fishId: 'crucian'
    })
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const result = fishPondStore.dailyUpdate()

    expect(result.bred).toEqual(['灵鲫'])
    expect(fishPondStore.pond.fish[fishPondStore.pond.fish.length - 1]).toMatchObject({
      fishId: 'crucian',
      name: '灵鲫',
      breedId: 'g2_001',
      mature: false,
      sick: false
    })
  })
})
