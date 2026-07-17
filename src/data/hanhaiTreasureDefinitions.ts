import type { HanhaiTreasureRewardDef } from '@/types'

/** 瀚海藏宝图奖励档位（按 Math.random() 阈值升序） */
export const HANHAI_TREASURE_REWARDS: HanhaiTreasureRewardDef[] = [
  {
    id: 'grand',
    rollMaxExclusive: 0.05,
    money: 5000,
    items: [{ itemId: 'hanhai_turquoise', name: '绿松石', quantity: 2 }]
  },
  {
    id: 'major',
    rollMaxExclusive: 0.2,
    money: 2000,
    items: [{ itemId: 'hanhai_spice', name: '西域香料', quantity: 3 }]
  },
  {
    id: 'minor',
    rollMaxExclusive: 0.45,
    money: 1000,
    items: [{ itemId: 'hanhai_silk', name: '丝绸', quantity: 1 }]
  },
  {
    id: 'consolation',
    rollMaxExclusive: 1,
    money: 500,
    items: []
  }
]
