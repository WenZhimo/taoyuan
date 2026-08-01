import type { JsonValue } from './canonicalJson'
import type { ModDiagnostic } from './diagnostics'
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
  | 'android-file-picker-app-data-adapter'
  | 'shared-core-mount-adapter'
  | 'platform-storage-isolation'

export interface ThirdPartyDataPackRuntimeAdapterRequirement {
  readonly id: ThirdPartyDataPackRuntimeAdapterRequirementId
  readonly status: 'required'
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
  readonly adapterReadiness: 'deferred'
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
    status: 'required',
    reason: 'Define the Electron main-process discovery and read bridge through restricted IPC before desktop packages can be mounted.'
  }),
  freezeRuntimeAdapterRequirement({
    id: 'web-file-picker-indexeddb-adapter',
    status: 'required',
    reason: 'Define the Web file picker import and IndexedDB persistence adapter before browser packages can be mounted.'
  }),
  freezeRuntimeAdapterRequirement({
    id: 'android-file-picker-app-data-adapter',
    status: 'required',
    reason: 'Define the Android system picker and app-data import adapter before APK packages can be mounted.'
  }),
  freezeRuntimeAdapterRequirement({
    id: 'shared-core-mount-adapter',
    status: 'required',
    reason: 'Define the shared adapter boundary that passes platform package sources into the same parse, repair, validate and register core.'
  }),
  freezeRuntimeAdapterRequirement({
    id: 'platform-storage-isolation',
    status: 'required',
    reason: 'Define platform storage boundaries so package sources, cache, settings and player saves remain isolated before runtime enablement.'
  })
])

const cloneOfficialIdentity = (
  identity: ThirdPartyCandidateOfficialIdentitySummary
): ThirdPartyCandidateOfficialIdentitySummary => ({ ...identity })

const cloneCandidateIdentity = (
  identity: ThirdPartyCandidateIdentitySummary | undefined
): ThirdPartyCandidateIdentitySummary | undefined => identity === undefined ? undefined : { ...identity }

const cloneJsonValue = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) return value.map(item => cloneJsonValue(item))
  if (value !== null && typeof value === 'object') {
    const result: Record<string, JsonValue> = {}
    for (const [key, entryValue] of Object.entries(value)) result[key] = cloneJsonValue(entryValue)
    return result
  }
  return value
}

const cloneDiagnosticDetails = (
  details: ModDiagnostic['details']
): ModDiagnostic['details'] => {
  if (details === undefined) return undefined
  const result: Record<string, JsonValue> = {}
  for (const [key, value] of Object.entries(details)) result[key] = cloneJsonValue(value)
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
  relatedPackageIds: diagnostic.relatedPackageIds ? [...diagnostic.relatedPackageIds] : undefined,
  details: cloneDiagnosticDetails(diagnostic.details),
  recovery: diagnostic.recovery
})

const cloneDiagnostics = (diagnostics: readonly ModDiagnostic[]): ModDiagnostic[] =>
  diagnostics.map(diagnostic => cloneDiagnostic(diagnostic))

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) deepFreezeObjectGraph(child)
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
  selectedPackageIds: [...transactionPreflight.selectedPackageIds],
  blockedPackageIds: [...transactionPreflight.blockedPackageIds],
  blockedCandidatePaths: [...transactionPreflight.blockedCandidatePaths],
  loadOrder: [...transactionPreflight.loadOrder],
  registryCount: transactionPreflight.registryCount,
  entryCount: transactionPreflight.entryCount,
  packageCount: transactionPreflight.packageCount,
  officialIdentity: cloneOfficialIdentity(transactionPreflight.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(transactionPreflight.candidateIdentity),
  lockfileHash: transactionPreflight.lockfileHash,
  adapterReadiness: 'deferred',
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
    'runtime platform adapters are intentionally deferred until desktop, web and android source boundaries are implemented',
    transactionPreflight,
    runtimeAdapterRequirements()
  )
}
