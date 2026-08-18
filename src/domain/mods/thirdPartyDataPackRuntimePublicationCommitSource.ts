import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId,
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult,
  ThirdPartyDataPackRuntimePublicationCommitStageId
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_SOURCE_KIND =
  'third-party-runtime-publication-commit-source'
export const THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_SOURCE_MODE =
  'default-disabled-runtime-publication-commit-source'

export type ThirdPartyDataPackRuntimePublicationCommitSourceStatus =
  | 'accepted'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackRuntimePublicationCommitHostStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackRuntimePublicationCommitSourceStageSummary {
  readonly id: ThirdPartyDataPackRuntimePublicationCommitStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
}

export interface ThirdPartyDataPackRuntimePublicationCommitSourceEffectSummary {
  readonly runtimePublicationCommitSourceCalled: boolean
  readonly runtimePublicationCommitAdapterSourceCalled: boolean
  readonly injectedRuntimePublicationCommitHostCalled: boolean
  readonly runtimePublicationCommitHostCalled: boolean
  readonly runtimePublicationCommitHostAccepted: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly realRuntimePublicationCommitCalled: false
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
  readonly postCommitVerificationExecuted: false
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

export interface ThirdPartyDataPackRuntimePublicationCommitSourceSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackRuntimePublicationCommitHostEnvelope {
  readonly requestedCommandId: 'install'
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly commitStageSummaries: readonly ThirdPartyDataPackRuntimePublicationCommitSourceStageSummary[]
  readonly requiredCommitAdapterIds: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId[]
}

export interface ThirdPartyDataPackRuntimePublicationCommitHostEffectSummary {
  readonly runtimePublicationCommitHostCalled: boolean
  readonly runtimePublicationCommitHostAccepted: boolean
  readonly realRuntimePublicationCommitCalled: false
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly transactionCommitted: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecuted: false
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

export interface ThirdPartyDataPackRuntimePublicationCommitHostResult {
  readonly status: ThirdPartyDataPackRuntimePublicationCommitHostStatus
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds?: readonly PackageId[]
  readonly blockedPackageIds?: readonly PackageId[]
  readonly blockedCandidatePaths?: readonly string[]
  readonly loadOrder?: readonly PackageId[]
  readonly registryCount?: number
  readonly entryCount?: number
  readonly packageCount?: number
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly runtimePublicationCommitAdapterStatus?: ThirdPartyDataPackRuntimePublicationCommitAdapterResult['status']
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackRuntimePublicationCommitHostEffectSummary
}

export interface ThirdPartyDataPackRuntimePublicationCommitSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_SOURCE_MODE
  readonly status: ThirdPartyDataPackRuntimePublicationCommitSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly runtimePublicationCommitHostStatus?: ThirdPartyDataPackRuntimePublicationCommitHostStatus
  readonly injectedRuntimePublicationHostMode?: 'injected-test-only'
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly runtimePublicationCommitAdapterStatus?: ThirdPartyDataPackRuntimePublicationCommitAdapterResult['status']
  readonly runtimePublicationPreflightStatus?: ThirdPartyDataPackRuntimePublicationCommitAdapterResult['runtimePublicationPreflightStatus']
  readonly transactionPreCommitPlanStatus?: ThirdPartyDataPackRuntimePublicationCommitAdapterResult['transactionPreCommitPlanStatus']
  readonly liveRegistrySwapProtectionStatus?: ThirdPartyDataPackRuntimePublicationCommitAdapterResult['liveRegistrySwapProtectionStatus']
  readonly publicationRollbackRecoveryStatus?: ThirdPartyDataPackRuntimePublicationCommitAdapterResult['publicationRollbackRecoveryStatus']
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly commitStageSummaries: readonly ThirdPartyDataPackRuntimePublicationCommitSourceStageSummary[]
  readonly requiredCommitAdapterIds: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId[]
  readonly diagnostics: readonly ThirdPartyDataPackRuntimePublicationCommitSourceSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackRuntimePublicationCommitSourceEffectSummary
}

export interface CreateThirdPartyDataPackRuntimePublicationCommitSourceOptions {
  readonly enabled?: boolean
  readonly readRuntimePublicationCommitAdapter?: () => Awaitable<ThirdPartyDataPackRuntimePublicationCommitAdapterResult>
  readonly acknowledgeRuntimePublicationCommit?: (
    envelope: ThirdPartyDataPackRuntimePublicationCommitHostEnvelope
  ) => Awaitable<ThirdPartyDataPackRuntimePublicationCommitHostResult>
}

export class ThirdPartyDataPackRuntimePublicationCommitBlockedError extends Error {
  readonly result: ThirdPartyDataPackRuntimePublicationCommitSourceResult

