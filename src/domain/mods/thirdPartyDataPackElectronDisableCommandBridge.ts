import { isPackageId, type PackageId } from './ids'
import type {
  ThirdPartyDataPackDisablePersistentRecord,
  ThirdPartyDataPackDisableStartupPersistentStateSnapshot
} from './thirdPartyDataPackDisableTransaction'

type Awaitable<T> = T | Promise<T>

export const thirdPartyDataPackElectronDisableCommandIpcChannel =
  'third-party-data-pack-disable-command'

export interface ThirdPartyDataPackElectronDisableCommandEnvelope {
  readonly requestedCommandId: 'disable'
  readonly targetPackageId: PackageId
  readonly selectedPackageIds: readonly []
  readonly blockedPackageIds: readonly [PackageId]
  readonly loadOrder: readonly []
  readonly packageFilesPreserved: true
  readonly record: ThirdPartyDataPackDisablePersistentRecord
  readonly startupSnapshot: ThirdPartyDataPackDisableStartupPersistentStateSnapshot
}

export interface ThirdPartyDataPackElectronDisableCommandResult {
  readonly status: 'written' | 'blocked'
  readonly requestedCommandId: 'disable'
  readonly targetPackageId?: PackageId
  readonly selectedPackageIds: readonly PackageId[]
  readonly blockedPackageIds: readonly PackageId[]
  readonly loadOrder: readonly PackageId[]
  readonly packageFilesPreserved: boolean
  readonly settingsWritten: boolean
  readonly lockfileWritten: boolean
  readonly startupStateWritten: boolean
  readonly diagnostics: readonly ThirdPartyDataPackElectronDisableCommandDiagnostic[]
}

export interface ThirdPartyDataPackElectronDisableCommandDiagnostic {
  readonly code: 'LIFECYCLE-TRANSACTION-001'
  readonly ruleId: 'LIFECYCLE-TRANSACTION-001'
  readonly severity: 'error'
  readonly stage: string
  readonly messageKey: 'mods.error.lifecycle.transaction.001'
  readonly packageId?: PackageId
  readonly recovery: 'retry'
}

export interface ThirdPartyDataPackElectronDisableCommandBridge {
  readonly invoke: (
    channel: typeof thirdPartyDataPackElectronDisableCommandIpcChannel,
    envelope: ThirdPartyDataPackElectronDisableCommandEnvelope
  ) => Awaitable<unknown>
}

export interface CreateThirdPartyDataPackElectronDisableCommandMainHandlerOptions {
  readonly writeDisabledState: (
    envelope: ThirdPartyDataPackElectronDisableCommandEnvelope
  ) => Awaitable<{
    readonly settingsWritten: true
    readonly lockfileWritten: true
    readonly startupStateWritten: true
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

const diagnostic = (stage: string, packageId?: PackageId): ThirdPartyDataPackElectronDisableCommandDiagnostic =>
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
  stage = 'third-party.electron-disable-command.invalid-envelope'
): ThirdPartyDataPackElectronDisableCommandResult => Object.freeze({
  status: 'blocked' as const,
  requestedCommandId: 'disable' as const,
  ...(targetPackageId === undefined ? {} : { targetPackageId }),
  selectedPackageIds: Object.freeze([]),
  blockedPackageIds: targetPackageId === undefined ? Object.freeze([]) : Object.freeze([targetPackageId]),
  loadOrder: Object.freeze([]),
  packageFilesPreserved: false,
  settingsWritten: false,
  lockfileWritten: false,
  startupStateWritten: false,
  diagnostics: Object.freeze([diagnostic(stage, targetPackageId)])
})

const isValidEnvelope = (value: unknown): value is ThirdPartyDataPackElectronDisableCommandEnvelope => {
  if (value === null || typeof value !== 'object') return false
  const targetPackageId = readOwnStringField(value, 'targetPackageId')
  const selectedPackageIds = packageIdList(readOwnDataField(value, 'selectedPackageIds'))
  const blockedPackageIds = packageIdList(readOwnDataField(value, 'blockedPackageIds'))
  const loadOrder = packageIdList(readOwnDataField(value, 'loadOrder'))
  const record = readOwnDataField(value, 'record')
  const startupSnapshot = readOwnDataField(value, 'startupSnapshot')
  return readOwnStringField(value, 'requestedCommandId') === 'disable'
    && isPackageId(targetPackageId)
    && selectedPackageIds?.length === 0
    && blockedPackageIds?.length === 1
    && blockedPackageIds[0] === targetPackageId
    && loadOrder?.length === 0
    && readOwnDataField(value, 'packageFilesPreserved') === true
    && record !== null
    && typeof record === 'object'
    && startupSnapshot !== null
    && typeof startupSnapshot === 'object'
    && isPackageId(readOwnStringField(record, 'targetPackageId'))
    && readOwnStringField(record, 'requestedCommandId') === 'disable'
    && hashPattern.test(readOwnStringField(record, 'lockfileHash') ?? '')
    && readOwnStringField(startupSnapshot, 'kind') === 'electron-startup-persistent-state-snapshot'
    && isPackageId(readOwnStringField(startupSnapshot, 'packageId'))
    && hashPattern.test(readOwnStringField(startupSnapshot, 'lockfileHash') ?? '')
}

const writtenResult = (
  envelope: ThirdPartyDataPackElectronDisableCommandEnvelope
): ThirdPartyDataPackElectronDisableCommandResult => Object.freeze({
  status: 'written',
  requestedCommandId: 'disable',
  targetPackageId: envelope.targetPackageId,
  selectedPackageIds: Object.freeze([]),
  blockedPackageIds: Object.freeze([envelope.targetPackageId]),
  loadOrder: Object.freeze([]),
  packageFilesPreserved: true,
  settingsWritten: true,
  lockfileWritten: true,
  startupStateWritten: true,
  diagnostics: Object.freeze([])
})

export const createThirdPartyDataPackElectronDisableCommandRendererHost = (
  bridge: ThirdPartyDataPackElectronDisableCommandBridge
) => Object.freeze({
  disable: async(
    envelope: ThirdPartyDataPackElectronDisableCommandEnvelope
  ): Promise<ThirdPartyDataPackElectronDisableCommandResult> => {
    const result = await bridge.invoke(thirdPartyDataPackElectronDisableCommandIpcChannel, envelope)
    if (result !== null && typeof result === 'object' && readOwnStringField(result, 'status') === 'written') {
      return writtenResult(envelope)
    }
    return blockedResult(envelope.targetPackageId, 'third-party.electron-disable-command.main-process-blocked')
  }
})

export const createThirdPartyDataPackElectronDisableCommandMainHandler = (
  options: CreateThirdPartyDataPackElectronDisableCommandMainHandlerOptions
) => async(value: unknown): Promise<ThirdPartyDataPackElectronDisableCommandResult> => {
  const targetPackageId = isPackageId(readOwnStringField(value, 'targetPackageId'))
    ? readOwnStringField(value, 'targetPackageId') as PackageId
    : undefined
  if (!isValidEnvelope(value)) return blockedResult(targetPackageId)

  try {
    const writeResult = await options.writeDisabledState(value)
    if (
      writeResult.settingsWritten !== true
      || writeResult.lockfileWritten !== true
      || writeResult.startupStateWritten !== true
    ) {
      return blockedResult(value.targetPackageId, 'third-party.electron-disable-command.partial-write')
    }
    return writtenResult(value)
  } catch {
    return blockedResult(value.targetPackageId, 'third-party.electron-disable-command.write-failed')
  }
}
