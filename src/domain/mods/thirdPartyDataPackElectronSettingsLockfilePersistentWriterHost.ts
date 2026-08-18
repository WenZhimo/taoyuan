import type { ModDiagnosticRecovery, ModDiagnosticSeverity } from './diagnostics'
import type { Sha256Hash } from './hash'
import type { PackageId } from './ids'
import type { ThirdPartyDataPackLockfileDraft } from './thirdPartyDataPackLockfileDraft'
import type {
  ThirdPartyDataPackModLockStorageAdapter,
  ThirdPartyDataPackModLockStorageReport
} from './thirdPartyDataPackModLockStorage'
import type {
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary,
  ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult
} from './thirdPartyDataPackSettingsLockfilePersistentWriterSource'

type Awaitable<T> = T | Promise<T>

export type ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsStatus =
  | 'written'
  | 'blocked'

export interface ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEnvelope {
  readonly requestedCommandId: 'install'
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly candidateHash: Sha256Hash
  readonly lockfileHash: Sha256Hash
}

export interface ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEffectSummary {
  readonly settingsWriterCalled: boolean
  readonly settingsWritten: boolean
  readonly lockfileWritten: false
  readonly packageFilesWritten: false
  readonly packageBackupsWritten: false
  readonly packageFilesRestored: false
  readonly savesWritten: false
  readonly cacheWritten: false
  readonly transactionLogWritten: false
  readonly recoveryLogRead: false
  readonly recoveryLogReplayed: false
  readonly rollbackExecuted: false
  readonly diagnosticsWritten: false
}

export interface ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsResult {
  readonly status: ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsStatus
  readonly requestedCommandId?: 'install'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds?: readonly PackageId[]
  readonly blockedPackageIds?: readonly PackageId[]
  readonly loadOrder?: readonly PackageId[]
  readonly candidateHash?: Sha256Hash
  readonly lockfileHash?: Sha256Hash
  readonly diagnostics?: readonly unknown[]
  readonly effects: ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEffectSummary
}

export interface CreateThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostOptions {
  readonly modLockStorage: ThirdPartyDataPackModLockStorageAdapter
  readonly readLockfileDraft: () => Awaitable<ThirdPartyDataPackLockfileDraft>
  readonly writeSettings: (
    envelope: ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEnvelope
  ) => Awaitable<ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsResult>
}

interface SafeDiagnostic {
  readonly code: string
  readonly ruleId: string
  readonly severity: ModDiagnosticSeverity
  readonly stage: string
  readonly messageKey: string
  readonly packageId?: PackageId
  readonly recovery: ModDiagnosticRecovery
}

const diagnosticSeverities = new Set<ModDiagnosticSeverity>(['info', 'warning', 'error', 'fatal'])
const diagnosticRecoveries = new Set<ModDiagnosticRecovery>([
  'none',
  'retry',
  'disable-package',
  'remove-package',
  'safe-mode',
  'restore-backup'
])

const forbiddenSettingsWriterResultFields = [
  'settingsPath',
  'settingsStorage',
  'settingsWriter',
  'modLockStorage',
  'programDirectoryPath',
  'userDataPath',
  'absolutePath',
  'resolvedPath',
  'path',
  'filePath',
  'electronHost',
  'webHost',
  'androidHost',
  'launcherApp',
  'gameApp',
  'pinia',
  'router'
] as const

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

const readOwnDataField = (value: unknown, fieldName: string): unknown => {
  if (value === undefined || value === null || typeof value !== 'object') return undefined
  let descriptor: PropertyDescriptor | undefined
  try {
    descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
  } catch {
    return undefined
  }
  return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
}

const readOwnStringField = (value: unknown, fieldName: string): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
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
  return result
}

const clonePackageIds = (value: unknown): PackageId[] =>
  cloneStringList(value) as PackageId[]

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const hasForbiddenField = (value: unknown, fieldNames: readonly string[]): boolean => {
  if (value === undefined || value === null || typeof value !== 'object') return false
  return fieldNames.some(fieldName => {
    try {
      return Reflect.getOwnPropertyDescriptor(value, fieldName) !== undefined
    } catch {
      return true
    }
  })
}

