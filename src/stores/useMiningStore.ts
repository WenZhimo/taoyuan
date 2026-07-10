import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { MonsterDef, CombatAction, CombatStatusEffect, CombatStatusType, MineFloorDef, MineTile, Quality, EnchantmentDef } from '@/types'
import {
  getFloor,
  getRewardNames,
  getInfestedClearRewards,
  BOSS_MONSTERS,
  BOSS_MONEY_REWARDS,
  BOSS_ORE_REWARDS,
  getWeakenedBoss,
  MAX_MINE_FLOOR,
  generateSkullCavernFloor,
  scaleMonster,
  generateFloorGrid,
  getAdjacentIndices,
  getBombIndices
} from '@/data'
import { getBombById } from '@/data/processing'
import { getItemById } from '@/data/items'
import {
  getWeaponById,
  getOwnedWeaponEnchantments,
  MONSTER_DROP_WEAPONS,
  BOSS_DROP_WEAPONS,
  TREASURE_DROP_WEAPONS,
  rollRandomEnchantment,
  getWeaponDisplayName,
  getWeaponSellPrice
} from '@/data/weapons'
import { getRingById, MONSTER_DROP_RINGS, BOSS_DROP_RINGS, TREASURE_DROP_RINGS } from '@/data/rings'
import { getHatById, MONSTER_DROP_HATS, BOSS_DROP_HATS, TREASURE_DROP_HATS } from '@/data/hats'
import { getShoeById, MONSTER_DROP_SHOES, BOSS_DROP_SHOES, TREASURE_DROP_SHOES } from '@/data/shoes'
import { usePlayerStore } from './usePlayerStore'
import { useInventoryStore } from './useInventoryStore'
import { useSkillStore } from './useSkillStore'
import { useAchievementStore } from './useAchievementStore'
import { useGuildStore } from './useGuildStore'
import { useQuestStore } from './useQuestStore'
import { useCookingStore } from './useCookingStore'
import { useGameStore } from './useGameStore'
import { useWalletStore } from './useWalletStore'
import { useSecretNoteStore } from './useSecretNoteStore'
import { useHiddenNpcStore } from './useHiddenNpcStore'
import type { SkullCavernFloorDef } from '@/data/mine'
import { rollChanceQuantity } from '@/domain/drops/rollChanceQuantity'
import { calculateMonsterDropBonus, rollMonsterItemDrops } from '@/domain/mining/drops'
import {
  COMBAT_ITEM_EFFECTS,
  calculateCritRate,
  calculateCombatDefeatPenalty,
  calculateIncomingDamage,
  calculatePlayerAttack,
  calculateSkullCavernBossReward,
  calculateTreasureGearDropAttempts,
  formatChainCombatNextMessage,
  formatChainCombatStartMessage,
  formatCombatEntryStartLine,
  formatCombatDefeatMessage,
  formatMainMineBossFirstKillWeaponMessage,
  formatMainMineBossGearRewardMessage,
  formatInfestedFloorClearMessage,
  formatInfestedFloorRemainingMonstersMessage,
  formatMainMineBossMoneyRewardMessage,
  formatMainMineBossOreRewardMessage,
  getDefendDamageMultiplier,
  getDefenderHealAmount,
  resolveMainMineBossFirstKillReward,
  resolveMainMineBossGearRewards,
  resolveCombatItemDamage,
  resolveCounterattackDecision,
  resolveTreasureGearDropRoll,
  resolvePlayerStrike
} from '@/domain/mining/combat'
import type { TreasureGearDropDecision } from '@/domain/mining/combat'
import {
  calculateSweepPreview,
  getNextSafePointFloor as getNextSafePointFloorRule,
  resolveSweepDestinationState,
  type SweepPreview
} from '@/domain/mining/sweep'
import {
  calculateMineRevealStaminaCost,
  canRevealMineTile,
  getBossTileCombatStartText,
  getChainAutoExploreTileState,
  formatChainAutoExploreSummary,
  formatTreasureTileMessage,
  getMonsterTileCombatStartText,
  getRevealedMonsterCombatStartText,
  calculateOreTileQuantity,
  revealEmptyMineTile,
  revealFallbackMineTile,
  revealMushroomMineTile,
  revealOreMineTile,
  revealStairsMineTile,
  revealTrapMineTile,
  shouldSkipChainAutoExploreTile,
  shouldUnlockStairsAfterChainAutoExplore,
  type StairsBlockReason,
  type MineTileRevealResult
} from '@/domain/mining/tileReveal'
import { replaceBossTilesWithWeakenedBoss, shouldUseWeakenedBoss } from '@/domain/mining/floorGeneration'
import {
  createCombatStatus,
  getStatusPower,
  hasCombatStatus,
  mergeCombatStatus,
  tickCombatStatuses
} from '@/domain/mining/statusEffects'

const DEFEAT_MONEY_PENALTY_RATE = 0.1
const DEFEAT_MONEY_PENALTY_CAP = 15000
const DEFEAT_MAX_ITEM_LOSS = 3

interface ChainCombatEntry {
  tileIndex: number
  monster: MonsterDef
  isBoss: boolean
}

type TreasureGearKind = 'ring' | 'hat' | 'shoe' | 'weapon'
type NonWeaponTreasureGearKind = Exclude<TreasureGearKind, 'weapon'>

interface NonWeaponTreasureDrop {
  chance: number
  gearId: string
}

interface WeaponTreasureDrop {
  chance: number
  gearId: string
}

interface ApplyTreasureGearDecisionInput {
  decision: TreasureGearDropDecision
  gearKind: TreasureGearKind
  enchantment?: string | string[] | null
}

interface ApplyTreasureGearDecisionResult {
  granted: boolean
  autoSoldMoney: number
}

interface ApplyTreasureGearDropRollsInput {
  drops: readonly NonWeaponTreasureDrop[]
  gearKind: NonWeaponTreasureGearKind
  treasureFindBonus: number
  isAlreadyOwned: (gearId: string) => boolean
  getSellPrice: (gearId: string) => number
  onGranted?: (gearId: string) => void
}

interface ApplyTreasureGearDropRollsResult {
  grantedCount: number
  autoSoldMoney: number
}

interface ApplyWeaponTreasureGearDropRollsInput {
  drops: readonly WeaponTreasureDrop[]
  treasureFindBonus: number
  onGranted?: (gearId: string) => void
}

interface ApplyTreasureGearDropsForZoneInput {
  zone: string
  treasureFindBonus: number
  onGranted?: (gearId: string) => void
}

interface MonsterGearDropResult {
  message: string
  autoSoldMoney: number
}

interface CombatItemUseResult {
  success: boolean
  message: string
}

interface PermanentGuildItemConfig {
  missingMessage: string
  applyBonus: (actual: number) => void
  createMessage: (actual: number) => string
}

interface CombatDefeatSideEffectsResult {
  wasInSkullCavern: boolean
  droppedItemCount: number
  moneyLost: number
}

type FloorAdvanceResult =
  | { success: true; transitionedToSkullCavern: boolean }
  | { success: false; message: string }

interface MonsterLureResult {
  monstersAdded: number
}

