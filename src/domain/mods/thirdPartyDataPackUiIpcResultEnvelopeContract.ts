import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from './thirdPartyDataPackUiIpcResultNormalizationPreflight'

export type ThirdPartyDataPackUiIpcResultEnvelopeContractStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind =
  | 'success'
  | 'failure'
  | 'retry'
  | 'rollback'

export type ThirdPartyDataPackUiIpcResultEnvelopeContractCheckId =
  | 'result-normalization-preflight-deferred'
  | 'install-command-source'
  | 'settled-outcome-source'
  | 'target-package-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'outcome-kind-supported'
  | 'no-ui-ipc-delivery-effects-intact'

export interface ThirdPartyDataPackUiIpcResultEnvelopeContractCheck {
  readonly id: ThirdPartyDataPackUiIpcResultEnvelopeContractCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackUiIpcResultEnvelopeOutcomeSource {
  readonly kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
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

export interface ThirdPartyDataPackUiIpcResultEnvelopeSummary {
  readonly selectedPackageCount: number
  readonly blockedPackageCount: number
  readonly blockedCandidateCount: number
  readonly loadOrderCount: number
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly diagnosticCount: number
}

export interface ThirdPartyDataPackUiIpcResultEnvelope {
  readonly formatVersion: 1
  readonly kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly commandId: 'install'
  readonly packageId: PackageId
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly messageKey: string
  readonly recovery: ModDiagnosticRecovery
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
}

export interface ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary {
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
  readonly postCommitVerificationExecutorCalled: false
  readonly postCommitVerificationExecuted: false
  readonly transactionLogRead: false
  readonly packageStateRead: false
  readonly settingsRead: false
  readonly lockfileRead: false
  readonly liveRegistryRead: false
  readonly saveCacheIsolationChecked: false
  readonly successEnvelopeDelivered: false
  readonly failureEnvelopeDelivered: false
  readonly retryStateDelivered: false
  readonly rollbackStateDelivered: false
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

export interface ThirdPartyDataPackUiIpcResultEnvelopeContractResult {
  readonly status: ThirdPartyDataPackUiIpcResultEnvelopeContractStatus
  readonly sourcePreflightStatus: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult['status']
  readonly reason: string
  readonly resultEnvelopeContract: ThirdPartyDataPackUiIpcResultEnvelopeContractStatus
  readonly readOnly: true
  readonly envelopeNormalized: boolean
  readonly uiIpcResponseDeliveryAllowed: false
  readonly electronIpcAllowed: false
  readonly webUiBridgeAllowed: false
  readonly androidUiBridgeAllowed: false
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly postCommitVerificationAllowed: false
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
  readonly checks: readonly ThirdPartyDataPackUiIpcResultEnvelopeContractCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly envelope?: ThirdPartyDataPackUiIpcResultEnvelope
  readonly effects: ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary
}

export interface BuildThirdPartyDataPackUiIpcResultEnvelopeContractOptions {
  readonly preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
  readonly outcome: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeSource
}

const outcomeKinds = new Set<ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind>([
  'success',
  'failure',
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

const createEffectSummary = (): ThirdPartyDataPackUiIpcResultEnvelopeEffectSummary => ({
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
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
  successEnvelopeDelivered: false,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
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
): ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic => {
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
      ?? 'third-party.ui-ipc-result-envelope-contract.diagnostic-copy',
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
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] = []
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
): ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackUiIpcResultEnvelopeContractCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.ui-ipc-result-envelope-contract.checks.${currentCheck.id}`,
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
): kind is ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind =>
  outcomeKinds.has(kind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind)

const safeRecovery = (
  value: ModDiagnosticRecovery | undefined
): ModDiagnosticRecovery =>
  diagnosticRecoveries.has(value as ModDiagnosticRecovery) ? value as ModDiagnosticRecovery : 'none'

const defaultMessageKey = (
  kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): string => `mods.ui.ipc.result.install.${kind}`

const safeMessageKey = (
  value: string | undefined,
  kind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): string => {
  if (value !== undefined && /^[A-Za-z0-9_.-]+$/.test(value)) return value
  return defaultMessageKey(kind)
}

const candidateIdentityMatches = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  outcome: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeSource
): boolean => {
  const expected = preflight.candidateIdentity?.candidateHash
  const actual = outcome.candidateIdentity?.candidateHash
  if (outcome.kind === 'success') return expected !== undefined && actual === expected
  return actual === undefined || (expected !== undefined && actual === expected)
}

const lockfileHashMatches = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  outcome: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeSource
): boolean => {
  if (outcome.kind === 'success') return preflight.lockfileHash !== undefined && outcome.lockfileHash === preflight.lockfileHash
  return outcome.lockfileHash === undefined || outcome.lockfileHash === preflight.lockfileHash
}

const noDeliveryEffectsIntact = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
): boolean => preflight.successEnvelopeAllowed === false
  && preflight.failureEnvelopeAllowed === false
  && preflight.retryStateAllowed === false
  && preflight.rollbackStateAllowed === false
  && preflight.uiIpcResponseDeliveryAllowed === false
  && preflight.commandDispatchAllowed === false
  && preflight.transactionCommitAllowed === false
  && preflight.postCommitVerificationAllowed === false
  && preflight.runtimeEnablementAllowed === false
  && preflight.writeAllowed === false
  && preflight.rollbackRecoveryAllowed === false
  && everyOwnDataValueFalse(preflight.effects)

const check = (
  id: ThirdPartyDataPackUiIpcResultEnvelopeContractCheckId,
  status: ThirdPartyDataPackUiIpcResultEnvelopeContractCheck['status'],
  reason: string
): ThirdPartyDataPackUiIpcResultEnvelopeContractCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackUiIpcResultEnvelopeContractCheck[] => Object.freeze([
  'result-normalization-preflight-deferred',
  'install-command-source',
  'settled-outcome-source',
  'target-package-consistent',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'outcome-kind-supported',
  'no-ui-ipc-delivery-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackUiIpcResultEnvelopeContractCheckId,
  'skipped',
  reason
)))

const buildChecks = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  outcome: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeSource
): readonly ThirdPartyDataPackUiIpcResultEnvelopeContractCheck[] => Object.freeze([
  check(
    'result-normalization-preflight-deferred',
    preflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'UI/IPC result envelope normalization requires a deferred result-normalization preflight as its source contract.'
  ),
  check(
    'install-command-source',
    preflight.requestedCommandId === 'install' ? 'satisfied' : 'blocked',
    'The first UI/IPC result envelope contract only covers install results; enable, disable, upgrade and uninstall need separate envelopes.'
  ),
  check(
    'settled-outcome-source',
    outcome.settled === true ? 'satisfied' : 'blocked',
    'A UI/IPC result envelope must be sourced from an explicit settled outcome, not an inspect-only preflight.'
  ),
  check(
    'target-package-consistent',
    preflight.targetPackageId !== undefined
      && outcome.packageId === preflight.targetPackageId
      && clonePackageIds(preflight.selectedPackageIds).includes(preflight.targetPackageId)
      ? 'satisfied'
      : 'blocked',
    'The settled outcome must describe the same selected install target as the source preflight.'
  ),
  check(
    'candidate-identity-consistent',
    candidateIdentityMatches(preflight, outcome) ? 'satisfied' : 'blocked',
    'A success envelope must prove the candidate identity; failure, retry and rollback envelopes may omit it but must not drift when present.'
  ),
  check(
    'lockfile-hash-consistent',
    lockfileHashMatches(preflight, outcome) ? 'satisfied' : 'blocked',
    'A success envelope must prove the lockfile hash; failure, retry and rollback envelopes may omit it but must not drift when present.'
  ),
  check(
    'outcome-kind-supported',
    supportedOutcomeKind(outcome.kind) ? 'satisfied' : 'blocked',
    'UI/IPC result envelopes must be one of success, failure, retry or rollback.'
  ),
  check(
    'no-ui-ipc-delivery-effects-intact',
    noDeliveryEffectsIntact(preflight) ? 'satisfied' : 'blocked',
    'Result envelope normalization must not carry response delivery, IPC, runtime enablement, read, write, rollback or diagnostic write effects.'
  )
])

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const summary = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  diagnosticCount: number
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => Object.freeze({
  selectedPackageCount: clonePackageIds(preflight.selectedPackageIds).length,
  blockedPackageCount: clonePackageIds(preflight.blockedPackageIds).length,
  blockedCandidateCount: preflight.blockedCandidateCount,
  loadOrderCount: clonePackageIds(preflight.loadOrder).length,
  registryCount: preflight.registryCount,
  entryCount: preflight.entryCount,
  packageCount: preflight.packageCount,
  diagnosticCount
})

const buildEnvelope = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  outcome: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeSource,
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  resultSummary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
): ThirdPartyDataPackUiIpcResultEnvelope => Object.freeze({
  formatVersion: 1,
  kind: outcome.kind,
  commandId: 'install',
  packageId: outcome.packageId as PackageId,
  candidateHash: outcome.candidateIdentity?.candidateHash ?? preflight.candidateIdentity?.candidateHash,
  lockfileHash: outcome.lockfileHash ?? preflight.lockfileHash,
  messageKey: safeMessageKey(outcome.messageKey, outcome.kind),
  recovery: safeRecovery(outcome.recovery),
  retryable: outcome.retryable === true || outcome.kind === 'retry',
  rollbackRequired: outcome.rollbackRequired === true || outcome.kind === 'rollback',
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
  status: ThirdPartyDataPackUiIpcResultEnvelopeContractStatus,
  reason: string,
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  checks: readonly ThirdPartyDataPackUiIpcResultEnvelopeContractCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  envelope?: ThirdPartyDataPackUiIpcResultEnvelope
): ThirdPartyDataPackUiIpcResultEnvelopeContractResult => {
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(preflight.blockedPackageIds)
  const loadOrder = clonePackageIds(preflight.loadOrder)
  const resultSummary = envelope?.summary ?? summary(preflight, diagnostics.length)

  return deepFreezeObjectGraph({
    status,
    sourcePreflightStatus: preflight.status,
    reason,
    resultEnvelopeContract: status,
    readOnly: true,
    envelopeNormalized: envelope !== undefined,
    uiIpcResponseDeliveryAllowed: false,
    electronIpcAllowed: false,
    webUiBridgeAllowed: false,
    androidUiBridgeAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: preflight.requestedCommandId === 'install' ? 'install' as const : undefined,
    targetPackageId: preflight.targetPackageId,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: preflight.blockedCandidateCount,
    loadOrder,
    registryCount: preflight.registryCount,
    entryCount: preflight.entryCount,
    packageCount: preflight.packageCount,
    candidateIdentity: cloneCandidateIdentity(preflight.candidateIdentity),
    lockfileHash: preflight.lockfileHash,
    checks,
    diagnostics,
    summary: resultSummary,
    ...(envelope === undefined ? {} : { envelope }),
    effects: createEffectSummary()
  })
}

export const buildThirdPartyDataPackUiIpcResultEnvelopeContract = (
  options: BuildThirdPartyDataPackUiIpcResultEnvelopeContractOptions
): ThirdPartyDataPackUiIpcResultEnvelopeContractResult => {
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
      'UI/IPC result envelope contract inputs are inconsistent',
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
  const envelope = buildEnvelope(preflight, outcome, diagnostics, resultSummary)

  return baseResult(
    'ready',
    'UI/IPC result envelope contract is ready as a path-free domain source; response delivery remains disabled',
    preflight,
    checks,
    diagnostics,
    envelope
  )
}
