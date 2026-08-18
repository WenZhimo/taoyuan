import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
} from './thirdPartyDataPackTransactionCommandDispatcherHandoff'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_TRANSACTION_COMMAND_DISPATCHER_SOURCE_KIND =
  'third-party-transaction-command-dispatcher-source'
export const THIRD_PARTY_DATA_PACK_TRANSACTION_COMMAND_DISPATCHER_SOURCE_MODE =
  'default-disabled-transaction-command-dispatcher-source'

export type ThirdPartyDataPackTransactionCommandDispatcherSourceStatus =
  | 'dispatched'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackTransactionCommandDispatcherHostStatus =
  | 'dispatched'
  | 'blocked'

export interface ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope {
  readonly requestedCommandId: 'install'
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash: Sha256Hash
}

export interface ThirdPartyDataPackTransactionCommandDispatcherHostEffectSummary {
  readonly commandDispatcherCalled: boolean
  readonly commandDispatched: boolean
  readonly transactionCommitted: false
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

export interface ThirdPartyDataPackTransactionCommandDispatcherHostResult {
  readonly status: ThirdPartyDataPackTransactionCommandDispatcherHostStatus
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackTransactionCommandDispatcherHostEffectSummary
}

export interface ThirdPartyDataPackTransactionCommandDispatcherSourceEffectSummary {
  readonly transactionCommandDispatcherSourceCalled: boolean
  readonly transactionCommandDispatcherHandoffSourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
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
  readonly commandDispatcherCalled: boolean
  readonly commandDispatched: boolean
  readonly transactionCommitted: false
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

export interface ThirdPartyDataPackTransactionCommandDispatcherSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_TRANSACTION_COMMAND_DISPATCHER_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_TRANSACTION_COMMAND_DISPATCHER_SOURCE_MODE
  readonly status: ThirdPartyDataPackTransactionCommandDispatcherSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly transactionCommandDispatcherHandoffStatus?: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult['status']
  readonly transactionCommandDispatcherHostStatus?: ThirdPartyDataPackTransactionCommandDispatcherHostStatus
  readonly requestedCommandId?: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult['requestedCommandId']
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
  readonly diagnostics: readonly ThirdPartyDataPackTransactionCommandDispatcherSourceSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackTransactionCommandDispatcherSourceEffectSummary
}

export interface ThirdPartyDataPackTransactionCommandDispatcherSourceSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface CreateThirdPartyDataPackTransactionCommandDispatcherSourceOptions {
  readonly enabled?: boolean
  readonly readTransactionCommandDispatcherHandoff?: () => Awaitable<ThirdPartyDataPackTransactionCommandDispatcherHandoffResult>
  readonly dispatchTransactionCommand?: (
    envelope: ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope
  ) => Awaitable<ThirdPartyDataPackTransactionCommandDispatcherHostResult>
}

export class ThirdPartyDataPackTransactionCommandDispatcherBlockedError extends Error {
  readonly result: ThirdPartyDataPackTransactionCommandDispatcherSourceResult

