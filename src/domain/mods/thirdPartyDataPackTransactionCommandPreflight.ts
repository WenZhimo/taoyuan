import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { PackageId } from './ids'
import type {
  ThirdPartyDataPackModManagementCommandId,
  ThirdPartyDataPackModManagementReadModel
} from './thirdPartyDataPackModManagementReadModel'
import type {
  ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId,
  ThirdPartyDataPackRuntimePublicationCommitAdapterResult
} from './thirdPartyDataPackRuntimePublicationCommitAdapter'

export type ThirdPartyDataPackTransactionCommandPreflightStatus =
  | 'deferred'
  | 'skipped'
  | 'blocked'
export type ThirdPartyDataPackTransactionCommandPreflightCheckId =
  | 'read-model-ready'
  | 'runtime-commit-adapter-deferred'
  | 'candidate-identity-consistent'
  | 'lockfile-hash-consistent'
  | 'requested-command-known'
  | 'target-package-known'
  | 'read-model-command-still-disabled'
  | 'explicit-confirmation-captured'
  | 'no-command-effects-intact'
export type ThirdPartyDataPackTransactionCommandPreflightStageId =
  | 'command-preflight-inspection'
  | 'explicit-user-confirmation'
  | 'transaction-command-dispatcher'
  | 'runtime-commit-handoff'
  | 'post-command-diagnostics'
export type ThirdPartyDataPackTransactionCommandPreflightRequirementId =
  | 'explicit-command-request'
  | 'explicit-confirmation-token'
  | 'transaction-command-dispatcher'
  | 'atomic-runtime-publication-commit-adapter'
  | 'rollback-recovery-handoff'
  | 'path-free-command-diagnostics'

export interface ThirdPartyDataPackTransactionCommandConfirmation {
  readonly commandId: ThirdPartyDataPackModManagementCommandId
  readonly confirmed: boolean
  readonly packageId?: PackageId
}

export interface ThirdPartyDataPackTransactionCommandRequest {
  readonly commandId: ThirdPartyDataPackModManagementCommandId
  readonly packageId?: PackageId
  readonly confirmation?: ThirdPartyDataPackTransactionCommandConfirmation
}

