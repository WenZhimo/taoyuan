import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  ThirdPartyDataPackInstallTransactionWriteProbeEvidence
} from './thirdPartyDataPackInstallTransactionDispatchPlan'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_TRANSACTION_WRITE_BOUNDARY_SOURCE_KIND =
  'third-party-transaction-write-boundary-source'
export const THIRD_PARTY_DATA_PACK_TRANSACTION_WRITE_BOUNDARY_SOURCE_MODE =
  'default-disabled-transaction-write-boundary-source'

export type ThirdPartyDataPackTransactionWriteBoundarySourceStatus =
  | 'accepted'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackTransactionWriteBoundaryHostStatus =
  | 'accepted'
  | 'blocked'

export interface ThirdPartyDataPackTransactionWriteBoundaryHostEnvelope {
  readonly requestedCommandId: 'install'
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly transactionCommandPreflightStatus: ThirdPartyDataPackInstallTransactionDispatchPlanResult['transactionCommandPreflightStatus']
  readonly modLockWriteProbeStatus: ThirdPartyDataPackInstallTransactionDispatchPlanResult['modLockWriteProbeStatus']
  readonly transactionLogWriteProbeStatus: ThirdPartyDataPackInstallTransactionDispatchPlanResult['transactionLogWriteProbeStatus']
  readonly writeProbeEvidence: ThirdPartyDataPackInstallTransactionWriteProbeEvidence
}

export interface ThirdPartyDataPackTransactionWriteBoundaryHostEffectSummary {
  readonly transactionWriteBoundaryHostCalled: boolean
  readonly transactionWriteBoundaryHostAccepted: boolean
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

export interface ThirdPartyDataPackTransactionWriteBoundaryHostResult {
  readonly status: ThirdPartyDataPackTransactionWriteBoundaryHostStatus
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds?: readonly PackageId[]
  readonly blockedPackageIds?: readonly PackageId[]
  readonly loadOrder?: readonly PackageId[]
  readonly registryCount?: number
  readonly entryCount?: number
  readonly packageCount?: number
  readonly modLockWriteProbeStatus?: ThirdPartyDataPackInstallTransactionDispatchPlanResult['modLockWriteProbeStatus']
  readonly transactionLogWriteProbeStatus?: ThirdPartyDataPackInstallTransactionDispatchPlanResult['transactionLogWriteProbeStatus']
  readonly modLockPersistentWriteExecuted?: boolean
  readonly transactionLogPersistentWriteExecuted?: boolean
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackTransactionWriteBoundaryHostEffectSummary
}

export interface ThirdPartyDataPackTransactionWriteBoundarySourceEffectSummary {
  readonly transactionWriteBoundarySourceCalled: boolean
  readonly installTransactionDispatchPlanSourceCalled: boolean
  readonly injectedTransactionWriteBoundaryHostCalled: boolean
  readonly transactionWriteBoundaryHostCalled: boolean
  readonly transactionWriteBoundaryHostAccepted: boolean
  readonly realTransactionWriteBoundaryHostCalled: false
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

export interface ThirdPartyDataPackTransactionWriteBoundarySourceSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackTransactionWriteBoundarySourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_TRANSACTION_WRITE_BOUNDARY_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_TRANSACTION_WRITE_BOUNDARY_SOURCE_MODE
  readonly status: ThirdPartyDataPackTransactionWriteBoundarySourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly appBootstrapContinuationAllowed: boolean
  readonly commandContinuationAllowed: boolean
  readonly installTransactionDispatchPlanStatus?: ThirdPartyDataPackInstallTransactionDispatchPlanResult['status']
  readonly transactionWriteBoundaryHostStatus?: ThirdPartyDataPackTransactionWriteBoundaryHostStatus
  readonly transactionCommandPreflightStatus?: ThirdPartyDataPackInstallTransactionDispatchPlanResult['transactionCommandPreflightStatus']
  readonly modLockWriteProbeStatus?: ThirdPartyDataPackInstallTransactionDispatchPlanResult['modLockWriteProbeStatus']
  readonly transactionLogWriteProbeStatus?: ThirdPartyDataPackInstallTransactionDispatchPlanResult['transactionLogWriteProbeStatus']
  readonly requestedCommandId?: ThirdPartyDataPackInstallTransactionDispatchPlanResult['requestedCommandId']
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly writeProbeEvidence: ThirdPartyDataPackInstallTransactionWriteProbeEvidence
  readonly diagnostics: readonly ThirdPartyDataPackTransactionWriteBoundarySourceSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackTransactionWriteBoundarySourceEffectSummary
}

export interface CreateThirdPartyDataPackTransactionWriteBoundarySourceOptions {
  readonly enabled?: boolean
  readonly readInstallTransactionDispatchPlan?: () => Awaitable<ThirdPartyDataPackInstallTransactionDispatchPlanResult>
  readonly executeTransactionWriteBoundary?: (
    envelope: ThirdPartyDataPackTransactionWriteBoundaryHostEnvelope
  ) => Awaitable<ThirdPartyDataPackTransactionWriteBoundaryHostResult>
}

export class ThirdPartyDataPackTransactionWriteBoundaryBlockedError extends Error {
  readonly result: ThirdPartyDataPackTransactionWriteBoundarySourceResult

