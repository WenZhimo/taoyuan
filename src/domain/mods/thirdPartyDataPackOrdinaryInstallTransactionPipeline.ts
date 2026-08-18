import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackModLockTransactionSemanticsOutcomeKind,
  ThirdPartyDataPackModLockTransactionSemanticsSourceResult
} from './thirdPartyDataPackModLockTransactionSemanticsSource'

type Awaitable<T> = T | Promise<T>

export const THIRD_PARTY_DATA_PACK_ORDINARY_INSTALL_TRANSACTION_PIPELINE_KIND =
  'third-party-ordinary-install-transaction-pipeline'
export const THIRD_PARTY_DATA_PACK_ORDINARY_INSTALL_TRANSACTION_PIPELINE_MODE =
  'default-disabled-ordinary-install-transaction-pipeline'

export type ThirdPartyDataPackOrdinaryInstallTransactionPipelineStatus =
  | 'ready'
  | 'skipped'
  | 'blocked'

export interface ThirdPartyDataPackOrdinaryInstallTransactionPipelineCheck {
  readonly id:
    | 'mod-lock-transaction-semantics-source-present'
    | 'mod-lock-transaction-semantics-candidate-stable'
    | 'install-target-present'
    | 'candidate-hash-present'
    | 'lockfile-hash-present'
    | 'public-api-deferred'
    | 'contained-effects-intact'
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackOrdinaryInstallTransactionSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackOrdinaryInstallTransactionEffectSummary {
  readonly ordinaryInstallTransactionPipelineCalled: boolean
  readonly modLockTransactionSemanticsSourceCalled: boolean
  readonly ordinaryInstallTransactionReady: boolean
  readonly successOutcomeAccepted: boolean
  readonly failureOutcomeAccepted: boolean
  readonly retryOutcomeAccepted: boolean
  readonly rollbackOutcomeAccepted: boolean
  readonly publicModLockSchemaFrozen: false
  readonly publicTransactionApiFrozen: false
  readonly publicApiReleaseAllowed: false
  readonly publicSchemaSetHashChanged: false
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
  readonly rollbackRecoverySettled: boolean
  readonly rollbackRecoveryExecutionAcknowledged: boolean
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

export interface ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult {
  readonly kind: typeof THIRD_PARTY_DATA_PACK_ORDINARY_INSTALL_TRANSACTION_PIPELINE_KIND
  readonly mode: typeof THIRD_PARTY_DATA_PACK_ORDINARY_INSTALL_TRANSACTION_PIPELINE_MODE
  readonly status: ThirdPartyDataPackOrdinaryInstallTransactionPipelineStatus
  readonly reason: string
  readonly readOnly: boolean
  readonly enabled: boolean
  readonly pipelineCalled: boolean
  readonly sourceCalled: boolean
  readonly modLockTransactionSemanticsStatus?: ThirdPartyDataPackModLockTransactionSemanticsSourceResult['status']
  readonly semanticsVersion: 1
  readonly stability: 'internal-candidate'
  readonly publicModLockSchemaFrozen: false
  readonly publicTransactionApiFrozen: false
  readonly publicApiReleaseAllowed: false
  readonly publicSchemaSetHashChanged: false
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly outcomeKind?: ThirdPartyDataPackModLockTransactionSemanticsOutcomeKind
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
  readonly messageKey?: string
  readonly recovery: ModDiagnosticRecovery
  readonly retryable: boolean
  readonly rollbackRequired: boolean
  readonly commandContinuationAllowed: boolean
  readonly uiIpcResultContinuationAllowed: boolean
  readonly startupGateContinuationAllowed: boolean
  readonly persistentPackageWriteAcknowledged: boolean
  readonly persistentSettingsLockfileWriteAcknowledged: boolean
  readonly uiIpcDeliveryAcknowledged: boolean
  readonly rollbackRecoverySettled: boolean
  readonly rollbackRecoveryExecutionAcknowledged: boolean
  readonly ordinaryInstallTransactionReady: boolean
  readonly checks: readonly ThirdPartyDataPackOrdinaryInstallTransactionPipelineCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackOrdinaryInstallTransactionSafeDiagnostic[]
  readonly effects: ThirdPartyDataPackOrdinaryInstallTransactionEffectSummary
}

export interface CreateThirdPartyDataPackOrdinaryInstallTransactionPipelineOptions {
  readonly enabled?: boolean
  readonly readModLockTransactionSemanticsSource?: () =>
    Awaitable<ThirdPartyDataPackModLockTransactionSemanticsSourceResult>
}

export class ThirdPartyDataPackOrdinaryInstallTransactionBlockedError extends Error {
  readonly result: ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult

  constructor(result: ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult) {
    super('third-party ordinary install transaction pipeline blocked')
    this.name = 'ThirdPartyDataPackOrdinaryInstallTransactionBlockedError'
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
  'candidateRegistrySet',
  'candidateSnapshot',
  'lockfileDraft',
  'publicJsonSchema',
  'schemaWriter',
  'schemaSetWriter',
  'apiPublisher',
  'modLockStorage',
  'transactionLogStorage',
  'packageWriter',
  'settingsWriter',
  'lockfileWriter',
  'saveWriter',
  'cacheWriter',
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
]

const hasPathLikeEvidence = (value: string): boolean =>
  /[A-Za-z]:[\\/]/.test(value) || value.includes('C:/Users') || value.includes('LENOVO')

const safeString = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.length > 0 && !hasPathLikeEvidence(value)
    ? value
    : fallback

const safePackageId = (value: unknown): PackageId | undefined =>
  typeof value === 'string' && value.length > 0 && !hasPathLikeEvidence(value)
    ? value as PackageId
    : undefined

const copyPackageIds = (value: unknown): readonly PackageId[] => {
  if (!Array.isArray(value)) return Object.freeze([])
  const lengthDescriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  const length = typeof lengthDescriptor?.value === 'number'
    ? Math.max(0, Math.min(lengthDescriptor.value, 10000))
    : 0
  const result: PackageId[] = []
  for (let index = 0; index < length; index += 1) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    if (descriptor === undefined || !('value' in descriptor)) continue
    const packageId = safePackageId(descriptor.value)
    if (packageId !== undefined) result.push(packageId)
  }
  return Object.freeze(result)
}

const copyDiagnostics = (value: unknown): readonly ThirdPartyDataPackOrdinaryInstallTransactionSafeDiagnostic[] => {
  if (!Array.isArray(value)) return Object.freeze([])
  const lengthDescriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  const length = typeof lengthDescriptor?.value === 'number'
    ? Math.max(0, Math.min(lengthDescriptor.value, 250))
    : 0
  const diagnostics: ThirdPartyDataPackOrdinaryInstallTransactionSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    if (descriptor === undefined || !('value' in descriptor)) continue
    const diagnostic = descriptor.value
    if (diagnostic === null || typeof diagnostic !== 'object') continue
    const record = diagnostic as Record<string, unknown>
    const severity = diagnosticSeverities.has(record.severity as ModDiagnosticSeverity)
      ? record.severity as ModDiagnosticSeverity
      : 'error'
    const recovery = diagnosticRecoveries.has(record.recovery as ModDiagnosticRecovery)
      ? record.recovery as ModDiagnosticRecovery
      : 'retry'
    diagnostics.push(Object.freeze({
      code: safeString(record.code, 'LIFECYCLE-TRANSACTION-001'),
      ruleId: safeString(record.ruleId, 'LIFECYCLE-TRANSACTION-001'),
      severity,
      stage: safeString(record.stage, 'third-party.ordinary-install-transaction-pipeline.upstream-diagnostic'),
      messageKey: safeString(record.messageKey, 'mods.error.lifecycle.transaction.001'),
      packageId: safePackageId(record.packageId),
      recovery
    }))
  }
  return Object.freeze(diagnostics)
}

const commandDiagnostic = (
  stage: string,
  packageId?: PackageId
): ThirdPartyDataPackOrdinaryInstallTransactionSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const skippedChecks = (reason: string): readonly ThirdPartyDataPackOrdinaryInstallTransactionPipelineCheck[] => Object.freeze([
  Object.freeze({ id: 'mod-lock-transaction-semantics-source-present', status: 'skipped', reason }),
  Object.freeze({ id: 'mod-lock-transaction-semantics-candidate-stable', status: 'skipped', reason }),
  Object.freeze({ id: 'install-target-present', status: 'skipped', reason }),
  Object.freeze({ id: 'candidate-hash-present', status: 'skipped', reason }),
  Object.freeze({ id: 'lockfile-hash-present', status: 'skipped', reason }),
  Object.freeze({ id: 'public-api-deferred', status: 'skipped', reason }),
  Object.freeze({ id: 'contained-effects-intact', status: 'skipped', reason })
])

const buildChecks = (
  source: ThirdPartyDataPackModLockTransactionSemanticsSourceResult,
  effectsIntact: boolean,
  publicApiDeferred: boolean,
  forbiddenFieldFound: boolean
): readonly ThirdPartyDataPackOrdinaryInstallTransactionPipelineCheck[] => Object.freeze([
  Object.freeze({
    id: 'mod-lock-transaction-semantics-source-present',
    status: 'satisfied',
    reason: 'mod-lock transaction semantics source returned a result'
  }),
  Object.freeze({
    id: 'mod-lock-transaction-semantics-candidate-stable',
    status: source.status === 'candidate-stable' ? 'satisfied' : 'blocked',
    reason: source.status === 'candidate-stable'
      ? 'mod-lock transaction semantics reached an internal candidate terminal state'
      : 'ordinary install transaction requires a candidate-stable terminal semantics source'
  }),
  Object.freeze({
    id: 'install-target-present',
    status: source.requestedCommandId === 'install' && source.targetPackageId !== undefined ? 'satisfied' : 'blocked',
    reason: source.requestedCommandId === 'install' && source.targetPackageId !== undefined
      ? 'install target is present'
      : 'ordinary install transaction requires an install target'
  }),
  Object.freeze({
    id: 'candidate-hash-present',
    status: source.candidateHash !== undefined ? 'satisfied' : 'blocked',
    reason: source.candidateHash !== undefined
      ? 'candidate hash is present'
      : 'ordinary install transaction requires a candidate hash'
  }),
  Object.freeze({
    id: 'lockfile-hash-present',
    status: source.lockfileHash !== undefined ? 'satisfied' : 'blocked',
    reason: source.lockfileHash !== undefined
      ? 'lockfile hash is present'
      : 'ordinary install transaction requires a lockfile hash'
  }),
  Object.freeze({
    id: 'public-api-deferred',
    status: publicApiDeferred ? 'satisfied' : 'blocked',
    reason: publicApiDeferred
      ? 'public mod-lock schema and transaction API remain deferred'
      : 'ordinary install transaction cannot freeze public mod-lock schema/API or alter schemaSetHash'
  }),
  Object.freeze({
    id: 'contained-effects-intact',
    status: effectsIntact && !forbiddenFieldFound ? 'satisfied' : 'blocked',
    reason: effectsIntact && !forbiddenFieldFound
      ? 'terminal semantics keeps real transaction/runtime/write effects contained'
      : 'terminal semantics exposed unsafe host state or real transaction/runtime/write effects'
  })
])

const hasForbiddenField = (value: unknown): boolean => {
  if (value === null || typeof value !== 'object') return false
  return forbiddenFields.some(field => Reflect.getOwnPropertyDescriptor(value, field) !== undefined)
}

const effectsFromSource = (
  source?: ThirdPartyDataPackModLockTransactionSemanticsSourceResult,
  ready = false,
  sourceCalled = false
): ThirdPartyDataPackOrdinaryInstallTransactionEffectSummary => Object.freeze({
  ordinaryInstallTransactionPipelineCalled: true,
  modLockTransactionSemanticsSourceCalled: sourceCalled,
  ordinaryInstallTransactionReady: ready,
  successOutcomeAccepted: ready && source?.outcomeKind === 'success',
  failureOutcomeAccepted: ready && source?.outcomeKind === 'failure',
  retryOutcomeAccepted: ready && source?.outcomeKind === 'retry',
  rollbackOutcomeAccepted: ready && source?.outcomeKind === 'rollback',
  publicModLockSchemaFrozen: false,
  publicTransactionApiFrozen: false,
  publicApiReleaseAllowed: false,
  publicSchemaSetHashChanged: false,
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
  postCommitVerificationExecuted: false,
  transactionLogRead: false,
  packageStateRead: false,
  settingsRead: false,
  lockfileRead: false,
  liveRegistryRead: false,
  saveRead: false,
  saveCacheIsolationChecked: false,
  successEnvelopeDelivered: source?.effects.successEnvelopeDelivered === true,
  failureEnvelopeDelivered: source?.effects.failureEnvelopeDelivered === true,
  retryStateDelivered: source?.effects.retryStateDelivered === true,
  rollbackStateDelivered: source?.effects.rollbackStateDelivered === true,
  uiIpcResponseDelivered: source?.effects.uiIpcResponseDelivered === true,
  rollbackRecoverySettled: source?.effects.rollbackRecoverySettled === true,
  rollbackRecoveryExecutionAcknowledged: source?.effects.rollbackRecoveryExecutionAcknowledged === true,
  packageFilesWritten: source?.effects.packageFilesWritten === true,
  packageBackupsWritten: source?.effects.packageBackupsWritten === true,
  packageFilesRestored: false,
  lockfileWritten: source?.effects.lockfileWritten === true,
  lockfileRestored: false,
  settingsWritten: source?.effects.settingsWritten === true,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const publicApiDeferred = (source: ThirdPartyDataPackModLockTransactionSemanticsSourceResult): boolean =>
  source.publicModLockSchemaFrozen === false
  && source.publicTransactionApiFrozen === false
  && source.publicApiReleaseAllowed === false
  && source.publicSchemaSetHashChanged === false
  && source.effects.publicModLockSchemaFrozen === false
  && source.effects.publicTransactionApiFrozen === false
  && source.effects.publicApiReleaseAllowed === false
  && source.effects.publicSchemaSetHashChanged === false

const containedEffectsIntact = (source: ThirdPartyDataPackModLockTransactionSemanticsSourceResult): boolean =>
  source.effects.transactionCommitted === false
  && source.effects.transactionLogPrepared === false
  && source.effects.runtimePublicationCommitted === false
  && source.effects.postCommitVerificationExecuted === false
  && source.effects.transactionLogRead === false
  && source.effects.packageStateRead === false
  && source.effects.settingsRead === false
  && source.effects.lockfileRead === false
  && source.effects.liveRegistryRead === false
  && source.effects.saveRead === false
  && source.effects.saveCacheIsolationChecked === false
  && source.effects.packageFilesRestored === false
  && source.effects.lockfileRestored === false
  && source.effects.settingsRestored === false
  && source.effects.savesWritten === false
  && source.effects.cacheWritten === false
  && source.effects.transactionLogWritten === false
  && source.effects.recoveryLogRead === false
  && source.effects.recoveryLogReplayed === false
  && source.effects.rollbackExecuted === false
  && source.effects.diagnosticsWritten === false

const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child)
    Object.freeze(value)
  }
  return value
}

