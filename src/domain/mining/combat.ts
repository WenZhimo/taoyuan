import type { CombatAction, CombatStatusType, EnchantmentDef, WeaponType } from '@/types'
import type { RandomSource } from '@/domain/drops/rollChanceQuantity'

export type AutoCombatMode = 'off' | 'smart' | 'attack' | 'defend'

export interface AutoCombatActionInput {
  mode: AutoCombatMode
  monsterAttack: number
  playerHp: number
  playerMaxHp: number
  monsterHp: number
  playerAttack: number
}

export const chooseAutoCombatAction = ({
  mode,
  monsterAttack,
  playerHp,
  playerMaxHp,
  monsterHp,
  playerAttack
}: AutoCombatActionInput): CombatAction => {
  if (mode === 'attack') return 'attack'
  if (mode === 'defend') return 'defend'

  const dangerLine = Math.max(playerMaxHp * 0.35, monsterAttack * 2.2)
  if (playerHp <= dangerLine) return 'defend'
  if (monsterHp <= Math.max(1, playerAttack * 1.2)) return 'attack'
  return 'attack'
}

export interface PlayerAttackInput {
  weaponAttack: number
  combatLevel: number
  allSkillsBuff: number
  ringAttackBonus: number
  guildBadgeBonusAttack: number
  guildAttackBonus: number
  battleRagePower: number
}

export const calculatePlayerAttack = ({
  weaponAttack,
  combatLevel,
  allSkillsBuff,
  ringAttackBonus,
  guildBadgeBonusAttack,
  guildAttackBonus,
  battleRagePower
}: PlayerAttackInput): number => {
  return weaponAttack + (combatLevel + allSkillsBuff) * 2 + ringAttackBonus + guildBadgeBonusAttack + guildAttackBonus + battleRagePower
}

export interface IncomingDamageInput {
  baseDamage: number
  defendMultiplier?: number
  defenseReduction: number
  hasSturdyEnchantment: boolean
  ringDefenseBonus: number
  guildBonusDefense: number
  ironSkinReduction: number
}

export const calculateIncomingDamage = ({
  baseDamage,
  defendMultiplier = 1,
  defenseReduction,
  hasSturdyEnchantment,
  ringDefenseBonus,
  guildBonusDefense,
  ironSkinReduction
}: IncomingDamageInput): number => {
  return Math.max(
    1,
    Math.floor(
      baseDamage *
        defendMultiplier *
        (1 - defenseReduction) *
        (hasSturdyEnchantment ? 0.85 : 1.0) *
        (1 - ringDefenseBonus) *
        (1 - guildBonusDefense) *
        (1 - ironSkinReduction)
    )
  )
}

export interface CritRateInput {
  weaponCritRate: number
  ringCritBonus: number
  ringLuck: number
}

export const calculateCritRate = ({ weaponCritRate, ringCritBonus, ringLuck }: CritRateInput): number => {
  return weaponCritRate + ringCritBonus + ringLuck * 0.5
}

export interface PlayerStrikeInput {
  baseAttack: number
  monsterDefense: number
  weaponType?: WeaponType
  brute: boolean
  critRate: number
  enchantments: readonly EnchantmentDef[]
  ringVampiric: number
  random?: RandomSource
}

export interface PlayerStrikeResult {
  isCrit: boolean
  damageToMonster: number
  extraDamage: number
  totalDamage: number
  isStunned: boolean
  healAmount: number
  appliedStatusEnchantments: EnchantmentDef[]
}

const isStatusEnchantment = (enchant: EnchantmentDef): boolean => {
  return enchant.special === 'poison' || enchant.special === 'burn' || enchant.special === 'freeze' || enchant.special === 'radiation'
}

