import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitPersistentReadsProofs
} from './thirdPartyDataPackPostCommitPersistentReadsSource'
import type {
  ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult,
  ThirdPartyDataPackPostCommitPersistentVerificationReadSourceSafeDiagnostic
} from './thirdPartyDataPackPostCommitPersistentVerificationReadSource'
import type {
  ThirdPartyDataPackPostCommitVerificationExecutorSourceResult
} from './thirdPartyDataPackPostCommitVerificationExecutorSource'
import type {
  ThirdPartyDataPackPostCommitVerificationOutcomeKind,
  ThirdPartyDataPackPostCommitVerificationSafeDiagnostic,
  ThirdPartyDataPackPostCommitVerificationSummary
} from './thirdPartyDataPackPostCommitVerificationExecutorAdapter'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_READ_ACKNOWLEDGEMENT_SOURCE_KIND =
  'third-party-post-commit-verification-read-acknowledgement-source'
export const THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_READ_ACKNOWLEDGEMENT_SOURCE_MODE =
  'default-disabled-post-commit-verification-read-acknowledgement-source'

export type ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPostCommitVerificationReadAcknowledgementCheckId =
  | 'executor-source-executed'
  | 'persistent-verification-read-ready'
  | 'install-target-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'verified-outcome-only'
  | 'verified-state-signals-consistent'
  | 'persistent-read-proofs-consistent'
  | 'no-real-effects-intact'

export interface ThirdPartyDataPackPostCommitVerificationReadAcknowledgementCheck {
  readonly id: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceEffectSummary {
  readonly postCommitVerificationReadAcknowledgementSourceCalled: boolean
  readonly postCommitVerificationExecutorSourceCalled: boolean
  readonly postCommitPersistentVerificationReadSourceCalled: boolean
  readonly postCommitVerificationExecutorAccepted: boolean
  readonly persistentVerificationReadAccepted: boolean
  readonly verifiedOutcomeAcknowledged: boolean
  readonly persistentReadProofAcknowledged: boolean
  readonly realPostCommitVerificationAcknowledgementHostCalled: false
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
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
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecutorCalled: false
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly transactionLogRead: false
  readonly packageStateRead: false
  readonly settingsRead: false
  readonly lockfileRead: false
  readonly liveRegistryRead: false
  readonly saveCacheIsolationChecked: false
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

export interface ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_READ_ACKNOWLEDGEMENT_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_READ_ACKNOWLEDGEMENT_SOURCE_MODE
  readonly status: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly executorSourceCalled: boolean
  readonly persistentVerificationReadSourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly postCommitVerificationExecutorSourceStatus?: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult['status']
  readonly postCommitPersistentVerificationReadSourceStatus?: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult['status']
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly verificationOutcomeKind?: ThirdPartyDataPackPostCommitVerificationOutcomeKind
  readonly transactionLogMatched: boolean
  readonly packageStateMatched: boolean
  readonly settingsLockfileMatched: boolean
  readonly liveRegistryMatched: boolean
  readonly saveCacheIsolated: boolean
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly persistentReadProofs?: ThirdPartyDataPackPostCommitPersistentReadsProofs
  readonly checks: readonly ThirdPartyDataPackPostCommitVerificationReadAcknowledgementCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackPostCommitVerificationSummary
  readonly effects: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceEffectSummary
}

export interface CreateThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceOptions {
  readonly enabled?: boolean
  readonly readPostCommitVerificationExecutorSource?: () => Awaitable<ThirdPartyDataPackPostCommitVerificationExecutorSourceResult>
  readonly readPostCommitPersistentVerificationReadSource?: () => Awaitable<ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult>
}

export class ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError extends Error {
  readonly result: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult

