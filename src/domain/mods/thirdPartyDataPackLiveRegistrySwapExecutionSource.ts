import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId,
  ThirdPartyDataPackLiveRegistrySwapProtectionResult
} from './thirdPartyDataPackLiveRegistrySwapProtection'
import {
  isThirdPartyDataPackRuntimeCommandId,
  runtimeCommandTargetMatchesPackageState,
  runtimeCommandTargetPackageId,
  type ThirdPartyDataPackRuntimeCommandId
} from './thirdPartyDataPackRuntimeCommandState'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_LIVE_REGISTRY_SWAP_EXECUTION_SOURCE_KIND =
  'third-party-live-registry-swap-execution-source'
export const THIRD_PARTY_DATA_PACK_LIVE_REGISTRY_SWAP_EXECUTION_SOURCE_MODE =
  'default-disabled-live-registry-swap-execution-source'

export type ThirdPartyDataPackLiveRegistrySwapExecutionSourceStatus =
  | 'swapped'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackLiveRegistrySwapHostStatus =
  | 'swapped'
  | 'blocked'

export interface ThirdPartyDataPackLiveRegistrySwapExecutionHostEnvelope {
  readonly requestedCommandId: ThirdPartyDataPackRuntimeCommandId
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
  readonly liveRegistrySwap: 'deferred'
  readonly requiredProtectionIds: readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId[]
}

export interface ThirdPartyDataPackLiveRegistrySwapHostEffectSummary {
  readonly liveRegistrySwapHostCalled: boolean
  readonly liveRegistrySwapHostAccepted: boolean
  readonly thirdPartyRegistryPublished: boolean
  readonly liveRegistryMutated: boolean
  readonly liveRegistrySwapped: boolean
  readonly runtimeEnablementAllowed: boolean
  readonly officialRegistryPublished: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
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

export interface ThirdPartyDataPackLiveRegistrySwapHostResult {
  readonly status: ThirdPartyDataPackLiveRegistrySwapHostStatus
  readonly requestedCommandId?: ThirdPartyDataPackRuntimeCommandId
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
  readonly protectionStatus?: ThirdPartyDataPackLiveRegistrySwapProtectionResult['status']
  readonly requiredProtectionIds?: readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId[]
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackLiveRegistrySwapHostEffectSummary
}

export interface ThirdPartyDataPackLiveRegistrySwapExecutionSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackLiveRegistrySwapExecutionEffectSummary {
  readonly liveRegistrySwapExecutionSourceCalled: boolean
  readonly liveRegistrySwapProtectionSourceCalled: boolean
  readonly injectedLiveRegistrySwapHostCalled: boolean
  readonly liveRegistrySwapHostCalled: boolean
  readonly liveRegistrySwapHostAccepted: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly thirdPartyRegistryPublished: boolean
  readonly liveRegistryMutated: boolean
  readonly liveRegistrySwapped: boolean
  readonly runtimeEnablementAllowed: boolean
  readonly officialRegistryPublished: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
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

export interface ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_LIVE_REGISTRY_SWAP_EXECUTION_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_LIVE_REGISTRY_SWAP_EXECUTION_SOURCE_MODE
  readonly status: ThirdPartyDataPackLiveRegistrySwapExecutionSourceStatus
  readonly reason: string
  readonly runtimeOnly: true
  readonly persistentWrite: false
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly liveRegistrySwapProtectionStatus?: ThirdPartyDataPackLiveRegistrySwapProtectionResult['status']
  readonly liveRegistrySwapHostStatus?: ThirdPartyDataPackLiveRegistrySwapHostStatus
  readonly requestedCommandId?: ThirdPartyDataPackRuntimeCommandId
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly officialIdentity?: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly requiredProtectionIds: readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId[]
  readonly diagnostics: readonly ThirdPartyDataPackLiveRegistrySwapExecutionSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackLiveRegistrySwapExecutionEffectSummary
}

export interface CreateThirdPartyDataPackLiveRegistrySwapExecutionSourceOptions {
  readonly enabled?: boolean
  readonly readLiveRegistrySwapProtection?: () => Awaitable<ThirdPartyDataPackLiveRegistrySwapProtectionResult>
  readonly executeLiveRegistrySwap?: (
    envelope: ThirdPartyDataPackLiveRegistrySwapExecutionHostEnvelope
  ) => Awaitable<ThirdPartyDataPackLiveRegistrySwapHostResult>
}

export class ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError extends Error {
  readonly result: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult

  constructor(result: ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult) {
    super('third-party live registry swap execution blocked command continuation')
    this.name = 'ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError'
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

const requiredProtectionIds: readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId[] = Object.freeze([
  'single-assignment-live-registry-reference',
  'previous-registry-identity-retention',
  'candidate-artifact-visibility-barrier',
  'post-swap-verification',
  'rollback-restore-diagnostics'
])

const forbiddenProtectionSourceFields = [
  'runtimePublicationPreflight',
  'transactionPreCommitPlan',
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

const forbiddenHostFields = [
  'liveRegistry',
  'liveRegistryReference',
  'previousRegistry',
  'candidateRegistry',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
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

const readOwnNumberField = (
  value: unknown,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isSafeInteger(field) && field >= 0 ? field : undefined
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

const cloneStringList = (value: unknown): readonly string[] => {
  if (!Array.isArray(value)) return Object.freeze([])
  const length = readArrayLength(value)
  if (length === undefined) return Object.freeze([])
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
  return Object.freeze(result)
}

const clonePackageIds = (value: unknown): readonly PackageId[] =>
  cloneStringList(value) as readonly PackageId[]

const readRuntimeCommandId = (
  value: unknown,
  selectedPackageIds: readonly PackageId[],
  blockedPackageIds: readonly PackageId[]
): ThirdPartyDataPackRuntimeCommandId | undefined => {
  const commandId = readOwnStringField(value, 'requestedCommandId')
  if (isThirdPartyDataPackRuntimeCommandId(commandId)) return commandId
  if (selectedPackageIds.length > 0 && blockedPackageIds.length === 0) return 'install'
  return undefined
}

const cloneRequiredProtectionIds = (
  value: unknown
): readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId[] => {
  if (!Array.isArray(value)) return Object.freeze([])
  const length = readArrayLength(value)
  if (length === undefined) return Object.freeze([])
  const result: ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId[] = []
  for (let index = 0; index < length; index += 1) {
    const currentValue = readOwnDataField(value, String(index))
    if (
      typeof currentValue === 'object'
      && currentValue !== null
    ) {
      const id = readOwnStringField(currentValue, 'id')
      if (requiredProtectionIds.includes(id as ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId)) {
        result.push(id as ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId)
      }
    } else if (typeof currentValue === 'string') {
      if (requiredProtectionIds.includes(currentValue as ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId)) {
        result.push(currentValue as ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId)
      }
    }
  }
  return Object.freeze(result)
}

const hasAllRequiredProtectionIds = (
  value: readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId[]
): boolean => requiredProtectionIds.every(currentId => value.includes(currentId))

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const safeDiagnostic = (
  diagnostic: unknown
): ThirdPartyDataPackLiveRegistrySwapExecutionSafeDiagnostic | undefined => {
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  if (!diagnosticSeverities.has(severity as ModDiagnosticSeverity)) return undefined
  if (!diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)) return undefined

  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  const ruleId = readOwnStringField(diagnostic, 'ruleId') ?? code
  return Object.freeze({
    code,
    ruleId,
    severity: severity as ModDiagnosticSeverity,
    stage: readOwnStringField(diagnostic, 'stage')
      ?? 'third-party.live-registry-swap-execution-source.diagnostic-copy',
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? 'mods.error.lifecycle.transaction.001',
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined,
    recovery: recovery as ModDiagnosticRecovery
  })
}

const safeDiagnostics = (
  diagnostics: readonly unknown[] | undefined
): readonly ThirdPartyDataPackLiveRegistrySwapExecutionSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])
  const result: ThirdPartyDataPackLiveRegistrySwapExecutionSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    const copied = safeDiagnostic(readOwnDataField(diagnostics, String(index)))
    if (copied) result.push(copied)
  }
  return Object.freeze(result)
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackLiveRegistrySwapExecutionSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

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
    formatVersion,
    contentHash: contentHash as Sha256Hash,
    snapshotHash: snapshotHash as Sha256Hash,
    candidateHash: candidateHash as Sha256Hash
  })
}

