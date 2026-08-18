import type { JsonValue } from './canonicalJson'
import { createDiagnostic, type ModDiagnostic, type ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackModLockWriteProbeResult
} from './thirdPartyDataPackModLockWriteProbe'
import type {
  ThirdPartyDataPackTransactionLogWriteProbeResult
} from './thirdPartyDataPackTransactionLogWriteProbe'

export type ThirdPartyDataPackModManagementUiIpcPreflightStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'
export type ThirdPartyDataPackModManagementUiIpcPreflightCheckId =
  | 'mod-lock-write-probe-boundary-known'
  | 'transaction-log-write-probe-boundary-known'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'package-summary-consistent'
  | 'isolated-write-effects-contained'
  | 'no-ui-ipc-effects-intact'
export type ThirdPartyDataPackModManagementUiIpcStageId =
  | 'ui-ipc-preflight-inspection'
  | 'mod-management-read-model'
  | 'explicit-user-confirmation'
  | 'electron-ipc-contract'
  | 'web-import-ui-bridge'
  | 'android-import-ui-bridge'
  | 'transaction-command-dispatch'
  | 'ui-diagnostics-finalization'
export type ThirdPartyDataPackModManagementUiIpcRequirementId =
  | 'read-only-mod-management-view-model'
  | 'explicit-user-confirmation-gate'
  | 'electron-preload-ipc-contract'
  | 'web-file-picker-ui-bridge'
  | 'android-native-import-ui-bridge'
  | 'transaction-command-dispatcher'
  | 'path-free-ui-diagnostics'
  | 'no-startup-auto-enable-guard'

