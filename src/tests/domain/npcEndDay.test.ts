import { describe, expect, it, vi } from 'vitest'
import {
  processAnimalFeedingAssistanceEndDay,
  processFamilyEndDay,
  processMorningAssistanceEndDay,
  processZhijiBonusEndDay
} from '@/domain/endDay/npcEndDay'

describe('family end day processor', () => {
  it('preserves wedding, pregnancy, child, and proposal order', () => {
    const order: string[] = []

    const result = processFamilyEndDay({
      dailyWeddingUpdate: () => {
        order.push('wedding-update')
        return { weddingToday: true, npcId: 'qiu_yue' }
      },
      getWeddingNpcName: npcId => {
        order.push(`name:${npcId}`)
        return '秋月'
      },
      triggerWeddingEvent: npcId => order.push(`wedding-event:${npcId}`),
      dailyPregnancyUpdate: () => {
        order.push('pregnancy-update')
        return {
          born: { name: '小桃', quality: 'healthy' },
          stageChanged: { from: 'early', to: 'mid' },
          miscarriage: true
        }
      },
      dailyChildUpdate: () => order.push('child-update'),
      checkChildProposal: () => {
        order.push('proposal-check')
        return true
      },
      triggerChildProposal: () => order.push('proposal-trigger'),
      getSpouseName: () => {
        order.push('spouse-name')
        return '秋月'
      },
      addLog: message => order.push(`log:${message}`)
    })

    expect(order).toEqual([
      'wedding-update',
      'name:qiu_yue',
      'log:今天是你和秋月的大喜之日！',
      'wedding-event:qiu_yue',
      'pregnancy-update',
      'log:小桃出生了！恭喜！健健康康的！',
      'log:孕期进入中期。记得多多照顾配偶。',
      'log:很遗憾……这次没能迎来新生命。双方都需要一段时间来恢复。',
      'child-update',
      'proposal-check',
      'proposal-trigger',
      'spouse-name',
      'log:秋月似乎有话想和你说……'
    ])
    expect(result).toEqual({
      weddingTriggered: true,
      birthLogged: true,
      stageChangeLogged: true,
      miscarriageLogged: true,
      childProposalTriggered: true
    })
  })

  it.each([
    ['normal', '小禾出生了！恭喜！'],
    ['premature', '小禾出生了！恭喜！虽然早产了一些，但平安无事。'],
    ['healthy', '小禾出生了！恭喜！健健康康的！']
  ] as const)('keeps the %s birth-quality message unchanged', (quality, expectedMessage) => {
    const addLog = vi.fn()

    processFamilyEndDay({
      dailyWeddingUpdate: () => ({ weddingToday: false, npcId: null }),
      getWeddingNpcName: npcId => npcId,
      triggerWeddingEvent: vi.fn(),
      dailyPregnancyUpdate: () => ({ born: { name: '小禾', quality } }),
      dailyChildUpdate: vi.fn(),
      checkChildProposal: () => false,
      triggerChildProposal: vi.fn(),
      getSpouseName: () => '配偶',
      addLog
    })

    expect(addLog).toHaveBeenCalledWith(expectedMessage)
  })

  it('uses the spouse fallback and keeps empty days silent', () => {
    const addLog = vi.fn()

    const result = processFamilyEndDay({
      dailyWeddingUpdate: () => ({ weddingToday: false, npcId: null }),
      getWeddingNpcName: npcId => npcId,
      triggerWeddingEvent: vi.fn(),
      dailyPregnancyUpdate: () => ({}),
      dailyChildUpdate: vi.fn(),
      checkChildProposal: () => true,
      triggerChildProposal: vi.fn(),
      getSpouseName: () => '配偶',
      addLog
    })

    expect(addLog).toHaveBeenCalledOnce()
    expect(addLog).toHaveBeenCalledWith('配偶似乎有话想和你说……')
    expect(result).toEqual({
      weddingTriggered: false,
      birthLogged: false,
      stageChangeLogged: false,
      miscarriageLogged: false,
      childProposalTriggered: true
    })
  })

  it('keeps repeated family settlement orchestration cheap', () => {
    const start = performance.now()
    let completed = 0

    for (let index = 0; index < 10_000; index++) {
      const result = processFamilyEndDay({
        dailyWeddingUpdate: () => ({ weddingToday: false, npcId: null }),
        getWeddingNpcName: npcId => npcId,
        triggerWeddingEvent: () => {},
        dailyPregnancyUpdate: () => ({}),
        dailyChildUpdate: () => {},
        checkChildProposal: () => false,
        triggerChildProposal: () => {},
        getSpouseName: () => '配偶',
        addLog: () => {}
      })
      if (!result.weddingTriggered && !result.childProposalTriggered) completed++
    }
    const elapsed = performance.now() - start

    expect(completed).toBe(10_000)
    expect(elapsed).toBeLessThan(500)
  })
})

