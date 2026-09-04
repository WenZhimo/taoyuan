import { isPackageId, type PackageId } from './ids'
import type {
  ThirdPartyDataPackUninstallPersistentRecord,
  ThirdPartyDataPackUninstallStartupPersistentStateSnapshot
} from './thirdPartyDataPackUninstallTransaction'

type Awaitable<T> = T | Promise<T>

export const thirdPartyDataPackElectronUninstallCommandIpcChannel =
  'third-party-data-pack-uninstall-command'

export interface ThirdPartyDataPackElectronUninstallCommandEnvelope {
  readonly requestedCommandId: 'uninstall'
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly []
  readonly blockedPackageIds: readonly []
  readonly loadOrder: readonly []
  readonly packageFilesRemoved: true
  readonly record: ThirdPartyDataPackUninstallPersistentRecord
  readonly startupSnapshot: ThirdPartyDataPackUninstallStartupPersistentStateSnapshot
}

export interface ThirdPartyDataPackElectronUninstallCommandResult {
  readonly status: 'written' | 'blocked'
  readonly requestedCommandId: 'uninstall'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly packageFilesRemoved: boolean
  readonly settingsWritten: boolean
  readonly lockfileWritten: boolean
  readonly startupStateWritten: boolean
  readonly diagnostics: readonly ThirdPartyDataPackElectronUninstallCommandDiagnostic[]
}

export interface ThirdPartyDataPackElectronUninstallCommandDiagnostic {
  readonly code: 'LIFECYCLE-TRANSACTION-001'
  readonly ruleId: 'LIFECYCLE-TRANSACTION-001'
  readonly severity: 'error'
  readonly stage: string
  readonly messageKey: 'mods.error.lifecycle.transaction.001'
  readonly packageId?: PackageId
  readonly recovery: 'retry'
}

export interface ThirdPartyDataPackElectronUninstallCommandBridge {
  readonly invoke: (
    channel: typeof thirdPartyDataPackElectronUninstallCommandIpcChannel,
    envelope: ThirdPartyDataPackElectronUninstallCommandEnvelope
  ) => Awaitable<unknown>
}

export interface CreateThirdPartyDataPackElectronUninstallCommandMainHandlerOptions {
  readonly writeUninstalledState: (
    envelope: ThirdPartyDataPackElectronUninstallCommandEnvelope
  ) => Awaitable<{
    readonly settingsWritten: true
    readonly lockfileWritten: true
    readonly startupStateWritten: true
    readonly packageFilesRemoved: true
  }>
}

const hashPattern = /^sha256:[0-9a-f]{64}$/

const readOwnDataField = (value: unknown, fieldName: string): unknown => {
  if (value === null || typeof value !== 'object') return undefined
  try {
    const descriptor = Reflect.getOwnPropertyDescriptor(value, fieldName)
    return descriptor?.enumerable === true && 'value' in descriptor ? descriptor.value : undefined
  } catch {
    return undefined
  }
}

const readOwnStringField = (value: unknown, fieldName: string): string | undefined => {
  const field = readOwnDataField(value, fieldName)
  return typeof field === 'string' ? field : undefined
}

const packageIdList = (value: unknown): readonly PackageId[] | undefined => {
  if (!Array.isArray(value)) return undefined
  if (value.some(packageId => !isPackageId(packageId))) return undefined
  return Object.freeze([...value]) as readonly PackageId[]
}

const diagnostic = (stage: string, packageId?: PackageId): ThirdPartyDataPackElectronUninstallCommandDiagnostic =>
  Object.freeze({
    code: 'LIFECYCLE-TRANSACTION-001' as const,
    ruleId: 'LIFECYCLE-TRANSACTION-001' as const,
    severity: 'error' as const,
    stage,
    messageKey: 'mods.error.lifecycle.transaction.001' as const,
    ...(packageId === undefined ? {} : { packageId }),
    recovery: 'retry' as const
  })

const blockedResult = (
  targetPackageId?: PackageId,
  stage = 'third-party.electron-uninstall-command.invalid-envelope'
): ThirdPartyDataPackElectronUninstallCommandResult => Object.freeze({
  status: 'blocked' as const,
  requestedCommandId: 'uninstall' as const,
  ...(targetPackageId === undefined ? {} : { targetPackageId }),
  selectedPackageIds: Object.freeze([]),
  blockedPackageIds: Object.freeze([]),
  loadOrder: Object.freeze([]),
  packageFilesRemoved: false,
  settingsWritten: false,
  lockfileWritten: false,
  startupStateWritten: false,
  diagnostics: Object.freeze([diagnostic(stage, targetPackageId)])
})

