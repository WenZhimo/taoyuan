import { describe, expect, expectTypeOf, it } from 'vitest'
import type { SeedGenetics } from '@/types/breeding'
import {
  HAY_ITEM_ID,
  NOURISHING_FEED_ID,
  PREMIUM_FEED_ID,
  VITALITY_FEED_ID
} from '@/data/animalDefinitions'
import { FEED_DEFS } from '@/data/animalFeedDefinitions'
import {
  BASE_BREEDING_BOX,
  BASE_MUTATION_MAGNITUDE,
  GENERATIONAL_STABILITY_GAIN,
  getDefaultGenetics,
  getSeedMakerGeneticChance,
  getStarRating,
  getTotalStats,
  MAX_BREEDING_STATIONS,
  MAX_STABILITY,
  MUTATION_JUMP_MAX,
  MUTATION_JUMP_MIN,
  MUTATION_RATE_DRIFT,
  SEED_BOX_UPGRADE_INCREMENT,
  SEED_BOX_UPGRADES
} from '@/data/breeding'
import {
  CAVE_QUALITY_THRESHOLDS,
  CAVE_UNLOCK_EARNINGS,
  getCaveQuality,
  GREENHOUSE_UPGRADES,
  type GreenhouseUpgradeDef,
  WAREHOUSE_UNLOCK_MATERIALS
} from '@/data/buildings'
import {
  DISEASE_CHANCE_BASE,
  FEED_WATER_RESTORE,
  GENETICS_FLUCTUATION_BASE,
  POND_MUTATION_JUMP_MAX,
  POND_MUTATION_JUMP_MIN,
  PURIFIER_WATER_RESTORE,
  WATER_QUALITY_DECAY_BASE,
  WATER_QUALITY_DECAY_CROWDED,
  WATER_QUALITY_DECAY_HALF,
  WATER_QUALITY_DECAY_HUNGRY
} from '@/data/fishPond'
import {
  FRIENDLY_ANIMALS,
  type FriendlyAnimalDef,
  HOSTILE_ANIMALS
} from '@/data/forage'
import type { ForageItemDef } from '@/data/forageDefinitions'
import {
  FORTUNE_TIERS,
  getFortuneTip,
  getLivingTip,
  getRecipeTipMessage,
  LIVING_TIPS,
  NO_RECIPE_TIP,
  TIP_NPC_IDS,
  type TipNpcId,
  WEATHER_TIPS
} from '@/data/npcTips'
import {
  AUTO_PETTER,
  BAITS,
  CRAB_POT_CRAFT,
  FERTILIZERS,
  getBaitById,
  getFertilizerById,
  getTackleById,
  LIGHTNING_ROD,
  SCARECROW,
  TACKLES,
  TAPPER
} from '@/data/processing'
import {
  isMomoFumo,
  MOMO_FUMO_EXCHANGE,
  MOMO_FUMO_ITEM_ID
} from '@/data/specialItems'
import {
  ACTION_TIME_COSTS,
  DAY_END_HOUR,
  DAY_START_HOUR,
  getLocationGroupName,
  getNpcUnavailableReason,
  getTimePeriod,
  getWeekday,
  isNpcAvailable,
  isShopOpen,
  LATE_NIGHT_RECOVERY_MAX,
  LATE_NIGHT_RECOVERY_MIN,
  MIDNIGHT_HOUR,
  MIN_ACTION_MINUTES,
  NPC_SCHEDULES,
  type NpcScheduleEntry,
  PASSOUT_HOUR,
  PASSOUT_STAMINA_RECOVERY,
  SHOP_SCHEDULES,
  type ShopSchedule,
  SKILL_TIME_REDUCTION_PER_LEVEL,
  TAB_TO_LOCATION_GROUP,
  TOOL_TIME_SAVINGS,
  TRAVEL_STAMINA,
  TRAVEL_TIME,
  WEEKDAYS
} from '@/data/timeConstants'
import { BOSS_DROP_HATS } from '@/data/hatDefinitions'
import { BOSS_DROP_RINGS } from '@/data/ringDefinitions'
import { BOSS_DROP_SHOES } from '@/data/shoeDefinitions'
import { BOSS_DROP_SHOES as COMPAT_BOSS_DROP_SHOES } from '@/data/shoes'
import { BOSS_DROP_WEAPONS } from '@/data/weaponDefinitions'
import {
  ENCHANTMENTS,
  getCustomEnchantmentCost,
  getEnchantmentById,
  getEnchantmentCost,
  getEnchantmentEffects,
  getOwnedEquipmentEnchantments,
  getOwnedWeaponEnchantments,
  getWeaponEnchantmentIds,
  getWeaponEnchantments,
  summarizeEnchantments,
  type WeaponEnchantInput
} from '@/data/weapons'
import { CHEST_DEFS, CHEST_TIER_ORDER, getItemSource } from '@/data/items'
import {
  BOSS_MONEY_REWARDS,
  BOSS_ORE_REWARDS,
  getAdjacentIndices,
  getBombIndices,
  getDarkFloorOres,
  getEdgeIndices,
  getFloorDistribution,
  getRewardNames,
  manhattanDistance,
  MAX_MINE_FLOOR,
  type SkullCavernFloorDef
} from '@/data/mine'
import {
  getShopClosedReason,
  isShopAvailable,
  SHOPS,
  type ShopDef
} from '@/data/shops'

