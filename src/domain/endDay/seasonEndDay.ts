import type { Season } from '@/types'

export interface SeasonChangeFarmResult {
  witheredCount: number
  reclaimedCount: number
}

export interface SeasonFertilizerResult {
  count: number
  fertilizerName: string
}

export interface SeasonChangeEndDayInput {
  seasonChanged: boolean
  oldSeason: Season
  newSeason: Season
  farmMapType: string
  getFarmingLevel: () => number
  onSeasonChange: (newSeason: Season) => SeasonChangeFarmResult
  getSeasonName: (season: Season) => string
  fruitTreeSeasonUpdate: (newYear: boolean) => unknown
  applyFertileSoil: (farmingLevel: number) => SeasonFertilizerResult
  setTutorialFlag: (key: string) => unknown
  addLog: (message: string) => void
}

export interface SeasonChangeEndDayResult {
  processed: boolean
  witheredCount: number
  reclaimedCount: number
  fertilizedCount: number
}

export function processSeasonChangeEndDay({
  seasonChanged,
  oldSeason,
  newSeason,
  farmMapType,
  getFarmingLevel,
  onSeasonChange,
  getSeasonName,
  fruitTreeSeasonUpdate,
  applyFertileSoil,
  setTutorialFlag,
  addLog
}: SeasonChangeEndDayInput): SeasonChangeEndDayResult {
  if (!seasonChanged) {
    return {
      processed: false,
      witheredCount: 0,
      reclaimedCount: 0,
      fertilizedCount: 0
    }
  }

  const { witheredCount, reclaimedCount } = onSeasonChange(newSeason)
  addLog(`—— 季节更替：${getSeasonName(oldSeason)}→${getSeasonName(newSeason)} ——`)
  if (witheredCount > 0) {
    addLog(`${witheredCount}株不适应新季节的作物枯萎了……`)
  }
  if (reclaimedCount > 0) {
    addLog(`${reclaimedCount}块荒废的耕地被杂草覆盖了。`)
  }

  const newYear = oldSeason === 'winter' && newSeason === 'spring'
  if (newYear) {
    addLog('新的一年开始了！农场经过一冬有些荒废，需要重新开垦。')
  }
  fruitTreeSeasonUpdate(oldSeason === 'winter')

  let fertilizedCount = 0
  if (farmMapType === 'standard') {
    const farmingLevel = getFarmingLevel()
    const fertilizerResult = applyFertileSoil(farmingLevel)
    fertilizedCount = fertilizerResult.count
    if (fertilizerResult.count > 0) {
      addLog(
        `桃源沃土滋养大地，${fertilizerResult.count}块耕地获得了${fertilizerResult.fertilizerName}。`
      )
    }
  }

  setTutorialFlag('justChangedSeason')

  return {
    processed: true,
    witheredCount,
    reclaimedCount,
    fertilizedCount
  }
}
