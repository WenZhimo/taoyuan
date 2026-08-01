import type { JsonValue } from './canonicalJson'
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

const freezeEffectSummary = (
  effects: ThirdPartyDataPackRuntimeMountGateEffectSummary
): ThirdPartyDataPackRuntimeMountGateEffectSummary => Object.freeze(effects)

const freezeRuntimeMountGateRequirement = (
  requirement: ThirdPartyDataPackRuntimeMountGateRequirement
): ThirdPartyDataPackRuntimeMountGateRequirement => Object.freeze(requirement)

const freezeRuntimeMountGateRequirements = (
  requirements: readonly ThirdPartyDataPackRuntimeMountGateRequirement[]
): readonly ThirdPartyDataPackRuntimeMountGateRequirement[] =>
  Object.freeze(requirements.map(requirement => freezeRuntimeMountGateRequirement(requirement)))

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

const cloneOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateOfficialIdentitySummary => ({ ...identity })

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : { ...identity }

const cloneJsonValue = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) return value.map(item => cloneJsonValue(item))
  if (value !== null && typeof value === 'object') {
    const result: Record<string, JsonValue> = {}
    for (const [key, entryValue] of Object.entries(value)) result[key] = cloneJsonValue(entryValue)
    return result
  }
  return value
}

const cloneDiagnosticDetails = (
  details: ModDiagnostic['details']
): ModDiagnostic['details'] => {
  if (details === undefined) return undefined
  const result: Record<string, JsonValue> = {}
  for (const [key, value] of Object.entries(details)) result[key] = cloneJsonValue(value)
  return result
}

const cloneDiagnostic = (diagnostic: ModDiagnostic): ModDiagnostic => ({
  code: diagnostic.code,
  ruleId: diagnostic.ruleId,
  severity: diagnostic.severity,
  stage: diagnostic.stage,
  messageKey: diagnostic.messageKey,
  packageId: diagnostic.packageId,
  file: diagnostic.file,
  fieldPath: diagnostic.fieldPath,
  registryId: diagnostic.registryId,
  contentId: diagnostic.contentId,
  relatedPackageIds: diagnostic.relatedPackageIds ? [...diagnostic.relatedPackageIds] : undefined,
  details: cloneDiagnosticDetails(diagnostic.details),
  recovery: diagnostic.recovery
})

const cloneDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] =>
  diagnostics.map(diagnostic => cloneDiagnostic(diagnostic))

const baseResult = (
  status: ThirdPartyDataPackRuntimeMountGateStatus,
  reason: string,
  mountInput: ThirdPartyDataPackMountInputResult,
  requiredGates: readonly ThirdPartyDataPackRuntimeMountGateRequirement[]
): ThirdPartyDataPackRuntimeMountGateResult => ({
  status,
  mountInputStatus: mountInput.status,
  reason,
  diagnostics: cloneDiagnostics(mountInput.diagnostics),
  selectedPackageIds: [...mountInput.selectedPackageIds],
  blockedPackageIds: [...mountInput.blockedPackageIds],
  blockedCandidatePaths: [...mountInput.blockedCandidatePaths],
  loadOrder: [...mountInput.loadOrder],
  registryCount: mountInput.registryCount,
  entryCount: mountInput.entryCount,
  packageCount: mountInput.packageCount,
  officialIdentity: cloneOfficialIdentity(mountInput.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(mountInput.candidateIdentity),
  lockfileHash: mountInput.lockfileHash,
  runtimePublication: 'deferred',
  requiredGates: freezeRuntimeMountGateRequirements(requiredGates),
  effects: freezeEffectSummary(createEffectSummary())
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
