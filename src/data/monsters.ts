import type { MineFloorDef, MonsterDef } from '@/types'

// ==================== 怪物定义 ====================

/** 普通怪物定义 */
export const MONSTERS: Record<string, MonsterDef> = {
  // 浅矿 (1-20)
  mud_worm: {
    id: 'mud_worm',
    name: '泥虫',
    hp: 15,
    attack: 5,
    defense: 1,
    expReward: 5,
    drops: [
      { itemId: 'copper_ore', chance: 0.5 },
      { itemId: 'quartz', chance: 0.1 }
    ],
    description: '蠕动的泥虫，不太危险。'
  },
  stone_crab: {
    id: 'stone_crab',
    name: '石蟹',
    hp: 25,
    attack: 6,
    defense: 3,
    expReward: 8,
    drops: [
      { itemId: 'copper_ore', chance: 0.6 },
      { itemId: 'iron_ore', chance: 0.15 }
    ],
    description: '硬壳甲虫，防御较高。'
  },
  // 冰霜 (21-40)
  ice_bat: {
    id: 'ice_bat',
    name: '冰蝠',
    hp: 30,
    attack: 8,
    defense: 2,
    expReward: 12,
    drops: [
      { itemId: 'iron_ore', chance: 0.5 },
      { itemId: 'jade', chance: 0.1 }
    ],
    description: '寒冰中飞舞的蝙蝠。'
  },
  ghost: {
    id: 'ghost',
    name: '幽灵',
    hp: 20,
    attack: 10,
    defense: 0,
    expReward: 15,
    drops: [
      { itemId: 'jade', chance: 0.2 },
      { itemId: 'quartz', chance: 0.3 }
    ],
    description: '飘忽不定的幽灵，攻高防低。'
  },
  // 熔岩 (41-60)
  fire_bat: {
    id: 'fire_bat',
    name: '火蝠',
    hp: 35,
    attack: 9,
    defense: 3,
    expReward: 18,
    drops: [
      { itemId: 'gold_ore', chance: 0.55 },
      { itemId: 'ruby', chance: 0.15 }
    ],
    description: '浑身燃烧的蝙蝠。'
  },
  shadow_warrior: {
    id: 'shadow_warrior',
    name: '暗影武士',
    hp: 50,
    attack: 10,
    defense: 4,
    expReward: 28,
    drops: [
      { itemId: 'gold_ore', chance: 0.65 },
      { itemId: 'ruby', chance: 0.25 }
    ],
    description: '矿洞深处的强大敌人。'
  },
  // 水晶 (61-80)
  crystal_golem: {
    id: 'crystal_golem',
    name: '水晶魔像',
    hp: 110,
    attack: 18,
    defense: 10,
    expReward: 45,
    drops: [
      { itemId: 'crystal_ore', chance: 0.55 },
      { itemId: 'moonstone', chance: 0.15 }
    ],
    description: '水晶凝聚成的魔像，闪耀刺眼光芒。'
  },
  prism_spider: {
    id: 'prism_spider',
    name: '棱镜蛛',
    hp: 75,
    attack: 22,
    defense: 5,
    expReward: 50,
    drops: [
      { itemId: 'crystal_ore', chance: 0.5 },
      { itemId: 'moonstone', chance: 0.2 }
    ],
    description: '编织光线的巨型蜘蛛。'
  },
  // 暗影 (81-100)
  shadow_lurker: {
    id: 'shadow_lurker',
    name: '暗影潜伏者',
    hp: 150,
    attack: 28,
    defense: 10,
    expReward: 65,
    drops: [
      { itemId: 'shadow_ore', chance: 0.55 },
      { itemId: 'obsidian', chance: 0.15 }
    ],
    description: '藏匿于黑暗中的捕猎者。'
  },
  void_wraith: {
    id: 'void_wraith',
    name: '虚空幽魂',
    hp: 100,
    attack: 35,
    defense: 4,
    expReward: 70,
    drops: [
      { itemId: 'shadow_ore', chance: 0.5 },
      { itemId: 'obsidian', chance: 0.2 }
    ],
    description: '虚空中飘荡的怨灵，攻高防低。'
  },
  // 深渊 (101-120)
  abyss_serpent: {
    id: 'abyss_serpent',
    name: '深渊巨蟒',
    hp: 200,
    attack: 35,
    defense: 14,
    expReward: 85,
    drops: [
      { itemId: 'void_ore', chance: 0.55 },
      { itemId: 'dragon_jade', chance: 0.15 }
    ],
    description: '盘踞深渊的远古巨蛇。'
  },
  bone_dragon: {
    id: 'bone_dragon',
    name: '骨龙',
    hp: 250,
    attack: 40,
    defense: 16,
    expReward: 100,
    drops: [
      { itemId: 'void_ore', chance: 0.6 },
      { itemId: 'dragon_jade', chance: 0.25 }
    ],
    description: '龙骨复苏的恐怖存在。'
  }
}
/** 骷髅矿穴专属怪物 */
export const SKULL_CAVERN_MONSTERS: Record<string, MonsterDef> = {
  iridium_golem: {
    id: 'iridium_golem',
    name: '铱金魔像',
    hp: 400,
    attack: 55,
    defense: 30,
    expReward: 150,
    drops: [
      { itemId: 'iridium_ore', chance: 0.6 },
      { itemId: 'prismatic_shard', chance: 0.03 }
    ],
    description: '铱金铸就的不朽卫兵。'
  },
  skull_serpent: {
    id: 'skull_serpent',
    name: '骷髅飞蛇',
    hp: 300,
    attack: 65,
    defense: 14,
    expReward: 130,
    drops: [
      { itemId: 'iridium_ore', chance: 0.5 },
      { itemId: 'shadow_ore', chance: 0.2 }
    ],
    description: '骷髅矿穴中飞舞的毒蛇。'
  },
  ancient_mummy: {
    id: 'ancient_mummy',
    name: '远古木乃伊',
    hp: 550,
    attack: 45,
    defense: 35,
    expReward: 180,
    drops: [
      { itemId: 'iridium_ore', chance: 0.65 },
      { itemId: 'prismatic_shard', chance: 0.05 }
    ],
    description: '远古文明的不死守卫。'
  }
}

