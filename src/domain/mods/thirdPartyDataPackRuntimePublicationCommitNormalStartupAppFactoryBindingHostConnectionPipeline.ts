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
  createThirdPartyDataPackRuntimePublicationNormalStartupAppFactoryBindingHostConnectionPipeline,
  type CreateThirdPartyDataPackRuntimePublicationNormalStartupAppFactoryBindingHostConnectionPipelineOptions
} from './thirdPartyDataPackRuntimePublicationNormalStartupAppFactoryBindingHostConnectionPipeline'
import {
  ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError,
  type ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult
} from './thirdPartyDataPackNormalStartupHandoffExecutionSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_NORMAL_STARTUP_APP_FACTORY_BINDING_HOST_CONNECTION_PIPELINE_KIND =
  'third-party-runtime-publication-commit-normal-startup-app-factory-binding-host-connection-pipeline'
export const THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_NORMAL_STARTUP_APP_FACTORY_BINDING_HOST_CONNECTION_PIPELINE_MODE =
  'default-disabled-runtime-publication-commit-normal-startup-app-factory-binding-host-connection-pipeline'

export type ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineStatus =
  | 'ready'
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionCheckId =
  | 'runtime-publication-commit-after-post-commit-accepted'
  | 'normal-startup-app-factory-binding-ready'
  | 'install-target-consistent'
  | 'lockfile-hash-consistent'
  | 'package-summary-consistent'
  | 'contained-effects-intact'

