import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMiningStore } from '@/stores/useMiningStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSkillStore } from '@/stores/useSkillStore'
import * as officialContentBootstrap from '@/domain/mods/officialContentBootstrap'

describe('mining store sleep and save boundaries', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('clears combat state for sleeping bag rest without leaving the mine', () => {
    const miningStore = useMiningStore()

    miningStore.isExploring = true
    miningStore.currentFloor = 12
    miningStore.slayerCharmActive = true
    miningStore.inCombat = true
    miningStore.combatMonster = {
      id: 'test_slime',
      name: '测试史莱姆',
      hp: 30,
      attack: 5,
      defense: 1,
      drops: [],
      expReward: 1,
      description: '测试怪物'
    }
    miningStore.combatMonsterHp = 12
    miningStore.combatRound = 3
    miningStore.combatLog = ['遭遇了测试史莱姆！']
    miningStore.combatPlayerStatuses = [{ type: 'poison', name: '中毒', power: 1, remainingTurns: 2, source: 'monster' }]
    miningStore.combatMonsterStatuses = [{ type: 'burn', name: '灼烧', power: 1, remainingTurns: 2, source: 'player' }]

    miningStore.clearCombatForSleep()

    expect(miningStore.isExploring).toBe(true)
    expect(miningStore.currentFloor).toBe(12)
    expect(miningStore.slayerCharmActive).toBe(true)
    expect(miningStore.inCombat).toBe(false)
    expect(miningStore.combatMonster).toBeNull()
    expect(miningStore.combatMonsterHp).toBe(0)
    expect(miningStore.combatRound).toBe(0)
    expect(miningStore.combatLog).toEqual([])
    expect(miningStore.combatPlayerStatuses).toEqual([])
    expect(miningStore.combatMonsterStatuses).toEqual([])
  })

  it('leaveMine clears exploration, combat, floor grid, and skull cavern mode', () => {
    const miningStore = useMiningStore()

    miningStore.isExploring = true
    miningStore.isInSkullCavern = true
    miningStore.skullCavernFloor = 7
    miningStore.inCombat = true
    miningStore.combatMonster = {
      id: 'test_slime',
      name: '测试史莱姆',
      hp: 30,
      attack: 5,
      defense: 1,
      drops: [],
      expReward: 1,
      description: '测试怪物'
    }
    miningStore.combatMonsterHp = 10
    miningStore.combatRound = 2
    miningStore.combatLog = ['战斗中']
    miningStore.floorGrid = [{ index: 0, type: 'empty', state: 'revealed' }]
    miningStore.combatPlayerStatuses = [{ type: 'poison', name: '中毒', power: 1, remainingTurns: 1, source: 'monster' }]
    miningStore.combatMonsterStatuses = [{ type: 'burn', name: '灼烧', power: 1, remainingTurns: 1, source: 'player' }]

    const message = miningStore.leaveMine()

    expect(message).toBe('你离开了骷髅矿穴。')
    expect(miningStore.isExploring).toBe(false)
    expect(miningStore.isInSkullCavern).toBe(false)
    expect(miningStore.inCombat).toBe(false)
    expect(miningStore.combatMonster).toBeNull()
    expect(miningStore.combatMonsterHp).toBe(0)
    expect(miningStore.combatRound).toBe(0)
    expect(miningStore.combatLog).toEqual([])
    expect(miningStore.floorGrid).toEqual([])
    expect(miningStore.combatPlayerStatuses).toEqual([])
    expect(miningStore.combatMonsterStatuses).toEqual([])
  })

  it('deserialize migrates old 30-floor safe points and leaves exploration state outside the mine', () => {
    const miningStore = useMiningStore()

    miningStore.isExploring = true
    miningStore.inCombat = true
    miningStore.combatMonster = {
      id: 'stale_monster',
      name: '残留怪物',
      hp: 10,
      attack: 1,
      defense: 0,
      drops: [],
      expReward: 1,
      description: '读档前残留的战斗怪物'
    }
    miningStore.combatMonsterHp = 5
    miningStore.combatRound = 2
    miningStore.combatLog = ['残留战斗日志']
    miningStore.combatIsBoss = true
    miningStore.slayerCharmActive = true
    miningStore.combatPlayerStatuses = [{ type: 'poison', name: '中毒', power: 1, remainingTurns: 2, source: 'monster' }]
    miningStore.combatMonsterStatuses = [{ type: 'burn', name: '灼烧', power: 1, remainingTurns: 2, source: 'player' }]
    miningStore.floorGrid = [{ index: 0, type: 'ore', state: 'hidden', data: { oreId: 'stone', oreQuantity: 1 } }]
    miningStore.deserialize({
      currentFloor: 16,
      safePointFloor: 15,
      defeatedBosses: ['boss_1'],
      skullCavernFloor: 0,
      skullCavernBestFloor: 0,
      skullSafePointFloor: 0,
      guildBadgeBonusAttack: 0,
      guildBonusMaxHp: 0,
      guildBonusDropRate: 0,
      guildBonusDefense: 0
    } as ReturnType<typeof miningStore.serialize>)

    expect(miningStore.safePointFloor).toBe(30)
    expect(miningStore.currentFloor).toBe(31)
    expect(miningStore.defeatedBosses).toEqual(['boss_1'])
    expect(miningStore.isExploring).toBe(false)
    expect(miningStore.inCombat).toBe(false)
    expect(miningStore.combatMonster).toBeNull()
    expect(miningStore.combatMonsterHp).toBe(0)
    expect(miningStore.combatRound).toBe(0)
    expect(miningStore.combatLog).toEqual([])
    expect(miningStore.combatIsBoss).toBe(false)
    expect(miningStore.slayerCharmActive).toBe(false)
    expect(miningStore.combatPlayerStatuses).toEqual([])
    expect(miningStore.combatMonsterStatuses).toEqual([])
    expect(miningStore.floorGrid).toEqual([])
  })

  it('deserialize preserves modern skull cavern fields', () => {
    const miningStore = useMiningStore()

    miningStore.deserialize({
      currentFloor: 42,
      safePointFloor: 40,
      defeatedBosses: [],
      isInSkullCavern: true,
      skullCavernFloor: 18,
      skullCavernBestFloor: 21,
      skullSafePointFloor: 10,
      guildBadgeBonusAttack: 2,
      guildBonusMaxHp: 30,
      guildBonusDropRate: 0.5,
      guildBonusDefense: 3
    })

    expect(miningStore.currentFloor).toBe(42)
    expect(miningStore.safePointFloor).toBe(40)
    expect(miningStore.isInSkullCavern).toBe(true)
    expect(miningStore.skullCavernFloor).toBe(18)
    expect(miningStore.skullCavernBestFloor).toBe(21)
    expect(miningStore.skullSafePointFloor).toBe(10)
    expect(miningStore.guildBadgeBonusAttack).toBe(2)
    expect(miningStore.guildBonusMaxHp).toBe(30)
    expect(miningStore.guildBonusDropRate).toBe(0.5)
    expect(miningStore.guildBonusDefense).toBe(3)
  })

  it('enters normal mine from selected safe point and resets transient combat statuses', () => {
    const miningStore = useMiningStore()

    miningStore.combatPlayerStatuses = [{ type: 'poison', name: '中毒', power: 1, remainingTurns: 2, source: 'monster' }]
    miningStore.combatMonsterStatuses = [{ type: 'burn', name: '灼烧', power: 1, remainingTurns: 2, source: 'player' }]

    const message = miningStore.enterMine(10)

    expect(message).toBe('进入云隐矿洞，当前第11层。')
    expect(miningStore.isExploring).toBe(true)
    expect(miningStore.isInSkullCavern).toBe(false)
    expect(miningStore.currentFloor).toBe(11)
    expect(miningStore.floorGrid.length).toBeGreaterThan(0)
    expect(miningStore.combatPlayerStatuses).toEqual([])
    expect(miningStore.combatMonsterStatuses).toEqual([])
  })

  it('enters skull cavern only after unlock and resets transient combat statuses', () => {
    const miningStore = useMiningStore()

    expect(miningStore.enterSkullCavern()).toBe('需要先击败60层BOSS才能进入骷髅矿穴。')

    miningStore.defeatedBosses = ['lava_lord']
    miningStore.combatPlayerStatuses = [{ type: 'poison', name: '中毒', power: 1, remainingTurns: 2, source: 'monster' }]
    miningStore.combatMonsterStatuses = [{ type: 'burn', name: '灼烧', power: 1, remainingTurns: 2, source: 'player' }]

    const message = miningStore.enterSkullCavern(20)

    expect(message).toBe('进入骷髅矿穴，当前第21层。')
    expect(miningStore.isExploring).toBe(true)
    expect(miningStore.isInSkullCavern).toBe(true)
    expect(miningStore.skullCavernFloor).toBe(21)
    expect(miningStore.floorGrid.length).toBeGreaterThan(0)
    expect(miningStore.combatPlayerStatuses).toEqual([])
    expect(miningStore.combatMonsterStatuses).toEqual([])
  })

  it('reveals treasure gear drops and auto-sells duplicate collection gear', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    inventoryStore.addRing('quartz_ring')
    vi.spyOn(Math, 'random').mockReturnValue(0)

    miningStore.isExploring = true
    miningStore.currentFloor = 1
    miningStore.floorGrid = [
      { index: 0, type: 'empty', state: 'revealed' },
      {
        index: 1,
        type: 'treasure',
        state: 'hidden',
        data: {
          treasureItems: [{ itemId: 'wood', quantity: 2 }],
          treasureMoney: 50
        }
      }
    ]

    const result = miningStore.revealTile(1)

    expect(result.success).toBe(true)
    expect(result.startsCombat).toBe(false)
    expect(result.message).toContain('木材×2')
    expect(result.message).toContain('淘金帽')
    expect(result.message).toContain('幸运长靴')
    expect(result.message).toContain('重复装备自动售出+120文')
    expect(miningStore.floorGrid[1]?.state).toBe('collected')
    expect(inventoryStore.getItemCount('wood')).toBe(2)
    expect(inventoryStore.ownedRings.filter(ring => ring.defId === 'quartz_ring')).toHaveLength(1)
    expect(inventoryStore.ownedHats.some(hat => hat.defId === 'treasure_cap')).toBe(true)
    expect(inventoryStore.ownedShoes.some(shoe => shoe.defId === 'lucky_boots')).toBe(true)
    expect(playerStore.money).toBe(670)
    expect(playerStore.stamina).toBe(118)
  })

  it('fails before mine, inventory, or player state changes when treasure registries are unavailable', () => {
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    const inventoryBefore = inventoryStore.serialize()
    const playerBefore = playerStore.serialize()
    const unavailable = new Error('official registry unavailable')
    vi.spyOn(officialContentBootstrap, 'getOfficialRegistrySet').mockImplementation(() => {
      throw unavailable
    })

    expect(() => useMiningStore()).toThrow(unavailable)
    expect(inventoryStore.serialize()).toEqual(inventoryBefore)
    expect(playerStore.serialize()).toEqual(playerBefore)
  })

  it('applies treasure gear drops during chain auto exploration cleanup', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    inventoryStore.addRing('quartz_ring')
    vi.spyOn(Math, 'random').mockReturnValue(0)

    miningStore.isExploring = true
    miningStore.currentFloor = 1
    miningStore.totalMonstersOnFloor = 1
    miningStore.floorGrid = [
      {
        index: 0,
        type: 'monster',
        state: 'revealed',
        data: {
          monster: {
            id: 'test_slime',
            name: '测试史莱姆',
            hp: 1,
            attack: 0,
            defense: 0,
            drops: [],
            expReward: 1,
            description: '测试怪物'
          }
        }
      },
      {
        index: 1,
        type: 'treasure',
        state: 'hidden',
        data: {
          treasureItems: [{ itemId: 'wood', quantity: 3 }],
          treasureMoney: 80
        }
      }
    ]

    const start = miningStore.startChainBattle()
    const result = miningStore.combatAction('attack')

    expect(start.success).toBe(true)
    expect(result.combatOver).toBe(true)
    expect(result.won).toBe(true)
    expect(result.message).toContain('连战胜利后自动探索了本层')
    expect(result.message).toContain('宝箱×1')
    expect(result.message).toContain('装备×2')
    expect(result.message).toContain('80文')
    expect(result.message).toContain('重复装备售出120文')
    expect(miningStore.floorGrid[0]?.state).toBe('defeated')
    expect(miningStore.floorGrid[1]?.state).toBe('collected')
    expect(inventoryStore.getItemCount('wood')).toBe(3)
    expect(inventoryStore.ownedRings.filter(ring => ring.defId === 'quartz_ring')).toHaveLength(1)
    expect(inventoryStore.ownedHats.some(hat => hat.defId === 'treasure_cap')).toBe(true)
    expect(inventoryStore.ownedShoes.some(shoe => shoe.defId === 'lucky_boots')).toBe(true)
    expect(playerStore.money).toBe(700)
  })

  it('applies monster gear drops and auto-sells duplicate monster gear', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    inventoryStore.addRing('jade_guard_ring')
    vi.spyOn(Math, 'random').mockReturnValue(0)

    miningStore.isExploring = true
    miningStore.currentFloor = 21
    miningStore.totalMonstersOnFloor = 1
    miningStore.floorGrid = [
      {
        index: 0,
        type: 'monster',
        state: 'revealed',
        data: {
          monster: {
            id: 'test_ice_bat',
            name: '测试冰蝠',
            hp: 1,
            attack: 0,
            defense: 0,
            drops: [],
            expReward: 1,
            description: '测试怪物'
          }
        }
      }
    ]

    const start = miningStore.startChainBattle()
    const result = miningStore.combatAction('attack')

    expect(start.success).toBe(true)
    expect(result.combatOver).toBe(true)
    expect(result.won).toBe(true)
    expect(result.message).toContain('获得了武器：')
    expect(result.message).toContain('冰锋匕')
    expect(result.message).toContain('获得了帽子：霜寒兜帽')
    expect(result.message).toContain('获得了鞋子：霜行靴')
    expect(result.message).toContain('重复装备自动售出+150文')
    expect(inventoryStore.ownedWeapons.some(weapon => weapon.defId === 'frost_dagger')).toBe(true)
    expect(inventoryStore.ownedRings.filter(ring => ring.defId === 'jade_guard_ring')).toHaveLength(1)
    expect(inventoryStore.ownedHats.some(hat => hat.defId === 'frost_hood')).toBe(true)
    expect(inventoryStore.ownedShoes.some(shoe => shoe.defId === 'frost_treads')).toBe(true)
    expect(playerStore.money).toBe(650)
  })

  it('grants main mine boss first-kill weapon, gear, money, and ore rewards', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    miningStore.isExploring = true
    miningStore.currentFloor = 20
    miningStore.totalMonstersOnFloor = 1
    miningStore.floorGrid = [
      {
        index: 0,
        type: 'boss',
        state: 'revealed',
        data: {
          monster: {
            id: 'mud_golem',
            name: '泥岩巨兽',
            hp: 1,
            attack: 0,
            defense: 0,
            drops: [],
            expReward: 50,
            description: '测试BOSS'
          },
          isBoss: true
        }
      }
    ]

    const start = miningStore.engageRevealedMonster(0)
    const result = miningStore.combatAction('attack')

    expect(start.success).toBe(true)
    expect(result.combatOver).toBe(true)
    expect(result.won).toBe(true)
    expect(result.message).toContain('首次击败BOSS')
    expect(result.message).toContain('泥王之牙')
    expect(result.message).toContain('获得了戒指：泥岩护带')
    expect(result.message).toContain('获得了帽子：石魔帽')
    expect(result.message).toContain('获得100文')
    expect(result.message).toContain('获得了铜矿×3')
    expect(miningStore.defeatedBosses).toEqual(['mud_golem'])
    expect(miningStore.floorGrid[0]?.state).toBe('defeated')
    expect(inventoryStore.ownedWeapons.some(weapon => weapon.defId === 'mud_king_fang')).toBe(true)
    expect(inventoryStore.ownedRings.some(ring => ring.defId === 'mud_golem_band')).toBe(true)
    expect(inventoryStore.ownedHats.some(hat => hat.defId === 'golem_stone_cap')).toBe(true)
    expect(inventoryStore.getItemCount('copper_ore')).toBe(3)
    expect(playerStore.money).toBe(600)
  })

  it('grants infested floor clear rewards after defeating the final monster', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    vi.spyOn(Math, 'random').mockReturnValue(0)

    miningStore.isExploring = true
    miningStore.currentFloor = 6
    miningStore.totalMonstersOnFloor = 1
    miningStore.floorGrid = [
      {
        index: 0,
        type: 'monster',
        state: 'revealed',
        data: {
          monster: {
            id: 'test_infested_worm',
            name: '测试感染虫',
            hp: 1,
            attack: 0,
            defense: 0,
            drops: [],
            expReward: 1,
            description: '测试感染层怪物'
          }
        }
      }
    ]

    const start = miningStore.startChainBattle()
    const result = miningStore.combatAction('attack')

    expect(start.success).toBe(true)
    expect(result.combatOver).toBe(true)
    expect(result.won).toBe(true)
    expect(result.message).toContain('感染层清除完毕')
    expect(result.message).toContain('获得铜矿×3和30文')
    expect(miningStore.stairsUsable).toBe(true)
    expect(miningStore.floorGrid[0]?.state).toBe('defeated')
    expect(inventoryStore.getItemCount('copper_ore')).toBe(3)
    expect(playerStore.money).toBe(530)
  })

  it('uses permanent guild combat items in batches and records combat logs', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()

    inventoryStore.addItem('guild_badge', 2)
    inventoryStore.addItem('life_talisman', 1)
    inventoryStore.addItem('lucky_coin', 3)
    inventoryStore.addItem('defense_charm', 1)

    miningStore.isExploring = true
    miningStore.inCombat = true

    const badgeResult = miningStore.useCombatItem('guild_badge', 5)
    const lifeResult = miningStore.useCombatItem('life_talisman', 1)
    const luckyResult = miningStore.useCombatItem('lucky_coin', 2)
    const defenseResult = miningStore.useCombatItem('defense_charm', 3)

    expect(badgeResult).toEqual({ success: true, message: '使用了公会徽章×2，攻击力永久+6！' })
    expect(lifeResult).toEqual({ success: true, message: '使用了生命护符×1，最大生命值永久+15！' })
    expect(luckyResult).toEqual({ success: true, message: '使用了幸运铜钱×2，怪物掉落率永久+10%！' })
    expect(defenseResult).toEqual({ success: true, message: '使用了守护符×1，防御永久+3%！' })
    expect(miningStore.guildBadgeBonusAttack).toBe(6)
    expect(miningStore.guildBonusMaxHp).toBe(15)
    expect(miningStore.guildBonusDropRate).toBe(0.1)
    expect(miningStore.guildBonusDefense).toBe(0.03)
    expect(inventoryStore.getItemCount('guild_badge')).toBe(0)
    expect(inventoryStore.getItemCount('life_talisman')).toBe(0)
    expect(inventoryStore.getItemCount('lucky_coin')).toBe(1)
    expect(inventoryStore.getItemCount('defense_charm')).toBe(0)
    expect(miningStore.combatLog).toEqual([
      badgeResult.message,
      lifeResult.message,
      luckyResult.message,
      defenseResult.message
    ])
    expect(miningStore.useCombatItem('guild_badge', 1)).toEqual({ success: false, message: '没有公会徽章。' })
  })

  it('uses slayer charms once per exploration and records combat logs', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()

    inventoryStore.addItem('slayer_charm', 2)
    miningStore.isExploring = true
    miningStore.inCombat = true

    const first = miningStore.useCombatItem('slayer_charm')
    const second = miningStore.useCombatItem('slayer_charm')

    expect(first).toEqual({ success: true, message: '使用了猎魔符，本次探索怪物掉落率+20%！' })
    expect(second).toEqual({ success: false, message: '猎魔符效果已激活。' })
    expect(miningStore.slayerCharmActive).toBe(true)
    expect(inventoryStore.getItemCount('slayer_charm')).toBe(1)
    expect(miningStore.combatLog).toEqual([first.message])
  })

  it('uses damage combat items to defeat monsters and resolve rewards', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()

    inventoryStore.addItem('poison_arrow', 1)

    miningStore.isExploring = true
    miningStore.currentFloor = 1
    miningStore.totalMonstersOnFloor = 1
    miningStore.floorGrid = [
      {
        index: 0,
        type: 'monster',
        state: 'revealed',
        data: {
          monster: {
            id: 'test_bat',
            name: '测试蝙蝠',
            hp: 20,
            attack: 0,
            defense: 2,
            drops: [{ itemId: 'wood', chance: 2 }],
            expReward: 1,
            description: '测试怪物'
          }
        }
      }
    ]

    const start = miningStore.engageRevealedMonster(0)
    const result = miningStore.useCombatItem('poison_arrow')

    expect(start.success).toBe(true)
    expect(result.success).toBe(true)
    expect(result.message).toContain('使用了毒箭')
    expect(result.message).toContain('测试蝙蝠')
    expect(result.message).toContain('掉落了物品')
    expect(miningStore.inCombat).toBe(false)
    expect(miningStore.combatMonsterHp).toBe(0)
    expect(miningStore.floorGrid[0]?.state).toBe('defeated')
    expect(inventoryStore.getItemCount('poison_arrow')).toBe(0)
    expect(inventoryStore.getItemCount('wood')).toBe(2)
  })

  it('refunds damage combat items used outside combat while exploring', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()

    inventoryStore.addItem('poison_arrow', 1)
    miningStore.isExploring = true
    miningStore.inCombat = false

    const result = miningStore.useCombatItem('poison_arrow')

    expect(result).toEqual({ success: false, message: '毒箭只能在战斗中使用。' })
    expect(inventoryStore.getItemCount('poison_arrow')).toBe(1)
  })

  it('uses restorative mining items with alchemist bonus and combat log entries', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()
    const skillStore = useSkillStore()

    inventoryStore.addItem('adventurer_ration', 1)
    playerStore.hp = 40
    playerStore.stamina = 60
    skillStore.getSkill('foraging').perk10 = 'alchemist'
    miningStore.isExploring = true
    miningStore.inCombat = true

    const result = miningStore.useCombatItem('adventurer_ration')

    expect(result).toEqual({ success: true, message: '使用了冒险口粮，恢复37HP和恢复37体力！' })
    expect(playerStore.hp).toBe(77)
    expect(playerStore.stamina).toBe(97)
    expect(inventoryStore.getItemCount('adventurer_ration')).toBe(0)
    expect(miningStore.combatLog).toEqual([result.message])
  })

  it('does not consume restorative mining items when already full', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    inventoryStore.addItem('adventurer_ration', 1)
    playerStore.hp = playerStore.getMaxHp()
    playerStore.stamina = playerStore.maxStamina
    miningStore.isExploring = true

    const result = miningStore.useCombatItem('adventurer_ration')

    expect(result).toEqual({ success: false, message: '体力和生命值都已满。' })
    expect(inventoryStore.getItemCount('adventurer_ration')).toBe(1)
  })

  it('applies defeat penalties, clears exploration state, and exits skull cavern', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()
    const playerStore = usePlayerStore()

    vi.spyOn(Math, 'random').mockReturnValue(0)
    inventoryStore.addItem('firewood', 1)
    miningStore.isExploring = true
    miningStore.isInSkullCavern = true
    miningStore.skullCavernFloor = 8
    miningStore.slayerCharmActive = true
    miningStore.floorGrid = [
      {
        index: 0,
        type: 'monster',
        state: 'revealed',
        data: {
          monster: {
            id: 'loot_slime',
            name: '战利品史莱姆',
            hp: 1,
            attack: 0,
            defense: 0,
            drops: [{ itemId: 'wood', chance: 1 }],
            expReward: 1,
            description: '用于生成本次探索战利品'
          }
        }
      },
      {
        index: 1,
        type: 'monster',
        state: 'revealed',
        data: {
          monster: {
            id: 'fatal_bat',
            name: '致命蝙蝠',
            hp: 99,
            attack: 10,
            defense: 0,
            drops: [],
            expReward: 1,
            description: '用于触发战败'
          }
        }
      }
    ]

    expect(miningStore.engageRevealedMonster(0).success).toBe(true)
    expect(miningStore.combatAction('attack').won).toBe(true)
    expect(inventoryStore.getItemCount('wood')).toBe(2)

    expect(miningStore.engageRevealedMonster(1).success).toBe(true)
    miningStore.combatPlayerStatuses = [{ type: 'poison', name: '中毒', power: 1, remainingTurns: 1, source: 'monster' }]
    playerStore.hp = 1
    const defeat = miningStore.combatAction('defend')

    expect(defeat.combatOver).toBe(true)
    expect(defeat.won).toBe(false)
    expect(defeat.message).toContain('你在骷髅矿穴中倒下了')
    expect(defeat.message).toContain('1件背包物品')
    expect(defeat.message).toContain('50文')
    expect(miningStore.isExploring).toBe(false)
    expect(miningStore.inCombat).toBe(false)
    expect(miningStore.isInSkullCavern).toBe(false)
    expect(miningStore.skullCavernFloor).toBe(0)
    expect(miningStore.floorGrid).toEqual([])
    expect(miningStore.slayerCharmActive).toBe(false)
    expect(miningStore.combatPlayerStatuses).toEqual([])
    expect(miningStore.combatMonsterStatuses).toEqual([])
    expect(inventoryStore.getItemCount('wood')).toBe(0)
    expect(inventoryStore.getItemCount('firewood')).toBe(0)
    expect(playerStore.money).toBe(450)
    expect(playerStore.hp).toBe(Math.floor(playerStore.getMaxHp() * 0.5))
    expect(miningStore.combatLog[miningStore.combatLog.length - 1]).toBe(defeat.message)
  })

  it('advances normal mine floors and saves newly reached safe points', () => {
    const miningStore = useMiningStore()

    miningStore.isExploring = true
    miningStore.currentFloor = 4
    miningStore.safePointFloor = 0
    miningStore.stairsFound = true
    miningStore.stairsUsable = true

    const result = miningStore.goNextFloor()

    expect(result.success).toBe(true)
    expect(result.message).toContain('前进到第5层')
    expect(result.message).toContain('安全点')
    expect(miningStore.currentFloor).toBe(5)
    expect(miningStore.safePointFloor).toBe(5)
    expect(miningStore.isInSkullCavern).toBe(false)
    expect(miningStore.floorGrid.length).toBeGreaterThan(0)
    expect(miningStore.stairsFound).toBe(false)
    expect(miningStore.stairsUsable).toBe(true)
  })

  it('advances skull cavern floors and saves skull safe points', () => {
    const miningStore = useMiningStore()

    miningStore.isExploring = true
    miningStore.isInSkullCavern = true
    miningStore.skullCavernFloor = 9
    miningStore.skullCavernBestFloor = 9
    miningStore.skullSafePointFloor = 0
    miningStore.stairsFound = true
    miningStore.stairsUsable = true

    const result = miningStore.goNextFloor()

    expect(result.success).toBe(true)
    expect(result.message).toContain('前进到骷髅矿穴第10层')
    expect(result.message).toContain('安全点')
    expect(miningStore.skullCavernFloor).toBe(10)
    expect(miningStore.skullCavernBestFloor).toBe(10)
    expect(miningStore.skullSafePointFloor).toBe(10)
    expect(miningStore.isInSkullCavern).toBe(true)
    expect(miningStore.floorGrid.length).toBeGreaterThan(0)
    expect(miningStore.stairsFound).toBe(false)
    expect(miningStore.stairsUsable).toBe(true)
  })

  it('uses monster lure to fill hidden empty tiles with extra monsters', () => {
    const miningStore = useMiningStore()
    const inventoryStore = useInventoryStore()

    vi.spyOn(Math, 'random').mockReturnValue(0)
    inventoryStore.addItem('monster_lure', 1)
    miningStore.isExploring = true
    miningStore.currentFloor = 1
    miningStore.totalMonstersOnFloor = 2
    miningStore.floorGrid = [
      {
        index: 0,
        type: 'monster',
        state: 'revealed',
        data: {
          monster: {
            id: 'existing_slime',
            name: '现有史莱姆',
            hp: 1,
            attack: 0,
            defense: 0,
            drops: [],
            expReward: 1,
            description: '现有怪物'
          }
        }
      },
      {
        index: 1,
        type: 'monster',
        state: 'hidden',
        data: {
          monster: {
            id: 'hidden_bat',
            name: '隐藏蝙蝠',
            hp: 1,
            attack: 0,
            defense: 0,
            drops: [],
            expReward: 1,
            description: '隐藏怪物'
          }
        }
      },
      { index: 2, type: 'empty', state: 'hidden' },
      { index: 3, type: 'empty', state: 'hidden' },
      { index: 4, type: 'empty', state: 'revealed' }
    ]

    const result = miningStore.useMonsterLure()

    expect(result).toEqual({ success: true, message: '使用了怪物诱饵！本层增加了2只怪物。' })
    expect(inventoryStore.getItemCount('monster_lure')).toBe(0)
    expect(miningStore.totalMonstersOnFloor).toBe(4)
    expect(miningStore.floorGrid[2]?.type).toBe('monster')
    expect(miningStore.floorGrid[2]?.data?.monster?.id).toBeDefined()
    expect(miningStore.floorGrid[3]?.type).toBe('monster')
    expect(miningStore.floorGrid[3]?.data?.monster?.id).toBeDefined()
    expect(miningStore.floorGrid[4]?.type).toBe('empty')
  })
})
