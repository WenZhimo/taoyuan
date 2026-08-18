import type { ModDiagnostic, ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type {
  ThirdPartyCandidateIdentitySummary,
  ThirdPartyCandidateOfficialIdentitySummary
} from './thirdPartyCandidateRegistrySnapshot'
import type {
  ThirdPartyDataPackModManagementUiIpcPreflightEffectSummary,
  ThirdPartyDataPackModManagementUiIpcPreflightResult,
  ThirdPartyDataPackModManagementUiIpcRequirementId,
  ThirdPartyDataPackModManagementUiIpcStageId
} from './thirdPartyDataPackModManagementUiIpcPreflight'

export type ThirdPartyDataPackModManagementReadModelStatus =
  | 'ready'
  | 'empty'
  | 'blocked'
export type ThirdPartyDataPackModManagementPackageRowStatus =
  | 'selected'
  | 'blocked'
export type ThirdPartyDataPackModManagementCommandId =
  | 'install'
  | 'enable'
  | 'disable'
  | 'upgrade'
  | 'uninstall'

export interface ThirdPartyDataPackModManagementSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackModManagementPackageRow {
  readonly packageId: PackageId
  readonly status: ThirdPartyDataPackModManagementPackageRowStatus
  readonly loadOrderIndex?: number
  readonly reason: string
}

export interface ThirdPartyDataPackModManagementStageRow {
  readonly id: ThirdPartyDataPackModManagementUiIpcStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackModManagementUiIpcRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackModManagementRequirementRow {
  readonly id: ThirdPartyDataPackModManagementUiIpcRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackModManagementCommandState {
  readonly id: ThirdPartyDataPackModManagementCommandId
  readonly status: 'disabled'
  readonly requiresExplicitConfirmation: true
  readonly reason: string
}

export interface ThirdPartyDataPackModManagementReadModelSummary {
  readonly officialRegistryCount: number
  readonly officialEntryCount: number
  readonly candidateRegistryCount: number
  readonly candidateEntryCount: number
  readonly packageCount: number
  readonly selectedPackageCount: number
  readonly blockedPackageCount: number
  readonly blockedCandidateCount: number
  readonly loadOrderCount: number
}

export interface ThirdPartyDataPackModManagementReadModelIdentity {
  readonly official: ThirdPartyCandidateOfficialIdentitySummary
  readonly candidate?: ThirdPartyCandidateIdentitySummary
  readonly lockfileHash?: Sha256Hash
}

export interface ThirdPartyDataPackModManagementReadModel {
  readonly status: ThirdPartyDataPackModManagementReadModelStatus
  readonly reason: string
  readonly sourcePreflightStatus: ThirdPartyDataPackModManagementUiIpcPreflightResult['status']
  readonly readModelKind: 'third-party-data-pack-mod-management-read-model'
  readonly readOnly: true
  readonly readModelAvailable: boolean
  readonly uiMountAllowed: false
  readonly ipcAllowed: false
  readonly commandDispatchAllowed: false
  readonly writeAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly summary: ThirdPartyDataPackModManagementReadModelSummary
  readonly identity: ThirdPartyDataPackModManagementReadModelIdentity
  readonly packageRows: readonly ThirdPartyDataPackModManagementPackageRow[]
  readonly diagnostics: readonly ThirdPartyDataPackModManagementSafeDiagnostic[]
  readonly stageRows: readonly ThirdPartyDataPackModManagementStageRow[]
  readonly requirementRows: readonly ThirdPartyDataPackModManagementRequirementRow[]
  readonly commandStates: readonly ThirdPartyDataPackModManagementCommandState[]
  readonly effects: ThirdPartyDataPackModManagementUiIpcPreflightEffectSummary
}

export interface BuildThirdPartyDataPackModManagementReadModelOptions {
  readonly preflight: ThirdPartyDataPackModManagementUiIpcPreflightResult
}

const commandIds: readonly ThirdPartyDataPackModManagementCommandId[] = Object.freeze([
  'install',
  'enable',
  'disable',
  'upgrade',
  'uninstall'
])

const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnosticRecovery>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

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

const readOwnDataField = (
  value: object,
  fieldName: string
): unknown => {
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (
  value: object,
  fieldName: string
): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const safeDiagnostic = (diagnostic: ModDiagnostic): ThirdPartyDataPackModManagementSafeDiagnostic => {
  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readOwnStringField(diagnostic, 'stage') ?? 'third-party.mod-management-read-model.diagnostic-copy',
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? `mods.error.${code.toLowerCase().replace(/-/g, '.')}`,
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined,
    recovery: diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)
      ? recovery as ModDiagnosticRecovery
      : 'none'
  })
}

const safeDiagnostics = (
  diagnostics: readonly ModDiagnostic[]
): readonly ThirdPartyDataPackModManagementSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackModManagementSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor && descriptor.value !== null) {
      result.push(safeDiagnostic(descriptor.value as ModDiagnostic))
    }
  }
  return Object.freeze(result)
}

