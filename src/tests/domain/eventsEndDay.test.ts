import { describe, expect, it, vi } from 'vitest'
import {
  processAchievementEndDay,
  processMorningTutorialEndDay,
  processOldDateEndDay,
  processSeasonEventEndDay,
  processSeasonEventEffectsEndDay,
  processWeatherMarketEndDay
} from '@/domain/endDay/eventsEndDay'

describe('old-date end day processor', () => {
  it('preserves reset, log, scene, reward, shipping, and quest order', () => {
    const order: string[] = []
    let bonusMaxStamina = 0

    const result = processOldDateEndDay({
      dailyNpcReset: () => order.push('npc-reset'),
      dailyCookingReset: () => order.push('cooking-reset'),
      resetDailyBets: () => order.push('bets-reset'),
      hanhaiUnlocked: true,
      dailyTradeUpdate: () => {
        order.push('trade-update')
        return {
          completed: [{ itemId: 'cabbage', quantity: 3, points: 120 }]
        }
      },
      getItemName: itemId => (itemId === 'cabbage' ? '青菜' : itemId),
      checkDiscoveryConditions: () => {
        order.push('discovery-check')
        return [
          {
            npcId: 'shan_weng',
            step: { logMessage: '山中传来异响。', scenes: ['scene-1'] }
          }
        ]
      },
      showDiscoveryScene: npcId => order.push(`scene:${npcId}`),
      dailyHiddenNpcReset: () => order.push('hidden-reset'),
      checkAbilityUnlocks: () => {
        order.push('ability-check')
        return [{ id: 'shan_weng_3', name: '山魂', description: '最大体力提升。' }]
      },
      isAbilityActive: abilityId => {
        order.push(`active:${abilityId}`)
        return true
      },
      getBonusMaxStamina: () => {
        order.push('bonus-read')
        return bonusMaxStamina
      },
      addBonusMaxStamina: amount => {
        order.push(`bonus:${amount}`)
        bonusMaxStamina += amount
      },
      processShippingBox: () => {
        order.push('shipping')
        return 500
      },
      earnMoney: amount => order.push(`earn:${amount}`),
      dailyQuestUpdate: () => {
        order.push('quest-update')
        return [{ description: '送三棵青菜' }]
      },
      updateMainQuestProgress: () => order.push('main-quest'),
      addLog: message => order.push(`log:${message}`)
    })

    expect(order).toEqual([
      'npc-reset',
      'cooking-reset',
      'bets-reset',
      'trade-update',
      'log:通商售出青菜×3，获得120通商积分。',
      'discovery-check',
      'log:山中传来异响。',
      'scene:shan_weng',
      'hidden-reset',
      'ability-check',
      'log:【仙缘】山魂：最大体力提升。',
      'bonus:20',
      'active:shan_weng_3',
      'bonus-read',
      'shipping',
      'earn:500',
      'log:出货箱结算：收入500文。',
      'quest-update',
      'log:委托「送三棵青菜」已过期。',
      'main-quest'
    ])
    expect(result).toEqual({
      completedTradeCount: 1,
      discoveryCount: 1,
      unlockedAbilityCount: 1,
      bonusMaxStaminaAdded: 20,
      shippingIncome: 500,
      expiredQuestCount: 1
    })
  })

  it('skips locked trade and repairs legacy stamina bonus without duplicate rewards', () => {
    let bonusMaxStamina = 5
    const dailyTradeUpdate = vi.fn()
    const logs: string[] = []

    const result = processOldDateEndDay({
      dailyNpcReset: vi.fn(),
      dailyCookingReset: vi.fn(),
      resetDailyBets: vi.fn(),
      hanhaiUnlocked: false,
      dailyTradeUpdate,
      getItemName: itemId => itemId,
      checkDiscoveryConditions: () => [],
      showDiscoveryScene: vi.fn(),
      dailyHiddenNpcReset: vi.fn(),
      checkAbilityUnlocks: () => [],
      isAbilityActive: () => true,
      getBonusMaxStamina: () => bonusMaxStamina,
      addBonusMaxStamina: amount => {
        bonusMaxStamina += amount
      },
      processShippingBox: () => 0,
      earnMoney: vi.fn(),
      dailyQuestUpdate: () => [],
      updateMainQuestProgress: vi.fn(),
      addLog: message => logs.push(message)
    })

    expect(dailyTradeUpdate).not.toHaveBeenCalled()
    expect(bonusMaxStamina).toBe(20)
    expect(logs).toEqual([])
    expect(result).toEqual({
      completedTradeCount: 0,
      discoveryCount: 0,
      unlockedAbilityCount: 0,
      bonusMaxStaminaAdded: 15,
      shippingIncome: 0,
      expiredQuestCount: 0
    })
  })

  it('handles large old-date result batches within the performance boundary', () => {
    const count = 5_000
    const completed = Array.from({ length: count }, (_, index) => ({
      itemId: `item-${index}`,
      quantity: index + 1,
      points: index + 10
    }))
    const discoveries = Array.from({ length: count }, (_, index) => ({
      npcId: `npc-${index}`,
      step: { logMessage: `发现${index}`, scenes: [] }
    }))
    const abilities = Array.from({ length: count }, (_, index) => ({
      id: `ability-${index}`,
      name: `能力${index}`,
      description: `描述${index}`
    }))
    const expiredQuests = Array.from({ length: count }, (_, index) => ({
      description: `委托${index}`
    }))

    const start = performance.now()
    const result = processOldDateEndDay({
      dailyNpcReset: () => {},
      dailyCookingReset: () => {},
      resetDailyBets: () => {},
      hanhaiUnlocked: true,
      dailyTradeUpdate: () => ({ completed }),
      getItemName: itemId => itemId,
      checkDiscoveryConditions: () => discoveries,
      showDiscoveryScene: () => {},
      dailyHiddenNpcReset: () => {},
      checkAbilityUnlocks: () => abilities,
      isAbilityActive: () => false,
      getBonusMaxStamina: () => 0,
      addBonusMaxStamina: () => {},
      processShippingBox: () => 0,
      earnMoney: () => {},
      dailyQuestUpdate: () => expiredQuests,
      updateMainQuestProgress: () => {},
      addLog: () => {}
    })
    const elapsed = performance.now() - start

    expect(result.completedTradeCount).toBe(count)
    expect(result.discoveryCount).toBe(count)
    expect(result.unlockedAbilityCount).toBe(count)
    expect(result.expiredQuestCount).toBe(count)
    expect(elapsed).toBeLessThan(500)
  })
})

