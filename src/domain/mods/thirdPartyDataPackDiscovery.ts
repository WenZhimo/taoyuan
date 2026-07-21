import { Type, type TSchema } from '@sinclair/typebox'
import { assertPureJsonValue, compareCodePoints, type JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic, type ModDiagnosticSeverity } from './diagnostics'
import { normalizePackagePath } from './hash'
import {
  requirePackageId,
  requireRegistryTypeId,
  type PackageId,
  type RegistryTypeId
} from './ids'
import { validateUnknown } from './schemaValidation'
import {
  OFFICIAL_REGISTRY_SCHEMAS,
  PackageManifestSchema,
  type PackageManifest
} from './schemas'

export type ThirdPartyDataPackDiscoveryIssueKind =
  | 'directory-not-found'
  | 'empty-directory'
  | 'non-json-file'
  | 'json-parse-failed'
  | 'schema-validation-failed'
  | 'missing-manifest'
  | 'content-file-missing'
  | 'path-unsafe'
  | 'unsupported-registry'
  | 'file-read-failed'

export type ThirdPartyDataPackCandidateStatus = 'valid' | 'invalid'
export type ThirdPartyDataPackDiscoveryStatus = 'completed' | 'directory-not-found' | 'empty'

export interface ThirdPartyDiscoveryDirectoryEntry {
  readonly name: string
  readonly kind: 'file' | 'directory' | 'other'
  readonly isSymbolicLink?: boolean
}

export interface ThirdPartyDiscoveryFileSystem {
  getEntry(path: string): Promise<ThirdPartyDiscoveryDirectoryEntry | null>
  readDirectory(path: string): Promise<readonly ThirdPartyDiscoveryDirectoryEntry[]>
  readTextFile(path: string): Promise<string>
}

export interface ThirdPartyDataPackContentFile {
  readonly registryId: RegistryTypeId
  readonly path: string
  readonly entryCount: number
}

export interface ThirdPartyDataPackDiscoveryIssue {
  readonly kind: ThirdPartyDataPackDiscoveryIssueKind
  readonly severity: ModDiagnosticSeverity
  readonly path: string
  readonly candidatePath?: string
  readonly packageId?: PackageId
  readonly registryId?: RegistryTypeId
  readonly fieldPath?: string
  readonly reason: string
  readonly diagnostics: readonly ModDiagnostic[]
}

export interface ThirdPartyDataPackCandidate {
  readonly path: string
  readonly status: ThirdPartyDataPackCandidateStatus
  readonly packageId?: PackageId
  readonly manifest?: PackageManifest
  readonly contentFiles: readonly ThirdPartyDataPackContentFile[]
  readonly issues: readonly ThirdPartyDataPackDiscoveryIssue[]
}

export interface ThirdPartyDataPackDiscoveryReport {
  readonly status: ThirdPartyDataPackDiscoveryStatus
  readonly candidates: readonly ThirdPartyDataPackCandidate[]
  readonly issues: readonly ThirdPartyDataPackDiscoveryIssue[]
  readonly summary: {
    readonly scannedEntries: number
    readonly candidateCount: number
    readonly validPackageCount: number
    readonly invalidPackageCount: number
    readonly issueCount: number
  }
}

const registrySchemas: Readonly<Record<string, TSchema>> = OFFICIAL_REGISTRY_SCHEMAS

const joinFilePath = (base: string, child: string): string => {
  const trimmedBase = base.replace(/[\\/]+$/, '')
  return `${trimmedBase}/${child}`
}

const sortEntries = (
  entries: readonly ThirdPartyDiscoveryDirectoryEntry[]
): ThirdPartyDiscoveryDirectoryEntry[] =>
  [...entries].sort((a, b) => compareCodePoints(a.name, b.name))

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error)