export interface ThirdPartyDataPackTransactionCommandPreflightCheck {
  readonly id: ThirdPartyDataPackTransactionCommandPreflightCheckId
  readonly status: 'satisfied' | 'skipped' | 'blocked'
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionCommandPreflightStage {
  readonly id: ThirdPartyDataPackTransactionCommandPreflightStageId
  readonly status: 'satisfied' | 'deferred' | 'skipped' | 'blocked'
  readonly requirementIds: readonly ThirdPartyDataPackTransactionCommandPreflightRequirementId[]
  readonly commitAdapterIds: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId[]
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionCommandPreflightRequirement {
  readonly id: ThirdPartyDataPackTransactionCommandPreflightRequirementId
  readonly status: 'required'
  readonly reason: string
}

export interface ThirdPartyDataPackTransactionCommandSafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

export interface ThirdPartyDataPackTransactionCommandPreflightEffectSummary {
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
  readonly commandDispatched: false
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

export interface ThirdPartyDataPackTransactionCommandPreflightResult {
  readonly status: ThirdPartyDataPackTransactionCommandPreflightStatus
  readonly readModelStatus: ThirdPartyDataPackModManagementReadModel['status']
  readonly runtimePublicationCommitAdapterStatus: ThirdPartyDataPackRuntimePublicationCommitAdapterResult['status']
  readonly reason: string
  readonly requestedCommandId?: ThirdPartyDataPackModManagementCommandId
  readonly targetPackageId?: PackageId
  readonly diagnostics: readonly ThirdPartyDataPackTransactionCommandSafeDiagnostic[]
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly registryCount: number
  readonly entryCount: number
  readonly packageCount: number
  readonly transactionCommandPreflight: 'deferred'
  readonly readOnly: true
  readonly commandDispatchAllowed: false
  readonly commitAllowed: false
  readonly writeAllowed: false
  readonly runtimeEnablementAllowed: false
  readonly uiMountAllowed: false
  readonly ipcAllowed: false
  readonly preflightChecks: readonly ThirdPartyDataPackTransactionCommandPreflightCheck[]
  readonly stages: readonly ThirdPartyDataPackTransactionCommandPreflightStage[]
  readonly requirements: readonly ThirdPartyDataPackTransactionCommandPreflightRequirement[]
  readonly effects: ThirdPartyDataPackTransactionCommandPreflightEffectSummary
}

export interface BuildThirdPartyDataPackTransactionCommandPreflightOptions {
  readonly readModel: ThirdPartyDataPackModManagementReadModel
  readonly runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
  readonly request?: ThirdPartyDataPackTransactionCommandRequest
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

const createEffectSummary = (): ThirdPartyDataPackTransactionCommandPreflightEffectSummary => ({
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
  commandDispatched: false,
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

const safeDiagnostic = (diagnostic: object): ThirdPartyDataPackTransactionCommandSafeDiagnostic => {
  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  const severity = readOwnDataField(diagnostic, 'severity')
  const recovery = readOwnDataField(diagnostic, 'recovery')
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readOwnStringField(diagnostic, 'stage') ?? 'third-party.transaction-command-preflight.diagnostic-copy',
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? `mods.error.${code.toLowerCase().replace(/-/g, '.')}`,
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined,
    recovery: diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)
      ? recovery as ModDiagnosticRecovery
      : 'none'
  })
}

const safeDiagnostics = (
  diagnostics: readonly unknown[]
): readonly ThirdPartyDataPackTransactionCommandSafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return Object.freeze([])
  const length = readArrayLength(diagnostics)
  if (length === undefined) return Object.freeze([])

  const result: ThirdPartyDataPackTransactionCommandSafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      continue
    }
    if (
      descriptor?.enumerable === true
      && 'value' in descriptor
      && descriptor.value !== null
      && typeof descriptor.value === 'object'
    ) {
      result.push(safeDiagnostic(descriptor.value))
    }
  }
  return Object.freeze(result)
}

const commandDiagnostic = (
  stage: string,
  reason: string,
  packageId?: PackageId
): ThirdPartyDataPackTransactionCommandSafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: reason.length > 0 ? 'retry' : 'none'
})

const diagnosticsForBlockedChecks = (
  checks: readonly ThirdPartyDataPackTransactionCommandPreflightCheck[],
  packageId?: PackageId
): readonly ThirdPartyDataPackTransactionCommandSafeDiagnostic[] => Object.freeze(checks
  .filter(currentCheck => currentCheck.status === 'blocked')
  .map(currentCheck => commandDiagnostic(
    `third-party.transaction-command-preflight.checks.${currentCheck.id}`,
    currentCheck.reason,
    packageId
  )))

const everyOwnDataValueFalse = (value: object): boolean => {
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(value)
  } catch {
    return false
  }
  return keys.every(key => {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, key)
    } catch {
      return false
    }
    return descriptor?.enumerable !== true || ('value' in descriptor && descriptor.value === false)
  })
}

const readRequestCommandId = (
  request: ThirdPartyDataPackTransactionCommandRequest | undefined
): ThirdPartyDataPackModManagementCommandId | undefined => {
  if (request === undefined || request === null || typeof request !== 'object') return undefined
  const commandId = readOwnStringField(request, 'commandId')
  return commandIds.includes(commandId as ThirdPartyDataPackModManagementCommandId)
    ? commandId as ThirdPartyDataPackModManagementCommandId
    : undefined
}

const readRequestPackageId = (
  request: ThirdPartyDataPackTransactionCommandRequest | undefined
): PackageId | undefined => {
  if (request === undefined || request === null || typeof request !== 'object') return undefined
  return readOwnStringField(request, 'packageId') as PackageId | undefined
}

const readConfirmation = (
  request: ThirdPartyDataPackTransactionCommandRequest | undefined
): ThirdPartyDataPackTransactionCommandConfirmation | undefined => {
  if (request === undefined || request === null || typeof request !== 'object') return undefined
  const confirmation = readOwnDataField(request, 'confirmation')
  return confirmation !== null && typeof confirmation === 'object'
    ? confirmation as ThirdPartyDataPackTransactionCommandConfirmation
    : undefined
}