describe('weather and market end day processor', () => {
  it('preserves lightning, rain, forecast, countdown, and market order', () => {
    const order: string[] = []

    const result = processWeatherMarketEndDay({
      weather: 'stormy',
      isRainy: true,
      tomorrowWeatherName: '晴天',
      seasonChanged: false,
      day: 25,
      season: 'spring',
      lightningStrike: () => {
        order.push('lightning')
        return { absorbed: true, hit: false }
      },
      addItem: itemId => order.push(`item:${itemId}`),
      getPlots: () => {
        order.push('plots')
        return [
          { state: 'growing', cropId: 'cabbage' },
          { state: 'tilled', cropId: null }
        ]
      },
      getCropSeasons: cropId => {
        order.push(`crop:${cropId}`)
        return ['spring']
      },
      getSeasonName: season => {
        order.push(`season:${season}`)
        return '夏'
      },
      getMarketInfo: () => {
        order.push('market')
        return [
          { trend: 'boom', category: 'crop' },
          { trend: 'crash', category: 'fish' }
        ]
      },
      getMarketCategoryName: category => {
        order.push(`category:${category}`)
        return category === 'crop' ? '农产品' : '鱼类'
      },
      addLog: message => order.push(`log:${message}`),
      showFloat: (message, type) => order.push(`float:${type}:${message}`)
    })

    expect(order).toEqual([
      'lightning',
      'item:battery',
      'log:避雷针吸收了一道闪电！获得了电池组。',
      'log:今天下雨，作物自动浇水。',
      'log:明日天气预报：晴天',
      'plots',
      'crop:cabbage',
      'season:summer',
      'log:距离换季还有3天，1株作物不适应夏季，届时将会枯萎。',
      'float:danger:换季倒计时3天！1株作物将枯萎',
      'market',
      'category:crop',
      'log:今日行情：农产品价格大涨！',
      'category:fish',
      'log:今日行情：鱼类价格暴跌。'
    ])
    expect(result).toEqual({
      lightningOutcome: 'absorbed',
      cropAtRisk: 1,
      marketBoomCount: 1,
      marketCrashCount: 1
    })
  })

  it('keeps the no-risk countdown and lightning-hit messages unchanged', () => {
    const logs: string[] = []

    const result = processWeatherMarketEndDay({
      weather: 'stormy',
      isRainy: false,
      tomorrowWeatherName: '多云',
      seasonChanged: false,
      day: 27,
      season: 'winter',
      lightningStrike: () => ({ absorbed: false, hit: true, cropName: '青菜' }),
      addItem: vi.fn(),
      getPlots: () => [],
      getCropSeasons: () => undefined,
      getSeasonName: season => season,
      getMarketInfo: () => [],
      getMarketCategoryName: category => String(category),
      addLog: message => logs.push(message),
      showFloat: vi.fn()
    })

    expect(logs).toEqual([
      '雷暴中一道闪电击中了你的农场，一株青菜被毁了！建造避雷针可以防护。',
      '明日天气预报：多云',
      '距离换季还有1天。'
    ])
    expect(result.lightningOutcome).toBe('hit')
  })

  it('handles 100,000 countdown plots within the performance boundary', () => {
    const plots = Array.from({ length: 100_000 }, (_, index) => ({
      state: index % 2 === 0 ? 'growing' : 'harvestable',
      cropId: `crop-${index}`
    }))
    const start = performance.now()

    const result = processWeatherMarketEndDay({
      weather: 'sunny',
      isRainy: false,
      tomorrowWeatherName: '晴天',
      seasonChanged: false,
      day: 25,
      season: 'spring',
      lightningStrike: () => ({ absorbed: false, hit: false }),
      addItem: () => {},
      getPlots: () => plots,
      getCropSeasons: () => ['spring'],
      getSeasonName: () => '夏',
      getMarketInfo: () => [],
      getMarketCategoryName: category => String(category),
      addLog: () => {},
      showFloat: () => {}
    })
    const elapsed = performance.now() - start

    expect(result.cropAtRisk).toBe(100_000)
    expect(elapsed).toBeLessThan(1000)
  })
})

