import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyCandidateIdentitySummary } from './thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline,
  type CreateThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineOptions,
  type ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult
} from './thirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline,
  type ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
} from './thirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline'
import {
  createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline,
  type CreateThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineOptions,
  type ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult
} from './thirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline'
import {
  readThirdPartyDataPackEnabledRuntimeCommandId,
  type ThirdPartyDataPackEnabledRuntimeCommandId
} from './thirdPartyDataPackRuntimeCommandState'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_APP_STARTUP_READINESS_PIPELINE_KIND =
  'third-party-runtime-publication-commit-app-startup-readiness-pipeline'
export const THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_APP_STARTUP_READINESS_PIPELINE_MODE =
  'default-disabled-runtime-publication-commit-app-startup-readiness-pipeline'

export type ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineStatus =
  | 'ready'
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessCheckId =
  | 'live-registry-swap-after-commit-swapped'
  | 'normal-startup-app-factory-binding-after-commit-ready'
  | 'install-target-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'package-summary-consistent'
  | 'contained-effects-intact'

export interface ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessCheck {
  readonly id: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessEffectSummary {
  readonly runtimePublicationCommitAppStartupReadinessPipelineCalled: boolean
  readonly runtimePublicationCommitLiveRegistrySwapHostConnectionPipelineCalled: boolean
  readonly runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineCalled: boolean
  readonly runtimePublicationCommitAcknowledged: boolean
  readonly postCommitVerificationAcknowledged: boolean
  readonly liveRegistrySwapAcknowledged: boolean
  readonly appFactoryBindingAcknowledged: boolean
  readonly normalStartupHandoffAcknowledged: boolean
  readonly appStartupReadinessAllowed: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly normalStartupContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly realRuntimePublicationCommitCalled: boolean
  readonly realNormalStartupHostCalled: boolean
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: boolean
  readonly liveRegistryMutated: boolean
  readonly liveRegistrySwapped: boolean
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: boolean
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
  readonly runtimePublicationCommitted: boolean
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

export interface ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_APP_STARTUP_READINESS_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_APP_STARTUP_READINESS_PIPELINE_MODE
  readonly status: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineStatus
  readonly reason: string
  readonly readOnly: true
  readonly runtimeOnly: true
  readonly persistentWrite: false
  readonly enabled: boolean
  readonly runtimePublicationCommitLiveRegistrySwapHostConnectionSourceCalled: boolean
  readonly runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSourceCalled: boolean
  readonly appStartupReadinessAllowed: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly normalStartupContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly runtimePublicationCommitLiveRegistrySwapHostConnectionStatus?:
    ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult['status']
  readonly runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionStatus?:
    ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult['status']
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
  readonly checks: readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessEffectSummary
}

export interface CreateThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineOptions
  extends Omit<CreateThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineOptions, 'enabled'>,
    Omit<CreateThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineOptions, 'enabled'> {
  readonly enabled?: boolean
  readonly readRuntimePublicationCommitLiveRegistrySwapHostConnection?: () =>
    Awaitable<ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult>
  readonly readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection?: () =>
    Awaitable<ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult>
}

const forbiddenLiveSwapFields = [
  'runtimePublicationCommitAfterPostCommitVerification',
  'runtimePublicationLiveRegistrySwapHostConnection',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'programDirectoryPath',
  'liveRegistryReference',
  'liveRegistry',
  'candidateRegistry',
  'previousRegistry',
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

const forbiddenNormalStartupFields = [
  'runtimePublicationCommitAfterPostCommitVerification',
  'runtimePublicationNormalStartupAppFactoryBindingHostConnection',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'programDirectoryPath',
  'startupSnapshot',
  'startupState',
  'appFactoryBindingHost',
  'normalStartupHost',
  'normalStartupHandoffHost',
  'launcherAppFactory',
  'gameAppFactory',
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

const safeSwappedLiveRegistry = (
  result: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult
): boolean => readOwnStringField(result, 'status') === 'swapped'
  && readOwnBooleanField(result, 'appBootstrapContinuationAllowed') === true
  && readOwnBooleanField(result, 'commandContinuationAllowed') === true
  && readOwnStringField(result, 'targetPackageId') !== undefined
  && clonePackageIds(readOwnDataField(result, 'selectedPackageIds')).includes(
    readOwnStringField(result, 'targetPackageId') as PackageId
  )
  && cloneCandidateIdentity(readOwnDataField(result, 'candidateIdentity')) !== undefined
  && readOwnStringField(result, 'lockfileHash') !== undefined
  && allOwnBooleanFlagsFalse(readOwnDataField(result, 'effects') as object | undefined, [
    'runtimePublicationCommitLiveRegistrySwapHostConnectionPipelineCalled',
    'runtimePublicationCommitAfterPostCommitVerificationPipelineCalled',
    'runtimePublicationLiveRegistrySwapHostConnectionPipelineCalled',
    'runtimePublicationCommitAcknowledged',
    'postCommitVerificationAcknowledged',
    'liveRegistrySwapAcknowledged',
    'appBootstrapContinuationAllowed',
    'commandContinuationAllowed',
    'thirdPartyRegistryPublished',
    'liveRegistryMutated',
    'liveRegistrySwapped',
    'realRuntimePublicationCommitCalled',
    'runtimePublicationCommitted',
    'runtimeEnablementAllowed'
  ])
  && pathFree(result, forbiddenLiveSwapFields)

const safeReadyNormalStartup = (
  result: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult
): boolean => readOwnStringField(result, 'status') === 'ready'
  && readOwnBooleanField(result, 'appBootstrapContinuationAllowed') === true
  && readOwnBooleanField(result, 'normalStartupContinuationAllowed') === true
  && readOwnBooleanField(result, 'commandContinuationAllowed') === true
  && readOwnBooleanField(result, 'uiIpcResultContinuationAllowed') === true
  && readOwnStringField(result, 'targetPackageId') !== undefined
  && clonePackageIds(readOwnDataField(result, 'selectedPackageIds')).includes(
    readOwnStringField(result, 'targetPackageId') as PackageId
  )
  && cloneCandidateIdentity(readOwnDataField(result, 'candidateIdentity')) !== undefined
  && readOwnStringField(result, 'lockfileHash') !== undefined
  && allOwnBooleanFlagsFalse(readOwnDataField(result, 'effects') as object | undefined, [
    'runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineCalled',
    'runtimePublicationCommitAfterPostCommitVerificationPipelineCalled',
    'normalStartupAppFactoryBindingHostConnectionPipelineCalled',
    'runtimePublicationCommitAcknowledged',
    'postCommitVerificationAcknowledged',
    'appFactoryBindingAcknowledged',
    'normalStartupHandoffAcknowledged',
    'appBootstrapContinuationAllowed',
    'normalStartupContinuationAllowed',
    'commandContinuationAllowed',
    'uiIpcResultContinuationAllowed',
    'realRuntimePublicationCommitCalled',
    'realNormalStartupHostCalled',
    'runtimePublicationCommitted'
  ])
  && pathFree(result, forbiddenNormalStartupFields)

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const safeDiagnostic = (
  diagnostic: unknown,
  fallbackStage: string
): ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessSafeDiagnostic => {
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
): readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    const diagnostic = readOwnDataField(diagnostics, String(index))
    result.push(safeDiagnostic(diagnostic, fallbackStage))
  }
  return Object.freeze(result)
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessSafeDiagnostic =>
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
  liveSwapResult: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult | undefined,
  normalStartupResult: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult | undefined
) => Object.freeze([
  ...safeDiagnostics(
    readOwnDataField(liveSwapResult, 'diagnostics'),
    'third-party.runtime-publication-commit-app-startup-readiness.live-swap-diagnostic-copy'
  ),
  ...safeDiagnostics(
    readOwnDataField(normalStartupResult, 'diagnostics'),
    'third-party.runtime-publication-commit-app-startup-readiness.normal-startup-diagnostic-copy'
  )
])

const createCheck = (
  id: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessCheckId,
  status: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessCheck['status'],
  reason: string
): ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessCheck => Object.freeze({
  id,
  status,
  reason
})

const skippedChecks = (
  status: 'skipped' | 'blocked'
): readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessCheck[] =>
  Object.freeze([
    createCheck(
      'live-registry-swap-after-commit-swapped',
      status,
      'Live registry swap host connection must be swapped after post-commit runtime publication commit.'
    ),
    createCheck(
      'normal-startup-app-factory-binding-after-commit-ready',
      status,
      'Normal startup app-factory binding is not evaluated until live registry swap is swapped.'
    ),
    createCheck(
      'install-target-consistent',
      status,
      'Install target consistency is skipped until both startup prerequisites are available.'
    ),
    createCheck(
      'candidate-identity-consistent',
      status,
      'Candidate identity consistency is skipped until both startup prerequisites are available.'
    ),
    createCheck(
      'lockfile-hash-consistent',
      status,
      'Lockfile hash consistency is skipped until both startup prerequisites are available.'
    ),
    createCheck(
      'package-summary-consistent',
      status,
      'Package summary consistency is skipped until both startup prerequisites are available.'
    ),
    createCheck(
      'contained-effects-intact',
      status,
      'Contained effect checks are skipped until both startup prerequisites are available.'
    )
  ])

const createChecks = (
  liveSwapResult: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult | undefined,
  normalStartupResult: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult | undefined
): readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessCheck[] => {
  const liveSelected = clonePackageIds(readOwnDataField(liveSwapResult, 'selectedPackageIds'))
  const startupSelected = clonePackageIds(readOwnDataField(normalStartupResult, 'selectedPackageIds'))
  const liveBlocked = clonePackageIds(readOwnDataField(liveSwapResult, 'blockedPackageIds'))
  const startupBlocked = clonePackageIds(readOwnDataField(normalStartupResult, 'blockedPackageIds'))
  const liveLoadOrder = clonePackageIds(readOwnDataField(liveSwapResult, 'loadOrder'))
  const startupLoadOrder = clonePackageIds(readOwnDataField(normalStartupResult, 'loadOrder'))
  const liveCandidateHash = readOwnStringField(liveSwapResult, 'candidateHash')
    ?? cloneCandidateIdentity(readOwnDataField(liveSwapResult, 'candidateIdentity'))?.candidateHash
  const startupCandidateHash = readOwnStringField(normalStartupResult, 'candidateHash')
    ?? cloneCandidateIdentity(readOwnDataField(normalStartupResult, 'candidateIdentity'))?.candidateHash

  return Object.freeze([
    createCheck(
      'live-registry-swap-after-commit-swapped',
      liveSwapResult !== undefined && safeSwappedLiveRegistry(liveSwapResult) ? 'satisfied' : 'blocked',
      'Runtime publication commit live-registry swap host connection must be swapped first.'
    ),
    createCheck(
      'normal-startup-app-factory-binding-after-commit-ready',
      normalStartupResult !== undefined && safeReadyNormalStartup(normalStartupResult) ? 'satisfied' : 'blocked',
      'Runtime publication commit normal-startup app-factory binding host connection must be ready.'
    ),
    createCheck(
      'install-target-consistent',
      readOwnStringField(liveSwapResult, 'targetPackageId') === readOwnStringField(normalStartupResult, 'targetPackageId')
        ? 'satisfied'
        : 'blocked',
      'Live registry swap and normal startup must target the same package.'
    ),
    createCheck(
      'candidate-identity-consistent',
      liveCandidateHash !== undefined && liveCandidateHash === startupCandidateHash ? 'satisfied' : 'blocked',
      'Live registry swap and normal startup must agree on candidate identity.'
    ),
    createCheck(
      'lockfile-hash-consistent',
      readOwnStringField(liveSwapResult, 'lockfileHash') === readOwnStringField(normalStartupResult, 'lockfileHash')
        ? 'satisfied'
        : 'blocked',
      'Live registry swap and normal startup must agree on lockfile hash.'
    ),
    createCheck(
      'package-summary-consistent',
      arraysEqual(liveSelected, startupSelected)
        && arraysEqual(liveBlocked, startupBlocked)
        && arraysEqual(liveLoadOrder, startupLoadOrder)
        && readOwnNumberField(liveSwapResult, 'registryCount') === readOwnNumberField(normalStartupResult, 'registryCount')
        && readOwnNumberField(liveSwapResult, 'entryCount') === readOwnNumberField(normalStartupResult, 'entryCount')
        && readOwnNumberField(liveSwapResult, 'packageCount') === readOwnNumberField(normalStartupResult, 'packageCount')
        ? 'satisfied'
        : 'blocked',
      'Live registry swap and normal startup must agree on selected/blocked/load-order totals.'
    ),
    createCheck(
      'contained-effects-intact',
      liveSwapResult !== undefined
        && normalStartupResult !== undefined
        && safeSwappedLiveRegistry(liveSwapResult)
        && safeReadyNormalStartup(normalStartupResult)
        ? 'satisfied'
        : 'blocked',
      'Both sources must remain path-free and must not expose app, host, storage, registry or path handles.'
    )
  ])
}

const allChecksSatisfied = (
  checks: readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessCheck[]
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
  status: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineStatus,
  liveSwapCalled: boolean,
  normalStartupCalled: boolean,
  liveSwapResult?: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult,
  normalStartupResult?: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult
): ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessEffectSummary => {
  const ready = status === 'ready'
  const liveSwapEffects = readOwnDataField(liveSwapResult, 'effects') as object | undefined
  const normalStartupEffects = readOwnDataField(normalStartupResult, 'effects') as object | undefined
  const realRuntimePublicationCommit = ready
    && readOwnBooleanField(liveSwapEffects, 'realRuntimePublicationCommitCalled') === true
    && readOwnBooleanField(liveSwapEffects, 'runtimePublicationCommitted') === true
    && readOwnBooleanField(normalStartupEffects, 'realRuntimePublicationCommitCalled') === true
    && readOwnBooleanField(normalStartupEffects, 'runtimePublicationCommitted') === true
  const realNormalStartupHostCalled =
    ready && readOwnBooleanField(normalStartupEffects, 'realNormalStartupHostCalled') === true
  return Object.freeze({
    runtimePublicationCommitAppStartupReadinessPipelineCalled: true,
    runtimePublicationCommitLiveRegistrySwapHostConnectionPipelineCalled: liveSwapCalled,
    runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineCalled: normalStartupCalled,
    runtimePublicationCommitAcknowledged: ready,
    postCommitVerificationAcknowledged: ready,
    liveRegistrySwapAcknowledged: ready,
    appFactoryBindingAcknowledged: ready,
    normalStartupHandoffAcknowledged: ready,
    appStartupReadinessAllowed: ready,
    appBootstrapContinuationAllowed: ready,
    normalStartupContinuationAllowed: ready,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
    realRuntimePublicationCommitCalled: realRuntimePublicationCommit,
    realNormalStartupHostCalled,
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: ready,
    liveRegistryMutated: ready,
    liveRegistrySwapped: ready,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: ready,
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
    runtimePublicationCommitted: realRuntimePublicationCommit,
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
    readonly status: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineStatus
    readonly reason: string
    readonly enabled: boolean
    readonly liveSwapCalled: boolean
    readonly normalStartupCalled: boolean
    readonly liveSwapResult?: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult
    readonly normalStartupResult?: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult
    readonly checks?: readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessSafeDiagnostic[]
  }
): ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult => {
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(options.liveSwapResult, 'candidateIdentity'))
    ?? cloneCandidateIdentity(readOwnDataField(options.normalStartupResult, 'candidateIdentity'))
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.liveSwapResult, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.liveSwapResult, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.liveSwapResult, 'loadOrder'))
  const ready = options.status === 'ready'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_APP_STARTUP_READINESS_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_APP_STARTUP_READINESS_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    runtimeOnly: true,
    persistentWrite: false,
    enabled: options.enabled,
    runtimePublicationCommitLiveRegistrySwapHostConnectionSourceCalled: options.liveSwapCalled,
    runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSourceCalled: options.normalStartupCalled,
    appStartupReadinessAllowed: ready,
    appBootstrapContinuationAllowed: ready,
    normalStartupContinuationAllowed: ready,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
    runtimePublicationCommitLiveRegistrySwapHostConnectionStatus: readOwnStringField(options.liveSwapResult, 'status') as
      | ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult['status']
      | undefined,
    runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionStatus: readOwnStringField(
      options.normalStartupResult,
      'status'
    ) as
      | ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult['status']
      | undefined,
    requestedCommandId: readThirdPartyDataPackEnabledRuntimeCommandId(
      readOwnStringField(options.liveSwapResult, 'requestedCommandId')
    ),
    targetPackageId: readOwnStringField(options.liveSwapResult, 'targetPackageId') as PackageId | undefined
      ?? readOwnStringField(options.normalStartupResult, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    registryCount: readOwnNumberField(options.liveSwapResult, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.liveSwapResult, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.liveSwapResult, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity,
    candidateHash: readOwnStringField(options.liveSwapResult, 'candidateHash') as Sha256Hash | undefined
      ?? candidateIdentity?.candidateHash,
    lockfileHash: readOwnStringField(options.liveSwapResult, 'lockfileHash') as Sha256Hash | undefined
      ?? readOwnStringField(options.normalStartupResult, 'lockfileHash') as Sha256Hash | undefined,
    checks: options.checks ?? skippedChecks(options.status === 'blocked' ? 'blocked' : 'skipped'),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary(
      options.status,
      options.liveSwapCalled,
      options.normalStartupCalled,
      options.liveSwapResult,
      options.normalStartupResult
    )
  })
}

