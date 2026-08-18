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
  type BuildThirdPartyDataPackRuntimePublicationPreflightOptions,
  type ThirdPartyDataPackRuntimePublicationPreflightResult
} from './thirdPartyDataPackRuntimePublicationPreflight'
import {
  buildThirdPartyDataPackTransactionPreflight,
  type ThirdPartyDataPackTransactionPreflightResult
} from './thirdPartyDataPackTransactionPreflight'

export type ThirdPartyDataPackTransactionPreCommitPlanStatus = 'deferred' | 'skipped' | 'blocked'
export type ThirdPartyDataPackTransactionPreCommitPhase =
  | 'pre-commit-inspection'
  | 'transaction-log-prepare'
  | 'package-write-stage'
  | 'settings-lockfile-stage'
  | 'live-registry-swap'
  | 'post-commit-verification'
  | 'rollback-finalization'
export type ThirdPartyDataPackTransactionPreCommitCheckId =
  | 'transaction-preflight-deferred'
  | 'runtime-publication-preflight-deferred'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'no-write-effects-intact'
export type ThirdPartyDataPackTransactionWriteBoundaryId =
  | 'transaction-log'
  | 'package-files'
  | 'package-backups'
  | 'installation-settings'
  | 'mod-lockfile'
  | 'live-registry'
  | 'player-saves'
  | 'official-cache'
export type ThirdPartyDataPackTransactionRollbackCheckpointId =
  | 'before-transaction-log-write'
  | 'before-package-files-write'
  | 'before-settings-lockfile-write'
  | 'before-live-registry-swap'
  | 'after-failure-restore-verification'

