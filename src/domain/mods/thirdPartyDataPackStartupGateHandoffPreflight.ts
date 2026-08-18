import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
} from './thirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoff'
import type {
  ThirdPartyDataPackUiIpcResultEnvelope,
  ThirdPartyDataPackUiIpcResultEnvelopeOutcomeKind,
  ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic,
  ThirdPartyDataPackUiIpcResultEnvelopeSummary
} from './thirdPartyDataPackUiIpcResultEnvelopeContract'

export type ThirdPartyDataPackStartupGateHandoffPreflightStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'

export type ThirdPartyDataPackStartupGateHandoffPreflightCheckId =
  | 'response-delivery-orchestration-deferred'
  | 'orchestration-prepared'
  | 'path-free-delivery-envelope-present'
  | 'platform-split-prepared'
  | 'startup-gate-explicitly-deferred'
  | 'target-package-selected'
  | 'no-response-delivery-effects'
  | 'no-startup-effects-intact'

export type ThirdPartyDataPackStartupGateHandoffStageId =
  | 'response-delivery-orchestration-consumed'
  | 'startup-gate-preflight'
  | 'launcher-startup-boundary'
  | 'persistent-install-state-read'
  | 'live-registry-identity-gate'
  | 'save-open-protection'
  | 'game-app-creation'

export type ThirdPartyDataPackStartupGateHandoffRequirementId =
  | 'startup-gate-contract'
  | 'launcher-app-boundary'
  | 'persistent-install-state-source'
  | 'live-registry-identity-source'
  | 'save-cache-isolation-source'
  | 'game-app-creation-gate'
  | 'startup-failure-reporting'
  | 'no-startup-side-effect-guard'

export interface ThirdPartyDataPackStartupGateHandoffPreflightCheck {
  readonly id: ThirdPartyDataPackStartupGateHandoffPreflightCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackStartupGateHandoffStage {
  readonly id: ThirdPartyDataPackStartupGateHandoffStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackStartupGateHandoffRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackStartupGateHandoffRequirement {
  readonly id: ThirdPartyDataPackStartupGateHandoffRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackStartupGateHandoffEffectSummary {
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
  readonly saveRead: false
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
  readonly responseDeliveryOrchestrationConsumed: boolean
  readonly startupGateHandoffPrepared: boolean
}

export interface ThirdPartyDataPackStartupGateHandoffPreflightResult {
  readonly status: ThirdPartyDataPackStartupGateHandoffPreflightStatus
  readonly responseDeliveryOrchestrationStatus: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult['status']
  readonly reason: string
  readonly startupGateHandoffPreflight: ThirdPartyDataPackStartupGateHandoffPreflightStatus
  readonly readOnly: true
  readonly startupGateHandoffPrepared: boolean
  readonly responseDeliveryOrchestrationConsumed: boolean
  readonly startupGateHandoffAllowed: false
  readonly launcherAppAllowed: false
  readonly gameAppCreationAllowed: false
  readonly piniaCreationAllowed: false
  readonly routerMountAllowed: false
  readonly saveReadAllowed: false
  readonly uiIpcResponseDeliveryAllowed: false
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
  readonly checks: readonly ThirdPartyDataPackStartupGateHandoffPreflightCheck[]
  readonly diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[]
  readonly startupStages: readonly ThirdPartyDataPackStartupGateHandoffStage[]
  readonly startupRequirements: readonly ThirdPartyDataPackStartupGateHandoffRequirement[]
  readonly summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary
  readonly effects: ThirdPartyDataPackStartupGateHandoffEffectSummary
}

export interface BuildThirdPartyDataPackStartupGateHandoffPreflightOptions {
  readonly responseDeliveryOrchestrationHandoff: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
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
const requiredPlatformIds = new Set(['electron', 'web', 'android'])

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
      ?? 'third-party.startup-gate-handoff-preflight.diagnostic-copy',
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

const cloneSummary = (
  summary: ThirdPartyDataPackUiIpcResultEnvelopeSummary | undefined,
  fallback: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
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
  fallback: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
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

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

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

const hasOwnArrayObjectWithFields = (
  values: readonly unknown[],
  fields: Readonly<Record<string, string>>
): boolean => {
  const length = readArrayLength(values)
  if (length === undefined) return false

  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(values, String(index))
    } catch {
      continue
    }
    const value = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (value === undefined || value === null || typeof value !== 'object') continue
    if (Object.entries(fields).every(([field, expected]) => readOwnStringField(value, field) === expected)) {
      return true
    }
  }
  return false
}

const platformSplitPrepared = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
): boolean => source.platformSplitPrepared === true
  && source.platformAdapters.length >= requiredPlatformIds.size
  && [...requiredPlatformIds].every(platform =>
    hasOwnArrayObjectWithFields(source.platformAdapters, {
      platform,
      status: 'deferred'
    })
  )

const startupGateExplicitlyDeferred = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
): boolean => source.startupGateHandoffAllowed === false
  && hasOwnArrayObjectWithFields(source.orchestrationStages, {
    id: 'startup-gate-handoff',
    status: 'deferred'
  })

const noResponseDeliveryEffects = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult
): boolean => source.uiIpcResponseDeliveryAllowed === false
  && source.electronIpcAllowed === false
  && source.electronResponseDeliveryAllowed === false
  && source.webUiBridgeAllowed === false
  && source.webResponseDeliveryAllowed === false
  && source.androidUiBridgeAllowed === false
  && source.androidResponseDeliveryAllowed === false
  && source.deliveryAcknowledgementAllowed === false
  && source.commandDispatchAllowed === false
  && source.transactionCommitAllowed === false
  && source.postCommitVerificationAllowed === false
  && source.runtimeEnablementAllowed === false
  && source.writeAllowed === false
  && source.rollbackRecoveryAllowed === false
  && allOwnBooleanFlagsFalse(source.effects, [
    'uiIpcOutcomeConsumed',
    'resultEnvelopeNormalized',
    'responseDeliveryPreflightPrepared',
    'platformSplitPrepared'
  ])

