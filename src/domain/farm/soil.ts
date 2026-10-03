import type { FertilizerType, RetainingSoilType } from '@/types'

export const isRetainingSoilType = (fertilizer: FertilizerType | null | undefined): fertilizer is RetainingSoilType =>
  fertilizer === 'retaining_soil' || fertilizer === 'quality_retaining_soil'
