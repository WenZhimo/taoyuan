import type { CaveChoice, Quality } from '@/types'

export interface CaveProduct {
  itemId: string
  quantity: number
  quality: Quality
}

export interface CaveEndDayInput {
  caveChoice: CaveChoice
  incrementActiveDays: () => void
  dailyCaveUpdate: () => CaveProduct[]
  addItem: (itemId: string, quantity?: number, quality?: Quality) => unknown
  getItemName: (itemId: string) => string
}

export interface CaveEndDayResult {
  logs: string[]
  productCount: number
}

const getQualityLabel = (quality: Quality): string => {
  if (quality === 'fine') return '（优质）'
  if (quality === 'excellent') return '（精品）'
  if (quality === 'supreme') return '（极品）'
  return ''
}

export function processCaveEndDay({
  caveChoice,
  incrementActiveDays,
  dailyCaveUpdate,
  addItem,
  getItemName
}: CaveEndDayInput): CaveEndDayResult {
  const logs: string[] = []

  if (caveChoice !== 'none') {
    incrementActiveDays()
  }

  const products = dailyCaveUpdate()
  for (const product of products) {
    addItem(product.itemId, product.quantity, product.quality)
    const qtyText = product.quantity > 1 ? `${product.quantity}个` : ''
    logs.push(`山洞中发现了${qtyText}${getItemName(product.itemId)}${getQualityLabel(product.quality)}。`)
  }

  return {
    logs,
    productCount: products.length
  }
}
