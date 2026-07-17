import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ROULETTE_BET_TIERS as LEGACY_ROULETTE_BET_TIERS,
  ROULETTE_OUTCOMES as LEGACY_ROULETTE_OUTCOMES,
  spinRoulette
} from '@/data/hanhai'
import {
  HANHAI_ROULETTE_CONFIG,
  ROULETTE_BET_TIERS as LEAF_ROULETTE_BET_TIERS,
  ROULETTE_OUTCOMES as LEAF_ROULETTE_OUTCOMES
} from '@/data/hanhaiRouletteDefinitions'
import * as gameLog from '@/composables/useGameLog'
import {
  getOfficialHanhaiRouletteAsLegacy,
  getOfficialHanhaiRouletteBetTiers,
  getOfficialHanhaiRouletteDef,
  getOfficialHanhaiRouletteDefs,
  getOfficialHanhaiRouletteOutcomes
} from '@/domain/mods/contentAccess'
import { toOfficialContentId, toOfficialRegistryTypeId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  HanhaiRouletteDefSchema,
  type HanhaiRouletteDef as HanhaiRouletteContentDef
} from '@/domain/mods/schemas'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_PACKAGE_ID, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import { useHanhaiStore } from '@/stores/useHanhaiStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import validHanhaiRoulettes from '../fixtures/mods/minimal-valid-package/data/hanhai-roulettes.json'

const expectedContentDef = (): HanhaiRouletteContentDef => ({
  id: toOfficialContentId(`hanhai_roulette/${HANHAI_ROULETTE_CONFIG.id}`),
  outcomes: HANHAI_ROULETTE_CONFIG.outcomes.map((outcome, index) => ({
    label: {
      key: `taoyuan.hanhai.roulette.${HANHAI_ROULETTE_CONFIG.id}.outcome.${index}.label`,
      fallback: outcome.label
    },
    multiplier: outcome.multiplier,
    chance: outcome.chance
  })),
  betTiers: [...HANHAI_ROULETTE_CONFIG.betTiers]
})

