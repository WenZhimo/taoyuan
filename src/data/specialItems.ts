import type { Quality } from '@/types'

export const MOMO_FUMO_ITEM_ID = 'momo_fumo'

export const MOMO_FUMO_EXCHANGE = {
  sourceItemId: 'cabbage',
  sourceQuantity: 2000,
  outputItemId: MOMO_FUMO_ITEM_ID,
  outputQuantity: 2000,
  outputQuality: 'supreme' as Quality
} as const

export const isMomoFumo = (itemId: string): boolean => itemId === MOMO_FUMO_ITEM_ID