const cloneRequirementIds = (
  value: unknown
): ThirdPartyDataPackModManagementUiIpcRequirementId[] =>
  cloneStringList(value) as ThirdPartyDataPackModManagementUiIpcRequirementId[]

const stageRows = (
  preflight: ThirdPartyDataPackModManagementUiIpcPreflightResult
): readonly ThirdPartyDataPackModManagementStageRow[] => {
  const result: ThirdPartyDataPackModManagementStageRow[] = []
  const stages = preflight.uiIpcStages
  const length = readArrayLength(stages)
  if (length === undefined) return Object.freeze([])

  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(stages, String(index))
    } catch {
      continue
    }
    const value = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (value === undefined || value === null || typeof value !== 'object') continue
    const id = readOwnStringField(value, 'id')
    const status = readOwnStringField(value, 'status')
    const reason = readOwnStringField(value, 'reason')
    if (
      id === undefined
      || !['satisfied', 'deferred', 'skipped', 'blocked'].includes(status ?? '')
      || reason === undefined
    ) {
      continue
    }
    result.push(Object.freeze({
      id: id as ThirdPartyDataPackModManagementUiIpcStageId,
      status: status as ThirdPartyDataPackModManagementStageRow['status'],
      requirementIds: Object.freeze(cloneRequirementIds(readOwnDataField(value, 'requirementIds'))),
      reason
    }))
  }

  return Object.freeze(result)
}

const requirementRows = (
  preflight: ThirdPartyDataPackModManagementUiIpcPreflightResult
): readonly ThirdPartyDataPackModManagementRequirementRow[] => {
  const result: ThirdPartyDataPackModManagementRequirementRow[] = []
  const requirements = preflight.requiredUiIpcAdapters
  const length = readArrayLength(requirements)
  if (length === undefined) return Object.freeze([])

  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(requirements, String(index))
    } catch {
      continue
    }
    const value = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (value === undefined || value === null || typeof value !== 'object') continue
    const id = readOwnStringField(value, 'id')
    const reason = readOwnStringField(value, 'reason')
    if (id === undefined || reason === undefined) continue
    result.push(Object.freeze({
      id: id as ThirdPartyDataPackModManagementUiIpcRequirementId,
      status: 'required' as const,
      reason
    }))
  }

  return Object.freeze(result)
}

const packageRows = (
  preflight: ThirdPartyDataPackModManagementUiIpcPreflightResult
): readonly ThirdPartyDataPackModManagementPackageRow[] => {
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  const loadOrder = clonePackageIds(preflight.loadOrder)
  const blockedPackageIds = clonePackageIds(preflight.blockedPackageIds)
  const result: ThirdPartyDataPackModManagementPackageRow[] = []

  for (const packageId of loadOrder) {
    result.push(Object.freeze({
      packageId,
      status: 'selected' as const,
      loadOrderIndex: result.length,
      reason: 'Package is selected in the current preflight load order.'
    }))
  }

  for (const packageId of selectedPackageIds) {
    if (loadOrder.includes(packageId)) continue
    result.push(Object.freeze({
      packageId,
      status: 'selected' as const,
      reason: 'Package is selected but no load order index is available yet.'
    }))
  }

  for (const packageId of blockedPackageIds) {
    result.push(Object.freeze({
      packageId,
      status: 'blocked' as const,
      reason: 'Package is blocked by the current UI/IPC preflight inputs.'
    }))
  }

  return Object.freeze(result)
}

