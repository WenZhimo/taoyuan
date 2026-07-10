export interface SweepPreview {
  canSweep: boolean
  targetFloor: number | null
  estimatedDamage: number
  remainingMonsters: number
  message: string
}

export interface NextSafePointInput {
  currentFloor: number
  isSkullCavern: boolean
  maxMineFloor: number
}

export const getNextSafePointFloor = ({ currentFloor, isSkullCavern, maxMineFloor }: NextSafePointInput): number | null => {
  const interval = isSkullCavern ? 10 : 5
  const target = Math.ceil((currentFloor + 1) / interval) * interval
  if (!isSkullCavern && target > maxMineFloor) return null
  return target
}

export interface SweepPreviewInput {
  isExploring: boolean
  inCombat: boolean
  currentFloor: number
  targetFloor: number | null
  currentMonsterAttacks: readonly number[]
  isSkullCavern: boolean
  defenseBonus: number
  playerPower: number
  playerHp: number
}

export const calculateSweepPreview = ({
  isExploring,
  inCombat,
  currentFloor,
  targetFloor,
  currentMonsterAttacks,
  isSkullCavern,
  defenseBonus,
  playerPower,
  playerHp
}: SweepPreviewInput): SweepPreview => {
  if (!isExploring) {
    return { canSweep: false, targetFloor: null, estimatedDamage: 0, remainingMonsters: 0, message: '不在矿洞中。' }
  }
  if (inCombat) {
    return { canSweep: false, targetFloor: null, estimatedDamage: 0, remainingMonsters: 0, message: '战斗中无法扫荡。' }
  }
  if (targetFloor === null) {
    return { canSweep: false, targetFloor: null, estimatedDamage: 0, remainingMonsters: 0, message: '没有可抵达的下一个安全点。' }
  }

  const floorSpan = Math.max(1, targetFloor - currentFloor + 1)
  const currentAttackTotal = currentMonsterAttacks.reduce((sum, attack) => sum + attack, 0)
  const currentAvgAttack = currentMonsterAttacks.length > 0 ? currentAttackTotal / currentMonsterAttacks.length : currentFloor * 0.45 + 8
  const expectedMonsters = currentMonsterAttacks.length + Math.max(0, floorSpan - 1) * (isSkullCavern ? 4 : 3)
  const cappedDefenseBonus = Math.min(0.8, defenseBonus)
  const depthPressure = isSkullCavern ? 1.25 + currentFloor / 120 : 1 + currentFloor / 180
  const estimatedDamage = Math.max(
    1,
    Math.floor((currentAvgAttack * expectedMonsters * depthPressure - playerPower * 0.8) * (1 - cappedDefenseBonus))
  )
  const canSweep = playerHp > estimatedDamage

  return {
    canSweep,
    targetFloor,
    estimatedDamage,
    remainingMonsters: expectedMonsters,
    message: canSweep ? `预计损失${estimatedDamage}HP，抵达第${targetFloor}层安全点。` : `预计损失${estimatedDamage}HP，当前生命值不足。`
  }
}

export interface SweepDestinationInput {
  isSkullCavern: boolean
  targetFloor: number
  currentSafePointFloor: number
  skullSafePointFloor: number
  skullBestFloor: number
}

export interface SweepDestinationState {
  currentFloor?: number
  safePointFloor?: number
  skullCavernFloor?: number
  skullSafePointFloor?: number
  skullCavernBestFloor?: number
  reachedNewSkullBest: boolean
}

export const resolveSweepDestinationState = ({
  isSkullCavern,
  targetFloor,
  currentSafePointFloor,
  skullSafePointFloor,
  skullBestFloor
}: SweepDestinationInput): SweepDestinationState => {
  if (isSkullCavern) {
    return {
      skullCavernFloor: targetFloor,
      skullSafePointFloor: Math.max(skullSafePointFloor, targetFloor),
      skullCavernBestFloor: Math.max(skullBestFloor, targetFloor),
      reachedNewSkullBest: targetFloor > skullBestFloor
    }
  }

  return {
    currentFloor: targetFloor,
    safePointFloor: Math.max(currentSafePointFloor, targetFloor),
    reachedNewSkullBest: false
  }
}
