import { toOfficialRegistryTypeId } from './ids'
import type { RegistryDefinition, RegistryEntry } from './registry'

export const OFFICIAL_REGISTRY_DEFINITIONS = [
  {
    registryId: toOfficialRegistryTypeId('tag'),
    description: '物品和配方标签',
    schemaName: 'tag.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('item'),
    description: '物品定义',
    schemaName: 'item.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('crop'),
    description: '作物定义',
    schemaName: 'crop.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('tree'),
    description: '果树和野树定义',
    schemaName: 'tree.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('fish'),
    description: '鱼类定义',
    schemaName: 'fish.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('forage'),
    description: '竹林采集物定义',
    schemaName: 'forage.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('animal'),
    description: '动物物种定义',
    schemaName: 'animal.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('animal_feed'),
    description: '动物饲料定义',
    schemaName: 'animal-feed.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('wallet_item'),
    description: '钱袋永久被动物品定义',
    schemaName: 'wallet-item.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('museum_category'),
    description: '博物馆分类定义',
    schemaName: 'museum-category.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('museum_item'),
    description: '博物馆可捐赠物品定义',
    schemaName: 'museum-item.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('museum_milestone'),
    description: '博物馆里程碑奖励定义',
    schemaName: 'museum-milestone.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('guild_goal'),
    description: '行会怪物讨伐目标定义',
    schemaName: 'guild-goal.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('guild_donation'),
    description: '行会捐献物品定义',
    schemaName: 'guild-donation.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('guild_level'),
    description: '行会等级经验定义',
    schemaName: 'guild-level.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('npc'),
    description: '村民 NPC 定义',
    schemaName: 'npc.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('heart_event'),
    description: 'NPC 和隐藏仙灵好感事件定义',
    schemaName: 'heart-event.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('hidden_npc'),
    description: '隐藏仙灵 NPC 定义',
    schemaName: 'hidden-npc.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('story_quest'),
    description: 'Story quest definitions',
    schemaName: 'story-quest.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('secret_note'),
    description: '秘密纸条定义',
    schemaName: 'secret-note.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('tutorial'),
    description: '晨间教程提示定义',
    schemaName: 'tutorial.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('morning_event'),
    description: '晨间随机事件定义',
    schemaName: 'morning-event.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('season_event'),
    description: '季节节日事件定义',
    schemaName: 'season-event.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('quest_template'),
    description: '普通委托和特殊订单模板定义',
    schemaName: 'quest-template.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('farm_map'),
    description: '开局田庄地图定义',
    schemaName: 'farm-map.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('animal_building'),
    description: '动物建筑与升级定义',
    schemaName: 'animal-building.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('animal_incubation'),
    description: '动物孵化映射定义',
    schemaName: 'animal-incubation.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('breeding_hybrid'),
    description: '育种杂交品种定义',
    schemaName: 'breeding-hybrid.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('processing_machine'),
    description: '加工机器制造定义',
    schemaName: 'processing-machine.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('processing_recipe'),
    description: '加工配方定义',
    schemaName: 'processing-recipe.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('sprinkler'),
    description: '洒水器制造定义',
    schemaName: 'sprinkler.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('bomb'),
    description: '炸弹制造定义',
    schemaName: 'bomb.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('tool_upgrade'),
    description: '工具升级费用定义',
    schemaName: 'tool-upgrade.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('pondable_fish'),
    description: '鱼塘可养殖鱼种定义',
    schemaName: 'pondable-fish.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('pond_breed'),
    description: '鱼塘品种图鉴定义',
    schemaName: 'pond-breed.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('fish_pond_facility'),
    description: '鱼塘建造、升级和容量定义',
    schemaName: 'fish-pond-facility.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('building_upgrade'),
    description: '农舍、山洞和酒窖升级定义',
    schemaName: 'building-upgrade.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('monster'),
    description: '怪物定义',
    schemaName: 'monster.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('monster_pool'),
    description: '有序怪物候选池',
    schemaName: 'monster-pool.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('enchantment'),
    description: '装备附魔定义',
    schemaName: 'enchantment.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('equipment'),
    description: '单件装备定义',
    schemaName: 'equipment.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('equipment_set'),
    description: '装备套装定义',
    schemaName: 'equipment-set.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('drop_table'),
    description: '掉落表定义',
    schemaName: 'drop-table.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('recipe'),
    description: '配方定义',
    schemaName: 'recipe.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('achievement'),
    description: '成就定义',
    schemaName: 'achievement.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('community_bundle'),
    description: '祠堂任务定义',
    schemaName: 'community-bundle.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('shop'),
    description: '商店定义',
    schemaName: 'shop.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('shop_offer'),
    description: '商店商品定义',
    schemaName: 'shop-offer.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('market_category'),
    description: '市场行情分类定义',
    schemaName: 'market-category.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('hanhai_trade_exchange'),
    description: '瀚海通商积分兑换定义',
    schemaName: 'hanhai-trade-exchange.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('hanhai_trade_shop_upgrade'),
    description: '瀚海通商店铺升级定义',
    schemaName: 'hanhai-trade-shop-upgrade.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('hanhai_treasure_reward'),
    description: '瀚海藏宝图奖励定义',
    schemaName: 'hanhai-treasure-reward.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('hanhai_roulette'),
    description: '瀚海幸运轮盘配置',
    schemaName: 'hanhai-roulette.schema.json'
  },
  {
    registryId: toOfficialRegistryTypeId('hanhai_casino_wager'),
    description: '瀚海赌坊固定投注配置',
    schemaName: 'hanhai-casino-wager.schema.json'
  }
] as const satisfies readonly RegistryDefinition<RegistryEntry>[]
