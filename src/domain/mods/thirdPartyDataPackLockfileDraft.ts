import { compareCodePoints, type JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import type { PackageId, RegistryTypeId, ContentId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary,
  ThirdPartyCandidateRegistrySnapshotResult
} from './thirdPartyCandidateRegistrySnapshot'
import {
  satisfiesPackageVersionRange,
  type ThirdPartyDataPackCandidate,
  type ThirdPartyDataPackDiscoveryReport
} from './thirdPartyDataPackDiscovery'
import type { ThirdPartyDataPackSelectionReport } from './thirdPartyDataPackSelection'
import { ThirdPartyDataPackLockfileDraftSchema, type PackageDependency, type PackageManifest } from './schemas'
import { validateUnknown } from './schemaValidation'

export type ThirdPartyDataPackLockfileDraftStatus = 'valid' | 'invalid' | 'skipped'
export type ThirdPartyDataPackLockfileDraftValidationStatus = 'valid' | 'invalid'

export interface ThirdPartyDataPackLockfileDraftPackageContentEntry {
  readonly registryId: RegistryTypeId
  readonly contentId: ContentId
  readonly index: number
  readonly canonicalHash: Sha256Hash
}

export interface ThirdPartyDataPackLockfileDraftPackageContentFile {
  readonly registryId: RegistryTypeId
  readonly path: string
  readonly entryCount: number
  readonly entries: readonly ThirdPartyDataPackLockfileDraftPackageContentEntry[]
}

export interface ThirdPartyDataPackLockfileDraftPackageSource {
  readonly candidatePath: string
  readonly manifestPath: string
  readonly contentFiles: readonly string[]
}

export interface ThirdPartyDataPackLockfileDraftPackage {
  readonly packageId: PackageId
  readonly version: string
  readonly loadIndex: number
  readonly source: ThirdPartyDataPackLockfileDraftPackageSource
  readonly manifestHash: Sha256Hash
  readonly contentHash: Sha256Hash
  readonly configurationHash: Sha256Hash
  readonly resolvedDependencies: readonly PackageId[]
  readonly contentFiles: readonly ThirdPartyDataPackLockfileDraftPackageContentFile[]
}

export interface ThirdPartyDataPackLockfileDraft {
  readonly formatVersion: 1
  readonly kind: 'third-party-data-pack-lockfile-draft'
  readonly officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly registryCount: number
  readonly entryCount: number
  readonly selectedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly packages: readonly ThirdPartyDataPackLockfileDraftPackage[]
  readonly lockfileHash: Sha256Hash
}

export interface ThirdPartyDataPackLockfileDraftResult {
  readonly status: ThirdPartyDataPackLockfileDraftStatus
  readonly diagnostics: readonly ModDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly draft?: ThirdPartyDataPackLockfileDraft
}

export interface ThirdPartyDataPackLockfileDraftValidationResult {
  readonly status: ThirdPartyDataPackLockfileDraftValidationStatus
  readonly diagnostics: readonly ModDiagnostic[]
  readonly expectedDraft?: ThirdPartyDataPackLockfileDraft
}

export interface CreateThirdPartyDataPackLockfileDraftOptions {
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly selectionReport: ThirdPartyDataPackSelectionReport
  readonly candidateSnapshot: ThirdPartyCandidateRegistrySnapshotResult
}

export interface ValidateThirdPartyDataPackLockfileDraftOptions extends CreateThirdPartyDataPackLockfileDraftOptions {
  readonly draft?: unknown
}

const EMPTY_CONFIGURATION_HASH = hashCanonicalJson({ schemaVersion: '1', values: {} })
const blockingSeverity = new Set(['error', 'fatal'])

const isBlockingDiagnostic = (diagnostic: ModDiagnostic): boolean =>
  blockingSeverity.has(diagnostic.severity)

const sortPackageIds = (values: Iterable<PackageId>): PackageId[] =>
  [...values].sort(compareCodePoints)

const arraysEqual = <T>(left: readonly T[], right: readonly T[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const createLockfileDiagnostic = (
  stage: string,
  options: {
    packageId?: PackageId
    relatedPackageIds?: readonly PackageId[]
    fieldPath?: string
    details: Record<string, JsonValue>
  }
): ModDiagnostic => createDiagnostic('CACHE-INVALID-001', {
  stage,
  severity: 'error',
  packageId: options.packageId,
  relatedPackageIds: options.relatedPackageIds ? [...options.relatedPackageIds] : undefined,
  fieldPath: options.fieldPath,
  details: options.details
})

const candidatesByPackageId = (
  report: ThirdPartyDataPackDiscoveryReport
): Map<PackageId, ThirdPartyDataPackCandidate> => {
  const result = new Map<PackageId, ThirdPartyDataPackCandidate>()
  for (const candidate of report.candidates) {
    if (candidate.packageId && !result.has(candidate.packageId)) {
      result.set(candidate.packageId, candidate)
    }
  }
  return result
}

const selectedVersionsByPackageId = (
  report: ThirdPartyDataPackSelectionReport
): Map<PackageId, string> =>
  new Map(report.selectedPackages.map(selectedPackage => [selectedPackage.packageId, selectedPackage.version]))

const contentFilesForDraft = (
  candidate: ThirdPartyDataPackCandidate
): ThirdPartyDataPackLockfileDraftPackageContentFile[] =>
  candidate.contentFiles
    .map(file => ({
      registryId: file.registryId,
      path: file.path,
      entryCount: file.entryCount,
      entries: file.entries
        .map(entry => ({
          registryId: entry.registryId,
          contentId: entry.contentId,
          index: entry.index,
          canonicalHash: entry.canonicalHash
        }))
        .sort((a, b) => a.index - b.index)
    }))
    .sort((a, b) => compareCodePoints(a.registryId, b.registryId) || compareCodePoints(a.path, b.path))

const dependencyIsSelected = (
  dependency: PackageDependency,
  selectedManifestByPackageId: ReadonlyMap<PackageId, PackageManifest>
): boolean => {
  const dependencyId = dependency.id as PackageId
  const target = selectedManifestByPackageId.get(dependencyId)
  if (!target) return false
  return satisfiesPackageVersionRange(target.version, dependency.version).ok
}

const resolvedDependenciesFor = (
  manifest: PackageManifest,
  selectedManifestByPackageId: ReadonlyMap<PackageId, PackageManifest>
): PackageId[] => {
  const dependencies = [
    ...(manifest.dependencies ?? []),
    ...(manifest.optionalDependencies ?? [])
  ]
    .filter(dependency => dependencyIsSelected(dependency, selectedManifestByPackageId))
    .map(dependency => dependency.id as PackageId)
  return sortPackageIds(new Set(dependencies))
}

const createPackageContentHash = (
  manifestHash: Sha256Hash,
  contentFiles: readonly ThirdPartyDataPackLockfileDraftPackageContentFile[]
): Sha256Hash => hashCanonicalJson({
  manifestHash,
  contentFiles: contentFiles.map(file => ({
    registryId: file.registryId,
    path: file.path,
    entryCount: file.entryCount,
    entries: file.entries.map(entry => ({
      contentId: entry.contentId,
      index: entry.index,
      canonicalHash: entry.canonicalHash
    }))
  }))
})

const createDraftBody = (
  draft: Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'>
): Omit<ThirdPartyDataPackLockfileDraft, 'lockfileHash'> => ({
  formatVersion: draft.formatVersion,
  kind: draft.kind,
  officialIdentity: draft.officialIdentity,
  candidateIdentity: draft.candidateIdentity,
  registryCount: draft.registryCount,
  entryCount: draft.entryCount,
  selectedPackageIds: [...draft.selectedPackageIds],
  loadOrder: [...draft.loadOrder],
  packages: draft.packages.map(pkg => ({
    packageId: pkg.packageId,
    version: pkg.version,
    loadIndex: pkg.loadIndex,
    source: {
      candidatePath: pkg.source.candidatePath,
      manifestPath: pkg.source.manifestPath,
      contentFiles: [...pkg.source.contentFiles]
    },
    manifestHash: pkg.manifestHash,
    contentHash: pkg.contentHash,
    configurationHash: pkg.configurationHash,
    resolvedDependencies: [...pkg.resolvedDependencies],
    contentFiles: pkg.contentFiles.map(file => ({
      registryId: file.registryId,
      path: file.path,
      entryCount: file.entryCount,
      entries: file.entries.map(entry => ({
        registryId: entry.registryId,
        contentId: entry.contentId,
        index: entry.index,
        canonicalHash: entry.canonicalHash
      }))
    }))
  }))
})

const createPackageDraft = (
  candidate: ThirdPartyDataPackCandidate,
  packageId: PackageId,
  version: string,
  loadIndex: number,
  selectedManifestByPackageId: ReadonlyMap<PackageId, PackageManifest>
): ThirdPartyDataPackLockfileDraftPackage | null => {
  if (!candidate.manifest) return null
  const manifestHash = hashCanonicalJson(candidate.manifest)
  const contentFiles = contentFilesForDraft(candidate)
  const contentHash = createPackageContentHash(manifestHash, contentFiles)
  return {
    packageId,
    version,
    loadIndex,
    source: {
      candidatePath: candidate.path,
      manifestPath: `${candidate.path}/manifest.json`,
      contentFiles: contentFiles.map(file => `${candidate.path}/${file.path}`)
    },
    manifestHash,
    contentHash,
    configurationHash: EMPTY_CONFIGURATION_HASH,
    resolvedDependencies: resolvedDependenciesFor(candidate.manifest, selectedManifestByPackageId),
    contentFiles
  }
}

export const createThirdPartyDataPackLockfileDraft = (
  options: CreateThirdPartyDataPackLockfileDraftOptions
): ThirdPartyDataPackLockfileDraftResult => {
  const { candidateSnapshot, discoveryReport, selectionReport } = options
  const baseResult = {
    diagnostics: candidateSnapshot.diagnostics,
    selectedPackageIds: [...candidateSnapshot.selectedPackageIds],
    blockedPackageIds: [...candidateSnapshot.blockedPackageIds],
    loadOrder: [...candidateSnapshot.loadOrder],
    registryCount: candidateSnapshot.registryCount,
    entryCount: candidateSnapshot.entryCount,
    officialIdentity: candidateSnapshot.officialIdentity,
    candidateIdentity: candidateSnapshot.candidateIdentity
  }

  if (candidateSnapshot.status === 'skipped') {
    return {
      status: 'skipped',
      ...baseResult
    }
  }

  if (
    candidateSnapshot.status !== 'valid'
    || !candidateSnapshot.candidateIdentity
    || !candidateSnapshot.candidateSnapshot
  ) {
    return {
      status: 'invalid',
      ...baseResult,
      diagnostics: [
        ...candidateSnapshot.diagnostics,
        createLockfileDiagnostic('third-party.lockfile-draft.candidate', {
          details: {
            reason: 'A lockfile draft requires a valid candidate registry snapshot.',
            candidateStatus: candidateSnapshot.status
          }
        })
      ]
    }
  }

  const candidates = candidatesByPackageId(discoveryReport)
  const selectedVersions = selectedVersionsByPackageId(selectionReport)
  const selectedManifestByPackageId = new Map<PackageId, PackageManifest>()
  for (const packageId of selectionReport.loadOrder) {
    const candidate = candidates.get(packageId)
    if (candidate?.manifest) selectedManifestByPackageId.set(packageId, candidate.manifest)
  }

  const diagnostics: ModDiagnostic[] = []
  const packages: ThirdPartyDataPackLockfileDraftPackage[] = []
  for (let loadIndex = 0; loadIndex < selectionReport.loadOrder.length; loadIndex += 1) {
    const packageId = selectionReport.loadOrder[loadIndex]!
    const candidate = candidates.get(packageId)
    const version = selectedVersions.get(packageId)
    if (!candidate || !candidate.manifest || !version) {
      diagnostics.push(createLockfileDiagnostic('third-party.lockfile-draft.package', {
        packageId,
        relatedPackageIds: [packageId],
        fieldPath: `/loadOrder/${loadIndex}`,
        details: {
          reason: 'Selected package could not be resolved from discovery and selection reports.'
        }
      }))
      continue
    }

    const packageDraft = createPackageDraft(candidate, packageId, version, loadIndex, selectedManifestByPackageId)
    if (!packageDraft) {
      diagnostics.push(createLockfileDiagnostic('third-party.lockfile-draft.package', {
        packageId,
        relatedPackageIds: [packageId],
        fieldPath: `/packages/${loadIndex}`,
        details: {
          reason: 'Selected package is missing a validated manifest.'
        }
      }))
      continue
    }
    packages.push(packageDraft)
  }

  if (diagnostics.some(isBlockingDiagnostic)) {
    return {
      status: 'invalid',
      ...baseResult,
      diagnostics: [...candidateSnapshot.diagnostics, ...diagnostics]
    }
  }

  const selectedPackageIds = selectionReport.selectedPackages.map(pkg => pkg.packageId)
  const body = createDraftBody({
    formatVersion: 1,
    kind: 'third-party-data-pack-lockfile-draft',
    officialIdentity: candidateSnapshot.officialIdentity,
    candidateIdentity: candidateSnapshot.candidateIdentity,
    registryCount: candidateSnapshot.registryCount,
    entryCount: candidateSnapshot.entryCount,
    selectedPackageIds,
    loadOrder: [...selectionReport.loadOrder],
    packages
  })

  return {
    status: 'valid',
    ...baseResult,
    selectedPackageIds,
    blockedPackageIds: [],
    diagnostics: [...candidateSnapshot.diagnostics],
    draft: {
      ...body,
      lockfileHash: hashCanonicalJson(body)
    }
  }
}

const compareOfficialIdentity = (
  actual: ThirdPartyCandidateOfficialIdentitySummary,
  expected: ThirdPartyCandidateOfficialIdentitySummary
): ModDiagnostic[] => {
  const diagnostics: ModDiagnostic[] = []
  const fields = [
    'artifactHash',
    'contentHash',
    'schemaSetHash',
    'environmentHash',
    'snapshotHash',
    'registryCount',
    'entryCount'
  ] as const
  for (const field of fields) {
    if (actual[field] === expected[field]) continue
    diagnostics.push(createLockfileDiagnostic('third-party.lockfile-draft.official-baseline', {
      fieldPath: `/officialIdentity/${field}`,
      details: {
        reason: 'Official baseline identity does not match the current candidate.',
        field,
        expected: String(expected[field]),
        actual: String(actual[field])
      }
    }))
  }
  return diagnostics
}

const comparePackageDrafts = (
  actual: ThirdPartyDataPackLockfileDraft,
  expected: ThirdPartyDataPackLockfileDraft
): ModDiagnostic[] => {
  const diagnostics: ModDiagnostic[] = []
  const expectedByPackageId = new Map(expected.packages.map(pkg => [pkg.packageId, pkg]))
  const actualByPackageId = new Map(actual.packages.map(pkg => [pkg.packageId, pkg]))

  for (const expectedPackage of expected.packages) {
    const actualPackage = actualByPackageId.get(expectedPackage.packageId)
    if (!actualPackage) continue
    const packageIndex = actual.packages.findIndex(pkg => pkg.packageId === expectedPackage.packageId)
    if (actualPackage.version !== expectedPackage.version) {
      diagnostics.push(createLockfileDiagnostic('third-party.lockfile-draft.package-version', {
        packageId: expectedPackage.packageId,
        relatedPackageIds: [expectedPackage.packageId],
        fieldPath: `/packages/${packageIndex}/version`,
        details: {
          reason: 'Package version does not match the current candidate.',
          expected: expectedPackage.version,
          actual: actualPackage.version
        }
      }))
    }
    if (actualPackage.manifestHash !== expectedPackage.manifestHash) {
      diagnostics.push(createLockfileDiagnostic('third-party.lockfile-draft.package-manifest-hash', {
        packageId: expectedPackage.packageId,
        relatedPackageIds: [expectedPackage.packageId],
        fieldPath: `/packages/${packageIndex}/manifestHash`,
        details: {
          reason: 'Package manifest hash does not match the current candidate.',
          expected: expectedPackage.manifestHash,
          actual: actualPackage.manifestHash
        }
      }))
    }
    if (actualPackage.contentHash !== expectedPackage.contentHash) {
      diagnostics.push(createLockfileDiagnostic('third-party.lockfile-draft.package-content-hash', {
        packageId: expectedPackage.packageId,
        relatedPackageIds: [expectedPackage.packageId],
        fieldPath: `/packages/${packageIndex}/contentHash`,
        details: {
          reason: 'Package content hash does not match the current candidate.',
          expected: expectedPackage.contentHash,
          actual: actualPackage.contentHash
        }
      }))
    }
  }

  for (const actualPackage of actual.packages) {
    if (expectedByPackageId.has(actualPackage.packageId)) continue
    diagnostics.push(createLockfileDiagnostic('third-party.lockfile-draft.package-set', {
      packageId: actualPackage.packageId,
      relatedPackageIds: [actualPackage.packageId],
      fieldPath: '/packages',
      details: {
        reason: 'Draft contains a package that is not selected in the current candidate.'
      }
    }))
  }

  return diagnostics
}

export const validateThirdPartyDataPackLockfileDraft = (
  options: ValidateThirdPartyDataPackLockfileDraftOptions
): ThirdPartyDataPackLockfileDraftValidationResult => {
  const created = createThirdPartyDataPackLockfileDraft(options)
  const draftSchemaResult = options.draft === undefined
    ? undefined
    : validateUnknown(ThirdPartyDataPackLockfileDraftSchema, options.draft, {
        stage: 'third-party.lockfile-draft.schema',
        file: 'third-party-data-pack-lockfile-draft.schema.json'
      })
  if (draftSchemaResult && !draftSchemaResult.ok) {
    return {
      status: 'invalid',
      diagnostics: draftSchemaResult.diagnostics,
      expectedDraft: created.status === 'valid' ? created.draft : undefined
    }
  }
  const draft = draftSchemaResult?.data as ThirdPartyDataPackLockfileDraft | undefined

  if (created.status === 'skipped') {
    return draft
      ? {
          status: 'invalid',
          diagnostics: [
            createLockfileDiagnostic('third-party.lockfile-draft.skipped', {
              details: {
                reason: 'No third-party packages are selected, but a lockfile draft was provided.'
              }
            })
          ]
        }
      : {
          status: 'valid',
          diagnostics: []
        }
  }

  if (created.status !== 'valid' || !created.draft) {
    return {
      status: 'invalid',
      diagnostics: created.diagnostics
    }
  }

  if (!draft) {
    return {
      status: 'invalid',
      expectedDraft: created.draft,
      diagnostics: [
        createLockfileDiagnostic('third-party.lockfile-draft.missing', {
          details: {
            reason: 'No lockfile draft was provided for validation.'
          }
        })
      ]
    }
  }

  const diagnostics: ModDiagnostic[] = []
  if (draft.formatVersion !== created.draft.formatVersion) {
    diagnostics.push(createLockfileDiagnostic('third-party.lockfile-draft.format', {
      fieldPath: '/formatVersion',
      details: {
        reason: 'Lockfile draft format version does not match.',
        expected: created.draft.formatVersion,
        actual: draft.formatVersion
      }
    }))
  }

  if (!arraysEqual(draft.selectedPackageIds, created.draft.selectedPackageIds)) {
    diagnostics.push(createLockfileDiagnostic('third-party.lockfile-draft.package-set', {
      fieldPath: '/selectedPackageIds',
      relatedPackageIds: sortPackageIds(new Set([
        ...draft.selectedPackageIds,
        ...created.draft.selectedPackageIds
      ])),
      details: {
        reason: 'Selected package ids do not match the current candidate.',
        expected: created.draft.selectedPackageIds.join(', '),
        actual: draft.selectedPackageIds.join(', ')
      }
    }))
  }

  if (!arraysEqual(draft.loadOrder, created.draft.loadOrder)) {
    diagnostics.push(createLockfileDiagnostic('third-party.lockfile-draft.load-order', {
      fieldPath: '/loadOrder',
      relatedPackageIds: sortPackageIds(new Set([
        ...draft.loadOrder,
        ...created.draft.loadOrder
      ])),
      details: {
        reason: 'Load order does not match the current candidate.',
        expected: created.draft.loadOrder.join(', '),
        actual: draft.loadOrder.join(', ')
      }
    }))
  }

  diagnostics.push(...compareOfficialIdentity(draft.officialIdentity, created.draft.officialIdentity))
  diagnostics.push(...comparePackageDrafts(draft, created.draft))

  const expectedHash = hashCanonicalJson(createDraftBody(draft))
  if (draft.lockfileHash !== expectedHash) {
    diagnostics.push(createLockfileDiagnostic('third-party.lockfile-draft.self-hash', {
      fieldPath: '/lockfileHash',
      details: {
        reason: 'Lockfile draft self hash does not match its canonical body.',
        expected: expectedHash,
        actual: draft.lockfileHash
      }
    }))
  }

  if (draft.lockfileHash !== created.draft.lockfileHash) {
    diagnostics.push(createLockfileDiagnostic('third-party.lockfile-draft.hash', {
      fieldPath: '/lockfileHash',
      details: {
        reason: 'Lockfile draft hash does not match the current candidate.',
        expected: created.draft.lockfileHash,
        actual: draft.lockfileHash
      }
    }))
  }

  return {
    status: diagnostics.some(isBlockingDiagnostic) ? 'invalid' : 'valid',
    diagnostics,
    expectedDraft: created.draft
  }
}