const baseResult = (options: {
  readonly status: ThirdPartyDataPackOrdinaryInstallTransactionPipelineStatus
  readonly reason: string
  readonly enabled: boolean
  readonly sourceCalled: boolean
  readonly readOnly?: boolean
  readonly source?: ThirdPartyDataPackModLockTransactionSemanticsSourceResult
  readonly checks?: readonly ThirdPartyDataPackOrdinaryInstallTransactionPipelineCheck[]
  readonly diagnostics?: readonly ThirdPartyDataPackOrdinaryInstallTransactionSafeDiagnostic[]
}): ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult => {
  const source = options.source
  const ready = options.status === 'ready'
  return deepFreeze({
    kind: THIRD_PARTY_DATA_PACK_ORDINARY_INSTALL_TRANSACTION_PIPELINE_KIND,
    mode: THIRD_PARTY_DATA_PACK_ORDINARY_INSTALL_TRANSACTION_PIPELINE_MODE,
    status: options.status,
    reason: options.reason,
    readOnly: options.readOnly ?? true,
    enabled: options.enabled,
    pipelineCalled: options.enabled,
    sourceCalled: options.sourceCalled,
    modLockTransactionSemanticsStatus: source?.status,
    semanticsVersion: 1,
    stability: 'internal-candidate',
    publicModLockSchemaFrozen: false,
    publicTransactionApiFrozen: false,
    publicApiReleaseAllowed: false,
    publicSchemaSetHashChanged: false,
    requestedCommandId: source?.requestedCommandId === 'install' ? 'install' : undefined,
    targetPackageId: safePackageId(source?.targetPackageId),
    outcomeKind: source?.outcomeKind,
    selectedPackageIds: copyPackageIds(source?.selectedPackageIds),
    blockedPackageIds: copyPackageIds(source?.blockedPackageIds),
    blockedCandidateCount: Number.isFinite(source?.blockedCandidateCount) ? source!.blockedCandidateCount : 0,
    loadOrder: copyPackageIds(source?.loadOrder),
    registryCount: Number.isFinite(source?.registryCount) ? source!.registryCount : 54,
    entryCount: Number.isFinite(source?.entryCount) ? source!.entryCount : 4242,
    packageCount: Number.isFinite(source?.packageCount) ? source!.packageCount : 0,
    candidateIdentity: source?.candidateIdentity,
    candidateHash: source?.candidateHash,
    lockfileHash: source?.lockfileHash,
    messageKey: safeString(source?.messageKey, ''),
    recovery: diagnosticRecoveries.has(source?.recovery as ModDiagnosticRecovery)
      ? source!.recovery
      : 'none',
    retryable: source?.retryable === true,
    rollbackRequired: source?.rollbackRequired === true,
    commandContinuationAllowed: ready && source?.commandContinuationAllowed === true,
    uiIpcResultContinuationAllowed: ready && source?.uiIpcResultContinuationAllowed === true,
    startupGateContinuationAllowed: ready && source?.startupGateContinuationAllowed === true,
    persistentPackageWriteAcknowledged: ready && source?.persistentPackageWriteAcknowledged === true,
    persistentSettingsLockfileWriteAcknowledged: ready && source?.persistentSettingsLockfileWriteAcknowledged === true,
    uiIpcDeliveryAcknowledged: ready && source?.uiIpcDeliveryAcknowledged === true,
    rollbackRecoverySettled: ready && source?.rollbackRecoverySettled === true,
    rollbackRecoveryExecutionAcknowledged: ready && source?.rollbackRecoveryExecutionAcknowledged === true,
    ordinaryInstallTransactionReady: ready,
    checks: options.checks ?? skippedChecks(options.reason),
    diagnostics: options.diagnostics ?? copyDiagnostics(source?.diagnostics),
    effects: effectsFromSource(source, ready, options.sourceCalled)
  })
}