describe('animal feeding assistance end day processor', () => {
  it('keeps helper logs before spouse lookup and skips spouse feeding after helper success', () => {
    const order: string[] = []
    const random = vi.fn(() => 0)
    const feedAll = vi.fn(() => ({ fedCount: 2, noFeedCount: 0 }))

    const result = processAnimalFeedingAssistanceEndDay({
      processDailyHelpers: tasks => {
        order.push(`helpers:${tasks.join(',')}`)
        return { messages: ['雇工完成喂食。'], allFed: true }
      },
      getSpouse: () => {
        order.push('get-spouse')
        return { npcId: 'qiu_yue', friendship: 3000 }
      },
      feedAll,
      getSpouseName: npcId => npcId,
      addLog: message => order.push(`log:${message}`),
      random
    })

    expect(order).toEqual(['helpers:feed', 'log:雇工完成喂食。', 'get-spouse'])
    expect(random).not.toHaveBeenCalled()
    expect(feedAll).not.toHaveBeenCalled()
    expect(result).toEqual({
      spouse: { npcId: 'qiu_yue', friendship: 3000 },
      helperFeedSuccess: true,
      spouseFedSuccess: false
    })
  })

  it('preserves spouse feeding probability, partial-feed status, and messages', () => {
    const order: string[] = []

    const result = processAnimalFeedingAssistanceEndDay({
      processDailyHelpers: () => ({ messages: [], allFed: false }),
      getSpouse: () => ({ npcId: 'qiu_yue', friendship: 2500 }),
      feedAll: () => {
        order.push('feed-all')
        return { fedCount: 2, noFeedCount: 1 }
      },
      getSpouseName: npcId => {
        order.push(`name:${npcId}`)
        return '秋月'
      },
      addLog: message => order.push(`log:${message}`),
      random: () => {
        order.push('random')
        return 0.49
      }
    })

    expect(order).toEqual(['random', 'feed-all', 'name:qiu_yue', 'log:秋月帮你喂了所有牲畜。'])
    expect(result.helperFeedSuccess).toBe(false)
    expect(result.spouseFedSuccess).toBe(false)
  })

  it('keeps the insufficient-feed fallback unchanged', () => {
    const addLog = vi.fn()

    const result = processAnimalFeedingAssistanceEndDay({
      processDailyHelpers: () => ({ messages: [], allFed: false }),
      getSpouse: () => ({ npcId: 'missing', friendship: 0 }),
      feedAll: () => ({ fedCount: 0, noFeedCount: 3 }),
      getSpouseName: () => '配偶',
      addLog,
      random: () => 0
    })

    expect(addLog).toHaveBeenCalledWith('配偶想帮你喂牲畜，但草料不足。')
    expect(result.spouseFedSuccess).toBe(false)
  })
})

