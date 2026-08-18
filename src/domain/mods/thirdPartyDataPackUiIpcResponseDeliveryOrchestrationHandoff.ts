import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
} from './thirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoff'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight,
  type ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult
} from './thirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight'
import {
  buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract,
  type ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter,
  type ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
} from './thirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract'
import {
  buildThirdPartyDataPackUiIpcResultEnvelopeContract,
  type ThirdPartyDataPackUiIpcResultEnvelope,
  type ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  type ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  type ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  type ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'
import type {
  ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
} from './thirdPartyDataPackUiIpcResultNormalizationPreflight'

export type ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffCheckId =
  | 'result-normalization-preflight-deferred'
  | 'post-commit-outcome-handoff-ready'
  | 'path-free-outcome-source-present'
  | 'target-package-consistent'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'result-envelope-contract-ready'
  | 'response-delivery-preflight-deferred'
  | 'platform-split-contract-deferred'
  | 'no-orchestration-effects-intact'

export type ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationStageId =
  | 'response-delivery-orchestration-inspection'
  | 'result-envelope-normalization'
  | 'response-delivery-adapter-preflight'
  | 'platform-response-delivery-split'
  | 'real-platform-response-delivery'
  | 'startup-gate-handoff'

export type ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationRequirementId =
  | 'path-free-outcome-source'
  | 'result-envelope-contract'
  | 'response-delivery-adapter-preflight'
  | 'platform-response-delivery-split'
  | 'real-platform-response-sink'
  | 'startup-gate-result-handoff'
  | 'no-delivery-side-effect-guard'

export interface ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffCheck {
  readonly id: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationStage {
  readonly id: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationRequirement {
  readonly id: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationEffectSummary {
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
  readonly uiIpcOutcomeConsumed: boolean
  readonly resultEnvelopeNormalized: boolean
  readonly responseDeliveryPreflightPrepared: boolean
  readonly platformSplitPrepared: boolean
}

export interface ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult {
  readonly status: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffStatus
  readonly resultNormalizationPreflightStatus: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult['status']
  readonly postCommitVerificationUiIpcOutcomeHandoffStatus: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult['status']
  readonly resultEnvelopeContractStatus?: ThirdPartyDataPackUiIpcResultEnvelopeContractResult['status']
  readonly responseDeliveryPreflightStatus?: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult['status']
  readonly platformSplitContractStatus?: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult['status']
  readonly reason: string
  readonly uiIpcResponseDeliveryOrchestrationHandoff: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffStatus
  readonly readOnly: true
  readonly orchestrationPrepared: boolean
  readonly envelopeNormalized: boolean
  readonly deliveryEnvelopePrepared: boolean
  readonly platformSplitPrepared: boolean
  readonly uiIpcResponseDeliveryAllowed: false
  readonly electronIpcAllowed: false
  readonly electronResponseDeliveryAllowed: false
  readonly webUiBridgeAllowed: false
  readonly webResponseDeliveryAllowed: false
  readonly androidUiBridgeAllowed: false
  readonly androidResponseDeliveryAllowed: false
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
  readonly checks: readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly orchestrationStages: readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationStage[]
  readonly orchestrationRequirements: readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationRequirement[]
  readonly platformAdapters: readonly ThirdPartyDataPackUiIpcResponseDeliveryPlatformAdapter[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationEffectSummary
}

export interface BuildThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffOptions {
  readonly resultNormalizationPreflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult
  readonly postCommitVerificationUiIpcOutcomeHandoff: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
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
      ?? 'third-party.ui-ipc-response-delivery-orchestration-handoff.diagnostic-copy',
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

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.ui-ipc-response-delivery-orchestration-handoff.checks.${currentCheck.id}`,
    packageId
  )))

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const cloneSummary = (
  summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary | undefined,
  fallback: {
    readonly selectedPackageIds: readonly PackageId[]
    readonly blockedPackageIds: readonly PackageId[]
    readonly blockedCandidateCount: number
    readonly loadOrder: readonly PackageId[]
    readonly registryCount: number
    readonly entryCount: number
    readonly packageCount: number
    readonly diagnostics?: readonly unknown[]
  }
): ThirdPartyDataPackUiIpcResultEnvelopeSummary => {
  if (summary !== undefined) return Object.freeze({ ...summary })
  return Object.freeze({
    selectedPackageCount: clonePackageIds(fallback.selectedPackageIds).length,
    blockedPackageCount: clonePackageIds(fallback.blockedPackageIds).length,
    blockedCandidateCount: fallback.blockedCandidateCount,
    loadOrderCount: clonePackageIds(fallback.loadOrder).length,
    registryCount: fallback.registryCount,
    entryCount: fallback.entryCount,
    packageCount: fallback.packageCount,
    diagnosticCount: safeDiagnostics(fallback.diagnostics).length
  })
}

const check = (
  id: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffCheckId,
  status: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffCheck['status'],
  reason: string
): ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffCheck[] => Object.freeze([
  'result-normalization-preflight-deferred',
  'post-commit-outcome-handoff-ready',
  'path-free-outcome-source-present',
  'target-package-consistent',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'result-envelope-contract-ready',
  'response-delivery-preflight-deferred',
  'platform-split-contract-deferred',
  'no-orchestration-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffCheckId,
  'skipped',
  reason
)))

const allOwnBooleanFlagsFalse = (
  value: object,
  allowedTrueKeys: readonly string[] = []
): boolean => {
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

const noOrchestrationEffectsIntact = (
  outcomeHandoff: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult,
  envelopeContract?: ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  responsePreflight?: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult,
  platformSplit?: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
): boolean => allOwnBooleanFlagsFalse(outcomeHandoff.effects, [
  'atomicCommitOutcomeConsumed',
  'postCommitVerificationOutcomeConsumed',
  'uiIpcOutcomePrepared'
])
  && (envelopeContract === undefined || allOwnBooleanFlagsFalse(envelopeContract.effects))
  && (responsePreflight === undefined || allOwnBooleanFlagsFalse(responsePreflight.effects))
  && (platformSplit === undefined || allOwnBooleanFlagsFalse(platformSplit.effects))

const candidateIdentityMatches = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  outcomeHandoff: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
): boolean => {
  const expected = preflight.candidateIdentity?.candidateHash
  const handoffCandidate = outcomeHandoff.candidateIdentity?.candidateHash
  const outcomeCandidate = outcomeHandoff.outcome?.candidateIdentity?.candidateHash
  if (expected === undefined || handoffCandidate !== expected) return false
  if (outcomeHandoff.outcome?.kind === 'success') return outcomeCandidate === expected
  return outcomeCandidate === undefined || outcomeCandidate === expected
}

const lockfileHashMatches = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  outcomeHandoff: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult
): boolean => {
  if (preflight.lockfileHash === undefined || outcomeHandoff.lockfileHash !== preflight.lockfileHash) return false
  const outcomeHash = outcomeHandoff.outcome?.lockfileHash
  if (outcomeHandoff.outcome?.kind === 'success') return outcomeHash === preflight.lockfileHash
  return outcomeHash === undefined || outcomeHash === preflight.lockfileHash
}

const buildChecks = (
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  outcomeHandoff: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult,
  envelopeContract?: ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  responsePreflight?: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult,
  platformSplit?: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
): readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffCheck[] => Object.freeze([
  check(
    'result-normalization-preflight-deferred',
    preflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'Response delivery orchestration must consume the same deferred result-normalization preflight that produced the handoff outcome.'
  ),
  check(
    'post-commit-outcome-handoff-ready',
    outcomeHandoff.status === 'ready' ? 'satisfied' : 'blocked',
    'Response delivery orchestration starts only after post-commit verification produces a ready UI/IPC outcome source.'
  ),
  check(
    'path-free-outcome-source-present',
    outcomeHandoff.outcome !== undefined && outcomeHandoff.outcome.settled === true ? 'satisfied' : 'blocked',
    'A settled path-free outcome source must be present before constructing a result envelope.'
  ),
  check(
    'target-package-consistent',
    preflight.targetPackageId !== undefined
      && outcomeHandoff.targetPackageId === preflight.targetPackageId
      && outcomeHandoff.outcome?.packageId === preflight.targetPackageId
      && clonePackageIds(preflight.selectedPackageIds).includes(preflight.targetPackageId)
      ? 'satisfied'
      : 'blocked',
    'The outcome source, envelope source preflight and selected package list must point at the same install target.'
  ),
  check(
    'candidate-identity-consistent',
    candidateIdentityMatches(preflight, outcomeHandoff) ? 'satisfied' : 'blocked',
    'The outcome handoff must not drift from the candidate identity used by result normalization.'
  ),
  check(
    'lockfile-hash-consistent',
    lockfileHashMatches(preflight, outcomeHandoff) ? 'satisfied' : 'blocked',
    'The outcome handoff must not drift from the lockfile hash used by result normalization.'
  ),
  check(
    'result-envelope-contract-ready',
    envelopeContract?.status === 'ready' && envelopeContract.envelopeNormalized === true ? 'satisfied' : 'blocked',
    'The result envelope contract must normalize the path-free outcome before any delivery preflight is inspected.'
  ),
  check(
    'response-delivery-preflight-deferred',
    responsePreflight?.status === 'deferred' && responsePreflight.deliveryEnvelopePrepared === true ? 'satisfied' : 'blocked',
    'Response delivery adapter preflight must prepare the envelope while keeping real delivery deferred.'
  ),
  check(
    'platform-split-contract-deferred',
    platformSplit?.status === 'deferred' && platformSplit.platformSplitPrepared === true ? 'satisfied' : 'blocked',
    'Platform split must prepare Electron, Web and Android delivery contracts while keeping all real sinks deferred.'
  ),
  check(
    'no-orchestration-effects-intact',
    noOrchestrationEffectsIntact(outcomeHandoff, envelopeContract, responsePreflight, platformSplit)
      ? 'satisfied'
      : 'blocked',
    'Orchestration may consume prior domain outputs but must not carry IPC, UI bridge, startup, runtime, read, write or rollback effects.'
  )
])

const stage = (
  id: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationStageId,
  status: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationStage['status'],
  requirementIds: readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationRequirementId[],
  reason: string
): ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationStage[] => Object.freeze([
  stage(
    'response-delivery-orchestration-inspection',
    'satisfied',
    ['path-free-outcome-source', 'no-delivery-side-effect-guard'],
    'Post-commit verification, UI/IPC outcome handoff and result normalization are consistent enough to orchestrate delivery contracts.'
  ),
  stage(
    'result-envelope-normalization',
    'satisfied',
    ['result-envelope-contract'],
    'The path-free outcome source has been normalized into the install result envelope contract.'
  ),
  stage(
    'response-delivery-adapter-preflight',
    'satisfied',
    ['response-delivery-adapter-preflight'],
    'The delivery adapter preflight prepared the cloned envelope without invoking a platform sink.'
  ),
  stage(
    'platform-response-delivery-split',
    'satisfied',
    ['platform-response-delivery-split'],
    'Electron, Web and Android platform delivery contracts were split for later single-platform sinks.'
  ),
  stage(
    'real-platform-response-delivery',
    'deferred',
    ['real-platform-response-sink'],
    'Real Electron, Web and Android response delivery sinks remain separate from this orchestration handoff.'
  ),
  stage(
    'startup-gate-handoff',
    'deferred',
    ['startup-gate-result-handoff'],
    'Startup gate result handoff remains deferred until the launcher/runtime boundary is implemented.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationStage[] => Object.freeze([
  'response-delivery-orchestration-inspection',
  'result-envelope-normalization',
  'response-delivery-adapter-preflight',
  'platform-response-delivery-split',
  'real-platform-response-delivery',
  'startup-gate-handoff'
].map(id => stage(
  id as ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationStageId,
  status,
  [],
  reason
)))

const orchestrationRequirements = (): readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationRequirement[] => Object.freeze([
  Object.freeze({
    id: 'path-free-outcome-source',
    status: 'required',
    reason: 'Post-commit verification must provide a settled, path-free outcome source before any result envelope exists.'
  }),
  Object.freeze({
    id: 'result-envelope-contract',
    status: 'required',
    reason: 'The UI/IPC result envelope contract owns the command, outcome kind, safe diagnostics and summary shape.'
  }),
  Object.freeze({
    id: 'response-delivery-adapter-preflight',
    status: 'required',
    reason: 'Delivery adapters must be inspected before a platform-specific sink can acknowledge the result.'
  }),
  Object.freeze({
    id: 'platform-response-delivery-split',
    status: 'required',
    reason: 'Electron, Web and Android response delivery must stay split so each platform can be verified independently.'
  }),
  Object.freeze({
    id: 'real-platform-response-sink',
    status: 'required',
    reason: 'A later slice must choose one real response sink and prove the acknowledgement path.'
  }),
  Object.freeze({
    id: 'startup-gate-result-handoff',
    status: 'required',
    reason: 'Startup handoff must remain explicit and cannot be implied by result delivery orchestration.'
  }),
  Object.freeze({
    id: 'no-delivery-side-effect-guard',
    status: 'required',
    reason: 'This orchestration must not write package, lockfile, settings, save, cache, transaction or diagnostic data.'
  })
])

const createEffectSummary = (
  prepared: boolean,
  envelopeNormalized: boolean,
  responsePreflightPrepared: boolean,
  platformSplitPrepared: boolean
): ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationEffectSummary => ({
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
  diagnosticsWritten: false,
  uiIpcOutcomeConsumed: prepared,
  resultEnvelopeNormalized: envelopeNormalized,
  responseDeliveryPreflightPrepared: responsePreflightPrepared,
  platformSplitPrepared
})

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
  status: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffStatus,
  reason: string,
  preflight: ThirdPartyDataPackUiIpcResultNormalizationPreflightResult,
  outcomeHandoff: ThirdPartyDataPackPostCommitVerificationUiIpcOutcomeHandoffResult,
  checks: readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  orchestrationStages: readonly ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationStage[],
  includeRequirements: boolean,
  envelopeContract?: ThirdPartyDataPackUiIpcResultEnvelopeContractResult,
  responsePreflight?: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult,
  platformSplit?: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult
): ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult => {
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(preflight.blockedPackageIds)
  const loadOrder = clonePackageIds(preflight.loadOrder)
  const deliveryEnvelope = platformSplit?.deliveryEnvelope ?? responsePreflight?.deliveryEnvelope ?? envelopeContract?.envelope
  const envelopeNormalized = envelopeContract?.status === 'ready' && envelopeContract.envelopeNormalized === true
  const responsePreflightPrepared = responsePreflight?.status === 'deferred'
    && responsePreflight.deliveryEnvelopePrepared === true
  const platformSplitPrepared = platformSplit?.status === 'deferred'
    && platformSplit.platformSplitPrepared === true
  const prepared = status === 'deferred'
    && envelopeNormalized
    && responsePreflightPrepared
    && platformSplitPrepared

  return deepFreezeObjectGraph({
    status,
    resultNormalizationPreflightStatus: preflight.status,
    postCommitVerificationUiIpcOutcomeHandoffStatus: outcomeHandoff.status,
    resultEnvelopeContractStatus: envelopeContract?.status,
    responseDeliveryPreflightStatus: responsePreflight?.status,
    platformSplitContractStatus: platformSplit?.status,
    reason,
    uiIpcResponseDeliveryOrchestrationHandoff: status,
    readOnly: true,
    orchestrationPrepared: prepared,
    envelopeNormalized,
    deliveryEnvelopePrepared: responsePreflightPrepared,
    platformSplitPrepared,
    uiIpcResponseDeliveryAllowed: false,
    electronIpcAllowed: false,
    electronResponseDeliveryAllowed: false,
    webUiBridgeAllowed: false,
    webResponseDeliveryAllowed: false,
    androidUiBridgeAllowed: false,
    androidResponseDeliveryAllowed: false,
    startupGateHandoffAllowed: false,
    deliveryAcknowledgementAllowed: false,
    commandDispatchAllowed: false,
    transactionCommitAllowed: false,
    postCommitVerificationAllowed: false,
    runtimeEnablementAllowed: false,
    writeAllowed: false,
    rollbackRecoveryAllowed: false,
    requestedCommandId: preflight.requestedCommandId === 'install' ? 'install' as const : undefined,
    targetPackageId: preflight.targetPackageId,
    envelopeKind: deliveryEnvelope?.kind,
    messageKey: deliveryEnvelope?.messageKey,
    selectedPackageIds,
    blockedPackageIds,
    blockedCandidateCount: preflight.blockedCandidateCount,
    loadOrder,
    registryCount: preflight.registryCount,
    entryCount: preflight.entryCount,
    packageCount: preflight.packageCount,
    candidateIdentity: cloneCandidateIdentity(preflight.candidateIdentity),
    lockfileHash: preflight.lockfileHash,
    ...(deliveryEnvelope === undefined ? {} : { deliveryEnvelope }),
    checks,
    diagnostics,
    orchestrationStages,
    orchestrationRequirements: includeRequirements ? orchestrationRequirements() : Object.freeze([]),
    platformAdapters: platformSplit?.platformAdapters ?? Object.freeze([]),
    summary: cloneSummary(platformSplit?.summary ?? responsePreflight?.summary ?? envelopeContract?.summary, preflight),
    effects: createEffectSummary(
      prepared,
      envelopeNormalized,
      responsePreflightPrepared,
      platformSplitPrepared
    )
  })
}

export const buildThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff = (
  options: BuildThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffOptions
): ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult => {
  const preflight = options.resultNormalizationPreflight
  const outcomeHandoff = options.postCommitVerificationUiIpcOutcomeHandoff

  if (preflight.status === 'skipped' || outcomeHandoff.status === 'skipped') {
    const reason = preflight.status === 'skipped' ? preflight.reason : outcomeHandoff.reason
    return baseResult(
      'skipped',
      reason,
      preflight,
      outcomeHandoff,
      skippedChecks(reason),
      [],
      terminalStages('skipped', reason),
      false
    )
  }

  if (preflight.status === 'blocked' || outcomeHandoff.status === 'blocked') {
    const reason = preflight.status === 'blocked' ? preflight.reason : outcomeHandoff.reason
    return baseResult(
      'blocked',
      reason,
      preflight,
      outcomeHandoff,
      skippedChecks(reason),
      [
        ...safeDiagnostics(preflight.diagnostics),
        ...safeDiagnostics(outcomeHandoff.diagnostics)
      ],
      terminalStages('blocked', reason),
      false
    )
  }

  let envelopeContract: ThirdPartyDataPackUiIpcResultEnvelopeContractResult | undefined
  let responsePreflight: ThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflightResult | undefined
  let platformSplit: ThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContractResult | undefined

  if (outcomeHandoff.outcome !== undefined) {
    envelopeContract = buildThirdPartyDataPackUiIpcResultEnvelopeContract({
      preflight,
      outcome: outcomeHandoff.outcome
    })
    responsePreflight = buildThirdPartyDataPackUiIpcResponseDeliveryAdapterPreflight({
      envelopeContract
    })
    platformSplit = buildThirdPartyDataPackUiIpcResponseDeliveryPlatformSplitContract({
      responseDeliveryPreflight: responsePreflight
    })
  }

  const checks = buildChecks(preflight, outcomeHandoff, envelopeContract, responsePreflight, platformSplit)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, preflight.targetPackageId)
  const diagnostics = Object.freeze([
    ...safeDiagnostics(preflight.diagnostics),
    ...safeDiagnostics(outcomeHandoff.diagnostics),
    ...safeDiagnostics(envelopeContract?.diagnostics),
    ...safeDiagnostics(responsePreflight?.diagnostics),
    ...safeDiagnostics(platformSplit?.diagnostics)
  ])

  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'UI/IPC response delivery orchestration handoff inputs are inconsistent',
      preflight,
      outcomeHandoff,
      checks,
      [
        ...diagnostics,
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'UI/IPC response delivery orchestration handoff inputs are inconsistent'),
      false,
      envelopeContract,
      responsePreflight,
      platformSplit
    )
  }

  return baseResult(
    'deferred',
    'UI/IPC result envelope and platform response delivery orchestration is prepared; real platform sinks and startup handoff remain separate',
    preflight,
    outcomeHandoff,
    checks,
    diagnostics,
    deferredStages(),
    true,
    envelopeContract,
    responsePreflight,
    platformSplit
  )
}
