import type { MineTile, MineTileState } from '@/types'

export const shouldSkipChainAutoExploreTile = (tile: MineTile): boolean => {
  return tile.state === 'defeated' || tile.state === 'collected' || tile.state === 'triggered'
}

export const getChainAutoExploreTileState = (tileType: MineTile['type']): MineTileState | null => {
  switch (tileType) {
    case 'empty':
    case 'stairs':
    case 'monster':
    case 'boss':
      return 'revealed'
    case 'ore':
    case 'treasure':
    case 'mushroom':
      return 'collected'
    case 'trap':
      return 'triggered'
    default:
      return null
  }
}

export const shouldUnlockStairsAfterChainAutoExplore = (defeatedMonsterCount: number, totalMonsterCount: number): boolean => {
  return totalMonsterCount > 0 && defeatedMonsterCount >= totalMonsterCount
}

export interface MineTileRevealResult {
  success: boolean
  message: string
  startsCombat: boolean
}

export const canRevealMineTile = (
  tiles: readonly MineTile[],
  index: number,
  adjacentIndices: readonly number[]
): boolean => {
  const tile = tiles[index]
  if (!tile || tile.state !== 'hidden') return false
  return adjacentIndices.some(adjacentIndex => {
    const adjacentTile = tiles[adjacentIndex]
    return Boolean(adjacentTile && adjacentTile.state !== 'hidden')
  })
}

export interface MineRevealStaminaInput {
  pickaxeMultiplier: number
  skillReduction: number
  miningBuff: number
  walletMiningReduction: number
  ringMiningReduction: number
  ringGlobalReduction: number
  spiritMiningReduction: number
}

export const calculateMineRevealStaminaCost = ({
  pickaxeMultiplier,
  skillReduction,
  miningBuff,
  walletMiningReduction,
  ringMiningReduction,
  ringGlobalReduction,
  spiritMiningReduction
}: MineRevealStaminaInput): number => {
  return Math.max(
    1,
    Math.floor(
      2 *
        pickaxeMultiplier *
        (1 - skillReduction) *
        (1 - miningBuff) *
        (1 - walletMiningReduction) *
        (1 - ringMiningReduction) *
        (1 - ringGlobalReduction) *
        (1 - spiritMiningReduction)
    )
  )
}

export const revealEmptyMineTile = (tile: MineTile, staminaCost: number): MineTileRevealResult => {
  tile.state = 'revealed'
  return { success: true, message: `探索了一个空区域。(-${staminaCost}体力)`, startsCombat: false }
}

export const revealFallbackMineTile = (tile: MineTile): MineTileRevealResult => {
  tile.state = 'revealed'
  return { success: true, message: '空无一物。', startsCombat: false }
}

export interface OreTileQuantityInput {
  baseQuantity: number
  minerBonusTriggered: boolean
  hilltopBonusTriggered: boolean
  prospectorBonusTriggered: boolean
  ringOreBonus: number
  hiddenNpcOreBonusTriggered: boolean
}

export const calculateOreTileQuantity = ({
  baseQuantity,
  minerBonusTriggered,
  hilltopBonusTriggered,
  prospectorBonusTriggered,
  ringOreBonus,
  hiddenNpcOreBonusTriggered
}: OreTileQuantityInput): number => {
  let quantity = baseQuantity
  if (minerBonusTriggered) quantity += 1
  if (hilltopBonusTriggered) quantity += 1
  if (prospectorBonusTriggered) quantity *= 2
  if (ringOreBonus > 0) quantity += Math.floor(ringOreBonus)
  if (hiddenNpcOreBonusTriggered) quantity += 1
  return quantity
}

export const revealOreMineTile = (tile: MineTile, quantity: number, staminaCost: number): MineTileRevealResult => {
  tile.state = 'collected'
  return { success: true, message: `挖到了${quantity}个矿石！(-${staminaCost}体力)`, startsCombat: false }
}

export const revealTrapMineTile = (
  tile: MineTile,
  damage: number,
  staminaCost: number,
  defeatMessage?: string
): MineTileRevealResult => {
  tile.state = 'triggered'
  const message = defeatMessage
    ? `踩中了陷阱！受到${damage}点伤害。${defeatMessage}`
    : `踩中了陷阱！受到${damage}点伤害。(-${staminaCost}体力)`
  return { success: true, message, startsCombat: false }
}

