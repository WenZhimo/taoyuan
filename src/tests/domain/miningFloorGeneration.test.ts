import { describe, expect, it } from 'vitest'
import { replaceBossTilesWithWeakenedBoss, shouldUseWeakenedBoss, type FloorGridResult } from '@/domain/mining/floorGeneration'
import type { MineFloorDef, MineTile, MonsterDef } from '@/types'

const monster = (id: string, hp: number): MonsterDef => ({
  id,
  name: id,
  hp,
  attack: 10,
  defense: 2,
  expReward: 1,
  drops: [],
  description: id
})

const floor = (specialType: MineFloorDef['specialType']): MineFloorDef => ({
  floor: 10,
  zone: 'shallow',
  ores: [],
  monsters: [],
  isSafePoint: true,
  specialType
})

describe('mining floor generation rules', () => {
  it('uses weakened boss only for defeated normal mine boss floors', () => {
    expect(
      shouldUseWeakenedBoss({
        floor: floor('boss'),
        floorNum: 10,
        isSkullCavern: false,
        defeatedBossIds: ['boss_10'],
        bossId: 'boss_10'
      })
    ).toBe(true)

    expect(
      shouldUseWeakenedBoss({
        floor: floor('boss'),
        floorNum: 10,
        isSkullCavern: true,
        defeatedBossIds: ['boss_10'],
        bossId: 'boss_10'
      })
    ).toBe(false)

    expect(
      shouldUseWeakenedBoss({
        floor: floor(null),
        floorNum: 10,
        isSkullCavern: false,
        defeatedBossIds: ['boss_10'],
        bossId: 'boss_10'
      })
    ).toBe(false)
  })

  it('keeps first-kill boss floors unchanged', () => {
    expect(
      shouldUseWeakenedBoss({
        floor: floor('boss'),
        floorNum: 10,
        isSkullCavern: false,
        defeatedBossIds: [],
        bossId: 'boss_10'
      })
    ).toBe(false)
  })

  it('replaces only boss tile monsters with the weakened boss', () => {
    const originalBoss = monster('boss_10', 100)
    const weakBoss = monster('boss_10_weak', 40)
    const normalMonster = monster('slime', 20)
    const tiles: MineTile[] = [
      { index: 0, type: 'boss', state: 'hidden', data: { monster: originalBoss, isBoss: true } },
      { index: 1, type: 'monster', state: 'hidden', data: { monster: normalMonster } },
      { index: 2, type: 'empty', state: 'revealed' }
    ]
    const result: FloorGridResult = { tiles, entryIndex: 2, totalMonsters: 2, stairsUsable: false }

    expect(replaceBossTilesWithWeakenedBoss(result, weakBoss)).toEqual({
      tiles: [
        { index: 0, type: 'boss', state: 'hidden', data: { monster: weakBoss, isBoss: true } },
        { index: 1, type: 'monster', state: 'hidden', data: { monster: normalMonster } },
        { index: 2, type: 'empty', state: 'revealed' }
      ],
      entryIndex: 2,
      totalMonsters: 2,
      stairsUsable: false
    })
  })
})
