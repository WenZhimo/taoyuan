import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
} from './thirdPartyDataPackPostCommitVerificationExecutorPreflight'
import type {
  ThirdPartyDataPackPostCommitVerificationOutcome,
  ThirdPartyDataPackPostCommitVerificationOutcomeKind,
  ThirdPartyDataPackPostCommitVerificationOutcomeSource,
  ThirdPartyDataPackPostCommitVerificationSafeDiagnostic,
  ThirdPartyDataPackPostCommitVerificationSummary
} from './thirdPartyDataPackPostCommitVerificationExecutorAdapter'

export type ThirdPartyDataPackPostCommitVerificationOutcomeContractStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPostCommitVerificationOutcomeContractCheckId =
  | 'verification-preflight-deferred'
  | 'install-command-source'
  | 'settled-verification-outcome-source'
  | 'target-package-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'outcome-kind-supported'
  | 'verified-state-signals-consistent'
  | 'no-verification-source-effects-intact'

export interface ThirdPartyDataPackPostCommitVerificationOutcomeContractCheck {
  readonly id: ThirdPartyDataPackPostCommitVerificationOutcomeContractCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitVerificationOutcomeEffectSummary {
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
  readonly transactionCommitted: false
  readonly postCommitVerificationExecutorCalled: false
  readonly postCommitVerificationExecuted: false
  readonly transactionLogRead: false
  readonly packageStateRead: false
  readonly settingsRead: false
  readonly lockfileRead: false
  readonly liveRegistryRead: false
  readonly saveCacheIsolationChecked: false
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

export interface ThirdPartyDataPackPostCommitVerificationOutcomeContractResult {
  readonly status: ThirdPartyDataPackPostCommitVerificationOutcomeContractStatus
  readonly sourcePreflightStatus: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult['status']
  readonly reason: string
  readonly postCommitVerificationOutcomeContract: ThirdPartyDataPackPostCommitVerificationOutcomeContractStatus
  readonly readOnly: true
  readonly verificationOutcomeNormalized: boolean
  readonly verificationExecutionAllowed: false
  readonly postCommitVerificationAllowed: false
  readonly transactionLogReadAllowed: false
  readonly packageStateReadAllowed: false
  readonly settingsReadAllowed: false
  readonly lockfileReadAllowed: false
  readonly liveRegistryReadAllowed: false
  readonly saveCacheIsolationCheckAllowed: false
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly uiIpcResponseAllowed: false
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
  readonly checks: readonly ThirdPartyDataPackPostCommitVerificationOutcomeContractCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackPostCommitVerificationSummary
  readonly outcome?: ThirdPartyDataPackPostCommitVerificationOutcome
  readonly effects: ThirdPartyDataPackPostCommitVerificationOutcomeEffectSummary
}

export interface BuildThirdPartyDataPackPostCommitVerificationOutcomeContractOptions {
  readonly preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
  readonly outcome: ThirdPartyDataPackPostCommitVerificationOutcomeSource
}

const outcomeKinds = new Set<ThirdPartyDataPackPostCommitVerificationOutcomeKind>([
  'verified',
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

const createEffectSummary = (): ThirdPartyDataPackPostCommitVerificationOutcomeEffectSummary => ({
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
  transactionCommitted: false,
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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
): ThirdPartyDataPackPostCommitVerificationSafeDiagnostic => {
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
      ?? 'third-party.post-commit-verification-outcome-contract.diagnostic-copy',
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
): readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] = []
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
): ThirdPartyDataPackPostCommitVerificationSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackPostCommitVerificationOutcomeContractCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.post-commit-verification-outcome-contract.checks.${currentCheck.id}`,
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
): kind is ThirdPartyDataPackPostCommitVerificationOutcomeKind =>
  outcomeKinds.has(kind as ThirdPartyDataPackPostCommitVerificationOutcomeKind)

const safeRecovery = (
  value: ModDiagnosticRecovery | undefined
): ModDiagnosticRecovery =>
  diagnosticRecoveries.has(value as ModDiagnosticRecovery) ? value as ModDiagnosticRecovery : 'none'

const defaultMessageKey = (
  kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind
): string => `mods.post.commit.verification.install.${kind}`

const safeMessageKey = (
  value: string | undefined,
  kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind
): string => {
  if (value !== undefined && /^[A-Za-z0-9_.-]+$/.test(value)) return value
  return defaultMessageKey(kind)
}

const candidateIdentityMatches = (
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  outcome: ThirdPartyDataPackPostCommitVerificationOutcomeSource
): boolean => {
  const expected = preflight.candidateIdentity?.candidateHash
  const actual = outcome.candidateIdentity?.candidateHash
  if (outcome.kind === 'verified') return expected !== undefined && actual === expected
  return actual === undefined || (expected !== undefined && actual === expected)
}

const lockfileHashMatches = (
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  outcome: ThirdPartyDataPackPostCommitVerificationOutcomeSource
): boolean => {
  if (outcome.kind === 'verified') return preflight.lockfileHash !== undefined && outcome.lockfileHash === preflight.lockfileHash
  return outcome.lockfileHash === undefined || outcome.lockfileHash === preflight.lockfileHash
}

const verifiedStateSignalsConsistent = (
  outcome: ThirdPartyDataPackPostCommitVerificationOutcomeSource
): boolean => outcome.kind !== 'verified'
  || (
    outcome.transactionLogMatched === true
    && outcome.packageStateMatched === true
    && outcome.settingsLockfileMatched === true
    && outcome.liveRegistryMatched === true
    && outcome.saveCacheIsolated === true
  )

const noVerificationSourceEffectsIntact = (
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
): boolean => preflight.verificationExecutionAllowed === false
  && preflight.postCommitVerificationAllowed === false
  && preflight.transactionLogReadAllowed === false
  && preflight.packageStateReadAllowed === false
  && preflight.settingsReadAllowed === false
  && preflight.lockfileReadAllowed === false
  && preflight.liveRegistryReadAllowed === false
  && preflight.saveCacheIsolationCheckAllowed === false
  && preflight.rollbackTriggerAllowed === false
  && preflight.writeAllowed === false
  && preflight.runtimeEnablementAllowed === false
  && preflight.uiIpcResponseAllowed === false
  && everyOwnDataValueFalse(preflight.effects)

const check = (
  id: ThirdPartyDataPackPostCommitVerificationOutcomeContractCheckId,
  status: ThirdPartyDataPackPostCommitVerificationOutcomeContractCheck['status'],
  reason: string
): ThirdPartyDataPackPostCommitVerificationOutcomeContractCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackPostCommitVerificationOutcomeContractCheck[] => Object.freeze([
  'verification-preflight-deferred',
  'install-command-source',
  'settled-verification-outcome-source',
  'target-package-consistent',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'outcome-kind-supported',
  'verified-state-signals-consistent',
  'no-verification-source-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackPostCommitVerificationOutcomeContractCheckId,
  'skipped',
  reason
)))

const buildChecks = (
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  outcome: ThirdPartyDataPackPostCommitVerificationOutcomeSource
): readonly ThirdPartyDataPackPostCommitVerificationOutcomeContractCheck[] => Object.freeze([
  check(
    'verification-preflight-deferred',
    preflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'Post-commit verification outcome normalization requires a deferred verification preflight as its source contract.'
  ),
  check(
    'install-command-source',
    preflight.requestedCommandId === 'install' ? 'satisfied' : 'blocked',
    'The first post-commit verification outcome contract only covers install results; enable, disable, upgrade and uninstall need separate outcome contracts.'
  ),
  check(
    'settled-verification-outcome-source',
    outcome.settled === true ? 'satisfied' : 'blocked',
    'Post-commit verification outcome normalization must consume an explicit settled outcome source, not another inspect-only report.'
  ),
  check(
    'target-package-consistent',
    preflight.targetPackageId !== undefined
      && outcome.packageId === preflight.targetPackageId
      && clonePackageIds(preflight.selectedPackageIds).includes(preflight.targetPackageId)
      ? 'satisfied'
      : 'blocked',
    'The settled verification outcome must describe the same selected install target as the verification preflight.'
  ),
  check(
    'candidate-identity-consistent',
    candidateIdentityMatches(preflight, outcome) ? 'satisfied' : 'blocked',
    'Verified outcomes must prove the candidate identity; failed, retry and rollback outcomes may omit it but must not drift when present.'
  ),
  check(
    'lockfile-hash-consistent',
    lockfileHashMatches(preflight, outcome) ? 'satisfied' : 'blocked',
    'Verified outcomes must prove the lockfile hash; failed, retry and rollback outcomes may omit it but must not drift when present.'
  ),
  check(
    'outcome-kind-supported',
    supportedOutcomeKind(outcome.kind) ? 'satisfied' : 'blocked',
    'Post-commit verification outcomes must be one of verified, failed, retry or rollback.'
  ),
  check(
    'verified-state-signals-consistent',
    verifiedStateSignalsConsistent(outcome) ? 'satisfied' : 'blocked',
    'Verified outcomes must prove transaction log, package state, settings/lockfile, live registry and save/cache isolation signals.'
  ),
  check(
    'no-verification-source-effects-intact',
    noVerificationSourceEffectsIntact(preflight) ? 'satisfied' : 'blocked',
    'Verification outcome normalization must not carry persistent reads, command dispatch, transaction commit, runtime publication, UI/IPC, writes, rollback or diagnostic write effects.'
  )
])

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const summary = (
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  diagnosticCount: number
): ThirdPartyDataPackPostCommitVerificationSummary => Object.freeze({
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
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  source: ThirdPartyDataPackPostCommitVerificationOutcomeSource,
  diagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[],
  resultSummary: ThirdPartyDataPackPostCommitVerificationSummary
): ThirdPartyDataPackPostCommitVerificationOutcome => Object.freeze({
  formatVersion: 1,
  kind: source.kind,
  commandId: 'install',
  packageId: source.packageId as PackageId,
  candidateHash: source.candidateIdentity?.candidateHash ?? preflight.candidateIdentity?.candidateHash,
  lockfileHash: source.lockfileHash ?? preflight.lockfileHash,
  transactionLogMatched: source.transactionLogMatched === true,
  packageStateMatched: source.packageStateMatched === true,
  settingsLockfileMatched: source.settingsLockfileMatched === true,
  liveRegistryMatched: source.liveRegistryMatched === true,
  saveCacheIsolated: source.saveCacheIsolated === true,
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
  status: ThirdPartyDataPackPostCommitVerificationOutcomeContractStatus,
  reason: string,
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  checks: readonly ThirdPartyDataPackPostCommitVerificationOutcomeContractCheck[],
  diagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[],
  outcome?: ThirdPartyDataPackPostCommitVerificationOutcome
): ThirdPartyDataPackPostCommitVerificationOutcomeContractResult => {
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(preflight.blockedPackageIds)
  const loadOrder = clonePackageIds(preflight.loadOrder)
  const resultSummary = outcome?.summary ?? summary(preflight, diagnostics.length)

  return deepFreezeObjectGraph({
    status,
    sourcePreflightStatus: preflight.status,
    reason,
    postCommitVerificationOutcomeContract: status,
    readOnly: true,
    verificationOutcomeNormalized: outcome !== undefined,
    verificationExecutionAllowed: false,
    postCommitVerificationAllowed: false,
    transactionLogReadAllowed: false,
    packageStateReadAllowed: false,
    settingsReadAllowed: false,
    lockfileReadAllowed: false,
    liveRegistryReadAllowed: false,
    saveCacheIsolationCheckAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    runtimeEnablementAllowed: false,
    uiIpcResponseAllowed: false,
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

export const buildThirdPartyDataPackPostCommitVerificationOutcomeContract = (
  options: BuildThirdPartyDataPackPostCommitVerificationOutcomeContractOptions
): ThirdPartyDataPackPostCommitVerificationOutcomeContractResult => {
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
      'post-commit verification outcome contract inputs are inconsistent',
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
    'post-commit verification outcome contract is ready as a path-free domain source; persistent reads and UI/IPC delivery remain outside this contract',
    preflight,
    checks,
    diagnostics,
    normalizedOutcome
  )
}
