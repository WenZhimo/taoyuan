import type { JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { RegistrySet, SerializableRegistrySnapshot } from './registry'
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
  type ThirdPartyDataPackLockfileDraft,
  type ThirdPartyDataPackLockfileDraftResult,
  type ThirdPartyDataPackLockfileDraftValidationResult
} from './thirdPartyDataPackLockfileDraft'
import {
  buildThirdPartyDataPackMountPreflight,
  type ThirdPartyDataPackMountPreflightEffectSummary,
  type ThirdPartyDataPackMountPreflightResult
} from './thirdPartyDataPackMountPreflight'
import {
  selectThirdPartyDataPacks,
  type ThirdPartyDataPackSelectionReport
} from './thirdPartyDataPackSelection'

export type ThirdPartyDataPackMountInputStatus = 'ready' | 'skipped' | 'blocked'

export interface ThirdPartyDataPackMountInputResult {
  readonly status: ThirdPartyDataPackMountInputStatus
  readonly preflightStatus: ThirdPartyDataPackMountPreflightResult['status']
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
  readonly effects: ThirdPartyDataPackMountPreflightEffectSummary
  readonly runtimePublication: 'deferred'
  readonly preflight: ThirdPartyDataPackMountPreflightResult
  readonly candidateSnapshot?: SerializableRegistrySnapshot
  readonly candidateRegistrySet?: RegistrySet
  readonly lockfileDraft?: ThirdPartyDataPackLockfileDraft
}

export interface BuildThirdPartyDataPackMountInputOptions {
  readonly officialRegistrySet: RegistrySet
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly selectionReport?: ThirdPartyDataPackSelectionReport
  readonly candidateSnapshot?: ThirdPartyCandidateRegistrySnapshotResult
  readonly lockfileDraftResult?: ThirdPartyDataPackLockfileDraftResult
  readonly lockfileValidationResult?: ThirdPartyDataPackLockfileDraftValidationResult
  readonly preflight?: ThirdPartyDataPackMountPreflightResult
}

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

const freezeJsonValue = (value: JsonValue): JsonValue => deepFreezeObjectGraph(value)

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