export const resolvePlayerStrike = ({
  baseAttack,
  monsterDefense,
  weaponType,
  brute,
  critRate,
  enchantments,
  ringVampiric,
  random = Math.random
}: PlayerStrikeInput): PlayerStrikeResult => {
  const isCrit = random() < critRate
  const critMultiplier = isCrit ? 1.5 : 1.0
  const bruteMultiplier = brute ? 1.25 : 1.0
  const damageToMonster = Math.max(1, Math.floor((baseAttack - monsterDefense) * bruteMultiplier * critMultiplier))

  let extraDamage = 0
  if (weaponType === 'dagger' && random() < 0.25) {
    extraDamage = Math.max(1, Math.floor(damageToMonster * 0.5))
  }

  const isStunned = weaponType === 'club' && random() < 0.2
  const appliedStatusEnchantments = enchantments.filter(enchant => isStatusEnchantment(enchant) && random() < 0.35)
  const vampiricEnchantCount = enchantments.filter(enchant => enchant.special === 'vampiric').length
  const totalVampiric = vampiricEnchantCount * 0.15 + ringVampiric
  const totalDamage = damageToMonster + extraDamage
  const healAmount = totalVampiric > 0 ? Math.floor(totalDamage * totalVampiric) : 0

  return {
    isCrit,
    damageToMonster,
    extraDamage,
    totalDamage,
    isStunned,
    healAmount,
    appliedStatusEnchantments
  }
}

export type CombatItemEffect =
  | {
      kind: 'damage'
      percent?: number
      flat?: number
      ignoreDefense?: boolean
      status?: CombatStatusType
      turns?: number | null
      power?: number
    }
  | { kind: 'playerStatus'; status: CombatStatusType; turns: number | null; power: number }

export const COMBAT_ITEM_EFFECTS: Record<string, CombatItemEffect> = {
  bomb: { kind: 'damage', flat: 50, ignoreDefense: true },
  mega_bomb: { kind: 'damage', percent: 0.35, flat: 120, ignoreDefense: true, status: 'burn', turns: 3, power: 0.06 },
  poison_arrow: { kind: 'damage', flat: 25, ignoreDefense: false, status: 'poison', turns: 4, power: 0.05 },
  ice_bomb: { kind: 'damage', percent: 0.18, flat: 40, ignoreDefense: true, status: 'freeze', turns: 2, power: 0.35 },
  nuclear_bomb: { kind: 'damage', percent: 0.65, flat: 300, ignoreDefense: true, status: 'radiation', turns: null, power: 0.08 },
  attack_potion: { kind: 'playerStatus', status: 'battle_rage', turns: 60, power: 500 },
  guardian_potion: { kind: 'playerStatus', status: 'iron_skin', turns: 60, power: 0.35 }
}

export interface CombatItemDamageInput {
  effect: Extract<CombatItemEffect, { kind: 'damage' }>
  monsterHp: number
  monsterDefense: number
}

export interface CombatItemDamageResult {
  damage: number
  status: CombatStatusType | null
  turns: number | null
  power: number
  ignoresDefense: boolean
}

export const resolveCombatItemDamage = ({
  effect,
  monsterHp,
  monsterDefense
}: CombatItemDamageInput): CombatItemDamageResult => {
  const percentDamage = effect.percent ? Math.floor(monsterHp * effect.percent) : 0
  const flatDamage = effect.flat ?? 0
  const rawDamage = Math.max(1, percentDamage + flatDamage)
  const ignoresDefense = Boolean(effect.ignoreDefense)
  const damage = ignoresDefense ? rawDamage : Math.max(1, rawDamage - monsterDefense)

  return {
    damage,
    status: effect.status ?? null,
    turns: effect.turns === undefined ? 3 : effect.turns,
    power: effect.power ?? 0.05,
    ignoresDefense
  }
}

export const getDefendDamageMultiplier = (hasTankPerk: boolean): number => {
  return hasTankPerk ? 0.3 : 0.4
}

export const getDefenderHealAmount = (hasDefenderPerk: boolean): number => {
  return hasDefenderPerk ? 5 : 0
}

export type CounterattackBlockReason = 'stunned' | 'frozen' | 'acrobat'

export interface CounterattackDecisionInput {
  isStunned: boolean
  isFrozen: boolean
  hasAcrobatPerk: boolean
  random?: RandomSource
}

export interface CounterattackDecision {
  canCounterattack: boolean
  blockReason: CounterattackBlockReason | null
}

