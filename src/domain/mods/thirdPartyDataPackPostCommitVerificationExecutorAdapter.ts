import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirementId,
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  ThirdPartyDataPackPostCommitVerificationExecutorPreflightStageId
} from './thirdPartyDataPackPostCommitVerificationExecutorPreflight'

export type ThirdPartyDataPackPostCommitVerificationExecutorAdapterStatus =
  | 'executed'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPostCommitVerificationOutcomeKind =
  | 'verified'
  | 'failed'
  | 'retry'
  | 'rollback'

export type ThirdPartyDataPackPostCommitVerificationExecutorHostKind =
  | 'injected-post-commit-verification-executor'
  | 'electron-main-visible-import-post-commit-verification-executor'

export type ThirdPartyDataPackPostCommitVerificationExecutorHostMode =
  | 'injected-test-only'
  | 'electron-main-visible-import'

export type ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheckId =
  | 'verification-preflight-deferred'
  | 'install-command-source'
  | 'target-package-selected'
  | 'candidate-identity-present'
  | 'lockfile-hash-present'
  | 'injected-verification-host-ready'
  | 'verification-host-boundary'
  | 'no-upstream-verification-effects'
  | 'verification-outcome-returned'
  | 'verification-outcome-ready'

export interface ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheck {
  readonly id: ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitVerificationExecutorRequest {
  readonly formatVersion: 1
  readonly commandId: 'install'
  readonly packageId: PackageId
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly requiredSourceIds: readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirementId[]
  readonly deferredStageIds: readonly ThirdPartyDataPackPostCommitVerificationExecutorPreflightStageId[]
}

export interface ThirdPartyDataPackPostCommitVerificationExecutorHost {
  readonly kind: ThirdPartyDataPackPostCommitVerificationExecutorHostKind
  readonly mode: ThirdPartyDataPackPostCommitVerificationExecutorHostMode
  readonly execute: (
    request: ThirdPartyDataPackPostCommitVerificationExecutorRequest
  ) => ThirdPartyDataPackPostCommitVerificationOutcomeSource
    | Promise<ThirdPartyDataPackPostCommitVerificationOutcomeSource>
}

export interface ThirdPartyDataPackPostCommitVerificationOutcomeSource {
  readonly kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind
  readonly settled: boolean
  readonly packageId?: PackageId
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly transactionLogMatched?: boolean
  readonly packageStateMatched?: boolean
  readonly settingsLockfileMatched?: boolean
  readonly liveRegistryMatched?: boolean
  readonly saveCacheIsolated?: boolean
  readonly diagnostics?: readonly unknown[]
  readonly messageKey?: string
  readonly recovery?: ModDiagnosticRecovery
  readonly retryable?: boolean
  readonly rollbackRequired?: boolean
}

export interface ThirdPartyDataPackPostCommitVerificationSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackPostCommitVerificationSummary {
  readonly selectedPackageCount: number
  readonly blockedPackageCount: number
  readonly blockedCandidateCount: number
  readonly loadOrderCount: number
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly diagnosticCount: number
}

export interface ThirdPartyDataPackPostCommitVerificationOutcome {
  readonly formatVersion: 1
  readonly kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind
  readonly commandId: 'install'
  readonly packageId: PackageId
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly transactionLogMatched: boolean
  readonly packageStateMatched: boolean
  readonly settingsLockfileMatched: boolean
  readonly liveRegistryMatched: boolean
  readonly saveCacheIsolated: boolean
  readonly messageKey: string
  readonly recovery: ModDiagnosticRecovery
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly summary: ThirdPartyDataPackPostCommitVerificationSummary
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[]
}

export interface ThirdPartyDataPackPostCommitVerificationExecutorAdapterEffectSummary {
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
  readonly postCommitVerificationExecutorCalled: boolean
  readonly injectedVerificationHostCalled: boolean
  readonly verificationOutcomeReceived: boolean
  readonly verifiedOutcomeReceived: boolean
  readonly failedOutcomeReceived: boolean
  readonly retryOutcomeReceived: boolean
  readonly rollbackOutcomeReceived: boolean
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

export interface ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult {
  readonly status: ThirdPartyDataPackPostCommitVerificationExecutorAdapterStatus
  readonly sourcePreflightStatus: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult['status']
  readonly reason: string
  readonly postCommitVerificationExecutorAdapter: ThirdPartyDataPackPostCommitVerificationExecutorAdapterStatus
  readonly readOnly: true
  readonly injectedExecutorHostRequired: true
  readonly postCommitVerificationExecutorHostMode: ThirdPartyDataPackPostCommitVerificationExecutorHostMode
  readonly injectedExecutorHostMode: ThirdPartyDataPackPostCommitVerificationExecutorHostMode
  readonly verificationHostCalled: boolean
  readonly verificationOutcomeReceived: boolean
  readonly verificationOutcomeNormalized: boolean
  readonly verificationExecutionAllowed: boolean
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
  readonly verificationRequest?: ThirdPartyDataPackPostCommitVerificationExecutorRequest
  readonly outcome?: ThirdPartyDataPackPostCommitVerificationOutcome
  readonly checks: readonly ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackPostCommitVerificationSummary
  readonly effects: ThirdPartyDataPackPostCommitVerificationExecutorAdapterEffectSummary
}

export interface ExecuteThirdPartyDataPackPostCommitVerificationExecutorAdapterOptions {
  readonly preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
  readonly host?: ThirdPartyDataPackPostCommitVerificationExecutorHost
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

const readOwnBooleanField = (
  value: object,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readOwnNumberField = (
  value: object,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

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
      ?? 'third-party.post-commit-verification-executor-adapter.diagnostic-copy',
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
  checks: readonly ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.post-commit-verification-executor-adapter.checks.${currentCheck.id}`,
    packageId
  )))

const cloneCandidateIdentity = (
  identity: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  if (identity === undefined || identity === null || typeof identity !== 'object') return undefined
  const formatVersion = readOwnNumberField(identity, 'formatVersion')
  const contentHash = readOwnStringField(identity, 'contentHash')
  const snapshotHash = readOwnStringField(identity, 'snapshotHash')
  const candidateHash = readOwnStringField(identity, 'candidateHash')
  if (formatVersion !== 1 || contentHash === undefined || snapshotHash === undefined || candidateHash === undefined) {
    return undefined
  }
  return Object.freeze({
    formatVersion: 1,
    contentHash: contentHash as Sha256Hash,
    snapshotHash: snapshotHash as Sha256Hash,
    candidateHash: candidateHash as Sha256Hash
  })
}

const cloneRequirementIds = (
  value: unknown
): ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirementId[] => {
  if (!Array.isArray(value)) return []
  const length = readArrayLength(value)
  if (length === undefined) return []

  const result: ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirementId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    const item = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (item !== undefined && item !== null && typeof item === 'object') {
      const id = readOwnStringField(item, 'id')
      const status = readOwnStringField(item, 'status')
      if (id !== undefined && status === 'required') {
        result.push(id as ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirementId)
      }
    }
  }
  return Object.freeze(result) as ThirdPartyDataPackPostCommitVerificationExecutorPreflightRequirementId[]
}

const cloneDeferredStageIds = (
  value: unknown
): ThirdPartyDataPackPostCommitVerificationExecutorPreflightStageId[] => {
  if (!Array.isArray(value)) return []
  const length = readArrayLength(value)
  if (length === undefined) return []

  const result: ThirdPartyDataPackPostCommitVerificationExecutorPreflightStageId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    const item = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (item !== undefined && item !== null && typeof item === 'object') {
      const id = readOwnStringField(item, 'id')
      const status = readOwnStringField(item, 'status')
      if (id !== undefined && status === 'deferred') {
        result.push(id as ThirdPartyDataPackPostCommitVerificationExecutorPreflightStageId)
      }
    }
  }
  return Object.freeze(result) as ThirdPartyDataPackPostCommitVerificationExecutorPreflightStageId[]
}

const cloneOutcomeSource = (
  value: unknown
): ThirdPartyDataPackPostCommitVerificationOutcomeSource | undefined => {
  if (value === undefined || value === null || typeof value !== 'object') return undefined
  const kind = readOwnStringField(value, 'kind')
  const settled = readOwnBooleanField(value, 'settled')
  if (kind === undefined || settled === undefined) return undefined
  const diagnostics = readOwnDataField(value, 'diagnostics')
  return Object.freeze({
    kind: kind as ThirdPartyDataPackPostCommitVerificationOutcomeKind,
    settled,
    packageId: readOwnStringField(value, 'packageId') as PackageId | undefined,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(value, 'candidateIdentity')),
    lockfileHash: readOwnStringField(value, 'lockfileHash') as Sha256Hash | undefined,
    transactionLogMatched: readOwnBooleanField(value, 'transactionLogMatched'),
    packageStateMatched: readOwnBooleanField(value, 'packageStateMatched'),
    settingsLockfileMatched: readOwnBooleanField(value, 'settingsLockfileMatched'),
    liveRegistryMatched: readOwnBooleanField(value, 'liveRegistryMatched'),
    saveCacheIsolated: readOwnBooleanField(value, 'saveCacheIsolated'),
    diagnostics: Array.isArray(diagnostics) ? diagnostics : undefined,
    messageKey: readOwnStringField(value, 'messageKey'),
    recovery: readOwnStringField(value, 'recovery') as ModDiagnosticRecovery | undefined,
    retryable: readOwnBooleanField(value, 'retryable'),
    rollbackRequired: readOwnBooleanField(value, 'rollbackRequired')
  })
}

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

const createEffectSummary = (
  hostCalled: boolean,
  outcomeKind: ThirdPartyDataPackPostCommitVerificationOutcomeKind | undefined,
  outcomeReceived: boolean
): ThirdPartyDataPackPostCommitVerificationExecutorAdapterEffectSummary => ({
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
  postCommitVerificationExecutorCalled: hostCalled,
  injectedVerificationHostCalled: hostCalled,
  verificationOutcomeReceived: outcomeReceived,
  verifiedOutcomeReceived: outcomeKind === 'verified',
  failedOutcomeReceived: outcomeKind === 'failed',
  retryOutcomeReceived: outcomeKind === 'retry',
  rollbackOutcomeReceived: outcomeKind === 'rollback',
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

const check = (
  id: ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheckId,
  status: ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheck['status'],
  reason: string
): ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheck => Object.freeze({ id, status, reason })

const defaultHostMode: ThirdPartyDataPackPostCommitVerificationExecutorHostMode = 'injected-test-only'

const hostBoundaryAccepted = (
  host: ThirdPartyDataPackPostCommitVerificationExecutorHost | undefined
): boolean => (
  host?.kind === 'injected-post-commit-verification-executor'
    && host.mode === 'injected-test-only'
) || (
  host?.kind === 'electron-main-visible-import-post-commit-verification-executor'
    && host.mode === 'electron-main-visible-import'
)

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheck[] => Object.freeze([
  'verification-preflight-deferred',
  'install-command-source',
  'target-package-selected',
  'candidate-identity-present',
  'lockfile-hash-present',
  'injected-verification-host-ready',
  'verification-host-boundary',
  'no-upstream-verification-effects',
  'verification-outcome-returned',
  'verification-outcome-ready'
].map(id => check(
  id as ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheckId,
  'skipped',
  reason
)))

const preExecutionChecks = (
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  host: ThirdPartyDataPackPostCommitVerificationExecutorHost | undefined
): readonly ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheck[] => {
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  return Object.freeze([
    check(
      'verification-preflight-deferred',
      preflight.status === 'deferred' ? 'satisfied' : 'blocked',
      'Post-commit verification host execution requires the source executor preflight to remain deferred.'
    ),
    check(
      'install-command-source',
      preflight.requestedCommandId === 'install' ? 'satisfied' : 'blocked',
      'This injected post-commit verification executor adapter only covers install commands.'
    ),
    check(
      'target-package-selected',
      preflight.targetPackageId !== undefined && selectedPackageIds.includes(preflight.targetPackageId)
        ? 'satisfied'
        : 'blocked',
      'The selected install target must be present before constructing a verification request.'
    ),
    check(
      'candidate-identity-present',
      preflight.candidateIdentity?.candidateHash !== undefined ? 'satisfied' : 'blocked',
      'Post-commit verification host execution requires the candidate identity that committed state must prove.'
    ),
    check(
      'lockfile-hash-present',
      preflight.lockfileHash !== undefined ? 'satisfied' : 'blocked',
      'Post-commit verification host execution requires the lockfile hash that committed persistent state must prove.'
    ),
    check(
      'injected-verification-host-ready',
      host !== undefined && typeof host.execute === 'function' ? 'satisfied' : 'blocked',
      'A fixed path-free verification host must be present before the adapter can execute.'
    ),
    check(
      'verification-host-boundary',
      hostBoundaryAccepted(host)
        ? 'satisfied'
        : 'blocked',
      'The adapter only accepts explicit path-free verification host modes and must not bind real platform reads or writes.'
    ),
    check(
      'no-upstream-verification-effects',
      preflight.verificationExecutionAllowed === false
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
        ? 'satisfied'
        : 'blocked',
      'The source preflight must not already contain verification, read, runtime, UI/IPC, write or rollback effects.'
    ),
    check(
      'verification-outcome-returned',
      'skipped',
      'Verification outcome presence is checked only after the injected host returns.'
    ),
    check(
      'verification-outcome-ready',
      'skipped',
      'Verification outcome readiness is checked only after host outcome normalization.'
    )
  ])
}

const checksWithOutcome = (
  checks: readonly ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheck[],
  outcomeStatus: ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheck['status'],
  outcomeReason: string,
  readyStatus: ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheck['status'],
  readyReason: string
): readonly ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheck[] => Object.freeze(checks.map(currentCheck => {
  if (currentCheck.id === 'verification-outcome-returned') return check('verification-outcome-returned', outcomeStatus, outcomeReason)
  if (currentCheck.id === 'verification-outcome-ready') return check('verification-outcome-ready', readyStatus, readyReason)
  return currentCheck
}))

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

const buildVerificationRequest = (
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult
): ThirdPartyDataPackPostCommitVerificationExecutorRequest | undefined => {
  if (preflight.requestedCommandId !== 'install' || preflight.targetPackageId === undefined) return undefined
  const candidateIdentity = cloneCandidateIdentity(preflight.candidateIdentity)
  if (candidateIdentity === undefined || preflight.lockfileHash === undefined) return undefined
  return deepFreezeObjectGraph({
    formatVersion: 1,
    commandId: 'install',
    packageId: preflight.targetPackageId,
    candidateIdentity,
    lockfileHash: preflight.lockfileHash,
    selectedPackageIds: clonePackageIds(preflight.selectedPackageIds),
    blockedPackageIds: clonePackageIds(preflight.blockedPackageIds),
    blockedCandidateCount: cloneStringList(preflight.blockedCandidatePaths).length,
    loadOrder: clonePackageIds(preflight.loadOrder),
    registryCount: preflight.registryCount,
    entryCount: preflight.entryCount,
    packageCount: preflight.packageCount,
    requiredSourceIds: cloneRequirementIds(preflight.executorRequirements),
    deferredStageIds: cloneDeferredStageIds(preflight.executorStages)
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

const safeMessageKey = (
  value: string | undefined,
  kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind
): string => {
  if (value !== undefined && /^[A-Za-z0-9_.-]+$/.test(value)) return value
  return `mods.post.commit.verification.install.${kind}`
}

const outcomeIdentityMatches = (
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  outcome: ThirdPartyDataPackPostCommitVerificationOutcomeSource
): boolean => {
  const expected = preflight.candidateIdentity?.candidateHash
  const actual = outcome.candidateIdentity?.candidateHash
  if (outcome.kind === 'verified') return expected !== undefined && actual === expected
  return actual === undefined || (expected !== undefined && actual === expected)
}

const outcomeLockfileMatches = (
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  outcome: ThirdPartyDataPackPostCommitVerificationOutcomeSource
): boolean => {
  if (outcome.kind === 'verified') return preflight.lockfileHash !== undefined && outcome.lockfileHash === preflight.lockfileHash
  return outcome.lockfileHash === undefined || outcome.lockfileHash === preflight.lockfileHash
}

const verifiedSignalsAllTrue = (
  outcome: ThirdPartyDataPackPostCommitVerificationOutcomeSource
): boolean => outcome.transactionLogMatched === true
  && outcome.packageStateMatched === true
  && outcome.settingsLockfileMatched === true
  && outcome.liveRegistryMatched === true
  && outcome.saveCacheIsolated === true

const outcomeReady = (
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  outcome: ThirdPartyDataPackPostCommitVerificationOutcomeSource
): boolean => preflight.status === 'deferred'
  && preflight.requestedCommandId === 'install'
  && preflight.targetPackageId !== undefined
  && outcome.settled === true
  && supportedOutcomeKind(outcome.kind)
  && outcome.packageId === preflight.targetPackageId
  && outcomeIdentityMatches(preflight, outcome)
  && outcomeLockfileMatches(preflight, outcome)
  && (outcome.kind !== 'verified' || verifiedSignalsAllTrue(outcome))

const normalizeOutcome = (
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  outcome: ThirdPartyDataPackPostCommitVerificationOutcomeSource,
  diagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[],
  resultSummary: ThirdPartyDataPackPostCommitVerificationSummary
): ThirdPartyDataPackPostCommitVerificationOutcome => Object.freeze({
  formatVersion: 1,
  kind: outcome.kind,
  commandId: 'install',
  packageId: outcome.packageId as PackageId,
  candidateHash: outcome.candidateIdentity?.candidateHash ?? preflight.candidateIdentity?.candidateHash,
  lockfileHash: outcome.lockfileHash ?? preflight.lockfileHash,
  transactionLogMatched: outcome.transactionLogMatched === true,
  packageStateMatched: outcome.packageStateMatched === true,
  settingsLockfileMatched: outcome.settingsLockfileMatched === true,
  liveRegistryMatched: outcome.liveRegistryMatched === true,
  saveCacheIsolated: outcome.saveCacheIsolated === true,
  messageKey: safeMessageKey(outcome.messageKey, outcome.kind),
  recovery: safeRecovery(outcome.recovery),
  retryable: outcome.retryable === true || outcome.kind === 'retry',
  rollbackRequired: outcome.rollbackRequired === true || outcome.kind === 'rollback',
  summary: resultSummary,
  diagnostics
})

const baseResult = (
  status: ThirdPartyDataPackPostCommitVerificationExecutorAdapterStatus,
  reason: string,
  preflight: ThirdPartyDataPackPostCommitVerificationExecutorPreflightResult,
  checks: readonly ThirdPartyDataPackPostCommitVerificationExecutorAdapterCheck[],
  diagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[],
  hostCalled: boolean,
  hostMode: ThirdPartyDataPackPostCommitVerificationExecutorHostMode = defaultHostMode,
  verificationRequest?: ThirdPartyDataPackPostCommitVerificationExecutorRequest,
  outcome?: ThirdPartyDataPackPostCommitVerificationOutcome
): ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult => {
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(preflight.blockedPackageIds)
  const loadOrder = clonePackageIds(preflight.loadOrder)
  const resultSummary = outcome?.summary ?? summary(preflight, diagnostics.length)

  return deepFreezeObjectGraph({
    status,
    sourcePreflightStatus: preflight.status,
    reason,
    postCommitVerificationExecutorAdapter: status,
    readOnly: true,
    injectedExecutorHostRequired: true,
    postCommitVerificationExecutorHostMode: hostMode,
    injectedExecutorHostMode: hostMode,
    verificationHostCalled: hostCalled,
    verificationOutcomeReceived: outcome !== undefined,
    verificationOutcomeNormalized: outcome !== undefined,
    verificationExecutionAllowed: status === 'executed',
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
    ...(verificationRequest === undefined ? {} : { verificationRequest }),
    ...(outcome === undefined ? {} : { outcome }),
    checks,
    diagnostics,
    summary: resultSummary,
    effects: createEffectSummary(hostCalled, outcome?.kind, outcome !== undefined)
  })
}

export const executeThirdPartyDataPackPostCommitVerificationExecutorAdapter = async (
  options: ExecuteThirdPartyDataPackPostCommitVerificationExecutorAdapterOptions
): Promise<ThirdPartyDataPackPostCommitVerificationExecutorAdapterResult> => {
  const { preflight } = options

  if (preflight.status === 'skipped') {
    return baseResult(
      'skipped',
      preflight.reason,
      preflight,
      skippedChecks(preflight.reason),
      [],
      false
    )
  }

  if (preflight.status === 'blocked') {
    return baseResult(
      'blocked',
      preflight.reason,
      preflight,
      skippedChecks(preflight.reason),
      safeDiagnostics(preflight.diagnostics),
      false
    )
  }

  const checks = preExecutionChecks(preflight, options.host)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, preflight.targetPackageId)
  const sourceDiagnostics = safeDiagnostics(preflight.diagnostics)
  const verificationRequest = buildVerificationRequest(preflight)

  if (blockedDiagnostics.length > 0 || options.host === undefined || verificationRequest === undefined) {
    return baseResult(
      'blocked',
      'post-commit verification executor adapter inputs are inconsistent',
      preflight,
      checks,
      [
        ...sourceDiagnostics,
        ...blockedDiagnostics
      ],
      false,
      options.host?.mode ?? defaultHostMode
    )
  }

  let rawOutcome: unknown
  try {
    rawOutcome = await options.host.execute(verificationRequest)
  } catch {
    const outcomeChecks = checksWithOutcome(
      checks,
      'blocked',
      'The injected post-commit verification host threw before returning a settled outcome.',
      'skipped',
      'Verification outcome readiness is skipped because no safe outcome was returned.'
    )
    return baseResult(
      'blocked',
      'injected post-commit verification host failed before outcome',
      preflight,
      outcomeChecks,
      [
        ...sourceDiagnostics,
        commandDiagnostic(
          'third-party.post-commit-verification-executor-adapter.host-failed',
          preflight.targetPackageId
        )
      ],
      true,
      options.host.mode,
      verificationRequest
    )
  }

  const outcomeSource = cloneOutcomeSource(rawOutcome)
  if (outcomeSource === undefined) {
    const outcomeChecks = checksWithOutcome(
      checks,
      'blocked',
      'The injected post-commit verification host did not return a safe settled outcome source.',
      'skipped',
      'Verification outcome readiness is skipped because no safe outcome was returned.'
    )
    return baseResult(
      'blocked',
      'injected post-commit verification host returned an invalid outcome',
      preflight,
      outcomeChecks,
      [
        ...sourceDiagnostics,
        commandDiagnostic(
          'third-party.post-commit-verification-executor-adapter.outcome-invalid',
          preflight.targetPackageId
        )
      ],
      true,
      options.host.mode,
      verificationRequest
    )
  }

  const safeOutcomeDiagnostics = safeDiagnostics(outcomeSource.diagnostics)
  const ready = outcomeReady(preflight, outcomeSource)
  const outcomeChecks = checksWithOutcome(
    checks,
    'satisfied',
    'The path-free post-commit verification host returned a safe settled outcome source.',
    ready ? 'satisfied' : 'blocked',
    ready
      ? 'The post-commit verification outcome was normalized as a path-free host result.'
      : 'The post-commit verification outcome did not match the source preflight identity or verifier requirements.'
  )

  if (!ready) {
    return baseResult(
      'blocked',
      'injected post-commit verification outcome failed adapter normalization',
      preflight,
      outcomeChecks,
      [
        ...sourceDiagnostics,
        ...safeOutcomeDiagnostics,
        ...diagnosticsForBlockedChecks(outcomeChecks, preflight.targetPackageId)
      ],
      true,
      options.host.mode,
      verificationRequest
    )
  }

  const diagnostics = Object.freeze([
    ...sourceDiagnostics,
    ...safeOutcomeDiagnostics
  ])
  const resultSummary = summary(preflight, diagnostics.length)
  const outcome = normalizeOutcome(preflight, outcomeSource, diagnostics, resultSummary)

  return baseResult(
    'executed',
    'post-commit verification executor adapter executed a path-free verification host and normalized its outcome',
    preflight,
    outcomeChecks,
    diagnostics,
    true,
    options.host.mode,
    verificationRequest,
    outcome
  )
}
