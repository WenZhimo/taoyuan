import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyCandidateIdentitySummary } from './thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline,
  type CreateThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineOptions,
  type ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult
} from './thirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitPipeline,
  type CreateThirdPartyDataPackRuntimePublicationCommitPipelineOptions
} from './thirdPartyDataPackRuntimePublicationCommitPipeline'
import {
  ThirdPartyDataPackRuntimePublicationCommitBlockedError,
  type ThirdPartyDataPackRuntimePublicationCommitHostStatus,
  type ThirdPartyDataPackRuntimePublicationCommitSourceResult
} from './thirdPartyDataPackRuntimePublicationCommitSource'
import {
  readThirdPartyDataPackEnabledRuntimeCommandId,
  type ThirdPartyDataPackEnabledRuntimeCommandId
} from './thirdPartyDataPackRuntimeCommandState'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_AFTER_POST_COMMIT_VERIFICATION_PIPELINE_KIND =
  'third-party-runtime-publication-commit-after-post-commit-verification-pipeline'
export const THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_AFTER_POST_COMMIT_VERIFICATION_PIPELINE_MODE =
  'default-disabled-runtime-publication-commit-after-post-commit-verification-pipeline'

export type ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineStatus =
  | 'accepted'
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationCheckId =
  | 'post-commit-verification-ready'
  | 'runtime-publication-commit-accepted'
  | 'install-target-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'package-summary-consistent'
  | 'continuation-flags-consistent'
  | 'contained-effects-intact'

export interface ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationCheck {
  readonly id: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationEffectSummary {
  readonly runtimePublicationCommitAfterPostCommitVerificationPipelineCalled: boolean
  readonly postCommitVerificationAfterInstallTransactionCommitPipelineCalled: boolean
  readonly runtimePublicationCommitPipelineCalled: boolean
  readonly runtimePublicationCommitHostAccepted: boolean
  readonly transactionCommitted: boolean
  readonly transactionLogCommitted: boolean
  readonly postCommitVerificationAcknowledged: boolean
  readonly persistentReadProofAcknowledged: boolean
  readonly runtimePublicationCommitAcknowledged: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly realRuntimePublicationCommitCalled: boolean
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
  readonly runtimePublicationCommitted: boolean
  readonly postCommitVerificationExecuted: false
  readonly uiIpcResponseDelivered: false
  readonly transactionLogPrepared: boolean
  readonly transactionLogWritten: boolean
  readonly transactionLogRead: boolean
  readonly packageStateRead: false
  readonly settingsRead: false
  readonly lockfileRead: false
  readonly liveRegistryRead: false
  readonly saveCacheIsolationChecked: false
  readonly packageFilesWritten: boolean
  readonly packageBackupsWritten: boolean
  readonly packageFilesRestored: false
  readonly lockfileWritten: boolean
  readonly lockfileRestored: false
  readonly settingsWritten: boolean
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_AFTER_POST_COMMIT_VERIFICATION_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_AFTER_POST_COMMIT_VERIFICATION_PIPELINE_MODE
  readonly status: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly postCommitVerificationAfterInstallTransactionCommitSourceCalled: boolean
  readonly runtimePublicationCommitSourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly postCommitVerificationAfterInstallTransactionCommitStatus?:
    ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult['status']
  readonly runtimePublicationCommitStatus?: ThirdPartyDataPackRuntimePublicationCommitSourceResult['status']
  readonly runtimePublicationCommitHostStatus?: ThirdPartyDataPackRuntimePublicationCommitHostStatus
  readonly requestedCommandId?: ThirdPartyDataPackEnabledRuntimeCommandId
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly transactionId?: string
  readonly committedTransactionId?: string
  readonly committedTransactionLogEntryHash?: Sha256Hash
  readonly checks: readonly ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationEffectSummary
}

export interface CreateThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineOptions
  extends Omit<CreateThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineOptions, 'enabled'>,
    Omit<CreateThirdPartyDataPackRuntimePublicationCommitPipelineOptions, 'enabled'> {
  readonly enabled?: boolean
  readonly readPostCommitVerificationAfterInstallTransactionCommit?: () =>
    Awaitable<ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult>
  readonly readRuntimePublicationCommit?: () =>
    Awaitable<ThirdPartyDataPackRuntimePublicationCommitSourceResult>
}

const forbiddenPostCommitFields = [
  'installTransactionCommitFinalization',
  'postCommitVerificationReadAcknowledgement',
  'commitFinalizationSource',
  'postCommitAcknowledgementSource',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'programDirectoryPath',
  'transactionLogStorage',
  'storage',
  'electronHost',
  'webHost',
  'androidHost',
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'window',
  'document'
] as const

const forbiddenRuntimeCommitFields = [
  'runtimePublicationCommitAdapter',
  'runtimePublicationPreflight',
  'transactionPreCommitPlan',
  'liveRegistrySwapProtection',
  'publicationRollbackRecovery',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'runtimePublicationCommitHost',
  'runtimePublicationHost',
  'liveRegistry',
  'liveRegistryReference',
  'registrySet',
  'previousRegistry',
  'programDirectoryPath',
  'electronHost',
  'webHost',
  'androidHost',
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'window',
  'document'
] as const

const hasOwnEnumerableField = (value: unknown, fieldName: string): boolean => {
  if (value === null || typeof value !== 'object') return false
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return true
  }
  return descriptor?.enumerable === true
}

