import type { HanhaiCasinoWagerDef } from '@/types'

export const HANHAI_CASINO_WAGERS: HanhaiCasinoWagerDef[] = [
  {
    id: 'dice',
    betAmount: 200,
    winMultiplier: 2
  },
  {
    id: 'cup',
    betAmount: 250,
    winMultiplier: 3
  }
]

export const DICE_BET_AMOUNT = HANHAI_CASINO_WAGERS[0]!.betAmount
export const DICE_WIN_MULTIPLIER = HANHAI_CASINO_WAGERS[0]!.winMultiplier
export const CUP_BET_AMOUNT = HANHAI_CASINO_WAGERS[1]!.betAmount
export const CUP_WIN_MULTIPLIER = HANHAI_CASINO_WAGERS[1]!.winMultiplier