describe('phase 6 inventory closure evidence', () => {
  it('keeps stable animal feed IDs aligned with the registered feed catalog', () => {
    expect([HAY_ITEM_ID, PREMIUM_FEED_ID, NOURISHING_FEED_ID, VITALITY_FEED_ID]).toEqual(
      FEED_DEFS.map(feed => feed.id)
    )
  })

  it('keeps breeding capacity, mutation and genetics framework rules unchanged', () => {
    expect(BASE_BREEDING_BOX).toBe(30)
    expect(SEED_BOX_UPGRADE_INCREMENT).toBe(15)
    expect(SEED_BOX_UPGRADES.map(upgrade => [upgrade.level, upgrade.cost])).toEqual([
      [1, 5_000],
      [2, 15_000],
      [3, 30_000],
      [4, 50_000],
      [5, 80_000]
    ])
    expect({
      BASE_MUTATION_MAGNITUDE,
      GENERATIONAL_STABILITY_GAIN,
      MAX_STABILITY,
      MUTATION_JUMP_MIN,
      MUTATION_JUMP_MAX,
      MUTATION_RATE_DRIFT,
      MAX_BREEDING_STATIONS
    }).toEqual({
      BASE_MUTATION_MAGNITUDE: 8,
      GENERATIONAL_STABILITY_GAIN: 3,
      MAX_STABILITY: 95,
      MUTATION_JUMP_MIN: 15,
      MUTATION_JUMP_MAX: 30,
      MUTATION_RATE_DRIFT: 5,
      MAX_BREEDING_STATIONS: 10
    })

    const fallback = getDefaultGenetics('missing_crop')
    expect(fallback).toMatchObject({
      cropId: 'missing_crop',
      generation: 0,
      sweetness: 20,
      yield: 20,
      resistance: 20,
      stability: 50,
      mutationRate: 10,
      isHybrid: false,
      hybridId: null
    })
    const genetics: SeedGenetics = {
      id: 'test_genetics',
      ...fallback,
      sweetness: 90,
      yield: 85,
      resistance: 80
    }
    expect(getTotalStats(genetics)).toBe(255)
    expect(getStarRating(genetics)).toBe(5)
    expect(getStarRating({ ...genetics, sweetness: 33, yield: 33, resistance: 33 })).toBe(1)
    expect(getSeedMakerGeneticChance(0)).toBe(0.3)
    expect(getSeedMakerGeneticChance(10)).toBeCloseTo(0.6)
  })

  it('keeps cave, warehouse and greenhouse framework boundaries unchanged', () => {
    expect(CAVE_UNLOCK_EARNINGS).toBe(25_000)
    expect(CAVE_QUALITY_THRESHOLDS).toEqual([
      { days: 0, quality: 'normal' },
      { days: 56, quality: 'fine' },
      { days: 112, quality: 'excellent' },
      { days: 224, quality: 'supreme' }
    ])
    expect([-1, 0, 55, 56, 111, 112, 223, 224].map(getCaveQuality)).toEqual([
      'normal', 'normal', 'normal', 'fine', 'fine', 'excellent', 'excellent', 'supreme'
    ])
    expect(WAREHOUSE_UNLOCK_MATERIALS).toEqual([
      { itemId: 'wood', quantity: 300 },
      { itemId: 'iron_ore', quantity: 20 }
    ])
    expect(GREENHOUSE_UPGRADES).toEqual([])
    expectTypeOf<GreenhouseUpgradeDef>().toMatchTypeOf<{
      level: number
      plotCount: number
      gridCols: number
    }>()
  })

  it('keeps fish pond water, disease and genetics rules unchanged', () => {
    expect({
      WATER_QUALITY_DECAY_BASE,
      WATER_QUALITY_DECAY_HALF,
      WATER_QUALITY_DECAY_CROWDED,
      WATER_QUALITY_DECAY_HUNGRY,
      DISEASE_CHANCE_BASE,
      FEED_WATER_RESTORE,
      PURIFIER_WATER_RESTORE,
      GENETICS_FLUCTUATION_BASE,
      POND_MUTATION_JUMP_MIN,
      POND_MUTATION_JUMP_MAX
    }).toEqual({
      WATER_QUALITY_DECAY_BASE: 2,
      WATER_QUALITY_DECAY_HALF: 2,
      WATER_QUALITY_DECAY_CROWDED: 3,
      WATER_QUALITY_DECAY_HUNGRY: 5,
      DISEASE_CHANCE_BASE: 0.05,
      FEED_WATER_RESTORE: 10,
      PURIFIER_WATER_RESTORE: 30,
      GENETICS_FLUCTUATION_BASE: 15,
      POND_MUTATION_JUMP_MIN: 15,
      POND_MUTATION_JUMP_MAX: 30
    })
  })

  it('keeps forage encounters framework-owned and the forage compatibility type stable', () => {
    expect(FRIENDLY_ANIMALS.map(animal => animal.id)).toEqual([
      'wild_chicken', 'wild_cow', 'wild_rabbit', 'wild_goat'
    ])
    expect(HOSTILE_ANIMALS.map(monster => monster.id)).toEqual([
      'forest_wolf', 'forest_bear', 'forest_tiger'
    ])
    expect(FRIENDLY_ANIMALS.reduce((sum, animal) => sum + animal.weight, 0)).toBe(14)
    expectTypeOf<FriendlyAnimalDef>().toMatchTypeOf<{ id: string, season: string[], weight: number }>()
    expectTypeOf<ForageItemDef>().toMatchTypeOf<{
      itemId: string
      name: string
      season: string[]
      chance: number
      expReward: number
    }>()
  })

  it('keeps NPC daily tip text selection and formatting unchanged', () => {
    expect(Object.keys(WEATHER_TIPS)).toEqual(['sunny', 'rainy', 'stormy', 'snowy', 'windy', 'green_rain'])
    expect(FORTUNE_TIERS.map(tier => tier.min)).toEqual([0.07, 0.03, -0.03, -0.07, -Infinity])
    expect([0.07, 0.03, -0.03, -0.07, -0.08].map(getFortuneTip)).toEqual(
      FORTUNE_TIERS.map(tier => tier.message)
    )
    expect(LIVING_TIPS).toHaveLength(25)
    expect(getLivingTip(1, 1)).toBe(LIVING_TIPS[0])
    expect(getLivingTip(1, 2)).toBe(LIVING_TIPS[112 % LIVING_TIPS.length])
    expect(getRecipeTipMessage('包子', ['面粉', '青菜'])).toBe('今天教你做包子，需要面粉、青菜。')
    expect(NO_RECIPE_TIP).toBe('好好学做饭，以后日子还长着呢。')
    expect(TIP_NPC_IDS).toEqual(['li_yu', 'zhou_xiucai', 'wang_dashen', 'liu_cunzhang'])
    expectTypeOf<TipNpcId>().toEqualTypeOf<(typeof TIP_NPC_IDS)[number]>()
  })

  it('keeps mechanism-bound processing lookups and craft descriptors unchanged', () => {
    expect(getFertilizerById(FERTILIZERS[0]!.id)).toBe(FERTILIZERS[0])
    expect(getBaitById(BAITS[0]!.id)).toBe(BAITS[0])
    expect(getTackleById(TACKLES[0]!.id)).toBe(TACKLES[0])
    expect(getFertilizerById('missing')).toBeUndefined()
    expect(getBaitById('missing')).toBeUndefined()
    expect(getTackleById('missing')).toBeUndefined()
    expect([TAPPER, CRAB_POT_CRAFT, LIGHTNING_ROD, SCARECROW, AUTO_PETTER].map(def => ({
      id: def.id,
      craftMoney: def.craftMoney,
      materialCount: def.craftCost.length
    }))).toEqual([
      { id: 'tapper', craftMoney: 200, materialCount: 2 },
      { id: 'crab_pot', craftMoney: 500, materialCount: 2 },
      { id: 'lightning_rod', craftMoney: 300, materialCount: 3 },
      { id: 'scarecrow', craftMoney: 150, materialCount: 3 },
      { id: 'auto_petter', craftMoney: 5_000, materialCount: 3 }
    ])
  })

  it('keeps the special item ID registered while exchange behavior remains framework-owned', () => {
    expect(MOMO_FUMO_ITEM_ID).toBe('momo_fumo')
    expect(MOMO_FUMO_EXCHANGE).toEqual({
      sourceItemId: 'cabbage',
      sourceQuantity: 2_000,
      outputItemId: 'momo_fumo',
      outputQuantity: 2_000,
      outputQuality: 'supreme'
    })
    expect(isMomoFumo('momo_fumo')).toBe(true)
    expect(isMomoFumo('cabbage')).toBe(false)
  })

  it('keeps time, travel, shop and NPC schedule framework rules unchanged', () => {
    expect({ DAY_START_HOUR, DAY_END_HOUR, MIDNIGHT_HOUR, PASSOUT_HOUR }).toEqual({
      DAY_START_HOUR: 6,
      DAY_END_HOUR: 26,
      MIDNIGHT_HOUR: 24,
      PASSOUT_HOUR: 26
    })
    expect(WEEKDAYS).toEqual(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
    expect([1, 7, 8].map(getWeekday)).toEqual(['mon', 'sun', 'mon'])
    expect([6, 12, 17, 20, 24].map(getTimePeriod)).toEqual([
      'morning', 'afternoon', 'evening', 'night', 'late_night'
    ])
    expect(ACTION_TIME_COSTS).toMatchObject({ plant: 0.17, mineOre: 0.25, cook: 0.5, gift: 0 })
    expect(TOOL_TIME_SAVINGS).toEqual({ basic: 0, iron: 10, steel: 20, iridium: 30 })
    expect(SKILL_TIME_REDUCTION_PER_LEVEL).toBe(0.02)
    expect(MIN_ACTION_MINUTES).toBe(10)
    expect(TAB_TO_LOCATION_GROUP).toMatchObject({ farm: 'farm', shop: 'village_area', mining: 'mine', inventory: null })
    expect(TRAVEL_TIME['farm->mine']).toBe(0.33)
    expect(TRAVEL_STAMINA['farm->mine']).toBe(2)
    expect(getLocationGroupName('hanhai')).toBe('瀚海')
    expect(SHOP_SCHEDULES.map(schedule => schedule.tabKey)).toEqual(['shop', 'upgrade'])
    expect(isShopOpen('upgrade', 7, 10)).toEqual({ open: false, reason: '工坊今天（周日）休息。' })
    expect(isShopOpen('upgrade', 1, 10)).toEqual({ open: true })
    expect(NPC_SCHEDULES).toHaveLength(34)
    expect(isNpcAvailable('a_shi', 1, 8)).toBe(true)
    expect(isNpcAvailable('a_shi', 7, 8)).toBe(false)
    expect(getNpcUnavailableReason('a_shi', 7, 8)).toBe('今天不在村里')
    expect({ LATE_NIGHT_RECOVERY_MAX, LATE_NIGHT_RECOVERY_MIN, PASSOUT_STAMINA_RECOVERY }).toEqual({
      LATE_NIGHT_RECOVERY_MAX: 0.9,
      LATE_NIGHT_RECOVERY_MIN: 0.6,
      PASSOUT_STAMINA_RECOVERY: 0.5
    })
    expectTypeOf<ShopSchedule>().toMatchTypeOf<{ tabKey: string, closedDays: string[] }>()
    expectTypeOf<NpcScheduleEntry>().toMatchTypeOf<{ npcId: string, availableHours: { from: number, to: number } }>()
  })

  it('keeps boss first-kill equipment mappings in the mining reward framework', () => {
    expect(BOSS_DROP_WEAPONS).toEqual({
      20: 'mud_king_fang',
      40: 'frost_queen_sting',
      60: 'lava_lord_maul',
      80: 'crystal_king_blade',
      100: 'shadow_sovereign_fang',
      120: 'abyss_dragon_mace'
    })
    expect(BOSS_DROP_RINGS).toEqual({
      20: 'mud_golem_band',
      40: 'frost_queen_circlet',
      60: 'lava_lord_seal',
      80: 'crystal_king_seal',
      100: 'shadow_sovereign_ring',
      120: 'abyss_dragon_ring'
    })
    expect(BOSS_DROP_HATS).toEqual({
      20: 'golem_stone_cap',
      40: 'frost_queen_tiara',
      80: 'crystal_king_crown',
      120: 'abyss_dragon_horns'
    })
    expect(BOSS_DROP_SHOES).toEqual({
      40: 'frost_queen_slippers',
      60: 'lava_lord_greaves',
      100: 'shadow_sovereign_treads',
      120: 'abyss_dragon_treads'
    })
    expect(COMPAT_BOSS_DROP_SHOES).toBe(BOSS_DROP_SHOES)
  })

  it('keeps enchantment compatibility lookup and equipment algorithms unchanged', () => {
    const ids = Object.keys(ENCHANTMENTS).slice(0, 2)
    const firstId = ids[0]!
    const weapon = { enchantmentId: firstId, enchantmentIds: ids }

    expect(getEnchantmentById(firstId)).toBe(ENCHANTMENTS[firstId])
    expect(getEnchantmentById('missing')).toBeUndefined()
    expect(getWeaponEnchantmentIds(weapon)).toEqual(ids)
    expect(getWeaponEnchantments(ids)).toEqual(ids.map(id => ENCHANTMENTS[id]))
    expect(getOwnedWeaponEnchantments(weapon)).toEqual(ids.map(id => ENCHANTMENTS[id]))
    expect(getOwnedEquipmentEnchantments(weapon)).toEqual(ids.map(id => ENCHANTMENTS[id]))
    expect(summarizeEnchantments(ids).length).toBeGreaterThan(0)
    expect(getEnchantmentEffects(ids).length).toBeGreaterThan(0)
    expect(getEnchantmentCost(firstId)).toBeGreaterThan(0)
    expect(getCustomEnchantmentCost(ids)).toBe(
      ids.reduce((sum, id) => sum + getEnchantmentCost(id), 0) * 10
    )
    expectTypeOf<WeaponEnchantInput>().toEqualTypeOf<string | string[] | null | undefined>()
  })

  it('keeps non-registry inventory, mining and shop framework helpers explicit', () => {
    expect(CHEST_TIER_ORDER).toEqual(['wood', 'copper', 'iron', 'gold', 'void'])
    expect(Object.keys(CHEST_DEFS)).toEqual(CHEST_TIER_ORDER)
    expect(getItemSource('cabbage')).toBeTypeOf('string')

    expect(MAX_MINE_FLOOR).toBe(120)
    expect(getDarkFloorOres()).toEqual(expect.arrayContaining(['copper_ore', 'void_ore']))
    expect(BOSS_MONEY_REWARDS).toMatchObject({ 20: 100, 120: 3_000 })
    expect(BOSS_ORE_REWARDS[20]).toEqual([{ itemId: 'copper_ore', quantity: 3 }])
    expect(getRewardNames(BOSS_ORE_REWARDS[20]!)).toBe('铜矿×3')
    expect(getEdgeIndices()).toHaveLength(20)
    expect(getAdjacentIndices(0)).toEqual([6, 1])
    expect(manhattanDistance(0, 7)).toBe(2)
    expect(getBombIndices(7, 'cherry_bomb')).toEqual(expect.arrayContaining([7, 1, 6, 8, 13]))
    expect(getFloorDistribution(null)).toMatchObject({ monsterCount: [3, 4] })
    expectTypeOf<SkullCavernFloorDef>().toMatchTypeOf<{ floor: number, ores: string[] }>()

    const shop: ShopDef = SHOPS[0]!
    expect(isShopAvailable(shop, 1, shop.openHour, 'sunny', 'spring')).toBe(true)
    expect(getShopClosedReason(shop, 1, shop.closeHour, 'sunny', 'spring')).toBe('已打烊')
  })
})