  constructor(result: ThirdPartyDataPackTransactionCommandDispatcherSourceResult) {
    super('third-party transaction command dispatcher blocked application bootstrap')
    this.name = 'ThirdPartyDataPackTransactionCommandDispatcherBlockedError'
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

const forbiddenDispatcherSourceFields = [
  'transactionCommandPreflight',
  'installTransactionDispatchPlan',
  'postCommitVerificationPlan',
  'runtimePublicationCommitAdapter',
  'atomicTransactionCommitExecutorPreflight',
  'atomicTransactionCommitExecutorAdapter',
  'uiIpcResultEnvelope',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'commandDispatcher',
  'commandDispatcherHost',
  'dispatcherHost',
  'commitExecutorHost',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'packageWriter',
  'settingsStore',
  'saveStore',
  'cacheStore',
  'modLockStorage',
  'transactionLogStorage',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

const forbiddenDispatcherHostFields = [
  'transactionCommandDispatcherHandoff',
  'transactionCommandPreflight',
  'installTransactionDispatchPlan',
  'postCommitVerificationPlan',
  'runtimePublicationCommitAdapter',
  'atomicTransactionCommitExecutorPreflight',
  'atomicTransactionCommitExecutorAdapter',
  'uiIpcResultEnvelope',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'commandDispatcherHost',
  'dispatcherHost',
  'dispatchHost',
  'commitExecutorHost',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'packageWriter',
  'settingsStore',
  'saveStore',
  'cacheStore',
  'modLockStorage',
  'transactionLogStorage',
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
): ThirdPartyDataPackTransactionCommandDispatcherSourceSafeDiagnostic => {
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
      ?? 'third-party.transaction-command-dispatcher-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackTransactionCommandDispatcherSourceSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackTransactionCommandDispatcherSourceSafeDiagnostic[] = []
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
): ThirdPartyDataPackTransactionCommandDispatcherSourceSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const effectSummary = (
  sourceCalled: boolean,
  appBootstrapContinuationAllowed: boolean,
  commandDispatched: boolean
): ThirdPartyDataPackTransactionCommandDispatcherSourceEffectSummary => Object.freeze({
  transactionCommandDispatcherSourceCalled: true,
  transactionCommandDispatcherHandoffSourceCalled: sourceCalled,
  appBootstrapContinuationAllowed,
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
  commandDispatcherCalled: commandDispatched,
  commandDispatched,
  transactionCommitted: false,
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

const allOwnBooleanFlagsFalse = (
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

const noRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
): boolean => readOwnBooleanField(source, 'dispatcherHandoffAllowed') === false
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'postCommitVerificationAllowed') === false
  && readOwnBooleanField(source, 'commitAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'uiIpcResponseAllowed') === false
  && allOwnBooleanFlagsFalse(readOwnDataField(source, 'effects') as object | undefined)

const pathFreeDispatcherSource = (
  source: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
): boolean => forbiddenDispatcherSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const safeSkippedSource = (
  source: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noRuntimeOrWriteDrift(source)
  && pathFreeDispatcherSource(source)

const safeDeferredSource = (
  source: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
): boolean => readOwnStringField(source, 'status') === 'deferred'
  && readOwnStringField(source, 'requestedCommandId') === 'install'
  && readOwnStringField(source, 'targetPackageId') !== undefined
  && cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) !== undefined
  && readOwnStringField(source, 'lockfileHash') !== undefined
  && noRuntimeOrWriteDrift(source)
  && pathFreeDispatcherSource(source)

const pathFreeDispatcherHostResult = (
  hostResult: ThirdPartyDataPackTransactionCommandDispatcherHostResult
): boolean => forbiddenDispatcherHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

const dispatchEffectsContained = (
  effects: object | undefined,
  dispatched: boolean
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
    if (key === 'commandDispatcherCalled') return descriptor.value === true
    if (key === 'commandDispatched') return descriptor.value === dispatched
    return descriptor.value === false
  })
}

const safeDispatchedHostResult = (
  source: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult,
  hostResult: ThirdPartyDataPackTransactionCommandDispatcherHostResult
): boolean => readOwnStringField(hostResult, 'status') === 'dispatched'
  && readOwnStringField(hostResult, 'requestedCommandId') === 'install'
  && readOwnStringField(hostResult, 'targetPackageId') === readOwnStringField(source, 'targetPackageId')
  && dispatchEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
  && pathFreeDispatcherHostResult(hostResult)

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

const buildDispatcherEnvelope = (
  source: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
): ThirdPartyDataPackTransactionCommandDispatcherHostEnvelope => deepFreezeObjectGraph({
  requestedCommandId: 'install' as const,
  targetPackageId: readOwnStringField(source, 'targetPackageId') as PackageId,
  selectedPackageIds: clonePackageIds(readOwnDataField(source, 'selectedPackageIds')),
  blockedPackageIds: clonePackageIds(readOwnDataField(source, 'blockedPackageIds')),
  loadOrder: clonePackageIds(readOwnDataField(source, 'loadOrder')),
  registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
  entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
  packageCount: readOwnNumberField(source, 'packageCount') ?? 0,
  candidateIdentity: cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity')) as ThirdPartyCandidateIdentitySummary,
  lockfileHash: readOwnStringField(source, 'lockfileHash') as Sha256Hash
})

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackTransactionCommandDispatcherSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
    readonly hostResult?: ThirdPartyDataPackTransactionCommandDispatcherHostResult
    readonly diagnostics?: readonly ThirdPartyDataPackTransactionCommandDispatcherSourceSafeDiagnostic[]
  }
): ThirdPartyDataPackTransactionCommandDispatcherSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const continuationAllowed = options.status === 'skipped'
  const commandContinuationAllowed = options.status === 'dispatched'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_TRANSACTION_COMMAND_DISPATCHER_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_TRANSACTION_COMMAND_DISPATCHER_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed,
    transactionCommandDispatcherHandoffStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackTransactionCommandDispatcherHandoffResult['status']
      | undefined,
    transactionCommandDispatcherHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackTransactionCommandDispatcherHostStatus
      | undefined,
    requestedCommandId: readOwnStringField(options.source, 'requestedCommandId') === 'install' ? 'install' as const : undefined,
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
    diagnostics,
    effects: effectSummary(options.sourceCalled, continuationAllowed, commandContinuationAllowed)
  })
}

