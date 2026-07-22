import metadataJson from '@/generated/mods/official-precompiled-metadata.json'
import { Type, type TSchema } from '@sinclair/typebox'
import { hashCanonicalJson, type Sha256Hash } from './hash'
import {
  requireContentId,
  requireRegistryTypeId,
  type ContentId,
  type PackageId,
  type RegistryTypeId
} from './ids'
import {
  createSerializableRegistrySnapshot,
  RegistryError,
  RegistrySet,
  type RegistryEntry,
  type RegistryEntrySource,
  type SerializableRegistrySnapshot
} from './registry'
import { validateUnknown } from './schemaValidation'
import { OFFICIAL_REGISTRY_SCHEMAS } from './schemas'
import { validateRegistrySemantics } from './semanticValidation'
import { OFFICIAL_REGISTRY_DEFINITIONS } from './staticAdapters'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import { createOfficialContentHash } from './officialPrecompiled'
import {
  type ThirdPartyDataPackCandidate,
  type ThirdPartyDataPackDiscoveryReport
} from './thirdPartyDataPackDiscovery'
import {
  selectThirdPartyDataPacks,
  type ThirdPartyDataPackSelectionReport
} from './thirdPartyDataPackSelection'

export type ThirdPartyCandidateRegistrySnapshotStatus = 'valid' | 'invalid' | 'skipped'

export interface ThirdPartyCandidateRegistrySnapshotSourceSummary {
  readonly discoveryStatus: ThirdPartyDataPackDiscoveryReport['status']
  readonly candidateCount: number
  readonly validPackageCount: number
  readonly invalidPackageCount: number
  readonly selectedPackageCount: number
  readonly blockedPackageCount: number
  readonly issueCount: number
}

export interface ThirdPartyCandidateOfficialIdentitySummary {
  readonly artifactHash: Sha256Hash
  readonly contentHash: Sha256Hash
  readonly schemaSetHash: Sha256Hash
  readonly environmentHash: Sha256Hash
  readonly snapshotHash: Sha256Hash
  readonly registryCount: number
  readonly entryCount: number
}

export interface ThirdPartyCandidateIdentitySummary {
  readonly formatVersion: 1
  readonly contentHash: Sha256Hash
  readonly snapshotHash: Sha256Hash
  readonly candidateHash: Sha256Hash
}

export interface ThirdPartyCandidateRegistrySnapshotResult {
  readonly status: ThirdPartyCandidateRegistrySnapshotStatus
  readonly sourceSummary: ThirdPartyCandidateRegistrySnapshotSourceSummary
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly diagnostics: readonly ModDiagnostic[]
  readonly registryCount: number
  readonly entryCount: number
  readonly officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly candidateSnapshot?: SerializableRegistrySnapshot
  readonly candidateRegistrySet?: RegistrySet
}

export interface BuildThirdPartyCandidateRegistrySnapshotOptions {
  readonly officialRegistrySet: RegistrySet
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly selectionReport?: ThirdPartyDataPackSelectionReport
}

interface CandidateContentSource {
  readonly packageId: PackageId
  readonly candidatePath: string
  readonly registryId: RegistryTypeId
  readonly contentId: ContentId
  readonly file: string
  readonly index: number
}

const schemaEntries = Object.entries(OFFICIAL_REGISTRY_SCHEMAS) as Array<
  [string, TSchema]
>

const blockingSeverity = new Set(['error', 'fatal'])

const isBlockingDiagnostic = (diagnostic: ModDiagnostic): boolean =>
  blockingSeverity.has(diagnostic.severity)

const countRegistryEntries = (registrySet: RegistrySet): {
  readonly registryCount: number
  readonly entryCount: number
} => {
  const registryIds = registrySet.registryIds()
  return {
    registryCount: registryIds.length,
    entryCount: registryIds.reduce(
      (total, registryId) => total + registrySet.get(registryId).entries().length,
      0
    )
  }
}

