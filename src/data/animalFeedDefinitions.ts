import { HAY_ITEM_ID, HAY_PRICE, NOURISHING_FEED_ID, PREMIUM_FEED_ID, VITALITY_FEED_ID } from './animalDefinitions'

export interface AnimalFeedDef {
  id: string
  name: string
  price: number
  description: string
}

/** 所有饲料定义（UI 遍历用） */
export const FEED_DEFS: AnimalFeedDef[] = [
  { id: HAY_ITEM_ID, name: '干草', price: HAY_PRICE, description: '基础饲料' },
  { id: PREMIUM_FEED_ID, name: '精饲料', price: 200, description: '心情+60，好感度翻倍' },
  { id: NOURISHING_FEED_ID, name: '滋补饲料', price: 250, description: '产出天数-1' },
  { id: VITALITY_FEED_ID, name: '活力饲料', price: 300, description: '100%治愈疾病' }
]
