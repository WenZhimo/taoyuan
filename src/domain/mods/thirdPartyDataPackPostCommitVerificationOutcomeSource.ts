import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitVerificationOutcomeContractResult
} from './thirdPartyDataPackPostCommitVerificationOutcomeContract'
import type {
  ThirdPartyDataPackPostCommitVerificationOutcomeKind,
  ThirdPartyDataPackPostCommitVerificationSafeDiagnostic,
  ThirdPartyDataPackPostCommitVerificationSummary
} from './thirdPartyDataPackPostCommitVerificationExecutorAdapter'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_OUTCOME_SOURCE_KIND =
  'third-party-post-commit-verification-outcome-source'
export const THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_OUTCOME_SOURCE_MODE =
  'default-disabled-post-commit-verification-outcome-source'

export type ThirdPartyDataPackPostCommitVerificationOutcomeSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackPostCommitVerificationOutcomeSourceEffectSummary {
  readonly postCommitVerificationOutcomeSourceCalled: boolean
  readonly postCommitVerificationOutcomeContractSourceCalled: boolean
  readonly outcomeContractAccepted: boolean
  readonly verificationOutcomeNormalized: boolean
  readonly verifiedOutcomeAccepted: boolean
  readonly failedOutcomeAccepted: boolean
  readonly retryOutcomeAccepted: boolean
  readonly rollbackOutcomeAccepted: boolean
  readonly realPostCommitVerificationOutcomeSourceCalled: false
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
  readonly runtimePublicationCommitted: false
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

export interface ThirdPartyDataPackPostCommitVerificationOutcomeSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_OUTCOME_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_OUTCOME_SOURCE_MODE
  readonly status: ThirdPartyDataPackPostCommitVerificationOutcomeSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly outcomeContractStatus?: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult['status']
  readonly sourcePreflightStatus?: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult['sourcePreflightStatus']
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly verificationOutcomeKind?: ThirdPartyDataPackPostCommitVerificationOutcomeKind
  readonly messageKey?: string
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly transactionLogMatched: boolean
  readonly packageStateMatched: boolean
  readonly settingsLockfileMatched: boolean
  readonly liveRegistryMatched: boolean
  readonly saveCacheIsolated: boolean
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackPostCommitVerificationSummary
  readonly effects: ThirdPartyDataPackPostCommitVerificationOutcomeSourceEffectSummary
}

export interface CreateThirdPartyDataPackPostCommitVerificationOutcomeSourceOptions {
  readonly enabled?: boolean
  readonly readPostCommitVerificationOutcomeContract?: () => Awaitable<ThirdPartyDataPackPostCommitVerificationOutcomeContractResult>
}

export class ThirdPartyDataPackPostCommitVerificationOutcomeSourceBlockedError extends Error {
  readonly result: ThirdPartyDataPackPostCommitVerificationOutcomeSourceResult

