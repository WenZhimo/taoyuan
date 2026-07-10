import { nextTick, ref } from 'vue'
import { FARM_BATCH_LIMIT, shouldConfirmLargeBatch } from '@/domain/farm/batchLimits'

export interface BatchProgress {
  label: string
  total: number
  processed: number
  cancelRequested: boolean
}

export interface ChunkedBatchOptions {
  label: string
  total: number
  chunkSize?: number
  processChunk: (start: number, end: number) => number | Promise<number>
}

export interface ChunkedBatchResult {
  total: number
  processed: number
  cancelled: boolean
}

export interface PendingLargeBatch {
  label: string
  total: number
  limit: number
  run: () => void | Promise<void>
}

export interface UseFarmBatchUiOptions {
  largeBatchLimit?: number
}

export const useFarmBatchUi = (options: UseFarmBatchUiOptions = {}) => {
  const largeBatchLimit = options.largeBatchLimit ?? FARM_BATCH_LIMIT

  const showBatchPlant = ref(false)
  const showBatchFertilize = ref(false)
  const showBatchActions = ref(false)
  const pendingLargeBatch = ref<PendingLargeBatch | null>(null)
  const activeBatchProgress = ref<BatchProgress | null>(null)

  const yieldToMainThread = async () => {
    await nextTick()
    await new Promise<void>(resolve => window.setTimeout(resolve, 0))
  }

  const runWithLargeBatchConfirm = (
    label: string,
    total: number,
    run: () => void | Promise<void>,
    limit = largeBatchLimit
  ): boolean => {
    if (shouldConfirmLargeBatch(total, limit)) {
      pendingLargeBatch.value = { label, total, limit, run }
      return false
    }
    void run()
    return true
  }

  const confirmLargeBatch = () => {
    const run = pendingLargeBatch.value?.run
    pendingLargeBatch.value = null
    return run?.()
  }

  const cancelLargeBatch = () => {
    pendingLargeBatch.value = null
  }

  const cancelActiveBatch = () => {
    if (activeBatchProgress.value) {
      activeBatchProgress.value.cancelRequested = true
    }
  }

  const runChunkedBatch = async ({
    label,
    total,
    chunkSize = largeBatchLimit,
    processChunk
  }: ChunkedBatchOptions): Promise<ChunkedBatchResult> => {
    const safeTotal = Math.max(0, Math.floor(total))
    const safeChunkSize = Math.max(1, Math.floor(chunkSize))
    const showProgress = safeTotal > safeChunkSize
    let processed = 0

    if (showProgress) {
      activeBatchProgress.value = {
        label,
        total: safeTotal,
        processed: 0,
        cancelRequested: false
      }
      await yieldToMainThread()
    }

    try {
      while (processed < safeTotal) {
        if (activeBatchProgress.value?.cancelRequested) break

        const end = Math.min(processed + safeChunkSize, safeTotal)
        const requested = end - processed
        const completed = Math.min(requested, Math.max(0, Math.floor(await processChunk(processed, end))))
        processed += completed

        if (activeBatchProgress.value) {
          activeBatchProgress.value.processed = processed
        }

        if (completed < requested) break
        if (processed < safeTotal && showProgress) {
          await yieldToMainThread()
        }
      }

      return {
        total: safeTotal,
        processed,
        cancelled: activeBatchProgress.value?.cancelRequested ?? false
      }
    } finally {
      activeBatchProgress.value = null
    }
  }

  const closeBatchDialogs = () => {
    showBatchPlant.value = false
    showBatchFertilize.value = false
    showBatchActions.value = false
  }

  const closeBatchActionsIfDone = async (hasAvailableBatchAction: () => boolean) => {
    await nextTick()
    if (!hasAvailableBatchAction()) {
      showBatchActions.value = false
    }
  }

  const returnToBatchActionsIfAvailable = async (hasAvailableBatchAction: () => boolean) => {
    showBatchPlant.value = false
    showBatchFertilize.value = false
    await nextTick()
    showBatchActions.value = hasAvailableBatchAction()
  }

  return {
    activeBatchProgress,
    cancelActiveBatch,
    cancelLargeBatch,
    closeBatchActionsIfDone,
    closeBatchDialogs,
    confirmLargeBatch,
    pendingLargeBatch,
    returnToBatchActionsIfAvailable,
    runChunkedBatch,
    runWithLargeBatchConfirm,
    showBatchActions,
    showBatchFertilize,
    showBatchPlant
  }
}
