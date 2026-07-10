import { describe, expect, it, vi } from 'vitest'
import { processFarmMapEndDay } from '@/domain/endDay/farmMapEndDay'
import type { FarmMapEndDayInput } from '@/domain/endDay/farmMapEndDay'

const createInput = (
  overrides: Partial<FarmMapEndDayInput> = {}
): FarmMapEndDayInput => ({
  farmMapType: 'standard',
  year: 1,
  isRainy: false,
  getCombatLevel: () => 0,
  addSkillExp: () => {},
  rollForageQuality: () => 'normal',
  addItem: () => {},
  takeDamage: () => {},
  getPlots: () => [],
  removeCrop: () => {},
  getCropName: cropId => cropId,
  getItemName: itemId => itemId,
  getForageItems: () => [],
  getSeasonFish: () => [],
  hasSurfaceOrePatch: () => false,
  setSurfaceOrePatch: () => {},
  getCreekCatch: () => [],
  setCreekCatch: () => {},
  addLog: () => {},
  random: () => 1,
  ...overrides
})

describe('farm map end day processor', () => {
  it('preserves wilderness reward and successful encounter random order', () => {
    const order: string[] = []
    const randomValues = [0, 0.9, 0.1, 0.1, 0.6, 0.9]
    let randomIndex = 0

    const result = processFarmMapEndDay(
      createInput({
        farmMapType: 'wilderness',
        getCombatLevel: () => {
          order.push('combat-level')
          return 0
        },
        addSkillExp: (skill, amount) => order.push(`exp:${skill}:${amount}`),
        addItem: (itemId, quantity) => order.push(`item:${itemId}:${quantity}`),
        getItemName: itemId => {
          order.push(`name:${itemId}`)
          return itemId === 'copper_ore' ? '铜矿石' : '翡翠'
        },
        addLog: message => order.push(`log:${message}`),
        random: () => {
          const value = randomValues[randomIndex++]!
          order.push(`random:${value}`)
          return value
        }
      })
    )

    expect(order).toEqual([
      'random:0',
      'random:0.9',
      'item:copper_ore:3',
      'name:copper_ore',
      'log:荒野中发现了3个铜矿石。',
      'random:0.1',
      'combat-level',
      'random:0.1',
      'random:0.6',
      'random:0.9',
      'item:jade:2',
      'exp:combat:15',
      'name:jade',
      'log:夜间有野兽入侵！你奋力击退了它，缴获了2个翡翠。'
    ])
    expect(result.wildernessEncounter).toBe('win')
  })

  it('preserves wilderness loss damage, crop selection, and removal order', () => {
    const order: string[] = []
    const randomValues = [0, 0, 0, 0.9, 0.5, 0.75]
    let randomIndex = 0

    const result = processFarmMapEndDay(
      createInput({
        farmMapType: 'wilderness',
        getPlots: () => {
          order.push('plots')
          return [
            { id: 1, state: 'tilled', cropId: null },
            { id: 2, state: 'growing', cropId: 'cabbage' },
            { id: 3, state: 'harvestable', cropId: 'turnip' }
          ]
        },
        takeDamage: amount => order.push(`damage:${amount}`),
        getCropName: cropId => {
          order.push(`crop:${cropId}`)
          return cropId === 'turnip' ? '萝卜' : cropId
        },
        removeCrop: plotId => order.push(`remove:${plotId}`),
        addLog: message => order.push(`log:${message}`),
        random: () => {
          const value = randomValues[randomIndex++]!
          order.push(`random:${value}`)
          return value
        }
      })
    )

    expect(order.slice(-6)).toEqual([
      'damage:10',
      'plots',
      'random:0.75',
      'crop:turnip',
      'remove:3',
      'log:夜间有野兽入侵！你没能挡住它，受了10点伤，一株萝卜被破坏了。'
    ])
    expect(result.wildernessEncounter).toBe('loss')
  })

  it('preserves forest gathering count, quality, experience, and log order', () => {
    const order: string[] = []
    const randomValues = [0.1, 0, 0.9]
    let randomIndex = 0

    const result = processFarmMapEndDay(
      createInput({
        farmMapType: 'forest',
        getForageItems: () => [
          { itemId: 'herb', chance: 0.2, expReward: 3 },
          { itemId: 'rare', chance: 0.05, expReward: 20 },
          { itemId: 'bamboo', chance: 0.3, expReward: 4 }
        ],
        rollForageQuality: () => {
          order.push('quality')
          return 'fine'
        },
        addItem: (itemId, quantity, quality) =>
          order.push(`item:${itemId}:${quantity}:${quality}`),
        addSkillExp: (skill, amount) => order.push(`exp:${skill}:${amount}`),
        getItemName: itemId => {
          order.push(`name:${itemId}`)
          return itemId === 'herb' ? '药草' : '竹子'
        },
        addLog: message => order.push(`log:${message}`),
        random: () => {
          const value = randomValues[randomIndex++]!
          order.push(`random:${value}`)
          return value
        }
      })
    )

    expect(order).toEqual([
      'random:0.1',
      'random:0',
      'quality',
      'item:herb:1:fine',
      'exp:foraging:3',
      'name:herb',
      'random:0.9',
      'quality',
      'item:bamboo:1:fine',
      'exp:foraging:4',
      'name:bamboo',
      'log:竹林间发现了药草和竹子。'
    ])
    expect(result.forestGatheredCount).toBe(2)
  })

  it('preserves hilltop patch generation and river catch capping', () => {
    const patch = vi.fn()
    const riverCatch = vi.fn()

    const hilltopResult = processFarmMapEndDay(
      createInput({
        farmMapType: 'hilltop',
        year: 2,
        setSurfaceOrePatch: patch,
        getItemName: () => '金矿石',
        random: vi.fn()
          .mockReturnValueOnce(0.1)
          .mockReturnValueOnce(0.9)
          .mockReturnValueOnce(0.9)
      })
    )
    expect(patch).toHaveBeenCalledWith({ oreId: 'gold_ore', quantity: 5 })
    expect(hilltopResult.hilltopOreGenerated).toBe(true)

    const existing = Array.from({ length: 9 }, (_, index) => ({
      fishId: `old-${index}`,
      quality: 'normal' as const
    }))
    const riverResult = processFarmMapEndDay(
      createInput({
        farmMapType: 'riverland',
        isRainy: true,
        getSeasonFish: () => [{ id: 'carp' }],
        getCreekCatch: () => existing,
        setCreekCatch: riverCatch,
        random: () => 0
      })
    )
    expect(riverCatch).toHaveBeenCalledWith([
      ...existing,
      { fishId: 'carp', quality: 'fine' }
    ])
    expect(riverResult.riverCatchGenerated).toBe(2)
  })

  it('does not consume random values for maps without a daily special effect', () => {
    const random = vi.fn(() => 0)

    const result = processFarmMapEndDay(createInput({ farmMapType: 'standard', random }))

    expect(random).not.toHaveBeenCalled()
    expect(result).toEqual({
      wildernessEncounter: 'none',
      forestGatheredCount: 0,
      hilltopOreGenerated: false,
      riverCatchGenerated: 0
    })
  })

  it('filters 100,000 wilderness crops within the performance boundary', () => {
    const plots = Array.from({ length: 100_000 }, (_, index) => ({
      id: index,
      state: index % 2 === 0 ? 'growing' : 'tilled',
      cropId: index % 2 === 0 ? 'cabbage' : null
    }))
    const randomValues = [0, 0, 0, 1, 0, 0]
    let randomIndex = 0
    const start = performance.now()

    const result = processFarmMapEndDay(
      createInput({
        farmMapType: 'wilderness',
        getPlots: () => plots,
        random: () => randomValues[randomIndex++]!
      })
    )
    const elapsed = performance.now() - start

    expect(result.wildernessEncounter).toBe('loss')
    expect(elapsed).toBeLessThan(1000)
  })
})