const readOwnDataField = (value: unknown, fieldName: string): unknown => {
  if (value === null || typeof value !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (value: unknown, fieldName: string): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnNumberField = (value: unknown, fieldName: string): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

const readOwnBooleanField = (value: unknown, fieldName: string): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

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

const cloneCandidateIdentity = (value: unknown): ThirdPartyCandidateIdentitySummary | undefined => {
  if (value === null || typeof value !== 'object') return undefined
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

const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnosticRecovery>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

const diagnosticCopyFallbackCode = 'LIFECYCLE-TRANSACTION-001'
const fallbackMessageKey = (code: string): string =>
  `mods.error.${code.toLowerCase().replace(/-/g, '.')}`

const safeDiagnostic = (
  diagnostic: unknown,
  fallbackStage: string
): ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationSafeDiagnostic => {
  const code = readOwnStringField(diagnostic, 'code') ?? diagnosticCopyFallbackCode
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readOwnStringField(diagnostic, 'stage') ?? fallbackStage,
    messageKey: readOwnStringField(diagnostic, 'messageKey') ?? fallbackMessageKey(code),
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined,
    recovery: diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)
      ? recovery as ModDiagnosticRecovery
      : 'retry'
  })
}

const safeDiagnostics = (
  diagnostics: unknown,
  fallbackStage: string
): readonly ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor) {
      result.push(safeDiagnostic(descriptor.value, fallbackStage))
    }
  }
  return Object.freeze(result)
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationSafeDiagnostic => Object.freeze({
  code: diagnosticCopyFallbackCode,
  ruleId: diagnosticCopyFallbackCode,
  severity: 'error',
  stage,
  messageKey: fallbackMessageKey(diagnosticCopyFallbackCode),
  packageId,
  recovery: 'retry'
})

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const everyOwnDataBooleanFalseExcept = (
  value: object | undefined,
  allowedTrueKeys: readonly string[]
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
    if (descriptor?.enumerable !== true) return true
    if (!('value' in descriptor) || typeof descriptor.value !== 'boolean') return false
    return allowedTrueKeys.includes(String(key)) ? descriptor.value === true : descriptor.value === false
  })
}

const pathFreePostCommit = (
  postCommit: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult
): boolean => forbiddenPostCommitFields.every(fieldName => !hasOwnEnumerableField(postCommit, fieldName))

const pathFreeRuntimeCommit = (
  runtimeCommit: ThirdPartyDataPackRuntimePublicationCommitSourceResult
): boolean => forbiddenRuntimeCommitFields.every(fieldName => !hasOwnEnumerableField(runtimeCommit, fieldName))

