import { Buffer } from 'node:buffer'
import { lstat, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { createTaoyuanAliasPlugin } from './esbuild-taoyuan-alias.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')
const cliContentSourceRootPath = 'packs'

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

const normalizeNodeSourcePath = sourcePath => {
  const normalizedPath = sourcePath.replace(/\\/g, '/')
  if (normalizedPath === '') return ''
  if (
    path.isAbsolute(sourcePath)
    || normalizedPath.startsWith('/')
    || normalizedPath.split('/').includes('..')
  ) {
    throw new Error(`Unsafe content package source path: ${sourcePath}`)
  }
  return normalizedPath
}

const joinResolvedSourcePath = (rootDirectory, sourcePath) =>
  sourcePath === ''
    ? rootDirectory
    : path.join(rootDirectory, ...sourcePath.split('/'))

const toContentPackageSourceEntry = (name, stats) => ({
  name,
  kind: toEntryKind(stats),
  isSymbolicLink: stats.isSymbolicLink()
})

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

export const createNodeContentPackageSource = ({
  contractVersion,
  rootDirectory,
  sourceId,
  rootPath = cliContentSourceRootPath,
  packageName
}) => {
  const resolvedRoot = path.resolve(rootDirectory)
  const virtualPackageName = packageName || 'package'
  const virtualPackagePrefix = `${virtualPackageName}/`
  let disposed = false

  const assertAvailable = () => {
    if (disposed) {
      throw new Error('Content package source has been disposed')
    }
  }

  const mapSourcePath = sourcePath => {
    const normalizedPath = normalizeNodeSourcePath(sourcePath)
    if (!packageName) return joinResolvedSourcePath(resolvedRoot, normalizedPath)
    if (normalizedPath === '' || normalizedPath === virtualPackageName) return resolvedRoot
    if (normalizedPath.startsWith(virtualPackagePrefix)) {
      return joinResolvedSourcePath(resolvedRoot, normalizedPath.slice(virtualPackagePrefix.length))
    }
    return joinResolvedSourcePath(resolvedRoot, normalizedPath)
  }

  return {
    identity: {
      contractVersion,
      kind: 'developer-cli-directory',
      sourceId,
      rootPath
    },

    async getEntry(sourcePath) {
      assertAvailable()
      const normalizedPath = normalizeNodeSourcePath(sourcePath)
      if (packageName && normalizedPath === '') {
        return {
          name: rootPath,
          kind: 'directory',
          isSymbolicLink: false
        }
      }
      try {
        const filePath = mapSourcePath(normalizedPath)
        const stats = await lstat(filePath)
        const name = packageName && normalizedPath === virtualPackageName
          ? virtualPackageName
          : path.basename(filePath)
        return toContentPackageSourceEntry(name, stats)
      } catch (error) {
        if (isMissing(error)) return null
        throw error
      }
    },

    async readDirectory(sourcePath) {
      assertAvailable()
      const normalizedPath = normalizeNodeSourcePath(sourcePath)
      if (packageName && normalizedPath === '') {
        return [
          {
            name: virtualPackageName,
            kind: 'directory',
            isSymbolicLink: false
          }
        ]
      }

      const directoryPath = mapSourcePath(normalizedPath)
      const entries = await readdir(directoryPath, { withFileTypes: true })
      return entries.map(entry => ({
        name: entry.name,
        kind: entry.isFile() ? 'file' : entry.isDirectory() ? 'directory' : 'other',
        isSymbolicLink: entry.isSymbolicLink()
      }))
    },

    async readTextFile(sourcePath) {
      assertAvailable()
      return readFile(mapSourcePath(sourcePath), 'utf8')
    },

    async dispose() {
      disposed = true
    }
  }
}

const resolveDiscoveryInput = async(scanRoot, sourceContract) => {
  const baseFileSystem = createNodeDiscoveryFileSystem()
  const rootEntry = await baseFileSystem.getEntry(scanRoot)
  const sourceOptions = {
    contractVersion: sourceContract.CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
    rootDirectory: scanRoot,
    sourceId: 'developer-cli/discovery-root',
    rootPath: cliContentSourceRootPath
  }

  if (rootEntry?.kind === 'directory' && !rootEntry.isSymbolicLink) {
    const manifestEntry = await baseFileSystem.getEntry(path.join(scanRoot, 'manifest.json'))
    if (manifestEntry) {
      const source = createNodeContentPackageSource({
        ...sourceOptions,
        sourceId: 'developer-cli/single-package',
        packageName: path.basename(scanRoot)
      })
      return {
        rootDirectory: source.identity.rootPath,
        fileSystem: sourceContract.createDiscoveryFileSystemFromContentPackageSource(source),
        source
      }
    }
  }

  const source = createNodeContentPackageSource(sourceOptions)
  return {
    rootDirectory: source.identity.rootPath,
    fileSystem: sourceContract.createDiscoveryFileSystemFromContentPackageSource(source),
    source
  }
}

