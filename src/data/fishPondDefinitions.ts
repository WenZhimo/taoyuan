import type { FishGenetics, PondableFishDef } from '@/types/fishPond'

const defaultGene = (overrides: Partial<FishGenetics> = {}): FishGenetics => ({
  weight: 50,
  growthRate: 50,
  diseaseRes: 50,
  qualityGene: 30,
  mutationRate: 10,
  ...overrides
})

/** 可养殖鱼种定义 */
export const PONDABLE_FISH: PondableFishDef[] = [
  // 溪流
  {
    fishId: 'crucian',
    name: '鲫鱼',
    maturityDays: 3,
    baseProductionRate: 0.4,
    productItemId: 'crucian',
    defaultGenetics: defaultGene({ weight: 30, growthRate: 70, diseaseRes: 60 })
  },
  {
    fishId: 'carp',
    name: '鲤鱼',
    maturityDays: 4,
    baseProductionRate: 0.35,
    productItemId: 'carp',
    defaultGenetics: defaultGene({ weight: 45, growthRate: 55, diseaseRes: 55 })
  },
  {
    fishId: 'grass_carp',
    name: '草鱼',
    maturityDays: 5,
    baseProductionRate: 0.3,
    productItemId: 'grass_carp',
    defaultGenetics: defaultGene({ weight: 60, growthRate: 45, diseaseRes: 50 })
  },
  // 池塘
  {
    fishId: 'golden_carp',
    name: '金鲤',
    maturityDays: 7,
    baseProductionRate: 0.2,
    productItemId: 'golden_carp',
    defaultGenetics: defaultGene({ weight: 40, growthRate: 35, diseaseRes: 40, qualityGene: 50 })
  },
  {
    fishId: 'koi',
    name: '锦鲤',
    maturityDays: 6,
    baseProductionRate: 0.25,
    productItemId: 'koi',
    defaultGenetics: defaultGene({ weight: 45, growthRate: 40, diseaseRes: 45, qualityGene: 55 })
  },
  {
    fishId: 'pond_turtle',
    name: '乌龟',
    maturityDays: 8,
    baseProductionRate: 0.15,
    productItemId: 'pond_turtle',
    defaultGenetics: defaultGene({ weight: 70, growthRate: 25, diseaseRes: 80, qualityGene: 40 })
  },
  // 江河
  {
    fishId: 'bass',
    name: '鲈鱼',
    maturityDays: 5,
    baseProductionRate: 0.3,
    productItemId: 'bass',
    defaultGenetics: defaultGene({ weight: 55, growthRate: 50, diseaseRes: 45 })
  },
  {
    fishId: 'catfish',
    name: '鲶鱼',
    maturityDays: 5,
    baseProductionRate: 0.3,
    productItemId: 'catfish',
    defaultGenetics: defaultGene({ weight: 65, growthRate: 45, diseaseRes: 50 })
  },
  {
    fishId: 'yellow_eel',
    name: '黄鳝',
    maturityDays: 6,
    baseProductionRate: 0.25,
    productItemId: 'yellow_eel',
    defaultGenetics: defaultGene({ weight: 50, growthRate: 40, diseaseRes: 55, qualityGene: 45 })
  },
  // 瀑布
  {
    fishId: 'rainbow_trout',
    name: '虹鳟',
    maturityDays: 6,
    baseProductionRate: 0.25,
    productItemId: 'rainbow_trout',
    defaultGenetics: defaultGene({ weight: 50, growthRate: 45, diseaseRes: 40, qualityGene: 50 })
  },
  // 沼泽
  {
    fishId: 'mud_loach',
    name: '沼泽泥鳅',
    maturityDays: 3,
    baseProductionRate: 0.4,
    productItemId: 'mud_loach',
    defaultGenetics: defaultGene({ weight: 25, growthRate: 65, diseaseRes: 70 })
  },
  {
    fishId: 'pond_snail',
    name: '田螺',
    maturityDays: 2,
    baseProductionRate: 0.5,
    productItemId: 'pond_snail',
    defaultGenetics: defaultGene({ weight: 15, growthRate: 80, diseaseRes: 75, qualityGene: 20 })
  },
  // 矿洞
  {
    fishId: 'cave_blindfish',
    name: '洞穴盲鱼',
    maturityDays: 8,
    baseProductionRate: 0.15,
    productItemId: 'cave_blindfish',
    defaultGenetics: defaultGene({ weight: 35, growthRate: 30, diseaseRes: 30, qualityGene: 60, mutationRate: 25 })
  }
]