const safeReadyPostCommit = (
  postCommit: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult
): boolean => readOwnStringField(postCommit, 'status') === 'ready'
  && readOwnBooleanField(postCommit, 'appBootstrapContinuationAllowed') === true
  && readOwnBooleanField(postCommit, 'commandContinuationAllowed') === true
  && readOwnBooleanField(postCommit, 'uiIpcResultContinuationAllowed') === true
  && readThirdPartyDataPackEnabledRuntimeCommandId(readOwnStringField(postCommit, 'requestedCommandId')) !== undefined
  && cloneCandidateIdentity(readOwnDataField(postCommit, 'candidateIdentity')) !== undefined
  && readOwnStringField(postCommit, 'lockfileHash') !== undefined
  && readOwnStringField(postCommit, 'committedTransactionId') !== undefined
  && readOwnStringField(postCommit, 'committedTransactionLogEntryHash') !== undefined
  && everyOwnDataBooleanFalseExcept(readOwnDataField(postCommit, 'effects') as object | undefined, [
    'postCommitVerificationAfterInstallTransactionCommitPipelineCalled',
    'installTransactionCommitFinalizationPipelineCalled',
    'postCommitVerificationReadAcknowledgementPipelineCalled',
    'transactionCommitted',
    'transactionLogCommitted',
    'postCommitVerificationAcknowledged',
    'persistentReadProofAcknowledged',
    'appBootstrapContinuationAllowed',
    'commandContinuationAllowed',
    'uiIpcResultContinuationAllowed',
    'transactionLogPrepared',
    'transactionLogWritten',
    'transactionLogRead',
    'packageFilesWritten',
    'packageBackupsWritten',
    'lockfileWritten',
    'settingsWritten'
  ])
  && pathFreePostCommit(postCommit)

const safeAcceptedRuntimeCommit = (
  runtimeCommit: ThirdPartyDataPackRuntimePublicationCommitSourceResult
): boolean => {
  const effects = readOwnDataField(runtimeCommit, 'effects') as object | undefined
  const realRuntimePublicationCommitCalled =
    readOwnBooleanField(effects, 'realRuntimePublicationCommitCalled') === true
  const runtimePublicationCommitted =
    readOwnBooleanField(effects, 'runtimePublicationCommitted') === true
  const optionalRealRuntimePublicationCommitKeys = realRuntimePublicationCommitCalled
    ? [
        'realRuntimePublicationCommitCalled',
        'runtimePublicationCommitted'
      ]
    : []
  return readOwnStringField(runtimeCommit, 'status') === 'accepted'
    && readOwnBooleanField(runtimeCommit, 'appBootstrapContinuationAllowed') === true
    && readOwnBooleanField(runtimeCommit, 'commandContinuationAllowed') === true
    && readOwnStringField(runtimeCommit, 'runtimePublicationCommitHostStatus') === 'accepted'
    && cloneCandidateIdentity(readOwnDataField(runtimeCommit, 'candidateIdentity')) !== undefined
    && readOwnStringField(runtimeCommit, 'lockfileHash') !== undefined
    && realRuntimePublicationCommitCalled === runtimePublicationCommitted
    && everyOwnDataBooleanFalseExcept(effects, [
      'runtimePublicationCommitSourceCalled',
      'runtimePublicationCommitAdapterSourceCalled',
      'injectedRuntimePublicationCommitHostCalled',
      'runtimePublicationCommitHostCalled',
      'runtimePublicationCommitHostAccepted',
      'appBootstrapContinuationAllowed',
      'commandContinuationAllowed',
      ...optionalRealRuntimePublicationCommitKeys
    ])
    && pathFreeRuntimeCommit(runtimeCommit)
}

const createCheck = (
  id: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationCheckId,
  status: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationCheck['status'],
  reason: string
): ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationCheck => Object.freeze({
  id,
  status,
  reason
})

