import type { JsonValue } from './canonicalJson'
import type { ModDiagnostic, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { RegistrySet } from './registry'
import {
  buildThirdPartyCandidateRegistrySnapshot,
  type ThirdPartyCandidateIdentitySummary,
  type ThirdPartyCandidateOfficialIdentitySummary,
  type ThirdPartyCandidateRegistrySnapshotResult
} from './thirdPartyCandidateRegistrySnapshot'
import type { ThirdPartyDataPackDiscoveryReport } from './thirdPartyDataPackDiscovery'
import {
  createThirdPartyDataPackLockfileDraft,
  validateThirdPartyDataPackLockfileDraft,
  type ThirdPartyDataPackLockfileDraftResult,
  type ThirdPartyDataPackLockfileDraftValidationResult
} from './thirdPartyDataPackLockfileDraft'
import {
  selectThirdPartyDataPacks,
  type ThirdPartyDataPackSelectionReport
} from './thirdPartyDataPackSelection'

export type ThirdPartyDataPackMountPreflightStatus = 'ready' | 'rolled-back' | 'skipped'

export type ThirdPartyDataPackMountPreflightStageName =
  | 'discovery'
  | 'selection'
  | 'candidate-snapshot'
  | 'lockfile-draft'
  | 'lockfile-validation'
  | 'runtime-publish'
  | 'rollback'

export type ThirdPartyDataPackMountPreflightStageStatus =
  | 'completed'
  | 'skipped'
  | 'failed'
  | 'deferred'

export interface ThirdPartyDataPackMountPreflightStage {
  readonly name: ThirdPartyDataPackMountPreflightStageName
  readonly status: ThirdPartyDataPackMountPreflightStageStatus
  readonly diagnostics: readonly ModDiagnostic[]
  readonly details?: Readonly<Record<string, string | number | boolean>>
}

export interface ThirdPartyDataPackMountPreflightEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly packageFilesWritten: false
  readonly cacheWritten: false
}

export interface ThirdPartyDataPackMountPreflightRollbackSummary {
  readonly required: boolean
  readonly reason: string
  readonly retainedOfficialRegistryCount: number
  readonly retainedOfficialEntryCount: number
  readonly discardedCandidateRegistry: boolean
  readonly discardedLockfileDraft: boolean
}

export interface ThirdPartyDataPackMountPreflightResult {
  readonly status: ThirdPartyDataPackMountPreflightStatus
  readonly stages: readonly ThirdPartyDataPackMountPreflightStage[]
  readonly diagnostics: readonly ModDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly blockedCandidatePaths: readonly string[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly officialIdentity: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidateIdentity?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
  readonly packageCount: number
  readonly effects: ThirdPartyDataPackMountPreflightEffectSummary
  readonly rollback: ThirdPartyDataPackMountPreflightRollbackSummary
}

export interface BuildThirdPartyDataPackMountPreflightOptions {
  readonly officialRegistrySet: RegistrySet
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly selectionReport?: ThirdPartyDataPackSelectionReport
  readonly candidateSnapshot?: ThirdPartyCandidateRegistrySnapshotResult
  readonly lockfileDraftResult?: ThirdPartyDataPackLockfileDraftResult
  readonly lockfileValidationResult?: ThirdPartyDataPackLockfileDraftValidationResult
}

const blockingSeverities = new Set<ModDiagnosticSeverity>(['error', 'fatal'])

const hasBlockingDiagnostic = (diagnostics: readonly ModDiagnostic[]): boolean =>
  diagnostics.some(diagnostic => blockingSeverities.has(diagnostic.severity))

const readJsonArrayLength = (value: readonly JsonValue[]): number | undefined => {
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

const readDiagnosticArrayLength = (value: readonly unknown[]): number | undefined => {
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

const cloneDiagnosticPackageIds = (value: unknown): PackageId[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const length = readDiagnosticArrayLength(value)
  if (length === undefined) return undefined

  const result: PackageId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor && typeof descriptor.value === 'string') {
      result.push(descriptor.value as PackageId)
    }
  }
  return result
}

const cloneStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const length = readDiagnosticArrayLength(value)
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
  return result
}

const clonePackageIds = (value: unknown): PackageId[] =>
  cloneStringList(value).map(item => item as PackageId)

const cloneJsonValue = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) {
    const length = readJsonArrayLength(value)
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

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) deepFreezeObjectGraph(child)
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

