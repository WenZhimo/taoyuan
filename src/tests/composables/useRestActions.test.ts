import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRestActions } from '@/composables/layout/useRestActions'
import { addLog } from '@/composables/useGameLog'

vi.mock('@/composables/useGameLog', () => ({
  addLog: vi.fn()
}))

const flushTimers = async () => {
  await Promise.resolve()
  vi.runAllTimers()
  await Promise.resolve()
}

const createRestActions = (overrides: Partial<Parameters<typeof useRestActions>[0]> = {}) => {
  const isResolvingDay = ref(false)
  const showSleepConfirm = ref(true)
  const showNapConfirm = ref(true)
  const canNap = ref(true)
  const requestedNapMinutes = ref(60)
  const actualNapMinutes = ref(60)
  const resourceSleepOptions = ref<{ wakeLocationGroup?: 'mine' | 'nature' | 'hanhai'; forceRecoveryMode?: 'normal' | 'late' | 'passout' } | null>(null)
  const currentHour = ref(20)
  const currentStamina = ref(50)

  const options: Parameters<typeof useRestActions>[0] = {
    isResolvingDay,
    showSleepConfirm,
    showNapConfirm,
    canNap,
    requestedNapMinutes,
    actualNapMinutes,
    resourceSleepOptions,
    hour: () => currentHour.value,
    stamina: () => currentStamina.value,
    pauseClock: vi.fn(),
    resumeClock: vi.fn(),
    switchToSeasonalBgm: vi.fn(),
    handleEndDay: vi.fn(),
    handleSleepOrPassOut: vi.fn(() => true),
    getResourceSleepOptions: vi.fn(() => null),
    advanceTime: vi.fn(hours => {
      currentHour.value += hours
      return {}
    }),
    calcNapRecovery: vi.fn(() => 12),
    restoreStamina: vi.fn(amount => {
      currentStamina.value += amount
    }),
    ...overrides
  }

  return {
    actions: useRestActions(options),
    currentHour,
    currentStamina,
    isResolvingDay,
    options,
    resourceSleepOptions,
    showNapConfirm,
    showSleepConfirm
  }
}

describe('useRestActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('handles normal sleep behind the resolving-day overlay', async () => {
    const { actions, isResolvingDay, options, showSleepConfirm } = createRestActions()

    const promise = actions.confirmSleep()
    expect(showSleepConfirm.value).toBe(false)
    expect(options.pauseClock).toHaveBeenCalled()
    expect(isResolvingDay.value).toBe(true)

    await flushTimers()
    await promise

    expect(options.handleEndDay).toHaveBeenCalledWith()
    expect(options.switchToSeasonalBgm).toHaveBeenCalled()
    expect(options.resumeClock).toHaveBeenCalled()
    expect(isResolvingDay.value).toBe(false)
  })

  it('keeps resource sleeping bag wake location and normal recovery before midnight', async () => {
    const { actions, options, resourceSleepOptions } = createRestActions()
    resourceSleepOptions.value = { wakeLocationGroup: 'mine', forceRecoveryMode: 'late' }

    const promise = actions.confirmSleep()
    await flushTimers()
    await promise

    expect(addLog).toHaveBeenCalledWith('在矿洞铺开睡袋过夜。')
    expect(options.handleEndDay).toHaveBeenCalledWith({
      wakeLocationGroup: 'mine',
      forceRecoveryMode: 'normal'
    })
  })

  it('prevents naps after the nap boundary', () => {
    const { actions, options, showNapConfirm } = createRestActions({
      canNap: ref(false)
    })

    actions.confirmNap()

    expect(addLog).toHaveBeenCalledWith('现在已经太晚了，不能再小憩。')
    expect(showNapConfirm.value).toBe(false)
    expect(options.advanceTime).not.toHaveBeenCalled()
  })

  it('advances time, restores stamina, and logs successful naps', () => {
    const { actions, options, showNapConfirm } = createRestActions()

    actions.confirmNap()

    expect(showNapConfirm.value).toBe(false)
    expect(options.pauseClock).toHaveBeenCalled()
    expect(options.advanceTime).toHaveBeenCalledWith(1, { ignoreSpeedBuff: true })
    expect(options.calcNapRecovery).toHaveBeenCalledWith(60)
    expect(options.restoreStamina).toHaveBeenCalledWith(12)
    expect(addLog).toHaveBeenCalledWith('小憩醒来，过去了1时，恢复12体力。')
    expect(options.resumeClock).toHaveBeenCalled()
  })

  it('routes passout interruptions through sleep/passout handling', () => {
    const { actions, options } = createRestActions({
      advanceTime: vi.fn(() => ({ passedOut: true, message: '太晚了，你昏倒了。' })),
      calcNapRecovery: vi.fn(() => 0)
    })

    actions.confirmNap()

    expect(addLog).toHaveBeenCalledWith('小憩被打断，过去了0分，恢复0体力。')
    expect(addLog).toHaveBeenCalledWith('太晚了，你昏倒了。')
    expect(options.handleSleepOrPassOut).toHaveBeenCalled()
    expect(options.switchToSeasonalBgm).toHaveBeenCalled()
  })
})
