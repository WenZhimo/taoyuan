import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PONDABLE_FISH as LEGACY_PONDABLE_FISH } from '@/data/fishPondDefinitions'
import { getPondableFish, getPondableFishDefs, isPondableFish } from '@/data/fishPond'
import {
  getOfficialPondableFishById,
  getOfficialPondableFishDef,
  getOfficialPondableFishDefs,
  getOfficialPondableFishDefsAsLegacy
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import { PondableFishDefSchema, type PondableFishDef as PondableFishContentDef } from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useFishPondStore } from '@/stores/useFishPondStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import type { PondableFishDef as LegacyPondableFishDef } from '@/types/fishPond'
import validPondableFish from '../fixtures/mods/minimal-valid-package/data/pondable-fish.json'

const normalizeLegacyPondableFish = (fish: LegacyPondableFishDef): LegacyPondableFishDef => ({
  ...fish,
  defaultGenetics: { ...fish.defaultGenetics }
})

const expectedPondableFishContentDef = (fish: LegacyPondableFishDef): PondableFishContentDef => ({
  id: toOfficialContentId(fish.fishId),
  fishItemId: toOfficialContentId(fish.fishId),
  name: { key: `taoyuan.pondable_fish.${fish.fishId}.name`, fallback: fish.name },
  maturityDays: fish.maturityDays,
  baseProductionRate: fish.baseProductionRate,
  productItemId: toOfficialContentId(fish.productItemId),
  defaultGenetics: { ...fish.defaultGenetics }
})

describe('pondable fish registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates external pondable fish JSON before registration', () => {
    const externalPondableFish: unknown = validPondableFish
    const result = validateUnknown(Type.Array(PondableFishDefSchema), externalPondableFish, {
      stage: 'test.pondable-fish'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid pondable fish shape and numeric bounds', () => {
    const base = validPondableFish[0]!
    const invalidPondableFish: unknown = [
      { ...base, maturityDays: 0 },
      { ...base, maturityDays: 1.5 },
      { ...base, baseProductionRate: -0.01 },
      { ...base, baseProductionRate: 1.01 },
      { ...base, defaultGenetics: { ...base.defaultGenetics, weight: -1 } },
      { ...base, defaultGenetics: { ...base.defaultGenetics, growthRate: 101 } },
      { ...base, defaultGenetics: { ...base.defaultGenetics, diseaseRes: -1 } },
      { ...base, defaultGenetics: { ...base.defaultGenetics, qualityGene: 101 } },
      { ...base, defaultGenetics: { ...base.defaultGenetics, mutationRate: 0 } },
      { ...base, defaultGenetics: { ...base.defaultGenetics, mutationRate: 51 } },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(PondableFishDefSchema), invalidPondableFish, {
      stage: 'test.pondable-fish.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/maturityDays',
        '/1/maturityDays',
        '/2/baseProductionRate',
        '/3/baseProductionRate',
        '/4/defaultGenetics/weight',
        '/5/defaultGenetics/growthRate',
        '/6/defaultGenetics/diseaseRes',
        '/7/defaultGenetics/qualityGene',
        '/8/defaultGenetics/mutationRate',
        '/9/defaultGenetics/mutationRate',
        '/10/extra'
      ]))
    }
  })

  it('registers all pondable fish in legacy order with equivalent fields', () => {
    expect(getOfficialPondableFishDefs()).toHaveLength(LEGACY_PONDABLE_FISH.length)
    expect(getOfficialPondableFishDefs().map(fish => fish.id)).toEqual(
      LEGACY_PONDABLE_FISH.map(fish => toOfficialContentId(fish.fishId))
    )
    expect(getOfficialPondableFishDefsAsLegacy().map(normalizeLegacyPondableFish)).toEqual(
      LEGACY_PONDABLE_FISH.map(normalizeLegacyPondableFish)
    )
    expect(getPondableFishDefs().map(normalizeLegacyPondableFish)).toEqual(
      LEGACY_PONDABLE_FISH.map(normalizeLegacyPondableFish)
    )

    for (const fish of LEGACY_PONDABLE_FISH) {
      expect(getOfficialPondableFishDef(fish.fishId)).toEqual(expectedPondableFishContentDef(fish))
      expect(getOfficialPondableFishDef(toOfficialContentId(fish.fishId))).toBe(
        getOfficialPondableFishDef(fish.fishId)
      )
      expect(getOfficialPondableFishById(fish.fishId)).toEqual(normalizeLegacyPondableFish(fish))
      expect(getPondableFish(fish.fishId)).toEqual(normalizeLegacyPondableFish(fish))
      expect(isPondableFish(fish.fishId)).toBe(true)
    }
  })

  it('supports missing IDs and read-only registry entries', () => {
    const crucian = getOfficialPondableFishDef('crucian')

    expect(getOfficialPondableFishDef('missing_pondable_fish')).toBeUndefined()
    expect(getOfficialPondableFishById('missing_pondable_fish')).toBeUndefined()
    expect(getPondableFish('missing_pondable_fish')).toBeUndefined()
    expect(isPondableFish('missing_pondable_fish')).toBe(false)
    expect(Object.isFrozen(crucian)).toBe(true)
    expect(Object.isFrozen(crucian?.name)).toBe(true)
    expect(Object.isFrozen(crucian?.defaultGenetics)).toBe(true)
  })

  it('reports missing fish and product item references for pondable fish definitions', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<PondableFishContentDef>(toOfficialRegistryTypeId('pondable_fish'))
    const missingFishId = toOfficialContentId('missing_pondable_fish_ref')
    const missingProductId = toOfficialContentId('missing_pondable_fish_product')
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('invalid_pondable_fish'),
      fishItemId: missingFishId,
      name: { key: 'test.pondable-fish.invalid.name', fallback: 'Invalid Pondable Fish' },
      maturityDays: 1,
      baseProductionRate: 0.1,
      productItemId: missingProductId,
      defaultGenetics: {
        weight: 50,
        growthRate: 50,
        diseaseRes: 50,
        qualityGene: 30,
        mutationRate: 10
      }
    })

    const diagnostics = validateRegistrySemantics(registrySet)

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('fish'),
        contentId: missingFishId,
        fieldPath: '/fishItemId'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('item'),
        contentId: missingProductId,
        fieldPath: '/productItemId'
      })
    ]))
  })

  it('keeps fish pond add and daily production behavior registry-backed', () => {
    const inventoryStore = useInventoryStore()
    const fishPondStore = useFishPondStore()
    fishPondStore.pond.built = true
    fishPondStore.pond.level = 1

    expect(inventoryStore.addItem('crucian', 1)).toBe(true)
    vi.spyOn(Math, 'random').mockReturnValue(0)

    expect(fishPondStore.addFish('crucian')).toBe(1)
    expect(inventoryStore.getItemCount('crucian')).toBe(0)
    expect(fishPondStore.pond.fish[0]?.fishId).toBe('crucian')
    expect(fishPondStore.pond.fish[0]?.genetics).toEqual(getPondableFish('crucian')?.defaultGenetics)

    const fish = fishPondStore.pond.fish[0]!
    fish.mature = true
    fish.daysInPond = getPondableFish('crucian')!.maturityDays
    fishPondStore.pond.fedToday = true

    const dailyResult = fishPondStore.dailyUpdate()

    expect(dailyResult.products).toEqual([{ itemId: 'crucian', quality: 'fine' }])
    expect(fishPondStore.pendingProducts).toEqual(dailyResult.products)
    expect(fishPondStore.pond.fedToday).toBe(false)
  })
})
