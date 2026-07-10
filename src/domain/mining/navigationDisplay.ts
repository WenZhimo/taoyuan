export interface MineMapBossInfo {
  id: string
  name: string
}

export interface MineMapZoneDefinition {
  id: string
  name: string
  start: number
  end: number
  bossFloor: number
}

export interface MineMapZoneDisplay extends MineMapZoneDefinition {
  reached: boolean
  bossName: string
  bossDefeated: boolean
  progress: number
  isCurrentZone: boolean
  barColor: string
}

export const MINE_MAP_ZONE_DEFINITIONS: readonly MineMapZoneDefinition[] = [
  { id: 'shallow', name: '浅矿·土石洞穴', start: 1, end: 20, bossFloor: 20 },
  { id: 'frost', name: '冰窟·冰霜暗河', start: 21, end: 40, bossFloor: 40 },
  { id: 'lava', name: '熔岩层·地火暗涌', start: 41, end: 60, bossFloor: 60 },
  { id: 'crystal', name: '晶窟·水晶迷宫', start: 61, end: 80, bossFloor: 80 },
  { id: 'shadow', name: '幽境·暗影裂隙', start: 81, end: 100, bossFloor: 100 },
  { id: 'abyss', name: '深渊·无底深渊', start: 101, end: 120, bossFloor: 120 }
]

export interface BuildMineMapZonesInput {
  safePointFloor: number
  defeatedBossIds: readonly string[]
  bossesByFloor: Readonly<Record<number, MineMapBossInfo | undefined>>
}

export const buildMineMapZones = ({
  safePointFloor,
  defeatedBossIds,
  bossesByFloor
}: BuildMineMapZonesInput): MineMapZoneDisplay[] => {
  return MINE_MAP_ZONE_DEFINITIONS.map(zone => {
    const reached = safePointFloor >= zone.start - 1
    const boss = bossesByFloor[zone.bossFloor]
    const bossDefeated = boss ? defeatedBossIds.includes(boss.id) : false
    const progress = Math.min(100, Math.max(0, ((safePointFloor - (zone.start - 1)) / 20) * 100))
    const isCurrentZone = safePointFloor >= zone.start - 1 && safePointFloor < zone.end

    return {
      ...zone,
      reached,
      bossName: boss?.name ?? '???',
      bossDefeated,
      progress: reached ? Math.max(5, progress) : 0,
      isCurrentZone,
      barColor: bossDefeated ? 'bg-success' : isCurrentZone ? 'bg-accent' : reached ? 'bg-accent/50' : 'bg-bg'
    }
  })
}

export interface MineElevatorZoneDefinition {
  name: string
  min: number
  max: number
}

export interface MineElevatorZone {
  name: string
  floors: number[]
}

export const MINE_ELEVATOR_ZONE_DEFINITIONS: readonly MineElevatorZoneDefinition[] = [
  { name: '浅矿', min: 0, max: 20 },
  { name: '冰窟', min: 21, max: 40 },
  { name: '熔岩', min: 41, max: 60 },
  { name: '晶窟', min: 61, max: 80 },
  { name: '幽境', min: 81, max: 100 },
  { name: '深渊', min: 101, max: 120 }
]

export const buildMineElevatorZones = (unlockedSafePoints: readonly number[], safePointFloor: number): MineElevatorZone[] => {
  const allSafePoints = unlockedSafePoints.filter(safePoint => safePoint < safePointFloor)

  return MINE_ELEVATOR_ZONE_DEFINITIONS
    .map(zone => ({
      name: zone.name,
      floors: allSafePoints.filter(safePoint => safePoint >= zone.min && safePoint <= zone.max)
    }))
    .filter(zone => zone.floors.length > 0)
}

export const buildSkullElevatorFloors = (unlockedSafePoints: readonly number[], skullSafePointFloor: number): number[] => {
  return unlockedSafePoints.filter(safePoint => safePoint < skullSafePointFloor)
}

export interface MineLeaveHintInput {
  isInSkullCavern: boolean
  activeFloorIsSafePoint: boolean
  skullCavernFloor: number
  skullSafePointFloor: number
}

export const createMineLeaveHint = ({
  isInSkullCavern,
  activeFloorIsSafePoint,
  skullCavernFloor,
  skullSafePointFloor
}: MineLeaveHintInput): string => {
  if (!isInSkullCavern) return '当前进度不会保留。'
  if (activeFloorIsSafePoint) return `当前为安全点，进度将保存至第${skullCavernFloor}层。`
  return skullSafePointFloor > 0 ? `下次将从第${skullSafePointFloor + 1}层开始。` : '当前进度不会保留。'
}