const cloneOfficialIdentity = (
  value: unknown
): ThirdPartyCandidateOfficialIdentitySummary | undefined => {
  const artifactHash = readOwnStringField(value, 'artifactHash')
  const contentHash = readOwnStringField(value, 'contentHash')
  const schemaSetHash = readOwnStringField(value, 'schemaSetHash')
  const environmentHash = readOwnStringField(value, 'environmentHash')
  const snapshotHash = readOwnStringField(value, 'snapshotHash')
  const registryCount = readOwnNumberField(value, 'registryCount')
  const entryCount = readOwnNumberField(value, 'entryCount')
  if (
    artifactHash === undefined
    || contentHash === undefined
    || schemaSetHash === undefined
    || environmentHash === undefined
    || snapshotHash === undefined
    || registryCount === undefined
    || entryCount === undefined
  ) {
    return undefined
  }
  return Object.freeze({
    artifactHash: artifactHash as Sha256Hash,
    contentHash: contentHash as Sha256Hash,
    schemaSetHash: schemaSetHash as Sha256Hash,
    environmentHash: environmentHash as Sha256Hash,
    snapshotHash: snapshotHash as Sha256Hash,
    registryCount,
    entryCount
  })
}

const hasOwnEnumerableField = (value: object, fieldName: string): boolean => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return true
  }
  return descriptor?.enumerable === true
}

const pathFreeProtectionSource = (
  source: ThirdPartyDataPackLiveRegistrySwapProtectionResult
): boolean => forbiddenProtectionSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const pathFreeHostResult = (
  hostResult: ThirdPartyDataPackLiveRegistrySwapHostResult
): boolean => forbiddenHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

const everyOwnDataValueFalse = (value: object | undefined): boolean => {
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

const protectionChecksSatisfied = (
  source: ThirdPartyDataPackLiveRegistrySwapProtectionResult
): boolean => {
  const checks = readOwnDataField(source, 'protectionChecks')
  if (!Array.isArray(checks)) return false
  const length = readArrayLength(checks)
  if (length === undefined || length === 0) return false
  for (let index = 0; index < length; index += 1) {
    if (readOwnStringField(readOwnDataField(checks, String(index)), 'status') !== 'satisfied') return false
  }
  return true
}

const safeSkippedProtection = (
  source: ThirdPartyDataPackLiveRegistrySwapProtectionResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && everyOwnDataValueFalse(readOwnDataField(source, 'effects') as object | undefined)
  && pathFreeProtectionSource(source)

const safeDeferredProtection = (
  source: ThirdPartyDataPackLiveRegistrySwapProtectionResult
): boolean => readOwnStringField(source, 'status') === 'deferred'
  && readOwnStringField(source, 'liveRegistrySwap') === 'deferred'
  && readOwnDataField(source, 'swapAllowed') === false
  && readOwnDataField(source, 'liveRegistryMutable') === false
  && cloneOfficialIdentity(readOwnDataField(source, 'officialIdentity')) !== undefined
  && cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined
  && readOwnStringField(source, 'lockfileHash') !== undefined
  && protectionChecksSatisfied(source)
  && hasAllRequiredProtectionIds(cloneRequiredProtectionIds(readOwnDataField(source, 'requiredProtections')))
  && everyOwnDataValueFalse(readOwnDataField(source, 'effects') as object | undefined)
  && pathFreeProtectionSource(source)

const hostEffectsContained = (
  effects: object | undefined,
  swapped: boolean,
  commandId: ThirdPartyDataPackRuntimeCommandId
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
    if (key === 'liveRegistrySwapHostCalled') return descriptor.value === true
    if (key === 'liveRegistrySwapHostAccepted') return descriptor.value === swapped
    if (key === 'thirdPartyRegistryPublished') {
      return descriptor.value === (swapped && (commandId === 'install' || commandId === 'enable'))
    }
    if (key === 'liveRegistryMutated') return descriptor.value === swapped
    if (key === 'liveRegistrySwapped') return descriptor.value === swapped
    if (key === 'runtimeEnablementAllowed') return descriptor.value === swapped
    return descriptor.value === false
  })
}

