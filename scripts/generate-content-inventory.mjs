import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { getDefaultInventoryStatus } from './content-inventory-policy.mjs'

const root = process.cwd()
const dataRoot = path.join(root, 'src', 'data')
const outputPath = path.join(root, 'docs-source', '模组系统实施计划', 'content-inventory.json')
const sourceRoot = 'src/data'

const readText = file => fs.readFileSync(file, 'utf8')
const toPosix = file => file.replaceAll(path.sep, '/')
const relative = file => toPosix(path.relative(root, file))

const contentNames = new Set([
  'ACHIEVEMENTS',
  'ANIMAL_BUILDINGS',
  'ANIMAL_DEFS',
  'BAITS',
  'BOMBS',
  'BUILDING_UPGRADES',
  'CAVE_UPGRADES',
  'CELLAR_UPGRADES',
  'COMMUNITY_BUNDLES',
  'CRICKETS',
  'CROPS',
  'FARMHOUSE_UPGRADES',
  'FARM_MAP_DEFS',
  'FEED_DEFS',
  'FERTILIZERS',
  'FISH',
  'FISH_POND_FACILITY',
  'FORAGE_ITEMS',
  'FRIENDLY_ANIMALS',
  'FRUIT_TREE_DEFS',
  'GUILD_DONATIONS',
  'GUILD_LEVELS',
  'GUILD_SHOP_ITEMS',
  'HANHAI_FIXED_ITEMS',
  'HANHAI_ROTATING_POOL',
  'HANHAI_ROULETTE_CONFIG',
  'HANHAI_CASINO_WAGERS',
  'HANHAI_TREASURE_REWARDS',
  'HATS',
  'HEART_EVENTS',
  'HIDDEN_NPCS',
  'HIDDEN_NPC_HEART_EVENTS',
  'HOSTILE_ANIMALS',
  'HYBRID_DEFINITIONS',
  'HYBRID_DEFS',
  'MONSTER_GOALS',
  'MORNING_CHOICE_EVENTS',
  'MORNING_EASTER_EGGS',
  'MORNING_NARRATIONS',
  'MORNING_TIPS',
  'MARKET_CATEGORY_DEFINITIONS',
  'MUSEUM_CATEGORIES',
  'MUSEUM_ITEMS',
  'MUSEUM_MILESTONES',
  'NPCS',
  'PONDABLE_FISH',
  'POND_BREEDS',
  'PROCESSING_MACHINES',
  'PROCESSING_RECIPES',
  'QUEST_TEMPLATES',
  'RECIPES',
  'RINGS',
  'ROULETTE_BET_TIERS',
  'ROULETTE_OUTCOMES',
  'SECRET_NOTES',
  'SEASON_EVENTS',
  'SHOES',
  'SHOPS',
  'SPRINKLERS',
  'STORY_QUESTS',
  'TACKLES',
  'TEXAS_TIERS',
  'TOOL_UPGRADE_COSTS',
  'EQUIPMENT_SET_DEFINITIONS',
  'TRADE_EXCHANGE_ITEMS',
  'TRADE_SHOP_UPGRADES',
  'TRAVELING_MERCHANT_POOL',
  'WALLET_ITEMS',
  'WEAPONS',
  'WILD_TREE_DEFS'
])

const derivedNames = [
  /^BOSS_DROP_/,
  /^BREED_COUNTS$/,
  /^HYBRID_TIER_COUNTS$/,
  /^CRAFTABLE_/,
  /^MINE_FLOORS$/,
  /^MONSTER_DROP_/,
  /^NARRATIONS_NO_LOSS$/,
  /^SHOP_/,
  /^TREASURE_DROP_/,
  /^ZONE_MONSTERS$/
]

const algorithmNamePrefixes = [
  'calc',
  'calculate',
  'clamp',
  'compare',
  'create',
  'deal',
  'dealer',
  'evaluate',
  'fight',
  'format',
  'generate',
  'load',
  'make',
  'normalize',
  'play',
  'roll',
  'scale',
  'should',
  'spin',
  'texas'
]

const adapterNamePrefixes = ['find', 'get', 'is']

const uiNames = [
  /_COLORS$/,
  /_LABELS$/,
  /_NAMES$/,
  /^THEMES$/,
  /^hexToRgb$/,
  /^getThemeByKey$/
]

const fileDefaults = new Map(
  JSON.parse(readText(outputPath)).entries.map(entry => [entry.file, entry])
)