const targetPackageSelected = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult,
  deliveryEnvelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined
): boolean => source.targetPackageId !== undefined
  && deliveryEnvelope?.packageId === source.targetPackageId
  && clonePackageIds(source.selectedPackageIds).includes(source.targetPackageId)

const check = (
  id: ThirdPartyDataPackStartupGateHandoffPreflightCheckId,
  status: ThirdPartyDataPackStartupGateHandoffPreflightCheck['status'],
  reason: string
): ThirdPartyDataPackStartupGateHandoffPreflightCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackStartupGateHandoffPreflightCheck[] => Object.freeze([
  'response-delivery-orchestration-deferred',
  'orchestration-prepared',
  'path-free-delivery-envelope-present',
  'platform-split-prepared',
  'startup-gate-explicitly-deferred',
  'target-package-selected',
  'no-response-delivery-effects',
  'no-startup-effects-intact'
].map(id => check(
  id as ThirdPartyDataPackStartupGateHandoffPreflightCheckId,
  'skipped',
  reason
)))

const buildChecks = (
  source: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult,
  deliveryEnvelope: ThirdPartyDataPackUiIpcResultEnvelope | undefined
): readonly ThirdPartyDataPackStartupGateHandoffPreflightCheck[] => Object.freeze([
  check(
    'response-delivery-orchestration-deferred',
    source.status === 'deferred' ? 'satisfied' : 'blocked',
    'Startup handoff preflight must consume a deferred response delivery orchestration handoff.'
  ),
  check(
    'orchestration-prepared',
    source.orchestrationPrepared === true ? 'satisfied' : 'blocked',
    'Response delivery orchestration must already have prepared the envelope, delivery preflight and platform split.'
  ),
  check(
    'path-free-delivery-envelope-present',
    deliveryEnvelope !== undefined ? 'satisfied' : 'blocked',
    'Startup gate handoff can only reference a cloned path-free install delivery envelope.'
  ),
  check(
    'platform-split-prepared',
    platformSplitPrepared(source) ? 'satisfied' : 'blocked',
    'Electron, Web and Android response delivery contracts must remain present and deferred before startup handoff is inspected.'
  ),
  check(
    'startup-gate-explicitly-deferred',
    startupGateExplicitlyDeferred(source) ? 'satisfied' : 'blocked',
    'Startup handoff must stay an explicit deferred stage rather than being implied by response delivery orchestration.'
  ),
  check(
    'target-package-selected',
    targetPackageSelected(source, deliveryEnvelope) ? 'satisfied' : 'blocked',
    'The delivery envelope, target package and selected package list must describe the same install target.'
  ),
  check(
    'no-response-delivery-effects',
    noResponseDeliveryEffects(source) ? 'satisfied' : 'blocked',
    'Startup preflight may consume prepared response delivery contracts but must not inherit real delivery, runtime, read, write or rollback effects.'
  ),
  check(
    'no-startup-effects-intact',
    source.startupGateHandoffAllowed === false && source.runtimeEnablementAllowed === false && source.writeAllowed === false
      ? 'satisfied'
      : 'blocked',
    'Startup preflight must not create LauncherApp, GameApp, Pinia, router, save reads or registry publication effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackStartupGateHandoffPreflightCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.startup-gate-handoff-preflight.checks.${currentCheck.id}`,
    packageId
  )))

