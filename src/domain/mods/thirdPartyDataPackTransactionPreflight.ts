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
  buildThirdPartyDataPackRuntimeMountGate,
  type BuildThirdPartyDataPackRuntimeMountGateOptions,
  type ThirdPartyDataPackRuntimeMountGateResult
} from './thirdPartyDataPackRuntimeMountGate'

export type ThirdPartyDataPackTransactionPreflightStatus = 'deferred' | 'skipped' | 'blocked'
export type ThirdPartyDataPackTransactionOperation = 'install' | 'upgrade' | 'disable' | 'uninstall'
export type ThirdPartyDataPackTransactionLifecycleStage =
  | 'discovered'
  | 'staged'
  | 'verified'
  | 'resolved'
  | 'mounted'
  | 'committed'
export type ThirdPartyDataPackTransactionLifecycleStageStatus =
  | 'satisfied'
  | 'deferred'
  | 'skipped'
  | 'blocked'

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

export interface ThirdPartyDataPackTransactionLifecycleStageSummary {
  readonly id: ThirdPartyDataPackTransactionLifecycleStage
  readonly status: ThirdPartyDataPackTransactionLifecycleStageStatus
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionLifecycleOperationSummary {
  readonly operation: ThirdPartyDataPackTransactionOperation
  readonly status: ThirdPartyDataPackTransactionPreflightStatus
  readonly currentStage: ThirdPartyDataPackTransactionLifecycleStage
  readonly nextStage?: ThirdPartyDataPackTransactionLifecycleStage
  readonly commitAllowed: false
  readonly stages: readonly ThirdPartyDataPackTransactionLifecycleStageSummary[]
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
  readonly lifecycleOperations: readonly ThirdPartyDataPackTransactionLifecycleOperationSummary[]
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

const transactionLifecycleStages: readonly ThirdPartyDataPackTransactionLifecycleStage[] = [
  'discovered',
  'staged',
  'verified',
  'resolved',
  'mounted',
  'committed'
]

const transactionOperations: readonly ThirdPartyDataPackTransactionOperation[] = [
  'install',
  'upgrade',
  'disable',
  'uninstall'
]

const operationReasons: Record<ThirdPartyDataPackTransactionOperation, string> = {
  install: 'Install remains deferred until staged package writes, lockfile commit and recovery primitives exist.',
  upgrade: 'Upgrade remains deferred until previous package retention, staged replacement and rollback verification exist.',
  disable: 'Disable remains deferred until dependency re-resolution and installation settings commits exist.',
  uninstall: 'Uninstall remains deferred until a successful disable transaction, package backup policy and rollback verification exist.'
}

const createDeferredStageSummaries = (): readonly ThirdPartyDataPackTransactionLifecycleStageSummary[] =>
  transactionLifecycleStages.map(stage => {
    if (stage === 'discovered') {
      return {
        id: stage,
        status: 'satisfied',
        reason: 'Discovery, selection and candidate identity were already evaluated by the read-only upstream gates.'
      }
    }

    return {
      id: stage,
      status: 'deferred',
      reason: 'Lifecycle transaction writes and recovery primitives are not implemented in this no-write slice.'
    }
  })

const createTerminalStageSummaries = (
  status: Exclude<ThirdPartyDataPackTransactionPreflightStatus, 'deferred'>,
  reason: string
): readonly ThirdPartyDataPackTransactionLifecycleStageSummary[] =>
  transactionLifecycleStages.map(stage => ({
    id: stage,
    status,
    reason
  }))

const createLifecycleOperations = (
  status: ThirdPartyDataPackTransactionPreflightStatus,
  reason: string
): readonly ThirdPartyDataPackTransactionLifecycleOperationSummary[] =>
  transactionOperations.map(operation => {
    if (status === 'deferred') {
      return {
        operation,
        status,
        currentStage: 'discovered',
        nextStage: 'staged',
        commitAllowed: false,
        stages: createDeferredStageSummaries(),
        reason: operationReasons[operation]
      }
    }

    return {
      operation,
      status,
      currentStage: 'discovered',
      commitAllowed: false,
      stages: createTerminalStageSummaries(status, reason),
      reason
    }
  })

const baseResult = (
  status: ThirdPartyDataPackTransactionPreflightStatus,
  reason: string,
  runtimeGate: ThirdPartyDataPackRuntimeMountGateResult,
  requiredTransactions: readonly ThirdPartyDataPackTransactionRequirement[]
): ThirdPartyDataPackTransactionPreflightResult => ({
  status,
  runtimeGateStatus: runtimeGate.status,
  reason,
  diagnostics: cloneDiagnostics(runtimeGate.diagnostics),
  selectedPackageIds: [...runtimeGate.selectedPackageIds],
  blockedPackageIds: [...runtimeGate.blockedPackageIds],
  blockedCandidatePaths: [...runtimeGate.blockedCandidatePaths],
  loadOrder: [...runtimeGate.loadOrder],
  registryCount: runtimeGate.registryCount,
  entryCount: runtimeGate.entryCount,
  packageCount: runtimeGate.packageCount,
  officialIdentity: cloneOfficialIdentity(runtimeGate.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(runtimeGate.candidateIdentity),
  lockfileHash: runtimeGate.lockfileHash,
  transactionCommit: 'deferred',
  commitAllowed: false,
  recoveryRequired: false,
  rollbackRequired: false,
  requiredTransactions,
  lifecycleOperations: createLifecycleOperations(status, reason),
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
