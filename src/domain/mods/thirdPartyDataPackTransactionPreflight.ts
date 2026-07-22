import type { ModDiagnostic } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type { ThirdPartyDataPackDiscoveryReport } from './thirdPartyDataPackDiscovery'
import {
  buildThirdPartyDataPackRuntimeMountGate,
  type BuildThirdPartyDataPackRuntimeMountGateOptions,
  type ThirdPartyDataPackRuntimeMountGateResult
} from './thirdPartyDataPackRuntimeMountGate'

export type ThirdPartyDataPackTransactionPreflightStatus = 'deferred' | 'skipped' | 'blocked'

export type ThirdPartyDataPackTransactionRequirementId =
  | 'staged-package-file-transaction'
  | 'installation-settings-transaction'
  | 'mod-lockfile-atomic-commit'
  | 'transaction-recovery-log'
  | 'rollback-verification'

export interface ThirdPartyDataPackTransactionRequirement {
  readonly id: ThirdPartyDataPackTransactionRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionPreflightEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
}

export interface ThirdPartyDataPackTransactionPreflightResult {
  readonly status: ThirdPartyDataPackTransactionPreflightStatus
  readonly runtimeGateStatus: ThirdPartyDataPackRuntimeMountGateResult['status']
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
  readonly transactionCommit: 'deferred'
  readonly commitAllowed: false
  readonly recoveryRequired: false
  readonly rollbackRequired: false
  readonly requiredTransactions: readonly ThirdPartyDataPackTransactionRequirement[]
  readonly effects: ThirdPartyDataPackTransactionPreflightEffectSummary
}

export interface BuildThirdPartyDataPackTransactionPreflightOptions extends BuildThirdPartyDataPackRuntimeMountGateOptions {
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly runtimeGate?: ThirdPartyDataPackRuntimeMountGateResult
}

const createEffectSummary = (): ThirdPartyDataPackTransactionPreflightEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false
})

const transactionRequirements = (): readonly ThirdPartyDataPackTransactionRequirement[] => [
  {
    id: 'staged-package-file-transaction',
    status: 'required',
    reason: 'Define staged package file install, upgrade, disable and uninstall boundaries before any package files can be committed.'
  },
  {
    id: 'installation-settings-transaction',
    status: 'required',
    reason: 'Define atomic installation-level enablement and package settings updates outside player saves.'
  },
  {
    id: 'mod-lockfile-atomic-commit',
    status: 'required',
    reason: 'Define how the verified package set and lockfile are committed together without exposing partial state.'
  },
  {
    id: 'transaction-recovery-log',
    status: 'required',
    reason: 'Define crash recovery records for every lifecycle stage before mutating mods, settings or lockfiles.'
  },
  {
    id: 'rollback-verification',
    status: 'required',
    reason: 'Define post-failure verification that package files, settings and lockfile returned to the previous consistent state.'
  }
]

const baseResult = (
  status: ThirdPartyDataPackTransactionPreflightStatus,
  reason: string,
  runtimeGate: ThirdPartyDataPackRuntimeMountGateResult,
  requiredTransactions: readonly ThirdPartyDataPackTransactionRequirement[]
): ThirdPartyDataPackTransactionPreflightResult => ({
  status,
  runtimeGateStatus: runtimeGate.status,
  reason,
  diagnostics: [...runtimeGate.diagnostics],
  selectedPackageIds: [...runtimeGate.selectedPackageIds],
  blockedPackageIds: [...runtimeGate.blockedPackageIds],
  blockedCandidatePaths: [...runtimeGate.blockedCandidatePaths],
  loadOrder: [...runtimeGate.loadOrder],
  registryCount: runtimeGate.registryCount,
  entryCount: runtimeGate.entryCount,
  packageCount: runtimeGate.packageCount,
  officialIdentity: runtimeGate.officialIdentity,
  candidateIdentity: runtimeGate.candidateIdentity,
  lockfileHash: runtimeGate.lockfileHash,
  transactionCommit: 'deferred',
  commitAllowed: false,
  recoveryRequired: false,
  rollbackRequired: false,
  requiredTransactions,
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackTransactionPreflight = (
  options: BuildThirdPartyDataPackTransactionPreflightOptions
): ThirdPartyDataPackTransactionPreflightResult => {
  const runtimeGate = options.runtimeGate ?? buildThirdPartyDataPackRuntimeMountGate(options)

  if (runtimeGate.status === 'skipped') {
    return baseResult(
      'skipped',
      'no selected third-party data packs',
      runtimeGate,
      []
    )
  }

  if (runtimeGate.status === 'blocked') {
    return baseResult(
      'blocked',
      runtimeGate.reason,
      runtimeGate,
      []
    )
  }

  return baseResult(
    'deferred',
    'lifecycle transaction commit is intentionally deferred until atomic write and recovery primitives are implemented',
    runtimeGate,
    transactionRequirements()
  )
}
