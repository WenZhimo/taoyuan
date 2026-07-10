import { describe, expect, it, vi } from 'vitest'
import { processCaveEndDay } from '@/domain/endDay/caveEndDay'

describe('cave end day processor', () => {
  it('does not advance active days when cave has no selected purpose', () => {
    const incrementActiveDays = vi.fn()
    const dailyCaveUpdate = vi.fn(() => [])
    const addItem = vi.fn()

    const result = processCaveEndDay({
      caveChoice: 'none',
      incrementActiveDays,
      dailyCaveUpdate,
      addItem,
      getItemName: itemId => itemId
    })

    expect(incrementActiveDays).not.toHaveBeenCalled()
    expect(dailyCaveUpdate).toHaveBeenCalledOnce()
    expect(addItem).not.toHaveBeenCalled()
    expect(result).toEqual({ logs: [], productCount: 0 })
  })

  it('advances active days, adds cave products, and formats quality logs', () => {
    const incrementActiveDays = vi.fn()
    const dailyCaveUpdate = vi.fn(() => [
      { itemId: 'wild_mushroom', quantity: 1, quality: 'normal' as const },
      { itemId: 'peach', quantity: 2, quality: 'supreme' as const }
    ])
    const addItem = vi.fn()

    const result = processCaveEndDay({
      caveChoice: 'mushroom',
      incrementActiveDays,
      dailyCaveUpdate,
      addItem,
      getItemName: itemId => ({ wild_mushroom: '野蘑菇', peach: '桃子' })[itemId] ?? itemId
    })

    expect(incrementActiveDays).toHaveBeenCalledOnce()
    expect(addItem).toHaveBeenCalledWith('wild_mushroom', 1, 'normal')
    expect(addItem).toHaveBeenCalledWith('peach', 2, 'supreme')
    expect(result).toEqual({
      productCount: 2,
      logs: ['山洞中发现了野蘑菇。', '山洞中发现了2个桃子（极品）。']
    })
  })

  it('keeps large cave product batches cheap to format', () => {
    const products = Array.from({ length: 5_000 }, (_, index) => ({
      itemId: `cave_item_${index}`,
      quantity: (index % 3) + 1,
      quality: 'fine' as const
    }))
    const incrementActiveDays = vi.fn()
    const addItem = vi.fn()

    const start = performance.now()
    const result = processCaveEndDay({
      caveChoice: 'fruit_bat',
      incrementActiveDays,
      dailyCaveUpdate: () => products,
      addItem,
      getItemName: itemId => itemId
    })
    const elapsed = performance.now() - start

    expect(incrementActiveDays).toHaveBeenCalledOnce()
    expect(addItem).toHaveBeenCalledTimes(5_000)
    expect(result.productCount).toBe(5_000)
    expect(result.logs).toHaveLength(5_000)
    expect(elapsed).toBeLessThan(120)
  })
})
