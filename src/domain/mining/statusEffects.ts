import type { CombatStatusEffect, CombatStatusType } from '@/types'

export const COMBAT_STATUS_NAMES: Record<CombatStatusType, string> = {
  poison: '中毒',
  burn: '燃烧',
  freeze: '冻结',
  radiation: '辐射',
  battle_rage: '战意',
  iron_skin: '铁皮'
}

export const createCombatStatus = (
  type: CombatStatusType,
  remainingTurns: number | null,
  power: number,
  source: CombatStatusEffect['source']
): CombatStatusEffect => ({
  type,
  name: COMBAT_STATUS_NAMES[type],
  remainingTurns,
  power,
  source
})

export const mergeCombatStatus = (
  statuses: readonly CombatStatusEffect[],
  status: CombatStatusEffect
): CombatStatusEffect[] => {
  const merged = statuses.map(item => ({ ...item }))
  const existing = merged.find(item => item.type === status.type)

  if (!existing) {
    merged.push({ ...status })
    return merged
  }

  existing.power = Math.max(existing.power, status.power)
  if (existing.remainingTurns === null || status.remainingTurns === null) {
    existing.remainingTurns = null
  } else {
    existing.remainingTurns = Math.max(existing.remainingTurns, status.remainingTurns)
  }
  return merged
}

export const getStatusPower = (statuses: readonly CombatStatusEffect[], type: CombatStatusType): number => {
  return statuses.filter(status => status.type === type).reduce((sum, status) => sum + status.power, 0)
}

export const hasCombatStatus = (statuses: readonly CombatStatusEffect[], type: CombatStatusType): boolean => {
  return statuses.some(status => status.type === type)
}

export const getStatusTickDamage = (status: CombatStatusEffect, maxHp: number): number => {
  if (status.type !== 'poison' && status.type !== 'burn' && status.type !== 'radiation') return 0
  return Math.max(1, Math.floor(maxHp * status.power))
}

export interface CombatStatusTickResult {
  damageByStatus: Array<{ status: CombatStatusEffect; damage: number }>
  remainingStatuses: CombatStatusEffect[]
}

export const tickCombatStatuses = (statuses: readonly CombatStatusEffect[], maxHp: number): CombatStatusTickResult => {
  const damageByStatus: Array<{ status: CombatStatusEffect; damage: number }> = []
  const ticked = statuses.map(status => {
    const next = { ...status }
    const damage = getStatusTickDamage(next, maxHp)
    if (damage > 0) damageByStatus.push({ status: next, damage })
    if (next.remainingTurns !== null) next.remainingTurns--
    return next
  })

  return {
    damageByStatus,
    remainingStatuses: ticked.filter(status => status.remainingTurns === null || status.remainingTurns > 0)
  }
}