describe('morning tutorial end day processor', () => {
  it('shows only the first eligible tip and preserves flag updates', () => {
    const order: string[] = []
    const flags: Record<string, boolean> = {
      seenRain: false,
      justChangedSeason: true,
      staminaWasLow: true
    }

    const result = processMorningTutorialEndDay({
      enabled: true,
      year: 1,
      day: 20,
      season: 'summer',
      isRainy: true,
      tips: [
        { id: 'shown', conditionKey: 'earlyGame', message: '已显示' },
        { id: 'rain', conditionKey: 'firstRainyDay', message: '下雨提示' },
        { id: 'season', conditionKey: 'justChangedSeason', message: '换季提示' }
      ],
      getPlots: () => [],
      getSprinklerCount: () => 0,
      getAnimalCount: () => 0,
      totalCropsHarvested: 0,
      totalMoneyEarned: 0,
      totalFishCaught: 0,
      highestMineFloor: 0,
      totalRecipesCooked: 0,
      areAllNpcFriendshipsZero: () => true,
      isTipShown: tipId => {
        order.push(`shown:${tipId}`)
        return tipId === 'shown'
      },
      markTipShown: tipId => order.push(`mark:${tipId}`),
      hasPanelVisited: () => false,
      getFlag: key => {
        order.push(`get:${key}`)
        return flags[key] ?? false
      },
      setFlag: (key, value = true) => {
        order.push(`set:${key}:${value}`)
        flags[key] = value
      },
      addLog: message => order.push(`log:${message}`)
    })

    expect(order).toEqual([
      'shown:shown',
      'shown:rain',
      'get:seenRain',
      'log:下雨提示',
      'mark:rain',
      'set:seenRain:true',
      'set:justChangedSeason:false',
      'set:staminaWasLow:false'
    ])
    expect(result).toEqual({ shownTipId: 'rain', temporaryFlagsCleared: true })
  })

  it('does not clear temporary flags while tutorials are disabled or outside year one', () => {
    const setFlag = vi.fn()
    const baseInput = {
      day: 2,
      season: 'spring' as const,
      isRainy: false,
      tips: [],
      getPlots: () => [],
      getSprinklerCount: () => 0,
      getAnimalCount: () => 0,
      totalCropsHarvested: 0,
      totalMoneyEarned: 0,
      totalFishCaught: 0,
      highestMineFloor: 0,
      totalRecipesCooked: 0,
      areAllNpcFriendshipsZero: () => true,
      isTipShown: () => false,
      markTipShown: vi.fn(),
      hasPanelVisited: () => false,
      getFlag: () => false,
      setFlag,
      addLog: vi.fn()
    }

    expect(processMorningTutorialEndDay({ ...baseInput, enabled: false, year: 1 })).toEqual({
      shownTipId: null,
      temporaryFlagsCleared: false
    })
    expect(processMorningTutorialEndDay({ ...baseInput, enabled: true, year: 2 })).toEqual({
      shownTipId: null,
      temporaryFlagsCleared: false
    })
    expect(setFlag).not.toHaveBeenCalled()
  })

  it('checks a 100,000-plot tutorial condition within the performance boundary', () => {
    const plots = Array.from({ length: 100_000 }, () => ({
      state: 'wasteland',
      watered: false
    }))
    const start = performance.now()

    const result = processMorningTutorialEndDay({
      enabled: true,
      year: 1,
      day: 3,
      season: 'spring',
      isRainy: false,
      tips: [{ id: 'till', conditionKey: 'allWasteland', message: '开垦提示' }],
      getPlots: () => plots,
      getSprinklerCount: () => 0,
      getAnimalCount: () => 0,
      totalCropsHarvested: 0,
      totalMoneyEarned: 0,
      totalFishCaught: 0,
      highestMineFloor: 0,
      totalRecipesCooked: 0,
      areAllNpcFriendshipsZero: () => true,
      isTipShown: () => false,
      markTipShown: () => {},
      hasPanelVisited: () => false,
      getFlag: () => false,
      setFlag: () => {},
      addLog: () => {}
    })
    const elapsed = performance.now() - start

    expect(result.shownTipId).toBe('till')
    expect(elapsed).toBeLessThan(1000)
  })
})

