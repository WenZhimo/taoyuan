import { describe, expect, it } from 'vitest'
import {
  calculateMineRevealStaminaCost,
  calculateOreTileQuantity,
  canRevealMineTile,
  formatChainAutoExploreSummary,
  formatTreasureTileMessage,
  getChainAutoExploreTileState,
  getBossTileCombatStartText,
  getMonsterTileCombatStartText,
  getRevealedMonsterCombatStartText,
  revealEmptyMineTile,
  revealFallbackMineTile,
  revealMushroomMineTile,
  revealOreMineTile,
  revealStairsMineTile,
  revealTrapMineTile,
  shouldSkipChainAutoExploreTile,
  shouldUnlockStairsAfterChainAutoExplore
} from '@/domain/mining/tileReveal'
import type { MineTile } from '@/types'

const tile = (index: number, state: MineTile['state']): MineTile => ({
  index,
  type: 'empty',
  state
})

describe('mining tile reveal rules', () => {
  it('identifies tiles already settled by chain auto explore', () => {
    expect(shouldSkipChainAutoExploreTile(tile(1, 'defeated'))).toBe(true)
    expect(shouldSkipChainAutoExploreTile(tile(2, 'collected'))).toBe(true)
    expect(shouldSkipChainAutoExploreTile(tile(3, 'triggered'))).toBe(true)
    expect(shouldSkipChainAutoExploreTile(tile(4, 'hidden'))).toBe(false)
    expect(shouldSkipChainAutoExploreTile(tile(5, 'revealed'))).toBe(false)
  })

  it('maps chain auto explored tile types to existing final states', () => {
    expect(getChainAutoExploreTileState('empty')).toBe('revealed')
    expect(getChainAutoExploreTileState('stairs')).toBe('revealed')
    expect(getChainAutoExploreTileState('monster')).toBe('revealed')
    expect(getChainAutoExploreTileState('boss')).toBe('revealed')
    expect(getChainAutoExploreTileState('ore')).toBe('collected')
    expect(getChainAutoExploreTileState('treasure')).toBe('collected')
    expect(getChainAutoExploreTileState('mushroom')).toBe('collected')
    expect(getChainAutoExploreTileState('trap')).toBe('triggered')
  })

  it('unlocks stairs after chain auto explore only when all monsters are defeated', () => {
    expect(shouldUnlockStairsAfterChainAutoExplore(3, 3)).toBe(true)
    expect(shouldUnlockStairsAfterChainAutoExplore(4, 3)).toBe(true)
    expect(shouldUnlockStairsAfterChainAutoExplore(2, 3)).toBe(false)
    expect(shouldUnlockStairsAfterChainAutoExplore(0, 0)).toBe(false)
  })

  it('allows hidden tiles adjacent to any already explored tile', () => {
    const tiles = [tile(0, 'revealed'), tile(1, 'hidden'), tile(2, 'hidden')]

    expect(canRevealMineTile(tiles, 1, [0, 2])).toBe(true)
    expect(canRevealMineTile(tiles, 2, [1])).toBe(false)
  })

  it('blocks missing or non-hidden target tiles', () => {
    const tiles = [tile(0, 'revealed'), tile(1, 'collected')]

    expect(canRevealMineTile(tiles, 3, [0])).toBe(false)
    expect(canRevealMineTile(tiles, 1, [0])).toBe(false)
  })

  it('calculates reveal stamina cost from all reduction sources and floors at one', () => {
    expect(
      calculateMineRevealStaminaCost({
        pickaxeMultiplier: 1.5,
        skillReduction: 0.1,
        miningBuff: 0.2,
        walletMiningReduction: 0.05,
        ringMiningReduction: 0.1,
        ringGlobalReduction: 0.05,
        spiritMiningReduction: 0.15
      })
    ).toBe(1)

    expect(
      calculateMineRevealStaminaCost({
        pickaxeMultiplier: 3,
        skillReduction: 0,
        miningBuff: 0,
        walletMiningReduction: 0,
        ringMiningReduction: 0,
        ringGlobalReduction: 0,
        spiritMiningReduction: 0
      })
    ).toBe(6)
  })

  it('reveals empty and fallback tiles with existing messages', () => {
    const emptyTile = tile(0, 'hidden')
    const fallbackTile = { ...tile(1, 'hidden'), type: 'stairs' as const }

    expect(revealEmptyMineTile(emptyTile, 2)).toEqual({
      success: true,
      message: '探索了一个空区域。(-2体力)',
      startsCombat: false
    })
    expect(emptyTile.state).toBe('revealed')

    expect(revealFallbackMineTile(fallbackTile)).toEqual({
      success: true,
      message: '空无一物。',
      startsCombat: false
    })
    expect(fallbackTile.state).toBe('revealed')
  })

  it('calculates ore tile quantity in the existing bonus order', () => {
    expect(
      calculateOreTileQuantity({
        baseQuantity: 2,
        minerBonusTriggered: true,
        hilltopBonusTriggered: true,
        prospectorBonusTriggered: true,
        ringOreBonus: 1.9,
        hiddenNpcOreBonusTriggered: true
      })
    ).toBe(10)

    expect(
      calculateOreTileQuantity({
        baseQuantity: 1,
        minerBonusTriggered: false,
        hilltopBonusTriggered: false,
        prospectorBonusTriggered: false,
        ringOreBonus: 0,
        hiddenNpcOreBonusTriggered: false
      })
    ).toBe(1)
  })

  it('reveals ore tiles with existing collected state and message', () => {
    const oreTile = { ...tile(3, 'hidden'), type: 'ore' as const }

    expect(revealOreMineTile(oreTile, 7, 2)).toEqual({
      success: true,
      message: '挖到了7个矿石！(-2体力)',
      startsCombat: false
    })
    expect(oreTile.state).toBe('collected')
  })

  it('reveals trap tiles with existing survival and defeat messages', () => {
    const trapTile = { ...tile(4, 'hidden'), type: 'trap' as const }
    const defeatTrapTile = { ...tile(5, 'hidden'), type: 'trap' as const }

    expect(revealTrapMineTile(trapTile, 12, 2)).toEqual({
      success: true,
      message: '踩中了陷阱！受到12点伤害。(-2体力)',
      startsCombat: false
    })
    expect(trapTile.state).toBe('triggered')

    expect(revealTrapMineTile(defeatTrapTile, 99, 3, '你晕倒了。')).toEqual({
      success: true,
      message: '踩中了陷阱！受到99点伤害。你晕倒了。',
      startsCombat: false
    })
    expect(defeatTrapTile.state).toBe('triggered')
  })

  it('reveals mushroom tiles with existing collected state and message', () => {
    const mushroomTile = { ...tile(6, 'hidden'), type: 'mushroom' as const }

    expect(revealMushroomMineTile(mushroomTile, '红蘑菇×2', 1)).toEqual({
      success: true,
      message: '采集到了红蘑菇×2！(+3采集经验, -1体力)',
      startsCombat: false
    })
    expect(mushroomTile.state).toBe('collected')
  })

  it('reveals stairs tiles with usable, infested, and boss messages', () => {
    const openStairs = { ...tile(7, 'hidden'), type: 'stairs' as const }
    const infestedStairs = { ...tile(8, 'hidden'), type: 'stairs' as const }
    const bossStairs = { ...tile(9, 'hidden'), type: 'stairs' as const }

    expect(revealStairsMineTile(openStairs, { staminaCost: 1, blockReason: null, remainingMonsters: 0 })).toEqual({
      success: true,
      message: '发现了楼梯！可以前往下一层。(-1体力)',
      startsCombat: false
    })
    expect(openStairs.state).toBe('revealed')

    expect(revealStairsMineTile(infestedStairs, { staminaCost: 2, blockReason: 'infested', remainingMonsters: 3 })).toEqual({
      success: true,
      message: '发现了楼梯！但需要先清除剩余3只怪物才能前进。(-2体力)',
      startsCombat: false
    })
    expect(infestedStairs.state).toBe('revealed')

    expect(revealStairsMineTile(bossStairs, { staminaCost: 2, blockReason: 'boss', remainingMonsters: 0 })).toEqual({
      success: true,
      message: '发现了楼梯！但需要先击败BOSS才能前进。(-2体力)',
      startsCombat: false
    })
    expect(bossStairs.state).toBe('revealed')
  })

  it('formats monster and boss combat start text without store side effects', () => {
    expect(getMonsterTileCombatStartText('岩石史莱姆', 30, 2)).toEqual({
      combatLogMessage: '遭遇了岩石史莱姆！(HP: 30)  (-2体力)',
      revealResult: { success: true, message: '遭遇了岩石史莱姆！', startsCombat: true }
    })

    expect(getBossTileCombatStartText('矿洞之主', 500, 3, false)).toEqual({
      combatLogMessage: 'BOSS战！遭遇了矿洞之主！(HP: 500)（弱化版）  (-3体力)',
      revealResult: { success: true, message: 'BOSS层！矿洞之主挡住了去路！', startsCombat: true }
    })
  })

  it('formats revealed monster re-engage text for normal and boss tiles', () => {
    expect(getRevealedMonsterCombatStartText('蝙蝠', 25, false, true)).toEqual({
      combatLogMessage: '再次遭遇蝙蝠！(HP: 25)',
      revealResult: { success: true, message: '与蝙蝠交战！', startsCombat: true }
    })

    expect(getRevealedMonsterCombatStartText('矿洞之主', 500, true, false)).toEqual({
      combatLogMessage: 'BOSS战！再次挑战矿洞之主！(HP: 500)（弱化版）',
      revealResult: { success: true, message: '与矿洞之主交战！', startsCombat: true }
    })
  })

  it('formats chain auto explore rewards in the existing display order', () => {
    expect(
      formatChainAutoExploreSummary({
        oreCount: 12,
        treasureCount: 2,
        treasureGearCount: 3,
        mushroomCount: 4,
        money: 500,
        treasureAutoSoldMoney: 1200
      })
    ).toBe('连战胜利后自动探索了本层，获得矿石×12、宝箱×2、装备×3、蘑菇×4、500文、重复装备售出1200文。')
  })

  it('formats chain auto explore with no rewards', () => {
    expect(
      formatChainAutoExploreSummary({
        oreCount: 0,
        treasureCount: 0,
        treasureGearCount: 0,
        mushroomCount: 0,
        money: 0,
        treasureAutoSoldMoney: 0
      })
    ).toBe('连战胜利后自动探索了本层。')
  })

  it('formats treasure tile messages with rewards, money, and auto-sold gear', () => {
    expect(
      formatTreasureTileMessage({
        rewardNames: '铜矿石×2',
        rewardCount: 1,
        money: 300,
        autoSoldMoney: 500,
        staminaCost: 2
      })
    ).toBe('发现宝箱！获得了铜矿石×2和300文（重复装备自动售出+500文）！(-2体力)')
  })

  it('formats treasure tile messages when there are no item rewards', () => {
    expect(
      formatTreasureTileMessage({
        rewardNames: '',
        rewardCount: 0,
        money: 120,
        autoSoldMoney: 0,
        staminaCost: 1
      })
    ).toBe('发现宝箱！获得了120文！(-1体力)')

    expect(
      formatTreasureTileMessage({
        rewardNames: '',
        rewardCount: 0,
        money: 0,
        autoSoldMoney: 0,
        staminaCost: 1
      })
    ).toBe('发现宝箱！！(-1体力)')
  })
})
