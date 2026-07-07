import type { EquipmentEffect } from './ring'

/** 帽子定义 */
export interface HatDef {
  id: string
  name: string
  description: string
  effects: EquipmentEffect[]
  /** 商店购买价格（null = 不可购买，需合成） */
  shopPrice: number | null
  /** 合成配方（null = 不可合成） */
  recipe: { itemId: string; quantity: number }[] | null
  /** 合成所需铜钱 */
  recipeMoney: number
  /** 获取途径描述 */
  obtainSource: string
  /** 出售价格 */
  sellPrice: number
}

/** 拥有的帽子实例 */
export interface OwnedHat {
  defId: string
  /** 旧存档/旧逻辑兼容字段：等同于 enchantmentIds 的第一项 */
  enchantmentId?: string | null
  /** 当前附魔列表，允许重复附魔 */
  enchantmentIds?: string[]
}

/** 鞋子定义 */
export interface ShoeDef {
  id: string
  name: string
  description: string
  effects: EquipmentEffect[]
  /** 商店购买价格（null = 不可购买，需合成） */
  shopPrice: number | null
  /** 合成配方（null = 不可合成） */
  recipe: { itemId: string; quantity: number }[] | null
  /** 合成所需铜钱 */
  recipeMoney: number
  /** 获取途径描述 */
  obtainSource: string
  /** 出售价格 */
  sellPrice: number
}

/** 拥有的鞋子实例 */
export interface OwnedShoe {
  defId: string
  /** 旧存档/旧逻辑兼容字段：等同于 enchantmentIds 的第一项 */
  enchantmentId?: string | null
  /** 当前附魔列表，允许重复附魔 */
  enchantmentIds?: string[]
}
