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
  buildThirdPartyDataPackMountInput,
  type BuildThirdPartyDataPackMountInputOptions,
  type ThirdPartyDataPackMountInputResult
} from './thirdPartyDataPackMountInput'

export type ThirdPartyDataPackRuntimeMountGateStatus = 'deferred' | 'skipped' | 'blocked'

export type ThirdPartyDataPackRuntimeMountGateRequirementId =
  | 'runtime-registry-publication'
  | 'mod-lockfile-write'
  | 'global-settings-persistence'
  | 'save-environment-binding'
  | 'lifecycle-transaction-recovery'

export interface ThirdPartyDataPackRuntimeMountGateRequirement {
  readonly id: ThirdPartyDataPackRuntimeMountGateRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimeMountGateEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly packageFilesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
}

export interface ThirdPartyDataPackRuntimeMountGateResult {
  readonly status: ThirdPartyDataPackRuntimeMountGateStatus
  readonly mountInputStatus: ThirdPartyDataPackMountInputResult['status']
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
  readonly requiredGates: readonly ThirdPartyDataPackRuntimeMountGateRequirement[]
  readonly effects: ThirdPartyDataPackRuntimeMountGateEffectSummary
}

export interface BuildThirdPartyDataPackRuntimeMountGateOptions extends BuildThirdPartyDataPackMountInputOptions {
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly mountInput?: ThirdPartyDataPackMountInputResult
}

const createEffectSummary = (): ThirdPartyDataPackRuntimeMountGateEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  packageFilesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false
})

const freezeEffectSummary = (
  effects: ThirdPartyDataPackRuntimeMountGateEffectSummary
): ThirdPartyDataPackRuntimeMountGateEffectSummary => Object.freeze(effects)

const freezeRuntimeMountGateRequirement = (
  requirement: ThirdPartyDataPackRuntimeMountGateRequirement
): ThirdPartyDataPackRuntimeMountGateRequirement => Object.freeze(requirement)

const freezeRuntimeMountGateRequirements = (
  requirements: readonly ThirdPartyDataPackRuntimeMountGateRequirement[]
): readonly ThirdPartyDataPackRuntimeMountGateRequirement[] =>
  Object.freeze(requirements.map(requirement => freezeRuntimeMountGateRequirement(requirement)))

const runtimeRequirements = (): readonly ThirdPartyDataPackRuntimeMountGateRequirement[] => [
  {
    id: 'runtime-registry-publication',
    status: 'required',
    reason: 'Define the atomic handoff from a verified candidate RegistrySet to the live GameApp registry.'
  },
  {
    id: 'mod-lockfile-write',
    status: 'required',
    reason: 'Define durable mod-lock.json write, validation and rollback semantics before enabling packages.'
  },
  {
    id: 'global-settings-persistence',
    status: 'required',
    reason: 'Define how installation-level enablement and package settings are persisted outside player saves.'
  },
  {
    id: 'save-environment-binding',
    status: 'required',
    reason: 'Define save content-environment protection before any third-party content can affect a save.'
  },
  {
    id: 'lifecycle-transaction-recovery',
    status: 'required',
    reason: 'Define install, upgrade, disable and uninstall transaction recovery before runtime publication.'
  }
]

const cloneOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateOfficialIdentitySummary => ({ ...identity })

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : { ...identity }

const diagnosticCopyFallbackCode = 'LIFECYCLE-TRANSACTION-001'
const diagnosticCopyFallbackStage = 'third-party.runtime-mount.diagnostic-copy'
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

const baseResult = (
  status: ThirdPartyDataPackRuntimeMountGateStatus,
  reason: string,
  mountInput: ThirdPartyDataPackMountInputResult,
  requiredGates: readonly ThirdPartyDataPackRuntimeMountGateRequirement[]
): ThirdPartyDataPackRuntimeMountGateResult => ({
  status,
  mountInputStatus: mountInput.status,
  reason,
  diagnostics: cloneDiagnostics(mountInput.diagnostics),
  selectedPackageIds: [...mountInput.selectedPackageIds],
  blockedPackageIds: [...mountInput.blockedPackageIds],
  blockedCandidatePaths: [...mountInput.blockedCandidatePaths],
  loadOrder: [...mountInput.loadOrder],
  registryCount: mountInput.registryCount,
  entryCount: mountInput.entryCount,
  packageCount: mountInput.packageCount,
  officialIdentity: cloneOfficialIdentity(mountInput.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(mountInput.candidateIdentity),
  lockfileHash: mountInput.lockfileHash,
  runtimePublication: 'deferred',
  requiredGates: freezeRuntimeMountGateRequirements(requiredGates),
  effects: freezeEffectSummary(createEffectSummary())
})

export const buildThirdPartyDataPackRuntimeMountGate = (
  options: BuildThirdPartyDataPackRuntimeMountGateOptions
): ThirdPartyDataPackRuntimeMountGateResult => {
  const mountInput = options.mountInput ?? buildThirdPartyDataPackMountInput(options)

  if (mountInput.status === 'skipped') {
    return baseResult(
      'skipped',
      'no selected third-party data packs',
      mountInput,
      []
    )
  }

  if (mountInput.status === 'blocked') {
    return baseResult(
      'blocked',
      mountInput.reason,
      mountInput,
      []
    )
  }

  return baseResult(
    'deferred',
    'runtime publication is intentionally deferred until write and transaction gates are implemented',
    mountInput,
    runtimeRequirements()
  )
}
