import { describe, expect, it, vi } from 'vitest'
import {
  processAnimalIncubatorsEndDay,
  processAnimalProductionEndDay,
  processPetEndDay
} from '@/domain/endDay/animalEndDay'

describe('animal production end day processor', () => {
  it('handles an empty daily result without inventory or logs', () => {
    const addItem = vi.fn()

    const result = processAnimalProductionEndDay({
      dailyUpdate: () => ({ products: [], died: [], gotSick: [], healed: [] }),
      addItem
    })

    expect(addItem).not.toHaveBeenCalled()
    expect(result).toEqual({ logs: [], productCount: 0 })
  })

  it('adds products and preserves all animal summary logs', () => {
    const addItem = vi.fn()

    const result = processAnimalProductionEndDay({
      dailyUpdate: () => ({
        products: [
          { itemId: 'egg', quality: 'fine' },
          { itemId: 'milk', quality: 'supreme' }
        ],
        died: ['小鸡'],
        gotSick: ['奶牛'],
        healed: ['山羊']
      }),
      addItem
    })

    expect(addItem).toHaveBeenNthCalledWith(1, 'egg', 1, 'fine')
    expect(addItem).toHaveBeenNthCalledWith(2, 'milk', 1, 'supreme')
    expect(result).toEqual({
      productCount: 2,
      logs: [
        '动物们产出了2件产品。',
        '小鸡因长期饥饿或病重不治而死亡了……',
        '奶牛因饥饿而生病了！请尽快喂食。',
        '山羊吃饱后恢复了健康。'
      ]
    })
  })

  it('keeps large animal result batches cheap to process', () => {
    const addItem = vi.fn()
    const products = Array.from({ length: 5_000 }, (_, index) => ({
      itemId: `animal_product_${index}`,
      quality: 'normal' as const
    }))
    const names = Array.from({ length: 500 }, (_, index) => `动物${index}`)

    const start = performance.now()
    const result = processAnimalProductionEndDay({
      dailyUpdate: () => ({
        products,
        died: names,
        gotSick: names,
        healed: names
      }),
      addItem
    })
    const elapsed = performance.now() - start

    expect(addItem).toHaveBeenCalledTimes(5_000)
    expect(result.productCount).toBe(5_000)
    expect(result.logs).toHaveLength(4)
    expect(elapsed).toBeLessThan(120)
  })
})

describe('animal incubator end day processor', () => {
  it('updates the coop incubator before the barn incubator', () => {
    const callOrder: string[] = []

    const result = processAnimalIncubatorsEndDay({
      dailyIncubatorUpdate: () => {
        callOrder.push('coop')
        return { hatched: { name: '小鸡1' } }
      },
      dailyBarnIncubatorUpdate: () => {
        callOrder.push('barn')
        return { hatched: { name: '小牛1' } }
      }
    })

    expect(callOrder).toEqual(['coop', 'barn'])
    expect(result).toEqual({
      hatchedCount: 2,
      logs: ['鸡舍孵化器中的蛋孵出了一只小鸡1！', '牲口棚孵化器中的蛋孵出了一只小牛1！']
    })
  })

  it('omits logs when neither incubator hatches an animal', () => {
    expect(
      processAnimalIncubatorsEndDay({
        dailyIncubatorUpdate: () => ({}),
        dailyBarnIncubatorUpdate: () => ({})
      })
    ).toEqual({ logs: [], hatchedCount: 0 })
  })
})

describe('pet end day processor', () => {
  it('formats found items with the current pet and item names', () => {
    expect(
      processPetEndDay({
        dailyPetUpdate: () => ({ item: 'wild_berry' }),
        getPetName: () => '团子',
        getItemName: itemId => (itemId === 'wild_berry' ? '野莓' : itemId)
      })
    ).toEqual({
      logs: ['团子叼回来一个野莓。'],
      foundItemId: 'wild_berry'
    })
  })

  it('returns no log when the pet finds nothing', () => {
    const getPetName = vi.fn()
    const getItemName = vi.fn()

    expect(
      processPetEndDay({
        dailyPetUpdate: () => ({}),
        getPetName,
        getItemName
      })
    ).toEqual({ logs: [], foundItemId: null })
    expect(getPetName).not.toHaveBeenCalled()
    expect(getItemName).not.toHaveBeenCalled()
  })
})
