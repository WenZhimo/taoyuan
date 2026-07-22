import type { ModDiagnostic, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { RegistrySet } from './registry'
import {
  buildThirdPartyCandidateRegistrySnapshot,
  type ThirdPartyCandidateIdentitySummary,
  type ThirdPartyCandidateOfficialIdentitySummary,
  type ThirdPartyCandidateRegistrySnapshotResult
} from './thirdPartyCandidateRegistrySnapshot'
import type { ThirdPartyDataPackDiscoveryReport } from './thirdPartyDataPackDiscovery'
import {
  createThirdPartyDataPackLockfileDraft,
  validateThirdPartyDataPackLockfileDraft,
  type ThirdPartyDataPackLockfileDraftResult,
  type ThirdPartyDataPackLockfileDraftValidationResult
} from './thirdPartyDataPackLockfileDraft'
import {
  selectThirdPartyDataPacks,
  type ThirdPartyDataPackSelectionReport
} from './thirdPartyDataPackSelection'

export type ThirdPartyDataPackMountPreflightStatus = 'ready' | 'rolled-back' | 'skipped'

export type ThirdPartyDataPackMountPreflightStageName =
  | 'discovery'
  | 'selection'
  | 'candidate-snapshot'
  | 'lockfile-draft'
  | 'lockfile-validation'
  | 'runtime-publish'
  | 'rollback'

export type ThirdPartyDataPackMountPreflightStageStatus =
  | 'completed'
  | 'skipped'
  | 'failed'
  | 'deferred'

export interface ThirdPartyDataPackMountPreflightStage {
  readonly name: ThirdPartyDataPackMountPreflightStageName
  readonly status: ThirdPartyDataPackMountPreflightStageStatus
  readonly diagnostics: readonly ModDiagnostic[]
  readonly details?: Readonly<Record<string, string | number | boolean>>
}

export interface ThirdPartyDataPackMountPreflightEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly packageFilesWritten: false
  readonly cacheWritten: false
}

export interface ThirdPartyDataPackMountPreflightRollbackSummary {
  readonly required: boolean
  readonly reason: string
  readonly retainedOfficialRegistryCount: number
  readonly retainedOfficialEntryCount: number
  readonly discardedCandidateRegistry: boolean
  readonly discardedLockfileDraft: boolean
}

export interface ThirdPartyDataPackMountPreflightResult {
  readonly status: ThirdPartyDataPackMountPreflightStatus
  readonly stages: readonly ThirdPartyDataPackMountPreflightStage[]
  readonly diagnostics: readonly ModDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly packageCount: number
  readonly effects: ThirdPartyDataPackMountPreflightEffectSummary
  readonly rollback: ThirdPartyDataPackMountPreflightRollbackSummary
}

export interface BuildThirdPartyDataPackMountPreflightOptions {
  readonly officialRegistrySet: RegistrySet
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly selectionReport?: ThirdPartyDataPackSelectionReport
  readonly candidateSnapshot?: ThirdPartyCandidateRegistrySnapshotResult
  readonly lockfileDraftResult?: ThirdPartyDataPackLockfileDraftResult
  readonly lockfileValidationResult?: ThirdPartyDataPackLockfileDraftValidationResult
}

const blockingSeverities = new Set<ModDiagnosticSeverity>(['error', 'fatal'])

const hasBlockingDiagnostic = (diagnostics: readonly ModDiagnostic[]): boolean =>
  diagnostics.some(diagnostic => blockingSeverities.has(diagnostic.severity))

const uniqueDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] => {
  const seen = new Set<string>()
  const result: ModDiagnostic[] = []
  for (const diagnostic of diagnostics) {
    const key = JSON.stringify({
      code: diagnostic.code,
      stage: diagnostic.stage,
      severity: diagnostic.severity,
      packageId: diagnostic.packageId,
      file: diagnostic.file,
      fieldPath: diagnostic.fieldPath,
      registryId: diagnostic.registryId,
      contentId: diagnostic.contentId,
      relatedPackageIds: diagnostic.relatedPackageIds,
      details: diagnostic.details
    })
    if (seen.has(key)) continue
    seen.add(key)
    result.push(diagnostic)
  }
  return result
}

