import type { JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic, type ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type { ThirdPartyDataPackDiscoveryReport } from './thirdPartyDataPackDiscovery'
import {
  buildThirdPartyDataPackMountInput,
  type BuildThirdPartyDataPackMountInputOptions,
  type ThirdPartyDataPackMountInputResult
} from './thirdPartyDataPackMountInput'
import {
  buildThirdPartyDataPackSourceAdapterGate,
  type BuildThirdPartyDataPackSourceAdapterGateOptions,
  type ThirdPartyDataPackSourceAdapterGateResult
} from './thirdPartyDataPackSourceAdapterGate'

export type ThirdPartyDataPackRuntimePublicationPreflightStatus = 'deferred' | 'skipped' | 'blocked'

export type ThirdPartyDataPackRuntimePublicationHandoffCheckId =
  | 'mount-input-ready'
  | 'candidate-registry-frozen'
  | 'candidate-snapshot-available'
  | 'lockfile-draft-available'
  | 'candidate-identity-matches-source-gate'
  | 'lockfile-hash-matches-source-gate'
  | 'source-adapter-boundary-defined'

export type ThirdPartyDataPackRuntimePublicationRequirementId =
  | 'runtime-publication-commit-adapter'
  | 'live-registry-swap-protection'
  | 'publication-failure-rollback'

export interface ThirdPartyDataPackRuntimePublicationHandoffCheck {
  readonly id: ThirdPartyDataPackRuntimePublicationHandoffCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimePublicationRequirement {
  readonly id: ThirdPartyDataPackRuntimePublicationRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimePublicationPreflightEffectSummary {
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

export interface ThirdPartyDataPackRuntimePublicationPreflightResult {
  readonly status: ThirdPartyDataPackRuntimePublicationPreflightStatus
  readonly mountInputStatus: ThirdPartyDataPackMountInputResult['status']
  readonly sourceAdapterGateStatus: ThirdPartyDataPackSourceAdapterGateResult['status']
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
  readonly runtimePublication: 'deferred'
  readonly publicationAllowed: false
  readonly candidateRegistryFrozen: boolean
  readonly candidateSnapshotAvailable: boolean
  readonly lockfileDraftAvailable: boolean
  readonly handoffChecks: readonly ThirdPartyDataPackRuntimePublicationHandoffCheck[]
  readonly remainingRequirements: readonly ThirdPartyDataPackRuntimePublicationRequirement[]
  readonly effects: ThirdPartyDataPackRuntimePublicationPreflightEffectSummary
}

export interface BuildThirdPartyDataPackRuntimePublicationPreflightOptions
  extends BuildThirdPartyDataPackSourceAdapterGateOptions,
    BuildThirdPartyDataPackMountInputOptions {
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly mountInput?: ThirdPartyDataPackMountInputResult
  readonly sourceAdapterGate?: ThirdPartyDataPackSourceAdapterGateResult
}

const createEffectSummary = (): ThirdPartyDataPackRuntimePublicationPreflightEffectSummary => ({
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
const diagnosticCopyFallbackStage = 'third-party.runtime-publication-preflight.diagnostic-copy'
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

const publicationRequirements = (): readonly ThirdPartyDataPackRuntimePublicationRequirement[] => Object.freeze([
  Object.freeze({
    id: 'runtime-publication-commit-adapter',
    status: 'required',
    reason: 'Define the final atomic commit adapter before replacing the live GameApp registry reference.'
  }),
  Object.freeze({
    id: 'live-registry-swap-protection',
    status: 'required',
    reason: 'Define single-assignment live registry swap protection so partial candidate state cannot become observable.'
  }),
  Object.freeze({
    id: 'publication-failure-rollback',
    status: 'required',
    reason: 'Define rollback diagnostics and recovery before failed publication can affect startup or saves.'
  })
])

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackRuntimePublicationHandoffCheck[] => Object.freeze([
  'mount-input-ready',
  'candidate-registry-frozen',
  'candidate-snapshot-available',
  'lockfile-draft-available',
  'candidate-identity-matches-source-gate',
  'lockfile-hash-matches-source-gate',
  'source-adapter-boundary-defined'
].map(id => Object.freeze({
  id: id as ThirdPartyDataPackRuntimePublicationHandoffCheckId,
  status: 'skipped',
  reason
})))

const check = (
  id: ThirdPartyDataPackRuntimePublicationHandoffCheckId,
  status: ThirdPartyDataPackRuntimePublicationHandoffCheck['status'],
  reason: string
): ThirdPartyDataPackRuntimePublicationHandoffCheck => Object.freeze({ id, status, reason })

const buildHandoffChecks = (
  mountInput: ThirdPartyDataPackMountInputResult,
  sourceAdapterGate: ThirdPartyDataPackSourceAdapterGateResult
): readonly ThirdPartyDataPackRuntimePublicationHandoffCheck[] => Object.freeze([
  check('mount-input-ready', mountInput.status === 'ready' ? 'satisfied' : 'blocked', 'Mount input must be ready before any runtime publication handoff.'),
  check(
    'candidate-registry-frozen',
    mountInput.candidateRegistrySet?.currentPhase === 'frozen' ? 'satisfied' : 'blocked',
    'Candidate RegistrySet must already be frozen before it can be considered for publication.'
  ),
  check(
    'candidate-snapshot-available',
    mountInput.candidateSnapshot ? 'satisfied' : 'blocked',
    'Serializable candidate snapshot must be available for identity and rollback diagnostics.'
  ),
  check(
    'lockfile-draft-available',
    mountInput.lockfileDraft ? 'satisfied' : 'blocked',
    'Validated in-memory lockfile draft must be available before publication planning.'
  ),
  check(
    'candidate-identity-matches-source-gate',
    mountInput.candidateIdentity?.candidateHash !== undefined
      && mountInput.candidateIdentity.candidateHash === sourceAdapterGate.candidateIdentity?.candidateHash
      ? 'satisfied'
      : 'blocked',
    'Source adapter gate and mount input must describe the same candidate hash.'
  ),
  check(
    'lockfile-hash-matches-source-gate',
    mountInput.lockfileHash !== undefined
      && mountInput.lockfileHash === sourceAdapterGate.lockfileHash
      ? 'satisfied'
      : 'blocked',
    'Source adapter gate and mount input must describe the same lockfile draft hash.'
  ),
  check(
    'source-adapter-boundary-defined',
    sourceAdapterGate.status === 'deferred' && sourceAdapterGate.runtimeEnablementAllowed === false
      ? 'satisfied'
      : 'blocked',
    'Source adapter gate must have completed platform source checks while keeping runtime enablement closed.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackRuntimePublicationHandoffCheck[]
): readonly ModDiagnostic[] => checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.runtime-publication-preflight.handoff',
    severity: 'error',
    fieldPath: `/handoffChecks/${currentCheck.id}`,
    details: {
      reason: currentCheck.reason
    },
    recovery: 'retry'
  }))

const freezeResult = (
  result: ThirdPartyDataPackRuntimePublicationPreflightResult
): ThirdPartyDataPackRuntimePublicationPreflightResult => deepFreezeObjectGraph(result)

const baseResult = (
  status: ThirdPartyDataPackRuntimePublicationPreflightStatus,
  reason: string,
  mountInput: ThirdPartyDataPackMountInputResult,
  sourceAdapterGate: ThirdPartyDataPackSourceAdapterGateResult,
  handoffChecks: readonly ThirdPartyDataPackRuntimePublicationHandoffCheck[],
  diagnostics: readonly ModDiagnostic[],
  remainingRequirements: readonly ThirdPartyDataPackRuntimePublicationRequirement[]
): ThirdPartyDataPackRuntimePublicationPreflightResult => freezeResult({
  status,
  mountInputStatus: mountInput.status,
  sourceAdapterGateStatus: sourceAdapterGate.status,
  reason,
  diagnostics: cloneDiagnostics(diagnostics),
  selectedPackageIds: clonePackageIds(mountInput.selectedPackageIds),
  blockedPackageIds: clonePackageIds(mountInput.blockedPackageIds),
  blockedCandidatePaths: cloneStringList(mountInput.blockedCandidatePaths),
  loadOrder: clonePackageIds(mountInput.loadOrder),
  registryCount: mountInput.registryCount,
  entryCount: mountInput.entryCount,
  packageCount: mountInput.packageCount,
  officialIdentity: cloneOfficialIdentity(mountInput.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(mountInput.candidateIdentity),
  lockfileHash: mountInput.lockfileHash,
  runtimePublication: 'deferred',
  publicationAllowed: false,
  candidateRegistryFrozen: mountInput.candidateRegistrySet?.currentPhase === 'frozen',
  candidateSnapshotAvailable: mountInput.candidateSnapshot !== undefined,
  lockfileDraftAvailable: mountInput.lockfileDraft !== undefined,
  handoffChecks,
  remainingRequirements,
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackRuntimePublicationPreflight = (
  options: BuildThirdPartyDataPackRuntimePublicationPreflightOptions
): ThirdPartyDataPackRuntimePublicationPreflightResult => {
  const mountInput = options.mountInput ?? buildThirdPartyDataPackMountInput(options)
  const sourceAdapterGate = options.sourceAdapterGate ?? buildThirdPartyDataPackSourceAdapterGate({
    ...options,
    mountInput
  })

  if (mountInput.status === 'skipped' || sourceAdapterGate.status === 'skipped') {
    const reason = 'no selected third-party data packs'
    return baseResult(
      'skipped',
      reason,
      mountInput,
      sourceAdapterGate,
      skippedChecks(reason),
      [],
      []
    )
  }

  if (mountInput.status === 'blocked' || sourceAdapterGate.status === 'blocked') {
    const reason = mountInput.status === 'blocked' ? mountInput.reason : sourceAdapterGate.reason
    return baseResult(
      'blocked',
      reason,
      mountInput,
      sourceAdapterGate,
      skippedChecks(reason),
      [
        ...cloneDiagnostics(mountInput.diagnostics),
        ...cloneDiagnostics(sourceAdapterGate.diagnostics)
      ],
      []
    )
  }

  const handoffChecks = buildHandoffChecks(mountInput, sourceAdapterGate)
  const blockedDiagnostics = diagnosticsForBlockedChecks(handoffChecks)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'runtime publication handoff inputs are inconsistent',
      mountInput,
      sourceAdapterGate,
      handoffChecks,
      [
        ...cloneDiagnostics(sourceAdapterGate.diagnostics),
        ...blockedDiagnostics
      ],
      []
    )
  }

  return baseResult(
    'deferred',
    'runtime publication handoff is inspect-only until commit adapter, live swap protection and rollback recovery exist',
    mountInput,
    sourceAdapterGate,
    handoffChecks,
    sourceAdapterGate.diagnostics,
    publicationRequirements()
  )
}
