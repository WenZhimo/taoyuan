import type { PondDailyResult } from '@/types/fishPond'
import type { Quality } from '@/types'

export interface FishPondEndDayInput {
  pondBuilt: boolean
  dailyUpdate: () => PondDailyResult
  addItem: (itemId: string, quantity?: number, quality?: Quality) => unknown
}

export interface FishPondEndDayResult {
  logs: string[]
  productCount: number
}

export function processFishPondEndDay({ pondBuilt, dailyUpdate, addItem }: FishPondEndDayInput): FishPondEndDayResult {
  const logs: string[] = []
  let productCount = 0

  if (!pondBuilt) {
    return { logs, productCount }
  }

  const pondResult = dailyUpdate()
  for (const product of pondResult.products) {
    addItem(product.itemId, 1, product.quality)
  }

  productCount = pondResult.products.length
  if (pondResult.products.length > 0) {
    logs.push(`鱼塘产出了${pondResult.products.length}件水产品。`)
  }
  if (pondResult.died.length > 0) {
    logs.push(`${pondResult.died.join('、')}因病重不治而死亡了……`)
  }
  if (pondResult.gotSick.length > 0) {
    logs.push(`${pondResult.gotSick.join('、')}生病了！请及时治疗。`)
  }
  if (pondResult.bred.length > 0) {
    logs.push(`育苗塘繁殖成功，新的${pondResult.bred.join('、')}出生了！`)
  }
  for (const item of pondResult.reproduced) {
    logs.push(`繁衍塘自然繁衍出${item.quantity}条${item.name}。`)
  }
  if (pondResult.breedingFailed.length > 0) {
    logs.push(`${pondResult.breedingFailed.join('；')}。`)
  }

  return { logs, productCount }
}
