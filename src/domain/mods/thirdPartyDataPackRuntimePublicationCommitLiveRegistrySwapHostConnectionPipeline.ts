import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyCandidateIdentitySummary } from './thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline,
  type CreateThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineOptions,
  type ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
} from './thirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline'
import {
  createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline,
  type CreateThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipelineOptions
} from './thirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline'
import {
  ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError,
  type ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
} from './thirdPartyDataPackLiveRegistrySwapExecutionSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_LIVE_REGISTRY_SWAP_HOST_CONNECTION_PIPELINE_KIND =
  'third-party-runtime-publication-commit-live-registry-swap-host-connection-pipeline'
export const THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_LIVE_REGISTRY_SWAP_HOST_CONNECTION_PIPELINE_MODE =
  'default-disabled-runtime-publication-commit-live-registry-swap-host-connection-pipeline'

export type ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineStatus =
  | 'swapped'
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionCheckId =
  | 'runtime-publication-commit-after-post-commit-accepted'
  | 'live-registry-swap-host-swapped'
  | 'install-target-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'package-summary-consistent'
  | 'contained-effects-intact'

export interface ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionCheck {
  readonly id: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionEffectSummary {
  readonly runtimePublicationCommitLiveRegistrySwapHostConnectionPipelineCalled: boolean
  readonly runtimePublicationCommitAfterPostCommitVerificationPipelineCalled: boolean
  readonly runtimePublicationLiveRegistrySwapHostConnectionPipelineCalled: boolean
  readonly runtimePublicationCommitAcknowledged: boolean
  readonly postCommitVerificationAcknowledged: boolean
  readonly liveRegistrySwapAcknowledged: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly realRuntimePublicationCommitCalled: false
  readonly thirdPartyRegistryPublished: boolean
  readonly liveRegistryMutated: boolean
  readonly liveRegistrySwapped: boolean
  readonly runtimeEnablementAllowed: boolean
  readonly officialRegistryPublished: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly launcherAppFactoryCalled: false
  readonly gameAppFactoryCalled: false
  readonly launcherAppCreated: false
  readonly gameAppCreated: false
  readonly piniaCreated: false
  readonly routerMounted: false
  readonly saveRead: false
  readonly uiIpcResponseDelivered: false
  readonly commandDispatched: false
  readonly transactionCommitted: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
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

export interface ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_LIVE_REGISTRY_SWAP_HOST_CONNECTION_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_LIVE_REGISTRY_SWAP_HOST_CONNECTION_PIPELINE_MODE
  readonly status: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly runtimePublicationCommitAfterPostCommitVerificationSourceCalled: boolean
  readonly runtimePublicationLiveRegistrySwapHostConnectionSourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly runtimePublicationCommitAfterPostCommitVerificationStatus?:
    ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult['status']
  readonly liveRegistrySwapStatus?: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult['status']
  readonly liveRegistrySwapHostStatus?: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult['liveRegistrySwapHostStatus']
  readonly requestedCommandId?: 'install'
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
  readonly checks: readonly ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionEffectSummary
}

export interface CreateThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineOptions
  extends Omit<CreateThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineOptions, 'enabled'>,
    Omit<CreateThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipelineOptions, 'enabled'> {
  readonly enabled?: boolean
  readonly readRuntimePublicationCommitAfterPostCommitVerification?: () =>
    Awaitable<ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult>
  readonly readRuntimePublicationLiveRegistrySwapHostConnection?: () =>
    Awaitable<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult>
}

const forbiddenCommitFields = [
  'postCommitVerificationAfterInstallTransactionCommit',
  'runtimePublicationCommit',
  'postCommitSource',
  'runtimePublicationSource',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'programDirectoryPath',
  'electronHost',
  'webHost',
  'androidHost',
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'window',
  'document',
  'storage',
  'reader',
  'writer'
] as const

const forbiddenLiveSwapFields = [
  'runtimePublicationPreflight',
  'transactionPreCommitPlan',
  'liveRegistrySwapProtection',
  'publicationRollbackRecovery',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'liveRegistry',
  'liveRegistryReference',
  'previousRegistry',
  'candidateRegistry',
  'runtimePublicationHost',
  'liveRegistrySwapHost',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'packageWriter',
  'settingsWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'window',
  'document'
] as const

const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnosticRecovery>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

const fallbackDiagnosticCode = 'LIFECYCLE-TRANSACTION-001'

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
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
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

const pathFree = (
  value: unknown,
  forbiddenFields: readonly string[]
): boolean => forbiddenFields.every(fieldName => !hasOwnEnumerableField(value, fieldName))

const allOwnBooleanFlagsFalse = (
  value: object | undefined,
  allowedTrueKeys: readonly string[]
): boolean => {
  if (value === undefined) return false
  const allowedTrue = new Set(allowedTrueKeys)
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
    return descriptor.value === false || (typeof key === 'string' && allowedTrue.has(key))
  })
}

