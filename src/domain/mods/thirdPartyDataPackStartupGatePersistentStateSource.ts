import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
} from './thirdPartyDataPackStartupGatePersistentStateSourceAdapter'
import {
  readThirdPartyDataPackEnabledRuntimeCommandId,
  type ThirdPartyDataPackEnabledRuntimeCommandId
} from './thirdPartyDataPackRuntimeCommandState'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_KIND =
  'third-party-startup-gate-persistent-state-source'
export const THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_MODE =
  'default-disabled-normal-startup-persistent-state-source'

export type ThirdPartyDataPackStartupGatePersistentStateSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackStartupGatePersistentStateSourceProofs {
  readonly transactionLogCommitted: boolean
  readonly packageStateMatched: boolean
  readonly settingsStateMatched: boolean
  readonly modLockStateMatched: boolean
  readonly liveRegistryMatched: boolean
  readonly saveCacheIsolated: boolean
}

export interface ThirdPartyDataPackStartupGatePersistentStateSourceEffectSummary {
  readonly startupGatePersistentStateSourceCalled: boolean
  readonly persistentStateSourceAdapterCalled: boolean
  readonly startupStateSnapshotAccepted: boolean
  readonly normalStartupContinuationAllowed: boolean
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

export interface ThirdPartyDataPackStartupGatePersistentStateSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_MODE
  readonly status: ThirdPartyDataPackStartupGatePersistentStateSourceStatus
  readonly reason: string
  readonly readOnly: true
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly normalStartupContinuationAllowed: boolean
  readonly sourceAdapterStatus?: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult['status']
  readonly startupPersistentStateSourceHostMode?:
    ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult['startupPersistentStateSourceHostMode']
  readonly injectedSourceHostMode?: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult['injectedSourceHostMode']
  readonly requestedCommandId?: ThirdPartyDataPackEnabledRuntimeCommandId
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly persistentStateProofs?: ThirdPartyDataPackStartupGatePersistentStateSourceProofs
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackStartupGatePersistentStateSourceEffectSummary
}

export interface CreateThirdPartyDataPackStartupGatePersistentStateSourceOptions {
  readonly enabled?: boolean
  readonly readPersistentStateSourceAdapter?: () => Awaitable<ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult>
}

export class ThirdPartyDataPackStartupGatePersistentStateBlockedError extends Error {
  readonly result: ThirdPartyDataPackStartupGatePersistentStateSourceResult