const isValidUninstallRecord = (
  record: unknown,
  targetPackageId: PackageId
): record is ThirdPartyDataPackUninstallPersistentRecord => {
  if (record === null || typeof record !== 'object') return false
  const lockfileDraft = readOwnDataField(record, 'lockfileDraft')
  if (lockfileDraft === null || typeof lockfileDraft !== 'object') return false
  const packages = readOwnDataField(lockfileDraft, 'packages')
  return readOwnStringField(record, 'recordId') === 'active'
    && readOwnStringField(record, 'requestedCommandId') === 'uninstall'
    && readOwnStringField(record, 'targetPackageId') === targetPackageId
    && packageIdList(readOwnDataField(record, 'selectedPackageIds'))?.length === 0
    && packageIdList(readOwnDataField(record, 'blockedPackageIds'))?.length === 0
    && packageIdList(readOwnDataField(record, 'loadOrder'))?.length === 0
    && hashPattern.test(readOwnStringField(record, 'candidateHash') ?? '')
    && hashPattern.test(readOwnStringField(record, 'lockfileHash') ?? '')
    && readOwnStringField(lockfileDraft, 'lockfileHash') === readOwnStringField(record, 'lockfileHash')
    && Array.isArray(packages)
    && !packages.some(currentPackage =>
      currentPackage !== null
      && typeof currentPackage === 'object'
      && readOwnStringField(currentPackage, 'packageId') === targetPackageId
    )
}

const isValidEnvelope = (value: unknown): value is ThirdPartyDataPackElectronUninstallCommandEnvelope => {
  if (value === null || typeof value !== 'object') return false
  const targetPackageId = readOwnStringField(value, 'targetPackageId')
  const selectedPackageIds = packageIdList(readOwnDataField(value, 'selectedPackageIds'))
  const blockedPackageIds = packageIdList(readOwnDataField(value, 'blockedPackageIds'))
  const loadOrder = packageIdList(readOwnDataField(value, 'loadOrder'))
  const record = readOwnDataField(value, 'record')
  const startupSnapshot = readOwnDataField(value, 'startupSnapshot')
  return readOwnStringField(value, 'requestedCommandId') === 'uninstall'
    && isPackageId(targetPackageId)
    && selectedPackageIds?.length === 0
    && blockedPackageIds?.length === 0
    && loadOrder?.length === 0
    && readOwnDataField(value, 'packageFilesRemoved') === true
    && isValidUninstallRecord(record, targetPackageId)
    && startupSnapshot !== null
    && typeof startupSnapshot === 'object'
    && readOwnStringField(startupSnapshot, 'kind') === 'electron-startup-persistent-state-snapshot'
    && readOwnStringField(startupSnapshot, 'packageId') === targetPackageId
    && hashPattern.test(readOwnStringField(startupSnapshot, 'lockfileHash') ?? '')
}

const writtenResult = (
  envelope: ThirdPartyDataPackElectronUninstallCommandEnvelope
): ThirdPartyDataPackElectronUninstallCommandResult => Object.freeze({
  status: 'written',
  requestedCommandId: 'uninstall',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: Object.freeze([]),
  blockedPackageIds: Object.freeze([]),
  loadOrder: Object.freeze([]),
  packageFilesRemoved: true,
  settingsWritten: true,
  lockfileWritten: true,
  startupStateWritten: true,
  diagnostics: Object.freeze([])
})

export const createThirdPartyDataPackElectronUninstallCommandRendererHost = (
  bridge: ThirdPartyDataPackElectronUninstallCommandBridge
) => Object.freeze({
  uninstall: async(
    envelope: ThirdPartyDataPackElectronUninstallCommandEnvelope
  ): Promise<ThirdPartyDataPackElectronUninstallCommandResult> => {
    const result = await bridge.invoke(thirdPartyDataPackElectronUninstallCommandIpcChannel, envelope)
    if (result !== null && typeof result === 'object' && readOwnStringField(result, 'status') === 'written') {
      return writtenResult(envelope)
    }
    return blockedResult(envelope.targetPackageId, 'third-party.electron-uninstall-command.main-process-blocked')
  }
})

export const createThirdPartyDataPackElectronUninstallCommandMainHandler = (
  options: CreateThirdPartyDataPackElectronUninstallCommandMainHandlerOptions
) => async(value: unknown): Promise<ThirdPartyDataPackElectronUninstallCommandResult> => {
  const targetPackageId = isPackageId(readOwnStringField(value, 'targetPackageId'))
    ? readOwnStringField(value, 'targetPackageId') as PackageId
    : undefined
  if (!isValidEnvelope(value)) return blockedResult(targetPackageId)

  try {
    const writeResult = await options.writeUninstalledState(value)
    if (
      writeResult.settingsWritten !== true
      || writeResult.lockfileWritten !== true
      || writeResult.startupStateWritten !== true
      || writeResult.packageFilesRemoved !== true
    ) {
      return blockedResult(value.targetPackageId, 'third-party.electron-uninstall-command.partial-write')
    }
    return writtenResult(value)
  } catch {
    return blockedResult(value.targetPackageId, 'third-party.electron-uninstall-command.write-failed')
  }
}