export interface ThirdPartyDataPackModManagementUiIpcPreflightCheck {
  readonly id: ThirdPartyDataPackModManagementUiIpcPreflightCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackModManagementUiIpcStage {
  readonly id: ThirdPartyDataPackModManagementUiIpcStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackModManagementUiIpcRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackModManagementUiIpcRequirement {
  readonly id: ThirdPartyDataPackModManagementUiIpcRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackModManagementUiIpcPreflightEffectSummary {
  readonly officialRegistryPublished: false
  readonly thirdPartyRegistryPublished: false
  readonly liveRegistryMutated: false
  readonly liveRegistrySwapped: false
  readonly previousRegistryRestored: false
  readonly candidateRegistryExposed: false
  readonly runtimeEnablementAllowed: false
  readonly modManagementUiMounted: false
  readonly electronIpcExposed: false
  readonly webFilePickerOpened: false
  readonly androidFilePickerOpened: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: false
  readonly lockfileWritten: false
  readonly lockfileRestored: false
  readonly settingsWritten: false
  readonly settingsRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackModManagementUiIpcPreflightResult {
  readonly status: ThirdPartyDataPackModManagementUiIpcPreflightStatus
  readonly modLockWriteProbeStatus: ThirdPartyDataPackModLockWriteProbeResult['status']
  readonly transactionLogWriteProbeStatus: ThirdPartyDataPackTransactionLogWriteProbeResult['status']
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
  readonly modManagementUiIpcPreflight: 'deferred'
  readonly uiAllowed: false
  readonly ipcAllowed: false
  readonly commandDispatchAllowed: false
  readonly writeAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly uiIpcChecks: readonly ThirdPartyDataPackModManagementUiIpcPreflightCheck[]
  readonly uiIpcStages: readonly ThirdPartyDataPackModManagementUiIpcStage[]
  readonly requiredUiIpcAdapters: readonly ThirdPartyDataPackModManagementUiIpcRequirement[]
  readonly effects: ThirdPartyDataPackModManagementUiIpcPreflightEffectSummary
}

export interface BuildThirdPartyDataPackModManagementUiIpcPreflightOptions {
  readonly modLockWriteProbe: ThirdPartyDataPackModLockWriteProbeResult
  readonly transactionLogWriteProbe: ThirdPartyDataPackTransactionLogWriteProbeResult
}

const createEffectSummary = (): ThirdPartyDataPackModManagementUiIpcPreflightEffectSummary => ({
  officialRegistryPublished: false,
  thirdPartyRegistryPublished: false,
  liveRegistryMutated: false,
  liveRegistrySwapped: false,
  previousRegistryRestored: false,
  candidateRegistryExposed: false,
  runtimeEnablementAllowed: false,
  modManagementUiMounted: false,
  electronIpcExposed: false,
  webFilePickerOpened: false,
  androidFilePickerOpened: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: false,
  lockfileRestored: false,
  settingsWritten: false,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
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
const diagnosticCopyFallbackStage = 'third-party.mod-management-ui-ipc-preflight.diagnostic-copy'
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
  id: ThirdPartyDataPackModManagementUiIpcPreflightCheckId,
  status: ThirdPartyDataPackModManagementUiIpcPreflightCheck['status'],
  reason: string
): ThirdPartyDataPackModManagementUiIpcPreflightCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackModManagementUiIpcPreflightCheck[] => Object.freeze([
  'mod-lock-write-probe-boundary-known',
  'transaction-log-write-probe-boundary-known',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'package-summary-consistent',
  'isolated-write-effects-contained',
  'no-ui-ipc-effects-intact'
].map(id => check(id as ThirdPartyDataPackModManagementUiIpcPreflightCheckId, 'skipped', reason)))

const probeBoundaryKnown = (
  status: ThirdPartyDataPackModLockWriteProbeResult['status']
    | ThirdPartyDataPackTransactionLogWriteProbeResult['status']
): boolean => status === 'deferred' || status === 'written'

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const candidateIdentitiesMatch = (
  left: ThirdPartyCandidateIdentitySummary | undefined,
  right: ThirdPartyCandidateIdentitySummary | undefined
): boolean => left !== undefined
  && right !== undefined
  && left.formatVersion === right.formatVersion
  && left.contentHash === right.contentHash
  && left.snapshotHash === right.snapshotHash
  && left.candidateHash === right.candidateHash

const packageSummariesMatch = (
  modLock: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLog: ThirdPartyDataPackTransactionLogWriteProbeResult
): boolean => arraysEqual(clonePackageIds(modLock.selectedPackageIds), clonePackageIds(transactionLog.selectedPackageIds))
  && arraysEqual(clonePackageIds(modLock.blockedPackageIds), clonePackageIds(transactionLog.blockedPackageIds))
  && arraysEqual(cloneStringList(modLock.blockedCandidatePaths), cloneStringList(transactionLog.blockedCandidatePaths))
  && arraysEqual(clonePackageIds(modLock.loadOrder), clonePackageIds(transactionLog.loadOrder))
  && modLock.registryCount === transactionLog.registryCount
  && modLock.entryCount === transactionLog.entryCount
  && modLock.packageCount === transactionLog.packageCount

const effectsContained = (
  effects: object,
  allowedTrueKey: string
): boolean => Object.entries(effects).every(([key, value]) =>
  value === false || (key === allowedTrueKey && value === true)
)

const writeEffectsContained = (
  modLock: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLog: ThirdPartyDataPackTransactionLogWriteProbeResult
): boolean => effectsContained(modLock.effects, 'lockfileWritten')
  && effectsContained(transactionLog.effects, 'transactionLogWritten')

const noUiIpcEffects = (
  modLock: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLog: ThirdPartyDataPackTransactionLogWriteProbeResult
): boolean => modLock.effects.electronIpcExposed === false
  && transactionLog.effects.electronIpcExposed === false
  && modLock.effects.runtimeEnablementAllowed === false
  && transactionLog.effects.runtimeEnablementAllowed === false
  && modLock.effects.officialRegistryPublished === false
  && transactionLog.effects.officialRegistryPublished === false
  && modLock.effects.thirdPartyRegistryPublished === false
  && transactionLog.effects.thirdPartyRegistryPublished === false
  && modLock.effects.candidateRegistryExposed === false
  && transactionLog.effects.candidateRegistryExposed === false

const buildUiIpcChecks = (
  modLock: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLog: ThirdPartyDataPackTransactionLogWriteProbeResult
): readonly ThirdPartyDataPackModManagementUiIpcPreflightCheck[] => Object.freeze([
  check(
    'mod-lock-write-probe-boundary-known',
    probeBoundaryKnown(modLock.status) ? 'satisfied' : 'blocked',
    'The mod-lock write boundary must be represented by a deferred or explicitly isolated probe before UI/IPC can be exposed.'
  ),
  check(
    'transaction-log-write-probe-boundary-known',
    probeBoundaryKnown(transactionLog.status) ? 'satisfied' : 'blocked',
    'The transaction-log write boundary must be represented by a deferred or explicitly isolated probe before UI/IPC can be exposed.'
  ),
  check(
    'candidate-identity-consistent',
    candidateIdentitiesMatch(modLock.candidateIdentity, transactionLog.candidateIdentity)
      ? 'satisfied'
      : 'blocked',
    'The mod-lock and transaction-log probes must describe the same candidate identity.'
  ),
  check(
    'lockfile-hash-consistent',
    modLock.lockfileHash !== undefined
      && modLock.lockfileHash === transactionLog.lockfileHash
      ? 'satisfied'
      : 'blocked',
    'The mod-lock and transaction-log probes must describe the same lockfile hash.'
  ),
  check(
    'package-summary-consistent',
    packageSummariesMatch(modLock, transactionLog) ? 'satisfied' : 'blocked',
    'The selected package ids, blocked packages, load order and registry totals must match across write probes.'
  ),
  check(
    'isolated-write-effects-contained',
    writeEffectsContained(modLock, transactionLog) ? 'satisfied' : 'blocked',
    'Upstream write probes may only mark their own isolated probe write and must leave every other storage/runtime effect false.'
  ),
  check(
    'no-ui-ipc-effects-intact',
    noUiIpcEffects(modLock, transactionLog) ? 'satisfied' : 'blocked',
    'No upstream probe may expose IPC, enable runtime publication or expose candidate registries before the UI/IPC preflight.'
  )
])

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackModManagementUiIpcPreflightCheck[]
): readonly ModDiagnostic[] => checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => createDiagnostic('LIFECYCLE-TRANSACTION-001', {
    stage: 'third-party.mod-management-ui-ipc-preflight.checks',
    severity: 'error',
    fieldPath: `/uiIpcChecks/${currentCheck.id}`,
    details: {
      reason: currentCheck.reason
    },
    recovery: 'retry'
  }))

const requirement = (
  id: ThirdPartyDataPackModManagementUiIpcRequirementId,
  reason: string
): ThirdPartyDataPackModManagementUiIpcRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const requiredUiIpcAdapters = (): readonly ThirdPartyDataPackModManagementUiIpcRequirement[] =>
  Object.freeze([
    requirement(
      'read-only-mod-management-view-model',
      'The management surface must render package, lockfile and transaction summaries without exposing candidate RegistrySet internals.'
    ),
    requirement(
      'explicit-user-confirmation-gate',
      'Every enable, disable, install, upgrade or uninstall command must pass through a user confirmation boundary.'
    ),
    requirement(
      'electron-preload-ipc-contract',
      'Electron must expose only fixed preload methods with path-free request and response payloads.'
    ),
    requirement(
      'web-file-picker-ui-bridge',
      'Web import UI must continue to use explicit file selection and optional IndexedDB persistence before runtime publication.'
    ),
    requirement(
      'android-native-import-ui-bridge',
      'Android import UI must call the native picker/app-data bridge without leaking SAF or private absolute paths.'
    ),
    requirement(
      'transaction-command-dispatcher',
      'UI commands must dispatch into the transaction preflight/commit boundary instead of directly writing package, lockfile or settings files.'
    ),
    requirement(
      'path-free-ui-diagnostics',
      'Visible diagnostics must stay redacted and avoid host paths, candidate internals and private package contents.'
    ),
    requirement(
      'no-startup-auto-enable-guard',
      'Startup must not silently enable third-party packages just because UI/IPC code exists.'
    )
  ])

const stage = (
  id: ThirdPartyDataPackModManagementUiIpcStageId,
  status: ThirdPartyDataPackModManagementUiIpcStage['status'],
  requirementIds: readonly ThirdPartyDataPackModManagementUiIpcRequirementId[],
  reason: string
): ThirdPartyDataPackModManagementUiIpcStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackModManagementUiIpcStage[] => Object.freeze([
  stage(
    'ui-ipc-preflight-inspection',
    'satisfied',
    [],
    'Mod-lock and transaction-log write probe summaries are consistent enough to inspect UI/IPC requirements.'
  ),
  stage(
    'mod-management-read-model',
    'deferred',
    ['read-only-mod-management-view-model', 'no-startup-auto-enable-guard'],
    'Build a read-only management view model before wiring any visible mod management surface.'
  ),
  stage(
    'explicit-user-confirmation',
    'deferred',
    ['explicit-user-confirmation-gate'],
    'Require a deliberate user action before any third-party package state transition can dispatch.'
  ),
  stage(
    'electron-ipc-contract',
    'deferred',
    ['electron-preload-ipc-contract'],
    'Define fixed Electron preload IPC methods without allowing renderer-provided filesystem paths.'
  ),
  stage(
    'web-import-ui-bridge',
    'deferred',
    ['web-file-picker-ui-bridge'],
    'Keep Web import explicit and pre-runtime until the transaction path is ready.'
  ),
  stage(
    'android-import-ui-bridge',
    'deferred',
    ['android-native-import-ui-bridge'],
    'Route Android imports through the native bridge while preserving app-private path redaction.'
  ),
  stage(
    'transaction-command-dispatch',
    'deferred',
    ['transaction-command-dispatcher'],
    'UI commands must enter transaction preflight/commit orchestration rather than direct writes.'
  ),
  stage(
    'ui-diagnostics-finalization',
    'deferred',
    ['path-free-ui-diagnostics'],
    'Finalize only redacted diagnostics for display and IPC responses.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackModManagementUiIpcStage[] => Object.freeze([
  'ui-ipc-preflight-inspection',
  'mod-management-read-model',
  'explicit-user-confirmation',
  'electron-ipc-contract',
  'web-import-ui-bridge',
  'android-import-ui-bridge',
  'transaction-command-dispatch',
  'ui-diagnostics-finalization'
].map(id => stage(id as ThirdPartyDataPackModManagementUiIpcStageId, status, [], reason)))

const freezeResult = (
  result: ThirdPartyDataPackModManagementUiIpcPreflightResult
): ThirdPartyDataPackModManagementUiIpcPreflightResult => deepFreezeObjectGraph(result)

const baseResult = (
  status: ThirdPartyDataPackModManagementUiIpcPreflightStatus,
  reason: string,
  modLock: ThirdPartyDataPackModLockWriteProbeResult,
  transactionLog: ThirdPartyDataPackTransactionLogWriteProbeResult,
  uiIpcChecks: readonly ThirdPartyDataPackModManagementUiIpcPreflightCheck[],
  diagnostics: readonly ModDiagnostic[],
  uiIpcStages: readonly ThirdPartyDataPackModManagementUiIpcStage[],
  includeRequiredAdapters: boolean
): ThirdPartyDataPackModManagementUiIpcPreflightResult => freezeResult({
  status,
  modLockWriteProbeStatus: modLock.status,
  transactionLogWriteProbeStatus: transactionLog.status,
  reason,
  diagnostics: cloneDiagnostics(diagnostics),
  selectedPackageIds: clonePackageIds(modLock.selectedPackageIds),
  blockedPackageIds: clonePackageIds(modLock.blockedPackageIds),
  blockedCandidatePaths: cloneStringList(modLock.blockedCandidatePaths),
  loadOrder: clonePackageIds(modLock.loadOrder),
  registryCount: modLock.registryCount,
  entryCount: modLock.entryCount,
  packageCount: modLock.packageCount,
  officialIdentity: cloneOfficialIdentity(modLock.officialIdentity),
  candidateIdentity: cloneCandidateIdentity(modLock.candidateIdentity),
  lockfileHash: modLock.lockfileHash,
  modManagementUiIpcPreflight: 'deferred',
  uiAllowed: false,
  ipcAllowed: false,
  commandDispatchAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiIpcChecks,
  uiIpcStages,
  requiredUiIpcAdapters: includeRequiredAdapters ? requiredUiIpcAdapters() : Object.freeze([]),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackModManagementUiIpcPreflight = (
  options: BuildThirdPartyDataPackModManagementUiIpcPreflightOptions
): ThirdPartyDataPackModManagementUiIpcPreflightResult => {
  const modLockWriteProbe = options.modLockWriteProbe
  const transactionLogWriteProbe = options.transactionLogWriteProbe

  if (
    modLockWriteProbe.status === 'skipped'
    || transactionLogWriteProbe.status === 'skipped'
  ) {
    const reason = 'no selected third-party data packs'
    return baseResult(
      'skipped',
      reason,
      modLockWriteProbe,
      transactionLogWriteProbe,
      skippedChecks(reason),
      [],
      terminalStages('skipped', reason),
      false
    )
  }

  if (
    modLockWriteProbe.status === 'blocked'
    || modLockWriteProbe.status === 'failed'
    || transactionLogWriteProbe.status === 'blocked'
    || transactionLogWriteProbe.status === 'failed'
  ) {
    const reason = modLockWriteProbe.status === 'blocked' || modLockWriteProbe.status === 'failed'
      ? modLockWriteProbe.reason
      : transactionLogWriteProbe.reason
    return baseResult(
      'blocked',
      reason,
      modLockWriteProbe,
      transactionLogWriteProbe,
      skippedChecks(reason),
      [
        ...cloneDiagnostics(modLockWriteProbe.diagnostics),
        ...cloneDiagnostics(transactionLogWriteProbe.diagnostics)
      ],
      terminalStages('blocked', reason),
      false
    )
  }

  const uiIpcChecks = buildUiIpcChecks(modLockWriteProbe, transactionLogWriteProbe)
  const blockedDiagnostics = diagnosticsForBlockedChecks(uiIpcChecks)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'mod management UI/IPC preflight inputs are inconsistent',
      modLockWriteProbe,
      transactionLogWriteProbe,
      uiIpcChecks,
      [
        ...cloneDiagnostics(modLockWriteProbe.diagnostics),
        ...cloneDiagnostics(transactionLogWriteProbe.diagnostics),
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'mod management UI/IPC preflight inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'mod management UI/IPC preflight is inspect-only until read model, user confirmation, fixed IPC contracts and transaction command dispatch exist',
    modLockWriteProbe,
    transactionLogWriteProbe,
    uiIpcChecks,
    [
      ...cloneDiagnostics(modLockWriteProbe.diagnostics),
      ...cloneDiagnostics(transactionLogWriteProbe.diagnostics)
    ],
    deferredStages(),
    true
  )
}
