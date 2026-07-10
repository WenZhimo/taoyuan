import { describe, expect, it, vi } from 'vitest'
import {
  processBreedingEndDay,
  processCellarEndDay,
  processToolUpgradeEndDay,
  processWorkshopEndDay
} from '@/domain/endDay/processingEndDay'

describe('workshop end day processor', () => {
  it('keeps empty workshop updates silent', () => {
    const dailyWorkshopUpdate = vi.fn(() => ({ collected: [], readyNames: [] }))

    const result = processWorkshopEndDay({ dailyWorkshopUpdate })

    expect(dailyWorkshopUpdate).toHaveBeenCalledOnce()
    expect(result).toEqual({
      logs: [],
      autoCollectedCount: 0,
      readyCount: 0
    })
  })

  it('summarizes duplicate outputs in first-seen order', () => {
    const result = processWorkshopEndDay({
      dailyWorkshopUpdate: () => ({
        collected: ['蜂蜜', '梦丝', '蜂蜜'],
        readyNames: ['白菜种子', '白菜种子', '桃花酒']
      })
    })

    expect(result).toEqual({
      logs: [
        '工坊自动收取了：蜂蜜x2、梦丝。',
        '加工完成：白菜种子x2、桃花酒，去工坊收取吧。'
      ],
      autoCollectedCount: 3,
      readyCount: 3
    })
  })
})

describe('breeding end day processor', () => {
  it('preserves breeding log order and completion count', () => {
    const dailyBreedingUpdate = vi.fn(() => ({
      logs: ['发现新品种。', '杂交成功。', '育种完成。'],
      completedCount: 2
    }))

    const result = processBreedingEndDay({ dailyBreedingUpdate })

    expect(dailyBreedingUpdate).toHaveBeenCalledOnce()
    expect(result).toEqual({
      logs: ['发现新品种。', '杂交成功。', '育种完成。'],
      completedCount: 2
    })
  })
})

describe('tool upgrade end day processor', () => {
  it('formats completed tool upgrades in returned order', () => {
    const dailyUpgradeUpdate = vi.fn(() => [
      { completed: true as const, toolType: 'hoe' as const, targetTier: 'iron' as const },
      { completed: true as const, toolType: 'axe' as const, targetTier: 'steel' as const }
    ])

    const result = processToolUpgradeEndDay({
      dailyUpgradeUpdate,
      getToolName: toolType => {
        if (toolType === 'hoe') return '锄头'
        if (toolType === 'axe') return '斧头'
        return toolType
      },
      getTierName: tier => {
        if (tier === 'iron') return '铁'
        if (tier === 'steel') return '钢'
        return tier
      }
    })

    expect(dailyUpgradeUpdate).toHaveBeenCalledOnce()
    expect(result).toEqual({
      logs: [
        '小满完成了锄头的升级！现在是铁级。',
        '小满完成了斧头的升级！现在是钢级。'
      ],
      completedCount: 2
    })
  })
})

describe('cellar end day processor', () => {
  it('skips cellar updates before the farmhouse unlock level', () => {
    const dailyCellarUpdate = vi.fn()

    const result = processCellarEndDay({
      farmhouseLevel: 2,
      cellarValuePerCycle: 100,
      dailyCellarUpdate,
      getItemName: itemId => itemId
    })

    expect(dailyCellarUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ logs: [], upgradedCount: 0 })
  })

  it('formats value increases and aged-wine milestones', () => {
    const dailyCellarUpdate = vi.fn(() => ({
      upgraded: [
        { itemId: 'peach_wine', addedValue: 200, upgradeCount: 2 },
        { itemId: 'rice_wine', addedValue: 1_600, upgradeCount: 16 }
      ]
    }))

    const result = processCellarEndDay({
      farmhouseLevel: 3,
      cellarValuePerCycle: 100,
      dailyCellarUpdate,
      getItemName: itemId => ({ peach_wine: '桃花酒', rice_wine: '米酒' })[itemId] ?? itemId
    })

    expect(dailyCellarUpdate).toHaveBeenCalledOnce()
    expect(result).toEqual({
      upgradedCount: 2,
      logs: [
        '酒窖中的桃花酒价值提升了+100文（共+200文）',
        '酒窖中的米酒价值提升了+100文（共+1600文）',
        '米酒已成为陈酿1年！'
      ]
    })
  })

  it('keeps large cellar result batches cheap to format', () => {
    const upgraded = Array.from({ length: 5_000 }, (_, index) => ({
      itemId: `wine_${index}`,
      addedValue: (index + 1) * 100,
      upgradeCount: index + 1
    }))

    const start = performance.now()
    const result = processCellarEndDay({
      farmhouseLevel: 3,
      cellarValuePerCycle: 100,
      dailyCellarUpdate: () => ({ upgraded }),
      getItemName: itemId => itemId
    })
    const elapsed = performance.now() - start

    expect(result.upgradedCount).toBe(5_000)
    expect(result.logs).toHaveLength(5_312)
    expect(elapsed).toBeLessThan(120)
  })
})

describe('processing end day performance', () => {
  it('formats large workshop, breeding, and tool batches without repeated scans', () => {
    const workshopNames = Array.from({ length: 5_000 }, (_, index) => `产物${index % 100}`)
    const breedingLogs = Array.from({ length: 5_000 }, (_, index) => `育种日志${index}`)
    const upgrades = Array.from({ length: 5_000 }, (_, index) => ({
      completed: true as const,
      toolType: (index % 2 === 0 ? 'hoe' : 'axe') as 'hoe' | 'axe',
      targetTier: (index % 2 === 0 ? 'iron' : 'steel') as 'iron' | 'steel'
    }))

    const start = performance.now()
    const workshop = processWorkshopEndDay({
      dailyWorkshopUpdate: () => ({
        collected: workshopNames,
        readyNames: workshopNames
      })
    })
    const breeding = processBreedingEndDay({
      dailyBreedingUpdate: () => ({ logs: breedingLogs, completedCount: breedingLogs.length })
    })
    const toolUpgrades = processToolUpgradeEndDay({
      dailyUpgradeUpdate: () => upgrades,
      getToolName: toolType => toolType,
      getTierName: tier => tier
    })
    const elapsed = performance.now() - start

    expect(workshop.autoCollectedCount).toBe(5_000)
    expect(workshop.readyCount).toBe(5_000)
    expect(breeding.logs).toHaveLength(5_000)
    expect(toolUpgrades.logs).toHaveLength(5_000)
    expect(elapsed).toBeLessThan(150)
  })
})
