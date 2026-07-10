import { describe, expect, it, vi } from 'vitest'
import { forEachEndDayChunk } from '@/domain/endDay/types'

describe('end day chunk iteration', () => {
  it('preserves item order and reports each completed chunk', () => {
    const items = [10, 20, 30, 40, 50]
    const visited: Array<[number, number]> = []
    const progress: Array<{ processed: number; total: number }> = []

    forEachEndDayChunk(
      items,
      (item, index) => {
        visited.push([item, index])
      },
      {
        chunkSize: 2,
        onChunkComplete: value => progress.push(value)
      }
    )

    expect(visited).toEqual([
      [10, 0],
      [20, 1],
      [30, 2],
      [40, 3],
      [50, 4]
    ])
    expect(progress).toEqual([
      { processed: 2, total: 5 },
      { processed: 4, total: 5 },
      { processed: 5, total: 5 }
    ])
  })

  it('does not report progress for an empty collection', () => {
    const processItem = vi.fn()
    const onChunkComplete = vi.fn()

    forEachEndDayChunk([], processItem, { chunkSize: 0, onChunkComplete })

    expect(processItem).not.toHaveBeenCalled()
    expect(onChunkComplete).not.toHaveBeenCalled()
  })

  it('keeps a 100,000-item traversal inexpensive', () => {
    const items = Array.from({ length: 100_000 }, (_, index) => index)
    let total = 0

    const start = performance.now()
    forEachEndDayChunk(items, item => {
      total += item
    }, { chunkSize: 2_000 })
    const elapsed = performance.now() - start

    expect(total).toBe(4_999_950_000)
    expect(elapsed).toBeLessThan(120)
  })
})