const confirmationMatches = (
  request: ThirdPartyDataPackTransactionCommandRequest | undefined,
  commandId: ThirdPartyDataPackModManagementCommandId | undefined,
  packageId: PackageId | undefined
): boolean => {
  const confirmation = readConfirmation(request)
  if (confirmation === undefined || commandId === undefined) return false
  const confirmed = readOwnDataField(confirmation, 'confirmed')
  const confirmedCommandId = readOwnStringField(confirmation, 'commandId')
  const confirmedPackageId = readOwnStringField(confirmation, 'packageId')
  return confirmed === true
    && confirmedCommandId === commandId
    && (packageId === undefined || confirmedPackageId === packageId)
}

const findCommandState = (
  readModel: ThirdPartyDataPackModManagementReadModel,
  commandId: ThirdPartyDataPackModManagementCommandId | undefined
): object | undefined => {
  if (commandId === undefined) return undefined
  const commandStates = readModel.commandStates
  const length = readArrayLength(commandStates)
  if (length === undefined) return undefined

  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(commandStates, String(index))
    } catch {
      continue
    }
    const value = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (value !== undefined && value !== null && typeof value === 'object' && readOwnStringField(value, 'id') === commandId) {
      return value
    }
  }
  return undefined
}

const commandStillDisabled = (
  readModel: ThirdPartyDataPackModManagementReadModel,
  commandId: ThirdPartyDataPackModManagementCommandId | undefined
): boolean => {
  const commandState = findCommandState(readModel, commandId)
  return commandState !== undefined
    && readOwnStringField(commandState, 'status') === 'disabled'
    && readOwnDataField(commandState, 'requiresExplicitConfirmation') === true
}

const packageIsKnown = (
  readModel: ThirdPartyDataPackModManagementReadModel,
  packageId: PackageId | undefined
): boolean => {
  if (packageId === undefined) return true
  const packageRows = readModel.packageRows
  const length = readArrayLength(packageRows)
  if (length === undefined) return false

  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(packageRows, String(index))
    } catch {
      continue
    }
    const value = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (
      value !== undefined
      && value !== null
      && typeof value === 'object'
      && readOwnStringField(value, 'packageId') === packageId
      && readOwnStringField(value, 'status') === 'selected'
    ) {
      return true
    }
  }
  return false
}

const packageIdsByStatus = (
  packageRows: ThirdPartyDataPackModManagementReadModel['packageRows'],
  status: 'selected' | 'blocked'
): readonly PackageId[] => {
  const length = readArrayLength(packageRows)
  if (length === undefined) return Object.freeze([])

  const result: PackageId[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(packageRows, String(index))
    } catch {
      continue
    }
    const value = descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
    if (
      value !== undefined
      && value !== null
      && typeof value === 'object'
      && readOwnStringField(value, 'status') === status
    ) {
      const packageId = readOwnStringField(value, 'packageId')
      if (packageId !== undefined) result.push(packageId as PackageId)
    }
  }

  return Object.freeze(result)
}

const commandEffectsIntact = (
  readModel: ThirdPartyDataPackModManagementReadModel,
  runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult
): boolean => readModel.commandDispatchAllowed === false
  && readModel.writeAllowed === false
  && readModel.runtimeEnablementAllowed === false
  && readModel.uiMountAllowed === false
  && readModel.ipcAllowed === false
  && runtimePublicationCommitAdapter.commitAllowed === false
  && runtimePublicationCommitAdapter.publicationAllowed === false
  && runtimePublicationCommitAdapter.writeAllowed === false
  && runtimePublicationCommitAdapter.liveRegistryMutable === false
  && runtimePublicationCommitAdapter.rollbackExecutionAllowed === false
  && everyOwnDataValueFalse(readModel.effects)
  && everyOwnDataValueFalse(runtimePublicationCommitAdapter.effects)

