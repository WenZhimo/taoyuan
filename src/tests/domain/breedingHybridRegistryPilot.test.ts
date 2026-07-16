import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  HYBRID_DEFINITIONS,
  HYBRID_TIER_COUNTS
} from '@/data/breedingDefinitions'
import {
  HYBRID_DEFS,
  findPossibleHybrid,
  findPossibleHybridById,
  getHybridTier
} from '@/data/breeding'
import {
  findOfficialBreedingHybridByParents,
  getOfficialBreedingHybridById,
  getOfficialBreedingHybridDef,
  getOfficialBreedingHybridDefs,
  getOfficialBreedingHybridDefsAsLegacy,
  getOfficialBreedingHybridTier
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { RegistryError } from '@/domain/mods/registry'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  BreedingHybridDefSchema,
  type BreedingHybridDef as BreedingHybridContentDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import {
  OFFICIAL_PACKAGE_ID,
  adaptLegacyBreedingHybrid,
  buildOfficialRegistrySetFromStaticData
} from '@/domain/mods/staticAdapters'
import { useBreedingStore } from '@/stores/useBreedingStore'
import type { HybridDef, SeedGenetics } from '@/types/breeding'
import validBreedingHybrids from '../fixtures/mods/minimal-valid-package/data/breeding-hybrids.json'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const normalizeLegacyHybrid = (hybrid: HybridDef): HybridDef => ({
  ...hybrid,
  baseGenetics: { ...hybrid.baseGenetics }
})
const expectedBreedingHybridContentDef = (hybrid: HybridDef): BreedingHybridContentDef => ({
  id: toOfficialContentId(`breeding_hybrid/${hybrid.id}`),
  name: { key: `taoyuan.breeding_hybrid.${hybrid.id}.name`, fallback: hybrid.name },
  parentCropA: toOfficialContentId(hybrid.parentCropA),
  parentCropB: toOfficialContentId(hybrid.parentCropB),
  minSweetness: hybrid.minSweetness,
  minYield: hybrid.minYield,
  resultCropId: toOfficialContentId(hybrid.resultCropId),
  baseGenetics: { ...hybrid.baseGenetics },
  discoveryText: { key: `taoyuan.breeding_hybrid.${hybrid.id}.discovery`, fallback: hybrid.discoveryText }
})

const createGenetics = (
  id: string,
  cropId: string,
  sweetness = 50,
  yieldValue = 50,
  resistance = 50
): SeedGenetics => ({
  id,
  cropId,
  generation: 0,
  sweetness,
  yield: yieldValue,
  resistance,
  stability: 100,
  mutationRate: 1,
  parentA: null,
  parentB: null,
  parentCropA: null,
  parentCropB: null,
  isHybrid: false,
  hybridId: null
})

const expectedTierForIndex = (index: number): number => {
  let offset = 0
  for (let tier = 0; tier < HYBRID_TIER_COUNTS.length; tier++) {
    offset += HYBRID_TIER_COUNTS[tier]!
    if (index < offset) return tier + 1
  }
  return 1
}

describe('breeding hybrid registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates external breeding hybrid JSON before registration', () => {
    const externalHybrids: unknown = validBreedingHybrids
    const result = validateUnknown(Type.Array(BreedingHybridDefSchema), externalHybrids, {
      stage: 'test.breeding-hybrids'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid breeding hybrid shapes and bounds', () => {
    const base = validBreedingHybrids[0]!
    const invalidHybrids: unknown = [
      { ...base, id: 'missing_namespace' },
      { ...base, parentCropA: 'missing_namespace' },
      { ...base, parentCropB: 'missing_namespace' },
      { ...base, minSweetness: -1 },
      { ...base, minYield: 101 },
      { ...base, resultCropId: 'missing_namespace' },
      { ...base, baseGenetics: { ...base.baseGenetics, sweetness: 101 } },
      { ...base, discoveryText: 'plain text' },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(BreedingHybridDefSchema), invalidHybrids, {
      stage: 'test.breeding-hybrids.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/parentCropA',
        '/2/parentCropB',
        '/3/minSweetness',
        '/4/minYield',
        '/5/resultCropId',
        '/6/baseGenetics/sweetness',
        '/7/discoveryText',
        '/8/extra'
      ]))
    }
  })

  it('registers all breeding hybrids in legacy order with equivalent fields and compatible IDs', () => {
    expect(getOfficialBreedingHybridDefs()).toHaveLength(HYBRID_DEFINITIONS.length)
    expect(getOfficialBreedingHybridDefs().map(hybrid => hybrid.id)).toEqual(
      HYBRID_DEFINITIONS.map(hybrid => toOfficialContentId(`breeding_hybrid/${hybrid.id}`))
    )
    expect(getOfficialBreedingHybridDefsAsLegacy().map(normalizeLegacyHybrid)).toEqual(
      HYBRID_DEFINITIONS.map(normalizeLegacyHybrid)
    )
    expect(HYBRID_DEFS.map(normalizeLegacyHybrid)).toEqual(HYBRID_DEFINITIONS.map(normalizeLegacyHybrid))

    for (const hybrid of HYBRID_DEFINITIONS.slice(0, 20)) {
      expect(getOfficialBreedingHybridDef(hybrid.id)).toEqual(expectedBreedingHybridContentDef(hybrid))
      expect(getOfficialBreedingHybridDef(`breeding_hybrid/${hybrid.id}`)).toBe(
        getOfficialBreedingHybridDef(hybrid.id)
      )
      expect(getOfficialBreedingHybridDef(toOfficialContentId(`breeding_hybrid/${hybrid.id}`))).toBe(
        getOfficialBreedingHybridDef(hybrid.id)
      )
      expect(getOfficialBreedingHybridById(hybrid.id)).toEqual(normalizeLegacyHybrid(hybrid))
      expect(findPossibleHybridById(hybrid.id)).toEqual(normalizeLegacyHybrid(hybrid))
    }
  })

  it('keeps parent matching and tier calculations equivalent', () => {
    for (const [index, hybrid] of HYBRID_DEFINITIONS.entries()) {
      const expectedTier = expectedTierForIndex(index)
      expect(getOfficialBreedingHybridTier(hybrid.id)).toBe(expectedTier)
      expect(getHybridTier(hybrid.id)).toBe(expectedTier)
    }

    const first = HYBRID_DEFINITIONS[0]!
    expect(findOfficialBreedingHybridByParents(first.parentCropA, first.parentCropB)).toEqual(
      normalizeLegacyHybrid(first)
    )
    expect(findOfficialBreedingHybridByParents(first.parentCropB, first.parentCropA)).toEqual(
      normalizeLegacyHybrid(first)
    )
    expect(findOfficialBreedingHybridByParents(toOfficialContentId(first.parentCropA), first.parentCropB)).toEqual(
      normalizeLegacyHybrid(first)
    )
    expect(findPossibleHybrid(first.parentCropA, first.parentCropB)).toEqual(normalizeLegacyHybrid(first))
    expect(findPossibleHybrid(first.parentCropB, first.parentCropA)).toEqual(normalizeLegacyHybrid(first))
  })

  it('supports missing IDs, duplicate ID rejection and read-only registry entries', () => {
    const first = getOfficialBreedingHybridDef(HYBRID_DEFINITIONS[0]!.id)
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<BreedingHybridContentDef>(toOfficialRegistryTypeId('breeding_hybrid'))

    expect(getOfficialBreedingHybridDef('missing_hybrid')).toBeUndefined()
    expect(getOfficialBreedingHybridById('missing_hybrid')).toBeUndefined()
    expect(findOfficialBreedingHybridByParents('missing_a', 'missing_b')).toBeUndefined()
    expect(getOfficialBreedingHybridTier('missing_hybrid')).toBe(1)
    expect(Object.isFrozen(first)).toBe(true)
    expect(Object.isFrozen(first?.name)).toBe(true)
    expect(Object.isFrozen(first?.baseGenetics)).toBe(true)
    expect(() => registry.register(
      OFFICIAL_PACKAGE_ID,
      adaptLegacyBreedingHybrid(HYBRID_DEFINITIONS[0]!)
    )).toThrow(RegistryError)
  })

  it('reports missing parent and result crop references', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<BreedingHybridContentDef>(toOfficialRegistryTypeId('breeding_hybrid'))
    const missingParentA = toOfficialContentId('missing_parent_a')
    const missingParentB = toOfficialContentId('missing_parent_b')
    const missingResult = toOfficialContentId('missing_result_crop')
    registry.register(OFFICIAL_PACKAGE_ID, {
      id: toOfficialContentId('breeding_hybrid/missing_refs'),
      name: { key: 'test.breeding-hybrid.missing.name', fallback: 'Missing refs' },
      parentCropA: missingParentA,
      parentCropB: missingParentB,
      minSweetness: 1,
      minYield: 1,
      resultCropId: missingResult,
      baseGenetics: { sweetness: 1, yield: 1, resistance: 1 },
      discoveryText: { key: 'test.breeding-hybrid.missing.discovery', fallback: 'Missing refs' }
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(diagnostic =>
      diagnostic.contentId === missingParentA ||
      diagnostic.contentId === missingParentB ||
      diagnostic.contentId === missingResult
    )

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('crop'),
        contentId: missingParentA,
        fieldPath: '/parentCropA'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('crop'),
        contentId: missingParentB,
        fieldPath: '/parentCropB'
      }),
      expect.objectContaining({
        code: 'REG-REFERENCE-001',
        registryId: toOfficialRegistryTypeId('crop'),
        contentId: missingResult,
        fieldPath: '/resultCropId'
      })
    ]))
  })

  it('keeps breeding store hybrid completion behavior registry-backed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const breedingStore = useBreedingStore()
    const emeraldRadish = findPossibleHybrid('cabbage', 'radish')!
    breedingStore.deserialize({
      stationCount: 1,
      stations: [
        {
          parentA: createGenetics('parent-a', 'cabbage', 50, 50, 50),
          parentB: createGenetics('parent-b', 'radish', 50, 50, 50),
          daysProcessed: 0,
          totalDays: 1,
          result: null,
          ready: false
        }
      ],
      compendium: []
    })

    const result = breedingStore.dailyUpdate()

    expect(result.completedCount).toBe(1)
    expect(result.logs).toEqual(expect.arrayContaining([
      emeraldRadish.discoveryText,
      `杂交成功：${emeraldRadish.name}（2星）！已记录到图鉴。`
    ]))
    expect(breedingStore.stations[0]?.result).toMatchObject({
      cropId: emeraldRadish.resultCropId,
      isHybrid: true,
      hybridId: emeraldRadish.id,
      parentCropA: 'cabbage',
      parentCropB: 'radish'
    })
    expect(breedingStore.compendium).toEqual([
      expect.objectContaining({
        hybridId: emeraldRadish.id,
        bestTotalStats: 123,
        timesGrown: 0
      })
    ])
    expect(clone(findPossibleHybridById(emeraldRadish.id))).toEqual(clone(emeraldRadish))
  })
})