export const revealMushroomMineTile = (tile: MineTile, rewardNames: string, staminaCost: number): MineTileRevealResult => {
  tile.state = 'collected'
  return { success: true, message: `采集到了${rewardNames}！(+3采集经验, -${staminaCost}体力)`, startsCombat: false }
}

export type StairsBlockReason = 'infested' | 'boss' | null

export interface StairsRevealInput {
  staminaCost: number
  blockReason: StairsBlockReason
  remainingMonsters: number
}

export const revealStairsMineTile = (
  tile: MineTile,
  { staminaCost, blockReason, remainingMonsters }: StairsRevealInput
): MineTileRevealResult => {
  tile.state = 'revealed'

  if (blockReason === 'infested') {
    return {
      success: true,
      message: `发现了楼梯！但需要先清除剩余${remainingMonsters}只怪物才能前进。(-${staminaCost}体力)`,
      startsCombat: false
    }
  }

  if (blockReason === 'boss') {
    return { success: true, message: `发现了楼梯！但需要先击败BOSS才能前进。(-${staminaCost}体力)`, startsCombat: false }
  }

  return { success: true, message: `发现了楼梯！可以前往下一层。(-${staminaCost}体力)`, startsCombat: false }
}

export interface CombatTileStartText {
  combatLogMessage: string
  revealResult: MineTileRevealResult
}

export const getMonsterTileCombatStartText = (
  monsterName: string,
  monsterHp: number,
  staminaCost: number
): CombatTileStartText => ({
  combatLogMessage: `遭遇了${monsterName}！(HP: ${monsterHp})  (-${staminaCost}体力)`,
  revealResult: { success: true, message: `遭遇了${monsterName}！`, startsCombat: true }
})

export const getBossTileCombatStartText = (
  monsterName: string,
  monsterHp: number,
  staminaCost: number,
  isFirstKill: boolean
): CombatTileStartText => ({
  combatLogMessage: `BOSS战！遭遇了${monsterName}！(HP: ${monsterHp})${isFirstKill ? '' : '（弱化版）'}  (-${staminaCost}体力)`,
  revealResult: { success: true, message: `BOSS层！${monsterName}挡住了去路！`, startsCombat: true }
})

export const getRevealedMonsterCombatStartText = (
  monsterName: string,
  monsterHp: number,
  isBoss: boolean,
  isFirstKill: boolean
): CombatTileStartText => ({
  combatLogMessage: isBoss
    ? `BOSS战！再次挑战${monsterName}！(HP: ${monsterHp})${isFirstKill ? '' : '（弱化版）'}`
    : `再次遭遇${monsterName}！(HP: ${monsterHp})`,
  revealResult: { success: true, message: `与${monsterName}交战！`, startsCombat: true }
})

export interface ChainAutoExploreSummary {
  oreCount: number
  treasureCount: number
  treasureGearCount: number
  mushroomCount: number
  money: number
  treasureAutoSoldMoney: number
}

export const formatChainAutoExploreSummary = ({
  oreCount,
  treasureCount,
  treasureGearCount,
  mushroomCount,
  money,
  treasureAutoSoldMoney
}: ChainAutoExploreSummary): string => {
  const parts: string[] = []
  if (oreCount > 0) parts.push(`矿石×${oreCount}`)
  if (treasureCount > 0) parts.push(`宝箱×${treasureCount}`)
  if (treasureGearCount > 0) parts.push(`装备×${treasureGearCount}`)
  if (mushroomCount > 0) parts.push(`蘑菇×${mushroomCount}`)
  if (money > 0) parts.push(`${money}文`)
  if (treasureAutoSoldMoney > 0) parts.push(`重复装备售出${treasureAutoSoldMoney}文`)
  return parts.length > 0 ? `连战胜利后自动探索了本层，获得${parts.join('、')}。` : '连战胜利后自动探索了本层。'
}

export interface TreasureTileMessageInput {
  rewardNames: string
  rewardCount: number
  money: number
  autoSoldMoney: number
  staminaCost: number
}

export const formatTreasureTileMessage = ({
  rewardNames,
  rewardCount,
  money,
  autoSoldMoney,
  staminaCost
}: TreasureTileMessageInput): string => {
  let message = '发现宝箱！'
  if (rewardCount > 0) message += `获得了${rewardNames}`
  if (money > 0) message += `${rewardCount > 0 ? '和' : '获得了'}${money}文`
  if (autoSoldMoney > 0) message += `（重复装备自动售出+${autoSoldMoney}文）`
  return `${message}！(-${staminaCost}体力)`
}