const createIssue = (
  kind: ThirdPartyDataPackDiscoveryIssueKind,
  options: {
    severity?: ModDiagnosticSeverity
    path: string
    candidatePath?: string
    packageId?: PackageId
    registryId?: RegistryTypeId
    fieldPath?: string
    reason: string
    diagnostics?: readonly ModDiagnostic[]
    details?: Record<string, JsonValue>
  }
): ThirdPartyDataPackDiscoveryIssue => {
  const severity = options.severity ?? 'error'
  const diagnostics = options.diagnostics ?? [
    createDiagnostic(
      kind === 'missing-manifest'
        ? 'PKG-MANIFEST-001'
        : kind === 'schema-validation-failed'
          ? 'SCHEMA-VALIDATE-001'
          : kind === 'non-json-file'
            ? 'PKG-RESOURCE-001'
            : 'PKG-DISCOVERY-001',
      {
        stage: `third-party.discovery.${kind}`,
        severity,
        packageId: options.packageId,
        file: options.path,
        fieldPath: options.fieldPath,
        registryId: options.registryId,
        details: {
          reason: options.reason,
          ...(options.details ?? {})
        }
      }
    )
  ]

  return {
    kind,
    severity,
    path: options.path,
    candidatePath: options.candidatePath,
    packageId: options.packageId,
    registryId: options.registryId,
    fieldPath: options.fieldPath,
    reason: options.reason,
    diagnostics
  }
}

const parseJsonText = (
  text: string,
  context: {
    path: string
    candidatePath?: string
    packageId?: PackageId
    registryId?: RegistryTypeId
  }
): { ok: true; data: unknown } | { ok: false; issue: ThirdPartyDataPackDiscoveryIssue } => {
  let data: unknown
  try {
    data = JSON.parse(text) as unknown
  } catch (error) {
    return {
      ok: false,
      issue: createIssue('json-parse-failed', {
        path: context.path,
        candidatePath: context.candidatePath,
        packageId: context.packageId,
        registryId: context.registryId,
        reason: 'JSON parsing failed',
        details: { message: errorMessage(error) }
      })
    }
  }

  try {
    assertPureJsonValue(data)
  } catch (error) {
    return {
      ok: false,
      issue: createIssue('schema-validation-failed', {
        path: context.path,
        candidatePath: context.candidatePath,
        packageId: context.packageId,
        registryId: context.registryId,
        reason: 'Parsed value is not pure JSON',
        details: { message: errorMessage(error) }
      })
    }
  }

  return { ok: true, data }
}

const readJsonFile = async (
  fileSystem: ThirdPartyDiscoveryFileSystem,
  filePath: string,
  displayPath: string,
  context: {
    candidatePath?: string
    packageId?: PackageId
    registryId?: RegistryTypeId
  }
): Promise<{ ok: true; data: unknown } | { ok: false; issue: ThirdPartyDataPackDiscoveryIssue }> => {
  try {
    const text = await fileSystem.readTextFile(filePath)
    return parseJsonText(text, {
      path: displayPath,
      candidatePath: context.candidatePath,
      packageId: context.packageId,
      registryId: context.registryId
    })
  } catch (error) {
    return {
      ok: false,
      issue: createIssue('file-read-failed', {
        path: displayPath,
        candidatePath: context.candidatePath,
        packageId: context.packageId,
        registryId: context.registryId,
        reason: 'File could not be read',
        details: { message: errorMessage(error) }
      })
    }
  }
}

const isJsonPath = (path: string): boolean => path.toLowerCase().endsWith('.json')

const resolveSafePackageFile = async (
  fileSystem: ThirdPartyDiscoveryFileSystem,
  packageRoot: string,
  packageDisplayPath: string,
  packageRelativePath: string,
  context: {
    packageId?: PackageId
    registryId?: RegistryTypeId
  }
): Promise<
  | { ok: true; filePath: string; normalizedPath: string; displayPath: string }
  | { ok: false; issue: ThirdPartyDataPackDiscoveryIssue }