  constructor(result: ThirdPartyDataPackTransactionWriteBoundarySourceResult) {
    super('third-party transaction write boundary blocked command continuation')
    this.name = 'ThirdPartyDataPackTransactionWriteBoundaryBlockedError'
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

const forbiddenWriteBoundarySourceFields = [
  'transactionCommandPreflight',
  'modLockWriteProbe',
  'transactionLogWriteProbe',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'transactionCommandDispatcherHandoff',
  'atomicTransactionCommitExecutor',
  'postCommitVerificationExecutor',
  'uiIpcResultEnvelope',
  'transactionWriteHost',
  'transactionHost',
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

const forbiddenWriteBoundaryHostFields = [
  'transactionCommandPreflight',
  'installTransactionDispatchPlan',
  'modLockWriteProbe',
  'transactionLogWriteProbe',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'transactionWriteHost',
  'transactionHost',
  'realTransactionHost',
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
): ThirdPartyDataPackTransactionWriteBoundarySourceSafeDiagnostic => {
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
      ?? 'third-party.transaction-write-boundary-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackTransactionWriteBoundarySourceSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackTransactionWriteBoundarySourceSafeDiagnostic[] = []
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
): ThirdPartyDataPackTransactionWriteBoundarySourceSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const emptyWriteProbeEvidence = (): ThirdPartyDataPackInstallTransactionWriteProbeEvidence => Object.freeze({
  modLockWriteProbeStatus: 'skipped',
  transactionLogWriteProbeStatus: 'skipped',
  modLockPersistentWriteExecuted: false,
  transactionLogPersistentWriteExecuted: false
})

const cloneWriteProbeEvidence = (
  evidence: unknown
): ThirdPartyDataPackInstallTransactionWriteProbeEvidence => {
  if (evidence === undefined || evidence === null || typeof evidence !== 'object') {
    return emptyWriteProbeEvidence()
  }
  const modLockStatus = readOwnStringField(evidence, 'modLockWriteProbeStatus')
  const transactionLogStatus = readOwnStringField(evidence, 'transactionLogWriteProbeStatus')
  return Object.freeze({
    modLockWriteProbeStatus: (
      modLockStatus === 'deferred'
      || modLockStatus === 'written'
      || modLockStatus === 'skipped'
      || modLockStatus === 'blocked'
      || modLockStatus === 'failed'
        ? modLockStatus
        : 'skipped'
    ),
    transactionLogWriteProbeStatus: (
      transactionLogStatus === 'deferred'
      || transactionLogStatus === 'written'
      || transactionLogStatus === 'skipped'
      || transactionLogStatus === 'blocked'
      || transactionLogStatus === 'failed'
        ? transactionLogStatus
        : 'skipped'
    ),
    modLockPersistentWriteExecuted: readOwnBooleanField(evidence, 'modLockPersistentWriteExecuted') ?? false,
    transactionLogPersistentWriteExecuted: readOwnBooleanField(evidence, 'transactionLogPersistentWriteExecuted') ?? false
  })
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

const noRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackInstallTransactionDispatchPlanResult
): boolean => readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'commitAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'uiIpcResponseAllowed') === false
  && everyOwnDataValueFalse(readOwnDataField(source, 'effects') as object | undefined)

const pathFreeWriteBoundarySource = (
  source: ThirdPartyDataPackInstallTransactionDispatchPlanResult
): boolean => forbiddenWriteBoundarySourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const safeSkippedSource = (
  source: ThirdPartyDataPackInstallTransactionDispatchPlanResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noRuntimeOrWriteDrift(source)
  && pathFreeWriteBoundarySource(source)

const safeDeferredSource = (
  source: ThirdPartyDataPackInstallTransactionDispatchPlanResult
): boolean => readOwnStringField(source, 'status') === 'deferred'
  && readOwnStringField(source, 'requestedCommandId') === 'install'
  && readOwnStringField(source, 'targetPackageId') !== undefined
  && readOwnStringField(source, 'transactionCommandPreflightStatus') === 'deferred'
  && readOwnStringField(source, 'modLockWriteProbeStatus') === 'written'
  && readOwnStringField(source, 'transactionLogWriteProbeStatus') === 'written'
  && cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence')).modLockPersistentWriteExecuted === true
  && cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence')).transactionLogPersistentWriteExecuted === true
  && noRuntimeOrWriteDrift(source)
  && pathFreeWriteBoundarySource(source)

const pathFreeWriteBoundaryHostResult = (
  hostResult: ThirdPartyDataPackTransactionWriteBoundaryHostResult
): boolean => forbiddenWriteBoundaryHostFields.every(fieldName => !hasOwnEnumerableField(hostResult, fieldName))

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
    if (key === 'transactionWriteBoundaryHostCalled') return descriptor.value === true
    if (key === 'transactionWriteBoundaryHostAccepted') return descriptor.value === accepted
    return descriptor.value === false
  })
}

const safeAcceptedHostResult = (
  source: ThirdPartyDataPackInstallTransactionDispatchPlanResult,
  hostResult: ThirdPartyDataPackTransactionWriteBoundaryHostResult
): boolean => {
  const writeEvidence = cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
  return readOwnStringField(hostResult, 'status') === 'accepted'
    && readOwnStringField(hostResult, 'requestedCommandId') === 'install'
    && readOwnStringField(hostResult, 'targetPackageId') === readOwnStringField(source, 'targetPackageId')
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'selectedPackageIds')),
      clonePackageIds(readOwnDataField(source, 'selectedPackageIds'))
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'blockedPackageIds')),
      clonePackageIds(readOwnDataField(source, 'blockedPackageIds'))
    )
    && arraysEqual(
      clonePackageIds(readOwnDataField(hostResult, 'loadOrder')),
      clonePackageIds(readOwnDataField(source, 'loadOrder'))
    )
    && readOwnNumberField(hostResult, 'registryCount') === readOwnNumberField(source, 'registryCount')
    && readOwnNumberField(hostResult, 'entryCount') === readOwnNumberField(source, 'entryCount')
    && readOwnNumberField(hostResult, 'packageCount') === readOwnNumberField(source, 'packageCount')
    && readOwnStringField(hostResult, 'modLockWriteProbeStatus') === writeEvidence.modLockWriteProbeStatus
    && readOwnStringField(hostResult, 'transactionLogWriteProbeStatus') === writeEvidence.transactionLogWriteProbeStatus
    && readOwnBooleanField(hostResult, 'modLockPersistentWriteExecuted') === writeEvidence.modLockPersistentWriteExecuted
    && readOwnBooleanField(hostResult, 'transactionLogPersistentWriteExecuted') === writeEvidence.transactionLogPersistentWriteExecuted
    && hostEffectsContained(readOwnDataField(hostResult, 'effects') as object | undefined, true)
    && pathFreeWriteBoundaryHostResult(hostResult)
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
  hostResult?: ThirdPartyDataPackTransactionWriteBoundaryHostResult
): ThirdPartyDataPackTransactionWriteBoundarySourceEffectSummary => Object.freeze({
  transactionWriteBoundarySourceCalled: true,
  installTransactionDispatchPlanSourceCalled: sourceCalled,
  injectedTransactionWriteBoundaryHostCalled: readOwnBooleanField(
    readOwnDataField(hostResult, 'effects') as object | undefined,
    'transactionWriteBoundaryHostCalled'
  ) ?? false,
  transactionWriteBoundaryHostCalled: readOwnBooleanField(
    readOwnDataField(hostResult, 'effects') as object | undefined,
    'transactionWriteBoundaryHostCalled'
  ) ?? false,
  transactionWriteBoundaryHostAccepted: readOwnBooleanField(
    readOwnDataField(hostResult, 'effects') as object | undefined,
    'transactionWriteBoundaryHostAccepted'
  ) ?? false,
  realTransactionWriteBoundaryHostCalled: false,
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
    readonly status: ThirdPartyDataPackTransactionWriteBoundarySourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackInstallTransactionDispatchPlanResult
    readonly hostResult?: ThirdPartyDataPackTransactionWriteBoundaryHostResult
    readonly diagnostics?: readonly ThirdPartyDataPackTransactionWriteBoundarySourceSafeDiagnostic[]
  }
): ThirdPartyDataPackTransactionWriteBoundarySourceResult => {
  const continuationAllowed = options.status !== 'blocked'
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const blockedCandidatePaths = cloneStringList(readOwnDataField(options.source, 'blockedCandidatePaths'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_TRANSACTION_WRITE_BOUNDARY_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_TRANSACTION_WRITE_BOUNDARY_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    appBootstrapContinuationAllowed: continuationAllowed,
    commandContinuationAllowed: continuationAllowed,
    installTransactionDispatchPlanStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackInstallTransactionDispatchPlanResult['status']
      | undefined,
    transactionWriteBoundaryHostStatus: readOwnStringField(options.hostResult, 'status') as
      | ThirdPartyDataPackTransactionWriteBoundaryHostStatus
      | undefined,
    transactionCommandPreflightStatus: readOwnStringField(options.source, 'transactionCommandPreflightStatus') as
      | ThirdPartyDataPackInstallTransactionDispatchPlanResult['transactionCommandPreflightStatus']
      | undefined,
    modLockWriteProbeStatus: readOwnStringField(options.source, 'modLockWriteProbeStatus') as
      | ThirdPartyDataPackInstallTransactionDispatchPlanResult['modLockWriteProbeStatus']
      | undefined,
    transactionLogWriteProbeStatus: readOwnStringField(options.source, 'transactionLogWriteProbeStatus') as
      | ThirdPartyDataPackInstallTransactionDispatchPlanResult['transactionLogWriteProbeStatus']
      | undefined,
    requestedCommandId: readOwnStringField(options.source, 'requestedCommandId') as
      | ThirdPartyDataPackInstallTransactionDispatchPlanResult['requestedCommandId']
      | undefined,
    targetPackageId: readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidatePaths,
    loadOrder,
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? selectedPackageIds.length,
    writeProbeEvidence: cloneWriteProbeEvidence(readOwnDataField(options.source, 'writeProbeEvidence')),
    diagnostics,
    effects: effectSummary(options.sourceCalled, continuationAllowed, options.hostResult)
  })
}