describe('zhiji bonus end day processor', () => {
  const createInput = (
    npcId: string,
    friendship: number,
    random: () => number,
    overrides: Partial<Parameters<typeof processZhijiBonusEndDay>[0]> = {}
  ): Parameters<typeof processZhijiBonusEndDay>[0] => ({
    zhiji: { npcId, friendship },
    npcStates: [],
    getZhijiName: () => '知己',
    addItem: vi.fn(),
    getItemName: () => undefined,
    feedAll: () => ({ fedCount: 1, noFeedCount: 0 }),
    restoreStamina: vi.fn(),
    addLog: vi.fn(),
    random,
    ...overrides
  })

  it('skips all lookups and random rolls when there is no zhiji', () => {
    const getZhijiName = vi.fn(() => '知己')
    const random = vi.fn(() => 0)

    const result = processZhijiBonusEndDay({
      ...createInput('a_shi', 0, random),
      zhiji: null,
      getZhijiName
    })

    expect(result.bonusTriggered).toBe(false)
    expect(getZhijiName).not.toHaveBeenCalled()
    expect(random).not.toHaveBeenCalled()
  })

  it.each([
    ['a_shi', 0.3, 3],
    ['dan_qing', 0.2, 1],
    ['a_tie', 0.3, 2],
    ['yun_fei', 0.3, 2],
    ['da_niu', 0.3, 1],
    ['mo_bai', 0.25, 1],
    ['liu_niang', 0.2, 1],
    ['qiu_yue', 0.3, 2],
    ['chun_lan', 0.25, 1],
    ['xue_qin', 0.15, 1],
    ['su_su', 0.25, 2],
    ['hong_dou', 0.3, 2]
  ] as const)(
    'preserves the %s base chance, high-friendship bonus, and successful random-call count',
    (npcId, baseChance, successfulRandomCalls) => {
      const failedRandom = vi.fn(() => baseChance)
      const failed = processZhijiBonusEndDay(createInput(npcId, 2499, failedRandom))

      expect(failed.bonusTriggered).toBe(false)
      expect(failedRandom).toHaveBeenCalledOnce()

      const successfulRandom = vi.fn(() => baseChance)
      const successful = processZhijiBonusEndDay(createInput(npcId, 2500, successfulRandom))

      expect(successful.bonusTriggered).toBe(true)
      expect(successfulRandom).toHaveBeenCalledTimes(successfulRandomCalls)
    }
  )

  it('preserves ore selection, quantity, lookup, and log order', () => {
    const order: string[] = []
    const randomValues = [0, 0.5, 0.9]
    let randomIndex = 0

    const result = processZhijiBonusEndDay({
      ...createInput('a_shi', 0, () => {
        const value = randomValues[randomIndex++]!
        order.push(`random:${value}`)
        return value
      }),
      getZhijiName: npcId => {
        order.push(`name:${npcId}`)
        return '阿石'
      },
      addItem: (itemId, quantity) => order.push(`add:${itemId}:${quantity}`),
      getItemName: itemId => {
        order.push(`item-name:${itemId}`)
        return '铁矿石'
      },
      addLog: message => order.push(`log:${message}`)
    })

    expect(result.bonusTriggered).toBe(true)
    expect(order).toEqual([
      'name:a_shi',
      'random:0',
      'random:0.5',
      'random:0.9',
      'add:iron_ore:3',
      'item-name:iron_ore',
      'log:阿石送来了3个铁矿石。'
    ])
  })

  it.each([
    ['a_shi', '知己送来了1个矿石。'],
    ['yun_fei', '知己从山里带回了东西。'],
    ['qiu_yue', '知己送来了一条鱼。'],
    ['su_su', '知己送来了一匹布料。'],
    ['hong_dou', '知己送来了一壶酒。']
  ] as const)('keeps the %s item-name fallback unchanged', (npcId, expectedLog) => {
    const addLog = vi.fn()

    processZhijiBonusEndDay(
      createInput(npcId, 0, () => 0, {
        addLog
      })
    )

    expect(addLog).toHaveBeenCalledWith(expectedLog)
  })

  it.each([
    ['dan_qing', '知己在村里替你美言了几句。(全村+5好感)'],
    ['liu_niang', '知己在村里替你说了好话。(全村+5好感)']
  ] as const)('raises village friendship for %s while skipping the zhiji', (npcId, expectedLog) => {
    const npcStates = [
      { npcId: 'villager_a', friendship: 10 },
      { npcId, friendship: 20 },
      { npcId: 'villager_b', friendship: 30 }
    ]
    const addLog = vi.fn()

    processZhijiBonusEndDay(
      createInput(npcId, 0, () => 0, {
        npcStates,
        addLog
      })
    )

    expect(npcStates).toEqual([
      { npcId: 'villager_a', friendship: 15 },
      { npcId, friendship: 20 },
      { npcId: 'villager_b', friendship: 35 }
    ])
    expect(addLog).toHaveBeenCalledWith(expectedLog)
  })

  it('updates 100,000 village friendship entries within the performance boundary', () => {
    const npcStates = Array.from({ length: 100_000 }, (_, index) => ({
      npcId: index === 50_000 ? 'dan_qing' : `npc_${index}`,
      friendship: index
    }))
    const start = performance.now()

    const result = processZhijiBonusEndDay(
      createInput('dan_qing', 0, () => 0, {
        npcStates,
        addLog: () => {}
      })
    )
    const elapsed = performance.now() - start

    expect(result.bonusTriggered).toBe(true)
    expect(npcStates[0]!.friendship).toBe(5)
    expect(npcStates[50_000]!.friendship).toBe(50_000)
    expect(npcStates[99_999]!.friendship).toBe(100_004)
    expect(elapsed).toBeLessThan(1000)
  })
})

