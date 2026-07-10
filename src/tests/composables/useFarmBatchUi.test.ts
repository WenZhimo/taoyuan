import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { useFarmBatchUi } from '@/composables/farm/useFarmBatchUi'

describe('useFarmBatchUi', () => {
  it('runs small batch actions immediately without opening confirmation', () => {
    const batchUi = useFarmBatchUi({ largeBatchLimit: 10 })
    let runs = 0

    const ranImmediately = batchUi.runWithLargeBatchConfirm('test batch action', 10, () => {
      runs++
    })

    expect(ranImmediately).toBe(true)
    expect(runs).toBe(1)
    expect(batchUi.pendingLargeBatch.value).toBeNull()
  })

  it('holds large batch actions until the player confirms', () => {
    const batchUi = useFarmBatchUi({ largeBatchLimit: 10 })
    let runs = 0

    const ranImmediately = batchUi.runWithLargeBatchConfirm('test batch action', 11, () => {
      runs++
    })

    expect(ranImmediately).toBe(false)
    expect(runs).toBe(0)
    expect(batchUi.pendingLargeBatch.value).toMatchObject({
      label: 'test batch action',
      total: 11,
      limit: 10
    })

    void batchUi.confirmLargeBatch()

    expect(runs).toBe(1)
    expect(batchUi.pendingLargeBatch.value).toBeNull()
  })

  it('cancels a pending large batch without running it', () => {
    const batchUi = useFarmBatchUi({ largeBatchLimit: 10 })
    let runs = 0

    batchUi.runWithLargeBatchConfirm('test batch action', 20, () => {
      runs++
    })
    batchUi.cancelLargeBatch()

    expect(runs).toBe(0)
    expect(batchUi.pendingLargeBatch.value).toBeNull()
  })

  it('uses per-call limits when a dialog has its own batch cap', () => {
    const batchUi = useFarmBatchUi({ largeBatchLimit: 10 })

    batchUi.runWithLargeBatchConfirm('greenhouse batch action', 50, () => {}, 40)

    expect(batchUi.pendingLargeBatch.value).toMatchObject({
      label: 'greenhouse batch action',
      total: 50,
      limit: 40
    })
  })

  it('automatically processes every chunk while reporting progress', async () => {
    const batchUi = useFarmBatchUi({ largeBatchLimit: 1_000 })
    const chunks: Array<[number, number]> = []
    const observedProgress: number[] = []

    const result = await batchUi.runChunkedBatch({
      label: 'large planting',
      total: 2_500,
      processChunk: (start, end) => {
        chunks.push([start, end])
        observedProgress.push(batchUi.activeBatchProgress.value?.processed ?? -1)
        return end - start
      }
    })

    expect(chunks).toEqual([
      [0, 1_000],
      [1_000, 2_000],
      [2_000, 2_500]
    ])
    expect(observedProgress).toEqual([0, 1_000, 2_000])
    expect(result).toEqual({ total: 2_500, processed: 2_500, cancelled: false })
    expect(batchUi.activeBatchProgress.value).toBeNull()
  })

  it('stops at the next chunk boundary after cancellation', async () => {
    const batchUi = useFarmBatchUi({ largeBatchLimit: 1_000 })
    let chunks = 0

    const result = await batchUi.runChunkedBatch({
      label: 'cancelled planting',
      total: 5_000,
      processChunk: (start, end) => {
        chunks++
        if (chunks === 1) batchUi.cancelActiveBatch()
        return end - start
      }
    })

    expect(chunks).toBe(1)
    expect(result).toEqual({ total: 5_000, processed: 1_000, cancelled: true })
    expect(batchUi.activeBatchProgress.value).toBeNull()
  })

  it('stops when a chunk cannot process every requested item', async () => {
    const batchUi = useFarmBatchUi({ largeBatchLimit: 1_000 })

    const result = await batchUi.runChunkedBatch({
      label: 'limited stamina',
      total: 5_000,
      processChunk: () => 125
    })

    expect(result).toEqual({ total: 5_000, processed: 125, cancelled: false })
  })

  it('processes 100,000 items automatically within the performance boundary', async () => {
    const batchUi = useFarmBatchUi({ largeBatchLimit: 1_000 })
    let chunks = 0
    const start = performance.now()

    const result = await batchUi.runChunkedBatch({
      label: '100k planting',
      total: 100_000,
      processChunk: (chunkStart, chunkEnd) => {
        chunks++
        return chunkEnd - chunkStart
      }
    })

    expect(chunks).toBe(100)
    expect(result).toEqual({ total: 100_000, processed: 100_000, cancelled: false })
    expect(performance.now() - start).toBeLessThan(3_000)
  })

  it('closes the batch action menu only when no actions remain', async () => {
    const batchUi = useFarmBatchUi()

    batchUi.showBatchActions.value = true
    await batchUi.closeBatchActionsIfDone(() => true)
    expect(batchUi.showBatchActions.value).toBe(true)

    await batchUi.closeBatchActionsIfDone(() => false)
    expect(batchUi.showBatchActions.value).toBe(false)
  })

  it('returns from subdialogs to batch actions only when actions remain', async () => {
    const batchUi = useFarmBatchUi()

    batchUi.showBatchPlant.value = true
    batchUi.showBatchFertilize.value = true

    await batchUi.returnToBatchActionsIfAvailable(() => true)

    expect(batchUi.showBatchPlant.value).toBe(false)
    expect(batchUi.showBatchFertilize.value).toBe(false)
    expect(batchUi.showBatchActions.value).toBe(true)

    batchUi.showBatchPlant.value = true
    await batchUi.returnToBatchActionsIfAvailable(() => false)

    expect(batchUi.showBatchPlant.value).toBe(false)
    expect(batchUi.showBatchActions.value).toBe(false)
  })

  it('keeps repeated modal state transitions cheap', async () => {
    const batchUi = useFarmBatchUi({ largeBatchLimit: 100 })
    const iterations = 10_000
    const start = performance.now()
    let confirmed = 0

    for (let i = 0; i < iterations; i++) {
      batchUi.showBatchPlant.value = i % 2 === 0
      batchUi.showBatchFertilize.value = i % 3 === 0
      batchUi.showBatchActions.value = true
      batchUi.runWithLargeBatchConfirm('perf test', 101, () => {
        confirmed++
      })
      void batchUi.confirmLargeBatch()
      await batchUi.returnToBatchActionsIfAvailable(() => i % 2 === 0)
    }

    await nextTick()

    expect(confirmed).toBe(iterations)
    expect((performance.now() - start) / iterations).toBeLessThan(0.05)
  })
})