const check = (
  id: ThirdPartyDataPackTransactionCommandPreflightCheckId,
  status: ThirdPartyDataPackTransactionCommandPreflightCheck['status'],
  reason: string
): ThirdPartyDataPackTransactionCommandPreflightCheck => Object.freeze({ id, status, reason })

const skippedChecks = (
  reason: string
): readonly ThirdPartyDataPackTransactionCommandPreflightCheck[] => Object.freeze([
  'read-model-ready',
  'runtime-commit-adapter-deferred',
  'candidate-identity-consistent',
  'lockfile-hash-consistent',
  'requested-command-known',
  'target-package-known',
  'read-model-command-still-disabled',
  'explicit-confirmation-captured',
  'no-command-effects-intact'
].map(id => check(id as ThirdPartyDataPackTransactionCommandPreflightCheckId, 'skipped', reason)))

const buildPreflightChecks = (
  readModel: ThirdPartyDataPackModManagementReadModel,
  runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult,
  request: ThirdPartyDataPackTransactionCommandRequest | undefined,
  commandId: ThirdPartyDataPackModManagementCommandId | undefined,
  packageId: PackageId | undefined
): readonly ThirdPartyDataPackTransactionCommandPreflightCheck[] => Object.freeze([
  check(
    'read-model-ready',
    readModel.status === 'ready' ? 'satisfied' : 'blocked',
    'The mod management read model must be ready before a transaction command can be inspected.'
  ),
  check(
    'runtime-commit-adapter-deferred',
    runtimePublicationCommitAdapter.status === 'deferred' ? 'satisfied' : 'blocked',
    'Runtime publication commit adapter must remain deferred while command dispatch is only preflighted.'
  ),
  check(
    'candidate-identity-consistent',
    readModel.identity.candidate?.candidateHash !== undefined
      && readModel.identity.candidate.candidateHash === runtimePublicationCommitAdapter.candidateIdentity?.candidateHash
      ? 'satisfied'
      : 'blocked',
    'The read model and runtime commit adapter must describe the same candidate hash.'
  ),
  check(
    'lockfile-hash-consistent',
    readModel.identity.lockfileHash !== undefined
      && readModel.identity.lockfileHash === runtimePublicationCommitAdapter.lockfileHash
      ? 'satisfied'
      : 'blocked',
    'The read model and runtime commit adapter must describe the same lockfile hash.'
  ),
  check(
    'requested-command-known',
    commandId !== undefined ? 'satisfied' : 'blocked',
    'The requested command must be one of install, enable, disable, upgrade or uninstall.'
  ),
  check(
    'target-package-known',
    packageIsKnown(readModel, packageId) ? 'satisfied' : 'blocked',
    'A targeted command must refer to a known package row in the read model.'
  ),
  check(
    'read-model-command-still-disabled',
    commandStillDisabled(readModel, commandId) ? 'satisfied' : 'blocked',
    'The read model command must still be disabled and require explicit confirmation; this preflight must not enable UI dispatch.'
  ),
  check(
    'explicit-confirmation-captured',
    confirmationMatches(request, commandId, packageId) ? 'satisfied' : 'blocked',
    'A matching explicit confirmation token is required before the future dispatcher can be called.'
  ),
  check(
    'no-command-effects-intact',
    commandEffectsIntact(readModel, runtimePublicationCommitAdapter) ? 'satisfied' : 'blocked',
    'Read model and commit adapter inputs must still expose only false UI, IPC, runtime, write and rollback effects.'
  )
])

const requirement = (
  id: ThirdPartyDataPackTransactionCommandPreflightRequirementId,
  reason: string
): ThirdPartyDataPackTransactionCommandPreflightRequirement => Object.freeze({
  id,
  status: 'required',
  reason
})