const safeSwappedHostResult = (
  source: ThirdPartyDataPackLiveRegistrySwapProtectionResult,
  hostResult: ThirdPartyDataPackLiveRegistrySwapHostResult
): boolean => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(source, 'loadOrder'))
  const requestedCommandId = readRuntimeCommandId(source, selectedPackageIds, blockedPackageIds)
  const targetPackageId = runtimeCommandTargetPackageId(
    requestedCommandId,
    selectedPackageIds,
    blockedPackageIds,
    readOwnStringField(hostResult, 'targetPackageId') as PackageId | undefined
  )
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  const requiredIds = cloneRequiredProtectionIds(readOwnDataField(source, 'requiredProtections'))
  return candidateIdentity !== undefined
    && readOwnStringField(hostResult, 'status') === 'swapped'
    && requestedCommandId !== undefined
    && readOwnStringField(hostResult, 'requestedCommandId') === requestedCommandId
    && readOwnStringField(hostResult, 'targetPackageId') === targetPackageId
    && runtimeCommandTargetMatchesPackageState(
      requestedCommandId,
      targetPackageId,
      selectedPackageIds,
      blockedPackageIds,
      loadOrder
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'selectedPackageIds')),
      selectedPackageIds
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'blockedPackageIds')),
      blockedPackageIds
    )
    && arraysEqual(
      cloneStringList(readOwnDataField(hostResult, 'blockedCandidatePaths')),
      cloneStringList(readOwnDataField(source, 'blockedCandidatePaths'))
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'loadOrder')),
      loadOrder
    )
    && readOwnNumberField(hostResult, 'registryCount') === readOwnNumberField(source, 'registryCount')
    && readOwnNumberField(hostResult, 'entryCount') === readOwnNumberField(source, 'entryCount')
    && readOwnNumberField(hostResult, 'packageCount') === readOwnNumberField(source, 'packageCount')
    && readOwnStringField(hostResult, 'candidateHash') === candidateIdentity.candidateHash
    && readOwnStringField(hostResult, 'lockfileHash') === readOwnStringField(source, 'lockfileHash')
    && readOwnStringField(hostResult, 'protectionStatus') === 'deferred'
    && arraysEqual(cloneRequiredProtectionIds(readOwnDataField(hostResult, 'requiredProtectionIds')), requiredIds)
    && hostEffectsContained(
      readOwnDataField(hostResult, 'effects') as object | undefined,
      true,
      requestedCommandId
    )
    && pathFreeHostResult(hostResult)
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
  commandId: ThirdPartyDataPackRuntimeCommandId | undefined,
  hostCalled = false,
  hostAccepted = false
): ThirdPartyDataPackLiveRegistrySwapExecutionEffectSummary => Object.freeze({
  liveRegistrySwapExecutionSourceCalled: true,
  liveRegistrySwapProtectionSourceCalled: sourceCalled,
  injectedLiveRegistrySwapHostCalled: hostCalled,
  liveRegistrySwapHostCalled: hostCalled,
  liveRegistrySwapHostAccepted: hostAccepted,
  appBootstrapContinuationAllowed: continuationAllowed,
  commandContinuationAllowed: continuationAllowed,
  thirdPartyRegistryPublished: hostAccepted && (commandId === 'install' || commandId === 'enable'),
  liveRegistryMutated: hostAccepted,
  liveRegistrySwapped: hostAccepted,
  runtimeEnablementAllowed: hostAccepted,
  officialRegistryPublished: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
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
    readonly status: ThirdPartyDataPackLiveRegistrySwapExecutionSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackLiveRegistrySwapProtectionResult
    readonly hostResult?: ThirdPartyDataPackLiveRegistrySwapHostResult
    readonly hostCalled?: boolean
    readonly diagnostics?: readonly ThirdPartyDataPackLiveRegistrySwapExecutionSafeDiagnostic[]
  }
): ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult => {
  const continuationAllowed = options.status !== 'blocked'
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const requestedCommandId = readRuntimeCommandId(options.source, selectedPackageIds, blockedPackageIds)
  const targetPackageId = runtimeCommandTargetPackageId(
    requestedCommandId,
    selectedPackageIds,
    blockedPackageIds,
    readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined
  )
  const hostStatus = readOwnStringField(options.hostResult, 'status') as
    | ThirdPartyDataPackLiveRegistrySwapHostStatus
    | undefined

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_LIVE_REGISTRY_SWAP_EXECUTION_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_LIVE_REGISTRY_SWAP_EXECUTION_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    runtimeOnly: true,
    persistentWrite: false,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
    liveRegistrySwapProtectionStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackLiveRegistrySwapProtectionResult['status']
      | undefined,
    liveRegistrySwapHostStatus: hostStatus,
    requestedCommandId,
    targetPackageId,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidatePaths: cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths')),
    loadOrder: clonePackageIds(readOwnDataField(options.source, 'loadOrder')),
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? selectedPackageIds.length,
    officialIdentity: cloneOfficialIdentity(readOwnDataField(options.source, 'officialIdentity')),
    candidateIdentity: cloneCandidateIdentity(readOwnDataField(options.source, 'candidateIdentity')),
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    requiredProtectionIds: cloneRequiredProtectionIds(readOwnDataField(options.source, 'requiredProtections')),
    diagnostics: Object.freeze([...(options.diagnostics ?? [])]),
    effects: effectSummary(
      options.sourceCalled,
      continuationAllowed,
      requestedCommandId,
      options.hostCalled === true,
      hostStatus === 'swapped'
    )
  })
}

