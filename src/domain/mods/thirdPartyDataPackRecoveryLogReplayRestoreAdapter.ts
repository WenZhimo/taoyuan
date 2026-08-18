import type { JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic, type ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import {
  buildThirdPartyDataPackPublicationRollbackRecovery,
  type ThirdPartyDataPackPublicationRollbackRecoveryActionId,
  type ThirdPartyDataPackPublicationRollbackRecoveryResult,
  type ThirdPartyDataPackPublicationRollbackRecoveryStageId
} from './thirdPartyDataPackPublicationRollbackRecovery'
import {
  buildThirdPartyDataPackRuntimePublicationCommitAdapter,
  type BuildThirdPartyDataPackRuntimePublicationCommitAdapterOptions,
  type ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'

export type ThirdPartyDataPackRecoveryLogReplayRestoreAdapterStatus = 'deferred' | 'skipped' | 'blocked'
export type ThirdPartyDataPackRecoveryLogReplayRestoreAdapterCheckId =
  | 'publication-rollback-recovery-deferred'
  | 'runtime-publication-commit-adapter-deferred'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'recovery-actions-required'
  | 'recovery-stages-deferred'
  | 'commit-rollback-handoff-deferred'
  | 'no-replay-restore-effects-intact'
export type ThirdPartyDataPackRecoveryLogReplayRestoreStageId =
  | 'replay-restore-adapter-inspection'
  | 'recovery-log-load'
  | 'recovery-log-replay'
  | 'package-files-restore'
  | 'settings-lockfile-restore'
  | 'live-registry-restore'
  | 'post-restore-verification'
  | 'recovery-diagnostics-finalization'
export type ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirementId =
  | 'verified-recovery-log-reader'
  | 'idempotent-recovery-log-replay'
  | 'package-file-restore-adapter'
  | 'settings-lockfile-restore-adapter'
  | 'live-registry-restore-adapter'
  | 'post-restore-verification-adapter'
  | 'redacted-recovery-diagnostics-adapter'
  | 'interrupted-recovery-resume-guard'

export interface ThirdPartyDataPackRecoveryLogReplayRestoreAdapterCheck {
  readonly id: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackRecoveryLogReplayRestoreStage {
  readonly id: ThirdPartyDataPackRecoveryLogReplayRestoreStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly adapterIds: readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirementId[]
  readonly recoveryActionIds: readonly ThirdPartyDataPackPublicationRollbackRecoveryActionId[]
  readonly upstreamStageIds: readonly ThirdPartyDataPackPublicationRollbackRecoveryStageId[]
  readonly reason: string
}

export interface ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirement {
  readonly id: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackRecoveryLogReplayRestoreAdapterEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
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

export interface ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult {
  readonly status: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterStatus
  readonly publicationRollbackRecoveryStatus: ThirdPartyDataPackPublicationRollbackRecoveryResult['status']
  readonly runtimePublicationCommitAdapterStatus: ThirdPartyDataPackRuntimePublicationCommitAdapterResult['status']
  readonly reason: string
  readonly diagnostics: readonly ModDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly recoveryLogReplayRestore: 'deferred'
  readonly recoveryLogReplayAllowed: false
  readonly persistentRestoreAllowed: false
  readonly writeAllowed: false
  readonly liveRegistryMutable: false
  readonly rollbackExecutionAllowed: false
  readonly replayRestoreChecks: readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterCheck[]
  readonly replayRestoreStages: readonly ThirdPartyDataPackRecoveryLogReplayRestoreStage[]
  readonly requiredReplayRestoreAdapters: readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirement[]
  readonly effects: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterEffectSummary
}

export interface BuildThirdPartyDataPackRecoveryLogReplayRestoreAdapterOptions
  extends BuildThirdPartyDataPackRuntimePublicationCommitAdapterOptions {
  readonly publicationRollbackRecovery?: ThirdPartyDataPackPublicationRollbackRecoveryResult
  readonly runtimePublicationCommitAdapter?: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
}

const createEffectSummary = (): ThirdPartyDataPackRecoveryLogReplayRestoreAdapterEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
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

const readDiagnosticDataField = (
  diagnostic: ModDiagnostic,
  fieldName: keyof ModDiagnostic
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(diagnostic, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readDiagnosticStringField = (
  diagnostic: ModDiagnostic,
  fieldName: keyof ModDiagnostic
): string | undefined => {
  const value = readDiagnosticDataField(diagnostic, fieldName)
  return typeof value === 'string' ? value : undefined
}

const diagnosticCopyFallbackCode = 'LIFECYCLE-TRANSACTION-001'
const diagnosticCopyFallbackStage = 'third-party.recovery-log-replay-restore-adapter.diagnostic-copy'
const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnostic['recovery']>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

const fallbackMessageKey = (code: string): string =>
  `mods.error.${code.toLowerCase().replace(/-/g, '.')}`

const cloneJsonValue = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) {
    const length = readArrayLength(value)
    if (length === undefined) return []

    const result: JsonValue[] = []
    for (let index = 0; index < length; index += 1) {
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
      } catch {
        result.push(null)
        continue
      }
      result.push(descriptor?.enumerable === true && 'value' in descriptor
        ? cloneJsonValue(descriptor.value as JsonValue)
        : null)
    }
    return result
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, JsonValue> = {}
    let keys: readonly (string | symbol)[]
    try {
      keys = Reflect.ownKeys(value)
    } catch {
      return result
    }
    for (const key of keys) {
      if (typeof key !== 'string') continue
      let descriptor: PropertyDescriptor | undefined
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value, key)
      } catch {
        continue
      }
      if (descriptor?.enumerable === true && 'value' in descriptor) {
        result[key] = cloneJsonValue(descriptor.value as JsonValue)
      }
    }
    return result
  }
  return value
}

const cloneDiagnosticPackageIds = (value: unknown): PackageId[] | undefined => {
  const result = clonePackageIds(value)
  return result.length > 0 ? Object.freeze(result) as PackageId[] : undefined
}

const cloneDiagnosticDetails = (
  details: ModDiagnostic['details']
): ModDiagnostic['details'] => {
  if (details === undefined) return undefined
  const result: Record<string, JsonValue> = {}
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(details)
  } catch {
    return result
  }
  for (const key of keys) {
    if (typeof key !== 'string') continue
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(details, key)
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor) {
      result[key] = cloneJsonValue(descriptor.value as JsonValue)
    }
  }
  return result
}