const safeAcceptedCommit = (
  result: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
): boolean => readOwnStringField(result, 'status') === 'accepted'
  && readOwnBooleanField(result, 'appBootstrapContinuationAllowed') === true
  && readOwnBooleanField(result, 'commandContinuationAllowed') === true
  && readOwnBooleanField(result, 'uiIpcResultContinuationAllowed') === true
  && readOwnStringField(result, 'requestedCommandId') === 'install'
  && readOwnStringField(result, 'targetPackageId') !== undefined
  && clonePackageIds(readOwnDataField(result, 'selectedPackageIds')).includes(
    readOwnStringField(result, 'targetPackageId') as PackageId
  )
  && cloneCandidateIdentity(readOwnDataField(result, 'candidateIdentity')) !== undefined
  && readOwnStringField(result, 'lockfileHash') !== undefined
  && allOwnBooleanFlagsFalse(readOwnDataField(result, 'effects') as object | undefined, [
    'runtimePublicationCommitAfterPostCommitVerificationPipelineCalled',
    'postCommitVerificationAfterInstallTransactionCommitPipelineCalled',
    'runtimePublicationCommitPipelineCalled',
    'runtimePublicationCommitHostAccepted',
    'transactionCommitted',
    'transactionLogCommitted',
    'postCommitVerificationAcknowledged',
    'persistentReadProofAcknowledged',
    'runtimePublicationCommitAcknowledged',
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
  && pathFree(result, forbiddenCommitFields)

const safeSwappedLiveRegistry = (
  result: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
): boolean => {
  const targetPackageId = readOwnStringField(result, 'targetPackageId')
  return readOwnStringField(result, 'status') === 'swapped'
    && readOwnBooleanField(result, 'appBootstrapContinuationAllowed') === true
    && readOwnBooleanField(result, 'commandContinuationAllowed') === true
    && readOwnStringField(result, 'liveRegistrySwapHostStatus') === 'swapped'
    && readOwnStringField(result, 'requestedCommandId') === 'install'
    && targetPackageId !== undefined
    && clonePackageIds(readOwnDataField(result, 'selectedPackageIds')).includes(targetPackageId as PackageId)
    && cloneCandidateIdentity(readOwnDataField(result, 'candidateIdentity')) !== undefined
    && readOwnStringField(result, 'lockfileHash') !== undefined
    && allOwnBooleanFlagsFalse(readOwnDataField(result, 'effects') as object | undefined, [
      'liveRegistrySwapExecutionSourceCalled',
      'liveRegistrySwapProtectionSourceCalled',
      'injectedLiveRegistrySwapHostCalled',
      'liveRegistrySwapHostCalled',
      'liveRegistrySwapHostAccepted',
      'appBootstrapContinuationAllowed',
      'commandContinuationAllowed',
      'thirdPartyRegistryPublished',
      'liveRegistryMutated',
      'liveRegistrySwapped',
      'runtimeEnablementAllowed'
    ])
    && pathFree(result, forbiddenLiveSwapFields)
}

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const safeDiagnostic = (
  diagnostic: unknown,
  fallbackStage: string
): ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionSafeDiagnostic => {
  const code = readOwnStringField(diagnostic, 'code') ?? fallbackDiagnosticCode
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readOwnStringField(diagnostic, 'stage') ?? fallbackStage,
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? `mods.error.${code.toLowerCase().replace(/-/g, '.')}`,
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined,
    recovery: diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)
      ? recovery as ModDiagnosticRecovery
      : 'retry'
  })
}

const safeDiagnostics = (
  diagnostics: unknown,
  fallbackStage: string
): readonly ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    const diagnostic = readOwnDataField(diagnostics, String(index))
    result.push(safeDiagnostic(diagnostic, fallbackStage))
  }
  return Object.freeze(result)
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionSafeDiagnostic =>
  Object.freeze({
    code: fallbackDiagnosticCode,
    ruleId: fallbackDiagnosticCode,
    severity: 'error',
    stage,
    messageKey: 'mods.error.lifecycle.transaction.001',
    packageId,
    recovery: 'retry'
  })