const readModelStatus = (
  preflight: ThirdPartyDataPackModManagementUiIpcPreflightResult
): ThirdPartyDataPackModManagementReadModelStatus => {
  if (preflight.status === 'skipped') return 'empty'
  if (preflight.status === 'blocked') return 'blocked'
  return 'ready'
}

const readModelReason = (
  status: ThirdPartyDataPackModManagementReadModelStatus,
  preflight: ThirdPartyDataPackModManagementUiIpcPreflightResult
): string => {
  if (status === 'empty') return 'No selected third-party data packs are available for the management read model.'
  if (status === 'blocked') return preflight.reason
  return 'Read-only mod management model is ready for future UI rendering; command dispatch, IPC and writes remain disabled.'
}

const commandReason = (
  status: ThirdPartyDataPackModManagementReadModelStatus,
  preflight: ThirdPartyDataPackModManagementUiIpcPreflightResult
): string => {
  if (status === 'blocked') return preflight.reason
  if (status === 'empty') return 'No selected third-party data packs are available for commands.'
  return 'Commands are disabled until explicit confirmation, transaction command dispatch and persistent write boundaries are wired.'
}

const commandStates = (
  status: ThirdPartyDataPackModManagementReadModelStatus,
  preflight: ThirdPartyDataPackModManagementUiIpcPreflightResult
): readonly ThirdPartyDataPackModManagementCommandState[] => Object.freeze(commandIds.map(id => Object.freeze({
  id,
  status: 'disabled' as const,
  requiresExplicitConfirmation: true as const,
  reason: commandReason(status, preflight)
})))

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

export const buildThirdPartyDataPackModManagementReadModel = (
  options: BuildThirdPartyDataPackModManagementReadModelOptions
): ThirdPartyDataPackModManagementReadModel => {
  const preflight = options.preflight
  const selectedPackageIds = clonePackageIds(preflight.selectedPackageIds)
  const blockedPackageIds = clonePackageIds(preflight.blockedPackageIds)
  const blockedCandidatePaths = cloneStringList(preflight.blockedCandidatePaths)
  const loadOrder = clonePackageIds(preflight.loadOrder)
  const status = readModelStatus(preflight)

  return deepFreezeObjectGraph({
    status,
    reason: readModelReason(status, preflight),
    sourcePreflightStatus: preflight.status,
    readModelKind: 'third-party-data-pack-mod-management-read-model',
    readOnly: true,
    readModelAvailable: status !== 'blocked',
    uiMountAllowed: false,
    ipcAllowed: false,
    commandDispatchAllowed: false,
    writeAllowed: false,
    runtimeEnablementAllowed: false,
    summary: {
      officialRegistryCount: preflight.officialIdentity.registryCount,
      officialEntryCount: preflight.officialIdentity.entryCount,
      candidateRegistryCount: preflight.registryCount,
      candidateEntryCount: preflight.entryCount,
      packageCount: preflight.packageCount,
      selectedPackageCount: selectedPackageIds.length,
      blockedPackageCount: blockedPackageIds.length,
      blockedCandidateCount: blockedCandidatePaths.length,
      loadOrderCount: loadOrder.length
    },
    identity: {
      official: cloneOfficialIdentity(preflight.officialIdentity),
      candidate: cloneCandidateIdentity(preflight.candidateIdentity),
      lockfileHash: preflight.lockfileHash
    },
    packageRows: packageRows(preflight),
    diagnostics: safeDiagnostics(preflight.diagnostics),
    stageRows: stageRows(preflight),
    requirementRows: requirementRows(preflight),
    commandStates: commandStates(status, preflight),
    effects: createEffectSummary()
  })
}
