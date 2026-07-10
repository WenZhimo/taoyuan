import { describe, expect, it, vi } from 'vitest'
import { processFarmPlotEndDay, processFarmTreeEndDay } from '@/domain/endDay/farmEndDay'

describe('farm plot end day processor', () => {
  it('forwards rain and chunk options while preserving pest and weed logs', () => {
    const onChunkComplete = vi.fn()
    const chunkOptions = { chunkSize: 500, onChunkComplete }
    const dailyUpdate = vi.fn(() => ({
      newInfestations: 3,
      pestDeaths: 2,
      newWeeds: 4,
      weedDeaths: 1
    }))

    const result = processFarmPlotEndDay({
      isRainy: true,
      scarecrowCount: 0,
      dailyUpdate,
      chunkOptions
    })

    expect(dailyUpdate).toHaveBeenCalledWith(true, chunkOptions)
    expect(result).toEqual({
      newInfestations: 3,
      pestDeaths: 2,
      newWeeds: 4,
      weedDeaths: 1,
      logs: [
        '虫害来袭！3块地遭到了虫害侵袭。放置稻草人可以降低虫害概率。',
        '2株作物因虫害持续太久而枯死了！及时除虫可以拯救作物。',
        '杂草蔓延！4块地长出了杂草。放置稻草人可以减少杂草。',
        '1株作物被杂草覆盖窒息而死！及时除草可以拯救作物。'
      ]
    })
  })

  it('uses scarecrow-specific guidance and omits zero-count logs', () => {
    const result = processFarmPlotEndDay({
      isRainy: false,
      scarecrowCount: 2,
      dailyUpdate: () => ({
        newInfestations: 1,
        pestDeaths: 0,
        newWeeds: 1,
        weedDeaths: 0
      })
    })

    expect(result.logs).toEqual([
      '虫害来袭！1块地遭到了虫害侵袭。稻草人降低了虫害风险。',
      '杂草蔓延！1块地长出了杂草。稻草人抑制了杂草蔓延。'
    ])
  })
})

describe('farm tree end day processor', () => {
  it('updates fruit trees before wild trees and handles empty results', () => {
    const callOrder: string[] = []
    const dailyFruitTreeUpdate = vi.fn(() => {
      callOrder.push('fruit')
      return { fruits: [] }
    })
    const dailyWildTreeUpdate = vi.fn(() => {
      callOrder.push('wild')
      return { products: [] }
    })
    const addItem = vi.fn()

    const result = processFarmTreeEndDay({
      season: 'spring',
      dailyFruitTreeUpdate,
      dailyWildTreeUpdate,
      addItem
    })

    expect(callOrder).toEqual(['fruit', 'wild'])
    expect(dailyFruitTreeUpdate).toHaveBeenCalledWith('spring')
    expect(addItem).not.toHaveBeenCalled()
    expect(result).toEqual({
      logs: [],
      fruitCount: 0,
      wildTreeProductCount: 0
    })
  })

  it('adds tree products and preserves existing summary logs', () => {
    const addItem = vi.fn()

    const result = processFarmTreeEndDay({
      season: 'autumn',
      dailyFruitTreeUpdate: () => ({
        fruits: [
          { fruitId: 'apple', quality: 'fine' },
          { fruitId: 'pear', quality: 'supreme' }
        ]
      }),
      dailyWildTreeUpdate: () => ({
        products: [
          { treeId: 1, productId: 'pine_resin', productName: '松脂' },
          { treeId: 2, productId: 'camphor_oil', productName: '樟脑油' }
        ]
      }),
      addItem
    })

    expect(addItem).toHaveBeenNthCalledWith(1, 'apple', 1, 'fine')
    expect(addItem).toHaveBeenNthCalledWith(2, 'pear', 1, 'supreme')
    expect(addItem).toHaveBeenNthCalledWith(3, 'pine_resin')
    expect(addItem).toHaveBeenNthCalledWith(4, 'camphor_oil')
    expect(result).toEqual({
      logs: ['果树产出了2个水果。', '采脂器收获了松脂、樟脑油。'],
      fruitCount: 2,
      wildTreeProductCount: 2
    })
  })

  it('keeps large tree product batches cheap to process', () => {
    const fruits = Array.from({ length: 5_000 }, (_, index) => ({
      fruitId: `fruit_${index}`,
      quality: 'excellent' as const
    }))
    const products = Array.from({ length: 5_000 }, (_, index) => ({
      treeId: index,
      productId: `tree_product_${index}`,
      productName: `树产物${index}`
    }))
    const addItem = vi.fn()

    const start = performance.now()
    const result = processFarmTreeEndDay({
      season: 'summer',
      dailyFruitTreeUpdate: () => ({ fruits }),
      dailyWildTreeUpdate: () => ({ products }),
      addItem
    })
    const elapsed = performance.now() - start

    expect(addItem).toHaveBeenCalledTimes(10_000)
    expect(result.fruitCount).toBe(5_000)
    expect(result.wildTreeProductCount).toBe(5_000)
    expect(result.logs).toHaveLength(2)
    expect(elapsed).toBeLessThan(120)
  })
})
