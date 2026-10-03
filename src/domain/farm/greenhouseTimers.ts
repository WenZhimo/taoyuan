import type { CropDef, FarmPlot, GreenhousePlotTimer } from '@/types/farm'
import type { FertilizerType } from '@/types'
import type { SeedGenetics } from '@/types/breeding'

export type GreenhouseCropLookup = (cropId: string) => CropDef | undefined
export type GreenhouseFertilizerLookup = (fertilizer: FertilizerType) => { growthSpeedup?: number } | undefined

const geneticsKey = (genetics: SeedGenetics | null): string => JSON.stringify(genetics ?? null)

export const greenhouseTimerKey = (timer: Pick<GreenhousePlotTimer, 'cropId' | 'growthDays' | 'fertilizer' | 'retainingSoil' | 'harvestCount' | 'seedGenetics'>): string =>
  JSON.stringify([
    timer.cropId,
    timer.growthDays,
    timer.fertilizer,
    timer.retainingSoil ?? null,
    timer.harvestCount,
    geneticsKey(timer.seedGenetics)
  ])

export const createGreenhousePlotTimer = (
  plotId: number,
  cropId: string | null,
  options: Partial<Omit<GreenhousePlotTimer, 'plotIds' | 'cropId'>> = {}
): GreenhousePlotTimer => ({
  plotIds: [plotId],
  cropId,
  growthDays: options.growthDays ?? 0,
  fertilizer: options.fertilizer ?? null,
  retainingSoil: options.retainingSoil ?? null,
  harvestCount: options.harvestCount ?? 0,
  seedGenetics: options.seedGenetics ?? null
})

export const mergeGreenhousePlotTimers = (
  timers: readonly GreenhousePlotTimer[]
): GreenhousePlotTimer[] => {
  const merged = new Map<string, GreenhousePlotTimer>()
  for (const timer of timers) {
    if (timer.plotIds.length === 0 || (!timer.cropId && !timer.fertilizer && !timer.retainingSoil)) continue
    const key = greenhouseTimerKey(timer)
    const existing = merged.get(key)
    if (existing) {
      existing.plotIds.push(...timer.plotIds)
    } else {
      merged.set(key, {
        plotIds: [...timer.plotIds],
        cropId: timer.cropId,
        growthDays: timer.growthDays,
        fertilizer: timer.fertilizer ?? null,
        retainingSoil: timer.retainingSoil ?? null,
        harvestCount: timer.harvestCount ?? 0,
        seedGenetics: timer.seedGenetics ?? null
      })
    }
  }
  return Array.from(merged.values()).map(timer => ({
    ...timer,
    plotIds: Array.from(new Set(timer.plotIds)).sort((a, b) => a - b)
  }))
}

export const greenhousePlotState = (
  timer: Pick<GreenhousePlotTimer, 'cropId' | 'growthDays' | 'fertilizer'>,
  getCropById: GreenhouseCropLookup,
  getFertilizerById: GreenhouseFertilizerLookup,
  cropGrowthBonus = 0
): Exclude<FarmPlot['state'], 'wasteland'> => {
  if (!timer.cropId) return 'tilled'
  const crop = getCropById(timer.cropId)
  const fertilizer = timer.fertilizer ? getFertilizerById(timer.fertilizer) : undefined
  const speedup = (fertilizer?.growthSpeedup ?? 0) + cropGrowthBonus
  const effectiveDays = crop ? Math.max(1, Math.floor(crop.growthDays * (1 - speedup))) : Number.MAX_SAFE_INTEGER
  if (timer.growthDays >= effectiveDays) return 'harvestable'
  return timer.growthDays > 0 ? 'growing' : 'planted'
}

export const createGreenhousePlotFromTimer = (
  plotId: number,
  timer: GreenhousePlotTimer,
  getCropById: GreenhouseCropLookup,
  getFertilizerById: GreenhouseFertilizerLookup,
  cropGrowthBonus = 0
): FarmPlot => ({
  id: plotId,
  state: greenhousePlotState(timer, getCropById, getFertilizerById, cropGrowthBonus),
  cropId: timer.cropId,
  growthDays: timer.growthDays,
  watered: false,
  unwateredDays: 0,
  fertilizer: timer.fertilizer,
  retainingSoil: timer.retainingSoil ?? null,
  harvestCount: timer.harvestCount,
  giantCropGroup: null,
  seedGenetics: timer.seedGenetics,
  infested: false,
  infestedDays: 0,
  weedy: false,
  weedyDays: 0
})
