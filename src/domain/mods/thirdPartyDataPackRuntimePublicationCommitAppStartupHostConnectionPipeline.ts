import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyCandidateIdentitySummary } from './thirdPartyCandidateRegistrySnapshot'
import {
  createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline,
  type CreateThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineOptions,
  type ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
} from './thirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline'
import {
  readThirdPartyDataPackEnabledRuntimeCommandId,
  type ThirdPartyDataPackEnabledRuntimeCommandId
} from './thirdPartyDataPackRuntimeCommandState'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_APP_STARTUP_HOST_CONNECTION_PIPELINE_KIND =
  'third-party-runtime-publication-commit-app-startup-host-connection-pipeline'
export const THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_APP_STARTUP_HOST_CONNECTION_PIPELINE_MODE =
  'default-disabled-runtime-publication-commit-app-startup-host-connection-pipeline'

export type ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform =
  | 'electron'
  | 'web'

export type ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineStatus =
  | 'accepted'
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionCheckId =
  | 'web-electron-platform-selected'
  | 'app-startup-readiness-ready'
  | 'app-startup-host-accepted'
  | 'install-target-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'package-summary-consistent'
  | 'contained-effects-intact'

export interface ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionCheck {
  readonly id: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope {
  readonly platform: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
  readonly appStartupReadinessAccepted: true
}

export interface ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostEffectSummary {
  readonly appStartupHostCalled: boolean
  readonly appStartupHostAccepted: boolean
  readonly realAppStartupHostCalled: boolean
  readonly launcherAppFactoryCalled: false
  readonly gameAppFactoryCalled: false
  readonly launcherAppCreated: false
  readonly gameAppCreated: boolean
  readonly piniaCreated: boolean
  readonly routerMounted: boolean
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

export interface ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult {
  readonly status: 'accepted' | 'blocked'
  readonly platform?: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds?: readonly PackageId[]
  readonly blockedPackageIds?: readonly PackageId[]
  readonly loadOrder?: readonly PackageId[]
  readonly registryCount?: number
  readonly entryCount?: number
  readonly packageCount?: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly appStartupReadinessAccepted?: boolean
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostEffectSummary
}

export interface ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEffectSummary {
  readonly runtimePublicationCommitAppStartupHostConnectionPipelineCalled: boolean
  readonly runtimePublicationCommitAppStartupReadinessPipelineCalled: boolean
  readonly injectedAppStartupHostCalled: boolean
  readonly appStartupHostCalled: boolean
  readonly appStartupHostAccepted: boolean
  readonly runtimePublicationCommitAcknowledged: boolean
  readonly postCommitVerificationAcknowledged: boolean
  readonly liveRegistrySwapAcknowledged: boolean
  readonly appFactoryBindingAcknowledged: boolean
  readonly normalStartupHandoffAcknowledged: boolean
  readonly appStartupReadinessAcknowledged: boolean
  readonly appStartupHostWiringAllowed: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly normalStartupContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly realAppStartupHostCalled: boolean
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
  readonly gameAppCreated: boolean
  readonly piniaCreated: boolean
  readonly routerMounted: boolean
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

export interface ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_APP_STARTUP_HOST_CONNECTION_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_APP_STARTUP_HOST_CONNECTION_PIPELINE_MODE
  readonly platform?: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform
  readonly status: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineStatus
  readonly reason: string
  readonly readOnly: true
  readonly runtimeOnly: true
  readonly persistentWrite: false
  readonly enabled: boolean
  readonly runtimePublicationCommitAppStartupReadinessSourceCalled: boolean
  readonly appStartupHostConnectionCalled: boolean
  readonly appStartupReadinessStatus?: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult['status']
  readonly appStartupHostStatus?: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult['status']
  readonly appStartupReadinessAllowed: boolean
  readonly appStartupHostWiringAllowed: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly normalStartupContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
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
  readonly checks: readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEffectSummary
}

export interface CreateThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineOptions
  extends Omit<CreateThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineOptions, 'enabled'> {
  readonly enabled?: boolean
  readonly platform?: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform
  readonly readRuntimePublicationCommitAppStartupReadiness?: () =>
    Awaitable<ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult>
  readonly acknowledgeAppStartupHostWiring?: (
    envelope: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope
  ) => Awaitable<ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult>
}

const forbiddenReadinessFields = [
  'runtimePublicationCommitLiveRegistrySwapHostConnection',
  'runtimePublicationCommitNormalStartupAppFactoryBindingHostConnection',
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

const forbiddenHostFields = [
  'appStartupHost',
  'appStartupRequest',
  'rawEnvelope',
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

const validPlatforms = new Set<ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform>([
  'electron',
  'web'
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

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

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

const hasSafeMountedAppStartupHostEvidence = (
  effects: object | undefined,
  accepted: boolean
): boolean => {
  if (effects === undefined) return false
  const realAppStartupHostCalled = readOwnBooleanField(effects, 'realAppStartupHostCalled') === true
  if (!realAppStartupHostCalled) {
    return readOwnBooleanField(effects, 'gameAppCreated') !== true
      && readOwnBooleanField(effects, 'piniaCreated') !== true
      && readOwnBooleanField(effects, 'routerMounted') !== true
  }
  return accepted
    && readOwnBooleanField(effects, 'appStartupHostAccepted') === true
    && readOwnBooleanField(effects, 'gameAppCreated') === true
    && readOwnBooleanField(effects, 'piniaCreated') === true
    && readOwnBooleanField(effects, 'routerMounted') === true
}

const hostEffectsContained = (
  effects: object | undefined,
  accepted: boolean
): boolean => allOwnBooleanFlagsFalse(effects, [
  'appStartupHostCalled',
  ...(accepted
    ? [
        'appStartupHostAccepted',
        'realAppStartupHostCalled',
        'gameAppCreated',
        'piniaCreated',
        'routerMounted'
      ]
    : [])
])
  && hasSafeMountedAppStartupHostEvidence(effects, accepted)

const safeReadyAppStartupReadiness = (
  result: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
): boolean => readOwnStringField(result, 'status') === 'ready'
  && readOwnBooleanField(result, 'appStartupReadinessAllowed') === true
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
    'runtimePublicationCommitAppStartupReadinessPipelineCalled',
    'runtimePublicationCommitLiveRegistrySwapHostConnectionPipelineCalled',
    'runtimePublicationCommitNormalStartupAppFactoryBindingHostConnectionPipelineCalled',
    'runtimePublicationCommitAcknowledged',
    'postCommitVerificationAcknowledged',
    'liveRegistrySwapAcknowledged',
    'appFactoryBindingAcknowledged',
    'normalStartupHandoffAcknowledged',
    'appStartupReadinessAllowed',
    'appBootstrapContinuationAllowed',
    'normalStartupContinuationAllowed',
    'commandContinuationAllowed',
    'uiIpcResultContinuationAllowed',
    'thirdPartyRegistryPublished',
    'liveRegistryMutated',
    'liveRegistrySwapped',
    'realRuntimePublicationCommitCalled',
    'realNormalStartupHostCalled',
    'runtimePublicationCommitted',
    'runtimeEnablementAllowed'
  ])
  && pathFree(result, forbiddenReadinessFields)

const safeAcceptedHostResult = (
  platform: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform,
  readinessResult: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult,
  hostResult: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult
): boolean => {
  const readinessCandidateIdentity = cloneCandidateIdentity(readOwnDataField(readinessResult, 'candidateIdentity'))
  const hostCandidateIdentity = cloneCandidateIdentity(readOwnDataField(hostResult, 'candidateIdentity'))
  return readOwnStringField(hostResult, 'status') === 'accepted'
    && readOwnStringField(hostResult, 'platform') === platform
    && readOwnStringField(hostResult, 'targetPackageId') === readOwnStringField(readinessResult, 'targetPackageId')
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'selectedPackageIds')),
      clonePackageIds(readOwnDataField(readinessResult, 'selectedPackageIds'))
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'blockedPackageIds')),
      clonePackageIds(readOwnDataField(readinessResult, 'blockedPackageIds'))
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'loadOrder')),
      clonePackageIds(readOwnDataField(readinessResult, 'loadOrder'))
    )
    && readOwnNumberField(hostResult, 'registryCount') === readOwnNumberField(readinessResult, 'registryCount')
    && readOwnNumberField(hostResult, 'entryCount') === readOwnNumberField(readinessResult, 'entryCount')
    && readOwnNumberField(hostResult, 'packageCount') === readOwnNumberField(readinessResult, 'packageCount')
    && hostCandidateIdentity?.candidateHash === readinessCandidateIdentity?.candidateHash
    && readOwnStringField(hostResult, 'candidateHash') === (
      readOwnStringField(readinessResult, 'candidateHash')
        ?? readinessCandidateIdentity?.candidateHash
    )
    && readOwnStringField(hostResult, 'lockfileHash') === readOwnStringField(readinessResult, 'lockfileHash')
    && readOwnBooleanField(hostResult, 'appStartupReadinessAccepted') === true
    && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
    && pathFree(hostResult, forbiddenHostFields)
}

