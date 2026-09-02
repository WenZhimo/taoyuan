import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
} from './thirdPartyDataPackAtomicTransactionCommitExecutorPreflight'
import {
  buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract,
  type ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult,
  type ThirdPartyDataPackAtomicTransactionCommitOutcomeKind,
  type ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic,
  type ThirdPartyDataPackAtomicTransactionCommitOutcomeSource,
  type ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary
} from './thirdPartyDataPackAtomicTransactionCommitOutcomeContract'

export type ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterStatus =
  | 'executed'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackAtomicTransactionCommitExecutorHostKind =
  | 'injected-atomic-transaction-commit-executor'
  | 'electron-main-visible-import-atomic-transaction-commit-executor'

export type ThirdPartyDataPackAtomicTransactionCommitExecutorHostMode =
  | 'injected-test-only'
  | 'electron-main-visible-import'

export type ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheckId =
  | 'atomic-preflight-deferred'
  | 'install-command-source'
  | 'target-package-selected'
  | 'candidate-identity-present'
  | 'lockfile-hash-present'
  | 'injected-commit-host-ready'
  | 'commit-host-boundary'
  | 'no-upstream-commit-effects'
  | 'commit-outcome-returned'
  | 'outcome-contract-ready'

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheck {
  readonly id: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorRequest {
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
  readonly writeProbeEvidence: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult['writeProbeEvidence']
}

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorHost {
  readonly kind: ThirdPartyDataPackAtomicTransactionCommitExecutorHostKind
  readonly mode: ThirdPartyDataPackAtomicTransactionCommitExecutorHostMode
  readonly execute: (
    request: ThirdPartyDataPackAtomicTransactionCommitExecutorRequest
  ) => ThirdPartyDataPackAtomicTransactionCommitOutcomeSource
    | Promise<ThirdPartyDataPackAtomicTransactionCommitOutcomeSource>
}

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterEffectSummary {
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
  readonly atomicCommitExecutorCalled: boolean
  readonly injectedCommitHostCalled: boolean
  readonly commitOutcomeReceived: boolean
  readonly committedOutcomeReceived: boolean
  readonly failedOutcomeReceived: boolean
  readonly retryOutcomeReceived: boolean
  readonly rollbackOutcomeReceived: boolean
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

export interface ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult {
  readonly status: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterStatus
  readonly sourcePreflightStatus: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult['status']
  readonly outcomeContractStatus?: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult['status']
  readonly reason: string
  readonly atomicTransactionCommitExecutorAdapter: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterStatus
  readonly readOnly: true
  readonly injectedExecutorHostRequired: boolean
  readonly atomicTransactionCommitExecutorHostMode: ThirdPartyDataPackAtomicTransactionCommitExecutorHostMode
  readonly injectedExecutorHostMode: ThirdPartyDataPackAtomicTransactionCommitExecutorHostMode
  readonly commitHostCalled: boolean
  readonly commitOutcomeReceived: boolean
  readonly commitOutcomeNormalized: boolean
  readonly atomicCommitExecutionAllowed: boolean
  readonly commandDispatchAllowed: false
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
  readonly commitRequest?: ThirdPartyDataPackAtomicTransactionCommitExecutorRequest
  readonly outcomeContract?: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult
  readonly checks: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackAtomicTransactionCommitOutcomeSummary
  readonly effects: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterEffectSummary
}

export interface ExecuteThirdPartyDataPackAtomicTransactionCommitExecutorAdapterOptions {
  readonly preflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
  readonly host?: ThirdPartyDataPackAtomicTransactionCommitExecutorHost
}

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
      ?? 'third-party.atomic-transaction-commit-executor-adapter.diagnostic-copy',
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
  checks: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.atomic-transaction-commit-executor-adapter.checks.${currentCheck.id}`,
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

const cloneWriteProbeEvidence = (
  evidence: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult['writeProbeEvidence']
): ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult['writeProbeEvidence'] => Object.freeze({
  modLockWriteProbeStatus: (readOwnStringField(evidence, 'modLockWriteProbeStatus') ?? 'blocked') as ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult['writeProbeEvidence']['modLockWriteProbeStatus'],
  transactionLogWriteProbeStatus: (readOwnStringField(evidence, 'transactionLogWriteProbeStatus') ?? 'blocked') as ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult['writeProbeEvidence']['transactionLogWriteProbeStatus'],
  modLockPersistentWriteExecuted: readOwnBooleanField(evidence, 'modLockPersistentWriteExecuted') ?? false,
  transactionLogPersistentWriteExecuted: readOwnBooleanField(evidence, 'transactionLogPersistentWriteExecuted') ?? false
})

const cloneOutcomeSource = (
  value: unknown
): ThirdPartyDataPackAtomicTransactionCommitOutcomeSource | undefined => {
  if (value === undefined || value === null || typeof value !== 'object') return undefined
  const kind = readOwnStringField(value, 'kind')
  const settled = readOwnBooleanField(value, 'settled')
  if (kind === undefined || settled === undefined) return undefined
  const diagnostics = readOwnDataField(value, 'diagnostics')
  return Object.freeze({
    kind: kind as ThirdPartyDataPackAtomicTransactionCommitOutcomeKind,
    settled,
    packageId: readOwnStringField(value, 'packageId') as PackageId | undefined,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(value, 'candidateIdentity')),
    lockfileHash: readOwnStringField(value, 'lockfileHash') as Sha256Hash | undefined,
    diagnostics: Array.isArray(diagnostics) ? diagnostics : undefined,
    messageKey: readOwnStringField(value, 'messageKey'),
    recovery: readOwnStringField(value, 'recovery') as ModDiagnosticRecovery | undefined,
    retryable: readOwnBooleanField(value, 'retryable'),
    rollbackRequired: readOwnBooleanField(value, 'rollbackRequired')
  })
}

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

const createEffectSummary = (
  hostCalled: boolean,
  outcomeKind: ThirdPartyDataPackAtomicTransactionCommitOutcomeKind | undefined,
  outcomeReceived: boolean,
  hostMode: ThirdPartyDataPackAtomicTransactionCommitExecutorHostMode
): ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterEffectSummary => ({
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
  atomicCommitExecutorCalled: hostCalled,
  injectedCommitHostCalled: hostCalled && hostMode === defaultHostMode,
  commitOutcomeReceived: outcomeReceived,
  committedOutcomeReceived: outcomeKind === 'committed',
  failedOutcomeReceived: outcomeKind === 'failed',
  retryOutcomeReceived: outcomeKind === 'retry',
  rollbackOutcomeReceived: outcomeKind === 'rollback',
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

const check = (
  id: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheckId,
  status: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheck['status'],
  reason: string
): ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheck => Object.freeze({ id, status, reason })

const defaultHostMode: ThirdPartyDataPackAtomicTransactionCommitExecutorHostMode = 'injected-test-only'

const hostBoundaryAccepted = (
  host: ThirdPartyDataPackAtomicTransactionCommitExecutorHost | undefined
): boolean => (
  host?.kind === 'injected-atomic-transaction-commit-executor'
    && host.mode === 'injected-test-only'
) || (
  host?.kind === 'electron-main-visible-import-atomic-transaction-commit-executor'
    && host.mode === 'electron-main-visible-import'
)

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheck[] => Object.freeze([
  'atomic-preflight-deferred',
  'install-command-source',
  'target-package-selected',
  'candidate-identity-present',
  'lockfile-hash-present',
  'injected-commit-host-ready',
  'commit-host-boundary',
  'no-upstream-commit-effects',
  'commit-outcome-returned',
  'outcome-contract-ready'
].map(id => check(
  id as ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheckId,
  'skipped',
  reason
)))

const preExecutionChecks = (
  preflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  host: ThirdPartyDataPackAtomicTransactionCommitExecutorHost | undefined
): readonly ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheck[] => {
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  return Object.freeze([
    check(
      'atomic-preflight-deferred',
      preflight.status === 'deferred' ? 'satisfied' : 'blocked',
      'Atomic commit outcome host execution requires the source atomic preflight to remain deferred.'
    ),
    check(
      'install-command-source',
      preflight.requestedCommandId === 'install' ? 'satisfied' : 'blocked',
      'This atomic commit executor adapter only covers install commands.'
    ),
    check(
      'target-package-selected',
      preflight.targetPackageId !== undefined && selectedPackageIds.includes(preflight.targetPackageId)
        ? 'satisfied'
        : 'blocked',
      'The selected install target must be present before constructing a commit outcome request.'
    ),
    check(
      'candidate-identity-present',
      preflight.candidateIdentity?.candidateHash !== undefined ? 'satisfied' : 'blocked',
      'Atomic commit outcome host execution requires the candidate identity produced by the preflight chain.'
    ),
    check(
      'lockfile-hash-present',
      preflight.lockfileHash !== undefined ? 'satisfied' : 'blocked',
      'Atomic commit outcome host execution requires the lockfile hash produced by the preflight chain.'
    ),
    check(
      'injected-commit-host-ready',
      host !== undefined && typeof host.execute === 'function' ? 'satisfied' : 'blocked',
      'A fixed path-free commit outcome host must be present before the adapter can execute.'
    ),
    check(
      'commit-host-boundary',
      hostBoundaryAccepted(host)
        ? 'satisfied'
        : 'blocked',
      'The adapter only accepts explicit path-free host modes and must not bind real platform writers.'
    ),
    check(
      'no-upstream-commit-effects',
      preflight.atomicCommitExecutionAllowed === false
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
        ? 'satisfied'
        : 'blocked',
      'The source atomic preflight must not already contain command dispatch, commit, runtime, UI/IPC, write or rollback effects.'
    ),
    check(
      'commit-outcome-returned',
      'skipped',
      'Commit outcome presence is checked only after the path-free host returns.'
    ),
    check(
      'outcome-contract-ready',
      'skipped',
      'Outcome contract readiness is checked only after host outcome normalization.'
    )
  ])
}

const checksWithOutcome = (
  checks: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheck[],
  outcomeStatus: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheck['status'],
  outcomeReason: string,
  contractStatus: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheck['status'],
  contractReason: string
): readonly ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheck[] => Object.freeze(checks.map(currentCheck => {
  if (currentCheck.id === 'commit-outcome-returned') return check('commit-outcome-returned', outcomeStatus, outcomeReason)
  if (currentCheck.id === 'outcome-contract-ready') return check('outcome-contract-ready', contractStatus, contractReason)
  return currentCheck
}))

const buildCommitRequest = (
  preflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult
): ThirdPartyDataPackAtomicTransactionCommitExecutorRequest | undefined => {
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
    writeProbeEvidence: cloneWriteProbeEvidence(preflight.writeProbeEvidence)
  })
}

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
  status: ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterStatus,
  reason: string,
  preflight: ThirdPartyDataPackAtomicTransactionCommitExecutorPreflightResult,
  checks: readonly ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterCheck[],
  diagnostics: readonly ThirdPartyDataPackAtomicTransactionCommitOutcomeSafeDiagnostic[],
  hostCalled: boolean,
  hostMode: ThirdPartyDataPackAtomicTransactionCommitExecutorHostMode = defaultHostMode,
  commitRequest?: ThirdPartyDataPackAtomicTransactionCommitExecutorRequest,
  outcomeContract?: ThirdPartyDataPackAtomicTransactionCommitOutcomeContractResult
): ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult => {
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(preflight.blockedPackageIds)
  const loadOrder = clonePackageIds(preflight.loadOrder)
  const outcomeKind = outcomeContract?.outcome?.kind
  const outcomeReceived = outcomeContract !== undefined
  const normalized = outcomeContract?.status === 'ready' && outcomeContract.outcome !== undefined

  return deepFreezeObjectGraph({
    status,
    sourcePreflightStatus: preflight.status,
    outcomeContractStatus: outcomeContract?.status,
    reason,
    atomicTransactionCommitExecutorAdapter: status,
    readOnly: true,
    injectedExecutorHostRequired: hostMode === defaultHostMode,
    atomicTransactionCommitExecutorHostMode: hostMode,
    injectedExecutorHostMode: hostMode,
    commitHostCalled: hostCalled,
    commitOutcomeReceived: outcomeReceived,
    commitOutcomeNormalized: normalized,
    atomicCommitExecutionAllowed: status === 'executed',
    commandDispatchAllowed: false,
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
    ...(commitRequest === undefined ? {} : { commitRequest }),
    ...(outcomeContract === undefined ? {} : { outcomeContract }),
    checks,
    diagnostics,
    summary: outcomeContract?.summary ?? summary(preflight, diagnostics.length),
    effects: createEffectSummary(hostCalled, outcomeKind, outcomeReceived, hostMode)
  })
}

export const executeThirdPartyDataPackAtomicTransactionCommitExecutorAdapter = async (
  options: ExecuteThirdPartyDataPackAtomicTransactionCommitExecutorAdapterOptions
): Promise<ThirdPartyDataPackAtomicTransactionCommitExecutorAdapterResult> => {
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
  const commitRequest = buildCommitRequest(preflight)

  if (blockedDiagnostics.length > 0 || options.host === undefined || commitRequest === undefined) {
    return baseResult(
      'blocked',
      'atomic transaction commit executor adapter inputs are inconsistent',
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
    rawOutcome = await options.host.execute(commitRequest)
  } catch {
    const outcomeChecks = checksWithOutcome(
      checks,
      'blocked',
      'The path-free atomic commit outcome host threw before returning a settled outcome.',
      'skipped',
      'Outcome contract readiness is skipped because no safe outcome was returned.'
    )
    return baseResult(
      'blocked',
      'atomic transaction commit outcome host failed before outcome',
      preflight,
      outcomeChecks,
      [
        ...sourceDiagnostics,
        commandDiagnostic(
          'third-party.atomic-transaction-commit-executor-adapter.host-failed',
          preflight.targetPackageId
        )
      ],
      true,
      options.host.mode,
      commitRequest
    )
  }

  const outcomeSource = cloneOutcomeSource(rawOutcome)
  if (outcomeSource === undefined) {
    const outcomeChecks = checksWithOutcome(
      checks,
      'blocked',
      'The path-free atomic commit outcome host did not return a safe settled outcome source.',
      'skipped',
      'Outcome contract readiness is skipped because no safe outcome was returned.'
    )
    return baseResult(
      'blocked',
      'atomic transaction commit outcome host returned an invalid outcome',
      preflight,
      outcomeChecks,
      [
        ...sourceDiagnostics,
        commandDiagnostic(
          'third-party.atomic-transaction-commit-executor-adapter.outcome-invalid',
          preflight.targetPackageId
        )
      ],
      true,
      options.host.mode,
      commitRequest
    )
  }

  const outcomeContract = buildThirdPartyDataPackAtomicTransactionCommitOutcomeContract({
    preflight,
    outcome: outcomeSource
  })
  const outcomeReady = outcomeContract.status === 'ready' && outcomeContract.outcome !== undefined
  const outcomeChecks = checksWithOutcome(
    checks,
    'satisfied',
    'The path-free atomic commit outcome host returned a safe settled outcome source.',
    outcomeReady ? 'satisfied' : 'blocked',
    outcomeReady
      ? 'The atomic commit outcome contract normalized the path-free host outcome.'
      : 'The atomic commit outcome contract rejected the path-free host outcome.'
  )

  if (!outcomeReady) {
    return baseResult(
      'blocked',
      'atomic transaction commit outcome contract rejected host outcome',
      preflight,
      outcomeChecks,
      [
        ...sourceDiagnostics,
        ...outcomeContract.diagnostics,
        ...diagnosticsForBlockedChecks(outcomeChecks, preflight.targetPackageId)
      ],
      true,
      options.host.mode,
      commitRequest,
      outcomeContract
    )
  }

  return baseResult(
    'executed',
    'atomic transaction commit executor adapter executed a path-free commit outcome host and normalized its outcome',
    preflight,
    outcomeChecks,
    outcomeContract.diagnostics,
    true,
    options.host.mode,
    commitRequest,
    outcomeContract
  )
}
