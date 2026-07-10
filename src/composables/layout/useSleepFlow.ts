import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { CropDef } from '@/types/farm'
import type { LocationGroup, Season } from '@/types/game'
import { calculateNapStaminaRecovery, normalizeNapMinutes, resolveNapMinutes } from '@/domain/sleep/napRules'
import {
  LATE_NIGHT_RECOVERY_MAX,
  LATE_NIGHT_RECOVERY_MIN,
  PASSOUT_HOUR,
  PASSOUT_MONEY_PENALTY_CAP,
  PASSOUT_MONEY_PENALTY_RATE,
  PASSOUT_STAMINA_RECOVERY,
  formatTime,
  getLocationGroupName
} from '@/data/timeConstants'

interface WitheringPlot {
  state: string
  cropId: string | null
}

interface UseSleepFlowOptions {
  hour: Ref<number>
  timeDisplay: Ref<string>
  currentLocationGroup: Ref<LocationGroup>
  season: Ref<Season>
  day: Ref<number>
  stamina: Ref<number>
  maxStamina: Ref<number>
  resourceSleepOptions: ComputedRef<{ wakeLocationGroup?: LocationGroup } | null>
  staminaRecoveryBonus: () => number
  farmPlots: Ref<readonly WitheringPlot[]>
  getCropById: (cropId: string) => CropDef | undefined
  seasonNames: Readonly<Record<Season, string>>
}

const SEASON_ORDER: readonly Season[] = ['spring', 'summer', 'autumn', 'winter']

export const formatNapDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}分`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours}时${rest}分` : `${hours}时`
}

export const useSleepFlow = ({
  hour,
  timeDisplay,
  currentLocationGroup,
  season,
  day,
  stamina,
  maxStamina,
  resourceSleepOptions,
  staminaRecoveryBonus,
  farmPlots,
  getCropById,
  seasonNames
}: UseSleepFlowOptions) => {
  const showSleepConfirm = ref(false)
  const showNapConfirm = ref(false)
  const napMinutes = ref(60)
  const isResourceSleepLocation = computed(() => !!resourceSleepOptions.value || ['nature', 'mine', 'hanhai'].includes(currentLocationGroup.value))
  const canUseSleepingBag = computed(() => !!resourceSleepOptions.value)
  const currentLocationGroupName = computed(() => getLocationGroupName(resourceSleepOptions.value?.wakeLocationGroup ?? currentLocationGroup.value))

  const sleepLabel = computed(() => {
    if (canUseSleepingBag.value) return '睡袋休息'
    if (isResourceSleepLocation.value) return '回家休息'
    if (hour.value >= 24) return '倒头就睡'
    if (hour.value >= 20) return '回家休息'
    return '休息'
  })

  const sleepSummary = computed(() => {
    if (canUseSleepingBag.value) {
      return `铺开睡袋，在${currentLocationGroupName.value}安稳过夜。明早醒来仍在这里。`
    }
    if (stamina.value <= 0 || hour.value >= PASSOUT_HOUR) {
      return '你已经精疲力竭……将在原地昏倒。'
    }
    if (hour.value >= 24) {
      return '已经过了午夜，拖着疲惫的身体回家……'
    }
    if (isResourceSleepLocation.value) {
      return '没有睡袋，只能收拾行囊回家休息。'
    }
    return '回到家中，安稳入睡。明日又是新的一天。'
  })

  const requestedNapMinutes = computed(() => normalizeNapMinutes(Number(napMinutes.value)))
  const napResolution = computed(() => resolveNapMinutes(hour.value, requestedNapMinutes.value, PASSOUT_HOUR))
  const maxNapMinutes = computed(() => napResolution.value.maxMinutes)
  const actualNapMinutes = computed(() => napResolution.value.actualMinutes)
  const canNap = computed(() => napResolution.value.canNap)
  const napWillBeInterrupted = computed(() => napResolution.value.interrupted)

  const napWakeTime = computed(() => {
    if (!canNap.value) return timeDisplay.value
    return formatTime(hour.value + actualNapMinutes.value / 60)
  })

  const calcNapRecovery = (minutes: number): number => {
    return calculateNapStaminaRecovery({
      minutes,
      stamina: stamina.value,
      maxStamina: maxStamina.value
    })
  }

  const napRecoveryPreview = computed(() => calcNapRecovery(actualNapMinutes.value))

  const setNapMinutes = (minutes: number) => {
    napMinutes.value = minutes
  }

  const openNapDialog = () => {
    napMinutes.value = Math.min(60, Math.max(1, maxNapMinutes.value || 60))
    showNapConfirm.value = true
  }

  const openSleepDialog = () => {
    showSleepConfirm.value = true
  }

  const sleepWarning = computed(() => {
    const warnings: string[] = []
    const staminaBonus = staminaRecoveryBonus()

    if (stamina.value <= 0 || hour.value >= PASSOUT_HOUR) {
      const pct = Math.round(Math.min(PASSOUT_STAMINA_RECOVERY + staminaBonus, 1) * 100)
      const penaltyPct = Math.round(PASSOUT_MONEY_PENALTY_RATE * 100)
      if (pct < 100) {
        warnings.push(`体力仅恢复${pct}%，并损失${penaltyPct}%铜钱（上限${PASSOUT_MONEY_PENALTY_CAP}文）`)
      } else {
        warnings.push(`损失${penaltyPct}%铜钱（上限${PASSOUT_MONEY_PENALTY_CAP}文）`)
      }
    } else if (hour.value >= 24) {
      const t = Math.min(Math.max(hour.value - 24, 0), 1)
      const pct = Math.round(Math.min(LATE_NIGHT_RECOVERY_MAX - t * (LATE_NIGHT_RECOVERY_MAX - LATE_NIGHT_RECOVERY_MIN) + staminaBonus, 1) * 100)
      if (pct < 100) warnings.push(`体力仅恢复${pct}%`)
    }

    if (day.value === 28) {
      const nextSeason = SEASON_ORDER[(SEASON_ORDER.indexOf(season.value) + 1) % 4]!
      let willWitherCount = 0
      let harvestableCount = 0

      for (const plot of farmPlots.value) {
        if ((plot.state === 'planted' || plot.state === 'growing' || plot.state === 'harvestable') && plot.cropId) {
          const crop = getCropById(plot.cropId)
          if (crop && !crop.season.includes(nextSeason)) {
            willWitherCount++
            if (plot.state === 'harvestable') harvestableCount++
          }
        }
      }

      if (willWitherCount > 0) {
        let msg = `明天进入${seasonNames[nextSeason]}季，${willWitherCount}株作物将会枯萎！`
        if (harvestableCount > 0) msg += `（其中${harvestableCount}株已可收获）`
        warnings.push(msg)
      }
    }

    return warnings.join('\n')
  })

  return {
    actualNapMinutes,
    calcNapRecovery,
    canNap,
    canUseSleepingBag,
    currentLocationGroupName,
    isResourceSleepLocation,
    napMinutes,
    napRecoveryPreview,
    napWakeTime,
    napWillBeInterrupted,
    openNapDialog,
    openSleepDialog,
    requestedNapMinutes,
    setNapMinutes,
    showNapConfirm,
    showSleepConfirm,
    sleepLabel,
    sleepSummary,
    sleepWarning
  }
}
