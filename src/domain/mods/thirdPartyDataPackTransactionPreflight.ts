import type { JsonValue } from './canonicalJson'
import type { ModDiagnostic, ModDiagnosticSeverity } from './diagnostics'
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

const freezeEffectSummary = (
  effects: ThirdPartyDataPackTransactionPreflightEffectSummary
): ThirdPartyDataPackTransactionPreflightEffectSummary => Object.freeze(effects)

const freezeTransactionRequirement = (
  requirement: ThirdPartyDataPackTransactionRequirement
): ThirdPartyDataPackTransactionRequirement => Object.freeze(requirement)

const freezeTransactionRequirements = (
  requirements: readonly ThirdPartyDataPackTransactionRequirement[]
): readonly ThirdPartyDataPackTransactionRequirement[] =>
  Object.freeze(requirements.map(requirement => freezeTransactionRequirement(requirement)))

const freezeLifecycleStageSummary = (
  stage: ThirdPartyDataPackTransactionLifecycleStageSummary
): ThirdPartyDataPackTransactionLifecycleStageSummary => Object.freeze(stage)

const freezeLifecycleStageSummaries = (
  stages: readonly ThirdPartyDataPackTransactionLifecycleStageSummary[]
): readonly ThirdPartyDataPackTransactionLifecycleStageSummary[] =>
  Object.freeze(stages.map(stage => freezeLifecycleStageSummary(stage)))

const freezeLifecycleOperationSummary = (
  operation: ThirdPartyDataPackTransactionLifecycleOperationSummary
): ThirdPartyDataPackTransactionLifecycleOperationSummary => Object.freeze({
  ...operation,
  stages: freezeLifecycleStageSummaries(operation.stages)
})

const freezeLifecycleOperations = (
  operations: readonly ThirdPartyDataPackTransactionLifecycleOperationSummary[]
): readonly ThirdPartyDataPackTransactionLifecycleOperationSummary[] =>
  Object.freeze(operations.map(operation => freezeLifecycleOperationSummary(operation)))

const cloneOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateOfficialIdentitySummary => ({ ...identity })

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : { ...identity }

const diagnosticCopyFallbackCode = 'LIFECYCLE-TRANSACTION-001'
const diagnosticCopyFallbackStage = 'third-party.transaction-preflight.diagnostic-copy'
const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnostic['recovery']>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

const readDiagnosticDataField = (
  diagnostic: ModDiagnostic,
  fieldName: keyof ModDiagnostic
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(diagnostic, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readDiagnosticStringField = (
  diagnostic: ModDiagnostic,
  fieldName: keyof ModDiagnostic
): string | undefined => {
  const value = readDiagnosticDataField(diagnostic, fieldName)
  return typeof value === 'string' ? value : undefined
}

const readDiagnosticArrayLength = (value: readonly unknown[]): number | undefined => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  } catch {
    return undefined
  }
  return descriptor && 'value' in descriptor
    && typeof descriptor.value === 'number'
    && Number.isSafeInteger(descriptor.value)
    && descriptor.value >= 0
    ? descriptor.value
    : undefined
}

const cloneDiagnosticPackageIds = (value: unknown): PackageId[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const length = readDiagnosticArrayLength(value)
  if (length === undefined) return undefined

  const result: PackageId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor && typeof descriptor.value === 'string') {
      result.push(descriptor.value as PackageId)
    }
  }
  return Object.freeze(result) as PackageId[]
}

const cloneStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const length = readDiagnosticArrayLength(value)
  if (length === undefined) return []

  const result: string[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor && typeof descriptor.value === 'string') {
      result.push(descriptor.value)
    }
  }
  return Object.freeze(result) as string[]
}

const clonePackageIds = (value: unknown): PackageId[] =>
  cloneStringList(value) as PackageId[]

const fallbackMessageKey = (code: string): string =>
  `mods.error.${code.toLowerCase().replace(/-/g, '.')}`

