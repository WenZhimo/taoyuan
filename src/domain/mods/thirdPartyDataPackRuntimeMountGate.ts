import type { ModDiagnostic } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type { ThirdPartyDataPackDiscoveryReport } from './thirdPartyDataPackDiscovery'
import {
  buildThirdPartyDataPackMountInput,
  type BuildThirdPartyDataPackMountInputOptions,
  type ThirdPartyDataPackMountInputResult
} from './thirdPartyDataPackMountInput'

export type ThirdPartyDataPackRuntimeMountGateStatus = 'deferred' | 'skipped' | 'blocked'

export type ThirdPartyDataPackRuntimeMountGateRequirementId =
  | 'runtime-registry-publication'
  | 'mod-lockfile-write'
  | 'global-settings-persistence'
  | 'save-environment-binding'
  | 'lifecycle-transaction-recovery'

export interface ThirdPartyDataPackRuntimeMountGateRequirement {
  readonly id: ThirdPartyDataPackRuntimeMountGateRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimeMountGateEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly packageFilesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
}

export interface ThirdPartyDataPackRuntimeMountGateResult {
  readonly status: ThirdPartyDataPackRuntimeMountGateStatus
  readonly mountInputStatus: ThirdPartyDataPackMountInputResult['status']
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
  readonly runtimePublication: 'deferred'
  readonly requiredGates: readonly ThirdPartyDataPackRuntimeMountGateRequirement[]
  readonly effects: ThirdPartyDataPackRuntimeMountGateEffectSummary
}

export interface BuildThirdPartyDataPackRuntimeMountGateOptions extends BuildThirdPartyDataPackMountInputOptions {
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly mountInput?: ThirdPartyDataPackMountInputResult
}

const createEffectSummary = (): ThirdPartyDataPackRuntimeMountGateEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  packageFilesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false
})

const runtimeRequirements = (): readonly ThirdPartyDataPackRuntimeMountGateRequirement[] => [
  {
    id: 'runtime-registry-publication',
    status: 'required',
    reason: 'Define the atomic handoff from a verified candidate RegistrySet to the live GameApp registry.'
  },
  {
    id: 'mod-lockfile-write',
    status: 'required',
    reason: 'Define durable mod-lock.json write, validation and rollback semantics before enabling packages.'
  },
  {
    id: 'global-settings-persistence',
    status: 'required',
    reason: 'Define how installation-level enablement and package settings are persisted outside player saves.'
  },
  {
    id: 'save-environment-binding',
    status: 'required',
    reason: 'Define save content-environment protection before any third-party content can affect a save.'
  },
  {
    id: 'lifecycle-transaction-recovery',
    status: 'required',
    reason: 'Define install, upgrade, disable and uninstall transaction recovery before runtime publication.'
  }
]

const baseResult = (
  status: ThirdPartyDataPackRuntimeMountGateStatus,
  reason: string,
  mountInput: ThirdPartyDataPackMountInputResult,
  requiredGates: readonly ThirdPartyDataPackRuntimeMountGateRequirement[]
): ThirdPartyDataPackRuntimeMountGateResult => ({
  status,
  mountInputStatus: mountInput.status,
  reason,
  diagnostics: [...mountInput.diagnostics],
  selectedPackageIds: [...mountInput.selectedPackageIds],
  blockedPackageIds: [...mountInput.blockedPackageIds],
  blockedCandidatePaths: [...mountInput.blockedCandidatePaths],
  loadOrder: [...mountInput.loadOrder],
  registryCount: mountInput.registryCount,
  entryCount: mountInput.entryCount,
  packageCount: mountInput.packageCount,
  officialIdentity: mountInput.officialIdentity,
  candidateIdentity: mountInput.candidateIdentity,
  lockfileHash: mountInput.lockfileHash,
  runtimePublication: 'deferred',
  requiredGates,
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackRuntimeMountGate = (
  options: BuildThirdPartyDataPackRuntimeMountGateOptions
): ThirdPartyDataPackRuntimeMountGateResult => {
  const mountInput = options.mountInput ?? buildThirdPartyDataPackMountInput(options)

  if (mountInput.status === 'skipped') {
    return baseResult(
      'skipped',
      'no selected third-party data packs',
      mountInput,
      []
    )
  }

  if (mountInput.status === 'blocked') {
    return baseResult(
      'blocked',
      mountInput.reason,
      mountInput,
      []
    )
  }

  return baseResult(
    'deferred',
    'runtime publication is intentionally deferred until write and transaction gates are implemented',
    mountInput,
    runtimeRequirements()
  )
}
