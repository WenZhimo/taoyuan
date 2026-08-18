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
  buildThirdPartyDataPackTransactionPreflight,
  type BuildThirdPartyDataPackTransactionPreflightOptions,
  type ThirdPartyDataPackTransactionPreflightResult
} from './thirdPartyDataPackTransactionPreflight'

export type ThirdPartyDataPackRuntimeAdapterGateStatus = 'deferred' | 'skipped' | 'blocked'

export type ThirdPartyDataPackRuntimeAdapterRequirementId =
  | 'electron-restricted-ipc-source-adapter'
  | 'web-file-picker-indexeddb-adapter'
  | 'shared-core-mount-adapter'
  | 'platform-storage-isolation'

export interface ThirdPartyDataPackRuntimeAdapterRequirement {
  readonly id: ThirdPartyDataPackRuntimeAdapterRequirementId
  readonly status: 'satisfied' | 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackRuntimeAdapterGateEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly electronIpcExposed: false
  readonly webImportPersisted: false
  readonly androidImportPersisted: false
  readonly packageFilesWritten: false
  readonly lockfileWritten: false
  readonly settingsWritten: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
}

export interface ThirdPartyDataPackRuntimeAdapterGateResult {
  readonly status: ThirdPartyDataPackRuntimeAdapterGateStatus
  readonly transactionPreflightStatus: ThirdPartyDataPackTransactionPreflightResult['status']
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
  readonly adapterReadiness: 'platform-sources-defined'
  readonly runtimeEnablementAllowed: false
  readonly requiredAdapters: readonly ThirdPartyDataPackRuntimeAdapterRequirement[]
  readonly effects: ThirdPartyDataPackRuntimeAdapterGateEffectSummary
}

export interface BuildThirdPartyDataPackRuntimeAdapterGateOptions extends BuildThirdPartyDataPackTransactionPreflightOptions {
  readonly discoveryReport: ThirdPartyDataPackDiscoveryReport
  readonly transactionPreflight?: ThirdPartyDataPackTransactionPreflightResult
}

const createEffectSummary = (): ThirdPartyDataPackRuntimeAdapterGateEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  electronIpcExposed: false,
  webImportPersisted: false,
  androidImportPersisted: false,
  packageFilesWritten: false,
  lockfileWritten: false,
  settingsWritten: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false
})

const freezeEffectSummary = (
  effects: ThirdPartyDataPackRuntimeAdapterGateEffectSummary
): ThirdPartyDataPackRuntimeAdapterGateEffectSummary => Object.freeze(effects)

const freezeRuntimeAdapterRequirement = (
  requirement: ThirdPartyDataPackRuntimeAdapterRequirement
): ThirdPartyDataPackRuntimeAdapterRequirement => Object.freeze(requirement)

const runtimeAdapterRequirements = (): readonly ThirdPartyDataPackRuntimeAdapterRequirement[] => Object.freeze([
  freezeRuntimeAdapterRequirement({
    id: 'electron-restricted-ipc-source-adapter',
    status: 'satisfied',
    reason: 'Electron exposes a production read-only mods directory source through restricted IPC without renderer-controlled paths or write operations.'
  }),
  freezeRuntimeAdapterRequirement({
    id: 'web-file-picker-indexeddb-adapter',
    status: 'satisfied',
    reason: 'Web file-picker import sources and IndexedDB payload persistence restore into the shared ContentPackageSource boundary.'
  }),
  freezeRuntimeAdapterRequirement({
    id: 'shared-core-mount-adapter',
    status: 'required',
    reason: 'Define the shared runtime handoff that passes verified platform package sources into publication without exposing partial RegistrySet state.'
  }),
  freezeRuntimeAdapterRequirement({
    id: 'platform-storage-isolation',
    status: 'required',
    reason: 'Define final platform storage isolation for runtime publication, package settings, mod-lock, save and cache writes before enablement.'
  })
])

const cloneOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateOfficialIdentitySummary => ({ ...identity })

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : { ...identity }

const diagnosticCopyFallbackCode = 'LIFECYCLE-TRANSACTION-001'
const diagnosticCopyFallbackStage = 'third-party.runtime-adapter.diagnostic-copy'
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
  cloneStringList(value) as PackageId[]

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

const freezeRuntimeAdapterGateResult = (
  result: ThirdPartyDataPackRuntimeAdapterGateResult
): ThirdPartyDataPackRuntimeAdapterGateResult => deepFreezeObjectGraph(result)

const baseResult = (
  status: ThirdPartyDataPackRuntimeAdapterGateStatus,
  reason: string,
  transactionPreflight: ThirdPartyDataPackTransactionPreflightResult,
  requiredAdapters: readonly ThirdPartyDataPackRuntimeAdapterRequirement[]
): ThirdPartyDataPackRuntimeAdapterGateResult => freezeRuntimeAdapterGateResult({
  status,
  transactionPreflightStatus: transactionPreflight.status,
  reason,
  diagnostics: cloneDiagnostics(transactionPreflight.diagnostics),
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
  adapterReadiness: 'platform-sources-defined',
  runtimeEnablementAllowed: false,
  requiredAdapters,
  effects: freezeEffectSummary(createEffectSummary())
})

export const buildThirdPartyDataPackRuntimeAdapterGate = (
  options: BuildThirdPartyDataPackRuntimeAdapterGateOptions
): ThirdPartyDataPackRuntimeAdapterGateResult => {
  const transactionPreflight = options.transactionPreflight ?? buildThirdPartyDataPackTransactionPreflight(options)

  if (transactionPreflight.status === 'skipped') {
    return baseResult(
      'skipped',
      'no selected third-party data packs',
      transactionPreflight,
      []
    )
  }

  if (transactionPreflight.status === 'blocked') {
    return baseResult(
      'blocked',
      transactionPreflight.reason,
      transactionPreflight,
      []
    )
  }

  return baseResult(
    'deferred',
    'Web/Electron platform source adapters are defined; runtime enablement remains deferred until publication, transaction and write boundaries are implemented',
    transactionPreflight,
    runtimeAdapterRequirements()
  )
}
