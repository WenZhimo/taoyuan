import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

export type ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightCheckId =
  | 'result-envelope-contract-ready'
  | 'path-free-envelope-present'
  | 'install-command-envelope'
  | 'target-package-consistent'
  | 'candidate-hash-consistent'
  | 'lockfile-hash-consistent'
  | 'path-free-diagnostics-intact'
  | 'no-response-delivery-effects-intact'

export type ThirdPartyDataPackUiIpcResponseDeliveryAdapterStageId =
  | 'response-delivery-adapter-preflight-inspection'
  | 'path-free-envelope-serialization'
  | 'electron-response-delivery-adapter'
  | 'web-response-delivery-adapter'
  | 'android-response-delivery-adapter'
  | 'startup-gate-handoff'
  | 'delivery-acknowledgement-finalization'

export type ThirdPartyDataPackUiIpcResponseDeliveryAdapterRequirementId =
  | 'path-free-envelope-serializer'
  | 'electron-preload-response-channel'
  | 'web-ui-response-event-sink'
  | 'android-native-response-event-sink'
  | 'startup-gate-result-handoff'
  | 'delivery-acknowledgement-source'
  | 'redacted-delivery-diagnostics'
  | 'no-delivery-side-effect-guard'

export interface ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightCheck {
  readonly id: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryAdapterStage {
  readonly id: ThirdPartyDataPackUiIpcResponseDeliveryAdapterStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryAdapterRequirement {
  readonly id: ThirdPartyDataPackUiIpcResponseDeliveryAdapterRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryAdapterEffectSummary {
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
  readonly electronIpcResponseSent: false
  readonly webFilePickerOpened: false
  readonly webUiBridgeOpened: false
  readonly webUiResponsePublished: false
  readonly androidFilePickerOpened: false
  readonly androidUiBridgeOpened: false
  readonly androidUiResponsePublished: false
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
  readonly saveCacheIsolationChecked: false
  readonly successEnvelopeDelivered: false
  readonly failureEnvelopeDelivered: false
  readonly retryStateDelivered: false
  readonly rollbackStateDelivered: false
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

export interface ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult {
  readonly status: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightStatus
  readonly sourceEnvelopeContractStatus: ThirdPartyDataPackUiIpcResultEnvelopeContractResult['status']
  readonly reason: string
  readonly uiIpcResponseDeliveryAdapterPreflight: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightStatus
  readonly readOnly: true
  readonly deliveryEnvelopePrepared: boolean
  readonly uiIpcResponseDeliveryAllowed: false
  readonly electronIpcAllowed: false
  readonly webUiBridgeAllowed: false
  readonly androidUiBridgeAllowed: false
  readonly startupGateHandoffAllowed: false
  readonly deliveryAcknowledgementAllowed: false
  readonly commandDispatchAllowed: false
  readonly transactionCommitAllowed: false
  readonly postCommitVerificationAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly writeAllowed: false
  readonly rollbackRecoveryAllowed: false
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly envelopeKind?: ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind
  readonly messageKey?: string
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidateCount: number
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly deliveryEnvelope?: ThirdPartyDataPackUiIpcResultEnvelope
  readonly checks: readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly deliveryStages: readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterStage[]
  readonly requiredDeliveryAdapters: readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterRequirement[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackUiIpcResponseDeliveryAdapterEffectSummary
}

export interface BuildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightOptions {
  readonly envelopeContract: ThirdPartyDataPackUiIpcResultEnvelopeContractResult
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
const outcomeKinds = new Set<ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind>([
  'success',
  'failure',
  'retry',
  'rollback'
])

const createEffectSummary = (): ThirdPartyDataPackUiIpcResponseDeliveryAdapterEffectSummary => ({
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
  electronIpcResponseSent: false,
  webFilePickerOpened: false,
  webUiBridgeOpened: false,
  webUiResponsePublished: false,
  androidFilePickerOpened: false,
  androidUiBridgeOpened: false,
  androidUiResponsePublished: false,
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
  saveCacheIsolationChecked: false,
  successEnvelopeDelivered: false,
  failureEnvelopeDelivered: false,
  retryStateDelivered: false,
  rollbackStateDelivered: false,
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
  value: object,
  fieldName: string
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const readOwnBooleanField = (
  value: object,
  fieldName: string
): boolean | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'boolean' ? field : undefined
}

const readOwnNumberField = (
  value: object,
  fieldName: string
): number | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
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
      ?? 'third-party.ui-ipc-response-delivery-adapter-preflight.diagnostic-copy',
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

const everyOwnDataValueFalse = (value: object): boolean => {
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

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const cloneSummary = (
  summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary | undefined,
  fallback: ThirdPartyDataPackUiIpcResultEnvelopeContractResult
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => {
  const source = summary !== undefined && typeof summary === 'object' ? summary : fallback.summary
  return Object.freeze({
    selectedPackageCount: readOwnNumberField(source, 'selectedPackageCount') ?? clonePackageIds(fallback.selectedPackageIds).length,
    blockedPackageCount: readOwnNumberField(source, 'blockedPackageCount') ?? clonePackageIds(fallback.blockedPackageIds).length,
    blockedCandidateCount: readOwnNumberField(source, 'blockedCandidateCount') ?? fallback.blockedCandidateCount,
    loadOrderCount: readOwnNumberField(source, 'loadOrderCount') ?? clonePackageIds(fallback.loadOrder).length,
    registryCount: readOwnNumberField(source, 'registryCount') ?? fallback.registryCount,
    entryCount: readOwnNumberField(source, 'entryCount') ?? fallback.entryCount,
    packageCount: readOwnNumberField(source, 'packageCount') ?? fallback.packageCount,
    diagnosticCount: readOwnNumberField(source, 'diagnosticCount') ?? safeDiagnostics(fallback.diagnostics).length
  })
}

const cloneEnvelope = (
  envelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined,
  fallback: ThirdPartyDataPackUiIpcResultEnvelopeContractResult
): ThirdPartyDataPackUiIpcResultEnvelope | undefined => {
  if (envelope === undefined || envelope === null || typeof envelope !== 'object') return undefined
  const formatVersion = readOwnNumberField(envelope, 'formatVersion')
  const kind = readOwnStringField(envelope, 'kind')
  const commandId = readOwnStringField(envelope, 'commandId')
  const packageId = readOwnStringField(envelope, 'packageId')
  const messageKey = readOwnStringField(envelope, 'messageKey')
  const recovery = readOwnDataField(envelope, 'recovery')
  if (
    formatVersion !== 1
    || !outcomeKinds.has(kind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind)
    || commandId !== 'install'
    || packageId === undefined
    || messageKey === undefined
    || !diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)
  ) {
    return undefined
  }

  return Object.freeze({
    formatVersion: 1,
    kind: kind as ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
    commandId: 'install',
    packageId: packageId as PackageId,
    candidateHash: readOwnStringField(envelope, 'candidateHash') as Sha256Hash | undefined,
    lockfileHash: readOwnStringField(envelope, 'lockfileHash') as Sha256Hash | undefined,
    messageKey,
    recovery: recovery as ModDiagnosticRecovery,
    retryable: readOwnBooleanField(envelope, 'retryable') === true,
    rollbackRequired: readOwnBooleanField(envelope, 'rollbackRequired') === true,
    summary: cloneSummary(readOwnDataField(envelope, 'summary') as ThirdPartyDataPackUiIpcResultEnvelopeSummary | undefined, fallback),
    diagnostics: safeDiagnostics(readOwnDataField(envelope, 'diagnostics') as readonly unknown[] | undefined)
  })
}

const check = (
  id: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightCheckId,
  status: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightCheck['status'],
  reason: string
): ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightCheck[] => Object.freeze([
  'result-envelope-contract-ready',
  'path-free-envelope-present',
  'install-command-envelope',
  'target-package-consistent',
  'candidate-hash-consistent',
  'lockfile-hash-consistent',
  'path-free-diagnostics-intact',
  'no-response-delivery-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightCheckId,
  'skipped',
  reason
)))

const noDeliveryEffectsIntact = (
  source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult
): boolean => source.uiIpcResponseDeliveryAllowed === false
  && source.electronIpcAllowed === false
  && source.webUiBridgeAllowed === false
  && source.androidUiBridgeAllowed === false
  && source.commandDispatchAllowed === false
  && source.transactionCommitAllowed === false
  && source.postCommitVerificationAllowed === false
  && source.runtimeEnablementAllowed === false
  && source.writeAllowed === false
  && source.rollbackRecoveryAllowed === false
  && everyOwnDataValueFalse(source.effects)

const pathFreeDiagnosticsIntact = (
  envelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined
): boolean => envelope !== undefined
  && safeDiagnostics(envelope.diagnostics).every(diagnostic =>
    !JSON.stringify(diagnostic).includes('C:/Users')
    && !JSON.stringify(diagnostic).includes('LENOVO')
    && !('file' in diagnostic)
    && !('fieldPath' in diagnostic)
    && !('details' in diagnostic)
  )

const candidateHashConsistent = (
  source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  envelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined
): boolean => {
  if (envelope === undefined) return false
  const expected = source.candidateIdentity?.candidateHash
  if (envelope.kind === 'success') return expected !== undefined && envelope.candidateHash === expected
  return envelope.candidateHash === undefined || (expected !== undefined && envelope.candidateHash === expected)
}

const lockfileHashConsistent = (
  source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  envelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined
): boolean => {
  if (envelope === undefined) return false
  if (envelope.kind === 'success') return source.lockfileHash !== undefined && envelope.lockfileHash === source.lockfileHash
  return envelope.lockfileHash === undefined || envelope.lockfileHash === source.lockfileHash
}

const buildChecks = (
  source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  envelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined
): readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightCheck[] => Object.freeze([
  check(
    'result-envelope-contract-ready',
    source.status === 'ready' ? 'satisfied' : 'blocked',
    'UI/IPC response delivery adapter preflight requires a ready path-free result envelope contract.'
  ),
  check(
    'path-free-envelope-present',
    envelope !== undefined ? 'satisfied' : 'blocked',
    'A response delivery adapter can only inspect a cloned path-free envelope.'
  ),
  check(
    'install-command-envelope',
    source.requestedCommandId === 'install' && envelope?.commandId === 'install' ? 'satisfied' : 'blocked',
    'The first delivery adapter preflight only covers install result envelopes.'
  ),
  check(
    'target-package-consistent',
    source.targetPackageId !== undefined
      && envelope?.packageId === source.targetPackageId
      && clonePackageIds(source.selectedPackageIds).includes(source.targetPackageId)
      ? 'satisfied'
      : 'blocked',
    'The delivery envelope must describe the same selected target package as the source contract.'
  ),
  check(
    'candidate-hash-consistent',
    candidateHashConsistent(source, envelope) ? 'satisfied' : 'blocked',
    'Delivery adapters must not receive candidate hash data that drifts from the source envelope contract.'
  ),
  check(
    'lockfile-hash-consistent',
    lockfileHashConsistent(source, envelope) ? 'satisfied' : 'blocked',
    'Delivery adapters must not receive lockfile hash data that drifts from the source envelope contract.'
  ),
  check(
    'path-free-diagnostics-intact',
    pathFreeDiagnosticsIntact(envelope) ? 'satisfied' : 'blocked',
    'Delivery diagnostics must stay redacted before any Electron, Web or Android response sink exists.'
  ),
  check(
    'no-response-delivery-effects-intact',
    noDeliveryEffectsIntact(source) ? 'satisfied' : 'blocked',
    'The source envelope contract must not carry IPC, UI bridge, runtime, read, write, rollback or response-delivery effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.ui-ipc-response-delivery-adapter-preflight.checks.${currentCheck.id}`,
    packageId
  )))

const requirement = (
  id: ThirdPartyDataPackUiIpcResponseDeliveryAdapterRequirementId,
  reason: string
): ThirdPartyDataPackUiIpcResponseDeliveryAdapterRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const requiredDeliveryAdapters = (): readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterRequirement[] =>
  Object.freeze([
    requirement(
      'path-free-envelope-serializer',
      'Only the sanitized envelope copy may cross UI/IPC boundaries; source reports, outcomes and candidate artifacts remain hidden.'
    ),
    requirement(
      'electron-preload-response-channel',
      'Electron delivery must use a fixed preload channel and must not accept renderer-provided filesystem paths.'
    ),
    requirement(
      'web-ui-response-event-sink',
      'Web delivery must publish the response into an in-memory UI sink without implicitly reopening file pickers or storage writes.'
    ),
    requirement(
      'android-native-response-event-sink',
      'Android delivery must forward only the path-free envelope and must not expose SAF or app-private absolute paths.'
    ),
    requirement(
      'startup-gate-result-handoff',
      'Startup may proceed only after a separate gate consumes a settled response; this preflight does not mark startup success.'
    ),
    requirement(
      'delivery-acknowledgement-source',
      'Delivery acknowledgement must be explicit so retries and rollback prompts are not inferred from adapter construction.'
    ),
    requirement(
      'redacted-delivery-diagnostics',
      'Any response diagnostics must keep file, fieldPath, details and host path fragments out of UI-visible payloads.'
    ),
    requirement(
      'no-delivery-side-effect-guard',
      'Creating adapter contracts must not dispatch commands, write package state, publish registries or mutate saves/settings/cache.'
    )
  ])

const stage = (
  id: ThirdPartyDataPackUiIpcResponseDeliveryAdapterStageId,
  status: ThirdPartyDataPackUiIpcResponseDeliveryAdapterStage['status'],
  requirementIds: readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterRequirementId[],
  reason: string
): ThirdPartyDataPackUiIpcResponseDeliveryAdapterStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterStage[] => Object.freeze([
  stage(
    'response-delivery-adapter-preflight-inspection',
    'satisfied',
    ['path-free-envelope-serializer', 'no-delivery-side-effect-guard'],
    'The path-free result envelope is consistent enough to inspect response delivery adapter requirements.'
  ),
  stage(
    'path-free-envelope-serialization',
    'deferred',
    ['path-free-envelope-serializer', 'redacted-delivery-diagnostics'],
    'Serialize only the sanitized envelope copy before any UI/IPC response channel is wired.'
  ),
  stage(
    'electron-response-delivery-adapter',
    'deferred',
    ['electron-preload-response-channel', 'delivery-acknowledgement-source'],
    'Electron response delivery remains deferred until a fixed preload channel is implemented.'
  ),
  stage(
    'web-response-delivery-adapter',
    'deferred',
    ['web-ui-response-event-sink', 'delivery-acknowledgement-source'],
    'Web response delivery remains deferred until an explicit UI event sink is implemented.'
  ),
  stage(
    'android-response-delivery-adapter',
    'deferred',
    ['android-native-response-event-sink', 'delivery-acknowledgement-source'],
    'Android response delivery remains deferred until the native UI bridge is implemented and probed.'
  ),
  stage(
    'startup-gate-handoff',
    'deferred',
    ['startup-gate-result-handoff', 'no-delivery-side-effect-guard'],
    'Startup success or failure handoff remains deferred and must not be inferred from this preflight.'
  ),
  stage(
    'delivery-acknowledgement-finalization',
    'deferred',
    ['delivery-acknowledgement-source', 'redacted-delivery-diagnostics'],
    'Delivery acknowledgement, retry state and rollback prompts remain deferred until real sinks exist.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterStage[] => Object.freeze([
  'response-delivery-adapter-preflight-inspection',
  'path-free-envelope-serialization',
  'electron-response-delivery-adapter',
  'web-response-delivery-adapter',
  'android-response-delivery-adapter',
  'startup-gate-handoff',
  'delivery-acknowledgement-finalization'
].map(id => stage(id as ThirdPartyDataPackUiIpcResponseDeliveryAdapterStageId, status, [], reason)))

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
  status: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightStatus,
  reason: string,
  source: ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  checks: readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  deliveryStages: readonly ThirdPartyDataPackUiIpcResponseDeliveryAdapterStage[],
  includeRequirements: boolean,
  deliveryEnvelope?: ThirdPartyDataPackUiIpcResultEnvelope
): ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult => {
  const selectedPackageIds = clonePackageIds(source.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(source.blockedPackageIds)
  const loadOrder = clonePackageIds(source.loadOrder)
  const resultSummary = deliveryEnvelope?.summary ?? cloneSummary(source.summary, source)

  return deepFreezeObjectGraph({
    status,
    sourceEnvelopeContractStatus: source.status,
    reason,
    uiIpcResponseDeliveryAdapterPreflight: status,
    readOnly: true,
    deliveryEnvelopePrepared: deliveryEnvelope !== undefined,
    uiIpcResponseDeliveryAllowed: false,
    electronIpcAllowed: false,
    webUiBridgeAllowed: false,
    androidUiBridgeAllowed: false,
    startupGateHandoffAllowed: false,
    deliveryAcknowledgementAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: source.requestedCommandId === 'install' ? 'install' as const : undefined,
    targetPackageId: source.targetPackageId,
    envelopeKind: deliveryEnvelope?.kind,
    messageKey: deliveryEnvelope?.messageKey,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: source.blockedCandidateCount,
    loadOrder,
    registryCount: source.registryCount,
    entryCount: source.entryCount,
    packageCount: source.packageCount,
    candidateIdentity: cloneCandidateIdentity(source.candidateIdentity),
    lockfileHash: source.lockfileHash,
    ...(deliveryEnvelope === undefined ? {} : { deliveryEnvelope }),
    checks,
    diagnostics,
    deliveryStages,
    requiredDeliveryAdapters: includeRequirements ? requiredDeliveryAdapters() : Object.freeze([]),
    summary: resultSummary,
    effects: createEffectSummary()
  })
}

export const buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight = (
  options: BuildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightOptions
): ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult => {
  const source = options.envelopeContract

  if (source.status === 'skipped') {
    return baseResult(
      'skipped',
      source.reason,
      source,
      skippedChecks(source.reason),
      [],
      terminalStages('skipped', source.reason),
      false
    )
  }

  if (source.status === 'blocked') {
    return baseResult(
      'blocked',
      source.reason,
      source,
      skippedChecks(source.reason),
      safeDiagnostics(source.diagnostics),
      terminalStages('blocked', source.reason),
      false
    )
  }

  const deliveryEnvelope = cloneEnvelope(source.envelope, source)
  const checks = buildChecks(source, deliveryEnvelope)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, source.targetPackageId)
  const sourceDiagnostics = safeDiagnostics(source.diagnostics)
  const envelopeDiagnostics = safeDiagnostics(deliveryEnvelope?.diagnostics)

  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'UI/IPC response delivery adapter preflight inputs are inconsistent',
      source,
      checks,
      [
        ...sourceDiagnostics,
        ...envelopeDiagnostics,
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'UI/IPC response delivery adapter preflight inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'UI/IPC response delivery adapter preflight is inspect-only until Electron, Web and Android response sinks are implemented',
    source,
    checks,
    [
      ...sourceDiagnostics,
      ...envelopeDiagnostics
    ],
    deferredStages(),
    true,
    deliveryEnvelope
  )
}
