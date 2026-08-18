import type { JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic, type ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import {
  buildThirdPartyDataPackLiveRegistrySwapProtection,
  type BuildThirdPartyDataPackLiveRegistrySwapProtectionOptions,
  type ThirdPartyDataPackLiveRegistrySwapProtectionResult
} from './thirdPartyDataPackLiveRegistrySwapProtection'
import {
  buildThirdPartyDataPackRuntimePublicationPreflight,
  type ThirdPartyDataPackRuntimePublicationPreflightResult
} from './thirdPartyDataPackRuntimePublicationPreflight'
import {
  buildThirdPartyDataPackTransactionPreCommitPlan,
  type ThirdPartyDataPackTransactionPreCommitPlanResult,
  type ThirdPartyDataPackTransactionRollbackCheckpointId
} from './thirdPartyDataPackTransactionPreCommitPlan'

export type ThirdPartyDataPackPublicationRollbackRecoveryStatus = 'deferred' | 'skipped' | 'blocked'
export type ThirdPartyDataPackPublicationRollbackRecoveryCheckId =
  | 'runtime-publication-preflight-deferred'
  | 'transaction-precommit-plan-deferred'
  | 'live-registry-swap-protection-deferred'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'rollback-checkpoints-required'
  | 'rollback-protections-required'
  | 'no-recovery-effects-intact'
export type ThirdPartyDataPackPublicationRollbackRecoveryStageId =
  | 'recovery-plan-inspection'
  | 'failure-capture'
  | 'transaction-log-replay'
  | 'package-files-restore'
  | 'settings-lockfile-restore'
  | 'live-registry-restore'
  | 'post-rollback-verification'
  | 'recovery-diagnostics-finalization'
export type ThirdPartyDataPackPublicationRollbackRecoveryActionId =
  | 'recovery-log-reader'
  | 'package-file-restore-adapter'
  | 'settings-lockfile-restore-adapter'
  | 'previous-live-registry-reference'
  | 'post-restore-verification'
  | 'redacted-recovery-diagnostics'
  | 'idempotent-replay'

export interface ThirdPartyDataPackPublicationRollbackRecoveryCheck {
  readonly id: ThirdPartyDataPackPublicationRollbackRecoveryCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackPublicationRollbackRecoveryStage {
  readonly id: ThirdPartyDataPackPublicationRollbackRecoveryStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly actionIds: readonly ThirdPartyDataPackPublicationRollbackRecoveryActionId[]
  readonly rollbackCheckpointIds: readonly ThirdPartyDataPackTransactionRollbackCheckpointId[]
  readonly reason: string
}

export interface ThirdPartyDataPackPublicationRollbackRecoveryAction {
  readonly id: ThirdPartyDataPackPublicationRollbackRecoveryActionId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackPublicationRollbackRecoveryEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryReleased: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackPublicationRollbackRecoveryResult {
  readonly status: ThirdPartyDataPackPublicationRollbackRecoveryStatus
  readonly runtimePublicationPreflightStatus: ThirdPartyDataPackRuntimePublicationPreflightResult['status']
  readonly transactionPreCommitPlanStatus: ThirdPartyDataPackTransactionPreCommitPlanResult['status']
  readonly liveRegistrySwapProtectionStatus: ThirdPartyDataPackLiveRegistrySwapProtectionResult['status']
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
  readonly rollbackRecovery: 'deferred'
  readonly recoveryAllowed: false
  readonly rollbackExecutionAllowed: false
  readonly liveRegistryMutable: false
  readonly recoveryChecks: readonly ThirdPartyDataPackPublicationRollbackRecoveryCheck[]
  readonly recoveryStages: readonly ThirdPartyDataPackPublicationRollbackRecoveryStage[]
  readonly requiredRecoveryActions: readonly ThirdPartyDataPackPublicationRollbackRecoveryAction[]
  readonly effects: ThirdPartyDataPackPublicationRollbackRecoveryEffectSummary
}

export interface BuildThirdPartyDataPackPublicationRollbackRecoveryOptions
  extends BuildThirdPartyDataPackLiveRegistrySwapProtectionOptions {
  readonly runtimePublicationPreflight?: ThirdPartyDataPackRuntimePublicationPreflightResult
  readonly transactionPreCommitPlan?: ThirdPartyDataPackTransactionPreCommitPlanResult
  readonly liveRegistrySwapProtection?: ThirdPartyDataPackLiveRegistrySwapProtectionResult
}

const createEffectSummary = (): ThirdPartyDataPackPublicationRollbackRecoveryEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
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
const diagnosticCopyFallbackStage = 'third-party.publication-rollback-recovery.diagnostic-copy'
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
  id: ThirdPartyDataPackPublicationRollbackRecoveryCheckId,
  status: ThirdPartyDataPackPublicationRollbackRecoveryCheck['status'],
  reason: string
): ThirdPartyDataPackPublicationRollbackRecoveryCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackPublicationRollbackRecoveryCheck[] => Object.freeze([
  'runtime-publication-preflight-deferred',
  'transaction-precommit-plan-deferred',
  'live-registry-swap-protection-deferred',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'rollback-checkpoints-required',
  'rollback-protections-required',
  'no-recovery-effects-intact'
].map(id => check(id as ThirdPartyDataPackPublicationRollbackRecoveryCheckId, 'skipped', reason)))

const everyEffectFalse = (effects: object): boolean =>
  Object.values(effects).every(value => value === false)

const requiredRollbackCheckpointIds: readonly ThirdPartyDataPackTransactionRollbackCheckpointId[] = Object.freeze([
  'before-transaction-log-write',
  'before-package-files-write',
  'before-settings-lockfile-write',
  'before-live-registry-swap',
  'after-failure-restore-verification'
])

const hasRequiredRollbackCheckpoints = (
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult
): boolean => requiredRollbackCheckpointIds.every(checkpointId =>
  preCommitPlan.rollbackCheckpoints.some(checkpoint =>
    checkpoint.id === checkpointId && checkpoint.status === 'required'
  )
)

const hasRequiredRollbackProtections = (
  liveRegistrySwapProtection: ThirdPartyDataPackLiveRegistrySwapProtectionResult
): boolean => {
  const requiredIds = new Set(liveRegistrySwapProtection.requiredProtections.map(protection => protection.id))
  return requiredIds.has('previous-registry-identity-retention')
    && requiredIds.has('rollback-restore-diagnostics')
}

const rollbackEffectsIntact = (
  runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult,
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult,
  liveRegistrySwapProtection: ThirdPartyDataPackLiveRegistrySwapProtectionResult
): boolean =>
  runtimePublicationPreflight.publicationAllowed === false
  && preCommitPlan.commitAllowed === false
  && preCommitPlan.writeAllowed === false
  && liveRegistrySwapProtection.swapAllowed === false
  && liveRegistrySwapProtection.liveRegistryMutable === false
  && everyEffectFalse(runtimePublicationPreflight.effects)
  && everyEffectFalse(preCommitPlan.effects)
  && everyEffectFalse(liveRegistrySwapProtection.effects)

const buildRecoveryChecks = (
  runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult,
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult,
  liveRegistrySwapProtection: ThirdPartyDataPackLiveRegistrySwapProtectionResult
): readonly ThirdPartyDataPackPublicationRollbackRecoveryCheck[] => Object.freeze([
  check(
    'runtime-publication-preflight-deferred',
    runtimePublicationPreflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'Runtime publication preflight must remain deferred before rollback recovery can be planned.'
  ),
  check(
    'transaction-precommit-plan-deferred',
    preCommitPlan.status === 'deferred' ? 'satisfied' : 'blocked',
    'Transaction pre-commit plan must remain deferred so recovery planning cannot observe committed writes.'
  ),
  check(
    'live-registry-swap-protection-deferred',
    liveRegistrySwapProtection.status === 'deferred' ? 'satisfied' : 'blocked',
    'Live registry swap protection must remain deferred before recovery can plan restore behavior.'
  ),
  check(
    'candidate-identity-consistent',
    runtimePublicationPreflight.candidateIdentity?.candidateHash !== undefined
      && runtimePublicationPreflight.candidateIdentity.candidateHash === preCommitPlan.candidateIdentity?.candidateHash
      && runtimePublicationPreflight.candidateIdentity.candidateHash === liveRegistrySwapProtection.candidateIdentity?.candidateHash
      ? 'satisfied'
      : 'blocked',
    'Runtime publication, pre-commit and live-swap reports must describe the same candidate hash.'
  ),
  check(
    'lockfile-hash-consistent',
    runtimePublicationPreflight.lockfileHash !== undefined
      && runtimePublicationPreflight.lockfileHash === preCommitPlan.lockfileHash
      && runtimePublicationPreflight.lockfileHash === liveRegistrySwapProtection.lockfileHash
      ? 'satisfied'
      : 'blocked',
    'Runtime publication, pre-commit and live-swap reports must describe the same lockfile draft hash.'
  ),
  check(
    'rollback-checkpoints-required',
    hasRequiredRollbackCheckpoints(preCommitPlan) ? 'satisfied' : 'blocked',
    'The pre-commit plan must require every rollback checkpoint from recovery-log prepare through restore verification.'
  ),
  check(
    'rollback-protections-required',
    hasRequiredRollbackProtections(liveRegistrySwapProtection) ? 'satisfied' : 'blocked',
    'Live-swap protection must require previous registry retention and rollback restore diagnostics.'
  ),
  check(
    'no-recovery-effects-intact',
    rollbackEffectsIntact(runtimePublicationPreflight, preCommitPlan, liveRegistrySwapProtection) ? 'satisfied' : 'blocked',
    'Upstream reports must still expose only false publication, write, live-registry and rollback effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackPublicationRollbackRecoveryCheck[]
): readonly ModDiagnostic[] => checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.publication-rollback-recovery.checks',
    severity: 'error',
    fieldPath: `/recoveryChecks/${currentCheck.id}`,
    details: {
      reason: currentCheck.reason
    },
    recovery: 'retry'
  }))

const action = (
  id: ThirdPartyDataPackPublicationRollbackRecoveryActionId,
  reason: string
): ThirdPartyDataPackPublicationRollbackRecoveryAction => Object.freeze({
  id,
  status: 'required',
  reason
})

const requiredRecoveryActions = (): readonly ThirdPartyDataPackPublicationRollbackRecoveryAction[] => Object.freeze([
  action(
    'recovery-log-reader',
    'Recovery must replay a verified transaction log entry without treating missing or partial logs as committed state.'
  ),
  action(
    'package-file-restore-adapter',
    'Package files and backups need an idempotent restore adapter before staged install or upgrade writes can run.'
  ),
  action(
    'settings-lockfile-restore-adapter',
    'Installation settings and mod-lock must be restored atomically to the previous installed identity.'
  ),
  action(
    'previous-live-registry-reference',
    'The previous live registry identity must be retained long enough to restore it after a failed swap.'
  ),
  action(
    'post-restore-verification',
    'Recovery must verify package files, settings, mod-lock and live registry identity describe one consistent state.'
  ),
  action(
    'redacted-recovery-diagnostics',
    'Recovery diagnostics must prove restoration without exposing absolute host paths or candidate internals.'
  ),
  action(
    'idempotent-replay',
    'Repeated recovery after interruption must converge on the same previous installed state.'
  )
])

const stage = (
  id: ThirdPartyDataPackPublicationRollbackRecoveryStageId,
  status: ThirdPartyDataPackPublicationRollbackRecoveryStage['status'],
  actionIds: readonly ThirdPartyDataPackPublicationRollbackRecoveryActionId[],
  rollbackCheckpointIds: readonly ThirdPartyDataPackTransactionRollbackCheckpointId[],
  reason: string
): ThirdPartyDataPackPublicationRollbackRecoveryStage => Object.freeze({
  id,
  status,
  actionIds: Object.freeze([...actionIds]),
  rollbackCheckpointIds: Object.freeze([...rollbackCheckpointIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackPublicationRollbackRecoveryStage[] => Object.freeze([
  stage(
    'recovery-plan-inspection',
    'satisfied',
    [],
    [],
    'Upstream no-write publication, transaction and live-swap reports are consistent enough to inspect recovery requirements.'
  ),
  stage(
    'failure-capture',
    'deferred',
    ['recovery-log-reader'],
    ['before-transaction-log-write'],
    'Capture a failed publication boundary from a verified recovery log before replaying any persistent restore.'
  ),
  stage(
    'transaction-log-replay',
    'deferred',
    ['recovery-log-reader', 'idempotent-replay'],
    ['before-transaction-log-write'],
    'Replay only verified lifecycle steps and tolerate repeated crash recovery attempts.'
  ),
  stage(
    'package-files-restore',
    'deferred',
    ['package-file-restore-adapter'],
    ['before-package-files-write'],
    'Restore package files and backups before persistent settings or lockfile identities are published.'
  ),
  stage(
    'settings-lockfile-restore',
    'deferred',
    ['settings-lockfile-restore-adapter'],
    ['before-settings-lockfile-write'],
    'Restore settings and mod-lock to the same previous installed identity.'
  ),
  stage(
    'live-registry-restore',
    'deferred',
    ['previous-live-registry-reference'],
    ['before-live-registry-swap'],
    'Restore the previous live registry reference only after persistent state has been restored.'
  ),
  stage(
    'post-rollback-verification',
    'deferred',
    ['post-restore-verification'],
    ['after-failure-restore-verification'],
    'Verify restored package files, settings, lockfile and registry identity before GameApp can continue.'
  ),
  stage(
    'recovery-diagnostics-finalization',
    'deferred',
    ['redacted-recovery-diagnostics'],
    ['after-failure-restore-verification'],
    'Emit only redacted recovery diagnostics after restore verification succeeds or blocks startup.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackPublicationRollbackRecoveryStage[] => Object.freeze([
  'recovery-plan-inspection',
  'failure-capture',
  'transaction-log-replay',
  'package-files-restore',
  'settings-lockfile-restore',
  'live-registry-restore',
  'post-rollback-verification',
  'recovery-diagnostics-finalization'
].map(id => stage(id as ThirdPartyDataPackPublicationRollbackRecoveryStageId, status, [], [], reason)))

const freezeResult = (
  result: ThirdPartyDataPackPublicationRollbackRecoveryResult
): ThirdPartyDataPackPublicationRollbackRecoveryResult => deepFreezeObjectGraph(result)

const baseResult = (
  status: ThirdPartyDataPackPublicationRollbackRecoveryStatus,
  reason: string,
  runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult,
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult,
  liveRegistrySwapProtection: ThirdPartyDataPackLiveRegistrySwapProtectionResult,
  recoveryChecks: readonly ThirdPartyDataPackPublicationRollbackRecoveryCheck[],
  diagnostics: readonly ModDiagnostic[],
  recoveryStages: readonly ThirdPartyDataPackPublicationRollbackRecoveryStage[],
  includeRecoveryActions: boolean
): ThirdPartyDataPackPublicationRollbackRecoveryResult => freezeResult({
  status,
  runtimePublicationPreflightStatus: runtimePublicationPreflight.status,
  transactionPreCommitPlanStatus: preCommitPlan.status,
  liveRegistrySwapProtectionStatus: liveRegistrySwapProtection.status,
  reason,
  diagnostics: cloneDiagnostics(diagnostics),
  selectedPackageIds: clonePackageIds(liveRegistrySwapProtection.selectedPackageIds),
  blockedPackageIds: clonePackageIds(liveRegistrySwapProtection.blockedPackageIds),
  blockedCandidatePaths: cloneStringList(liveRegistrySwapProtection.blockedCandidatePaths),
  loadOrder: clonePackageIds(liveRegistrySwapProtection.loadOrder),
  registryCount: liveRegistrySwapProtection.registryCount,
  entryCount: liveRegistrySwapProtection.entryCount,
  packageCount: liveRegistrySwapProtection.packageCount,
  officialIdentity: cloneOfficialIdentity(liveRegistrySwapProtection.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(liveRegistrySwapProtection.candidateIdentity),
  lockfileHash: liveRegistrySwapProtection.lockfileHash,
  rollbackRecovery: 'deferred',
  recoveryAllowed: false,
  rollbackExecutionAllowed: false,
  liveRegistryMutable: false,
  recoveryChecks,
  recoveryStages,
  requiredRecoveryActions: includeRecoveryActions ? requiredRecoveryActions() : Object.freeze([]),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackPublicationRollbackRecovery = (
  options: BuildThirdPartyDataPackPublicationRollbackRecoveryOptions
): ThirdPartyDataPackPublicationRollbackRecoveryResult => {
  const runtimePublicationPreflight = options.runtimePublicationPreflight
    ?? buildThirdPartyDataPackRuntimePublicationPreflight(options)
  const transactionPreCommitPlan = options.transactionPreCommitPlan
    ?? buildThirdPartyDataPackTransactionPreCommitPlan({
      ...options,
      runtimePublicationPreflight
    })
  const liveRegistrySwapProtection = options.liveRegistrySwapProtection
    ?? buildThirdPartyDataPackLiveRegistrySwapProtection({
      ...options,
      runtimePublicationPreflight,
      transactionPreCommitPlan
    })

  if (
    runtimePublicationPreflight.status === 'skipped'
    || transactionPreCommitPlan.status === 'skipped'
    || liveRegistrySwapProtection.status === 'skipped'
  ) {
    const reason = 'no selected third-party data packs'
    return baseResult(
      'skipped',
      reason,
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      liveRegistrySwapProtection,
      skippedChecks(reason),
      [],
      terminalStages('skipped', reason),
      false
    )
  }

  if (
    runtimePublicationPreflight.status === 'blocked'
    || transactionPreCommitPlan.status === 'blocked'
    || liveRegistrySwapProtection.status === 'blocked'
  ) {
    const reason = runtimePublicationPreflight.status === 'blocked'
      ? runtimePublicationPreflight.reason
      : transactionPreCommitPlan.status === 'blocked'
        ? transactionPreCommitPlan.reason
        : liveRegistrySwapProtection.reason
    return baseResult(
      'blocked',
      reason,
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      liveRegistrySwapProtection,
      skippedChecks(reason),
      [
        ...cloneDiagnostics(runtimePublicationPreflight.diagnostics),
        ...cloneDiagnostics(transactionPreCommitPlan.diagnostics),
        ...cloneDiagnostics(liveRegistrySwapProtection.diagnostics)
      ],
      terminalStages('blocked', reason),
      false
    )
  }

  const recoveryChecks = buildRecoveryChecks(
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection
  )
  const blockedDiagnostics = diagnosticsForBlockedChecks(recoveryChecks)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'publication rollback recovery inputs are inconsistent',
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      liveRegistrySwapProtection,
      recoveryChecks,
      [
        ...cloneDiagnostics(runtimePublicationPreflight.diagnostics),
        ...cloneDiagnostics(transactionPreCommitPlan.diagnostics),
        ...cloneDiagnostics(liveRegistrySwapProtection.diagnostics),
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'publication rollback recovery inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'publication rollback recovery is inspect-only until recovery log replay, persistent restore adapters and post-restore verification exist',
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection,
    recoveryChecks,
    [
      ...cloneDiagnostics(runtimePublicationPreflight.diagnostics),
      ...cloneDiagnostics(transactionPreCommitPlan.diagnostics),
      ...cloneDiagnostics(liveRegistrySwapProtection.diagnostics)
    ],
    deferredStages(),
    true
  )
}
