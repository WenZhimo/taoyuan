import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitPersistentReadsProofs,
  ThirdPartyDataPackPostCommitPersistentReadsSourceResult
} from './thirdPartyDataPackPostCommitPersistentReadsSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_VERIFICATION_READ_SOURCE_KIND =
  'third-party-post-commit-persistent-verification-read-source'
export const THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_VERIFICATION_READ_SOURCE_MODE =
  'default-disabled-post-commit-persistent-verification-read-source'

export type ThirdPartyDataPackPostCommitPersistentVerificationReadSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackPostCommitPersistentVerificationReadCheckId =
  | 'persistent-reads-ready'
  | 'install-target-present'
  | 'candidate-identity-present'
  | 'lockfile-hash-present'
  | 'transaction-log-committed'
  | 'package-state-matched'
  | 'settings-state-matched'
  | 'mod-lock-state-matched'
  | 'live-registry-matched'
  | 'save-cache-isolated'
  | 'no-real-read-effects-intact'

export interface ThirdPartyDataPackPostCommitPersistentVerificationReadCheck {
  readonly id: ThirdPartyDataPackPostCommitPersistentVerificationReadCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitPersistentVerificationReadSourceSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackPostCommitPersistentVerificationReadSourceEffectSummary {
  readonly postCommitPersistentVerificationReadSourceCalled: boolean
  readonly postCommitPersistentReadsSourceCalled: boolean
  readonly persistentReadsSourceAccepted: boolean
  readonly persistentVerificationReadProofAccepted: boolean
  readonly realPostCommitPersistentVerificationReadHostCalled: false
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
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

export interface ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_VERIFICATION_READ_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_VERIFICATION_READ_SOURCE_MODE
  readonly status: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly postCommitPersistentReadsSourceStatus?: ThirdPartyDataPackPostCommitPersistentReadsSourceResult['status']
  readonly postCommitPersistentReadsHostStatus?: ThirdPartyDataPackPostCommitPersistentReadsSourceResult['postCommitPersistentReadsHostStatus']
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly persistentReadProofs?: ThirdPartyDataPackPostCommitPersistentReadsProofs
  readonly persistentVerificationReadChecks: readonly ThirdPartyDataPackPostCommitPersistentVerificationReadCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitPersistentVerificationReadSourceSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceEffectSummary
}

export interface CreateThirdPartyDataPackPostCommitPersistentVerificationReadSourceOptions {
  readonly enabled?: boolean
  readonly readPostCommitPersistentReadsSource?: () => Awaitable<ThirdPartyDataPackPostCommitPersistentReadsSourceResult>
}

export class ThirdPartyDataPackPostCommitPersistentVerificationReadSourceBlockedError extends Error {
  readonly result: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult

