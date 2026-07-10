import type { EndDayChunkOptions } from './types'

export interface GreenhouseEndDayInput {
  greenhouseUnlocked: boolean
  dailyUpdate: (chunkOptions?: EndDayChunkOptions) => void
  chunkOptions?: EndDayChunkOptions
}

export interface GreenhouseEndDayResult {
  updated: boolean
}

export function processGreenhouseEndDay({
  greenhouseUnlocked,
  dailyUpdate,
  chunkOptions
}: GreenhouseEndDayInput): GreenhouseEndDayResult {
  if (!greenhouseUnlocked) {
    return { updated: false }
  }

  dailyUpdate(chunkOptions)
  return { updated: true }
}