const readJsonArrayLength = (value: readonly JsonValue[]): number | undefined => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  } catch {
    return undefined
  }
  return descriptor && 'value' in descriptor
    && typeof descriptor.value === 'number'
    && Number.isSafeInteger(descriptor.value)
    && descriptor.value >= 0
    ? descriptor.value
    : undefined
}

const cloneJsonValue = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) {
    const length = readJsonArrayLength(value)
    if (length === undefined) return []

    const result: JsonValue[] = []
    for (let index = 0; index < length; index += 1) {
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
      } catch {
        result.push(null)
        continue
      }
      result.push(descriptor?.enumerable === true && 'value' in descriptor
        ? cloneJsonValue(descriptor.value as JsonValue)
        : null)
    }
    return result
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, JsonValue> = {}
    let keys: readonly (string | symbol)[]
    try {
      keys = Reflect.ownKeys(value)
    } catch {
      return result
    }
    for (const key of keys) {
      if (typeof key !== 'string') continue
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value, key)
      } catch {
        continue
      }
      if (descriptor?.enumerable === true && 'value' in descriptor) {
        result[key] = cloneJsonValue(descriptor.value as JsonValue)
      }
    }
    return result
  }
  return value
}

const cloneDiagnosticDetails = (
  details: ModDiagnostic['details']
): ModDiagnostic['details'] => {
  if (details === undefined) return undefined
  const result: Record<string, JsonValue> = {}
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(details)
  } catch {
    return result
  }
  for (const key of keys) {
    if (typeof key !== 'string') continue
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(details, key)
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor) {
      result[key] = cloneJsonValue(descriptor.value as JsonValue)
    }
  }
  return result
}

const cloneDiagnostic = (diagnostic: ModDiagnostic): ModDiagnostic => {
  const code = readDiagnosticStringField(diagnostic, 'code') ?? diagnosticCopyFallbackCode
  const severity = readDiagnosticDataField(diagnostic, 'severity')
  const recovery = readDiagnosticDataField(diagnostic, 'recovery')
  return {
    code,
    ruleId: readDiagnosticStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readDiagnosticStringField(diagnostic, 'stage') ?? diagnosticCopyFallbackStage,
    messageKey: readDiagnosticStringField(diagnostic, 'messageKey') ?? fallbackMessageKey(code),
    packageId: readDiagnosticStringField(diagnostic, 'packageId') as PackageId | undefined,
    file: readDiagnosticStringField(diagnostic, 'file'),
    fieldPath: readDiagnosticStringField(diagnostic, 'fieldPath'),
    registryId: readDiagnosticStringField(diagnostic, 'registryId') as ModDiagnostic['registryId'],
    contentId: readDiagnosticStringField(diagnostic, 'contentId') as ModDiagnostic['contentId'],
    relatedPackageIds: cloneDiagnosticPackageIds(readDiagnosticDataField(diagnostic, 'relatedPackageIds')),
    details: cloneDiagnosticDetails(readDiagnosticDataField(diagnostic, 'details') as ModDiagnostic['details']),
    recovery: diagnosticRecoveries.has(recovery as ModDiagnostic['recovery'])
      ? recovery as ModDiagnostic['recovery']
      : 'none'
  }
}

const cloneDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return []
  const length = readDiagnosticArrayLength(diagnostics)
  if (length === undefined) return []

  const result: ModDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor) {
      result.push(cloneDiagnostic(descriptor.value as ModDiagnostic))
    }
  }
  return result
}

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
  selectedPackageIds: clonePackageIds(runtimeGate.selectedPackageIds),
  blockedPackageIds: clonePackageIds(runtimeGate.blockedPackageIds),
  blockedCandidatePaths: cloneStringList(runtimeGate.blockedCandidatePaths),
  loadOrder: clonePackageIds(runtimeGate.loadOrder),
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
  requiredTransactions: freezeTransactionRequirements(requiredTransactions),
  lifecycleOperations: freezeLifecycleOperations(createLifecycleOperations(status, reason)),
  effects: freezeEffectSummary(createEffectSummary())
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