const createEffectSummary = (): ThirdPartyDataPackMountPreflightEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  packageFilesWritten: false,
  cacheWritten: false
})

const stage = (
  name: ThirdPartyDataPackMountPreflightStageName,
  status: ThirdPartyDataPackMountPreflightStageStatus,
  diagnostics: readonly ModDiagnostic[],
  details?: Readonly<Record<string, string | number | boolean>>
): ThirdPartyDataPackMountPreflightStage => ({
  name,
  status,
  diagnostics: uniqueDiagnostics(diagnostics),
  ...(details ? { details } : {})
})

const discoveryDiagnostics = (report: ThirdPartyDataPackDiscoveryReport): ModDiagnostic[] =>
  report.issues.flatMap(issue => issue.diagnostics)

const selectionDiagnostics = (report: ThirdPartyDataPackSelectionReport): ModDiagnostic[] =>
  report.issues.flatMap(issue => issue.diagnostics)

const discoveryStageStatus = (
  report: ThirdPartyDataPackDiscoveryReport
): ThirdPartyDataPackMountPreflightStageStatus => {
  if (report.status === 'directory-not-found' || hasBlockingDiagnostic(discoveryDiagnostics(report))) return 'failed'
  if (report.status === 'empty') return 'skipped'
  return 'completed'
}

const selectionStageStatus = (
  report: ThirdPartyDataPackSelectionReport,
  discoveryFailed: boolean
): ThirdPartyDataPackMountPreflightStageStatus => {
  if (discoveryFailed) return 'skipped'
  if (report.status !== 'completed' || hasBlockingDiagnostic(selectionDiagnostics(report))) return 'failed'
  if (report.summary.selectedPackageCount === 0) return 'skipped'
  return 'completed'
}

const candidateStageStatus = (
  candidate: ThirdPartyCandidateRegistrySnapshotResult
): ThirdPartyDataPackMountPreflightStageStatus => {
  if (candidate.status === 'valid') return 'completed'
  if (candidate.status === 'skipped') return 'skipped'
  return 'failed'
}

const draftStageStatus = (
  draft: ThirdPartyDataPackLockfileDraftResult
): ThirdPartyDataPackMountPreflightStageStatus => {
  if (draft.status === 'valid') return 'completed'
  if (draft.status === 'skipped') return 'skipped'
  return 'failed'
}

const validationStageStatus = (
  draft: ThirdPartyDataPackLockfileDraftResult,
  validation: ThirdPartyDataPackLockfileDraftValidationResult
): ThirdPartyDataPackMountPreflightStageStatus => {
  if (draft.status === 'skipped') return 'skipped'
  return validation.status === 'valid' ? 'completed' : 'failed'
}

const rollbackReason = (
  discoveryFailed: boolean,
  selectionFailed: boolean,
  candidate: ThirdPartyCandidateRegistrySnapshotResult,
  draft: ThirdPartyDataPackLockfileDraftResult,
  validation: ThirdPartyDataPackLockfileDraftValidationResult
): string => {
  if (discoveryFailed) return 'discovery failed'
  if (selectionFailed) return 'selection failed'
  if (candidate.status === 'invalid') return 'candidate snapshot failed'
  if (draft.status === 'invalid') return 'lockfile draft failed'
  if (validation.status === 'invalid') return 'lockfile draft validation failed'
  return 'not required'
}

