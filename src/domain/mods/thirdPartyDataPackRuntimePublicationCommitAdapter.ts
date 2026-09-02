import type { JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic, type ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyDataPackRuntimeCommandId } from './thirdPartyDataPackRuntimeCommandState'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import {
  buildThirdPartyDataPackLiveRegistrySwapProtection,
  type ThirdPartyDataPackLiveRegistrySwapProtectionResult
} from './thirdPartyDataPackLiveRegistrySwapProtection'
import {
  buildThirdPartyDataPackPublicationRollbackRecovery,
  type BuildThirdPartyDataPackPublicationRollbackRecoveryOptions,
  type ThirdPartyDataPackPublicationRollbackRecoveryResult
} from './thirdPartyDataPackPublicationRollbackRecovery'
import {
  buildThirdPartyDataPackRuntimePublicationPreflight,
  type ThirdPartyDataPackRuntimePublicationPreflightResult
} from './thirdPartyDataPackRuntimePublicationPreflight'
import {
  buildThirdPartyDataPackTransactionPreCommitPlan,
  type ThirdPartyDataPackTransactionPreCommitPlanResult,
  type ThirdPartyDataPackTransactionRollbackCheckpointId,
  type ThirdPartyDataPackTransactionWriteBoundaryId
} from './thirdPartyDataPackTransactionPreCommitPlan'

export type ThirdPartyDataPackRuntimePublicationCommitAdapterStatus = 'deferred' | 'skipped' | 'blocked'
export type ThirdPartyDataPackRuntimePublicationCommitAdapterCheckId =
  | 'runtime-publication-preflight-deferred'
  | 'transaction-precommit-plan-deferred'
  | 'live-registry-swap-protection-deferred'
  | 'publication-rollback-recovery-deferred'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'commit-adapter-boundary-required'
  | 'transaction-write-boundaries-deferred'
  | 'rollback-recovery-boundary-required'
  | 'no-commit-effects-intact'
export type ThirdPartyDataPackRuntimePublicationCommitStageId =
  | 'commit-adapter-inspection'
  | 'transaction-log-prepare'
  | 'package-files-commit'
  | 'settings-lockfile-commit'
  | 'live-registry-publication'
  | 'post-commit-verification'
  | 'rollback-recovery-handoff'
  | 'commit-diagnostics-finalization'
export type ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId =
  | 'atomic-runtime-publication-commit-adapter'
  | 'transaction-log-writer'
  | 'package-file-commit-adapter'
  | 'settings-lockfile-commit-adapter'
  | 'live-registry-publication-adapter'
  | 'post-commit-verification-adapter'
  | 'rollback-recovery-orchestrator'

