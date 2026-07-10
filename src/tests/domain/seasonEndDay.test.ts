import { describe, expect, it, vi } from 'vitest'
import { processSeasonChangeEndDay } from '@/domain/endDay/seasonEndDay'

describe('season change end day processor', () => {
  it('preserves farm, logs, fruit tree, fertilizer, and tutorial order', () => {
    const order: string[] = []

    const result = processSeasonChangeEndDay({
      seasonChanged: true,
      oldSeason: 'winter',
      newSeason: 'spring',
      farmMapType: 'standard',
      getFarmingLevel: () => {
        order.push('farming-level')
        return 8
      },
      onSeasonChange: season => {
        order.push(`farm:${season}`)
        return { witheredCount: 2, reclaimedCount: 3 }
      },
      getSeasonName: season => {
        order.push(`season-name:${season}`)
        return season === 'winter' ? '冬' : '春'
      },
      fruitTreeSeasonUpdate: newYear => order.push(`fruit-tree:${newYear}`),
      applyFertileSoil: level => {
        order.push(`fertilize:${level}`)
        return { count: 4, fertilizerName: '高级生长激素' }
      },
      setTutorialFlag: key => order.push(`flag:${key}`),
      addLog: message => order.push(`log:${message}`)
    })

    expect(order).toEqual([
      'farm:spring',
      'season-name:winter',
      'season-name:spring',
      'log:—— 季节更替：冬→春 ——',
      'log:2株不适应新季节的作物枯萎了……',
      'log:3块荒废的耕地被杂草覆盖了。',
      'log:新的一年开始了！农场经过一冬有些荒废，需要重新开垦。',
      'fruit-tree:true',
      'farming-level',
      'fertilize:8',
      'log:桃源沃土滋养大地，4块耕地获得了高级生长激素。',
      'flag:justChangedSeason'
    ])
    expect(result).toEqual({
      processed: true,
      witheredCount: 2,
      reclaimedCount: 3,
      fertilizedCount: 4
    })
  })

  it('skips every callback when the season did not change', () => {
    const onSeasonChange = vi.fn(() => ({ witheredCount: 0, reclaimedCount: 0 }))
    const getSeasonName = vi.fn((season: string) => season)
    const fruitTreeSeasonUpdate = vi.fn()
    const applyFertileSoil = vi.fn(() => ({ count: 0, fertilizerName: '肥料' }))
    const getFarmingLevel = vi.fn(() => 1)
    const setTutorialFlag = vi.fn()
    const addLog = vi.fn()

    const result = processSeasonChangeEndDay({
      seasonChanged: false,
      oldSeason: 'spring',
      newSeason: 'spring',
      farmMapType: 'standard',
      getFarmingLevel,
      onSeasonChange,
      getSeasonName,
      fruitTreeSeasonUpdate,
      applyFertileSoil,
      setTutorialFlag,
      addLog
    })

    expect(result).toEqual({
      processed: false,
      witheredCount: 0,
      reclaimedCount: 0,
      fertilizedCount: 0
    })
    expect(onSeasonChange).not.toHaveBeenCalled()
    expect(getSeasonName).not.toHaveBeenCalled()
    expect(fruitTreeSeasonUpdate).not.toHaveBeenCalled()
    expect(getFarmingLevel).not.toHaveBeenCalled()
    expect(applyFertileSoil).not.toHaveBeenCalled()
    expect(setTutorialFlag).not.toHaveBeenCalled()
    expect(addLog).not.toHaveBeenCalled()
  })

  it('skips standard-farm fertilizer while preserving fruit-tree and tutorial updates', () => {
    const order: string[] = []
    const applyFertileSoil = vi.fn(() => ({ count: 5, fertilizerName: '基础肥料' }))
    const getFarmingLevel = vi.fn(() => 3)

    const result = processSeasonChangeEndDay({
      seasonChanged: true,
      oldSeason: 'spring',
      newSeason: 'summer',
      farmMapType: 'wilderness',
      getFarmingLevel,
      onSeasonChange: () => ({ witheredCount: 0, reclaimedCount: 0 }),
      getSeasonName: season => season,
      fruitTreeSeasonUpdate: newYear => order.push(`fruit-tree:${newYear}`),
      applyFertileSoil,
      setTutorialFlag: key => order.push(`flag:${key}`),
      addLog: message => order.push(`log:${message}`)
    })

    expect(order).toEqual([
      'log:—— 季节更替：spring→summer ——',
      'fruit-tree:false',
      'flag:justChangedSeason'
    ])
    expect(getFarmingLevel).not.toHaveBeenCalled()
    expect(applyFertileSoil).not.toHaveBeenCalled()
    expect(result).toEqual({
      processed: true,
      witheredCount: 0,
      reclaimedCount: 0,
      fertilizedCount: 0
    })
  })

  it('keeps repeated season orchestration within the performance boundary', () => {
    const start = performance.now()
    let completed = 0

    for (let index = 0; index < 10_000; index++) {
      const result = processSeasonChangeEndDay({
        seasonChanged: true,
        oldSeason: 'spring',
        newSeason: 'summer',
        farmMapType: 'hills',
        getFarmingLevel: () => 1,
        onSeasonChange: () => ({ witheredCount: 0, reclaimedCount: 0 }),
        getSeasonName: season => season,
        fruitTreeSeasonUpdate: () => {},
        applyFertileSoil: () => ({ count: 0, fertilizerName: '肥料' }),
        setTutorialFlag: () => {},
        addLog: () => {}
      })
      if (result.processed) completed++
    }
    const elapsed = performance.now() - start

    expect(completed).toBe(10_000)
    expect(elapsed).toBeLessThan(500)
  })
})