const sourceDiagnostics = (
  commitResult: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult | undefined,
  liveSwapResult: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult | undefined
) => Object.freeze([
  ...safeDiagnostics(
    readOwnDataField(commitResult, 'diagnostics'),
    'third-party.runtime-publication-commit-live-registry-swap.commit-diagnostic-copy'
  ),
  ...safeDiagnostics(
    readOwnDataField(liveSwapResult, 'diagnostics'),
    'third-party.runtime-publication-commit-live-registry-swap.live-swap-diagnostic-copy'
  )
])

const createCheck = (
  id: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionCheckId,
  status: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionCheck['status'],
  reason: string
): ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionCheck => Object.freeze({
  id,
  status,
  reason
})

const skippedChecks = (
  status: 'skipped' | 'blocked'
): readonly ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionCheck[] =>
  Object.freeze([
    createCheck(
      'runtime-publication-commit-after-post-commit-accepted',
      status,
      'Runtime publication commit must be accepted after committed post-commit verification.'
    ),
    createCheck(
      'live-registry-swap-host-swapped',
      status,
      'Live registry swap host is not evaluated until post-commit runtime publication commit is accepted.'
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
      'contained-effects-intact',
      status,
      'Contained effect checks are skipped until both sources are available.'
    )
  ])

const createChecks = (
  commitResult: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult | undefined,
  liveSwapResult: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult | undefined
): readonly ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionCheck[] => {
  const commitSelected = clonePackageIds(readOwnDataField(commitResult, 'selectedPackageIds'))
  const liveSelected = clonePackageIds(readOwnDataField(liveSwapResult, 'selectedPackageIds'))
  const commitBlocked = clonePackageIds(readOwnDataField(commitResult, 'blockedPackageIds'))
  const liveBlocked = clonePackageIds(readOwnDataField(liveSwapResult, 'blockedPackageIds'))
  const commitLoadOrder = clonePackageIds(readOwnDataField(commitResult, 'loadOrder'))
  const liveLoadOrder = clonePackageIds(readOwnDataField(liveSwapResult, 'loadOrder'))
  const commitCandidateHash = readOwnStringField(commitResult, 'candidateHash')
    ?? cloneCandidateIdentity(readOwnDataField(commitResult, 'candidateIdentity'))?.candidateHash
  const liveCandidateHash = cloneCandidateIdentity(readOwnDataField(liveSwapResult, 'candidateIdentity'))?.candidateHash

  return Object.freeze([
    createCheck(
      'runtime-publication-commit-after-post-commit-accepted',
      commitResult !== undefined && safeAcceptedCommit(commitResult) ? 'satisfied' : 'blocked',
      'Post-commit runtime publication commit must be accepted before live registry swap.'
    ),
    createCheck(
      'live-registry-swap-host-swapped',
      liveSwapResult !== undefined && safeSwappedLiveRegistry(liveSwapResult) ? 'satisfied' : 'blocked',
      'Live registry swap host connection must return a swapped path-free acknowledgement.'
    ),
    createCheck(
      'install-target-consistent',
      readOwnStringField(commitResult, 'targetPackageId') === readOwnStringField(liveSwapResult, 'targetPackageId')
        ? 'satisfied'
        : 'blocked',
      'Runtime publication commit and live registry swap must target the same package.'
    ),
    createCheck(
      'candidate-identity-consistent',
      commitCandidateHash !== undefined && commitCandidateHash === liveCandidateHash ? 'satisfied' : 'blocked',
      'Runtime publication commit and live registry swap must agree on candidate identity.'
    ),
    createCheck(
      'lockfile-hash-consistent',
      readOwnStringField(commitResult, 'lockfileHash') === readOwnStringField(liveSwapResult, 'lockfileHash')
        ? 'satisfied'
        : 'blocked',
      'Runtime publication commit and live registry swap must agree on lockfile hash.'
    ),
    createCheck(
      'package-summary-consistent',
      arraysEqual(commitSelected, liveSelected)
        && arraysEqual(commitBlocked, liveBlocked)
        && arraysEqual(commitLoadOrder, liveLoadOrder)
        && readOwnNumberField(commitResult, 'registryCount') === readOwnNumberField(liveSwapResult, 'registryCount')
        && readOwnNumberField(commitResult, 'entryCount') === readOwnNumberField(liveSwapResult, 'entryCount')
        && readOwnNumberField(commitResult, 'packageCount') === readOwnNumberField(liveSwapResult, 'packageCount')
        ? 'satisfied'
        : 'blocked',
      'Runtime publication commit and live registry swap must agree on selected/blocked/load-order totals.'
    ),
    createCheck(
      'contained-effects-intact',
      commitResult !== undefined
        && liveSwapResult !== undefined
        && safeAcceptedCommit(commitResult)
        && safeSwappedLiveRegistry(liveSwapResult)
        ? 'satisfied'
        : 'blocked',
      'Both sources must remain path-free and must not expose app, host, storage, registry or path handles.'
    )
  ])
}

