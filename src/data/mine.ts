import type { MonsterDef, MineFloorDef } from '@/types'
import {
  getOfficialMainMineBoss,
  getOfficialMainMineZoneMonsters,
  getOfficialSkullCavernBaseMonsters,
  getOfficialSkullCavernBosses,
  getOfficialSkullCavernDepthMonsters
} from '@/domain/mods/contentAccess'
import { getItemById } from './items'

export { BOSS_MONSTERS, MONSTERS, SKULL_CAVERN_MONSTERS, ZONE_MONSTERS } from './monsters'

/** 矿洞总层数 */
export const MAX_MINE_FLOOR = 120

/** 区域矿石/宝石映射（铜1-40/铁41-80/金81-120，各区附加特色矿石） */
const ZONE_ORES: Record<MineFloorDef['zone'], string[]> = {
  shallow: ['copper_ore', 'quartz'],
  frost: ['copper_ore', 'jade'],
  lava: ['iron_ore', 'ruby'],
  crystal: ['iron_ore', 'crystal_ore', 'moonstone'],
  shadow: ['gold_ore', 'shadow_ore', 'obsidian'],
  abyss: ['gold_ore', 'void_ore', 'dragon_jade']
}

/** 宝箱层奖励 */
export const getTreasureRewards = (floor: number): { items: { itemId: string; quantity: number }[]; money: number } => {
  const zoneIndex = Math.floor((floor - 1) / 20)
  const zones: MineFloorDef['zone'][] = ['shallow', 'frost', 'lava', 'crystal', 'shadow', 'abyss']
  const zone = zones[zoneIndex] ?? 'abyss'
  const orePool = ZONE_ORES[zone]!
  const ore = orePool[Math.floor(Math.random() * orePool.length)]!

  const rewardTable: Record<string, { qty: number; minMoney: number; maxMoney: number }> = {
    shallow: { qty: 3, minMoney: 50, maxMoney: 100 },
    frost: { qty: 2, minMoney: 100, maxMoney: 200 },
    lava: { qty: 3, minMoney: 200, maxMoney: 500 },
    crystal: { qty: 2, minMoney: 300, maxMoney: 600 },
    shadow: { qty: 2, minMoney: 500, maxMoney: 1000 },
    abyss: { qty: 3, minMoney: 800, maxMoney: 1500 }
  }
  const r = rewardTable[zone]!
  const items: { itemId: string; quantity: number }[] = [{ itemId: ore, quantity: r.qty }]

  // 化石/古物掉落（20%概率，按区域抽取）
  if (Math.random() < 0.2) {
    const ZONE_TREASURE_DROPS: Record<string, string[]> = {
      shallow: ['trilobite_fossil', 'shell_fossil'],
      frost: ['trilobite_fossil', 'shell_fossil'],
      lava: ['ammonite_fossil', 'bronze_mirror', 'painted_pottery'],
      crystal: ['ammonite_fossil', 'jade_disc', 'jade_pendant'],
      shadow: ['oracle_bone', 'amber', 'ancient_coin'],
      abyss: ['dragon_tooth', 'bone_fragment', 'ancient_seed']
    }
    const pool = ZONE_TREASURE_DROPS[zone]
    if (pool && pool.length > 0) {
      const drop = pool[Math.floor(Math.random() * pool.length)]!
      items.push({ itemId: drop, quantity: 1 })
    }
  }

  // 深渊层宝箱极小概率掉落仙桃
  if (zone === 'abyss' && Math.random() < 0.02) {
    items.push({ itemId: 'stamina_fruit', quantity: 1 })
  }

  return {
    items,
    money: r.minMoney + Math.floor(Math.random() * (r.maxMoney - r.minMoney + 1))
  }
}

/** 暗河层奖励 - 可获得稀有矿石（无视区域限制） */
export const getDarkFloorOres = (): string[] => {
  return [
    'copper_ore',
    'iron_ore',
    'gold_ore',
    'crystal_ore',
    'shadow_ore',
    'void_ore',
    'quartz',
    'jade',
    'ruby',
    'moonstone',
    'obsidian',
    'dragon_jade'
  ]
}

/** 暗河层陷阱伤害（随深度增加） */
export const getDarkFloorTrapDamage = (floor: number): number => {
  const zoneIndex = Math.floor((floor - 1) / 20)
  const base = 5 + zoneIndex * 5
  const range = 10 + zoneIndex * 5
  return base + Math.floor(Math.random() * (range + 1))
}

