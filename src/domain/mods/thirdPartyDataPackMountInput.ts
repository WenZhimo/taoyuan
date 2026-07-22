import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { RegistrySet, SerializableRegistrySnapshot } from './registry'
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
  type ThirdPartyDataPackLockfileDraft,
  type ThirdPartyDataPackLockfileDraftResult,
  type ThirdPartyDataPackLockfileDraftValidationResult
} from './thirdPartyDataPackLockfileDraft'
import {
  buildThirdPartyDataPackMountPreflight,
  type ThirdPartyDataPackMountPreflightEffectSummary,
  type ThirdPartyDataPackMountPreflightResult
} from './thirdPartyDataPackMountPreflight'
import {
  selectThirdPartyDataPacks,
  type ThirdPartyDataPackSelectionReport
} from './thirdPartyDataPackSelection'

export type ThirdPartyDataPackMountInputStatus = 'ready' | 'skipped' | 'blocked'

export interface ThirdPartyDataPackMountInputResult {
  readonly status: ThirdPartyDataPackMountInputStatus
  readonly preflightStatus: ThirdPartyDataPackMountPreflightResult['status']
  readonly reason: string
  readonly diagnostics: readonly ModDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly effects: ThirdPartyDataPackMountPreflightEffectSummary
  readonly runtimePublication: 'deferred'
  readonly preflight: ThirdPartyDataPackMountPreflightResult
  readonly candidateSnapshot?: SerializableRegistrySnapshot
  readonly candidateRegistrySet?: RegistrySet
  readonly lockfileDraft?: ThirdPartyDataPackLockfileDraft
}

export interface BuildThirdPartyDataPackMountInputOptions {
  readonly officialRegistrySet: RegistrySet
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly selectionReport?: ThirdPartyDataPackSelectionReport
  readonly candidateSnapshot?: ThirdPartyCandidateRegistrySnapshotResult
  readonly lockfileDraftResult?: ThirdPartyDataPackLockfileDraftResult
  readonly lockfileValidationResult?: ThirdPartyDataPackLockfileDraftValidationResult
  readonly preflight?: ThirdPartyDataPackMountPreflightResult
}

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

const createMountInputDiagnostic = (
  fieldPath: string,
  reason: string,
  actual?: string
): ModDiagnostic => createDiagnostic('CACHE-INVALID-001', {
  stage: 'third-party.mount-input.ready',
  severity: 'error',
  fieldPath,
  details: {
    reason,
    ...(actual ? { actual } : {})
  }
})