> => {
  let normalizedPath: string
  try {
    normalizedPath = normalizePackagePath(packageRelativePath)
  } catch (error) {
    return {
      ok: false,
      issue: createIssue('path-unsafe', {
        path: `${packageDisplayPath}/${packageRelativePath}`,
        candidatePath: packageDisplayPath,
        packageId: context.packageId,
        registryId: context.registryId,
        reason: 'Package path is absolute, empty, or escapes the package root',
        details: { message: errorMessage(error) }
      })
    }
  }

  if (!isJsonPath(normalizedPath)) {
    return {
      ok: false,
      issue: createIssue('non-json-file', {
        path: `${packageDisplayPath}/${normalizedPath}`,
        candidatePath: packageDisplayPath,
        packageId: context.packageId,
        registryId: context.registryId,
        reason: 'Manifest entrypoint points to a non-JSON file'
      })
    }
  }

  const segments = normalizedPath.split('/')
  let currentPath = packageRoot
  for (let index = 0; index < segments.length; index += 1) {
    currentPath = joinFilePath(currentPath, segments[index]!)
    const entry = await fileSystem.getEntry(currentPath)
    const isFinal = index === segments.length - 1
    if (!entry) {
      return {
        ok: false,
        issue: createIssue('content-file-missing', {
          path: `${packageDisplayPath}/${normalizedPath}`,
          candidatePath: packageDisplayPath,
          packageId: context.packageId,
          registryId: context.registryId,
          reason: 'Manifest entrypoint file is missing'
        })
      }
    }
    if (entry.isSymbolicLink) {
      return {
        ok: false,
        issue: createIssue('path-unsafe', {
          path: `${packageDisplayPath}/${normalizedPath}`,
          candidatePath: packageDisplayPath,
          packageId: context.packageId,
          registryId: context.registryId,
          reason: 'Package content path crosses a symbolic link'
        })
      }
    }
    if (!isFinal && entry.kind !== 'directory') {
      return {
        ok: false,
        issue: createIssue('content-file-missing', {
          path: `${packageDisplayPath}/${normalizedPath}`,
          candidatePath: packageDisplayPath,
          packageId: context.packageId,
          registryId: context.registryId,
          reason: 'Manifest entrypoint parent is not a directory'
        })
      }
    }
    if (isFinal && entry.kind !== 'file') {
      return {
        ok: false,
        issue: createIssue('content-file-missing', {
          path: `${packageDisplayPath}/${normalizedPath}`,
          candidatePath: packageDisplayPath,
          packageId: context.packageId,
          registryId: context.registryId,
          reason: 'Manifest entrypoint is not a file'
        })
      }
    }
  }

  return {
    ok: true,
    filePath: currentPath,
    normalizedPath,
    displayPath: `${packageDisplayPath}/${normalizedPath}`
  }
}

const validateManifest = (
  value: unknown,
  displayPath: string,
  candidatePath: string
): { ok: true; manifest: PackageManifest; packageId: PackageId } | { ok: false; issues: ThirdPartyDataPackDiscoveryIssue[] } => {
  const result = validateUnknown(PackageManifestSchema, value, {
    stage: 'third-party.discovery.manifest',
    file: displayPath
  })
  if (!result.ok) {
    return {
      ok: false,
      issues: result.diagnostics.map(diagnostic =>
        createIssue('schema-validation-failed', {
          path: displayPath,
          candidatePath,
          fieldPath: diagnostic.fieldPath,
          reason: 'manifest.json does not satisfy PackageManifestSchema',
          diagnostics: [diagnostic]
        })
      )
    }
  }

  return {
    ok: true,
    manifest: result.data,
    packageId: requirePackageId(result.data.id)
  }
}

