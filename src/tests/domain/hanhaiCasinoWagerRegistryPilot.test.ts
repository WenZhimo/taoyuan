import { Type } from '@sinclair/typebox'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CUP_BET_AMOUNT as LEGACY_CUP_BET_AMOUNT,
  CUP_WIN_MULTIPLIER as LEGACY_CUP_WIN_MULTIPLIER,
  DICE_BET_AMOUNT as LEGACY_DICE_BET_AMOUNT,
  DICE_WIN_MULTIPLIER as LEGACY_DICE_WIN_MULTIPLIER,
  HANHAI_CASINO_WAGERS as LEGACY_HANHAI_CASINO_WAGERS
} from '@/data/hanhai'
import {
  CUP_BET_AMOUNT as LEAF_CUP_BET_AMOUNT,
  CUP_WIN_MULTIPLIER as LEAF_CUP_WIN_MULTIPLIER,
  DICE_BET_AMOUNT as LEAF_DICE_BET_AMOUNT,
  DICE_WIN_MULTIPLIER as LEAF_DICE_WIN_MULTIPLIER,
  HANHAI_CASINO_WAGERS as LEAF_HANHAI_CASINO_WAGERS
} from '@/data/hanhaiCasinoDefinitions'
import * as gameLog from '@/composables/useGameLog'
import {
  getOfficialHanhaiCasinoBetAmount,
  getOfficialHanhaiCasinoWager,
  getOfficialHanhaiCasinoWagerDef,
  getOfficialHanhaiCasinoWagerDefs,
  getOfficialHanhaiCasinoWagersAsLegacy,
  getOfficialHanhaiCasinoWinMultiplier
} from '@/domain/mods/contentAccess'
import { toOfficialContentId } from '@/domain/mods/ids'
import { validateUnknown } from '@/domain/mods/schemaValidation'
import {
  HanhaiCasinoWagerDefSchema,
  type HanhaiCasinoWagerDef as HanhaiCasinoWagerContentDef
} from '@/domain/mods/schemas'
import { useHanhaiStore } from '@/stores/useHanhaiStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import validHanhaiCasinoWagers from '../fixtures/mods/minimal-valid-package/data/hanhai-casino-wagers.json'

const expectedContentDefs = (): HanhaiCasinoWagerContentDef[] => [
  {
    id: toOfficialContentId('hanhai_casino_wager/dice'),
    betAmount: 200,
    winMultiplier: 2
  },
  {
    id: toOfficialContentId('hanhai_casino_wager/cup'),
    betAmount: 250,
    winMultiplier: 3
  }
]

describe('official hanhai casino wager registry pilot', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(gameLog, 'addLog').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates external hanhai casino wager JSON before registration', () => {
    const externalWagers: unknown = validHanhaiCasinoWagers
    const result = validateUnknown(Type.Array(HanhaiCasinoWagerDefSchema), externalWagers, {
      stage: 'test.hanhai-casino-wager'
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid hanhai casino wager shapes and numeric bounds', () => {
    const base = validHanhaiCasinoWagers[0]!
    const invalidWagers: unknown = [
      { ...base, id: 'missing_namespace' },
      { ...base, betAmount: 0 },
      { ...base, betAmount: 1.5 },
      { ...base, winMultiplier: 0 },
      { ...base, extra: true }
    ]
    const result = validateUnknown(Type.Array(HanhaiCasinoWagerDefSchema), invalidWagers, {
      stage: 'test.hanhai-casino-wager.invalid'
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.diagnostics.map(diagnostic => diagnostic.fieldPath)).toEqual(expect.arrayContaining([
        '/0/id',
        '/1/betAmount',
        '/2/betAmount',
        '/3/winMultiplier',
        '/4/extra'
      ]))
    }
  })

  it('registers dice and cup wager config with equivalent legacy values', () => {
    expect(LEGACY_HANHAI_CASINO_WAGERS).toBe(LEAF_HANHAI_CASINO_WAGERS)
    expect(LEGACY_DICE_BET_AMOUNT).toBe(LEAF_DICE_BET_AMOUNT)
    expect(LEGACY_DICE_WIN_MULTIPLIER).toBe(LEAF_DICE_WIN_MULTIPLIER)
    expect(LEGACY_CUP_BET_AMOUNT).toBe(LEAF_CUP_BET_AMOUNT)
    expect(LEGACY_CUP_WIN_MULTIPLIER).toBe(LEAF_CUP_WIN_MULTIPLIER)
    expect(getOfficialHanhaiCasinoWagerDefs()).toEqual(expectedContentDefs())
    expect(getOfficialHanhaiCasinoWagersAsLegacy()).toEqual(LEGACY_HANHAI_CASINO_WAGERS)
    expect(getOfficialHanhaiCasinoBetAmount('dice')).toBe(LEGACY_DICE_BET_AMOUNT)
    expect(getOfficialHanhaiCasinoWinMultiplier('dice')).toBe(LEGACY_DICE_WIN_MULTIPLIER)
    expect(getOfficialHanhaiCasinoBetAmount('cup')).toBe(LEGACY_CUP_BET_AMOUNT)
    expect(getOfficialHanhaiCasinoWinMultiplier('cup')).toBe(LEGACY_CUP_WIN_MULTIPLIER)
    expect(getOfficialHanhaiCasinoWager('dice')).toEqual({ id: 'dice', betAmount: 200, winMultiplier: 2 })
    expect(getOfficialHanhaiCasinoWager('hanhai_casino_wager/cup')).toEqual({ id: 'cup', betAmount: 250, winMultiplier: 3 })
    expect(getOfficialHanhaiCasinoWagerDef(toOfficialContentId('hanhai_casino_wager/dice'))).toBe(
      getOfficialHanhaiCasinoWagerDef('dice')
    )
  })

  it('keeps dice betting behavior and random calls unchanged', () => {
    const hanhaiStore = useHanhaiStore()
    const playerStore = usePlayerStore()
    playerStore.money = 1000

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(hanhaiStore.playDice(false)).toEqual({
      success: true,
      message: '赢了！',
      dice1: 1,
      dice2: 1,
      won: true,
      winnings: 400
    })

    expect(randomSpy).toHaveBeenCalledTimes(2)
    expect(playerStore.money).toBe(1200)
    expect(hanhaiStore.casinoBetsToday).toBe(1)
    expect(gameLog.addLog).toHaveBeenCalledWith('骰子1+1=2（小），你猜小——赢了400文！')
  })

  it('keeps cup betting behavior and random calls unchanged', () => {
    const hanhaiStore = useHanhaiStore()
    const playerStore = usePlayerStore()
    playerStore.money = 1000

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(hanhaiStore.playCup(0)).toEqual({
      success: true,
      message: '猜中了！',
      correctCup: 0,
      won: true,
      winnings: 750
    })

    expect(randomSpy).toHaveBeenCalledTimes(1)
    expect(playerStore.money).toBe(1500)
    expect(hanhaiStore.casinoBetsToday).toBe(1)
    expect(gameLog.addLog).toHaveBeenCalledWith('猜杯猜中了第1号杯！赢得750文！')
  })
})