const buildHostEnvelope = (
  source: ThirdPartyDataPackLiveRegistrySwapProtectionResult
): ThirdPartyDataPackLiveRegistrySwapExecutionHostEnvelope | undefined => {
  const selectedPackageIds = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
  const requestedCommandId = readRuntimeCommandId(source, selectedPackageIds, blockedPackageIds)
  const targetPackageId = runtimeCommandTargetPackageId(
    requestedCommandId,
    selectedPackageIds,
    blockedPackageIds,
    readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  )
  const officialIdentity = cloneOfficialIdentity(readOwnDataField(source, 'officialIdentity'))
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  const lockfileHash = readOwnStringField(source, 'lockfileHash') as Sha256Hash | undefined
  if (
    targetPackageId === undefined
    || requestedCommandId === undefined
    || officialIdentity === undefined
    || candidateIdentity === undefined
    || lockfileHash === undefined
  ) {
    return undefined
  }

  return deepFreezeObjectGraph({
    requestedCommandId,
    targetPackageId,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidatePaths: cloneStringList(readOwnDataField(source, 'blockedCandidatePaths')),
    loadOrder: clonePackageIds(readOwnDataField(source, 'loadOrder')),
    registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(source, 'packageCount') ?? selectedPackageIds.length,
    officialIdentity,
    candidateIdentity,
    lockfileHash,
    liveRegistrySwap: 'deferred',
    requiredProtectionIds: cloneRequiredProtectionIds(readOwnDataField(source, 'requiredProtections'))
  })
}

