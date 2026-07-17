import type { RouletteOutcome } from '@/types'

export interface HanhaiRouletteDefinition {
  id: string
  outcomes: RouletteOutcome[]
  betTiers: readonly number[]
}

/** 轮盘赔率 */
export const ROULETTE_OUTCOMES: RouletteOutcome[] = [
  { label: '空', multiplier: 0, chance: 72 },
  { label: '双倍', multiplier: 2, chance: 18 },
  { label: '三倍', multiplier: 3, chance: 7 },
  { label: '五倍', multiplier: 5, chance: 3 }
]

/** 轮盘投注档位 */
export const ROULETTE_BET_TIERS = [100, 500, 1000] as const

export const HANHAI_ROULETTE_CONFIG: HanhaiRouletteDefinition = {
  id: 'lucky',
  outcomes: ROULETTE_OUTCOMES,
  betTiers: ROULETTE_BET_TIERS
}
