import { describe, expect, it } from 'vitest'
import { buildMineElevatorZones, buildMineMapZones, buildSkullElevatorFloors, createMineLeaveHint } from '@/domain/mining/navigationDisplay'

describe('mining navigation display rules', () => {
  it('builds mine map zones with progress, current-zone, and boss states', () => {
    const zones = buildMineMapZones({
      safePointFloor: 45,
      defeatedBossIds: ['frost_guardian'],
      bossesByFloor: {
        20: { id: 'stone_king', name: '石窟之王' },
        40: { id: 'frost_guardian', name: '冰霜守卫' },
        60: { id: 'lava_lord', name: '熔岩领主' }
      }
    })

    expect(zones[0]).toMatchObject({
      id: 'shallow',
      reached: true,
      bossName: '石窟之王',
      bossDefeated: false,
      progress: 100,
      isCurrentZone: false,
      barColor: 'bg-accent/50'
    })
    expect(zones[1]).toMatchObject({
      id: 'frost',
      reached: true,
      bossName: '冰霜守卫',
      bossDefeated: true,
      progress: 100,
      isCurrentZone: false,
      barColor: 'bg-success'
    })
    expect(zones[2]).toMatchObject({
      id: 'lava',
      reached: true,
      bossName: '熔岩领主',
      bossDefeated: false,
      progress: 25,
      isCurrentZone: true,
      barColor: 'bg-accent'
    })
  })

  it('keeps unreached zones locked with unknown bosses when boss data is missing', () => {
    const zones = buildMineMapZones({
      safePointFloor: 0,
      defeatedBossIds: [],
      bossesByFloor: {}
    })

    expect(zones[0]).toMatchObject({
      id: 'shallow',
      reached: true,
      bossName: '???',
      progress: 5,
      isCurrentZone: true,
      barColor: 'bg-accent'
    })
    expect(zones[1]).toMatchObject({
      id: 'frost',
      reached: false,
      bossName: '???',
      bossDefeated: false,
      progress: 0,
      isCurrentZone: false,
      barColor: 'bg-bg'
    })
  })

  it('groups mine elevator floors by zone and omits the current safe point', () => {
    expect(buildMineElevatorZones([0, 5, 20, 21, 40, 61, 120], 41)).toEqual([
      { name: '浅矿', floors: [0, 5, 20] },
      { name: '冰窟', floors: [21, 40] }
    ])
  })

  it('filters skull elevator floors below the current skull safe point', () => {
    expect(buildSkullElevatorFloors([0, 25, 50, 75], 50)).toEqual([0, 25])
  })

  it('formats mine leave hints for normal mine and skull cavern states', () => {
    expect(
      createMineLeaveHint({
        isInSkullCavern: false,
        activeFloorIsSafePoint: false,
        skullCavernFloor: 0,
        skullSafePointFloor: 0
      })
    ).toBe('当前进度不会保留。')

    expect(
      createMineLeaveHint({
        isInSkullCavern: true,
        activeFloorIsSafePoint: true,
        skullCavernFloor: 50,
        skullSafePointFloor: 25
      })
    ).toBe('当前为安全点，进度将保存至第50层。')

    expect(
      createMineLeaveHint({
        isInSkullCavern: true,
        activeFloorIsSafePoint: false,
        skullCavernFloor: 62,
        skullSafePointFloor: 50
      })
    ).toBe('下次将从第51层开始。')
  })
})
