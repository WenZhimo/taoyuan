import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
} from './thirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource'
import type {
  ThirdPartyDataPackRollbackRecoveryExecutionSourceResult
} from './thirdPartyDataPackRollbackRecoveryExecutionSource'
type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_MOD_LOCK_TRANSACTION_SEMANTICS_SOURCE_KIND =
  'third-party-mod-lock-transaction-semantics-source'
export const THIRD_PARTY_DATA_PACK_MOD_LOCK_TRANSACTION_SEMANTICS_SOURCE_MODE =
  'default-disabled-mod-lock-transaction-semantics-source'

export type ThirdPartyDataPackModLockTransactionSemanticsSourceStatus =
  | 'candidate-stable'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackModLockTransactionSemanticsOutcomeKind =
  | 'success'
  | 'failure'
  | 'retry'
  | 'rollback'

export interface ThirdPartyDataPackModLockTransactionSemanticsSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackModLockTransactionSemanticsCheck {
  readonly id:
    | 'terminal-source-present'
    | 'install-target-present'
    | 'candidate-hash-present'
    | 'lockfile-hash-present'
    | 'terminal-continuation-allowed'
    | 'public-api-freeze-deferred'
    | 'schema-set-unchanged'
    | 'contained-effects-intact'
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackModLockTransactionSemanticsEffectSummary {
  readonly modLockTransactionSemanticsSourceCalled: boolean
  readonly postCommitUiIpcDeliveryContinuationSourceCalled: boolean
  readonly rollbackRecoveryExecutionSourceCalled: boolean
  readonly terminalSemanticsCandidateStable: boolean
  readonly publicModLockSchemaFrozen: false
  readonly publicTransactionApiFrozen: false
  readonly publicApiReleaseAllowed: false
  readonly publicSchemaSetHashChanged: false
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly modManagementUiMounted: false
  readonly launcherAppMounted: false
  readonly gameAppCreated: false
  readonly piniaCreated: false
  readonly routerMounted: false
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
  readonly saveRead: false
  readonly saveCacheIsolationChecked: false
  readonly successEnvelopeDelivered: boolean
  readonly failureEnvelopeDelivered: boolean
  readonly retryStateDelivered: boolean
  readonly rollbackStateDelivered: boolean
  readonly uiIpcResponseDelivered: boolean
  readonly rollbackRecoverySettled: boolean
  readonly rollbackRecoveryExecutionAcknowledged: boolean
  readonly realRecoveryLogReplayRestoreCalled: boolean
  readonly packageFilesWritten: boolean
  readonly packageBackupsWritten: boolean
  readonly packageFilesRestored: boolean
  readonly lockfileWritten: boolean
  readonly lockfileRestored: false
  readonly settingsWritten: boolean
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: boolean
  readonly recoveryLogReplayed: boolean
  readonly rollbackExecuted: boolean
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackModLockTransactionSemanticsSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_MOD_LOCK_TRANSACTION_SEMANTICS_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_MOD_LOCK_TRANSACTION_SEMANTICS_SOURCE_MODE
  readonly status: ThirdPartyDataPackModLockTransactionSemanticsSourceStatus
  readonly reason: string
  readonly readOnly: boolean
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly postCommitUiIpcDeliveryContinuationStatus?:
    ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult['status']
  readonly rollbackRecoveryExecutionStatus?:
    ThirdPartyDataPackRollbackRecoveryExecutionSourceResult['status']
  readonly semanticsVersion: 1
  readonly stability: 'internal-candidate'
  readonly publicModLockSchemaFrozen: false
  readonly publicTransactionApiFrozen: false
  readonly publicApiReleaseAllowed: false
  readonly publicSchemaSetHashChanged: false
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly outcomeKind?: ThirdPartyDataPackModLockTransactionSemanticsOutcomeKind
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly messageKey?: string
  readonly recovery: ModDiagnosticRecovery
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly startupGateContinuationAllowed: boolean
  readonly persistentPackageWriteAcknowledged: boolean
  readonly persistentSettingsLockfileWriteAcknowledged: boolean
  readonly uiIpcDeliveryAcknowledged: boolean
  readonly rollbackRecoverySettled: boolean
  readonly rollbackRecoveryExecutionAcknowledged: boolean
  readonly checks: readonly ThirdPartyDataPackModLockTransactionSemanticsCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackModLockTransactionSemanticsSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackModLockTransactionSemanticsEffectSummary
}

export interface CreateThirdPartyDataPackModLockTransactionSemanticsSourceOptions {
  readonly enabled?: boolean
  readonly readPostCommitUiIpcDeliveryContinuationSource?: () =>
    Awaitable<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult>
  readonly readRollbackRecoveryExecutionSource?: () =>
    Awaitable<ThirdPartyDataPackRollbackRecoveryExecutionSourceResult>
}

export class ThirdPartyDataPackModLockTransactionSemanticsBlockedError extends Error {
  readonly result: ThirdPartyDataPackModLockTransactionSemanticsSourceResult

