import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { formatNapDuration, useSleepFlow } from '@/composables/layout/useSleepFlow'
import { SEASON_NAMES } from '@/stores/useGameStore'
import type { CropDef, LocationGroup, Season } from '@/types'

const makeCrop = (season: Season[]): CropDef => ({
  id: 'cabbage',
  name: '青菜',
  seedId: 'cabbage_seed',
  season,
  growthDays: 3,
  sellPrice: 10,
  seedPrice: 5,
  deepWatering: false,
  description: 'test crop'
})

const createFlow = () => {
  const hour = ref(20)
  const timeDisplay = computed(() => '20:00')
  const currentLocationGroup = ref<LocationGroup>('farm')
  const season = ref<Season>('spring')
  const day = ref(1)
  const stamina = ref(50)
  const maxStamina = ref(100)
  const resourceSleepOptions = ref<{ wakeLocationGroup?: LocationGroup } | null>(null)
  const staminaBonus = ref(0)
  const farmPlots = ref([{ state: 'harvestable', cropId: 'cabbage' }])
  const crop = ref(makeCrop(['spring']))

  const flow = useSleepFlow({
    hour,
    timeDisplay,
    currentLocationGroup,
    season,
    day,
    stamina,
    maxStamina,
    resourceSleepOptions: computed(() => resourceSleepOptions.value),
    staminaRecoveryBonus: () => staminaBonus.value,
    farmPlots,
    getCropById: () => crop.value,
    seasonNames: SEASON_NAMES
  })

  return {
    crop,
    currentLocationGroup,
    day,
    flow,
    hour,
    resourceSleepOptions,
    season,
    stamina,
    staminaBonus
  }
}

describe('useSleepFlow', () => {
  it('previews sleeping bag rest in resource locations', () => {
    const state = createFlow()
    state.resourceSleepOptions.value = { wakeLocationGroup: 'mine' }

    expect(state.flow.sleepLabel.value).toBe('睡袋休息')
    expect(state.flow.sleepSummary.value).toContain('矿洞')
    expect(state.flow.canUseSleepingBag.value).toBe(true)
  })

  it('previews home rest when a resource location has no sleeping bag', () => {
    const state = createFlow()
    state.currentLocationGroup.value = 'hanhai'

    expect(state.flow.sleepLabel.value).toBe('回家休息')
    expect(state.flow.sleepSummary.value).toBe('没有睡袋，只能收拾行囊回家休息。')
  })

  it('caps naps before the passout boundary and previews recovery from actual minutes', () => {
    const state = createFlow()
    state.hour.value = 25

    state.flow.setNapMinutes(120)

    expect(state.flow.actualNapMinutes.value).toBe(59)
    expect(state.flow.napWillBeInterrupted.value).toBe(true)
    expect(state.flow.napWakeTime.value).toBe('凌晨 1:59')
    expect(state.flow.napRecoveryPreview.value).toBe(11)
  })

  it('builds late-night and season-change warnings', () => {
    const state = createFlow()
    state.hour.value = 26
    state.day.value = 28
    state.crop.value = makeCrop(['spring'])

    expect(state.flow.sleepWarning.value).toContain('体力仅恢复50%，并损失10%铜钱')
    expect(state.flow.sleepWarning.value).toContain('明天进入夏季，1株作物将会枯萎')
  })

  it('keeps repeated preview calculations cheap', () => {
    const state = createFlow()
    const iterations = 100_000
    const start = performance.now()
    let total = 0

    for (let i = 0; i < iterations; i++) {
      state.hour.value = 18 + (i % 8)
      state.flow.setNapMinutes((i % 240) + 1)
      total += state.flow.napRecoveryPreview.value
    }

    expect(total).toBeGreaterThan(0)
    expect((performance.now() - start) / iterations).toBeLessThan(0.02)
  })
})

describe('formatNapDuration', () => {
  it('formats minute and hour durations', () => {
    expect(formatNapDuration(45)).toBe('45分')
    expect(formatNapDuration(60)).toBe('1时')
    expect(formatNapDuration(125)).toBe('2时5分')
  })
})