export interface ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionCheck {
  readonly id: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionEffectSummary {
  readonly runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineCalled: boolean
  readonly runtimePublicationCommitAfterPostCommitVerificationPipelineCalled: boolean
  readonly normalStartupAppFactoryBindingHostConnectionPipelineCalled: boolean
  readonly runtimePublicationCommitAcknowledged: boolean
  readonly postCommitVerificationAcknowledged: boolean
  readonly appFactoryBindingAcknowledged: boolean
  readonly normalStartupHandoffAcknowledged: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly normalStartupContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly realRuntimePublicationCommitCalled: false
  readonly realNormalStartupHostCalled: false
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
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
  readonly packageFilesWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_NORMAL_STARTUP_APP_FACTORY_BINDING_HOST_CONNECTION_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_NORMAL_STARTUP_APP_FACTORY_BINDING_HOST_CONNECTION_PIPELINE_MODE
  readonly status: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly runtimePublicationCommitAfterPostCommitVerificationSourceCalled: boolean
  readonly normalStartupAppFactoryBindingHostConnectionSourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly normalStartupContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly runtimePublicationCommitAfterPostCommitVerificationStatus?:
    ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult['status']
  readonly normalStartupAppFactoryBindingHostConnectionStatus?:
    ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult['status']
  readonly normalStartupHandoffHostStatus?:
    ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult['normalStartupHandoffHostStatus']
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
  readonly checks: readonly ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionEffectSummary
}

export interface CreateThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineOptions
  extends Omit<CreateThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineOptions, 'enabled'>,
    Omit<CreateThirdPartyDataPackRuntimePublicationNormalStartupAppFactoryBindingHostConnectionPipelineOptions, 'enabled'> {
  readonly enabled?: boolean
  readonly readRuntimePublicationCommitAfterPostCommitVerification?: () =>
    Awaitable<ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult>
  readonly readRuntimePublicationNormalStartupAppFactoryBindingHostConnection?: () =>
    Awaitable<ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult>
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

const forbiddenNormalStartupFields = [
  'startupGateBootstrapSource',
  'appFactoryBindingHost',
  'normalStartupHost',
  'normalStartupHandoffHost',
  'launcherAppFactory',
  'gameAppFactory',
  'launcherApp',
  'gameApp',
  'pinia',
  'piniaStore',
  'router',
  'routerInstance',
  'gameRouter',
  'app',
  'mount',
  'saveStore',
  'saveOpenGate',
  'uiIpcHost',
  'electronHost',
  'programDirectoryPath',
  'webSourceHost',
  'indexedDb',
  'androidHost',
  'appDataBridge',
  'androidNativeBridge',
  'androidPrivatePath',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'modLockStorage',
  'settingsStorage',
  'transactionLogStorage',
  'recoveryLogStorage'
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
  allowedTrueKeys: readonly string[] = []
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

const safeReadyNormalStartup = (
  result: ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult
): boolean => readOwnStringField(result, 'status') === 'ready'
  && readOwnBooleanField(result, 'normalStartupContinuationAllowed') === true
  && readOwnStringField(result, 'targetPackageId') !== undefined
  && clonePackageIds(readOwnDataField(result, 'selectedPackageIds')).includes(
    readOwnStringField(result, 'targetPackageId') as PackageId
  )
  && readOwnStringField(result, 'lockfileHash') !== undefined
  && readOwnStringField(result, 'normalStartupHandoffHostStatus') === 'accepted'
  && allOwnBooleanFlagsFalse(readOwnDataField(result, 'effects') as object | undefined, [
    'normalStartupHandoffExecutionSourceCalled',
    'startupGateBootstrapSourceCalled',
    'injectedNormalStartupHandoffHostCalled',
    'normalStartupHandoffHostCalled',
    'normalStartupHandoffHostAccepted',
    'normalStartupContinuationAllowed'
  ])
  && pathFree(result, forbiddenNormalStartupFields)

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const safeDiagnostic = (
  diagnostic: unknown,
  fallbackStage: string
): ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSafeDiagnostic => {
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
): readonly ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    const diagnostic = readOwnDataField(diagnostics, String(index))
    result.push(safeDiagnostic(diagnostic, fallbackStage))
  }
  return Object.freeze(result)
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSafeDiagnostic =>
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
  startupResult: ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult | undefined
) => Object.freeze([
  ...safeDiagnostics(
    readOwnDataField(commitResult, 'diagnostics'),
    'third-party.runtime-publication-commit-normal-startup-app-factory-binding.commit-diagnostic-copy'
  ),
  ...safeDiagnostics(
    readOwnDataField(startupResult, 'diagnostics'),
    'third-party.runtime-publication-commit-normal-startup-app-factory-binding.normal-startup-diagnostic-copy'
  )
])

const createCheck = (
  id: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionCheckId,
  status: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionCheck['status'],
  reason: string
): ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionCheck => Object.freeze({
  id,
  status,
  reason
})

const skippedChecks = (
  status: 'skipped' | 'blocked'
): readonly ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionCheck[] =>
  Object.freeze([
    createCheck(
      'runtime-publication-commit-after-post-commit-accepted',
      status,
      'Runtime publication commit must be accepted after committed post-commit verification.'
    ),
    createCheck(
      'normal-startup-app-factory-binding-ready',
      status,
      'Normal startup app-factory binding is not evaluated until runtime publication commit is accepted.'
    ),
    createCheck(
      'install-target-consistent',
      status,
      'Install target consistency is skipped until both sources are available.'
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
  startupResult: ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult | undefined
): readonly ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionCheck[] => {
  const commitSelected = clonePackageIds(readOwnDataField(commitResult, 'selectedPackageIds'))
  const startupSelected = clonePackageIds(readOwnDataField(startupResult, 'selectedPackageIds'))
  const commitBlocked = clonePackageIds(readOwnDataField(commitResult, 'blockedPackageIds'))
  const startupBlocked = clonePackageIds(readOwnDataField(startupResult, 'blockedPackageIds'))
  const commitLoadOrder = clonePackageIds(readOwnDataField(commitResult, 'loadOrder'))
  const startupLoadOrder = clonePackageIds(readOwnDataField(startupResult, 'loadOrder'))

  return Object.freeze([
    createCheck(
      'runtime-publication-commit-after-post-commit-accepted',
      commitResult !== undefined && safeAcceptedCommit(commitResult) ? 'satisfied' : 'blocked',
      'Runtime publication commit must be accepted after committed post-commit verification.'
    ),
    createCheck(
      'normal-startup-app-factory-binding-ready',
      startupResult !== undefined && safeReadyNormalStartup(startupResult) ? 'satisfied' : 'blocked',
      'Normal startup app-factory binding host connection must return a ready path-free handoff acknowledgement.'
    ),
    createCheck(
      'install-target-consistent',
      readOwnStringField(commitResult, 'targetPackageId') === readOwnStringField(startupResult, 'targetPackageId')
        ? 'satisfied'
        : 'blocked',
      'Runtime publication commit and normal startup must target the same package.'
    ),
    createCheck(
      'lockfile-hash-consistent',
      readOwnStringField(commitResult, 'lockfileHash') === readOwnStringField(startupResult, 'lockfileHash')
        ? 'satisfied'
        : 'blocked',
      'Runtime publication commit and normal startup must agree on lockfile hash.'
    ),
    createCheck(
      'package-summary-consistent',
      arraysEqual(commitSelected, startupSelected)
        && arraysEqual(commitBlocked, startupBlocked)
        && arraysEqual(commitLoadOrder, startupLoadOrder)
        && readOwnNumberField(commitResult, 'registryCount') === readOwnNumberField(startupResult, 'registryCount')
        && readOwnNumberField(commitResult, 'entryCount') === readOwnNumberField(startupResult, 'entryCount')
        && readOwnNumberField(commitResult, 'packageCount') === readOwnNumberField(startupResult, 'packageCount')
        ? 'satisfied'
        : 'blocked',
      'Runtime publication commit and normal startup must agree on selected/blocked/load-order totals.'
    ),
    createCheck(
      'contained-effects-intact',
      commitResult !== undefined
        && startupResult !== undefined
        && safeAcceptedCommit(commitResult)
        && safeReadyNormalStartup(startupResult)
        ? 'satisfied'
        : 'blocked',
      'Both sources must remain path-free and must not expose app, host, storage, registry or path handles.'
    )
  ])
}

const allChecksSatisfied = (
  checks: readonly ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionCheck[]
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
  status: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineStatus,
  commitCalled: boolean,
  startupCalled: boolean
): ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionEffectSummary => {
  const ready = status === 'ready'
  return Object.freeze({
    runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineCalled: true,
    runtimePublicationCommitAfterPostCommitVerificationPipelineCalled: commitCalled,
    normalStartupAppFactoryBindingHostConnectionPipelineCalled: startupCalled,
    runtimePublicationCommitAcknowledged: ready,
    postCommitVerificationAcknowledged: ready,
    appFactoryBindingAcknowledged: ready,
    normalStartupHandoffAcknowledged: ready,
    appBootstrapContinuationAllowed: ready,
    normalStartupContinuationAllowed: ready,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
    realRuntimePublicationCommitCalled: false,
    realNormalStartupHostCalled: false,
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    liveRegistrySwapped: false,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: false,
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
    packageFilesWritten: false,
    lockfileWritten: false,
    settingsWritten: false,
    savesWritten: false,
    cacheWritten: false,
    transactionLogWritten: false,
    rollbackExecuted: false,
    diagnosticsWritten: false
  })
}

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineStatus
    readonly reason: string
    readonly enabled: boolean
    readonly commitCalled: boolean
    readonly startupCalled: boolean
    readonly commitResult?: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
    readonly startupResult?: ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult
    readonly checks?: readonly ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionSafeDiagnostic[]
  }
): ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult => {
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(options.commitResult, 'candidateIdentity'))
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.commitResult, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.commitResult, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.commitResult, 'loadOrder'))
  const ready = options.status === 'ready'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_NORMAL_STARTUP_APP_FACTORY_BINDING_HOST_CONNECTION_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_NORMAL_STARTUP_APP_FACTORY_BINDING_HOST_CONNECTION_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    runtimePublicationCommitAfterPostCommitVerificationSourceCalled: options.commitCalled,
    normalStartupAppFactoryBindingHostConnectionSourceCalled: options.startupCalled,
    appBootstrapContinuationAllowed: ready,
    normalStartupContinuationAllowed: ready,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
    runtimePublicationCommitAfterPostCommitVerificationStatus: readOwnStringField(options.commitResult, 'status') as
      | ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult['status']
      | undefined,
    normalStartupAppFactoryBindingHostConnectionStatus: readOwnStringField(options.startupResult, 'status') as
      | ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult['status']
      | undefined,
    normalStartupHandoffHostStatus: readOwnStringField(options.startupResult, 'normalStartupHandoffHostStatus') as
      | ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult['normalStartupHandoffHostStatus']
      | undefined,
    requestedCommandId: readOwnStringField(options.commitResult, 'requestedCommandId') === 'install' ? 'install' : undefined,
    targetPackageId: readOwnStringField(options.commitResult, 'targetPackageId') as PackageId | undefined
      ?? readOwnStringField(options.startupResult, 'targetPackageId') as PackageId | undefined,
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
      ?? readOwnStringField(options.startupResult, 'lockfileHash') as Sha256Hash | undefined,
    checks: options.checks ?? skippedChecks(options.status === 'blocked' ? 'blocked' : 'skipped'),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary(options.status, options.commitCalled, options.startupCalled)
  })
}