const cloneDiagnostic = (diagnostic: ModDiagnostic): ModDiagnostic => {
  const code = readDiagnosticStringField(diagnostic, 'code') ?? diagnosticCopyFallbackCode
  const severity = readDiagnosticDataField(diagnostic, 'severity')
  const recovery = readDiagnosticDataField(diagnostic, 'recovery')
  return {
    code,
    ruleId: readDiagnosticStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readDiagnosticStringField(diagnostic, 'stage') ?? diagnosticCopyFallbackStage,
    messageKey: readDiagnosticStringField(diagnostic, 'messageKey') ?? fallbackMessageKey(code),
    packageId: readDiagnosticStringField(diagnostic, 'packageId') as PackageId | undefined,
    file: readDiagnosticStringField(diagnostic, 'file'),
    fieldPath: readDiagnosticStringField(diagnostic, 'fieldPath'),
    registryId: readDiagnosticStringField(diagnostic, 'registryId') as ModDiagnostic['registryId'],
    contentId: readDiagnosticStringField(diagnostic, 'contentId') as ModDiagnostic['contentId'],
    relatedPackageIds: cloneDiagnosticPackageIds(readDiagnosticDataField(diagnostic, 'relatedPackageIds')),
    details: cloneDiagnosticDetails(readDiagnosticDataField(diagnostic, 'details') as ModDiagnostic['details']),
    recovery: diagnosticRecoveries.has(recovery as ModDiagnostic['recovery'])
      ? recovery as ModDiagnostic['recovery']
      : 'none'
  }
}

const cloneDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return []
  const length = readArrayLength(diagnostics)
  if (length === undefined) return []

  const result: ModDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor) {
      result.push(cloneDiagnostic(descriptor.value as ModDiagnostic))
    }
  }
  return result
}

const cloneOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateOfficialIdentitySummary => ({ ...identity })

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : { ...identity }

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

const check = (
  id: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterCheckId,
  status: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterCheck['status'],
  reason: string
): ThirdPartyDataPackRecoveryLogReplayRestoreAdapterCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterCheck[] => Object.freeze([
  'publication-rollback-recovery-deferred',
  'runtime-publication-commit-adapter-deferred',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'recovery-actions-required',
  'recovery-stages-deferred',
  'commit-rollback-handoff-deferred',
  'no-replay-restore-effects-intact'
].map(id => check(id as ThirdPartyDataPackRecoveryLogReplayRestoreAdapterCheckId, 'skipped', reason)))

const everyEffectFalse = (effects: object): boolean =>
  Object.values(effects).every(value => value === false)

const requiredRecoveryActionIds: readonly ThirdPartyDataPackPublicationRollbackRecoveryActionId[] = Object.freeze([
  'recovery-log-reader',
  'package-file-restore-adapter',
  'settings-lockfile-restore-adapter',
  'previous-live-registry-reference',
  'post-restore-verification',
  'redacted-recovery-diagnostics',
  'idempotent-replay'
])

const requiredRecoveryStageIds: readonly ThirdPartyDataPackPublicationRollbackRecoveryStageId[] = Object.freeze([
  'failure-capture',
  'transaction-log-replay',
  'package-files-restore',
  'settings-lockfile-restore',
  'live-registry-restore',
  'post-rollback-verification',
  'recovery-diagnostics-finalization'
])

const hasRequiredRecoveryActions = (
  recovery: ThirdPartyDataPackPublicationRollbackRecoveryResult
): boolean => requiredRecoveryActionIds.every(actionId =>
  recovery.requiredRecoveryActions.some(action =>
    action.id === actionId && action.status === 'required'
  )
)

const hasDeferredRecoveryStages = (
  recovery: ThirdPartyDataPackPublicationRollbackRecoveryResult
): boolean => recovery.recoveryStages.some(stage =>
  stage.id === 'recovery-plan-inspection' && stage.status === 'satisfied'
) && requiredRecoveryStageIds.every(stageId =>
  recovery.recoveryStages.some(stage =>
    stage.id === stageId && stage.status === 'deferred'
  )
)