const statusFromLiveSwap = (
  result: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult
): ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineStatus => {
  const status = readOwnStringField(result, 'status')
  if (status === 'deferred') return 'deferred'
  if (status === 'blocked') return 'blocked'
  if (status === 'skipped') return 'skipped'
  return 'blocked'
}

const createSharedRuntimePublicationCommitAfterPostCommitVerificationReader = (
  options: CreateThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineOptions
): (() => Promise<ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult>) => {
  const readCommit = options.readRuntimePublicationCommitAfterPostCommitVerification
    ?? createThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipeline({
      ...options,
      enabled: true
    })
  let pendingCommit:
    Promise<ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult>
    | undefined

  return () => {
    pendingCommit ??= (async() => readCommit())()
    return pendingCommit
  }
}

const evaluatePipeline = async(
  options: CreateThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineOptions
): Promise<ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party runtime publication commit app startup readiness is disabled by default',
      enabled: false,
      liveSwapCalled: false,
      normalStartupCalled: false
    })
  }

  const usesDefaultLiveSwapSource = options.readRuntimePublicationCommitLiveRegistrySwapHostConnection === undefined
  const usesDefaultNormalStartupSource =
    options.readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection === undefined
  const readSharedCommitAfterPostCommitVerification =
    usesDefaultLiveSwapSource && usesDefaultNormalStartupSource
      ? createSharedRuntimePublicationCommitAfterPostCommitVerificationReader(options)
      : undefined

  const readLiveSwap = options.readRuntimePublicationCommitLiveRegistrySwapHostConnection
    ?? createThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipeline({
      ...options,
      enabled: true,
      ...(readSharedCommitAfterPostCommitVerification === undefined
        ? {}
        : {
            readRuntimePublicationCommitAfterPostCommitVerification:
              readSharedCommitAfterPostCommitVerification
          })
    })

  let liveSwapResult: ThirdPartyDataPackRuntimePublicationCommitLiveRegistrySwapHostConnectionPipelineResult
  try {
    liveSwapResult = await readLiveSwap()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'runtime publication commit live-registry swap host connection failed before returning a safe result',
      enabled: true,
      liveSwapCalled: true,
      normalStartupCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.runtime-publication-commit-app-startup-readiness.live-swap-source-failed')
      ]
    })
  }

  if (!safeSwappedLiveRegistry(liveSwapResult)) {
    const status = statusFromLiveSwap(liveSwapResult)
    return baseResult({
      status,
      reason: 'app startup readiness is waiting for swapped live registry after accepted runtime publication commit',
      enabled: true,
      liveSwapCalled: true,
      normalStartupCalled: false,
      liveSwapResult,
      checks: createChecks(liveSwapResult, undefined),
      diagnostics: [
        ...sourceDiagnostics(liveSwapResult, undefined),
        ...(status === 'blocked'
          ? [
              commandDiagnostic(
                'third-party.runtime-publication-commit-app-startup-readiness.unsafe-live-swap-source',
                readOwnStringField(liveSwapResult, 'targetPackageId') as PackageId | undefined
              )
            ]
          : [])
      ]
    })
  }

  const readNormalStartup = options.readRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnection
    ?? createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline({
      ...options,
      enabled: true,
      ...(readSharedCommitAfterPostCommitVerification === undefined
        ? {}
        : {
            readRuntimePublicationCommitAfterPostCommitVerification:
              readSharedCommitAfterPostCommitVerification
          })
    })

  let normalStartupResult: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult
  try {
    normalStartupResult = await readNormalStartup()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'runtime publication commit normal startup app-factory binding host connection failed before returning a safe result',
      enabled: true,
      liveSwapCalled: true,
      normalStartupCalled: true,
      liveSwapResult,
      diagnostics: [
        ...sourceDiagnostics(liveSwapResult, undefined),
        commandDiagnostic(
          'third-party.runtime-publication-commit-app-startup-readiness.normal-startup-source-failed',
          readOwnStringField(liveSwapResult, 'targetPackageId') as PackageId | undefined
        )
      ]
    })
  }

  const checks = createChecks(liveSwapResult, normalStartupResult)
  const diagnostics = sourceDiagnostics(liveSwapResult, normalStartupResult)
  if (allChecksSatisfied(checks)) {
    return baseResult({
      status: 'ready',
      reason: 'app startup readiness is satisfied after live-registry swap and normal-startup app-factory binding',
      enabled: true,
      liveSwapCalled: true,
      normalStartupCalled: true,
      liveSwapResult,
      normalStartupResult,
      checks,
      diagnostics
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'live-registry swap and normal-startup app-factory binding require matching path-free summaries',
    enabled: true,
    liveSwapCalled: true,
    normalStartupCalled: true,
    liveSwapResult,
    normalStartupResult,
    checks,
    diagnostics: [
      ...diagnostics,
      commandDiagnostic(
        'third-party.runtime-publication-commit-app-startup-readiness.summary-mismatch',
        readOwnStringField(liveSwapResult, 'targetPackageId') as PackageId | undefined
      )
    ]
  })
}

export const createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline = (
  options: CreateThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult>) =>
  () => evaluatePipeline(options)

export const thirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline =
  createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline()
