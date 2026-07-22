import { Type, type TSchema } from '@sinclair/typebox'
import { assertPureJsonValue, compareCodePoints, type JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic, type ModDiagnosticSeverity } from './diagnostics'
import { hashCanonicalJson, normalizePackagePath, type Sha256Hash } from './hash'
import {
  parseContentId,
  requirePackageId,
  requireRegistryTypeId,
  type ContentId,
  type PackageId,
  type RegistryTypeId
} from './ids'
import { validateUnknown } from './schemaValidation'
import type { RegistryEntry } from './registry'
import {
  OFFICIAL_REGISTRY_SCHEMAS,
  PackageManifestSchema,
  type PackageDependency,
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
  | 'dependency-missing'
  | 'dependency-version-mismatch'
  | 'optional-dependency-missing'
  | 'package-conflict'
  | 'registry-entry-duplicate'
  | 'registry-entry-conflict'
  | 'registry-entry-duplicate-identical'

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
  readonly entries: readonly ThirdPartyDataPackContentEntry[]
  readonly validatedEntries: readonly RegistryEntry[]
}

export interface ThirdPartyDataPackContentEntry {
  readonly registryId: RegistryTypeId
  readonly contentId: ContentId
  readonly path: string
  readonly index: number
  readonly canonicalHash: Sha256Hash
}

export interface ThirdPartyDataPackDiscoveryIssue {
  readonly kind: ThirdPartyDataPackDiscoveryIssueKind
  readonly severity: ModDiagnosticSeverity
  readonly path: string
  readonly candidatePath?: string
  readonly packageId?: PackageId
  readonly registryId?: RegistryTypeId
  readonly contentId?: ContentId
  readonly relatedPackageIds?: readonly PackageId[]
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
const blockingSeverities = new Set<ModDiagnosticSeverity>(['error', 'fatal'])

interface SemVerCore {
  readonly major: number
  readonly minor: number
  readonly patch: number
}

interface RelationshipCandidate {
  readonly path: string
  readonly packageId: PackageId
  readonly manifest: PackageManifest
  readonly contentFiles: readonly ThirdPartyDataPackContentFile[]
}

const joinFilePath = (base: string, child: string): string => {
  const trimmedBase = base.replace(/[\\/]+$/, '')
  return `${trimmedBase}/${child}`
}

const sortEntries = (
  entries: readonly ThirdPartyDiscoveryDirectoryEntry[]
): ThirdPartyDiscoveryDirectoryEntry[] =>
  [...entries].sort((a, b) => compareCodePoints(a.name, b.name))

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error)

const isBlockingIssue = (issue: ThirdPartyDataPackDiscoveryIssue): boolean =>
  blockingSeverities.has(issue.severity)

const hasBlockingIssue = (issues: readonly ThirdPartyDataPackDiscoveryIssue[]): boolean =>
  issues.some(isBlockingIssue)

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const parseSemVerCore = (value: string): SemVerCore | null => {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.exec(value)
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3])
  }
}

const compareSemVerCore = (left: SemVerCore, right: SemVerCore): number =>
  left.major - right.major || left.minor - right.minor || left.patch - right.patch

const nextCaretUpperBound = (version: SemVerCore): SemVerCore => {
  if (version.major > 0) return { major: version.major + 1, minor: 0, patch: 0 }
  if (version.minor > 0) return { major: 0, minor: version.minor + 1, patch: 0 }
  return { major: 0, minor: 0, patch: version.patch + 1 }
}

export const satisfiesPackageVersionRange = (
  actualVersion: string,
  expectedRange: string
): { ok: true } | { ok: false; reason: string } => {
  const actual = parseSemVerCore(actualVersion)
  if (!actual) return { ok: false, reason: `Installed version is not SemVer: ${actualVersion}` }

  if (expectedRange.startsWith('>=')) {
    const lowerBound = parseSemVerCore(expectedRange.slice(2))
    if (!lowerBound) return { ok: false, reason: `Unsupported dependency range: ${expectedRange}` }
    return compareSemVerCore(actual, lowerBound) >= 0
      ? { ok: true }
      : { ok: false, reason: `${actualVersion} is lower than ${expectedRange}` }
  }

  if (expectedRange.startsWith('^')) {
    const lowerBound = parseSemVerCore(expectedRange.slice(1))
    if (!lowerBound) return { ok: false, reason: `Unsupported dependency range: ${expectedRange}` }
    const upperBound = nextCaretUpperBound(lowerBound)
    return compareSemVerCore(actual, lowerBound) >= 0 && compareSemVerCore(actual, upperBound) < 0
      ? { ok: true }
      : { ok: false, reason: `${actualVersion} does not satisfy ${expectedRange}` }
  }

  const exactVersion = parseSemVerCore(expectedRange)
  if (!exactVersion) return { ok: false, reason: `Unsupported dependency range: ${expectedRange}` }
  return compareSemVerCore(actual, exactVersion) === 0
    ? { ok: true }
    : { ok: false, reason: `${actualVersion} does not exactly match ${expectedRange}` }
}