export const buildThirdPartyDataPackMountPreflight = (
  options: BuildThirdPartyDataPackMountPreflightOptions
): ThirdPartyDataPackMountPreflightResult => {
  const selectionReport = options.selectionReport ?? selectThirdPartyDataPacks(options.discoveryReport)
  const candidateSnapshot = options.candidateSnapshot ?? buildThirdPartyCandidateRegistrySnapshot({
    officialRegistrySet: options.officialRegistrySet,
    discoveryReport: options.discoveryReport,
    selectionReport
  })
  const lockfileDraftResult = options.lockfileDraftResult ?? createThirdPartyDataPackLockfileDraft({
    discoveryReport: options.discoveryReport,
    selectionReport,
    candidateSnapshot
  })
  const lockfileValidationResult = options.lockfileValidationResult ?? validateThirdPartyDataPackLockfileDraft({
    discoveryReport: options.discoveryReport,
    selectionReport,
    candidateSnapshot,
    draft: lockfileDraftResult.draft
  })

  const discoveryStageDiagnostics = discoveryDiagnostics(options.discoveryReport)
  const selectionStageDiagnostics = selectionDiagnostics(selectionReport)
  const discoveryFailed = discoveryStageStatus(options.discoveryReport) === 'failed'
  const selectionFailed = selectionStageStatus(selectionReport, discoveryFailed) === 'failed'
  const candidateFailed = candidateSnapshot.status === 'invalid'
  const draftFailed = lockfileDraftResult.status === 'invalid'
  const validationFailed = lockfileValidationResult.status === 'invalid'
  const hasFailure = discoveryFailed || selectionFailed || candidateFailed || draftFailed || validationFailed
  const isSkipped = !hasFailure && candidateSnapshot.status === 'skipped'
  const status: ThirdPartyDataPackMountPreflightStatus = hasFailure
    ? 'rolled-back'
    : isSkipped
      ? 'skipped'
      : 'ready'
  const reason = rollbackReason(
    discoveryFailed,
    selectionFailed,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult
  )

  const stages: ThirdPartyDataPackMountPreflightStage[] = [
    stage('discovery', discoveryStageStatus(options.discoveryReport), discoveryStageDiagnostics, {
      candidateCount: options.discoveryReport.summary.candidateCount,
      validPackageCount: options.discoveryReport.summary.validPackageCount,
      invalidPackageCount: options.discoveryReport.summary.invalidPackageCount
    }),
    stage('selection', selectionStageStatus(selectionReport, discoveryFailed), selectionStageDiagnostics, {
      selectedPackageCount: selectionReport.summary.selectedPackageCount,
      blockedPackageCount: selectionReport.summary.blockedPackageCount
    }),
    stage('candidate-snapshot', candidateStageStatus(candidateSnapshot), candidateSnapshot.diagnostics, {
      registryCount: candidateSnapshot.registryCount,
      entryCount: candidateSnapshot.entryCount
    }),
    stage('lockfile-draft', draftStageStatus(lockfileDraftResult), lockfileDraftResult.diagnostics, {
      packageCount: lockfileDraftResult.draft?.packages.length ?? 0
    }),
    stage('lockfile-validation', validationStageStatus(lockfileDraftResult, lockfileValidationResult), lockfileValidationResult.diagnostics),
    stage('runtime-publish', status === 'ready' ? 'deferred' : 'skipped', [], {
      reason: 'Runtime third-party registry publication is outside this read-only preflight slice.'
    }),
    stage('rollback', status === 'rolled-back' ? 'completed' : 'skipped', [], {
      reason
    })
  ]

  const diagnostics = uniqueDiagnostics([
    ...discoveryStageDiagnostics,
    ...selectionStageDiagnostics,
    ...candidateSnapshot.diagnostics,
    ...lockfileDraftResult.diagnostics,
    ...lockfileValidationResult.diagnostics
  ])

  return {
    status,
    stages,
    diagnostics,
    selectedPackageIds: [...candidateSnapshot.selectedPackageIds],
    blockedPackageIds: [...candidateSnapshot.blockedPackageIds],
    blockedCandidatePaths: [...candidateSnapshot.blockedCandidatePaths],
    loadOrder: [...candidateSnapshot.loadOrder],
    registryCount: candidateSnapshot.registryCount,
    entryCount: candidateSnapshot.entryCount,
    officialIdentity: candidateSnapshot.officialIdentity,
    candidateIdentity: candidateSnapshot.candidateIdentity,
    lockfileHash: lockfileDraftResult.draft?.lockfileHash,
    packageCount: lockfileDraftResult.draft?.packages.length ?? 0,
    effects: createEffectSummary(),
    rollback: {
      required: status === 'rolled-back',
      reason,
      retainedOfficialRegistryCount: candidateSnapshot.officialIdentity.registryCount,
      retainedOfficialEntryCount: candidateSnapshot.officialIdentity.entryCount,
      discardedCandidateRegistry: status === 'rolled-back' && candidateSnapshot.status !== 'valid',
      discardedLockfileDraft: status === 'rolled-back' && lockfileDraftResult.status !== 'valid'
    }
  }
}