/** 感染层清除奖励 */
export const getInfestedClearRewards = (floor: number): { items: { itemId: string; quantity: number }[]; money: number } => {
  const zoneIndex = Math.floor((floor - 1) / 20)
  const zones: MineFloorDef['zone'][] = ['shallow', 'frost', 'lava', 'crystal', 'shadow', 'abyss']
  const zone = zones[zoneIndex] ?? 'abyss'
  const orePool = ZONE_ORES[zone]!
  const ore = orePool[0]! // 主矿石

  const moneyTable = [
    { min: 30, max: 50 },
    { min: 60, max: 100 },
    { min: 100, max: 150 },
    { min: 150, max: 250 },
    { min: 200, max: 350 },
    { min: 300, max: 500 }
  ]
  const m = moneyTable[zoneIndex] ?? moneyTable[5]!
  return {
    items: [{ itemId: ore, quantity: 3 }],
    money: m.min + Math.floor(Math.random() * (m.max - m.min + 1))
  }
}

/** 获取奖励物品名称列表 */
export const getRewardNames = (items: { itemId: string; quantity: number }[]): string => {
  return items
    .map(r => {
      const def = getItemById(r.itemId)
      return `${def?.name ?? r.itemId}×${r.quantity}`
    })
    .join('、')
}

/** BOSS 额外掉落铜钱 */
export const BOSS_MONEY_REWARDS: Record<number, number> = {
  20: 100,
  40: 200,
  60: 500,
  80: 800,
  100: 1500,
  120: 3000
}

/** BOSS 额外掉落矿石 */
export const BOSS_ORE_REWARDS: Record<number, { itemId: string; quantity: number }[]> = {
  20: [{ itemId: 'copper_ore', quantity: 3 }],
  40: [{ itemId: 'iron_ore', quantity: 3 }],
  60: [{ itemId: 'gold_ore', quantity: 3 }],
  80: [{ itemId: 'crystal_ore', quantity: 3 }],
  100: [{ itemId: 'shadow_ore', quantity: 3 }],
  120: [{ itemId: 'void_ore', quantity: 5 }]
}

/** 获取弱化版 BOSS（重进时降低 30% 属性） */
export const getWeakenedBoss = (floor: number): MonsterDef | undefined => {
  const boss = getOfficialMainMineBoss(floor)
  if (!boss) return undefined
  return {
    ...boss,
    hp: Math.floor(boss.hp * 0.7),
    attack: Math.floor(boss.attack * 0.7),
    defense: Math.floor(boss.defense * 0.7)
  }
}

// ==================== 楼层生成 ====================

/** 生成矿洞层数据（120层） */
const generateFloors = (): MineFloorDef[] => {
  const floors: MineFloorDef[] = []
  const zones: MineFloorDef['zone'][] = ['shallow', 'frost', 'lava', 'crystal', 'shadow', 'abyss']

  for (let i = 1; i <= MAX_MINE_FLOOR; i++) {
    const zoneIndex = Math.floor((i - 1) / 20)
    const zone = zones[zoneIndex]!
    const posInZone = ((i - 1) % 20) + 1 // 1-20
    const posInHalf = ((i - 1) % 10) + 1 // 1-10（每10层重复模式）

    let specialType: MineFloorDef['specialType'] = null
    if (posInZone === 20) specialType = 'boss'
    else if (posInHalf === 3) specialType = 'mushroom'
    else if (posInHalf === 4) specialType = 'dark'
    else if (posInHalf === 6) specialType = 'infested'
    else if (posInHalf === 8) specialType = 'treasure'

    floors.push({
      floor: i,
      zone,
      ores: ZONE_ORES[zone]!,
      monsters: [...getOfficialMainMineZoneMonsters(zone)],
      isSafePoint: i % 5 === 0,
      specialType
    })
  }
  return floors
}

export const MINE_FLOORS = generateFloors()

/** 获取指定层数据 */
export const getFloor = (floor: number): MineFloorDef | undefined => {
  return MINE_FLOORS[floor - 1]
}

/** 矿洞区域中文名 */
export const ZONE_NAMES: Record<MineFloorDef['zone'], string> = {
  shallow: '浅矿·土石洞穴',
  frost: '冰窟·冰霜暗河',
  lava: '熔岩层·地火暗涌',
  crystal: '晶窟·水晶迷宫',
  shadow: '幽境·暗影裂隙',
  abyss: '深渊·无底深渊'
}