export const resolveCounterattackDecision = ({
  isStunned,
  isFrozen,
  hasAcrobatPerk,
  random = Math.random
}: CounterattackDecisionInput): CounterattackDecision => {
  if (isStunned) return { canCounterattack: false, blockReason: 'stunned' }
  if (isFrozen) return { canCounterattack: false, blockReason: 'frozen' }
  if (hasAcrobatPerk && random() < 0.25) return { canCounterattack: false, blockReason: 'acrobat' }
  return { canCounterattack: true, blockReason: null }
}

export interface SkullCavernBossReward {
  moneyReward: number
  bonusOreCount: number
}

export const calculateSkullCavernBossReward = (floor: number): SkullCavernBossReward => ({
  moneyReward: 200 + floor * 20,
  bonusOreCount: 3 + Math.floor(floor / 25)
})

export interface CombatDefeatPenaltyInput {
  sessionLootCount: number
  availableInventoryItemCount: number
  money: number
  moneyPenaltyRate: number
  moneyPenaltyCap: number
  maxItemLoss: number
}

export interface CombatDefeatPenalty {
  sessionLootLossCount: number
  inventoryDropCount: number
  moneyLost: number
}

export const calculateCombatDefeatPenalty = ({
  sessionLootCount,
  availableInventoryItemCount,
  money,
  moneyPenaltyRate,
  moneyPenaltyCap,
  maxItemLoss
}: CombatDefeatPenaltyInput): CombatDefeatPenalty => ({
  sessionLootLossCount: Math.ceil(sessionLootCount / 2),
  inventoryDropCount: Math.min(maxItemLoss, availableInventoryItemCount),
  moneyLost: Math.min(Math.floor(money * moneyPenaltyRate), moneyPenaltyCap)
})

export interface CombatDefeatMessageInput {
  wasInSkullCavern: boolean
  droppedItemCount: number
  moneyLost: number
}

export const formatCombatDefeatMessage = ({
  wasInSkullCavern,
  droppedItemCount,
  moneyLost
}: CombatDefeatMessageInput): string => {
  const location = wasInSkullCavern ? '骷髅矿穴' : '矿洞'
  const parts: string[] = [`你在${location}中倒下了……`, '丢失了一半战利品']
  if (droppedItemCount > 0) parts.push(`和${droppedItemCount}件背包物品`)
  if (moneyLost > 0) parts.push(`及${moneyLost}文`)
  parts.push('，被送回入口。')
  return parts.join('')
}

export type MainMineBossGearType = 'ring' | 'hat' | 'shoe'

export interface MainMineBossFirstKillRewardInput {
  bossId: string
  defeatedBossIds: readonly string[]
  weaponId: string | undefined
}

export interface MainMineBossFirstKillReward {
  bossId: string
  weaponId: string | null
}

export const resolveMainMineBossFirstKillReward = ({
  bossId,
  defeatedBossIds,
  weaponId
}: MainMineBossFirstKillRewardInput): MainMineBossFirstKillReward | null => {
  if (defeatedBossIds.includes(bossId)) return null
  return {
    bossId,
    weaponId: weaponId ?? null
  }
}

export interface MainMineBossGearRewardIds {
  ringId: string | undefined
  hatId: string | undefined
  shoeId: string | undefined
}

export interface MainMineBossGearOwnership {
  hasRing: boolean
  hasHat: boolean
  hasShoe: boolean
}

export interface MainMineBossGearReward {
  gearType: MainMineBossGearType
  gearId: string
}

export interface MainMineBossGearRewardInput {
  rewardIds: MainMineBossGearRewardIds
  ownership: MainMineBossGearOwnership
}

export const resolveMainMineBossGearRewards = ({
  rewardIds,
  ownership
}: MainMineBossGearRewardInput): MainMineBossGearReward[] => {
  const rewards: MainMineBossGearReward[] = []

  if (rewardIds.ringId && !ownership.hasRing) rewards.push({ gearType: 'ring', gearId: rewardIds.ringId })
  if (rewardIds.hatId && !ownership.hasHat) rewards.push({ gearType: 'hat', gearId: rewardIds.hatId })
  if (rewardIds.shoeId && !ownership.hasShoe) rewards.push({ gearType: 'shoe', gearId: rewardIds.shoeId })

  return rewards
}

