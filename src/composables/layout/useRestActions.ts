import type { Ref } from 'vue'
import { nextTick } from 'vue'
import { getLocationGroupName } from '@/data/timeConstants'
import { addLog } from '@/composables/useGameLog'
import { formatNapDuration } from '@/composables/layout/useSleepFlow'
import type { LocationGroup } from '@/types'

interface SleepOptions {
  wakeLocationGroup?: LocationGroup
  forceRecoveryMode?: 'normal' | 'late' | 'passout'
}

interface AdvanceTimeResult {
  message?: string
  passedOut?: boolean
}

interface UseRestActionsOptions {
  isResolvingDay: Ref<boolean>
  showSleepConfirm: Ref<boolean>
  showNapConfirm: Ref<boolean>
  canNap: Ref<boolean>
  requestedNapMinutes: Ref<number>
  actualNapMinutes: Ref<number>
  resourceSleepOptions: Ref<SleepOptions | null>
  hour: () => number
  stamina: () => number
  pauseClock: () => void
  resumeClock: () => void
  switchToSeasonalBgm: () => void
  handleEndDay: (options?: SleepOptions) => void
  handleSleepOrPassOut: () => boolean
  getResourceSleepOptions: () => SleepOptions | null
  advanceTime: (hours: number, options?: { ignoreSpeedBuff?: boolean }) => AdvanceTimeResult
  calcNapRecovery: (minutes: number) => number
  restoreStamina: (amount: number) => void
}

export const useRestActions = ({
  isResolvingDay,
  showSleepConfirm,
  showNapConfirm,
  canNap,
  requestedNapMinutes,
  actualNapMinutes,
  resourceSleepOptions,
  hour,
  stamina,
  pauseClock,
  resumeClock,
  switchToSeasonalBgm,
  handleEndDay,
  handleSleepOrPassOut,
  getResourceSleepOptions,
  advanceTime,
  calcNapRecovery,
  restoreStamina
}: UseRestActionsOptions) => {
  const runEndDayWithBusyOverlay = async (run: () => void) => {
    isResolvingDay.value = true
    await nextTick()
    await new Promise(resolve => window.setTimeout(resolve, 0))
    try {
      run()
    } finally {
      isResolvingDay.value = false
    }
  }

  const confirmSleep = async () => {
    const sleepOptions = resourceSleepOptions.value
    showSleepConfirm.value = false
    pauseClock()
    await runEndDayWithBusyOverlay(() => {
      if (sleepOptions?.wakeLocationGroup) {
        addLog(`在${getLocationGroupName(sleepOptions.wakeLocationGroup)}铺开睡袋过夜。`)
        handleEndDay({ ...sleepOptions, forceRecoveryMode: hour() >= 24 ? 'late' : 'normal' })
      } else {
        handleEndDay()
      }
    })
    switchToSeasonalBgm()
    resumeClock()
  }

  const confirmNap = () => {
    if (!canNap.value) {
      addLog('现在已经太晚了，不能再小憩。')
      showNapConfirm.value = false
      return
    }

    showNapConfirm.value = false
    pauseClock()

    const requestedMinutes = requestedNapMinutes.value
    const beforeHour = hour()
    const beforeStamina = stamina()
    const result = advanceTime(actualNapMinutes.value / 60, { ignoreSpeedBuff: true })
    const elapsedMinutes = Math.max(0, Math.round((hour() - beforeHour) * 60))
    const recovery = calcNapRecovery(elapsedMinutes)

    if (recovery > 0) restoreStamina(recovery)

    const actualRecovery = stamina() - beforeStamina
    const interrupted = requestedMinutes > elapsedMinutes || !!result.passedOut
    const wakeText = interrupted ? '小憩被打断' : '小憩醒来'
    addLog(`${wakeText}，过去了${formatNapDuration(elapsedMinutes)}，恢复${actualRecovery}体力。`)

    if (result.passedOut) {
      if (result.message && !getResourceSleepOptions()) addLog(result.message)
      handleSleepOrPassOut()
      switchToSeasonalBgm()
    }

    resumeClock()
  }

  return {
    confirmNap,
    confirmSleep,
    runEndDayWithBusyOverlay
  }
}