export interface ThirdPartyDataPackTransactionPreCommitCheck {
  readonly id: ThirdPartyDataPackTransactionPreCommitCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionPreCommitPhaseSummary {
  readonly id: ThirdPartyDataPackTransactionPreCommitPhase
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly writeBoundaryIds: readonly ThirdPartyDataPackTransactionWriteBoundaryId[]
  readonly rollbackCheckpointIds: readonly ThirdPartyDataPackTransactionRollbackCheckpointId[]
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionWriteBoundary {
  readonly id: ThirdPartyDataPackTransactionWriteBoundaryId
  readonly status: 'deferred'
  readonly writeAllowed: false
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionRollbackCheckpoint {
  readonly id: ThirdPartyDataPackTransactionRollbackCheckpointId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionPreCommitEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly candidateRegistryExposed: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
}

export interface ThirdPartyDataPackTransactionPreCommitPlanResult {
  readonly status: ThirdPartyDataPackTransactionPreCommitPlanStatus
  readonly transactionPreflightStatus: ThirdPartyDataPackTransactionPreflightResult['status']
  readonly runtimePublicationPreflightStatus: ThirdPartyDataPackRuntimePublicationPreflightResult['status']
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
  readonly preCommitPlan: 'deferred'
  readonly commitAllowed: false
  readonly writeAllowed: false
  readonly recoveryRequired: false
  readonly rollbackRequired: false
  readonly preCommitChecks: readonly ThirdPartyDataPackTransactionPreCommitCheck[]
  readonly phases: readonly ThirdPartyDataPackTransactionPreCommitPhaseSummary[]
  readonly writeBoundaries: readonly ThirdPartyDataPackTransactionWriteBoundary[]
  readonly rollbackCheckpoints: readonly ThirdPartyDataPackTransactionRollbackCheckpoint[]
  readonly effects: ThirdPartyDataPackTransactionPreCommitEffectSummary
}

export interface BuildThirdPartyDataPackTransactionPreCommitPlanOptions
  extends BuildThirdPartyDataPackRuntimePublicationPreflightOptions {
  readonly transactionPreflight?: ThirdPartyDataPackTransactionPreflightResult
  readonly runtimePublicationPreflight?: ThirdPartyDataPackRuntimePublicationPreflightResult
}

const createEffectSummary = (): ThirdPartyDataPackTransactionPreCommitEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
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
const diagnosticCopyFallbackStage = 'third-party.transaction-precommit.diagnostic-copy'
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

const cloneDiagnosticPackageIds = (value: unknown): PackageId[] | undefined => {
  const result = clonePackageIds(value)
  return result.length > 0 ? Object.freeze(result) as PackageId[] : undefined
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
  id: ThirdPartyDataPackTransactionPreCommitCheckId,
  status: ThirdPartyDataPackTransactionPreCommitCheck['status'],
  reason: string
): ThirdPartyDataPackTransactionPreCommitCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackTransactionPreCommitCheck[] => Object.freeze([
  'transaction-preflight-deferred',
  'runtime-publication-preflight-deferred',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'no-write-effects-intact'
].map(id => check(id as ThirdPartyDataPackTransactionPreCommitCheckId, 'skipped', reason)))

const everyEffectFalse = (effects: object): boolean =>
  Object.values(effects).every(value => value === false)

const buildPreCommitChecks = (
  transactionPreflight: ThirdPartyDataPackTransactionPreflightResult,
  runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult
): readonly ThirdPartyDataPackTransactionPreCommitCheck[] => Object.freeze([
  check(
    'transaction-preflight-deferred',
    transactionPreflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'Transaction preflight must be deferred, not committed, before the pre-commit plan can be inspected.'
  ),
  check(
    'runtime-publication-preflight-deferred',
    runtimePublicationPreflight.status === 'deferred' ? 'satisfied' : 'blocked',
    'Runtime publication preflight must be deferred so no live registry can be mutated during planning.'
  ),
  check(
    'candidate-identity-consistent',
    transactionPreflight.candidateIdentity?.candidateHash !== undefined
      && transactionPreflight.candidateIdentity.candidateHash === runtimePublicationPreflight.candidateIdentity?.candidateHash
      ? 'satisfied'
      : 'blocked',
    'Transaction and runtime publication reports must refer to the same candidate hash.'
  ),
  check(
    'lockfile-hash-consistent',
    transactionPreflight.lockfileHash !== undefined
      && transactionPreflight.lockfileHash === runtimePublicationPreflight.lockfileHash
      ? 'satisfied'
      : 'blocked',
    'Transaction and runtime publication reports must refer to the same lockfile draft hash.'
  ),
  check(
    'no-write-effects-intact',
    everyEffectFalse(transactionPreflight.effects)
      && everyEffectFalse(runtimePublicationPreflight.effects)
      && transactionPreflight.commitAllowed === false
      && runtimePublicationPreflight.publicationAllowed === false
      ? 'satisfied'
      : 'blocked',
    'Upstream reports must still expose only false write effects before a pre-commit write boundary can be planned.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackTransactionPreCommitCheck[]
): readonly ModDiagnostic[] => checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.transaction-precommit.checks',
    severity: 'error',
    fieldPath: `/preCommitChecks/${currentCheck.id}`,
    details: {
      reason: currentCheck.reason
    },
    recovery: 'retry'
  }))

const writeBoundaries = (): readonly ThirdPartyDataPackTransactionWriteBoundary[] => Object.freeze([
  Object.freeze({
    id: 'transaction-log',
    status: 'deferred',
    writeAllowed: false,
    reason: 'Recovery log writes require an atomic host adapter and crash replay contract before they can run.'
  }),
  Object.freeze({
    id: 'package-files',
    status: 'deferred',
    writeAllowed: false,
    reason: 'Package file writes require staged copy, validation and cleanup semantics before install or upgrade.'
  }),
  Object.freeze({
    id: 'package-backups',
    status: 'deferred',
    writeAllowed: false,
    reason: 'Package backup writes require retention and restore verification before upgrade or uninstall.'
  }),
  Object.freeze({
    id: 'installation-settings',
    status: 'deferred',
    writeAllowed: false,
    reason: 'Package enablement settings must be committed atomically with the lockfile and recovery log.'
  }),
  Object.freeze({
    id: 'mod-lockfile',
    status: 'deferred',
    writeAllowed: false,
    reason: 'mod-lock replacement must be atomic and verified before it becomes the stable installed-state source.'
  }),
  Object.freeze({
    id: 'live-registry',
    status: 'deferred',
    writeAllowed: false,
    reason: 'The live registry reference cannot be swapped until package, settings and lockfile writes are verified.'
  }),
  Object.freeze({
    id: 'player-saves',
    status: 'deferred',
    writeAllowed: false,
    reason: 'Player saves remain outside install transactions until save environment binding is explicitly designed.'
  }),
  Object.freeze({
    id: 'official-cache',
    status: 'deferred',
    writeAllowed: false,
    reason: 'Official precompiled cache writes remain isolated from third-party install transactions.'
  })
])

const rollbackCheckpoints = (): readonly ThirdPartyDataPackTransactionRollbackCheckpoint[] => Object.freeze([
  Object.freeze({
    id: 'before-transaction-log-write',
    status: 'required',
    reason: 'A failed recovery-log prepare step must leave no observable install state.'
  }),
  Object.freeze({
    id: 'before-package-files-write',
    status: 'required',
    reason: 'Package writes must be restorable before staged files can replace or add installed content.'
  }),
  Object.freeze({
    id: 'before-settings-lockfile-write',
    status: 'required',
    reason: 'Settings and mod-lock writes must be checked against the same candidate identity before commit.'
  }),
  Object.freeze({
    id: 'before-live-registry-swap',
    status: 'required',
    reason: 'The live registry swap must have the previous registry identity available for rollback diagnostics.'
  }),
  Object.freeze({
    id: 'after-failure-restore-verification',
    status: 'required',
    reason: 'Rollback completion must verify package files, settings, lockfile and registry identity returned to a consistent state.'
  })
])

const phase = (
  id: ThirdPartyDataPackTransactionPreCommitPhase,
  status: ThirdPartyDataPackTransactionPreCommitPhaseSummary['status'],
  writeBoundaryIds: readonly ThirdPartyDataPackTransactionWriteBoundaryId[],
  rollbackCheckpointIds: readonly ThirdPartyDataPackTransactionRollbackCheckpointId[],
  reason: string
): ThirdPartyDataPackTransactionPreCommitPhaseSummary => Object.freeze({
  id,
  status,
  writeBoundaryIds: Object.freeze([...writeBoundaryIds]),
  rollbackCheckpointIds: Object.freeze([...rollbackCheckpointIds]),
  reason
})

const deferredPhases = (): readonly ThirdPartyDataPackTransactionPreCommitPhaseSummary[] => Object.freeze([
  phase(
    'pre-commit-inspection',
    'satisfied',
    [],
    [],
    'Upstream no-write reports are consistent and can be used to plan the future write boundary.'
  ),
  phase(
    'transaction-log-prepare',
    'deferred',
    ['transaction-log'],
    ['before-transaction-log-write'],
    'Prepare a recovery log entry before any package, settings or lockfile writes.'
  ),
  phase(
    'package-write-stage',
    'deferred',
    ['package-files', 'package-backups'],
    ['before-package-files-write'],
    'Stage package file and backup mutations without exposing them as enabled content.'
  ),
  phase(
    'settings-lockfile-stage',
    'deferred',
    ['installation-settings', 'mod-lockfile'],
    ['before-settings-lockfile-write'],
    'Commit installation settings and mod-lock atomically after staged package verification.'
  ),
  phase(
    'live-registry-swap',
    'deferred',
    ['live-registry'],
    ['before-live-registry-swap'],
    'Swap the live registry only after package and persistent-state writes are verified.'
  ),
  phase(
    'post-commit-verification',
    'deferred',
    ['player-saves', 'official-cache'],
    [],
    'Verify save/cache isolation remains intact; this plan still allows no save or official cache writes.'
  ),
  phase(
    'rollback-finalization',
    'deferred',
    [],
    ['after-failure-restore-verification'],
    'Finalize recovery by proving every touched boundary returned to one consistent installed state.'
  )
])

const terminalPhases = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackTransactionPreCommitPhaseSummary[] => Object.freeze([
  'pre-commit-inspection',
  'transaction-log-prepare',
  'package-write-stage',
  'settings-lockfile-stage',
  'live-registry-swap',
  'post-commit-verification',
  'rollback-finalization'
].map(id => phase(id as ThirdPartyDataPackTransactionPreCommitPhase, status, [], [], reason)))

const freezeResult = (
  result: ThirdPartyDataPackTransactionPreCommitPlanResult
): ThirdPartyDataPackTransactionPreCommitPlanResult => deepFreezeObjectGraph(result)

const baseResult = (
  status: ThirdPartyDataPackTransactionPreCommitPlanStatus,
  reason: string,
  transactionPreflight: ThirdPartyDataPackTransactionPreflightResult,
  runtimePublicationPreflight: ThirdPartyDataPackRuntimePublicationPreflightResult,
  preCommitChecks: readonly ThirdPartyDataPackTransactionPreCommitCheck[],
  diagnostics: readonly ModDiagnostic[],
  phases: readonly ThirdPartyDataPackTransactionPreCommitPhaseSummary[],
  includeDeferredBoundaries: boolean
): ThirdPartyDataPackTransactionPreCommitPlanResult => freezeResult({
  status,
  transactionPreflightStatus: transactionPreflight.status,
  runtimePublicationPreflightStatus: runtimePublicationPreflight.status,
  reason,
  diagnostics: cloneDiagnostics(diagnostics),
  selectedPackageIds: clonePackageIds(transactionPreflight.selectedPackageIds),
  blockedPackageIds: clonePackageIds(transactionPreflight.blockedPackageIds),
  blockedCandidatePaths: cloneStringList(transactionPreflight.blockedCandidatePaths),
  loadOrder: clonePackageIds(transactionPreflight.loadOrder),
  registryCount: transactionPreflight.registryCount,
  entryCount: transactionPreflight.entryCount,
  packageCount: transactionPreflight.packageCount,
  officialIdentity: cloneOfficialIdentity(transactionPreflight.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(transactionPreflight.candidateIdentity),
  lockfileHash: transactionPreflight.lockfileHash,
  preCommitPlan: 'deferred',
  commitAllowed: false,
  writeAllowed: false,
  recoveryRequired: false,
  rollbackRequired: false,
  preCommitChecks,
  phases,
  writeBoundaries: includeDeferredBoundaries ? writeBoundaries() : Object.freeze([]),
  rollbackCheckpoints: includeDeferredBoundaries ? rollbackCheckpoints() : Object.freeze([]),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackTransactionPreCommitPlan = (
  options: BuildThirdPartyDataPackTransactionPreCommitPlanOptions
): ThirdPartyDataPackTransactionPreCommitPlanResult => {
  const transactionPreflight = options.transactionPreflight ?? buildThirdPartyDataPackTransactionPreflight(options)
  const runtimePublicationPreflight = options.runtimePublicationPreflight
    ?? buildThirdPartyDataPackRuntimePublicationPreflight({
      ...options,
      transactionPreflight
    })

  if (transactionPreflight.status === 'skipped' || runtimePublicationPreflight.status === 'skipped') {
    const reason = 'no selected third-party data packs'
    return baseResult(
      'skipped',
      reason,
      transactionPreflight,
      runtimePublicationPreflight,
      skippedChecks(reason),
      [],
      terminalPhases('skipped', reason),
      false
    )
  }

  if (transactionPreflight.status === 'blocked' || runtimePublicationPreflight.status === 'blocked') {
    const reason = transactionPreflight.status === 'blocked'
      ? transactionPreflight.reason
      : runtimePublicationPreflight.reason
    return baseResult(
      'blocked',
      reason,
      transactionPreflight,
      runtimePublicationPreflight,
      skippedChecks(reason),
      [
        ...cloneDiagnostics(transactionPreflight.diagnostics),
        ...cloneDiagnostics(runtimePublicationPreflight.diagnostics)
      ],
      terminalPhases('blocked', reason),
      false
    )
  }

  const preCommitChecks = buildPreCommitChecks(transactionPreflight, runtimePublicationPreflight)
  const blockedDiagnostics = diagnosticsForBlockedChecks(preCommitChecks)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'transaction pre-commit plan inputs are inconsistent',
      transactionPreflight,
      runtimePublicationPreflight,
      preCommitChecks,
      [
        ...cloneDiagnostics(transactionPreflight.diagnostics),
        ...cloneDiagnostics(runtimePublicationPreflight.diagnostics),
        ...blockedDiagnostics
      ],
      terminalPhases('blocked', 'transaction pre-commit plan inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'transaction pre-commit plan is inspect-only until write adapters, recovery logs and rollback verification exist',
    transactionPreflight,
    runtimePublicationPreflight,
    preCommitChecks,
    [
      ...cloneDiagnostics(transactionPreflight.diagnostics),
      ...cloneDiagnostics(runtimePublicationPreflight.diagnostics)
    ],
    deferredPhases(),
    true
  )
}