export const useMiningStore = defineStore('mining', () => {
  const playerStore = usePlayerStore()
  const inventoryStore = useInventoryStore()
  const skillStore = useSkillStore()

  /** 当前进度（主矿洞） */
  const currentFloor = ref(1)
  const safePointFloor = ref(0)
  const isExploring = ref(false)

  /** 骷髅矿穴状态 */
  const isInSkullCavern = ref(false)
  const skullCavernFloor = ref(0)
  const skullCavernBestFloor = ref(0)
  const skullSafePointFloor = ref(0)
  const cachedSkullFloorData = ref<SkullCavernFloorDef | null>(null)

  /** 战斗状态 */
  const inCombat = ref(false)
  const combatMonster = ref<MonsterDef | null>(null)
  const combatMonsterHp = ref(0)
  const combatRound = ref(0)
  const combatLog = ref<string[]>([])
  const combatIsBoss = ref(false)
  const combatMonsterStatuses = ref<CombatStatusEffect[]>([])
  const combatPlayerStatuses = ref<CombatStatusEffect[]>([])
  const chainCombatActive = ref(false)
  const chainCombatQueue = ref<ChainCombatEntry[]>([])

  /** 已击败的 BOSS（首杀记录） */
  const defeatedBosses = ref<string[]>([])

  /** 本次探索收集的物品（离开时50%丢失用） */
  const sessionLoot = ref<{ itemId: string; quantity: number }[]>([])

  /** 猎魔符效果：本次探索掉落率+20% */
  const slayerCharmActive = ref(false)
  /** 公会徽章累积攻击力加成（永久） */
  const guildBadgeBonusAttack = ref(0)
  /** 生命护符累积最大HP加成（永久） */
  const guildBonusMaxHp = ref(0)
  /** 幸运铜钱累积掉落率加成（永久，每次+0.05） */
  const guildBonusDropRate = ref(0)
  /** 守护符累积防御加成（永久，每次+0.03） */
  const guildBonusDefense = ref(0)

  const applyTreasureGearDecision = ({
    decision,
    gearKind,
    enchantment = null
  }: ApplyTreasureGearDecisionInput): ApplyTreasureGearDecisionResult => {
    if (decision.action === 'autoSell') {
      playerStore.earnMoney(decision.money)
      return { granted: false, autoSoldMoney: decision.money }
    }

    switch (gearKind) {
      case 'ring':
        inventoryStore.addRing(decision.gearId)
        break
      case 'hat':
        inventoryStore.addHat(decision.gearId)
        break
      case 'shoe':
        inventoryStore.addShoe(decision.gearId)
        break
      case 'weapon':
        inventoryStore.addWeapon(decision.gearId, enchantment)
        break
    }

    return { granted: true, autoSoldMoney: 0 }
  }

  const applyTreasureGearDropRolls = ({
    drops,
    gearKind,
    treasureFindBonus,
    isAlreadyOwned,
    getSellPrice,
    onGranted
  }: ApplyTreasureGearDropRollsInput): ApplyTreasureGearDropRollsResult => {
    let grantedCount = 0
    let autoSoldMoney = 0

    for (const drop of drops) {
      const { decisions } = resolveTreasureGearDropRoll({
        baseChance: drop.chance,
        treasureFindBonus,
        rollQuantity: rollChanceQuantity,
        createDecisionInput: () => ({
          gearId: drop.gearId,
          alreadyOwned: isAlreadyOwned(drop.gearId),
          sellPrice: getSellPrice(drop.gearId)
        })
      })

      for (const decision of decisions) {
        const result = applyTreasureGearDecision({ decision, gearKind })
        autoSoldMoney += result.autoSoldMoney
        if (decision.action === 'grant') {
          grantedCount++
          onGranted?.(decision.gearId)
        }
      }
    }

    return { grantedCount, autoSoldMoney }
  }

  const applyWeaponTreasureGearDropRolls = ({
    drops,
    treasureFindBonus,
    onGranted
  }: ApplyWeaponTreasureGearDropRollsInput): ApplyTreasureGearDropRollsResult => {
    let grantedCount = 0
    let autoSoldMoney = 0

    for (const drop of drops) {
      const attempts = calculateTreasureGearDropAttempts(drop.chance, treasureFindBonus, rollChanceQuantity)
      const enchantIds = Array.from({ length: attempts }, () => rollRandomEnchantment())
      const { decisions } = resolveTreasureGearDropRoll({
        baseChance: drop.chance,
        treasureFindBonus,
        rollQuantity: () => attempts,
        createDecisionInput: attemptIndex => {
          const enchantId = enchantIds[attemptIndex] ?? null
          return {
            gearId: drop.gearId,
            alreadyOwned: inventoryStore.hasWeaponExact(drop.gearId, enchantId),
            sellPrice: getWeaponSellPrice(drop.gearId, enchantId)
          }
        }
      })

      for (const [attemptIndex, decision] of decisions.entries()) {
        const enchantId = enchantIds[attemptIndex] ?? null
        const result = applyTreasureGearDecision({ decision, gearKind: 'weapon', enchantment: enchantId })
        autoSoldMoney += result.autoSoldMoney
        if (decision.action === 'grant') {
          grantedCount++
          onGranted?.(decision.gearId)
        }
      }
    }

    return { grantedCount, autoSoldMoney }
  }

  const applyTreasureGearDropsForZone = ({
    zone,
    treasureFindBonus,
    onGranted
  }: ApplyTreasureGearDropsForZoneInput): ApplyTreasureGearDropRollsResult => {
    let grantedCount = 0
    let autoSoldMoney = 0

    const addResult = (result: ApplyTreasureGearDropRollsResult) => {
      grantedCount += result.grantedCount
      autoSoldMoney += result.autoSoldMoney
    }

    addResult(
      applyTreasureGearDropRolls({
        drops: (TREASURE_DROP_RINGS[zone] ?? []).map(drop => ({ chance: drop.chance, gearId: drop.ringId })),
        gearKind: 'ring',
        treasureFindBonus,
        isAlreadyOwned: gearId => inventoryStore.hasRing(gearId),
        getSellPrice: gearId => getRingById(gearId)?.sellPrice ?? 0,
        onGranted
      })
    )

    addResult(
      applyTreasureGearDropRolls({
        drops: (TREASURE_DROP_HATS[zone] ?? []).map(drop => ({ chance: drop.chance, gearId: drop.hatId })),
        gearKind: 'hat',
        treasureFindBonus,
        isAlreadyOwned: gearId => inventoryStore.hasHat(gearId),
        getSellPrice: gearId => getHatById(gearId)?.sellPrice ?? 0,
        onGranted
      })
    )

    addResult(
      applyTreasureGearDropRolls({
        drops: (TREASURE_DROP_SHOES[zone] ?? []).map(drop => ({ chance: drop.chance, gearId: drop.shoeId })),
        gearKind: 'shoe',
        treasureFindBonus,
        isAlreadyOwned: gearId => inventoryStore.hasShoe(gearId),
        getSellPrice: gearId => getShoeById(gearId)?.sellPrice ?? 0,
        onGranted
      })
    )

    addResult(
      applyWeaponTreasureGearDropRolls({
        drops: (TREASURE_DROP_WEAPONS[zone] ?? []).map(drop => ({ chance: drop.chance, gearId: drop.weaponId })),
        treasureFindBonus,
        onGranted
      })
    )

    return { grantedCount, autoSoldMoney }
  }

  const applyMonsterWeaponDrops = (zone: string, luckyBonus: number): MonsterGearDropResult => {
    let message = ''
    let autoSoldMoney = 0

    for (const drop of MONSTER_DROP_WEAPONS[zone] ?? []) {
      const attempts = rollChanceQuantity(drop.chance + luckyBonus * drop.chance)
      for (let i = 0; i < attempts; i++) {
        const enchantId = rollRandomEnchantment()
        if (inventoryStore.hasWeaponExact(drop.weaponId, enchantId)) {
          const price = getWeaponSellPrice(drop.weaponId, enchantId)
          playerStore.earnMoney(price)
          autoSoldMoney += price
        } else {
          inventoryStore.addWeapon(drop.weaponId, enchantId)
          const displayName = getWeaponDisplayName(drop.weaponId, enchantId)
          message += ` 获得了武器：${displayName}！`
        }
      }
    }

    return { message, autoSoldMoney }
  }

  const applyMonsterRingDrops = (zone: string, luckyBonus: number): MonsterGearDropResult => {
    let message = ''
    let autoSoldMoney = 0

    for (const drop of MONSTER_DROP_RINGS[zone] ?? []) {
      const attempts = rollChanceQuantity(drop.chance + luckyBonus * drop.chance)
      for (let i = 0; i < attempts; i++) {
        if (inventoryStore.hasRing(drop.ringId)) {
          const price = getRingById(drop.ringId)?.sellPrice ?? 0
          playerStore.earnMoney(price)
          autoSoldMoney += price
        } else {
          inventoryStore.addRing(drop.ringId)
          const ringDef = getRingById(drop.ringId)
          message += ` 获得了戒指：${ringDef?.name ?? drop.ringId}！`
        }
      }
    }

    return { message, autoSoldMoney }
  }

  const applyMonsterHatDrops = (zone: string, luckyBonus: number): MonsterGearDropResult => {
    let message = ''
    let autoSoldMoney = 0

    for (const drop of MONSTER_DROP_HATS[zone] ?? []) {
      const attempts = rollChanceQuantity(drop.chance + luckyBonus * drop.chance)
      for (let i = 0; i < attempts; i++) {
        if (inventoryStore.hasHat(drop.hatId)) {
          const price = getHatById(drop.hatId)?.sellPrice ?? 0
          playerStore.earnMoney(price)
          autoSoldMoney += price
        } else {
          inventoryStore.addHat(drop.hatId)
          const hatDef = getHatById(drop.hatId)
          message += ` 获得了帽子：${hatDef?.name ?? drop.hatId}！`
        }
      }
    }

    return { message, autoSoldMoney }
  }

  const applyMonsterShoeDrops = (zone: string, luckyBonus: number): MonsterGearDropResult => {
    let message = ''
    let autoSoldMoney = 0

    for (const drop of MONSTER_DROP_SHOES[zone] ?? []) {
      const attempts = rollChanceQuantity(drop.chance + luckyBonus * drop.chance)
      for (let i = 0; i < attempts; i++) {
        if (inventoryStore.hasShoe(drop.shoeId)) {
          const price = getShoeById(drop.shoeId)?.sellPrice ?? 0
          playerStore.earnMoney(price)
          autoSoldMoney += price
        } else {
          inventoryStore.addShoe(drop.shoeId)
          const shoeDef = getShoeById(drop.shoeId)
          message += ` 获得了鞋子：${shoeDef?.name ?? drop.shoeId}！`
        }
      }
    }

    return { message, autoSoldMoney }
  }

  const applyMonsterGearDropsForZone = (zone: string, luckyBonus: number): MonsterGearDropResult => {
    let message = ''
    let autoSoldMoney = 0

    for (const result of [
      applyMonsterWeaponDrops(zone, luckyBonus),
      applyMonsterRingDrops(zone, luckyBonus),
      applyMonsterHatDrops(zone, luckyBonus),
      applyMonsterShoeDrops(zone, luckyBonus)
    ]) {
      message += result.message
      autoSoldMoney += result.autoSoldMoney
    }

    return { message, autoSoldMoney }
  }

  const applyMainMineBossGearRewards = (rewards: ReturnType<typeof resolveMainMineBossGearRewards>): string => {
    let message = ''

    for (const reward of rewards) {
      switch (reward.gearType) {
        case 'ring': {
          inventoryStore.addRing(reward.gearId)
          const bossRingDef = getRingById(reward.gearId)
          message += formatMainMineBossGearRewardMessage('ring', bossRingDef?.name ?? reward.gearId)
          break
        }
        case 'hat': {
          inventoryStore.addHat(reward.gearId)
          const bossHatDef = getHatById(reward.gearId)
          message += formatMainMineBossGearRewardMessage('hat', bossHatDef?.name ?? reward.gearId)
          break
        }
        case 'shoe': {
          inventoryStore.addShoe(reward.gearId)
          const bossShoeDef = getShoeById(reward.gearId)
          message += formatMainMineBossGearRewardMessage('shoe', bossShoeDef?.name ?? reward.gearId)
          break
        }
      }
    }

    return message
  }

  const applyInfestedFloorClearRewards = (floorNum: number): string => {
    const clearRewards = getInfestedClearRewards(floorNum)
    for (const reward of clearRewards.items) {
      inventoryStore.addItem(reward.itemId, reward.quantity)
      sessionLoot.value.push(reward)
    }
    playerStore.earnMoney(clearRewards.money)
    return formatInfestedFloorClearMessage(getRewardNames(clearRewards.items), clearRewards.money)
  }

  const usePermanentGuildItem = (
    itemId: string,
    quantity: number,
    config: PermanentGuildItemConfig
  ): CombatItemUseResult => {
    const actual = Math.min(quantity, inventoryStore.getItemCount(itemId))
    if (actual <= 0) return { success: false, message: config.missingMessage }

    inventoryStore.removeItem(itemId, actual)
    config.applyBonus(actual)
    const msg = config.createMessage(actual)
    if (inCombat.value) combatLog.value.push(msg)
    return { success: true, message: msg }
  }

  const usePermanentGuildCombatItem = (itemId: string, quantity: number): CombatItemUseResult | null => {
    const configs: Record<string, PermanentGuildItemConfig> = {
      guild_badge: {
        missingMessage: '没有公会徽章。',
        applyBonus: actual => {
          guildBadgeBonusAttack.value += 3 * actual
        },
        createMessage: actual => `使用了公会徽章×${actual}，攻击力永久+${3 * actual}！`
      },
      life_talisman: {
        missingMessage: '没有生命护符。',
        applyBonus: actual => {
          guildBonusMaxHp.value += 15 * actual
        },
        createMessage: actual => `使用了生命护符×${actual}，最大生命值永久+${15 * actual}！`
      },
      lucky_coin: {
        missingMessage: '没有幸运铜钱。',
        applyBonus: actual => {
          guildBonusDropRate.value += 0.05 * actual
        },
        createMessage: actual => `使用了幸运铜钱×${actual}，怪物掉落率永久+${5 * actual}%！`
      },
      defense_charm: {
        missingMessage: '没有守护符。',
        applyBonus: actual => {
          guildBonusDefense.value += 0.03 * actual
        },
        createMessage: actual => `使用了守护符×${actual}，防御永久+${3 * actual}%！`
      }
    }
    const config = configs[itemId]
    return config ? usePermanentGuildItem(itemId, quantity, config) : null
  }

  const useSlayerCharm = (): CombatItemUseResult => {
    if (slayerCharmActive.value) return { success: false, message: '猎魔符效果已激活。' }
    if (!inventoryStore.removeItem('slayer_charm')) return { success: false, message: '没有猎魔符。' }
    slayerCharmActive.value = true
    const msg = '使用了猎魔符，本次探索怪物掉落率+20%！'
    if (inCombat.value) combatLog.value.push(msg)
    return { success: true, message: msg }
  }

  const useCombatEffectItem = (itemId: string): CombatItemUseResult | null => {
    const combatEffect = COMBAT_ITEM_EFFECTS[itemId]
    if (!combatEffect) return null

    const def = getItemById(itemId)
    const itemName = def?.name ?? itemId
    if (!inventoryStore.removeItem(itemId)) return { success: false, message: `没有${itemName}。` }

    if (combatEffect.kind === 'playerStatus') {
      const msg = `使用了${itemName}，${addStatus('player', createCombatStatus(combatEffect.status, combatEffect.turns, combatEffect.power, 'item'))}`
      if (inCombat.value) combatLog.value.push(msg)
      return { success: true, message: msg }
    }

    if (!inCombat.value || !combatMonster.value) {
      inventoryStore.addItem(itemId, 1)
      return { success: false, message: `${itemName}只能在战斗中使用。` }
    }

    const monster = combatMonster.value
    const itemDamage = resolveCombatItemDamage({
      effect: combatEffect,
      monsterHp: monster.hp,
      monsterDefense: monster.defense
    })
    const damage = itemDamage.damage
    combatMonsterHp.value = Math.max(0, combatMonsterHp.value - damage)
    let msg = `使用了${itemName}，对${monster.name}造成${damage}点${itemDamage.ignoresDefense ? '无视防御' : ''}伤害。`
    if (itemDamage.status) {
      msg += ` ${addStatus('monster', createCombatStatus(itemDamage.status, itemDamage.turns, itemDamage.power, 'item'))}`
    }

    if (combatMonsterHp.value <= 0) {
      const defeat = handleMonsterDefeat(monster, msg, damage)
      return { success: true, message: defeat.message }
    }

    combatLog.value.push(msg)
    return { success: true, message: msg }
  }

  const useRestorativeCombatItem = (itemId: string): CombatItemUseResult => {
    const def = getItemById(itemId)
    if (!def) return { success: false, message: '未知物品。' }

    // 烹饪品走 cookingStore.eat()，以正确应用buff、厨房加成等
    if (itemId.startsWith('food_')) {
      const cookingStore = useCookingStore()
      const hpFull = playerStore.hp >= playerStore.getMaxHp()
      const staminaFull = playerStore.stamina >= playerStore.maxStamina
      if (hpFull && staminaFull) {
        return { success: false, message: '体力和生命值都已满。' }
      }
      // 查找背包中该食物的最低品质
      const qualityOrder: Quality[] = ['normal', 'fine', 'excellent', 'supreme']
      const foodQuality = qualityOrder.find(q => inventoryStore.getItemCount(itemId, q) > 0) ?? 'normal'
      const result = cookingStore.eat(itemId.slice(5), foodQuality)
      if (result.success && inCombat.value) combatLog.value.push(result.message)
      return result
    }

    const hpFull = playerStore.hp >= playerStore.getMaxHp()
    const staminaFull = playerStore.stamina >= playerStore.maxStamina
    const hasHpRestore = def.healthRestore && def.healthRestore > 0
    const hasStaminaRestore = def.staminaRestore && def.staminaRestore > 0

    if (hasHpRestore && !hasStaminaRestore && hpFull) {
      return { success: false, message: '生命值已满。' }
    }
    if (hasStaminaRestore && !hasHpRestore && staminaFull) {
      return { success: false, message: '体力已满。' }
    }
    if (hpFull && staminaFull && (hasHpRestore || hasStaminaRestore)) {
      return { success: false, message: '体力和生命值都已满。' }
    }

    if (!inventoryStore.removeItem(itemId)) return { success: false, message: `没有${def.name}。` }

    // 炼金师专精：食物恢复+50%
    const alchemistBonus = skillStore.getSkill('foraging').perk10 === 'alchemist' ? 1.5 : 1.0
    const parts: string[] = []
    if (hasHpRestore) {
      const restore = def.healthRestore! >= 999 ? playerStore.getMaxHp() : Math.floor(def.healthRestore! * alchemistBonus)
      playerStore.restoreHealth(restore)
      parts.push(`恢复${def.healthRestore! >= 999 ? '全部' : restore}HP`)
    }
    if (hasStaminaRestore) {
      const restore = Math.floor(def.staminaRestore! * alchemistBonus)
      playerStore.restoreStamina(restore)
      parts.push(`恢复${restore}体力`)
    }

    const msg = `使用了${def.name}，${parts.join('和')}！`
    if (inCombat.value) combatLog.value.push(msg)
    return { success: true, message: msg }
  }

  const applyMonsterLureToFloor = (floor: MineFloorDef): MonsterLureResult => {
    const existingMonsters = floorGrid.value.filter(t => (t.type === 'monster' || t.type === 'boss') && t.state !== 'defeated').length
    const hiddenEmpty = floorGrid.value.filter(t => t.state === 'hidden' && t.type === 'empty')
    const monstersToAdd = Math.min(existingMonsters, hiddenEmpty.length)

    if (monstersToAdd === 0) return { monstersAdded: 0 }

    const shuffled = [...hiddenEmpty].sort(() => Math.random() - 0.5)
    const monsterPool = floor.monsters
    for (let i = 0; i < monstersToAdd; i++) {
      const tile = shuffled[i]!
      const monster = monsterPool.length > 0 ? { ...monsterPool[Math.floor(Math.random() * monsterPool.length)]! } : undefined
      if (monster) {
        tile.type = 'monster'
        tile.data = { monster }
      }
    }

    totalMonstersOnFloor.value += monstersToAdd
    return { monstersAdded: monstersToAdd }
  }

  // ==================== 格子探索状态 ====================

  /** 当前层的 6×6 格子 */
  const floorGrid = ref<MineTile[]>([])
  /** 入口格索引 */
  const entryIndex = ref(0)
  /** 是否已发现楼梯 */
  const stairsFound = ref(false)
  /** 楼梯是否可使用（感染/BOSS层需全清） */
  const stairsUsable = ref(false)
  /** 当前层怪物总数 */
  const totalMonstersOnFloor = ref(0)
  /** 已击败怪物数 */
  const monstersDefeatedCount = ref(0)
  /** 当前战斗对应的格子索引 */
  const _combatTileIndex = ref(-1)

  // ==================== 骷髅矿穴辅助 ====================

  /** 骷髅矿穴是否已解锁（击败60层BOSS） */
  const isSkullCavernUnlocked = (): boolean => {
    return defeatedBosses.value.includes('lava_lord')
  }

  /** 获取当前活跃楼层号 */
  const getActiveFloorNum = (): number => {
    return isInSkullCavern.value ? skullCavernFloor.value : currentFloor.value
  }

  /** 获取当前活跃楼层数据（兼容主矿洞与骷髅矿穴） */
  const getActiveFloorData = (): MineFloorDef | undefined => {
    if (isInSkullCavern.value) {
      const sc = cachedSkullFloorData.value
      if (!sc) return undefined
      return {
        floor: sc.floor,
        zone: 'abyss',
        ores: sc.ores,
        monsters: sc.monsters.map(m => scaleMonster(m, sc.scaleFactor)),
        isSafePoint: sc.isSafePoint,
        specialType: sc.specialType
      }
    }
    return getFloor(currentFloor.value)
  }

  /** 生成并缓存骷髅矿穴当前层数据 */
  const cacheSkullFloor = (floor: number) => {
    cachedSkullFloorData.value = generateSkullCavernFloor(floor)
  }

  // ==================== 格子生成 ====================

  /** 生成当前层的 6×6 格子 */
  const _generateGrid = () => {
    const floor = getActiveFloorData()
    if (!floor) return

    const floorNum = getActiveFloorNum()
    const scaleFactor = isInSkullCavern.value ? (cachedSkullFloorData.value?.scaleFactor ?? 1) : 1

    const generated = generateFloorGrid(floor, floorNum, isInSkullCavern.value, scaleFactor)
    const bossId = BOSS_MONSTERS[currentFloor.value]?.id
    const result = shouldUseWeakenedBoss({
      floor,
      floorNum,
      isSkullCavern: isInSkullCavern.value,
      defeatedBossIds: defeatedBosses.value,
      bossId
    })
      ? replaceBossTilesWithWeakenedBoss(generated, getWeakenedBoss(currentFloor.value))
      : generated

    floorGrid.value = result.tiles
    entryIndex.value = result.entryIndex
    totalMonstersOnFloor.value = result.totalMonsters
    monstersDefeatedCount.value = 0
    stairsFound.value = false
    stairsUsable.value = result.stairsUsable
    _combatTileIndex.value = -1
  }

  // ==================== 格子交互 ====================

  /** 与已揭示的怪物/BOSS重新交战（逃跑后或炸弹揭示后） */
  const engageRevealedMonster = (index: number): MineTileRevealResult => {
    if (!isExploring.value) return { success: false, message: '你不在矿洞中。', startsCombat: false }
    if (inCombat.value) return { success: false, message: '战斗中无法探索。', startsCombat: false }

    const tile = floorGrid.value[index]
    if (!tile || tile.state !== 'revealed') return { success: false, message: '无法交战。', startsCombat: false }
    if (tile.type !== 'monster' && tile.type !== 'boss') return { success: false, message: '该格子没有怪物。', startsCombat: false }

    const monster = tile.data?.monster
    if (!monster) return { success: false, message: '该格子没有怪物。', startsCombat: false }

    _combatTileIndex.value = tile.index
    combatMonster.value = { ...monster }
    combatMonsterHp.value = monster.hp
    combatRound.value = 0
    combatMonsterStatuses.value = []

    const isBoss = tile.type === 'boss'
    const combatText = getRevealedMonsterCombatStartText(monster.name, monster.hp, isBoss, !defeatedBosses.value.includes(monster.id))
    combatLog.value = [combatText.combatLogMessage]
    combatIsBoss.value = isBoss
    inCombat.value = true

    return combatText.revealResult
  }

  /** 检查格子是否可翻开 */
  const canRevealTile = (index: number): boolean => {
    return canRevealMineTile(floorGrid.value, index, getAdjacentIndices(index))
  }

  /** 翻开格子 — 核心交互入口 */
  const revealTile = (index: number): MineTileRevealResult => {
    if (!isExploring.value) return { success: false, message: '你不在矿洞中。', startsCombat: false }
    if (inCombat.value) return { success: false, message: '战斗中无法探索。', startsCombat: false }

    const tile = floorGrid.value[index]
    if (!tile || tile.state !== 'hidden') return { success: false, message: '无法翻开该格子。', startsCombat: false }
    if (!canRevealTile(index)) return { success: false, message: '只能翻开已探索格子的相邻位置。', startsCombat: false }

    // 检查镐是否可用（未在升级中）
    if (!inventoryStore.isToolAvailable('pickaxe')) {
      return { success: false, message: '镐正在升级中，无法探索矿洞。', startsCombat: false }
    }

    // 扣体力（1 点基础，受镐/技能/buff 减免）
    const pickaxeMultiplier = inventoryStore.getToolStaminaMultiplier('pickaxe')
    const cookingStore = useCookingStore()
    const miningBuff = cookingStore.activeBuff?.type === 'mining' ? cookingStore.activeBuff.value / 100 : 0
    const walletStore = useWalletStore()
    const walletMiningReduction = walletStore.getMiningStaminaReduction()
    const ringMiningReduction = inventoryStore.getRingEffectValue('mining_stamina')
    const ringGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
    // 仙缘能力：聚气（shan_weng_1）挖矿体力-15%
    const spiritMiningReduction = useHiddenNpcStore().getAbilityValue('shan_weng_1') / 100
    const staminaCost = calculateMineRevealStaminaCost({
      pickaxeMultiplier,
      skillReduction: skillStore.getStaminaReduction('mining'),
      miningBuff,
      walletMiningReduction,
      ringMiningReduction,
      ringGlobalReduction,
      spiritMiningReduction
    })
    if (!playerStore.consumeStamina(staminaCost)) {
      return { success: false, message: '体力不足，无法探索。', startsCombat: false }
    }

    // 3% 概率获得秘密笔记
    if (Math.random() < 0.03) {
      useSecretNoteStore().tryCollectNote()
    }

    // 根据类型处理
    switch (tile.type) {
      case 'empty':
        return _handleEmptyTile(tile, staminaCost)
      case 'ore':
        return _handleOreTile(tile, staminaCost)
      case 'monster':
        return _handleMonsterTile(tile, staminaCost)
      case 'boss':
        return _handleBossTile(tile, staminaCost)
      case 'stairs':
        return _handleStairsTile(tile, staminaCost)
      case 'trap':
        return _handleTrapTile(tile, staminaCost)
      case 'treasure':
        return _handleTreasureTile(tile, staminaCost)
      case 'mushroom':
        return _handleMushroomTile(tile, staminaCost)
      default:
        return revealFallbackMineTile(tile)
    }
  }

  /** 处理空格子 */
  const _handleEmptyTile = (tile: MineTile, staminaCost: number): MineTileRevealResult => {
    return revealEmptyMineTile(tile, staminaCost)
  }

  /** 处理矿石格子 */
  const _handleOreTile = (tile: MineTile, staminaCost: number): MineTileRevealResult => {
    const oreId = tile.data?.oreId ?? 'copper_ore'
    const gameStore = useGameStore()
    const hiddenNpcStore = useHiddenNpcStore()
    const quantity = calculateOreTileQuantity({
      baseQuantity: tile.data?.oreQuantity ?? 1,
      minerBonusTriggered: skillStore.getSkill('mining').perk5 === 'miner' && Math.random() < 0.5,
      hilltopBonusTriggered: gameStore.farmMapType === 'hilltop' && Math.random() < 0.5,
      prospectorBonusTriggered: skillStore.getSkill('mining').perk10 === 'prospector' && Math.random() < 0.15,
      ringOreBonus: inventoryStore.getRingEffectValue('ore_bonus'),
      hiddenNpcOreBonusTriggered: hiddenNpcStore.isAbilityActive('hu_xian_2') && Math.random() < 0.15
    })

    inventoryStore.addItem(oreId, quantity)
    sessionLoot.value.push({ itemId: oreId, quantity })
    useAchievementStore().discoverItem(oreId)
    useQuestStore().onItemObtained(oreId, quantity)

    // 仙缘能力：药山（shan_weng_2）矿洞15%概率采到稀有草药
    if (hiddenNpcStore.isAbilityActive('shan_weng_2') && Math.random() < 0.15) {
      const herbs = ['herb', 'ginseng'] as const
      const herbId = herbs[Math.floor(Math.random() * herbs.length)]!
      inventoryStore.addItem(herbId, 1)
      sessionLoot.value.push({ itemId: herbId, quantity: 1 })
    }

    // 经验
    const hilltopXpBonus = gameStore.farmMapType === 'hilltop' ? 1.25 : 1.0
    skillStore.addExp('mining', Math.floor(5 * hilltopXpBonus))

    return revealOreMineTile(tile, quantity, staminaCost)
  }

  /** 处理怪物格子 */
  const _handleMonsterTile = (tile: MineTile, staminaCost: number): MineTileRevealResult => {
    const monster = tile.data?.monster
    if (!monster) {
      tile.state = 'revealed'
      return { success: true, message: '空无一物。', startsCombat: false }
    }

    _combatTileIndex.value = tile.index
    combatMonster.value = { ...monster }
    combatMonsterHp.value = monster.hp
    combatRound.value = 0
    combatMonsterStatuses.value = []
    const combatText = getMonsterTileCombatStartText(monster.name, monster.hp, staminaCost)
    combatLog.value = [combatText.combatLogMessage]
    combatIsBoss.value = false
    inCombat.value = true

    return combatText.revealResult
  }

  /** 处理 BOSS 格子 */
  const _handleBossTile = (tile: MineTile, staminaCost: number): MineTileRevealResult => {
    const monster = tile.data?.monster
    if (!monster) {
      tile.state = 'revealed'
      return { success: true, message: '空无一物。', startsCombat: false }
    }

    _combatTileIndex.value = tile.index
    combatMonster.value = { ...monster }
    combatMonsterHp.value = monster.hp
    combatRound.value = 0
    combatMonsterStatuses.value = []

    const isFirstKill = !defeatedBosses.value.includes(monster.id)
    const combatText = getBossTileCombatStartText(monster.name, monster.hp, staminaCost, isFirstKill)
    combatLog.value = [combatText.combatLogMessage]
    combatIsBoss.value = true
    inCombat.value = true

    return combatText.revealResult
  }

  /** 处理楼梯格子 */
  const _handleStairsTile = (tile: MineTile, staminaCost: number): MineTileRevealResult => {
    stairsFound.value = true
    const floor = getActiveFloorData()
    const blockReason: StairsBlockReason = !stairsUsable.value && floor?.specialType === 'infested'
      ? 'infested'
      : !stairsUsable.value && floor?.specialType === 'boss'
        ? 'boss'
        : null
    return revealStairsMineTile(tile, {
      staminaCost,
      blockReason,
      remainingMonsters: totalMonstersOnFloor.value - monstersDefeatedCount.value
    })
  }

  /** 处理陷阱格子 */
  const _handleTrapTile = (tile: MineTile, staminaCost: number): MineTileRevealResult => {
    const damage = tile.data?.trapDamage ?? 5
    playerStore.takeDamage(damage)

    if (playerStore.hp <= 0) {
      const defeatResult = handleDefeat()
      return revealTrapMineTile(tile, damage, staminaCost, defeatResult.message)
    }

    return revealTrapMineTile(tile, damage, staminaCost)
  }

  /** 处理宝箱格子 */
  const _handleTreasureTile = (tile: MineTile, staminaCost: number): MineTileRevealResult => {
    const items = tile.data?.treasureItems ?? []
    const money = tile.data?.treasureMoney ?? 0

    for (const r of items) {
      inventoryStore.addItem(r.itemId, r.quantity)
      sessionLoot.value.push(r)
      useAchievementStore().discoverItem(r.itemId)
    }
    if (money > 0) playerStore.earnMoney(money)

    // 宝箱戒指掉落
    const floor = getActiveFloorData()
    const treasureGearResult = applyTreasureGearDropsForZone({
      zone: floor?.zone ?? 'shallow',
      treasureFindBonus: inventoryStore.getRingEffectValue('treasure_find'),
      onGranted: gearId => items.push({ itemId: gearId, quantity: 1 })
    })

    tile.state = 'collected'

    const message = formatTreasureTileMessage({
      rewardNames: items.length > 0 ? getRewardNames(items) : '',
      rewardCount: items.length,
      money,
      autoSoldMoney: treasureGearResult.autoSoldMoney,
      staminaCost
    })
    return { success: true, message, startsCombat: false }
  }

  /** 处理蘑菇格子 */
  const _handleMushroomTile = (tile: MineTile, staminaCost: number): MineTileRevealResult => {
    const items = tile.data?.mushroomItems ?? []

    for (const r of items) {
      inventoryStore.addItem(r.itemId, r.quantity)
      sessionLoot.value.push(r)
      useAchievementStore().discoverItem(r.itemId)
    }
    skillStore.addExp('foraging', 3)

    return revealMushroomMineTile(tile, getRewardNames(items), staminaCost)
  }

  // ==================== 炸弹 ====================

  /** 在格子上使用炸弹 */
  const useBombOnGrid = (bombId: string, centerIndex: number): { success: boolean; message: string } => {
    if (!isExploring.value) return { success: false, message: '你不在矿洞中。' }
    if (inCombat.value) return { success: false, message: '战斗中无法使用炸弹。' }

    const bombDef = getBombById(bombId)
    if (!bombDef) return { success: false, message: '无效的炸弹。' }
    if (!inventoryStore.removeItem(bombId)) return { success: false, message: '背包中没有该炸弹。' }

    // 挖掘者专精：30%概率不消耗炸弹
    const excavatorSaved = skillStore.getSkill('mining').perk10 === 'excavator' && Math.random() < 0.3
    if (excavatorSaved) {
      inventoryStore.addItem(bombId, 1)
    }

    const indices = getBombIndices(centerIndex, bombId)
    const floor = getActiveFloorData()

    let oreCollected = 0
    let monstersKilled = 0
    const collectedOres: string[] = []

    for (const idx of indices) {
      const tile = floorGrid.value[idx]
      if (!tile || tile.state !== 'hidden') continue

      switch (tile.type) {
        case 'empty':
          tile.state = 'revealed'
          break
        case 'ore': {
          const oreId = tile.data?.oreId ?? 'copper_ore'
          // 炸弹采矿不享受矿工专精/地形/探矿者加成，仅给基础数量
          const quantity = tile.data?.oreQuantity ?? 1
          inventoryStore.addItem(oreId, quantity)
          sessionLoot.value.push({ itemId: oreId, quantity })
          useAchievementStore().discoverItem(oreId)
          collectedOres.push(oreId)
          oreCollected++
          tile.state = 'collected'
          break
        }
        case 'monster': {
          if (bombDef.clearsMonster && tile.data?.monster) {
            // 炸弹击杀怪物：50% 经验
            const monster = tile.data.monster
            const wildernessXpBonus = useGameStore().farmMapType === 'wilderness' ? 1.5 : 1.0
            skillStore.addExp('combat', Math.floor(monster.expReward * 0.5 * wildernessXpBonus))
            // 普通掉落（概率减半）
            for (const drop of monster.drops) {
              if (Math.random() < drop.chance * 0.5) {
                inventoryStore.addItem(drop.itemId)
                sessionLoot.value.push({ itemId: drop.itemId, quantity: 1 })
              }
            }
            tile.state = 'defeated'
            monstersDefeatedCount.value++
            useAchievementStore().recordMonsterKill()
            useGuildStore().recordKill(monster.id)
            monstersKilled++
          } else {
            // 爆竹只翻开，不杀怪物
            tile.state = 'revealed'
          }
          break
        }
        case 'boss':
          // 炸弹不杀 BOSS，只翻开
          tile.state = 'revealed'
          break
        case 'trap':
          // 炸弹引爆陷阱，免伤
          tile.state = 'triggered'
          break
        case 'stairs':
          tile.state = 'revealed'
          stairsFound.value = true
          break
        case 'treasure': {
          const items = tile.data?.treasureItems ?? []
          const money = tile.data?.treasureMoney ?? 0
          for (const r of items) {
            inventoryStore.addItem(r.itemId, r.quantity)
            sessionLoot.value.push(r)
          }
          if (money > 0) playerStore.earnMoney(money)
          tile.state = 'collected'
          break
        }
        case 'mushroom': {
          const items = tile.data?.mushroomItems ?? []
          for (const r of items) {
            inventoryStore.addItem(r.itemId, r.quantity)
            sessionLoot.value.push(r)
          }
          tile.state = 'collected'
          break
        }
      }
    }

    // 检查感染/BOSS层清除条件
    if (monstersDefeatedCount.value >= totalMonstersOnFloor.value && totalMonstersOnFloor.value > 0) {
      stairsUsable.value = true
      // 感染层清除奖励
      if (floor?.specialType === 'infested') {
        const activeFloorNum = getActiveFloorNum()
        const clearRewards = getInfestedClearRewards(activeFloorNum)
        for (const r of clearRewards.items) {
          inventoryStore.addItem(r.itemId, r.quantity)
          sessionLoot.value.push(r)
        }
        playerStore.earnMoney(clearRewards.money)
      }
    }

    if (oreCollected > 0) skillStore.addExp('mining', 5 * oreCollected)

    let msg = `${bombDef.name}爆炸了！`
    if (oreCollected > 0) msg += `采集了${oreCollected}份矿石`
    if (monstersKilled > 0) msg += `${oreCollected > 0 ? '，' : ''}击败了${monstersKilled}只怪物`
    if (oreCollected === 0 && monstersKilled === 0) msg += '翻开了一些区域'
    msg += '！'
    if (excavatorSaved) msg += '（挖掘者：炸弹未消耗！）'
    return { success: true, message: msg }
  }

  // ==================== 进入 / 离开 ====================

  /** 进入矿洞（可选择起始安全点楼层） */
  const beginMineExploration = (skullCavern: boolean): void => {
    isExploring.value = true
    isInSkullCavern.value = skullCavern
    sessionLoot.value = []
    combatPlayerStatuses.value = []
    combatMonsterStatuses.value = []

    _generateGrid()
    _checkAutoBossCombat()
  }

  /** 进入矿洞（可选择起始安全点楼层） */
  const enterMine = (startFromSafePoint?: number): string => {
    const baseFloor = startFromSafePoint ?? safePointFloor.value
    currentFloor.value = baseFloor + 1
    beginMineExploration(false)

    return `进入云隐矿洞，当前第${currentFloor.value}层。`
  }

  /** 进入骷髅矿穴（可选择起始安全点楼层） */
  const enterSkullCavern = (startFromSafePoint?: number): string => {
    if (!isSkullCavernUnlocked()) return '需要先击败60层BOSS才能进入骷髅矿穴。'
    const baseFloor = startFromSafePoint ?? skullSafePointFloor.value
    skullCavernFloor.value = baseFloor + 1
    cacheSkullFloor(skullCavernFloor.value)
    beginMineExploration(true)

    return `进入骷髅矿穴，当前第${skullCavernFloor.value}层。`
  }

  /** 检查是否自动触发BOSS战（BOSS格在入口邻格时） */
  const _checkAutoBossCombat = () => {
    // BOSS 层不自动触发——玩家需要自己探索到 BOSS 格
  }

  /** 获取所有已解锁的安全点（用于楼层选择） */
  const getUnlockedSafePoints = (): number[] => {
    const points: number[] = [0] // 0 = 从第1层开始
    for (let f = 5; f <= safePointFloor.value; f += 5) {
      points.push(f)
    }
    return points
  }

  /** 获取骷髅矿穴已解锁的安全点 */
  const getUnlockedSkullSafePoints = (): number[] => {
    const points: number[] = [0] // 0 = 从第1层开始
    for (let f = 10; f <= skullSafePointFloor.value; f += 10) {
      points.push(f)
    }
    return points
  }

  const getRemainingCombatEntries = (): ChainCombatEntry[] => {
    return floorGrid.value
      .filter(t => (t.type === 'monster' || t.type === 'boss') && t.state !== 'defeated' && t.data?.monster)
      .map(t => ({
        tileIndex: t.index,
        monster: { ...t.data!.monster! },
        isBoss: t.type === 'boss'
      }))
  }

  const getRemainingCombatTileCount = (): number => {
    return getRemainingCombatEntries().length
  }

  const getNextSafePointFloor = (): number | null => {
    return getNextSafePointFloorRule({
      currentFloor: getActiveFloorNum(),
      isSkullCavern: isInSkullCavern.value,
      maxMineFloor: MAX_MINE_FLOOR
    })
  }

  const getSweepPreview = (): SweepPreview => {
    const targetFloor = getNextSafePointFloor()
    const current = getActiveFloorNum()
    const currentMonsters = getRemainingCombatEntries()
    const playerPower =
      inventoryStore.getWeaponAttack() +
      skillStore.combatLevel * 2 +
      inventoryStore.getRingEffectValue('attack_bonus') +
      guildBadgeBonusAttack.value +
      useGuildStore().getGuildAttackBonus()

    return calculateSweepPreview({
      isExploring: isExploring.value,
      inCombat: inCombat.value,
      currentFloor: current,
      targetFloor,
      currentMonsterAttacks: currentMonsters.map(entry => entry.monster.attack),
      isSkullCavern: isInSkullCavern.value,
      defenseBonus: inventoryStore.getRingEffectValue('defense_bonus') + guildBonusDefense.value,
      playerPower,
      playerHp: playerStore.hp
    })
  }

  const sweepToNextSafePoint = (): { success: boolean; message: string } => {
    const preview = getSweepPreview()
    if (!preview.targetFloor) return { success: false, message: preview.message }
    if (!preview.canSweep) return { success: false, message: preview.message }

    playerStore.takeDamage(preview.estimatedDamage)
    chainCombatActive.value = false
    chainCombatQueue.value = []
    inCombat.value = false
    combatIsBoss.value = false
    _combatTileIndex.value = -1

    const destination = resolveSweepDestinationState({
      isSkullCavern: isInSkullCavern.value,
      targetFloor: preview.targetFloor,
      currentSafePointFloor: safePointFloor.value,
      skullSafePointFloor: skullSafePointFloor.value,
      skullBestFloor: skullCavernBestFloor.value
    })

    if (isInSkullCavern.value && destination.skullCavernFloor !== undefined) {
      skullCavernFloor.value = destination.skullCavernFloor
      cacheSkullFloor(skullCavernFloor.value)
      skullSafePointFloor.value = destination.skullSafePointFloor ?? skullSafePointFloor.value
      skullCavernBestFloor.value = destination.skullCavernBestFloor ?? skullCavernBestFloor.value
      if (destination.reachedNewSkullBest) {
        useAchievementStore().recordSkullCavernFloor(skullCavernFloor.value)
      }
    } else {
      currentFloor.value = destination.currentFloor ?? preview.targetFloor
      safePointFloor.value = destination.safePointFloor ?? safePointFloor.value
      useAchievementStore().recordMineFloor(currentFloor.value)
    }

    _generateGrid()
    return {
      success: true,
      message: `你扫荡穿过矿道，损失${preview.estimatedDamage}HP，抵达第${preview.targetFloor}层安全点。本次扫荡跳过了沿途战利品。`
    }
  }

  const revealWholeFloorNoTime = (): string => {
    let oreCount = 0
    let treasureCount = 0
    let mushroomCount = 0
    let money = 0
    let treasureGearCount = 0
    let treasureAutoSoldMoney = 0
    const floor = getActiveFloorData()

    for (const tile of floorGrid.value) {
      if (shouldSkipChainAutoExploreTile(tile)) continue

      switch (tile.type) {
        case 'empty':
          tile.state = getChainAutoExploreTileState(tile.type) ?? tile.state
          break
        case 'ore': {
          const oreId = tile.data?.oreId ?? 'copper_ore'
          const quantity = tile.data?.oreQuantity ?? 1
          inventoryStore.addItem(oreId, quantity)
          sessionLoot.value.push({ itemId: oreId, quantity })
          useAchievementStore().discoverItem(oreId)
          oreCount += quantity
          tile.state = getChainAutoExploreTileState(tile.type) ?? tile.state
          break
        }
        case 'treasure': {
          const items = tile.data?.treasureItems ?? []
          const tileMoney = tile.data?.treasureMoney ?? 0
          for (const r of items) {
            inventoryStore.addItem(r.itemId, r.quantity)
            sessionLoot.value.push(r)
            useAchievementStore().discoverItem(r.itemId)
          }
          if (tileMoney > 0) {
            playerStore.earnMoney(tileMoney)
            money += tileMoney
          }

          const zone = floor?.zone ?? 'shallow'
          const treasureGearResult = applyTreasureGearDropsForZone({
            zone,
            treasureFindBonus: inventoryStore.getRingEffectValue('treasure_find')
          })
          treasureAutoSoldMoney += treasureGearResult.autoSoldMoney
          treasureGearCount += treasureGearResult.grantedCount

          treasureCount++
          tile.state = getChainAutoExploreTileState(tile.type) ?? tile.state
          break
        }
        case 'mushroom': {
          const items = tile.data?.mushroomItems ?? []
          for (const r of items) {
            inventoryStore.addItem(r.itemId, r.quantity)
            sessionLoot.value.push(r)
            useAchievementStore().discoverItem(r.itemId)
          }
          mushroomCount += items.reduce((sum, r) => sum + r.quantity, 0)
          tile.state = getChainAutoExploreTileState(tile.type) ?? tile.state
          break
        }
        case 'stairs':
          tile.state = getChainAutoExploreTileState(tile.type) ?? tile.state
          stairsFound.value = true
          break
        case 'trap':
          tile.state = getChainAutoExploreTileState(tile.type) ?? tile.state
          break
        case 'monster':
        case 'boss':
          tile.state = getChainAutoExploreTileState(tile.type) ?? tile.state
          break
      }
    }

    if (oreCount > 0) skillStore.addExp('mining', 5 * oreCount)
    if (mushroomCount > 0) skillStore.addExp('foraging', 3)
    if (shouldUnlockStairsAfterChainAutoExplore(monstersDefeatedCount.value, totalMonstersOnFloor.value)) {
      stairsUsable.value = true
    }

    return formatChainAutoExploreSummary({
      oreCount,
      treasureCount,
      treasureGearCount,
      mushroomCount,
      money,
      treasureAutoSoldMoney
    })
  }

  const startCombatFromEntry = (entry: ChainCombatEntry, appendLog = false) => {
    _combatTileIndex.value = entry.tileIndex
    combatMonster.value = { ...entry.monster }
    combatMonsterHp.value = entry.monster.hp
    combatRound.value = 0
    combatMonsterStatuses.value = []
    combatIsBoss.value = entry.isBoss
    inCombat.value = true

    const line = formatCombatEntryStartLine(entry.monster.name, entry.monster.hp, entry.isBoss)
    if (appendLog) {
      combatLog.value.push(line)
    } else {
      combatLog.value = [line]
    }
  }

  const startChainBattle = (): { success: boolean; message: string; startsCombat: boolean } => {
    if (!isExploring.value) return { success: false, message: '你不在矿洞中。', startsCombat: false }
    if (inCombat.value) return { success: false, message: '已经在战斗中。', startsCombat: false }

    const entries = getRemainingCombatEntries()
    if (entries.length === 0) return { success: false, message: '本层已经没有可连战的怪物。', startsCombat: false }

    chainCombatActive.value = true
    chainCombatQueue.value = entries.slice(1)
    startCombatFromEntry(entries[0]!)
    return { success: true, message: formatChainCombatStartMessage(entries.length), startsCombat: true }
  }

  // ==================== 战斗 ====================

  const getPlayerStatusPower = (type: CombatStatusType): number => {
    return getStatusPower(combatPlayerStatuses.value, type)
  }

  const addStatus = (target: 'monster' | 'player', status: CombatStatusEffect): string => {
    if (target === 'monster') {
      combatMonsterStatuses.value = mergeCombatStatus(combatMonsterStatuses.value, status)
    } else {
      combatPlayerStatuses.value = mergeCombatStatus(combatPlayerStatuses.value, status)
    }
    const targetName = target === 'monster' ? (combatMonster.value?.name ?? '敌人') : '你'
    return `${targetName}陷入了[${status.name}]状态！`
  }

  const tickStatuses = (target: 'monster' | 'player'): string[] => {
    const list = target === 'monster' ? combatMonsterStatuses.value : combatPlayerStatuses.value
    const lines: string[] = []
    const maxHp = target === 'monster' ? (combatMonster.value?.hp ?? 0) : playerStore.getMaxHp()
    const result = tickCombatStatuses(list, maxHp)

    for (const { status, damage } of result.damageByStatus) {
      if (target === 'monster') {
        combatMonsterHp.value = Math.max(0, combatMonsterHp.value - damage)
        lines.push(`${combatMonster.value?.name ?? '敌人'}受到[${status.name}]影响，损失${damage}HP。`)
      } else {
        playerStore.takeDamage(damage)
        lines.push(`你受到[${status.name}]影响，损失${damage}HP。`)
      }
    }

    if (target === 'monster') combatMonsterStatuses.value = result.remainingStatuses
    else combatPlayerStatuses.value = result.remainingStatuses
    return lines
  }

  const hasStatus = (target: 'monster' | 'player', type: CombatStatusType): boolean => {
    const list = target === 'monster' ? combatMonsterStatuses.value : combatPlayerStatuses.value
    return hasCombatStatus(list, type)
  }

  const buildPlayerAttack = (): number => {
    const cookingStore = useCookingStore()
    const guildStore = useGuildStore()
    const ringAttackBonus = inventoryStore.getRingEffectValue('attack_bonus')
    const allSkillsBuff = cookingStore.activeBuff?.type === 'all_skills' ? cookingStore.activeBuff.value : 0
    return calculatePlayerAttack({
      weaponAttack: inventoryStore.getWeaponAttack(),
      combatLevel: skillStore.combatLevel,
      allSkillsBuff,
      ringAttackBonus,
      guildBadgeBonusAttack: guildBadgeBonusAttack.value,
      guildAttackBonus: guildStore.getGuildAttackBonus(),
      battleRagePower: getPlayerStatusPower('battle_rage')
    })
  }

  const buildIncomingDamage = (baseDamage: number, defendMultiplier = 1): number => {
    const cookingStore = useCookingStore()
    const defenseReduction = cookingStore.activeBuff?.type === 'defense' ? cookingStore.activeBuff.value / 100 : 0
    const owned = inventoryStore.getEquippedWeapon()
    const hasSturdyEnchantment = getOwnedWeaponEnchantments(owned).some(enchant => enchant.special === 'sturdy')
    const ringDefenseBonus = inventoryStore.getRingEffectValue('defense_bonus')
    const ironSkinReduction = getPlayerStatusPower('iron_skin')
    return calculateIncomingDamage({
      baseDamage,
      defendMultiplier,
      defenseReduction,
      hasSturdyEnchantment,
      ringDefenseBonus,
      guildBonusDefense: guildBonusDefense.value,
      ironSkinReduction
    })
  }

  const getEnchantmentStatus = (special: EnchantmentDef['special']) => {
    if (special === 'poison') return createCombatStatus('poison', 4, 0.04, 'player')
    if (special === 'burn') return createCombatStatus('burn', 3, 0.06, 'player')
    if (special === 'freeze') return createCombatStatus('freeze', 1, 1, 'player')
    if (special === 'radiation') return createCombatStatus('radiation', null, 0.04, 'player')
    return null
  }

  const applyCombatRegen = (): string | null => {
    const regen = Math.floor(inventoryStore.getRingEffectValue('combat_regen'))
    if (regen <= 0 || playerStore.hp >= playerStore.getMaxHp()) return null
    const beforeHp = playerStore.hp
    playerStore.restoreHealth(regen)
    const healed = playerStore.hp - beforeHp
    return healed > 0 ? `回春恢复${healed}HP。` : null
  }

  /** 战斗操作 */
  const combatAction = (action: CombatAction): { message: string; combatOver: boolean; won: boolean } => {
    if (!inCombat.value || !combatMonster.value) {
      return { message: '不在战斗中。', combatOver: true, won: false }
    }

    combatRound.value++
    const monster = combatMonster.value

    // BOSS 战不可逃跑
    if (action === 'flee') {
      if (combatIsBoss.value) {
        combatLog.value.push('BOSS战无法逃跑！')
        return { message: 'BOSS战无法逃跑！', combatOver: false, won: false }
      }
      chainCombatActive.value = false
      chainCombatQueue.value = []
      inCombat.value = false
      // 逃跑时格子标记为 revealed（怪物还在但已翻开）
      if (_combatTileIndex.value >= 0) {
        const tile = floorGrid.value[_combatTileIndex.value]
        if (tile) tile.state = 'revealed'
        _combatTileIndex.value = -1
      }
      combatLog.value.push('你逃跑了！')
      return { message: '成功逃离了战斗。', combatOver: true, won: false }
    }

    const statusLines = [...tickStatuses('monster'), ...tickStatuses('player')]
    if (statusLines.length > 0) {
      combatLog.value.push(statusLines.join(' '))
    }
    if (combatMonsterHp.value <= 0) {
      return handleMonsterDefeat(monster, `${statusLines.join(' ')} ${monster.name}被状态击倒！`, 0)
    }
    if (playerStore.hp <= 0) {
      return handleDefeat()
    }

    const regenLine = applyCombatRegen()
    if (regenLine) {
      combatLog.value.push(regenLine)
    }

    if (action === 'defend') {
      // 防御减少受到的伤害（重甲者专精：70%减伤，默认60%）
      const damage = buildIncomingDamage(monster.attack, getDefendDamageMultiplier(skillStore.getSkill('combat').perk10 === 'tank'))
      playerStore.takeDamage(damage)
      let defendMsg = `你举盾防御，受到${damage}点伤害。`

      // 守护者专精：防御回合恢复5HP
      const defenderHeal = getDefenderHealAmount(skillStore.getSkill('combat').perk5 === 'defender')
      if (defenderHeal > 0) {
        playerStore.restoreHealth(defenderHeal)
        defendMsg += `（守护者回复${defenderHeal}HP）`
      }

      combatLog.value.push(defendMsg)

      if (playerStore.hp <= 0) {
        return handleDefeat()
      }
      return { message: `防御！受到${damage}点伤害。`, combatOver: false, won: false }
    }

    // === 攻击 ===
    const owned = inventoryStore.getEquippedWeapon()
    const weaponDef = getWeaponById(owned.defId)
    const enchantments = getOwnedWeaponEnchantments(owned)

    // 基础攻击力（含戒指加成 + 料理全技能加成）
    const baseAttack = buildPlayerAttack()
    const critRate = calculateCritRate({
      weaponCritRate: inventoryStore.getWeaponCritRate(),
      ringCritBonus: inventoryStore.getRingEffectValue('crit_rate_bonus'),
      ringLuck: inventoryStore.getRingEffectValue('luck')
    })
    const strike = resolvePlayerStrike({
      baseAttack,
      monsterDefense: monster.defense,
      weaponType: weaponDef?.type,
      brute: skillStore.getSkill('combat').perk10 === 'brute',
      critRate,
      enchantments,
      ringVampiric: inventoryStore.getRingEffectValue('vampiric')
    })

    const damageToMonster = strike.damageToMonster
    combatMonsterHp.value -= damageToMonster

    let msg = `你攻击${monster.name}，造成${damageToMonster}点伤害。`
    if (strike.isCrit) msg = `暴击！${msg}`

    // 匕首追加攻击（25%概率，造成50%伤害）
    if (strike.extraDamage > 0) {
      combatMonsterHp.value -= strike.extraDamage
      msg += ` 追加攻击！额外造成${strike.extraDamage}点伤害！`
    }

    for (const enchant of strike.appliedStatusEnchantments) {
      const enchantStatus = getEnchantmentStatus(enchant.special)
      if (enchantStatus) {
        msg += ` ${addStatus('monster', enchantStatus)}`
      }
    }

    // 吸血（附魔 + 戒指叠加）
    if (strike.healAmount > 0) {
      playerStore.restoreHealth(strike.healAmount)
      msg += ` 吸血回复${strike.healAmount}HP！`
    }

    if (combatMonsterHp.value <= 0) {
      // 怪物被击败
      combatMonsterHp.value = 0
      return handleMonsterDefeat(monster, msg, strike.totalDamage)
    }

    const counterattack = resolveCounterattackDecision({
      isStunned: strike.isStunned,
      isFrozen: hasStatus('monster', 'freeze'),
      hasAcrobatPerk: skillStore.getSkill('combat').perk10 === 'acrobat'
    })
    if (counterattack.blockReason === 'stunned') {
      msg += ` ${monster.name}被震晕了！`
      combatLog.value.push(msg)
      return { message: msg, combatOver: false, won: false }
    }

    if (counterattack.blockReason === 'frozen') {
      msg += ` ${monster.name}被冻结，无法反击！`
      combatLog.value.push(msg)
      return { message: msg, combatOver: false, won: false }
    }

    // 杂技师专精：25% 概率闪避反击
    if (counterattack.blockReason === 'acrobat') {
      msg += ` 你灵巧地闪避了${monster.name}的反击！`
      combatLog.value.push(msg)
      return { message: msg, combatOver: false, won: false }
    }

    // 怪物反击（含戒指/状态减伤）
    const fighterReduction = skillStore.getSkill('combat').perk5 === 'fighter' ? 0.15 : 0
    const monsterDamage = buildIncomingDamage(monster.attack, 1 - fighterReduction)
    playerStore.takeDamage(monsterDamage)
    msg += ` ${monster.name}反击，你受到${monsterDamage}点伤害。`
    combatLog.value.push(msg)

    if (playerStore.hp <= 0) {
      return handleDefeat()
    }

    return { message: msg, combatOver: false, won: false }
  }

  /** 处理怪物击败（普通怪和 BOSS 共用） */
  const handleMonsterDefeat = (
    monster: MonsterDef,
    msg: string,
    _totalDamage: number
  ): { message: string; combatOver: boolean; won: boolean } => {
    inCombat.value = false

    // 经验
    const floor = getActiveFloorData()
    const wildernessXpBonus = useGameStore().farmMapType === 'wilderness' ? 1.5 : 1.0
    const infestedXpBonus = floor?.specialType === 'infested' ? 1.5 : 1.0
    skillStore.addExp('combat', Math.floor(monster.expReward * wildernessXpBonus * infestedXpBonus))

    // 幸运附魔 + 戒指增加掉落率
    const owned = inventoryStore.getEquippedWeapon()
    const luckyEnchantCount = getOwnedWeaponEnchantments(owned).filter(enchant => enchant.special === 'lucky').length
    const ringDropBonus = inventoryStore.getRingEffectValue('monster_drop_bonus')
    const ringLuckBonus = inventoryStore.getRingEffectValue('luck')
    const luckyBonus = calculateMonsterDropBonus({
      luckyEnchantCount,
      ringDropBonus,
      ringLuckBonus,
      slayerCharmActive: slayerCharmActive.value,
      guildBonusDropRate: guildBonusDropRate.value
    })

    // 普通掉落
    const drops: string[] = []
    for (const drop of rollMonsterItemDrops(monster.drops, luckyBonus)) {
      inventoryStore.addItem(drop.itemId, drop.quantity)
      sessionLoot.value.push({ itemId: drop.itemId, quantity: drop.quantity })
      useAchievementStore().discoverItem(drop.itemId)
      for (let i = 0; i < drop.quantity; i++) drops.push(drop.itemId)
    }

    // 宝石学家专精：怪物额外掉落当前层矿石
    if (skillStore.getSkill('mining').perk10 === 'mineralogist') {
      if (floor && floor.ores.length > 0) {
        const bonusOre = floor.ores[Math.floor(Math.random() * floor.ores.length)]!
        inventoryStore.addItem(bonusOre)
        sessionLoot.value.push({ itemId: bonusOre, quantity: 1 })
        drops.push(bonusOre)
      }
    }

    // 装备掉落（普通怪物，非 BOSS）
    if (!combatIsBoss.value && floor) {
      const monsterGearResult = applyMonsterGearDropsForZone(floor.zone, luckyBonus)
      msg += monsterGearResult.message
      if (monsterGearResult.autoSoldMoney > 0) msg += `（重复装备自动售出+${monsterGearResult.autoSoldMoney}文）`
    }

    // BOSS 击败处理
    if (combatIsBoss.value) {
      if (isInSkullCavern.value) {
        // 骷髅矿穴BOSS：奖励铜钱和矿石（按深度缩放）
        const scFloor = skullCavernFloor.value
        const { moneyReward, bonusOreCount } = calculateSkullCavernBossReward(scFloor)
        playerStore.earnMoney(moneyReward)
        msg += ` 获得${moneyReward}文！`
        const orePool = ['iridium_ore', 'void_ore', 'shadow_ore']
        for (let i = 0; i < bonusOreCount; i++) {
          const oreId = orePool[Math.floor(Math.random() * orePool.length)]!
          inventoryStore.addItem(oreId)
          sessionLoot.value.push({ itemId: oreId, quantity: 1 })
        }
        msg += ` 获得了${bonusOreCount}个稀有矿石！`
      } else {
        // 主矿洞BOSS
        const bossId = monster.id
        const firstKillReward = resolveMainMineBossFirstKillReward({
          bossId,
          defeatedBossIds: defeatedBosses.value,
          weaponId: BOSS_DROP_WEAPONS[currentFloor.value]
        })

        if (firstKillReward) {
          defeatedBosses.value.push(firstKillReward.bossId)
          // 首杀掉落武器
          const weaponId = firstKillReward.weaponId
          if (weaponId) {
            const bossWeaponDef = getWeaponById(weaponId)
            const fixedEnchant = bossWeaponDef?.fixedEnchantment ?? null
            inventoryStore.addWeapon(weaponId, fixedEnchant)
            const displayName = getWeaponDisplayName(weaponId, fixedEnchant)
            msg += formatMainMineBossFirstKillWeaponMessage(displayName)
          }
        }
        // 装备掉落（独立于首杀，使用 has* 去重，兼容旧存档补发）
        const bossRingId = BOSS_DROP_RINGS[currentFloor.value]
        const bossHatId = BOSS_DROP_HATS[currentFloor.value]
        const bossShoeId = BOSS_DROP_SHOES[currentFloor.value]
        const bossGearRewards = resolveMainMineBossGearRewards({
          rewardIds: {
            ringId: bossRingId,
            hatId: bossHatId,
            shoeId: bossShoeId
          },
          ownership: {
            hasRing: bossRingId ? inventoryStore.hasRing(bossRingId) : false,
            hasHat: bossHatId ? inventoryStore.hasHat(bossHatId) : false,
            hasShoe: bossShoeId ? inventoryStore.hasShoe(bossShoeId) : false
          }
        })
        msg += applyMainMineBossGearRewards(bossGearRewards)

        // BOSS 额外掉落铜钱和矿石
        const moneyReward = BOSS_MONEY_REWARDS[currentFloor.value] ?? 0
        if (moneyReward > 0) {
          playerStore.earnMoney(moneyReward)
          msg += formatMainMineBossMoneyRewardMessage(moneyReward)
        }
        const oreRewards = BOSS_ORE_REWARDS[currentFloor.value]
        if (oreRewards) {
          for (const ore of oreRewards) {
            inventoryStore.addItem(ore.itemId, ore.quantity)
            sessionLoot.value.push(ore)
          }
          msg += formatMainMineBossOreRewardMessage(getRewardNames(oreRewards))
        }
      }
    }

    msg += ` ${monster.name}被击败了！(+${monster.expReward}经验)`
    if (drops.length > 0) msg += ` 掉落了物品。`
    combatLog.value.push(msg)

    // === 更新格子状态 ===
    if (_combatTileIndex.value >= 0) {
      const tile = floorGrid.value[_combatTileIndex.value]
      if (tile) tile.state = 'defeated'
      _combatTileIndex.value = -1
    }
    monstersDefeatedCount.value++
    useAchievementStore().recordMonsterKill()
    if (combatMonster.value) {
      useGuildStore().recordKill(combatMonster.value.id)
    }

    // 检查感染/BOSS层清除条件
    if (monstersDefeatedCount.value >= totalMonstersOnFloor.value && totalMonstersOnFloor.value > 0) {
      stairsUsable.value = true
      // 感染层清除奖励
      if (floor?.specialType === 'infested') {
        msg += applyInfestedFloorClearRewards(getActiveFloorNum())
      }
    } else if (floor?.specialType === 'infested') {
      const remaining = totalMonstersOnFloor.value - monstersDefeatedCount.value
      msg += formatInfestedFloorRemainingMonstersMessage(remaining)
    }

    if (chainCombatActive.value) {
      const next = chainCombatQueue.value.shift()
      if (next) {
        startCombatFromEntry(next, true)
        return { message: formatChainCombatNextMessage(msg, next.monster.name), combatOver: false, won: true }
      }

      chainCombatActive.value = false
      msg += ` ${revealWholeFloorNoTime()}`
      combatLog.value[combatLog.value.length - 1] = msg
    }

    combatIsBoss.value = false
    return { message: msg, combatOver: true, won: true }
  }

  const applyCombatDefeatSideEffects = (): CombatDefeatSideEffectsResult => {
    inCombat.value = false
    combatIsBoss.value = false
    chainCombatActive.value = false
    chainCombatQueue.value = []
    const wasInSkullCavern = isInSkullCavern.value
    isExploring.value = false
    slayerCharmActive.value = false
    combatPlayerStatuses.value = []
    combatMonsterStatuses.value = []

    // 清空格子
    floorGrid.value = []
    _combatTileIndex.value = -1

    // 丢失50%本次探索物品
    const availableItems = inventoryStore.items.filter(i => i.quantity > 0)
    const penalty = calculateCombatDefeatPenalty({
      sessionLootCount: sessionLoot.value.length,
      availableInventoryItemCount: availableItems.length,
      money: playerStore.money,
      moneyPenaltyRate: DEFEAT_MONEY_PENALTY_RATE,
      moneyPenaltyCap: DEFEAT_MONEY_PENALTY_CAP,
      maxItemLoss: DEFEAT_MAX_ITEM_LOSS
    })

    const lostCount = penalty.sessionLootLossCount
    for (let i = 0; i < lostCount; i++) {
      const item = sessionLoot.value.pop()
      if (item) inventoryStore.removeItem(item.itemId, item.quantity)
    }

    // 随机丢失最多3件背包物品
    const droppedItems: string[] = []
    const dropCount = penalty.inventoryDropCount
    for (let i = 0; i < dropCount; i++) {
      const candidates = inventoryStore.items.filter(i => i.quantity > 0)
      if (candidates.length === 0) break
      const pick = candidates[Math.floor(Math.random() * candidates.length)]!
      droppedItems.push(pick.itemId)
      inventoryStore.removeItem(pick.itemId, 1, pick.quality)
    }

    // 扣除铜钱
    const moneyLost = penalty.moneyLost
    if (moneyLost > 0) playerStore.spendMoney(moneyLost)

    // HP 恢复到50%
    const maxHp = playerStore.getMaxHp()
    playerStore.restoreHealth(Math.floor(maxHp * 0.5))

    // 骷髅矿穴：重置
    if (wasInSkullCavern) {
      isInSkullCavern.value = false
      skullCavernFloor.value = 0
      cachedSkullFloorData.value = null
    }

    return {
      wasInSkullCavern,
      droppedItemCount: droppedItems.length,
      moneyLost
    }
  }

  /** 战斗失败处理 */
  const handleDefeat = (): { message: string; combatOver: boolean; won: boolean } => {
    const msg = formatCombatDefeatMessage(applyCombatDefeatSideEffects())
    combatLog.value.push(msg)
    return { message: msg, combatOver: true, won: false }
  }

  const advanceSkullCavernFloor = (): FloorAdvanceResult => {
    skullCavernFloor.value++
    cacheSkullFloor(skullCavernFloor.value)
    if (skullCavernFloor.value > skullCavernBestFloor.value) {
      skullCavernBestFloor.value = skullCavernFloor.value
      useAchievementStore().recordSkullCavernFloor(skullCavernFloor.value)
    }

    const skullFloor = cachedSkullFloorData.value
    if (skullFloor?.isSafePoint && skullCavernFloor.value > skullSafePointFloor.value) {
      skullSafePointFloor.value = skullCavernFloor.value
    }

    return { success: true, transitionedToSkullCavern: false }
  }

  const advanceNormalMineFloor = (): FloorAdvanceResult => {
    if (currentFloor.value >= MAX_MINE_FLOOR) {
      if (!isSkullCavernUnlocked()) {
        return { success: false, message: '已经到达矿洞最深处！（击败60层BOSS可解锁骷髅矿穴）' }
      }
      isInSkullCavern.value = true
      skullCavernFloor.value = 1
      cacheSkullFloor(1)
      return { success: true, transitionedToSkullCavern: true }
    }

    currentFloor.value++
    useAchievementStore().recordMineFloor(currentFloor.value)

    const newFloorData = getFloor(currentFloor.value)
    if (newFloorData?.isSafePoint && currentFloor.value > safePointFloor.value) {
      safePointFloor.value = currentFloor.value
    }

    return { success: true, transitionedToSkullCavern: false }
  }

  // ==================== 楼层前进 ====================

  /** 前进到下一层 */
  const goNextFloor = (): { success: boolean; message: string } => {
    if (!isExploring.value) return { success: false, message: '你不在矿洞中。' }
    if (!stairsFound.value) {
      return { success: false, message: '还没有找到楼梯，继续探索吧。' }
    }
    if (!stairsUsable.value) {
      const floor = getActiveFloorData()
      if (floor?.specialType === 'infested') {
        const remaining = totalMonstersOnFloor.value - monstersDefeatedCount.value
        return { success: false, message: `还有${remaining}只怪物未清除，无法前进！` }
      }
      if (floor?.specialType === 'boss') {
        return { success: false, message: '必须击败BOSS才能前进！' }
      }
      return { success: false, message: '楼梯暂时无法使用。' }
    }

    const advanceResult = isInSkullCavern.value ? advanceSkullCavernFloor() : advanceNormalMineFloor()
    if (!advanceResult.success) return { success: false, message: advanceResult.message }

    // 生成新层格子
    _generateGrid()
    if (advanceResult.transitionedToSkullCavern) {
      return { success: true, message: '你穿过矿洞最深处的裂隙，进入了骷髅矿穴第1层！' }
    }

    const activeFloorNum = getActiveFloorNum()
    const newFloor = getActiveFloorData()
    const locationName = isInSkullCavern.value ? '骷髅矿穴' : ''
    const specialLabels: Record<string, string> = {
      mushroom: '蘑菇洞穴',
      treasure: '宝箱层',
      infested: '感染层',
      dark: '暗河层',
      boss: 'BOSS层'
    }
    const specialLabel = newFloor?.specialType ? (specialLabels[newFloor.specialType] ?? '') : ''
    let msg = `前进到${locationName}第${activeFloorNum}层。${newFloor?.isSafePoint ? '（安全点！）' : ''}`
    if (specialLabel) msg += ` [${specialLabel}]`
    return { success: true, message: msg }
  }

  const clearCombatState = (): void => {
    inCombat.value = false
    combatMonster.value = null
    combatMonsterHp.value = 0
    combatRound.value = 0
    combatLog.value = []
    combatIsBoss.value = false
    combatMonsterStatuses.value = []
    combatPlayerStatuses.value = []
    chainCombatActive.value = false
    chainCombatQueue.value = []
    _combatTileIndex.value = -1
  }

  const clearTransientExplorationStateForLoad = (): void => {
    isExploring.value = false
    clearCombatState()
    floorGrid.value = []
    slayerCharmActive.value = false
  }

  /** 离开矿洞 */
  const leaveMine = (): string => {
    // 离开前保存安全点（防止玩家到达安全点楼层后直接离开）
    if (!isInSkullCavern.value) {
      const floor = getActiveFloorData()
      if (floor?.isSafePoint && currentFloor.value > safePointFloor.value) {
        safePointFloor.value = currentFloor.value
      }
    }
    // 骷髅矿穴：离开前保存安全点
    if (isInSkullCavern.value) {
      const skullFloor = cachedSkullFloorData.value
      if (skullFloor?.isSafePoint && skullCavernFloor.value > skullSafePointFloor.value) {
        skullSafePointFloor.value = skullCavernFloor.value
      }
    }
    isExploring.value = false
    clearCombatState()
    floorGrid.value = []
    slayerCharmActive.value = false
    if (isInSkullCavern.value) {
      isInSkullCavern.value = false
      cachedSkullFloorData.value = null
      return '你离开了骷髅矿穴。'
    }
    return '你离开了矿洞。'
  }

  /** 睡袋过夜：保留矿洞探索状态，但清除当前战斗 */
  const clearCombatForSleep = (): void => {
    clearCombatState()
  }

  // ==================== 道具使用 ====================

  /** 在战斗/探索中使用道具 */
  const useCombatItem = (itemId: string, quantity: number = 1): { success: boolean; message: string } => {
    if (!inCombat.value && !isExploring.value) return { success: false, message: '不在矿洞中。' }

    const permanentItemResult = usePermanentGuildCombatItem(itemId, quantity)
    if (permanentItemResult) return permanentItemResult

    if (itemId === 'slayer_charm') return useSlayerCharm()

    const combatEffectResult = useCombatEffectItem(itemId)
    if (combatEffectResult) return combatEffectResult

    return useRestorativeCombatItem(itemId)
  }

  /** 在探索中使用怪物诱饵（本层怪物数量翻倍） */
  const useMonsterLure = (): { success: boolean; message: string } => {
    if (!isExploring.value) return { success: false, message: '不在矿洞中。' }
    if (inCombat.value) return { success: false, message: '战斗中无法使用怪物诱饵。' }
    if (!inventoryStore.removeItem('monster_lure')) return { success: false, message: '没有怪物诱饵。' }

    const floor = getActiveFloorData()
    if (!floor) return { success: true, message: '使用了怪物诱饵，但本层无效。' }

    const { monstersAdded } = applyMonsterLureToFloor(floor)
    if (monstersAdded === 0) {
      return { success: true, message: '使用了怪物诱饵，但本层没有空间放置更多怪物。' }
    }

    return { success: true, message: `使用了怪物诱饵！本层增加了${monstersAdded}只怪物。` }
  }

  // ==================== 序列化 ====================

  const serialize = () => {
    return {
      currentFloor: currentFloor.value,
      safePointFloor: safePointFloor.value,
      defeatedBosses: defeatedBosses.value,
      isInSkullCavern: isInSkullCavern.value,
      skullCavernFloor: skullCavernFloor.value,
      skullCavernBestFloor: skullCavernBestFloor.value,
      skullSafePointFloor: skullSafePointFloor.value,
      guildBadgeBonusAttack: guildBadgeBonusAttack.value,
      guildBonusMaxHp: guildBonusMaxHp.value,
      guildBonusDropRate: guildBonusDropRate.value,
      guildBonusDefense: guildBonusDefense.value
    }
  }

  const deserialize = (data: ReturnType<typeof serialize>) => {
    defeatedBosses.value = ((data as Record<string, unknown>).defeatedBosses as string[]) ?? []

    // 检测旧存档（30层系统）并迁移
    const rawSafePoint = ((data as Record<string, unknown>).safePointFloor as number) ?? 0
    const hasSkullCavern = 'isInSkullCavern' in data
    const isOldSave = rawSafePoint <= 30 && !hasSkullCavern

    if (isOldSave) {
      // 旧存档迁移：safePoint × 2（5→10, 10→20, 15→30, ..., 30→60）
      safePointFloor.value = rawSafePoint * 2
      currentFloor.value = safePointFloor.value > 0 ? safePointFloor.value + 1 : 1
    } else {
      safePointFloor.value = rawSafePoint
      currentFloor.value = data.currentFloor ?? 1
    }

    // 骷髅矿穴状态
    isInSkullCavern.value = ((data as Record<string, unknown>).isInSkullCavern as boolean) ?? false
    skullCavernFloor.value = ((data as Record<string, unknown>).skullCavernFloor as number) ?? 0
    skullCavernBestFloor.value = ((data as Record<string, unknown>).skullCavernBestFloor as number) ?? 0
    skullSafePointFloor.value = ((data as Record<string, unknown>).skullSafePointFloor as number) ?? 0

    // 格子与战斗状态不序列化——读档后玩家在矿洞外
    clearTransientExplorationStateForLoad()

    // 公会徽章永久加成
    guildBadgeBonusAttack.value = ((data as Record<string, unknown>).guildBadgeBonusAttack as number) ?? 0
    guildBonusMaxHp.value = ((data as Record<string, unknown>).guildBonusMaxHp as number) ?? 0
    guildBonusDropRate.value = ((data as Record<string, unknown>).guildBonusDropRate as number) ?? 0
    guildBonusDefense.value = ((data as Record<string, unknown>).guildBonusDefense as number) ?? 0
  }

  return {
    currentFloor,
    safePointFloor,
    isExploring,
    isInSkullCavern,
    skullCavernFloor,
    skullCavernBestFloor,
    skullSafePointFloor,
    inCombat,
    combatMonster,
    combatMonsterHp,
    combatRound,
    combatLog,
    combatIsBoss,
    combatMonsterStatuses,
    combatPlayerStatuses,
    defeatedBosses,
    // 格子系统
    floorGrid,
    entryIndex,
    stairsFound,
    stairsUsable,
    totalMonstersOnFloor,
    monstersDefeatedCount,
    // 道具系统
    slayerCharmActive,
    guildBadgeBonusAttack,
    guildBonusMaxHp,
    guildBonusDropRate,
    guildBonusDefense,
    // 方法
    isSkullCavernUnlocked,
    getActiveFloorData,
    getUnlockedSafePoints,
    getUnlockedSkullSafePoints,
    getSweepPreview,
    sweepToNextSafePoint,
    getRemainingCombatTileCount,
    canRevealTile,
    engageRevealedMonster,
    revealTile,
    useBombOnGrid,
    enterMine,
    enterSkullCavern,
    combatAction,
    startChainBattle,
    useCombatItem,
    useMonsterLure,
    goNextFloor,
    leaveMine,
    clearCombatForSleep,
    serialize,
    deserialize
  }
})