/** 区域怪物映射 */
export const ZONE_MONSTERS: Record<MineFloorDef['zone'], MonsterDef[]> = {
  shallow: [MONSTERS.mud_worm!, MONSTERS.stone_crab!],
  frost: [MONSTERS.ice_bat!, MONSTERS.ghost!],
  lava: [MONSTERS.fire_bat!, MONSTERS.shadow_warrior!],
  crystal: [MONSTERS.crystal_golem!, MONSTERS.prism_spider!],
  shadow: [MONSTERS.shadow_lurker!, MONSTERS.void_wraith!],
  abyss: [MONSTERS.abyss_serpent!, MONSTERS.bone_dragon!]
}

// ==================== BOSS 定义 ====================

/** BOSS 怪物定义 */
export const BOSS_MONSTERS: Record<number, MonsterDef> = {
  20: {
    id: 'mud_golem',
    name: '泥岩巨兽',
    hp: 80,
    attack: 8,
    defense: 5,
    expReward: 50,
    drops: [
      { itemId: 'copper_ore', chance: 1.0 },
      { itemId: 'quartz', chance: 1.0 }
    ],
    description: '浅矿区域的霸主，岩石般的巨大身躯。'
  },
  40: {
    id: 'frost_queen',
    name: '冰霜女王',
    hp: 120,
    attack: 12,
    defense: 6,
    expReward: 80,
    drops: [
      { itemId: 'iron_ore', chance: 1.0 },
      { itemId: 'jade', chance: 1.0 }
    ],
    description: '冰霜暗河的统治者，寒气逼人。'
  },
  60: {
    id: 'lava_lord',
    name: '熔岩君主',
    hp: 180,
    attack: 16,
    defense: 8,
    expReward: 120,
    drops: [
      { itemId: 'gold_ore', chance: 1.0 },
      { itemId: 'ruby', chance: 1.0 }
    ],
    description: '熔岩层最深处的存在，烈焰之王。'
  },
  80: {
    id: 'crystal_king',
    name: '水晶之王',
    hp: 400,
    attack: 32,
    defense: 16,
    expReward: 220,
    drops: [
      { itemId: 'crystal_ore', chance: 1.0 },
      { itemId: 'moonstone', chance: 1.0 }
    ],
    description: '万千水晶聚合的意志体，折射光芒致命。'
  },
  100: {
    id: 'shadow_sovereign',
    name: '暗影君主',
    hp: 600,
    attack: 42,
    defense: 20,
    expReward: 350,
    drops: [
      { itemId: 'shadow_ore', chance: 1.0 },
      { itemId: 'obsidian', chance: 1.0 }
    ],
    description: '暗影裂隙深处的至高统治者。'
  },
  120: {
    id: 'abyss_dragon',
    name: '深渊龙王',
    hp: 900,
    attack: 55,
    defense: 25,
    expReward: 500,
    drops: [
      { itemId: 'void_ore', chance: 1.0 },
      { itemId: 'dragon_jade', chance: 1.0 }
    ],
    description: '沉睡于无底深渊的远古龙王，终极敌人。'
  }
}