const createOfficialIdentitySummary = (
  officialRegistrySet: RegistrySet
): ThirdPartyCandidateOfficialIdentitySummary => {
  const snapshot = createSerializableRegistrySnapshot(officialRegistrySet)
  const counts = countRegistryEntries(officialRegistrySet)
  return {
    artifactHash: metadataJson.artifactHash as Sha256Hash,
    contentHash: createOfficialContentHash(snapshot),
    schemaSetHash: metadataJson.schemaSetHash as Sha256Hash,
    environmentHash: metadataJson.environmentHash as Sha256Hash,
    snapshotHash: snapshot.snapshotHash as Sha256Hash,
    ...counts
  }
}

const createSourceSummary = (
  discoveryReport: ThirdPartyDataPackDiscoveryReport,
  selectionReport: ThirdPartyDataPackSelectionReport
): ThirdPartyCandidateRegistrySnapshotSourceSummary => ({
  discoveryStatus: discoveryReport.status,
  candidateCount: discoveryReport.summary.candidateCount,
  validPackageCount: discoveryReport.summary.validPackageCount,
  invalidPackageCount: discoveryReport.summary.invalidPackageCount,
  selectedPackageCount: selectionReport.summary.selectedPackageCount,
  blockedPackageCount: selectionReport.summary.blockedPackageCount,
  issueCount: discoveryReport.summary.issueCount + selectionReport.summary.issueCount
})

const createBaseResult = (
  options: {
    status: ThirdPartyCandidateRegistrySnapshotStatus
    officialRegistrySet: RegistrySet
    discoveryReport: ThirdPartyDataPackDiscoveryReport
    selectionReport: ThirdPartyDataPackSelectionReport
    diagnostics: readonly ModDiagnostic[]
  }
): ThirdPartyCandidateRegistrySnapshotResult => {
  const officialIdentity = createOfficialIdentitySummary(options.officialRegistrySet)
  return {
    status: options.status,
    sourceSummary: createSourceSummary(options.discoveryReport, options.selectionReport),
    selectedPackageIds: options.selectionReport.selectedPackages.map(item => item.packageId),
    blockedPackageIds: options.selectionReport.blockedPackages
      .map(item => item.packageId)
      .filter((packageId): packageId is PackageId => packageId !== undefined),
    blockedCandidatePaths: options.selectionReport.blockedPackages.map(item => item.path),
    loadOrder: [...options.selectionReport.loadOrder],
    diagnostics: options.diagnostics,
    registryCount: officialIdentity.registryCount,
    entryCount: officialIdentity.entryCount,
    officialIdentity
  }
}

const cloneRegistryEntrySource = (
  source: RegistryEntrySource | undefined
): Omit<RegistryEntrySource, 'packageId'> | undefined => {
  if (!source) return undefined
  return {
    file: source.file,
    localId: source.localId
  }
}

const cloneRegistrySetForCandidate = (officialRegistrySet: RegistrySet): RegistrySet => {
  const candidate = new RegistrySet()
  for (const definition of OFFICIAL_REGISTRY_DEFINITIONS) candidate.defineRegistry(definition)
  candidate.freezeDefinitions()

  for (const registryId of officialRegistrySet.registryIds()) {
    const sourceRegistry = officialRegistrySet.get<RegistryEntry>(registryId)
    const targetRegistry = candidate.get<RegistryEntry>(registryId)
    for (const record of sourceRegistry.entries()) {
      targetRegistry.register(record.owner, record.entry, cloneRegistryEntrySource(record.source))
    }
  }
  return candidate
}

const collectReportDiagnostics = (
  discoveryReport: ThirdPartyDataPackDiscoveryReport,
  selectionReport: ThirdPartyDataPackSelectionReport
): ModDiagnostic[] => [
  ...discoveryReport.issues.flatMap(issue => issue.diagnostics),
  ...selectionReport.issues.flatMap(issue => issue.diagnostics)
]