const buildWriteBoundaryHostEnvelope = (
  source: ThirdPartyDataPackInstallTransactionDispatchPlanResult
): ThirdPartyDataPackTransactionWriteBoundaryHostEnvelope => deepFreezeObjectGraph({
  requestedCommandId: 'install' as const,
  targetPackageId: readOwnStringField(source, 'targetPackageId') as PackageId,
  selectedPackageIds: clonePackageIds(readOwnDataField(source, 'selectedPackageIds')),
  blockedPackageIds: clonePackageIds(readOwnDataField(source, 'blockedPackageIds')),
  loadOrder: clonePackageIds(readOwnDataField(source, 'loadOrder')),
  registryCount: readOwnNumberField(source, 'registryCount') ?? 54,
  entryCount: readOwnNumberField(source, 'entryCount') ?? 4242,
  packageCount: readOwnNumberField(source, 'packageCount') ?? 0,
  transactionCommandPreflightStatus: readOwnStringField(source, 'transactionCommandPreflightStatus') as
    ThirdPartyDataPackInstallTransactionDispatchPlanResult['transactionCommandPreflightStatus'],
  modLockWriteProbeStatus: readOwnStringField(source, 'modLockWriteProbeStatus') as
    ThirdPartyDataPackInstallTransactionDispatchPlanResult['modLockWriteProbeStatus'],
  transactionLogWriteProbeStatus: readOwnStringField(source, 'transactionLogWriteProbeStatus') as
    ThirdPartyDataPackInstallTransactionDispatchPlanResult['transactionLogWriteProbeStatus'],
  writeProbeEvidence: cloneWriteProbeEvidence(readOwnDataField(source, 'writeProbeEvidence'))
})