const cloneDiagnostic = (diagnostic: ModDiagnostic): ModDiagnostic => ({
  code: diagnostic.code,
  ruleId: diagnostic.ruleId,
  severity: diagnostic.severity,
  stage: diagnostic.stage,
  messageKey: diagnostic.messageKey,
  packageId: diagnostic.packageId,
  file: diagnostic.file,
  fieldPath: diagnostic.fieldPath,
  registryId: diagnostic.registryId,
  contentId: diagnostic.contentId,
  relatedPackageIds: cloneDiagnosticPackageIds(readDiagnosticDataField(diagnostic, 'relatedPackageIds')),
  details: cloneDiagnosticDetails(diagnostic.details),
  recovery: diagnostic.recovery
})

const freezeDiagnosticDetails = (
  details: ModDiagnostic['details']
): ModDiagnostic['details'] => {
  const cloned = cloneDiagnosticDetails(details)
  return cloned === undefined ? undefined : deepFreezeObjectGraph(cloned) as ModDiagnostic['details']
}

const freezeDiagnostic = (diagnostic: ModDiagnostic): ModDiagnostic => Object.freeze({
  ...diagnostic,
  relatedPackageIds: diagnostic.relatedPackageIds
    ? Object.freeze([...diagnostic.relatedPackageIds]) as PackageId[]
    : undefined,
  details: freezeDiagnosticDetails(diagnostic.details)
})

const cloneDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return []
  const length = readDiagnosticArrayLength(diagnostics)
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

const uniqueDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] => {
  const seen = new Set<string>()
  const result: ModDiagnostic[] = []
  for (const diagnostic of diagnostics) {
    const copiedDiagnostic = cloneDiagnostic(diagnostic)
    const key = JSON.stringify({
      code: copiedDiagnostic.code,
      stage: copiedDiagnostic.stage,
      severity: copiedDiagnostic.severity,
      packageId: copiedDiagnostic.packageId,
      file: copiedDiagnostic.file,
      fieldPath: copiedDiagnostic.fieldPath,
      registryId: copiedDiagnostic.registryId,
      contentId: copiedDiagnostic.contentId,
      relatedPackageIds: copiedDiagnostic.relatedPackageIds,
      details: copiedDiagnostic.details
    })
    if (seen.has(key)) continue
    seen.add(key)
    result.push(freezeDiagnostic(copiedDiagnostic))
  }
  return result
}

const freezeDiagnostics = (diagnostics: readonly ModDiagnostic[]): readonly ModDiagnostic[] =>
  Object.freeze(uniqueDiagnostics(cloneDiagnostics(diagnostics)))

const createEffectSummary = (): ThirdPartyDataPackMountPreflightEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  packageFilesWritten: false,
  cacheWritten: false
})

const freezeEffectSummary = (
  effects: ThirdPartyDataPackMountPreflightEffectSummary
): ThirdPartyDataPackMountPreflightEffectSummary => Object.freeze(effects)

const freezeStageDetails = (
  details: Readonly<Record<string, string | number | boolean>>
): Readonly<Record<string, string | number | boolean>> => Object.freeze({ ...details })

const freezeStage = (
  stage: ThirdPartyDataPackMountPreflightStage
): ThirdPartyDataPackMountPreflightStage => Object.freeze({
  ...stage,
  diagnostics: freezeDiagnostics(stage.diagnostics),
  ...(stage.details ? { details: freezeStageDetails(stage.details) } : {})
})

const freezeStages = (
  stages: readonly ThirdPartyDataPackMountPreflightStage[]
): readonly ThirdPartyDataPackMountPreflightStage[] =>
  Object.freeze(stages.map(currentStage => freezeStage(currentStage)))

const freezePackageIds = (packageIds: readonly PackageId[]): readonly PackageId[] =>
  Object.freeze(clonePackageIds(packageIds))

const freezeStringList = (values: readonly string[]): readonly string[] =>
  Object.freeze(cloneStringList(values))

const freezeOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateOfficialIdentitySummary => Object.freeze({ ...identity })

const freezeCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : Object.freeze({ ...identity })

const freezeRollbackSummary = (
  rollback: ThirdPartyDataPackMountPreflightRollbackSummary
): ThirdPartyDataPackMountPreflightRollbackSummary => Object.freeze(rollback)