const allChecksSatisfied = (
  checks: readonly ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionCheck[]
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
  status: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineStatus,
  commitCalled: boolean,
  liveSwapCalled: boolean
): ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionEffectSummary => {
  const swapped = status === 'swapped'
  return Object.freeze({
    runtimePublicationCommitLiveRegistrySwapHostConnectionPipelineCalled: true,
    runtimePublicationCommitAfterPostCommitVerificationPipelineCalled: commitCalled,
    runtimePublicationLiveRegistrySwapHostConnectionPipelineCalled: liveSwapCalled,
    runtimePublicationCommitAcknowledged: swapped,
    postCommitVerificationAcknowledged: swapped,
    liveRegistrySwapAcknowledged: swapped,
    appBootstrapContinuationAllowed: swapped,
    commandContinuationAllowed: swapped,
    realRuntimePublicationCommitCalled: false,
    thirdPartyRegistryPublished: swapped,
    liveRegistryMutated: swapped,
    liveRegistrySwapped: swapped,
    runtimeEnablementAllowed: swapped,
    officialRegistryPublished: false,
    previousRegistryReleased: false,
    previousRegistryRestored: false,
    candidateRegistryExposed: false,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    gameAppCreated: false,
    piniaCreated: false,
    routerMounted: false,
    saveRead: false,
    uiIpcResponseDelivered: false,
    commandDispatched: false,
    transactionCommitted: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecuted: false,
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
    readonly status: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineStatus
    readonly reason: string
    readonly enabled: boolean
    readonly commitCalled: boolean
    readonly liveSwapCalled: boolean
    readonly commitResult?: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
    readonly liveSwapResult?: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
    readonly checks?: readonly ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionSafeDiagnostic[]
  }
): ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult => {
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(options.commitResult, 'candidateIdentity'))
    ?? cloneCandidateIdentity(readOwnDataField(options.liveSwapResult, 'candidateIdentity'))
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.commitResult, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.commitResult, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.commitResult, 'loadOrder'))
  const swapped = options.status === 'swapped'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_LIVE_REGISTRY_SWAP_HOST_CONNECTION_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_LIVE_REGISTRY_SWAP_HOST_CONNECTION_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    runtimePublicationCommitAfterPostCommitVerificationSourceCalled: options.commitCalled,
    runtimePublicationLiveRegistrySwapHostConnectionSourceCalled: options.liveSwapCalled,
    appBootstrapContinuationAllowed: swapped,
    commandContinuationAllowed: swapped,
    runtimePublicationCommitAfterPostCommitVerificationStatus: readOwnStringField(options.commitResult, 'status') as
      | ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult['status']
      | undefined,
    liveRegistrySwapStatus: readOwnStringField(options.liveSwapResult, 'status') as
      | ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult['status']
      | undefined,
    liveRegistrySwapHostStatus: readOwnStringField(options.liveSwapResult, 'liveRegistrySwapHostStatus') as
      | ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult['liveRegistrySwapHostStatus']
      | undefined,
    requestedCommandId: readOwnStringField(options.commitResult, 'requestedCommandId') === 'install' ? 'install' : undefined,
    targetPackageId: readOwnStringField(options.commitResult, 'targetPackageId') as PackageId | undefined
      ?? readOwnStringField(options.liveSwapResult, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    registryCount: readOwnNumberField(options.commitResult, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.commitResult, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.commitResult, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity,
    candidateHash: readOwnStringField(options.commitResult, 'candidateHash') as Sha256Hash | undefined
      ?? candidateIdentity?.candidateHash,
    lockfileHash: readOwnStringField(options.commitResult, 'lockfileHash') as Sha256Hash | undefined
      ?? readOwnStringField(options.liveSwapResult, 'lockfileHash') as Sha256Hash | undefined,
    transactionId: readOwnStringField(options.commitResult, 'transactionId'),
    committedTransactionId: readOwnStringField(options.commitResult, 'committedTransactionId'),
    committedTransactionLogEntryHash: readOwnStringField(
      options.commitResult,
      'committedTransactionLogEntryHash'
    ) as Sha256Hash | undefined,
    checks: options.checks ?? skippedChecks(options.status === 'blocked' ? 'blocked' : 'skipped'),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary(options.status, options.commitCalled, options.liveSwapCalled)
  })
}

