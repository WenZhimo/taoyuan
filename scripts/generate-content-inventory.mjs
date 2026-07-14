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
  'src/data/weapons.ts:SHOP_WEAPONS': {
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies the SHOP_WEAPONS purchase projection through taoyuan:shop_offer; weapon definitions and combat behavior remain owned by later equipment/enchantment phases.'
  },
  'src/data/hats.ts:SHOP_HATS': {
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies the SHOP_HATS purchase projection through taoyuan:shop_offer; full hat equipment content remains available through legacy data until equipment migration.'
  },
  'src/data/shoes.ts:SHOP_SHOES': {
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies the SHOP_SHOES purchase projection through taoyuan:shop_offer; full shoe equipment content remains available through legacy data until equipment migration.'
  },
  'src/data/processing.ts:FERTILIZERS': {
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies fertilizer shopPrice/name/description projection through taoyuan:shop_offer; processing and fertilizer behavior remain in later production migration scope.'
  },
  'src/data/processing.ts:BAITS': {
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies bait shopPrice/name/description projection through taoyuan:shop_offer; fishing behavior remains framework-owned.'
  },
  'src/data/processing.ts:TACKLES': {
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies tackle shopPrice/name/description projection through taoyuan:shop_offer; tackle durability and fishing behavior remain framework-owned.'
  },
  'src/data/animals.ts:HAY_PRICE': {
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies hay purchase price projection through taoyuan:shop_offer; animal feeding rules remain framework-owned.'
  },
  'src/data/fruitTrees.ts:FRUIT_TREE_DEFS': {
    status: 'verified',
    rationale: 'Phase 3 shop offer pilot verifies fruit-tree sapling shop projection through taoyuan:shop_offer; tree growth and harvest behavior remain later agriculture migration scope.'
  },
  'src/data/weapons.ts:MONSTER_DROP_WEAPONS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies MONSTER_DROP_WEAPONS through named taoyuan:drop_table entries without changing weapon drop settlement.'
  },
  'src/data/weapons.ts:TREASURE_DROP_WEAPONS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies TREASURE_DROP_WEAPONS through named taoyuan:drop_table entries while treasure settlement remains framework-owned.'
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
  'src/data/shoes.ts:MONSTER_DROP_SHOES': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies MONSTER_DROP_SHOES through named taoyuan:drop_table entries without changing shoe drop settlement.'
  },
  'src/data/shoes.ts:TREASURE_DROP_SHOES': {
    classification: 'derived',
    targetRegistry: 'taoyuan:drop_table',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 equipment drop pilot verifies TREASURE_DROP_SHOES through named taoyuan:drop_table entries while treasure settlement remains framework-owned.'
  },
  'src/data/weapons.ts:ENCHANTMENTS': {
    classification: 'content',
    targetRegistry: 'taoyuan:enchantment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 enchantment registry pilot verifies ENCHANTMENTS through taoyuan:enchantment, including display fields, combat bonuses and special effects while the legacy static export remains available as the rollback path.'
  },
  'src/data/weapons.ts:ENCHANTMENT_RARITY': {
    classification: 'derived',
    targetRegistry: 'taoyuan:enchantment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 enchantment registry pilot folds legacy rarity into official enchantment definitions and verifies existing cost inputs remain equivalent.'
  },
  'src/data/weapons.ts:RANDOM_ENCHANT_IDS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:enchantment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 enchantment registry pilot converts legacy random enchantment membership and rarity into deterministic randomWeight fields without changing rollWeightedEnchantment().'
  },
  'src/data/weapons.ts:ENCHANTMENT_EFFECTS': {
    classification: 'derived',
    targetRegistry: 'taoyuan:enchantment',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 4 enchantment registry pilot carries existing standard equipment effect parameters into taoyuan:enchantment while runtime collection still uses the legacy map.'
  },
  'src/data/mine.ts:MONSTERS': {
    classification: 'content',
    targetRegistry: 'taoyuan:monster',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 5 monster registry pilot verifies every MONSTERS definition and ordered drop entry through the taoyuan:monster query facade while retaining the static object as a rollback path.'
  },
  'src/data/mine.ts:BOSS_MONSTERS': {
    classification: 'content',
    targetRegistry: 'taoyuan:monster',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 5 monster registry pilot verifies every BOSS_MONSTERS definition and ordered drop entry through taoyuan:monster; floor mapping, combat and rewards remain on the legacy framework path.'
  },
  'src/data/mine.ts:SKULL_CAVERN_MONSTERS': {
    classification: 'content',
    targetRegistry: 'taoyuan:monster',
    persistentIds: true,
    snapshotFixture: 'src/tests/fixtures/mods/official-content-snapshot.json',
    status: 'verified',
    rationale: 'Phase 5 monster registry pilot verifies every SKULL_CAVERN_MONSTERS definition and ordered drop entry through taoyuan:monster while leaving cavern pool selection and scaling unchanged.'
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
  capturedAt: '2026-07-13',
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
