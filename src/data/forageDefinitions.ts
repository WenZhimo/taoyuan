/** 采集物定义 */
export interface ForageItemDef {
  itemId: string
  name: string
  season: ('spring' | 'summer' | 'autumn' | 'winter')[]
  chance: number
  expReward: number
}

/** 竹林采集物 */
export const FORAGE_ITEMS: ForageItemDef[] = [
  { itemId: 'bamboo', name: '竹子', season: ['spring', 'summer', 'autumn'], chance: 0.5, expReward: 3 },
  { itemId: 'wood', name: '木材', season: ['spring', 'summer', 'autumn', 'winter'], chance: 0.6, expReward: 2 },
  { itemId: 'herb', name: '草药', season: ['spring', 'summer', 'autumn'], chance: 0.3, expReward: 5 },
  { itemId: 'firewood', name: '柴火', season: ['spring', 'summer', 'autumn', 'winter'], chance: 0.7, expReward: 1 },
  { itemId: 'winter_bamboo_shoot', name: '冬笋', season: ['winter'], chance: 0.35, expReward: 8 },
  { itemId: 'wintersweet', name: '腊梅', season: ['winter'], chance: 0.2, expReward: 10 },
  { itemId: 'wild_mushroom', name: '野蘑菇', season: ['autumn'], chance: 0.35, expReward: 6 },
  { itemId: 'ginseng', name: '人参', season: ['autumn', 'winter'], chance: 0.1, expReward: 15 },
  { itemId: 'wild_berry', name: '野果', season: ['summer'], chance: 0.4, expReward: 4 },
  { itemId: 'pine_cone', name: '松果', season: ['autumn', 'winter'], chance: 0.3, expReward: 5 },
  { itemId: 'camphor_seed', name: '樟树种子', season: ['spring', 'summer'], chance: 0.15, expReward: 5 },
  { itemId: 'mulberry', name: '桑葚', season: ['summer', 'autumn'], chance: 0.2, expReward: 4 },

  // ===== 稀有采集物（博物馆化石/古物） =====
  { itemId: 'ancient_pottery', name: '古陶片', season: ['spring', 'summer', 'autumn', 'winter'], chance: 0.03, expReward: 12 },
  { itemId: 'bamboo_scroll', name: '竹简', season: ['spring', 'summer', 'autumn'], chance: 0.03, expReward: 12 },
  { itemId: 'stone_axe_head', name: '石斧头', season: ['spring', 'summer', 'autumn', 'winter'], chance: 0.04, expReward: 10 },
  { itemId: 'fern_fossil', name: '蕨叶化石', season: ['spring', 'summer', 'autumn'], chance: 0.03, expReward: 12 },
  { itemId: 'petrified_wood', name: '石化木', season: ['autumn', 'winter'], chance: 0.04, expReward: 10 }
]
