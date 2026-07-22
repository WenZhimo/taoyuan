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

export type ThirdPartyDataPackSourceContractRequirementId =
  | 'content-package-source-identity'
  | 'pure-json-read-boundary'
  | 'normalized-relative-source-paths'
  | 'permission-revocation-recovery'
  | 'source-lifetime-disposal'

export interface ThirdPartyDataPackSourceContractRequirement {
  readonly id: ThirdPartyDataPackSourceContractRequirementId
  readonly status: 'required'
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
  readonly sourceContractReadiness: 'deferred'
  readonly contentPackageSourceContractStable: false
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

const sourceContractRequirements = (): readonly ThirdPartyDataPackSourceContractRequirement[] => [
  {
    id: 'content-package-source-identity',
    status: 'required',
    reason: 'Define the stable ContentPackageSource identity fields before platform adapters can pass package sources into shared core validation.'
  },
  {
    id: 'pure-json-read-boundary',
    status: 'required',
    reason: 'Define a read boundary that treats every platform file payload as unknown pure JSON before TypeBox validation.'
  },
  {
    id: 'normalized-relative-source-paths',
    status: 'required',
    reason: 'Define normalized relative package paths that exclude absolute paths, platform separators, time, locale and permission handles from source identity.'
  },
  {
    id: 'permission-revocation-recovery',
    status: 'required',
    reason: 'Define how Electron, Web and Android adapters recover when a source permission is revoked before mount completion.'
  },
  {
    id: 'source-lifetime-disposal',
    status: 'required',
    reason: 'Define when temporary source handles must be released so validation reports do not retain platform file handles after the read-only pass.'
  }
]

const baseResult = (
  status: ThirdPartyDataPackSourceAdapterGateStatus,
  reason: string,
  runtimeAdapterGate: ThirdPartyDataPackRuntimeAdapterGateResult,
  requiredSourceContracts: readonly ThirdPartyDataPackSourceContractRequirement[]
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
  sourceContractReadiness: 'deferred',
  contentPackageSourceContractStable: false,
  runtimeEnablementAllowed: false,
  requiredSourceContracts,
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
      runtimeAdapterGate,
      []
    )
  }

  if (runtimeAdapterGate.status === 'blocked') {
    return baseResult(
      'blocked',
      runtimeAdapterGate.reason,
      runtimeAdapterGate,
      []
    )
  }

  return baseResult(
    'deferred',
    'content package source contract is intentionally deferred until stable platform source boundaries are implemented',
    runtimeAdapterGate,
    sourceContractRequirements()
  )
}
