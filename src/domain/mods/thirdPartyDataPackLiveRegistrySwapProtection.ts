import type { JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic, type ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import {
  buildThirdPartyDataPackRuntimePublicationPreflight,
  type ThirdPartyDataPackRuntimePublicationPreflightResult
} from './thirdPartyDataPackRuntimePublicationPreflight'
import {
  buildThirdPartyDataPackTransactionPreCommitPlan,
  type BuildThirdPartyDataPackTransactionPreCommitPlanOptions,
  type ThirdPartyDataPackTransactionPreCommitPlanResult
} from './thirdPartyDataPackTransactionPreCommitPlan'

export type ThirdPartyDataPackLiveRegistrySwapProtectionStatus = 'deferred' | 'skipped' | 'blocked'
export type ThirdPartyDataPackLiveRegistrySwapProtectionCheckId =
  | 'runtime-publication-preflight-deferred'
  | 'transaction-precommit-plan-deferred'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'live-registry-boundary-deferred'
  | 'live-swap-rollback-checkpoint-required'
  | 'no-live-registry-effects-intact'
export type ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId =
  | 'single-assignment-live-registry-reference'
  | 'previous-registry-identity-retention'
  | 'candidate-artifact-visibility-barrier'
  | 'post-swap-verification'
  | 'rollback-restore-diagnostics'

export interface ThirdPartyDataPackLiveRegistrySwapProtectionCheck {
  readonly id: ThirdPartyDataPackLiveRegistrySwapProtectionCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackLiveRegistrySwapProtectionRequirement {
  readonly id: ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackLiveRegistrySwapProtectionEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryReleased: false
  readonly candidateRegistryExposed: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
}

export interface ThirdPartyDataPackLiveRegistrySwapProtectionResult {
  readonly status: ThirdPartyDataPackLiveRegistrySwapProtectionStatus
  readonly runtimePublicationPreflightStatus: ThirdPartyDataPackRuntimePublicationPreflightResult['status']
  readonly transactionPreCommitPlanStatus: ThirdPartyDataPackTransactionPreCommitPlanResult['status']
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
  readonly liveRegistrySwap: 'deferred'
  readonly swapAllowed: false
  readonly liveRegistryMutable: false
  readonly protectionChecks: readonly ThirdPartyDataPackLiveRegistrySwapProtectionCheck[]
  readonly requiredProtections: readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirement[]
  readonly effects: ThirdPartyDataPackLiveRegistrySwapProtectionEffectSummary
}

export interface BuildThirdPartyDataPackLiveRegistrySwapProtectionOptions
  extends BuildThirdPartyDataPackTransactionPreCommitPlanOptions {
  readonly runtimePublicationPreflight?: ThirdPartyDataPackRuntimePublicationPreflightResult
  readonly transactionPreCommitPlan?: ThirdPartyDataPackTransactionPreCommitPlanResult
}

const createEffectSummary = (): ThirdPartyDataPackLiveRegistrySwapProtectionEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryReleased: false,
  candidateRegistryExposed: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false
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
const diagnosticCopyFallbackStage = 'third-party.live-registry-swap-protection.diagnostic-copy'
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

const protectionRequirement = (
  id: ThirdPartyDataPackLiveRegistrySwapProtectionRequirementId,
  reason: string
): ThirdPartyDataPackLiveRegistrySwapProtectionRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const requiredProtections = (): readonly ThirdPartyDataPackLiveRegistrySwapProtectionRequirement[] => Object.freeze([
  protectionRequirement(
    'single-assignment-live-registry-reference',
    'The live registry reference must be swapped once, after all persistent install state is verified, with no partial candidate visibility.'
  ),
  protectionRequirement(
    'previous-registry-identity-retention',
    'The previous official/installed registry identity must be retained until post-swap verification and rollback finalization finish.'
  ),
  protectionRequirement(
    'candidate-artifact-visibility-barrier',
    'Candidate RegistrySet, snapshot and lockfile draft internals must stay behind the commit adapter and never leak to GameApp consumers.'
  ),
  protectionRequirement(
    'post-swap-verification',
    'Post-swap verification must prove package files, settings, mod-lock and published registry identity describe the same installed state.'
  ),
  protectionRequirement(
    'rollback-restore-diagnostics',
    'Rollback must produce diagnostics proving the previous registry identity and persistent state were restored after a failed swap.'
  )
])

const check = (
  id: ThirdPartyDataPackLiveRegistrySwapProtectionCheckId,
  status: ThirdPartyDataPackLiveRegistrySwapProtectionCheck['status'],
  reason: string
): ThirdPartyDataPackLiveRegistrySwapProtectionCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackLiveRegistrySwapProtectionCheck[] => Object.freeze([
  'runtime-publication-preflight-deferred',
  'transaction-precommit-plan-deferred',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'live-registry-boundary-deferred',
  'live-swap-rollback-checkpoint-required',
  'no-live-registry-effects-intact'
].map(id => check(id as ThirdPartyDataPackLiveRegistrySwapProtectionCheckId, 'skipped', reason)))

const hasDeferredLiveRegistryBoundary = (
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult
): boolean => {
  const boundary = preCommitPlan.writeBoundaries.find(currentBoundary => currentBoundary.id === 'live-registry')
  const phase = preCommitPlan.phases.find(currentPhase => currentPhase.id === 'live-registry-swap')
  return boundary?.status === 'deferred'
    && boundary.writeAllowed === false
    && phase?.status === 'deferred'
    && phase.writeBoundaryIds.includes('live-registry')
}

const hasLiveSwapRollbackCheckpoint = (
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult
): boolean => {
  const phase = preCommitPlan.phases.find(currentPhase => currentPhase.id === 'live-registry-swap')
  const checkpoint = preCommitPlan.rollbackCheckpoints.find(
    currentCheckpoint => currentCheckpoint.id === 'before-live-registry-swap'
  )
  return checkpoint?.status === 'required'
    && phase?.rollbackCheckpointIds.includes('before-live-registry-swap') === true
}

const everyEffectFalse = (effects: object): boolean =>
  Object.values(effects).every(value => value === false)

const liveRegistryEffectsIntact = (
  runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult,
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult
): boolean =>
  runtimePublicationPreflight.publicationAllowed === false
  && preCommitPlan.commitAllowed === false
  && preCommitPlan.writeAllowed === false
  && runtimePublicationPreflight.effects.liveRegistryMutated === false
  && runtimePublicationPreflight.effects.candidateRegistryExposed === false
  && runtimePublicationPreflight.effects.thirdPartyRegistryPublished === false
  && preCommitPlan.effects.liveRegistryMutated === false
  && preCommitPlan.effects.candidateRegistryExposed === false
  && preCommitPlan.effects.thirdPartyRegistryPublished === false
  && everyEffectFalse(runtimePublicationPreflight.effects)
  && everyEffectFalse(preCommitPlan.effects)

const buildProtectionChecks = (
  runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult,
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult
): readonly ThirdPartyDataPackLiveRegistrySwapProtectionCheck[] => Object.freeze([
  check(
    'runtime-publication-preflight-deferred',
    runtimePublicationPreflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'Runtime publication preflight must remain deferred before any live registry swap can be considered.'
  ),
  check(
    'transaction-precommit-plan-deferred',
    preCommitPlan.status === 'deferred' ? 'satisfied' : 'blocked',
    'Transaction pre-commit plan must remain deferred so live registry changes cannot run during protection inspection.'
  ),
  check(
    'candidate-identity-consistent',
    runtimePublicationPreflight.candidateIdentity?.candidateHash !== undefined
      && runtimePublicationPreflight.candidateIdentity.candidateHash === preCommitPlan.candidateIdentity?.candidateHash
      ? 'satisfied'
      : 'blocked',
    'Runtime publication and pre-commit reports must describe the same candidate hash before a swap guard can be planned.'
  ),
  check(
    'lockfile-hash-consistent',
    runtimePublicationPreflight.lockfileHash !== undefined
      && runtimePublicationPreflight.lockfileHash === preCommitPlan.lockfileHash
      ? 'satisfied'
      : 'blocked',
    'Runtime publication and pre-commit reports must describe the same lockfile draft hash before a swap guard can be planned.'
  ),
  check(
    'live-registry-boundary-deferred',
    hasDeferredLiveRegistryBoundary(preCommitPlan) ? 'satisfied' : 'blocked',
    'The pre-commit plan must expose the live-registry write boundary only as deferred and write-disallowed.'
  ),
  check(
    'live-swap-rollback-checkpoint-required',
    hasLiveSwapRollbackCheckpoint(preCommitPlan) ? 'satisfied' : 'blocked',
    'The pre-commit plan must require a before-live-registry-swap rollback checkpoint.'
  ),
  check(
    'no-live-registry-effects-intact',
    liveRegistryEffectsIntact(runtimePublicationPreflight, preCommitPlan) ? 'satisfied' : 'blocked',
    'Upstream reports must still expose only false live-registry, candidate-publication and write effects.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackLiveRegistrySwapProtectionCheck[]
): readonly ModDiagnostic[] => checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.live-registry-swap-protection.checks',
    severity: 'error',
    fieldPath: `/protectionChecks/${currentCheck.id}`,
    details: {
      reason: currentCheck.reason
    },
    recovery: 'retry'
  }))

const freezeResult = (
  result: ThirdPartyDataPackLiveRegistrySwapProtectionResult
): ThirdPartyDataPackLiveRegistrySwapProtectionResult => deepFreezeObjectGraph(result)

const baseResult = (
  status: ThirdPartyDataPackLiveRegistrySwapProtectionStatus,
  reason: string,
  runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult,
  preCommitPlan: ThirdPartyDataPackTransactionPreCommitPlanResult,
  protectionChecks: readonly ThirdPartyDataPackLiveRegistrySwapProtectionCheck[],
  diagnostics: readonly ModDiagnostic[],
  includeRequiredProtections: boolean
): ThirdPartyDataPackLiveRegistrySwapProtectionResult => freezeResult({
  status,
  runtimePublicationPreflightStatus: runtimePublicationPreflight.status,
  transactionPreCommitPlanStatus: preCommitPlan.status,
  reason,
  diagnostics: cloneDiagnostics(diagnostics),
  selectedPackageIds: clonePackageIds(preCommitPlan.selectedPackageIds),
  blockedPackageIds: clonePackageIds(preCommitPlan.blockedPackageIds),
  blockedCandidatePaths: cloneStringList(preCommitPlan.blockedCandidatePaths),
  loadOrder: clonePackageIds(preCommitPlan.loadOrder),
  registryCount: preCommitPlan.registryCount,
  entryCount: preCommitPlan.entryCount,
  packageCount: preCommitPlan.packageCount,
  officialIdentity: cloneOfficialIdentity(preCommitPlan.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(preCommitPlan.candidateIdentity),
  lockfileHash: preCommitPlan.lockfileHash,
  liveRegistrySwap: 'deferred',
  swapAllowed: false,
  liveRegistryMutable: false,
  protectionChecks,
  requiredProtections: includeRequiredProtections ? requiredProtections() : Object.freeze([]),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackLiveRegistrySwapProtection = (
  options: BuildThirdPartyDataPackLiveRegistrySwapProtectionOptions
): ThirdPartyDataPackLiveRegistrySwapProtectionResult => {
  const runtimePublicationPreflight = options.runtimePublicationPreflight
    ?? buildThirdPartyDataPackRuntimePublicationPreflight(options)
  const transactionPreCommitPlan = options.transactionPreCommitPlan
    ?? buildThirdPartyDataPackTransactionPreCommitPlan({
      ...options,
      runtimePublicationPreflight
    })

  if (runtimePublicationPreflight.status === 'skipped' || transactionPreCommitPlan.status === 'skipped') {
    const reason = 'no selected third-party data packs'
    return baseResult(
      'skipped',
      reason,
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      skippedChecks(reason),
      [],
      false
    )
  }

  if (runtimePublicationPreflight.status === 'blocked' || transactionPreCommitPlan.status === 'blocked') {
    const reason = runtimePublicationPreflight.status === 'blocked'
      ? runtimePublicationPreflight.reason
      : transactionPreCommitPlan.reason
    return baseResult(
      'blocked',
      reason,
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      skippedChecks(reason),
      [
        ...cloneDiagnostics(runtimePublicationPreflight.diagnostics),
        ...cloneDiagnostics(transactionPreCommitPlan.diagnostics)
      ],
      false
    )
  }

  const protectionChecks = buildProtectionChecks(runtimePublicationPreflight, transactionPreCommitPlan)
  const blockedDiagnostics = diagnosticsForBlockedChecks(protectionChecks)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'live registry swap protection inputs are inconsistent',
      runtimePublicationPreflight,
      transactionPreCommitPlan,
      protectionChecks,
      [
        ...cloneDiagnostics(runtimePublicationPreflight.diagnostics),
        ...cloneDiagnostics(transactionPreCommitPlan.diagnostics),
        ...blockedDiagnostics
      ],
      false
    )
  }

  return baseResult(
    'deferred',
    'live registry swap protection is inspect-only until single-assignment swap, previous registry retention and rollback diagnostics exist',
    runtimePublicationPreflight,
    transactionPreCommitPlan,
    protectionChecks,
    [
      ...cloneDiagnostics(runtimePublicationPreflight.diagnostics),
      ...cloneDiagnostics(transactionPreCommitPlan.diagnostics)
    ],
    true
  )
}