describe('official hanhai roulette registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(gameLog, 'addLog').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates external hanhai roulette JSON before registration', () => {
    const externalRoulettes: unknown = validHanhaiRoulettes
    const result = validateUnknown(Type.Array(HanhaiRouletteDefSchema), externalRoulettes, {
      stage: 'test.hanhai-roulette'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid hanhai roulette shapes and numeric bounds', () => {
    const base = validHanhaiRoulettes[0]!
    const invalidRoulettes: unknown = [
      { ...base, id: 'missing_namespace' },
      { ...base, outcomes: [{ ...base.outcomes[0]!, label: 'plain text' }] },
      { ...base, outcomes: [{ ...base.outcomes[0]!, multiplier: -1 }] },
      { ...base, outcomes: [{ ...base.outcomes[0]!, chance: 0 }] },
      { ...base, outcomes: [{ ...base.outcomes[0]!, chance: 101 }] },
      { ...base, betTiers: [0] },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(HanhaiRouletteDefSchema), invalidRoulettes, {
      stage: 'test.hanhai-roulette.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/outcomes/0/label',
        '/2/outcomes/0/multiplier',
        '/3/outcomes/0/chance',
        '/4/outcomes/0/chance',
        '/5/betTiers/0',
        '/6/extra'
      ]))
    }
  })

  it('registers Hanhai roulette config in legacy order with equivalent fields', () => {
    expect(LEGACY_ROULETTE_OUTCOMES).toBe(LEAF_ROULETTE_OUTCOMES)
    expect(LEGACY_ROULETTE_BET_TIERS).toBe(LEAF_ROULETTE_BET_TIERS)
    expect(getOfficialHanhaiRouletteDefs()).toEqual([expectedContentDef()])
    expect(getOfficialHanhaiRouletteAsLegacy()).toEqual({
      id: HANHAI_ROULETTE_CONFIG.id,
      outcomes: LEGACY_ROULETTE_OUTCOMES,
      betTiers: [...LEGACY_ROULETTE_BET_TIERS]
    })
    expect(getOfficialHanhaiRouletteOutcomes()).toEqual(LEGACY_ROULETTE_OUTCOMES)
    expect(getOfficialHanhaiRouletteBetTiers()).toEqual([...LEGACY_ROULETTE_BET_TIERS])
    expect(getOfficialHanhaiRouletteDef(HANHAI_ROULETTE_CONFIG.id)).toEqual(expectedContentDef())
    expect(getOfficialHanhaiRouletteDef(`hanhai_roulette/${HANHAI_ROULETTE_CONFIG.id}`)).toBe(
      getOfficialHanhaiRouletteDef(HANHAI_ROULETTE_CONFIG.id)
    )
    expect(getOfficialHanhaiRouletteDef(toOfficialContentId(`hanhai_roulette/${HANHAI_ROULETTE_CONFIG.id}`))).toBe(
      getOfficialHanhaiRouletteDef(HANHAI_ROULETTE_CONFIG.id)
    )
  })

  it('reports roulette semantic diagnostics for chance totals and duplicate bet tiers', () => {
    const registrySet = buildOfficialRegistrySetFromStaticData()
    const registry = registrySet.get<HanhaiRouletteContentDef>(toOfficialRegistryTypeId('hanhai_roulette'))

    registry.register(OFFICIAL_PACKAGE_ID, {
      ...expectedContentDef(),
      id: toOfficialContentId('hanhai_roulette/bad_chance_total'),
      outcomes: [
        {
          label: {
            key: 'taoyuan.hanhai.roulette.bad_chance_total.outcome.empty.label',
            fallback: '空'
          },
          multiplier: 0,
          chance: 99
        }
      ]
    })
    registry.register(OFFICIAL_PACKAGE_ID, {
      ...expectedContentDef(),
      id: toOfficialContentId('hanhai_roulette/duplicate_tiers'),
      betTiers: [100, 100]
    })

    const diagnostics = validateRegistrySemantics(registrySet).filter(
      diagnostic => diagnostic.code === 'SCHEMA-VALIDATE-001'
    )

    expect(diagnostics).toContainEqual(expect.objectContaining({
      registryId: toOfficialRegistryTypeId('hanhai_roulette'),
      contentId: toOfficialContentId('hanhai_roulette/bad_chance_total'),
      fieldPath: '/outcomes'
    }))
    expect(diagnostics).toContainEqual(expect.objectContaining({
      registryId: toOfficialRegistryTypeId('hanhai_roulette'),
      contentId: toOfficialContentId('hanhai_roulette/duplicate_tiers'),
      fieldPath: '/betTiers'
    }))
  })

  it('keeps spinRoulette random thresholds unchanged with registry-backed outcomes', () => {
    const cases = [
      { random: 0, label: '空' },
      { random: 0.72, label: '空' },
      { random: 0.7201, label: '双倍' },
      { random: 0.9001, label: '三倍' },
      { random: 0.9701, label: '五倍' }
    ]

    for (const testCase of cases) {
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(testCase.random)
      expect(spinRoulette().label).toBe(testCase.label)
      expect(randomSpy).toHaveBeenCalledTimes(1)
      randomSpy.mockRestore()
    }
  })

  it('keeps Hanhai store roulette behavior registry-backed', () => {
    const hanhaiStore = useHanhaiStore()
    const playerStore = usePlayerStore()

    playerStore.money = 1000
    const invalidRandomSpy = vi.spyOn(Math, 'random')
    expect(hanhaiStore.playRoulette(99999)).toEqual({
      success: false,
      message: '无效的投注金额。',
      multiplier: 0,
      winnings: 0
    })
    expect(invalidRandomSpy).not.toHaveBeenCalled()
    invalidRandomSpy.mockRestore()

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.7201)
    expect(hanhaiStore.playRoulette(100)).toEqual({
      success: true,
      message: '轮盘停在了"双倍"',
      multiplier: 2,
      winnings: 200
    })
    expect(randomSpy).toHaveBeenCalledTimes(1)
    expect(playerStore.money).toBe(1100)
    expect(hanhaiStore.casinoBetsToday).toBe(1)
    expect(gameLog.addLog).toHaveBeenCalledWith('轮盘停在了"双倍"！赢得200文！')
  })
})