const requirements = (): readonly ThirdPartyDataPackTransactionCommandPreflightRequirement[] =>
  Object.freeze([
    requirement(
      'explicit-command-request',
      'Commands must enter the transaction path as an explicit, typed request instead of a direct UI or IPC side effect.'
    ),
    requirement(
      'explicit-confirmation-token',
      'A matching user confirmation token must be captured before any dispatcher implementation can call commit logic.'
    ),
    requirement(
      'transaction-command-dispatcher',
      'A future dispatcher must translate command intent into transaction preflight and commit-adapter calls without direct writes.'
    ),
    requirement(
      'atomic-runtime-publication-commit-adapter',
      'The dispatcher must hand off to the atomic runtime publication commit adapter rather than mutating live registries.'
    ),
    requirement(
      'rollback-recovery-handoff',
      'Any failed command must settle through rollback recovery before startup, saves or enabled-state views can proceed.'
    ),
    requirement(
      'path-free-command-diagnostics',
      'Command diagnostics must remain path-free and must not expose candidate RegistrySet, host paths or private package contents.'
    )
  ])

const stage = (
  id: ThirdPartyDataPackTransactionCommandPreflightStageId,
  status: ThirdPartyDataPackTransactionCommandPreflightStage['status'],
  requirementIds: readonly ThirdPartyDataPackTransactionCommandPreflightRequirementId[],
  commitAdapterIds: readonly ThirdPartyDataPackRuntimePublicationCommitAdapterRequirementId[],
  reason: string
): ThirdPartyDataPackTransactionCommandPreflightStage => Object.freeze({
  id,
  status,
  requirementIds: Object.freeze([...requirementIds]),
  commitAdapterIds: Object.freeze([...commitAdapterIds]),
  reason
})

const deferredStages = (): readonly ThirdPartyDataPackTransactionCommandPreflightStage[] => Object.freeze([
  stage(
    'command-preflight-inspection',
    'satisfied',
    ['explicit-command-request'],
    [],
    'Read model, command intent and commit-adapter summaries are consistent enough to inspect dispatcher requirements.'
  ),
  stage(
    'explicit-user-confirmation',
    'satisfied',
    ['explicit-confirmation-token'],
    [],
    'A matching confirmation token was captured for preflight inspection only.'
  ),
  stage(
    'transaction-command-dispatcher',
    'deferred',
    ['transaction-command-dispatcher'],
    ['transaction-log-writer', 'settings-lockfile-commit-adapter'],
    'The actual command dispatcher remains deferred and must not write package, settings or lockfile state in this slice.'
  ),
  stage(
    'runtime-commit-handoff',
    'deferred',
    ['atomic-runtime-publication-commit-adapter', 'rollback-recovery-handoff'],
    ['atomic-runtime-publication-commit-adapter', 'rollback-recovery-orchestrator'],
    'Runtime publication commit and rollback handoff stay inspect-only until the atomic adapter is implemented separately.'
  ),
  stage(
    'post-command-diagnostics',
    'deferred',
    ['path-free-command-diagnostics'],
    ['post-commit-verification-adapter'],
    'Only redacted command diagnostics may be exposed after future post-commit or rollback verification.'
  )
])

const terminalStages = (
  status: 'skipped' | 'blocked',
  reason: string
): readonly ThirdPartyDataPackTransactionCommandPreflightStage[] => Object.freeze([
  'command-preflight-inspection',
  'explicit-user-confirmation',
  'transaction-command-dispatcher',
  'runtime-commit-handoff',
  'post-command-diagnostics'
].map(id => stage(id as ThirdPartyDataPackTransactionCommandPreflightStageId, status, [], [], reason)))

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

