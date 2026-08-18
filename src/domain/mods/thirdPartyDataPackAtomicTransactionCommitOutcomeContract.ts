import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from './thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'

export type ThirdPartyDataPackAtomicTransactionCommitOutcomeContractStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackAtomicTransactionCommitOutcomeKind =
  | 'committed'
  | 'failed'
  | 'retry'
  | 'rollback'

export type ThirdPartyDataPackAtomicTransactionCommitOutcomeContractCheckId =
  | 'atomic-preflight-deferred'
  | 'install-command-source'
  | 'settled-commit-outcome-source'
  | 'target-package-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'outcome-kind-supported'
  | 'no-commit-source-effects-intact'

export interface ThirdPartyDataPackAtomicTransactionCommitOutcomeContractCheck {
  readonly id: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackAtomicTransactionCommitOutcomeSource {
  readonly kind: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
  readonly settled: boolean
  readonly packageId?: PackageId
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly diagnostics?: readonly unknown[]
  readonly messageKey?: string
  readonly recovery?: ModDiagnosticRecovery
  readonly retryable?: boolean
  readonly rollbackRequired?: boolean
}

export interface ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary {
  readonly selectedPackageCount: number
  readonly blockedPackageCount: number
  readonly blockedCandidateCount: number
  readonly loadOrderCount: number
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly diagnosticCount: number
}

export interface ThirdPartyDataPackAtomicTransactionCommitOutcome {
  readonly formatVersion: 1
  readonly kind: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
  readonly commandId: 'install'
  readonly packageId: PackageId
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly messageKey: string
  readonly recovery: ModDiagnosticRecovery
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly summary: ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary
  readonly diagnostics: readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[]
}

export interface ThirdPartyDataPackAtomicTransactionCommitOutcomeEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly modManagementUiMounted: false
  readonly electronIpcExposed: false
  readonly webFilePickerOpened: false
  readonly androidFilePickerOpened: false
  readonly commandDispatcherCalled: false
  readonly commandDispatched: false
  readonly atomicCommitExecutorCalled: false
  readonly transactionCommitted: false
  readonly transactionLogPrepared: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: false
  readonly lockfileWritten: false
  readonly lockfileRestored: false
  readonly settingsWritten: false
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult {
  readonly status: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractStatus
  readonly sourcePreflightStatus: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult['status']
  readonly reason: string
  readonly atomicTransactionCommitOutcomeContract: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractStatus
  readonly readOnly: true
  readonly commitOutcomeNormalized: boolean
  readonly commandDispatchAllowed: false
  readonly atomicCommitExecutionAllowed: false
  readonly transactionCommitAllowed: false
  readonly runtimePublicationCommitAllowed: false
  readonly postCommitVerificationAllowed: false
  readonly uiIpcResponseAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly writeAllowed: false
  readonly rollbackRecoveryAllowed: false
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly checks: readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeContractCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary
  readonly outcome?: ThirdPartyDataPackAtomicTransactionCommitOutcome
  readonly effects: ThirdPartyDataPackAtomicTransactionCommitOutcomeEffectSummary
}

export interface BuildThirdPartyDataPackAtomicTransactionCommitOutcomeContractOptions {
  readonly preflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
  readonly outcome: ThirdPartyDataPackAtomicTransactionCommitOutcomeSource
}

const outcomeKinds = new Set<ThirdPartyDataPackAtomicTransactionCommitOutcomeKind>([
  'committed',
  'failed',
  'retry',
  'rollback'
])
const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnosticRecovery>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

const createEffectSummary = (): ThirdPartyDataPackAtomicTransactionCommitOutcomeEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  commandDispatcherCalled: false,
  commandDispatched: false,
  atomicCommitExecutorCalled: false,
  transactionCommitted: false,
  transactionLogPrepared: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: false,
  lockfileRestored: false,
  settingsWritten: false,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const readArrayLength = (value: readonly unknown[]): number | undefined => {
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

const cloneStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const length = readArrayLength(value)
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

const readOwnDataField = (
  value: object,
  fieldName: string
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic => {
  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readOwnStringField(diagnostic, 'stage')
      ?? 'third-party.atomic-transaction-commit-outcome-contract.diagnostic-copy',
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? `mods.error.${code.toLowerCase().replace(/-/g, '.')}`,
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined,
    recovery: diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)
      ? recovery as ModDiagnosticRecovery
      : 'none'
  })
}