const safeDiagnostic = (
  diagnostic: unknown,
  fallbackStage: string,
  packageId?: PackageId
): SafeDiagnostic => {
  const code = readOwnStringField(diagnostic, 'code') ?? 'LIFECYCLE-TRANSACTION-001'
  const severity = readOwnStringField(diagnostic, 'severity')
  const recovery = readOwnStringField(diagnostic, 'recovery')
  return Object.freeze({
    code,
    ruleId: readOwnStringField(diagnostic, 'ruleId') ?? code,
    severity: diagnosticSeverities.has(severity as ModDiagnosticSeverity)
      ? severity as ModDiagnosticSeverity
      : 'error',
    stage: readOwnStringField(diagnostic, 'stage') ?? fallbackStage,
    messageKey: readOwnStringField(diagnostic, 'messageKey')
      ?? `mods.error.${code.toLowerCase().replace(/-/g, '.')}`,
    packageId: readOwnStringField(diagnostic, 'packageId') as PackageId | undefined ?? packageId,
    recovery: diagnosticRecoveries.has(recovery as ModDiagnosticRecovery)
      ? recovery as ModDiagnosticRecovery
      : 'retry'
  })
}

const safeDiagnostics = (
  diagnostics: readonly unknown[] | undefined,
  fallbackStage: string,
  packageId?: PackageId
): SafeDiagnostic[] => {
  if (!Array.isArray(diagnostics)) return []
  const length = readArrayLength(diagnostics)
  if (length === undefined) return []

  const result: SafeDiagnostic[] = []
  for (let index = 0; index < length; index += 1) {
    let descriptor: PropertyDescriptor | undefined
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(diagnostics, String(index))
    } catch {
      continue
    }
    if (descriptor?.enumerable === true && 'value' in descriptor) {
      result.push(safeDiagnostic(descriptor.value, fallbackStage, packageId))
    }
  }
  return result
}

const commandDiagnostic = (stage: string, packageId?: PackageId): SafeDiagnostic => Object.freeze({
  code: 'LIFECYCLE-TRANSACTION-001',
  ruleId: 'LIFECYCLE-TRANSACTION-001',
  severity: 'error',
  stage,
  messageKey: 'mods.error.lifecycle.transaction.001',
  packageId,
  recovery: 'retry'
})

const deepFreezeObjectGraph = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
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
    Object.freeze(value)
  }
  return value
}

const hostEffects = (
  written: boolean
): ThirdPartyDataPackSettingsLockfilePersistentWriterHostEffectSummary => Object.freeze({
  settingsLockfilePersistentWriterHostCalled: true,
  settingsLockfilePersistentWriterHostWritten: written,
  transactionCommitted: false,
  runtimePublicationCommitted: false,
  postCommitVerificationExecuted: false,
  uiIpcResponseDelivered: false,
  packageFilesWritten: false,
  packageBackupsWritten: false,
  packageFilesRestored: false,
  lockfileWritten: written,
  lockfileRestored: false,
  settingsWritten: written,
  settingsRestored: false,
  savesWritten: false,
  cacheWritten: false,
  transactionLogWritten: false,
  recoveryLogRead: false,
  recoveryLogReplayed: false,
  rollbackExecuted: false,
  diagnosticsWritten: false
})

const hostResult = (
  envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  status: 'written' | 'blocked',
  diagnostics: readonly SafeDiagnostic[]
): ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult => deepFreezeObjectGraph({
  status,
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: [...envelope.selectedPackageIds],
  blockedPackageIds: [...envelope.blockedPackageIds],
  loadOrder: [...envelope.loadOrder],
  registryCount: envelope.registryCount,
  entryCount: envelope.entryCount,
  packageCount: envelope.packageCount,
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash,
  packageFileStagingHostStatus: envelope.packageFileStagingHostStatus,
  settingsLockfileCommitHostStatus: envelope.settingsLockfileCommitHostStatus,
  modLockWriteProbeStatus: envelope.writeProbeEvidence.modLockWriteProbeStatus,
  transactionLogWriteProbeStatus: envelope.writeProbeEvidence.transactionLogWriteProbeStatus,
  modLockPersistentWriteExecuted: envelope.writeProbeEvidence.modLockPersistentWriteExecuted,
  transactionLogPersistentWriteExecuted: envelope.writeProbeEvidence.transactionLogPersistentWriteExecuted,
  diagnostics: Object.freeze([...diagnostics]),
  effects: hostEffects(status === 'written')
})

