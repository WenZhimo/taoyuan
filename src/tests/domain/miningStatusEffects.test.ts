import { describe, expect, it } from 'vitest'
import {
  createCombatStatus,
  getStatusPower,
  hasCombatStatus,
  mergeCombatStatus,
  tickCombatStatuses
} from '@/domain/mining/statusEffects'
import type { CombatStatusEffect } from '@/types'

const status = (overrides: Partial<CombatStatusEffect>): CombatStatusEffect => ({
  type: 'poison',
  name: '中毒',
  remainingTurns: 2,
  power: 0.1,
  source: 'monster',
  ...overrides
})

describe('mining combat status effects', () => {
  it('creates statuses with the localized combat status name', () => {
    expect(createCombatStatus('burn', 3, 0.06, 'player')).toEqual({
      type: 'burn',
      name: '燃烧',
      remainingTurns: 3,
      power: 0.06,
      source: 'player'
    })
  })

  it('merges duplicate statuses by max power and longest remaining turns', () => {
    const merged = mergeCombatStatus(
      [status({ type: 'poison', power: 0.04, remainingTurns: 2 })],
      status({ type: 'poison', power: 0.08, remainingTurns: 4 })
    )

    expect(merged).toEqual([status({ type: 'poison', power: 0.08, remainingTurns: 4 })])
  })

  it('keeps permanent statuses permanent when merging turns', () => {
    const merged = mergeCombatStatus(
      [status({ type: 'radiation', name: '辐射', remainingTurns: null, power: 0.04 })],
      status({ type: 'radiation', name: '辐射', remainingTurns: 3, power: 0.08 })
    )

    expect(merged[0]).toMatchObject({
      type: 'radiation',
      remainingTurns: null,
      power: 0.08
    })
  })

  it('sums status power and checks presence by type', () => {
    const statuses = [
      status({ type: 'battle_rage', name: '战意', power: 100, source: 'item' }),
      status({ type: 'battle_rage', name: '战意', power: 50, source: 'item' }),
      status({ type: 'iron_skin', name: '铁皮', power: 0.2, source: 'item' })
    ]

    expect(getStatusPower(statuses, 'battle_rage')).toBe(150)
    expect(hasCombatStatus(statuses, 'iron_skin')).toBe(true)
    expect(hasCombatStatus(statuses, 'freeze')).toBe(false)
  })

  it('ticks damaging statuses and removes expired statuses', () => {
    const result = tickCombatStatuses(
      [
        status({ type: 'poison', name: '中毒', power: 0.1, remainingTurns: 1 }),
        status({ type: 'freeze', name: '冻结', power: 1, remainingTurns: 1 }),
        status({ type: 'radiation', name: '辐射', power: 0.08, remainingTurns: null })
      ],
      50
    )

    expect(result.damageByStatus.map(item => ({ type: item.status.type, damage: item.damage }))).toEqual([
      { type: 'poison', damage: 5 },
      { type: 'radiation', damage: 4 }
    ])
    expect(result.remainingStatuses).toEqual([status({ type: 'radiation', name: '辐射', power: 0.08, remainingTurns: null })])
  })
})