describe('season event end day processor', () => {
  it('preserves reward, log, and festival recipe order', () => {
    const order: string[] = []
    const npcStates = [{ friendship: 10 }, { friendship: 20 }]

    const result = processSeasonEventEffectsEndDay({
      event: {
        id: 'spring_festival',
        name: '春耕祭',
        description: '祈求丰收。',
        effects: {
          friendshipBonus: 5,
          moneyReward: 100,
          staminaBonus: 20,
          itemReward: [{ itemId: 'seed_cabbage', quantity: 3 }]
        }
      },
      getNpcStates: () => {
        order.push('npc-states')
        return npcStates
      },
      earnMoney: amount => order.push(`money:${amount}`),
      restoreStamina: amount => order.push(`stamina:${amount}`),
      addItem: (itemId, quantity) => order.push(`item:${itemId}:${quantity}`),
      unlockRecipe: recipeId => {
        order.push(`unlock:${recipeId}`)
        return true
      },
      addLog: message => order.push(`log:${message}`),
      showFloat: (message, type) => order.push(`float:${type}:${message}`)
    })

    expect(order).toEqual([
      'npc-states',
      'money:100',
      'float:accent:+100文',
      'stamina:20',
      'float:success:+20体力',
      'item:seed_cabbage:3',
      'log:【春耕祭】祈求丰收。',
      'unlock:spring_roll',
      'log:节日活动解锁了新食谱！'
    ])
    expect(npcStates).toEqual([{ friendship: 15 }, { friendship: 25 }])
    expect(result).toEqual({
      friendshipUpdatedCount: 2,
      itemRewardCount: 1,
      festivalRecipeUnlocked: true
    })
  })

  it('keeps interactive festival order and resolves ordinal years', () => {
    const order: string[] = []
    const event = {
      interactive: true,
      festivalType: 'fishing_contest',
      narrative: ['这是第{year}年。']
    }

    const triggered = processSeasonEventEndDay({
      event,
      year: 2,
      season: 'summer',
      applyEventEffects: () => order.push('effects'),
      showFestival: festivalType => order.push(`festival:${festivalType}`),
      startFestivalBgm: season => order.push(`bgm:${season}`),
      showEvent: (_event, narrative) => order.push(`event:${narrative.join('|')}`)
    })

    expect(triggered).toBe(true)
    expect(order).toEqual(['effects', 'festival:fishing_contest', 'event:这是第二年。'])
  })

  it('starts passive festival music and uses numeric years above ten', () => {
    const order: string[] = []

    processSeasonEventEndDay({
      event: { narrative: ['这是第{year}年。'] },
      year: 12,
      season: 'winter',
      applyEventEffects: () => order.push('effects'),
      showFestival: festivalType => order.push(`festival:${festivalType}`),
      startFestivalBgm: season => order.push(`bgm:${season}`),
      showEvent: (_event, narrative) => order.push(`event:${narrative.join('|')}`)
    })

    expect(order).toEqual(['effects', 'bgm:winter', 'event:这是第12年。'])
  })
})