const validateContentFile = (
  value: unknown,
  context: {
    registryId: RegistryTypeId
    packageId: PackageId
    path: string
    candidatePath: string
  }
): { ok: true; entryCount: number } | { ok: false; issues: ThirdPartyDataPackDiscoveryIssue[] } => {
  const schema = registrySchemas[context.registryId]
  if (!schema) {
    return {
      ok: false,
      issues: [
        createIssue('unsupported-registry', {
          path: context.path,
          candidatePath: context.candidatePath,
          packageId: context.packageId,
          registryId: context.registryId,
          reason: 'Manifest entrypoint registry is not supported by the host'
        })
      ]
    }
  }

  const result = validateUnknown(Type.Array(schema), value, {
    stage: 'third-party.discovery.content',
    packageId: context.packageId,
    file: context.path
  })
  if (!result.ok) {
    return {
      ok: false,
      issues: result.diagnostics.map(diagnostic =>
        createIssue('schema-validation-failed', {
          path: context.path,
          candidatePath: context.candidatePath,
          packageId: context.packageId,
          registryId: context.registryId,
          fieldPath: diagnostic.fieldPath,
          reason: 'Content file does not satisfy the registry TypeBox schema',
          diagnostics: [diagnostic]
        })
      )
    }
  }

  return { ok: true, entryCount: result.data.length }
}

const scanCandidateDirectory = async (
  fileSystem: ThirdPartyDiscoveryFileSystem,
  rootDirectory: string,
  entry: ThirdPartyDiscoveryDirectoryEntry
): Promise<ThirdPartyDataPackCandidate> => {
  const candidatePath = entry.name
  const candidateRoot = joinFilePath(rootDirectory, entry.name)
  const issues: ThirdPartyDataPackDiscoveryIssue[] = []
  const contentFiles: ThirdPartyDataPackContentFile[] = []
  const manifestDisplayPath = `${candidatePath}/manifest.json`
  const manifestFilePath = joinFilePath(candidateRoot, 'manifest.json')

  const manifestEntry = await fileSystem.getEntry(manifestFilePath)
  if (!manifestEntry || manifestEntry.kind !== 'file' || manifestEntry.isSymbolicLink) {
    const kind = manifestEntry?.isSymbolicLink ? 'path-unsafe' : 'missing-manifest'
    issues.push(createIssue(kind, {
      path: manifestDisplayPath,
      candidatePath,
      reason: manifestEntry?.isSymbolicLink
        ? 'manifest.json is a symbolic link'
        : 'Candidate package has no readable manifest.json'
    }))
    return {
      path: candidatePath,
      status: 'invalid',
      contentFiles,
      issues
    }
  }

  const manifestJson = await readJsonFile(fileSystem, manifestFilePath, manifestDisplayPath, { candidatePath })
  if (!manifestJson.ok) {
    issues.push(manifestJson.issue)
    return {
      path: candidatePath,
      status: 'invalid',
      contentFiles,
      issues
    }
  }

  const manifestResult = validateManifest(manifestJson.data, manifestDisplayPath, candidatePath)
  if (!manifestResult.ok) {
    issues.push(...manifestResult.issues)
    return {
      path: candidatePath,
      status: 'invalid',
      contentFiles,
      issues
    }
  }

  const { manifest, packageId } = manifestResult
  const entrypoints = Object.entries(manifest.entrypoints)
    .sort(([a], [b]) => compareCodePoints(a, b))

  for (const [registryIdText, paths] of entrypoints) {
    const registryId = requireRegistryTypeId(registryIdText)
    if (!registrySchemas[registryId]) {
      issues.push(createIssue('unsupported-registry', {
        path: manifestDisplayPath,
        candidatePath,
        packageId,
        registryId,
        fieldPath: `/entrypoints/${registryIdText}`,
        reason: 'Manifest references a registry type that is not publicly supported yet'
      }))
      continue
    }

    for (const packageRelativePath of [...paths].sort(compareCodePoints)) {
      const resolved = await resolveSafePackageFile(fileSystem, candidateRoot, candidatePath, packageRelativePath, {
        packageId,
        registryId
      })
      if (!resolved.ok) {
        issues.push(resolved.issue)
        continue
      }

      const json = await readJsonFile(fileSystem, resolved.filePath, resolved.displayPath, {
        candidatePath,
        packageId,
        registryId
      })
      if (!json.ok) {
        issues.push(json.issue)
        continue
      }

      const contentResult = validateContentFile(json.data, {
        registryId,
        packageId,
        path: resolved.displayPath,
        candidatePath
      })
      if (!contentResult.ok) {
        issues.push(...contentResult.issues)
        continue
      }

      contentFiles.push({
        registryId,
        path: resolved.normalizedPath,
        entryCount: contentResult.entryCount
      })
    }
  }

  return {
    path: candidatePath,
    status: issues.length > 0 ? 'invalid' : 'valid',
    packageId,
    manifest,
    contentFiles,
    issues
  }
}

