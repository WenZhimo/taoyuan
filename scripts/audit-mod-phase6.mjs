import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createRequire } from 'node:module'
import ts from 'typescript'
import {
  PROVISIONAL_INVENTORY_STATUSES,
  isProvisionalInventoryStatus
} from './content-inventory-policy.mjs'

const root = process.cwd()
const inventoryPath = path.join(root, 'docs-source', '模组系统实施计划', 'content-inventory.json')
const snapshotPath = path.join(root, 'src', 'tests', 'fixtures', 'mods', 'official-content-snapshot.json')
const srcRoot = path.join(root, 'src')
const rootRequire = createRequire(import.meta.url)
const vitePluginRequire = createRequire(rootRequire.resolve('@vitejs/plugin-vue/package.json'))
const { parse: parseVueSfc } = vitePluginRequire('@vue/compiler-sfc')

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const toPosix = file => file.replaceAll(path.sep, '/')
const relative = file => toPosix(path.relative(root, file))

const inventory = readJson(inventoryPath)
const officialSnapshot = readJson(snapshotPath)
const officialRegistryIds = new Set(officialSnapshot.registries.map(registry => registry.registryId))
const inventorySymbols = inventory.entries.flatMap(entry => entry.symbols)
const staticAdapterFile = 'src/domain/mods/staticAdapters.ts'
const readSource = file => fs.readFileSync(path.join(root, file), 'utf8')
const startupSources = {
  applicationBootstrap: readSource('src/bootstrap.ts'),
  capacitor: readSource('capacitor.config.ts'),
  contentAccess: readSource('src/domain/mods/contentAccess.ts'),
  electronMain: readSource('electron/main.js'),
  electronPreload: readSource('electron/preload.js'),
  main: readSource('src/main.ts'),
  officialContentBootstrap: readSource('src/domain/mods/officialContentBootstrap.ts'),
  officialPrecompiledRuntime: readSource('src/domain/mods/officialPrecompiledRuntime.ts'),
  webIndex: readSource('index.html')
}
const dataImportCategories = [
  'official-adapter-leaf',
  'compatibility-fallback',
  'framework-algorithm',
  'legal-derived',
  'pending-migration-violation'
]
const inventoryByExport = new Map(
  inventorySymbols.map(symbol => [`${symbol.file}:${symbol.exportName}`, symbol])
)

const appearsInOrder = (source, tokens) => {
  let cursor = -1
  for (const token of tokens) {
    cursor = source.indexOf(token, cursor + 1)
    if (cursor < 0) return false
  }
  return true
}

const officialStartupChecks = [
  {
    id: 'official-registry-lifecycle',
    pass: appearsInOrder(startupSources.officialContentBootstrap, [
      'const prepareCandidate',
      'dependencies.validateStructure',
      'dependencies.validateSemantics',
      'dependencies.freezeRegistrySet',
      'const bootstrap'
    ]) && appearsInOrder(startupSources.officialContentBootstrap, [
      "precompiledStatus: 'not-configured'",
      'publishedRegistrySet = candidate'
    ]),
    evidence: 'src/domain/mods/officialContentBootstrap.ts'
  },
  {
    id: 'official-precompiled-fallback',
    pass: appearsInOrder(startupSources.officialContentBootstrap, [
      'dependencies.precompiled.load()',
      'dependencies.precompiled.restore(value)',
      'classifyPrecompiledFailure(error)',
      "runStage('build', dependencies.buildRegistrySet)"
    ])
      && startupSources.officialPrecompiledRuntime.includes("official-precompiled-registry.json?raw")
      && startupSources.officialPrecompiledRuntime.includes('createExpectedOfficialEnvironmentHash')
      && startupSources.officialPrecompiledRuntime.includes('restoreOfficialPrecompiledRegistryArtifactText'),
    evidence: 'src/domain/mods/officialContentBootstrap.ts, src/domain/mods/officialPrecompiledRuntime.ts'
  },
  {
    id: 'application-gate-order',
    pass: appearsInOrder(startupSources.applicationBootstrap, [
      'await dependencies.bootstrapOfficialContent()',
      'dependencies.createApp()',
      'dependencies.createPinia()',
      'dependencies.mount(app, router)'
    ]),
    evidence: 'src/bootstrap.ts'
  },
  {
    id: 'content-access-published-only',
    pass: startupSources.contentAccess.includes("from './officialContentBootstrap'")
      && !startupSources.contentAccess.includes('buildOfficialRegistrySetFromStaticData'),
    evidence: 'src/domain/mods/contentAccess.ts'
  },
  {
    id: 'shared-renderer-entry',
    pass: startupSources.webIndex.includes('src="/src/main.ts"')
      && startupSources.electronMain.includes("loadFile(path.join(docsPath, 'index.html')")
      && startupSources.capacitor.includes("webDir: 'docs'")
      && startupSources.main.includes('bootstrapOfficialContent'),
    evidence: 'index.html, src/main.ts, electron/main.js, capacitor.config.ts'
  },
  {
    id: 'electron-startup-diagnostic',
    pass: startupSources.electronPreload.includes("ipcRenderer.send('startup-failure'")
      && startupSources.electronMain.includes("ipcMain.on('startup-failure'")
      && startupSources.electronMain.includes("'startup.log'"),
    evidence: 'electron/preload.js, electron/main.js'
  }
]
const officialStartupStatus = officialStartupChecks.every(check => check.pass) ? 'PASS' : 'FAIL'

