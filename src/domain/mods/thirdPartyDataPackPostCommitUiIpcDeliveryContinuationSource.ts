import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult
} from './thirdPartyDataPackPostCommitPersistentReadWriteConnectionSource'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform,
  ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
} from './thirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSource'
import type {
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_POST_COMMIT_UI_IPC_DELIVERY_CONTINUATION_SOURCE_KIND =
  'third-party-post-commit-ui-ipc-delivery-continuation-source'
export const THIRD_PARTY_DATA_PACK_POST_COMMIT_UI_IPC_DELIVERY_CONTINUATION_SOURCE_MODE =
  'default-disabled-post-commit-ui-ipc-delivery-continuation-source'

export type ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationCheck {
  readonly id:
    | 'post-commit-read-write-accepted'
    | 'ui-ipc-delivery-ready'
    | 'install-target-consistent'
    | 'package-summary-consistent'
    | 'candidate-hash-consistent'
    | 'lockfile-hash-consistent'
    | 'contained-effects-intact'
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationAcknowledgement {
  readonly status: 'acknowledged'
  readonly platform: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
  readonly packageId: PackageId
  readonly envelopeKind: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly messageKey: string
}

export interface ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationEffectSummary {
  readonly postCommitUiIpcDeliveryContinuationSourceCalled: boolean
  readonly postCommitPersistentReadWriteConnectionSourceCalled: boolean
  readonly uiIpcResponseDeliveryAcknowledgementConvergenceSourceCalled: boolean
  readonly postCommitPersistentReadWriteConnectionAcknowledged: boolean
  readonly uiIpcDeliveryAcknowledgementConverged: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly startupGateContinuationAllowed: boolean
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly modManagementUiMounted: false
  readonly launcherAppMounted: false
  readonly gameAppCreated: false
  readonly piniaCreated: false
  readonly routerMounted: false
  readonly electronIpcExposed: false
  readonly webFilePickerOpened: false
  readonly androidFilePickerOpened: false
  readonly commandDispatcherCalled: false
  readonly commandDispatched: false
  readonly atomicCommitExecutorCalled: false
  readonly transactionCommitted: false
  readonly transactionLogPrepared: false
  readonly runtimePublicationCommitted: false
  readonly postCommitVerificationExecutorCalled: false
  readonly postCommitVerificationExecuted: false
  readonly transactionLogRead: false
  readonly packageStateRead: false
  readonly settingsRead: false
  readonly lockfileRead: false
  readonly liveRegistryRead: false
  readonly saveRead: false
  readonly saveCacheIsolationChecked: false
  readonly successEnvelopeDelivered: boolean
  readonly failureEnvelopeDelivered: boolean
  readonly retryStateDelivered: boolean
  readonly rollbackStateDelivered: boolean
  readonly uiIpcResponseDelivered: boolean
  readonly packageFilesWritten: boolean
  readonly packageBackupsWritten: boolean
  readonly packageFilesRestored: false
  readonly lockfileWritten: boolean
  readonly lockfileRestored: false
  readonly settingsWritten: boolean
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_UI_IPC_DELIVERY_CONTINUATION_SOURCE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_POST_COMMIT_UI_IPC_DELIVERY_CONTINUATION_SOURCE_MODE
  readonly status: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceStatus
  readonly reason: string
  readonly readOnly: boolean
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly postCommitPersistentReadWriteConnectionStatus?:
    ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult['status']
  readonly uiIpcResponseDeliveryAcknowledgementConvergenceStatus?:
    ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult['status']
  readonly selectedPlatform?: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergencePlatform
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly envelopeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly messageKey?: string
  readonly deliverySummary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly acknowledgement?: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationAcknowledgement
  readonly persistentPackageWriteExecuted: boolean
  readonly persistentSettingsLockfileWriteExecuted: boolean
  readonly writtenFileCount: number
  readonly backedUpFileCount: number
  readonly transactionCommitConnectionAcknowledged: boolean
  readonly postCommitPersistentReadWriteConnectionAcknowledged: boolean
  readonly uiIpcDeliveryAcknowledged: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly startupGateContinuationAllowed: boolean
  readonly checks: readonly ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationEffectSummary
}

export interface CreateThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceOptions {
  readonly enabled?: boolean
  readonly readPostCommitPersistentReadWriteConnectionSource?: () =>
    Awaitable<ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult>
  readonly readUiIpcResponseDeliveryAcknowledgementConvergenceSource?: () =>
    Awaitable<ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult>
}

export class ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError extends Error {
  readonly result: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult

  constructor(result: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult) {
    super('third-party post-commit UI/IPC delivery continuation blocked')
    this.name = 'ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError'
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

const forbiddenFields = [
  'postCommitPersistentReadWriteConnectionSource',
  'uiIpcResponseDeliveryAcknowledgementConvergenceSource',
  'responseDeliverySinkAdapter',
  'responseDeliveryOrchestrationHandoff',
  'startupGateHandoffPreflight',
  'deliveryEnvelope',
  'resultEnvelope',
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'transactionLogReader',
  'packageStateReader',
  'settingsReader',
  'lockfileReader',
  'liveRegistryReader',
  'packageWriter',
  'settingsWriter',
  'lockfileWriter',
  'saveWriter',
  'cacheWriter',
  'modLockStorage',
  'transactionLogStorage',
  'recoveryLogStorage',
  'electronHost',
  'webHost',
  'androidHost',
  'programDirectoryPath',
  'appDataDirectory',
  'contentUri',
  'fileUri',
  'window',
  'document',
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

const readOwnDataField = (
  value: unknown,
  fieldName: string
): unknown | undefined => {
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
  return typeof field === 'number' && Number.isSafeInteger(field) && field >= 0 ? field : undefined
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

const clonePackageIds = (value: unknown): readonly PackageId[] => Object.freeze(
  cloneStringList(value).map(packageId => packageId as PackageId)
)

const cloneCandidateIdentity = (
  value: unknown
): ThirdPartyCandidateIdentitySummary | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const contentHash = readOwnStringField(value, 'contentHash')
  const snapshotHash = readOwnStringField(value, 'snapshotHash')
  const candidateHash = readOwnStringField(value, 'candidateHash')
  const formatVersion = readOwnNumberField(value, 'formatVersion')
  return formatVersion === 1 && contentHash && snapshotHash && candidateHash
    ? Object.freeze({
        formatVersion: 1,
        contentHash: contentHash as Sha256Hash,
        snapshotHash: snapshotHash as Sha256Hash,
        candidateHash: candidateHash as Sha256Hash
      })
    : undefined
}

const safeDiagnostic = (
  diagnostic: object
): ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSafeDiagnostic => {
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
      ?? 'third-party.post-commit-ui-ipc-delivery-continuation-source.diagnostic-copy',
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
): readonly ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSafeDiagnostic[] = []
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
): ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const defaultSummary = Object.freeze({
  selectedPackageCount: 0,
  blockedPackageCount: 0,
  blockedCandidateCount: 0,
  loadOrderCount: 0,
  registryCount: 54,
  entryCount: 4242,
  packageCount: 0,
  diagnosticCount: 0
}) satisfies ThirdPartyDataPackUiIpcResultEnvelopeSummary

const cloneSummary = (
  value: unknown,
  diagnostics: readonly unknown[]
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => Object.freeze({
  selectedPackageCount: readOwnNumberField(value, 'selectedPackageCount') ?? 0,
  blockedPackageCount: readOwnNumberField(value, 'blockedPackageCount') ?? 0,
  blockedCandidateCount: readOwnNumberField(value, 'blockedCandidateCount') ?? 0,
  loadOrderCount: readOwnNumberField(value, 'loadOrderCount') ?? 0,
  registryCount: readOwnNumberField(value, 'registryCount') ?? 54,
  entryCount: readOwnNumberField(value, 'entryCount') ?? 4242,
  packageCount: readOwnNumberField(value, 'packageCount') ?? 0,
  diagnosticCount: readOwnNumberField(value, 'diagnosticCount') ?? diagnostics.length
})

const hasForbiddenField = (value: unknown): boolean => {
  if (value === null || typeof value !== 'object') return false
  return forbiddenFields.some(fieldName => {
    try {
      return Reflect.getOwnPropertyDescriptor(value, fieldName) !== undefined
    } catch {
      return true
    }
  })
}

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const effectsContained = (
  postCommit: unknown,
  uiIpc: unknown,
  accepted: boolean,
  envelopeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
): boolean => {
  const postCommitEffectsContained = readOwnBooleanField(postCommit, 'transactionCommitted') === false
    && readOwnBooleanField(postCommit, 'runtimePublicationCommitted') === false
    && readOwnBooleanField(postCommit, 'postCommitVerificationExecuted') === false
    && readOwnBooleanField(postCommit, 'uiIpcResponseDelivered') === false
    && readOwnBooleanField(postCommit, 'transactionLogRead') === false
    && readOwnBooleanField(postCommit, 'packageStateRead') === false
    && readOwnBooleanField(postCommit, 'settingsRead') === false
    && readOwnBooleanField(postCommit, 'lockfileRead') === false
    && readOwnBooleanField(postCommit, 'liveRegistryRead') === false
    && readOwnBooleanField(postCommit, 'saveCacheIsolationChecked') === false
    && readOwnBooleanField(postCommit, 'packageFilesWritten') === true
    && readOwnBooleanField(postCommit, 'settingsWritten') === true
    && readOwnBooleanField(postCommit, 'lockfileWritten') === true
    && readOwnBooleanField(postCommit, 'savesWritten') === false
    && readOwnBooleanField(postCommit, 'cacheWritten') === false
    && readOwnBooleanField(postCommit, 'transactionLogWritten') === false
    && readOwnBooleanField(postCommit, 'rollbackExecuted') === false

  if (!postCommitEffectsContained) return false
  if (uiIpc === undefined) return accepted === false

  return readOwnBooleanField(uiIpc, 'uiIpcResponseDelivered') === accepted
    && readOwnBooleanField(uiIpc, 'successEnvelopeDelivered') === (accepted && envelopeKind === 'success')
    && readOwnBooleanField(uiIpc, 'failureEnvelopeDelivered') === (accepted && envelopeKind === 'failure')
    && readOwnBooleanField(uiIpc, 'retryStateDelivered') === (accepted && envelopeKind === 'retry')
    && readOwnBooleanField(uiIpc, 'rollbackStateDelivered') === (accepted && envelopeKind === 'rollback')
    && readOwnBooleanField(uiIpc, 'transactionCommitted') === false
    && readOwnBooleanField(uiIpc, 'runtimePublicationCommitted') === false
    && readOwnBooleanField(uiIpc, 'postCommitVerificationExecuted') === false
    && readOwnBooleanField(uiIpc, 'packageFilesWritten') === false
    && readOwnBooleanField(uiIpc, 'settingsWritten') === false
    && readOwnBooleanField(uiIpc, 'lockfileWritten') === false
    && readOwnBooleanField(uiIpc, 'savesWritten') === false
    && readOwnBooleanField(uiIpc, 'cacheWritten') === false
    && readOwnBooleanField(uiIpc, 'transactionLogWritten') === false
    && readOwnBooleanField(uiIpc, 'rollbackExecuted') === false
}

const safeAcceptedPostCommitSource = (
  source: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult
): boolean => source.status === 'accepted'
  && source.requestedCommandId === 'install'
  && source.targetPackageId !== undefined
  && source.candidateHash !== undefined
  && source.lockfileHash !== undefined
  && source.transactionCommitConnectionAcknowledged === true
  && source.postCommitPersistentReadWriteConnectionAcknowledged === true
  && source.uiIpcResultContinuationAllowed === true
  && source.persistentPackageWriteExecuted === true
  && source.persistentSettingsLockfileWriteExecuted === true
  && !hasForbiddenField(source)
  && effectsContained(source.effects, undefined, false)

const safeReadyUiIpcSource = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
): boolean => source.status === 'ready'
  && source.requestedCommandId === 'install'
  && source.targetPackageId !== undefined
  && source.candidateIdentity?.candidateHash !== undefined
  && source.lockfileHash !== undefined
  && source.envelopeKind !== undefined
  && source.messageKey !== undefined
  && source.platformResponseDelivered === true
  && source.deliveryAcknowledgementConsumed === true
  && source.startupGateContinuationAllowed === true
  && source.uiIpcResponseDeliveryAllowed === false
  && source.deliveryAcknowledgementAllowed === false
  && source.commandDispatchAllowed === false
  && source.transactionCommitAllowed === false
  && source.runtimeEnablementAllowed === false
  && source.writeAllowed === false
  && source.rollbackRecoveryAllowed === false
  && !hasForbiddenField(source)

const check = (
  id: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationCheck['id'],
  status: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationCheck['status'],
  reason: string
): ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationCheck => Object.freeze({
  id,
  status,
  reason
})

const terminalChecks = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationCheck[] => Object.freeze([
  'post-commit-read-write-accepted',
  'ui-ipc-delivery-ready',
  'install-target-consistent',
  'package-summary-consistent',
  'candidate-hash-consistent',
  'lockfile-hash-consistent',
  'contained-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationCheck['id'],
  status,
  reason
)))

const buildChecks = (
  postCommit: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult,
  uiIpc: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
): readonly ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationCheck[] => {
  const postCommitSelectedPackageIds = clonePackageIds(readOwnDataField(postCommit, 'selectedPackageIds'))
  const uiIpcSelectedPackageIds = clonePackageIds(readOwnDataField(uiIpc, 'selectedPackageIds'))
  const postCommitBlockedPackageIds = clonePackageIds(readOwnDataField(postCommit, 'blockedPackageIds'))
  const uiIpcBlockedPackageIds = clonePackageIds(readOwnDataField(uiIpc, 'blockedPackageIds'))
  const postCommitLoadOrder = clonePackageIds(readOwnDataField(postCommit, 'loadOrder'))
  const uiIpcLoadOrder = clonePackageIds(readOwnDataField(uiIpc, 'loadOrder'))
  const postCommitCandidateHash = readOwnStringField(postCommit, 'candidateHash')
  const uiIpcCandidateHash = cloneCandidateIdentity(readOwnDataField(uiIpc, 'candidateIdentity'))?.candidateHash
  const envelopeKind = readOwnStringField(uiIpc, 'envelopeKind') as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined

  return Object.freeze([
    check(
      'post-commit-read-write-accepted',
      safeAcceptedPostCommitSource(postCommit) ? 'satisfied' : 'blocked',
      'Post-commit UI/IPC delivery continuation requires accepted persistent read/write connection evidence.'
    ),
    check(
      'ui-ipc-delivery-ready',
      safeReadyUiIpcSource(uiIpc) ? 'satisfied' : 'blocked',
      'Post-commit UI/IPC delivery continuation requires a ready selected-platform acknowledgement.'
    ),
    check(
      'install-target-consistent',
      postCommit.requestedCommandId === 'install'
        && uiIpc.requestedCommandId === 'install'
        && postCommit.targetPackageId === uiIpc.targetPackageId
        && postCommit.targetPackageId !== undefined
        ? 'satisfied'
        : 'blocked',
      'Post-commit and UI/IPC delivery sources must describe the same install target.'
    ),
    check(
      'package-summary-consistent',
      arraysEqual(postCommitSelectedPackageIds, uiIpcSelectedPackageIds)
        && arraysEqual(postCommitBlockedPackageIds, uiIpcBlockedPackageIds)
        && arraysEqual(postCommitLoadOrder, uiIpcLoadOrder)
        && postCommit.registryCount === uiIpc.registryCount
        && postCommit.entryCount === uiIpc.entryCount
        && postCommit.packageCount === uiIpc.packageCount
        ? 'satisfied'
        : 'blocked',
      'Post-commit and UI/IPC delivery sources must preserve package summary counts and order.'
    ),
    check(
      'candidate-hash-consistent',
      postCommitCandidateHash === uiIpcCandidateHash && postCommitCandidateHash !== undefined
        ? 'satisfied'
        : 'blocked',
      'Post-commit and UI/IPC delivery sources must preserve the same candidate hash.'
    ),
    check(
      'lockfile-hash-consistent',
      postCommit.lockfileHash === uiIpc.lockfileHash && postCommit.lockfileHash !== undefined
        ? 'satisfied'
        : 'blocked',
      'Post-commit and UI/IPC delivery sources must preserve the same lockfile hash.'
    ),
    check(
      'contained-effects-intact',
      effectsContained(postCommit.effects, uiIpc.effects, true, envelopeKind)
        ? 'satisfied'
        : 'blocked',
      'Post-commit UI/IPC continuation may combine only prior contained writes and delivered response evidence.'
    )
  ])
}

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>
    for (const child of Object.values(objectValue)) {
      deepFreezeObjectGraph(child)
    }
    Object.freeze(value)
  }
  return value
}

const acknowledgement = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
): ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationAcknowledgement | undefined => {
  if (
    source.selectedPlatform === undefined
    || source.targetPackageId === undefined
    || source.envelopeKind === undefined
    || source.messageKey === undefined
  ) {
    return undefined
  }

  return Object.freeze({
    status: 'acknowledged' as const,
    platform: source.selectedPlatform,
    packageId: source.targetPackageId,
    envelopeKind: source.envelopeKind,
    messageKey: source.messageKey
  })
}

