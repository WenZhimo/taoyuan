export const FARM_BATCH_LIMIT = 1000
export const GREENHOUSE_BATCH_LIMIT = FARM_BATCH_LIMIT

export const shouldConfirmLargeBatch = (total: number, limit: number = FARM_BATCH_LIMIT): boolean => {
  return total > limit
}
