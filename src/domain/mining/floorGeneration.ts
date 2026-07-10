import type { MineFloorDef, MineTile, MonsterDef } from '@/types'

export interface FloorGridResult {
  tiles: MineTile[]
  entryIndex: number
  totalMonsters: number
  stairsUsable: boolean
}

export interface ShouldUseWeakenedBossInput {
  floor: MineFloorDef
  floorNum: number
  isSkullCavern: boolean
  defeatedBossIds: readonly string[]
  bossId?: string
}

export const shouldUseWeakenedBoss = ({
  floor,
  isSkullCavern,
  defeatedBossIds,
  bossId
}: ShouldUseWeakenedBossInput): boolean => {
  if (isSkullCavern || floor.specialType !== 'boss') return false
  return bossId ? defeatedBossIds.includes(bossId) : false
}

export const replaceBossTilesWithWeakenedBoss = (result: FloorGridResult, weakBoss?: MonsterDef): FloorGridResult => {
  if (!weakBoss) return result

  return {
    ...result,
    tiles: result.tiles.map(tile => {
      if (tile.type !== 'boss' || !tile.data?.monster) return tile
      return {
        ...tile,
        data: {
          ...tile.data,
          monster: weakBoss
        }
      }
    })
  }
}