const walkSourceFiles = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const absolute = path.join(directory, entry.name)
  if (entry.isDirectory()) {
    if (['data', 'tests'].includes(entry.name)) return []
    return walkSourceFiles(absolute)
  }
  return /\.(ts|vue)$/.test(entry.name) ? [absolute] : []
})

const resolveDataModule = (specifier, importerFile) => {
  let modulePath
  if (specifier.startsWith('@/data/')) {
    modulePath = path.join(srcRoot, 'data', specifier.slice('@/data/'.length))
  } else if (specifier.startsWith('.')) {
    modulePath = path.resolve(path.dirname(importerFile), specifier)
  } else {
    return null
  }

  const candidates = [modulePath, `${modulePath}.ts`, path.join(modulePath, 'index.ts')]
  const resolved = candidates.find(candidate => fs.existsSync(candidate))
  if (!resolved || !relative(resolved).startsWith('src/data/')) return null
  return relative(resolved)
}

const getScriptBlocks = file => {
  const source = fs.readFileSync(file, 'utf8')
  if (file.endsWith('.ts')) return [{ content: source, lang: 'ts' }]

  const { descriptor, errors } = parseVueSfc(source, { filename: file })
  if (errors.length > 0) {
    throw new Error(`Unable to parse ${relative(file)}: ${errors.map(String).join('; ')}`)
  }
  return [descriptor.script, descriptor.scriptSetup].filter(Boolean)
}

const isQueryFacade = symbol =>
  symbol.classification === 'adapter' && /^(find|get|is)[A-Z]/.test(symbol.exportName)

const isRegistryBackedStaticValue = symbol => {
  if (!symbol || symbol.status !== 'verified' || isQueryFacade(symbol)) return false
  if (/registry-backed|reconstructed from taoyuan:|reconstructed from the .*registry/i.test(symbol.rationale)) {
    return false
  }

  const targetsExistingRegistry = officialRegistryIds.has(symbol.targetRegistry)
  const keepsStaticRollback = /legacy static export|static consumers|rollback path/i.test(symbol.rationale)
  return (
    targetsExistingRegistry && (
      symbol.classification === 'content' ||
      symbol.classification === 'derived' ||
      symbol.syntaxKind === 're-export'
    )
  ) || keepsStaticRollback
}

const classifyDataImport = (symbol, importer) => {
  if (importer === staticAdapterFile) return 'official-adapter-leaf'
  if (isRegistryBackedStaticValue(symbol)) return 'pending-migration-violation'
  if (symbol.classification === 'algorithm') {
    return 'framework-algorithm'
  }
  if (
    symbol.status === 'framework-retained' ||
    symbol.classification === 'derived' ||
    symbol.classification === 'ui'
  ) {
    return 'legal-derived'
  }
  return 'compatibility-fallback'
}

const classifiedRuntimeImports = []
const directReads = []
const unresolvedRuntimeImports = []
const namespaceImports = []