  constructor(result: ThirdPartyDataPackStartupGatePersistentStateSourceResult) {
    super('third-party startup persistent state source blocked normal startup')
    this.name = 'ThirdPartyDataPackStartupGatePersistentStateBlockedError'
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

const forbiddenPersistentStateSourceFields = [
  'startupGateHandoffPreflight',
  'persistentStatePreflight',
  'sourceAdapterExecution',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'indexedDb',
  'indexedDbStore',
  'appDataBridge',
  'androidNativeBridge',
  'androidPrivatePath',
  'modLockStorage',
  'transactionLogStorage',
  'packageWriter',
  'settingsStore',
  'saveStore',
  'cacheStore',
  'launcherApp',
  'gameApp',
  'pinia',
  'router',
  'routerInstance',
  'gameRouter'
] as const

const startupPersistentStateSourceHostModes = new Set([
  'injected-test-only',
  'web-indexeddb-startup-persistent-state',
  'electron-program-directory-startup-persistent-state'
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

const readOwnBooleanField = (
  value: object | undefined,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readOwnNumberField = (
  value: object | undefined,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

const readStartupPersistentStateSourceHostMode = (
  value: object | undefined,
  fieldName: string
): ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult['injectedSourceHostMode'] | undefined => {
  const mode = readOwnStringField(value, fieldName)
  return startupPersistentStateSourceHostModes.has(mode ?? '')
    ? mode as ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult['injectedSourceHostMode']
    : undefined
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
): ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic => {
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
      ?? 'third-party.startup-gate-persistent-state-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] = []
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
): ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const emptySummary = (): ThirdPartyDataPackUiIpcResultEnvelopeSummary => Object.freeze({
  selectedPackageCount: 0,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 0,
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  diagnosticCount: 0
})

const cloneSummary = (
  value: unknown,
  diagnostics: readonly unknown[]
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => {
  if (value === undefined || value === null || typeof value !== 'object') {
    return Object.freeze({
      ...emptySummary(),
      diagnosticCount: diagnostics.length
    })
  }
  return Object.freeze({
    selectedPackageCount: readOwnNumberField(value, 'selectedPackageCount') ?? 0,
    blockedPackageCount: readOwnNumberField(value, 'blockedPackageCount') ?? 0,
    blockedCandidateCount: readOwnNumberField(value, 'blockedCandidateCount') ?? 0,
    loadOrderCount: readOwnNumberField(value, 'loadOrderCount') ?? 0,
    registryCount: readOwnNumberField(value, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(value, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(value, 'packageCount') ?? 0,
    diagnosticCount: diagnostics.length
  })
}

const effectSummary = (
  sourceCalled: boolean,
  startupStateSnapshotAccepted: boolean,
  normalStartupContinuationAllowed: boolean
): ThirdPartyDataPackStartupGatePersistentStateSourceEffectSummary => Object.freeze({
  startupGatePersistentStateSourceCalled: true,
  persistentStateSourceAdapterCalled: sourceCalled,
  startupStateSnapshotAccepted,
  normalStartupContinuationAllowed,
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

const snapshotProofs = (
  source: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult | undefined
): ThirdPartyDataPackStartupGatePersistentStateSourceProofs | undefined => {
  const snapshot = readOwnDataField(source, 'startupStateSnapshot')
  if (snapshot === undefined || snapshot === null || typeof snapshot !== 'object') return undefined
  return Object.freeze({
    transactionLogCommitted: readOwnBooleanField(snapshot, 'transactionLogCommitted') === true,
    packageStateMatched: readOwnBooleanField(snapshot, 'packageStateMatched') === true,
    settingsStateMatched: readOwnBooleanField(snapshot, 'settingsStateMatched') === true,
    modLockStateMatched: readOwnBooleanField(snapshot, 'modLockStateMatched') === true,
    liveRegistryMatched: readOwnBooleanField(snapshot, 'liveRegistryMatched') === true,
    saveCacheIsolated: readOwnBooleanField(snapshot, 'saveCacheIsolated') === true
  })
}

const proofsReady = (
  proofs: ThirdPartyDataPackStartupGatePersistentStateSourceProofs | undefined
): boolean => proofs !== undefined
  && Object.values(proofs).every(value => value === true)

const snapshotIdentityReady = (
  source: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult,
  candidateIdentity: ThirdPartyCandidateIdentitySummary | undefined
): boolean => {
  const snapshot = readOwnDataField(source, 'startupStateSnapshot')
  if (snapshot === undefined || snapshot === null || typeof snapshot !== 'object') return false
  return candidateIdentity?.candidateHash !== undefined
    && readOwnStringField(snapshot, 'candidateHash') === candidateIdentity.candidateHash
    && readOwnStringField(snapshot, 'lockfileHash') === readOwnStringField(source, 'lockfileHash')
}

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

const noRuntimeOrWriteDrift = (
  source: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult,
  allowAdapterEffects: boolean
): boolean => readOwnBooleanField(source, 'persistentStartupReadAllowed') === false
  && readOwnBooleanField(source, 'transactionLogReadAllowed') === false
  && readOwnBooleanField(source, 'packageStateReadAllowed') === false
  && readOwnBooleanField(source, 'settingsReadAllowed') === false
  && readOwnBooleanField(source, 'lockfileReadAllowed') === false
  && readOwnBooleanField(source, 'liveRegistryReadAllowed') === false
  && readOwnBooleanField(source, 'saveReadAllowed') === false
  && readOwnBooleanField(source, 'saveCacheIsolationCheckAllowed') === false
  && readOwnBooleanField(source, 'startupFailureReportingAllowed') === false
  && readOwnBooleanField(source, 'launcherAppAllowed') === false
  && readOwnBooleanField(source, 'gameAppCreationAllowed') === false
  && readOwnBooleanField(source, 'piniaCreationAllowed') === false
  && readOwnBooleanField(source, 'routerMountAllowed') === false
  && readOwnBooleanField(source, 'uiIpcResponseDeliveryAllowed') === false
  && readOwnBooleanField(source, 'commandDispatchAllowed') === false
  && readOwnBooleanField(source, 'transactionCommitAllowed') === false
  && readOwnBooleanField(source, 'runtimeEnablementAllowed') === false
  && readOwnBooleanField(source, 'writeAllowed') === false
  && readOwnBooleanField(source, 'rollbackRecoveryAllowed') === false
  && allOwnBooleanFlagsFalse(
    readOwnDataField(source, 'effects') as object | undefined,
    allowAdapterEffects
      ? [
          'startupPersistentStateSourceAdapterCalled',
          'injectedSourceHostCalled',
          'startupStateSnapshotReceived',
          'startupStateSnapshotNormalized'
        ]
      : []
  )

const pathFreePersistentStateSource = (
  source: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
): boolean => forbiddenPersistentStateSourceFields.every(fieldName => !hasOwnEnumerableField(source, fieldName))

const safeExecutedSource = (
  source: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult,
  candidateIdentity: ThirdPartyCandidateIdentitySummary | undefined,
  proofs: ThirdPartyDataPackStartupGatePersistentStateSourceProofs | undefined
): boolean => readOwnStringField(source, 'status') === 'executed'
  && readOwnBooleanField(source, 'startupStateSnapshotNormalized') === true
  && readOwnBooleanField(source, 'startupPersistentStateSourceAdapterAllowed') === true
  && proofsReady(proofs)
  && snapshotIdentityReady(source, candidateIdentity)
  && noRuntimeOrWriteDrift(source, true)
  && pathFreePersistentStateSource(source)

const safeSkippedSource = (
  source: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
): boolean => readOwnStringField(source, 'status') === 'skipped'
  && noRuntimeOrWriteDrift(source, false)
  && pathFreePersistentStateSource(source)

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

const baseResult = (
  options: {
    readonly status: ThirdPartyDataPackStartupGatePersistentStateSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly source?: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
    readonly diagnostics?: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
    readonly persistentStateProofs?: ThirdPartyDataPackStartupGatePersistentStateSourceProofs
  }
): ThirdPartyDataPackStartupGatePersistentStateSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.source, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.source, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.source, 'loadOrder'))
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(options.source, 'candidateIdentity'))
  const startupPersistentStateSourceHostMode = readStartupPersistentStateSourceHostMode(
    options.source,
    'startupPersistentStateSourceHostMode'
  )
  const injectedSourceHostMode = readStartupPersistentStateSourceHostMode(
    options.source,
    'injectedSourceHostMode'
  )
  const continuationAllowed = options.status === 'ready' || options.status === 'skipped'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_STARTUP_GATE_PERSISTENT_STATE_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: true,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    normalStartupContinuationAllowed: continuationAllowed,
    sourceAdapterStatus: readOwnStringField(options.source, 'status') as
      | ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult['status']
      | undefined,
    ...(startupPersistentStateSourceHostMode === undefined
      ? {}
      : { startupPersistentStateSourceHostMode }),
    ...(injectedSourceHostMode === undefined ? {} : { injectedSourceHostMode }),
    requestedCommandId: readThirdPartyDataPackEnabledRuntimeCommandId(
      readOwnStringField(options.source, 'requestedCommandId')
    ),
    targetPackageId: readOwnStringField(options.source, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(options.source, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(options.source, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.source, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.source, 'packageCount') ?? selectedPackageIds.length,
    candidateHash: candidateIdentity?.candidateHash,
    lockfileHash: readOwnStringField(options.source, 'lockfileHash') as Sha256Hash | undefined,
    ...(options.persistentStateProofs === undefined ? {} : { persistentStateProofs: options.persistentStateProofs }),
    diagnostics,
    summary: cloneSummary(readOwnDataField(options.source, 'summary'), diagnostics),
    effects: effectSummary(
      options.sourceCalled,
      options.status === 'ready',
      continuationAllowed
    )
  })
}

const evaluatePersistentStateSource = async(
  options: CreateThirdPartyDataPackStartupGatePersistentStateSourceOptions
): Promise<ThirdPartyDataPackStartupGatePersistentStateSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party startup persistent state source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readPersistentStateSourceAdapter === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party startup persistent state source is enabled without a persistent state adapter source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.startup-gate-persistent-state-source.missing-source')
      ]
    })
  }

  let source: ThirdPartyDataPackStartupGatePersistentStateSourceAdapterResult
  try {
    source = await options.readPersistentStateSourceAdapter()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party startup persistent state source failed before returning a safe adapter result',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.startup-gate-persistent-state-source.source-failed')
      ]
    })
  }

  const sourceDiagnostics = safeDiagnostics(readOwnDataField(source, 'diagnostics') as readonly unknown[] | undefined)
  const candidateIdentity = cloneCandidateIdentity(readOwnDataField(source, 'candidateIdentity'))
  const proofs = snapshotProofs(source)

  if (safeSkippedSource(source)) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party startup persistent state source is not required because the adapter was skipped',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics
    })
  }

  if (safeExecutedSource(source, candidateIdentity, proofs)) {
    return baseResult({
      status: 'ready',
      reason: 'third-party startup persistent state source accepted a path-free settled snapshot for normal startup',
      enabled: true,
      sourceCalled: true,
      source,
      diagnostics: sourceDiagnostics,
      persistentStateProofs: proofs
    })
  }

  const targetPackageId = readOwnStringField(source, 'targetPackageId') as PackageId | undefined
  const blockedDiagnostics = [
    ...sourceDiagnostics,
    ...(!pathFreePersistentStateSource(source) || !noRuntimeOrWriteDrift(source, true)
      ? [
          commandDiagnostic(
            'third-party.startup-gate-persistent-state-source.unsafe-source',
            targetPackageId
          )
        ]
      : []),
    commandDiagnostic(
      'third-party.startup-gate-persistent-state-source.persistent-state-blocked',
      targetPackageId
    )
  ]

  return baseResult({
    status: 'blocked',
    reason: 'third-party startup persistent state source requires a settled path-free snapshot before normal startup may continue',
    enabled: true,
    sourceCalled: true,
    source,
    diagnostics: blockedDiagnostics,
    persistentStateProofs: proofs
  })
}

export const createThirdPartyDataPackStartupGatePersistentStateSource = (
  options: CreateThirdPartyDataPackStartupGatePersistentStateSourceOptions = {}
): (() => Promise<ThirdPartyDataPackStartupGatePersistentStateSourceResult>) => async() => {
  const result = await evaluatePersistentStateSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackStartupGatePersistentStateBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackStartupGatePersistentStateSource =
  createThirdPartyDataPackStartupGatePersistentStateSource()
