import { describe, expect, it, vi } from 'vitest'
import { processGreenhouseEndDay } from '@/domain/endDay/greenhouseEndDay'

describe('greenhouse end day processor', () => {
  it('skips updates while the greenhouse is locked', () => {
    const dailyUpdate = vi.fn()

    expect(
      processGreenhouseEndDay({
        greenhouseUnlocked: false,
        dailyUpdate
      })
    ).toEqual({ updated: false })
    expect(dailyUpdate).not.toHaveBeenCalled()
  })

  it('forwards chunk options when the greenhouse is unlocked', () => {
    const dailyUpdate = vi.fn()
    const onChunkComplete = vi.fn()
    const chunkOptions = { chunkSize: 2_000, onChunkComplete }

    expect(
      processGreenhouseEndDay({
        greenhouseUnlocked: true,
        dailyUpdate,
        chunkOptions
      })
    ).toEqual({ updated: true })
    expect(dailyUpdate).toHaveBeenCalledWith(chunkOptions)
  })
})