const evaluateTransactionCommandDispatcherSource = async(
  options: CreateThirdPartyDataPackTransactionCommandDispatcherSourceOptions
): Promise<ThirdPartyDataPackTransactionCommandDispatcherSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party transaction command dispatcher source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readTransactionCommandDispatcherHandoff === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction command dispatcher source is enabled without a dispatcher handoff source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.transaction-command-dispatcher-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackTransactionCommandDispatcherHandoffResult
  try {
    source = await options.readTransactionCommandDispatcherHandoff()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction command dispatcher handoff source failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.transaction-command-dispatcher-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party transaction command dispatcher is not required because dispatcher handoff was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeDeferredSource(source)) {
    const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
    if (options.dispatchTransactionCommand === undefined) {
      return baseResult({
        status: 'blocked',
        reason: 'third-party transaction command dispatcher source is enabled without a command dispatcher host',
        enabled: true,
        sourceCalled: true,
        source,
        diagnostics: [
          ...sourceDiagnostics,
          commandDiagnostic(
            'third-party.transaction-command-dispatcher-source.missing-dispatcher-host',
            targetPackageId
          )
        ]
      })
    }

    let hostResult: ThirdPartyDataPackTransactionCommandDispatcherHostResult
    try {
      hostResult = await options.dispatchTransactionCommand(buildDispatcherEnvelope(source))
    } catch {
      return baseResult({
        status: 'blocked',
        reason: 'third-party transaction command dispatcher host failed before returning a safe result',
        enabled: true,
        sourceCalled: true,
        source,
        diagnostics: [
          ...sourceDiagnostics,
          commandDiagnostic(
            'third-party.transaction-command-dispatcher-source.dispatcher-host-failed',
            targetPackageId
          )
        ]
      })
    }

    const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
    if (safeDispatchedHostResult(source, hostResult)) {
      return baseResult({
        status: 'dispatched',
        reason: 'third-party transaction command dispatcher accepted an injected path-free install dispatch result',
        enabled: true,
        sourceCalled: true,
        source,
        hostResult,
        diagnostics: [
          ...sourceDiagnostics,
          ...hostDiagnostics
        ]
      })
    }

    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction command dispatcher host returned an unsafe or blocked result',
      enabled: true,
      sourceCalled: true,
      source,
      hostResult,
      diagnostics: [
        ...sourceDiagnostics,
        ...hostDiagnostics,
        ...(!pathFreeDispatcherHostResult(hostResult)
          || !dispatchEffectsContained(
            readOwnDataField(hostResult, 'effects') as object | undefined,
            readOwnStringField(hostResult, 'status') === 'dispatched'
          )
          ? [
              commandDiagnostic(
                'third-party.transaction-command-dispatcher-source.unsafe-dispatcher-host-result',
                targetPackageId
              )
            ]
          : []),
        commandDiagnostic(
          'third-party.transaction-command-dispatcher-source.dispatcher-host-blocked',
          targetPackageId
        )
      ]
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeDispatcherSource(source) || !noRuntimeOrWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.transaction-command-dispatcher-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.transaction-command-dispatcher-source.dispatcher-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party transaction command dispatcher requires a future explicit dispatcher boundary before application bootstrap may continue',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackTransactionCommandDispatcherSource = (
  options: CreateThirdPartyDataPackTransactionCommandDispatcherSourceOptions = {}
): (() => Promise<ThirdPartyDataPackTransactionCommandDispatcherSourceResult>) => async() => {
  const result = await evaluateTransactionCommandDispatcherSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackTransactionCommandDispatcherBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackTransactionCommandDispatcherSource =
  createThirdPartyDataPackTransactionCommandDispatcherSource()