  constructor(result: ThirdPartyDataPackRuntimePublicationCommitSourceResult) {
    super('third-party runtime publication commit blocked command continuation')
    this.name = 'ThirdPartyDataPackRuntimePublicationCommitBlockedError'
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

const forbiddenRuntimePublicationCommitSourceFields = [
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
  'programDirectoryPath',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

const forbiddenRuntimePublicationCommitHostFields = [
  'runtimePublicationCommitAdapter',
  'runtimePublicationPreflight',
  'transactionPreCommitPlan',
  'liveRegistrySwapProtection',
  'publicationRollbackRecovery',
  'publicationEnvelope',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'runtimePublicationCommitHost',
  'runtimePublicationHost',
  'realRuntimePublicationHost',
  'liveRegistry',
  'liveRegistryReference',
  'registrySet',
  'previousRegistry',
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

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackRuntimePublicationCommitSourceSafeDiagnostic => {
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
      ?? 'third-party.runtime-publication-commit-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackRuntimePublicationCommitSourceSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackRuntimePublicationCommitSourceSafeDiagnostic[] = []
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
): ThirdPartyDataPackRuntimePublicationCommitSourceSafeDiagnostic => Object.freeze({
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

const safeStageSummaries = (
  stages: readonly unknown[] | undefined
): readonly ThirdPartyDataPackRuntimePublicationCommitSourceStageSummary[] => {
  if (!Array.isArray(stages)) return Object.freeze([])
  const length = readArrayLength(stages)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackRuntimePublicationCommitSourceStageSummary[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(stages, String(index))
    } catch {
      continue
    }
    if (
      descriptor?.enumerable === true
      && 'value' in descriptor
      && descriptor.value !== null
      && typeof descriptor.value === 'object'
    ) {
      const id = readOwnStringField(descriptor.value, 'id') as ThirdPartyDataPackRuntimePublicationCommitStageId | undefined
      const status = readOwnStringField(descriptor.value, 'status') as
        | ThirdPartyDataPackRuntimePublicationCommitSourceStageSummary['status']
        | undefined
      if (id !== undefined && status !== undefined) {
        result.push(Object.freeze({ id, status }))
      }
    }
  }
  return Object.freeze(result)
}

const safeRequiredCommitAdapterIds = (
  adapters: readonly unknown[] | undefined
): readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId[] => {
  if (!Array.isArray(adapters)) return Object.freeze([])
  const length = readArrayLength(adapters)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(adapters, String(index))
    } catch {
      continue
    }
    if (
      descriptor?.enumerable === true
      && 'value' in descriptor
      && descriptor.value !== null
      && typeof descriptor.value === 'object'
    ) {
      const id = readOwnStringField(descriptor.value, 'id')
      if (id !== undefined) result.push(id as ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId)
    }
  }
  return Object.freeze(result)
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

const noRuntimePublicationOrWriteDrift = (
  source: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => readOwnBooleanField(source, 'commitAllowed') === false
  && readOwnBooleanField(source, 'publicationAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'liveRegistryMutable') === false
  && readOwnBooleanField(source, 'rollbackExecutionAllowed') === false
  && everyOwnDataValueFalse(readOwnDataField(source, 'effects') as object | undefined)

const pathFreeRuntimePublicationCommitSource = (
  source: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => forbiddenRuntimePublicationCommitSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const safeSkippedSource = (
  source: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noRuntimePublicationOrWriteDrift(source)
  && pathFreeRuntimePublicationCommitSource(source)

const safeDeferredSource = (
  source: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => readOwnStringField(source, 'status') === 'deferred'
  && readOwnStringField(source, 'runtimePublicationPreflightStatus') === 'deferred'
  && readOwnStringField(source, 'transactionPreCommitPlanStatus') === 'deferred'
  && readOwnStringField(source, 'liveRegistrySwapProtectionStatus') === 'deferred'
  && readOwnStringField(source, 'publicationRollbackRecoveryStatus') === 'deferred'
  && cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined
  && readOwnStringField(source, 'lockfileHash') !== undefined
  && noRuntimePublicationOrWriteDrift(source)
  && pathFreeRuntimePublicationCommitSource(source)

const pathFreeRuntimePublicationCommitHostResult = (
  hostResult: ThirdPartyDataPackRuntimePublicationCommitHostResult
): boolean => forbiddenRuntimePublicationCommitHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const hostEffectsContained = (
  effects: object | undefined,
  accepted: boolean
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
    if (key === 'runtimePublicationCommitHostCalled') return descriptor.value === true
    if (key === 'runtimePublicationCommitHostAccepted') return descriptor.value === accepted
    return descriptor.value === false
  })
}

const safeAcceptedHostResult = (
  source: ThirdPartyDataPackRuntimePublicationCommitAdapterResult,
  hostResult: ThirdPartyDataPackRuntimePublicationCommitHostResult
): boolean => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  return candidateIdentity !== undefined
    && readOwnStringField(hostResult, 'status') === 'accepted'
    && readOwnStringField(hostResult, 'requestedCommandId') === 'install'
    && readOwnStringField(hostResult, 'targetPackageId') === selectedPackageIds[0]
    && arraysEqual(clonePackageIds(readOwnDataField(hostResult, 'selectedPackageIds')), selectedPackageIds)
    && arraysEqual(clonePackageIds(readOwnDataField(hostResult, 'blockedPackageIds')), blockedPackageIds)
    && arraysEqual(cloneStringList(readOwnDataField(hostResult, 'blockedCandidatePaths')), blockedCandidatePaths)
    && arraysEqual(clonePackageIds(readOwnDataField(hostResult, 'loadOrder')), loadOrder)
    && readOwnNumberField(hostResult, 'registryCount') === readOwnNumberField(source, 'registryCount')
    && readOwnNumberField(hostResult, 'entryCount') === readOwnNumberField(source, 'entryCount')
    && readOwnNumberField(hostResult, 'packageCount') === readOwnNumberField(source, 'packageCount')
    && readOwnStringField(hostResult, 'candidateHash') === candidateIdentity.candidateHash
    && readOwnStringField(hostResult, 'lockfileHash') === readOwnStringField(source, 'lockfileHash')
    && readOwnStringField(hostResult, 'runtimePublicationCommitAdapterStatus') === 'deferred'
    && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
    && pathFreeRuntimePublicationCommitHostResult(hostResult)
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
  continuationAllowed: boolean,
  hostCalled = false,
  hostAccepted = false
): ThirdPartyDataPackRuntimePublicationCommitSourceEffectSummary => Object.freeze({
  runtimePublicationCommitSourceCalled: true,
  runtimePublicationCommitAdapterSourceCalled: sourceCalled,
  injectedRuntimePublicationCommitHostCalled: hostCalled,
  runtimePublicationCommitHostCalled: hostCalled,
  runtimePublicationCommitHostAccepted: hostAccepted,
  appBootstrapContinuationAllowed: continuationAllowed,
  commandContinuationAllowed: continuationAllowed,
  realRuntimePublicationCommitCalled: false,
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
  postCommitVerificationExecuted: false,
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
    readonly status: ThirdPartyDataPackRuntimePublicationCommitSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
    readonly hostResult?: ThirdPartyDataPackRuntimePublicationCommitHostResult
    readonly hostCalled?: boolean
    readonly diagnostics?: readonly ThirdPartyDataPackRuntimePublicationCommitSourceSafeDiagnostic[]
  }
): ThirdPartyDataPackRuntimePublicationCommitSourceResult => {
  const continuationAllowed = options.status !== 'blocked'
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const targetPackageId = selectedPackageIds[0]
  const hostStatus = readOwnStringField(options.hostResult, 'status') as
    | ThirdPartyDataPackRuntimePublicationCommitHostStatus
    | undefined

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_RUNTIME_PUBLICATION_COMMIT_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
    runtimePublicationCommitHostStatus: hostStatus,
    injectedRuntimePublicationHostMode: options.hostResult === undefined ? undefined : 'injected-test-only',
    requestedCommandId: targetPackageId === undefined ? undefined : 'install',
    targetPackageId,
    runtimePublicationCommitAdapterStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackRuntimePublicationCommitAdapterResult['status']
      | undefined,
    runtimePublicationPreflightStatus: readOwnStringField(options.source, 'runtimePublicationPreflightStatus') as
      | ThirdPartyDataPackRuntimePublicationCommitAdapterResult['runtimePublicationPreflightStatus']
      | undefined,
    transactionPreCommitPlanStatus: readOwnStringField(options.source, 'transactionPreCommitPlanStatus') as
      | ThirdPartyDataPackRuntimePublicationCommitAdapterResult['transactionPreCommitPlanStatus']
      | undefined,
    liveRegistrySwapProtectionStatus: readOwnStringField(options.source, 'liveRegistrySwapProtectionStatus') as
      | ThirdPartyDataPackRuntimePublicationCommitAdapterResult['liveRegistrySwapProtectionStatus']
      | undefined,
    publicationRollbackRecoveryStatus: readOwnStringField(options.source, 'publicationRollbackRecoveryStatus') as
      | ThirdPartyDataPackRuntimePublicationCommitAdapterResult['publicationRollbackRecoveryStatus']
      | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidatePaths,
    loadOrder,
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(options.source, 'candidateIdentity')),
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    commitStageSummaries: safeStageSummaries(readOwnDataField(options.source, 'commitStages') as readonly unknown[] | undefined),
    requiredCommitAdapterIds: safeRequiredCommitAdapterIds(
      readOwnDataField(options.source, 'requiredCommitAdapters') as readonly unknown[] | undefined
    ),
    diagnostics,
    effects: effectSummary(
      options.sourceCalled,
      continuationAllowed,
      options.hostCalled === true,
      hostStatus === 'accepted'
    )
  })
}

const buildRuntimePublicationCommitHostEnvelope = (
  source: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): ThirdPartyDataPackRuntimePublicationCommitHostEnvelope | undefined => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const targetPackageId = selectedPackageIds[0]
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  const lockfileHash = readOwnStringField(source, 'lockfileHash') as Sha256Hash | undefined
  if (targetPackageId === undefined || candidateIdentity === undefined || lockfileHash === undefined) return undefined

  return deepFreezeObjectGraph({
    requestedCommandId: 'install',
    targetPackageId,
    selectedPackageIds,
    blockedPackageIds: clonePackageIds(readOwnDataField(source, 'blockedPackageIds')),
    blockedCandidatePaths: cloneStringList(readOwnDataField(source, 'blockedCandidatePaths')),
    loadOrder: clonePackageIds(readOwnDataField(source, 'loadOrder')),
    registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(source, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity,
    lockfileHash,
    commitStageSummaries: safeStageSummaries(readOwnDataField(source, 'commitStages') as readonly unknown[] | undefined),
    requiredCommitAdapterIds: safeRequiredCommitAdapterIds(
      readOwnDataField(source, 'requiredCommitAdapters') as readonly unknown[] | undefined
    )
  })
}

const evaluateRuntimePublicationCommitSource = async(
  options: CreateThirdPartyDataPackRuntimePublicationCommitSourceOptions
): Promise<ThirdPartyDataPackRuntimePublicationCommitSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party runtime publication commit source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readRuntimePublicationCommitAdapter === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party runtime publication commit source is enabled without a commit adapter source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.runtime-publication-commit-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
  try {
    source = await options.readRuntimePublicationCommitAdapter()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party runtime publication commit adapter source failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.runtime-publication-commit-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party runtime publication commit is not required because commit adapter was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))[0]
  if (safeDeferredSource(source)) {
    const envelope = buildRuntimePublicationCommitHostEnvelope(source)
    if (options.acknowledgeRuntimePublicationCommit === undefined || envelope === undefined) {
      return baseResult({
        status: 'blocked',
        reason: 'third-party runtime publication commit requires an injected path-free host acknowledgement before command continuation may proceed',
        enabled: true,
        sourceCalled: true,
        source,
        diagnostics: [
          ...sourceDiagnostics,
          commandDiagnostic(
            'third-party.runtime-publication-commit-source.missing-host',
            targetPackageId
          ),
          commandDiagnostic(
            'third-party.runtime-publication-commit-source.commit-blocked',
            targetPackageId
          )
        ]
      })
    }

    let hostResult: ThirdPartyDataPackRuntimePublicationCommitHostResult
    try {
      hostResult = await options.acknowledgeRuntimePublicationCommit(envelope)
    } catch {
      return baseResult({
        status: 'blocked',
        reason: 'injected runtime publication commit host failed before acknowledgement',
        enabled: true,
        sourceCalled: true,
        source,
        hostCalled: true,
        diagnostics: [
          ...sourceDiagnostics,
          commandDiagnostic(
            'third-party.runtime-publication-commit-source.host-failed',
            targetPackageId
          ),
          commandDiagnostic(
            'third-party.runtime-publication-commit-source.commit-blocked',
            targetPackageId
          )
        ]
      })
    }

    const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
    if (safeAcceptedHostResult(source, hostResult)) {
      return baseResult({
        status: 'accepted',
        reason: 'runtime publication commit source accepted an injected path-free host acknowledgement',
        enabled: true,
        sourceCalled: true,
        source,
        hostResult,
        hostCalled: true,
        diagnostics: [
          ...sourceDiagnostics,
          ...hostDiagnostics
        ]
      })
    }

    return baseResult({
      status: 'blocked',
      reason: 'injected runtime publication commit host returned an unsafe acknowledgement',
      enabled: true,
      sourceCalled: true,
      source,
      hostResult,
      hostCalled: true,
      diagnostics: [
        ...sourceDiagnostics,
        ...hostDiagnostics,
        commandDiagnostic(
          'third-party.runtime-publication-commit-source.unsafe-host-result',
          targetPackageId
        ),
        commandDiagnostic(
          'third-party.runtime-publication-commit-source.commit-blocked',
          targetPackageId
        )
      ]
    })
  }

  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeRuntimePublicationCommitSource(source) || !noRuntimePublicationOrWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.runtime-publication-commit-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.runtime-publication-commit-source.commit-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party runtime publication commit requires a future explicit real-host publication boundary before command continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackRuntimePublicationCommitSource = (
  options: CreateThirdPartyDataPackRuntimePublicationCommitSourceOptions = {}
): (() => Promise<ThirdPartyDataPackRuntimePublicationCommitSourceResult>) => async() => {
  const result = await evaluateRuntimePublicationCommitSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackRuntimePublicationCommitBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackRuntimePublicationCommitSource =
  createThirdPartyDataPackRuntimePublicationCommitSource()
