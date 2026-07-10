export interface EndDayChunkProgress {
  processed: number
  total: number
}

export interface EndDayChunkOptions {
  chunkSize?: number
  onChunkComplete?: (progress: EndDayChunkProgress) => void
}

const getChunkSize = (total: number, requestedSize?: number): number => {
  if (requestedSize === undefined || !Number.isFinite(requestedSize)) {
    return Math.max(1, total)
  }
  return Math.max(1, Math.floor(requestedSize))
}

export function forEachEndDayChunk<T>(
  items: readonly T[],
  processItem: (item: T, index: number) => void,
  options: EndDayChunkOptions = {}
): void {
  const total = items.length
  const chunkSize = getChunkSize(total, options.chunkSize)

  for (let start = 0; start < total; start += chunkSize) {
    const end = Math.min(start + chunkSize, total)
    for (let index = start; index < end; index++) {
      processItem(items[index]!, index)
    }
    options.onChunkComplete?.({ processed: end, total })
  }
}