// ==================== 骷髅矿穴 ====================

/** 骷髅矿穴楼层数据（运行时生成） */
export interface SkullCavernFloorDef {
  floor: number
  ores: string[]
  monsters: MonsterDef[]
  specialType: MineFloorDef['specialType']
  scaleFactor: number
  isSafePoint: boolean
}

/** 骷髅矿穴矿石池 */
const SKULL_CAVERN_BASE_ORES = [
  'copper_ore',
  'iron_ore',
  'gold_ore',
  'crystal_ore',
  'shadow_ore',
  'void_ore',
  'quartz',
  'jade',
  'ruby',
  'moonstone',
  'obsidian',
  'dragon_jade',
  'iridium_ore'
]

/** 生成骷髅矿穴楼层 */
export const generateSkullCavernFloor = (floor: number): SkullCavernFloorDef => {
  const scaleFactor = 1 + (floor - 1) * 0.03

  // 矿石池：深层增加铱矿权重
  const ores = [...SKULL_CAVERN_BASE_ORES]
  if (floor > 20) ores.push('iridium_ore')
  if (floor > 50) ores.push('iridium_ore')
  if (floor > 30 && Math.random() < 0.05 + floor * 0.001) {
    ores.push('prismatic_shard')
  }

  // 怪物池
  const monsterPool: MonsterDef[] = [...getOfficialSkullCavernBaseMonsters()]
  if (floor > 10) {
    monsterPool.push(...getOfficialSkullCavernDepthMonsters())
  }

  // 特殊层
  let specialType: MineFloorDef['specialType'] = null
  if (floor % 25 === 0) specialType = 'boss'
  else if (floor % 10 === 3) specialType = 'mushroom'
  else if (floor % 10 === 5) specialType = 'infested'
  else if (floor % 10 === 7) specialType = 'treasure'

  return {
    floor,
    ores,
    monsters: monsterPool,
    specialType,
    scaleFactor,
    isSafePoint: floor % 10 === 0
  }
}

/** 缩放怪物属性（骷髅矿穴用） */
export const scaleMonster = (monster: MonsterDef, scaleFactor: number): MonsterDef => {
  return {
    ...monster,
    hp: Math.floor(monster.hp * scaleFactor),
    attack: Math.floor(monster.attack * scaleFactor),
    defense: Math.floor(monster.defense * scaleFactor),
    expReward: Math.floor(monster.expReward * scaleFactor)
  }
}

/** 获取骷髅矿穴小BOSS（每25层，随机BOSS×2倍缩放） */
export const getSkullCavernBoss = (floor: number): MonsterDef | undefined => {
  if (floor % 25 !== 0) return undefined
  const bosses = getOfficialSkullCavernBosses()
  const boss = bosses[Math.floor(Math.random() * bosses.length)]!
  const scaleFactor = 2 * (1 + (floor - 1) * 0.03)
  return scaleMonster(boss, scaleFactor)
}

// ==================== 格子探索系统 ====================

import type { MineTile, MineTileData, FloorTileDistribution, FloorSpecialType } from '@/types'
import { GRID_SIZE, GRID_TOTAL, MIN_STAIRS_DISTANCE } from '@/types'

/** 获取 6×6 边缘位置索引（第一行/最后一行/第一列/最后列） */
export const getEdgeIndices = (): number[] => {
  const edges: number[] = []
  for (let i = 0; i < GRID_TOTAL; i++) {
    const row = Math.floor(i / GRID_SIZE)
    const col = i % GRID_SIZE
    if (row === 0 || row === GRID_SIZE - 1 || col === 0 || col === GRID_SIZE - 1) {
      edges.push(i)
    }
  }
  return edges
}

/** 获取相邻格子索引（上下左右） */
export const getAdjacentIndices = (index: number): number[] => {
  const row = Math.floor(index / GRID_SIZE)
  const col = index % GRID_SIZE
  const adj: number[] = []
  if (row > 0) adj.push((row - 1) * GRID_SIZE + col)
  if (row < GRID_SIZE - 1) adj.push((row + 1) * GRID_SIZE + col)
  if (col > 0) adj.push(row * GRID_SIZE + col - 1)
  if (col < GRID_SIZE - 1) adj.push(row * GRID_SIZE + col + 1)
  return adj
}

