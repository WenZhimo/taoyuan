import type { ModDiagnostic } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type { ThirdPartyDataPackDiscoveryReport } from './thirdPartyDataPackDiscovery'
import {
  buildThirdPartyDataPackRuntimeAdapterGate,
  type BuildThirdPartyDataPackRuntimeAdapterGateOptions,
  type ThirdPartyDataPackRuntimeAdapterGateResult
} from './thirdPartyDataPackRuntimeAdapterGate'

export type ThirdPartyDataPackSourceAdapterGateStatus = 'deferred' | 'skipped' | 'blocked'

export type ThirdPartyDataPackSourceContractReadiness = 'defined'
export type ThirdPartyDataPackSourceContractRequirementId =
  | 'source-identity-validation'
  | 'pure-json-read-boundary'
  | 'normalized-relative-paths'
  | 'permission-revocation-diagnostics'
  | 'source-lifecycle-release'

export interface ThirdPartyDataPackSourceContractRequirement {
  readonly id: ThirdPartyDataPackSourceContractRequirementId
  readonly status: 'satisfied'
  readonly reason: string
}

export interface ThirdPartyDataPackSourceAdapterGateEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly electronIpcExposed: false
  readonly webImportPersisted: false
  readonly androidImportPersisted: false
  readonly platformSourceOpened: false
  readonly sourceHandlesRetained: false
  readonly packageFilesWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
}

export interface ThirdPartyDataPackSourceAdapterGateResult {
  readonly status: ThirdPartyDataPackSourceAdapterGateStatus
  readonly runtimeAdapterGateStatus: ThirdPartyDataPackRuntimeAdapterGateResult['status']
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
  readonly sourceContractReadiness: ThirdPartyDataPackSourceContractReadiness
  readonly contentPackageSourceContractStable: true
  readonly runtimeEnablementAllowed: false
  readonly requiredSourceContracts: readonly ThirdPartyDataPackSourceContractRequirement[]
  readonly effects: ThirdPartyDataPackSourceAdapterGateEffectSummary
}

export interface BuildThirdPartyDataPackSourceAdapterGateOptions extends BuildThirdPartyDataPackRuntimeAdapterGateOptions {
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly runtimeAdapterGate?: ThirdPartyDataPackRuntimeAdapterGateResult
}

const createEffectSummary = (): ThirdPartyDataPackSourceAdapterGateEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  electronIpcExposed: false,
  webImportPersisted: false,
  androidImportPersisted: false,
  platformSourceOpened: false,
  sourceHandlesRetained: false,
  packageFilesWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false
})

const satisfiedSourceContracts = (): readonly ThirdPartyDataPackSourceContractRequirement[] => [
  {
    id: 'source-identity-validation',
    status: 'satisfied',
    reason: 'ContentPackageSource identities are validated for contract version, kind, sourceId and rootPath before discovery mapping.'
  },
  {
    id: 'pure-json-read-boundary',
    status: 'satisfied',
    reason: 'Source text payloads are parsed as unknown JSON and checked for pure JSON before downstream TypeBox validation.'
  },
  {
    id: 'normalized-relative-paths',
    status: 'satisfied',
    reason: 'Source paths and discovery paths use normalized relative identifiers and reject absolute or escaping paths.'
  },
  {
    id: 'permission-revocation-diagnostics',
    status: 'satisfied',
    reason: 'Revoked, disposed, unsafe or unreadable sources are surfaced as structured discovery diagnostics with source error codes.'
  },
  {
    id: 'source-lifecycle-release',
    status: 'satisfied',
    reason: 'ContentPackageSource exposes an explicit dispose lifecycle and the developer CLI releases its source after each check.'
  }
]

const baseResult = (
  status: ThirdPartyDataPackSourceAdapterGateStatus,
  reason: string,
  runtimeAdapterGate: ThirdPartyDataPackRuntimeAdapterGateResult
): ThirdPartyDataPackSourceAdapterGateResult => ({
  status,
  runtimeAdapterGateStatus: runtimeAdapterGate.status,
  reason,
  diagnostics: [...runtimeAdapterGate.diagnostics],
  selectedPackageIds: [...runtimeAdapterGate.selectedPackageIds],
  blockedPackageIds: [...runtimeAdapterGate.blockedPackageIds],
  blockedCandidatePaths: [...runtimeAdapterGate.blockedCandidatePaths],
  loadOrder: [...runtimeAdapterGate.loadOrder],
  registryCount: runtimeAdapterGate.registryCount,
  entryCount: runtimeAdapterGate.entryCount,
  packageCount: runtimeAdapterGate.packageCount,
  officialIdentity: runtimeAdapterGate.officialIdentity,
  candidateIdentity: runtimeAdapterGate.candidateIdentity,
  lockfileHash: runtimeAdapterGate.lockfileHash,
  sourceContractReadiness: 'defined',
  contentPackageSourceContractStable: true,
  runtimeEnablementAllowed: false,
  requiredSourceContracts: satisfiedSourceContracts(),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackSourceAdapterGate = (
  options: BuildThirdPartyDataPackSourceAdapterGateOptions
): ThirdPartyDataPackSourceAdapterGateResult => {
  const runtimeAdapterGate = options.runtimeAdapterGate ?? buildThirdPartyDataPackRuntimeAdapterGate(options)

  if (runtimeAdapterGate.status === 'skipped') {
    return baseResult(
      'skipped',
      'no selected third-party data packs',
      runtimeAdapterGate
    )
  }

  if (runtimeAdapterGate.status === 'blocked') {
    return baseResult(
      'blocked',
      runtimeAdapterGate.reason,
      runtimeAdapterGate
    )
  }

  return baseResult(
    'deferred',
    'content package source contract is defined; runtime platform source adapters remain intentionally deferred',
    runtimeAdapterGate
  )
}