const createCandidateDiagnostic = (
  code: 'PKG-DISCOVERY-001' | 'REG-DUPLICATE-001' | 'REG-FROZEN-001' | 'SCHEMA-VALIDATE-001',
  options: {
    stage: string
    packageId?: PackageId
    file?: string
    fieldPath?: string
    registryId?: RegistryTypeId
    contentId?: ContentId
    relatedPackageIds?: readonly PackageId[]
    details?: Record<string, string | number | boolean | null>
  }
): ModDiagnostic => createDiagnostic(code, {
  stage: options.stage,
  severity: 'error',
  packageId: options.packageId,
  file: options.file,
  fieldPath: options.fieldPath,
  registryId: options.registryId,
  contentId: options.contentId,
  relatedPackageIds: options.relatedPackageIds ? [...options.relatedPackageIds] : undefined,
  details: options.details
})

const validateCandidateRegistryStructure = (registrySet: RegistrySet): ModDiagnostic[] => {
  const diagnostics: ModDiagnostic[] = []
  const knownSchemaIds = new Set(schemaEntries.map(([registryId]) => registryId))

  for (const registryId of registrySet.registryIds()) {
    if (knownSchemaIds.has(registryId)) continue
    diagnostics.push(createCandidateDiagnostic('SCHEMA-VALIDATE-001', {
      stage: 'third-party.candidate.structure',
      registryId,
      details: { reason: 'Candidate registry has no TypeBox schema.' }
    }))
  }

  for (const [registryIdText, schema] of schemaEntries) {
    const registryId = requireRegistryTypeId(registryIdText)
    if (!registrySet.hasRegistry(registryId)) {
      diagnostics.push(createCandidateDiagnostic('SCHEMA-VALIDATE-001', {
        stage: 'third-party.candidate.structure',
        registryId,
        details: { reason: 'Required candidate registry is missing.' }
      }))
      continue
    }

    const values: unknown = registrySet.get<RegistryEntry>(registryId).values()
    const result = validateUnknown(Type.Array(schema), values, {
      stage: 'third-party.candidate.structure',
      file: registrySet.get(registryId).definition.schemaName
    })
    if (!result.ok) diagnostics.push(...result.diagnostics)
  }

  return diagnostics
}

const candidateByPackageId = (
  discoveryReport: ThirdPartyDataPackDiscoveryReport
): Map<PackageId, ThirdPartyDataPackCandidate> => {
  const result = new Map<PackageId, ThirdPartyDataPackCandidate>()
  for (const candidate of discoveryReport.candidates) {
    if (!candidate.packageId) continue
    if (!result.has(candidate.packageId)) result.set(candidate.packageId, candidate)
  }
  return result
}

const contentKey = (source: Pick<CandidateContentSource, 'registryId' | 'contentId'>): string =>
  `${source.registryId}\u0000${source.contentId}`

const createOfficialConflictDiagnostic = (
  source: CandidateContentSource,
  officialOwner: PackageId
): ModDiagnostic => createCandidateDiagnostic('REG-DUPLICATE-001', {
  stage: 'third-party.candidate.official-conflict',
  packageId: source.packageId,
  file: source.file,
  fieldPath: `/${source.index}/id`,
  registryId: source.registryId,
  contentId: source.contentId,
  relatedPackageIds: [officialOwner],
  details: {
    reason: 'Third-party content conflicts with an existing official registry entry.',
    candidatePath: source.candidatePath,
    officialOwner
  }
})

const createThirdPartyDuplicateDiagnostic = (
  source: CandidateContentSource,
  first: CandidateContentSource
): ModDiagnostic => createCandidateDiagnostic('REG-DUPLICATE-001', {
  stage: 'third-party.candidate.duplicate-entry',
  packageId: source.packageId,
  file: source.file,
  fieldPath: `/${source.index}/id`,
  registryId: source.registryId,
  contentId: source.contentId,
  relatedPackageIds: [first.packageId],
  details: {
    reason: 'Two selected third-party packages declare the same registry entry.',
    firstPackageId: first.packageId,
    firstFile: first.file,
    firstIndex: first.index,
    currentIndex: source.index
  }
})