const stage = (
  name: ThirdPartyDataPackMountPreflightStageName,
  status: ThirdPartyDataPackMountPreflightStageStatus,
  diagnostics: readonly ModDiagnostic[],
  details?: Readonly<Record<string, string | number | boolean>>
): ThirdPartyDataPackMountPreflightStage => freezeStage({
  name,
  status,
  diagnostics,
  ...(details ? { details } : {})
})

const discoveryDiagnostics = (report: ThirdPartyDataPackDiscoveryReport): ModDiagnostic[] =>
  report.issues.flatMap(issue => issue.diagnostics)

const selectionDiagnostics = (report: ThirdPartyDataPackSelectionReport): ModDiagnostic[] =>
  report.issues.flatMap(issue => issue.diagnostics)

const discoveryStageStatus = (
  report: ThirdPartyDataPackDiscoveryReport
): ThirdPartyDataPackMountPreflightStageStatus => {
  if (report.status === 'directory-not-found' || hasBlockingDiagnostic(discoveryDiagnostics(report))) return 'failed'
  if (report.status === 'empty') return 'skipped'
  return 'completed'
}

const selectionStageStatus = (
  report: ThirdPartyDataPackSelectionReport,
  discoveryFailed: boolean
): ThirdPartyDataPackMountPreflightStageStatus => {
  if (discoveryFailed) return 'skipped'
  if (report.status !== 'completed' || hasBlockingDiagnostic(selectionDiagnostics(report))) return 'failed'
  if (report.summary.selectedPackageCount === 0) return 'skipped'
  return 'completed'
}

const candidateStageStatus = (
  candidate: ThirdPartyCandidateRegistrySnapshotResult
): ThirdPartyDataPackMountPreflightStageStatus => {
  if (candidate.status === 'valid') return 'completed'
  if (candidate.status === 'skipped') return 'skipped'
  return 'failed'
}

const draftStageStatus = (
  draft: ThirdPartyDataPackLockfileDraftResult
): ThirdPartyDataPackMountPreflightStageStatus => {
  if (draft.status === 'valid') return 'completed'
  if (draft.status === 'skipped') return 'skipped'
  return 'failed'
}

const validationStageStatus = (
  draft: ThirdPartyDataPackLockfileDraftResult,
  validation: ThirdPartyDataPackLockfileDraftValidationResult
): ThirdPartyDataPackMountPreflightStageStatus => {
  if (draft.status === 'skipped') return 'skipped'
  return validation.status === 'valid' ? 'completed' : 'failed'
}

const rollbackReason = (
  discoveryFailed: boolean,
  selectionFailed: boolean,
  candidate: ThirdPartyCandidateRegistrySnapshotResult,
  draft: ThirdPartyDataPackLockfileDraftResult,
  validation: ThirdPartyDataPackLockfileDraftValidationResult
): string => {
  if (discoveryFailed) return 'discovery failed'
  if (selectionFailed) return 'selection failed'
  if (candidate.status === 'invalid') return 'candidate snapshot failed'
  if (draft.status === 'invalid') return 'lockfile draft failed'
  if (validation.status === 'invalid') return 'lockfile draft validation failed'
  return 'not required'
}

