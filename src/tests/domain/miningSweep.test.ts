import { describe, expect, it } from 'vitest'
import { calculateSweepPreview, getNextSafePointFloor, resolveSweepDestinationState } from '@/domain/mining/sweep'

describe('mining sweep rules', () => {
  it('finds the next safe point for normal and skull cavern floors', () => {
    expect(getNextSafePointFloor({ currentFloor: 7, isSkullCavern: false, maxMineFloor: 120 })).toBe(10)
    expect(getNextSafePointFloor({ currentFloor: 119, isSkullCavern: false, maxMineFloor: 120 })).toBe(120)
    expect(getNextSafePointFloor({ currentFloor: 120, isSkullCavern: false, maxMineFloor: 120 })).toBeNull()
    expect(getNextSafePointFloor({ currentFloor: 123, isSkullCavern: true, maxMineFloor: 120 })).toBe(130)
  })

  it('blocks sweep preview when outside the mine, in combat, or without a target floor', () => {
    const base = {
      isExploring: true,
      inCombat: false,
      currentFloor: 8,
      targetFloor: 10,
      currentMonsterAttacks: [8, 12],
      isSkullCavern: false,
      defenseBonus: 0,
      playerPower: 20,
      playerHp: 100
    }

    expect(calculateSweepPreview({ ...base, isExploring: false })).toMatchObject({
      canSweep: false,
      targetFloor: null,
      message: '不在矿洞中。'
    })
    expect(calculateSweepPreview({ ...base, inCombat: true })).toMatchObject({
      canSweep: false,
      targetFloor: null,
      message: '战斗中无法扫荡。'
    })
    expect(calculateSweepPreview({ ...base, targetFloor: null })).toMatchObject({
      canSweep: false,
      targetFloor: null,
      message: '没有可抵达的下一个安全点。'
    })
  })

  it('estimates normal mine sweep damage from current monsters and player power', () => {
    expect(
      calculateSweepPreview({
        isExploring: true,
        inCombat: false,
        currentFloor: 8,
        targetFloor: 10,
        currentMonsterAttacks: [10, 20],
        isSkullCavern: false,
        defenseBonus: 0.1,
        playerPower: 30,
        playerHp: 100
      })
    ).toEqual({
      canSweep: true,
      targetFloor: 10,
      estimatedDamage: 91,
      remainingMonsters: 8,
      message: '预计损失91HP，抵达第10层安全点。'
    })
  })

  it('uses fallback attack, skull monster density, and capped defense for deep sweeps', () => {
    expect(
      calculateSweepPreview({
        isExploring: true,
        inCombat: false,
        currentFloor: 21,
        targetFloor: 30,
        currentMonsterAttacks: [],
        isSkullCavern: true,
        defenseBonus: 1.2,
        playerPower: 100,
        playerHp: 10
      })
    ).toEqual({
      canSweep: false,
      targetFloor: 30,
      estimatedDamage: 163,
      remainingMonsters: 36,
      message: '预计损失163HP，当前生命值不足。'
    })
  })

  it('resolves normal mine sweep destination and safe point state', () => {
    expect(
      resolveSweepDestinationState({
        isSkullCavern: false,
        targetFloor: 30,
        currentSafePointFloor: 25,
        skullSafePointFloor: 0,
        skullBestFloor: 0
      })
    ).toEqual({
      currentFloor: 30,
      safePointFloor: 30,
      reachedNewSkullBest: false
    })
  })

  it('resolves skull cavern sweep destination, safe point, and best floor state', () => {
    expect(
      resolveSweepDestinationState({
        isSkullCavern: true,
        targetFloor: 40,
        currentSafePointFloor: 120,
        skullSafePointFloor: 30,
        skullBestFloor: 35
      })
    ).toEqual({
      skullCavernFloor: 40,
      skullSafePointFloor: 40,
      skullCavernBestFloor: 40,
      reachedNewSkullBest: true
    })

    expect(
      resolveSweepDestinationState({
        isSkullCavern: true,
        targetFloor: 20,
        currentSafePointFloor: 120,
        skullSafePointFloor: 30,
        skullBestFloor: 35
      })
    ).toEqual({
      skullCavernFloor: 20,
      skullSafePointFloor: 30,
      skullCavernBestFloor: 35,
      reachedNewSkullBest: false
    })
  })
})