const evaluateOrdinaryInstallTransactionPipeline = async(
  options: CreateThirdPartyDataPackOrdinaryInstallTransactionPipelineOptions
): Promise<ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult> => {
  if (options.enabled !== true) {
    return baseResult({
      status: 'skipped',
      reason: 'third-party ordinary install transaction pipeline is disabled by default',
      enabled: false,
      sourceCalled: false
    })
  }

  if (options.readModLockTransactionSemanticsSource === undefined) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party ordinary install transaction pipeline is enabled without a mod-lock transaction semantics source',
      enabled: true,
      sourceCalled: false,
      checks: skippedChecks('mod-lock transaction semantics source is missing'),
      diagnostics: Object.freeze([
        commandDiagnostic('third-party.ordinary-install-transaction-pipeline.missing-semantics-source')
      ])
    })
  }

  let source: ThirdPartyDataPackModLockTransactionSemanticsSourceResult
  try {
    source = await options.readModLockTransactionSemanticsSource()
  } catch {
    return baseResult({
      status: 'blocked',
      reason: 'third-party mod-lock transaction semantics source failed before ordinary install transaction',
      enabled: true,
      sourceCalled: true,
      checks: skippedChecks('mod-lock transaction semantics source failed'),
      diagnostics: Object.freeze([
        commandDiagnostic('third-party.ordinary-install-transaction-pipeline.semantics-source-failed')
      ])
    })
  }

  if (source.status === 'skipped') {
    return baseResult({
      status: 'skipped',
      reason: 'third-party ordinary install transaction is not required because mod-lock transaction semantics were skipped',
      enabled: true,
      sourceCalled: true,
      readOnly: true,
      source,
      checks: skippedChecks('mod-lock transaction semantics source was skipped')
    })
  }

  const publicDeferred = publicApiDeferred(source)
  const effectsIntact = containedEffectsIntact(source)
  const forbiddenFieldFound = hasForbiddenField(source)
  const checks = buildChecks(source, effectsIntact, publicDeferred, forbiddenFieldFound)
  const blocked = checks.some(check => check.status === 'blocked')

  if (blocked) {
    return baseResult({
      status: 'blocked',
      reason: 'third-party ordinary install transaction requires stable internal semantics without public API or real transaction effects',
      enabled: true,
      sourceCalled: true,
      readOnly: true,
      source,
      checks,
      diagnostics: Object.freeze([
        ...copyDiagnostics(source.diagnostics),
        commandDiagnostic('third-party.ordinary-install-transaction-pipeline.terminal-blocked', safePackageId(source.targetPackageId))
      ])
    })
  }

  return baseResult({
    status: 'ready',
    reason: 'third-party ordinary install transaction pipeline accepted internal terminal semantics',
    enabled: true,
    sourceCalled: true,
    readOnly: source.readOnly,
    source,
    checks
  })
}

export const createThirdPartyDataPackOrdinaryInstallTransactionPipeline = (
  options: CreateThirdPartyDataPackOrdinaryInstallTransactionPipelineOptions = {}
): (() => Promise<ThirdPartyDataPackOrdinaryInstallTransactionPipelineResult>) => async() => {
  const result = await evaluateOrdinaryInstallTransactionPipeline(options)
  if (result.status === 'blocked') throw new ThirdPartyDataPackOrdinaryInstallTransactionBlockedError(result)
  return result
}

export const thirdPartyDataPackOrdinaryInstallTransactionPipeline =
  createThirdPartyDataPackOrdinaryInstallTransactionPipeline()