const settingsEnvelope = (
  envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope
): ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEnvelope => deepFreezeObjectGraph({
  requestedCommandId: envelope.requestedCommandId,
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: [...envelope.selectedPackageIds],
  blockedPackageIds: [...envelope.blockedPackageIds],
  loadOrder: [...envelope.loadOrder],
  candidateHash: envelope.candidateIdentity.candidateHash,
  lockfileHash: envelope.lockfileHash
})

const draftMatchesEnvelope = (
  envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope,
  draft: ThirdPartyDataPackLockfileDraft
): boolean => draft.lockfileHash === envelope.lockfileHash
  && draft.candidateIdentity.candidateHash === envelope.candidateIdentity.candidateHash
  && draft.registryCount === envelope.registryCount
  && draft.entryCount === envelope.entryCount
  && draft.packages.length === envelope.packageCount
  && arraysEqual(draft.selectedPackageIds, envelope.selectedPackageIds)
  && arraysEqual(draft.loadOrder, envelope.loadOrder)

const settingsEffectsContained = (
  result: ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsResult
): boolean => {
  const effects = readOwnDataField(result, 'effects')
  if (effects === undefined || effects === null || typeof effects !== 'object') return false
  let keys: readonly (string | symbol)[]
  try {
    keys = Reflect.ownKeys(effects)
  } catch {
    return false
  }
  return keys.every(key => {
    if (typeof key !== 'string') return false
    const value = readOwnDataField(effects, key)
    if (key === 'settingsWriterCalled') return value === true
    if (key === 'settingsWritten') return value === true
    return value === false
  })
}

const settingsWriteMatchesEnvelope = (
  envelope: ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsEnvelope,
  result: ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsResult
): boolean => readOwnStringField(result, 'status') === 'written'
  && readOwnStringField(result, 'requestedCommandId') === envelope.requestedCommandId
  && readOwnStringField(result, 'targetPackageId') === envelope.targetPackageId
  && arraysEqual(clonePackageIds(readOwnDataField(result, 'selectedPackageIds')), envelope.selectedPackageIds)
  && arraysEqual(clonePackageIds(readOwnDataField(result, 'blockedPackageIds')), envelope.blockedPackageIds)
  && arraysEqual(clonePackageIds(readOwnDataField(result, 'loadOrder')), envelope.loadOrder)
  && readOwnStringField(result, 'candidateHash') === envelope.candidateHash
  && readOwnStringField(result, 'lockfileHash') === envelope.lockfileHash
  && settingsEffectsContained(result)
  && !hasForbiddenField(result, forbiddenSettingsWriterResultFields)
  && !hasForbiddenField(readOwnDataField(result, 'effects'), forbiddenSettingsWriterResultFields)

const storageInspectContained = (
  report: ThirdPartyDataPackModLockStorageReport
): boolean => report.status === 'ready'
  && report.operation === 'inspect'
  && report.effects.lockfileWritten === false
  && report.effects.settingsWritten === false
  && report.effects.packageFilesWritten === false
  && report.effects.packageBackupsWritten === false
  && report.effects.savesWritten === false
  && report.effects.cacheWritten === false
  && report.effects.transactionLogWritten === false

const storageWriteContained = (
  report: ThirdPartyDataPackModLockStorageReport
): boolean => report.status === 'written'
  && report.operation === 'write'
  && report.effects.lockfileWritten === true
  && report.effects.settingsWritten === false
  && report.effects.packageFilesWritten === false
  && report.effects.packageBackupsWritten === false
  && report.effects.savesWritten === false
  && report.effects.cacheWritten === false
  && report.effects.transactionLogWritten === false