/** 曼哈顿距离 */
export const manhattanDistance = (a: number, b: number): number => {
  const ar = Math.floor(a / GRID_SIZE)
  const ac = a % GRID_SIZE
  const br = Math.floor(b / GRID_SIZE)
  const bc = b % GRID_SIZE
  return Math.abs(ar - br) + Math.abs(ac - bc)
}

/** 获取炸弹范围内的索引 */
export const getBombIndices = (center: number, bombId: string): number[] => {
  const cr = Math.floor(center / GRID_SIZE)
  const cc = center % GRID_SIZE
  const indices: number[] = []

  if (bombId === 'cherry_bomb') {
    // 3×3
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = cr + dr
        const c = cc + dc
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
          indices.push(r * GRID_SIZE + c)
        }
      }
    }
  } else if (bombId === 'bomb') {
    // 曼哈顿距离 ≤ 2（十字+菱形）
    for (let i = 0; i < GRID_TOTAL; i++) {
      if (manhattanDistance(center, i) <= 2) indices.push(i)
    }
  } else if (bombId === 'mega_bomb') {
    // 全部 36 格
    for (let i = 0; i < GRID_TOTAL; i++) indices.push(i)
  }

  return indices
}

/** 获取楼层格子分布配置 */
export const getFloorDistribution = (specialType: FloorSpecialType): FloorTileDistribution => {
  switch (specialType) {
    case 'mushroom':
      return {
        oreCount: [1, 2],
        monsterCount: [1, 2],
        trapCount: [0, 1],
        mushroomCount: [6, 8],
        stairsHiddenUntilClear: false
      }
    case 'treasure':
      return {
        oreCount: [2, 3],
        monsterCount: [2, 3],
        trapCount: [1, 1],
        treasureCount: [1, 2],
        stairsHiddenUntilClear: false
      }
    case 'dark':
      return {
        oreCount: [2, 3],
        monsterCount: [2, 2],
        trapCount: [4, 5],
        stairsHiddenUntilClear: false
      }
    case 'infested':
      return {
        oreCount: [1, 2],
        monsterCount: [8, 10],
        trapCount: [0, 0],
        stairsHiddenUntilClear: true
      }
    case 'boss':
      return {
        oreCount: [1, 2],
        monsterCount: [0, 0],
        trapCount: [0, 1],
        bossCount: [1, 1],
        stairsHiddenUntilClear: true
      }
    default:
      // 普通层
      return {
        oreCount: [3, 4],
        monsterCount: [3, 4],
        trapCount: [1, 2],
        stairsHiddenUntilClear: false
      }
  }
}

/** 范围内随机整数 [min, max] */
const randInt = (min: number, max: number): number => min + Math.floor(Math.random() * (max - min + 1))

/** 从数组中随机选一个 */
const randPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!

