import { Buffer } from 'node:buffer'
import { lstat, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')

let discoveryModulePromise

const isMissing = error =>
  typeof error === 'object'
  && error !== null
  && 'code' in error
  && error.code === 'ENOENT'

const toEntryKind = stats => {
  if (stats.isFile()) return 'file'
  if (stats.isDirectory()) return 'directory'
  return 'other'
}

export const createNodeDiscoveryFileSystem = () => ({
  async getEntry(filePath) {
    try {
      const stats = await lstat(filePath)
      return {
        name: path.basename(filePath),
        kind: toEntryKind(stats),
        isSymbolicLink: stats.isSymbolicLink()
      }
    } catch (error) {
      if (isMissing(error)) return null
      throw error
    }
  },

  async readDirectory(directoryPath) {
    const entries = await readdir(directoryPath, { withFileTypes: true })
    return entries.map(entry => ({
      name: entry.name,
      kind: entry.isFile() ? 'file' : entry.isDirectory() ? 'directory' : 'other',
      isSymbolicLink: entry.isSymbolicLink()
    }))
  },

  async readTextFile(filePath) {
    return readFile(filePath, 'utf8')
  }
})

export const createSinglePackageDiscoveryFileSystem = (
  packageRoot,
  packageName,
  baseFileSystem = createNodeDiscoveryFileSystem()
) => {
  const resolvedPackageRoot = path.resolve(packageRoot)
  const candidateName = packageName || 'package'
  const virtualCandidateRoot = path.join(resolvedPackageRoot, candidateName)
  const virtualCandidatePrefix = `${virtualCandidateRoot}${path.sep}`

  const mapVirtualPath = filePath => {
    const resolvedPath = path.resolve(filePath)
    if (resolvedPath === virtualCandidateRoot) return resolvedPackageRoot
    if (resolvedPath.startsWith(virtualCandidatePrefix)) {
      return path.join(resolvedPackageRoot, resolvedPath.slice(virtualCandidatePrefix.length))
    }
    return resolvedPath
  }

  return {
    async getEntry(filePath) {
      const resolvedPath = path.resolve(filePath)
      if (resolvedPath === resolvedPackageRoot) {
        return baseFileSystem.getEntry(resolvedPackageRoot)
      }
      if (resolvedPath === virtualCandidateRoot) {
        return {
          name: candidateName,
          kind: 'directory',
          isSymbolicLink: false
        }
      }
      return baseFileSystem.getEntry(mapVirtualPath(filePath))
    },

    async readDirectory(directoryPath) {
      const resolvedPath = path.resolve(directoryPath)
      if (resolvedPath === resolvedPackageRoot) {
        return [
          {
            name: candidateName,
            kind: 'directory',
            isSymbolicLink: false
          }
        ]
      }
      return baseFileSystem.readDirectory(mapVirtualPath(directoryPath))
    },

    async readTextFile(filePath) {
      return baseFileSystem.readTextFile(mapVirtualPath(filePath))
    }
  }
}

const resolveDiscoveryInput = async scanRoot => {
  const baseFileSystem = createNodeDiscoveryFileSystem()
  const rootEntry = await baseFileSystem.getEntry(scanRoot)
  if (rootEntry?.kind === 'directory' && !rootEntry.isSymbolicLink) {
    const manifestEntry = await baseFileSystem.getEntry(path.join(scanRoot, 'manifest.json'))
    if (manifestEntry) {
      return {
        rootDirectory: scanRoot,
        fileSystem: createSinglePackageDiscoveryFileSystem(
          scanRoot,
          path.basename(scanRoot),
          baseFileSystem
        )
      }
    }
  }
  return {
    rootDirectory: scanRoot,
    fileSystem: baseFileSystem
  }
}

const loadDiscoveryModule = async() => {
  discoveryModulePromise ??= (async() => {
    const bundled = await build({
      stdin: {
        contents: [
          "export { discoverThirdPartyDataPacks } from './src/domain/mods/thirdPartyDataPackDiscovery.ts'",
          "export { selectThirdPartyDataPacks } from './src/domain/mods/thirdPartyDataPackSelection.ts'"
        ].join('\n'),
        loader: 'ts',
        resolveDir: projectRoot,
        sourcefile: 'check-third-party-packs-entry.ts'
      },
      bundle: true,
      format: 'esm',
      logLevel: 'silent',
      platform: 'node',
      target: 'node20',
      write: false
    })
    const output = bundled.outputFiles[0]
    if (!output) {
      throw new Error('Failed to bundle third-party discovery entrypoint')
    }
    const url = `data:text/javascript;base64,${Buffer.from(output.text).toString('base64')}`
    return import(url)
  })()
  return discoveryModulePromise
}

const localizedLabel = value => {
  if (!value || typeof value !== 'object') return '(unavailable)'
  if (typeof value.fallback === 'string' && value.fallback.length > 0) return value.fallback
  if (typeof value.key === 'string' && value.key.length > 0) return value.key
  return '(unavailable)'
}

const issueCategory = issue => {
  if (
    issue.kind === 'dependency-missing'
    || issue.kind === 'dependency-version-mismatch'
    || issue.kind === 'optional-dependency-missing'
  ) {
    return 'dependency'
  }
  if (
    issue.kind === 'package-conflict'
    || issue.kind === 'registry-entry-duplicate'
    || issue.kind === 'registry-entry-conflict'
    || issue.kind === 'registry-entry-duplicate-identical'
  ) {
    return 'conflict'
  }
  if (
    issue.kind === 'content-file-missing'
    || issue.kind === 'non-json-file'
    || issue.kind === 'unsupported-registry'
    || issue.kind === 'path-unsafe'
    || issue.kind === 'file-read-failed'
  ) {
    return 'entrypoint'
  }
  if (issue.path.endsWith('/manifest.json') && issue.kind !== 'content-file-missing') return 'manifest'
  if (issue.kind === 'schema-validation-failed') return 'schema'
  if (issue.kind === 'json-parse-failed') return 'json'
  return 'discovery'
}

const formatIssue = issue => {
  const lines = [
    `  - [${issue.kind}] ${issue.path}`,
    `    category: ${issueCategory(issue)}`,
    `    severity: ${issue.severity}`,
    `    reason: ${issue.reason}`
  ]
  if (issue.candidatePath) lines.push(`    packagePath: ${issue.candidatePath}`)
  if (issue.packageId) lines.push(`    packageId: ${issue.packageId}`)
  if (issue.registryId) lines.push(`    registryId: ${issue.registryId}`)
  if (issue.contentId) lines.push(`    contentId: ${issue.contentId}`)
  if (issue.relatedPackageIds?.length) lines.push(`    relatedPackageIds: ${issue.relatedPackageIds.join(', ')}`)
  if (issue.fieldPath) lines.push(`    fieldPath: ${issue.fieldPath}`)
  if (issue.diagnostics.length > 0) {
    for (const diagnostic of issue.diagnostics) {
      lines.push(`    diagnostic: ${diagnostic.code} (${diagnostic.stage})`)
      if (diagnostic.fieldPath && diagnostic.fieldPath !== issue.fieldPath) {
        lines.push(`      diagnosticFieldPath: ${diagnostic.fieldPath}`)
      }
      if (diagnostic.details) {
        lines.push(`      details: ${JSON.stringify(diagnostic.details)}`)
      }
    }
  }
  return lines.join('\n')
}

const selectionIssueCategory = issue => {
  if (issue.kind === 'dependency-cycle' || issue.kind === 'required-dependency-blocked') return 'dependency'
  if (issue.kind === 'duplicate-package-id') return 'conflict'
  return 'selection'
}

const formatSelectionIssue = issue => {
  const lines = [
    `  - [${issue.kind}] ${issue.path}`,
    `    category: ${selectionIssueCategory(issue)}`,
    `    severity: ${issue.severity}`,
    `    reason: ${issue.reason}`,
    `    packagePath: ${issue.candidatePath}`,
    `    packageId: ${issue.packageId}`
  ]
  if (issue.relatedPackageIds?.length) lines.push(`    relatedPackageIds: ${issue.relatedPackageIds.join(', ')}`)
  if (issue.fieldPath) lines.push(`    fieldPath: ${issue.fieldPath}`)
  if (issue.diagnostics.length > 0) {
    for (const diagnostic of issue.diagnostics) {
      lines.push(`    diagnostic: ${diagnostic.code} (${diagnostic.stage})`)
      if (diagnostic.fieldPath && diagnostic.fieldPath !== issue.fieldPath) {
        lines.push(`      diagnosticFieldPath: ${diagnostic.fieldPath}`)
      }
      if (diagnostic.details) {
        lines.push(`      details: ${JSON.stringify(diagnostic.details)}`)
      }
    }
  }
  return lines.join('\n')
}

const reportHasFailure = (report, selectionReport) =>
  report.status !== 'completed'
  || report.issues.some(issue => issue.severity === 'error' || issue.severity === 'fatal')
  || Boolean(selectionReport?.issues.some(issue => issue.severity === 'error' || issue.severity === 'fatal'))

const formatCandidate = candidate => {
  const manifest = candidate.manifest
  const lines = [
    `Package: ${candidate.path}`,
    `  status: ${candidate.status}`,
    `  id: ${candidate.packageId ?? '(unavailable)'}`,
    `  name: ${manifest ? localizedLabel(manifest.name) : '(unavailable)'}`,
    `  version: ${manifest?.version ?? '(unavailable)'}`,
    `  contentFiles: ${candidate.contentFiles.length}`
  ]
  for (const file of candidate.contentFiles) {
    lines.push(`    - ${file.registryId}: ${file.path} (${file.entryCount} entries)`)
  }
  if (candidate.issues.length > 0) {
    const categoryCounts = new Map()
    for (const issue of candidate.issues) {
      const category = issueCategory(issue)
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
    }
    lines.push('  issueSummary:')
    for (const [category, count] of [...categoryCounts.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(`    ${category}: ${count}`)
    }
    lines.push('  issues:')
    for (const issue of candidate.issues) {
      lines.push(formatIssue(issue).replace(/^/gm, '  '))
    }
  }
  return lines.join('\n')
}

const formatSelectionReport = selectionReport => {
  const lines = [
    'Selection:',
    `  status: ${selectionReport.status}`,
    `  selectedPackages: ${selectionReport.summary.selectedPackageCount}`,
    `  blockedPackages: ${selectionReport.summary.blockedPackageCount}`,
    `  selectionIssues: ${selectionReport.summary.issueCount}`
  ]

  if (selectionReport.selectedPackages.length > 0) {
    lines.push('  loadOrder:')
    selectionReport.selectedPackages.forEach((selectedPackage, index) => {
      lines.push(`    ${index + 1}. ${selectedPackage.packageId}@${selectedPackage.version} (${selectedPackage.path})`)
    })
  } else {
    lines.push('  loadOrder: (empty)')
  }

  if (selectionReport.blockedPackages.length > 0) {
    lines.push('  blocked:')
    for (const blockedPackage of selectionReport.blockedPackages) {
      lines.push(`    - ${blockedPackage.packageId ?? '(unavailable)'} (${blockedPackage.path})`)
      if (blockedPackage.version) lines.push(`      version: ${blockedPackage.version}`)
      lines.push(`      reasons: ${blockedPackage.reasons.join(', ')}`)
      if (blockedPackage.discoveryIssues.length > 0) {
        lines.push(`      discoveryIssues: ${blockedPackage.discoveryIssues.map(issue => issue.kind).join(', ')}`)
      }
      if (blockedPackage.selectionIssues.length > 0) {
        lines.push(`      selectionIssues: ${blockedPackage.selectionIssues.map(issue => issue.kind).join(', ')}`)
      }
    }
  }

  if (selectionReport.issues.length > 0) {
    lines.push('  issues:')
    for (const issue of selectionReport.issues) {
      lines.push(formatSelectionIssue(issue).replace(/^/gm, '  '))
    }
  }

  return lines.join('\n')
}

export const formatDiscoveryReport = (scanRoot, report, selectionReport) => {
  const lines = [
    'Taoyuan third-party data pack check',
    `Scan root: ${scanRoot}`,
    `Discovery status: ${report.status}`,
    `Scanned entries: ${report.summary.scannedEntries}`,
    `Discovered packages: ${report.summary.candidateCount}`,
    `Valid packages: ${report.summary.validPackageCount}`,
    `Invalid packages: ${report.summary.invalidPackageCount}`,
    `Issues: ${report.summary.issueCount}`
  ]

  const rootIssues = report.issues.filter(issue => !issue.candidatePath)
  if (rootIssues.length > 0) {
    lines.push('', 'Root issues:')
    for (const issue of rootIssues) lines.push(formatIssue(issue))
  }

  if (report.candidates.length > 0) {
    lines.push('', 'Packages:')
    for (const candidate of report.candidates) {
      lines.push(formatCandidate(candidate))
    }
  }

  if (selectionReport) {
    lines.push('', formatSelectionReport(selectionReport))
  }

  lines.push('', `Result: ${reportHasFailure(report, selectionReport) ? 'FAILED' : 'OK'}`)

  return `${lines.join('\n')}\n`
}

export const exitCodeForReport = (report, selectionReport) =>
  reportHasFailure(report, selectionReport) ? 1 : 0

const usage = () => [
  'Usage: pnpm run mod:check-packs -- <directory>',
  '',
  'Checks a third-party data pack directory or discovery root in read-only mode.',
  'A discovery root may contain one or more package directories.'
].join('\n')

const parseArguments = argv => {
  const positional = []
  for (const argument of argv) {
    if (argument === '--help' || argument === '-h') {
      return { ok: true, help: true }
    }
    if (argument.startsWith('-')) {
      return { ok: false, message: `Unknown option: ${argument}` }
    }
    positional.push(argument)
  }
  if (positional.length !== 1) {
    return { ok: false, message: 'Expected exactly one directory argument' }
  }
  return { ok: true, directory: positional[0] }
}

export const runCheckPacksCli = async(argv, streams = {}) => {
  const stdout = streams.stdout ?? process.stdout
  const stderr = streams.stderr ?? process.stderr
  const parsed = parseArguments(argv)
  if (!parsed.ok) {
    stderr.write(`${parsed.message}\n\n${usage()}\n`)
    return 2
  }
  if (parsed.help) {
    stdout.write(`${usage()}\n`)
    return 0
  }

  const scanRoot = path.resolve(process.cwd(), parsed.directory)
  try {
    const { discoverThirdPartyDataPacks, selectThirdPartyDataPacks } = await loadDiscoveryModule()
    const discoveryInput = await resolveDiscoveryInput(scanRoot)
    const report = await discoverThirdPartyDataPacks(discoveryInput.rootDirectory, discoveryInput.fileSystem)
    const selectionReport = selectThirdPartyDataPacks(report)
    stdout.write(formatDiscoveryReport(scanRoot, report, selectionReport))
    return exitCodeForReport(report, selectionReport)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    stderr.write(`Failed to check third-party data packs: ${message}\n`)
    return 1
  }
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  runCheckPacksCli(process.argv.slice(2))
    .then(exitCode => {
      process.exitCode = exitCode
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : String(error)
      process.stderr.write(`Failed to check third-party data packs: ${message}\n`)
      process.exitCode = 1
    })
}