fileDefaults.set('src/data/monsters.ts', {
  file: 'src/data/monsters.ts',
  classification: 'content',
  domains: ['monster', 'monster_pool'],
  candidateTargets: ['taoyuan:monster', 'taoyuan:monster_pool'],
  phases: [5],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/treeDefinitions.ts', {
  file: 'src/data/treeDefinitions.ts',
  classification: 'content',
  domains: ['fruit_tree', 'wild_tree'],
  candidateTargets: ['taoyuan:tree'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/fishDefinitions.ts', {
  file: 'src/data/fishDefinitions.ts',
  classification: 'mixed',
  domains: ['fish', 'fishing_location'],
  candidateTargets: ['taoyuan:fish', 'ui/fishing-location'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/fish.ts', {
  file: 'src/data/fish.ts',
  classification: 'mixed',
  domains: ['fish', 'fishing_location', 'lookup'],
  candidateTargets: ['taoyuan:fish', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/fishPondDefinitions.ts', {
  file: 'src/data/fishPondDefinitions.ts',
  classification: 'content',
  domains: ['pondable_fish'],
  candidateTargets: ['taoyuan:pondable_fish'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/fishPondFacilityDefinitions.ts', {
  file: 'src/data/fishPondFacilityDefinitions.ts',
  classification: 'content',
  domains: ['fish_pond_facility'],
  candidateTargets: ['taoyuan:fish_pond_facility'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/buildingUpgradeDefinitions.ts', {
  file: 'src/data/buildingUpgradeDefinitions.ts',
  classification: 'content',
  domains: ['building_upgrade'],
  candidateTargets: ['taoyuan:building_upgrade'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/buildings.ts', {
  file: 'src/data/buildings.ts',
  classification: 'mixed',
  domains: ['building_upgrade', 'facilities', 'greenhouse', 'warehouse', 'cave_quality'],
  candidateTargets: ['taoyuan:building_upgrade', 'engine/domain/facilities', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/fishPond.ts', {
  file: 'src/data/fishPond.ts',
  classification: 'mixed',
  domains: ['pondable_fish', 'fish_pond_rules', 'lookup'],
  candidateTargets: ['taoyuan:pondable_fish', 'taoyuan:fish_pond_facility', 'engine/domain/fish-pond', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/pondBreedDefinitions.ts', {
  file: 'src/data/pondBreedDefinitions.ts',
  classification: 'mixed',
  domains: ['pond_breed', 'fish_pond_breed_generation'],
  candidateTargets: ['taoyuan:pond_breed', 'engine/domain/fish-pond'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/pondBreeds.ts', {
  file: 'src/data/pondBreeds.ts',
  classification: 'mixed',
  domains: ['pond_breed', 'lookup'],
  candidateTargets: ['taoyuan:pond_breed', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/forageDefinitions.ts', {
  file: 'src/data/forageDefinitions.ts',
  classification: 'content',
  domains: ['forage'],
  candidateTargets: ['taoyuan:forage'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/animalDefinitions.ts', {
  file: 'src/data/animalDefinitions.ts',
  classification: 'mixed',
  domains: ['animal', 'feed'],
  candidateTargets: ['taoyuan:animal', 'engine/domain/animal-feed'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/animalFeedDefinitions.ts', {
  file: 'src/data/animalFeedDefinitions.ts',
  classification: 'mixed',
  domains: ['animal_feed'],
  candidateTargets: ['taoyuan:animal_feed'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/walletDefinitions.ts', {
  file: 'src/data/walletDefinitions.ts',
  classification: 'content',
  domains: ['wallet_item'],
  candidateTargets: ['taoyuan:wallet_item'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/wallet.ts', {
  file: 'src/data/wallet.ts',
  classification: 'mixed',
  domains: ['wallet_item', 'lookup'],
  candidateTargets: ['taoyuan:wallet_item', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/museumDefinitions.ts', {
  file: 'src/data/museumDefinitions.ts',
  classification: 'content',
  domains: ['museum_item', 'museum_category', 'museum_milestone'],
  candidateTargets: ['taoyuan:museum_item', 'taoyuan:museum_category', 'taoyuan:museum_milestone'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/museum.ts', {
  file: 'src/data/museum.ts',
  classification: 'mixed',
  domains: ['museum_item', 'museum_category', 'museum_milestone', 'lookup'],
  candidateTargets: ['taoyuan:museum_item', 'taoyuan:museum_category', 'taoyuan:museum_milestone', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/guildDefinitions.ts', {
  file: 'src/data/guildDefinitions.ts',
  classification: 'mixed',
  domains: ['guild_goal', 'guild_shop', 'guild_donation', 'guild_level', 'guild_bonus'],
  candidateTargets: ['taoyuan:guild_goal', 'taoyuan:shop_offer', 'taoyuan:guild_donation', 'taoyuan:guild_level', 'engine/domain/guild'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/guild.ts', {
  file: 'src/data/guild.ts',
  classification: 'mixed',
  domains: ['guild_goal', 'guild_shop', 'guild_donation', 'guild_level', 'guild_bonus', 'lookup'],
  candidateTargets: ['taoyuan:guild_goal', 'taoyuan:shop_offer', 'taoyuan:guild_donation', 'taoyuan:guild_level', 'engine/domain/guild', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/achievementDefinitions.ts', {
  file: 'src/data/achievementDefinitions.ts',
  classification: 'content',
  domains: ['achievement', 'community_bundle'],
  candidateTargets: ['taoyuan:achievement', 'taoyuan:community_bundle'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/achievements.ts', {
  file: 'src/data/achievements.ts',
  classification: 'mixed',
  domains: ['achievement', 'community_bundle', 'lookup'],
  candidateTargets: ['taoyuan:achievement', 'taoyuan:community_bundle', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/npcDefinitions.ts', {
  file: 'src/data/npcDefinitions.ts',
  classification: 'content',
  domains: ['npc'],
  candidateTargets: ['taoyuan:npc'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/npcs.ts', {
  file: 'src/data/npcs.ts',
  classification: 'mixed',
  domains: ['npc', 'lookup'],
  candidateTargets: ['taoyuan:npc', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/heartEventDefinitions.ts', {
  file: 'src/data/heartEventDefinitions.ts',
  classification: 'mixed',
  domains: ['heart_event', 'wedding_event'],
  candidateTargets: ['taoyuan:heart_event', 'engine/domain/wedding-event'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/heartEvents.ts', {
  file: 'src/data/heartEvents.ts',
  classification: 'mixed',
  domains: ['heart_event', 'wedding_event', 'lookup'],
  candidateTargets: ['taoyuan:heart_event', 'engine/domain/wedding-event', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/hiddenNpcDefinitions.ts', {
  file: 'src/data/hiddenNpcDefinitions.ts',
  classification: 'content',
  domains: ['hidden_npc'],
  candidateTargets: ['taoyuan:hidden_npc'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/hiddenNpcs.ts', {
  file: 'src/data/hiddenNpcs.ts',
  classification: 'mixed',
  domains: ['hidden_npc', 'lookup'],
  candidateTargets: ['taoyuan:hidden_npc', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/hiddenNpcHeartEventDefinitions.ts', {
  file: 'src/data/hiddenNpcHeartEventDefinitions.ts',
  classification: 'content',
  domains: ['heart_event'],
  candidateTargets: ['taoyuan:heart_event'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/hiddenNpcHeartEvents.ts', {
  file: 'src/data/hiddenNpcHeartEvents.ts',
  classification: 'mixed',
  domains: ['heart_event', 'lookup'],
  candidateTargets: ['taoyuan:heart_event', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/storyQuestDefinitions.ts', {
  file: 'src/data/storyQuestDefinitions.ts',
  classification: 'content',
  domains: ['story_quest'],
  candidateTargets: ['taoyuan:story_quest'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/storyQuests.ts', {
  file: 'src/data/storyQuests.ts',
  classification: 'mixed',
  domains: ['story_quest', 'lookup'],
  candidateTargets: ['taoyuan:story_quest', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/seasonEventDefinitions.ts', {
  file: 'src/data/seasonEventDefinitions.ts',
  classification: 'mixed',
  domains: ['season_event'],
  candidateTargets: ['taoyuan:season_event'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/events.ts', {
  file: 'src/data/events.ts',
  classification: 'mixed',
  domains: ['season_event', 'event_lookup'],
  candidateTargets: ['taoyuan:season_event', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/farmEventDefinitions.ts', {
  file: 'src/data/farmEventDefinitions.ts',
  classification: 'mixed',
  domains: ['morning_event', 'morning_event_no_loss'],
  candidateTargets: ['taoyuan:morning_event', 'engine/domain/morning-event'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/farmEvents.ts', {
  file: 'src/data/farmEvents.ts',
  classification: 'mixed',
  domains: ['morning_event', 'event_lookup'],
  candidateTargets: ['taoyuan:morning_event', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/questDefinitions.ts', {
  file: 'src/data/questDefinitions.ts',
  classification: 'mixed',
  domains: ['quest_template', 'quest_reward_labels'],
  candidateTargets: ['taoyuan:quest_template', 'engine/domain/quests', 'ui/quest-labels'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/quests.ts', {
  file: 'src/data/quests.ts',
  classification: 'mixed',
  domains: ['quest_template', 'quest_generation', 'lookup'],
  candidateTargets: ['taoyuan:quest_template', 'engine/domain/quests', 'compatibility_adapter', 'ui/quest-labels'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/secretNotes.ts', {
  file: 'src/data/secretNotes.ts',
  classification: 'content',
  domains: ['secret_note'],
  candidateTargets: ['taoyuan:secret_note'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/farmMapDefinitions.ts', {
  file: 'src/data/farmMapDefinitions.ts',
  classification: 'content',
  domains: ['farm_map'],
  candidateTargets: ['taoyuan:farm_map'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/farmMaps.ts', {
  file: 'src/data/farmMaps.ts',
  classification: 'mixed',
  domains: ['farm_map', 'lookup'],
  candidateTargets: ['taoyuan:farm_map', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/animalBuildingDefinitions.ts', {
  file: 'src/data/animalBuildingDefinitions.ts',
  classification: 'mixed',
  domains: ['animal_building'],
  candidateTargets: ['taoyuan:animal_building'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/animalIncubationDefinitions.ts', {
  file: 'src/data/animalIncubationDefinitions.ts',
  classification: 'mixed',
  domains: ['animal_incubation'],
  candidateTargets: ['taoyuan:animal_incubation'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/breedingDefinitions.ts', {
  file: 'src/data/breedingDefinitions.ts',
  classification: 'mixed',
  domains: ['breeding_hybrid', 'breeding_hybrid_tier'],
  candidateTargets: ['taoyuan:breeding_hybrid', 'engine/domain/breeding'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/toolUpgradeDefinitions.ts', {
  file: 'src/data/toolUpgradeDefinitions.ts',
  classification: 'mixed',
  domains: ['tool_upgrade', 'tool_labels'],
  candidateTargets: ['taoyuan:tool_upgrade', 'ui/tool-labels'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/upgrades.ts', {
  file: 'src/data/upgrades.ts',
  classification: 'mixed',
  domains: ['tool_upgrade', 'tool_labels', 'lookup'],
  candidateTargets: ['taoyuan:tool_upgrade', 'ui/tool-labels', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/processingMachineDefinitions.ts', {
  file: 'src/data/processingMachineDefinitions.ts',
  classification: 'content',
  domains: ['processing_machine'],
  candidateTargets: ['taoyuan:processing_machine'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/processingRecipeDefinitions.ts', {
  file: 'src/data/processingRecipeDefinitions.ts',
  classification: 'content',
  domains: ['processing_recipe'],
  candidateTargets: ['taoyuan:processing_recipe'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/processingCraftDefinitions.ts', {
  file: 'src/data/processingCraftDefinitions.ts',
  classification: 'mixed',
  domains: ['sprinkler', 'fertilizer', 'bait', 'tackle', 'bomb'],
  candidateTargets: ['taoyuan:sprinkler', 'taoyuan:fertilizer', 'taoyuan:bait', 'taoyuan:tackle', 'taoyuan:bomb', 'taoyuan:shop_offer'],
  phases: [3, 6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/processing.ts', {
  file: 'src/data/processing.ts',
  classification: 'mixed',
  domains: ['processing_recipe', 'processing_machine', 'processing_craft', 'bomb', 'lookup'],
  candidateTargets: ['taoyuan:processing_recipe', 'taoyuan:processing_machine', 'taoyuan:bomb', 'compatibility_adapter', 'engine/domain/processing'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/equipmentSetDefinitions.ts', {
  file: 'src/data/equipmentSetDefinitions.ts',
  classification: 'content',
  domains: ['equipment_set'],
  candidateTargets: ['taoyuan:equipment_set'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/equipmentSets.ts', {
  file: 'src/data/equipmentSets.ts',
  classification: 'mixed',
  domains: ['equipment_set', 'lookup'],
  candidateTargets: ['taoyuan:equipment_set', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/ringDefinitions.ts', {
  file: 'src/data/ringDefinitions.ts',
  classification: 'mixed',
  domains: ['equipment', 'ring', 'equipment_drop'],
  candidateTargets: ['taoyuan:equipment', 'taoyuan:drop_table', 'compatibility_adapter'],
  phases: [4, 6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/rings.ts', {
  file: 'src/data/rings.ts',
  classification: 'mixed',
  domains: ['equipment', 'ring', 'lookup'],
  candidateTargets: ['taoyuan:equipment', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/hatDefinitions.ts', {
  file: 'src/data/hatDefinitions.ts',
  classification: 'mixed',
  domains: ['equipment', 'hat', 'equipment_drop'],
  candidateTargets: ['taoyuan:equipment', 'taoyuan:drop_table', 'compatibility_adapter'],
  phases: [4, 6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/hats.ts', {
  file: 'src/data/hats.ts',
  classification: 'mixed',
  domains: ['equipment', 'hat', 'lookup'],
  candidateTargets: ['taoyuan:equipment', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/shoeDefinitions.ts', {
  file: 'src/data/shoeDefinitions.ts',
  classification: 'mixed',
  domains: ['equipment', 'shoe', 'equipment_drop'],
  candidateTargets: ['taoyuan:equipment', 'taoyuan:drop_table', 'compatibility_adapter'],
  phases: [4, 6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/shoes.ts', {
  file: 'src/data/shoes.ts',
  classification: 'mixed',
  domains: ['equipment', 'shoe', 'lookup'],
  candidateTargets: ['taoyuan:equipment', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/enchantmentDefinitions.ts', {
  file: 'src/data/enchantmentDefinitions.ts',
  classification: 'mixed',
  domains: ['enchantment'],
  candidateTargets: ['taoyuan:enchantment'],
  phases: [4],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/weaponDefinitions.ts', {
  file: 'src/data/weaponDefinitions.ts',
  classification: 'mixed',
  domains: ['equipment', 'weapon', 'equipment_drop', 'shop_offer'],
  candidateTargets: ['taoyuan:equipment', 'taoyuan:drop_table', 'taoyuan:shop_offer', 'compatibility_adapter'],
  phases: [3, 4, 6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/forage.ts', {
  file: 'src/data/forage.ts',
  classification: 'mixed',
  domains: ['forage', 'friendly_animal', 'monster', 'encounter_rules', 'lookup'],
  candidateTargets: ['taoyuan:forage', 'taoyuan:animal', 'taoyuan:monster', 'engine/domain/forage', 'compatibility_adapter'],
  phases: [5, 6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/fruitTrees.ts', {
  file: 'src/data/fruitTrees.ts',
  classification: 'mixed',
  domains: ['fruit_tree', 'lookup'],
  candidateTargets: ['taoyuan:tree', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/wildTrees.ts', {
  file: 'src/data/wildTrees.ts',
  classification: 'mixed',
  domains: ['wild_tree', 'lookup'],
  candidateTargets: ['taoyuan:tree', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/marketDefinitions.ts', {
  file: 'src/data/marketDefinitions.ts',
  classification: 'mixed',
  domains: ['market_category'],
  candidateTargets: ['taoyuan:market_category'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/market.ts', {
  file: 'src/data/market.ts',
  classification: 'mixed',
  domains: ['market_category', 'market_algorithm', 'market_ui'],
  candidateTargets: ['taoyuan:market_category', 'engine/domain/market', 'ui/market', 'compatibility_adapter'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/hanhaiDefinitions.ts', {
  file: 'src/data/hanhaiDefinitions.ts',
  classification: 'mixed',
  domains: ['hanhai_trade_exchange'],
  candidateTargets: ['taoyuan:hanhai_trade_exchange'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/hanhaiShopDefinitions.ts', {
  file: 'src/data/hanhaiShopDefinitions.ts',
  classification: 'mixed',
  domains: ['hanhai_shop_offer'],
  candidateTargets: ['taoyuan:shop_offer'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/hanhaiTradeShopDefinitions.ts', {
  file: 'src/data/hanhaiTradeShopDefinitions.ts',
  classification: 'mixed',
  domains: ['hanhai_trade_shop_upgrade'],
  candidateTargets: ['taoyuan:hanhai_trade_shop_upgrade'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/hanhaiTreasureDefinitions.ts', {
  file: 'src/data/hanhaiTreasureDefinitions.ts',
  classification: 'mixed',
  domains: ['hanhai_treasure_reward'],
  candidateTargets: ['taoyuan:hanhai_treasure_reward'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/hanhaiRouletteDefinitions.ts', {
  file: 'src/data/hanhaiRouletteDefinitions.ts',
  classification: 'mixed',
  domains: ['hanhai_roulette'],
  candidateTargets: ['taoyuan:hanhai_roulette'],
  phases: [6],
  status: 'symbol_inventoried'
})
.set('src/data/hanhaiCasinoDefinitions.ts', {
  file: 'src/data/hanhaiCasinoDefinitions.ts',
  classification: 'mixed',
  domains: ['hanhai_casino_wager'],
  candidateTargets: ['taoyuan:hanhai_casino_wager'],
  phases: [6],
  status: 'symbol_inventoried'
})

fileDefaults.set('src/data/hanhai.ts', {
  file: 'src/data/hanhai.ts',
  classification: 'mixed',
  domains: [
    'hanhai_shop_offer',
    'hanhai_trade_exchange',
    'hanhai_trade_shop_upgrade',
    'hanhai_treasure_reward',
    'hanhai_roulette',
    'hanhai_casino_wager',
    'minigame_config',
    'minigame_algorithm'
  ],
  candidateTargets: [
    'taoyuan:shop_offer',
    'taoyuan:hanhai_trade_exchange',
    'taoyuan:hanhai_trade_shop_upgrade',
    'taoyuan:hanhai_treasure_reward',
    'taoyuan:hanhai_roulette',
    'taoyuan:hanhai_casino_wager',
    'taoyuan:minigame_config',
    'engine/domain/hanhai',
    'compatibility_adapter'
  ],
  phases: [6],
  status: 'symbol_inventoried'
})

const dataFiles = fs.readdirSync(dataRoot)
  .filter(file => file.endsWith('.ts'))
  .map(file => path.join(dataRoot, file))
  .sort((a, b) => a.localeCompare(b))

const allSourceFiles = []
const collectSourceFiles = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) collectSourceFiles(full)
    else if (/\.(ts|vue)$/.test(entry.name)) allSourceFiles.push(full)
  }
}
collectSourceFiles(path.join(root, 'src'))

const sourceTexts = new Map(allSourceFiles.map(file => [relative(file), readText(file)]))

const getConsumers = (exportName, ownFile) => {
  const pattern = new RegExp(`\\b${exportName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
  return Array.from(sourceTexts.entries())
    .filter(([file, text]) => file !== ownFile && pattern.test(text))
    .map(([file]) => file)
    .sort()
}

const hasExportModifier = node =>
  Boolean(ts.canHaveModifiers(node) && ts.getModifiers(node)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword))

const getExportedSymbols = file => {
  const text = readText(file)
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const symbols = []

  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement)) {
      const moduleName = statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
        ? statement.moduleSpecifier.text
        : ''
      if (!statement.exportClause) {
        symbols.push({ exportName: `* from ${moduleName}`, syntaxKind: 're-export', initializerText: '' })
      } else if (ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) {
          symbols.push({ exportName: element.name.text, syntaxKind: 're-export', initializerText: '' })
        }
      }
      continue
    }

    if (!hasExportModifier(statement)) continue
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          symbols.push({
            exportName: declaration.name.text,
            syntaxKind: 'const',
            initializerText: declaration.initializer?.getText(source) ?? ''
          })
        }
      }
      continue
    }
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      symbols.push({ exportName: statement.name.text, syntaxKind: 'function', initializerText: statement.getText(source) })
      continue
    }
    if (ts.isInterfaceDeclaration(statement)) {
      symbols.push({ exportName: statement.name.text, syntaxKind: 'interface', initializerText: '' })
      continue
    }
    if (ts.isTypeAliasDeclaration(statement)) {
      symbols.push({ exportName: statement.name.text, syntaxKind: 'type', initializerText: '' })
    }
  }

  return symbols
}

const startsWithAny = (value, prefixes) => prefixes.some(prefix => value.startsWith(prefix))

const classifySymbol = (fileEntry, symbol) => {
  const { exportName, syntaxKind, initializerText } = symbol
  if (fileEntry.classification === 'barrel' || syntaxKind === 're-export') return 'barrel'
  if (fileEntry.file.endsWith('/themes.ts') || uiNames.some(pattern => pattern.test(exportName))) return 'ui'
  if (syntaxKind === 'interface' || syntaxKind === 'type') return 'adapter'
  if (contentNames.has(exportName)) return 'content'
  if (derivedNames.some(pattern => pattern.test(exportName))) return 'derived'
  if (initializerText.includes('Math.random') || startsWithAny(exportName, algorithmNamePrefixes)) return 'algorithm'
  if (startsWithAny(exportName, adapterNamePrefixes)) return 'adapter'
  if (/_(CHANCE|RATE|CAP|DAYS|COST|COUNT|MULTIPLIER|THRESHOLD|PENALTY|BONUS|LIMIT|AMOUNT|HP)$/.test(exportName)) return 'algorithm'
  if (fileEntry.classification === 'framework') return 'ui'
  if (fileEntry.classification === 'content') return 'content'
  return 'adapter'
}

const getTargetRegistry = (fileEntry, classification) => {
  if (classification === 'content' || classification === 'derived') {
    return fileEntry.candidateTargets?.find(target => target.startsWith('taoyuan:'))
  }
  if (classification === 'algorithm') return fileEntry.candidateTargets?.find(target => target.startsWith('engine/'))
  if (classification === 'ui') return fileEntry.candidateTargets?.find(target => target.startsWith('ui/') || target === 'locales')
  if (classification === 'adapter') return fileEntry.candidateTargets?.find(target => target.includes('adapter'))
  return undefined
}

const getRationale = (classification, syntaxKind) => {
  if (syntaxKind === 'interface' || syntaxKind === 'type') return 'TypeScript-only compatibility shape; public contracts move to TypeBox schemas.'
  if (classification === 'content') return 'Static content definition exported from src/data.'
  if (classification === 'derived') return 'Derived lookup, filtered list, generated table, or aggregate built from static content.'
  if (classification === 'algorithm') return 'Rule, calculation, random generator, formatter, or state-independent algorithm retained in framework/domain.'
  if (classification === 'adapter') return 'Compatibility query or lookup facade preserved while registries are introduced.'
  if (classification === 'ui') return 'Presentation label, color, theme, or display helper retained outside content registries.'
  return 'Barrel re-export; no content registry ownership.'
}

const symbolReviewOverrides = new Map(Object.entries({
  'src/data/crops.ts:CROPS': {
    status: 'verified',
    rationale: 'Phase 2 crop registry pilot verifies CROPS through the official crop registry adapter; legacy static export remains available as the rollback path.'
  },
  'src/data/crops.ts:getCropById': {
    status: 'verified',
    rationale: 'Legacy getCropById() signature is retained; contentAccess now resolves getOfficialCropById() through taoyuan:crop and returns the same local-ID CropDef shape.'
  },
  'src/data/crops.ts:getCropBySeedId': {
    status: 'verified',
    rationale: 'Legacy getCropBySeedId() signature is retained; Phase 2 verifies it against the official crop registry seed lookup facade.'
  },
  'src/data/crops.ts:getCropsBySeason': {
    status: 'verified',
    rationale: 'Legacy getCropsBySeason() signature is retained; Phase 2 verifies season filtering against the official crop registry facade.'
  },
  'src/data/items.ts:ITEMS': {
    status: 'verified',
    rationale: 'Phase 2 pilot verifies ITEMS through the official item registry adapter, including local ID preservation and minimal cooking tags, while the legacy static export remains available.'
  },
  'src/data/items.ts:getItemById': {
    status: 'verified',
    rationale: 'Legacy getItemById() signature is retained; CookingView still uses it for display fallback while tag-material candidates are read from the official item registry adapter.'
  },
  'src/data/recipes.ts:RECIPES': {
    status: 'verified',
    rationale: 'Phase 2 pilot verifies RECIPES through the official recipe registry adapter, including legacy itemId + quantity normalization and the registry-only steamed_bun anyOfTags material slice.'
  },
  'src/data/recipes.ts:getRecipeById': {
    status: 'verified',
    rationale: 'Legacy getRecipeById() signature is retained for display/effects and static compatibility tests; cooking now reads normalized registry ingredients through contentAccess.'
  },
  'src/data/questDefinitions.ts:QUEST_TEMPLATES': {
    classification: 'content',
    targetRegistry: 'taoyuan:quest_template',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy board quest templates; Phase 6 projects quest type, target pools, NPC pools and reward multipliers into taoyuan:quest_template.'
  },
  'src/data/questDefinitions.ts:QUEST_TYPE_LABELS': {
    classification: 'ui',
    targetRegistry: 'ui/quest-labels',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Board quest type labels remain UI-facing compatibility text and are not part of the quest template registry payload.'
  },
  'src/data/questDefinitions.ts:SpecialOrderTemplate': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:quest_template',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy special-order compatibility shape; the public quest template contract is QuestTemplateDefSchema.'
  },
  'src/data/questDefinitions.ts:SPECIAL_ORDER_TEMPLATES': {
    classification: 'content',
    targetRegistry: 'taoyuan:quest_template',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy special order templates; Phase 6 projects target items, item rewards, seasons, owner NPCs and tiers into taoyuan:quest_template.'
  },
  'src/data/questDefinitions.ts:TIER_LABELS': {
    classification: 'ui',
    targetRegistry: 'ui/quest-labels',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Special-order tier labels remain UI-facing compatibility text; tier identity and ordering are represented by taoyuan:quest_template.'
  },
  'src/data/questDefinitions.ts:TIER_FRIENDSHIP': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/quests',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Special-order tier friendship rewards remain framework quest reward constants so random generation and quest submission behavior stay unchanged.'
  },
  'src/data/quests.ts:QUEST_TYPE_LABELS': {
    classification: 'adapter',
    targetRegistry: 'ui/quest-labels',
    persistentIds: false,
    status: 'verified',
    rationale: 'Original-name re-export keeps board quest type labels available while quest template content moved to questDefinitions.'
  },
  'src/data/quests.ts:SpecialOrderTemplate': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:quest_template',
    persistentIds: false,
    status: 'verified',
    rationale: 'Original type re-export keeps legacy SpecialOrderTemplate imports stable after special order content moved to questDefinitions.'
  },
  'src/data/quests.ts:QUEST_TEMPLATES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:quest_template',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name export now returns the registry-backed board quest template compatibility list while preserving old order and field shape.'
  },
  'src/data/quests.ts:generateQuest': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/quests',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Daily board quest generation remains framework-owned and preserves random call order, quest IDs, rewards, descriptions and local save IDs while reading template data through taoyuan:quest_template.'
  },
  'src/data/quests.ts:generateSpecialOrder': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/quests',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Special-order generation remains framework-owned and preserves tier clamping, random call order, quest IDs, rewards, descriptions and local save IDs while reading template data through taoyuan:quest_template.'
  },
  'src/data/quests.ts:getQuestTemplates': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:quest_template',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy board quest template list query returns local-ID compatibility objects reconstructed from taoyuan:quest_template.'
  },
  'src/data/quests.ts:getSpecialOrderTemplates': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:quest_template',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy special-order template list query returns local-ID compatibility objects reconstructed from taoyuan:quest_template.'
  },
  'src/data/shops.ts:SHOPS': {
    status: 'verified',
    rationale: 'Phase 3 shop registry pilot verifies SHOPS through the official shop registry adapter; legacy static export remains available as the rollback path.'
  },
  'src/data/shops.ts:getShopById': {
    status: 'verified',
    rationale: 'Legacy getShopById() signature is retained; the Phase 3 query facade resolves getOfficialShopById() through taoyuan:shop and returns the same local-ID ShopDef shape.'
  },
  'src/data/weaponDefinitions.ts:WEAPONS': {
    classification: 'content',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy weapon definitions; Phase 6 projects every weapon into taoyuan:equipment without changing IDs, type, attack, crit rate, shop prices, materials or fixed enchantments.'
  },
  'src/data/weaponDefinitions.ts:SHOP_WEAPONS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies the SHOP_WEAPONS purchase projection through taoyuan:shop_offer; Phase 6 also verifies the same list against taoyuan:equipment weapon definitions.'
  },
  'src/data/weaponDefinitions.ts:WEAPON_TYPE_NAMES': {
    classification: 'ui',
    targetRegistry: 'ui/equipment-labels',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Weapon type display labels remain UI-facing compatibility text and are not part of the Phase 6 equipment registry payload.'
  },
  'src/data/weaponDefinitions.ts:getBaseWeaponSellPrice': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/equipment-pricing',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Keeps the legacy unenchanted weapon sell-price formula centralized for item derivation and registry projection; pricing behavior is verified unchanged by the weapon equipment slice.'
  },
  'src/data/weapons.ts:WEAPONS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy weapon imports stable while static source moved to weaponDefinitions for registry adapter isolation.'
  },
  'src/data/weapons.ts:SHOP_WEAPONS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves the legacy shop weapon list while the official equipment registry becomes the audited weapon definition source.'
  },
  'src/data/weapons.ts:WEAPON_TYPE_NAMES': {
    classification: 'adapter',
    targetRegistry: 'ui/equipment-labels',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Original-name re-export preserves weapon type display labels after the static source moved to weaponDefinitions; labels remain UI-facing compatibility text.'
  },
  'src/data/weapons.ts:getWeaponById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getWeaponById() signature is retained and now resolves taoyuan:equipment before returning the same local-ID WeaponDef shape.'
  },
  'src/data/weapons.ts:getWeaponSellPrice': {
    classification: 'adapter',
    targetRegistry: 'engine/domain/equipment-pricing',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy sell-price helper keeps the same signature, uses the registry-backed getWeaponById() for weapon definitions, and preserves enchantment pricing behavior.'
  },
  'src/data/weapons.ts:getWeaponDisplayName': {
    classification: 'adapter',
    targetRegistry: 'engine/domain/equipment-display',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy weapon display-name helper keeps the same signature, uses the registry-backed getWeaponById() for base names, and preserves enchantment summary formatting.'
  },
  'src/data/hats.ts:SHOP_HATS': {
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies the SHOP_HATS purchase projection through taoyuan:shop_offer; full hat equipment content remains available through legacy data until equipment migration.'
  },
  'src/data/shoes.ts:SHOP_SHOES': {
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies the SHOP_SHOES purchase projection through taoyuan:shop_offer; full shoe equipment content remains available through legacy data until equipment migration.'
  },
  'src/data/processingMachineDefinitions.ts:PROCESSING_MACHINES': {
    classification: 'content',
    targetRegistry: 'taoyuan:processing_machine',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all legacy processing machine craft definitions; Phase 6 projects every machine into taoyuan:processing_machine and verifies IDs, order, names, descriptions, materials, money and autoCollect behavior.'
  },
  'src/data/processingRecipeDefinitions.ts:PROCESSING_RECIPES': {
    classification: 'content',
    targetRegistry: 'taoyuan:processing_recipe',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all legacy processing recipes; Phase 6 projects every recipe into taoyuan:processing_recipe and verifies IDs, order, machine references, input/output items, quantities, processing days and runtime behavior.'
  },
  'src/data/processingCraftDefinitions.ts:SPRINKLERS': {
    classification: 'content',
    targetRegistry: 'taoyuan:sprinkler',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all legacy sprinkler craft definitions; Phase 6 projects every sprinkler into taoyuan:sprinkler and verifies IDs, order, names, descriptions, ranges, materials, money and runtime consumers.'
  },
  'src/data/processingCraftDefinitions.ts:FERTILIZERS': {
    classification: 'content',
    targetRegistry: 'taoyuan:fertilizer',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Leaf source extracted from processing.ts; Phase 3 shop offer pilot verifies fertilizer shopPrice/name/description projection through taoyuan:shop_offer while fertilizer behavior remains framework-owned.'
  },
  'src/data/processingCraftDefinitions.ts:BAITS': {
    classification: 'content',
    targetRegistry: 'taoyuan:bait',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Leaf source extracted from processing.ts; Phase 3 shop offer pilot verifies bait shopPrice/name/description projection through taoyuan:shop_offer while fishing behavior remains framework-owned.'
  },
  'src/data/processingCraftDefinitions.ts:TACKLES': {
    classification: 'content',
    targetRegistry: 'taoyuan:tackle',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Leaf source extracted from processing.ts; Phase 3 shop offer pilot verifies tackle shopPrice/name/description projection through taoyuan:shop_offer while tackle durability and fishing behavior remain framework-owned.'
  },
  'src/data/processingCraftDefinitions.ts:BOMBS': {
    classification: 'content',
    targetRegistry: 'taoyuan:bomb',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all legacy bomb craft definitions; Phase 6 projects every bomb into taoyuan:bomb and verifies IDs, order, names, descriptions, mining effects, materials, money and shop price while all production bomb consumers read the published registry.'
  },
  'src/data/processing.ts:PROCESSING_MACHINES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:processing_machine',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy processing machine imports stable while the unique leaf source moved to processingMachineDefinitions and runtime lookups resolve taoyuan:processing_machine first.'
  },
  'src/data/processing.ts:PROCESSING_RECIPES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:processing_recipe',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy processing recipe imports stable while the unique leaf source moved to processingRecipeDefinitions and runtime lookups resolve taoyuan:processing_recipe first.'
  },
  'src/data/processing.ts:getMachineById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:processing_machine',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getMachineById() signature is retained and now resolves taoyuan:processing_machine before returning the same local-ID ProcessingMachineDef shape.'
  },
  'src/data/processing.ts:getProcessingMachines': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:processing_machine',
    persistentIds: false,
    status: 'verified',
    rationale: 'Processing machine list query returns local-ID compatibility objects reconstructed from taoyuan:processing_machine in legacy order.'
  },
  'src/data/processing.ts:getProcessingRecipeById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:processing_recipe',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getProcessingRecipeById() signature is retained and now resolves taoyuan:processing_recipe before returning the same local-ID ProcessingRecipeDef shape.'
  },
  'src/data/processing.ts:getRecipesForMachine': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:processing_recipe',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getRecipesForMachine() signature is retained and now filters local-ID compatibility objects reconstructed from taoyuan:processing_recipe.'
  },
  'src/data/processing.ts:SPRINKLERS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:sprinkler',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves legacy sprinkler imports while new list and ID lookups resolve taoyuan:sprinkler first.'
  },
  'src/data/processing.ts:getSprinklerById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:sprinkler',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getSprinklerById() signature is retained and now resolves taoyuan:sprinkler before returning the same local-ID SprinklerDef shape.'
  },
  'src/data/processing.ts:getSprinklers': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:sprinkler',
    persistentIds: false,
    status: 'verified',
    rationale: 'Sprinkler list query returns local-ID compatibility objects reconstructed from taoyuan:sprinkler in legacy order.'
  },
  'src/data/processing.ts:FERTILIZERS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fertilizer',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves legacy fertilizer imports after the leaf extraction; Phase 3 shop offer verification remains unchanged.'
  },
  'src/data/processing.ts:BAITS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:bait',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves legacy bait imports after the leaf extraction; Phase 3 shop offer verification remains unchanged.'
  },
  'src/data/processing.ts:TACKLES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:tackle',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves legacy tackle imports after the leaf extraction; Phase 3 shop offer verification remains unchanged.'
  },
  'src/data/processing.ts:BOMBS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:bomb',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export remains for compatibility, equivalence tests and rollback; the processing Store plus mining and processing views no longer import it in production.'
  },
  'src/data/processing.ts:getBombById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:bomb',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getBombById() signature and undefined result for unknown IDs are retained while known bomb definitions resolve through taoyuan:bomb before the static fallback.'
  },
  'src/data/animalDefinitions.ts:ANIMAL_DEFS': {
    classification: 'content',
    targetRegistry: 'taoyuan:animal',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all legacy animal species definitions; Phase 6 projects every field into taoyuan:animal and verifies order, products, prices and runtime store behavior.'
  },
  'src/data/animalDefinitions.ts:HAY_PRICE': {
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies hay purchase price projection through taoyuan:shop_offer; animal feeding rules remain framework-owned.'
  },
  'src/data/animalFeedDefinitions.ts:AnimalFeedDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_feed',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy animal feed compatibility shape; the public contract is AnimalFeedDefSchema.'
  },
  'src/data/animalFeedDefinitions.ts:FEED_DEFS': {
    classification: 'content',
    targetRegistry: 'taoyuan:animal_feed',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all legacy animal feed definitions; Phase 6 projects IDs, display names, prices and descriptions into taoyuan:animal_feed.'
  },
  'src/data/walletDefinitions.ts:WALLET_ITEMS': {
    classification: 'content',
    targetRegistry: 'taoyuan:wallet_item',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all legacy wallet item definitions; Phase 6 projects IDs, display names, effects and unlock condition text into taoyuan:wallet_item.'
  },
  'src/data/wallet.ts:WALLET_ITEMS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:wallet_item',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps WALLET_ITEMS as an original-name re-export from walletDefinitions while wallet runtime lookups resolve taoyuan:wallet_item.'
  },
  'src/data/wallet.ts:getWalletItems': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:wallet_item',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy wallet item list query returns local-ID compatibility objects reconstructed from taoyuan:wallet_item.'
  },
  'src/data/wallet.ts:getWalletItemById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:wallet_item',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getWalletItemById() signature is retained and now resolves taoyuan:wallet_item before returning an equivalent local-ID object.'
  },
  'src/data/museumDefinitions.ts:MUSEUM_CATEGORIES': {
    classification: 'content',
    targetRegistry: 'taoyuan:museum_category',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy museum categories; Phase 6 projects keys and labels into taoyuan:museum_category.'
  },
  'src/data/museumDefinitions.ts:MUSEUM_ITEMS': {
    classification: 'content',
    targetRegistry: 'taoyuan:museum_item',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all legacy museum donation items; Phase 6 projects item IDs, names, categories and source hints into taoyuan:museum_item.'
  },
  'src/data/museumDefinitions.ts:MUSEUM_MILESTONES': {
    classification: 'content',
    targetRegistry: 'taoyuan:museum_milestone',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy museum milestone rewards; Phase 6 projects counts, names, money and item rewards into taoyuan:museum_milestone.'
  },
  'src/data/museum.ts:MUSEUM_CATEGORIES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:museum_category',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy museum category imports stable while runtime category lists resolve taoyuan:museum_category.'
  },
  'src/data/museum.ts:MUSEUM_ITEMS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:museum_item',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy museum item imports stable while Store and UI consumers use registry-backed list/query facades.'
  },
  'src/data/museum.ts:MUSEUM_MILESTONES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:museum_milestone',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy museum milestone imports stable while milestone reward lookup resolves taoyuan:museum_milestone.'
  },
  'src/data/museum.ts:getMuseumItems': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:museum_item',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy museum item list query returns local-ID compatibility objects reconstructed from taoyuan:museum_item.'
  },
  'src/data/museum.ts:getMuseumCategories': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:museum_category',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy museum category list query returns category keys and labels reconstructed from taoyuan:museum_category.'
  },
  'src/data/museum.ts:getMuseumMilestones': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:museum_milestone',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy museum milestone list query returns local reward objects reconstructed from taoyuan:museum_milestone.'
  },
  'src/data/museum.ts:getMuseumItemById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:museum_item',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getMuseumItemById() signature is retained and now resolves taoyuan:museum_item before returning an equivalent local-ID object.'
  },
  'src/data/museum.ts:getMuseumMilestoneByCount': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:museum_milestone',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy museum milestone count lookup is retained and now resolves taoyuan:museum_milestone before returning an equivalent reward object.'
  },
  'src/data/guildDefinitions.ts:MONSTER_GOALS': {
    classification: 'content',
    targetRegistry: 'taoyuan:guild_goal',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy guild monster goals; Phase 6 projects monster IDs, zones, kill targets, rewards and descriptions into taoyuan:guild_goal.'
  },
  'src/data/guildDefinitions.ts:GUILD_DONATIONS': {
    classification: 'content',
    targetRegistry: 'taoyuan:guild_donation',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy guild donation point values; Phase 6 projects item IDs and contribution points into taoyuan:guild_donation.'
  },
  'src/data/guildDefinitions.ts:GUILD_LEVELS': {
    classification: 'content',
    targetRegistry: 'taoyuan:guild_level',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy guild level experience thresholds; Phase 6 projects levels and required experience into taoyuan:guild_level.'
  },
  'src/data/guildDefinitions.ts:GUILD_SHOP_ITEMS': {
    classification: 'content',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique leaf source for guild shop offers already projected by the Phase 3 shop_offer adapter; this guild slice does not migrate guild shop behavior again.'
  },
  'src/data/guildDefinitions.ts:GUILD_BONUS_PER_LEVEL': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/guild',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Per-level passive bonus rule remains framework-owned and is not content data in the guild definition registry slice.'
  },
  'src/data/guild.ts:MONSTER_GOALS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_goal',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy MONSTER_GOALS imports stable while guild Store and UI use registry-backed query facades.'
  },
  'src/data/guild.ts:GUILD_DONATIONS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_donation',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy GUILD_DONATIONS imports stable while donation lookups resolve taoyuan:guild_donation.'
  },
  'src/data/guild.ts:GUILD_LEVELS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_level',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy GUILD_LEVELS imports stable while level thresholds resolve taoyuan:guild_level.'
  },
  'src/data/guild.ts:GUILD_SHOP_ITEMS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps guild shop imports stable; shop offers remain owned by the existing taoyuan:shop_offer projection.'
  },
  'src/data/guild.ts:GUILD_BONUS_PER_LEVEL': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/guild',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Guild level passive bonus remains a framework rule and is re-exported for compatibility.'
  },
  'src/data/guild.ts:getMonsterGoals': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_goal',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy guild goal list query returns local-ID compatibility objects reconstructed from taoyuan:guild_goal.'
  },
  'src/data/guild.ts:getMonsterGoalByMonsterId': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_goal',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy monster goal lookup is retained and now resolves taoyuan:guild_goal by local or namespaced monster ID before returning an equivalent object.'
  },
  'src/data/guild.ts:getGuildDonations': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_donation',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy donation list query returns local-ID compatibility objects reconstructed from taoyuan:guild_donation.'
  },
  'src/data/guild.ts:getGuildDonationByItemId': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_donation',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy donation item lookup is retained and now resolves taoyuan:guild_donation by local or namespaced item ID before returning an equivalent point value.'
  },
  'src/data/guild.ts:getGuildLevels': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_level',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy guild level list query returns compatibility objects reconstructed from taoyuan:guild_level.'
  },
  'src/data/guild.ts:getGuildLevelByLevel': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_level',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy guild level lookup is retained and now resolves taoyuan:guild_level before returning an equivalent threshold object.'
  },
  'src/data/achievementDefinitions.ts:ACHIEVEMENTS': {
    classification: 'content',
    targetRegistry: 'taoyuan:achievement',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy achievement definitions; Phase 6 projects stable progress IDs, names, descriptions, conditions and rewards into taoyuan:achievement.'
  },
  'src/data/achievementDefinitions.ts:COMMUNITY_BUNDLES': {
    classification: 'content',
    targetRegistry: 'taoyuan:community_bundle',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy community bundle definitions; Phase 6 projects stable bundle IDs, required items and rewards into taoyuan:community_bundle.'
  },
  'src/data/achievements.ts:ACHIEVEMENTS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:achievement',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy ACHIEVEMENTS imports stable while runtime lists resolve taoyuan:achievement through compatibility facades.'
  },
  'src/data/achievements.ts:COMMUNITY_BUNDLES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:community_bundle',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy COMMUNITY_BUNDLES imports stable while runtime bundle lists resolve taoyuan:community_bundle through compatibility facades.'
  },
  'src/data/achievements.ts:getAchievements': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:achievement',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy achievement list query returns local-ID compatibility objects reconstructed from taoyuan:achievement.'
  },
  'src/data/achievements.ts:getAchievementById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:achievement',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getAchievementById() signature is retained and now resolves taoyuan:achievement by local or namespaced ID before falling back to the static rollback path.'
  },
  'src/data/achievements.ts:getCommunityBundles': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:community_bundle',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy community bundle list query returns local-ID compatibility objects reconstructed from taoyuan:community_bundle.'
  },
  'src/data/achievements.ts:getBundleById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:community_bundle',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getBundleById() signature is retained and now resolves taoyuan:community_bundle by local or namespaced ID before falling back to the static rollback path.'
  },
  'src/data/npcDefinitions.ts:NPCS': {
    classification: 'content',
    targetRegistry: 'taoyuan:npc',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy village NPC definitions; Phase 6 projects stable NPC IDs, display text, gift preferences, dialogues, birthdays and compatibility event IDs into taoyuan:npc.'
  },
  'src/data/npcs.ts:NPCS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:npc',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy NPCS imports stable while runtime list queries resolve taoyuan:npc through compatibility facades.'
  },
  'src/data/npcs.ts:getNpcs': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:npc',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy NPC list query returns local-ID compatibility objects reconstructed from taoyuan:npc.'
  },
  'src/data/npcs.ts:getNpcById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:npc',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getNpcById() signature is retained and now resolves taoyuan:npc by local or namespaced ID before falling back to the static rollback path.'
  },
  'src/data/heartEventDefinitions.ts:HEART_EVENTS': {
    classification: 'content',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for ordinary NPC heart event scenes; Phase 6 projects local event IDs, owner NPC IDs, thresholds, zhiji flags, titles, scene text and choice friendship changes into taoyuan:heart_event.'
  },
  'src/data/heartEventDefinitions.ts:WEDDING_EVENT': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/wedding-event',
    persistentIds: true,
    status: 'framework-retained',
    rationale: 'The generic wedding ceremony event keeps npcId blank until runtime replacement, so it remains framework-owned and queryable through the legacy facade rather than becoming a fixed taoyuan:heart_event entry.'
  },
  'src/data/heartEvents.ts:HEART_EVENTS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy HEART_EVENTS imports stable while ordinary event queries resolve taoyuan:heart_event through compatibility facades.'
  },
  'src/data/heartEvents.ts:WEDDING_EVENT': {
    classification: 'adapter',
    targetRegistry: 'engine/domain/wedding-event',
    persistentIds: true,
    status: 'framework-retained',
    rationale: 'Original-name re-export keeps the generic wedding ceremony event available for useDialogs while it remains outside the fixed heart_event registry.'
  },
  'src/data/heartEvents.ts:getHeartEventsForNpc': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy ordinary NPC heart event list query returns local-ID compatibility objects reconstructed from taoyuan:heart_event by owner NPC ID.'
  },
  'src/data/heartEvents.ts:getHeartEventById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getHeartEventById() resolves ordinary taoyuan:heart_event entries by local or namespaced ID and falls back to the framework-retained wedding event.'
  },
  'src/data/hiddenNpcDefinitions.ts:HIDDEN_NPCS': {
    classification: 'content',
    targetRegistry: 'taoyuan:hidden_npc',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy hidden NPC definitions; Phase 6 projects stable hidden NPC IDs, discovery chains, offerings, bond thresholds, abilities and manifestation days into taoyuan:hidden_npc.'
  },
  'src/data/hiddenNpcs.ts:HIDDEN_NPCS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hidden_npc',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy HIDDEN_NPCS imports stable while runtime query facades resolve taoyuan:hidden_npc.'
  },
  'src/data/hiddenNpcs.ts:getHiddenNpcs': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hidden_npc',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy hidden NPC list query returns local-ID compatibility objects reconstructed from taoyuan:hidden_npc.'
  },
  'src/data/hiddenNpcs.ts:getHiddenNpcById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hidden_npc',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getHiddenNpcById() signature is retained and now resolves taoyuan:hidden_npc by local or namespaced ID before falling back to the static rollback path.'
  },
  'src/data/hiddenNpcHeartEventDefinitions.ts:HIDDEN_NPC_HEART_EVENTS': {
    classification: 'content',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for hidden NPC heart event scenes; Phase 6 projects local event IDs, hidden owner IDs, affinity thresholds, titles, scene text and choice affinity changes into taoyuan:heart_event.'
  },
  'src/data/hiddenNpcHeartEvents.ts:HIDDEN_NPC_HEART_EVENTS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy hidden NPC heart event imports stable while runtime queries resolve taoyuan:heart_event.'
  },
  'src/data/hiddenNpcHeartEvents.ts:getHiddenNpcHeartEvents': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy hidden NPC heart event list query returns local-ID compatibility objects reconstructed from taoyuan:heart_event by hidden NPC owner ID.'
  },
  'src/data/hiddenNpcHeartEvents.ts:getHiddenNpcHeartEventById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy hidden NPC event lookup resolves hidden-owner taoyuan:heart_event entries by local or namespaced ID before falling back to the static rollback path.'
  },
  'src/data/storyQuestDefinitions.ts:STORY_QUESTS': {
    classification: 'content',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy main story quest definitions; Phase 6 projects stable quest IDs, ordering, objectives and rewards into taoyuan:story_quest.'
  },
  'src/data/storyQuestDefinitions.ts:CHAPTER_TITLES': {
    classification: 'ui',
    targetRegistry: 'ui/story-quest-chapter-labels',
    persistentIds: false,
    status: 'verified',
    rationale: 'Chapter title labels remain UI text adjacent to the legacy story quest leaf source; quest identity and objectives are handled by taoyuan:story_quest.'
  },
  'src/data/storyQuests.ts:STORY_QUESTS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy STORY_QUESTS imports stable while runtime query facades resolve taoyuan:story_quest.'
  },
  'src/data/storyQuests.ts:CHAPTER_TITLES': {
    classification: 'adapter',
    targetRegistry: 'ui/story-quest-chapter-labels',
    persistentIds: false,
    status: 'verified',
    rationale: 'Original-name re-export keeps chapter labels available without making them part of the story quest registry contract.'
  },
  'src/data/storyQuests.ts:getStoryQuests': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy story quest list query returns local-ID compatibility objects reconstructed from taoyuan:story_quest.'
  },
  'src/data/storyQuests.ts:getStoryQuestCount': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy count helper now counts the registry-backed compatibility list while preserving all-complete quest store behavior.'
  },
  'src/data/storyQuests.ts:getStoryQuestById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getStoryQuestById() signature is retained and now resolves taoyuan:story_quest by local or namespaced ID before falling back to the static rollback path.'
  },
  'src/data/storyQuests.ts:getStoryQuestByOrder': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy chapter/order lookup is retained and now resolves taoyuan:story_quest before returning an equivalent main quest object.'
  },
  'src/data/storyQuests.ts:getNextStoryQuest': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy next-quest lookup is retained and now follows the ordered taoyuan:story_quest registry projection.'
  },
  'src/data/storyQuests.ts:getChapterQuests': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy chapter list query is retained and now filters taoyuan:story_quest compatibility objects by chapter.'
  },
  'src/data/storyQuests.ts:getFirstStoryQuest': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy first-quest helper is retained and now resolves the first taoyuan:story_quest compatibility object before falling back to the static rollback path.'
  },
  'src/data/secretNotes.ts:SECRET_NOTES': {
    classification: 'content',
    targetRegistry: 'taoyuan:secret_note',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 projects every legacy secret note into taoyuan:secret_note while preserving numeric note IDs, titles, content, usability and treasure rewards.'
  },
  'src/data/tutorials.ts:MorningTipDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:tutorial',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only morning tip compatibility shape; the public contract is TutorialDefSchema.'
  },
  'src/data/tutorials.ts:MORNING_TIPS': {
    classification: 'content',
    targetRegistry: 'taoyuan:tutorial',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 projects every legacy morning tutorial tip into taoyuan:tutorial while preserving IDs, priority order, condition keys and message text.'
  },
  'src/data/farmEventDefinitions.ts:MorningEffect': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy morning event effect compatibility shape; the public contract is MorningEventDefSchema.'
  },
  'src/data/farmEventDefinitions.ts:MorningNarration': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy morning narration compatibility shape; the public contract is MorningEventDefSchema.'
  },
  'src/data/farmEventDefinitions.ts:MorningChoiceEvent': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy morning choice event compatibility shape; the public contract is MorningEventDefSchema.'
  },
  'src/data/farmEventDefinitions.ts:MorningEasterEgg': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy morning easter egg compatibility shape; the public contract is MorningEventDefSchema.'
  },
  'src/data/farmEventDefinitions.ts:MORNING_NARRATIONS': {
    classification: 'content',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy morning narration events; Phase 6 projects order, text and optional effects into taoyuan:morning_event.'
  },
  'src/data/farmEventDefinitions.ts:NARRATIONS_NO_LOSS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Derived no-loss narration subset is verified against registry-backed morning narration compatibility results for empty-farm fallback.'
  },
  'src/data/farmEventDefinitions.ts:MORNING_CHOICE_EVENTS': {
    classification: 'content',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy morning choice events; Phase 6 projects local event IDs, prompts, choices, results and optional effects into taoyuan:morning_event.'
  },
  'src/data/farmEventDefinitions.ts:MORNING_EASTER_EGGS': {
    classification: 'content',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy morning easter egg events; Phase 6 projects order, text and optional effects into taoyuan:morning_event.'
  },
  'src/data/farmEvents.ts:MORNING_NARRATIONS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name export now returns the registry-backed morning narration compatibility list while preserving old list order and field shape for end-day consumers.'
  },
  'src/data/farmEvents.ts:NARRATIONS_NO_LOSS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'Original-name no-loss subset is derived from the registry-backed narration compatibility list and preserves the empty-farm fallback behavior.'
  },
  'src/data/farmEvents.ts:MORNING_CHOICE_EVENTS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name export now returns the registry-backed morning choice event compatibility list while preserving local event IDs and choice payloads.'
  },
  'src/data/farmEvents.ts:MORNING_EASTER_EGGS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name export now returns the registry-backed morning easter egg compatibility list while preserving old list order and field shape.'
  },
  'src/data/farmEvents.ts:getMorningNarrations': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy list getter resolves taoyuan:morning_event narration entries through the compatibility facade for end-day random event processing.'
  },
  'src/data/farmEvents.ts:getMorningChoiceEvents': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy list getter resolves taoyuan:morning_event choice entries through the compatibility facade for end-day random event processing.'
  },
  'src/data/farmEvents.ts:getMorningEasterEggs': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy list getter resolves taoyuan:morning_event easter egg entries through the compatibility facade for end-day random event processing.'
  },
  'src/data/farmEvents.ts:getNoLossMorningNarrations': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy no-loss getter filters the registry-backed narration compatibility list so empty-farm random event behavior stays unchanged.'
  },
  'src/data/seasonEventDefinitions.ts:SeasonEventDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:season_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy season event compatibility shape; the public contract is SeasonEventDefSchema.'
  },
  'src/data/seasonEventDefinitions.ts:SEASON_EVENTS': {
    classification: 'content',
    targetRegistry: 'taoyuan:season_event',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy season festival events; Phase 6 projects local event IDs, dates, rewards, narratives and interactive festival types into taoyuan:season_event.'
  },
  'src/data/events.ts:SeasonEventDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:season_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'Original type re-export keeps legacy SeasonEventDef imports stable after season event content moved to the leaf definitions module.'
  },
  'src/data/events.ts:SEASON_EVENTS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:season_event',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name export now returns the registry-backed season event compatibility list while preserving old list order and field shape for CottageView.'
  },
  'src/data/events.ts:getTodayEvent': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:season_event',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getTodayEvent() signature is retained and now resolves the ordered taoyuan:season_event registry by season and day before returning the same local-ID event shape.'
  },
  'src/data/farmMapDefinitions.ts:FarmMapDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:farm_map',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy farm map compatibility shape; the public contract is FarmMapDefSchema.'
  },
  'src/data/farmMapDefinitions.ts:FARM_MAP_DEFS': {
    classification: 'content',
    targetRegistry: 'taoyuan:farm_map',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all six legacy farm map definitions; Phase 6 projects type, name, description and bonus display text into taoyuan:farm_map.'
  },
  'src/data/farmMaps.ts:FarmMapDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:farm_map',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy FarmMapDef type remains re-exported from the compatibility module while the public contract is FarmMapDefSchema.'
  },
  'src/data/farmMaps.ts:FARM_MAP_DEFS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:farm_map',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps FARM_MAP_DEFS as an original-name re-export from farmMapDefinitions while MainMenu reads taoyuan:farm_map through the compatibility facade.'
  },
  'src/data/farmMaps.ts:getFarmMapDefs': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:farm_map',
    persistentIds: false,
    status: 'verified',
    rationale: 'Farm map list query returns local-ID compatibility objects reconstructed from taoyuan:farm_map for the new-game selection UI.'
  },
  'src/data/farmMaps.ts:getFarmMapByType': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:farm_map',
    persistentIds: false,
    status: 'verified',
    rationale: 'Farm map type lookup resolves taoyuan:farm_map before returning an equivalent local-ID FarmMapDef object.'
  },
  'src/data/animalBuildingDefinitions.ts:AnimalBuildingUpgradeDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy animal building upgrade compatibility shape; the public contract is AnimalBuildingDefSchema.'
  },
  'src/data/animalBuildingDefinitions.ts:ANIMAL_BUILDINGS': {
    classification: 'content',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy coop, barn and stable build definitions; Phase 6 projects names, descriptions, costs, capacities and materials into taoyuan:animal_building.'
  },
  'src/data/animalBuildingDefinitions.ts:BUILDING_UPGRADES': {
    classification: 'content',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy coop and barn upgrade definitions; Phase 6 nests them under taoyuan:animal_building while preserving levels, names, capacities, costs and materials.'
  },
  'src/data/animalIncubationDefinitions.ts:AnimalIncubationDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy animal incubation compatibility shape; the public contract is AnimalIncubationDefSchema.'
  },
  'src/data/animalIncubationDefinitions.ts:AnimalIncubationMapping': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy item-to-incubation map value shape retained for old INCUBATION_MAP consumers.'
  },
  'src/data/animalIncubationDefinitions.ts:ANIMAL_INCUBATIONS': {
    classification: 'content',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy egg-to-animal incubation mappings; Phase 6 projects egg item IDs, animal IDs, buildings and days into taoyuan:animal_incubation.'
  },
  'src/data/animalIncubationDefinitions.ts:INCUBATION_MAP': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy map shape generated from ANIMAL_INCUBATIONS for static rollback and old API equivalence checks.'
  },
  'src/data/toolUpgradeDefinitions.ts:ToolUpgradeCost': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:tool_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy tool upgrade cost compatibility shape; the public contract is ToolUpgradeDefSchema.'
  },
  'src/data/toolUpgradeDefinitions.ts:TOOL_UPGRADE_COSTS': {
    classification: 'content',
    targetRegistry: 'taoyuan:tool_upgrade',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy tool upgrade money and material costs; Phase 6 projects every tool/tier cost into taoyuan:tool_upgrade.'
  },
  'src/data/toolUpgradeDefinitions.ts:TOOL_NAMES': {
    classification: 'ui',
    targetRegistry: 'ui/tool-labels',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Player-visible tool display labels remain framework/UI labels and are covered by the tool upgrade registry equivalence test.'
  },
  'src/data/toolUpgradeDefinitions.ts:TIER_NAMES': {
    classification: 'ui',
    targetRegistry: 'ui/tool-labels',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Player-visible tool tier labels remain framework/UI labels and are covered by the tool upgrade registry equivalence test.'
  },
  'src/data/upgrades.ts:ToolUpgradeCost': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:tool_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'Type-only re-export for the legacy tool upgrade cost compatibility shape.'
  },
  'src/data/upgrades.ts:TOOL_UPGRADE_COSTS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:tool_upgrade',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps TOOL_UPGRADE_COSTS as an original-name re-export from toolUpgradeDefinitions while runtime upgrade cost lookup resolves taoyuan:tool_upgrade.'
  },
  'src/data/upgrades.ts:TOOL_NAMES': {
    classification: 'ui',
    targetRegistry: 'ui/tool-labels',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Phase 6 keeps TOOL_NAMES as an original-name re-export from toolUpgradeDefinitions for existing UI consumers.'
  },
  'src/data/upgrades.ts:TIER_NAMES': {
    classification: 'ui',
    targetRegistry: 'ui/tool-labels',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Phase 6 keeps TIER_NAMES as an original-name re-export from toolUpgradeDefinitions for existing UI consumers.'
  },
  'src/data/upgrades.ts:getUpgradeCost': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:tool_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getUpgradeCost() signature is retained and now resolves taoyuan:tool_upgrade before returning an equivalent local-ID ToolUpgradeCost object.'
  },
  'src/data/equipmentSetDefinitions.ts:SetBonusLevel': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment_set',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy equipment set bonus shape retained for old EquipmentSetDef consumers; the public contract is EquipmentSetDefSchema.'
  },
  'src/data/equipmentSetDefinitions.ts:EquipmentSetDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment_set',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy equipment set shape retained for compatibility; the public contract is EquipmentSetDefSchema.'
  },
  'src/data/equipmentSetDefinitions.ts:EQUIPMENT_SET_DEFINITIONS': {
    classification: 'content',
    targetRegistry: 'taoyuan:equipment_set',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy equipment set definitions; Phase 6 projects every set, piece reference, bonus threshold and effect into taoyuan:equipment_set.'
  },
  'src/data/equipmentSets.ts:EquipmentSetDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment_set',
    persistentIds: false,
    status: 'verified',
    rationale: 'Type-only re-export for the legacy equipment set compatibility shape.'
  },
  'src/data/equipmentSets.ts:SetBonusLevel': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment_set',
    persistentIds: false,
    status: 'verified',
    rationale: 'Type-only re-export for the legacy equipment set bonus compatibility shape.'
  },
  'src/data/equipmentSets.ts:EQUIPMENT_SETS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment_set',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps EQUIPMENT_SETS as an original-name re-export from equipmentSetDefinitions while runtime consumers use registry-backed facades.'
  },
  'src/data/equipmentSets.ts:getEquipmentSets': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment_set',
    persistentIds: false,
    status: 'verified',
    rationale: 'Compatibility list facade returns local-ID equipment set objects reconstructed from taoyuan:equipment_set, with the static array retained as rollback.'
  },
  'src/data/equipmentSets.ts:getSetByPieceId': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment_set',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getSetByPieceId() signature is retained and now resolves taoyuan:equipment_set before returning the same first matching local-ID set shape.'
  },
  'src/data/ringDefinitions.ts:RINGS': {
    classification: 'content',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy ring definitions; Phase 6 projects every ring into taoyuan:equipment without changing IDs, effects, recipes, obtain sources or sell prices.'
  },
  'src/data/ringDefinitions.ts:getRingById': {
    classification: 'adapter',
    targetRegistry: 'compatibility_adapter',
    persistentIds: false,
    status: 'verified',
    rationale: 'Leaf fallback lookup retained for rollback; public src/data/rings.ts getRingById() now resolves taoyuan:equipment first.'
  },
  'src/data/ringDefinitions.ts:CRAFTABLE_RINGS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Derived craftable ring list remains equivalent to legacy RINGS.filter(recipe !== null); Phase 6 verifies it alongside taoyuan:equipment ring definitions.'
  },
  'src/data/rings.ts:RINGS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy imports stable while static source moved to ringDefinitions for registry adapter isolation.'
  },
  'src/data/rings.ts:CRAFTABLE_RINGS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves the legacy craftable ring list while the official equipment registry becomes the runtime query source.'
  },
  'src/data/rings.ts:getRingById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getRingById() signature is retained and now resolves taoyuan:equipment before returning the same local-ID RingDef shape.'
  },
  'src/data/hatDefinitions.ts:HATS': {
    classification: 'content',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy hat definitions; Phase 6 projects every hat into taoyuan:equipment without changing IDs, effects, shop prices, recipes, obtain sources or sell prices.'
  },
  'src/data/hatDefinitions.ts:getHatById': {
    classification: 'adapter',
    targetRegistry: 'compatibility_adapter',
    persistentIds: false,
    status: 'verified',
    rationale: 'Leaf fallback lookup retained for rollback; public src/data/hats.ts getHatById() now resolves taoyuan:equipment first.'
  },
  'src/data/hatDefinitions.ts:SHOP_HATS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Derived shop hat list remains equivalent to legacy HATS.filter(shopPrice !== null); Phase 6 verifies it alongside taoyuan:equipment hat definitions.'
  },
  'src/data/hatDefinitions.ts:CRAFTABLE_HATS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Derived craftable hat list remains equivalent to legacy HATS.filter(recipe !== null); Phase 6 verifies it alongside taoyuan:equipment hat definitions.'
  },
  'src/data/hats.ts:HATS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy imports stable while static source moved to hatDefinitions for registry adapter isolation.'
  },
  'src/data/hats.ts:SHOP_HATS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves the legacy shop hat list while the official equipment registry becomes the runtime query source.'
  },
  'src/data/hats.ts:CRAFTABLE_HATS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves the legacy craftable hat list while the official equipment registry becomes the runtime query source.'
  },
  'src/data/hats.ts:getHatById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getHatById() signature is retained and now resolves taoyuan:equipment before returning the same local-ID HatDef shape.'
  },
  'src/data/shoeDefinitions.ts:SHOES': {
    classification: 'content',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy shoe definitions; Phase 6 projects every shoe into taoyuan:equipment without changing IDs, effects, shop prices, recipes, obtain sources or sell prices.'
  },
  'src/data/shoeDefinitions.ts:getShoeById': {
    classification: 'adapter',
    targetRegistry: 'compatibility_adapter',
    persistentIds: false,
    status: 'verified',
    rationale: 'Leaf fallback lookup retained for rollback; public src/data/shoes.ts getShoeById() now resolves taoyuan:equipment first.'
  },
  'src/data/shoeDefinitions.ts:SHOP_SHOES': {
    classification: 'derived',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Derived shop shoe list remains equivalent to legacy SHOES.filter(shopPrice !== null); Phase 6 verifies it alongside taoyuan:equipment shoe definitions.'
  },
  'src/data/shoeDefinitions.ts:CRAFTABLE_SHOES': {
    classification: 'derived',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Derived craftable shoe list remains equivalent to legacy SHOES.filter(recipe !== null); Phase 6 verifies it alongside taoyuan:equipment shoe definitions.'
  },
  'src/data/shoeDefinitions.ts:MONSTER_DROP_SHOES': {
    classification: 'content',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Named equipment drop-table slice already verifies monster shoe drop pools through taoyuan:drop_table; this file remains the isolated leaf source.'
  },
  'src/data/shoeDefinitions.ts:BOSS_DROP_SHOES': {
    classification: 'content',
    targetRegistry: 'engine/domain/mining-boss-reward',
    persistentIds: true,
    status: 'baselined',
    rationale: 'Main-mine first-kill boss shoe reward mapping remains in the mining boss reward path; this equipment definition slice does not migrate boss settlement.'
  },
  'src/data/shoeDefinitions.ts:TREASURE_DROP_SHOES': {
    classification: 'content',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Named equipment drop-table slice already verifies treasure shoe drop pools through taoyuan:drop_table; this file remains the isolated leaf source.'
  },
  'src/data/shoes.ts:SHOES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy imports stable while static source moved to shoeDefinitions for registry adapter isolation.'
  },
  'src/data/shoes.ts:SHOP_SHOES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves the legacy shop shoe list while the official equipment registry becomes the runtime query source.'
  },
  'src/data/shoes.ts:CRAFTABLE_SHOES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves the legacy craftable shoe list while the official equipment registry becomes the runtime query source.'
  },
  'src/data/shoes.ts:MONSTER_DROP_SHOES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves monster shoe drop imports while the drop-table registry remains the audited named-table source.'
  },
  'src/data/shoes.ts:BOSS_DROP_SHOES': {
    classification: 'adapter',
    targetRegistry: 'engine/domain/mining-boss-reward',
    persistentIds: true,
    status: 'baselined',
    rationale: 'Original-name re-export preserves boss shoe reward imports; boss reward settlement remains outside this equipment definition slice.'
  },
  'src/data/shoes.ts:TREASURE_DROP_SHOES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves treasure shoe drop imports while the drop-table registry remains the audited named-table source.'
  },
  'src/data/shoes.ts:getShoeById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getShoeById() signature is retained and now resolves taoyuan:equipment before returning the same local-ID ShoeDef shape.'
  },
  'src/data/animals.ts:ANIMAL_DEFS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps ANIMAL_DEFS as an original-name re-export from the unique animalDefinitions leaf source; AnimalView and useAnimalStore now query the registry-backed compatibility facade.'
  },
  'src/data/animals.ts:getAnimalDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getAnimalDef() signature is retained and now resolves taoyuan:animal before returning an equivalent local-ID AnimalDef compatibility object.'
  },
  'src/data/animals.ts:getAnimalDefsByBuilding': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal',
    persistentIds: false,
    status: 'verified',
    rationale: 'Phase 6 compatibility facade filters official animal definitions by building while preserving the old local-ID AnimalDef shape for UI consumers.'
  },
  'src/data/animals.ts:FEED_DEFS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_feed',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps FEED_DEFS as an original-name re-export from the unique animalFeedDefinitions leaf source while AnimalView uses registry-backed compatibility facades.'
  },
  'src/data/animals.ts:AnimalFeedDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_feed',
    persistentIds: false,
    status: 'verified',
    rationale: 'Type-only re-export for the legacy animal feed compatibility shape.'
  },
  'src/data/animals.ts:getFeedDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_feed',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getFeedDef() query is retained and now resolves taoyuan:animal_feed before returning an equivalent local-ID feed definition.'
  },
  'src/data/animals.ts:getFeedDefs': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_feed',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy feed list query is retained and now returns local-ID AnimalFeedDef compatibility objects reconstructed from taoyuan:animal_feed.'
  },
  'src/data/animals.ts:ANIMAL_BUILDINGS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps ANIMAL_BUILDINGS as an original-name re-export from the unique animalBuildingDefinitions leaf source while Store and AnimalView use registry-backed compatibility facades.'
  },
  'src/data/animals.ts:BUILDING_UPGRADES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps BUILDING_UPGRADES as an original-name re-export from the unique animalBuildingDefinitions leaf source while upgrade lookups resolve taoyuan:animal_building.'
  },
  'src/data/animals.ts:AnimalBuildingUpgradeDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: false,
    status: 'verified',
    rationale: 'Type-only re-export for the legacy animal building upgrade compatibility shape.'
  },
  'src/data/animals.ts:getBuildingDefs': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy animal building list query is retained and now returns local-ID AnimalBuildingDef compatibility objects reconstructed from taoyuan:animal_building.'
  },
  'src/data/animals.ts:getBuildingDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getBuildingDef() signature is retained and now resolves taoyuan:animal_building before returning an equivalent local-ID AnimalBuildingDef compatibility object.'
  },
  'src/data/animals.ts:getBuildingUpgrade': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getBuildingUpgrade() signature is retained and now reads nested upgrade definitions from taoyuan:animal_building while preserving local building IDs.'
  },
  'src/data/animals.ts:ANIMAL_INCUBATIONS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps ANIMAL_INCUBATIONS as an original-name re-export from the unique animalIncubationDefinitions leaf source while Store and AnimalView use registry-backed compatibility facades.'
  },
  'src/data/animals.ts:INCUBATION_MAP': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps INCUBATION_MAP as an original-name re-export for rollback; runtime incubation lookups now resolve taoyuan:animal_incubation through getIncubationDef()/getIncubationMap().'
  },
  'src/data/animals.ts:AnimalIncubationDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: false,
    status: 'verified',
    rationale: 'Type-only re-export for the legacy animal incubation compatibility shape.'
  },
  'src/data/animals.ts:AnimalIncubationMapping': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: false,
    status: 'verified',
    rationale: 'Type-only re-export for the legacy incubation mapping compatibility shape.'
  },
  'src/data/animals.ts:getIncubationDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getIncubationDef() signature is retained and now resolves taoyuan:animal_incubation by egg item ID before returning an equivalent local-ID mapping.'
  },
  'src/data/animals.ts:getIncubationDefs': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy incubation list query is retained and now returns local-ID incubation definitions reconstructed from taoyuan:animal_incubation.'
  },
  'src/data/animals.ts:getIncubationMap': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy incubation map query is retained and now returns local egg item IDs mapped from taoyuan:animal_incubation entries.'
  },
  'src/data/animals.ts:HAY_PRICE': {
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies hay purchase price projection through taoyuan:shop_offer; animal feeding rules remain framework-owned.'
  },
  'src/data/fruitTrees.ts:FRUIT_TREE_DEFS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:tree',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps FRUIT_TREE_DEFS as an original-name re-export from the unique treeDefinitions leaf source; runtime Store, composable and ShopView consumers now query taoyuan:tree.'
  },
  'src/data/fruitTrees.ts:getFruitTreeDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:tree',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getFruitTreeDef() signature is retained and now resolves taoyuan:tree before returning an equivalent local-ID FruitTreeDef compatibility object.'
  },
  'src/data/wildTrees.ts:WILD_TREE_DEFS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:tree',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps WILD_TREE_DEFS as an original-name re-export from the unique treeDefinitions leaf source; runtime Store and composable consumers now query taoyuan:tree.'
  },
  'src/data/wildTrees.ts:getWildTreeDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:tree',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getWildTreeDef() signature is retained and now resolves taoyuan:tree before returning an equivalent local-ID WildTreeDef compatibility object.'
  },
  'src/data/treeDefinitions.ts:FRUIT_TREE_DEFINITIONS': {
    classification: 'content',
    targetRegistry: 'taoyuan:tree',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all eight legacy fruit-tree definitions; Phase 6 projects every field into taoyuan:tree and verifies order and behavior equivalence.'
  },
  'src/data/treeDefinitions.ts:WILD_TREE_DEFINITIONS': {
    classification: 'content',
    targetRegistry: 'taoyuan:tree',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all three legacy wild-tree definitions; Phase 6 projects every field into taoyuan:tree and verifies order and behavior equivalence.'
  },
  'src/data/fish.ts:FISH': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps FISH as an original-name re-export from the unique fishDefinitions leaf source; runtime consumers now use registry-backed fish facades.'
  },
  'src/data/fish.ts:getFishById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getFishById() signature is retained and now resolves taoyuan:fish before returning an equivalent local-ID FishDef compatibility object.'
  },
  'src/data/fish.ts:getAvailableFish': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getAvailableFish() signature is retained and now resolves season, weather and location availability through the official fish registry facade.'
  },
  'src/data/fishDefinitions.ts:FISH': {
    classification: 'content',
    targetRegistry: 'taoyuan:fish',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all legacy fish definitions; Phase 6 projects every field into taoyuan:fish and verifies order and availability equivalence.'
  },
  'src/data/fishDefinitions.ts:FISHING_LOCATIONS': {
    classification: 'ui',
    targetRegistry: 'ui/fishing-location',
    persistentIds: true,
    status: 'framework-retained',
    rationale: 'Fishing location labels and descriptions remain a UI/framework list for this fish-definition slice; location registry migration is out of scope.'
  },
  'src/data/fishPondDefinitions.ts:PONDABLE_FISH': {
    classification: 'content',
    targetRegistry: 'taoyuan:pondable_fish',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all 13 legacy pondable fish definitions; Phase 6 projects every field into taoyuan:pondable_fish and verifies order, genetics and fish pond runtime behavior.'
  },
  'src/data/fishPond.ts:PONDABLE_FISH': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:pondable_fish',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps PONDABLE_FISH as an original-name re-export from the unique fishPondDefinitions leaf source while fish pond consumers use registry-backed compatibility facades.'
  },
  'src/data/fishPond.ts:getPondableFishDefs': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:pondable_fish',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy list query is retained and now returns local-ID PondableFishDef compatibility objects reconstructed from taoyuan:pondable_fish.'
  },
  'src/data/fishPond.ts:getPondableFish': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:pondable_fish',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getPondableFish() signature is retained and now resolves taoyuan:pondable_fish before returning an equivalent local-ID PondableFishDef object.'
  },
  'src/data/fishPond.ts:isPondableFish': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:pondable_fish',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy isPondableFish() signature remains the fish pond admission gate and now depends on the registry-backed compatibility lookup.'
  },
  'src/data/fishPondFacilityDefinitions.ts:FishPondFacilityMaterial': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy fish pond facility material compatibility shape; the public contract is FishPondFacilityDefSchema.'
  },
  'src/data/fishPondFacilityDefinitions.ts:FishPondFacilityCost': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy fish pond facility cost compatibility shape; the public contract is FishPondFacilityDefSchema.'
  },
  'src/data/fishPondFacilityDefinitions.ts:FishPondFacilityCapacity': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy fish pond capacity compatibility shape; the public contract is FishPondFacilityDefSchema.'
  },
  'src/data/fishPondFacilityDefinitions.ts:FishPondFacilityUpgrade': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy fish pond upgrade compatibility shape; the public contract is FishPondFacilityDefSchema.'
  },
  'src/data/fishPondFacilityDefinitions.ts:FishPondFacilityDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy fish pond facility compatibility shape; the public contract is FishPondFacilityDefSchema.'
  },
  'src/data/fishPondFacilityDefinitions.ts:FISH_POND_FACILITY': {
    classification: 'content',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for fish pond build cost, upgrade costs, level capacities and level-3 unlimited semantics.'
  },
  'src/data/fishPond.ts:FISH_POND_FACILITY': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps FISH_POND_FACILITY as an original-name re-export from the unique fishPondFacilityDefinitions leaf source.'
  },
  'src/data/fishPond.ts:POND_BUILD_COST': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy build-cost constant is retained for compatibility and now derives from the fish pond facility registry facade.'
  },
  'src/data/fishPond.ts:POND_UPGRADE_COSTS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy upgrade-cost constant is retained for compatibility and now derives from the fish pond facility registry facade.'
  },
  'src/data/fishPond.ts:POND_CAPACITY': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy static level-capacity constant is retained with level 3 equal to 20 while runtime capacity is resolved through getPondRuntimeCapacity().'
  },
  'src/data/fishPond.ts:getFishPondFacilityDefs': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy list query returns local-ID fish pond facility compatibility objects reconstructed from taoyuan:fish_pond_facility.'
  },
  'src/data/fishPond.ts:getPondBuildCost': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    status: 'verified',
    rationale: 'Build cost lookup now resolves the fish pond facility registry while preserving money and material quantities.'
  },
  'src/data/fishPond.ts:getPondUpgradeCost': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    status: 'verified',
    rationale: 'Upgrade cost lookup now resolves the fish pond facility registry while preserving level 2 and level 3 costs.'
  },
  'src/data/fishPond.ts:getPondCapacity': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    status: 'verified',
    rationale: 'Static capacity lookup preserves the old POND_CAPACITY table values for all three levels.'
  },
  'src/data/fishPond.ts:getPondRuntimeCapacity': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    status: 'verified',
    rationale: 'Runtime capacity lookup applies the registry-backed unlimitedAtLevel rule while preserving level 3 as infinite capacity.'
  },
  'src/data/buildingUpgradeDefinitions.ts:BuildingUpgradeMaterial': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy building upgrade material compatibility shape; the public contract is BuildingUpgradeDefSchema.'
  },
  'src/data/buildingUpgradeDefinitions.ts:FarmhouseUpgradeDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy farmhouse upgrade compatibility shape reconstructed from taoyuan:building_upgrade.'
  },
  'src/data/buildingUpgradeDefinitions.ts:CaveUpgradeDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy cave upgrade compatibility shape reconstructed from taoyuan:building_upgrade.'
  },
  'src/data/buildingUpgradeDefinitions.ts:CellarUpgradeDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy cellar upgrade compatibility shape reconstructed from taoyuan:building_upgrade.'
  },
  'src/data/buildingUpgradeDefinitions.ts:FARMHOUSE_UPGRADES': {
    classification: 'content',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy farmhouse upgrade names, descriptions, costs, materials and benefits.'
  },
  'src/data/buildingUpgradeDefinitions.ts:CAVE_UPGRADES': {
    classification: 'content',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy cave upgrade chances, pools, costs, materials and names.'
  },
  'src/data/buildingUpgradeDefinitions.ts:CELLAR_UPGRADES': {
    classification: 'content',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy cellar value increments, slot counts, costs and materials.'
  },
  'src/data/buildings.ts:FARMHOUSE_UPGRADES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps FARMHOUSE_UPGRADES as an original-name re-export from buildingUpgradeDefinitions while HomeStore reads registry-backed compatibility facades.'
  },
  'src/data/buildings.ts:CAVE_UPGRADES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps CAVE_UPGRADES as an original-name re-export from buildingUpgradeDefinitions while cave runtime lookups resolve taoyuan:building_upgrade.'
  },
  'src/data/buildings.ts:CELLAR_UPGRADES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps CELLAR_UPGRADES as an original-name re-export from buildingUpgradeDefinitions while cellar runtime lookups resolve taoyuan:building_upgrade.'
  },
  'src/data/buildings.ts:BuildingUpgradeMaterial': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'Type-only re-export for the legacy building upgrade material compatibility shape.'
  },
  'src/data/buildings.ts:FarmhouseUpgradeDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'Type-only re-export for the legacy farmhouse upgrade compatibility shape.'
  },
  'src/data/buildings.ts:CaveUpgradeDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'Type-only re-export for the legacy cave upgrade compatibility shape.'
  },
  'src/data/buildings.ts:CellarUpgradeDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'Type-only re-export for the legacy cellar upgrade compatibility shape.'
  },
  'src/data/buildings.ts:getFarmhouseUpgrade': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getFarmhouseUpgrade() signature is retained and now resolves taoyuan:building_upgrade before returning an equivalent local-ID object.'
  },
  'src/data/buildings.ts:getFarmhouseUpgrades': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy farmhouse upgrade list query returns local-ID compatibility objects reconstructed from taoyuan:building_upgrade.'
  },
  'src/data/buildings.ts:getCaveUpgrade': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getCaveUpgrade() signature is retained and now resolves taoyuan:building_upgrade before returning equivalent cave chances, pools and costs.'
  },
  'src/data/buildings.ts:getCaveUpgrades': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy cave upgrade list query returns local-ID compatibility objects reconstructed from taoyuan:building_upgrade.'
  },
  'src/data/buildings.ts:getCellarUpgrade': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getCellarUpgrade() signature is retained and now resolves taoyuan:building_upgrade before returning equivalent value and capacity fields.'
  },
  'src/data/buildings.ts:getCellarUpgrades': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy cellar upgrade list query returns local-ID compatibility objects reconstructed from taoyuan:building_upgrade.'
  },
  'src/data/breedingDefinitions.ts:HYBRID_DEFINITIONS': {
    classification: 'content',
    targetRegistry: 'taoyuan:breeding_hybrid',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy hybrid crop definitions; Phase 6 projects every hybrid ID, parent crops, thresholds, result crop, base genetics and discovery text into taoyuan:breeding_hybrid.'
  },
  'src/data/breedingDefinitions.ts:HYBRID_TIER_COUNTS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:breeding_hybrid',
    persistentIds: false,
    status: 'verified',
    rationale: 'Derived tier boundary summary retained for legacy getHybridTier() compatibility and verified against official breeding hybrid registry order.'
  },
  'src/data/breedingDefinitions.ts:getTieredHybridDefinitions': {
    classification: 'derived',
    targetRegistry: 'taoyuan:breeding_hybrid',
    persistentIds: false,
    status: 'verified',
    rationale: 'Combines the legacy hybrid catalog and tier boundaries for the official adapter so every taoyuan:breeding_hybrid entry carries explicit tier semantics.'
  },
  'src/data/breeding.ts:HYBRID_DEFS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:breeding_hybrid',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name export now returns local-ID compatibility objects reconstructed from taoyuan:breeding_hybrid while preserving legacy import paths.'
  },
  'src/data/breeding.ts:getHybridTier': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:breeding_hybrid',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getHybridTier() signature is retained and now derives tiers from official breeding hybrid registry order and tier counts.'
  },
  'src/data/breeding.ts:findPossibleHybrid': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:breeding_hybrid',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy parent-crop lookup is retained and now searches official breeding hybrid entries before returning the same local-ID HybridDef shape.'
  },
  'src/data/breeding.ts:findPossibleHybridById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:breeding_hybrid',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy hybrid ID lookup is retained and now resolves taoyuan:breeding_hybrid entries by local, prefixed or namespaced ID.'
  },
  'src/data/pondBreedDefinitions.ts:POND_BREEDS': {
    classification: 'content',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique leaf source for all 400 generated legacy pond breed definitions; Phase 6 projects every ID, name, generation, base fish and parent link into taoyuan:pond_breed.'
  },
  'src/data/pondBreedDefinitions.ts:BREED_COUNTS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Derived generation count summary verified alongside the 400 official pond breed registry entries.'
  },
  'src/data/pondBreeds.ts:POND_BREEDS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps POND_BREEDS as an original-name re-export from the unique pondBreedDefinitions leaf source while runtime queries use registry-backed facades.'
  },
  'src/data/pondBreeds.ts:BREED_COUNTS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps BREED_COUNTS as an original-name re-export while generation queries are verified against taoyuan:pond_breed.'
  },
  'src/data/pondBreeds.ts:getBreedById': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getBreedById() signature is retained and now resolves taoyuan:pond_breed before returning an equivalent local-ID PondBreedDef object.'
  },
  'src/data/pondBreeds.ts:getBreedsByGeneration': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy generation query is retained and verified against the official pond breed registry ordering and generation counts.'
  },
  'src/data/pondBreeds.ts:getBreedsBySpecies': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy species query is retained and now filters official pond breed entries by namespaced base fish ID before returning local-ID compatibility objects.'
  },
  'src/data/pondBreeds.ts:getGen1BreedsForFish': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy Gen1 fish query is retained for fish pond addFish() and now reads the official pond breed registry.'
  },
  'src/data/pondBreeds.ts:findBreedByParents': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy parent-pair lookup remains order-insensitive and now resolves parent IDs through taoyuan:pond_breed.'
  },
  'src/data/forageDefinitions.ts:FORAGE_ITEMS': {
    classification: 'content',
    targetRegistry: 'taoyuan:forage',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for all legacy bamboo forest forage items; Phase 6 projects every field into taoyuan:forage and verifies order and seasonal filtering equivalence.'
  },
  'src/data/forage.ts:ForageItemDef': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:forage',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy TypeScript-only forage item shape is re-exported from the leaf module for compatibility; the public contract is ForageDefSchema.'
  },
  'src/data/forage.ts:FORAGE_ITEMS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:forage',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 keeps FORAGE_ITEMS as an original-name re-export from the unique forageDefinitions leaf source while runtime queries use registry-backed forage facades.'
  },
  'src/data/forage.ts:WEATHER_FORAGE_MODIFIER': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/forage',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Weather probability modifiers remain framework-owned forage rules for this slice; taoyuan:forage only carries base item availability and rewards.'
  },
  'src/data/forage.ts:getForageItems': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:forage',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy getForageItems() signature is retained and now resolves seasonal bamboo forest forage lists through taoyuan:forage.'
  },
  'src/data/forage.ts:FRIENDLY_ANIMALS': {
    classification: 'content',
    targetRegistry: 'taoyuan:animal',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'baselined',
    rationale: 'Friendly bamboo forest encounters are intentionally left for the later animal slice; this forage slice does not migrate encounter weights or product collection.'
  },
  'src/data/forage.ts:HOSTILE_ANIMALS': {
    classification: 'content',
    targetRegistry: 'taoyuan:monster',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'baselined',
    rationale: 'Hostile bamboo forest encounters are intentionally left for a later monster/encounter slice; this forage slice does not migrate combat or defeat penalties.'
  },
  'src/data/weaponDefinitions.ts:MONSTER_DROP_WEAPONS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies MONSTER_DROP_WEAPONS through named taoyuan:drop_table entries without changing weapon drop settlement; weaponDefinitions now owns the static source after the Phase 6 weapon slice.'
  },
  'src/data/weaponDefinitions.ts:BOSS_DROP_WEAPONS': {
    classification: 'derived',
    targetRegistry: 'engine/domain/mining-boss-reward',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'baselined',
    rationale: 'BOSS first-kill weapon reward mapping remains in the existing mining reward path; the Phase 6 weapon definition slice does not migrate boss reward settlement.'
  },
  'src/data/weaponDefinitions.ts:TREASURE_DROP_WEAPONS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies TREASURE_DROP_WEAPONS through named taoyuan:drop_table entries while treasure settlement remains framework-owned; weaponDefinitions now owns the static source after the Phase 6 weapon slice.'
  },
  'src/data/weapons.ts:MONSTER_DROP_WEAPONS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves monster weapon drop imports while weaponDefinitions remains the unique audited drop-table source.'
  },
  'src/data/weapons.ts:BOSS_DROP_WEAPONS': {
    classification: 'adapter',
    targetRegistry: 'engine/domain/mining-boss-reward',
    persistentIds: true,
    status: 'baselined',
    rationale: 'Original-name re-export preserves boss weapon reward imports; boss reward settlement remains outside this equipment definition slice.'
  },
  'src/data/weapons.ts:TREASURE_DROP_WEAPONS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves treasure weapon drop imports while weaponDefinitions remains the unique audited drop-table source.'
  },
  'src/data/ringDefinitions.ts:MONSTER_DROP_RINGS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies MONSTER_DROP_RINGS through named taoyuan:drop_table entries; ringDefinitions now owns the static source after the Phase 6 equipment slice.'
  },
  'src/data/ringDefinitions.ts:BOSS_DROP_RINGS': {
    classification: 'derived',
    targetRegistry: 'engine/domain/mining-boss-reward',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'baselined',
    rationale: 'BOSS first-kill ring reward mapping remains in the existing mining reward path; the Phase 6 ring slice does not migrate boss reward settlement.'
  },
  'src/data/ringDefinitions.ts:TREASURE_DROP_RINGS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies TREASURE_DROP_RINGS through named taoyuan:drop_table entries; ringDefinitions now owns the static source after the Phase 6 equipment slice.'
  },
  'src/data/rings.ts:MONSTER_DROP_RINGS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies MONSTER_DROP_RINGS through named taoyuan:drop_table entries without changing ring drop settlement.'
  },
  'src/data/rings.ts:TREASURE_DROP_RINGS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies TREASURE_DROP_RINGS through named taoyuan:drop_table entries while treasure settlement remains framework-owned.'
  },
  'src/data/hatDefinitions.ts:MONSTER_DROP_HATS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies MONSTER_DROP_HATS through named taoyuan:drop_table entries; hatDefinitions now owns the static source after the Phase 6 equipment slice.'
  },
  'src/data/hatDefinitions.ts:BOSS_DROP_HATS': {
    classification: 'derived',
    targetRegistry: 'engine/domain/mining-boss-reward',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'baselined',
    rationale: 'BOSS first-kill hat reward mapping remains in the existing mining reward path; the Phase 6 hat slice does not migrate boss reward settlement.'
  },
  'src/data/hatDefinitions.ts:TREASURE_DROP_HATS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies TREASURE_DROP_HATS through named taoyuan:drop_table entries; hatDefinitions now owns the static source after the Phase 6 equipment slice.'
  },
  'src/data/hats.ts:MONSTER_DROP_HATS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies MONSTER_DROP_HATS through named taoyuan:drop_table entries without changing hat drop settlement.'
  },
  'src/data/hats.ts:TREASURE_DROP_HATS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies TREASURE_DROP_HATS through named taoyuan:drop_table entries while treasure settlement remains framework-owned.'
  },
  'src/data/enchantmentDefinitions.ts:ENCHANTMENTS': {
    classification: 'content',
    targetRegistry: 'taoyuan:enchantment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique registry-free leaf source for legacy enchantment definitions; Phase 4 verifies ENCHANTMENTS through taoyuan:enchantment, including display fields, combat bonuses and special effects.'
  },
  'src/data/enchantmentDefinitions.ts:ENCHANTMENT_RARITY': {
    classification: 'derived',
    targetRegistry: 'taoyuan:enchantment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 enchantment registry pilot folds legacy rarity into official enchantment definitions and verifies existing cost inputs remain equivalent; enchantmentDefinitions now owns the static source.'
  },
  'src/data/enchantmentDefinitions.ts:RANDOM_ENCHANT_IDS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:enchantment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 enchantment registry pilot converts legacy random enchantment membership and rarity into deterministic randomWeight fields without changing rollWeightedEnchantment(); enchantmentDefinitions now owns the static source.'
  },
  'src/data/enchantmentDefinitions.ts:ENCHANTMENT_EFFECTS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:enchantment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 enchantment registry pilot carries existing standard equipment effect parameters into taoyuan:enchantment while runtime collection still uses the legacy map; enchantmentDefinitions now owns the static source.'
  },
  'src/data/weapons.ts:ENCHANTMENTS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:enchantment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves legacy enchantment imports after static enchantment data moved to enchantmentDefinitions.'
  },
  'src/data/weapons.ts:ENCHANTMENT_RARITY': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:enchantment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves legacy rarity imports after static enchantment data moved to enchantmentDefinitions.'
  },
  'src/data/weapons.ts:RANDOM_ENCHANT_IDS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:enchantment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves legacy random enchantment membership imports after static enchantment data moved to enchantmentDefinitions.'
  },
  'src/data/weapons.ts:ENCHANTMENT_EFFECTS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:enchantment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export preserves legacy effect map imports after static enchantment data moved to enchantmentDefinitions.'
  },
  'src/data/mine.ts:MONSTERS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 5 retains the MONSTERS re-export from data/mine.ts as a compatibility path; the unique static definition now lives in data/monsters.ts and runtime consumers use registry facades.'
  },
  'src/data/mine.ts:BOSS_MONSTERS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 5 retains the BOSS_MONSTERS re-export from data/mine.ts for compatibility; boss definitions and floor pools now project from data/monsters.ts and runtime resolves them through monster_pool.'
  },
  'src/data/mine.ts:SKULL_CAVERN_MONSTERS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 5 retains the SKULL_CAVERN_MONSTERS re-export from data/mine.ts for compatibility; the source definitions and pool projections now live in the leaf monster data module.'
  },
  'src/data/mine.ts:ZONE_MONSTERS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster_pool',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 5 retains the ZONE_MONSTERS re-export as a rollback path while getFloor(), Store and Vue consumers resolve ordered zone pools through taoyuan:monster_pool.'
  },
  'src/data/mine.ts:MINE_FLOORS': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/mining',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'The 120-floor generation table remains framework-owned; Phase 5 only replaces its monster candidates with deterministic registry pool resolution.'
  },
  'src/data/mine.ts:getFloor': {
    classification: 'adapter',
    persistentIds: false,
    status: 'verified',
    rationale: 'Phase 5 getFloor() preserves its signature and 120-floor behavior while returning zone candidates resolved from taoyuan:monster_pool.'
  },
  'src/data/mine.ts:getWeakenedBoss': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster_pool',
    persistentIds: false,
    status: 'verified',
    rationale: 'Phase 5 resolves the floor boss through the registry facade before applying the unchanged 70 percent framework scaling rule.'
  },
  'src/data/monsters.ts:MONSTERS': {
    classification: 'content',
    targetRegistry: 'taoyuan:monster',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 5 leaf data source for all ordinary monster definitions, projected into taoyuan:monster and verified against compatibility exports.'
  },
  'src/data/monsters.ts:BOSS_MONSTERS': {
    classification: 'content',
    targetRegistry: 'taoyuan:monster',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 5 leaf data source for boss definitions; each floor mapping is also projected into a required ordered taoyuan:monster_pool entry.'
  },
  'src/data/monsters.ts:SKULL_CAVERN_MONSTERS': {
    classification: 'content',
    targetRegistry: 'taoyuan:monster',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 5 leaf data source for skull cavern monsters and the ordered base pool projection.'
  },
  'src/data/monsters.ts:ZONE_MONSTERS': {
    classification: 'content',
    targetRegistry: 'taoyuan:monster_pool',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 5 projects all six ordered legacy zone arrays into required taoyuan:monster_pool entries and verifies fixed-random floor generation equivalence.'
  },
  'src/data/travelingMerchant.ts:TravelingMerchantItem': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy traveling merchant item shape retained for stock generation compatibility; public content remains the ShopOfferDef TypeBox contract.'
  },
  'src/data/travelingMerchant.ts:TravelingMerchantStock': {
    classification: 'adapter',
    targetRegistry: 'engine/domain/shops',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Runtime stock and serialized remaining quantity shape remains framework-owned; the underlying merchant product pool is now resolved through taoyuan:shop_offer.'
  },
  'src/data/travelingMerchant.ts:TRAVELING_MERCHANT_POOL': {
    classification: 'content',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy traveling merchant product pool is projected into taoyuan:shop_offer and verified against the registry-backed compatibility pool without changing order, names or base prices.'
  },
  'src/data/travelingMerchant.ts:isTravelingMerchantDay': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/shops',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Traveling merchant schedule calculation remains framework-owned and is not content data in the shop offer migration slice.'
  },
  'src/data/travelingMerchant.ts:generateMerchantStock': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/shops',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Deterministic stock generation, price variation, quantity rolls and off-season seed selection remain framework-owned while the rare item pool now reads the taoyuan:shop_offer compatibility facade.'
  },
  'src/data/marketDefinitions.ts:MarketCategory': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy market category union retained for public data/market compatibility; the public content contract is MarketCategoryDefSchema.'
  },
  'src/data/marketDefinitions.ts:MarketSupplyThresholds': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: false,
    status: 'verified',
    rationale: 'TypeScript-only legacy supply threshold shape retained for compatibility; TypeBox owns the public market category contract.'
  },
  'src/data/marketDefinitions.ts:MarketCategoryDefinition': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: false,
    status: 'verified',
    rationale: 'Registry-free legacy leaf shape used only by the official static adapter and equivalence tests.'
  },
  'src/data/marketDefinitions.ts:MARKET_CATEGORY_DEFINITIONS': {
    classification: 'content',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique leaf source for the seven official market categories; Phase 6 projects names, seasonal coefficients and supply thresholds into taoyuan:market_category.'
  },
  'src/data/marketDefinitions.ts:MARKET_CATEGORIES': {
    classification: 'derived',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy ordered category list derived from MARKET_CATEGORY_DEFINITIONS; tests verify registry order matches this list.'
  },
  'src/data/marketDefinitions.ts:MARKET_CATEGORY_NAMES': {
    classification: 'derived',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy name map derived from market category definitions; registry-backed getters preserve all displayed names.'
  },
  'src/data/marketDefinitions.ts:SEASON_COEFFICIENTS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy seasonal coefficient map derived from market category definitions; market algorithm equivalence tests preserve multiplier results.'
  },
  'src/data/marketDefinitions.ts:SUPPLY_THRESHOLDS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy supply threshold map derived from market category definitions; market algorithm equivalence tests preserve supply-demand multipliers.'
  },
  'src/data/market.ts:MarketCategory': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: false,
    status: 'verified',
    rationale: 'Original type export remains available from data/market while the leaf definition lives in marketDefinitions.'
  },
  'src/data/market.ts:MarketTrend': {
    classification: 'adapter',
    targetRegistry: 'engine/domain/market',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Runtime trend label category remains framework-owned; market category content migration does not change trend identity.'
  },
  'src/data/market.ts:CategoryMarketInfo': {
    classification: 'adapter',
    targetRegistry: 'engine/domain/market',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Runtime market info shape remains a framework result object, not content data.'
  },
  'src/data/market.ts:TREND_NAMES': {
    classification: 'ui',
    targetRegistry: 'ui/market',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Trend display labels remain UI text for framework-calculated market states.'
  },
  'src/data/market.ts:TREND_COLORS': {
    classification: 'ui',
    targetRegistry: 'ui/market',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Trend color classes remain presentation-only UI data.'
  },
  'src/data/market.ts:MARKET_CATEGORY_NAMES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name compatibility export now points at the verified marketDefinitions name map while runtime name lookup reads the registry facade.'
  },
  'src/data/market.ts:getMarketCategoryName': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: false,
    status: 'verified',
    rationale: 'Preserves market category display name lookup while resolving names through the registry-backed facade with legacy fallback.'
  },
  'src/data/market.ts:getMarketMultiplier': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/market',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy signature remains unchanged; the framework-owned multiplier algorithm now reads category coefficients and thresholds through taoyuan:market_category.'
  },
  'src/data/market.ts:getDailyMarketInfo': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/market',
    persistentIds: false,
    status: 'verified',
    rationale: 'Framework-owned daily market calculation preserves seed, category order, random calls, trends and output while category definitions come from the registry facade.'
  },
  'src/data/hanhaiShopDefinitions.ts:HANHAI_FIXED_ITEMS': {
    classification: 'content',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique leaf source for Hanhai fixed inn shop items; Phase 6 projects item IDs, names, descriptions, prices and weekly limits into ordered taoyuan:shop_offer entries.'
  },
  'src/data/hanhaiShopDefinitions.ts:HANHAI_ROTATING_POOL': {
    classification: 'content',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique leaf source for the Hanhai weekly rotating product pool; Phase 6 projects item IDs, names, descriptions, prices and weekly limits into ordered taoyuan:shop_offer entries while the weekly shuffle remains framework-owned.'
  },
  'src/data/hanhai.ts:HANHAI_FIXED_ITEMS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy Hanhai fixed shop imports stable after the shop item leaf data moved to hanhaiShopDefinitions.ts.'
  },
  'src/data/hanhai.ts:HANHAI_ROTATING_POOL': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy Hanhai rotating pool imports stable after the shop item leaf data moved to hanhaiShopDefinitions.ts.'
  },
  'src/data/hanhai.ts:getWeeklyRotatingItems': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/hanhai',
    persistentIds: false,
    status: 'verified',
    rationale: 'Legacy deterministic weekly stock function preserves seed, shuffle order and four-item output while reading the product pool through the registry-backed Hanhai shop facade.'
  },
  'src/data/hanhai.ts:MAX_DAILY_BETS': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/hanhai-mechanism-plugin',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Daily gambling limit is shared mutable Hanhai minigame gating, not standalone content data; it remains framework-owned until a future mechanism-plugin slice owns the whole casino runtime.'
  },
  'src/data/hanhai.ts:CRICKETS': {
    classification: 'content',
    targetRegistry: 'engine/domain/hanhai-mechanism-plugin',
    persistentIds: true,
    status: 'framework-retained',
    rationale: 'Cricket candidates are inseparable from the cricket betting runtime, animation, random battle and settlement flow; treat them as a future Phase 3 mechanism-plugin candidate instead of another Phase 6 static registry.'
  },
  'src/data/hanhai.ts:CARD_TOTAL': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/hanhai-mechanism-plugin',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Card count is part of the Hanhai card-flip minigame rule set and stays with its random treasure placement and settlement runtime until a mechanism-plugin slice owns that game.'
  },
  'src/data/hanhai.ts:TEXAS_TIERS': {
    classification: 'content',
    targetRegistry: 'engine/domain/hanhai-mechanism-plugin',
    persistentIds: true,
    status: 'framework-retained',
    rationale: 'Texas hold em tier definitions are coupled to entry fees, blinds, dealer AI, round state, component UI and settlement; keep them framework-owned as a future Phase 3 mechanism-plugin candidate.'
  },
  'src/data/hanhai.ts:getTexasTier': {
    classification: 'adapter',
    targetRegistry: 'engine/domain/hanhai-mechanism-plugin',
    persistentIds: false,
    status: 'framework-retained',
    rationale: 'Compatibility lookup for framework-owned Texas tier definitions; no Phase 6 data registry is introduced until the whole poker mechanism is extracted.'
  },
  'src/data/hanhaiDefinitions.ts:TRADE_EXCHANGE_ITEMS': {
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_trade_exchange',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique leaf source for the six legacy Hanhai trade point exchange definitions; Phase 6 projects item IDs, names, point costs, descriptions and limit metadata into taoyuan:hanhai_trade_exchange.'
  },
  'src/data/hanhai.ts:TRADE_EXCHANGE_ITEMS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_trade_exchange',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy Hanhai imports stable after the trade exchange leaf data moved to hanhaiDefinitions.ts.'
  },
  'src/data/hanhaiTradeShopDefinitions.ts:TRADE_SHOP_UPGRADES': {
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_trade_shop_upgrade',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique leaf source for the five legacy Hanhai trade shop upgrade definitions; Phase 6 projects levels, names, slot counts, sell days, money costs and materials into taoyuan:hanhai_trade_shop_upgrade.'
  },
  'src/data/hanhai.ts:TRADE_SHOP_UPGRADES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_trade_shop_upgrade',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy Hanhai imports stable after trade shop upgrade leaf data moved to hanhaiTradeShopDefinitions.ts.'
  },
  'src/data/hanhaiTreasureDefinitions.ts:HANHAI_TREASURE_REWARDS': {
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_treasure_reward',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique leaf source for the four legacy Hanhai treasure map reward tiers; Phase 6 projects roll thresholds, money rewards and item rewards into taoyuan:hanhai_treasure_reward.'
  },
  'src/data/hanhai.ts:HANHAI_TREASURE_REWARDS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_treasure_reward',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy Hanhai imports stable after treasure reward leaf data moved to hanhaiTreasureDefinitions.ts.'
  },
  'src/data/hanhaiRouletteDefinitions.ts:HanhaiRouletteDefinition': {
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: true,
    status: 'verified',
    rationale: 'Legacy local TypeScript shape for the Hanhai lucky roulette leaf config; public external shape remains the TypeBox HanhaiRouletteDefSchema.'
  },
  'src/data/hanhaiRouletteDefinitions.ts:ROULETTE_OUTCOMES': {
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique leaf source for the four legacy lucky roulette outcome labels, multipliers and probability weights; Phase 6 projects them into taoyuan:hanhai_roulette without changing order or thresholds.'
  },
  'src/data/hanhaiRouletteDefinitions.ts:ROULETTE_BET_TIERS': {
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique leaf source for the three legacy lucky roulette bet tiers; Phase 6 projects them into taoyuan:hanhai_roulette while bet validation stays in the Hanhai store.'
  },
  'src/data/hanhaiRouletteDefinitions.ts:HANHAI_ROULETTE_CONFIG': {
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Single official Hanhai lucky roulette config leaf tying outcome order and bet tier order to the taoyuan:hanhai_roulette registry entry.'
  },
  'src/data/hanhai.ts:HANHAI_ROULETTE_CONFIG': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy Hanhai roulette config imports stable after the fixed config moved to hanhaiRouletteDefinitions.ts.'
  },
  'src/data/hanhai.ts:ROULETTE_OUTCOMES': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy roulette outcome imports stable while Store and View consumers can read outcomes through the registry facade.'
  },
  'src/data/hanhai.ts:ROULETTE_BET_TIERS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy bet tier imports stable while runtime validation reads tiers through the registry facade.'
  },
  'src/data/hanhai.ts:spinRoulette': {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/hanhai',
    persistentIds: false,
    status: 'verified',
    rationale: 'Framework-owned lucky roulette random selection keeps the same signature, one Math.random() call and threshold semantics while reading outcome weights through taoyuan:hanhai_roulette.'
  },
  'src/data/hanhaiCasinoDefinitions.ts:HANHAI_CASINO_WAGERS': {
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Unique leaf source for the legacy dice and cup fixed wager definitions; Phase 6 projects bet amounts and win multipliers into taoyuan:hanhai_casino_wager without changing minigame algorithms.'
  },
  'src/data/hanhaiCasinoDefinitions.ts:DICE_BET_AMOUNT': {
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy dice bet constant is derived from the verified casino wager leaf so old imports keep the same 200 wen value.'
  },
  'src/data/hanhaiCasinoDefinitions.ts:DICE_WIN_MULTIPLIER': {
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy dice multiplier constant is derived from the verified casino wager leaf so old imports keep the same 2x payout.'
  },
  'src/data/hanhaiCasinoDefinitions.ts:CUP_BET_AMOUNT': {
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy cup bet constant is derived from the verified casino wager leaf so old imports keep the same 250 wen value.'
  },
  'src/data/hanhaiCasinoDefinitions.ts:CUP_WIN_MULTIPLIER': {
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Legacy cup multiplier constant is derived from the verified casino wager leaf so old imports keep the same 3x payout.'
  },
  'src/data/hanhai.ts:HANHAI_CASINO_WAGERS': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy Hanhai casino wager imports stable after dice and cup fixed config moved to hanhaiCasinoDefinitions.ts.'
  },
  'src/data/hanhai.ts:DICE_BET_AMOUNT': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy dice bet imports stable while Store and View consumers read the value through the registry facade.'
  },
  'src/data/hanhai.ts:DICE_WIN_MULTIPLIER': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy dice multiplier imports stable while Store and View consumers read the value through the registry facade.'
  },
  'src/data/hanhai.ts:CUP_BET_AMOUNT': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy cup bet imports stable while Store and View consumers read the value through the registry facade.'
  },
  'src/data/hanhai.ts:CUP_WIN_MULTIPLIER': {
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Original-name re-export keeps legacy cup multiplier imports stable while Store and View consumers read the value through the registry facade.'
  }
}))

const registerInventoryClosureReviews = (file, exportNames, review) => {
  for (const exportName of exportNames) {
    const key = `${file}:${exportName}`
    const existingReview = symbolReviewOverrides.get(key)
    if (existingReview && !['baselined', 'inventoried'].includes(existingReview.status)) {
      throw new Error(`Duplicate content inventory review: ${key}`)
    }
    symbolReviewOverrides.set(key, {
      classification: review.classification,
      targetRegistry: review.targetRegistry,
      persistentIds: review.persistentIds ?? false,
      snapshotFixture: review.snapshotFixture,
      status: review.status,
      rationale: review.rationale(exportName)
    })
  }
}

registerInventoryClosureReviews('src/data/animalDefinitions.ts', [
  'HAY_ITEM_ID',
  'NOURISHING_FEED_ID',
  'PREMIUM_FEED_ID',
  'VITALITY_FEED_ID'
], {
  classification: 'adapter',
  targetRegistry: 'taoyuan:animal_feed',
  persistentIds: true,
  snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
  status: 'verified',
  rationale: exportName => `${exportName} is a stable local feed/item ID consumed by animalFeedDefinitions and AnimalStore; animalFeedRegistryPilot.test.ts proves the complete taoyuan:animal_feed legacy projection and phase6InventoryClosure.test.ts pins the four IDs. The named constant remains for legacy Store and save-compatible item references.`
})

registerInventoryClosureReviews('src/data/breeding.ts', [
  'BASE_BREEDING_BOX',
  'BASE_MUTATION_MAGNITUDE',
  'GENERATIONAL_STABILITY_GAIN',
  'getDefaultGenetics',
  'getSeedMakerGeneticChance',
  'getStarRating',
  'getTotalStats',
  'MAX_BREEDING_STATIONS',
  'MAX_STABILITY',
  'MUTATION_JUMP_MAX',
  'MUTATION_JUMP_MIN',
  'MUTATION_RATE_DRIFT',
  'SEED_BOX_UPGRADE_INCREMENT',
  'SEED_BOX_UPGRADES'
], {
  classification: 'algorithm',
  targetRegistry: 'engine/domain/breeding',
  status: 'framework-retained',
  rationale: exportName => `${exportName} controls breeding capacity, genetics, mutation, star rating or seed-machine behavior rather than taoyuan:breeding_hybrid content. useBreedingStore owns the runtime rule; breeding.test.ts and phase6InventoryClosure.test.ts preserve results. A future breeding mechanism plugin may replace this rule, but Phase 6 keeps it in the framework.`
})

registerInventoryClosureReviews('src/data/buildings.ts', [
  'CAVE_QUALITY_THRESHOLDS',
  'CAVE_UNLOCK_EARNINGS',
  'getCaveQuality',
  'GREENHOUSE_UPGRADES',
  'WAREHOUSE_UNLOCK_MATERIALS'
], {
  classification: 'algorithm',
  targetRegistry: 'engine/domain/facilities',
  status: 'framework-retained',
  rationale: exportName => `${exportName} belongs to cave progression or greenhouse/warehouse facility rules explicitly excluded from taoyuan:building_upgrade. HomeStore and facility views own the behavior; buildingUpgradeRegistryPilot.test.ts and phase6InventoryClosure.test.ts pin the existing boundary and values. It remains framework-owned until a complete facility mechanism contract exists.`
})

registerInventoryClosureReviews('src/data/buildings.ts', ['GreenhouseUpgradeDef'], {
  classification: 'adapter',
  targetRegistry: 'engine/domain/facilities',
  status: 'framework-retained',
  rationale: exportName => `${exportName} is the TypeScript-only shape for the currently empty greenhouse upgrade framework list, not an official content contract. FarmView owns the compatibility surface and phase6InventoryClosure.test.ts type-checks it. A future facility mechanism plugin must define any public replacement.`
})

registerInventoryClosureReviews('src/data/fishPond.ts', [
  'DISEASE_CHANCE_BASE',
  'FEED_WATER_RESTORE',
  'GENETICS_FLUCTUATION_BASE',
  'POND_MUTATION_JUMP_MAX',
  'POND_MUTATION_JUMP_MIN',
  'PURIFIER_WATER_RESTORE',
  'WATER_QUALITY_DECAY_BASE',
  'WATER_QUALITY_DECAY_CROWDED',
  'WATER_QUALITY_DECAY_HALF',
  'WATER_QUALITY_DECAY_HUNGRY'
], {
  classification: 'algorithm',
  targetRegistry: 'engine/domain/fish-pond',
  status: 'framework-retained',
  rationale: exportName => `${exportName} governs fish-pond water, disease or genetics simulation and is outside taoyuan:pondable_fish, taoyuan:pond_breed and taoyuan:fish_pond_facility. FishPond Store owns settlement; fishPondEndDay.test.ts and phase6InventoryClosure.test.ts preserve the rule. It is a future fish-pond mechanism plugin candidate.`
})

registerInventoryClosureReviews('src/data/forageDefinitions.ts', ['ForageItemDef'], {
  classification: 'adapter',
  targetRegistry: 'taoyuan:forage',
  snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
  status: 'verified',
  rationale: exportName => `${exportName} is the legacy TypeScript compatibility shape projected into ForageDefSchema. forageRegistryPilot.test.ts proves every field and ordered taoyuan:forage projection, while phase6InventoryClosure.test.ts keeps the old type surface. It remains exported so existing data and tests compile without changing the public TypeBox contract.`
})

registerInventoryClosureReviews('src/data/forage.ts', [
  'FRIENDLY_ANIMALS',
  'FriendlyAnimalDef',
  'HOSTILE_ANIMALS'
], {
  classification: 'algorithm',
  targetRegistry: 'engine/domain/forage-encounters',
  status: 'framework-retained',
  rationale: exportName => `${exportName} is coupled to weighted forest encounters, combat and defeat settlement rather than taoyuan:forage item content. Forage runtime owns the rule; gameDataValidation.test.ts and phase6InventoryClosure.test.ts verify IDs, weights and item references. The complete encounter flow is a future mechanism plugin candidate.`
})

registerInventoryClosureReviews('src/data/npcTips.ts', [
  'FORTUNE_TIERS',
  'getFortuneTip',
  'getLivingTip',
  'getRecipeTipMessage',
  'LIVING_TIPS',
  'NO_RECIPE_TIP',
  'TIP_NPC_IDS',
  'TipNpcId',
  'WEATHER_TIPS'
], {
  classification: 'ui',
  targetRegistry: 'ui/npc-daily-tips',
  status: 'framework-retained',
  rationale: exportName => `${exportName} is NPC daily-tip presentation or deterministic formatting, not an independently replaceable NPC content definition. useNpcStore owns selection and phase6InventoryClosure.test.ts pins thresholds, cycling, text formatting and IDs. Localization may move it later; it is not a Phase 6 registry or mechanism plugin.`
})

registerInventoryClosureReviews('src/data/processing.ts', [
  'AUTO_PETTER',
  'CRAB_POT_CRAFT',
  'getBaitById',
  'getFertilizerById',
  'getTackleById',
  'LIGHTNING_ROD',
  'SCARECROW',
  'TAPPER'
], {
  classification: 'adapter',
  targetRegistry: 'engine/domain/processing-facilities',
  status: 'framework-retained',
  rationale: exportName => `${exportName} is bound to fertilizer, fishing tackle or farm-facility mechanics that Phase 6 explicitly does not split into isolated registries. Processing/Farm/Fishing runtime owns the behavior; processing tests, shopOfferRegistryPilot.test.ts and phase6InventoryClosure.test.ts preserve lookups and craft descriptors. Complete facility effects remain future mechanism plugin candidates.`
})

registerInventoryClosureReviews('src/data/specialItems.ts', ['MOMO_FUMO_ITEM_ID'], {
  classification: 'adapter',
  targetRegistry: 'taoyuan:item',
  persistentIds: true,
  snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
  status: 'verified',
  rationale: exportName => `${exportName} is the stable local ID of the registered taoyuan:item entry. contentRegistryEquivalence.test.ts and gameDataValidation.test.ts verify the item and its references, while phase6InventoryClosure.test.ts pins the compatibility constant. It remains exported for inventory and save-compatible item checks.`
})

registerInventoryClosureReviews('src/data/specialItems.ts', [
  'isMomoFumo',
  'MOMO_FUMO_EXCHANGE'
], {
  classification: 'algorithm',
  targetRegistry: 'engine/domain/special-item-exchange',
  status: 'framework-retained',
  rationale: exportName => `${exportName} defines the one-step stove exchange and identity check, including quantities and fixed quality, rather than item catalog content. Cooking/validation logic owns the rule; gameDataValidation.test.ts and phase6InventoryClosure.test.ts pin it. A configurable exchange would require a complete mechanism contract, not a Phase 6 singleton registry.`
})

registerInventoryClosureReviews('src/data/timeConstants.ts', [
  'ACTION_TIME_COSTS',
  'DAY_END_HOUR',
  'DAY_START_HOUR',
  'getLocationGroupName',
  'getNpcUnavailableReason',
  'getTimePeriod',
  'getWeekday',
  'isNpcAvailable',
  'isShopOpen',
  'LATE_NIGHT_RECOVERY_MAX',
  'LATE_NIGHT_RECOVERY_MIN',
  'MIDNIGHT_HOUR',
  'MIN_ACTION_MINUTES',
  'NPC_SCHEDULES',
  'PASSOUT_HOUR',
  'PASSOUT_STAMINA_RECOVERY',
  'SHOP_SCHEDULES',
  'SKILL_TIME_REDUCTION_PER_LEVEL',
  'TAB_TO_LOCATION_GROUP',
  'TOOL_TIME_SAVINGS',
  'TRAVEL_STAMINA',
  'TRAVEL_TIME',
  'WEEKDAYS'
], {
  classification: 'algorithm',
  targetRegistry: 'engine/domain/time-navigation-schedules',
  status: 'framework-retained',
  rationale: exportName => `${exportName} participates in clock, travel, action-cost, shop-hours or NPC-availability rules and is not standalone official content. Game clock/navigation/NPC framework code owns it; time-related composable tests and phase6InventoryClosure.test.ts preserve values and boundary behavior. Any override requires a coherent time or schedule mechanism plugin.`
})

registerInventoryClosureReviews('src/data/timeConstants.ts', [
  'NpcScheduleEntry',
  'ShopSchedule'
], {
  classification: 'adapter',
  targetRegistry: 'engine/domain/time-navigation-schedules',
  status: 'framework-retained',
  rationale: exportName => `${exportName} is a TypeScript-only shape for framework-owned NPC/shop schedule rules, not a public TypeBox content contract. phase6InventoryClosure.test.ts type-checks the compatibility surface; a future schedule mechanism plugin must introduce any public replacement deliberately.`
})

for (const [file, exportName] of [
  ['src/data/hatDefinitions.ts', 'BOSS_DROP_HATS'],
  ['src/data/ringDefinitions.ts', 'BOSS_DROP_RINGS'],
  ['src/data/shoeDefinitions.ts', 'BOSS_DROP_SHOES'],
  ['src/data/shoes.ts', 'BOSS_DROP_SHOES'],
  ['src/data/weaponDefinitions.ts', 'BOSS_DROP_WEAPONS'],
  ['src/data/weapons.ts', 'BOSS_DROP_WEAPONS']
]) {
  registerInventoryClosureReviews(file, [exportName], {
    classification: 'algorithm',
    targetRegistry: 'engine/domain/mining-boss-rewards',
    status: 'framework-retained',
    rationale: name => `${name} maps main-mine progression floors to guaranteed first-kill equipment and is not a random taoyuan:drop_table. useMiningStore owns grant and duplicate behavior; mining.test.ts and phase6InventoryClosure.test.ts verify every mapping and reward path. Boss progression rewards remain framework-owned pending a complete reward mechanism plugin.`
  })
}

registerInventoryClosureReviews('src/data/weapons.ts', ['getEnchantmentById'], {
  classification: 'adapter',
  targetRegistry: 'taoyuan:enchantment',
  snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
  status: 'verified',
  rationale: exportName => `${exportName} retains the static legacy signature to avoid a contentAccess/staticAdapters cycle; enchantmentDropRegistryPilot.test.ts proves it equals every taoyuan:enchantment query and phase6InventoryClosure.test.ts pins known and missing IDs. The old lookup remains as the explicit compatibility and rollback entry.`
})

registerInventoryClosureReviews('src/data/weapons.ts', [
  'getCustomEnchantmentCost',
  'getEnchantmentCost',
  'getEnchantmentEffects',
  'getOwnedEquipmentEnchantments',
  'getOwnedWeaponEnchantments',
  'getWeaponEnchantmentIds',
  'getWeaponEnchantments',
  'summarizeEnchantments'
], {
  classification: 'algorithm',
  targetRegistry: 'engine/domain/equipment',
  status: 'framework-retained',
  rationale: exportName => `${exportName} computes equipment-instance enchantment selection, aggregation, effects or pricing rather than defining taoyuan:enchantment content. Equipment domain/UI owns the behavior; enchantments.test.ts, inventory.test.ts and phase6InventoryClosure.test.ts preserve results. These helpers remain framework mechanics even when definitions come from registries.`
})

registerInventoryClosureReviews('src/data/weapons.ts', ['WeaponEnchantInput'], {
  classification: 'adapter',
  targetRegistry: 'engine/domain/equipment',
  status: 'framework-retained',
  rationale: exportName => `${exportName} is the TypeScript compatibility union for legacy single and modern multiple enchantment instance fields, not a content definition. Inventory and equipment code own it; phase6InventoryClosure.test.ts type-checks the exact union. Save compatibility requires retaining both shapes.`
})

registerInventoryClosureReviews('src/data/items.ts', [
  'CHEST_DEFS',
  'CHEST_TIER_ORDER',
  'getItemSource'
], {
  classification: 'ui',
  targetRegistry: 'engine/domain/inventory-presentation',
  status: 'framework-retained',
  rationale: exportName => `${exportName} controls chest progression/order or item-source presentation and is outside taoyuan:item catalog ownership. Inventory/GameLayout owns it; inventory and phase6InventoryClosure.test.ts preserve the compatibility behavior. It is finalized here because src/data/index.ts re-exports the source module.`
})

registerInventoryClosureReviews('src/data/mine.ts', [
  'BOSS_MONEY_REWARDS',
  'BOSS_ORE_REWARDS',
  'getAdjacentIndices',
  'getBombIndices',
  'getDarkFloorOres',
  'getEdgeIndices',
  'getFloorDistribution',
  'getRewardNames',
  'manhattanDistance',
  'MAX_MINE_FLOOR'
], {
  classification: 'algorithm',
  targetRegistry: 'engine/domain/mining',
  status: 'framework-retained',
  rationale: exportName => `${exportName} belongs to mine geometry, floor generation, progression or reward settlement rather than monster/monster-pool content. Mining domain/Store owns it; mining domain tests, gameDataValidation.test.ts and phase6InventoryClosure.test.ts preserve results. It is finalized here because src/data/index.ts re-exports the source module.`
})

registerInventoryClosureReviews('src/data/mine.ts', ['SkullCavernFloorDef'], {
  classification: 'adapter',
  targetRegistry: 'engine/domain/mining',
  status: 'framework-retained',
  rationale: exportName => `${exportName} is the runtime floor-generation shape for the unbounded skull cavern, not a content registry contract. Mining domain owns it; mining floor tests and phase6InventoryClosure.test.ts type-check the boundary. It is finalized because the compatibility barrel re-exports mine.ts.`
})

registerInventoryClosureReviews('src/data/shops.ts', ['ShopDef'], {
  classification: 'adapter',
  targetRegistry: 'taoyuan:shop',
  snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
  status: 'verified',
  rationale: exportName => `${exportName} is the legacy local-ID compatibility shape represented publicly by ShopDefSchema. shopRegistryPilot.test.ts proves the full taoyuan:shop projection and phase6InventoryClosure.test.ts keeps the old type usable. It remains exported for legacy callers and the data barrel.`
})

registerInventoryClosureReviews('src/data/shops.ts', [
  'getShopClosedReason',
  'isShopAvailable'
], {
  classification: 'algorithm',
  targetRegistry: 'engine/domain/shop-schedule',
  status: 'framework-retained',
  rationale: exportName => `${exportName} evaluates calendar, weather, season and hour rules over a ShopDef rather than owning shop content. ShopView owns the decision flow; shopRegistryPilot.test.ts and phase6InventoryClosure.test.ts preserve boundary results. It remains framework-owned even though definitions resolve through taoyuan:shop.`
})

registerInventoryClosureReviews('src/data/animals.ts', [
  'HAY_ITEM_ID',
  'NOURISHING_FEED_ID',
  'PREMIUM_FEED_ID',
  'VITALITY_FEED_ID'
], {
  classification: 'barrel',
  targetRegistry: 'taoyuan:animal_feed',
  status: 'verified',
  rationale: exportName => `${exportName} is an original-name compatibility re-export of the reviewed animalDefinitions stable ID and takes no new content ownership. animalFeedRegistryPilot.test.ts and phase6InventoryClosure.test.ts verify the source IDs; phase6BarrelInventory.test.ts verifies the re-export source and runtime barrel entry.`
})

registerInventoryClosureReviews('src/data/breeding.ts', [
  'HYBRID_DEFINITIONS',
  'HYBRID_TIER_COUNTS'
], {
  classification: 'barrel',
  targetRegistry: 'taoyuan:breeding_hybrid',
  status: 'verified',
  rationale: exportName => `${exportName} is an original-name compatibility re-export of the reviewed breedingDefinitions source and takes no new content ownership. breedingHybridRegistryPilot.test.ts proves all definitions and tier results against taoyuan:breeding_hybrid; phase6BarrelInventory.test.ts verifies the export target and runtime entry.`
})

registerInventoryClosureReviews('src/data/farmEvents.ts', [
  'MorningChoiceEvent',
  'MorningEasterEgg',
  'MorningEffect',
  'MorningNarration'
], {
  classification: 'barrel',
  targetRegistry: 'taoyuan:morning_event',
  status: 'verified',
  rationale: exportName => `${exportName} is a type-only compatibility re-export of the reviewed farmEventDefinitions legacy shape and takes no registry ownership. morningEventRegistryPilot.test.ts proves the TypeBox projection and runtime behavior; phase6BarrelInventory.test.ts verifies the source declaration and final source status.`
})

registerInventoryClosureReviews('src/data/fish.ts', ['FISHING_LOCATIONS'], {
  classification: 'barrel',
  targetRegistry: 'ui/fishing-location',
  status: 'framework-retained',
  rationale: exportName => `${exportName} is an original-name re-export of fishing location labels used by FishingView, not taoyuan:fish species content. phase6InventoryClosure.test.ts and phase6BarrelInventory.test.ts preserve the framework source and export path. Location presentation remains UI-owned until a complete fishing-location mechanism contract exists.`
})

for (const [file, exportName] of [
  ['src/data/hats.ts', 'BOSS_DROP_HATS'],
  ['src/data/rings.ts', 'BOSS_DROP_RINGS']
]) {
  registerInventoryClosureReviews(file, [exportName], {
    classification: 'barrel',
    targetRegistry: 'engine/domain/mining-boss-rewards',
    status: 'framework-retained',
    rationale: name => `${name} is an original-name re-export of the reviewed first-kill boss reward map and takes no content ownership. mining.test.ts and phase6InventoryClosure.test.ts verify settlement and exact mappings; phase6BarrelInventory.test.ts verifies the source and compatibility entry. Boss progression remains framework-owned.`
  })
}

const dataBarrelClosureReviews = {
  achievements: { status: 'verified', targetRegistry: 'taoyuan:achievement' },
  animals: { status: 'verified', targetRegistry: 'taoyuan:animal' },
  breeding: { status: 'verified', targetRegistry: 'taoyuan:breeding_hybrid' },
  buildings: { status: 'verified', targetRegistry: 'taoyuan:building_upgrade' },
  crops: { status: 'verified', targetRegistry: 'taoyuan:crop' },
  equipmentSets: { status: 'verified', targetRegistry: 'taoyuan:equipment_set' },
  events: { status: 'verified', targetRegistry: 'taoyuan:season_event' },
  farmMaps: { status: 'verified', targetRegistry: 'taoyuan:farm_map' },
  fish: { status: 'verified', targetRegistry: 'taoyuan:fish' },
  fishPond: { status: 'verified', targetRegistry: 'taoyuan:fish_pond_facility' },
  forage: { status: 'verified', targetRegistry: 'taoyuan:forage' },
  fruitTrees: { status: 'verified', targetRegistry: 'taoyuan:tree' },
  guild: { status: 'verified', targetRegistry: 'taoyuan:guild_goal' },
  hanhai: { status: 'verified', targetRegistry: 'taoyuan:hanhai_trade_exchange' },
  hats: { status: 'verified', targetRegistry: 'taoyuan:equipment' },
  heartEvents: { status: 'verified', targetRegistry: 'taoyuan:heart_event' },
  hiddenNpcHeartEvents: { status: 'verified', targetRegistry: 'taoyuan:heart_event' },
  hiddenNpcs: { status: 'verified', targetRegistry: 'taoyuan:hidden_npc' },
  items: { status: 'verified', targetRegistry: 'taoyuan:item' },
  market: { status: 'verified', targetRegistry: 'taoyuan:market_category' },
  mine: { status: 'verified', targetRegistry: 'taoyuan:monster_pool' },
  museum: { status: 'verified', targetRegistry: 'taoyuan:museum_item' },
  npcs: { status: 'verified', targetRegistry: 'taoyuan:npc' },
  npcTips: { status: 'framework-retained', targetRegistry: 'ui/npc-daily-tips' },
  pondBreeds: { status: 'verified', targetRegistry: 'taoyuan:pond_breed' },
  processing: { status: 'verified', targetRegistry: 'taoyuan:processing_machine' },
  quests: { status: 'verified', targetRegistry: 'taoyuan:quest_template' },
  recipes: { status: 'verified', targetRegistry: 'taoyuan:recipe' },
  rings: { status: 'verified', targetRegistry: 'taoyuan:equipment' },
  secretNotes: { status: 'verified', targetRegistry: 'taoyuan:secret_note' },
  shoes: { status: 'verified', targetRegistry: 'taoyuan:equipment' },
  shops: { status: 'verified', targetRegistry: 'taoyuan:shop' },
  specialItems: { status: 'verified', targetRegistry: 'taoyuan:item' },
  storyQuests: { status: 'verified', targetRegistry: 'taoyuan:story_quest' },
  themes: { status: 'framework-retained', targetRegistry: 'ui/player-settings' },
  timeConstants: { status: 'framework-retained', targetRegistry: 'engine/domain/time-navigation-schedules' },
  travelingMerchant: { status: 'verified', targetRegistry: 'taoyuan:shop_offer' },
  upgrades: { status: 'verified', targetRegistry: 'taoyuan:tool_upgrade' },
  weapons: { status: 'verified', targetRegistry: 'taoyuan:equipment' }
}

for (const [moduleName, review] of Object.entries(dataBarrelClosureReviews)) {
  registerInventoryClosureReviews('src/data/index.ts', [`* from ./${moduleName}`], {
    classification: 'barrel',
    targetRegistry: review.targetRegistry,
    status: review.status,
    rationale: exportName => review.status === 'verified'
      ? `${exportName} is a backward-compatible module barrel only and owns no registry entries. phase6BarrelInventory.test.ts independently verifies this exact source declaration, source-file existence, final source-symbol statuses, absence of a barrel import cycle and runtime const/function exports; the source module's registry tests remain authoritative.`
      : `${exportName} is a backward-compatible barrel for framework/UI-owned exports and owns no content entries. phase6BarrelInventory.test.ts independently verifies this exact source declaration, source-file existence, final source-symbol statuses, absence of a barrel import cycle and runtime const/function exports; the source module retains its explicit framework owner.`
  })
}

const reviewedArtifacts = [
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialMonsterDef',
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster',
    persistentIds: false,
    migrationPhase: [5],
    status: 'verified',
    rationale: 'Phase 5 query facade resolves both local and namespaced monster IDs to read-only registry MonsterDef entries.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialMonsterDefs',
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster',
    persistentIds: false,
    migrationPhase: [5],
    status: 'verified',
    rationale: 'Phase 5 query facade returns all deduplicated official monster definitions in stable registration order.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialMonsterById',
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster',
    persistentIds: false,
    migrationPhase: [5],
    status: 'verified',
    rationale: 'Phase 5 compatibility facade reconstructs the legacy MonsterDef shape and resolves ordered drops through each registry monster dropTableId.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'MonsterPoolDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:monster_pool',
    persistentIds: true,
    migrationPhase: [5],
    status: 'verified',
    rationale: 'TypeBox source of truth for non-empty ordered monster pools and optional positive integer weights.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'createOfficialMonsterPools',
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster_pool',
    persistentIds: true,
    migrationPhase: [5],
    status: 'verified',
    rationale: 'Projects six zone pools, six boss-floor pools and three skull cavern pools without sorting legacy members.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialMonsterPoolDef',
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster_pool',
    persistentIds: false,
    migrationPhase: [5],
    status: 'verified',
    rationale: 'Reads raw frozen monster pool definitions by local or namespaced ID.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'resolveOfficialMonsterPool',
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster_pool',
    persistentIds: false,
    migrationPhase: [5],
    status: 'verified',
    rationale: 'Resolves ordered pool entries to legacy monster shapes and expands weights without consuming randomness.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialMainMineZoneMonsters',
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster_pool',
    persistentIds: false,
    migrationPhase: [5],
    status: 'verified',
    rationale: 'Supplies registry-backed ordered candidates to all 120 main mine floors and display consumers.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialMainMineBoss',
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster_pool',
    persistentIds: false,
    migrationPhase: [5],
    status: 'verified',
    rationale: 'Resolves the six required boss-floor pools and rejects invalid multi-entry boss mappings.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialSkullCavernBaseMonsters/getOfficialSkullCavernDepthMonsters/getOfficialSkullCavernBosses',
    classification: 'adapter',
    targetRegistry: 'taoyuan:monster_pool',
    persistentIds: false,
    migrationPhase: [5],
    status: 'verified',
    rationale: 'Resolves the three skull cavern pools while thresholds, boss cadence, scaling and random selection remain framework-owned.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'TreeDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:tree',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for the strict fruit/wild discriminated union; generated tree.schema.json rejects mixed variants and invalid lifecycle values.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyFruitTree/adaptLegacyWildTree/createOfficialTrees',
    classification: 'adapter',
    targetRegistry: 'taoyuan:tree',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects the unique leaf definitions into eleven ordered official tree entries without changing local IDs, names, prices, seasons, lifecycle values or products.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialTreeDef/getOfficialTreeDefs/getOfficialFruitTreeDefs/getOfficialWildTreeDefs',
    classification: 'adapter',
    targetRegistry: 'taoyuan:tree',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry definitions by local or namespaced ID and preserves official fruit-then-wild registration order.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialFruitTreeById/getOfficialWildTreeById',
    classification: 'adapter',
    targetRegistry: 'taoyuan:tree',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Builds independent legacy compatibility objects for Store and composable consumers while preserving persisted local tree type IDs.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialFruitTreeBySaplingId/getOfficialTreeByProductItemId',
    classification: 'adapter',
    targetRegistry: 'taoyuan:tree',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Supplies ShopView sapling lookup and product lookup for fruit or tap output using local or namespaced item IDs.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'FishDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:fish',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for fish definitions; generated fish.schema.json accepts any-weather fish entries and rejects invalid availability, difficulty and tuning fields.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyFish/createOfficialFish',
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy fish entry into ordered official fish definitions without changing local IDs, names, prices, availability, difficulty or mini-game tuning.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialFishDef/getOfficialFishDefs/getOfficialFishDefsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry fish definitions by local or namespaced ID and reconstructs legacy FishDef objects for compatibility checks.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialFishById/getOfficialAvailableFish',
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Supplies local-ID compatibility lookups and season/weather/location availability results equivalent to the legacy getFishById() and getAvailableFish() behavior.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'ForageDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:forage',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for bamboo forest forage definitions; generated forage.schema.json rejects invalid item references, seasons, chance bounds and experience rewards.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyForage/createOfficialForage',
    classification: 'adapter',
    targetRegistry: 'taoyuan:forage',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy forage item into ordered official forage definitions without changing local item IDs, names, seasons, chance values or experience rewards.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialForageDef/getOfficialForageDefs/getOfficialForageItems',
    classification: 'adapter',
    targetRegistry: 'taoyuan:forage',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry forage definitions by local or namespaced ID and reconstructs legacy ForageItemDef objects for compatibility checks.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialForageItemsBySeason',
    classification: 'adapter',
    targetRegistry: 'taoyuan:forage',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Supplies the legacy getForageItems() seasonal filtering behavior through the official forage registry facade.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'AnimalDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:animal',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for animal species definitions; generated animal.schema.json rejects invalid building, cost, produceDays and friendship fields.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyAnimal/createOfficialAnimals',
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy animal species definition into ordered official animal entries without changing local IDs, names, costs, buildings, products or production cycles.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialAnimalDef/getOfficialAnimalDefs/getOfficialAnimalDefsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry animal definitions by local or namespaced ID and reconstructs legacy AnimalDef objects for compatibility checks.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialAnimalByType/getOfficialAnimalDefsByBuilding',
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Supplies local-ID compatibility lookups and building-filtered animal definitions to useAnimalStore and AnimalView.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'AnimalFeedDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:animal_feed',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for animal feed definitions; generated animal-feed.schema.json rejects invalid localized text and price fields.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyAnimalFeed/createOfficialAnimalFeeds',
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_feed',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy animal feed definition into ordered official entries without changing local IDs, display names, prices or descriptions.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialAnimalFeedDef/getOfficialAnimalFeedDefs/getOfficialAnimalFeedDefsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_feed',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry animal feed definitions by local or namespaced ID and reconstructs legacy AnimalFeedDef objects for compatibility checks.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialAnimalFeedById',
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_feed',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Supplies the legacy getFeedDef() local-ID compatibility lookup to AnimalView.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'AnimalBuildingDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for animal building and upgrade definitions; generated animal-building.schema.json rejects invalid building types, numeric bounds and material shapes.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyAnimalBuilding/createOfficialAnimalBuildings',
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects legacy coop, barn, stable and nested upgrades into ordered official entries without changing local building IDs, costs, capacities or material requirements.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialAnimalBuildingDef/getOfficialAnimalBuildingDefs/getOfficialAnimalBuildingDefsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry animal building definitions by local or namespaced ID and reconstructs legacy AnimalBuildingDef objects for compatibility checks.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialAnimalBuildingByType/getOfficialAnimalBuildingUpgrade',
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_building',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Supplies local-ID compatibility lookups for construction and upgrade flows in useAnimalStore and AnimalView.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'AnimalIncubationDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for animal incubation mappings; generated animal-incubation.schema.json rejects invalid item IDs, animal IDs, building types and day bounds.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyAnimalIncubation/createOfficialAnimalIncubations',
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects legacy egg-to-animal incubation mappings into ordered official entries without changing egg item IDs, hatched animal types, target buildings or incubation days.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialAnimalIncubationDef/getOfficialAnimalIncubationDefs/getOfficialAnimalIncubationDefsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry animal incubation definitions by local or namespaced ID and reconstructs legacy incubation definition objects for compatibility checks.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialAnimalIncubationByItemId/getOfficialAnimalIncubationMap',
    classification: 'adapter',
    targetRegistry: 'taoyuan:animal_incubation',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Supplies local egg item ID compatibility lookups and map shape for coop and barn incubation UI and Store flows.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'BreedingHybridDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:breeding_hybrid',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for breeding hybrid definitions, including stable hybrid IDs, parent crops, thresholds, result crop, base genetics and discovery text.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyBreedingHybrid/createOfficialBreedingHybrids',
    classification: 'adapter',
    targetRegistry: 'taoyuan:breeding_hybrid',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy hybrid definition into ordered official registry entries without changing local hybrid IDs, parent crop IDs, thresholds, result crop IDs, base genetics or discovery text.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialBreedingHybridDef/getOfficialBreedingHybridDefs/getOfficialBreedingHybridDefsAsLegacy/findOfficialBreedingHybridByParents/getOfficialBreedingHybridTier',
    classification: 'adapter',
    targetRegistry: 'taoyuan:breeding_hybrid',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen breeding hybrid registry definitions and reconstructs legacy HybridDef objects for ID lookup, parent matching and tier calculation consumers.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:breeding_hybrid',
    classification: 'adapter',
    targetRegistry: 'taoyuan:breeding_hybrid',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks breeding hybrid parent crop and result crop references against taoyuan:crop before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'ToolUpgradeDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:tool_upgrade',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for tool upgrade cost definitions; generated tool-upgrade.schema.json rejects invalid tool types, tiers, money and material shapes.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyToolUpgrade/createOfficialToolUpgrades',
    classification: 'adapter',
    targetRegistry: 'taoyuan:tool_upgrade',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy tool upgrade cost into ordered official entries without changing tool type fields, tier transitions, money costs or material requirements.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialToolUpgradeDef/getOfficialToolUpgradeDefs/getOfficialToolUpgradeCost/getOfficialToolUpgradeCosts',
    classification: 'adapter',
    targetRegistry: 'taoyuan:tool_upgrade',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry tool upgrade definitions by local or namespaced ID and reconstructs legacy ToolUpgradeCost objects for getUpgradeCost().'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:tool_upgrade',
    classification: 'adapter',
    targetRegistry: 'taoyuan:tool_upgrade',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks every tool upgrade material item reference against taoyuan:item and reports REG-REFERENCE-001 before the registry snapshot is accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'EquipmentDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for ring, hat, shoe and weapon equipment definitions in taoyuan:equipment; generated equipment.schema.json rejects invalid kind, effects, shop prices, weapon fields, recipe/material references and numeric bounds.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyRingEquipment/adaptLegacyHatEquipment/adaptLegacyShoeEquipment/adaptLegacyWeaponEquipment/createOfficialEquipment',
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy ring, hat, shoe and weapon definition into ordered official equipment entries without changing local IDs, effects, shop prices, recipes, weapon stats, materials, fixed enchantments, obtain-source text or sell prices.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialEquipmentDef/getOfficialEquipmentDefs/getOfficialRingById/getOfficialHatById/getOfficialShoeById/getOfficialWeaponById/getOfficialRingsAsLegacy/getOfficialHatsAsLegacy/getOfficialShoesAsLegacy/getOfficialWeaponsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry equipment definitions and reconstructs legacy RingDef, HatDef, ShoeDef and WeaponDef objects for getRingById(), getHatById(), getShoeById() and getWeaponById() compatibility.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:equipment',
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks equipment item IDs, wearable recipe material references, weapon shop material references and weapon fixed enchantment references before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'EquipmentSetDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:equipment_set',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for equipment set definitions, including piece references, bonus thresholds and supported equipment effects.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyEquipmentSet/createOfficialEquipmentSets',
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment_set',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy equipment set into ordered official entries without changing set IDs, names, piece references, bonus descriptions or effects.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialEquipmentSetDef/getOfficialEquipmentSetDefs/getOfficialEquipmentSetsAsLegacy/getOfficialEquipmentSetByPieceId',
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment_set',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry equipment set definitions and reconstructs legacy EquipmentSetDef objects for inventory set bonuses and old piece lookup.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:equipment_set',
    classification: 'adapter',
    targetRegistry: 'taoyuan:equipment_set',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks every equipment set piece reference against taoyuan:item and reports REG-REFERENCE-001 before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'PondableFishDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:pondable_fish',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for fish pond species definitions; generated pondable-fish.schema.json rejects invalid item references, maturity days, production rates and genetics bounds.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyPondableFish/createOfficialPondableFish',
    classification: 'adapter',
    targetRegistry: 'taoyuan:pondable_fish',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy pondable fish definition into ordered official entries without changing local IDs, display names, maturity days, production rates, products or default genetics.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialPondableFishDef/getOfficialPondableFishDefs/getOfficialPondableFishDefsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:pondable_fish',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry pondable fish definitions by local or namespaced ID and reconstructs legacy PondableFishDef objects for compatibility checks.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialPondableFishById',
    classification: 'adapter',
    targetRegistry: 'taoyuan:pondable_fish',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Supplies the legacy getPondableFish() local-ID compatibility lookup to useFishPondStore and FishPondView.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'PondBreedDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for fish pond breed definitions; generated pond-breed.schema.json rejects invalid generation values and parent reference shapes.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyPondBreed/createOfficialPondBreeds',
    classification: 'adapter',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects all 400 generated legacy pond breeds into ordered official entries without changing IDs, names, generations, base fish links or parent pairs.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialPondBreedDef/getOfficialPondBreedDefs/getOfficialPondBreedDefsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry pond breed definitions by local or namespaced ID and reconstructs legacy PondBreedDef objects for compatibility checks.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialPondBreedById/getOfficialPondBreedsByGeneration/getOfficialPondBreedsBySpecies/getOfficialGen1PondBreedsForFish/findOfficialPondBreedByParents',
    classification: 'adapter',
    targetRegistry: 'taoyuan:pond_breed',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Supplies local-ID compatibility lookups, generation/species filters, Gen1 admission candidates and order-insensitive parent-pair lookup to useFishPondStore.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'FishPondFacilityDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for fish pond build cost, upgrade cost, level capacity and unlimited-at-level definitions.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyFishPondFacility/createOfficialFishPondFacilities',
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects the legacy fish pond facility definition into an official registry entry without changing money costs, material costs, level capacities or unlimited level semantics.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialFishPondFacilityDef/getOfficialFishPondFacilityDefs/getOfficialFishPondFacilitiesAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry fish pond facility definitions by local or namespaced ID and reconstructs legacy compatibility objects for equivalence checks.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialFishPondFacilityById',
    classification: 'adapter',
    targetRegistry: 'taoyuan:fish_pond_facility',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Supplies the local-ID compatibility lookup used by fish pond construction, upgrade and capacity facades.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'BuildingUpgradeDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for farmhouse, cave and cellar upgrade definitions, including materials, cave pools and cellar capacity fields.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyFarmhouseUpgrade/adaptLegacyCaveUpgrade/adaptLegacyCellarUpgrade/createOfficialBuildingUpgrades',
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects legacy farmhouse, cave and cellar upgrade definitions into official registry entries without changing order, IDs, costs, materials, pools or runtime values.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialBuildingUpgradeDefs/getOfficialFarmhouseUpgrade/getOfficialCaveUpgrade/getOfficialCellarUpgrade',
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry building upgrade definitions and reconstructs legacy farmhouse, cave and cellar compatibility objects for HomeStore and UI consumers.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:building_upgrade',
    classification: 'adapter',
    targetRegistry: 'taoyuan:building_upgrade',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks building upgrade material references plus cave mushroom and fruit pool item references before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'WalletItemDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:wallet_item',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for wallet item definitions, including display text, passive effect descriptor and unlock condition text.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyWalletItem/createOfficialWalletItems',
    classification: 'adapter',
    targetRegistry: 'taoyuan:wallet_item',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects legacy wallet item definitions into official registry entries without changing IDs, names, descriptions, effects or unlock condition text.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialWalletItemDef/getOfficialWalletItemById/getOfficialWalletItemsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:wallet_item',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry wallet item definitions and reconstructs legacy WalletItemDef compatibility objects for Store and UI consumers.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'GuildGoalDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:guild_goal',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for guild monster goals, including monster references, zones, kill targets, money rewards, item rewards and descriptions.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'GuildDonationDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:guild_donation',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for guild donation point definitions, including item references and positive point values.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'GuildLevelDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:guild_level',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for guild level experience thresholds; generated guild-level.schema.json rejects invalid levels and negative thresholds.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyGuildGoal/createOfficialGuildGoals',
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_goal',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy monster goal into ordered official entries without changing monster IDs, displayed names, zones, kill targets, rewards or descriptions.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyGuildDonation/createOfficialGuildDonations',
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_donation',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy guild donation definition into ordered official entries without changing item IDs or contribution point values.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyGuildLevel/createOfficialGuildLevels',
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_level',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy guild level threshold into ordered official entries without changing level numbers or required experience.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialGuildGoalDef/getOfficialGuildGoalDefs/getOfficialGuildGoalByMonsterId/getOfficialGuildGoalsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_goal',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry guild goal definitions and reconstructs legacy MonsterGoalDef objects for Store and GuildView consumers.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialGuildDonationDef/getOfficialGuildDonationDefs/getOfficialGuildDonationByItemId/getOfficialGuildDonationsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_donation',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry guild donation definitions and reconstructs legacy GuildDonationDef objects for donation UI and Store flows.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialGuildLevelDef/getOfficialGuildLevelDefs/getOfficialGuildLevelByLevel/getOfficialGuildLevelsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_level',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry guild level definitions and reconstructs legacy GuildLevelDef objects for level-up threshold checks.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:guild_goal',
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_goal',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks guild goal monster references against taoyuan:monster and reward item references against taoyuan:item before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:guild_donation',
    classification: 'adapter',
    targetRegistry: 'taoyuan:guild_donation',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks guild donation item references against taoyuan:item before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'NpcDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:npc',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for village NPC definitions, including localized display text, gift preferences, dialogues, birthdays and heart event ContentId reference lists.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyNpc/createOfficialNpcs',
    classification: 'adapter',
    targetRegistry: 'taoyuan:npc',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy village NPC into ordered official entries without changing local NPC IDs, names, roles, gift preferences, dialogues, marriage flags or birthdays; legacy event ID strings are normalized to taoyuan:heart_event references inside the registry.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialNpcDef/getOfficialNpcDefs/getOfficialNpcById/getOfficialNpcsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:npc',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry NPC definitions and reconstructs legacy NpcDef objects for Store, calendar and NPC view consumers.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:npc',
    classification: 'adapter',
    targetRegistry: 'taoyuan:npc',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks NPC loved, liked and hated item references against taoyuan:item and validates heartEventIds/zhijiHeartEventIds against taoyuan:heart_event.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'HeartEventDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for ordinary and hidden NPC heart event definitions, including owner ContentId, threshold, zhiji gate, localized title, scene text and choices.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyHeartEvent/createOfficialHeartEvents/createOfficialHiddenNpcHeartEvents',
    classification: 'adapter',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects ordinary and hidden legacy heart events into one ordered heart_event registry while preserving local event IDs, owner IDs, thresholds, zhiji flags, titles, scene text and choice friendship changes.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialHeartEventDef/getOfficialHeartEventDefs/getOfficialHeartEventById/getOfficialHeartEventsForNpc',
    classification: 'adapter',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry heart event definitions and reconstructs ordinary legacy HeartEventDef objects for NPC Store and NPC view consumers.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialHiddenNpcHeartEventById/getOfficialHiddenNpcHeartEvents',
    classification: 'adapter',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Reconstructs hidden NPC legacy HeartEventDef objects from hidden-owner taoyuan:heart_event entries for hidden NPC modal and Store consumers.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:heart_event',
    classification: 'adapter',
    targetRegistry: 'taoyuan:heart_event',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks each heart event owner reference against taoyuan:npc or taoyuan:hidden_npc and rejects missing event declarations before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'HiddenNpcDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:hidden_npc',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for hidden NPC definitions, including discovery conditions, scenes, offerings, affinity abilities, bond costs and manifestation days.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyHiddenNpc/createOfficialHiddenNpcs',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hidden_npc',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy hidden NPC into ordered official entries without changing local hidden NPC IDs, discovery chains, offerings, bond thresholds, ability IDs or reward semantics.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialHiddenNpcDef/getOfficialHiddenNpcDefs/getOfficialHiddenNpcById/getOfficialHiddenNpcsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hidden_npc',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry hidden NPC definitions and reconstructs legacy HiddenNpcDef objects for hidden NPC Store, dialogs and NPC UI consumers.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:hidden_npc',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hidden_npc',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks hidden NPC offering, crafting, discovery item, village NPC, story quest, fish and heart-event references before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'StoryQuestDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for story quest definitions, including stable chapter/order, localized objective text, objective variants and rewards.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyStoryQuest/createOfficialStoryQuests',
    classification: 'adapter',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy main story quest into ordered official entries without changing quest IDs, chapter/order, owner NPC, objective semantics or rewards.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialStoryQuestDef/getOfficialStoryQuestDefs/getOfficialStoryQuestById/getOfficialStoryQuestsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry story quest definitions and reconstructs legacy MainQuestDef objects for quest store and quest view consumers.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:story_quest',
    classification: 'adapter',
    targetRegistry: 'taoyuan:story_quest',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks story quest owner NPC, deliver-item objectives, NPC friendship objectives and reward references before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'AchievementDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:achievement',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for achievement definitions, including stable achievement IDs, localized text, condition variants and reward items.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'CommunityBundleDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:community_bundle',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for community bundle definitions, including required item lists, localized text and reward descriptions.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyAchievement/createOfficialAchievements',
    classification: 'adapter',
    targetRegistry: 'taoyuan:achievement',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy achievement into ordered official entries without changing local progress IDs, displayed text, condition thresholds or rewards.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyCommunityBundle/createOfficialCommunityBundles',
    classification: 'adapter',
    targetRegistry: 'taoyuan:community_bundle',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy community bundle into ordered official entries without changing bundle IDs, required items, reward text or rewards.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialAchievementDef/getOfficialAchievementDefs/getOfficialAchievementById/getOfficialAchievementsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:achievement',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry achievement definitions and reconstructs legacy AchievementDef objects for Store and AchievementView consumers.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialCommunityBundleDef/getOfficialCommunityBundleDefs/getOfficialCommunityBundleById/getOfficialCommunityBundlesAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:community_bundle',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry community bundle definitions and reconstructs legacy CommunityBundleDef objects for bundle submission flows.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:achievement',
    classification: 'adapter',
    targetRegistry: 'taoyuan:achievement',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks itemDiscovered condition item references and achievement reward item references against taoyuan:item before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:community_bundle',
    classification: 'adapter',
    targetRegistry: 'taoyuan:community_bundle',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks community bundle required item and reward item references against taoyuan:item before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'SecretNoteDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:secret_note',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for secret note definitions, including numeric note IDs, type, localized title/content, usability and optional treasure rewards.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacySecretNote/createOfficialSecretNotes',
    classification: 'adapter',
    targetRegistry: 'taoyuan:secret_note',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects legacy secret notes into official registry entries without changing order, numeric IDs, titles, content, usability or reward semantics.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialSecretNoteDef/getOfficialSecretNoteById/getOfficialSecretNotesAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:secret_note',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry secret notes and reconstructs legacy numeric-ID SecretNoteDef objects for collection, reward and UI consumers.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:secret_note',
    classification: 'adapter',
    targetRegistry: 'taoyuan:secret_note',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks secret note reward item references before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'TutorialDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:tutorial',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for morning tutorial tips, including stable tip IDs, priorities, engine-supported condition keys and localized messages.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyMorningTip/createOfficialTutorials',
    classification: 'adapter',
    targetRegistry: 'taoyuan:tutorial',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects legacy morning tips into official registry entries without changing order, priority, condition keys or displayed messages.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialTutorialDef/getOfficialTutorialById/getOfficialMorningTipsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:tutorial',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry tutorial definitions and reconstructs legacy MorningTipDef objects for end-day tutorial consumers.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'MorningEventDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for morning random event definitions, including narration, choice and easter egg variants plus engine-supported effects.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyMorningNarration/adaptLegacyMorningChoiceEvent/adaptLegacyMorningEasterEgg/createOfficialMorningEvents',
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy morning narration, choice event and easter egg into ordered official entries without changing local IDs, text, choices or effect payloads.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialMorningEventDef/getOfficialMorningEventDefs/getOfficialMorningNarrationsAsLegacy/getOfficialMorningChoiceEventsAsLegacy/getOfficialMorningEasterEggsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen morning event registry definitions and reconstructs legacy arrays for end-day random event consumers while preserving local item IDs in effects.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:morning_event',
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks gainItem effect references in morning narration, choice and easter egg entries against taoyuan:item before registry snapshots are accepted.'
  },
  {
    file: 'src/composables/useEndDay.ts',
    exportName: 'handleEndDay:morning_event',
    classification: 'adapter',
    targetRegistry: 'taoyuan:morning_event',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Wires morning random event processing through registry-backed compatibility getters while preserving event probabilities, random call order and Store side effects.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'SeasonEventDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:season_event',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for season festival events, including stable event IDs, dates, effects, narrative text and supported interactive festival types.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacySeasonEvent/createOfficialSeasonEvents',
    classification: 'adapter',
    targetRegistry: 'taoyuan:season_event',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy season event into official registry entries without changing IDs, dates, rewards, narrative order or interactive festival metadata.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialSeasonEventDef/getOfficialSeasonEventById/getOfficialSeasonEventsAsLegacy/getOfficialTodaySeasonEvent',
    classification: 'adapter',
    targetRegistry: 'taoyuan:season_event',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen season event definitions and reconstructs legacy SeasonEventDef objects for end-day event and Cottage calendar consumers.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:season_event',
    classification: 'adapter',
    targetRegistry: 'taoyuan:season_event',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks season event item reward references against taoyuan:item before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'QuestTemplateDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:quest_template',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for board quest and special-order template definitions, including targets, NPC pools, rewards, seasons and tier metadata.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyQuestTemplate/adaptLegacySpecialOrderTemplate/createOfficialQuestTemplates',
    classification: 'adapter',
    targetRegistry: 'taoyuan:quest_template',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy board quest and special-order template into official registry entries without changing local target IDs, NPC pools, quantities, rewards, seasons or tier ordering.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialQuestTemplateDef/getOfficialQuestTemplateDefs/getOfficialQuestTemplatesAsLegacy/getOfficialSpecialOrderTemplatesAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:quest_template',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen quest template registry definitions and reconstructs legacy board quest and special-order template objects for Quest Store generation consumers.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:quest_template',
    classification: 'adapter',
    targetRegistry: 'taoyuan:quest_template',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks board quest target items, board NPC pools, special-order target items, item rewards and owner NPC references before registry snapshots are accepted.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'FarmMapDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:farm_map',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for opening farm map definitions, including map type, display name, description and bonus text.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptLegacyFarmMap/createOfficialFarmMaps',
    classification: 'adapter',
    targetRegistry: 'taoyuan:farm_map',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects legacy farm map definitions into official registry entries without changing type IDs, names, descriptions, bonus text or order.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialFarmMapDef/getOfficialFarmMapByType/getOfficialFarmMapsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:farm_map',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry farm map definitions and reconstructs legacy FarmMapDef compatibility objects for the MainMenu new-game flow.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'createOfficialShopOffers:traveling_merchant',
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy traveling merchant product into ordered shop_offer entries without changing item IDs, names, base prices or display grouping.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialTravelingMerchantOffers/getOfficialTravelingMerchantPoolAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns registry-backed traveling merchant shop offers and reconstructs the legacy TravelingMerchantItem pool for stock generation and hidden NPC bonus consumers.'
  },
  {
    file: 'src/stores/useShopStore.ts',
    exportName: 'refreshMerchantStock:traveling_merchant',
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Uses the registry-backed traveling merchant pool for the hidden NPC bonus item while preserving existing stock key, save shape, random choice and purchase flow.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'createOfficialShopOffers:hanhai_shop',
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy Hanhai fixed and rotating inn product into ordered shop_offer entries without changing item IDs, names, descriptions, prices, weekly limits or display grouping.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialHanhaiFixedShopItems/getOfficialHanhaiRotatingPoolAsLegacy/getOfficialHanhaiWeeklyRotatingItems',
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns registry-backed Hanhai inn shop offers as legacy HanhaiShopItemDef objects and preserves the deterministic weekly rotating stock algorithm.'
  },
  {
    file: 'src/stores/useHanhaiStore.ts',
    exportName: 'buyShopItem/refreshRotatingStock:hanhai_shop_offer',
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Uses the registry-backed Hanhai fixed and rotating shop lists while preserving money deduction, weekly purchase counters, inventory add rollback and old save fields.'
  },
  {
    file: 'src/views/game/HanhaiView.vue',
    exportName: 'hanhaiFixedItems:hanhai_shop_offer',
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Renders the Hanhai fixed shop list from the registry-backed compatibility list without changing order, text, limit display or click flow.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'MarketCategoryDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for market category definitions, including localized name, four seasonal coefficients and supply thresholds.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptMarketCategory/createOfficialMarketCategories',
    classification: 'adapter',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy market category into ordered official entries without changing names, seasonal coefficients or supply thresholds.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialMarketCategoryDef/getOfficialMarketCategoryDefs/getOfficialMarketCategoriesAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry market category definitions and reconstructs the legacy ordered category list for market calculations.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialMarketCategoryName/getOfficialMarketCategoryNamesAsLegacy/getOfficialMarketSeasonCoefficients/getOfficialMarketSupplyThresholds',
    classification: 'adapter',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Supplies registry-backed market names, defensive coefficient copies and defensive threshold copies to legacy market APIs.'
  },
  {
    file: 'src/data/market.ts',
    exportName: 'getDailyMarketInfo/getMarketMultiplier/getMarketCategoryName',
    classification: 'adapter',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Wires existing market API signatures through registry-backed category definitions while preserving multiplier, trend and unknown-category behavior.'
  },
  {
    file: 'src/composables/useEndDay.ts',
    exportName: 'handleEndDay:market_category',
    classification: 'adapter',
    targetRegistry: 'taoyuan:market_category',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'End-day market logs resolve category names through the registry-backed getter without changing weather, market log order or Store side effects.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'HanhaiTradeExchangeDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_trade_exchange',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for Hanhai trade point exchange definitions, including localized text, point costs, limits, wallet flag and equipment type marker.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptHanhaiTradeExchange/createOfficialHanhaiTradeExchangeItems',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_trade_exchange',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy Hanhai exchange item into official registry entries without changing item IDs, names, descriptions, point costs, weekly limits, total limits or special flags.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialHanhaiTradeExchangeDef/getOfficialHanhaiTradeExchangeDefs/getOfficialHanhaiTradeExchangeItemsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_trade_exchange',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry exchange definitions and reconstructs legacy TradeExchangeItemDef objects for Hanhai UI and Store consumers.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:hanhai_trade_exchange',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_trade_exchange',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks Hanhai exchange item references against taoyuan:item or taoyuan:wallet_item before registry snapshots are accepted.'
  },
  {
    file: 'src/stores/useHanhaiStore.ts',
    exportName: 'exchangeItem:hanhai_trade_exchange',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_trade_exchange',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Uses the registry-backed Hanhai exchange item lookup while preserving point deduction, weekly and total purchase counters, spice bundle behavior, wallet unlocks and old save fields.'
  },
  {
    file: 'src/views/game/HanhaiView.vue',
    exportName: 'tradeExchangeItems:hanhai_trade_exchange',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_trade_exchange',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Renders the Hanhai exchange list from the registry-backed compatibility list without changing order, text, limit display or click flow.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'HanhaiTradeShopUpgradeDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_trade_shop_upgrade',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for Hanhai trade shop upgrade definitions, including localized name, level, slot count, sell days, money cost and item material costs.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptHanhaiTradeShopUpgrade/createOfficialHanhaiTradeShopUpgrades',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_trade_shop_upgrade',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy Hanhai trade shop upgrade into official registry entries without changing levels, names, slot counts, sell days, costs or material requirements.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialHanhaiTradeShopUpgradeDef/getOfficialHanhaiTradeShopUpgradeDefs/getOfficialHanhaiTradeShopUpgradesAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_trade_shop_upgrade',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry trade shop upgrade definitions and reconstructs legacy TradeShopUpgradeDef objects for Hanhai Store consumers.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:hanhai_trade_shop_upgrade',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_trade_shop_upgrade',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks Hanhai trade shop upgrade material references against taoyuan:item before registry snapshots are accepted.'
  },
  {
    file: 'src/stores/useHanhaiStore.ts',
    exportName: 'tradeShopConfig/nextTradeShopUpgrade:hanhai_trade_shop_upgrade',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_trade_shop_upgrade',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Uses registry-backed Hanhai trade shop upgrade definitions while preserving tradeShopLevel, slot limits, sell days, money and material deduction, logs and old save fields.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'HanhaiTreasureRewardDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_treasure_reward',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for Hanhai treasure map reward tiers, including roll threshold, money reward and localized item rewards.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptHanhaiTreasureReward/createOfficialHanhaiTreasureRewards',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_treasure_reward',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects every legacy Hanhai treasure map reward tier into official registry entries without changing thresholds, money amounts, item IDs, display names, quantities or order.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialHanhaiTreasureRewardDef/getOfficialHanhaiTreasureRewardDefs/getOfficialHanhaiTreasureRewardsAsLegacy/getOfficialHanhaiTreasureRewardForRoll',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_treasure_reward',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry treasure reward definitions, reconstructs legacy HanhaiTreasureRewardDef objects and preserves the first-threshold match used by treasure map rewards.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:hanhai_treasure_reward',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_treasure_reward',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks Hanhai treasure reward item references against taoyuan:item before registry snapshots are accepted.'
  },
  {
    file: 'src/stores/useHanhaiStore.ts',
    exportName: 'useTreasureMap:hanhai_treasure_reward',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_treasure_reward',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Uses registry-backed Hanhai treasure reward tiers while preserving map consumption, one Math.random() roll, reward text, money grant, item grants, logs and old save fields.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'HanhaiRouletteDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for Hanhai lucky roulette fixed config, including localized outcome labels, multipliers, chance weights and bet tiers.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptHanhaiRoulette/createOfficialHanhaiRoulettes',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects the legacy Hanhai lucky roulette outcome order and bet tiers into official registry entries without changing labels, multipliers, chances or tier order.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialHanhaiRouletteDef/getOfficialHanhaiRouletteDefs/getOfficialHanhaiRouletteAsLegacy/getOfficialHanhaiRouletteOutcomes/getOfficialHanhaiRouletteBetTiers',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen registry roulette config, reconstructs legacy outcome and bet tier arrays, and accepts local, prefixed or namespaced IDs.'
  },
  {
    file: 'src/domain/mods/semanticValidation.ts',
    exportName: 'validateRegistrySemantics:hanhai_roulette',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Checks Hanhai roulette chance totals and duplicate bet tiers before registry snapshots are accepted.'
  },
  {
    file: 'src/stores/useHanhaiStore.ts',
    exportName: 'playRoulette:hanhai_roulette',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Uses registry-backed lucky roulette bet tiers and outcomes while preserving bet validation, money deduction, one Math.random() spin, payouts, logs and old save fields.'
  },
  {
    file: 'src/views/game/HanhaiView.vue',
    exportName: 'rouletteBetTiers/rouletteOutcomes:hanhai_roulette',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_roulette',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Renders lucky roulette buttons and animation outcomes from registry-backed compatibility arrays without changing UI text, order or animation flow.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'HanhaiCasinoWagerDefSchema',
    classification: 'content',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'TypeBox source of truth for Hanhai dice and cup fixed wager definitions, including bet amounts and win multipliers.'
  },
  {
    file: 'src/domain/mods/staticAdapters.ts',
    exportName: 'adaptHanhaiCasinoWager/createOfficialHanhaiCasinoWagers',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: true,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects the legacy dice and cup bet amounts and win multipliers into official registry entries without changing casino minigame algorithms.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialHanhaiCasinoWagerDef/getOfficialHanhaiCasinoWagerDefs/getOfficialHanhaiCasinoWager/getOfficialHanhaiCasinoBetAmount/getOfficialHanhaiCasinoWinMultiplier',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns frozen casino wager definitions, reconstructs legacy local-ID wager objects, and accepts local, prefixed or namespaced IDs.'
  },
  {
    file: 'src/stores/useHanhaiStore.ts',
    exportName: 'playDice/playCup:hanhai_casino_wager',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Uses registry-backed dice and cup wager values while preserving spend/earn flow, random call counts, daily bet counter, logs and old save fields.'
  },
  {
    file: 'src/views/game/HanhaiView.vue',
    exportName: 'diceBetAmount/cupBetAmount:hanhai_casino_wager',
    classification: 'adapter',
    targetRegistry: 'taoyuan:hanhai_casino_wager',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Renders dice and cup wager text, disabled states and result deductions from registry-backed values without changing the modal flow.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialBombById/getOfficialBombsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:bomb',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Returns legacy-shaped bomb definitions directly from the published registry, preserving official order, local IDs, unknown-ID behavior and explicit failure before publication.'
  },
  {
    file: 'src/stores/useProcessingStore.ts',
    exportName: 'craftBomb:taoyuan:bomb',
    classification: 'adapter',
    targetRegistry: 'taoyuan:bomb',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Resolves the requested bomb through the official registry while preserving the craftBomb signature, material and money deduction, local inventory ID and unknown-ID result.'
  },
  {
    file: 'src/views/game/MiningView.vue',
    exportName: 'availableBombs:taoyuan:bomb',
    classification: 'adapter',
    targetRegistry: 'taoyuan:bomb',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Builds the mine action list from the ordered registry-backed legacy projection while preserving names, inventory counts and bomb selection behavior.'
  },
  {
    file: 'src/views/game/ProcessingView.vue',
    exportName: 'bombCraftItems/handleCraftBomb:taoyuan:bomb',
    classification: 'adapter',
    targetRegistry: 'taoyuan:bomb',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Builds bomb craft entries and completion text from the ordered registry-backed legacy projection without changing recipes, recipe-item gating, costs or displayed names.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialGuildShopOffers/getOfficialGuildShopItemsAsLegacy/getOfficialGuildShopItemById',
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Projects the published guild shop offers back to the complete legacy GuildShopItemDef shape while preserving order, local item IDs, currencies, unlock levels, limits, materials and equipment purchase kinds.'
  },
  {
    file: 'src/stores/useGuildStore.ts + src/views/game/GuildView.vue',
    exportName: 'guild-shop-consumers:taoyuan:shop_offer',
    classification: 'adapter',
    targetRegistry: 'taoyuan:shop_offer',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Routes both guild purchase settlement and the ordered shop display through published offers while preserving money, contribution points, materials, equipment grants, all limit counters, rollback and old save fields.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'getOfficialItemsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:item',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Reconstructs the exact ordered legacy ItemDef catalog from the published item registry, preserving every local ID, display field, category, price and optional recovery field.'
  },
  {
    file: 'src/stores/useAchievementStore.ts + src/views/game/AchievementView.vue',
    exportName: 'achievement-item-catalog-consumers:taoyuan:item',
    classification: 'adapter',
    targetRegistry: 'taoyuan:item',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Uses the registry-backed legacy item catalog for collection categories, virtualized display, full shipment, shipping groups and perfection denominators without changing progress IDs or save data.'
  },
  {
    file: 'src/domain/mods/contentAccess.ts',
    exportName: 'LegacyEquipmentDrop/getOfficialEquipmentDropPoolsAsLegacy',
    classification: 'adapter',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Reconstructs ordered local-ID equipment drop pools by source, kind and zone from published named drop tables, rejecting quantities that the legacy one-item settlement cannot represent.'
  },
  {
    file: 'src/stores/useMiningStore.ts',
    exportName: 'applyTreasureGearDropsForZone:taoyuan:drop_table',
    classification: 'adapter',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Reads ring, hat, shoe and weapon treasure pools from the published registry before Store initialization while preserving zone order, chance rolls, enchantments, grants, duplicate auto-sales and treasure messages.'
  },
  {
    file: 'src/stores/useMiningStore.ts',
    exportName: 'applyMonsterGearDropsForZone:taoyuan:drop_table',
    classification: 'adapter',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Reads all four monster equipment pools from published named drop tables before Store initialization while preserving six-zone order, exact chance boundaries and random calls, random weapon enchantments, grants, duplicate auto-sales and messages.'
  },
  {
    file: 'src/views/game/GuildView.vue',
    exportName: 'getEquipDrops:taoyuan:drop_table',
    classification: 'adapter',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Renders all four monster equipment pool projections from the published registry while preserving zone association, kind and entry order, equipment names, rounded chances, boss rewards and empty bestiary states.'
  },
  {
    file: 'src/domain/mods/officialContentBootstrap.ts',
    exportName: 'bootstrapOfficialContent/getOfficialRegistrySet/getOfficialContentBootstrapReport/createOfficialContentBootstrap/validateOfficialRegistryStructure',
    classification: 'adapter',
    targetRegistry: 'engine/lifecycle/official-content-bootstrap',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Restores the bound official precompile when valid or performs one complete static fallback, then validates structure and semantics, freezes the candidate and atomically publishes one stable registry set with a diagnostic report.'
  },
  {
    file: 'src/bootstrap.ts',
    exportName: 'bootstrapApplication/reportApplicationStartupFailure',
    classification: 'adapter',
    targetRegistry: 'engine/lifecycle/official-content-bootstrap',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Creates Vue, Pinia and the router only after taoyuan-core succeeds; failures render a minimal state without mounting the game or reading saves.'
  },
  {
    file: 'src/main.ts',
    exportName: 'shared-renderer-startup-gate',
    classification: 'adapter',
    targetRegistry: 'engine/lifecycle/official-content-bootstrap',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Web, Electron and Android share this renderer entry; App.vue and the router are dynamically imported only after official content initialization.'
  },
  {
    file: 'src/domain/mods/registry.ts',
    exportName: 'Registry.freeze/RegistrySet.freezeEntries',
    classification: 'adapter',
    targetRegistry: 'engine/lifecycle/official-content-bootstrap',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Deep-freezes entries, sources and registry records so published official content cannot be added to or replaced after startup.'
  },
  {
    file: 'electron/main.js + electron/preload.js',
    exportName: 'startup-failure-diagnostic-channel',
    classification: 'adapter',
    targetRegistry: 'engine/lifecycle/official-content-bootstrap',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Uses a bounded one-way preload IPC channel to record fatal renderer startup details in userdata/startup.log even when production console calls are removed.'
  },
  {
    file: 'src/domain/mods/environmentHash.ts',
    exportName: 'normalizeCacheEnvironmentIdentity/createEnvironmentHash',
    classification: 'adapter',
    targetRegistry: 'engine/cache/environment-hash',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Validates unknown cache identities through the TypeBox contract, normalizes package and dependency order by Unicode code point, rejects duplicate identities and hashes only stable environment inputs.'
  },
  {
    file: 'src/domain/mods/precompiledRegistrySchema.ts',
    exportName: 'CacheEnvironmentIdentitySchema/OfficialPrecompiledRegistryArtifactSchema/OfficialPrecompiledRegistryMetadataSchema',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-precompiled-registry',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Provides the TypeBox sources of truth for the cache environment, versioned official precompiled artifact and generated metadata contracts.'
  },
  {
    file: 'src/domain/mods/officialPrecompiled.ts',
    exportName: 'createOfficialPrecompiledRegistryArtifact/parseOfficialPrecompiledRegistryArtifact/restoreOfficialPrecompiledRegistryArtifact/createExpectedOfficialEnvironmentHash',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-precompiled-registry',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Builds and restores the formatVersion 2 official snapshot envelope after pure-JSON, TypeBox, content hash, environment hash, snapshot hash and registry-set validation.'
  },
  {
    file: 'src/domain/mods/officialPrecompiledRuntime.ts',
    exportName: 'loadBundledOfficialPrecompiledArtifact/restoreBundledOfficialPrecompiledArtifact',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-precompiled-registry',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Loads the committed artifact as raw JSON and binds restoration to metadata-derived expectations for the current official environment.'
  },
  {
    file: 'scripts/official-precompiled.mjs',
    exportName: 'mod:precompile/mod:check-precompile/mod:probe-hashes',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-precompiled-registry',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Deterministically generates the official artifact and metadata, validates restoration equivalence, checks committed bytes and reports platform hash evidence.'
  },
  {
    file: 'src/generated/mods/official-precompiled-registry.json + src/generated/mods/official-precompiled-metadata.json',
    exportName: 'official-precompiled-artifacts',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-precompiled-registry',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Commits the reproducible 54-registry, 4242-entry formatVersion 2 snapshot and its environment-bound metadata; generated-file checks reject drift.'
  },
  {
    file: '.github/workflows/mod-precompile-determinism.yml',
    exportName: 'windows-linux-macos-precompile-probe',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-precompiled-registry',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Runs the same byte-for-byte committed-artifact check and hash probe on Windows, Linux and macOS without platform-specific expected hashes.'
  },
  {
    file: 'src/domain/mods/officialContentRuntimeReport.ts + src/runtime/contentRuntimeProbe.ts + src/main.ts',
    exportName: 'createOfficialContentRuntimeReport/publishContentRuntimeProbe',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-precompiled-registry',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Recomputes the five official content hashes from the published frozen registry set and exposes a bounded, opt-in production report with registry order, counts and public item, recipe and crop query checks.'
  },
  {
    file: 'scripts/probe-product-runtime.mjs + scripts/runtime-probe-web-host.cjs',
    exportName: 'probe:web-product/probe:products',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-precompiled-registry',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Loads the real docs production output over a local HTTP server in Electron Chromium and proves the bundled precompile plus missing, corrupt and environment-mismatch static fallbacks reach the main menu with identical hashes and queries.'
  },
  {
    file: 'electron/main.js + electron/preload.js + scripts/probe-product-runtime.mjs',
    exportName: 'probe:electron-product',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-precompiled-registry',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Launches the packaged unpacked EXE, validates production hashes, disk-cache miss/hit and fallback behavior through bounded IPC, verifies executable-local settings, Chromium storage and cache identity, and isolates fault probes without changing formal userdata or startup.log.'
  },
  {
    file: 'src/domain/mods/officialRegistryCache.ts',
    exportName: 'createOfficialRegistryCacheText/parseOfficialRegistryCacheText',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-registry-disk-cache',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Validates disk cache JSON as unknown, checks the internal v2 TypeBox envelope, all five official identity hashes, payloadHash and official count metadata, then restores through the snapshot codec so fast hits avoid repeated static parsing and semantic scans.'
  },
  {
    file: 'src/domain/mods/officialRegistryCacheFile.ts',
    exportName: 'getOfficialRegistryCacheFilePaths/readOfficialRegistryCacheFile/writeOfficialRegistryCacheFile/cleanupOfficialRegistryCacheTempFiles',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-registry-disk-cache',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Restricts derived cache files to userdata/mod-cache, writes the v2 envelope to a unique temporary file with flush and close, rereads and fully validates it, then atomically replaces the formal cache while preserving the previous cache on failure.'
  },
  {
    file: 'src/domain/mods/officialRegistryCacheRuntime.ts',
    exportName: 'loadOfficialRegistryDiskCache/restoreOfficialRegistryDiskCache/writeOfficialRegistryDiskCache',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-registry-disk-cache',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Exposes only fixed-purpose Electron bridge operations to the renderer, keeps Web/development/test environments isolated or disabled, and marks verified v2 disk restores as fast candidates after snapshot codec recovery.'
  },
  {
    file: 'src/domain/mods/officialRegistryCacheRefresh.ts',
    exportName: 'refreshOfficialRegistryDiskCache/getOfficialRegistryCacheWriteReport',
    classification: 'adapter',
    targetRegistry: 'engine/cache/official-registry-disk-cache',
    persistentIds: false,
    migrationPhase: [6],
    status: 'verified',
    rationale: 'Rebuilds the v2 derived official cache after the UI mount without delaying ordinary startup, skips writes on verified disk hits, and keeps bounded structured diagnostics and timings for failed writes.'
  },
  {
    file: 'src/domain/mods/thirdPartyDataPackDiscovery.ts',
    exportName: 'discoverThirdPartyDataPacks/satisfiesPackageVersionRange',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-data-pack-discovery',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Provides the read-only third-party data pack discovery entrypoint and shared SemVer range helper: scans only one directory level, reads manifest.json and manifest-declared JSON content, validates unknown input through TypeBox, rejects unsafe paths/symlinks, reports dependency/version/conflict and registry entry duplicate diagnostics, converts package source inspect/list/read failures into structured diagnostics without crashing, and never publishes registry entries.'
  },
  {
    file: 'src/domain/mods/thirdPartyDataPackSelection.ts',
    exportName: 'selectThirdPartyDataPacks',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-data-pack-selection',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Provides the read-only package selection summary for discovered third-party data pack candidates: blocks invalid candidates and duplicate package ids, propagates blocked required dependencies including duplicate-id targets, treats compatible optional dependencies as ordering edges, diagnoses cycles and returns a stable packageId-sorted topological load order without loading or writing third-party content.'
  },
  {
    file: 'src/domain/mods/thirdPartyCandidateRegistrySnapshot.ts',
    exportName: 'buildThirdPartyCandidateRegistrySnapshot',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-candidate-registry-snapshot',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Builds a read-only in-memory candidate RegistrySet from the selected third-party load order by cloning the official frozen baseline, registering already TypeBox-validated third-party entries into the clone, rejecting official content conflicts and selected third-party duplicates, rerunning structure/semantic/freeze gates, and returning skipped/invalid/valid summaries without publishing a runtime registry, lockfile, cache, save or settings write.'
  },
  {
    file: 'src/domain/mods/schemas.ts',
    exportName: 'ThirdPartyDataPackLockfileDraftSchema',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-lockfile-draft',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Defines the internal TypeBox draft candidate for third-party lockfile metadata, including official/candidate identity hashes, package ids, stable load order, relative source paths, package content file summaries and self hash. It is intentionally not added to PUBLIC_JSON_SCHEMAS, so the current public schemaSetHash remains unchanged until mod-lock.json compatibility is deliberately frozen.'
  },
  {
    file: 'src/domain/mods/thirdPartyDataPackLockfileDraft.ts',
    exportName: 'createThirdPartyDataPackLockfileDraft/validateThirdPartyDataPackLockfileDraft',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-lockfile-draft',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Creates a read-only, in-memory third-party lockfile draft only from valid candidate snapshots and validates unknown draft input through the internal TypeBox draft schema before semantic comparison, then checks reproducibility of selected package ids, versions, stable load order, relative source paths, manifest/content hashes, official five-hash baseline and candidate identity without writing a real lockfile, enabling runtime packs, changing settings or touching saves.'
  },
  {
    file: 'src/domain/mods/thirdPartyDataPackModLockFile.ts',
    exportName: 'getThirdPartyDataPackModLockFilePaths/createThirdPartyDataPackModLockText/parseThirdPartyDataPackModLockText/readThirdPartyDataPackModLockFile/writeThirdPartyDataPackModLockFile/cleanupThirdPartyDataPackModLockTempFiles',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-mod-lock-atomic-file',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Defines the first 7E internal mod-lock atomic file boundary for the current third-party lockfile draft shape: targets only an explicit userdata/mod-lock.json path, treats disk bytes as unknown JSON before pure JSON, TypeBox draft and self-hash validation, writes via unique temporary file with sync, close, reread validation and atomic replace, removes stale own temp files, and preserves the previous valid lockfile on interruption or replace failure without touching player saves, settings, official cache, package files, transaction logs, Electron IPC, UI or runtime enablement.'
  },
  {
    file: 'src/domain/mods/thirdPartyDataPackModLockStorage.ts',
    exportName: 'resolveThirdPartyDataPackModLockStoragePaths/createThirdPartyDataPackModLockStorageAdapter',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-mod-lock-storage-adapter',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Defines the second 7E internal mod-lock storage boundary: resolves an injected absolute program directory to program-directory userdata/mod-lock.json, delegates validated read/write work to the existing atomic file primitive, returns structured inspect/read/write reports, and keeps runtime enablement, Electron IPC, registry publication, package files, backups, settings, saves, official cache and transaction logs out of scope.'
  },
  {
    file: 'src/domain/mods/electronModLockStorageProbe.ts',
    exportName: 'resolveElectronThirdPartyDataPackModLockProgramDirectoryPath/createElectronThirdPartyDataPackModLockStorageProbe',
    classification: 'adapter',
    targetRegistry: 'engine/loader/electron-mod-lock-storage-probe',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Defines the third 7E Electron main-process mod-lock storage path probe: resolves a packaged process executable directory or PORTABLE_EXECUTABLE_DIR-style override to program-directory userdata/mod-lock.json, explicitly observes but does not use configured app userData, delegates inspect/read/write to the pure storage adapter, and keeps runtime enablement, renderer IPC, desktop startup changes, package files, backups, settings, saves, official cache and transaction logs out of scope.'
  },
  {
    file: 'electron/main.js',
    exportName: 'content-runtime-probe modLockStorageProbe',
    classification: 'adapter',
    targetRegistry: 'engine/loader/electron-mod-lock-runtime-probe',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Wires the actual packaged Electron main-process path provider into the existing opt-in runtime probe report in inspect-only mode. The report is path-free, exposes only storage status, program-directory source, containment booleans and explicit no-write effects, and does not read or write real mod-lock.json, expose renderer IPC, change desktop startup, publish third-party registries, or modify settings, saves, official cache, package files or transaction logs.'
  },
  {
    file: 'electron/main.js',
    exportName: 'content-runtime-probe isolated modLockStorageProbe write/read',
    classification: 'adapter',
    targetRegistry: 'engine/loader/electron-mod-lock-runtime-probe',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Adds a product-probe-only 7E branch guarded by TAOYUAN_RUNTIME_PROBE_OUTPUT, TAOYUAN_RUNTIME_PROBE_MOD_LOCK_WRITE_READ and PORTABLE_EXECUTABLE_DIR. It writes and reads a synthetic internal draft through the existing atomic mod-lock storage path only in the isolated probe userdata directory, keeps the report path-free, and still leaves runtime enablement, IPC, third-party registry publication, settings, saves, official cache, package files and transaction logs disabled.'
  },
  {
    file: 'scripts/probe-product-runtime.mjs',
    exportName: 'probe:electron-product mod-lock runtime assertions',
    classification: 'adapter',
    targetRegistry: 'engine/loader/electron-mod-lock-runtime-probe',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Extends the real packaged EXE runtime probe to assert the Electron mod-lock bridge remains inspect-only, uses executable-directory or PORTABLE_EXECUTABLE_DIR program userdata as expected, reports no writes or runtime enablement, preserves any pre-existing mod-lock file and temp-file set, and does not leak absolute paths.'
  },
  {
    file: 'scripts/probe-product-runtime.mjs',
    exportName: 'probe:electron-product isolated mod-lock write/read assertions',
    classification: 'adapter',
    targetRegistry: 'engine/loader/electron-mod-lock-runtime-probe',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Adds a real packaged EXE scenario that enables the synthetic mod-lock write/read branch only under a temporary PORTABLE_EXECUTABLE_DIR root after a disk-cache fast hit. The probe asserts isolated userdata/mod-lock.json is written and read, no temp files remain, protected settings, save-like files, official cache, package files and transaction logs keep identical content hashes, formal pkg/win-unpacked/userdata remains unchanged, and reports do not leak absolute paths.'
  },
  {
    file: 'src/domain/mods/thirdPartyDataPackMountPreflight.ts',
    exportName: 'buildThirdPartyDataPackMountPreflight',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-mount-preflight',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Composes discovery, selection, candidate snapshot, lockfile draft and draft validation into a read-only pre-mount lifecycle report with ready/skipped/rolled-back status, stage summaries, rollback evidence and explicit no-write effects; it does not publish runtime registries, write lockfiles, touch settings, saves, packages or caches.'
  },
  {
    file: 'src/domain/mods/thirdPartyDataPackMountInput.ts',
    exportName: 'buildThirdPartyDataPackMountInput',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-mount-input',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Prepares the future runtime mount adapter input only from a ready read-only preflight: exposes the frozen in-memory candidate RegistrySet, serializable candidate snapshot and lockfile draft, returns skipped/blocked summaries without candidate artifacts, and still performs no registry publication, lockfile, settings, save, package or cache writes.'
  },
  {
    file: 'src/domain/mods/thirdPartyDataPackRuntimeMountGate.ts',
    exportName: 'buildThirdPartyDataPackRuntimeMountGate',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-runtime-mount-gate',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Consumes the read-only Mount Input and produces a runtime publication gate report that summarizes selected packages, candidate identity and missing write/transaction prerequisites while keeping runtime publication deferred and performing no registry, lockfile, settings, save, package, cache or transaction-log writes.'
  },
  {
    file: 'src/domain/mods/thirdPartyDataPackTransactionPreflight.ts',
    exportName: 'buildThirdPartyDataPackTransactionPreflight',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-transaction-preflight',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Consumes the read-only Runtime Mount Gate and produces a lifecycle transaction preflight report that keeps commits deferred, enumerates missing staged package, settings, lockfile, recovery log and rollback verification primitives, exposes the install/upgrade/disable/uninstall discovered-to-committed no-write state matrix, and performs no package, backup, registry, lockfile, settings, save, cache or transaction-log writes.'
  },
  {
    file: 'src/domain/mods/thirdPartyDataPackRuntimeAdapterGate.ts',
    exportName: 'buildThirdPartyDataPackRuntimeAdapterGate',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-runtime-adapter-gate',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Consumes the read-only Transaction Preflight and produces a runtime platform adapter gate report that keeps runtime enablement deferred, enumerates missing Electron, Web, Android, shared core and storage-isolation adapters, and performs no IPC exposure, import persistence, registry, package, lockfile, settings, save, cache or transaction-log writes.'
  },
  {
    file: 'src/domain/mods/contentPackageSource.ts',
    exportName: 'ContentPackageSource/createMemoryContentPackageSource/createDiscoveryFileSystemFromContentPackageSource/readContentPackageSourceJson/validateContentPackageSourceIdentity/normalizeContentPackageSourceDirectoryEntries/normalizeContentPackageSourceArchiveEntryPath/validateContentPackageSourceArchiveEntries',
    classification: 'adapter',
    targetRegistry: 'engine/loader/content-package-source-contract',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Defines the shared, platform-neutral ContentPackageSource contract with stable relative identity, normalized source paths, directory entry normalization, file/directory/other entry metadata, symbolic-link flags, unknown JSON read boundary, safe-read limits for path bytes, depth, file count, text size, archive uncompressed size and compression ratio, permission revocation, disposal, runtime source identity validation and a read-only bridge into the existing discovery pipeline; malformed identities, revoked, disposed, unsafe, duplicate, over-limit or otherwise unavailable sources are surfaced as structured discovery diagnostics with source error codes, and the memory adapter, developer-cli-directory identity and future archive helpers perform no platform source opening, handle retention, IPC exposure, persistence, package, lockfile, settings, save, cache or transaction-log writes.'
  },
  {
    file: 'src/domain/mods/electronContentPackageSourceProbe.ts',
    exportName: 'createElectronReadonlyDirectoryProbeSource/buildElectronReadonlySourceAdapterProbeReport/buildElectronReadonlyRuntimeReadinessProbeReport',
    classification: 'adapter',
    targetRegistry: 'engine/loader/electron-source-adapter-probe',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Defines the first 7A Electron read-only source adapter probe behind the shared ContentPackageSource contract and the first 7F no-write readiness probe over that source: uses stable relative identity kind electron-readonly-directory-probe, sourceId electron/mods-readonly-probe and rootPath mods, accepts a controlled main-process host boundary, can carry a sample third-party pack through discovery, selection, candidate snapshot, lockfile draft, Mount Input, Runtime Mount Gate, Transaction Preflight, Runtime Adapter Gate and Source Adapter Gate, reports only path-free status/hash/count summaries, keeps runtime enablement and publication deferred, releases the source lifecycle and performs no package, lockfile, settings, save, cache or transaction-log writes.'
  },
  {
    file: 'src/domain/mods/thirdPartyDataPackSourceAdapterGate.ts',
    exportName: 'buildThirdPartyDataPackSourceAdapterGate',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-source-adapter-gate',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Consumes the read-only Runtime Adapter Gate and reports that the shared ContentPackageSource contract is defined while keeping runtime enablement deferred until real Electron, Web and Android source adapters implement it; it now enumerates the satisfied source identity, pure JSON, normalized relative path, permission revocation diagnostic and lifecycle release contracts, and performs no platform source opening, source-handle retention, IPC exposure, import persistence, registry, package, lockfile, settings, save, cache or transaction-log writes.'
  },
  {
    file: 'src/domain/mods/thirdPartyDataPackRepairReport.ts',
    exportName: 'buildThirdPartyDataPackRepairReport',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-repair-report',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Builds the first strict-whitelist, read-only Repair Report over discovery results: reports legacy manifest dependency defaults as staged normalization opportunities, blocks non-whitelisted errors, records before/after summaries and diagnostics, and performs no package, registry, lockfile, settings, save or cache writes.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackDiscovery.test.ts + src/tests/fixtures/mods/third-party-discovery',
    exportName: 'third-party discovery fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-data-pack-discovery',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers legal, legacy-manifest, schema-invalid, JSON-invalid, missing-manifest, missing-content, non-JSON, unsupported-registry, unsafe-path, dependency, optional dependency, manifest conflict, same-package duplicate, cross-package conflict and identical duplicate fixtures; proves invalid packages are not injected into official registries and verifies player settings/save files and unrelated large files are not read or modified.'
  },
  {
    file: 'scripts/check-third-party-packs.mjs',
    exportName: 'mod:check-packs/check-third-party-packs',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-data-pack-check-cli',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Provides the read-only developer CLI for third-party data pack validation: accepts a package directory or discovery root, adapts Node directory scans through the shared ContentPackageSource contract before the injectable discovery file system, reports stable developer-cli-directory identity without absolute paths, reuses discovery, selection, repair report, candidate snapshot, lockfile draft, mount preflight, mount input, runtime mount gate, transaction preflight, runtime adapter gate and source adapter gate validators, prints human-readable dependency/conflict diagnostics, repair actions, load order, candidate snapshot, lockfile draft, preflight, runtime gate, transaction preflight, runtime adapter, source adapter and satisfied source-contract matrix statuses, exits non-zero only for blocking errors or fatal failures, and never writes files, userdata, cache, saves, settings, lockfiles, transaction logs, source handles or official registries.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackCheckCli.test.ts',
    exportName: 'third-party data pack check CLI fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-data-pack-check-cli',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers valid package success, missing roots and bad arguments, JSON parse diagnostics, TypeBox schema diagnostics, unsafe paths, missing entrypoints, non-JSON entrypoints, unsupported registries, missing required dependency failures, stable selection load order, dependency-cycle blocking output, warning-only optional dependency success, Source Contract identity output without absolute paths, Repair Report, Candidate Snapshot, Lockfile Draft, Mount Preflight, Mount Input, Runtime Mount Gate, Transaction Preflight, Runtime Adapter Gate, Source Adapter Gate and satisfied source-contract matrix CLI output, read-only protection for fixtures/userdata/official registries and parity with the shared discovery entrypoint.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackSelection.test.ts',
    exportName: 'third-party data pack selection fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-data-pack-selection',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers stable dependency-first ordering independent of candidate array order, warning-only optional dependency selection, required dependency block propagation, duplicate package id blocking and dependent propagation without scan-order choice, required and optional dependency cycle diagnostics, input immutability, repeated result stability and unchanged official registry counts and hashes.'
  },
  {
    file: 'src/tests/domain/thirdPartyCandidateRegistrySnapshot.test.ts',
    exportName: 'third-party candidate registry snapshot fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-candidate-registry-snapshot',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers valid frozen candidate snapshots, empty-root skipped results, repeated deterministic candidate identity, schema-blocked dependencies, official content id conflicts, selected third-party duplicate entries, dependency-cycle all-or-nothing invalidation, cross-registry semantic failures and immutability of official registries plus discovery and selection reports.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackLockfileDraft.test.ts',
    exportName: 'third-party lockfile draft fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-lockfile-draft',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers deterministic draft generation, the internal TypeBox draft schema accepting generated output, unknown/non-object input rejection before semantic comparison, malformed package id/hash/extra-property/unsafe-path schema diagnostics, repeated identical output, matching validator success, package id/version/load-order/content-hash and official-baseline mismatch diagnostics, invalid candidate rejection, empty-root skipped handling, read-only protection for registries/reports/userdata/files and unchanged official 54/4242 five-hash baseline.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackModLockFile.test.ts',
    exportName: 'third-party mod-lock atomic file fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-mod-lock-atomic-file',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers successful write/read of a validated internal draft at userdata/mod-lock.json, deterministic repeated bytes, missing lockfile handling, stale own-temp cleanup without deleting unrelated files, interruption and replacement failure rollback to the previous valid lockfile, concurrent reads seeing only the old or new complete file, invalid JSON, schema errors and self-hash rejection, and protection for settings, save-like files and official cache files.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackModLockStorage.test.ts',
    exportName: 'third-party mod-lock storage adapter fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-mod-lock-storage-adapter',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers program-directory userdata path resolution without creating directories, missing and invalid path reports, successful adapter write/read through the atomic file primitive, interruption and replace-failure rollback, temporary-file cleanup, no runtime enablement or IPC exposure, and protection for settings, save-like files, official cache, package files, transaction logs and official 54/4242 five-hash baseline.'
  },
  {
    file: 'src/tests/domain/electronModLockStorageProbe.test.ts',
    exportName: 'electron mod-lock storage path probe fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/electron-mod-lock-storage-probe',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers packaged executable-directory and PORTABLE_EXECUTABLE_DIR-style program-directory resolution, no fallback to configured app userData, missing and invalid path reports without unrelated directory creation, successful probe write/read through the existing storage adapter, interruption and replace-failure rollback, temporary-file cleanup, no renderer IPC/runtime enablement/desktop startup changes, and protection for settings, save-like files, official cache, package files, transaction logs and official 54/4242 five-hash baseline.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackMountPreflight.test.ts',
    exportName: 'third-party mount preflight fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-mount-preflight',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers ready, skipped and rolled-back preflight outcomes, stage status summaries, deterministic repeated output, no runtime publication, no lockfile/settings/save/package/cache writes, official registry immutability and unchanged 54/4242 five-hash baseline.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackMountInput.test.ts',
    exportName: 'third-party mount input fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-mount-input',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers ready, skipped and blocked mount input preparation, frozen candidate RegistrySet exposure, candidate snapshot and lockfile draft availability only for ready preflights, deterministic repeated output, read-only protection for reports/files/userdata/settings and unchanged official 54/4242 five-hash baseline.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackRuntimeMountGate.test.ts',
    exportName: 'third-party runtime mount gate fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-runtime-mount-gate',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers deferred, skipped and blocked runtime gate outcomes, required write/transaction gate enumeration, absence of candidate artifact exposure, deterministic repeated output, read-only protection for reports/files/userdata/settings and unchanged official 54/4242 five-hash baseline.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackTransactionPreflight.test.ts',
    exportName: 'third-party transaction preflight fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-transaction-preflight',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers deferred, skipped and blocked transaction preflight outcomes, required lifecycle transaction primitive enumeration, install/upgrade/disable/uninstall stage summaries, absence of candidate artifact exposure, deterministic repeated output, read-only protection for reports/files/userdata/settings and unchanged official 54/4242 five-hash baseline.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackRuntimeAdapterGate.test.ts',
    exportName: 'third-party runtime adapter gate fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-runtime-adapter-gate',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers deferred, skipped and blocked runtime adapter gate outcomes, required Electron/Web/Android/shared adapter enumeration, absence of candidate artifact exposure, deterministic repeated output, read-only protection for reports/files/userdata/settings and unchanged official 54/4242 five-hash baseline.'
  },
  {
    file: 'src/tests/domain/contentPackageSource.test.ts',
    exportName: 'content package source contract fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/content-package-source-contract',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers the platform-neutral memory ContentPackageSource contract, discovery bridge parity, stable relative identity without absolute paths, runtime identity validation, source path normalization and rejection, directory entry name/kind/duplicate validation, archive-entry traversal and resource guardrails, unknown JSON parsing and text-size boundary, permission revocation, disposal, structured discovery diagnostics for unavailable, malformed or over-limit sources, candidate-level source failure containment and no source-handle persistence.'
  },
  {
    file: 'src/tests/domain/electronContentPackageSourceProbe.test.ts',
    exportName: 'electron read-only source adapter probe fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/electron-source-adapter-probe',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers Electron read-only source probe identity without absolute paths, discovery of a controlled mods directory through the shared ContentPackageSource bridge, unknown JSON reading, sample-pack readiness through Mount Input, Runtime Mount Gate, Transaction Preflight, Runtime Adapter Gate and Source Adapter Gate with runtime publication still deferred, no runtime enablement, no IPC exposure, no lockfile/settings/save/cache/package/transaction-log writes, unsafe path rejection, disposal diagnostics, source read failure containment and unchanged official 54/4242 five-hash baseline.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackSourceAdapterGate.test.ts',
    exportName: 'third-party source adapter gate fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-source-adapter-gate',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers deferred, skipped and blocked source adapter gate outcomes after the shared source contract is defined, five satisfied source-contract matrix entries, absence of candidate artifact and platform source exposure, deterministic repeated output, read-only protection for reports/files/userdata/settings and unchanged official 54/4242 five-hash baseline.'
  },
  {
    file: 'src/tests/domain/thirdPartyDataPackRepairReport.test.ts',
    exportName: 'third-party repair report fixture matrix',
    classification: 'adapter',
    targetRegistry: 'engine/loader/third-party-repair-report',
    persistentIds: false,
    migrationPhase: [7],
    status: 'verified',
    rationale: 'Covers clean, repairable and blocked repair report outcomes, whitelisted legacy dependencies default reporting, non-whitelisted schema error blocking, deterministic repeated output, read-only protection for package files/userdata/settings and unchanged official 54/4242 five-hash baseline.'
  }
]

const entries = dataFiles.map(file => {
  const rel = relative(file)
  const existing = fileDefaults.get(rel) ?? {
    file: rel,
    classification: 'mixed',
    domains: [],
    candidateTargets: [],
    phases: [6],
    status: 'file_inventoried'
  }
  const lineCount = readText(file).split(/\r?\n/).length
  const symbols = getExportedSymbols(file).map(symbol => {
    const reviewOverride = symbolReviewOverrides.get(`${rel}:${symbol.exportName}`)
    const classification = reviewOverride?.classification ?? classifySymbol(existing, symbol)
    return {
      file: rel,
      exportName: symbol.exportName,
      syntaxKind: symbol.syntaxKind,
      classification,
      targetRegistry: reviewOverride?.targetRegistry ?? getTargetRegistry(existing, classification),
      persistentIds: reviewOverride?.persistentIds ?? (classification === 'content' || classification === 'derived'),
      consumers: getConsumers(symbol.exportName, rel),
      migrationPhase: existing.phases ?? [6],
      snapshotFixture:
        reviewOverride?.snapshotFixture ?? (
          classification === 'content' || classification === 'derived'
            ? 'src/tests/fixtures/mods/official-content-snapshot.json'
            : undefined
        ),
      status: reviewOverride?.status ?? getDefaultInventoryStatus(classification),
      rationale: reviewOverride?.rationale ?? getRationale(classification, symbol.syntaxKind)
    }
  })

  return {
    ...existing,
    lines: lineCount,
    status: symbols.length > 0 ? 'symbol_inventoried' : existing.status,
    symbols
  }
})

const inventory = {
  inventoryVersion: 2,
  sourceRoot,
  capturedAt: '2026-07-15',
  summary: {
    fileCount: entries.length,
    approximateLineCount: entries.reduce((total, entry) => total + entry.lines, 0),
    scope: 'export-symbol-level baseline',
    nextRequiredScope: 'per-domain migration verification before official content package takeover',
    symbolCount: entries.reduce((total, entry) => total + entry.symbols.length, 0),
    reviewedArtifactCount: reviewedArtifacts.length
  },
  entries,
  reviewedArtifacts
}

fs.writeFileSync(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8')
console.log(`Wrote ${relative(outputPath)} with ${inventory.summary.symbolCount} exported symbols.`)