describe('achievement end day processor', () => {
  it('preserves achievement logs, floats, recipe checks, and cave unlock order', () => {
    const order: string[] = []

    const result = processAchievementEndDay({
      checkAchievements: () => {
        order.push('check')
        return [
          { name: '丰收', reward: { money: 100 } },
          { name: '探索', reward: {} }
        ]
      },
      addLog: message => order.push(`log:${message}`),
      showFloat: (message, type) => order.push(`float:${type}:${message}`),
      checkAchievementRecipes: () => order.push('recipes'),
      caveUnlocked: false,
      totalMoneyEarned: 10_000,
      caveUnlockEarnings: 5_000,
      unlockCave: () => order.push('unlock-cave')
    })

    expect(order).toEqual([
      'check',
      'log:【成就达成】丰收！获得100文',
      'float:accent:成就: 丰收',
      'log:【成就达成】探索！',
      'float:accent:成就: 探索',
      'recipes',
      'unlock-cave',
      'log:你的累计收入引起了注意……村后的山洞已为你开放！去设施面板选择山洞用途吧。'
    ])
    expect(result).toEqual({ achievementCount: 2, caveUnlocked: true })
  })

  it('handles 5,000 achievements within the performance boundary', () => {
    const achievements = Array.from({ length: 5_000 }, (_, index) => ({
      name: `成就${index}`,
      reward: { money: index }
    }))
    const start = performance.now()

    const result = processAchievementEndDay({
      checkAchievements: () => achievements,
      addLog: () => {},
      showFloat: () => {},
      checkAchievementRecipes: () => {},
      caveUnlocked: true,
      totalMoneyEarned: 0,
      caveUnlockEarnings: 5_000,
      unlockCave: () => {}
    })
    const elapsed = performance.now() - start

    expect(result.achievementCount).toBe(5_000)
    expect(result.caveUnlocked).toBe(false)
    expect(elapsed).toBeLessThan(500)
  })
})
