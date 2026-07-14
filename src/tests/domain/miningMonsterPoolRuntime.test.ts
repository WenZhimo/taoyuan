import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BOSS_MONSTERS,
  MONSTERS,
  SKULL_CAVERN_MONSTERS,
  ZONE_MONSTERS
} from '@/data/monsters'
import {
  generateFloorGrid,
  generateSkullCavernFloor,
  getFloor,
  getSkullCavernBoss,
  getWeakenedBoss,
  scaleMonster
} from '@/data/mine'
import type { MineFloorDef } from '@/types'

const runWithDeterministicRandom = <T>(action: () => T): { result: T; calls: number } => {
  let calls = 0
  const random = vi.spyOn(Math, 'random').mockImplementation(() => {
    const value = ((calls * 37 + 17) % 100) / 100
    calls += 1
    return value
  })
  const result = action()
  random.mockRestore()
  return { result, calls }
}

const compareGridGeneration = (
  registryFloor: MineFloorDef,
  legacyMonsters: MineFloorDef['monsters'],
  floorNum: number,
  isSkullCavern: boolean,
  scaleFactor: number
) => {
  const legacyFloor = { ...registryFloor, monsters: legacyMonsters }
  const legacy = runWithDeterministicRandom(() =>
    generateFloorGrid(legacyFloor, floorNum, isSkullCavern, scaleFactor)
  )
  const registry = runWithDeterministicRandom(() =>
    generateFloorGrid(registryFloor, floorNum, isSkullCavern, scaleFactor)
  )

  expect(registry.result).toEqual(legacy.result)
  expect(registry.calls).toBe(legacy.calls)
}

const toMineFloorDef = (floor: ReturnType<typeof generateSkullCavernFloor>): MineFloorDef => ({
  floor: floor.floor,
  zone: 'abyss',
  ores: floor.ores,
  monsters: floor.monsters,
  isSafePoint: floor.isSafePoint,
  specialType: floor.specialType
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('registry-backed mining monster pools', () => {
  it('keeps all 120 main mine floor zones and candidate order unchanged', () => {
    for (let floor = 1; floor <= 120; floor++) {
      const definition = getFloor(floor)!
      expect(definition.monsters.map(monster => monster.id), String(floor))
        .toEqual(ZONE_MONSTERS[definition.zone].map(monster => monster.id))
    }
  })

  it('keeps fixed-random normal and infested floor grids and call counts unchanged', () => {
    for (const floorNum of [1, 6]) {
      const floor = getFloor(floorNum)!
      compareGridGeneration(floor, ZONE_MONSTERS[floor.zone], floorNum, false, 1)
    }
  })

  it('keeps skull cavern base and depth-11 pool grid results and call counts unchanged', () => {
    const baseMonsters = Object.values(SKULL_CAVERN_MONSTERS)
    const depthMonsters = [...baseMonsters, MONSTERS.shadow_lurker!, MONSTERS.bone_dragon!]

    const baseFloor = generateSkullCavernFloor(5)
    compareGridGeneration(toMineFloorDef(baseFloor), baseMonsters, 5, true, baseFloor.scaleFactor)

    const depthFloor = generateSkullCavernFloor(11)
    compareGridGeneration(toMineFloorDef(depthFloor), depthMonsters, 11, true, depthFloor.scaleFactor)
  })

  it('keeps skull cavern floor generation random calls outside pool resolution', () => {
    const generated = runWithDeterministicRandom(() => generateSkullCavernFloor(31))

    expect(generated.calls).toBe(1)
    expect(generated.result.monsters.map(monster => monster.id)).toEqual([
      ...Object.values(SKULL_CAVERN_MONSTERS).map(monster => monster.id),
      MONSTERS.shadow_lurker!.id,
      MONSTERS.bone_dragon!.id
    ])
  })

  it('keeps weakened boss values without consuming random numbers', () => {
    const weakened = runWithDeterministicRandom(() => getWeakenedBoss(80))
    const boss = BOSS_MONSTERS[80]!

    expect(weakened.calls).toBe(0)
    expect(weakened.result).toEqual({
      ...boss,
      hp: Math.floor(boss.hp * 0.7),
      attack: Math.floor(boss.attack * 0.7),
      defense: Math.floor(boss.defense * 0.7)
    })
  })

  it.each([0, 0.2, 0.999])('keeps skull cavern boss selection for fixed random %s', randomValue => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(randomValue)
    const bosses = Object.values(BOSS_MONSTERS)
    const selected = bosses[Math.floor(randomValue * bosses.length)]!
    const floor = 25
    const scaleFactor = 2 * (1 + (floor - 1) * 0.03)

    expect(getSkullCavernBoss(floor)).toEqual(scaleMonster(selected, scaleFactor))
    expect(random).toHaveBeenCalledTimes(1)
  })
})