const requirement = (
  id: ThirdPartyDataPackStartupGateHandoffRequirementId,
  reason: string
): ThirdPartyDataPackStartupGateHandoffRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const startupRequirements = (): readonly ThirdPartyDataPackStartupGateHandoffRequirement[] =>
  Object.freeze([
    requirement(
      'startup-gate-contract',
      'Define the explicit startup gate contract before LauncherApp or GameApp treats install results as settled.'
    ),
    requirement(
      'launcher-app-boundary',
      'Launcher startup must stay separate from pure domain response orchestration and cannot be created by this preflight.'
    ),
    requirement(
      'persistent-install-state-source',
      'A later startup gate must read verified package, settings, lockfile and transaction-log state through explicit adapters.'
    ),
    requirement(
      'live-registry-identity-source',
      'GameApp creation must wait until live registry identity matches verified persistent install state.'
    ),
    requirement(
      'save-cache-isolation-source',
      'Startup handoff must prove player saves and official cache state remain isolated before opening a writable game session.'
    ),
    requirement(
      'game-app-creation-gate',
      'Pinia, router and GameApp creation must remain behind one success/failure gate.'
    ),
    requirement(
      'startup-failure-reporting',
      'Startup failure reporting must use redacted diagnostics and the existing program-directory logging boundary.'
    ),
    requirement(
      'no-startup-side-effect-guard',
      'This preflight must not mount UI, read saves or write package, lockfile, settings, save, cache, transaction or diagnostic data.'
    )
  ])