const createCandidateIdentity = (
  snapshot: SerializableRegistrySnapshot,
  officialIdentity: ThirdPartyCandidateOfficialIdentitySummary,
  selectionReport: ThirdPartyDataPackSelectionReport
): ThirdPartyCandidateIdentitySummary => {
  const contentHash = createOfficialContentHash(snapshot)
  const identityBody = {
    formatVersion: 1,
    officialIdentity,
    selectedPackages: selectionReport.selectedPackages.map(item => ({
      packageId: item.packageId,
      version: item.version
    })),
    loadOrder: [...selectionReport.loadOrder],
    contentHash,
    snapshotHash: snapshot.snapshotHash
  }
  return {
    formatVersion: 1,
    contentHash,
    snapshotHash: snapshot.snapshotHash as Sha256Hash,
    candidateHash: hashCanonicalJson(identityBody)
  }
}

const registerSelectedThirdPartyEntries = (
  candidateRegistrySet: RegistrySet,
  discoveryReport: ThirdPartyDataPackDiscoveryReport,
  selectionReport: ThirdPartyDataPackSelectionReport
): ModDiagnostic[] => {
  const diagnostics: ModDiagnostic[] = []
  const candidates = candidateByPackageId(discoveryReport)
  const registeredThirdPartySources = new Map<string, CandidateContentSource>()

  for (const packageId of selectionReport.loadOrder) {
    const candidate = candidates.get(packageId)
    if (!candidate) {
      diagnostics.push(createCandidateDiagnostic('PKG-DISCOVERY-001', {
        stage: 'third-party.candidate.selection',
        packageId,
        details: { reason: 'Selected package was not present in the discovery report.' }
      }))
      continue
    }

    for (const contentFile of candidate.contentFiles) {
      const registry = candidateRegistrySet.get<RegistryEntry>(contentFile.registryId)
      for (let index = 0; index < contentFile.validatedEntries.length; index += 1) {
        const entry = contentFile.validatedEntries[index]!
        const contentId = requireContentId(entry.id)
        const source: CandidateContentSource = {
          packageId,
          candidatePath: candidate.path,
          registryId: contentFile.registryId,
          contentId,
          file: `${candidate.path}/${contentFile.path}`,
          index
        }
        const key = contentKey(source)
        const firstThirdPartySource = registeredThirdPartySources.get(key)
        if (firstThirdPartySource) {
          diagnostics.push(createThirdPartyDuplicateDiagnostic(source, firstThirdPartySource))
          continue
        }

        const officialRecord = registry.entries().find(record => requireContentId(record.entry.id) === contentId)
        if (officialRecord) {
          diagnostics.push(createOfficialConflictDiagnostic(source, officialRecord.owner))
          continue
        }

        try {
          registry.register(packageId, entry, {
            file: source.file,
            localId: contentId
          })
          registeredThirdPartySources.set(key, source)
        } catch (error) {
          diagnostics.push(error instanceof RegistryError
            ? error.diagnostic
            : createCandidateDiagnostic('SCHEMA-VALIDATE-001', {
                stage: 'third-party.candidate.register',
                packageId,
                file: source.file,
                fieldPath: `/${index}`,
                registryId: contentFile.registryId,
                contentId,
                details: {
                  reason: error instanceof Error ? error.message : String(error)
                }
              }))
        }
      }
    }
  }

  return diagnostics
}

