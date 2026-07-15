import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

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
  'HATS',
  'HEART_EVENTS',
  'HIDDEN_NPCS',
  'HIDDEN_NPC_HEART_EVENTS',
  'HOSTILE_ANIMALS',
  'HYBRID_DEFS',
  'MONSTER_GOALS',
  'MORNING_CHOICE_EVENTS',
  'MORNING_EASTER_EGGS',
  'MORNING_NARRATIONS',
  'MORNING_TIPS',
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
  domains: ['processing_recipe', 'processing_machine', 'processing_craft', 'lookup'],
  candidateTargets: ['taoyuan:processing_recipe', 'taoyuan:processing_machine', 'compatibility_adapter', 'engine/domain/processing'],
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

const getStatus = classification => {
  switch (classification) {
    case 'content':
    case 'derived':
    case 'adapter':
      return 'baselined'
    case 'algorithm':
    case 'ui':
      return 'framework-retained'
    case 'barrel':
      return 'inventoried'
    default:
      return 'inventoried'
  }
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
    status: 'baselined',
    rationale: 'Leaf source extracted only to keep generated item derivation free of registry cycles; sprinkler registry migration remains a later production/facility slice.'
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
    status: 'baselined',
    rationale: 'Leaf source extracted only to keep generated item derivation free of registry cycles; bomb registry migration remains a later production/combat slice.'
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
    status: 'baselined',
    rationale: 'Original-name re-export preserves legacy sprinkler imports after the leaf extraction; sprinkler registry migration remains out of this processing machine slice.'
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
    status: 'baselined',
    rationale: 'Original-name re-export preserves legacy bomb imports after the leaf extraction; bomb registry migration remains out of this processing machine slice.'
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
  'src/data/secretNotes.ts:SECRET_NOTES': {
    classification: 'content',
    targetRegistry: 'taoyuan:secret_note',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 6 projects every legacy secret note into taoyuan:secret_note while preserving numeric note IDs, titles, content, usability and treasure rewards.'
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
  }
}))

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
      status: reviewOverride?.status ?? getStatus(classification),
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