export const formatMainMineBossFirstKillWeaponMessage = (displayName: string): string => {
  return ` 首次击败BOSS！获得了传说武器：${displayName}！`
}

export const formatMainMineBossGearRewardMessage = (gearType: MainMineBossGearType, gearName: string): string => {
  const typeName: Record<MainMineBossGearType, string> = {
    ring: '戒指',
    hat: '帽子',
    shoe: '鞋子'
  }
  return ` 获得了${typeName[gearType]}：${gearName}！`
}

export const formatMainMineBossMoneyRewardMessage = (moneyReward: number): string => {
  return moneyReward > 0 ? ` 获得${moneyReward}文！` : ''
}

export const formatMainMineBossOreRewardMessage = (rewardNames: string): string => {
  return rewardNames ? ` 获得了${rewardNames}！` : ''
}

export const formatInfestedFloorClearMessage = (rewardNames: string, moneyReward: number): string => {
  return ` 感染层清除完毕！获得${rewardNames}和${moneyReward}文！`
}

export const formatInfestedFloorRemainingMonstersMessage = (remainingMonsterCount: number): string => {
  return ` 还剩${remainingMonsterCount}只怪物！`
}

export const formatCombatEntryStartLine = (monsterName: string, monsterHp: number, isBoss: boolean): string => {
  const label = isBoss ? 'BOSS战' : '连战'
  return `${label}：${monsterName}出现！（HP: ${monsterHp}）`
}

export const formatChainCombatStartMessage = (enemyCount: number): string => {
  return `连战开始，本层共有${enemyCount}个敌人。`
}

export const formatChainCombatNextMessage = (currentMessage: string, nextMonsterName: string): string => {
  return `${currentMessage} 下一战：${nextMonsterName}。`
}

export const calculateTreasureGearDropAttempts = (
  baseChance: number,
  treasureFindBonus: number,
  rollQuantity: (chance: number) => number
): number => {
  return rollQuantity(baseChance + treasureFindBonus * baseChance)
}

export type TreasureGearDropDecision =
  | { action: 'grant'; gearId: string }
  | { action: 'autoSell'; money: number }

export interface TreasureGearDropDecisionInput {
  gearId: string
  alreadyOwned: boolean
  sellPrice: number
}

export const resolveTreasureGearDropDecision = ({
  gearId,
  alreadyOwned,
  sellPrice
}: TreasureGearDropDecisionInput): TreasureGearDropDecision => {
  return alreadyOwned ? { action: 'autoSell', money: sellPrice } : { action: 'grant', gearId }
}

export interface TreasureGearDropDecisionsInput {
  attempts: number
  createDecisionInput: (attemptIndex: number) => TreasureGearDropDecisionInput
}

export const resolveTreasureGearDropDecisions = ({
  attempts,
  createDecisionInput
}: TreasureGearDropDecisionsInput): TreasureGearDropDecision[] => {
  const decisions: TreasureGearDropDecision[] = []
  for (let attemptIndex = 0; attemptIndex < attempts; attemptIndex++) {
    decisions.push(resolveTreasureGearDropDecision(createDecisionInput(attemptIndex)))
  }
  return decisions
}

export interface TreasureGearDropRollInput {
  baseChance: number
  treasureFindBonus: number
  rollQuantity: (chance: number) => number
  createDecisionInput: (attemptIndex: number) => TreasureGearDropDecisionInput
}

export interface TreasureGearDropRollResult {
  attempts: number
  decisions: TreasureGearDropDecision[]
}

export const resolveTreasureGearDropRoll = ({
  baseChance,
  treasureFindBonus,
  rollQuantity,
  createDecisionInput
}: TreasureGearDropRollInput): TreasureGearDropRollResult => {
  const attempts = calculateTreasureGearDropAttempts(baseChance, treasureFindBonus, rollQuantity)
  return {
    attempts,
    decisions: resolveTreasureGearDropDecisions({ attempts, createDecisionInput })
  }
}
