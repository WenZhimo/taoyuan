import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGameClock } from '@/composables/useGameClock'

const gameStore = vi.hoisted(() => ({
  hour: 8,
  midnightWarned: false
}))

vi.mock('@/stores/useGameStore', () => ({
  useGameStore: () => gameStore
}))

vi.mock('@/data/timeConstants', () => ({
  MIDNIGHT_HOUR: 24,
  PASSOUT_HOUR: 26
}))

vi.mock('@/composables/useGameLog', () => ({
  addLog: vi.fn()
}))

vi.mock('@/composables/useEndDay', () => ({
  getResourceSleepOptions: () => null,
  handleSleepOrPassOut: vi.fn()
}))

describe('useGameClock', () => {
  const originalHiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden')

  beforeEach(() => {
    vi.useFakeTimers()
    gameStore.hour = 8
    gameStore.midnightWarned = false
    useGameClock().stopClock()
  })

  afterEach(() => {
    useGameClock().stopClock()
    vi.useRealTimers()

    if (originalHiddenDescriptor) {
      Object.defineProperty(document, 'hidden', originalHiddenDescriptor)
    } else {
      Reflect.deleteProperty(document, 'hidden')
    }
  })

  it('keeps advancing time when the page becomes hidden', () => {
    const clock = useGameClock()
    clock.startClock()

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(clock.isPaused.value).toBe(false)

    vi.advanceTimersByTime(1_000)

    expect(gameStore.hour).toBeGreaterThan(8)
  })
})