const evaluateLiveRegistrySwapExecutionSource = async(
  options: CreateThirdPartyDataPackLiveRegistrySwapExecutionSourceOptions
): Promise<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party live registry swap execution source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readLiveRegistrySwapProtection === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party live registry swap execution source is enabled without a swap protection source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.live-registry-swap-execution-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackLiveRegistrySwapProtectionResult
  try {
    source = await options.readLiveRegistrySwapProtection()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party live registry swap protection source failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.live-registry-swap-execution-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedProtection(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party live registry swap is not required because no third-party packages are selected',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  const targetPackageId = clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))[0]
  if (safeDeferredProtection(source)) {
    const envelope = buildHostEnvelope(source)
    if (options.executeLiveRegistrySwap === undefined || envelope === undefined) {
      return baseResult({
        status: 'blocked',
        reason: 'third-party live registry swap execution requires an injected host before command continuation may proceed',
        enabled: true,
        sourceCalled: true,
        source,
        diagnostics: [
          ...sourceDiagnostics,
          commandDiagnostic('third-party.live-registry-swap-execution-source.missing-host', targetPackageId),
          commandDiagnostic('third-party.live-registry-swap-execution-source.swap-blocked', targetPackageId)
        ]
      })
    }

    let hostResult: ThirdPartyDataPackLiveRegistrySwapHostResult
    try {
      hostResult = await options.executeLiveRegistrySwap(envelope)
    } catch {
      return baseResult({
        status: 'blocked',
        reason: 'injected live registry swap host failed before acknowledging the swap',
        enabled: true,
        sourceCalled: true,
        source,
        hostCalled: true,
        diagnostics: [
          ...sourceDiagnostics,
          commandDiagnostic('third-party.live-registry-swap-execution-source.host-failed', targetPackageId),
          commandDiagnostic('third-party.live-registry-swap-execution-source.swap-blocked', targetPackageId)
        ]
      })
    }

    const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
    if (safeSwappedHostResult(source, hostResult)) {
      return baseResult({
        status: 'swapped',
        reason: 'live registry swap execution source accepted an injected runtime-only host swap acknowledgement',
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
      reason: 'injected live registry swap host returned an unsafe swap acknowledgement',
      enabled: true,
      sourceCalled: true,
      source,
      hostResult,
      hostCalled: true,
      diagnostics: [
        ...sourceDiagnostics,
        ...hostDiagnostics,
        commandDiagnostic('third-party.live-registry-swap-execution-source.unsafe-host-result', targetPackageId),
        commandDiagnostic('third-party.live-registry-swap-execution-source.swap-blocked', targetPackageId)
      ]
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'third-party live registry swap execution requires a deferred, path-free protection report',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: [
      ...sourceDiagnostics,
      ...(!pathFreeProtectionSource(source) || !everyOwnDataValueFalse(readOwnDataField(source, 'effects') as object | undefined)
        ? [
            commandDiagnostic('third-party.live-registry-swap-execution-source.unsafe-source', targetPackageId)
          ]
        : []),
      commandDiagnostic('third-party.live-registry-swap-execution-source.swap-blocked', targetPackageId)
    ]
  })
}

export const createThirdPartyDataPackLiveRegistrySwapExecutionSource = (
  options: CreateThirdPartyDataPackLiveRegistrySwapExecutionSourceOptions = {}
): (() => Promise<ThirdPartyDataPackLiveRegistrySwapExecutionSourceResult>) => async() => {
  const result = await evaluateLiveRegistrySwapExecutionSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackLiveRegistrySwapExecutionBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackLiveRegistrySwapExecutionSource =
  createThirdPartyDataPackLiveRegistrySwapExecutionSource()