const skippedChecks = (
  status: 'skipped' | 'blocked'
): readonly ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationCheck[] => Object.freeze([
  createCheck(
    'post-commit-verification-ready',
    status,
    'Post-commit verification after install transaction commit must be ready before runtime publication commit.'
  ),
  createCheck(
    'runtime-publication-commit-accepted',
    status,
    'Runtime publication commit is not evaluated until post-commit verification is ready.'
  ),
  createCheck(
    'install-target-consistent',
    status,
    'Install target consistency is skipped until both sources are available.'
  ),
  createCheck(
    'candidate-identity-consistent',
    status,
    'Candidate identity consistency is skipped until both sources are available.'
  ),
  createCheck(
    'lockfile-hash-consistent',
    status,
    'Lockfile hash consistency is skipped until both sources are available.'
  ),
  createCheck(
    'package-summary-consistent',
    status,
    'Package summary consistency is skipped until both sources are available.'
  ),
  createCheck(
    'continuation-flags-consistent',
    status,
    'Continuation flags are skipped until both sources are available.'
  ),
  createCheck(
    'contained-effects-intact',
    status,
    'Contained effect checks are skipped until both sources are available.'
  )
])

const createChecks = (
  postCommit: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult | undefined,
  runtimeCommit: ThirdPartyDataPackRuntimePublicationCommitSourceResult | undefined
): readonly ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationCheck[] => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(postCommit, 'selectedPackageIds'))
  const runtimeSelectedPackageIds = clonePackageIds(readOwnDataField(runtimeCommit, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(postCommit, 'blockedPackageIds'))
  const runtimeBlockedPackageIds = clonePackageIds(readOwnDataField(runtimeCommit, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(postCommit, 'loadOrder'))
  const runtimeLoadOrder = clonePackageIds(readOwnDataField(runtimeCommit, 'loadOrder'))
  const postCandidateHash = readOwnStringField(postCommit, 'candidateHash')
    ?? cloneCandidateIdentity(readOwnDataField(postCommit, 'candidateIdentity'))?.candidateHash
  const runtimeCandidateHash = cloneCandidateIdentity(readOwnDataField(runtimeCommit, 'candidateIdentity'))?.candidateHash
  const runtimeAccepted = runtimeCommit !== undefined && safeAcceptedRuntimeCommit(runtimeCommit)
  const targetConsistent = readOwnStringField(postCommit, 'targetPackageId') === readOwnStringField(runtimeCommit, 'targetPackageId')
  const candidateConsistent = postCandidateHash !== undefined && postCandidateHash === runtimeCandidateHash
  const lockfileConsistent = readOwnStringField(postCommit, 'lockfileHash') === readOwnStringField(runtimeCommit, 'lockfileHash')
  const packageSummaryConsistent = arraysEqual(selectedPackageIds, runtimeSelectedPackageIds)
    && arraysEqual(blockedPackageIds, runtimeBlockedPackageIds)
    && arraysEqual(loadOrder, runtimeLoadOrder)
    && readOwnNumberField(postCommit, 'registryCount') === readOwnNumberField(runtimeCommit, 'registryCount')
    && readOwnNumberField(postCommit, 'entryCount') === readOwnNumberField(runtimeCommit, 'entryCount')
    && readOwnNumberField(postCommit, 'packageCount') === readOwnNumberField(runtimeCommit, 'packageCount')
  const continuationFlagsConsistent = readOwnBooleanField(postCommit, 'appBootstrapContinuationAllowed') === true
    && readOwnBooleanField(postCommit, 'commandContinuationAllowed') === true
    && readOwnBooleanField(postCommit, 'uiIpcResultContinuationAllowed') === true
    && readOwnBooleanField(runtimeCommit, 'appBootstrapContinuationAllowed') === true
    && readOwnBooleanField(runtimeCommit, 'commandContinuationAllowed') === true
  const contained = postCommit !== undefined && runtimeCommit !== undefined
    && safeReadyPostCommit(postCommit)
    && safeAcceptedRuntimeCommit(runtimeCommit)

  return Object.freeze([
    createCheck(
      'post-commit-verification-ready',
      postCommit !== undefined && safeReadyPostCommit(postCommit) ? 'satisfied' : 'blocked',
      'Runtime publication commit must follow a ready committed-transaction post-commit verification acknowledgement.'
    ),
    createCheck(
      'runtime-publication-commit-accepted',
      runtimeAccepted ? 'satisfied' : 'blocked',
      'Runtime publication commit must return an accepted path-free host acknowledgement.'
    ),
    createCheck(
      'install-target-consistent',
      targetConsistent ? 'satisfied' : 'blocked',
      'Post-commit verification and runtime publication commit must target the same package.'
    ),
    createCheck(
      'candidate-identity-consistent',
      candidateConsistent ? 'satisfied' : 'blocked',
      'Post-commit verification and runtime publication commit must agree on candidate identity.'
    ),
    createCheck(
      'lockfile-hash-consistent',
      lockfileConsistent ? 'satisfied' : 'blocked',
      'Post-commit verification and runtime publication commit must agree on lockfile hash.'
    ),
    createCheck(
      'package-summary-consistent',
      packageSummaryConsistent ? 'satisfied' : 'blocked',
      'Post-commit verification and runtime publication commit must agree on selected/blocked/load-order totals.'
    ),
    createCheck(
      'continuation-flags-consistent',
      continuationFlagsConsistent ? 'satisfied' : 'blocked',
      'Both sources must allow app bootstrap and command continuation.'
    ),
    createCheck(
      'contained-effects-intact',
      contained ? 'satisfied' : 'blocked',
      'Both sources must remain path-free and must not expose live registry, app, host, storage or path handles.'
    )
  ])
}

const allChecksSatisfied = (
  checks: readonly ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationCheck[]
): boolean => checks.every(check => check.status === 'satisfied')

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
  status: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineStatus,
  postCommit: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult | undefined,
  runtimeCommit: ThirdPartyDataPackRuntimePublicationCommitSourceResult | undefined,
  postCommitCalled: boolean,
  runtimeCommitCalled: boolean
): ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationEffectSummary => {
  const accepted = status === 'accepted'
  const postEffects = readOwnDataField(postCommit, 'effects')
  const runtimeEffects = readOwnDataField(runtimeCommit, 'effects') as object | undefined
  const realRuntimePublicationCommit =
    accepted
    && readOwnBooleanField(runtimeEffects, 'realRuntimePublicationCommitCalled') === true
    && readOwnBooleanField(runtimeEffects, 'runtimePublicationCommitted') === true
  return Object.freeze({
    runtimePublicationCommitAfterPostCommitVerificationPipelineCalled: true,
    postCommitVerificationAfterInstallTransactionCommitPipelineCalled: postCommitCalled,
    runtimePublicationCommitPipelineCalled: runtimeCommitCalled,
    runtimePublicationCommitHostAccepted: accepted,
    transactionCommitted: accepted,
    transactionLogCommitted: accepted,
    postCommitVerificationAcknowledged: accepted,
    persistentReadProofAcknowledged: accepted,
    runtimePublicationCommitAcknowledged: accepted,
    appBootstrapContinuationAllowed: accepted,
    commandContinuationAllowed: accepted,
    uiIpcResultContinuationAllowed: accepted,
    realRuntimePublicationCommitCalled: realRuntimePublicationCommit,
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
    runtimePublicationCommitted: realRuntimePublicationCommit,
    postCommitVerificationExecuted: false,
    uiIpcResponseDelivered: false,
    transactionLogPrepared: accepted && readOwnBooleanField(postEffects, 'transactionLogPrepared') === true,
    transactionLogWritten: accepted && readOwnBooleanField(postEffects, 'transactionLogWritten') === true,
    transactionLogRead: accepted && readOwnBooleanField(postEffects, 'transactionLogRead') === true,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveCacheIsolationChecked: false,
    packageFilesWritten: accepted && readOwnBooleanField(postEffects, 'packageFilesWritten') === true,
    packageBackupsWritten: accepted && readOwnBooleanField(postEffects, 'packageBackupsWritten') === true,
    packageFilesRestored: false,
    lockfileWritten: accepted && readOwnBooleanField(postEffects, 'lockfileWritten') === true,
    lockfileRestored: false,
    settingsWritten: accepted && readOwnBooleanField(postEffects, 'settingsWritten') === true,
    settingsRestored: false,
    savesWritten: false,
    cacheWritten: false,
    recoveryLogRead: false,
    recoveryLogReplayed: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })
}

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineStatus
    readonly reason: string
    readonly enabled: boolean
    readonly postCommitCalled: boolean
    readonly runtimeCommitCalled: boolean
    readonly postCommit?: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult
    readonly runtimeCommit?: ThirdPartyDataPackRuntimePublicationCommitSourceResult
    readonly checks?: readonly ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationSafeDiagnostic[]
  }
): ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult => {
  const postCandidateIdentity = cloneCandidateIdentity(readOwnDataField(options.postCommit, 'candidateIdentity'))
  const runtimeCandidateIdentity = cloneCandidateIdentity(readOwnDataField(options.runtimeCommit, 'candidateIdentity'))
  const candidateIdentity = postCandidateIdentity ?? runtimeCandidateIdentity
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.postCommit, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.postCommit, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.postCommit, 'loadOrder'))
  const accepted = options.status === 'accepted'
  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_AFTER_POST_COMMIT_VERIFICATION_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_AFTER_POST_COMMIT_VERIFICATION_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    postCommitVerificationAfterInstallTransactionCommitSourceCalled: options.postCommitCalled,
    runtimePublicationCommitSourceCalled: options.runtimeCommitCalled,
    appBootstrapContinuationAllowed: accepted,
    commandContinuationAllowed: accepted,
    uiIpcResultContinuationAllowed: accepted,
    postCommitVerificationAfterInstallTransactionCommitStatus: readOwnStringField(options.postCommit, 'status') as
      | ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult['status']
      | undefined,
    runtimePublicationCommitStatus: readOwnStringField(options.runtimeCommit, 'status') as
      | ThirdPartyDataPackRuntimePublicationCommitSourceResult['status']
      | undefined,
    runtimePublicationCommitHostStatus: readOwnStringField(options.runtimeCommit, 'runtimePublicationCommitHostStatus') as
      | ThirdPartyDataPackRuntimePublicationCommitHostStatus
      | undefined,
    requestedCommandId: readThirdPartyDataPackEnabledRuntimeCommandId(
      readOwnStringField(options.postCommit, 'requestedCommandId')
    ),
    targetPackageId: readOwnStringField(options.postCommit, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    registryCount: readOwnNumberField(options.postCommit, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.postCommit, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.postCommit, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity,
    candidateHash: readOwnStringField(options.postCommit, 'candidateHash') as Sha256Hash | undefined
      ?? candidateIdentity?.candidateHash,
    lockfileHash: readOwnStringField(options.postCommit, 'lockfileHash') as Sha256Hash | undefined,
    transactionId: readOwnStringField(options.postCommit, 'transactionId'),
    committedTransactionId: readOwnStringField(options.postCommit, 'committedTransactionId'),
    committedTransactionLogEntryHash: readOwnStringField(
      options.postCommit,
      'committedTransactionLogEntryHash'
    ) as Sha256Hash | undefined,
    checks: options.checks ?? skippedChecks(options.status === 'blocked' ? 'blocked' : 'skipped'),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary(
      options.status,
      options.postCommit,
      options.runtimeCommit,
      options.postCommitCalled,
      options.runtimeCommitCalled
    )
  })
}

