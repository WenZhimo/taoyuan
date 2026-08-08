import type { JsonValue } from './canonicalJson'
import type { ModDiagnostic, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type { ThirdPartyDataPackDiscoveryReport } from './thirdPartyDataPackDiscovery'
import {
  buildThirdPartyDataPackRuntimeAdapterGate,
  type BuildThirdPartyDataPackRuntimeAdapterGateOptions,
  type ThirdPartyDataPackRuntimeAdapterGateResult
} from './thirdPartyDataPackRuntimeAdapterGate'

export type ThirdPartyDataPackSourceAdapterGateStatus = 'deferred' | 'skipped' | 'blocked'

export type ThirdPartyDataPackSourceContractReadiness = 'defined'
export type ThirdPartyDataPackSourceContractRequirementId =
  | 'source-identity-validation'
  | 'pure-json-read-boundary'
  | 'normalized-relative-paths'
  | 'permission-revocation-diagnostics'
  | 'source-lifecycle-release'

export interface ThirdPartyDataPackSourceContractRequirement {
  readonly id: ThirdPartyDataPackSourceContractRequirementId
  readonly status: 'satisfied'
  readonly reason: string
}

export interface ThirdPartyDataPackSourceAdapterGateEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly electronIpcExposed: false
  readonly webImportPersisted: false
  readonly androidImportPersisted: false
  readonly platformSourceOpened: false
  readonly sourceHandlesRetained: false
  readonly packageFilesWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
}

export interface ThirdPartyDataPackSourceAdapterGateResult {
  readonly status: ThirdPartyDataPackSourceAdapterGateStatus
  readonly runtimeAdapterGateStatus: ThirdPartyDataPackRuntimeAdapterGateResult['status']
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
  readonly sourceContractReadiness: ThirdPartyDataPackSourceContractReadiness
  readonly contentPackageSourceContractStable: true
  readonly runtimeEnablementAllowed: false
  readonly requiredSourceContracts: readonly ThirdPartyDataPackSourceContractRequirement[]
  readonly effects: ThirdPartyDataPackSourceAdapterGateEffectSummary
}

export interface BuildThirdPartyDataPackSourceAdapterGateOptions extends BuildThirdPartyDataPackRuntimeAdapterGateOptions {
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly runtimeAdapterGate?: ThirdPartyDataPackRuntimeAdapterGateResult
}

const createEffectSummary = (): ThirdPartyDataPackSourceAdapterGateEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  electronIpcExposed: false,
  webImportPersisted: false,
  androidImportPersisted: false,
  platformSourceOpened: false,
  sourceHandlesRetained: false,
  packageFilesWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false
})

const freezeEffectSummary = (
  effects: ThirdPartyDataPackSourceAdapterGateEffectSummary
): ThirdPartyDataPackSourceAdapterGateEffectSummary => Object.freeze(effects)

const cloneOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateOfficialIdentitySummary => ({ ...identity })

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : { ...identity }

const diagnosticCopyFallbackCode = 'LIFECYCLE-TRANSACTION-001'
const diagnosticCopyFallbackStage = 'third-party.source-adapter.diagnostic-copy'
const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnostic['recovery']>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

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

const fallbackMessageKey = (code: string): string =>
  `mods.error.${code.toLowerCase().replace(/-/g, '.')}`

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

const cloneDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] =>
  diagnostics.map(diagnostic => cloneDiagnostic(diagnostic))

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object') {
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
      if (descriptor?.enumerable === true && 'value' in descriptor) deepFreezeObjectGraph(descriptor.value)
    }
  }
  return value
}

const freezeSourceAdapterGateResult = (
  result: ThirdPartyDataPackSourceAdapterGateResult
): ThirdPartyDataPackSourceAdapterGateResult => deepFreezeObjectGraph(result)

const freezeSourceContractRequirement = (
  requirement: ThirdPartyDataPackSourceContractRequirement
): ThirdPartyDataPackSourceContractRequirement => Object.freeze(requirement)

const satisfiedSourceContracts = (): readonly ThirdPartyDataPackSourceContractRequirement[] => Object.freeze([
  freezeSourceContractRequirement({
    id: 'source-identity-validation',
    status: 'satisfied',
    reason: 'ContentPackageSource identities are validated for contract version, kind, sourceId and rootPath before discovery mapping.'
  }),
  freezeSourceContractRequirement({
    id: 'pure-json-read-boundary',
    status: 'satisfied',
    reason: 'Source text payloads are parsed as unknown JSON and checked for pure JSON before downstream TypeBox validation.'
  }),
  freezeSourceContractRequirement({
    id: 'normalized-relative-paths',
    status: 'satisfied',
    reason: 'Source paths and discovery paths use normalized relative identifiers and reject absolute or escaping paths.'
  }),
  freezeSourceContractRequirement({
    id: 'permission-revocation-diagnostics',
    status: 'satisfied',
    reason: 'Revoked, disposed, unsafe or unreadable sources are surfaced as structured discovery diagnostics with source error codes.'
  }),
  freezeSourceContractRequirement({
    id: 'source-lifecycle-release',
    status: 'satisfied',
    reason: 'ContentPackageSource exposes an explicit dispose lifecycle and the developer CLI releases its source after each check.'
  })
])

const baseResult = (
  status: ThirdPartyDataPackSourceAdapterGateStatus,
  reason: string,
  runtimeAdapterGate: ThirdPartyDataPackRuntimeAdapterGateResult
): ThirdPartyDataPackSourceAdapterGateResult => freezeSourceAdapterGateResult({
  status,
  runtimeAdapterGateStatus: runtimeAdapterGate.status,
  reason,
  diagnostics: cloneDiagnostics(runtimeAdapterGate.diagnostics),
  selectedPackageIds: [...runtimeAdapterGate.selectedPackageIds],
  blockedPackageIds: [...runtimeAdapterGate.blockedPackageIds],
  blockedCandidatePaths: [...runtimeAdapterGate.blockedCandidatePaths],
  loadOrder: [...runtimeAdapterGate.loadOrder],
  registryCount: runtimeAdapterGate.registryCount,
  entryCount: runtimeAdapterGate.entryCount,
  packageCount: runtimeAdapterGate.packageCount,
  officialIdentity: cloneOfficialIdentity(runtimeAdapterGate.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(runtimeAdapterGate.candidateIdentity),
  lockfileHash: runtimeAdapterGate.lockfileHash,
  sourceContractReadiness: 'defined',
  contentPackageSourceContractStable: true,
  runtimeEnablementAllowed: false,
  requiredSourceContracts: satisfiedSourceContracts(),
  effects: freezeEffectSummary(createEffectSummary())
})

export const buildThirdPartyDataPackSourceAdapterGate = (
  options: BuildThirdPartyDataPackSourceAdapterGateOptions
): ThirdPartyDataPackSourceAdapterGateResult => {
  const runtimeAdapterGate = options.runtimeAdapterGate ?? buildThirdPartyDataPackRuntimeAdapterGate(options)

  if (runtimeAdapterGate.status === 'skipped') {
    return baseResult(
      'skipped',
      'no selected third-party data packs',
      runtimeAdapterGate
    )
  }

  if (runtimeAdapterGate.status === 'blocked') {
    return baseResult(
      'blocked',
      runtimeAdapterGate.reason,
      runtimeAdapterGate
    )
  }

  return baseResult(
    'deferred',
    'content package source contract is defined; runtime platform source adapters remain intentionally deferred',
    runtimeAdapterGate
  )
}