export const buildThirdPartyDataPackMountPreflight = (
  options: BuildThirdPartyDataPackMountPreflightOptions
): ThirdPartyDataPackMountPreflightResult => {
  const selectionReport = options.selectionReport ?? selectThirdPartyDataPacks(options.discoveryReport)
  const candidateSnapshot = options.candidateSnapshot ?? buildThirdPartyCandidateRegistrySnapshot({
    officialRegistrySet: options.officialRegistrySet,
    discoveryReport: options.discoveryReport,
    selectionReport
  })
  const lockfileDraftResult = options.lockfileDraftResult ?? createThirdPartyDataPackLockfileDraft({
    discoveryReport: options.discoveryReport,
    selectionReport,
    candidateSnapshot
  })
  const lockfileValidationResult = options.lockfileValidationResult ?? validateThirdPartyDataPackLockfileDraft({
    discoveryReport: options.discoveryReport,
    selectionReport,
    candidateSnapshot,
    draft: lockfileDraftResult.draft
  })

  const discoveryStageDiagnostics = discoveryDiagnostics(options.discoveryReport)
  const selectionStageDiagnostics = selectionDiagnostics(selectionReport)
  const candidateSnapshotDiagnostics = cloneDiagnostics(candidateSnapshot.diagnostics)
  const lockfileDraftDiagnostics = cloneDiagnostics(lockfileDraftResult.diagnostics)
  const lockfileValidationDiagnostics = cloneDiagnostics(lockfileValidationResult.diagnostics)
  const discoveryFailed = discoveryStageStatus(options.discoveryReport) === 'failed'
  const selectionFailed = selectionStageStatus(selectionReport, discoveryFailed) === 'failed'
  const candidateFailed = candidateSnapshot.status === 'invalid'
  const draftFailed = lockfileDraftResult.status === 'invalid'
  const validationFailed = lockfileValidationResult.status === 'invalid'
  const hasFailure = discoveryFailed || selectionFailed || candidateFailed || draftFailed || validationFailed
  const isSkipped = !hasFailure && candidateSnapshot.status === 'skipped'
  const status: ThirdPartyDataPackMountPreflightStatus = hasFailure
    ? 'rolled-back'
    : isSkipped
      ? 'skipped'
      : 'ready'
  const reason = rollbackReason(
    discoveryFailed,
    selectionFailed,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult
  )

  const stages: ThirdPartyDataPackMountPreflightStage[] = [
    stage('discovery', discoveryStageStatus(options.discoveryReport), discoveryStageDiagnostics, {
      candidateCount: options.discoveryReport.summary.candidateCount,
      validPackageCount: options.discoveryReport.summary.validPackageCount,
      invalidPackageCount: options.discoveryReport.summary.invalidPackageCount
    }),
    stage('selection', selectionStageStatus(selectionReport, discoveryFailed), selectionStageDiagnostics, {
      selectedPackageCount: selectionReport.summary.selectedPackageCount,
      blockedPackageCount: selectionReport.summary.blockedPackageCount
    }),
    stage('candidate-snapshot', candidateStageStatus(candidateSnapshot), candidateSnapshotDiagnostics, {
      registryCount: candidateSnapshot.registryCount,
      entryCount: candidateSnapshot.entryCount
    }),
    stage('lockfile-draft', draftStageStatus(lockfileDraftResult), lockfileDraftDiagnostics, {
      packageCount: lockfileDraftResult.draft?.packages.length ?? 0
    }),
    stage('lockfile-validation', validationStageStatus(lockfileDraftResult, lockfileValidationResult), lockfileValidationDiagnostics),
    stage('runtime-publish', status === 'ready' ? 'deferred' : 'skipped', [], {
      reason: 'Runtime third-party registry publication is outside this read-only preflight slice.'
    }),
    stage('rollback', status === 'rolled-back' ? 'completed' : 'skipped', [], {
      reason
    })
  ]

  const diagnostics = freezeDiagnostics([
    ...discoveryStageDiagnostics,
    ...selectionStageDiagnostics,
    ...candidateSnapshotDiagnostics,
    ...lockfileDraftDiagnostics,
    ...lockfileValidationDiagnostics
  ])

  return Object.freeze({
    status,
    stages: freezeStages(stages),
    diagnostics,
    selectedPackageIds: freezePackageIds(candidateSnapshot.selectedPackageIds),
    blockedPackageIds: freezePackageIds(candidateSnapshot.blockedPackageIds),
    blockedCandidatePaths: freezeStringList(candidateSnapshot.blockedCandidatePaths),
    loadOrder: freezePackageIds(candidateSnapshot.loadOrder),
    registryCount: candidateSnapshot.registryCount,
    entryCount: candidateSnapshot.entryCount,
    officialIdentity: freezeOfficialIdentity(candidateSnapshot.officialIdentity),
    candidateIdentity: freezeCandidateIdentity(candidateSnapshot.candidateIdentity),
    lockfileHash: lockfileDraftResult.draft?.lockfileHash,
    packageCount: lockfileDraftResult.draft?.packages.length ?? 0,
    effects: freezeEffectSummary(createEffectSummary()),
    rollback: freezeRollbackSummary({
      required: status === 'rolled-back',
      reason,
      retainedOfficialRegistryCount: candidateSnapshot.officialIdentity.registryCount,
      retainedOfficialEntryCount: candidateSnapshot.officialIdentity.entryCount,
      discardedCandidateRegistry: status === 'rolled-back' && candidateSnapshot.status !== 'valid',
      discardedLockfileDraft: status === 'rolled-back' && lockfileDraftResult.status !== 'valid'
    })
  })
}
