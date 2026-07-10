import { describe, expect, it } from 'vitest'
import {
  COMBAT_ITEM_EFFECTS,
  calculateCritRate,
  calculateCombatDefeatPenalty,
  calculateIncomingDamage,
  calculatePlayerAttack,
  calculateSkullCavernBossReward,
  calculateTreasureGearDropAttempts,
  chooseAutoCombatAction,
  formatChainCombatNextMessage,
  formatChainCombatStartMessage,
  formatCombatEntryStartLine,
  formatCombatDefeatMessage,
  formatInfestedFloorClearMessage,
  formatInfestedFloorRemainingMonstersMessage,
  formatMainMineBossFirstKillWeaponMessage,
  formatMainMineBossGearRewardMessage,
  formatMainMineBossMoneyRewardMessage,
  formatMainMineBossOreRewardMessage,
  getDefendDamageMultiplier,
  getDefenderHealAmount,
  resolveMainMineBossFirstKillReward,
  resolveMainMineBossGearRewards,
  resolveCombatItemDamage,
  resolveCounterattackDecision,
  resolveTreasureGearDropDecisions,
  resolveTreasureGearDropRoll,
  resolveTreasureGearDropDecision,
  resolvePlayerStrike
} from '@/domain/mining/combat'
import type { EnchantmentDef } from '@/types'

const enchant = (overrides: Partial<EnchantmentDef>): EnchantmentDef => ({
  id: 'test',
  name: '测试附魔',
  description: '测试',
  attackBonus: 0,
  critBonus: 0,
  special: null,
  ...overrides
})

