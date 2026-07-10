import type { Quality } from '@/types'

export interface AnimalDailyResult {
  products: Array<{ itemId: string; quality: Quality }>
  died: string[]
  gotSick: string[]
  healed: string[]
}

export interface AnimalProductionEndDayInput {
  dailyUpdate: () => AnimalDailyResult
  addItem: (itemId: string, quantity?: number, quality?: Quality) => unknown
}

export interface AnimalProductionEndDayResult {
  logs: string[]
  productCount: number
}

export function processAnimalProductionEndDay({
  dailyUpdate,
  addItem
}: AnimalProductionEndDayInput): AnimalProductionEndDayResult {
  const animalResult = dailyUpdate()
  const logs: string[] = []

  for (const product of animalResult.products) {
    addItem(product.itemId, 1, product.quality)
  }
  if (animalResult.products.length > 0) {
    logs.push(`动物们产出了${animalResult.products.length}件产品。`)
  }
  if (animalResult.died.length > 0) {
    logs.push(`${animalResult.died.join('、')}因长期饥饿或病重不治而死亡了……`)
  }
  if (animalResult.gotSick.length > 0) {
    logs.push(`${animalResult.gotSick.join('、')}因饥饿而生病了！请尽快喂食。`)
  }
  if (animalResult.healed.length > 0) {
    logs.push(`${animalResult.healed.join('、')}吃饱后恢复了健康。`)
  }

  return {
    logs,
    productCount: animalResult.products.length
  }
}

export interface IncubatorDailyResult {
  hatched?: { name: string }
}

export interface AnimalIncubatorsEndDayInput {
  dailyIncubatorUpdate: () => IncubatorDailyResult
  dailyBarnIncubatorUpdate: () => IncubatorDailyResult
}

export interface AnimalIncubatorsEndDayResult {
  logs: string[]
  hatchedCount: number
}

export function processAnimalIncubatorsEndDay({
  dailyIncubatorUpdate,
  dailyBarnIncubatorUpdate
}: AnimalIncubatorsEndDayInput): AnimalIncubatorsEndDayResult {
  const logs: string[] = []
  let hatchedCount = 0

  const incubatorResult = dailyIncubatorUpdate()
  if (incubatorResult.hatched) {
    logs.push(`鸡舍孵化器中的蛋孵出了一只${incubatorResult.hatched.name}！`)
    hatchedCount++
  }

  const barnIncubatorResult = dailyBarnIncubatorUpdate()
  if (barnIncubatorResult.hatched) {
    logs.push(`牲口棚孵化器中的蛋孵出了一只${barnIncubatorResult.hatched.name}！`)
    hatchedCount++
  }

  return { logs, hatchedCount }
}

export interface PetEndDayInput {
  dailyPetUpdate: () => { item?: string }
  getPetName: () => string
  getItemName: (itemId: string) => string
}

export interface PetEndDayResult {
  logs: string[]
  foundItemId: string | null
}

export function processPetEndDay({ dailyPetUpdate, getPetName, getItemName }: PetEndDayInput): PetEndDayResult {
  const petResult = dailyPetUpdate()
  if (!petResult.item) {
    return { logs: [], foundItemId: null }
  }

  return {
    logs: [`${getPetName()}叼回来一个${getItemName(petResult.item)}。`],
    foundItemId: petResult.item
  }
}
