import type { PondLevel } from '@/types/fishPond'

export interface FishPondFacilityMaterial {
  itemId: string
  quantity: number
}

export interface FishPondFacilityCost {
  money: number
  materials: FishPondFacilityMaterial[]
}

export interface FishPondFacilityCapacity {
  level: PondLevel
  capacity: number
}

export interface FishPondFacilityUpgrade {
  level: 2 | 3
  capacity: number
  cost: FishPondFacilityCost
}

export interface FishPondFacilityDef {
  id: string
  name: string
  description: string
  buildCost: FishPondFacilityCost
  capacities: FishPondFacilityCapacity[]
  upgrades: FishPondFacilityUpgrade[]
  unlimitedAtLevel: PondLevel | null
}

export const FISH_POND_FACILITY: FishPondFacilityDef = {
  id: 'fish_pond',
  name: '鱼塘',
  description: '用于养殖鱼类、育种和收集每日产物的设施',
  buildCost: {
    money: 5000,
    materials: [
      { itemId: 'wood', quantity: 100 },
      { itemId: 'bamboo', quantity: 50 }
    ]
  },
  capacities: [
    { level: 1, capacity: 5 },
    { level: 2, capacity: 10 },
    { level: 3, capacity: 20 }
  ],
  upgrades: [
    {
      level: 2,
      capacity: 10,
      cost: {
        money: 10000,
        materials: [
          { itemId: 'wood', quantity: 100 },
          { itemId: 'iron_bar', quantity: 5 }
        ]
      }
    },
    {
      level: 3,
      capacity: 20,
      cost: {
        money: 25000,
        materials: [
          { itemId: 'wood', quantity: 200 },
          { itemId: 'gold_bar', quantity: 5 },
          { itemId: 'iron_bar', quantity: 10 }
        ]
      }
    }
  ],
  unlimitedAtLevel: 3
}