const statusFromCommit = (
  result: ThirdPartyDataPackRuntimePublicationCommitAfterPostCommitVerificationPipelineResult
): ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineStatus => {
  const status = readOwnStringField(result, 'status')
  if (status === 'deferred') return 'deferred'
  if (status === 'blocked') return 'blocked'
  if (status === 'skipped') return 'skipped'
  return 'blocked'
}

const evaluatePipeline = async(
  options: CreateThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineOptions
): Promise<ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party runtime publication commit normal startup app-factory binding host connection is disabled by default',
      enabled: false,
      commitCalled: false,
      startupCalled: false
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
      startupCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.runtime-publication-commit-normal-startup-app-factory-binding.commit-source-failed')
      ]
    })
  }

  if (!safeAcceptedCommit(commitResult)) {
    const status = statusFromCommit(commitResult)
    return baseResult({
      status,
      reason: 'normal startup is waiting for accepted runtime publication commit after committed post-commit verification',
      enabled: true,
      commitCalled: true,
      startupCalled: false,
      commitResult,
      checks: createChecks(commitResult, undefined),
      diagnostics: [
        ...sourceDiagnostics(commitResult, undefined),
        ...(status === 'blocked'
          ? [
              commandDiagnostic(
                'third-party.runtime-publication-commit-normal-startup-app-factory-binding.unsafe-commit-source',
                readOwnStringField(commitResult, 'targetPackageId') as PackageId | undefined
              )
            ]
          : [])
      ]
    })
  }

  const readNormalStartup = options.readRuntimePublicationNormalStartupAppFactoryBindingHostConnection
    ?? createThirdPartyDataPackRuntimePublicationNormalStartupAppFactoryBindingHostConnectionPipeline({
      enabled: true,
      readLauncherBoundaryPreflight: options.readLauncherBoundaryPreflight,
      readStartupGatePersistentStateSource: options.readStartupGatePersistentStateSource,
      readRuntimePublicationLiveRegistrySwap: options.readRuntimePublicationLiveRegistrySwap,
      appFactoryBindingHost: options.appFactoryBindingHost,
      appFactoryBindingHostOptions: options.appFactoryBindingHostOptions,
      acknowledgeNormalStartupHandoff: options.acknowledgeNormalStartupHandoff
    })

  let startupResult: ThirdPartyDataPackNormalStartupHandoffExecutionSourceResult
  try {
    startupResult = await readNormalStartup()
  } catch (error) {
    if (error instanceof ThirdPartyDataPackNormalStartupHandoffExecutionBlockedError) {
      startupResult = error.result
    } else {
      return baseResult({
        status: 'blocked',
        reason: 'normal startup app-factory binding host connection failed before returning a safe result',
        enabled: true,
        commitCalled: true,
        startupCalled: true,
        commitResult,
        diagnostics: [
          ...sourceDiagnostics(commitResult, undefined),
          commandDiagnostic(
            'third-party.runtime-publication-commit-normal-startup-app-factory-binding.normal-startup-source-failed',
            readOwnStringField(commitResult, 'targetPackageId') as PackageId | undefined
          )
        ]
      })
    }
  }

  const checks = createChecks(commitResult, startupResult)
  const diagnostics = sourceDiagnostics(commitResult, startupResult)
  if (allChecksSatisfied(checks)) {
    return baseResult({
      status: 'ready',
      reason: 'normal startup app-factory binding is ready after accepted runtime publication commit and post-commit verification',
      enabled: true,
      commitCalled: true,
      startupCalled: true,
      commitResult,
      startupResult,
      checks,
      diagnostics
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'runtime publication commit and normal startup app-factory binding require matching path-free summaries',
    enabled: true,
    commitCalled: true,
    startupCalled: true,
    commitResult,
    startupResult,
    checks,
    diagnostics: [
      ...diagnostics,
      commandDiagnostic(
        'third-party.runtime-publication-commit-normal-startup-app-factory-binding.summary-mismatch',
        readOwnStringField(commitResult, 'targetPackageId') as PackageId | undefined
      )
    ]
  })
}

export const createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline = (
  options: CreateThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineResult>) =>
  () => evaluatePipeline(options)

export const thirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline =
  createThirdPartyDataPackRuntimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipeline()