const hasCommitRollbackHandoff = (
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean =>
  commitAdapter.commitStages.some(stage =>
    stage.id === 'rollback-recovery-handoff' && stage.status === 'deferred'
  )
  && commitAdapter.requiredCommitAdapters.some(adapter =>
    adapter.id === 'rollback-recovery-orchestrator' && adapter.status === 'required'
  )

const replayRestoreEffectsIntact = (
  recovery: ThirdPartyDataPackPublicationRollbackRecoveryResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean =>
  recovery.recoveryAllowed === false
  && recovery.rollbackExecutionAllowed === false
  && recovery.liveRegistryMutable === false
  && commitAdapter.commitAllowed === false
  && commitAdapter.publicationAllowed === false
  && commitAdapter.writeAllowed === false
  && commitAdapter.liveRegistryMutable === false
  && commitAdapter.rollbackExecutionAllowed === false
  && everyEffectFalse(recovery.effects)
  && everyEffectFalse(commitAdapter.effects)

const buildReplayRestoreChecks = (
  recovery: ThirdPartyDataPackPublicationRollbackRecoveryResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterCheck[] => Object.freeze([
  check(
    'publication-rollback-recovery-deferred',
    recovery.status === 'deferred' ? 'satisfied' : 'blocked',
    'Publication rollback recovery must remain deferred before replay or restore adapters can be planned.'
  ),
  check(
    'runtime-publication-commit-adapter-deferred',
    commitAdapter.status === 'deferred' ? 'satisfied' : 'blocked',
    'Runtime publication commit adapter must remain deferred so replay and restore planning cannot commit state.'
  ),
  check(
    'candidate-identity-consistent',
    recovery.candidateIdentity?.candidateHash !== undefined
      && recovery.candidateIdentity.candidateHash === commitAdapter.candidateIdentity?.candidateHash
      ? 'satisfied'
      : 'blocked',
    'Rollback recovery and runtime commit reports must describe the same candidate hash.'
  ),
  check(
    'lockfile-hash-consistent',
    recovery.lockfileHash !== undefined
      && recovery.lockfileHash === commitAdapter.lockfileHash
      ? 'satisfied'
      : 'blocked',
    'Rollback recovery and runtime commit reports must describe the same lockfile draft hash.'
  ),
  check(
    'recovery-actions-required',
    hasRequiredRecoveryActions(recovery) ? 'satisfied' : 'blocked',
    'Rollback recovery must retain every recovery-log replay and persistent restore action requirement.'
  ),
  check(
    'recovery-stages-deferred',
    hasDeferredRecoveryStages(recovery) ? 'satisfied' : 'blocked',
    'Rollback recovery stages must remain inspect-only with replay and restore stages deferred.'
  ),
  check(
    'commit-rollback-handoff-deferred',
    hasCommitRollbackHandoff(commitAdapter) ? 'satisfied' : 'blocked',
    'Runtime commit planning must still hand off failed commits to deferred rollback recovery.'
  ),
  check(
    'no-replay-restore-effects-intact',
    replayRestoreEffectsIntact(recovery, commitAdapter) ? 'satisfied' : 'blocked',
    'Upstream reports must still expose only false replay, restore, publication, write and live-registry effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterCheck[]
): readonly ModDiagnostic[] => checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.recovery-log-replay-restore-adapter.checks',
    severity: 'error',
    fieldPath: `/replayRestoreChecks/${currentCheck.id}`,
    details: {
      reason: currentCheck.reason
    },
    recovery: 'retry'
  }))

const adapterRequirement = (
  id: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirementId,
  reason: string
): ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const requiredReplayRestoreAdapters = (): readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirement[] =>
  Object.freeze([
    adapterRequirement(
      'verified-recovery-log-reader',
      'Recovery replay must validate a transaction log entry before deriving any restore operation.'
    ),
    adapterRequirement(
      'idempotent-recovery-log-replay',
      'Repeated replay after interruption must converge without duplicating package, settings, lockfile or registry changes.'
    ),
    adapterRequirement(
      'package-file-restore-adapter',
      'Package files and backups need a restore adapter that can prove the previous installed identity was restored.'
    ),
    adapterRequirement(
      'settings-lockfile-restore-adapter',
      'Settings and mod-lock restore must be committed as one previous persistent identity.'
    ),
    adapterRequirement(
      'live-registry-restore-adapter',
      'The previous live registry reference must be restored only after persistent package and lockfile state is verified.'
    ),
    adapterRequirement(
      'post-restore-verification-adapter',
      'Post-restore verification must compare package files, settings, mod-lock and live registry identity.'
    ),
    adapterRequirement(
      'redacted-recovery-diagnostics-adapter',
      'Diagnostics must describe replay and restore outcomes without exposing absolute host paths or candidate internals.'
    ),
    adapterRequirement(
      'interrupted-recovery-resume-guard',
      'A later startup must be able to resume an interrupted recovery attempt from the same verified log boundary.'
    )
  ])

const stage = (
  id: ThirdPartyDataPackRecoveryLogReplayRestoreStageId,
  status: ThirdPartyDataPackRecoveryLogReplayRestoreStage['status'],
  adapterIds: readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterRequirementId[],
  recoveryActionIds: readonly ThirdPartyDataPackPublicationRollbackRecoveryActionId[],
  upstreamStageIds: readonly ThirdPartyDataPackPublicationRollbackRecoveryStageId[],
  reason: string
): ThirdPartyDataPackRecoveryLogReplayRestoreStage => Object.freeze({
  id,
  status,
  adapterIds: Object.freeze([...adapterIds]),
  recoveryActionIds: Object.freeze([...recoveryActionIds]),
  upstreamStageIds: Object.freeze([...upstreamStageIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackRecoveryLogReplayRestoreStage[] => Object.freeze([
  stage(
    'replay-restore-adapter-inspection',
    'satisfied',
    [],
    [],
    ['recovery-plan-inspection'],
    'Upstream rollback recovery and runtime commit reports are consistent enough to inspect replay and restore adapters.'
  ),
  stage(
    'recovery-log-load',
    'deferred',
    ['verified-recovery-log-reader'],
    ['recovery-log-reader'],
    ['failure-capture'],
    'Load only a verified recovery log entry before deriving any replay step.'
  ),
  stage(
    'recovery-log-replay',
    'deferred',
    ['idempotent-recovery-log-replay', 'interrupted-recovery-resume-guard'],
    ['recovery-log-reader', 'idempotent-replay'],
    ['transaction-log-replay'],
    'Replay verified lifecycle steps idempotently and tolerate repeated startup recovery attempts.'
  ),
  stage(
    'package-files-restore',
    'deferred',
    ['package-file-restore-adapter'],
    ['package-file-restore-adapter'],
    ['package-files-restore'],
    'Restore package files and backups before persistent settings, lockfile or live registry identity.'
  ),
  stage(
    'settings-lockfile-restore',
    'deferred',
    ['settings-lockfile-restore-adapter'],
    ['settings-lockfile-restore-adapter'],
    ['settings-lockfile-restore'],
    'Restore settings and mod-lock together so they describe the same previous installed identity.'
  ),
  stage(
    'live-registry-restore',
    'deferred',
    ['live-registry-restore-adapter'],
    ['previous-live-registry-reference'],
    ['live-registry-restore'],
    'Restore the previous live registry reference only after persistent state is verified.'
  ),
  stage(
    'post-restore-verification',
    'deferred',
    ['post-restore-verification-adapter'],
    ['post-restore-verification'],
    ['post-rollback-verification'],
    'Verify package files, settings, mod-lock and live registry identity before GameApp can continue.'
  ),
  stage(
    'recovery-diagnostics-finalization',
    'deferred',
    ['redacted-recovery-diagnostics-adapter'],
    ['redacted-recovery-diagnostics'],
    ['recovery-diagnostics-finalization'],
    'Finalize only redacted recovery diagnostics after replay and restore verification settle.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackRecoveryLogReplayRestoreStage[] => Object.freeze([
  'replay-restore-adapter-inspection',
  'recovery-log-load',
  'recovery-log-replay',
  'package-files-restore',
  'settings-lockfile-restore',
  'live-registry-restore',
  'post-restore-verification',
  'recovery-diagnostics-finalization'
].map(id => stage(id as ThirdPartyDataPackRecoveryLogReplayRestoreStageId, status, [], [], [], reason)))

const freezeResult = (
  result: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult
): ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult => deepFreezeObjectGraph(result)

const baseResult = (
  status: ThirdPartyDataPackRecoveryLogReplayRestoreAdapterStatus,
  reason: string,
  recovery: ThirdPartyDataPackPublicationRollbackRecoveryResult,
  commitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult,
  replayRestoreChecks: readonly ThirdPartyDataPackRecoveryLogReplayRestoreAdapterCheck[],
  diagnostics: readonly ModDiagnostic[],
  replayRestoreStages: readonly ThirdPartyDataPackRecoveryLogReplayRestoreStage[],
  includeRequiredAdapters: boolean
): ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult => freezeResult({
  status,
  publicationRollbackRecoveryStatus: recovery.status,
  runtimePublicationCommitAdapterStatus: commitAdapter.status,
  reason,
  diagnostics: cloneDiagnostics(diagnostics),
  selectedPackageIds: clonePackageIds(commitAdapter.selectedPackageIds),
  blockedPackageIds: clonePackageIds(commitAdapter.blockedPackageIds),
  blockedCandidatePaths: cloneStringList(commitAdapter.blockedCandidatePaths),
  loadOrder: clonePackageIds(commitAdapter.loadOrder),
  registryCount: commitAdapter.registryCount,
  entryCount: commitAdapter.entryCount,
  packageCount: commitAdapter.packageCount,
  officialIdentity: cloneOfficialIdentity(commitAdapter.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(commitAdapter.candidateIdentity),
  lockfileHash: commitAdapter.lockfileHash,
  recoveryLogReplayRestore: 'deferred',
  recoveryLogReplayAllowed: false,
  persistentRestoreAllowed: false,
  writeAllowed: false,
  liveRegistryMutable: false,
  rollbackExecutionAllowed: false,
  replayRestoreChecks,
  replayRestoreStages,
  requiredReplayRestoreAdapters: includeRequiredAdapters ? requiredReplayRestoreAdapters() : Object.freeze([]),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackRecoveryLogReplayRestoreAdapter = (
  options: BuildThirdPartyDataPackRecoveryLogReplayRestoreAdapterOptions
): ThirdPartyDataPackRecoveryLogReplayRestoreAdapterResult => {
  const publicationRollbackRecovery = options.publicationRollbackRecovery
    ?? buildThirdPartyDataPackPublicationRollbackRecovery(options)
  const runtimePublicationCommitAdapter = options.runtimePublicationCommitAdapter
    ?? buildThirdPartyDataPackRuntimePublicationCommitAdapter({
      ...options,
      publicationRollbackRecovery
    })

  if (
    publicationRollbackRecovery.status === 'skipped'
    || runtimePublicationCommitAdapter.status === 'skipped'
  ) {
    const reason = 'no selected third-party data packs'
    return baseResult(
      'skipped',
      reason,
      publicationRollbackRecovery,
      runtimePublicationCommitAdapter,
      skippedChecks(reason),
      [],
      terminalStages('skipped', reason),
      false
    )
  }

  if (
    publicationRollbackRecovery.status === 'blocked'
    || runtimePublicationCommitAdapter.status === 'blocked'
  ) {
    const reason = publicationRollbackRecovery.status === 'blocked'
      ? publicationRollbackRecovery.reason
      : runtimePublicationCommitAdapter.reason
    return baseResult(
      'blocked',
      reason,
      publicationRollbackRecovery,
      runtimePublicationCommitAdapter,
      skippedChecks(reason),
      [
        ...cloneDiagnostics(publicationRollbackRecovery.diagnostics),
        ...cloneDiagnostics(runtimePublicationCommitAdapter.diagnostics)
      ],
      terminalStages('blocked', reason),
      false
    )
  }

  const replayRestoreChecks = buildReplayRestoreChecks(
    publicationRollbackRecovery,
    runtimePublicationCommitAdapter
  )
  const blockedDiagnostics = diagnosticsForBlockedChecks(replayRestoreChecks)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'recovery log replay and restore adapter inputs are inconsistent',
      publicationRollbackRecovery,
      runtimePublicationCommitAdapter,
      replayRestoreChecks,
      [
        ...cloneDiagnostics(publicationRollbackRecovery.diagnostics),
        ...cloneDiagnostics(runtimePublicationCommitAdapter.diagnostics),
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'recovery log replay and restore adapter inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'recovery log replay and restore adapter is inspect-only until verified log reader, idempotent replay and persistent restore adapters exist',
    publicationRollbackRecovery,
    runtimePublicationCommitAdapter,
    replayRestoreChecks,
    [
      ...cloneDiagnostics(publicationRollbackRecovery.diagnostics),
      ...cloneDiagnostics(runtimePublicationCommitAdapter.diagnostics)
    ],
    deferredStages(),
    true
  )
}
