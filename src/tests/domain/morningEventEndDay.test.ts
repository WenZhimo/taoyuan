import { describe, expect, it, vi } from 'vitest'
import { processMorningRandomEventEndDay } from '@/domain/endDay/morningEventEndDay'

const createBaseInput = () => ({
  narrations: [{ message: '有人来过。' }],
  noLossNarrations: [{ message: '昨夜很安静。' }],
  choiceEvents: [{ id: 'choice' }],
  easterEggs: [{ message: '彩蛋。' }],
  getPlots: () => [],
  getNpcStates: () => [],
  getCropName: (cropId: string) => cropId,
  addItem: () => {},
  earnMoney: () => {},
  showChoiceEvent: () => {},
  addLog: () => {}
})

describe('morning random event end day processor', () => {
  it('uses one random roll when no event occurs', () => {
    const random = vi.fn(() => 0.5)
    const getPlots = vi.fn(() => [])

    const result = processMorningRandomEventEndDay({
      ...createBaseInput(),
      getPlots,
      random
    })

    expect(result).toEqual({ eventType: 'none', effectApplied: false })
    expect(random).toHaveBeenCalledOnce()
    expect(getPlots).not.toHaveBeenCalled()
  })

  it('preserves choice-event selection without applying effects', () => {
    const order: string[] = []
    const randomValues = [0.005, 0]
    let randomIndex = 0

    const result = processMorningRandomEventEndDay({
      ...createBaseInput(),
      showChoiceEvent: event => order.push(`choice:${event.id}`),
      addLog: message => order.push(`log:${message}`),
      random: () => {
        const value = randomValues[randomIndex++]!
        order.push(`random:${value}`)
        return value
      }
    })

    expect(order).toEqual(['random:0.005', 'random:0', 'choice:choice'])
    expect(result).toEqual({ eventType: 'choice', effectApplied: false })
  })

  it('logs narration before selecting and clearing a damaged crop', () => {
    const order: string[] = []
    const plots = [
      {
        state: 'growing',
        cropId: 'cabbage',
        growthDays: 3,
        watered: true,
        harvestCount: 1,
        seedGenetics: { generation: 2 }
      },
      {
        state: 'harvestable',
        cropId: 'turnip',
        growthDays: 5,
        watered: true,
        harvestCount: 2,
        seedGenetics: null
      }
    ]
    const randomValues = [0.02, 0, 0.9]
    let randomIndex = 0

    const result = processMorningRandomEventEndDay({
      ...createBaseInput(),
      narrations: [{ message: '昨夜有人踩进了田里。', effect: { type: 'loseCrop' } }],
      getPlots: () => {
        order.push('plots')
        return plots
      },
      getCropName: cropId => {
        order.push(`crop:${cropId}`)
        return '萝卜'
      },
      addLog: message => order.push(`log:${message}`),
      random: () => {
        const value = randomValues[randomIndex++]!
        order.push(`random:${value}`)
        return value
      }
    })

    expect(order).toEqual([
      'random:0.02',
      'plots',
      'random:0',
      'log:昨夜有人踩进了田里。',
      'plots',
      'random:0.9',
      'crop:turnip',
      'log:一株萝卜被糟蹋了。'
    ])
    expect(plots[1]).toEqual({
      state: 'tilled',
      cropId: null,
      growthDays: 0,
      watered: false,
      harvestCount: 0,
      seedGenetics: null
    })
    expect(result).toEqual({ eventType: 'narration', effectApplied: true })
  })

  it('applies easter-egg friendship effects after logging', () => {
    const order: string[] = []
    const npcStates = [{ friendship: 10 }, { friendship: 20 }]

    const result = processMorningRandomEventEndDay({
      ...createBaseInput(),
      easterEggs: [
        {
          message: '桃花精灵来访。',
          effect: { type: 'gainFriendship', amount: 3 }
        }
      ],
      getNpcStates: () => {
        order.push('npc-states')
        return npcStates
      },
      addLog: message => order.push(`log:${message}`),
      random: vi.fn().mockReturnValueOnce(0.001).mockReturnValueOnce(0)
    })

    expect(order).toEqual(['log:桃花精灵来访。', 'npc-states'])
    expect(npcStates).toEqual([{ friendship: 13 }, { friendship: 23 }])
    expect(result).toEqual({ eventType: 'easter', effectApplied: true })
  })

  it('filters 100,000 crops within the performance boundary', () => {
    const plots = Array.from({ length: 100_000 }, (_, index) => ({
      state: index % 2 === 0 ? 'growing' : 'tilled',
      cropId: index % 2 === 0 ? 'cabbage' : null,
      growthDays: 1,
      watered: false,
      harvestCount: 0,
      seedGenetics: null
    }))
    const randomValues = [0.02, 0, 0]
    let randomIndex = 0
    const start = performance.now()

    const result = processMorningRandomEventEndDay({
      ...createBaseInput(),
      narrations: [{ message: '事件', effect: { type: 'loseCrop' } }],
      getPlots: () => plots,
      random: () => randomValues[randomIndex++]!
    })
    const elapsed = performance.now() - start

    expect(result.effectApplied).toBe(true)
    expect(elapsed).toBeLessThan(1000)
  })
})