const baseResult = (
  status: ThirdPartyDataPackTransactionCommandPreflightStatus,
  reason: string,
  readModel: ThirdPartyDataPackModManagementReadModel,
  runtimePublicationCommitAdapter: ThirdPartyDataPackRuntimePublicationCommitAdapterResult,
  commandId: ThirdPartyDataPackModManagementCommandId | undefined,
  packageId: PackageId | undefined,
  preflightChecks: readonly ThirdPartyDataPackTransactionCommandPreflightCheck[],
  diagnostics: readonly ThirdPartyDataPackTransactionCommandSafeDiagnostic[],
  stages: readonly ThirdPartyDataPackTransactionCommandPreflightStage[],
  includeRequirements: boolean
): ThirdPartyDataPackTransactionCommandPreflightResult => deepFreezeObjectGraph({
  status,
  readModelStatus: readModel.status,
  runtimePublicationCommitAdapterStatus: runtimePublicationCommitAdapter.status,
  reason,
  requestedCommandId: commandId,
  targetPackageId: packageId,
  diagnostics,
  selectedPackageIds: packageIdsByStatus(readModel.packageRows, 'selected'),
  blockedPackageIds: packageIdsByStatus(readModel.packageRows, 'blocked'),
  loadOrder: clonePackageIds(runtimePublicationCommitAdapter.loadOrder),
  registryCount: runtimePublicationCommitAdapter.registryCount,
  entryCount: runtimePublicationCommitAdapter.entryCount,
  packageCount: runtimePublicationCommitAdapter.packageCount,
  transactionCommandPreflight: 'deferred',
  readOnly: true,
  commandDispatchAllowed: false,
  commitAllowed: false,
  writeAllowed: false,
  runtimeEnablementAllowed: false,
  uiMountAllowed: false,
  ipcAllowed: false,
  preflightChecks,
  stages,
  requirements: includeRequirements ? requirements() : Object.freeze([]),
  effects: createEffectSummary()
})

export const buildThirdPartyDataPackTransactionCommandPreflight = (
  options: BuildThirdPartyDataPackTransactionCommandPreflightOptions
): ThirdPartyDataPackTransactionCommandPreflightResult => {
  const readModel = options.readModel
  const runtimePublicationCommitAdapter = options.runtimePublicationCommitAdapter
  const commandId = readRequestCommandId(options.request)
  const targetPackageId = readRequestPackageId(options.request)

  if (
    options.request === undefined
    || readModel.status === 'empty'
    || runtimePublicationCommitAdapter.status === 'skipped'
  ) {
    const reason = options.request === undefined
      ? 'no transaction command was requested'
      : 'no selected third-party data packs'
    return baseResult(
      'skipped',
      reason,
      readModel,
      runtimePublicationCommitAdapter,
      commandId,
      targetPackageId,
      skippedChecks(reason),
      [],
      terminalStages('skipped', reason),
      false
    )
  }

  if (readModel.status === 'blocked' || runtimePublicationCommitAdapter.status === 'blocked') {
    const reason = readModel.status === 'blocked'
      ? readModel.reason
      : runtimePublicationCommitAdapter.reason
    return baseResult(
      'blocked',
      reason,
      readModel,
      runtimePublicationCommitAdapter,
      commandId,
      targetPackageId,
      skippedChecks(reason),
      [
        ...safeDiagnostics(readModel.diagnostics),
        ...safeDiagnostics(runtimePublicationCommitAdapter.diagnostics)
      ],
      terminalStages('blocked', reason),
      false
    )
  }

  const preflightChecks = buildPreflightChecks(
    readModel,
    runtimePublicationCommitAdapter,
    options.request,
    commandId,
    targetPackageId
  )
  const blockedDiagnostics = diagnosticsForBlockedChecks(preflightChecks, targetPackageId)
  if (blockedDiagnostics.length > 0) {
    return baseResult(
      'blocked',
      'transaction command preflight inputs are inconsistent',
      readModel,
      runtimePublicationCommitAdapter,
      commandId,
      targetPackageId,
      preflightChecks,
      [
        ...safeDiagnostics(readModel.diagnostics),
        ...safeDiagnostics(runtimePublicationCommitAdapter.diagnostics),
        ...blockedDiagnostics
      ],
      terminalStages('blocked', 'transaction command preflight inputs are inconsistent'),
      false
    )
  }

  return baseResult(
    'deferred',
    'transaction command preflight is inspect-only until command dispatcher, atomic commit adapter and rollback handoff are implemented',
    readModel,
    runtimePublicationCommitAdapter,
    commandId,
    targetPackageId,
    preflightChecks,
    [
      ...safeDiagnostics(readModel.diagnostics),
      ...safeDiagnostics(runtimePublicationCommitAdapter.diagnostics)
    ],
    deferredStages(),
    true
  )
}