export const discoverThirdPartyDataPacks = async (
  rootDirectory: string,
  fileSystem: ThirdPartyDiscoveryFileSystem
): Promise<ThirdPartyDataPackDiscoveryReport> => {
  const rootEntry = await fileSystem.getEntry(rootDirectory)
  if (!rootEntry || rootEntry.kind !== 'directory' || rootEntry.isSymbolicLink) {
    const issue = createIssue(rootEntry?.isSymbolicLink ? 'path-unsafe' : 'directory-not-found', {
      path: '.',
      severity: rootEntry?.isSymbolicLink ? 'fatal' : 'info',
      reason: rootEntry?.isSymbolicLink
        ? 'Discovery root is a symbolic link'
        : 'Discovery root directory does not exist'
    })
    return {
      status: 'directory-not-found',
      candidates: [],
      issues: [issue],
      summary: {
        scannedEntries: 0,
        candidateCount: 0,
        validPackageCount: 0,
        invalidPackageCount: 0,
        issueCount: 1
      }
    }
  }

  const entries = sortEntries(await fileSystem.readDirectory(rootDirectory))
  if (entries.length === 0) {
    const issue = createIssue('empty-directory', {
      path: '.',
      severity: 'info',
      reason: 'Discovery root contains no package candidates'
    })
    return {
      status: 'empty',
      candidates: [],
      issues: [issue],
      summary: {
        scannedEntries: 0,
        candidateCount: 0,
        validPackageCount: 0,
        invalidPackageCount: 0,
        issueCount: 1
      }
    }
  }

  const rootIssues: ThirdPartyDataPackDiscoveryIssue[] = []
  const candidates: ThirdPartyDataPackCandidate[] = []

  for (const entry of entries) {
    if (entry.isSymbolicLink) {
      rootIssues.push(createIssue('path-unsafe', {
        path: entry.name,
        severity: 'fatal',
        reason: 'Discovery entry is a symbolic link and will not be followed'
      }))
      continue
    }

    if (entry.kind !== 'directory') {
      rootIssues.push(createIssue(
        entry.kind === 'file' && !isJsonPath(entry.name) ? 'non-json-file' : 'missing-manifest',
        {
          path: entry.name,
          severity: 'warning',
          reason: entry.kind === 'file' && !isJsonPath(entry.name)
            ? 'Discovery root file is not JSON and is not a package directory'
            : 'Discovery root file is not a directory package candidate'
        }
      ))
      continue
    }

    candidates.push(await scanCandidateDirectory(fileSystem, rootDirectory, entry))
  }

  const candidateIssues = candidates.flatMap(candidate => candidate.issues)
  const issues = [...rootIssues, ...candidateIssues]
  const validPackageCount = candidates.filter(candidate => candidate.status === 'valid').length

  return {
    status: 'completed',
    candidates,
    issues,
    summary: {
      scannedEntries: entries.length,
      candidateCount: candidates.length,
      validPackageCount,
      invalidPackageCount: candidates.length - validPackageCount,
      issueCount: issues.length
    }
  }
}