const sourceDiagnostics = (
  postCommit: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult | undefined,
  runtimeCommit: ThirdPartyDataPackRuntimePublicationCommitSourceResult | undefined
) => Object.freeze([
  ...safeDiagnostics(
    readOwnDataField(postCommit, 'diagnostics'),
    'third-party.runtime-publication-commit-after-post-commit-verification.post-commit-diagnostic-copy'
  ),
  ...safeDiagnostics(
    readOwnDataField(runtimeCommit, 'diagnostics'),
    'third-party.runtime-publication-commit-after-post-commit-verification.runtime-commit-diagnostic-copy'
  )
])

const evaluatePipeline = async(
  options: CreateThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineOptions
): Promise<ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party runtime publication commit after post-commit verification pipeline is disabled by default',
      enabled: false,
      postCommitCalled: false,
      runtimeCommitCalled: false
    })
  }

  const readPostCommitVerificationAfterInstallTransactionCommit =
    options.readPostCommitVerificationAfterInstallTransactionCommit
    ?? createThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipeline({
      ...options,
      enabled: true
    })

  let postCommit: ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult
  try {
    postCommit = await readPostCommitVerificationAfterInstallTransactionCommit()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'post-commit verification after install transaction commit failed before returning a safe result',
      enabled: true,
      postCommitCalled: true,
      runtimeCommitCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.runtime-publication-commit-after-post-commit-verification.post-commit-source-failed')
      ]
    })
  }

  const postStatus = readOwnStringField(postCommit, 'status') as
    | ThirdPartyDataPackPostCommitVerificationAfterInstallTransactionCommitPipelineResult['status']
    | undefined
  if (postStatus !== 'ready') {
    return baseResult({
      status: postStatus === 'blocked' ? 'blocked' : postStatus === 'deferred' ? 'deferred' : 'skipped',
      reason: 'runtime publication commit is waiting for ready committed-transaction post-commit verification',
      enabled: true,
      postCommitCalled: true,
      runtimeCommitCalled: false,
      postCommit,
      diagnostics: sourceDiagnostics(postCommit, undefined)
    })
  }

  if (!safeReadyPostCommit(postCommit)) {
    return baseResult({
      status: 'blocked',
      reason: 'post-commit verification after install transaction commit returned unsafe or path-bearing evidence',
      enabled: true,
      postCommitCalled: true,
      runtimeCommitCalled: false,
      postCommit,
      checks: createChecks(postCommit, undefined),
      diagnostics: [
        ...sourceDiagnostics(postCommit, undefined),
        commandDiagnostic(
          'third-party.runtime-publication-commit-after-post-commit-verification.unsafe-post-commit-source',
          readOwnStringField(postCommit, 'targetPackageId') as PackageId | undefined
        )
      ]
    })
  }

  const readRuntimePublicationCommit = options.readRuntimePublicationCommit
    ?? createThirdPartyDataPackRuntimePublicationCommitPipeline({
      ...options,
      enabled: true
    })

  let runtimeCommit: ThirdPartyDataPackRuntimePublicationCommitSourceResult
  try {
    runtimeCommit = await readRuntimePublicationCommit()
  } catch (error) {
    if (error instanceof ThirdPartyDataPackRuntimePublicationCommitBlockedError) {
      runtimeCommit = error.result
    } else {
      return baseResult({
        status: 'blocked',
        reason: 'runtime publication commit failed before returning a safe result',
        enabled: true,
        postCommitCalled: true,
        runtimeCommitCalled: true,
        postCommit,
        diagnostics: [
          ...sourceDiagnostics(postCommit, undefined),
          commandDiagnostic(
            'third-party.runtime-publication-commit-after-post-commit-verification.runtime-commit-source-failed',
            readOwnStringField(postCommit, 'targetPackageId') as PackageId | undefined
          )
        ]
      })
    }
  }

  const checks = createChecks(postCommit, runtimeCommit)
  const diagnostics = sourceDiagnostics(postCommit, runtimeCommit)
  if (allChecksSatisfied(checks)) {
    return baseResult({
      status: 'accepted',
      reason: 'runtime publication commit accepted after committed transaction post-commit verification',
      enabled: true,
      postCommitCalled: true,
      runtimeCommitCalled: true,
      postCommit,
      runtimeCommit,
      checks,
      diagnostics
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'runtime publication commit after post-commit verification requires matching path-free summaries',
    enabled: true,
    postCommitCalled: true,
    runtimeCommitCalled: true,
    postCommit,
    runtimeCommit,
    checks,
    diagnostics: [
      ...diagnostics,
      commandDiagnostic(
        'third-party.runtime-publication-commit-after-post-commit-verification.summary-mismatch',
        readOwnStringField(postCommit, 'targetPackageId') as PackageId | undefined
      )
    ]
  })
}

export const createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline = (
  options: CreateThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult>) =>
  () => evaluatePipeline(options)

export const thirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline =
  createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline()