const effectSummary = (
  status: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceStatus,
  postCommit?: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult,
  uiIpc?: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
): ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationEffectSummary => {
  const ready = status === 'ready'
  const envelopeKind = readOwnStringField(uiIpc, 'envelopeKind')
  return Object.freeze({
    postCommitUiIpcDeliveryContinuationSourceCalled: true,
    postCommitPersistentReadWriteConnectionSourceCalled: postCommit !== undefined,
    uiIpcResponseDeliveryAcknowledgementConvergenceSourceCalled: uiIpc !== undefined,
    postCommitPersistentReadWriteConnectionAcknowledged:
      postCommit?.postCommitPersistentReadWriteConnectionAcknowledged ?? false,
    uiIpcDeliveryAcknowledgementConverged: ready,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
    startupGateContinuationAllowed: ready,
    officialRegistryPublished: false,
    thirdPartyRegistryPublished: false,
    liveRegistryMutated: false,
    liveRegistrySwapped: false,
    previousRegistryReleased: false,
    previousRegistryRestored: false,
    candidateRegistryExposed: false,
    runtimeEnablementAllowed: false,
    modManagementUiMounted: false,
    launcherAppMounted: false,
    gameAppCreated: false,
    piniaCreated: false,
    routerMounted: false,
    electronIpcExposed: false,
    webFilePickerOpened: false,
    androidFilePickerOpened: false,
    commandDispatcherCalled: false,
    commandDispatched: false,
    atomicCommitExecutorCalled: false,
    transactionCommitted: false,
    transactionLogPrepared: false,
    runtimePublicationCommitted: false,
    postCommitVerificationExecutorCalled: false,
    postCommitVerificationExecuted: false,
    transactionLogRead: false,
    packageStateRead: false,
    settingsRead: false,
    lockfileRead: false,
    liveRegistryRead: false,
    saveRead: false,
    saveCacheIsolationChecked: false,
    successEnvelopeDelivered: ready && envelopeKind === 'success',
    failureEnvelopeDelivered: ready && envelopeKind === 'failure',
    retryStateDelivered: ready && envelopeKind === 'retry',
    rollbackStateDelivered: ready && envelopeKind === 'rollback',
    uiIpcResponseDelivered: ready,
    packageFilesWritten: postCommit?.effects.packageFilesWritten ?? false,
    packageBackupsWritten: postCommit?.effects.packageBackupsWritten ?? false,
    packageFilesRestored: false,
    lockfileWritten: postCommit?.effects.lockfileWritten ?? false,
    lockfileRestored: false,
    settingsWritten: postCommit?.effects.settingsWritten ?? false,
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
    readonly status: ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceStatus
    readonly reason: string
    readonly enabled: boolean
    readonly sourceCalled: boolean
    readonly postCommit?: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult
    readonly uiIpc?: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
    readonly checks?: readonly ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationCheck[]
    readonly diagnostics?: readonly ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSafeDiagnostic[]
  }
): ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult => {
  const diagnostics = Object.freeze([...(options.diagnostics ?? [])])
  const selectedPackageIds = clonePackageIds(readOwnDataField(options.postCommit ?? options.uiIpc, 'selectedPackageIds'))
  const blockedPackageIds = clonePackageIds(readOwnDataField(options.postCommit ?? options.uiIpc, 'blockedPackageIds'))
  const loadOrder = clonePackageIds(readOwnDataField(options.postCommit ?? options.uiIpc, 'loadOrder'))
  const candidateIdentity = cloneCandidateIdentity(
    readOwnDataField(options.postCommit ?? options.uiIpc, 'candidateIdentity')
  )
  const uiIpcSummary = cloneSummary(readOwnDataField(options.uiIpc, 'summary'), diagnostics)
  const uiIpcAcknowledgement = options.uiIpc === undefined ? undefined : acknowledgement(options.uiIpc)
  const writeExecuted = options.postCommit?.persistentPackageWriteExecuted === true
    || options.postCommit?.persistentSettingsLockfileWriteExecuted === true
  const ready = options.status === 'ready'

  return deepFreezeObjectGraph({
    kind: THIRD_PARTY_DATA_PACK_POST_COMMIT_UI_IPC_DELIVERY_CONTINUATION_SOURCE_KIND,
    mode: THIRD_PARTY_DATA_PACK_POST_COMMIT_UI_IPC_DELIVERY_CONTINUATION_SOURCE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: !writeExecuted,
    enabled: options.enabled,
    sourceCalled: options.sourceCalled,
    postCommitPersistentReadWriteConnectionStatus: options.postCommit?.status,
    uiIpcResponseDeliveryAcknowledgementConvergenceStatus: options.uiIpc?.status,
    selectedPlatform: options.uiIpc?.selectedPlatform,
    requestedCommandId: readOwnStringField(options.postCommit ?? options.uiIpc, 'requestedCommandId') === 'install'
      ? 'install' as const
      : undefined,
    targetPackageId: readOwnStringField(options.postCommit ?? options.uiIpc, 'targetPackageId') as PackageId | undefined,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: readOwnNumberField(options.uiIpc, 'blockedCandidateCount') ?? 0,
    loadOrder,
    registryCount: readOwnNumberField(options.postCommit ?? options.uiIpc, 'registryCount') ?? 54,
    entryCount: readOwnNumberField(options.postCommit ?? options.uiIpc, 'entryCount') ?? 4242,
    packageCount: readOwnNumberField(options.postCommit ?? options.uiIpc, 'packageCount') ?? selectedPackageIds.length,
    candidateIdentity,
    candidateHash: readOwnStringField(options.postCommit, 'candidateHash') as Sha256Hash | undefined
      ?? candidateIdentity?.candidateHash,
    lockfileHash: readOwnStringField(options.postCommit ?? options.uiIpc, 'lockfileHash') as Sha256Hash | undefined,
    envelopeKind: readOwnStringField(options.uiIpc, 'envelopeKind') as
      ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind | undefined,
    messageKey: readOwnStringField(options.uiIpc, 'messageKey'),
    deliverySummary: options.uiIpc === undefined ? defaultSummary : uiIpcSummary,
    ...(uiIpcAcknowledgement === undefined ? {} : { acknowledgement: uiIpcAcknowledgement }),
    persistentPackageWriteExecuted: options.postCommit?.persistentPackageWriteExecuted ?? false,
    persistentSettingsLockfileWriteExecuted: options.postCommit?.persistentSettingsLockfileWriteExecuted ?? false,
    writtenFileCount: options.postCommit?.writtenFileCount ?? 0,
    backedUpFileCount: options.postCommit?.backedUpFileCount ?? 0,
    transactionCommitConnectionAcknowledged: options.postCommit?.transactionCommitConnectionAcknowledged ?? false,
    postCommitPersistentReadWriteConnectionAcknowledged:
      options.postCommit?.postCommitPersistentReadWriteConnectionAcknowledged ?? false,
    uiIpcDeliveryAcknowledged: ready,
    commandContinuationAllowed: ready,
    uiIpcResultContinuationAllowed: ready,
    startupGateContinuationAllowed: ready,
    checks: options.checks ?? terminalChecks(
      options.status === 'blocked' ? 'blocked' : 'skipped',
      options.reason
    ),
    diagnostics,
    effects: effectSummary(options.status, options.postCommit, options.uiIpc)
  })
}

const mergeDiagnostics = (
  postCommit?: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult,
  uiIpc?: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
): readonly ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSafeDiagnostic[] => Object.freeze([
  ...safeDiagnostics(readOwnDataField(postCommit, 'diagnostics') as readonly unknown[] | undefined),
  ...safeDiagnostics(readOwnDataField(uiIpc, 'diagnostics') as readonly unknown[] | undefined)
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.post-commit-ui-ipc-delivery-continuation-source.checks.${currentCheck.id}`,
    packageId
  )))

const evaluatePostCommitUiIpcDeliveryContinuationSource = async(
  options: CreateThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceOptions
): Promise<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit UI/IPC delivery continuation source is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readPostCommitPersistentReadWriteConnectionSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit UI/IPC delivery continuation source is enabled without a post-commit source',
      enabled: true,
      sourceCalled: false,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-ui-ipc-delivery-continuation-source.missing-post-commit-source')
      ]
    })
  }

  let postCommit: ThirdPartyDataPackPostCommitPersistentReadWriteConnectionSourceResult
  try {
    postCommit = await options.readPostCommitPersistentReadWriteConnectionSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit persistent read/write source failed before UI/IPC continuation',
      enabled: true,
      sourceCalled: true,
      diagnostics: [
        commandDiagnostic('third-party.post-commit-ui-ipc-delivery-continuation-source.post-commit-source-failed')
      ]
    })
  }

  const postCommitDiagnostics = mergeDiagnostics(postCommit)
  if (postCommit.status === 'skipped' && postCommit.sourceCalled === false) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party post-commit UI/IPC delivery continuation is not required because post-commit read/write was skipped',
      enabled: true,
      sourceCalled: true,
      postCommit,
      diagnostics: postCommitDiagnostics,
      checks: terminalChecks('skipped', 'post-commit persistent read/write connection source was skipped')
    })
  }

  if (!safeAcceptedPostCommitSource(postCommit)) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit UI/IPC delivery continuation requires accepted post-commit read/write evidence',
      enabled: true,
      sourceCalled: true,
      postCommit,
      diagnostics: [
        ...postCommitDiagnostics,
        commandDiagnostic(
          'third-party.post-commit-ui-ipc-delivery-continuation-source.post-commit-source-blocked',
          postCommit.targetPackageId
        )
      ]
    })
  }

  if (options.readUiIpcResponseDeliveryAcknowledgementConvergenceSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party post-commit UI/IPC delivery continuation source is enabled without a UI/IPC acknowledgement source',
      enabled: true,
      sourceCalled: true,
      postCommit,
      diagnostics: [
        ...postCommitDiagnostics,
        commandDiagnostic(
          'third-party.post-commit-ui-ipc-delivery-continuation-source.missing-ui-ipc-source',
          postCommit.targetPackageId
        )
      ]
    })
  }

  let uiIpc: ThirdPartyDataPackUiIpcResponseDeliveryAcknowledgementConvergenceSourceResult
  try {
    uiIpc = await options.readUiIpcResponseDeliveryAcknowledgementConvergenceSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party UI/IPC acknowledgement source failed before post-commit delivery continuation',
      enabled: true,
      sourceCalled: true,
      postCommit,
      diagnostics: [
        ...postCommitDiagnostics,
        commandDiagnostic(
          'third-party.post-commit-ui-ipc-delivery-continuation-source.ui-ipc-source-failed',
          postCommit.targetPackageId
        )
      ]
    })
  }

  const diagnostics = mergeDiagnostics(postCommit, uiIpc)
  const checks = buildChecks(postCommit, uiIpc)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, postCommit.targetPackageId)

  if (blockedDiagnostics.length === 0) {
    return baseResult({
      status: 'ready',
      reason: 'third-party post-commit UI/IPC delivery continuation accepted matching post-commit and response delivery acknowledgements',
      enabled: true,
      sourceCalled: true,
      postCommit,
      uiIpc,
      checks,
      diagnostics
    })
  }

  return baseResult({
    status: 'blocked',
    reason: 'third-party post-commit UI/IPC delivery continuation requires matching post-commit and UI/IPC acknowledgement evidence',
    enabled: true,
    sourceCalled: true,
    postCommit,
    uiIpc,
    checks,
    diagnostics: [
      ...diagnostics,
      ...blockedDiagnostics,
      commandDiagnostic(
        'third-party.post-commit-ui-ipc-delivery-continuation-source.continuation-blocked',
        postCommit.targetPackageId
      )
    ]
  })
}

export const createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource = (
  options: CreateThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceOptions = {}
): (() => Promise<ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSourceResult>) => async() => {
  const result = await evaluatePostCommitUiIpcDeliveryContinuationSource(options)
  if (result.status === 'blocked') {
    throw new ThirdPartyDataPackPostCommitUiIpcDeliveryContinuationBlockedError(result)
  }
  return result
}

export const thirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource =
  createThirdPartyDataPackPostCommitUiIpcDeliveryContinuationSource()