const evaluateTransactionWriteBoundarySource = async(
  options: CreateThirdPartyDataPackTransactionWriteBoundarySourceOptions
): Promise<ThirdPartyDataPackTransactionWriteBoundarySourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party transaction write boundary source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readInstallTransactionDispatchPlan === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party transaction write boundary source is enabled without an install dispatch plan source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.transaction-write-boundary-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackInstallTransactionDispatchPlanResult
  try {
    source = await options.readInstallTransactionDispatchPlan()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party install dispatch plan source failed before returning a safe result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.transaction-write-boundary-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party transaction write boundary is not required because install dispatch planning was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeDeferredSource(source)) {
    const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
    if (options.executeTransactionWriteBoundary !== undefined) {
      let hostResult: ThirdPartyDataPackTransactionWriteBoundaryHostResult
      try {
        hostResult = await options.executeTransactionWriteBoundary(buildWriteBoundaryHostEnvelope(source))
      } catch {
        return baseResult({
          status: 'blocked',
          reason: 'third-party transaction write boundary host failed before returning a safe result',
          enabled: true,
          sourceCalled: true,
          source,
          diagnostics: [
            ...sourceDiagnostics,
            commandDiagnostic(
              'third-party.transaction-write-boundary-source.write-boundary-host-failed',
              targetPackageId
            )
          ]
        })
      }

      const hostDiagnostics = safeDiagnostics(readOwnDataField(hostResult, 'diagnostics') as readonly unknown[] | undefined)
      if (safeAcceptedHostResult(source, hostResult)) {
        return baseResult({
          status: 'accepted',
          reason: 'third-party transaction write boundary source accepted an injected path-free write boundary host result',
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
        reason: 'third-party transaction write boundary host returned an unsafe or blocked result',
        enabled: true,
        sourceCalled: true,
        source,
        hostResult,
        diagnostics: [
          ...sourceDiagnostics,
          ...hostDiagnostics,
          ...(!pathFreeWriteBoundaryHostResult(hostResult)
            || !hostEffectsContained(
              readOwnDataField(hostResult, 'effects') as object | undefined,
              readOwnStringField(hostResult, 'status') === 'accepted'
            )
            ? [
                commandDiagnostic(
                  'third-party.transaction-write-boundary-source.unsafe-write-boundary-host-result',
                  targetPackageId
                )
              ]
            : []),
          commandDiagnostic(
            'third-party.transaction-write-boundary-source.write-boundary-host-blocked',
            targetPackageId
          )
        ]
      })
    }
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreeWriteBoundarySource(source) || !noRuntimeOrWriteDrift(source)
      ? [
          commandDiagnostic(
            'third-party.transaction-write-boundary-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.transaction-write-boundary-source.write-boundary-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party transaction write boundary requires a future explicit real-host write boundary before command continuation may proceed',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics
  })
}

export const createThirdPartyDataPackTransactionWriteBoundarySource = (
  options: CreateThirdPartyDataPackTransactionWriteBoundarySourceOptions = {}
): (() => Promise<ThirdPartyDataPackTransactionWriteBoundarySourceResult>) => async() => {
  const result = await evaluateTransactionWriteBoundarySource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackTransactionWriteBoundaryBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackTransactionWriteBoundarySource =
  createThirdPartyDataPackTransactionWriteBoundarySource()