const freezeDiagnosticDetails = (
  details: ModDiagnostic['details']
): ModDiagnostic['details'] => {
  const cloned = cloneDiagnosticDetails(details)
  return cloned === undefined ? undefined : freezeJsonValue(cloned) as ModDiagnostic['details']
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

const createMountInputDiagnostic = (
  fieldPath: string,
  reason: string,
  actual?: string
): ModDiagnostic => createDiagnostic('CACHE-INVALID-001', {
  stage: 'third-party.mount-input.ready',
  severity: 'error',
  fieldPath,
  details: {
    reason,
    ...(actual ? { actual } : {})
  }
})

const validateReadyInput = (
  preflight: ThirdPartyDataPackMountPreflightResult,
  candidateSnapshot: ThirdPartyCandidateRegistrySnapshotResult,
  lockfileDraftResult: ThirdPartyDataPackLockfileDraftResult,
  lockfileValidationResult: ThirdPartyDataPackLockfileDraftValidationResult
): ModDiagnostic[] => {
  const diagnostics: ModDiagnostic[] = []
  if (preflight.status !== 'ready') {
    diagnostics.push(createMountInputDiagnostic(
      '/preflight/status',
      'Mount input can only be prepared from a ready preflight.',
      preflight.status
    ))
  }
  if (candidateSnapshot.status !== 'valid') {
    diagnostics.push(createMountInputDiagnostic(
      '/candidateSnapshot/status',
      'Mount input requires a valid candidate registry snapshot.',
      candidateSnapshot.status
    ))
  }
  if (!candidateSnapshot.candidateRegistrySet) {
    diagnostics.push(createMountInputDiagnostic(
      '/candidateRegistrySet',
      'Mount input requires the frozen in-memory candidate RegistrySet.'
    ))
  } else if (candidateSnapshot.candidateRegistrySet.currentPhase !== 'frozen') {
    diagnostics.push(createMountInputDiagnostic(
      '/candidateRegistrySet/currentPhase',
      'Mount input candidate RegistrySet must already be frozen.',
      candidateSnapshot.candidateRegistrySet.currentPhase
    ))
  }
  if (!candidateSnapshot.candidateSnapshot) {
    diagnostics.push(createMountInputDiagnostic(
      '/candidateSnapshot/candidateSnapshot',
      'Mount input requires the serializable candidate snapshot.'
    ))
  }
  if (!candidateSnapshot.candidateIdentity) {
    diagnostics.push(createMountInputDiagnostic(
      '/candidateSnapshot/candidateIdentity',
      'Mount input requires the candidate identity summary.'
    ))
  }
  if (lockfileDraftResult.status !== 'valid' || !lockfileDraftResult.draft) {
    diagnostics.push(createMountInputDiagnostic(
      '/lockfileDraft/status',
      'Mount input requires a valid in-memory lockfile draft.',
      lockfileDraftResult.status
    ))
  }
  if (lockfileValidationResult.status !== 'valid') {
    diagnostics.push(createMountInputDiagnostic(
      '/lockfileValidation/status',
      'Mount input requires lockfile draft validation to pass.',
      lockfileValidationResult.status
    ))
  }
  if (
    candidateSnapshot.candidateIdentity
    && preflight.candidateIdentity
    && candidateSnapshot.candidateIdentity.candidateHash !== preflight.candidateIdentity.candidateHash
  ) {
    diagnostics.push(createMountInputDiagnostic(
      '/candidateIdentity/candidateHash',
      'Preflight candidate hash does not match the candidate snapshot result.'
    ))
  }
  if (
    lockfileDraftResult.draft
    && preflight.lockfileHash
    && lockfileDraftResult.draft.lockfileHash !== preflight.lockfileHash
  ) {
    diagnostics.push(createMountInputDiagnostic(
      '/lockfileHash',
      'Preflight lockfile hash does not match the lockfile draft result.'
    ))
  }
  return diagnostics
}

const cloneOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateOfficialIdentitySummary => ({ ...identity })

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : { ...identity }

const freezeOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateOfficialIdentitySummary => Object.freeze(cloneOfficialIdentity(identity))

const freezeCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined =>
  identity === undefined ? undefined : Object.freeze(cloneCandidateIdentity(identity))

const cloneCandidateSnapshot = (
  snapshot: SerializableRegistrySnapshot | undefined
): SerializableRegistrySnapshot | undefined =>
  snapshot === undefined ? undefined : JSON.parse(JSON.stringify(snapshot)) as SerializableRegistrySnapshot

const freezeCandidateSnapshot = (
  snapshot: SerializableRegistrySnapshot | undefined
): SerializableRegistrySnapshot | undefined =>
  snapshot === undefined ? undefined : deepFreezeObjectGraph(cloneCandidateSnapshot(snapshot))

const freezeLockfileDraft = (
  draft: ThirdPartyDataPackLockfileDraft | undefined
): ThirdPartyDataPackLockfileDraft | undefined =>
  draft === undefined
    ? undefined
    : deepFreezeObjectGraph(JSON.parse(JSON.stringify(draft)) as ThirdPartyDataPackLockfileDraft)

const freezePackageIds = (packageIds: readonly PackageId[]): readonly PackageId[] =>
  Object.freeze(clonePackageIds(packageIds))

const freezeStringList = (values: readonly string[]): readonly string[] =>
  Object.freeze(cloneStringList(values))

const freezeEffectSummary = (
  effects: ThirdPartyDataPackMountPreflightEffectSummary
): ThirdPartyDataPackMountPreflightEffectSummary => Object.freeze({ ...effects })

const freezePreflight = (
  preflight: ThirdPartyDataPackMountPreflightResult
): ThirdPartyDataPackMountPreflightResult =>
  Object.freeze({
    status: preflight.status,
    stages: Object.freeze(preflight.stages.map(currentStage => Object.freeze({
      name: currentStage.name,
      status: currentStage.status,
      diagnostics: freezeDiagnostics(currentStage.diagnostics),
      ...(currentStage.details
        ? { details: Object.freeze(cloneJsonValue(currentStage.details as JsonValue)) as Readonly<Record<string, string | number | boolean>> }
        : {})
    }))),
    diagnostics: freezeDiagnostics(preflight.diagnostics),
    selectedPackageIds: freezePackageIds(preflight.selectedPackageIds),
    blockedPackageIds: freezePackageIds(preflight.blockedPackageIds),
    blockedCandidatePaths: freezeStringList(preflight.blockedCandidatePaths),
    loadOrder: freezePackageIds(preflight.loadOrder),
    registryCount: preflight.registryCount,
    entryCount: preflight.entryCount,
    officialIdentity: freezeOfficialIdentity(preflight.officialIdentity),
    candidateIdentity: freezeCandidateIdentity(preflight.candidateIdentity),
    lockfileHash: preflight.lockfileHash,
    packageCount: preflight.packageCount,
    effects: freezeEffectSummary(preflight.effects),
    rollback: Object.freeze({ ...preflight.rollback })
  })

const baseResult = (
  status: ThirdPartyDataPackMountInputStatus,
  reason: string,
  preflight: ThirdPartyDataPackMountPreflightResult,
  diagnostics: readonly ModDiagnostic[]
): Omit<
  ThirdPartyDataPackMountInputResult,
  'candidateSnapshot' | 'candidateRegistrySet' | 'lockfileDraft'
> => Object.freeze({
  status,
  preflightStatus: preflight.status,
  reason,
  diagnostics: freezeDiagnostics(diagnostics),
  selectedPackageIds: freezePackageIds(preflight.selectedPackageIds),
  blockedPackageIds: freezePackageIds(preflight.blockedPackageIds),
  blockedCandidatePaths: freezeStringList(preflight.blockedCandidatePaths),
  loadOrder: freezePackageIds(preflight.loadOrder),
  registryCount: preflight.registryCount,
  entryCount: preflight.entryCount,
  packageCount: preflight.packageCount,
  officialIdentity: freezeOfficialIdentity(preflight.officialIdentity),
  candidateIdentity: freezeCandidateIdentity(preflight.candidateIdentity),
  lockfileHash: preflight.lockfileHash,
  effects: freezeEffectSummary(preflight.effects),
  runtimePublication: 'deferred',
  preflight: freezePreflight(preflight)
})

export const buildThirdPartyDataPackMountInput = (
  options: BuildThirdPartyDataPackMountInputOptions
): ThirdPartyDataPackMountInputResult => {
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
  const preflight = options.preflight ?? buildThirdPartyDataPackMountPreflight({
    officialRegistrySet: options.officialRegistrySet,
    discoveryReport: options.discoveryReport,
    selectionReport,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult
  })
  const preflightDiagnostics = cloneDiagnostics(preflight.diagnostics)

  if (preflight.status === 'skipped') {
    return baseResult('skipped', 'no selected third-party data packs', preflight, preflightDiagnostics)
  }

  if (preflight.status !== 'ready') {
    return baseResult('blocked', preflight.rollback.reason, preflight, preflightDiagnostics)
  }

  const readyDiagnostics = validateReadyInput(
    preflight,
    candidateSnapshot,
    lockfileDraftResult,
    lockfileValidationResult
  )
  if (readyDiagnostics.length > 0) {
    return baseResult('blocked', 'ready preflight is missing verified mount input artifacts', preflight, [
      ...preflightDiagnostics,
      ...readyDiagnostics
    ])
  }

  return Object.freeze({
    ...baseResult('ready', 'ready for future runtime mount adapter', preflight, preflightDiagnostics),
    candidateSnapshot: freezeCandidateSnapshot(candidateSnapshot.candidateSnapshot),
    candidateRegistrySet: candidateSnapshot.candidateRegistrySet,
    lockfileDraft: freezeLockfileDraft(lockfileDraftResult.draft)
  })
}
