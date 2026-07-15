import type { ToolType, ToolTier } from '@/types'

export interface ToolUpgradeCost {
  fromTier: ToolTier
  toTier: ToolTier
  money: number
  materials: { itemId: string; quantity: number }[]
}

const STANDARD_COSTS: ToolUpgradeCost[] = [
  { fromTier: 'basic', toTier: 'iron', money: 2000, materials: [{ itemId: 'copper_bar', quantity: 5 }] },
  { fromTier: 'iron', toTier: 'steel', money: 5000, materials: [{ itemId: 'iron_bar', quantity: 5 }] },
  { fromTier: 'steel', toTier: 'iridium', money: 10000, materials: [{ itemId: 'gold_bar', quantity: 5 }] }
]

const WATERING_CAN_COSTS: ToolUpgradeCost[] = [
  { fromTier: 'basic', toTier: 'iron', money: 1200, materials: [{ itemId: 'copper_bar', quantity: 3 }] },
  { fromTier: 'iron', toTier: 'steel', money: 5000, materials: [{ itemId: 'iron_bar', quantity: 5 }] },
  { fromTier: 'steel', toTier: 'iridium', money: 10000, materials: [{ itemId: 'gold_bar', quantity: 5 }] }
]

export const TOOL_UPGRADE_COSTS: Record<ToolType, ToolUpgradeCost[]> = {
  wateringCan: WATERING_CAN_COSTS,
  hoe: STANDARD_COSTS,
  pickaxe: STANDARD_COSTS,
  scythe: STANDARD_COSTS,
  axe: STANDARD_COSTS,
  fishingRod: [
    {
      fromTier: 'basic',
      toTier: 'iron',
      money: 2000,
      materials: [
        { itemId: 'copper_bar', quantity: 5 },
        { itemId: 'wood', quantity: 5 }
      ]
    },
    {
      fromTier: 'iron',
      toTier: 'steel',
      money: 5000,
      materials: [
        { itemId: 'iron_bar', quantity: 5 },
        { itemId: 'bamboo', quantity: 5 }
      ]
    },
    {
      fromTier: 'steel',
      toTier: 'iridium',
      money: 10000,
      materials: [
        { itemId: 'gold_bar', quantity: 5 },
        { itemId: 'bamboo', quantity: 10 }
      ]
    }
  ],
  pan: [
    {
      fromTier: 'basic',
      toTier: 'iron',
      money: 2000,
      materials: [
        { itemId: 'copper_bar', quantity: 5 },
        { itemId: 'quartz', quantity: 2 }
      ]
    },
    {
      fromTier: 'iron',
      toTier: 'steel',
      money: 5000,
      materials: [
        { itemId: 'iron_bar', quantity: 5 },
        { itemId: 'quartz', quantity: 3 }
      ]
    },
    {
      fromTier: 'steel',
      toTier: 'iridium',
      money: 10000,
      materials: [
        { itemId: 'gold_bar', quantity: 5 },
        { itemId: 'quartz', quantity: 5 }
      ]
    }
  ]
}

export const TOOL_NAMES: Record<ToolType, string> = {
  wateringCan: '水壶',
  hoe: '锄头',
  pickaxe: '镐',
  fishingRod: '鱼竿',
  scythe: '镰刀',
  axe: '斧头',
  pan: '淘金盘'
}

export const TIER_NAMES: Record<ToolTier, string> = {
  basic: '初始',
  iron: '铁制',
  steel: '精钢',
  iridium: '铱金'
}