const createIssue = (
  kind: ThirdPartyDataPackDiscoveryIssueKind,
  options: {
    severity?: ModDiagnosticSeverity
    path: string
    candidatePath?: string
    packageId?: PackageId
    registryId?: RegistryTypeId
    contentId?: ContentId
    relatedPackageIds?: readonly PackageId[]
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
            : kind === 'dependency-missing' || kind === 'optional-dependency-missing'
              ? 'PKG-DEPENDENCY-001'
              : kind === 'dependency-version-mismatch' || kind === 'package-conflict'
                ? 'PKG-DEPENDENCY-002'
                : kind === 'registry-entry-duplicate'
                  || kind === 'registry-entry-conflict'
                  || kind === 'registry-entry-duplicate-identical'
                  ? 'REG-DUPLICATE-001'
                  : 'PKG-DISCOVERY-001',
      {
        stage: `third-party.discovery.${kind}`,
        severity,
        packageId: options.packageId,
        file: options.path,
        fieldPath: options.fieldPath,
        registryId: options.registryId,
        contentId: options.contentId,
        relatedPackageIds: options.relatedPackageIds ? [...options.relatedPackageIds] : undefined,
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
    contentId: options.contentId,
    relatedPackageIds: options.relatedPackageIds,
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
): {
  ok: true
  entries: readonly ThirdPartyDataPackContentEntry[]
  validatedEntries: readonly RegistryEntry[]
} | { ok: false; issues: ThirdPartyDataPackDiscoveryIssue[] } => {
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

  const entries: ThirdPartyDataPackContentEntry[] = []
  const validatedEntries: readonly unknown[] = result.data
  for (let index = 0; index < validatedEntries.length; index += 1) {
    const entry = validatedEntries[index]
    const contentId = isObjectRecord(entry) ? parseContentId(entry.id) : null
    if (!contentId) {
      return {
        ok: false,
        issues: [
          createIssue('schema-validation-failed', {
            path: context.path,
            candidatePath: context.candidatePath,
            packageId: context.packageId,
            registryId: context.registryId,
            fieldPath: `/${index}/id`,
            reason: 'Content entry passed its registry schema but did not expose a valid content id'
          })
        ]
      }
    }
    entries.push({
      registryId: context.registryId,
      contentId,
      path: context.path.slice(context.candidatePath.length + 1),
      index,
      canonicalHash: hashCanonicalJson(entry)
    })
  }

  return {
    ok: true,
    entries,
    validatedEntries: validatedEntries as readonly RegistryEntry[]
  }
}

const issueAtPath = (
  issuesByCandidatePath: Map<string, ThirdPartyDataPackDiscoveryIssue[]>,
  candidatePath: string,
  issue: ThirdPartyDataPackDiscoveryIssue
): void => {
  const issues = issuesByCandidatePath.get(candidatePath) ?? []
  issues.push(issue)
  issuesByCandidatePath.set(candidatePath, issues)
}

const issueForDependency = (
  kind: 'dependency-missing' | 'optional-dependency-missing' | 'dependency-version-mismatch',
  candidate: RelationshipCandidate,
  dependency: PackageDependency,
  fieldPath: string,
  reason: string,
  details: Record<string, JsonValue>
): ThirdPartyDataPackDiscoveryIssue =>
  createIssue(kind, {
    path: `${candidate.path}/manifest.json`,
    candidatePath: candidate.path,
    packageId: candidate.packageId,
    relatedPackageIds: [dependency.id as PackageId],
    fieldPath,
    reason,
    severity: kind === 'optional-dependency-missing' ? 'warning' : 'error',
    details
  })

const collectRelationshipCandidates = (
  candidates: readonly ThirdPartyDataPackCandidate[]
): RelationshipCandidate[] => {
  const result: RelationshipCandidate[] = []
  for (const candidate of candidates) {
    if (candidate.packageId === undefined || candidate.manifest === undefined) continue
    result.push({
      path: candidate.path,
      packageId: candidate.packageId,
      manifest: candidate.manifest,
      contentFiles: candidate.contentFiles
    })
  }
  return result
}

const analyzePackageRelationships = (
  candidates: readonly RelationshipCandidate[]
): Map<string, ThirdPartyDataPackDiscoveryIssue[]> => {
  const issuesByCandidatePath = new Map<string, ThirdPartyDataPackDiscoveryIssue[]>()
  const candidatesByPackageId = new Map<PackageId, RelationshipCandidate[]>()
  for (const candidate of candidates) {
    const group = candidatesByPackageId.get(candidate.packageId) ?? []
    group.push(candidate)
    candidatesByPackageId.set(candidate.packageId, group)
  }

  for (const [packageId, group] of candidatesByPackageId) {
    if (group.length <= 1) continue
    const first = group[0]!
    for (const duplicate of group.slice(1)) {
      issueAtPath(issuesByCandidatePath, duplicate.path, createIssue('package-conflict', {
        path: `${duplicate.path}/manifest.json`,
        candidatePath: duplicate.path,
        packageId: duplicate.packageId,
        relatedPackageIds: [packageId],
        fieldPath: '/id',
        reason: 'Another candidate already declares the same package id',
        details: {
          packageId,
          firstPackagePath: first.path,
          duplicatePackagePath: duplicate.path,
          firstVersion: first.manifest.version,
          duplicateVersion: duplicate.manifest.version,
          conflictType: 'duplicate-package-id'
        }
      }))
    }
  }

  const firstCandidateByPackageId = new Map(
    [...candidatesByPackageId.entries()].map(([packageId, group]) => [packageId, group[0]!] as const)
  )

  for (const candidate of candidates) {
    candidate.manifest.dependencies?.forEach((dependency, index) => {
      const target = firstCandidateByPackageId.get(dependency.id as PackageId)
      if (!target) {
        issueAtPath(issuesByCandidatePath, candidate.path, issueForDependency(
          'dependency-missing',
          candidate,
          dependency,
          `/dependencies/${index}`,
          'Required dependency package is missing',
          { dependencyId: dependency.id, range: dependency.version }
        ))
        return
      }
      const match = satisfiesPackageVersionRange(target.manifest.version, dependency.version)
      if (!match.ok) {
        issueAtPath(issuesByCandidatePath, candidate.path, issueForDependency(
          'dependency-version-mismatch',
          candidate,
          dependency,
          `/dependencies/${index}/version`,
          'Required dependency package version does not satisfy the declared range',
          {
            dependencyId: dependency.id,
            range: dependency.version,
            actualVersion: target.manifest.version,
            mismatch: match.reason
          }
        ))
      }
    })

    candidate.manifest.optionalDependencies?.forEach((dependency, index) => {
      const target = firstCandidateByPackageId.get(dependency.id as PackageId)
      if (!target) {
        issueAtPath(issuesByCandidatePath, candidate.path, issueForDependency(
          'optional-dependency-missing',
          candidate,
          dependency,
          `/optionalDependencies/${index}`,
          'Optional dependency package is missing and will be ignored',
          { dependencyId: dependency.id, range: dependency.version, optional: true }
        ))
        return
      }
      const match = satisfiesPackageVersionRange(target.manifest.version, dependency.version)
      if (!match.ok) {
        issueAtPath(issuesByCandidatePath, candidate.path, issueForDependency(
          'dependency-version-mismatch',
          candidate,
          dependency,
          `/optionalDependencies/${index}/version`,
          'Optional dependency package is present but its version does not satisfy the declared range',
          {
            dependencyId: dependency.id,
            range: dependency.version,
            actualVersion: target.manifest.version,
            optional: true,
            mismatch: match.reason
          }
        ))
      }
    })

    candidate.manifest.conflicts?.forEach((conflict, index) => {
      const target = firstCandidateByPackageId.get(conflict.id as PackageId)
      if (!target) return
      const match = satisfiesPackageVersionRange(target.manifest.version, conflict.version)
      if (!match.ok) return
      issueAtPath(issuesByCandidatePath, candidate.path, createIssue('package-conflict', {
        path: `${candidate.path}/manifest.json`,
        candidatePath: candidate.path,
        packageId: candidate.packageId,
        relatedPackageIds: [target.packageId],
        fieldPath: `/conflicts/${index}`,
        reason: 'Candidate declares an explicit conflict with another discovered package',
        details: {
          packageId: candidate.packageId,
          conflictPackageId: conflict.id,
          range: conflict.version,
          actualVersion: target.manifest.version,
          conflictType: 'manifest-conflict'
        }
      }))
    })
  }

  return issuesByCandidatePath
}

interface IndexedContentEntry extends ThirdPartyDataPackContentEntry {
  readonly packageId: PackageId
  readonly candidatePath: string
}

const entryKey = (entry: ThirdPartyDataPackContentEntry): string =>
  `${entry.registryId}\u0000${entry.contentId}`

const analyzeContentRelationships = (
  candidates: readonly RelationshipCandidate[]
): Map<string, ThirdPartyDataPackDiscoveryIssue[]> => {
  const issuesByCandidatePath = new Map<string, ThirdPartyDataPackDiscoveryIssue[]>()
  const entriesByPackage = new Map<string, IndexedContentEntry[]>()
  const entriesByRegistryKey = new Map<string, IndexedContentEntry[]>()

  for (const candidate of candidates) {
    for (const contentFile of candidate.contentFiles) {
      for (const entry of contentFile.entries) {
        const indexed = {
          ...entry,
          packageId: candidate.packageId,
          candidatePath: candidate.path
        }
        const packageKey = `${candidate.packageId}\u0000${entryKey(entry)}`
        const packageEntries = entriesByPackage.get(packageKey) ?? []
        packageEntries.push(indexed)
        entriesByPackage.set(packageKey, packageEntries)
        const registryEntries = entriesByRegistryKey.get(entryKey(entry)) ?? []
        registryEntries.push(indexed)
        entriesByRegistryKey.set(entryKey(entry), registryEntries)
      }
    }
  }

  for (const entries of entriesByPackage.values()) {
    if (entries.length <= 1) continue
    const first = entries[0]!
    for (const duplicate of entries.slice(1)) {
      issueAtPath(issuesByCandidatePath, duplicate.candidatePath, createIssue('registry-entry-duplicate', {
        path: `${duplicate.candidatePath}/${duplicate.path}`,
        candidatePath: duplicate.candidatePath,
        packageId: duplicate.packageId,
        registryId: duplicate.registryId,
        contentId: duplicate.contentId,
        relatedPackageIds: [duplicate.packageId],
        fieldPath: `/${duplicate.index}/id`,
        reason: 'Candidate package declares the same registry entry id more than once',
        details: {
          firstPath: `${first.candidatePath}/${first.path}`,
          duplicatePath: `${duplicate.candidatePath}/${duplicate.path}`,
          firstIndex: first.index,
          duplicateIndex: duplicate.index
        }
      }))
    }
  }

  for (const entries of entriesByRegistryKey.values()) {
    const firstByPackage = new Map<PackageId, IndexedContentEntry>()
    for (const entry of entries) {
      if (!firstByPackage.has(entry.packageId)) {
        firstByPackage.set(entry.packageId, entry)
      }
    }
    const packageEntries = [...firstByPackage.values()]
    if (packageEntries.length <= 1) continue
    const first = packageEntries[0]!
    for (const later of packageEntries.slice(1)) {
      const isIdentical = later.canonicalHash === first.canonicalHash
      issueAtPath(issuesByCandidatePath, later.candidatePath, createIssue(
        isIdentical ? 'registry-entry-duplicate-identical' : 'registry-entry-conflict',
        {
          path: `${later.candidatePath}/${later.path}`,
          candidatePath: later.candidatePath,
          packageId: later.packageId,
          registryId: later.registryId,
          contentId: later.contentId,
          relatedPackageIds: [first.packageId],
          fieldPath: `/${later.index}/id`,
          severity: isIdentical ? 'warning' : 'error',
          reason: isIdentical
            ? 'Another package already declares the same registry entry with identical content'
            : 'Another package already declares the same registry entry with different content',
          details: {
            firstPackageId: first.packageId,
            firstPath: `${first.candidatePath}/${first.path}`,
            currentHash: later.canonicalHash,
            firstHash: first.canonicalHash
          }
        }
      ))
    }
  }

  return issuesByCandidatePath
}

const mergeRelationshipIssues = (
  candidates: readonly ThirdPartyDataPackCandidate[]
): ThirdPartyDataPackCandidate[] => {
  const relationshipCandidates = collectRelationshipCandidates(candidates)
  const relationshipIssueMaps = [
    analyzePackageRelationships(relationshipCandidates),
    analyzeContentRelationships(relationshipCandidates)
  ]

  return candidates.map(candidate => {
    const relationshipIssues = relationshipIssueMaps.flatMap(map => map.get(candidate.path) ?? [])
    const issues = [...candidate.issues, ...relationshipIssues]
    return {
      ...candidate,
      issues,
      status: hasBlockingIssue(issues) ? 'invalid' : 'valid'
    }
  })
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
        entryCount: contentResult.entries.length,
        entries: contentResult.entries,
        validatedEntries: contentResult.validatedEntries
      })
    }
  }

  return {
    path: candidatePath,
    status: hasBlockingIssue(issues) ? 'invalid' : 'valid',
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

  const finalCandidates = mergeRelationshipIssues(candidates)
  const candidateIssues = finalCandidates.flatMap(candidate => candidate.issues)
  const issues = [...rootIssues, ...candidateIssues]
  const validPackageCount = finalCandidates.filter(candidate => candidate.status === 'valid').length

  return {
    status: 'completed',
    candidates: finalCandidates,
    issues,
    summary: {
      scannedEntries: entries.length,
      candidateCount: finalCandidates.length,
      validPackageCount,
      invalidPackageCount: finalCandidates.length - validPackageCount,
      issueCount: issues.length
    }
  }
}