const stage = (
  id: ThirdPartyDataPackStartupGateHandoffStageId,
  status: ThirdPartyDataPackStartupGateHandoffStage['status'],
  requirementIds: readonly ThirdPartyDataPackStartupGateHandoffRequirementId[],
  reason: string
): ThirdPartyDataPackStartupGateHandoffStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackStartupGateHandoffStage[] => Object.freeze([
  stage(
    'response-delivery-orchestration-consumed',
    'satisfied',
    ['startup-gate-contract', 'no-startup-side-effect-guard'],
    'Response delivery orchestration is consistent enough to describe startup handoff requirements.'
  ),
  stage(
    'startup-gate-preflight',
    'satisfied',
    ['startup-gate-contract'],
    'Startup handoff inputs were inspected without invoking LauncherApp, GameApp or persistent reads.'
  ),
  stage(
    'launcher-startup-boundary',
    'deferred',
    ['launcher-app-boundary', 'startup-failure-reporting'],
    'LauncherApp startup wiring remains deferred to a later UI/runtime slice.'
  ),
  stage(
    'persistent-install-state-read',
    'deferred',
    ['persistent-install-state-source'],
    'Persistent package, settings, lockfile and transaction-log reads remain deferred.'
  ),
  stage(
    'live-registry-identity-gate',
    'deferred',
    ['live-registry-identity-source'],
    'Live registry publication and identity verification remain deferred.'
  ),
  stage(
    'save-open-protection',
    'deferred',
    ['save-cache-isolation-source'],
    'Save/cache isolation checks remain deferred before any save can be opened for writing.'
  ),
  stage(
    'game-app-creation',
    'deferred',
    ['game-app-creation-gate'],
    'GameApp, Pinia and router creation remain deferred behind the future startup gate.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackStartupGateHandoffStage[] => Object.freeze([
  'response-delivery-orchestration-consumed',
  'startup-gate-preflight',
  'launcher-startup-boundary',
  'persistent-install-state-read',
  'live-registry-identity-gate',
  'save-open-protection',
  'game-app-creation'
].map(id => stage(
  id as ThirdPartyDataPackStartupGateHandoffStageId,
  status,
  [],
  reason
)))

const createEffectSummary = (
  prepared: boolean
): ThirdPartyDataPackStartupGateHandoffEffectSummary => ({
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
  saveRead: false,
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
  responseDeliveryOrchestrationConsumed: prepared,
  startupGateHandoffPrepared: prepared
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
  status: ThirdPartyDataPackStartupGateHandoffPreflightStatus,
  reason: string,
  source: ThirdPartyDataPackUiIpcResponseDeliveryOrchestrationHandoffResult,
  checks: readonly ThirdPartyDataPackStartupGateHandoffPreflightCheck[],
  diagnostics: readonly ThirdPartyDataPackUiIpcResultEnvelopeSafeDiagnostic[],
  startupStages: readonly ThirdPartyDataPackStartupGateHandoffStage[],
  includeRequirements: boolean,
  deliveryEnvelope?: ThirdPartyDataPackUiIpcResultEnvelope
): ThirdPartyDataPackStartupGateHandoffPreflightResult => {
  const selectedPackageIds = clonePackageIds(source.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(source.blockedPackageIds)
  const loadOrder = clonePackageIds(source.loadOrder)
  const prepared = status === 'deferred'
    && deliveryEnvelope !== undefined
    && checks.every(currentCheck => currentCheck.status === 'satisfied')

  return deepFreezeObjectGraph({
    status,
    responseDeliveryOrchestrationStatus: source.status,
    reason,
    startupGateHandoffPreflight: status,
    readOnly: true,
    startupGateHandoffPrepared: prepared,
    responseDeliveryOrchestrationConsumed: prepared,
    startupGateHandoffAllowed: false,
    launcherAppAllowed: false,
    gameAppCreationAllowed: false,
    piniaCreationAllowed: false,
    routerMountAllowed: false,
    saveReadAllowed: false,
    uiIpcResponseDeliveryAllowed: false,
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
    startupStages,
    startupRequirements: includeRequirements ? startupRequirements() : Object.freeze([]),
    summary: deliveryEnvelope?.summary ?? cloneSummary(source.summary, source),
    effects: createEffectSummary(prepared)
  })
}

export const buildThirdPartyDataPackStartupGateHandoffPreflight = (
  options: BuildThirdPartyDataPackStartupGateHandoffPreflightOptions
): ThirdPartyDataPackStartupGateHandoffPreflightResult => {
  const source = options.responseDeliveryOrchestrationHandoff

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

  const deliveryEnvelope = cloneEnvelope(source.deliveryEnvelope, source)
  const checks = buildChecks(source, deliveryEnvelope)
  const blockedDiagnostics = diagnosticsForBlockedChecks(checks, source.targetPackageId)
  const diagnostics = Object.freeze([
    ...safeDiagnostics(source.diagnostics),
    ...safeDiagnostics(deliveryEnvelope?.diagnostics)
  ])

  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'startup gate handoff preflight inputs are inconsistent',
      source,
      checks,
      [
        ...diagnostics,
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'startup gate handoff preflight inputs are inconsistent'),
      false,
      deliveryEnvelope
    )
  }

  return baseResult(
    'deferred',
    'startup gate handoff is prepared as a path-free preflight; LauncherApp, GameApp creation and persistent startup reads remain separate',
    source,
    checks,
    diagnostics,
    deferredStages(),
    true,
    deliveryEnvelope
  )
}