export const buildThirdPartyCandidateRegistrySnapshot = (
  options: BuildThirdPartyCandidateRegistrySnapshotOptions
): ThirdPartyCandidateRegistrySnapshotResult => {
  const selectionReport = options.selectionReport ?? selectThirdPartyDataPacks(options.discoveryReport)
  const reportDiagnostics = collectReportDiagnostics(options.discoveryReport, selectionReport)

  if (options.discoveryReport.status === 'directory-not-found') {
    return createBaseResult({
      status: 'invalid',
      officialRegistrySet: options.officialRegistrySet,
      discoveryReport: options.discoveryReport,
      selectionReport,
      diagnostics: reportDiagnostics
    })
  }

  if (selectionReport.status !== 'completed') {
    return createBaseResult({
      status: 'invalid',
      officialRegistrySet: options.officialRegistrySet,
      discoveryReport: options.discoveryReport,
      selectionReport,
      diagnostics: reportDiagnostics
    })
  }

  if (selectionReport.loadOrder.length === 0) {
    return createBaseResult({
      status: 'skipped',
      officialRegistrySet: options.officialRegistrySet,
      discoveryReport: options.discoveryReport,
      selectionReport,
      diagnostics: reportDiagnostics
    })
  }

  const candidateRegistrySet = cloneRegistrySetForCandidate(options.officialRegistrySet)
  const registrationDiagnostics = registerSelectedThirdPartyEntries(
    candidateRegistrySet,
    options.discoveryReport,
    selectionReport
  )
  const structureDiagnostics = registrationDiagnostics.some(isBlockingDiagnostic)
    ? []
    : validateCandidateRegistryStructure(candidateRegistrySet)
  const semanticDiagnostics = [...registrationDiagnostics, ...structureDiagnostics].some(isBlockingDiagnostic)
    ? []
    : validateRegistrySemantics(candidateRegistrySet)
  const diagnostics = [
    ...reportDiagnostics,
    ...registrationDiagnostics,
    ...structureDiagnostics,
    ...semanticDiagnostics
  ]

  if (diagnostics.some(isBlockingDiagnostic)) {
    return createBaseResult({
      status: 'invalid',
      officialRegistrySet: options.officialRegistrySet,
      discoveryReport: options.discoveryReport,
      selectionReport,
      diagnostics
    })
  }

  try {
    candidateRegistrySet.freezeEntries()
  } catch (error) {
    return createBaseResult({
      status: 'invalid',
      officialRegistrySet: options.officialRegistrySet,
      discoveryReport: options.discoveryReport,
      selectionReport,
      diagnostics: [
        ...diagnostics,
        error instanceof RegistryError
          ? error.diagnostic
          : createCandidateDiagnostic('REG-FROZEN-001', {
              stage: 'third-party.candidate.freeze',
              details: {
                reason: error instanceof Error ? error.message : String(error)
              }
            })
      ]
    })
  }

  if (candidateRegistrySet.currentPhase !== 'frozen') {
    return createBaseResult({
      status: 'invalid',
      officialRegistrySet: options.officialRegistrySet,
      discoveryReport: options.discoveryReport,
      selectionReport,
      diagnostics: [
        ...diagnostics,
        createCandidateDiagnostic('REG-FROZEN-001', {
          stage: 'third-party.candidate.freeze',
          details: { reason: 'Candidate registry did not enter the frozen phase.' }
        })
      ]
    })
  }

  const candidateSnapshot = createSerializableRegistrySnapshot(candidateRegistrySet)
  const counts = countRegistryEntries(candidateRegistrySet)
  const officialIdentity = createOfficialIdentitySummary(options.officialRegistrySet)
  return {
    status: 'valid',
    sourceSummary: createSourceSummary(options.discoveryReport, selectionReport),
    selectedPackageIds: selectionReport.selectedPackages.map(item => item.packageId),
    blockedPackageIds: [],
    blockedCandidatePaths: [],
    loadOrder: [...selectionReport.loadOrder],
    diagnostics,
    ...counts,
    officialIdentity,
    candidateIdentity: createCandidateIdentity(candidateSnapshot, officialIdentity, selectionReport),
    candidateSnapshot,
    candidateRegistrySet
  }
}