describe('morning assistance end day processor', () => {
  it('preserves feeding mark, helper work, spouse actions, and random-call order', () => {
    const order: string[] = []
    const randomValues = [0, 0.75, 0, 0.4, 0]
    let randomIndex = 0
    const plots = [
      { id: 1, state: 'planted', watered: false },
      { id: 2, state: 'growing', watered: false },
      { id: 3, state: 'harvestable', watered: true },
      { id: 4, state: 'harvestable', watered: true }
    ]

    const result = processMorningAssistanceEndDay({
      spouse: { npcId: 'qiu_yue', friendship: 3000 },
      spouseFedSuccess: false,
      hasFeedHelper: () => {
        order.push('has-feed-helper')
        return true
      },
      markAllFed: () => order.push('mark-all-fed'),
      processDailyHelpers: tasks => {
        order.push(`helpers:${tasks.join(',')}`)
        return { messages: ['雇工完成晨间工作。'], allFed: false }
      },
      getPlots: () => plots,
      waterPlot: plotId => order.push(`water:${plotId}`),
      harvestPlot: plotId => {
        order.push(`harvest:${plotId}`)
        return { cropId: `crop-${plotId}` }
      },
      isInventoryFull: () => {
        order.push('inventory-full')
        return false
      },
      addItem: (itemId, quantity, quality) => {
        order.push(`add:${itemId}:${quantity ?? 1}:${quality ?? 'default'}`)
      },
      getSpouseName: npcId => {
        order.push(`name:${npcId}`)
        return '秋月'
      },
      getItemName: itemId => {
        order.push(`item-name:${itemId}`)
        return '馒头'
      },
      addLog: message => order.push(`log:${message}`),
      random: () => {
        const value = randomValues[randomIndex++]!
        order.push(`random:${value}`)
        return value
      }
    })

    expect(order).toEqual([
      'has-feed-helper',
      'mark-all-fed',
      'helpers:water,harvest,weed',
      'log:雇工完成晨间工作。',
      'name:qiu_yue',
      'random:0',
      'random:0.75',
      'water:1',
      'water:2',
      'log:秋月一早帮你浇了2块地。',
      'random:0',
      'random:0.4',
      'add:food_steamed_bun:1:default',
      'item-name:food_steamed_bun',
      'log:秋月一早做了一份馒头。',
      'inventory-full',
      'random:0',
      'inventory-full',
      'harvest:3',
      'add:crop-3:1:normal',
      'inventory-full',
      'harvest:4',
      'add:crop-4:1:normal',
      'log:秋月一早帮你收了2块地的庄稼。'
    ])
    expect(result).toEqual({
      markedAllFed: true,
      helperMessageCount: 1,
      spouseWateredCount: 2,
      spouseCookedItemId: 'food_steamed_bun',
      spouseHarvestedCount: 2
    })
  })

  it('does not consume spouse random rolls when there is no spouse', () => {
    const random = vi.fn(() => 0)
    const markAllFed = vi.fn()

    const result = processMorningAssistanceEndDay({
      spouse: null,
      spouseFedSuccess: true,
      hasFeedHelper: () => false,
      markAllFed,
      processDailyHelpers: () => ({ messages: [], allFed: false }),
      getPlots: () => [],
      waterPlot: vi.fn(),
      harvestPlot: () => ({ cropId: null }),
      isInventoryFull: () => false,
      addItem: vi.fn(),
      getSpouseName: () => '配偶',
      getItemName: () => undefined,
      addLog: vi.fn(),
      random
    })

    expect(markAllFed).toHaveBeenCalledOnce()
    expect(random).not.toHaveBeenCalled()
    expect(result).toEqual({
      markedAllFed: true,
      helperMessageCount: 0,
      spouseWateredCount: 0,
      spouseCookedItemId: null,
      spouseHarvestedCount: 0
    })
  })

  it('checks inventory capacity before rolling or performing spouse harvest', () => {
    const random = vi.fn(() => 1)
    const harvestPlot = vi.fn(() => ({ cropId: 'turnip' }))

    processMorningAssistanceEndDay({
      spouse: { npcId: 'qiu_yue', friendship: 3000 },
      spouseFedSuccess: false,
      hasFeedHelper: () => false,
      markAllFed: vi.fn(),
      processDailyHelpers: () => ({ messages: [], allFed: false }),
      getPlots: () => [{ id: 1, state: 'harvestable', watered: true }],
      waterPlot: vi.fn(),
      harvestPlot,
      isInventoryFull: () => true,
      addItem: vi.fn(),
      getSpouseName: () => '秋月',
      getItemName: () => undefined,
      addLog: vi.fn(),
      random
    })

    expect(random).toHaveBeenCalledTimes(2)
    expect(harvestPlot).not.toHaveBeenCalled()
  })

  it('keeps 100,000-plot spouse assistance within the performance boundary', () => {
    const plots = Array.from({ length: 100_000 }, (_, index) => ({
      id: index,
      state: index % 2 === 0 ? 'planted' : 'harvestable',
      watered: false
    }))
    const start = performance.now()

    const result = processMorningAssistanceEndDay({
      spouse: { npcId: 'qiu_yue', friendship: 3000 },
      spouseFedSuccess: false,
      hasFeedHelper: () => false,
      markAllFed: () => {},
      processDailyHelpers: () => ({ messages: [], allFed: false }),
      getPlots: () => plots,
      waterPlot: () => {},
      harvestPlot: () => ({ cropId: 'turnip' }),
      isInventoryFull: () => false,
      addItem: () => {},
      getSpouseName: () => '秋月',
      getItemName: () => '饭团',
      addLog: () => {},
      random: () => 0
    })
    const elapsed = performance.now() - start

    expect(result.spouseWateredCount).toBe(3)
    expect(result.spouseHarvestedCount).toBe(3)
    expect(elapsed).toBeLessThan(1000)
  })
})
