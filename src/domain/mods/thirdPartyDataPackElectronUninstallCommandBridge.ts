import { isPackageId, type PackageId } from './ids'
import type {
  ThirdPartyDataPackUninstallPersistentRecord,
  ThirdPartyDataPackUninstallStartupPersistentStateSnapshot
} from './thirdPartyDataPackUninstallTransaction'
import type {
  ThirdPartyDataPackElectronInstalledStateReadResult
} from './thirdPartyDataPackElectronInstalledStateBridge'
import type { ThirdPartyDataPackLockfileDraft } from './thirdPartyDataPackLockfileDraft'

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
  readonly readCurrentInstalledState?: () =>
    Awaitable<ThirdPartyDataPackElectronInstalledStateReadResult>
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

const packageIdListsMatch = (
  left: readonly PackageId[],
  right: readonly PackageId[]
): boolean =>
  left.length === right.length
  && left.every((packageId, index) => packageId === right[index])

const packageIdsMatchSet = (
  packageIds: readonly PackageId[],
  expectedPackageIds: ReadonlySet<PackageId>
): boolean => packageIds.length === expectedPackageIds.size
  && packageIds.every(packageId => expectedPackageIds.has(packageId))

const collectTransitiveDependencyIds = (
  draft: ThirdPartyDataPackLockfileDraft,
  packageId: PackageId
): Set<PackageId> | null => {
  const packagesById = new Map(
    draft.packages.map(currentPackage => [currentPackage.packageId, currentPackage])
  )
  const result = new Set<PackageId>()
  const pending = [...(packagesById.get(packageId)?.resolvedDependencies ?? [])]
  while (pending.length > 0) {
    const dependencyId = pending.shift()!
    if (result.has(dependencyId)) continue
    const dependencyPackage = packagesById.get(dependencyId)
    if (dependencyPackage === undefined) return null
    result.add(dependencyId)
    pending.push(...dependencyPackage.resolvedDependencies)
  }
  return result
}

const enabledTargetStackMatches = (
  draft: ThirdPartyDataPackLockfileDraft,
  targetPackageId: PackageId
): boolean => {
  if (draft.loadOrder[draft.loadOrder.length - 1] !== targetPackageId) return false
  const dependencyIds = collectTransitiveDependencyIds(draft, targetPackageId)
  if (dependencyIds === null) return false
  const expectedActivePackageIds = new Set<PackageId>([...dependencyIds, targetPackageId])
  return packageIdsMatchSet(draft.selectedPackageIds, expectedActivePackageIds)
    && packageIdsMatchSet(draft.loadOrder, expectedActivePackageIds)
}

const packageRecordsAfterTargetRemovalMatch = (
  currentState: ThirdPartyDataPackElectronInstalledStateReadResult,
  envelope: ThirdPartyDataPackElectronUninstallCommandEnvelope
): boolean => {
  const currentDraft = currentState.record?.lockfileDraft
  if (currentDraft === undefined) return false
  const remainingPackages = currentDraft.packages.filter(
    currentPackage => currentPackage.packageId !== envelope.targetPackageId
  )
  return JSON.stringify(currentDraft.officialIdentity) === JSON.stringify(envelope.record.lockfileDraft.officialIdentity)
    && JSON.stringify(remainingPackages) === JSON.stringify(envelope.record.lockfileDraft.packages)
}

const currentStateMatchesInstalledPackage = (
  currentState: ThirdPartyDataPackElectronInstalledStateReadResult,
  envelope: ThirdPartyDataPackElectronUninstallCommandEnvelope
): boolean => {
  const record = currentState.record
  if (
    currentState.status !== 'ready'
    || currentState.packageFilesPreserved !== true
    || record === null
    || record.targetPackageId !== envelope.targetPackageId
    || record.candidateHash !== record.lockfileDraft.candidateIdentity.candidateHash
    || record.lockfileHash !== record.lockfileDraft.lockfileHash
    || !record.lockfileDraft.packages.some(currentPackage => currentPackage.packageId === envelope.targetPackageId)
    || !packageRecordsAfterTargetRemovalMatch(currentState, envelope)
  ) {
    return false
  }

  if (record.requestedCommandId === 'disable') {
    return record.selectedPackageIds.length === 0
      && record.loadOrder.length === 0
      && record.lockfileDraft.selectedPackageIds.length === 0
      && record.lockfileDraft.loadOrder.length === 0
      && packageIdListsMatch(record.blockedPackageIds, [envelope.targetPackageId])
  }

  if (record.requestedCommandId === 'install' || record.requestedCommandId === 'enable') {
    return packageIdListsMatch(record.blockedPackageIds, [])
      && packageIdListsMatch(record.selectedPackageIds, record.lockfileDraft.selectedPackageIds)
      && packageIdListsMatch(record.loadOrder, record.lockfileDraft.loadOrder)
      && enabledTargetStackMatches(record.lockfileDraft, envelope.targetPackageId)
  }

  return false
}

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
    if (options.readCurrentInstalledState !== undefined) {
      let currentState: ThirdPartyDataPackElectronInstalledStateReadResult
      try {
        currentState = await options.readCurrentInstalledState()
      } catch {
        return blockedResult(value.targetPackageId, 'third-party.electron-uninstall-command.current-state-read')
      }
      if (!currentStateMatchesInstalledPackage(currentState, value)) {
        return blockedResult(value.targetPackageId, 'third-party.electron-uninstall-command.current-state-mismatch')
      }
    }
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