for (const file of walkSourceFiles(srcRoot)) {
  const importer = relative(file)

  for (const block of getScriptBlocks(file)) {
    const sourceFile = ts.createSourceFile(
      importer,
      block.content,
      ts.ScriptTarget.Latest,
      true,
      block.lang === 'js' ? ts.ScriptKind.JS : ts.ScriptKind.TS
    )

    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue
      const dataFile = resolveDataModule(statement.moduleSpecifier.text, file)
      if (!dataFile || !statement.importClause) continue

      const clause = statement.importClause
      if (clause.name && !clause.isTypeOnly) {
        unresolvedRuntimeImports.push({ importer, dataFile, exportName: 'default' })
      }

      const bindings = clause.namedBindings
      if (!bindings) continue
      if (ts.isNamespaceImport(bindings)) {
        if (!clause.isTypeOnly) namespaceImports.push({ importer, dataFile, exportName: '*' })
        continue
      }

      for (const specifier of bindings.elements) {
        if (clause.isTypeOnly || specifier.isTypeOnly) continue
        const exportName = specifier.propertyName?.text ?? specifier.name.text
        const symbol = inventoryByExport.get(`${dataFile}:${exportName}`)
        const finding = { importer, dataFile, exportName }
        if (!symbol) {
          unresolvedRuntimeImports.push(finding)
        } else {
          const auditCategory = classifyDataImport(symbol, importer)
          const classifiedFinding = {
            ...finding,
            auditCategory,
            inventoryStatus: symbol.status,
            classification: symbol.classification,
            targetRegistry: symbol.targetRegistry ?? null,
            migrationPhase: symbol.migrationPhase
          }
          classifiedRuntimeImports.push(classifiedFinding)
          if (auditCategory === 'pending-migration-violation') {
            directReads.push(classifiedFinding)
          }
        }
      }
    }
  }
}

const phase6Symbols = inventorySymbols.filter(symbol => symbol.migrationPhase.includes(6))
const statusCounts = Object.fromEntries(
  [...new Set(phase6Symbols.map(symbol => symbol.status))]
    .sort()
    .map(status => [status, phase6Symbols.filter(symbol => symbol.status === status).length])
)
const provisionalSymbols = phase6Symbols.filter(symbol => isProvisionalInventoryStatus(symbol.status))
const snapshotEntryCount = officialSnapshot.registries.reduce(
  (total, registry) => total + registry.entries.length,
  0
)
const sortedRuntimeImports = classifiedRuntimeImports.sort((a, b) =>
  `${a.importer}:${a.dataFile}:${a.exportName}`.localeCompare(
    `${b.importer}:${b.dataFile}:${b.exportName}`
  )
)
const dataImportCategoryCounts = Object.fromEntries(
  dataImportCategories.map(category => [
    category,
    sortedRuntimeImports.filter(finding => finding.auditCategory === category).length
  ])
)
const strictRequested = process.argv.includes('--strict')
const strictFailures = [
  ...(provisionalSymbols.length > 0
    ? [`inventory-provisional-symbols:${provisionalSymbols.length}`]
    : []),
  ...(unresolvedRuntimeImports.length > 0
    ? [`unresolved-runtime-imports:${unresolvedRuntimeImports.length}`]
    : []),
  ...(namespaceImports.length > 0
    ? [`namespace-runtime-imports:${namespaceImports.length}`]
    : []),
  ...(directReads.length > 0
    ? [`business-static-reads:${directReads.length}`]
    : []),
  ...(officialStartupStatus !== 'PASS'
    ? ['official-startup-semantics']
    : [])
]

const report = {
  inventory: {
    totalSymbols: inventorySymbols.length,
    phase6Symbols: phase6Symbols.length,
    phase6StatusCounts: statusCounts,
    provisionalStatusCount: provisionalSymbols.length,
    provisionalStatuses: PROVISIONAL_INVENTORY_STATUSES
  },
  businessDataImports: {
    status: unresolvedRuntimeImports.length === 0 && namespaceImports.length === 0 ? 'PASS' : 'FAIL',
    count: sortedRuntimeImports.length,
    categories: dataImportCategories,
    categoryCounts: dataImportCategoryCounts,
    findings: sortedRuntimeImports,
    unresolvedRuntimeImports: unresolvedRuntimeImports.sort((a, b) =>
      `${a.importer}:${a.exportName}`.localeCompare(`${b.importer}:${b.exportName}`)
    ),
    namespaceImports
  },
  businessStaticReads: {
    status: directReads.length === 0 ? 'PASS' : 'FAIL',
    count: directReads.length,
    findings: directReads.sort((a, b) =>
      `${a.importer}:${a.exportName}`.localeCompare(`${b.importer}:${b.exportName}`)
    ),
    unresolvedRuntimeImports: unresolvedRuntimeImports.sort((a, b) =>
      `${a.importer}:${a.exportName}`.localeCompare(`${b.importer}:${b.exportName}`)
    ),
    namespaceImports
  },
  officialStartupSemantics: {
    status: officialStartupStatus,
    checks: officialStartupChecks
  },
  officialSnapshot: {
    formatVersion: officialSnapshot.formatVersion,
    registryCount: officialSnapshot.registries.length,
    entryCount: snapshotEntryCount,
    snapshotHash: officialSnapshot.snapshotHash
  },
  strict: {
    requested: strictRequested,
    status: strictFailures.length === 0 ? 'PASS' : 'FAIL',
    failures: strictFailures
  }
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)

if (strictRequested && strictFailures.length > 0) {
  process.exitCode = 1
}
