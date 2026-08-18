import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult
} from './thirdPartyDataPackAtomicTransactionCommitExecutorSource'
import type {
  ThirdPartyDataPackPostCommitVerificationOutcomeKind
} from './thirdPartyDataPackPostCommitVerificationExecutorAdapter'
import type {
  ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
} from './thirdPartyDataPackPostCommitVerificationReadAcknowledgementSource'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherSourceResult
} from './thirdPartyDataPackTransactionCommandDispatcherSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_INSTALL_COMMAND_POST_COMMIT_ACKNOWLEDGEMENT_SOURCE_KIND =
  'third-party-install-command-post-commit-acknowledgement-source'
export const THIRD_PARTY_DATA_PACK_INSTALL_COMMAND_POST_COMMIT_ACKNOWLEDGEMENT_SOURCE_MODE =
  'default-disabled-install-command-post-commit-acknowledgement-source'

export type ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackInstallCommandPostCommitAcknowledgementCheckId =
  | 'transaction-command-dispatched'
  | 'atomic-commit-executed'
  | 'post-commit-acknowledgement-ready'
  | 'install-target-consistent'
  | 'package-summary-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'post-commit-verified'
  | 'contained-effects-intact'

export interface ThirdPartyDataPackInstallCommandPostCommitAcknowledgementCheck {
  readonly id: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackInstallCommandPostCommitAcknowledgementEffectSummary {
  readonly installCommandPostCommitAcknowledgementSourceCalled: boolean
  readonly transactionCommandDispatcherSourceCalled: boolean
  readonly atomicTransactionCommitExecutorSourceCalled: boolean
  readonly postCommitVerificationReadAcknowledgementSourceCalled: boolean
  readonly commandDispatched: boolean
  readonly atomicCommitExecutorAcknowledged: boolean
  readonly postCommitVerificationAcknowledged: boolean
  readonly persistentReadProofAcknowledged: boolean
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
  readonly transactionCommitted: false
  readonly transactionLogPrepared: false
  readonly runtimePublicationCommitted: false
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

export interface ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_INSTALL_COMMAND_POST_COMMIT_ACKNOWLEDGEMENT_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_INSTALL_COMMAND_POST_COMMIT_ACKNOWLEDGEMENT_SOURCE_MODE
  readonly status: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly transactionCommandDispatcherSourceCalled: boolean
  readonly atomicTransactionCommitExecutorSourceCalled: boolean
  readonly postCommitVerificationReadAcknowledgementSourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly transactionCommandDispatcherSourceStatus?:
    ThirdPartyDataPackTransactionCommandDispatcherSourceResult['status']
  readonly atomicTransactionCommitExecutorSourceStatus?:
    ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult['status']
  readonly postCommitVerificationReadAcknowledgementSourceStatus?:
    ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult['status']
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly verificationOutcomeKind?: ThirdPartyDataPackPostCommitVerificationOutcomeKind
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
  readonly checks: readonly ThirdPartyDataPackInstallCommandPostCommitAcknowledgementCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementEffectSummary
}

export interface CreateThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceOptions {
  readonly enabled?: boolean
  readonly readTransactionCommandDispatcherSource?: () =>
    Awaitable<ThirdPartyDataPackTransactionCommandDispatcherSourceResult>
  readonly readAtomicTransactionCommitExecutorSource?: () =>
    Awaitable<ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult>
  readonly readPostCommitVerificationReadAcknowledgementSource?: () =>
    Awaitable<ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult>
}

export class ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError extends Error {
  readonly result: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult

  constructor(result: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult) {
    super('third-party install command post-commit acknowledgement blocked command continuation')
    this.name = 'ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError'
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
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'programDirectoryPath',
  'appDataDirectory',
  'contentUri',
  'fileUri',
  'packageWriter',
  'packageFileWriter',
  'packageBackupWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'recoveryLogStorage',
  'electronHost',
  'webHost',
  'androidHost',
  'window',
  'document',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

const commandAllowedEffectFields = new Set<string>([
  'transactionCommandDispatcherSourceCalled',
  'transactionCommandDispatcherHandoffSourceCalled',
  'appBootstrapContinuationAllowed',
  'commandDispatcherCalled',
  'commandDispatched'
])

const atomicAllowedEffectFields = new Set<string>([
  'atomicTransactionCommitExecutorSourceCalled',
  'atomicTransactionCommitExecutorAdapterSourceCalled',
  'injectedAtomicCommitAdapterExecuted',
  'injectedCommitHostCalled',
  'atomicCommitExecutorHostCalled',
  'atomicCommitExecutorHostAccepted',
  'commitOutcomeReceived',
  'commitOutcomeNormalized',
  'committedOutcomeReceived',
  'failedOutcomeReceived',
  'retryOutcomeReceived',
  'rollbackOutcomeReceived'
])

const acknowledgementAllowedEffectFields = new Set<string>([
  'postCommitVerificationReadAcknowledgementSourceCalled',
  'postCommitVerificationExecutorSourceCalled',
  'postCommitPersistentVerificationReadSourceCalled',
  'postCommitVerificationExecutorAccepted',
  'persistentVerificationReadAccepted',
  'verifiedOutcomeAcknowledged',
  'persistentReadProofAcknowledged',
  'appBootstrapContinuationAllowed',
  'commandContinuationAllowed',
  'uiIpcResultContinuationAllowed'
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
): ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSafeDiagnostic => {
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
      ?? 'third-party.install-command-post-commit-acknowledgement-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSafeDiagnostic[] = []
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
): ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSafeDiagnostic => Object.freeze({
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

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const pathFreeSource = (
  source: object | undefined
): boolean => source !== undefined && forbiddenSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const effectsContainOnlyAllowedTrueFields = (
  source: object | undefined,
  allowedTrueFields: Set<string>
): boolean => {
  const effects = readOwnDataField(source, 'effects')
  if (effects === undefined || effects === null || typeof effects !== 'object') return false

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
    if (!('value' in descriptor) || typeof descriptor.value !== 'boolean') return false
    return descriptor.value === false || (typeof key === 'string' && allowedTrueFields.has(key))
  })
}

const candidateIdentitiesConsistent = (
  commandSource: ThirdPartyDataPackTransactionCommandDispatcherSourceResult,
  commitSource: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult,
  acknowledgementSource: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
): boolean => {
  const commandIdentity = cloneCandidateIdentity(readOwnDataField(commandSource, 'candidateIdentity'))
  const commitIdentity = cloneCandidateIdentity(readOwnDataField(commitSource, 'candidateIdentity'))
  const acknowledgementIdentity = cloneCandidateIdentity(readOwnDataField(acknowledgementSource, 'candidateIdentity'))
  return commandIdentity !== undefined
    && commitIdentity !== undefined
    && acknowledgementIdentity !== undefined
    && commandIdentity.candidateHash === commitIdentity.candidateHash
    && commandIdentity.candidateHash === acknowledgementIdentity.candidateHash
    && commandIdentity.contentHash === commitIdentity.contentHash
    && commandIdentity.contentHash === acknowledgementIdentity.contentHash
    && commandIdentity.snapshotHash === commitIdentity.snapshotHash
    && commandIdentity.snapshotHash === acknowledgementIdentity.snapshotHash
}

const lockfileHashesConsistent = (
  commandSource: ThirdPartyDataPackTransactionCommandDispatcherSourceResult,
  commitSource: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult,
  acknowledgementSource: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
): boolean => readOwnStringField(commandSource, 'lockfileHash') !== undefined
  && readOwnStringField(commandSource, 'lockfileHash') === readOwnStringField(commitSource, 'lockfileHash')
  && readOwnStringField(commandSource, 'lockfileHash') === readOwnStringField(acknowledgementSource, 'lockfileHash')

const targetConsistent = (
  commandSource: ThirdPartyDataPackTransactionCommandDispatcherSourceResult,
  commitSource: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult,
  acknowledgementSource: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
): boolean => {
  const targetPackageId = readOwnStringField(commandSource, 'targetPackageId')
  return readOwnStringField(commandSource, 'requestedCommandId') === 'install'
    && readOwnStringField(commitSource, 'requestedCommandId') === 'install'
    && readOwnStringField(acknowledgementSource, 'requestedCommandId') === 'install'
    && targetPackageId !== undefined
    && targetPackageId === readOwnStringField(commitSource, 'targetPackageId')
    && targetPackageId === readOwnStringField(acknowledgementSource, 'targetPackageId')
    && clonePackageIds(readOwnDataField(commandSource, 'selectedPackageIds')).includes(targetPackageId as PackageId)
    && clonePackageIds(readOwnDataField(commitSource, 'selectedPackageIds')).includes(targetPackageId as PackageId)
    && clonePackageIds(readOwnDataField(acknowledgementSource, 'selectedPackageIds')).includes(targetPackageId as PackageId)
}

const packageSummaryConsistent = (
  commandSource: ThirdPartyDataPackTransactionCommandDispatcherSourceResult,
  commitSource: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult,
  acknowledgementSource: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
): boolean => arraysEqual(
  clonePackageIds(readOwnDataField(commandSource, 'selectedPackageIds')),
  clonePackageIds(readOwnDataField(commitSource, 'selectedPackageIds'))
) && arraysEqual(
  clonePackageIds(readOwnDataField(commandSource, 'selectedPackageIds')),
  clonePackageIds(readOwnDataField(acknowledgementSource, 'selectedPackageIds'))
) && arraysEqual(
  clonePackageIds(readOwnDataField(commandSource, 'blockedPackageIds')),
  clonePackageIds(readOwnDataField(commitSource, 'blockedPackageIds'))
) && arraysEqual(
  clonePackageIds(readOwnDataField(commandSource, 'blockedPackageIds')),
  clonePackageIds(readOwnDataField(acknowledgementSource, 'blockedPackageIds'))
) && arraysEqual(
  clonePackageIds(readOwnDataField(commandSource, 'loadOrder')),
  clonePackageIds(readOwnDataField(commitSource, 'loadOrder'))
) && arraysEqual(
  clonePackageIds(readOwnDataField(commandSource, 'loadOrder')),
  clonePackageIds(readOwnDataField(acknowledgementSource, 'loadOrder'))
) && readOwnNumberField(commandSource, 'registryCount') === readOwnNumberField(commitSource, 'registryCount')
  && readOwnNumberField(commandSource, 'registryCount') === readOwnNumberField(acknowledgementSource, 'registryCount')
  && readOwnNumberField(commandSource, 'entryCount') === readOwnNumberField(commitSource, 'entryCount')
  && readOwnNumberField(commandSource, 'entryCount') === readOwnNumberField(acknowledgementSource, 'entryCount')
  && readOwnNumberField(commandSource, 'packageCount') === readOwnNumberField(commitSource, 'packageCount')
  && readOwnNumberField(commandSource, 'packageCount') === readOwnNumberField(acknowledgementSource, 'packageCount')

const containedEffectsIntact = (
  commandSource: ThirdPartyDataPackTransactionCommandDispatcherSourceResult,
  commitSource: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult,
  acknowledgementSource: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
): boolean => pathFreeSource(commandSource)
  && pathFreeSource(commitSource)
  && pathFreeSource(acknowledgementSource)
  && effectsContainOnlyAllowedTrueFields(commandSource, commandAllowedEffectFields)
  && effectsContainOnlyAllowedTrueFields(commitSource, atomicAllowedEffectFields)
  && effectsContainOnlyAllowedTrueFields(acknowledgementSource, acknowledgementAllowedEffectFields)

const check = (
  id: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementCheckId,
  status: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementCheck['status'],
  reason: string
): ThirdPartyDataPackInstallCommandPostCommitAcknowledgementCheck => Object.freeze({ id, status, reason })

const terminalChecks = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackInstallCommandPostCommitAcknowledgementCheck[] => Object.freeze([
  'transaction-command-dispatched',
  'atomic-commit-executed',
  'post-commit-acknowledgement-ready',
  'install-target-consistent',
  'package-summary-consistent',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'post-commit-verified',
  'contained-effects-intact'
].map(id => check(id as ThirdPartyDataPackInstallCommandPostCommitAcknowledgementCheckId, status, reason)))

const buildChecks = (
  commandSource: ThirdPartyDataPackTransactionCommandDispatcherSourceResult,
  commitSource: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult,
  acknowledgementSource: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
): readonly ThirdPartyDataPackInstallCommandPostCommitAcknowledgementCheck[] => Object.freeze([
  check(
    'transaction-command-dispatched',
    commandSource.status === 'dispatched' ? 'satisfied' : 'blocked',
    'Install command lifecycle acknowledgement starts only after an injected dispatcher accepts the command.'
  ),
  check(
    'atomic-commit-executed',
    commitSource.status === 'executed' ? 'satisfied' : 'blocked',
    'Install command lifecycle acknowledgement needs an accepted atomic commit executor source.'
  ),
  check(
    'post-commit-acknowledgement-ready',
    acknowledgementSource.status === 'ready' ? 'satisfied' : 'blocked',
    'Install command lifecycle acknowledgement needs a ready post-commit read acknowledgement source.'
  ),
  check(
    'install-target-consistent',
    targetConsistent(commandSource, commitSource, acknowledgementSource) ? 'satisfied' : 'blocked',
    'Command dispatch, atomic commit and post-commit acknowledgement must describe the same install target.'
  ),
  check(
    'package-summary-consistent',
    packageSummaryConsistent(commandSource, commitSource, acknowledgementSource) ? 'satisfied' : 'blocked',
    'Command dispatch, atomic commit and post-commit acknowledgement must agree on package lists and totals.'
  ),
  check(
    'candidate-identity-consistent',
    candidateIdentitiesConsistent(commandSource, commitSource, acknowledgementSource) ? 'satisfied' : 'blocked',
    'Command dispatch, atomic commit and post-commit acknowledgement must preserve the same candidate identity.'
  ),
  check(
    'lockfile-hash-consistent',
    lockfileHashesConsistent(commandSource, commitSource, acknowledgementSource) ? 'satisfied' : 'blocked',
    'Command dispatch, atomic commit and post-commit acknowledgement must preserve the same lockfile hash.'
  ),
  check(
    'post-commit-verified',
    acknowledgementSource.verificationOutcomeKind === 'verified'
      && acknowledgementSource.transactionLogMatched === true
      && acknowledgementSource.packageStateMatched === true
      && acknowledgementSource.settingsLockfileMatched === true
      && acknowledgementSource.liveRegistryMatched === true
      && acknowledgementSource.saveCacheIsolated === true
      ? 'satisfied'
      : 'blocked',
    'The post-commit acknowledgement must be a verified success continuation.'
  ),
  check(
    'contained-effects-intact',
    containedEffectsIntact(commandSource, commitSource, acknowledgementSource) ? 'satisfied' : 'blocked',
    'Lifecycle acknowledgement must not carry real read, write, runtime, UI/IPC, rollback or host-path effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackInstallCommandPostCommitAcknowledgementCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.install-command-post-commit-acknowledgement-source.checks.${currentCheck.id}`,
    packageId
  )))

const mergeDiagnostics = (
  commandSource?: ThirdPartyDataPackTransactionCommandDispatcherSourceResult,
  commitSource?: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult,
  acknowledgementSource?: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
): readonly ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSafeDiagnostic[] => Object.freeze([
  ...safeDiagnostics(readOwnDataField(commandSource, 'diagnostics') as readonly unknown[] | undefined),
  ...safeDiagnostics(readOwnDataField(commitSource, 'diagnostics') as readonly unknown[] | undefined),
  ...safeDiagnostics(readOwnDataField(acknowledgementSource, 'diagnostics') as readonly unknown[] | undefined)
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

const createEffectSummary = (
  status: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceStatus,
  commandSource?: ThirdPartyDataPackTransactionCommandDispatcherSourceResult,
  commitSource?: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult,
  acknowledgementSource?: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
): ThirdPartyDataPackInstallCommandPostCommitAcknowledgementEffectSummary => {
  const ready = status === 'ready'
  const continuationAllowed = status !== 'blocked'
  return Object.freeze({
    installCommandPostCommitAcknowledgementSourceCalled: true,
    transactionCommandDispatcherSourceCalled: commandSource !== undefined,
    atomicTransactionCommitExecutorSourceCalled: commitSource !== undefined,
    postCommitVerificationReadAcknowledgementSourceCalled: acknowledgementSource !== undefined,
    commandDispatched: readOwnStringField(commandSource, 'status') === 'dispatched',
    atomicCommitExecutorAcknowledged: readOwnStringField(commitSource, 'status') === 'executed',
    postCommitVerificationAcknowledged: readOwnStringField(acknowledgementSource, 'status') === 'ready',
    persistentReadProofAcknowledged:
      readOwnBooleanField(readOwnDataField(acknowledgementSource, 'effects') as object | undefined, 'persistentReadProofAcknowledged') === true,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
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
    transactionCommitted: false,
    transactionLogPrepared: false,
    runtimePublicationCommitted: false,
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
}

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly commandSource?: ThirdPartyDataPackTransactionCommandDispatcherSourceResult
    readonly commitSource?: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult
    readonly acknowledgementSource?: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
    readonly checks?: readonly ThirdPartyDataPackInstallCommandPostCommitAcknowledgementCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSafeDiagnostic[]
  }
): ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult => {
  const source = options.commandSource ?? options.commitSource ?? options.acknowledgementSource
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const continuationAllowed = options.status !== 'blocked'
  const ready = options.status === 'ready'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_INSTALL_COMMAND_POST_COMMIT_ACKNOWLEDGEMENT_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_INSTALL_COMMAND_POST_COMMIT_ACKNOWLEDGEMENT_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    transactionCommandDispatcherSourceCalled: options.commandSource !== undefined,
    atomicTransactionCommitExecutorSourceCalled: options.commitSource !== undefined,
    postCommitVerificationReadAcknowledgementSourceCalled: options.acknowledgementSource !== undefined,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
    transactionCommandDispatcherSourceStatus: readOwnStringField(options.commandSource, 'status') as
      | ThirdPartyDataPackTransactionCommandDispatcherSourceResult['status']
      | undefined,
    atomicTransactionCommitExecutorSourceStatus: readOwnStringField(options.commitSource, 'status') as
      | ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult['status']
      | undefined,
    postCommitVerificationReadAcknowledgementSourceStatus: readOwnStringField(options.acknowledgementSource, 'status') as
      | ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult['status']
      | undefined,
    requestedCommandId: readOwnStringField(source, 'requestedCommandId') === 'install' ? 'install' as const : undefined,
    targetPackageId: readOwnStringField(source, 'targetPackageId') as PackageId | undefined,
    verificationOutcomeKind: readOwnStringField(options.acknowledgementSource, 'verificationOutcomeKind') as
      | ThirdPartyDataPackPostCommitVerificationOutcomeKind
      | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(options.acknowledgementSource, 'blockedCandidateCount')
      ?? readOwnNumberField(options.commitSource, 'blockedCandidateCount')
      ?? 0,
    blockedCandidatePaths: cloneStringList(readOwnDataField(options.acknowledgementSource, 'blockedCandidatePaths')),
    loadOrder,
    registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(source, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')),
    lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash | undefined,
    checks: options.checks ?? terminalChecks(
      options.status === 'blocked' ? 'blocked' : 'skipped',
      options.reason
    ),
    diagnostics,
    effects: createEffectSummary(
      options.status,
      options.commandSource,
      options.commitSource,
      options.acknowledgementSource
    )
  })
}

const safeSkippedCommandSource = (
  source: ThirdPartyDataPackTransactionCommandDispatcherSourceResult
): boolean => source.status === 'skipped'
  && source.appBootstrapContinuationAllowed === true
  && source.commandContinuationAllowed === false
  && pathFreeSource(source)
  && effectsContainOnlyAllowedTrueFields(source, commandAllowedEffectFields)

const evaluateInstallCommandPostCommitAcknowledgementSource = async(
  options: CreateThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceOptions
): Promise<ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party install command post-commit acknowledgement source is disabled by default',
      enabled: false
    })
  }

  if (options.readTransactionCommandDispatcherSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install command post-commit acknowledgement source is enabled without a command dispatcher source',
      enabled: true,
      diagnostics: [
        commandDiagnostic('third-party.install-command-post-commit-acknowledgement-source.missing-command-source')
      ]
    })
  }

  let commandSource: ThirdPartyDataPackTransactionCommandDispatcherSourceResult
  try {
    commandSource = await options.readTransactionCommandDispatcherSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction command dispatcher source failed before post-commit acknowledgement',
      enabled: true,
      diagnostics: [
        commandDiagnostic('third-party.install-command-post-commit-acknowledgement-source.command-source-failed')
      ]
    })
  }

  const commandDiagnostics = mergeDiagnostics(commandSource)
  if (safeSkippedCommandSource(commandSource)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party install command post-commit acknowledgement is not required because command dispatch was skipped',
      enabled: true,
      commandSource,
      diagnostics: commandDiagnostics,
      checks: terminalChecks('skipped', 'command dispatch source was skipped')
    })
  }

  if (commandSource.status !== 'dispatched') {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install command post-commit acknowledgement requires a dispatched command source',
      enabled: true,
      commandSource,
      diagnostics: [
        ...commandDiagnostics,
        commandDiagnostic(
          'third-party.install-command-post-commit-acknowledgement-source.command-source-blocked',
          commandSource.targetPackageId
        )
      ]
    })
  }

  if (options.readAtomicTransactionCommitExecutorSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install command post-commit acknowledgement source is enabled without an atomic commit source',
      enabled: true,
      commandSource,
      diagnostics: [
        ...commandDiagnostics,
        commandDiagnostic(
          'third-party.install-command-post-commit-acknowledgement-source.missing-commit-source',
          commandSource.targetPackageId
        )
      ]
    })
  }

  let commitSource: ThirdPartyDataPackAtomicTransactionCommitExecutorSourceResult
  try {
    commitSource = await options.readAtomicTransactionCommitExecutorSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party atomic transaction commit source failed before post-commit acknowledgement',
      enabled: true,
      commandSource,
      diagnostics: [
        ...commandDiagnostics,
        commandDiagnostic(
          'third-party.install-command-post-commit-acknowledgement-source.commit-source-failed',
          commandSource.targetPackageId
        )
      ]
    })
  }

  const commandCommitDiagnostics = mergeDiagnostics(commandSource, commitSource)
  if (commitSource.status !== 'executed') {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install command post-commit acknowledgement requires an executed atomic commit source',
      enabled: true,
      commandSource,
      commitSource,
      diagnostics: [
        ...commandCommitDiagnostics,
        commandDiagnostic(
          'third-party.install-command-post-commit-acknowledgement-source.commit-source-blocked',
          commandSource.targetPackageId
        )
      ]
    })
  }

  if (options.readPostCommitVerificationReadAcknowledgementSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install command post-commit acknowledgement source is enabled without a post-commit acknowledgement source',
      enabled: true,
      commandSource,
      commitSource,
      diagnostics: [
        ...commandCommitDiagnostics,
        commandDiagnostic(
          'third-party.install-command-post-commit-acknowledgement-source.missing-post-commit-acknowledgement-source',
          commandSource.targetPackageId
        )
      ]
    })
  }

  let acknowledgementSource: ThirdPartyDataPackPostCommitVerificationReadAcknowledgementSourceResult
  try {
    acknowledgementSource = await options.readPostCommitVerificationReadAcknowledgementSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit verification read acknowledgement source failed before lifecycle acknowledgement',
      enabled: true,
      commandSource,
      commitSource,
      diagnostics: [
        ...commandCommitDiagnostics,
        commandDiagnostic(
          'third-party.install-command-post-commit-acknowledgement-source.post-commit-acknowledgement-source-failed',
          commandSource.targetPackageId
        )
      ]
    })
  }

  const diagnostics = mergeDiagnostics(commandSource, commitSource, acknowledgementSource)
  const checks = buildChecks(commandSource, commitSource, acknowledgementSource)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, commandSource.targetPackageId)

  if (blockedDiagnostics.length === 0) {
    return baseResult({
      status: 'ready',
      reason: 'third-party install command post-commit acknowledgement accepted matching dispatch, commit and verified persistent-read proof',
      enabled: true,
      commandSource,
      commitSource,
      acknowledgementSource,
      diagnostics,
      checks
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'third-party install command post-commit acknowledgement requires matching dispatch, atomic commit and verified persistent-read proof before command continuation',
    enabled: true,
    commandSource,
    commitSource,
    acknowledgementSource,
    diagnostics: [
      ...diagnostics,
      ...blockedDiagnostics,
      commandDiagnostic(
        'third-party.install-command-post-commit-acknowledgement-source.acknowledgement-blocked',
        commandSource.targetPackageId
      )
    ],
    checks
  })
}

export const createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource = (
  options: CreateThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceOptions = {}
): (() => Promise<ThirdPartyDataPackInstallCommandPostCommitAcknowledgementSourceResult>) => async() => {
  const result = await evaluateInstallCommandPostCommitAcknowledgementSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackInstallCommandPostCommitAcknowledgementBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackInstallCommandPostCommitAcknowledgementSource =
  createThirdPartyDataPackInstallCommandPostCommitAcknowledgementSource()