export const createThirdPartyDataPackElectronSettingsLockfilePersistentWriterHost = (
  options: CreateThirdPartyDataPackElectronSettingsLockfilePersistentWriterHostOptions
): ((
  envelope: ThirdPartyDataPackSettingsLockfilePersistentWriterHostEnvelope
) => Promise<ThirdPartyDataPackSettingsLockfilePersistentWriterHostResult>) => async envelope => {
  const packageId = envelope.targetPackageId
  let draft: ThirdPartyDataPackLockfileDraft
  try {
    draft = await options.readLockfileDraft()
  } catch {
    return hostResult(envelope, 'blocked', [
      commandDiagnostic(
        'third-party.electron-settings-lockfile-persistent-writer-host.lockfile-draft-failed',
        packageId
      )
    ])
  }

  if (!draftMatchesEnvelope(envelope, draft)) {
    return hostResult(envelope, 'blocked', [
      commandDiagnostic(
        'third-party.electron-settings-lockfile-persistent-writer-host.lockfile-draft-mismatch',
        packageId
      )
    ])
  }

  let inspectReport: ThirdPartyDataPackModLockStorageReport
  try {
    inspectReport = await options.modLockStorage.inspect()
  } catch {
    return hostResult(envelope, 'blocked', [
      commandDiagnostic(
        'third-party.electron-settings-lockfile-persistent-writer-host.mod-lock-inspect-threw',
        packageId
      )
    ])
  }

  if (!storageInspectContained(inspectReport)) {
    return hostResult(envelope, 'blocked', [
      ...safeDiagnostics(
        inspectReport.diagnostics as readonly unknown[],
        'third-party.electron-settings-lockfile-persistent-writer-host.mod-lock-inspect',
        packageId
      ),
      commandDiagnostic(
        'third-party.electron-settings-lockfile-persistent-writer-host.mod-lock-inspect-blocked',
        packageId
      )
    ])
  }

  const settingsRequest = settingsEnvelope(envelope)
  let settingsResult: ThirdPartyDataPackElectronSettingsLockfilePersistentWriterSettingsResult
  try {
    settingsResult = await options.writeSettings(settingsRequest)
  } catch {
    return hostResult(envelope, 'blocked', [
      commandDiagnostic(
        'third-party.electron-settings-lockfile-persistent-writer-host.settings-write-threw',
        packageId
      )
    ])
  }

  const settingsDiagnostics = safeDiagnostics(
    readOwnDataField(settingsResult, 'diagnostics') as readonly unknown[] | undefined,
    'third-party.electron-settings-lockfile-persistent-writer-host.settings-write',
    packageId
  )
  if (!settingsWriteMatchesEnvelope(settingsRequest, settingsResult)) {
    return hostResult(envelope, 'blocked', [
      ...settingsDiagnostics,
      commandDiagnostic(
        'third-party.electron-settings-lockfile-persistent-writer-host.settings-write-blocked',
        packageId
      )
    ])
  }

  let storageWriteReport: ThirdPartyDataPackModLockStorageReport
  try {
    storageWriteReport = (await options.modLockStorage.write(draft)).report
  } catch {
    return hostResult(envelope, 'blocked', [
      ...settingsDiagnostics,
      commandDiagnostic(
        'third-party.electron-settings-lockfile-persistent-writer-host.mod-lock-write-threw',
        packageId
      )
    ])
  }

  const storageDiagnostics = safeDiagnostics(
    storageWriteReport.diagnostics as readonly unknown[],
    'third-party.electron-settings-lockfile-persistent-writer-host.mod-lock-write',
    packageId
  )
  if (!storageWriteContained(storageWriteReport)) {
    return hostResult(envelope, 'blocked', [
      ...settingsDiagnostics,
      ...storageDiagnostics,
      commandDiagnostic(
        'third-party.electron-settings-lockfile-persistent-writer-host.mod-lock-write-blocked',
        packageId
      )
    ])
  }

  return hostResult(envelope, 'written', [
    ...settingsDiagnostics,
    ...storageDiagnostics
  ])
}