  constructor(result: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult) {
    super('third-party post-commit verification read acknowledgement source blocked result continuation')
    this.name = 'ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError'
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

const forbiddenSourceFields = [
  'postCommitVerificationReadAcknowledgementHost',
  'acknowledgementHost',
  'postCommitVerificationExecutorSource',
  'postCommitPersistentVerificationReadSource',
  'postCommitVerificationExecutorAdapter',
  'postCommitPersistentReadsSource',
  'verificationRequest',
  'outcome',
  'persistentReadsHost',
  'verificationHost',
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
  'appDataDirectory',
  'contentUri',
  'fileUri',
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'window',
  'document'
] as const

const realEffectFields = [
  'officialRegistryPublished',
  'thirdPartyRegistryPublished',
  'liveRegistryMutated',
  'liveRegistrySwapped',
  'previousRegistryReleased',
  'previousRegistryRestored',
  'candidateRegistryExposed',
  'runtimeEnablementAllowed',
  'modManagementUiMounted',
  'electronIpcExposed',
  'webFilePickerOpened',
  'androidFilePickerOpened',
  'commandDispatcherCalled',
  'commandDispatched',
  'atomicCommitExecutorCalled',
  'transactionCommitted',
  'runtimePublicationCommitted',
  'postCommitVerificationExecuted',
  'uiIpcResponseDelivered',
  'transactionLogRead',
  'packageStateRead',
  'settingsRead',
  'lockfileRead',
  'liveRegistryRead',
  'saveCacheIsolationChecked',
  'packageFilesWritten',
  'packageBackupsWritten',
  'packageFilesRestored',
  'lockfileWritten',
  'lockfileRestored',
  'settingsWritten',
  'settingsRestored',
  'savesWritten',
  'cacheWritten',
  'transactionLogWritten',
  'recoveryLogRead',
  'recoveryLogReplayed',
  'rollbackExecuted',
  'diagnosticsWritten'
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
      ?? 'third-party.post-commit-verification-read-acknowledgement-source.diagnostic-copy',
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

const clonePersistentReadProofs = (
  value: unknown
): ThirdPartyDataPackPostCommitPersistentReadsProofs | undefined => {
  if (value === undefined || value === null || typeof value !== 'object') return undefined
  return Object.freeze({
    transactionLogCommitted: readOwnBooleanField(value, 'transactionLogCommitted') === true,
    packageStateMatched: readOwnBooleanField(value, 'packageStateMatched') === true,
    settingsStateMatched: readOwnBooleanField(value, 'settingsStateMatched') === true,
    modLockStateMatched: readOwnBooleanField(value, 'modLockStateMatched') === true,
    liveRegistryMatched: readOwnBooleanField(value, 'liveRegistryMatched') === true,
    saveCacheIsolated: readOwnBooleanField(value, 'saveCacheIsolated') === true
  })
}

const persistentReadProofsReady = (
  proofs: ThirdPartyDataPackPostCommitPersistentReadsProofs | undefined
): proofs is ThirdPartyDataPackPostCommitPersistentReadsProofs => proofs !== undefined
  && proofs.transactionLogCommitted === true
  && proofs.packageStateMatched === true
  && proofs.settingsStateMatched === true
  && proofs.modLockStateMatched === true
  && proofs.liveRegistryMatched === true
  && proofs.saveCacheIsolated === true

const pathFreeSource = (
  source: object
): boolean => forbiddenSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const noRealEffects = (
  source: object
): boolean => {
  const effects = readOwnDataField(source, 'effects')
  if (effects === undefined || effects === null || typeof effects !== 'object') return false
  return realEffectFields.every(fieldName => readOwnBooleanField(effects, fieldName) !== true)
}

const arraysEqual = (
  left: readonly string[],
  right: readonly string[]
): boolean => left.length === right.length && left.every((value, index) => value === right[index])

const sourceIdentityConsistent = (
  executorSource: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult,
  readSource: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult
): boolean => {
  const executorIdentity = cloneCandidateIdentity(readOwnDataField(executorSource, 'candidateIdentity'))
  const readIdentity = cloneCandidateIdentity(readOwnDataField(readSource, 'candidateIdentity'))
  return executorIdentity !== undefined
    && readIdentity !== undefined
    && executorIdentity.candidateHash === readIdentity.candidateHash
    && executorIdentity.contentHash === readIdentity.contentHash
    && executorIdentity.snapshotHash === readIdentity.snapshotHash
}

const lockfileHashConsistent = (
  executorSource: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult,
  readSource: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult
): boolean => readOwnStringField(executorSource, 'lockfileHash') !== undefined
  && readOwnStringField(executorSource, 'lockfileHash') === readOwnStringField(readSource, 'lockfileHash')

const installTargetConsistent = (
  executorSource: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult,
  readSource: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult
): boolean => {
  const targetPackageId = readOwnStringField(executorSource, 'targetPackageId') as PackageId | undefined
  const executorSelected = clonePackageIds(readOwnDataField(executorSource, 'selectedPackageIds'))
  const readSelected = clonePackageIds(readOwnDataField(readSource, 'selectedPackageIds'))
  return readOwnStringField(executorSource, 'requestedCommandId') === 'install'
    && readOwnStringField(readSource, 'requestedCommandId') === 'install'
    && targetPackageId !== undefined
    && targetPackageId === readOwnStringField(readSource, 'targetPackageId')
    && executorSelected.includes(targetPackageId)
    && readSelected.includes(targetPackageId)
    && arraysEqual(executorSelected, readSelected)
    && arraysEqual(
      clonePackageIds(readOwnDataField(executorSource, 'loadOrder')),
      clonePackageIds(readOwnDataField(readSource, 'loadOrder'))
    )
}

const verifiedOutcomeSignalsReady = (
  executorSource: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult
): boolean => readOwnStringField(executorSource, 'verificationOutcomeKind') === 'verified'
  && readOwnBooleanField(executorSource, 'transactionLogMatched') === true
  && readOwnBooleanField(executorSource, 'packageStateMatched') === true
  && readOwnBooleanField(executorSource, 'settingsLockfileMatched') === true
  && readOwnBooleanField(executorSource, 'liveRegistryMatched') === true
  && readOwnBooleanField(executorSource, 'saveCacheIsolated') === true

const persistentProofsConsistent = (
  executorSource: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult,
  readSource: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult
): boolean => {
  const proofs = clonePersistentReadProofs(readOwnDataField(readSource, 'persistentReadProofs'))
  return persistentReadProofsReady(proofs)
    && readOwnBooleanField(executorSource, 'transactionLogMatched') === proofs.transactionLogCommitted
    && readOwnBooleanField(executorSource, 'packageStateMatched') === proofs.packageStateMatched
    && readOwnBooleanField(executorSource, 'settingsLockfileMatched') === proofs.settingsStateMatched
    && readOwnBooleanField(executorSource, 'liveRegistryMatched') === proofs.liveRegistryMatched
    && readOwnBooleanField(executorSource, 'saveCacheIsolated') === proofs.saveCacheIsolated
}

const check = (
  id: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementCheckId,
  status: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementCheck['status'],
  reason: string
): ThirdPartyDataPackPostCommitVerificationReadAcknowledgementCheck => Object.freeze({ id, status, reason })

const terminalChecks = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackPostCommitVerificationReadAcknowledgementCheck[] => Object.freeze([
  'executor-source-executed',
  'persistent-verification-read-ready',
  'install-target-consistent',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'verified-outcome-only',
  'verified-state-signals-consistent',
  'persistent-read-proofs-consistent',
  'no-real-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackPostCommitVerificationReadAcknowledgementCheckId,
  status,
  reason
)))

const buildChecks = (
  executorSource: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult,
  readSource: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult
): readonly ThirdPartyDataPackPostCommitVerificationReadAcknowledgementCheck[] => Object.freeze([
  check(
    'executor-source-executed',
    readOwnStringField(executorSource, 'status') === 'executed' ? 'satisfied' : 'blocked',
    'Post-commit acknowledgement requires an executed verifier outcome source.'
  ),
  check(
    'persistent-verification-read-ready',
    readOwnStringField(readSource, 'status') === 'ready' ? 'satisfied' : 'blocked',
    'Post-commit acknowledgement requires complete persistent verification read proofs.'
  ),
  check(
    'install-target-consistent',
    installTargetConsistent(executorSource, readSource) ? 'satisfied' : 'blocked',
    'Verifier outcome and persistent read proofs must describe the same selected install command.'
  ),
  check(
    'candidate-identity-consistent',
    sourceIdentityConsistent(executorSource, readSource) ? 'satisfied' : 'blocked',
    'Verifier outcome and persistent read proofs must prove the same candidate identity.'
  ),
  check(
    'lockfile-hash-consistent',
    lockfileHashConsistent(executorSource, readSource) ? 'satisfied' : 'blocked',
    'Verifier outcome and persistent read proofs must prove the same lockfile hash.'
  ),
  check(
    'verified-outcome-only',
    readOwnStringField(executorSource, 'verificationOutcomeKind') === 'verified' ? 'satisfied' : 'blocked',
    'Persistent read acknowledgement is only a success continuation for verified outcomes.'
  ),
  check(
    'verified-state-signals-consistent',
    verifiedOutcomeSignalsReady(executorSource) ? 'satisfied' : 'blocked',
    'Verified outcome must carry all committed-state signals.'
  ),
  check(
    'persistent-read-proofs-consistent',
    persistentProofsConsistent(executorSource, readSource) ? 'satisfied' : 'blocked',
    'Persistent read proofs must match the verified outcome signals.'
  ),
  check(
    'no-real-effects-intact',
    pathFreeSource(executorSource)
      && pathFreeSource(readSource)
      && noRealEffects(executorSource)
      && noRealEffects(readSource)
      ? 'satisfied'
      : 'blocked',
    'Acknowledgement inputs must not carry real host, read, write, runtime, UI/IPC or rollback effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackPostCommitVerificationReadAcknowledgementCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.post-commit-verification-read-acknowledgement-source.checks.${currentCheck.id}`,
    packageId
  )))

const safeSkippedPair = (
  executorSource: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult,
  readSource: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult
): boolean => readOwnStringField(executorSource, 'status') === 'skipped'
  && readOwnStringField(readSource, 'status') === 'skipped'
  && readOwnBooleanField(executorSource, 'commandContinuationAllowed') === true
  && readOwnBooleanField(readSource, 'commandContinuationAllowed') === true
  && pathFreeSource(executorSource)
  && pathFreeSource(readSource)
  && noRealEffects(executorSource)
  && noRealEffects(readSource)

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

const mergeDiagnostics = (
  executorDiagnostics: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] | undefined,
  readDiagnostics: readonly ThirdPartyDataPackPostCommitPersistentVerificationReadSourceSafeDiagnostic[] | undefined
): readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] => Object.freeze([
  ...safeDiagnostics(executorDiagnostics),
  ...safeDiagnostics(readDiagnostics)
])

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

const effectSummary = (
  executorSourceCalled: boolean,
  readSourceCalled: boolean,
  continuationAllowed: boolean,
  ready: boolean
): ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceEffectSummary => Object.freeze({
  postCommitVerificationReadAcknowledgementSourceCalled: true,
  postCommitVerificationExecutorSourceCalled: executorSourceCalled,
  postCommitPersistentVerificationReadSourceCalled: readSourceCalled,
  postCommitVerificationExecutorAccepted: ready,
  persistentVerificationReadAccepted: ready,
  verifiedOutcomeAcknowledged: ready,
  persistentReadProofAcknowledged: ready,
  realPostCommitVerificationAcknowledgementHostCalled: false,
  appBootstrapContinuationAllowed: continuationAllowed,
  commandContinuationAllowed: continuationAllowed,
  uiIpcResultContinuationAllowed: continuationAllowed,
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
  runtimePublicationCommitted: false,
  postCommitVerificationExecutorCalled: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveCacheIsolationChecked: false,
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
    readonly status: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly executorSourceCalled: boolean
    readonly readSourceCalled: boolean
    readonly executorSource?: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult
    readonly readSource?: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult
    readonly checks?: readonly ThirdPartyDataPackPostCommitVerificationReadAcknowledgementCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[]
  }
): ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const executorSource = options.executorSource
  const readSource = options.readSource
  const selectedPackageIds = clonePackageIds(readOwnDataField(executorSource, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(executorSource, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(executorSource, 'loadOrder'))
  const proofs = clonePersistentReadProofs(readOwnDataField(readSource, 'persistentReadProofs'))
  const continuationAllowed = options.status !== 'blocked'
  const ready = options.status === 'ready'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_READ_ACKNOWLEDGEMENT_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_POST_COMMIT_VERIFICATION_READ_ACKNOWLEDGEMENT_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    executorSourceCalled: options.executorSourceCalled,
    persistentVerificationReadSourceCalled: options.readSourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
    uiIpcResultContinuationAllowed: continuationAllowed,
    postCommitVerificationExecutorSourceStatus: readOwnStringField(executorSource, 'status') as
      | ThirdPartyDataPackPostCommitVerificationExecutorSourceResult['status']
      | undefined,
    postCommitPersistentVerificationReadSourceStatus: readOwnStringField(readSource, 'status') as
      | ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult['status']
      | undefined,
    requestedCommandId: readOwnStringField(executorSource, 'requestedCommandId') === 'install' ? 'install' as const : undefined,
    targetPackageId: readOwnStringField(executorSource, 'targetPackageId') as PackageId | undefined,
    verificationOutcomeKind: readOwnStringField(executorSource, 'verificationOutcomeKind') as
      | ThirdPartyDataPackPostCommitVerificationOutcomeKind
      | undefined,
    transactionLogMatched: readOwnBooleanField(executorSource, 'transactionLogMatched') ?? false,
    packageStateMatched: readOwnBooleanField(executorSource, 'packageStateMatched') ?? false,
    settingsLockfileMatched: readOwnBooleanField(executorSource, 'settingsLockfileMatched') ?? false,
    liveRegistryMatched: readOwnBooleanField(executorSource, 'liveRegistryMatched') ?? false,
    saveCacheIsolated: readOwnBooleanField(executorSource, 'saveCacheIsolated') ?? false,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(executorSource, 'blockedCandidateCount') ?? 0,
    blockedCandidatePaths: cloneStringList(readOwnDataField(readSource, 'blockedCandidatePaths')),
    loadOrder,
    registryCount: readOwnNumberField(executorSource, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(executorSource, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(executorSource, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(executorSource, 'candidateIdentity')),
    lockfileHash: readOwnStringField(executorSource, 'lockfileHash') as Sha256Hash | undefined,
    ...(proofs === undefined ? {} : { persistentReadProofs: proofs }),
    checks: options.checks ?? terminalChecks(
      options.status === 'blocked' ? 'blocked' : 'skipped',
      options.reason
    ),
    diagnostics,
    summary: cloneSummary(readOwnDataField(executorSource, 'summary'), diagnostics),
    effects: effectSummary(options.executorSourceCalled, options.readSourceCalled, continuationAllowed, ready)
  })
}

const evaluatePostCommitVerificationReadAcknowledgementSource = async(
  options: CreateThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceOptions
): Promise<ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit verification read acknowledgement source is disabled by default',
      enabled: false,
      executorSourceCalled: false,
      readSourceCalled: false
    })
  }

  if (options.readPostCommitVerificationExecutorSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit verification read acknowledgement source is enabled without an executor source',
      enabled: true,
      executorSourceCalled: false,
      readSourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-verification-read-acknowledgement-source.missing-executor-source')
      ]
    })
  }

  if (options.readPostCommitPersistentVerificationReadSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit verification read acknowledgement source is enabled without a persistent verification-read source',
      enabled: true,
      executorSourceCalled: false,
      readSourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-verification-read-acknowledgement-source.missing-read-source')
      ]
    })
  }

  let executorSource: ThirdPartyDataPackPostCommitVerificationExecutorSourceResult
  try {
    executorSource = await options.readPostCommitVerificationExecutorSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit verification executor source failed before acknowledgement',
      enabled: true,
      executorSourceCalled: true,
      readSourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-verification-read-acknowledgement-source.executor-source-failed')
      ]
    })
  }

  let readSource: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult
  try {
    readSource = await options.readPostCommitPersistentVerificationReadSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit persistent verification-read source failed before acknowledgement',
      enabled: true,
      executorSourceCalled: true,
      readSourceCalled: true,
      executorSource,
      diagnostics: [
        ...safeDiagnostics(readOwnDataField(executorSource, 'diagnostics') as readonly unknown[] | undefined),
        commandDiagnostic('third-party.post-commit-verification-read-acknowledgement-source.read-source-failed')
      ]
    })
  }

  const sourceDiagnostics = mergeDiagnostics(
    readOwnDataField(executorSource, 'diagnostics') as readonly ThirdPartyDataPackPostCommitVerificationSafeDiagnostic[] | undefined,
    readOwnDataField(readSource, 'diagnostics') as readonly ThirdPartyDataPackPostCommitPersistentVerificationReadSourceSafeDiagnostic[] | undefined
  )

  if (safeSkippedPair(executorSource, readSource)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit verification read acknowledgement is not required because both sources were skipped',
      enabled: true,
      executorSourceCalled: true,
      readSourceCalled: true,
      executorSource,
      readSource,
      diagnostics: sourceDiagnostics,
      checks: terminalChecks('skipped', 'both post-commit verification sources were skipped')
    })
  }

  const checks = buildChecks(executorSource, readSource)
  const targetPackageId = readOwnStringField(executorSource, 'targetPackageId') as PackageId | undefined
  const blockedChecks = diagnosticsForBlockedChecks(checks, targetPackageId)

  if (blockedChecks.length === 0) {
    return baseResult({
      status: 'ready',
      reason: 'third-party post-commit verification read acknowledgement accepted matching verified outcome and persistent read proofs',
      enabled: true,
      executorSourceCalled: true,
      readSourceCalled: true,
      executorSource,
      readSource,
      diagnostics: sourceDiagnostics,
      checks
    })
  }

  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeSource(executorSource)
      || !pathFreeSource(readSource)
      || !noRealEffects(executorSource)
      || !noRealEffects(readSource)
      ? [
          commandDiagnostic(
            'third-party.post-commit-verification-read-acknowledgement-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    ...blockedChecks,
    commandDiagnostic(
      'third-party.post-commit-verification-read-acknowledgement-source.acknowledgement-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party post-commit verification read acknowledgement requires matching verified outcome and persistent read proofs before result continuation may proceed',
    enabled: true,
    executorSourceCalled: true,
    readSourceCalled: true,
    executorSource,
    readSource,
    diagnostics: blockedDiagnostics,
    checks
  })
}

export const createThirdPartyDataPackPostCommitVerificationReadAcknowledgementSource = (
  options: CreateThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceOptions = {}
): (() => Promise<ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult>) => async() => {
  const result = await evaluatePostCommitVerificationReadAcknowledgementSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackPostCommitVerificationReadAcknowledgementSource =
  createThirdPartyDataPackPostCommitVerificationReadAcknowledgementSource()