const loadDiscoveryModule = async() => {
  discoveryModulePromise ??= (async() => {
    const bundled = await build({
      stdin: {
        contents: [
          "export { discoverThirdPartyDataPacks } from './src/domain/mods/thirdPartyDataPackDiscovery.ts'",
          "export { selectThirdPartyDataPacks } from './src/domain/mods/thirdPartyDataPackSelection.ts'",
          "export { buildThirdPartyCandidateRegistrySnapshot } from './src/domain/mods/thirdPartyCandidateRegistrySnapshot.ts'",
          "export { createThirdPartyDataPackLockfileDraft, validateThirdPartyDataPackLockfileDraft } from './src/domain/mods/thirdPartyDataPackLockfileDraft.ts'",
          "export { buildThirdPartyDataPackRepairReport } from './src/domain/mods/thirdPartyDataPackRepairReport.ts'",
          "export { buildThirdPartyDataPackMountPreflight } from './src/domain/mods/thirdPartyDataPackMountPreflight.ts'",
          "export { buildThirdPartyDataPackMountInput } from './src/domain/mods/thirdPartyDataPackMountInput.ts'",
          "export { buildThirdPartyDataPackRuntimeMountGate } from './src/domain/mods/thirdPartyDataPackRuntimeMountGate.ts'",
          "export { buildThirdPartyDataPackTransactionPreflight } from './src/domain/mods/thirdPartyDataPackTransactionPreflight.ts'",
          "export { buildThirdPartyDataPackRuntimeAdapterGate } from './src/domain/mods/thirdPartyDataPackRuntimeAdapterGate.ts'",
          "export { buildThirdPartyDataPackSourceAdapterGate } from './src/domain/mods/thirdPartyDataPackSourceAdapterGate.ts'",
          "export { CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION, createDiscoveryFileSystemFromContentPackageSource } from './src/domain/mods/contentPackageSource.ts'",
          "export { buildOfficialRegistrySetFromStaticData } from './src/domain/mods/staticAdapters.ts'"
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
      plugins: [createTaoyuanAliasPlugin(projectRoot)],
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

const reportHasFailure = (
  report,
  selectionReport,
  repairReport,
  candidateSnapshotReport,
  lockfileDraftReport,
  mountPreflightReport,
  mountInputReport,
  runtimeMountGateReport,
  transactionPreflightReport,
  runtimeAdapterGateReport,
  sourceAdapterGateReport
) =>
  report.status !== 'completed'
  || report.issues.some(issue => issue.severity === 'error' || issue.severity === 'fatal')
  || Boolean(selectionReport?.issues.some(issue => issue.severity === 'error' || issue.severity === 'fatal'))
  || repairReport?.status === 'blocked'
  || Boolean(repairReport?.diagnostics.some(diagnostic =>
    diagnostic.severity === 'error' || diagnostic.severity === 'fatal'
  ))
  || candidateSnapshotReport?.status === 'invalid'
  || Boolean(candidateSnapshotReport?.diagnostics.some(diagnostic =>
    diagnostic.severity === 'error' || diagnostic.severity === 'fatal'
  ))
  || lockfileDraftReport?.draftResult.status === 'invalid'
  || lockfileDraftReport?.validationResult.status === 'invalid'
  || Boolean(lockfileDraftReport?.draftResult.diagnostics.some(diagnostic =>
    diagnostic.severity === 'error' || diagnostic.severity === 'fatal'
  ))
  || Boolean(lockfileDraftReport?.validationResult.diagnostics.some(diagnostic =>
    diagnostic.severity === 'error' || diagnostic.severity === 'fatal'
  ))
  || mountPreflightReport?.status === 'rolled-back'
  || Boolean(mountPreflightReport?.diagnostics.some(diagnostic =>
    diagnostic.severity === 'error' || diagnostic.severity === 'fatal'
  ))
  || mountInputReport?.status === 'blocked'
  || Boolean(mountInputReport?.diagnostics.some(diagnostic =>
    diagnostic.severity === 'error' || diagnostic.severity === 'fatal'
  ))
  || runtimeMountGateReport?.status === 'blocked'
  || Boolean(runtimeMountGateReport?.diagnostics.some(diagnostic =>
    diagnostic.severity === 'error' || diagnostic.severity === 'fatal'
  ))
  || transactionPreflightReport?.status === 'blocked'
  || Boolean(transactionPreflightReport?.diagnostics.some(diagnostic =>
    diagnostic.severity === 'error' || diagnostic.severity === 'fatal'
  ))
  || runtimeAdapterGateReport?.status === 'blocked'
  || Boolean(runtimeAdapterGateReport?.diagnostics.some(diagnostic =>
    diagnostic.severity === 'error' || diagnostic.severity === 'fatal'
  ))
  || sourceAdapterGateReport?.status === 'blocked'
  || Boolean(sourceAdapterGateReport?.diagnostics.some(diagnostic =>
    diagnostic.severity === 'error' || diagnostic.severity === 'fatal'
  ))

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

const formatRepairReport = repairReport => {
  const lines = [
    'Repair Report:',
    `  status: ${repairReport.status}`,
    `  candidateCount: ${repairReport.summary.candidateCount}`,
    `  whitelistedActions: ${repairReport.summary.whitelistedActionCount}`,
    `  blockedActions: ${repairReport.summary.blockedActionCount}`,
    `  stagedNormalizedResultMutated: ${repairReport.effects.stagedNormalizedResultMutated}`,
    `  packageFilesWritten: ${repairReport.effects.packageFilesWritten}`,
    `  registryPublished: ${repairReport.effects.registryPublished}`,
    `  lockfileWritten: ${repairReport.effects.lockfileWritten}`,
    `  settingsWritten: ${repairReport.effects.settingsWritten}`,
    `  savesWritten: ${repairReport.effects.savesWritten}`,
    `  cacheWritten: ${repairReport.effects.cacheWritten}`
  ]

  if (repairReport.actions.length > 0) {
    lines.push('  actions:')
    for (const action of repairReport.actions.slice(0, 20)) {
      lines.push(`    - ${action.ruleId}`)
      lines.push(`      decision: ${action.decision}`)
      if (action.packagePath) lines.push(`      packagePath: ${action.packagePath}`)
      if (action.packageId) lines.push(`      packageId: ${action.packageId}`)
      lines.push(`      file: ${action.file}`)
      lines.push(`      fieldPath: ${action.fieldPath}`)
      lines.push(`      before: ${action.beforeSummary}`)
      lines.push(`      after: ${action.afterSummary}`)
      lines.push(`      reason: ${action.reason}`)
      if (action.diagnostics.length > 0) {
        lines.push(`      diagnostics: ${action.diagnostics.map(diagnostic => diagnostic.code).join(', ')}`)
      }
    }
    if (repairReport.actions.length > 20) {
      lines.push(`    ... ${repairReport.actions.length - 20} more action(s)`)
    }
  }

  return lines.join('\n')
}

const formatDiagnostic = diagnostic => {
  const lines = [
    `  - ${diagnostic.code} (${diagnostic.stage})`,
    `    severity: ${diagnostic.severity}`
  ]
  if (diagnostic.packageId) lines.push(`    packageId: ${diagnostic.packageId}`)
  if (diagnostic.file) lines.push(`    file: ${diagnostic.file}`)
  if (diagnostic.registryId) lines.push(`    registryId: ${diagnostic.registryId}`)
  if (diagnostic.contentId) lines.push(`    contentId: ${diagnostic.contentId}`)
  if (diagnostic.relatedPackageIds?.length) lines.push(`    relatedPackageIds: ${diagnostic.relatedPackageIds.join(', ')}`)
  if (diagnostic.fieldPath) lines.push(`    fieldPath: ${diagnostic.fieldPath}`)
  if (diagnostic.details) lines.push(`    details: ${JSON.stringify(diagnostic.details)}`)
  return lines.join('\n')
}

const formatCandidateSnapshotReport = candidateSnapshotReport => {
  const lines = [
    'Candidate Snapshot:',
    `  status: ${candidateSnapshotReport.status}`,
    `  registryCount: ${candidateSnapshotReport.registryCount}`,
    `  entryCount: ${candidateSnapshotReport.entryCount}`,
    `  selectedPackageIds: ${candidateSnapshotReport.selectedPackageIds.length > 0 ? candidateSnapshotReport.selectedPackageIds.join(', ') : '(empty)'}`,
    `  blockedPackageIds: ${candidateSnapshotReport.blockedPackageIds.length > 0 ? candidateSnapshotReport.blockedPackageIds.join(', ') : '(empty)'}`,
    `  loadOrder: ${candidateSnapshotReport.loadOrder.length > 0 ? candidateSnapshotReport.loadOrder.join(', ') : '(empty)'}`,
    `  officialSnapshotHash: ${candidateSnapshotReport.officialIdentity.snapshotHash}`
  ]
  if (candidateSnapshotReport.candidateIdentity) {
    lines.push(`  candidateSnapshotHash: ${candidateSnapshotReport.candidateIdentity.snapshotHash}`)
    lines.push(`  candidateContentHash: ${candidateSnapshotReport.candidateIdentity.contentHash}`)
    lines.push(`  candidateHash: ${candidateSnapshotReport.candidateIdentity.candidateHash}`)
  }

  const blockingDiagnostics = candidateSnapshotReport.diagnostics.filter(diagnostic =>
    diagnostic.severity === 'error' || diagnostic.severity === 'fatal'
  )
  const visibleDiagnostics = blockingDiagnostics.length > 0
    ? blockingDiagnostics
    : candidateSnapshotReport.diagnostics.filter(diagnostic => diagnostic.severity === 'warning')
  if (visibleDiagnostics.length > 0) {
    lines.push('  diagnostics:')
    for (const diagnostic of visibleDiagnostics.slice(0, 20)) {
      lines.push(formatDiagnostic(diagnostic).replace(/^/gm, '  '))
    }
    if (visibleDiagnostics.length > 20) {
      lines.push(`    ... ${visibleDiagnostics.length - 20} more diagnostic(s)`)
    }
  }
  return lines.join('\n')
}

const formatLockfileDraftReport = lockfileDraftReport => {
  const { draftResult, validationResult } = lockfileDraftReport
  const lines = [
    'Lockfile Draft:',
    `  status: ${draftResult.status}`,
    `  validationStatus: ${validationResult.status}`,
    `  registryCount: ${draftResult.registryCount}`,
    `  entryCount: ${draftResult.entryCount}`,
    `  selectedPackageIds: ${draftResult.selectedPackageIds.length > 0 ? draftResult.selectedPackageIds.join(', ') : '(empty)'}`,
    `  loadOrder: ${draftResult.loadOrder.length > 0 ? draftResult.loadOrder.join(', ') : '(empty)'}`,
    `  officialSnapshotHash: ${draftResult.officialIdentity.snapshotHash}`
  ]
  if (draftResult.draft) {
    lines.push(`  formatVersion: ${draftResult.draft.formatVersion}`)
    lines.push(`  packageCount: ${draftResult.draft.packages.length}`)
    lines.push(`  lockfileHash: ${draftResult.draft.lockfileHash}`)
    lines.push(`  candidateHash: ${draftResult.draft.candidateIdentity.candidateHash}`)
    lines.push('  packages:')
    for (const pkg of draftResult.draft.packages) {
      lines.push(`    - ${pkg.packageId}@${pkg.version}`)
      lines.push(`      loadIndex: ${pkg.loadIndex}`)
      lines.push(`      sourcePath: ${pkg.source.candidatePath}`)
      lines.push(`      manifestHash: ${pkg.manifestHash}`)
      lines.push(`      contentHash: ${pkg.contentHash}`)
      lines.push(`      resolvedDependencies: ${pkg.resolvedDependencies.length > 0 ? pkg.resolvedDependencies.join(', ') : '(empty)'}`)
    }
  }

  const visibleDiagnostics = [
    ...draftResult.diagnostics,
    ...validationResult.diagnostics
  ].filter(diagnostic => diagnostic.severity === 'error' || diagnostic.severity === 'fatal')
  const uniqueVisibleDiagnostics = []
  const visibleDiagnosticKeys = new Set()
  for (const diagnostic of visibleDiagnostics) {
    const key = JSON.stringify({
      code: diagnostic.code,
      stage: diagnostic.stage,
      packageId: diagnostic.packageId,
      file: diagnostic.file,
      fieldPath: diagnostic.fieldPath,
      details: diagnostic.details
    })
    if (visibleDiagnosticKeys.has(key)) continue
    visibleDiagnosticKeys.add(key)
    uniqueVisibleDiagnostics.push(diagnostic)
  }
  if (uniqueVisibleDiagnostics.length > 0) {
    lines.push('  diagnostics:')
    for (const diagnostic of uniqueVisibleDiagnostics.slice(0, 20)) {
      lines.push(formatDiagnostic(diagnostic).replace(/^/gm, '  '))
    }
    if (uniqueVisibleDiagnostics.length > 20) {
      lines.push(`    ... ${uniqueVisibleDiagnostics.length - 20} more diagnostic(s)`)
    }
  }
  return lines.join('\n')
}

const formatMountPreflightReport = mountPreflightReport => {
  const lines = [
    'Mount Preflight:',
    `  status: ${mountPreflightReport.status}`,
    `  registryCount: ${mountPreflightReport.registryCount}`,
    `  entryCount: ${mountPreflightReport.entryCount}`,
    `  selectedPackageIds: ${mountPreflightReport.selectedPackageIds.length > 0 ? mountPreflightReport.selectedPackageIds.join(', ') : '(empty)'}`,
    `  blockedPackageIds: ${mountPreflightReport.blockedPackageIds.length > 0 ? mountPreflightReport.blockedPackageIds.join(', ') : '(empty)'}`,
    `  loadOrder: ${mountPreflightReport.loadOrder.length > 0 ? mountPreflightReport.loadOrder.join(', ') : '(empty)'}`,
    `  packageCount: ${mountPreflightReport.packageCount}`,
    `  rollbackRequired: ${mountPreflightReport.rollback.required}`,
    `  rollbackReason: ${mountPreflightReport.rollback.reason}`,
    `  candidatePublished: ${mountPreflightReport.effects.thirdPartyRegistryPublished}`,
    `  lockfileWritten: ${mountPreflightReport.effects.lockfileWritten}`,
    `  settingsWritten: ${mountPreflightReport.effects.settingsWritten}`,
    `  savesWritten: ${mountPreflightReport.effects.savesWritten}`
  ]
  if (mountPreflightReport.candidateIdentity) {
    lines.push(`  candidateHash: ${mountPreflightReport.candidateIdentity.candidateHash}`)
  }
  if (mountPreflightReport.lockfileHash) {
    lines.push(`  lockfileHash: ${mountPreflightReport.lockfileHash}`)
  }
  lines.push('  stages:')
  for (const stage of mountPreflightReport.stages) {
    lines.push(`    - ${stage.name}: ${stage.status}`)
    if (stage.details) {
      for (const [key, value] of Object.entries(stage.details)) {
        lines.push(`      ${key}: ${value}`)
      }
    }
  }

  const visibleDiagnostics = mountPreflightReport.diagnostics
    .filter(diagnostic => diagnostic.severity === 'error' || diagnostic.severity === 'fatal')
  if (visibleDiagnostics.length > 0) {
    lines.push('  diagnostics:')
    for (const diagnostic of visibleDiagnostics.slice(0, 20)) {
      lines.push(formatDiagnostic(diagnostic).replace(/^/gm, '  '))
    }
    if (visibleDiagnostics.length > 20) {
      lines.push(`    ... ${visibleDiagnostics.length - 20} more diagnostic(s)`)
    }
  }
  return lines.join('\n')
}

const formatMountInputReport = mountInputReport => {
  const lines = [
    'Mount Input:',
    `  status: ${mountInputReport.status}`,
    `  preflightStatus: ${mountInputReport.preflightStatus}`,
    `  reason: ${mountInputReport.reason}`,
    `  registryCount: ${mountInputReport.registryCount}`,
    `  entryCount: ${mountInputReport.entryCount}`,
    `  selectedPackageIds: ${mountInputReport.selectedPackageIds.length > 0 ? mountInputReport.selectedPackageIds.join(', ') : '(empty)'}`,
    `  blockedPackageIds: ${mountInputReport.blockedPackageIds.length > 0 ? mountInputReport.blockedPackageIds.join(', ') : '(empty)'}`,
    `  loadOrder: ${mountInputReport.loadOrder.length > 0 ? mountInputReport.loadOrder.join(', ') : '(empty)'}`,
    `  packageCount: ${mountInputReport.packageCount}`,
    `  runtimePublication: ${mountInputReport.runtimePublication}`,
    `  candidateRegistryAvailable: ${Boolean(mountInputReport.candidateRegistrySet)}`,
    `  candidateSnapshotAvailable: ${Boolean(mountInputReport.candidateSnapshot)}`,
    `  lockfileDraftAvailable: ${Boolean(mountInputReport.lockfileDraft)}`,
    `  candidatePublished: ${mountInputReport.effects.thirdPartyRegistryPublished}`,
    `  lockfileWritten: ${mountInputReport.effects.lockfileWritten}`,
    `  settingsWritten: ${mountInputReport.effects.settingsWritten}`,
    `  savesWritten: ${mountInputReport.effects.savesWritten}`
  ]
  if (mountInputReport.candidateIdentity) {
    lines.push(`  candidateHash: ${mountInputReport.candidateIdentity.candidateHash}`)
  }
  if (mountInputReport.lockfileHash) {
    lines.push(`  lockfileHash: ${mountInputReport.lockfileHash}`)
  }

  const visibleDiagnostics = mountInputReport.diagnostics
    .filter(diagnostic => diagnostic.severity === 'error' || diagnostic.severity === 'fatal')
  if (visibleDiagnostics.length > 0) {
    lines.push('  diagnostics:')
    for (const diagnostic of visibleDiagnostics.slice(0, 20)) {
      lines.push(formatDiagnostic(diagnostic).replace(/^/gm, '  '))
    }
    if (visibleDiagnostics.length > 20) {
      lines.push(`    ... ${visibleDiagnostics.length - 20} more diagnostic(s)`)
    }
  }
  return lines.join('\n')
}

const formatRuntimeMountGateReport = runtimeMountGateReport => {
  const lines = [
    'Runtime Mount Gate:',
    `  status: ${runtimeMountGateReport.status}`,
    `  mountInputStatus: ${runtimeMountGateReport.mountInputStatus}`,
    `  reason: ${runtimeMountGateReport.reason}`,
    `  registryCount: ${runtimeMountGateReport.registryCount}`,
    `  entryCount: ${runtimeMountGateReport.entryCount}`,
    `  selectedPackageIds: ${runtimeMountGateReport.selectedPackageIds.length > 0 ? runtimeMountGateReport.selectedPackageIds.join(', ') : '(empty)'}`,
    `  blockedPackageIds: ${runtimeMountGateReport.blockedPackageIds.length > 0 ? runtimeMountGateReport.blockedPackageIds.join(', ') : '(empty)'}`,
    `  loadOrder: ${runtimeMountGateReport.loadOrder.length > 0 ? runtimeMountGateReport.loadOrder.join(', ') : '(empty)'}`,
    `  packageCount: ${runtimeMountGateReport.packageCount}`,
    `  runtimePublication: ${runtimeMountGateReport.runtimePublication}`,
    `  requiredGates: ${runtimeMountGateReport.requiredGates.length}`,
    `  candidatePublished: ${runtimeMountGateReport.effects.thirdPartyRegistryPublished}`,
    `  lockfileWritten: ${runtimeMountGateReport.effects.lockfileWritten}`,
    `  settingsWritten: ${runtimeMountGateReport.effects.settingsWritten}`,
    `  savesWritten: ${runtimeMountGateReport.effects.savesWritten}`,
    `  transactionLogWritten: ${runtimeMountGateReport.effects.transactionLogWritten}`
  ]
  if (runtimeMountGateReport.candidateIdentity) {
    lines.push(`  candidateHash: ${runtimeMountGateReport.candidateIdentity.candidateHash}`)
  }
  if (runtimeMountGateReport.lockfileHash) {
    lines.push(`  lockfileHash: ${runtimeMountGateReport.lockfileHash}`)
  }
  if (runtimeMountGateReport.requiredGates.length > 0) {
    lines.push('  gates:')
    for (const requirement of runtimeMountGateReport.requiredGates) {
      lines.push(`    - ${requirement.id}: ${requirement.status}`)
      lines.push(`      reason: ${requirement.reason}`)
    }
  }

  const visibleDiagnostics = runtimeMountGateReport.diagnostics
    .filter(diagnostic => diagnostic.severity === 'error' || diagnostic.severity === 'fatal')
  if (visibleDiagnostics.length > 0) {
    lines.push('  diagnostics:')
    for (const diagnostic of visibleDiagnostics.slice(0, 20)) {
      lines.push(formatDiagnostic(diagnostic).replace(/^/gm, '  '))
    }
    if (visibleDiagnostics.length > 20) {
      lines.push(`    ... ${visibleDiagnostics.length - 20} more diagnostic(s)`)
    }
  }
  return lines.join('\n')
}

const formatTransactionPreflightReport = transactionPreflightReport => {
  const lines = [
    'Transaction Preflight:',
    `  status: ${transactionPreflightReport.status}`,
    `  runtimeGateStatus: ${transactionPreflightReport.runtimeGateStatus}`,
    `  reason: ${transactionPreflightReport.reason}`,
    `  registryCount: ${transactionPreflightReport.registryCount}`,
    `  entryCount: ${transactionPreflightReport.entryCount}`,
    `  selectedPackageIds: ${transactionPreflightReport.selectedPackageIds.length > 0 ? transactionPreflightReport.selectedPackageIds.join(', ') : '(empty)'}`,
    `  blockedPackageIds: ${transactionPreflightReport.blockedPackageIds.length > 0 ? transactionPreflightReport.blockedPackageIds.join(', ') : '(empty)'}`,
    `  loadOrder: ${transactionPreflightReport.loadOrder.length > 0 ? transactionPreflightReport.loadOrder.join(', ') : '(empty)'}`,
    `  packageCount: ${transactionPreflightReport.packageCount}`,
    `  transactionCommit: ${transactionPreflightReport.transactionCommit}`,
    `  commitAllowed: ${transactionPreflightReport.commitAllowed}`,
    `  recoveryRequired: ${transactionPreflightReport.recoveryRequired}`,
    `  rollbackRequired: ${transactionPreflightReport.rollbackRequired}`,
    `  requiredTransactions: ${transactionPreflightReport.requiredTransactions.length}`,
    `  lifecycleOperations: ${transactionPreflightReport.lifecycleOperations.length}`,
    `  candidatePublished: ${transactionPreflightReport.effects.thirdPartyRegistryPublished}`,
    `  packageFilesWritten: ${transactionPreflightReport.effects.packageFilesWritten}`,
    `  packageBackupsWritten: ${transactionPreflightReport.effects.packageBackupsWritten}`,
    `  lockfileWritten: ${transactionPreflightReport.effects.lockfileWritten}`,
    `  settingsWritten: ${transactionPreflightReport.effects.settingsWritten}`,
    `  savesWritten: ${transactionPreflightReport.effects.savesWritten}`,
    `  cacheWritten: ${transactionPreflightReport.effects.cacheWritten}`,
    `  transactionLogWritten: ${transactionPreflightReport.effects.transactionLogWritten}`
  ]
  if (transactionPreflightReport.candidateIdentity) {
    lines.push(`  candidateHash: ${transactionPreflightReport.candidateIdentity.candidateHash}`)
  }
  if (transactionPreflightReport.lockfileHash) {
    lines.push(`  lockfileHash: ${transactionPreflightReport.lockfileHash}`)
  }
  if (transactionPreflightReport.requiredTransactions.length > 0) {
    lines.push('  transactions:')
    for (const requirement of transactionPreflightReport.requiredTransactions) {
      lines.push(`    - ${requirement.id}: ${requirement.status}`)
      lines.push(`      reason: ${requirement.reason}`)
    }
  }
  if (transactionPreflightReport.lifecycleOperations.length > 0) {
    lines.push('  lifecycle operations:')
    for (const operation of transactionPreflightReport.lifecycleOperations) {
      lines.push(`    - ${operation.operation}: ${operation.status}`)
      lines.push(`      currentStage: ${operation.currentStage}`)
      if (operation.nextStage) {
        lines.push(`      nextStage: ${operation.nextStage}`)
      }
      lines.push(`      commitAllowed: ${operation.commitAllowed}`)
      lines.push(`      stages: ${operation.stages.map(stage => `${stage.id}:${stage.status}`).join(', ')}`)
      lines.push(`      reason: ${operation.reason}`)
    }
  }

  const visibleDiagnostics = transactionPreflightReport.diagnostics
    .filter(diagnostic => diagnostic.severity === 'error' || diagnostic.severity === 'fatal')
  if (visibleDiagnostics.length > 0) {
    lines.push('  diagnostics:')
    for (const diagnostic of visibleDiagnostics.slice(0, 20)) {
      lines.push(formatDiagnostic(diagnostic).replace(/^/gm, '  '))
    }
    if (visibleDiagnostics.length > 20) {
      lines.push(`    ... ${visibleDiagnostics.length - 20} more diagnostic(s)`)
    }
  }
  return lines.join('\n')
}

const formatRuntimeAdapterGateReport = runtimeAdapterGateReport => {
  const lines = [
    'Runtime Adapter Gate:',
    `  status: ${runtimeAdapterGateReport.status}`,
    `  transactionPreflightStatus: ${runtimeAdapterGateReport.transactionPreflightStatus}`,
    `  reason: ${runtimeAdapterGateReport.reason}`,
    `  registryCount: ${runtimeAdapterGateReport.registryCount}`,
    `  entryCount: ${runtimeAdapterGateReport.entryCount}`,
    `  selectedPackageIds: ${runtimeAdapterGateReport.selectedPackageIds.length > 0 ? runtimeAdapterGateReport.selectedPackageIds.join(', ') : '(empty)'}`,
    `  blockedPackageIds: ${runtimeAdapterGateReport.blockedPackageIds.length > 0 ? runtimeAdapterGateReport.blockedPackageIds.join(', ') : '(empty)'}`,
    `  loadOrder: ${runtimeAdapterGateReport.loadOrder.length > 0 ? runtimeAdapterGateReport.loadOrder.join(', ') : '(empty)'}`,
    `  packageCount: ${runtimeAdapterGateReport.packageCount}`,
    `  adapterReadiness: ${runtimeAdapterGateReport.adapterReadiness}`,
    `  runtimeEnablementAllowed: ${runtimeAdapterGateReport.runtimeEnablementAllowed}`,
    `  requiredAdapters: ${runtimeAdapterGateReport.requiredAdapters.length}`,
    `  candidatePublished: ${runtimeAdapterGateReport.effects.thirdPartyRegistryPublished}`,
    `  electronIpcExposed: ${runtimeAdapterGateReport.effects.electronIpcExposed}`,
    `  webImportPersisted: ${runtimeAdapterGateReport.effects.webImportPersisted}`,
    `  androidImportPersisted: ${runtimeAdapterGateReport.effects.androidImportPersisted}`,
    `  packageFilesWritten: ${runtimeAdapterGateReport.effects.packageFilesWritten}`,
    `  lockfileWritten: ${runtimeAdapterGateReport.effects.lockfileWritten}`,
    `  settingsWritten: ${runtimeAdapterGateReport.effects.settingsWritten}`,
    `  savesWritten: ${runtimeAdapterGateReport.effects.savesWritten}`,
    `  cacheWritten: ${runtimeAdapterGateReport.effects.cacheWritten}`,
    `  transactionLogWritten: ${runtimeAdapterGateReport.effects.transactionLogWritten}`
  ]
  if (runtimeAdapterGateReport.candidateIdentity) {
    lines.push(`  candidateHash: ${runtimeAdapterGateReport.candidateIdentity.candidateHash}`)
  }
  if (runtimeAdapterGateReport.lockfileHash) {
    lines.push(`  lockfileHash: ${runtimeAdapterGateReport.lockfileHash}`)
  }
  if (runtimeAdapterGateReport.requiredAdapters.length > 0) {
    lines.push('  adapters:')
    for (const requirement of runtimeAdapterGateReport.requiredAdapters) {
      lines.push(`    - ${requirement.id}: ${requirement.status}`)
      lines.push(`      reason: ${requirement.reason}`)
    }
  }

  const visibleDiagnostics = runtimeAdapterGateReport.diagnostics
    .filter(diagnostic => diagnostic.severity === 'error' || diagnostic.severity === 'fatal')
  if (visibleDiagnostics.length > 0) {
    lines.push('  diagnostics:')
    for (const diagnostic of visibleDiagnostics.slice(0, 20)) {
      lines.push(formatDiagnostic(diagnostic).replace(/^/gm, '  '))
    }
    if (visibleDiagnostics.length > 20) {
      lines.push(`    ... ${visibleDiagnostics.length - 20} more diagnostic(s)`)
    }
  }
  return lines.join('\n')
}

const formatSourceAdapterGateReport = sourceAdapterGateReport => {
  const lines = [
    'Source Adapter Gate:',
    `  status: ${sourceAdapterGateReport.status}`,
    `  runtimeAdapterGateStatus: ${sourceAdapterGateReport.runtimeAdapterGateStatus}`,
    `  reason: ${sourceAdapterGateReport.reason}`,
    `  registryCount: ${sourceAdapterGateReport.registryCount}`,
    `  entryCount: ${sourceAdapterGateReport.entryCount}`,
    `  selectedPackageIds: ${sourceAdapterGateReport.selectedPackageIds.length > 0 ? sourceAdapterGateReport.selectedPackageIds.join(', ') : '(empty)'}`,
    `  blockedPackageIds: ${sourceAdapterGateReport.blockedPackageIds.length > 0 ? sourceAdapterGateReport.blockedPackageIds.join(', ') : '(empty)'}`,
    `  loadOrder: ${sourceAdapterGateReport.loadOrder.length > 0 ? sourceAdapterGateReport.loadOrder.join(', ') : '(empty)'}`,
    `  packageCount: ${sourceAdapterGateReport.packageCount}`,
    `  sourceContractReadiness: ${sourceAdapterGateReport.sourceContractReadiness}`,
    `  contentPackageSourceContractStable: ${sourceAdapterGateReport.contentPackageSourceContractStable}`,
    `  runtimeEnablementAllowed: ${sourceAdapterGateReport.runtimeEnablementAllowed}`,
    `  requiredSourceContracts: ${sourceAdapterGateReport.requiredSourceContracts.length}`,
    `  candidatePublished: ${sourceAdapterGateReport.effects.thirdPartyRegistryPublished}`,
    `  electronIpcExposed: ${sourceAdapterGateReport.effects.electronIpcExposed}`,
    `  webImportPersisted: ${sourceAdapterGateReport.effects.webImportPersisted}`,
    `  androidImportPersisted: ${sourceAdapterGateReport.effects.androidImportPersisted}`,
    `  platformSourceOpened: ${sourceAdapterGateReport.effects.platformSourceOpened}`,
    `  sourceHandlesRetained: ${sourceAdapterGateReport.effects.sourceHandlesRetained}`,
    `  packageFilesWritten: ${sourceAdapterGateReport.effects.packageFilesWritten}`,
    `  lockfileWritten: ${sourceAdapterGateReport.effects.lockfileWritten}`,
    `  settingsWritten: ${sourceAdapterGateReport.effects.settingsWritten}`,
    `  savesWritten: ${sourceAdapterGateReport.effects.savesWritten}`,
    `  cacheWritten: ${sourceAdapterGateReport.effects.cacheWritten}`,
    `  transactionLogWritten: ${sourceAdapterGateReport.effects.transactionLogWritten}`
  ]
  if (sourceAdapterGateReport.candidateIdentity) {
    lines.push(`  candidateHash: ${sourceAdapterGateReport.candidateIdentity.candidateHash}`)
  }
  if (sourceAdapterGateReport.lockfileHash) {
    lines.push(`  lockfileHash: ${sourceAdapterGateReport.lockfileHash}`)
  }
  if (sourceAdapterGateReport.requiredSourceContracts.length > 0) {
    lines.push('  sourceContracts:')
    for (const requirement of sourceAdapterGateReport.requiredSourceContracts) {
      lines.push(`    - ${requirement.id}: ${requirement.status}`)
      lines.push(`      reason: ${requirement.reason}`)
    }
  }

  const visibleDiagnostics = sourceAdapterGateReport.diagnostics
    .filter(diagnostic => diagnostic.severity === 'error' || diagnostic.severity === 'fatal')
  if (visibleDiagnostics.length > 0) {
    lines.push('  diagnostics:')
    for (const diagnostic of visibleDiagnostics.slice(0, 20)) {
      lines.push(formatDiagnostic(diagnostic).replace(/^/gm, '  '))
    }
    if (visibleDiagnostics.length > 20) {
      lines.push(`    ... ${visibleDiagnostics.length - 20} more diagnostic(s)`)
    }
  }
  return lines.join('\n')
}
export const formatDiscoveryReport = (
  scanRoot,
  sourceIdentity,
  report,
  selectionReport,
  repairReport,
  candidateSnapshotReport,
  lockfileDraftReport,
  mountPreflightReport,
  mountInputReport,
  runtimeMountGateReport,
  transactionPreflightReport,
  runtimeAdapterGateReport,
  sourceAdapterGateReport
) => {
  const lines = [
    'Taoyuan third-party data pack check',
    `Scan root: ${scanRoot}`,
    'Source Contract:',
    `  contractVersion: ${sourceIdentity.contractVersion}`,
    `  kind: ${sourceIdentity.kind}`,
    `  sourceId: ${sourceIdentity.sourceId}`,
    `  rootPath: ${sourceIdentity.rootPath}`,
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

  if (repairReport) {
    lines.push('', formatRepairReport(repairReport))
  }

  if (candidateSnapshotReport) {
    lines.push('', formatCandidateSnapshotReport(candidateSnapshotReport))
  }

  if (lockfileDraftReport) {
    lines.push('', formatLockfileDraftReport(lockfileDraftReport))
  }

  if (mountPreflightReport) {
    lines.push('', formatMountPreflightReport(mountPreflightReport))
  }

  if (mountInputReport) {
    lines.push('', formatMountInputReport(mountInputReport))
  }

  if (runtimeMountGateReport) {
    lines.push('', formatRuntimeMountGateReport(runtimeMountGateReport))
  }

  if (transactionPreflightReport) {
    lines.push('', formatTransactionPreflightReport(transactionPreflightReport))
  }

  if (runtimeAdapterGateReport) {
    lines.push('', formatRuntimeAdapterGateReport(runtimeAdapterGateReport))
  }

  if (sourceAdapterGateReport) {
    lines.push('', formatSourceAdapterGateReport(sourceAdapterGateReport))
  }

  lines.push('', `Result: ${reportHasFailure(report, selectionReport, repairReport, candidateSnapshotReport, lockfileDraftReport, mountPreflightReport, mountInputReport, runtimeMountGateReport, transactionPreflightReport, runtimeAdapterGateReport, sourceAdapterGateReport) ? 'FAILED' : 'OK'}`)

  return `${lines.join('\n')}\n`
}

export const exitCodeForReport = (
  report,
  selectionReport,
  repairReport,
  candidateSnapshotReport,
  lockfileDraftReport,
  mountPreflightReport,
  mountInputReport,
  runtimeMountGateReport,
  transactionPreflightReport,
  runtimeAdapterGateReport,
  sourceAdapterGateReport
) =>
  reportHasFailure(report, selectionReport, repairReport, candidateSnapshotReport, lockfileDraftReport, mountPreflightReport, mountInputReport, runtimeMountGateReport, transactionPreflightReport, runtimeAdapterGateReport, sourceAdapterGateReport) ? 1 : 0

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
  let discoveryInput
  try {
    const {
      discoverThirdPartyDataPacks,
      selectThirdPartyDataPacks,
      buildThirdPartyCandidateRegistrySnapshot,
      createThirdPartyDataPackLockfileDraft,
      validateThirdPartyDataPackLockfileDraft,
      buildThirdPartyDataPackRepairReport,
      buildThirdPartyDataPackMountPreflight,
      buildThirdPartyDataPackMountInput,
      buildThirdPartyDataPackRuntimeMountGate,
      buildThirdPartyDataPackTransactionPreflight,
      buildThirdPartyDataPackRuntimeAdapterGate,
      buildThirdPartyDataPackSourceAdapterGate,
      CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      createDiscoveryFileSystemFromContentPackageSource,
      buildOfficialRegistrySetFromStaticData
    } = await loadDiscoveryModule()
    discoveryInput = await resolveDiscoveryInput(scanRoot, {
      CONTENT_PACKAGE_SOURCE_CONTRACT_VERSION,
      createDiscoveryFileSystemFromContentPackageSource
    })
    const officialRegistrySet = buildOfficialRegistrySetFromStaticData()
    const report = await discoverThirdPartyDataPacks(discoveryInput.rootDirectory, discoveryInput.fileSystem)
    const selectionReport = selectThirdPartyDataPacks(report)
    const repairReport = buildThirdPartyDataPackRepairReport(report)
    const candidateSnapshotReport = buildThirdPartyCandidateRegistrySnapshot({
      officialRegistrySet,
      discoveryReport: report,
      selectionReport
    })
    const draftResult = createThirdPartyDataPackLockfileDraft({
      discoveryReport: report,
      selectionReport,
      candidateSnapshot: candidateSnapshotReport
    })
    const validationResult = validateThirdPartyDataPackLockfileDraft({
      discoveryReport: report,
      selectionReport,
      candidateSnapshot: candidateSnapshotReport,
      draft: draftResult.draft
    })
    const lockfileDraftReport = { draftResult, validationResult }
    const mountPreflightReport = buildThirdPartyDataPackMountPreflight({
      officialRegistrySet,
      discoveryReport: report,
      selectionReport,
      candidateSnapshot: candidateSnapshotReport,
      lockfileDraftResult: draftResult,
      lockfileValidationResult: validationResult
    })
    const mountInputReport = buildThirdPartyDataPackMountInput({
      officialRegistrySet,
      discoveryReport: report,
      selectionReport,
      candidateSnapshot: candidateSnapshotReport,
      lockfileDraftResult: draftResult,
      lockfileValidationResult: validationResult,
      preflight: mountPreflightReport
    })
    const runtimeMountGateReport = buildThirdPartyDataPackRuntimeMountGate({
      officialRegistrySet,
      discoveryReport: report,
      selectionReport,
      candidateSnapshot: candidateSnapshotReport,
      lockfileDraftResult: draftResult,
      lockfileValidationResult: validationResult,
      preflight: mountPreflightReport,
      mountInput: mountInputReport
    })
    const transactionPreflightReport = buildThirdPartyDataPackTransactionPreflight({
      officialRegistrySet,
      discoveryReport: report,
      selectionReport,
      candidateSnapshot: candidateSnapshotReport,
      lockfileDraftResult: draftResult,
      lockfileValidationResult: validationResult,
      preflight: mountPreflightReport,
      mountInput: mountInputReport,
      runtimeGate: runtimeMountGateReport
    })
    const runtimeAdapterGateReport = buildThirdPartyDataPackRuntimeAdapterGate({
      officialRegistrySet,
      discoveryReport: report,
      selectionReport,
      candidateSnapshot: candidateSnapshotReport,
      lockfileDraftResult: draftResult,
      lockfileValidationResult: validationResult,
      preflight: mountPreflightReport,
      mountInput: mountInputReport,
      runtimeGate: runtimeMountGateReport,
      transactionPreflight: transactionPreflightReport
    })
    const sourceAdapterGateReport = buildThirdPartyDataPackSourceAdapterGate({
      officialRegistrySet,
      discoveryReport: report,
      selectionReport,
      candidateSnapshot: candidateSnapshotReport,
      lockfileDraftResult: draftResult,
      lockfileValidationResult: validationResult,
      preflight: mountPreflightReport,
      mountInput: mountInputReport,
      runtimeGate: runtimeMountGateReport,
      transactionPreflight: transactionPreflightReport,
      runtimeAdapterGate: runtimeAdapterGateReport
    })
    stdout.write(formatDiscoveryReport(
      scanRoot,
      discoveryInput.source.identity,
      report,
      selectionReport,
      repairReport,
      candidateSnapshotReport,
      lockfileDraftReport,
      mountPreflightReport,
      mountInputReport,
      runtimeMountGateReport,
      transactionPreflightReport,
      runtimeAdapterGateReport,
      sourceAdapterGateReport
    ))
    return exitCodeForReport(
      report,
      selectionReport,
      repairReport,
      candidateSnapshotReport,
      lockfileDraftReport,
      mountPreflightReport,
      mountInputReport,
      runtimeMountGateReport,
      transactionPreflightReport,
      runtimeAdapterGateReport,
      sourceAdapterGateReport
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    stderr.write(`Failed to check third-party data packs: ${message}\n`)
    return 1
  } finally {
    await discoveryInput?.source.dispose()
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
