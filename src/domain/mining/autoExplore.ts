export type AutoExploreStep =
  | 'idle'
  | 'stop'
  | 'sleepOrPassOut'
  | 'continueCombat'
  | 'startChainBattle'
  | 'goNextFloor'
  | 'stopNoAction'

export interface AutoExploreStepInput {
  autoExploreActive: boolean
  isExploring: boolean
  playerHp: number
  isPastBedtime: boolean
  inCombat: boolean
  remainingCombatTiles: number
  stairsUsable: boolean
}

export const AUTO_EXPLORE_BEDTIME_STOP_MESSAGE = '太晚了，自动探索已停止。'
export const AUTO_EXPLORE_NO_ACTION_STOP_MESSAGE = '本层没有可连战的敌人或可用楼梯，自动探索已停止。'

export const chooseAutoExploreStep = ({
  autoExploreActive,
  isExploring,
  playerHp,
  isPastBedtime,
  inCombat,
  remainingCombatTiles,
  stairsUsable
}: AutoExploreStepInput): AutoExploreStep => {
  if (!autoExploreActive) return 'idle'
  if (!isExploring || playerHp <= 0) return 'stop'
  if (isPastBedtime) return 'sleepOrPassOut'
  if (inCombat) return 'continueCombat'
  if (remainingCombatTiles > 0) return 'startChainBattle'
  if (stairsUsable) return 'goNextFloor'
  return 'stopNoAction'
}