  constructor(result: ThirdPartyDataPackModLockTransactionSemanticsSourceResult) {
    super('third-party mod-lock transaction semantics source blocked')
    this.name = 'ThirdPartyDataPackModLockTransactionSemanticsBlockedError'
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

const forbiddenFields = [
  'postCommitUiIpcDeliveryContinuationSource',
  'rollbackRecoveryExecutionSource',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'publicJsonSchema',
  'schemaWriter',
  'schemaSetWriter',
  'apiPublisher',
  'modLockStorage',
  'transactionLogStorage',
  'packageWriter',
  'settingsWriter',
  'lockfileWriter',
  'saveWriter',
  'cacheWriter',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'appDataDirectory',
  'contentUri',
  'fileUri',
  'window',
  'document',
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

const readOwnDataField = (
  value: unknown,
  fieldName: string
): unknown => {
  if (value === null || typeof value !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: unknown,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnBooleanField = (
  value: unknown,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readOwnNumberField = (
  value: unknown,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isSafeInteger(field) && field >= 0 ? field : undefined
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

const clonePackageIds = (value: unknown): readonly PackageId[] =>
  cloneStringList(value) as unknown as readonly PackageId[]

const cloneCandidateIdentity = (
  value: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  const formatVersion = readOwnNumberField(value, 'formatVersion')
  const contentHash = readOwnStringField(value, 'contentHash')
  const snapshotHash = readOwnStringField(value, 'snapshotHash')
  const candidateHash = readOwnStringField(value, 'candidateHash')
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

const safeRecovery = (
  value: unknown
): ModDiagnosticRecovery =>
  diagnosticRecoveries.has(value as ModDiagnosticRecovery)
    ? value as ModDiagnosticRecovery
    : 'none'

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

const hasForbiddenField = (value: unknown): boolean => {
  if (value === null || typeof value !== 'object') return false
  return forbiddenFields.some(fieldName => hasOwnEnumerableField(value, fieldName))
}

const safeDiagnostic = (
  diagnostic: unknown
): ThirdPartyDataPackModLockTransactionSemanticsSafeDiagnostic | undefined => {
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  if (!diagnosticSeverities.has(severity as ModDiagnosticSeverity)) return undefined
  if (!diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)) return undefined

  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: severity as ModDiagnosticSeverity,
    stage: readOwnStringField(diagnostic, 'stage')
      ?? 'third-party.mod-lock-transaction-semantics-source.diagnostic-copy',
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? 'mods.error.lifecycle.transaction.001',
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined,
    recovery: recovery as ModDiagnosticRecovery
  })
}

const safeDiagnostics = (
  diagnostics: readonly unknown[] | undefined
): readonly ThirdPartyDataPackModLockTransactionSemanticsSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackModLockTransactionSemanticsSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    const copied = safeDiagnostic(readOwnDataField(diagnostics, String(index)))
    if (copied) result.push(copied)
  }
  return Object.freeze(result)
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackModLockTransactionSemanticsSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const outcomeKindForPostCommit = (
  source: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
): ThirdPartyDataPackModLockTransactionSemanticsOutcomeKind | undefined => {
  const kind = source.envelopeKind
  return kind === 'success' || kind === 'failure' || kind === 'retry' || kind === 'rollback'
    ? kind
    : undefined
}

const outcomeKindForRollback = (
  source: ThirdPartyDataPackRollbackRecoveryExecutionSourceResult
): ThirdPartyDataPackModLockTransactionSemanticsOutcomeKind | undefined => {
  if (source.outcomeKind === 'committed') return 'success'
  if (source.outcomeKind === 'failed') return 'failure'
  if (source.outcomeKind === 'retry') return 'retry'
  if (source.outcomeKind === 'rollback') return 'rollback'
  return undefined
}

const containedPostCommitEffects = (
  source: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
): boolean => source.status === 'ready'
  && source.commandContinuationAllowed === true
  && source.uiIpcResultContinuationAllowed === true
  && source.startupGateContinuationAllowed === true
  && source.uiIpcDeliveryAcknowledged === true
  && readOwnBooleanField(source.effects, 'transactionCommitted') === false
  && readOwnBooleanField(source.effects, 'runtimePublicationCommitted') === false
  && readOwnBooleanField(source.effects, 'postCommitVerificationExecuted') === false
  && readOwnBooleanField(source.effects, 'transactionLogRead') === false
  && readOwnBooleanField(source.effects, 'packageStateRead') === false
  && readOwnBooleanField(source.effects, 'settingsRead') === false
  && readOwnBooleanField(source.effects, 'lockfileRead') === false
  && readOwnBooleanField(source.effects, 'liveRegistryRead') === false
  && readOwnBooleanField(source.effects, 'saveRead') === false
  && readOwnBooleanField(source.effects, 'saveCacheIsolationChecked') === false
  && readOwnBooleanField(source.effects, 'savesWritten') === false
  && readOwnBooleanField(source.effects, 'cacheWritten') === false
  && readOwnBooleanField(source.effects, 'transactionLogWritten') === false
  && readOwnBooleanField(source.effects, 'rollbackExecuted') === false
  && hasForbiddenField(source) === false

const containedRollbackEffects = (
  source: ThirdPartyDataPackRollbackRecoveryExecutionSourceResult
): boolean => {
  const realRecovery = readOwnBooleanField(source.effects, 'realRecoveryLogReplayRestoreCalled') ?? false
  const packageFilesRestored = readOwnBooleanField(source.effects, 'packageFilesRestored') ?? false
  const recoveryLogRead = readOwnBooleanField(source.effects, 'recoveryLogRead') ?? false
  const recoveryLogReplayed = readOwnBooleanField(source.effects, 'recoveryLogReplayed') ?? false
  const rollbackExecuted = readOwnBooleanField(source.effects, 'rollbackExecuted') ?? false
  const recoveryEffectsContained = realRecovery
    ? recoveryLogRead === true
      && recoveryLogReplayed === true
      && packageFilesRestored === rollbackExecuted
    : packageFilesRestored === false
      && recoveryLogRead === false
      && recoveryLogReplayed === false
      && rollbackExecuted === false
  const rollbackRestoreContained =
    (packageFilesRestored === false && rollbackExecuted === false)
    || (
      packageFilesRestored === true
      && rollbackExecuted === true
      && source.status === 'executed'
      && source.outcomeKind === 'rollback'
      && source.recovery === 'restore-backup'
      && source.rollbackRequired === true
      && source.rollbackRecoveryExecutionAcknowledged === true
    )

  return (source.status === 'executed' || (source.status === 'skipped' && source.outcomeKind === 'committed'))
    && source.commandContinuationAllowed === true
    && source.uiIpcResultContinuationAllowed === true
    && readOwnBooleanField(source.effects, 'transactionCommitted') === false
    && readOwnBooleanField(source.effects, 'transactionLogPrepared') === false
    && readOwnBooleanField(source.effects, 'runtimePublicationCommitted') === false
    && readOwnBooleanField(source.effects, 'postCommitVerificationExecuted') === false
    && readOwnBooleanField(source.effects, 'uiIpcResponseDelivered') === false
    && readOwnBooleanField(source.effects, 'packageFilesWritten') === false
    && rollbackRestoreContained
    && readOwnBooleanField(source.effects, 'lockfileWritten') === false
    && readOwnBooleanField(source.effects, 'lockfileRestored') === false
    && readOwnBooleanField(source.effects, 'settingsWritten') === false
    && readOwnBooleanField(source.effects, 'settingsRestored') === false
    && readOwnBooleanField(source.effects, 'savesWritten') === false
    && readOwnBooleanField(source.effects, 'cacheWritten') === false
    && readOwnBooleanField(source.effects, 'transactionLogWritten') === false
    && recoveryEffectsContained
    && hasForbiddenField(source) === false
}

const sourceCandidateHash = (
  source: unknown
): Sha256Hash | undefined => readOwnStringField(source, 'candidateHash') as Sha256Hash | undefined
  ?? cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))?.candidateHash

const check = (
  id: ThirdPartyDataPackModLockTransactionSemanticsCheck['id'],
  status: ThirdPartyDataPackModLockTransactionSemanticsCheck['status'],
  reason: string
): ThirdPartyDataPackModLockTransactionSemanticsCheck => Object.freeze({ id, status, reason })

const terminalChecks = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackModLockTransactionSemanticsCheck[] => Object.freeze([
  'terminal-source-present',
  'install-target-present',
  'candidate-hash-present',
  'lockfile-hash-present',
  'terminal-continuation-allowed',
  'public-api-freeze-deferred',
  'schema-set-unchanged',
  'contained-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackModLockTransactionSemanticsCheck['id'],
  status,
  reason
)))

const buildChecks = (
  terminalSource: unknown,
  effectsContained: boolean
): readonly ThirdPartyDataPackModLockTransactionSemanticsCheck[] => Object.freeze([
  check(
    'terminal-source-present',
    terminalSource === undefined ? 'blocked' : 'satisfied',
    'Mod-lock transaction semantics require one terminal success or rollback/recovery source.'
  ),
  check(
    'install-target-present',
    readOwnStringField(terminalSource, 'requestedCommandId') === 'install'
      && readOwnStringField(terminalSource, 'targetPackageId') !== undefined
      ? 'satisfied'
      : 'blocked',
    'The current semantics boundary only covers an explicit install command target.'
  ),
  check(
    'candidate-hash-present',
    sourceCandidateHash(terminalSource) !== undefined ? 'satisfied' : 'blocked',
    'Candidate identity hash must be available before future mod-lock semantics can be frozen.'
  ),
  check(
    'lockfile-hash-present',
    readOwnStringField(terminalSource, 'lockfileHash') !== undefined ? 'satisfied' : 'blocked',
    'Lockfile hash must be available before future mod-lock semantics can be frozen.'
  ),
  check(
    'terminal-continuation-allowed',
    readOwnBooleanField(terminalSource, 'commandContinuationAllowed') === true
      && readOwnBooleanField(terminalSource, 'uiIpcResultContinuationAllowed') === true
      ? 'satisfied'
      : 'blocked',
    'Terminal transaction semantics can only summarize sources that already allow command and UI/IPC continuation.'
  ),
  check(
    'public-api-freeze-deferred',
    'satisfied',
    'This boundary records internal candidate semantics only; public mod-lock/API freeze remains a later explicit release step.'
  ),
  check(
    'schema-set-unchanged',
    'satisfied',
    'This boundary does not add mod-lock to public JSON Schema output and must not change schemaSetHash.'
  ),
  check(
    'contained-effects-intact',
    effectsContained ? 'satisfied' : 'blocked',
    'Terminal semantics may summarize only contained upstream acknowledgements without adding real writes, reads, runtime publication or public API effects.'
  )
])

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
  options: {
    readonly status: ThirdPartyDataPackModLockTransactionSemanticsSourceStatus
    readonly postCommitCalled: boolean
    readonly rollbackCalled: boolean
    readonly terminalSource?: unknown
    readonly outcomeKind?: ThirdPartyDataPackModLockTransactionSemanticsOutcomeKind
  }
): ThirdPartyDataPackModLockTransactionSemanticsEffectSummary => {
  const stable = options.status === 'candidate-stable'
  const effects = readOwnDataField(options.terminalSource, 'effects')
  return Object.freeze({
    modLockTransactionSemanticsSourceCalled: true,
    postCommitUiIpcDeliveryContinuationSourceCalled: options.postCommitCalled,
    rollbackRecoveryExecutionSourceCalled: options.rollbackCalled,
    terminalSemanticsCandidateStable: stable,
    publicModLockSchemaFrozen: false,
    publicTransactionApiFrozen: false,
    publicApiReleaseAllowed: false,
    publicSchemaSetHashChanged: false,
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    liveRegistrySwapped: false,
    previousRegistryReleased: false,
    previousRegistryRestored: false,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: false,
    modManagementUiMounted: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    piniaCreated: false,
    routerMounted: false,
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
    saveRead: false,
    saveCacheIsolationChecked: false,
    successEnvelopeDelivered: stable && options.outcomeKind === 'success',
    failureEnvelopeDelivered: stable && options.outcomeKind === 'failure',
    retryStateDelivered: stable && options.outcomeKind === 'retry',
    rollbackStateDelivered: stable && options.outcomeKind === 'rollback',
    uiIpcResponseDelivered: readOwnBooleanField(effects, 'uiIpcResponseDelivered') ?? false,
    rollbackRecoverySettled: readOwnBooleanField(options.terminalSource, 'rollbackRecoverySettled') ?? false,
    rollbackRecoveryExecutionAcknowledged:
      readOwnBooleanField(options.terminalSource, 'rollbackRecoveryExecutionAcknowledged') ?? false,
    realRecoveryLogReplayRestoreCalled: stable
      && options.outcomeKind === 'rollback'
      && readOwnBooleanField(effects, 'realRecoveryLogReplayRestoreCalled') === true,
    packageFilesWritten: readOwnBooleanField(effects, 'packageFilesWritten') ?? false,
    packageBackupsWritten: readOwnBooleanField(effects, 'packageBackupsWritten') ?? false,
    packageFilesRestored: stable
      && options.outcomeKind === 'rollback'
      && readOwnBooleanField(effects, 'packageFilesRestored') === true,
    lockfileWritten: readOwnBooleanField(effects, 'lockfileWritten') ?? false,
    lockfileRestored: false,
    settingsWritten: readOwnBooleanField(effects, 'settingsWritten') ?? false,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    recoveryLogRead: stable
      && options.outcomeKind === 'rollback'
      && readOwnBooleanField(effects, 'recoveryLogRead') === true,
    recoveryLogReplayed: stable
      && options.outcomeKind === 'rollback'
      && readOwnBooleanField(effects, 'recoveryLogReplayed') === true,
    rollbackExecuted: stable
      && options.outcomeKind === 'rollback'
      && readOwnBooleanField(effects, 'rollbackExecuted') === true,
    diagnosticsWritten: false
  })
}

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackModLockTransactionSemanticsSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly postCommitCalled?: boolean
    readonly rollbackCalled?: boolean
    readonly postCommit?:
      ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult
    readonly rollback?:
      ThirdPartyDataPackRollbackRecoveryExecutionSourceResult
    readonly terminalSource?: unknown
    readonly outcomeKind?: ThirdPartyDataPackModLockTransactionSemanticsOutcomeKind
    readonly checks?: readonly ThirdPartyDataPackModLockTransactionSemanticsCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackModLockTransactionSemanticsSafeDiagnostic[]
  }
): ThirdPartyDataPackModLockTransactionSemanticsSourceResult => {
  const terminalSource = options.terminalSource
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(terminalSource, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(terminalSource, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(terminalSource, 'loadOrder'))
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(terminalSource, 'candidateIdentity'))
  const candidateHash = sourceCandidateHash(terminalSource)
  const ready = options.status === 'candidate-stable'
  const postCommitWriteAcknowledged =
    readOwnBooleanField(terminalSource, 'persistentPackageWriteExecuted') === true
    || readOwnBooleanField(terminalSource, 'persistentSettingsLockfileWriteExecuted') === true

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_MOD_LOCK_TRANSACTION_SEMANTICS_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_MOD_LOCK_TRANSACTION_SEMANTICS_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: !postCommitWriteAcknowledged,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    postCommitUiIpcDeliveryContinuationStatus: options.postCommit?.status,
    rollbackRecoveryExecutionStatus: options.rollback?.status,
    semanticsVersion: 1,
    stability: 'internal-candidate',
    publicModLockSchemaFrozen: false,
    publicTransactionApiFrozen: false,
    publicApiReleaseAllowed: false,
    publicSchemaSetHashChanged: false,
    requestedCommandId: readOwnStringField(terminalSource, 'requestedCommandId') === 'install'
      ? 'install' as const
      : undefined,
    targetPackageId: readOwnStringField(terminalSource, 'targetPackageId') as PackageId | undefined,
    outcomeKind: options.outcomeKind,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(terminalSource, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(terminalSource, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(terminalSource, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(terminalSource, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity,
    candidateHash,
    lockfileHash: readOwnStringField(terminalSource, 'lockfileHash') as Sha256Hash | undefined,
    messageKey: readOwnStringField(terminalSource, 'messageKey'),
    recovery: safeRecovery(readOwnDataField(terminalSource, 'recovery')),
    retryable: readOwnBooleanField(terminalSource, 'retryable') ?? false,
    rollbackRequired: readOwnBooleanField(terminalSource, 'rollbackRequired') ?? false,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
    startupGateContinuationAllowed:
      readOwnBooleanField(terminalSource, 'startupGateContinuationAllowed') === true && ready,
    persistentPackageWriteAcknowledged: postCommitWriteAcknowledged,
    persistentSettingsLockfileWriteAcknowledged:
      readOwnBooleanField(terminalSource, 'persistentSettingsLockfileWriteExecuted') === true,
    uiIpcDeliveryAcknowledged:
      readOwnBooleanField(terminalSource, 'uiIpcDeliveryAcknowledged') === true && ready,
    rollbackRecoverySettled: readOwnBooleanField(terminalSource, 'rollbackRecoverySettled') ?? false,
    rollbackRecoveryExecutionAcknowledged:
      readOwnBooleanField(terminalSource, 'rollbackRecoveryExecutionAcknowledged') ?? false,
    checks: options.checks ?? terminalChecks(
      options.status === 'blocked' ? 'blocked' : 'skipped',
      options.reason
    ),
    diagnostics,
    effects: effectSummary({
      status: options.status,
      postCommitCalled: options.postCommitCalled ?? false,
      rollbackCalled: options.rollbackCalled ?? false,
      terminalSource,
      outcomeKind: options.outcomeKind
    })
  })
}

const diagnosticsFrom = (
  source: unknown
): readonly ThirdPartyDataPackModLockTransactionSemanticsSafeDiagnostic[] =>
  safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)

const stableResultFromPostCommit = (
  postCommit: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult,
  rollbackCalled: boolean
): ThirdPartyDataPackModLockTransactionSemanticsSourceResult => {
  const outcomeKind = outcomeKindForPostCommit(postCommit)
  const effectsContained = containedPostCommitEffects(postCommit)
  const checks = buildChecks(postCommit, effectsContained && outcomeKind !== undefined)
  const blockedChecks = checks.filter(currentCheck => currentCheck.status === 'blocked')
  if (blockedChecks.length === 0) {
    return baseResult({
      status: 'candidate-stable',
      reason: 'third-party mod-lock transaction semantics accepted a post-commit UI/IPC terminal acknowledgement as an internal candidate',
      enabled: true,
      sourceCalled: true,
      postCommitCalled: true,
      rollbackCalled,
      postCommit,
      terminalSource: postCommit,
      outcomeKind,
      checks,
      diagnostics: diagnosticsFrom(postCommit)
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'third-party mod-lock transaction semantics requires a stable post-commit terminal acknowledgement',
    enabled: true,
    sourceCalled: true,
    postCommitCalled: true,
    rollbackCalled,
    postCommit,
    terminalSource: postCommit,
    outcomeKind,
    checks,
    diagnostics: [
      ...diagnosticsFrom(postCommit),
      ...blockedChecks.map(currentCheck => commandDiagnostic(
        `third-party.mod-lock-transaction-semantics-source.checks.${currentCheck.id}`,
        postCommit.targetPackageId
      )),
      commandDiagnostic(
        'third-party.mod-lock-transaction-semantics-source.terminal-blocked',
        postCommit.targetPackageId
      )
    ]
  })
}

const stableResultFromRollback = (
  rollback: ThirdPartyDataPackRollbackRecoveryExecutionSourceResult,
  postCommitCalled: boolean
): ThirdPartyDataPackModLockTransactionSemanticsSourceResult => {
  const outcomeKind = outcomeKindForRollback(rollback)
  const effectsContained = containedRollbackEffects(rollback)
  const checks = buildChecks(rollback, effectsContained && outcomeKind !== undefined)
  const blockedChecks = checks.filter(currentCheck => currentCheck.status === 'blocked')
  if (blockedChecks.length === 0) {
    return baseResult({
      status: 'candidate-stable',
      reason: 'third-party mod-lock transaction semantics accepted a rollback recovery terminal acknowledgement as an internal candidate',
      enabled: true,
      sourceCalled: true,
      postCommitCalled,
      rollbackCalled: true,
      rollback,
      terminalSource: rollback,
      outcomeKind,
      checks,
      diagnostics: diagnosticsFrom(rollback)
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'third-party mod-lock transaction semantics requires a stable rollback recovery terminal acknowledgement',
    enabled: true,
    sourceCalled: true,
    postCommitCalled,
    rollbackCalled: true,
    rollback,
    terminalSource: rollback,
    outcomeKind,
    checks,
    diagnostics: [
      ...diagnosticsFrom(rollback),
      ...blockedChecks.map(currentCheck => commandDiagnostic(
        `third-party.mod-lock-transaction-semantics-source.checks.${currentCheck.id}`,
        rollback.targetPackageId
      )),
      commandDiagnostic(
        'third-party.mod-lock-transaction-semantics-source.terminal-blocked',
        rollback.targetPackageId
      )
    ]
  })
}

const evaluateModLockTransactionSemanticsSource = async(
  options: CreateThirdPartyDataPackModLockTransactionSemanticsSourceOptions
): Promise<ThirdPartyDataPackModLockTransactionSemanticsSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party mod-lock transaction semantics source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (
    options.readPostCommitUiIpcDeliveryContinuationSource === undefined
    && options.readRollbackRecoveryExecutionSource === undefined
  ) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party mod-lock transaction semantics source is enabled without a terminal source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.mod-lock-transaction-semantics-source.missing-terminal-source')
      ]
    })
  }

  let postCommit: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult | undefined
  if (options.readPostCommitUiIpcDeliveryContinuationSource !== undefined) {
    try {
      postCommit = await options.readPostCommitUiIpcDeliveryContinuationSource()
    } catch {
      return baseResult({
        status: 'blocked',
        reason: 'third-party post-commit UI/IPC continuation source failed before transaction semantics',
        enabled: true,
        sourceCalled: true,
        postCommitCalled: true,
        diagnostics: [
          commandDiagnostic('third-party.mod-lock-transaction-semantics-source.post-commit-source-failed')
        ]
      })
    }

    if (postCommit.status === 'ready') return stableResultFromPostCommit(postCommit, false)
    if (postCommit.status !== 'skipped' || options.readRollbackRecoveryExecutionSource === undefined) {
      return stableResultFromPostCommit(postCommit, false)
    }
  }

  if (options.readRollbackRecoveryExecutionSource === undefined) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party mod-lock transaction semantics found no terminal install source after a skipped post-commit path',
      enabled: true,
      sourceCalled: true,
      postCommitCalled: postCommit !== undefined,
      postCommit,
      diagnostics: diagnosticsFrom(postCommit)
    })
  }

  let rollback: ThirdPartyDataPackRollbackRecoveryExecutionSourceResult
  try {
    rollback = await options.readRollbackRecoveryExecutionSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party rollback recovery execution source failed before transaction semantics',
      enabled: true,
      sourceCalled: true,
      postCommitCalled: postCommit !== undefined,
      rollbackCalled: true,
      postCommit,
      diagnostics: [
        ...diagnosticsFrom(postCommit),
        commandDiagnostic('third-party.mod-lock-transaction-semantics-source.rollback-source-failed')
      ]
    })
  }

  return stableResultFromRollback(rollback, postCommit !== undefined)
}

export const createThirdPartyDataPackModLockTransactionSemanticsSource = (
  options: CreateThirdPartyDataPackModLockTransactionSemanticsSourceOptions = {}
): (() => Promise<ThirdPartyDataPackModLockTransactionSemanticsSourceResult>) => async() => {
  const result = await evaluateModLockTransactionSemanticsSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackModLockTransactionSemanticsBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackModLockTransactionSemanticsSource =
  createThirdPartyDataPackModLockTransactionSemanticsSource()