const statusFromCommit = (
  result: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
): ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineStatus => {
  const status = readOwnStringField(result, 'status')
  if (status === 'deferred') return 'deferred'
  if (status === 'blocked') return 'blocked'
  if (status === 'skipped') return 'skipped'
  return 'blocked'
}

const evaluatePipeline = async(
  options: CreateThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineOptions
): Promise<ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party runtime publication commit live registry swap host connection is disabled by default',
      enabled: false,
      commitCalled: false,
      liveSwapCalled: false
    })
  }

  const readCommit = options.readRuntimePublicationCommitAfterPostCommitVerification
    ?? createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline({
      ...options,
      enabled: true
    })

  let commitResult: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
  try {
    commitResult = await readCommit()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'runtime publication commit after post-commit verification failed before returning a safe result',
      enabled: true,
      commitCalled: true,
      liveSwapCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.runtime-publication-commit-live-registry-swap.commit-source-failed')
      ]
    })
  }

  if (!safeAcceptedCommit(commitResult)) {
    const status = statusFromCommit(commitResult)
    return baseResult({
      status,
      reason: 'live registry swap host connection is waiting for accepted runtime publication commit after post-commit verification',
      enabled: true,
      commitCalled: true,
      liveSwapCalled: false,
      commitResult,
      checks: createChecks(commitResult, undefined),
      diagnostics: [
        ...sourceDiagnostics(commitResult, undefined),
        ...(status === 'blocked'
          ? [
              commandDiagnostic(
                'third-party.runtime-publication-commit-live-registry-swap.unsafe-commit-source',
                readOwnStringField(commitResult, 'targetPackageId') as PackageId | undefined
              )
            ]
          : [])
      ]
    })
  }

  const readLiveSwap = options.readRuntimePublicationLiveRegistrySwapHostConnection
    ?? createThirdPartyDataPackRuntimePublicationLiveRegistrySwapHostConnectionPipeline({
      enabled: true,
      readRuntimePublicationPreflight: options.readRuntimePublicationPreflight,
      readTransactionPreCommitPlan: options.readTransactionPreCommitPlan,
      readLiveRegistrySwapProtection: options.readLiveRegistrySwapProtection,
      readPublicationRollbackRecovery: options.readPublicationRollbackRecovery,
      acknowledgeRuntimePublicationCommit: options.acknowledgeRuntimePublicationCommit,
      liveRegistrySwapHost: options.liveRegistrySwapHost
    })

  let liveSwapResult: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult
  try {
    liveSwapResult = await readLiveSwap()
  } catch (error) {
    if (error instanceof ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError) {
      liveSwapResult = error.result
    } else {
      return baseResult({
        status: 'blocked',
        reason: 'runtime publication live registry swap host connection failed before returning a safe result',
        enabled: true,
        commitCalled: true,
        liveSwapCalled: true,
        commitResult,
        diagnostics: [
          ...sourceDiagnostics(commitResult, undefined),
          commandDiagnostic(
            'third-party.runtime-publication-commit-live-registry-swap.live-swap-source-failed',
            readOwnStringField(commitResult, 'targetPackageId') as PackageId | undefined
          )
        ]
      })
    }
  }

  const checks = createChecks(commitResult, liveSwapResult)
  const diagnostics = sourceDiagnostics(commitResult, liveSwapResult)
  if (allChecksSatisfied(checks)) {
    return baseResult({
      status: 'swapped',
      reason: 'live registry swap host connection is swapped after accepted post-commit runtime publication',
      enabled: true,
      commitCalled: true,
      liveSwapCalled: true,
      commitResult,
      liveSwapResult,
      checks,
      diagnostics
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'runtime publication commit and live registry swap host connection require matching path-free summaries',
    enabled: true,
    commitCalled: true,
    liveSwapCalled: true,
    commitResult,
    liveSwapResult,
    checks,
    diagnostics: [
      ...diagnostics,
      commandDiagnostic(
        'third-party.runtime-publication-commit-live-registry-swap.summary-mismatch',
        readOwnStringField(commitResult, 'targetPackageId') as PackageId | undefined
      )
    ]
  })
}

export const createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline = (
  options: CreateThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult>) =>
  () => evaluatePipeline(options)

export const thirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline =
  createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline()
