import { describe, expect, it, vi } from 'vitest'
import { processFishPondEndDay } from '@/domain/endDay/fishPondEndDay'

describe('fish pond end day processor', () => {
  it('skips fish pond work when the pond is not built', () => {
    const dailyUpdate = vi.fn()
    const addItem = vi.fn()

    const result = processFishPondEndDay({
      pondBuilt: false,
      dailyUpdate,
      addItem
    })

    expect(result).toEqual({ logs: [], productCount: 0 })
    expect(dailyUpdate).not.toHaveBeenCalled()
    expect(addItem).not.toHaveBeenCalled()
  })

  it('adds products and formats existing daily result messages', () => {
    const dailyUpdate = vi.fn(() => ({
      products: [
        { itemId: 'carp', quality: 'normal' as const },
        { itemId: 'roe', quality: 'fine' as const }
      ],
      died: ['鲤鱼'],
      gotSick: ['草鱼'],
      healed: [],
      bred: ['锦鲤'],
      reproduced: [{ fishId: 'crucian', name: '鲫鱼', quantity: 3 }],
      breedingFailed: ['亲本不足']
    }))
    const addItem = vi.fn()

    const result = processFishPondEndDay({
      pondBuilt: true,
      dailyUpdate,
      addItem
    })

    expect(addItem).toHaveBeenCalledWith('carp', 1, 'normal')
    expect(addItem).toHaveBeenCalledWith('roe', 1, 'fine')
    expect(result.productCount).toBe(2)
    expect(result.logs).toEqual([
      '鱼塘产出了2件水产品。',
      '鲤鱼因病重不治而死亡了……',
      '草鱼生病了！请及时治疗。',
      '育苗塘繁殖成功，新的锦鲤出生了！',
      '繁衍塘自然繁衍出3条鲫鱼。',
      '亲本不足。'
    ])
  })

  it('keeps repeated result formatting cheap for large daily batches', () => {
    const dailyUpdate = vi.fn(() => ({
      products: Array.from({ length: 5_000 }, (_, index) => ({
        itemId: `fish_${index}`,
        quality: 'normal' as const
      })),
      died: [],
      gotSick: [],
      healed: [],
      bred: [],
      reproduced: Array.from({ length: 500 }, (_, index) => ({
        fishId: `fish_${index}`,
        name: `鱼${index}`,
        quantity: index + 1
      })),
      breedingFailed: []
    }))
    const addItem = vi.fn()

    const start = performance.now()
    const result = processFishPondEndDay({
      pondBuilt: true,
      dailyUpdate,
      addItem
    })
    const elapsed = performance.now() - start

    expect(addItem).toHaveBeenCalledTimes(5_000)
    expect(result.productCount).toBe(5_000)
    expect(result.logs).toHaveLength(501)
    expect(elapsed).toBeLessThan(120)
  })
})