describe('mining combat calculations', () => {
  it('chooses forced auto-combat actions before smart thresholds', () => {
    const baseInput = {
      monsterAttack: 999,
      playerHp: 1,
      playerMaxHp: 100,
      monsterHp: 999,
      playerAttack: 1
    }

    expect(chooseAutoCombatAction({ ...baseInput, mode: 'attack' })).toBe('attack')
    expect(chooseAutoCombatAction({ ...baseInput, mode: 'defend' })).toBe('defend')
  })

  it('uses the existing smart auto-combat danger threshold', () => {
    expect(
      chooseAutoCombatAction({
        mode: 'smart',
        monsterAttack: 20,
        playerHp: 44,
        playerMaxHp: 100,
        monsterHp: 200,
        playerAttack: 30
      })
    ).toBe('defend')

    expect(
      chooseAutoCombatAction({
        mode: 'smart',
        monsterAttack: 10,
        playerHp: 36,
        playerMaxHp: 100,
        monsterHp: 36,
        playerAttack: 30
      })
    ).toBe('attack')
  })

  it('combines weapon, level, ring, guild, and status attack bonuses', () => {
    expect(
      calculatePlayerAttack({
        weaponAttack: 12,
        combatLevel: 6,
        allSkillsBuff: 2,
        ringAttackBonus: 3,
        guildBadgeBonusAttack: 9,
        guildAttackBonus: 4,
        battleRagePower: 20
      })
    ).toBe(64)
  })

  it('applies every incoming damage reduction source and floors at one damage', () => {
    expect(
      calculateIncomingDamage({
        baseDamage: 100,
        defendMultiplier: 0.4,
        defenseReduction: 0.2,
        hasSturdyEnchantment: true,
        ringDefenseBonus: 0.1,
        guildBonusDefense: 0.05,
        ironSkinReduction: 0.25
      })
    ).toBe(17)

    expect(
      calculateIncomingDamage({
        baseDamage: 1,
        defenseReduction: 0.9,
        hasSturdyEnchantment: true,
        ringDefenseBonus: 0.9,
        guildBonusDefense: 0.9,
        ironSkinReduction: 0.9
      })
    ).toBe(1)
  })

  it('calculates crit chance from weapon, ring crit, and ring luck', () => {
    expect(calculateCritRate({ weaponCritRate: 0.05, ringCritBonus: 0.1, ringLuck: 0.4 })).toBeCloseTo(0.35)
  })

  it('resolves crit, dagger extra hit, status rolls, and vampiric healing in existing order', () => {
    const rolls = [0.1, 0.1, 0.1, 0.99]
    const result = resolvePlayerStrike({
      baseAttack: 30,
      monsterDefense: 10,
      weaponType: 'dagger',
      brute: true,
      critRate: 0.5,
      ringVampiric: 0.05,
      enchantments: [
        enchant({ id: 'vampiric', special: 'vampiric' }),
        enchant({ id: 'venom', special: 'poison' })
      ],
      random: () => rolls.shift() ?? 0.99
    })

    expect(result).toEqual({
      isCrit: true,
      damageToMonster: 37,
      extraDamage: 18,
      totalDamage: 55,
      isStunned: false,
      healAmount: 11,
      appliedStatusEnchantments: [enchant({ id: 'venom', special: 'poison' })]
    })
  })

  it('uses club stun rolls without dagger extra damage', () => {
    const rolls = [0.9, 0.1]
    const result = resolvePlayerStrike({
      baseAttack: 11,
      monsterDefense: 20,
      weaponType: 'club',
      brute: false,
      critRate: 0.5,
      ringVampiric: 0,
      enchantments: [],
      random: () => rolls.shift() ?? 0.99
    })

    expect(result.damageToMonster).toBe(1)
    expect(result.extraDamage).toBe(0)
    expect(result.isStunned).toBe(true)
  })

  it('resolves combat item damage with defense when the item does not ignore defense', () => {
    const effect = COMBAT_ITEM_EFFECTS.poison_arrow
    if (!effect || effect.kind !== 'damage') throw new Error('poison_arrow should be a damage item')

    expect(resolveCombatItemDamage({ effect, monsterHp: 80, monsterDefense: 7 })).toEqual({
      damage: 18,
      status: 'poison',
      turns: 4,
      power: 0.05,
      ignoresDefense: false
    })
  })

  it('resolves combat item percent damage and default status fields', () => {
    const effect = COMBAT_ITEM_EFFECTS.nuclear_bomb
    if (!effect || effect.kind !== 'damage') throw new Error('nuclear_bomb should be a damage item')

    expect(resolveCombatItemDamage({ effect, monsterHp: 1000, monsterDefense: 999 })).toEqual({
      damage: 950,
      status: 'radiation',
      turns: null,
      power: 0.08,
      ignoresDefense: true
    })

    expect(resolveCombatItemDamage({ effect: { kind: 'damage', flat: 2, status: 'burn' }, monsterHp: 10, monsterDefense: 5 })).toEqual({
      damage: 1,
      status: 'burn',
      turns: 3,
      power: 0.05,
      ignoresDefense: false
    })
  })

  it('resolves defend turn perk values', () => {
    expect(getDefendDamageMultiplier(false)).toBe(0.4)
    expect(getDefendDamageMultiplier(true)).toBe(0.3)
    expect(getDefenderHealAmount(false)).toBe(0)
    expect(getDefenderHealAmount(true)).toBe(5)
  })

  it('blocks counterattack by stun, freeze, then acrobat dodge', () => {
    expect(resolveCounterattackDecision({ isStunned: true, isFrozen: true, hasAcrobatPerk: true, random: () => 0 })).toEqual({
      canCounterattack: false,
      blockReason: 'stunned'
    })
    expect(resolveCounterattackDecision({ isStunned: false, isFrozen: true, hasAcrobatPerk: true, random: () => 0 })).toEqual({
      canCounterattack: false,
      blockReason: 'frozen'
    })
    expect(resolveCounterattackDecision({ isStunned: false, isFrozen: false, hasAcrobatPerk: true, random: () => 0.1 })).toEqual({
      canCounterattack: false,
      blockReason: 'acrobat'
    })
    expect(resolveCounterattackDecision({ isStunned: false, isFrozen: false, hasAcrobatPerk: true, random: () => 0.9 })).toEqual({
      canCounterattack: true,
      blockReason: null
    })
  })

  it('calculates skull cavern boss scaled money and ore rewards', () => {
    expect(calculateSkullCavernBossReward(1)).toEqual({ moneyReward: 220, bonusOreCount: 3 })
    expect(calculateSkullCavernBossReward(25)).toEqual({ moneyReward: 700, bonusOreCount: 4 })
    expect(calculateSkullCavernBossReward(120)).toEqual({ moneyReward: 2600, bonusOreCount: 7 })
  })

  it('calculates combat defeat penalties from loot, inventory, and money caps', () => {
    expect(
      calculateCombatDefeatPenalty({
        sessionLootCount: 5,
        availableInventoryItemCount: 10,
        money: 300000,
        moneyPenaltyRate: 0.1,
        moneyPenaltyCap: 15000,
        maxItemLoss: 3
      })
    ).toEqual({ sessionLootLossCount: 3, inventoryDropCount: 3, moneyLost: 15000 })

    expect(
      calculateCombatDefeatPenalty({
        sessionLootCount: 0,
        availableInventoryItemCount: 1,
        money: 99,
        moneyPenaltyRate: 0.1,
        moneyPenaltyCap: 15000,
        maxItemLoss: 3
      })
    ).toEqual({ sessionLootLossCount: 0, inventoryDropCount: 1, moneyLost: 9 })
  })

  it('formats combat defeat messages for mine and skull cavern losses', () => {
    expect(formatCombatDefeatMessage({ wasInSkullCavern: false, droppedItemCount: 0, moneyLost: 0 })).toBe(
      '你在矿洞中倒下了……丢失了一半战利品，被送回入口。'
    )
    expect(formatCombatDefeatMessage({ wasInSkullCavern: true, droppedItemCount: 2, moneyLost: 500 })).toBe(
      '你在骷髅矿穴中倒下了……丢失了一半战利品和2件背包物品及500文，被送回入口。'
    )
  })

  it('formats main mine boss reward messages', () => {
    expect(formatMainMineBossFirstKillWeaponMessage('桃源剑')).toBe(' 首次击败BOSS！获得了传说武器：桃源剑！')
    expect(formatMainMineBossGearRewardMessage('ring', '矿工戒指')).toBe(' 获得了戒指：矿工戒指！')
    expect(formatMainMineBossGearRewardMessage('hat', '矿工帽')).toBe(' 获得了帽子：矿工帽！')
    expect(formatMainMineBossGearRewardMessage('shoe', '矿工靴')).toBe(' 获得了鞋子：矿工靴！')
    expect(formatMainMineBossMoneyRewardMessage(5000)).toBe(' 获得5000文！')
    expect(formatMainMineBossMoneyRewardMessage(0)).toBe('')
    expect(formatMainMineBossOreRewardMessage('铱矿石×3')).toBe(' 获得了铱矿石×3！')
    expect(formatMainMineBossOreRewardMessage('')).toBe('')
  })

  it('resolves main mine boss first-kill rewards without mutating defeated bosses', () => {
    expect(
      resolveMainMineBossFirstKillReward({
        bossId: 'slime_king',
        defeatedBossIds: [],
        weaponId: 'slime_sword'
      })
    ).toEqual({ bossId: 'slime_king', weaponId: 'slime_sword' })

    expect(
      resolveMainMineBossFirstKillReward({
        bossId: 'shadow_lord',
        defeatedBossIds: [],
        weaponId: undefined
      })
    ).toEqual({ bossId: 'shadow_lord', weaponId: null })

    expect(
      resolveMainMineBossFirstKillReward({
        bossId: 'slime_king',
        defeatedBossIds: ['slime_king'],
        weaponId: 'slime_sword'
      })
    ).toBeNull()
  })

  it('resolves main mine boss gear rewards in ring, hat, then shoe order', () => {
    expect(
      resolveMainMineBossGearRewards({
        rewardIds: {
          ringId: 'miner_ring',
          hatId: 'miner_hat',
          shoeId: 'miner_boots'
        },
        ownership: {
          hasRing: false,
          hasHat: true,
          hasShoe: false
        }
      })
    ).toEqual([
      { gearType: 'ring', gearId: 'miner_ring' },
      { gearType: 'shoe', gearId: 'miner_boots' }
    ])

    expect(
      resolveMainMineBossGearRewards({
        rewardIds: {
          ringId: undefined,
          hatId: 'miner_hat',
          shoeId: undefined
        },
        ownership: {
          hasRing: false,
          hasHat: true,
          hasShoe: false
        }
      })
    ).toEqual([])
  })

  it('formats infested floor clear and remaining monster messages', () => {
    expect(formatInfestedFloorClearMessage('史莱姆泥×3、铜矿石×2', 120)).toBe(
      ' 感染层清除完毕！获得史莱姆泥×3、铜矿石×2和120文！'
    )
    expect(formatInfestedFloorRemainingMonstersMessage(4)).toBe(' 还剩4只怪物！')
  })

  it('formats chain combat start, entry, and next-battle messages', () => {
    expect(formatCombatEntryStartLine('岩石蟹', 80, false)).toBe('连战：岩石蟹出现！（HP: 80）')
    expect(formatCombatEntryStartLine('史莱姆王', 300, true)).toBe('BOSS战：史莱姆王出现！（HP: 300）')
    expect(formatChainCombatStartMessage(5)).toBe('连战开始，本层共有5个敌人。')
    expect(formatChainCombatNextMessage('岩石蟹被击败了！', '暗影怪')).toBe('岩石蟹被击败了！ 下一战：暗影怪。')
  })

  it('calculates treasure gear drop attempts with treasure-find bonus before rolling quantity', () => {
    const seenChances: number[] = []
    const attempts = calculateTreasureGearDropAttempts(0.25, 0.4, chance => {
      seenChances.push(chance)
      return 2
    })

    expect(attempts).toBe(2)
    expect(seenChances).toEqual([0.35])
  })

  it('resolves treasure gear drops as grants or automatic sales', () => {
    expect(
      resolveTreasureGearDropDecision({
        gearId: 'ancient_ring',
        alreadyOwned: false,
        sellPrice: 800
      })
    ).toEqual({ action: 'grant', gearId: 'ancient_ring' })

    expect(
      resolveTreasureGearDropDecision({
        gearId: 'ancient_ring',
        alreadyOwned: true,
        sellPrice: 800
      })
    ).toEqual({ action: 'autoSell', money: 800 })
  })

  it('resolves repeated treasure gear drop decisions in attempt order', () => {
    const ownershipByAttempt = [false, true, false]
    expect(
      resolveTreasureGearDropDecisions({
        attempts: ownershipByAttempt.length,
        createDecisionInput: attemptIndex => ({
          gearId: `ancient_ring_${attemptIndex}`,
          alreadyOwned: ownershipByAttempt[attemptIndex] ?? false,
          sellPrice: 100 + attemptIndex
        })
      })
    ).toEqual([
      { action: 'grant', gearId: 'ancient_ring_0' },
      { action: 'autoSell', money: 101 },
      { action: 'grant', gearId: 'ancient_ring_2' }
    ])
  })

  it('returns no treasure gear drop decisions when attempts are zero', () => {
    expect(
      resolveTreasureGearDropDecisions({
        attempts: 0,
        createDecisionInput: () => ({
          gearId: 'ancient_ring',
          alreadyOwned: false,
          sellPrice: 800
        })
      })
    ).toEqual([])
  })

  it('rolls treasure gear drop attempts and resolves decisions together', () => {
    const seenChances: number[] = []
    expect(
      resolveTreasureGearDropRoll({
        baseChance: 0.2,
        treasureFindBonus: 0.5,
        rollQuantity: chance => {
          seenChances.push(chance)
          return 2
        },
        createDecisionInput: attemptIndex => ({
          gearId: `ancient_hat_${attemptIndex}`,
          alreadyOwned: attemptIndex === 1,
          sellPrice: 900
        })
      })
    ).toEqual({
      attempts: 2,
      decisions: [
        { action: 'grant', gearId: 'ancient_hat_0' },
        { action: 'autoSell', money: 900 }
      ]
    })
    expect(seenChances[0]).toBeCloseTo(0.3)
  })
})