export interface ThirdPartyDataPackRuntimePublicationCommitAdapterCheck {
  readonly id: ThirdPartyDataPackRuntimePublicationCommitAdapterCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimePublicationCommitStage {
  readonly id: ThirdPartyDataPackRuntimePublicationCommitStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly adapterIds: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId[]
  readonly writeBoundaryIds: readonly ThirdPartyDataPackTransactionWriteBoundaryId[]
  readonly rollbackCheckpointIds: readonly ThirdPartyDataPackTransactionRollbackCheckpointId[]
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimePublicationCommitAdapterRequirement {
  readonly id: ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimePublicationCommitAdapterEffectSummary {
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

export interface ThirdPartyDataPackRuntimePublicationCommitAdapterResult {
  readonly status: ThirdPartyDataPackRuntimePublicationCommitAdapterStatus
  readonly requestedCommandId?: ThirdPartyDataPackRuntimeCommandId
  readonly runtimePublicationPreflightStatus: ThirdPartyDataPackRuntimePublicationPreflightResult['status']
  readonly transactionPreCommitPlanStatus: ThirdPartyDataPackTransactionPreCommitPlanResult['status']
  readonly liveRegistrySwapProtectionStatus: ThirdPartyDataPackLiveRegistrySwapProtectionResult['status']
  readonly publicationRollbackRecoveryStatus: ThirdPartyDataPackPublicationRollbackRecoveryResult['status']
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
  readonly runtimePublicationCommit: 'deferred'
  readonly commitAllowed: false
  readonly publicationAllowed: false
  readonly writeAllowed: false
  readonly liveRegistryMutable: false
  readonly rollbackExecutionAllowed: false
  readonly commitChecks: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterCheck[]
  readonly commitStages: readonly ThirdPartyDataPackRuntimePublicationCommitStage[]
  readonly requiredCommitAdapters: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirement[]
  readonly effects: ThirdPartyDataPackRuntimePublicationCommitAdapterEffectSummary
}

export interface BuildThirdPartyDataPackRuntimePublicationCommitAdapterOptions
  extends BuildThirdPartyDataPackPublicationRollbackRecoveryOptions {
  readonly runtimePublicationPreflight?: ThirdPartyDataPackRuntimePublicationPreflightResult
  readonly transactionPreCommitPlan?: ThirdPartyDataPackTransactionPreCommitPlanResult
  readonly liveRegistrySwapProtection?: ThirdPartyDataPackLiveRegistrySwapProtectionResult
  readonly publicationRollbackRecovery?: ThirdPartyDataPackPublicationRollbackRecoveryResult
}

const createEffectSummary = (): ThirdPartyDataPackRuntimePublicationCommitAdapterEffectSummary => ({
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
const diagnosticCopyFallbackStage = 'third-party.runtime-publication-commit-adapter.diagnostic-copy'
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
  id: ThirdPartyDataPackRuntimePublicationCommitAdapterCheckId,
  status: ThirdPartyDataPackRuntimePublicationCommitAdapterCheck['status'],
  reason: string
): ThirdPartyDataPackRuntimePublicationCommitAdapterCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackRuntimePublicationCommitAdapterCheck[] => Object.freeze([
  'runtime-publication-preflight-deferred',
  'transaction-precommit-plan-deferred',
  'live-registry-swap-protection-deferred',
  'publication-rollback-recovery-deferred',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'commit-adapter-boundary-required',
  'transaction-write-boundaries-deferred',
  'rollback-recovery-boundary-required',
  'no-commit-effects-intact'
].map(id => check(id as ThirdPartyDataPackRuntimePublicationCommitAdapterCheckId, 'skipped', reason)))

const everyEffectFalse = (effects: object): boolean =>
  Object.values(effects).every(value => value === false)

const requiredWriteBoundaryIds: readonly ThirdPartyDataPackTransactionWriteBoundaryId[] = Object.freeze([
  'transaction-log',
  'package-files',
  'package-backups',
  'installation-settings',
  'mod-lockfile',
  'live-registry',
  'player-saves',
  'official-cache'
])

const requiredRecoveryActionIds: readonly ThirdPartyDataPackPublicationRollbackRecoveryResult['requiredRecoveryActions'][number]['id'][] = Object.freeze([
  'recovery-log-reader',
  'package-file-restore-adapter',
  'settings-lockfile-restore-adapter',
  'previous-live-registry-reference',
  'post-restore-verification',
  'redacted-recovery-diagnostics',
  'idempotent-replay'
])

const hasCommitAdapterRequirement = (
  runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult
): boolean => runtimePublicationPreflight.remainingRequirements.some(requirement =>
  requirement.id === 'runtime-publication-commit-adapter' && requirement.status === 'required'
)

const hasDeferredWriteBoundaries = (
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult
): boolean => requiredWriteBoundaryIds.every(boundaryId =>
  preCommitPlan.writeBoundaries.some(boundary =>
    boundary.id === boundaryId
    && boundary.status === 'deferred'
    && boundary.writeAllowed === false
  )
)

const hasRollbackRecoveryBoundary = (
  recovery: ThirdPartyDataPackPublicationRollbackRecoveryResult
): boolean => recovery.recoveryAllowed === false
  && recovery.rollbackExecutionAllowed === false
  && requiredRecoveryActionIds.every(actionId =>
    recovery.requiredRecoveryActions.some(action =>
      action.id === actionId && action.status === 'required'
    )
  )

const commitEffectsIntact = (
  runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult,
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult,
  liveRegistrySwapProtection: ThirdPartyDataPackLiveRegistrySwapProtectionResult,
  recovery: ThirdPartyDataPackPublicationRollbackRecoveryResult
): boolean =>
  runtimePublicationPreflight.publicationAllowed === false
  && preCommitPlan.commitAllowed === false
  && preCommitPlan.writeAllowed === false
  && liveRegistrySwapProtection.swapAllowed === false
  && liveRegistrySwapProtection.liveRegistryMutable === false
  && recovery.recoveryAllowed === false
  && recovery.rollbackExecutionAllowed === false
  && recovery.liveRegistryMutable === false
  && everyEffectFalse(runtimePublicationPreflight.effects)
  && everyEffectFalse(preCommitPlan.effects)
  && everyEffectFalse(liveRegistrySwapProtection.effects)
  && everyEffectFalse(recovery.effects)

const buildCommitChecks = (
  runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult,
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult,
  liveRegistrySwapProtection: ThirdPartyDataPackLiveRegistrySwapProtectionResult,
  recovery: ThirdPartyDataPackPublicationRollbackRecoveryResult
): readonly ThirdPartyDataPackRuntimePublicationCommitAdapterCheck[] => Object.freeze([
  check(
    'runtime-publication-preflight-deferred',
    runtimePublicationPreflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'Runtime publication preflight must remain deferred before a commit adapter can be planned.'
  ),
  check(
    'transaction-precommit-plan-deferred',
    preCommitPlan.status === 'deferred' ? 'satisfied' : 'blocked',
    'Transaction pre-commit plan must remain deferred so the commit adapter cannot write during inspection.'
  ),
  check(
    'live-registry-swap-protection-deferred',
    liveRegistrySwapProtection.status === 'deferred' ? 'satisfied' : 'blocked',
    'Live registry swap protection must remain deferred before the commit adapter can publish any registry.'
  ),
  check(
    'publication-rollback-recovery-deferred',
    recovery.status === 'deferred' ? 'satisfied' : 'blocked',
    'Rollback recovery must remain deferred but fully described before publication commit can be considered.'
  ),
  check(
    'candidate-identity-consistent',
    runtimePublicationPreflight.candidateIdentity?.candidateHash !== undefined
      && runtimePublicationPreflight.candidateIdentity.candidateHash === preCommitPlan.candidateIdentity?.candidateHash
      && runtimePublicationPreflight.candidateIdentity.candidateHash === liveRegistrySwapProtection.candidateIdentity?.candidateHash
      && runtimePublicationPreflight.candidateIdentity.candidateHash === recovery.candidateIdentity?.candidateHash
      ? 'satisfied'
      : 'blocked',
    'Runtime publication, pre-commit, live-swap and recovery reports must describe the same candidate hash.'
  ),
  check(
    'lockfile-hash-consistent',
    runtimePublicationPreflight.lockfileHash !== undefined
      && runtimePublicationPreflight.lockfileHash === preCommitPlan.lockfileHash
      && runtimePublicationPreflight.lockfileHash === liveRegistrySwapProtection.lockfileHash
      && runtimePublicationPreflight.lockfileHash === recovery.lockfileHash
      ? 'satisfied'
      : 'blocked',
    'Runtime publication, pre-commit, live-swap and recovery reports must describe the same lockfile draft hash.'
  ),
  check(
    'commit-adapter-boundary-required',
    hasCommitAdapterRequirement(runtimePublicationPreflight) ? 'satisfied' : 'blocked',
    'Runtime publication preflight must still require a dedicated atomic commit adapter.'
  ),
  check(
    'transaction-write-boundaries-deferred',
    hasDeferredWriteBoundaries(preCommitPlan) ? 'satisfied' : 'blocked',
    'Every transaction write boundary must remain deferred and write-disallowed before commit adapter work.'
  ),
  check(
    'rollback-recovery-boundary-required',
    hasRollbackRecoveryBoundary(recovery) ? 'satisfied' : 'blocked',
    'Publication rollback recovery must retain every required recovery action before any commit can run.'
  ),
  check(
    'no-commit-effects-intact',
    commitEffectsIntact(runtimePublicationPreflight, preCommitPlan, liveRegistrySwapProtection, recovery)
      ? 'satisfied'
      : 'blocked',
    'Upstream reports must still expose only false publication, write, live-registry and recovery effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterCheck[]
): readonly ModDiagnostic[] => checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.runtime-publication-commit-adapter.checks',
    severity: 'error',
    fieldPath: `/commitChecks/${currentCheck.id}`,
    details: {
      reason: currentCheck.reason
    },
    recovery: 'retry'
  }))

const adapterRequirement = (
  id: ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId,
  reason: string
): ThirdPartyDataPackRuntimePublicationCommitAdapterRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const requiredCommitAdapters = (): readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirement[] => Object.freeze([
  adapterRequirement(
    'atomic-runtime-publication-commit-adapter',
    'A single adapter must coordinate transaction log prepare, persistent writes, live registry publication and post-commit verification.'
  ),
  adapterRequirement(
    'transaction-log-writer',
    'The commit adapter needs a verified recovery log writer before any persistent package or settings mutation can begin.'
  ),
  adapterRequirement(
    'package-file-commit-adapter',
    'Package file and backup writes need staged copy, validation and cleanup semantics before install or upgrade.'
  ),
  adapterRequirement(
    'settings-lockfile-commit-adapter',
    'Installation settings and mod-lock replacement must be committed atomically against one candidate identity.'
  ),
  adapterRequirement(
    'live-registry-publication-adapter',
    'The live registry reference can only be swapped once persistent install state has been verified.'
  ),
  adapterRequirement(
    'post-commit-verification-adapter',
    'Post-commit verification must prove package files, settings, mod-lock and live registry identity agree.'
  ),
  adapterRequirement(
    'rollback-recovery-orchestrator',
    'Any failed commit step must hand off to idempotent rollback recovery before GameApp can continue.'
  )
])

const stage = (
  id: ThirdPartyDataPackRuntimePublicationCommitStageId,
  status: ThirdPartyDataPackRuntimePublicationCommitStage['status'],
  adapterIds: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId[],
  writeBoundaryIds: readonly ThirdPartyDataPackTransactionWriteBoundaryId[],
  rollbackCheckpointIds: readonly ThirdPartyDataPackTransactionRollbackCheckpointId[],
  reason: string
): ThirdPartyDataPackRuntimePublicationCommitStage => Object.freeze({
  id,
  status,
  adapterIds: Object.freeze([...adapterIds]),
  writeBoundaryIds: Object.freeze([...writeBoundaryIds]),
  rollbackCheckpointIds: Object.freeze([...rollbackCheckpointIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackRuntimePublicationCommitStage[] => Object.freeze([
  stage(
    'commit-adapter-inspection',
    'satisfied',
    [],
    [],
    [],
    'Upstream no-write publication, transaction, live-swap and recovery reports are consistent enough to inspect commit adapter requirements.'
  ),
  stage(
    'transaction-log-prepare',
    'deferred',
    ['transaction-log-writer'],
    ['transaction-log'],
    ['before-transaction-log-write'],
    'Prepare a recovery log entry before any package, settings, lockfile or registry publication side effect.'
  ),
  stage(
    'package-files-commit',
    'deferred',
    ['package-file-commit-adapter'],
    ['package-files', 'package-backups'],
    ['before-package-files-write'],
    'Commit package files and backups only after staged content is validated and restorable.'
  ),
  stage(
    'settings-lockfile-commit',
    'deferred',
    ['settings-lockfile-commit-adapter'],
    ['installation-settings', 'mod-lockfile'],
    ['before-settings-lockfile-write'],
    'Replace installation settings and mod-lock as one verified persistent identity.'
  ),
  stage(
    'live-registry-publication',
    'deferred',
    ['live-registry-publication-adapter'],
    ['live-registry'],
    ['before-live-registry-swap'],
    'Publish the live registry reference only after package and persistent identity writes have been verified.'
  ),
  stage(
    'post-commit-verification',
    'deferred',
    ['post-commit-verification-adapter'],
    ['player-saves', 'official-cache'],
    ['after-failure-restore-verification'],
    'Verify save and official-cache isolation remains intact while proving installed-state identity consistency.'
  ),
  stage(
    'rollback-recovery-handoff',
    'deferred',
    ['rollback-recovery-orchestrator'],
    [],
    ['after-failure-restore-verification'],
    'On any failed commit step, hand off to rollback recovery without treating partial state as committed.'
  ),
  stage(
    'commit-diagnostics-finalization',
    'deferred',
    ['atomic-runtime-publication-commit-adapter'],
    [],
    [],
    'Finalize only redacted commit diagnostics after post-commit verification or rollback recovery settles.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackRuntimePublicationCommitStage[] => Object.freeze([
  'commit-adapter-inspection',
  'transaction-log-prepare',
  'package-files-commit',
  'settings-lockfile-commit',
  'live-registry-publication',
  'post-commit-verification',
  'rollback-recovery-handoff',
  'commit-diagnostics-finalization'
].map(id => stage(id as ThirdPartyDataPackRuntimePublicationCommitStageId, status, [], [], [], reason)))

const freezeResult = (
  result: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): ThirdPartyDataPackRuntimePublicationCommitAdapterResult => deepFreezeObjectGraph(result)

const baseResult = (
  status: ThirdPartyDataPackRuntimePublicationCommitAdapterStatus,
  reason: string,
  runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult,
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult,
  liveRegistrySwapProtection: ThirdPartyDataPackLiveRegistrySwapProtectionResult,
  recovery: ThirdPartyDataPackPublicationRollbackRecoveryResult,
  commitChecks: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterCheck[],
  diagnostics: readonly ModDiagnostic[],
  commitStages: readonly ThirdPartyDataPackRuntimePublicationCommitStage[],
  includeRequiredAdapters: boolean
): ThirdPartyDataPackRuntimePublicationCommitAdapterResult => freezeResult({
  status,
  requestedCommandId: recovery.selectedPackageIds.length > 0
    ? 'install'
    : recovery.blockedPackageIds.length > 0
      ? 'disable'
      : undefined,
  runtimePublicationPreflightStatus: runtimePublicationPreflight.status,
  transactionPreCommitPlanStatus: preCommitPlan.status,
  liveRegistrySwapProtectionStatus: liveRegistrySwapProtection.status,
  publicationRollbackRecoveryStatus: recovery.status,
  reason,
  diagnostics: cloneDiagnostics(diagnostics),
  selectedPackageIds: clonePackageIds(recovery.selectedPackageIds),
  blockedPackageIds: clonePackageIds(recovery.blockedPackageIds),
  blockedCandidatePaths: cloneStringList(recovery.blockedCandidatePaths),
  loadOrder: clonePackageIds(recovery.loadOrder),
  registryCount: recovery.registryCount,
  entryCount: recovery.entryCount,
  packageCount: recovery.packageCount,
  officialIdentity: cloneOfficialIdentity(recovery.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(recovery.candidateIdentity),
  lockfileHash: recovery.lockfileHash,
  runtimePublicationCommit: 'deferred',
  commitAllowed: false,
  publicationAllowed: false,
  writeAllowed: false,
  liveRegistryMutable: false,
  rollbackExecutionAllowed: false,
  commitChecks,
  commitStages,
  requiredCommitAdapters: includeRequiredAdapters ? requiredCommitAdapters() : Object.freeze([]),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackRuntimePublicationCommitAdapter = (
  options: BuildThirdPartyDataPackRuntimePublicationCommitAdapterOptions
): ThirdPartyDataPackRuntimePublicationCommitAdapterResult => {
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
  const publicationRollbackRecovery = options.publicationRollbackRecovery
    ?? buildThirdPartyDataPackPublicationRollbackRecovery({
      ...options,
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      liveRegistrySwapProtection
    })

  if (
    runtimePublicationPreflight.status === 'skipped'
    || transactionPreCommitPlan.status === 'skipped'
    || liveRegistrySwapProtection.status === 'skipped'
    || publicationRollbackRecovery.status === 'skipped'
  ) {
    const reason = 'no selected third-party data packs'
    return baseResult(
      'skipped',
      reason,
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      liveRegistrySwapProtection,
      publicationRollbackRecovery,
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
    || publicationRollbackRecovery.status === 'blocked'
  ) {
    const reason = runtimePublicationPreflight.status === 'blocked'
      ? runtimePublicationPreflight.reason
      : transactionPreCommitPlan.status === 'blocked'
        ? transactionPreCommitPlan.reason
        : liveRegistrySwapProtection.status === 'blocked'
          ? liveRegistrySwapProtection.reason
          : publicationRollbackRecovery.reason
    return baseResult(
      'blocked',
      reason,
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      liveRegistrySwapProtection,
      publicationRollbackRecovery,
      skippedChecks(reason),
      [
        ...cloneDiagnostics(runtimePublicationPreflight.diagnostics),
        ...cloneDiagnostics(transactionPreCommitPlan.diagnostics),
        ...cloneDiagnostics(liveRegistrySwapProtection.diagnostics),
        ...cloneDiagnostics(publicationRollbackRecovery.diagnostics)
      ],
      terminalStages('blocked', reason),
      false
    )
  }

  const commitChecks = buildCommitChecks(
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection,
    publicationRollbackRecovery
  )
  const blockedDiagnostics = diagnosticsForBlockedChecks(commitChecks)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'runtime publication commit adapter inputs are inconsistent',
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      liveRegistrySwapProtection,
      publicationRollbackRecovery,
      commitChecks,
      [
        ...cloneDiagnostics(runtimePublicationPreflight.diagnostics),
        ...cloneDiagnostics(transactionPreCommitPlan.diagnostics),
        ...cloneDiagnostics(liveRegistrySwapProtection.diagnostics),
        ...cloneDiagnostics(publicationRollbackRecovery.diagnostics),
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'runtime publication commit adapter inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'runtime publication commit adapter is inspect-only until atomic commit adapter, persistent writers and post-commit verification exist',
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    liveRegistrySwapProtection,
    publicationRollbackRecovery,
    commitChecks,
    [
      ...cloneDiagnostics(runtimePublicationPreflight.diagnostics),
      ...cloneDiagnostics(transactionPreCommitPlan.diagnostics),
      ...cloneDiagnostics(liveRegistrySwapProtection.diagnostics),
      ...cloneDiagnostics(publicationRollbackRecovery.diagnostics)
    ],
    deferredStages(),
    true
  )
}
