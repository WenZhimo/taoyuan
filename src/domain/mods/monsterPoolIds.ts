import { toOfficialContentId, type ContentId } from './ids'

export const MAIN_MINE_ZONES = ['shallow', 'frost', 'lava', 'crystal', 'shadow', 'abyss'] as const
export type MainMineZone = (typeof MAIN_MINE_ZONES)[number]

export const MAIN_MINE_BOSS_FLOORS = [20, 40, 60, 80, 100, 120] as const
export type MainMineBossFloor = (typeof MAIN_MINE_BOSS_FLOORS)[number]

export const getMainMineZonePoolId = (zone: MainMineZone): ContentId =>
  toOfficialContentId(`pool/mine/zone/${zone}`)

export const getMainMineBossPoolId = (floor: number): ContentId =>
  toOfficialContentId(`pool/mine/boss/${floor}`)

export const SKULL_CAVERN_BASE_POOL_ID = toOfficialContentId('pool/skull-cavern/base')
export const SKULL_CAVERN_DEPTH_11_POOL_ID = toOfficialContentId('pool/skull-cavern/depth-11')
export const SKULL_CAVERN_BOSS_POOL_ID = toOfficialContentId('pool/skull-cavern/boss')

export const REQUIRED_OFFICIAL_MONSTER_POOL_IDS: readonly ContentId[] = [
  ...MAIN_MINE_ZONES.map(getMainMineZonePoolId),
  ...MAIN_MINE_BOSS_FLOORS.map(getMainMineBossPoolId),
  SKULL_CAVERN_BASE_POOL_ID,
  SKULL_CAVERN_DEPTH_11_POOL_ID,
  SKULL_CAVERN_BOSS_POOL_ID
]