const safeDiagnostics = (
  diagnostics: readonly unknown[] | undefined
): readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      continue
    }
    if (
      descriptor?.enumerable === true
      && 'value' in descriptor
      && descriptor.value !== null
      && typeof descriptor.value === 'object'
    ) {
      result.push(safeDiagnostic(descriptor.value))
    }
  }
  return Object.freeze(result)
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeContractCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.atomic-transaction-commit-outcome-contract.checks.${currentCheck.id}`,
    packageId
  )))

const everyOwnDataValueFalse = (value: object): boolean => {
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(value)
  } catch {
    return false
  }
  return keys.every(key => {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, key)
    } catch {
      return false
    }
    return descriptor?.enumerable !== true || ('value' in descriptor && descriptor.value === false)
  })
}

const supportedOutcomeKind = (
  kind: string
): kind is ThirdPartyDataPackAtomicTransactionCommitOutcomeKind =>
  outcomeKinds.has(kind as ThirdPartyDataPackAtomicTransactionCommitOutcomeKind)

const safeRecovery = (
  value: ModDiagnosticRecovery | undefined
): ModDiagnosticRecovery =>
  diagnosticRecoveries.has(value as ModDiagnosticRecovery) ? value as ModDiagnosticRecovery : 'none'

const defaultMessageKey = (
  kind: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
): string => `mods.atomic.commit.install.${kind}`

const safeMessageKey = (
  value: string | undefined,
  kind: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind
): string => {
  if (value !== undefined && /^[A-Za-z0-9_.-]+$/.test(value)) return value
  return defaultMessageKey(kind)
}

const candidateIdentityMatches = (
  preflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  outcome: ThirdPartyDataPackAtomicTransactionCommitOutcomeSource
): boolean => {
  const expected = preflight.candidateIdentity?.candidateHash
  const actual = outcome.candidateIdentity?.candidateHash
  if (outcome.kind === 'committed') return expected !== undefined && actual === expected
  return actual === undefined || (expected !== undefined && actual === expected)
}

const lockfileHashMatches = (
  preflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  outcome: ThirdPartyDataPackAtomicTransactionCommitOutcomeSource
): boolean => {
  if (outcome.kind === 'committed') return preflight.lockfileHash !== undefined && outcome.lockfileHash === preflight.lockfileHash
  return outcome.lockfileHash === undefined || outcome.lockfileHash === preflight.lockfileHash
}

const noCommitSourceEffectsIntact = (
  preflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
): boolean => preflight.atomicCommitExecutionAllowed === false
  && preflight.commandDispatchAllowed === false
  && preflight.transactionCommitAllowed === false
  && preflight.commitAllowed === false
  && preflight.writeAllowed === false
  && preflight.runtimePublicationCommitAllowed === false
  && preflight.runtimeEnablementAllowed === false
  && preflight.postCommitVerificationAllowed === false
  && preflight.uiIpcResponseAllowed === false
  && preflight.rollbackRecoveryAllowed === false
  && everyOwnDataValueFalse(preflight.effects)

const check = (
  id: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractCheckId,
  status: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractCheck['status'],
  reason: string
): ThirdPartyDataPackAtomicTransactionCommitOutcomeContractCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeContractCheck[] => Object.freeze([
  'atomic-preflight-deferred',
  'install-command-source',
  'settled-commit-outcome-source',
  'target-package-consistent',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'outcome-kind-supported',
  'no-commit-source-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackAtomicTransactionCommitOutcomeContractCheckId,
  'skipped',
  reason
)))

const buildChecks = (
  preflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  outcome: ThirdPartyDataPackAtomicTransactionCommitOutcomeSource
): readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeContractCheck[] => Object.freeze([
  check(
    'atomic-preflight-deferred',
    preflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'Atomic commit outcome normalization requires a deferred atomic executor preflight as its source contract.'
  ),
  check(
    'install-command-source',
    preflight.requestedCommandId === 'install' ? 'satisfied' : 'blocked',
    'The first atomic commit outcome contract only covers install results; enable, disable, upgrade and uninstall need separate outcome contracts.'
  ),
  check(
    'settled-commit-outcome-source',
    outcome.settled === true ? 'satisfied' : 'blocked',
    'Atomic commit outcome normalization must consume an explicit settled commit outcome, not another inspect-only report.'
  ),
  check(
    'target-package-consistent',
    preflight.targetPackageId !== undefined
      && outcome.packageId === preflight.targetPackageId
      && clonePackageIds(preflight.selectedPackageIds).includes(preflight.targetPackageId)
      ? 'satisfied'
      : 'blocked',
    'The settled commit outcome must describe the same selected install target as the atomic preflight.'
  ),
  check(
    'candidate-identity-consistent',
    candidateIdentityMatches(preflight, outcome) ? 'satisfied' : 'blocked',
    'Committed outcomes must prove the candidate identity; failed, retry and rollback outcomes may omit it but must not drift when present.'
  ),
  check(
    'lockfile-hash-consistent',
    lockfileHashMatches(preflight, outcome) ? 'satisfied' : 'blocked',
    'Committed outcomes must prove the lockfile hash; failed, retry and rollback outcomes may omit it but must not drift when present.'
  ),
  check(
    'outcome-kind-supported',
    supportedOutcomeKind(outcome.kind) ? 'satisfied' : 'blocked',
    'Atomic commit outcomes must be one of committed, failed, retry or rollback.'
  ),
  check(
    'no-commit-source-effects-intact',
    noCommitSourceEffectsIntact(preflight) ? 'satisfied' : 'blocked',
    'Commit outcome normalization must not carry command dispatch, commit execution, runtime publication, UI/IPC, write, rollback or diagnostic write effects.'
  )
])

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const summary = (
  preflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  diagnosticCount: number
): ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary => Object.freeze({
  selectedPackageCount: clonePackageIds(preflight.selectedPackageIds).length,
  blockedPackageCount: clonePackageIds(preflight.blockedPackageIds).length,
  blockedCandidateCount: cloneStringList(preflight.blockedCandidatePaths).length,
  loadOrderCount: clonePackageIds(preflight.loadOrder).length,
  registryCount: preflight.registryCount,
  entryCount: preflight.entryCount,
  packageCount: preflight.packageCount,
  diagnosticCount
})

const buildOutcome = (
  preflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  source: ThirdPartyDataPackAtomicTransactionCommitOutcomeSource,
  diagnostics: readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[],
  resultSummary: ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary
): ThirdPartyDataPackAtomicTransactionCommitOutcome => Object.freeze({
  formatVersion: 1,
  kind: source.kind,
  commandId: 'install',
  packageId: source.packageId as PackageId,
  candidateHash: source.candidateIdentity?.candidateHash ?? preflight.candidateIdentity?.candidateHash,
  lockfileHash: source.lockfileHash ?? preflight.lockfileHash,
  messageKey: safeMessageKey(source.messageKey, source.kind),
  recovery: safeRecovery(source.recovery),
  retryable: source.retryable === true || source.kind === 'retry',
  rollbackRequired: source.rollbackRequired === true || source.kind === 'rollback',
  summary: resultSummary,
  diagnostics
})

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    let keys: readonly (string | symbol)[]
    try {
      keys = Reflect.ownKeys(value as object)
    } catch {
      return value
    }
    for (const key of keys) {
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value as object, key)
      } catch {
        continue
      }
      if (descriptor?.enumerable === true && 'value' in descriptor) {
        deepFreezeObjectGraph(descriptor.value)
      }
    }
  }
  return value
}

const baseResult = (
  status: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractStatus,
  reason: string,
  preflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  checks: readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeContractCheck[],
  diagnostics: readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[],
  outcome?: ThirdPartyDataPackAtomicTransactionCommitOutcome
): ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult => {
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(preflight.blockedPackageIds)
  const loadOrder = clonePackageIds(preflight.loadOrder)
  const resultSummary = outcome?.summary ?? summary(preflight, diagnostics.length)

  return deepFreezeObjectGraph({
    status,
    sourcePreflightStatus: preflight.status,
    reason,
    atomicTransactionCommitOutcomeContract: status,
    readOnly: true,
    commitOutcomeNormalized: outcome !== undefined,
    commandDispatchAllowed: false,
    atomicCommitExecutionAllowed: false,
    transactionCommitAllowed: false,
    runtimePublicationCommitAllowed: false,
    postCommitVerificationAllowed: false,
    uiIpcResponseAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: preflight.requestedCommandId === 'install' ? 'install' as const : undefined,
    targetPackageId: preflight.targetPackageId,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: cloneStringList(preflight.blockedCandidatePaths).length,
    loadOrder,
    registryCount: preflight.registryCount,
    entryCount: preflight.entryCount,
    packageCount: preflight.packageCount,
    candidateIdentity: cloneCandidateIdentity(preflight.candidateIdentity),
    lockfileHash: preflight.lockfileHash,
    checks,
    diagnostics,
    summary: resultSummary,
    ...(outcome === undefined ? {} : { outcome }),
    effects: createEffectSummary()
  })
}

export const buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract = (
  options: BuildThirdPartyDataPackAtomicTransactionCommitOutcomeContractOptions
): ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult => {
  const { preflight, outcome } = options

  if (preflight.status === 'skipped') {
    return baseResult(
      'skipped',
      preflight.reason,
      preflight,
      skippedChecks(preflight.reason),
      []
    )
  }

  if (preflight.status === 'blocked') {
    return baseResult(
      'blocked',
      preflight.reason,
      preflight,
      skippedChecks(preflight.reason),
      safeDiagnostics(preflight.diagnostics)
    )
  }

  const checks = buildChecks(preflight, outcome)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, preflight.targetPackageId)
  const outcomeDiagnostics = safeDiagnostics(outcome.diagnostics)

  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'atomic transaction commit outcome contract inputs are inconsistent',
      preflight,
      checks,
      [
        ...safeDiagnostics(preflight.diagnostics),
        ...outcomeDiagnostics,
        ...blockedDiagnostics
      ]
    )
  }

  const diagnostics = Object.freeze([
    ...safeDiagnostics(preflight.diagnostics),
    ...outcomeDiagnostics
  ])
  const resultSummary = summary(preflight, diagnostics.length)
  const normalizedOutcome = buildOutcome(preflight, outcome, diagnostics, resultSummary)

  return baseResult(
    'ready',
    'atomic transaction commit outcome contract is ready as a path-free domain source; commit execution remains outside this contract',
    preflight,
    checks,
    diagnostics,
    normalizedOutcome
  )
}