const validateReadyInput = (
  preflight: ThirdPartyDataPackMountPreflightResult,
  candidateSnapshot: ThirdPartyCandidateRegistrySnapshotResult,
  lockfileDraftResult: ThirdPartyDataPackLockfileDraftResult,
  lockfileValidationResult: ThirdPartyDataPackLockfileDraftValidationResult
): ModDiagnostic[] => {
  const diagnostics: ModDiagnostic[] = []
  if (preflight.status !== 'ready') {
    diagnostics.push(createMountInputDiagnostic(
      '/preflight/status',
      'Mount input can only be prepared from a ready preflight.',
      preflight.status
    ))
  }
  if (candidateSnapshot.status !== 'valid') {
    diagnostics.push(createMountInputDiagnostic(
      '/candidateSnapshot/status',
      'Mount input requires a valid candidate registry snapshot.',
      candidateSnapshot.status
    ))
  }
  if (!candidateSnapshot.candidateRegistrySet) {
    diagnostics.push(createMountInputDiagnostic(
      '/candidateRegistrySet',
      'Mount input requires the frozen in-memory candidate RegistrySet.'
    ))
  } else if (candidateSnapshot.candidateRegistrySet.currentPhase !== 'frozen') {
    diagnostics.push(createMountInputDiagnostic(
      '/candidateRegistrySet/currentPhase',
      'Mount input candidate RegistrySet must already be frozen.',
      candidateSnapshot.candidateRegistrySet.currentPhase
    ))
  }
  if (!candidateSnapshot.candidateSnapshot) {
    diagnostics.push(createMountInputDiagnostic(
      '/candidateSnapshot/candidateSnapshot',
      'Mount input requires the serializable candidate snapshot.'
    ))
  }
  if (!candidateSnapshot.candidateIdentity) {
    diagnostics.push(createMountInputDiagnostic(
      '/candidateSnapshot/candidateIdentity',
      'Mount input requires the candidate identity summary.'
    ))
  }
  if (lockfileDraftResult.status !== 'valid' || !lockfileDraftResult.draft) {
    diagnostics.push(createMountInputDiagnostic(
      '/lockfileDraft/status',
      'Mount input requires a valid in-memory lockfile draft.',
      lockfileDraftResult.status
    ))
  }
  if (lockfileValidationResult.status !== 'valid') {
    diagnostics.push(createMountInputDiagnostic(
      '/lockfileValidation/status',
      'Mount input requires lockfile draft validation to pass.',
      lockfileValidationResult.status
    ))
  }
  if (
    candidateSnapshot.candidateIdentity
    && preflight.candidateIdentity
    && candidateSnapshot.candidateIdentity.candidateHash !== preflight.candidateIdentity.candidateHash
  ) {
    diagnostics.push(createMountInputDiagnostic(
      '/candidateIdentity/candidateHash',
      'Preflight candidate hash does not match the candidate snapshot result.'
    ))
  }
  if (
    lockfileDraftResult.draft
    && preflight.lockfileHash
    && lockfileDraftResult.draft.lockfileHash !== preflight.lockfileHash
  ) {
    diagnostics.push(createMountInputDiagnostic(
      '/lockfileHash',
      'Preflight lockfile hash does not match the lockfile draft result.'
    ))
  }
  return diagnostics
}

const baseResult = (
  status: ThirdPartyDataPackMountInputStatus,
  reason: string,
  preflight: ThirdPartyDataPackMountPreflightResult,
  diagnostics: readonly ModDiagnostic[]
): Omit<
  ThirdPartyDataPackMountInputResult,
  'candidateSnapshot' | 'candidateRegistrySet' | 'lockfileDraft'
> => ({
  status,
  preflightStatus: preflight.status,
  reason,
  diagnostics: uniqueDiagnostics(diagnostics),
  selectedPackageIds: [...preflight.selectedPackageIds],
  blockedPackageIds: [...preflight.blockedPackageIds],
  blockedCandidatePaths: [...preflight.blockedCandidatePaths],
  loadOrder: [...preflight.loadOrder],
  registryCount: preflight.registryCount,
  entryCount: preflight.entryCount,
  packageCount: preflight.packageCount,
  officialIdentity: preflight.officialIdentity,
  candidateIdentity: preflight.candidateIdentity,
  lockfileHash: preflight.lockfileHash,
  effects: preflight.effects,
  runtimePublication: 'deferred',
  preflight
})

export const buildThirdPartyDataPackMountInput = (
  options: BuildThirdPartyDataPackMountInputOptions
): ThirdPartyDataPackMountInputResult => {
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
  const preflight = options.preflight ?? buildThirdPartyDataPackMountPreflight({
    officialRegistrySet: options.officialRegistrySet,
    discoveryReport: options.discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult
  })

  if (preflight.status === 'skipped') {
    return baseResult('skipped', 'no selected third-party data packs', preflight, preflight.diagnostics)
  }

  if (preflight.status !== 'ready') {
    return baseResult('blocked', preflight.rollback.reason, preflight, preflight.diagnostics)
  }

  const readyDiagnostics = validateReadyInput(
    preflight,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult
  )
  if (readyDiagnostics.length > 0) {
    return baseResult('blocked', 'ready preflight is missing verified mount input artifacts', preflight, [
      ...preflight.diagnostics,
      ...readyDiagnostics
    ])
  }

  return {
    ...baseResult('ready', 'ready for future runtime mount adapter', preflight, preflight.diagnostics),
    candidateSnapshot: candidateSnapshot.candidateSnapshot,
    candidateRegistrySet: candidateSnapshot.candidateRegistrySet,
    lockfileDraft: lockfileDraftResult.draft
  }
}
