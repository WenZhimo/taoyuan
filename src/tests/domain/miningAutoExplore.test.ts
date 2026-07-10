import { describe, expect, it } from 'vitest'
import {
  AUTO_EXPLORE_BEDTIME_STOP_MESSAGE,
  AUTO_EXPLORE_NO_ACTION_STOP_MESSAGE,
  chooseAutoExploreStep
} from '@/domain/mining/autoExplore'

const baseInput = {
  autoExploreActive: true,
  isExploring: true,
  playerHp: 100,
  isPastBedtime: false,
  inCombat: false,
  remainingCombatTiles: 0,
  stairsUsable: false
}

describe('mining auto explore decisions', () => {
  it('does nothing when auto explore is inactive', () => {
    expect(chooseAutoExploreStep({ ...baseInput, autoExploreActive: false })).toBe('idle')
  })

  it('stops when exploration is unavailable or the player is defeated', () => {
    expect(chooseAutoExploreStep({ ...baseInput, isExploring: false })).toBe('stop')
    expect(chooseAutoExploreStep({ ...baseInput, playerHp: 0 })).toBe('stop')
  })

  it('prioritizes bedtime before combat, chain battle, and stairs', () => {
    expect(
      chooseAutoExploreStep({
        ...baseInput,
        isPastBedtime: true,
        inCombat: true,
        remainingCombatTiles: 3,
        stairsUsable: true
      })
    ).toBe('sleepOrPassOut')

    expect(AUTO_EXPLORE_BEDTIME_STOP_MESSAGE).toBe('太晚了，自动探索已停止。')
  })

  it('continues current combat before starting new actions', () => {
    expect(
      chooseAutoExploreStep({
        ...baseInput,
        inCombat: true,
        remainingCombatTiles: 3,
        stairsUsable: true
      })
    ).toBe('continueCombat')
  })

  it('starts chain battle before going to the next floor', () => {
    expect(chooseAutoExploreStep({ ...baseInput, remainingCombatTiles: 2, stairsUsable: true })).toBe('startChainBattle')
  })

  it('uses stairs when no combat tiles remain', () => {
    expect(chooseAutoExploreStep({ ...baseInput, stairsUsable: true })).toBe('goNextFloor')
  })

  it('stops with the existing no-action message when the floor has no next action', () => {
    expect(chooseAutoExploreStep(baseInput)).toBe('stopNoAction')
    expect(AUTO_EXPLORE_NO_ACTION_STOP_MESSAGE).toBe('本层没有可连战的敌人或可用楼梯，自动探索已停止。')
  })
})