  constructor(result: ThirdPartyDataPackPostCommitVerificationOutcomeSourceResult) {
    super('third-party post-commit verification outcome source blocked result continuation')
    this.name = 'ThirdPartyDataPackPostCommitVerificationOutcomeSourceBlockedError'
    this.result = result
  }
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
const outcomeKinds = new Set<ThirdPartyDataPackPostCommitVerificationOutcomeKind>([
  'verified',
  'failed',
  'retry',
  'rollback'
])

const forbiddenOutcomeSourceFields = [
  'preflight',
  'sourcePreflight',
  'verificationPreflight',
  'postCommitVerificationExecutorPreflight',
  'outcomeSource',
  'rawOutcomeSource',
  'verificationHost',
  'postCommitVerificationHost',
  'realVerificationHost',
  'transactionLogReader',
  'packageStateReader',
  'settingsReader',
  'lockfileReader',
  'liveRegistryReader',
  'saveCacheReader',
  'packageWriter',
  'packageFileWriter',
  'packageBackupWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'recoveryLogStorage',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

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
  value: object | undefined,
  fieldName: string
): unknown => {
  if (value === undefined) return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object | undefined,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnNumberField = (
  value: object | undefined,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

const readOwnBooleanField = (
  value: object | undefined,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const hasOwnEnumerableField = (
  value: object,
  fieldName: string
): boolean => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return true
  }
  return descriptor?.enumerable === true
}

const supportedOutcomeKind = (
  kind: string | undefined
): kind is ThirdPartyDataPackPostCommitVerificationOutcomeKind =>
  kind !== undefined && outcomeKinds.has(kind as ThirdPartyDataPackPostCommitVerificationOutcomeKind)

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
      ?? 'third-party.post-commit-verification-outcome-source.diagnostic-copy',
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

const emptySummary = (): ThirdPartyDataPackPostCommitVerificationSummary => Object.freeze({
  selectedPackageCount: 0,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 0,
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  diagnosticCount: 0
})

const cloneSummary = (
  value: unknown,
  diagnostics: readonly unknown[]
): ThirdPartyDataPackPostCommitVerificationSummary => {
  if (value === undefined || value === null || typeof value !== 'object') {
    return Object.freeze({
      ...emptySummary(),
      diagnosticCount: diagnostics.length
    })
  }
  return Object.freeze({
    selectedPackageCount: readOwnNumberField(value, 'selectedPackageCount') ?? 0,
    blockedPackageCount: readOwnNumberField(value, 'blockedPackageCount') ?? 0,
    blockedCandidateCount: readOwnNumberField(value, 'blockedCandidateCount') ?? 0,
    loadOrderCount: readOwnNumberField(value, 'loadOrderCount') ?? 0,
    registryCount: readOwnNumberField(value, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(value, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(value, 'packageCount') ?? 0,
    diagnosticCount: diagnostics.length
  })
}

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

const everyOwnDataValueFalse = (
  value: object | undefined
): boolean => {
  if (value === undefined) return false
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

const noPersistentReadWriteDrift = (
  source: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult
): boolean => readOwnBooleanField(source, 'verificationExecutionAllowed') === false
  && readOwnBooleanField(source, 'postCommitVerificationAllowed') === false
  && readOwnBooleanField(source, 'transactionLogReadAllowed') === false
  && readOwnBooleanField(source, 'packageStateReadAllowed') === false
  && readOwnBooleanField(source, 'settingsReadAllowed') === false
  && readOwnBooleanField(source, 'lockfileReadAllowed') === false
  && readOwnBooleanField(source, 'liveRegistryReadAllowed') === false
  && readOwnBooleanField(source, 'saveCacheIsolationCheckAllowed') === false
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'uiIpcResponseAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'rollbackRecoveryAllowed') === false
  && everyOwnDataValueFalse(readOwnDataField(source, 'effects') as object | undefined)

const pathFreeOutcomeSource = (
  source: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult
): boolean => forbiddenOutcomeSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const pathFreeOutcomeObject = (
  outcome: object | undefined
): boolean => outcome !== undefined
  && forbiddenOutcomeSourceFields.every(fieldName => !hasOwnEnumerableField(outcome, fieldName))

const outcomeObject = (
  source: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult | undefined
): object | undefined => {
  const outcome = readOwnDataField(source, 'outcome')
  return outcome !== undefined && outcome !== null && typeof outcome === 'object' ? outcome : undefined
}

const candidateIdentityMatches = (
  source: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult,
  outcome: object,
  kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind
): boolean => {
  const sourceCandidateHash = readOwnStringField(
    readOwnDataField(source, 'candidateIdentity') as object | undefined,
    'candidateHash'
  )
  const outcomeCandidateHash = readOwnStringField(outcome, 'candidateHash')
  if (kind === 'verified') return sourceCandidateHash !== undefined && outcomeCandidateHash === sourceCandidateHash
  return outcomeCandidateHash === undefined || (sourceCandidateHash !== undefined && outcomeCandidateHash === sourceCandidateHash)
}

const lockfileHashMatches = (
  source: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult,
  outcome: object,
  kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind
): boolean => {
  const sourceLockfileHash = readOwnStringField(source, 'lockfileHash')
  const outcomeLockfileHash = readOwnStringField(outcome, 'lockfileHash')
  if (kind === 'verified') return sourceLockfileHash !== undefined && outcomeLockfileHash === sourceLockfileHash
  return outcomeLockfileHash === undefined || outcomeLockfileHash === sourceLockfileHash
}

const verifiedSignalsConsistent = (
  outcome: object,
  kind: ThirdPartyDataPackPostCommitVerificationOutcomeKind
): boolean => kind !== 'verified'
  || (
    readOwnBooleanField(outcome, 'transactionLogMatched') === true
    && readOwnBooleanField(outcome, 'packageStateMatched') === true
    && readOwnBooleanField(outcome, 'settingsLockfileMatched') === true
    && readOwnBooleanField(outcome, 'liveRegistryMatched') === true
    && readOwnBooleanField(outcome, 'saveCacheIsolated') === true
  )

const safeSkippedSource = (
  source: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && readOwnStringField(source, 'postCommitVerificationOutcomeContract') === 'skipped'
  && readOwnBooleanField(source, 'verificationOutcomeNormalized') === false
  && noPersistentReadWriteDrift(source)
  && pathFreeOutcomeSource(source)

const safeReadySource = (
  source: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult
): boolean => {
  const outcome = outcomeObject(source)
  const kind = readOwnStringField(outcome, 'kind')
  const targetPackageId = readOwnStringField(source, 'targetPackageId')
  return readOwnStringField(source, 'status') === 'ready'
    && readOwnStringField(source, 'postCommitVerificationOutcomeContract') === 'ready'
    && readOwnStringField(source, 'sourcePreflightStatus') === 'deferred'
    && readOwnBooleanField(source, 'verificationOutcomeNormalized') === true
    && supportedOutcomeKind(kind)
    && outcome !== undefined
    && readOwnStringField(outcome, 'commandId') === 'install'
    && readOwnStringField(outcome, 'packageId') === targetPackageId
    && candidateIdentityMatches(source, outcome, kind)
    && lockfileHashMatches(source, outcome, kind)
    && verifiedSignalsConsistent(outcome, kind)
    && noPersistentReadWriteDrift(source)
    && pathFreeOutcomeSource(source)
    && pathFreeOutcomeObject(outcome)
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

const effectSummary = (
  sourceCalled: boolean,
  accepted: boolean,
  outcomeKind: ThirdPartyDataPackPostCommitVerificationOutcomeKind | undefined,
  source?: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult
): ThirdPartyDataPackPostCommitVerificationOutcomeSourceEffectSummary => Object.freeze({
  postCommitVerificationOutcomeSourceCalled: true,
  postCommitVerificationOutcomeContractSourceCalled: sourceCalled,
  outcomeContractAccepted: accepted,
  verificationOutcomeNormalized: accepted && readOwnBooleanField(source, 'verificationOutcomeNormalized') === true,
  verifiedOutcomeAccepted: accepted && outcomeKind === 'verified',
  failedOutcomeAccepted: accepted && outcomeKind === 'failed',
  retryOutcomeAccepted: accepted && outcomeKind === 'retry',
  rollbackOutcomeAccepted: accepted && outcomeKind === 'rollback',
  realPostCommitVerificationOutcomeSourceCalled: false,
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
  runtimePublicationCommitted: false,
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

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackPostCommitVerificationOutcomeSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult
    readonly diagnostics?: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[]
  }
): ThirdPartyDataPackPostCommitVerificationOutcomeSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const outcome = outcomeObject(options.source)
  const rawOutcomeKind = readOwnStringField(outcome, 'kind')
  const outcomeKind = supportedOutcomeKind(rawOutcomeKind) ? rawOutcomeKind : undefined
  const continuationAllowed = options.status !== 'blocked'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_OUTCOME_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_OUTCOME_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    commandContinuationAllowed: continuationAllowed,
    uiIpcResultContinuationAllowed: continuationAllowed,
    outcomeContractStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackPostCommitVerificationOutcomeContractResult['status']
      | undefined,
    sourcePreflightStatus: readOwnStringField(options.source, 'sourcePreflightStatus') as
      | ThirdPartyDataPackPostCommitVerificationOutcomeContractResult['sourcePreflightStatus']
      | undefined,
    requestedCommandId: readOwnStringField(options.source, 'requestedCommandId') === 'install'
      ? 'install' as const
      : undefined,
    targetPackageId: readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined,
    verificationOutcomeKind: outcomeKind,
    messageKey: readOwnStringField(outcome, 'messageKey'),
    retryable: readOwnBooleanField(outcome, 'retryable') ?? false,
    rollbackRequired: readOwnBooleanField(outcome, 'rollbackRequired') ?? false,
    transactionLogMatched: readOwnBooleanField(outcome, 'transactionLogMatched') ?? false,
    packageStateMatched: readOwnBooleanField(outcome, 'packageStateMatched') ?? false,
    settingsLockfileMatched: readOwnBooleanField(outcome, 'settingsLockfileMatched') ?? false,
    liveRegistryMatched: readOwnBooleanField(outcome, 'liveRegistryMatched') ?? false,
    saveCacheIsolated: readOwnBooleanField(outcome, 'saveCacheIsolated') ?? false,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(options.source, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(options.source, 'candidateIdentity')),
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    diagnostics,
    summary: cloneSummary(readOwnDataField(options.source, 'summary'), diagnostics),
    effects: effectSummary(options.sourceCalled, options.status === 'ready', outcomeKind, options.source)
  })
}

const evaluatePostCommitVerificationOutcomeSource = async(
  options: CreateThirdPartyDataPackPostCommitVerificationOutcomeSourceOptions
): Promise<ThirdPartyDataPackPostCommitVerificationOutcomeSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit verification outcome source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readPostCommitVerificationOutcomeContract === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit verification outcome source is enabled without an outcome contract source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-verification-outcome-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackPostCommitVerificationOutcomeContractResult
  try {
    source = await options.readPostCommitVerificationOutcomeContract()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit verification outcome contract source failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-verification-outcome-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)

  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit verification outcome is not required because outcome contract was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeReadySource(source)) {
    return baseResult({
      status: 'ready',
      reason: 'third-party post-commit verification outcome source accepted a path-free settled outcome contract; real persistent verification reads remain disabled',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeOutcomeSource(source) || !noPersistentReadWriteDrift(source) || !pathFreeOutcomeObject(outcomeObject(source))
      ? [
          commandDiagnostic(
            'third-party.post-commit-verification-outcome-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.post-commit-verification-outcome-source.outcome-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party post-commit verification outcome source requires a future real persistent-read verifier boundary before result continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackPostCommitVerificationOutcomeSource = (
  options: CreateThirdPartyDataPackPostCommitVerificationOutcomeSourceOptions = {}
): (() => Promise<ThirdPartyDataPackPostCommitVerificationOutcomeSourceResult>) => async() => {
  const result = await evaluatePostCommitVerificationOutcomeSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackPostCommitVerificationOutcomeSourceBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackPostCommitVerificationOutcomeSource =
  createThirdPartyDataPackPostCommitVerificationOutcomeSource()