  constructor(result: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult) {
    super('third-party post-commit persistent verification read source blocked command continuation')
    this.name = 'ThirdPartyDataPackPostCommitPersistentVerificationReadSourceBlockedError'
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

const allowedPersistentReadsEffectFields = new Set<string>([
  'postCommitPersistentReadsSourceCalled',
  'settingsLockfileCommitSourceCalled',
  'settingsLockfileCommitHostAccepted',
  'injectedPostCommitPersistentReadsHostCalled',
  'postCommitPersistentReadsHostCalled',
  'postCommitPersistentReadsHostAccepted',
  'persistentReadProofAccepted',
  'realPostCommitPersistentReadsHostCalled',
  'appBootstrapContinuationAllowed',
  'commandContinuationAllowed'
])

const forbiddenVerificationReadSourceFields = [
  'postCommitPersistentVerificationReadHost',
  'persistentVerificationReadHost',
  'verificationReadHost',
  'persistentReadsHost',
  'persistentReadHost',
  'transactionLogReader',
  'packageStateReader',
  'settingsReader',
  'lockfileReader',
  'modLockReader',
  'liveRegistryReader',
  'saveCacheReader',
  'packageWriter',
  'packageFileWriter',
  'packageBackupWriter',
  'packageRestoreAdapter',
  'settingsWriter',
  'lockfileWriter',
  'modLockWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'settingsStorage',
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

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackPostCommitPersistentVerificationReadSourceSafeDiagnostic => {
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
      ?? 'third-party.post-commit-persistent-verification-read-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackPostCommitPersistentVerificationReadSourceSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceSafeDiagnostic[] = []
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
): ThirdPartyDataPackPostCommitPersistentVerificationReadSourceSafeDiagnostic => Object.freeze({
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

const effectGraphContainsOnlyPersistentReadSummary = (
  effects: object | undefined
): boolean => {
  if (effects === undefined) return false
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(effects)
  } catch {
    return false
  }
  return keys.every(key => {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(effects, key)
    } catch {
      return false
    }
    if (descriptor?.enumerable !== true) return true
    if (!('value' in descriptor)) return false
    if (allowedPersistentReadsEffectFields.has(String(key))) {
      return typeof descriptor.value === 'boolean'
    }
    return descriptor.value === false
  })
}

const noRealReadOrWriteDrift = (
  source: ThirdPartyDataPackPostCommitPersistentReadsSourceResult
): boolean => readOwnBooleanField(source, 'readOnly') === true
  && readOwnBooleanField(source, 'appBootstrapContinuationAllowed') === true
  && readOwnBooleanField(source, 'commandContinuationAllowed') === true
  && effectGraphContainsOnlyPersistentReadSummary(readOwnDataField(source, 'effects') as object | undefined)

const pathFreeVerificationReadSource = (
  source: ThirdPartyDataPackPostCommitPersistentReadsSourceResult
): boolean => forbiddenVerificationReadSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const safeSkippedSource = (
  source: ThirdPartyDataPackPostCommitPersistentReadsSourceResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noRealReadOrWriteDrift(source)
  && pathFreeVerificationReadSource(source)

const arraysInclude = (
  values: readonly string[],
  expected: string | undefined
): boolean => expected !== undefined && values.includes(expected)

const safeReadySource = (
  source: ThirdPartyDataPackPostCommitPersistentReadsSourceResult
): boolean => {
  const proofs = clonePersistentReadProofs(readOwnDataField(source, 'persistentReadProofs'))
  return readOwnStringField(source, 'status') === 'ready'
    && readOwnStringField(source, 'postCommitPersistentReadsHostStatus') === 'accepted'
    && readOwnStringField(source, 'requestedCommandId') === 'install'
    && arraysInclude(
      clonePackageIds(readOwnDataField(source, 'selectedPackageIds')),
      readOwnStringField(source, 'targetPackageId')
    )
    && cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined
    && readOwnStringField(source, 'lockfileHash') !== undefined
    && persistentReadProofsReady(proofs)
    && noRealReadOrWriteDrift(source)
    && pathFreeVerificationReadSource(source)
}

const check = (
  id: ThirdPartyDataPackPostCommitPersistentVerificationReadCheckId,
  status: ThirdPartyDataPackPostCommitPersistentVerificationReadCheck['status'],
  reason: string
): ThirdPartyDataPackPostCommitPersistentVerificationReadCheck => Object.freeze({ id, status, reason })

const terminalChecks = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackPostCommitPersistentVerificationReadCheck[] => Object.freeze([
  'persistent-reads-ready',
  'install-target-present',
  'candidate-identity-present',
  'lockfile-hash-present',
  'transaction-log-committed',
  'package-state-matched',
  'settings-state-matched',
  'mod-lock-state-matched',
  'live-registry-matched',
  'save-cache-isolated',
  'no-real-read-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackPostCommitPersistentVerificationReadCheckId,
  status,
  reason
)))

const buildChecks = (
  source: ThirdPartyDataPackPostCommitPersistentReadsSourceResult
): readonly ThirdPartyDataPackPostCommitPersistentVerificationReadCheck[] => {
  const proofs = clonePersistentReadProofs(readOwnDataField(source, 'persistentReadProofs'))
  const targetPackageId = readOwnStringField(source, 'targetPackageId')
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))

  return Object.freeze([
    check(
      'persistent-reads-ready',
      readOwnStringField(source, 'status') === 'ready'
        && readOwnStringField(source, 'postCommitPersistentReadsHostStatus') === 'accepted'
        ? 'satisfied'
        : 'blocked',
      'Persistent reads source must expose a path-free accepted proof before verification read continuation.'
    ),
    check(
      'install-target-present',
      readOwnStringField(source, 'requestedCommandId') === 'install'
        && arraysInclude(selectedPackageIds, targetPackageId)
        ? 'satisfied'
        : 'blocked',
      'Verification reads are only defined for a selected install target.'
    ),
    check(
      'candidate-identity-present',
      cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined ? 'satisfied' : 'blocked',
      'Verification reads need the candidate identity that persistent state must prove.'
    ),
    check(
      'lockfile-hash-present',
      readOwnStringField(source, 'lockfileHash') !== undefined ? 'satisfied' : 'blocked',
      'Verification reads need the lockfile hash that settings and mod-lock state must prove.'
    ),
    check(
      'transaction-log-committed',
      proofs?.transactionLogCommitted === true ? 'satisfied' : 'blocked',
      'Verification reads require committed transaction-log proof.'
    ),
    check(
      'package-state-matched',
      proofs?.packageStateMatched === true ? 'satisfied' : 'blocked',
      'Verification reads require committed package state to match the candidate identity.'
    ),
    check(
      'settings-state-matched',
      proofs?.settingsStateMatched === true ? 'satisfied' : 'blocked',
      'Verification reads require settings state to match the selected package set.'
    ),
    check(
      'mod-lock-state-matched',
      proofs?.modLockStateMatched === true ? 'satisfied' : 'blocked',
      'Verification reads require mod-lock state to match the lockfile hash.'
    ),
    check(
      'live-registry-matched',
      proofs?.liveRegistryMatched === true ? 'satisfied' : 'blocked',
      'Verification reads require live registry identity to match the candidate identity.'
    ),
    check(
      'save-cache-isolated',
      proofs?.saveCacheIsolated === true ? 'satisfied' : 'blocked',
      'Verification reads require player saves and official cache isolation proof.'
    ),
    check(
      'no-real-read-effects-intact',
      noRealReadOrWriteDrift(source) && pathFreeVerificationReadSource(source) ? 'satisfied' : 'blocked',
      'Verification read source must not carry real read, write, runtime, UI/IPC or host effects.'
    )
  ])
}

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackPostCommitPersistentVerificationReadCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackPostCommitPersistentVerificationReadSourceSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.post-commit-persistent-verification-read-source.checks.${currentCheck.id}`,
    packageId
  )))

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
  continuationAllowed: boolean,
  proofAccepted: boolean,
  source?: ThirdPartyDataPackPostCommitPersistentReadsSourceResult
): ThirdPartyDataPackPostCommitPersistentVerificationReadSourceEffectSummary => Object.freeze({
  postCommitPersistentVerificationReadSourceCalled: true,
  postCommitPersistentReadsSourceCalled: sourceCalled,
  persistentReadsSourceAccepted: readOwnStringField(source, 'status') === 'ready',
  persistentVerificationReadProofAccepted: proofAccepted,
  realPostCommitPersistentVerificationReadHostCalled: false,
  appBootstrapContinuationAllowed: continuationAllowed,
  commandContinuationAllowed: continuationAllowed,
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
    readonly status: ThirdPartyDataPackPostCommitPersistentVerificationReadSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackPostCommitPersistentReadsSourceResult
    readonly checks?: readonly ThirdPartyDataPackPostCommitPersistentVerificationReadCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackPostCommitPersistentVerificationReadSourceSafeDiagnostic[]
  }
): ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const proofs = clonePersistentReadProofs(readOwnDataField(options.source, 'persistentReadProofs'))
  const continuationAllowed = options.status !== 'blocked'
  const proofAccepted = options.status === 'ready'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_VERIFICATION_READ_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_POST_COMMIT_PERSISTENT_VERIFICATION_READ_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
    postCommitPersistentReadsSourceStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackPostCommitPersistentReadsSourceResult['status']
      | undefined,
    postCommitPersistentReadsHostStatus: readOwnStringField(options.source, 'postCommitPersistentReadsHostStatus') as
      | ThirdPartyDataPackPostCommitPersistentReadsSourceResult['postCommitPersistentReadsHostStatus']
      | undefined,
    requestedCommandId: readOwnStringField(options.source, 'requestedCommandId') === 'install'
      ? 'install' as const
      : undefined,
    targetPackageId: readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidatePaths,
    loadOrder,
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(options.source, 'candidateIdentity')),
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    ...(proofs === undefined ? {} : { persistentReadProofs: proofs }),
    persistentVerificationReadChecks: options.checks ?? terminalChecks(
      options.status === 'blocked' ? 'blocked' : 'skipped',
      options.reason
    ),
    diagnostics,
    effects: effectSummary(options.sourceCalled, continuationAllowed, proofAccepted, options.source)
  })
}

const evaluatePostCommitPersistentVerificationReadSource = async(
  options: CreateThirdPartyDataPackPostCommitPersistentVerificationReadSourceOptions
): Promise<ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit persistent verification read source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readPostCommitPersistentReadsSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit persistent verification read source is enabled without a persistent reads source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-persistent-verification-read-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackPostCommitPersistentReadsSourceResult
  try {
    source = await options.readPostCommitPersistentReadsSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit persistent reads source failed before returning a safe verification-read input',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-persistent-verification-read-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit persistent verification read is not required because persistent reads were skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics,
      checks: terminalChecks('skipped', 'persistent reads source was skipped')
    })
  }

  const checks = buildChecks(source)
  if (safeReadySource(source)) {
    return baseResult({
      status: 'ready',
      reason: 'third-party post-commit persistent verification read source accepted path-free persistent read proofs',
      enabled: true,
      sourceCalled: true,
      source,
      checks,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeVerificationReadSource(source) || !noRealReadOrWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.post-commit-persistent-verification-read-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    ...diagnosticsForBlockedChecks(checks, targetPackageId),
    commandDiagnostic(
      'third-party.post-commit-persistent-verification-read-source.verification-read-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party post-commit persistent verification read source requires complete path-free persistent read proofs before command continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    checks,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackPostCommitPersistentVerificationReadSource = (
  options: CreateThirdPartyDataPackPostCommitPersistentVerificationReadSourceOptions = {}
): (() => Promise<ThirdPartyDataPackPostCommitPersistentVerificationReadSourceResult>) => async() => {
  const result = await evaluatePostCommitPersistentVerificationReadSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackPostCommitPersistentVerificationReadSourceBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackPostCommitPersistentVerificationReadSource =
  createThirdPartyDataPackPostCommitPersistentVerificationReadSource()