/** 生成楼层 6×6 格子 */
export const generateFloorGrid = (
  floorData: MineFloorDef,
  floorNum: number,
  isSkullCavern: boolean,
  scaleFactor: number
): { tiles: MineTile[]; entryIndex: number; totalMonsters: number; stairsUsable: boolean } => {
  const dist = getFloorDistribution(floorData.specialType)
  const tiles: MineTile[] = []

  // 1. 创建 36 个 hidden/empty 格
  for (let i = 0; i < GRID_TOTAL; i++) {
    tiles.push({ index: i, type: 'empty', state: 'hidden' })
  }

  // 2. 入口：随机边缘格
  const edges = getEdgeIndices()
  const entryIndex = randPick(edges)
  tiles[entryIndex]!.state = 'revealed'

  // 3. 放置楼梯（距入口 ≥ MIN_STAIRS_DISTANCE）
  const stairsCandidates = []
  for (let i = 0; i < GRID_TOTAL; i++) {
    if (i !== entryIndex && manhattanDistance(entryIndex, i) >= MIN_STAIRS_DISTANCE) {
      stairsCandidates.push(i)
    }
  }
  const stairsIndex = randPick(stairsCandidates)
  tiles[stairsIndex]!.type = 'stairs'

  // 已占用位置集合
  const used = new Set<number>([entryIndex, stairsIndex])

  /** 在随机空闲位置放置格子 */
  const placeRandom = (type: MineTile['type'], data?: MineTileData): number => {
    const candidates = []
    for (let i = 0; i < GRID_TOTAL; i++) {
      if (!used.has(i)) candidates.push(i)
    }
    if (candidates.length === 0) return -1
    const idx = randPick(candidates)
    used.add(idx)
    tiles[idx]!.type = type
    if (data) tiles[idx]!.data = data
    return idx
  }

  // 4. BOSS 层：放 boss 格在中心区域
  const bossCount = dist.bossCount ? randInt(dist.bossCount[0], dist.bossCount[1]) : 0
  let totalMonsters = 0
  if (bossCount > 0) {
    // 中心 2×2 区域（行2-3，列2-3）
    const centerCandidates = [2 * GRID_SIZE + 2, 2 * GRID_SIZE + 3, 3 * GRID_SIZE + 2, 3 * GRID_SIZE + 3].filter(i => !used.has(i))

    if (centerCandidates.length > 0) {
      const bossIdx = randPick(centerCandidates)
      used.add(bossIdx)

      // 获取 BOSS 数据
      let bossMonster: MonsterDef | undefined
      if (isSkullCavern) {
        bossMonster = getSkullCavernBoss(floorNum)
      } else {
        const boss = getOfficialMainMineBoss(floorNum)
        const bossId = boss?.id
        const isFirstKill = bossId ? true : true // 首杀检测在 store 中处理
        bossMonster = isFirstKill ? boss : getWeakenedBoss(floorNum)
      }

      if (bossMonster) {
        tiles[bossIdx]!.type = 'boss'
        tiles[bossIdx]!.data = { monster: bossMonster, isBoss: true }
        totalMonsters++
      }
    }
  }

  // 5. 放置矿石
  const oreCount = randInt(dist.oreCount[0], dist.oreCount[1])
  // 暗河层使用特殊矿石池
  const orePool = floorData.specialType === 'dark' ? getDarkFloorOres() : floorData.ores
  for (let i = 0; i < oreCount; i++) {
    const oreId = randPick(orePool)
    placeRandom('ore', { oreId, oreQuantity: 1 })
  }

  // 6. 放置怪物
  const monsterCount = randInt(dist.monsterCount[0], dist.monsterCount[1])
  for (let i = 0; i < monsterCount; i++) {
    if (floorData.monsters.length === 0) break
    let monster = randPick(floorData.monsters)
    if (isSkullCavern && scaleFactor > 1) {
      monster = scaleMonster(monster, scaleFactor)
    }
    placeRandom('monster', { monster })
    totalMonsters++
  }

  // 7. 放置陷阱
  const trapCount = randInt(dist.trapCount[0], dist.trapCount[1])
  for (let i = 0; i < trapCount; i++) {
    const trapDamage = getDarkFloorTrapDamage(floorNum)
    placeRandom('trap', { trapDamage })
  }

  // 8. 放置宝箱
  if (dist.treasureCount) {
    const treasureCount = randInt(dist.treasureCount[0], dist.treasureCount[1])
    for (let i = 0; i < treasureCount; i++) {
      const rewards = getTreasureRewards(floorNum)
      placeRandom('treasure', { treasureItems: rewards.items, treasureMoney: rewards.money })
    }
  }

  // 9. 放置蘑菇
  if (dist.mushroomCount) {
    const mushCount = randInt(dist.mushroomCount[0], dist.mushroomCount[1])
    for (let i = 0; i < mushCount; i++) {
      // 每格 1-2 个蘑菇/药草
      const items: { itemId: string; quantity: number }[] = []
      if (floorNum <= 40) {
        items.push({ itemId: Math.random() < 0.7 ? 'wild_mushroom' : 'herb', quantity: 1 })
      } else if (floorNum <= 80) {
        items.push({ itemId: Math.random() < 0.5 ? 'wild_mushroom' : 'ginseng', quantity: 1 })
      } else {
        items.push({ itemId: Math.random() < 0.4 ? 'ginseng' : 'wild_mushroom', quantity: 1 })
        if (Math.random() < 0.3) items.push({ itemId: 'herb', quantity: 1 })
      }
      placeRandom('mushroom', { mushroomItems: items })
    }
  }

  // 10. 入口格的邻居如果都是 hidden，自动翻开入口的空格邻居（让玩家有可操作选择）
  // 入口本身已经 revealed，玩家可以点击其邻格

  const stairsUsable = !dist.stairsHiddenUntilClear
  return { tiles, entryIndex, totalMonsters, stairsUsable }
}