const safeDiagnostic = (
  diagnostic: unknown,
  fallbackStage: string
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionSafeDiagnostic => {
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
): readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    const diagnostic = readOwnDataField(diagnostics, String(index))
    result.push(safeDiagnostic(diagnostic, fallbackStage))
  }
  return Object.freeze(result)
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionSafeDiagnostic => Object.freeze({
  code: fallbackDiagnosticCode,
  ruleId: fallbackDiagnosticCode,
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const sourceDiagnostics = (
  readinessResult: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult | undefined,
  hostResult: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult | undefined
) => Object.freeze([
  ...safeDiagnostics(
    readOwnDataField(readinessResult, 'diagnostics'),
    'third-party.runtime-publication-commit-app-startup-host.readiness-diagnostic-copy'
  ),
  ...safeDiagnostics(
    readOwnDataField(hostResult, 'diagnostics'),
    'third-party.runtime-publication-commit-app-startup-host.host-diagnostic-copy'
  )
])

const createCheck = (
  id: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionCheckId,
  status: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionCheck['status'],
  reason: string
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionCheck => Object.freeze({
  id,
  status,
  reason
})

const skippedChecks = (
  status: 'skipped' | 'blocked'
): readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionCheck[] =>
  Object.freeze([
    createCheck(
      'web-electron-platform-selected',
      status,
      'App startup host wiring requires an explicit Web or Electron platform.'
    ),
    createCheck(
      'app-startup-readiness-ready',
      status,
      'App startup readiness is not evaluated until the pipeline is enabled.'
    ),
    createCheck(
      'app-startup-host-accepted',
      status,
      'App startup host acknowledgement is not evaluated until app startup readiness is ready.'
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

const pendingHostChecks = (
  platform: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform,
  readinessResult: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
): readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionCheck[] =>
  Object.freeze([
    createCheck(
      'web-electron-platform-selected',
      validPlatforms.has(platform) ? 'satisfied' : 'blocked',
      'App startup host wiring remains limited to Web and Electron.'
    ),
    createCheck(
      'app-startup-readiness-ready',
      safeReadyAppStartupReadiness(readinessResult) ? 'satisfied' : 'blocked',
      'App startup readiness must be ready before host wiring.'
    ),
    createCheck(
      'app-startup-host-accepted',
      'skipped',
      'App startup host acknowledgement is still waiting for an injected host.'
    ),
    createCheck(
      'install-target-consistent',
      'skipped',
      'Install target consistency is skipped until host acknowledgement is available.'
    ),
    createCheck(
      'candidate-identity-consistent',
      'skipped',
      'Candidate identity consistency is skipped until host acknowledgement is available.'
    ),
    createCheck(
      'lockfile-hash-consistent',
      'skipped',
      'Lockfile hash consistency is skipped until host acknowledgement is available.'
    ),
    createCheck(
      'package-summary-consistent',
      'skipped',
      'Package summary consistency is skipped until host acknowledgement is available.'
    ),
    createCheck(
      'contained-effects-intact',
      'skipped',
      'Contained effect checks are skipped until host acknowledgement is available.'
    )
  ])

const createChecks = (
  platform: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform,
  readinessResult: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult | undefined,
  hostResult: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult | undefined
): readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionCheck[] => {
  if (readinessResult !== undefined && hostResult === undefined) {
    return pendingHostChecks(platform, readinessResult)
  }

  const readinessSelected = clonePackageIds(readOwnDataField(readinessResult, 'selectedPackageIds'))
  const hostSelected = clonePackageIds(readOwnDataField(hostResult, 'selectedPackageIds'))
  const readinessBlocked = clonePackageIds(readOwnDataField(readinessResult, 'blockedPackageIds'))
  const hostBlocked = clonePackageIds(readOwnDataField(hostResult, 'blockedPackageIds'))
  const readinessLoadOrder = clonePackageIds(readOwnDataField(readinessResult, 'loadOrder'))
  const hostLoadOrder = clonePackageIds(readOwnDataField(hostResult, 'loadOrder'))
  const readinessCandidateHash = readOwnStringField(readinessResult, 'candidateHash')
    ?? cloneCandidateIdentity(readOwnDataField(readinessResult, 'candidateIdentity'))?.candidateHash
  const hostCandidateHash = readOwnStringField(hostResult, 'candidateHash')
    ?? cloneCandidateIdentity(readOwnDataField(hostResult, 'candidateIdentity'))?.candidateHash

  return Object.freeze([
    createCheck(
      'web-electron-platform-selected',
      validPlatforms.has(platform) ? 'satisfied' : 'blocked',
      'App startup host wiring remains limited to Web and Electron.'
    ),
    createCheck(
      'app-startup-readiness-ready',
      readinessResult !== undefined && safeReadyAppStartupReadiness(readinessResult) ? 'satisfied' : 'blocked',
      'App startup readiness must be ready before host wiring.'
    ),
    createCheck(
      'app-startup-host-accepted',
      readinessResult !== undefined
        && hostResult !== undefined
        && safeAcceptedHostResult(platform, readinessResult, hostResult)
        ? 'satisfied'
        : 'blocked',
      'App startup host must return an accepted path-free acknowledgement.'
    ),
    createCheck(
      'install-target-consistent',
      readOwnStringField(readinessResult, 'targetPackageId') === readOwnStringField(hostResult, 'targetPackageId')
        ? 'satisfied'
        : 'blocked',
      'App startup readiness and host acknowledgement must target the same package.'
    ),
    createCheck(
      'candidate-identity-consistent',
      readinessCandidateHash !== undefined && readinessCandidateHash === hostCandidateHash ? 'satisfied' : 'blocked',
      'App startup readiness and host acknowledgement must agree on candidate identity.'
    ),
    createCheck(
      'lockfile-hash-consistent',
      readOwnStringField(readinessResult, 'lockfileHash') === readOwnStringField(hostResult, 'lockfileHash')
        ? 'satisfied'
        : 'blocked',
      'App startup readiness and host acknowledgement must agree on lockfile hash.'
    ),
    createCheck(
      'package-summary-consistent',
      arraysEqual(readinessSelected, hostSelected)
        && arraysEqual(readinessBlocked, hostBlocked)
        && arraysEqual(readinessLoadOrder, hostLoadOrder)
        && readOwnNumberField(readinessResult, 'registryCount') === readOwnNumberField(hostResult, 'registryCount')
        && readOwnNumberField(readinessResult, 'entryCount') === readOwnNumberField(hostResult, 'entryCount')
        && readOwnNumberField(readinessResult, 'packageCount') === readOwnNumberField(hostResult, 'packageCount')
        ? 'satisfied'
        : 'blocked',
      'App startup readiness and host acknowledgement must agree on selected/blocked/load-order totals.'
    ),
    createCheck(
      'contained-effects-intact',
      readinessResult !== undefined
        && hostResult !== undefined
        && safeReadyAppStartupReadiness(readinessResult)
        && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
        && pathFree(hostResult, forbiddenHostFields)
        ? 'satisfied'
        : 'blocked',
      'Both sources must remain path-free and must not expose app, host, storage, registry or path handles.'
    )
  ])
}

const allChecksSatisfied = (
  checks: readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionCheck[]
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

const buildEnvelope = (
  platform: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform,
  readinessResult: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEnvelope => {
  const candidateIdentity = cloneCandidateIdentity(
    readOwnDataField(readinessResult, 'candidateIdentity')
  ) as ThirdPartyCandidateIdentitySummary
  return deepFreezeObjectGraph({
    platform,
    targetPackageId: readOwnStringField(readinessResult, 'targetPackageId') as PackageId,
    selectedPackageIds: clonePackageIds(readOwnDataField(readinessResult, 'selectedPackageIds')),
    blockedPackageIds: clonePackageIds(readOwnDataField(readinessResult, 'blockedPackageIds')),
    loadOrder: clonePackageIds(readOwnDataField(readinessResult, 'loadOrder')),
    registryCount: readOwnNumberField(readinessResult, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(readinessResult, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(readinessResult, 'packageCount') ?? 0,
    candidateIdentity,
    candidateHash: readOwnStringField(readinessResult, 'candidateHash') as Sha256Hash | undefined
      ?? candidateIdentity.candidateHash,
    lockfileHash: readOwnStringField(readinessResult, 'lockfileHash') as Sha256Hash,
    appStartupReadinessAccepted: true
  })
}

const effectSummary = (
  status: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineStatus,
  readinessCalled: boolean,
  hostCalled: boolean,
  readinessReady: boolean,
  hostAccepted: boolean,
  readinessResult?: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult,
  hostResult?: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionEffectSummary => {
  const accepted = status === 'accepted'
  const readinessEffects = readOwnDataField(readinessResult, 'effects') as object | undefined
  const hostEffects = readOwnDataField(hostResult, 'effects') as object | undefined
  const realRuntimePublicationCommit = accepted
    && readOwnBooleanField(readinessEffects, 'realRuntimePublicationCommitCalled') === true
    && readOwnBooleanField(readinessEffects, 'runtimePublicationCommitted') === true
  const realAppStartupHostCalled =
    accepted
    && hasSafeMountedAppStartupHostEvidence(hostEffects, hostAccepted)
    && readOwnBooleanField(hostEffects, 'realAppStartupHostCalled') === true
  const realNormalStartupHostCalled =
    accepted && readOwnBooleanField(readinessEffects, 'realNormalStartupHostCalled') === true
  return Object.freeze({
    runtimePublicationCommitAppStartupHostConnectionPipelineCalled: true,
    runtimePublicationCommitAppStartupReadinessPipelineCalled: readinessCalled,
    injectedAppStartupHostCalled: hostCalled,
    appStartupHostCalled: hostCalled,
    appStartupHostAccepted: hostAccepted,
    runtimePublicationCommitAcknowledged: readinessReady,
    postCommitVerificationAcknowledged: readinessReady,
    liveRegistrySwapAcknowledged: readinessReady,
    appFactoryBindingAcknowledged: readinessReady,
    normalStartupHandoffAcknowledged: readinessReady,
    appStartupReadinessAcknowledged: readinessReady,
    appStartupHostWiringAllowed: accepted,
    appBootstrapContinuationAllowed: accepted,
    normalStartupContinuationAllowed: accepted,
    commandContinuationAllowed: accepted,
    uiIpcResultContinuationAllowed: accepted,
    realAppStartupHostCalled,
    realRuntimePublicationCommitCalled: realRuntimePublicationCommit,
    realNormalStartupHostCalled,
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: readinessReady,
    liveRegistryMutated: readinessReady,
    liveRegistrySwapped: readinessReady,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: readinessReady,
    launcherAppFactoryCalled: false,
    gameAppFactoryCalled: false,
    launcherAppCreated: false,
    gameAppCreated: realAppStartupHostCalled
      && readOwnBooleanField(hostEffects, 'gameAppCreated') === true,
    piniaCreated: realAppStartupHostCalled
      && readOwnBooleanField(hostEffects, 'piniaCreated') === true,
    routerMounted: realAppStartupHostCalled
      && readOwnBooleanField(hostEffects, 'routerMounted') === true,
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
    readonly status: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineStatus
    readonly reason: string
    readonly enabled: boolean
    readonly platform?: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPlatform
    readonly readinessCalled: boolean
    readonly hostCalled: boolean
    readonly readinessResult?: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
    readonly hostResult?: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult
    readonly checks?: readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionSafeDiagnostic[]
  }
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult => {
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(options.readinessResult, 'candidateIdentity'))
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.readinessResult, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.readinessResult, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.readinessResult, 'loadOrder'))
  const readinessReady = options.readinessResult !== undefined && safeReadyAppStartupReadiness(options.readinessResult)
  const hostAccepted = readOwnStringField(options.hostResult, 'status') === 'accepted'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_APP_STARTUP_HOST_CONNECTION_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_APP_STARTUP_HOST_CONNECTION_PIPELINE_MODE,
    platform: options.platform,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    runtimeOnly: true,
    persistentWrite: false,
    enabled: options.enabled,
    runtimePublicationCommitAppStartupReadinessSourceCalled: options.readinessCalled,
    appStartupHostConnectionCalled: options.hostCalled,
    appStartupReadinessStatus: readOwnStringField(options.readinessResult, 'status') as
      | ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult['status']
      | undefined,
    appStartupHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult['status']
      | undefined,
    appStartupReadinessAllowed: readinessReady,
    appStartupHostWiringAllowed: options.status === 'accepted',
    appBootstrapContinuationAllowed: options.status === 'accepted',
    normalStartupContinuationAllowed: options.status === 'accepted',
    commandContinuationAllowed: options.status === 'accepted',
    uiIpcResultContinuationAllowed: options.status === 'accepted',
    requestedCommandId: readThirdPartyDataPackEnabledRuntimeCommandId(
      readOwnStringField(options.readinessResult, 'requestedCommandId')
    ),
    targetPackageId: readOwnStringField(options.readinessResult, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    loadOrder,
    registryCount: readOwnNumberField(options.readinessResult, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.readinessResult, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.readinessResult, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity,
    candidateHash: readOwnStringField(options.readinessResult, 'candidateHash') as Sha256Hash | undefined
      ?? candidateIdentity?.candidateHash,
    lockfileHash: readOwnStringField(options.readinessResult, 'lockfileHash') as Sha256Hash | undefined,
    checks: options.checks ?? skippedChecks(options.status === 'blocked' ? 'blocked' : 'skipped'),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary(
      options.status,
      options.readinessCalled,
      options.hostCalled,
      readinessReady,
      hostAccepted,
      options.readinessResult,
      options.hostResult
    )
  })
}

const statusFromReadiness = (
  result: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
): ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineStatus => {
  const status = readOwnStringField(result, 'status')
  if (status === 'deferred') return 'deferred'
  if (status === 'blocked') return 'blocked'
  if (status === 'skipped') return 'skipped'
  return 'blocked'
}

const evaluatePipeline = async(
  options: CreateThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineOptions
): Promise<ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party runtime publication commit app startup host connection is disabled by default',
      enabled: false,
      readinessCalled: false,
      hostCalled: false
    })
  }

  if (options.platform === undefined || !validPlatforms.has(options.platform)) {
    return baseResult({
      status: 'blocked',
      reason: 'app startup host connection requires an explicit Web or Electron platform',
      enabled: true,
      platform: options.platform,
      readinessCalled: false,
      hostCalled: false,
      checks: skippedChecks('blocked'),
      diagnostics: [
        commandDiagnostic('third-party.runtime-publication-commit-app-startup-host.missing-platform')
      ]
    })
  }

  const readReadiness = options.readRuntimePublicationCommitAppStartupReadiness
    ?? createThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipeline({
      ...options,
      enabled: true
    })

  let readinessResult: ThirdPartyDataPackRuntimePublicationCommitAppStartupReadinessPipelineResult
  try {
    readinessResult = await readReadiness()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'app startup readiness failed before returning a safe result',
      enabled: true,
      platform: options.platform,
      readinessCalled: true,
      hostCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.runtime-publication-commit-app-startup-host.readiness-source-failed')
      ]
    })
  }

  if (!safeReadyAppStartupReadiness(readinessResult)) {
    const status = statusFromReadiness(readinessResult)
    return baseResult({
      status,
      reason: 'app startup host connection is waiting for ready app-startup readiness',
      enabled: true,
      platform: options.platform,
      readinessCalled: true,
      hostCalled: false,
      readinessResult,
      checks: pendingHostChecks(options.platform, readinessResult),
      diagnostics: [
        ...sourceDiagnostics(readinessResult, undefined),
        ...(status === 'blocked'
          ? [
              commandDiagnostic(
                'third-party.runtime-publication-commit-app-startup-host.unsafe-readiness-source',
                readOwnStringField(readinessResult, 'targetPackageId') as PackageId | undefined
              )
            ]
          : [])
      ]
    })
  }

  if (options.acknowledgeAppStartupHostWiring === undefined) {
    return baseResult({
      status: 'deferred',
      reason: 'app startup readiness is ready and waiting for an injected Web/Electron app startup host acknowledgement',
      enabled: true,
      platform: options.platform,
      readinessCalled: true,
      hostCalled: false,
      readinessResult,
      checks: pendingHostChecks(options.platform, readinessResult),
      diagnostics: sourceDiagnostics(readinessResult, undefined)
    })
  }

  let hostResult: ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionHostResult
  try {
    hostResult = await options.acknowledgeAppStartupHostWiring(buildEnvelope(options.platform, readinessResult))
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'app startup host acknowledgement failed before returning a safe result',
      enabled: true,
      platform: options.platform,
      readinessCalled: true,
      hostCalled: true,
      readinessResult,
      diagnostics: [
        ...sourceDiagnostics(readinessResult, undefined),
        commandDiagnostic(
          'third-party.runtime-publication-commit-app-startup-host.host-failed',
          readOwnStringField(readinessResult, 'targetPackageId') as PackageId | undefined
        )
      ]
    })
  }

  const checks = createChecks(options.platform, readinessResult, hostResult)
  const diagnostics = sourceDiagnostics(readinessResult, hostResult)
  if (allChecksSatisfied(checks)) {
    return baseResult({
      status: 'accepted',
      reason: 'app startup host connection accepted a Web/Electron path-free host acknowledgement after app-startup readiness',
      enabled: true,
      platform: options.platform,
      readinessCalled: true,
      hostCalled: true,
      readinessResult,
      hostResult,
      checks,
      diagnostics
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'app startup readiness and host acknowledgement require matching path-free summaries',
    enabled: true,
    platform: options.platform,
    readinessCalled: true,
    hostCalled: true,
    readinessResult,
    hostResult,
    checks,
    diagnostics: [
      ...diagnostics,
      ...(!pathFree(hostResult, forbiddenHostFields)
        || !hostEffectsContained(
          readOwnDataField(hostResult, 'effects') as object | undefined,
          readOwnStringField(hostResult, 'status') === 'accepted'
        )
        ? [
            commandDiagnostic(
              'third-party.runtime-publication-commit-app-startup-host.unsafe-host-result',
              readOwnStringField(readinessResult, 'targetPackageId') as PackageId | undefined
            )
          ]
        : []),
      commandDiagnostic(
        'third-party.runtime-publication-commit-app-startup-host.summary-mismatch',
        readOwnStringField(readinessResult, 'targetPackageId') as PackageId | undefined
      )
    ]
  })
}

export const createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline = (
  options: CreateThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipelineResult>) =>
  () => evaluatePipeline(options)

export const thirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline =
  createThirdPartyDataPackRuntimePublicationCommitAppStartupHostConnectionPipeline()
